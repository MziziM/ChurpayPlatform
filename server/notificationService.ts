/**
 * Notification Service for ChurPay
 * Handles both in-app notifications and email notifications
 */

import nodemailer from 'nodemailer';

interface EmailNotification {
  to: string;
  subject: string;
  html: string;
  from?: string;
}

interface InAppNotification {
  userId: string;
  title: string;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  read: boolean;
  createdAt: Date;
}

class NotificationService {
  private static instance: NotificationService;
  private emailTransporter: any = null;

  static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  async initializeEmailService(): Promise<void> {
    if (this.emailTransporter) return;

    try {
      // Create test account for development
      const testAccount = await nodemailer.createTestAccount();
      
      this.emailTransporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass,
        },
      });

      console.log('📧 Email service ready - Test account:', testAccount.user);
      console.log('📧 View emails at: https://ethereal.email/');

    } catch (error) {
      console.error('📧 Email service initialization failed:', error);
      // Continue without email service - will fallback to console logging
    }
  }

  async sendEmail(notification: EmailNotification): Promise<boolean> {
    try {
      await this.initializeEmailService();

      const emailData = {
        from: notification.from || '"ChurPay" <noreply@churpay.com>',
        to: notification.to,
        subject: notification.subject,
        html: notification.html,
      };

      if (this.emailTransporter) {
        const info = await this.emailTransporter.sendMail(emailData);
        console.log('📧 Email sent successfully!');
        console.log('📧 Preview URL:', nodemailer.getTestMessageUrl(info));
        return true;
      } else {
        // Fallback to console logging
        this.logEmailToConsole(emailData);
        return true;
      }

    } catch (error) {
      console.error('📧 Email sending failed:', error);
      // Fallback to console logging
      this.logEmailToConsole({
        from: notification.from || '"ChurPay" <noreply@churpay.com>',
        to: notification.to,
        subject: notification.subject,
        html: notification.html,
      });
      return true; // Return true to continue process flow
    }
  }

  private logEmailToConsole(emailData: any): void {
    console.log('\n📧 =============== EMAIL NOTIFICATION ===============');
    console.log(`📤 TO: ${emailData.to}`);
    console.log(`📋 FROM: ${emailData.from}`);
    console.log(`📝 SUBJECT: ${emailData.subject}`);
    console.log('📄 CONTENT:');
    console.log(emailData.html);
    console.log('📧 ===============================================\n');
  }

  // Church approval email template
  async sendChurchApprovalEmail(churchEmail: string, churchName: string): Promise<boolean> {
    const subject = `🎉 Welcome to ChurPay! Your church has been approved`;
    
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #7c3aed 0%, #fbbf24 100%); padding: 30px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 28px;">ChurPay</h1>
          <p style="color: white; margin: 10px 0 0 0; opacity: 0.9;">Digital Church Management Platform</p>
        </div>
        
        <div style="padding: 30px; background: #f8fafc; border-left: 4px solid #7c3aed;">
          <h2 style="color: #1f2937; margin-bottom: 20px;">🎉 Congratulations ${churchName}!</h2>
          
          <p style="color: #374151; line-height: 1.6; margin-bottom: 20px;">
            Your church registration has been <strong>approved</strong> and you can now access all ChurPay features.
          </p>
          
          <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #7c3aed; margin-bottom: 15px;">✨ What's Available Now:</h3>
            <ul style="color: #374151; line-height: 1.8;">
              <li>📊 Complete church dashboard with analytics</li>
              <li>💰 Digital donation processing (3.9% + R3 per transaction)</li>
              <li>👥 Member management system</li>
              <li>📈 Project sponsorship and fundraising</li>
              <li>💳 Secure payout requests to your bank account</li>
              <li>🎯 Annual 10% revenue sharing benefit</li>
            </ul>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.FRONTEND_URL || 'https://your-app.replit.app'}/church-dashboard" 
               style="background: #7c3aed; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">
              Access Your Dashboard
            </a>
          </div>
          
          <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">
            Need help? Contact our support team at support@churpay.com
          </p>
        </div>
      </div>
    `;

    return await this.sendEmail({
      to: churchEmail,
      subject,
      html,
    });
  }

  // Payout approval email template
  async sendPayoutApprovalEmail(churchEmail: string, churchName: string, amount: string): Promise<boolean> {
    const subject = `💰 Payout Approved - R${amount} on the way!`;
    
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #059669 0%, #34d399 100%); padding: 30px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 28px;">ChurPay</h1>
          <p style="color: white; margin: 10px 0 0 0; opacity: 0.9;">Payout Approved</p>
        </div>
        
        <div style="padding: 30px; background: #f0fdf4;">
          <h2 style="color: #1f2937; margin-bottom: 20px;">💰 Great News ${churchName}!</h2>
          
          <div style="background: white; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0;">
            <h3 style="color: #059669; margin-bottom: 10px;">Payout Approved</h3>
            <p style="font-size: 24px; font-weight: bold; color: #1f2937; margin: 0;">R${amount}</p>
            <p style="color: #6b7280; margin: 10px 0 0 0;">Will be transferred to your bank account within 3-5 business days</p>
          </div>
          
          <p style="color: #374151; line-height: 1.6;">
            Your payout request has been approved and processed. The funds will be transferred to your registered bank account.
          </p>
          
          <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">
            Track your payout status in your church dashboard.
          </p>
        </div>
      </div>
    `;

    return await this.sendEmail({
      to: churchEmail,
      subject,
      html,
    });
  }
}

export const notificationService = NotificationService.getInstance();