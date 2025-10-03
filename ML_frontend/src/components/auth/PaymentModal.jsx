import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CreditCard, Shield, CheckCircle } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useAuth } from '../../contexts/AuthContext';

const PaymentModal = ({ isOpen, onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [paymentConfig, setPaymentConfig] = useState(null);
  const { user, makePayment, getPaymentConfig } = useAuth();

  useEffect(() => {
    if (isOpen) {
      loadPaymentConfig();
    }
  }, [isOpen]);

  const loadPaymentConfig = async () => {
    try {
      const config = await getPaymentConfig();
      setPaymentConfig(config);
    } catch (error) {
      toast.error('Failed to load payment configuration');
    }
  };

  const handlePayment = async () => {
    if (!paymentConfig) return;

    setLoading(true);
    try {
      const options = {
        key: paymentConfig.keyId,
        amount: paymentConfig.defaultAmount * 100, // Convert to paise
        currency: paymentConfig.currency,
        name: paymentConfig.companyName,
        description: paymentConfig.description,
        image: paymentConfig.image,
        handler: async function (response) {
          try {
            const result = await makePayment({
              paymentId: response.razorpay_payment_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_signature: response.razorpay_signature
            });

            if (result.success) {
              toast.success('Payment successful!');
              onSuccess();
              onClose();
            }
          } catch (error) {
            toast.error('Payment verification failed');
          }
        },
        prefill: {
          name: user?.fullName || '',
          email: user?.email || '',
          contact: user?.phone || ''
        },
        theme: paymentConfig.theme,
        modal: {
          ondismiss: function() {
            setLoading(false);
          }
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (error) {
      toast.error('Payment initialization failed');
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
        className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8 relative"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={20} />
          </button>

          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <CreditCard className="text-white" size={24} />
            </div>
            <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
              Unlock Full Access
            </h2>
            <p className="text-gray-600">
              Get unlimited predictions and advanced features
            </p>
          </div>

          <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 mb-6">
            <div className="text-center">
              <div className="text-4xl font-bold text-gray-800 mb-2">
                ₹{paymentConfig?.defaultAmount || 1199}
              </div>
              <div className="text-gray-600 mb-4">One-time payment</div>
              
              <div className="space-y-3 text-left">
                <div className="flex items-center">
                  <CheckCircle className="text-green-500 mr-3" size={16} />
                  <span className="text-sm text-gray-700">Unlimited college predictions</span>
                </div>
                <div className="flex items-center">
                  <CheckCircle className="text-green-500 mr-3" size={16} />
                  <span className="text-sm text-gray-700">Advanced analytics & insights</span>
                </div>
                <div className="flex items-center">
                  <CheckCircle className="text-green-500 mr-3" size={16} />
                  <span className="text-sm text-gray-700">Priority customer support</span>
                </div>
                <div className="flex items-center">
                  <CheckCircle className="text-green-500 mr-3" size={16} />
                  <span className="text-sm text-gray-700">Lifetime access to updates</span>
                </div>
              </div>
            </div>
          </div>

          <button
            onClick={handlePayment}
            disabled={loading || !paymentConfig}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-200 disabled:opacity-50 transform hover:scale-[1.02] flex items-center justify-center"
          >
            {loading ? (
              'Processing...'
            ) : (
              <>
                <Shield className="mr-2" size={20} />
                Pay Securely with Razorpay
              </>
            )}
          </button>

          <div className="mt-4 text-center">
            <p className="text-xs text-gray-500">
              Secured by Razorpay • 256-bit SSL encryption
            </p>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default PaymentModal;