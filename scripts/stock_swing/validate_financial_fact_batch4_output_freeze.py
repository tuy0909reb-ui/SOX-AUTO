"""Validate the immutable Batch 4 output-freeze manifest without mutation."""
from __future__ import annotations

import hashlib
import json
from pathlib import Path
from typing import Any

from validate_financial_fact_pilot import validate_observation_document_traceability


ROOT = Path(__file__).resolve().parents[2]
FACTS = ROOT / "data" / "stock" / "stock_swing" / "facts_phase_a" / "facts"
MANIFEST = FACTS / "financial_fact_fanout_batch4_output_freeze_001.json"
MANIFEST_SHA = FACTS / "financial_fact_fanout_batch4_output_freeze_001.sha256"
EXPECTED_MANIFEST_SHA = "2366f53ffc6d687b8ed5f1f515d97be167827f29e6fb65aa93acb56e9d939473"


def digest(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def read_json(path: Path) -> dict[str, Any]:
    return json.loads(path.read_text(encoding="utf-8"))


def verify_digests(entries: dict[str, str]) -> None:
    for relative_path, expected in entries.items():
        path = ROOT / relative_path
        if not path.is_file() or digest(path) != expected:
            raise ValueError(f"freeze digest mismatch: {relative_path}")


def validate_batch4_output_freeze() -> dict[str, Any]:
    if digest(MANIFEST) != EXPECTED_MANIFEST_SHA:
        raise ValueError("output freeze manifest SHA mismatch")
    if MANIFEST_SHA.read_text(encoding="utf-8").split()[0] != EXPECTED_MANIFEST_SHA:
        raise ValueError("recorded output freeze manifest SHA mismatch")

    manifest = read_json(MANIFEST)
    scope = manifest["scope"]
    scope_path = ROOT / scope["path"]
    if not scope_path.is_file() or digest(scope_path) != scope["sha256"]:
        raise ValueError("frozen Scope digest mismatch")
    recorded_scope = ROOT / scope["recorded_sha_path"]
    if not recorded_scope.is_file() or digest(recorded_scope) != scope["recorded_sha_file_sha256"]:
        raise ValueError("recorded Scope SHA file mismatch")
    if recorded_scope.read_text(encoding="utf-8").split()[0] != scope["sha256"]:
        raise ValueError("Scope SHA text does not match Scope digest")

    verify_digests(manifest["implementation_digests"])
    for record_key in ("execution_record", "acceptance_record"):
        entry = manifest[record_key]
        path = ROOT / entry["path"]
        if not path.is_file() or digest(path) != entry["sha256"]:
            raise ValueError(f"{record_key} digest mismatch")

    output = ROOT / manifest["output_namespace"]
    actual_files = {path.name for path in output.iterdir() if path.is_file()}
    if actual_files != set(manifest["output_digests"]):
        raise ValueError("frozen output file set mismatch")
    for name, expected in manifest["output_digests"].items():
        if digest(output / name) != expected:
            raise ValueError(f"frozen output digest mismatch: {name}")

    scope_document_ids = {
        row["candidate_document_id"] for row in read_json(scope_path)["documents"]
    }
    manifest_document_ids = {row["document_id"] for row in manifest["document_references"]}
    if scope_document_ids != manifest_document_ids or len(manifest_document_ids) != 3:
        raise ValueError("manifest Document references drifted from frozen Scope")

    summary = read_json(output / "summary.json")
    expected_counts = manifest["target"]
    if (
        summary["events"] != expected_counts["event_count"]
        or summary["documents"] != expected_counts["document_count"]
        or summary["observations_generated"] != expected_counts["observation_count"]
        or summary["financial_facts_generated"] != expected_counts["financial_fact_count"]
        or summary["scope_sha256"] != scope["sha256"]
        or summary["scope_sha_status"] != "UNCHANGED"
    ):
        raise ValueError("frozen output summary does not match manifest")

    validate_observation_document_traceability(
        output,
        output / "financial_observation.jsonl",
        output / "financial_observation_source_link.jsonl",
        require_document_source_links=True,
    )
    expected_boundaries = {
        "batch0_3_read_only": True,
        "v002_merge": False,
        "event_sot_mutated": False,
        "gemini_input": False,
        "output_is_additive": True,
        "analysis_authorized": False,
        "ranking_authorized": False,
        "trading_authorized": False,
        "pfos_authorized": False,
        "decision_authorized": False,
        "commit_authorized": False,
    }
    if manifest["boundaries"] != expected_boundaries:
        raise ValueError("freeze boundary flags drifted")

    return {
        "manifest_sha256": EXPECTED_MANIFEST_SHA,
        "scope_sha256": scope["sha256"],
        "output_file_count": len(actual_files),
        "output_digests": "PASS",
        "implementation_digests": "PASS",
        "record_digests": "PASS",
        "provenance": "PASS",
        "namespace_boundaries": "PASS",
        "commit_authorized": False,
    }


if __name__ == "__main__":
    print(json.dumps(validate_batch4_output_freeze(), ensure_ascii=False, indent=2))
