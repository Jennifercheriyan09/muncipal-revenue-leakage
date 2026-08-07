import asyncio
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker

from app.services.fraud_analysis_service import run_fraud_analysis
from app.db.base import Base

# Adjust DB URL to match your .env
DATABASE_URL = "postgresql+asyncpg://user:password@localhost:5432/revenue_db"

async def test_analysis():
    engine = create_async_engine(DATABASE_URL, echo=False)
    async_session = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)
    
    async with async_session() as session:
        # Run analysis for property ID 1
        result = await run_fraud_analysis(db=session, property_id=1)
        
        print(f"Risk Score: {result.risk_score}")
        print(f"Risk Level: {result.risk_level}")
        print(f"Evidence: {result.evidence_summary}")
        print(f"Officer Notes: {result.officer_notes}")
        print(f"Revenue Impact: {result.revenue_impact_estimate}")
        print(f"\nFraud Signals:")
        for signal in result.signals:
            print(f"  - {signal['fraud_type']}: {signal['evidence']} (score: {signal['score']})")

asyncio.run(test_analysis())