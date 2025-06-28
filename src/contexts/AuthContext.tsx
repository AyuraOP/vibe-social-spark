
import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { api, setAuthToken } from '../utils/api';

interface User {
  id: number;
  username: string;
  email: string;
  profile_picture?: string;
  followers_count: number;
  following_count: number;
}

interface AuthState {
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<any>;
  register: (username: string, email: string, password: string, confirmPassword: string) => Promise<any>;
  logout: () => void;
  verifyOTP: (email: string, otp: string) => Promise<any>;
  resendOTP: (email: string) => Promise<any>;
  forgotPassword: (email: string) => Promise<any>;
  verifyForgotOTP: (email: string, otp: string) => Promise<any>;
  resetPassword: (email: string, otp: string, password: string) => Promise<any>;
  refreshAccessToken: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

type AuthAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_USER'; payload: User }
  | { type: 'SET_TOKENS'; payload: { token: string; refreshToken: string } }
  | { type: 'CLEAR_AUTH' };

const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_USER':
      return { ...state, user: action.payload, isAuthenticated: true, isLoading: false };
    case 'SET_TOKENS':
      return { 
        ...state, 
        token: action.payload.token, 
        refreshToken: action.payload.refreshToken,
        isAuthenticated: true 
      };
    case 'CLEAR_AUTH':
      return {
        user: null,
        token: null,
        refreshToken: null,
        isLoading: false,
        isAuthenticated: false
      };
    default:
      return state;
  }
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, {
    user: null,
    token: localStorage.getItem('accessToken'),
    refreshToken: localStorage.getItem('refreshToken'),
    isLoading: false,
    isAuthenticated: false
  });

  useEffect(() => {
    if (state.token) {
      setAuthToken(state.token);
      // Verify token and get user info
      fetchUserProfile();
    }
  }, [state.token]);

  const fetchUserProfile = async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const response = await api.get('/users/profile/');
      dispatch({ type: 'SET_USER', payload: response.data });
    } catch (error) {
      console.error('Failed to fetch user profile:', error);
      logout();
    }
  };

  const login = async (email: string, password: string) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const response = await api.post('/auth/login/', { email, password });
      
      const { access, refresh, user } = response.data;
      
      localStorage.setItem('accessToken', access);
      localStorage.setItem('refreshToken', refresh);
      
      dispatch({ type: 'SET_TOKENS', payload: { token: access, refreshToken: refresh } });
      dispatch({ type: 'SET_USER', payload: user });
      
      setAuthToken(access);
      
      return response.data;
    } catch (error) {
      dispatch({ type: 'SET_LOADING', payload: false });
      throw error;
    }
  };

  const register = async (username: string, email: string, password: string, confirmPassword: string) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const response = await api.post('/auth/register/', {
        username,
        email,
        password,
        confirm_password: confirmPassword
      });
      dispatch({ type: 'SET_LOADING', payload: false });
      return response.data;
    } catch (error) {
      dispatch({ type: 'SET_LOADING', payload: false });
      throw error;
    }
  };

  const logout = async () => {
    try {
      if (state.refreshToken) {
        await api.post('/auth/logout/', { refresh: state.refreshToken });
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      setAuthToken(null);
      dispatch({ type: 'CLEAR_AUTH' });
    }
  };

  const verifyOTP = async (email: string, otp: string) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const response = await api.post('/auth/verify-otp/', { email, otp });
      dispatch({ type: 'SET_LOADING', payload: false });
      return response.data;
    } catch (error) {
      dispatch({ type: 'SET_LOADING', payload: false });
      throw error;
    }
  };

  const resendOTP = async (email: string) => {
    return await api.post('/auth/resend-otp/', { email });
  };

  const forgotPassword = async (email: string) => {
    return await api.post('/auth/forgot-password/', { email });
  };

  const verifyForgotOTP = async (email: string, otp: string) => {
    return await api.post('/auth/verify-forgot-otp/', { email, otp });
  };

  const resetPassword = async (email: string, otp: string, password: string) => {
    return await api.post('/auth/reset-password/', { email, otp, password });
  };

  const refreshAccessToken = async (): Promise<boolean> => {
    try {
      if (!state.refreshToken) return false;
      
      const response = await api.post('/auth/refresh/', {
        refresh: state.refreshToken
      });
      
      const { access } = response.data;
      localStorage.setItem('accessToken', access);
      dispatch({ type: 'SET_TOKENS', payload: { token: access, refreshToken: state.refreshToken } });
      setAuthToken(access);
      
      return true;
    } catch (error) {
      logout();
      return false;
    }
  };

  const value: AuthContextType = {
    ...state,
    login,
    register,
    logout,
    verifyOTP,
    resendOTP,
    forgotPassword,
    verifyForgotOTP,
    resetPassword,
    refreshAccessToken
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
