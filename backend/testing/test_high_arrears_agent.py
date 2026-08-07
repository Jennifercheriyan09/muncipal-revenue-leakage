import asyncio
from app.agents.high_arrears_agent import high_arrears_agent


async def run_tests():
    print("Running High Arrears Agent Unit Tests...\n")

    # Scenario 1: No arrears / empty records
    state_1 = {
        "tax_records": []
    }
    res_1 = await high_arrears_agent(state_1)
    assert res_1 == {}, f"Scenario 1 failed: expected empty dict, got {res_1}"
    print("[PASS] Scenario 1: No tax records correctly skipped.")

    # Scenario 2: Single year of arrears (less than the minimum threshold of 2 years)
    state_2 = {
        "tax_records": [
            {"year": "2024-25", "arrears_amount": 75000.0}
        ]
    }
    res_2 = await high_arrears_agent(state_2)
    assert res_2 == {}, f"Scenario 2 failed: expected empty dict (under 2 years threshold), got {res_2}"
    print("[PASS] Scenario 2: Single year of arrears correctly skipped.")

    # Scenario 3: 2 years of arrears with total < 50,000 (mild chronic non-payment, confidence 0.50)
    state_3 = {
        "tax_records": [
            {"year": "2023-24", "arrears_amount": 10000.0},
            {"year": "2024-25", "arrears_amount": 15000.0}
        ]
    }
    res_3 = await high_arrears_agent(state_3)
    assert "fraud_signals" in res_3, "Scenario 3 failed: fraud_signals key missing"
    sig_3 = res_3["fraud_signals"][0]
    assert sig_3["confidence"] == 0.50, f"Expected 0.50, got {sig_3['confidence']}"
    assert "unpaid arrears" in sig_3["evidence"]
    print("[PASS] Scenario 3: 2 years with low arrears flagged with 0.50 confidence.")

    # Scenario 4: 2 years of arrears with total >= 50,000 but < 100,000 (substantial arrears, confidence 0.75)
    state_4 = {
        "tax_records": [
            {"year": "2023-24", "arrears_amount": 30000.0},
            {"year": "2024-25", "arrears_amount": 40000.0}
        ]
    }
    res_4 = await high_arrears_agent(state_4)
    sig_4 = res_4["fraud_signals"][0]
    assert sig_4["confidence"] == 0.75, f"Expected 0.75, got {sig_4['confidence']}"
    assert "substantial backlog" in sig_4["evidence"]
    print("[PASS] Scenario 4: 2 years with substantial arrears flagged with 0.75 confidence.")

    # Scenario 5: 3+ years of arrears and total >= 1,00,000 (critical default, confidence 1.0)
    state_5 = {
        "tax_records": [
            {"year": "2022-23", "arrears_amount": 40000.0},
            {"year": "2023-24", "arrears_amount": 40000.0},
            {"year": "2024-25", "arrears_amount": 40000.0}
        ]
    }
    res_5 = await high_arrears_agent(state_5)
    sig_5 = res_5["fraud_signals"][0]
    assert sig_5["confidence"] == 1.0, f"Expected 1.00, got {sig_5['confidence']}"
    assert "Critical:" in sig_5["evidence"]
    print("[PASS] Scenario 5: 3+ years with critical arrears flagged with 1.00 confidence.")

    # Scenario 6: 3+ years of arrears but total < 50,000 (should fall back to 0.50)
    state_6 = {
        "tax_records": [
            {"year": "2022-23", "arrears_amount": 5000.0},
            {"year": "2023-24", "arrears_amount": 5000.0},
            {"year": "2024-25", "arrears_amount": 5000.0}
        ]
    }
    res_6 = await high_arrears_agent(state_6)
    sig_6 = res_6["fraud_signals"][0]
    assert sig_6["confidence"] == 0.50, f"Expected 0.50, got {sig_6['confidence']}"
    print("[PASS] Scenario 6: 3+ years with low arrears correctly fell back to 0.50 confidence.")

    print("\n[SUCCESS] All High Arrears Agent test cases passed!")


if __name__ == "__main__":
    asyncio.run(run_tests())
