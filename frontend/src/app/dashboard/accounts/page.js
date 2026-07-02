'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import styles from './accounts.module.css';

const defaultAccounts = [
  {
    id: 'checking-1',
    type: 'Checking',
    name: 'Premier Checking',
    mask: '**** 8492',
    balance: '$45,230.00',
    equivalent: '≈ 185,443,000 KHR',
    status: 'Active',
    icon: 'checking'
  },
  {
    id: 'savings-1',
    type: 'Savings',
    name: 'High-Yield Savings',
    mask: '**** 1104',
    balance: '$128,500.50',
    equivalent: '≈ 526,852,050 KHR',
    status: 'Active',
    bgColor: '#FDECE4',
    iconColor: '#C44100',
    icon: 'savings'
  },
  {
    id: 'fixed-1',
    type: 'Fixed Deposit',
    name: '12-Month Fixed Deposit',
    mask: '**** 9921',
    balance: '$50,000.00',
    equivalent: '≈ 205,000,000 KHR',
    status: 'Active',
    maturity: 'Maturity: Oct 14, 2024',
    bgColor: '#E7E7F0',
    iconColor: '#434653',
    icon: 'fixed'
  }
];

const renderIcon = (type, color) => {
  if (type === 'checking' || type === 'Checking') {
    return (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color || "#00327D"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="6" width="20" height="12" rx="2"></rect>
        <circle cx="12" cy="12" r="2"></circle>
        <path d="M6 12h.01M18 12h.01"></path>
      </svg>
    );
  } else if (type === 'savings' || type === 'Savings') {
    return (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color || "#C44100"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M19 5h-2V3a1 1 0 0 0-1-1H8a1 1 0 0 0-1 1v2H5a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2zM8 4h8v1H8V4z"></path>
        <circle cx="12" cy="12" r="2"></circle>
      </svg>
    );
  } else {
    return (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color || "#434653"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
        <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
      </svg>
    );
  }
};

export default function MyAccounts() {
  const [accounts, setAccounts] = useState([]);

  useEffect(() => {
    let saved = JSON.parse(localStorage.getItem('user_accounts') || 'null');
    if (!saved) {
      saved = defaultAccounts;
      localStorage.setItem('user_accounts', JSON.stringify(saved));
    }
    setAccounts(saved);
  }, []);

  return (
    <div className={styles.pageContainer}>
      
      <div className={styles.headerContainer}>
        <div className={styles.headerText}>
          <h1 className={styles.heading}>My Accounts</h1>
          <p className={styles.subText}>Manage your balances and view account details.</p>
        </div>
        <div className={styles.headerActions}>
          <Link href="/dashboard/accounts/new" className={styles.primaryBtn}>
            <svg className={styles.iconSpacing} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
            Open New Account
          </Link>
        </div>
      </div>

      <div className={styles.accountsGrid}>
        {accounts.map(acc => (
          <Link href={`/dashboard/accounts/${acc.id}`} key={acc.id} className={styles.accountCard}>
            <div className={styles.cardTop}>
              <div className={styles.cardTitleArea}>
                <div className={styles.cardIconBox} style={acc.bgColor ? {background: acc.bgColor} : {}}>
                  {renderIcon(acc.icon || acc.type, acc.iconColor)}
                </div>
                <div className={styles.cardTitleText}>
                  <span className={styles.cardTitle}>{acc.name}</span>
                  <span className={styles.cardMask}>{acc.mask}</span>
                </div>
              </div>
              <div className={styles.activeBadge}>
                <svg className={styles.activeBadgeIcon} width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
                {acc.status}
              </div>
            </div>

            <div className={styles.cardMiddle}>
              <span className={styles.balanceLabel}>AVAILABLE BALANCE</span>
              <div style={{display: 'flex', alignItems: 'baseline'}}>
                <span className={styles.balanceValue}>{acc.balance}</span>
                <span className={styles.balanceCurrency}>USD</span>
              </div>
              <span className={styles.balanceEquivalent}>{acc.equivalent}</span>
            </div>

            <div className={styles.cardBottom}>
              <div>
                {acc.maturity && <span className={styles.maturityText}>| {acc.maturity}</span>}
              </div>
              <div className={styles.cardActions}>
                <div className={styles.actionIconLink}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                    <polyline points="7 10 12 15 17 10"></polyline>
                    <line x1="12" y1="15" x2="12" y2="3"></line>
                  </svg>
                </div>
                <div className={styles.actionIconLink}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                    <circle cx="12" cy="12" r="3"></circle>
                  </svg>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
