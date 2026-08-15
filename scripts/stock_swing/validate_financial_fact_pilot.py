"""Fail-closed relational acceptance checks for the bounded Financial Fact Pilot."""
from __future__ import annotations

import json
from pathlib import Path
from typing import Any


ROOT = Path(__file__).resolve().parents[2]
DEFAULT_FACTS = ROOT / "data" / "stock" / "stock_swing" / "facts_phase_a" / "facts"


def load_jsonl(path: Path) -> list[dict[str, Any]]:
    return [json.loads(line) for line in path.read_text(encoding="utf-8").splitlines() if line]


def validate_observation_document_traceability(facts_dir: Path = DEFAULT_FACTS) -> None:
    """Reject orphaned typed observations without a resolved primary evidence link."""
    inventory = {row["document_id"]: row for row in load_jsonl(facts_dir / "financial_document_inventory.jsonl")}
    observations = {row["observation_id"]: row for row in load_jsonl(facts_dir / "financial_observation.jsonl")}
    links = load_jsonl(facts_dir / "financial_observation_source_link.jsonl")

    primary: dict[str, list[dict[str, Any]]] = {}
    for link in links:
        if link["link_role"] == "primary_numeric_evidence":
            primary.setdefault(link["observation_id"], []).append(link)

    for observation_id, observation in observations.items():
        evidence = primary.get(observation_id, [])
        if len(evidence) != 1:
            raise ValueError(f"{observation_id}: expected exactly one primary document evidence link")
        link = evidence[0]
        document = inventory.get(link["document_id"])
        if document is None:
            raise ValueError(f"{observation_id}: document is absent from canonical inventory")
        if document["event_id"] != observation["event_id"]:
            raise ValueError(f"{observation_id}: document/event identity mismatch")
        if document["source_id"] != link["source_id"] or link["source_id"] != observation["source_id"]:
            raise ValueError(f"{observation_id}: source identity mismatch")
        if not (ROOT / document["local_snapshot_path"]).is_file():
            raise ValueError(f"{observation_id}: evidence snapshot is absent")
        if not link["evidence_text"]:
            raise ValueError(f"{observation_id}: evidence token is absent")


def main() -> None:
    validate_observation_document_traceability()
    print('{"status": "ok", "check": "observation_document_traceability"}')


if __name__ == "__main__":
    main()
