# taxable_account — New Taxable Account Runtime

Legacy-independent ASA Taxable Account Protocol runtime (Phases 3–7).  
**Freeze baseline:** `docs/baselines/ASA-TAXABLE-ACCOUNT-PROTOCOL-RUNTIME-FREEZE-1.0.md`

## Spec SoT

- `docs/baselines/ASA-TAXABLE-ACCOUNT-PROTOCOL-DETAILED-SPEC-1.0.md`
- `docs/baselines/ASA-TAXABLE-ACCOUNT-PROTOCOL-VIEWMODEL-2.0.md`
- `docs/baselines/ASA-TAXABLE-ACCOUNT-PROTOCOL-DISCORD-DISPLAY-2.0.md`
- `docs/schemas/taxable_account_state.schema.json`
- `docs/schemas/taxable_account_viewmodel.schema.json`

## Layout

```text
taxable_account/
  domain/       states, events, models
  decision/     regime, asset_selection
  position/     position_manager, risk_control
  detection/    sensors, MarketCondition, DetectionAdapter
  state/        InMemoryStateStore (SoT container)
  view/         ViewModel 2.0 + Discord projection (no judgment)
  runtime/      TaxableAccountRuntime end-to-end session
  ops/          operational CLI (paper one-screen view)
  validation/   Phase 6 operational replay harness (display evidence only)
  engine.py     event glue
```

## Runtime flow

```text
Market Data → Detection → Decision/Selection → State
  → Position/Risk → State → ViewModel → DiscordProjection
```

## Ops CLI (paper / daily)

```text
# Live: auto_fill off by default (HTR Port / Fact Journal v1.0)
python -m taxable_account.ops --as-of 2024-01-05 --state-file data/ops/taxable_state.json
python -m taxable_account.ops --state-file data/ops/taxable_state.json --view-state-only

# Human Trade Report (Runtime sync + Trade Fact accumulation)
python -m taxable_account.ops --state-file data/ops/taxable_state.json \
  --report-buy 1570 1000 --trade-date 2024-03-05 --quantity 10 --confirm --view-state-only
# quantity is Journal Fact only (not Position/Risk/Time control; not Ledger)

# ENTRY_READY-only protocol fill (not delayed recovery)
python -m taxable_account.ops --state-file data/ops/taxable_state.json \
  --record-entry 1570 1000 --entry-date 2024-03-05 --view-state-only

# Paper may enable auto fill
python -m taxable_account.ops --as-of 2024-01-05 --auto-fill --state-file data/ops/taxable_state.json

# Phase 8 Live Operation Dry Run (no Legacy; webhook infra only)
python -m taxable_account.ops --phase8-dry-run
python -m taxable_account.ops --phase8-send
python -m taxable_account.ops --phase82-migration-test
```

Freeze: `docs/baselines/ASA-TAXABLE-ACCOUNT-PROTOCOL-HUMAN-TRADE-REPORT-PORT-1.0.md`

## Paper step example

```python
from datetime import date
from taxable_account.detection.scripted import ScriptedDetection
from taxable_account.detection.market_condition import MarketCondition
from taxable_account.domain.models import MarketSignals
from taxable_account.runtime import TaxableAccountRuntime, RuntimeConfig
from taxable_account.view import render_ops_text

cond = MarketCondition(
    as_of=date(2024, 2, 2),
    alert_on=True,
    signals=MarketSignals(dd15_ma200=True, crash_15=True),
    prices={"NOMURA_WORLD_SEMI": 90, "NIKKEI_LEV_1570": 1000, "SEMI_282A": 180},
)
rt = TaxableAccountRuntime(ScriptedDetection({cond.as_of: cond}), config=RuntimeConfig())
result = rt.step(cond.as_of)
print(render_ops_text(result.view_model))
print(result.discord.content)
```

## Boundaries

- No Legacy protocol imports
- Discord dry-run by default (`RuntimeConfig.discord_dry_run=True`)
- No auto-order / no protocol rule changes in View layer
- Trading authorization: NOT GRANTED by this package alone
