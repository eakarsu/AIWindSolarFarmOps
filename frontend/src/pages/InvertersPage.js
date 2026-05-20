import React from 'react';
import CrudPage from '../components/CrudPage';
import { invertersApi } from '../services/api';

export default function InvertersPage() {
  return (
    <CrudPage
      title="Inverters"
      subtitle="Solar PV inverters by site."
      api={invertersApi}
      statusKey="status"
      fields={[
        { key: 'inverter_id', label: 'Inverter ID' },
        { key: 'site',        label: 'Site' },
        { key: 'vendor',      label: 'Vendor' },
        { key: 'model',       label: 'Model' },
        { key: 'status',      label: 'Status', type: 'select', options: ['operational','derated','fault','down'] },
        { key: 'last_event',  label: 'Last Event' },
      ]}
    />
  );
}
