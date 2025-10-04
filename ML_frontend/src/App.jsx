import React, { useState, useEffect } from 'react'
import { Routes, Route, useLocation } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'

// Authentication
import { AuthProvider } from './contexts/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'

// Layout Components
import Navbar from './components/layout/Navbar'
import Footer from './components/layout/Footer'
import LoadingScreen from './components/ui/LoadingScreen'
import ScrollToTop from './components/ui/ScrollToTop'

// Pages
import HomePage from './pages/HomePage'
import LoginPage from './pages/LoginPage'
import SignupPage from './pages/SignupPage'
import DashboardPage from './pages/DashboardPage'
import PredictionPage from './pages/PredictionPage'
import ResultsPage from './pages/ResultsPage'
import AboutPage from './pages/AboutPage'
import ContactPage from './pages/ContactPage'
import PrivacyPage from './pages/PrivacyPage'
import TermsPage from './pages/TermsPage'
import FAQPage from './pages/FAQPage'
import NotFoundPage from './pages/NotFoundPage'
import AdminContactsPage from './pages/AdminContactsPage'
import AdminLoginPage from './pages/AdminLoginPage'


// NEET College Finder API Health Check
import { mlApiService } from './api/mlApi'
import { neetCollegeFinderApi } from './api/neetCollegeFinderApi'

// Debug tools (development only rendering inside component)
import EnvDebug from './components/debug/EnvDebug'

// App loading states
const APP_LOADING_STATES = {
  INITIAL: 'initial',
  CHECKING_API: 'checking_api',
  READY: 'ready',
  ERROR: 'error'
}

function App() {
  const location = useLocation()
  const [appState, setAppState] = useState(APP_LOADING_STATES.INITIAL)
  const [apiHealthy, setApiHealthy] = useState(false)
  const [initError, setInitError] = useState(null)

  // Scroll to top on route changes
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
  }, [location.pathname])

  // Initialize app and check API health
  useEffect(() => {
    const initializeApp = async () => {
      try {
        setAppState(APP_LOADING_STATES.CHECKING_API)
        
        // Small delay for smooth loading experience
        await new Promise(resolve => setTimeout(resolve, 800))
        
        // Check NEET College Finder API health (non-blocking)
        try {
          await neetCollegeFinderApi.checkHealth()
          setApiHealthy(true)
          console.log('✅ NEET College Finder API is healthy')
        } catch (error) {
          setApiHealthy(false)
          console.warn('⚠️ NEET College Finder API health check failed:', error.message)
          // Don't block app initialization for API issues
        }
        
        setAppState(APP_LOADING_STATES.READY)
      } catch (error) {
        console.error('❌ App initialization failed:', error)
        setInitError(error.message)
        setAppState(APP_LOADING_STATES.ERROR)
      }
    }

    initializeApp()
  }, [])

  // Show loading screen during initialization
  if (appState !== APP_LOADING_STATES.READY) {
    return (
      <LoadingScreen 
        state={appState}
        error={initError}
        apiHealthy={apiHealthy}
      />
    )
  }

  return (
    <AuthProvider>
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-50 to-blue-50/20">
      {/* Simplified background pattern for better performance */}
      <div className="fixed inset-0 z-0">
        {/* Static grid pattern */}
        <div className="absolute inset-0 opacity-30" style={{
          backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(156, 163, 175, 0.15) 1px, transparent 0)',
          backgroundSize: '20px 20px'
        }} />
      </div>

      {/* Main app content */}
      <div className="relative z-10 flex flex-col min-h-screen">
        {/* Navigation */}
        <Navbar apiHealthy={apiHealthy} />

        {/* Main content - add top margin for fixed navbar */}
        <main className="flex-1 relative mt-20">
          <Routes location={location}>
            {/* Public routes */}
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route path="/admin" element={<AdminLoginPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/privacy" element={<PrivacyPage />} />
            <Route path="/terms" element={<TermsPage />} />
            <Route path="/faq" element={<FAQPage />} />
            
            {/* Protected routes */}
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute>
                  <DashboardPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/predict" 
              element={
                <ProtectedRoute requirePayment={true}>
                  <PredictionPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/results" 
              element={
                <ProtectedRoute>
                  <ResultsPage />
                </ProtectedRoute>
              } 
            />
            
            {/* Admin routes */}
            <Route 
              path="/admin/contacts" 
              element={
                <ProtectedRoute requireAdmin={true}>
                  <AdminContactsPage />
                </ProtectedRoute>
              } 
            />
            
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </main>

        {/* Footer */}
        <Footer />
      </div>

      {/* Toast notifications */}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          className: 'bg-white border border-gray-200 shadow-lg',
          style: {
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(229, 231, 235, 0.8)',
          },
          success: {
            iconTheme: {
              primary: '#22c55e',
              secondary: '#ffffff',
            },
          },
          error: {
            iconTheme: {
              primary: '#ef4444',
              secondary: '#ffffff',
            },
          },
        }}
      />

      {/* Environment Debug Panel (renders only in dev and when enabled) */}
      <EnvDebug />

      {/* API status indicator removed for cleaner UI - check console for API health */}

      {/* Scroll to top button */}
      <ScrollToTop />
    </div>
    </AuthProvider>
  )
}


export default App