import React, { useState, useMemo } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { Box, IconButton } from '@mui/material';
import { Brightness4, Brightness7 } from '@mui/icons-material';
import { motion } from 'framer-motion';

// Components
import Navbar from './components/Navbar';
import HomePage from './pages/HomePage';
import SearchPage from './pages/NewSearchPage';
import ResultsPage from './pages/ResultsPage';
import AnalyticsPage from './pages/AnalyticsPage';
import AboutPage from './pages/AboutPage';
import ContactPage from './pages/ContactPage';

// Theme configuration
const getDesignTokens = (mode) => ({
  palette: {
    mode,
    ...(mode === 'light'
      ? {
          // Light mode colors
          primary: {
            main: '#1976d2',
            light: '#42a5f5',
            dark: '#1565c0',
          },
          secondary: {
            main: '#9c27b0',
            light: '#ba68c8',
            dark: '#7b1fa2',
          },
          background: {
            default: '#f5f5f5',
            paper: '#ffffff',
          },
          text: {
            primary: '#212121',
            secondary: '#757575',
          },
        }
      : {
          // Dark mode colors
          primary: {
            main: '#90caf9',
            light: '#e3f2fd',
            dark: '#42a5f5',
          },
          secondary: {
            main: '#ce93d8',
            light: '#f3e5f5',
            dark: '#ab47bc',
          },
          background: {
            default: '#0a0a0a',
            paper: '#1a1a1a',
          },
          text: {
            primary: '#ffffff',
            secondary: '#b0b0b0',
          },
          action: {
            hover: 'rgba(255, 255, 255, 0.08)',
            selected: 'rgba(255, 255, 255, 0.12)',
          },
        }),
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontWeight: 700,
      fontSize: '2.5rem',
      lineHeight: 1.2,
    },
    h2: {
      fontWeight: 600,
      fontSize: '2rem',
      lineHeight: 1.3,
    },
    h3: {
      fontWeight: 600,
      fontSize: '1.5rem',
      lineHeight: 1.4,
    },
    h4: {
      fontWeight: 500,
      fontSize: '1.25rem',
      lineHeight: 1.4,
    },
    h5: {
      fontWeight: 500,
      fontSize: '1.125rem',
      lineHeight: 1.4,
    },
    h6: {
      fontWeight: 500,
      fontSize: '1rem',
      lineHeight: 1.4,
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: 8,
          fontWeight: 600,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: ({ theme }) => ({
          borderRadius: 12,
          boxShadow: theme.palette.mode === 'light'
            ? '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
            : '0 4px 6px -1px rgba(0, 0, 0, 0.3), 0 2px 4px -1px rgba(0, 0, 0, 0.2)',
          backgroundColor: theme.palette.background.paper,
        }),
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: ({ theme }) => ({
          backgroundColor: theme.palette.background.paper,
          backgroundImage: 'none', // Remove default MUI gradient in dark mode
        }),
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          fontWeight: 500,
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: ({ theme }) => ({
          '& .MuiOutlinedInput-root': {
            backgroundColor: theme.palette.mode === 'light' 
              ? 'transparent' 
              : 'rgba(255, 255, 255, 0.05)',
          },
        }),
      },
    },
    MuiInputBase: {
      styleOverrides: {
        root: ({ theme }) => ({
          backgroundColor: theme.palette.mode === 'light' 
            ? 'transparent' 
            : 'rgba(255, 255, 255, 0.05)',
        }),
      },
    },
    MuiCssBaseline: {
      styleOverrides: {
        body: ({ theme }) => ({
          scrollbarWidth: 'thin',
          scrollbarColor: theme.palette.mode === 'light'
            ? '#c1c1c1 #f1f1f1'
            : '#6b6b6b #2b2b2b',
          '&::-webkit-scrollbar': {
            width: '8px',
          },
          '&::-webkit-scrollbar-track': {
            background: theme.palette.mode === 'light' ? '#f1f1f1' : '#2b2b2b',
          },
          '&::-webkit-scrollbar-thumb': {
            background: theme.palette.mode === 'light' ? '#c1c1c1' : '#6b6b6b',
            borderRadius: '4px',
          },
          '&::-webkit-scrollbar-thumb:hover': {
            background: theme.palette.mode === 'light' ? '#a8a8a8' : '#888',
          },
        }),
      },
    },
  },
  shape: {
    borderRadius: 8,
  },
});

function App() {
  const [mode, setMode] = useState(() => {
    // Check localStorage for saved theme preference
    const saved = localStorage.getItem('themeMode');
    return saved || 'light';
  });

  // Create theme based on mode
  const theme = useMemo(() => createTheme(getDesignTokens(mode)), [mode]);

  // Toggle theme function
  const toggleColorMode = () => {
    const newMode = mode === 'light' ? 'dark' : 'light';
    setMode(newMode);
    localStorage.setItem('themeMode', newMode);
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
          {/* Theme toggle button - positioned to not interfere with navbar */}
          <Box
            sx={{
              position: 'fixed',
              bottom: 24,
              right: 24,
              zIndex: 1000, // Lower z-index to not interfere with navbar
            }}
          >
            <motion.div
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <IconButton
                sx={{
                  backgroundColor: theme.palette.primary.main,
                  color: 'white',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                  width: 56,
                  height: 56,
                  '&:hover': {
                    backgroundColor: theme.palette.primary.dark,
                    transform: 'scale(1.1)',
                  },
                }}
                onClick={toggleColorMode}
              >
                {theme.palette.mode === 'dark' ? <Brightness7 /> : <Brightness4 />}
              </IconButton>
            </motion.div>
          </Box>

          {/* Navigation */}
          <Navbar />

          {/* Main content */}
          <Box component="main" sx={{ flexGrow: 1, pt: 8 }}>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/search" element={<SearchPage />} />
                <Route path="/results" element={<ResultsPage />} />
                <Route path="/analytics" element={<AnalyticsPage />} />
                <Route path="/about" element={<AboutPage />} />
                <Route path="/contact" element={<ContactPage />} />
              </Routes>
            </motion.div>
          </Box>
        </Box>
      </Router>
    </ThemeProvider>
  );
}

export default App;