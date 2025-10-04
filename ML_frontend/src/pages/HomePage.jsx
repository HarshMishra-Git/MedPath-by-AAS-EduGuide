import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, useInView } from 'framer-motion'
import { 
  Brain, 
  Target, 
  TrendingUp, 
  Shield, 
  Zap, 
  BarChart3,
  Users,
  Award,
  ArrowRight,
  CheckCircle,
  Star,
  Sparkles,
  ChevronDown
} from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { useAuthModal } from '../hooks/useAuth'
import AuthModal from '../components/auth/AuthModal'
import PaymentModal from '../components/auth/PaymentModal'
import PaymentNotificationBanner from '../components/payment/PaymentNotificationBanner'

const HomePage = () => {
  const navigate = useNavigate()
  const { isAuthenticated, user } = useAuth()
  const [isScrolled, setIsScrolled] = useState(false)
  const { 
    isAuthModalOpen, 
    isPaymentModalOpen, 
    closeAuthModal, 
    closePaymentModal, 
    requireAuth 
  } = useAuthModal()

  // Handle scroll for navbar effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 100)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <div className="min-h-screen">
      {/* Payment Notification Banner */}
      <PaymentNotificationBanner />
      
      {/* Hero Section */}
      <HeroSection navigate={navigate} isAuthenticated={isAuthenticated} user={user} />
      
      {/* Features Section */}
      <FeaturesSection />
      
      {/* Statistics Section */}
      <StatisticsSection />
      
      {/* How It Works Section */}
      <HowItWorksSection />
      
      {/* Testimonials Section */}
      <TestimonialsSection />
      
      {/* CTA Section */}
      <CTASection navigate={navigate} isAuthenticated={isAuthenticated} user={user} />
      
      {/* Auth & Payment Modals */}
      <AuthModal isOpen={isAuthModalOpen} onClose={closeAuthModal} />
      <PaymentModal 
        isOpen={isPaymentModalOpen} 
        onClose={closePaymentModal}
        onSuccess={closePaymentModal}
      />
    </div>
  )
}

// Hero Section Component - Advanced Creative Design
const HeroSection = ({ navigate, isAuthenticated, user }) => {
  const handleFindMyCollege = () => {
    if (!isAuthenticated) {
      navigate('/login')
    } else if (user?.accountStatus !== 'ACTIVE') {
      navigate('/dashboard')
    } else {
      navigate('/predict')
    }
  }
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-primary-50 via-white to-medical-50">
      {/* Advanced Animated Background */}
      <div className="absolute inset-0 z-0">
        {/* Animated gradient meshes */}
        <motion.div
          animate={{
            background: [
              'radial-gradient(circle at 20% 30%, rgba(30, 64, 175, 0.15), transparent 50%)',
              'radial-gradient(circle at 80% 70%, rgba(30, 64, 175, 0.15), transparent 50%)',
              'radial-gradient(circle at 20% 30%, rgba(30, 64, 175, 0.15), transparent 50%)'
            ]
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          className="absolute inset-0"
        />
        <motion.div
          animate={{
            background: [
              'radial-gradient(circle at 80% 20%, rgba(132, 204, 22, 0.12), transparent 50%)',
              'radial-gradient(circle at 20% 80%, rgba(132, 204, 22, 0.12), transparent 50%)',
              'radial-gradient(circle at 80% 20%, rgba(132, 204, 22, 0.12), transparent 50%)'
            ]
          }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          className="absolute inset-0"
        />
        
        {/* Dynamic grid */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(30,64,175,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(30,64,175,0.05)_1px,transparent_1px)] bg-[size:80px_80px] [mask-image:radial-gradient(ellipse_at_center,black_50%,transparent_90%)]" />
      </div>

      {/* Advanced Floating Elements */}
      <div className="absolute inset-0 z-1 pointer-events-none">
        {/* Large orbs with glow */}
        <motion.div
          animate={{ 
            y: [0, -30, 0],
            scale: [1, 1.2, 1],
            opacity: [0.4, 0.6, 0.4]
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-20 left-10 w-64 h-64 bg-gradient-to-r from-primary-400/30 to-primary-600/30 rounded-full blur-3xl"
        />
        <motion.div
          animate={{ 
            y: [0, 30, 0],
            scale: [1, 1.15, 1],
            opacity: [0.4, 0.6, 0.4]
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1.5 }}
          className="absolute bottom-20 right-10 w-80 h-80 bg-gradient-to-r from-medical-400/30 to-success-500/30 rounded-full blur-3xl"
        />
        <motion.div
          animate={{ 
            scale: [1, 1.3, 1],
            opacity: [0.3, 0.5, 0.3],
            rotate: [0, 180, 360]
          }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-primary-400/20 to-medical-400/20 rounded-full blur-3xl"
        />
        
        {/* Floating shapes */}
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            animate={{
              y: [0, -20, 0],
              x: [0, 10, 0],
              rotate: [0, 180, 360],
              opacity: [0.2, 0.5, 0.2]
            }}
            transition={{
              duration: 8 + i * 2,
              repeat: Infinity,
              ease: "easeInOut",
              delay: i * 0.5
            }}
            className="absolute"
            style={{
              top: `${20 + i * 15}%`,
              left: `${10 + i * 12}%`,
            }}
          >
            <div className={`w-16 h-16 bg-gradient-to-br ${i % 2 === 0 ? 'from-primary-400/20 to-primary-600/20' : 'from-medical-400/20 to-success-500/20'} rounded-2xl blur-sm`} />
          </motion.div>
        ))}
        
        {/* Sparkles */}
        {[...Array(12)].map((_, i) => (
          <motion.div
            key={`sparkle-${i}`}
            animate={{
              opacity: [0, 1, 0],
              scale: [0, 1.5, 0]
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              delay: i * 0.3,
              ease: "easeInOut"
            }}
            className="absolute"
            style={{
              top: `${15 + (i * 7)}%`,
              left: `${20 + (i * 6)}%`,
            }}
          >
            <Star className="w-3 h-3 text-primary-500 fill-primary-500" />
          </motion.div>
        ))}
      </div>

      {/* Main Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center py-20">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          {/* Premium Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="inline-flex items-center space-x-2 bg-gradient-to-r from-primary-500/10 to-medical-500/10 backdrop-blur-md px-5 py-2.5 rounded-full border-2 border-primary-300/50 shadow-xl shadow-primary-200/50 mb-8 hover:shadow-2xl hover:shadow-medical-300/50 transition-all duration-300"
          >
            <motion.div
              animate={{ rotate: 360, scale: [1, 1.2, 1] }}
              transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
            >
              <Sparkles className="w-5 h-5 text-primary-600" />
            </motion.div>
            <span className="text-sm font-bold text-gray-800 tracking-wide">AI-Powered College Finder</span>
            <motion.span 
              animate={{ scale: [1, 1.15, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="bg-gradient-to-r from-primary-600 to-medical-600 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg"
            >
              NEW
            </motion.span>
          </motion.div>

          {/* Main Heading with Advanced Effects */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="relative mb-6"
          >
            <motion.h1 className="text-5xl sm:text-6xl lg:text-7xl xl:text-8xl font-display font-bold leading-tight flex flex-col items-center">
              <motion.span 
                className="bg-gradient-to-r from-primary-600 via-primary-500 to-primary-700 bg-clip-text text-transparent"
                animate={{ 
                  backgroundPosition: ['0% 50%', '100% 50%', '0% 50%']
                }}
                transition={{ duration: 5, repeat: Infinity }}
                style={{ 
                  backgroundSize: '200% auto',
                  textShadow: '0 0 30px rgba(30, 64, 175, 0.3)'
                }}
              >
                MedPath
              </motion.span>
              <motion.span 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 }}
                className="text-gray-900 relative"
              >
                Find Your
                <motion.div
                  className="absolute -bottom-2 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-primary-500 to-transparent"
                  animate={{ scaleX: [0, 1, 0], opacity: [0, 1, 0] }}
                  transition={{ duration: 3, repeat: Infinity, delay: 1 }}
                />
              </motion.span>
              <motion.span 
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 }}
                className="text-gray-900 relative"
              >
                Perfect
              </motion.span>
              <motion.span 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.7 }}
                className="bg-gradient-to-r from-medical-600 via-success-600 to-medical-700 bg-clip-text text-transparent"
                style={{ textShadow: '0 0 30px rgba(132, 204, 22, 0.3)' }}
              >
                Medical College
              </motion.span>
            </motion.h1>
          </motion.div>

          {/* Enhanced Subtitle */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9 }}
            className="relative max-w-4xl mx-auto mb-12"
          >
            <motion.p className="text-lg sm:text-xl lg:text-2xl text-gray-600 font-sans leading-relaxed text-justify">
              Discover your{' '}
              <span className="relative inline-block font-semibold text-medical-600">
                ideal medical college
                <motion.span
                  className="absolute -bottom-1 left-0 right-0 h-0.5 bg-gradient-to-r from-medical-600 to-success-600"
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ delay: 1.5, duration: 0.8 }}
                />
              </span>{' '}
              with AI-powered matching for NEET UG & PG admissions.
              <br className="hidden sm:block" />
              <span className="text-gray-500">Your path to medical excellence starts here.</span>
            </motion.p>
          </motion.div>

          {/* Premium CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.1 }}
            className="flex flex-col sm:flex-row gap-5 justify-center items-center mb-14"
          >
            <motion.button
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleFindMyCollege}
              className="group relative bg-brand-gradient hover:from-primary-700 hover:to-medical-700 text-white font-bold px-10 py-4 rounded-2xl shadow-2xl shadow-primary-500/40 hover:shadow-medical-600/60 transition-all duration-300 flex items-center space-x-3 overflow-hidden"
            >
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                animate={{ x: ['-100%', '200%'] }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              />
              <motion.div
                animate={{ rotate: [0, 360] }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              >
                <Zap className="w-6 h-6 relative z-10" />
              </motion.div>
              <span className="relative z-10 text-lg">Find My College</span>
              <motion.div
                animate={{ x: [0, 5, 0] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                <ArrowRight className="w-6 h-6 relative z-10" />
              </motion.div>
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/about')}
              className="group bg-white/80 hover:bg-white backdrop-blur-sm text-gray-800 font-semibold px-10 py-4 rounded-2xl border-2 border-gray-200 hover:border-primary-300 shadow-xl hover:shadow-2xl transition-all duration-300 flex items-center space-x-3"
            >
              <Brain className="w-6 h-6 text-primary-600 group-hover:text-medical-600 transition-colors" />
              <span className="text-lg">Learn More</span>
            </motion.button>
          </motion.div>

          {/* Advanced Trust Indicators */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.3 }}
            className="flex flex-wrap justify-center items-center gap-6 lg:gap-8"
          >
            {[
              { icon: Users, text: '10,000+ Students', color: 'from-primary-500 to-primary-700', bgColor: 'bg-primary-50' },
              { icon: Award, text: '95%+ Accuracy', color: 'from-medical-500 to-success-600', bgColor: 'bg-medical-50' },
              { icon: Shield, text: 'Secure & Private', color: 'from-primary-600 to-medical-600', bgColor: 'bg-success-50' }
            ].map((item, index) => (
              <motion.div
                key={item.text}
                initial={{ opacity: 0, y: 20, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ delay: 1.3 + (index * 0.15) }}
                whileHover={{ y: -5, scale: 1.05 }}
                className="relative group"
              >
                <motion.div
                  className={`absolute inset-0 ${item.bgColor} rounded-2xl blur-xl opacity-0 group-hover:opacity-70 transition-opacity duration-300`}
                />
                <div className="relative flex items-center space-x-3 bg-white/90 backdrop-blur-lg px-6 py-4 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 border-2 border-white/80">
                  <motion.div 
                    className={`p-2.5 bg-gradient-to-br ${item.color} rounded-xl shadow-lg`}
                    whileHover={{ rotate: 360 }}
                    transition={{ duration: 0.6 }}
                  >
                    <item.icon className="w-5 h-5 text-white" />
                  </motion.div>
                  <span className="font-bold text-gray-900 text-base">{item.text}</span>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>

        {/* Enhanced Scroll Indicator - Centered */}
        <div className="absolute bottom-10 left-0 right-0 flex justify-center">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.8 }}
          >
            <motion.div
              animate={{ y: [0, 10, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              className="flex flex-col items-center space-y-3"
            >
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-widest">Scroll to Explore</span>
              <motion.div className="relative">
                <motion.div
                  animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0.8, 0.5] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="absolute inset-0 bg-primary-400 rounded-full blur-lg"
                />
                <ChevronDown className="w-6 h-6 text-primary-600 relative z-10" />
              </motion.div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

// Features Section Component
const FeaturesSection = () => {
  const features = [
    {
      icon: Brain,
      title: "Advanced ML Models",
      description: "Ensemble of neural networks trained on years of NEET admission data for maximum accuracy.",
      gradient: "from-primary-500 to-medical-500"
    },
    {
      icon: Target,
      title: "Precise Predictions",
      description: "Get admission probability, safety levels, and predicted closing ranks for every college.",
      gradient: "from-medical-500 to-success-500"
    },
    {
      icon: TrendingUp,
      title: "Real-time Analysis",
      description: "Dynamic predictions that adapt to current year trends and competition levels.",
      gradient: "from-success-500 to-neural-500"
    },
    {
      icon: Shield,
      title: "Data Privacy",
      description: "Your personal information is encrypted and never shared with third parties.",
      gradient: "from-neural-500 to-primary-500"
    }
  ]

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl sm:text-4xl font-display font-bold text-gray-900 mb-4">
            Why Choose Our <span className="text-gradient-primary">ML Predictor</span>?
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto text-justify">
            Built with cutting-edge technology and years of admission data analysis
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {features.map((feature, index) => (
            <FeatureCard 
              key={feature.title} 
              feature={feature} 
              index={index} 
            />
          ))}
        </div>
      </div>
    </section>
  )
}

const FeatureCard = ({ feature, index }) => {
  return (
    <div className="card-premium p-8 hover-lift">
      {/* Removed motion for better performance */}
      <div className={`w-16 h-16 bg-gradient-to-r ${feature.gradient} rounded-2xl flex items-center justify-center mb-6`}>
        <feature.icon className="w-8 h-8 text-white" />
      </div>
      <h3 className="text-2xl font-display font-bold text-gray-900 mb-4">
        {feature.title}
      </h3>
      <p className="text-gray-600 leading-relaxed text-justify">
        {feature.description}
      </p>
    </div>
  )
}

// Statistics Section Component
const StatisticsSection = () => {
  const stats = [
    { number: "95%+", label: "Prediction Accuracy", icon: Target },
    { number: "10,000+", label: "Students Helped", icon: Users },
    { number: "500+", label: "Medical Colleges", icon: Award },
    { number: "24/7", label: "Support Available", icon: Shield }
  ]

  return (
    <section className="py-20 bg-gradient-to-r from-primary-50 to-medical-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <div key={stat.label} className="text-center">
              <div className="mb-4">
                <stat.icon className="w-8 h-8 text-primary-600 mx-auto mb-2" />
              </div>
              <div className="text-4xl font-display font-bold text-gray-900 mb-2">
                {stat.number}
              </div>
              <div className="text-gray-600 font-medium">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// How It Works Section Component
const HowItWorksSection = () => {
  const steps = [
    {
      number: "01",
      title: "Enter Your Details",
      description: "Provide your NEET rank, category, state preference, and quota details in our smart form.",
      icon: Target,
      color: "from-primary-600 to-primary-700"  // Navy blue
    },
    {
      number: "02",
      title: "AI Analysis",
      description: "Our advanced ML models analyze your profile against historical data and current trends.",
      icon: Brain,
      color: "from-primary-500 to-success-500"  // Navy to green gradient
    },
    {
      number: "03",
      title: "Get Recommendations",
      description: "Receive personalized college recommendations with admission probability and safety levels.",
      icon: CheckCircle,
      color: "from-success-500 to-success-600"  // Bright green
    }
  ]

  return (
    <section className="py-20 bg-gradient-to-b from-white to-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl sm:text-4xl font-display font-bold text-gray-900 mb-4">
            How It Works
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto text-justify">
            Simple 3-step process to discover your perfect medical college
          </p>
        </motion.div>

        {/* Steps Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12 relative">
          {/* Connection Lines */}
          <div className="hidden md:block absolute top-1/4 left-1/3 right-1/3 h-0.5 bg-gradient-to-r from-primary-200 via-primary-300 to-success-300" style={{ transform: 'translateY(-50%)' }} />
          
          {steps.map((step, index) => (
            <motion.div
              key={step.number}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.2 }}
              className="relative"
            >
              {/* Step Card */}
              <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 relative z-10">
                {/* Step Number Badge */}
                <div className="absolute -top-6 left-1/2 transform -translate-x-1/2">
                  <div className={`w-12 h-12 bg-gradient-to-r ${step.color} rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg`}>
                    {step.number}
                  </div>
                </div>

                {/* Icon */}
                <div className="mt-8 mb-6 flex justify-center">
                  <div className={`w-16 h-16 bg-gradient-to-r ${step.color} rounded-2xl flex items-center justify-center transform hover:scale-110 transition-transform duration-300`}>
                    <step.icon className="w-8 h-8 text-white" />
                  </div>
                </div>

                {/* Content */}
                <h3 className="text-xl font-bold text-gray-900 mb-3 text-center">
                  {step.title}
                </h3>
                <p className="text-gray-600 text-center leading-relaxed text-justify">
                  {step.description}
                </p>
              </div>

              {/* Arrow for mobile */}
              {index < steps.length - 1 && (
                <div className="md:hidden flex justify-center my-4">
                  <ChevronDown className="w-6 h-6 text-gray-300" />
                </div>
              )}
            </motion.div>
          ))}
        </div>

        {/* CTA Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.6 }}
          className="text-center mt-16"
        >
          <a href="/predict" className="inline-block">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-gradient-to-r from-primary-600 to-success-600 text-white font-bold px-8 py-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 flex items-center space-x-2"
            >
              <span>Start Your Journey</span>
              <ArrowRight className="w-5 h-5" />
            </motion.button>
          </a>
        </motion.div>
      </div>
    </section>
  )
}

const TestimonialsSection = () => {
  const testimonials = [
    {
      name: "Priya Sharma",
      college: "AIIMS Delhi",
      rank: "AIR 1,245",
      image: "👩‍⚕️",
      rating: 5,
      text: "MedPath's predictions were spot on! I got into my dream college. The AI analysis helped me make informed decisions during counseling.",
      course: "MBBS"
    },
    {
      name: "Rahul Kumar",
      college: "JIPMER Puducherry",
      rank: "AIR 3,567",
      image: "👨‍⚕️",
      rating: 5,
      text: "Amazing accuracy! The platform helped me understand my chances realistically. Highly recommend to all NEET aspirants.",
      course: "MBBS"
    },
    {
      name: "Ananya Patel",
      college: "CMC Vellore",
      rank: "AIR 2,890",
      image: "👩‍🎓",
      rating: 5,
      text: "The safety level indicators and detailed college information made my counseling process so much easier. Thank you MedPath!",
      course: "MBBS"
    },
    {
      name: "Arjun Singh",
      college: "MAMC Delhi",
      rank: "AIR 4,120",
      image: "👨‍🎓",
      rating: 5,
      text: "Best decision to use MedPath. The detailed analysis and college comparisons helped me choose the right college for my career.",
      course: "MBBS"
    },
    {
      name: "Sneha Reddy",
      college: "KMC Manipal",
      rank: "AIR 5,678",
      image: "👩‍⚕️",
      rating: 5,
      text: "The safety level feature was incredibly helpful. I could plan my choices strategically and got my preferred college!",
      course: "MBBS"
    },
    {
      name: "Vikram Joshi",
      college: "AFMC Pune",
      rank: "AIR 2,345",
      image: "👨‍⚕️",
      rating: 5,
      text: "Highly accurate predictions and user-friendly interface. MedPath made my college selection process stress-free.",
      course: "MBBS"
    }
  ]

  // Duplicate testimonials for infinite scroll effect
  const duplicatedTestimonials = [...testimonials, ...testimonials]

  return (
    <section className="py-20 bg-gradient-to-b from-gray-50 to-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl sm:text-4xl font-display font-bold text-gray-900 mb-4">
            What Students Say
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Success stories from students who trusted MedPath
          </p>
        </motion.div>

        {/* Optimized Auto-scrolling Carousel */}
        <div className="relative">
          {/* Simplified gradient overlays */}
          <div className="absolute left-0 top-0 bottom-0 w-16 bg-gradient-to-r from-gray-50 to-transparent z-10 pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none" />
          
          {/* Hardware accelerated scrolling container */}
          <div className="overflow-hidden">
            <motion.div
              className="flex gap-6"
              style={{ willChange: 'transform' }}
              animate={{
                x: [-100 * testimonials.length, 0],
              }}
              transition={{
                x: {
                  repeat: Infinity,
                  repeatType: "loop",
                  duration: 30,
                  ease: "linear",
                },
              }}
            >
              {duplicatedTestimonials.map((testimonial, index) => (
                <div
                  key={`${testimonial.name}-${index}`}
                  className="flex-shrink-0 w-[380px]"
                >
                  <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 h-full">
                    {/* Avatar & Name */}
                    <div className="flex items-center mb-6">
                      <div className="w-16 h-16 bg-gradient-to-r from-primary-600 to-success-500 rounded-full flex items-center justify-center text-3xl">
                        {testimonial.image}
                      </div>
                      <div className="ml-4">
                        <h4 className="font-bold text-gray-900 text-lg">{testimonial.name}</h4>
                        <p className="text-sm text-gray-500">{testimonial.rank}</p>
                      </div>
                    </div>

                    {/* Rating Stars */}
                    <div className="flex mb-4">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                      ))}
                    </div>

                    {/* Testimonial Text */}
                    <p className="text-gray-600 leading-relaxed mb-4 italic">
                      "{testimonial.text}"
                    </p>

                    {/* College Badge */}
                    <div className="flex items-center justify-between mt-6 pt-6 border-t border-gray-100">
                      <div>
                        <p className="text-xs text-gray-500 uppercase tracking-wide">Admitted to</p>
                        <p className="text-sm font-bold text-success-600">{testimonial.college}</p>
                      </div>
                      <div className="px-3 py-1 bg-success-100 text-success-700 rounded-full text-xs font-medium">
                        {testimonial.course}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </motion.div>
          </div>
        </div>

        {/* Trust Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 }}
          className="text-center mt-16"
        >
          <div className="inline-flex items-center space-x-2 bg-success-100 text-success-700 px-6 py-3 rounded-full">
            <CheckCircle className="w-5 h-5" />
            <span className="font-semibold">Trusted by 10,000+ NEET aspirants</span>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

const CTASection = ({ navigate, isAuthenticated, user }) => {
  const handleStartPrediction = () => {
    if (!isAuthenticated) {
      navigate('/login')
    } else if (user?.accountStatus !== 'ACTIVE') {
      navigate('/dashboard')
    } else {
      navigate('/predict')
    }
  }

  return (
    <section className="py-20 bg-gradient-to-r from-primary-700 to-primary-900">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl sm:text-4xl font-display font-bold text-white mb-6">
            Ready to Predict Your Medical College?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Join thousands of students who've made informed decisions with our AI predictions
          </p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleStartPrediction}
            className="bg-success-500 hover:bg-success-600 text-white font-bold px-8 py-4 rounded-lg text-lg shadow-xl hover:shadow-2xl transition-all duration-200"
          >
            {isAuthenticated ? 'Start Your Prediction Now' : 'Login to Start Prediction'}
          </motion.button>
        </motion.div>
      </div>
    </section>
  )
}

export default HomePage