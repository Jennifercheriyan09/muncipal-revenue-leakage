import asyncio
from app.agents.revenue_impact_agent import revenue_impact_agent


async def run_tests():
    print("Running Revenue Impact Agent Unit Tests...\n")

    # Scenario 1: Area Mismatch impact calculation
    state_1 = {
        "property_data": {
            "declared_area_sq_m": 100.0,
            "gis_area_sq_m": 150.0
        },
        "tax_records": [
            {"assessment_year": "2024-25", "tax_demand": 10000.0}
        ],
        "fraud_signals": [
            {"category": "area_mismatch", "fraud_type": "Area Mismatch", "evidence": "E1"}
        ]
    }
    # assessed = 100, gis = 150, undeclared = 50. latest_demand = 10000.
    # rate_per_sq_m = 10000 / 100 = 100. impact = 50 * 100 = 5000.
    res_1 = await revenue_impact_agent(state_1)
    assert res_1["estimated_revenue_impact"] == 5000.0, f"Expected 5000.0, got {res_1['estimated_revenue_impact']}"
    assert res_1["revenue_impact_breakdown"][0]["estimated_impact"] == 5000.0
    print("[PASS] Scenario 1: Area mismatch revenue impact calculated correctly.")

    # Scenario 2: Usage Mismatch impact calculation
    state_2 = {
        "property_data": {
            "usage_type": "Commercial"  # 3.0 multiplier
        },
        "tax_records": [
            {"assessment_year": "2024-25", "tax_demand": 20000.0}
        ],
        "fraud_signals": [
            {"category": "usage_mismatch", "fraud_type": "Usage Mismatch", "evidence": "E2"}
        ]
    }
    # multiplier = 3.0. latest_demand = 20000.
    # impact = latest_demand * (3.0 - 1.0) = 40000.0
    res_2 = await revenue_impact_agent(state_2)
    assert res_2["estimated_revenue_impact"] == 40000.0, f"Expected 40000.0, got {res_2['estimated_revenue_impact']}"
    print("[PASS] Scenario 2: Usage mismatch revenue impact calculated correctly.")

    # Scenario 3: High Arrears impact calculation
    state_3 = {
        "tax_records": [
            {"assessment_year": "2023-24", "arrears_amount": 35000.0},
            {"assessment_year": "2024-25", "arrears_amount": 40000.0}
        ],
        "fraud_signals": [
            {"category": "high_arrears", "fraud_type": "High Arrears", "evidence": "E3"}
        ]
    }
    # impact = sum of arrears = 75000.0
    res_3 = await revenue_impact_agent(state_3)
    assert res_3["estimated_revenue_impact"] == 75000.0, f"Expected 75000.0, got {res_3['estimated_revenue_impact']}"
    print("[PASS] Scenario 3: High arrears revenue impact calculated correctly.")

    # Scenario 4: Fake Exemption impact calculation
    state_4 = {
        "tax_records": [
            {"assessment_year": "2024-25", "tax_demand": 15000.0}
        ],
        "fraud_signals": [
            {"category": "fake_exemption", "fraud_type": "Fake Exemption", "evidence": "E4"}
        ]
    }
    # impact = latest_demand = 15000.0
    res_4 = await revenue_impact_agent(state_4)
    assert res_4["estimated_revenue_impact"] == 15000.0, f"Expected 15000.0, got {res_4['estimated_revenue_impact']}"
    print("[PASS] Scenario 4: Fake exemption revenue impact calculated correctly.")

    # Scenario 5: Duplicate property and Secondary signals (should be 0.0)
    state_5 = {
        "fraud_signals": [
            {"category": "duplicate_property", "fraud_type": "Duplicate Property", "evidence": "E5"},
            {"category": "secondary", "fraud_type": "Payment Manipulation", "evidence": "E6"}
        ]
    }
    res_5 = await revenue_impact_agent(state_5)
    assert res_5["estimated_revenue_impact"] == 0.0
    print("[PASS] Scenario 5: Duplicate and secondary signals yield zero calculated impact.")

    print("\n[SUCCESS] All Revenue Impact Agent test cases passed!")


if __name__ == "__main__":
    asyncio.run(run_tests())
