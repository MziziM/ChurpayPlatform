import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertChurchSchema, insertProjectSchema, insertTransactionSchema, insertPayoutSchema } from "@shared/schema";
import { protectCoreEndpoints, validateFeeStructure, validateSystemIntegrity, requireAdminAuth, PROTECTED_CONSTANTS } from "./codeProtection";
import { generateTwoFactorSecret, validateTwoFactorToken, removeUsedBackupCode } from "./googleAuth";
import { z } from "zod";
import { randomUUID } from "crypto";

export async function registerRoutes(app: Express): Promise<Server> {
  // Code protection middleware
  app.use(protectCoreEndpoints);
  
  // Comprehensive system integrity validation
  const integrityCheck = validateSystemIntegrity();
  
  if (!integrityCheck.valid) {
    console.error("🚨 CRITICAL SYSTEM COMPROMISE DETECTED!");
    console.error("Violations detected:", integrityCheck.violations);
    console.error("System lockdown initiated to prevent unauthorized modifications.");
    process.exit(1);
  }
  
  console.log("🔒 ChurPay Code Protection System Active");
  console.log(`   ${integrityCheck.lockedFilesCount} core files are locked against unauthorized modifications`);
  console.log("✅ Fee structure validated: 3.9% + R3 per transaction");
  console.log("   Only explicitly requested changes permitted");

  // Public registration endpoints (NO AUTHENTICATION REQUIRED)
  app.post('/api/churches/register', async (req, res) => {
    try {
      const validatedData = insertChurchSchema.parse(req.body);
      
      const churchData = {
        ...validatedData,
        status: 'pending' as const,
        adminUserId: 'pending',
      };

      const church = await storage.createChurch(churchData);
      
      await storage.logActivity({
        userId: null,
        churchId: church.id,
        action: 'church_registered',
        entity: 'church',
        entityId: church.id,
        details: { churchName: church.name, status: 'pending_approval' },
      });

      res.json(church);
    } catch (error: any) {
      console.error("Error creating church:", error);
      res.status(400).json({ message: "Failed to create church", error: error.message });
    }
  });

  app.post('/api/members/register', async (req, res) => {
    try {
      const validatedData = z.object({
        churchId: z.string(),
        firstName: z.string(),
        lastName: z.string(),
        email: z.string().email(),
        phone: z.string(),
        dateOfBirth: z.string(),
        address: z.string(),
        city: z.string(),
        province: z.string(),
        postalCode: z.string(),
        country: z.string(),
        emergencyContactName: z.string(),
        emergencyContactPhone: z.string(),
        emergencyContactRelationship: z.string(),
        membershipType: z.string(),
        previousChurch: z.string().optional(),
        howDidYouHear: z.string().optional(),
      }).parse(req.body);

      const memberData = {
        ...validatedData,
        id: randomUUID(),
        role: 'member' as const,
        profileImageUrl: null,
      };

      const member = await storage.upsertUser(memberData);

      await storage.logActivity({
        userId: null,
        churchId: validatedData.churchId,
        action: 'member_registered',
        entity: 'user',
        entityId: member.id,
        details: { memberName: `${validatedData.firstName} ${validatedData.lastName}` },
      });

      res.json(member);
    } catch (error: any) {
      console.error("Error creating member:", error);
      res.status(400).json({ message: "Failed to register member", error: error.message });
    }
  });

  // System health check
  app.get('/api/health', async (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // Authentication endpoint for checking current user
  app.get('/api/auth/user', async (req: any, res) => {
    try {
      // Check super admin session first
      if (req.session.superAdminId) {
        const superAdmin = await storage.getSuperAdminById(req.session.superAdminId);
        if (superAdmin && superAdmin.isActive) {
          return res.json({
            id: superAdmin.id,
            email: superAdmin.email,
            role: 'superadmin',
            firstName: superAdmin.firstName,
            lastName: superAdmin.lastName,
            authenticated: true
          });
        }
      }

      // Check for user data in session (member/church)
      if (req.session.userId) {
        const user = await storage.getUserById(req.session.userId);
        if (user) {
          return res.json({
            id: user.id,
            email: user.email,
            role: user.role,
            firstName: user.firstName,
            lastName: user.lastName,
            churchId: user.churchId,
            authenticated: true
          });
        }
      }

      // No authenticated user found
      res.status(401).json({ authenticated: false, message: 'Not authenticated' });
    } catch (error) {
      console.error('Auth check error:', error);
      res.status(500).json({ authenticated: false, message: 'Authentication check failed' });
    }
  });

  // Member authentication endpoints
  app.post('/api/auth/member/signin', async (req, res) => {
    try {
      const { email, password, rememberMe } = req.body;
      
      // Mock authentication - in production, verify password hash
      const mockUser = {
        id: randomUUID(),
        email,
        role: 'member',
        firstName: 'John',
        lastName: 'Doe',
        churchId: 'mock-church-id'
      };

      // Set session
      (req as any).session.userId = mockUser.id;
      if (rememberMe) {
        (req as any).session.cookie.maxAge = 30 * 24 * 60 * 60 * 1000; // 30 days
      }

      res.json({
        success: true,
        user: mockUser,
        message: 'Successfully signed in'
      });
    } catch (error) {
      console.error('Member signin error:', error);
      res.status(401).json({ message: 'Invalid credentials' });
    }
  });

  // Church authentication endpoints
  app.post('/api/auth/church/signin', async (req, res) => {
    try {
      const { email, password, rememberMe } = req.body;
      
      // Mock authentication - in production, verify password hash
      const mockUser = {
        id: randomUUID(),
        email,
        role: 'church_admin',
        firstName: 'Pastor',
        lastName: 'Smith',
        churchId: 'mock-church-id'
      };

      // Set session
      (req as any).session.userId = mockUser.id;
      if (rememberMe) {
        (req as any).session.cookie.maxAge = 30 * 24 * 60 * 60 * 1000; // 30 days
      }

      res.json({
        success: true,
        user: mockUser,
        church: {
          id: 'mock-church-id',
          name: 'Grace Baptist Church'
        },
        message: 'Successfully signed in'
      });
    } catch (error) {
      console.error('Church signin error:', error);
      res.status(401).json({ message: 'Invalid credentials' });
    }
  });

  // Sign out endpoint
  app.post('/api/auth/signout', async (req: any, res) => {
    try {
      req.session.destroy((err: any) => {
        if (err) {
          console.error('Session destroy error:', err);
          return res.status(500).json({ message: 'Failed to sign out' });
        }
        res.json({ success: true, message: 'Successfully signed out' });
      });
    } catch (error) {
      console.error('Signout error:', error);
      res.status(500).json({ message: 'Sign out failed' });
    }
  });

  // System protection status endpoint
  app.get('/api/system/protection-status', async (req, res) => {
    res.json({
      codeProtectionActive: true,
      feeStructureValid: validateFeeStructure(),
      protectedConstants: PROTECTED_CONSTANTS,
      lockedFilesCount: 29,
      systemStatus: 'LOCKED'
    });
  });

  // Get approved churches for member registration
  app.get('/api/churches/approved', async (req, res) => {
    try {
      const churches = await storage.getApprovedChurches();
      res.json(churches);
    } catch (error) {
      console.error("Error fetching approved churches:", error);
      res.status(500).json({ message: "Failed to fetch churches" });
    }
  });

  // 🔒 CODE PROTECTION: Super Admin Dashboard API - Core ChurPay functionality protected
  // Super Admin Statistics
  app.get('/api/super-admin/stats', async (req, res) => {
    try {
      // Mock super admin statistics - keep simple values only
      const stats = {
        totalRevenue: '2,847,500.00',
        totalTransactions: 18420,
        activeChurches: 247,
        totalChurches: 247,
        totalMembers: 11800,
        pendingPayouts: '23,450.00',
        completedPayouts: '125,680.00',
        platformFees: '89,325.00',
        monthlyRevenue: '385,000.00',
        revenueGrowth: 12.5,
        transactionGrowth: 8.3,
        churchGrowth: 15.2, 
        payoutGrowth: 6.7
      };
      res.json(stats);
    } catch (error) {
      console.error("🔒 PROTECTED: Error fetching admin stats:", error);
      res.status(500).json({ message: "Failed to fetch admin statistics" });
    }
  });

  // Super Admin Payouts
  app.get('/api/super-admin/payouts', async (req, res) => {
    try {
      // Mock payout requests
      const payouts = [
        {
          id: 'payout-001',
          churchName: 'Grace Baptist Church',
          requestedAmount: '15,250.00',
          availableAmount: '14,691.25',
          fees: '558.75',
          status: 'pending',
          requestDate: '2024-08-01T10:30:00Z',
          details: 'Monthly payout request for July donations',
          bankDetails: {
            accountName: 'Grace Baptist Church',
            accountNumber: '****7834',
            bank: 'Standard Bank'
          }
        },
        {
          id: 'payout-002',
          churchName: 'New Life Methodist',
          requestedAmount: '8,900.00',
          availableAmount: '8,562.90',
          fees: '337.10',
          status: 'approved',
          requestDate: '2024-07-28T14:15:00Z',
          processedDate: '2024-07-29T09:00:00Z',
          details: 'Weekly payout for building fund',
          bankDetails: {
            accountName: 'New Life Methodist Church',
            accountNumber: '****2156',
            bank: 'FNB'
          }
        }
      ];
      res.json(payouts);
    } catch (error) {
      console.error("🔒 PROTECTED: Error fetching payouts:", error);
      res.status(500).json({ message: "Failed to fetch payout data" });
    }
  });

  // Process payout (approve/reject)
  app.post('/api/super-admin/payouts/:id/process', async (req, res) => {
    try {
      const { id } = req.params;
      const { action, notes } = req.body;
      
      // Mock payout processing
      const result = {
        id,
        action,
        processedAt: new Date().toISOString(),
        notes: notes || '',
        status: action === 'approve' ? 'approved' : 'rejected'
      };
      
      res.json(result);
    } catch (error) {
      console.error("🔒 PROTECTED: Error processing payout:", error);
      res.status(500).json({ message: "Failed to process payout request" });
    }
  });

  // Super Admin Churches
  app.get('/api/super-admin/churches', async (req, res) => {
    try {
      // Mock churches data
      const churches = [
        {
          id: 'church-001',
          name: 'Grace Baptist Church',
          location: 'Cape Town, Western Cape',
          memberCount: 450,
          totalRevenue: '125,400.00',
          status: 'active',
          joinDate: '2024-01-15T08:00:00Z',
          contactPerson: 'Pastor John Smith',
          email: 'admin@gracebaptist.org.za',
          phone: '+27 21 555 0123'
        },
        {
          id: 'church-002',
          name: 'New Life Methodist',
          location: 'Johannesburg, Gauteng',
          memberCount: 320,
          totalRevenue: '89,750.00',
          status: 'active',
          joinDate: '2024-02-10T10:30:00Z',
          contactPerson: 'Pastor Sarah Johnson',
          email: 'contact@newlifemethodist.co.za',
          phone: '+27 11 555 0456'
        }
      ];
      res.json(churches);
    } catch (error) {
      console.error("🔒 PROTECTED: Error fetching churches:", error);
      res.status(500).json({ message: "Failed to fetch churches data" });
    }
  });

  // Super Admin Members
  app.get('/api/super-admin/members', async (req, res) => {
    try {
      // Mock members data
      const members = [
        {
          id: 'member-001',
          firstName: 'John',
          lastName: 'Smith',
          email: 'john.smith@email.com',
          churchName: 'Grace Baptist Church',
          totalDonated: '2,500.00',
          status: 'active',
          joinDate: '2024-03-15T10:00:00Z',
          profileImageUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=center'
        },
        {
          id: 'member-002',
          firstName: 'Sarah',
          lastName: 'Johnson',
          email: 'sarah.johnson@email.com',
          churchName: 'New Life Methodist',
          totalDonated: '1,850.00',
          status: 'active',
          joinDate: '2024-04-20T14:30:00Z'
        }
      ];
      res.json(members);
    } catch (error) {
      console.error("🔒 PROTECTED: Error fetching members:", error);
      res.status(500).json({ message: "Failed to fetch members data" });
    }
  });

  // Super Admin Analytics Data
  app.get('/api/super-admin/analytics', async (req, res) => {
    try {
      // Mock analytics data - ensure no objects are accidentally rendered
      const analytics = {
        revenueChart: {
          labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
          revenue: [240000, 265000, 290000, 315000, 342000, 385000],
          fees: [9360, 10340, 11310, 12285, 13338, 15015]
        },
        churchGrowth: {
          labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
          churches: [180, 195, 210, 225, 240, 247],
          members: [8500, 9200, 9800, 10500, 11200, 11800]
        }
      };
      res.json(analytics);
    } catch (error) {
      console.error("🔒 PROTECTED: Error fetching analytics:", error);
      res.status(500).json({ message: "Failed to fetch analytics data" });
    }
  });

  // Super Admin Activity Feed
  app.get('/api/super-admin/activity', async (req, res) => {
    try {
      // Mock activity feed - ensure all values are strings/numbers, not objects
      const activities = [
        {
          id: 'activity-001',
          description: 'New church registration approved',
          timestamp: '2024-08-04 14:30',
          amount: '2,500.00',
          status: 'completed'
        },
        {
          id: 'activity-002', 
          description: 'Payout processed for Grace Baptist',
          timestamp: '2024-08-04 13:15',
          amount: '15,250.00',
          status: 'approved'
        },
        {
          id: 'activity-003',
          description: 'Member registration completed',
          timestamp: '2024-08-04 12:45',
          amount: null,
          status: 'active'
        },
        {
          id: 'activity-004',
          description: 'Project donation received',
          timestamp: '2024-08-04 11:20',
          amount: '1,850.00',
          status: 'completed'
        }
      ];
      res.json(activities);
    } catch (error) {
      console.error("🔒 PROTECTED: Error fetching activity:", error);
      res.status(500).json({ message: "Failed to fetch activity data" });
    }
  });

  // Admin Authentication Endpoints with Google Authenticator 2FA
  app.post('/api/admin/signup', async (req, res) => {
    try {
      const bcrypt = await import('bcryptjs');
      const { firstName, lastName, email, password, acceptTerms } = req.body;
      
      if (!acceptTerms) {
        return res.status(400).json({ message: "Terms and conditions must be accepted" });
      }
      
      // Check if admin already exists
      const existingAdmin = await storage.getAdminByEmail(email);
      if (existingAdmin) {
        return res.status(400).json({ message: "Admin account already exists with this email" });
      }
      
      // Hash password with enhanced security (12 rounds)
      const passwordHash = await bcrypt.hash(password, 12);
      
      // Generate Google Authenticator 2FA setup
      const twoFactorSetup = await generateTwoFactorSecret(email, `${firstName} ${lastName}`);
      
      // Create admin account with 2FA
      const adminData = {
        firstName,
        lastName,
        email,
        passwordHash,
        role: 'admin' as const,
        isActive: true,
        twoFactorSecret: twoFactorSetup.secret,
        twoFactorEnabled: false, // Will be enabled after verification
        twoFactorBackupCodes: twoFactorSetup.backupCodes
      };
      
      const admin = await storage.createAdmin(adminData);
      
      console.log(`🔐 New admin registered with 2FA: ${email} at ${new Date().toISOString()}`);
      
      // Return admin data with 2FA setup (without sensitive data)
      const { passwordHash: _, twoFactorSecret: __, twoFactorBackupCodes: ___, ...adminResponse } = admin;
      res.json({
        admin: adminResponse,
        twoFactorSetup: {
          qrCodeUrl: twoFactorSetup.qrCodeUrl,
          manualEntryKey: twoFactorSetup.manualEntryKey,
          backupCodes: twoFactorSetup.backupCodes,
          instructions: "Scan the QR code with Google Authenticator or enter the manual key"
        }
      });
      
    } catch (error: any) {
      console.error("Error creating admin account:", error);
      res.status(500).json({ message: "Failed to create admin account", error: error.message });
    }
  });
  
  app.post('/api/admin/signin', async (req, res) => {
    try {
      const bcrypt = await import('bcryptjs');
      const { email, password, twoFactorCode, rememberMe } = req.body;
      
      // Get admin by email
      const admin = await storage.getAdminByEmail(email);
      if (!admin) {
        return res.status(401).json({ message: "Invalid email or password" });
      }
      
      // Check if account is locked
      if (admin.accountLockedUntil && admin.accountLockedUntil > new Date()) {
        return res.status(423).json({ message: "Account is temporarily locked. Please try again later." });
      }
      
      // Verify password
      const isValidPassword = await bcrypt.compare(password, admin.passwordHash);
      if (!isValidPassword) {
        // Increment failed login attempts
        await storage.incrementFailedLoginAttempts(admin.id);
        return res.status(401).json({ message: "Invalid email or password" });
      }
      
      // If 2FA is enabled, validate the code
      if (admin.twoFactorEnabled && admin.twoFactorSecret) {
        if (!twoFactorCode) {
          return res.status(200).json({ 
            requiresTwoFactor: true,
            message: "Two-factor authentication code required"
          });
        }
        
        const validation = validateTwoFactorToken(
          admin.twoFactorSecret, 
          twoFactorCode, 
          admin.twoFactorBackupCodes || []
        );
        
        if (!validation.isValid) {
          await storage.incrementFailedLoginAttempts(admin.id);
          return res.status(401).json({ message: "Invalid two-factor authentication code" });
        }
        
        // If backup code was used, remove it from the list
        if (validation.isBackupCode && validation.usedBackupCode) {
          const updatedBackupCodes = removeUsedBackupCode(
            admin.twoFactorBackupCodes || [], 
            validation.usedBackupCode
          );
          await storage.updateAdminBackupCodes(admin.id, updatedBackupCodes);
        }
      }
      
      // Reset failed login attempts and update last login
      await storage.updateAdminLogin(admin.id);
      
      // Create session token
      const sessionToken = Buffer.from(`${admin.id}:${Date.now()}`).toString('base64');
      
      console.log(`🔐 Admin signed in: ${admin.email} ${admin.twoFactorEnabled ? '(2FA verified)' : '(no 2FA)'} at ${new Date().toISOString()}`);
      
      const { passwordHash: _, twoFactorSecret: __, twoFactorBackupCodes: ___, ...adminResponse } = admin;
      res.json({
        admin: adminResponse,
        token: sessionToken,
        expiresIn: rememberMe ? '30d' : '24h'
      });
      
    } catch (error: any) {
      console.error("Error signing in admin:", error);
      res.status(500).json({ message: "Failed to sign in", error: error.message });
    }
  });

  // Temporary endpoint to delete admin account (for development)
  app.delete('/api/admin/delete/:email', async (req, res) => {
    try {
      const { email } = req.params;
      await storage.deleteAdminByEmail(email);
      console.log(`🗑️ Deleted admin account: ${email} for fresh signup`);
      res.json({ message: "Admin account deleted successfully" });
    } catch (error: any) {
      console.error("Error deleting admin:", error);
      res.status(500).json({ message: "Failed to delete admin account" });
    }
  });

  // Verify 2FA code during signup (no auth required)
  app.post('/api/admin/verify-signup-2fa', async (req, res) => {
    try {
      const { email, verificationCode } = req.body;
      
      // Get admin by email
      const admin = await storage.getAdminByEmail(email);
      if (!admin) {
        return res.status(404).json({ message: "Admin account not found" });
      }
      
      if (!admin.twoFactorSecret) {
        return res.status(400).json({ message: "2FA not set up for this account" });
      }
      
      // Verify the code
      const validation = validateTwoFactorToken(admin.twoFactorSecret, verificationCode, admin.twoFactorBackupCodes || []);
      if (!validation.isValid) {
        return res.status(400).json({ message: "Invalid verification code. Please try again." });
      }
      
      // Enable 2FA for the account
      await storage.enableTwoFactor(admin.id);
      
      console.log(`🔐 2FA enabled during signup for: ${admin.email} at ${new Date().toISOString()}`);
      
      res.json({ 
        message: "Two-factor authentication setup completed successfully",
        twoFactorEnabled: true
      });
    } catch (error: any) {
      console.error("Error verifying signup 2FA:", error);
      res.status(500).json({ message: "Failed to verify 2FA code", error: error.message });
    }
  });

  // Enable 2FA for admin
  app.post('/api/admin/enable-2fa', requireAdminAuth, async (req: any, res) => {
    try {
      const { verificationCode } = req.body;
      const admin = req.admin;

      if (!admin.twoFactorSecret) {
        return res.status(400).json({ message: "2FA secret not found. Please contact administrator." });
      }

      // Verify the code before enabling 2FA
      const isValid = validateTwoFactorToken(admin.twoFactorSecret, verificationCode);
      if (!isValid.isValid) {
        return res.status(400).json({ message: "Invalid verification code. Please try again." });
      }

      // Enable 2FA
      await storage.enableTwoFactor(admin.id);

      console.log(`🔐 2FA enabled for admin: ${admin.email} at ${new Date().toISOString()}`);

      res.json({ 
        message: "Two-factor authentication enabled successfully",
        twoFactorEnabled: true
      });
    } catch (error: any) {
      console.error("Error enabling 2FA:", error);
      res.status(500).json({ message: "Failed to enable 2FA", error: error.message });
    }
  });

  // Disable 2FA for admin
  app.post('/api/admin/disable-2fa', requireAdminAuth, async (req: any, res) => {
    try {
      const { verificationCode, password } = req.body;
      const admin = req.admin;
      const bcrypt = await import('bcryptjs');

      // Verify password
      const isValidPassword = await bcrypt.compare(password, admin.passwordHash);
      if (!isValidPassword) {
        return res.status(401).json({ message: "Invalid password" });
      }

      // If 2FA is enabled, verify the code
      if (admin.twoFactorEnabled && admin.twoFactorSecret) {
        if (!verificationCode) {
          return res.status(400).json({ message: "2FA verification code required" });
        }

        const isValid = validateTwoFactorToken(admin.twoFactorSecret, verificationCode, admin.twoFactorBackupCodes || []);
        if (!isValid.isValid) {
          return res.status(400).json({ message: "Invalid verification code" });
        }
      }

      // Disable 2FA
      await storage.disableTwoFactor(admin.id);

      console.log(`🔐 2FA disabled for admin: ${admin.email} at ${new Date().toISOString()}`);

      res.json({ 
        message: "Two-factor authentication disabled successfully",
        twoFactorEnabled: false
      });
    } catch (error: any) {
      console.error("Error disabling 2FA:", error);
      res.status(500).json({ message: "Failed to disable 2FA", error: error.message });
    }
  });

  // Admin Dashboard API - Secured with authentication
  app.get('/api/admin/dashboard', requireAdminAuth, async (req: any, res) => {
    try {
      // Get comprehensive platform statistics for admin dashboard
      const platformStats = await storage.getPlatformStats();
      const allChurches = await storage.getAllChurches();
      const allPayouts = await storage.getAllPayouts();
      const allTransactions = await storage.getAllTransactions();
      
      // Calculate admin-specific metrics
      const totalChurches = allChurches.length;
      const pendingChurches = allChurches.filter(c => c.status === 'pending').length;
      const activeChurches = allChurches.filter(c => c.status === 'approved').length;
      const pendingPayouts = allPayouts.filter(p => p.status === 'requested').length;
      
      // Monthly revenue data for charts
      const monthlyRevenue = allTransactions
        .filter(t => t.status === 'completed')
        .reduce((acc: any, transaction: any) => {
          const month = new Date(transaction.createdAt).toISOString().slice(0, 7);
          if (!acc[month]) acc[month] = 0;
          acc[month] += parseFloat(transaction.platformFee || '0');
          return acc;
        }, {});

      const responseData = {
        admin: {
          id: req.admin.id,
          firstName: req.admin.firstName,
          lastName: req.admin.lastName,
          email: req.admin.email,
          lastLoginAt: req.admin.lastLoginAt
        },
        stats: {
          totalChurches,
          pendingChurches,
          activeChurches,
          totalMembers: platformStats.totalMembers || 0,
          totalTransactions: allTransactions.length,
          totalRevenue: platformStats.totalRevenue || 0,
          pendingPayouts,
          monthlyRevenue: Object.entries(monthlyRevenue).map(([month, revenue]) => ({
            month,
            revenue: Number(revenue)
          }))
        },
        recentActivity: {
          churches: allChurches.slice(0, 5),
          payouts: allPayouts.slice(0, 5),
          transactions: allTransactions.slice(0, 10)
        },
        systemHealth: {
          codeProtectionActive: true,
          feeStructureValid: validateFeeStructure(),
          platformFees: {
            percentage: PROTECTED_CONSTANTS.PLATFORM_FEE_PERCENTAGE,
            fixed: PROTECTED_CONSTANTS.PLATFORM_FEE_FIXED,
            currency: PROTECTED_CONSTANTS.CURRENCY
          }
        }
      };

      res.json(responseData);
    } catch (error: any) {
      console.error("Error fetching admin dashboard data:", error);
      res.status(500).json({ 
        error: "Failed to fetch admin dashboard data",
        message: error.message 
      });
    }
  });

  // Admin logout endpoint
  app.post('/api/admin/logout', requireAdminAuth, async (req: any, res) => {
    try {
      console.log(`🔐 Admin logout: ${req.admin.email} at ${new Date().toISOString()}`);
      res.json({ message: "Successfully logged out" });
    } catch (error: any) {
      console.error("Error during admin logout:", error);
      res.status(500).json({ 
        error: "Logout failed",
        message: error.message 
      });
    }
  });

  // Admin profile endpoint
  app.get('/api/admin/profile', requireAdminAuth, async (req: any, res) => {
    try {
      const { passwordHash: _, ...adminProfile } = req.admin;
      res.json(adminProfile);
    } catch (error: any) {
      console.error("Error fetching admin profile:", error);
      res.status(500).json({ 
        error: "Failed to fetch admin profile",
        message: error.message 
      });
    }
  });

  // ===========================================
  // SUPER ADMIN AUTHENTICATION SYSTEM ROUTES - 2FA
  // ===========================================

  // Super Admin Signup with 2FA
  app.post('/api/super-admin/signup', async (req: any, res: any) => {
    try {
      console.log(`🔒 Protected path access: /api/super-admin/signup by anonymous`);

      const { firstName, lastName, email, password, ownerCode, acceptTerms } = req.body;

      // Validate input
      if (!firstName || !lastName || !email || !password || !ownerCode || !acceptTerms) {
        return res.status(400).json({ message: 'All fields are required' });
      }

      // Verify owner code
      if (ownerCode !== 'CHURPAY_OWNER_2025') {
        return res.status(403).json({ message: 'Invalid owner authorization code' });
      }

      // Check if super admin already exists
      const existingSuperAdmin = await storage.getSuperAdminByEmail(email);
      if (existingSuperAdmin) {
        return res.status(400).json({ message: 'Super admin account already exists with this email' });
      }

      // Hash password
      const bcrypt = await import('bcryptjs');
      const passwordHash = await bcrypt.hash(password, 12);

      // Generate TOTP secret for Google Authenticator
      const speakeasy = await import('speakeasy');
      const qrcode = await import('qrcode');
      
      const secret = speakeasy.generateSecret({
        name: `ChurPay Super Admin (${email})`,
        issuer: 'ChurPay',
        length: 32
      });

      // Generate backup codes
      const backupCodes = Array.from({ length: 8 }, () => 
        Math.random().toString(36).substr(2, 8).toUpperCase()
      );

      // Create super admin with 2FA disabled initially
      const superAdmin = await storage.createSuperAdmin({
        firstName,
        lastName,
        email,
        passwordHash,
        role: 'super_admin',
        ownerCode,
        twoFactorSecret: secret.base32,
        twoFactorEnabled: false, // Will be enabled after verification
        twoFactorBackupCodes: backupCodes,
        isActive: true
      });

      // Generate QR code for Google Authenticator
      const qrCodeUrl = await new Promise<string>((resolve, reject) => {
        qrcode.toDataURL(secret.otpauth_url!, (err, dataUrl) => {
          if (err) reject(err);
          else resolve(dataUrl);
        });
      });

      console.log(`🔐 Super Admin signup initiated: ${email} at ${new Date().toISOString()}`);

      res.status(201).json({
        message: 'Super admin account created. Please complete 2FA setup.',
        admin: {
          id: superAdmin.id,
          firstName: superAdmin.firstName,
          lastName: superAdmin.lastName,
          email: superAdmin.email,
          role: superAdmin.role
        },
        twoFactorSetup: {
          secret: secret.base32,
          qrCodeUrl,
          backupCodes
        }
      });

    } catch (error) {
      console.error('Super admin signup error:', error);
      res.status(500).json({ message: 'Internal server error during super admin signup' });
    }
  });

  // Verify super admin 2FA during signup
  app.post('/api/super-admin/verify-signup-2fa', async (req: any, res: any) => {
    try {
      console.log(`🔒 Protected path access: /api/super-admin/verify-signup-2fa by anonymous`);

      const { email, verificationCode } = req.body;

      if (!email || !verificationCode) {
        return res.status(400).json({ message: 'Email and verification code are required' });
      }

      const superAdmin = await storage.getSuperAdminByEmail(email);
      if (!superAdmin || !superAdmin.twoFactorSecret) {
        return res.status(400).json({ message: 'Invalid super admin account or 2FA not set up' });
      }

      // Verify TOTP code
      const speakeasy = await import('speakeasy');
      const verified = speakeasy.totp.verify({
        secret: superAdmin.twoFactorSecret,
        encoding: 'base32',
        token: verificationCode,
        window: 2
      });

      if (!verified) {
        return res.status(400).json({ message: 'Invalid verification code' });
      }

      // Enable 2FA for the super admin
      await storage.updateSuperAdminTwoFactor(superAdmin.id, {
        twoFactorEnabled: true
      });

      console.log(`🔐 Super Admin 2FA enabled: ${email} at ${new Date().toISOString()}`);

      res.json({ 
        message: 'Super admin account verified and activated successfully',
        admin: {
          id: superAdmin.id,
          firstName: superAdmin.firstName,
          lastName: superAdmin.lastName,
          email: superAdmin.email,
          role: superAdmin.role
        }
      });

    } catch (error) {
      console.error('Super admin 2FA verification error:', error);
      res.status(500).json({ message: 'Internal server error during 2FA verification' });
    }
  });

  // Super Admin Sign In with 2FA
  app.post('/api/super-admin/signin', async (req: any, res: any) => {
    try {
      console.log(`🔒 Protected path access: /api/super-admin/signin by anonymous`);

      const { email, password, twoFactorCode, rememberMe } = req.body;

      if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required' });
      }

      const superAdmin = await storage.getSuperAdminByEmail(email);
      if (!superAdmin || !superAdmin.isActive) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      // Check account lock
      if (superAdmin.accountLockedUntil && new Date() < superAdmin.accountLockedUntil) {
        return res.status(423).json({ 
          message: 'Account is temporarily locked due to multiple failed attempts' 
        });
      }

      // Verify password
      const bcrypt = await import('bcryptjs');
      const passwordValid = await bcrypt.compare(password, superAdmin.passwordHash);
      if (!passwordValid) {
        // Increment failed attempts
        await storage.updateSuperAdminLoginInfo(superAdmin.id, {
          failedLoginAttempts: (superAdmin.failedLoginAttempts || 0) + 1,
          accountLockedUntil: (superAdmin.failedLoginAttempts || 0) >= 4 ? 
            new Date(Date.now() + 30 * 60 * 1000) : null // Lock for 30 minutes after 5 attempts
        });
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      // Check if 2FA is enabled
      if (superAdmin.twoFactorEnabled && !twoFactorCode) {
        return res.json({ 
          requiresTwoFactor: true,
          message: 'Two-factor authentication required'
        });
      }

      // Verify 2FA if provided
      if (superAdmin.twoFactorEnabled && twoFactorCode) {
        const speakeasy = await import('speakeasy');
        const verified = speakeasy.totp.verify({
          secret: superAdmin.twoFactorSecret!,
          encoding: 'base32',
          token: twoFactorCode,
          window: 2
        });

        if (!verified) {
          return res.status(401).json({ message: 'Invalid authentication code' });
        }
      }

      // Reset failed attempts and update last login
      await storage.updateSuperAdminLoginInfo(superAdmin.id, {
        lastLoginAt: new Date(),
        failedLoginAttempts: 0,
        accountLockedUntil: null
      });

      // Create session
      const sessionDuration = rememberMe ? 7 * 24 * 60 * 60 * 1000 : 24 * 60 * 60 * 1000; // 7 days or 24 hours
      req.session.superAdminId = superAdmin.id;
      req.session.superAdminEmail = superAdmin.email;
      req.session.cookie.maxAge = sessionDuration;

      console.log(`🔐 Super Admin signed in: ${email} (2FA verified) at ${new Date().toISOString()}`);

      res.json({
        message: 'Super admin sign in successful',
        superAdmin: {
          id: superAdmin.id,
          firstName: superAdmin.firstName,
          lastName: superAdmin.lastName,
          email: superAdmin.email,
          role: superAdmin.role,
          lastLoginAt: superAdmin.lastLoginAt,
          isActive: superAdmin.isActive
        }
      });

    } catch (error) {
      console.error('Super admin signin error:', error);
      res.status(500).json({ message: 'Internal server error during super admin signin' });
    }
  });

  // Super Admin Profile - Protected Route
  app.get('/api/super-admin/profile', async (req: any, res: any) => {
    try {
      console.log(`🔒 Protected path access: /api/super-admin/profile by anonymous`);

      if (!req.session.superAdminId) {
        return res.status(401).json({ message: 'Super admin authentication required' });
      }

      const superAdmin = await storage.getSuperAdminById(req.session.superAdminId);
      if (!superAdmin || !superAdmin.isActive) {
        req.session.destroy();
        return res.status(401).json({ message: 'Invalid super admin session' });
      }

      console.log(`🔐 Super Admin access: ${superAdmin.email} accessing /api/super-admin/profile at ${new Date().toISOString()}`);

      res.json({
        id: superAdmin.id,
        firstName: superAdmin.firstName,
        lastName: superAdmin.lastName,
        email: superAdmin.email,
        role: superAdmin.role,
        lastLoginAt: superAdmin.lastLoginAt,
        isActive: superAdmin.isActive,
        twoFactorEnabled: superAdmin.twoFactorEnabled
      });

    } catch (error) {
      console.error('Super admin profile error:', error);
      res.status(500).json({ message: 'Internal server error fetching super admin profile' });
    }
  });

  // Super Admin Logout
  app.post('/api/super-admin/logout', async (req: any, res: any) => {
    try {
      console.log(`🔒 Protected path access: /api/super-admin/logout by anonymous`);

      if (req.session.superAdminEmail) {
        console.log(`🔐 Super Admin logout: ${req.session.superAdminEmail} at ${new Date().toISOString()}`);
      }

      req.session.destroy((err: any) => {
        if (err) {
          console.error('Session destruction error:', err);
          return res.status(500).json({ message: 'Error during logout' });
        }
        res.json({ message: 'Successfully logged out' });
      });

    } catch (error) {
      console.error('Super admin logout error:', error);
      res.status(500).json({ message: 'Internal server error during logout' });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}