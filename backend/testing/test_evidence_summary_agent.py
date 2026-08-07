"""Unit tests for the rule-based Evidence Summary Agent.

All tests are fully deterministic — no LLM calls, no mocking of external APIs.
"""

import asyncio

from app.agents.evidence_summary_agent import evidence_summary_agent


async def run_tests():
    print("Running Evidence Summary Agent Unit Tests...\n")

    # ------------------------------------------------------------------
    # Scenario 1: Empty state — no fraud signals
    # ------------------------------------------------------------------
    state_1 = {
        "property_id": "PROP-CLEAN-001",
        "fraud_signals": [],
        "risk_level": "low",
        "risk_score": 10.0,
        "estimated_revenue_impact": 0.0,
        "revenue_impact_breakdown": [],
    }
    res_1 = await evidence_summary_agent(state_1)

    # Legacy field checks
    assert "No major revenue leakage evidence" in res_1["evidence_summary"], \
        f"Unexpected evidence_summary: {res_1['evidence_summary']}"
    assert res_1["revenue_impact_estimate"] == 0.0
    assert "No immediate action required" in res_1["recommended_action"] or \
           "routine monitoring" in res_1["recommended_action"].lower()

    # New structured field checks
    assert res_1["detected_issues"] == []
    assert res_1["evidence"] == []
    assert isinstance(res_1["headline"], str) and "PROP-CLEAN-001" in res_1["headline"]
    assert isinstance(res_1["summary"], list)
    assert isinstance(res_1["recommended_actions"], list) and len(res_1["recommended_actions"]) >= 1
    assert res_1["departments_involved"] == []

    print("[PASS] Scenario 1: Empty state — clean structured response with no issues.")

    # ------------------------------------------------------------------
    # Scenario 2: Two signals — area mismatch + usage mismatch (HIGH)
    # ------------------------------------------------------------------
    state_2 = {
        "property_id": "PROP-HIGH-002",
        "fraud_signals": [
            {
                "fraud_type": "Area Mismatch",
                "category": "area_mismatch",
                "confidence": 0.75,
                "evidence": "GIS area (250 sq.m) exceeds declared area (200 sq.m) by 25%",
            },
            {
                "fraud_type": "Usage Mismatch",
                "category": "usage_mismatch",
                "confidence": 1.0,
                "evidence": "Property declared residential but active commercial trade license found",
            },
        ],
        "risk_level": "high",
        "risk_score": 78.0,
        "estimated_revenue_impact": 45000.0,
        "revenue_impact_breakdown": [
            {"fraud_type": "Area Mismatch", "estimated_impact": 18000.0, "impact_label": "₹18,000/yr under-assessed"},
            {"fraud_type": "Usage Mismatch", "estimated_impact": 27000.0, "impact_label": "₹27,000/yr rate differential"},
        ],
    }
    res_2 = await evidence_summary_agent(state_2)

    # Structured output
    assert len(res_2["detected_issues"]) == 2
    fraud_types = {d["fraud_type"] for d in res_2["detected_issues"]}
    assert "Area Mismatch" in fraud_types
    assert "Usage Mismatch" in fraud_types

    assert len(res_2["evidence"]) == 2
    assert "GIS area" in res_2["evidence"][0] or "GIS area" in res_2["evidence"][1]

    assert len(res_2["recommended_actions"]) >= 2
    assert len(res_2["departments_involved"]) == 2

    # HIGH risk must mention field verification
    assert "field verification" in res_2["next_step"].lower() or \
           "7 days" in res_2["next_step"]

    # Legacy field
    assert "Area Mismatch" in res_2["evidence_summary"]
    assert "HIGH" in res_2["officer_notes"]
    assert "₹45,000" in res_2["officer_notes"]
    assert "2 fraud signal(s)" in res_2["officer_notes"]
    assert "field verification" in res_2["recommended_action"].lower()

    print("[PASS] Scenario 2: High risk — two signals produce correct structured + legacy output.")

    # ------------------------------------------------------------------
    # Scenario 3: Critical risk — fake exemption
    # ------------------------------------------------------------------
    state_3 = {
        "property_id": "PROP-CRIT-003",
        "fraud_signals": [
            {
                "fraud_type": "Fake Exemption",
                "category": "fake_exemption",
                "confidence": 1.0,
                "evidence": "Owner under 60 years but claimed senior citizen exemption",
            }
        ],
        "risk_level": "critical",
        "risk_score": 92.0,
        "estimated_revenue_impact": 100000.0,
        "revenue_impact_breakdown": [
            {"fraud_type": "Fake Exemption", "estimated_impact": 100000.0, "impact_label": "₹1,00,000/yr unverified exemption"},
        ],
    }
    res_3 = await evidence_summary_agent(state_3)

    assert "CRITICAL" in res_3["headline"] or "🚨" in res_3["headline"]
    assert "48 hours" in res_3["next_step"] or "URGENT" in res_3["next_step"]
    assert any("legal notice" in a.lower() or "field verification" in a.lower()
               for a in res_3["recommended_actions"])
    assert "Exemption Verification Unit" in res_3["departments_involved"]

    # Legacy compat
    assert "CRITICAL" in res_3["officer_notes"]
    assert "URGENT" in res_3["recommended_action"] or "48 hours" in res_3["recommended_action"]

    print("[PASS] Scenario 3: Critical risk — urgent actions and correct department included.")

    # ------------------------------------------------------------------
    # Scenario 4: Duplicate evidence strings are deduplicated
    # ------------------------------------------------------------------
    dup_evidence = "GIS area exceeds declared area"
    state_4 = {
        "property_id": "PROP-DUP-004",
        "fraud_signals": [
            {"fraud_type": "Area Mismatch", "category": "area_mismatch", "confidence": 0.5, "evidence": dup_evidence},
            {"fraud_type": "Area Mismatch", "category": "area_mismatch", "confidence": 0.5, "evidence": dup_evidence},
        ],
        "risk_level": "medium",
        "risk_score": 45.0,
        "estimated_revenue_impact": 5000.0,
        "revenue_impact_breakdown": [],
    }
    res_4 = await evidence_summary_agent(state_4)
    # After dedup, only 1 unique signal
    assert len(res_4["detected_issues"]) == 1
    assert res_4["evidence"].count(dup_evidence) == 1

    print("[PASS] Scenario 4: Duplicate signals are correctly deduplicated.")

    # ------------------------------------------------------------------
    # Scenario 5: Output schema contract — all required keys present
    # ------------------------------------------------------------------
    required_keys = {
        # New structured
        "headline", "risk_level", "risk_score", "estimated_revenue_impact",
        "summary", "detected_issues", "evidence", "recommended_actions",
        "departments_involved", "next_step",
        # Legacy
        "evidence_summary", "officer_notes", "recommended_action", "revenue_impact_estimate",
    }
    for scenario, res in [("1 (empty)", res_1), ("2 (high)", res_2), ("3 (critical)", res_3)]:
        missing = required_keys - set(res.keys())
        assert not missing, f"Scenario {scenario} missing keys: {missing}"

    print("[PASS] Scenario 5: All required output keys present across all scenarios.")

    print("\n[SUCCESS] All Evidence Summary Agent test cases passed!")


def test_evidence_summary_agent_suite():
    """Pytest entry point for the deterministic suite."""
    asyncio.run(run_tests())


if __name__ == "__main__":
    asyncio.run(run_tests())
