import React from 'react';
import AIPage from '../components/AIPage';
import { aiTurbineAvailability } from '../services/api';

export default function AITurbineAvailabilityPage() {
  return (
    <AIPage
      title="AI · Turbine Availability"
      feature="turbine-availability"
      subtitle="Compute fleet availability per IEC 61400-26 and identify gaps."
      inputs={[
        { key: 'window', label: 'Window', placeholder: 'e.g. last 30 days, YTD 2025' },
        { key: 'notes',  label: 'Notes / Segmentation', type: 'textarea' },
      ]}
      run={(v) => aiTurbineAvailability({ window: v.window, notes: v.notes })}
    />
  );
}
