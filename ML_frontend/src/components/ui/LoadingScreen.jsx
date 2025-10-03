import React from 'react'
import { motion } from 'framer-motion'
import { Brain, CheckCircle, XCircle, Loader } from 'lucide-react'

const LoadingScreen = ({ state, error, apiHealthy }) => {
  const getStateContent = () => {
    switch (state) {
      case 'initial':
        return {
          title: 'Initializing NEET ML Predictor',
          subtitle: 'Preparing the advanced ML prediction system...',
          icon: Brain,
          color: 'primary'
        }
      case 'checking_api':
        return {
          title: 'Connecting to ML Engine',
          subtitle: 'Establishing connection with AI prediction servers...',
          icon: Loader,
          color: 'medical'
        }
      case 'error':
        return {
          title: 'Initialization Error',
          subtitle: error || 'Something went wrong during startup',
          icon: XCircle,
          color: 'danger'
        }
      default:
        return {
          title: 'Loading',
          subtitle: 'Please wait...',
          icon: Loader,
          color: 'primary'
        }
    }
  }

  const { title, subtitle, icon: Icon, color } = getStateContent()

  const getColorClasses = (color) => {
    switch (color) {
      case 'primary':
        return {
          bg: 'bg-gradient-to-br from-primary-500 to-medical-500',
          text: 'text-primary-600',
          accent: 'text-primary-500'
        }
      case 'medical':
        return {
          bg: 'bg-gradient-to-br from-medical-500 to-success-500',
          text: 'text-medical-600',
          accent: 'text-medical-500'
        }
      case 'danger':
        return {
          bg: 'bg-gradient-to-br from-danger-500 to-warning-500',
          text: 'text-danger-600',
          accent: 'text-danger-500'
        }
      default:
        return {
          bg: 'bg-gradient-to-br from-primary-500 to-medical-500',
          text: 'text-primary-600',
          accent: 'text-primary-500'
        }
    }
  }

  const colorClasses = getColorClasses(color)

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-blue-50/30 to-teal-50/30">
      {/* Background pattern */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary-200/20 rounded-full mix-blend-multiply filter blur-xl animate-pulse-slow" />
        <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-medical-200/20 rounded-full mix-blend-multiply filter blur-xl animate-pulse-slow animate-delay-200" />
        <div className="absolute bottom-1/4 left-1/3 w-96 h-96 bg-neural-200/20 rounded-full mix-blend-multiply filter blur-xl animate-pulse-slow animate-delay-500" />
      </div>

      {/* Loading content */}
      <div className="relative z-10 text-center max-w-md mx-auto px-6">
        {/* Logo with animation */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <div className="relative mx-auto">
            <div className={`w-20 h-20 ${colorClasses.bg} rounded-3xl flex items-center justify-center shadow-2xl`}>
              <Brain className="w-10 h-10 text-white" />
            </div>
            
            {/* Animated rings */}
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
              className="absolute inset-0 rounded-3xl"
            >
              <div className="absolute top-2 left-2 w-2 h-2 bg-white rounded-full opacity-60" />
              <div className="absolute bottom-2 right-2 w-2 h-2 bg-white rounded-full opacity-60" />
            </motion.div>
          </div>
        </motion.div>

        {/* Title and subtitle */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="mb-6"
        >
          <h1 className="text-2xl font-display font-bold text-gray-900 mb-2">
            {title}
          </h1>
          <p className="text-gray-600">
            {subtitle}
          </p>
        </motion.div>

        {/* Status icon and loading indicator */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="mb-8"
        >
          <div className="flex items-center justify-center space-x-4">
            <div className={`p-2 rounded-full bg-gray-100 ${colorClasses.text}`}>
              {state === 'checking_api' ? (
                <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}>
                  <Icon className="w-5 h-5" />
                </motion.div>
              ) : (
                <Icon className="w-5 h-5" />
              )}
            </div>
            
            {state !== 'error' && (
              <div className="flex space-x-1">
                {[0, 1, 2].map((i) => (
                  <motion.div
                    key={i}
                    className={`w-2 h-2 rounded-full ${colorClasses.bg}`}
                    animate={{
                      scale: [1, 1.5, 1],
                      opacity: [0.5, 1, 0.5]
                    }}
                    transition={{
                      duration: 1.5,
                      repeat: Infinity,
                      delay: i * 0.2
                    }}
                  />
                ))}
              </div>
            )}
          </div>
        </motion.div>

        {/* System status */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.5 }}
          className="space-y-3"
        >
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Frontend System</span>
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-4 h-4 text-success-500" />
              <span className="text-success-600 font-medium">Ready</span>
            </div>
          </div>
          
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">ML API Connection</span>
            <div className="flex items-center space-x-2">
              {apiHealthy ? (
                <>
                  <CheckCircle className="w-4 h-4 text-success-500" />
                  <span className="text-success-600 font-medium">Connected</span>
                </>
              ) : state === 'checking_api' ? (
                <>
                  <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}>
                    <Loader className="w-4 h-4 text-medical-500" />
                  </motion.div>
                  <span className="text-medical-600 font-medium">Connecting...</span>
                </>
              ) : (
                <>
                  <XCircle className="w-4 h-4 text-warning-500" />
                  <span className="text-warning-600 font-medium">Offline Mode</span>
                </>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Neural Networks</span>
            <div className="flex items-center space-x-2">
              {state === 'ready' ? (
                <>
                  <CheckCircle className="w-4 h-4 text-success-500" />
                  <span className="text-success-600 font-medium">Loaded</span>
                </>
              ) : (
                <>
                  <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}>
                    <Loader className="w-4 h-4 text-neural-500" />
                  </motion.div>
                  <span className="text-neural-600 font-medium">Loading...</span>
                </>
              )}
            </div>
          </div>
        </motion.div>

        {/* Error retry button */}
        {state === 'error' && (
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.8, duration: 0.5 }}
            className="mt-8"
          >
            <button
              onClick={() => window.location.reload()}
              className="btn-primary"
            >
              Retry Initialization
            </button>
          </motion.div>
        )}

        {/* Loading progress bar */}
        {state !== 'error' && (
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: '100%' }}
            transition={{ 
              duration: state === 'checking_api' ? 2 : 1,
              ease: 'easeInOut'
            }}
            className="mt-8 h-1 bg-gradient-to-r from-primary-500 to-medical-500 rounded-full"
          />
        )}

        {/* Footer text */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 0.5 }}
          className="mt-6 text-xs text-gray-400"
        >
          Powered by Advanced Machine Learning • NEET College Prediction System
        </motion.p>
      </div>
    </div>
  )
}

export default LoadingScreen