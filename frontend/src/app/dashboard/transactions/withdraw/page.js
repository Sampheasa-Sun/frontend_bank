'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import styles from './withdraw.module.css';

export default function WithdrawPage() {
  const router = useRouter();
  const [accounts, setAccounts] = useState([]);
  const [selectedAccount, setSelectedAccount] = useState('');
  const [amount, setAmount] = useState('0');
  const [error, setError] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [receiptData, setReceiptData] = useState(null);

  useEffect(() => {
    let saved = JSON.parse(localStorage.getItem('user_accounts') || 'null');
    if (!saved || saved.length === 0) {
      saved = [{ id: 'checking-1', name: 'Premier Checking', balance: '$24,500.00', mask: '**** 1234', type: 'Checking' }];
    }
    const eligible = saved.filter(a => !a.type.toLowerCase().includes('fixed') && !a.type.toLowerCase().includes('loan'));
    setAccounts(eligible);
    if (eligible.length > 0) {
      setSelectedAccount(eligible[0].id);
    }
  }, []);

  const handleKeyPress = (key) => {
    if (isSuccess) return;
    setError('');
    if (key === 'CLEAR') {
      setAmount('0');
    } else {
      if (amount === '0') {
        setAmount(key);
      } else if (amount.length < 8) { // max 8 digits
        setAmount(amount + key);
      }
    }
  };

  const handleQuickCash = (val) => {
    if (isSuccess) return;
    setError('');
    setAmount(val.toString());
  };

  const handleConfirm = () => {
    if (isSuccess || amount === '0') return;

    const withdrawAmount = parseFloat(amount);
    
    if (withdrawAmount > 10000) {
      setError('MAX LIMIT $10,000');
      return;
    }

    // Process withdrawal
    const storedAccounts = JSON.parse(localStorage.getItem('user_accounts') || '[]');
    const accIndex = storedAccounts.findIndex(a => a.id === selectedAccount);
    
    if (accIndex !== -1) {
      const currentBalanceStr = storedAccounts[accIndex].balance.replace(/[^0-9.-]+/g,"");
      const currentBalance = parseFloat(currentBalanceStr);
      
      if (currentBalance < withdrawAmount) {
        setError('INSUFFICIENT FUNDS');
        return;
      }

      const newBalance = currentBalance - withdrawAmount;
      storedAccounts[accIndex].balance = `$${newBalance.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;
      localStorage.setItem('user_accounts', JSON.stringify(storedAccounts));

      // Record transaction
      const storedTxs = JSON.parse(localStorage.getItem('user_transactions') || '[]');
      const newTx = {
        id: `TRX-${Math.floor(10000000 + Math.random() * 90000000)}`,
        merchant: 'Cash Withdrawal',
        category: 'Withdrawal',
        date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        ref: `WDL-${Math.floor(10000000 + Math.random() * 90000000)}`,
        status: 'Cleared',
        amount: `-$${withdrawAmount.toFixed(2)}`,
        type: 'negative',
        iconType: 'transfer',
        fromAccount: storedAccounts[accIndex].name,
        description: 'Cash withdrawal at ATM'
      };
      localStorage.setItem('user_transactions', JSON.stringify([newTx, ...storedTxs]));

      setReceiptData({
        amount: withdrawAmount.toFixed(2),
        account: storedAccounts[accIndex].name,
        date: newTx.date,
        time: newTx.time,
        ref: newTx.ref
      });
      setIsSuccess(true);
    }
  };

  const handleCancel = () => {
    router.push('/dashboard/transactions');
  };

  return (
    <div className={styles.pageContainer}>
      <div className={styles.atmMachine}>
        <div className={styles.atmHeader}>EQUINOX ATM NETWORK</div>
        
        <div className={styles.atmScreen}>
          {isSuccess ? (
            <div className={styles.successOverlay}>
              <div className={styles.successText}>
                PLEASE TAKE YOUR CASH<br/><br/>
                ${receiptData.amount}<br/>
                DISPENSED FROM {receiptData.account.toUpperCase()}<br/><br/>
                REF: {receiptData.ref}
              </div>
              <button className={styles.receiptBtn} onClick={handleCancel}>
                RETURN TO MENU (TAKE RECEIPT)
              </button>
            </div>
          ) : (
            <>
              <div className={styles.screenTitle}>CASH WITHDRAWAL</div>
              
              <div className={styles.screenContent}>
                <select 
                  className={styles.accountSelect}
                  value={selectedAccount}
                  onChange={(e) => setSelectedAccount(e.target.value)}
                >
                  {accounts.map(acc => (
                    <option key={acc.id} value={acc.id}>
                      {acc.name} ({acc.mask}) - {acc.balance}
                    </option>
                  ))}
                </select>

                <div className={styles.amountDisplay}>
                  <span>$</span> {amount}
                </div>
                {error && <div className={styles.errorText}>{error}</div>}
              </div>

              <div className={styles.screenFooter}>
                <div style={{display: 'flex', flexDirection: 'column', gap: '20px'}}>
                  <div className={`${styles.screenBtn} ${styles.left}`} onClick={() => handleQuickCash(20)} style={{cursor: 'pointer'}}> $20</div>
                  <div className={`${styles.screenBtn} ${styles.left}`} onClick={() => handleQuickCash(60)} style={{cursor: 'pointer'}}> $60</div>
                </div>
                <div style={{display: 'flex', flexDirection: 'column', gap: '20px', alignItems: 'flex-end'}}>
                  <div className={`${styles.screenBtn} ${styles.right}`} onClick={() => handleQuickCash(100)} style={{cursor: 'pointer'}}>$100 </div>
                  <div className={`${styles.screenBtn} ${styles.right}`} onClick={() => handleQuickCash(200)} style={{cursor: 'pointer'}}>$200 </div>
                </div>
              </div>
            </>
          )}
        </div>

        <div className={styles.hardwarePanel}>
          <div className={styles.keypad}>
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
              <div key={num} className={styles.keyBtn} onClick={() => handleKeyPress(num.toString())}>
                {num}
              </div>
            ))}
            <div className={styles.keyBtn} onClick={() => handleKeyPress('0')}>0</div>
            <div className={styles.keyBtn} onClick={() => handleKeyPress('CLEAR')}>CLR</div>
          </div>
          
          <div className={styles.actionPad}>
            <button className={`${styles.actionBtn} ${styles.btnCancel}`} onClick={handleCancel}>
              CANCEL
            </button>
            <button className={`${styles.actionBtn} ${styles.btnConfirm}`} onClick={handleConfirm}>
              CONFIRM
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
