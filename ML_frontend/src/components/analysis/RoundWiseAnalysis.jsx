import React from 'react'
import { motion } from 'framer-motion'
import { 
  Calendar, Target, TrendingUp, Clock, 
  CheckCircle, AlertCircle, Info
} from 'lucide-react'
import { ultimateUtils } from '../../api/ultimateApi'

const RoundWiseAnalysis = ({ roundWiseChances, bestRound, collegeName }) => {
  
  const formatRoundName = (round) => {
    return round.replace(/([A-Z])/g, ' $1')
               .replace(/^./, str => str.toUpperCase())
               .replace('_', ' ')
               .replace('Round ', 'Round ')
  }

  const getRoundIcon = (round, probability) => {
    if (round === bestRound) return <Target className="w-4 h-4" />
    if (probability >= 70) return <CheckCircle className="w-4 h-4" />
    if (probability >= 40) return <AlertCircle className="w-4 h-4" />
    return <Clock className="w-4 h-4" />
  }

  const getRoundColor = (probability) => {
    if (probability >= 80) return 'border-green-500 bg-green-50 text-green-700'
    if (probability >= 60) return 'border-blue-500 bg-blue-50 text-blue-700'
    if (probability >= 40) return 'border-yellow-500 bg-yellow-50 text-yellow-700'
    if (probability >= 20) return 'border-orange-500 bg-orange-50 text-orange-700'
    return 'border-red-500 bg-red-50 text-red-700'
  }

  const getProgressBarColor = (probability) => {
    if (probability >= 80) return 'bg-green-500'
    if (probability >= 60) return 'bg-blue-500'
    if (probability >= 40) return 'bg-yellow-500'
    if (probability >= 20) return 'bg-orange-500'
    return 'bg-red-500'
  }

  const getRoundAdvice = (round, probability) => {
    const roundName = formatRoundName(round)
    
    if (probability >= 80) {
      return `${roundName}: Excellent chances! This should be a priority application.`
    } else if (probability >= 60) {
      return `${roundName}: Good probability. Include this in your strategy.`
    } else if (probability >= 40) {
      return `${roundName}: Moderate chances. Consider as backup option.`
    } else if (probability >= 20) {
      return `${roundName}: Lower probability but worth trying if seats remain.`
    } else {
      return `${roundName}: Very low chances. Consider only if no other options.`
    }
  }

  const rounds = Object.entries(roundWiseChances || {}).map(([round, probability]) => ({
    round,
    probability: Math.round(probability),
    name: formatRoundName(round),
    isBest: round === bestRound
  }))

  if (!roundWiseChances || Object.keys(roundWiseChances).length === 0) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <p className="text-gray-600 text-center">Round-wise analysis not available</p>
      </div>
    )
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <div className="flex items-center mb-4">
        <Calendar className="w-5 h-5 text-blue-600 mr-2" />
        <h3 className="text-lg font-semibold text-gray-900">
          Round-wise Admission Analysis
        </h3>
      </div>
      
      {collegeName && (
        <p className="text-sm text-gray-600 mb-4">
          Probability analysis for <strong>{collegeName}</strong>
        </p>
      )}

      <div className="space-y-4 mb-6">
        {rounds.map((roundData, index) => (
          <motion.div
            key={roundData.round}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`border-2 rounded-lg p-4 transition-all hover:shadow-md ${
              roundData.isBest 
                ? 'border-primary-500 bg-primary-50 ring-2 ring-primary-200' 
                : getRoundColor(roundData.probability)
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                {getRoundIcon(roundData.round, roundData.probability)}
                <span className="font-medium">
                  {roundData.name}
                  {roundData.isBest && (
                    <span className="ml-2 px-2 py-1 bg-primary-600 text-white text-xs rounded-full">
                      Best Option
                    </span>
                  )}
                </span>
              </div>
              <div className="text-right">
                <span className="text-xl font-bold">
                  {roundData.probability}%
                </span>
                <p className="text-xs text-gray-500">chance</p>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="mb-3">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${roundData.probability}%` }}
                  transition={{ delay: index * 0.1 + 0.2, duration: 0.8 }}
                  className={`h-2 rounded-full ${getProgressBarColor(roundData.probability)}`}
                />
              </div>
            </div>

            <p className="text-sm text-gray-700">
              {getRoundAdvice(roundData.round, roundData.probability)}
            </p>
          </motion.div>
        ))}
      </div>

      {/* Strategy Summary */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start space-x-2">
          <Info className="w-5 h-5 text-blue-600 mt-0.5" />
          <div>
            <h4 className="font-medium text-blue-900 mb-2">Strategic Recommendation</h4>
            <p className="text-sm text-blue-800">
              Your best chance is in <strong>{formatRoundName(bestRound)}</strong> with{' '}
              <strong>{Math.round(roundWiseChances[bestRound])}% probability</strong>. 
              {roundWiseChances[bestRound] >= 70 
                ? ' This is an excellent opportunity - make sure to apply early!'
                : roundWiseChances[bestRound] >= 50
                ? ' This is a good option - include it in your primary choices.'
                : ' Consider this as part of a broader application strategy.'
              }
            </p>
          </div>
        </div>
      </div>

      {/* Timeline Hint */}
      <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
        <div className="flex items-center space-x-2">
          <Clock className="w-4 h-4 text-yellow-600" />
          <p className="text-sm text-yellow-800">
            <strong>Timeline:</strong> Round 1 (July-Aug), Round 2 (Aug-Sep), 
            Round 3 (Sep), Mop-up (Oct). Plan your applications accordingly.
          </p>
        </div>
      </div>
    </div>
  )
}

export default RoundWiseAnalysis