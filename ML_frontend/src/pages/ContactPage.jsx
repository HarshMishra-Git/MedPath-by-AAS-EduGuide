import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import toast from 'react-hot-toast'
import PaymentNotificationBanner from '../components/payment/PaymentNotificationBanner'
import {
  Mail, 
  Phone, 
  MapPin, 
  Clock, 
  Send,
  MessageSquare,
  HelpCircle,
  Bug,
  Lightbulb,
  Heart,
  CheckCircle,
  AlertCircle,
  User,
  Building,
  Globe
} from 'lucide-react'

// Form validation schema
const contactSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  subject: z.string().min(5, 'Subject must be at least 5 characters'),
  category: z.string().min(1, 'Please select a category'),
  message: z.string().min(20, 'Message must be at least 20 characters'),
  phone: z.string().optional(),
  organization: z.string().optional()
})

const ContactPage = () => {
  return (
    <div className="min-h-screen">
      {/* Payment Notification Banner */}
      <PaymentNotificationBanner />
      
      {/* Hero Section */}
      <HeroSection />
      
      {/* Contact Form & Info */}
      <ContactSection />
      
      {/* FAQ Section */}
      <FAQSection />
      
      {/* Support Options */}
      <SupportOptionsSection />
    </div>
  )
}

// Hero Section
const HeroSection = () => {
  return (
    <section className="relative py-20 lg:py-32 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="w-20 h-20 bg-gradient-to-r from-primary-500 to-medical-500 rounded-3xl flex items-center justify-center mx-auto mb-8">
              <MessageSquare className="w-10 h-10 text-white" />
            </div>
            
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-display font-bold leading-tight mb-6">
              Get in <span className="text-gradient-primary">Touch</span>
            </h1>
            
            <p className="text-xl sm:text-2xl text-gray-600 mb-8 max-w-4xl mx-auto leading-relaxed text-justify">
              Have questions about our ML predictions? Need technical support? Want to partner with us? 
              We're here to help you succeed in your NEET journey.
            </p>
            
            <div className="flex flex-wrap justify-center items-center gap-8 text-gray-500">
              <div className="flex items-center space-x-2">
                <Clock className="w-5 h-5" />
                <span className="font-medium">24/7 Support</span>
              </div>
              <div className="flex items-center space-x-2">
                <Mail className="w-5 h-5" />
                <span className="font-medium">Quick Response</span>
              </div>
              <div className="flex items-center space-x-2">
                <Heart className="w-5 h-5" />
                <span className="font-medium">Personal Care</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

// Contact Section
const ContactSection = () => {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          {/* Contact Form */}
          <ContactForm />
          
          {/* Contact Information */}
          <ContactInfo />
        </div>
      </div>
    </section>
  )
}

// Contact Form Component
const ContactForm = () => {
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm({
    resolver: zodResolver(contactSchema)
  })

  const onSubmit = async (data) => {
    setIsSubmitting(true)
    
    try {
      // Simulate form submission
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      toast.success('Message sent successfully! We\'ll get back to you within 24 hours.', {
        duration: 5000
      })
      
      reset()
    } catch (error) {
      toast.error('Failed to send message. Please try again or contact us directly.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const categories = [
    { value: 'general', label: 'General Inquiry' },
    { value: 'technical', label: 'Technical Support' },
    { value: 'partnership', label: 'Partnership' },
    { value: 'bug', label: 'Bug Report' },
    { value: 'feature', label: 'Feature Request' },
    { value: 'billing', label: 'Billing & Pricing' }
  ]

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      className="card-premium p-8"
    >
      <div className="mb-8">
        <h2 className="text-3xl font-display font-bold text-gray-900 mb-4">
          Send us a Message
        </h2>
        <p className="text-gray-600 text-justify">
          Fill out the form below and we'll respond as soon as possible. All fields marked with * are required.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Name and Email Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <User className="inline w-4 h-4 mr-1" />
              Full Name *
            </label>
            <input
              {...register('name')}
              type="text"
              className={`input-premium ${errors.name ? 'border-red-300 focus:border-red-500' : ''}`}
              placeholder="Enter your full name"
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-600 flex items-center">
                <AlertCircle className="w-4 h-4 mr-1" />
                {errors.name.message}
              </p>
            )}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Mail className="inline w-4 h-4 mr-1" />
              Email Address *
            </label>
            <input
              {...register('email')}
              type="email"
              className={`input-premium ${errors.email ? 'border-red-300 focus:border-red-500' : ''}`}
              placeholder="Enter your email address"
            />
            {errors.email && (
              <p className="mt-1 text-sm text-red-600 flex items-center">
                <AlertCircle className="w-4 h-4 mr-1" />
                {errors.email.message}
              </p>
            )}
          </div>
        </div>

        {/* Phone and Organization Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Phone className="inline w-4 h-4 mr-1" />
              Phone Number
            </label>
            <input
              {...register('phone')}
              type="tel"
              className="input-premium"
              placeholder="Enter your phone number"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Building className="inline w-4 h-4 mr-1" />
              Organization
            </label>
            <input
              {...register('organization')}
              type="text"
              className="input-premium"
              placeholder="School, college, or company"
            />
          </div>
        </div>

        {/* Category */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <HelpCircle className="inline w-4 h-4 mr-1" />
            Category *
          </label>
          <select
            {...register('category')}
            className={`input-premium ${errors.category ? 'border-red-300 focus:border-red-500' : ''}`}
          >
            <option value="">Select a category</option>
            {categories.map(cat => (
              <option key={cat.value} value={cat.value}>{cat.label}</option>
            ))}
          </select>
          {errors.category && (
            <p className="mt-1 text-sm text-red-600 flex items-center">
              <AlertCircle className="w-4 h-4 mr-1" />
              {errors.category.message}
            </p>
          )}
        </div>

        {/* Subject */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Subject *
          </label>
          <input
            {...register('subject')}
            type="text"
            className={`input-premium ${errors.subject ? 'border-red-300 focus:border-red-500' : ''}`}
            placeholder="Brief description of your inquiry"
          />
          {errors.subject && (
            <p className="mt-1 text-sm text-red-600 flex items-center">
              <AlertCircle className="w-4 h-4 mr-1" />
              {errors.subject.message}
            </p>
          )}
        </div>

        {/* Message */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <MessageSquare className="inline w-4 h-4 mr-1" />
            Message *
          </label>
          <textarea
            {...register('message')}
            rows={6}
            className={`input-premium resize-none ${errors.message ? 'border-red-300 focus:border-red-500' : ''}`}
            placeholder="Please provide details about your inquiry, including any relevant information that might help us assist you better."
          />
          {errors.message && (
            <p className="mt-1 text-sm text-red-600 flex items-center">
              <AlertCircle className="w-4 h-4 mr-1" />
              {errors.message.message}
            </p>
          )}
        </div>

        {/* Submit Button */}
        <motion.button
          type="submit"
          disabled={isSubmitting}
          whileHover={{ scale: isSubmitting ? 1 : 1.02 }}
          whileTap={{ scale: isSubmitting ? 1 : 0.98 }}
          className={`w-full btn-gradient flex items-center justify-center space-x-2 ${
            isSubmitting ? 'opacity-70 cursor-not-allowed' : ''
          }`}
        >
          {isSubmitting ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>Sending Message...</span>
            </>
          ) : (
            <>
              <Send className="w-5 h-5" />
              <span>Send Message</span>
            </>
          )}
        </motion.button>

        {/* Privacy Note */}
        <div className="text-xs text-gray-500 bg-gray-50 p-3 rounded-lg">
          <CheckCircle className="inline w-4 h-4 mr-1 text-success-500" />
          Your privacy is important to us. We'll never share your information with third parties 
          and will only use it to respond to your inquiry.
        </div>
      </form>
    </motion.div>
  )
}

// Contact Information Component
const ContactInfo = () => {
  const contactMethods = [
    {
      icon: Mail,
      title: 'Email Support',
      details: 'akhilesh@aaseduguide.com',
      description: 'Get help with technical issues, account questions, or general inquiries.',
      link: 'mailto:akhilesh@aaseduguide.com',
      responseTime: 'Usually responds within 2-4 hours'
    },
    {
      icon: Phone,
      title: 'Phone Support',
      details: '+91 97216 36379',
      description: 'Speak directly with our support team for urgent matters.',
      link: 'tel:+919721636379',
      responseTime: 'Available 10 AM - 6 PM IST'
    },
    {
      icon: MessageSquare,
      title: 'Live Chat',
      details: 'Chat with us',
      description: 'Get instant answers to common questions about predictions and features.',
      link: 'https://api.whatsapp.com/send/?phone=%2B919721636379&text&type=phone_number&app_absent=0',
      responseTime: 'Available 24/7'
    },
    {
      icon: MapPin,
      title: 'Office Address',
      details: 'AAS EduGuide',
      description: 'Kakadeo, Kanpur 208005, India',
      link: 'https://www.google.com/maps?gs_lcrp=EgZjaHJvbWUqFQgCEC4YJxivARjHARiABBiKBRiOBTIGCAAQRRg5MgYIARBFGDsyFQgCEC4YJxivARjHARiABBiKBRiOBTINCAMQABiDARixAxiABDIGCAQQRRg8MgYIBRBFGDwyBggGEEUYPDIGCAcQRRg80gEIMzAwOGowajeoAgCwAgA&um=1&ie=UTF-8&fb=1&gl=in&sa=X&geocode=KZfd6qINOJw5MSmDmEQ7iMAA&daddr=117/H-1/377,+Pandu+Nagar,+near+Agra+Sweet+House,+Kakadeo,+Kanpur,+Uttar+Pradesh+208005',
      responseTime: 'Visit by appointment only'
    }
  ]

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      className="space-y-8"
    >
      <div className="mb-8">
        <h2 className="text-3xl font-display font-bold text-gray-900 mb-4">
          Contact Information
        </h2>
        <p className="text-gray-600">
          Choose the most convenient way to reach us. We're committed to providing 
          excellent support for all your NEET prediction needs.
        </p>
      </div>

      <div className="space-y-6">
        {contactMethods.map((method, index) => (
          <motion.div
            key={method.title}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.1 }}
            className="card-premium p-6 hover-lift"
          >
            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 bg-gradient-to-r from-primary-500 to-medical-500 rounded-xl flex items-center justify-center flex-shrink-0">
                <method.icon className="w-6 h-6 text-white" />
              </div>
              
              <div className="flex-1">
                <h3 className="text-lg font-display font-bold text-gray-900 mb-1">
                  {method.title}
                </h3>
                <p className="text-primary-600 font-medium mb-2">
                  {method.details}
                </p>
                <p className="text-gray-600 text-sm mb-2">
                  {method.description}
                </p>
                <p className="text-xs text-gray-500">
                  {method.responseTime}
                </p>
                
                {method.link !== '#' && (
                  <motion.a
                    href={method.link}
                    whileHover={{ scale: 1.05 }}
                    className="inline-flex items-center mt-3 text-sm text-primary-600 hover:text-primary-700 font-medium"
                  >
                    <span>Contact now</span>
                    <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </motion.a>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Business Hours */}
      <div className="card-gradient p-6 border-l-4 border-primary-500">
        <h3 className="text-lg font-display font-bold text-gray-900 mb-4 flex items-center">
          <Clock className="w-5 h-5 mr-2 text-primary-600" />
          Business Hours
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
          <div>
            <p className="font-medium text-gray-700">Monday - Friday</p>
            <p className="text-gray-600">9:00 AM - 9:00 PM IST</p>
          </div>
          <div>
            <p className="font-medium text-gray-700">Saturday - Sunday</p>
            <p className="text-gray-600">10:00 AM - 6:00 PM IST</p>
          </div>
        </div>
        <div className="mt-4 p-3 bg-success-50 rounded-lg">
          <p className="text-sm text-success-700">
            <CheckCircle className="inline w-4 h-4 mr-1" />
            Emergency support available 24/7 for critical issues
          </p>
        </div>
      </div>
    </motion.div>
  )
}

// FAQ Section
const FAQSection = () => {
  const faqs = [
    {
      question: 'How accurate are your ML predictions?',
      answer: 'Our ensemble models achieve 90%+ accuracy by combining neural networks, gradient boosting, and expert knowledge. We continuously validate our predictions against actual admission results.'
    },
    {
      question: 'How long does it take to get prediction results?',
      answer: 'Basic predictions are generated instantly. Comprehensive reports with detailed analysis are typically ready within 2-3 minutes of form submission.'
    },
    {
      question: 'Do you store my personal information?',
      answer: 'We follow strict privacy policies and only store necessary information to improve our services. Your data is encrypted and never shared with third parties without your consent.'
    },
    {
      question: 'Can I get predictions for previous years?',
      answer: 'Yes, our models can generate predictions for historical NEET years to help you understand admission trends and validate our accuracy.'
    },
    {
      question: 'What if I find an error in my prediction?',
      answer: 'Please contact our support team immediately with your prediction ID and details about the error. We investigate all reported issues and provide corrected results if necessary.'
    }
  ]

  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl font-display font-bold text-gray-900 mb-4">
            Frequently Asked <span className="text-gradient-primary">Questions</span>
          </h2>
          <p className="text-xl text-gray-600">
            Quick answers to common questions about our ML prediction system
          </p>
        </motion.div>

        <div className="space-y-6">
          {faqs.map((faq, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="card-premium p-6"
            >
              <h3 className="text-lg font-display font-bold text-gray-900 mb-3 flex items-start">
                <HelpCircle className="w-5 h-5 mr-2 text-primary-500 mt-0.5 flex-shrink-0" />
                {faq.question}
              </h3>
              <p className="text-gray-600 leading-relaxed pl-7">
                {faq.answer}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

// Support Options Section
const SupportOptionsSection = () => {
  const supportOptions = [
    {
      icon: HelpCircle,
      title: 'Help Center',
      description: 'Browse our comprehensive documentation and tutorials',
      action: 'Visit Help Center',
      color: 'primary'
    },
    {
      icon: Bug,
      title: 'Report Bug',
      description: 'Found a technical issue? Help us improve by reporting it',
      action: 'Report Issue',
      color: 'danger'
    },
    {
      icon: Lightbulb,
      title: 'Feature Request',
      description: 'Suggest new features or improvements to our platform',
      action: 'Submit Idea',
      color: 'warning'
    },
    {
      icon: Globe,
      title: 'Community',
      description: 'Join our community forum to connect with other students',
      action: 'Join Community',
      color: 'success'
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
          <h2 className="text-3xl font-display font-bold text-gray-900 mb-4">
            Other Ways to Get <span className="text-gradient-primary">Support</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Explore additional resources and support channels to make the most of our platform
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {supportOptions.map((option, index) => (
            <motion.div
              key={option.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="card-premium p-6 text-center hover-lift"
            >
              <div className={`w-12 h-12 bg-gradient-to-r from-${option.color}-500 to-${option.color}-600 rounded-xl flex items-center justify-center mx-auto mb-4`}>
                <option.icon className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-display font-bold text-gray-900 mb-3">
                {option.title}
              </h3>
              <p className="text-gray-600 text-sm mb-4 leading-relaxed">
                {option.description}
              </p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`btn-${option.color} text-sm px-4 py-2`}
              >
                {option.action}
              </motion.button>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default ContactPage