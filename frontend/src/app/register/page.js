'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import styles from './register.module.css';

export default function Register() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    router.push('/verify');
  };

  return (
    <div className={styles.pageContainer}>
      {/* Left blue panel */}
      <div className={styles.leftPanel}></div>
      
      {/* Right form panel */}
      <div className={styles.rightPanel}>
        <div className={styles.formContainer}>
          <div className={styles.headerContent}>
            <h1 className={styles.heading}>Create Account</h1>
            <p className={styles.subText}>Please fill in your details to register.</p>
          </div>

          <form className={styles.form} onSubmit={handleSubmit}>
            <div className={styles.row}>
              <div className={styles.inputGroup}>
                <label className={styles.label}>First Name</label>
                <input type="text" className={styles.input} placeholder="Jane" required />
              </div>
              <div className={styles.inputGroup}>
                <label className={styles.label}>Last Name</label>
                <input type="text" className={styles.input} placeholder="Doe" required />
              </div>
            </div>

            <div className={styles.inputGroup}>
              <label className={styles.label}>Email Address</label>
              <div className={styles.inputWrapper}>
                <svg className={styles.inputIcon} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M22 6l-10 7L2 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <input type="email" className={`${styles.input} ${styles.inputWithIcon}`} placeholder="jane.doe@example.com" required />
              </div>
            </div>

            <div className={styles.inputGroup}>
              <label className={styles.label}>Phone Number</label>
              <div className={styles.inputWrapper}>
                <div className={styles.phonePrefix}>+855 <span style={{marginLeft: '4px', fontSize: '10px'}}>▼</span></div>
                <input type="tel" className={`${styles.input} ${styles.phoneInput}`} placeholder="000 000 000" required />
              </div>
            </div>

            <div className={styles.inputGroup}>
              <label className={styles.label}>Password</label>
              <div className={styles.passwordGroup}>
                <div className={styles.inputWrapper}>
                  <svg className={styles.inputIcon} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  <input type={showPassword ? "text" : "password"} className={`${styles.input} ${styles.inputWithIcon}`} required />
                  <svg className={styles.inputIconRight} onClick={() => setShowPassword(!showPassword)} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <div className={styles.strengthIndicator}>
                  <div className={styles.strengthBar}></div>
                  <div className={styles.strengthBar}></div>
                  <div className={styles.strengthBar}></div>
                  <div className={styles.strengthBar}></div>
                </div>
              </div>
            </div>

            <div className={styles.inputGroup}>
              <label className={styles.label}>Confirm Password</label>
              <div className={styles.inputWrapper}>
                <svg className={styles.inputIcon} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <input type={showConfirmPassword ? "text" : "password"} className={`${styles.input} ${styles.inputWithIcon}`} required />
                <svg className={styles.inputIconRight} onClick={() => setShowConfirmPassword(!showConfirmPassword)} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
            </div>

            <div className={styles.inputGroup}>
              <label className={styles.label}>Date of Birth</label>
              <div className={styles.dateInputContainer}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#737784" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{marginRight: '8px'}}>
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                  <line x1="16" y1="2" x2="16" y2="6"></line>
                  <line x1="8" y1="2" x2="8" y2="6"></line>
                  <line x1="3" y1="10" x2="21" y2="10"></line>
                </svg>
                <input 
                  type="text" 
                  inputMode="numeric"
                  className={styles.dateInput} 
                  placeholder="mm" 
                  maxLength="2"
                  onInput={(e) => e.target.value = e.target.value.replace(/\D/g, '')}
                />
                <span className={styles.dateSeparator}>/</span>
                <input 
                  type="text" 
                  inputMode="numeric"
                  className={styles.dateInput} 
                  placeholder="dd" 
                  maxLength="2"
                  onInput={(e) => e.target.value = e.target.value.replace(/\D/g, '')}
                />
                <span className={styles.dateSeparator}>/</span>
                <input 
                  type="text" 
                  inputMode="numeric"
                  className={`${styles.dateInput} ${styles.year}`} 
                  placeholder="yyyy" 
                  maxLength="4"
                  onInput={(e) => e.target.value = e.target.value.replace(/\D/g, '')}
                />
              </div>
            </div>

            <div className={styles.inputGroup}>
              <label className={styles.label}>Residential Address</label>
              <textarea className={styles.textarea} required></textarea>
            </div>

            <div className={styles.termsContainer}>
              <input type="checkbox" className={styles.checkbox} required />
              <span className={styles.termsText}>
                I agree to the <a href="#" className={styles.termsLink}>Terms & Conditions</a> and <a href="#" className={styles.termsLink}>Privacy Policy</a>.
              </span>
            </div>

            <div className={styles.actions}>
              <button type="submit" className={styles.submitBtn}>
                Register
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                  <polyline points="12 5 19 12 12 19"></polyline>
                </svg>
              </button>
              
              <Link href="/login" className={styles.secondaryAction}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="19" y1="12" x2="5" y2="12"></line>
                  <polyline points="12 19 5 12 12 5"></polyline>
                </svg>
                Back to Login
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
