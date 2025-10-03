import React, { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { useLocation, useNavigate } from 'react-router-dom'
import { 
  BarChart3, TrendingUp, School, Download, Filter, 
  ArrowLeft, PieChart, Target, Award, MapPin,
  DollarSign, Calendar, Users, Info, RefreshCw
} from 'lucide-react'
import { neetCollegeFinderApi } from '../api/neetCollegeFinderApi'

const ResultsPage = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const [filterLevel, setFilterLevel] = useState('all')
  const [sortBy, setSortBy] = useState('score')
  const [showDetails, setShowDetails] = useState(false)

  // Get data from navigation state
  const { results, searchCriteria } = location.state || {}

  // If no data, redirect to prediction
  if (!results || !searchCriteria) {
    return (
      <div className="min-h-screen py-20 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">No Results Found</h2>
          <p className="text-gray-600 mb-6">Please go back and run a new search.</p>
          <button 
            onClick={() => navigate('/predict')} 
            className="btn-gradient"
          >
            Start New Search
          </button>
        </div>
      </div>
    )
  }

  // Filter and sort results
  const filteredResults = useMemo(() => {
    let filtered = results.recommendations || []
    
    if (filterLevel !== 'all') {
      filtered = filtered.filter(college => {
        const level = college.safety_level.toLowerCase().replace(' ', '_')
        return level === filterLevel
      })
    }
    
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'score':
          return b.recommendation_score - a.recommendation_score
        case 'fee':
          const feeA = parseInt(a.fee?.replace(/[^0-9]/g, '') || '0')
          const feeB = parseInt(b.fee?.replace(/[^0-9]/g, '') || '0')
          return feeA - feeB
        case 'name':
          return a.institute.localeCompare(b.institute)
        default:
          return 0
      }
    })
    
    return filtered
  }, [results.recommendations, filterLevel, sortBy])

  // Calculate analytics
  const analytics = useMemo(() => {
    const colleges = results.recommendations || []
    const totalColleges = colleges.length
    
    const safetyLevels = colleges.reduce((acc, college) => {
      const level = college.safety_level
      acc[level] = (acc[level] || 0) + 1
      return acc
    }, {})
    
    const avgScore = colleges.reduce((sum, college) => 
      sum + college.recommendation_score, 0) / totalColleges
    
    const feeAnalysis = colleges.map(c => {
      const fee = parseInt(c.fee?.replace(/[^0-9]/g, '') || '0')
      return fee
    }).filter(fee => fee > 0)
    
    const avgFee = feeAnalysis.length > 0 ? 
      feeAnalysis.reduce((sum, fee) => sum + fee, 0) / feeAnalysis.length : 0
    
    return {
      totalColleges,
      safetyLevels,
      avgScore,
      avgFee,
      stateDistribution: colleges.reduce((acc, college) => {
        acc[college.state] = (acc[college.state] || 0) + 1
        return acc
      }, {})
    }
  }, [results.recommendations])

  const handleExportPDF = async () => {
    try {
      const response = await neetCollegeFinderApi.exportPDF(searchCriteria)
      // Handle PDF download
      const url = window.URL.createObjectURL(new Blob([response]))
      const link = document.createElement('a')
      link.href = url
      link.download = `NEET_Colleges_${searchCriteria.exam_type}_${Date.now()}.pdf`
      link.click()
    } catch (error) {
      console.error('PDF export failed:', error)
    }
  }

  return (
    <div className="min-h-screen py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-6">
            <button 
              onClick={() => navigate(-1)} 
              className="flex items-center text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Search
            </button>
            
            <div className="flex space-x-3">
              <button 
                onClick={handleExportPDF}
                className="btn-secondary flex items-center"
              >
                <Download className="w-4 h-4 mr-2" />
                Export PDF
              </button>
              <button 
                onClick={() => setShowDetails(!showDetails)}
                className="btn-gradient flex items-center"
              >
                <Info className="w-4 h-4 mr-2" />
                {showDetails ? 'Hide' : 'Show'} Details
              </button>
            </div>
          </div>
          
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              College Recommendations for Rank {searchCriteria.rank_min}
            </h1>
            <p className="text-xl text-gray-600">
              {results.total_results} colleges where admission is possible
            </p>
          </div>
        </motion.div>

        {/* Analytics Dashboard */}
        {showDetails && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
          >
            <div className="bg-white p-6 rounded-lg border">
              <Target className="w-8 h-8 text-green-500 mb-3" />
              <h3 className="text-lg font-semibold mb-2">Average Success Rate</h3>
              <p className="text-3xl font-bold text-green-600">
                {(analytics.avgScore * 100).toFixed(0)}%
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-lg border">
              <DollarSign className="w-8 h-8 text-blue-500 mb-3" />
              <h3 className="text-lg font-semibold mb-2">Average Fee</h3>
              <p className="text-3xl font-bold text-blue-600">
                ₹{(analytics.avgFee / 1000).toFixed(0)}K
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-lg border">
              <MapPin className="w-8 h-8 text-purple-500 mb-3" />
              <h3 className="text-lg font-semibold mb-2">States Covered</h3>
              <p className="text-3xl font-bold text-purple-600">
                {Object.keys(analytics.stateDistribution).length}
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-lg border">
              <Award className="w-8 h-8 text-yellow-500 mb-3" />
              <h3 className="text-lg font-semibold mb-2">Safe Options</h3>
              <p className="text-3xl font-bold text-yellow-600">
                {(analytics.safetyLevels['Very Safe'] || 0) + (analytics.safetyLevels['Safe'] || 0)}
              </p>
            </div>
          </motion.div>
        )}


        {/* Filters and Controls */}
        <div className="flex flex-wrap items-center justify-between mb-6 p-4 bg-white rounded-lg border">
          <div className="flex items-center space-x-4">
            <Filter className="w-5 h-5 text-gray-500" />
            <select 
              value={filterLevel} 
              onChange={(e) => setFilterLevel(e.target.value)}
              className="border rounded-lg px-3 py-2"
            >
              <option value="all">All Safety Levels</option>
              <option value="very_safe">Very Safe</option>
              <option value="safe">Safe</option>
              <option value="moderate">Moderate</option>
              <option value="good_chance">Good Chance</option>
              <option value="possible">Possible</option>
            </select>
            
            <select 
              value={sortBy} 
              onChange={(e) => setSortBy(e.target.value)}
              className="border rounded-lg px-3 py-2"
            >
              <option value="score">Sort by Score</option>
              <option value="fee">Sort by Fee</option>
              <option value="name">Sort by Name</option>
            </select>
          </div>
          
          <div className="text-sm text-gray-600">
            Showing {filteredResults.length} of {results.total_results} colleges
          </div>
        </div>

        {/* Results List */}
        <div className="space-y-4">
          {filteredResults.map((college, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-900 mb-1">{college.institute}</h3>
                  <p className="text-primary-600 font-medium mb-1">{college.course}</p>
                  <p className="text-gray-600 text-sm flex items-center">
                    <MapPin className="w-4 h-4 mr-1" />
                    {college.state} • {college.quota} • {college.category}
                  </p>
                </div>
                
                <div className={`px-4 py-2 rounded-full text-sm font-medium border ${
                  neetCollegeFinderApi.getSafetyColor(college.safety_level)
                }`}>
                  {neetCollegeFinderApi.getSafetyIcon(college.safety_level)} {college.safety_level}
                </div>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm mb-4">
                <div>
                  <span className="text-gray-500 block">Annual Fee</span>
                  <div className="font-medium">
                    {college.formatted_fee || neetCollegeFinderApi.formatFee(college.fee)}
                  </div>
                </div>
                <div>
                  <span className="text-gray-500 block">Monthly Stipend</span>
                  <div className="font-medium">
                    {college.formatted_stipend || neetCollegeFinderApi.formatStipend(college.stipend)}
                  </div>
                </div>
                <div>
                  <span className="text-gray-500 block">Bond Period</span>
                  <div className="font-medium">
                    {college.formatted_bond_info || `${college.bond_years || 0} years`}
                  </div>
                </div>
                <div>
                  <span className="text-gray-500 block">Available Beds</span>
                  <div className="font-medium">{college.beds || 'N/A'}</div>
                </div>
                <div>
                  <span className="text-gray-500 block">Bond Penalty</span>
                  <div className="font-bold text-lg">{college.bond_penalty || 'No Penalty'}</div>
                </div>
              </div>
              
              {college.details?.recommendation && (
                <div className="mt-4 p-4 bg-blue-50 border-l-4 border-blue-400 rounded">
                  <p className="text-sm text-blue-800">
                    <strong>Expert Advice:</strong> {college.details.recommendation}
                  </p>
                </div>
              )}
            </motion.div>
          ))}
        </div>
        
        {filteredResults.length === 0 && (
          <div className="text-center py-12">
            <School className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No colleges found</h3>
            <p className="text-gray-600">Try adjusting your filters to see more results.</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default ResultsPage
