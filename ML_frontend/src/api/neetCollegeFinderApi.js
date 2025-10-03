import axios from 'axios';
import { env } from '../config/env.js';

// API Configuration from Environment
const NEET_API_BASE_URL = env.NEET_API_URL;
const API_TIMEOUT = env.API_TIMEOUT;

// Create axios instance with default config
const neetApi = axios.create({
  baseURL: NEET_API_BASE_URL,
  timeout: API_TIMEOUT,
  adapter: 'xhr', // Force XMLHttpRequest instead of fetch to avoid polyfill issues
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Request interceptor for logging
neetApi.interceptors.request.use(
  (config) => {
    config.metadata = { startTime: Date.now() };
    
    if (env.FEATURES.ENABLE_DEBUG) {
      console.log(`🚀 NEET API Request: ${config.method?.toUpperCase()} ${config.url}`);
      console.log(`📍 API Base URL: ${NEET_API_BASE_URL}`);
    }
    
    return config;
  },
  (error) => {
    console.error('❌ NEET API Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
neetApi.interceptors.response.use(
  (response) => {
    const duration = Date.now() - response.config.metadata.startTime;
    
    if (env.FEATURES.ENABLE_DEBUG) {
      console.log(`✅ NEET API Response: ${response.config.url} (${duration}ms)`);
      if (env.IS_DEVELOPMENT && response.data) {
        console.log('📊 Response Data:', response.data);
      }
    }
    
    return response;
  },
  (error) => {
    const duration = error.config?.metadata?.startTime 
      ? Date.now() - error.config.metadata.startTime 
      : 0;
    
    console.error(`❌ NEET API Error: ${error.config?.url} (${duration}ms)`, error.response?.data || error.message);
    
    // Enhance error with user-friendly messages
    if (error.response?.status === 500) {
      error.userMessage = 'Our NEET college finder service is temporarily unavailable. Please try again in a few minutes.';
    } else if (error.response?.status === 429) {
      error.userMessage = 'Too many requests. Please wait a moment before trying again.';
    } else if (error.code === 'ECONNABORTED') {
      error.userMessage = 'The search is taking longer than expected. Please try again.';
    } else if (!error.response) {
      error.userMessage = 'Unable to connect to the college finder service. Please check your internet connection.';
    } else {
      error.userMessage = error.response?.data?.detail || 'An unexpected error occurred while searching for colleges.';
    }
    
    return Promise.reject(error);
  }
);

// API Methods
export const neetCollegeFinderApi = {
  // Health check
  async checkHealth() {
    try {
      const response = await neetApi.get(env.ENDPOINTS.HEALTH);
      return response.data;
    } catch (error) {
      throw new Error(error.userMessage || 'Health check failed');
    }
  },

  // Get available states for given exam type
  async getStates(examType) {
    try {
      const response = await neetApi.get(env.ENDPOINTS.STATES, {
        params: { exam_type: examType }
      });
      return response.data.states;
    } catch (error) {
      throw new Error(error.userMessage || 'Failed to get states');
    }
  },

  // Get available quotas based on exam type and preference
  async getQuotas(examType, preference, state = null) {
    try {
      const response = await neetApi.get(env.ENDPOINTS.QUOTAS, {
        params: { 
          exam_type: examType, 
          preference: preference,
          state: state
        }
      });
      return response.data.quotas;
    } catch (error) {
      throw new Error(error.userMessage || 'Failed to get quotas');
    }
  },

  // Get available categories based on selections
  async getCategories(examType, preference, state = null, quota = null) {
    try {
      const response = await neetApi.get(env.ENDPOINTS.CATEGORIES, {
        params: { 
          exam_type: examType, 
          preference: preference,
          state: state,
          quota: quota
        }
      });
      return response.data.categories;
    } catch (error) {
      throw new Error(error.userMessage || 'Failed to get categories');
    }
  },

  // Get available courses based on selections
  async getCourses(examType, preference, state = null, quota = null, category = null) {
    try {
      const response = await neetApi.get(env.ENDPOINTS.COURSES, {
        params: { 
          exam_type: examType, 
          preference: preference,
          state: state,
          quota: quota,
          category: category
        }
      });
      return response.data.courses;
    } catch (error) {
      throw new Error(error.userMessage || 'Failed to get courses');
    }
  },

  // Search for colleges based on criteria
  async searchColleges(searchRequest) {
    try {
      // Validate required fields
      const requiredFields = ['exam_type', 'preference', 'category', 'course', 'rank_min', 'rank_max'];
      for (const field of requiredFields) {
        if (searchRequest[field] === undefined || searchRequest[field] === null) {
          throw new Error(`Missing required field: ${field}`);
        }
      }

      // Validate rank range
      if (searchRequest.rank_min > searchRequest.rank_max) {
        throw new Error('Minimum rank cannot be greater than maximum rank');
      }

      // Validate rank limits based on exam type
      const maxRankLimit = searchRequest.exam_type === 'NEET-UG' ? 1250000 : 200000;
      if (searchRequest.rank_max > maxRankLimit) {
        throw new Error(`Rank range exceeds limit for ${searchRequest.exam_type} (max: ${maxRankLimit})`);
      }

      const response = await neetApi.post(env.ENDPOINTS.SEARCH, searchRequest);
      return response.data;
    } catch (error) {
      if (error.message.includes('Missing required field') || 
          error.message.includes('rank') || 
          error.message.includes('limit')) {
        throw error;
      }
      throw new Error(error.userMessage || 'College search failed');
    }
  },

  // Get exam type options
  getExamTypes() {
    return ['NEET-UG', 'NEET-PG'];
  },

  // Get preference options
  getPreferences() {
    return ['All India', 'State Wise'];
  },

  // Validate rank range for exam type
  validateRankRange(examType, rankMin, rankMax) {
    const maxLimit = examType === 'NEET-UG' ? 1250000 : 200000;
    
    if (rankMin < 1) {
      return 'Minimum rank must be at least 1';
    }
    
    if (rankMax > maxLimit) {
      return `Maximum rank cannot exceed ${maxLimit.toLocaleString()} for ${examType}`;
    }
    
    if (rankMin > rankMax) {
      return 'Minimum rank cannot be greater than maximum rank';
    }
    
    return null; // Valid
  },

  // Format college recommendation for display
  formatRecommendation(recommendation) {
    return {
      ...recommendation,
      formattedFee: this.formatFee(recommendation.fee),
      formattedStipend: this.formatStipend(recommendation.stipend),
      safetyColor: this.getSafetyColor(recommendation.safety_level),
      safetyIcon: this.getSafetyIcon(recommendation.safety_level)
    };
  },

  // Format fee for display
  formatFee(fee) {
    if (!fee || fee === '0' || fee === 'N/A') return 'Not specified';
    
    // Remove currency symbols and clean up
    let cleanFee = fee.toString().replace(/[₹,\s]/g, '');
    
    if (isNaN(cleanFee)) return fee;
    
    const amount = parseInt(cleanFee);
    if (amount === 0) return 'Free';
    
    // Convert to readable format
    if (amount >= 100000) {
      return `₹${(amount / 100000).toFixed(1)} Lakh`;
    } else if (amount >= 1000) {
      return `₹${(amount / 1000).toFixed(0)}K`;
    } else {
      return `₹${amount}`;
    }
  },

  // Format stipend for display
  formatStipend(stipend) {
    if (!stipend || stipend === 'N/A' || stipend === '0') return 'Not specified';
    return stipend;
  },

  // Get color for safety level
  getSafetyColor(safetyLevel) {
    const colors = {
      'Very Safe': 'text-green-600 bg-green-50 border-green-200',
      'Safe': 'text-green-600 bg-green-50 border-green-200',
      'Moderate': 'text-yellow-600 bg-yellow-50 border-yellow-200',
      'Good Chance': 'text-blue-600 bg-blue-50 border-blue-200',
      'Possible': 'text-orange-600 bg-orange-50 border-orange-200',
      'Risky': 'text-orange-600 bg-orange-50 border-orange-200',
      'Very Risky': 'text-red-600 bg-red-50 border-red-200',
      'No Data': 'text-gray-600 bg-gray-50 border-gray-200'
    };
    return colors[safetyLevel] || colors['No Data'];
  },

  // Get icon for safety level
  getSafetyIcon(safetyLevel) {
    const icons = {
      'Very Safe': '🟢',
      'Safe': '🟢',
      'Moderate': '🟡',
      'Good Chance': '🟡',
      'Possible': '🟠',
      'Risky': '🟠',
      'Very Risky': '🔴',
      'No Data': '⚪'
    };
    return icons[safetyLevel] || icons['No Data'];
  },

  // Export colleges as PDF
  async exportPDF(searchRequest) {
    // Check if PDF export is enabled
    if (!env.FEATURES.ENABLE_PDF_EXPORT) {
      throw new Error('PDF export feature is disabled');
    }
    
    try {
      if (env.FEATURES.ENABLE_DEBUG) {
        console.log('📄 Starting PDF export for request:', searchRequest);
      }
      
      // Validate required fields
      const requiredFields = ['exam_type', 'preference', 'category', 'course', 'rank_min', 'rank_max'];
      for (const field of requiredFields) {
        if (searchRequest[field] === undefined || searchRequest[field] === null) {
          throw new Error(`Missing required field: ${field}`);
        }
      }

      const response = await neetApi.post(env.ENDPOINTS.EXPORT_PDF, searchRequest, {
        responseType: 'blob' // Important for downloading files
      });
      
      return response.data;
    } catch (error) {
      throw new Error(error.userMessage || 'PDF export failed');
    }
  }
};

export default neetCollegeFinderApi;