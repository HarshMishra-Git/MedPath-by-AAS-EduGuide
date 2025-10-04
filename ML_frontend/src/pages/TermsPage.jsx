import React from 'react'
import { motion } from 'framer-motion'
import { FileText, Scale, AlertTriangle, Ban, CheckCircle, UserX, RefreshCw, Mail } from 'lucide-react'

const TermsPage = () => {
  const sections = [
    {
      icon: CheckCircle,
      title: "Acceptance of Terms",
      content: [
        {
          subtitle: "Agreement to Terms",
          text: "By accessing and using MedPath, you accept and agree to be bound by these Terms of Service and our Privacy Policy. If you disagree with any part of the terms, you may not access the service."
        },
        {
          subtitle: "Eligibility",
          text: "You must be at least 13 years old to use our services. If you are under 18, you must have parental or guardian consent. By using MedPath, you represent that you meet these requirements."
        },
        {
          subtitle: "Changes to Terms",
          text: "We reserve the right to modify these terms at any time. We will notify users of any material changes. Your continued use after changes constitutes acceptance of the modified terms."
        }
      ]
    },
    {
      icon: UserX,
      title: "User Accounts & Responsibilities",
      content: [
        {
          subtitle: "Account Creation",
          text: "You may need to create an account to access certain features. You are responsible for maintaining the confidentiality of your account credentials and for all activities under your account."
        },
        {
          subtitle: "Accurate Information",
          text: "You agree to provide accurate, current, and complete information during registration and to update such information to keep it accurate, current, and complete."
        },
        {
          subtitle: "Account Security",
          text: "You must immediately notify us of any unauthorized use of your account or any other breach of security. We are not liable for any loss or damage from your failure to comply with this security obligation."
        }
      ]
    },
    {
      icon: Scale,
      title: "Service Description & Limitations",
      content: [
        {
          subtitle: "Prediction Services",
          text: "MedPath provides AI-powered college admission predictions based on historical data and machine learning models. These predictions are estimates and should not be considered as guarantees of admission."
        },
        {
          subtitle: "No Guarantee",
          text: "We do not guarantee the accuracy, completeness, or reliability of any predictions, recommendations, or content. Actual admission results may vary significantly from our predictions."
        },
        {
          subtitle: "Educational Purpose",
          text: "Our service is intended for educational and informational purposes only. It should be used as one of many factors in your college selection process, not as the sole decision-making tool."
        }
      ]
    },
    {
      icon: Ban,
      title: "Prohibited Activities",
      content: [
        {
          subtitle: "Misuse of Service",
          text: "You may not use our service for any illegal purpose, to violate any laws, or to infringe upon the rights of others. This includes but is not limited to fraud, harassment, or spreading misinformation."
        },
        {
          subtitle: "System Interference",
          text: "You must not attempt to interfere with, compromise, or damage our systems, networks, or services. This includes introducing viruses, malware, or attempting unauthorized access."
        },
        {
          subtitle: "Data Scraping",
          text: "Automated data collection, scraping, or harvesting of our content or data without express written permission is strictly prohibited and may result in legal action."
        }
      ]
    },
    {
      icon: FileText,
      title: "Intellectual Property Rights",
      content: [
        {
          subtitle: "Ownership",
          text: "All content, features, functionality, software, and ML models on MedPath are owned by AAS EduGuide and are protected by international copyright, trademark, and other intellectual property laws."
        },
        {
          subtitle: "Limited License",
          text: "We grant you a limited, non-exclusive, non-transferable license to access and use our services for personal, non-commercial purposes. This license does not include any resale or commercial use."
        },
        {
          subtitle: "User Content",
          text: "You retain ownership of any content you submit. However, by submitting content, you grant us a worldwide, royalty-free license to use, reproduce, and display such content in connection with our services."
        }
      ]
    },
    {
      icon: AlertTriangle,
      title: "Disclaimers & Limitations",
      content: [
        {
          subtitle: "Service 'As Is'",
          text: "MedPath is provided 'as is' and 'as available' without warranties of any kind, either express or implied, including but not limited to warranties of merchantability, fitness for a particular purpose, or non-infringement."
        },
        {
          subtitle: "Limitation of Liability",
          text: "To the maximum extent permitted by law, AAS EduGuide shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use or inability to use the service."
        },
        {
          subtitle: "Third-Party Content",
          text: "We may provide links to third-party websites or services. We are not responsible for the content, accuracy, or practices of such third parties. Your interactions with them are solely between you and them."
        }
      ]
    },
    {
      icon: RefreshCw,
      title: "Termination & Account Deletion",
      content: [
        {
          subtitle: "Termination by You",
          text: "You may terminate your account at any time by contacting us or using the account deletion feature. Upon termination, your right to use the service will immediately cease."
        },
        {
          subtitle: "Termination by Us",
          text: "We reserve the right to suspend or terminate your account and access to our services at our sole discretion, without notice, for conduct that we believe violates these Terms or is harmful to us or other users."
        },
        {
          subtitle: "Effect of Termination",
          text: "Upon termination, all provisions that by their nature should survive termination shall survive, including ownership provisions, warranty disclaimers, and limitations of liability."
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
              <FileText className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
            </div>
            
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-display font-bold mb-4 sm:mb-6">
              Terms of Service
            </h1>
            
            <p className="text-lg sm:text-xl md:text-2xl text-blue-100 max-w-3xl mx-auto mb-6 sm:mb-8 leading-relaxed px-4">
              Please read these terms carefully before using MedPath. They govern your use of our services.
            </p>
            
            <div className="flex flex-wrap justify-center gap-4 sm:gap-6 text-sm sm:text-base">
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-success-400" />
                <span>Effective Date: January 2025</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-success-400" />
                <span>Version 2.0</span>
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
                Welcome to MedPath by AAS EduGuide. These Terms of Service ("Terms") constitute a legally binding agreement between you and AAS EduGuide regarding your access to and use of our NEET college prediction platform and related services.
              </p>
              <p>
                Please read these Terms carefully. By accessing or using MedPath, you acknowledge that you have read, understood, and agree to be bound by these Terms. If you do not agree to these Terms, please do not use our services.
              </p>
            </div>
          </motion.div>

          {/* Terms Sections */}
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

          {/* Governing Law */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-white rounded-xl sm:rounded-2xl p-6 sm:p-8 shadow-lg border border-gray-100 mt-8 sm:mt-12"
          >
            <div className="flex items-start space-x-4 sm:space-x-6">
              <div className="flex-shrink-0">
                <Scale className="w-8 h-8 sm:w-10 sm:h-10 text-primary-600 mt-1" />
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-display font-bold text-gray-900 mb-4">
                  Governing Law & Jurisdiction
                </h2>
                <p className="text-sm sm:text-base text-gray-600 leading-relaxed mb-4">
                  These Terms shall be governed by and construed in accordance with the laws of India, without regard to its conflict of law provisions.
                </p>
                <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                  Any disputes arising out of or relating to these Terms or your use of MedPath shall be subject to the exclusive jurisdiction of the courts located in Kanpur, Uttar Pradesh, India.
                </p>
              </div>
            </div>
          </motion.div>

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
                  Questions About These Terms?
                </h3>
                <p className="text-sm sm:text-base text-gray-600 mb-4">
                  If you have any questions or concerns about these Terms of Service, please contact us at:
                </p>
                <a 
                  href="mailto:akhilesh@aaseduguide.com" 
                  className="inline-flex items-center space-x-2 text-primary-600 hover:text-primary-700 font-semibold text-sm sm:text-base"
                >
                  <Mail className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span>akhilesh@aaseduguide.com</span>
                </a>
              </div>
            </div>
          </motion.div>

          {/* Important Notice */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-yellow-50 border border-yellow-200 rounded-xl sm:rounded-2xl p-6 sm:p-8 mt-8 sm:mt-12"
          >
            <div className="flex items-start space-x-4">
              <AlertTriangle className="w-6 h-6 sm:w-7 sm:h-7 text-yellow-600 flex-shrink-0 mt-1" />
              <div>
                <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">
                  Important Notice
                </h3>
                <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                  These Terms may be updated from time to time to reflect changes in our practices or for legal, regulatory, or operational reasons. We will notify you of any material changes by posting the new Terms on this page with an updated "Effective Date." Your continued use of our services after any changes constitutes acceptance of the new Terms.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  )
}

export default TermsPage