import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Topbar from './components/Topbar';
import Dashboard from './pages/Dashboard';

// 18 CRUD pages
import TurbinesPage          from './pages/TurbinesPage';
import InvertersPage         from './pages/InvertersPage';
import PanelsPage            from './pages/PanelsPage';
import TransformersPage      from './pages/TransformersPage';
import MetMastsPage          from './pages/MetMastsPage';
import PpaContractsPage      from './pages/PpaContractsPage';
import WorkOrdersPage        from './pages/WorkOrdersPage';
import MaintenanceLogsPage   from './pages/MaintenanceLogsPage';
import SensorStreamsPage     from './pages/SensorStreamsPage';
import FaultsPage            from './pages/FaultsPage';
import CurtailmentEventsPage from './pages/CurtailmentEventsPage';
import WeatherForecastsPage  from './pages/WeatherForecastsPage';
import EnergyMetersPage      from './pages/EnergyMetersPage';
import TechniciansPage       from './pages/TechniciansPage';
import SparePartsPage        from './pages/SparePartsPage';
import SafetyIncidentsPage   from './pages/SafetyIncidentsPage';
import PerformanceKpisPage   from './pages/PerformanceKpisPage';
import AuditLogPage          from './pages/AuditLogPage';

// 16 AI pages
import AIForecastGenerationPage  from './pages/AIForecastGenerationPage';
import AIFaultPrognosticPage     from './pages/AIFaultPrognosticPage';
import AICurtailmentOptimizePage from './pages/AICurtailmentOptimizePage';
import AIPpaSettlementPage       from './pages/AIPpaSettlementPage';
import AIScheduleMaintenancePage from './pages/AIScheduleMaintenancePage';
import AIFleetHealthPage         from './pages/AIFleetHealthPage';
import AIWeatherWindowPage       from './pages/AIWeatherWindowPage';
import AIBladeInspectionPage     from './pages/AIBladeInspectionPage';
import AIDraftWorkOrderPage      from './pages/AIDraftWorkOrderPage';
import AIExecutiveBriefPage      from './pages/AIExecutiveBriefPage';
import AIRampRateStrategyPage    from './pages/AIRampRateStrategyPage';
import AIInverterClippingPage    from './pages/AIInverterClippingPage';
import AITurbineAvailabilityPage from './pages/AITurbineAvailabilityPage';
import AIVendorWarrantyPage      from './pages/AIVendorWarrantyPage';
import AIAssetDegTrendPage       from './pages/AIAssetDegTrendPage';
import AIRootCausePage           from './pages/AIRootCausePage';

// Pass 7 — full backlog AI pages (6)
import AIIntradayForecastPage     from './pages/AIIntradayForecastPage';
import AITicketPrioritizerPage    from './pages/AITicketPrioritizerPage';
import AIPpaShortfallPage         from './pages/AIPpaShortfallPage';
import AISoilingIcingPage         from './pages/AISoilingIcingPage';
import AIHybridStoragePage        from './pages/AIHybridStoragePage';
import AIDroneBladeInspectionPage from './pages/AIDroneBladeInspectionPage';
import AIDispatchConfidencePage   from './pages/AIDispatchConfidencePage';

// Pass 7 — full backlog non-AI pages (3)
import ScadaEventsPage            from './pages/ScadaEventsPage';
import WorkOrderStateMachinePage  from './pages/WorkOrderStateMachinePage';
import IsoBidsPage                from './pages/IsoBidsPage';

// Admin
import WebhooksPage from './pages/WebhooksPage';

// Custom views (turbine map + 24h generation curve)
import CustomViewsPage from './pages/CustomViewsPage';

import LoginPage from './pages/LoginPage';
import { getToken } from './services/api';

import './App.css';

import CodexCustomVizFeature from './pages/CodexCustomVizFeature';
import CodexOperationsFeature from './pages/CodexOperationsFeature';

function RequireAuth({ children }) {
  const location = useLocation();
  if (!getToken()) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }
  return children;
}

function ShellRoutes() {
  return (
    <div className="app">
      <Sidebar />
      <main className="main" style={{ padding: 0 }}>
        <Topbar />
        <div style={{ padding: '24px 32px' }}>
          <Routes>
        <Route path="/codex/custom-viz" element={<CodexCustomVizFeature />} />
        <Route path="/codex/operations" element={<CodexOperationsFeature />} />

            <Route path="/" element={<Dashboard />} />

            <Route path="/turbines"           element={<TurbinesPage />} />
            <Route path="/inverters"          element={<InvertersPage />} />
            <Route path="/panels"             element={<PanelsPage />} />
            <Route path="/transformers"       element={<TransformersPage />} />
            <Route path="/met-masts"          element={<MetMastsPage />} />
            <Route path="/ppa-contracts"      element={<PpaContractsPage />} />
            <Route path="/work-orders"        element={<WorkOrdersPage />} />
            <Route path="/maintenance-logs"   element={<MaintenanceLogsPage />} />
            <Route path="/sensor-streams"     element={<SensorStreamsPage />} />
            <Route path="/faults"             element={<FaultsPage />} />
            <Route path="/curtailment-events" element={<CurtailmentEventsPage />} />
            <Route path="/weather-forecasts"  element={<WeatherForecastsPage />} />
            <Route path="/energy-meters"      element={<EnergyMetersPage />} />
            <Route path="/technicians"        element={<TechniciansPage />} />
            <Route path="/spare-parts"        element={<SparePartsPage />} />
            <Route path="/safety-incidents"   element={<SafetyIncidentsPage />} />
            <Route path="/performance-kpis"   element={<PerformanceKpisPage />} />
            <Route path="/audit-log"          element={<AuditLogPage />} />

            <Route path="/ai/forecast-generation"     element={<AIForecastGenerationPage />} />
            <Route path="/ai/fault-prognostic"        element={<AIFaultPrognosticPage />} />
            <Route path="/ai/curtailment-optimize"    element={<AICurtailmentOptimizePage />} />
            <Route path="/ai/ppa-settlement"          element={<AIPpaSettlementPage />} />
            <Route path="/ai/schedule-maintenance"    element={<AIScheduleMaintenancePage />} />
            <Route path="/ai/fleet-health"            element={<AIFleetHealthPage />} />
            <Route path="/ai/weather-window"          element={<AIWeatherWindowPage />} />
            <Route path="/ai/blade-inspection-summary" element={<AIBladeInspectionPage />} />
            <Route path="/ai/draft-work-order"        element={<AIDraftWorkOrderPage />} />
            <Route path="/ai/executive-brief"         element={<AIExecutiveBriefPage />} />
            <Route path="/ai/ramp-rate-strategy"      element={<AIRampRateStrategyPage />} />
            <Route path="/ai/inverter-clipping-detect" element={<AIInverterClippingPage />} />
            <Route path="/ai/turbine-availability"    element={<AITurbineAvailabilityPage />} />
            <Route path="/ai/vendor-warranty-claim"   element={<AIVendorWarrantyPage />} />
            <Route path="/ai/asset-deg-trend"         element={<AIAssetDegTrendPage />} />
            <Route path="/ai/root-cause-analyzer"     element={<AIRootCausePage />} />

            {/* Pass 7 — full backlog AI routes (6) */}
            <Route path="/ai/intraday-forecast"       element={<AIIntradayForecastPage />} />
            <Route path="/ai/ticket-prioritizer"      element={<AITicketPrioritizerPage />} />
            <Route path="/ai/ppa-shortfall-narrator"  element={<AIPpaShortfallPage />} />
            <Route path="/ai/soiling-icing-detect"    element={<AISoilingIcingPage />} />
            <Route path="/ai/hybrid-storage-co-opt"   element={<AIHybridStoragePage />} />
            <Route path="/ai/drone-blade-inspection"  element={<AIDroneBladeInspectionPage />} />
            <Route path="/ai/dispatch-confidence"     element={<AIDispatchConfidencePage />} />

            {/* Pass 7 — full backlog non-AI routes (3) */}
            <Route path="/scada-events"               element={<ScadaEventsPage />} />
            <Route path="/work-order-fsm"             element={<WorkOrderStateMachinePage />} />
            <Route path="/iso-bids"                   element={<IsoBidsPage />} />

            <Route path="/webhooks" element={<WebhooksPage />} />
            <Route path="/custom-views" element={<CustomViewsPage />} />

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </main>
    </div>
  );
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/*"
          element={
            <RequireAuth>
              <ShellRoutes />
            </RequireAuth>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
