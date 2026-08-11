"""SQLite schema and connection helpers for portfolio judgment verification."""

from __future__ import annotations

import sqlite3
from datetime import datetime, timezone
from pathlib import Path

from portfolio import PROTOCOL_VERSION, SEED_ASSETS

SCHEMA_SQL = """
CREATE TABLE IF NOT EXISTS meta (
  key   TEXT PRIMARY KEY,
  value TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS asset (
  asset_id     INTEGER PRIMARY KEY,
  code         TEXT NOT NULL UNIQUE,
  name         TEXT NOT NULL,
  asset_class  TEXT NOT NULL,
  currency     TEXT NOT NULL,
  vendor       TEXT,
  notes        TEXT,
  is_active    INTEGER NOT NULL DEFAULT 1,
  created_at   TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS market_daily (
  date             TEXT NOT NULL,
  asset_id         INTEGER NOT NULL REFERENCES asset(asset_id),
  price            REAL,
  price_jpy        REAL,
  ret_1d           REAL,
  volume           REAL,
  extra_json       TEXT,
  source           TEXT NOT NULL,
  protocol_version TEXT,
  collected_at     TEXT NOT NULL,
  PRIMARY KEY (date, asset_id)
);

CREATE TABLE IF NOT EXISTS fx_daily (
  date         TEXT PRIMARY KEY,
  usdjpy       REAL NOT NULL,
  source       TEXT NOT NULL,
  collected_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS hypothesis (
  hypothesis_id        INTEGER PRIMARY KEY,
  as_of_date           TEXT NOT NULL,
  title                TEXT NOT NULL,
  thesis               TEXT NOT NULL,
  rationale            TEXT,
  expected_ranking     TEXT NOT NULL,
  compare_set          TEXT NOT NULL,
  horizon              TEXT NOT NULL,
  horizon_end          TEXT,
  status               TEXT NOT NULL,
  outcome_summary      TEXT,
  actual_ranking       TEXT,
  linked_review_run_id INTEGER,
  protocol_version     TEXT,
  created_at           TEXT NOT NULL,
  updated_at           TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS holdings_snapshot (
  snapshot_id      INTEGER PRIMARY KEY,
  as_of_date       TEXT NOT NULL,
  account          TEXT NOT NULL,
  position_id      TEXT NOT NULL,
  position_label   TEXT,
  asset_code       TEXT NOT NULL,
  cost_jpy         REAL,
  value_jpy        REAL,
  units            REAL,
  unit_cost_jpy    REAL,
  pnl_jpy          REAL,
  pnl_pct          REAL,
  hypothesis_id    INTEGER,  -- optional; future Decision may add decision_id without replacing this
  note             TEXT,
  protocol_version TEXT,
  created_at       TEXT NOT NULL,
  UNIQUE (as_of_date, position_id)
);

CREATE TABLE IF NOT EXISTS rebalance_event (
  event_id         INTEGER PRIMARY KEY,
  event_date       TEXT NOT NULL,
  asset_code       TEXT NOT NULL,
  event_type       TEXT NOT NULL,
  before_json      TEXT,
  after_json       TEXT,
  diff_json        TEXT,
  source           TEXT,
  protocol_version TEXT,
  created_at       TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS review_run (
  run_id           INTEGER PRIMARY KEY,
  review_type      TEXT NOT NULL,
  period_start     TEXT NOT NULL,
  period_end       TEXT NOT NULL,
  generated_at     TEXT NOT NULL,
  protocol_version TEXT,
  params_json      TEXT,
  status           TEXT,
  summary_text     TEXT
);

CREATE TABLE IF NOT EXISTS review_metric (
  run_id     INTEGER NOT NULL REFERENCES review_run(run_id),
  metric_key TEXT NOT NULL,
  asset_code TEXT NOT NULL,
  value      REAL,
  PRIMARY KEY (run_id, metric_key, asset_code)
);

CREATE TABLE IF NOT EXISTS hypothesis_review (
  review_id      INTEGER PRIMARY KEY,
  hypothesis_id  INTEGER NOT NULL REFERENCES hypothesis(hypothesis_id),
  review_date    TEXT NOT NULL,
  actual_ranking TEXT NOT NULL,
  result         TEXT NOT NULL,
  comment        TEXT,
  created_at     TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_market_daily_asset_date
  ON market_daily(asset_id, date);
CREATE INDEX IF NOT EXISTS idx_hypothesis_status
  ON hypothesis(status, as_of_date);
CREATE INDEX IF NOT EXISTS idx_holdings_position
  ON holdings_snapshot(position_id, as_of_date);
CREATE INDEX IF NOT EXISTS idx_hypothesis_review_hyp
  ON hypothesis_review(hypothesis_id, review_date);
"""


def utc_now_iso() -> str:
    return datetime.now(timezone.utc).replace(microsecond=0).isoformat()


def db_path(path: str | Path | None = None) -> Path:
    from portfolio import DEFAULT_DB_PATH

    return Path(path or DEFAULT_DB_PATH)


def connect(path: str | Path | None = None) -> sqlite3.Connection:
    p = db_path(path)
    p.parent.mkdir(parents=True, exist_ok=True)
    conn = sqlite3.connect(str(p))
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON")
    return conn


def init_db(path: str | Path | None = None) -> Path:
    """Create schema, seed assets, set meta. Idempotent."""
    p = db_path(path)
    conn = connect(p)
    try:
        conn.executescript(SCHEMA_SQL)
        _seed_meta(conn)
        _seed_assets(conn)
        conn.commit()
    finally:
        conn.close()
    return p


def _seed_meta(conn: sqlite3.Connection) -> None:
    now = utc_now_iso()
    rows = [
        ("schema_version", "2"),
        ("protocol_family", "portfolio_judgment"),
        ("protocol_version", PROTOCOL_VERSION),
        ("created_at", now),
        ("purpose", "Verify investment judgments (Fact+Hypothesis+[Decision]+Position→Review); prices are means, not the end."),
    ]
    for key, value in rows:
        existing = conn.execute("SELECT value FROM meta WHERE key = ?", (key,)).fetchone()
        if existing is None:
            conn.execute("INSERT INTO meta(key, value) VALUES (?, ?)", (key, value))
        elif key in ("protocol_version", "schema_version"):
            conn.execute("UPDATE meta SET value = ? WHERE key = ?", (value, key))


def _seed_assets(conn: sqlite3.Connection) -> None:
    now = utc_now_iso()
    for a in SEED_ASSETS:
        row = conn.execute("SELECT asset_id FROM asset WHERE code = ?", (a["code"],)).fetchone()
        if row is None:
            conn.execute(
                """
                INSERT INTO asset(code, name, asset_class, currency, vendor, notes, is_active, created_at)
                VALUES (?, ?, ?, ?, ?, ?, 1, ?)
                """,
                (
                    a["code"],
                    a["name"],
                    a["asset_class"],
                    a["currency"],
                    a["vendor"],
                    a["notes"],
                    now,
                ),
            )


def get_asset_id(conn: sqlite3.Connection, code: str) -> int | None:
    row = conn.execute("SELECT asset_id FROM asset WHERE code = ?", (code,)).fetchone()
    return int(row["asset_id"]) if row else None


def get_asset_map(conn: sqlite3.Connection) -> dict[str, int]:
    rows = conn.execute("SELECT code, asset_id FROM asset WHERE is_active = 1").fetchall()
    return {r["code"]: int(r["asset_id"]) for r in rows}


def upsert_market_daily(
    conn: sqlite3.Connection,
    *,
    date: str,
    asset_id: int,
    price: float | None,
    source: str,
    price_jpy: float | None = None,
    ret_1d: float | None = None,
    volume: float | None = None,
    extra_json: str | None = None,
    protocol_version: str = PROTOCOL_VERSION,
    collected_at: str | None = None,
) -> None:
    conn.execute(
        """
        INSERT INTO market_daily(
          date, asset_id, price, price_jpy, ret_1d, volume, extra_json,
          source, protocol_version, collected_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(date, asset_id) DO UPDATE SET
          price = excluded.price,
          price_jpy = excluded.price_jpy,
          ret_1d = excluded.ret_1d,
          volume = excluded.volume,
          extra_json = excluded.extra_json,
          source = excluded.source,
          protocol_version = excluded.protocol_version,
          collected_at = excluded.collected_at
        """,
        (
            date,
            asset_id,
            price,
            price_jpy,
            ret_1d,
            volume,
            extra_json,
            source,
            protocol_version,
            collected_at or utc_now_iso(),
        ),
    )


def upsert_fx_daily(
    conn: sqlite3.Connection,
    *,
    date: str,
    usdjpy: float,
    source: str,
    collected_at: str | None = None,
) -> None:
    conn.execute(
        """
        INSERT INTO fx_daily(date, usdjpy, source, collected_at)
        VALUES (?, ?, ?, ?)
        ON CONFLICT(date) DO UPDATE SET
          usdjpy = excluded.usdjpy,
          source = excluded.source,
          collected_at = excluded.collected_at
        """,
        (date, usdjpy, source, collected_at or utc_now_iso()),
    )


def insert_market_daily_ignore(
    conn: sqlite3.Connection,
    *,
    date: str,
    asset_id: int,
    price: float | None,
    source: str,
    price_jpy: float | None = None,
    ret_1d: float | None = None,
    volume: float | None = None,
    extra_json: str | None = None,
    protocol_version: str = PROTOCOL_VERSION,
    collected_at: str | None = None,
) -> bool:
    """Insert one bar; skip if (date, asset_id) already exists. Returns True if inserted."""
    cur = conn.execute(
        """
        INSERT INTO market_daily(
          date, asset_id, price, price_jpy, ret_1d, volume, extra_json,
          source, protocol_version, collected_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(date, asset_id) DO NOTHING
        """,
        (
            date,
            asset_id,
            price,
            price_jpy,
            ret_1d,
            volume,
            extra_json,
            source,
            protocol_version,
            collected_at or utc_now_iso(),
        ),
    )
    return cur.rowcount > 0


def insert_fx_daily_ignore(
    conn: sqlite3.Connection,
    *,
    date: str,
    usdjpy: float,
    source: str,
    collected_at: str | None = None,
) -> bool:
    """Insert one FX row; skip if date already exists. Returns True if inserted."""
    cur = conn.execute(
        """
        INSERT INTO fx_daily(date, usdjpy, source, collected_at)
        VALUES (?, ?, ?, ?)
        ON CONFLICT(date) DO NOTHING
        """,
        (date, usdjpy, source, collected_at or utc_now_iso()),
    )
    return cur.rowcount > 0


def market_date_range(
    conn: sqlite3.Connection,
    asset_id: int,
) -> tuple[str | None, str | None]:
    row = conn.execute(
        """
        SELECT MIN(date) AS mn, MAX(date) AS mx
        FROM market_daily
        WHERE asset_id = ? AND price IS NOT NULL
        """,
        (asset_id,),
    ).fetchone()
    if row is None:
        return None, None
    return row["mn"], row["mx"]


def fx_date_range(conn: sqlite3.Connection) -> tuple[str | None, str | None]:
    row = conn.execute(
        "SELECT MIN(date) AS mn, MAX(date) AS mx FROM fx_daily"
    ).fetchone()
    if row is None:
        return None, None
    return row["mn"], row["mx"]


if __name__ == "__main__":
    path = init_db()
    print(f"Initialized {path}")
