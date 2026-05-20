-- AIWindSolarFarmOps schema (18 entities + ai_results + users + notifications + attachments + webhooks)

-- ─────────────────────────────────────────────
-- 18 domain entities
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS turbines (
  id              SERIAL PRIMARY KEY,
  turbine_id      VARCHAR(50) UNIQUE,
  site            VARCHAR(120),
  vendor          VARCHAR(80),
  model           VARCHAR(80),
  capacity_mw     NUMERIC(6,2) DEFAULT 0,
  status          VARCHAR(30) DEFAULT 'operational',
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS inverters (
  id              SERIAL PRIMARY KEY,
  inverter_id     VARCHAR(50) UNIQUE,
  site            VARCHAR(120),
  vendor          VARCHAR(80),
  model           VARCHAR(80),
  status          VARCHAR(30) DEFAULT 'operational',
  last_event      VARCHAR(200),
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS panels (
  id              SERIAL PRIMARY KEY,
  panel_id        VARCHAR(50) UNIQUE,
  array_name      VARCHAR(120),
  model           VARCHAR(80),
  tilt_deg        NUMERIC(5,2) DEFAULT 0,
  azimuth         NUMERIC(5,2) DEFAULT 0,
  status          VARCHAR(30) DEFAULT 'operational',
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS transformers (
  id              SERIAL PRIMARY KEY,
  xfmr_id         VARCHAR(50) UNIQUE,
  site            VARCHAR(120),
  voltage_kv      NUMERIC(7,2) DEFAULT 0,
  status          VARCHAR(30) DEFAULT 'operational',
  last_inspection DATE,
  manufacturer    VARCHAR(80),
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS met_masts (
  id              SERIAL PRIMARY KEY,
  mast_id         VARCHAR(50) UNIQUE,
  site            VARCHAR(120),
  height_m        NUMERIC(6,2) DEFAULT 0,
  instruments     TEXT,
  status          VARCHAR(30) DEFAULT 'operational',
  last_calibration DATE,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS ppa_contracts (
  id              SERIAL PRIMARY KEY,
  ppa_id          VARCHAR(50) UNIQUE,
  counterparty    VARCHAR(150),
  term_years      INTEGER DEFAULT 0,
  price_per_mwh   NUMERIC(8,2) DEFAULT 0,
  start_date      DATE,
  status          VARCHAR(30) DEFAULT 'active',
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS work_orders (
  id              SERIAL PRIMARY KEY,
  wo_id           VARCHAR(50) UNIQUE,
  asset_id        VARCHAR(50),
  type            VARCHAR(40),
  priority        VARCHAR(20) DEFAULT 'normal',
  assignee        VARCHAR(120),
  status          VARCHAR(30) DEFAULT 'open',
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS maintenance_logs (
  id              SERIAL PRIMARY KEY,
  log_id          VARCHAR(50) UNIQUE,
  asset_id        VARCHAR(50),
  work            TEXT,
  technician      VARCHAR(120),
  hours_spent     NUMERIC(6,2) DEFAULT 0,
  completed_at    TIMESTAMPTZ,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS sensor_streams (
  id              SERIAL PRIMARY KEY,
  stream_id       VARCHAR(50) UNIQUE,
  asset_id        VARCHAR(50),
  sensor          VARCHAR(80),
  units           VARCHAR(40),
  last_value      NUMERIC(12,3) DEFAULT 0,
  last_ts         TIMESTAMPTZ,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS faults (
  id              SERIAL PRIMARY KEY,
  fault_id        VARCHAR(50) UNIQUE,
  asset_id        VARCHAR(50),
  code            VARCHAR(40),
  severity        VARCHAR(20) DEFAULT 'medium',
  opened_at       TIMESTAMPTZ,
  status          VARCHAR(30) DEFAULT 'open',
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS curtailment_events (
  id              SERIAL PRIMARY KEY,
  event_id        VARCHAR(50) UNIQUE,
  site            VARCHAR(120),
  reason          VARCHAR(120),
  mw_curtailed    NUMERIC(8,2) DEFAULT 0,
  start_at        TIMESTAMPTZ,
  end_at          TIMESTAMPTZ,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS weather_forecasts (
  id              SERIAL PRIMARY KEY,
  forecast_id     VARCHAR(50) UNIQUE,
  site            VARCHAR(120),
  valid_at        TIMESTAMPTZ,
  wind_mps        NUMERIC(6,2) DEFAULT 0,
  irradiance_wm2  NUMERIC(8,2) DEFAULT 0,
  temperature_c   NUMERIC(5,2) DEFAULT 0,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS energy_meters (
  id              SERIAL PRIMARY KEY,
  meter_id        VARCHAR(50) UNIQUE,
  site            VARCHAR(120),
  reading_kwh     NUMERIC(14,2) DEFAULT 0,
  reading_at      TIMESTAMPTZ,
  status          VARCHAR(30) DEFAULT 'ok',
  comm_status     VARCHAR(30) DEFAULT 'online',
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS technicians (
  id              SERIAL PRIMARY KEY,
  tech_id         VARCHAR(50) UNIQUE,
  name            VARCHAR(150),
  certifications  TEXT,
  base            VARCHAR(120),
  status          VARCHAR(30) DEFAULT 'available',
  contact         VARCHAR(200),
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS spare_parts (
  id              SERIAL PRIMARY KEY,
  part_id         VARCHAR(50) UNIQUE,
  sku             VARCHAR(80),
  description     VARCHAR(300),
  qty_on_hand     INTEGER DEFAULT 0,
  location        VARCHAR(120),
  reorder_point   INTEGER DEFAULT 0,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS safety_incidents (
  id              SERIAL PRIMARY KEY,
  incident_id     VARCHAR(50) UNIQUE,
  site            VARCHAR(120),
  type            VARCHAR(60),
  severity        VARCHAR(20) DEFAULT 'low',
  opened_at       TIMESTAMPTZ,
  status          VARCHAR(30) DEFAULT 'open',
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS performance_kpis (
  id              SERIAL PRIMARY KEY,
  kpi_id          VARCHAR(50) UNIQUE,
  site            VARCHAR(120),
  kpi             VARCHAR(80),
  value           NUMERIC(12,3) DEFAULT 0,
  period          VARCHAR(40),
  target          NUMERIC(12,3) DEFAULT 0,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS audit_log (
  id              SERIAL PRIMARY KEY,
  entry_id        VARCHAR(50) UNIQUE,
  actor           VARCHAR(150),
  target          VARCHAR(200),
  action          VARCHAR(80),
  result          VARCHAR(60),
  ts              TIMESTAMPTZ,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ─────────────────────────────────────────────
-- AI results history
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS ai_results (
  id              SERIAL PRIMARY KEY,
  feature         VARCHAR(80) NOT NULL,
  input           JSONB,
  output          JSONB,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_ai_results_feature_created
  ON ai_results (feature, created_at DESC);

-- ─────────────────────────────────────────────
-- RBAC users (admin|ops|viewer)
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
  id              SERIAL PRIMARY KEY,
  email           VARCHAR(150) UNIQUE NOT NULL,
  password        VARCHAR(120) NOT NULL,
  name            VARCHAR(120),
  role            VARCHAR(20) DEFAULT 'viewer',
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ─────────────────────────────────────────────
-- Notifications
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS notifications (
  id              SERIAL PRIMARY KEY,
  user_id         INTEGER,
  title           VARCHAR(200),
  body            TEXT,
  severity        VARCHAR(20) DEFAULT 'info',
  source          VARCHAR(80),
  read_at         TIMESTAMPTZ,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_notifications_user_unread
  ON notifications (user_id, read_at);

-- ─────────────────────────────────────────────
-- Attachments
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS attachments (
  id              SERIAL PRIMARY KEY,
  resource_type   VARCHAR(60),
  resource_id     INTEGER,
  filename        VARCHAR(255),
  original_name   VARCHAR(255),
  mimetype        VARCHAR(120),
  size_bytes      INTEGER,
  uploaded_by     VARCHAR(150),
  created_at      TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_attachments_resource
  ON attachments (resource_type, resource_id);

-- ─────────────────────────────────────────────
-- Webhooks
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS webhooks (
  id              SERIAL PRIMARY KEY,
  name            VARCHAR(120),
  url             VARCHAR(500),
  secret          VARCHAR(120),
  events          TEXT,
  active          BOOLEAN DEFAULT TRUE,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS webhook_deliveries (
  id              SERIAL PRIMARY KEY,
  webhook_id      INTEGER,
  event           VARCHAR(120),
  payload         JSONB,
  status_code     INTEGER,
  response_body   TEXT,
  attempted_at    TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_webhook_deliveries_webhook
  ON webhook_deliveries (webhook_id, attempted_at DESC);
