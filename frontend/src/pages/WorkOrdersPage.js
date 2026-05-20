import React from 'react';
import CrudPage from '../components/CrudPage';
import { workOrdersApi } from '../services/api';

export default function WorkOrdersPage() {
  return (
    <CrudPage
      title="Work Orders"
      subtitle="Open, scheduled and in-progress work."
      api={workOrdersApi}
      statusKey="status"
      fields={[
        { key: 'wo_id',     label: 'WO ID' },
        { key: 'asset_id',  label: 'Asset ID' },
        { key: 'type',      label: 'Type' },
        { key: 'priority',  label: 'Priority', type: 'select', options: ['low','normal','high','critical'] },
        { key: 'assignee',  label: 'Assignee' },
        { key: 'status',    label: 'Status',   type: 'select', options: ['open','scheduled','in_progress','closed','cancelled'] },
      ]}
    />
  );
}
