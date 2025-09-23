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
  Chip,
  Paper,
  Stepper,
  Step,
  StepLabel,
  CircularProgress,
  Alert,
  Slider,
  FormControlLabel,
  Switch,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Divider,
  Tooltip,
  IconButton,
} from '@mui/material';
import {
  Search,
  FilterList,
  Clear,
  ExpandMore,
  Info,
  NavigateNext,
  NavigateBefore,
  School,
  LocationOn,
  Category,
  MonetizationOn,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const SearchPage = () => {
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Form state
  const [formData, setFormData] = useState({
    // Basic Details
    category: '',
    state: '',
    course: '',
    typeOfCourse: '',
    quota: '',
    air: '',
    
    // Advanced Filters
    feeRange: [0, 1000000],
    stipendRange: [0, 200000],
    bondYearsRange: [0, 7],
    bondAmountRange: [0, 10000000],
    bedsRange: [0, 3000],
    
    // Preferences
    includePrivate: true,
    includeGovernment: true,
    includeMinority: true,
    prioritizeFeesLow: false,
    prioritizeStipendHigh: false,
    avoidBonds: false,
  });

  // Options data (would typically come from API)
  const [options, setOptions] = useState({
    categories: [],
    states: [],
    courses: [],
    courseTypes: [],
    quotas: [],
  });

  const steps = [
    {
      label: 'Basic Details',
      description: 'Enter your NEET-PG details',
      icon: <School />,
    },
    {
      label: 'Advanced Filters',
      description: 'Set your preferences',
      icon: <FilterList />,
    },
    {
      label: 'Review & Search',
      description: 'Confirm and find colleges',
      icon: <Search />,
    },
  ];

  // Sample data (replace with API calls)
  useEffect(() => {
    const sampleOptions = {
      categories: [
        'OPEN-GEN', 'OPEN-FEM', 'SC-GEN', 'SC-FEM', 'ST-GEN', 'ST-FEM',
        'BCA-GEN', 'BCA-FEM', 'BCB-GEN', 'BCB-FEM', 'BCC-GEN', 'BCC-FEM',
        'BCD-GEN', 'BCD-FEM', 'BCE-GEN', 'BCE-FEM', 'MIN-GEN-MSM', 'MIN-FEM-MSM'
      ],
      states: [
        'Andhra Pradesh', 'Delhi', 'Karnataka', 'Maharashtra', 'Tamil Nadu',
        'West Bengal', 'Uttar Pradesh', 'Rajasthan', 'Gujarat', 'Kerala'
      ],
      courses: [
        'ANAESTHESIOLOGY', 'DERMATOLOGY', 'ENT', 'GENERAL MEDICINE', 'GENERAL SURGERY',
        'OBSTETRICS AND GYNAECOLOGY', 'OPHTHALMOLOGY', 'ORTHOPAEDICS', 'PAEDIATRICS',
        'PSYCHIATRY', 'RADIOLOGY', 'PATHOLOGY', 'BIOCHEMISTRY', 'ANATOMY'
      ],
      courseTypes: ['CLINICAL', 'PRE CLINICAL', 'PARA CLINICAL'],
      quotas: [
        'AP Govt-NS LOC', 'AP Govt-NS APUR', 'AP Govt-NS UNR', 'AP Govt-Serv LOC',
        'All India', 'Deemed University', 'Management', 'NRI'
      ],
    };
    setOptions(sampleOptions);
  }, []);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    setError('');
  };

  const validateStep = (step) => {
    switch (step) {
      case 0:
        return formData.category && formData.state && formData.course && 
               formData.typeOfCourse && formData.quota && formData.air &&
               formData.air > 0 && formData.air <= 200000;
      case 1:
        return true; // Advanced filters are optional
      case 2:
        return true; // Review step
      default:
        return false;
    }
  };

  const handleNext = () => {
    if (validateStep(activeStep)) {
      setActiveStep(prev => prev + 1);
    } else {
      setError('Please fill in all required fields correctly');
    }
  };

  const handleBack = () => {
    setActiveStep(prev => prev - 1);
    setError('');
  };

  const handleSearch = async () => {
    setLoading(true);
    setError('');
    
    try {
      // API call would go here
      const searchParams = {
        Category: formData.category,
        State: formData.state,
        Course: formData.course,
        Type_of_Course: formData.typeOfCourse,
        Quota: formData.quota,
        AIR: parseInt(formData.air),
        filters: {
          feeRange: formData.feeRange,
          stipendRange: formData.stipendRange,
          bondYearsRange: formData.bondYearsRange,
          bondAmountRange: formData.bondAmountRange,
          bedsRange: formData.bedsRange,
          preferences: {
            includePrivate: formData.includePrivate,
            includeGovernment: formData.includeGovernment,
            includeMinority: formData.includeMinority,
            prioritizeFeesLow: formData.prioritizeFeesLow,
            prioritizeStipendHigh: formData.prioritizeStipendHigh,
            avoidBonds: formData.avoidBonds,
          }
        }
      };

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Navigate to results page with search parameters
      navigate('/results', { state: { searchParams } });
      
    } catch (err) {
      setError('Failed to fetch college recommendations. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const clearFilters = () => {
    setFormData({
      category: '',
      state: '',
      course: '',
      typeOfCourse: '',
      quota: '',
      air: '',
      feeRange: [0, 1000000],
      stipendRange: [0, 200000],
      bondYearsRange: [0, 7],
      bondAmountRange: [0, 10000000],
      bedsRange: [0, 3000],
      includePrivate: true,
      includeGovernment: true,
      includeMinority: true,
      prioritizeFeesLow: false,
      prioritizeStipendHigh: false,
      avoidBonds: false,
    });
    setActiveStep(0);
    setError('');
  };

  const renderBasicDetails = () => (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Typography variant="h6" gutterBottom>
          Enter Your NEET-PG Details
        </Typography>
        <Typography variant="body2" color="text.secondary" paragraph>
          Provide your basic information to get personalized college recommendations
        </Typography>
      </Grid>
      
      <Grid item xs={12} md={6}>
        <FormControl fullWidth required>
          <InputLabel>Category</InputLabel>
          <Select
            value={formData.category}
            label="Category"
            onChange={(e) => handleInputChange('category', e.target.value)}
          >
            {options.categories.map((cat) => (
              <MenuItem key={cat} value={cat}>{cat}</MenuItem>
            ))}
          </Select>
        </FormControl>
      </Grid>

      <Grid item xs={12} md={6}>
        <FormControl fullWidth required>
          <InputLabel>State</InputLabel>
          <Select
            value={formData.state}
            label="State"
            onChange={(e) => handleInputChange('state', e.target.value)}
          >
            {options.states.map((state) => (
              <MenuItem key={state} value={state}>{state}</MenuItem>
            ))}
          </Select>
        </FormControl>
      </Grid>

      <Grid item xs={12} md={6}>
        <FormControl fullWidth required>
          <InputLabel>Course</InputLabel>
          <Select
            value={formData.course}
            label="Course"
            onChange={(e) => handleInputChange('course', e.target.value)}
          >
            {options.courses.map((course) => (
              <MenuItem key={course} value={course}>{course}</MenuItem>
            ))}
          </Select>
        </FormControl>
      </Grid>

      <Grid item xs={12} md={6}>
        <FormControl fullWidth required>
          <InputLabel>Type of Course</InputLabel>
          <Select
            value={formData.typeOfCourse}
            label="Type of Course"
            onChange={(e) => handleInputChange('typeOfCourse', e.target.value)}
          >
            {options.courseTypes.map((type) => (
              <MenuItem key={type} value={type}>{type}</MenuItem>
            ))}
          </Select>
        </FormControl>
      </Grid>

      <Grid item xs={12} md={6}>
        <FormControl fullWidth required>
          <InputLabel>Quota</InputLabel>
          <Select
            value={formData.quota}
            label="Quota"
            onChange={(e) => handleInputChange('quota', e.target.value)}
          >
            {options.quotas.map((quota) => (
              <MenuItem key={quota} value={quota}>{quota}</MenuItem>
            ))}
          </Select>
        </FormControl>
      </Grid>

      <Grid item xs={12} md={6}>
        <TextField
          fullWidth
          required
          type="number"
          label="All India Rank (AIR)"
          value={formData.air}
          onChange={(e) => handleInputChange('air', e.target.value)}
          inputProps={{ min: 1, max: 200000 }}
          helperText="Enter your NEET-PG All India Rank"
        />
      </Grid>
    </Grid>
  );

  const renderAdvancedFilters = () => (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Typography variant="h6" gutterBottom>
          Advanced Filters
        </Typography>
        <Typography variant="body2" color="text.secondary" paragraph>
          Fine-tune your search with advanced filtering options
        </Typography>
      </Grid>

      {/* Financial Filters */}
      <Grid item xs={12}>
        <Accordion defaultExpanded>
          <AccordionSummary expandIcon={<ExpandMore />}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <MonetizationOn color="primary" />
              <Typography variant="h6">Financial Filters</Typography>
            </Box>
          </AccordionSummary>
          <AccordionDetails>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Typography gutterBottom>Annual Fees Range</Typography>
                <Slider
                  value={formData.feeRange}
                  onChange={(e, newValue) => handleInputChange('feeRange', newValue)}
                  valueLabelDisplay="auto"
                  min={0}
                  max={1000000}
                  step={50000}
                  valueLabelFormat={(value) => `₹${value.toLocaleString()}`}
                />
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                  <Typography variant="caption">₹0</Typography>
                  <Typography variant="caption">₹10 Lakh</Typography>
                </Box>
              </Grid>

              <Grid item xs={12} md={6}>
                <Typography gutterBottom>Stipend Range</Typography>
                <Slider
                  value={formData.stipendRange}
                  onChange={(e, newValue) => handleInputChange('stipendRange', newValue)}
                  valueLabelDisplay="auto"
                  min={0}
                  max={200000}
                  step={10000}
                  valueLabelFormat={(value) => `₹${value.toLocaleString()}`}
                />
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                  <Typography variant="caption">₹0</Typography>
                  <Typography variant="caption">₹2 Lakh</Typography>
                </Box>
              </Grid>

              <Grid item xs={12} md={6}>
                <Typography gutterBottom>Bond Years Range</Typography>
                <Slider
                  value={formData.bondYearsRange}
                  onChange={(e, newValue) => handleInputChange('bondYearsRange', newValue)}
                  valueLabelDisplay="auto"
                  min={0}
                  max={7}
                  step={1}
                  marks={[
                    { value: 0, label: '0' },
                    { value: 3, label: '3' },
                    { value: 7, label: '7' },
                  ]}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <Typography gutterBottom>Bond Amount Range</Typography>
                <Slider
                  value={formData.bondAmountRange}
                  onChange={(e, newValue) => handleInputChange('bondAmountRange', newValue)}
                  valueLabelDisplay="auto"
                  min={0}
                  max={10000000}
                  step={500000}
                  valueLabelFormat={(value) => `₹${(value/100000).toFixed(0)}L`}
                />
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                  <Typography variant="caption">₹0</Typography>
                  <Typography variant="caption">₹1 Cr</Typography>
                </Box>
              </Grid>
            </Grid>
          </AccordionDetails>
        </Accordion>
      </Grid>

      {/* Institute Filters */}
      <Grid item xs={12}>
        <Accordion>
          <AccordionSummary expandIcon={<ExpandMore />}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <School color="primary" />
              <Typography variant="h6">Institute Preferences</Typography>
            </Box>
          </AccordionSummary>
          <AccordionDetails>
            <Grid container spacing={2}>
              <Grid item xs={12} md={4}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={formData.includeGovernment}
                      onChange={(e) => handleInputChange('includeGovernment', e.target.checked)}
                    />
                  }
                  label="Government Colleges"
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={formData.includePrivate}
                      onChange={(e) => handleInputChange('includePrivate', e.target.checked)}
                    />
                  }
                  label="Private Colleges"
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={formData.includeMinority}
                      onChange={(e) => handleInputChange('includeMinority', e.target.checked)}
                    />
                  }
                  label="Minority Colleges"
                />
              </Grid>

              <Grid item xs={12}>
                <Typography gutterBottom>Hospital Beds Range</Typography>
                <Slider
                  value={formData.bedsRange}
                  onChange={(e, newValue) => handleInputChange('bedsRange', newValue)}
                  valueLabelDisplay="auto"
                  min={0}
                  max={3000}
                  step={100}
                  marks={[
                    { value: 0, label: '0' },
                    { value: 1000, label: '1000' },
                    { value: 3000, label: '3000' },
                  ]}
                />
              </Grid>
            </Grid>
          </AccordionDetails>
        </Accordion>
      </Grid>

      {/* Priority Preferences */}
      <Grid item xs={12}>
        <Accordion>
          <AccordionSummary expandIcon={<ExpandMore />}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <FilterList color="primary" />
              <Typography variant="h6">Priority Preferences</Typography>
            </Box>
          </AccordionSummary>
          <AccordionDetails>
            <Grid container spacing={2}>
              <Grid item xs={12} md={4}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={formData.prioritizeFeesLow}
                      onChange={(e) => handleInputChange('prioritizeFeesLow', e.target.checked)}
                    />
                  }
                  label="Prioritize Low Fees"
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={formData.prioritizeStipendHigh}
                      onChange={(e) => handleInputChange('prioritizeStipendHigh', e.target.checked)}
                    />
                  }
                  label="Prioritize High Stipend"
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={formData.avoidBonds}
                      onChange={(e) => handleInputChange('avoidBonds', e.target.checked)}
                    />
                  }
                  label="Avoid Bond Colleges"
                />
              </Grid>
            </Grid>
          </AccordionDetails>
        </Accordion>
      </Grid>
    </Grid>
  );

  const renderReview = () => (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Typography variant="h6" gutterBottom>
          Review Your Search Criteria
        </Typography>
        <Typography variant="body2" color="text.secondary" paragraph>
          Please review your search parameters before proceeding
        </Typography>
      </Grid>

      <Grid item xs={12} md={6}>
        <Paper elevation={2} sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom color="primary">
            Basic Details
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography variant="body2" color="text.secondary">Category:</Typography>
              <Chip label={formData.category} size="small" />
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography variant="body2" color="text.secondary">State:</Typography>
              <Chip label={formData.state} size="small" />
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography variant="body2" color="text.secondary">Course:</Typography>
              <Chip label={formData.course} size="small" />
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography variant="body2" color="text.secondary">Type:</Typography>
              <Chip label={formData.typeOfCourse} size="small" />
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography variant="body2" color="text.secondary">Quota:</Typography>
              <Chip label={formData.quota} size="small" />
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography variant="body2" color="text.secondary">AIR:</Typography>
              <Chip label={formData.air} size="small" color="primary" />
            </Box>
          </Box>
        </Paper>
      </Grid>

      <Grid item xs={12} md={6}>
        <Paper elevation={2} sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom color="secondary">
            Active Filters
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            <Typography variant="body2">
              Fee Range: ₹{formData.feeRange[0].toLocaleString()} - ₹{formData.feeRange[1].toLocaleString()}
            </Typography>
            <Typography variant="body2">
              Stipend Range: ₹{formData.stipendRange[0].toLocaleString()} - ₹{formData.stipendRange[1].toLocaleString()}
            </Typography>
            <Typography variant="body2">
              Bond Years: {formData.bondYearsRange[0]} - {formData.bondYearsRange[1]} years
            </Typography>
            <Typography variant="body2">
              Hospital Beds: {formData.bedsRange[0]} - {formData.bedsRange[1]}
            </Typography>
            <Divider sx={{ my: 1 }} />
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              {formData.includeGovernment && <Chip label="Government" size="small" color="success" />}
              {formData.includePrivate && <Chip label="Private" size="small" color="info" />}
              {formData.includeMinority && <Chip label="Minority" size="small" color="warning" />}
              {formData.prioritizeFeesLow && <Chip label="Low Fees Priority" size="small" />}
              {formData.prioritizeStipendHigh && <Chip label="High Stipend Priority" size="small" />}
              {formData.avoidBonds && <Chip label="No Bonds" size="small" />}
            </Box>
          </Box>
        </Paper>
      </Grid>
    </Grid>
  );

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Header */}
        <Box textAlign="center" mb={4}>
          <Typography variant="h3" component="h1" gutterBottom fontWeight={600}>
            Find Your Perfect Medical College
          </Typography>
          <Typography variant="h6" color="text.secondary" paragraph>
            Use our advanced AI-powered search to discover colleges that match your profile
          </Typography>
        </Box>

        {/* Stepper */}
        <Paper elevation={2} sx={{ p: 3, mb: 4 }}>
          <Stepper activeStep={activeStep} alternativeLabel>
            {steps.map((step, index) => (
              <Step key={step.label}>
                <StepLabel
                  icon={step.icon}
                  sx={{
                    '& .MuiStepLabel-label': {
                      fontSize: '0.9rem',
                      fontWeight: 500,
                    },
                  }}
                >
                  <Box textAlign="center">
                    <Typography variant="body1" fontWeight={500}>
                      {step.label}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {step.description}
                    </Typography>
                  </Box>
                </StepLabel>
              </Step>
            ))}
          </Stepper>
        </Paper>

        {/* Main Content */}
        <Card elevation={3}>
          <CardContent sx={{ p: 4 }}>
            {error && (
              <Alert severity="error" sx={{ mb: 3 }}>
                {error}
              </Alert>
            )}

            {activeStep === 0 && renderBasicDetails()}
            {activeStep === 1 && renderAdvancedFilters()}
            {activeStep === 2 && renderReview()}

            {/* Navigation Buttons */}
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                mt: 4,
                pt: 3,
                borderTop: 1,
                borderColor: 'divider',
              }}
            >
              <Box sx={{ display: 'flex', gap: 2 }}>
                <Button
                  variant="outlined"
                  onClick={clearFilters}
                  startIcon={<Clear />}
                  sx={{ fontWeight: 500 }}
                >
                  Clear All
                </Button>
              </Box>

              <Box sx={{ display: 'flex', gap: 2 }}>
                {activeStep > 0 && (
                  <Button
                    onClick={handleBack}
                    startIcon={<NavigateBefore />}
                    sx={{ fontWeight: 500 }}
                  >
                    Back
                  </Button>
                )}
                
                {activeStep < steps.length - 1 ? (
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button
                      variant="contained"
                      onClick={handleNext}
                      endIcon={<NavigateNext />}
                      sx={{ fontWeight: 600, px: 4 }}
                    >
                      Next
                    </Button>
                  </motion.div>
                ) : (
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button
                      variant="contained"
                      size="large"
                      onClick={handleSearch}
                      disabled={loading}
                      startIcon={loading ? <CircularProgress size={20} /> : <Search />}
                      sx={{
                        fontWeight: 600,
                        px: 6,
                        py: 1.5,
                        background: 'linear-gradient(135deg, #1976d2 0%, #1565c0 100%)',
                      }}
                    >
                      {loading ? 'Searching...' : 'Find Colleges'}
                    </Button>
                  </motion.div>
                )}
              </Box>
            </Box>
          </CardContent>
        </Card>
      </motion.div>
    </Container>
  );
};

export default SearchPage;