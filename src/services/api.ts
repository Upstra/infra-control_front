import axios from 'axios';
import type { AuthResponse } from '@/features/auth/types';
import { getToken, setToken, clearToken } from '@/features/auth/token';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

const token = getToken();
if (token) {
  api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
}

api.interceptors.request.use((config) => {
  if (!config.headers?.Authorization) {
    const storedToken = getToken();
    if (storedToken) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${storedToken}`;
    }
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const authPatterns = [
      '/auth/login',
      '/auth/refresh',
      '/auth/register',
      '/auth/2fa/',
      '/auth/forgot-password',
      '/auth/reset-password',
    ];

    const requestUrl = originalRequest.url || '';
    const isAuthEndpoint = authPatterns.some((pattern) =>
      requestUrl.includes(pattern),
    );

    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !isAuthEndpoint
    ) {
      originalRequest._retry = true;
      try {
        const { data } = await api.post<AuthResponse>(
          '/auth/refresh',
          {},
          {
            withCredentials: true,
          },
        );
        const newToken = data.accessToken;
        setToken(newToken);
        api.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
        originalRequest.headers = originalRequest.headers || {};
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        clearToken();
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  },
);

export default api;
