"""Canonical additive Financial Fact contracts for pilot preparation.

These schemas describe Fact relations only. They do not authorize collection
outside the bounded pilot or modify Event/Gemini source-of-truth relations.
"""
from __future__ import annotations

from typing import Any

MEASURE_KINDS = (
    "actual", "company_forecast", "prior_forecast", "revised_forecast",
    "consensus", "management_target", "review_value", "other",
)
PERIOD_BASIS = (
    "Q1_standalone", "Q2_standalone", "Q3_standalone",
    "Q1_cumulative", "Q2_cumulative", "Q3_cumulative",
    "full_year", "forecast_only", "revision_only", "other", "unknown",
)
REVISION_DIRECTIONS = ("up", "down", "unchanged", "mixed", "unknown")
DOCUMENT_TYPES = (
    "earnings_release", "forecast_revision", "earnings_presentation",
    "supplementary", "other",
)
DOCUMENT_ROLES = (
    "primary_result", "forecast_detail", "revision_detail",
    "presentation_context", "restatement_or_review", "other",
)
FORECAST_SCOPES = ("next_quarter", "interim", "full_year", "multi_year", "other", "unknown")
GUIDANCE_STATUSES = ("active", "revised", "deferred", "postponed", "withdrawn", "not_applicable", "unknown")
REVISION_RELATIONS = (
    "none", "in_document", "companion_document", "predecessor_chain",
    "newly_disclosed", "unknown",
)
OBSERVATION_POLICIES = (
    "eligible", "deferred_outlook_no_company_forecast",
    "review_only_no_auto_merge", "repair_evidence_only",
)
RECONCILIATION_STATUSES = (
    "exact", "candidate", "conflict", "official_only", "gemini_only", "unresolved",
)
TIMESTAMP_QUALITIES = ("datetime_confirmed", "date_only", "unknown_time")


def object_schema(
    required: list[str],
    enums: dict[str, tuple[str, ...]] | None = None,
    optional: tuple[str, ...] = (),
) -> dict[str, Any]:
    properties = {field: {} for field in (*required, *optional)}
    for field, values in (enums or {}).items():
        properties[field] = {"enum": list(values)}
    return {
        "type": "object",
        "additionalProperties": False,
        "required": required,
        "properties": properties,
    }


def financial_fact_schemas() -> dict[str, dict[str, Any]]:
    return {
        "financial_observation": object_schema(
            [
                "observation_id", "event_id", "security_id", "metric_name",
                "metric_name_raw", "value_numeric", "raw_value_text", "currency",
                "unit_code", "source_unit_raw", "value_conversion_rule_id",
                "measure_kind", "period_basis", "consolidation",
                "accounting_standard", "fiscal_year_label", "fiscal_period_end",
                "event_fiscal_period_end", "as_of_date", "as_of_timestamp",
                "document_publication_date", "document_publication_time",
                "document_timestamp_quality", "observation_effective_date",
                "source_id", "source_document_id", "source_page", "source_table",
                "consolidation_evidence_text", "accounting_standard_evidence_text",
                "extraction_method", "quality_status",
            ],
            {
                "measure_kind": MEASURE_KINDS,
                "period_basis": PERIOD_BASIS,
                "document_timestamp_quality": TIMESTAMP_QUALITIES,
                "forecast_scope": FORECAST_SCOPES,
                "guidance_status": GUIDANCE_STATUSES,
                "revision_relation": REVISION_RELATIONS,
            },
            (
                "forecast_scope", "guidance_status", "revision_relation",
                "source_row", "source_column",
            ),
        ),
        "guidance_revision_observation": object_schema(
            [
                "revision_id", "event_id", "security_id", "metric_name",
                "prior_forecast_observation_id", "revised_forecast_observation_id",
                "direction_normalized", "direction_raw", "source_id",
                "source_document_id", "quality_status",
            ],
            {"direction_normalized": REVISION_DIRECTIONS},
        ),
        "financial_observation_reconciliation": object_schema(
            [
                "reconciliation_id", "observation_id", "event_id",
                "gemini_raw_row_id", "gemini_value_text",
                "official_value_numeric", "official_unit_code", "match_status",
                "difference_note",
            ],
            {"match_status": RECONCILIATION_STATUSES},
        ),
        "financial_document_inventory": object_schema(
            [
                "inventory_document_id", "document_id", "event_id", "security_id",
                "document_type", "publication_date", "publication_time",
                "timestamp_quality", "url", "content_hash", "local_snapshot_path",
                "source_id", "source_priority", "provider", "inventory_scope",
                "duplicate_group_id", "quality_status",
            ],
            {
                "document_type": DOCUMENT_TYPES,
                "timestamp_quality": TIMESTAMP_QUALITIES,
                "document_role": DOCUMENT_ROLES,
                "observation_policy": OBSERVATION_POLICIES,
            },
            (
                "document_role", "related_document_id", "title_raw",
                "document_identity_key", "link_status", "link_reason",
                "retrieved_at", "issuer", "observation_policy",
            ),
        ),
        "financial_document_link": object_schema(
            [
                "document_link_id", "document_id", "related_document_id",
                "link_type", "evidence_text", "quality_status",
            ],
        ),
        "financial_document_source_link": object_schema(
            [
                "document_source_link_id", "document_id", "source_id",
                "relation_type", "quality_status",
            ],
        ),
        "financial_guidance_status": object_schema(
            [
                "guidance_id", "document_id", "event_id", "forecast_scope",
                "period_basis", "guidance_status", "evidence_text", "quality_status",
            ],
            {
                "forecast_scope": FORECAST_SCOPES,
                "period_basis": PERIOD_BASIS,
                "guidance_status": GUIDANCE_STATUSES,
            },
        ),
        "financial_observation_source_link": object_schema(
            [
                "observation_source_link_id", "observation_id", "document_id",
                "source_id", "link_role", "source_page", "source_table",
                "evidence_text", "quality_status",
            ],
        ),
        "financial_observation_taxonomy_migration": object_schema(
            [
                "migration_id", "observation_id", "prior_measure_kind",
                "proposed_measure_kind", "reason", "source_id", "quality_status",
            ],
        ),
        "official_event_axis_repair": object_schema(
            [
                "repair_id", "event_id", "field_name", "prior_value", "repaired_value",
                "repair_method", "repair_source_id", "repaired_at", "quality_status",
            ],
        ),
        "official_event_axis_repair_evidence": object_schema(
            [
                "repair_evidence_id", "repair_id", "observation_id",
                "observation_source_link_id", "document_id", "source_id",
                "evidence_text", "quality_status",
            ],
        ),
    }
