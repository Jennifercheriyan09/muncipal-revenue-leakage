from datetime import date, datetime

from pydantic import BaseModel


class TaxRecordCreate(BaseModel):
    property_id: int
    assessment_year: int
    assessed_value: float = 0.0
    tax_demand: float = 0.0
    tax_paid: float = 0.0
    arrears_amount: float = 0.0
    last_payment_date: date | None = None


class TaxRecordRead(BaseModel):
    id: int
    property_id: int
    assessment_year: int
    assessed_value: float
    tax_demand: float
    tax_paid: float
    arrears_amount: float
    last_payment_date: date | None
    created_at: datetime

    model_config = {"from_attributes": True}


class PaymentCreate(BaseModel):
    property_id: int
    amount: float
    payment_date: date
    gateway_reference: str | None = None
    payment_mode: str | None = None
    is_manual_adjustment: bool = False
    adjustment_reason: str | None = None
    received_by_officer_id: int | None = None


class PaymentRead(BaseModel):
    id: int
    property_id: int
    amount: float
    payment_date: date
    gateway_reference: str | None
    payment_mode: str | None
    is_manual_adjustment: bool
    adjustment_reason: str | None
    received_by_officer_id: int | None
    created_at: datetime

    model_config = {"from_attributes": True}


class UtilityRecordCreate(BaseModel):
    property_id: int
    utility_type: str
    bill_month: str
    consumption_units: float | None = None
    amount: float | None = None
    meter_number: str | None = None


class UtilityRecordRead(BaseModel):
    id: int
    property_id: int
    utility_type: str
    bill_month: str
    consumption_units: float | None
    amount: float | None
    meter_number: str | None
    created_at: datetime

    model_config = {"from_attributes": True}


class TradeLicenseCreate(BaseModel):
    property_id: int
    license_number: str
    business_name: str
    business_type: str | None = None
    issue_date: date | None = None
    expiry_date: date | None = None
    is_active: bool = True


class TradeLicenseRead(BaseModel):
    id: int
    property_id: int
    license_number: str
    business_name: str
    business_type: str | None
    issue_date: date | None
    expiry_date: date | None
    is_active: bool
    created_at: datetime

    model_config = {"from_attributes": True}


class BuildingPermissionCreate(BaseModel):
    property_id: int
    permission_number: str
    approved_area_sq_m: float | None = None
    approved_floors: int | None = None
    approved_usage: str | None = None
    approval_date: date | None = None
    status: str = "approved"


class BuildingPermissionRead(BaseModel):
    id: int
    property_id: int
    permission_number: str
    approved_area_sq_m: float | None
    approved_floors: int | None
    approved_usage: str | None
    approval_date: date | None
    status: str
    created_at: datetime

    model_config = {"from_attributes": True}


class MutationRecordCreate(BaseModel):
    property_id: int
    old_owner: str | None = None
    new_owner: str
    mutation_date: date
    mutation_type: str | None = None
    processed_by_officer_id: int | None = None


class MutationRecordRead(BaseModel):
    id: int
    property_id: int
    old_owner: str | None
    new_owner: str
    mutation_date: date
    mutation_type: str | None
    processed_by_officer_id: int | None
    created_at: datetime

    model_config = {"from_attributes": True}
