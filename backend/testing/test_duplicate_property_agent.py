import asyncio
from app.agents.duplicate_property_agent import duplicate_property_agent


async def run_tests():
    print("Running Duplicate Property Agent Unit Tests...\n")

    # Scenario 1: No duplicate candidates (should return empty dict)
    state_1 = {
        "property_data": {
            "property_uid": "PT-1001",
            "duplicate_candidates": []
        }
    }
    res_1 = await duplicate_property_agent(state_1)
    assert res_1 == {}, f"Scenario 1 failed: expected empty dict, got {res_1}"
    print("[PASS] Scenario 1: No duplicate candidates skipped correctly.")

    # Scenario 2: Single candidate with 'same_owner' (confidence: 0.50)
    state_2 = {
        "property_data": {
            "property_uid": "PT-1001",
            "duplicate_candidates": [
                {
                    "property_uid": "PT-1002",
                    "owner_name": "Rajesh Sharma",
                    "match_type": "same_owner"
                }
            ]
        }
    }
    res_2 = await duplicate_property_agent(state_2)
    assert "fraud_signals" in res_2, "Scenario 2 failed: fraud_signals key missing"
    sig_2 = res_2["fraud_signals"][0]
    assert sig_2["confidence"] == 0.50, f"Expected 0.50, got {sig_2['confidence']}"
    assert "cross-property review" in sig_2["evidence"]
    print("[PASS] Scenario 2: Same owner match flagged with 0.50 confidence.")

    # Scenario 3: Single candidate with 'same_owner_same_ward' (confidence: 0.75)
    state_3 = {
        "property_data": {
            "property_uid": "PT-1001",
            "duplicate_candidates": [
                {
                    "property_uid": "PT-1003",
                    "owner_name": "Rajesh Sharma",
                    "match_type": "same_owner_same_ward"
                }
            ]
        }
    }
    res_3 = await duplicate_property_agent(state_3)
    sig_3 = res_3["fraud_signals"][0]
    assert sig_3["confidence"] == 0.75, f"Expected 0.75, got {sig_3['confidence']}"
    assert "possible property split" in sig_3["evidence"]
    print("[PASS] Scenario 3: Same owner and ward match flagged with 0.75 confidence.")

    # Scenario 4: Single candidate with 'same_owner_same_address' (confidence: 1.0)
    state_4 = {
        "property_data": {
            "property_uid": "PT-1001",
            "duplicate_candidates": [
                {
                    "property_uid": "PT-1004",
                    "owner_name": "Rajesh Sharma",
                    "match_type": "same_owner_same_address"
                }
            ]
        }
    }
    res_4 = await duplicate_property_agent(state_4)
    sig_4 = res_4["fraud_signals"][0]
    assert sig_4["confidence"] == 1.0, f"Expected 1.00, got {sig_4['confidence']}"
    assert "phantom/duplicate registration" in sig_4["evidence"]
    print("[PASS] Scenario 4: Same owner and address match flagged with 1.00 confidence.")

    # Scenario 5: Multiple candidates, should select the highest confidence one
    state_5 = {
        "property_data": {
            "property_uid": "PT-1001",
            "duplicate_candidates": [
                {
                    "property_uid": "PT-1002",
                    "owner_name": "Rajesh Sharma",
                    "match_type": "same_owner"
                },
                {
                    "property_uid": "PT-1004",
                    "owner_name": "Rajesh Sharma",
                    "match_type": "same_owner_same_address"
                },
                {
                    "property_uid": "PT-1003",
                    "owner_name": "Rajesh Sharma",
                    "match_type": "same_owner_same_ward"
                }
            ]
        }
    }
    res_5 = await duplicate_property_agent(state_5)
    sig_5 = res_5["fraud_signals"][0]
    assert sig_5["confidence"] == 1.0, f"Expected 1.00 (highest), got {sig_5['confidence']}"
    assert "phantom/duplicate registration" in sig_5["evidence"]
    print("[PASS] Scenario 5: Multiple candidates resolved to the highest confidence mismatch.")

    # Scenario 6: Unknown or default match type
    state_6 = {
        "property_data": {
            "property_uid": "PT-1001",
            "duplicate_candidates": [
                {
                    "property_uid": "PT-1005",
                    "owner_name": "Rajesh Sharma",
                    "match_type": "unknown_type"
                }
            ]
        }
    }
    res_6 = await duplicate_property_agent(state_6)
    sig_6 = res_6["fraud_signals"][0]
    assert sig_6["confidence"] == 0.50, f"Expected fallback to 0.50, got {sig_6['confidence']}"
    print("[PASS] Scenario 6: Unknown match type handled and fallback confidence applied.")

    print("\n[SUCCESS] All Duplicate Property Agent test cases passed!")


if __name__ == "__main__":
    asyncio.run(run_tests())
