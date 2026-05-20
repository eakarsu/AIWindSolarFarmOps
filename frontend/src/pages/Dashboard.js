import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getDashboardStats } from '../services/api';

const ASSET_FEATURES = [
  { path: '/turbines',     title: 'Turbines',     icon: 'T', color: '#0ea5e9', desc: 'Wind turbine generators across all sites.' },
  { path: '/inverters',    title: 'Inverters',    icon: 'I', color: '#06b6d4', desc: 'Solar PV inverters by site and vendor.' },
  { path: '/panels',       title: 'Panels',       icon: 'P', color: '#22c55e', desc: 'PV panel arrays and module health.' },
  { path: '/transformers', title: 'Transformers', icon: 'X', color: '#f59e0b', desc: 'Power transformers and substation gear.' },
  { path: '/met-masts',    title: 'Met Masts',    icon: 'M', color: '#a78bfa', desc: 'Meteorological masts and resource sensors.' },
];

const OPS_FEATURES = [
  { path: '/work-orders',       title: 'Work Orders',       icon: 'W', color: '#ec4899', desc: 'Open, scheduled and in-progress work.' },
  { path: '/maintenance-logs',  title: 'Maintenance Logs',  icon: 'L', color: '#a3e635', desc: 'Completed maintenance activities.' },
  { path: '/sensor-streams',    title: 'Sensor Streams',    icon: 'S', color: '#60a5fa', desc: 'Live sensor channels per asset.' },
  { path: '/energy-meters',     title: 'Energy Meters',     icon: 'E', color: '#facc15', desc: 'Revenue meters by site.' },
  { path: '/weather-forecasts', title: 'Weather Forecasts', icon: 'F', color: '#7dd3fc', desc: 'Wind / irradiance / temperature.' },
];

const FAULTS_FEATURES = [
  { path: '/faults',             title: 'Faults',             icon: '!', color: '#ef4444', desc: 'Open and acknowledged faults.' },
  { path: '/curtailment-events', title: 'Curtailment Events', icon: 'C', color: '#fb7185', desc: 'Grid + economic curtailments.' },
  { path: '/safety-incidents',   title: 'Safety Incidents',   icon: '+', color: '#dc2626', desc: 'HSE incidents and near-misses.' },
];

const CONTRACTS_FEATURES = [
  { path: '/ppa-contracts', title: 'PPA Contracts', icon: 'P', color: '#14b8a6', desc: 'Power purchase agreements.' },
  { path: '/technicians',   title: 'Technicians',   icon: 'T', color: '#34d399', desc: 'Field crews, certs, availability.' },
  { path: '/spare-parts',   title: 'Spare Parts',   icon: '#', color: '#f472b6', desc: 'Warehouse inventory.' },
];

const GOV_FEATURES = [
  { path: '/performance-kpis', title: 'Performance KPIs', icon: 'K', color: '#10b981', desc: 'Availability, capacity factor, PR.' },
  { path: '/audit-log',        title: 'Audit Log',        icon: 'A', color: '#94a3b8', desc: 'System and user action trail.' },
];

const AI_FEATURES = [
  { path: '/ai/forecast-generation',    title: 'AI · Forecast Generation',  desc: 'MWh forecast for wind / solar site.' },
  { path: '/ai/weather-window',         title: 'AI · Weather Window',       desc: 'Find safe windows for activities.' },
  { path: '/ai/curtailment-optimize',   title: 'AI · Curtailment Optimize', desc: 'Revenue-aware curtailment plan.' },
  { path: '/ai/ramp-rate-strategy',     title: 'AI · Ramp-Rate Strategy',   desc: 'Grid-code compliant ramp settings.' },
  { path: '/ai/fault-prognostic',       title: 'AI · Fault Prognostic',     desc: 'Predict probable component failure.' },
  { path: '/ai/schedule-maintenance',   title: 'AI · Schedule Maintenance', desc: 'Optimize crews + weather windows.' },
  { path: '/ai/blade-inspection-summary', title: 'AI · Blade Inspection',   desc: 'Summarize a blade inspection report.' },
  { path: '/ai/draft-work-order',       title: 'AI · Draft Work Order',     desc: 'From natural-language intent.' },
  { path: '/ai/root-cause-analyzer',    title: 'AI · Root Cause Analyzer',  desc: 'RCA with 5-whys + corrective actions.' },
  { path: '/ai/fleet-health',           title: 'AI · Fleet Health',         desc: 'Score fleet + worst-offender assets.' },
  { path: '/ai/turbine-availability',   title: 'AI · Turbine Availability', desc: 'IEC 61400-26 availability.' },
  { path: '/ai/inverter-clipping-detect', title: 'AI · Inverter Clipping',  desc: 'Detect clipping, quantify lost energy.' },
  { path: '/ai/asset-deg-trend',        title: 'AI · Asset Deg Trend',      desc: 'Soiling, power curve, SOH drift.' },
  { path: '/ai/ppa-settlement',         title: 'AI · PPA Settlement',       desc: 'Compute payable + deviations.' },
  { path: '/ai/vendor-warranty-claim',  title: 'AI · Vendor Warranty Claim',desc: 'Draft a complete claim package.' },
  { path: '/ai/executive-brief',        title: 'AI · Executive Brief',      desc: 'Daily operations brief.' },
];

function FeatureGrid({ items }) {
  const navigate = useNavigate();
  return (
    <div className="feature-grid">
      {items.map((f) => (
        <div
          key={f.path}
          className="feature-card"
          style={{ ['--card-color']: f.color || '#8b5cf6' }}
          onClick={() => navigate(f.path)}
        >
          <div className="feature-card-icon" style={{ background: (f.color || '#8b5cf6') + '22', color: f.color || '#8b5cf6' }}>
            {f.icon || '*'}
          </div>
          <h3>{f.title}</h3>
          <p>{f.desc}</p>
        </div>
      ))}
    </div>
  );
}

function GroupHeading({ children }) {
  return (
    <h3 style={{ color: '#cbd5e1', margin: '20px 0 12px', fontSize: 14, textTransform: 'uppercase', letterSpacing: 1 }}>
      {children}
    </h3>
  );
}

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [err, setErr] = useState(null);

  useEffect(() => {
    getDashboardStats().then(setStats).catch((e) => setErr(e.message));
  }, []);

  return (
    <div>
      <div className="dashboard-header">
        <h2>Renewable Operations Dashboard</h2>
        <p>Wind + Solar fleet snapshot · {new Date().toUTCString()}</p>
      </div>

      {err && <div className="ai-error">Stats unavailable: {err}</div>}

      {stats && (
        <div className="stats-grid">
          <div className="stat"><div className="stat-label">Turbines</div><div className="stat-value">{stats.turbines?.total ?? '—'}</div><div className="stat-sub">{stats.turbines?.operational ?? 0} operational · {stats.turbines?.down ?? 0} down</div></div>
          <div className="stat"><div className="stat-label">Inverters</div><div className="stat-value">{stats.inverters?.total ?? '—'}</div><div className="stat-sub">{stats.inverters?.operational ?? 0} operational · {stats.inverters?.derated ?? 0} derated</div></div>
          <div className="stat"><div className="stat-label">Panels</div><div className="stat-value">{stats.panels?.total ?? '—'}</div><div className="stat-sub">{stats.panels?.operational ?? 0} operational</div></div>
          <div className="stat"><div className="stat-label">Transformers</div><div className="stat-value">{stats.transformers?.total ?? '—'}</div><div className="stat-sub">{stats.transformers?.operational ?? 0} operational</div></div>
          <div className="stat"><div className="stat-label">Met Masts</div><div className="stat-value">{stats.met_masts?.total ?? '—'}</div><div className="stat-sub">{stats.met_masts?.operational ?? 0} operational</div></div>
          <div className="stat"><div className="stat-label">PPA Contracts</div><div className="stat-value">{stats.ppa_contracts?.total ?? '—'}</div><div className="stat-sub">{stats.ppa_contracts?.active ?? 0} active</div></div>
          <div className="stat"><div className="stat-label">Work Orders</div><div className="stat-value">{stats.work_orders?.total ?? '—'}</div><div className="stat-sub">{stats.work_orders?.open ?? 0} open · {stats.work_orders?.critical ?? 0} critical</div></div>
          <div className="stat"><div className="stat-label">Maint. Logs</div><div className="stat-value">{stats.maintenance_logs?.total ?? '—'}</div><div className="stat-sub">completed</div></div>
          <div className="stat"><div className="stat-label">Sensor Streams</div><div className="stat-value">{stats.sensor_streams?.total ?? '—'}</div><div className="stat-sub">channels</div></div>
          <div className="stat"><div className="stat-label">Faults</div><div className="stat-value">{stats.faults?.total ?? '—'}</div><div className="stat-sub">{stats.faults?.open ?? 0} open · {stats.faults?.critical ?? 0} critical</div></div>
          <div className="stat"><div className="stat-label">Curtailments</div><div className="stat-value">{stats.curtailment_events?.total ?? '—'}</div><div className="stat-sub">{Number(stats.curtailment_events?.mw || 0).toLocaleString()} MW</div></div>
          <div className="stat"><div className="stat-label">Forecasts</div><div className="stat-value">{stats.weather_forecasts?.total ?? '—'}</div><div className="stat-sub">weather samples</div></div>
          <div className="stat"><div className="stat-label">Meters</div><div className="stat-value">{stats.energy_meters?.total ?? '—'}</div><div className="stat-sub">{stats.energy_meters?.online ?? 0} online</div></div>
          <div className="stat"><div className="stat-label">Technicians</div><div className="stat-value">{stats.technicians?.total ?? '—'}</div><div className="stat-sub">{stats.technicians?.available ?? 0} available</div></div>
          <div className="stat"><div className="stat-label">Spare Parts</div><div className="stat-value">{stats.spare_parts?.total ?? '—'}</div><div className="stat-sub">{Number(stats.spare_parts?.total_qty || 0).toLocaleString()} on hand</div></div>
          <div className="stat"><div className="stat-label">Safety</div><div className="stat-value">{stats.safety_incidents?.total ?? '—'}</div><div className="stat-sub">{stats.safety_incidents?.high ?? 0} high · {stats.safety_incidents?.critical ?? 0} critical</div></div>
          <div className="stat"><div className="stat-label">KPIs</div><div className="stat-value">{stats.performance_kpis?.total ?? '—'}</div><div className="stat-sub">tracked</div></div>
          <div className="stat"><div className="stat-label">Audit Entries</div><div className="stat-value">{stats.audit_log?.total ?? '—'}</div><div className="stat-sub">trail</div></div>
        </div>
      )}

      <GroupHeading>AI Decision Support</GroupHeading>
      <FeatureGrid items={AI_FEATURES.map((f) => ({ ...f, icon: '*', color: '#8b5cf6' }))} />

      <GroupHeading>Assets</GroupHeading>
      <FeatureGrid items={ASSET_FEATURES} />

      <GroupHeading>Operations</GroupHeading>
      <FeatureGrid items={OPS_FEATURES} />

      <GroupHeading>Faults &amp; Safety</GroupHeading>
      <FeatureGrid items={FAULTS_FEATURES} />

      <GroupHeading>Contracts &amp; Resources</GroupHeading>
      <FeatureGrid items={CONTRACTS_FEATURES} />

      <GroupHeading>Governance</GroupHeading>
      <FeatureGrid items={GOV_FEATURES} />
    </div>
  );
}
