import React from 'react';
import CrudPage from '../components/CrudPage';
import { metMastsApi } from '../services/api';

export default function MetMastsPage() {
  return (
    <CrudPage
      title="Met Masts"
      subtitle="Meteorological masts and resource sensors."
      api={metMastsApi}
      statusKey="status"
      fields={[
        { key: 'mast_id',          label: 'Mast ID' },
        { key: 'site',             label: 'Site' },
        { key: 'height_m',         label: 'Height (m)', type: 'number' },
        { key: 'instruments',      label: 'Instruments', type: 'textarea' },
        { key: 'status',           label: 'Status', type: 'select', options: ['operational','fault','maintenance'] },
        { key: 'last_calibration', label: 'Last Calibration', type: 'date' },
      ]}
    />
  );
}
