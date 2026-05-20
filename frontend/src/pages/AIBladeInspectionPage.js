import React from 'react';
import AIPage from '../components/AIPage';
import { aiBladeInspectionSummary } from '../services/api';

export default function AIBladeInspectionPage() {
  return (
    <AIPage
      title="AI · Blade Inspection Summary"
      feature="blade-inspection-summary"
      subtitle="Summarize a turbine blade inspection (drone imagery / rope access report)."
      inputs={[
        { key: 'turbine_id', label: 'Turbine ID', placeholder: 'e.g. WTG-TX-027' },
        { key: 'notes',      label: 'Inspection Findings', type: 'textarea' },
      ]}
      run={(v) => aiBladeInspectionSummary({ turbine_id: v.turbine_id, notes: v.notes })}
    />
  );
}
