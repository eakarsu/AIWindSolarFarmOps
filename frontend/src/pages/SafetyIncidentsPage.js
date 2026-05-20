import React from 'react';
import CrudPage from '../components/CrudPage';
import { safetyIncidentsApi } from '../services/api';

export default function SafetyIncidentsPage() {
  return (
    <CrudPage
      title="Safety Incidents"
      subtitle="HSE incidents and near-misses across sites."
      api={safetyIncidentsApi}
      statusKey="status"
      fields={[
        { key: 'incident_id', label: 'Incident ID' },
        { key: 'site',        label: 'Site' },
        { key: 'type',        label: 'Type' },
        { key: 'severity',    label: 'Severity', type: 'select', options: ['low','medium','high','critical'] },
        { key: 'opened_at',   label: 'Opened',   type: 'datetime-local' },
        { key: 'status',      label: 'Status',   type: 'select', options: ['open','in_progress','closed'] },
      ]}
    />
  );
}
