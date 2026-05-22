import React from 'react';
import AIPage from '../components/AIPage';
import { aiHybridStorageCoOpt } from '../services/api';

export default function AIHybridStoragePage() {
  return (
    <AIPage
      title="AI · Hybrid Storage Co-Optimizer"
      feature="hybrid-storage-co-opt"
      subtitle="Co-optimize hybrid renewable + battery dispatch for energy + ancillary revenue under grid constraints."
      inputs={[
        { key: 'site',  label: 'Hybrid Site', placeholder: 'e.g. Roscoe Hybrid Site, TX' },
        { key: 'notes', label: 'Market / Battery / PPA Context', type: 'textarea' },
      ]}
      run={(v) => aiHybridStorageCoOpt({ site: v.site, notes: v.notes })}
    />
  );
}
