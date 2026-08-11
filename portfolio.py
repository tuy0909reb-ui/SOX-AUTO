"""毎日使う運用入口（運用アシスタント）。

役割:
  - 今日の状態確認
  - 今日やることの案内
  - 必要な入力
  - レビュー案内

持たないもの: 保守・修復・Scheduler設定・CSV管理など（管理者CLIへ）。

  python portfolio.py           # 日常案内
  python portfolio.py --update  # Backup→Collect→Doctor→Status（判断系は実行しない）

既存 CLI / DB / Rules / SoT は変更しない。内部は既存スクリプト呼び出しのみ。
"""

from __future__ import annotations

import argparse
import calendar
import subprocess
import sys
from datetime import date, timedelta
from pathlib import Path

ROOT = Path(__file__).resolve().parent
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

from portfolio import DEFAULT_COMPARE_SET, KNOWN_POSITIONS
from portfolio.ops_assist import (
    first_setup_report,
    format_checklist,
    format_portfolio_status,
    format_reminders,
    gather_snapshot,
    mark_setup_ack,
    runtime_summary,
    setup_ack_exists,
)
from discord_notify import (
    is_configured as discord_is_configured,
    prompt_and_save_webhook,
    status_label as discord_status_label,
)

PY = sys.executable


# ---------------------------------------------------------------------------
# helpers
# ---------------------------------------------------------------------------

def _configure_console() -> None:
    for stream in (sys.stdout, sys.stderr):
        try:
            stream.reconfigure(encoding="utf-8")  # type: ignore[attr-defined]
        except Exception:
            pass


def _say(text: str = "") -> None:
    print(text, flush=True)


def _ask(prompt: str, default: str | None = None) -> str:
    suffix = f" [{default}]" if default is not None else ""
    while True:
        raw = input(f"{prompt}{suffix}: ").strip()
        if raw:
            return raw
        if default is not None:
            return default
        _say("  → 入力が必要です")


def _ask_optional(prompt: str) -> str | None:
    raw = input(f"{prompt}（Enter=なし）: ").strip()
    return raw or None


def _ask_yes(prompt: str, default: bool = True) -> bool:
    hint = "Y/n" if default else "y/N"
    raw = input(f"{prompt} [{hint}]: ").strip().lower()
    if not raw:
        return default
    return raw in ("y", "yes", "はい")


def _ask_int(prompt: str, default: int | None = None) -> int:
    while True:
        raw = _ask(prompt, str(default) if default is not None else None)
        try:
            return int(raw)
        except ValueError:
            _say("  整数を入力してください")


def _ask_float(prompt: str) -> float | None:
    while True:
        raw = input(f"{prompt}（Enter=なし）: ").strip()
        if not raw:
            return None
        try:
            return float(raw.replace(",", ""))
        except ValueError:
            _say("  → 数値を入力してください")


def _ask_choice(prompt: str, options: list[str], default: str | None = None) -> str:
    _say(prompt)
    for i, opt in enumerate(options, 1):
        mark = " ← おすすめ" if default and opt == default else ""
        _say(f"  {i}. {opt}{mark}")
    while True:
        hint = ""
        if default in options:
            hint = f" [{options.index(default) + 1}]"
        raw = input(f"番号{hint}: ").strip()
        if not raw and default is not None:
            return default
        if raw.isdigit() and 1 <= int(raw) <= len(options):
            return options[int(raw) - 1]
        _say("  → 番号を選び直してください")


def _run(script: str, args: list[str] | None = None) -> int:
    cmd = [PY, str(ROOT / script), *(args or [])]
    _say("\n>>> 実行中...")
    completed = subprocess.run(cmd, cwd=str(ROOT), stdin=subprocess.DEVNULL)
    if completed.returncode != 0:
        _say(f">>> 注意: 終了コード {completed.returncode}")
    else:
        _say(">>> 完了")
    return completed.returncode


def _today() -> date:
    return date.today()


def _today_s() -> str:
    return _today().isoformat()


def _step_header(n: int, total: int, title: str) -> None:
    _say("")
    _say("=" * 52)
    _say(f"  ステップ {n}/{total}: {title}")
    _say("=" * 52)


def _near_month_end(d: date, within_days: int = 3) -> bool:
    last = calendar.monthrange(d.year, d.month)[1]
    return d.day >= last - within_days + 1


def _near_quarter_end(d: date, within_days: int = 5) -> bool:
    q_end_month = ((d.month - 1) // 3 + 1) * 3
    last = calendar.monthrange(d.year, q_end_month)[1]
    q_end = date(d.year, q_end_month, last)
    return d >= q_end - timedelta(days=within_days - 1)


# ---------------------------------------------------------------------------
# guided steps（日常: 収集案内 + 人間判断系のみ）
# ---------------------------------------------------------------------------

def step_collect(done: list[str]) -> None:
    _say("市場データの日次収集です。")
    _say("夜間自動がある日はスキップして構いません。")
    _say("（ワンコマンド更新は: python portfolio.py --update）")
    if not _ask_yes("今、収集を実行しますか？", default=False):
        _say("→ スキップしました")
        done.append("日次収集（スキップ）")
        return

    dry = _ask_yes("試しだけ（DBに書かない）にしますか？", default=False)
    args: list[str] = ["--dry-run"] if dry else []
    code = _run("collect_market_daily.py", args)
    label = "日次収集（ドライラン）" if dry else "日次収集"
    done.append(label if code == 0 else f"{label}（要確認）")

    if _ask_yes("手動CSV（MEGA10_FUND 等）も取り込みますか？", default=False):
        asset = _ask("資産コード", "MEGA10_FUND")
        path = _ask("CSVファイルのパス")
        iargs = ["--import-csv", asset, path]
        if _ask_yes("ドライランにしますか？", default=False):
            iargs.append("--dry-run")
        _run("collect_market_daily.py", iargs)
        done.append(f"CSV取込({asset})")


def step_holdings(done: list[str]) -> None:
    _say("保有スナップショットの更新です（人間のみ）。")
    if not _ask_yes("保有を更新しますか？", default=False):
        _say("→ スキップしました")
        done.append("保有更新（スキップ）")
        return

    mode = _ask_choice(
        "どう更新しますか？",
        ["1件入力する", "CSVから取り込む", "一覧だけ見る"],
        default="1件入力する",
    )
    if mode.startswith("一覧"):
        _run("holdings_cli.py", ["list"])
        done.append("保有一覧")
        return
    if mode.startswith("CSV"):
        path = _ask("CSVファイルのパス")
        args = ["import-csv", path]
        if _ask_yes("先にドライランしますか？", default=True):
            _run("holdings_cli.py", args + ["--dry-run"])
            if not _ask_yes("本番取込しますか？", default=True):
                done.append("保有CSV（ドライランのみ）")
                return
        _run("holdings_cli.py", args)
        done.append("保有CSV取込")
        return

    _say("既知の position_id:")
    for p in KNOWN_POSITIONS:
        _say(f"  - {p['position_id']}  ({p.get('position_label') or ''})")
    as_of = _ask("基準日", _today_s())
    position_id = _ask("position_id", "nisa_growth_mega")
    cost = _ask_float("取得額 cost_jpy")
    value = _ask_float("評価額 value_jpy")
    hyp = _ask_optional("紐づける hypothesis_id")
    note = _ask_optional("メモ")
    args = ["add", "--as-of", as_of, "--position-id", position_id]
    if cost is not None:
        args.extend(["--cost-jpy", str(cost)])
    if value is not None:
        args.extend(["--value-jpy", str(value)])
    if hyp:
        args.extend(["--hypothesis-id", hyp])
    if note:
        args.extend(["--note", note])
    _run("holdings_cli.py", args)
    done.append(f"保有更新({position_id})")


def step_hypothesis(done: list[str]) -> None:
    _say("投資仮説の記録です（人間のみ）。")
    if not _ask_yes("仮説を登録しますか？", default=False):
        _say("→ スキップしました")
        done.append("仮説登録（スキップ）")
    else:
        as_of = _ask("基準日", _today_s())
        title = _ask("タイトル（短い名前）")
        thesis = _ask("仮説の内容")
        rationale = _ask_optional("根拠メモ")
        ranking = _ask(
            "期待順位（強い順・カンマ区切り）",
            ",".join(DEFAULT_COMPARE_SET),
        )
        horizon = _ask_choice(
            "想定期間",
            ["1M", "3M", "6M", "1Y", "3Y", "custom"],
            default="3M",
        )
        args = [
            "add",
            "--as-of",
            as_of,
            "--title",
            title,
            "--thesis",
            thesis,
            "--expected-ranking",
            ranking,
            "--compare-set",
            ",".join(DEFAULT_COMPARE_SET),
            "--horizon",
            horizon,
            "--status",
            "open",
        ]
        if rationale:
            args.extend(["--rationale", rationale])
        if horizon == "custom":
            args.extend(["--horizon-end", _ask("終了日 YYYY-MM-DD")])
        _run("hypothesis_cli.py", args)
        done.append("仮説登録")

    if not _ask_yes("仮説レビューを書きますか？", default=False):
        _say("→ スキップしました")
        done.append("仮説レビュー（スキップ）")
        return

    _run("hypothesis_cli.py", ["list"])
    hid = _ask("レビューする hypothesis_id")
    review_date = _ask("レビュー日", _today_s())
    ranking = _ask("実際の順位（カンマ区切り）", ",".join(DEFAULT_COMPARE_SET))
    result = _ask_choice(
        "結果",
        [
            "validated",
            "partially_validated",
            "invalidated",
            "inconclusive",
            "too_early",
        ],
        default="partially_validated",
    )
    comment = _ask_optional("コメント")
    args = [
        "add",
        "--hypothesis-id",
        hid,
        "--review-date",
        review_date,
        "--actual-ranking",
        ranking,
        "--result",
        result,
    ]
    if comment:
        args.extend(["--comment", comment])
    _run("hypothesis_review_cli.py", args)
    done.append("仮説レビュー")


def step_review(done: list[str]) -> None:
    today = _today()
    suggest_m = _near_month_end(today)
    suggest_q = _near_quarter_end(today)

    _say("月次・四半期レビュー案内です（人間のみ・自動実行しません）。")
    if suggest_m:
        _say("※ 月末が近いので、月次レビューをおすすめします。")
    if suggest_q:
        _say("※ 四半期末が近いので、四半期レビューも検討してください。")

    if not _ask_yes("今レビューを実行しますか？", default=suggest_m or suggest_q):
        _say("→ スキップしました")
        done.append("レビュー（スキップ）")
        return

    kind = _ask_choice(
        "どれを実行しますか？",
        ["月次", "四半期", "両方"],
        default="月次" if suggest_m or not suggest_q else "四半期",
    )
    dry = _ask_yes("ドライラン（DBに書かない）にしますか？", default=False)

    if kind in ("月次", "両方"):
        if today.day <= 5:
            ref = today.replace(day=1) - timedelta(days=1)
            year, month = ref.year, ref.month
        else:
            year, month = today.year, today.month
        year = _ask_int("対象年", year)
        month = _ask_int("対象月", month)
        args = [
            "--year",
            str(year),
            "--month",
            str(month),
            "--compare-mode",
            "intersection",
        ]
        if dry:
            args.append("--dry-run")
        _run("review_monthly.py", args)
        done.append(f"月次レビュー({year}-{month:02d})")

    if kind in ("四半期", "両方"):
        q = (today.month - 1) // 3 + 1
        if today.day <= 5 and today.month in (1, 4, 7, 10):
            q = 4 if q == 1 else q - 1
            year = today.year - 1 if q == 4 and today.month == 1 else today.year
        else:
            year = today.year
        year = _ask_int("対象年", year)
        quarter = _ask_int("四半期 (1-4)", q)
        args = [
            "--year",
            str(year),
            "--quarter",
            str(quarter),
            "--compare-mode",
            "intersection",
        ]
        if dry:
            args.append("--dry-run")
        _run("review_quarterly.py", args)
        done.append(f"四半期レビュー({year}Q{quarter})")


STEPS = [
    ("日次収集（任意）", step_collect),
    ("保有更新", step_holdings),
    ("仮説・検証メモ", step_hypothesis),
    ("月次・四半期レビュー", step_review),
]


# ---------------------------------------------------------------------------
# startup / update
# ---------------------------------------------------------------------------

def _maybe_discord_setup() -> None:
    """初回（未設定時）のみ Webhook URL を聞く。設定ファイル編集は不要。"""
    if discord_is_configured():
        return
    _say("")
    _say("Discord通知（未設定）")
    prompt_and_save_webhook(force=False)


def _maybe_first_setup() -> None:
    """初回のみセットアップ確認。Scheduler未登録なら案内（更新は明示同意時のみ）。"""
    if setup_ack_exists():
        return

    overall, lines, scheduler_missing = first_setup_report()
    _say("")
    for line in lines:
        _say(line)
    _say("")

    if scheduler_missing:
        _say("Scheduler未登録")
        if _ask_yes("今登録しますか？（setup_scheduler.py --install）", default=True):
            _run("setup_scheduler.py", ["--install"])
            overall, lines, scheduler_missing = first_setup_report()
            for line in lines:
                _say(line)
            _say("")

    if overall == "Overall PASS" or _ask_yes(
        "この確認を次回から省略しますか？", default=True
    ):
        mark_setup_ack()
        _say("（初回確認を記録しました）")


def _show_startup_panels() -> None:
    snap = gather_snapshot()

    _say("=" * 52)
    _say("  Portfolio 運用アシスタント（毎日の入口）")
    _say(f"  {_today_s()}")
    _say("=" * 52)
    _say("")

    _maybe_first_setup()
    _maybe_discord_setup()
    # refresh snap status after possible discord setup
    snap = gather_snapshot()
    _say("")

    for line in format_portfolio_status(snap):
        _say(line)
    _say("")

    for line in format_checklist(snap):
        _say(line)
    _say("")

    for line in format_reminders(snap):
        _say(line)
    _say("")

    for line in runtime_summary(30):
        _say(line)
    _say("")
    _say("覚えるコマンド: python portfolio.py  /  python portfolio.py --update")
    _say("")
    try:
        input("Enter で今日の運用案内へ進む...")
    except EOFError:
        pass


def run_update() -> int:
    """Backup → Collect → Doctor → Portfolio Status. 判断系は実行しない。

    Doctor の WARNING/FAIL 通知は doctor.py 側で送信（PASS は送らない）。
    """
    _maybe_discord_setup()

    _say("=" * 52)
    _say("  portfolio.py --update")
    _say("  Backup → Collect → Doctor → Status")
    _say("=" * 52)

    rc = 0
    if _run("backup_db.py") != 0:
        rc = 1
    if _run("collect_market_daily.py") != 0:
        rc = 1
    # doctor.py notifies Discord on WARNING/FAIL only
    if _run("doctor.py") != 0:
        rc = 1

    _say("")
    snap = gather_snapshot()
    for line in format_portfolio_status(snap):
        _say(line)
    _say("")
    for line in format_checklist(snap):
        _say(line)
    _say("")
    for line in runtime_summary(30):
        _say(line)
    _say(f"Discord: {discord_status_label()}")
    return rc


def run_today() -> None:
    total = len(STEPS)
    done: list[str] = []

    _show_startup_panels()

    _say("今日やることだけ案内します。")
    _say("Enter でおすすめ動作に進めます。")
    _say("自動しません: 保有・仮説・レビュー（人間の判断）")
    _say("")

    if not _ask_yes("今日の運用案内を始めますか？", default=True):
        _say("終了します。")
        return

    try:
        for i, (title, fn) in enumerate(STEPS, 1):
            _step_header(i, total, title)
            fn(done)
    except KeyboardInterrupt:
        _say("\n中断しました。ここまでの実施分:")
        for item in done:
            _say(f"  - {item}")
        return
    except EOFError:
        _say("\n入力終了のため止めます。")
        return

    _say("")
    _say("=" * 52)
    _say("  今日の運用はここまでです")
    _say("=" * 52)
    if done:
        _say("実施したこと:")
        for item in done:
            _say(f"  - {item}")
    snap = gather_snapshot()
    for line in format_checklist(snap):
        _say(line)
    _say("")
    _say("お疲れさまでした。")


def main() -> None:
    _configure_console()
    parser = argparse.ArgumentParser(
        description="Daily portfolio ops assistant (no admin maintenance UI)"
    )
    parser.add_argument(
        "--update",
        action="store_true",
        help="Backup → Collect → Doctor → Status (no holdings/hypothesis/review)",
    )
    args = parser.parse_args()
    if args.update:
        raise SystemExit(run_update())
    run_today()


if __name__ == "__main__":
    main()
