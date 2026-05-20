import React from 'react';
import CrudPage from '../components/CrudPage';
import { performanceKpisApi } from '../services/api';

export default function PerformanceKpisPage() {
  return (
    <CrudPage
      title="Performance KPIs"
      subtitle="Availability / capacity factor / PR by site and period."
      api={performanceKpisApi}
      fields={[
        { key: 'kpi_id', label: 'KPI ID' },
        { key: 'site',   label: 'Site' },
        { key: 'kpi',    label: 'KPI' },
        { key: 'value',  label: 'Value',  type: 'number' },
        { key: 'period', label: 'Period' },
        { key: 'target', label: 'Target', type: 'number' },
      ]}
    />
  );
}
