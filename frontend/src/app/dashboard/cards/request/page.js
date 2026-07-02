'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, CheckCircle2, MapPin, Info, CreditCard } from 'lucide-react';
import styles from './request.module.css';

export default function RequestCardPage() {
  const router = useRouter();
  
  const [network, setNetwork] = useState('visa');
  const [cardType, setCardType] = useState('debit');
  const [linkedAccount, setLinkedAccount] = useState('');
  const [accounts, setAccounts] = useState([]);
  
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
      setLinkedAccount(saved[0].name);
    }
  }, []);

  const selectedAccInfo = accounts.find(a => a.name === linkedAccount);

  const handleRequest = (e) => {
    e.preventDefault();
    
    // Create new card object
    const newCard = {
      id: `card-${Date.now()}`,
      label: selectedAccInfo ? selectedAccInfo.name.toUpperCase() : 'NEW ACCOUNT',
      type: cardType === 'debit' ? 'Visa Debit' : 'Credit Card',
      last4: Math.floor(1000 + Math.random() * 9000).toString(),
      cardholder: 'ALEX ANDERSON',
      expires: '12/28',
      network: network === 'visa' ? 'VISA' : 'MASTERCARD',
      theme: cardType === 'debit' ? 'cardBlue' : 'cardDark'
    };

    // Save to localStorage
    let savedCards = JSON.parse(localStorage.getItem('user_cards') || 'null');
    if (!savedCards || savedCards.length === 0) {
      savedCards = [
        {
          id: 'debit-1',
          label: 'PRIMARY CHECKING',
          type: 'Visa Debit',
          last4: '4821',
          cardholder: 'ALEX ANDERSON',
          expires: '09/27',
          network: 'VISA',
          theme: 'cardBlue'
        },
        {
          id: 'credit-1',
          label: 'EQUINOX PLATINUM',
          type: 'Infinite Visa',
          last4: '9901',
          cardholder: 'ALEX ANDERSON',
          expires: '12/28',
          network: 'VISA',
          theme: 'cardDark'
        }
      ];
    }
    savedCards.push(newCard);
    localStorage.setItem('user_cards', JSON.stringify(savedCards));

    showModal('Success', 'Card request submitted successfully!');
    setTimeout(() => {
      router.push('/dashboard/cards');
    }, 1500);
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
        <h1 className={styles.heading}>Request New Card</h1>
        <p className={styles.subText}>Configure your new Equinox physical card. Delivery typically takes 3-5 business days.</p>
      </div>

      <form className={styles.contentGrid} onSubmit={handleRequest}>
        {/* Left Column - Form */}
        <div className={styles.formSection}>
          
          {/* Select Network */}
          <div className={styles.formGroup}>
            <h3 className={styles.sectionTitle}>Select Network</h3>
            <div className={styles.cardOptionsGrid}>
              <div 
                className={`${styles.optionCard} ${network === 'visa' ? styles.selected : ''}`}
                onClick={() => setNetwork('visa')}
              >
                <div className={styles.optionTop}>
                  <div className={styles.networkLogo}>VISA</div>
                  {network === 'visa' && <CheckCircle2 size={20} className={styles.checkIcon} />}
                </div>
                <div>
                  <p className={styles.optionTitle}>Equinox Visa Signature</p>
                  <p className={styles.optionDesc}>Global acceptance, premium travel perks.</p>
                </div>
              </div>

              <div 
                className={`${styles.optionCard} ${network === 'mastercard' ? styles.selected : ''}`}
                onClick={() => setNetwork('mastercard')}
              >
                <div className={styles.optionTop}>
                  <div style={{display: 'flex'}}>
                    <div style={{width: 24, height: 24, borderRadius: 12, backgroundColor: '#EB001B', zIndex: 2}}></div>
                    <div style={{width: 24, height: 24, borderRadius: 12, backgroundColor: '#F79E1B', marginLeft: -10, zIndex: 1}}></div>
                  </div>
                  {network === 'mastercard' && <CheckCircle2 size={20} className={styles.checkIcon} />}
                </div>
                <div>
                  <p className={styles.optionTitle}>Equinox World Elite</p>
                  <p className={styles.optionDesc}>Exclusive experiences, enhanced security.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Card Type */}
          <div className={styles.formGroup}>
            <h3 className={styles.sectionTitle}>Card Type</h3>
            <div className={styles.cardOptionsGrid}>
              <div 
                className={`${styles.optionCard} ${cardType === 'debit' ? styles.selected : ''}`}
                onClick={() => setCardType('debit')}
              >
                <div className={styles.optionTop}>
                  <div style={{display: 'flex', alignItems: 'center', gap: 12}}>
                    <div style={{width: 32, height: 32, borderRadius: 8, background: '#F3F3FC', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                      <CreditCard size={16} color="#434653" />
                    </div>
                    <div>
                      <p className={styles.optionTitle}>Debit Card</p>
                      <p className={styles.optionDesc}>Linked directly to your checking account.</p>
                    </div>
                  </div>
                  {cardType === 'debit' && <CheckCircle2 size={20} className={styles.checkIcon} />}
                </div>
              </div>

              <div 
                className={`${styles.optionCard} ${cardType === 'credit' ? styles.selected : ''}`}
                onClick={() => setCardType('credit')}
              >
                <div className={styles.optionTop}>
                  <div style={{display: 'flex', alignItems: 'center', gap: 12}}>
                    <div style={{width: 32, height: 32, borderRadius: 8, background: '#F3F3FC', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                      <CreditCard size={16} color="#434653" />
                    </div>
                    <div>
                      <p className={styles.optionTitle}>Credit Card</p>
                      <p className={styles.optionDesc}>Subject to credit approval.</p>
                    </div>
                  </div>
                  {cardType === 'credit' && <CheckCircle2 size={20} className={styles.checkIcon} />}
                </div>
              </div>
            </div>
          </div>

          {/* Account & Delivery */}
          <div className={styles.accountDeliveryPanel}>
            <h3 className={styles.sectionTitle}>Account & Delivery</h3>
            
            <div className={styles.inputGroup}>
              <div className={styles.labelRow}>
                <label className={styles.inputLabel}>Linked Account</label>
              </div>
              <select 
                className={styles.selectInput}
                value={linkedAccount}
                onChange={(e) => setLinkedAccount(e.target.value)}
              >
                {accounts.map(acc => (
                  <option key={acc.id} value={acc.name}>
                    {acc.name} ({acc.mask || '*1234'}) - {acc.balance || '$0.00'}
                  </option>
                ))}
              </select>
            </div>

            <div className={styles.inputGroup}>
              <div className={styles.labelRow}>
                <label className={styles.inputLabel}>Delivery Address</label>
                <a href="#" className={styles.editLink}>Edit Profile</a>
              </div>
              <div className={styles.addressBox}>
                <MapPin size={20} color="#434653" style={{marginTop: 2}} />
                <div className={styles.addressText}>
                  <span className={styles.addressName}>Eleanor Shellstrop</span>
                  <span>1234 Good Place Ave, Apt 4B</span>
                  <span>New York, NY 10001</span>
                  <span>United States</span>
                </div>
              </div>
              <span className={styles.noteText}>
                <Info size={14} />
                Cards can only be shipped to the primary address on file.
              </span>
            </div>
          </div>

        </div>

        {/* Right Column - Summary Sidebar */}
        <div className={styles.summarySidebar}>
          <div>
            <h3 className={styles.summaryTitle}>Request Summary</h3>
            
            <div style={{marginTop: 24}}>
              <div className={styles.summaryRow}>
                <span className={styles.summaryLabel}>Network</span>
                <span className={styles.summaryValue}>{network === 'visa' ? 'Visa Signature' : 'Mastercard World Elite'}</span>
              </div>
              <div className={styles.summaryRow}>
                <span className={styles.summaryLabel}>Type</span>
                <span className={styles.summaryValue}>{cardType === 'debit' ? 'Debit' : 'Credit'}</span>
              </div>
              <div className={styles.summaryRow}>
                <span className={styles.summaryLabel}>Linked Account</span>
                <span className={styles.summaryValue}>
                  {selectedAccInfo ? `${selectedAccInfo.name} (${selectedAccInfo.mask || '*1234'})` : 'None'}
                </span>
              </div>
              
              <div className={styles.summaryDivider}></div>
              
              <div className={styles.summaryRow}>
                <span className={styles.summaryLabel}>Card Fee</span>
                <span className={styles.summaryValue}>$0.00</span>
              </div>
              <div className={styles.summaryRow}>
                <span className={styles.summaryLabel}>Standard Delivery</span>
                <span className={styles.summaryValue}>Free</span>
              </div>
            </div>
          </div>

          <div>
            <button type="submit" className={styles.primaryBtn}>
              Request Card
            </button>
            <Link href="/dashboard/cards" className={styles.cancelBtn}>
              Cancel
            </Link>
            
            <p className={styles.termsText}>
              By requesting this card, you agree to the <a href="#">Cardholder Agreement</a>.
            </p>
          </div>
        </div>
      </form>

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
