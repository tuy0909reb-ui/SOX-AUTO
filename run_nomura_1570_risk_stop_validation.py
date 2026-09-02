"""
1570 Risk Stop Evidence: 一括 Entry ± Entry×0.85.

VALIDATION ONLY — 売買認可なし。RUNTIME-FREEZE の Risk Stop に統合 BT Evidence を付与する。

比較:
  A: B_LUMP       — 現行 simulate_swing_sleeve（Risk Stop なし）= PROTO100 9.68億系
  B: B_LUMP_STOP  — 同一一括 Entry + raw_entry×0.85 Risk Stop

共通:
  PROTO100（Alert 時 Swing100%）、dd15_ma200、Model B Re-entry、1350万、税引後
"""

from __future__ import annotations

import json
from collections import Counter
from pathlib import Path

import numpy as np
import pandas as pd

from run_longterm_account_final_protocol_validation import build_alert
from run_longterm_sox_ma_sensor_evaluation import load_vix
from run_longterm_swing_integrated_validation import (
    HOLD_C,
    HOLD_L,
    SLIP,
    ModelSpec,
    simulate_swing_sleeve,
)
from run_nomura_1570_split_entry_validation import (
    INITIAL,
    STOP_DIP,
    _md_table,
    period_metrics,
    simulate_model_with_swing,
)
from run_nomura_proto100_durability_validation import PERIODS_NOMURA
from run_longterm_swing_integrated_validation import build_lt_sensors, load_lt_nav
from run_swing_integrated_backtest import build_panel

ROOT = Path(__file__).resolve().parent
OUT = ROOT / "data/common_backtest/reports/nomura_1570_risk_stop_validation"

MODEL_BH = ModelSpec("A_BH", "A", 1.0, 0.0, "野村 Buy&Hold")
MODEL_LUMP = ModelSpec("B_LUMP", "D", 0.0, 1.0, "PROTO100 + 1570一括（Stopなし）")
MODEL_STOP = ModelSpec("B_LUMP_STOP", "D", 0.0, 1.0, "PROTO100 + 1570一括 + Entry×0.85")


def simulate_swing_sleeve_with_risk_stop(
    panel: pd.DataFrame,
    enabled: np.ndarray,
    initial: float,
) -> tuple[np.ndarray, list[dict], int, int]:
    """Frozen swing rules + 1570-only raw_entry×0.85 Risk Stop."""
    n = len(panel)
    idx = panel.index
    equity = np.ones(n, dtype=float) * initial
    trades: list[dict] = []
    pos = None
    n_entries = 0
    invested_days = 0

    def px(asset: str, i: int) -> float:
        return float(panel[asset].iloc[i])

    for i in range(n):
        if i == 0:
            equity[i] = initial
        else:
            equity[i] = equity[i - 1]

        if not enabled[i] and pos is not None:
            asset = pos["asset"]
            if pd.notna(panel[asset].iloc[i]):
                gross = px(asset, i) / pos["raw_entry"] - 1.0
                ret = (1.0 + gross) * (1.0 - SLIP) / (1.0 + SLIP) - 1.0
                equity[i] = pos["eq_entry"] * (1.0 + ret)
                trades.append(
                    {
                        "entry_date": idx[pos["entry_i"]].strftime("%Y-%m-%d"),
                        "exit_date": idx[i].strftime("%Y-%m-%d"),
                        "asset": asset,
                        "exit_reason": "alert_off_flatten",
                        "return": ret,
                    }
                )
            pos = None
            continue

        if not enabled[i]:
            continue

        if pos is not None:
            asset = pos["asset"]
            if pd.isna(panel[asset].iloc[i]):
                continue
            invested_days += 1
            raw = px(asset, i) / pos["entry_px"] - 1.0
            equity[i] = pos["eq_entry"] * (1.0 + raw)
            hold_days = i - pos["entry_i"]
            exit_reason = None
            if (
                asset == "nikkei_lev"
                and hold_days >= 1
                and px(asset, i) <= pos["raw_entry"] * (1.0 - STOP_DIP)
            ):
                exit_reason = "risk_stop_085"
            if exit_reason is None and hold_days >= 1 and bool(panel["exit_abnormal"].iloc[i]):
                if asset in ("model_c", "nikkei_lev"):
                    exit_reason = "abnormal"
            if exit_reason is None and hold_days >= pos["max_hold"]:
                exit_reason = "time"
            if exit_reason is not None:
                gross = px(asset, i) / pos["raw_entry"] - 1.0
                ret = (1.0 + gross) * (1.0 - SLIP) / (1.0 + SLIP) - 1.0
                equity[i] = pos["eq_entry"] * (1.0 + ret)
                trades.append(
                    {
                        "entry_date": idx[pos["entry_i"]].strftime("%Y-%m-%d"),
                        "exit_date": idx[i].strftime("%Y-%m-%d"),
                        "asset": asset,
                        "exit_reason": exit_reason,
                        "return": ret,
                    }
                )
                pos = None
            continue

        if pos is None and i < n - 1:
            choose = None
            hold = HOLD_C
            if bool(panel["crash_15"].iloc[i]) and pd.notna(panel["nikkei_lev"].iloc[i]):
                choose, hold = "nikkei_lev", HOLD_L
            elif bool(panel["semi_signal"].iloc[i]) and pd.notna(panel["model_c"].iloc[i]):
                choose, hold = "model_c", HOLD_C
            if choose is not None:
                raw_px = px(choose, i)
                entry_px = raw_px * (1.0 + SLIP)
                pos = {
                    "asset": choose,
                    "entry_i": i,
                    "raw_entry": raw_px,
                    "entry_px": entry_px,
                    "eq_entry": equity[i],
                    "max_hold": hold,
                }
                n_entries += 1

    return equity, trades, n_entries, invested_days


def _exit_breakdown(trades: list[dict]) -> dict[str, int]:
    c = Counter(t.get("exit_reason", "?") for t in trades)
    return dict(sorted(c.items()))


def main() -> None:
    OUT.mkdir(parents=True, exist_ok=True)
    panel = build_panel()
    vix = load_vix()
    series = load_lt_nav("world_semi")
    lt_df = build_lt_sensors(series, vix)
    alert, _, _ = build_alert(series, vix)
    alert = alert.reindex(lt_df.index).fillna(False)

    common = lt_df.index.intersection(panel.index)
    lt_w = lt_df.loc[common]
    pan_w = panel.loc[common]
    al_w = alert.loc[common]

    bh = simulate_model_with_swing(
        lt_w, pan_w, pd.Series(False, index=lt_w.index), MODEL_BH, simulate_swing_sleeve
    )
    lump = simulate_model_with_swing(lt_w, pan_w, al_w, MODEL_LUMP, simulate_swing_sleeve)
    stop = simulate_model_with_swing(
        lt_w, pan_w, al_w, MODEL_STOP, simulate_swing_sleeve_with_risk_stop
    )

    if not all(r.get("ok") for r in (bh, lump, stop)):
        raise RuntimeError("Simulation failed")

    lump_bd = _exit_breakdown(lump["swing_trades"])
    stop_bd = _exit_breakdown(stop["swing_trades"])
    stop_only_1570 = [
        t for t in stop["swing_trades"] if t.get("asset") == "nikkei_lev"
    ]
    lump_only_1570 = [
        t for t in lump["swing_trades"] if t.get("asset") == "nikkei_lev"
    ]
    stop_1570_bd = _exit_breakdown(stop_only_1570)

    headline = pd.DataFrame(
        [
            {
                "case": "A_BH",
                "label": "野村 Buy&Hold",
                "final_yen": bh["final_wealth_after_tax"],
                "cagr_after_tax": bh["cagr_after_tax"],
                "max_dd": bh["max_dd"],
                "n_swing_trades": bh["n_swing_trades"],
                "stop_exits": 0,
            },
            {
                "case": "B_LUMP",
                "label": "PROTO100 + 1570一括（Stopなし）",
                "final_yen": lump["final_wealth_after_tax"],
                "cagr_after_tax": lump["cagr_after_tax"],
                "max_dd": lump["max_dd"],
                "n_swing_trades": lump["n_swing_trades"],
                "stop_exits": 0,
                "n_1570_trades": len(lump_only_1570),
            },
            {
                "case": "B_LUMP_STOP",
                "label": "PROTO100 + 1570一括 + Entry×0.85",
                "final_yen": stop["final_wealth_after_tax"],
                "cagr_after_tax": stop["cagr_after_tax"],
                "max_dd": stop["max_dd"],
                "n_swing_trades": stop["n_swing_trades"],
                "stop_exits": stop["stop_exits"],
                "n_1570_trades": len(stop_only_1570),
            },
        ]
    )
    headline["vs_lump_final_yen"] = headline["final_yen"] - lump["final_wealth_after_tax"]
    headline["vs_lump_cagr_pp"] = headline["cagr_after_tax"] - lump["cagr_after_tax"]
    headline.to_csv(OUT / "headline_comparison.csv", index=False)

    period_rows = []
    for pid, start, end in PERIODS_NOMURA:
        bl = period_metrics(bh["equity"], start, end)
        lu = period_metrics(lump["equity"], start, end)
        st = period_metrics(stop["equity"], start, end)
        if not (bl["ok"] and lu["ok"] and st["ok"]):
            continue
        winner = (
            "STOP"
            if st["cagr"] > lu["cagr"]
            else ("LUMP" if lu["cagr"] > st["cagr"] else "TIE")
        )
        period_rows.append(
            {
                "period_id": pid,
                "start": start,
                "end": end,
                "bh_cagr": bl["cagr"],
                "lump_cagr": lu["cagr"],
                "stop_cagr": st["cagr"],
                "cagr_stop_minus_lump_pp": st["cagr"] - lu["cagr"],
                "lump_max_dd": lu["max_dd"],
                "stop_max_dd": st["max_dd"],
                "dd_stop_minus_lump_pp": st["max_dd"] - lu["max_dd"],
                "winner_cagr": winner,
            }
        )
    period_df = pd.DataFrame(period_rows)
    period_df.to_csv(OUT / "period_comparison.csv", index=False)

    lump_wins = int((period_df["winner_cagr"] == "LUMP").sum()) if len(period_df) else 0
    stop_wins = int((period_df["winner_cagr"] == "STOP").sum()) if len(period_df) else 0

    final_gap = stop["final_wealth_after_tax"] - lump["final_wealth_after_tax"]
    cagr_gap = stop["cagr_after_tax"] - lump["cagr_after_tax"]
    dd_gap = stop["max_dd"] - lump["max_dd"]
    rel_final = final_gap / lump["final_wealth_after_tax"] if lump["final_wealth_after_tax"] else 0.0

    if abs(rel_final) <= 0.03 and abs(cagr_gap) <= 0.005:
        impact = "影響小（最終資産±3%以内・CAGR±0.5pt以内）"
    elif final_gap < 0 and cagr_gap < 0:
        impact = "Stop付きが税引後劣後（最大損失制御とのトレードオフ）"
    elif final_gap > 0 and cagr_gap > 0:
        impact = "Stop付きが税引後優位（本検証条件）"
    else:
        impact = "指標間で方向不一致（条件依存）"

    # Evidence posture for freeze append — adoption already frozen; this is impact Evidence only
    freeze_note = (
        "RUNTIME-FREEZE の Entry×0.85 採用は維持。"
        "本 BT は統合パフォーマンス Evidence（採用/不採用の覆しではない）。"
    )

    pd.DataFrame(stop["swing_trades"]).to_csv(OUT / "stop_case_trades.csv", index=False)
    pd.DataFrame(
        [{"source": "B_LUMP", **lump_bd}, {"source": "B_LUMP_STOP", **stop_bd}]
    ).to_csv(OUT / "exit_reason_breakdown.csv", index=False)

    report = f"""# 1570 Risk Stop Validation — LUMP vs LUMP+Entry×0.85

**VALIDATION ONLY** — 売買認可なし。Stop 採用/不採用の覆しではない。

## 対象

```text
対象: PROTO100 スイング袖・1570 一括 Entry に Entry×0.85 Risk Stop を載せた場合の税引後差分
期間: {lump['start']} → {lump['end']}
N: 1570 trades LUMP={len(lump_only_1570)} / STOP={len(stop_only_1570)}；Stop発動={stop['stop_exits']}
評価目的: RUNTIME-FREEZE 済み Risk Stop の統合 BT Evidence 付与
判断可能範囲: 影響量（最終資産・CAGR・MaxDD・発動回数）の記述
判断禁止範囲: Stop 閾値再探索・60/40再導入・PROTO100 不採用化・投資推奨
```

## 比較条件

| Case | 1570 |
|---|---|
| **B_LUMP** | crash_15 一括・Risk Stop **なし**（現行 PROTO100 BT） |
| **B_LUMP_STOP** | crash_15 一括 + **raw_entry × 0.85** Risk Stop（DETAILED-SPEC §5） |

共通: 野村 LT / dd15_ma200 / Swing100% / Model B / 初期1350万 / 税引後 / 異常Exit・20営業日・Alert flatten 維持

Stop 優先: Risk Stop → 異常 → 時間（日次終値近似；事前逆指値の日中約定は未モデル）

---

## 1. Headline（FULL）

{_md_table(headline)}

| 差分 | LUMP → LUMP_STOP |
|---|---:|
| 税引後最終資産差 | {final_gap:+,.0f} 円（相対 {rel_final:+.2%}） |
| CAGR差 | {cagr_gap:+.2%} |
| MaxDD差 | {dd_gap:+.1%} |
| Stop決済回数 | {stop['stop_exits']} |

### Exit reason（全スイング）

| Case | Breakdown |
|---|---|
| B_LUMP | `{lump_bd}` |
| B_LUMP_STOP | `{stop_bd}` |

### Exit reason（1570のみ・STOPケース）

`{stop_1570_bd}`

---

## 2. 期間分割

{_md_table(period_df)}

期間CAGR: LUMP勝 {lump_wins} / STOP勝 {stop_wins} / 全 {len(period_df)}

---

## 3. 結論（本 BT）

**影響判定: {impact}**

```text
{freeze_note}
LUMP（Stopなし）最終: {lump['final_wealth_after_tax']:,.0f} 円 / CAGR {lump['cagr_after_tax']:.2%}
LUMP+Stop 最終:       {stop['final_wealth_after_tax']:,.0f} 円 / CAGR {stop['cagr_after_tax']:.2%}
```

---

## 4. Outputs

- `headline_comparison.csv`
- `period_comparison.csv`
- `exit_reason_breakdown.csv`
- `stop_case_trades.csv`
- `run_summary.json`
"""
    (OUT / "risk_stop_validation_report.md").write_text(report, encoding="utf-8")
    summary = {
        "period": {"start": lump["start"], "end": lump["end"]},
        "lump_final": lump["final_wealth_after_tax"],
        "stop_final": stop["final_wealth_after_tax"],
        "final_gap_yen": final_gap,
        "rel_final": rel_final,
        "cagr_gap_pp": cagr_gap,
        "dd_gap_pp": dd_gap,
        "stop_exits": stop["stop_exits"],
        "n_1570_lump": len(lump_only_1570),
        "n_1570_stop": len(stop_only_1570),
        "exit_breakdown_lump": lump_bd,
        "exit_breakdown_stop": stop_bd,
        "exit_breakdown_1570_stop": stop_1570_bd,
        "impact": impact,
        "freeze_note": freeze_note,
        "lump_period_wins": lump_wins,
        "stop_period_wins": stop_wins,
    }
    (OUT / "run_summary.json").write_text(
        json.dumps(summary, indent=2, ensure_ascii=False), encoding="utf-8"
    )
    print(f"Impact: {impact}")
    print(f"LUMP final: {lump['final_wealth_after_tax']:,.0f} yen")
    print(f"STOP final: {stop['final_wealth_after_tax']:,.0f} yen")
    print(f"Gap: {final_gap:+,.0f} yen / CAGR {cagr_gap:+.2%} / Stop exits={stop['stop_exits']}")
    print(f"Wrote {OUT}")


if __name__ == "__main__":
    main()
