const Razorpay = require('razorpay');
const crypto = require('crypto');
const prisma = require('../config/database');

class RazorpayService {
  constructor() {
    this.razorpayInstance = null;
    this.initializeRazorpay();
  }

  initializeRazorpay() {
    try {
      // Check if env variables are loaded
      if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
        throw new Error('Missing Razorpay credentials in environment variables');
      }

      // Initialize Razorpay instance
      this.razorpayInstance = new Razorpay({
        key_id: process.env.RAZORPAY_KEY_ID,
        key_secret: process.env.RAZORPAY_KEY_SECRET,
      });
      
      console.log('✅ Razorpay SDK initialized successfully');
      console.log('Key ID:', process.env.RAZORPAY_KEY_ID.substring(0, 10) + '...');
    } catch (error) {
      console.error('❌ Razorpay SDK initialization failed:', error.message);
      throw error;
    }
  }

  getRazorpay() {
    if (!this.razorpayInstance) {
      throw new Error('Razorpay instance not initialized');
    }
    return this.razorpayInstance;
  }

  // Create payment order
  async createOrder(amount, userId, currency = 'INR') {
    try {
      // Amount should already be in paise from frontend
      // Generate short receipt ID (max 40 chars for Razorpay)
      const shortUserId = userId.substring(0, 8);
      const timestamp = Date.now();
      const receiptId = `rcpt_${shortUserId}_${timestamp}`;

      const options = {
        amount: amount, // Amount is already in paise
        currency,
        receipt: receiptId,
        notes: {
          userId,
          purpose: 'MedPath College Predictor Access',
          timestamp: new Date().toISOString(),
        },
      };

      console.log('Creating Razorpay order:', options);

      // Get Razorpay instance
      const razorpay = this.getRazorpay();

      // Create order with Razorpay using Promise-based approach
      // Explicitly bind the create function to prevent context loss
      console.log('🔵 Calling Razorpay orders.create...');
      const createOrderFunc = razorpay.orders.create.bind(razorpay.orders);
      const order = await new Promise((resolve, reject) => {
        createOrderFunc(options, (error, order) => {
          if (error) {
            console.error('❌ Razorpay API error:', error);
            reject(error);
          } else {
            console.log('✅ Razorpay order created:', order);
            resolve(order);
          }
        });
      });
      console.log('🔵 Order received from Razorpay:', order);

      // Store payment record in database (convert back to rupees for storage)
      const payment = await prisma.paymentTransaction.create({
        data: {
          userId,
          amount: amount / 100, // Store in rupees
          currency,
          paymentMethod: 'razorpay',
          status: 'CREATED',
          razorpayOrderId: order.id,
        },
      });

      console.log('✅ Payment order created:', payment.id);

      return {
        success: true,
        orderId: order.id,
        amount: order.amount,
        currency: order.currency,
        receipt: order.receipt,
        razorpayKeyId: process.env.RAZORPAY_KEY_ID,
        paymentId: payment.id,
      };
    } catch (error) {
      console.error('❌ Razorpay order creation failed:', error);
      throw new Error(`Failed to create payment order: ${error.message}`);
    }
  }

  // Verify payment signature
  verifyPaymentSignature(orderId, paymentId, signature) {
    try {
      const text = `${orderId}|${paymentId}`;
      const generated_signature = crypto
        .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET || 'test_secret')
        .update(text)
        .digest('hex');

      const isValid = generated_signature === signature;
      console.log('Signature verification:', isValid ? '✅ Valid' : '❌ Invalid');
      
      return isValid;
    } catch (error) {
      console.error('❌ Signature verification error:', error);
      return false;
    }
  }

  // Complete payment after verification
  async completePayment(paymentId, razorpayPaymentId, razorpayOrderId, razorpaySignature) {
    try {
      console.log('Verifying payment:', {
        paymentId,
        razorpayPaymentId,
        razorpayOrderId,
      });

      // Verify signature
      const isValid = this.verifyPaymentSignature(
        razorpayOrderId,
        razorpayPaymentId,
        razorpaySignature
      );

      if (!isValid) {
        throw new Error('Invalid payment signature - Payment verification failed');
      }

      // Find payment record
      const payment = await prisma.paymentTransaction.findUnique({
        where: { id: paymentId },
        include: { user: true },
      });

      if (!payment) {
        throw new Error('Payment record not found');
      }

      // Update payment status
      const updatedPayment = await prisma.paymentTransaction.update({
        where: { id: paymentId },
        data: {
          status: 'CAPTURED',
          razorpayPaymentId,
          razorpayOrderId,
          razorpaySignature,
        },
      });

      // Update user payment and account status
      await prisma.user.update({
        where: { id: payment.userId },
        data: {
          paymentStatus: 'COMPLETED',
          accountStatus: 'ACTIVE',
          paymentId: razorpayPaymentId,
          razorpayOrderId,
          razorpaySignature,
          paymentDate: new Date(),
        },
      });

      console.log('✅ Payment completed successfully for user:', payment.userId);

      return {
        success: true,
        message: 'Payment verified and completed successfully',
        payment: updatedPayment,
      };
    } catch (error) {
      console.error('❌ Payment completion failed:', error);
      
      // Mark payment as failed if possible
      if (paymentId) {
        try {
          await prisma.paymentTransaction.update({
            where: { id: paymentId },
            data: { 
              status: 'FAILED',
              errorDescription: error.message,
            },
          });
        } catch (updateError) {
          console.error('Failed to update payment status:', updateError);
        }
      }

      throw error;
    }
  }

  // Get user's payment history
  async getUserPayments(userId) {
    try {
      const payments = await prisma.paymentTransaction.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
      });
      return payments;
    } catch (error) {
      console.error('❌ Failed to fetch user payments:', error);
      throw error;
    }
  }

  // Check if user has paid
  async checkUserPaymentStatus(userId) {
    try {
      const paidPayment = await prisma.paymentTransaction.findFirst({
        where: {
          userId,
          status: 'CAPTURED',
        },
      });

      return {
        hasPaid: !!paidPayment,
        payment: paidPayment,
      };
    } catch (error) {
      console.error('❌ Failed to check payment status:', error);
      return { hasPaid: false, payment: null };
    }
  }
}

module.exports = new RazorpayService();