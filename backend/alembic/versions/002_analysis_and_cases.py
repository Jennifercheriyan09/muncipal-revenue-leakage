"""add analysis_runs, fraud_signals, investigation_cases, case_status_history

Revision ID: 002
Revises: 001
Create Date: 2026-06-17

"""
from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

revision: str = "002"
down_revision: Union[str, None] = "3a2908f9024f"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # ── analysis_runs ─────────────────────────────────────────────────────────
    op.create_table(
        "analysis_runs",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("property_id", sa.Integer(), nullable=False),
        sa.Column("triggered_by", sa.String(50), nullable=False, server_default="api"),
        sa.Column("risk_score", sa.Float(), nullable=False, server_default="0.0"),
        sa.Column("risk_level", sa.String(20), nullable=False, server_default="low"),
        sa.Column("evidence_summary", sa.Text(), nullable=True),
        sa.Column("officer_notes", sa.Text(), nullable=True),
        sa.Column("recommended_action", sa.Text(), nullable=True),
        sa.Column("revenue_impact_estimate", sa.Float(), nullable=False, server_default="0.0"),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            nullable=False,
            server_default=sa.text("now()"),
        ),
        sa.ForeignKeyConstraint(["property_id"], ["properties.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_analysis_runs_id", "analysis_runs", ["id"])
    op.create_index("ix_analysis_runs_property_id", "analysis_runs", ["property_id"])
    op.create_index("ix_analysis_runs_created_at", "analysis_runs", ["created_at"])

    # ── fraud_signals ─────────────────────────────────────────────────────────
    op.create_table(
        "fraud_signals",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("analysis_run_id", sa.Integer(), nullable=False),
        sa.Column("fraud_type", sa.String(100), nullable=False),
        sa.Column("score_contribution", sa.Float(), nullable=False, server_default="0.0"),
        sa.Column("evidence", sa.Text(), nullable=False),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            nullable=False,
            server_default=sa.text("now()"),
        ),
        sa.ForeignKeyConstraint(["analysis_run_id"], ["analysis_runs.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_fraud_signals_id", "fraud_signals", ["id"])
    op.create_index("ix_fraud_signals_analysis_run_id", "fraud_signals", ["analysis_run_id"])

    # ── investigation_cases ───────────────────────────────────────────────────
    op.create_table(
        "investigation_cases",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("property_id", sa.Integer(), nullable=False),
        sa.Column("analysis_run_id", sa.Integer(), nullable=False),
        sa.Column("status", sa.String(50), nullable=False, server_default="new"),
        sa.Column("assigned_officer_id", sa.Integer(), nullable=True),
        sa.Column("revenue_impact_estimate", sa.Float(), nullable=False, server_default="0.0"),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            nullable=False,
            server_default=sa.text("now()"),
        ),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            nullable=False,
            server_default=sa.text("now()"),
        ),
        sa.ForeignKeyConstraint(["property_id"], ["properties.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["analysis_run_id"], ["analysis_runs.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["assigned_officer_id"], ["users.id"], ondelete="SET NULL"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_investigation_cases_id", "investigation_cases", ["id"])
    op.create_index("ix_investigation_cases_property_id", "investigation_cases", ["property_id"])
    op.create_index("ix_investigation_cases_status", "investigation_cases", ["status"])
    op.create_index(
        "ix_investigation_cases_officer_id", "investigation_cases", ["assigned_officer_id"]
    )

    # ── case_status_history ───────────────────────────────────────────────────
    op.create_table(
        "case_status_history",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("case_id", sa.Integer(), nullable=False),
        sa.Column("old_status", sa.String(50), nullable=True),
        sa.Column("new_status", sa.String(50), nullable=False),
        sa.Column("officer_id", sa.Integer(), nullable=True),
        sa.Column("remark", sa.Text(), nullable=False),
        sa.Column(
            "changed_at",
            sa.DateTime(timezone=True),
            nullable=False,
            server_default=sa.text("now()"),
        ),
        sa.ForeignKeyConstraint(["case_id"], ["investigation_cases.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["officer_id"], ["users.id"], ondelete="SET NULL"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_case_status_history_id", "case_status_history", ["id"])
    op.create_index("ix_case_status_history_case_id", "case_status_history", ["case_id"])


def downgrade() -> None:
    op.drop_table("case_status_history")
    op.drop_table("investigation_cases")
    op.drop_table("fraud_signals")
    op.drop_table("analysis_runs")