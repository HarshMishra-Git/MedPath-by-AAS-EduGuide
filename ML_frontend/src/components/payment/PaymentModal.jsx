import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CreditCard, Lock, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useAuth } from '../../contexts/AuthContext';

const PaymentModal = ({ isOpen, onClose, onSuccess, canClose = false }) => {
  const { user, createPaymentOrder, verifyPaymentSignature } = useAuth();
  const [loading, setLoading] = useState(false);
  const [paymentConfig, setPaymentConfig] = useState(null);

  const PAYMENT_AMOUNT = 1199; // ₹1199

  useEffect(() => {
    if (isOpen) {
      loadPaymentConfig();
    }
  }, [isOpen]);

  const loadPaymentConfig = async () => {
    try {
      // This would be loaded from your backend
      setPaymentConfig({
        keyId: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: PAYMENT_AMOUNT,
        currency: 'INR',
        name: 'MedPath by AAS EduGuide',
        description: 'College Predictor Access - Lifetime Access',
        // image: '/logo.png' // Removed to prevent 404 errors
      });
    } catch (error) {
      console.error('Failed to load payment config:', error);
      toast.error('Failed to load payment configuration');
    }
  };

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handlePayment = async () => {
    setLoading(true);

    try {
      // Load Razorpay script
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        toast.error('Payment gateway failed to load. Please check your internet connection.');
        setLoading(false);
        return;
      }

      // Create order from backend
      const orderData = await createPaymentOrder(PAYMENT_AMOUNT * 100); // Convert to paise

      if (!orderData || !orderData.orderId) {
        throw new Error('Failed to create payment order');
      }

      // Razorpay options
      const options = {
        key: paymentConfig?.keyId || import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: orderData.amount,
        currency: orderData.currency || 'INR',
        name: 'MedPath by AAS EduGuide',
        description: 'College Predictor - Lifetime Access',
        // image: '/logo.png', // Removed to prevent 404 errors
        order_id: orderData.orderId,
        handler: async (response) => {
          try {
            // Verify payment signature with backend
            const verificationResult = await verifyPaymentSignature({
              paymentId: orderData.paymentId,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_signature: response.razorpay_signature,
            });

            if (verificationResult.success) {
              toast.success('🎉 Payment successful! Your account is now active.');
              setLoading(false);
              if (onSuccess) onSuccess();
              onClose();
            } else {
              throw new Error('Payment verification failed');
            }
          } catch (error) {
            console.error('Payment verification error:', error);
            toast.error('Payment verification failed. Please contact support.');
            setLoading(false);
          }
        },
        modal: {
          ondismiss: () => {
            setLoading(false);
            toast.error('Payment cancelled');
          },
        },
        prefill: {
          name: user?.fullName || '',
          email: user?.email || '',
          contact: user?.phone || '',
        },
        notes: {
          userId: user?.id || '',
          purpose: 'College Predictor Access',
        },
        theme: {
          color: '#667eea',
        },
      };

      const razorpay = new window.Razorpay(options);
      
      razorpay.on('payment.failed', (response) => {
        console.error('Payment failed:', response.error);
        toast.error(`Payment failed: ${response.error.description}`);
        setLoading(false);
      });

      razorpay.open();
    } catch (error) {
      console.error('Payment error:', error);
      toast.error(error.message || 'Failed to initiate payment');
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
        onClick={canClose ? onClose : undefined}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          transition={{ type: 'spring', damping: 25 }}
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white relative">
            {canClose && (
              <button
                onClick={onClose}
                className="absolute top-4 right-4 text-white/80 hover:text-white transition-colors"
              >
                <X size={24} />
              </button>
            )}
            <div className="flex items-center gap-3 mb-2">
              <div className="bg-white/20 p-3 rounded-xl">
                <CreditCard size={28} />
              </div>
              <div>
                <h2 className="text-2xl font-bold">Complete Payment</h2>
                <p className="text-white/90 text-sm">Unlock full access to predictions</p>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            {/* Payment Amount */}
            <div className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-700 dark:to-gray-600 rounded-xl p-6 mb-6">
              <div className="flex justify-between items-center mb-4">
                <span className="text-gray-600 dark:text-gray-300">One-time Payment</span>
                <span className="text-3xl font-bold text-gray-900 dark:text-white">
                  ₹{PAYMENT_AMOUNT}
                </span>
              </div>
              <div className="h-px bg-gray-300 dark:bg-gray-500 mb-4"></div>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2 text-gray-700 dark:text-gray-200">
                  <CheckCircle size={16} className="text-green-500" />
                  <span>Lifetime access to college predictions</span>
                </div>
                <div className="flex items-center gap-2 text-gray-700 dark:text-gray-200">
                  <CheckCircle size={16} className="text-green-500" />
                  <span>AI-powered NEET college recommendations</span>
                </div>
                <div className="flex items-center gap-2 text-gray-700 dark:text-gray-200">
                  <CheckCircle size={16} className="text-green-500" />
                  <span>Accurate predictions for UG & PG admissions</span>
                </div>
                <div className="flex items-center gap-2 text-gray-700 dark:text-gray-200">
                  <CheckCircle size={16} className="text-green-500" />
                  <span>90%+ prediction accuracy</span>
                </div>
              </div>
            </div>

            {/* Security Notice */}
            <div className="flex items-start gap-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-4 mb-6">
              <Lock className="text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" size={20} />
              <div className="text-sm text-blue-800 dark:text-blue-200">
                <p className="font-semibold mb-1">Secure Payment</p>
                <p className="text-blue-600 dark:text-blue-300">
                  Your payment is 100% secure and encrypted by Razorpay.
                </p>
              </div>
            </div>

            {/* Warning if user tries to close */}
            {!canClose && (
              <div className="flex items-start gap-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-lg p-4 mb-6">
                <AlertCircle className="text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" size={20} />
                <div className="text-sm text-amber-800 dark:text-amber-200">
                  <p className="font-semibold mb-1">Payment Required</p>
                  <p className="text-amber-600 dark:text-amber-300">
                    Complete payment to activate your account and access predictions.
                  </p>
                </div>
              </div>
            )}

            {/* Pay Button */}
            <button
              onClick={handlePayment}
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 focus:ring-4 focus:ring-blue-300 dark:focus:ring-blue-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-lg shadow-lg hover:shadow-xl transform hover:scale-[1.02]"
            >
              {loading ? (
                <>
                  <Loader2 className="w-6 h-6 animate-spin" />
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <CreditCard className="w-6 h-6" />
                  <span>Pay ₹{PAYMENT_AMOUNT}</span>
                </>
              )}
            </button>

            {/* Powered by Razorpay */}
            <div className="text-center mt-4">
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Powered by <span className="font-semibold text-blue-600 dark:text-blue-400">Razorpay</span>
              </p>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default PaymentModal;
