import React, { useState } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  IconButton,
  Menu,
  MenuItem,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  School,
  Menu as MenuIcon,
  Home,
  Search,
  Analytics,
  Info,
  ContactMail,
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';

const Navbar = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const [mobileMenuAnchor, setMobileMenuAnchor] = useState(null);

  const navigationItems = [
    { label: 'Home', path: '/', icon: <Home /> },
    { label: 'Search', path: '/search', icon: <Search /> },
    { label: 'Analytics', path: '/analytics', icon: <Analytics /> },
    { label: 'About', path: '/about', icon: <Info /> },
    { label: 'Contact', path: '/contact', icon: <ContactMail /> },
  ];

  const handleMobileMenuOpen = (event) => {
    setMobileMenuAnchor(event.currentTarget);
  };

  const handleMobileMenuClose = () => {
    setMobileMenuAnchor(null);
  };

  const handleNavigation = (path) => {
    navigate(path);
    handleMobileMenuClose();
  };

  const isActivePath = (path) => location.pathname === path;

  return (
    <AppBar
      position="fixed"
      sx={{
        background: theme.palette.mode === 'light' 
          ? 'linear-gradient(135deg, #1976d2 0%, #1565c0 100%)'
          : 'linear-gradient(135deg, #1e1e1e 0%, #121212 100%)',
        backdropFilter: 'blur(10px)',
        borderBottom: `1px solid ${theme.palette.divider}`,
        zIndex: 1200, // Ensure navbar is above other elements
      }}
      elevation={0}
    >
      <Toolbar>
        {/* Logo and Brand */}
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}
          onClick={() => navigate('/')}
        >
          <School sx={{ mr: 1, fontSize: '2rem' }} />
          <Typography variant="h6" component="div" sx={{ fontWeight: 700 }}>
            NEET-PG Finder
          </Typography>
        </motion.div>

        <Box sx={{ flexGrow: 1 }} />

        {/* Desktop Navigation */}
        {!isMobile && (
          <Box sx={{ display: 'flex', gap: 1 }}>
            {navigationItems.map((item) => (
              <motion.div
                key={item.path}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  color="inherit"
                  startIcon={item.icon}
                  onClick={() => handleNavigation(item.path)}
                  sx={{
                    fontWeight: 600,
                    borderRadius: 2,
                    px: 2,
                    py: 1,
                    backgroundColor: isActivePath(item.path) 
                      ? 'rgba(255, 255, 255, 0.1)'
                      : 'transparent',
                    '&:hover': {
                      backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    },
                    border: isActivePath(item.path) 
                      ? '1px solid rgba(255, 255, 255, 0.2)'
                      : '1px solid transparent',
                  }}
                >
                  {item.label}
                </Button>
              </motion.div>
            ))}
          </Box>
        )}

        {/* Mobile Navigation */}
        {isMobile && (
          <>
            <IconButton
              color="inherit"
              aria-label="menu"
              onClick={handleMobileMenuOpen}
              sx={{ ml: 2 }}
            >
              <MenuIcon />
            </IconButton>
            <Menu
              anchorEl={mobileMenuAnchor}
              open={Boolean(mobileMenuAnchor)}
              onClose={handleMobileMenuClose}
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'right',
              }}
              transformOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              PaperProps={{
                sx: {
                  mt: 1,
                  minWidth: 200,
                  borderRadius: 2,
                  zIndex: 1300, // Ensure menu is above theme toggle
                  '& .MuiMenuItem-root': {
                    px: 2,
                    py: 1.5,
                    borderRadius: 1,
                    mx: 1,
                    my: 0.5,
                  },
                },
              }}
            >
              {navigationItems.map((item) => (
                <motion.div key={item.path} whileHover={{ scale: 1.02 }}>
                  <MenuItem
                    onClick={() => handleNavigation(item.path)}
                    selected={isActivePath(item.path)}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      {item.icon}
                      <Typography variant="body1" sx={{ fontWeight: 500 }}>
                        {item.label}
                      </Typography>
                    </Box>
                  </MenuItem>
                </motion.div>
              ))}
            </Menu>
          </>
        )}
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;