import logging

from sqlalchemy.ext.asyncio import AsyncSession

from app.agents.state import RevenueLeakageState
from app.graph.revenue_leakage_graph import get_revenue_leakage_graph
from app.models.analysis import AnalysisRun
from app.repositories.analysis_repository import create_analysis_run
from app.repositories.property_repository import update_property_risk
from app.services import embedding_service

logger = logging.getLogger(__name__)


async def run_fraud_analysis(
    db: AsyncSession,
    property_id: int,
    triggered_by: str = "api",
) -> AnalysisRun:
    """Run the full LangGraph fraud detection pipeline for a property.

    Loads property data, executes all agents, persists the AnalysisRun,
    and updates the property's risk_score and risk_level.
    """
    from app.agents.property_validation_agent import property_validation_agent

    # Build initial state with DB session available for property_validation_agent.
    initial_state: RevenueLeakageState = {"property_id": str(property_id)}

    # Run property validation first to load all DB data into state.
    state = await property_validation_agent(initial_state, db=db)

    # If property was not found, return a zeroed analysis run without running graph.
    if not state.get("property_data"):
        return await create_analysis_run(
            db=db,
            property_id=property_id,
            triggered_by=triggered_by,
            risk_score=0.0,
            risk_level="Low",
            evidence_summary=state.get("evidence_summary", "Property not found."),
            officer_notes=state.get("officer_notes", ""),
            recommended_action="Verify property ID exists.",
            revenue_impact_estimate=0.0,
            signals=[],
        )

    # --- Semantic duplicate detection (best-effort) ---
    prop_data = state["property_data"]
    try:
        candidates = await embedding_service.find_similar(property_id, prop_data)
        if candidates:
            prop_data["duplicate_candidates"] = candidates
    except Exception as exc:
        logger.warning("Semantic duplicate search failed for property %s: %s", property_id, exc)

    # Run the remaining agents via LangGraph (excludes property_validation which already ran).
    graph = get_revenue_leakage_graph()
    final_state = await graph.ainvoke(state)

    # Persist results with deduplicated signals.
    seen = set()
    unique_signals = []
    for s in final_state.get("fraud_signals", []):
        key = (s.get("fraud_type"), s.get("evidence"))
        if key not in seen:
            seen.add(key)
            unique_signals.append(s)

    analysis_run = await create_analysis_run(
        db=db,
        property_id=property_id,
        triggered_by=triggered_by,
        risk_score=final_state.get("risk_score", 0.0),
        risk_level=final_state.get("risk_level", "Low"),
        evidence_summary=final_state.get("evidence_summary", ""),
        officer_notes=final_state.get("officer_notes", ""),
        recommended_action=final_state.get("recommended_action", ""),
        revenue_impact_estimate=final_state.get("revenue_impact_estimate", 0.0),
        signals=unique_signals,
    )

    # Update property's current risk score and estimated revenue impact.
    await update_property_risk(
        db,
        property_id=property_id,
        risk_score=final_state.get("risk_score", 0.0),
        risk_level=final_state.get("risk_level", "Low"),
        estimated_revenue_impact=final_state.get("estimated_revenue_impact", 0.0),
    )

    # Re-embed this property so future scans can match against it (best-effort)
    try:
        await embedding_service.ensure_collection()
        await embedding_service.upsert_property(property_id, state["property_data"])
    except Exception as exc:
        logger.warning("Re-embedding property %s failed: %s", property_id, exc)

    # Dispatch notifications (decoupled municipal adapter)
    from app.services.notification_service import dispatch_notifications
    await dispatch_notifications(final_state.get("notifications", []))

    return analysis_run