import React from 'react';
import CrudPage from '../components/CrudPage';
import { panelsApi } from '../services/api';

export default function PanelsPage() {
  return (
    <CrudPage
      title="Panels"
      subtitle="PV panel arrays."
      api={panelsApi}
      statusKey="status"
      fields={[
        { key: 'panel_id',   label: 'Panel ID' },
        { key: 'array_name', label: 'Array' },
        { key: 'model',      label: 'Model' },
        { key: 'tilt_deg',   label: 'Tilt (deg)',    type: 'number' },
        { key: 'azimuth',    label: 'Azimuth (deg)', type: 'number' },
        { key: 'status',     label: 'Status', type: 'select', options: ['operational','soiled','damaged','offline'] },
      ]}
    />
  );
}
