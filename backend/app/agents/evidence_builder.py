"""Rule-Based Evidence Builder.

Replaces the Groq LLM call with a fully deterministic, structured output generator.
Reads the collected fraud_signals from pipeline state and produces a clean
investigation report as a structured dict — no LLM, no network calls.

Design principles:
  - All business rules live in module-level tables (_FRAUD_RULE_TABLE,
    _RISK_LEVEL_TABLE). Adding a new fraud agent only requires a new entry
    in _FRAUD_RULE_TABLE; the builder logic never needs to change.
  - Deduplication is applied to both recommendations and evidence items so
    the same advice is never repeated when multiple signals agree.
  - The output keys are top-level so the API response schema can expose them
    directly to the frontend without any JSON parsing.
"""

from __future__ import annotations

from app.agents.state import RevenueLeakageState

# ---------------------------------------------------------------------------
# Rule Tables — extend here to support new fraud agent categories
# ---------------------------------------------------------------------------

# Maps fraud signal `category` → rule metadata consumed by the builder.
# `recommendations` lists are merged and deduplicated across all active signals.
# `department` identifies the municipal unit responsible for follow-up.
_FRAUD_RULE_TABLE: dict[str, dict] = {
    "area_mismatch": {
        "title": "GIS Area vs. Declared Area Mismatch",
        "department": "Survey & GIS Department",
        "recommendations": [
            "Schedule a physical property measurement by a licensed surveyor.",
            "Cross-reference with approved building plan area.",
            "Issue revised property tax assessment if discrepancy is confirmed.",
        ],
    },
    "usage_mismatch": {
        "title": "Property Usage Type Mismatch",
        "department": "Tax Assessment Division",
        "recommendations": [
            "Conduct site inspection to verify actual usage of the property.",
            "Revise usage classification in the municipal registry.",
            "Re-assess tax demand using the correct commercial/industrial rate.",
        ],
    },
    "high_arrears": {
        "title": "Chronic High Tax Arrears",
        "department": "Revenue Recovery Cell",
        "recommendations": [
            "Initiate formal tax recovery proceedings under Municipal Act.",
            "Issue demand notice with accrued penalty and interest.",
            "Escalate to legal cell if arrears exceed recovery threshold.",
        ],
    },
    "fake_exemption": {
        "title": "Invalid Tax Exemption Claim",
        "department": "Exemption Verification Unit",
        "recommendations": [
            "Cancel the exemption immediately pending document verification.",
            "Issue recovery notice for all years the exemption was wrongly applied.",
            "Refer case to vigilance if deliberate misrepresentation is suspected.",
        ],
    },
    "duplicate_property": {
        "title": "Possible Duplicate / Phantom Property Registration",
        "department": "Property Records Department",
        "recommendations": [
            "Cross-check ownership records and title deeds across all flagged UIDs.",
            "Conduct field visit to verify physical existence of the property.",
            "Initiate deduplication process in the municipal property register.",
        ],
    },
    "secondary": {
        "title": "Suspicious Payment Ledger Manipulation",
        "department": "Internal Audit / Finance Department",
        "recommendations": [
            "Conduct a financial desk audit of all manual ledger adjustments.",
            "Verify gateway references against bank settlement records.",
            "Refer to vigilance if officer-level manipulation is confirmed.",
        ],
    },
}

# Fallback entry for any category not listed above (future-proof).
_DEFAULT_RULE: dict = {
    "title": "Unclassified Fraud Signal",
    "department": "Municipal Inspection Team",
    "recommendations": ["Review signal manually and escalate as appropriate."],
}

# Risk-level → additional investigation actions appended after per-signal recommendations.
_RISK_LEVEL_TABLE: dict[str, dict] = {
    "critical": {
        "headline_prefix": "🚨 CRITICAL RISK",
        "next_step": (
            "URGENT: Initiate field verification and legal notice within 48 hours. "
            "Escalate to senior officer immediately."
        ),
        "extra_actions": [
            "Initiate field verification within 48 hours.",
            "Prepare legal notice for service.",
            "Escalate to senior officer / Commissioner.",
        ],
    },
    "high": {
        "headline_prefix": "⚠️ HIGH RISK",
        "next_step": "Schedule field verification within 7 days. Prepare case file.",
        "extra_actions": [
            "Schedule field verification within 7 days.",
            "Prepare reassessment notice.",
        ],
    },
    "medium": {
        "headline_prefix": "🔶 MEDIUM RISK",
        "next_step": "Queue for desk audit in next monthly review cycle.",
        "extra_actions": [
            "Queue for desk audit in next monthly review cycle.",
        ],
    },
    "low": {
        "headline_prefix": "✅ LOW RISK",
        "next_step": "Continue routine monitoring. No immediate action required.",
        "extra_actions": [],
    },
}

_DEFAULT_RISK: dict = {
    "headline_prefix": "ℹ️ RISK",
    "next_step": "Review as per standard operating procedure.",
    "extra_actions": [],
}


# ---------------------------------------------------------------------------
# Public API
# ---------------------------------------------------------------------------

def build_evidence_summary(state: RevenueLeakageState) -> dict:
    """Build a fully structured, deterministic investigation report from state.

    Consumes:
      state["fraud_signals"]          — list of signal dicts from detection agents
      state["risk_level"]             — string: "low" | "medium" | "high" | "critical"
      state["risk_score"]             — float 0–100
      state["property_id"]            — string
      state["estimated_revenue_impact"] — float (₹)
      state["revenue_impact_breakdown"] — list of per-signal impact dicts

    Returns a flat dict with top-level keys ready to be serialised by the API.
    """
    signals = state.get("fraud_signals", [])
    risk_level = (state.get("risk_level") or "low").lower()
    risk_score = float(state.get("risk_score") or 0.0)
    property_id = state.get("property_id", "unknown")
    total_impact = float(state.get("estimated_revenue_impact") or 0.0)
    impact_breakdown: list[dict] = state.get("revenue_impact_breakdown") or []

    # --- No signals case ---
    if not signals:
        risk_cfg = _RISK_LEVEL_TABLE.get(risk_level, _DEFAULT_RISK)
        return {
            # Legacy fields — kept for backward compat with fraud_analysis_service
            "evidence_summary": "No major revenue leakage evidence found in available records.",
            "officer_notes": "Continue routine monitoring.",
            "recommended_action": risk_cfg["next_step"],
            "revenue_impact_estimate": 0.0,
            # New structured fields
            "headline": f"{risk_cfg['headline_prefix']} — No fraud signals detected for property {property_id}",
            "risk_level": risk_level,
            "risk_score": risk_score,
            "estimated_revenue_impact": 0.0,
            "summary": ["No fraud indicators found in available records for this property."],
            "detected_issues": [],
            "evidence": [],
            "recommended_actions": [risk_cfg["next_step"]],
            "departments_involved": [],
            "next_step": risk_cfg["next_step"],
        }

    # --- Deduplicate signals by (fraud_type, evidence) — mirrors fraud_scoring_agent ---
    seen_keys: set[tuple] = set()
    unique_signals: list[dict] = []
    for sig in signals:
        key = (sig.get("fraud_type"), sig.get("evidence"))
        if key not in seen_keys:
            seen_keys.add(key)
            unique_signals.append(sig)

    # Build a quick lookup: category → impact label (from revenue_impact_breakdown)
    impact_label_by_type: dict[str, str] = {
        b.get("fraud_type", ""): b.get("impact_label", "")
        for b in impact_breakdown
        if b.get("fraud_type")
    }

    # --- Accumulate per-signal data ---
    summary_lines: list[str] = []
    detected_issues: list[dict] = []
    evidence_items: list[str] = []
    all_recommendations: list[str] = []
    departments: list[str] = []

    for sig in unique_signals:
        fraud_type: str = sig.get("fraud_type", "Unknown")
        category: str = sig.get("category", "secondary")
        # Use `is None` — plain `or 1.0` wrongly treats legitimate 0.0 as missing.
        _raw_confidence = sig.get("confidence")
        confidence: float = float(1.0 if _raw_confidence is None else _raw_confidence)
        evidence_text: str = sig.get("evidence", "")

        rule = _FRAUD_RULE_TABLE.get(category, _DEFAULT_RULE)
        impact_label = impact_label_by_type.get(fraud_type, "Impact under investigation.")

        # Summary line
        severity = _confidence_label(confidence)
        summary_lines.append(
            f"{rule['title']} detected ({severity} confidence). {impact_label}"
        )

        # Detected issue entry
        detected_issues.append({
            "fraud_type": fraud_type,
            "category": category,
            "title": rule["title"],
            "confidence": confidence,
            "severity": severity,
            "evidence": evidence_text,
            "impact_label": impact_label,
        })

        # Evidence
        if evidence_text and evidence_text not in evidence_items:
            evidence_items.append(evidence_text)

        # Recommendations (deduplicated)
        for rec in rule["recommendations"]:
            if rec not in all_recommendations:
                all_recommendations.append(rec)

        # Departments (deduplicated)
        dept = rule["department"]
        if dept and dept not in departments:
            departments.append(dept)

    # --- Append risk-level extra actions ---
    risk_cfg = _RISK_LEVEL_TABLE.get(risk_level, _DEFAULT_RISK)
    for action in risk_cfg["extra_actions"]:
        if action not in all_recommendations:
            all_recommendations.append(action)

    # --- Compose legacy plain-text fields for backward compat ---
    signal_count = len(unique_signals)
    officer_notes = (
        f"Risk level: {risk_level.upper()}. "
        f"Estimated revenue at risk: ₹{total_impact:,.0f}. "
        f"{signal_count} fraud signal(s) detected."
    )
    # Legacy evidence_summary is a bullet-point version of the evidence list
    legacy_summary = "\n".join(
        f"• [{s.get('fraud_type')}] {s.get('evidence', '')}"
        for s in unique_signals
    )

    headline = (
        f"{risk_cfg['headline_prefix']} — "
        f"{signal_count} fraud signal(s) detected for property {property_id}"
    )

    return {
        # ---- Legacy fields (preserved for analysis_repository / existing state consumers) ----
        "evidence_summary": legacy_summary,
        "officer_notes": officer_notes,
        "recommended_action": risk_cfg["next_step"],
        "revenue_impact_estimate": total_impact,

        # ---- New structured fields ----
        "headline": headline,
        "risk_level": risk_level,
        "risk_score": risk_score,
        "estimated_revenue_impact": total_impact,
        "summary": summary_lines,
        "detected_issues": detected_issues,
        "evidence": evidence_items,
        "recommended_actions": all_recommendations,
        "departments_involved": departments,
        "next_step": risk_cfg["next_step"],
    }


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _confidence_label(confidence: float) -> str:
    """Map confidence float to human-readable severity label."""
    if confidence >= 1.0:
        return "high"
    if confidence >= 0.75:
        return "medium"
    return "low"
