import asyncio
import traceback
from app.db.session import get_db
from app.services.fraud_analysis_service import run_fraud_analysis


async def main():
    async for db in get_db():
        try:
            print("Running run_fraud_analysis for property_id=1...")
            result = await run_fraud_analysis(db=db, property_id=1)
            print("Analysis succeeded!")
            print(f"Risk Score: {result.risk_score}")
            print(f"Risk Level: {result.risk_level}")
        except Exception as e:
            print("Analysis failed with error:")
            print(e)
            traceback.print_exc()
        break


if __name__ == "__main__":
    asyncio.run(main())
