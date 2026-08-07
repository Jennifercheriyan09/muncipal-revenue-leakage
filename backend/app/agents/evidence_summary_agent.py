"""Evidence Summary Agent — deterministic, rule-based investigation report generator.

Replaced Groq LLM with the rule-based Evidence Builder (evidence_builder.py).
The output is a structured dict with top-level fields that the API can expose
directly; no JSON parsing required on the frontend.

All fraud detection, revenue impact, and risk scoring logic is unchanged.
"""

import logging

from app.agents.evidence_builder import build_evidence_summary
from app.agents.state import RevenueLeakageState

logger = logging.getLogger(__name__)


async def evidence_summary_agent(state: RevenueLeakageState) -> dict:
    """Generates a structured investigation report from collected fraud signals.

    Delegates entirely to the rule-based Evidence Builder — no LLM calls,
    no network I/O, fully deterministic and synchronous under the hood.

    Returns a flat dict whose keys are merged into the shared pipeline state
    by LangGraph.
    """
    result = build_evidence_summary(state)
    logger.debug(
        "evidence_summary_agent: property=%s risk=%s signals=%d",
        state.get("property_id"),
        result.get("risk_level"),
        len(state.get("fraud_signals") or []),
    )
    return result
