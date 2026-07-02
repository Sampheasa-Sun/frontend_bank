'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import styles from './refund.module.css';
import { MOCK_TRANSACTIONS } from '../../mockData';

export default function RefundStatus() {
  const params = useParams();
  const router = useRouter();
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
      <div className={styles.card}>
        
        <div className={styles.headerRow}>
          <div>
            <h1 className={styles.title}>Refund Status</h1>
            <span className={styles.subtitle}>Transaction Ref: {transaction.ref}</span>
          </div>
          <div className={styles.badge}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <polyline points="12 6 12 12 16 14"></polyline>
            </svg>
            PROCESSING
          </div>
        </div>

        <div className={styles.amountCard}>
          <span className={styles.amountLabel}>REFUND AMOUNT</span>
          <h2 className={styles.amountValue}>{transaction.amount}</h2>
        </div>

        <div className={styles.timeline}>
          <div className={styles.timelineLine}></div>
          <div className={styles.timelineLineActive}></div>
          
          <div className={styles.step}>
            <div className={`${styles.stepIcon} ${styles.stepIconDone}`}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
            </div>
            <span className={styles.stepLabel}>Requested</span>
          </div>
          
          <div className={styles.step}>
            <div className={`${styles.stepIcon} ${styles.stepIconCurrent}`}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="8"></circle>
              </svg>
            </div>
            <span className={styles.stepLabelCurrent}>Processing</span>
          </div>
          
          <div className={styles.step}>
            <div className={`${styles.stepIcon} ${styles.stepIconFuture}`}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
              </svg>
            </div>
            <span className={styles.stepLabelFuture}>Credited</span>
          </div>
        </div>

        <div className={styles.detailsList}>
          <div className={styles.detailRow}>
            <span className={styles.detailLabel}>Reason for Refund</span>
            <span className={styles.detailValue}>Duplicate Charge Detected</span>
          </div>
          <div className={styles.detailRow}>
            <span className={styles.detailLabel}>Processed Date</span>
            <span className={styles.detailValue}>{transaction.date}</span>
          </div>
          <div className={styles.detailRow}>
            <span className={styles.detailLabel}>Expected Timeline</span>
            <span className={styles.detailValueTimeline}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <polyline points="12 6 12 12 16 14"></polyline>
              </svg>
              3-5 Business Days
            </span>
          </div>
        </div>

        <div className={styles.btnGroup}>
          <button className={styles.primaryBtn} onClick={() => router.push('/dashboard/transactions')}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="19" y1="12" x2="5" y2="12"></line>
              <polyline points="12 19 5 12 12 5"></polyline>
            </svg>
            Back to Transaction
          </button>
          <button className={styles.secondaryBtn}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M15.05 5A5 5 0 0 1 19 8.95M15.05 1A9 9 0 0 1 23 8.94m-1 7.98v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
            </svg>
            Contact Support
          </button>
        </div>

      </div>
    </div>
  );
}
