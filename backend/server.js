const path = require('node:path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const { validateRuntime } = require('./governance/runtime');
validateRuntime();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const { authenticateToken } = require('./middleware/auth');
const { createProviderGate } = require('./governance/providerGate');

const app = express();
const port = Number(process.env.BACKEND_PORT);
if (!Number.isInteger(port) || port < 1 || port > 65535) throw new Error('BACKEND_PORT must be an assigned TCP port.');
const origins = String(process.env.ALLOWED_ORIGINS || process.env.CORS_ORIGINS || '')
  .split(',').map((value) => value.trim()).filter(Boolean);
if (!origins.length || origins.includes('*')) throw new Error('ALLOWED_ORIGINS must be an explicit allowlist.');

app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(cors({ origin(origin, callback) {
  if (!origin || origins.includes(origin)) return callback(null, true);
  return callback(new Error('Origin is not allowed by CORS.'));
}, credentials: true }));
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

app.get('/api/health', (_req, res) => res.json({ status: 'ok', service: 'AIWindSolarFarmOps', timestamp: new Date().toISOString() }));
app.use('/api/auth', require('./routes/auth'));
app.use('/api/governance', require('./governance/router'));

app.use('/api', authenticateToken);
const protectedRoutes = [
  ['/api/turbines','./routes/turbines'],['/api/inverters','./routes/inverters'],
  ['/api/panels','./routes/panels'],['/api/transformers','./routes/transformers'],
  ['/api/met-masts','./routes/metMasts'],['/api/ppa-contracts','./routes/ppaContracts'],
  ['/api/work-orders','./routes/workOrders'],['/api/maintenance-logs','./routes/maintenanceLogs'],
  ['/api/sensor-streams','./routes/sensorStreams'],['/api/faults','./routes/faults'],
  ['/api/curtailment-events','./routes/curtailmentEvents'],['/api/weather-forecasts','./routes/weatherForecasts'],
  ['/api/energy-meters','./routes/energyMeters'],['/api/technicians','./routes/technicians'],
  ['/api/spare-parts','./routes/spareParts'],['/api/safety-incidents','./routes/safetyIncidents'],
  ['/api/performance-kpis','./routes/performanceKpis'],['/api/audit-log','./routes/auditLog'],
  ['/api/notifications','./routes/notifications'],['/api/attachments','./routes/attachments'],
  ['/api/dashboard','./routes/dashboard'],['/api/custom-views','./routes/customViews'],
  ['/api/work-order-fsm','./routes/workOrderStateMachine']
];
for (const [mount, modulePath] of protectedRoutes) app.use(mount, require(modulePath));

const providerGate = createProviderGate(['/api/ai','/api/webhooks','/api/scada-events','/api/iso-bids','/api/dispatch-confidence']);
app.use(providerGate);
if (process.env.ENABLE_LEGACY_PROVIDER_ROUTES === 'true' && process.env.NODE_ENV !== 'production') {
  app.use('/api/ai', require('./routes/ai'));
  app.use('/api/webhooks', require('./routes/webhooks'));
  app.use('/api/scada-events', require('./routes/scadaEvents'));
  app.use('/api/iso-bids', require('./routes/isoBids'));
  app.use('/api/dispatch-confidence', require('./routes/dispatchConfidence'));
}

app.use((_req, res) => res.status(404).json({ error: 'Route not found' }));
app.use((error, _req, res, _next) => res.status(error.status || 500).json({ error: error.status ? error.message : 'Internal server error' }));

function start() {
  return app.listen(port, () => console.log(`AI Wind Solar Farm Ops API listening on ${port}`));
}
if (require.main === module) start();
module.exports = { app, start };
