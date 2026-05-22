# Audit Note — AIWindSolarFarmOps

Stack: Node+Express+React+Postgres+OpenRouter. Domain: wind/solar farm operations.

## Existing AI Endpoints (18, in `backend/routes/ai.js`)
`/samples`, `/history`, `forecast-generation`, `fault-prognostic`, `curtailment-optimize`, `ppa-settlement`, `schedule-maintenance`, `fleet-health`, `weather-window`, `blade-inspection-summary`, `draft-work-order`, `executive-brief`, `ramp-rate-strategy`, `inverter-clipping-detect`, `turbine-availability`, `vendor-warranty-claim`, `asset-deg-trend`, `root-cause-analyzer`. Each has a dedicated `AI*Page.js` frontend page.

## Existing Non-AI CRUD (25 routes)
turbines, inverters, panels, transformers, metMasts, energyMeters, sensorStreams, faults, curtailmentEvents, workOrders, maintenanceLogs, spareParts, technicians, ppaContracts, performanceKpis, safetyIncidents, weatherForecasts, attachments, auditLog, customViews, dashboard, notifications, webhooks, auth.

## Gap Analysis vs Requested

### AI (requested → status)
- production forecaster day-ahead+intraday → PARTIAL (`forecast-generation` exists; no intraday split)
- turbine-fault classifier → COVERED (`fault-prognostic`, `root-cause-analyzer`)
- inverter-anomaly detector → COVERED (`inverter-clipping-detect`)
- curtailment-loss explainer → PARTIAL (`curtailment-optimize` optimizes, no loss-attribution narrator)
- O&M-ticket prioritizer → MISSING (have `draft-work-order`, `schedule-maintenance`; no priority scorer)
- PPA-shortfall narrator → PARTIAL (`ppa-settlement` exists; no shortfall-specific narrative)

### Non-AI
- asset CRUD → COVERED
- SCADA event ingest → MISSING (sensorStreams CRUD only, no ingest endpoint)
- work order workflow → PARTIAL (CRUD only, no state-machine)
- ISO/RTO bid submission → MISSING

### Custom
- drone blade-inspection pipeline → PARTIAL (`blade-inspection-summary` AI only, no image pipeline)
- soiling/icing detector → MISSING
- hybrid-storage co-optimizer → MISSING

## Implemented
None — audit-only.

## Status
Counts: 18 AI endpoints, 25 non-AI route files, 38 frontend pages. Coverage strong on core AI verbs; gaps in intraday forecasting, ticket prioritizer, SCADA ingest, ISO/RTO bid, soiling/icing, hybrid-storage co-opt, drone image pipeline. Audit-only — no code changes.

## Apply pass 7 (full backlog implementation)

### New AI endpoints (MECHANICAL — 6)
All POST, all mounted on existing `/api/ai` router in `backend/routes/ai.js`, all with `samples` + `history` parity and persisted to `ai_results`.
- `POST /api/ai/intraday-forecast` — 15-min resolution nowcast, distinct from day-ahead `forecast-generation`. Returns quarter-hour blocks with P10/P90, ramp events, deviation_vs_day_ahead_mwh.
- `POST /api/ai/ticket-prioritizer` — risk-weighted O&M work-order ranking (safety, revenue, warranty, lead-time).
- `POST /api/ai/ppa-shortfall-narrator` — attribution + counterparty draft for a PPA shortfall, distinct from `ppa-settlement`.
- `POST /api/ai/soiling-icing-detect` — text-only soiling/icing detector from production-deviation + weather signature.
- `POST /api/ai/hybrid-storage-co-opt` — hybrid renewable+BESS dispatch co-optimizer.
- `POST /api/ai/drone-blade-inspection` — AI summary endpoint for a drone image pipeline (consumes image refs / metadata, not bytes).

### New non-AI endpoints (NEEDS-PRODUCT-DECISION — resolved)
- `routes/scadaEvents.js` mounted at `/api/scada-events`:
  - `GET /` (filter by asset_id, site, status), `GET /:id`, `GET /schema`,
  - `POST /` (idempotent on `source_event_id`), `POST /bulk` (≤1000).
  - **Decision**: canonical envelope `{source_event_id, source_system, asset_id, asset_type, site, event_type, severity, code, message, payload, event_ts}`; idempotency on `source_event_id`; raw payload preserved as JSONB; high-severity faults fan out as webhooks (`scada.<event_type>.<severity>`).
- `routes/workOrderStateMachine.js` mounted at `/api/work-order-fsm`:
  - `GET /states`, `GET /:wo_id/history`, `POST /:wo_id/transition`.
  - **Decision**: FSM `open → triaged → scheduled → in_progress → done → closed` with `blocked` branch (reset back to scheduled/in_progress), `cancelled` soft-terminal, reopen `done → in_progress`. Every transition audited to `work_order_transitions` and fans out as `work_order.<to>` webhook.

### New non-AI endpoint (NEEDS-CREDS — 503 stub)
- `routes/isoBids.js` mounted at `/api/iso-bids`:
  - `GET /`, `GET /:id`, `POST /` (create draft — works), `POST /:id/withdraw` (works),
  - `POST /:id/submit` → **503** `iso_bid_submission_unavailable` with helpful `detail`, ISO, market, bid_id, and `what_would_happen` description. Row marked `status='stubbed_no_creds'`. Draft persistence + supported-ISO list still functional.

### New schema (`backend/migrations/002_pass7_backlog.sql`)
Three tables added; all `CREATE TABLE IF NOT EXISTS`, no breaking changes:
- `scada_events` (idempotent on `source_event_id` UNIQUE; indexes on asset/site/status).
- `work_order_transitions` (audit trail; indexed on `wo_id`).
- `iso_bid_submissions` (unique `bid_id`; indexed on `iso, delivery_date`).

### New frontend pages
- AI (6): `AIIntradayForecastPage.js`, `AITicketPrioritizerPage.js`, `AIPpaShortfallPage.js`, `AISoilingIcingPage.js`, `AIHybridStoragePage.js`, `AIDroneBladeInspectionPage.js`.
- Non-AI (3): `ScadaEventsPage.js` (schema viewer + ingest form + recent events table), `WorkOrderStateMachinePage.js` (FSM viewer + transition runner + history), `IsoBidsPage.js` (draft create + submit→503 surfaced as expected gating).
- `App.js` routes added BEFORE `*` catch-all redirect; `Sidebar.js` links added to Operations, Contracts, and AI sections.

### Mount order
All new routers mounted in `backend/server.js` BEFORE `app.listen` (no 404 handler exists in this project; everything inside `/api/*` flows through `authenticateToken` first per existing pattern).

### Syntax / safety
- `node --check` clean on every modified .js file: `backend/server.js`, `backend/services/ai.js`, `backend/routes/ai.js`, `backend/routes/scadaEvents.js`, `backend/routes/workOrderStateMachine.js`, `backend/routes/isoBids.js`, `frontend/src/services/api.js`.
- No new npm deps. No existing route, table, or page modified destructively (only additive edits to `services/ai.js`, `routes/ai.js`, `server.js`, `App.js`, `Sidebar.js`, `services/api.js`).

### Skipped / explicit non-goals
- Real ISO/RTO submission (NEEDS-CREDS) — gated 503 as specified.
- No image-bytes processing in drone pipeline — endpoint consumes image *references/metadata* only; matches "AI summary endpoint" requirement.
- No frontend refresh asks; migration must be applied by the project's existing migration runner (matches house pattern — `001_schema.sql` is consumed the same way).

### Status
Pass 7 complete. 6 new AI verbs (24 total), 3 new non-AI route files (28 total), 9 new frontend pages (47 total), 3 new tables (`scada_events`, `work_order_transitions`, `iso_bid_submissions`). All modified backend JS passes `node --check`. NEEDS-CREDS endpoints return 503 with structured stub. Mounts ordered before `app.listen` and before frontend catch-all.
