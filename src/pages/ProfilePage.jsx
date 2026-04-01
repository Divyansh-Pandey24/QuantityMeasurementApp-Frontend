import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import PasswordInput from '../components/PasswordInput';
import { getProfile, resetPassword } from '../api/client';
import { useToast } from '../context/ToastContext';

const PASSWORD_PATTERN = /^(?=.*[A-Z])(?=.*[@#$%^&*()+\-=])(?=.*[0-9]).{8,}$/;

export default function ProfilePage() {
  const [profile, setProfile] = useState(null);
  const [currPass, setCurrPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  useEffect(() => {
    getProfile().then(setProfile).catch(err => toast.show('Could not load profile: ' + err.message, 'error'));
  }, [toast]);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!PASSWORD_PATTERN.test(newPass)) {
      toast.show('New password must be 8+ chars with 1 uppercase, 1 number, 1 special character.', 'error');
      return;
    }
    if (!profile?.email) { toast.show('Could not determine your email. Please refresh.', 'error'); return; }
    setLoading(true);
    try {
      await resetPassword(profile.email, currPass, newPass);
      toast.show('Password updated successfully!', 'success');
      setCurrPass('');
      setNewPass('');
    } catch (err) {
      toast.show(err.message, 'error');
    } finally {
      setLoading(false);
    }
  }

  const avatarLetter = (profile?.name || 'U').charAt(0).toUpperCase();

  return (
    <>
      <Navbar />
      <main className="profile-page">
        <div className="profile-card">
          <div className="profile-header">
            <div className="profile-avatar">{avatarLetter}</div>
            <div className="profile-info">
              <h2>{profile?.name || 'Loading…'}</h2>
              <p>{profile?.email || 'Fetching from server…'}</p>
              <div className="profile-role">{profile?.role || 'USER'}</div>
            </div>
          </div>

          <hr className="profile-divider" />

          <h3 className="profile-section-title">Change Password</h3>
          <p className="profile-section-desc">You must provide your current password to set a new one.</p>

          <form className="profile-form" onSubmit={handleSubmit} noValidate>
            <div className="profile-field">
              <label htmlFor="curr-pass">Current Password</label>
              <PasswordInput
                id="curr-pass"
                className="field-input"
                value={currPass}
                onChange={e => setCurrPass(e.target.value)}
                autoComplete="current-password"
              />
            </div>
            <div className="profile-field">
              <label htmlFor="new-pass">New Password</label>
              <PasswordInput
                id="new-pass"
                className="field-input"
                value={newPass}
                onChange={e => setNewPass(e.target.value)}
                autoComplete="new-password"
              />
              <div style={{ fontSize: '.75rem', color: 'var(--text-muted)', marginTop: '.35rem' }}>
                Min. 8 characters — 1 uppercase, 1 number, 1 special character
              </div>
            </div>
            <button type="submit" className="btn-update" disabled={loading}>
              {loading ? 'Updating…' : 'Update Password'}
            </button>
          </form>
        </div>
      </main>
    </>
  );
}
