import React from 'react';
import CrudPage from '../components/CrudPage';
import { turbinesApi } from '../services/api';

export default function TurbinesPage() {
  return (
    <CrudPage
      title="Turbines"
      subtitle="Wind turbine generators across the fleet."
      api={turbinesApi}
      statusKey="status"
      fields={[
        { key: 'turbine_id',  label: 'Turbine ID' },
        { key: 'site',        label: 'Site' },
        { key: 'vendor',      label: 'Vendor' },
        { key: 'model',       label: 'Model' },
        { key: 'capacity_mw', label: 'Capacity (MW)', type: 'number' },
        { key: 'status',      label: 'Status',        type: 'select', options: ['operational','derated','maintenance','down','commissioning'] },
      ]}
    />
  );
}
