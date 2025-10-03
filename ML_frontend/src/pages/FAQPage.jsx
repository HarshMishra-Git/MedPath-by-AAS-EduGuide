import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { HelpCircle, ChevronDown, Search, Brain, Target, Shield, Mail, CheckCircle } from 'lucide-react'

const FAQPage = () => {
  const [searchQuery, setSearchQuery] = useState('')
  const [openIndex, setOpenIndex] = useState(null)

  const categories = [
    {
      name: "General Questions",
      icon: HelpCircle,
      color: "from-blue-500 to-blue-600",
      faqs: [
        {
          question: "What is MedPath?",
          answer: "MedPath is an AI-powered NEET college prediction platform developed by AAS EduGuide. It uses advanced machine learning models trained on years of historical admission data to predict your chances of getting into medical colleges based on your NEET rank, category, state preference, and quota."
        },
        {
          question: "How accurate are the predictions?",
          answer: "Our predictions have an accuracy rate of over 95%. However, it's important to note that these are estimates based on historical trends and patterns. Actual admission results can vary due to factors like seat matrix changes, number of applicants, counseling rounds, and policy modifications."
        },
        {
          question: "Is MedPath free to use?",
          answer: "MedPath offers both free and premium features. Basic college predictions are available for free to all users. Premium features include detailed analytics, personalized counseling strategies, real-time updates, and priority support."
        },
        {
          question: "Do I need to create an account?",
          answer: "While you can explore basic features without an account, creating a free account allows you to save your predictions, track multiple scenarios, receive personalized recommendations, and access your prediction history anytime."
        }
      ]
    },
    {
      name: "Prediction Process",
      icon: Brain,
      color: "from-purple-500 to-purple-600",
      faqs: [
        {
          question: "What information do I need to provide?",
          answer: "To get accurate predictions, you'll need to provide your NEET rank (AIR or state rank), category (General, OBC, SC, ST, EWS), domicile state, preferred quota (All India, State, Management, NRI, etc.), and your preferences regarding college type and location."
        },
        {
          question: "Can I predict for both UG and PG admissions?",
          answer: "Yes! MedPath supports predictions for both NEET UG (MBBS/BDS admissions) and NEET PG (MD/MS/Diploma admissions). Simply select your exam type when starting a new prediction."
        },
        {
          question: "How long does it take to get results?",
          answer: "Our AI-powered prediction engine processes your information in real-time. You'll typically receive your personalized college recommendations and admission probability analysis within 2-3 seconds of submitting your details."
        },
        {
          question: "Can I modify my inputs after prediction?",
          answer: "Absolutely! You can adjust any parameter (rank, category, preferences) and run new predictions as many times as you want. This helps you explore different scenarios and make informed decisions about your college choices."
        }
      ]
    },
    {
      name: "Understanding Results",
      icon: Target,
      color: "from-green-500 to-green-600",
      faqs: [
        {
          question: "What do the safety levels mean?",
          answer: "Safety levels indicate your admission probability: 'High Chance' (>80% probability - Very safe choice), 'Moderate Chance' (50-80% probability - Safe choice with some risk), and 'Low Chance' (<50% probability - Reach/aspirational choice). We recommend applying to a mix of all three categories."
        },
        {
          question: "What is predicted closing rank?",
          answer: "The predicted closing rank is our ML model's estimate of the last rank at which a candidate was admitted to a particular college-course-category combination in counseling. It's based on historical trends and helps you understand if your rank is above or below the expected cutoff."
        },
        {
          question: "How should I use these predictions for counseling?",
          answer: "Use our predictions as one important tool in your decision-making process. Create a balanced college list with safe, moderate, and reach options. Consider factors beyond rank like college location, infrastructure, faculty, fees, and your career goals. Our predictions help you make informed choices during counseling."
        },
        {
          question: "Why do some colleges show 'Data Not Available'?",
          answer: "This happens when we don't have sufficient historical data for certain combinations (college-course-category-quota). This can occur for new colleges, newly added courses, or rare category-quota combinations. We continuously update our database as new data becomes available."
        }
      ]
    },
    {
      name: "Data & Privacy",
      icon: Shield,
      color: "from-indigo-500 to-indigo-600",
      faqs: [
        {
          question: "Is my personal data secure?",
          answer: "Yes! We take data security very seriously. All data transmission is encrypted using industry-standard SSL/TLS protocols. Your personal information is stored securely and we never sell or share your data with third parties. Read our Privacy Policy for complete details."
        },
        {
          question: "What data do you collect?",
          answer: "We collect only the information necessary to provide our services: your NEET rank, category, preferences, and contact details if you create an account. We also collect usage analytics to improve our platform. You have full control over your data and can request deletion at any time."
        },
        {
          question: "Can I delete my account and data?",
          answer: "Yes, you have the right to delete your account and all associated personal data. Go to your account settings and select 'Delete Account' or contact our support team. We will process your request within 30 days and permanently remove your information from our systems."
        },
        {
          question: "Do you share my data with colleges?",
          answer: "No, we never share your individual data with medical colleges or any third parties. We may use aggregated, anonymized data for research and platform improvement, but your personal information remains completely confidential."
        }
      ]
    },
    {
      name: "Technical Support",
      icon: Mail,
      color: "from-teal-500 to-teal-600",
      faqs: [
        {
          question: "What if I encounter an error or bug?",
          answer: "If you experience any technical issues, please contact our support team at contact@alladmission.co.in with details about the problem, including screenshots if possible. Our team typically responds within 24 hours and works to resolve issues promptly."
        },
        {
          question: "Which browsers are supported?",
          answer: "MedPath works best on modern browsers including Google Chrome, Firefox, Safari, and Microsoft Edge (latest versions). We recommend keeping your browser updated for the best experience. The platform is also fully responsive and works on mobile devices and tablets."
        },
        {
          question: "Is there a mobile app?",
          answer: "Currently, MedPath is a web-based platform accessible through any browser on your phone, tablet, or computer. A dedicated mobile app is in development and will be available soon. Follow us on social media for updates!"
        },
        {
          question: "How often is the data updated?",
          answer: "We update our database regularly as new admission data becomes available from MCC (Medical Counseling Committee) and state counseling authorities. Major updates occur after each counseling round, and our ML models are retrained quarterly to incorporate the latest trends."
        }
      ]
    }
  ]

  const toggleAccordion = (index) => {
    setOpenIndex(openIndex === index ? null : index)
  }

  // Filter FAQs based on search query
  const filteredCategories = categories.map(category => ({
    ...category,
    faqs: category.faqs.filter(faq =>
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })).filter(category => category.faqs.length > 0)

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-primary-700 to-primary-900 text-white py-16 sm:py-20 md:py-24 overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff12_1px,transparent_1px),linear-gradient(to_bottom,#ffffff12_1px,transparent_1px)] bg-[size:32px_32px]" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 bg-white/10 backdrop-blur-sm rounded-2xl mb-6 sm:mb-8">
              <HelpCircle className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
            </div>
            
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-display font-bold mb-4 sm:mb-6">
              Frequently Asked Questions
            </h1>
            
            <p className="text-lg sm:text-xl md:text-2xl text-blue-100 max-w-3xl mx-auto mb-8 sm:mb-10 leading-relaxed px-4">
              Find answers to common questions about MedPath and our NEET college prediction services.
            </p>
            
            {/* Search Bar */}
            <div className="max-w-2xl mx-auto px-4">
              <div className="relative">
                <Search className="absolute left-4 sm:left-6 top-1/2 transform -translate-y-1/2 w-5 h-5 sm:w-6 sm:h-6 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search for questions..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 sm:pl-16 pr-4 sm:pr-6 py-3 sm:py-4 rounded-xl sm:rounded-2xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-4 focus:ring-white/30 text-sm sm:text-base"
                />
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* FAQ Categories */}
      <section className="py-12 sm:py-16 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {filteredCategories.length > 0 ? (
            <div className="space-y-12 sm:space-y-16 md:space-y-20">
              {filteredCategories.map((category, catIndex) => (
                <motion.div
                  key={category.name}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: catIndex * 0.1 }}
                >
                  {/* Category Header */}
                  <div className="flex items-center space-x-3 sm:space-x-4 mb-6 sm:mb-8">
                    <div className={`w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 bg-gradient-to-r ${category.color} rounded-xl flex items-center justify-center flex-shrink-0`}>
                      <category.icon className="w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10 text-white" />
                    </div>
                    <h2 className="text-3xl sm:text-4xl md:text-5xl font-display font-bold text-gray-900">
                      {category.name}
                    </h2>
                  </div>

                  {/* FAQ Items */}
                  <div className="space-y-4">
                    {category.faqs.map((faq, faqIndex) => {
                      const globalIndex = `${catIndex}-${faqIndex}`
                      const isOpen = openIndex === globalIndex

                      return (
                        <motion.div
                          key={globalIndex}
                          initial={{ opacity: 0, y: 10 }}
                          whileInView={{ opacity: 1, y: 0 }}
                          viewport={{ once: true }}
                          transition={{ delay: faqIndex * 0.05 }}
                          className="bg-white rounded-xl sm:rounded-2xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-shadow duration-300"
                        >
                          <button
                            onClick={() => toggleAccordion(globalIndex)}
                            className="w-full flex items-start justify-between p-5 sm:p-6 md:p-8 text-left hover:bg-gray-50 transition-colors duration-200"
                          >
                            <div className="flex-1 pr-4 sm:pr-6">
                              <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 leading-relaxed">
                                {faq.question}
                              </h3>
                            </div>
                            <motion.div
                              animate={{ rotate: isOpen ? 180 : 0 }}
                              transition={{ duration: 0.3 }}
                              className="flex-shrink-0"
                            >
                              <ChevronDown className={`w-5 h-5 sm:w-6 sm:h-6 ${isOpen ? 'text-primary-600' : 'text-gray-400'}`} />
                            </motion.div>
                          </button>

                          <AnimatePresence>
                            {isOpen && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.3 }}
                              >
                                <div className="px-5 sm:px-6 md:px-8 pb-6 sm:pb-8 md:pb-10 pt-0">
                                  <div className="border-t border-gray-100 pt-5 sm:pt-6 md:pt-8">
                                    <p className="text-base sm:text-lg md:text-xl text-gray-600 leading-relaxed">
                                      {faq.answer}
                                    </p>
                                  </div>
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </motion.div>
                      )
                    })}
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            // No Results Found
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-12 sm:py-16"
            >
              <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 bg-gray-100 rounded-full mb-4 sm:mb-6">
                <Search className="w-8 h-8 sm:w-10 sm:h-10 text-gray-400" />
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
                No results found
              </h3>
              <p className="text-sm sm:text-base text-gray-600 mb-6">
                Try adjusting your search query or browse all questions below.
              </p>
              <button
                onClick={() => setSearchQuery('')}
                className="inline-flex items-center space-x-2 px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-lg transition-colors duration-200"
              >
                <span>Clear Search</span>
              </button>
            </motion.div>
          )}

          {/* Still Have Questions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-gradient-to-r from-primary-50 to-blue-50 rounded-xl sm:rounded-2xl p-6 sm:p-8 md:p-10 mt-12 sm:mt-16 border border-primary-100"
          >
            <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-4 sm:space-y-0 sm:space-x-6">
              <div className="flex-shrink-0">
                <div className="w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-r from-primary-600 to-primary-700 rounded-2xl flex items-center justify-center">
                  <Mail className="w-7 h-7 sm:w-8 sm:h-8 text-white" />
                </div>
              </div>
              <div className="flex-1">
                <h3 className="text-xl sm:text-2xl font-display font-bold text-gray-900 mb-2">
                  Still Have Questions?
                </h3>
                <p className="text-sm sm:text-base text-gray-600 mb-4">
                  Can't find what you're looking for? Our support team is here to help!
                </p>
                <a 
                  href="mailto:contact@alladmission.co.in" 
                  className="inline-flex items-center space-x-2 text-primary-600 hover:text-primary-700 font-semibold text-sm sm:text-base"
                >
                  <Mail className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span>contact@alladmission.co.in</span>
                </a>
              </div>
            </div>
          </motion.div>

          {/* Quick Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mt-8 sm:mt-12"
          >
            {[
              { icon: CheckCircle, label: "95%+ Accuracy", color: "from-green-500 to-green-600" },
              { icon: HelpCircle, label: "24/7 Support", color: "from-blue-500 to-blue-600" },
              { icon: Shield, label: "Secure & Private", color: "from-purple-500 to-purple-600" }
            ].map((item, index) => (
              <div
                key={index}
                className="bg-white rounded-xl p-6 shadow-lg border border-gray-100 flex items-center space-x-4"
              >
                <div className={`w-12 h-12 bg-gradient-to-r ${item.color} rounded-xl flex items-center justify-center flex-shrink-0`}>
                  <item.icon className="w-6 h-6 text-white" />
                </div>
                <span className="text-base sm:text-lg font-bold text-gray-900">{item.label}</span>
              </div>
            ))}
          </motion.div>
        </div>
      </section>
    </div>
  )
}

export default FAQPage