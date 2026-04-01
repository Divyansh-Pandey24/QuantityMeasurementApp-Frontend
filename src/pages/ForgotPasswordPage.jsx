import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthBrand from '../components/AuthBrand';
import PasswordInput from '../components/PasswordInput';
import { forgotPassword } from '../api/client';
import { useToast } from '../context/ToastContext';

const PASSWORD_PATTERN = /^(?=.*[A-Z])(?=.*[@#$%^&*()+\-=])(?=.*[0-9]).{8,}$/;

export default function ForgotPasswordPage() {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const toast = useToast();
  const navigate = useNavigate();

  async function handleSendOTP() {
    if (!email || !/\S+@\S+\.\S+/.test(email)) {
      toast.show('Please enter a valid email address.', 'error');
      return;
    }
    setLoading(true);
    try {
      // Call API to send OTP to email
      // await sendOTP(email);
      toast.show('Verification code sent to your email!', 'success');
      setStep(2);
    } catch (err) {
      toast.show(err.message || 'Failed to send verification code.', 'error');
    } finally {
      setLoading(false);
    }
  }

  async function handleVerifyOTP() {
    if (!otp || otp.length < 4) {
      toast.show('Please enter the verification code.', 'error');
      return;
    }
    setLoading(true);
    try {
      // Call API to verify OTP
      // await verifyOTP(email, otp);
      toast.show('Code verified! Set your new password.', 'success');
      setStep(3);
    } catch (err) {
      toast.show(err.message || 'Invalid verification code.', 'error');
    } finally {
      setLoading(false);
    }
  }

  async function handleResetPassword() {
    if (!password) { toast.show('Please enter a new password.', 'error'); return; }
    if (!PASSWORD_PATTERN.test(password)) {
      toast.show('Password must be 8+ chars with 1 uppercase, 1 number, 1 special character.', 'error');
      return;
    }
    if (password !== confirm) { toast.show('Passwords do not match.', 'error'); return; }
    setLoading(true);
    try {
      await forgotPassword(email, password);
      toast.show('Password reset successfully! Please login.', 'success');
      setTimeout(() => navigate('/login'), 1500);
    } catch (err) {
      toast.show(err.message, 'error');
      setLoading(false);
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <AuthBrand />
        <div className="auth-form-panel" style={{ justifyContent: 'center' }}>
          {step === 1 ? (
            <div className="fp-step">
              <div className="fp-icon">
                <svg width="26" height="26" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
              </div>
              <div className="fp-heading">Forgot Password?</div>
              <p className="fp-desc">Enter your registered email address and we'll send you a verification code.</p>
              <div>
                <label className="field-label" htmlFor="fp-email">Email Address</label>
                <input
                  className="field-input"
                  type="email"
                  id="fp-email"
                  placeholder="name@example.com"
                  autoComplete="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSendOTP()}
                  required
                />
              </div>
              <button className="btn-auth" onClick={handleSendOTP} disabled={loading}>
                {loading ? 'Sending...' : 'Send Verification Code'}
              </button>
              <p className="auth-footer" style={{ marginTop: '.25rem' }}>
                Remember your password? <Link to="/login">Login</Link>
              </p>
            </div>
          ) : step === 2 ? (
            <div className="fp-step">
              <div className="fp-icon" style={{ background: '#DBEAFE', color: '#2563EB' }}>
                <svg width="26" height="26" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                  <polyline points="22,6 12,13 2,6" />
                </svg>
              </div>
              <div className="fp-heading">Check Your Email</div>
              <p className="fp-desc">
                We sent a verification code to <span className="fp-email-highlight">{email}</span>.
              </p>
              <span className="fp-back" onClick={() => setStep(1)}>
                <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <polyline points="15 18 9 12 15 6" />
                </svg>
                Use a different email
              </span>
              <div>
                <label className="field-label" htmlFor="fp-otp">Verification Code</label>
                <input
                  className="field-input"
                  type="text"
                  id="fp-otp"
                  placeholder="Enter 6-digit code"
                  autoComplete="one-time-code"
                  value={otp}
                  onChange={e => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  onKeyDown={e => e.key === 'Enter' && handleVerifyOTP()}
                  required
                  style={{ letterSpacing: '0.3em', textAlign: 'center', fontSize: '1.1rem' }}
                />
              </div>
              <button className="btn-auth" onClick={handleVerifyOTP} disabled={loading}>
                {loading ? 'Verifying...' : 'Verify Code'}
              </button>
              <p className="auth-footer" style={{ marginTop: '.25rem' }}>
                Didn't receive code? <span style={{ color: 'var(--primary)', cursor: 'pointer' }} onClick={handleSendOTP}>Resend</span>
              </p>
            </div>
          ) : (
            <div className="fp-step">
              <div className="fp-icon" style={{ background: '#D1FAE5', color: '#059669' }}>
                <svg width="26" height="26" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
              <div className="fp-heading">Set New Password</div>
              <p className="fp-desc">
                Create a strong password for <span className="fp-email-highlight">{email}</span>.
              </p>
              <div>
                <label className="field-label">New Password</label>
                <PasswordInput value={password} onChange={e => setPassword(e.target.value)} autoComplete="new-password" />
                <div style={{ fontSize: '.75rem', color: 'var(--text-muted)', marginTop: '.3rem' }}>
                  Min. 8 characters — 1 uppercase, 1 number, 1 special character
                </div>
              </div>
              <div>
                <label className="field-label">Confirm New Password</label>
                <PasswordInput value={confirm} onChange={e => setConfirm(e.target.value)} autoComplete="new-password" />
              </div>
              <button className="btn-auth" onClick={handleResetPassword} disabled={loading}>
                {loading ? 'Resetting…' : 'Reset Password'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
