"""Area Mismatch Agent.

Detects discrepancy between GIS-measured area and declared/assessed area.
MVP spec: Area mismatch = 30% of the total revenue leakage risk score.

Confidence tiers (maps to score contribution = confidence × 30):
  0.50 → 10–25% deviation  (possible measurement error or minor underdeclaration)
  0.75 → 25–50% deviation  (significant underdeclaration, likely intentional)
  1.00 → >50% deviation    (severe — property nearly doubles actual size on GIS)
"""

from app.agents.state import RevenueLeakageState


async def area_mismatch_agent(state: RevenueLeakageState) -> dict:
    """Detects GIS vs assessed/declared area discrepancy.

    Returns a partial dict with only the signals this agent detected.
    If no mismatch is found (or data is absent), returns an empty dict.
    """
    data = state.get("property_data", {})
    assessed = float(data.get("declared_area_sq_m") or 0)
    gis = float(data.get("gis_area_sq_m") or 0)

    if not (assessed and gis):
        return {}

    deviation = (gis - assessed) / assessed

    if deviation < 0.10:
        return {}

    if deviation >= 0.50:
        confidence = 1.0
    elif deviation >= 0.25:
        confidence = 0.75
    else:
        confidence = 0.50

    evidence = (
        f"GIS area ({gis:.1f} sq.m) is {deviation:.0%} larger than declared area ({assessed:.1f} sq.m) "
        f"— {_severity_label(confidence)}."
    )

    # Cross-check building permission if available from state
    permissions = state.get("building_permissions", [])
    if permissions:
        approved = float(permissions[0].get("approved_area_sq_m") or 0)
        if approved and gis > approved * 1.10:
            evidence += (
                f" Building permission only approved {approved:.1f} sq.m "
                f"(permit no. {permissions[0].get('permission_number', 'N/A')})."
            )

    return {
        "fraud_signals": [
            {
                "fraud_type": "Area Mismatch",
                "category": "area_mismatch",
                "confidence": confidence,
                "evidence": evidence,
            }
        ]
    }


def _severity_label(confidence: float) -> str:
    if confidence >= 1.0:
        return "severe underdeclaration (>50%)"
    if confidence >= 0.75:
        return "significant underdeclaration (25–50%)"
    return "minor discrepancy (10–25%)"
