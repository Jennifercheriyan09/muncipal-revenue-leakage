from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.dependencies import get_current_user, require_roles
from app.db.session import get_db
from app.models.user import User, UserRole
from app.repositories.ward_repository import create_ward, get_ward_by_code, list_wards
from app.schemas.ward import WardCreate, WardRead

router = APIRouter()


@router.post("/wards", response_model=WardRead, status_code=status.HTTP_201_CREATED)
async def create_ward_record(
    data: WardCreate,
    db: AsyncSession = Depends(get_db),
    _current_user: User = Depends(require_roles(UserRole.admin)),
) -> WardRead:
    """Create a ward. Admin only."""
    existing = await get_ward_by_code(db, data.code)
    if existing is not None:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Ward with code '{data.code}' already exists",
        )
    ward = await create_ward(db, data)
    return WardRead.model_validate(ward)


@router.get("/wards", response_model=list[WardRead])
async def list_ward_records(
    db: AsyncSession = Depends(get_db),
    _current_user: User = Depends(get_current_user),
) -> list[WardRead]:
    """List all wards ordered by code."""
    wards = await list_wards(db)
    return [WardRead.model_validate(w) for w in wards]
