import React, { Suspense } from 'react'
import { motion } from 'framer-motion'
import { Loader2 } from 'lucide-react'

const LoadingSpinner = ({ message = "Loading..." }) => (
  <div className="min-h-[50vh] flex flex-col items-center justify-center">
    <motion.div
      animate={{ rotate: 360 }}
      transition={{ 
        duration: 1, 
        repeat: Infinity, 
        ease: "linear" 
      }}
      className="mb-4"
    >
      <Loader2 className="w-8 h-8 text-blue-500 dark:text-blue-400" />
    </motion.div>
    <motion.p
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="text-gray-600 dark:text-gray-400 text-sm"
    >
      {message}
    </motion.p>
  </div>
)

const LazyWrapper = ({ 
  children, 
  fallback = <LoadingSpinner />,
  errorBoundary = true 
}) => {
  if (errorBoundary) {
    return (
      <ErrorBoundary>
        <Suspense fallback={fallback}>
          {children}
        </Suspense>
      </ErrorBoundary>
    )
  }

  return (
    <Suspense fallback={fallback}>
      {children}
    </Suspense>
  )
}

// Simple Error Boundary
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    console.error('Lazy loading error:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[50vh] flex flex-col items-center justify-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center p-6 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800"
          >
            <h3 className="text-lg font-semibold text-red-800 dark:text-red-300 mb-2">
              Something went wrong
            </h3>
            <p className="text-sm text-red-600 dark:text-red-400 mb-4">
              Failed to load this component
            </p>
            <button
              onClick={() => this.setState({ hasError: false, error: null })}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm 
                         transition-colors focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              Try Again
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

export default LazyWrapper
export { LoadingSpinner }