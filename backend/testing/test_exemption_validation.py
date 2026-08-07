import asyncio
from app.agents.exemption_audit_agent import exemption_audit_agent

async def test_exemption_rules():
    print("Running Exemption Audit Agent Unit Tests...")

    # Case 1: Property not exempt (should return empty dict)
    state_not_exempt = {
        "property_data": {
            "is_exempt": False,
            "exemption_type": "senior_citizen",
            "owner_age": 45,
            "exemption_document_id": None
        }
    }
    res = await exemption_audit_agent(state_not_exempt)
    assert res == {}, f"Failed Case 1: Expected empty dict, got {res}"
    print("[PASS] Case 1: Non-exempt property is skipped.")

    # Case 2: Eligible Senior Citizen with Document ID (no flag expected)
    state_eligible_senior = {
        "property_data": {
            "is_exempt": True,
            "exemption_type": "senior_citizen",
            "owner_age": 68,
            "exemption_document_id": "DOC-12345"
        },
        "utility_records": [
            {"consumption_units": 150} # normal utility usage should be allowed for senior citizen
        ]
    }
    res = await exemption_audit_agent(state_eligible_senior)
    assert res == {}, f"Failed Case 2: Expected empty dict, got {res}"
    print("[PASS] Case 2: Eligible senior citizen with utilities is allowed.")

    # Case 3: Ineligible Senior Citizen (under age 60) (flag expected)
    state_ineligible_senior = {
        "property_data": {
            "is_exempt": True,
            "exemption_type": "senior_citizen",
            "owner_age": 45,
            "exemption_document_id": "DOC-12345"
        }
    }
    res = await exemption_audit_agent(state_ineligible_senior)
    assert "fraud_signals" in res, "Failed Case 3: Expected fraud signal"
    signal = res["fraud_signals"][0]
    assert signal["fraud_type"] == "Fake Exemption"
    assert "Owner age is under 60" in signal["evidence"]
    print("[PASS] Case 3: Ineligible senior citizen (age < 60) flagged correctly.")

    # Case 4: Senior Citizen with missing document reference (flag expected)
    state_missing_doc = {
        "property_data": {
            "is_exempt": True,
            "exemption_type": "senior_citizen",
            "owner_age": 75,
            "exemption_document_id": None
        }
    }
    res = await exemption_audit_agent(state_missing_doc)
    assert "fraud_signals" in res, "Failed Case 4: Expected fraud signal"
    signal = res["fraud_signals"][0]
    assert "no supporting document ID" in signal["evidence"]
    print("[PASS] Case 4: Missing document ID flagged correctly.")

    # Case 5: Vacant Property with active utilities (flag expected)
    state_vacant_active_utilities = {
        "property_data": {
            "is_exempt": True,
            "exemption_type": "vacancy",
            "exemption_document_id": "DOC-9999"
        },
        "utility_records": [
            {"consumption_units": 120.5}
        ]
    }
    res = await exemption_audit_agent(state_vacant_active_utilities)
    assert "fraud_signals" in res, "Failed Case 5: Expected fraud signal"
    signal = res["fraud_signals"][0]
    assert "active utility usage" in signal["evidence"]
    print("[PASS] Case 5: Vacant property with active utilities flagged correctly.")

    # Case 6: Vacant Property with active tax history / payments (flag expected)
    state_vacant_active_tax = {
        "property_data": {
            "is_exempt": True,
            "exemption_type": "vacancy",
            "exemption_document_id": "DOC-9999"
        },
        "tax_records": [
            {"tax_paid": 5000.0}
        ],
        "payments": []
    }
    res = await exemption_audit_agent(state_vacant_active_tax)
    assert "fraud_signals" in res, "Failed Case 6: Expected fraud signal"
    signal = res["fraud_signals"][0]
    assert "active tax payment history" in signal["evidence"]
    print("[PASS] Case 6: Vacant property with active tax payments flagged correctly.")

    print("\n[SUCCESS] All Exemption Audit Agent test cases passed successfully!")

if __name__ == "__main__":
    asyncio.run(test_exemption_rules())
