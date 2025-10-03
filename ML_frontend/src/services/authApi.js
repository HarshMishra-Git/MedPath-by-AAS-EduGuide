import axios from 'axios';
import toast from 'react-hot-toast';

// Base URL for auth backend
const AUTH_API_URL = import.meta.env.VITE_AUTH_API_URL || 'http://localhost:5000/api';

// Create axios instance
const authApi = axios.create({
  baseURL: AUTH_API_URL,
  adapter: 'xhr', // Force XMLHttpRequest instead of fetch to avoid polyfill issues
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Request interceptor - Add auth token to requests
authApi.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - Handle errors globally
authApi.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error.response?.data?.message || 'Something went wrong';
    
    // Handle token expiration
    if (error.response?.status === 401) {
      localStorage.removeItem('authToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      
      // Only redirect if not already on auth pages
      if (!window.location.pathname.includes('/login') && 
          !window.location.pathname.includes('/signup')) {
        toast.error('Session expired. Please login again.');
        setTimeout(() => {
          window.location.href = '/login';
        }, 1000);
      }
    }
    
    return Promise.reject(error);
  }
);

// Auth API functions
export const authService = {
  // Signup
  async signup(data) {
    const response = await authApi.post('/auth/signup', data);
    if (response.data.success) {
      this.setAuthData(response.data);
    }
    return response.data;
  },

  // Login
  async login(credentials) {
    const response = await authApi.post('/auth/login', credentials);
    if (response.data.success) {
      this.setAuthData(response.data);
    }
    return response.data;
  },

  // Verify token
  async verifyToken() {
    try {
      const response = await authApi.get('/auth/verify');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get user profile
  async getProfile() {
    const response = await authApi.get('/auth/profile');
    return response.data;
  },

  // Logout
  async logout() {
    try {
      await authApi.post('/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      this.clearAuthData();
    }
  },

  // Helper: Set auth data in localStorage
  setAuthData(data) {
    if (data.token) {
      localStorage.setItem('authToken', data.token);
    }
    if (data.refreshToken) {
      localStorage.setItem('refreshToken', data.refreshToken);
    }
    if (data.data) {
      localStorage.setItem('user', JSON.stringify(data.data.user || data.data));
    }
  },

  // Helper: Clear auth data
  clearAuthData() {
    localStorage.removeItem('authToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
  },

  // Helper: Check if user is authenticated
  isAuthenticated() {
    return !!localStorage.getItem('authToken');
  },

  // Helper: Get current user
  getCurrentUser() {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  },
};

export default authApi;