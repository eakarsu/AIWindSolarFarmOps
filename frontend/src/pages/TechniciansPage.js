import React from 'react';
import CrudPage from '../components/CrudPage';
import { techniciansApi } from '../services/api';

export default function TechniciansPage() {
  return (
    <CrudPage
      title="Technicians"
      subtitle="Field crews, certifications and availability."
      api={techniciansApi}
      statusKey="status"
      fields={[
        { key: 'tech_id',        label: 'Tech ID' },
        { key: 'name',           label: 'Name' },
        { key: 'certifications', label: 'Certifications' },
        { key: 'base',           label: 'Base' },
        { key: 'status',         label: 'Status', type: 'select', options: ['available','deployed','on_call','on_leave','off'] },
        { key: 'contact',        label: 'Contact' },
      ]}
    />
  );
}
