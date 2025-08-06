import { randomUUID } from 'crypto';
import { storage } from './storage';
import { emailService } from './emailService';

export class ChurchApprovalService {
  private static instance: ChurchApprovalService;
  
  static getInstance(): ChurchApprovalService {
    if (!ChurchApprovalService.instance) {
      ChurchApprovalService.instance = new ChurchApprovalService();
    }
    return ChurchApprovalService.instance;
  }

  async approveChurch(churchId: string, superAdminId: string): Promise<{ success: boolean; message: string }> {
    try {
      // Get church details
      const church = await storage.getChurch(churchId);
      if (!church) {
        return { success: false, message: 'Church not found' };
      }

      if (church.status !== 'pending') {
        return { success: false, message: 'Church is not in pending status' };
      }

      // Generate password setup token
      const passwordSetupToken = randomUUID();
      const passwordSetupExpiry = new Date();
      passwordSetupExpiry.setHours(passwordSetupExpiry.getHours() + 24); // 24 hours expiry

      // Update church status to approved
      await storage.updateChurch(churchId, {
        status: 'approved',
        passwordSetupToken,
        passwordSetupExpiry,
        approvedAt: new Date(),
        approvedBy: superAdminId
      });

      // Send approval email with password setup link
      const emailSent = await emailService.sendEmail({
        to: church.adminEmail,
        subject: `🎉 ${church.name} - Church Application Approved!`,
        html: emailService.generateChurchApprovalEmail(
          church.name,
          church.adminEmail,
          passwordSetupToken
        ),
        from: 'ChurPay Platform <noreply@churpay.com>'
      });

      if (!emailSent) {
        console.error('Failed to send approval email to:', church.adminEmail);
        // Don't fail the approval, just log the error
      }

      console.log(`✅ Church approved: ${church.name} (${churchId}) by super admin ${superAdminId}`);
      console.log(`📧 Setup email sent to: ${church.adminEmail}`);

      return { 
        success: true, 
        message: `Church approved successfully. Setup email sent to ${church.adminEmail}` 
      };

    } catch (error) {
      console.error('Error approving church:', error);
      return { success: false, message: 'Failed to approve church' };
    }
  }

  async rejectChurch(churchId: string, superAdminId: string, reason: string): Promise<{ success: boolean; message: string }> {
    try {
      // Get church details
      const church = await storage.getChurch(churchId);
      if (!church) {
        return { success: false, message: 'Church not found' };
      }

      if (church.status !== 'pending') {
        return { success: false, message: 'Church is not in pending status' };
      }

      // Update church status to rejected
      await storage.updateChurch(churchId, {
        status: 'rejected',
        approvedBy: superAdminId,
        approvedAt: new Date() // Track when rejection happened
      });

      // Log the rejection
      console.log(`❌ Church rejected: ${church.name} (${churchId}) by super admin ${superAdminId}`);
      console.log(`📝 Rejection reason: ${reason}`);

      // TODO: Could send rejection email to church admin with reason
      // For now, just log it

      return { 
        success: true, 
        message: 'Church application rejected successfully' 
      };

    } catch (error) {
      console.error('Error rejecting church:', error);
      return { success: false, message: 'Failed to reject church' };
    }
  }

  async validatePasswordSetupToken(token: string): Promise<{ valid: boolean; church?: any }> {
    try {
      const church = await storage.getChurchByPasswordToken(token);
      
      if (!church) {
        return { valid: false };
      }

      // Check if token has expired
      if (church.passwordSetupExpiry && new Date() > church.passwordSetupExpiry) {
        return { valid: false };
      }

      return { valid: true, church };

    } catch (error) {
      console.error('Error validating password setup token:', error);
      return { valid: false };
    }
  }

  async completePasswordSetup(token: string, password: string): Promise<{ success: boolean; message: string }> {
    try {
      const validation = await this.validatePasswordSetupToken(token);
      
      if (!validation.valid || !validation.church) {
        return { success: false, message: 'Invalid or expired setup token' };
      }

      const church = validation.church;

      // Create church admin user
      const adminUser = await storage.createChurchAdmin({
        email: church.adminEmail,
        firstName: church.adminFirstName,
        lastName: church.adminLastName,
        password: password, // This should be hashed in the storage layer
        churchId: church.id,
        role: 'church_admin'
      });

      // Update church to link admin user and clear token
      await storage.updateChurch(church.id, {
        adminUserId: adminUser.id,
        passwordSetupToken: null,
        passwordSetupExpiry: null
      });

      console.log(`🔐 Password setup completed for church: ${church.name}`);
      console.log(`👤 Admin user created: ${church.adminEmail}`);

      return { 
        success: true, 
        message: 'Password setup completed successfully. You can now sign in.' 
      };

    } catch (error) {
      console.error('Error completing password setup:', error);
      return { success: false, message: 'Failed to complete password setup' };
    }
  }
}

export const churchApprovalService = ChurchApprovalService.getInstance();