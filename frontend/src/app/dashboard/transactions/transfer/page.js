'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import styles from './transfer.module.css';

function TransferFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [accounts, setAccounts] = useState([]);
  
  const initialToAccount = searchParams.get('toAccount') || '';
  const initialRecipient = searchParams.get('recipient') || '';
  const initialAmount = searchParams.get('amount') || '';
  const isReadOnly = searchParams.get('readonly') === 'true';

  // form state
  const [fromAccount, setFromAccount] = useState('');
  const [toAccountNum, setToAccountNum] = useState(initialToAccount);
  const [recipient, setRecipient] = useState(initialRecipient);
  const [amount, setAmount] = useState(initialAmount);
  const [currency, setCurrency] = useState('USD');
  const [description, setDescription] = useState('');

  // modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState('');
  const [modalMessage, setModalMessage] = useState('');

  const showModal = (title, message) => {
    setModalTitle(title);
    setModalMessage(message);
    setModalOpen(true);
  };

  useEffect(() => {
    let saved = JSON.parse(localStorage.getItem('user_accounts') || 'null');
    if (!saved || saved.length === 0) {
      saved = [{ id: 'checking-1', name: 'Premier Checking', balance: '$24,500.00', mask: '*1234' }];
    }
    setAccounts(saved);
    if (saved.length > 0) {
      setFromAccount(saved[0].name);
    }
  }, []);

  const handleTransfer = (e) => {
    e.preventDefault();
    if (!amount || !toAccountNum || !recipient) return;

    const selectedAcc = accounts.find(a => a.name === fromAccount);
    if (selectedAcc) {
      const balanceNum = parseFloat(selectedAcc.balance.replace(/[^0-9.-]+/g, ""));
      const transferAmount = parseFloat(amount);
      
      if (transferAmount > balanceNum) {
        showModal('Insufficient Funds', `Your account balance is ${selectedAcc.balance}.`);
        return;
      }
    }
    
    // Save new transaction
    const newTrx = {
      id: `TRX-${Math.floor(10000000 + Math.random() * 90000000)}`,
      merchant: recipient,
      category: 'Transfer',
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      ref: `REF-${Math.floor(10000000 + Math.random() * 90000000)}`,
      status: 'Pending',
      amount: `-$${parseFloat(amount).toFixed(2)}`,
      type: 'negative',
      iconType: 'transfer',
      fromAccount: fromAccount,
      description: description || `Transfer to ${toAccountNum}`
    };

    const storedTrx = JSON.parse(localStorage.getItem('user_transactions') || '[]');
    localStorage.setItem('user_transactions', JSON.stringify([newTrx, ...storedTrx]));

    // Could use modal here too, but redirecting right away
    showModal('Success', 'Transfer initiated successfully!');
    setTimeout(() => {
      router.push('/dashboard/transactions');
    }, 1500);
  };

  return (
    <div className={styles.pageContainer}>
      <Link href="/dashboard/transactions" className={styles.backLink}>
        <svg className={styles.backIcon} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="19" y1="12" x2="5" y2="12"></line>
          <polyline points="12 19 5 12 12 5"></polyline>
        </svg>
        Back to Transactions
      </Link>

      <div className={styles.card}>
        <h2 className={styles.cardTitle}>Transfer Details</h2>

        <form onSubmit={handleTransfer}>
          <div className={styles.formGroup}>
            <label className={styles.label}>From Account</label>
            <select 
              className={styles.selectInput}
              value={fromAccount}
              onChange={(e) => setFromAccount(e.target.value)}
            >
              {accounts.map((acc, i) => (
                <option key={i} value={acc.name}>
                  {acc.name} ({acc.mask || '*1234'}) - Balance: {acc.balance || '$0.00'}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.row}>
            <div className={styles.col}>
              <label className={styles.label}>To Account Number</label>
              <div className={styles.inputWithIcon}>
                <input 
                  type="text" 
                  className={styles.textInput} 
                  placeholder="e.g., 9876543210" 
                  value={toAccountNum}
                  onChange={(e) => setToAccountNum(e.target.value)}
                  readOnly={isReadOnly}
                  required
                />
                <div className={styles.iconInside}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                    <line x1="16" y1="2" x2="16" y2="6"></line>
                    <line x1="8" y1="2" x2="8" y2="6"></line>
                    <line x1="3" y1="10" x2="21" y2="10"></line>
                    <path d="M7 15h.01M11 15h2M7 19h10"></path>
                  </svg>
                </div>
              </div>
            </div>
            
            <div className={styles.col}>
              <label className={styles.label}>Recipient Name</label>
              <input 
                type="text" 
                className={styles.textInput} 
                placeholder="e.g., Alexander Montgomery"
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
                readOnly={isReadOnly}
                required
              />
              {recipient.length > 2 && toAccountNum.length > 5 && (
                <div className={styles.verifiedBadge}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                  Account Verified
                </div>
              )}
            </div>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Amount</label>
            <div className={styles.amountGroup}>
              <select className={`${styles.selectInput} ${styles.currencySelect}`} value={currency} onChange={(e) => setCurrency(e.target.value)} disabled={isReadOnly}>
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
                <option value="GBP">GBP</option>
              </select>
              <input 
                type="number" 
                step="0.01"
                className={`${styles.textInput} ${styles.amountInput}`} 
                placeholder="1500.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                readOnly={isReadOnly}
                required
              />
            </div>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Description / Notes (Optional)</label>
            <textarea 
              className={styles.textArea} 
              placeholder="e.g., Invoice Payment #4592"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            ></textarea>
          </div>

          <div className={styles.divider}></div>

          <div className={styles.btnGroup}>
            <button type="button" className={styles.cancelBtn} onClick={() => router.push('/dashboard/transactions')}>
              Cancel
            </button>
            <button type="submit" className={styles.primaryBtn} disabled={!amount || !toAccountNum || !recipient}>
              Transfer
            </button>
          </div>

        </form>
      </div>

      {modalOpen && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalDialog}>
            <h3 className={styles.modalTitle}>{modalTitle}</h3>
            <p className={styles.modalMessage}>{modalMessage}</p>
            <button className={styles.modalCloseBtn} onClick={() => setModalOpen(false)}>
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function TransferForm() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <TransferFormContent />
    </Suspense>
  );
}
