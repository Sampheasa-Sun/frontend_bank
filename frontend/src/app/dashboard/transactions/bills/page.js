'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Wifi, Zap, MonitorPlay, Dumbbell, AlertCircle, CheckCircle, ArrowRight } from 'lucide-react';
import styles from './bills.module.css';

const DEFAULT_BILLS = [
  {
    id: 'BILL-001',
    biller: 'Pacific Gas & Electric',
    type: 'Utilities',
    amount: 145.20,
    dueDate: (() => { const d = new Date(); d.setDate(d.getDate() - 2); return d.toISOString().split('T')[0]; })(),
    status: 'UNPAID',
    icon: 'zap'
  },
  {
    id: 'BILL-002',
    biller: 'Comcast Xfinity',
    type: 'Internet',
    amount: 89.99,
    dueDate: (() => { const d = new Date(); d.setDate(d.getDate() + 5); return d.toISOString().split('T')[0]; })(),
    status: 'UNPAID',
    icon: 'wifi'
  },
  {
    id: 'BILL-003',
    biller: 'Netflix',
    type: 'Subscription',
    amount: 19.99,
    dueDate: (() => { const d = new Date(); d.setDate(d.getDate() + 12); return d.toISOString().split('T')[0]; })(),
    status: 'UNPAID',
    icon: 'monitor'
  },
  {
    id: 'BILL-004',
    biller: 'Equinox Gym',
    type: 'Membership',
    amount: 250.00,
    dueDate: (() => { const d = new Date(); d.setDate(d.getDate() + 15); return d.toISOString().split('T')[0]; })(),
    status: 'UNPAID',
    icon: 'dumbbell'
  }
];

export default function BillsPage() {
  const [bills, setBills] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [selectedBill, setSelectedBill] = useState(null);
  const [selectedAccount, setSelectedAccount] = useState('');

  useEffect(() => {
    // Load bills
    let savedBills = JSON.parse(localStorage.getItem('user_bills') || 'null');
    if (!savedBills) {
      savedBills = DEFAULT_BILLS;
      localStorage.setItem('user_bills', JSON.stringify(savedBills));
    }
    setBills(savedBills);

    // Load accounts
    const savedAccounts = JSON.parse(localStorage.getItem('user_accounts') || '[]');
    setAccounts(savedAccounts);
    if (savedAccounts.length > 0) {
      setSelectedAccount(savedAccounts[0].id);
    }
  }, []);

  const getBillerIcon = (iconName) => {
    switch (iconName) {
      case 'zap': return <Zap size={24} />;
      case 'wifi': return <Wifi size={24} />;
      case 'monitor': return <MonitorPlay size={24} />;
      case 'dumbbell': return <Dumbbell size={24} />;
      default: return <Zap size={24} />;
    }
  };

  const isOverdue = (dateStr) => {
    const due = new Date(dateStr);
    due.setHours(0, 0, 0, 0);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return due < today;
  };

  const handlePayBill = (e) => {
    e.preventDefault();
    if (!selectedBill || !selectedAccount) return;

    // Deduct from account
    const accIndex = accounts.findIndex(a => a.id === selectedAccount);
    if (accIndex === -1) return;

    const currentBalanceStr = accounts[accIndex].balance.replace(/[^0-9.-]+/g,"");
    const currentBalance = parseFloat(currentBalanceStr);
    
    if (currentBalance < selectedBill.amount) {
      alert("Insufficient funds in the selected account.");
      return;
    }

    const newBalance = currentBalance - selectedBill.amount;
    const updatedAccounts = [...accounts];
    updatedAccounts[accIndex].balance = `$${newBalance.toLocaleString('en-US', {minimumFractionDigits: 2})}`;
    
    setAccounts(updatedAccounts);
    localStorage.setItem('user_accounts', JSON.stringify(updatedAccounts));

    // Record transaction
    const storedTxs = JSON.parse(localStorage.getItem('user_transactions') || '[]');
    const newTx = {
      id: `TRX-${Math.floor(10000000 + Math.random() * 90000000)}`,
      merchant: selectedBill.biller,
      category: 'Bill Payment',
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      ref: `REF-${Math.floor(10000000 + Math.random() * 90000000)}`,
      status: 'Cleared',
      amount: `-$${selectedBill.amount.toLocaleString('en-US', {minimumFractionDigits: 2})}`,
      type: 'negative',
      iconType: 'transfer',
      fromAccount: updatedAccounts[accIndex].name,
      description: `Bill Payment to ${selectedBill.biller}`
    };
    localStorage.setItem('user_transactions', JSON.stringify([newTx, ...storedTxs]));

    // Update bill status
    const updatedBills = bills.map(b => 
      b.id === selectedBill.id 
        ? { ...b, status: 'PAID', paidDate: new Date().toISOString().split('T')[0] } 
        : b
    );
    setBills(updatedBills);
    localStorage.setItem('user_bills', JSON.stringify(updatedBills));

    setSelectedBill(null);
  };

  return (
    <div className={styles.pageContainer}>
      <div className={styles.headerContainer}>
        <Link href="/dashboard/transactions" className={styles.backLink}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="19" y1="12" x2="5" y2="12"></line>
            <polyline points="12 19 5 12 12 5"></polyline>
          </svg>
          Back to Transactions
        </Link>
        <div>
          <h1 className={styles.heading}>Bills & Subscriptions</h1>
          <p className={styles.subText}>Manage your upcoming payments and active subscriptions.</p>
        </div>
      </div>

      <div className={styles.billsGrid}>
        {bills.map(bill => (
          <div key={bill.id} className={styles.billCard}>
            <div className={styles.cardTop}>
              <div className={styles.billerInfo}>
                <div className={styles.billerIconBox}>
                  {getBillerIcon(bill.icon)}
                </div>
                <div className={styles.billerText}>
                  <span className={styles.billerName}>{bill.biller}</span>
                  <span className={styles.billerType}>{bill.type}</span>
                </div>
              </div>
              <span className={`${styles.statusBadge} ${bill.status === 'PAID' ? styles.statusPaid : styles.statusPending}`}>
                {bill.status}
              </span>
            </div>

            <div className={styles.cardMiddle}>
              <div style={{display: 'flex', flexDirection: 'column'}}>
                <span className={styles.amountLabel}>AMOUNT DUE</span>
                <span className={styles.amountValue}>${bill.amount.toFixed(2)}</span>
              </div>
              {bill.status !== 'PAID' ? (
                <div className={`${styles.dueDateInfo} ${isOverdue(bill.dueDate) ? styles.overdue : ''}`}>
                  {isOverdue(bill.dueDate) ? <AlertCircle size={16} /> : null}
                  {isOverdue(bill.dueDate) ? 'Overdue' : 'Due'} {new Date(bill.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </div>
              ) : (
                <div className={styles.dueDateInfo} style={{ color: '#16A34A' }}>
                  <CheckCircle size={16} />
                  Paid on {new Date(bill.paidDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </div>
              )}
            </div>

            <div className={styles.cardBottom}>
              {bill.status !== 'PAID' ? (
                <>
                  <button className={styles.payBtn} onClick={() => setSelectedBill(bill)}>
                    Pay Now <ArrowRight size={16} />
                  </button>
                  <button className={styles.autopayBtn}>
                    Auto-Pay
                  </button>
                </>
              ) : (
                <span className={styles.paidText}>No action required</span>
              )}
            </div>
          </div>
        ))}
      </div>

      {selectedBill && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalDialog}>
            <h3 className={styles.modalTitle}>Pay Bill: {selectedBill.biller}</h3>
            
            <form onSubmit={handlePayBill}>
              <div className={styles.formGroup}>
                <label className={styles.label}>Amount</label>
                <input 
                  type="text" 
                  className={styles.selectInput} 
                  value={`$${selectedBill.amount.toFixed(2)}`} 
                  disabled 
                  style={{ background: '#F3F4F6' }}
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Pay From</label>
                <select 
                  className={styles.selectInput}
                  value={selectedAccount}
                  onChange={(e) => setSelectedAccount(e.target.value)}
                  required
                >
                  {accounts.map(acc => (
                    <option key={acc.id} value={acc.id}>
                      {acc.name} ({acc.balance})
                    </option>
                  ))}
                </select>
              </div>

              <div className={styles.btnGroup}>
                <button type="button" className={styles.cancelBtn} onClick={() => setSelectedBill(null)}>
                  Cancel
                </button>
                <button type="submit" className={styles.primaryBtn}>
                  Confirm Payment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
