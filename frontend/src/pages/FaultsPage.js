import React from 'react';
import CrudPage from '../components/CrudPage';
import { faultsApi } from '../services/api';

export default function FaultsPage() {
  return (
    <CrudPage
      title="Faults"
      subtitle="Open and acknowledged faults across assets."
      api={faultsApi}
      statusKey="status"
      fields={[
        { key: 'fault_id',   label: 'Fault ID' },
        { key: 'asset_id',   label: 'Asset ID' },
        { key: 'code',       label: 'Code' },
        { key: 'severity',   label: 'Severity', type: 'select', options: ['low','medium','high','critical'] },
        { key: 'opened_at',  label: 'Opened',   type: 'datetime-local' },
        { key: 'status',     label: 'Status',   type: 'select', options: ['open','acknowledged','in_progress','closed'] },
      ]}
    />
  );
}
