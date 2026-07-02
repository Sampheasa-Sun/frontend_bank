'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import styles from './login.module.css';

export default function Login() {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className={styles.userLogin}>
      <div className={styles.loginCard}>
        <div className={styles.headerContainer}>
          <div className={styles.iconWrapper}>
            <svg
              className={styles.icon}
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M12 2L2 7L12 12L22 7L12 2Z"
                fill="currentColor"
              />
              <path
                d="M2 17L12 22L22 17"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M2 12L12 17L22 12"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <h1 className={styles.heading}>Equinox Banking</h1>
          <p className={styles.subText}>Secure access to your financial world</p>
        </div>

        <form className={styles.form} onSubmit={(e) => e.preventDefault()}>
          <div className={styles.inputGroup}>
            <label className={styles.label}>Email Address</label>
            <div className={styles.inputWrapper}>
              <svg
                className={styles.inputIconLeft}
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
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

          <div className={styles.inputGroup}>
            <div className={styles.labelContainer}>
              <label className={styles.label}>Password</label>
              <Link href="/forgot-password" className={styles.link}>Forgot password?</Link>
            </div>
            <div className={styles.inputWrapper}>
              <svg
                className={styles.inputIconLeft}
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M7 11V7a5 5 0 0 1 10 0v4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <input
                type={showPassword ? 'text' : 'password'}
                className={styles.input}
                placeholder="••••••••"
                required
              />
              <svg
                className={styles.inputIconRight}
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                onClick={() => setShowPassword(!showPassword)}
              >
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
          </div>

          <label className={styles.rememberMe}>
            <input type="checkbox" className={styles.checkbox} />
            <span className={styles.checkboxLabel}>Remember me on this device</span>
          </label>

          <button type="submit" className={styles.submitBtn}>
            Sign In
          </button>

          <div className={styles.registerContainer}>
            <span className={styles.registerText}>Don't have an account?</span>
            <Link href="/register" className={styles.registerLink}>Register</Link>
          </div>
        </form>
      </div>
    </div>
  );
}
