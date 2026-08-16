"""Dry-run only: validate adapter coverage for the frozen Batch 1 scope."""
from __future__ import annotations

import hashlib
import json
from pathlib import Path

from run_financial_fact_pilot import adapter_for_document, batch1_coverage_adapters

ROOT = Path(__file__).resolve().parents[2]
FACTS = ROOT / "data" / "stock" / "stock_swing" / "facts_phase_a" / "facts"
SCOPE = FACTS / "financial_fact_fanout_batch1_scope.json"
LEGACY_SCOPE = FACTS / "financial_fact_batch1_scope.json"


def digest(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def registry() -> dict[tuple[str | None, str, str | None, str | None], object]:
    return {
        (item.issuer, item.document_type, item.document_role, item.observation_policy): item
        for item in batch1_coverage_adapters()
    }


def main() -> None:
    if not SCOPE.is_file() or not LEGACY_SCOPE.is_file() or digest(SCOPE) != digest(LEGACY_SCOPE):
        raise RuntimeError("Frozen Batch 1 scope is missing or changed.")
    scope = json.loads(SCOPE.read_text(encoding="utf-8"))
    documents = scope["documents"]
    if len(scope["event_ids"]) != 8 or len(documents) != 8 or len(documents) > scope["max_documents"]:
        raise RuntimeError("Frozen scope cardinality is invalid.")
    if len({row["event_id"] for row in documents}) != 8:
        raise RuntimeError("Frozen scope Event identity is not unique.")
    adapters = registry()
    dispatched = []
    for document in documents:
        required = ("issuer", "document_type", "document_role", "observation_policy")
        if any(not document.get(field) for field in required):
            raise ValueError(f"missing adapter metadata: {document.get('candidate_document_id')}")
        adapter = adapter_for_document(document, adapters)
        if adapter.selectors:
            raise RuntimeError("Coverage dry-run adapter must not authorize extraction selectors.")
        dispatched.append({
            "candidate_document_id": document["candidate_document_id"],
            "issuer": adapter.issuer,
            "profile": [adapter.document_type, adapter.document_role, adapter.observation_policy],
            "status": "dispatchable_coverage_only",
        })
    print(json.dumps({
        "scope_sha256": digest(SCOPE),
        "events": len(scope["event_ids"]),
        "documents": len(documents),
        "dispatches": dispatched,
        "pdf_accessed": False,
        "observations_generated": 0,
    }, ensure_ascii=False))


if __name__ == "__main__":
    main()
