"""P2: NISA annual ③ silicon-cycle gate materials.

Usage:
  python scripts/nisa_annual/build_cycle_gate.py --as-of 2026-10-17 --plan-year 2027
  python scripts/nisa_annual/build_cycle_gate.py --as-of 2026-10-17 --plan-year 2027 --no-legacy

Materials only. No lump-sum / redesign recommendation.
"""

from __future__ import annotations

import argparse
import json
import sys
from datetime import date
from pathlib import Path
from typing import Any

ROOT = Path(__file__).resolve().parents[2]
SC_DIR = ROOT / "scripts" / "silicon_cycle"
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))
if str(SC_DIR) not in sys.path:
    sys.path.insert(0, str(SC_DIR))

from materials import build_materials, render_materials_md  # noqa: E402


FOOTER = "材料のみ。推奨・自動入替・発注なし。レガシーsilicon_protocol Discord封印は解除しない。"


def render_cycle_gate_md(payload: dict[str, Any], *, plan_year: int) -> str:
    body = render_materials_md(payload)
    header = [
        f"# 【③シリコンサイクルゲート】NISA {plan_year} 計画材料",
        "",
        f"**Plan year:** {plan_year}  ",
        f"**As of:** {payload['as_of']}  ",
        "",
        "役割: 翌年の買い方（年初一括 / 再設計）の**検討材料**。商品入替ゲートではない。",
        "",
        "---",
        "",
    ]
    # Replace generic H1 with annual title context already above
    lines = body.splitlines()
    if lines and lines[0].startswith("# "):
        lines = lines[1:]
        if lines and lines[0] == "":
            lines = lines[1:]
    return "\n".join(header + lines)


def write_cycle_gate(
    *,
    plan_year: int,
    as_of: date,
    payload: dict[str, Any],
) -> dict[str, str]:
    yyyymm = f"{as_of.year}{as_of.month:02d}"
    out_dir = ROOT / "data" / "nisa" / "annual" / str(plan_year)
    latest = ROOT / "data" / "nisa" / "annual" / "latest"
    out_dir.mkdir(parents=True, exist_ok=True)
    latest.mkdir(parents=True, exist_ok=True)

    annual_payload = dict(payload)
    annual_payload["plan_year"] = plan_year
    annual_payload["gate"] = "nisa_annual_cycle_gate"
    annual_payload["schema_annual"] = "nisa_annual_cycle_gate_v1"
    annual_payload["footer"] = FOOTER

    json_path = out_dir / f"cycle_gate_{yyyymm}.json"
    md_path = out_dir / f"cycle_gate_{yyyymm}.md"
    json_path.write_text(
        json.dumps(annual_payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8"
    )
    md_path.write_text(
        render_cycle_gate_md(annual_payload, plan_year=plan_year), encoding="utf-8"
    )

    pointer_path = latest / "pointer.json"
    pointer: dict[str, Any] = {}
    if pointer_path.is_file():
        try:
            pointer = json.loads(pointer_path.read_text(encoding="utf-8"))
        except json.JSONDecodeError:
            pointer = {}
    pointer.setdefault("schema", "nisa_annual_latest_pointer_v1")
    pointer["plan_year"] = plan_year
    pointer["as_of"] = as_of.isoformat()
    pointer["cycle_gate"] = str(md_path.relative_to(ROOT).as_posix())
    pointer_path.write_text(
        json.dumps(pointer, ensure_ascii=False, indent=2) + "\n", encoding="utf-8"
    )

    return {
        "cycle_gate_json": str(json_path.relative_to(ROOT).as_posix()),
        "cycle_gate_md": str(md_path.relative_to(ROOT).as_posix()),
        "pointer": str(pointer_path.relative_to(ROOT).as_posix()),
    }


def main(argv: list[str] | None = None) -> int:
    ap = argparse.ArgumentParser(description="Build NISA annual ③ cycle gate materials")
    ap.add_argument("--as-of", default="2026-10-17")
    ap.add_argument("--plan-year", type=int, default=2027)
    ap.add_argument("--no-legacy", action="store_true")
    args = ap.parse_args(argv)

    as_of = date.fromisoformat(args.as_of)
    plan_year = int(args.plan_year)
    payload = build_materials(as_of=as_of, fetch_legacy=not args.no_legacy)
    written = write_cycle_gate(plan_year=plan_year, as_of=as_of, payload=payload)
    print(
        json.dumps(
            {
                "ok": True,
                "as_of": as_of.isoformat(),
                "plan_year": plan_year,
                "watch_hint_elevated": payload["watch_hint"]["elevated"],
                "written": written,
            },
            ensure_ascii=False,
            indent=2,
        )
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
