// SCADA event ingest — canonical envelope with idempotency on source_event_id.
// Schema documented in migrations/002_pass7_backlog.sql.
const express = require('express');
const pool = require('../config/database');
const { requireWriter } = require('../middleware/auth');
const { fireWebhook } = require('../services/webhooks');

const router = express.Router();

const VALID_TYPES = ['fault','alarm','status','setpoint','telemetry','trip','reset'];
const VALID_SEVERITIES = ['info','low','medium','high','critical'];

// GET /api/scada-events
router.get('/', async (req, res) => {
  try {
    const { asset_id, site, status, limit } = req.query;
    const lim = Math.min(parseInt(limit, 10) || 100, 500);
    const wh = [];
    const args = [];
    if (asset_id) { args.push(asset_id); wh.push(`asset_id = $${args.length}`); }
    if (site)     { args.push(site);     wh.push(`site = $${args.length}`); }
    if (status)   { args.push(status);   wh.push(`ingest_status = $${args.length}`); }
    const sql = `SELECT * FROM scada_events ${wh.length ? 'WHERE ' + wh.join(' AND ') : ''} ORDER BY received_at DESC LIMIT ${lim}`;
    const r = await pool.query(sql, args);
    res.json(r.rows);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.get('/schema', (_req, res) => {
  res.json({
    envelope: {
      source_event_id: 'string (unique, idempotency key)',
      source_system: 'string (e.g. GE-ServiceLink, Vestas-VOC, SMA-Cluster)',
      asset_id: 'string',
      asset_type: 'turbine|inverter|transformer|met_mast|battery',
      site: 'string',
      event_type: VALID_TYPES.join('|'),
      severity: VALID_SEVERITIES.join('|'),
      code: 'string (vendor event code)',
      message: 'string',
      payload: 'object (full vendor payload, preserved)',
      event_ts: 'ISO timestamp',
    },
    idempotency: 'POST with same source_event_id returns 200 + ingest_status="deduplicated" and existing row.',
    bulk: 'POST /bulk with { events: [...] } accepts batch up to 1000.',
  });
});

router.get('/:id', async (req, res) => {
  try {
    const r = await pool.query('SELECT * FROM scada_events WHERE id = $1', [req.params.id]);
    if (!r.rows.length) return res.status(404).json({ error: 'not found' });
    res.json(r.rows[0]);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

async function ingestOne(ev) {
  const {
    source_event_id, source_system, asset_id, asset_type, site,
    event_type, severity, code, message, payload, event_ts,
  } = ev || {};
  if (!source_event_id) {
    return { status: 'failed', error: 'source_event_id required for idempotency' };
  }
  if (event_type && !VALID_TYPES.includes(event_type)) {
    return { status: 'failed', error: `event_type must be one of ${VALID_TYPES.join('|')}` };
  }
  if (severity && !VALID_SEVERITIES.includes(severity)) {
    return { status: 'failed', error: `severity must be one of ${VALID_SEVERITIES.join('|')}` };
  }

  // Idempotent insert
  const existing = await pool.query('SELECT * FROM scada_events WHERE source_event_id = $1 LIMIT 1', [source_event_id]);
  if (existing.rows.length) {
    return { status: 'deduplicated', row: existing.rows[0] };
  }

  const r = await pool.query(
    `INSERT INTO scada_events
      (source_event_id, source_system, asset_id, asset_type, site,
       event_type, severity, code, message, payload, event_ts, processed_at, ingest_status)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,NOW(),'processed') RETURNING *`,
    [
      source_event_id,
      source_system || null,
      asset_id || null,
      asset_type || null,
      site || null,
      event_type || 'telemetry',
      severity || 'info',
      code || null,
      message || null,
      payload || {},
      event_ts || null,
    ]
  );
  const row = r.rows[0];
  // High-severity faults fan out as webhooks for downstream alerting
  if (['high','critical'].includes(row.severity) && ['fault','trip','alarm'].includes(row.event_type)) {
    fireWebhook(`scada.${row.event_type}.${row.severity}`, { row }).catch(() => {});
  }
  return { status: 'processed', row };
}

router.post('/', requireWriter, async (req, res) => {
  try {
    const out = await ingestOne(req.body);
    if (out.status === 'failed') return res.status(400).json({ error: out.error });
    res.status(out.status === 'deduplicated' ? 200 : 201).json(out);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.post('/bulk', requireWriter, async (req, res) => {
  try {
    const events = Array.isArray(req.body?.events) ? req.body.events : [];
    if (!events.length) return res.status(400).json({ error: 'events array required' });
    if (events.length > 1000) return res.status(400).json({ error: 'max 1000 events per batch' });
    const results = { processed: 0, deduplicated: 0, failed: 0, errors: [] };
    for (const ev of events) {
      const r = await ingestOne(ev);
      if (r.status === 'processed') results.processed++;
      else if (r.status === 'deduplicated') results.deduplicated++;
      else { results.failed++; if (results.errors.length < 25) results.errors.push({ source_event_id: ev?.source_event_id || null, error: r.error }); }
    }
    res.json(results);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

module.exports = router;
