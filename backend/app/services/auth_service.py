from sqlalchemy.ext.asyncio import AsyncSession

from app.core.security import create_access_token, verify_password
from app.models.user import User
from app.repositories.user_repository import get_user_by_email


async def authenticate_user(db: AsyncSession, email: str, password: str) -> User | None:
    """Returns the User if credentials are valid, otherwise None."""
    user = await get_user_by_email(db, email)
    if user is None:
        return None
    if not user.is_active:
        return None
    if not verify_password(password, user.hashed_password):
        return None
    return user


def create_user_token(user: User) -> str:
    """Creates a JWT access token with the user's ID as the subject."""
    return create_access_token(subject=str(user.id))
