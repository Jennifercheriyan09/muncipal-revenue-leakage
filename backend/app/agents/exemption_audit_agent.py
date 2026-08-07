"""Exemption Audit Agent.

Detects exemptions that lack a supporting document reference.
MVP spec: Exemption issues = 10% of the total revenue leakage risk score.

Confidence: 1.0 (binary) — either there is a document ID or there isn't.
"""

from app.agents.state import RevenueLeakageState


async def exemption_audit_agent(state: RevenueLeakageState) -> dict:
    """Validates exemption claims against supporting evidence.

    Returns a partial dict with only the signals this agent detected.
    """
    data = state.get("property_data", {})

    if not data.get("is_exempt"):
        return {}

    evidence_parts = []
    has_mismatch = False
    exemption_type = (data.get("exemption_type") or "unspecified").lower()

    # 1. Missing document reference
    if not data.get("exemption_document_id"):
        has_mismatch = True
        evidence_parts.append(
            f"Property marked exempt (type: {exemption_type}) but has no supporting document ID on record."
        )

    # 2. Senior citizen exemption eligibility check (age >= 60)
    if exemption_type == "senior_citizen":
        owner_age = data.get("owner_age")
        if owner_age is not None:
            try:
                owner_age_int = int(owner_age)
                if owner_age_int < 60:
                    has_mismatch = True
                    evidence_parts.append(
                        f"Owner age is under 60 (observed: {owner_age_int}), "
                        f"ineligible for senior citizen exemption."
                    )
            except ValueError:
                pass

    # 3. Vacancy exemption active contradictions (active utility consumption & active tax/payment history)
    if exemption_type == "vacancy":
        # Check active utility consumption
        utility_records = state.get("utility_records", [])
        if utility_records:
            total_consumption = sum(
                float(r.get("consumption_units") or 0) for r in utility_records
            )
            if total_consumption > 0:
                has_mismatch = True
                evidence_parts.append(
                    f"Utility records show active utility usage ({total_consumption:.0f} units), "
                    f"contradicting vacancy exemption status."
                )

        # Check active tax/payment history
        tax_records = state.get("tax_records", [])
        payments = state.get("payments", [])

        total_paid_tax = sum(float(r.get("tax_paid") or 0) for r in tax_records)
        total_payments = sum(float(p.get("amount") or 0) for p in payments)

        if total_paid_tax > 0 or total_payments > 0:
            has_mismatch = True
            evidence_parts.append(
                f"Property has active tax payment history (tax paid: ₹{total_paid_tax:,.0f}, "
                f"payments: {len(payments)} transaction(s)), contradicting vacancy exemption status."
            )

    if has_mismatch:
        return {
            "fraud_signals": [
                {
                    "fraud_type": "Fake Exemption",
                    "category": "fake_exemption",
                    "confidence": 1.0,
                    "evidence": " ".join(evidence_parts),
                }
            ]
        }

    return {}
