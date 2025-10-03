const twilio = require('twilio');

class SMSService {
  constructor() {
    if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
      this.client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
      this.fromNumber = process.env.TWILIO_PHONE_NUMBER;
    }
  }

  // Send OTP via SMS
  async sendOTP(phone, otp) {
    try {
      if (!this.client) {
        console.log('SMS service not configured, OTP:', otp);
        return { success: true, messageId: 'dev-mode' };
      }

      const message = await this.client.messages.create({
        body: `Your MedPath verification code is: ${otp}. Valid for 10 minutes. Do not share this code.`,
        from: this.fromNumber,
        to: phone
      });

      console.log('✅ SMS sent:', message.sid);
      return { success: true, messageId: message.sid };
    } catch (error) {
      console.error('❌ SMS sending failed:', error);
      return { success: false, error: error.message };
    }
  }

  // Send custom SMS
  async sendSMS(phone, message) {
    try {
      if (!this.client) {
        console.log('SMS service not configured, message:', message);
        return { success: true, messageId: 'dev-mode' };
      }

      const result = await this.client.messages.create({
        body: message,
        from: this.fromNumber,
        to: phone
      });

      return { success: true, messageId: result.sid };
    } catch (error) {
      console.error('❌ SMS sending failed:', error);
      return { success: false, error: error.message };
    }
  }
}

module.exports = new SMSService();