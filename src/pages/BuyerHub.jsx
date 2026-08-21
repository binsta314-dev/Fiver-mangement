import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { UserCheck, Wallet, Mail } from 'lucide-react';
import Buyers from './Buyers';
import PayPal from './PayPal';
import Emails from './Emails';

function BuyerHub() {
  const [searchParams, setSearchParams] = useSearchParams();
  const currentTab = searchParams.get('tab') || 'buyers';

  const setTab = (tabName) => {
    setSearchParams({ tab: tabName });
  };

  const tabs = [
    { id: 'buyers', label: 'Buyer Profiles', icon: <UserCheck size={18} /> },
    { id: 'paypal', label: 'PayPal Accounts', icon: <Wallet size={18} /> },
    { id: 'emails', label: 'Email Accounts', icon: <Mail size={18} /> },
  ];

  return (
    <div>
      {/* Top Tab Bar */}
      <div
        className="card"
        style={{
          display: 'flex',
          gap: '12px',
          padding: '12px 15px',
          marginBottom: '25px',
          backgroundColor: 'var(--fiverr-white)',
          flexWrap: 'wrap'
        }}
      >
        {tabs.map((t) => {
          const isActive = currentTab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 20px',
                borderRadius: '6px',
                border: 'none',
                cursor: 'pointer',
                fontWeight: '600',
                fontSize: '14px',
                transition: 'all 0.2s',
                backgroundColor: isActive ? 'var(--fiverr-green)' : '#f0f2f5',
                color: isActive ? '#ffffff' : 'var(--fiverr-dark)'
              }}
            >
              {t.icon}
              {t.label}
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      <div>
        {currentTab === 'buyers' && <Buyers />}
        {currentTab === 'paypal' && <PayPal />}
        {currentTab === 'emails' && <Emails />}
      </div>
    </div>
  );
}

export default BuyerHub;
