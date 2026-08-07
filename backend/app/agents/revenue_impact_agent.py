"""Revenue Impact Agent.

Calculates the estimated financial loss to the municipality for each detected
fraud signal. Runs sequentially after fraud_scoring so it works on the full,
deduplicated signal list.

Impact calculation per MVP category:
  area_mismatch      → undeclared_area × rate_per_sq_m from latest tax record
  usage_mismatch     → tax_demand × (commercial_multiplier - 1)
  high_arrears       → sum of arrears_amount across all unpaid tax records (exact figure)
  fake_exemption     → latest year tax_demand (full amount the property should be paying)
  duplicate_property → "Under investigation" (₹0 until field verification confirms)
  secondary          → "Under review" (payment manipulation — amount unconfirmed)

Design principle (Option B):
  Detection agents only answer "what fraud exists?"
  This agent is the single place that answers "how much money is lost?"
  This separation means you can update financial formulas without touching detection logic.
"""

from app.agents.state import RevenueLeakageState

# Usage type → tax rate multiplier relative to residential baseline
# e.g. commercial = 3× means a commercial property of same size pays 3× the residential rate
_USAGE_MULTIPLIERS: dict[str, float] = {
    "commercial":  3.0,
    "industrial":  4.0,
    "mixed":       2.0,
    "institutional": 2.5,
}


async def revenue_impact_agent(state: RevenueLeakageState) -> dict:
    """Calculates estimated revenue impact for each fraud signal.

    Reads the deduplicated fraud_signals from state (already cleaned by fraud_scoring_agent)
    and produces:
      - estimated_revenue_impact: float — total ₹ loss (sum of calculable impacts)
      - revenue_impact_breakdown: list  — per-signal detail with label and amount
    """
    data = state.get("property_data", {})

    # Work on deduplicated signals (fraud_scoring already deduped, but guard defensively)
    seen: set[tuple] = set()
    unique_signals: list[dict] = []
    for signal in state.get("fraud_signals", []):
        key = (signal.get("fraud_type"), signal.get("evidence"))
        if key not in seen:
            seen.add(key)
            unique_signals.append(signal)

    breakdown: list[dict] = []
    total_impact: float = 0.0
    tax_records = state.get("tax_records", [])

    for signal in unique_signals:
        cat = signal.get("category", "secondary")
        fraud_type = signal.get("fraud_type", "Unknown")

        impact, label = _calculate_impact(cat, data, tax_records)

        breakdown.append({
            "fraud_type": fraud_type,
            "category": cat,
            "estimated_impact": impact,
            "impact_label": label,
        })
        total_impact += impact

    return {
        "estimated_revenue_impact": round(total_impact, 2),
        "revenue_impact_breakdown": breakdown,
    }


# ---------------------------------------------------------------------------
# Per-category impact calculators
# ---------------------------------------------------------------------------

def _calculate_impact(category: str, data: dict, tax_records: list[dict]) -> tuple[float, str]:
    """Returns (impact_amount_inr, human_readable_label) for a given category."""
    if category == "area_mismatch":
        return _area_impact(data, tax_records)
    if category == "usage_mismatch":
        return _usage_impact(data, tax_records)
    if category == "high_arrears":
        return _arrears_impact(tax_records)
    if category == "fake_exemption":
        return _exemption_impact(data, tax_records)
    if category == "duplicate_property":
        return 0.0, "Under investigation — requires field verification before amount can be estimated."
    if category == "secondary":
        return 0.0, "Amount under review — requires desk audit to confirm."
    return 0.0, "Impact not calculated for this signal type."


def _area_impact(data: dict, tax_records: list[dict]) -> tuple[float, str]:
    """Loss from undeclared built-up area."""
    assessed = float(data.get("assessed_area_sq_m") or data.get("declared_area_sq_m") or 0)
    gis = float(data.get("gis_area_sq_m") or 0)

    if not (assessed and gis and gis > assessed):
        return 0.0, "Insufficient area data to estimate impact."

    latest_demand = _latest_tax_demand(tax_records)

    if not latest_demand or not assessed:
        return 0.0, "Tax demand data unavailable — impact estimate pending."

    rate_per_sq_m = latest_demand / assessed
    undeclared_area = gis - assessed
    impact = undeclared_area * rate_per_sq_m

    return round(impact, 2), (
        f"₹{impact:,.0f}/year — {undeclared_area:.1f} sq.m undeclared "
        f"@ ₹{rate_per_sq_m:,.0f}/sq.m (from latest tax demand)."
    )


def _usage_impact(data: dict, tax_records: list[dict]) -> tuple[float, str]:
    """Loss from incorrect (lower) usage classification."""
    usage_type = data.get("usage_type", "")
    multiplier = _USAGE_MULTIPLIERS.get(usage_type.lower(), 0.0)

    if multiplier <= 1.0:
        return 0.0, f"No rate differential found for usage type '{usage_type}'."

    latest_demand = _latest_tax_demand(tax_records)

    if not latest_demand:
        return 0.0, "Tax demand data unavailable — impact estimate pending."

    # impact = what the correct rate would add on top of what's currently charged
    impact = latest_demand * (multiplier - 1.0)

    return round(impact, 2), (
        f"₹{impact:,.0f}/year — property billed at residential rate "
        f"but actual usage '{usage_type}' attracts {multiplier}× multiplier "
        f"(shortfall = ₹{latest_demand:,.0f} × {multiplier - 1:.1f})."
    )


def _arrears_impact(tax_records: list[dict]) -> tuple[float, str]:
    """Exact unpaid arrears — most reliable figure as it comes directly from records."""
    total_arrears = sum(
        float(r.get("arrears_amount", 0))
        for r in tax_records
        if float(r.get("arrears_amount", 0)) > 0
    )
    years = sum(1 for r in tax_records if float(r.get("arrears_amount", 0)) > 0)

    if total_arrears == 0:
        return 0.0, "No arrears data available."

    return round(total_arrears, 2), (
        f"₹{total_arrears:,.0f} in confirmed unpaid arrears across {years} assessment years."
    )


def _exemption_impact(data: dict, tax_records: list[dict]) -> tuple[float, str]:
    """Loss from an invalid exemption — the full current year's tax demand."""
    latest_demand = _latest_tax_demand(tax_records)

    if not latest_demand:
        return 0.0, "Tax demand data unavailable — impact estimate pending."

    return round(latest_demand, 2), (
        f"₹{latest_demand:,.0f}/year — full current tax demand waived "
        f"under unverified exemption."
    )


def _latest_tax_demand(tax_records: list[dict]) -> float:
    """Returns the tax_demand from the most recent assessment year, or 0."""
    if not tax_records:
        return 0.0
    sorted_records = sorted(tax_records, key=lambda r: r.get("assessment_year", 0), reverse=True)
    return float(sorted_records[0].get("tax_demand", 0))
