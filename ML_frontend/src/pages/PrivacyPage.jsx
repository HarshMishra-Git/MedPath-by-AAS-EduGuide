import React from 'react'
import { motion } from 'framer-motion'
import { Shield, Lock, Eye, Database, UserCheck, AlertCircle, CheckCircle, Mail } from 'lucide-react'

const PrivacyPage = () => {
  const sections = [
    {
      icon: Database,
      title: "Information We Collect",
      content: [
        {
          subtitle: "Personal Information",
          text: "We collect information you provide directly, including your name, email address, NEET rank, category, state preference, and educational background when you use our prediction services."
        },
        {
          subtitle: "Usage Data",
          text: "We automatically collect information about your device, browser type, IP address, and how you interact with our platform to improve our services."
        },
        {
          subtitle: "Cookies and Tracking",
          text: "We use cookies and similar tracking technologies to enhance your experience, analyze usage patterns, and personalize content."
        }
      ]
    },
    {
      icon: Lock,
      title: "How We Use Your Information",
      content: [
        {
          subtitle: "Service Delivery",
          text: "We use your information to provide accurate college predictions, generate personalized recommendations, and deliver the core functionality of MedPath."
        },
        {
          subtitle: "Communication",
          text: "We may use your email to send service updates, prediction results, and important notifications about your account and our services."
        },
        {
          subtitle: "Analytics & Improvement",
          text: "Your data helps us analyze trends, improve our ML models, enhance user experience, and develop new features for better predictions."
        }
      ]
    },
    {
      icon: Shield,
      title: "Data Protection & Security",
      content: [
        {
          subtitle: "Encryption",
          text: "All data transmitted between your device and our servers is encrypted using industry-standard SSL/TLS protocols to ensure security."
        },
        {
          subtitle: "Access Controls",
          text: "We implement strict access controls and authentication mechanisms. Only authorized personnel can access user data, and all access is logged."
        },
        {
          subtitle: "Regular Audits",
          text: "We conduct regular security audits and vulnerability assessments to identify and address potential security risks proactively."
        }
      ]
    },
    {
      icon: Eye,
      title: "Data Sharing & Disclosure",
      content: [
        {
          subtitle: "No Third-Party Sales",
          text: "We do not sell, rent, or trade your personal information to third parties for marketing purposes. Your data is yours."
        },
        {
          subtitle: "Service Providers",
          text: "We may share data with trusted service providers who assist in operating our platform, conducting business, or servicing you, bound by confidentiality agreements."
        },
        {
          subtitle: "Legal Requirements",
          text: "We may disclose information when required by law, to protect our rights, or to comply with legal processes and government requests."
        }
      ]
    },
    {
      icon: UserCheck,
      title: "Your Rights & Choices",
      content: [
        {
          subtitle: "Access & Correction",
          text: "You have the right to access, update, or correct your personal information at any time through your account settings or by contacting us."
        },
        {
          subtitle: "Data Deletion",
          text: "You can request deletion of your account and personal data. We will process such requests within 30 days, subject to legal obligations."
        },
        {
          subtitle: "Opt-Out Options",
          text: "You can opt out of promotional emails and adjust your communication preferences. Essential service notifications may still be sent."
        }
      ]
    },
    {
      icon: AlertCircle,
      title: "Data Retention",
      content: [
        {
          subtitle: "Active Accounts",
          text: "We retain your data while your account is active and for a reasonable period thereafter to provide services and comply with legal obligations."
        },
        {
          subtitle: "Inactive Accounts",
          text: "Accounts inactive for more than 3 years may be archived or deleted. We will notify you before taking such action."
        },
        {
          subtitle: "Legal Requirements",
          text: "Some data may be retained longer if required by law, for dispute resolution, or to enforce our agreements."
        }
      ]
    }
  ]

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
              <Shield className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
            </div>
            
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-display font-bold mb-4 sm:mb-6">
              Privacy Policy
            </h1>
            
            <p className="text-lg sm:text-xl md:text-2xl text-blue-100 max-w-3xl mx-auto mb-6 sm:mb-8 leading-relaxed px-4">
              Your privacy is our priority. Learn how we collect, use, and protect your personal information.
            </p>
            
            <div className="flex flex-wrap justify-center gap-4 sm:gap-6 text-sm sm:text-base">
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-success-400" />
                <span>Last Updated: January 2025</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-success-400" />
                <span>GDPR Compliant</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-12 sm:py-16 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Introduction */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-white rounded-xl sm:rounded-2xl p-6 sm:p-8 md:p-10 shadow-lg border border-gray-100 mb-8 sm:mb-12"
          >
            <h2 className="text-2xl sm:text-3xl font-display font-bold text-gray-900 mb-4 sm:mb-6">
              Introduction
            </h2>
            <div className="prose prose-sm sm:prose-base max-w-none text-gray-600 leading-relaxed space-y-4">
              <p>
                Welcome to MedPath by AAS EduGuide ("we," "our," or "us"). We are committed to protecting your personal information and your right to privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our NEET college prediction platform.
              </p>
              <p>
                By using MedPath, you agree to the collection and use of information in accordance with this policy. If you do not agree with our policies and practices, please do not use our services.
              </p>
            </div>
          </motion.div>

          {/* Privacy Sections */}
          <div className="space-y-6 sm:space-y-8">
            {sections.map((section, index) => (
              <motion.div
                key={section.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-xl sm:rounded-2xl p-6 sm:p-8 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow duration-300"
              >
                <div className="flex items-start space-x-4 sm:space-x-6 mb-6">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 bg-gradient-to-r from-primary-500 to-primary-600 rounded-xl sm:rounded-2xl flex items-center justify-center">
                      <section.icon className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-white" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <h2 className="text-xl sm:text-2xl md:text-3xl font-display font-bold text-gray-900 mb-4">
                      {section.title}
                    </h2>
                  </div>
                </div>

                <div className="space-y-6 ml-0 sm:ml-20">
                  {section.content.map((item, idx) => (
                    <div key={idx} className="border-l-4 border-primary-200 pl-4 sm:pl-6">
                      <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">
                        {item.subtitle}
                      </h3>
                      <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                        {item.text}
                      </p>
                    </div>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>

          {/* Contact Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-gradient-to-r from-primary-50 to-blue-50 rounded-xl sm:rounded-2xl p-6 sm:p-8 md:p-10 mt-8 sm:mt-12 border border-primary-100"
          >
            <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-4 sm:space-y-0 sm:space-x-6">
              <div className="flex-shrink-0">
                <div className="w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-r from-primary-600 to-primary-700 rounded-2xl flex items-center justify-center">
                  <Mail className="w-7 h-7 sm:w-8 sm:h-8 text-white" />
                </div>
              </div>
              <div className="flex-1">
                <h3 className="text-xl sm:text-2xl font-display font-bold text-gray-900 mb-2">
                  Questions About Privacy?
                </h3>
                <p className="text-sm sm:text-base text-gray-600 mb-4">
                  If you have questions or concerns about our privacy practices, please contact us at:
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

          {/* Updates Notice */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-yellow-50 border border-yellow-200 rounded-xl sm:rounded-2xl p-6 sm:p-8 mt-8 sm:mt-12"
          >
            <div className="flex items-start space-x-4">
              <AlertCircle className="w-6 h-6 sm:w-7 sm:h-7 text-yellow-600 flex-shrink-0 mt-1" />
              <div>
                <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">
                  Policy Updates
                </h3>
                <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                  We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last Updated" date. You are advised to review this Privacy Policy periodically for any changes.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  )
}

export default PrivacyPage