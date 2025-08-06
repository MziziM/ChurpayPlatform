/**
 * Email Service for Church Approval Notifications
 * 
 * This service handles sending approval emails to church administrators
 * when their church application is approved. It uses a simple console-based
 * implementation for the MVP, but can be easily extended to use email providers
 * like SendGrid, AWS SES, or others.
 */

interface EmailParams {
  to: string;
  subject: string;
  html: string;
  from: string;
}

class EmailService {
  private static instance: EmailService;
  
  static getInstance(): EmailService {
    if (!EmailService.instance) {
      EmailService.instance = new EmailService();
    }
    return EmailService.instance;
  }

  /**
   * Send an email (currently logs to console for MVP)
   * @param params Email parameters
   * @returns Promise<boolean> indicating success
   */
  async sendEmail(params: EmailParams): Promise<boolean> {
    try {
      // For MVP: Log email to console
      // In production: Replace with actual email service
      console.log('\n📧 =============== EMAIL NOTIFICATION ===============');
      console.log(`📤 TO: ${params.to}`);
      console.log(`📋 FROM: ${params.from}`);
      console.log(`📝 SUBJECT: ${params.subject}`);
      console.log('📄 EMAIL CONTENT:');
      console.log(params.html);
      console.log('📧 ================================================\n');

      // Simulate successful email sending
      return true;

      // TODO: Replace with actual email service implementation
      // Example with SendGrid:
      // const response = await sendGridClient.send(params);
      // return response[0].statusCode >= 200 && response[0].statusCode < 300;

    } catch (error) {
      console.error('❌ Email service error:', error);
      return false;
    }
  }

  /**
   * Generate HTML email for church approval notification
   * @param churchName Name of the approved church
   * @param adminEmail Admin email address
   * @param setupToken Password setup token
   * @returns HTML email content
   */
  generateChurchApprovalEmail(churchName: string, adminEmail: string, setupToken: string): string {
    const setupUrl = `${process.env.FRONTEND_URL || 'https://your-domain.com'}/setup-password?token=${setupToken}`;
    
    return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Church Application Approved - ChurPay</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
      background-color: #f8f9fa;
    }
    .container {
      background: white;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }
    .header {
      background: linear-gradient(135deg, #7c3aed 0%, #a855f7 100%);
      color: white;
      padding: 30px;
      text-align: center;
    }
    .header h1 {
      margin: 0;
      font-size: 28px;
      font-weight: 700;
    }
    .content {
      padding: 30px;
    }
    .success-badge {
      background: #10b981;
      color: white;
      padding: 8px 16px;
      border-radius: 20px;
      font-size: 14px;
      font-weight: 600;
      display: inline-block;
      margin-bottom: 20px;
    }
    .button {
      display: inline-block;
      background: linear-gradient(135deg, #7c3aed 0%, #a855f7 100%);
      color: white;
      padding: 14px 28px;
      text-decoration: none;
      border-radius: 8px;
      font-weight: 600;
      margin: 20px 0;
      transition: transform 0.2s;
    }
    .button:hover {
      transform: translateY(-1px);
    }
    .info-box {
      background: #f1f5f9;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      padding: 20px;
      margin: 20px 0;
    }
    .info-box h3 {
      margin-top: 0;
      color: #1e293b;
    }
    .footer {
      background: #f8fafc;
      padding: 20px;
      text-align: center;
      font-size: 14px;
      color: #64748b;
      border-top: 1px solid #e2e8f0;
    }
    .steps {
      background: #fefefe;
      border: 1px solid #e5e7eb;
      border-radius: 8px;
      padding: 20px;
      margin: 20px 0;
    }
    .step {
      display: flex;
      align-items: center;
      margin: 10px 0;
      padding: 8px 0;
      border-bottom: 1px solid #f3f4f6;
    }
    .step:last-child {
      border-bottom: none;
    }
    .step-number {
      background: #7c3aed;
      color: white;
      width: 24px;
      height: 24px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 12px;
      font-weight: 600;
      margin-right: 12px;
      flex-shrink: 0;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🎉 Congratulations!</h1>
      <p style="margin: 10px 0 0 0; opacity: 0.9;">Your church application has been approved</p>
    </div>
    
    <div class="content">
      <div class="success-badge">✅ Application Approved</div>
      
      <h2>Welcome to ChurPay, ${churchName}!</h2>
      
      <p>Great news! Your church application has been reviewed and approved by our team. You can now access the full ChurPay platform to manage your church's digital giving and financial operations.</p>
      
      <div class="info-box">
        <h3>🔐 Complete Your Account Setup</h3>
        <p>To get started, you need to set up your admin password. Click the button below to create your secure password and access your church dashboard.</p>
        
        <p><strong>Admin Email:</strong> ${adminEmail}</p>
        <p><strong>Church:</strong> ${churchName}</p>
      </div>
      
      <div style="text-align: center; margin: 30px 0;">
        <a href="${setupUrl}" class="button">🔑 Set Up Your Password</a>
      </div>
      
      <div class="steps">
        <h3>📋 Next Steps:</h3>
        <div class="step">
          <div class="step-number">1</div>
          <div>Click the "Set Up Your Password" button above</div>
        </div>
        <div class="step">
          <div class="step-number">2</div>
          <div>Create a secure password for your admin account</div>
        </div>
        <div class="step">
          <div class="step-number">3</div>
          <div>Access your church dashboard and explore features</div>
        </div>
        <div class="step">
          <div class="step-number">4</div>
          <div>Start setting up your donation campaigns and projects</div>
        </div>
      </div>
      
      <div class="info-box">
        <h3>💡 What You Can Do Now:</h3>
        <ul style="margin: 10px 0;">
          <li><strong>Digital Giving:</strong> Accept donations with 3.9% + R3 transaction fee</li>
          <li><strong>Project Campaigns:</strong> Create fundraising campaigns for church projects</li>
          <li><strong>Member Management:</strong> Manage your congregation and their giving history</li>
          <li><strong>Financial Analytics:</strong> Track donations, revenue, and growth metrics</li>
          <li><strong>Secure Payouts:</strong> Receive funds directly to your church bank account</li>
        </ul>
      </div>
      
      <p><strong>Important:</strong> This setup link will expire in 24 hours for security reasons. If you need assistance, please contact our support team.</p>
      
      <p>Welcome to the ChurPay family! We're excited to help your church grow and thrive in the digital age.</p>
      
      <p>Blessings,<br>
      <strong>The ChurPay Team</strong></p>
    </div>
    
    <div class="footer">
      <p><strong>ChurPay</strong> - Empowering South African Churches</p>
      <p>If you have any questions, contact us at <a href="mailto:support@churpay.com">support@churpay.com</a></p>
      <p style="font-size: 12px; margin-top: 15px;">
        This is an automated message. Please do not reply to this email.<br>
        If you did not apply for a ChurPay account, please ignore this email.
      </p>
    </div>
  </div>
</body>
</html>`;
  }

  /**
   * Generate rejection email template (for future use)
   * @param churchName Name of the church
   * @param adminEmail Admin email
   * @param reason Rejection reason
   * @returns HTML email content
   */
  generateChurchRejectionEmail(churchName: string, adminEmail: string, reason: string): string {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Church Application Update - ChurPay</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
    <div style="background: #ef4444; color: white; padding: 20px; text-align: center;">
      <h1 style="margin: 0;">Application Update Required</h1>
    </div>
    
    <div style="padding: 30px;">
      <h2>Dear ${churchName} Team,</h2>
      
      <p>Thank you for your interest in joining ChurPay. After reviewing your application, we need some additional information or clarification before we can proceed with approval.</p>
      
      <div style="background: #fef2f2; border: 1px solid #fecaca; border-radius: 6px; padding: 15px; margin: 20px 0;">
        <h3 style="margin-top: 0; color: #dc2626;">Reason for Review:</h3>
        <p style="margin-bottom: 0;">${reason}</p>
      </div>
      
      <p>Please address the above concerns and resubmit your application. If you have any questions, our support team is here to help.</p>
      
      <p>Best regards,<br>
      <strong>The ChurPay Team</strong></p>
    </div>
  </div>
</body>
</html>`;
  }
}

export const emailService = EmailService.getInstance();