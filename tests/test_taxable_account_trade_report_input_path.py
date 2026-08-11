"""FORTRESS-TAXABLE-TRADE-REPORT-INPUT-TEST-1.0 — input path only (no Discord live).

Covers: Choice → Adapter draft/preview → Confirm → TradeReportPort → Fact.
No Display/Protocol/Logic/Schema production changes.
"""

from __future__ import annotations

import json
import sys
from datetime import date
from pathlib import Path

import pytest

ROOT = Path(__file__).resolve().parents[1]
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

from taxable_account.domain.events import DomainEvent
from taxable_account.domain.models import MarketSignals
from taxable_account.domain.states import Asset, PositionState, RegimeState
from taxable_account.engine import TaxableAccountEngine
from taxable_account.trade.discord_input import DiscordTradeInputAdapter, SOURCE_DISCORD
from taxable_account.trade.facts import TradeReportRequest, TradeSide
from taxable_account.trade.journal import TradeFactJournal
from taxable_account.trade.port import TradeReportPort


def _adapter(tmp_path: Path, eng: TaxableAccountEngine) -> DiscordTradeInputAdapter:
    port = TradeReportPort(eng, TradeFactJournal(tmp_path / "facts.jsonl"))
    return DiscordTradeInputAdapter(port, allowed_operator_ids=("42",))


def _entry_ready_1570(eng: TaxableAccountEngine) -> None:
    eng.on_event(DomainEvent.ALERT_ON)
    eng.on_event(DomainEvent.TRANSFER_COMPLETE)
    eng.set_signals(MarketSignals(dd15_ma200=True, crash_15=True, semi_signal=False))
    eng.on_event(DomainEvent.SIGNAL_ENTRY_AVAILABLE, signal_date=date(2024, 8, 1))


def _active_1570(eng: TaxableAccountEngine) -> None:
    _entry_ready_1570(eng)
    eng.on_event(
        DomainEvent.ENTRY_FILLED,
        fill_asset=Asset.NIKKEI_LEV_1570,
        fill_price=1000.0,
        fill_date=date(2024, 8, 1),
    )


def _journal_rows(path: Path) -> list[dict]:
    if not path.is_file():
        return []
    return [json.loads(line) for line in path.read_text(encoding="utf-8").splitlines() if line.strip()]


# --- 1. 購入報告 ---


def test_1_buy_choice_price_yyyymmdd_qty_preview_confirm_fact(tmp_path: Path):
    eng = TaxableAccountEngine()
    _entry_ready_1570(eng)
    ad = _adapter(tmp_path, eng)
    before = eng.state.to_dict()

    draft = ad.create_draft(
        operator_id="42",
        asset="1570",  # Discord Choice value
        side="BUY",
        trade_date="20240801",  # YYYYMMDD
        trade_price=1000.0,
        quantity=10.0,
    )
    preview = draft.preview_text(eng.state)
    assert "購入対象" in preview
    assert "現在保有" in preview
    assert "1570" in preview
    assert "1000" in preview or "1,000" in preview or "1000.0" in preview
    assert "10" in preview
    assert "2024年8月1日" in preview
    assert eng.state.to_dict() == before  # preview must not mutate

    result = ad.confirm_and_submit(draft.report_id, "42")
    assert result.accepted
    assert eng.state.position_state == PositionState.POSITION_ACTIVE
    rows = _journal_rows(tmp_path / "facts.jsonl")
    assert len(rows) == 1
    assert rows[0]["validation_result"] == "ACCEPTED"
    assert rows[0]["side"] == "BUY"
    assert rows[0]["asset"] == "NIKKEI_LEV_1570"
    assert rows[0]["trade_date"] == "2024-08-01"
    assert rows[0]["trade_price"] == 1000.0
    assert rows[0]["quantity"] == 10.0
    assert rows[0]["source"] == SOURCE_DISCORD
    assert rows[0]["confirm_flag"] is True


# --- 2. 売却報告 ---


def test_2_sell_choice_held_preview_confirm_fact(tmp_path: Path):
    eng = TaxableAccountEngine()
    _active_1570(eng)
    ad = _adapter(tmp_path, eng)
    assert eng.state.held_asset == Asset.NIKKEI_LEV_1570

    draft = ad.create_draft(
        operator_id="42",
        asset="1570",
        side="SELL",
        trade_date="20240820",
        trade_price=950.0,
        quantity=10.0,
    )
    preview = draft.preview_text(eng.state)
    assert "売却対象" in preview
    assert "現在保有" in preview
    assert "1570" in preview
    assert "2024年8月20日" in preview

    result = ad.confirm_and_submit(draft.report_id, "42")
    assert result.accepted
    assert eng.state.held_asset == Asset.CASH
    rows = _journal_rows(tmp_path / "facts.jsonl")
    assert len(rows) == 1
    assert rows[0]["validation_result"] == "ACCEPTED"
    assert rows[0]["side"] == "SELL"
    assert rows[0]["quantity"] == 10.0
    assert rows[0]["routed_event"] in ("EXIT_FILLED", "ABNORMAL_EXIT") or "EXIT_FILLED" in (
        result.events or ()
    )


# --- 3. Reject: State unchanged; no ACCEPTED Position Fact ---


def test_3_reject_invalid_asset_no_state_change(tmp_path: Path):
    eng = TaxableAccountEngine()
    _entry_ready_1570(eng)
    before = eng.state.position_state
    ad = _adapter(tmp_path, eng)
    with pytest.raises((ValueError, KeyError)):
        ad.create_draft(
            operator_id="42",
            asset="NOT_A_REAL_TICKER",
            side="BUY",
            trade_date="20240801",
            trade_price=1000.0,
            quantity=1.0,
        )
    assert eng.state.position_state == before
    assert not (tmp_path / "facts.jsonl").exists()


def test_3_reject_invalid_date_no_state_no_fact(tmp_path: Path):
    eng = TaxableAccountEngine()
    _entry_ready_1570(eng)
    before = eng.state.position_state
    ad = _adapter(tmp_path, eng)
    with pytest.raises(ValueError):
        ad.create_draft(
            operator_id="42",
            asset="1570",
            side="BUY",
            trade_date="not-a-date",
            trade_price=1000.0,
            quantity=1.0,
        )
    assert eng.state.position_state == before
    assert not (tmp_path / "facts.jsonl").exists()


def test_3_reject_future_date_via_port_state_unchanged(tmp_path: Path):
    eng = TaxableAccountEngine()
    _entry_ready_1570(eng)
    before = eng.state.to_dict()
    port = TradeReportPort(eng, TradeFactJournal(tmp_path / "facts.jsonl"))
    r = port.submit(
        TradeReportRequest(
            asset=Asset.NIKKEI_LEV_1570,
            side=TradeSide.BUY,
            trade_date=date(2099, 1, 1),
            trade_price=1000.0,
            confirm_flag=True,
            quantity=1.0,
            source=SOURCE_DISCORD,
        )
    )
    assert not r.accepted
    assert r.error == "trade_date_in_future_forbidden"
    assert eng.state.position_state == PositionState.ENTRY_READY
    assert eng.state.to_dict()["held_asset"] == before["held_asset"]
    rows = _journal_rows(tmp_path / "facts.jsonl")
    assert len(rows) == 1
    assert rows[0]["validation_result"] == "REJECTED"
    assert rows[0]["routed_event"] is None


def test_3_reject_holdings_mismatch_no_position_change(tmp_path: Path):
    eng = TaxableAccountEngine()
    _active_1570(eng)
    before_pos = eng.state.position_state
    before_held = eng.state.held_asset
    ad = _adapter(tmp_path, eng)
    draft = ad.create_draft(
        operator_id="42",
        asset="282A",  # not held
        side="SELL",
        trade_date="20240820",
        trade_price=200.0,
        quantity=1.0,
    )
    r = ad.confirm_and_submit(draft.report_id, "42")
    assert not r.accepted
    assert r.error == "sell_asset_mismatch"
    assert eng.state.position_state == before_pos
    assert eng.state.held_asset == before_held
    rows = _journal_rows(tmp_path / "facts.jsonl")
    assert rows[-1]["validation_result"] == "REJECTED"
    assert rows[-1]["routed_event"] is None


def test_3_reject_duplicate_report_no_second_accept(tmp_path: Path):
    eng = TaxableAccountEngine()
    _entry_ready_1570(eng)
    ad = _adapter(tmp_path, eng)
    rid = "input-test-dup-1"
    d1 = ad.create_draft(
        operator_id="42",
        asset="1570",
        side="BUY",
        trade_date="20240801",
        trade_price=1000.0,
        quantity=1.0,
        report_id=rid,
    )
    assert ad.confirm_and_submit(d1.report_id, "42").accepted
    assert eng.state.position_state == PositionState.POSITION_ACTIVE

    ad2 = _adapter(tmp_path, eng)
    d2 = ad2.create_draft(
        operator_id="42",
        asset="1570",
        side="SELL",
        trade_date="20240820",
        trade_price=900.0,
        quantity=1.0,
        report_id=rid,
    )
    r2 = ad2.confirm_and_submit(d2.report_id, "42")
    assert not r2.accepted
    assert r2.error == "duplicate_report_id"
    assert eng.state.position_state == PositionState.POSITION_ACTIVE
    assert eng.state.held_asset == Asset.NIKKEI_LEV_1570


# --- 4. Cancel ---


def test_4_cancel_no_fact_no_state_change(tmp_path: Path):
    eng = TaxableAccountEngine()
    _entry_ready_1570(eng)
    ad = _adapter(tmp_path, eng)
    draft = ad.create_draft(
        operator_id="42",
        asset="1570",
        side="BUY",
        trade_date="20240801",
        trade_price=1000.0,
        quantity=5.0,
    )
    assert ad.cancel_draft(draft.report_id, "42")
    assert eng.state.position_state == PositionState.ENTRY_READY
    assert eng.state.regime_state == RegimeState.SWING_ACTIVE
    assert not (tmp_path / "facts.jsonl").exists()


def test_slash_choice_aliases_match_bot_surface():
    """Discord Choice values in bot source resolve via Registry (input path)."""
    from taxable_account.domain.asset_registry import DEFAULT_ASSET_REGISTRY

    bot_src = (ROOT / "taxable_account" / "ops" / "discord_trade_bot.py").read_text(
        encoding="utf-8"
    )
    for alias in ("1570", "282A", "野村世界半導体株投資"):
        assert f'value="{alias}"' in bot_src
    assert 'name="野村世界半導体株投資"' in bot_src
    assert '"asset": "銘柄"' in bot_src
    assert '"price": "約定価格"' in bot_src
    assert '"trade_date": "約定日"' in bot_src
    assert '"quantity": "数量"' in bot_src
    assert DEFAULT_ASSET_REGISTRY.resolve("1570") == Asset.NIKKEI_LEV_1570
    assert DEFAULT_ASSET_REGISTRY.resolve("282A") == Asset.SEMI_282A
    assert DEFAULT_ASSET_REGISTRY.resolve("野村世界半導体株投資") == Asset.NOMURA_WORLD_SEMI
