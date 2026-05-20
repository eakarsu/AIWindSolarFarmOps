import React, { useEffect, useState } from 'react';
import {
  ResponsiveContainer, ComposedChart, Line, XAxis, YAxis,
  CartesianGrid, Tooltip, Legend,
} from 'recharts';
import { API_BASE, getToken } from '../services/api';

export default function GenerationCurve() {
  const [data, setData] = useState(null);
  const [err, setErr] = useState(null);

  useEffect(() => {
    const token = getToken();
    fetch(`${API_BASE}/custom-views/generation-curve`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    })
      .then((r) => r.json().then((j) => (r.ok ? j : Promise.reject(new Error(j.error || r.statusText)))))
      .then(setData)
      .catch((e) => setErr(e.message));
  }, []);

  if (err) return <div className="ai-error">Curve failed to load: {err}</div>;
  if (!data) return <div style={{ color: '#94a3b8' }}>Loading 24-hour generation curve…</div>;

  return (
    <div className="card" style={{ padding: 14 }}>
      <div style={{ color: '#cbd5e1', fontSize: 13, marginBottom: 8 }}>
        Hourly Generation Curve · {data.horizon_hours}h horizon ·{' '}
        operational capacity {Number(data.operational_capacity_mw).toFixed(1)} MW
      </div>
      <div style={{ width: '100%', height: 360 }}>
        <ResponsiveContainer>
          <ComposedChart data={data.series} margin={{ top: 10, right: 20, left: 0, bottom: 4 }}>
            <CartesianGrid stroke="#1e293b" strokeDasharray="3 3" />
            <XAxis dataKey="label" stroke="#94a3b8" tick={{ fontSize: 11 }} />
            <YAxis
              yAxisId="wind"
              orientation="left"
              stroke="#38bdf8"
              tick={{ fontSize: 11 }}
              label={{ value: 'Wind (m/s)', angle: -90, position: 'insideLeft', fill: '#38bdf8', fontSize: 11 }}
            />
            <YAxis
              yAxisId="mwh"
              orientation="right"
              stroke="#22c55e"
              tick={{ fontSize: 11 }}
              label={{ value: 'Predicted (MWh)', angle: 90, position: 'insideRight', fill: '#22c55e', fontSize: 11 }}
            />
            <Tooltip
              contentStyle={{ background: '#0f172a', border: '1px solid #1e293b', color: '#e2e8f0', fontSize: 12 }}
              labelStyle={{ color: '#cbd5e1' }}
            />
            <Legend wrapperStyle={{ fontSize: 12, color: '#cbd5e1' }} />
            <Line
              yAxisId="wind"
              type="monotone"
              dataKey="wind_mps"
              name="Wind speed (m/s)"
              stroke="#38bdf8"
              strokeWidth={2}
              dot={false}
            />
            <Line
              yAxisId="mwh"
              type="monotone"
              dataKey="predicted_mwh"
              name="Predicted generation (MWh)"
              stroke="#22c55e"
              strokeWidth={2}
              dot={false}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
