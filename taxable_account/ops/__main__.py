"""
CLI: daily operational view / Trade Report / manual fill recording.

Examples:
  python -m taxable_account.ops --as-of 2024-01-05 --state-file data/ops/taxable_state.json --no-auto-fill
  python -m taxable_account.ops --state-file ... --report-buy 1570 1000 --trade-date 2024-03-05 --quantity 10 --confirm
  python -m taxable_account.ops --state-file ... --report-sell 1570 900 --trade-date 2024-03-20 --quantity 10 --confirm
  python -m taxable_account.ops --state-file ... --record-entry NIKKEI_LEV_1570 1000 --entry-date 2024-03-05
  python -m taxable_account.ops --state-file ... --record-exit 840 --exit-date 2024-03-07

Live premise (Ownership Alignment CR-1.0):
  auto_fill=False, auto_transfer=False, auto_exit_fill=False.
  Position completion only after Human Trade Report + Trade Fact.
Trade Report is the Human/Broker Fact boundary (BUY/SELL); --record-entry remains ENTRY_READY-only.
Does not place broker orders. Discord send only with --discord-live + webhook.
"""

from __future__ import annotations

import argparse
import json
import sys
from datetime import date
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

from taxable_account.detection.adapter import DetectionAdapter
from taxable_account.detection.data_loader import load_market_bundle
from taxable_account.domain.events import DomainEvent
from taxable_account.domain.models import TransitionError
from taxable_account.domain.states import Asset
from taxable_account.engine import TaxableAccountEngine
from taxable_account.ops import render_ops_text
from taxable_account.runtime.session import (
    TaxableAccountRuntime,
    live_ops_runtime_config,
)
from taxable_account.state.file_store import FileStateStore
from taxable_account.state.state_store import InMemoryStateStore
from taxable_account.view.discord_adapter import project_discord_payload
from taxable_account.view.view_model import project_view_model


def _configure_stdio() -> None:
    for stream in (sys.stdout, sys.stderr):
        reconf = getattr(stream, "reconfigure", None)
        if callable(reconf):
            try:
                reconf(encoding="utf-8")
            except Exception:
                pass


def _parse_asset(name: str) -> Asset:
    key = name.strip().upper().replace(" ", "_")
    aliases = {
        "1570": "NIKKEI_LEV_1570",
        "282A": "SEMI_282A",
        "NOMURA": "NOMURA_WORLD_SEMI",
        "野村": "NOMURA_WORLD_SEMI",
        "CASH": "CASH",
    }
    key = aliases.get(key, aliases.get(name.strip(), key))
    return Asset(key)


def main(argv: list[str] | None = None) -> int:
    _configure_stdio()
    p = argparse.ArgumentParser(description="Taxable Account daily ops view (paper)")
    p.add_argument("--as-of", help="YYYY-MM-DD market step (optional if --view-state-only)")
    p.add_argument("--state-file", help="JSON path for TaxableAccountState persistence")
    p.add_argument("--json", action="store_true", help="print ViewModel JSON")
    p.add_argument("--view-state-only", action="store_true", help="project State file without market step")
    p.add_argument("--warm-days", type=int, default=5)
    p.add_argument(
        "--discord-live",
        action="store_true",
        help="POST ViewModel to Discord webhook (TAXABLE_DISCORD_WEBHOOK or DISCORD_WEBHOOK_URL)",
    )
    p.add_argument(
        "--phase8-dry-run",
        action="store_true",
        help="Phase 8 Live Operation Dry Run (projection + mocked POST path; no live send)",
    )
    p.add_argument(
        "--phase8-send",
        action="store_true",
        help="Phase 8.1: one controlled Discord test send (deterministic sample UI)",
    )
    p.add_argument(
        "--phase82-migration-test",
        action="store_true",
        help="Phase 8.2: send ViewModel 2.1 to existing SOX webhook (no new webhook/channel)",
    )
    p.add_argument(
        "--record-entry",
        nargs=2,
        metavar=("ASSET", "PRICE"),
        help="ENTRY_READY-only ENTRY_FILLED (protocol event; not delayed recovery)",
    )
    p.add_argument("--entry-date", help="YYYY-MM-DD for --record-entry")
    p.add_argument(
        "--report-buy",
        nargs=2,
        metavar=("ASSET", "PRICE"),
        help="Human Trade Report BUY (Fact Port; routes FILLED or internal delayed recovery)",
    )
    p.add_argument(
        "--report-sell",
        nargs=2,
        metavar=("ASSET", "PRICE"),
        help="Human Trade Report SELL (Fact Port; routes existing Exit path → EXIT_FILLED)",
    )
    p.add_argument(
        "--trade-date",
        help="YYYY-MM-DD actual trade date for --report-buy/--report-sell (required; no today substitution)",
    )
    p.add_argument(
        "--confirm",
        action="store_true",
        help="required confirm_flag for Trade Report (broker held fact)",
    )
    p.add_argument(
        "--quantity",
        type=float,
        help="required traded quantity Fact for Trade Report (Journal only; not Position/Risk/Time control)",
    )
    p.add_argument(
        "--fact-journal",
        help="path for Trade Fact Journal JSONL (default: beside state-file or data/ops/...)",
    )
    p.add_argument("--record-exit", type=float, metavar="PRICE", help="manual EXIT_FILLED price")
    p.add_argument("--exit-date", help="YYYY-MM-DD for --record-exit")
    p.add_argument(
        "--auto-fill",
        action="store_true",
        help="paper only: auto ENTRY_FILLED on signal (Live default is off)",
    )
    p.add_argument(
        "--no-auto-fill",
        action="store_true",
        help="deprecated alias: auto_fill is already False by default",
    )
    args = p.parse_args(argv)

    try:
        if args.phase82_migration_test:
            from taxable_account.validation.discord_migration_test import (
                run_discord_migration_test,
                write_evidence as write_migration_evidence,
            )

            payload = run_discord_migration_test(dry_run=False)
            write_migration_evidence(payload)
            print(json.dumps(payload, ensure_ascii=False, indent=2))
            print(
                f"overall={payload['overall']} sent={payload['sent']} "
                f"webhook_source={payload['webhook_source']}"
            )
            return 0 if payload["overall"] == "PASS" else 2

        if args.phase8_send:
            # Phase 8.1: one controlled UI test message (deterministic sample, not a trade signal)
            from taxable_account.validation.discord_test_send import (
                execute_discord_test_send,
                write_evidence as write_test_send_evidence,
            )

            report = execute_discord_test_send(dry_run=False)
            write_test_send_evidence(report)
            print(json.dumps(report.to_dict(), ensure_ascii=False, indent=2))
            print(
                f"overall={report.to_dict()['overall']} "
                f"sent={report.sent} webhook_source={report.webhook_source}"
            )
            return 0 if report.passed else 2

        if args.phase8_dry_run:
            from taxable_account.validation.live_dry_run import (
                run_live_dry_run,
                write_evidence,
            )

            as_of = date.fromisoformat(args.as_of) if args.as_of else None
            state_path = Path(args.state_file) if args.state_file else None
            report = run_live_dry_run(
                as_of=as_of,
                send=False,
                state_path=state_path,
            )
            write_evidence(report)
            print(json.dumps(report.to_dict(), ensure_ascii=False, indent=2))
            print(f"overall={report.to_dict()['overall']} webhook_source={report.webhook_source}")
            return 0 if report.passed else 2

        store: InMemoryStateStore
        if args.state_file:
            store = FileStateStore(args.state_file, create_if_missing=True)
        else:
            store = InMemoryStateStore()

        eng = TaxableAccountEngine(store)

        report_cmd = None
        report_side = None
        if args.report_buy:
            report_cmd = args.report_buy
            from taxable_account.trade.facts import TradeSide as _TS

            report_side = _TS.BUY
        elif args.report_sell:
            report_cmd = args.report_sell
            from taxable_account.trade.facts import TradeSide as _TS

            report_side = _TS.SELL

        if report_cmd is not None:
            from taxable_account.trade.facts import TradeReportRequest
            from taxable_account.trade.journal import TradeFactJournal
            from taxable_account.trade.port import TradeReportPort, default_journal_path

            label = "--report-buy" if report_side.value == "BUY" else "--report-sell"
            if not args.trade_date:
                print(f"ERROR: --trade-date is required for {label}", file=sys.stderr)
                return 2
            if not args.confirm:
                print(f"ERROR: --confirm is required for {label}", file=sys.stderr)
                return 2
            if args.quantity is None:
                print(f"ERROR: --quantity is required for {label}", file=sys.stderr)
                return 2
            jpath = Path(args.fact_journal) if args.fact_journal else default_journal_path(args.state_file)
            port = TradeReportPort(eng, TradeFactJournal(jpath))
            result = port.submit(
                TradeReportRequest(
                    asset=_parse_asset(report_cmd[0]),
                    side=report_side,
                    trade_date=date.fromisoformat(args.trade_date),
                    trade_price=float(report_cmd[1]),
                    confirm_flag=True,
                    quantity=float(args.quantity),
                    source="HUMAN_CLI",
                )
            )
            if isinstance(store, FileStateStore):
                store.save()
            print(json.dumps(result.to_dict(), ensure_ascii=False, indent=2))
            print(f"fact_journal={jpath}")
            if not result.accepted:
                return 2

        if args.record_entry:
            asset = _parse_asset(args.record_entry[0])
            price = float(args.record_entry[1])
            fill_date = date.fromisoformat(args.entry_date) if args.entry_date else date.today()
            if eng.state.position_state.value != "ENTRY_READY":
                raise TransitionError(
                    "record-entry requires ENTRY_READY; use --report-buy for delayed/broker facts"
                )
            eng.on_event(
                DomainEvent.ENTRY_FILLED,
                fill_asset=asset,
                fill_price=price,
                fill_date=fill_date,
            )
            if isinstance(store, FileStateStore):
                store.save()

        if args.record_exit is not None:
            fill_date = date.fromisoformat(args.exit_date) if args.exit_date else date.today()
            if eng.state.position_state.value == "POSITION_ACTIVE":
                # operator-confirmed exit path: abnormal/manual flatten then fill
                eng.on_event(DomainEvent.ABNORMAL_EXIT)
            eng.on_event(DomainEvent.EXIT_FILLED, fill_price=float(args.record_exit), fill_date=fill_date)
            if isinstance(store, FileStateStore):
                store.save()

        vm = None
        disc = None

        if args.view_state_only or (
            args.as_of is None
            and (
                args.record_entry
                or args.record_exit is not None
                or args.report_buy
                or args.report_sell
            )
        ):
            mark = None
            vm = project_view_model(eng.state, current_price=mark, as_of=date.today())
        elif args.as_of:
            as_of = date.fromisoformat(args.as_of)
            try:
                adapter = DetectionAdapter(load_market_bundle())
            except Exception as exc:
                print(f"ERROR: market data load failed: {exc}", file=sys.stderr)
                return 2
            frame = adapter.frame
            if as_of not in set(frame.index.date):
                # allow nearest prior business day
                prior = frame.index[frame.index.date <= as_of]
                if len(prior) == 0:
                    print(f"ERROR: no market data on/before {as_of}", file=sys.stderr)
                    return 2
                as_of = prior[-1].date()
                print(f"NOTE: using nearest available as_of={as_of}", file=sys.stderr)

            pre = frame.index[frame.index.date < as_of]
            warm = list(pre[-max(args.warm_days, 0) :])
            dates = [ts.date() for ts in warm] + [as_of]

            rt = TaxableAccountRuntime(
                adapter,
                config=live_ops_runtime_config(
                    discord_dry_run=not args.discord_live,
                    # Live default False; --auto-fill is paper/simulation opt-in only
                    auto_fill=bool(args.auto_fill) and not bool(args.no_auto_fill),
                ),
                engine=eng,
            )
            # restore alert bootstrap from persisted state
            rt._prev_alert = eng.state.alert_on
            result = None
            for d in dates:
                result = rt.step(d)
            assert result is not None
            vm = result.view_model
            disc = result.discord
            if isinstance(store, FileStateStore):
                store.save()
        else:
            print("ERROR: provide --as-of or --view-state-only / record flags", file=sys.stderr)
            return 2

        if vm is None:
            vm = project_view_model(eng.state, as_of=date.today())

        if args.json:
            print(json.dumps(vm, ensure_ascii=False, indent=2))
        else:
            print(render_ops_text(vm))

        if disc is None:
            disc = project_discord_payload(vm, dry_run=not args.discord_live)
        print("--- Discord projection ---")
        print(disc.content)
        if disc.error:
            print(f"error: {disc.error}", file=sys.stderr)
            return 2
        print(f"dry_run={disc.dry_run} sent={disc.sent}")
        if args.state_file:
            print(f"state_file={args.state_file}")
        return 0

    except (TransitionError, ValueError, FileNotFoundError, KeyError) as exc:
        print(f"ERROR: {type(exc).__name__}: {exc}", file=sys.stderr)
        return 2


if __name__ == "__main__":
    raise SystemExit(main())
