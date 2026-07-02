"use client";

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { User, Home, Car, Store, Calculator, Info, ArrowRight } from 'lucide-react';
import styles from './apply.module.css';

const LOAN_TYPES = [
  { id: 'personal', title: 'Personal Loan', desc: "Flexible funds for life's events.", icon: <User size={18} /> },
  { id: 'home', title: 'Home Loan', desc: 'Mortgages and equity lines.', icon: <Home size={18} /> },
  { id: 'vehicle', title: 'Vehicle Loan', desc: 'Auto, RV, and marine financing.', icon: <Car size={18} /> },
  { id: 'business', title: 'Business Loan', desc: 'Capital for operational growth.', icon: <Store size={18} /> }
];

export default function ApplyLoanPage() {
  const router = useRouter();
  
  const [selectedType, setSelectedType] = useState('personal');
  const [amount, setAmount] = useState('15000');
  const [term, setTerm] = useState('36');
  const [purpose, setPurpose] = useState('');

  // Very simple calculation for mock UI
  const { estRate, monthlyPayment, totalInterest } = useMemo(() => {
    let baseRate = 5.0;
    if (selectedType === 'personal') baseRate = 8.5;
    if (selectedType === 'home') baseRate = 4.2;
    if (selectedType === 'vehicle') baseRate = 6.45;
    if (selectedType === 'business') baseRate = 7.0;

    const p = parseFloat(amount) || 0;
    const r = baseRate / 100 / 12;
    const n = parseInt(term) || 36;
    
    let monthly = 0;
    let totalInt = 0;

    if (p > 0 && r > 0 && n > 0) {
      monthly = (p * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
      totalInt = (monthly * n) - p;
    }

    return {
      estRate: baseRate.toFixed(2) + '%',
      monthlyPayment: monthly.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
      totalInterest: totalInt.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    };
  }, [selectedType, amount, term]);

  const handleNext = () => {
    // If it's a secured loan type, go to collateral
    if (selectedType === 'vehicle' || selectedType === 'home') {
      router.push(`/dashboard/loans/apply/collateral?type=${selectedType}&amount=${amount}`);
    } else {
      // Otherwise maybe skip collateral, but for demo let's route there anyway or just show a message.
      // The design shows Collateral Upload for "Vehicle" type. Let's just go there.
      router.push(`/dashboard/loans/apply/collateral?type=${selectedType}&amount=${amount}`);
    }
  };

  return (
    <div className={styles.pageContainer}>
      <h1 className={styles.heading}>Apply for a Loan</h1>
      
      <div className={styles.layoutGrid}>
        
        <div className={styles.leftCol}>
          {/* Section 1: Loan Type */}
          <div className={styles.sectionCard}>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>Select Loan Type</h2>
              <p className={styles.sectionSub}>Choose the product that best fits your needs.</p>
            </div>
            
            <div className={styles.loanTypesGrid}>
              {LOAN_TYPES.map(type => (
                <div 
                  key={type.id}
                  className={`${styles.typeCard} ${selectedType === type.id ? styles.typeCardActive : ''}`}
                  onClick={() => setSelectedType(type.id)}
                >
                  <div className={`${styles.typeIconBox} ${selectedType === type.id ? styles.typeIconBoxActive : ''}`}>
                    {type.icon}
                  </div>
                  <div className={styles.typeInfo}>
                    <span className={styles.typeTitle}>{type.title}</span>
                    <span className={styles.typeDesc}>{type.desc}</span>
                  </div>
                  {selectedType === type.id && (
                    <div className={styles.activeRing}>
                      <div className={styles.activeDot} />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Section 2: Loan Details */}
          <div className={styles.sectionCard}>
            <h2 className={styles.sectionTitle}>Loan Details</h2>
            
            <div className={styles.formGroup}>
              <label className={styles.label}>Requested Amount</label>
              <div className={styles.inputWrapper}>
                <span className={styles.currencySymbol}>$</span>
                <input 
                  type="number" 
                  className={styles.textInput}
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                />
              </div>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Loan Term (Months)</label>
              <select 
                className={styles.selectInput}
                value={term}
                onChange={(e) => setTerm(e.target.value)}
              >
                <option value="12">12 Months</option>
                <option value="24">24 Months</option>
                <option value="36">36 Months</option>
                <option value="48">48 Months</option>
                <option value="60">60 Months</option>
                <option value="72">72 Months</option>
              </select>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Purpose of Loan</label>
              <textarea 
                className={styles.textArea}
                value={purpose}
                onChange={(e) => setPurpose(e.target.value)}
                placeholder="Briefly describe how you intend to use these funds..."
              />
            </div>
          </div>
        </div>

        {/* Right Col: Sticky Preview */}
        <div>
          <div className={styles.stickyCol}>
            <div className={styles.previewDeco} />
            
            <div className={styles.previewContent}>
              <div className={styles.previewHeader}>
                <div className={styles.previewTitleWrap}>
                  <Calculator size={16} color="#00327D" />
                  <h3 className={styles.previewTitle}>Estimated Preview</h3>
                </div>
                <p className={styles.previewSub}>Rates auto-calculated based on current selections.</p>
              </div>

              <div>
                <div className={styles.previewRow}>
                  <span className={styles.previewRowLabel}>Est. Interest Rate (APR)</span>
                  <span className={styles.previewRowValHigh}>{estRate}</span>
                </div>
                <div className={styles.previewRow} style={{ marginTop: '16px' }}>
                  <span className={styles.previewRowLabel}>Est. Monthly Payment</span>
                  <span className={styles.previewRowValMain}>${monthlyPayment}</span>
                </div>
                <div className={styles.previewRow} style={{ marginTop: '16px', borderBottom: 'none', paddingBottom: '0' }}>
                  <span className={styles.previewRowLabel}>Total Interest</span>
                  <span className={styles.previewRowValSub}>${totalInterest}</span>
                </div>
              </div>

              <div className={styles.infoAlert}>
                <Info size={16} className={styles.alertIcon} />
                <span>This is an estimate. Final rates are determined during the review step based on your credit profile.</span>
              </div>

              <div className={styles.actions}>
                <button className={styles.primaryBtn} onClick={handleNext}>
                  Continue to Next Step
                  <ArrowRight size={16} />
                </button>
                <button className={styles.secondaryBtn}>Save for Later</button>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
