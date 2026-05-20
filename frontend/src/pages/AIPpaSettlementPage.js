import React from 'react';
import AIPage from '../components/AIPage';
import { aiPpaSettlement } from '../services/api';

export default function AIPpaSettlementPage() {
  return (
    <AIPage
      title="AI · PPA Settlement"
      feature="ppa-settlement"
      subtitle="Settle a PPA period: delivered energy, payable, deviation vs floor/ceiling."
      inputs={[
        { key: 'ppa_id', label: 'PPA ID',  placeholder: 'e.g. PPA-2025-014' },
        { key: 'period', label: 'Period',  placeholder: 'e.g. 2025-Q2 or 2025-05' },
        { key: 'notes',  label: 'Delivery / Curtailment Notes', type: 'textarea' },
      ]}
      run={(v) => aiPpaSettlement({ ppa_id: v.ppa_id, period: v.period, notes: v.notes })}
      buttonLabel="Compute Settlement"
    />
  );
}
