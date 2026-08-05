"""ViewModel projection (no trading decisions)."""

from taxable_account.view.discord_adapter import DiscordProjection, project_discord_payload
from taxable_account.view.view_model import project_view_model, render_ops_text

__all__ = [
    "project_view_model",
    "project_discord_payload",
    "DiscordProjection",
    "render_ops_text",
]
