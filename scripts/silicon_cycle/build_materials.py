"""CLI: build silicon cycle materials JSON/MD (shared core).

Usage:
  python scripts/silicon_cycle/build_materials.py --as-of 2026-10-17
  python scripts/silicon_cycle/build_materials.py --as-of 2026-10-17 --no-legacy
"""

from __future__ import annotations

import argparse
import json
import sys
from datetime import date
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
PKG = Path(__file__).resolve().parent
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))
if str(PKG) not in sys.path:
    sys.path.insert(0, str(PKG))

from materials import build_materials, render_materials_md  # noqa: E402


def main(argv: list[str] | None = None) -> int:
    ap = argparse.ArgumentParser(description="Build silicon cycle materials")
    ap.add_argument("--as-of", default="", help="YYYY-MM-DD (default: today)")
    ap.add_argument(
        "--out-dir",
        default="",
        help="Output directory (default: data/ops/silicon_cycle/materials)",
    )
    ap.add_argument(
        "--no-legacy",
        action="store_true",
        help="Skip WSTS/TSMC network fetch",
    )
    ap.add_argument(
        "--stdout-json",
        action="store_true",
        help="Print JSON to stdout instead of writing files",
    )
    args = ap.parse_args(argv)

    as_of = date.fromisoformat(args.as_of) if str(args.as_of).strip() else date.today()
    payload = build_materials(as_of=as_of, fetch_legacy=not args.no_legacy)

    if args.stdout_json:
        print(json.dumps(payload, ensure_ascii=False, indent=2))
        return 0

    out_dir = (
        Path(args.out_dir)
        if str(args.out_dir).strip()
        else ROOT / "data" / "ops" / "silicon_cycle" / "materials"
    )
    out_dir.mkdir(parents=True, exist_ok=True)
    yyyymmdd = as_of.strftime("%Y%m%d")
    json_path = out_dir / f"materials_{yyyymmdd}.json"
    md_path = out_dir / f"materials_{yyyymmdd}.md"
    json_path.write_text(
        json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8"
    )
    md_path.write_text(render_materials_md(payload), encoding="utf-8")
    print(
        json.dumps(
            {
                "ok": True,
                "as_of": as_of.isoformat(),
                "watch_hint_elevated": payload["watch_hint"]["elevated"],
                "written": {
                    "json": str(json_path.relative_to(ROOT).as_posix()),
                    "md": str(md_path.relative_to(ROOT).as_posix()),
                },
            },
            ensure_ascii=False,
            indent=2,
        )
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
