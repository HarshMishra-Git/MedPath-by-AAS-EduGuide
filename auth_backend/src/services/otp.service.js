const crypto = require('crypto');
const prisma = require('../config/database');
const emailService = require('./email.service');
const smsService = require('./sms.service');

class OTPService {
  // Generate 6-digit OTP
  generateOTP() {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  // Store OTP in database
  async storeOTP(identifier, otp, type = 'email') {
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 10); // 10 minutes expiry

    await prisma.oTP.upsert({
      where: { identifier },
      update: {
        code: otp,
        type,
        expiresAt,
        attempts: 0,
        verified: false
      },
      create: {
        identifier,
        code: otp,
        type,
        expiresAt,
        attempts: 0,
        verified: false
      }
    });
  }

  // Send email OTP
  async sendEmailOTP(email, name) {
    const otp = this.generateOTP();
    await this.storeOTP(email, otp, 'email');
    
    // Always log OTP in development mode
    if (process.env.NODE_ENV === 'development') {
      console.log('\n' + '='.repeat(60));
      console.log('🔐 OTP VERIFICATION CODE (DEVELOPMENT MODE)');
      console.log('='.repeat(60));
      console.log(`📧 Email: ${email}`);
      console.log(`🔢 OTP Code: ${otp}`);
      console.log(`⏰ Expires in: 10 minutes`);
      console.log('='.repeat(60) + '\n');
    }
    
    try {
      const result = await emailService.sendVerificationEmail(email, otp, name);
      return { success: true, message: 'OTP sent to email' };
    } catch (error) {
      // In development, allow testing even if email fails
      if (process.env.NODE_ENV === 'development') {
        console.log('⚠️  Email sending failed');
        console.log('✅ OTP is stored in database - use the code above to verify\n');
        return { success: true, message: 'OTP generated (check server logs for code)' };
      }
      throw new Error('Failed to send email OTP');
    }
  }

  // Send SMS OTP
  async sendSMSOTP(phone, name) {
    const otp = this.generateOTP();
    await this.storeOTP(phone, otp, 'sms');
    
    // Always log OTP in development mode
    if (process.env.NODE_ENV === 'development') {
      console.log('\n' + '='.repeat(60));
      console.log('🔐 OTP VERIFICATION CODE (DEVELOPMENT MODE)');
      console.log('='.repeat(60));
      console.log(`📱 Phone: ${phone}`);
      console.log(`🔢 OTP Code: ${otp}`);
      console.log(`⏰ Expires in: 10 minutes`);
      console.log('='.repeat(60) + '\n');
    }
    
    try {
      const result = await smsService.sendOTP(phone, otp);
      return { success: true, message: 'OTP sent to mobile' };
    } catch (error) {
      // In development, allow testing even if SMS fails
      if (process.env.NODE_ENV === 'development') {
        console.log('⚠️  SMS sending failed (Twilio trial limitation)');
        console.log('✅ OTP is stored in database - use the code above to verify\n');
        return { success: true, message: 'OTP generated (check server logs for code)' };
      }
      throw new Error('Failed to send SMS OTP');
    }
  }

  // Verify OTP
  async verifyOTP(identifier, otp) {
    const otpRecord = await prisma.oTP.findUnique({
      where: { identifier }
    });

    if (!otpRecord) {
      throw new Error('OTP not found');
    }

    if (otpRecord.verified) {
      throw new Error('OTP already used');
    }

    if (new Date() > otpRecord.expiresAt) {
      throw new Error('OTP expired');
    }

    if (otpRecord.attempts >= 3) {
      throw new Error('Too many attempts');
    }

    if (otpRecord.code !== otp) {
      await prisma.oTP.update({
        where: { identifier },
        data: { attempts: otpRecord.attempts + 1 }
      });
      throw new Error('Invalid OTP');
    }

    // Mark as verified
    await prisma.oTP.update({
      where: { identifier },
      data: { verified: true }
    });

    return { success: true, message: 'OTP verified successfully' };
  }

  // Clean expired OTPs
  async cleanExpiredOTPs() {
    await prisma.oTP.deleteMany({
      where: {
        expiresAt: { lt: new Date() }
      }
    });
  }
}

module.exports = new OTPService();