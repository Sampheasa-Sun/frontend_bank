'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Shield, Mail, Smartphone, Home, Edit2, RefreshCw, X, LogOut } from 'lucide-react';
import styles from './profile.module.css';

function getScoreStatus(score) {
  if (score >= 800) return 'Exceptional';
  if (score >= 740) return 'Very Good';
  if (score >= 670) return 'Good';
  if (score >= 580) return 'Fair';
  return 'Poor';
}

export default function ProfilePage() {
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);
  const [name, setName] = useState('Alex Anderson');
  const [email, setEmail] = useState('a.anderson@example.com');
  const [phone, setPhone] = useState('+1 (555) 019-2834');
  const [address, setAddress] = useState('400 Broad Street\nApt 12B\nSeattle, WA 98109\nUnited States');
  
  React.useEffect(() => {
    const saved = JSON.parse(localStorage.getItem('user_profile') || 'null');
    if (saved) {
      setName(saved.name || 'Alex Anderson');
      setEmail(saved.email || 'a.anderson@example.com');
      setPhone(saved.phone || '+1 (555) 019-2834');
      setAddress(saved.address || '400 Broad Street\nApt 12B\nSeattle, WA 98109\nUnited States');
    }
  }, []);

  const handleSaveContact = () => {
    const profile = { name, email, phone, address };
    localStorage.setItem('user_profile', JSON.stringify(profile));
    setShowContactModal(false);
  };

  const score = 824;
  const scoreStatus = getScoreStatus(score);
  return (
    <div className={styles.pageContainer}>
      <div className={styles.headerContainer}>
        <h1 className={styles.heading}>Profile Settings</h1>
        <p className={styles.subText}>Manage your personal information and security preferences.</p>
      </div>

      <div className={styles.profileHeaderCard}>
        <div className={styles.userProfileLeft}>
          <div className={styles.avatar}>
            AA
            <div className={styles.editBadge} onClick={() => setShowContactModal(true)}>
              <Edit2 size={14} />
            </div>
          </div>
          
          <div className={styles.userInfo}>
            <div className={styles.userName}>
              {name}
              <span className={styles.kycBadge}>
                <Shield size={12} />
                KYC Verified
              </span>
            </div>
            <span className={styles.memberSince}>Member since Oct 2018</span>
          </div>
        </div>

        <div className={styles.equinoxScore}>
          <span className={styles.scoreLabel}>EQUINOX SCORE</span>
          <span className={styles.scoreValue}>{score}</span>
          <span className={styles.scoreStatus}>{scoreStatus}</span>
        </div>
      </div>

      <div className={styles.contentGrid}>
        {/* Contact Information */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            Contact Information
          </div>
          <div className={styles.cardBody}>
            <div className={styles.infoRow}>
              <Mail className={styles.infoIcon} size={20} />
              <div className={styles.infoContent}>
                <span className={styles.infoLabel}>Email Address</span>
                <span className={styles.infoValue}>{email}</span>
              </div>
            </div>

            <div className={styles.infoRow}>
              <Smartphone className={styles.infoIcon} size={20} />
              <div className={styles.infoContent}>
                <span className={styles.infoLabel}>Mobile Phone</span>
                <span className={styles.infoValue}>{phone}</span>
              </div>
            </div>

            <div className={styles.infoRow}>
              <Home className={styles.infoIcon} size={20} />
              <div className={styles.infoContent}>
                <span className={styles.infoLabel}>Primary Residence</span>
                <span className={styles.infoValue} style={{ whiteSpace: 'pre-line' }}>
                  {address}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Security */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <Shield size={20} color="#00327D" style={{marginRight: '8px'}}/>
            Security
          </div>
          <div className={styles.formBody}>
            <p className={styles.securityDesc}>
              Ensure your account is using a long, random password to stay secure. It is recommended to update your password every 6 months.
            </p>
            <button className={styles.submitBtn} onClick={() => setShowPasswordModal(true)}>
              <RefreshCw size={16} />
              Update Password
            </button>
          </div>
        </div>
      </div>

      {showPasswordModal && (
        <div className={styles.modalOverlay} onClick={() => setShowPasswordModal(false)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3 className={styles.modalTitle}>Update Password</h3>
              <button className={styles.closeModalBtn} onClick={() => setShowPasswordModal(false)}>
                <X size={20} />
              </button>
            </div>
            
            <div className={styles.modalBody}>
              <div className={styles.inputGroup}>
                <label className={styles.inputLabel}>Current Password</label>
                <input type="password" placeholder="••••••••" className={styles.textInput} />
              </div>

              <div className={styles.inputGroup}>
                <label className={styles.inputLabel}>New Password</label>
                <input type="password" placeholder="••••••••" className={styles.textInput} />
                <span className={styles.hint}>Must be at least 12 characters.</span>
              </div>

              <div className={styles.inputGroup}>
                <label className={styles.inputLabel}>Confirm New Password</label>
                <input type="password" placeholder="••••••••" className={styles.textInput} />
              </div>

              <button 
                className={styles.submitBtn} 
                onClick={() => {
                  alert('Password updated successfully!');
                  setShowPasswordModal(false);
                }}
              >
                <RefreshCw size={16} />
                Confirm Update
              </button>
            </div>
          </div>
        </div>
      )}

      {showContactModal && (
        <div className={styles.modalOverlay} onClick={() => setShowContactModal(false)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3 className={styles.modalTitle}>Update Contact Info</h3>
              <button className={styles.closeModalBtn} onClick={() => setShowContactModal(false)}>
                <X size={20} />
              </button>
            </div>
            
            <div className={styles.modalBody}>
              <div className={styles.inputGroup}>
                <label className={styles.inputLabel}>Full Name</label>
                <input type="text" value={name} onChange={(e) => setName(e.target.value)} className={styles.textInput} />
              </div>

              <div className={styles.inputGroup}>
                <label className={styles.inputLabel}>Mobile Phone</label>
                <input type="text" value={phone} onChange={(e) => setPhone(e.target.value)} className={styles.textInput} />
              </div>

              <div className={styles.inputGroup}>
                <label className={styles.inputLabel}>Email Address</label>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className={styles.textInput} />
              </div>

              <div className={styles.inputGroup}>
                <label className={styles.inputLabel}>Primary Residence</label>
                <textarea 
                  value={address} 
                  onChange={(e) => setAddress(e.target.value)} 
                  className={styles.textInput} 
                  rows={4}
                  style={{ resize: 'none' }}
                />
              </div>

              <button 
                className={styles.submitBtn} 
                onClick={handleSaveContact}
              >
                <RefreshCw size={16} />
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Sign Out Section */}
      <div className={styles.signOutSection}>
        <div className={styles.signOutDivider} />
        <Link href="/login" className={styles.signOutBtn}>
          <LogOut size={16} />
          Sign Out
        </Link>
      </div>
    </div>
  );
}
