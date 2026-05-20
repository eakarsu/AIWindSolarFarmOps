import React from 'react';
import AIPage from '../components/AIPage';
import { aiFaultPrognostic } from '../services/api';

export default function AIFaultPrognosticPage() {
  return (
    <AIPage
      title="AI · Fault Prognostic"
      feature="fault-prognostic"
      subtitle="Predict probable component failure from sensor + fault history."
      inputs={[
        { key: 'asset_id',     label: 'Asset ID',     placeholder: 'e.g. WTG-IA-014 or INV-CA-105' },
        { key: 'sensor_notes', label: 'Sensor Notes', type: 'textarea', placeholder: 'Vibration, oil, temperature, DGA trends, etc.' },
      ]}
      run={(v) => aiFaultPrognostic({ asset_id: v.asset_id, sensor_notes: v.sensor_notes })}
    />
  );
}
