const API_BASE =
  (typeof window !== 'undefined' && window.__API_BASE__) ||
  'http://localhost:3063/api';

export { API_BASE };

const TOKEN_KEY = 'wsops_token';
const USER_KEY  = 'wsops_user';

export function getToken() {
  try { return localStorage.getItem(TOKEN_KEY); } catch (_) { return null; }
}
export function setToken(token) {
  try {
    if (token) localStorage.setItem(TOKEN_KEY, token);
    else localStorage.removeItem(TOKEN_KEY);
  } catch (_) {}
}
export function getStoredUser() {
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (_) { return null; }
}
export function setStoredUser(user) {
  try {
    if (user) localStorage.setItem(USER_KEY, JSON.stringify(user));
    else localStorage.removeItem(USER_KEY);
  } catch (_) {}
}
export function logout() {
  setToken(null);
  setStoredUser(null);
  if (typeof window !== 'undefined') {
    window.location.assign('/login');
  }
}

// Role helpers (admin > ops > viewer)
export function getRole() {
  return (getStoredUser()?.role || 'viewer').toLowerCase();
}
export function canWrite() {
  return ['admin', 'ops'].includes(getRole());
}
export function isAdmin() {
  return getRole() === 'admin';
}

async function request(url, options = {}) {
  const token = getToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
  let res;
  try {
    res = await fetch(`${API_BASE}${url}`, { ...options, headers });
  } catch (e) {
    throw new Error(`Network error: ${e.message}`);
  }

  if (res.status === 401) {
    if (!url.startsWith('/auth/login')) {
      logout();
      throw new Error('Session expired');
    }
  }

  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || `Request failed (${res.status})`);
  return data;
}

// Generic CRUD factory
function crud(base) {
  return {
    list:   ()       => request(`/${base}`),
    get:    (id)     => request(`/${base}/${id}`),
    create: (data)   => request(`/${base}`, { method: 'POST', body: JSON.stringify(data) }),
    update: (id, d)  => request(`/${base}/${id}`, { method: 'PUT',  body: JSON.stringify(d) }),
    remove: (id)     => request(`/${base}/${id}`, { method: 'DELETE' }),
    bulkImport: (csv) => request(`/${base}/bulk-import`, {
      method: 'POST',
      headers: { 'Content-Type': 'text/csv' },
      body: csv,
    }),
    listAttachments: (id) => request(`/${base}/${id}/attachments`),
    uploadAttachment: async (id, file) => {
      const token = getToken();
      const form = new FormData();
      form.append('file', file);
      const res = await fetch(`${API_BASE}/${base}/${id}/attachments`, {
        method: 'POST',
        headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: form,
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || `Upload failed (${res.status})`);
      return data;
    },
  };
}

// 18 entities
export const turbinesApi          = crud('turbines');
export const invertersApi         = crud('inverters');
export const panelsApi            = crud('panels');
export const transformersApi      = crud('transformers');
export const metMastsApi          = crud('met-masts');
export const ppaContractsApi      = crud('ppa-contracts');
export const workOrdersApi        = crud('work-orders');
export const maintenanceLogsApi   = crud('maintenance-logs');
export const sensorStreamsApi     = crud('sensor-streams');
export const faultsApi            = crud('faults');
export const curtailmentEventsApi = crud('curtailment-events');
export const weatherForecastsApi  = crud('weather-forecasts');
export const energyMetersApi      = crud('energy-meters');
export const techniciansApi       = crud('technicians');
export const sparePartsApi        = crud('spare-parts');
export const safetyIncidentsApi   = crud('safety-incidents');
export const performanceKpisApi   = crud('performance-kpis');
export const auditLogApi          = crud('audit-log');

// Dashboard
export const getDashboardStats = () => request('/dashboard');

// Auth
export const login = (email, password) =>
  request('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) });
export const getMe = () => request('/auth/me');

// AI endpoints — 16 verbs
export const aiForecastGeneration     = (body) => request('/ai/forecast-generation',      { method: 'POST', body: JSON.stringify(body || {}) });
export const aiFaultPrognostic        = (body) => request('/ai/fault-prognostic',         { method: 'POST', body: JSON.stringify(body || {}) });
export const aiCurtailmentOptimize    = (body) => request('/ai/curtailment-optimize',     { method: 'POST', body: JSON.stringify(body || {}) });
export const aiPpaSettlement          = (body) => request('/ai/ppa-settlement',           { method: 'POST', body: JSON.stringify(body || {}) });
export const aiScheduleMaintenance    = (body) => request('/ai/schedule-maintenance',     { method: 'POST', body: JSON.stringify(body || {}) });
export const aiFleetHealth            = (body) => request('/ai/fleet-health',             { method: 'POST', body: JSON.stringify(body || {}) });
export const aiWeatherWindow          = (body) => request('/ai/weather-window',           { method: 'POST', body: JSON.stringify(body || {}) });
export const aiBladeInspectionSummary = (body) => request('/ai/blade-inspection-summary', { method: 'POST', body: JSON.stringify(body || {}) });
export const aiDraftWorkOrder         = (body) => request('/ai/draft-work-order',         { method: 'POST', body: JSON.stringify(body || {}) });
export const aiExecutiveBrief         = (body) => request('/ai/executive-brief',          { method: 'POST', body: JSON.stringify(body || {}) });
export const aiRampRateStrategy       = (body) => request('/ai/ramp-rate-strategy',       { method: 'POST', body: JSON.stringify(body || {}) });
export const aiInverterClippingDetect = (body) => request('/ai/inverter-clipping-detect', { method: 'POST', body: JSON.stringify(body || {}) });
export const aiTurbineAvailability    = (body) => request('/ai/turbine-availability',     { method: 'POST', body: JSON.stringify(body || {}) });
export const aiVendorWarrantyClaim    = (body) => request('/ai/vendor-warranty-claim',    { method: 'POST', body: JSON.stringify(body || {}) });
export const aiAssetDegTrend          = (body) => request('/ai/asset-deg-trend',          { method: 'POST', body: JSON.stringify(body || {}) });
export const aiRootCauseAnalyzer      = (body) => request('/ai/root-cause-analyzer',      { method: 'POST', body: JSON.stringify(body || {}) });

// AI history
export const getAIHistory = (feature, limit = 25) => {
  const qs = new URLSearchParams({
    ...(feature ? { feature } : {}),
    limit: String(limit),
  }).toString();
  return request(`/ai/history?${qs}`);
};

// AI sample fills
export const getAISamples = (feature) => {
  const qs = new URLSearchParams({ feature: feature || '' }).toString();
  return request(`/ai/samples?${qs}`);
};

// Notifications
export const getNotifications       = () => request('/notifications');
export const getUnreadNotifications = () => request('/notifications/unread');
export const markNotificationRead   = (id) => request(`/notifications/${id}/read`, { method: 'POST' });
export const markAllNotificationsRead = () => request('/notifications/mark-all-read', { method: 'POST' });

// Webhooks
export const webhooksApi = {
  list:    ()         => request('/webhooks'),
  create:  (d)        => request('/webhooks',          { method: 'POST', body: JSON.stringify(d) }),
  update:  (id, d)    => request(`/webhooks/${id}`,    { method: 'PUT',  body: JSON.stringify(d) }),
  remove:  (id)       => request(`/webhooks/${id}`,    { method: 'DELETE' }),
  test:    (event, payload) => request('/webhooks/test', {
    method: 'POST',
    body: JSON.stringify({ event, payload }),
  }),
  deliveries: (id)    => request(`/webhooks/${id}/deliveries`),
};
