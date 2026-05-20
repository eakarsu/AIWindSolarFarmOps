import React from 'react';
import CrudPage from '../components/CrudPage';
import { sensorStreamsApi } from '../services/api';

export default function SensorStreamsPage() {
  return (
    <CrudPage
      title="Sensor Streams"
      subtitle="Live sensor channels per asset."
      api={sensorStreamsApi}
      fields={[
        { key: 'stream_id',  label: 'Stream ID' },
        { key: 'asset_id',   label: 'Asset ID' },
        { key: 'sensor',     label: 'Sensor' },
        { key: 'units',      label: 'Units' },
        { key: 'last_value', label: 'Last Value', type: 'number' },
        { key: 'last_ts',    label: 'Last TS',    type: 'datetime-local' },
      ]}
    />
  );
}
