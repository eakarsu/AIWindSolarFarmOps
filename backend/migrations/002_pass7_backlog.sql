-- AIWindSolarFarmOps — Pass 7: full backlog implementation
-- Adds tables for SCADA event ingest, work-order state machine, ISO/RTO bid submissions.
-- Non-breaking: all CREATE TABLE IF NOT EXISTS; existing tables untouched.

-- ─────────────────────────────────────────────
-- SCADA event ingest schema (NEEDS-PRODUCT-DECISION resolved as:
-- canonical event envelope, idempotent by source_event_id, raw payload kept)
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS scada_events (
  id               SERIAL PRIMARY KEY,
  source_event_id  VARCHAR(120) UNIQUE,           -- vendor-supplied unique id for idempotency
  source_system    VARCHAR(80),                   -- e.g. "GE-ServiceLink", "Vestas-VOC", "SMA-Cluster"
  asset_id         VARCHAR(50),                   -- WTG-xx / INV-xx / XFMR-xx
  asset_type       VARCHAR(40),                   -- turbine|inverter|transformer|met_mast|battery
  site             VARCHAR(120),
  event_type       VARCHAR(60),                   -- fault|alarm|status|setpoint|telemetry|trip|reset
  severity         VARCHAR(20) DEFAULT 'info',    -- info|low|medium|high|critical
  code             VARCHAR(60),                   -- vendor event code (e.g. "P0312", "F2034")
  message          TEXT,
  payload          JSONB,                         -- full vendor payload, no loss
  event_ts         TIMESTAMPTZ,                   -- when the event happened (per source)
  received_at      TIMESTAMPTZ DEFAULT NOW(),
  processed_at     TIMESTAMPTZ,
  ingest_status    VARCHAR(30) DEFAULT 'received' -- received|processed|deduplicated|failed
);
CREATE INDEX IF NOT EXISTS idx_scada_events_asset_ts
  ON scada_events (asset_id, event_ts DESC);
CREATE INDEX IF NOT EXISTS idx_scada_events_site_ts
  ON scada_events (site, event_ts DESC);
CREATE INDEX IF NOT EXISTS idx_scada_events_status
  ON scada_events (ingest_status, received_at DESC);

-- ─────────────────────────────────────────────
-- Work-order state machine (NEEDS-PRODUCT-DECISION resolved as:
-- canonical states open→triaged→scheduled→in_progress→blocked↔in_progress→done→closed,
-- with cancel from any non-terminal state. Transitions audited.)
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS work_order_transitions (
  id               SERIAL PRIMARY KEY,
  wo_id            VARCHAR(50),
  from_state       VARCHAR(30),
  to_state         VARCHAR(30),
  actor            VARCHAR(150),
  reason           TEXT,
  meta             JSONB,
  created_at       TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_wo_transitions_wo
  ON work_order_transitions (wo_id, created_at DESC);

-- ─────────────────────────────────────────────
-- ISO/RTO bid submissions (NEEDS-CREDS: real submission gated behind 503
-- but persist the draft + intended target so review/queue is durable)
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS iso_bid_submissions (
  id               SERIAL PRIMARY KEY,
  bid_id           VARCHAR(50) UNIQUE,
  iso              VARCHAR(20),                   -- ERCOT|CAISO|MISO|NYISO|PJM|SPP|ISONE|AESO|AEMO
  market           VARCHAR(40),                   -- DAM|RTM|ASM|FCAS|BM
  site             VARCHAR(120),
  resource_id      VARCHAR(80),
  delivery_date    DATE,
  bid_payload      JSONB,                         -- full bid blocks (hour x MW x $/MWh)
  status           VARCHAR(30) DEFAULT 'draft',   -- draft|queued|submitted|rejected|withdrawn|stubbed_no_creds
  status_reason    TEXT,
  submitted_at     TIMESTAMPTZ,
  created_at       TIMESTAMPTZ DEFAULT NOW(),
  updated_at       TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_iso_bids_iso_date
  ON iso_bid_submissions (iso, delivery_date DESC);
