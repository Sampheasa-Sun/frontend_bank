'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import styles from './dashboard.module.css';
import { MOCK_TRANSACTIONS, generateTransactions } from './transactions/mockData';

function parseAmount(str) {
  return Math.abs(parseFloat(str.replace(/[^0-9.]/g, '')));
}

export default function Dashboard() {
  const [defaultAccount, setDefaultAccount] = useState(null);
  const [accounts, setAccounts] = useState([]);
  const [recentTrx, setRecentTrx] = useState([]);
  const [monthSpend, setMonthSpend] = useState(0);
  const [monthIncome, setMonthIncome] = useState(0);

  useEffect(() => {
    // Load accounts
    let saved = JSON.parse(localStorage.getItem('user_accounts') || 'null');
    if (!saved || saved.length === 0) {
      saved = [
        { id: 'checking-1', name: 'Premier Checking', type: 'Checking', balance: '$45,230.00', accountNumber: '••••4821' },
        { id: 'savings-1',  name: 'High-Yield Savings', type: 'Savings', balance: '$12,850.00', accountNumber: '••••2934' },
      ];
    }
    setAccounts(saved);

    const defaultId = localStorage.getItem('default_account_id');
    const acc = saved.find(a => a.id === defaultId) || saved[0];
    setDefaultAccount(acc);

    // Load transactions
    const stored = JSON.parse(localStorage.getItem('user_transactions') || '[]');
    const generated = generateTransactions(100);
    const all = [...stored, ...MOCK_TRANSACTIONS, ...generated];
    setRecentTrx(all.slice(0, 5));

    // This month spend vs income
    const now = new Date();
    const thisMonth = now.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
    const thisMonthTrx = all.filter(t => {
      const d = new Date(t.date);
      return d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) === thisMonth;
    });
    const spend  = thisMonthTrx.filter(t => t.type === 'negative').reduce((s, t) => s + parseAmount(t.amount), 0);
    const income = thisMonthTrx.filter(t => t.type === 'positive').reduce((s, t) => s + parseAmount(t.amount), 0);
    setMonthSpend(spend);
    setMonthIncome(income);
  }, []);

  const getIcon = (iconType) => {
    if (iconType === 'refund') return (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
        <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
      </svg>
    );
    if (iconType === 'dining') return (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M18 8h1a4 4 0 0 1 0 8h-1"></path>
        <path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"></path>
        <line x1="6" y1="1" x2="6" y2="4"></line>
        <line x1="10" y1="1" x2="10" y2="4"></line>
        <line x1="14" y1="1" x2="14" y2="4"></line>
      </svg>
    );
    return (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
        <line x1="3" y1="6" x2="21" y2="6"></line>
        <path d="M16 10a4 4 0 0 1-8 0"></path>
      </svg>
    );
  };

  return (
    <div className={styles.pageContainer}>

      <div className={styles.headerContainer}>
        <h1 className={styles.heading}>Dashboard Overview</h1>
        <p className={styles.subText}>Welcome back. Here is a summary of your financial status.</p>
      </div>

      <div className={styles.mainLayout}>
        <div className={styles.leftColumn}>

          {/* Balance Card */}
          <div className={styles.balanceCard}>
            <div className={styles.balanceTop}>
              <div className={styles.balanceInfo}>
                <span className={styles.defaultAccountLabel}>
                  {defaultAccount ? defaultAccount.name.toUpperCase() : 'DEFAULT ACCOUNT'}
                </span>
                <span className={styles.balanceAmount}>
                  {defaultAccount ? defaultAccount.balance : '$0.00'}
                </span>
              </div>
              <div className={styles.walletIcon}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 12V8H6a2 2 0 0 1-2-2c0-1.1.9-2 2-2h12v4"></path>
                  <path d="M4 6v12c0 1.1.9 2 2 2h14v-4"></path>
                  <path d="M18 12a2 2 0 0 0-2 2c0 1.1.9 2 2 2h4v-4h-4z"></path>
                </svg>
              </div>
            </div>
            <div className={styles.balanceBottom}>
              <div className={styles.statGroup}>
                <span className={styles.statLabel}>Monthly Income</span>
                <span className={styles.statValue}>+${monthIncome.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
              </div>
              <div className={styles.statGroupDivider}>
                <span className={styles.statLabel}>Monthly Spend</span>
                <span className={styles.statValue}>-${monthSpend.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
              </div>
            </div>
          </div>

          {/* My Accounts Summary */}
          <div className={styles.sectionCard}>
            <div className={styles.sectionHeader}>
              <h3 className={styles.sectionTitle}>My Accounts</h3>
              <Link href="/dashboard/accounts" className={styles.sectionLink}>View All</Link>
            </div>
            <div className={styles.accountsList}>
              {accounts.slice(0, 3).map(acc => (
                <div key={acc.id} className={styles.accountRow}>
                  <div className={styles.accountIconBox}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
                      <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
                    </svg>
                  </div>
                  <div className={styles.accountInfo}>
                    <span className={styles.accountName}>{acc.name}</span>
                    <span className={styles.accountType}>{acc.type || 'Checking'}</span>
                  </div>
                  <span className={styles.accountBalance}>{acc.balance}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div className={styles.quickActionsContainer}>
            <h3 className={styles.quickActionsHeading}>Quick Actions</h3>
            <div className={styles.actionGrid}>

              <Link href="/dashboard/transactions/transfer" className={styles.actionCard}>
                <div className={styles.actionIcon}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="22" y1="2" x2="11" y2="13"></line>
                    <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                  </svg>
                </div>
                <span className={styles.actionText}>Transfer</span>
              </Link>

              <Link href="/dashboard/transactions" className={styles.actionCard}>
                <div className={styles.actionIcon}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                    <polyline points="14 2 14 8 20 8"></polyline>
                    <line x1="16" y1="13" x2="8" y2="13"></line>
                    <line x1="16" y1="17" x2="8" y2="17"></line>
                  </svg>
                </div>
                <span className={styles.actionText}>Transactions</span>
              </Link>

              <Link href="/dashboard/cards" className={styles.actionCard}>
                <div className={styles.actionIcon}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect>
                    <line x1="1" y1="10" x2="23" y2="10"></line>
                  </svg>
                </div>
                <span className={styles.actionText}>Cards</span>
              </Link>

              <Link href="/dashboard/analytics" className={styles.actionCard}>
                <div className={styles.actionIcon}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="20" x2="18" y2="10"></line>
                    <line x1="12" y1="20" x2="12" y2="4"></line>
                    <line x1="6" y1="20" x2="6" y2="14"></line>
                  </svg>
                </div>
                <span className={styles.actionText}>Analytics</span>
              </Link>

            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <aside className={styles.asideContainer}>
          <div className={styles.asideHeader}>
            <h3 className={styles.asideHeading}>Recent Activity</h3>
            <Link href="/dashboard/transactions" className={styles.asideLink}>View All</Link>
          </div>

          <div className={styles.activityList}>
            {recentTrx.map((t, i) => (
              <div key={i} className={styles.activityItem}>
                <div className={styles.activityIconBox}>
                  <span className={styles.activityIcon}>{getIcon(t.iconType)}</span>
                </div>
                <div className={styles.activityDetails}>
                  <span className={styles.activityTitle}>{t.merchant}</span>
                  <span className={styles.activityTime}>{t.date}</span>
                </div>
                <span className={t.type === 'positive' ? styles.activityAmountPositive : styles.activityAmountNegative}>
                  {t.amount}
                </span>
              </div>
            ))}
          </div>
        </aside>

      </div>
    </div>
  );
}
