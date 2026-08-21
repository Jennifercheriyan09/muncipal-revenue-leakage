from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.dependencies import get_current_user
from app.db.session import get_db
from app.models.user import User
from app.repositories.property_repository import (
    create_property,
    get_property_by_id,
    get_property_by_uid,
    list_properties,
)
from app.schemas.common import PaginatedResponse
from app.schemas.property import PropertyCreate, PropertyRead

router = APIRouter()


@router.post("/properties", response_model=PropertyRead, status_code=status.HTTP_201_CREATED)
async def create_property_record(
    data: PropertyCreate,
    db: AsyncSession = Depends(get_db),
    _current_user: User = Depends(get_current_user),
) -> PropertyRead:
    """Create a new property record."""
    existing = await get_property_by_uid(db, data.property_uid)
    if existing is not None:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Property with UID '{data.property_uid}' already exists",
        )
    prop = await create_property(db, data)
    return PropertyRead.model_validate(prop)


@router.get("/properties", response_model=PaginatedResponse[PropertyRead])
async def list_property_records(
    limit: int = Query(default=20, ge=1, le=1000),
    offset: int = Query(default=0, ge=0),
    ward_id: int | None = Query(default=None),
    risk_level: str | None = Query(default=None),
    usage_type: str | None = Query(default=None),
    db: AsyncSession = Depends(get_db),
    _current_user: User = Depends(get_current_user),
) -> PaginatedResponse[PropertyRead]:
    """List properties with optional filters. Results ordered by risk_score descending."""
    props, total = await list_properties(
        db,
        limit=limit,
        offset=offset,
        ward_id=ward_id,
        risk_level=risk_level,
        usage_type=usage_type,
    )
    return PaginatedResponse(
        items=[PropertyRead.model_validate(p) for p in props],
        total=total,
        limit=limit,
        offset=offset,
    )


@router.get("/properties/{property_id}", response_model=PropertyRead)
async def get_property_record(
    property_id: int,
    db: AsyncSession = Depends(get_db),
    _current_user: User = Depends(get_current_user),
) -> PropertyRead:
    """Get a single property by its numeric ID."""
    prop = await get_property_by_id(db, property_id)
    if prop is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Property not found")
    return PropertyRead.model_validate(prop)
