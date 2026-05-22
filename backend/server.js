const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const { authenticateToken } = require('./middleware/auth');
const pool = require('./config/database');
const { fireWebhook } = require('./services/webhooks');

// Side-effect hooks (kept generic for renewable-energy domain)
async function onFaultCreated(row) {
  const sev = String(row.severity || '').toLowerCase();
  if (['critical', 'high'].includes(sev)) {
    try {
      await pool.query(
        `INSERT INTO notifications (user_id, title, body, severity, source)
         VALUES (NULL, $1, $2, $3, $4)`,
        [`Fault ${row.code}`,
         `${row.asset_id} — opened ${row.opened_at}`.slice(0, 1000),
         sev,
         'faults']
      );
    } catch (e) { console.warn('[notify] fault insert failed:', e.message); }
    fireWebhook(`fault.${sev}`, { row }).catch(() => {});
  }
}

const app = express();
const PORT = process.env.BACKEND_PORT || 3063;

// Middleware
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
const allowedOrigins = (process.env.ALLOWED_ORIGINS || 'http://localhost:3062,http://localhost:3063,http://localhost:3000')
  .split(',').map((o) => o.trim()).filter(Boolean);
app.use(cors({
  origin: (origin, cb) => {
    if (!origin) return cb(null, true);
    if (allowedOrigins.includes('*') || allowedOrigins.includes(origin)) return cb(null, true);
    return cb(new Error(`Origin ${origin} not allowed by CORS`));
  },
  credentials: true,
}));
app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: true, limit: '20mb' }));

// Health check (public)
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Auth (public)
app.use('/api/auth', require('./routes/auth'));

// Everything below this line requires a Bearer token.
app.use('/api', authenticateToken);

// ─────────────────────────────────────────────
// 18 domain CRUD routes (all via _crudFactory which already embeds RBAC + bulk-import + attachments)
// ─────────────────────────────────────────────
app.use('/api/turbines',           require('./routes/turbines'));
app.use('/api/inverters',          require('./routes/inverters'));
app.use('/api/panels',             require('./routes/panels'));
app.use('/api/transformers',       require('./routes/transformers'));
app.use('/api/met-masts',          require('./routes/metMasts'));
app.use('/api/ppa-contracts',      require('./routes/ppaContracts'));
app.use('/api/work-orders',        require('./routes/workOrders'));
app.use('/api/maintenance-logs',   require('./routes/maintenanceLogs'));
app.use('/api/sensor-streams',     require('./routes/sensorStreams'));
app.use('/api/faults',             require('./routes/faults'));
app.use('/api/curtailment-events', require('./routes/curtailmentEvents'));
app.use('/api/weather-forecasts',  require('./routes/weatherForecasts'));
app.use('/api/energy-meters',      require('./routes/energyMeters'));
app.use('/api/technicians',        require('./routes/technicians'));
app.use('/api/spare-parts',        require('./routes/spareParts'));
app.use('/api/safety-incidents',   require('./routes/safetyIncidents'));
app.use('/api/performance-kpis',   require('./routes/performanceKpis'));
app.use('/api/audit-log',          require('./routes/auditLog'));

// AI routes (16 sub-endpoints + samples + history)
app.use('/api/ai', require('./routes/ai'));

// Cross-cutting
app.use('/api/notifications', require('./routes/notifications'));
app.use('/api/attachments',   require('./routes/attachments'));
app.use('/api/webhooks',      require('./routes/webhooks'));

// Dashboard stats
app.use('/api/dashboard', require('./routes/dashboard'));

// Custom domain views (turbine map + 24h generation curve)
app.use('/api/custom-views', require('./routes/customViews'));
app.use('/api/dispatch-confidence', require('./routes/dispatchConfidence'));

// ─────────────────────────────────────────────
// Pass 7 — full backlog mounts (SCADA ingest, WO state machine, ISO/RTO bids 503-stub)
// Mounted before app.listen so 404s for these paths never occur.
// ─────────────────────────────────────────────
app.use('/api/scada-events',    require('./routes/scadaEvents'));
app.use('/api/work-order-fsm',  require('./routes/workOrderStateMachine'));
app.use('/api/iso-bids',        require('./routes/isoBids'));

app.listen(PORT, () => {
  console.log(`\nAI Wind Solar Farm Ops API running on http://localhost:${PORT}\n`);
});
