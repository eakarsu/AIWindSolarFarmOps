import React from 'react';
import AIPage from '../components/AIPage';
import { aiPpaShortfallNarrator } from '../services/api';

export default function AIPpaShortfallPage() {
  return (
    <AIPage
      title="AI · PPA Shortfall Narrator"
      feature="ppa-shortfall-narrator"
      subtitle="Attribute a PPA delivery shortfall across weather, curtailment, forced outage, soiling/icing, and grid causes — and draft counterparty communication."
      inputs={[
        { key: 'ppa_id', label: 'PPA ID',     placeholder: 'e.g. PPA-2024-008' },
        { key: 'period', label: 'Period',     placeholder: 'e.g. 2025-05 or 2025-Q2' },
        { key: 'notes',  label: 'Shortfall Context', type: 'textarea' },
      ]}
      run={(v) => aiPpaShortfallNarrator({ ppa_id: v.ppa_id, period: v.period, notes: v.notes })}
    />
  );
}
