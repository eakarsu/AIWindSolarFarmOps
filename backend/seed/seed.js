const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');
require('dotenv').config({ path: path.join(__dirname, '..', '..', '.env') });

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'wind_solar_ops',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
});

async function run() {
  const client = await pool.connect();
  try {
    console.log('[seed] resetting tables...');
    await client.query(`
      DROP TABLE IF EXISTS turbines           CASCADE;
      DROP TABLE IF EXISTS inverters          CASCADE;
      DROP TABLE IF EXISTS panels             CASCADE;
      DROP TABLE IF EXISTS transformers       CASCADE;
      DROP TABLE IF EXISTS met_masts          CASCADE;
      DROP TABLE IF EXISTS ppa_contracts      CASCADE;
      DROP TABLE IF EXISTS work_orders        CASCADE;
      DROP TABLE IF EXISTS maintenance_logs   CASCADE;
      DROP TABLE IF EXISTS sensor_streams     CASCADE;
      DROP TABLE IF EXISTS faults             CASCADE;
      DROP TABLE IF EXISTS curtailment_events CASCADE;
      DROP TABLE IF EXISTS weather_forecasts  CASCADE;
      DROP TABLE IF EXISTS energy_meters      CASCADE;
      DROP TABLE IF EXISTS technicians        CASCADE;
      DROP TABLE IF EXISTS spare_parts        CASCADE;
      DROP TABLE IF EXISTS safety_incidents   CASCADE;
      DROP TABLE IF EXISTS performance_kpis   CASCADE;
      DROP TABLE IF EXISTS audit_log          CASCADE;

      DROP TABLE IF EXISTS ai_results         CASCADE;
      DROP TABLE IF EXISTS users              CASCADE;
      DROP TABLE IF EXISTS notifications      CASCADE;
      DROP TABLE IF EXISTS attachments        CASCADE;
      DROP TABLE IF EXISTS webhooks           CASCADE;
      DROP TABLE IF EXISTS webhook_deliveries CASCADE;
    `);

    console.log('[seed] applying migrations...');
    const schema = fs.readFileSync(path.join(__dirname, '..', 'migrations', '001_schema.sql'), 'utf8');
    await client.query(schema);

    // ── turbines ─────────────────────────────────────────────
    console.log('[seed] inserting turbines...');
    const turbines = [
      ['WTG-TX-001', 'Roscoe Wind Farm, TX',     'GE Renewable Energy', '1.5 SLE',     1.50, 'operational'],
      ['WTG-TX-014', 'Roscoe Wind Farm, TX',     'GE Renewable Energy', '1.5 SLE',     1.50, 'operational'],
      ['WTG-TX-027', 'Roscoe Wind Farm, TX',     'Vestas',              'V112-3.45MW', 3.45, 'derated'],
      ['WTG-IA-001', 'Storm Lake II, IA',        'GE Renewable Energy', '1.5 SLE',     1.50, 'operational'],
      ['WTG-IA-014', 'Storm Lake II, IA',        'GE Renewable Energy', '1.5 SLE',     1.50, 'down'],
      ['WTG-IA-031', 'Storm Lake II, IA',        'Nordex',              'N117/2400',   2.40, 'operational'],
      ['WTG-NY-001', 'Maple Ridge Wind, NY',     'Vestas',              'V82-1.65MW',  1.65, 'operational'],
      ['WTG-NY-012', 'Maple Ridge Wind, NY',     'Vestas',              'V82-1.65MW',  1.65, 'maintenance'],
      ['WTG-OFF-001','Hornsea Project Two, UK',  'Siemens Gamesa',      'SG 8.0-167',  8.00, 'operational'],
      ['WTG-OFF-009','Hornsea Project Two, UK',  'Siemens Gamesa',      'SG 8.0-167',  8.00, 'maintenance'],
      ['WTG-OFF-022','Hornsea Project Two, UK',  'Siemens Gamesa',      'SG 8.0-167',  8.00, 'operational'],
      ['WTG-AU-005', 'Bungala Wind, SA, AU',     'Goldwind',            'GW 3.0-140',  3.00, 'commissioning'],
      ['WTG-ES-003', 'Cádiz Wind Cluster, ES',   'Siemens Gamesa',      'SG 3.4-132',  3.40, 'operational'],
      ['WTG-ES-018', 'Cádiz Wind Cluster, ES',   'Siemens Gamesa',      'SG 3.4-132',  3.40, 'operational'],
      ['WTG-MX-007', 'Oaxaca Wind, MX',          'Vestas',              'V126-3.45MW', 3.45, 'down'],
    ];
    for (const t of turbines) {
      await client.query(
        `INSERT INTO turbines (turbine_id,site,vendor,model,capacity_mw,status) VALUES ($1,$2,$3,$4,$5,$6)`,
        t
      );
    }

    // ── inverters ────────────────────────────────────────────
    console.log('[seed] inserting inverters...');
    const inverters = [
      ['INV-CA-101', 'Topaz Solar Farm, CA',    'SMA Solar',     'Sunny Central 2200', 'operational', 'no events'],
      ['INV-CA-102', 'Topaz Solar Farm, CA',    'SMA Solar',     'Sunny Central 2200', 'operational', 'no events'],
      ['INV-CA-105', 'Topaz Solar Farm, CA',    'SMA Solar',     'Sunny Central 2200', 'derated',     'IGBT high-temp derating 12:30'],
      ['INV-CA-108', 'Topaz Solar Farm, CA',    'SMA Solar',     'Sunny Central 2200', 'operational', 'no events'],
      ['INV-AZ-201', 'Agua Caliente Solar, AZ', 'Power Electronics','HEC 1875',       'operational', 'no events'],
      ['INV-AZ-205', 'Agua Caliente Solar, AZ', 'Power Electronics','HEC 1875',       'fault',       'AC over-current trip 09:14'],
      ['INV-AZ-210', 'Agua Caliente Solar, AZ', 'Power Electronics','HEC 1875',       'operational', 'no events'],
      ['INV-ES-301', 'Cádiz Solar Plant, ES',   'Ingeteam',      'Ingecon Sun 1500TL', 'operational', 'no events'],
      ['INV-ES-305', 'Cádiz Solar Plant, ES',   'Ingeteam',      'Ingecon Sun 1500TL', 'derated',     'grid voltage support, MVAR mode'],
      ['INV-IN-401', 'Rajasthan Solar Park, IN','Sungrow',       'SG3125HV-MV',        'operational', 'no events'],
      ['INV-IN-405', 'Rajasthan Solar Park, IN','Sungrow',       'SG3125HV-MV',        'operational', 'no events'],
      ['INV-AU-501', 'Bungala Solar, SA, AU',   'SMA Solar',     'Sunny Central 2500', 'operational', 'no events'],
      ['INV-AU-503', 'Bungala Solar, SA, AU',   'SMA Solar',     'Sunny Central 2500', 'down',        'cooling fan failure'],
      ['INV-BR-601', 'Pirapora Solar, BR',      'ABB',           'PVS980-58',          'operational', 'no events'],
      ['INV-BR-605', 'Pirapora Solar, BR',      'ABB',           'PVS980-58',          'operational', 'no events'],
    ];
    for (const i of inverters) {
      await client.query(
        `INSERT INTO inverters (inverter_id,site,vendor,model,status,last_event) VALUES ($1,$2,$3,$4,$5,$6)`,
        i
      );
    }

    // ── panels ───────────────────────────────────────────────
    console.log('[seed] inserting panels...');
    const panels = [
      ['PNL-CA-001', 'Topaz Array A-01',   'First Solar FS-6445A', 25.0, 180, 'operational'],
      ['PNL-CA-005', 'Topaz Array A-05',   'First Solar FS-6445A', 25.0, 180, 'operational'],
      ['PNL-CA-012', 'Topaz Array A-12',   'First Solar FS-6445A', 25.0, 180, 'soiled'],
      ['PNL-AZ-101', 'Agua Caliente B-01', 'First Solar FS-4115',  20.0, 175, 'operational'],
      ['PNL-AZ-105', 'Agua Caliente B-05', 'First Solar FS-4115',  20.0, 175, 'operational'],
      ['PNL-AZ-118', 'Agua Caliente B-18', 'First Solar FS-4115',  20.0, 175, 'damaged'],
      ['PNL-ES-201', 'Cádiz Array C-01',   'JinkoSolar Tiger Neo', 30.0, 195, 'operational'],
      ['PNL-ES-208', 'Cádiz Array C-08',   'JinkoSolar Tiger Neo', 30.0, 195, 'operational'],
      ['PNL-IN-301', 'Rajasthan Block D-1','LONGi Hi-MO 5',        28.0, 180, 'operational'],
      ['PNL-IN-309', 'Rajasthan Block D-9','LONGi Hi-MO 5',        28.0, 180, 'soiled'],
      ['PNL-AU-401', 'Bungala South 1',    'Trina Vertex',         30.0, 0,   'operational'],
      ['PNL-AU-410', 'Bungala South 10',   'Trina Vertex',         30.0, 0,   'operational'],
      ['PNL-BR-501', 'Pirapora E-01',      'Canadian Solar HiKu',  18.0, 180, 'operational'],
      ['PNL-BR-507', 'Pirapora E-07',      'Canadian Solar HiKu',  18.0, 180, 'operational'],
      ['PNL-MX-601', 'Villanueva F-01',    'Trina Vertex',         22.0, 180, 'operational'],
    ];
    for (const p of panels) {
      await client.query(
        `INSERT INTO panels (panel_id,array_name,model,tilt_deg,azimuth,status) VALUES ($1,$2,$3,$4,$5,$6)`,
        p
      );
    }

    // ── transformers ─────────────────────────────────────────
    console.log('[seed] inserting transformers...');
    const transformers = [
      ['XFMR-TX-001', 'Roscoe Wind Farm, TX',    34.5,  'operational', '2024-09-12', 'ABB'],
      ['XFMR-TX-002', 'Roscoe Wind Farm, TX',    138.0, 'operational', '2024-09-14', 'Siemens Energy'],
      ['XFMR-IA-001', 'Storm Lake II, IA',       34.5,  'operational', '2024-11-02', 'ABB'],
      ['XFMR-IA-002', 'Storm Lake II, IA',       161.0, 'fault',       '2024-10-30', 'GE Grid Solutions'],
      ['XFMR-NY-001', 'Maple Ridge Wind, NY',    34.5,  'operational', '2025-01-15', 'Hitachi Energy'],
      ['XFMR-OFF-001','Hornsea Project Two, UK', 66.0,  'operational', '2024-08-22', 'Siemens Energy'],
      ['XFMR-OFF-002','Hornsea OSS Two, UK',     220.0, 'operational', '2024-08-25', 'Siemens Energy'],
      ['XFMR-CA-001', 'Topaz Solar Farm, CA',    34.5,  'operational', '2025-02-10', 'ABB'],
      ['XFMR-CA-002', 'Topaz Substation, CA',    230.0, 'operational', '2025-02-12', 'GE Grid Solutions'],
      ['XFMR-AZ-001', 'Agua Caliente, AZ',       34.5,  'operational', '2025-01-08', 'ABB'],
      ['XFMR-AZ-002', 'Agua Caliente Sub, AZ',   230.0, 'derated',     '2025-01-10', 'ABB'],
      ['XFMR-ES-001', 'Cádiz Solar Plant, ES',   30.0,  'operational', '2025-03-04', 'Hitachi Energy'],
      ['XFMR-ES-002', 'Cádiz Substation, ES',    220.0, 'operational', '2025-03-06', 'Hitachi Energy'],
      ['XFMR-IN-001', 'Rajasthan Solar Park, IN',33.0,  'operational', '2025-04-18', 'Bharat Heavy Electricals'],
      ['XFMR-AU-001', 'Bungala Substation, AU',  132.0, 'operational', '2025-02-21', 'Wilson Transformer'],
    ];
    for (const x of transformers) {
      await client.query(
        `INSERT INTO transformers (xfmr_id,site,voltage_kv,status,last_inspection,manufacturer) VALUES ($1,$2,$3,$4,$5,$6)`,
        x
      );
    }

    // ── met_masts ────────────────────────────────────────────
    console.log('[seed] inserting met_masts...');
    const masts = [
      ['MAST-TX-001','Roscoe Wind Farm, TX',     80.0, 'anemometer,wind vane,temp,baro',         'operational', '2025-03-15'],
      ['MAST-TX-002','Roscoe Wind Farm, TX',     100.0,'sonic anemometer,wind vane,temp,baro,RH','operational', '2025-03-15'],
      ['MAST-IA-001','Storm Lake II, IA',        80.0, 'anemometer,wind vane,temp,baro,RH',      'operational', '2025-04-02'],
      ['MAST-IA-002','Storm Lake II, IA',        100.0,'sonic anemometer,LIDAR,temp,baro',       'operational', '2025-04-02'],
      ['MAST-NY-001','Maple Ridge Wind, NY',     80.0, 'anemometer,wind vane,temp,baro,ice-det', 'operational', '2025-02-12'],
      ['MAST-OFF-001','Hornsea Project Two, UK', 100.0,'sonic anemometer,wave,wind vane',        'operational', '2025-01-30'],
      ['MAST-OFF-002','Hornsea Project Two, UK', 100.0,'sonic anemometer,wave,wind vane',        'fault',       '2025-01-30'],
      ['MAST-CA-001','Topaz Solar Farm, CA',     10.0, 'GHI,POA,temp,RH,wind',                   'operational', '2025-03-25'],
      ['MAST-AZ-001','Agua Caliente Solar, AZ',  10.0, 'GHI,POA,temp,RH,wind,soiling sensor',    'operational', '2025-03-25'],
      ['MAST-ES-001','Cádiz Solar Plant, ES',    10.0, 'GHI,DNI,POA,temp,RH,wind',               'operational', '2025-04-10'],
      ['MAST-IN-001','Rajasthan Solar Park, IN', 10.0, 'GHI,DNI,POA,temp,RH,wind,dust',          'operational', '2025-04-15'],
      ['MAST-AU-001','Bungala Solar/Wind, AU',   10.0, 'GHI,POA,temp,RH,wind',                   'operational', '2025-03-30'],
      ['MAST-BR-001','Pirapora Solar, BR',       10.0, 'GHI,DNI,POA,temp,RH',                    'operational', '2025-04-20'],
      ['MAST-MX-001','Villanueva, MX',           10.0, 'GHI,POA,temp,RH,wind',                   'operational', '2025-04-05'],
      ['MAST-MX-002','Oaxaca Wind, MX',          100.0,'sonic anemometer,wind vane,temp',        'maintenance', '2025-02-28'],
    ];
    for (const m of masts) {
      await client.query(
        `INSERT INTO met_masts (mast_id,site,height_m,instruments,status,last_calibration) VALUES ($1,$2,$3,$4,$5,$6)`,
        m
      );
    }

    // ── ppa_contracts ────────────────────────────────────────
    console.log('[seed] inserting ppa_contracts...');
    const ppas = [
      ['PPA-2024-001','Southern California Edison',           20, 42.50, '2024-01-01', 'active'],
      ['PPA-2024-008','Southern California Edison',           15, 38.75, '2024-04-01', 'active'],
      ['PPA-2025-014','Google',                               12, 45.10, '2025-01-01', 'active'],
      ['PPA-2025-021','Microsoft',                            10, 41.80, '2025-02-15', 'active'],
      ['PPA-2025-031','Amazon Web Services (Spain)',          12, 52.30, '2025-03-01', 'active'],
      ['PPA-CFD-2024-002','UK Low Carbon Contracts Co.',      15, 92.50, '2024-04-01', 'active'],
      ['PPA-2023-009','Salt River Project',                   20, 36.20, '2023-06-01', 'active'],
      ['PPA-2023-014','Pacific Gas & Electric',               25, 39.40, '2023-10-01', 'active'],
      ['PPA-2024-022','MidAmerican Energy',                   15, 28.75, '2024-07-15', 'active'],
      ['PPA-2024-030','Meta Platforms',                       10, 47.90, '2024-11-01', 'active'],
      ['PPA-2025-005','EnBW Energie Baden-Württemberg',       12, 71.20, '2025-01-01', 'active'],
      ['PPA-2022-018','Hydro-Québec',                         20, 34.10, '2022-09-01', 'active'],
      ['PPA-2024-040','Iron Mountain',                         8, 49.65, '2024-12-01', 'active'],
      ['PPA-2021-007','Duke Energy',                          15, 31.50, '2021-05-01', 'expired'],
      ['PPA-2025-045','BHP Group (mining offtake)',           10, 58.00, '2025-04-15', 'pending'],
    ];
    for (const p of ppas) {
      await client.query(
        `INSERT INTO ppa_contracts (ppa_id,counterparty,term_years,price_per_mwh,start_date,status) VALUES ($1,$2,$3,$4,$5,$6)`,
        p
      );
    }

    // ── work_orders ──────────────────────────────────────────
    console.log('[seed] inserting work_orders...');
    const workOrders = [
      ['WO-2026-0001','WTG-IA-014',  'gearbox-repair',      'critical', 'Crew Alpha (IA)',  'in_progress'],
      ['WO-2026-0002','WTG-TX-027',  'pitch-motor-replace', 'high',     'Crew Bravo (TX)',  'open'],
      ['WO-2026-0003','INV-CA-105',  'IGBT-replace',        'high',     'Crew Charlie (CA)','open'],
      ['WO-2026-0004','ARR-CA-012',  'panel-cleaning',      'normal',   'Crew Charlie (CA)','scheduled'],
      ['WO-2026-0005','XFMR-AZ-002', 'DGA-sample',          'high',     'Crew Delta (AZ)',  'open'],
      ['WO-2026-0006','MAST-IA-001', 'calibration',         'normal',   'Crew Alpha (IA)',  'open'],
      ['WO-2026-0007','WTG-OFF-009', 'blade-LE-repair',     'normal',   'Offshore Crew 1',  'scheduled'],
      ['WO-2026-0008','INV-AU-503',  'cooling-fan-replace', 'high',     'Crew Echo (AU)',   'open'],
      ['WO-2026-0009','WTG-MX-007',  'yaw-system-inspect',  'normal',   'Crew Foxtrot (MX)','open'],
      ['WO-2026-0010','XFMR-IA-002', 'bushing-replace',     'critical', 'Crew Alpha (IA)',  'scheduled'],
      ['WO-2026-0011','PNL-AZ-118',  'panel-replace',       'normal',   'Crew Delta (AZ)',  'open'],
      ['WO-2026-0012','MAST-MX-002', 'anemometer-replace',  'normal',   'Crew Foxtrot (MX)','open'],
      ['WO-2026-0013','WTG-NY-012',  'annual-inspection',   'normal',   'Crew Golf (NY)',   'in_progress'],
      ['WO-2026-0014','INV-AZ-205',  'AC-overcurrent-fix',  'high',     'Crew Delta (AZ)',  'in_progress'],
      ['WO-2026-0015','BESS-TX-001', 'BMS-firmware-update', 'normal',   'Crew Bravo (TX)',  'closed'],
    ];
    for (const w of workOrders) {
      await client.query(
        `INSERT INTO work_orders (wo_id,asset_id,type,priority,assignee,status) VALUES ($1,$2,$3,$4,$5,$6)`,
        w
      );
    }

    // ── maintenance_logs ─────────────────────────────────────
    console.log('[seed] inserting maintenance_logs...');
    const mlogs = [
      ['MLG-2026-0001','WTG-TX-001',  'Replaced HSS bearing',                'A. Hernandez',  18.5, '2026-04-12 18:30+00'],
      ['MLG-2026-0002','WTG-TX-014',  'Annual oil sample + filter swap',     'A. Hernandez',  3.0,  '2026-04-15 14:00+00'],
      ['MLG-2026-0003','INV-CA-101',  'Quarterly cabinet inspection',        'M. Chen',       2.0,  '2026-04-18 10:00+00'],
      ['MLG-2026-0004','XFMR-TX-001', 'Bushing PD test',                     'T. Williams',   4.5,  '2026-04-20 11:15+00'],
      ['MLG-2026-0005','WTG-IA-001',  'Yaw motor brushes replaced',          'J. Petersen',   5.5,  '2026-04-22 16:00+00'],
      ['MLG-2026-0006','MAST-IA-002', 'LIDAR data download + QC',            'R. Kumar',      1.5,  '2026-04-25 09:30+00'],
      ['MLG-2026-0007','INV-ES-301',  'Annual PV inverter PMI',              'P. Sanchez',    6.0,  '2026-04-26 13:00+00'],
      ['MLG-2026-0008','WTG-OFF-001', 'Lubrication system PMI',              'L. Andersen',   8.0,  '2026-04-28 18:00+00'],
      ['MLG-2026-0009','PNL-CA-005',  'Cleaned 240 modules',                 'M. Chen',       4.0,  '2026-04-30 12:00+00'],
      ['MLG-2026-0010','XFMR-CA-001', 'Cooling fan motor replacement',       'D. Park',       3.5,  '2026-05-02 14:30+00'],
      ['MLG-2026-0011','WTG-NY-001',  'Gearbox oil change',                  'E. Brown',      6.5,  '2026-05-04 17:00+00'],
      ['MLG-2026-0012','WTG-ES-003',  'Pitch system 6-month inspection',     'P. Sanchez',    7.0,  '2026-05-06 11:30+00'],
      ['MLG-2026-0013','BESS-TX-001', 'Battery SOH characterization run',    'A. Hernandez',  9.0,  '2026-05-08 20:00+00'],
      ['MLG-2026-0014','WTG-AU-005',  'Commissioning torque checks',         "K. O'Brien",   12.0, '2026-05-10 16:00+00'],
      ['MLG-2026-0015','INV-IN-401',  'Cooling fan filter clean (dust)',     'R. Kumar',      2.5,  '2026-05-12 10:00+00'],
    ];
    for (const l of mlogs) {
      await client.query(
        `INSERT INTO maintenance_logs (log_id,asset_id,work,technician,hours_spent,completed_at) VALUES ($1,$2,$3,$4,$5,$6)`,
        l
      );
    }

    // ── sensor_streams ───────────────────────────────────────
    console.log('[seed] inserting sensor_streams...');
    const streams = [
      ['STR-0001','WTG-IA-014', 'gearbox-vibration',  'mm/s',    8.4,    '2026-05-16 14:00+00'],
      ['STR-0002','WTG-IA-014', 'oil-iron-ppm',       'ppm',     84.0,   '2026-05-16 14:00+00'],
      ['STR-0003','WTG-TX-027', 'pitch-motor-current','A',       18.5,   '2026-05-16 14:00+00'],
      ['STR-0004','WTG-OFF-009','yaw-brake-pad',      '%',       38.0,   '2026-05-16 14:00+00'],
      ['STR-0005','INV-CA-105', 'igbt-junction-temp', 'C',       118.0,  '2026-05-16 14:00+00'],
      ['STR-0006','XFMR-AZ-002','dga-c2h2-ppm',       'ppm',     12.0,   '2026-05-16 14:00+00'],
      ['STR-0007','WTG-TX-001', 'wind-speed-hub',     'm/s',     11.2,   '2026-05-16 14:00+00'],
      ['STR-0008','PNL-CA-012', 'soiling-loss',       '%',       4.6,    '2026-05-16 14:00+00'],
      ['STR-0009','MAST-IA-001','wind-speed-100m',    'm/s',     12.8,   '2026-05-16 14:00+00'],
      ['STR-0010','MAST-CA-001','ghi',                'W/m2',    920.0,  '2026-05-16 14:00+00'],
      ['STR-0011','BESS-TX-001','state-of-health',    '%',       87.0,   '2026-05-16 14:00+00'],
      ['STR-0012','INV-AU-503', 'ac-output-kw',       'kW',      0.0,    '2026-05-16 14:00+00'],
      ['STR-0013','XFMR-IA-002','top-oil-temp',       'C',       82.0,   '2026-05-16 14:00+00'],
      ['STR-0014','WTG-NY-012', 'rpm',                'rpm',     0.0,    '2026-05-16 14:00+00'],
      ['STR-0015','PNL-IN-309', 'soiling-loss',       '%',       6.8,    '2026-05-16 14:00+00'],
    ];
    for (const s of streams) {
      await client.query(
        `INSERT INTO sensor_streams (stream_id,asset_id,sensor,units,last_value,last_ts) VALUES ($1,$2,$3,$4,$5,$6)`,
        s
      );
    }

    // ── faults ──────────────────────────────────────────────
    console.log('[seed] inserting faults...');
    const faults = [
      ['FLT-2026-0001','WTG-IA-014',  'GBX-3201','critical','2026-05-12 02:14+00','open'],
      ['FLT-2026-0002','WTG-TX-027',  'P0312',   'high',    '2026-05-13 09:00+00','open'],
      ['FLT-2026-0003','INV-CA-105',  'OT-118',  'high',    '2026-05-14 12:30+00','acknowledged'],
      ['FLT-2026-0004','XFMR-AZ-002', 'DGA-ALM', 'critical','2026-05-15 06:00+00','open'],
      ['FLT-2026-0005','INV-AZ-205',  'AC-OC',   'high',    '2026-05-15 09:14+00','in_progress'],
      ['FLT-2026-0006','WTG-OFF-009', 'YAW-DRFT','medium',  '2026-05-15 18:22+00','open'],
      ['FLT-2026-0007','WTG-MX-007',  'GEN-OT',  'high',    '2026-05-16 04:00+00','open'],
      ['FLT-2026-0008','INV-AU-503',  'FAN-FAIL','medium',  '2026-05-16 07:45+00','open'],
      ['FLT-2026-0009','XFMR-IA-002', 'BUSH-PD', 'critical','2026-05-16 11:10+00','open'],
      ['FLT-2026-0010','MAST-OFF-002','SONIC-NS','medium',  '2026-05-16 13:00+00','acknowledged'],
      ['FLT-2026-0011','WTG-NY-012',  'ANNUAL',  'low',     '2026-05-10 08:00+00','in_progress'],
      ['FLT-2026-0012','PNL-AZ-118',  'CRACK',   'medium',  '2026-05-09 15:00+00','open'],
      ['FLT-2026-0013','MAST-MX-002', 'ANEMO-NS','low',     '2026-05-08 10:30+00','open'],
      ['FLT-2026-0014','WTG-ES-018',  'CURT-CMD','low',     '2026-05-16 14:00+00','closed'],
      ['FLT-2026-0015','BESS-TX-001', 'FW-MISM', 'low',     '2026-05-05 22:00+00','closed'],
    ];
    for (const f of faults) {
      await client.query(
        `INSERT INTO faults (fault_id,asset_id,code,severity,opened_at,status) VALUES ($1,$2,$3,$4,$5,$6)`,
        f
      );
    }

    // ── curtailment_events ───────────────────────────────────
    console.log('[seed] inserting curtailment_events...');
    const curtail = [
      ['CRT-2026-0001','Roscoe Wind Farm, TX',     'ERCOT negative LMP',          80.0,  '2026-05-12 23:00+00','2026-05-13 04:00+00'],
      ['CRT-2026-0002','Topaz Solar Farm, CA',     'CAISO oversupply',            120.0, '2026-05-13 10:00+00','2026-05-13 14:00+00'],
      ['CRT-2026-0003','Storm Lake II, IA',        'MISO transmission constraint',45.0,  '2026-05-14 06:00+00','2026-05-14 12:00+00'],
      ['CRT-2026-0004','Maple Ridge Wind, NY',     'Icing safety hold',           65.0,  '2026-05-14 18:00+00','2026-05-15 06:00+00'],
      ['CRT-2026-0005','Cádiz Solar Plant, ES',    'REE voltage support',         40.0,  '2026-05-15 14:00+00','2026-05-15 18:00+00'],
      ['CRT-2026-0006','Hornsea Project Two, UK',  'Constraint payment scheme',  220.0,  '2026-05-15 02:00+00','2026-05-15 06:00+00'],
      ['CRT-2026-0007','Agua Caliente Solar, AZ',  'Substation maintenance',     150.0,  '2026-05-15 10:00+00','2026-05-15 12:00+00'],
      ['CRT-2026-0008','Rajasthan Solar Park, IN', 'State grid frequency hold',  100.0,  '2026-05-15 13:00+00','2026-05-15 15:00+00'],
      ['CRT-2026-0009','Bungala Solar, SA, AU',    'AEMO 5-min lower cap',        60.0,  '2026-05-16 04:00+00','2026-05-16 05:00+00'],
      ['CRT-2026-0010','Oaxaca Wind, MX',          'CFE dispatch order',          35.0,  '2026-05-16 07:00+00','2026-05-16 11:00+00'],
      ['CRT-2026-0011','Pirapora Solar, BR',       'ONS curtailment',             75.0,  '2026-05-16 12:00+00','2026-05-16 14:00+00'],
      ['CRT-2026-0012','Roscoe Wind Farm, TX',     'Substation outage',           70.0,  '2026-05-11 08:00+00','2026-05-11 14:00+00'],
      ['CRT-2026-0013','Topaz Solar Farm, CA',     'Wildfire smoke (preventive)', 30.0,  '2026-05-10 12:00+00','2026-05-10 16:00+00'],
      ['CRT-2026-0014','Storm Lake II, IA',        'PPA buyer nomination',        25.0,  '2026-05-09 22:00+00','2026-05-10 06:00+00'],
      ['CRT-2026-0015','Cádiz Wind Cluster, ES',   'High wind safety shutdown',   85.0,  '2026-05-16 00:00+00','2026-05-16 02:00+00'],
    ];
    for (const c of curtail) {
      await client.query(
        `INSERT INTO curtailment_events (event_id,site,reason,mw_curtailed,start_at,end_at) VALUES ($1,$2,$3,$4,$5,$6)`,
        c
      );
    }

    // ── weather_forecasts ────────────────────────────────────
    console.log('[seed] inserting weather_forecasts...');
    const wxf = [
      ['WXF-2026-0001','Roscoe Wind Farm, TX',     '2026-05-17 00:00+00', 12.5, 0.0,    22.0],
      ['WXF-2026-0002','Roscoe Wind Farm, TX',     '2026-05-17 12:00+00', 15.8, 0.0,    28.0],
      ['WXF-2026-0003','Storm Lake II, IA',        '2026-05-17 00:00+00',  9.4, 0.0,    14.0],
      ['WXF-2026-0004','Storm Lake II, IA',        '2026-05-17 12:00+00', 11.6, 0.0,    19.0],
      ['WXF-2026-0005','Maple Ridge Wind, NY',     '2026-05-17 06:00+00',  8.2, 0.0,    11.0],
      ['WXF-2026-0006','Hornsea Project Two, UK',  '2026-05-17 00:00+00', 18.3, 0.0,    11.5],
      ['WXF-2026-0007','Hornsea Project Two, UK',  '2026-05-17 12:00+00', 17.1, 0.0,    13.0],
      ['WXF-2026-0008','Topaz Solar Farm, CA',     '2026-05-17 12:00+00',  4.5, 920.0,  24.0],
      ['WXF-2026-0009','Topaz Solar Farm, CA',     '2026-05-17 18:00+00',  3.2, 480.0,  22.0],
      ['WXF-2026-0010','Agua Caliente Solar, AZ',  '2026-05-17 12:00+00',  3.8, 980.0,  35.0],
      ['WXF-2026-0011','Cádiz Solar Plant, ES',    '2026-05-17 12:00+00',  6.2, 890.0,  26.0],
      ['WXF-2026-0012','Rajasthan Solar Park, IN', '2026-05-17 12:00+00',  4.1, 960.0,  42.0],
      ['WXF-2026-0013','Bungala Solar, SA, AU',    '2026-05-17 12:00+00',  5.5, 720.0,  18.0],
      ['WXF-2026-0014','Pirapora Solar, BR',       '2026-05-17 12:00+00',  3.6, 880.0,  29.0],
      ['WXF-2026-0015','Oaxaca Wind, MX',          '2026-05-17 06:00+00', 14.2, 0.0,    24.0],
    ];
    for (const w of wxf) {
      await client.query(
        `INSERT INTO weather_forecasts (forecast_id,site,valid_at,wind_mps,irradiance_wm2,temperature_c) VALUES ($1,$2,$3,$4,$5,$6)`,
        w
      );
    }

    // ── energy_meters ────────────────────────────────────────
    console.log('[seed] inserting energy_meters...');
    const meters = [
      ['MTR-TX-001','Roscoe Wind Farm, TX',     124800000.50,'2026-05-16 14:00+00','ok',     'online'],
      ['MTR-TX-002','Roscoe Wind Farm, TX',     119300000.10,'2026-05-16 14:00+00','ok',     'online'],
      ['MTR-IA-001','Storm Lake II, IA',         98200000.25,'2026-05-16 14:00+00','ok',     'online'],
      ['MTR-IA-002','Storm Lake II, IA',         96100000.60,'2026-05-16 14:00+00','ok',     'offline'],
      ['MTR-NY-001','Maple Ridge Wind, NY',      72400000.00,'2026-05-16 14:00+00','ok',     'online'],
      ['MTR-OFF-001','Hornsea Project Two, UK',  412000000.20,'2026-05-16 14:00+00','ok',    'online'],
      ['MTR-OFF-002','Hornsea Project Two, UK',  398400000.40,'2026-05-16 14:00+00','ok',    'online'],
      ['MTR-CA-001','Topaz Solar Farm, CA',     186000000.80,'2026-05-16 14:00+00','ok',     'online'],
      ['MTR-CA-002','Topaz Solar Farm, CA',     181200000.10,'2026-05-16 14:00+00','warn',   'online'],
      ['MTR-AZ-001','Agua Caliente Solar, AZ',  201400000.00,'2026-05-16 14:00+00','ok',     'online'],
      ['MTR-ES-001','Cádiz Solar Plant, ES',     84500000.50,'2026-05-16 14:00+00','ok',     'online'],
      ['MTR-IN-001','Rajasthan Solar Park, IN', 312000000.00,'2026-05-16 14:00+00','ok',     'online'],
      ['MTR-AU-001','Bungala Solar, SA, AU',     74800000.10,'2026-05-16 14:00+00','ok',     'online'],
      ['MTR-BR-001','Pirapora Solar, BR',       104500000.00,'2026-05-16 14:00+00','fault',  'offline'],
      ['MTR-MX-001','Oaxaca Wind, MX',           62300000.00,'2026-05-16 14:00+00','ok',     'online'],
    ];
    for (const m of meters) {
      await client.query(
        `INSERT INTO energy_meters (meter_id,site,reading_kwh,reading_at,status,comm_status) VALUES ($1,$2,$3,$4,$5,$6)`,
        m
      );
    }

    // ── technicians ──────────────────────────────────────────
    console.log('[seed] inserting technicians...');
    const techs = [
      ['TEC-001','Aldo Hernandez',     'BZEE,GWO,LOTO',           'Roscoe, TX',          'available',  'aldo@windsolar.io'],
      ['TEC-002','Mei Chen',           'NABCEP-PV,OSHA-30',       'Topaz, CA',           'available',  'mei@windsolar.io'],
      ['TEC-003','Tom Williams',       'BZEE,HV-switching',       'Roscoe, TX',          'on_call',    'tom@windsolar.io'],
      ['TEC-004','Jens Petersen',      'BZEE,GWO',                'Storm Lake, IA',      'available',  'jens@windsolar.io'],
      ['TEC-005','Rajesh Kumar',       'NABCEP-PV,GWO',           'Rajasthan, IN',       'available',  'rajesh@windsolar.io'],
      ['TEC-006','Paloma Sanchez',     'BZEE,GWO,HV',             'Cádiz, ES',           'available',  'paloma@windsolar.io'],
      ['TEC-007','Lars Andersen',      'GWO Offshore,MIST',       'Grimsby, UK',         'deployed',   'lars@windsolar.io'],
      ['TEC-008','Dae-soo Park',       'NABCEP-PV',               'Topaz, CA',           'available',  'dae@windsolar.io'],
      ['TEC-009','Emily Brown',        'BZEE,GWO',                'Maple Ridge, NY',     'available',  'emily@windsolar.io'],
      ['TEC-010','Katie OBrien',       'GWO,BZEE',                'Bungala, AU',         'available',  'katie@windsolar.io'],
      ['TEC-011','Felipe Souza',       'NABCEP-PV',               'Pirapora, BR',        'available',  'felipe@windsolar.io'],
      ['TEC-012','Andrea Romero',      'BZEE,GWO',                'Oaxaca, MX',          'on_leave',   'andrea@windsolar.io'],
      ['TEC-013','Hiroshi Tanaka',     'NABCEP-PV,HV',            'Yamagata, JP',        'available',  'hiroshi@windsolar.io'],
      ['TEC-014','Sophia Müller',      'BZEE,GWO',                'Bremen, DE',          'available',  'sophia@windsolar.io'],
      ['TEC-015','Daniel Ngata',       'NABCEP-PV,OSHA-30',       'Cape Town, ZA',       'available',  'daniel@windsolar.io'],
    ];
    for (const t of techs) {
      await client.query(
        `INSERT INTO technicians (tech_id,name,certifications,base,status,contact) VALUES ($1,$2,$3,$4,$5,$6)`,
        t
      );
    }

    // ── spare_parts ──────────────────────────────────────────
    console.log('[seed] inserting spare_parts...');
    const parts = [
      ['PRT-0001','GE-HSS-BRG-1.5',    'GE 1.5MW HSS bearing',                   4,   'Roscoe warehouse, TX',   2],
      ['PRT-0002','VES-PITCH-MOTOR',   'Vestas V112 pitch motor',                3,   'Roscoe warehouse, TX',   1],
      ['PRT-0003','SMA-IGBT-MOD-2200', 'SMA Sunny Central 2200 IGBT module',     6,   'Topaz warehouse, CA',    2],
      ['PRT-0004','SG-YAW-BRAKE-PAD',  'Siemens Gamesa SG 8.0 yaw brake pad set',12,  'Grimsby warehouse, UK',  4],
      ['PRT-0005','ABB-BUSHING-230',   'ABB 230kV bushing',                       2,  'Agua Caliente, AZ',      1],
      ['PRT-0006','FS-MODULE-6445A',   'First Solar FS-6445A module',           240,  'Topaz warehouse, CA',  100],
      ['PRT-0007','FS-MODULE-4115',    'First Solar FS-4115 module',            180,  'Agua Caliente, AZ',     80],
      ['PRT-0008','JKO-VERTEX-580W',   'Trina Vertex 580W module',              420,  'Bungala warehouse, AU',150],
      ['PRT-0009','ANEMO-NRG-40C',     'NRG #40C anemometer',                    18,  'Storm Lake, IA',         6],
      ['PRT-0010','LIDAR-WINDCUBE',    'Vaisala WindCube spare',                  1,  'Storm Lake, IA',         1],
      ['PRT-0011','XFMR-COOL-FAN',     'Cooling fan motor 480V',                  8,  'Topaz warehouse, CA',    3],
      ['PRT-0012','GE-GBX-OIL-200L',   'GE-approved gearbox oil 200L drum',      14,  'Roscoe warehouse, TX',   4],
      ['PRT-0013','PE-IGBT-1875',      'Power Electronics HEC 1875 IGBT bank',    3,  'Agua Caliente, AZ',      1],
      ['PRT-0014','BESS-BMS-MOD',      'BESS BMS module v3.2',                    5,  'Roscoe warehouse, TX',   2],
      ['PRT-0015','SCADA-COMS-RTU',    'SCADA RTU 4G modem',                     22,  'Central warehouse, TX',  8],
    ];
    for (const p of parts) {
      await client.query(
        `INSERT INTO spare_parts (part_id,sku,description,qty_on_hand,location,reorder_point) VALUES ($1,$2,$3,$4,$5,$6)`,
        p
      );
    }

    // ── safety_incidents ─────────────────────────────────────
    console.log('[seed] inserting safety_incidents...');
    const safety = [
      ['SIN-2026-0001','Roscoe Wind Farm, TX',     'near-miss',          'medium',  '2026-05-15 11:00+00','open'],
      ['SIN-2026-0002','Roscoe Wind Farm, TX',     'fall-arrest',        'high',    '2026-05-12 14:30+00','in_progress'],
      ['SIN-2026-0003','Storm Lake II, IA',        'minor-injury',       'low',     '2026-05-14 09:00+00','closed'],
      ['SIN-2026-0004','Maple Ridge Wind, NY',     'vehicle-collision',  'medium',  '2026-05-10 16:00+00','closed'],
      ['SIN-2026-0005','Hornsea Project Two, UK',  'CTV-transfer-bump',  'low',     '2026-05-13 07:30+00','closed'],
      ['SIN-2026-0006','Topaz Solar Farm, CA',     'heat-stress',        'medium',  '2026-05-16 13:00+00','in_progress'],
      ['SIN-2026-0007','Agua Caliente Solar, AZ',  'snake-encounter',    'low',     '2026-05-09 10:00+00','closed'],
      ['SIN-2026-0008','Cádiz Solar Plant, ES',    'arc-flash',          'high',    '2026-05-11 15:00+00','open'],
      ['SIN-2026-0009','Rajasthan Solar Park, IN', 'heat-stress',        'medium',  '2026-05-15 14:00+00','open'],
      ['SIN-2026-0010','Bungala Solar, SA, AU',    'PPE-violation',      'low',     '2026-05-08 11:00+00','closed'],
      ['SIN-2026-0011','Oaxaca Wind, MX',          'lightning-near-miss','medium',  '2026-05-14 18:00+00','closed'],
      ['SIN-2026-0012','Pirapora Solar, BR',       'minor-injury',       'low',     '2026-05-12 09:00+00','closed'],
      ['SIN-2026-0013','Storm Lake II, IA',        'ice-throw',          'critical','2026-05-02 06:00+00','closed'],
      ['SIN-2026-0014','Hornsea Project Two, UK',  'man-overboard-drill','low',     '2026-05-06 14:00+00','closed'],
      ['SIN-2026-0015','Roscoe Wind Farm, TX',     'spill-minor-oil',    'low',     '2026-05-15 10:00+00','in_progress'],
    ];
    for (const s of safety) {
      await client.query(
        `INSERT INTO safety_incidents (incident_id,site,type,severity,opened_at,status) VALUES ($1,$2,$3,$4,$5,$6)`,
        s
      );
    }

    // ── performance_kpis ─────────────────────────────────────
    console.log('[seed] inserting performance_kpis...');
    const kpis = [
      ['KPI-0001','Roscoe Wind Farm, TX',     'availability_pct',        96.4,  '2026-04', 97.0],
      ['KPI-0002','Roscoe Wind Farm, TX',     'capacity_factor_pct',     41.2,  '2026-04', 42.0],
      ['KPI-0003','Storm Lake II, IA',        'availability_pct',        94.1,  '2026-04', 97.0],
      ['KPI-0004','Storm Lake II, IA',        'capacity_factor_pct',     38.6,  '2026-04', 40.0],
      ['KPI-0005','Maple Ridge Wind, NY',     'availability_pct',        95.7,  '2026-04', 97.0],
      ['KPI-0006','Hornsea Project Two, UK',  'availability_pct',        97.9,  '2026-04', 98.0],
      ['KPI-0007','Hornsea Project Two, UK',  'capacity_factor_pct',     52.3,  '2026-04', 50.0],
      ['KPI-0008','Topaz Solar Farm, CA',     'pr_pct',                  82.1,  '2026-04', 84.0],
      ['KPI-0009','Topaz Solar Farm, CA',     'soiling_loss_pct',         2.8,  '2026-04',  2.0],
      ['KPI-0010','Agua Caliente Solar, AZ',  'pr_pct',                  84.6,  '2026-04', 84.0],
      ['KPI-0011','Cádiz Solar Plant, ES',    'pr_pct',                  83.2,  '2026-04', 83.0],
      ['KPI-0012','Rajasthan Solar Park, IN', 'pr_pct',                  79.4,  '2026-04', 82.0],
      ['KPI-0013','Rajasthan Solar Park, IN', 'soiling_loss_pct',         5.1,  '2026-04',  3.0],
      ['KPI-0014','Bungala Solar, SA, AU',    'pr_pct',                  85.8,  '2026-04', 84.0],
      ['KPI-0015','Oaxaca Wind, MX',          'availability_pct',        88.4,  '2026-04', 95.0],
    ];
    for (const k of kpis) {
      await client.query(
        `INSERT INTO performance_kpis (kpi_id,site,kpi,value,period,target) VALUES ($1,$2,$3,$4,$5,$6)`,
        k
      );
    }

    // ── audit_log ────────────────────────────────────────────
    console.log('[seed] inserting audit_log...');
    const audit = [
      ['ADT-0001','admin@windsolar.io', 'WTG-IA-014',          'curtail',        'success', '2026-05-15 03:00+00'],
      ['ADT-0002','ops@windsolar.io',   'WO-2026-0001',        'create',         'success', '2026-05-15 09:14+00'],
      ['ADT-0003','admin@windsolar.io', 'PPA-2025-014',        'settle',         'success', '2026-05-14 18:30+00'],
      ['ADT-0004','ops@windsolar.io',   'INV-CA-105',          'derate',         'success', '2026-05-14 12:30+00'],
      ['ADT-0005','admin@windsolar.io', 'users',               'list',           'success', '2026-05-14 10:00+00'],
      ['ADT-0006','ops@windsolar.io',   'WO-2026-0008',        'create',         'success', '2026-05-16 07:46+00'],
      ['ADT-0007','viewer@windsolar.io','dashboard',           'read',           'success', '2026-05-16 14:01+00'],
      ['ADT-0008','admin@windsolar.io', 'webhook:1',           'fire-test',      'success', '2026-05-13 11:22+00'],
      ['ADT-0009','ops@windsolar.io',   'XFMR-AZ-002',         'tag-out',        'success', '2026-05-15 06:05+00'],
      ['ADT-0010','admin@windsolar.io', 'BESS-TX-001',         'firmware-update','success', '2026-05-05 22:15+00'],
      ['ADT-0011','ops@windsolar.io',   'PNL-CA-012',          'mark-soiled',    'success', '2026-05-12 11:00+00'],
      ['ADT-0012','admin@windsolar.io', 'PPA-2025-031',        'rate-update',    'success', '2026-05-10 09:00+00'],
      ['ADT-0013','ops@windsolar.io',   'WTG-OFF-009',         'maintenance-set','success', '2026-05-14 16:00+00'],
      ['ADT-0014','viewer@windsolar.io','/ai/forecast-generation','call',        'success', '2026-05-16 13:00+00'],
      ['ADT-0015','admin@windsolar.io', 'WTG-MX-007',          'declare-down',   'success', '2026-05-16 04:05+00'],
    ];
    for (const a of audit) {
      await client.query(
        `INSERT INTO audit_log (entry_id,actor,target,action,result,ts) VALUES ($1,$2,$3,$4,$5,$6)`,
        a
      );
    }

    // ── users ────────────────────────────────────────────────
    console.log('[seed] inserting users...');
    const users = [
      ['admin@windsolar.io',  'admin123',  'Admin',  'admin'],
      ['ops@windsolar.io',    'ops123',    'Ops',    'ops'],
      ['viewer@windsolar.io', 'viewer123', 'Viewer', 'viewer'],
    ];
    for (const u of users) {
      await client.query(
        `INSERT INTO users (email,password,name,role) VALUES ($1,$2,$3,$4)`,
        u
      );
    }

    // ── notifications (sample) ──────────────────────────────
    console.log('[seed] inserting notifications...');
    const notifications = [
      [1, 'Critical fault: GBX-3201',       'WTG-IA-014 gearbox HSS bearing failure', 'critical', 'faults'],
      [1, 'Transformer DGA alarm',          'XFMR-AZ-002 acetylene 12 ppm',           'critical', 'faults'],
      [2, 'Pitch motor fault recurring',    'WTG-TX-027 P0312 third event',           'high',     'faults'],
      [2, 'Substation maintenance window',  'Agua Caliente: 2h substation outage planned', 'info','curtailment'],
      [1, 'CAISO oversupply event',         'Topaz curtailed 120 MW for 4h',          'info',     'curtailment'],
    ];
    for (const n of notifications) {
      await client.query(
        `INSERT INTO notifications (user_id,title,body,severity,source) VALUES ($1,$2,$3,$4,$5)`,
        n
      );
    }

    // ── webhooks (sample) ───────────────────────────────────
    console.log('[seed] inserting webhooks...');
    const webhooks = [
      ['Grid Ops Notifier',    'https://httpbin.org/post', 'sec_gridops_2026',  'fault.critical,curtailment.created', true],
      ['Compliance & Audit',   'https://httpbin.org/post', 'sec_audit_2026',    'fault.critical',                     true],
    ];
    for (const w of webhooks) {
      await client.query(
        `INSERT INTO webhooks (name,url,secret,events,active) VALUES ($1,$2,$3,$4,$5)`,
        w
      );
    }

    console.log('[seed] complete.');
  } catch (e) {
    console.error('[seed] error:', e);
    process.exitCode = 1;
  } finally {
    client.release();
    await pool.end();
  }
}

run();
