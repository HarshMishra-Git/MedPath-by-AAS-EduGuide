import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Menu } from 'lucide-react'
import { Link, useLocation } from 'react-router-dom'

const MobileMenu = ({ isOpen, onToggle, navigation = [] }) => {
  const location = useLocation()

  // Close menu on route change
  useEffect(() => {
    if (isOpen) {
      onToggle()
    }
  }, [location])

  // Prevent body scroll when menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }

    // Cleanup
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  const menuVariants = {
    closed: {
      opacity: 0,
      scale: 0.95,
      transition: {
        duration: 0.2,
        ease: 'easeInOut'
      }
    },
    open: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.3,
        ease: 'easeOut'
      }
    }
  }

  const overlayVariants = {
    closed: {
      opacity: 0,
      transition: {
        duration: 0.2,
        ease: 'easeInOut'
      }
    },
    open: {
      opacity: 1,
      transition: {
        duration: 0.3,
        ease: 'easeOut'
      }
    }
  }

  const itemVariants = {
    closed: {
      x: -20,
      opacity: 0
    },
    open: (custom) => ({
      x: 0,
      opacity: 1,
      transition: {
        delay: custom * 0.1,
        duration: 0.3,
        ease: 'easeOut'
      }
    })
  }

  return (
    <>
      {/* Menu Toggle Button */}
      <button
        onClick={onToggle}
        className="lg:hidden p-2 rounded-lg text-gray-600 dark:text-gray-400 
                   hover:bg-gray-100 dark:hover:bg-gray-800 
                   focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                   transition-colors duration-200"
        aria-label={isOpen ? 'Close menu' : 'Open menu'}
      >
        <motion.div
          animate={{ rotate: isOpen ? 90 : 0 }}
          transition={{ duration: 0.2 }}
        >
          {isOpen ? (
            <X className="w-6 h-6" />
          ) : (
            <Menu className="w-6 h-6" />
          )}
        </motion.div>
      </button>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              variants={overlayVariants}
              initial="closed"
              animate="open"
              exit="closed"
              className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
              onClick={onToggle}
            />

            {/* Menu Panel */}
            <motion.div
              variants={menuVariants}
              initial="closed"
              animate="open"
              exit="closed"
              className="fixed top-0 left-0 right-0 z-50 bg-white dark:bg-gray-900 
                         border-b border-gray-200 dark:border-gray-800
                         shadow-xl lg:hidden safe-top"
              style={{ maxHeight: '100vh', overflowY: 'auto' }}
            >
              <div className="px-4 py-6">
                {/* Menu Header */}
                <div className="flex items-center justify-between mb-8">
                  <motion.h2
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 }}
                    className="text-xl font-bold text-gray-900 dark:text-white"
                  >
                    Menu
                  </motion.h2>
                  <button
                    onClick={onToggle}
                    className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 
                             dark:text-gray-400 dark:hover:bg-gray-800
                             transition-colors duration-200"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                {/* Navigation Links */}
                <nav className="space-y-4">
                  {navigation.map((item, index) => (
                    <motion.div
                      key={item.name}
                      variants={itemVariants}
                      initial="closed"
                      animate="open"
                      custom={index}
                      className="block"
                    >
                      <Link
                        to={item.href}
                        className={`flex items-center px-4 py-3 rounded-lg text-left 
                                  transition-all duration-200 w-full
                                  ${location.pathname === item.href
                                    ? 'bg-blue-50 text-blue-700 border border-blue-200 font-medium dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800'
                                    : 'text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-800'
                                  }`}
                        onClick={onToggle}
                      >
                        {item.icon && (
                          <item.icon className={`w-5 h-5 mr-3 
                            ${location.pathname === item.href
                              ? 'text-blue-600 dark:text-blue-400'
                              : 'text-gray-400 dark:text-gray-500'
                            }`} 
                          />
                        )}
                        <span className="text-lg">{item.name}</span>
                        {location.pathname === item.href && (
                          <motion.div
                            layoutId="activeMobile"
                            className="ml-auto w-2 h-2 bg-blue-600 dark:bg-blue-400 rounded-full"
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ duration: 0.2 }}
                          />
                        )}
                      </Link>
                    </motion.div>
                  ))}
                </nav>

                {/* Additional Menu Content */}
                <motion.div
                  variants={itemVariants}
                  initial="closed"
                  animate="open"
                  custom={navigation.length}
                  className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-700"
                >
                  <div className="text-sm text-gray-500 dark:text-gray-400 text-center">
                    NEET College Finder
                  </div>
                  <div className="text-xs text-gray-400 dark:text-gray-500 text-center mt-1">
                    Find your perfect medical college
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}

export default MobileMenu