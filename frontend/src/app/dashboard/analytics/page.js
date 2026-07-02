'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { ShoppingCart, Home, Zap, Music, MoreHorizontal, RefreshCw, Target, Plus, X } from 'lucide-react';
import styles from './analytics.module.css';
import { MOCK_TRANSACTIONS, generateTransactions } from '../transactions/mockData';

const CHART_HEIGHT = 180;

// Map transaction categories to analytics groups
const CATEGORY_MAP = {
  'Groceries': 'Groceries',
  'Dining':    'Groceries',
  'Shopping':  'Entertainment',
  'Transport': 'Entertainment',
  'Entertainment': 'Entertainment',
  'General':   'Others',
  'Utilities': 'Utilities',
  'Refund':    null,            // exclude income
  'Internal Saving': null,
  'Withdrawal': null,
  'Deposit':   null,
};

const CATEGORY_META = [
  { label: 'Groceries',     color: '#0047AB', icon: ShoppingCart },
  { label: 'Utilities',     color: '#C0392B', icon: Zap },
  { label: 'Entertainment', color: '#7B88E8', icon: Music },
  { label: 'Others',        color: '#A0AEC0', icon: MoreHorizontal },
];

// Parse "$1,234.56" or "-$1,234.56" → number (absolute value)
function parseAmount(str) {
  return Math.abs(parseFloat(str.replace(/[^0-9.]/g, '')));
}

// Parse "Oct 24, 2023" → "Oct 2023"
function toMonthKey(dateStr) {
  const d = new Date(dateStr);
  if (isNaN(d)) return '';
  return d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
}

export default function AnalyticsPage() {
  const [hoveredBar, setHoveredBar] = useState(null);
  const [allTransactions, setAllTransactions] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState('');
  
  // Goals State
  const [goals, setGoals] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [isGoalModalOpen, setIsGoalModalOpen] = useState(false);
  const [newGoalName, setNewGoalName] = useState('');
  const [newGoalTarget, setNewGoalTarget] = useState('');
  const [newGoalAccount, setNewGoalAccount] = useState('');

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem('user_transactions') || '[]');
    const generated = generateTransactions(300);
    const all = [...stored, ...MOCK_TRANSACTIONS, ...generated];
    setAllTransactions(all);

    const storedAccounts = JSON.parse(localStorage.getItem('user_accounts') || '[]');
    setAccounts(storedAccounts.filter(a => !a.type.toLowerCase().includes('loan')));
    
    const storedGoals = JSON.parse(localStorage.getItem('user_goals') || '[]');
    setGoals(storedGoals);

    // Default to the most recent month present
    const months = [...new Set(all.map(t => toMonthKey(t.date)).filter(Boolean))];
    months.sort((a, b) => new Date(b) - new Date(a));
    setSelectedMonth(months[0] || '');
  }, []);

  const handleCreateGoal = (e) => {
    e.preventDefault();
    if (!newGoalName || !newGoalTarget || !newGoalAccount) return;
    
    const targetAmt = parseFloat(newGoalTarget);
    if (isNaN(targetAmt) || targetAmt <= 0) return;

    const newGoal = {
      id: `GOAL-${Date.now()}`,
      name: newGoalName,
      targetAmount: targetAmt,
      accountId: newGoalAccount,
      createdAt: new Date().toISOString()
    };

    const updatedGoals = [...goals, newGoal];
    setGoals(updatedGoals);
    localStorage.setItem('user_goals', JSON.stringify(updatedGoals));
    
    setIsGoalModalOpen(false);
    setNewGoalName('');
    setNewGoalTarget('');
    setNewGoalAccount('');
  };

  const getAccountBalanceNum = (accountId) => {
    const acc = accounts.find(a => a.id === accountId);
    if (!acc) return 0;
    return parseFloat(acc.balance.replace(/[^0-9.-]+/g, ""));
  };

  // Available months for dropdown (sorted most recent first)
  const availableMonths = useMemo(() => {
    const months = [...new Set(allTransactions.map(t => toMonthKey(t.date)).filter(Boolean))];
    months.sort((a, b) => new Date(b) - new Date(a));
    return months;
  }, [allTransactions]);

  // Compute spending by category for the selected month
  const spendingData = useMemo(() => {
    const filtered = allTransactions.filter(t => {
      if (t.type !== 'negative') return false; // only outgoing
      return toMonthKey(t.date) === selectedMonth;
    });

    const totals = {};
    filtered.forEach(t => {
      const group = CATEGORY_MAP[t.category];
      if (!group) return;
      totals[group] = (totals[group] || 0) + parseAmount(t.amount);
    });

    return CATEGORY_META.map(meta => ({
      ...meta,
      value: totals[meta.label] || 0,
    }));
  }, [allTransactions, selectedMonth]);

  const total = spendingData.reduce((acc, d) => acc + d.value, 0);
  const maxVal = Math.max(...spendingData.map(d => d.value), 1);

  // Donut chart
  const radius = 60, cx = 80, cy = 80, strokeWidth = 22;
  const circumference = 2 * Math.PI * radius;
  let cumulative = 0;
  const donutSegments = spendingData.map(item => {
    const pct = total > 0 ? item.value / total : 0;
    const offset = circumference * (1 - cumulative);
    const dash = circumference * pct;
    cumulative += pct;
    return { ...item, pct, offset, dash };
  });

  return (
    <div className={styles.pageContainer}>
      <div className={styles.headerContainer}>
        <div className={styles.titleBox}>
          <h1 className={styles.heading}>Analytics</h1>
          <p className={styles.subText}>Gain insights into your financial habits and spending patterns.</p>
        </div>
        <select
          className={styles.monthSelect}
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(e.target.value)}
        >
          {availableMonths.map(m => (
            <option key={m} value={m}>{m}</option>
          ))}
        </select>
      </div>

      {total === 0 ? (
        <div className={styles.emptyState}>
          <RefreshCw size={32} style={{ opacity: 0.3 }} />
          <p>No spending data for {selectedMonth}.</p>
        </div>
      ) : (
        <div className={styles.topRow}>

          {/* Bar Chart Card */}
          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <h3 className={styles.cardTitle}>Spending Summary</h3>
              <span className={styles.totalAmount}>${total.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
            </div>

            <div className={styles.chartArea}>
              <div className={styles.yAxis}>
                {[100, 75, 50, 25, 0].map((pct) => (
                  <div key={pct} className={styles.yTick}>
                    <span className={styles.yTickLabel}>${Math.round(maxVal * pct / 100).toLocaleString()}</span>
                    <div className={styles.yGridLine} />
                  </div>
                ))}
              </div>

              <div className={styles.barGroup}>
                {spendingData.map((item, index) => {
                  const barH = (item.value / maxVal) * CHART_HEIGHT;
                  const isHovered = hoveredBar === index;
                  return (
                    <div
                      key={index}
                      className={styles.barWrapper}
                      onMouseEnter={() => setHoveredBar(index)}
                      onMouseLeave={() => setHoveredBar(null)}
                    >
                      {isHovered && (
                        <div className={styles.tooltip}>
                          <span className={styles.tooltipLabel}>{item.label}</span>
                          <span className={styles.tooltipValue}>${item.value.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                          <span className={styles.tooltipPercent}>{total > 0 ? ((item.value / total) * 100).toFixed(1) : 0}% of total</span>
                        </div>
                      )}
                      <div className={styles.barTrack} style={{ height: `${CHART_HEIGHT}px` }}>
                        <div
                          className={styles.bar}
                          style={{
                            height: `${barH}px`,
                            backgroundColor: isHovered ? '#0034A0' : item.color,
                            opacity: hoveredBar !== null && !isHovered ? 0.5 : 1,
                          }}
                        />
                      </div>
                      <span className={styles.barLabel}>{item.label === 'Entertainment' ? 'Ent.' : item.label}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Donut + Legend Card */}
          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <h3 className={styles.cardTitle}>Breakdown</h3>
            </div>

            <div className={styles.donutContainer}>
              <svg width="160" height="160" viewBox="0 0 160 160">
                <circle cx={cx} cy={cy} r={radius} fill="none" stroke="#F3F3FC" strokeWidth={strokeWidth} />
                {donutSegments.map((seg, i) => (
                  <circle
                    key={i}
                    cx={cx}
                    cy={cy}
                    r={radius}
                    fill="none"
                    stroke={seg.color}
                    strokeWidth={strokeWidth}
                    strokeDasharray={`${seg.dash} ${circumference - seg.dash}`}
                    strokeDashoffset={seg.offset}
                    style={{ transform: 'rotate(-90deg)', transformOrigin: '80px 80px' }}
                  />
                ))}
                <text x={cx} y={cy - 6} textAnchor="middle" fill="#191B22" fontSize="11" fontWeight="600" fontFamily="Inter">Total</text>
                <text x={cx} y={cy + 12} textAnchor="middle" fill="#00327D" fontSize="14" fontWeight="700" fontFamily="Inter">
                  ${(total / 1000).toFixed(1)}k
                </text>
              </svg>
            </div>

            <div className={styles.categoryList}>
              {donutSegments.map((item, i) => {
                const pct = total > 0 ? (item.value / total * 100) : 0;
                return (
                  <div key={i} className={styles.categoryItem}>
                    <div className={styles.categoryLeft}>
                      <span className={styles.legendDot} style={{ backgroundColor: item.color }} />
                      <span className={styles.categoryName}>{item.label}</span>
                    </div>
                    <div className={styles.categoryRight}>
                      <div className={styles.progressTrack}>
                        <div className={styles.progressBar} style={{ width: `${pct}%`, backgroundColor: item.color }} />
                      </div>
                      <span className={styles.categoryPct}>{Math.round(pct)}%</span>
                      <span className={styles.categoryAmount}>${item.value.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Savings Goals Section */}
      <div className={styles.goalsSection}>
        <div className={styles.headerContainer} style={{ marginBottom: '16px' }}>
          <h2 className={styles.sectionTitle}>Savings Goals</h2>
        </div>
        <div className={styles.goalsGrid}>
          {goals.map(goal => {
            const currentBal = getAccountBalanceNum(goal.accountId);
            const pct = Math.min(100, (currentBal / goal.targetAmount) * 100);
            return (
              <div key={goal.id} className={styles.goalCard}>
                <div className={styles.goalHeader}>
                  <div>
                    <h3 className={styles.goalName}>{goal.name}</h3>
                    <p className={styles.goalTarget}>Target: ${(goal.targetAmount).toLocaleString()}</p>
                  </div>
                  <Target size={20} color="#00327D" />
                </div>
                
                <div className={styles.goalProgressContainer}>
                  <div className={styles.goalProgressTextRow}>
                    <span className={styles.goalCurrentAmount}>${currentBal.toLocaleString(undefined, {minimumFractionDigits:2})}</span>
                    <span className={styles.goalPercent}>{Math.round(pct)}%</span>
                  </div>
                  <div className={styles.goalProgressTrack}>
                    <div className={styles.goalProgressBar} style={{ width: `${pct}%` }} />
                  </div>
                </div>
                
                <div className={styles.goalFooter}>
                  Linked Account: {accounts.find(a => a.id === goal.accountId)?.type || 'Unknown'}
                </div>
              </div>
            );
          })}
          
          <div className={styles.addGoalCard} onClick={() => setIsGoalModalOpen(true)}>
            <Plus size={32} color="#00327D" />
            <span className={styles.addGoalText}>Create New Goal</span>
          </div>
        </div>
      </div>

      {/* Add Goal Modal */}
      {isGoalModalOpen && (
        <div className={styles.modalOverlay} onClick={() => setIsGoalModalOpen(false)}>
          <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
            <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'24px'}}>
              <h3 className={styles.modalTitle} style={{margin:0}}>Create Savings Goal</h3>
              <X size={24} color="#737784" style={{cursor:'pointer'}} onClick={() => setIsGoalModalOpen(false)} />
            </div>
            
            <form onSubmit={handleCreateGoal}>
              <div className={styles.modalFormGroup}>
                <label className={styles.modalLabel}>Goal Name</label>
                <input 
                  type="text" 
                  className={styles.modalInput} 
                  placeholder="e.g., Vacation Fund" 
                  value={newGoalName}
                  onChange={e => setNewGoalName(e.target.value)}
                  required 
                />
              </div>
              <div className={styles.modalFormGroup}>
                <label className={styles.modalLabel}>Target Amount ($)</label>
                <input 
                  type="number" 
                  className={styles.modalInput} 
                  placeholder="5000" 
                  min="1"
                  step="0.01"
                  value={newGoalTarget}
                  onChange={e => setNewGoalTarget(e.target.value)}
                  required 
                />
              </div>
              <div className={styles.modalFormGroup}>
                <label className={styles.modalLabel}>Linked Account</label>
                <select 
                  className={styles.modalSelect}
                  value={newGoalAccount}
                  onChange={e => setNewGoalAccount(e.target.value)}
                  required
                >
                  <option value="" disabled>Select an account to track</option>
                  {accounts.map(a => (
                    <option key={a.id} value={a.id}>{a.name} ({a.balance})</option>
                  ))}
                </select>
              </div>
              <div className={styles.modalActions}>
                <button type="button" className={styles.cancelBtn} onClick={() => setIsGoalModalOpen(false)}>Cancel</button>
                <button type="submit" className={styles.saveBtn}>Save Goal</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
