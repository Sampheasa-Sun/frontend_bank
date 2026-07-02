'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import styles from './new.module.css';

export default function OpenNewAccount() {
  const router = useRouter();
  const [accountType, setAccountType] = useState('savings');
  const [maturityAction, setMaturityAction] = useState('auto-renew');
  const [termsAgreed, setTermsAgreed] = useState(false);
  const [initialDeposit, setInitialDeposit] = useState('');

  const handleOpenAccount = (e) => {
    e.preventDefault();
    if (!termsAgreed) return;

    // Save to local storage
    const existingAccounts = JSON.parse(localStorage.getItem('user_accounts') || '[]');
    
    let accountName = '';
    let bgColor = '';
    let iconColor = '';
    
    if (accountType === 'savings') {
      accountName = 'New High-Yield Savings';
      bgColor = '#FDECE4';
      iconColor = '#C44100';
    } else if (accountType === 'checking') {
      accountName = 'New Everyday Checking';
      bgColor = '#E7E7F0';
      iconColor = '#434653';
    } else {
      accountName = 'New Fixed Deposit';
      bgColor = '#E7E7F0';
      iconColor = '#434653';
    }

    const newAccount = {
      id: `acc-${Date.now()}`,
      type: accountType.charAt(0).toUpperCase() + accountType.slice(1),
      name: accountName,
      mask: '**** ' + Math.floor(1000 + Math.random() * 9000),
      balance: `$${initialDeposit || (accountType === 'fixed' ? '10000.00' : '0.00')}`,
      equivalent: '≈ 0 KHR',
      status: 'Active',
      bgColor: bgColor,
      iconColor: iconColor,
      isCustom: true // to know it was added by user
    };

    localStorage.setItem('user_accounts', JSON.stringify([...existingAccounts, newAccount]));

    router.push('/dashboard/accounts');
  };

  return (
    <div className={styles.pageContainer}>
      
      <div className={styles.breadcrumbs}>
        <Link href="/dashboard/accounts" className={styles.breadcrumbLink}>My Accounts</Link>
        <span className={styles.breadcrumbSeparator}>›</span>
        <span className={styles.breadcrumbCurrent}>Open New Account</span>
      </div>

      <h1 className={styles.heading}>Open New Account</h1>
      <p className={styles.subHeading}>Select an account type to begin configuring your new portfolio addition.</p>

      <h2 className={styles.sectionTitle}>Select Account Type</h2>
      
      <div className={styles.typeSelectors}>
        {/* Savings */}
        <div 
          className={`${styles.typeCard} ${accountType === 'savings' ? styles.typeCardSelected : ''}`}
          onClick={() => setAccountType('savings')}
        >
          <div className={styles.typeCardHeader}>
            <div className={`${styles.typeIconBox} ${accountType === 'savings' ? styles.typeIconBoxSelected : ''}`}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 5h-2V3a1 1 0 0 0-1-1H8a1 1 0 0 0-1 1v2H5a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2zM8 4h8v1H8V4z"></path>
                <circle cx="12" cy="12" r="2"></circle>
              </svg>
            </div>
            {accountType === 'savings' && (
              <svg className={styles.checkIcon} width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
              </svg>
            )}
          </div>
          <h3 className={styles.typeTitle}>Savings</h3>
          <p className={styles.typeDesc}>Earn competitive interest on your everyday balances with flexible access.</p>
        </div>

        {/* Checking */}
        <div 
          className={`${styles.typeCard} ${accountType === 'checking' ? styles.typeCardSelected : ''}`}
          onClick={() => setAccountType('checking')}
        >
          <div className={styles.typeCardHeader}>
            <div className={`${styles.typeIconBox} ${accountType === 'checking' ? styles.typeIconBoxSelected : ''}`}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="6" width="20" height="12" rx="2"></rect>
                <circle cx="12" cy="12" r="2"></circle>
                <path d="M6 12h.01M18 12h.01"></path>
              </svg>
            </div>
            {accountType === 'checking' && (
              <svg className={styles.checkIcon} width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
              </svg>
            )}
          </div>
          <h3 className={styles.typeTitle}>Checking</h3>
          <p className={styles.typeDesc}>Ideal for daily transactions, bill payments, and direct deposits.</p>
        </div>

        {/* Fixed Deposit */}
        <div 
          className={`${styles.typeCard} ${accountType === 'fixed' ? styles.typeCardSelected : ''}`}
          onClick={() => setAccountType('fixed')}
        >
          <div className={styles.typeCardHeader}>
            <div className={`${styles.typeIconBox} ${accountType === 'fixed' ? styles.typeIconBoxSelected : ''}`}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
              </svg>
            </div>
            {accountType === 'fixed' && (
              <svg className={styles.checkIcon} width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
              </svg>
            )}
          </div>
          <h3 className={styles.typeTitle}>Fixed Deposit</h3>
          <p className={styles.typeDesc}>Lock in a guaranteed high yield for a predetermined term length.</p>
        </div>
      </div>

      <h2 className={styles.sectionTitle}>Configuration</h2>
      
      <div className={styles.configContainer}>
        {/* Dynamic Form Left Side */}
        <div className={styles.configForm}>
          
          {(accountType === 'savings' || accountType === 'checking') && (
            <>
              <div className={styles.formGroup}>
                <label className={styles.label}>Base Currency</label>
                <select className={styles.selectInput}>
                  <option>USD - US Dollar</option>
                  <option>EUR - Euro</option>
                  <option>KHR - Cambodian Riel</option>
                </select>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Initial Deposit (Optional)</label>
                <input 
                  type="text" 
                  className={styles.textInput} 
                  placeholder="$ 0.00" 
                  value={initialDeposit}
                  onChange={(e) => setInitialDeposit(e.target.value.replace(/[^0-9.]/g, ''))}
                />
                <span className={styles.helpText}>
                  {accountType === 'savings' ? 'Funds will be transferred from your primary checking account.' : 'You can fund your account now or later.'}
                </span>
              </div>

              {accountType === 'checking' && (
                <div className={styles.checkboxGroup}>
                  <input type="checkbox" className={styles.checkbox} defaultChecked />
                  <div style={{display: 'flex', flexDirection: 'column'}}>
                    <span className={styles.checkboxLabel}>Request Physical Debit Card</span>
                    <span className={styles.helpText}>A contactless Visa debit card will be mailed to your registered address within 5-7 business days.</span>
                  </div>
                </div>
              )}
            </>
          )}

          {accountType === 'fixed' && (
            <>
              <div className={styles.formGroup}>
                <label className={styles.label}>Initial Deposit Amount</label>
                <input 
                  type="text" 
                  className={styles.textInput} 
                  placeholder="$ 10000"
                  value={initialDeposit}
                  onChange={(e) => setInitialDeposit(e.target.value.replace(/[^0-9.]/g, ''))}
                />
                <span className={styles.helpText} style={{display: 'flex', alignItems: 'center', gap: '4px'}}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>
                  Minimum deposit required is $1,000.
                </span>
              </div>

              <div style={{display: 'flex', gap: '16px'}}>
                <div className={styles.formGroup} style={{flex: 1}}>
                  <label className={styles.label}>Term Length</label>
                  <select className={styles.selectInput}>
                    <option>12 Months (5.50% APY)</option>
                    <option>6 Months (4.25% APY)</option>
                    <option>24 Months (6.00% APY)</option>
                  </select>
                </div>
                <div className={styles.formGroup} style={{flex: 1}}>
                  <label className={styles.label}>Fund From Account</label>
                  <select className={styles.selectInput}>
                    <option>Everyday Checking (...4829) - $14,250.00</option>
                  </select>
                </div>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label} style={{marginBottom: '8px'}}>At Maturity</label>
                
                <div 
                  className={`${styles.radioOption} ${maturityAction === 'auto-renew' ? styles.radioOptionSelected : ''}`}
                  onClick={() => setMaturityAction('auto-renew')}
                >
                  <div className={`${styles.radioCircle} ${maturityAction === 'auto-renew' ? styles.radioCircleSelected : ''}`}>
                    {maturityAction === 'auto-renew' && <div className={styles.radioCircleInner}></div>}
                  </div>
                  <div className={styles.radioTextGroup}>
                    <span className={styles.radioTitle}>Auto-renew Principal & Interest</span>
                    <span className={styles.radioDesc}>Automatically roll over the full balance into a new term at the prevailing rate.</span>
                  </div>
                </div>

                <div 
                  className={`${styles.radioOption} ${maturityAction === 'transfer-interest' ? styles.radioOptionSelected : ''}`}
                  onClick={() => setMaturityAction('transfer-interest')}
                >
                  <div className={`${styles.radioCircle} ${maturityAction === 'transfer-interest' ? styles.radioCircleSelected : ''}`}>
                    {maturityAction === 'transfer-interest' && <div className={styles.radioCircleInner}></div>}
                  </div>
                  <div className={styles.radioTextGroup}>
                    <span className={styles.radioTitle}>Auto-renew Principal, Transfer Interest</span>
                    <span className={styles.radioDesc}>Roll over the principal amount and transfer earned interest to your Checking account.</span>
                  </div>
                </div>

                <div 
                  className={`${styles.radioOption} ${maturityAction === 'transfer-full' ? styles.radioOptionSelected : ''}`}
                  onClick={() => setMaturityAction('transfer-full')}
                >
                  <div className={`${styles.radioCircle} ${maturityAction === 'transfer-full' ? styles.radioCircleSelected : ''}`}>
                    {maturityAction === 'transfer-full' && <div className={styles.radioCircleInner}></div>}
                  </div>
                  <div className={styles.radioTextGroup}>
                    <span className={styles.radioTitle}>Transfer Full Balance</span>
                    <span className={styles.radioDesc}>Transfer both principal and interest to your Checking account upon maturity.</span>
                  </div>
                </div>
              </div>
            </>
          )}

        </div>

        {/* Dynamic Summary Right Side */}
        <div className={styles.summaryPanel}>
          {accountType === 'savings' && (
            <>
              <div className={styles.summaryGroup}>
                <span className={styles.summaryLabel}>CURRENT INTEREST RATE (APY)</span>
                <span className={styles.summaryValueLarge}>4.25% <span className={styles.summaryValueSmall}>variable</span></span>
              </div>
              <div className={styles.summaryDivider}></div>
              <div className={styles.summaryGroup}>
                <span className={styles.summaryLabel}>MONTHLY MAINTENANCE FEE</span>
                <span className={styles.summaryValueMedium}>$0.00</span>
                <span className={styles.summaryValueSmall}>No fee when maintaining a minimum balance of $500.</span>
              </div>
            </>
          )}

          {accountType === 'checking' && (
            <>
              <span className={styles.summaryLabel} style={{marginBottom: '16px'}}>ACCOUNT SUMMARY</span>
              <div className={styles.summaryRow}>
                <span className={styles.summaryRowLabel}>Account Type</span>
                <span className={styles.summaryRowValue}>Checking</span>
              </div>
              <div className={styles.summaryRow}>
                <span className={styles.summaryRowLabel}>Interest Rate (APY)</span>
                <span className={styles.summaryRowValue}>0.00%</span>
              </div>
              <div className={styles.summaryRow}>
                <span className={styles.summaryRowLabel}>Monthly Maintenance Fee</span>
                <span className={styles.summaryRowValue}>$0.00</span>
              </div>
              <div className={styles.summaryDivider}></div>
              <div className={styles.infoBox}>
                <svg className={styles.infoIcon} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>
                <span className={styles.infoText}>Unlimited transactions and direct deposits included.</span>
              </div>
            </>
          )}

          {accountType === 'fixed' && (
            <>
              <span className={styles.summaryLabel} style={{marginBottom: '16px'}}>Account Summary</span>
              <div className={styles.summaryRow}>
                <span className={styles.summaryRowLabel}>Initial Deposit</span>
                <span className={styles.summaryRowValue}>$10,000.00</span>
              </div>
              <div className={styles.summaryRow}>
                <span className={styles.summaryRowLabel}>Term Length</span>
                <span className={styles.summaryRowValue}>12 Months</span>
              </div>
              <div className={styles.summaryRow}>
                <span className={styles.summaryRowLabel}>Interest Rate (APY)</span>
                <span className={styles.summaryRowValueBlue}>5.50% Fixed</span>
              </div>
              <div className={styles.summaryRow}>
                <span className={styles.summaryRowLabel}>Maturity Date</span>
                <span className={styles.summaryRowValue}>Oct 24, 2024</span>
              </div>
              
              <div className={styles.summaryDivider} style={{margin: '16px 0'}}></div>
              
              <div className={styles.summaryGroup}>
                <span className={styles.summaryLabel}>ESTIMATED INTEREST AT MATURITY</span>
                <span className={styles.summaryValueLarge}>$550.00</span>
              </div>

              <div className={styles.alertBox}>
                <svg className={styles.alertIcon} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
                <span className={styles.alertText}>Early withdrawal before maturity may result in a penalty and loss of interest accrued.</span>
              </div>
            </>
          )}
        </div>
      </div>

      <div className={styles.actionsFooter}>
        <div className={styles.termsContainer}>
          <input 
            type="checkbox" 
            className={styles.checkbox} 
            id="terms" 
            checked={termsAgreed}
            onChange={(e) => setTermsAgreed(e.target.checked)}
          />
          <label htmlFor="terms" className={styles.termsText}>
            I agree to the <Link href="#" className={styles.termsLink}>Account Terms & Conditions</Link> and acknowledge the <Link href="#" className={styles.termsLink}>Fee Schedule</Link>.
          </label>
        </div>
        <div className={styles.buttonsContainer}>
          <button 
            className={`${styles.submitBtn} ${!termsAgreed ? styles.disabledBtn : ''}`} 
            onClick={handleOpenAccount}
            disabled={!termsAgreed}
          >
            Open Account
          </button>
          <button className={styles.cancelBtn} onClick={() => router.back()}>Cancel</button>
        </div>
      </div>

    </div>
  );
}
