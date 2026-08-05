"""
Phase 7 — Operational Readiness Check.

Verifies daily-ops capability (data, persistence, Discord projection, manual fills,
position/risk display, transitions, errors). Does not change trading rules or
ViewModel schema.
"""

from __future__ import annotations

import json
import tempfile
from dataclasses import dataclass, field
from datetime import date
from pathlib import Path
from typing import Any, Callable, Optional

from taxable_account.detection.adapter import DetectionAdapter
from taxable_account.detection.data_loader import DS, load_market_bundle
from taxable_account.detection.market_condition import MarketCondition
from taxable_account.detection.scripted import ScriptedDetection
from taxable_account.domain.events import DomainEvent
from taxable_account.domain.models import MarketSignals, TaxableAccountState, TransitionError
from taxable_account.domain.states import Asset, PositionState, RegimeState
from taxable_account.engine import TaxableAccountEngine
from taxable_account.runtime.session import RuntimeConfig, TaxableAccountRuntime
from taxable_account.state.file_store import FileStateStore
from taxable_account.view.discord_adapter import project_discord_payload
from taxable_account.view.view_model import project_view_model, render_ops_text

ROOT = Path(__file__).resolve().parents[2]
EVIDENCE_DIR = (
    ROOT / "data" / "common_backtest" / "reports" / "taxable_account_phase7_operational_readiness"
)


@dataclass
class CheckResult:
    name: str
    ok: bool
    detail: str = ""

    def to_dict(self) -> dict[str, Any]:
        return {"name": self.name, "pass": self.ok, "detail": self.detail}


@dataclass
class ReadinessReport:
    checks: list[CheckResult] = field(default_factory=list)
    scenarios: list[dict[str, Any]] = field(default_factory=list)
    notes: list[str] = field(default_factory=list)

    @property
    def passed(self) -> bool:
        return all(c.ok for c in self.checks) and all(s.get("pass") for s in self.scenarios)

    def to_dict(self) -> dict[str, Any]:
        return {
            "phase": "7",
            "title": "Operational Readiness Check",
            "overall": "PASS" if self.passed else "FAIL",
            "checks": [c.to_dict() for c in self.checks],
            "scenarios": self.scenarios,
            "notes": self.notes,
            "freeze_recommended": bool(self.passed),
        }


def _ok(name: str, cond: bool, detail: str = "") -> CheckResult:
    return CheckResult(name=name, ok=bool(cond), detail=detail)


def _mc(
    d: date,
    *,
    alert: bool,
    crash: bool = False,
    semi: bool = False,
    prices: Optional[dict[str, float]] = None,
) -> MarketCondition:
    return MarketCondition(
        as_of=d,
        alert_on=alert,
        signals=MarketSignals(
            dd15_ma200=alert,
            crash_15=crash,
            semi_signal=semi and not crash,
            recovery_model_b_met=not alert,
            recovery_b_days=20 if not alert else 0,
        ),
        prices=prices
        or {
            "NOMURA_WORLD_SEMI": 100.0,
            "NIKKEI_LEV_1570": 1000.0,
            "SEMI_282A": 200.0,
        },
    )


def check_market_data_update() -> CheckResult:
    try:
        bundle = load_market_bundle()
        required = [
            DS / "fund_nav_daily" / "soxx_etf_nav.csv",
            DS / "swing_assets_daily" / "1570.csv",
            DS / "regime_proxies" / "n225_daily.csv",
        ]
        missing = [str(p) for p in required if not p.exists()]
        if missing:
            return _ok("market_data_update", False, f"missing: {missing}")
        g_last = bundle.growth_close.dropna().index.max()
        n_last = bundle.nikkei.dropna().index.max()
        adapter = DetectionAdapter(bundle)
        # latest available as_of must produce a condition
        as_of = adapter.frame.dropna().index.max().date()
        cond = adapter.condition_on(as_of)
        return _ok(
            "market_data_update",
            True,
            f"growth_last={g_last.date()} nikkei_last={n_last.date()} as_of={as_of} "
            f"prices={sorted(cond.prices.keys())}",
        )
    except Exception as exc:  # readiness surface
        return _ok("market_data_update", False, f"{type(exc).__name__}: {exc}")


def check_state_persistence() -> CheckResult:
    try:
        with tempfile.TemporaryDirectory() as tmp:
            path = Path(tmp) / "state.json"
            store = FileStateStore(path)
            store.state.regime_state = RegimeState.SWING_ACTIVE
            store.state.position_state = PositionState.POSITION_ACTIVE
            store.state.held_asset = Asset.NIKKEI_LEV_1570
            store.state.asset = Asset.NIKKEI_LEV_1570
            store.state.entry_price = 1000.0
            store.state.entry_date = date(2024, 4, 2)
            store.save()
            store2 = FileStateStore(path, create_if_missing=False)
            st = store2.state
            roundtrip = (
                st.regime_state == RegimeState.SWING_ACTIVE
                and st.held_asset == Asset.NIKKEI_LEV_1570
                and st.entry_price == 1000.0
                and st.entry_date == date(2024, 4, 2)
            )
            return _ok("state_persistence", roundtrip, str(path.name))
    except Exception as exc:
        return _ok("state_persistence", False, f"{type(exc).__name__}: {exc}")


def check_discord_display() -> CheckResult:
    st = TaxableAccountState(
        regime_state=RegimeState.GROWTH_ACTIVE,
        held_asset=Asset.NOMURA_WORLD_SEMI,
        asset=Asset.NOMURA_WORLD_SEMI,
        entry_date=date(2023, 1, 4),
        entry_price=100.0,
    )
    vm = project_view_model(st, current_price=110.0, as_of=date(2024, 1, 5))
    disc = project_discord_payload(vm, dry_run=True)
    fields = {f["name"] for f in disc.embed["fields"]}
    need = {
        "Current State",
        "Capital Flow",
        "Reference Numbers",
        "Risk Control",
        "Next Action",
    }
    state_val = disc.embed["fields"][0]["value"]
    ok = (
        disc.dry_run
        and need.issubset(fields)
        and ("野村" in disc.content or "MAINTAIN" in state_val or "HOLD" in disc.content)
    )
    return _ok("discord_display", ok, f"fields={sorted(fields)} dry_run={disc.dry_run}")


def check_manual_entry_recording() -> CheckResult:
    try:
        eng = TaxableAccountEngine()
        eng.on_event(DomainEvent.ALERT_ON)
        eng.on_event(DomainEvent.TRANSFER_COMPLETE)
        eng.set_signals(MarketSignals(dd15_ma200=True, crash_15=True))
        eng.on_event(DomainEvent.SIGNAL_ENTRY_AVAILABLE)
        eng.on_event(
            DomainEvent.ENTRY_FILLED,
            fill_asset=Asset.NIKKEI_LEV_1570,
            fill_price=1000.0,
            fill_date=date(2024, 3, 5),
        )
        st = eng.state
        ok = (
            st.position_state == PositionState.POSITION_ACTIVE
            and st.entry_price == 1000.0
            and st.entry_date == date(2024, 3, 5)
            and st.risk_control.stop_price == 850.0
        )
        return _ok("manual_entry_recording", ok, f"entry={st.entry_price} stop={st.risk_control.stop_price}")
    except Exception as exc:
        return _ok("manual_entry_recording", False, f"{type(exc).__name__}: {exc}")


def check_position_update() -> CheckResult:
    eng = TaxableAccountEngine()
    eng.on_event(DomainEvent.ALERT_ON)
    eng.on_event(DomainEvent.TRANSFER_COMPLETE)
    eng.set_signals(MarketSignals(dd15_ma200=True, semi_signal=True))
    eng.on_event(DomainEvent.SIGNAL_ENTRY_AVAILABLE)
    eng.on_event(
        DomainEvent.ENTRY_FILLED,
        fill_asset=Asset.SEMI_282A,
        fill_price=200.0,
        fill_date=date(2024, 5, 2),
    )
    vm = project_view_model(eng.state, current_price=210.0, as_of=date(2024, 5, 10))
    ok = (
        eng.state.held_asset == Asset.SEMI_282A
        and vm["position"] is not None
        and vm["reference"]["pnl_pct"] is not None
    )
    return _ok("position_update", ok, f"held={eng.state.held_asset.value} pnl={vm['reference']['pnl_pct']}")


def check_risk_stop_display() -> CheckResult:
    eng = TaxableAccountEngine()
    eng.on_event(DomainEvent.ALERT_ON)
    eng.on_event(DomainEvent.TRANSFER_COMPLETE)
    eng.set_signals(MarketSignals(dd15_ma200=True, crash_15=True))
    eng.on_event(DomainEvent.SIGNAL_ENTRY_AVAILABLE)
    eng.on_event(DomainEvent.ENTRY_FILLED, fill_asset=Asset.NIKKEI_LEV_1570, fill_price=1000.0)
    vm = project_view_model(eng.state, current_price=960.0, as_of=date(2024, 4, 3))
    disc = project_discord_payload(vm, dry_run=True)
    risk_field = next(f["value"] for f in disc.embed["fields"] if f["name"] == "Risk Control")
    ok = vm["risk"]["status"] == "ACTIVE" and "850" in risk_field and vm["risk"]["formula"] == "Entry × 0.85"
    return _ok("risk_stop_display", ok, risk_field.replace("\n", " | "))


def check_state_transition() -> CheckResult:
    d0, d1, d2 = date(2024, 7, 1), date(2024, 7, 2), date(2024, 7, 3)
    src = ScriptedDetection(
        {
            d0: _mc(d0, alert=False),
            d1: _mc(d1, alert=True, crash=True),
            d2: _mc(
                d2,
                alert=True,
                crash=True,
                prices={"NOMURA_WORLD_SEMI": 90, "NIKKEI_LEV_1570": 840, "SEMI_282A": 180},
            ),
        }
    )
    rt = TaxableAccountRuntime(src, config=RuntimeConfig(discord_dry_run=True))
    r0 = rt.step(d0)
    r1 = rt.step(d1)
    r2 = rt.step(d2)
    ok = (
        r0.state["regime_state"] == "GROWTH_ACTIVE"
        and r1.state["held_asset"] == "NIKKEI_LEV_1570"
        and "STOP_TRIGGERED" in r2.events
        and r2.state["position_state"] == "REENTRY_WAIT"
    )
    return _ok(
        "state_transition",
        ok,
        f"{r0.state['regime_state']}→{r1.state['held_asset']}→{r2.state['position_state']}",
    )


def check_error_handling() -> CheckResult:
    errors_ok = []
    # missing as_of in scripted detection
    try:
        ScriptedDetection({}).condition_on(date(2020, 1, 1))
        errors_ok.append(False)
    except KeyError:
        errors_ok.append(True)
    # illegal fill
    try:
        eng = TaxableAccountEngine()
        eng.on_event(DomainEvent.ENTRY_FILLED, fill_asset=Asset.NIKKEI_LEV_1570, fill_price=1000.0)
        errors_ok.append(False)
    except TransitionError:
        errors_ok.append(True)
    # discord live without webhook → error string, no crash
    st = TaxableAccountState()
    vm = project_view_model(st)
    disc = project_discord_payload(vm, dry_run=False)
    errors_ok.append(disc.error is not None and disc.sent is False)
    # missing state file
    try:
        FileStateStore(Path(tempfile.gettempdir()) / "missing_taxable_state_xyz.json", create_if_missing=False)
        errors_ok.append(False)
    except FileNotFoundError:
        errors_ok.append(True)
    return _ok("error_handling", all(errors_ok), f"cases={errors_ok}")


def _scenario_onescreen(name: str, build: Callable[[], tuple[TaxableAccountState, Optional[float], date]]) -> dict[str, Any]:
    st, px, as_of = build()
    vm = project_view_model(st, current_price=px, as_of=as_of)
    text = render_ops_text(vm)
    disc = project_discord_payload(vm, dry_run=True)
    required_markers = ("特定口座 Protocol", "State:", "Capital Flow:", "Next Action:", "Reference:")
    onescreen = all(m in text for m in required_markers) and len(disc.embed["fields"]) >= 6
    return {
        "name": name,
        "pass": onescreen,
        "decision": vm["current_state"]["decision"],
        "regime": vm["current_state"]["regime"],
        "asset": vm["current_state"]["asset"]["display_name"],
        "next_action": vm["next_action"],
        "discord_content": disc.content,
    }


def run_scenario_checks() -> list[dict[str, Any]]:
    out: list[dict[str, Any]] = []

    out.append(
        _scenario_onescreen(
            "野村保有中",
            lambda: (
                TaxableAccountState(
                    regime_state=RegimeState.GROWTH_ACTIVE,
                    held_asset=Asset.NOMURA_WORLD_SEMI,
                    asset=Asset.NOMURA_WORLD_SEMI,
                    entry_date=date(2023, 1, 4),
                    entry_price=100.0,
                ),
                112.0,
                date(2024, 1, 5),
            ),
        )
    )

    def _alert():
        eng = TaxableAccountEngine()
        eng.on_event(DomainEvent.ALERT_ON)
        eng.set_signals(MarketSignals(dd15_ma200=True))
        return eng.state, 90.0, date(2024, 2, 2)

    out.append(_scenario_onescreen("Alert発生", _alert))

    def _1570_entry():
        eng = TaxableAccountEngine()
        eng.on_event(DomainEvent.ALERT_ON)
        eng.on_event(DomainEvent.TRANSFER_COMPLETE)
        eng.set_signals(MarketSignals(dd15_ma200=True, crash_15=True))
        eng.on_event(DomainEvent.SIGNAL_ENTRY_AVAILABLE)
        eng.on_event(DomainEvent.ENTRY_FILLED, fill_asset=Asset.NIKKEI_LEV_1570, fill_price=1000.0)
        return eng.state, 1000.0, date(2024, 3, 5)

    out.append(_scenario_onescreen("1570 Entry", _1570_entry))

    def _risk():
        eng = TaxableAccountEngine()
        eng.on_event(DomainEvent.ALERT_ON)
        eng.on_event(DomainEvent.TRANSFER_COMPLETE)
        eng.set_signals(MarketSignals(dd15_ma200=True, crash_15=True))
        eng.on_event(DomainEvent.SIGNAL_ENTRY_AVAILABLE)
        eng.on_event(DomainEvent.ENTRY_FILLED, fill_asset=Asset.NIKKEI_LEV_1570, fill_price=1000.0)
        return eng.state, 960.0, date(2024, 3, 6)

    st, px, as_of = _risk()
    vm = project_view_model(st, current_price=px, as_of=as_of)
    text = render_ops_text(vm)
    disc = project_discord_payload(vm, dry_run=True)
    risk_val = next(f["value"] for f in disc.embed["fields"] if f["name"] == "Risk Control")
    out.append(
        {
            "name": "1570 Risk Stop ACTIVE",
            "pass": vm["risk"]["status"] == "ACTIVE"
            and "850" in risk_val
            and "特定口座 Protocol" in text,
            "decision": vm["current_state"]["decision"],
            "regime": vm["current_state"]["regime"],
            "asset": vm["current_state"]["asset"]["display_name"],
            "next_action": vm["next_action"],
            "risk_status": vm["risk"]["status"],
            "discord_content": disc.content,
        }
    )

    def _exit():
        eng = TaxableAccountEngine()
        eng.on_event(DomainEvent.ALERT_ON)
        eng.on_event(DomainEvent.TRANSFER_COMPLETE)
        eng.set_signals(MarketSignals(dd15_ma200=True, crash_15=True))
        eng.on_event(DomainEvent.SIGNAL_ENTRY_AVAILABLE)
        eng.on_event(DomainEvent.ENTRY_FILLED, fill_asset=Asset.NIKKEI_LEV_1570, fill_price=1000.0)
        eng.on_event(DomainEvent.STOP_TRIGGERED)
        eng.on_event(DomainEvent.EXIT_FILLED, fill_price=840.0)
        return eng.state, None, date(2024, 3, 7)

    out.append(_scenario_onescreen("1570 Exit", _exit))

    def _282a():
        eng = TaxableAccountEngine()
        eng.on_event(DomainEvent.ALERT_ON)
        eng.on_event(DomainEvent.TRANSFER_COMPLETE)
        eng.set_signals(MarketSignals(dd15_ma200=True, semi_signal=True))
        eng.on_event(DomainEvent.SIGNAL_ENTRY_AVAILABLE)
        eng.on_event(DomainEvent.ENTRY_FILLED, fill_asset=Asset.SEMI_282A, fill_price=200.0)
        return eng.state, 205.0, date(2024, 5, 3)

    out.append(_scenario_onescreen("282A Entry", _282a))

    def _recovery():
        eng = TaxableAccountEngine()
        eng.on_event(DomainEvent.ALERT_ON)
        eng.on_event(DomainEvent.TRANSFER_COMPLETE)
        eng.set_signals(MarketSignals(dd15_ma200=True, crash_15=True))
        eng.on_event(DomainEvent.ALERT_OFF)
        eng.on_event(DomainEvent.RECOVERY_COMPLETE)
        return eng.state, 95.0, date(2024, 6, 5)

    out.append(_scenario_onescreen("Recovery後野村復帰", _recovery))

    def _cash():
        eng = TaxableAccountEngine()
        eng.on_event(DomainEvent.ALERT_ON)
        eng.on_event(DomainEvent.TRANSFER_COMPLETE)
        eng.set_signals(MarketSignals(dd15_ma200=True))  # flat swing
        return eng.state, None, date(2024, 8, 1)

    out.append(_scenario_onescreen("CASH待機", _cash))
    return out


def run_operational_readiness() -> ReadinessReport:
    report = ReadinessReport(
        notes=[
            "Display / ops infrastructure check only.",
            "Trading protocol, Detection, Asset Selection, Entry/Exit, Risk rules, ViewModel schema: UNCHANGED.",
        ]
    )
    report.checks = [
        check_market_data_update(),
        check_state_persistence(),
        check_discord_display(),
        check_manual_entry_recording(),
        check_position_update(),
        check_risk_stop_display(),
        check_state_transition(),
        check_error_handling(),
    ]
    report.scenarios = run_scenario_checks()
    return report


def write_evidence(report: ReadinessReport, *, evidence_dir: Path = EVIDENCE_DIR) -> Path:
    evidence_dir.mkdir(parents=True, exist_ok=True)
    (evidence_dir / "summary.json").write_text(
        json.dumps(report.to_dict(), ensure_ascii=False, indent=2), encoding="utf-8"
    )
    lines = [
        f"# Phase 7 Operational Readiness — {report.to_dict()['overall']}",
        "",
        "## Checks",
    ]
    for c in report.checks:
        lines.append(f"- [{'PASS' if c.ok else 'FAIL'}] {c.name}: {c.detail}")
    lines += ["", "## Scenarios"]
    for s in report.scenarios:
        lines.append(
            f"- [{'PASS' if s['pass'] else 'FAIL'}] {s['name']}: "
            f"{s.get('regime')} / {s.get('asset')} / {s.get('decision')}"
        )
    lines += [
        "",
        f"Freeze recommended: {report.passed}",
        "",
        "Trading protocol: UNCHANGED",
    ]
    (evidence_dir / "readiness.log").write_text("\n".join(lines) + "\n", encoding="utf-8")
    return evidence_dir
