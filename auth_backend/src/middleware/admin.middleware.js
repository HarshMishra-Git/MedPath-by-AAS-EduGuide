const jwtService = require('../services/jwt.service');
const prisma = require('../config/database');

/**
 * Admin Authentication Middleware
 * Verifies that the user is authenticated AND has admin role
 */
const adminAuthMiddleware = async (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'No token provided. Admin authorization required.'
      });
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    // Verify token
    const decoded = jwtService.verifyAccessToken(token);

    // Check if session exists and is valid
    const session = await prisma.session.findUnique({
      where: { token },
      include: { user: true }
    });

    if (!session) {
      return res.status(401).json({
        success: false,
        message: 'Invalid session. Please login again.'
      });
    }

    // Check if session expired
    if (new Date(session.expiresAt) < new Date()) {
      return res.status(401).json({
        success: false,
        message: 'Session expired. Please login again.'
      });
    }

    // Check if user still exists and is active
    if (!session.user || session.user.accountStatus === 'DELETED') {
      return res.status(401).json({
        success: false,
        message: 'User account not found or deleted.'
      });
    }

    // Check if user has admin role
    if (session.user.role !== 'ADMIN' && session.user.role !== 'SUPER_ADMIN') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin privileges required.'
      });
    }

    // Attach user to request
    req.user = {
      id: session.user.id,
      email: session.user.email,
      fullName: session.user.fullName,
      role: session.user.role,
      accountStatus: session.user.accountStatus,
      paymentStatus: session.user.paymentStatus
    };

    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: error.message || 'Authentication failed'
    });
  }
};

module.exports = adminAuthMiddleware;
