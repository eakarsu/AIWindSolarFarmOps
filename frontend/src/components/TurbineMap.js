import React, { useEffect, useState, useMemo } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { API_BASE, getToken } from '../services/api';

// Workaround: default Leaflet marker icons reference relative paths that
// don't survive CRA bundling. We only use CircleMarker below, but this
// keeps any future <Marker> safe too.
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl:       'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl:     'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

function statusColor(status) {
  const s = String(status || '').toLowerCase();
  if (s === 'operational') return '#22c55e';
  if (s === 'fault' || s === 'down') return '#ef4444';
  if (s === 'maintenance') return '#f59e0b';
  if (s === 'derated') return '#fb923c';
  if (s === 'commissioning') return '#38bdf8';
  return '#94a3b8';
}

export default function TurbineMap() {
  const [data, setData] = useState(null);
  const [err, setErr] = useState(null);

  useEffect(() => {
    const token = getToken();
    fetch(`${API_BASE}/custom-views/turbine-locations`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    })
      .then((r) => r.json().then((j) => (r.ok ? j : Promise.reject(new Error(j.error || r.statusText)))))
      .then(setData)
      .catch((e) => setErr(e.message));
  }, []);

  const center = useMemo(() => {
    if (data?.center) return [data.center.lat, data.center.lng];
    return [32.5, -101.0];
  }, [data]);

  if (err) return <div className="ai-error">Map failed to load: {err}</div>;
  if (!data) return <div style={{ color: '#94a3b8' }}>Loading turbine locations…</div>;

  return (
    <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
      <div style={{ padding: '10px 14px', borderBottom: '1px solid #1e293b', color: '#cbd5e1', fontSize: 13 }}>
        Turbine Site Map · {data.count} turbines · centre {center[0].toFixed(3)}, {center[1].toFixed(3)}
      </div>
      <div style={{ height: 480, width: '100%' }}>
        <MapContainer
          center={center}
          zoom={5}
          scrollWheelZoom={false}
          style={{ height: '100%', width: '100%' }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {data.turbines.map((t) => (
            <CircleMarker
              key={t.id}
              center={[Number(t.lat), Number(t.lng)]}
              radius={8}
              pathOptions={{
                color: statusColor(t.status),
                fillColor: statusColor(t.status),
                fillOpacity: 0.85,
                weight: 1,
              }}
            >
              <Popup>
                <div style={{ minWidth: 180 }}>
                  <div style={{ fontWeight: 600, marginBottom: 4 }}>{t.turbine_id}</div>
                  <div><strong>Site:</strong> {t.site}</div>
                  <div><strong>Vendor:</strong> {t.vendor}</div>
                  <div><strong>Capacity:</strong> {Number(t.capacity_mw).toFixed(2)} MW</div>
                  <div>
                    <strong>Status:</strong>{' '}
                    <span style={{ color: statusColor(t.status) }}>{t.status}</span>
                  </div>
                </div>
              </Popup>
            </CircleMarker>
          ))}
        </MapContainer>
      </div>
      <div style={{ padding: '8px 14px', borderTop: '1px solid #1e293b', color: '#94a3b8', fontSize: 12, display: 'flex', gap: 16, flexWrap: 'wrap' }}>
        <span><span style={{ display: 'inline-block', width: 10, height: 10, background: '#22c55e', borderRadius: 5, marginRight: 6 }} />Operational</span>
        <span><span style={{ display: 'inline-block', width: 10, height: 10, background: '#ef4444', borderRadius: 5, marginRight: 6 }} />Fault / Down</span>
        <span><span style={{ display: 'inline-block', width: 10, height: 10, background: '#f59e0b', borderRadius: 5, marginRight: 6 }} />Maintenance</span>
        <span><span style={{ display: 'inline-block', width: 10, height: 10, background: '#fb923c', borderRadius: 5, marginRight: 6 }} />Derated</span>
      </div>
    </div>
  );
}
