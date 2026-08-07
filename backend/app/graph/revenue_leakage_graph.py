from langgraph.graph import END, StateGraph

from app.agents.area_mismatch_agent import area_mismatch_agent
from app.agents.duplicate_property_agent import duplicate_property_agent
from app.agents.evidence_summary_agent import evidence_summary_agent
from app.agents.exemption_audit_agent import exemption_audit_agent
from app.agents.fraud_scoring_agent import fraud_scoring_agent
from app.agents.high_arrears_agent import high_arrears_agent
from app.agents.notification_agent import notification_agent
from app.agents.payment_analysis_agent import payment_analysis_agent
from app.agents.property_validation_agent import property_validation_agent
from app.agents.revenue_impact_agent import revenue_impact_agent
from app.agents.state import RevenueLeakageState
from app.agents.usage_verification_agent import usage_verification_agent

_graph = None


def get_revenue_leakage_graph():
    """Returns the compiled LangGraph pipeline, building it once on first call."""
    global _graph
    if _graph is None:
        _graph = _build_revenue_leakage_graph()
    return _graph


def _build_revenue_leakage_graph():
    """Builds the LangGraph pipeline with parallel fan-out and sequential tail.

    Topology:
        property_validation
            ├── area_mismatch          ─┐
            ├── usage_verification      │
            ├── exemption_audit         │  (all 6 run in parallel)
            ├── payment_analysis        │
            ├── high_arrears            │
            └── duplicate_property     ─┘
                                         └──► fraud_scoring
                                                  │
                                             revenue_impact
                                                  │
                                          evidence_summary
                                                  │
                                              notification
                                                  │
                                                END
    """
    graph = StateGraph(RevenueLeakageState)

    # Register all nodes
    graph.add_node("property_validation", property_validation_agent)
    graph.add_node("area_mismatch", area_mismatch_agent)
    graph.add_node("usage_verification", usage_verification_agent)
    graph.add_node("exemption_audit", exemption_audit_agent)
    graph.add_node("payment_analysis", payment_analysis_agent)
    graph.add_node("high_arrears", high_arrears_agent)
    graph.add_node("duplicate_property", duplicate_property_agent)
    graph.add_node("fraud_scoring", fraud_scoring_agent)
    graph.add_node("revenue_impact", revenue_impact_agent)
    graph.add_node("evidence_summary", evidence_summary_agent)
    graph.add_node("notification", notification_agent)

    # Entry point
    graph.set_entry_point("property_validation")

    # Fan OUT: property_validation → all 6 analysis agents in parallel
    graph.add_edge("property_validation", "area_mismatch")
    graph.add_edge("property_validation", "usage_verification")
    graph.add_edge("property_validation", "exemption_audit")
    graph.add_edge("property_validation", "payment_analysis")
    graph.add_edge("property_validation", "high_arrears")
    graph.add_edge("property_validation", "duplicate_property")

    # Fan IN: all 6 converge at fraud_scoring
    graph.add_edge("area_mismatch", "fraud_scoring")
    graph.add_edge("usage_verification", "fraud_scoring")
    graph.add_edge("exemption_audit", "fraud_scoring")
    graph.add_edge("payment_analysis", "fraud_scoring")
    graph.add_edge("high_arrears", "fraud_scoring")
    graph.add_edge("duplicate_property", "fraud_scoring")

    # Sequential tail
    graph.add_edge("fraud_scoring", "revenue_impact")
    graph.add_edge("revenue_impact", "evidence_summary")
    graph.add_edge("evidence_summary", "notification")
    graph.add_edge("notification", END)

    return graph.compile()
