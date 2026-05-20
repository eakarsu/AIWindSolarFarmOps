import React from 'react';
import AIPage from '../components/AIPage';
import { aiExecutiveBrief } from '../services/api';

export default function AIExecutiveBriefPage() {
  return (
    <AIPage
      title="AI · Executive Brief"
      feature="executive-brief"
      subtitle="Daily operations brief across the renewable fleet."
      inputs={[
        { key: 'notes', label: 'Optional bias notes', type: 'textarea', placeholder: 'e.g. focus on wind fleet availability and PPA settlement risk.' },
      ]}
      run={(v) => aiExecutiveBrief({ notes: v.notes })}
      buttonLabel="Generate Brief"
    />
  );
}
