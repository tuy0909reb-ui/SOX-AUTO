"""
File-backed TaxableAccountState persistence for daily ops.

Serialization only — does not change decision / detection rules.
"""

from __future__ import annotations

import json
from pathlib import Path
from typing import Optional, Union

from taxable_account.domain.models import TaxableAccountState
from taxable_account.state.state_store import InMemoryStateStore

PathLike = Union[str, Path]


class FileStateStore(InMemoryStateStore):
    """Load/save State SoT as JSON on disk."""

    def __init__(
        self,
        path: PathLike,
        *,
        initial: Optional[TaxableAccountState] = None,
        create_if_missing: bool = True,
    ) -> None:
        self.path = Path(path)
        if self.path.exists():
            raw = json.loads(self.path.read_text(encoding="utf-8"))
            initial = TaxableAccountState.from_dict(raw)
        elif not create_if_missing and initial is None:
            raise FileNotFoundError(f"State file not found: {self.path}")
        super().__init__(initial)

    def save(self) -> Path:
        self.path.parent.mkdir(parents=True, exist_ok=True)
        payload = json.dumps(self.state.to_dict(), ensure_ascii=False, indent=2)
        self.path.write_text(payload + "\n", encoding="utf-8")
        return self.path

    def reload(self) -> TaxableAccountState:
        if not self.path.exists():
            raise FileNotFoundError(f"State file not found: {self.path}")
        raw = json.loads(self.path.read_text(encoding="utf-8"))
        self._state = TaxableAccountState.from_dict(raw)
        return self._state
