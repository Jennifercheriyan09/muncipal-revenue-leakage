import asyncio
from app.graph.revenue_leakage_graph import get_revenue_leakage_graph


async def run_integration_tests():
    print("Running Compiled LangGraph Pipeline End-to-End Integration Tests...\n")

    # 1. Compile the graph
    graph = get_revenue_leakage_graph()
    assert graph is not None, "Failed to compile the LangGraph StateGraph"
    print("[PASS] Successfully compiled LangGraph pipeline.")

    # 2. Construct a complex mock state that triggers all 6 detection agents
    # This verifies state aggregation across parallel branches.
    initial_state = {
        "property_id": "PT-9999",
        "property_data": {
            "declared_area_sq_m": 100.0,
            "gis_area_sq_m": 150.0,  # +50% area discrepancy -> Area Mismatch (conf 1.0)
            "declared_usage_type": "residential",
            "usage_type": "commercial",  # Direct usage type discrepancy -> Usage Mismatch (conf 1.0)
            "is_exempt": True,
            "exemption_type": "senior_citizen",
            "owner_age": 45,  # Senior citizen exempt but owner age under 60 -> Fake Exemption (conf 1.0)
            "duplicate_candidates": [
                {
                    "property_uid": "PT-8888",
                    "owner_name": "Ramesh Kumar",
                    "match_type": "same_owner_same_address"  # -> Duplicate Property (conf 1.0)
                }
            ]
        },
        "trade_licenses": [
            {
                "is_active": True,
                "business_name": "Mega Retail Store"  # Active trade license on residential -> Usage Mismatch (conf 1.0)
            }
        ],
        "tax_records": [
            {"assessment_year": "2024-25", "tax_demand": 20000.0, "arrears_amount": 40000.0},  # Latest demand & arrears
            {"assessment_year": "2023-24", "tax_demand": 20000.0, "arrears_amount": 60000.0}   # Total arrears = 100k (2 years -> conf 0.75)
        ],
        "payments": [
            {
                "is_manual_adjustment": True,
                "amount": 10000.0,
                "adjustment_reason": ""  # Manual adjustment without explanation -> Payment Manipulation (conf 1.0)
            }
        ]
    }

    # 3. Invoke the graph
    # We temporarily bypass the Groq LLM to test fallback plain text reports cleanly
    from app.core.config import settings
    original_key = settings.groq_api_key
    settings.groq_api_key = None

    try:
        final_state = await graph.ainvoke(initial_state)
    finally:
        settings.groq_api_key = original_key

    # 4. Verify Parallel Merging (Fraud Signals Accumulator)
    signals = final_state.get("fraud_signals", [])
    assert len(signals) > 0, "No fraud signals merged in state!"
    
    categories = {s["category"] for s in signals}
    expected_categories = {
        "area_mismatch",
        "usage_mismatch",
        "fake_exemption",
        "duplicate_property",
        "high_arrears",
        "secondary"  # payment manipulation
    }
    assert expected_categories.issubset(categories), f"Missing categories in output signals: {expected_categories - categories}"
    print("[PASS] Parallel branching completed: all 6 agent outputs successfully merged into state.")

    # 5. Verify Fraud Scoring Math
    # Weights: Area (30% * 1.0) + Usage (30% * 1.0) + Exemption (10% * 1.0) + Duplicate (10% * 1.0) + Arrears (20% * 0.75)
    # Expected score: 30 + 30 + 10 + 10 + 15 = 95.0
    score = final_state.get("risk_score")
    assert score == 95.0, f"Expected final score 95.0, got {score}"
    assert final_state.get("risk_level") == "Critical", f"Expected 'Critical' risk level, got {final_state.get('risk_level')}"
    print("[PASS] Fraud scoring logic correctly aggregated and capped final score at 95.0 (CRITICAL).")

    # 6. Verify Revenue Impact Calculations
    # - Area: assessed=100, gis=150, demand=20000 -> rate=200 -> impact = 50 * 200 = 10,000
    # - Usage: demand=20000, commercial multiplier=3.0 -> impact = 20000 * 2 = 40,000
    # - Arrears: total arrears sum = 100,000
    # - Exemption: demand=20000 -> impact = 20000
    # - Duplicate: 0
    # - Secondary: 0
    # Expected total impact: 10,000 + 40,000 + 100,000 + 20,000 = 170,000.00
    total_impact = final_state.get("estimated_revenue_impact")
    assert total_impact == 170000.0, f"Expected total impact ₹170,000, got ₹{total_impact:,.2f}"
    print("[PASS] Revenue impact agents completed correct mathematical breakdown totaling ₹170,000.")

    # 7. Verify Narrative Fallback and Recommended Officer Actions
    assert "• [Area Mismatch]" in final_state["evidence_summary"]
    assert "• [Usage Mismatch]" in final_state["evidence_summary"]
    assert "CRITICAL" in final_state["officer_notes"]
    assert "₹170,000" in final_state["officer_notes"]
    assert "URGENT: Initiate field verification" in final_state["recommended_action"]
    print("[PASS] Narrative summary and recommended actions are correctly formatted.")

    # 8. Verify Critical Notification dispatch
    notifications = final_state.get("notifications", [])
    assert len(notifications) == 1
    assert notifications[0]["risk_level"] == "Critical"
    print("[PASS] Notification triggers correctly raised critical status flags.")

    print("\n[SUCCESS] E2E Pipeline Integration Test successfully passed!")


if __name__ == "__main__":
    asyncio.run(run_integration_tests())
