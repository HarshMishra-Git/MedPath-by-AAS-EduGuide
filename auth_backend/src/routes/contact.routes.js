const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const { PrismaClient } = require('@prisma/client');
const { apiLimiter } = require('../middleware/rate-limiter');
const adminAuthMiddleware = require('../middleware/admin.middleware');
const rateLimit = require('express-rate-limit');

const prisma = new PrismaClient();

// Custom rate limiter for contact form (10 requests per 15 minutes)
const contactLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
  message: {
    success: false,
    message: 'Too many contact form submissions. Please try again after 15 minutes.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * @route   POST /api/contact
 * @desc    Submit contact form
 * @access  Public
 */
router.post(
  '/',
  contactLimiter,
  [
    body('name')
      .trim()
      .isLength({ min: 2 })
      .withMessage('Name must be at least 2 characters')
      .escape(),
    body('email')
      .isEmail()
      .withMessage('Please enter a valid email address')
      .normalizeEmail(),
    body('subject')
      .trim()
      .isLength({ min: 5 })
      .withMessage('Subject must be at least 5 characters')
      .escape(),
    body('category')
      .isIn(['general', 'technical', 'partnership', 'bug', 'feature', 'billing'])
      .withMessage('Please select a valid category'),
    body('message')
      .trim()
      .isLength({ min: 20 })
      .withMessage('Message must be at least 20 characters')
      .escape(),
    body('phone')
      .optional()
      .trim()
      .escape(),
    body('organization')
      .optional()
      .trim()
      .escape()
  ],
  async (req, res) => {
    try {
      // Validate input
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array()
        });
      }

      const { name, email, subject, category, message, phone, organization } = req.body;

      // Save to database using Prisma
      const contact = await prisma.contactSubmission.create({
        data: {
          name,
          email,
          subject,
          category,
          message,
          phone: phone || null,
          organization: organization || null,
          status: 'PENDING'
        }
      });

      // Generate ticket ID from UUID
      const ticketId = `TICKET-${contact.id.split('-')[0].toUpperCase()}`;

      console.log(`✅ Contact form submitted successfully: ${ticketId} from ${email}`);

      // TODO: Send email notification to admin (future enhancement)
      // TODO: Send auto-reply email to user (future enhancement)

      res.status(201).json({
        success: true,
        message: 'Contact form submitted successfully! We\'ll get back to you within 24 hours.',
        ticket_id: ticketId,
        contact_id: contact.id
      });

    } catch (error) {
      console.error('❌ Contact submission error:', error);

      // Check for database errors
      if (error.code === 'P2002') {
        return res.status(409).json({
          success: false,
          message: 'A submission with this information already exists'
        });
      }

      res.status(500).json({
        success: false,
        message: 'Failed to submit contact form. Please try again later.'
      });
    }
  }
);

/**
 * @route   GET /api/contact/health
 * @desc    Health check for contact service
 * @access  Public
 */
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Contact service is operational',
    timestamp: new Date().toISOString()
  });
});

/**
 * @route   GET /api/contact/submissions
 * @desc    Get all contact submissions (Admin only)
 * @access  Private (Admin)
 */
router.get('/submissions', adminAuthMiddleware, async (req, res) => {
  try {
    const { status, limit = 50, offset = 0 } = req.query;

    // Build filter
    const where = status ? { status: status.toUpperCase() } : {};

    // Get total count
    const total = await prisma.contactSubmission.count({ where });

    // Get submissions with pagination
    const submissions = await prisma.contactSubmission.findMany({
      where,
      orderBy: {
        submittedAt: 'desc'
      },
      take: parseInt(limit),
      skip: parseInt(offset)
    });

    res.json({
      success: true,
      data: submissions,
      pagination: {
        total,
        limit: parseInt(limit),
        offset: parseInt(offset),
        hasMore: total > parseInt(offset) + parseInt(limit)
      }
    });
  } catch (error) {
    console.error('❌ Error fetching contact submissions:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch contact submissions'
    });
  }
});

/**
 * @route   GET /api/contact/submissions/:id
 * @desc    Get single contact submission by ID
 * @access  Private (Admin)
 */
router.get('/submissions/:id', adminAuthMiddleware, async (req, res) => {
  try {
    const { id } = req.params;

    const submission = await prisma.contactSubmission.findUnique({
      where: { id }
    });

    if (!submission) {
      return res.status(404).json({
        success: false,
        message: 'Contact submission not found'
      });
    }

    res.json({
      success: true,
      data: submission
    });
  } catch (error) {
    console.error('❌ Error fetching contact submission:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch contact submission'
    });
  }
});

/**
 * @route   PATCH /api/contact/submissions/:id
 * @desc    Update contact submission status/notes
 * @access  Private (Admin)
 */
router.patch('/submissions/:id', adminAuthMiddleware, [
  body('status').optional().isIn(['PENDING', 'IN_PROGRESS', 'RESOLVED', 'CLOSED']),
  body('notes').optional().trim().escape(),
  body('resolvedBy').optional().trim()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { id } = req.params;
    const { status, notes, resolvedBy } = req.body;

    // Build update data
    const updateData = {};
    if (status) updateData.status = status;
    if (notes !== undefined) updateData.notes = notes;
    if (resolvedBy) updateData.resolvedBy = resolvedBy;
    if (status === 'RESOLVED' || status === 'CLOSED') {
      updateData.resolvedAt = new Date();
    }

    const updated = await prisma.contactSubmission.update({
      where: { id },
      data: updateData
    });

    console.log(`✅ Contact submission updated: ${id} - Status: ${status}`);

    res.json({
      success: true,
      message: 'Contact submission updated successfully',
      data: updated
    });
  } catch (error) {
    console.error('❌ Error updating contact submission:', error);

    if (error.code === 'P2025') {
      return res.status(404).json({
        success: false,
        message: 'Contact submission not found'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to update contact submission'
    });
  }
});

/**
 * @route   GET /api/contact/stats
 * @desc    Get contact submission statistics
 * @access  Private (Admin)
 */
router.get('/stats', adminAuthMiddleware, async (req, res) => {
  try {
    const [total, pending, inProgress, resolved, closed] = await Promise.all([
      prisma.contactSubmission.count(),
      prisma.contactSubmission.count({ where: { status: 'PENDING' } }),
      prisma.contactSubmission.count({ where: { status: 'IN_PROGRESS' } }),
      prisma.contactSubmission.count({ where: { status: 'RESOLVED' } }),
      prisma.contactSubmission.count({ where: { status: 'CLOSED' } })
    ]);

    // Get category breakdown
    const categoryStats = await prisma.contactSubmission.groupBy({
      by: ['category'],
      _count: true
    });

    res.json({
      success: true,
      data: {
        total,
        byStatus: {
          pending,
          inProgress,
          resolved,
          closed
        },
        byCategory: categoryStats.reduce((acc, item) => {
          acc[item.category] = item._count;
          return acc;
        }, {})
      }
    });
  } catch (error) {
    console.error('❌ Error fetching contact stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch contact statistics'
    });
  }
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  await prisma.$disconnect();
});

process.on('SIGINT', async () => {
  await prisma.$disconnect();
});

module.exports = router;
