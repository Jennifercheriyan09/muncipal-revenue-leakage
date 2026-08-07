from datetime import datetime

from pydantic import BaseModel, field_validator

from app.models.investigation import CaseStatus


class CaseStatusHistoryRead(BaseModel):
    id: int
    old_status: str | None
    new_status: str
    officer_id: int | None
    remark: str
    changed_at: datetime

    model_config = {"from_attributes": True}


class InvestigationCaseRead(BaseModel):
    id: int
    property_id: int
    analysis_run_id: int
    status: CaseStatus
    assigned_officer_id: int | None
    revenue_impact_estimate: float
    revenue_recovered: float
    created_at: datetime
    updated_at: datetime
    status_history: list[CaseStatusHistoryRead] = []

    model_config = {"from_attributes": True}


class InvestigationCaseCreate(BaseModel):
    property_id: int
    analysis_run_id: int


class StatusTransitionRequest(BaseModel):
    new_status: CaseStatus
    remark: str

    @field_validator("remark")
    @classmethod
    def remark_required(cls, v: str) -> str:
        if not v or not v.strip():
            raise ValueError("A remark is required for every status transition.")
        return v.strip()


class AssignmentRequest(BaseModel):
    officer_id: int


class CaseKPIs(BaseModel):
    total_cases: int
    critical_count: int
    high_count: int
    total_revenue_at_risk: float