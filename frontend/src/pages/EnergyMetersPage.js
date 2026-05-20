import React from 'react';
import CrudPage from '../components/CrudPage';
import { energyMetersApi } from '../services/api';

export default function EnergyMetersPage() {
  return (
    <CrudPage
      title="Energy Meters"
      subtitle="Revenue meters by site."
      api={energyMetersApi}
      statusKey="status"
      fields={[
        { key: 'meter_id',    label: 'Meter ID' },
        { key: 'site',        label: 'Site' },
        { key: 'reading_kwh', label: 'Reading (kWh)', type: 'number' },
        { key: 'reading_at',  label: 'Reading At',    type: 'datetime-local' },
        { key: 'status',      label: 'Status',        type: 'select', options: ['ok','warn','fault'] },
        { key: 'comm_status', label: 'Comm Status',   type: 'select', options: ['online','offline','intermittent'] },
      ]}
    />
  );
}
