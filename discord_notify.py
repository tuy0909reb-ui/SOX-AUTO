"""Discord webhook notify for portfolio ops (Monthly/Quarterly/Doctor).

Webhook URL is saved once under logs/portfolio/ (gitignored).
Users only paste the URL when asked — no manual config editing.
"""

from __future__ import annotations

import argparse
import json
import os
import re
import sys
from pathlib import Path

import requests

ROOT = Path(__file__).resolve().parent
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

CONFIG_PATH = Path("logs/portfolio/discord_webhook.json")
PROMPTED_PATH = Path("logs/portfolio/.discord_webhook_prompted")
MAX_CONTENT = 1900


def config_path() -> Path:
    return CONFIG_PATH


def is_configured() -> bool:
    return bool(load_webhook_url())


def status_label() -> str:
    return "OK" if is_configured() else "NOT CONFIGURED"


def load_webhook_url() -> str | None:
    if CONFIG_PATH.is_file():
        try:
            data = json.loads(CONFIG_PATH.read_text(encoding="utf-8"))
            url = (data.get("webhook_url") or "").strip()
            if _valid_webhook(url):
                return url
        except (OSError, json.JSONDecodeError, TypeError):
            pass
    env = (os.getenv("DISCORD_WEBHOOK_URL") or "").strip()
    if _valid_webhook(env):
        return env
    return None


def _valid_webhook(url: str) -> bool:
    if not url.startswith("https://"):
        return False
    return "discord.com/api/webhooks/" in url or "discordapp.com/api/webhooks/" in url


def save_webhook_url(url: str) -> Path:
    url = url.strip()
    if not _valid_webhook(url):
        raise SystemExit(
            "Invalid webhook URL (expect https://discord.com/api/webhooks/...)"
        )
    CONFIG_PATH.parent.mkdir(parents=True, exist_ok=True)
    CONFIG_PATH.write_text(
        json.dumps({"webhook_url": url}, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )
    try:
        # Best-effort: owner-only on POSIX; Windows ACLs left to OS defaults under logs/
        os.chmod(CONFIG_PATH, 0o600)
    except OSError:
        pass
    return CONFIG_PATH


def prompt_and_save_webhook(*, force: bool = False) -> str | None:
    """Ask once for webhook URL. Returns URL or None if skipped."""
    if is_configured() and not force:
        return load_webhook_url()
    if PROMPTED_PATH.is_file() and not force:
        return load_webhook_url()

    print("Discord通知を使う場合、Webhook URLを1回貼り付けてください。")
    print("（空Enter=今は設定しない）")
    raw = input("Webhook URLを入力してください: ").strip()
    PROMPTED_PATH.parent.mkdir(parents=True, exist_ok=True)
    PROMPTED_PATH.write_text("1\n", encoding="utf-8")
    if not raw:
        print("Discord: NOT CONFIGURED")
        return None
    path = save_webhook_url(raw)
    print(f"Discord: 保存しました（{path}）")
    return load_webhook_url()


def send_message(message: str, *, timeout: int = 15) -> bool:
    url = load_webhook_url()
    if not url:
        return False
    text = message.strip()
    if not text:
        return False
    try:
        for i in range(0, len(text), MAX_CONTENT):
            chunk = text[i : i + MAX_CONTENT]
            resp = requests.post(url, json={"content": chunk}, timeout=timeout)
            resp.raise_for_status()
        return True
    except requests.RequestException:
        return False


def send_or_skip(message: str) -> bool:
    """Send if configured; never raises. Returns True if sent."""
    if not is_configured():
        return False
    return send_message(message)


# --- Summaries (short Discord payloads; review logic unchanged) ---

def summarize_review_text(full_text: str, *, kind: str) -> str:
    """Extract period / ranking / returns / hypothesis for Discord."""
    lines = full_text.splitlines()
    out: list[str] = []
    title = next((ln for ln in lines if ln.startswith("## ")), None)
    if title:
        out.append(title.replace("## ", f"**{kind}** ").strip())
    else:
        out.append(f"**{kind}**")

    # Compare period
    for ln in lines:
        if ln.startswith("Compare period:"):
            out.append(ln)
            break

    # Ranking / returns table (first performance section)
    out.append("")
    out.append("順位・リターン:")
    in_table = False
    table_rows = 0
    for ln in lines:
        if re.match(r"^### .*[Pp]erformance|^### 1\. Peer", ln):
            in_table = True
            continue
        if in_table:
            if ln.startswith("###") or ln.startswith("##"):
                break
            if re.match(r"^\s*rank\s+asset", ln) or re.match(r"^-+$", ln):
                continue
            if re.match(r"^\s*\d+\s+\S+", ln) or re.match(r"^\s*-\s+\S+", ln):
                out.append(ln.rstrip())
                table_rows += 1
                if table_rows >= 8:
                    break
            elif ln.strip() == "" and table_rows:
                break
    if table_rows == 0:
        out.append("(no ranking rows)")

    # Hypothesis
    out.append("")
    out.append("Hypothesis:")
    picked = 0
    for ln in lines:
        if ln.startswith("- #"):
            out.append(ln[:180])
            picked += 1
        elif "expected=" in ln and "actual=" in ln:
            out.append("  " + ln.strip()[:180])
            picked += 1
        elif ln.startswith("Result:"):
            out.append("  " + ln.strip()[:120])
            picked += 1
        elif re.match(r"^Hypothesis #\d+", ln) or re.match(r"^#\d+\s+", ln):
            out.append(ln[:180])
            picked += 1
        if picked >= 12:
            break
    if picked == 0:
        out.append("(none / see full review locally)")

    body = "\n".join(out)
    if len(body) > MAX_CONTENT:
        body = body[: MAX_CONTENT - 20] + "\n...(truncated)"
    return body


def notify_review(full_text: str, *, kind: str) -> bool:
    """Send short review summary. kind=Monthly|Quarterly."""
    if not is_configured():
        return False
    msg = summarize_review_text(full_text, kind=kind)
    ok = send_message(msg)
    return ok


def notify_doctor(overall: str, detail_lines: list[str] | None = None) -> bool:
    """Notify only on WARNING / FAIL."""
    if overall not in ("WARNING", "FAIL"):
        return False
    if not is_configured():
        return False
    lines = [f"**Portfolio Doctor: {overall}**"]
    if detail_lines:
        # Keep short: warnings/fails and overall
        for ln in detail_lines:
            if (
                ln.startswith("[WARNING]")
                or ln.startswith("[FAIL]")
                or ln.startswith("WARNING")
                or ln.startswith("FAIL")
                or ln.startswith("Overall")
            ):
                lines.append(ln)
        if len(lines) == 1:
            lines.extend(detail_lines[:12])
    msg = "\n".join(lines)
    return send_message(msg)


def main() -> None:
    parser = argparse.ArgumentParser(description="Portfolio Discord notify helper")
    parser.add_argument(
        "--test",
        action="store_true",
        help="Send a test message; print Discord Test OK on success",
    )
    parser.add_argument(
        "--setup",
        action="store_true",
        help="Prompt and save webhook URL",
    )
    args = parser.parse_args()

    if args.setup:
        prompt_and_save_webhook(force=True)
        return

    if args.test:
        if not is_configured():
            print("Discord NOT CONFIGURED")
            raise SystemExit(1)
        ok = send_message("Portfolio Discord Test")
        if ok:
            print("Discord Test OK")
            raise SystemExit(0)
        print("Discord Test FAIL")
        raise SystemExit(1)

    parser.print_help()
    raise SystemExit(0)


if __name__ == "__main__":
    main()
