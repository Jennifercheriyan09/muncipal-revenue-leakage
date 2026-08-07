"""Usage Verification Agent.

Detects mismatch between declared and observed property usage type.
MVP spec: Usage mismatch = 30% of the total revenue leakage risk score.

Confidence: 1.0 (binary) — declared usage either matches or it doesn't.
"""

from app.agents.state import RevenueLeakageState


async def usage_verification_agent(state: RevenueLeakageState) -> dict:
    """Detects commercial activity or usage mismatches on properties.

    Returns a partial dict with only the signals this agent detected.
    If usage types match (or data is absent), returns an empty dict.
    """
    data = state.get("property_data", {})
    declared = (data.get("declared_usage_type") or "").lower()
    observed = (data.get("usage_type") or "").lower()

    evidence_parts = []
    has_mismatch = False

    # 1. Direct usage type mismatch
    if declared and observed and declared != observed:
        has_mismatch = True
        evidence_parts.append(
            f"Declared usage '{declared}' does not match observed usage '{observed}'."
        )

    # 2. Active trade license on a residential-declared property
    active_licenses = [
        lic for lic in state.get("trade_licenses", [])
        if str(lic.get("is_active")).lower() in ("true", "1") and declared in ("residential", "")
    ]
    if active_licenses:
        has_mismatch = True
        names = ", ".join(lic.get("business_name", "Unknown") for lic in active_licenses[:2])
        evidence_parts.append(
            f"Active trade license(s) found on residentially-declared property: {names}."
        )

    if has_mismatch:
        return {
            "fraud_signals": [
                {
                    "fraud_type": "Usage Mismatch",
                    "category": "usage_mismatch",
                    "confidence": 1.0,
                    "evidence": " ".join(evidence_parts),
                }
            ]
        }

    return {}
