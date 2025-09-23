import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Button,
  Box,
  Grid,
  Card,
  CardContent,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Alert,
  Stepper,
  Step,
  StepLabel,
  Paper,
  Chip,
  Divider,
} from '@mui/material';
import {
  Search,
  NavigateNext,
  NavigateBefore,
  School,
  LocationOn,
  Category,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import API_CONFIG from '../config/api';

// Use centralized API configuration
const API_BASE = API_CONFIG.BASE_URL;

const NewSearchPage = () => {
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Cascading filter state
  const [states, setStates] = useState([]);
  const [availableQuotas, setAvailableQuotas] = useState([]);
  const [availableCategories, setAvailableCategories] = useState([]);
  const [availableCourses, setAvailableCourses] = useState([]);
  
  // Loading states for each step
  const [loadingQuotas, setLoadingQuotas] = useState(false);
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [loadingCourses, setLoadingCourses] = useState(false);
  
  // Form data
  const [formData, setFormData] = useState({
    // Step 1: State Selection
    state: '',
    
    // Step 2: Quota Selection  
    quota: '',
    
    // Step 3: Course & Category
    course: '',
    category: '',
    air: '',
    
    // Step 4: Optional Filters (removed feeRange)
    includeGovernment: true,
    includePrivate: true,
  });

  const steps = [
    { label: 'Select State', description: 'Choose your preferred state', icon: <LocationOn /> },
    { label: 'Select Quota', description: 'Choose quota type', icon: <Category /> },
    { label: 'Course & Details', description: 'Select course and enter AIR', icon: <School /> },
  ];

  // Load states on component mount
  useEffect(() => {
    loadStates();
  }, []);

  const loadStates = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE}/states`);
      setStates(response.data.states);
    } catch (err) {
      setError('Failed to load states. Please check if the API is running.');
      console.error('Error loading states:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadQuotasForState = async (state) => {
    if (!state) return;
    
    try {
      setLoadingQuotas(true);
      const response = await axios.get(`${API_BASE}/quotas/${state}`);
      setAvailableQuotas(response.data.quotas);
      
      // Reset dependent fields
      setFormData(prev => ({
        ...prev,
        quota: '',
        category: '',
        course: ''
      }));
      setAvailableCategories([]);
      setAvailableCourses([]);
    } catch (err) {
      setError(`Failed to load quotas for ${state}`);
      console.error('Error loading quotas:', err);
    } finally {
      setLoadingQuotas(false);
    }
  };

  const loadCategoriesForQuota = async (state, quota) => {
    if (!state || !quota) return;
    
    try {
      setLoadingCategories(true);
      const response = await axios.get(`${API_BASE}/categories/${state}/${quota}`);
      setAvailableCategories(response.data.categories);
      
      // Reset category selection
      setFormData(prev => ({ ...prev, category: '' }));
    } catch (err) {
      setError(`Failed to load categories for ${quota}`);
      console.error('Error loading categories:', err);
    } finally {
      setLoadingCategories(false);
    }
  };

  const loadCoursesForState = async (state) => {
    if (!state) return;
    
    try {
      setLoadingCourses(true);
      const response = await axios.get(`${API_BASE}/courses/${state}`);
      setAvailableCourses(response.data.courses);
    } catch (err) {
      setError(`Failed to load courses for ${state}`);
      console.error('Error loading courses:', err);
    } finally {
      setLoadingCourses(false);
    }
  };

  const handleStateChange = (state) => {
    setFormData(prev => ({ ...prev, state }));
    loadQuotasForState(state);
    loadCoursesForState(state);
    setError('');
  };

  const handleQuotaChange = (quota) => {
    setFormData(prev => ({ ...prev, quota }));
    loadCategoriesForQuota(formData.state, quota);
    setError('');
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError('');
  };

  const validateStep = (step) => {
    switch (step) {
      case 0: 
        return formData.state !== '' && states.length > 0;
      case 1: 
        return formData.state !== '' && formData.quota !== '' && availableQuotas.length > 0;
      case 2: 
        return formData.state !== '' && 
               formData.quota !== '' && 
               formData.course !== '' && 
               formData.category !== '' && 
               formData.air && 
               parseInt(formData.air) > 0 && 
               parseInt(formData.air) <= 200000;
      default: 
        return false;
    }
  };

  const handleNext = () => {
    console.log('Next button clicked, current step:', activeStep);
    console.log('Step validation result:', validateStep(activeStep));
    console.log('Current form data:', formData);
    
    if (validateStep(activeStep)) {
      const newStep = activeStep + 1;
      console.log('Going from step', activeStep, 'to step', newStep);
      setActiveStep(newStep);
      setError('');
    } else {
      console.log('Step validation failed');
      setError('Please complete this step before continuing');
    }
  };

  const handleBack = () => {
    console.log('Back button clicked, current step:', activeStep);
    
    if (activeStep > 0) {
      const newStep = activeStep - 1;
      console.log('Going from step', activeStep, 'to step', newStep);
      
      // Clear dependent form data based on which step we're going back to
      if (activeStep === 2) {
        // Going back from step 3 to step 2 - clear course/category/air
        console.log('Clearing step 3 data (course, category, air)');
        setFormData(prev => ({
          ...prev,
          course: '',
          category: '',
          air: ''
        }));
      } else if (activeStep === 1) {
        // Going back from step 2 to step 1 - clear quota and dependent data
        console.log('Clearing step 2 data (quota and dependencies)');
        setFormData(prev => ({
          ...prev,
          quota: '',
          category: '',
          course: '',
          air: ''
        }));
        setAvailableCategories([]);
        setAvailableCourses([]);
      }
      
      // Set the new step
      setActiveStep(newStep);
      setError('');
    } else {
      console.log('Cannot go back, already at first step');
    }
  };

  const handleSearch = async () => {
    setLoading(true);
    setError('');
    
    try {
      const searchRequest = {
        state: formData.state,
        quota: formData.quota,
        category: formData.category,
        course: formData.course,
        air: parseInt(formData.air),
        // Removed fee_range - show all budget colleges
        include_government: formData.includeGovernment,
        include_private: formData.includePrivate,
      };

      console.log('Search request:', searchRequest);
      
      const response = await axios.post(`${API_BASE}/predict`, searchRequest);
      
      // Navigate to results with search results
      navigate('/results', { 
        state: { 
          searchResults: response.data,
          searchQuery: formData 
        } 
      });
      
    } catch (err) {
      setError('Search failed. Please check your inputs and try again.');
      console.error('Search error:', err);
    } finally {
      setLoading(false);
    }
  };

  const renderStepContent = () => {
    switch (activeStep) {
      case 0:
        return (
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Step 1: Select Your Preferred State
              </Typography>
              <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
                Choose the state where you want to pursue your medical specialization.
              </Typography>
              
              <FormControl fullWidth>
                <InputLabel>State</InputLabel>
                <Select
                  value={formData.state}
                  onChange={(e) => handleStateChange(e.target.value)}
                  disabled={loading}
                >
                  {states.map((state) => (
                    <MenuItem key={state} value={state}>
                      {state}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              
              {formData.state && availableQuotas.length > 0 && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="body2" color="primary">
                    ✅ Found {availableQuotas.length} quota options for {formData.state}
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        );

      case 1:
        return (
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Step 2: Select Quota Type
              </Typography>
              <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
                Choose the quota type available in {formData.state}.
              </Typography>
              
              {loadingQuotas ? (
                <Box display="flex" justifyContent="center" p={3}>
                  <CircularProgress />
                </Box>
              ) : (
                <FormControl fullWidth>
                  <InputLabel>Quota</InputLabel>
                  <Select
                    value={formData.quota}
                    onChange={(e) => handleQuotaChange(e.target.value)}
                    disabled={availableQuotas.length === 0}
                  >
                    {availableQuotas.map((quota) => (
                      <MenuItem key={quota} value={quota}>
                        {quota}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              )}
              
              {formData.quota && availableCategories.length > 0 && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="body2" color="primary">
                    ✅ Found {availableCategories.length} categories for this quota
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        );

      case 2:
        return (
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Step 3: Course Selection & Personal Details
              </Typography>
              <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
                Select your desired course and enter your NEET-PG AIR.
              </Typography>
              
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth>
                    <InputLabel>Course</InputLabel>
                    <Select
                      value={formData.course}
                      onChange={(e) => handleInputChange('course', e.target.value)}
                      disabled={loadingCourses || availableCourses.length === 0}
                    >
                      {availableCourses.map((course) => (
                        <MenuItem key={course} value={course}>
                          {course}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth>
                    <InputLabel>Category</InputLabel>
                    <Select
                      value={formData.category}
                      onChange={(e) => handleInputChange('category', e.target.value)}
                      disabled={loadingCategories || availableCategories.length === 0}
                    >
                      {availableCategories.map((category) => (
                        <MenuItem key={category} value={category}>
                          {category}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    type="number"
                    label="Your NEET-PG AIR (All India Rank)"
                    value={formData.air}
                    onChange={(e) => handleInputChange('air', e.target.value)}
                    inputProps={{ min: 1, max: 200000 }}
                    helperText="Enter your All India Rank (1-200000)"
                  />
                </Grid>
              </Grid>
              
              {loadingCourses && (
                <Box display="flex" justifyContent="center" p={2}>
                  <CircularProgress size={20} />
                  <Typography variant="body2" sx={{ ml: 1 }}>
                    Loading courses...
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        );

      default:
        return null;
    }
  };

  const renderSummary = () => (
    <Paper sx={{ p: 2, mb: 2, bgcolor: 'background.paper' }}>
      <Typography variant="subtitle2" gutterBottom>Search Summary</Typography>
      <Box display="flex" flexWrap="wrap" gap={1}>
        {formData.state && <Chip label={`State: ${formData.state}`} size="small" />}
        {formData.quota && <Chip label={`Quota: ${formData.quota}`} size="small" />}
        {formData.course && <Chip label={`Course: ${formData.course}`} size="small" />}
        {formData.category && <Chip label={`Category: ${formData.category}`} size="small" />}
        {formData.air && <Chip label={`AIR: ${formData.air}`} size="small" />}
      </Box>
    </Paper>
  );

  if (loading && states.length === 0) {
    return (
      <Container>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
          <CircularProgress />
          <Typography sx={{ ml: 2 }}>Loading NEET-PG College Finder...</Typography>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Typography variant="h3" component="h1" gutterBottom align="center">
          Find Your Perfect Medical College
        </Typography>
        <Typography variant="h6" color="textSecondary" align="center" sx={{ mb: 4 }}>
          AI-powered college recommendations based on your NEET-PG rank (All budget ranges included)
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {/* Progress Stepper */}
        <Paper sx={{ p: 3, mb: 3 }}>
          <Stepper activeStep={activeStep}>
            {steps.map((step, index) => (
              <Step key={step.label}>
                <StepLabel icon={step.icon}>
                  <Typography variant="subtitle2">{step.label}</Typography>
                  <Typography variant="caption" color="textSecondary">
                    {step.description}
                  </Typography>
                </StepLabel>
              </Step>
            ))}
          </Stepper>
        </Paper>

        {/* Search Summary */}
        {(formData.state || formData.quota || formData.course) && renderSummary()}

        {/* Step Content */}
        <motion.div
          key={activeStep}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
        >
          {renderStepContent()}
        </motion.div>

        {/* Navigation Buttons */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
          <Button
            onClick={handleBack}
            disabled={activeStep === 0}
            startIcon={<NavigateBefore />}
          >
            Back
          </Button>
          
          {activeStep === steps.length - 1 ? (
            <Button
              variant="contained"
              onClick={handleSearch}
              disabled={!validateStep(activeStep) || loading}
              startIcon={loading ? <CircularProgress size={20} /> : <Search />}
              size="large"
            >
              {loading ? 'Searching...' : 'Find Colleges'}
            </Button>
          ) : (
            <Button
              variant="contained"
              onClick={handleNext}
              disabled={!validateStep(activeStep)}
              endIcon={<NavigateNext />}
            >
              Next
            </Button>
          )}
        </Box>
      </motion.div>
    </Container>
  );
};

export default NewSearchPage;