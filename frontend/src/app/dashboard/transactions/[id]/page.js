'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import styles from './details.module.css';
import { MOCK_TRANSACTIONS } from '../mockData';

export default function TransactionDetails() {
  const params = useParams();
  const [transaction, setTransaction] = useState(null);

  useEffect(() => {
    const storedTrx = JSON.parse(localStorage.getItem('user_transactions') || '[]');
    const all = [...storedTrx, ...MOCK_TRANSACTIONS];
    const found = all.find(t => t.id === params.id);
    if (found) setTransaction(found);
  }, [params.id]);

  if (!transaction) return <div style={{padding: '48px'}}>Loading...</div>;

  return (
    <div className={styles.pageContainer}>
      <Link href="/dashboard/transactions" className={styles.backLink}>
        <svg className={styles.backIcon} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="19" y1="12" x2="5" y2="12"></line>
          <polyline points="12 19 5 12 12 5"></polyline>
        </svg>
        Back to Transactions
      </Link>

      <div className={styles.iconContainer}>
        {transaction.iconType === 'store' || transaction.iconType === 'dining' ? (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
          </svg>
        ) : transaction.iconType === 'refund' ? (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
            <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
          </svg>
        ) : (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="16 3 21 3 21 8"></polyline>
            <line x1="4" y1="20" x2="21" y2="3"></line>
            <polyline points="21 16 21 21 16 21"></polyline>
            <line x1="15" y1="15" x2="21" y2="21"></line>
            <line x1="4" y1="4" x2="9" y2="9"></line>
          </svg>
        )}
      </div>

      <h1 className={styles.amount}>{transaction.amount}</h1>

      <div className={styles.badge}>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="20 6 9 17 4 12"></polyline>
        </svg>
        {transaction.status}
      </div>

      <div className={styles.detailsCard}>
        <div className={styles.detailsHeader}>
          Transaction Details
        </div>
        
        <div className={styles.detailRow}>
          <span className={styles.detailLabel}>Reference Number</span>
          <div className={styles.detailValue}>
            {transaction.ref}
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#737784" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
            </svg>
          </div>
        </div>
        
        <div className={styles.detailRow}>
          <span className={styles.detailLabel}>Date & Time</span>
          <span className={styles.detailValue}>{transaction.date}, {transaction.time}</span>
        </div>
        
        <div className={styles.detailRow}>
          <span className={styles.detailLabel}>From Account</span>
          <div className={styles.accountValue}>
            <div className={styles.dot}></div>
            {transaction.fromAccount || 'Premier Checking (...1234)'}
          </div>
        </div>
        
        <div className={styles.detailRow}>
          <span className={styles.detailLabel}>Merchant / Recipient</span>
          <span className={styles.detailValue}>{transaction.merchant}</span>
        </div>
        
        <div className={styles.detailRow}>
          <span className={styles.detailLabel}>Description</span>
          <span className={styles.detailValue}>{transaction.description || `${transaction.category} - Retail`}</span>
        </div>
        
        <div className={styles.detailRow}>
          <span className={styles.detailLabel}>Transaction Fee</span>
          <span className={styles.detailValue}>$0.00</span>
        </div>

        <div className={styles.actionsCard}>
          <div className={styles.btnGroup}>
            <button className={styles.primaryBtn}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                <polyline points="7 10 12 15 17 10"></polyline>
                <line x1="12" y1="15" x2="12" y2="3"></line>
              </svg>
              Download Receipt
            </button>
            <button className={styles.secondaryBtn}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="18" cy="5" r="3"></circle>
                <circle cx="6" cy="12" r="3"></circle>
                <circle cx="18" cy="19" r="3"></circle>
                <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line>
                <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line>
              </svg>
              Share
            </button>
          </div>
          <div className={styles.infoText}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="16" x2="12" y2="12"></line>
              <line x1="12" y1="8" x2="12.01" y2="8"></line>
            </svg>
            Refund period expired (30 days)
          </div>
        </div>
      </div>
    </div>
  );
}
