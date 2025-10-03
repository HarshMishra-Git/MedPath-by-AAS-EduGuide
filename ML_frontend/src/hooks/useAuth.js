import { useState, useEffect } from 'react';
import { useAuth as useAuthContext } from '../contexts/AuthContext';
import { toast } from 'react-hot-toast';

export const useAuthModal = () => {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const { isAuthenticated, user } = useAuthContext();

  const openAuthModal = () => setIsAuthModalOpen(true);
  const closeAuthModal = () => setIsAuthModalOpen(false);
  const openPaymentModal = () => setIsPaymentModalOpen(true);
  const closePaymentModal = () => setIsPaymentModalOpen(false);

  const requireAuth = (callback) => {
    if (!isAuthenticated) {
      openAuthModal();
      return false;
    }
    callback?.();
    return true;
  };

  const requirePayment = (callback) => {
    if (!isAuthenticated) {
      openAuthModal();
      return false;
    }
    
    if (user?.paymentStatus !== 'COMPLETED') {
      openPaymentModal();
      return false;
    }
    
    callback?.();
    return true;
  };

  return {
    isAuthModalOpen,
    isPaymentModalOpen,
    openAuthModal,
    closeAuthModal,
    openPaymentModal,
    closePaymentModal,
    requireAuth,
    requirePayment
  };
};

export const usePaymentStatus = () => {
  const { user, checkPaymentStatus } = useAuthContext();
  const [paymentStatus, setPaymentStatus] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      checkStatus();
    }
  }, [user]);

  const checkStatus = async () => {
    setLoading(true);
    try {
      const status = await checkPaymentStatus();
      setPaymentStatus(status);
    } catch (error) {
      console.error('Payment status check failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const hasAccess = user?.paymentStatus === 'COMPLETED' || paymentStatus?.hasPaid;

  return {
    hasAccess,
    paymentStatus,
    loading,
    checkStatus
  };
};

export default useAuthContext;