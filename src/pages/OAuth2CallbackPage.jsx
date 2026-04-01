import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { setToken, getProfile } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

/**
 * OAuth2CallbackPage
 *
 * Reads the token directly from window.location.search to avoid any
 * stale-closure or hook-timing issues with useSearchParams inside useEffect.
 *
 * Flow:
 *  1. Parse token/error from the raw URL query string.
 *  2. Store token in localStorage immediately via setToken().
 *  3. Fetch /auth/me to get the user profile and put it in AuthContext.
 *  4. Navigate to /dashboard — ProtectedRoute will see both token + profile.
 */
export default function OAuth2CallbackPage() {
  const navigate = useNavigate();
  const { setProfile } = useAuth();
  const toast = useToast();

  useEffect(() => {
    // Read directly from the browser URL — avoids any React Router hook timing issue
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');
    const error = params.get('error');

    if (error) {
      toast.show(decodeURIComponent(error), 'error');
      navigate('/login', { replace: true });
      return;
    }

    if (!token) {
      toast.show('Authentication failed. No token received.', 'error');
      navigate('/login', { replace: true });
      return;
    }

    // 1. Store the token immediately so all subsequent API calls are authenticated
    setToken(token);

    // 2. Fetch the user profile and put it directly into AuthContext state —
    //    this avoids the extra render cycle that refreshProfile() causes
    getProfile()
      .then(profile => {
        setProfile(profile);
        toast.show('Login successful!', 'success');
        navigate('/dashboard', { replace: true });
      })
      .catch(() => {
        // Token was stored but /auth/me failed — clear it and send back to login
        setToken(null);
        toast.show('Authentication failed. Please try again.', 'error');
        navigate('/login', { replace: true });
      });

  // Only run once on mount — dependencies intentionally empty
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100vh',
      gap: '12px'
    }}>
      <div style={{
        width: '32px',
        height: '32px',
        border: '3px solid #e5e7eb',
        borderTop: '3px solid #6366f1',
        borderRadius: '50%',
        animation: 'spin 0.8s linear infinite'
      }} />
      <p style={{ color: '#6b7280', fontSize: '14px' }}>Completing sign-in…</p>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
