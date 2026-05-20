import React from 'react';
import AIPage from '../components/AIPage';
import { aiFleetHealth } from '../services/api';

export default function AIFleetHealthPage() {
  return (
    <AIPage
      title="AI · Fleet Health"
      feature="fleet-health"
      subtitle="Score the wind + solar fleet and call out worst-offender assets."
      inputs={[]}
      run={() => aiFleetHealth({})}
      buttonLabel="Run Fleet Analysis"
    />
  );
}
