const { OAuth2Client } = require('google-auth-library');
const prisma = require('../config/database');
const jwtService = require('./jwt.service');

class GoogleOAuthService {
  constructor() {
    this.client = new OAuth2Client(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI
    );
  }

  // Generate Google OAuth URL
  getAuthUrl() {
    const scopes = [
      'https://www.googleapis.com/auth/userinfo.email',
      'https://www.googleapis.com/auth/userinfo.profile'
    ];

    return this.client.generateAuthUrl({
      access_type: 'offline',
      scope: scopes,
      prompt: 'consent'
    });
  }

  // Verify Google token and get user info
  async verifyGoogleToken(token) {
    try {
      const ticket = await this.client.verifyIdToken({
        idToken: token,
        audience: process.env.GOOGLE_CLIENT_ID
      });

      const payload = ticket.getPayload();
      return {
        googleId: payload.sub,
        email: payload.email,
        fullName: payload.name,
        profilePicture: payload.picture,
        emailVerified: payload.email_verified
      };
    } catch (error) {
      throw new Error('Invalid Google token');
    }
  }

  // Handle Google OAuth callback
  async handleGoogleCallback(code) {
    try {
      const { tokens } = await this.client.getToken(code);
      const ticket = await this.client.verifyIdToken({
        idToken: tokens.id_token,
        audience: process.env.GOOGLE_CLIENT_ID
      });

      const payload = ticket.getPayload();
      return {
        googleId: payload.sub,
        email: payload.email,
        fullName: payload.name,
        profilePicture: payload.picture,
        emailVerified: payload.email_verified
      };
    } catch (error) {
      throw new Error('Google OAuth callback failed');
    }
  }

  // Login or register user with Google
  async loginWithGoogle(googleUserData, req) {
    try {
      // Check if user exists with Google ID
      let user = await prisma.user.findUnique({
        where: { googleId: googleUserData.googleId }
      });

      if (!user) {
        // Check if user exists with same email
        user = await prisma.user.findUnique({
          where: { email: googleUserData.email }
        });

        if (user) {
          // Link Google account to existing user
          user = await prisma.user.update({
            where: { id: user.id },
            data: {
              googleId: googleUserData.googleId,
              profilePicture: googleUserData.profilePicture,
              emailVerified: true
            }
          });
        } else {
          // Create new user
          user = await prisma.user.create({
            data: {
              email: googleUserData.email,
              fullName: googleUserData.fullName,
              googleId: googleUserData.googleId,
              profilePicture: googleUserData.profilePicture,
              emailVerified: true,
              registrationMethod: 'google',
              accountStatus: 'PENDING_PAYMENT',
              paymentStatus: 'PENDING'
            }
          });
        }
      } else {
        // Update last login
        await prisma.user.update({
          where: { id: user.id },
          data: { lastLogin: new Date() }
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

      return {
        user: {
          id: user.id,
          email: user.email,
          fullName: user.fullName,
          profilePicture: user.profilePicture,
          accountStatus: user.accountStatus,
          paymentStatus: user.paymentStatus
        },
        accessToken,
        refreshToken
      };
    } catch (error) {
      throw new Error('Google login failed');
    }
  }
}

module.exports = new GoogleOAuthService();