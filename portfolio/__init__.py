"""Multi-asset portfolio judgment verification.

Layers: Fact (market SoT) + Hypothesis + (future Decision) + Position → Review (generated).
Not a price warehouse — long-horizon verification of investment judgments.
Decision is reserved: do not fold actions into Fact or overload Hypothesis.
"""

PROTOCOL_VERSION = "portfolio_v1"
DEFAULT_DB_PATH = "logs/portfolio/portfolio.db"

# Longest practical auto-history for judgment verification
# (2022 drawdown → 2023 AI start → 2024-2026 bull).
DEFAULT_HISTORY_START = "2022-01-01"

# Default peer comparison set (Mega fund when available; proxy for market series).
DEFAULT_COMPARE_SET = ["MEGA10_PROXY", "SOXX", "FNGS", "QQQ"]

SEED_ASSETS = [
    {
        "code": "MEGA10_PROXY",
        "name": "Mega10 Proxy (equal-weight quarterly)",
        "asset_class": "index_proxy",
        "currency": "USD",
        "vendor": "yfinance",
        "notes": "Current 10 names; survivor bias vs official reconstitution",
    },
    {
        "code": "MEGA10_OFFICIAL",
        "name": "Solactive Mega10 Official Index",
        "asset_class": "index",
        "currency": "USD",
        "vendor": "manual",
        "notes": "Populate when official daily series is available",
    },
    {
        "code": "MEGA10_FUND",
        "name": "Mega10 Domestic Fund NAV",
        "asset_class": "fund",
        "currency": "JPY",
        "vendor": "manual",
        "notes": "Actual investable fund NAV; primary for live performance",
    },
    {
        "code": "SOXX",
        "name": "iShares Semiconductor ETF",
        "asset_class": "etf",
        "currency": "USD",
        "vendor": "yfinance",
        "notes": "Yahoo SOXX auto_adjust=True",
    },
    {
        "code": "FNGS",
        "name": "FANG+ (FNGS)",
        "asset_class": "etf",
        "currency": "USD",
        "vendor": "yfinance",
        "notes": "Independent investable / comparison asset",
    },
    {
        "code": "QQQ",
        "name": "Invesco QQQ Trust",
        "asset_class": "etf",
        "currency": "USD",
        "vendor": "yfinance",
        "notes": "Yahoo QQQ auto_adjust=True",
    },
]

KNOWN_POSITIONS = [
    {
        "position_id": "nisa_tsumitate_fngs",
        "account": "nisa_tsumitate",
        "asset_code": "FNGS",
        "position_label": "つみたてFANG+",
    },
    {
        "position_id": "nisa_growth_mega",
        "account": "nisa_growth",
        "asset_code": "MEGA10_FUND",
        "position_label": "成長枠Mega",
    },
    {
        "position_id": "tokutei_mega",
        "account": "tokutei",
        "asset_code": "MEGA10_FUND",
        "position_label": "特定Mega",
    },
    {
        "position_id": "tokutei_qqq",
        "account": "tokutei",
        "asset_code": "QQQ",
        "position_label": "特定QQQ",
    },
]

MEGA10_CONSTITUENTS = [
    "LLY",
    "V",
    "META",
    "MA",
    "NVDA",
    "TSLA",
    "MSFT",
    "GOOGL",
    "AMZN",
    "AVGO",
]
