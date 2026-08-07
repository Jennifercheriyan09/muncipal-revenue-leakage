from datetime import datetime

from pydantic import BaseModel


class WardCreate(BaseModel):
    name: str
    code: str
    tax_rate_residential: float = 0.0
    tax_rate_commercial: float = 0.0


class WardRead(BaseModel):
    id: int
    name: str
    code: str
    tax_rate_residential: float
    tax_rate_commercial: float
    created_at: datetime

    model_config = {"from_attributes": True}
