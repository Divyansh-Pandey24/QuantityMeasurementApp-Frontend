import React, { createContext, useContext, useState, useEffect } from 'react';
import { getToken, clearToken, getProfile } from '../api/client';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (getToken()) {
      getProfile()
        .then(p => setProfile(p))
        .catch(() => {})
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  function logout() {
    clearToken();
    setProfile(null);
  }

  function refreshProfile() {
    return getProfile().then(p => { setProfile(p); return p; });
  }

  return (
    <AuthContext.Provider value={{ profile, loading, logout, refreshProfile, setProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
