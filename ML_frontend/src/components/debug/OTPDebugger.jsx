import { useState } from 'react';
import { Bug, Send, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';

const OTPDebugger = ({ email, phone, identifierType }) => {
  const { sendOTP } = useAuth();
  const [logs, setLogs] = useState([]);
  const [testing, setTesting] = useState(false);

  const addLog = (type, message, data = null) => {
    const log = {
      type,
      message,
      data,
      timestamp: new Date().toLocaleTimeString()
    };
    setLogs(prev => [...prev, log]);
  };

  const testOTP = async () => {
    setTesting(true);
    setLogs([]);
    
    const identifier = identifierType === 'email' ? email : phone;
    
    addLog('info', `Testing OTP send to ${identifierType}: ${identifier}`);
    
    try {
      addLog('info', 'Calling backend API...');
      const result = await sendOTP(identifierType === 'email' ? 'email' : 'sms', identifier);
      
      addLog('success', 'OTP sent successfully!', result);
      
      if (result.otp) {
        addLog('success', `🔑 OTP: ${result.otp}`, null);
        toast.success(`Test OTP: ${result.otp}`, { duration: 10000 });
      } else {
        addLog('warning', 'OTP not returned in response (check your email/phone)');
      }
    } catch (error) {
      addLog('error', `Failed: ${error.message}`, error);
      toast.error(`OTP Test Failed: ${error.message}`);
    } finally {
      setTesting(false);
    }
  };

  if (!import.meta.env.DEV) return null;

  return (
    <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-300 dark:border-blue-700 rounded-xl">
      <div className="flex items-center gap-2 mb-3">
        <Bug className="w-5 h-5 text-blue-600 dark:text-blue-400" />
        <h3 className="font-bold text-blue-900 dark:text-blue-100">OTP Debugger (Dev Only)</h3>
      </div>
      
      <button
        onClick={testOTP}
        disabled={testing || !email}
        className="w-full mb-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white py-2 px-4 rounded-lg font-medium flex items-center justify-center gap-2 transition-colors"
      >
        {testing ? (
          <>
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            <span>Testing...</span>
          </>
        ) : (
          <>
            <Send className="w-4 h-4" />
            <span>Test OTP Send</span>
          </>
        )}
      </button>

      {logs.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg p-3 max-h-60 overflow-y-auto">
          <div className="text-xs font-mono space-y-2">
            {logs.map((log, i) => (
              <div key={i} className="flex items-start gap-2">
                <span className="text-gray-500">{log.timestamp}</span>
                {log.type === 'success' && <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />}
                {log.type === 'error' && <XCircle className="w-4 h-4 text-red-500 flex-shrink-0" />}
                {log.type === 'warning' && <AlertCircle className="w-4 h-4 text-yellow-500 flex-shrink-0" />}
                {log.type === 'info' && <div className="w-4 h-4 flex-shrink-0" />}
                <div className="flex-1">
                  <div className={`
                    ${log.type === 'success' ? 'text-green-700 dark:text-green-300' : ''}
                    ${log.type === 'error' ? 'text-red-700 dark:text-red-300' : ''}
                    ${log.type === 'warning' ? 'text-yellow-700 dark:text-yellow-300' : ''}
                    ${log.type === 'info' ? 'text-gray-700 dark:text-gray-300' : ''}
                  `}>
                    {log.message}
                  </div>
                  {log.data && (
                    <pre className="mt-1 p-2 bg-gray-100 dark:bg-gray-900 rounded text-xs overflow-x-auto">
                      {JSON.stringify(log.data, null, 2)}
                    </pre>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="mt-3 text-xs text-gray-600 dark:text-gray-400">
        <p className="font-semibold mb-1">Backend Endpoint:</p>
        <code className="bg-white dark:bg-gray-800 px-2 py-1 rounded">
          {import.meta.env.VITE_AUTH_API_URL}/auth/send-otp
        </code>
      </div>
    </div>
  );
};

export default OTPDebugger;
