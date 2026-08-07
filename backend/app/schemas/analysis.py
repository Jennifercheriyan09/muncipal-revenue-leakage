from datetime import datetime

from pydantic import BaseModel


class FraudSignalRead(BaseModel):
    id: int
    fraud_type: str
    score_contribution: float
    evidence: str
    created_at: datetime

    model_config = {"from_attributes": True}


class AnalysisRunRead(BaseModel):
    id: int
    property_id: int
    triggered_by: str
    risk_score: float
    risk_level: str
    evidence_summary: str | None
    officer_notes: str | None
    recommended_action: str | None
    revenue_impact_estimate: float
    fraud_signals: list[FraudSignalRead]
    created_at: datetime

    model_config = {"from_attributes": True}