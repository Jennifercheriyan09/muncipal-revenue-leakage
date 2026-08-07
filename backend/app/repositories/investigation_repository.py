from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models.investigation import CaseStatus, CaseStatusHistory, InvestigationCase
from app.schemas.investigation import CaseKPIs


async def create_case(
    db: AsyncSession, property_id: int, analysis_run_id: int, revenue_impact: float
) -> InvestigationCase:
    case = InvestigationCase(
        property_id=property_id,
        analysis_run_id=analysis_run_id,
        status=CaseStatus.new,
        revenue_impact_estimate=revenue_impact,
    )
    db.add(case)
    await db.flush()

    db.add(
        CaseStatusHistory(
            case_id=case.id,
            old_status=None,
            new_status=CaseStatus.new,
            remark="Case created automatically from fraud analysis.",
        )
    )
    await db.commit()
    return await _load_case(db, case.id)


async def get_case_by_id(db: AsyncSession, case_id: int) -> InvestigationCase | None:
    return await _load_case(db, case_id)


async def list_cases(
    db: AsyncSession,
    limit: int = 20,
    offset: int = 0,
    status: str | None = None,
    ward_id: int | None = None,
    assigned_officer_id: int | None = None,
) -> tuple[list[InvestigationCase], int]:
    from app.models.property import Property

    query = select(InvestigationCase).join(
        Property, InvestigationCase.property_id == Property.id
    )
    count_q = select(func.count()).select_from(InvestigationCase).join(
        Property, InvestigationCase.property_id == Property.id
    )

    if status:
        query = query.where(InvestigationCase.status == status)
        count_q = count_q.where(InvestigationCase.status == status)
    if ward_id:
        query = query.where(Property.ward_id == ward_id)
        count_q = count_q.where(Property.ward_id == ward_id)
    if assigned_officer_id:
        query = query.where(InvestigationCase.assigned_officer_id == assigned_officer_id)
        count_q = count_q.where(InvestigationCase.assigned_officer_id == assigned_officer_id)

    total = (await db.execute(count_q)).scalar_one()
    query = (
        query.options(selectinload(InvestigationCase.status_history))
        .order_by(InvestigationCase.updated_at.desc())
        .limit(limit)
        .offset(offset)
    )
    result = await db.execute(query)
    return list(result.scalars().all()), total


async def transition_status(
    db: AsyncSession,
    case_id: int,
    new_status: CaseStatus,
    remark: str,
    officer_id: int | None = None,
) -> InvestigationCase | None:
    case = await _load_case(db, case_id)
    if case is None:
        return None

    old_status = case.status
    case.status = new_status
    if new_status == CaseStatus.closed:
        case.revenue_recovered = case.revenue_impact_estimate
    db.add(
        CaseStatusHistory(
            case_id=case.id,
            old_status=old_status,
            new_status=new_status,
            officer_id=officer_id,
            remark=remark,
        )
    )
    await db.commit()
    return await _load_case(db, case_id)


async def assign_officer(
    db: AsyncSession, case_id: int, officer_id: int, assigning_officer_id: int | None = None
) -> InvestigationCase | None:
    case = await _load_case(db, case_id)
    if case is None:
        return None

    case.assigned_officer_id = officer_id
    db.add(
        CaseStatusHistory(
            case_id=case.id,
            old_status=case.status,
            new_status=case.status,
            officer_id=assigning_officer_id,
            remark=f"Case assigned to officer ID {officer_id}.",
        )
    )
    await db.commit()
    return await _load_case(db, case_id)


async def get_kpis(db: AsyncSession) -> CaseKPIs:
    total = (await db.execute(select(func.count()).select_from(InvestigationCase))).scalar_one()

    from app.models.analysis import AnalysisRun
    critical_count = (
        await db.execute(
            select(func.count())
            .select_from(InvestigationCase)
            .join(AnalysisRun, InvestigationCase.analysis_run_id == AnalysisRun.id)
            .where(AnalysisRun.risk_level == "critical")
        )
    ).scalar_one()

    high_count = (
        await db.execute(
            select(func.count())
            .select_from(InvestigationCase)
            .join(AnalysisRun, InvestigationCase.analysis_run_id == AnalysisRun.id)
            .where(AnalysisRun.risk_level == "high")
        )
    ).scalar_one()

    revenue_result = await db.execute(
        select(func.sum(InvestigationCase.revenue_impact_estimate)).where(
            InvestigationCase.status != CaseStatus.closed
        )
    )
    total_revenue = float(revenue_result.scalar_one() or 0)

    return CaseKPIs(
        total_cases=total,
        critical_count=critical_count,
        high_count=high_count,
        total_revenue_at_risk=total_revenue,
    )


async def _load_case(db: AsyncSession, case_id: int) -> InvestigationCase | None:
    result = await db.execute(
        select(InvestigationCase)
        .where(InvestigationCase.id == case_id)
        .options(selectinload(InvestigationCase.status_history))
    )
    return result.scalar_one_or_none()