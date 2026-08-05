"""
ASA Taxable Account Protocol — New Runtime Foundation (Phase 3).

Legacy-independent package. No imports from sox_*/ndx_*/run_* protocol engines.
Design SoT:
  - ASA-TAXABLE-ACCOUNT-PROTOCOL-DETAILED-SPEC-1.0
  - docs/schemas/taxable_account_state.schema.json

Runtime activation: NOT AUTHORIZED by this package alone.
"""

from taxable_account.domain.states import Asset, PositionState, RegimeState, RiskStatus
from taxable_account.domain.events import DomainEvent
from taxable_account.domain.models import MarketSignals, RiskControlState, TaxableAccountState

__all__ = [
    "Asset",
    "PositionState",
    "RegimeState",
    "RiskStatus",
    "DomainEvent",
    "MarketSignals",
    "RiskControlState",
    "TaxableAccountState",
]

__version__ = "0.5.0"
