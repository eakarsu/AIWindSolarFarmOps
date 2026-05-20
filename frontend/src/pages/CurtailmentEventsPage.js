import React from 'react';
import CrudPage from '../components/CrudPage';
import { curtailmentEventsApi } from '../services/api';

export default function CurtailmentEventsPage() {
  return (
    <CrudPage
      title="Curtailment Events"
      subtitle="Grid-driven and economic curtailments by site."
      api={curtailmentEventsApi}
      fields={[
        { key: 'event_id',     label: 'Event ID' },
        { key: 'site',         label: 'Site' },
        { key: 'reason',       label: 'Reason' },
        { key: 'mw_curtailed', label: 'MW Curtailed', type: 'number' },
        { key: 'start_at',     label: 'Start',        type: 'datetime-local' },
        { key: 'end_at',       label: 'End',          type: 'datetime-local' },
      ]}
    />
  );
}
