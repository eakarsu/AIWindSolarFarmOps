import React, { useEffect, useState } from 'react';
import { scadaEventsApi, canWrite } from '../services/api';

export default function ScadaEventsPage() {
  const [rows, setRows] = useState([]);
  const [schema, setSchema] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [form, setForm] = useState({
    source_event_id: '',
    source_system: 'GE-ServiceLink',
    asset_id: '',
    asset_type: 'turbine',
    site: '',
    event_type: 'fault',
    severity: 'medium',
    code: '',
    message: '',
    event_ts: new Date().toISOString(),
  });
  const [posting, setPosting] = useState(false);
  const [postResult, setPostResult] = useState(null);

  const writer = canWrite();

  const load = async () => {
    setLoading(true); setError(null);
    try {
      const [list, sch] = await Promise.all([scadaEventsApi.list({ limit: 100 }), scadaEventsApi.schema()]);
      setRows(Array.isArray(list) ? list : []);
      setSchema(sch);
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const setField = (k, v) => setForm((s) => ({ ...s, [k]: v }));

  const handleIngest = async () => {
    setPosting(true); setPostResult(null);
    try {
      const r = await scadaEventsApi.ingest({
        ...form,
        payload: { manual_entry: true, message: form.message },
      });
      setPostResult(r);
      await load();
    } catch (e) {
      setPostResult({ status: 'failed', error: e.message });
    } finally {
      setPosting(false);
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h2>SCADA Event Ingest</h2>
          <p>Canonical event envelope, idempotent on <code>source_event_id</code>. Schema documented inline.</p>
        </div>
        <div className="page-header-actions">
          <button className="btn secondary" onClick={load} disabled={loading}>Refresh</button>
        </div>
      </div>

      {error && <div className="ai-error">{error}</div>}

      {schema && (
        <div className="card" style={{ marginBottom: 16 }}>
          <h3 style={{ marginTop: 0 }}>Schema</h3>
          <pre style={{ fontSize: 12, overflow: 'auto', maxHeight: 220 }}>
            {JSON.stringify(schema, null, 2)}
          </pre>
        </div>
      )}

      {writer && (
        <div className="card" style={{ marginBottom: 16 }}>
          <h3 style={{ marginTop: 0 }}>Ingest one event</h3>
          <div className="form-grid">
            {[
              ['source_event_id', 'Source Event ID (unique)', 'text'],
              ['source_system',   'Source System',            'text'],
              ['asset_id',        'Asset ID',                 'text'],
              ['site',            'Site',                     'text'],
              ['code',            'Vendor Code',              'text'],
              ['event_ts',        'Event Timestamp',          'text'],
            ].map(([k, label, type]) => (
              <div className="form-group" key={k}>
                <label>{label}</label>
                <input type={type} value={form[k]} onChange={(e) => setField(k, e.target.value)} />
              </div>
            ))}
            <div className="form-group">
              <label>Asset Type</label>
              <select value={form.asset_type} onChange={(e) => setField('asset_type', e.target.value)}>
                {['turbine','inverter','transformer','met_mast','battery'].map((t) => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Event Type</label>
              <select value={form.event_type} onChange={(e) => setField('event_type', e.target.value)}>
                {['fault','alarm','status','setpoint','telemetry','trip','reset'].map((t) => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Severity</label>
              <select value={form.severity} onChange={(e) => setField('severity', e.target.value)}>
                {['info','low','medium','high','critical'].map((t) => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div className="form-group full-width">
              <label>Message</label>
              <textarea value={form.message} onChange={(e) => setField('message', e.target.value)} />
            </div>
          </div>
          <div style={{ marginTop: 12 }}>
            <button className="btn ai" disabled={posting || !form.source_event_id} onClick={handleIngest}>
              {posting ? 'Ingesting...' : 'Ingest Event'}
            </button>
          </div>
          {postResult && (
            <pre style={{ marginTop: 12, fontSize: 12, maxHeight: 200, overflow: 'auto' }}>
              {JSON.stringify(postResult, null, 2)}
            </pre>
          )}
        </div>
      )}

      <div className="card">
        <h3 style={{ marginTop: 0 }}>Recent Events ({rows.length})</h3>
        {loading ? (
          <div className="empty-state">Loading...</div>
        ) : rows.length === 0 ? (
          <div className="empty-state">No SCADA events ingested yet.</div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Source Event ID</th>
                <th>Asset</th>
                <th>Type</th>
                <th>Severity</th>
                <th>Code</th>
                <th>Event TS</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id}>
                  <td>{r.id}</td>
                  <td><code>{r.source_event_id}</code></td>
                  <td>{r.asset_id} <span style={{ color: '#888' }}>({r.asset_type})</span></td>
                  <td>{r.event_type}</td>
                  <td>{r.severity}</td>
                  <td>{r.code || '—'}</td>
                  <td>{r.event_ts ? new Date(r.event_ts).toLocaleString() : '—'}</td>
                  <td>{r.ingest_status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
