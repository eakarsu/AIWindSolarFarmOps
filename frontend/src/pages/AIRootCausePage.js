import React from 'react';
import AIPage from '../components/AIPage';
import { aiRootCauseAnalyzer } from '../services/api';

export default function AIRootCausePage() {
  return (
    <AIPage
      title="AI · Root Cause Analyzer"
      feature="root-cause-analyzer"
      subtitle="Structured RCA with 5-whys and corrective actions."
      inputs={[
        { key: 'incident', label: 'Incident', type: 'textarea', placeholder: 'e.g. WTG-IA-014 unplanned shutdown 14 hours on 2025-05-12' },
        { key: 'notes',    label: 'Evidence / Context', type: 'textarea' },
      ]}
      run={(v) => aiRootCauseAnalyzer({ incident: v.incident, notes: v.notes })}
      buttonLabel="Run RCA"
    />
  );
}
