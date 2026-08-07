import asyncio
from app.agents.notification_agent import notification_agent


async def run_tests():
    print("Running Notification Agent Unit Tests...\n")

    # Scenario 1: Low Risk Property (No notification should be created)
    state_1 = {
        "risk_level": "Low",
        "property_id": "PT-1001",
        "risk_score": 15.0,
        "revenue_impact_estimate": 0.0,
        "recommended_action": "Continue routine monitoring.",
        "notifications": [{"some_dummy": "data"}]  # Should be cleared
    }
    res_1 = await notification_agent(state_1)
    assert res_1["notifications"] == []
    print("[PASS] Scenario 1: Low risk property cleared notifications successfully.")

    # Scenario 2: High Risk Property (Notification should be created)
    state_2 = {
        "risk_level": "High",
        "property_id": "PT-1002",
        "risk_score": 75.0,
        "revenue_impact_estimate": 50000.0,
        "recommended_action": "Schedule field verification within 7 days.",
        "notifications": []
    }
    res_2 = await notification_agent(state_2)
    assert len(res_2["notifications"]) == 1
    notif = res_2["notifications"][0]
    assert notif["channel"] == "officer_task"
    assert "HIGH risk property detected — ID PT-1002" in notif["subject"]
    assert "scored 75.0/100" in notif["body"]
    assert "Schedule field verification within 7 days." in notif["body"]
    assert notif["property_id"] == "PT-1002"
    assert notif["risk_level"] == "High"
    print("[PASS] Scenario 2: High risk property created task notification successfully.")

    # Scenario 3: Critical Risk Property (Notification should be created)
    state_3 = {
        "risk_level": "Critical",
        "property_id": "PT-1003",
        "risk_score": 95.0,
        "revenue_impact_estimate": 150000.0,
        "recommended_action": "URGENT: Initiate field verification.",
        "notifications": []
    }
    res_3 = await notification_agent(state_3)
    assert len(res_3["notifications"]) == 1
    notif_3 = res_3["notifications"][0]
    assert "CRITICAL risk property detected" in notif_3["subject"]
    assert "scored 95.0/100" in notif_3["body"]
    assert "URGENT" in notif_3["body"]
    print("[PASS] Scenario 3: Critical risk property created task notification successfully.")

    print("\n[SUCCESS] All Notification Agent test cases passed!")


if __name__ == "__main__":
    asyncio.run(run_tests())
