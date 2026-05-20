import React from 'react';
import TurbineMap from '../components/TurbineMap';
import GenerationCurve from '../components/GenerationCurve';

export default function CustomViewsPage() {
  return (
    <div>
      <div className="page-header">
        <div>
          <h2>Custom Views</h2>
          <p>Geospatial fleet view and short-horizon generation forecast.</p>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        <TurbineMap />
        <GenerationCurve />
      </div>
    </div>
  );
}
