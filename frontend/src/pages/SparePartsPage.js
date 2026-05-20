import React from 'react';
import CrudPage from '../components/CrudPage';
import { sparePartsApi } from '../services/api';

export default function SparePartsPage() {
  return (
    <CrudPage
      title="Spare Parts"
      subtitle="Warehouse inventory of consumables and majors."
      api={sparePartsApi}
      fields={[
        { key: 'part_id',       label: 'Part ID' },
        { key: 'sku',           label: 'SKU' },
        { key: 'description',   label: 'Description',     type: 'textarea' },
        { key: 'qty_on_hand',   label: 'Qty On Hand',     type: 'number' },
        { key: 'location',      label: 'Location' },
        { key: 'reorder_point', label: 'Reorder Point',   type: 'number' },
      ]}
    />
  );
}
