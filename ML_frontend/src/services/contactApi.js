import axios from 'axios';

// API Configuration
const AUTH_API_BASE_URL = import.meta.env.VITE_AUTH_API_URL || 'http://localhost:5000';
const API_TIMEOUT = 10000; // 10 seconds for contact form submission

// Create axios instance with default config
const contactApi = axios.create({
  baseURL: AUTH_API_BASE_URL,
  timeout: API_TIMEOUT,
  adapter: 'xhr', // Force XMLHttpRequest instead of fetch to avoid polyfill issues
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Request interceptor for logging
contactApi.interceptors.request.use(
  (config) => {
    config.metadata = { startTime: Date.now() };
    
    if (import.meta.env.DEV) {
      console.log(`🚀 Contact API Request: ${config.method?.toUpperCase()} ${config.url}`);
    }
    
    return config;
  },
  (error) => {
    console.error('❌ Contact API Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
contactApi.interceptors.response.use(
  (response) => {
    const duration = Date.now() - response.config.metadata.startTime;
    
    if (import.meta.env.DEV) {
      console.log(`✅ Contact API Response: ${response.config.url} (${duration}ms)`);
    }
    
    return response;
  },
  (error) => {
    const duration = error.config?.metadata?.startTime 
      ? Date.now() - error.config.metadata.startTime 
      : 0;
    
    console.error(`❌ Contact API Error: ${error.config?.url} (${duration}ms)`, error.response?.data || error.message);
    
    // Enhance error with user-friendly messages
    if (error.response?.status === 500) {
      error.userMessage = 'Our contact service is temporarily unavailable. Please try again in a few minutes.';
    } else if (error.response?.status === 429) {
      error.userMessage = 'Too many contact requests. Please wait a moment before trying again.';
    } else if (error.code === 'ECONNABORTED') {
      error.userMessage = 'The submission is taking longer than expected. Please try again.';
    } else if (!error.response) {
      error.userMessage = 'Unable to connect to the contact service. Please check your internet connection.';
    } else {
      error.userMessage = error.response?.data?.message || 'An unexpected error occurred during form submission.';
    }
    
    return Promise.reject(error);
  }
);

/**
 * Contact API Service
 * 
 * This service handles contact form submissions.
 * Currently uses simulated submission, but structured for easy backend integration.
 * 
 * To integrate with real backend:
 * 1. Add VITE_AUTH_API_URL to .env file
 * 2. Create POST /api/contact endpoint in auth_backend
 * 3. Set ENABLE_REAL_CONTACT_API to true in this file
 */

// Feature flag: Set to true when backend endpoint is ready
const ENABLE_REAL_CONTACT_API = true; // ✅ Now using real backend API

export const contactApiService = {
  /**
   * Submit contact form
   * @param {Object} contactData - Contact form data
   * @param {string} contactData.name - Full name
   * @param {string} contactData.email - Email address
   * @param {string} contactData.subject - Message subject
   * @param {string} contactData.category - Inquiry category
   * @param {string} contactData.message - Message content
   * @param {string} [contactData.phone] - Optional phone number
   * @param {string} [contactData.organization] - Optional organization
   * @returns {Promise<Object>} Submission response
   */
  async submitContact(contactData) {
    try {
      // Validate required fields
      const requiredFields = ['name', 'email', 'subject', 'category', 'message'];
      for (const field of requiredFields) {
        if (!contactData[field]) {
          throw new Error(`Missing required field: ${field}`);
        }
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(contactData.email)) {
        throw new Error('Invalid email format');
      }

      // If real API is enabled, make actual API call
      if (ENABLE_REAL_CONTACT_API) {
        const response = await contactApi.post('/contact', {
          name: contactData.name,
          email: contactData.email,
          subject: contactData.subject,
          category: contactData.category,
          message: contactData.message,
          phone: contactData.phone || null,
          organization: contactData.organization || null,
          submitted_at: new Date().toISOString()
        });
        
        return {
          success: true,
          message: response.data.message || 'Message sent successfully!',
          ticket_id: response.data.ticket_id || null
        };
      }

      // Otherwise, simulate submission with realistic delay
      await new Promise(resolve => setTimeout(resolve, 1500 + Math.random() * 1000));

      // Simulate occasional failures (10% chance) for testing error handling
      if (import.meta.env.DEV && Math.random() < 0.1) {
        throw new Error('Simulated random failure for testing');
      }

      // Store in localStorage for development/debugging
      if (import.meta.env.DEV) {
        const submissions = JSON.parse(localStorage.getItem('contact_submissions') || '[]');
        submissions.push({
          ...contactData,
          id: Date.now().toString(),
          submitted_at: new Date().toISOString(),
          status: 'pending'
        });
        localStorage.setItem('contact_submissions', JSON.stringify(submissions));
        console.log('📧 Contact form stored locally:', contactData);
      }

      return {
        success: true,
        message: 'Message sent successfully! We\'ll get back to you within 24 hours.',
        ticket_id: `TICKET-${Date.now().toString().slice(-8)}`,
        simulated: true // Indicates this was a simulated submission
      };

    } catch (error) {
      console.error('Contact submission error:', error);
      
      if (error.message.includes('Missing required field') || error.message.includes('Invalid email')) {
        throw error;
      }
      
      throw new Error(error.userMessage || error.message || 'Failed to submit contact form');
    }
  },

  /**
   * Get all contact submissions (for development/debugging)
   * Only works when submissions are stored locally
   */
  async getLocalSubmissions() {
    if (!import.meta.env.DEV) {
      throw new Error('This feature is only available in development mode');
    }
    
    const submissions = JSON.parse(localStorage.getItem('contact_submissions') || '[]');
    return submissions;
  },

  /**
   * Clear all local contact submissions (for development/debugging)
   */
  async clearLocalSubmissions() {
    if (!import.meta.env.DEV) {
      throw new Error('This feature is only available in development mode');
    }
    
    localStorage.removeItem('contact_submissions');
    console.log('🗑️  Local contact submissions cleared');
    return { success: true };
  },

  /**
   * Validate contact form data
   * @param {Object} data - Contact form data
   * @returns {Object} Validation result with errors
   */
  validateContactData(data) {
    const errors = {};

    if (!data.name || data.name.length < 2) {
      errors.name = 'Name must be at least 2 characters';
    }

    if (!data.email) {
      errors.email = 'Email is required';
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(data.email)) {
        errors.email = 'Invalid email format';
      }
    }

    if (!data.subject || data.subject.length < 5) {
      errors.subject = 'Subject must be at least 5 characters';
    }

    if (!data.category) {
      errors.category = 'Please select a category';
    }

    if (!data.message || data.message.length < 20) {
      errors.message = 'Message must be at least 20 characters';
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  }
};

export default contactApiService;
