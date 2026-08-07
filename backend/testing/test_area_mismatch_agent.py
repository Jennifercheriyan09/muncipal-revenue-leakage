import asyncio
from app.agents.area_mismatch_agent import area_mismatch_agent


async def run_tests():
    print("Running Area Mismatch Agent Unit Tests...\n")

    # Scenario 1: No Mismatch (< 10% deviation)
    state_1 = {
        "property_data": {
            "declared_area_sq_m": 100.0,
            "gis_area_sq_m": 105.0
        }
    }
    result_1 = await area_mismatch_agent(state_1)
    assert result_1 == {}, f"Scenario 1 failed: expected empty dict, got {result_1}"
    print("[PASS] Scenario 1: No mismatch (< 10% deviation) correctly skipped.")

    # Scenario 2: Minor Discrepancy (10% to 25% deviation)
    state_2 = {
        "property_data": {
            "declared_area_sq_m": 100.0,
            "gis_area_sq_m": 115.0
        }
    }
    result_2 = await area_mismatch_agent(state_2)
    assert "fraud_signals" in result_2, "Scenario 2 failed: fraud_signals key missing"
    signal_2 = result_2["fraud_signals"][0]
    assert signal_2["confidence"] == 0.50, f"Expected confidence 0.50, got {signal_2['confidence']}"
    assert "minor discrepancy (10-25%)" in signal_2["evidence"] or "10" in signal_2["evidence"], "Evidence format mismatch"
    print("[PASS] Scenario 2: Minor discrepancy (10-25% deviation) detected with 0.50 confidence.")

    # Scenario 3: Significant Underdeclaration (25% to 50% deviation)
    state_3 = {
        "property_data": {
            "declared_area_sq_m": 100.0,
            "gis_area_sq_m": 140.0
        }
    }
    result_3 = await area_mismatch_agent(state_3)
    signal_3 = result_3["fraud_signals"][0]
    assert signal_3["confidence"] == 0.75, f"Expected confidence 0.75, got {signal_3['confidence']}"
    assert "significant underdeclaration" in signal_3["evidence"], "Evidence format mismatch"
    print("[PASS] Scenario 3: Significant underdeclaration (25-50% deviation) detected with 0.75 confidence.")

    # Scenario 4: Severe Underdeclaration (>= 50% deviation)
    state_4 = {
        "property_data": {
            "declared_area_sq_m": 100.0,
            "gis_area_sq_m": 160.0
        }
    }
    result_4 = await area_mismatch_agent(state_4)
    signal_4 = result_4["fraud_signals"][0]
    assert signal_4["confidence"] == 1.0, f"Expected confidence 1.0, got {signal_4['confidence']}"
    assert "severe underdeclaration" in signal_4["evidence"], "Evidence format mismatch"
    print("[PASS] Scenario 4: Severe underdeclaration (>50% deviation) detected with 1.0 confidence.")

    # Scenario 5: Cross-check with building permission
    state_5 = {
        "property_data": {
            "declared_area_sq_m": 100.0,
            "gis_area_sq_m": 140.0
        },
        "building_permissions": [
            {
                "approved_area_sq_m": 120.0,
                "permission_number": "BP-999"
            }
        ]
    }
    result_5 = await area_mismatch_agent(state_5)
    signal_5 = result_5["fraud_signals"][0]
    assert "Building permission only approved 120.0 sq.m" in signal_5["evidence"], "Missing permission details in evidence"
    assert "BP-999" in signal_5["evidence"], "Missing permit number in evidence"
    print("[PASS] Scenario 5: Cross-check with building permission appended to evidence.")

    # Scenario 6: Missing data
    state_6 = {
        "property_data": {
            "declared_area_sq_m": 0.0,
            "gis_area_sq_m": 120.0
        }
    }
    result_6 = await area_mismatch_agent(state_6)
    assert result_6 == {}, f"Scenario 6 failed: expected empty dict, got {result_6}"
    print("[PASS] Scenario 6: Missing/zero declared area correctly skipped.")

    print("\n[SUCCESS] All Area Mismatch Agent test cases passed!")


if __name__ == "__main__":
    asyncio.run(run_tests())
