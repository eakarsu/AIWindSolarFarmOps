import React from 'react';
import CrudPage from '../components/CrudPage';
import { ppaContractsApi } from '../services/api';

export default function PpaContractsPage() {
  return (
    <CrudPage
      title="PPA Contracts"
      subtitle="Power purchase agreements and offtake contracts."
      api={ppaContractsApi}
      statusKey="status"
      fields={[
        { key: 'ppa_id',         label: 'PPA ID' },
        { key: 'counterparty',   label: 'Counterparty' },
        { key: 'term_years',     label: 'Term (yrs)',    type: 'number' },
        { key: 'price_per_mwh',  label: 'Price ($/MWh)', type: 'number' },
        { key: 'start_date',     label: 'Start Date',    type: 'date' },
        { key: 'status',         label: 'Status', type: 'select', options: ['active','pending','expired','terminated'] },
      ]}
    />
  );
}
