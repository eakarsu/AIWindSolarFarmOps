// Work-order state machine.
// Canonical states + transitions are documented in migrations/002_pass7_backlog.sql.
// Sits beside the existing CRUD route at /api/work-orders. Mounted at /api/work-order-fsm.
const express = require('express');
const pool = require('../config/database');
const { requireWriter } = require('../middleware/auth');
const { fireWebhook } = require('../services/webhooks');

const router = express.Router();

// NEEDS-PRODUCT-DECISION resolved as: a directed graph with one terminal state ("closed")
// and a soft-terminal ("cancelled"). Reset is allowed only from blocked or in_progress
// back to scheduled when a parts/crew issue clears.
const TRANSITIONS = {
  open:        ['triaged', 'cancelled'],
  triaged:     ['scheduled', 'cancelled'],
  scheduled:   ['in_progress', 'blocked', 'cancelled'],
  in_progress: ['blocked', 'done', 'cancelled'],
  blocked:     ['scheduled', 'in_progress', 'cancelled'],
  done:        ['closed', 'in_progress'],     // reopen if QA fails
  closed:      [],
  cancelled:   [],
};

router.get('/states', (_req, res) => {
  res.json({
    states: Object.keys(TRANSITIONS),
    transitions: TRANSITIONS,
    notes: 'Canonical work-order state machine. Use POST /:wo_id/transition to move.',
  });
});

// History of transitions for a work order
router.get('/:wo_id/history', async (req, res) => {
  try {
    const r = await pool.query(
      'SELECT * FROM work_order_transitions WHERE wo_id = $1 ORDER BY created_at ASC',
      [req.params.wo_id]
    );
    res.json(r.rows);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// POST /:wo_id/transition { to, reason?, meta? }
router.post('/:wo_id/transition', requireWriter, async (req, res) => {
  try {
    const { wo_id } = req.params;
    const { to, reason, meta } = req.body || {};
    if (!to) return res.status(400).json({ error: 'to (target state) required' });

    const cur = await pool.query('SELECT * FROM work_orders WHERE wo_id = $1 LIMIT 1', [wo_id]);
    if (!cur.rows.length) return res.status(404).json({ error: 'work order not found' });

    const from = (cur.rows[0].status || 'open').toLowerCase();
    const allowed = TRANSITIONS[from];
    if (!allowed) {
      return res.status(400).json({ error: `current state "${from}" is not a known state` });
    }
    if (!allowed.includes(to)) {
      return res.status(409).json({
        error: `illegal transition ${from} -> ${to}`,
        allowed_from_current: allowed,
      });
    }

    // Apply
    const upd = await pool.query(
      'UPDATE work_orders SET status = $1, updated_at = NOW() WHERE wo_id = $2 RETURNING *',
      [to, wo_id]
    );
    await pool.query(
      `INSERT INTO work_order_transitions (wo_id, from_state, to_state, actor, reason, meta)
       VALUES ($1,$2,$3,$4,$5,$6)`,
      [wo_id, from, to, req.user?.email || 'unknown', reason || null, meta || {}]
    );
    fireWebhook(`work_order.${to}`, { wo_id, from, to, actor: req.user?.email || 'unknown' }).catch(() => {});
    res.json({ work_order: upd.rows[0], from, to });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

module.exports = router;
