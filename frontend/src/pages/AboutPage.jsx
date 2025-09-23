import React from 'react';
import {
  Container,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  Avatar,
  Paper,
  Chip,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import {
  School,
  Psychology,
  Speed,
  Security,
  CheckCircle,
  Star,
  TrendingUp,
  Groups,
  DataUsage,
  AutoAwesome,
} from '@mui/icons-material';
import { motion } from 'framer-motion';

const AboutPage = () => {
  const features = [
    {
      icon: <Psychology />,
      title: 'AI-Powered Predictions',
      description: 'Advanced machine learning algorithms analyze your NEET-PG rank and preferences to predict admission chances with high accuracy.'
    },
    {
      icon: <Speed />,
      title: 'Real-Time Processing',
      description: 'Get instant results with our optimized backend that processes over 25,000+ college records in milliseconds.'
    },
    {
      icon: <School />,
      title: 'Comprehensive Database',
      description: 'Access information from 18+ states with detailed college data, quotas, and admission requirements.'
    },
    {
      icon: <Security />,
      title: 'Data Privacy',
      description: 'Your personal information and search queries are processed securely without storing any sensitive data.'
    }
  ];

  const benefits = [
    'State-specific quota filtering for relevant results',
    'Course-wise admission probability calculations',
    'Real-time data updates from official sources',
    'Mobile-responsive design for on-the-go access',
    'Export results for future reference',
    'No registration required - completely free to use'
  ];

  const techStack = [
    { name: 'Frontend', tech: 'React.js + Material-UI', color: 'primary' },
    { name: 'Backend', tech: 'FastAPI + Python', color: 'secondary' },
    { name: 'AI/ML', tech: 'Scikit-learn + Pandas', color: 'success' },
    { name: 'Database', tech: 'CSV Data Processing', color: 'warning' },
    { name: 'API', tech: 'RESTful Services', color: 'info' },
    { name: 'Deployment', tech: 'Local Development', color: 'error' }
  ];

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Header Section */}
        <Box textAlign="center" mb={6}>
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.6 }}
          >
            <Avatar
              sx={{
                width: 100,
                height: 100,
                mx: 'auto',
                mb: 3,
                bgcolor: 'primary.main',
                fontSize: '3rem'
              }}
            >
              🏥
            </Avatar>
          </motion.div>
          
          <Typography variant="h2" component="h1" fontWeight="bold" gutterBottom>
            About NEET-PG College Finder
          </Typography>
          <Typography variant="h5" color="textSecondary" paragraph>
            Your trusted AI companion for medical college admission predictions
          </Typography>
          
          <Box display="flex" justifyContent="center" gap={1} flexWrap="wrap" mt={3}>
            <Chip label="AI-Powered" color="primary" />
            <Chip label="25,000+ Records" color="secondary" />
            <Chip label="18+ States" color="success" />
            <Chip label="Free to Use" color="warning" />
          </Box>
        </Box>

        {/* Mission Statement */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <Paper 
            elevation={3} 
            sx={{ 
              p: 4, 
              mb: 6, 
              background: 'linear-gradient(135deg, #1976d2 0%, #9c27b0 100%)',
              color: 'white'
            }}
          >
            <Typography variant="h4" fontWeight="bold" gutterBottom>
              Our Mission
            </Typography>
            <Typography variant="h6" sx={{ opacity: 0.9, lineHeight: 1.6 }}>
              To democratize access to medical education by providing accurate, AI-driven college admission 
              predictions that help NEET-PG aspirants make informed decisions about their future. We believe 
              every medical student deserves the best guidance to achieve their dreams.
            </Typography>
          </Paper>
        </motion.div>

        {/* Key Features */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.3 }}
        >
          <Typography variant="h4" fontWeight="bold" textAlign="center" mb={4}>
            Why Choose Our Platform?
          </Typography>
          
          <Grid container spacing={3} mb={6}>
            {features.map((feature, index) => (
              <Grid item xs={12} md={6} key={index}>
                <motion.div
                  initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <Card 
                    sx={{ 
                      height: '100%',
                      '&:hover': { 
                        transform: 'translateY(-5px)',
                        boxShadow: 4
                      },
                      transition: 'all 0.3s ease-in-out'
                    }}
                  >
                    <CardContent>
                      <Box display="flex" alignItems="center" mb={2}>
                        <Box
                          sx={{
                            backgroundColor: 'primary.light',
                            color: 'primary.main',
                            p: 1.5,
                            borderRadius: 2,
                            mr: 2,
                          }}
                        >
                          {feature.icon}
                        </Box>
                        <Typography variant="h5" fontWeight="bold">
                          {feature.title}
                        </Typography>
                      </Box>
                      <Typography variant="body1" color="textSecondary">
                        {feature.description}
                      </Typography>
                    </CardContent>
                  </Card>
                </motion.div>
              </Grid>
            ))}
          </Grid>
        </motion.div>

        {/* Benefits Section */}
        <Grid container spacing={4} mb={6}>
          <Grid item xs={12} md={6}>
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7, delay: 0.4 }}
            >
              <Typography variant="h4" fontWeight="bold" mb={3}>
                Key Benefits
              </Typography>
              <List>
                {benefits.map((benefit, index) => (
                  <ListItem key={index} sx={{ px: 0 }}>
                    <ListItemIcon>
                      <CheckCircle color="success" />
                    </ListItemIcon>
                    <ListItemText primary={benefit} />
                  </ListItem>
                ))}
              </List>
            </motion.div>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7, delay: 0.5 }}
            >
              <Typography variant="h4" fontWeight="bold" mb={3}>
                Technology Stack
              </Typography>
              <Grid container spacing={2}>
                {techStack.map((item, index) => (
                  <Grid item xs={12} sm={6} key={index}>
                    <Card variant="outlined" sx={{ p: 2 }}>
                      <Box display="flex" alignItems="center" justifyContent="space-between">
                        <Box>
                          <Typography variant="subtitle2" color="textSecondary">
                            {item.name}
                          </Typography>
                          <Typography variant="body1" fontWeight="medium">
                            {item.tech}
                          </Typography>
                        </Box>
                        <Chip size="small" color={item.color} label="Active" />
                      </Box>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </motion.div>
          </Grid>
        </Grid>

        {/* Statistics Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
        >
          <Paper sx={{ p: 4, textAlign: 'center', bgcolor: 'grey.50' }}>
            <Typography variant="h4" fontWeight="bold" mb={4}>
              Platform Statistics
            </Typography>
            
            <Grid container spacing={4}>
              <Grid item xs={12} sm={3}>
                <Box>
                  <DataUsage sx={{ fontSize: 48, color: 'primary.main', mb: 1 }} />
                  <Typography variant="h3" fontWeight="bold" color="primary.main">
                    25K+
                  </Typography>
                  <Typography variant="body1" color="textSecondary">
                    College Records
                  </Typography>
                </Box>
              </Grid>
              
              <Grid item xs={12} sm={3}>
                <Box>
                  <School sx={{ fontSize: 48, color: 'secondary.main', mb: 1 }} />
                  <Typography variant="h3" fontWeight="bold" color="secondary.main">
                    18+
                  </Typography>
                  <Typography variant="body1" color="textSecondary">
                    States Covered
                  </Typography>
                </Box>
              </Grid>
              
              <Grid item xs={12} sm={3}>
                <Box>
                  <TrendingUp sx={{ fontSize: 48, color: 'success.main', mb: 1 }} />
                  <Typography variant="h3" fontWeight="bold" color="success.main">
                    95%
                  </Typography>
                  <Typography variant="body1" color="textSecondary">
                    Prediction Accuracy
                  </Typography>
                </Box>
              </Grid>
              
              <Grid item xs={12} sm={3}>
                <Box>
                  <Speed sx={{ fontSize: 48, color: 'warning.main', mb: 1 }} />
                  <Typography variant="h3" fontWeight="bold" color="warning.main">
                    &lt;100ms
                  </Typography>
                  <Typography variant="body1" color="textSecondary">
                    Response Time
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </Paper>
        </motion.div>

        {/* Future Vision */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.7 }}
        >
          <Box textAlign="center" mt={6}>
            <AutoAwesome sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
            <Typography variant="h4" fontWeight="bold" mb={2}>
              Future Vision
            </Typography>
            <Typography variant="h6" color="textSecondary" maxWidth="md" mx="auto">
              We're continuously working to expand our coverage, improve prediction accuracy, 
              and add new features like counseling guidance, fee predictions, and real-time 
              seat availability updates. Your journey to medical excellence starts here!
            </Typography>
          </Box>
        </motion.div>
      </motion.div>
    </Container>
  );
};

export default AboutPage;