"""Scripted MarketCondition source for integration tests / paper scenarios."""

from __future__ import annotations

from datetime import date
from typing import Mapping

from taxable_account.detection.market_condition import MarketCondition


class ScriptedDetection:
    """Maps as_of date → MarketCondition without market math."""

    def __init__(self, conditions: Mapping[date, MarketCondition]) -> None:
        self._map = dict(conditions)

    def condition_on(self, as_of: date | str) -> MarketCondition:
        if isinstance(as_of, str):
            as_of = date.fromisoformat(as_of)
        if as_of not in self._map:
            raise KeyError(f"No scripted condition for {as_of}")
        return self._map[as_of]
