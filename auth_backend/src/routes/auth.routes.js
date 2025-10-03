const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const authMiddleware = require('../middleware/auth.middleware');
const { apiLimiter, authLimiter } = require('../middleware/rate-limiter');
const { signupValidation, loginValidation, validate } = require('../utils/validators');
const rateLimit = require('express-rate-limit');

// OTP rate limiting
const otpLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 3, // 3 OTP requests per window
  message: {
    success: false,
    message: 'Too many OTP requests, please try again later.'
  }
});

// Public routes
router.post('/signup', apiLimiter, authController.signup);
router.post('/login', authLimiter, authController.login);
router.post('/send-otp', otpLimiter, authController.sendOTP);
router.post('/verify-otp', authLimiter, authController.verifyOTP);
router.post('/google-login', authLimiter, authController.googleLogin);
router.get('/google-auth-url', authController.getGoogleAuthUrl);
router.get('/google/callback', authController.googleCallback);

// Protected routes
router.get('/verify', authMiddleware, authController.verify);
router.get('/profile', authMiddleware, authController.getProfile);
router.post('/logout', authMiddleware, authController.logout);

module.exports = router;