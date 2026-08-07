import operator
from typing import Annotated, Any, TypedDict


class RevenueLeakageState(TypedDict, total=False):
    """Shared state passed between all LangGraph agents in the revenue leakage pipeline.

    Keys are optional (total=False) because each agent populates a subset.
    property_data is always populated by property_validation_agent before others run.

    fraud_signals uses Annotated(operator.add) — REQUIRED by LangGraph for parallel
    fan-in. Each parallel agent must return ONLY its own new signals as a fresh list,
    never the full accumulated state list. The reducer concatenates all branches safely.
    """

    property_id: str
    property_data: dict[str, Any]
    tax_records: list[dict[str, Any]]
    payments: list[dict[str, Any]]
    trade_licenses: list[dict[str, Any]]
    building_permissions: list[dict[str, Any]]
    utility_records: list[dict[str, Any]]
    ward_tax_rate_residential: float
    ward_tax_rate_commercial: float
    fraud_signals: Annotated[list[dict[str, Any]], operator.add]
    risk_score: float
    risk_level: str
    # Revenue impact — populated by revenue_impact_agent after fraud_scoring
    estimated_revenue_impact: float          # total ₹ loss estimate (0 if under investigation)
    revenue_impact_breakdown: list[dict[str, Any]]  # per-signal breakdown with labels

    # --- Legacy evidence fields (preserved for analysis_repository / DB persistence) ---
    evidence_summary: str
    revenue_impact_estimate: float
    recommended_action: str
    officer_notes: str

    # --- New structured evidence fields (produced by evidence_builder, exposed by API) ---
    headline: str
    summary: list[str]
    detected_issues: list[dict[str, Any]]
    evidence: list[str]
    recommended_actions: list[str]
    departments_involved: list[str]
    next_step: str

    notifications: list[dict[str, Any]]