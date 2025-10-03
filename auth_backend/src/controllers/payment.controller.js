const razorpayService = require('../services/razorpay.service');
const prisma = require('../config/database');

class PaymentController {
  // Create payment order
  async createOrder(req, res) {
    try {
      const { amount } = req.body;
      const userId = req.user.id;

      // Validate amount
      if (!amount || amount <= 0) {
        return res.status(400).json({
          success: false,
          message: 'Invalid amount. Amount must be greater than 0',
        });
      }

      // Create Razorpay order (the service will handle duplicate checks)
      const orderData = await razorpayService.createOrder(amount, userId);

      res.json({
        success: true,
        message: 'Payment order created successfully',
        data: orderData,
      });
    } catch (error) {
      console.error('Create order error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to create payment order',
      });
    }
  }

  // Verify payment
  async verifyPayment(req, res) {
    try {
      const {
        paymentId,
        razorpay_payment_id,
        razorpay_order_id,
        razorpay_signature,
      } = req.body;

      // Validate required fields
      if (!paymentId || !razorpay_payment_id || !razorpay_order_id || !razorpay_signature) {
        return res.status(400).json({
          success: false,
          message: 'Missing required payment verification data',
        });
      }

      // Verify and complete payment
      const result = await razorpayService.completePayment(
        paymentId,
        razorpay_payment_id,
        razorpay_order_id,
        razorpay_signature
      );

      res.json({
        success: true,
        message: result.message,
        data: {
          payment: result.payment,
        },
      });
    } catch (error) {
      console.error('Payment verification error:', error);
      res.status(400).json({
        success: false,
        message: error.message || 'Payment verification failed',
      });
    }
  }

  // Get user's payment history
  async getPaymentHistory(req, res) {
    try {
      const userId = req.user.id;

      const payments = await razorpayService.getUserPayments(userId);

      res.json({
        success: true,
        data: {
          payments,
          count: payments.length,
        },
      });
    } catch (error) {
      console.error('Get payment history error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch payment history',
      });
    }
  }

  // Check payment status
  async checkPaymentStatus(req, res) {
    try {
      const userId = req.user.id;

      const result = await razorpayService.checkUserPaymentStatus(userId);

      res.json({
        success: true,
        data: {
          hasPaid: result.hasPaid,
          payment: result.payment,
        },
      });
    } catch (error) {
      console.error('Check payment status error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to check payment status',
      });
    }
  }

  // Get payment config (for frontend)
  async getPaymentConfig(req, res) {
    try {
      if (!process.env.RAZORPAY_KEY_ID || !process.env.FRONTEND_URL) {
        return res.status(500).json({
          success: false,
          message: 'Payment service configuration error',
        });
      }

      res.json({
        success: true,
        data: {
          keyId: process.env.RAZORPAY_KEY_ID,
          currency: 'INR',
          defaultAmount: 1199, // ₹1199
          companyName: 'MedPath by AAS EduGuide',
          description: 'College Predictor Access',
          image: `${process.env.FRONTEND_URL}/images/aas-logo.png`,
          theme: {
            color: '#667eea',
          },
        },
      });
    } catch (error) {
      console.error('Get payment config error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch payment configuration',
      });
    }
  }

  // Handle payment webhook (for Razorpay callbacks)
  async handleWebhook(req, res) {
    try {
      const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
      const signature = req.headers['x-razorpay-signature'];

      // Verify webhook signature
      if (webhookSecret) {
        const crypto = require('crypto');
        const expectedSignature = crypto
          .createHmac('sha256', webhookSecret)
          .update(JSON.stringify(req.body))
          .digest('hex');

        if (signature !== expectedSignature) {
          return res.status(400).json({
            success: false,
            message: 'Invalid webhook signature',
          });
        }
      }

      const event = req.body.event;
      const payload = req.body.payload.payment.entity;

      console.log('Webhook received:', event);

      // Handle different webhook events
      switch (event) {
        case 'payment.captured':
          // Payment was successful
          console.log('Payment captured:', payload.id);
          break;

        case 'payment.failed':
          // Payment failed
          console.log('Payment failed:', payload.id);
          // Update payment status in database
          await prisma.payment.updateMany({
            where: { transactionId: payload.order_id },
            data: { status: 'FAILED' },
          });
          break;

        default:
          console.log('Unhandled webhook event:', event);
      }

      res.json({ success: true });
    } catch (error) {
      console.error('Webhook error:', error);
      res.status(500).json({
        success: false,
        message: 'Webhook processing failed',
      });
    }
  }
}

module.exports = new PaymentController();