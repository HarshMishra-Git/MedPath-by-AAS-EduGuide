import React from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { 
  Brain, 
  Heart, 
  Mail, 
  Phone, 
  MapPin,
  Github,
  Twitter,
  Linkedin,
  Shield,
  FileText,
  HelpCircle,
  X
} from 'lucide-react'

const Footer = () => {
  const currentYear = new Date().getFullYear()

  const quickLinks = [
    { name: 'Home', path: '/' },
    { name: 'Predict', path: '/predict' },
    { name: 'Results', path: '/results' },
    { name: 'About', path: '/about' },
    { name: 'Contact', path: '/contact' }
  ]

  const legalLinks = [
    { name: 'Privacy Policy', path: '/privacy', icon: Shield },
    { name: 'Terms of Service', path: '/terms', icon: FileText },
    { name: 'FAQ', path: '/faq', icon: HelpCircle }
  ]

  const socialLinks = [
    { name: 'GitHub', icon: Github, href: 'https://github.com/HarshMishra-Git' },
    { name: 'X', icon: X, href: 'https://x.com/AdmissionAll' },
    { name: 'LinkedIn', icon: Linkedin, href: 'https://www.linkedin.com/company/all-admission-services-kanpur/' }
  ]

  const contactInfo = [
    { 
      icon: Mail, 
      label: 'Email', 
      value: 'contact@alladmission.co.in',
      href: 'mailto:contact@alladmission.co.in'
    },
    { 
      icon: Phone, 
      label: 'Phone', 
      value: '+91 97216 36379',
      href: 'tel:+919721636379'
    },
    { 
      icon: MapPin, 
      label: 'Address', 
      value: 'Kakadeo, Kanpur, India'
    }
  ]

  return (
    <footer className="relative bg-gray-900 text-white overflow-hidden">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff12_1px,transparent_1px),linear-gradient(to_bottom,#ffffff12_1px,transparent_1px)] bg-[size:32px_32px]" />
      </div>

      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/95 to-gray-800/90" />

      <div className="relative z-10">
        {/* Main footer content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Brand section */}
            <div className="lg:col-span-1">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
              >
                <div className="flex items-center space-x-3 mb-4">
                  <div className="flex items-center justify-center">
                    <img 
                      src="/images/aas-logo.png" 
                      alt="AAS EduGuide Logo" 
                      className="w-12 h-10 object-contain"
                      onError={(e) => {
                        // Fallback if image doesn't load
                        e.target.style.display = 'none'
                        e.target.nextSibling.style.display = 'flex'
                      }}
                    />
                    <div className="w-10 h-10 bg-gradient-to-r from-primary-500 to-medical-500 rounded-xl items-center justify-center hidden">
                      <Brain className="w-6 h-6 text-white" />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-xl font-display font-bold">MedPath</h3>
                    <p className="text-sm text-gray-400">by AAS EduGuide</p>
                  </div>
                </div>
                <p className="text-gray-400 text-sm leading-relaxed mb-6">
                  MedPath by AAS EduGuide - Your AI-powered path to medical excellence. 
                  Find the perfect NEET college with 90%+ accurate predictions for both UG and PG admissions.
                </p>
                <div className="flex items-center space-x-4">
                  {socialLinks.map((social) => (
                    <motion.a
                      key={social.name}
                      href={social.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      className="p-2 bg-gray-800 hover:bg-gradient-to-r hover:from-primary-500 hover:to-medical-500 rounded-lg transition-all duration-200"
                      aria-label={social.name}
                    >
                      <social.icon className="w-4 h-4" />
                    </motion.a>
                  ))}
                </div>
              </motion.div>
            </div>

            {/* Quick Links */}
            <div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.1 }}
              >
                <h4 className="text-lg font-semibold mb-6">Quick Links</h4>
                <ul className="space-y-3">
                  {quickLinks.map((link) => (
                    <li key={link.path}>
                      <Link
                        to={link.path}
                        className="text-gray-400 hover:text-white transition-colors duration-200 text-sm flex items-center space-x-2 hover:translate-x-1 transform transition-transform"
                      >
                        <span className="w-1 h-1 bg-primary-500 rounded-full" />
                        <span>{link.name}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </motion.div>
            </div>

            {/* Legal & Support */}
            <div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <h4 className="text-lg font-semibold mb-6">Legal & Support</h4>
                <ul className="space-y-3">
                  {legalLinks.map((link) => (
                    <li key={link.path}>
                      <Link
                        to={link.path}
                        className="text-gray-400 hover:text-white transition-colors duration-200 text-sm flex items-center space-x-3 hover:translate-x-1 transform transition-transform"
                      >
                        <link.icon className="w-4 h-4" />
                        <span>{link.name}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
                
                {/* System Status */}
                <div className="mt-8 p-3 bg-gray-800 rounded-lg border border-gray-700">
                  <h5 className="text-sm font-medium mb-2 text-gray-300">System Status</h5>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-success-500 rounded-full animate-pulse" />
                    <span className="text-xs text-success-400">All Systems Operational</span>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Contact Info */}
            <div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                <h4 className="text-lg font-semibold mb-6">Contact Us</h4>
                <ul className="space-y-4">
                  {contactInfo.map((info) => (
                    <li key={info.label}>
                      {info.href ? (
                        <a
                          href={info.href}
                          className="text-gray-400 hover:text-white transition-colors duration-200 text-sm flex items-start space-x-3 hover:translate-x-1 transform transition-transform"
                        >
                          <info.icon className="w-4 h-4 mt-0.5 text-primary-500" />
                          <div>
                            <p className="font-medium text-gray-300">{info.label}</p>
                            <p>{info.value}</p>
                          </div>
                        </a>
                      ) : (
                        <div className="text-gray-400 text-sm flex items-start space-x-3">
                          <info.icon className="w-4 h-4 mt-0.5 text-primary-500" />
                          <div>
                            <p className="font-medium text-gray-300">{info.label}</p>
                            <p>{info.value}</p>
                          </div>
                        </div>
                      )}
                    </li>
                  ))}
                </ul>

                {/* Newsletter signup */}
                <div className="mt-8 p-4 bg-gradient-to-r from-primary-900/50 to-medical-900/50 rounded-lg border border-primary-800/50">
                  <h5 className="text-sm font-medium mb-2 text-white">Stay Updated</h5>
                  <p className="text-xs text-gray-300 mb-3">Get the latest updates on NEET college admissions</p>
                  <div className="flex flex-col space-y-2">
                    <input
                      type="email"
                      placeholder="Enter your email"
                      className="w-full px-3 py-2 bg-gray-800/80 border border-gray-600 rounded text-sm text-white placeholder-gray-400 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
                    />
                    <button className="w-full px-4 py-2 bg-gradient-to-r from-primary-500 to-medical-500 rounded text-sm font-medium text-white hover:shadow-lg hover:scale-105 transition-all duration-200">
                      Join
                    </button>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-gray-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
              <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                className="flex flex-col md:flex-row items-center space-y-2 md:space-y-0 md:space-x-4 text-sm text-gray-400"
              >
                <p>&copy; {currentYear} MedPath by AAS EduGuide. All rights reserved.</p>
                <div className="hidden md:block w-1 h-1 bg-gray-600 rounded-full" />
                <div className="flex items-center space-x-1">
                  <span>Made with</span>
                  <Heart className="w-4 h-4 text-red-500 animate-pulse" />
                  <span>for NEET aspirants</span>
                </div>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                className="flex items-center space-x-4 text-xs text-gray-500"
              >
                <span>Version 1.0.0</span>
                <div className="w-1 h-1 bg-gray-600 rounded-full" />
                <span>Last Updated: Sep 2025</span>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer