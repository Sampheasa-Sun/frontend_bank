'use client';

import React, { useState, useEffect, useRef, useCallback, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Calendar, Utensils, Plane, ShoppingBag, Car, ArrowLeft } from 'lucide-react';
import styles from './transactions.module.css';

const ICONS = [Utensils, Plane, ShoppingBag, Car];
const MERCHANTS = ['Balthazar Restaurant', 'Delta Airlines', 'Apple Store', 'Uber Rides', 'Amazon', 'Starbucks', 'Whole Foods', 'Target'];
const CATEGORIES = ['Dining', 'Travel', 'Electronics', 'Transportation', 'Retail', 'Dining', 'Groceries', 'Retail'];

const generateTransactions = (count, cardId) => {
  const result = [];
  for (let i = 0; i < count; i++) {
    const r = Math.floor(Math.random() * MERCHANTS.length);
    result.push({
      id: Math.random().toString(),
      cardId,
      merchant: MERCHANTS[r],
      category: CATEGORIES[r],
      date: 'Oct ' + (Math.floor(Math.random() * 30) + 1) + ', 2023',
      time: Math.floor(Math.random() * 12 + 1) + ':' + (Math.floor(Math.random() * 50) + 10) + ' PM',
      amount: '$' + (Math.random() * 500).toFixed(2),
      status: Math.random() > 0.8 ? 'Pending' : 'Completed',
      type: Math.random() > 0.5 ? 'In-store' : 'Online',
      icon: ICONS[r % ICONS.length]
    });
  }
  return result;
};

function CardTransactionsPageContent() {
  const searchParams = useSearchParams();
  const initialCardId = searchParams.get('id') || 'credit-1';
  
  const [selectedCard, setSelectedCard] = useState(initialCardId);
  const [activeTab, setActiveTab] = useState('All');
  const [cards, setCards] = useState([]);
  const [displayTransactions, setDisplayTransactions] = useState([]);
  const loadingRef = useRef(false);

  useEffect(() => {
    let saved = JSON.parse(localStorage.getItem('user_cards') || '[]');
    setCards(saved);
  }, []);

  useEffect(() => {
    setDisplayTransactions(generateTransactions(100, selectedCard));
  }, [selectedCard]);

  const handleScroll = useCallback(() => {
    if (loadingRef.current) return;
    const bottom = Math.ceil(window.innerHeight + window.scrollY) >= document.documentElement.scrollHeight - 200;
    if (bottom) {
      loadingRef.current = true;
      setTimeout(() => {
        setDisplayTransactions(prev => [...prev, ...generateTransactions(100, selectedCard)]);
        loadingRef.current = false;
      }, 500);
    }
  }, [selectedCard]);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  const selectedCardInfo = cards.find(c => c.id === selectedCard);

  return (
    <div className={styles.pageContainer}>
      <div className={styles.headerContainer}>
        <Link href={`/dashboard/cards/details?id=${initialCardId}`} className={styles.backLink}>
          <ArrowLeft size={16} />
          Back to Cards
        </Link>
        <h1 className={styles.heading}>Card Transactions</h1>
        <p className={styles.subText}>Manage and review your recent card activity.</p>
      </div>

      <div className={styles.topSection}>
        {/* Filters */}
        <div className={styles.filtersPanel}>
          <div className={styles.filterRow}>
            <div className={styles.filterGroup}>
              <span className={styles.filterLabel}>Select Card</span>
              <div className={styles.selectedCardText}>
                {selectedCardInfo ? `${selectedCardInfo.type} •••• ${selectedCardInfo.last4}` : 'Unknown Card'}
              </div>
            </div>
            <div className={styles.filterGroup}>
              <span className={styles.filterLabel}>Date Range</span>
              <div className={styles.inputWithIcon}>
                <div className={styles.iconInside}>
                  <Calendar size={16} />
                </div>
                <input type="text" className={styles.textInput} value="Oct 1 - Oct 31, 2023" readOnly />
              </div>
            </div>
          </div>
          
          <div className={styles.divider}></div>
          
          <div className={styles.bottomFilterRow}>
            <div className={styles.tabs}>
              {['All', 'Purchase', 'Refund', 'Fee'].map(tab => (
                <button 
                  key={tab} 
                  className={`${styles.tabBtn} ${activeTab === tab ? styles.active : ''}`}
                  onClick={() => setActiveTab(tab)}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Summary */}
        <div className={styles.summaryPanel}>
          <div>
            <h3 className={styles.summaryTitle}>October Summary</h3>
            <p className={styles.summaryLabel}>Total Spent</p>
            <h2 className={styles.summaryAmount}>$4,281.50</h2>
          </div>
          
          <div className={styles.categoryList}>
            <div className={styles.categoryRow}>
              <div className={styles.categoryName}>
                <div className={styles.dot} style={{backgroundColor: '#00327D'}}></div>
                Dining
              </div>
              <span className={styles.categoryValue}>$1,450.00</span>
            </div>
            <div className={styles.categoryRow}>
              <div className={styles.categoryName}>
                <div className={styles.dot} style={{backgroundColor: '#465F88'}}></div>
                Travel
              </div>
              <span className={styles.categoryValue}>$1,200.00</span>
            </div>
            <div className={styles.categoryRow}>
              <div className={styles.categoryName}>
                <div className={styles.dot} style={{backgroundColor: '#651F00'}}></div>
                Retail
              </div>
              <span className={styles.categoryValue}>$850.50</span>
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className={styles.tablePanel}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Merchant</th>
              <th>Date & Time</th>
              <th className={styles.alignRight}>Amount</th>
              <th className={styles.alignCenter}>Status</th>
              <th className={styles.alignRight}>Type</th>
            </tr>
          </thead>
          <tbody>
            {displayTransactions.length > 0 ? displayTransactions.map((trx) => (
              <tr key={trx.id}>
                <td>
                  <div className={styles.merchantCell}>
                    <div className={styles.merchantIcon}>
                      <trx.icon size={20} />
                    </div>
                    <div>
                      <p className={styles.merchantName}>{trx.merchant}</p>
                      <p className={styles.merchantCategory}>{trx.category}</p>
                    </div>
                  </div>
                </td>
                <td>
                  <div className={styles.dateCell}>
                    <span className={styles.dateText}>{trx.date}</span>
                    <span className={styles.timeText}>{trx.time}</span>
                  </div>
                </td>
                <td className={styles.amountCell}>{trx.amount}</td>
                <td>
                  <div className={styles.statusCell}>
                    <div className={`${styles.statusBadge} ${trx.status === 'Pending' ? styles.pending : ''}`}>
                      <div className={styles.statusDot}></div>
                      {trx.status}
                    </div>
                  </div>
                </td>
                <td>
                  <div className={styles.typeCell}>
                    {trx.type === 'In-store' ? (
                      <ShoppingBag size={14} />
                    ) : (
                      <Plane size={14} />
                    )}
                    {trx.type}
                  </div>
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan="5" style={{textAlign: 'center', padding: '48px', color: '#6B7280'}}>
                  No transactions found for this card.
                </td>
              </tr>
            )}
          </tbody>
        </table>
        
        {loadingRef.current && (
          <div className={styles.loadingRow}>Loading more transactions...</div>
        )}
      </div>
    </div>
  );
}

export default function CardTransactionsPage() {
  return (
    <Suspense fallback={<div>Loading card transactions...</div>}>
      <CardTransactionsPageContent />
    </Suspense>
  );
}
