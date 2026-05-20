import React from 'react';
import AIPage from '../components/AIPage';
import { aiDraftWorkOrder } from '../services/api';

export default function AIDraftWorkOrderPage() {
  return (
    <AIPage
      title="AI · Draft Work Order"
      feature="draft-work-order"
      subtitle="Draft a complete work order from a natural-language intent."
      inputs={[
        { key: 'intent',   label: 'Intent',   type: 'textarea', placeholder: 'e.g. Replace pitch motor #2 on WTG-TX-027 due to recurring P0312 faults.' },
        { key: 'asset_id', label: 'Asset ID', placeholder: 'e.g. WTG-TX-027' },
      ]}
      run={(v) => aiDraftWorkOrder({ intent: v.intent, asset_id: v.asset_id })}
      buttonLabel="Draft Work Order"
    />
  );
}
