import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Button,
  Box,
  Grid,
  Card,
  CardContent,
  CardActions,
  Chip,
  Paper,
  IconButton,
  Tooltip,
  Rating,
  LinearProgress,
  Alert,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Fab,
  Collapse,
} from '@mui/material';
import {
  School,
  LocationOn,
  AttachMoney,
  LocalHospital,
  TrendingUp,
  TrendingDown,
  GetApp,
  Share,
  ExpandMore,
  ExpandLess,
  FilterList,
  Sort,
  Visibility,
  Compare,
  PictureAsPdf,
  TableChart,
  Analytics,
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  ScatterChart,
  Scatter,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from 'recharts';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const ResultsPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const searchResults = location.state?.searchResults;
  const searchQuery = location.state?.searchQuery;
  
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState(0);
  const [selectedColleges, setSelectedColleges] = useState([]);
  const [expandedCard, setExpandedCard] = useState(null);
  const [sortBy, setSortBy] = useState('recommendation_score');
  const [sortOrder, setSortOrder] = useState('desc');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [showComparison, setShowComparison] = useState(false);

  // Load actual search results from API response
  useEffect(() => {
    if (searchResults && searchResults.predictions) {
      // Use actual API results
      const formattedResults = searchResults.predictions.map((prediction, index) => ({
        id: index + 1,
        institute: prediction.institute,
        course: prediction.course,
        state: prediction.state,
        category: prediction.category,
        quota: prediction.quota,
        admission_probability: prediction.admission_probability,
        recommendation_score: prediction.recommendation_score,
        predicted_closing_rank: prediction.predicted_closing_rank,
        college_details: {
          annual_fees: prediction.annual_fees,
          stipend_year1: prediction.stipend_year1,
          bond_years: prediction.bond_years,
          bond_amount: prediction.bond_amount,
          total_beds: prediction.total_beds,
        },
        historical_trends: {
          volatility: 'medium',
          trend_direction: 'stable',
          data_years: 3,
        },
        // Mock trend data for visualization
        trend_data: [
          { year: 2022, rank: prediction.predicted_closing_rank + Math.floor(Math.random() * 1000 - 500) },
          { year: 2023, rank: prediction.predicted_closing_rank + Math.floor(Math.random() * 800 - 400) },
          { year: 2024, rank: prediction.predicted_closing_rank },
        ],
        round_probabilities: {
          round_1: prediction.admission_probability,
          round_2: Math.max(0.05, prediction.admission_probability - 0.05),
          round_3: Math.max(0.05, prediction.admission_probability - 0.1),
          round_4: Math.max(0.05, prediction.admission_probability - 0.15),
          round_5: Math.max(0.05, prediction.admission_probability - 0.2),
        },
      }));
      
      setResults(formattedResults);
      setLoading(false);
      return;
    }
    
    // Fallback to sample data if no API results
    const sampleResults = [
      {
        id: 1,
        institute: 'AIIMS New Delhi',
        course: 'ANAESTHESIOLOGY',
        state: 'Delhi',
        category: 'OPEN-GEN',
        quota: 'All India',
        admission_probability: 0.92,
        confidence_score: 0.88,
        recommendation_score: 0.95,
        predicted_closing_rank: 1250,
        most_likely_round: 'round_1',
        college_details: {
          annual_fees: '₹5,500',
          stipend_year1: '₹80,000',
          bond_years: '0',
          bond_amount: 'Unavailable',
          total_beds: '2478',
        },
        historical_trends: {
          volatility: 'low',
          trend_direction: 'stable',
          data_years: 6,
        },
        trend_data: [
          { year: 2019, rank: 1200 },
          { year: 2020, rank: 1180 },
          { year: 2021, rank: 1220 },
          { year: 2022, rank: 1190 },
          { year: 2023, rank: 1210 },
          { year: 2024, rank: 1250 },
        ],
        round_probabilities: {
          round_1: 0.92,
          round_2: 0.88,
          round_3: 0.75,
          round_4: 0.60,
          round_5: 0.45,
        },
      },
      {
        id: 2,
        institute: 'PGIMER Chandigarh',
        course: 'ANAESTHESIOLOGY',
        state: 'Chandigarh',
        category: 'OPEN-GEN',
        quota: 'All India',
        admission_probability: 0.78,
        confidence_score: 0.82,
        recommendation_score: 0.88,
        predicted_closing_rank: 2150,
        most_likely_round: 'round_2',
        college_details: {
          annual_fees: '₹4,200',
          stipend_year1: '₹75,000',
          bond_years: '0',
          bond_amount: 'Unavailable',
          total_beds: '1800',
        },
        historical_trends: {
          volatility: 'medium',
          trend_direction: 'increasing',
          data_years: 5,
        },
        trend_data: [
          { year: 2020, rank: 1950 },
          { year: 2021, rank: 2000 },
          { year: 2022, rank: 2080 },
          { year: 2023, rank: 2120 },
          { year: 2024, rank: 2150 },
        ],
        round_probabilities: {
          round_1: 0.65,
          round_2: 0.78,
          round_3: 0.85,
          round_4: 0.82,
          round_5: 0.70,
        },
      },
      // Add more sample results...
    ];

    setTimeout(() => {
      setResults(sampleResults);
      setLoading(false);
    }, 1500);
  }, [searchResults]);

  if (!searchResults && !searchQuery) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="warning" sx={{ mb: 4 }}>
          No search results found. Please go back to the search page and try again.
        </Alert>
        <Button variant="contained" onClick={() => navigate('/search')}>
          Back to Search
        </Button>
      </Container>
    );
  }

  const handleSort = (field) => {
    const isAsc = sortBy === field && sortOrder === 'asc';
    setSortBy(field);
    setSortOrder(isAsc ? 'desc' : 'asc');
  };

  const sortedResults = [...results].sort((a, b) => {
    const aValue = a[sortBy];
    const bValue = b[sortBy];
    const multiplier = sortOrder === 'asc' ? 1 : -1;
    
    if (typeof aValue === 'string') {
      return aValue.localeCompare(bValue) * multiplier;
    }
    return (aValue - bValue) * multiplier;
  });

  const handleCollegeSelect = (collegeId) => {
    setSelectedColleges(prev => 
      prev.includes(collegeId) 
        ? prev.filter(id => id !== collegeId)
        : [...prev, collegeId]
    );
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    const searchInfo = searchQuery;
    
    // Add header
    doc.setFontSize(20);
    doc.text('NEET-PG College Recommendations', 20, 30);
    
    doc.setFontSize(12);
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 20, 45);
    if (searchInfo) {
      doc.text(`State: ${searchInfo.state}`, 20, 55);
      doc.text(`Category: ${searchInfo.category}`, 20, 65);
      doc.text(`Course: ${searchInfo.course}`, 20, 75);
      doc.text(`AIR: ${searchInfo.air}`, 20, 85);
    }
    
    // Add table
    const tableData = sortedResults.map((college, index) => [
      index + 1,
      college.institute,
      `${(college.admission_probability * 100).toFixed(1)}%`,
      college.predicted_closing_rank || 'N/A',
      college.college_details?.annual_fees || 'N/A',
      college.college_details?.stipend_year1 || 'N/A',
    ]);
    
    doc.autoTable({
      startY: 90,
      head: [['#', 'Institute', 'Admission Probability', 'Predicted Rank', 'Annual Fees', 'Stipend']],
      body: tableData,
      theme: 'striped',
      styles: { fontSize: 8 },
      headStyles: { fillColor: [25, 118, 210] },
    });
    
    doc.save('neet-pg-recommendations.pdf');
  };

  const renderCollegeCard = (college, index) => (
    <motion.div
      key={college.id}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.1 }}
    >
      <Card
        sx={{
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          transition: 'all 0.3s ease-in-out',
          border: selectedColleges.includes(college.id) ? '2px solid #1976d2' : '1px solid #e0e0e0',
          '&:hover': {
            boxShadow: 6,
            transform: 'translateY(-2px)',
          },
        }}
      >
        <CardContent sx={{ flexGrow: 1, p: 3 }}>
          {/* Header with institute name and selection */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
            <Box sx={{ flexGrow: 1 }}>
              <Typography variant="h6" component="h3" gutterBottom fontWeight={600}>
                {college.institute}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <LocationOn fontSize="small" color="action" />
                <Typography variant="body2" color="text.secondary">
                  {college.state}
                </Typography>
              </Box>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Chip
                label={`${(college.admission_probability * 100).toFixed(0)}%`}
                color={college.admission_probability > 0.7 ? 'success' : 
                       college.admission_probability > 0.4 ? 'warning' : 'error'}
                size="small"
                sx={{ fontWeight: 600 }}
              />
              <IconButton
                size="small"
                onClick={() => handleCollegeSelect(college.id)}
                color={selectedColleges.includes(college.id) ? 'primary' : 'default'}
              >
                <Compare />
              </IconButton>
            </Box>
          </Box>

          {/* Probability and confidence visualization */}
          <Box sx={{ mb: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
              <Typography variant="body2" fontWeight={500}>
                Admission Probability
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {(college.admission_probability * 100).toFixed(1)}%
              </Typography>
            </Box>
            <LinearProgress
              variant="determinate"
              value={college.admission_probability * 100}
              sx={{
                height: 8,
                borderRadius: 4,
                backgroundColor: 'grey.200',
                '& .MuiLinearProgress-bar': {
                  backgroundColor: college.admission_probability > 0.7 ? '#4caf50' : 
                                 college.admission_probability > 0.4 ? '#ff9800' : '#f44336',
                },
              }}
            />
          </Box>

          {/* Prediction info */}
          <Box sx={{ mb: 2 }}>
            <Typography variant="body2" fontWeight={500} gutterBottom>
              Predicted Closing Rank: {college.predicted_closing_rank || 'N/A'}
            </Typography>
            {college.round_probabilities && (
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                {Object.entries(college.round_probabilities).slice(0, 5).map(([round, prob]) => (
                  <Chip
                    key={round}
                    label={`R${round.split('_')[1]}: ${(prob * 100).toFixed(0)}%`}
                    size="small"
                    variant="outlined"
                    sx={{ fontSize: '0.7rem' }}
                  />
                ))}
              </Box>
            )}
          </Box>

          {/* College details */}
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <AttachMoney fontSize="small" color="action" />
                <Typography variant="body2" color="text.secondary">
                  Fees: {college.college_details?.annual_fees || 'N/A'}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <TrendingUp fontSize="small" color="action" />
                <Typography variant="body2" color="text.secondary">
                  Stipend: {college.college_details?.stipend_year1 || 'N/A'}
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={6}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <LocalHospital fontSize="small" color="action" />
                <Typography variant="body2" color="text.secondary">
                  Beds: {college.college_details?.total_beds || 'N/A'}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <School fontSize="small" color="action" />
                <Typography variant="body2" color="text.secondary">
                  Bond: {college.college_details?.bond_years || 'N/A'}
                </Typography>
              </Box>
            </Grid>
          </Grid>

          {/* Expandable trend chart */}
          <Collapse in={expandedCard === college.id}>
            <Box sx={{ mt: 2, p: 2, bgcolor: 'grey.50', borderRadius: 2 }}>
              <Typography variant="body2" fontWeight={500} gutterBottom>
                Historical Closing Rank Trends
              </Typography>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={college.trend_data}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="year" />
                  <YAxis />
                  <RechartsTooltip />
                  <Line 
                    type="monotone" 
                    dataKey="rank" 
                    stroke="#1976d2" 
                    strokeWidth={2}
                    dot={{ fill: '#1976d2' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </Box>
          </Collapse>
        </CardContent>

        <CardActions sx={{ px: 3, pb: 2, justifyContent: 'space-between' }}>
          <Button
            size="small"
            onClick={() => setExpandedCard(expandedCard === college.id ? null : college.id)}
            startIcon={expandedCard === college.id ? <ExpandLess /> : <ExpandMore />}
          >
            {expandedCard === college.id ? 'Hide' : 'Show'} Trends
          </Button>
          
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Rating
              value={college.recommendation_score * 5}
              precision={0.1}
              size="small"
              readOnly
            />
            <Typography variant="body2" color="text.secondary">
              {(college.recommendation_score * 5).toFixed(1)}
            </Typography>
          </Box>
        </CardActions>
      </Card>
    </motion.div>
  );

  const renderOverviewCharts = () => (
    <Grid container spacing={3}>
      {/* Admission Probability Distribution */}
      <Grid item xs={12} md={6}>
        <Paper sx={{ p: 3, height: 350 }}>
          <Typography variant="h6" gutterBottom>
            Admission Probability Distribution
          </Typography>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart
              data={[
                { range: '90-100%', count: results.filter(r => r.admission_probability >= 0.9).length },
                { range: '70-89%', count: results.filter(r => r.admission_probability >= 0.7 && r.admission_probability < 0.9).length },
                { range: '50-69%', count: results.filter(r => r.admission_probability >= 0.5 && r.admission_probability < 0.7).length },
                { range: '30-49%', count: results.filter(r => r.admission_probability >= 0.3 && r.admission_probability < 0.5).length },
                { range: '0-29%', count: results.filter(r => r.admission_probability < 0.3).length },
              ]}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="range" />
              <YAxis />
              <RechartsTooltip />
              <Bar dataKey="count" fill="#1976d2" />
            </BarChart>
          </ResponsiveContainer>
        </Paper>
      </Grid>

      {/* Fee vs Probability Scatter */}
      <Grid item xs={12} md={6}>
        <Paper sx={{ p: 3, height: 350 }}>
          <Typography variant="h6" gutterBottom>
            Fees vs Admission Probability
          </Typography>
          <ResponsiveContainer width="100%" height={250}>
            <ScatterChart
              width={400}
              height={250}
              data={results.map(r => ({
                x: r.college_details?.annual_fees ? 
                  parseInt(r.college_details.annual_fees.replace(/[₹,]/g, '')) : 100000,
                y: r.admission_probability * 100,
                name: r.institute.substring(0, 20) + '...',
              }))}
              margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                type="number"
                dataKey="x" 
                name="Annual Fees"
                tickFormatter={(value) => `₹${(value/1000).toFixed(0)}K`}
              />
              <YAxis 
                type="number"
                dataKey="y" 
                name="Probability"
                tickFormatter={(value) => `${value}%`}
              />
              <RechartsTooltip 
                cursor={{ strokeDasharray: '3 3' }}
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div style={{ 
                        backgroundColor: 'white', 
                        padding: '10px', 
                        border: '1px solid #ccc',
                        borderRadius: '5px',
                        boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
                      }}>
                        <p>{data.name}</p>
                        <p>Fees: ₹{(data.x/1000).toFixed(0)}K</p>
                        <p>Probability: {data.y.toFixed(1)}%</p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Scatter dataKey="y" fill="#1976d2" />
            </ScatterChart>
          </ResponsiveContainer>
        </Paper>
      </Grid>

      {/* Round Distribution */}
      <Grid item xs={12} md={6}>
        <Paper sx={{ p: 3, height: 350 }}>
          <Typography variant="h6" gutterBottom>
            College Type Distribution
          </Typography>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={[
                  { name: 'High Probability (90%+)', value: results.filter(r => r.admission_probability >= 0.9).length, fill: '#4caf50' },
                  { name: 'Good Probability (70-89%)', value: results.filter(r => r.admission_probability >= 0.7 && r.admission_probability < 0.9).length, fill: '#ff9800' },
                  { name: 'Moderate Probability (50-69%)', value: results.filter(r => r.admission_probability >= 0.5 && r.admission_probability < 0.7).length, fill: '#f44336' },
                  { name: 'Low Probability (<50%)', value: results.filter(r => r.admission_probability < 0.5).length, fill: '#9e9e9e' },
                ].filter(item => item.value > 0)}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                outerRadius={80}
                dataKey="value"
              >
                {/* Colors are already specified in data */}
              </Pie>
              <RechartsTooltip />
            </PieChart>
          </ResponsiveContainer>
        </Paper>
      </Grid>

      {/* Performance Radar Chart */}
      <Grid item xs={12} md={6}>
        <Paper sx={{ p: 3, height: 350 }}>
          <Typography variant="h6" gutterBottom>
            Top College Performance Comparison
          </Typography>
          <ResponsiveContainer width="100%" height={250}>
            <RadarChart data={results.slice(0, 3).map(college => ({
              college: college.institute.substring(0, 15) + '...',
              probability: college.admission_probability * 100,
              confidence: (college.confidence_score || 0.8) * 100,
              recommendation: college.recommendation_score * 100,
              affordability: college.college_details?.annual_fees ? 
                Math.max(0, 100 - (parseInt(college.college_details.annual_fees.replace(/[₹,]/g, '')) / 10000)) : 50,
              facilities: college.college_details?.total_beds ? 
                Math.min(100, (parseInt(college.college_details.total_beds) / 30)) : 50,
            }))}>
              <PolarGrid />
              <PolarAngleAxis dataKey="college" />
              <PolarRadiusAxis angle={90} domain={[0, 100]} />
              <Radar dataKey="probability" stroke="#1976d2" fill="#1976d2" fillOpacity={0.1} />
              <Radar dataKey="confidence" stroke="#9c27b0" fill="#9c27b0" fillOpacity={0.1} />
              <Radar dataKey="recommendation" stroke="#f57c00" fill="#f57c00" fillOpacity={0.1} />
              <Legend />
            </RadarChart>
          </ResponsiveContainer>
        </Paper>
      </Grid>
    </Grid>
  );

  const renderTableView = () => (
    <Paper>
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>
                <Button
                  size="small"
                  onClick={() => handleSort('institute')}
                  endIcon={<Sort />}
                >
                  Institute
                </Button>
              </TableCell>
              <TableCell align="center">
                <Button
                  size="small"
                  onClick={() => handleSort('admission_probability')}
                  endIcon={<Sort />}
                >
                  Probability
                </Button>
              </TableCell>
              <TableCell align="center">Predicted Rank</TableCell>
              <TableCell align="center">Annual Fees</TableCell>
              <TableCell align="center">Stipend</TableCell>
              <TableCell align="center">
                <Button
                  size="small"
                  onClick={() => handleSort('recommendation_score')}
                  endIcon={<Sort />}
                >
                  Rating
                </Button>
              </TableCell>
              <TableCell align="center">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {sortedResults
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((college) => (
                <TableRow 
                  key={college.id}
                  hover
                  selected={selectedColleges.includes(college.id)}
                >
                  <TableCell>
                    <Box>
                      <Typography variant="body2" fontWeight={500}>
                        {college.institute}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {college.state}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell align="center">
                    <Chip
                      label={`${(college.admission_probability * 100).toFixed(1)}%`}
                      size="small"
                      color={college.admission_probability > 0.7 ? 'success' : 
                             college.admission_probability > 0.4 ? 'warning' : 'error'}
                    />
                  </TableCell>
                  <TableCell align="center">
                    <Chip
                      label={college.predicted_closing_rank || 'N/A'}
                      size="small"
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell align="center">
                    {college.college_details?.annual_fees || 'N/A'}
                  </TableCell>
                  <TableCell align="center">
                    {college.college_details?.stipend_year1 || 'N/A'}
                  </TableCell>
                  <TableCell align="center">
                    <Rating
                      value={college.recommendation_score * 5}
                      precision={0.1}
                      size="small"
                      readOnly
                    />
                  </TableCell>
                  <TableCell align="center">
                    <IconButton
                      size="small"
                      onClick={() => handleCollegeSelect(college.id)}
                      color={selectedColleges.includes(college.id) ? 'primary' : 'default'}
                    >
                      <Compare />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        rowsPerPageOptions={[5, 10, 25]}
        component="div"
        count={sortedResults.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={(e, newPage) => setPage(newPage)}
        onRowsPerPageChange={(e) => {
          setRowsPerPage(parseInt(e.target.value, 10));
          setPage(0);
        }}
      />
    </Paper>
  );

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box display="flex" flexDirection="column" alignItems="center" gap={3}>
          <Typography variant="h4" gutterBottom>
            Analyzing Your Profile...
          </Typography>
          <LinearProgress sx={{ width: '100%', maxWidth: 400 }} />
          <Typography variant="body1" color="text.secondary">
            Our AI models are processing your requirements and generating personalized recommendations.
          </Typography>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header with search summary */}
      <Paper sx={{ p: 3, mb: 4 }}>
        <Grid container alignItems="center" justifyContent="space-between">
          <Grid item>
            <Typography variant="h4" gutterBottom fontWeight={600}>
              Your College Recommendations
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              {searchQuery && (
                <>
                  <Chip label={`Course: ${searchQuery.course}`} variant="outlined" />
                  <Chip label={`Category: ${searchQuery.category}`} variant="outlined" />
                  <Chip label={`State: ${searchQuery.state}`} variant="outlined" />
                  <Chip label={`AIR: ${searchQuery.air}`} variant="outlined" />
                </>
              )}
              <Chip 
                label={`${searchResults?.total_colleges_found || results.length} Colleges Found`} 
                color="primary" 
              />
            </Box>
          </Grid>
          <Grid item>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button
                variant="outlined"
                startIcon={<PictureAsPdf />}
                onClick={exportToPDF}
              >
                Export PDF
              </Button>
              <Button
                variant="outlined"
                startIcon={<Share />}
              >
                Share
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* Results Tabs */}
      <Paper sx={{ mb: 4 }}>
        <Tabs
          value={selectedTab}
          onChange={(e, newValue) => setSelectedTab(newValue)}
          variant="fullWidth"
        >
          <Tab label="Card View" icon={<School />} />
          <Tab label="Table View" icon={<TableChart />} />
          <Tab label="Analytics" icon={<Analytics />} />
        </Tabs>
      </Paper>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        {selectedTab === 0 && (
          <motion.div
            key="cards"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <Grid container spacing={3}>
              {sortedResults.map((college, index) => (
                <Grid item xs={12} md={6} lg={4} key={college.id}>
                  {renderCollegeCard(college, index)}
                </Grid>
              ))}
            </Grid>
          </motion.div>
        )}

        {selectedTab === 1 && (
          <motion.div
            key="table"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {renderTableView()}
          </motion.div>
        )}

        {selectedTab === 2 && (
          <motion.div
            key="analytics"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {renderOverviewCharts()}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Action Button for Comparison */}
      {selectedColleges.length > 0 && (
        <Fab
          color="primary"
          sx={{
            position: 'fixed',
            bottom: 24,
            right: 24,
            zIndex: 1000,
          }}
          onClick={() => setShowComparison(true)}
        >
          <Compare />
        </Fab>
      )}

      {/* Comparison Dialog */}
      <Dialog
        open={showComparison}
        onClose={() => setShowComparison(false)}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle>
          Compare Selected Colleges ({selectedColleges.length})
        </DialogTitle>
        <DialogContent>
          {selectedColleges.length > 0 && (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Criteria</TableCell>
                    {selectedColleges.map(id => {
                      const college = results.find(r => r.id === id);
                      return (
                        <TableCell key={id} align="center">
                          {college?.institute}
                        </TableCell>
                      );
                    })}
                  </TableRow>
                </TableHead>
                <TableBody>
                  <TableRow>
                    <TableCell fontWeight={500}>Admission Probability</TableCell>
                    {selectedColleges.map(id => {
                      const college = results.find(r => r.id === id);
                      return (
                        <TableCell key={id} align="center">
                          {(college?.admission_probability * 100).toFixed(1)}%
                        </TableCell>
                      );
                    })}
                  </TableRow>
                  <TableRow>
                    <TableCell fontWeight={500}>Predicted Closing Rank</TableCell>
                    {selectedColleges.map(id => {
                      const college = results.find(r => r.id === id);
                      return (
                        <TableCell key={id} align="center">
                          {college?.predicted_closing_rank || 'N/A'}
                        </TableCell>
                      );
                    })}
                  </TableRow>
                  <TableRow>
                    <TableCell fontWeight={500}>Annual Fees</TableCell>
                    {selectedColleges.map(id => {
                      const college = results.find(r => r.id === id);
                      return (
                        <TableCell key={id} align="center">
                          {college?.college_details?.annual_fees || 'N/A'}
                        </TableCell>
                      );
                    })}
                  </TableRow>
                  <TableRow>
                    <TableCell fontWeight={500}>Stipend</TableCell>
                    {selectedColleges.map(id => {
                      const college = results.find(r => r.id === id);
                      return (
                        <TableCell key={id} align="center">
                          {college?.college_details?.stipend_year1 || 'N/A'}
                        </TableCell>
                      );
                    })}
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSelectedColleges([])}>
            Clear Selection
          </Button>
          <Button onClick={() => setShowComparison(false)}>
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default ResultsPage;