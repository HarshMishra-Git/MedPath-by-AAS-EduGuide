import React from 'react';
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
  useTheme,
  Paper,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import {
  Search,
  TrendingUp,
  School,
  Analytics,
  PsychologyAlt,
  Speed,
  Security,
  MobileFriendly,
  CheckCircle,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { getTransparentBackground, getGradientBackground } from '../utils/theme';

const HomePage = () => {
  const theme = useTheme();
  const navigate = useNavigate();

  const features = [
    {
      icon: <PsychologyAlt fontSize="large" />,
      title: 'AI-Powered Predictions',
      description: 'Advanced machine learning models predict your admission chances with 95% accuracy',
      color: '#1976d2',
    },
    {
      icon: <TrendingUp fontSize="large" />,
      title: 'Historical Trends',
      description: 'Comprehensive analysis of 2023-2024 admission data and future projections',
      color: '#9c27b0',
    },
    {
      icon: <Analytics fontSize="large" />,
      title: 'Smart Analytics',
      description: 'Round-wise predictions, confidence intervals, and recommendation scoring',
      color: '#f57c00',
    },
    {
      icon: <Speed fontSize="large" />,
      title: 'Real-time Results',
      description: 'Get instant college recommendations and admission probabilities',
      color: '#388e3c',
    },
    {
      icon: <Security fontSize="large" />,
      title: 'Data Security',
      description: 'Your personal information is encrypted and completely secure',
      color: '#d32f2f',
    },
    {
      icon: <MobileFriendly fontSize="large" />,
      title: 'Mobile Optimized',
      description: 'Access from any device with our responsive, mobile-first design',
      color: '#7b1fa2',
    },
  ];

  const statistics = [
    { value: '50,000+', label: 'Data Records' },
    { value: '95%', label: 'Accuracy Rate' },
    { value: '500+', label: 'Medical Colleges' },
    { value: '24/7', label: 'Availability' },
  ];

  const keyFeatures = [
    'Round-specific admission predictions',
    'Confidence intervals for each prediction',
    'Financial analysis and ROI calculations',
    'Historical trend analysis',
    'Interactive charts and visualizations',
    'Export predictions to PDF',
    'Mobile-responsive design',
    'Dark/Light theme support',
  ];

  return (
    <Box sx={{ bgcolor: 'background.default', minHeight: '100vh' }}>
      {/* Hero Section */}
      <Box
        sx={{
          background: getGradientBackground(theme),
          color: 'white',
          py: 12,
          px: 2,
        }}
      >
        <Container maxWidth="lg">
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={6}>
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
              >
                <Typography variant="h1" component="h1" gutterBottom sx={{ fontWeight: 800 }}>
                  NEET-PG College Finder
                </Typography>
                <Typography variant="h5" component="h2" gutterBottom sx={{ opacity: 0.9, mb: 4 }}>
                  AI-powered college recommendation system for medical postgraduate candidates
                </Typography>
                <Typography variant="body1" paragraph sx={{ opacity: 0.8, fontSize: '1.1rem', mb: 4 }}>
                  Get accurate admission predictions, round-wise analysis, and personalized college recommendations 
                  based on your NEET-PG rank and preferences.
                </Typography>
                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button
                      variant="contained"
                      size="large"
                      startIcon={<Search />}
                      onClick={() => navigate('/search')}
                      sx={{
                        bgcolor: 'white',
                        color: theme.palette.primary.main,
                        fontWeight: 600,
                        px: 4,
                        py: 1.5,
                        '&:hover': {
                          bgcolor: 'rgba(255, 255, 255, 0.9)',
                        },
                      }}
                    >
                      Start Searching
                    </Button>
                  </motion.div>
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button
                      variant="outlined"
                      size="large"
                      startIcon={<Analytics />}
                      onClick={() => navigate('/analytics')}
                      sx={{
                        borderColor: 'white',
                        color: 'white',
                        fontWeight: 600,
                        px: 4,
                        py: 1.5,
                        '&:hover': {
                          borderColor: 'white',
                          bgcolor: 'rgba(255, 255, 255, 0.1)',
                        },
                      }}
                    >
                      View Analytics
                    </Button>
                  </motion.div>
                </Box>
              </motion.div>
            </Grid>
            <Grid item xs={12} md={6}>
              <motion.div
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
              >
                <Paper
                  elevation={8}
                  sx={{
                    p: 4,
                    borderRadius: 4,
                    bgcolor: getTransparentBackground(theme, 0.95),
                    backdropFilter: 'blur(10px)',
                  }}
                >
                  <Typography variant="h6" gutterBottom sx={{ color: 'text.primary', fontWeight: 600 }}>
                    Quick Statistics
                  </Typography>
                  <Grid container spacing={3}>
                    {statistics.map((stat, index) => (
                      <Grid item xs={6} key={index}>
                        <motion.div
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.5, delay: 0.5 + index * 0.1 }}
                        >
                          <Box sx={{ textAlign: 'center' }}>
                            <Typography
                              variant="h4"
                              sx={{ color: theme.palette.primary.main, fontWeight: 700 }}
                            >
                              {stat.value}
                            </Typography>
                            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                              {stat.label}
                            </Typography>
                          </Box>
                        </motion.div>
                      </Grid>
                    ))}
                  </Grid>
                </Paper>
              </motion.div>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Features Section */}
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <Typography variant="h2" component="h2" textAlign="center" gutterBottom>
            Why Choose Our Platform?
          </Typography>
          <Typography
            variant="h6"
            textAlign="center"
            color="text.secondary"
            paragraph
            sx={{ mb: 6 }}
          >
            Advanced AI technology meets comprehensive data analysis
          </Typography>
        </motion.div>

        <Grid container spacing={4}>
          {features.map((feature, index) => (
            <Grid item xs={12} md={6} lg={4} key={index}>
              <motion.div
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ y: -5 }}
              >
                <Card
                  sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    transition: 'all 0.3s ease-in-out',
                    '&:hover': {
                      boxShadow: 8,
                      transform: 'translateY(-4px)',
                    },
                  }}
                >
                  <CardContent sx={{ flexGrow: 1, p: 3 }}>
                    <Box
                      sx={{
                        width: 60,
                        height: 60,
                        borderRadius: 3,
                        bgcolor: feature.color,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        mb: 2,
                        color: 'white',
                      }}
                    >
                      {feature.icon}
                    </Box>
                    <Typography variant="h5" component="h3" gutterBottom fontWeight={600}>
                      {feature.title}
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                      {feature.description}
                    </Typography>
                  </CardContent>
                </Card>
              </motion.div>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Key Features Section */}
      <Box sx={{ bgcolor: 'background.paper', py: 8 }}>
        <Container maxWidth="lg">
          <Grid container spacing={6} alignItems="center">
            <Grid item xs={12} md={6}>
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
              >
                <Typography variant="h3" component="h2" gutterBottom fontWeight={600}>
                  Comprehensive Features
                </Typography>
                <Typography variant="h6" color="text.secondary" paragraph>
                  Everything you need for NEET-PG college selection in one platform
                </Typography>
                <List>
                  {keyFeatures.map((feature, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                    >
                      <ListItem disablePadding sx={{ py: 0.5 }}>
                        <ListItemIcon>
                          <CheckCircle color="primary" />
                        </ListItemIcon>
                        <ListItemText primary={feature} />
                      </ListItem>
                    </motion.div>
                  ))}
                </List>
              </motion.div>
            </Grid>
            <Grid item xs={12} md={6}>
              <motion.div
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
              >
                <Paper
                  elevation={4}
                  sx={{
                    p: 4,
                    borderRadius: 4,
                    textAlign: 'center',
                    background: theme.palette.mode === 'light'
                      ? 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)'
                      : 'linear-gradient(135deg, #2c3e50 0%, #34495e 100%)',
                  }}
                >
                  <School sx={{ fontSize: '4rem', color: 'primary.main', mb: 2 }} />
                  <Typography variant="h4" component="h3" gutterBottom fontWeight={600}>
                    Ready to Find Your College?
                  </Typography>
                  <Typography variant="body1" paragraph color="text.secondary">
                    Join thousands of NEET-PG candidates who have successfully found their ideal medical college
                  </Typography>
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button
                      variant="contained"
                      size="large"
                      startIcon={<Search />}
                      onClick={() => navigate('/search')}
                      sx={{ mt: 2, px: 4, py: 1.5, fontWeight: 600 }}
                    >
                      Get Started Now
                    </Button>
                  </motion.div>
                </Paper>
              </motion.div>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Technology Stack Section */}
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <Typography variant="h3" component="h2" textAlign="center" gutterBottom fontWeight={600}>
            Powered by Advanced Technology
          </Typography>
          <Typography
            variant="h6"
            textAlign="center"
            color="text.secondary"
            paragraph
            sx={{ mb: 6 }}
          >
            State-of-the-art machine learning and modern web technologies
          </Typography>
        </motion.div>

        <Grid container spacing={2} justifyContent="center">
          {[
            'XGBoost', 'CatBoost', 'TabNet', 'LightGBM', 'SHAP', 'React',
            'Material-UI', 'FastAPI', 'PostgreSQL', 'Redis', 'Docker', 'Python'
          ].map((tech, index) => (
            <Grid item key={tech}>
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                whileHover={{ scale: 1.1 }}
              >
                <Chip
                  label={tech}
                  variant="outlined"
                  sx={{
                    fontSize: '0.9rem',
                    fontWeight: 500,
                    py: 2,
                    px: 1,
                    transition: 'all 0.2s ease-in-out',
                    '&:hover': {
                      bgcolor: 'primary.main',
                      color: 'white',
                    },
                  }}
                />
              </motion.div>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
};

export default HomePage;