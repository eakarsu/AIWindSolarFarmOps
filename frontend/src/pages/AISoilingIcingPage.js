import React from 'react';
import AIPage from '../components/AIPage';
import { aiSoilingIcingDetect } from '../services/api';

export default function AISoilingIcingPage() {
  return (
    <AIPage
      title="AI · Soiling / Icing Detector"
      feature="soiling-icing-detect"
      subtitle="Text-only soiling (solar) and icing (wind) detector from production deviation and weather signature — no image processing."
      inputs={[
        { key: 'site',  label: 'Site',  placeholder: 'e.g. Topaz Solar Farm, CA' },
        { key: 'notes', label: 'Production / Weather Observations', type: 'textarea' },
      ]}
      run={(v) => aiSoilingIcingDetect({ site: v.site, notes: v.notes })}
    />
  );
}
