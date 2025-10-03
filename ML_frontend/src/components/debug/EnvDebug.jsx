import React, { useState } from 'react'
import { env } from '../../config/env.js'
import { Settings, Eye, EyeOff } from 'lucide-react'

const EnvDebug = () => {
  const [isVisible, setIsVisible] = useState(false)

  // Only show in development mode if explicitly enabled
  // Set VITE_ENABLE_DEBUG=false in .env to hide completely
  if (!env.IS_DEVELOPMENT || !env.FEATURES.ENABLE_DEBUG) {
    return null
  }

  // Extra safety: never show in production
  if (env.IS_PRODUCTION) {
    return null
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <button
        onClick={() => setIsVisible(!isVisible)}
        className="bg-gray-800 text-white p-3 rounded-full shadow-lg hover:bg-gray-700 transition-colors"
        title="Toggle Environment Debug Info"
      >
        <Settings className="w-5 h-5" />
      </button>

      {isVisible && (
        <div className="absolute bottom-14 right-0 bg-gray-900 text-white p-4 rounded-lg shadow-xl min-w-96 max-h-96 overflow-y-auto">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-semibold text-green-400">Environment Debug</h3>
            <button
              onClick={() => setIsVisible(false)}
              className="text-gray-400 hover:text-white"
            >
              <EyeOff className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-3 text-sm">
            {/* App Info */}
            <div>
              <h4 className="text-blue-400 font-medium mb-1">Application</h4>
              <div className="text-gray-300 space-y-1">
                <div>Name: {env.APP_NAME}</div>
                <div>Version: {env.APP_VERSION}</div>
                <div>Environment: {env.NODE_ENV}</div>
              </div>
            </div>

            {/* API Configuration */}
            <div>
              <h4 className="text-blue-400 font-medium mb-1">API Configuration</h4>
              <div className="text-gray-300 space-y-1">
                <div>NEET API: <span className="text-green-300">{env.NEET_API_URL}</span></div>
                <div>ML API: {env.ML_API_URL}</div>
                <div>Timeout: {env.API_TIMEOUT}ms</div>
              </div>
            </div>

            {/* Backend Details */}
            <div>
              <h4 className="text-blue-400 font-medium mb-1">Backend</h4>
              <div className="text-gray-300 space-y-1">
                <div>Protocol: {env.NEET_BACKEND.PROTOCOL}</div>
                <div>Host: {env.NEET_BACKEND.HOST}</div>
                <div>Port: {env.NEET_BACKEND.PORT}</div>
              </div>
            </div>

            {/* Endpoints */}
            <div>
              <h4 className="text-blue-400 font-medium mb-1">Endpoints</h4>
              <div className="text-gray-300 space-y-1">
                {Object.entries(env.ENDPOINTS).map(([key, value]) => (
                  <div key={key}>
                    {key}: <span className="text-yellow-300">{value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Features */}
            <div>
              <h4 className="text-blue-400 font-medium mb-1">Features</h4>
              <div className="text-gray-300 space-y-1">
                {Object.entries(env.FEATURES).map(([key, value]) => (
                  <div key={key}>
                    {key}: <span className={value ? 'text-green-300' : 'text-red-300'}>
                      {value ? '✅' : '❌'}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Test Connection Button */}
            <div className="mt-4 pt-3 border-t border-gray-700">
              <button
                onClick={async () => {
                  try {
                    const response = await fetch(`${env.NEET_API_URL}${env.ENDPOINTS.HEALTH}`)
                    const data = await response.json()
                    alert(`✅ API Connection: ${data.status}\nData Status: ${Object.keys(data.data_status).length} datasets loaded`)
                  } catch (error) {
                    alert(`❌ API Connection Failed: ${error.message}`)
                  }
                }}
                className="w-full bg-green-600 text-white px-3 py-2 rounded hover:bg-green-700 transition-colors"
              >
                Test API Connection
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default EnvDebug