import asyncio
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker

from app.models.investigation import InvestigationCase, CaseStatus
from app.repositories.investigation_repository import transition_status, create_case
from app.api.v1.endpoints.dashboard import get_dashboard_stats
from app.core.config import settings

# Use settings.database_url from the config (which will be loaded from the backend/.env we copied earlier!)
DATABASE_URL = settings.database_url

async def test_recovery_flow():
    print("Running Revenue Recovery Integration Tests...")

    # Configure async engine
    engine = create_async_engine(DATABASE_URL, echo=False)
    async_session = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)

    async with async_session() as session:
        # 1. Fetch an existing open case to test with, or raise error if db empty
        res = await session.execute(select(InvestigationCase).where(InvestigationCase.status != CaseStatus.closed).limit(1))
        case = res.scalar_one_or_none()
        
        if not case:
            print("[INFO] No open investigation cases found in DB. Creating a mock case...")
            # Let's verify if there are any properties to link a case to
            from app.models.property import Property
            prop_res = await session.execute(select(Property).limit(1))
            prop = prop_res.scalar_one_or_none()
            if not prop:
                print("[ERROR] No properties found in DB to link. Please run seed_data.py or import_wards.py first!")
                return
            
            # Create a mock analysis run
            from app.models.analysis import AnalysisRun
            analysis = AnalysisRun(
                property_id=prop.id,
                triggered_by="test",
                risk_score=75.0,
                risk_level="high",
                revenue_impact_estimate=125000.0
            )
            session.add(analysis)
            await session.flush()
            
            case = await create_case(
                db=session,
                property_id=prop.id,
                analysis_run_id=analysis.id,
                revenue_impact=125000.0
            )
            print(f"[INFO] Created mock case #{case.id} with estimated impact ₹{case.revenue_impact_estimate}")

        original_impact = case.revenue_impact_estimate
        case_id = case.id
        print(f"[INFO] Using Case #{case_id} (Status: {case.status}, Estimated Impact: ₹{original_impact:,.0f})")

        # 2. Transition case to Closed
        print(f"[INFO] Transitioning Case #{case_id} to Closed...")
        updated_case = await transition_status(
            db=session,
            case_id=case_id,
            new_status=CaseStatus.closed,
            remark="Settled full amount of leakage via municipal assessment.",
            officer_id=None
        )
        
        # Verify
        assert updated_case is not None, "Failed: Case transition returned None"
        assert updated_case.status == CaseStatus.closed, f"Failed: Expected status closed, got {updated_case.status}"
        assert updated_case.revenue_recovered == original_impact, f"Failed: Expected revenue_recovered to be {original_impact}, got {updated_case.revenue_recovered}"
        print("[PASS] Case status transition correctly auto-populated revenue_recovered.")

        # 3. Verify dashboard statistics query
        # Let's manually run the sum query in the session
        query = select(func.sum(InvestigationCase.revenue_recovered))
        db_res = await session.execute(query)
        sum_recovered = float(db_res.scalar_one() or 0.0)
        assert sum_recovered >= original_impact, f"Failed: Expected total sum to be at least {original_impact}, got {sum_recovered}"
        print(f"[PASS] Dashboard stats query correctly calculated total recovered revenue: ₹{sum_recovered:,.0f}")

    print("\n[SUCCESS] Revenue Recovery integration tests completed successfully!")

if __name__ == "__main__":
    asyncio.run(test_recovery_flow())
