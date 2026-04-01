import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { getToken } from '../api/client';

export default function ProtectedRoute({ children }) {
  const location = useLocation();
  if (!getToken()) {
    return <Navigate to="/login" state={{ next: location.pathname }} replace />;
  }
  return children;
}
