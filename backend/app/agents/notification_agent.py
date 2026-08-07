from app.agents.state import RevenueLeakageState


async def notification_agent(state: RevenueLeakageState) -> RevenueLeakageState:
    """Creates notification records for high and critical risk properties."""
    level = state.get("risk_level", "low")
    property_id = state.get("property_id", "unknown")
    risk_score = state.get("risk_score", 0.0)
    revenue_impact = state.get("revenue_impact_estimate", 0.0)

    if level.lower() not in {"critical", "high"}:
        state["notifications"] = []
        return state

    state["notifications"] = [
        {
            "channel": "officer_task",
            "subject": f"{level.upper()} risk property detected — ID {property_id}",
            "body": (
                f"Property {property_id} scored {risk_score}/100 ({level}).\n"
                f"Estimated revenue at risk: ₹{revenue_impact:,.0f}.\n"
                f"{state.get('recommended_action', '')}"
            ),
            "property_id": property_id,
            "risk_level": level,
        }
    ]
    return state