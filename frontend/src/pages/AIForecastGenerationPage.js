import React from 'react';
import AIPage from '../components/AIPage';
import { aiForecastGeneration } from '../services/api';

export default function AIForecastGenerationPage() {
  return (
    <AIPage
      title="AI · Forecast Generation"
      feature="forecast-generation"
      subtitle="Hour-by-hour MWh generation forecast for a wind or solar site."
      inputs={[
        { key: 'site',          label: 'Site',          placeholder: 'e.g. Roscoe Wind Farm, TX' },
        { key: 'horizon_hours', label: 'Horizon (hrs)', type: 'number', defaultValue: 24 },
        { key: 'notes',         label: 'Weather / Operational Notes', type: 'textarea' },
      ]}
      run={(v) => aiForecastGeneration({ site: v.site, horizon_hours: v.horizon_hours, notes: v.notes })}
    />
  );
}
