import React from 'react';
import Link from 'next/link';
import styles from './forgot-password.module.css';

export default function ForgotPassword() {
  return (
    <div className={styles.pageContainer}>
      <div className={styles.contentWrapper}>
        
        {/* Brand Anchor */}
        <div className={styles.brandAnchor}>
          <div className={styles.brandIconWrapper}>
            <svg className={styles.brandIcon} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2L2 7L12 12L22 7L12 2Z" fill="currentColor"/>
              <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <span className={styles.brandTextBold}>Equinox</span>
          <span className={styles.brandTextLight}>Banking</span>
        </div>

        {/* Main Card */}
        <div className={styles.card}>
          
          {/* Progress Indicator */}
          <div className={styles.progressContainer}>
            <div className={styles.progressLineBg}></div>
            <div className={styles.progressLineActive} style={{ width: '50%' }}></div>
            
            <div className={styles.step}>
              <div className={styles.stepCircleActive}>1</div>
              <span className={styles.stepTextActive}>Email</span>
            </div>
            
            <div className={styles.step}>
              <div className={styles.stepCircleInactive}>2</div>
              <span className={styles.stepTextInactive}>Verify</span>
            </div>
            
            <div className={styles.step}>
              <div className={styles.stepCircleInactive}>3</div>
              <span className={styles.stepTextInactive}>Reset</span>
            </div>
          </div>

          {/* Header Content */}
          <div className={styles.headerContent}>
            <h1 className={styles.heading}>Forgot Password</h1>
            <p className={styles.subText}>
              Enter the email address associated with your account and we'll send you a secure link to reset your password.
            </p>
          </div>

          {/* Form */}
          <form className={styles.form}>
            <div className={styles.inputGroup}>
              <label className={styles.label}>Email Address</label>
              <div className={styles.inputWrapper}>
                <svg className={styles.inputIcon} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M22 6l-10 7L2 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <input 
                  type="email" 
                  className={styles.input} 
                  placeholder="name@company.com" 
                  required 
                />
              </div>
            </div>

            <button type="button" className={styles.submitBtn}>
              Send Reset Link
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M5 12H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M12 5L19 12L12 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </form>

          {/* Secondary Action */}
          <Link href="/login" className={styles.secondaryAction}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M19 12H5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M12 19L5 12L12 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Back to Login
          </Link>
          
        </div>

        {/* Footer Meta */}
        <div className={styles.footerMeta}>
          Secure 256-bit Encryption • Institutional Grade
        </div>
        
      </div>
    </div>
  );
}
