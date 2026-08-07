import asyncio
from app.agents.payment_analysis_agent import payment_analysis_agent


async def run_tests():
    print("Running Payment Analysis Agent Unit Tests...\n")

    # Scenario 1: Empty state (no records)
    state_1 = {
        "payments": [],
        "tax_records": []
    }
    res_1 = await payment_analysis_agent(state_1)
    assert res_1 == {}, f"Scenario 1 failed: expected empty dict, got {res_1}"
    print("[PASS] Scenario 1: Empty state correctly skipped.")

    # Scenario 2: Manual adjustment with no reason
    state_2 = {
        "payments": [
            {
                "is_manual_adjustment": True,
                "amount": 25000.0,
                "payment_date": "2026-01-15",
                "adjustment_reason": ""  # Missing reason
            }
        ]
    }
    res_2 = await payment_analysis_agent(state_2)
    assert "fraud_signals" in res_2, "Scenario 2 failed: fraud_signals key missing"
    sig_2 = res_2["fraud_signals"][0]
    assert sig_2["fraud_type"] == "Payment Manipulation"
    assert sig_2["category"] == "secondary"
    assert "no approval note" in sig_2["evidence"]
    print("[PASS] Scenario 2: Manual adjustment without reason flagged.")

    # Scenario 3: Manual adjustment with approval reason (should be allowed if no other triggers)
    state_3 = {
        "payments": [
            {
                "is_manual_adjustment": True,
                "amount": 25000.0,
                "payment_date": "2026-01-15",
                "adjustment_reason": "Authorized waiver under Section 12",
                "gateway_reference": "GW-123"
            }
        ]
    }
    res_3 = await payment_analysis_agent(state_3)
    assert res_3 == {}, f"Scenario 3 failed: expected empty dict, got {res_3}"
    print("[PASS] Scenario 3: Manual adjustment with explanation correctly skipped.")

    # Scenario 4: Payments recorded without a gateway reference
    state_4 = {
        "payments": [
            {
                "is_manual_adjustment": False,
                "amount": 10000.0,
                "gateway_reference": ""  # Missing gateway ref
            }
        ]
    }
    res_4 = await payment_analysis_agent(state_4)
    sig_4 = res_4["fraud_signals"][0]
    assert "recorded without a gateway reference" in sig_4["evidence"]
    print("[PASS] Scenario 4: Payments without gateway references flagged.")

    # Scenario 5: Large arrears reduction without matching payments
    state_5 = {
        "tax_records": [
            {"assessment_year": "2024-25", "arrears_amount": 10000.0},  # Latest
            {"assessment_year": "2023-24", "arrears_amount": 80000.0}   # Previous
        ],
        "payments": [
            {"amount": 10000.0}  # reduction is 70k, but only paid 10k (< 80% of 70k)
        ]
    }
    res_5 = await payment_analysis_agent(state_5)
    sig_5 = res_5["fraud_signals"][0]
    assert "without matching payment records" in sig_5["evidence"]
    print("[PASS] Scenario 5: Large unexplained arrears reduction flagged.")

    print("\n[SUCCESS] All Payment Analysis Agent test cases passed!")


if __name__ == "__main__":
    asyncio.run(run_tests())
