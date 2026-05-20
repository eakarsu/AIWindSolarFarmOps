import React from 'react';
import CrudPage from '../components/CrudPage';
import { maintenanceLogsApi } from '../services/api';

export default function MaintenanceLogsPage() {
  return (
    <CrudPage
      title="Maintenance Logs"
      subtitle="Completed maintenance activities."
      api={maintenanceLogsApi}
      fields={[
        { key: 'log_id',       label: 'Log ID' },
        { key: 'asset_id',     label: 'Asset ID' },
        { key: 'work',         label: 'Work',        type: 'textarea' },
        { key: 'technician',   label: 'Technician' },
        { key: 'hours_spent',  label: 'Hours Spent', type: 'number' },
        { key: 'completed_at', label: 'Completed',   type: 'datetime-local' },
      ]}
    />
  );
}
