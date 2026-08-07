from datetime import datetime

from pydantic import BaseModel


class PropertyCreate(BaseModel):
    property_uid: str
    owner_name: str
    owner_age: int | None = None
    address: str
    ward_id: int | None = None
    declared_area_sq_m: float | None = None
    gis_area_sq_m: float | None = None
    usage_type: str | None = None
    declared_usage_type: str | None = None
    is_exempt: bool = False
    exemption_type: str | None = None
    exemption_document_id: str | None = None


class PropertyRead(BaseModel):
    id: int
    property_uid: str
    owner_name: str
    owner_age: int | None
    address: str
    ward_id: int | None
    declared_area_sq_m: float | None
    gis_area_sq_m: float | None
    usage_type: str | None
    declared_usage_type: str | None
    is_exempt: bool
    exemption_type: str | None
    exemption_document_id: str | None
    risk_score: float | None
    risk_level: str | None
    estimated_revenue_impact: float | None
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class PropertyUpdate(BaseModel):
    owner_name: str | None = None
    owner_age: int | None = None
    address: str | None = None
    ward_id: int | None = None
    declared_area_sq_m: float | None = None
    gis_area_sq_m: float | None = None
    usage_type: str | None = None
    declared_usage_type: str | None = None
    is_exempt: bool | None = None
    exemption_type: str | None = None
    exemption_document_id: str | None = None
