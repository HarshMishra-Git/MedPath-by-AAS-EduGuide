import { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/authApi';
import toast from 'react-hot-toast';
import Cookies from 'js-cookie';
import axios from 'axios';

const API_BASE = import.meta.env.VITE_AUTH_API_URL || 'http://localhost:5000/api';

// Create axios instance for auth
const authAxios = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
authAxios.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check authentication on mount
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setLoading(false);
        setIsAuthenticated(false);
        setUser(null);
        return;
      }
      
      const response = await authAxios.get('/auth/verify');
      if (response.data.success) {
        setUser(response.data.data);
        setIsAuthenticated(true);
      }
    } catch (error) {
      console.error('Auth verification failed:', error);
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      Cookies.remove('token');
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      const response = await authAxios.post('/auth/login', { email, password });
      
      if (response.data.success) {
        const { token, refreshToken, data } = response.data;
        
        localStorage.setItem('token', token);
        localStorage.setItem('refreshToken', refreshToken);
        Cookies.set('token', token, { expires: 1 });
        
        setUser(data.user);
        setIsAuthenticated(true);
        
        toast.success('Login successful!');
        return { success: true, data: data.user, message: response.data.message };
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Login failed';
      toast.error(message);
      throw new Error(message);
    }
  };

  const signup = async (userData) => {
    try {
      const response = await authAxios.post('/auth/signup', userData);
      
      if (response.data.success) {
        const { token, refreshToken, data } = response.data;
        
        localStorage.setItem('token', token);
        localStorage.setItem('refreshToken', refreshToken);
        Cookies.set('token', token, { expires: 1 });
        
        setUser(data);
        setIsAuthenticated(true);
        
        toast.success('Account created successfully!');
        return { success: true, data, message: response.data.message };
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Signup failed';
      toast.error(message);
      throw new Error(message);
    }
  };

  const googleLogin = async (credential) => {
    try {
      const response = await authAxios.post('/auth/google-login', { token: credential });
      
      if (response.data.success) {
        const { accessToken, refreshToken, user: userData } = response.data.data;
        
        localStorage.setItem('token', accessToken);
        localStorage.setItem('refreshToken', refreshToken);
        Cookies.set('token', accessToken, { expires: 1 });
        
        setUser(userData);
        setIsAuthenticated(true);
        
        toast.success('Google login successful!');
        return { success: true, data: userData, message: response.data.message };
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Google login failed';
      toast.error(message);
      throw new Error(message);
    }
  };

  const sendOTP = async (type, identifier) => {
    try {
      const response = await authAxios.post('/auth/send-otp', { type, identifier });
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to send OTP';
      throw new Error(message);
    }
  };

  const verifyOTP = async (identifier, otp, type) => {
    try {
      const response = await authAxios.post('/auth/verify-otp', { identifier, otp, type });
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || 'OTP verification failed';
      throw new Error(message);
    }
  };

  const getPaymentConfig = async () => {
    try {
      const response = await authAxios.get('/payment/config');
      return response.data.data;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to get payment config';
      throw new Error(message);
    }
  };

  const createPaymentOrder = async (amount) => {
    try {
      const response = await authAxios.post('/payment/create-order', { amount });
      if (response.data.success) {
        return response.data.data;
      }
      throw new Error(response.data.message || 'Failed to create order');
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to create payment order';
      toast.error(message);
      throw new Error(message);
    }
  };

  const verifyPaymentSignature = async (paymentData) => {
    try {
      const response = await authAxios.post('/payment/verify', paymentData);
      if (response.data.success) {
        // Update user status
        setUser(prev => ({ 
          ...prev, 
          paymentStatus: 'COMPLETED',
          accountStatus: 'ACTIVE'
        }));
        // Recheck auth to get updated user data
        await checkAuth();
        return response.data;
      }
      throw new Error(response.data.message || 'Payment verification failed');
    } catch (error) {
      const message = error.response?.data?.message || 'Payment verification failed';
      toast.error(message);
      throw new Error(message);
    }
  };

  const makePayment = async (paymentData) => {
    try {
      const response = await authAxios.post('/payment/verify', paymentData);
      if (response.data.success) {
        setUser(prev => ({ ...prev, paymentStatus: 'COMPLETED', accountStatus: 'ACTIVE' }));
        toast.success('Payment successful!');
      }
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || 'Payment failed';
      toast.error(message);
      throw new Error(message);
    }
  };

  const checkPaymentStatus = async () => {
    try {
      const response = await authAxios.get('/payment/status');
      return response.data.data;
    } catch (error) {
      return { hasPaid: false };
    }
  };

  const logout = async () => {
    try {
      await authAxios.post('/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
      setIsAuthenticated(false);
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      Cookies.remove('token');
      toast.success('Logged out successfully');
    }
  };

  const updateUser = (updatedData) => {
    setUser((prev) => ({ ...prev, ...updatedData }));
    const userStr = localStorage.getItem('user');
    if (userStr) {
      const user = JSON.parse(userStr);
      localStorage.setItem('user', JSON.stringify({ ...user, ...updatedData }));
    }
  };

  const value = {
    user,
    loading,
    isAuthenticated,
    login,
    signup,
    googleLogin,
    sendOTP,
    verifyOTP,
    getPaymentConfig,
    createPaymentOrder,
    verifyPaymentSignature,
    makePayment,
    checkPaymentStatus,
    logout,
    updateUser,
    checkAuth,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;