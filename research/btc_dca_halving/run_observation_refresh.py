"""
BTC Observation Refresh — monthly sample extension (not a new analysis phase).

Policy: docs/reports/BTC-OPERATIONS-OBSERVATION-POLICY-1.0.md

What this does:
  1) A1 panel refresh → dated a1-YYYY-MM-DD/
  2) Frozen candidate_set C/D fixed re-apply → dated cd-YYYY-MM-DD/
  3) Observation memo under obs/obs-YYYY-MM-DD/ (append-only)

What this does NOT do:
  A2/A3/B, candidate_set change, E/X/R refit, adoption judgment
"""

from __future__ import annotations

import argparse
import json
import sys
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parent
REPO = ROOT.parents[1]
POLICY_ID = "BTC-OPERATIONS-OBSERVATION-POLICY-1.0"
FROZEN_CANDIDATE_SET = "btc-dca-halving-candset-a3-2026-08-27"
CONTRACT_VERSION = "btc-dca-halving-contracts-v1.1-sm-once-per-cycle"


def _utc_today() -> str:
    return datetime.now(timezone.utc).strftime("%Y-%m-%d")


def _utc_now() -> str:
    return datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")


def _read_latest(pointer: Path) -> str | None:
    if not pointer.is_file():
        return None
    text = pointer.read_text(encoding="utf-8").strip()
    return text or None


def _panel_span(a1_version: str | None) -> dict:
    if not a1_version:
        return {"data_version": None, "first_date": None, "last_date": None, "row_count": None}
    meta_path = ROOT / "a1" / a1_version / "run_meta.json"
    if meta_path.is_file():
        meta = json.loads(meta_path.read_text(encoding="utf-8"))
        return {
            "data_version": a1_version,
            "first_date": meta.get("first_date"),
            "last_date": meta.get("last_date"),
            "row_count": meta.get("row_count"),
        }
    panel = ROOT / "a1" / a1_version / "panel_daily.csv"
    if not panel.is_file():
        return {"data_version": a1_version, "first_date": None, "last_date": None, "row_count": None}
    lines = [ln for ln in panel.read_text(encoding="utf-8").splitlines() if ln.strip()]
    # header + rows; date is first column
    if len(lines) < 2:
        return {"data_version": a1_version, "first_date": None, "last_date": None, "row_count": 0}
    first = lines[1].split(",", 1)[0]
    last = lines[-1].split(",", 1)[0]
    return {
        "data_version": a1_version,
        "first_date": first,
        "last_date": last,
        "row_count": len(lines) - 1,
    }


def _refuse_if_exists(path: Path, force: bool) -> None:
    if path.exists() and not force:
        raise SystemExit(
            f"Refuse overwrite of versioned observation dir: {path.as_posix()}\n"
            "Re-run with --force only if Human intentionally replaces today's refresh."
        )


def _write_memo(
    obs_dir: Path,
    *,
    before: dict,
    after: dict,
    a1_version: str,
    cd_version: str,
    previous_cd: str | None,
) -> Path:
    obs_dir.mkdir(parents=True, exist_ok=True)
    added = None
    if before.get("row_count") is not None and after.get("row_count") is not None:
        added = int(after["row_count"]) - int(before["row_count"])
    memo = {
        "record_type": "Observation Refresh",
        "policy_id": POLICY_ID,
        "contract_version": CONTRACT_VERSION,
        "candidate_set_id": FROZEN_CANDIDATE_SET,
        "mode": "observation_continuation",
        "retrieved_at": _utc_now(),
        "before": before,
        "after": after,
        "rows_added": added,
        "a1_data_version": a1_version,
        "cd_data_version": cd_version,
        "previous_cd_data_version": previous_cd,
        "prohibited": [
            "candidate_set change",
            "E/X/R re-optimization",
            "new trading rules",
            "investment adoption",
            "causation claims",
        ],
    }
    (obs_dir / "observation_meta.json").write_text(
        json.dumps(memo, ensure_ascii=False, indent=2) + "\n", encoding="utf-8"
    )
    lines = [
        "# BTC Observation Refresh",
        "",
        f"**Policy:** `{POLICY_ID}`  ",
        f"**Contract:** `{CONTRACT_VERSION}`  ",
        f"**Frozen candidate_set:** `{FROZEN_CANDIDATE_SET}`  ",
        f"**Retrieved:** `{memo['retrieved_at']}`",
        "",
        "## Panel span",
        "",
        f"| | before | after |",
        f"|---|---|---|",
        f"| data_version | `{before.get('data_version')}` | `{after.get('data_version')}` |",
        f"| first_date | {before.get('first_date')} | {after.get('first_date')} |",
        f"| last_date | {before.get('last_date')} | {after.get('last_date')} |",
        f"| row_count | {before.get('row_count')} | {after.get('row_count')} |",
        f"| rows_added |  | {added} |",
        "",
        "## Artifacts",
        "",
        f"- A1: `research/btc_dca_halving/a1/{a1_version}/`",
        f"- C: `research/btc_dca_halving/c/{cd_version}/`",
        f"- D: `research/btc_dca_halving/d/{cd_version}/`",
        f"- Previous C/D pointer: `{previous_cd}`",
        "",
        "## Judgment scope",
        "",
        "```text",
        "判断可能範囲: サンプル延長・固定ルール再適用結果の記述",
        "判断禁止範囲: 戦略採用 / candidate 変更 / E・X・R 再最適化 / 因果断定",
        "```",
        "",
        "No investment decision. Strategy remains frozen; time extends the sample.",
        "",
    ]
    path = obs_dir / "OBSERVATION_REFRESH.md"
    path.write_text("\n".join(lines), encoding="utf-8")
    return path


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description="BTC monthly Observation Refresh")
    parser.add_argument(
        "--force",
        action="store_true",
        help="Allow replacing today's a1-/cd-/obs- directories if they already exist",
    )
    parser.add_argument(
        "--skip-cd",
        action="store_true",
        help="A1 panel only (not the default monthly path)",
    )
    args = parser.parse_args(argv)

    today = _utc_today()
    a1_dir = ROOT / "a1" / f"a1-{today}"
    cd_dir = ROOT / "c" / f"cd-{today}"
    obs_dir = ROOT / "obs" / f"obs-{today}"

    _refuse_if_exists(a1_dir, args.force)
    if not args.skip_cd:
        _refuse_if_exists(cd_dir, args.force)
        _refuse_if_exists(ROOT / "d" / f"cd-{today}", args.force)
    _refuse_if_exists(obs_dir, args.force)

    before_a1 = _read_latest(ROOT / "a1" / "LATEST.txt")
    before_cd = _read_latest(ROOT / "c" / "LATEST.txt")
    before_span = _panel_span(before_a1)

    # Local imports so --help works without pulling yfinance until run time.
    sys.path.insert(0, str(ROOT))
    import run_a1_descriptive as a1  # noqa: WPS433
    import run_cd_fixed_application as cd  # noqa: WPS433

    print(f"[obs] before A1={before_a1} span={before_span}")
    a1.main()
    after_a1 = _read_latest(ROOT / "a1" / "LATEST.txt")
    if after_a1 != f"a1-{today}":
        raise SystemExit(f"A1 LATEST unexpected: {after_a1!r} (expected a1-{today})")

    cd_version = before_cd
    if not args.skip_cd:
        cd.main()
        cd_version = _read_latest(ROOT / "c" / "LATEST.txt")
        if cd_version != f"cd-{today}":
            raise SystemExit(f"C LATEST unexpected: {cd_version!r} (expected cd-{today})")

    after_span = _panel_span(after_a1)
    memo = _write_memo(
        obs_dir,
        before=before_span,
        after=after_span,
        a1_version=after_a1 or f"a1-{today}",
        cd_version=cd_version or f"cd-{today}",
        previous_cd=before_cd,
    )
    (ROOT / "obs" / "LATEST.txt").write_text(f"obs-{today}\n", encoding="utf-8")

    print(f"[obs] after A1={after_a1} span={after_span}")
    print(f"[obs] memo={memo.as_posix()}")
    print("[obs] Observation Refresh complete (no candidate_set change)")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
