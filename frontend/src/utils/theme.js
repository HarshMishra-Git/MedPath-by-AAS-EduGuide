// Theme utility functions for consistent theming
import { alpha } from '@mui/material/styles';

export const getThemeAwareColor = (theme, lightColor, darkColor) => {
  return theme.palette.mode === 'light' ? lightColor : darkColor;
};

export const getTransparentBackground = (theme, opacity = 0.95) => {
  return theme.palette.mode === 'light' 
    ? `rgba(255, 255, 255, ${opacity})`
    : `rgba(30, 30, 30, ${opacity})`;
};

export const getGradientBackground = (theme) => {
  return theme.palette.mode === 'light'
    ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
    : 'linear-gradient(135deg, #2c3e50 0%, #34495e 100%)';
};

export const getCardBackground = (theme) => {
  return theme.palette.mode === 'light'
    ? theme.palette.background.paper
    : alpha(theme.palette.background.paper, 0.8);
};

export const getPaperElevation = (theme, level = 1) => {
  if (theme.palette.mode === 'light') {
    return level * 2;
  } else {
    return level * 3; // Higher elevation for dark mode for better visibility
  }
};

export const getTextColor = (theme, variant = 'primary') => {
  switch (variant) {
    case 'primary':
      return theme.palette.text.primary;
    case 'secondary':
      return theme.palette.text.secondary;
    case 'disabled':
      return theme.palette.text.disabled;
    default:
      return theme.palette.text.primary;
  }
};