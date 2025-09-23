// API Configuration
// Single source of truth for API base URL

const API_CONFIG = {
  BASE_URL: 'http://localhost:8000',
  ENDPOINTS: {
    HEALTH: '/health',
    STATES: '/states',
    QUOTAS: (state) => `/quotas/${state}`,
    CATEGORIES: (state, quota) => `/categories/${state}/${quota}`,
    COURSES: (state) => `/courses/${state}`,
    PREDICT: '/predict',
    FILTER_OPTIONS: '/filter-options'
  }
};

export default API_CONFIG;

// Convenience function to build full URLs
export const buildApiUrl = (endpoint) => {
  return `${API_CONFIG.BASE_URL}${endpoint}`;
};

// Convenience functions for common endpoints
export const API_URLS = {
  HEALTH: buildApiUrl(API_CONFIG.ENDPOINTS.HEALTH),
  STATES: buildApiUrl(API_CONFIG.ENDPOINTS.STATES),
  QUOTAS: (state) => buildApiUrl(API_CONFIG.ENDPOINTS.QUOTAS(state)),
  CATEGORIES: (state, quota) => buildApiUrl(API_CONFIG.ENDPOINTS.CATEGORIES(state, quota)),
  COURSES: (state) => buildApiUrl(API_CONFIG.ENDPOINTS.COURSES(state)),
  PREDICT: buildApiUrl(API_CONFIG.ENDPOINTS.PREDICT),
  FILTER_OPTIONS: buildApiUrl(API_CONFIG.ENDPOINTS.FILTER_OPTIONS)
};