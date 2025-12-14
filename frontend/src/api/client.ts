import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { useAuthStore } from '../store/authStore';

// Normalize API URL by removing trailing slash
const normalizeUrl = (url: string) => url.replace(/\/$/, '');
const API_URL = normalizeUrl(import.meta.env.VITE_API_URL || 'http://localhost:5000');

// Log API URL in development (not in production to avoid exposing URLs)
if (import.meta.env.DEV) {
  console.log('API URL:', API_URL);
}

const apiClient = axios.create({
  baseURL: `${API_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 second timeout
});

apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = useAuthStore.getState().token;
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      const currentPath = window.location.pathname;
      // Only redirect if not already on login/register page
      if (currentPath !== '/login' && currentPath !== '/register') {
        useAuthStore.getState().logout();
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;
