import React from 'react';
import AIPage from '../components/AIPage';
import { aiDroneBladeInspection } from '../services/api';

export default function AIDroneBladeInspectionPage() {
  return (
    <AIPage
      title="AI · Drone Blade Inspection Pipeline"
      feature="drone-blade-inspection"
      subtitle="AI summary endpoint for a drone blade-inspection pipeline run. Consumes image references / metadata (not bytes) and produces a defect inventory with severity + confidence."
      inputs={[
        { key: 'turbine_id',  label: 'Turbine ID',  placeholder: 'e.g. WTG-TX-027' },
        { key: 'image_count', label: 'Image Count', type: 'number', defaultValue: 36 },
        { key: 'notes',       label: 'Flight / Pipeline Notes', type: 'textarea' },
      ]}
      run={(v) => aiDroneBladeInspection({
        turbine_id: v.turbine_id,
        image_count: v.image_count,
        notes: v.notes,
      })}
    />
  );
}
