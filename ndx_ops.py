"""NDX売却プロトコルの日次運用入口。

判定ロジックは ndx_sell_protocol に委譲する。
ここでは Webhook・完了フラグ・Discord/Scheduler 配線のみ行う。

覚えること:
  python ndx_ops.py --setup
  python ndx_ops.py --status
  python ndx_ops.py --run am|pm|auto
  python ndx_ops.py --complete
  python setup_ndx_scheduler.py --install
"""

from __future__ import annotations

import argparse
import json
import sys
from datetime import date
from pathlib import Path

ROOT = Path(__file__).resolve().parent
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

from ndx_sell_protocol import (
    resolve_phase,
    run_phase,
)
from sox_utils import send_discord

LOG_DIR = Path("logs/ndx")
CONFIG_PATH = LOG_DIR / "ndx_ops_config.json"
WEBHOOK_PATH = LOG_DIR / "discord_webhook.json"
WATCH_LIST_PATH = ROOT / "docs" / "watch_list_v1.md"


def _load_json(path: Path) -> dict:
    if not path.is_file():
        return {}
    try:
        return json.loads(path.read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError):
        return {}


def _save_json(path: Path, data: dict) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(
        json.dumps(data, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )


def load_config() -> dict:
    cfg = _load_json(CONFIG_PATH)
    return {
        "active": bool(cfg.get("active", True)),
        "completed_at": cfg.get("completed_at"),
        "note": cfg.get("note") or "",
    }


def save_config(cfg: dict) -> None:
    _save_json(CONFIG_PATH, cfg)


def load_webhook() -> str | None:
    data = _load_json(WEBHOOK_PATH)
    url = (data.get("webhook_url") or "").strip()
    if url.startswith("https://") and "discord.com/api/webhooks/" in url:
        return url
    return None


def save_webhook(url: str) -> None:
    url = url.strip()
    if not (
        url.startswith("https://")
        and (
            "discord.com/api/webhooks/" in url
            or "discordapp.com/api/webhooks/" in url
        )
    ):
        raise SystemExit("Invalid Discord webhook URL")
    _save_json(WEBHOOK_PATH, {"webhook_url": url})


def cmd_setup() -> None:
    cfg = load_config()
    print("NDX日次運用セットアップ（売却プロトコル v2）")
    print("購入基準価額10,000円固定・毎日の金額入力なし")
    print()

    current = load_webhook()
    if current:
        print("Webhook: 設定済み")
        if input("Webhook URLを差し替えますか？ [y/N]: ").strip().lower() in (
            "y",
            "yes",
            "はい",
        ):
            url = input("Webhook URLを入力してください: ").strip()
            if url:
                save_webhook(url)
                print("Webhook: 保存しました")
    else:
        url = input("Discord Webhook URLを入力してください: ").strip()
        if not url:
            print("Webhook未設定のまま終了（後で --setup 可）")
        else:
            save_webhook(url)
            print("Webhook: 保存しました")

    cfg["active"] = True
    cfg["completed_at"] = None
    # 旧 cost/value は使わない
    cfg.pop("cost_jpy", None)
    cfg.pop("value_jpy", None)
    save_config(cfg)
    print()
    print(f"保存: {CONFIG_PATH}")
    print("active=True")
    print("次: python setup_ndx_scheduler.py --install")


def cmd_status() -> None:
    cfg = load_config()
    wh = load_webhook()
    print("NDX日次運用ステータス")
    print(f"  active:     {cfg['active']}")
    print(f"  completed:  {cfg.get('completed_at') or '-'}")
    print(f"  Discord:    {'OK' if wh else 'NOT CONFIGURED'}")
    print(f"  config:     {CONFIG_PATH}")


def cmd_complete() -> None:
    cfg = load_config()
    if not cfg["active"]:
        print("既に完了（active=False）です")
        return
    note = input("完了メモ（任意）: ").strip()
    cfg["active"] = False
    cfg["completed_at"] = date.today().isoformat()
    if note:
        cfg["note"] = note
    cfg.pop("cost_jpy", None)
    cfg.pop("value_jpy", None)
    save_config(cfg)
    print(f"完了を記録しました（{cfg['completed_at']}）")
    print("以降の定時実行はスキップされます")
    wh = load_webhook()
    if wh:
        send_discord(
            f"【NDX売却プロトコル】運用完了を記録\n"
            f"date={cfg['completed_at']}\n"
            f"日次運用を停止しました",
            webhook_url=wh,
        )


def cmd_test() -> None:
    wh = load_webhook()
    if not wh:
        print("Discord NOT CONFIGURED")
        raise SystemExit(1)
    ok = send_discord("NDX Discord Test (protocol v2)", webhook_url=wh)
    if ok:
        print("Discord Test OK")
    else:
        print("Discord Test FAIL")
        raise SystemExit(1)


def cmd_run(phase: str) -> int:
    cfg = load_config()
    if not cfg["active"]:
        print(
            f"スキップ: 運用完了済み（completed_at={cfg.get('completed_at')}）"
        )
        return 0

    wh = load_webhook()
    if not wh:
        print("WARNING: Discord NOT CONFIGURED（判定は実行、通知なし）")

    phase = resolve_phase(phase)
    print(f"NDX日次運用 phase={phase}")
    run_phase(phase, notify=True, webhook=wh)
    return 0


def _inactive_ui_view(phase: str) -> dict:
    """運用停止時の表示用 dict。プロトコルは実行せず状態も書き換えない。"""
    return {
        "phase": phase,
        "skipped": True,
        "inactive": True,
        "nav": None,
        "nav_date": None,
        "purchase_ratio_pct": None,
        "purchase_ok": False,
        "ndx_close": None,
        "ndx_date": None,
        "rsi": None,
        "rsi_ok": False,
        "macd": None,
        "macd_signal": None,
        "macd_dead_cross": False,
        "ma20": None,
        "above_ma20": False,
        "nq_pct": None,
        "nq_ok": False,
        "nq_safe": False,
        "decision": "HOLD",
        "morning_decision": "HOLD",
        "final_decision": "HOLD",
        "stop_reason": "運用停止中（INACTIVE）",
        "reason": "運用停止中（INACTIVE）",
        "morning_reason": "運用停止中（INACTIVE）",
        # 52週高値乖離は現行プロトコル ViewModel に無い（再計算しない）
        "ndx_drop": None,
    }


def project_for_ui(view: dict) -> dict:
    """プロトコル結果を UI 表示用に投影する（再計算しない）。"""
    out = dict(view)
    # 含み益表示は購入比をそのまま使う（プロトコル値の投影）
    if "pnl_pct" not in out and out.get("purchase_ratio_pct") is not None:
        out["pnl_pct"] = out["purchase_ratio_pct"]
    # 旧ログ項目名互換。現行プロトコルに無ければ None のまま
    out.setdefault("ndx_drop", None)
    decision = str(out.get("final_decision") or out.get("decision") or "HOLD")
    # §8: HOLD→Normal、脱出GO/EXIT_GO/GO→SELL。GO候補は色名・Alert対象外
    if decision in ("GO", "脱出GO", "EXIT_GO"):
        out["ui_label"] = "SELL"
        out["ui_alert"] = True
    elif decision == "HOLD":
        out["ui_label"] = "Normal"
        out["ui_alert"] = False
    else:
        out["ui_label"] = decision
        out["ui_alert"] = False
    return out


def run_for_ui(phase: str) -> dict:
    """Discord UI 用入口。notify=False で実行し、表示用 dict を返す。

    - active でなければプロトコル非実行・状態非更新でスキップ情報を返す
    - 判定・再計算はしない（run_phase の戻り値を投影するのみ）
    """
    phase = resolve_phase(phase)
    if phase not in ("am", "pm"):
        raise ValueError(f"unsupported phase: {phase}")

    cfg = load_config()
    if not cfg["active"]:
        return project_for_ui(_inactive_ui_view(phase))

    view = run_phase(phase, notify=False)
    return project_for_ui(view)


def run_from_discord(phase: str) -> dict:
    """互換エイリアス。Discord Bot は run_for_ui を使う。"""
    return run_for_ui(phase)


def load_watch_list() -> list[dict]:
    """docs/watch_list_v1.md の一覧表から必要項目のみ抽出する。"""
    if not WATCH_LIST_PATH.is_file():
        return []
    text = WATCH_LIST_PATH.read_text(encoding="utf-8")
    rows: list[dict] = []
    in_table = False
    for line in text.splitlines():
        stripped = line.strip()
        if not stripped.startswith("|"):
            if in_table and rows:
                break
            continue
        cells = [c.strip() for c in stripped.strip("|").split("|")]
        if len(cells) < 4:
            continue
        if cells[0].lower() == "id":
            in_table = True
            continue
        if set(cells[0]) <= {"-", ":"}:
            continue
        if not in_table:
            continue
        rows.append(
            {
                "id": cells[0],
                "name": cells[1],
                "role": cells[2],
                "status": cells[3],
            }
        )
    return rows


def main() -> None:
    parser = argparse.ArgumentParser(description="NDX sell daily ops v2")
    g = parser.add_mutually_exclusive_group(required=True)
    g.add_argument("--setup", action="store_true", help="Webhook 設定")
    g.add_argument("--status", action="store_true")
    g.add_argument("--complete", action="store_true", help="運用完了→日次停止")
    g.add_argument("--test", action="store_true", help="Discordテスト送信")
    g.add_argument(
        "--run",
        choices=["am", "pm", "auto"],
        help="1回実行（Schedulerから呼ばれる）",
    )
    args = parser.parse_args()

    if args.setup:
        cmd_setup()
    elif args.status:
        cmd_status()
    elif args.complete:
        cmd_complete()
    elif args.test:
        cmd_test()
    elif args.run:
        raise SystemExit(cmd_run(args.run))


if __name__ == "__main__":
    main()
