'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { ArrowLeft, CheckCircle, Sliders, FileText, XCircle } from 'lucide-react';
import styles from './details.module.css';

function CardDetailsPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const cardId = searchParams.get('id');

  const [card, setCard] = useState(null);
  
  // Hardcode state for demo based on screenshot
  const [freezeCard, setFreezeCard] = useState(false);
  const [onlineUsage, setOnlineUsage] = useState(true);
  const [intlUsage, setIntlUsage] = useState(false);
  const [atmUsage, setAtmUsage] = useState(true);

  const handleFreezeChange = (e) => {
    const isFrozen = e.target.checked;
    setFreezeCard(isFrozen);
    if (isFrozen) {
      setOnlineUsage(false);
      setIntlUsage(false);
      setAtmUsage(false);
    }
  };

  // Modals state
  const [modalType, setModalType] = useState(null); // 'limits', 'cancel', or null
  const [monthlyLimit, setMonthlyLimit] = useState('5000');
  const [transactionLimit, setTransactionLimit] = useState('1500');

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem('user_cards') || '[]');
    const found = saved.find(c => c.id === cardId);
    if (found) {
      setCard(found);
    }
  }, [cardId]);

  if (!card) return null; // or loading state

  const handleCancelCard = () => {
    let saved = JSON.parse(localStorage.getItem('user_cards') || '[]');
    saved = saved.filter(c => c.id !== cardId);
    localStorage.setItem('user_cards', JSON.stringify(saved));
    setModalType(null);
    router.push('/dashboard/cards');
  };

  const handleSaveLimits = () => {
    // In a real app, update the backend here
    setModalType(null);
  };

  return (
    <div className={styles.pageContainer}>
      <div className={styles.headerContainer}>
        <div style={{ display: 'flex' }}>
          <Link href="/dashboard/cards" className={styles.backLink}>
            <ArrowLeft size={16} />
            Back to Cards
          </Link>
        </div>
        <h1 className={styles.heading}>Card Details</h1>
        <p className={styles.subText}>Manage settings and limits for your {card.label || card.type} Card.</p>
      </div>

      <div className={styles.contentGrid}>
        {/* Left Column */}
        <div className={styles.column}>
          {/* Card Visual */}
          <div className={`${styles.cardVisual} ${styles[card.theme]}`}>
            <div className={styles.cardTop}>
              <span className={styles.cardTypeName}>{card.label || card.type}</span>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{opacity: 0.8}}>
                <path d="M8.5 16.5a7 7 0 0 1 0-9"></path>
                <path d="M11.5 18a9 9 0 0 1 0-12"></path>
                <path d="M14.5 19.5a11 11 0 0 1 0-15"></path>
                <path d="M17.5 21a13 13 0 0 1 0-18"></path>
              </svg>
            </div>

            <div className={styles.cardNumberInfo}>
              <span className={styles.cardLabel}>CARD NUMBER</span>
              <div className={styles.cardNumber}>
                <span className={styles.cardDots}>•••• •••• ••••</span>
                {card.last4}
              </div>
            </div>

            <div className={styles.cardBottom}>
              <div className={styles.cardHolderInfo}>
                <span className={styles.cardLabel}>CARDHOLDER</span>
                <span className={styles.cardValue}>{card.cardholder}</span>
              </div>
              <div className={styles.cardExpiresInfo}>
                <span className={styles.cardLabel}>EXPIRES</span>
                <span className={styles.cardValue}>{card.expires}</span>
              </div>
              <div className={styles.networkLogo}>
                {card.network === 'Mastercard' ? (
                  <div style={{display: 'flex'}}>
                    <div style={{width: 24, height: 24, borderRadius: 12, backgroundColor: '#EB001B', zIndex: 2}}></div>
                    <div style={{width: 24, height: 24, borderRadius: 12, backgroundColor: '#F79E1B', marginLeft: -10, zIndex: 1}}></div>
                  </div>
                ) : (
                  <i>{card.network}</i>
                )}
              </div>
            </div>
          </div>

          {/* Information */}
          <div className={styles.panel}>
            <h3 className={styles.panelTitle}>Information</h3>
            
            <div className={styles.infoRow}>
              <span className={styles.infoLabel}>Card Type</span>
              <span className={styles.infoValue}>{card.type}</span>
            </div>
            <div className={styles.infoRow}>
              <span className={styles.infoLabel}>Network</span>
              <span className={styles.infoValue}>{card.network}</span>
            </div>
            <div className={styles.infoRow}>
              <span className={styles.infoLabel}>Linked Account</span>
              <Link href="/dashboard/accounts" className={styles.linkValue}>{card.linkedAccount || 'Primary Checking'}</Link>
            </div>
            <div className={styles.infoRow}>
              <span className={styles.infoLabel}>Issued Date</span>
              <span className={styles.infoValue}>{card.issuedDate || 'Oct 2023'}</span>
            </div>
            <div className={styles.infoRow}>
              <span className={styles.infoLabel}>Status</span>
              <div className={styles.statusBadge}>
                <CheckCircle size={14} />
                {card.status || 'Active'}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className={styles.column}>
          {/* Card Controls */}
          <div className={styles.panel}>
            <h3 className={styles.panelTitle}>Card Controls</h3>
            
            <div className={styles.toggleRow}>
              <div className={styles.toggleText}>
                <span className={styles.toggleTitle}>Freeze Card</span>
                <span className={styles.toggleDesc}>Temporarily block all new transactions.</span>
              </div>
              <label className={styles.switch}>
                <input type="checkbox" checked={freezeCard} onChange={handleFreezeChange} />
                <span className={styles.slider}></span>
              </label>
            </div>

            <div className={styles.toggleRow} style={{ opacity: freezeCard ? 0.5 : 1 }}>
              <div className={styles.toggleText}>
                <span className={styles.toggleTitle}>Online Transactions</span>
                <span className={styles.toggleDesc}>Allow internet-based purchases.</span>
              </div>
              <label className={styles.switch}>
                <input type="checkbox" checked={onlineUsage} disabled={freezeCard} onChange={(e) => setOnlineUsage(e.target.checked)} />
                <span className={styles.slider}></span>
              </label>
            </div>

            <div className={styles.toggleRow} style={{ opacity: freezeCard ? 0.5 : 1 }}>
              <div className={styles.toggleText}>
                <span className={styles.toggleTitle}>International Usage</span>
                <span className={styles.toggleDesc}>Enable transactions outside your home country.</span>
              </div>
              <label className={styles.switch}>
                <input type="checkbox" checked={intlUsage} disabled={freezeCard} onChange={(e) => setIntlUsage(e.target.checked)} />
                <span className={styles.slider}></span>
              </label>
            </div>

            <div className={styles.toggleRow} style={{ opacity: freezeCard ? 0.5 : 1 }}>
              <div className={styles.toggleText}>
                <span className={styles.toggleTitle}>ATM Withdrawals</span>
                <span className={styles.toggleDesc}>Allow cash withdrawals at ATMs.</span>
              </div>
              <label className={styles.switch}>
                <input type="checkbox" checked={atmUsage} disabled={freezeCard} onChange={(e) => setAtmUsage(e.target.checked)} />
                <span className={styles.slider}></span>
              </label>
            </div>
          </div>

          {/* Quick Actions */}
          <div className={styles.panel}>
            <h3 className={styles.panelTitle}>Quick Actions</h3>
            
            <div className={styles.actionRow}>
              <button className={`${styles.actionBtn} ${styles.primary}`} onClick={() => setModalType('limits')}>
                <Sliders size={16} />
                Manage Limits
              </button>
              <Link href={`/dashboard/cards/transactions?id=${card.id}`} className={styles.actionBtn}>
                <FileText size={16} />
                View Transactions
              </Link>
            </div>

            <button className={styles.dangerBtn} onClick={() => setModalType('cancel')}>
              <XCircle size={16} />
              Cancel Card
            </button>
          </div>
        </div>
      </div>

      {modalType === 'limits' && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalDialog}>
            <h3 className={styles.modalTitle}>Manage Limits</h3>
            <p className={styles.modalMessage}>Set the spending limits for your {card.type} ending in {card.last4}.</p>
            
            <div className={styles.modalInputGroup}>
              <label className={styles.modalLabel}>Monthly Spending Limit ($)</label>
              <input 
                type="number" 
                className={styles.modalInput} 
                value={monthlyLimit}
                onChange={(e) => setMonthlyLimit(e.target.value)}
              />
            </div>

            <div className={styles.modalInputGroup}>
              <label className={styles.modalLabel}>Per-Transaction Limit ($)</label>
              <input 
                type="number" 
                className={styles.modalInput} 
                value={transactionLimit}
                onChange={(e) => setTransactionLimit(e.target.value)}
              />
            </div>

            <div className={styles.modalActions}>
              <button className={`${styles.modalBtn} ${styles.secondary}`} onClick={() => setModalType(null)}>Cancel</button>
              <button className={`${styles.modalBtn} ${styles.primary}`} onClick={handleSaveLimits}>Save Limits</button>
            </div>
          </div>
        </div>
      )}

      {modalType === 'cancel' && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalDialog}>
            <h3 className={styles.modalTitle}>Cancel Card</h3>
            <p className={styles.modalMessage}>Are you sure you want to cancel this card? This action cannot be undone and the card will be permanently erased from your account.</p>
            
            <div className={styles.modalActions}>
              <button className={`${styles.modalBtn} ${styles.secondary}`} onClick={() => setModalType(null)}>Keep Card</button>
              <button className={`${styles.modalBtn} ${styles.danger}`} onClick={handleCancelCard}>Yes, Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function CardDetailsPage() {
  return (
    <Suspense fallback={<div>Loading card details...</div>}>
      <CardDetailsPageContent />
    </Suspense>
  );
}
