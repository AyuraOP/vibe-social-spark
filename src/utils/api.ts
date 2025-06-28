
import axios from 'axios';

// Backend configuration
const getBaseURL = () => {
  // Check if we're in development or production
  const isDevelopment = import.meta.env.DEV;
  
  // You can set these URLs based on your backend setup
  const DEVELOPMENT_URL = 'http://localhost:8000/api';
  const PRODUCTION_URL = 'https://your-backend-domain.com/api'; // Replace with your actual backend URL
  
  return isDevelopment ? DEVELOPMENT_URL : PRODUCTION_URL;
};

// Create axios instance with configurable settings
export const api = axios.create({
  baseURL: getBaseURL(),
  timeout: 10000, // 10 second timeout
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request/response logging in development
if (import.meta.env.DEV) {
  api.interceptors.request.use(
    (config) => {
      console.log(`🚀 API Request: ${config.method?.toUpperCase()} ${config.url}`);
      return config;
    },
    (error) => {
      console.error('❌ API Request Error:', error);
      return Promise.reject(error);
    }
  );

  api.interceptors.response.use(
    (response) => {
      console.log(`✅ API Response: ${response.status} ${response.config.url}`);
      return response;
    },
    (error) => {
      console.error('❌ API Response Error:', error.response?.status, error.config?.url);
      return Promise.reject(error);
    }
  );
}

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

// Request interceptor for auth token
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

// Response interceptor for token refresh and error handling
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Handle 401 errors (unauthorized) with token refresh
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

    // Handle other common HTTP errors
    if (error.response?.status >= 500) {
      console.error('Server error:', error.response.status);
      // You can add toast notifications here if needed
    } else if (error.response?.status === 403) {
      console.error('Access forbidden:', error.response.status);
    } else if (error.response?.status === 404) {
      console.error('Resource not found:', error.response.status);
    }

    return Promise.reject(error);
  }
);

// Helper function to check if backend is reachable
export const checkBackendHealth = async (): Promise<boolean> => {
  try {
    await api.get('/health/'); // Assuming your backend has a health check endpoint
    return true;
  } catch (error) {
    console.error('Backend health check failed:', error);
    return false;
  }
};

// Export the base URL for use in other parts of the app
export const API_BASE_URL = getBaseURL();
