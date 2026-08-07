from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models.analysis import AnalysisRun, FraudSignal


async def create_analysis_run(
    db: AsyncSession,
    property_id: int,
    triggered_by: str,
    risk_score: float,
    risk_level: str,
    evidence_summary: str,
    officer_notes: str,
    recommended_action: str,
    revenue_impact_estimate: float,
    signals: list[dict],
) -> AnalysisRun:
    run = AnalysisRun(
        property_id=property_id,
        triggered_by=triggered_by,
        risk_score=risk_score,
        risk_level=risk_level,
        evidence_summary=evidence_summary,
        officer_notes=officer_notes,
        recommended_action=recommended_action,
        revenue_impact_estimate=revenue_impact_estimate,
    )
    db.add(run)
    await db.flush()

    for sig in signals:
        db.add(
            FraudSignal(
                analysis_run_id=run.id,
                fraud_type=sig.get("fraud_type", "Unknown"),
                score_contribution=float(sig.get("score", 0)),
                evidence=sig.get("evidence", ""),
            )
        )

    await db.commit()

    result = await db.execute(
        select(AnalysisRun)
        .where(AnalysisRun.id == run.id)
        .options(selectinload(AnalysisRun.fraud_signals))
    )
    return result.scalar_one()


async def get_latest_analysis_for_property(
    db: AsyncSession, property_id: int
) -> AnalysisRun | None:
    result = await db.execute(
        select(AnalysisRun)
        .where(AnalysisRun.property_id == property_id)
        .options(selectinload(AnalysisRun.fraud_signals))
        .order_by(AnalysisRun.created_at.desc())
        .limit(1)
    )
    return result.scalar_one_or_none()