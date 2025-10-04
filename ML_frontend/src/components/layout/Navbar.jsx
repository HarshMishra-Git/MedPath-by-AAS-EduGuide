import React, { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Brain, 
  Menu, 
  X, 
  Home, 
  Target, 
  BarChart3, 
  Info, 
  Mail,
  Zap,
  User,
  LogOut,
  UserPlus
} from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'

const Navbar = ({ apiHealthy }) => {
  const location = useLocation()
  const navigate = useNavigate()
  const { isAuthenticated, user, logout } = useAuth()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)

  // Optimized scroll handling with throttling
  useEffect(() => {
    let ticking = false
    const handleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          setIsScrolled(window.scrollY > 10)
          ticking = false
        })
        ticking = true
      }
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false)
  }, [location])

  // Navigation items - Filter Predict based on account status
  const allNavItems = [
    {
      name: 'Home',
      path: '/',
      icon: Home,
      description: 'Welcome to NEET ML Predictor'
    },
    {
      name: 'Predict',
      path: '/predict',
      icon: Target,
      description: 'Get AI-powered admission predictions',
      requiresActive: true
    },
    {
      name: 'Results',
      path: '/results',
      icon: BarChart3,
      description: 'View your prediction results'
    },
    {
      name: 'About',
      path: '/about',
      icon: Info,
      description: 'Learn about our ML technology'
    },
    {
      name: 'Contact',
      path: '/contact',
      icon: Mail,
      description: 'Get in touch with our team'
    }
  ]

  // Filter nav items based on authentication and account status
  const navItems = allNavItems.filter(item => {
    if (item.requiresActive && isAuthenticated) {
      return user?.accountStatus === 'ACTIVE'
    }
    return true
  })

  const isActive = (path) => location.pathname === path

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-200 ${
          isScrolled
            ? 'bg-white/95 border-b border-gray-200/50 shadow-lg'
            : 'bg-white/80'
        }`}
      >
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="flex items-center w-full h-20">
            {/* Logo - Left Side - INCREASED SIZE */}
            <div className="flex-shrink-0">
              <div
                className="flex items-center space-x-3 cursor-pointer hover:opacity-90 transition-opacity duration-150"
                onClick={() => {
                  window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
                  navigate('/')
                }}
              >
                <div className="relative">
                  <img 
                    src="/images/aas-logo.png" 
                    alt="AAS EduGuide Logo" 
                    className="w-24 h-20 sm:w-24 sm:h-20 md:w-28 md:h-22 object-contain"
                    onLoad={() => console.log('Navbar logo loaded successfully')}
                    onError={(e) => {
                      console.error('Navbar logo failed to load from:', e.target.src)
                      // Try alternative paths
                      if (e.target.src.includes('/images/aas-logo.png')) {
                        e.target.src = '/aas-logo.png'
                      } else if (e.target.src.includes('/aas-logo.png')) {
                        e.target.src = './src/assets/images/aas-logo.png'
                      } else {
                        // Final fallback - hide image and show icon
                        e.target.style.display = 'none'
                        e.target.nextSibling.style.display = 'flex'
                      }
                    }}
                  />
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-primary-500 to-medical-500 rounded-lg items-center justify-center hidden">
                    <Brain className="w-6 h-6 text-white" />
                  </div>
                  {/* API health indicator removed for cleaner UI */}
                </div>
                <div className="hidden sm:block">
                  <h1 className="text-xl md:text-2xl font-display font-bold bg-gradient-to-r from-primary-700 via-primary-600 to-success-600 bg-clip-text text-transparent">
                    MedPath
                  </h1>
                  <p className="text-xs md:text-sm text-gray-500 -mt-1">by AAS EduGuide</p>
                </div>
              </div>
            </div>

            {/* Spacer to push everything right */}
            <div className="flex-1"></div>

            {/* Navigation Links + CTA Button - Right Side */}
            <div className="hidden md:flex items-center space-x-6 flex-shrink-0">
              {/* Navigation Links */}
              <div className="flex items-center space-x-1">
                {navItems.map((item) => (
                  <NavLink
                    key={item.path}
                    item={item}
                    isActive={isActive(item.path)}
                  />
                ))}
              </div>
              
              {/* Auth Buttons */}
              {isAuthenticated ? (
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => {
                      window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
                      navigate('/dashboard')
                    }}
                    className="flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors text-gray-700"
                  >
                    <User className="w-4 h-4" />
                    <span className="text-sm font-medium">{user?.fullName?.split(' ')[0] || 'Dashboard'}</span>
                  </button>
                  <button
                    onClick={logout}
                    className="flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-red-50 transition-colors text-red-600"
                  >
                    <LogOut className="w-4 h-4" />
                    <span className="text-sm font-medium">Logout</span>
                  </button>
                </div>
              ) : (
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => {
                      window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
                      navigate('/login')
                    }}
                    className="px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors text-gray-700 font-medium text-sm"
                  >
                    Login
                  </button>
                  <button
                    onClick={() => {
                      window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
                      navigate('/signup')
                    }}
                    className="bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white font-medium px-4 py-2 rounded-lg text-sm flex items-center space-x-2 shadow-lg hover:shadow-xl transition-all duration-150"
                  >
                    <UserPlus className="w-4 h-4" />
                    <span>Sign Up</span>
                  </button>
                </div>
              )}
            </div>

            {/* Mobile menu button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors text-gray-700"
              aria-label="Toggle mobile menu"
            >
              {isMobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-white/95 border-t border-gray-200/50 animate-slide-in-bottom">
            {/* Removed AnimatePresence for better performance */}
              <div className="px-4 py-4 space-y-1">
                {navItems.map((item) => (
                  <MobileNavLink
                    key={item.path}
                    item={item}
                    isActive={isActive(item.path)}
                  />
                ))}
                
                {/* User Dashboard and Logout Section for Authenticated Users */}
                {isAuthenticated && (
                  <div className="pt-4 border-t border-gray-200 space-y-2">
                    <button
                      onClick={() => {
                        window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
                        setIsMobileMenuOpen(false)
                        navigate('/dashboard')
                      }}
                      className="flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 text-gray-600 hover:text-gray-900 hover:bg-gray-50 w-full"
                    >
                      <User className="w-5 h-5" />
                      <div className="text-left">
                        <div className="font-medium">{user?.fullName || 'Dashboard'}</div>
                        <div className="text-xs text-gray-500">View your account</div>
                      </div>
                    </button>
                    <button
                      onClick={() => {
                        setIsMobileMenuOpen(false)
                        logout()
                      }}
                      className="flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 text-red-600 hover:text-red-700 hover:bg-red-50 w-full"
                    >
                      <LogOut className="w-5 h-5" />
                      <div className="text-left">
                        <div className="font-medium">Logout</div>
                        <div className="text-xs text-red-500">Sign out of your account</div>
                      </div>
                    </button>
                  </div>
                )}
                
                {/* CTA Buttons */}
                <div className="pt-4 border-t border-gray-200 space-y-3">
                  {!isAuthenticated ? (
                    <>
                      <button
                        onClick={() => {
                          window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
                          setIsMobileMenuOpen(false)
                          navigate('/login')
                        }}
                        className="w-full bg-gray-700 hover:bg-gray-800 text-white font-medium px-4 py-3 rounded-lg flex items-center justify-center space-x-2 transition-colors"
                      >
                        <User className="w-4 h-4" />
                        <span>Login</span>
                      </button>
                      <button
                        onClick={() => {
                          window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
                          setIsMobileMenuOpen(false)
                          navigate('/signup')
                        }}
                        className="w-full btn-gradient flex items-center justify-center space-x-2"
                      >
                        <UserPlus className="w-4 h-4" />
                        <span>Sign Up</span>
                      </button>
                    </>
                  ) : user?.accountStatus === 'ACTIVE' ? (
                    <button
                      onClick={() => {
                        window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
                        setIsMobileMenuOpen(false)
                        navigate('/predict')
                      }}
                      className="w-full btn-gradient flex items-center justify-center space-x-2"
                    >
                      <Zap className="w-4 h-4" />
                      <span>Try Predictor</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
                        setIsMobileMenuOpen(false)
                        navigate('/dashboard')
                      }}
                      className="w-full bg-yellow-600 hover:bg-yellow-700 text-white font-medium px-4 py-3 rounded-lg flex items-center justify-center space-x-2"
                    >
                      <Zap className="w-4 h-4" />
                      <span>Complete Payment</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
      </nav>

      {/* Simplified mobile menu overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/10 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
    </>
  )
}

// Desktop Navigation Link Component
const NavLink = ({ item, isActive }) => {
  return (
    <Link
      to={item.path}
      onClick={() => window.scrollTo({ top: 0, left: 0, behavior: 'instant' })}
      className={`relative px-3 py-1.5 rounded-md text-sm font-medium transition-all duration-200 flex items-center space-x-1.5 group ${
        isActive
          ? 'text-primary-600 bg-primary-50 border border-primary-200'
          : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100'
      }`}
    >
      <item.icon className={`w-4 h-4 ${isActive ? 'text-primary-500' : ''}`} />
      <span>{item.name}</span>
      
      {/* Active indicator */}
      {isActive && (
        <motion.div
          layoutId="navbar-indicator"
          className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-primary-500 to-medical-500 rounded-full"
          initial={false}
          transition={{ type: 'spring', stiffness: 500, damping: 35 }}
        />
      )}
    </Link>
  )
}

// Mobile Navigation Link Component
const MobileNavLink = ({ item, isActive }) => {
  return (
    <Link
      to={item.path}
      onClick={() => window.scrollTo({ top: 0, left: 0, behavior: 'instant' })}
      className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${
        isActive
          ? 'text-primary-600 bg-primary-50 border-l-4 border-primary-500'
          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
      }`}
    >
      <item.icon className={`w-5 h-5 ${isActive ? 'text-primary-500' : ''}`} />
      <div>
        <div className="font-medium">{item.name}</div>
        <div className="text-xs text-gray-500">{item.description}</div>
      </div>
    </Link>
  )
}

export default Navbar