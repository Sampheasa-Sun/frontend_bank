'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowRight, CheckCircle, ChevronDown, Download } from 'lucide-react';
import styles from './deposit.module.css';
import { generateReceipt } from '../../../../utils/generateReceipt';

export default function CashDeposit() {
  const [accounts, setAccounts] = useState([]);
  const [selectedAccount, setSelectedAccount] = useState('');
  const [amount, setAmount] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [receiptData, setReceiptData] = useState(null);

  useEffect(() => {
    const storedAccounts = JSON.parse(localStorage.getItem('user_accounts') || '[]');
    setAccounts(storedAccounts.filter(a => !a.type.toLowerCase().includes('fixed') && !a.type.toLowerCase().includes('loan')));
    if (storedAccounts.length > 0) {
      setSelectedAccount(storedAccounts[0].id);
    }
  }, []);

  const handleDeposit = (e) => {
    e.preventDefault();
    if (!amount || isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) return;

    const depositAmount = parseFloat(amount);
    const storedAccounts = JSON.parse(localStorage.getItem('user_accounts') || '[]');
    const accIndex = storedAccounts.findIndex(a => a.id === selectedAccount);
    
    if (accIndex !== -1) {
      const currentBalance = parseFloat(storedAccounts[accIndex].balance.replace(/[^0-9.-]+/g, ""));
      const newBalance = currentBalance + depositAmount;
      storedAccounts[accIndex].balance = `$${newBalance.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;
      localStorage.setItem('user_accounts', JSON.stringify(storedAccounts));

      // Log transaction
      const storedTxs = JSON.parse(localStorage.getItem('user_transactions') || '[]');
      const refNumber = `TRX-${Math.floor(10000 + Math.random() * 90000)}-CASH`;
      const newTx = {
        id: refNumber,
        merchant: 'Cash Deposit',
        category: 'Deposit',
        date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        ref: refNumber,
        status: 'Cleared',
        amount: `+$${depositAmount.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`,
        type: 'positive',
        iconType: 'transfer',
        fromAccount: 'Physical Branch',
        description: 'Cash deposit at branch'
      };
      localStorage.setItem('user_transactions', JSON.stringify([newTx, ...storedTxs]));

      setReceiptData({
        newBalance: storedAccounts[accIndex].balance,
        ref: refNumber
      });
      setIsSuccess(true);
    }
  };

  return (
    <div className={styles.pageContainer}>
      <div className={styles.centerColumn}>
        <div className={styles.headerSection}>
          <h2 className={styles.pageTitle}>Cash Deposit</h2>
          <p className={styles.pageSubtitle}>Securely record incoming cash transactions to designated accounts.</p>
        </div>

        {!isSuccess ? (
          <div className={styles.depositCard}>
            <form onSubmit={handleDeposit}>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>To Account</label>
                <div className={styles.selectWrapper}>
                  <select 
                    className={styles.selectInput}
                    value={selectedAccount}
                    onChange={(e) => setSelectedAccount(e.target.value)}
                    required
                  >
                    {accounts.map(acc => (
                      <option key={acc.id} value={acc.id}>
                        {acc.name} {acc.mask || ''} ({acc.balance})
                      </option>
                    ))}
                  </select>
                  <ChevronDown className={styles.selectIcon} size={20} />
                </div>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Deposit Amount</label>
                <div className={styles.amountGroup}>
                  <span className={styles.currencyPrefix}>$</span>
                  <input 
                    type="number"
                    step="0.01"
                    min="0.01"
                    className={styles.amountInput}
                    placeholder="0.00"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    required
                  />
                  <div className={styles.currencySuffix}>USD</div>
                </div>
              </div>

              <div className={styles.actionsRow}>
                <Link href="/dashboard/transactions" className={styles.cancelLink}>Cancel</Link>
                <button type="submit" className={styles.confirmBtn}>
                  Confirm Deposit <ArrowRight size={16} />
                </button>
              </div>
            </form>
          </div>
        ) : (
          <div className={styles.successPanel}>
            <div className={styles.successHeader}>
              <CheckCircle className={styles.successIcon} size={28} />
              <div>
                <h3 className={styles.successTitle}>Deposit Successful</h3>
                <p className={styles.successSubtitle}>Funds have been securely credited to the account.</p>
              </div>
            </div>

            <div className={styles.successDetailsCard}>
              <div className={`${styles.detailRow} ${styles.detailRowBordered}`}>
                <span className={styles.detailLabel}>New Available Balance</span>
                <span className={styles.detailValue}>{receiptData?.newBalance} USD</span>
              </div>
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>Reference Number</span>
                <span className={styles.detailValueRef}>{receiptData?.ref}</span>
              </div>
            </div>

            <button 
              className={styles.receiptBtn} 
              onClick={() => {
                generateReceipt('Cash Deposit', {
                  'New Available Balance': receiptData?.newBalance + ' USD',
                  'Reference Number': receiptData?.ref,
                  'Account': accounts.find(a => a.id === selectedAccount)?.name || 'Account'
                });
              }}
            >
              <Download size={16} />
              Download Receipt
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
