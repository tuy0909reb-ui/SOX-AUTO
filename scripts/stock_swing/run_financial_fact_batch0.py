"""Execute only Batch 0: rerun and verify the fixed seven-document Pilot."""
from __future__ import annotations

import hashlib
import json
from pathlib import Path

from run_financial_fact_pilot import FACTS, LEDGER, OUTPUT, EXPECTED_LEDGER_SHA, main as run_pilot
from validate_financial_fact_pilot import validate_observation_document_traceability


IMMUTABLE = (
    LEDGER,
    FACTS / "official_earnings_event.jsonl",
    FACTS / "event_reconciliation.jsonl",
    FACTS / "financial_observation.jsonl",
    FACTS / "financial_document_inventory.jsonl",
    FACTS / "financial_document_link.jsonl",
    FACTS / "financial_document_source_link.jsonl",
)


def digest(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def output_digests() -> dict[str, str]:
    return {
        path.name: digest(path)
        for path in sorted(OUTPUT.glob("*.jsonl"))
    }


def main() -> None:
    before = {str(path): digest(path) for path in IMMUTABLE}
    if before[str(LEDGER)] != EXPECTED_LEDGER_SHA:
        raise RuntimeError("Gemini raw SHA mismatch before Batch 0.")
    run_pilot()
    first = output_digests()
    run_pilot()
    second = output_digests()
    if first != second:
        raise RuntimeError("Batch 0 is not idempotent for identical Inventory Documents.")
    after = {str(path): digest(path) for path in IMMUTABLE}
    if after != before:
        raise RuntimeError("Batch 0 changed an immutable baseline relation.")
    validate_observation_document_traceability(
        FACTS,
        OUTPUT / "financial_observation.jsonl",
        OUTPUT / "financial_observation_source_link.jsonl",
        require_document_source_links=True,
    )
    summary = json.loads((OUTPUT / "summary.json").read_text(encoding="utf-8"))
    print(json.dumps({
        "batch": 0,
        "documents": summary["document_count"],
        "events": len(json.loads((FACTS / "financial_fact_pilot_scope.json").read_text(encoding="utf-8"))["event_ids"]),
        "observations": summary["observation_count"],
        "idempotent": True,
        "provenance": "verified",
        "gemini_raw_sha256": before[str(LEDGER)],
    }, ensure_ascii=False))


if __name__ == "__main__":
    main()
