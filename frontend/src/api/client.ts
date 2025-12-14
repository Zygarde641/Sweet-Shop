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
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/c49dae96-4ee7-4b7f-a49b-2dc2505269f5',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'client.ts:21',message:'API request interceptor',data:{url:config.url,method:config.method,hasToken:!!useAuthStore.getState().token},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'G'})}).catch(()=>{});
    // #endregion
    const token = useAuthStore.getState().token;
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/c49dae96-4ee7-4b7f-a49b-2dc2505269f5',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'client.ts:29',message:'API request interceptor error',data:{error:error?.message},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
    // #endregion
    return Promise.reject(error);
  }
);

apiClient.interceptors.response.use(
  (response) => {
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/c49dae96-4ee7-4b7f-a49b-2dc2505269f5',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'client.ts:34',message:'API response success',data:{url:response.config.url,status:response.status},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'F'})}).catch(()=>{});
    // #endregion
    return response;
  },
  (error: AxiosError) => {
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/c49dae96-4ee7-4b7f-a49b-2dc2505269f5',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'client.ts:36',message:'API response error',data:{url:error.config?.url,status:error.response?.status,code:error.code,message:error.message},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
    // #endregion
    if (error.response?.status === 401) {
      const currentPath = window.location.pathname;
      // Only redirect if not already on login/register page
      if (currentPath !== '/login' && currentPath !== '/register') {
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/c49dae96-4ee7-4b7f-a49b-2dc2505269f5',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'client.ts:40',message:'401 redirect triggered',data:{currentPath},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'H'})}).catch(()=>{});
        // #endregion
        useAuthStore.getState().logout();
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;
