import axios from 'axios';
import { localAdapter } from './localBackend';

/**
 * If VITE_API_URL is set, talk to the real Express/MongoDB backend.
 * If not (e.g. Google AI Studio, where no server can run), use the built-in
 * in-browser backend so booking, login and admin features still work.
 */
// The real backend is used ONLY when explicitly enabled, so a leftover
// VITE_API_URL (e.g. copied from .env.example into AI Studio settings)
// can never send requests to a localhost server that does not exist.
const REAL_API_URL =
  import.meta.env.VITE_USE_REAL_API === 'true' ? (import.meta.env.VITE_API_URL as string | undefined) : undefined;
export const USING_LOCAL_BACKEND = !REAL_API_URL;

if (USING_LOCAL_BACKEND) {
  console.info('[IMovies] Using built-in in-browser backend (no server needed).');
  // Drop sessions created by older builds; they are not valid for the local backend.
  try {
    const t = localStorage.getItem('imovies_token');
    if (t && !t.startsWith('local.')) {
      localStorage.removeItem('imovies_token');
      localStorage.removeItem('imovies_user');
    }
  } catch {
    /* ignore */
  }
}

const API = axios.create({
  baseURL: REAL_API_URL || '/api',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 8000,
  ...(USING_LOCAL_BACKEND ? { adapter: localAdapter } : {}),
});

// Request Interceptor: Injects Bearer token automatically
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('imovies_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Handles 401 Unauthorized and expired tokens
API.interceptors.response.use(
  (response) => response,
  (error) => {
    const hadToken = !!localStorage.getItem('imovies_token');
    if (error.response && error.response.status === 401 && hadToken) {
      // Clear expired credentials
      localStorage.removeItem('imovies_token');
      localStorage.removeItem('imovies_user');

      // Redirect to login if user was on a protected screen
      if (window.location.pathname !== '/login' && window.location.pathname !== '/register') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default API;
