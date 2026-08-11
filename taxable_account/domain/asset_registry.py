"""Asset Catalog / Registry — sleeve and routing metadata (not Protocol judgment).

Owns: asset_id, aliases, sleeve, routing_policy, asset_type, active.
Does not own: Selection rules, Risk formulas, Time Exit, Detection thresholds.
"""

from __future__ import annotations

from dataclasses import dataclass
from enum import Enum
from typing import Iterable, Mapping, Optional

from taxable_account.domain.states import ASSET_DISPLAY, Asset


class Sleeve(str, Enum):
    GROWTH = "GROWTH"
    SWING = "SWING"
    CASH = "CASH"


class RoutingPolicy(str, Enum):
    SWING_POSITION = "SWING_POSITION"
    GROWTH_REGIME = "GROWTH_REGIME"
    NONE = "NONE"


class AssetType(str, Enum):
    ETF = "ETF"
    FUND = "FUND"
    CASH = "CASH"


@dataclass(frozen=True)
class AssetRecord:
    asset_id: Asset
    aliases: tuple[str, ...]
    sleeve: Sleeve
    routing_policy: RoutingPolicy
    asset_type: AssetType
    active: bool = True

    def to_dict(self) -> dict:
        return {
            "asset_id": self.asset_id.value,
            "aliases": list(self.aliases),
            "sleeve": self.sleeve.value,
            "routing_policy": self.routing_policy.value,
            "asset_type": self.asset_type.value,
            "active": self.active,
        }


def _norm_alias(raw: str) -> str:
    return raw.strip().upper().replace(" ", "_")


class AssetRegistry:
    """Lookup by Asset or alias. Protocol conditions are out of scope."""

    def __init__(self, records: Iterable[AssetRecord]) -> None:
        self._by_id: dict[Asset, AssetRecord] = {}
        self._by_alias: dict[str, Asset] = {}
        for rec in records:
            self.register(rec)

    def register(self, record: AssetRecord) -> None:
        self._by_id[record.asset_id] = record
        self._by_alias[_norm_alias(record.asset_id.value)] = record.asset_id
        for alias in record.aliases:
            key = _norm_alias(alias)
            if not key:
                continue
            existing = self._by_alias.get(key)
            if existing is not None and existing != record.asset_id:
                raise ValueError(f"duplicate_alias:{alias}")
            self._by_alias[key] = record.asset_id
            exact = alias.strip()
            if exact and exact not in self._by_alias:
                self._by_alias[exact] = record.asset_id

    def get(self, asset: Asset) -> Optional[AssetRecord]:
        return self._by_id.get(asset)

    def require(self, asset: Asset) -> AssetRecord:
        rec = self.get(asset)
        if rec is None:
            raise KeyError(f"asset_not_registered:{asset.value}")
        return rec

    def resolve(self, raw: str) -> Asset:
        """Resolve human/Discord alias or canonical Asset value."""
        text = raw.strip()
        if not text:
            raise ValueError("empty_asset_alias")
        if text in self._by_alias:
            return self._by_alias[text]
        key = _norm_alias(text)
        if key in self._by_alias:
            return self._by_alias[key]
        return Asset(key)

    def is_active_tradeable(self, asset: Asset) -> bool:
        rec = self.get(asset)
        if rec is None or not rec.active:
            return False
        return rec.routing_policy != RoutingPolicy.NONE

    def routing_policy_for(self, asset: Asset) -> Optional[RoutingPolicy]:
        rec = self.get(asset)
        if rec is None or not rec.active:
            return None
        return rec.routing_policy

    def assets_for_policy(self, policy: RoutingPolicy) -> tuple[Asset, ...]:
        return tuple(
            r.asset_id
            for r in self._by_id.values()
            if r.active and r.routing_policy == policy
        )

    def as_mapping(self) -> Mapping[Asset, AssetRecord]:
        return dict(self._by_id)


def build_default_registry() -> AssetRegistry:
    """Seed Taxable Account assets. Product changes = registry update, not Port ifs."""
    nomura_display = ASSET_DISPLAY[Asset.NOMURA_WORLD_SEMI]
    return AssetRegistry(
        [
            AssetRecord(
                asset_id=Asset.NIKKEI_LEV_1570,
                aliases=("1570", "NIKKEI_LEV_1570"),
                sleeve=Sleeve.SWING,
                routing_policy=RoutingPolicy.SWING_POSITION,
                asset_type=AssetType.ETF,
                active=True,
            ),
            AssetRecord(
                asset_id=Asset.SEMI_282A,
                aliases=("282A", "SEMI_282A"),
                sleeve=Sleeve.SWING,
                routing_policy=RoutingPolicy.SWING_POSITION,
                asset_type=AssetType.ETF,
                active=True,
            ),
            AssetRecord(
                asset_id=Asset.NOMURA_WORLD_SEMI,
                aliases=(
                    "NOMURA",
                    "NOMURA_WORLD_SEMI",
                    nomura_display,
                    "野村",
                    "世界半導体株投資",  # Human Display label (FORTRESS HI)
                ),
                sleeve=Sleeve.GROWTH,
                routing_policy=RoutingPolicy.GROWTH_REGIME,
                asset_type=AssetType.FUND,
                active=True,
            ),
            AssetRecord(
                asset_id=Asset.CASH,
                aliases=("CASH",),
                sleeve=Sleeve.CASH,
                routing_policy=RoutingPolicy.NONE,
                asset_type=AssetType.CASH,
                active=True,
            ),
        ]
    )


DEFAULT_ASSET_REGISTRY = build_default_registry()
