import React from 'react';
import AIPage from '../components/AIPage';
import { aiVendorWarrantyClaim } from '../services/api';

export default function AIVendorWarrantyPage() {
  return (
    <AIPage
      title="AI · Vendor Warranty Claim"
      feature="vendor-warranty-claim"
      subtitle="Draft a vendor warranty claim package."
      inputs={[
        { key: 'asset_id', label: 'Asset ID' },
        { key: 'vendor',   label: 'Vendor' },
        { key: 'notes',    label: 'Fault / Evidence Notes', type: 'textarea' },
      ]}
      run={(v) => aiVendorWarrantyClaim({ asset_id: v.asset_id, vendor: v.vendor, notes: v.notes })}
      buttonLabel="Draft Claim"
    />
  );
}
