"""
Legacy SOX sensor seal gate.

SEALED = Discord outbound from Legacy SOX protocols is blocked.
Code, configs, logs, and offline compute remain intact for possible unseal.

Does NOT disable:
  - taxable_account Discord / ops
  - NDX / portfolio schedulers
  - the Discord webhook secret itself
"""

from __future__ import annotations

import argparse
import json
import os
import sys
from pathlib import Path
from typing import Any

ROOT = Path(__file__).resolve().parent
SEAL_FILE = ROOT / "legacy_sox_sensor_seal.json"

# Optional hard override (CI / emergency). "0" / "false" / "active" forces unsealed.
_ENV_FORCE = "LEGACY_SOX_SENSOR_SEAL"


def _load_seal() -> dict[str, Any]:
    if not SEAL_FILE.is_file():
        return {"status": "ACTIVE", "note": "seal file absent"}
    try:
        data = json.loads(SEAL_FILE.read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError, TypeError):
        # Fail closed for Discord: treat corrupt seal file as sealed.
        return {"status": "SEALED", "note": "seal file unreadable — fail closed"}
    if not isinstance(data, dict):
        return {"status": "SEALED", "note": "seal file invalid — fail closed"}
    return data


def _env_override() -> str | None:
    raw = (os.environ.get(_ENV_FORCE) or "").strip().lower()
    if not raw:
        return None
    if raw in {"0", "false", "off", "active", "unsealed"}:
        return "ACTIVE"
    if raw in {"1", "true", "on", "sealed"}:
        return "SEALED"
    return None


def seal_status() -> str:
    override = _env_override()
    if override:
        return override
    status = str(_load_seal().get("status") or "ACTIVE").strip().upper()
    return "SEALED" if status == "SEALED" else "ACTIVE"


def is_sealed() -> bool:
    return seal_status() == "SEALED"


def allow_legacy_sox_discord() -> bool:
    """True only when Legacy SOX Discord outbound is permitted."""
    return not is_sealed()


def note_discord_blocked(context: str) -> None:
    print(
        f"[LEGACY SOX SENSOR SEALED] Discord send blocked ({context}). "
        f"See {SEAL_FILE.name}. Taxable ops path is unaffected."
    )


def send_discord_if_allowed(message: str, *, context: str, send_fn) -> bool:
    """
    Call send_fn(message) only when unsealed.
    send_fn must be sox_utils.send_discord (or compatible).
    """
    if not allow_legacy_sox_discord():
        note_discord_blocked(context)
        return False
    return bool(send_fn(message))


def ci_gate() -> int:
    """
    GitHub Actions entry: exit 0 always, print seal state for logs.
    Returns process exit code; callers should skip Discord jobs when sealed.
    Writes GITHUB_OUTPUT sealed=true|false when available.
    """
    sealed = is_sealed()
    label = "SEALED" if sealed else "ACTIVE"
    print(f"Legacy SOX sensor seal status: {label}")
    out = os.environ.get("GITHUB_OUTPUT")
    if out:
        with open(out, "a", encoding="utf-8") as fh:
            fh.write(f"sealed={'true' if sealed else 'false'}\n")
    return 0


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description="Legacy SOX sensor seal utilities")
    parser.add_argument(
        "--status",
        action="store_true",
        help="Print seal status (exit 0 if SEALED, 1 if ACTIVE)",
    )
    parser.add_argument(
        "--ci-gate",
        action="store_true",
        help="CI helper: write sealed=true|false to GITHUB_OUTPUT",
    )
    parser.add_argument(
        "--require-sealed",
        action="store_true",
        help="Exit 0 if sealed, else exit 2 (verification)",
    )
    args = parser.parse_args(argv)

    if args.ci_gate:
        return ci_gate()
    if args.require_sealed:
        if is_sealed():
            print("OK: Legacy SOX sensor is SEALED")
            return 0
        print("FAIL: Legacy SOX sensor is ACTIVE (expected SEALED)")
        return 2

    status = seal_status()
    print(status)
    return 0 if status == "SEALED" else 1


if __name__ == "__main__":
    sys.exit(main())
