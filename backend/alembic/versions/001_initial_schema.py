"""initial schema

Revision ID: 001
Revises:
Create Date: 2026-06-17

"""
from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

revision: str = "001"
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Extensions
    op.execute("CREATE EXTENSION IF NOT EXISTS postgis")
    op.execute("CREATE EXTENSION IF NOT EXISTS pg_trgm")

    # ── wards ────────────────────────────────────────────────────────────────
    op.create_table(
        "wards",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("name", sa.String(255), nullable=False),
        sa.Column("code", sa.String(50), nullable=False),
        sa.Column("tax_rate_residential", sa.Float(), nullable=False, server_default="0.0"),
        sa.Column("tax_rate_commercial", sa.Float(), nullable=False, server_default="0.0"),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            nullable=False,
            server_default=sa.text("now()"),
        ),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_wards_id", "wards", ["id"])
    op.create_index("ix_wards_code", "wards", ["code"], unique=True)

    # ── users ────────────────────────────────────────────────────────────────
    op.create_table(
        "users",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("email", sa.String(255), nullable=False),
        sa.Column("hashed_password", sa.String(255), nullable=False),
        sa.Column(
            "role",
            sa.Enum("admin", "officer", "field", name="userrole"),
            nullable=False,
            server_default="officer",
        ),
        sa.Column("ward_id", sa.Integer(), nullable=True),
        sa.Column("is_active", sa.Boolean(), nullable=False, server_default="true"),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            nullable=False,
            server_default=sa.text("now()"),
        ),
        sa.ForeignKeyConstraint(["ward_id"], ["wards.id"], ondelete="SET NULL"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_users_id", "users", ["id"])
    op.create_index("ix_users_email", "users", ["email"], unique=True)
    op.create_index("ix_users_ward_id", "users", ["ward_id"])

    # ── properties ───────────────────────────────────────────────────────────
    op.create_table(
        "properties",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("property_uid", sa.String(100), nullable=False),
        sa.Column("owner_name", sa.String(255), nullable=False),
        sa.Column("address", sa.Text(), nullable=False),
        sa.Column("ward_id", sa.Integer(), nullable=True),
        sa.Column("declared_area_sq_m", sa.Float(), nullable=True),
        sa.Column("gis_area_sq_m", sa.Float(), nullable=True),
        sa.Column("usage_type", sa.String(100), nullable=True),
        sa.Column("declared_usage_type", sa.String(100), nullable=True),
        sa.Column("is_exempt", sa.Boolean(), nullable=False, server_default="false"),
        sa.Column("exemption_type", sa.String(100), nullable=True),
        sa.Column("exemption_document_id", sa.String(255), nullable=True),
        sa.Column("risk_score", sa.Float(), nullable=True),
        sa.Column("risk_level", sa.String(20), nullable=True),
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
        sa.ForeignKeyConstraint(["ward_id"], ["wards.id"], ondelete="SET NULL"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_properties_id", "properties", ["id"])
    op.create_index("ix_properties_property_uid", "properties", ["property_uid"], unique=True)
    op.create_index("ix_properties_ward_id", "properties", ["ward_id"])
    op.create_index("ix_properties_risk_score", "properties", ["risk_score"])
    op.create_index("ix_properties_risk_level", "properties", ["risk_level"])
    # GIN trigram index for fuzzy owner name search (duplicate detection in Phase 3)
    op.execute(
        "CREATE INDEX ix_properties_owner_name_trgm "
        "ON properties USING gin (owner_name gin_trgm_ops)"
    )

    # ── tax_records ──────────────────────────────────────────────────────────
    op.create_table(
        "tax_records",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("property_id", sa.Integer(), nullable=False),
        sa.Column("assessment_year", sa.Integer(), nullable=False),
        sa.Column("assessed_value", sa.Float(), nullable=False, server_default="0.0"),
        sa.Column("tax_demand", sa.Float(), nullable=False, server_default="0.0"),
        sa.Column("tax_paid", sa.Float(), nullable=False, server_default="0.0"),
        sa.Column("arrears_amount", sa.Float(), nullable=False, server_default="0.0"),
        sa.Column("last_payment_date", sa.Date(), nullable=True),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            nullable=False,
            server_default=sa.text("now()"),
        ),
        sa.ForeignKeyConstraint(["property_id"], ["properties.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("property_id", "assessment_year", name="uq_tax_property_year"),
    )
    op.create_index("ix_tax_records_id", "tax_records", ["id"])
    op.create_index("ix_tax_records_property_id", "tax_records", ["property_id"])

    # ── payments ─────────────────────────────────────────────────────────────
    op.create_table(
        "payments",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("property_id", sa.Integer(), nullable=False),
        sa.Column("amount", sa.Float(), nullable=False),
        sa.Column("payment_date", sa.Date(), nullable=False),
        sa.Column("gateway_reference", sa.String(255), nullable=True),
        sa.Column("payment_mode", sa.String(100), nullable=True),
        sa.Column("is_manual_adjustment", sa.Boolean(), nullable=False, server_default="false"),
        sa.Column("adjustment_reason", sa.Text(), nullable=True),
        sa.Column("received_by_officer_id", sa.Integer(), nullable=True),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            nullable=False,
            server_default=sa.text("now()"),
        ),
        sa.ForeignKeyConstraint(["property_id"], ["properties.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["received_by_officer_id"], ["users.id"], ondelete="SET NULL"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_payments_id", "payments", ["id"])
    op.create_index("ix_payments_property_id", "payments", ["property_id"])
    op.create_index("ix_payments_payment_date", "payments", ["payment_date"])

    # ── utility_records ──────────────────────────────────────────────────────
    op.create_table(
        "utility_records",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("property_id", sa.Integer(), nullable=False),
        sa.Column("utility_type", sa.String(50), nullable=False),
        sa.Column("bill_month", sa.String(7), nullable=False),
        sa.Column("consumption_units", sa.Float(), nullable=True),
        sa.Column("amount", sa.Float(), nullable=True),
        sa.Column("meter_number", sa.String(100), nullable=True),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            nullable=False,
            server_default=sa.text("now()"),
        ),
        sa.ForeignKeyConstraint(["property_id"], ["properties.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_utility_records_id", "utility_records", ["id"])
    op.create_index("ix_utility_records_property_id", "utility_records", ["property_id"])

    # ── trade_licenses ───────────────────────────────────────────────────────
    op.create_table(
        "trade_licenses",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("property_id", sa.Integer(), nullable=False),
        sa.Column("license_number", sa.String(255), nullable=False),
        sa.Column("business_name", sa.String(255), nullable=False),
        sa.Column("business_type", sa.String(100), nullable=True),
        sa.Column("issue_date", sa.Date(), nullable=True),
        sa.Column("expiry_date", sa.Date(), nullable=True),
        sa.Column("is_active", sa.Boolean(), nullable=False, server_default="true"),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            nullable=False,
            server_default=sa.text("now()"),
        ),
        sa.ForeignKeyConstraint(["property_id"], ["properties.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("license_number", name="uq_trade_license_number"),
    )
    op.create_index("ix_trade_licenses_id", "trade_licenses", ["id"])
    op.create_index("ix_trade_licenses_property_id", "trade_licenses", ["property_id"])
    op.create_index("ix_trade_licenses_license_number", "trade_licenses", ["license_number"])
    op.create_index("ix_trade_licenses_is_active", "trade_licenses", ["is_active"])

    # ── building_permissions ─────────────────────────────────────────────────
    op.create_table(
        "building_permissions",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("property_id", sa.Integer(), nullable=False),
        sa.Column("permission_number", sa.String(255), nullable=False),
        sa.Column("approved_area_sq_m", sa.Float(), nullable=True),
        sa.Column("approved_floors", sa.Integer(), nullable=True),
        sa.Column("approved_usage", sa.String(100), nullable=True),
        sa.Column("approval_date", sa.Date(), nullable=True),
        sa.Column("status", sa.String(50), nullable=False, server_default="approved"),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            nullable=False,
            server_default=sa.text("now()"),
        ),
        sa.ForeignKeyConstraint(["property_id"], ["properties.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("permission_number", name="uq_building_permission_number"),
    )
    op.create_index("ix_building_permissions_id", "building_permissions", ["id"])
    op.create_index(
        "ix_building_permissions_property_id", "building_permissions", ["property_id"]
    )

    # ── mutation_records ─────────────────────────────────────────────────────
    op.create_table(
        "mutation_records",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("property_id", sa.Integer(), nullable=False),
        sa.Column("old_owner", sa.String(255), nullable=True),
        sa.Column("new_owner", sa.String(255), nullable=False),
        sa.Column("mutation_date", sa.Date(), nullable=False),
        sa.Column("mutation_type", sa.String(100), nullable=True),
        sa.Column("processed_by_officer_id", sa.Integer(), nullable=True),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            nullable=False,
            server_default=sa.text("now()"),
        ),
        sa.ForeignKeyConstraint(["property_id"], ["properties.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(
            ["processed_by_officer_id"], ["users.id"], ondelete="SET NULL"
        ),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_mutation_records_id", "mutation_records", ["id"])
    op.create_index("ix_mutation_records_property_id", "mutation_records", ["property_id"])
    op.create_index("ix_mutation_records_mutation_date", "mutation_records", ["mutation_date"])


def downgrade() -> None:
    op.drop_table("mutation_records")
    op.drop_table("building_permissions")
    op.drop_table("trade_licenses")
    op.drop_table("utility_records")
    op.drop_table("payments")
    op.drop_table("tax_records")
    op.execute("DROP INDEX IF EXISTS ix_properties_owner_name_trgm")
    op.drop_table("properties")
    op.drop_table("users")
    op.execute("DROP TYPE IF EXISTS userrole")
    op.drop_table("wards")
