"""Fraud Scoring Agent.

Applies the MVP-specified weighted scoring model to all collected fraud signals.

MVP weights (must sum to 100):
  Area mismatch      → 30%
  Usage mismatch     → 30%
  High arrears       → 20%
  Duplicate property → 10%
  Fake exemption     → 10%

Scoring formula per category:
  category_contribution = max(confidence across signals in that category) × weight

Final score = sum of all category contributions (capped at 100).
Signals with category='secondary' (e.g. payment manipulation) are excluded from
the score but preserved in state for the evidence summary report.
"""

from app.agents.state import RevenueLeakageState

# MVP-defined weights — must sum to 100
_MVP_WEIGHTS: dict[str, float] = {
    "area_mismatch":      30.0,
    "usage_mismatch":     30.0,
    "high_arrears":       20.0,
    "duplicate_property": 10.0,
    "fake_exemption":     10.0,
}


async def fraud_scoring_agent(state: RevenueLeakageState) -> dict:
    """Scores the property using MVP-specified category weights.

    Steps:
    1. Deduplicate signals by (category, evidence)
    2. For each MVP weight category, find the max confidence among signals
    3. contribution = max_confidence × weight
    4. final_score = sum(contributions), capped at 100
    """
    # Step 1: Deduplicate by (fraud_type, evidence)
    seen: set[tuple] = set()
    unique_signals: list[dict] = []
    for signal in state.get("fraud_signals", []):
        key = (signal.get("fraud_type"), signal.get("evidence"))
        if key not in seen:
            seen.add(key)
            unique_signals.append(signal)

    # Step 2: Group by category — take max confidence per category
    category_confidence: dict[str, float] = {}
    for signal in unique_signals:
        cat = signal.get("category", "secondary")
        if cat == "secondary":
            continue  # secondary signals don't affect score
        conf = float(signal.get("confidence", 1.0))
        category_confidence[cat] = max(category_confidence.get(cat, 0.0), conf)

    # Step 3 & 4: Apply weights and sum
    score = min(
        100.0,
        sum(
            category_confidence.get(cat, 0.0) * weight
            for cat, weight in _MVP_WEIGHTS.items()
        ),
    )

    # Spec thresholds: Low 0–40, Medium 41–60, High 61–80, Critical 81–100.
    risk_level = (
        "Critical" if score >= 81
        else "High"     if score >= 61
        else "Medium"   if score >= 41
        else "Low"
    )

    # Do NOT return fraud_signals — that re-triggers the Annotated reducer
    return {
        "risk_score": round(score, 1),
        "risk_level": risk_level,
    }
