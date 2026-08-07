from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.dependencies import get_current_user
from app.db.session import get_db
from app.models.user import User
from app.repositories.property_repository import get_property_by_id
from app.schemas.analysis import AnalysisRunRead
from app.services.fraud_analysis_service import run_fraud_analysis

router = APIRouter()


@router.post(
    "/fraud/properties/{property_id}/analyze",
    response_model=AnalysisRunRead,
    status_code=status.HTTP_201_CREATED,
)
async def analyze_property(
    property_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> AnalysisRunRead:
    """Run the full fraud detection pipeline for a property.

    Executes all agents, persists the AnalysisRun with FraudSignals,
    and updates the property's risk_score and risk_level.
    """
    prop = await get_property_by_id(db, property_id)
    if prop is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Property not found")

    analysis_run = await run_fraud_analysis(
        db=db,
        property_id=property_id,
        triggered_by=f"officer:{current_user.id}",
    )
    return AnalysisRunRead.model_validate(analysis_run)