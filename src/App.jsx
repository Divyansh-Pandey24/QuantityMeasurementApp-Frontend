import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ToastProvider } from './context/ToastContext';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

import LoginPage          from './pages/LoginPage';
import RegisterPage       from './pages/RegisterPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import OAuth2CallbackPage from './pages/OAuth2CallbackPage'; // ← ADD THIS IMPORT
import DashboardPage      from './pages/DashboardPage';
import MeasurePage        from './pages/MeasurePage';
import HistoryPage        from './pages/HistoryPage';
import ProfilePage        from './pages/ProfilePage';

export default function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <AuthProvider>
          <Routes>
            {/* Public */}
            <Route path="/login"           element={<LoginPage />} />
            <Route path="/register"        element={<RegisterPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />

            {/* OAuth2 callback — MUST be public and MUST be before the wildcard */}
            <Route path="/oauth2/callback" element={<OAuth2CallbackPage />} />

            {/* Protected */}
            <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
            <Route path="/measure"   element={<ProtectedRoute><MeasurePage /></ProtectedRoute>} />
            <Route path="/history"   element={<ProtectedRoute><HistoryPage /></ProtectedRoute>} />
            <Route path="/profile"   element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </AuthProvider>
      </ToastProvider>
    </BrowserRouter>
  );
}
