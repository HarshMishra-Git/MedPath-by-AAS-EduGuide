import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-hot-toast'
import { 
  Target, 
  Search, 
  ChevronRight, 
  ChevronLeft,
  Loader2,
  AlertCircle,
  CheckCircle2,
  MapPin,
  GraduationCap,
  Users,
  TrendingUp,
  Stethoscope,
  School
} from 'lucide-react'
import { neetCollegeFinderApi } from '../api/neetCollegeFinderApi'

// Helper function to calculate safety level counts
const calculateSafetyCount = (recommendations, safetyLevels) => {
  if (!recommendations || !Array.isArray(recommendations)) return 0
  
  // Debug: Log actual safety levels
  if (recommendations.length > 0) {
    console.log('🔍 Debug: Actual safety levels found:', 
      [...new Set(recommendations.map(c => c.safety_level))]
    )
    console.log('🔍 Debug: Looking for safety levels:', safetyLevels)
  }
  
  return recommendations.filter(college => 
    safetyLevels.includes(college.safety_level)
  ).length
}

  const STEPS = {
    EXAM_TYPE: 0,
    PREFERENCE: 1,
    LOCATION: 2,
    QUOTA: 3,
    CATEGORY: 4,
    COURSE: 5,
    RANK: 6,
    RESULTS: 7
  }
  
  const STEP_NAMES = [
    'Exam Type',
    'Preference', 
    'Location',
    'Quota',
    'Category',
    'Course',
    'Your AIR Rank',
    'Results'
  ]

const PredictionPage = () => {
  const navigate = useNavigate()
  const [currentStep, setCurrentStep] = useState(STEPS.EXAM_TYPE)
  const [loading, setLoading] = useState(false)
  const [searching, setSearching] = useState(false)
  const [formData, setFormData] = useState({
    examType: '',
    preference: '',
    state: '',
    quota: '',
    category: '',
    course: '',
    rank: ''
  })
  
  // Options state
  const [options, setOptions] = useState({
    states: [],
    quotas: [],
    categories: [],
    courses: []
  })
  
  const [searchResults, setSearchResults] = useState(null)
  const [validationError, setValidationError] = useState('')

  // Load data based on current selections
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true)
        setValidationError('')

        if (currentStep === STEPS.LOCATION && formData.examType) {
          const states = await neetCollegeFinderApi.getStates(formData.examType)
          setOptions(prev => ({ ...prev, states }))
        }
        
        if (currentStep === STEPS.QUOTA && formData.examType && formData.preference) {
          const quotas = await neetCollegeFinderApi.getQuotas(
            formData.examType, 
            formData.preference, 
            formData.preference === 'State Wise' ? formData.state : null
          )
          setOptions(prev => ({ ...prev, quotas }))
        }
        
        if (currentStep === STEPS.CATEGORY && formData.examType && formData.preference) {
          const categories = await neetCollegeFinderApi.getCategories(
            formData.examType,
            formData.preference,
            formData.preference === 'State Wise' ? formData.state : null,
            formData.quota
          )
          setOptions(prev => ({ ...prev, categories }))
        }
        
        if (currentStep === STEPS.COURSE && formData.examType && formData.preference) {
          const courses = await neetCollegeFinderApi.getCourses(
            formData.examType,
            formData.preference,
            formData.preference === 'State Wise' ? formData.state : null,
            formData.quota,
            formData.category
          )
          setOptions(prev => ({ ...prev, courses }))
        }
      } catch (error) {
        console.error('Error loading data:', error)
        setValidationError(error.message)
        toast.error(error.message)
      } finally {
        setLoading(false)
      }
    }

    if (currentStep > STEPS.PREFERENCE) {
      loadData()
    }
  }, [currentStep, formData.examType, formData.preference, formData.state, formData.quota, formData.category])

  const handleNext = () => {
    if (validateCurrentStep()) {
      if (currentStep === STEPS.RANK) {
        handleSearch()
      } else if (currentStep === STEPS.PREFERENCE && formData.preference === 'All India') {
        // Skip Location step for All India preference
        setCurrentStep(STEPS.QUOTA)
      } else {
        setCurrentStep(currentStep + 1)
      }
    }
  }

  const handlePrevious = () => {
    if (currentStep > STEPS.EXAM_TYPE) {
      // Handle skipping Location step when going back from Quota to Preference for All India
      if (currentStep === STEPS.QUOTA && formData.preference === 'All India') {
        setCurrentStep(STEPS.PREFERENCE)
      } else {
        setCurrentStep(currentStep - 1)
      }
      setValidationError('')
    }
  }

  const validateCurrentStep = () => {
    setValidationError('')
    
    switch (currentStep) {
      case STEPS.EXAM_TYPE:
        if (!formData.examType) {
          setValidationError('Please select an exam type')
          return false
        }
        break
        
      case STEPS.PREFERENCE:
        if (!formData.preference) {
          setValidationError('Please select a preference')
          return false
        }
        break
        
      case STEPS.LOCATION:
        // This step only applies to State Wise preference
        if (formData.preference === 'State Wise' && !formData.state) {
          setValidationError('Please select a state')
          return false
        }
        break
        
      case STEPS.QUOTA:
        if (!formData.quota) {
          setValidationError('Please select a quota')
          return false
        }
        break
        
      case STEPS.CATEGORY:
        if (!formData.category) {
          setValidationError('Please select a category')
          return false
        }
        break
        
      case STEPS.COURSE:
        if (!formData.course) {
          setValidationError('Please select a course')
          return false
        }
        break
        
      case STEPS.RANK:
        if (!formData.rank) {
          setValidationError('Please enter your AIR rank')
          return false
        }
        
        const rank = parseInt(formData.rank)
        const maxAllowedRank = formData.examType === 'NEET-UG' ? 1250000 : 200000
        if (rank < 1 || rank > maxAllowedRank) {
          setValidationError(`Rank should be between 1 and ${maxAllowedRank.toLocaleString()}`)
          return false
        }
        break
    }
    
    return true
  }

  const handleSearch = async () => {
    try {
      setSearching(true)
      
      const searchRequest = {
        exam_type: formData.examType,
        preference: formData.preference,
        state: formData.preference === 'State Wise' ? formData.state : null,
        quota: formData.quota,
        category: formData.category,
        course: formData.course,
        rank_min: parseInt(formData.rank),
        rank_max: parseInt(formData.rank)
      }
      
      const results = await neetCollegeFinderApi.searchColleges(searchRequest)
      setSearchResults(results)
      setCurrentStep(STEPS.RESULTS)
      
      toast.success(`Found ${results.total_results} college recommendations!`)
    } catch (error) {
      console.error('Search error:', error)
      setValidationError(error.message)
      toast.error(error.message)
    } finally {
      setSearching(false)
    }
  }

  const handleFormDataChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    setValidationError('')
    
    // Reset dependent fields when parent field changes
    if (field === 'examType') {
      setFormData(prev => ({ 
        ...prev, 
        preference: '', 
        state: '', 
        quota: '', 
        category: '', 
        course: '',
        rankMin: '',
        rankMax: ''
      }))
    } else if (field === 'preference') {
      setFormData(prev => ({ 
        ...prev, 
        state: '', 
        quota: '', 
        category: '', 
        course: ''
      }))
    } else if (field === 'state' || field === 'quota') {
      setFormData(prev => ({ 
        ...prev, 
        category: '', 
        course: ''
      }))
    } else if (field === 'category') {
      setFormData(prev => ({ 
        ...prev, 
        course: ''
      }))
    }
  }

  const resetForm = () => {
    setFormData({
      examType: '',
      preference: '',
      state: '',
      quota: '',
      category: '',
      course: '',
      rank: ''
    })
    setOptions({
      states: [],
      quotas: [],
      categories: [],
      courses: []
    })
    setSearchResults(null)
    setCurrentStep(STEPS.EXAM_TYPE)
    setValidationError('')
  }

  return (
    <div className="min-h-screen py-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="w-16 h-16 bg-gradient-to-r from-primary-500 to-medical-500 rounded-2xl flex items-center justify-center mx-auto mb-8">
            <Target className="w-8 h-8 text-white" />
          </div>
          
          <h1 className="text-4xl font-display font-bold text-gray-900 mb-6">
            Advanced NEET <span className="text-gradient-primary">College Finder</span>
          </h1>
          
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Find the perfect medical college based on your NEET rank, preferences, and expert counselor recommendations
          </p>
        </motion.div>

        {/* Progress indicator */}
        {currentStep < STEPS.RESULTS && (
          <div className="mb-12">
            <div className="flex items-center justify-between mb-4">
              {STEP_NAMES.slice(0, -1).filter((step, index) => {
                // Skip Location step for All India preference
                return !(index === STEPS.LOCATION && formData.preference === 'All India')
              }).map((step, displayIndex, filteredSteps) => {
                // Get the original index for this step
                const originalIndex = STEP_NAMES.indexOf(step)
                
                return (
                  <div key={originalIndex} className="flex-1 flex items-center">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium ${
                      originalIndex <= currentStep 
                        ? 'bg-primary-500 text-white'
                        : 'bg-gray-200 text-gray-500'
                    }`}>
                      {originalIndex < currentStep ? <CheckCircle2 className="w-5 h-5" /> : displayIndex + 1}
                    </div>
                    {displayIndex < filteredSteps.length - 1 && (
                      <div className={`flex-1 h-0.5 mx-4 ${
                        originalIndex < currentStep ? 'bg-primary-500' : 'bg-gray-200'
                      }`} />
                    )}
                  </div>
                )
              })}
            </div>
            <div className="text-center">
              <span className="text-sm font-medium text-primary-600">
                Step {formData.preference === 'All India' && currentStep > STEPS.LOCATION ? currentStep : currentStep + 1} of {formData.preference === 'All India' ? STEP_NAMES.length - 2 : STEP_NAMES.length - 1}: {STEP_NAMES[currentStep]}
              </span>
            </div>
          </div>
        )}

        {/* Form content */}
        <div className="card-premium p-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              {currentStep === STEPS.EXAM_TYPE && (
                <ExamTypeStep 
                  value={formData.examType} 
                  onChange={(value) => handleFormDataChange('examType', value)} 
                />
              )}
              
              {currentStep === STEPS.PREFERENCE && (
                <PreferenceStep 
                  value={formData.preference} 
                  onChange={(value) => handleFormDataChange('preference', value)} 
                />
              )}
              
              {currentStep === STEPS.LOCATION && formData.preference === 'State Wise' && (
                <LocationStep 
                  value={formData.state} 
                  onChange={(value) => handleFormDataChange('state', value)}
                  states={options.states}
                  loading={loading}
                />
              )}
              
              {currentStep === STEPS.QUOTA && (
                <QuotaStep 
                  value={formData.quota} 
                  onChange={(value) => handleFormDataChange('quota', value)}
                  quotas={options.quotas}
                  loading={loading}
                />
              )}
              
              {currentStep === STEPS.CATEGORY && (
                <CategoryStep 
                  value={formData.category} 
                  onChange={(value) => handleFormDataChange('category', value)}
                  categories={options.categories}
                  loading={loading}
                />
              )}
              
              {currentStep === STEPS.COURSE && (
                <CourseStep 
                  value={formData.course} 
                  onChange={(value) => handleFormDataChange('course', value)}
                  courses={options.courses}
                  loading={loading}
                />
              )}
              
              {currentStep === STEPS.RANK && (
                <RankStep 
                  examType={formData.examType}
                  rank={formData.rank}
                  onChange={(field, value) => handleFormDataChange(field, value)}
                />
              )}
              
              {currentStep === STEPS.RESULTS && searchResults && (
                <ResultsStep 
                  results={searchResults}
                  searchCriteria={formData}
                  onNewSearch={resetForm}
                />
              )}
            </motion.div>
          </AnimatePresence>

          {/* Validation error */}
          {validationError && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center space-x-2 text-red-700"
            >
              <AlertCircle className="w-5 h-5" />
              <span>{validationError}</span>
            </motion.div>
          )}

          {/* Navigation buttons */}
          {currentStep < STEPS.RESULTS && (
            <div className="mt-8 flex items-center justify-between">
              <button
                onClick={handlePrevious}
                disabled={currentStep === STEPS.EXAM_TYPE}
                className={`btn-secondary flex items-center space-x-2 ${
                  currentStep === STEPS.EXAM_TYPE ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Previous</span>
              </button>
              
              <button
                onClick={handleNext}
                disabled={loading || searching || (currentStep === STEPS.LOCATION && formData.preference === 'All India')}
                className="btn-gradient flex items-center space-x-2"
              >
                {searching ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Searching...</span>
                  </>
                ) : currentStep === STEPS.RANK ? (
                  <>
                    <Search className="w-4 h-4" />
                    <span>Find Colleges</span>
                  </>
                ) : (
                  <>
                    <span>Next</span>
                    <ChevronRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// Step Components
const ExamTypeStep = ({ value, onChange }) => {
  const examTypes = neetCollegeFinderApi.getExamTypes()
  
  return (
    <div className="text-center">
      <GraduationCap className="w-16 h-16 text-primary-500 mx-auto mb-6" />
      <h2 className="text-2xl font-bold text-gray-900 mb-4">Select NEET Exam Type</h2>
      <p className="text-gray-600 mb-8">Choose the NEET exam you appeared for</p>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-2xl mx-auto">
        {examTypes.map((examType) => (
          <motion.button
            key={examType}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onChange(examType)}
            className={`p-6 rounded-xl border-2 transition-all duration-200 ${
              value === examType
                ? 'border-primary-500 bg-primary-50 shadow-lg'
                : 'border-gray-200 hover:border-primary-200 hover:shadow-md'
            }`}
          >
            <div className="text-2xl mb-2">
              {examType === 'NEET-UG' ? '🎓' : '👨‍⚕️'}
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">{examType}</h3>
            <p className="text-sm text-gray-600">
              {examType === 'NEET-UG' 
                ? 'For MBBS & BDS admissions'
                : 'For MD/MS/Diploma admissions'
              }
            </p>
            <p className="text-xs text-gray-500 mt-2">
              Rank range: 1 - {examType === 'NEET-UG' ? '1,250,000' : '200,000'}
            </p>
          </motion.button>
        ))}
      </div>
    </div>
  )
}

const PreferenceStep = ({ value, onChange }) => {
  const preferences = neetCollegeFinderApi.getPreferences()
  
  return (
    <div className="text-center">
      <MapPin className="w-16 h-16 text-primary-500 mx-auto mb-6" />
      <h2 className="text-2xl font-bold text-gray-900 mb-4">Select Your Preference</h2>
      <p className="text-gray-600 mb-8">Choose whether you want All India or State-wise counseling</p>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-2xl mx-auto">
        {preferences.map((preference) => (
          <motion.button
            key={preference}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onChange(preference)}
            className={`p-6 rounded-xl border-2 transition-all duration-200 ${
              value === preference
                ? 'border-primary-500 bg-primary-50 shadow-lg'
                : 'border-gray-200 hover:border-primary-200 hover:shadow-md'
            }`}
          >
            <div className="text-2xl mb-2">
              {preference === 'All India' ? '🌍' : '🏛️'}
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">{preference}</h3>
            <p className="text-sm text-gray-600">
              {preference === 'All India' 
                ? 'Compete with students from all states'
                : 'State quota with domicile advantages'
              }
            </p>
          </motion.button>
        ))}
      </div>
    </div>
  )
}

const LocationStep = ({ value, onChange, states, loading }) => {
  return (
    <div className="text-center">
      <MapPin className="w-16 h-16 text-primary-500 mx-auto mb-6" />
      <h2 className="text-2xl font-bold text-gray-900 mb-4">Select State</h2>
      <p className="text-gray-600 mb-8">Choose the state for counseling</p>
      
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
          <span className="ml-2 text-gray-600">Loading states...</span>
        </div>
      ) : (
        <div className="max-w-md mx-auto">
          <select
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          >
            <option value="">Select a state</option>
            {states.map((state) => (
              <option key={state} value={state}>{state}</option>
            ))}
          </select>
        </div>
      )}
    </div>
  )
}

const QuotaStep = ({ value, onChange, quotas, loading }) => {
  const getQuotaDescription = (quota) => {
    // All India quotas
    if (quota === 'AI') return 'All India Quota'
    if (quota.includes('AIIMS')) return 'AIIMS Quota'
    if (quota === 'AM') return 'Armed Forces Medical College'
    if (quota.includes('AMU')) return 'Aligarh Muslim University'
    if (quota.includes('BHU')) return 'Banaras Hindu University'
    if (quota.includes('JAIN')) return 'Jain University'
    if (quota.includes('JPMR')) return 'JIPMER Quota'
    if (quota.includes('JP')) return 'JIPMER State Quota'
    if (quota.includes('DEEMED')) return 'Deemed University'
    if (quota.includes('MUSLIM')) return 'Muslim Minority'
    if (quota.includes('JI')) return 'Jamia Islamia'
    if (quota === 'MJ') return 'Maulana Azad Medical College'
    if (quota === 'MW') return 'Management/NRI Quota'
    if (quota === 'DU') return 'Delhi University'
    if (quota === 'IP') return 'Indraprastha University'
    if (quota === 'ES') return 'Employee State Insurance'
    if (quota.includes('CW')) return 'Christian/Minority Quota'
    // Default fallback
    return 'Medical College Quota'
  }
  
  return (
    <div className="text-center">
      <Users className="w-16 h-16 text-primary-500 mx-auto mb-6" />
      <h2 className="text-2xl font-bold text-gray-900 mb-4">Select Quota</h2>
      <p className="text-gray-600 mb-8">Choose the applicable quota category</p>
      
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
          <span className="ml-2 text-gray-600">Loading quotas...</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-4xl mx-auto">
          {quotas.map((quota) => (
            <motion.button
              key={quota}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onChange(quota)}
              className={`p-4 rounded-xl border-2 transition-all duration-200 text-left ${
                value === quota
                  ? 'border-primary-500 bg-primary-50 shadow-lg'
                  : 'border-gray-200 hover:border-primary-200 hover:shadow-md'
              }`}
            >
              <h3 className="font-medium text-gray-900 mb-1">{quota}</h3>
              <p className="text-xs text-gray-600">
                {getQuotaDescription(quota)}
              </p>
            </motion.button>
          ))}
        </div>
      )}
    </div>
  )
}

const CategoryStep = ({ value, onChange, categories, loading }) => {
  const getCategoryIcon = (category) => {
    if (category.includes('Open') || category.includes('GEN')) return '👤'
    if (category.includes('SC')) return '🏛️'
    if (category.includes('ST')) return '🌿'
    if (category.includes('OBC')) return '⚖️'
    if (category.includes('EWS')) return '💼'
    return '📋'
  }
  
  return (
    <div className="text-center">
      <Users className="w-16 h-16 text-primary-500 mx-auto mb-6" />
      <h2 className="text-2xl font-bold text-gray-900 mb-4">Select Category</h2>
      <p className="text-gray-600 mb-8">Choose your reservation category</p>
      
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
          <span className="ml-2 text-gray-600">Loading categories...</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-4xl mx-auto">
          {categories.map((category) => (
            <motion.button
              key={category}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onChange(category)}
              className={`p-4 rounded-xl border-2 transition-all duration-200 text-left ${
                value === category
                  ? 'border-primary-500 bg-primary-50 shadow-lg'
                  : 'border-gray-200 hover:border-primary-200 hover:shadow-md'
              }`}
            >
              <div className="text-xl mb-2">{getCategoryIcon(category)}</div>
              <h3 className="font-medium text-gray-900 mb-1">{category}</h3>
              <p className="text-xs text-gray-600">
                {category.includes('PwD') ? 'Person with Disability' : 'Standard Category'}
              </p>
            </motion.button>
          ))}
        </div>
      )}
    </div>
  )
}

const CourseStep = ({ value, onChange, courses, loading }) => {
  const getCourseIcon = (course) => {
    if (course.includes('MBBS')) return '🩺'
    if (course.includes('BDS')) return '🦷'
    if (course.includes('RADIO')) return '📱'
    if (course.includes('MEDICINE') || course.includes('GENERAL MEDICINE')) return '⚕️'
    if (course.includes('SURGERY')) return '🔪'
    if (course.includes('DERMATOLOGY')) return '🧴'
    if (course.includes('ENT')) return '👂'
    if (course.includes('ANAESTHESIOLOGY')) return '💉'
    if (course.includes('ORTHOPAEDICS')) return '🦴'
    return '🏥'
  }
  
  return (
    <div className="text-center">
      <Stethoscope className="w-16 h-16 text-primary-500 mx-auto mb-6" />
      <h2 className="text-2xl font-bold text-gray-900 mb-4">Select Course</h2>
      <p className="text-gray-600 mb-8">Choose your preferred medical course</p>
      
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
          <span className="ml-2 text-gray-600">Loading courses...</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-4xl mx-auto">
          {courses.map((course) => (
            <motion.button
              key={course}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onChange(course)}
              className={`p-4 rounded-xl border-2 transition-all duration-200 text-left ${
                value === course
                  ? 'border-primary-500 bg-primary-50 shadow-lg'
                  : 'border-gray-200 hover:border-primary-200 hover:shadow-md'
              }`}
            >
              <div className="text-xl mb-2">{getCourseIcon(course)}</div>
              <h3 className="font-medium text-gray-900 mb-1">{course}</h3>
              <p className="text-xs text-gray-600">
                {course.includes('MBBS') ? 'Bachelor of Medicine' :
                 course.includes('BDS') ? 'Bachelor of Dental Surgery' :
                 'Postgraduate Medical Course'}
              </p>
            </motion.button>
          ))}
        </div>
      )}
    </div>
  )
}

const RankStep = ({ examType, rank, onChange }) => {
  const maxRank = examType === 'NEET-UG' ? 1250000 : 200000
  
  return (
    <div className="text-center">
      <TrendingUp className="w-16 h-16 text-primary-500 mx-auto mb-6" />
      <h2 className="text-2xl font-bold text-gray-900 mb-4">Enter Your AIR Rank</h2>
      <p className="text-gray-600 mb-8">
        Enter your {examType} All India Rank (AIR) to find matching colleges
      </p>
      
      <div className="max-w-md mx-auto space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Your AIR Rank
          </label>
          <input
            type="number"
            value={rank || ''}
            onChange={(e) => onChange('rank', e.target.value)}
            min="1"
            max={maxRank}
            placeholder={`e.g., ${examType === 'NEET-UG' ? '15000' : '2500'}`}
            className="w-full p-4 text-lg border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-center font-medium"
          />
        </div>
        
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-left">
          <h4 className="font-medium text-blue-900 mb-2">ℹ️ About AIR Rank:</h4>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• Enter your exact rank from the scorecard</li>
            <li>• We'll show colleges where you have admission chances</li>
            <li>• Maximum rank for {examType}: {maxRank.toLocaleString()}</li>
            <li>• Results include Safe, Moderate, and Risky options</li>
          </ul>
        </div>
      </div>
    </div>
  )
}

const ResultsStep = ({ results, searchCriteria, onNewSearch }) => {
  const navigate = useNavigate()
  
  return (
    <div>
      <div className="text-center mb-8">
        <School className="w-16 h-16 text-primary-500 mx-auto mb-6" />
        <h2 className="text-2xl font-bold text-gray-900 mb-4">College Recommendations</h2>
        <p className="text-gray-600 mb-4">
          Found {results.total_results} colleges matching your criteria
        </p>
        
        {/* Summary stats */}
        <div className="flex justify-center space-x-4 mb-6">
          <div className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm">
            🟢 Safe: {calculateSafetyCount(results.recommendations, ['Very Safe', 'Safe'])}
          </div>
          <div className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-sm">
            🟡 Moderate: {calculateSafetyCount(results.recommendations, ['Moderate', 'Good Chance'])}
          </div>
          <div className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-sm">
            🟠 Possible: {calculateSafetyCount(results.recommendations, ['Possible'])}
          </div>
        </div>
      </div>
      
      {/* Results list */}
      <div className="space-y-4 mb-8">
        {results.recommendations.slice(0, 10).map((college, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="font-bold text-lg text-gray-900 mb-1">{college.institute}</h3>
                <p className="text-primary-600 font-medium">{college.course}</p>
                <p className="text-gray-600 text-sm">{college.state} • {college.quota}</p>
              </div>
              <div className={`px-3 py-1 rounded-full text-sm font-medium border ${
                neetCollegeFinderApi.getSafetyColor(college.safety_level)
              }`}>
                {neetCollegeFinderApi.getSafetyIcon(college.safety_level)} {college.safety_level}
              </div>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="text-gray-500">Fee:</span>
                <div className="font-medium">{neetCollegeFinderApi.formatFee(college.fee)}</div>
              </div>
              <div>
                <span className="text-gray-500">Stipend:</span>
                <div className="font-medium">{neetCollegeFinderApi.formatStipend(college.stipend)}</div>
              </div>
              <div>
                <span className="text-gray-500">Bond:</span>
                <div className="font-medium">{college.bond_years} years</div>
              </div>
              <div>
                <span className="text-gray-500">Bond Penalty:</span>
                <div className="font-medium">{college.bond_penalty || 'No Penalty'}</div>
              </div>
            </div>
            
            {college.details?.recommendation && (
              <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-700">{college.details.recommendation}</p>
              </div>
            )}
          </motion.div>
        ))}
      </div>
      
      {results.total_results > 10 && (
        <div className="text-center mb-8">
          <p className="text-gray-600 mb-4">
            Showing top 10 of {results.total_results} results
          </p>
          <button
            onClick={() => navigate('/results', { state: { results, searchCriteria } })}
            className="btn-gradient"
          >
            View All Results
          </button>
        </div>
      )}
      
      {/* Action buttons */}
      <div className="flex justify-center space-x-4">
        <button onClick={onNewSearch} className="btn-secondary">
          New Search
        </button>
        <button
          onClick={() => navigate('/results', { state: { results, searchCriteria } })}
          className="btn-gradient"
        >
          Detailed Analysis
        </button>
      </div>
    </div>
  )
}

export default PredictionPage
