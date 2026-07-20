'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import styles from './deposit.module.css';

export default function DepositPage() {
  const router = useRouter();
  const [accounts, setAccounts] = useState([]);
  const [selectedAccount, setSelectedAccount] = useState('');
  const [amount, setAmount] = useState('0');
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
    setAmount(val.toString());
  };

  const handleConfirm = () => {
    if (isSuccess || amount === '0') return;

    const depositAmount = parseFloat(amount);
    
    // Process deposit
    const storedAccounts = JSON.parse(localStorage.getItem('user_accounts') || '[]');
    const accIndex = storedAccounts.findIndex(a => a.id === selectedAccount);
    
    if (accIndex !== -1) {
      const currentBalanceStr = storedAccounts[accIndex].balance.replace(/[^0-9.-]+/g,"");
      const currentBalance = parseFloat(currentBalanceStr);
      const newBalance = currentBalance + depositAmount;
      
      storedAccounts[accIndex].balance = `$${newBalance.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;
      localStorage.setItem('user_accounts', JSON.stringify(storedAccounts));

      // Record transaction
      const storedTxs = JSON.parse(localStorage.getItem('user_transactions') || '[]');
      const newTx = {
        id: `TRX-${Math.floor(10000000 + Math.random() * 90000000)}`,
        merchant: 'Cash Deposit',
        category: 'Deposit',
        date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        ref: `DEP-${Math.floor(10000000 + Math.random() * 90000000)}`,
        status: 'Cleared',
        amount: `+$${depositAmount.toFixed(2)}`,
        type: 'positive',
        iconType: 'transfer',
        fromAccount: 'Physical Branch/ATM',
        description: 'Cash deposit at ATM'
      };
      localStorage.setItem('user_transactions', JSON.stringify([newTx, ...storedTxs]));

      setReceiptData({
        amount: depositAmount.toFixed(2),
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
                DEPOSIT SUCCESSFUL<br/><br/>
                ${receiptData.amount}<br/>
                ADDED TO {receiptData.account.toUpperCase()}<br/><br/>
                REF: {receiptData.ref}
              </div>
              <button className={styles.receiptBtn} onClick={handleCancel}>
                RETURN TO MENU (TAKE RECEIPT)
              </button>
            </div>
          ) : (
            <>
              <div className={styles.screenTitle}>CASH DEPOSIT</div>
              
              <div className={styles.screenContent}>
                <select 
                  className={styles.accountSelect}
                  value={selectedAccount}
                  onChange={(e) => setSelectedAccount(e.target.value)}
                >
                  {accounts.map(acc => (
                    <option key={acc.id} value={acc.id}>
                      {acc.name} ({acc.mask})
                    </option>
                  ))}
                </select>

                <div className={styles.amountDisplay}>
                  <span>$</span> {amount}
                </div>
              </div>

              <div className={styles.screenFooter}>
                <div style={{display: 'flex', flexDirection: 'column', gap: '20px'}}>
                  <div className={`${styles.screenBtn} ${styles.left}`} onClick={() => handleQuickCash(100)} style={{cursor: 'pointer'}}> $100</div>
                  <div className={`${styles.screenBtn} ${styles.left}`} onClick={() => handleQuickCash(500)} style={{cursor: 'pointer'}}> $500</div>
                </div>
                <div style={{display: 'flex', flexDirection: 'column', gap: '20px', alignItems: 'flex-end'}}>
                  <div className={`${styles.screenBtn} ${styles.right}`} onClick={() => handleQuickCash(1000)} style={{cursor: 'pointer'}}>$1000 </div>
                  <div className={`${styles.screenBtn} ${styles.right}`} onClick={() => handleQuickCash(2000)} style={{cursor: 'pointer'}}>$2000 </div>
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
