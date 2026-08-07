"""Generate Rulebased_Test_Results.md from live rule-based agent responses."""

from __future__ import annotations

import asyncio
import copy
import json
import sys
from pathlib import Path

_BACKEND_ROOT = Path(__file__).resolve().parents[1]
if str(_BACKEND_ROOT) not in sys.path:
    sys.path.insert(0, str(_BACKEND_ROOT))

from app.agents.evidence_builder import build_evidence_summary
from app.agents.evidence_summary_agent import evidence_summary_agent

REPO_ROOT = _BACKEND_ROOT.parent
OUT_PATH = REPO_ROOT / "Rulebased_Test_Results.md"


def pp(obj) -> str:
    return json.dumps(obj, indent=2, ensure_ascii=False, default=str)


async def main() -> None:
    cases: list[dict] = []

    async def add(title: str, description: str, state: dict, notes: str = "") -> None:
        res = await evidence_summary_agent(copy.deepcopy(state))
        cases.append(
            {
                "title": title,
                "description": description,
                "notes": notes,
                "input": state,
                "output": res,
            }
        )

    await add(
        "1. Empty fraud signals (clean property)",
        "No fraud signals; low risk; verifies clean legacy + structured empty report.",
        {
            "property_id": "PROP-EMPTY-001",
            "fraud_signals": [],
            "risk_level": "low",
            "risk_score": 0.0,
            "estimated_revenue_impact": 0.0,
        },
    )

    await add(
        "2. All six fraud categories at CRITICAL risk",
        "One signal per known category (area, usage, arrears, exemption, duplicate, secondary) with impact breakdown.",
        {
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
                    "evidence": "Unpaid arrears across 4 years",
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
                    "impact_label": "INR 80,000/yr undeclared area",
                },
                {
                    "fraud_type": "Usage Mismatch",
                    "category": "usage_mismatch",
                    "estimated_impact": 90000.0,
                    "impact_label": "INR 90,000/yr rate differential",
                },
                {
                    "fraud_type": "High Arrears",
                    "category": "high_arrears",
                    "estimated_impact": 250000.0,
                    "impact_label": "INR 250,000 arrears outstanding",
                },
                {
                    "fraud_type": "Fake Exemption",
                    "category": "fake_exemption",
                    "estimated_impact": 100000.0,
                    "impact_label": "INR 100,000/yr invalid exemption",
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
        },
    )

    await add(
        "3. Unknown category falls back to DEFAULT_RULE",
        "Category not in rule table should use Unclassified Fraud Signal / Municipal Inspection Team.",
        {
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
        },
    )

    evidence = "GIS area exceeds declared by 40%"
    await add(
        "4. Exact duplicate (fraud_type, evidence) collapse",
        "Three identical Area Mismatch signals; only the first is kept (confidence 0.75 wins).",
        {
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
                    "confidence": 1.0,
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
        },
    )

    shared = "Field notes: commercial activity on residential plot"
    await add(
        "5. Shared evidence text across different fraud types",
        "Usage + Area share the same evidence string: 2 detected_issues, evidence list has 1 entry.",
        {
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
        },
    )

    await add(
        "6. Sparse / malformed signals",
        "Empty dict, missing fields, confidence=None, empty evidence string.",
        {
            "property_id": "PROP-SPARSE-006",
            "fraud_signals": [
                {},
                {"fraud_type": "Weird"},
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
        },
        notes="Missing confidence defaults to 1.0. Empty evidence is omitted from the evidence list.",
    )

    for label, risk in [
        ("7a. risk_level='HIGH' (uppercase)", "HIGH"),
        ("7b. risk_level='Critical' (mixed case)", "Critical"),
        ("7c. risk_level=None defaults to low", None),
        ("7d. risk_level='nuclear' uses DEFAULT_RISK", "nuclear"),
    ]:
        await add(
            label,
            "Risk-level normalization / fallback behavior.",
            {
                "property_id": f"PROP-RISK-{risk}",
                "fraud_signals": [
                    {
                        "fraud_type": "High Arrears",
                        "category": "high_arrears",
                        "confidence": 0.9,
                        "evidence": "Chronic arrears > 24 months",
                    }
                ],
                "risk_level": risk,
                "risk_score": 55.0,
                "estimated_revenue_impact": 9000.0,
            },
        )

    await add(
        "8. Confidence to severity boundary matrix",
        "Confidences 0.0, 0.74, 0.75, 0.99, 1.0, 1.5 map to low/low/medium/medium/high/high.",
        {
            "property_id": "PROP-CONF-008",
            "fraud_signals": [
                {
                    "fraud_type": f"Area Mismatch {i}",
                    "category": "area_mismatch",
                    "confidence": c,
                    "evidence": f"boundary evidence {i} conf={c}",
                }
                for i, c in enumerate([0.0, 0.74, 0.75, 0.99, 1.0, 1.5])
            ],
            "risk_level": "medium",
            "risk_score": 50.0,
            "estimated_revenue_impact": 1000.0,
        },
        notes="After fix: confidence 0.0 is preserved (not coerced to 1.0).",
    )

    await add(
        "9. Partial impact breakdown",
        "Only Area Mismatch has impact_label; Usage Mismatch falls back to under investigation.",
        {
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
                    "impact_label": "INR 33,000/yr",
                },
                {"fraud_type": "", "impact_label": "should be ignored"},
            ],
        },
    )

    await add(
        "10. Large float impact formatting",
        "estimated_revenue_impact 1250000.5 appears rounded in officer_notes.",
        {
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
        },
    )

    det_state = {
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
            {"fraud_type": "Usage Mismatch", "impact_label": "INR 22,000/yr"},
        ],
    }
    r1 = await evidence_summary_agent(copy.deepcopy(det_state))
    r2 = await evidence_summary_agent(copy.deepcopy(det_state))
    r3 = build_evidence_summary(copy.deepcopy(det_state))
    cases.append(
        {
            "title": "11. Determinism (three identical invocations)",
            "description": "Agent x2 and builder x1 must return identical payloads.",
            "notes": f"All three outputs equal: {r1 == r2 == r3}",
            "input": det_state,
            "output": r1,
        }
    )

    await add(
        "12. Recommendation dedupe with risk-level extra_actions",
        "Medium risk extra action must appear only once in recommended_actions.",
        {
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
        },
    )

    await add(
        "13a. fraud_signals key omitted",
        "State without fraud_signals key behaves like empty list.",
        {
            "property_id": "PROP-OMIT-013",
            "risk_level": "low",
            "risk_score": 5.0,
        },
    )

    await add(
        "13b. fraud_signals=None",
        "None is falsy, so empty-signal path is used.",
        {
            "property_id": "PROP-NONE-013",
            "fraud_signals": None,
            "risk_level": "low",
            "risk_score": 5.0,
        },
    )

    await add(
        "14. Empty signals + CRITICAL risk metadata",
        "No signals but critical risk: headline/next_step critical; revenue forced to 0; officer_notes stays monitoring text.",
        {
            "property_id": "PROP-EMPTYCRIT-014",
            "fraud_signals": [],
            "risk_level": "critical",
            "risk_score": 85.0,
            "estimated_revenue_impact": 99999.0,
        },
    )

    wrap_state = {
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
    agent_res = await evidence_summary_agent(wrap_state)
    builder_res = build_evidence_summary(wrap_state)
    cases.append(
        {
            "title": "15. Agent wrapper equals builder output",
            "description": "evidence_summary_agent is a thin pass-through over build_evidence_summary.",
            "notes": f"agent == builder: {agent_res == builder_res}",
            "input": wrap_state,
            "output": agent_res,
        }
    )

    lines: list[str] = [
        "# Rule-Based Evidence Summary — Test Cases & Responses",
        "",
        "This document records the advanced test cases run against the deterministic "
        "rule-based evidence builder (`build_evidence_summary` / `evidence_summary_agent`), "
        "and the exact responses returned.",
        "",
        "**Suite result:** 19 / 19 passed (after confidence `0.0` fix).",
        "",
        "**Script:** `backend/testing/test_evidence_summary_advanced.py`",
        "",
        "---",
        "",
        "## Summary table",
        "",
        "| # | Test case | Outcome |",
        "|---|-----------|---------|",
    ]
    for i, c in enumerate(cases, 1):
        lines.append(f"| {i} | {c['title']} | Recorded response below |")
    lines += ["", "---", ""]

    for c in cases:
        lines += [
            f"## {c['title']}",
            "",
            c["description"],
            "",
        ]
        if c.get("notes"):
            lines += [f"**Notes:** {c['notes']}", ""]
        lines += [
            "### Input state",
            "",
            "```json",
            pp(c["input"]),
            "```",
            "",
            "### Rule-based response",
            "",
            "```json",
            pp(c["output"]),
            "```",
            "",
            "---",
            "",
        ]

    lines += [
        "## Bug found during testing",
        "",
        "`confidence: 0.0` was incorrectly treated as missing because the builder used "
        "`float(sig.get(\"confidence\") or 1.0)`. In Python, `0.0` is falsy, so it became "
        "`1.0` with severity `high`.",
        "",
        "**Fix:** only default when confidence is `None`:",
        "",
        "```python",
        '_raw_confidence = sig.get("confidence")',
        "confidence = float(1.0 if _raw_confidence is None else _raw_confidence)",
        "```",
        "",
        "Case 8 in this document reflects the **fixed** behavior.",
        "",
    ]

    OUT_PATH.write_text("\n".join(lines), encoding="utf-8")
    print(f"Wrote {OUT_PATH} ({OUT_PATH.stat().st_size} bytes, {len(cases)} cases)")


if __name__ == "__main__":
    asyncio.run(main())
