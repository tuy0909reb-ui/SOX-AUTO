"""Ops state for silicon-cycle watch cadence + notify idempotency."""

from __future__ import annotations

import json
from datetime import date, datetime, timezone
from pathlib import Path
from typing import Any, Optional

ROOT = Path(__file__).resolve().parents[2]
STATE_PATH = ROOT / "data" / "ops" / "silicon_cycle_watch.json"

SCHEMA = "silicon_cycle_watch_v1"


def default_state() -> dict[str, Any]:
    return {
        "schema": SCHEMA,
        "mode": "normal",
        "human_force_elevated": False,
        "elevated_reason": "",
        "last_materials_as_of": None,
        "last_watch_hint_elevated": False,
        "sent": {},
    }


def load_state() -> dict[str, Any]:
    if not STATE_PATH.is_file():
        return default_state()
    try:
        data = json.loads(STATE_PATH.read_text(encoding="utf-8"))
    except json.JSONDecodeError:
        return default_state()
    if not isinstance(data, dict):
        return default_state()
    out = default_state()
    out.update(data)
    out.setdefault("schema", SCHEMA)
    out.setdefault("sent", {})
    return out


def save_state(state: dict[str, Any]) -> None:
    STATE_PATH.parent.mkdir(parents=True, exist_ok=True)
    state = dict(state)
    state["schema"] = SCHEMA
    state["updated_at"] = datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")
    STATE_PATH.write_text(
        json.dumps(state, ensure_ascii=False, indent=2) + "\n", encoding="utf-8"
    )


def resolve_mode(state: dict[str, Any], *, watch_hint_elevated: bool) -> str:
    if state.get("human_force_elevated"):
        return "elevated"
    if watch_hint_elevated:
        return "elevated"
    return "normal"


def apply_materials_observation(
    state: dict[str, Any],
    *,
    as_of: date,
    watch_hint_elevated: bool,
    watch_reasons: list[str],
) -> dict[str, Any]:
    state = dict(state)
    state["last_materials_as_of"] = as_of.isoformat()
    state["last_watch_hint_elevated"] = bool(watch_hint_elevated)
    mode = resolve_mode(state, watch_hint_elevated=watch_hint_elevated)
    state["mode"] = mode
    if state.get("human_force_elevated"):
        state["elevated_reason"] = state.get("elevated_reason") or "human_force_elevated"
    elif watch_hint_elevated:
        state["elevated_reason"] = ",".join(watch_reasons) or "watch_hint"
    else:
        state["elevated_reason"] = ""
    return state


def should_notify_today(as_of: date, mode: str) -> bool:
    """normal: 1st of month; elevated: Monday."""
    if mode == "elevated":
        return as_of.weekday() == 0  # Monday
    return as_of.day == 1


def sent_key(as_of: date, mode: str) -> str:
    return f"{as_of.isoformat()}:{mode}"


def already_sent(state: dict[str, Any], as_of: date, mode: str) -> bool:
    return sent_key(as_of, mode) in (state.get("sent") or {})


def mark_sent(
    state: dict[str, Any],
    as_of: date,
    mode: str,
    *,
    meta: Optional[dict[str, Any]] = None,
) -> dict[str, Any]:
    state = dict(state)
    sent = dict(state.get("sent") or {})
    sent[sent_key(as_of, mode)] = {
        "recorded_at": datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ"),
        **(meta or {}),
    }
    state["sent"] = sent
    return state
