import React from 'react';
import Link from 'next/link';
import styles from './success.module.css';

export default function Success() {
  return (
    <div className={styles.pageContainer}>
      <div className={styles.card}>
        
        <div className={styles.iconBox}>
          <div className={styles.iconCircle} style={{ background: '#E6A23C' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <polyline points="12 6 12 12 16 14"></polyline>
            </svg>
          </div>
        </div>

        <h1 className={styles.heading}>Verification Pending</h1>
        
        <p className={styles.subText}>
          Your documents have been successfully submitted and are currently under review. Please wait for approval. Once approved, a button will appear here for you to access your dashboard.
        </p>

        <div className={styles.actions}>
          {/* Dashboard button temporarily active for demo purposes */}
          <Link href="/dashboard" className={styles.primaryBtn}>
            Go to Dashboard (Demo)
          </Link>
        </div>

      </div>
    </div>
  );
}
