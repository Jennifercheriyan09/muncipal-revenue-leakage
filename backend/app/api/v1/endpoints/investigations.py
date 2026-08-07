from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.dependencies import get_current_user, require_roles
from app.db.session import get_db
from app.models.user import User, UserRole
from app.repositories.investigation_repository import (
    assign_officer,
    create_case,
    get_case_by_id,
    get_kpis,
    list_cases,
    transition_status,
)
from app.schemas.common import PaginatedResponse
from app.schemas.investigation import (
    AssignmentRequest,
    CaseKPIs,
    InvestigationCaseCreate,
    InvestigationCaseRead,
    StatusTransitionRequest,
)

router = APIRouter()


@router.post(
    "/investigations/cases",
    response_model=InvestigationCaseRead,
    status_code=status.HTTP_201_CREATED,
)
async def create_investigation_case(
    data: InvestigationCaseCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> InvestigationCaseRead:
    """Open an investigation case linked to an analysis run."""
    from app.repositories.analysis_repository import get_latest_analysis_for_property
    analysis = await get_latest_analysis_for_property(db, data.property_id)
    revenue_impact = analysis.revenue_impact_estimate if analysis else 0.0

    case = await create_case(
        db,
        property_id=data.property_id,
        analysis_run_id=data.analysis_run_id,
        revenue_impact=revenue_impact,
    )
    return InvestigationCaseRead.model_validate(case)


@router.get("/investigations/cases", response_model=PaginatedResponse[InvestigationCaseRead])
async def list_investigation_cases(
    limit: int = Query(default=20, ge=1, le=100),
    offset: int = Query(default=0, ge=0),
    status_filter: str | None = Query(default=None, alias="status"),
    ward_id: int | None = Query(default=None),
    assigned_officer_id: int | None = Query(default=None),
    db: AsyncSession = Depends(get_db),
    _current_user: User = Depends(get_current_user),
) -> PaginatedResponse[InvestigationCaseRead]:
    """List investigation cases with optional filters."""
    cases, total = await list_cases(
        db,
        limit=limit,
        offset=offset,
        status=status_filter,
        ward_id=ward_id,
        assigned_officer_id=assigned_officer_id,
    )
    return PaginatedResponse(
        items=[InvestigationCaseRead.model_validate(c) for c in cases],
        total=total,
        limit=limit,
        offset=offset,
    )


@router.get("/investigations/cases/kpis", response_model=CaseKPIs)
async def get_investigation_kpis(
    db: AsyncSession = Depends(get_db),
    _current_user: User = Depends(get_current_user),
) -> CaseKPIs:
    """Return KPI summary: total cases, critical count, total revenue at risk."""
    return await get_kpis(db)


@router.get("/investigations/cases/{case_id}", response_model=InvestigationCaseRead)
async def get_investigation_case(
    case_id: int,
    db: AsyncSession = Depends(get_db),
    _current_user: User = Depends(get_current_user),
) -> InvestigationCaseRead:
    """Get a single investigation case with full status history."""
    case = await get_case_by_id(db, case_id)
    if case is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Case not found")
    return InvestigationCaseRead.model_validate(case)


@router.patch("/investigations/cases/{case_id}/status", response_model=InvestigationCaseRead)
async def update_case_status(
    case_id: int,
    data: StatusTransitionRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> InvestigationCaseRead:
    """Transition an investigation case to a new status. A remark is required."""
    case = await transition_status(
        db,
        case_id=case_id,
        new_status=data.new_status,
        remark=data.remark,
        officer_id=current_user.id,
    )
    if case is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Case not found")
    return InvestigationCaseRead.model_validate(case)


@router.post("/investigations/cases/{case_id}/assign", response_model=InvestigationCaseRead)
async def assign_case_officer(
    case_id: int,
    data: AssignmentRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_roles(UserRole.admin, UserRole.officer)),
) -> InvestigationCaseRead:
    """Assign an officer to an investigation case."""
    case = await assign_officer(
        db,
        case_id=case_id,
        officer_id=data.officer_id,
        assigning_officer_id=current_user.id,
    )
    if case is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Case not found")
    return InvestigationCaseRead.model_validate(case)