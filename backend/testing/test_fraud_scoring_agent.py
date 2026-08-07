import asyncio
from app.agents.fraud_scoring_agent import fraud_scoring_agent


async def run_tests():
    print("Running Fraud Scoring Agent Unit Tests...\n")

    # Scenario 1: Empty state (no fraud signals)
    state_1 = {
        "fraud_signals": []
    }
    res_1 = await fraud_scoring_agent(state_1)
    assert res_1["risk_score"] == 0.0
    assert res_1["risk_level"] == "Low"
    print("[PASS] Scenario 1: Empty state gives 0 score and low risk.")

    # Scenario 2: Deduplication of identical signals
    state_2 = {
        "fraud_signals": [
            {
                "fraud_type": "Area Mismatch",
                "category": "area_mismatch",
                "confidence": 1.0,
                "evidence": "Large area discrepancy"
            },
            {
                "fraud_type": "Area Mismatch",
                "category": "area_mismatch",
                "confidence": 1.0,
                "evidence": "Large area discrepancy"
            }
        ]
    }
    res_2 = await fraud_scoring_agent(state_2)
    # Area mismatch weight = 30. Single signal with confidence 1.0 -> 30 score.
    # If deduplication works, it should not double count.
    assert res_2["risk_score"] == 30.0
    assert res_2["risk_level"] == "Low"
    print("[PASS] Scenario 2: Identical signals correctly deduplicated.")

    # Scenario 3: Max confidence selected per category
    state_3 = {
        "fraud_signals": [
            {
                "fraud_type": "Area Mismatch",
                "category": "area_mismatch",
                "confidence": 0.5,
                "evidence": "Minor mismatch"
            },
            {
                "fraud_type": "Area Mismatch",
                "category": "area_mismatch",
                "confidence": 1.0,
                "evidence": "Major mismatch"
            }
        ]
    }
    res_3 = await fraud_scoring_agent(state_3)
    # Area mismatch weight = 30. Max confidence 1.0 should be chosen.
    assert res_3["risk_score"] == 30.0
    print("[PASS] Scenario 3: Max confidence selected within the same category.")

    # Scenario 4: Category combinations and risk tiers
    # Let's target "medium" risk (41-60)
    # Area mismatch (1.0 confidence -> 30 score) + Duplicate property (1.0 confidence -> 10 score) = 40 score (low)
    # Add Exemption audit (1.0 confidence -> 10 score) = 50 score (medium)
    state_4 = {
        "fraud_signals": [
            {"category": "area_mismatch", "confidence": 1.0, "fraud_type": "Area Mismatch", "evidence": "E1"},
            {"category": "duplicate_property", "confidence": 1.0, "fraud_type": "Duplicate", "evidence": "E2"},
            {"category": "fake_exemption", "confidence": 1.0, "fraud_type": "Fake Exemption", "evidence": "E3"}
        ]
    }
    res_4 = await fraud_scoring_agent(state_4)
    assert res_4["risk_score"] == 50.0
    assert res_4["risk_level"] == "Medium"
    print("[PASS] Scenario 4: Medium risk calculated correctly.")

    # Scenario 5: Critical tier and Score capping
    # Area (30) + Usage (30) + Arrears (20) + Duplicate (10) + Exemption (10) = 100 score
    state_5 = {
        "fraud_signals": [
            {"category": "area_mismatch", "confidence": 1.0, "fraud_type": "Area", "evidence": "E1"},
            {"category": "usage_mismatch", "confidence": 1.0, "fraud_type": "Usage", "evidence": "E2"},
            {"category": "high_arrears", "confidence": 1.0, "fraud_type": "Arrears", "evidence": "E3"},
            {"category": "duplicate_property", "confidence": 1.0, "fraud_type": "Dup", "evidence": "E4"},
            {"category": "fake_exemption", "confidence": 1.0, "fraud_type": "Exempt", "evidence": "E5"}
        ]
    }
    res_5 = await fraud_scoring_agent(state_5)
    assert res_5["risk_score"] == 100.0
    assert res_5["risk_level"] == "Critical"
    print("[PASS] Scenario 5: Critical risk and max score (100) verified.")

    # Scenario 6: Secondary category signals excluded from score
    state_6 = {
        "fraud_signals": [
            {"category": "secondary", "confidence": 1.0, "fraud_type": "Payment manipulation", "evidence": "E1"}
        ]
    }
    res_6 = await fraud_scoring_agent(state_6)
    assert res_6["risk_score"] == 0.0
    print("[PASS] Scenario 6: Secondary categories correctly ignored in scoring.")

    print("\n[SUCCESS] All Fraud Scoring Agent test cases passed!")


if __name__ == "__main__":
    asyncio.run(run_tests())
