'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import styles from './details.module.css';
import { MOCK_TRANSACTIONS, generateTransactions } from '../../transactions/mockData';

export default function AccountDetails() {
  const router = useRouter();
  const params = useParams();
  const [account, setAccount] = useState(null);
  const [allAccounts, setAllAccounts] = useState([]);
  const [menuOpen, setMenuOpen] = useState(false);
  const [modalType, setModalType] = useState(null);
  const [editName, setEditName] = useState('');
  const [transactions, setTransactions] = useState([]);
  const menuRef = useRef(null);

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem('user_accounts') || '[]');
    setAllAccounts(saved);
    const acc = saved.find(a => a.id === params.id);
    if (acc) setAccount(acc);

    // Verify any approved loans have a corresponding loan funding transaction in localStorage
    const savedApprovals = JSON.parse(localStorage.getItem('loan_approvals') || '{}');
    let stored = JSON.parse(localStorage.getItem('user_transactions') || '[]');
    let modified = false;

    Object.keys(savedApprovals).forEach(loanId => {
      if (savedApprovals[loanId] === 'approved') {
        const fundingTxId = `TRX-LOAN-${loanId}`;
        if (!stored.some(t => t.id === fundingTxId)) {
          const matchedAcct = saved.find(a => a.id === `loan-${loanId}`);
          const amount = matchedAcct ? matchedAcct.balance.replace('$', '') : '15,000.00';
          const name = matchedAcct ? matchedAcct.name : 'Personal Consolidation Loan';

          const newTx = {
            id: fundingTxId,
            merchant: 'Equinox Bank (Loan Funding)',
            category: 'Deposit',
            date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
            time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
            ref: `REF-${Math.floor(10000000 + Math.random() * 90000000)}`,
            status: 'Cleared',
            amount: `+$${amount}`,
            type: 'positive',
            iconType: 'transfer',
            fromAccount: name
          };
          stored.unshift(newTx);
          modified = true;
        }
      }
    });

    if (modified) {
      localStorage.setItem('user_transactions', JSON.stringify(stored));
    }

    // Only load general mock transactions for pre-existing accounts, not newly created ones
    const isNewAccount = params.id.startsWith('loan-') || params.id.startsWith('new-');
    const accObj = saved.find(a => a.id === params.id);
    
    if (isNewAccount) {
      // New accounts only show their specific transactions (like loan funding or transfers)
      const filtered = accObj
        ? stored.filter(t => t.fromAccount === accObj.name)
        : [];
      setTransactions(filtered);
    } else {
      const generated = generateTransactions(100);
      const all = [...stored, ...MOCK_TRANSACTIONS, ...generated];
      // Filter: if the account has a name-based match in fromAccount field, use that;
      // otherwise show all (for legacy accounts without fromAccount tagging)
      const filtered = accObj
        ? all.filter(t => !t.fromAccount || t.fromAccount === accObj.name)
        : all;
      setTransactions(filtered.slice(0, 5));
    }

    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [params.id]);

  const handleDeleteClick = () => {
    setMenuOpen(false);
    if (allAccounts.length <= 1) {
      setModalType('delete-error');
    } else {
      setModalType('delete-confirm');
    }
  };

  const confirmDelete = () => {
    const newAccounts = allAccounts.filter(a => a.id !== params.id);
    localStorage.setItem('user_accounts', JSON.stringify(newAccounts));
    router.push('/dashboard/accounts');
  };

  const handleMakeDefault = () => {
    setMenuOpen(false);
    localStorage.setItem('default_account_id', params.id);
    alert('Account marked as default. The dashboard will now display this balance.');
  };

  const handleEditClick = () => {
    setMenuOpen(false);
    setEditName(account ? account.name : '');
    setModalType('edit-name');
  };

  const confirmEdit = () => {
    const newAccounts = allAccounts.map(a => a.id === params.id ? { ...a, name: editName } : a);
    localStorage.setItem('user_accounts', JSON.stringify(newAccounts));
    setAllAccounts(newAccounts);
    setAccount(newAccounts.find(a => a.id === params.id));
    setModalType(null);
  };

  const handleDownloadStatement = () => {
    const mockTransactionsData = [
      ['Date', 'Description', 'Amount', 'Status'],
      ['Oct 24, 2023', 'Equinox Wealth Management', '-$2,500.00', 'Completed'],
      ['Oct 22, 2023', 'ACH Deposit - ACME Corp', '+$14,250.00', 'Completed'],
      ['Oct 20, 2023', 'Amex Platinum Payment', '-$4,120.55', 'Pending'],
      ['Oct 18, 2023', 'Wire Transfer - Inbound', '+$50,000.00', 'Completed'],
      ['Oct 15, 2023', 'Le Bernardin', '-$485.00', 'Completed'],
    ];

    const csvContent = mockTransactionsData.map(e => e.map(item => `"${item}"`).join(",")).join("\n");
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Statement_${account ? account.name.replace(/\s+/g, '_') : 'Account'}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  return (
    <div className={styles.pageContainer}>
      
      <Link href="/dashboard/accounts" className={styles.backLink}>
        <svg className={styles.backIcon} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="19" y1="12" x2="5" y2="12"></line>
          <polyline points="12 19 5 12 12 5"></polyline>
        </svg>
        Back to Accounts
      </Link>

      <div className={styles.topCard}>
        <div className={styles.topCardHeader}>
          <div style={{display: 'flex', alignItems: 'center', gap: '16px'}}>
            <h1 className={styles.accountTitle}>{account ? account.name : 'Premier Checking'}</h1>
            {account && account.type !== 'Loan Account' && (
              <span className={styles.accountMask}>{account.mask}</span>
            )}
            <div className={styles.activeBadge}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" style={{marginRight: '4px'}}>
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
              Active
            </div>
          </div>

          <div className={styles.menuContainer} ref={menuRef}>
            <button className={styles.dotsBtn} onClick={() => setMenuOpen(!menuOpen)}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="5" r="1"></circle>
                <circle cx="12" cy="12" r="1"></circle>
                <circle cx="12" cy="19" r="1"></circle>
              </svg>
            </button>
            
            {menuOpen && (
              <div className={styles.dropdownMenu}>
                <button className={styles.dropdownItem} onClick={handleEditClick}>
                  Edit Account Name
                </button>
                <button className={styles.dropdownItem} onClick={handleMakeDefault}>
                  Make Default
                </button>
                <button className={`${styles.dropdownItem} ${styles.dropdownItemDanger}`} onClick={handleDeleteClick}>
                  Delete Account
                </button>
              </div>
            )}
          </div>
        </div>

        <div className={styles.balanceSection}>
          <span className={styles.balanceLabel}>Available Balance</span>
          <div className={styles.balanceValueArea}>
            <span className={styles.mainBalance}>{account ? account.balance : '$124,592.00'}</span>
            <span className={styles.equivalentBalance}>{account && account.equivalent && account.equivalent !== '≈ 0 KHR' ? account.equivalent : '≈ €115,247.60 EUR'}</span>
          </div>
        </div>
      </div>

      <div className={styles.actionsGrid}>
        <Link href="/dashboard/transactions/transfer" className={styles.actionBtn}>
          <div className={styles.actionIconBox}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="16 3 21 3 21 8"></polyline>
              <line x1="4" y1="20" x2="21" y2="3"></line>
              <polyline points="21 16 21 21 16 21"></polyline>
              <line x1="15" y1="15" x2="21" y2="21"></line>
              <line x1="4" y1="4" x2="9" y2="9"></line>
            </svg>
          </div>
          <span className={styles.actionText}>Transfer</span>
        </Link>
        <div className={styles.actionBtn} onClick={handleDownloadStatement}>
          <div className={styles.actionIconBox}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
              <polyline points="14 2 14 8 20 8"></polyline>
              <line x1="16" y1="13" x2="8" y2="13"></line>
              <line x1="16" y1="17" x2="8" y2="17"></line>
              <polyline points="10 9 9 9 8 9"></polyline>
            </svg>
          </div>
          <span className={styles.actionText}>Download Statement</span>
        </div>
      </div>

      <div className={styles.mainLayout}>
        <div className={styles.leftColumn}>
          <div className={styles.transactionsCard}>
            <div className={styles.transactionsHeader}>
              <h2 className={styles.transactionsTitle}>Recent Transactions</h2>
            </div>

            {transactions.length === 0 ? (
              <div className={styles.emptyTransactions}>
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#C3C6D5" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                  <polyline points="14 2 14 8 20 8"></polyline>
                  <line x1="16" y1="13" x2="8" y2="13"></line>
                  <line x1="16" y1="17" x2="8" y2="17"></line>
                </svg>
                <p className={styles.emptyTransactionsText}>No transactions yet</p>
                <p className={styles.emptyTransactionsSub}>Transactions will appear here once activity begins on this account.</p>
              </div>
            ) : (
              <>
                <div className={styles.tableHeader}>
                  <span className={styles.tableHeaderCell}>DATE</span>
                  <span className={styles.tableHeaderCell}>DESCRIPTION</span>
                  <span className={styles.tableHeaderCell}>AMOUNT</span>
                  <span className={styles.tableHeaderCell} style={{textAlign: 'right'}}>STATUS</span>
                </div>

                {transactions.map((t, i) => (
                  <div key={i} className={styles.transactionRow}>
                    <span className={styles.cellDate}>{t.date}</span>
                    <div className={styles.cellDesc}>
                      <div className={styles.descIconBox}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                        </svg>
                      </div>
                      {t.merchant}
                    </div>
                    <span className={t.type === 'positive' ? styles.cellAmountPos : styles.cellAmountNeg}>{t.amount}</span>
                    <div className={styles.cellStatus}>
                      <span className={t.status === 'Cleared' ? styles.statusCompleted : t.status === 'Pending' ? styles.statusPending : styles.statusProcessing}>
                        {t.status}
                      </span>
                    </div>
                  </div>
                ))}

                <Link href={`/dashboard/transactions?account=${params.id}`} className={styles.viewAllLink}>
                  View All Transactions
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{marginLeft: '4px'}}>
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                    <polyline points="12 5 19 12 12 19"></polyline>
                  </svg>
                </Link>
              </>
            )}
          </div>
        </div>

        <div className={styles.rightColumn}>
          <div className={styles.detailsCard}>
            <h3 className={styles.detailsTitle}>Account Details</h3>
            
            <div className={styles.detailGroup}>
              <span className={styles.detailLabel}>ACCOUNT NUMBER</span>
              <div className={styles.detailValue}>
                {account ? account.accountNumber : '0048291048299102'}
                <svg className={styles.copyIcon} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                </svg>
              </div>
            </div>

            <div className={styles.detailGroup}>
              <span className={styles.detailLabel}>ROUTING NUMBER</span>
              <div className={styles.detailValue}>{account && account.type === 'Loan Account' ? 'N/A' : '122000661'}</div>
            </div>

            <div className={styles.detailRow}>
              <div className={styles.detailGroup} style={{marginBottom: 0}}>
                <span className={styles.detailLabel}>TYPE</span>
                <div className={styles.detailValue}>{account ? account.type : 'Checking'}</div>
              </div>
              <div className={styles.detailGroup} style={{marginBottom: 0}}>
                <span className={styles.detailLabel}>CURRENCY</span>
                <div className={styles.detailValue}>USD</div>
              </div>
            </div>

            <div className={styles.detailRow}>
              <div className={styles.detailGroup} style={{marginBottom: 0}}>
                <span className={styles.detailLabel}>INTEREST RATE</span>
                <div className={styles.detailValue}>{account && account.type === 'Loan Account' ? 'N/A' : '0.50% APY'}</div>
              </div>
              <div className={styles.detailGroup} style={{marginBottom: 0}}>
                <span className={styles.detailLabel}>MAINT. FEE</span>
                <div className={styles.detailValue}>$0.00</div>
              </div>
            </div>

            <div className={styles.detailGroup}>
              <span className={styles.detailLabel}>DATE OPENED</span>
              <div className={styles.detailValue}>{account && account.type === 'Loan Account' ? 'Recently Opened' : 'March 12, 2018'}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      {modalType && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            
            {modalType === 'delete-error' && (
              <>
                <div className={styles.modalHeader}>
                  <h3 className={styles.modalTitle}>Cannot Delete Account</h3>
                  <button className={styles.closeBtn} onClick={() => setModalType(null)}>×</button>
                </div>
                <div className={styles.modalBody}>
                  <p>You cannot delete your only remaining account. A minimum of one active account is required to keep your profile open and manage your funds.</p>
                </div>
                <div className={styles.modalFooter}>
                  <button className={styles.primaryBtn} onClick={() => setModalType(null)}>Understood</button>
                </div>
              </>
            )}

            {modalType === 'edit-name' && (
              <>
                <div className={styles.modalHeader}>
                  <h3 className={styles.modalTitle}>Edit Account Name</h3>
                  <button className={styles.closeBtn} onClick={() => setModalType(null)}>×</button>
                </div>
                <div className={styles.modalBody}>
                  <div style={{display: 'flex', flexDirection: 'column', gap: '8px'}}>
                    <label style={{fontFamily: 'Inter', fontWeight: 500, fontSize: '14px', color: '#191B22'}}>Account Name</label>
                    <input 
                      type="text" 
                      value={editName} 
                      onChange={(e) => setEditName(e.target.value)}
                      style={{
                        padding: '12px 16px',
                        fontFamily: 'Inter',
                        fontSize: '16px',
                        color: '#191B22',
                        background: '#FFFFFF',
                        border: '1px solid #C3C6D5',
                        borderRadius: '4px',
                        outline: 'none'
                      }}
                    />
                  </div>
                </div>
                <div className={styles.modalFooter}>
                  <button className={styles.cancelBtn} onClick={() => setModalType(null)}>Cancel</button>
                  <button className={styles.primaryBtn} onClick={confirmEdit} disabled={!editName.trim()}>Save Changes</button>
                </div>
              </>
            )}

            {modalType === 'delete-confirm' && (
              <>
                <div className={styles.modalHeader}>
                  <h3 className={styles.modalTitle}>Delete Account?</h3>
                  <button className={styles.closeBtn} onClick={() => setModalType(null)}>×</button>
                </div>
                <div className={styles.modalBody}>
                  <p>Are you sure you want to delete this account? <strong>This action cannot be undone.</strong></p>
                  <div className={styles.warningBox}>
                    Any remaining balance will be automatically transferred to your default account before closure.
                  </div>
                </div>
                <div className={styles.modalFooter}>
                  <button className={styles.cancelBtn} onClick={() => setModalType(null)}>Cancel</button>
                  <button className={styles.dangerBtn} onClick={confirmDelete}>Delete Account</button>
                </div>
              </>
            )}

          </div>
        </div>
      )}

    </div>
  );
}
