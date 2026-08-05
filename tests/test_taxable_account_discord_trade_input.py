"""Discord Trade Report Input Adapter — transport-only tests (no live Discord)."""

from __future__ import annotations

import json
import sys
from datetime import date
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

from taxable_account.domain.events import DomainEvent
from taxable_account.domain.models import MarketSignals
from taxable_account.domain.states import Asset, PositionState
from taxable_account.engine import TaxableAccountEngine
from taxable_account.trade.discord_input import DiscordTradeInputAdapter, SOURCE_DISCORD
from taxable_account.trade.journal import TradeFactJournal
from taxable_account.trade.port import TradeReportPort


def _ready_1570(eng: TaxableAccountEngine) -> None:
    eng.on_event(DomainEvent.ALERT_ON)
    eng.on_event(DomainEvent.TRANSFER_COMPLETE)
    eng.set_signals(MarketSignals(dd15_ma200=True, crash_15=True, semi_signal=False))
    eng.on_event(DomainEvent.SIGNAL_ENTRY_AVAILABLE, signal_date=date(2024, 8, 1))


def _adapter(tmp_path: Path, eng: TaxableAccountEngine, ops=("42",)) -> DiscordTradeInputAdapter:
    port = TradeReportPort(eng, TradeFactJournal(tmp_path / "facts.jsonl"))
    return DiscordTradeInputAdapter(port, allowed_operator_ids=ops)


def test_discord_confirm_submits_buy_via_existing_port(tmp_path: Path):
    eng = TaxableAccountEngine()
    _ready_1570(eng)
    ad = _adapter(tmp_path, eng)
    draft = ad.create_draft(
        operator_id="42",
        asset="1570",
        side="BUY",
        trade_date="2024-08-01",
        trade_price=1000.0,
        quantity=10.0,
    )
    assert draft.report_id
    result = ad.confirm_and_submit(draft.report_id, "42")
    assert result.accepted
    assert eng.state.position_state == PositionState.POSITION_ACTIVE
    row = json.loads((tmp_path / "facts.jsonl").read_text(encoding="utf-8").strip())
    assert row["source"] == SOURCE_DISCORD
    assert row["quantity"] == 10.0
    assert row["report_id"] == draft.report_id
    assert row["validation_result"] == "ACCEPTED"


def test_discord_unauthorized_cannot_draft(tmp_path: Path):
    eng = TaxableAccountEngine()
    ad = _adapter(tmp_path, eng, ops=("99",))
    try:
        ad.create_draft(
            operator_id="42",
            asset="1570",
            side="BUY",
            trade_date="2024-08-01",
            trade_price=1000.0,
            quantity=1.0,
        )
        raised = False
    except PermissionError:
        raised = True
    assert raised


def test_discord_cancel_does_not_mutate_state(tmp_path: Path):
    eng = TaxableAccountEngine()
    _ready_1570(eng)
    ad = _adapter(tmp_path, eng)
    draft = ad.create_draft(
        operator_id="42",
        asset="1570",
        side="BUY",
        trade_date="2024-08-01",
        trade_price=1000.0,
        quantity=1.0,
    )
    assert ad.cancel_draft(draft.report_id, "42")
    assert eng.state.position_state == PositionState.ENTRY_READY
    assert not (tmp_path / "facts.jsonl").exists()


def test_discord_duplicate_confirm_rejected_by_journal(tmp_path: Path):
    eng = TaxableAccountEngine()
    _ready_1570(eng)
    ad = _adapter(tmp_path, eng)
    rid = "discord-rep-1"
    d1 = ad.create_draft(
        operator_id="42",
        asset="1570",
        side="BUY",
        trade_date="2024-08-01",
        trade_price=1000.0,
        quantity=1.0,
        report_id=rid,
    )
    assert ad.confirm_and_submit(d1.report_id, "42").accepted
    # second draft with same id cannot stay pending after first consume;
    # re-submit via port path is covered by journal duplicate when creating new confirm cycle
    ad2 = _adapter(tmp_path, eng)
    d2 = ad2.create_draft(
        operator_id="42",
        asset="1570",
        side="SELL",
        trade_date="2024-08-02",
        trade_price=900.0,
        quantity=1.0,
        report_id=rid,
    )
    r2 = ad2.confirm_and_submit(d2.report_id, "42")
    assert not r2.accepted
    assert r2.error == "duplicate_report_id"


def test_adapter_has_no_internal_event_fields():
    import inspect
    from taxable_account.trade import discord_input as mod

    src = inspect.getsource(mod)
    assert "DELAYED_FILL_RECOVERY" not in src
    assert "ABNORMAL_EXIT" not in src
    assert "TradeReportPort" in src
