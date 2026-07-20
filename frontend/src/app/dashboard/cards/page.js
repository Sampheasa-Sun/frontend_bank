'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Plus } from 'lucide-react';
import styles from './cards.module.css';

export default function CardsPage() {
  const [cards, setCards] = useState([]);

  useEffect(() => {
    let saved = JSON.parse(localStorage.getItem('user_cards') || 'null');
    if (!saved || saved.length === 0) {
      const savedProfile = JSON.parse(localStorage.getItem('user_profile') || 'null');
      const cardName = savedProfile ? savedProfile.name.toUpperCase() : 'ALEX ANDERSON';
      saved = [
        {
          id: 'debit-1',
          label: 'PRIMARY CHECKING',
          type: 'Visa Debit',
          last4: '4821',
          cardholder: cardName,
          expires: '09/27',
          network: 'VISA',
          theme: 'cardBlue',
          linkedAccount: 'Primary Checking',
          issuedDate: 'Oct 2023',
          status: 'Active'
        },
        {
          id: 'credit-1',
          label: 'EQUINOX PLATINUM',
          type: 'Infinite Visa',
          last4: '9901',
          cardholder: cardName,
          expires: '12/28',
          network: 'VISA',
          theme: 'cardDark',
          linkedAccount: 'Credit Line',
          issuedDate: 'Dec 2023',
          status: 'Active'
        }
      ];
      localStorage.setItem('user_cards', JSON.stringify(saved));
    }
    setCards(saved);
  }, []);
  return (
    <div className={styles.pageContainer}>
      <div className={styles.headerContainer}>
        <div className={styles.headerText}>
          <h1 className={styles.heading}>My Cards</h1>
          <p className={styles.subText}>Manage and monitor your Equinox debit and credit cards.</p>
        </div>
        <Link href="/dashboard/cards/request" className={styles.primaryBtn}>
          <Plus size={18} />
          Request New Card
        </Link>
      </div>

      <div className={styles.cardsGrid}>
        {cards.map((card) => (
          <Link href={`/dashboard/cards/details?id=${card.id}`} key={card.id} className={`${styles.cardVisual} ${styles[card.theme]}`}>
            <div className={styles.cardTop}>
              <div className={styles.cardTypeInfo}>
                <span className={styles.cardTypeLabel}>{card.label}</span>
                <span className={styles.cardTypeName}>{card.type}</span>
              </div>
              <div className={styles.contactlessIcon}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M8.5 16.5a7 7 0 0 1 0-9"></path>
                  <path d="M11.5 18a9 9 0 0 1 0-12"></path>
                  <path d="M14.5 19.5a11 11 0 0 1 0-15"></path>
                  <path d="M17.5 21a13 13 0 0 1 0-18"></path>
                </svg>
              </div>
            </div>

            <div className={styles.cardNumber}>
              <span className={styles.cardDots}>•••• •••• ••••</span>
              {card.last4}
            </div>

            <div className={styles.cardBottom}>
              <div className={styles.cardHolderInfo}>
                <span className={styles.cardLabel}>CARD HOLDER</span>
                <span className={styles.cardValue}>{card.cardholder}</span>
              </div>
              <div className={styles.cardExpiresInfo}>
                <span className={styles.cardLabel}>EXPIRES</span>
                <span className={styles.cardValue}>{card.expires}</span>
              </div>
              <div className={styles.networkLogo}>
                {card.network}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
