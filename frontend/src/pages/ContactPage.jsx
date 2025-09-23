import React, { useState } from 'react';
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Box,
  TextField,
  Button,
  Paper,
  Alert,
  Snackbar,
  Divider,
  IconButton,
  Chip,
} from '@mui/material';
import {
  Email,
  Phone,
  LocationOn,
  GitHub,
  LinkedIn,
  Twitter,
  Send,
  ContactSupport,
  BugReport,
  Lightbulb,
  Help,
} from '@mui/icons-material';
import { motion } from 'framer-motion';

const ContactPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
    type: 'general'
  });
  const [showSuccess, setShowSuccess] = useState(false);

  const handleInputChange = (field) => (event) => {
    setFormData(prev => ({
      ...prev,
      [field]: event.target.value
    }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    // In a real application, this would send the form data to a backend
    console.log('Contact form submitted:', formData);
    setShowSuccess(true);
    
    // Reset form
    setFormData({
      name: '',
      email: '',
      subject: '',
      message: '',
      type: 'general'
    });
  };

  const contactInfo = [
    {
      icon: <Email />,
      title: 'Email',
      details: 'contact@alladmission.co.in',
      description: 'Send us an email anytime'
    },
    {
      icon: <Phone />,
      title: 'Phone',
      details: '+91-8565001261',
      description: 'Mon-Sat from 10am to 6pm'
    },
    {
      icon: <LocationOn />,
      title: 'Location',
      details: 'Kakadeo, Kanpur, UP-208005, India',
      description: 'Serving medical students nationwide'
    }
  ];

  const socialLinks = [
    { icon: <GitHub />, name: 'GitHub', url: '#', color: '#333' },
    { icon: <LinkedIn />, name: 'LinkedIn', url: '#', color: '#0077b5' },
    { icon: <Twitter />, name: 'Twitter', url: '#', color: '#1da1f2' },
  ];

  const messageTypes = [
    { value: 'general', label: 'General Inquiry', icon: <Help />, color: 'primary' },
    { value: 'bug', label: 'Bug Report', icon: <BugReport />, color: 'error' },
    { value: 'feature', label: 'Feature Request', icon: <Lightbulb />, color: 'success' },
    { value: 'support', label: 'Technical Support', icon: <ContactSupport />, color: 'warning' }
  ];

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Header */}
        <Box textAlign="center" mb={6}>
          <ContactSupport sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
          <Typography variant="h2" component="h1" fontWeight="bold" gutterBottom>
            Get in Touch
          </Typography>
          <Typography variant="h5" color="textSecondary" paragraph>
            We'd love to hear from you! Send us a message and we'll respond as soon as possible.
          </Typography>
        </Box>

        <Grid container spacing={6}>
          {/* Contact Form */}
          <Grid item xs={12} md={8}>
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <Card elevation={3}>
                <CardContent sx={{ p: 4 }}>
                  <Typography variant="h4" fontWeight="bold" mb={3}>
                    Send us a Message
                  </Typography>
                  
                  {/* Message Type Selection */}
                  <Box mb={3}>
                    <Typography variant="subtitle1" fontWeight="medium" mb={2}>
                      What can we help you with?
                    </Typography>
                    <Box display="flex" flexWrap="wrap" gap={1}>
                      {messageTypes.map((type) => (
                        <Chip
                          key={type.value}
                          icon={type.icon}
                          label={type.label}
                          color={formData.type === type.value ? type.color : 'default'}
                          variant={formData.type === type.value ? 'filled' : 'outlined'}
                          onClick={() => setFormData(prev => ({ ...prev, type: type.value }))}
                          sx={{ cursor: 'pointer' }}
                        />
                      ))}
                    </Box>
                  </Box>

                  <Divider sx={{ my: 3 }} />

                  <form onSubmit={handleSubmit}>
                    <Grid container spacing={3}>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          label="Your Name"
                          value={formData.name}
                          onChange={handleInputChange('name')}
                          required
                          variant="outlined"
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          label="Email Address"
                          type="email"
                          value={formData.email}
                          onChange={handleInputChange('email')}
                          required
                          variant="outlined"
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <TextField
                          fullWidth
                          label="Subject"
                          value={formData.subject}
                          onChange={handleInputChange('subject')}
                          required
                          variant="outlined"
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <TextField
                          fullWidth
                          label="Message"
                          multiline
                          rows={6}
                          value={formData.message}
                          onChange={handleInputChange('message')}
                          required
                          variant="outlined"
                          placeholder="Tell us more about your question or feedback..."
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <Button
                          type="submit"
                          variant="contained"
                          size="large"
                          startIcon={<Send />}
                          sx={{ minWidth: 160 }}
                        >
                          Send Message
                        </Button>
                      </Grid>
                    </Grid>
                  </form>
                </CardContent>
              </Card>
            </motion.div>
          </Grid>

          {/* Contact Information */}
          <Grid item xs={12} md={4}>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <Typography variant="h4" fontWeight="bold" mb={3}>
                Contact Information
              </Typography>
              
              {contactInfo.map((info, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                >
                  <Card sx={{ mb: 2, '&:hover': { boxShadow: 2 }, transition: 'box-shadow 0.3s' }}>
                    <CardContent>
                      <Box display="flex" alignItems="center" mb={1}>
                        <Box
                          sx={{
                            backgroundColor: 'primary.light',
                            color: 'primary.main',
                            p: 1,
                            borderRadius: 1,
                            mr: 2,
                          }}
                        >
                          {info.icon}
                        </Box>
                        <Typography variant="h6" fontWeight="bold">
                          {info.title}
                        </Typography>
                      </Box>
                      <Typography variant="body1" fontWeight="medium" color="primary.main">
                        {info.details}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        {info.description}
                      </Typography>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}

              {/* Social Links */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.5 }}
              >
                <Paper sx={{ p: 3, mt: 3 }}>
                  <Typography variant="h6" fontWeight="bold" mb={2}>
                    Follow Us
                  </Typography>
                  <Box display="flex" gap={1}>
                    {socialLinks.map((social, index) => (
                      <motion.div
                        key={social.name}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <IconButton
                          sx={{
                            backgroundColor: social.color,
                            color: 'white',
                            '&:hover': {
                              backgroundColor: social.color,
                              opacity: 0.8,
                            },
                          }}
                          size="large"
                        >
                          {social.icon}
                        </IconButton>
                      </motion.div>
                    ))}
                  </Box>
                  <Typography variant="body2" color="textSecondary" mt={2}>
                    Stay updated with the latest features and announcements
                  </Typography>
                </Paper>
              </motion.div>

              {/* FAQ Section */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.7 }}
              >
                <Paper sx={{ p: 3, mt: 3, bgcolor: 'background.paper' }}>
                  <Typography variant="h6" fontWeight="bold" mb={2}>
                    Quick Questions?
                  </Typography>
                  <Typography variant="body2" color="textSecondary" paragraph>
                    Check out our frequently asked questions or browse the documentation for immediate answers.
                  </Typography>
                  <Box display="flex" gap={1}>
                    <Button variant="outlined" size="small">
                      FAQ
                    </Button>
                    <Button variant="outlined" size="small">
                      Documentation
                    </Button>
                  </Box>
                </Paper>
              </motion.div>
            </motion.div>
          </Grid>
        </Grid>

        {/* Success Message */}
        <Snackbar
          open={showSuccess}
          autoHideDuration={6000}
          onClose={() => setShowSuccess(false)}
        >
          <Alert severity="success" onClose={() => setShowSuccess(false)}>
            Thank you for your message! We'll get back to you soon.
          </Alert>
        </Snackbar>

        {/* Additional Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
        >
          <Paper sx={{ p: 4, mt: 6, textAlign: 'center', bgcolor: 'primary.main', color: 'white' }}>
            <Typography variant="h5" fontWeight="bold" mb={2}>
              Need Immediate Help?
            </Typography>
            <Typography variant="body1" sx={{ opacity: 0.9, mb: 3 }}>
              Our AI-powered system is available 24/7 to help you find the right medical colleges. 
              Start your search now and get instant predictions!
            </Typography>
            <Button
              variant="contained"
              size="large"
              sx={{
                bgcolor: 'white',
                color: 'primary.main',
                '&:hover': {
                  bgcolor: 'grey.100',
                }
              }}
            >
              Try College Finder
            </Button>
          </Paper>
        </motion.div>
      </motion.div>
    </Container>
  );
};

export default ContactPage;