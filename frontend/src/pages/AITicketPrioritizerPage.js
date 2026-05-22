import React from 'react';
import AIPage from '../components/AIPage';
import { aiTicketPrioritizer } from '../services/api';

export default function AITicketPrioritizerPage() {
  return (
    <AIPage
      title="AI · O&M Ticket Prioritizer"
      feature="ticket-prioritizer"
      subtitle="Score and rank open work orders by safety, revenue loss, warranty expiry, and lead time."
      inputs={[
        { key: 'context', label: 'Prioritization Context', type: 'textarea',
          placeholder: 'e.g. ERCOT LMP > $120/MWh forecast — bias revenue.' },
      ]}
      run={(v) => aiTicketPrioritizer({ context: v.context })}
    />
  );
}
