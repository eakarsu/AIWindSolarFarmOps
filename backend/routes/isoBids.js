// ISO/RTO bid submissions.
// Draft persistence works fully; the real `submit` action requires per-ISO credentials
// (ERCOT MIS account + cert, CAISO CMRI cert, MISO IXP, etc.) which are NOT provisioned
// in this environment. Per repository policy, NEEDS-CREDS endpoints return 503 with a
// helpful stub response, but draft state is still durable.
const express = require('express');
const pool = require('../config/database');
const { requireWriter } = require('../middleware/auth');

const router = express.Router();

const SUPPORTED_ISOS = ['ERCOT','CAISO','MISO','NYISO','PJM','SPP','ISONE','AESO','AEMO','NGESO','REE'];

// GET /api/iso-bids — list drafts
router.get('/', async (_req, res) => {
  try {
    const r = await pool.query('SELECT * FROM iso_bid_submissions ORDER BY id DESC LIMIT 200');
    res.json(r.rows);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.get('/:id', async (req, res) => {
  try {
    const r = await pool.query('SELECT * FROM iso_bid_submissions WHERE id = $1', [req.params.id]);
    if (!r.rows.length) return res.status(404).json({ error: 'not found' });
    res.json(r.rows[0]);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// POST /api/iso-bids — create draft
router.post('/', requireWriter, async (req, res) => {
  try {
    const { bid_id, iso, market, site, resource_id, delivery_date, bid_payload } = req.body || {};
    if (!iso || !SUPPORTED_ISOS.includes(iso)) {
      return res.status(400).json({ error: `iso must be one of ${SUPPORTED_ISOS.join(', ')}` });
    }
    const r = await pool.query(
      `INSERT INTO iso_bid_submissions
        (bid_id, iso, market, site, resource_id, delivery_date, bid_payload, status)
       VALUES ($1,$2,$3,$4,$5,$6,$7,'draft') RETURNING *`,
      [
        bid_id || `BID-${Date.now()}`,
        iso,
        market || 'DAM',
        site || null,
        resource_id || null,
        delivery_date || null,
        bid_payload || {},
      ]
    );
    res.status(201).json(r.rows[0]);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// POST /api/iso-bids/:id/submit — gated 503 (credentials not provisioned)
router.post('/:id/submit', requireWriter, async (req, res) => {
  try {
    const r = await pool.query('SELECT * FROM iso_bid_submissions WHERE id = $1', [req.params.id]);
    if (!r.rows.length) return res.status(404).json({ error: 'not found' });
    const row = r.rows[0];
    const reason = `ISO/RTO bid submission requires production credentials (e.g. ERCOT MIS digital certificate, CAISO CMRI cert). These are not provisioned in this environment.`;
    const upd = await pool.query(
      `UPDATE iso_bid_submissions
         SET status = 'stubbed_no_creds', status_reason = $1, updated_at = NOW()
       WHERE id = $2 RETURNING *`,
      [reason, req.params.id]
    );
    res.status(503).json({
      error: 'iso_bid_submission_unavailable',
      detail: reason,
      iso: row.iso,
      market: row.market,
      bid_id: row.bid_id,
      what_would_happen: `In production: connect to ${row.iso} gateway, POST signed bid envelope, await confirmation token, persist submission receipt.`,
      row: upd.rows[0],
    });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// POST /api/iso-bids/:id/withdraw — same gating but mark withdrawn locally
router.post('/:id/withdraw', requireWriter, async (req, res) => {
  try {
    const upd = await pool.query(
      `UPDATE iso_bid_submissions SET status = 'withdrawn', updated_at = NOW()
        WHERE id = $1 RETURNING *`,
      [req.params.id]
    );
    if (!upd.rows.length) return res.status(404).json({ error: 'not found' });
    res.json(upd.rows[0]);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.get('/_meta/supported-isos', (_req, res) => {
  res.json({ supported: SUPPORTED_ISOS, submit_status: 'stub_503_no_creds' });
});

module.exports = router;
