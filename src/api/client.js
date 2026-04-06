/**
 * api/client.js
 * Central HTTP client for the Quantity Measurement backend using Axios.
 */

import axios from 'axios';

// FIX: export API_BASE so LoginPage can use it for OAuth2 button hrefs.
// Set REACT_APP_API_URL in your .env file for non-local environments:
//   REACT_APP_API_URL=https://your-backend.example.com
export const API_BASE = 'http://localhost:8080';

const BASE_URL = `${API_BASE}/api/v1`;

// Create axios instance
const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
apiClient.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    const message = error.response?.data?.message || 
                   error.response?.data?.error || 
                   error.message || 
                   'An error occurred';
    return Promise.reject(new Error(message));
  }
);

function getToken() {
  return localStorage.getItem('qm_token');
}

function setToken(t) {
  if (t) localStorage.setItem('qm_token', t);
  else localStorage.removeItem('qm_token');
}

function clearToken() {
  setToken(null);
}

// ── AUTH ─────────────────────────────────────────────────────

export async function register(name, email, password) {
  const data = await apiClient.post('/auth/register', { name, email, password });
  if (data?.accessToken) setToken(data.accessToken);
  return data;
}

export async function login(email, password) {
  const data = await apiClient.post('/auth/login', { email, password });
  if (data?.accessToken) setToken(data.accessToken);
  return data;
}

export async function getProfile() {
  return apiClient.get('/auth/me');
}

export async function forgotPassword(email, newPassword) {
  return apiClient.put(`/auth/forgotPassword/${encodeURIComponent(email)}`, { password: newPassword });
}

export async function resetPassword(email, currentPassword, newPassword) {
  return apiClient.put(`/auth/resetPassword/${encodeURIComponent(email)}`, null, {
    params: {
      currentPassword,
      newPassword,
    }
  });
}

// ── QUANTITY OPERATIONS ──────────────────────────────────────

export async function measure(operation, dto) {
  return apiClient.post(`/quantities/${operation}`, dto);
}

// ── HISTORY ──────────────────────────────────────────────────

export async function historyByOperation(operation) {
  return apiClient.get(`/quantities/history/operation/${operation}`);
}

export async function historyByType(measurementType) {
  return apiClient.get(`/quantities/history/type/${measurementType}`);
}

export async function operationCount(operation) {
  return apiClient.get(`/quantities/count/${operation}`);
}

export { getToken, setToken, clearToken };
