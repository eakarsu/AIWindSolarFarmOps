import React, { useEffect, useState } from 'react';
import { workOrderFsmApi, workOrdersApi, canWrite } from '../services/api';

export default function WorkOrderStateMachinePage() {
  const [states, setStates] = useState(null);
  const [woList, setWoList] = useState([]);
  const [selectedWo, setSelectedWo] = useState(null);
  const [history, setHistory] = useState([]);
  const [targetState, setTargetState] = useState('');
  const [reason, setReason] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const [info, setInfo] = useState(null);

  const writer = canWrite();

  const loadStates = async () => {
    try { setStates(await workOrderFsmApi.states()); }
    catch (e) { setError(e.message); }
  };

  const loadWos = async () => {
    try {
      const list = await workOrdersApi.list();
      setWoList(Array.isArray(list) ? list : []);
    } catch (e) { setError(e.message); }
  };

  const loadHistory = async (wo_id) => {
    if (!wo_id) { setHistory([]); return; }
    try {
      const h = await workOrderFsmApi.history(wo_id);
      setHistory(Array.isArray(h) ? h : []);
    } catch (e) { setError(e.message); }
  };

  useEffect(() => { loadStates(); loadWos(); }, []);

  useEffect(() => {
    if (selectedWo?.wo_id) loadHistory(selectedWo.wo_id);
  }, [selectedWo?.wo_id]);

  const allowedNext = (() => {
    if (!selectedWo || !states) return [];
    return states.transitions[(selectedWo.status || 'open').toLowerCase()] || [];
  })();

  const handleTransition = async () => {
    if (!selectedWo || !targetState) return;
    setBusy(true); setError(null); setInfo(null);
    try {
      const r = await workOrderFsmApi.transition(selectedWo.wo_id, targetState, reason);
      setInfo(`Transitioned ${r.from} → ${r.to}`);
      setSelectedWo(r.work_order);
      setReason(''); setTargetState('');
      await loadHistory(selectedWo.wo_id);
      await loadWos();
    } catch (e) {
      setError(e.message);
    } finally { setBusy(false); }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h2>Work Order State Machine</h2>
          <p>Canonical FSM: <code>open → triaged → scheduled → in_progress → done → closed</code>, with <code>blocked</code>, <code>cancelled</code> branches. Reopen from <code>done</code>.</p>
        </div>
      </div>

      {error && <div className="ai-error">{error}</div>}
      {info  && <div className="card" style={{ background: '#1a3', color: '#fff', marginBottom: 12 }}>{info}</div>}

      {states && (
        <div className="card" style={{ marginBottom: 16 }}>
          <h3 style={{ marginTop: 0 }}>States &amp; Allowed Transitions</h3>
          <table className="data-table">
            <thead><tr><th>State</th><th>Allowed → next</th></tr></thead>
            <tbody>
              {Object.entries(states.transitions).map(([s, allowed]) => (
                <tr key={s}><td><code>{s}</code></td><td>{allowed.length ? allowed.join(', ') : <em>terminal</em>}</td></tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="card" style={{ marginBottom: 16 }}>
        <h3 style={{ marginTop: 0 }}>Pick a Work Order</h3>
        <table className="data-table">
          <thead>
            <tr><th>WO ID</th><th>Asset</th><th>Type</th><th>Priority</th><th>Status</th><th></th></tr>
          </thead>
          <tbody>
            {woList.slice(0, 30).map((w) => (
              <tr key={w.id} style={{ background: selectedWo?.id === w.id ? '#1a2940' : undefined }}>
                <td><code>{w.wo_id}</code></td>
                <td>{w.asset_id}</td>
                <td>{w.type}</td>
                <td>{w.priority}</td>
                <td><strong>{w.status}</strong></td>
                <td><button className="btn secondary" onClick={() => setSelectedWo(w)}>Select</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selectedWo && (
        <div className="card" style={{ marginBottom: 16 }}>
          <h3 style={{ marginTop: 0 }}>{selectedWo.wo_id} — current state: <code>{selectedWo.status}</code></h3>
          {writer ? (
            <div className="form-grid">
              <div className="form-group">
                <label>Transition to</label>
                <select value={targetState} onChange={(e) => setTargetState(e.target.value)}>
                  <option value="">— pick allowed next —</option>
                  {allowedNext.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div className="form-group full-width">
                <label>Reason</label>
                <textarea value={reason} onChange={(e) => setReason(e.target.value)} />
              </div>
            </div>
          ) : (
            <p><em>Read-only role — transitions disabled.</em></p>
          )}
          {writer && (
            <button
              className="btn ai"
              disabled={busy || !targetState}
              onClick={handleTransition}
            >
              {busy ? 'Working...' : 'Apply Transition'}
            </button>
          )}
          <h4 style={{ marginTop: 18 }}>History</h4>
          {history.length === 0 ? (
            <div className="empty-state">No transitions yet.</div>
          ) : (
            <table className="data-table">
              <thead><tr><th>When</th><th>From</th><th>To</th><th>Actor</th><th>Reason</th></tr></thead>
              <tbody>
                {history.map((h) => (
                  <tr key={h.id}>
                    <td>{h.created_at ? new Date(h.created_at).toLocaleString() : ''}</td>
                    <td>{h.from_state}</td>
                    <td><strong>{h.to_state}</strong></td>
                    <td>{h.actor}</td>
                    <td>{h.reason || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}
