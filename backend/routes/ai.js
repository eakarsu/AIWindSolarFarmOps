const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const ai = require('../services/ai');

async function record(feature, input, output) {
  try {
    await pool.query(
      'INSERT INTO ai_results (feature, input, output) VALUES ($1, $2, $3)',
      [feature, input || {}, output || {}]
    );
  } catch (e) {
    console.warn(`[ai] failed to record ${feature}:`, e.message);
  }
}

// ──────────────────────────────────────────────────────────────
// Sample fills — realistic renewable-energy scenarios for each AI verb.
// 5 samples per verb. Returned values map 1:1 to the field `key`s used by
// the frontend AI page components (see frontend/src/pages/AI*Page.js).
// ──────────────────────────────────────────────────────────────
const SAMPLES = {
  'forecast-generation': [
    { label: 'Texas wind farm — 48h, low-pressure approaching',
      values: { site: 'Roscoe Wind Farm, TX', horizon_hours: 48, notes: 'Low-pressure system tracking from NM, gusts to 22 m/s expected overnight.' } },
    { label: 'California solar — 24h, marine layer',
      values: { site: 'Topaz Solar Farm, CA', horizon_hours: 24, notes: 'Marine layer expected to burn off by 11:00 PT; clear skies after.' } },
    { label: 'Iowa wind — 72h winter storm',
      values: { site: 'Storm Lake II, IA', horizon_hours: 72, notes: 'Winter storm warning; icing risk on blades T+12 to T+30.' } },
    { label: 'Arizona solar — 12h, monsoon afternoon',
      values: { site: 'Agua Caliente Solar, AZ', horizon_hours: 12, notes: 'Monsoon TSRA likely 14:00-18:00 MST; partial cloud cover building.' } },
    { label: 'Offshore wind — 36h North Sea',
      values: { site: 'Hornsea Project Two, UK', horizon_hours: 36, notes: 'NW gale Force 8, sustained 18 m/s; turbines may shed near cut-out (25 m/s).' } },
  ],

  'fault-prognostic': [
    { label: 'GE 1.5MW — gearbox HSS bearing vibration',
      values: { asset_id: 'WTG-IA-014', sensor_notes: 'High-speed-shaft bearing vibration rising 6 dB over 30 days; oil iron ppm 84 (limit 60); temperature delta +12C.' } },
    { label: 'Vestas V112 — pitch motor current spikes',
      values: { asset_id: 'WTG-TX-027', sensor_notes: 'Pitch motor #2 peak current up 18% week-over-week; recurring P0312 fault at low temp.' } },
    { label: 'Siemens Gamesa SG 5.0 — yaw brake wear',
      values: { asset_id: 'WTG-OFF-009', sensor_notes: 'Yaw brake pad sensor reads 38% remaining; nacelle drift events up 4x last 14 days.' } },
    { label: 'SMA Sunny Central inverter — IGBT temp',
      values: { asset_id: 'INV-CA-105', sensor_notes: 'IGBT junction temperature reaching 118C at noon; fan #3 RPM oscillating; derating events recorded.' } },
    { label: 'Power transformer — DGA shows acetylene',
      values: { asset_id: 'XFMR-AZ-002', sensor_notes: 'Latest DGA: C2H2 12 ppm (was 0), H2 220 ppm trending up; bushing PD activity detected by online monitor.' } },
  ],

  'curtailment-optimize': [
    { label: 'ERCOT west — negative LMP overnight',
      values: { site: 'Roscoe Wind Farm, TX', notes: 'ERCOT West LMP forecast negative 23:00-04:00; PPA floor $18/MWh; battery offtake limited.' } },
    { label: 'CAISO oversupply — duck-curve solar',
      values: { site: 'Topaz Solar Farm, CA', notes: 'CAISO oversupply 10:00-14:00 PT; SCE PPA at $42 fixed; merchant tail at $7 spot.' } },
    { label: 'MISO transmission constraint',
      values: { site: 'Storm Lake II, IA', notes: 'MISO transmission constraint on Hazleton-Salem 161kV; max export 78 MW for 6h window.' } },
    { label: 'NYISO icing curtailment for grid safety',
      values: { site: 'Maple Ridge Wind, NY', notes: 'Forecast freezing rain; NYISO requested 50% reduction to avoid ice-throw. PPA has force-majeure clause.' } },
    { label: 'Spain — voltage support request',
      values: { site: 'Cádiz Solar Plant, ES', notes: 'REE requesting reactive power support; active curtailment to 60% MW for 4h to free MVAR headroom.' } },
  ],

  'ppa-settlement': [
    { label: 'Corporate PPA — Google Iowa Q2',
      values: { ppa_id: 'PPA-2025-014', period: '2025-Q2', notes: 'Delivered 142,800 MWh against 145,000 nominated; one curtailment event 880 MWh.' } },
    { label: 'Utility PPA — SCE Topaz May',
      values: { ppa_id: 'PPA-2024-008', period: '2025-05', notes: 'Delivered 38,400 MWh vs floor 36,000; soiling-related shortfall 1,100 MWh on contract.' } },
    { label: 'Microsoft Texas wind — March',
      values: { ppa_id: 'PPA-2025-021', period: '2025-03', notes: 'Delivered 96,200 MWh; settlement against ERCOT West hourly LMP; 2 outage hours.' } },
    { label: 'Hornsea Two CfD — April',
      values: { ppa_id: 'PPA-CFD-2024-002', period: '2025-04', notes: 'CfD strike £92.50/MWh; metered output 412,000 MWh; one curtailment 6,400 MWh paid as constraint.' } },
    { label: 'AWS Spain solar PPA — quarterly',
      values: { ppa_id: 'PPA-2025-031', period: '2025-Q1', notes: 'Delivered 84,500 MWh; floor 80,000; ceiling 90,000; one inverter event lost 320 MWh.' } },
  ],

  'schedule-maintenance': [
    { label: 'Default — open work orders, this week',
      values: { window: 'next 7 days', notes: 'Use weather windows; prefer night work for low-wind tasks; 4 crews available.' } },
    { label: 'Crane lift batch — 6 turbine majors',
      values: { window: 'next 14 days', notes: 'One large crane available days 3-9; sequence to minimize crane mobilization cost.' } },
    { label: 'Solar inverter swaps — 12 units',
      values: { window: 'next 10 days', notes: 'No production loss possible during peak (10:00-16:00); 2 electrician crews.' } },
    { label: 'Storm prep — secure assets in 48h',
      values: { window: 'next 48 hours', notes: 'Cat-1 hurricane forecast landfall T+50h; prioritize tie-downs and met mast inspection.' } },
    { label: 'Annual outage — 2 substation xfmrs',
      values: { window: 'next 30 days', notes: 'Coordinate site outage with grid operator; maintain 50% MW capacity throughout.' } },
  ],

  'fleet-health': [
    { label: 'Whole fleet snapshot (default)', values: {} },
    { label: 'Whole fleet snapshot (default)', values: {} },
    { label: 'Whole fleet snapshot (default)', values: {} },
    { label: 'Whole fleet snapshot (default)', values: {} },
    { label: 'Whole fleet snapshot (default)', values: {} },
  ],

  'weather-window': [
    { label: 'Blade leading-edge repair — wind <8 m/s',
      values: { site: 'Roscoe Wind Farm, TX', activity: 'Blade leading-edge repair (rope access)', notes: 'Need 6 consecutive hours wind <8 m/s, no precip, daylight, T>5C.' } },
    { label: 'Crane lift — nacelle component swap',
      values: { site: 'Storm Lake II, IA', activity: 'Crane lift, gearbox HSS swap', notes: 'Need 8h wind <12 m/s at hub, gust <14 m/s, no lightning within 30 mi.' } },
    { label: 'PV string IV-curve testing',
      values: { site: 'Topaz Solar Farm, CA', activity: 'PV string IV-curve testing', notes: 'Need clear-sky GHI >800 W/m2 stable for 4h.' } },
    { label: 'Offshore CTV transfer',
      values: { site: 'Hornsea Project Two, UK', activity: 'Crew transfer vessel boarding', notes: 'Significant wave height <1.5 m, wind <12 m/s for 10h round-trip.' } },
    { label: 'Drone blade inspection',
      values: { site: 'Cádiz Solar Plant met mast & adjacent wind', activity: 'Drone aerial inspection', notes: 'Wind <7 m/s at 100m, visibility >5km, no precip, ceiling >300m AGL.' } },
  ],

  'blade-inspection-summary': [
    { label: 'Vestas V112 — 3 blades, drone imagery',
      values: { turbine_id: 'WTG-TX-027', notes: 'Drone inspection found 12 LE erosion spots, 2 lightning strikes, 1 trailing-edge crack 240mm.' } },
    { label: 'GE 1.5MW — annual rope-access',
      values: { turbine_id: 'WTG-IA-014', notes: 'Rope access annual: minor LE erosion blade A, hairline crack root joint blade B, drainage hole clogged blade C.' } },
    { label: 'Siemens Gamesa offshore — post-storm',
      values: { turbine_id: 'WTG-OFF-009', notes: 'Post-storm inspection after 28 m/s gusts; lightning strike receptor 1 burned, blade B tip 1.2m delamination.' } },
    { label: 'Nordex N117 — gel-coat survey',
      values: { turbine_id: 'WTG-IA-031', notes: 'Gel-coat full survey: pitting on all 3 blades at 60-75% radius, no structural damage observed.' } },
    { label: 'Goldwind 3.0 — newly commissioned',
      values: { turbine_id: 'WTG-AU-005', notes: 'Acceptance inspection at 6 months: small manufacturing defect blade A, mid-span; warranty claim candidate.' } },
  ],

  'draft-work-order': [
    { label: 'Replace pitch motor #2 on WTG-TX-027',
      values: { intent: 'Replace pitch motor #2 due to repeated overcurrent faults P0312 over last 14 days. Schedule with crane crew.', asset_id: 'WTG-TX-027' } },
    { label: 'Clean PV array A-12 (heavy soiling)',
      values: { intent: 'Schedule wet-clean of PV array A-12 — soiling rate 1.2%/week vs neighboring arrays 0.4%. Use deionized water only.', asset_id: 'ARR-CA-012' } },
    { label: 'Transformer oil DGA + bushing inspection',
      values: { intent: 'Take DGA sample from main substation transformer and inspect HV bushings; rising H2 trend on online monitor.', asset_id: 'XFMR-AZ-002' } },
    { label: 'Met mast re-calibration after lightning',
      values: { intent: 'Re-calibrate all anemometers and wind vanes on met mast after nearby lightning strike; verify data quality vs adjacent mast.', asset_id: 'MAST-IA-001' } },
    { label: 'Inverter IGBT replacement',
      values: { intent: 'Replace IGBT power module bank 3 on Sunny Central INV-CA-105; junction temps exceeding 118C, derating events daily.', asset_id: 'INV-CA-105' } },
  ],

  'executive-brief': [
    { label: 'Default daily brief', values: { notes: '' } },
    { label: 'Bias toward wind fleet performance', values: { notes: 'Focus on wind fleet availability, curtailment, and forecast accuracy.' } },
    { label: 'Bias toward solar fleet performance', values: { notes: 'Focus on solar fleet soiling, inverter clipping, and PPA delivery.' } },
    { label: 'Bias toward commercial / PPA risk', values: { notes: 'Focus on PPA exposure, settlement risk, and upcoming counterparty negotiations.' } },
    { label: 'Bias toward safety + HSE incidents', values: { notes: 'Focus on safety incidents, near-misses, and crew exposure to high-wind and high-voltage work.' } },
  ],

  'ramp-rate-strategy': [
    { label: 'ERCOT — 10 MW/min default',
      values: { site: 'Roscoe Wind Farm, TX', notes: 'ERCOT grid code: 10 MW/min for plants >50 MW; current setting 12 MW/min; one curtailment penalty last month.' } },
    { label: 'CAISO solar dawn ramp',
      values: { site: 'Topaz Solar Farm, CA', notes: 'CAISO dawn solar ramp causing system stress; consider holding 0 MW until 06:30 then ramp 15 MW/min.' } },
    { label: 'MISO wind cloud-event',
      values: { site: 'Storm Lake II, IA', notes: 'MISO cloud-event ramps requested: limit downward ramps to 8 MW/min to assist regulation reserves.' } },
    { label: 'National Grid UK — offshore',
      values: { site: 'Hornsea Project Two, UK', notes: 'NG ESO grid code: ramp limit 50 MW/min; consider voluntary 30 MW/min to receive ancillary services payment.' } },
    { label: 'AEMO Australia — FCAS',
      values: { site: 'Bungala Solar, SA', notes: 'AEMO 5-min FCAS market: faster ramping unlocks raise/lower payments; review 8 MW/min vs 14 MW/min trade-off.' } },
  ],

  'inverter-clipping-detect': [
    { label: 'Detect clipping at Topaz noon (default)', values: { context: 'Noon peak, sunny day, DC/AC ratio 1.35.' } },
    { label: 'Detect clipping fleet-wide today', values: { context: 'All solar sites, full day analysis.' } },
    { label: 'Cádiz solar — summer afternoon', values: { context: 'Cádiz summer 35C ambient; suspect thermal derating + clipping coincide.' } },
    { label: 'Agua Caliente — monsoon recovery', values: { context: 'After monsoon cloud passage, irradiance overshoot causing clipping spikes.' } },
    { label: 'Bungala — DC/AC 1.45 high-ratio site', values: { context: 'High DC/AC ratio site; clipping expected but quantify lost energy and identify worst inverters.' } },
  ],

  'turbine-availability': [
    { label: 'Last 30 days fleet availability',
      values: { window: 'last 30 days', notes: 'Compute IEC 61400-26 contract availability; exclude grid outages from operator account.' } },
    { label: 'Last 90 days — warranty period',
      values: { window: 'last 90 days', notes: 'Trending vs OEM 97% warranty commitment; identify gap to contract.' } },
    { label: 'YTD — annual reporting',
      values: { window: 'YTD 2025', notes: 'Year-to-date for board report; segment by site and root cause.' } },
    { label: 'Last 7 days — post-storm',
      values: { window: 'last 7 days', notes: 'Post-storm recovery week; weather standstill vs forced outage attribution.' } },
    { label: 'Last quarter — by manufacturer',
      values: { window: 'Q1 2025', notes: 'Segment availability by Vestas / GE / Siemens Gamesa to benchmark vendor performance.' } },
  ],

  'vendor-warranty-claim': [
    { label: 'GE — gearbox premature failure',
      values: { asset_id: 'WTG-IA-014', vendor: 'GE Renewable Energy', notes: 'HSS bearing failure at 4,200 hrs; warranty covers up to 5 years; replacement + lost production.' } },
    { label: 'Vestas — pitch motor recurring fault',
      values: { asset_id: 'WTG-TX-027', vendor: 'Vestas', notes: 'Pitch motor #2 third failure in 18 months; service bulletin VSB-23-114 applies.' } },
    { label: 'Siemens Gamesa — blade delamination',
      values: { asset_id: 'WTG-OFF-009', vendor: 'Siemens Gamesa', notes: 'Blade B tip delamination 1.2m; outside lightning strike zone; manufacturing defect suspected.' } },
    { label: 'SMA — IGBT thermal failure',
      values: { asset_id: 'INV-CA-105', vendor: 'SMA Solar', notes: 'IGBT module failure under-spec; ambient never exceeded contract envelope.' } },
    { label: 'ABB — transformer DGA out of limits',
      values: { asset_id: 'XFMR-AZ-002', vendor: 'ABB', notes: 'Acetylene gas in oil at 12 ppm year 3 of 5-year warranty; arcing fault inside tank.' } },
  ],

  'asset-deg-trend': [
    { label: 'Solar array A-12 — soiling trend',
      values: { asset_id: 'ARR-CA-012', metric: 'soiling-loss-pct', notes: '12-month moving avg up from 1.8% to 4.6%; nearby agricultural activity.' } },
    { label: 'Turbine T-014 — power curve drift',
      values: { asset_id: 'WTG-IA-014', metric: 'power-curve-deviation-pct', notes: 'Wind speed-binned production -3.2% vs commissioning; LE erosion suspected.' } },
    { label: 'PV module degradation — Topaz Block 4',
      values: { asset_id: 'PV-CA-BLK-4', metric: 'pmax-degradation-pct-per-year', notes: 'Year 6 modules showing 0.68%/yr degradation vs warranted 0.5%/yr.' } },
    { label: 'Battery storage SOH',
      values: { asset_id: 'BESS-TX-001', metric: 'state-of-health-pct', notes: 'SOH down to 87% after 1,800 cycles; warranty floor 80% at 3,000 cycles.' } },
    { label: 'Transformer load loss creep',
      values: { asset_id: 'XFMR-AZ-002', metric: 'no-load-loss-kw', notes: 'No-load loss creeping up 4% over 5 years; core insulation degradation.' } },
  ],

  'root-cause-analyzer': [
    { label: 'WTG-IA-014 unplanned shutdown 14h',
      values: { incident: 'WTG-IA-014 unplanned shutdown 14 hours on 2025-05-12', notes: 'Gearbox HSS bearing failure; oil iron 142 ppm; vibration alarm acknowledged 6 days earlier.' } },
    { label: 'Topaz inverter trip cascade',
      values: { incident: 'Topaz Block 3 cascade trip lost 22 MW for 4 hours', notes: 'Initial inverter ground fault triggered protection sympathy; relay coordination suspect.' } },
    { label: 'Met mast wind vane failure',
      values: { incident: 'Roscoe met mast wind vane stuck at 045 for 36 hours', notes: 'Caused yaw control issues; lightning strike 2 days prior; surge protection not replaced.' } },
    { label: 'Substation transformer fire — minor',
      values: { incident: 'Substation transformer XFMR-AZ-002 small bushing fire', notes: 'Suppressed by deluge; cause traced to bushing PD growing over 6 months without action.' } },
    { label: 'Worker fall from turbine — near miss',
      values: { incident: 'Near-miss: technician fall arrested by harness in WTG-TX-027 nacelle', notes: 'Anchor point not properly inspected; PPE inspection log gap of 90 days.' } },
  ],
};

// GET /api/ai/samples?feature=<verb>
router.get('/samples', (req, res) => {
  try {
    const feature = (req.query.feature || '').toString();
    if (!feature) {
      return res.json({ features: Object.keys(SAMPLES) });
    }
    const samples = SAMPLES[feature];
    if (!samples) {
      return res.status(404).json({ error: `unknown feature: ${feature}` });
    }
    res.json({ feature, samples });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// GET /api/ai/history?feature=<name>&limit=<n>
router.get('/history', async (req, res) => {
  try {
    const feature = (req.query.feature || '').toString();
    const limit = Math.min(parseInt(req.query.limit, 10) || 25, 200);
    let r;
    if (feature) {
      r = await pool.query(
        'SELECT id, feature, input, output, created_at FROM ai_results WHERE feature = $1 ORDER BY created_at DESC LIMIT $2',
        [feature, limit]
      );
    } else {
      r = await pool.query(
        'SELECT id, feature, input, output, created_at FROM ai_results ORDER BY created_at DESC LIMIT $1',
        [limit]
      );
    }
    res.json(r.rows);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ──────────────────────────────────────────────────────────────
// AI verb endpoints (16)
// ──────────────────────────────────────────────────────────────

router.post('/forecast-generation', async (req, res) => {
  try {
    const { site = 'Default Site', horizon_hours, notes } = req.body || {};
    const horizon = { horizon_hours: horizon_hours || 24, notes: notes || '' };
    const result = await ai.forecastGeneration(site, horizon);
    await record('forecast-generation', { site, horizon }, result);
    res.json(result);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.post('/fault-prognostic', async (req, res) => {
  try {
    const { asset_id, sensor_notes } = req.body || {};
    let asset = { asset_id: asset_id || null };
    if (asset_id) {
      try {
        const r = await pool.query('SELECT * FROM turbines WHERE turbine_id = $1 LIMIT 1', [asset_id]);
        if (r.rows.length) asset = r.rows[0];
        else {
          const r2 = await pool.query('SELECT * FROM inverters WHERE inverter_id = $1 LIMIT 1', [asset_id]);
          if (r2.rows.length) asset = r2.rows[0];
        }
      } catch (_) {}
    }
    const sensorData = { notes: sensor_notes || '' };
    const result = await ai.faultPrognostic(asset, sensorData);
    await record('fault-prognostic', { asset_id, sensor_notes }, result);
    res.json(result);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.post('/curtailment-optimize', async (req, res) => {
  try {
    const { site, notes } = req.body || {};
    if (!site) return res.status(400).json({ error: 'site is required' });
    const result = await ai.curtailmentOptimize(site, { notes: notes || '' });
    await record('curtailment-optimize', { site, notes }, result);
    res.json(result);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.post('/ppa-settlement', async (req, res) => {
  try {
    const { ppa_id, period, notes } = req.body || {};
    if (!ppa_id) return res.status(400).json({ error: 'ppa_id is required' });
    let ppa = { ppa_id };
    try {
      const r = await pool.query('SELECT * FROM ppa_contracts WHERE ppa_id = $1 LIMIT 1', [ppa_id]);
      if (r.rows.length) ppa = r.rows[0];
    } catch (_) {}
    const result = await ai.ppaSettlement(ppa, { period: period || '', notes: notes || '' });
    await record('ppa-settlement', { ppa_id, period, notes }, result);
    res.json(result);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.post('/schedule-maintenance', async (req, res) => {
  try {
    const { window, notes } = req.body || {};
    let workOrders = [];
    try {
      const r = await pool.query("SELECT * FROM work_orders WHERE status IN ('open','in_progress','scheduled') ORDER BY id ASC LIMIT 30");
      workOrders = r.rows;
    } catch (_) {}
    const result = await ai.scheduleMaintenance(workOrders, { window: window || 'next 7 days', notes: notes || '' });
    await record('schedule-maintenance', { window, notes, count: workOrders.length }, result);
    res.json(result);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.post('/fleet-health', async (req, res) => {
  try {
    let assets = [];
    try {
      const [t, i] = await Promise.all([
        pool.query('SELECT * FROM turbines ORDER BY id ASC LIMIT 15'),
        pool.query('SELECT * FROM inverters ORDER BY id ASC LIMIT 15'),
      ]);
      assets = [...t.rows, ...i.rows];
    } catch (_) {}
    const result = await ai.fleetHealth(assets);
    await record('fleet-health', { count: assets.length }, result);
    res.json(result);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.post('/weather-window', async (req, res) => {
  try {
    const { site, activity, notes } = req.body || {};
    if (!site || !activity) return res.status(400).json({ error: 'site and activity are required' });
    let forecast = { notes: notes || '' };
    try {
      const r = await pool.query('SELECT * FROM weather_forecasts WHERE site ILIKE $1 ORDER BY valid_at ASC LIMIT 24', [`%${site}%`]);
      forecast.forecast_rows = r.rows;
    } catch (_) {}
    const result = await ai.weatherWindow(site, activity, forecast);
    await record('weather-window', { site, activity, notes }, result);
    res.json(result);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.post('/blade-inspection-summary', async (req, res) => {
  try {
    const { turbine_id, notes } = req.body || {};
    if (!turbine_id) return res.status(400).json({ error: 'turbine_id is required' });
    const result = await ai.bladeInspectionSummary({ turbine_id, notes: notes || '' });
    await record('blade-inspection-summary', { turbine_id, notes }, result);
    res.json(result);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.post('/draft-work-order', async (req, res) => {
  try {
    const { intent, asset_id } = req.body || {};
    if (!intent) return res.status(400).json({ error: 'intent is required' });
    const asset = { asset_id: asset_id || null };
    const result = await ai.draftWorkOrder(intent, asset);
    await record('draft-work-order', { intent, asset_id }, result);
    res.json(result);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.post('/executive-brief', async (req, res) => {
  try {
    const [turbines, inverters, faults, curtail, ppa, work, safety] = await Promise.all([
      pool.query("SELECT COUNT(*) FILTER (WHERE status='operational') AS operational, COUNT(*) FILTER (WHERE status='down') AS down, COUNT(*) AS total FROM turbines"),
      pool.query("SELECT COUNT(*) FILTER (WHERE status='operational') AS operational, COUNT(*) FILTER (WHERE status='derated') AS derated, COUNT(*) AS total FROM inverters"),
      pool.query("SELECT COUNT(*) FILTER (WHERE severity='critical') AS critical, COUNT(*) FILTER (WHERE status='open') AS open, COUNT(*) AS total FROM faults"),
      pool.query("SELECT COUNT(*) AS total, COALESCE(SUM(mw_curtailed),0) AS mw FROM curtailment_events"),
      pool.query("SELECT COUNT(*) FILTER (WHERE status='active') AS active, COUNT(*) AS total FROM ppa_contracts"),
      pool.query("SELECT COUNT(*) FILTER (WHERE status='open') AS open, COUNT(*) FILTER (WHERE priority='critical') AS critical, COUNT(*) AS total FROM work_orders"),
      pool.query("SELECT COUNT(*) FILTER (WHERE severity='high') AS high, COUNT(*) FILTER (WHERE severity='critical') AS critical, COUNT(*) AS total FROM safety_incidents"),
    ]);
    const snapshot = {
      turbines: turbines.rows[0],
      inverters: inverters.rows[0],
      faults: faults.rows[0],
      curtailment: curtail.rows[0],
      ppa: ppa.rows[0],
      work_orders: work.rows[0],
      safety: safety.rows[0],
      ...(req.body?.notes ? { notes: req.body.notes } : {}),
    };
    const result = await ai.executiveBrief(snapshot);
    const out = { snapshot, brief: result };
    await record('executive-brief', { notes: req.body?.notes || null }, out);
    res.json(out);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.post('/ramp-rate-strategy', async (req, res) => {
  try {
    const { site, notes } = req.body || {};
    if (!site) return res.status(400).json({ error: 'site is required' });
    const result = await ai.rampRateStrategy(site, { notes: notes || '' });
    await record('ramp-rate-strategy', { site, notes }, result);
    res.json(result);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.post('/inverter-clipping-detect', async (req, res) => {
  try {
    const { context } = req.body || {};
    let inverters = [];
    try {
      const r = await pool.query('SELECT * FROM inverters ORDER BY id ASC LIMIT 20');
      inverters = r.rows;
    } catch (_) {}
    const result = await ai.inverterClippingDetect(inverters, { context: context || '' });
    await record('inverter-clipping-detect', { context, count: inverters.length }, result);
    res.json(result);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.post('/turbine-availability', async (req, res) => {
  try {
    const { window, notes } = req.body || {};
    let turbines = [];
    try {
      const r = await pool.query('SELECT * FROM turbines ORDER BY id ASC LIMIT 30');
      turbines = r.rows;
    } catch (_) {}
    const result = await ai.turbineAvailability(turbines, { window: window || 'last 30 days', notes: notes || '' });
    await record('turbine-availability', { window, notes, count: turbines.length }, result);
    res.json(result);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.post('/vendor-warranty-claim', async (req, res) => {
  try {
    const { asset_id, vendor, notes } = req.body || {};
    if (!asset_id) return res.status(400).json({ error: 'asset_id is required' });
    const asset = { asset_id, vendor: vendor || null };
    const result = await ai.vendorWarrantyClaim(asset, { notes: notes || '' });
    await record('vendor-warranty-claim', { asset_id, vendor, notes }, result);
    res.json(result);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.post('/asset-deg-trend', async (req, res) => {
  try {
    const { asset_id, metric, notes } = req.body || {};
    if (!asset_id) return res.status(400).json({ error: 'asset_id is required' });
    const result = await ai.assetDegTrend({ asset_id, metric: metric || 'performance' }, { notes: notes || '' });
    await record('asset-deg-trend', { asset_id, metric, notes }, result);
    res.json(result);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.post('/root-cause-analyzer', async (req, res) => {
  try {
    const { incident, notes } = req.body || {};
    if (!incident) return res.status(400).json({ error: 'incident is required' });
    const result = await ai.rootCauseAnalyzer(incident, { notes: notes || '' });
    await record('root-cause-analyzer', { incident, notes }, result);
    res.json(result);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

module.exports = router;
