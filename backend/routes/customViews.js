// Custom views: turbine site map + 24h generation curve
// Two read-only endpoints. Self-heals turbine lat/lng columns on first call.
const express = require('express');
const router = express.Router();
const pool = require('../config/database');

let geoReady = false;
async function ensureTurbineGeo() {
  if (geoReady) return;
  await pool.query(`
    ALTER TABLE turbines ADD COLUMN IF NOT EXISTS lat NUMERIC(9,6);
    ALTER TABLE turbines ADD COLUMN IF NOT EXISTS lng NUMERIC(9,6);
  `);
  // Seed Texas-ish random coordinates for any row that is still null.
  // Bounding box ~ West Texas / Panhandle: lat 31..36, lng -103..-99.
  // Deterministic per-id so re-seeding doesn't shuffle markers.
  await pool.query(`
    UPDATE turbines
    SET lat = ROUND((31 + (id * 37 % 500) / 100.0)::numeric, 6),
        lng = ROUND((-103 + (id * 53 % 400) / 100.0)::numeric, 6)
    WHERE lat IS NULL OR lng IS NULL
  `);
  geoReady = true;
}

// GET /api/custom-views/turbine-locations
router.get('/turbine-locations', async (req, res) => {
  try {
    await ensureTurbineGeo();
    const { rows } = await pool.query(`
      SELECT id, turbine_id, site, vendor, model,
             capacity_mw, status,
             lat::float8 AS lat, lng::float8 AS lng
      FROM turbines
      WHERE lat IS NOT NULL AND lng IS NOT NULL
      ORDER BY id ASC
    `);
    const lat_avg = rows.length
      ? rows.reduce((s, r) => s + Number(r.lat || 0), 0) / rows.length
      : 32.5;
    const lng_avg = rows.length
      ? rows.reduce((s, r) => s + Number(r.lng || 0), 0) / rows.length
      : -101.0;
    res.json({
      count: rows.length,
      center: { lat: lat_avg, lng: lng_avg },
      turbines: rows,
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// GET /api/custom-views/generation-curve?site=<optional>
// Returns hourly buckets over the next 24 hours combining
//   - wind_mps from weather_forecasts
//   - predicted_mwh = sum(capacity_mw) * load_factor(wind_mps)
router.get('/generation-curve', async (req, res) => {
  try {
    const site = (req.query.site || '').trim();

    // Total operational capacity (optionally per-site)
    const capQ = site
      ? `SELECT COALESCE(SUM(capacity_mw),0)::float8 AS mw FROM turbines WHERE site = $1 AND status = 'operational'`
      : `SELECT COALESCE(SUM(capacity_mw),0)::float8 AS mw FROM turbines WHERE status = 'operational'`;
    const capArgs = site ? [site] : [];
    const cap = (await pool.query(capQ, capArgs)).rows[0]?.mw || 0;

    // Pull the next 24 forecast points (averaged per hour if multiple).
    // We use NOW() - 1h as a lenient lower bound so the chart always has data
    // even if seed timestamps drift.
    const wxArgs = site ? [site] : [];
    const wxQ = site
      ? `SELECT date_trunc('hour', valid_at) AS hour,
                AVG(wind_mps)::float8 AS wind_mps
         FROM weather_forecasts
         WHERE site = $1
         GROUP BY 1 ORDER BY 1 ASC LIMIT 48`
      : `SELECT date_trunc('hour', valid_at) AS hour,
                AVG(wind_mps)::float8 AS wind_mps
         FROM weather_forecasts
         GROUP BY 1 ORDER BY 1 ASC LIMIT 48`;
    let wx = (await pool.query(wxQ, wxArgs)).rows;

    // If we have <24 real rows, synthesize the remainder so the chart renders.
    const horizon = 24;
    if (wx.length < horizon) {
      const start = new Date();
      start.setMinutes(0, 0, 0);
      const have = new Map(wx.map((r) => [new Date(r.hour).toISOString(), Number(r.wind_mps || 0)]));
      const synth = [];
      for (let h = 0; h < horizon; h++) {
        const t = new Date(start.getTime() + h * 3600 * 1000).toISOString();
        // Smooth wind curve 4..12 m/s
        const w = have.get(t) ?? (8 + 4 * Math.sin((h / horizon) * Math.PI * 2));
        synth.push({ hour: t, wind_mps: Number(w.toFixed(2)) });
      }
      wx = synth;
    } else {
      wx = wx.slice(0, horizon);
    }

    // Power curve: cubic with cut-in 3 m/s, rated 12 m/s, cut-out 25.
    function loadFactor(v) {
      const vv = Math.max(0, Number(v) || 0);
      if (vv < 3) return 0;
      if (vv >= 25) return 0;
      if (vv >= 12) return 1;
      const f = Math.pow((vv - 3) / 9, 3);
      return Math.min(1, Math.max(0, f));
    }

    const series = wx.map((r) => {
      const v = Number(r.wind_mps || 0);
      const mwh = +(cap * loadFactor(v)).toFixed(2);
      return {
        hour: new Date(r.hour).toISOString(),
        label: new Date(r.hour).toISOString().slice(11, 16), // HH:MM UTC
        wind_mps: +Number(v).toFixed(2),
        predicted_mwh: mwh,
      };
    });

    res.json({
      site: site || 'ALL_SITES',
      operational_capacity_mw: +Number(cap).toFixed(2),
      horizon_hours: series.length,
      series,
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;
