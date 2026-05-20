import React from 'react';
import AIPage from '../components/AIPage';
import { aiInverterClippingDetect } from '../services/api';

export default function AIInverterClippingPage() {
  return (
    <AIPage
      title="AI · Inverter Clipping Detect"
      feature="inverter-clipping-detect"
      subtitle="Detect inverter clipping and quantify lost energy."
      inputs={[
        { key: 'context', label: 'Context / Conditions', type: 'textarea' },
      ]}
      run={(v) => aiInverterClippingDetect({ context: v.context })}
    />
  );
}
