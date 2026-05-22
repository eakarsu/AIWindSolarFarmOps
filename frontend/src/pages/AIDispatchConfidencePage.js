import React, { useState } from 'react';
import { dispatchConfidenceScore } from '../services/api';

export default function AIDispatchConfidencePage() {
  const [payload, setPayload] = useState('{"site":"High Plains Hybrid","forecast_mwh":860,"committed_mwh":790,"curtailment_risk_pct":18,"faulted_assets":2}');
  const [result, setResult] = useState(null);
  const run = async () => setResult(await dispatchConfidenceScore(JSON.parse(payload || '{}')));
  return <div className="page"><div className="page-header"><h2>AI Dispatch Confidence</h2><button className="btn primary" onClick={run}>Score Dispatch</button></div><div className="card"><textarea rows={8} value={payload} onChange={(e) => setPayload(e.target.value)} /></div>{result && <pre className="card">{JSON.stringify(result, null, 2)}</pre>}</div>;
}
