import asyncio
from app.agents.usage_verification_agent import usage_verification_agent


async def run_tests():
    print("Running Usage Verification Agent Unit Tests...\n")

    # Scenario 1: No Mismatch (Declared matches observed, no trade licenses)
    state_1 = {
        "property_data": {
            "declared_usage_type": "Residential",
            "usage_type": "Residential"
        },
        "trade_licenses": []
    }
    result_1 = await usage_verification_agent(state_1)
    assert result_1 == {}, f"Scenario 1 failed: expected empty dict, got {result_1}"
    print("[PASS] Scenario 1: Declared and observed usage types match, no trade licenses.")

    # Scenario 2: Direct usage mismatch (e.g. declared residential, observed commercial)
    state_2 = {
        "property_data": {
            "declared_usage_type": "Residential",
            "usage_type": "Commercial"
        }
    }
    result_2 = await usage_verification_agent(state_2)
    assert "fraud_signals" in result_2, "Scenario 2 failed: fraud_signals key missing"
    signal_2 = result_2["fraud_signals"][0]
    assert signal_2["fraud_type"] == "Usage Mismatch"
    assert signal_2["category"] == "usage_mismatch"
    assert signal_2["confidence"] == 1.0, f"Expected confidence 1.0, got {signal_2['confidence']}"
    assert "Declared usage 'residential' does not match observed usage 'commercial'" in signal_2["evidence"]
    print("[PASS] Scenario 2: Direct usage mismatch detected with confidence 1.0.")

    # Scenario 3: Active trade license on residential property
    state_3 = {
        "property_data": {
            "declared_usage_type": "residential",
            "usage_type": "residential"
        },
        "trade_licenses": [
            {
                "is_active": "true",
                "business_name": "Cafe Mocha"
            }
        ]
    }
    result_3 = await usage_verification_agent(state_3)
    assert "fraud_signals" in result_3, "Scenario 3 failed: fraud_signals key missing"
    signal_3 = result_3["fraud_signals"][0]
    assert signal_3["confidence"] == 1.0
    assert "Active trade license(s) found on residentially-declared property: Cafe Mocha" in signal_3["evidence"]
    print("[PASS] Scenario 3: Active trade license on residential property detected.")

    # Scenario 4: Active trade license on missing/empty declared property (matches "")
    state_4 = {
        "property_data": {
            "declared_usage_type": "",
            "usage_type": "residential"
        },
        "trade_licenses": [
            {
                "is_active": 1,
                "business_name": "Tech Corp"
            }
        ]
    }
    result_4 = await usage_verification_agent(state_4)
    assert "fraud_signals" in result_4, "Scenario 4 failed: fraud_signals key missing"
    signal_4 = result_4["fraud_signals"][0]
    assert "Active trade license(s) found on residentially-declared property: Tech Corp" in signal_4["evidence"]
    print("[PASS] Scenario 4: Active trade license on empty/missing declared property detected.")

    # Scenario 5: Inactive trade license on residential property (should be skipped)
    state_5 = {
        "property_data": {
            "declared_usage_type": "residential",
            "usage_type": "residential"
        },
        "trade_licenses": [
            {
                "is_active": "false",
                "business_name": "Closed Shop"
            }
        ]
    }
    result_5 = await usage_verification_agent(state_5)
    assert result_5 == {}, f"Scenario 5 failed: expected empty dict, got {result_5}"
    print("[PASS] Scenario 5: Inactive trade license on residential property correctly skipped.")

    # Scenario 6: Combined mismatch (both direct mismatch and active trade license)
    state_6 = {
        "property_data": {
            "declared_usage_type": "residential",
            "usage_type": "commercial"
        },
        "trade_licenses": [
            {
                "is_active": True,
                "business_name": "Corner Store"
            }
        ]
    }
    result_6 = await usage_verification_agent(state_6)
    assert "fraud_signals" in result_6
    signal_6 = result_6["fraud_signals"][0]
    assert "Declared usage 'residential' does not match observed usage 'commercial'" in signal_6["evidence"]
    assert "Active trade license(s) found on residentially-declared property: Corner Store" in signal_6["evidence"]
    print("[PASS] Scenario 6: Combined direct usage mismatch and active trade license detected.")

    # Scenario 7: Incomplete/missing data
    state_7 = {}
    result_7 = await usage_verification_agent(state_7)
    assert result_7 == {}, f"Scenario 7 failed: expected empty dict, got {result_7}"
    print("[PASS] Scenario 7: Incomplete/missing state data correctly skipped.")

    print("\n[SUCCESS] All Usage Verification Agent test cases passed!")


if __name__ == "__main__":
    asyncio.run(run_tests())
