'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ChevronDown, AlertCircle, Info, Banknote, CheckCircle, X, Download } from 'lucide-react';
import styles from './withdraw.module.css';
import { generateReceipt } from '../../../../utils/generateReceipt';

export default function CashWithdrawal() {
  const router = useRouter();
  const [accounts, setAccounts] = useState([]);
  const [selectedAccount, setSelectedAccount] = useState('');
  const [amount, setAmount] = useState('');
  const [error, setError] = useState('');
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [receiptData, setReceiptData] = useState(null);

  // Dummy daily limit logic matching Figma
  const dailyLimit = 10000;

  useEffect(() => {
    const storedAccounts = JSON.parse(localStorage.getItem('user_accounts') || '[]');
    setAccounts(storedAccounts.filter(a => !a.type.toLowerCase().includes('fixed') && !a.type.toLowerCase().includes('loan')));
    if (storedAccounts.length > 0) {
      setSelectedAccount(storedAccounts[0].id);
    }
  }, []);

  const handleWithdraw = (e) => {
    e.preventDefault();
    setError('');

    if (!amount || isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) return;

    const withdrawAmount = parseFloat(amount);
    
    if (withdrawAmount > dailyLimit) {
      setError(`Amount exceeds daily withdrawal limit of $${dailyLimit.toLocaleString()}.`);
      return;
    }

    const storedAccounts = JSON.parse(localStorage.getItem('user_accounts') || '[]');
    const accIndex = storedAccounts.findIndex(a => a.id === selectedAccount);
    
    if (accIndex !== -1) {
      const currentBalance = parseFloat(storedAccounts[accIndex].balance.replace(/[^0-9.-]+/g, ""));
      
      if (withdrawAmount > currentBalance) {
        setError('Insufficient funds in the selected account.');
        return;
      }

      const newBalance = currentBalance - withdrawAmount;
      storedAccounts[accIndex].balance = `$${newBalance.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;
      localStorage.setItem('user_accounts', JSON.stringify(storedAccounts));

      // Log transaction
      const storedTxs = JSON.parse(localStorage.getItem('user_transactions') || '[]');
      const refNumber = `TRX-${Math.floor(10000 + Math.random() * 90000)}-WD`;
      const newTx = {
        id: refNumber,
        merchant: 'Cash Withdrawal',
        category: 'Withdrawal',
        date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        ref: refNumber,
        status: 'Cleared',
        amount: `-$${withdrawAmount.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`,
        type: 'negative',
        iconType: 'transfer',
        fromAccount: storedAccounts[accIndex].name,
        description: 'Cash withdrawal at branch/ATM'
      };
      localStorage.setItem('user_transactions', JSON.stringify([newTx, ...storedTxs]));

      setReceiptData({
        amount: withdrawAmount,
        ref: refNumber,
        newBalance: storedAccounts[accIndex].balance
      });
      setShowSuccessModal(true);
    }
  };

  const getSelectedAccountBalance = () => {
    const acc = accounts.find(a => a.id === selectedAccount);
    return acc ? acc.balance : '$0.00';
  };

  return (
    <div className={styles.pageContainer}>
      <div className={styles.withdrawCard}>
        <div className={styles.cardHeader}>
          <div className={styles.headerText}>
            <h2 className={styles.cardTitle}>Cash Withdrawal</h2>
            <p className={styles.cardSubtitle}>Initiate a secure cash transfer from your accounts.</p>
          </div>
          <div className={styles.headerIconBox}>
            <Banknote size={24} />
          </div>
        </div>

        <form onSubmit={handleWithdraw}>
          <div className={styles.formGroup} style={{ marginBottom: '24px' }}>
            <label className={styles.formLabel}>From Account</label>
            <div className={styles.selectWrapper}>
              <select 
                className={styles.selectInput}
                value={selectedAccount}
                onChange={(e) => {
                  setSelectedAccount(e.target.value);
                  setError('');
                }}
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
            <span className={styles.balanceNotice}>
              <Info size={12} /> Available Balance: {getSelectedAccountBalance()}
            </span>
          </div>

          <div className={styles.formGroup} style={{ marginBottom: '24px' }}>
            <div className={styles.labelRow}>
              <label className={styles.formLabel}>Withdrawal Amount</label>
              <span className={styles.formLabelSub}>Max: ${dailyLimit.toLocaleString()}/day</span>
            </div>
            <div className={`${styles.amountGroup} ${error ? styles.amountGroupError : ''}`}>
              <div className={styles.currencyPrefix}>USD</div>
              <input 
                type="number"
                step="0.01"
                min="0.01"
                className={styles.amountInput}
                placeholder="1500"
                value={amount}
                onChange={(e) => {
                  setAmount(e.target.value);
                  if (error) setError('');
                }}
                required
              />
              {error && <AlertCircle className={styles.errorIcon} size={20} />}
            </div>
            {error && <span className={styles.errorText}>{error}</span>}
          </div>

          <div className={styles.actionsRow}>
            <Link href="/dashboard/transactions" className={styles.cancelLink}>Cancel</Link>
            <button type="submit" className={styles.confirmBtn}>
              Confirm Withdrawal
            </button>
          </div>
        </form>
      </div>

      {showSuccessModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.successModal}>
            <div className={styles.modalHeader}>
              <div className={styles.modalIconBox}>
                <CheckCircle size={24} />
              </div>
              <button className={styles.closeBtn} onClick={() => router.push('/dashboard/transactions')}>
                <X size={20} />
              </button>
            </div>
            
            <h3 className={styles.modalTitle}>Withdrawal Successful</h3>
            <p className={styles.modalSubtitle}>Funds have been successfully withdrawn from your account.</p>
            
            <div className={styles.modalDetails}>
              <div className={styles.modalDetailRow}>
                <span className={styles.modalDetailLabel}>Amount Withdrawn</span>
                <span className={styles.modalDetailValue}>${receiptData?.amount?.toLocaleString('en-US', {minimumFractionDigits: 2})} USD</span>
              </div>
              <div className={styles.modalDetailRow}>
                <span className={styles.modalDetailLabel}>New Balance</span>
                <span className={styles.modalDetailValue}>{receiptData?.newBalance}</span>
              </div>
              <div className={styles.modalDetailRow} style={{borderBottom: 'none'}}>
                <span className={styles.modalDetailLabel}>Ref Number</span>
                <span className={styles.modalDetailValueRef}>{receiptData?.ref}</span>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
              <button 
                className={styles.modalReceiptBtn} 
                onClick={() => {
                  generateReceipt('Cash Withdrawal', {
                    'Amount Withdrawn': '$' + receiptData?.amount?.toLocaleString('en-US', {minimumFractionDigits: 2}) + ' USD',
                    'New Balance': receiptData?.newBalance,
                    'Reference Number': receiptData?.ref,
                    'Account': accounts.find(a => a.id === selectedAccount)?.name || 'Account'
                  });
                }}
              >
                <Download size={16} />
                Receipt
              </button>
              <button className={styles.modalActionBtn} onClick={() => router.push('/dashboard/transactions')}>
                Back to Transactions
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
