"""P1 operational protocol loader + gate helpers (additive)."""
from __future__ import annotations

import hashlib
import json
from collections import defaultdict
from dataclasses import dataclass
from pathlib import Path
from typing import Any

PROTOCOL_ID = "c1c2_p1_earnings_blackout_v001"
EXPECTED_PROTOCOL_SHA256 = "6a8bb7ef30e2aa2b434584bbeb9d12eef85b079f1fe4fcc8c1e9d050df0877a2"
EXPECTED_EARNINGS_SHA256 = "7dbfee8e473209daabe855245c955fd5d7b28dfd1638e284715a70e00bf35aec"
PROTOCOL_REL = Path("data/stock/stock_swing/analysis_phase_a/protocols") / f"{PROTOCOL_ID}.json"
EARNINGS_REL = Path("data/stock/stock_swing/facts_phase_a/facts/official_earnings_event.jsonl")
ACTIVE_POSTURE_REL = Path("data/stock/stock_swing/analysis_phase_a/ops/active_ops_posture_v001.json")
LOCK_RECORD_ID = "SWING-C1C2-P1-PROTOCOL-LOCK-001"
SPEC_ID = "SWING-C1C2-P1-OPERATIONAL-PROTOCOL-SPEC-001"


class P1ProtocolIntegrityError(RuntimeError):
    """Fail-closed: pinned digests or required fields do not match Lock."""


@dataclass(frozen=True)
class OfficialEvent:
    security_id: str
    announcement_date: str
    event_id: str | None
    timestamp_quality: str
    announcement_date_provenance_status: str | None


def sha256_bytes(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()


def sha256_file(path: Path) -> str:
    """Hash file bytes with newline normalization (CRLF/CR → LF).

    Windows ``core.autocrlf=true`` can rewrite Official SoT JSONL to CRLF on
    checkout without ``git status`` showing a change. Digest compare must follow
    the LF-pinned Lock content, not platform line endings.
    """
    data = path.read_bytes().replace(b"\r\n", b"\n").replace(b"\r", b"\n")
    return sha256_bytes(data)


def protocol_body_sha256(protocol: dict[str, Any]) -> str:
    body = {k: v for k, v in protocol.items() if k != "protocol_sha256"}
    text = json.dumps(body, ensure_ascii=False, indent=2, sort_keys=True) + "\n"
    return sha256_bytes(text.encode("utf-8"))


def load_pinned_protocol(root: Path) -> dict[str, Any]:
    path = root / PROTOCOL_REL
    if not path.is_file():
        raise P1ProtocolIntegrityError(f"missing pinned protocol: {path.as_posix()}")
    protocol = json.loads(path.read_text(encoding="utf-8"))
    if protocol.get("protocol_id") != PROTOCOL_ID:
        raise P1ProtocolIntegrityError(
            f"protocol_id mismatch: got {protocol.get('protocol_id')!r} expected {PROTOCOL_ID!r}"
        )
    got_sha = protocol.get("protocol_sha256")
    calc_sha = protocol_body_sha256(protocol)
    if got_sha != EXPECTED_PROTOCOL_SHA256 or calc_sha != EXPECTED_PROTOCOL_SHA256:
        raise P1ProtocolIntegrityError(
            "protocol digest mismatch — require new Pin Auth "
            f"(embedded={got_sha} calc={calc_sha} expected={EXPECTED_PROTOCOL_SHA256})"
        )
    gate = protocol.get("earnings_blackout_gate") or {}
    if not gate.get("enabled"):
        raise P1ProtocolIntegrityError("earnings_blackout_gate.enabled must be true for P1")
    if gate.get("same_episode_reentry") != "forbidden":
        raise P1ProtocolIntegrityError("same_episode_reentry must be forbidden")
    if gate.get("c1_weight_policy") != "keep_slots":
        raise P1ProtocolIntegrityError("c1_weight_policy must be keep_slots")
    if gate.get("timestamp_quality_accepted") != "date_only":
        raise P1ProtocolIntegrityError("timestamp_quality_accepted must be date_only")
    if gate.get("datetime_confirmed_required") is not False:
        raise P1ProtocolIntegrityError("datetime_confirmed_required must be false")
    if gate.get("sot_sha256") != EXPECTED_EARNINGS_SHA256:
        raise P1ProtocolIntegrityError(
            f"gate sot_sha256 mismatch: {gate.get('sot_sha256')} != {EXPECTED_EARNINGS_SHA256}"
        )
    forbidden = set(protocol.get("forbidden") or [])
    for item in (
        "feature_conditional_reentry",
        "overwrite_sealed_p0",
        "tier_a_or_n225_rule_lock",
    ):
        if item not in forbidden:
            raise P1ProtocolIntegrityError(f"forbidden list missing {item}")
    if protocol.get("does_not_overwrite_sealed") is not True:
        raise P1ProtocolIntegrityError("does_not_overwrite_sealed must be true")
    return protocol


def verify_earnings_sot(root: Path, protocol: dict[str, Any] | None = None) -> str:
    path = root / EARNINGS_REL
    if not path.is_file():
        raise P1ProtocolIntegrityError(f"missing Official earnings SoT: {path.as_posix()}")
    digest = sha256_file(path)
    expected = EXPECTED_EARNINGS_SHA256
    if protocol is not None:
        expected = (protocol.get("earnings_blackout_gate") or {}).get("sot_sha256") or expected
    if digest != expected:
        raise P1ProtocolIntegrityError(
            "Official earnings digest mismatch — fail-closed / require new Pin Auth "
            f"(got={digest} expected={expected})"
        )
    return digest


def load_official_events(root: Path) -> list[OfficialEvent]:
    verify_earnings_sot(root)
    path = root / EARNINGS_REL
    out: list[OfficialEvent] = []
    for line in path.read_text(encoding="utf-8").splitlines():
        if not line.strip():
            continue
        r = json.loads(line)
        sid = str(r.get("security_id") or "")
        ad = r.get("announcement_date")
        if not sid or not isinstance(ad, str):
            continue
        tq = str(r.get("timestamp_quality") or "date_only")
        out.append(
            OfficialEvent(
                security_id=sid,
                announcement_date=ad,
                event_id=r.get("event_id"),
                timestamp_quality=tq,
                announcement_date_provenance_status=r.get("announcement_date_provenance_status"),
            )
        )
    return out


def dates_by_security(events: list[OfficialEvent]) -> dict[str, list[str]]:
    by: dict[str, list[str]] = defaultdict(list)
    for e in events:
        by[e.security_id].append(e.announcement_date)
    return {sid: sorted(set(ds)) for sid, ds in by.items()}


def event_index(events: list[OfficialEvent]) -> dict[tuple[str, str], OfficialEvent]:
    idx: dict[tuple[str, str], OfficialEvent] = {}
    for e in events:
        idx.setdefault((e.security_id, e.announcement_date), e)
    return idx


def first_blackout_in_window(dates: list[str], entry: str, exec_exit: str) -> str | None:
    hits = [d for d in dates if entry <= d <= exec_exit]
    return hits[0] if hits else None


def keep_slot_weights(protocol: dict[str, Any], active: dict[str, bool]) -> dict[str, float]:
    weights = dict(((protocol.get("c1") or {}).get("weights") or {}))
    return {sid: float(weights.get(sid, 0.0)) for sid in weights}


def evaluate_name_episode(
    *,
    leg: str,
    security_id: str,
    entry: str,
    exec_exit: str,
    as_of: str,
    announcement_dates: list[str],
    event_lookup: dict[tuple[str, str], OfficialEvent],
    held: bool | None,
) -> dict[str, Any]:
    d_exit = first_blackout_in_window(announcement_dates, entry, exec_exit)
    in_window = entry <= as_of <= exec_exit
    ev = event_lookup.get((security_id, d_exit)) if d_exit else None
    quality = ev.timestamp_quality if ev else None
    provenance = ev.announcement_date_provenance_status if ev else None

    action = "OUT_OF_EPISODE"
    reason = "as_of outside episode window"
    if in_window:
        if d_exit is None:
            action = "HOLD_TO_X1"
            reason = "no Official announcement in [entry, exec_exit]"
        elif as_of < d_exit:
            action = "HOLD_UNTIL_BLACKOUT"
            reason = f"blackout scheduled at D Open {d_exit}"
        elif as_of == d_exit:
            action = "EXIT_AT_OPEN"
            reason = "earnings_blackout"
        else:
            action = "IDLE_KEEP_SLOT"
            reason = "post-blackout same-episode reentry forbidden"

    if held is False and action == "EXIT_AT_OPEN":
        action = "BLACKOUT_DAY_NOT_HELD"
        reason = "announcement day but name not in provided holdings"

    return {
        "leg": leg,
        "security_id": security_id,
        "episode_entry": entry,
        "exec_exit": exec_exit,
        "as_of": as_of,
        "in_episode_window": in_window,
        "blackout_exit_day": d_exit,
        "action": action,
        "action_reason": reason,
        "exit_reason": (
            "earnings_blackout"
            if action in ("EXIT_AT_OPEN", "BLACKOUT_DAY_NOT_HELD")
            else None
        ),
        "same_episode_reentry": "forbidden",
        "c1_weight_policy": "keep_slots",
        "timestamp_quality": quality or "date_only",
        "datetime_confirmed_claimed": False,
        "announcement_date_provenance_status": provenance,
        "event_id": ev.event_id if ev else None,
        "held": held,
    }


def build_ops_actions(
    *,
    protocol: dict[str, Any],
    events: list[OfficialEvent],
    as_of: str,
    c1_episodes: list[dict[str, Any]],
    c2_episodes: list[dict[str, Any]],
    holdings: set[str] | None = None,
) -> dict[str, Any]:
    by_dates = dates_by_security(events)
    lookup = event_index(events)
    c1_names = list((protocol.get("c1") or {}).get("names") or [])
    c2_names = list((protocol.get("c2") or {}).get("names") or [])
    rows: list[dict[str, Any]] = []

    for ep in c1_episodes:
        entry, x1 = ep["entry"], ep["exec_exit"]
        if not (entry <= as_of <= x1):
            continue
        for sid in c1_names:
            held = None if holdings is None else sid in holdings
            rows.append(
                evaluate_name_episode(
                    leg="C1",
                    security_id=sid,
                    entry=entry,
                    exec_exit=x1,
                    as_of=as_of,
                    announcement_dates=by_dates.get(sid, []),
                    event_lookup=lookup,
                    held=held,
                )
            )

    for ep in c2_episodes:
        entry, x1 = ep["entry"], ep["exec_exit"]
        if not (entry <= as_of <= x1):
            continue
        for sid in c2_names:
            held = None if holdings is None else sid in holdings
            rows.append(
                evaluate_name_episode(
                    leg="C2",
                    security_id=sid,
                    entry=entry,
                    exec_exit=x1,
                    as_of=as_of,
                    announcement_dates=by_dates.get(sid, []),
                    event_lookup=lookup,
                    held=held,
                )
            )

    must_exit = [r for r in rows if r["action"] == "EXIT_AT_OPEN"]
    keep_idle = [r for r in rows if r["action"] == "IDLE_KEEP_SLOT"]
    upcoming = [r for r in rows if r["action"] == "HOLD_UNTIL_BLACKOUT"]
    hold_x1 = [r for r in rows if r["action"] == "HOLD_TO_X1"]
    active_flags = {
        r["security_id"]: r["action"] in ("HOLD_TO_X1", "HOLD_UNTIL_BLACKOUT")
        for r in rows
        if r["leg"] == "C1"
    }

    commander: list[dict[str, Any]] = []
    for r in must_exit:
        commander.append(
            {
                "priority": 1,
                "judgment": "EXIT_NOW_AT_OPEN",
                "security_id": r["security_id"],
                "leg": r["leg"],
                "reason": "earnings_blackout",
                "detail": f"{r['security_id']} Official announcement_date == as_of; D Open exit",
            }
        )
    for r in keep_idle:
        commander.append(
            {
                "priority": 2,
                "judgment": "DO_NOT_REENTER",
                "security_id": r["security_id"],
                "leg": r["leg"],
                "reason": "same_episode_reentry_forbidden",
                "detail": f"post blackout {r['blackout_exit_day']}; wait next episode Entry",
            }
        )
    if not commander and (hold_x1 or upcoming):
        commander.append(
            {
                "priority": 3,
                "judgment": "HOLD_PEACETIME",
                "security_id": None,
                "leg": None,
                "reason": "no_blackout_action_today",
                "detail": "no D Open exit required today under P1",
            }
        )
    if not rows:
        commander.append(
            {
                "priority": 3,
                "judgment": "NO_ACTIVE_EPISODE",
                "security_id": None,
                "leg": None,
                "reason": "idle",
                "detail": "as_of not inside any C1/C2 episode window",
            }
        )

    return {
        "as_of": as_of,
        "protocol_id": PROTOCOL_ID,
        "posture": "P1",
        "timestamp_quality_accepted": "date_only",
        "datetime_confirmed_claimed": False,
        "c1_weight_policy": "keep_slots",
        "same_episode_reentry": "forbidden",
        "holdings_mode": "universe_episodes" if holdings is None else "explicit_holdings",
        "rows": rows,
        "must_exit_at_open": must_exit,
        "idle_keep_slots": keep_idle,
        "upcoming_blackouts": upcoming,
        "hold_to_x1": hold_x1,
        "c1_keep_slot_weights": keep_slot_weights(protocol, active_flags),
        "c1_active_flags": active_flags,
        "commander_actions": sorted(commander, key=lambda x: x["priority"]),
    }


def active_ops_posture_document(
    *,
    protocol: dict[str, Any],
    earnings_sha256: str,
    generated_at: str,
) -> dict[str, Any]:
    return {
        "registry_id": "active_ops_posture_v001",
        "operational_default_posture": "P1",
        "protocol_id": PROTOCOL_ID,
        "protocol_path": PROTOCOL_REL.as_posix(),
        "protocol_sha256": EXPECTED_PROTOCOL_SHA256,
        "earnings_sot_path": EARNINGS_REL.as_posix(),
        "earnings_sha256": earnings_sha256,
        "lock_record_id": LOCK_RECORD_ID,
        "spec_id": SPEC_ID,
        "auth_id": protocol.get("auth_id"),
        "does_not_overwrite_sealed": True,
        "datetime_confirmed_claimed": False,
        "timestamp_quality_accepted": "date_only",
        "same_episode_reentry": "forbidden",
        "c1_weight_policy": "keep_slots",
        "fail_closed_on_digest_mismatch": True,
        "forbidden_without_new_auth": list(protocol.get("forbidden") or []),
        "consumers": [
            "scripts/stock_swing/run_swing_c1c2_p1_ops_gate_daily_v001.py",
            "scripts/stock_swing/p1_protocol_ops_v001.py",
        ],
        "non_consumers": [
            "taxable_account Discord ASA bots",
            "pfos Decision OS",
            "portfolio Fact/Position warehouse",
            "Sealed P0 sealed_protocol.json",
        ],
        "generated_at": generated_at,
        "status": "ACTIVE",
    }


def assert_no_datetime_confirmed_claim(payload: dict[str, Any]) -> None:
    blob = json.dumps(payload, ensure_ascii=False).lower()
    if '"datetime_confirmed_claimed": true' in blob:
        raise P1ProtocolIntegrityError("datetime_confirmed claim forbidden under P1 Lock L2")
