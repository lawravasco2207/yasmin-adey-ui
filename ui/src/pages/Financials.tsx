// src/pages/Financials.tsx
import React from 'react';
import { mockFinancials } from '../data/mockData';

const Financials: React.FC = () => {
  return (
    <div className="futuristic-bg financials">
      <h1>Financials</h1>
      <ul>
        {mockFinancials.map((item) => (
          <li key={item.id}>
            {item.type}: ${item.amount} - {item.status}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Financials;