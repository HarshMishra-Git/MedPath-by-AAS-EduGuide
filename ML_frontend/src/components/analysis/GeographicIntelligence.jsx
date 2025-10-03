import React from 'react'
import { motion } from 'framer-motion'
import { 
  MapPin, Thermometer, DollarSign, Wifi, 
  Navigation, Clock, Plane, Car, Train
} from 'lucide-react'
import { ultimateUtils } from '../../api/ultimateApi'

const GeographicIntelligence = ({ college, userLocation }) => {
  
  const getScoreColor = (score) => {
    if (score >= 8) return 'text-green-600 bg-green-100'
    if (score >= 6) return 'text-blue-600 bg-blue-100'
    if (score >= 4) return 'text-yellow-600 bg-yellow-100'
    return 'text-red-600 bg-red-100'
  }

  const getDistanceCategory = (distance) => {
    if (distance <= 100) return { category: 'Very Near', color: 'text-green-600', icon: '🏠' }
    if (distance <= 300) return { category: 'Near', color: 'text-blue-600', icon: '🚗' }
    if (distance <= 600) return { category: 'Moderate', color: 'text-yellow-600', icon: '✈️' }
    if (distance <= 1000) return { category: 'Far', color: 'text-orange-600', icon: '🚂' }
    return { category: 'Very Far', color: 'text-red-600', icon: '🌍' }
  }

  const getClimateDescription = (score) => {
    if (score >= 8) return 'Excellent climate conditions'
    if (score >= 6) return 'Pleasant weather year-round'
    if (score >= 4) return 'Moderate climate with seasonal variations'
    return 'Challenging weather conditions'
  }

  const getLivingCostDescription = (score) => {
    if (score >= 8) return 'Very affordable living costs'
    if (score >= 6) return 'Reasonable living expenses'
    if (score >= 4) return 'Moderate cost of living'
    return 'High living expenses'
  }

  const getConnectivityDescription = (score) => {
    if (score >= 8) return 'Excellent connectivity and infrastructure'
    if (score >= 6) return 'Good transportation and communication'
    if (score >= 4) return 'Adequate connectivity options'
    return 'Limited connectivity and transportation'
  }

  if (!college) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <p className="text-gray-600 text-center">Geographic analysis not available</p>
      </div>
    )
  }

  const geoData = ultimateUtils.formatGeographicScores(college)
  const distance = college.distance_from_home || 500
  const distanceInfo = getDistanceCategory(distance)

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <div className="flex items-center mb-4">
        <MapPin className="w-5 h-5 text-green-600 mr-2" />
        <h3 className="text-lg font-semibold text-gray-900">
          Geographic Intelligence
        </h3>
      </div>
      
      <p className="text-sm text-gray-600 mb-6">
        Location-based analysis for <strong>{college.institute}</strong> in <strong>{college.state}</strong>
      </p>

      {/* Distance Analysis */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6 p-4 bg-gray-50 rounded-lg"
      >
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <Navigation className="w-5 h-5 text-blue-600" />
            <h4 className="font-medium text-gray-900">Distance from Home</h4>
          </div>
          <span className="text-2xl">{distanceInfo.icon}</span>
        </div>
        
        <div className="flex items-center space-x-4 mb-2">
          <span className="text-2xl font-bold text-gray-900">
            {Math.round(distance)} km
          </span>
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${distanceInfo.color} bg-opacity-10`}>
            {distanceInfo.category}
          </span>
        </div>
        
        <div className="grid grid-cols-3 gap-4 mt-3 text-sm text-gray-600">
          <div className="flex items-center space-x-1">
            <Car className="w-4 h-4" />
            <span>~{Math.round(distance / 60)} hrs drive</span>
          </div>
          <div className="flex items-center space-x-1">
            <Train className="w-4 h-4" />
            <span>~{Math.round(distance / 80)} hrs train</span>
          </div>
          <div className="flex items-center space-x-1">
            <Plane className="w-4 h-4" />
            <span>~{Math.round(distance / 600)} hrs flight</span>
          </div>
        </div>
      </motion.div>

      {/* Geographic Scores Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        
        {/* Climate Score */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="p-4 bg-white border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
        >
          <div className="flex items-center justify-between mb-2">
            <Thermometer className="w-5 h-5 text-orange-500" />
            <span className={`px-2 py-1 rounded-full text-sm font-bold ${getScoreColor(college.climate_score)}`}>
              {college.climate_score}/10
            </span>
          </div>
          <h4 className="font-medium text-gray-900 mb-1">Climate</h4>
          <p className="text-sm text-gray-600">
            {getClimateDescription(college.climate_score)}
          </p>
        </motion.div>

        {/* Living Cost Score */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="p-4 bg-white border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
        >
          <div className="flex items-center justify-between mb-2">
            <DollarSign className="w-5 h-5 text-green-500" />
            <span className={`px-2 py-1 rounded-full text-sm font-bold ${getScoreColor(college.living_cost_index)}`}>
              {college.living_cost_index}/10
            </span>
          </div>
          <h4 className="font-medium text-gray-900 mb-1">Living Cost</h4>
          <p className="text-sm text-gray-600">
            {getLivingCostDescription(college.living_cost_index)}
          </p>
        </motion.div>

        {/* Connectivity Score */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="p-4 bg-white border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
        >
          <div className="flex items-center justify-between mb-2">
            <Wifi className="w-5 h-5 text-blue-500" />
            <span className={`px-2 py-1 rounded-full text-sm font-bold ${getScoreColor(college.connectivity_score)}`}>
              {college.connectivity_score}/10
            </span>
          </div>
          <h4 className="font-medium text-gray-900 mb-1">Connectivity</h4>
          <p className="text-sm text-gray-600">
            {getConnectivityDescription(college.connectivity_score)}
          </p>
        </motion.div>
      </div>

      {/* Overall Geographic Rating */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-gradient-to-r from-blue-50 to-green-50 border border-blue-200 rounded-lg p-4"
      >
        <h4 className="font-medium text-gray-900 mb-2 flex items-center">
          <MapPin className="w-4 h-4 mr-2 text-blue-600" />
          Geographic Compatibility Score
        </h4>
        
        {(() => {
          const avgScore = (college.climate_score + college.living_cost_index + college.connectivity_score) / 3
          const overallScore = Math.round(avgScore * 10) / 10
          
          return (
            <div className="flex items-center justify-between">
              <div>
                <span className="text-2xl font-bold text-gray-900">
                  {overallScore}/10
                </span>
                <p className="text-sm text-gray-600">
                  {overallScore >= 7 ? 'Excellent location match' :
                   overallScore >= 5 ? 'Good location compatibility' :
                   'Consider location factors carefully'}
                </p>
              </div>
              
              {/* Visual Score Bar */}
              <div className="w-32 bg-gray-200 rounded-full h-3">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${overallScore * 10}%` }}
                  transition={{ delay: 0.6, duration: 0.8 }}
                  className={`h-3 rounded-full ${
                    overallScore >= 7 ? 'bg-green-500' :
                    overallScore >= 5 ? 'bg-blue-500' :
                    'bg-yellow-500'
                  }`}
                />
              </div>
            </div>
          )
        })()}
      </motion.div>

      {/* Location Tips */}
      <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
        <div className="flex items-start space-x-2">
          <Clock className="w-4 h-4 text-yellow-600 mt-0.5" />
          <div>
            <h5 className="font-medium text-yellow-900 mb-1">Location Considerations</h5>
            <ul className="text-sm text-yellow-800 space-y-1">
              <li>• Visit the campus if possible before making final decisions</li>
              <li>• Consider seasonal weather patterns and your comfort preferences</li>
              <li>• Factor in travel costs for home visits during breaks</li>
              <li>• Check local healthcare facilities and emergency services</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

export default GeographicIntelligence