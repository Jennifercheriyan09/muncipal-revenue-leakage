from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.dependencies import get_current_user, require_roles
from app.db.session import get_db
from app.models.user import User, UserRole
from app.repositories.user_repository import create_user, get_user_by_email
from app.schemas.user import UserCreate, UserRead

router = APIRouter()


@router.post("/users", response_model=UserRead, status_code=status.HTTP_201_CREATED)
async def create_officer(
    data: UserCreate,
    db: AsyncSession = Depends(get_db),
    _current_user: User = Depends(require_roles(UserRole.admin)),
) -> UserRead:
    """Create a new user account. Admin only."""
    existing = await get_user_by_email(db, data.email)
    if existing is not None:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="A user with this email already exists",
        )
    user = await create_user(db, data)
    return UserRead.model_validate(user)


@router.get("/users/me", response_model=UserRead)
async def get_me(current_user: User = Depends(get_current_user)) -> UserRead:
    """Return the currently authenticated user's profile."""
    return UserRead.model_validate(current_user)
