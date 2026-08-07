"""Agents endpoint — triggers the LangGraph revenue leakage pipeline."""

from typing import Any

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.dependencies import get_current_user
from app.db.session import get_db
from app.graph.revenue_leakage_graph import get_revenue_leakage_graph
from app.models.property import Property
from app.models.user import User
from app.services import embedding_service

router = APIRouter(prefix="/agents")


class AgentRunRequest(BaseModel):
    """Optional payload to inject property_data directly for testing.
    In production this would be loaded from the DB by property_id.
    """
    property_data: dict[str, Any] = {}


class DetectedIssue(BaseModel):
    """A single fraud signal in a structured, frontend-ready form."""
    fraud_type: str
    category: str
    title: str
    confidence: float
    severity: str                       # "low" | "medium" | "high"
    evidence: str
    impact_label: str


class AgentRunResponse(BaseModel):
    """Full structured response from the fraud detection pipeline.

    Legacy fields (evidence_summary, officer_notes, recommended_action) are
    kept for backward compatibility with any existing consumers.
    New structured fields let the frontend render the report directly.
    """
    # Core identifiers and scoring
    property_id: str
    risk_score: float
    risk_level: str
    estimated_revenue_impact: float
    revenue_impact_breakdown: list[dict[str, Any]]
    fraud_signals: list[dict[str, Any]]
    notifications: list[dict[str, Any]]

    # --- Structured evidence report (new) ---
    headline: str = Field(description="One-line summary with risk badge and signal count.")
    summary: list[str] = Field(description="One sentence per detected issue with impact label.")
    detected_issues: list[DetectedIssue] = Field(description="Full detail for each fraud signal.")
    evidence: list[str] = Field(description="Deduplicated raw evidence strings from all signals.")
    recommended_actions: list[str] = Field(description="Merged, deduplicated action list.")
    departments_involved: list[str] = Field(description="Municipal units that must act.")
    next_step: str = Field(description="Highest-priority single next action for the officer.")

    # --- Legacy fields (preserved for existing consumers) ---
    evidence_summary: str = Field(description="Bullet-point plain-text version of evidence (legacy).")
    officer_notes: str = Field(description="One-line risk + impact note (legacy).")
    recommended_action: str = Field(description="Single recommended action string (legacy).")
    revenue_impact_estimate: float = Field(description="Total estimated INR impact (legacy alias).")


@router.post(
    "/properties/{property_id}/run",
    response_model=AgentRunResponse,
    summary="Run the full LangGraph fraud detection pipeline for a property",
)
async def run_agent_pipeline(property_id: str, body: AgentRunRequest = AgentRunRequest()):
    """Triggers the parallel LangGraph pipeline for the given property ID.

    Pass optional `property_data` in the request body to inject test data.
    Example property_data fields that trigger fraud signals:
      - declared_area_sq_m + gis_area_sq_m  (area mismatch)
      - declared_usage_type + usage_type     (usage mismatch)
      - is_exempt=true + no exemption_document_id (fake exemption)
      - payments with is_manual_adjustment=true   (payment manipulation)
    """
    try:
        graph = get_revenue_leakage_graph()
        initial_state = {
            "property_id": property_id,
            "property_data": body.property_data,
        }
        result = await graph.ainvoke(initial_state)

        # Deduplicate fraud_signals — the Annotated reducer in LangGraph 1.2.6
        # can accumulate duplicates across parallel super-steps. Scoring is already
        # accurate (dedup happens there too), this cleans up the response payload.
        seen = set()
        unique_signals = []
        for s in result.get("fraud_signals", []):
            key = (s.get("fraud_type"), s.get("evidence"))
            if key not in seen:
                seen.add(key)
                unique_signals.append(s)

        return AgentRunResponse(
            property_id=property_id,
            risk_score=result.get("risk_score", 0.0),
            risk_level=result.get("risk_level", "low"),
            estimated_revenue_impact=result.get("estimated_revenue_impact", 0.0),
            revenue_impact_breakdown=result.get("revenue_impact_breakdown", []),
            fraud_signals=unique_signals,
            notifications=result.get("notifications", []),
            # Structured fields
            headline=result.get("headline", ""),
            summary=result.get("summary", []),
            detected_issues=result.get("detected_issues", []),
            evidence=result.get("evidence", []),
            recommended_actions=result.get("recommended_actions", []),
            departments_involved=result.get("departments_involved", []),
            next_step=result.get("next_step", ""),
            # Legacy fields
            evidence_summary=result.get("evidence_summary", ""),
            officer_notes=result.get("officer_notes", ""),
            recommended_action=result.get("recommended_action", ""),
            revenue_impact_estimate=result.get("revenue_impact_estimate", 0.0),
        )
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))


@router.post("/reindex-embeddings")
async def reindex_embeddings(
    db: AsyncSession = Depends(get_db),
    _current_user: User = Depends(get_current_user),
) -> dict:
    """Embed every existing property into Qdrant for semantic duplicate detection.

    Run once after deploying Phase 5, and any time properties are bulk-imported.
    Best-effort: skips properties that fail to embed.
    """
    await embedding_service.ensure_collection()

    result = await db.execute(select(Property))
    properties = result.scalars().all()

    indexed = 0
    for prop in properties:
        prop_dict = {
            "property_uid": prop.property_uid,
            "owner_name": prop.owner_name,
            "address": prop.address,
            "ward_id": prop.ward_id,
            "usage_type": prop.usage_type,
            "declared_usage_type": prop.declared_usage_type,
        }
        if await embedding_service.upsert_property(prop.id, prop_dict):
            indexed += 1

    return {"total": len(properties), "indexed": indexed}
