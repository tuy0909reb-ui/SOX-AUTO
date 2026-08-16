"""Acquire only the frozen Batch 1 official PDFs as content-addressed sources."""
from __future__ import annotations

import hashlib
import json
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
FACTS = ROOT / "data" / "stock" / "stock_swing" / "facts_phase_a" / "facts"
SCOPE = FACTS / "financial_fact_batch1_scope.json"
OUT = ROOT / "data" / "stock" / "stock_swing" / "facts_phase_a" / "raw_external" / "financial_fact_batch1_sources"


def main() -> None:
    scope = json.loads(SCOPE.read_text(encoding="utf-8"))
    if len(scope["event_ids"]) != 8 or len(scope["documents"]) > scope["max_documents"]:
        raise RuntimeError("Batch 1 scope is not frozen at 8 Events / <=12 Documents.")
    OUT.mkdir(parents=True, exist_ok=True)
    manifest = []
    for candidate in scope["documents"]:
        request = urllib.request.Request(candidate["url"], headers={"User-Agent": "SOX-AUTO-Batch1/1.0"})
        with urllib.request.urlopen(request, timeout=60) as response:
            content = response.read()
        content_hash = hashlib.sha256(content).hexdigest()
        snapshot = OUT / f"{content_hash}.pdf"
        if not snapshot.exists():
            snapshot.write_bytes(content)
        manifest.append({**candidate, "content_hash": content_hash, "local_snapshot_path": str(snapshot.relative_to(ROOT)).replace("\\", "/")})
    (OUT / "manifest.json").write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(json.dumps({"documents": len(manifest), "events": len(scope["event_ids"])}, ensure_ascii=False))


if __name__ == "__main__":
    main()
