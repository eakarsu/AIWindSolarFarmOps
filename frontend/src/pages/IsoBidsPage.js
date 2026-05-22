import React, { useEffect, useState } from 'react';
import { isoBidsApi, canWrite } from '../services/api';

const ISOS = ['ERCOT','CAISO','MISO','NYISO','PJM','SPP','ISONE','AESO','AEMO','NGESO','REE'];
const MARKETS = ['DAM','RTM','ASM','FCAS','BM'];

export default function IsoBidsPage() {
  const [rows, setRows] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [submitState, setSubmitState] = useState(null);
  const [form, setForm] = useState({
    bid_id: '',
    iso: 'ERCOT',
    market: 'DAM',
    site: '',
    resource_id: '',
    delivery_date: new Date().toISOString().slice(0, 10),
    bid_payload_text: JSON.stringify({
      blocks: [
        { hour: 14, mw: 100, price_usd_per_mwh: 28.5 },
        { hour: 15, mw: 100, price_usd_per_mwh: 31.0 },
      ],
    }, null, 2),
  });

  const writer = canWrite();

  const load = async () => {
    setLoading(true); setError(null);
    try {
      const list = await isoBidsApi.list();
      setRows(Array.isArray(list) ? list : []);
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const setField = (k, v) => setForm((s) => ({ ...s, [k]: v }));

  const handleCreate = async () => {
    setCreating(true); setError(null);
    try {
      let payload = {};
      try { payload = JSON.parse(form.bid_payload_text || '{}'); }
      catch (_) { throw new Error('bid_payload must be valid JSON'); }
      await isoBidsApi.create({
        bid_id: form.bid_id || undefined,
        iso: form.iso,
        market: form.market,
        site: form.site,
        resource_id: form.resource_id,
        delivery_date: form.delivery_date,
        bid_payload: payload,
      });
      await load();
    } catch (e) { setError(e.message); }
    finally { setCreating(false); }
  };

  const handleSubmit = async (id) => {
    setSubmitState(null);
    try {
      const r = await isoBidsApi.submit(id);
      setSubmitState({ id, ok: true, data: r });
    } catch (e) {
      // 503 from server arrives as thrown error; that's the *expected* gated response.
      setSubmitState({ id, ok: false, error: e.message });
    }
    await load();
  };

  const handleWithdraw = async (id) => {
    try { await isoBidsApi.withdraw(id); await load(); }
    catch (e) { setError(e.message); }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h2>ISO / RTO Bid Submissions</h2>
          <p>
            Draft persistence is fully functional. The real <code>submit</code> action is gated 503 —
            production credentials (ERCOT MIS digital cert, CAISO CMRI cert, etc.) are not provisioned in this environment.
          </p>
        </div>
        <div className="page-header-actions">
          <button className="btn secondary" onClick={load} disabled={loading}>Refresh</button>
        </div>
      </div>

      {error && <div className="ai-error">{error}</div>}

      {writer && (
        <div className="card" style={{ marginBottom: 16 }}>
          <h3 style={{ marginTop: 0 }}>New Bid Draft</h3>
          <div className="form-grid">
            <div className="form-group">
              <label>Bid ID (optional)</label>
              <input value={form.bid_id} onChange={(e) => setField('bid_id', e.target.value)} />
            </div>
            <div className="form-group">
              <label>ISO</label>
              <select value={form.iso} onChange={(e) => setField('iso', e.target.value)}>
                {ISOS.map((i) => <option key={i}>{i}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Market</label>
              <select value={form.market} onChange={(e) => setField('market', e.target.value)}>
                {MARKETS.map((m) => <option key={m}>{m}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Site</label>
              <input value={form.site} onChange={(e) => setField('site', e.target.value)} />
            </div>
            <div className="form-group">
              <label>Resource ID</label>
              <input value={form.resource_id} onChange={(e) => setField('resource_id', e.target.value)} />
            </div>
            <div className="form-group">
              <label>Delivery Date</label>
              <input type="date" value={form.delivery_date} onChange={(e) => setField('delivery_date', e.target.value)} />
            </div>
            <div className="form-group full-width">
              <label>Bid Payload (JSON)</label>
              <textarea
                rows={6}
                value={form.bid_payload_text}
                onChange={(e) => setField('bid_payload_text', e.target.value)}
              />
            </div>
          </div>
          <button className="btn ai" disabled={creating} onClick={handleCreate}>
            {creating ? 'Creating...' : 'Create Draft'}
          </button>
        </div>
      )}

      {submitState && (
        <div className="card" style={{ marginBottom: 16, background: submitState.ok ? '#1a3' : '#3a1a1a' }}>
          <strong>Submit attempt for bid #{submitState.id}:</strong>
          {submitState.ok
            ? <pre style={{ fontSize: 12 }}>{JSON.stringify(submitState.data, null, 2)}</pre>
            : <p style={{ marginTop: 8 }}>{submitState.error} <em>(expected — NEEDS-CREDS)</em></p>}
        </div>
      )}

      <div className="card">
        <h3 style={{ marginTop: 0 }}>Bid Drafts ({rows.length})</h3>
        {loading ? (
          <div className="empty-state">Loading...</div>
        ) : rows.length === 0 ? (
          <div className="empty-state">No bid drafts yet.</div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>ID</th><th>Bid ID</th><th>ISO</th><th>Market</th><th>Site</th>
                <th>Delivery Date</th><th>Status</th><th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id}>
                  <td>{r.id}</td>
                  <td><code>{r.bid_id}</code></td>
                  <td>{r.iso}</td>
                  <td>{r.market}</td>
                  <td>{r.site || '—'}</td>
                  <td>{r.delivery_date || '—'}</td>
                  <td>{r.status}</td>
                  <td>
                    {writer && r.status === 'draft' && (
                      <>
                        <button className="btn ai"        onClick={() => handleSubmit(r.id)} style={{ marginRight: 6 }}>Submit</button>
                        <button className="btn secondary" onClick={() => handleWithdraw(r.id)}>Withdraw</button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
