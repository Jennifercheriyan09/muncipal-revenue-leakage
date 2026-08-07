"""High Arrears Agent.

Detects properties with significant unpaid property tax arrears.
MVP spec: High arrears = 20% of the total revenue leakage risk score.

Confidence tiers (maps to score contribution = confidence × 20):
  0.50 → 2+ assessment years with any arrears (mild chronic non-payment)
  0.75 → 2+ years AND total arrears > ₹50,000 (substantial backlog)
  1.00 → 3+ years AND total arrears > ₹1,00,000 (critical/wilful default)
"""

from app.agents.state import RevenueLeakageState

# Thresholds — adjust per municipality's average tax demand
_MIN_YEARS_THRESHOLD = 2          # at least this many unpaid years to flag
_SUBSTANTIAL_ARREARS_AMOUNT = 50_000.0   # ₹50,000
_CRITICAL_ARREARS_AMOUNT = 1_00_000.0   # ₹1,00,000
_CRITICAL_YEARS_THRESHOLD = 3


async def high_arrears_agent(state: RevenueLeakageState) -> dict:
    """Checks tax_records for chronic unpaid arrears.

    Returns a partial dict with only the signals this agent detected.
    If no tax records are present, or arrears are within acceptable range,
    returns an empty dict — no signal raised.
    """
    tax_records = state.get("tax_records", [])

    if not tax_records:
        return {}

    # Count years with non-zero arrears and compute total outstanding
    unpaid_years = [r for r in tax_records if float(r.get("arrears_amount", 0)) > 0]
    years_count = len(unpaid_years)
    total_arrears = sum(float(r.get("arrears_amount", 0)) for r in unpaid_years)

    if years_count < _MIN_YEARS_THRESHOLD:
        return {}

    # Determine confidence tier
    if years_count >= _CRITICAL_YEARS_THRESHOLD and total_arrears >= _CRITICAL_ARREARS_AMOUNT:
        confidence = 1.0
        label = f"Critical: {years_count} consecutive years unpaid, total arrears ₹{total_arrears:,.0f}."
    elif total_arrears >= _SUBSTANTIAL_ARREARS_AMOUNT:
        confidence = 0.75
        label = f"{years_count} years of arrears totalling ₹{total_arrears:,.0f} — substantial backlog."
    else:
        confidence = 0.50
        label = f"{years_count} assessment years with unpaid arrears (total ₹{total_arrears:,.0f})."

    return {
        "fraud_signals": [
            {
                "fraud_type": "High Arrears",
                "category": "high_arrears",
                "confidence": confidence,
                "evidence": label,
            }
        ]
    }
