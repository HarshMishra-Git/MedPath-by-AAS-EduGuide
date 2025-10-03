import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, CreditCard, X, Sparkles } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import PaymentModal from './PaymentModal';

const PaymentNotificationBanner = () => {
  const { user, isAuthenticated } = useAuth();
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  // Don't show banner if:
  // - User is not authenticated
  // - User has active account
  // - Banner is dismissed
  if (
    !isAuthenticated || 
    user?.accountStatus === 'ACTIVE' || 
    user?.paymentStatus === 'COMPLETED' ||
    isDismissed
  ) {
    return null;
  }

  return (
    <>
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
          className="fixed top-20 left-0 right-0 z-40 mx-4 mt-4"
        >
          <div className="max-w-7xl mx-auto">
            <div className="relative bg-gradient-to-r from-amber-50 via-yellow-50 to-amber-50 dark:from-amber-900/20 dark:via-yellow-900/20 dark:to-amber-900/20 border-2 border-amber-200 dark:border-amber-700 rounded-xl shadow-lg overflow-hidden">
              {/* Animated background pattern */}
              <div className="absolute inset-0 opacity-10">
                <motion.div
                  animate={{
                    backgroundPosition: ['0% 0%', '100% 100%'],
                  }}
                  transition={{
                    duration: 20,
                    repeat: Infinity,
                    repeatType: 'reverse',
                  }}
                  className="w-full h-full"
                  style={{
                    backgroundImage: 'repeating-linear-gradient(45deg, #f59e0b 0px, #f59e0b 10px, transparent 10px, transparent 20px)',
                  }}
                />
              </div>

              <div className="relative flex items-center justify-between p-4 sm:p-5">
                <div className="flex items-center space-x-3 sm:space-x-4 flex-1">
                  {/* Icon */}
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl flex items-center justify-center shadow-lg">
                      <motion.div
                        animate={{
                          scale: [1, 1.2, 1],
                          rotate: [0, 5, -5, 0],
                        }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          ease: 'easeInOut',
                        }}
                      >
                        <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                      </motion.div>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm sm:text-base font-bold text-amber-900 dark:text-amber-100 mb-1">
                      🎯 Complete Payment to Unlock Full Access
                    </h3>
                    <p className="text-xs sm:text-sm text-amber-700 dark:text-amber-200">
                      Get lifetime access to AI-powered NEET college predictions for just ₹1199. 
                      <span className="hidden sm:inline"> Start predicting your medical college admission chances now!</span>
                    </p>
                  </div>

                  {/* CTA Button */}
                  <div className="flex-shrink-0 hidden sm:block">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setShowPaymentModal(true)}
                      className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-semibold px-5 py-2.5 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 flex items-center space-x-2"
                    >
                      <CreditCard className="w-4 h-4" />
                      <span>Complete Payment</span>
                    </motion.button>
                  </div>
                </div>

                {/* Close button */}
                <button
                  onClick={() => setIsDismissed(true)}
                  className="flex-shrink-0 ml-2 sm:ml-4 p-1.5 rounded-lg hover:bg-amber-200/50 dark:hover:bg-amber-800/50 transition-colors text-amber-700 dark:text-amber-300"
                  aria-label="Dismiss notification"
                >
                  <X className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
              </div>

              {/* Mobile CTA Button */}
              <div className="sm:hidden px-4 pb-4">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setShowPaymentModal(true)}
                  className="w-full bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-semibold px-4 py-2.5 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center space-x-2"
                >
                  <CreditCard className="w-4 h-4" />
                  <span>Complete Payment (₹1199)</span>
                </motion.button>
              </div>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Payment Modal */}
      <PaymentModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        onSuccess={() => {
          setShowPaymentModal(false);
          setIsDismissed(true);
        }}
        canClose={true}
      />
    </>
  );
};

export default PaymentNotificationBanner;
