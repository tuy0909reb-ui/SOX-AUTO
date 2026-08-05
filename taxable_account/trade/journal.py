"""Append-only Trade Fact Journal (Operational Data Layer)."""

from __future__ import annotations

import json
from pathlib import Path
from typing import Union

from taxable_account.trade.facts import TradeFact

PathLike = Union[str, Path]


class TradeFactJournal:
    """JSONL append-only writer. Not a Position SoT."""

    def __init__(self, path: PathLike) -> None:
        self.path = Path(path)

    def append(self, fact: TradeFact) -> Path:
        self.path.parent.mkdir(parents=True, exist_ok=True)
        line = json.dumps(fact.to_dict(), ensure_ascii=False)
        with self.path.open("a", encoding="utf-8", newline="\n") as fh:
            fh.write(line + "\n")
        return self.path
