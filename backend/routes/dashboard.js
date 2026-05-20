const express = require('express');
const router = express.Router();
const pool = require('../config/database');

router.get('/', async (req, res) => {
  try {
    const [
      turbines, inverters, panels, transformers, mets, ppas, work, mlogs,
      sensors, faults, curtail, wxf, meters, techs, parts, safety, kpis, audit,
    ] = await Promise.all([
      pool.query("SELECT COUNT(*) AS total, COUNT(*) FILTER (WHERE status='operational') AS operational, COUNT(*) FILTER (WHERE status='down') AS down, COALESCE(SUM(capacity_mw),0) AS total_mw FROM turbines"),
      pool.query("SELECT COUNT(*) AS total, COUNT(*) FILTER (WHERE status='operational') AS operational, COUNT(*) FILTER (WHERE status='derated') AS derated FROM inverters"),
      pool.query("SELECT COUNT(*) AS total, COUNT(*) FILTER (WHERE status='operational') AS operational FROM panels"),
      pool.query("SELECT COUNT(*) AS total, COUNT(*) FILTER (WHERE status='operational') AS operational FROM transformers"),
      pool.query("SELECT COUNT(*) AS total, COUNT(*) FILTER (WHERE status='operational') AS operational FROM met_masts"),
      pool.query("SELECT COUNT(*) AS total, COUNT(*) FILTER (WHERE status='active') AS active FROM ppa_contracts"),
      pool.query("SELECT COUNT(*) AS total, COUNT(*) FILTER (WHERE status='open') AS open, COUNT(*) FILTER (WHERE priority='critical') AS critical FROM work_orders"),
      pool.query("SELECT COUNT(*) AS total FROM maintenance_logs"),
      pool.query("SELECT COUNT(*) AS total FROM sensor_streams"),
      pool.query("SELECT COUNT(*) AS total, COUNT(*) FILTER (WHERE severity='critical') AS critical, COUNT(*) FILTER (WHERE status='open') AS open FROM faults"),
      pool.query("SELECT COUNT(*) AS total, COALESCE(SUM(mw_curtailed),0) AS mw FROM curtailment_events"),
      pool.query("SELECT COUNT(*) AS total FROM weather_forecasts"),
      pool.query("SELECT COUNT(*) AS total, COUNT(*) FILTER (WHERE comm_status='online') AS online FROM energy_meters"),
      pool.query("SELECT COUNT(*) AS total, COUNT(*) FILTER (WHERE status='available') AS available FROM technicians"),
      pool.query("SELECT COUNT(*) AS total, COALESCE(SUM(qty_on_hand),0) AS total_qty FROM spare_parts"),
      pool.query("SELECT COUNT(*) AS total, COUNT(*) FILTER (WHERE severity='high') AS high, COUNT(*) FILTER (WHERE severity='critical') AS critical FROM safety_incidents"),
      pool.query("SELECT COUNT(*) AS total FROM performance_kpis"),
      pool.query("SELECT COUNT(*) AS total FROM audit_log"),
    ]);
    res.json({
      turbines:           turbines.rows[0],
      inverters:          inverters.rows[0],
      panels:             panels.rows[0],
      transformers:       transformers.rows[0],
      met_masts:          mets.rows[0],
      ppa_contracts:      ppas.rows[0],
      work_orders:        work.rows[0],
      maintenance_logs:   mlogs.rows[0],
      sensor_streams:     sensors.rows[0],
      faults:             faults.rows[0],
      curtailment_events: curtail.rows[0],
      weather_forecasts:  wxf.rows[0],
      energy_meters:      meters.rows[0],
      technicians:        techs.rows[0],
      spare_parts:        parts.rows[0],
      safety_incidents:   safety.rows[0],
      performance_kpis:   kpis.rows[0],
      audit_log:          audit.rows[0],
    });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

module.exports = router;
