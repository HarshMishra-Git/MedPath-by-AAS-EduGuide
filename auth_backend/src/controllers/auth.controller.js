const bcrypt = require('bcrypt');
const prisma = require('../config/database');
const jwtService = require('../services/jwt.service');
const otpService = require('../services/otp.service');
const googleOAuthService = require('../services/google-oauth.service');
const { body, validationResult } = require('express-validator');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const validator = require('validator');

class AuthController {
  
  // Input validation middleware
  static validateSignup = [
    body('email').optional().isEmail().normalizeEmail().withMessage('Valid email required'),
    body('password').isLength({ min: 8 }).matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/).withMessage('Password must be 8+ chars with uppercase, lowercase, number and special char'),
    body('fullName').trim().isLength({ min: 2 }).escape().withMessage('Full name required'),
    body('phone').optional().isMobilePhone().withMessage('Valid phone number required'),
    // Custom validation: At least one of email or phone must be provided
    body().custom((value, { req }) => {
      if (!req.body.email && !req.body.phone) {
        throw new Error('Either email or phone number is required');
      }
      return true;
    })
  ];

  static validateLogin = [
    body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
    body('password').notEmpty().withMessage('Password required')
  ];

  // Register new user
  async signup(req, res) {
    try {
      // Check validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array()
        });
      }

      const { email, password, fullName, phone } = req.body;

      // Validate that at least one identifier is provided
      if (!email && !phone) {
        return res.status(400).json({
          success: false,
          message: 'Either email or phone number is required'
        });
      }

      // Check if user already exists
      const existingUser = await prisma.user.findFirst({
        where: {
          OR: [
            ...(email ? [{ email }] : []),
            ...(phone ? [{ phone }] : [])
          ]
        }
      });

      if (existingUser) {
        if (existingUser.email === email) {
          return res.status(400).json({
            success: false,
            message: 'Email already registered. Please login.'
          });
        }
        if (existingUser.phone === phone) {
          return res.status(400).json({
            success: false,
            message: 'Phone number already in use.'
          });
        }
      }

      // Hash password
      const passwordHash = await bcrypt.hash(
        password,
        parseInt(process.env.BCRYPT_ROUNDS) || 12
      );

      // Create user
      const user = await prisma.user.create({
        data: {
          email: email || null,
          fullName,
          phone: phone || null,
          passwordHash,
          registrationMethod: 'manual',
          accountStatus: 'PENDING_PAYMENT',
          paymentStatus: 'PENDING',
          // Auto-verify in development mode
          emailVerified: process.env.NODE_ENV === 'development' && email ? true : false,
          phoneVerified: process.env.NODE_ENV === 'development' && phone ? true : false
        }
      });

      // Generate tokens
      const { accessToken, refreshToken } = jwtService.generateTokenPair({
        userId: user.id,
        email: user.email || user.phone
      });

      // Create session
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 1); // 1 hour

      await prisma.session.create({
        data: {
          userId: user.id,
          token: accessToken,
          refreshToken,
          ipAddress: req.ip,
          userAgent: req.headers['user-agent'],
          expiresAt
        }
      });

      res.status(201).json({
        success: true,
        message: email ? 'Registration successful. Please verify your email.' : 'Registration successful. Please verify your phone.',
        data: {
          userId: user.id,
          email: user.email,
          phone: user.phone,
          fullName: user.fullName,
          accountStatus: user.accountStatus,
          paymentStatus: user.paymentStatus,
          emailVerified: user.emailVerified,
          phoneVerified: user.phoneVerified
        },
        token: accessToken,
        refreshToken
      });

      // Send verification email or SMS (non-blocking)
      if (email) {
        otpService.sendEmailOTP(email, fullName).catch(console.error);
      } else if (phone) {
        // Send SMS OTP if phone-only registration
        otpService.sendSMSOTP(phone, fullName).catch(console.error);
      }

    } catch (error) {
      console.error('Signup error:', error);
      res.status(500).json({
        success: false,
        message: 'Registration failed. Please try again.'
      });
    }
  }

  // Login
  async login(req, res) {
    try {
      // Check validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array()
        });
      }

      const { email, password } = req.body;

      // Find user
      const user = await prisma.user.findUnique({
        where: { email }
      });

      if (!user || !user.passwordHash) {
        return res.status(401).json({
          success: false,
          message: 'Invalid email or password'
        });
      }

      // Check account status
      if (user.accountStatus === 'SUSPENDED') {
        return res.status(403).json({
          success: false,
          message: 'Account suspended. Contact support.'
        });
      }

      if (user.accountStatus === 'DELETED') {
        return res.status(404).json({
          success: false,
          message: 'Account not found'
        });
      }

      // Verify password
      const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
      if (!isPasswordValid) {
        return res.status(401).json({
          success: false,
          message: 'Invalid email or password'
        });
      }

      // Generate tokens
      const { accessToken, refreshToken } = jwtService.generateTokenPair({
        userId: user.id,
        email: user.email
      });

      // Create session
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 1);

      await prisma.session.create({
        data: {
          userId: user.id,
          token: accessToken,
          refreshToken,
          ipAddress: req.ip,
          userAgent: req.headers['user-agent'],
          expiresAt
        }
      });

      // Update last login
      await prisma.user.update({
        where: { id: user.id },
        data: { lastLogin: new Date() }
      });

      res.json({
        success: true,
        message: 'Login successful',
        data: {
          user: {
            id: user.id,
            email: user.email,
            fullName: user.fullName,
            role: user.role,
            accountStatus: user.accountStatus,
            paymentStatus: user.paymentStatus
          },
          token: accessToken,
          refreshToken
        }
      });

    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({
        success: false,
        message: 'Login failed. Please try again.'
      });
    }
  }

  // Verify Token
  async verify(req, res) {
    try {
      res.json({
        success: true,
        data: req.user
      });
    } catch (error) {
      res.status(401).json({
        success: false,
        message: 'Token verification failed'
      });
    }
  }

  // Get Profile
  async getProfile(req, res) {
    try {
      const user = await prisma.user.findUnique({
        where: { id: req.user.id },
        select: {
          id: true,
          email: true,
          fullName: true,
          phone: true,
          emailVerified: true,
          phoneVerified: true,
          paymentStatus: true,
          accountStatus: true,
          createdAt: true,
          lastLogin: true
        }
      });

      res.json({
        success: true,
        data: user
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to fetch profile'
      });
    }
  }

  // Send OTP for verification
  async sendOTP(req, res) {
    try {
      const { type, identifier } = req.body; // type: 'email' or 'sms', identifier: email or phone
      
      if (!type || !identifier) {
        return res.status(400).json({
          success: false,
          message: 'Type and identifier required'
        });
      }

      if (type === 'email' && !validator.isEmail(identifier)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid email format'
        });
      }

      if (type === 'sms' && !validator.isMobilePhone(identifier)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid phone format'
        });
      }

      const user = await prisma.user.findFirst({
        where: type === 'email' ? { email: identifier } : { phone: identifier }
      });

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      let result;
      if (type === 'email') {
        result = await otpService.sendEmailOTP(identifier, user.fullName);
      } else {
        result = await otpService.sendSMSOTP(identifier, user.fullName);
      }

      res.json({
        success: true,
        message: `OTP sent to ${type}`,
        data: result
      });
    } catch (error) {
      console.error('Send OTP error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to send OTP'
      });
    }
  }

  // Verify OTP
  async verifyOTP(req, res) {
    try {
      const { identifier, otp, type } = req.body;
      
      if (!identifier || !otp || !type) {
        return res.status(400).json({
          success: false,
          message: 'Identifier, OTP and type required'
        });
      }

      const result = await otpService.verifyOTP(identifier, otp);
      
      // Update user verification status
      const updateData = type === 'email' ? { emailVerified: true } : { phoneVerified: true };
      await prisma.user.updateMany({
        where: type === 'email' ? { email: identifier } : { phone: identifier },
        data: updateData
      });

      res.json({
        success: true,
        message: `${type} verified successfully`,
        data: result
      });
    } catch (error) {
      console.error('Verify OTP error:', error);
      res.status(400).json({
        success: false,
        message: error.message || 'OTP verification failed'
      });
    }
  }

  // Google OAuth login
  async googleLogin(req, res) {
    try {
      const { token } = req.body;
      
      if (!token) {
        return res.status(400).json({
          success: false,
          message: 'Google token required'
        });
      }

      const googleUserData = await googleOAuthService.verifyGoogleToken(token);
      const result = await googleOAuthService.loginWithGoogle(googleUserData, req);

      res.json({
        success: true,
        message: 'Google login successful',
        data: result
      });
    } catch (error) {
      console.error('Google login error:', error);
      res.status(400).json({
        success: false,
        message: error.message || 'Google login failed'
      });
    }
  }

  // Get Google OAuth URL
  async getGoogleAuthUrl(req, res) {
    try {
      const authUrl = googleOAuthService.getAuthUrl();
      res.json({
        success: true,
        data: { authUrl }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to generate Google auth URL'
      });
    }
  }

  // Google OAuth callback
  async googleCallback(req, res) {
    try {
      const { code } = req.query;
      
      if (!code) {
        return res.status(400).json({
          success: false,
          message: 'Authorization code required'
        });
      }

      const googleUserData = await googleOAuthService.handleGoogleCallback(code);
      const result = await googleOAuthService.loginWithGoogle(googleUserData, req);

      // Redirect to frontend with token
      const redirectUrl = `${process.env.FRONTEND_URL}/auth/callback?token=${result.accessToken}&refresh=${result.refreshToken}`;
      res.redirect(redirectUrl);
    } catch (error) {
      console.error('Google callback error:', error);
      const errorUrl = `${process.env.FRONTEND_URL}/auth/error?message=${encodeURIComponent(error.message)}`;
      res.redirect(errorUrl);
    }
  }

  // Logout
  async logout(req, res) {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(400).json({
          success: false,
          message: 'Invalid authorization header'
        });
      }
      
      const token = authHeader.substring(7);

      // Delete session
      await prisma.session.delete({
        where: { token }
      });

      res.json({
        success: true,
        message: 'Logged out successfully'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Logout failed'
      });
    }
  }
}

module.exports = new AuthController();