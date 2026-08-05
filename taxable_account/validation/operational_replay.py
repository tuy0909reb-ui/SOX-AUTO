"""
Phase 6 — Operational Replay Harness.

Replays scripted MarketConditions through the existing Runtime and records
State / ViewModel / Discord snapshots for operator-readability validation.

Does not modify Detection, Decision, Risk, or ViewModel decision logic.
"""

from __future__ import annotations

import json
from dataclasses import dataclass, field
from datetime import date
from pathlib import Path
from typing import Any, Callable, Optional

from taxable_account.detection.market_condition import MarketCondition
from taxable_account.detection.scripted import ScriptedDetection
from taxable_account.domain.models import MarketSignals
from taxable_account.runtime.session import RuntimeConfig, StepResult, TaxableAccountRuntime
from taxable_account.view.view_model import render_ops_text

ROOT = Path(__file__).resolve().parents[2]
DEFAULT_EVIDENCE_DIR = (
    ROOT / "data" / "common_backtest" / "reports" / "taxable_account_phase6_operational_replay"
)


def _mc(
    d: date,
    *,
    alert: bool,
    crash: bool = False,
    semi: bool = False,
    recovery_b_days: int = 0,
    prices: Optional[dict[str, float]] = None,
) -> MarketCondition:
    return MarketCondition(
        as_of=d,
        alert_on=alert,
        signals=MarketSignals(
            dd15_ma200=alert,
            crash_15=crash,
            semi_signal=semi and not crash,
            recovery_model_b_met=(not alert) and recovery_b_days >= 20,
            recovery_b_days=recovery_b_days,
        ),
        prices=prices
        or {
            "NOMURA_WORLD_SEMI": 100.0,
            "NIKKEI_LEV_1570": 1000.0,
            "SEMI_282A": 200.0,
        },
    )


@dataclass
class Snapshot:
    as_of: str
    events: list[str]
    regime: str
    position_state: str
    held_asset: str
    selected_asset: str
    decision: str
    capital_flow: dict[str, Any]
    entry_status: dict[str, Any]
    entry_timing: dict[str, Any]
    reference: dict[str, Any]
    risk: dict[str, Any]
    next_action: str
    signal: Optional[str]
    discord_content: str
    discord_fields: dict[str, str]
    ops_text: str

    def to_dict(self) -> dict[str, Any]:
        return {
            "as_of": self.as_of,
            "events": list(self.events),
            "regime": self.regime,
            "position_state": self.position_state,
            "held_asset": self.held_asset,
            "selected_asset": self.selected_asset,
            "decision": self.decision,
            "capital_flow": self.capital_flow,
            "entry_status": self.entry_status,
            "entry_timing": self.entry_timing,
            "reference": self.reference,
            "risk": self.risk,
            "next_action": self.next_action,
            "signal": self.signal,
            "discord_content": self.discord_content,
            "discord_fields": self.discord_fields,
            "ops_text": self.ops_text,
        }


@dataclass
class ScenarioResult:
    scenario_id: str
    name: str
    purpose: str
    input_period: str
    checks: list[dict[str, Any]] = field(default_factory=list)
    snapshots: list[Snapshot] = field(default_factory=list)
    state_transitions: list[str] = field(default_factory=list)
    asset_transitions: list[str] = field(default_factory=list)
    passed: bool = False
    notes: list[str] = field(default_factory=list)

    @property
    def status(self) -> str:
        return "PASS" if self.passed else "FAIL"

    def to_dict(self) -> dict[str, Any]:
        return {
            "scenario_id": self.scenario_id,
            "name": self.name,
            "purpose": self.purpose,
            "input_period": self.input_period,
            "status": self.status,
            "checks": self.checks,
            "state_transitions": self.state_transitions,
            "asset_transitions": self.asset_transitions,
            "notes": self.notes,
            "snapshots": [s.to_dict() for s in self.snapshots],
        }


def snapshot_from_step(result: StepResult) -> Snapshot:
    vm = result.view_model
    fields = {f["name"]: f["value"] for f in result.discord.embed.get("fields", [])}
    return Snapshot(
        as_of=result.as_of.isoformat(),
        events=list(result.events),
        regime=vm["current_state"]["regime"],
        position_state=vm["current_state"]["position_state"],
        held_asset=result.state["held_asset"],
        selected_asset=result.state["asset"],
        decision=vm["current_state"]["decision"],
        capital_flow=dict(vm["capital_flow"]),
        entry_status=dict(vm["entry_status"]),
        entry_timing=dict(vm["entry_timing"]),
        reference=dict(vm["reference"]),
        risk=dict(vm["risk"]),
        next_action=vm.get("next_action", ""),
        signal=vm.get("signal"),
        discord_content=result.discord.content,
        discord_fields=fields,
        ops_text=render_ops_text(vm),
    )


def _check(name: str, ok: bool, detail: str = "") -> dict[str, Any]:
    return {"name": name, "pass": bool(ok), "detail": detail}


class OperationalReplayHarness:
    """Runs a scripted date→condition map and collects evidence snapshots."""

    def __init__(
        self,
        conditions: dict[date, MarketCondition],
        *,
        config: Optional[RuntimeConfig] = None,
    ) -> None:
        self.conditions = dict(sorted(conditions.items(), key=lambda x: x[0]))
        self.config = config or RuntimeConfig(
            auto_transfer=True, auto_fill=True, auto_exit_fill=True, discord_dry_run=True
        )
        self.runtime = TaxableAccountRuntime(
            ScriptedDetection(self.conditions), config=self.config
        )

    def run(
        self,
        *,
        on_before_step: Optional[Callable[[TaxableAccountRuntime, date], None]] = None,
    ) -> list[Snapshot]:
        snaps: list[Snapshot] = []
        for d in self.conditions:
            if on_before_step is not None:
                on_before_step(self.runtime, d)
            snaps.append(snapshot_from_step(self.runtime.step(d)))
        return snaps


def _transitions(snaps: list[Snapshot], key: Callable[[Snapshot], str]) -> list[str]:
    out: list[str] = []
    prev: Optional[str] = None
    for s in snaps:
        cur = key(s)
        if prev is None:
            out.append(f"{s.as_of}: {cur}")
        elif cur != prev:
            out.append(f"{s.as_of}: {prev} → {cur}")
        prev = cur
    return out


def run_scenario_1_normal_growth() -> ScenarioResult:
    d0, d1 = date(2024, 1, 4), date(2024, 1, 5)
    prices = {
        "NOMURA_WORLD_SEMI": 110.0,
        "NIKKEI_LEV_1570": 1000.0,
        "SEMI_282A": 200.0,
    }
    # Seed Nomura entry marks on state via first step then project — Growth WAIT
    # has no forced entry_price; reference may be null unless we only check display presence.
    h = OperationalReplayHarness(
        {d0: _mc(d0, alert=False, prices=prices), d1: _mc(d1, alert=False, prices={**prices, "NOMURA_WORLD_SEMI": 112.0})}
    )
    # Attach reference-friendly state without changing decision rules
    h.runtime.state.entry_date = date(2023, 6, 1)
    h.runtime.state.entry_price = 100.0
    snaps = h.run()
    last = snaps[-1]
    checks = [
        _check("regime_growth", last.regime == "GROWTH_ACTIVE", last.regime),
        _check("asset_nomura", "野村" in last.capital_flow.get("current_asset", ""), last.capital_flow.get("current_asset")),
        _check("decision_maintain", last.decision == "MAINTAIN", last.decision),
        _check("entry_timing_na", last.entry_timing.get("status") == "N/A", str(last.entry_timing.get("status"))),
        _check(
            "next_monitoring",
            "monitoring" in last.next_action.lower() or "Alert" in last.next_action,
            last.next_action,
        ),
        _check("no_alert_events", "ALERT_ON" not in last.events and all("ALERT_ON" not in s.events for s in snaps), str(last.events)),
        _check("reference_block_present", "entry_price" in last.reference, str(last.reference)),
        _check("discord_one_screen", "Current State" in last.discord_fields and "Capital Flow" in last.discord_fields),
        _check("ops_text_readable", "特定口座 Protocol" in last.ops_text and "MAINTAIN" in last.ops_text),
    ]
    res = ScenarioResult(
        scenario_id="S1",
        name="Normal Growth",
        purpose="Verify normal Growth operation display",
        input_period=f"{d0.isoformat()} → {d1.isoformat()}",
        checks=checks,
        snapshots=snaps,
        state_transitions=_transitions(snaps, lambda s: s.regime),
        asset_transitions=_transitions(snaps, lambda s: s.capital_flow.get("current_asset", "")),
        notes=[
            "Next action vocabulary is ViewModel 2.1: 'dd15_ma200 Alert monitoring' (Growth condition monitoring).",
            "Capital flow previous/current projected from State; Growth shows 野村 as current.",
        ],
    )
    res.passed = all(c["pass"] for c in checks)
    return res


def run_scenario_2_growth_exit_transition() -> ScenarioResult:
    d0, d1 = date(2024, 2, 1), date(2024, 2, 2)
    h = OperationalReplayHarness(
        {
            d0: _mc(d0, alert=False),
            d1: _mc(d1, alert=True, crash=False, semi=False, prices={"NOMURA_WORLD_SEMI": 90, "NIKKEI_LEV_1570": 1000, "SEMI_282A": 180}),
        }
    )
    snaps = h.run()
    s0, s1 = snaps[0], snaps[1]
    checks = [
        _check("start_growth", s0.regime == "GROWTH_ACTIVE", s0.regime),
        _check("alert_on_event", "ALERT_ON" in s1.events, str(s1.events)),
        _check("transfer_event", "TRANSFER_COMPLETE" in s1.events, str(s1.events)),
        _check("end_swing", s1.regime == "SWING_ACTIVE", s1.regime),
        _check(
            "exit_reason_visible",
            "dd15" in s1.capital_flow.get("reason", "").lower()
            or "Alert" in s1.ops_text
            or "dd15" in s1.discord_fields.get("Capital Flow", ""),
            s1.capital_flow.get("reason"),
        ),
        _check(
            "next_candidate_visible",
            bool(s1.capital_flow.get("next_candidate")),
            s1.capital_flow.get("next_candidate"),
        ),
        _check("discord_capital_flow", "Capital Flow" in s1.discord_fields),
    ]
    res = ScenarioResult(
        scenario_id="S2",
        name="Growth Exit Transition",
        purpose="Verify Growth → EXIT_PENDING → SWING_ACTIVE display",
        input_period=f"{d0.isoformat()} → {d1.isoformat()}",
        checks=checks,
        snapshots=snaps,
        state_transitions=_transitions(snaps, lambda s: s.regime),
        asset_transitions=_transitions(snaps, lambda s: f"{s.held_asset}/{s.capital_flow.get('current_asset')}"),
        notes=[
            "With auto_transfer=True, EXIT_PENDING is intra-step; final snapshot is SWING_ACTIVE.",
            "ALERT_ON + TRANSFER_COMPLETE in events prove the transition path.",
        ],
    )
    res.passed = all(c["pass"] for c in checks)
    return res


def run_scenario_3_crash_recovery_entry() -> ScenarioResult:
    d0, d1, d2 = date(2024, 3, 1), date(2024, 3, 4), date(2024, 3, 5)
    prices_crash = {"NOMURA_WORLD_SEMI": 85.0, "NIKKEI_LEV_1570": 1000.0, "SEMI_282A": 170.0}
    h = OperationalReplayHarness(
        {
            d0: _mc(d0, alert=False),
            d1: _mc(d1, alert=True, crash=True, prices=prices_crash),
            d2: _mc(d2, alert=True, crash=True, prices={**prices_crash, "NIKKEI_LEV_1570": 1010.0}),
        },
        config=RuntimeConfig(auto_transfer=True, auto_fill=False, discord_dry_run=True),
    )

    def _enable_fill(rt: TaxableAccountRuntime, d: date) -> None:
        if d == d2:
            rt.config.auto_fill = True

    snaps = h.run(on_before_step=_enable_fill)
    ready = snaps[1]
    active = snaps[2]
    checks = [
        _check("swing_active", ready.regime == "SWING_ACTIVE", ready.regime),
        _check("entry_ready_status", ready.entry_status.get("status") == "READY", str(ready.entry_status)),
        _check("candidate_1570", ready.entry_status.get("candidate") == "1570", str(ready.entry_status)),
        _check("reason_crash", "crash_15" in (ready.capital_flow.get("reason") or ""), ready.capital_flow.get("reason")),
        _check("signal_entry_event", "SIGNAL_ENTRY_AVAILABLE" in ready.events, str(ready.events)),
        _check("filled", "ENTRY_FILLED" in active.events, str(active.events)),
        _check("position_active", active.position_state in ("POSITION_ACTIVE", "RISK_CONTROL_ACTIVE"), active.position_state),
        _check("asset_1570", active.held_asset == "NIKKEI_LEV_1570", active.held_asset),
        _check("discord_asset", "1570" in active.discord_content),
    ]
    res = ScenarioResult(
        scenario_id="S3",
        name="Crash Recovery Entry",
        purpose="Verify crash_15 → 1570 ENTRY_READY → POSITION_ACTIVE display",
        input_period=f"{d0.isoformat()} → {d2.isoformat()}",
        checks=checks,
        snapshots=snaps,
        state_transitions=_transitions(snaps, lambda s: f"{s.regime}/{s.position_state}"),
        asset_transitions=_transitions(snaps, lambda s: s.held_asset),
        notes=["auto_fill delayed one day to capture ENTRY_READY ViewModel snapshot."],
    )
    res.passed = all(c["pass"] for c in checks)
    return res


def run_scenario_4_1570_risk_control() -> ScenarioResult:
    d0, d1, d2 = date(2024, 4, 1), date(2024, 4, 2), date(2024, 4, 3)
    h = OperationalReplayHarness(
        {
            d0: _mc(d0, alert=False),
            d1: _mc(
                d1,
                alert=True,
                crash=True,
                prices={"NOMURA_WORLD_SEMI": 90, "NIKKEI_LEV_1570": 1000, "SEMI_282A": 180},
            ),
            d2: _mc(
                d2,
                alert=True,
                crash=True,
                prices={"NOMURA_WORLD_SEMI": 90, "NIKKEI_LEV_1570": 840, "SEMI_282A": 180},
            ),
        }
    )
    snaps = h.run()
    held = snaps[1]
    stopped = snaps[2]
    checks = [
        _check("risk_active_on_entry", held.risk.get("applicable") and held.risk.get("status") == "ACTIVE", str(held.risk)),
        _check("stop_price_085", held.risk.get("stop_price") == 850.0, str(held.risk.get("stop_price"))),
        _check("stop_triggered_event", "STOP_TRIGGERED" in stopped.events, str(stopped.events)),
        _check("exit_filled", "EXIT_FILLED" in stopped.events, str(stopped.events)),
        _check("reentry_wait", stopped.decision == "REENTRY_WAIT", stopped.decision),
        _check(
            "next_reeval",
            "Re-evaluation" in stopped.next_action or "reentry" in stopped.next_action.lower() or "Freeze" in stopped.next_action,
            stopped.next_action,
        ),
        _check("discord_risk_shown", "Risk Control" in held.discord_fields and "850" in held.discord_fields["Risk Control"]),
        _check("cash_after_exit", stopped.held_asset == "CASH", stopped.held_asset),
    ]
    res = ScenarioResult(
        scenario_id="S4",
        name="1570 Risk Control",
        purpose="Verify -15% Position Risk Stop display and REENTRY_WAIT",
        input_period=f"{d0.isoformat()} → {d2.isoformat()}",
        checks=checks,
        snapshots=snaps,
        state_transitions=_transitions(snaps, lambda s: f"{s.position_state}/{s.risk.get('status')}"),
        asset_transitions=_transitions(snaps, lambda s: s.held_asset),
        notes=["No Freeze rule changes; stop uses existing Entry×0.85 Risk Control only."],
    )
    res.passed = all(c["pass"] for c in checks)
    return res


def run_scenario_5_282a_swing() -> ScenarioResult:
    d0, d1, d2 = date(2024, 5, 1), date(2024, 5, 2), date(2024, 5, 3)
    h = OperationalReplayHarness(
        {
            d0: _mc(d0, alert=False),
            d1: _mc(
                d1,
                alert=True,
                crash=False,
                semi=True,
                prices={"NOMURA_WORLD_SEMI": 90, "NIKKEI_LEV_1570": 1000, "SEMI_282A": 200},
            ),
            d2: _mc(
                d2,
                alert=True,
                crash=False,
                semi=True,
                prices={"NOMURA_WORLD_SEMI": 90, "NIKKEI_LEV_1570": 1000, "SEMI_282A": 205},
            ),
        },
        config=RuntimeConfig(auto_transfer=True, auto_fill=False, discord_dry_run=True),
    )

    def _enable_fill(rt: TaxableAccountRuntime, d: date) -> None:
        if d == d2:
            rt.config.auto_fill = True

    snaps = h.run(on_before_step=_enable_fill)
    ready, active = snaps[1], snaps[2]
    checks = [
        _check("ready_282a", ready.entry_status.get("candidate") == "282A", str(ready.entry_status)),
        _check("ready_status", ready.entry_status.get("status") == "READY", str(ready.entry_status)),
        _check("signal_semi", ready.signal == "semi_signal", str(ready.signal)),
        _check("held_282a", active.held_asset == "SEMI_282A", active.held_asset),
        _check("next_exit_mon", "Exit monitoring" in active.next_action, active.next_action),
        _check("discord_signal", "semi_signal" in active.discord_fields.get("Current State", "") or active.signal == "semi_signal"),
    ]
    res = ScenarioResult(
        scenario_id="S5",
        name="282A Swing",
        purpose="Verify semi_signal → 282A path display",
        input_period=f"{d0.isoformat()} → {d2.isoformat()}",
        checks=checks,
        snapshots=snaps,
        state_transitions=_transitions(snaps, lambda s: f"{s.regime}/{s.position_state}"),
        asset_transitions=_transitions(snaps, lambda s: s.held_asset),
        notes=[],
    )
    res.passed = all(c["pass"] for c in checks)
    return res


def run_scenario_6_recovery_reentry() -> ScenarioResult:
    d0, d1, d2 = date(2024, 6, 3), date(2024, 6, 4), date(2024, 6, 5)
    h = OperationalReplayHarness(
        {
            d0: _mc(d0, alert=False),
            d1: _mc(
                d1,
                alert=True,
                crash=True,
                prices={"NOMURA_WORLD_SEMI": 90, "NIKKEI_LEV_1570": 1000, "SEMI_282A": 180},
            ),
            d2: _mc(
                d2,
                alert=False,
                recovery_b_days=20,
                prices={"NOMURA_WORLD_SEMI": 95, "NIKKEI_LEV_1570": 1100, "SEMI_282A": 190},
            ),
        }
    )
    snaps = h.run()
    last = snaps[-1]
    # Find any snapshot that showed Recovery COMPLETE reason if REENTRY_PENDING flashed
    # With auto recovery, final is GROWTH_ACTIVE; capital flow reason becomes Growth維持
    checks = [
        _check("alert_off", "ALERT_OFF" in snaps[2].events, str(snaps[2].events)),
        _check("recovery_complete_event", "RECOVERY_COMPLETE" in snaps[2].events, str(snaps[2].events)),
        _check("back_to_growth", last.regime == "GROWTH_ACTIVE", last.regime),
        _check(
            "nomura_current",
            "野村" in last.capital_flow.get("current_asset", "")
            or last.selected_asset == "NOMURA_WORLD_SEMI",
            last.capital_flow.get("current_asset"),
        ),
        _check(
            "decision_maintain",
            last.decision == "MAINTAIN",
            last.decision,
        ),
        _check(
            "capital_flow_visible",
            bool(last.capital_flow.get("previous_asset")) and bool(last.capital_flow.get("current_asset")),
            str(last.capital_flow),
        ),
        _check("discord_readable", "Current State" in last.discord_fields and "野村" in last.ops_text),
    ]
    res = ScenarioResult(
        scenario_id="S6",
        name="Recovery Re-entry",
        purpose="Verify return to Growth after Recovery Model B",
        input_period=f"{d0.isoformat()} → {d2.isoformat()}",
        checks=checks,
        snapshots=snaps,
        state_transitions=_transitions(snaps, lambda s: s.regime),
        asset_transitions=_transitions(snaps, lambda s: s.capital_flow.get("current_asset", "")),
        notes=[
            "REENTRY_PENDING is intra-step under auto RECOVERY_COMPLETE; events prove the path.",
            "Final display is GROWTH_ACTIVE / 野村 / MAINTAIN.",
        ],
    )
    res.passed = all(c["pass"] for c in checks)
    return res


ALL_SCENARIOS: list[Callable[[], ScenarioResult]] = [
    run_scenario_1_normal_growth,
    run_scenario_2_growth_exit_transition,
    run_scenario_3_crash_recovery_entry,
    run_scenario_4_1570_risk_control,
    run_scenario_5_282a_swing,
    run_scenario_6_recovery_reentry,
]


def run_all_scenarios() -> list[ScenarioResult]:
    return [fn() for fn in ALL_SCENARIOS]


def write_evidence(
    results: list[ScenarioResult],
    *,
    evidence_dir: Path = DEFAULT_EVIDENCE_DIR,
) -> Path:
    evidence_dir.mkdir(parents=True, exist_ok=True)
    summary = {
        "phase": "6",
        "title": "Operational Replay Validation",
        "overall": "PASS" if all(r.passed for r in results) else "FAIL",
        "scenarios": [
            {
                "id": r.scenario_id,
                "name": r.name,
                "status": r.status,
                "checks_passed": sum(1 for c in r.checks if c["pass"]),
                "checks_total": len(r.checks),
            }
            for r in results
        ],
    }
    (evidence_dir / "summary.json").write_text(
        json.dumps(summary, ensure_ascii=False, indent=2), encoding="utf-8"
    )
    for r in results:
        (evidence_dir / f"{r.scenario_id}_{r.name.replace(' ', '_').lower()}.json").write_text(
            json.dumps(r.to_dict(), ensure_ascii=False, indent=2), encoding="utf-8"
        )
        # transition log
        lines = [
            f"# {r.scenario_id} {r.name} — {r.status}",
            f"Period: {r.input_period}",
            "",
            "## State transitions",
            *r.state_transitions,
            "",
            "## Asset transitions",
            *r.asset_transitions,
            "",
            "## Checks",
        ]
        for c in r.checks:
            mark = "PASS" if c["pass"] else "FAIL"
            lines.append(f"- [{mark}] {c['name']}: {c.get('detail', '')}")
        lines += ["", "## Final Discord content", r.snapshots[-1].discord_content if r.snapshots else ""]
        (evidence_dir / f"{r.scenario_id}_transitions.log").write_text(
            "\n".join(lines) + "\n", encoding="utf-8"
        )
    return evidence_dir
