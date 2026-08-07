from datetime import datetime

from pydantic import BaseModel, EmailStr

from app.models.user import UserRole


class UserCreate(BaseModel):
    email: EmailStr
    password: str
    role: UserRole = UserRole.officer
    ward_id: int | None = None


class UserRead(BaseModel):
    id: int
    email: str
    role: UserRole
    ward_id: int | None
    is_active: bool
    created_at: datetime

    model_config = {"from_attributes": True}
