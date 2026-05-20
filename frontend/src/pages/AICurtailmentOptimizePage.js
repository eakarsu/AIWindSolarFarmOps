import React from 'react';
import AIPage from '../components/AIPage';
import { aiCurtailmentOptimize } from '../services/api';

export default function AICurtailmentOptimizePage() {
  return (
    <AIPage
      title="AI · Curtailment Optimize"
      feature="curtailment-optimize"
      subtitle="Recommend curtailment strategy to maximize revenue under grid + PPA constraints."
      inputs={[
        { key: 'site',  label: 'Site' },
        { key: 'notes', label: 'Grid / Market / PPA Notes', type: 'textarea' },
      ]}
      run={(v) => aiCurtailmentOptimize({ site: v.site, notes: v.notes })}
    />
  );
}
