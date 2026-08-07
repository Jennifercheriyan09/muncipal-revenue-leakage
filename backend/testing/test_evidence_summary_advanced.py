"""Advanced / edge-case stress test for the rule-based evidence summary agent.

Prints full structured responses so you can inspect them in the terminal,
then asserts expected contract behavior and prints a review verdict per case.
"""

from __future__ import annotations

import asyncio
import copy
import json
import sys
from pathlib import Path
from typing import Any, Callable

# Allow `python test_....py` from backend/testing without relying on editable install
_BACKEND_ROOT = Path(__file__).resolve().parents[1]
if str(_BACKEND_ROOT) not in sys.path:
    sys.path.insert(0, str(_BACKEND_ROOT))

from app.agents.evidence_builder import (  # noqa: E402
    _DEFAULT_RISK,
    _DEFAULT_RULE,
    _FRAUD_RULE_TABLE,
    _RISK_LEVEL_TABLE,
    build_evidence_summary,
)
from app.agents.evidence_summary_agent import evidence_summary_agent  # noqa: E402

REQUIRED_KEYS = {
    "evidence_summary",
    "officer_notes",
    "recommended_action",
    "revenue_impact_estimate",
    "headline",
    "risk_level",
    "risk_score",
    "estimated_revenue_impact",
    "summary",
    "detected_issues",
    "evidence",
    "recommended_actions",
    "departments_involved",
    "next_step",
}

ISSUE_KEYS = {
    "fraud_type",
    "category",
    "title",
    "confidence",
    "severity",
    "evidence",
    "impact_label",
}


def _pp(obj: Any) -> str:
    return json.dumps(obj, indent=2, ensure_ascii=False, default=str)


def _banner(title: str) -> None:
    print("\n" + "=" * 78)
    print(title)
    print("=" * 78)


def _show_response(res: dict) -> None:
    print("\n--- FULL RESPONSE ---")
    print(_pp(res))
    print("--- END RESPONSE ---\n")


async def _run_case(
    name: str,
    state: dict,
    checks: Callable[[dict], None],
    *,
    via_agent: bool = True,
) -> tuple[str, str]:
    """Returns (PASS|FAIL, detail). Always prints the response."""
    _banner(name)
    print("INPUT STATE:")
    print(_pp(state))

    try:
        if via_agent:
            res = await evidence_summary_agent(state)
        else:
            res = build_evidence_summary(state)
        _show_response(res)
        checks(res)
        print(f"RESULT: PASS — {name}")
        return "PASS", name
    except AssertionError as exc:
        print(f"RESULT: FAIL — {name}")
        print(f"ASSERTION: {exc}")
        return "FAIL", f"{name}: {exc}"
    except Exception as exc:  # noqa: BLE001 — surface unexpected crashes in the suite
        print(f"RESULT: ERROR — {name}")
        print(f"EXCEPTION: {type(exc).__name__}: {exc}")
        return "ERROR", f"{name}: {type(exc).__name__}: {exc}"


def _assert_contract(res: dict) -> None:
    missing = REQUIRED_KEYS - set(res)
    assert not missing, f"missing keys: {missing}"
    assert isinstance(res["summary"], list)
    assert isinstance(res["detected_issues"], list)
    assert isinstance(res["evidence"], list)
    assert isinstance(res["recommended_actions"], list)
    assert isinstance(res["departments_involved"], list)
    for issue in res["detected_issues"]:
        missing_issue = ISSUE_KEYS - set(issue)
        assert not missing_issue, f"issue missing keys: {missing_issue}"
    # recommendations + evidence must be unique
    assert len(res["recommended_actions"]) == len(set(res["recommended_actions"]))
    assert len(res["evidence"]) == len(set(res["evidence"]))
    assert len(res["departments_involved"]) == len(set(res["departments_involved"]))


async def run_advanced_suite() -> int:
    results: list[tuple[str, str]] = []

    # ------------------------------------------------------------------
    # 1. Empty signals
    # ------------------------------------------------------------------
    async def case_empty():
        state = {
            "property_id": "PROP-EMPTY-001",
            "fraud_signals": [],
            "risk_level": "low",
            "risk_score": 0.0,
            "estimated_revenue_impact": 0.0,
        }

        def checks(res: dict) -> None:
            _assert_contract(res)
            assert "No major revenue leakage evidence" in res["evidence_summary"]
            assert res["detected_issues"] == []
            assert res["evidence"] == []
            assert res["departments_involved"] == []
            assert res["revenue_impact_estimate"] == 0.0
            assert "PROP-EMPTY-001" in res["headline"]
            assert "LOW RISK" in res["headline"] or "✅" in res["headline"]
            assert res["recommended_action"] == _RISK_LEVEL_TABLE["low"]["next_step"]

        return await _run_case("1) Empty fraud_signals (clean property)", state, checks)

    results.append(await case_empty())

    # ------------------------------------------------------------------
    # 2. All six known categories — critical multi-signal blast
    # ------------------------------------------------------------------
    async def case_all_categories():
        state = {
            "property_id": "PROP-ALL-002",
            "fraud_signals": [
                {
                    "fraud_type": "Area Mismatch",
                    "category": "area_mismatch",
                    "confidence": 1.0,
                    "evidence": "GIS 400 sq.m vs declared 200 sq.m",
                },
                {
                    "fraud_type": "Usage Mismatch",
                    "category": "usage_mismatch",
                    "confidence": 0.75,
                    "evidence": "Declared residential; commercial trade license active",
                },
                {
                    "fraud_type": "High Arrears",
                    "category": "high_arrears",
                    "confidence": 0.9,
                    "evidence": "Unpaid arrears ₹2,50,000 across 4 years",
                },
                {
                    "fraud_type": "Fake Exemption",
                    "category": "fake_exemption",
                    "confidence": 1.0,
                    "evidence": "Senior exemption claimed; owner age 42",
                },
                {
                    "fraud_type": "Duplicate Property",
                    "category": "duplicate_property",
                    "confidence": 0.5,
                    "evidence": "UID collision with PROP-X991",
                },
                {
                    "fraud_type": "Payment Manipulation",
                    "category": "secondary",
                    "confidence": 0.8,
                    "evidence": "Manual ledger adjustment without gateway ref",
                },
            ],
            "risk_level": "critical",
            "risk_score": 95.0,
            "estimated_revenue_impact": 520000.0,
            "revenue_impact_breakdown": [
                {
                    "fraud_type": "Area Mismatch",
                    "category": "area_mismatch",
                    "estimated_impact": 80000.0,
                    "impact_label": "₹80,000/yr undeclared area",
                },
                {
                    "fraud_type": "Usage Mismatch",
                    "category": "usage_mismatch",
                    "estimated_impact": 90000.0,
                    "impact_label": "₹90,000/yr rate differential",
                },
                {
                    "fraud_type": "High Arrears",
                    "category": "high_arrears",
                    "estimated_impact": 250000.0,
                    "impact_label": "₹2,50,000 arrears outstanding",
                },
                {
                    "fraud_type": "Fake Exemption",
                    "category": "fake_exemption",
                    "estimated_impact": 100000.0,
                    "impact_label": "₹1,00,000/yr invalid exemption",
                },
                {
                    "fraud_type": "Duplicate Property",
                    "category": "duplicate_property",
                    "estimated_impact": 0.0,
                    "impact_label": "Under investigation",
                },
                {
                    "fraud_type": "Payment Manipulation",
                    "category": "secondary",
                    "estimated_impact": 0.0,
                    "impact_label": "Under review",
                },
            ],
        }

        def checks(res: dict) -> None:
            _assert_contract(res)
            assert len(res["detected_issues"]) == 6
            assert len(res["departments_involved"]) == 6
            for cat, rule in _FRAUD_RULE_TABLE.items():
                assert rule["department"] in res["departments_involved"], cat
            assert res["risk_level"] == "critical"
            assert "CRITICAL" in res["headline"] or "🚨" in res["headline"]
            assert "URGENT" in res["next_step"] and "48 hours" in res["next_step"]
            assert "₹520,000" in res["officer_notes"]
            assert "6 fraud signal(s)" in res["officer_notes"]
            # impact labels wired through
            labels = {i["impact_label"] for i in res["detected_issues"]}
            assert "₹80,000/yr undeclared area" in labels
            assert "Under investigation" in labels
            # severity mapping
            by_type = {i["fraud_type"]: i for i in res["detected_issues"]}
            assert by_type["Area Mismatch"]["severity"] == "high"
            assert by_type["Usage Mismatch"]["severity"] == "medium"
            assert by_type["Duplicate Property"]["severity"] == "low"
            # risk extra actions present
            for action in _RISK_LEVEL_TABLE["critical"]["extra_actions"]:
                assert action in res["recommended_actions"]

        return await _run_case(
            "2) All six fraud categories at CRITICAL risk", state, checks
        )

    results.append(await case_all_categories())

    # ------------------------------------------------------------------
    # 3. Unknown category → default rule
    # ------------------------------------------------------------------
    async def case_unknown_category():
        state = {
            "property_id": "PROP-UNK-003",
            "fraud_signals": [
                {
                    "fraud_type": "Mystery Leak",
                    "category": "brand_new_future_agent",
                    "confidence": 0.6,
                    "evidence": "Anomalous pattern not yet classified",
                }
            ],
            "risk_level": "medium",
            "risk_score": 50.0,
            "estimated_revenue_impact": 12000.0,
        }

        def checks(res: dict) -> None:
            _assert_contract(res)
            assert len(res["detected_issues"]) == 1
            issue = res["detected_issues"][0]
            assert issue["title"] == _DEFAULT_RULE["title"]
            assert res["departments_involved"] == [_DEFAULT_RULE["department"]]
            assert _DEFAULT_RULE["recommendations"][0] in res["recommended_actions"]
            assert issue["impact_label"] == "Impact under investigation."
            assert issue["severity"] == "low"  # 0.6 < 0.75

        return await _run_case("3) Unknown category falls back to DEFAULT_RULE", state, checks)

    results.append(await case_unknown_category())

    # ------------------------------------------------------------------
    # 4. Exact duplicate signals collapsed
    # ------------------------------------------------------------------
    async def case_exact_dupes():
        evidence = "GIS area exceeds declared by 40%"
        state = {
            "property_id": "PROP-DUP-004",
            "fraud_signals": [
                {
                    "fraud_type": "Area Mismatch",
                    "category": "area_mismatch",
                    "confidence": 0.75,
                    "evidence": evidence,
                },
                {
                    "fraud_type": "Area Mismatch",
                    "category": "area_mismatch",
                    "confidence": 1.0,  # should be dropped with first key
                    "evidence": evidence,
                },
                {
                    "fraud_type": "Area Mismatch",
                    "category": "area_mismatch",
                    "confidence": 0.5,
                    "evidence": evidence,
                },
            ],
            "risk_level": "high",
            "risk_score": 60.0,
            "estimated_revenue_impact": 18000.0,
        }

        def checks(res: dict) -> None:
            _assert_contract(res)
            assert len(res["detected_issues"]) == 1
            assert res["evidence"] == [evidence]
            # first occurrence wins for confidence
            assert res["detected_issues"][0]["confidence"] == 0.75
            assert res["officer_notes"].count("1 fraud signal") == 1 or \
                "1 fraud signal(s)" in res["officer_notes"]

        return await _run_case(
            "4) Exact duplicate (fraud_type, evidence) collapse; first wins",
            state,
            checks,
        )

    results.append(await case_exact_dupes())

    # ------------------------------------------------------------------
    # 5. Same evidence text, different fraud_type — both issues, evidence once
    # ------------------------------------------------------------------
    async def case_shared_evidence_text():
        shared = "Field notes: commercial activity on residential plot"
        state = {
            "property_id": "PROP-SHARE-005",
            "fraud_signals": [
                {
                    "fraud_type": "Usage Mismatch",
                    "category": "usage_mismatch",
                    "confidence": 1.0,
                    "evidence": shared,
                },
                {
                    "fraud_type": "Area Mismatch",
                    "category": "area_mismatch",
                    "confidence": 0.5,
                    "evidence": shared,
                },
            ],
            "risk_level": "high",
            "risk_score": 70.0,
            "estimated_revenue_impact": 40000.0,
        }

        def checks(res: dict) -> None:
            _assert_contract(res)
            assert len(res["detected_issues"]) == 2
            assert res["evidence"].count(shared) == 1
            assert len(res["departments_involved"]) == 2

        return await _run_case(
            "5) Shared evidence text across different fraud types",
            state,
            checks,
        )

    results.append(await case_shared_evidence_text())

    # ------------------------------------------------------------------
    # 6. Sparse / malformed signals
    # ------------------------------------------------------------------
    async def case_sparse_signals():
        state = {
            "property_id": "PROP-SPARSE-006",
            "fraud_signals": [
                {},  # completely empty signal
                {"fraud_type": "Weird"},  # no category/evidence/confidence
                {
                    "fraud_type": "Area Mismatch",
                    "category": "area_mismatch",
                    "confidence": None,
                    "evidence": "",
                },
            ],
            "risk_level": "medium",
            "risk_score": 41.0,
            "estimated_revenue_impact": 0.0,
        }

        def checks(res: dict) -> None:
            _assert_contract(res)
            # empty {} and sparse entries are still unique by (fraud_type, evidence)
            # ({}, {}) key = (None, None) once; ("Weird", None); ("Area Mismatch", "")
            assert len(res["detected_issues"]) == 3
            # empty evidence strings must NOT appear in evidence list
            assert "" not in res["evidence"]
            assert all(e for e in res["evidence"])
            # missing confidence → float(None or 1.0) → 1.0 → high severity
            for issue in res["detected_issues"]:
                assert issue["confidence"] == 1.0
                assert issue["severity"] == "high"
            # missing category → secondary rule
            cats = [i["category"] for i in res["detected_issues"]]
            assert cats.count("secondary") >= 2
            assert "Municipal Inspection Team" not in res["departments_involved"] or True
            assert "Internal Audit / Finance Department" in res["departments_involved"]
            assert "Survey & GIS Department" in res["departments_involved"]

        return await _run_case(
            "6) Sparse/malformed signals (missing fields, empty evidence)",
            state,
            checks,
        )

    results.append(await case_sparse_signals())

    # ------------------------------------------------------------------
    # 7. Risk level casing / aliases / unknown
    # ------------------------------------------------------------------
    async def case_risk_casing():
        base_signals = [
            {
                "fraud_type": "High Arrears",
                "category": "high_arrears",
                "confidence": 0.9,
                "evidence": "Chronic arrears > 24 months",
            }
        ]
        outcomes = []

        for label, risk in [
            ("7a) risk_level='HIGH' (uppercase)", "HIGH"),
            ("7b) risk_level='Critical' (mixed case)", "Critical"),
            ("7c) risk_level=None → defaults to low", None),
            ("7d) risk_level='nuclear' → DEFAULT_RISK", "nuclear"),
        ]:
            state = {
                "property_id": f"PROP-RISK-{risk}",
                "fraud_signals": base_signals if risk is not None else base_signals,
                "risk_level": risk,
                "risk_score": 55.0,
                "estimated_revenue_impact": 9000.0,
            }

            def make_checks(risk_value: str | None):
                def checks(res: dict) -> None:
                    _assert_contract(res)
                    if risk_value is None:
                        assert res["risk_level"] == "low"
                        assert res["next_step"] == _RISK_LEVEL_TABLE["low"]["next_step"]
                    elif risk_value.lower() in _RISK_LEVEL_TABLE:
                        expected = risk_value.lower()
                        assert res["risk_level"] == expected
                        assert res["next_step"] == _RISK_LEVEL_TABLE[expected]["next_step"]
                    else:
                        assert res["risk_level"] == risk_value.lower()
                        assert res["next_step"] == _DEFAULT_RISK["next_step"]
                        assert "ℹ️" in res["headline"] or "RISK" in res["headline"]

                return checks

            outcomes.append(
                await _run_case(label, state, make_checks(risk))
            )
        return outcomes

    for item in await case_risk_casing():
        results.append(item)

    # ------------------------------------------------------------------
    # 8. Confidence boundary matrix
    # ------------------------------------------------------------------
    async def case_confidence_boundaries():
        cases = [
            (0.0, "low"),
            (0.74, "low"),
            (0.75, "medium"),
            (0.99, "medium"),
            (1.0, "high"),
            (1.5, "high"),  # out-of-range but still >= 1.0
        ]
        signals = []
        for i, (conf, _) in enumerate(cases):
            signals.append(
                {
                    "fraud_type": f"Area Mismatch {i}",
                    "category": "area_mismatch",
                    "confidence": conf,
                    "evidence": f"boundary evidence {i} conf={conf}",
                }
            )
        state = {
            "property_id": "PROP-CONF-008",
            "fraud_signals": signals,
            "risk_level": "medium",
            "risk_score": 50.0,
            "estimated_revenue_impact": 1000.0,
        }

        def checks(res: dict) -> None:
            _assert_contract(res)
            assert len(res["detected_issues"]) == len(cases)
            for issue, (conf, expected_sev) in zip(res["detected_issues"], cases):
                assert issue["confidence"] == conf, (
                    f"conf input={conf}: expected stored confidence {conf}, "
                    f"got {issue['confidence']} (0.0 must not be coerced to 1.0)"
                )
                assert issue["severity"] == expected_sev, (
                    f"conf={conf}: expected severity {expected_sev}, got {issue['severity']}"
                )
            # all same category → one department
            assert res["departments_involved"] == ["Survey & GIS Department"]

        return await _run_case(
            "8) Confidence→severity boundary matrix (0.0 / 0.74 / 0.75 / 0.99 / 1.0 / 1.5)",
            state,
            checks,
        )

    results.append(await case_confidence_boundaries())

    # ------------------------------------------------------------------
    # 9. Impact breakdown missing / partial / wrong fraud_type key
    # ------------------------------------------------------------------
    async def case_impact_partial():
        state = {
            "property_id": "PROP-IMPACT-009",
            "fraud_signals": [
                {
                    "fraud_type": "Area Mismatch",
                    "category": "area_mismatch",
                    "confidence": 1.0,
                    "evidence": "Area gap 30%",
                },
                {
                    "fraud_type": "Usage Mismatch",
                    "category": "usage_mismatch",
                    "confidence": 1.0,
                    "evidence": "Commercial use observed",
                },
            ],
            "risk_level": "high",
            "risk_score": 72.0,
            "estimated_revenue_impact": 33000.0,
            "revenue_impact_breakdown": [
                {
                    "fraud_type": "Area Mismatch",
                    "estimated_impact": 33000.0,
                    "impact_label": "₹33,000/yr",
                },
                # Usage Mismatch intentionally absent
                {"fraud_type": "", "impact_label": "should be ignored"},
            ],
        }

        def checks(res: dict) -> None:
            _assert_contract(res)
            by_type = {i["fraud_type"]: i["impact_label"] for i in res["detected_issues"]}
            assert by_type["Area Mismatch"] == "₹33,000/yr"
            assert by_type["Usage Mismatch"] == "Impact under investigation."

        return await _run_case(
            "9) Partial impact breakdown (missing type → under investigation)",
            state,
            checks,
        )

    results.append(await case_impact_partial())

    # ------------------------------------------------------------------
    # 10. Huge impact formatting + zero impact with signals present
    # ------------------------------------------------------------------
    async def case_impact_formatting():
        state = {
            "property_id": "PROP-FMT-010",
            "fraud_signals": [
                {
                    "fraud_type": "Fake Exemption",
                    "category": "fake_exemption",
                    "confidence": 1.0,
                    "evidence": "Exemption docs forged",
                }
            ],
            "risk_level": "critical",
            "risk_score": 90.0,
            "estimated_revenue_impact": 1250000.5,
        }

        def checks(res: dict) -> None:
            _assert_contract(res)
            assert "₹1,250,000" in res["officer_notes"] or "₹1,250,001" in res["officer_notes"]
            assert res["revenue_impact_estimate"] == 1250000.5
            assert res["estimated_revenue_impact"] == 1250000.5

        return await _run_case(
            "10) Large float impact formatting in officer_notes",
            state,
            checks,
        )

    results.append(await case_impact_formatting())

    # ------------------------------------------------------------------
    # 11. Determinism — identical outputs across repeated calls
    # ------------------------------------------------------------------
    async def case_determinism():
        state = {
            "property_id": "PROP-DET-011",
            "fraud_signals": [
                {
                    "fraud_type": "Usage Mismatch",
                    "category": "usage_mismatch",
                    "confidence": 0.75,
                    "evidence": "Shop operating without commercial assessment",
                },
                {
                    "fraud_type": "Payment Manipulation",
                    "category": "secondary",
                    "confidence": 0.5,
                    "evidence": "Manual waiver posted twice",
                },
            ],
            "risk_level": "high",
            "risk_score": 66.0,
            "estimated_revenue_impact": 22000.0,
            "revenue_impact_breakdown": [
                {
                    "fraud_type": "Usage Mismatch",
                    "impact_label": "₹22,000/yr",
                }
            ],
        }

        _banner("11) Determinism — three identical invocations")
        print("INPUT STATE:")
        print(_pp(state))
        r1 = await evidence_summary_agent(copy.deepcopy(state))
        r2 = await evidence_summary_agent(copy.deepcopy(state))
        r3 = build_evidence_summary(copy.deepcopy(state))
        _show_response(r1)
        try:
            assert r1 == r2 == r3
            _assert_contract(r1)
            print("RESULT: PASS — 11) Determinism — three identical invocations")
            return "PASS", "11) Determinism"
        except AssertionError as exc:
            print(f"RESULT: FAIL — 11) Determinism: {exc}")
            return "FAIL", f"11) Determinism: {exc}"

    results.append(await case_determinism())

    # ------------------------------------------------------------------
    # 12. Recommendation dedupe across signal rules + risk extras
    # ------------------------------------------------------------------
    async def case_rec_dedupe():
        # medium risk extra_action text equals next_step; ensure listed once in actions
        state = {
            "property_id": "PROP-REC-012",
            "fraud_signals": [
                {
                    "fraud_type": "High Arrears",
                    "category": "high_arrears",
                    "confidence": 0.8,
                    "evidence": "Arrears unpaid 3 assessment years",
                }
            ],
            "risk_level": "medium",
            "risk_score": 45.0,
            "estimated_revenue_impact": 50000.0,
        }

        def checks(res: dict) -> None:
            _assert_contract(res)
            extra = _RISK_LEVEL_TABLE["medium"]["extra_actions"][0]
            assert res["recommended_actions"].count(extra) == 1
            assert res["recommended_action"] == res["next_step"]
            assert res["next_step"] == _RISK_LEVEL_TABLE["medium"]["next_step"]

        return await _run_case(
            "12) Recommendation dedupe with risk-level extra_actions",
            state,
            checks,
        )

    results.append(await case_rec_dedupe())

    # ------------------------------------------------------------------
    # 13. fraud_signals omitted / None
    # ------------------------------------------------------------------
    async def case_missing_signals_key():
        state_omit = {
            "property_id": "PROP-OMIT-013",
            "risk_level": "low",
            "risk_score": 5.0,
            # fraud_signals omitted
        }
        state_none = {
            "property_id": "PROP-NONE-013",
            "fraud_signals": None,
            "risk_level": "low",
            "risk_score": 5.0,
        }

        outcomes = []

        def checks(res: dict) -> None:
            _assert_contract(res)
            assert res["detected_issues"] == []
            assert "No major revenue leakage evidence" in res["evidence_summary"]

        outcomes.append(
            await _run_case(
                "13a) fraud_signals key omitted entirely",
                state_omit,
                checks,
            )
        )

        # None may either be treated as empty or crash — capture actual behavior
        _banner("13b) fraud_signals=None (edge)")
        print("INPUT STATE:")
        print(_pp(state_none))
        try:
            res = await evidence_summary_agent(state_none)
            _show_response(res)
            checks(res)
            print("RESULT: PASS — 13b) fraud_signals=None treated as empty")
            outcomes.append(("PASS", "13b) fraud_signals=None"))
        except Exception as exc:  # noqa: BLE001
            print(f"RESULT: FAIL (robustness) — 13b) fraud_signals=None raised {type(exc).__name__}: {exc}")
            print(
                "REVIEW NOTE: Builder assumes iterable fraud_signals; None is not "
                "normalized to []. Callers should pass [] or builder should guard."
            )
            outcomes.append(("FAIL", f"13b) fraud_signals=None: {type(exc).__name__}: {exc}"))
        return outcomes

    for item in await case_missing_signals_key():
        results.append(item)

    # ------------------------------------------------------------------
    # 14. Empty signals but CRITICAL risk metadata (odd but possible)
    # ------------------------------------------------------------------
    async def case_empty_but_critical_meta():
        state = {
            "property_id": "PROP-EMPTYCRIT-014",
            "fraud_signals": [],
            "risk_level": "critical",
            "risk_score": 85.0,
            "estimated_revenue_impact": 99999.0,  # should still force revenue fields to 0
        }

        def checks(res: dict) -> None:
            _assert_contract(res)
            assert res["detected_issues"] == []
            assert res["revenue_impact_estimate"] == 0.0
            assert res["estimated_revenue_impact"] == 0.0
            # empty path still uses risk table for next_step/headline
            assert "CRITICAL" in res["headline"] or "🚨" in res["headline"]
            assert "URGENT" in res["recommended_action"]
            # officer_notes on empty path is hardcoded monitoring text (not impact)
            assert res["officer_notes"] == "Continue routine monitoring."

        return await _run_case(
            "14) Empty signals + CRITICAL risk metadata (impact forced to 0)",
            state,
            checks,
        )

    results.append(await case_empty_but_critical_meta())

    # ------------------------------------------------------------------
    # 15. Builder-only vs agent wrapper parity
    # ------------------------------------------------------------------
    async def case_wrapper_parity():
        state = {
            "property_id": "PROP-WRAP-015",
            "fraud_signals": [
                {
                    "fraud_type": "Duplicate Property",
                    "category": "duplicate_property",
                    "confidence": 0.5,
                    "evidence": "Two UIDs, one footprint",
                }
            ],
            "risk_level": "medium",
            "risk_score": 42.0,
            "estimated_revenue_impact": 0.0,
        }
        _banner("15) Agent wrapper == builder output")
        print("INPUT STATE:")
        print(_pp(state))
        agent_res = await evidence_summary_agent(state)
        builder_res = build_evidence_summary(state)
        _show_response(agent_res)
        try:
            assert agent_res == builder_res
            print("RESULT: PASS — 15) Agent wrapper == builder output")
            return "PASS", "15) Wrapper parity"
        except AssertionError as exc:
            print(f"RESULT: FAIL — 15) Wrapper parity: {exc}")
            return "FAIL", f"15) Wrapper parity: {exc}"

    results.append(await case_wrapper_parity())

    # ------------------------------------------------------------------
    # Summary + review
    # ------------------------------------------------------------------
    _banner("SUITE SUMMARY")
    passed = sum(1 for s, _ in results if s == "PASS")
    failed = sum(1 for s, _ in results if s != "PASS")
    for status, detail in results:
        mark = "OK" if status == "PASS" else "!!"
        print(f"  [{mark}] {status:5}  {detail}")
    print(f"\nTotals: {passed} passed, {failed} failed, {len(results)} cases")
    return 0 if failed == 0 else 1


if __name__ == "__main__":
    raise SystemExit(asyncio.run(run_advanced_suite()))
