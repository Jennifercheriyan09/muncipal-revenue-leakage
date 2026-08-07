from fastapi import APIRouter, Depends
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.db.session import get_db

router = APIRouter()


@router.get("/health")
async def health_check(db: AsyncSession = Depends(get_db)) -> dict:
    """Returns service health status including database connectivity.

    Used by Docker healthcheck:
        test: ["CMD-SHELL", "curl -sf http://localhost:8000/api/v1/health || exit 1"]
    """
    db_status = "ok"
    try:
        await db.execute(text("SELECT 1"))
    except Exception:
        db_status = "error"

    return {
        "status": "ok" if db_status == "ok" else "degraded",
        "version": "0.2.0",
        "environment": settings.app_env,
        "database": db_status,
    }
