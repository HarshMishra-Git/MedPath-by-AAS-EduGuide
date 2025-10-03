/**
 * Environment Configuration
 * Centralized environment variable management for the NEET College Finder
 */

// Utility function to get environment variable with fallback
const getEnvVar = (key, fallback = null, required = false) => {
  const value = import.meta.env[key]
  
  if (required && (value === undefined || value === null || value === '')) {
    throw new Error(`Required environment variable ${key} is not defined`)
  }
  
  return value || fallback
}

// Utility function to get boolean environment variable
const getBoolEnvVar = (key, fallback = false) => {
  const value = getEnvVar(key, fallback.toString())
  return value === 'true' || value === true
}

// Utility function to get number environment variable
const getNumEnvVar = (key, fallback = 0) => {
  const value = getEnvVar(key, fallback.toString())
  const parsed = parseInt(value, 10)
  return isNaN(parsed) ? fallback : parsed
}

// Build dynamic API URL from components or use direct URL
const buildApiUrl = () => {
  // First try direct URL
  const directUrl = getEnvVar('VITE_NEET_API_URL')
  if (directUrl) {
    return directUrl
  }
  
  // Build from components
  const protocol = getEnvVar('VITE_NEET_BACKEND_PROTOCOL', 'http')
  const host = getEnvVar('VITE_NEET_BACKEND_HOST', 'localhost')
  const port = getEnvVar('VITE_NEET_BACKEND_PORT', '8001')
  
  return `${protocol}://${host}:${port}`
}

// Environment Configuration Object
export const env = {
  // Application Info
  APP_NAME: getEnvVar('VITE_APP_NAME', 'NEET College Finder'),
  APP_VERSION: getEnvVar('VITE_APP_VERSION', '2.0.0'),
  APP_DESCRIPTION: getEnvVar('VITE_APP_DESCRIPTION', 'AI-Powered NEET College Finder'),
  
  // API Configuration
  NEET_API_URL: buildApiUrl(),
  ML_API_URL: getEnvVar('VITE_ML_API_URL', 'http://localhost:8000'),
  API_TIMEOUT: getNumEnvVar('VITE_API_TIMEOUT', 30000),
  
  // Backend Configuration
  NEET_BACKEND: {
    PROTOCOL: getEnvVar('VITE_NEET_BACKEND_PROTOCOL', 'http'),
    HOST: getEnvVar('VITE_NEET_BACKEND_HOST', 'localhost'),
    PORT: getEnvVar('VITE_NEET_BACKEND_PORT', '8001'),
    BASE_URL: buildApiUrl()
  },
  
  // API Endpoints
  ENDPOINTS: {
    HEALTH: getEnvVar('VITE_HEALTH_ENDPOINT', '/health'),
    SEARCH: getEnvVar('VITE_SEARCH_ENDPOINT', '/search'),
    EXPORT_PDF: getEnvVar('VITE_EXPORT_PDF_ENDPOINT', '/export-pdf'),
    STATES: getEnvVar('VITE_STATES_ENDPOINT', '/states'),
    QUOTAS: getEnvVar('VITE_QUOTAS_ENDPOINT', '/quotas'),
    CATEGORIES: getEnvVar('VITE_CATEGORIES_ENDPOINT', '/categories'),
    COURSES: getEnvVar('VITE_COURSES_ENDPOINT', '/courses')
  },
  
  // Feature Flags
  FEATURES: {
    ENABLE_ANALYTICS: getBoolEnvVar('VITE_ENABLE_ANALYTICS', true),
    ENABLE_PWA: getBoolEnvVar('VITE_ENABLE_PWA', true),
    ENABLE_DEBUG: getBoolEnvVar('VITE_ENABLE_DEBUG', true),
    ENABLE_PDF_EXPORT: getBoolEnvVar('VITE_ENABLE_PDF_EXPORT', true),
    ENABLE_NEET_FINDER: getBoolEnvVar('VITE_ENABLE_NEET_FINDER', true)
  },
  
  // External Services
  EXTERNAL: {
    GOOGLE_ANALYTICS_ID: getEnvVar('VITE_GOOGLE_ANALYTICS_ID', ''),
    SENTRY_DSN: getEnvVar('VITE_SENTRY_DSN', '')
  },
  
  // Environment Info
  NODE_ENV: import.meta.env.NODE_ENV || 'development',
  IS_DEVELOPMENT: import.meta.env.DEV || false,
  IS_PRODUCTION: import.meta.env.PROD || false,
  
  // Validation function
  validate() {
    const required = [
      'VITE_NEET_API_URL'
    ]
    
    const missing = required.filter(key => !import.meta.env[key])
    
    if (missing.length > 0) {
      console.warn(`⚠️  Missing optional environment variables: ${missing.join(', ')}`)
      console.warn('Using fallback values for missing variables')
    }
    
    console.log('🚀 Environment configuration loaded successfully')
    console.log(`📡 NEET API URL: ${this.NEET_API_URL}`)
    console.log(`🔧 Environment: ${this.NODE_ENV}`)
    console.log(`✨ Features: ${Object.entries(this.FEATURES).filter(([, enabled]) => enabled).map(([key]) => key).join(', ')}`)
    
    return true
  }
}

// Validate environment on import
if (env.FEATURES.ENABLE_DEBUG) {
  env.validate()
}

export default env