'use client';

import React, { useState, useEffect, useRef, Suspense } from 'react';
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
  const [transferType, setTransferType] = useState(isReadOnly ? 'other' : 'own');
  const [fromAccount, setFromAccount] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  
  const [toAccount, setToAccount] = useState(null);
  const [toDropdownOpen, setToDropdownOpen] = useState(false);
  const toDropdownRef = useRef(null);

  const [toAccountNum, setToAccountNum] = useState(initialToAccount);
  const [recipient, setRecipient] = useState(initialRecipient);
  const [amount, setAmount] = useState(initialAmount);
  const [description, setDescription] = useState('');
  const [swiftCode, setSwiftCode] = useState('');
  const [destinationCurrency, setDestinationCurrency] = useState('EUR');

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
      saved = [{ id: 'checking-1', name: 'Premier Checking', balance: '$24,500.00', mask: '**** 1234', type: 'Checking' }];
    }
    // Exclude Fixed Deposit accounts from transfer source (but allow Loan accounts so users can draw funds)
    const eligible = saved.filter(a => !a.type.toLowerCase().includes('fixed'));
    setAccounts(eligible);
    if (eligible.length > 0) {
      setFromAccount(eligible[0]);
    }

    // Close dropdown on outside click
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
      if (toDropdownRef.current && !toDropdownRef.current.contains(e.target)) {
        setToDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleTransfer = (e) => {
    e.preventDefault();
    if (transferType === 'other' && (!amount || !toAccountNum || !recipient)) return;
    if (transferType === 'own' && (!amount || !toAccount)) return;
    if (transferType === 'intl' && (!amount || !toAccountNum || !recipient || !swiftCode)) return;

    const selectedAcc = fromAccount;
    if (selectedAcc) {
      const balanceNum = parseFloat(selectedAcc.balance.replace(/[^0-9.-]+/g, ""));
      const transferAmount = parseFloat(amount);
      
      if (transferAmount > balanceNum) {
        showModal('Insufficient Funds', `Your account balance is ${selectedAcc.balance}.`);
        return;
      }

      // Process balance updates
      const storedAccounts = JSON.parse(localStorage.getItem('user_accounts') || '[]');
      
      // Update from account
      const fromIndex = storedAccounts.findIndex(a => a.id === selectedAcc.id);
      if (fromIndex !== -1) {
        storedAccounts[fromIndex].balance = `$${(balanceNum - transferAmount).toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;
      }

      // Update to account if it's own transfer
      if (transferType === 'own' && toAccount) {
        const toIndex = storedAccounts.findIndex(a => a.id === toAccount.id);
        if (toIndex !== -1) {
          const toBalanceNum = parseFloat(storedAccounts[toIndex].balance.replace(/[^0-9.-]+/g, ""));
          storedAccounts[toIndex].balance = `$${(toBalanceNum + transferAmount).toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;
        }
      }
      localStorage.setItem('user_accounts', JSON.stringify(storedAccounts));

      // If it's a loan payment, update the loan state
      if (transferType === 'other' && isReadOnly && (toAccountNum.startsWith('LN-') || toAccountNum.startsWith('App-'))) {
        const storedLoansState = JSON.parse(localStorage.getItem('user_loans_state') || '{}');
        const currentState = storedLoansState[toAccountNum] || { repaidAmount: 0, paymentsMade: 0 };
        
        const newRepaidAmount = currentState.repaidAmount + transferAmount;
        const newPaymentsMade = currentState.paymentsMade + 1;
        
        storedLoansState[toAccountNum] = {
          ...currentState,
          repaidAmount: newRepaidAmount,
          paymentsMade: newPaymentsMade,
          lastPaymentDate: new Date().toISOString()
        };
        localStorage.setItem('user_loans_state', JSON.stringify(storedLoansState));
      }
    }
    
    // Save new transaction for the sender
    const newTrxSender = {
      id: `TRX-${Math.floor(10000000 + Math.random() * 90000000)}`,
      merchant: transferType === 'own' ? toAccount.name : recipient,
      category: transferType === 'intl' ? 'International Transfer' : 'Transfer',
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      ref: `REF-${Math.floor(10000000 + Math.random() * 90000000)}`,
      status: 'Cleared',
      amount: `-$${parseFloat(amount).toFixed(2)}`,
      type: 'negative',
      iconType: transferType === 'intl' ? 'globe' : 'transfer',
      fromAccount: fromAccount ? fromAccount.name : '',
      description: description || `Transfer to ${transferType === 'own' ? toAccount.name : toAccountNum}${transferType === 'intl' ? ` (SWIFT: ${swiftCode})` : ''}`
    };

    const storedTrx = JSON.parse(localStorage.getItem('user_transactions') || '[]');
    let updatedTrx = [newTrxSender, ...storedTrx];

    // If it's an internal transfer, also save a receiving transaction for the destination account
    if (transferType === 'own' && toAccount) {
      const newTrxReceiver = {
        id: `TRX-${Math.floor(10000000 + Math.random() * 90000000)}`,
        merchant: fromAccount ? fromAccount.name : 'Internal Transfer',
        category: 'Transfer',
        date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        ref: `REF-${Math.floor(10000000 + Math.random() * 90000000)}`,
        status: 'Cleared',
        amount: `+$${parseFloat(amount).toFixed(2)}`,
        type: 'positive',
        iconType: 'transfer',
        fromAccount: toAccount.name,
        description: description || `Transfer from ${fromAccount ? fromAccount.name : 'Own Account'}`
      };
      updatedTrx = [newTrxReceiver, ...updatedTrx];
    }

    localStorage.setItem('user_transactions', JSON.stringify(updatedTrx));

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

        {!isReadOnly && (
          <div className={styles.tabsContainer}>
            <button type="button" className={`${styles.tabBtn} ${transferType === 'own' ? styles.tabActive : ''}`} onClick={() => setTransferType('own')}>Own Account</button>
            <button type="button" className={`${styles.tabBtn} ${transferType === 'other' ? styles.tabActive : ''}`} onClick={() => setTransferType('other')}>Other Account</button>
            <button type="button" className={`${styles.tabBtn} ${transferType === 'intl' ? styles.tabActive : ''}`} onClick={() => setTransferType('intl')}>International</button>
          </div>
        )}

        <form onSubmit={handleTransfer}>
          <div className={styles.formGroup}>
            <label className={styles.label}>From Account</label>
            <div className={styles.customDropdown} ref={dropdownRef}>
              <button
                type="button"
                className={styles.dropdownTrigger}
                onClick={() => setDropdownOpen(!dropdownOpen)}
              >
                {fromAccount ? (
                  <div className={styles.dropdownSelected}>
                    <div className={styles.dropdownSelectedTop}>
                      <span className={styles.dropdownAccName}>{fromAccount.name}</span>
                      <span className={styles.dropdownAccMask}>{fromAccount.mask || ''}</span>
                    </div>
                    <span className={styles.dropdownAccBalance}>{fromAccount.balance}</span>
                  </div>
                ) : (
                  <span className={styles.dropdownPlaceholder}>Select account</span>
                )}
                <svg className={`${styles.dropdownChevron} ${dropdownOpen ? styles.dropdownChevronOpen : ''}`} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="6 9 12 15 18 9"></polyline>
                </svg>
              </button>
              {dropdownOpen && (
                <div className={styles.dropdownMenu}>
                  {accounts.map((acc) => (
                    <button
                      key={acc.id}
                      type="button"
                      className={`${styles.dropdownOption} ${fromAccount && fromAccount.id === acc.id ? styles.dropdownOptionActive : ''}`}
                      onClick={() => { setFromAccount(acc); setDropdownOpen(false); }}
                    >
                      <div className={styles.dropdownOptionTop}>
                        <span className={styles.dropdownAccName}>{acc.name}</span>
                        <span className={styles.dropdownAccMask}>{acc.mask || ''}</span>
                      </div>
                      <span className={styles.dropdownAccBalance}>{acc.balance}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {transferType === 'own' ? (
            <div className={styles.formGroup}>
              <label className={styles.label}>To Account</label>
              <div className={styles.customDropdown} ref={toDropdownRef}>
                <button
                  type="button"
                  className={styles.dropdownTrigger}
                  onClick={() => setToDropdownOpen(!toDropdownOpen)}
                >
                  {toAccount ? (
                    <div className={styles.dropdownSelected}>
                      <div className={styles.dropdownSelectedTop}>
                        <span className={styles.dropdownAccName}>{toAccount.name}</span>
                        <span className={styles.dropdownAccMask}>{toAccount.mask || ''}</span>
                      </div>
                      <span className={styles.dropdownAccBalance}>{toAccount.balance}</span>
                    </div>
                  ) : (
                    <span className={styles.dropdownPlaceholder}>Select receiving account</span>
                  )}
                  <svg className={`${styles.dropdownChevron} ${toDropdownOpen ? styles.dropdownChevronOpen : ''}`} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="6 9 12 15 18 9"></polyline>
                  </svg>
                </button>
                {toDropdownOpen && (
                  <div className={styles.dropdownMenu}>
                    {accounts.filter(a => !fromAccount || a.id !== fromAccount.id).map((acc) => (
                      <button
                        key={acc.id}
                        type="button"
                        className={`${styles.dropdownOption} ${toAccount && toAccount.id === acc.id ? styles.dropdownOptionActive : ''}`}
                        onClick={() => { setToAccount(acc); setToDropdownOpen(false); }}
                      >
                        <div className={styles.dropdownOptionTop}>
                          <span className={styles.dropdownAccName}>{acc.name}</span>
                          <span className={styles.dropdownAccMask}>{acc.mask || ''}</span>
                        </div>
                        <span className={styles.dropdownAccBalance}>{acc.balance}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : (
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
                    required={transferType === 'other'}
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
                <div className={styles.inputWithIcon}>
                  <input 
                    type="text" 
                    className={styles.textInput} 
                    placeholder="e.g., John Doe or ACME Corp" 
                    value={recipient}
                    onChange={(e) => setRecipient(e.target.value)}
                    readOnly={isReadOnly}
                    required={transferType === 'other' || transferType === 'intl'}
                  />
                  <div className={styles.iconInside}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                      <circle cx="12" cy="7" r="4"></circle>
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          )}

          {transferType === 'intl' && (
            <div className={styles.row}>
              <div className={styles.col}>
                <label className={styles.label}>SWIFT / BIC Code</label>
                <div className={styles.inputWithIcon}>
                  <input 
                    type="text" 
                    className={styles.textInput} 
                    placeholder="e.g., BOFAUS3N" 
                    value={swiftCode}
                    onChange={(e) => setSwiftCode(e.target.value)}
                    required={transferType === 'intl'}
                  />
                  <div className={styles.iconInside}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10"></circle>
                      <line x1="2" y1="12" x2="22" y2="12"></line>
                      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
                    </svg>
                  </div>
                </div>
              </div>
              <div className={styles.col}>
                <label className={styles.label}>Destination Currency</label>
                <div className={styles.customDropdown}>
                  <select 
                    className={styles.textInput} 
                    style={{appearance: 'none'}}
                    value={destinationCurrency}
                    onChange={(e) => setDestinationCurrency(e.target.value)}
                  >
                    <option value="EUR">EUR - Euro</option>
                    <option value="GBP">GBP - British Pound</option>
                    <option value="JPY">JPY - Japanese Yen</option>
                    <option value="CAD">CAD - Canadian Dollar</option>
                    <option value="AUD">AUD - Australian Dollar</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          <div className={styles.formGroup}>
            <label className={styles.label}>Amount</label>
            <div className={styles.amountGroup}>
              <div className={`${styles.selectInput} ${styles.currencySelect}`} style={{display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F3F4F6', color: '#6B7280', border: '1px solid #D1D5DB', borderRight: 'none', borderRadius: '4px 0 0 4px'}}>
                USD
              </div>
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
            <button type="submit" className={styles.primaryBtn} disabled={transferType === 'own' ? (!amount || !toAccount) : transferType === 'intl' ? (!amount || !toAccountNum || !recipient || !swiftCode) : (!amount || !toAccountNum || !recipient)}>
              Review Transfer
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
