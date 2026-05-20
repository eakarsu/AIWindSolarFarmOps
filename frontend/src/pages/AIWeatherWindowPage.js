import React from 'react';
import AIPage from '../components/AIPage';
import { aiWeatherWindow } from '../services/api';

export default function AIWeatherWindowPage() {
  return (
    <AIPage
      title="AI · Weather Window"
      feature="weather-window"
      subtitle="Find safe weather windows for a planned maintenance activity."
      inputs={[
        { key: 'site',     label: 'Site' },
        { key: 'activity', label: 'Activity',           placeholder: 'e.g. Crane lift, blade rope-access, IV-curve testing' },
        { key: 'notes',    label: 'Constraints / Limits', type: 'textarea' },
      ]}
      run={(v) => aiWeatherWindow({ site: v.site, activity: v.activity, notes: v.notes })}
    />
  );
}
