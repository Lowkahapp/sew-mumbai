import axios from 'axios';

/**
 * Axios API client for SewMumbai.
 * - Local / Vite: proxied `/api` → http://localhost:5000
 * - Vercel prod: same-origin `/api` serverless function
 * Override with VITE_API_URL when needed.
 */
const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

const TOKEN_KEY = 'sewmumbai_token';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
});

/** Attach stored JWT to protected requests */
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

/** Normalize API error messages for the UI */
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error.response?.data?.message || error.message || 'Request failed';
    return Promise.reject(new Error(message));
  }
);

export { API_BASE_URL, TOKEN_KEY };
export default api;
