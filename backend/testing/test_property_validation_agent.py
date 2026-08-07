import asyncio
from app.agents.property_validation_agent import property_validation_agent


async def run_tests():
    print("Running Property Validation Agent Unit Tests...\n")

    # Scenario 1: Missing property ID in state (should populate failure state and exit)
    state_1 = {}
    res_1 = await property_validation_agent(state_1, db=None)
    assert res_1["risk_score"] == 0.0
    assert res_1["risk_level"] == "Low"
    assert "No property ID provided." in res_1["evidence_summary"]
    assert res_1["notifications"] == []
    print("[PASS] Scenario 1: Missing property ID correctly handled.")

    # Scenario 2: Pass-through mode when db is None (should populate missing state keys with default empty values)
    state_2 = {
        "property_id": "123"
        # other data structures are completely absent
    }
    res_2 = await property_validation_agent(state_2, db=None)
    assert res_2["fraud_signals"] == []
    assert isinstance(res_2["property_data"], dict)
    assert isinstance(res_2["tax_records"], list)
    assert isinstance(res_2["payments"], list)
    assert isinstance(res_2["trade_licenses"], list)
    assert isinstance(res_2["building_permissions"], list)
    assert isinstance(res_2["utility_records"], list)
    assert res_2["ward_tax_rate_residential"] == 0.0
    assert res_2["ward_tax_rate_commercial"] == 0.0
    print("[PASS] Scenario 2: Pass-through state defaults verification passed.")

    print("\n[SUCCESS] All Property Validation Agent test cases passed!")


if __name__ == "__main__":
    asyncio.run(run_tests())
