"""Duplicate Property Detection Agent.

Detects properties that share an owner or address with other registered properties,
which may indicate phantom records, deliberate property splitting to reduce tax
liability, or data entry duplication in the municipal database.

MVP spec: Duplicate property = 10% of the total revenue leakage risk score.

Design: This agent works on pre-fetched data. Before invoking the LangGraph pipeline,
the caller (API endpoint or batch scanner) should populate:

    property_data["duplicate_candidates"] = [
        {
            "property_uid": "PT-2045",
            "owner_name": "Ramesh Kumar",
            "address": "12 MG Road, Ward 4",
            "ward_id": 4,
            "match_type": "same_owner_same_address"  | "same_owner_same_ward" | "same_owner"
        },
        ...
    ]

If `duplicate_candidates` is absent or empty, the agent returns {} (no signal).

Confidence tiers (maps to score contribution = confidence × 10):
  1.00 → same owner + same address  (definite duplicate / phantom property)
  0.75 → same owner + same ward     (likely tax-avoidance split)
  0.50 → same owner only            (multiple properties, possible but worth flagging)
"""

from app.agents.state import RevenueLeakageState

# Match type → confidence mapping
_CONFIDENCE_MAP: dict[str, float] = {
    "same_owner_same_address": 1.0,
    "same_owner_same_ward": 0.75,
    "same_owner": 0.50,
}


async def duplicate_property_agent(state: RevenueLeakageState) -> dict:
    """Detects duplicate property records for the same owner or address.

    Reads `property_data.duplicate_candidates` — a list of other properties
    that share owner/address with the current property. If the list is empty
    or absent, returns {} immediately.

    The caller (endpoint or batch processor) is responsible for pre-fetching
    and populating duplicate_candidates before invoking the pipeline.
    """
    data = state.get("property_data", {})
    candidates = data.get("duplicate_candidates", [])

    if not candidates:
        return {}

    # Use the highest-confidence match found
    best_confidence = 0.0
    best_match = None

    for candidate in candidates:
        match_type = candidate.get("match_type", "same_owner")
        confidence = _CONFIDENCE_MAP.get(match_type, 0.5)
        if confidence > best_confidence:
            best_confidence = confidence
            best_match = candidate

    if not best_match or best_confidence == 0.0:
        return {}

    count = len(candidates)
    uid = best_match.get("property_uid", "unknown")
    owner = best_match.get("owner_name", "unknown owner")
    match_type = best_match.get("match_type", "same_owner")

    evidence = _build_evidence(count, uid, owner, match_type)

    return {
        "fraud_signals": [
            {
                "fraud_type": "Duplicate Property",
                "category": "duplicate_property",
                "confidence": best_confidence,
                "evidence": evidence,
            }
        ]
    }


def _build_evidence(count: int, uid: str, owner: str, match_type: str) -> str:
    other = f"{count} other {'record' if count == 1 else 'records'}"
    if match_type == "same_owner_same_address":
        return (
            f"{other} found with identical owner ('{owner}') and address — "
            f"possible phantom/duplicate registration (e.g. {uid})."
        )
    if match_type == "same_owner_same_ward":
        return (
            f"{other} found for owner '{owner}' in the same ward — "
            f"possible property split to reduce tax liability (e.g. {uid})."
        )
    return (
        f"{other} registered under owner '{owner}' across the municipality — "
        f"flagged for cross-property review (e.g. {uid})."
    )
