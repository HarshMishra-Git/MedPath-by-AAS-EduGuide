import React, { useState, useEffect } from 'react';
import { Activity, CheckCircle, XCircle, AlertCircle, RefreshCw } from 'lucide-react';
import axios from 'axios';

const BackendHealthMonitor = () => {
  const [healthStatus, setHealthStatus] = useState({
    auth: { status: 'checking', message: 'Checking...', lastCheck: null },
    ml: { status: 'checking', message: 'Checking...', lastCheck: null },
  });
  const [isRefreshing, setIsRefreshing] = useState(false);

  const AUTH_API = import.meta.env.VITE_AUTH_API_URL?.replace('/api', '') || 'https://medpath-auth.onrender.com';
  const ML_API = import.meta.env.VITE_ML_API_URL || 'https://medpath-by-aas-eduguide.onrender.com';

  const checkHealth = async () => {
    setIsRefreshing(true);

    // Check Auth Backend
    try {
      const authResponse = await axios.get(`${AUTH_API}/health`, { timeout: 10000 });
      setHealthStatus(prev => ({
        ...prev,
        auth: {
          status: 'online',
          message: authResponse.data.message || 'Healthy',
          lastCheck: new Date().toLocaleTimeString(),
        }
      }));
    } catch (error) {
      setHealthStatus(prev => ({
        ...prev,
        auth: {
          status: 'offline',
          message: error.message || 'Service unavailable',
          lastCheck: new Date().toLocaleTimeString(),
        }
      }));
    }

    // Check ML Backend
    try {
      const mlResponse = await axios.get(`${ML_API}/healthy`, { timeout: 10000 });
      setHealthStatus(prev => ({
        ...prev,
        ml: {
          status: 'online',
          message: mlResponse.data.message || mlResponse.data.status || 'Healthy',
          lastCheck: new Date().toLocaleTimeString(),
        }
      }));
    } catch (error) {
      const errorMessage = error.response?.data?.detail || error.response?.data?.message || error.message || 'Service unavailable';
      const statusCode = error.response?.status ? ` (${error.response.status})` : '';
      setHealthStatus(prev => ({
        ...prev,
        ml: {
          status: 'offline',
          message: `${errorMessage}${statusCode}`,
          lastCheck: new Date().toLocaleTimeString(),
        }
      }));
    }

    setIsRefreshing(false);
  };

  useEffect(() => {
    checkHealth();
    // Check every 5 minutes
    const interval = setInterval(checkHealth, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const getStatusIcon = (status) => {
    switch (status) {
      case 'online':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'offline':
        return <XCircle className="w-5 h-5 text-red-500" />;
      case 'checking':
        return <AlertCircle className="w-5 h-5 text-yellow-500 animate-pulse" />;
      default:
        return <Activity className="w-5 h-5 text-gray-400" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'online':
        return 'bg-green-50 border-green-200';
      case 'offline':
        return 'bg-red-50 border-red-200';
      case 'checking':
        return 'bg-yellow-50 border-yellow-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Activity className="w-5 h-5 text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-900">Backend Health</h3>
        </div>
        <button
          onClick={checkHealth}
          disabled={isRefreshing}
          className="p-2 rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50"
          title="Refresh status"
        >
          <RefreshCw className={`w-5 h-5 text-gray-600 ${isRefreshing ? 'animate-spin' : ''}`} />
        </button>
      </div>

      <div className="space-y-3">
        {/* Auth Backend Status */}
        <div className={`p-4 rounded-lg border-2 ${getStatusColor(healthStatus.auth.status)}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {getStatusIcon(healthStatus.auth.status)}
              <div>
                <p className="font-medium text-gray-900">Auth Backend</p>
                <p className="text-sm text-gray-600">{healthStatus.auth.message}</p>
              </div>
            </div>
            {healthStatus.auth.lastCheck && (
              <span className="text-xs text-gray-500">{healthStatus.auth.lastCheck}</span>
            )}
          </div>
        </div>

        {/* ML Backend Status */}
        <div className={`p-4 rounded-lg border-2 ${getStatusColor(healthStatus.ml.status)}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {getStatusIcon(healthStatus.ml.status)}
              <div>
                <p className="font-medium text-gray-900">ML Backend</p>
                <p className="text-sm text-gray-600">{healthStatus.ml.message}</p>
              </div>
            </div>
            {healthStatus.ml.lastCheck && (
              <span className="text-xs text-gray-500">{healthStatus.ml.lastCheck}</span>
            )}
          </div>
        </div>
      </div>

      <p className="mt-4 text-xs text-gray-500 text-center">
        Auto-refreshes every 5 minutes
      </p>
    </div>
  );
};

export default BackendHealthMonitor;
