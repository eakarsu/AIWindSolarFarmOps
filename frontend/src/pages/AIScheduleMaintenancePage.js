import React from 'react';
import AIPage from '../components/AIPage';
import { aiScheduleMaintenance } from '../services/api';

export default function AIScheduleMaintenancePage() {
  return (
    <AIPage
      title="AI · Schedule Maintenance"
      feature="schedule-maintenance"
      subtitle="Optimize maintenance schedule across crews, weather windows and lost revenue."
      inputs={[
        { key: 'window', label: 'Planning Window', placeholder: 'e.g. next 7 days' },
        { key: 'notes',  label: 'Constraints / Notes', type: 'textarea' },
      ]}
      run={(v) => aiScheduleMaintenance({ window: v.window, notes: v.notes })}
    />
  );
}
