import React from 'react';
import AIPage from '../components/AIPage';
import { aiAssetDegTrend } from '../services/api';

export default function AIAssetDegTrendPage() {
  return (
    <AIPage
      title="AI · Asset Degradation Trend"
      feature="asset-deg-trend"
      subtitle="Quantify degradation trends (soiling, power-curve drift, SOH)."
      inputs={[
        { key: 'asset_id', label: 'Asset ID' },
        { key: 'metric',   label: 'Metric',   placeholder: 'e.g. soiling-loss-pct, pmax-degradation-pct-per-year' },
        { key: 'notes',    label: 'History / Context', type: 'textarea' },
      ]}
      run={(v) => aiAssetDegTrend({ asset_id: v.asset_id, metric: v.metric, notes: v.notes })}
    />
  );
}
