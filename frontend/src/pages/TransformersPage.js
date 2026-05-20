import React from 'react';
import CrudPage from '../components/CrudPage';
import { transformersApi } from '../services/api';

export default function TransformersPage() {
  return (
    <CrudPage
      title="Transformers"
      subtitle="Power transformers and substation assets."
      api={transformersApi}
      statusKey="status"
      fields={[
        { key: 'xfmr_id',          label: 'Transformer ID' },
        { key: 'site',             label: 'Site' },
        { key: 'voltage_kv',       label: 'Voltage (kV)', type: 'number' },
        { key: 'status',           label: 'Status', type: 'select', options: ['operational','derated','fault','out_of_service'] },
        { key: 'last_inspection',  label: 'Last Inspection', type: 'date' },
        { key: 'manufacturer',     label: 'Manufacturer' },
      ]}
    />
  );
}
