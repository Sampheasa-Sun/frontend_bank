"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Home, Car, User, Store, Plus, CheckCircle, Clock } from 'lucide-react';
import styles from './loans.module.css';

// Calculate due countdown from a date string like "Oct 15, 2023"
function getDueLabel(dueDateStr) {
  const due = new Date(dueDateStr);
  due.setHours(0, 0, 0, 0);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const diffMs = due - today;
  const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays < 0) return { text: `Overdue by ${Math.abs(diffDays)} day${Math.abs(diffDays) !== 1 ? 's' : ''}`, isOverdue: true, isDueSoon: true };
  if (diffDays === 0) return { text: 'Due today', isOverdue: false, isDueSoon: true };
  if (diffDays <= 7) return { text: `Due in ${diffDays} day${diffDays !== 1 ? 's' : ''}`, isOverdue: false, isDueSoon: true };
  return { text: `Due in ${diffDays} days`, isOverdue: false, isDueSoon: false };
}

// Policy: cannot pay in full within first 12 months
function canPayInFull(loanStartDate) {
  const start = new Date(loanStartDate);
  const twelveMonthsLater = new Date(start);
  twelveMonthsLater.setMonth(twelveMonthsLater.getMonth() + 12);
  return new Date() >= twelveMonthsLater;
}

const BASE_LOANS = [
  {
    id: 'LN-8472910-HM',
    type: 'Home Mortgage',
    status: 'ACTIVE',
    iconType: 'home',
    outstandingBalance: 342500.00,
    principalAmount: 450000.00,
    repaymentProgress: 23.8,
    repaidAmount: 107500.00,
    startDate: '2019-10-10',
    nextPayment: {
      amount: 2450.00,
      dueDate: (() => { const d = new Date(); d.setDate(d.getDate() + 5); return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }); })(),
      apr: '4.2% Fixed APR',
    }
  },
  {
    id: 'LN-3920184-VH',
    type: 'Auto Loan',
    status: 'ACTIVE',
    iconType: 'car',
    outstandingBalance: 18400.00,
    principalAmount: 35000.00,
    repaymentProgress: 47.4,
    repaidAmount: 16600.00,
    startDate: '2021-04-01',
    nextPayment: {
      amount: 580.00,
      dueDate: (() => { const d = new Date(); d.setDate(d.getDate() + 18); return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }); })(),
      apr: '6.5% Fixed APR',
    }
  },
  {
    id: 'App-994821',
    type: 'Personal Consolidation',
    status: 'PENDING',
    iconType: 'user',
    requestedAmount: 15000.00,
    estRate: '8.9% - 11.2%',
    appliedDate: 'Oct 10, 2023',
    purpose: 'Debt consolidation and home improvement',
    term: '36 months',
    income: '$6,500 / month',
  },
  {
    id: 'LN-1129384-BS',
    type: 'Small Business Expansion',
    status: 'SETTLED',
    iconType: 'store',
    outstandingBalance: 0.00,
    principalAmount: 50000.00,
    repaymentProgress: 100,
    settledDate: 'Sep 12, 2022',
  }
];

function LoanIcon({ type }) {
  if (type === 'home') return <Home size={24} />;
  if (type === 'car') return <Car size={24} />;
  if (type === 'user') return <User size={24} />;
  return <Store size={24} />;
}

export default function LoansPage() {
  const [loans, setLoans] = useState(BASE_LOANS);
  const [showSettled, setShowSettled] = useState(false);
  const [manageModal, setManageModal] = useState(null); // loan object
  const [appModal, setAppModal] = useState(null);       // pending loan object
  const [approvalStatus, setApprovalStatus] = useState({}); // {loanId: 'approved'|'rejected'}
  const [fullPayConfirm, setFullPayConfirm] = useState(false);

  useEffect(() => {
    // Load any saved approval statuses
    const saved = JSON.parse(localStorage.getItem('loan_approvals') || '{}');
    setApprovalStatus(saved);

    setLoans(prev => prev.map(l => {
      if (saved[l.id] === 'approved') {
        return {
          ...l,
          status: 'ACTIVE',
          outstandingBalance: l.requestedAmount || 15000.00,
          principalAmount: l.requestedAmount || 15000.00,
          repaymentProgress: 0,
          repaidAmount: 0.00,
          startDate: '2026-07-01',
          nextPayment: {
            amount: Math.round((l.requestedAmount || 15000.00) / 36),
            dueDate: (() => { const d = new Date(); d.setDate(d.getDate() + 30); return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }); })(),
            apr: '9.5% Fixed APR',
          }
        };
      } else if (saved[l.id] === 'rejected') {
        return {
          ...l,
          status: 'REJECTED'
        };
      }
      return l;
    }));
  }, []);

  const formatCurrency = (val) =>
    '$' + val.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const handleApproveLoan = (loan) => {
    const newStatus = { ...approvalStatus, [loan.id]: 'approved' };
    setApprovalStatus(newStatus);
    localStorage.setItem('loan_approvals', JSON.stringify(newStatus));

    // Auto-create a loan account with the borrowed amount
    const accounts = JSON.parse(localStorage.getItem('user_accounts') || '[]');
    const loanAcctId = `loan-${loan.id}`;
    if (!accounts.find(a => a.id === loanAcctId)) {
      const newAcct = {
        id: loanAcctId,
        name: `${loan.type} Loan`,
        type: 'Loan Account',
        balance: `$${loan.requestedAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}`,
        accountNumber: `••••${Math.floor(1000 + Math.random() * 9000)}`,
        mask: `•••• ${Math.floor(1000 + Math.random() * 9000)}`,
      };
      accounts.push(newAcct);
      localStorage.setItem('user_accounts', JSON.stringify(accounts));
    }

    // Auto-create initial funding transaction
    const storedTxs = JSON.parse(localStorage.getItem('user_transactions') || '[]');
    const loanTxId = `TRX-LOAN-${loan.id}`;
    if (!storedTxs.find(t => t.id === loanTxId)) {
      const newTx = {
        id: loanTxId,
        merchant: 'Equinox Bank (Loan Funding)',
        category: 'Deposit',
        date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        ref: `REF-${Math.floor(10000000 + Math.random() * 90000000)}`,
        status: 'Cleared',
        amount: `+$${loan.requestedAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}`,
        type: 'positive',
        iconType: 'transfer',
        fromAccount: `${loan.type} Loan`
      };
      storedTxs.unshift(newTx);
      localStorage.setItem('user_transactions', JSON.stringify(storedTxs));
    }

    // Now update the local state of this loan to ACTIVE immediately
    setLoans(prev => prev.map(l => {
      if (l.id === loan.id) {
        return {
          ...l,
          status: 'ACTIVE',
          outstandingBalance: loan.requestedAmount,
          principalAmount: loan.requestedAmount,
          repaymentProgress: 0,
          repaidAmount: 0,
          startDate: new Date().toISOString().split('T')[0],
          nextPayment: {
            amount: Math.round(loan.requestedAmount / 36),
            dueDate: (() => { const d = new Date(); d.setDate(d.getDate() + 30); return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }); })(),
            apr: '9.5% Fixed APR',
          }
        };
      }
      return l;
    }));

    setAppModal(null);
  };

  const handleRejectLoan = (loan) => {
    const newStatus = { ...approvalStatus, [loan.id]: 'rejected' };
    setApprovalStatus(newStatus);
    localStorage.setItem('loan_approvals', JSON.stringify(newStatus));
    setAppModal(null);
  };

  const handleFullPayment = (loan) => {
    setLoans(prev => prev.map(l =>
      l.id === loan.id
        ? { ...l, status: 'SETTLED', outstandingBalance: 0, repaymentProgress: 100, settledDate: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) }
        : l
    ));
    setManageModal(null);
    setFullPayConfirm(false);
  };

  const filteredLoans = loans.filter(loan =>
    showSettled ? loan.status === 'SETTLED' : loan.status !== 'SETTLED'
  );

  return (
    <div className={styles.pageContainer}>
      <div className={styles.headerContainer}>
        <div className={styles.headerText}>
          <h1 className={styles.heading}>{showSettled ? 'Settled Loans' : 'My Loans'}</h1>
          <p className={styles.subText}>
            {showSettled ? 'Review your past and fully paid-off loans.' : 'Manage your active loans and review repayment schedules.'}
          </p>
        </div>
        <div className={styles.headerActions}>
          <button className={styles.secondaryBtn} onClick={() => setShowSettled(!showSettled)}>
            {showSettled ? 'View Active Loans' : 'View Settled Loans'}
          </button>
          <Link href="/dashboard/loans/apply" className={styles.primaryBtn}>
            <Plus size={18} />
            Apply for a Loan
          </Link>
        </div>
      </div>

      <div className={styles.loansGrid}>
        {filteredLoans.length === 0 && <p style={{ color: '#6B7280' }}>No loans found in this category.</p>}
        {filteredLoans.map((loan) => {
          const dueInfo = loan.nextPayment ? getDueLabel(loan.nextPayment.dueDate) : null;
          const appStatus = approvalStatus[loan.id];

          return (
            <div key={loan.id} className={styles.loanCard}>
              <div className={styles.cardTop}>
                <div className={styles.cardTitleArea}>
                  <div className={`${styles.cardIconBox} ${loan.status === 'SETTLED' ? styles.cardIconBoxSettled : ''}`}>
                    <LoanIcon type={loan.iconType} />
                  </div>
                  <div className={styles.cardTitleText}>
                    <span className={styles.cardTitle}>{loan.type}</span>
                    <span className={styles.cardRef}>{loan.id}</span>
                  </div>
                </div>
                <div className={`${styles.badge} ${
                  loan.status === 'ACTIVE' ? styles.badgeActive :
                  loan.status === 'PENDING' ? styles.badgePending :
                  styles.badgeSettled
                }`}>
                  {loan.status === 'ACTIVE' && <CheckCircle size={14} />}
                  {loan.status === 'PENDING' && <Clock size={14} />}
                  {loan.status === 'SETTLED' && <CheckCircle size={14} />}
                  {loan.status}
                </div>
              </div>

              {/* Active / Settled */}
              {(loan.status === 'ACTIVE' || loan.status === 'SETTLED') && (
                <>
                  <div className={styles.balancesRow}>
                    <div className={styles.balanceCol}>
                      <span className={styles.balanceLabel}>{loan.status === 'SETTLED' ? 'FINAL BALANCE' : 'OUTSTANDING BALANCE'}</span>
                      <span className={styles.balanceValueMain}>{formatCurrency(loan.outstandingBalance)}</span>
                    </div>
                    <div className={`${styles.balanceCol} ${styles.balanceColRight}`}>
                      <span className={styles.balanceLabel}>PRINCIPAL AMOUNT</span>
                      <span className={styles.balanceValueSub}>{formatCurrency(loan.principalAmount)}</span>
                    </div>
                  </div>

                  <div className={styles.progressContainer}>
                    <div className={styles.progressTop}>
                      <span className={styles.progressLabel}>Repayment Progress</span>
                      <span className={styles.progressPercent}>{loan.repaymentProgress}%</span>
                    </div>
                    <div className={styles.progressBarTrack}>
                      <div className={`${styles.progressBarFill} ${loan.status === 'SETTLED' ? styles.progressBarFillSettled : ''}`} style={{ width: `${loan.repaymentProgress}%` }} />
                    </div>
                    {loan.status === 'ACTIVE' && (
                      <span className={styles.progressBottom}>{formatCurrency(loan.repaidAmount)} Repaid</span>
                    )}
                  </div>

                  <div className={styles.cardFooter}>
                    {loan.status === 'ACTIVE' ? (
                      <>
                        <div className={styles.paymentInfo}>
                          <span className={styles.paymentLabel}>NEXT PAYMENT</span>
                          <div className={styles.paymentValue}>
                            {formatCurrency(loan.nextPayment.amount)}
                            <span className={`${styles.paymentDue} ${dueInfo?.isOverdue ? styles.paymentOverdue : dueInfo?.isDueSoon ? styles.paymentDueSoon : ''}`}>
                              {dueInfo?.text}
                            </span>
                          </div>
                          <span className={styles.paymentSub}>{loan.nextPayment.dueDate} • {loan.nextPayment.apr}</span>
                        </div>
                        {dueInfo?.isDueSoon ? (
                          <Link
                            href={`/dashboard/transactions/transfer?toAccount=EQUINOX-001&recipient=Equinox%20Bank&amount=${loan.nextPayment.amount}&readonly=true`}
                            className={styles.primaryBtnSmall}
                          >
                            Pay Now
                          </Link>
                        ) : (
                          <button className={styles.secondaryBtn} onClick={() => setManageModal(loan)}>Manage</button>
                        )}
                      </>
                    ) : (
                      <>
                        <span className={styles.paymentSub}>Settled on {loan.settledDate}</span>
                        <button className={styles.secondaryBtn}>View Statement</button>
                      </>
                    )}
                  </div>
                </>
              )}

              {/* Pending */}
              {loan.status === 'PENDING' && (
                <>
                  <div className={styles.balancesRow}>
                    <div className={styles.balanceCol}>
                      <span className={styles.balanceLabel}>REQUESTED AMOUNT</span>
                      <span className={styles.balanceValueMain}>{formatCurrency(loan.requestedAmount)}</span>
                    </div>
                    <div className={`${styles.balanceCol} ${styles.balanceColRight}`}>
                      <span className={styles.balanceLabel}>EST. RATE</span>
                      <span className={styles.balanceValueSub}>{loan.estRate}</span>
                    </div>
                  </div>

                  {appStatus === 'approved' ? (
                    <p className={styles.approvedNotice}>✅ Your loan has been approved! A loan account has been created and funds have been transferred.</p>
                  ) : appStatus === 'rejected' ? (
                    <p className={styles.rejectedNotice}>❌ Your application was not approved at this time.</p>
                  ) : (
                    <p className={styles.pendingNotice}>Your application is currently under review by our underwriting team. We will notify you once a decision has been made.</p>
                  )}

                  <button className={styles.fullWidthBtn} onClick={() => setAppModal(loan)}>
                    View Application
                  </button>
                </>
              )}
            </div>
          );
        })}
      </div>

      {/* ── Manage Modal ── */}
      {manageModal && (
        <div className={styles.modalOverlay} onClick={() => { setManageModal(null); setFullPayConfirm(false); }}>
          <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3 className={styles.modalTitle}>Manage Loan — {manageModal.type}</h3>
              <button className={styles.closeBtn} onClick={() => { setManageModal(null); setFullPayConfirm(false); }}>×</button>
            </div>
            <div className={styles.modalBody}>
              <div className={styles.manageRow}><span>Outstanding Balance</span><strong>{formatCurrency(manageModal.outstandingBalance)}</strong></div>
              <div className={styles.manageRow}><span>Principal Amount</span><strong>{formatCurrency(manageModal.principalAmount)}</strong></div>
              <div className={styles.manageRow}><span>Repayment Progress</span><strong>{manageModal.repaymentProgress}%</strong></div>
              <div className={styles.manageRow}><span>Next Payment</span><strong>{formatCurrency(manageModal.nextPayment.amount)} — {getDueLabel(manageModal.nextPayment.dueDate).text}</strong></div>
              <div className={styles.manageRow}><span>APR</span><strong>{manageModal.nextPayment.apr}</strong></div>

              <div className={styles.manageActions}>
                <Link
                  href={`/dashboard/transactions/transfer?toAccount=EQUINOX-001&recipient=Equinox%20Bank&amount=${manageModal.nextPayment.amount}&readonly=true`}
                  className={styles.primaryBtnSmall}
                  onClick={() => setManageModal(null)}
                >
                  Pay Monthly Instalment
                </Link>

                {canPayInFull(manageModal.startDate) ? (
                  !fullPayConfirm ? (
                    <button className={styles.dangerBtnSmall} onClick={() => setFullPayConfirm(true)}>
                      Pay in Full ({formatCurrency(manageModal.outstandingBalance)})
                    </button>
                  ) : (
                    <div className={styles.confirmBox}>
                      <p>Are you sure you want to pay the full outstanding balance of <strong>{formatCurrency(manageModal.outstandingBalance)}</strong>? This will close the loan.</p>
                      <div className={styles.confirmActions}>
                        <button className={styles.cancelBtn} onClick={() => setFullPayConfirm(false)}>Cancel</button>
                        <button className={styles.dangerBtnSmall} onClick={() => handleFullPayment(manageModal)}>Confirm Full Payment</button>
                      </div>
                    </div>
                  )
                ) : (
                  <div className={styles.policyNotice}>
                    ⓘ Early full repayment is not available within the first 12 months of the loan. Eligible after: {new Date(new Date(manageModal.startDate).setMonth(new Date(manageModal.startDate).getMonth() + 12)).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── View Application Modal ── */}
      {appModal && (
        <div className={styles.modalOverlay} onClick={() => setAppModal(null)}>
          <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3 className={styles.modalTitle}>Loan Application — {appModal.type}</h3>
              <button className={styles.closeBtn} onClick={() => setAppModal(null)}>×</button>
            </div>
            <div className={styles.modalBody}>
              <div className={styles.appStatusBanner}>
                {approvalStatus[appModal.id] === 'approved' ? (
                  <span className={styles.appApproved}>✅ Approved — Funds transferred to your new loan account.</span>
                ) : approvalStatus[appModal.id] === 'rejected' ? (
                  <span className={styles.appRejected}>❌ Application Not Approved</span>
                ) : (
                  <span className={styles.appPending}>🕐 Under Review — Decision pending</span>
                )}
              </div>

              <div className={styles.manageRow}><span>Application ID</span><strong>{appModal.id}</strong></div>
              <div className={styles.manageRow}><span>Applied Date</span><strong>{appModal.appliedDate}</strong></div>
              <div className={styles.manageRow}><span>Requested Amount</span><strong>{formatCurrency(appModal.requestedAmount)}</strong></div>
              <div className={styles.manageRow}><span>Estimated Rate</span><strong>{appModal.estRate}</strong></div>
              <div className={styles.manageRow}><span>Loan Term</span><strong>{appModal.term}</strong></div>
              <div className={styles.manageRow}><span>Purpose</span><strong>{appModal.purpose}</strong></div>
              <div className={styles.manageRow}><span>Monthly Income</span><strong>{appModal.income}</strong></div>

              {/* For demo: bank officer approve/reject buttons — hidden after decision */}
              {!approvalStatus[appModal.id] && (
                <div className={styles.officerActions}>
                  <p className={styles.officerNote}>[ Bank Officer Actions — Demo only ]</p>
                  <div className={styles.confirmActions}>
                    <button className={styles.dangerBtnSmall} onClick={() => handleRejectLoan(appModal)}>Reject</button>
                    <button className={styles.primaryBtnSmall} onClick={() => handleApproveLoan(appModal)}>Approve</button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
