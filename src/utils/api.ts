
import axios from 'axios';

// Create axios instance
export const api = axios.create({
  baseURL: 'http://localhost:8000/api', // Update this to your backend URL
  headers: {
    'Content-Type': 'application/json',
  },
});

let authContext: any = null;

export const setAuthContext = (context: any) => {
  authContext = context;
};

export const setAuthToken = (token: string | null) => {
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common['Authorization'];
  }
};

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (refreshToken && authContext?.refreshAccessToken) {
          const success = await authContext.refreshAccessToken();
          if (success) {
            return api(originalRequest);
          }
        }
      } catch (refreshError) {
        console.error('Token refresh failed:', refreshError);
        if (authContext?.logout) {
          authContext.logout();
        }
      }
    }

    return Promise.reject(error);
  }
);
