import axios from 'axios';
import { useAuthStore } from '@/stores/authStore';

// Use environment variable for API URL in production, fallback to /api for dev proxy
const API_BASE_URL = import.meta.env.VITE_API_URL 
  ? `${import.meta.env.VITE_API_URL}/api`
  : '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests (don't overwrite if already set)
api.interceptors.request.use((config) => {
  if (!config.headers.Authorization) {
    const token = useAuthStore.getState().accessToken;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// Handle 401 responses by logging out (but not during login flow)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Only logout on 401 if we're already authenticated and it's not the login endpoint
    const isLoginEndpoint = error.config?.url?.includes('/auth/login');
    const isMeEndpoint = error.config?.url?.includes('/auth/me');
    const isAuthenticated = useAuthStore.getState().isAuthenticated;
    
    if (error.response?.status === 401 && isAuthenticated && !isLoginEndpoint && !isMeEndpoint) {
      useAuthStore.getState().logout();
    }
    return Promise.reject(error);
  }
);

export default api;

export const handleApiError = (error: unknown): string => {
  if (axios.isAxiosError(error)) {
    const message = error.response?.data?.detail;
    if (typeof message === 'string') return message;
    if (Array.isArray(message)) return message[0]?.msg || 'An error occurred';
    return error.message;
  }
  return 'An unexpected error occurred';
};
