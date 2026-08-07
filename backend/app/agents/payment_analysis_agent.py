"""Payment Analysis Agent.

Detects suspicious manual adjustments in the payment ledger.

NOTE: Payment manipulation is secondary evidence — not one of the 5 MVP weighted
categories (30/30/20/10/10). It uses category='secondary' so the fraud_scoring_agent
excludes it from the weighted score but the evidence_summary_agent still includes
it in the officer's investigation report.
"""

from app.agents.state import RevenueLeakageState


async def payment_analysis_agent(state: RevenueLeakageState) -> dict:
    """Detects payment ledger manipulation signals.

    Returns a partial dict with only the signals this agent detected.
    If no payment data is present, or no suspicious entries found, returns an empty dict.
    """
    payments = state.get("payments", [])
    tax_records = state.get("tax_records", [])

    if not payments and not tax_records:
        return {}

    evidence_parts = []
    found = False

    # 1. Manual adjustment with no approval reason.
    for payment in payments:
        if payment.get("is_manual_adjustment") and not payment.get("adjustment_reason"):
            evidence_parts.append(
                f"Manual payment adjustment of ₹{float(payment.get('amount', 0)):,.0f} "
                f"on {payment.get('payment_date', 'unknown date')} has no approval note."
            )
            found = True
            break

    # 2. Payment recorded with no gateway reference (cash with no trail).
    no_gateway = [
        p for p in payments
        if not p.get("gateway_reference") and not p.get("is_manual_adjustment")
    ]
    if no_gateway:
        evidence_parts.append(
            f"{len(no_gateway)} payment(s) recorded without a gateway reference."
        )
        found = True

    # 3. Large arrear reduction without corresponding payment record.
    if len(tax_records) >= 2:
        latest = tax_records[0]
        previous = tax_records[1]
        prev_arrears = float(previous.get("arrears_amount") or 0)
        curr_arrears = float(latest.get("arrears_amount") or 0)
        reduction = prev_arrears - curr_arrears
        if reduction > 50000 and curr_arrears < prev_arrears * 0.5:
            total_paid = sum(float(p.get("amount") or 0) for p in payments)
            if total_paid < reduction * 0.8:
                evidence_parts.append(
                    f"Arrears reduced by ₹{reduction:,.0f} "
                    f"(from ₹{prev_arrears:,.0f} to ₹{curr_arrears:,.0f}) "
                    f"without matching payment records."
                )
                found = True

    if found and evidence_parts:
        return {
            "fraud_signals": [
                {
                    "fraud_type": "Payment Manipulation",
                    "category": "secondary",
                    "confidence": 1.0,
                    "evidence": " ".join(evidence_parts),
                }
            ]
        }

    return {}
