import React from 'react';
import AIPage from '../components/AIPage';
import { aiIntradayForecast } from '../services/api';

export default function AIIntradayForecastPage() {
  return (
    <AIPage
      title="AI · Intraday Forecast"
      feature="intraday-forecast"
      subtitle="Short-horizon, 15-minute resolution nowcast — distinct from the day-ahead generation forecaster."
      inputs={[
        { key: 'site',          label: 'Site',          placeholder: 'e.g. Roscoe Wind Farm, TX' },
        { key: 'horizon_hours', label: 'Horizon (hrs)', type: 'number', defaultValue: 6 },
        { key: 'notes',         label: 'Nowcast / Ramp Context', type: 'textarea' },
      ]}
      run={(v) => aiIntradayForecast({ site: v.site, horizon_hours: v.horizon_hours, notes: v.notes })}
    />
  );
}
