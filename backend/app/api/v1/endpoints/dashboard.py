from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.dependencies import get_current_user
from app.db.session import get_db
from app.models.investigation import InvestigationCase
from app.models.property import Property
from app.models.user import User

router = APIRouter()


class DashboardStatsResponse(BaseModel):
    total_cases: int
    total_revenue_at_risk: float
    urgent_cases: int
    recovered_revenue: float


@router.get("/dashboard/stats", response_model=DashboardStatsResponse)
async def get_dashboard_stats(
    db: AsyncSession = Depends(get_db),
    _current_user: User = Depends(get_current_user),
) -> DashboardStatsResponse:
    """Aggregates and returns core KPIs for the administrative dashboard overview."""
    # 1. Total suspected cases
    total_cases_query = select(func.count(Property.id))
    total_cases_res = await db.execute(total_cases_query)
    total_cases = total_cases_res.scalar_one()

    # 2. Total revenue at risk (sum of calculated estimated revenue impacts)
    rev_query = select(func.sum(Property.estimated_revenue_impact))
    rev_res = await db.execute(rev_query)
    total_rev = rev_res.scalar_one() or 0.0

    # 3. Urgent cases (count of Critical + High risk properties)
    urgent_query = select(func.count(Property.id)).where(Property.risk_level.in_(["High", "Critical"]))
    urgent_res = await db.execute(urgent_query)
    urgent_cases = urgent_res.scalar_one()

    # 4. Recovered revenue (sum of all closed cases' recovered revenue)
    recovered_query = select(func.sum(InvestigationCase.revenue_recovered))
    recovered_res = await db.execute(recovered_query)
    recovered_revenue = float(recovered_res.scalar_one() or 0.0)
 
    return DashboardStatsResponse(
        total_cases=total_cases,
        total_revenue_at_risk=round(total_rev, 2),
        urgent_cases=urgent_cases,
        recovered_revenue=round(recovered_revenue, 2),
    )
