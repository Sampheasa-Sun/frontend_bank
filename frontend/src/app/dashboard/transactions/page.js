'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import styles from './transactions.module.css';
import { MOCK_TRANSACTIONS, generateTransactions } from './mockData';

export default function Transactions() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [transactions, setTransactions] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const loadingRef = useRef(false);

  const [filterAccount, setFilterAccount] = useState('All Accounts');
  const [filterDate, setFilterDate] = useState('Last 30 Days');
  const [filterType, setFilterType] = useState('All Types');

  useEffect(() => {
    // Load accounts for dropdown
    const savedAccounts = JSON.parse(localStorage.getItem('user_accounts') || '[]');
    setAccounts(savedAccounts);

    // Pre-select account if ?account= param is present
    const accountParam = searchParams.get('account');
    if (accountParam) {
      const matched = savedAccounts.find(a => a.id === accountParam);
      if (matched) setFilterAccount(matched.name);
    }

    // Verify any approved loans have a corresponding loan funding transaction in localStorage
    const savedApprovals = JSON.parse(localStorage.getItem('loan_approvals') || '{}');
    let userTxs = JSON.parse(localStorage.getItem('user_transactions') || '[]');
    let modified = false;

    Object.keys(savedApprovals).forEach(loanId => {
      if (savedApprovals[loanId] === 'approved') {
        const fundingTxId = `TRX-LOAN-${loanId}`;
        if (!userTxs.some(t => t.id === fundingTxId)) {
          const matchedAcct = savedAccounts.find(a => a.id === `loan-${loanId}`);
          const amount = matchedAcct ? matchedAcct.balance.replace('$', '') : '15,000.00';
          const name = matchedAcct ? matchedAcct.name : 'Personal Consolidation Loan';

          const newTx = {
            id: fundingTxId,
            merchant: 'Equinox Bank (Loan Funding)',
            category: 'Deposit',
            date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
            time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
            ref: `REF-${Math.floor(10000000 + Math.random() * 90000000)}`,
            status: 'Cleared',
            amount: `+$${amount}`,
            type: 'positive',
            iconType: 'transfer',
            fromAccount: name
          };
          userTxs.unshift(newTx);
          modified = true;
        }
      }
    });

    if (modified) {
      localStorage.setItem('user_transactions', JSON.stringify(userTxs));
    }

    // Initial 100 transactions + local transactions
    const generated = generateTransactions(100);
    setTransactions([...userTxs, ...MOCK_TRANSACTIONS, ...generated]);
  }, [searchParams]);

  const handleScroll = useCallback(() => {
    if (loadingRef.current) return;
    
    // Check if scrolled near bottom
    const bottom = Math.ceil(window.innerHeight + window.scrollY) >= document.documentElement.scrollHeight - 200;
    
    if (bottom) {
      loadingRef.current = true;
      // Load 100 more transactions
      setTimeout(() => {
        const more = generateTransactions(100);
        setTransactions(prev => [...prev, ...more]);
        loadingRef.current = false;
      }, 500);
    }
  }, []);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  const getIcon = (type) => {
    if (type === 'store') return (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
      </svg>
    );
    if (type === 'refund') return (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
        <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
      </svg>
    );
    if (type === 'dining') return (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M18 8h1a4 4 0 0 1 0 8h-1"></path>
        <path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"></path>
        <line x1="6" y1="1" x2="6" y2="4"></line>
        <line x1="10" y1="1" x2="10" y2="4"></line>
        <line x1="14" y1="1" x2="14" y2="4"></line>
      </svg>
    );
    // default transfer
    return (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="16 3 21 3 21 8"></polyline>
        <line x1="4" y1="20" x2="21" y2="3"></line>
        <polyline points="21 16 21 21 16 21"></polyline>
        <line x1="15" y1="15" x2="21" y2="21"></line>
        <line x1="4" y1="4" x2="9" y2="9"></line>
      </svg>
    );
  };

  const getIconClass = (iconType, type) => {
    if (iconType === 'store' || iconType === 'dining') return styles.iconBoxRed;
    if (iconType === 'refund') return styles.iconBoxGreen;
    return styles.iconBoxBlue;
  };

  const getBadgeClass = (status) => {
    if (status === 'Cleared') return styles.badgeCleared;
    if (status === 'Processing') return styles.badgeProcessing;
    if (status === 'Pending') return styles.badgePending;
    return styles.badgeCleared;
  };

  const getStatusIcon = (status) => {
    if (status === 'Cleared') return (
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="20 6 9 17 4 12"></polyline>
      </svg>
    );
    if (status === 'Processing') return (
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"></circle>
        <polyline points="12 6 12 12 16 14"></polyline>
      </svg>
    );
    if (status === 'Pending') return (
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="12" y1="2" x2="12" y2="6"></line>
        <line x1="12" y1="18" x2="12" y2="22"></line>
        <line x1="4.93" y1="4.93" x2="7.76" y2="7.76"></line>
        <line x1="16.24" y1="16.24" x2="19.07" y2="19.07"></line>
        <line x1="2" y1="12" x2="6" y2="12"></line>
        <line x1="18" y1="12" x2="22" y2="12"></line>
        <line x1="4.93" y1="19.07" x2="7.76" y2="16.24"></line>
        <line x1="16.24" y1="4.93" x2="19.07" y2="7.76"></line>
      </svg>
    );
    return null;
  };

  const filteredTransactions = transactions.filter(trx => {
    if (filterAccount !== 'All Accounts' && trx.fromAccount !== filterAccount) return false;
    
    if (filterType !== 'All Types') {
      const isOther = ['Refund', 'Internal Saving', 'Internal Transfer', 'Withdrawal', 'Deposit'].includes(trx.category);
      if (filterType === 'General' && isOther) return false;
      if (filterType === 'Refund' && trx.category !== 'Refund') return false;
      if (filterType === 'Internal Saving' && trx.category !== 'Internal Saving' && trx.category !== 'Internal Transfer') return false;
      if (filterType === 'Withdrawal' && trx.category !== 'Withdrawal') return false;
      if (filterType === 'Deposit' && trx.category !== 'Deposit') return false;
    }

    const trxDate = new Date(trx.date);
    const now = new Date();
    const diffDays = Math.ceil(Math.abs(now - trxDate) / (1000 * 60 * 60 * 24)); 
    
    if (filterDate === 'Today' && diffDays > 1) return false;
    if (filterDate === 'Yesterday' && (diffDays <= 1 || diffDays > 2)) return false;
    if (filterDate === 'Last 5 Days' && diffDays > 5) return false;
    if (filterDate === 'Last 30 Days' && diffDays > 30) return false;

    return true;
  });

  return (
    <div className={styles.pageContainer}>
      <div className={styles.headerRow}>
        <div className={styles.titleBox}>
          <h1 className={styles.heading}>Transaction</h1>
          <p className={styles.subText}>Review your past transactions, filter records, and export statements.</p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <Link href="/dashboard/transactions/bills" className={styles.transferBtn} style={{ background: '#FFFFFF', color: '#0047AB', border: '1px solid #0047AB' }}>
            Pay Bill
          </Link>
          <Link href="/dashboard/transactions/transfer" className={styles.transferBtn}>
            Transfer
          </Link>
        </div>
      </div>

      <div className={styles.filterCard}>
        <div className={styles.filterGroup}>
          <span className={styles.filterLabel}>Account</span>
          <select className={styles.filterSelect} value={filterAccount} onChange={(e) => setFilterAccount(e.target.value)}>
            <option>All Accounts</option>
            {accounts.map((acc, i) => (
              <option key={i} value={acc.name}>{acc.name}</option>
            ))}
          </select>
        </div>
        <div className={styles.filterGroup}>
          <span className={styles.filterLabel}>Date Range</span>
          <select className={styles.filterSelect} value={filterDate} onChange={(e) => setFilterDate(e.target.value)}>
            <option>Today</option>
            <option>Yesterday</option>
            <option>Last 5 Days</option>
            <option>Last 30 Days</option>
          </select>
        </div>
        <div className={styles.filterGroup}>
          <span className={styles.filterLabel}>Type</span>
          <select className={styles.filterSelect} value={filterType} onChange={(e) => setFilterType(e.target.value)}>
            <option>All Types</option>
            <option>General</option>
            <option>Refund</option>
            <option>Internal Saving</option>
            <option>Withdrawal</option>
            <option>Deposit</option>
          </select>
        </div>
      </div>

      <div className={styles.tableCard}>
        <div className={styles.tableHeader}>
          <span className={styles.tableHeaderCellDesc}>DESCRIPTION</span>
          <span className={styles.tableHeaderCell}>DATE & TIME</span>
          <span className={styles.tableHeaderCell}>REFERENCE NUMBER</span>
          <span className={styles.tableHeaderCell}>STATUS</span>
          <span className={styles.tableHeaderCellRight}>AMOUNT</span>
        </div>

        <div className={styles.tableBody}>
          {filteredTransactions.map((trx, idx) => (
            <div key={idx} className={styles.tableRow}>
              <div className={styles.cellDesc}>
                <div className={`${styles.iconBox} ${getIconClass(trx.iconType, trx.type)}`}>
                  {getIcon(trx.iconType)}
                </div>
                <div className={styles.descText}>
                  <span className={styles.merchantName}>{trx.merchant}</span>
                  <span className={styles.merchantCategory}>{trx.category}</span>
                </div>
              </div>
              
              <div className={styles.cell}>
                <span className={styles.dateText}>{trx.date}</span>
                <span className={styles.timeText}>{trx.time}</span>
              </div>
              
              <div className={styles.cell}>
                <span className={styles.refNumber}>{trx.ref}</span>
              </div>
              
              <div className={styles.cell}>
                <div className={`${styles.badge} ${getBadgeClass(trx.status)}`}>
                  {getStatusIcon(trx.status)}
                  {trx.status}
                </div>
              </div>
              
              <div className={styles.cellRight}>
                <span className={trx.type === 'negative' ? styles.amountNeg : styles.amountPos}>
                  {trx.amount}
                </span>
              </div>
            </div>
          ))}
          {loadingRef.current && (
            <div className={styles.loadingRow}>Loading more...</div>
          )}
        </div>
      </div>
    </div>
  );
}
