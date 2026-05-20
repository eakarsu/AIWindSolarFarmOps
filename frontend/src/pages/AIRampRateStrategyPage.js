import React from 'react';
import AIPage from '../components/AIPage';
import { aiRampRateStrategy } from '../services/api';

export default function AIRampRateStrategyPage() {
  return (
    <AIPage
      title="AI · Ramp-Rate Strategy"
      feature="ramp-rate-strategy"
      subtitle="Recommend ramp-rate settings to satisfy grid code and avoid penalties."
      inputs={[
        { key: 'site',  label: 'Site' },
        { key: 'notes', label: 'Grid / Market Rules', type: 'textarea' },
      ]}
      run={(v) => aiRampRateStrategy({ site: v.site, notes: v.notes })}
    />
  );
}
