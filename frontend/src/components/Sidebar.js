import React from 'react';
import { NavLink } from 'react-router-dom';
import { logout, getStoredUser } from '../services/api';

// ── Asset groups ───────────────────────────────────────────
const ASSETS_LINKS = [
  { to: '/turbines',      label: 'Turbines' },
  { to: '/inverters',     label: 'Inverters' },
  { to: '/panels',        label: 'Panels' },
  { to: '/transformers',  label: 'Transformers' },
  { to: '/met-masts',     label: 'Met Masts' },
];

const OPERATIONS_LINKS = [
  { to: '/work-orders',        label: 'Work Orders' },
  { to: '/maintenance-logs',   label: 'Maintenance Logs' },
  { to: '/sensor-streams',     label: 'Sensor Streams' },
  { to: '/energy-meters',      label: 'Energy Meters' },
  { to: '/weather-forecasts',  label: 'Weather Forecasts' },
];

const FAULTS_LINKS = [
  { to: '/faults',              label: 'Faults' },
  { to: '/curtailment-events',  label: 'Curtailment Events' },
  { to: '/safety-incidents',    label: 'Safety Incidents' },
];

const CONTRACTS_LINKS = [
  { to: '/ppa-contracts',     label: 'PPA Contracts' },
  { to: '/technicians',       label: 'Technicians' },
  { to: '/spare-parts',       label: 'Spare Parts' },
];

const GOVERNANCE_LINKS = [
  { to: '/performance-kpis',  label: 'Performance KPIs' },
  { to: '/audit-log',         label: 'Audit Log' },
];

// ── AI groups ──────────────────────────────────────────────
const AI_FORECASTING = [
  { to: '/ai/forecast-generation',    label: 'AI · Forecast Generation' },
  { to: '/ai/weather-window',         label: 'AI · Weather Window' },
  { to: '/ai/curtailment-optimize',   label: 'AI · Curtailment Optimize' },
  { to: '/ai/ramp-rate-strategy',     label: 'AI · Ramp-Rate Strategy' },
];

const AI_MAINTENANCE = [
  { to: '/ai/fault-prognostic',         label: 'AI · Fault Prognostic' },
  { to: '/ai/schedule-maintenance',     label: 'AI · Schedule Maintenance' },
  { to: '/ai/blade-inspection-summary', label: 'AI · Blade Inspection' },
  { to: '/ai/draft-work-order',         label: 'AI · Draft Work Order' },
  { to: '/ai/root-cause-analyzer',      label: 'AI · Root Cause Analyzer' },
];

const AI_PERFORMANCE = [
  { to: '/ai/fleet-health',              label: 'AI · Fleet Health' },
  { to: '/ai/turbine-availability',      label: 'AI · Turbine Availability' },
  { to: '/ai/inverter-clipping-detect',  label: 'AI · Inverter Clipping' },
  { to: '/ai/asset-deg-trend',           label: 'AI · Asset Deg Trend' },
  { to: '/ai/ppa-settlement',            label: 'AI · PPA Settlement' },
  { to: '/ai/vendor-warranty-claim',     label: 'AI · Vendor Warranty Claim' },
  { to: '/ai/executive-brief',           label: 'AI · Executive Brief' },
];

export default function Sidebar() {
  const user = getStoredUser();
  return (
    <nav className="sidebar">
      <div className="sidebar-brand">
        <h1>WIND / SOLAR OPS</h1>
        <p>Renewable Energy Hub</p>
      </div>

      <div className="sidebar-group-label">Overview</div>
      <NavLink to="/" end>Command Dashboard</NavLink>

      <div className="sidebar-group-label">Assets</div>
      {ASSETS_LINKS.map((l) => <NavLink key={l.to} to={l.to}>{l.label}</NavLink>)}

      <div className="sidebar-group-label">Operations</div>
      {OPERATIONS_LINKS.map((l) => <NavLink key={l.to} to={l.to}>{l.label}</NavLink>)}

      <div className="sidebar-group-label">Faults</div>
      {FAULTS_LINKS.map((l) => <NavLink key={l.to} to={l.to}>{l.label}</NavLink>)}

      <div className="sidebar-group-label">Contracts</div>
      {CONTRACTS_LINKS.map((l) => <NavLink key={l.to} to={l.to}>{l.label}</NavLink>)}

      <div className="sidebar-group-label">Governance</div>
      {GOVERNANCE_LINKS.map((l) => <NavLink key={l.to} to={l.to}>{l.label}</NavLink>)}

      <div className="sidebar-group-label">AI Forecasting</div>
      {AI_FORECASTING.map((l) => <NavLink key={l.to} to={l.to}>{l.label}</NavLink>)}

      <div className="sidebar-group-label">AI Maintenance</div>
      {AI_MAINTENANCE.map((l) => <NavLink key={l.to} to={l.to}>{l.label}</NavLink>)}

      <div className="sidebar-group-label">AI Performance</div>
      {AI_PERFORMANCE.map((l) => <NavLink key={l.to} to={l.to}>{l.label}</NavLink>)}

      <div className="sidebar-group-label">Custom Views</div>
      <NavLink to="/custom-views">Site Map &amp; Curve</NavLink>

      <div className="sidebar-group-label">Admin</div>
      <NavLink to="/webhooks">Webhooks</NavLink>

      <div className="sidebar-user">
        {user && (
          <div className="sidebar-user-info">
            <div className="sidebar-user-name">{user.name || user.email}</div>
            <div className="sidebar-user-role">{user.role || 'user'}</div>
          </div>
        )}
        <button className="btn secondary sidebar-logout" onClick={logout}>Sign Out</button>
      </div>
    </nav>
  );
}
