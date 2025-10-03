import React from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { 
  Home, 
  ArrowLeft, 
  Search, 
  Target, 
  Brain,
  Compass,
  MapPin,
  AlertTriangle
} from 'lucide-react'

const NotFoundPage = () => {
  const navigate = useNavigate()

  const quickLinks = [
    {
      icon: Home,
      title: 'Go Home',
      description: 'Return to the main page',
      action: () => navigate('/'),
      color: 'primary'
    },
    {
      icon: Target,
      title: 'Start Prediction',
      description: 'Get your NEET college predictions',
      action: () => navigate('/predict'),
      color: 'medical'
    },
    {
      icon: Brain,
      title: 'Learn About Us',
      description: 'Discover our ML technology',
      action: () => navigate('/about'),
      color: 'neural'
    },
    {
      icon: Search,
      title: 'Contact Support',
      description: 'Get help from our team',
      action: () => navigate('/contact'),
      color: 'success'
    }
  ]

  return (
    <div className="min-h-screen flex items-center justify-center py-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          {/* 404 Animation */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="mb-8"
          >
            <div className="relative">
              {/* Main 404 Text */}
              <h1 className="text-8xl sm:text-9xl font-display font-bold text-gray-200 mb-4">
                404
              </h1>
              
              {/* Floating Brain Icon */}
              <motion.div
                animate={{ y: [-10, 10, -10] }}
                transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
              >
                <div className="w-16 h-16 bg-gradient-to-r from-primary-500 to-medical-500 rounded-2xl flex items-center justify-center shadow-lg">
                  <Brain className="w-8 h-8 text-white" />
                </div>
              </motion.div>
            </div>
          </motion.div>

          {/* Error Message */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="mb-8"
          >
            <h2 className="text-3xl sm:text-4xl font-display font-bold text-gray-900 mb-4">
              Oops! Page Not Found
            </h2>
            <p className="text-xl text-gray-600 mb-6 max-w-2xl mx-auto leading-relaxed">
              The page you're looking for seems to have vanished into the digital void. 
              Don't worry though - our AI is still working perfectly to help with your NEET predictions!
            </p>
            
            {/* Fun Error Messages */}
            <div className="flex items-center justify-center space-x-2 text-sm text-gray-500 mb-8">
              <AlertTriangle className="w-4 h-4" />
              <span>Error 404: College predictions still accurate though!</span>
            </div>
          </motion.div>

          {/* Back Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.5 }}
            className="mb-12"
          >
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate(-1)}
              className="btn-secondary inline-flex items-center space-x-2 mr-4"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Go Back</span>
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/')}
              className="btn-gradient inline-flex items-center space-x-2"
            >
              <Home className="w-4 h-4" />
              <span>Home Page</span>
            </motion.button>
          </motion.div>

          {/* Quick Links */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.5 }}
          >
            <h3 className="text-xl font-display font-bold text-gray-900 mb-8">
              Or explore these popular pages:
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-4xl mx-auto">
              {quickLinks.map((link, index) => (
                <QuickLinkCard 
                  key={link.title} 
                  link={link} 
                  index={index} 
                />
              ))}
            </div>
          </motion.div>

          {/* Search Suggestion */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1, duration: 0.5 }}
            className="mt-12 p-6 bg-gradient-to-r from-primary-50 to-medical-50 rounded-xl border border-primary-100"
          >
            <div className="flex items-center justify-center space-x-3 mb-4">
              <Compass className="w-5 h-5 text-primary-600" />
              <h4 className="font-semibold text-gray-900">Lost in the ML universe?</h4>
            </div>
            <p className="text-gray-600 text-sm mb-4">
              If you're looking for specific information about our NEET predictions, 
              try starting from our homepage or contact our support team.
            </p>
            <div className="flex items-center justify-center space-x-2 text-xs text-gray-500">
              <MapPin className="w-3 h-3" />
              <span>Remember: Our AI models are 95%+ accurate even when you're lost!</span>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  )
}

// Quick Link Card Component
const QuickLinkCard = ({ link, index }) => {
  const colorClasses = {
    primary: 'from-primary-500 to-primary-600',
    medical: 'from-medical-500 to-medical-600',
    neural: 'from-neural-500 to-neural-600',
    success: 'from-success-500 to-success-600'
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.8 + (index * 0.1), duration: 0.5 }}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={link.action}
      className="card-premium p-6 cursor-pointer hover-lift text-center group"
    >
      <div className={`w-12 h-12 bg-gradient-to-r ${colorClasses[link.color]} rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:shadow-lg transition-shadow duration-200`}>
        <link.icon className="w-6 h-6 text-white" />
      </div>
      <h4 className="font-display font-bold text-gray-900 mb-2 group-hover:text-primary-600 transition-colors">
        {link.title}
      </h4>
      <p className="text-sm text-gray-600 leading-relaxed">
        {link.description}
      </p>
    </motion.div>
  )
}

export default NotFoundPage