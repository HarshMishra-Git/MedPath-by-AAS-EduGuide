import axios from 'axios';

// API Configuration
const ML_API_BASE_URL = import.meta.env.VITE_ML_API_URL || 'http://localhost:8000';
const API_TIMEOUT = 30000; // 30 seconds for ML predictions

// Create axios instance with default config
const mlApi = axios.create({
  baseURL: ML_API_BASE_URL,
  timeout: API_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Request interceptor for authentication and logging
mlApi.interceptors.request.use(
  (config) => {
    // Add timestamp for request tracking
    config.metadata = { startTime: Date.now() };
    
    // Log API calls in development
    if (import.meta.env.DEV) {
      console.log(`🚀 ML API Request: ${config.method?.toUpperCase()} ${config.url}`);
    }
    
    return config;
  },
  (error) => {
    console.error('❌ ML API Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for error handling and logging
mlApi.interceptors.response.use(
  (response) => {
    // Calculate request duration
    const duration = Date.now() - response.config.metadata.startTime;
    
    if (import.meta.env.DEV) {
      console.log(`✅ ML API Response: ${response.config.url} (${duration}ms)`);
    }
    
    return response;
  },
  (error) => {
    const duration = error.config?.metadata?.startTime 
      ? Date.now() - error.config.metadata.startTime 
      : 0;
    
    console.error(`❌ ML API Error: ${error.config?.url} (${duration}ms)`, error.response?.data || error.message);
    
    // Enhance error with user-friendly messages
    if (error.response?.status === 500) {
      error.userMessage = 'Our ML prediction service is temporarily unavailable. Please try again in a few minutes.';
    } else if (error.response?.status === 429) {
      error.userMessage = 'Too many requests. Please wait a moment before trying again.';
    } else if (error.code === 'ECONNABORTED') {
      error.userMessage = 'The prediction is taking longer than expected. Please try again.';
    } else if (!error.response) {
      error.userMessage = 'Unable to connect to the prediction service. Please check your internet connection.';
    } else {
      error.userMessage = error.response?.data?.detail || 'An unexpected error occurred during prediction.';
    }
    
    return Promise.reject(error);
  }
);

// API Methods
export const mlApiService = {
  // Health check
  async checkHealth() {
    try {
      const response = await mlApi.get('/health');
      return response.data;
    } catch (error) {
      throw new Error(error.userMessage || 'Health check failed');
    }
  },

  // Get model information
  async getModelInfo() {
    try {
      const response = await mlApi.get('/model/info');
      return response.data;
    } catch (error) {
      throw new Error(error.userMessage || 'Failed to get model information');
    }
  },

  // Main prediction endpoint
  async predict(studentData) {
    try {
      // Validate required fields
      const requiredFields = ['neet_score', 'category', 'state_code', 'domicile_state'];
      for (const field of requiredFields) {
        if (!studentData[field]) {
          throw new Error(`Missing required field: ${field}`);
        }
      }

      const response = await mlApi.post('/predict', studentData);
      return response.data;
    } catch (error) {
      if (error.message.includes('Missing required field')) {
        throw error;
      }
      throw new Error(error.userMessage || 'Prediction failed');
    }
  },

  // Batch predictions for multiple scenarios
  async batchPredict(scenarios) {
    try {
      if (!Array.isArray(scenarios) || scenarios.length === 0) {
        throw new Error('Scenarios must be a non-empty array');
      }

      const response = await mlApi.post('/predict/batch', { scenarios });
      return response.data;
    } catch (error) {
      throw new Error(error.userMessage || 'Batch prediction failed');
    }
  },

  // Get college recommendations
  async getRecommendations(studentData, options = {}) {
    try {
      const requestData = {
        ...studentData,
        max_results: options.maxResults || 50,
        safety_level: options.safetyLevel || 'moderate',
        include_explanation: options.includeExplanation !== false,
      };

      const response = await mlApi.post('/recommendations', requestData);
      return response.data;
    } catch (error) {
      throw new Error(error.userMessage || 'Failed to get recommendations');
    }
  },

  // Get detailed college information
  async getCollegeDetails(collegeCode) {
    try {
      if (!collegeCode) {
        throw new Error('College code is required');
      }

      const response = await mlApi.get(`/college/${collegeCode}`);
      return response.data;
    } catch (error) {
      throw new Error(error.userMessage || 'Failed to get college details');
    }
  },

  // Get admission statistics
  async getAdmissionStats(filters = {}) {
    try {
      const response = await mlApi.get('/stats/admission', { params: filters });
      return response.data;
    } catch (error) {
      throw new Error(error.userMessage || 'Failed to get admission statistics');
    }
  },

  // Get cutoff trends
  async getCutoffTrends(collegeCode, courseCode, options = {}) {
    try {
      if (!collegeCode || !courseCode) {
        throw new Error('College code and course code are required');
      }

      const response = await mlApi.get(`/trends/cutoff/${collegeCode}/${courseCode}`, {
        params: {
          years: options.years || 5,
          category: options.category,
        }
      });
      return response.data;
    } catch (error) {
      throw new Error(error.userMessage || 'Failed to get cutoff trends');
    }
  },

  // Get expert analysis
  async getExpertAnalysis(studentData) {
    try {
      const response = await mlApi.post('/analysis/expert', studentData);
      return response.data;
    } catch (error) {
      throw new Error(error.userMessage || 'Failed to get expert analysis');
    }
  },

  // Get counseling strategy
  async getCounselingStrategy(studentData, preferences = {}) {
    try {
      const requestData = {
        ...studentData,
        preferences: {
          preferred_states: preferences.preferredStates || [],
          preferred_colleges: preferences.preferredColleges || [],
          budget_range: preferences.budgetRange,
          accommodation_preference: preferences.accommodationPreference,
          ...preferences
        }
      };

      const response = await mlApi.post('/counseling/strategy', requestData);
      return response.data;
    } catch (error) {
      throw new Error(error.userMessage || 'Failed to get counseling strategy');
    }
  },

  // Submit feedback
  async submitFeedback(feedbackData) {
    try {
      const response = await mlApi.post('/feedback', feedbackData);
      return response.data;
    } catch (error) {
      throw new Error(error.userMessage || 'Failed to submit feedback');
    }
  },

  // Get prediction history (if user authentication is implemented)
  async getPredictionHistory(userId, limit = 10) {
    try {
      const response = await mlApi.get(`/history/${userId}`, {
        params: { limit }
      });
      return response.data;
    } catch (error) {
      throw new Error(error.userMessage || 'Failed to get prediction history');
    }
  },

  // Export prediction results
  async exportResults(predictionId, format = 'pdf') {
    try {
      if (!predictionId) {
        throw new Error('Prediction ID is required');
      }

      const response = await mlApi.get(`/export/${predictionId}`, {
        params: { format },
        responseType: format === 'pdf' ? 'blob' : 'json'
      });

      if (format === 'pdf') {
        // Create download link for PDF
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `neet_prediction_${predictionId}.pdf`);
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
        
        return { success: true, message: 'PDF downloaded successfully' };
      }

      return response.data;
    } catch (error) {
      throw new Error(error.userMessage || 'Failed to export results');
    }
  }
};

// Utility functions for data transformation
export const apiUtils = {
  // Transform frontend form data to API format
  transformStudentData(formData) {
    return {
      neet_score: parseInt(formData.neetScore) || 0,
      category: formData.category?.toUpperCase() || 'GENERAL',
      state_code: formData.stateCode?.toUpperCase() || '',
      domicile_state: formData.domicileState?.toUpperCase() || formData.stateCode?.toUpperCase() || '',
      physically_handicapped: formData.physicallyHandicapped === true,
      exam_year: parseInt(formData.examYear) || new Date().getFullYear(),
      preferred_courses: formData.preferredCourses || [],
      preferred_states: formData.preferredStates || [],
      max_rank_preference: parseInt(formData.maxRankPreference) || null,
      budget_constraint: parseFloat(formData.budgetConstraint) || null,
      additional_info: formData.additionalInfo || {}
    };
  },

  // Format API response for frontend consumption
  formatPredictionResponse(apiResponse) {
    return {
      ...apiResponse,
      predictions: apiResponse.predictions?.map(pred => ({
        ...pred,
        admission_probability: Math.round(pred.admission_probability * 100) / 100,
        confidence_score: Math.round(pred.confidence_score * 100) / 100,
        safety_level: pred.safety_level?.toLowerCase() || 'moderate'
      })) || [],
      summary: {
        ...apiResponse.summary,
        total_colleges: apiResponse.summary?.total_colleges || 0,
        high_probability_count: apiResponse.summary?.high_probability_count || 0,
        safe_options_count: apiResponse.summary?.safe_options_count || 0
      }
    };
  },

  // Validate student data before API call
  validateStudentData(data) {
    const errors = [];

    if (!data.neet_score || data.neet_score < 0 || data.neet_score > 720) {
      errors.push('NEET score must be between 0 and 720');
    }

    if (!data.category) {
      errors.push('Category is required');
    }

    if (!data.state_code) {
      errors.push('State is required');
    }

    if (errors.length > 0) {
      throw new Error(errors.join(', '));
    }

    return true;
  }
};

export default mlApiService;