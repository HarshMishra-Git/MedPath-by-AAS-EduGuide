import React, { useState, useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import PaymentModal from './payment/PaymentModal';

const ProtectedRoute = ({ children, requirePayment = false, requireAdmin = false }) => {
  const { isAuthenticated, loading, user, checkAuth } = useAuth();
  const location = useLocation();
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  useEffect(() => {
    // Check if user needs to show payment modal
    if (isAuthenticated && user) {
      if (requirePayment && (user.accountStatus === 'PENDING_PAYMENT' || user.paymentStatus !== 'COMPLETED')) {
        setShowPaymentModal(true);
      }
    }
  }, [isAuthenticated, user, requirePayment]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    // Redirect to admin login if admin route, otherwise regular login
    const loginPath = requireAdmin ? '/admin' : '/login';
    return <Navigate to={loginPath} state={{ from: location }} replace />;
  }

  // Check admin requirement
  if (requireAdmin && user?.role !== 'ADMIN' && user?.role !== 'SUPER_ADMIN') {
    toast.error('Access denied. Admin privileges required.');
    return <Navigate to="/" replace />;
  }

  // Check payment requirement for prediction features
  // Block access completely if account is not ACTIVE
  if (requirePayment && user?.accountStatus !== 'ACTIVE') {
    return <Navigate to="/dashboard" state={{ requirePayment: true }} replace />;
  }

  return children;
};

export default ProtectedRoute;

// Higher-order component for payment protection
export const withPaymentProtection = (Component) => {
  return (props) => (
    <ProtectedRoute requirePayment={true}>
      <Component {...props} />
    </ProtectedRoute>
  );
};