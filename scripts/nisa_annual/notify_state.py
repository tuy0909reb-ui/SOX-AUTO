"""Idempotency log for NISA annual P0 notifies (dated keys)."""

from __future__ import annotations

import json
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

ROOT = Path(__file__).resolve().parents[2]
STATE_PATH = ROOT / "data" / "ops" / "nisa_annual_notify_sent.json"


def _empty() -> dict[str, Any]:
    return {"schema": "nisa_annual_notify_sent_v1", "sent": {}}


def load_state(path: Path = STATE_PATH) -> dict[str, Any]:
    if not path.is_file():
        return _empty()
    try:
        data = json.loads(path.read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError, TypeError):
        return _empty()
    if not isinstance(data, dict):
        return _empty()
    data.setdefault("schema", "nisa_annual_notify_sent_v1")
    data.setdefault("sent", {})
    return data


def make_key(kind: str, plan_year: int) -> str:
    return f"{plan_year}:{kind}"


def already_sent(kind: str, plan_year: int, path: Path = STATE_PATH) -> bool:
    st = load_state(path)
    return make_key(kind, plan_year) in (st.get("sent") or {})


def mark_sent(
    kind: str,
    plan_year: int,
    *,
    path: Path = STATE_PATH,
    meta: dict[str, Any] | None = None,
) -> None:
    st = load_state(path)
    sent = dict(st.get("sent") or {})
    entry = {
        "kind": kind,
        "plan_year": plan_year,
        "sent_at": datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ"),
    }
    if meta:
        entry.update(meta)
    sent[make_key(kind, plan_year)] = entry
    st["sent"] = sent
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(st, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
