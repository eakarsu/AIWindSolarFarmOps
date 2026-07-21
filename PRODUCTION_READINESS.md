# Production readiness

The governed API at `/api/governance` is the supported wind and solar farm operations path. It records tenant/site-scoped telemetry and SCADA evidence, constraints, historical replay, operator-reviewed dispatch proposals, observed execution, manual fallback, realized outcomes, and immutable connector history. It never commands equipment, grid bids, or field work.

## Deployment sequence

1. Review and back up the database, then apply `backend/migrations/001_governed_renewable_operations.sql` separately using a least-privilege migration identity.
2. Copy `.env.example` to `.env`, replace every placeholder, and configure a unique 32-plus-character JWT secret and explicit CORS allowlist.
3. Install locked dependencies explicitly. `start.sh` only supervises the already-installed backend and frontend.
4. Provision tenant memberships and deploy separately reviewed connector workers. Workers exchange opaque references, versions, digests, and receipts; raw secrets and sensitive content do not enter workflow payloads.
5. Exercise retry, dead-letter, reconciliation, retention/deletion, audit export, backup, restore, and incident-response procedures before production.

Production rejects wildcard CORS, weak secrets, provider/demo flags, generated routes, and startup schema mutation. The additive migration never drops or truncates tables. Legacy plaintext accounts require migration to `scrypt$<32 hex salt>$<128 hex digest>`. Destructive demo seed execution requires `ALLOW_DEMO_SEED=true`, a 12-plus-character `DEMO_PASSWORD`, and a non-production database.

## Required external validation

Validate SCADA, turbine, inverter, meter, ISO/RTO, ERP/WMS/TMS, GIS, weather, and maintenance contracts in a lab. Replay historical operating scenarios and measure forecast error, constraint violations, missed telemetry, latency, fallback, rollback, and realized generation. No live equipment or grid-market action was performed.
