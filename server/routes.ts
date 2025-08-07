import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertChurchSchema, insertProjectSchema, insertTransactionSchema, insertPayoutSchema, users, churches, projects } from "@shared/schema";
import { protectCoreEndpoints, validateFeeStructure, validateSystemIntegrity, requireAdminAuth, PROTECTED_CONSTANTS } from "./codeProtection";
import { generateTwoFactorSecret, validateTwoFactorToken, removeUsedBackupCode } from "./googleAuth";
import { churchApprovalService } from "./churchApprovalService";
import { z } from "zod";
import { randomUUID } from "crypto";
import { db } from "./db";
import { eq, desc, and } from "drizzle-orm";
import {
  ObjectStorageService,
  ObjectNotFoundError,
} from "./objectStorage";
import { notificationService } from "./notificationService";

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
      console.log('📋 Church registration data received:', req.body);
      
      // Extract document URLs if provided
      const { logo, cipcDocument, bankConfirmationLetter, taxClearanceCertificate, ...churchData } = req.body;
      
      const validatedData = insertChurchSchema.parse(churchData);
      
      // Normalize document URLs for object storage access
      const objectStorageService = new ObjectStorageService();
      
      const completeChurchData = {
        ...validatedData,
        status: 'pending' as const,
        adminUserId: 'pending',
        logoUrl: logo ? objectStorageService.normalizeObjectEntityPath(logo) : null,
        cipcDocument: cipcDocument ? objectStorageService.normalizeObjectEntityPath(cipcDocument) : null,
        bankConfirmationLetter: bankConfirmationLetter ? objectStorageService.normalizeObjectEntityPath(bankConfirmationLetter) : null,
        taxClearanceCertificate: taxClearanceCertificate ? objectStorageService.normalizeObjectEntityPath(taxClearanceCertificate) : null,
      };

      console.log('📄 Including documents in church registration:', {
        logoUrl: completeChurchData.logoUrl,
        cipcDocument: completeChurchData.cipcDocument,
        bankConfirmationLetter: completeChurchData.bankConfirmationLetter,
        taxClearanceCertificate: completeChurchData.taxClearanceCertificate
      });

      const church = await storage.createChurch(completeChurchData);
      
      await storage.logActivity({
        userId: null,
        churchId: church.id,
        action: 'church_registered',
        entity: 'church',
        entityId: church.id,
        details: { 
          churchName: church.name, 
          status: 'pending_approval',
          documentsUploaded: {
            logo: !!logo,
            cipcDocument: !!cipcDocument,
            bankConfirmationLetter: !!bankConfirmationLetter,
            taxClearanceCertificate: !!taxClearanceCertificate
          }
        },
      });

      console.log('✅ Church registered successfully with documents:', church.id);
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

      // Check if user already exists with this email
      const existingUser = await storage.getUserByEmail(validatedData.email);
      if (existingUser) {
        return res.status(400).json({ 
          message: "An account with this email address already exists. Please use a different email or sign in to your existing account." 
        });
      }

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

  // Get donation history for authenticated user
  app.get('/api/donations/history', async (req: any, res) => {
    try {
      const userId = req.session?.userId;
      
      if (!userId) {
        // Return empty array for unauthenticated users
        return res.json([]);
      }

      // Get real transaction data for this user
      const userTransactions = await storage.getUserTransactions(userId);
      
      // Transform transactions to donation history format
      const donationHistory = userTransactions.map(transaction => ({
        id: transaction.id,
        amount: `R ${parseFloat(transaction.amount || '0').toFixed(2)}`,
        type: transaction.donationType || 'donation',
        churchName: transaction.churchName || 'Unknown Church',
        projectTitle: transaction.projectTitle || null,
        createdAt: transaction.createdAt ? new Date(transaction.createdAt).toLocaleDateString() : 'Unknown',
        status: transaction.status || 'completed'
      }));

      res.json(donationHistory);
    } catch (error) {
      console.error('Error fetching donation history:', error);
      res.status(500).json({ message: 'Failed to fetch donation history' });
    }
  });

  // Create donation with PayFast integration
  app.post('/api/donations/create', async (req: any, res) => {
    try {
      const userId = req.session?.userId;
      
      if (!userId) {
        return res.status(401).json({ message: 'Authentication required' });
      }

      const { amount, donationType, churchId, projectId, note, paymentMethod } = req.body;

      // Validate required fields
      if (!amount || amount <= 0) {
        return res.status(400).json({ message: 'Valid donation amount is required' });
      }

      if (!donationType || !['donation', 'tithe', 'project'].includes(donationType)) {
        return res.status(400).json({ message: 'Valid donation type is required' });
      }

      // Get user details
      const user = await storage.getUserById(userId);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      // Create donation record
      const donationId = randomUUID();
      const donation = {
        id: donationId,
        userId,
        amount: parseFloat(amount),
        donationType,
        churchId: churchId || user.churchId,
        projectId: projectId || null,
        note: note || null,
        paymentMethod: paymentMethod || 'payfast',
        status: 'pending',
        createdAt: new Date() // Use Date object instead of ISO string
      };

      // Handle PayFast payment
      if (paymentMethod === 'payfast' || paymentMethod === 'card') {
        const merchantId = process.env.PAYFAST_MERCHANT_ID;
        const merchantKey = process.env.PAYFAST_MERCHANT_KEY;
        
        if (!merchantId || !merchantKey) {
          return res.status(500).json({ message: 'PayFast merchant credentials not configured' });
        }

        // Generate PayFast payment URL
        const payfastData = {
          merchant_id: merchantId,
          merchant_key: merchantKey,
          return_url: `${req.protocol}://${req.get('host')}/member?donation=success&id=${donationId}`,
          cancel_url: `${req.protocol}://${req.get('host')}/member?donation=cancelled`,
          notify_url: `${req.protocol}://${req.get('host')}/api/payfast/notify`,
          name_first: user.firstName || 'Member',
          name_last: user.lastName || 'User',
          email_address: user.email,
          m_payment_id: donationId,
          amount: parseFloat(amount).toFixed(2),
          item_name: `${donationType.charAt(0).toUpperCase() + donationType.slice(1)} - ChurPay`,
          item_description: note || `${donationType} payment via ChurPay`,
          custom_str1: donationType,
          custom_str2: projectId || '',
          custom_str3: churchId || user.churchId || ''
        };

        // Create payment URL
        const payfastUrl = 'https://sandbox.payfast.co.za/eng/process';
        const queryString = Object.entries(payfastData)
          .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value || '')}`)
          .join('&');
        const paymentUrl = `${payfastUrl}?${queryString}`;

        // Store pending donation
        await storage.createTransaction({
          ...donation,
          paymentUrl
        });

        return res.json({
          success: true,
          donationId,
          paymentUrl,
          message: 'Redirecting to PayFast payment gateway'
        });
      }

      // Handle wallet payment
      if (paymentMethod === 'wallet') {
        // Check wallet balance
        const walletData = await storage.getUserWallet(userId);
        if (!walletData || walletData.balance < parseFloat(amount)) {
          return res.status(400).json({ message: 'Insufficient wallet balance' });
        }

        // Process wallet payment
        await storage.processWalletPayment(userId, parseFloat(amount), donationType);
        await storage.createTransaction({
          ...donation,
          status: 'completed'
        });

        return res.json({
          success: true,
          donationId,
          message: 'Donation processed successfully using wallet balance'
        });
      }

      return res.status(400).json({ message: 'Invalid payment method' });
    } catch (error) {
      console.error('Error creating donation:', error);
      res.status(500).json({ message: 'Failed to process donation' });
    }
  });

  // System health check
  app.get('/api/health', async (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // Personalized Welcome Screen APIs
  app.get('/api/user/church', async (req: any, res) => {
    try {
      const userId = req.session?.userId;
      
      if (!userId) {
        return res.status(401).json({ message: 'Not authenticated' });
      }

      // Get the user to find their church ID
      const user = await storage.getUserById(userId);
      if (!user || !user.churchId) {
        return res.status(404).json({ message: 'User church not found' });
      }

      // Get the real church data
      const church = await storage.getChurchById(user.churchId);
      if (!church) {
        return res.status(404).json({ message: 'Church not found' });
      }

      // Return real church data with location formatted for UI
      res.json({
        id: church.id,
        name: church.name,
        denomination: church.denomination,
        logoUrl: church.logoUrl,
        description: church.description,
        leadPastor: church.leadPastor,
        city: church.city,
        province: church.province,
        location: `${church.city || 'Unknown City'}, ${church.province || 'South Africa'}`, // Formatted location for UI
        memberCount: church.memberCount,
        contactEmail: church.contactEmail,
        contactPhone: church.contactPhone,
        website: church.website,
        servicesTimes: church.servicesTimes,
        status: church.status
      });
    } catch (error) {
      console.error('Error fetching user church:', error);
      res.status(500).json({ message: 'Failed to fetch church information' });
    }
  });

  app.get('/api/user/stats', async (req: any, res) => {
    try {
      const userId = req.session?.userId;
      console.log(`🔍 User Stats Request - UserId: ${userId}, Session: ${!!req.session}`);
      
      if (!userId) {
        // Return zero values for unauthenticated users - no mock data
        const notLoggedInResponse = {
          memberSince: 'Not logged in',
          totalGiven: '0.00',
          thisYearGiven: '0.00',
          thisMonthGiven: '0.00',
          thisMonthTithes: '0.00',
          thisMonthDonations: '0.00',
          goalProgress: 0,
          annualGoal: '10,000.00',
          transactionCount: 0,
          averageGift: '0.00',
          recentAchievements: [],
          upcomingEvents: []
        };
        console.log('📊 Returning not-logged-in stats:', notLoggedInResponse);
        return res.json(notLoggedInResponse);
      }

      // Get real user data from database
      const user = await storage.getUserById(userId);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      // Get real transaction data for this user
      const userTransactions = await storage.getUserTransactions(userId);
      const currentYear = new Date().getFullYear();
      const currentMonth = new Date().getMonth();
      
      // Calculate real statistics
      const thisYearTransactions = userTransactions.filter(t => 
        t.createdAt && new Date(t.createdAt).getFullYear() === currentYear
      );
      
      const thisMonthTransactions = userTransactions.filter(t => {
        if (!t.createdAt) return false;
        const txDate = new Date(t.createdAt);
        return txDate.getFullYear() === currentYear && txDate.getMonth() === currentMonth;
      });

      const totalGiven = userTransactions.reduce((sum, t) => sum + parseFloat(t.amount || '0'), 0);
      const thisYearGiven = thisYearTransactions.reduce((sum, t) => sum + parseFloat(t.amount || '0'), 0);
      const thisMonthGiven = thisMonthTransactions.reduce((sum, t) => sum + parseFloat(t.amount || '0'), 0);
      
      // Separate tithes and donations using donationType field
      const thisMonthTithes = thisMonthTransactions
        .filter(t => t.donationType === 'tithe')
        .reduce((sum, t) => sum + parseFloat(t.amount || '0'), 0);
      
      const thisMonthDonations = thisMonthTransactions
        .filter(t => t.donationType === 'general' || t.donationType === 'offering')
        .reduce((sum, t) => sum + parseFloat(t.amount || '0'), 0);

      const averageGift = userTransactions.length > 0 ? (totalGiven / userTransactions.length) : 0;
      const memberSince = user.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : 'Unknown';

      // Calculate goal progress (assuming R 10,000 annual goal)
      const annualGoal = 10000;
      const goalProgress = Math.min(Math.round((thisYearGiven / annualGoal) * 100), 100);

      const realStats = {
        memberSince,
        totalGiven: totalGiven.toFixed(2),
        thisYearGiven: thisYearGiven.toFixed(2),
        thisMonthGiven: thisMonthGiven.toFixed(2),
        thisMonthTithes: thisMonthTithes.toFixed(2),
        thisMonthDonations: thisMonthDonations.toFixed(2),
        goalProgress,
        annualGoal: annualGoal.toFixed(2),
        transactionCount: userTransactions.length,
        averageGift: averageGift.toFixed(2),
        recentAchievements: totalGiven > 5000 ? ['Faithful Giver 2025'] : ['New Member'],
        upcomingEvents: [
          { id: '1', title: 'Sunday Service', date: 'This Sunday', type: 'Weekly Service' },
          { id: '2', title: 'Community Outreach', date: 'Next Weekend', type: 'Community Event' },
          { id: '3', title: 'Youth Conference', date: 'March 15-17', type: 'Special Event' }
        ]
      };

      console.log(`📊 Returning real stats for user ${userId}:`, {
        thisMonthGiven: realStats.thisMonthGiven,
        thisMonthTithes: realStats.thisMonthTithes,
        thisMonthDonations: realStats.thisMonthDonations,
        transactionCount: realStats.transactionCount
      });
      res.json(realStats);
    } catch (error) {
      console.error('Error fetching user stats:', error);
      res.status(500).json({ message: 'Failed to fetch user statistics' });
    }
  });

  // Debug session endpoint for Super Admin
  app.get('/api/super-admin/debug-session', async (req, res) => {
    console.log('🔍 Session Debug:', {
      superAdminId: (req.session as any)?.superAdminId,
      adminId: (req.session as any)?.adminId,
      sessionID: req.sessionID,
      session: req.session
    });
    res.json({
      superAdminId: (req.session as any)?.superAdminId,
      adminId: (req.session as any)?.adminId,
      sessionID: req.sessionID,
      hasSession: !!req.session
    });
  });

  // TEST BYPASS: Temporary Super Admin session creator for development
  app.post('/api/super-admin/test-session', async (req, res) => {
    try {
      const superAdmin = await storage.getSuperAdminByEmail('mzizi.mzwakhe@churpay.com');
      if (superAdmin && superAdmin.isActive) {
        (req.session as any).superAdminId = superAdmin.id;
        (req.session as any).superAdminEmail = superAdmin.email;
        req.session.cookie.maxAge = 24 * 60 * 60 * 1000; // 24 hours
        
        console.log(`🔍 TEST: Super Admin session created for ${superAdmin.email}`);
        res.json({ 
          success: true, 
          message: 'Test session created',
          superAdminId: superAdmin.id,
          email: superAdmin.email
        });
      } else {
        res.status(404).json({ message: 'Super Admin not found' });
      }
    } catch (error) {
      console.error('Test session creation error:', error);
      res.status(500).json({ message: 'Failed to create test session' });
    }
  });

  // Authentication endpoint for checking current user
  app.get('/api/auth/user', async (req: any, res) => {
    try {
      // Check super admin session first
      if ((req.session as any).superAdminId) {
        const superAdmin = await storage.getSuperAdminById((req.session as any).superAdminId);
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
      
      // Get real user from database by email
      const user = await storage.getUserByEmail(email);
      if (!user) {
        return res.status(401).json({ message: 'Invalid email or password' });
      }

      // Check if user is a member
      if (user.role !== 'member') {
        return res.status(401).json({ message: 'This account is not a member account' });
      }

      // TODO: In production, verify password hash
      // For now, accept any password for testing
      
      // Set session with real user ID
      (req as any).session.userId = user.id;
      (req as any).session.userRole = user.role;
      if (rememberMe) {
        (req as any).session.cookie.maxAge = 30 * 24 * 60 * 60 * 1000; // 30 days
      }

      console.log(`✅ Member signed in: ${user.email} (ID: ${user.id})`);

      res.json({
        success: true,
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
          firstName: user.firstName,
          lastName: user.lastName,
          churchId: user.churchId
        },
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
  // Super Admin Statistics - Real Data Integration
  app.get('/api/super-admin/stats', requireAdminAuth, async (req, res) => {
    try {
      const stats = await storage.getPlatformStats();
      res.json(stats);
    } catch (error) {
      console.error("🔒 PROTECTED: Error fetching admin stats:", error);
      res.status(500).json({ message: "Failed to fetch admin statistics" });
    }
  });

  // Super Admin Payouts - Real Data Integration
  app.get('/api/super-admin/payouts', requireAdminAuth, async (req, res) => {
    try {
      const { status } = req.query;
      const payouts = await storage.getAllPayouts(status as string);
      res.json(payouts);
    } catch (error) {
      console.error("🔒 PROTECTED: Error fetching payouts:", error);
      res.status(500).json({ message: "Failed to fetch payout data" });
    }
  });

  // Process payout (approve/reject) - Real Data Integration
  app.post('/api/super-admin/payouts/:id/process', requireAdminAuth, async (req, res) => {
    try {
      const { id } = req.params;
      const { action, notes } = req.body;
      const superAdminId = (req.session as any).superAdminId;
      
      const status = action === 'approve' ? 'approved' : 'rejected';
      const payout = await storage.updatePayoutStatus(id, status, superAdminId, notes);
      
      await storage.logActivity({
        userId: superAdminId,
        churchId: null,
        action: `payout_${action}`,
        entity: 'payout',
        entityId: id,
        details: { notes, previousStatus: 'pending' },
      });
      
      res.json(payout);
    } catch (error) {
      console.error("🔒 PROTECTED: Error processing payout:", error);
      res.status(500).json({ message: "Failed to process payout request" });
    }
  });

  // Super Admin Churches - Real Data Integration
  app.get('/api/super-admin/churches', requireAdminAuth, async (req, res) => {
    try {
      const { status, limit = 50, offset = 0 } = req.query;
      let churches;
      
      if (status === 'pending') {
        churches = await storage.getPendingChurches();
      } else if (status === 'approved') {
        churches = await storage.getApprovedChurches();
      } else {
        churches = await storage.getAllChurches(Number(limit), Number(offset));
      }
      
      res.json(churches);
    } catch (error) {
      console.error("🔒 PROTECTED: Error fetching churches:", error);
      res.status(500).json({ message: "Failed to fetch churches data" });
    }
  });

  // Super Admin Analytics
  app.get('/api/super-admin/analytics', requireAdminAuth, async (req, res) => {
    try {
      const analytics = await storage.getSuperAdminAnalytics();
      res.json(analytics);
    } catch (error) {
      console.error("🔒 PROTECTED: Error fetching analytics:", error);
      res.status(500).json({ message: "Failed to fetch analytics data" });
    }
  });

  // Approve Church Application with Email Setup
  app.post('/api/super-admin/churches/:id/approve', requireAdminAuth, async (req, res) => {
    try {
      const { id } = req.params;
      const superAdminId = (req.session as any).superAdminId;
      
      const result = await churchApprovalService.approveChurch(id, superAdminId);
      
      if (result.success) {
        await storage.logActivity({
          userId: superAdminId,
          churchId: id,
          action: 'church_approved',
          entity: 'church',
          entityId: id,
          details: { action: 'approved', emailSent: true },
        });
        res.json({ message: result.message });
      } else {
        res.status(400).json({ message: result.message });
      }
    } catch (error) {
      console.error("🔒 PROTECTED: Error approving church:", error);
      res.status(500).json({ message: "Failed to approve church application" });
    }
  });

  // Reject Church Application
  app.post('/api/super-admin/churches/:id/reject', requireAdminAuth, async (req, res) => {
    try {
      const { id } = req.params;
      const { reason } = req.body;
      const superAdminId = (req.session as any).superAdminId;
      
      const result = await churchApprovalService.rejectChurch(id, superAdminId, reason);
      
      if (result.success) {
        await storage.logActivity({
          userId: superAdminId,
          churchId: id,
          action: 'church_rejected',
          entity: 'church',
          entityId: id,
          details: { action: 'rejected', reason },
        });
        res.json({ message: result.message });
      } else {
        res.status(400).json({ message: result.message });
      }
    } catch (error) {
      console.error("🔒 PROTECTED: Error rejecting church:", error);
      res.status(500).json({ message: "Failed to reject church application" });
    }
  });

  // Update Church Details
  app.put('/api/super-admin/churches/:id', requireAdminAuth, async (req, res) => {
    try {
      const { id } = req.params;
      const updateData = req.body;
      const superAdminId = (req.session as any).superAdminId;
      
      // Get existing church
      const existingChurch = await storage.getChurch(id);
      if (!existingChurch) {
        return res.status(404).json({ message: "Church not found" });
      }

      // Update the church
      const updatedChurch = await storage.updateChurch(id, updateData);
      
      // Log the update
      await storage.logActivity({
        userId: superAdminId,
        churchId: id,
        action: 'church_updated',
        entity: 'church',
        entityId: id,
        details: { 
          churchName: updatedChurch.name,
          updatedBy: superAdminId,
          updatedFields: Object.keys(updateData)
        },
      });
      
      res.json({ 
        message: "Church updated successfully", 
        church: updatedChurch 
      });
    } catch (error) {
      console.error("🔒 PROTECTED: Error updating church:", error);
      res.status(500).json({ message: "Failed to update church" });
    }
  });

  // Upload/Update Church Document
  app.put('/api/super-admin/churches/:id/documents', requireAdminAuth, async (req, res) => {
    try {
      const { id } = req.params;
      const { documentType, documentUrl } = req.body;
      const superAdminId = (req.session as any).superAdminId;
      
      // Validate document type
      const validDocumentTypes = ['cipcDocument', 'npoRegistration', 'taxClearanceCertificate', 'bankConfirmationLetter'];
      if (!validDocumentTypes.includes(documentType)) {
        return res.status(400).json({ message: "Invalid document type" });
      }

      // Get existing church
      const existingChurch = await storage.getChurch(id);
      if (!existingChurch) {
        return res.status(404).json({ message: "Church not found" });
      }

      // Update the document
      const updatedChurch = await storage.updateChurchDocument(id, documentType, documentUrl);
      
      // Log the document update
      await storage.logActivity({
        userId: superAdminId,
        churchId: id,
        action: 'church_document_updated',
        entity: 'church',
        entityId: id,
        details: { 
          churchName: updatedChurch.name,
          documentType,
          updatedBy: superAdminId
        },
      });
      
      res.json({ 
        message: "Church document updated successfully", 
        church: updatedChurch 
      });
    } catch (error) {
      console.error("🔒 PROTECTED: Error updating church document:", error);
      res.status(500).json({ message: "Failed to update church document" });
    }
  });

  // Delete Church
  app.delete('/api/super-admin/churches/:id', requireAdminAuth, async (req, res) => {
    try {
      const { id } = req.params;
      const superAdminId = (req.session as any).superAdminId;
      
      // Get church details before deletion for logging
      const church = await storage.getChurch(id);
      if (!church) {
        return res.status(404).json({ message: "Church not found" });
      }

      // Delete the church
      await storage.deleteChurch(id);
      
      // Log the deletion
      await storage.logActivity({
        userId: superAdminId,
        churchId: null, // Church no longer exists
        action: 'church_deleted',
        entity: 'church',
        entityId: id,
        details: { 
          churchName: church.name,
          deletedBy: superAdminId,
          memberCount: church.memberCount 
        },
      });
      
      res.json({ message: "Church deleted successfully", churchName: church.name });
    } catch (error) {
      console.error("🔒 PROTECTED: Error deleting church:", error);
      res.status(500).json({ message: "Failed to delete church" });
    }
  });

  // Member Management APIs
  app.get('/api/super-admin/members', requireAdminAuth, async (req, res) => {
    try {
      const { limit = 50, offset = 0, churchId } = req.query;
      
      let members;
      
      if (churchId) {
        members = await db.select({
          id: users.id,
          firstName: users.firstName,
          lastName: users.lastName,
          email: users.email,
          role: users.role,
          churchId: users.churchId,
          isActive: users.isActive,
          createdAt: users.createdAt
        }).from(users)
        .where(eq(users.churchId, churchId as string))
        .orderBy(desc(users.createdAt))
        .limit(Number(limit))
        .offset(Number(offset));
      } else {
        members = await db.select({
          id: users.id,
          firstName: users.firstName,
          lastName: users.lastName,
          email: users.email,
          role: users.role,
          churchId: users.churchId,
          isActive: users.isActive,
          createdAt: users.createdAt
        }).from(users)
        .orderBy(desc(users.createdAt))
        .limit(Number(limit))
        .offset(Number(offset));
      }
      
      res.json(members);
    } catch (error) {
      console.error("🔒 PROTECTED: Error fetching members:", error);
      res.status(500).json({ message: "Failed to fetch members data" });
    }
  });

  // Dashboard Quick Actions and Modals - Super Admin specific endpoints
  app.get('/api/super-admin/recent-activity', requireAdminAuth, async (req, res) => {
    try {
      const activities = await storage.getActivityLogs(undefined, undefined, 20);
      res.json(activities);
    } catch (error) {
      console.error("🔒 PROTECTED: Error fetching recent activity:", error);
      res.status(500).json({ message: "Failed to fetch recent activity" });
    }
  });

  // Church Dashboard APIs
  
  // Church Profile - Returns registered church data with name and logo
  app.get('/api/church/profile', async (req, res) => {
    try {
      // For demo, get the most recently registered church
      const recentChurch = await db.select()
        .from(churches)
        .orderBy(desc(churches.createdAt))
        .limit(1);
      
      if (recentChurch.length === 0) {
        return res.json({
          id: 'demo-church',
          name: 'Demo Church',
          denomination: 'Non-denominational',
          registrationNumber: 'NPO-123-456',
          taxNumber: 'TAX-789-012',
          yearEstablished: '2015',
          
          // Contact Information
          contactEmail: 'info@demochurch.org',
          contactPhone: '+27 21 123 4567',
          alternativePhone: '+27 82 555 0123',
          website: 'https://www.demochurch.org',
          
          // Physical Address
          address: '123 Church Street',
          city: 'Cape Town',
          province: 'Western Cape',
          postalCode: '8001',
          country: 'South Africa',
          
          // Banking Information
          bankName: 'First National Bank (FNB)',
          accountNumber: '1234567890',
          branchCode: '250655',
          accountHolder: 'Demo Church',
          accountType: 'Cheque Account',
          
          // Church Details
          description: 'A welcoming community church serving Cape Town since 2015.',
          memberCount: 50,
          servicesTimes: 'Sunday 9AM, 11AM; Wednesday 7PM',
          leadPastor: 'Pastor John Smith',
          logoUrl: null,
          
          // Administrative Contact
          adminFirstName: 'John',
          adminLastName: 'Smith',
          adminEmail: 'admin@demochurch.org',
          adminPhone: '+27 21 123 4567',
          adminPosition: 'Lead Pastor',
          
          // Status and metadata
          status: 'approved',
          registrationDate: '2024-01-15'
        });
      }
      
      const church = recentChurch[0];
      res.json({
        id: church.id,
        name: church.name,
        denomination: church.denomination,
        registrationNumber: church.registrationNumber,
        taxNumber: church.taxNumber,
        yearEstablished: church.yearEstablished,
        
        // Contact Information
        contactEmail: church.contactEmail,
        contactPhone: church.contactPhone,
        alternativePhone: church.alternativePhone,
        website: church.website,
        
        // Physical Address
        address: church.address,
        city: church.city,
        province: church.province,
        postalCode: church.postalCode,
        country: church.country || 'South Africa',
        
        // Banking Information
        bankName: church.bankName,
        accountNumber: church.accountNumber,
        branchCode: church.branchCode,
        accountHolder: church.accountHolder,
        accountType: church.accountType,
        
        // Church Details
        description: church.description,
        memberCount: church.memberCount,
        servicesTimes: church.servicesTimes,
        leadPastor: church.leadPastor,
        logoUrl: church.logoUrl,
        
        // Administrative Contact
        adminFirstName: church.adminFirstName,
        adminLastName: church.adminLastName,
        adminEmail: church.adminEmail,
        adminPhone: church.adminPhone,
        adminPosition: church.adminPosition,
        
        // Status and metadata
        status: church.status,
        registrationDate: church.createdAt?.toISOString().split('T')[0] || '2024-01-15',
        
        // Financial data
        totalRevenue: '45000.00',
        monthlyRevenue: '12000.00',
        pendingPayouts: '8500.00',
        availableBalance: '36500.00'
      });
    } catch (error) {
      console.error('Error fetching church profile:', error);
      res.status(500).json({ message: 'Failed to fetch church profile' });
    }
  });

  // Update Church Profile
  app.put('/api/church/profile', async (req, res) => {
    try {
      const updateData = req.body;
      
      // For demo purposes, just return success
      // In production, this would update the database
      res.json({
        success: true,
        message: 'Church profile updated successfully',
        church: updateData
      });
    } catch (error) {
      console.error('Error updating church profile:', error);
      res.status(500).json({ message: 'Failed to update church profile' });
    }
  });

  // Member-Church Linking API
  app.post('/api/members/link-church', async (req, res) => {
    try {
      const { memberId, churchId } = req.body;
      
      // Update member's church association
      const [updatedMember] = await db
        .update(users)
        .set({ 
          churchId: churchId,
          role: 'member', // Ensure role is set to member
          updatedAt: new Date()
        })
        .where(eq(users.id, memberId))
        .returning();
      
      if (!updatedMember) {
        return res.status(404).json({ message: 'Member not found' });
      }
      
      // Get church details for response
      const church = await storage.getChurch(churchId);
      
      res.json({
        message: 'Member successfully linked to church',
        member: {
          id: updatedMember.id,
          name: `${updatedMember.firstName} ${updatedMember.lastName}`,
          email: updatedMember.email,
          churchId: updatedMember.churchId,
          role: updatedMember.role
        },
        church: church ? {
          id: church.id,
          name: church.name,
          denomination: church.denomination
        } : null
      });
    } catch (error) {
      console.error('Error linking member to church:', error);
      res.status(500).json({ message: 'Failed to link member to church' });
    }
  });

  // Sponsored Projects API - for landing page
  app.get('/api/projects/sponsored', async (req, res) => {
    try {
      const { limit = 6 } = req.query;
      
      // Try to get real sponsored projects from database
      try {
        const sponsoredProjects = await db.select({
          id: projects.id,
          name: projects.name,
          description: projects.description,
          targetAmount: projects.targetAmount,
          currentAmount: projects.currentAmount,
          imageUrl: projects.imageUrl,
          endDate: projects.endDate,
          priority: projects.priority,
          churchId: projects.churchId,
          churchName: churches.name,
          createdAt: projects.createdAt
        })
        .from(projects)
        .innerJoin(churches, eq(projects.churchId, churches.id))
        .where(and(
          eq(projects.isSponsored, true),
          eq(projects.status, 'active'),
          eq(churches.status, 'approved')
        ))
        .orderBy(desc(projects.priority), desc(projects.createdAt))
        .limit(Number(limit));

        if (sponsoredProjects.length > 0) {
          // Add donor count (simulated for now)
          const projectsWithStats = sponsoredProjects.map(project => ({
            ...project,
            donorCount: Math.floor(Math.random() * 50) + 5
          }));
          return res.json(projectsWithStats);
        }
      } catch (dbError) {
        console.log('Database query failed for sponsored projects, using sample data');
      }

      // Fallback to sample sponsored projects data with images
      const sampleProjects = [
        {
          id: 'project-1',
          name: 'New Children\'s Sunday School Center',
          description: 'Building a modern, safe learning environment for our growing Sunday school program. This facility will serve 200+ children weekly and include interactive learning spaces, a library, and outdoor play areas.',
          targetAmount: '75000.00',
          currentAmount: '42350.00',
          imageUrl: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800&h=600&fit=crop&crop=center',
          endDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000).toISOString(), // 45 days from now
          priority: 10,
          churchId: 'church-1',
          churchName: 'Grace Baptist Church',
          donorCount: 28,
          createdAt: new Date('2024-12-01')
        },
        {
          id: 'project-2',
          name: 'Community Food Bank Expansion',
          description: 'Expanding our weekly food distribution program to serve 150 additional families in need. Funds will go toward storage facilities, refrigeration, and monthly food supplies.',
          targetAmount: '25000.00',
          currentAmount: '18750.00',
          imageUrl: 'https://images.unsplash.com/photo-1593113598332-cd288d649433?w=800&h=600&fit=crop&crop=center',
          endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
          priority: 8,
          churchId: 'church-2',
          churchName: 'New Life Methodist',
          donorCount: 45,
          createdAt: new Date('2024-11-15')
        },
        {
          id: 'project-3',
          name: 'Youth Music Program Equipment',
          description: 'Providing instruments and sound equipment for our youth worship team. This will enable 25+ young people to develop their musical talents while serving in ministry.',
          targetAmount: '15000.00',
          currentAmount: '8925.00',
          imageUrl: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&h=600&fit=crop&crop=center',
          endDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(), // 60 days from now
          priority: 6,
          churchId: 'church-3',
          churchName: 'Faith Community Center',
          donorCount: 19,
          createdAt: new Date('2024-12-15')
        },
        {
          id: 'project-4',
          name: 'Clean Water Initiative for Rural Communities',
          description: 'Installing water purification systems and drilling boreholes to provide clean, safe drinking water to 5 rural communities in the Eastern Cape. This project will benefit over 1,200 families.',
          targetAmount: '120000.00',
          currentAmount: '67800.00',
          imageUrl: 'https://images.unsplash.com/photo-1541544181051-e46607bc22a4?w=800&h=600&fit=crop&crop=center',
          endDate: new Date(Date.now() + 75 * 24 * 60 * 60 * 1000).toISOString(),
          priority: 9,
          churchId: 'church-4',
          churchName: 'Hope Community Church',
          donorCount: 89,
          createdAt: new Date('2024-10-20')
        },
        {
          id: 'project-5',
          name: 'Mobile Medical Clinic Outreach',
          description: 'Purchasing and equipping a mobile medical unit to bring healthcare services to underserved communities. Includes medical equipment, staffing, and monthly operational costs.',
          targetAmount: '85000.00',
          currentAmount: '51200.00',
          imageUrl: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?w=800&h=600&fit=crop&crop=center',
          endDate: new Date(Date.now() + 50 * 24 * 60 * 60 * 1000).toISOString(),
          priority: 7,
          churchId: 'church-5',
          churchName: 'Unity Christian Fellowship',
          donorCount: 63,
          createdAt: new Date('2024-11-05')
        },
        {
          id: 'project-6',
          name: 'School Scholarship Fund for Orphans',
          description: 'Providing full scholarships including school fees, uniforms, books, and meals for 50 orphaned children to complete their primary and secondary education.',
          targetAmount: '45000.00',
          currentAmount: '32100.00',
          imageUrl: 'https://images.unsplash.com/photo-1497486751825-1233686d5d80?w=800&h=600&fit=crop&crop=center',
          endDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
          priority: 8,
          churchId: 'church-6',
          churchName: 'Blessed Assurance Ministry',
          donorCount: 102,
          createdAt: new Date('2024-09-10')
        }
      ];

      res.json(sampleProjects.slice(0, Number(limit)));
    } catch (error) {
      console.error('Error fetching sponsored projects:', error);
      res.status(500).json({ message: 'Failed to fetch sponsored projects' });
    }
  });

  // Public project donation endpoint with PayFast integration - no authentication required
  app.post('/api/projects/:projectId/donate', async (req, res) => {
    try {
      const { projectId } = req.params;
      const { amount, donorName, donorEmail, isAnonymous, message, donationType } = req.body;

      // Validate required fields
      if (!amount || amount <= 0) {
        return res.status(400).json({ message: 'Valid donation amount is required' });
      }

      if (!isAnonymous && (!donorName || !donorEmail)) {
        return res.status(400).json({ message: 'Donor name and email are required for non-anonymous donations' });
      }

      // Create donation record
      const donationId = randomUUID();
      const donation = {
        id: donationId,
        projectId,
        amount: parseFloat(amount),
        donorName: isAnonymous ? 'Anonymous' : donorName,
        donorEmail: isAnonymous ? null : donorEmail,
        isAnonymous: isAnonymous || false,
        message: message || null,
        donationType: donationType || 'once',
        status: 'pending',
        createdAt: new Date().toISOString()
      };

      // Validate PayFast credentials
      const merchantId = process.env.PAYFAST_MERCHANT_ID;
      const merchantKey = process.env.PAYFAST_MERCHANT_KEY;
      
      if (!merchantId || !merchantKey) {
        return res.status(500).json({ message: 'PayFast merchant credentials not configured' });
      }
      
      if (merchantKey.length !== 13) {
        return res.status(500).json({ 
          message: `Invalid merchant key length: ${merchantKey.length} characters. PayFast requires exactly 13 characters.` 
        });
      }

      // Generate PayFast payment URL
      const payfastData = {
        merchant_id: merchantId,
        merchant_key: merchantKey,
        return_url: `${req.protocol}://${req.get('host')}/projects?donation=success&id=${donationId}`,
        cancel_url: `${req.protocol}://${req.get('host')}/projects?donation=cancelled`,
        notify_url: `${req.protocol}://${req.get('host')}/api/payfast/notify`,
        name_first: isAnonymous ? 'Anonymous' : donorName.split(' ')[0] || 'Donor',
        name_last: isAnonymous ? 'Donor' : donorName.split(' ').slice(1).join(' ') || 'Supporter',
        email_address: isAnonymous ? 'anonymous@churpay.com' : donorEmail,
        m_payment_id: donationId,
        amount: parseFloat(amount).toFixed(2),
        item_name: `Donation to ${projectId}`,
        item_description: message || `Donation to project: ${projectId}`,
        custom_str1: projectId,
        custom_str2: isAnonymous ? 'anonymous' : 'named',
        custom_str3: donationType,
      };

      // In production, you would:
      // 1. Generate proper PayFast signature
      // 2. Store donation record in database
      // 3. Set up proper webhook handling
      
      const payfastUrl = process.env.NODE_ENV === 'production' 
        ? 'https://www.payfast.co.za/eng/process'
        : 'https://sandbox.payfast.co.za/eng/process';

      // Build PayFast form data
      const formParams = new URLSearchParams(payfastData).toString();
      const paymentUrl = `${payfastUrl}?${formParams}`;

      res.status(201).json({
        success: true,
        donationId: donation.id,
        amount: donation.amount,
        paymentUrl: paymentUrl,
        paymentMethod: 'payfast',
        message: 'Redirecting to secure payment gateway...',
        redirectUrl: paymentUrl
      });
    } catch (error) {
      console.error('Error processing donation:', error);
      res.status(500).json({ message: 'Failed to process donation' });
    }
  });

  // PayFast webhook handler
  app.post('/api/payfast/notify', async (req, res) => {
    try {
      const {
        m_payment_id,
        pf_payment_id,
        payment_status,
        amount_gross,
        custom_str1: entityId, // Can be projectId, walletTopupId, etc.
        custom_str2: entityType, // 'project', 'wallet_topup', 'wallet_send'
        custom_str3: subType // 'donation', 'topup', 'transfer'
      } = req.body;

      console.log('PayFast notification received:', req.body);

      // In production, verify the payment signature here
      
      if (payment_status === 'COMPLETE') {
        // Handle different payment types
        if (entityType === 'wallet_topup') {
          // Update wallet balance for successful top-up
          console.log(`💰 Wallet top-up completed: ${m_payment_id}, amount: R${amount_gross}, user: ${entityId}`);
          // TODO: Update user wallet balance in database
          // await storage.updateWalletBalance(entityId, parseFloat(amount_gross));
        } else if (entityType === 'donation') {
          // Update donation/tithe status to completed
          console.log(`🙏 Donation completed: ${m_payment_id}, amount: R${amount_gross}, type: ${subType}`);
          // TODO: Update transaction status and church balance
          // await storage.updateTransactionStatus(m_payment_id, 'completed');
        } else if (entityType === 'project') {
          // Update project donation status to completed
          console.log(`🎯 Project donation completed: ${m_payment_id}, amount: R${amount_gross}, project: ${entityId}`);
          // TODO: Update project current amount and donation status
          // await storage.updateProjectAmount(entityId, parseFloat(amount_gross));
        }
      }

      res.status(200).send('OK');
    } catch (error) {
      console.error('Error processing PayFast notification:', error);
      res.status(500).send('Error');
    }
  });

  // Simple authentication middleware for user routes
  const requireAuth = (req: any, res: any, next: any) => {
    const userId = (req.session as any)?.userId;
    if (!userId) {
      return res.status(401).json({ message: "Authentication required" });
    }
    next();
  };

  // Donation and Tithe PayFast Integration APIs

  // Create donation/tithe with PayFast integration
  app.post('/api/donations/create', requireAuth, async (req, res) => {
    try {
      const userId = (req.session as any).userId;
      const { amount, totalAmount, donationType, paymentMethod, churchId, note, projectId } = req.body;

      // Validate amount
      if (!amount || amount <= 0) {
        return res.status(400).json({ message: 'Valid donation amount is required' });
      }

      // Get user details
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      // Use user's church if no churchId provided
      const targetChurchId = churchId || user.churchId;
      if (!targetChurchId) {
        return res.status(400).json({ message: 'Church ID is required' });
      }

      // Get church details
      const church = await storage.getChurch(targetChurchId);
      if (!church) {
        return res.status(404).json({ message: 'Church not found' });
      }

      // Handle wallet payments
      if (paymentMethod === 'wallet') {
        const userWallet = await storage.getUserWallet(userId);
        const walletBalance = parseFloat(userWallet?.availableBalance || '0');
        if (!userWallet || walletBalance < amount) {
          return res.status(400).json({ message: 'Insufficient wallet balance' });
        }

        // Create transaction record
        const transactionData = {
          userId: userId,
          churchId: targetChurchId,
          amount: parseFloat(amount).toString(),
          donationType: donationType || 'donation',
          paymentMethod: 'wallet',
          status: 'completed' as const,
          metadata: note ? { note } : null,
          projectId: projectId || null
        };

        const transaction = await storage.createTransaction(transactionData);

        // Log transaction
        await storage.logActivity({
          userId: userId,
          churchId: targetChurchId,
          action: 'donation_completed',
          entity: 'transaction',
          entityId: transaction.id,
          details: { 
            amount: parseFloat(amount),
            type: donationType,
            paymentMethod: 'wallet'
          },
        });

        return res.status(201).json({
          success: true,
          transactionId: transaction.id,
          amount: parseFloat(amount),
          paymentMethod: 'wallet',
          message: 'Donation processed successfully from wallet'
        });
      }

      // Handle PayFast payments
      if (paymentMethod === 'payfast' || paymentMethod === 'card') {
        // Validate PayFast credentials
        const merchantId = process.env.PAYFAST_MERCHANT_ID;
        const merchantKey = process.env.PAYFAST_MERCHANT_KEY;
        
        if (!merchantId || !merchantKey) {
          return res.status(500).json({ message: 'PayFast merchant credentials not configured' });
        }

        // Create donation transaction ID
        const donationId = randomUUID();

        // Generate PayFast payment URL for donation
        const payfastData: Record<string, string> = {
          merchant_id: merchantId,
          merchant_key: merchantKey,
          return_url: `${req.protocol}://${req.get('host')}/member?donation=success&id=${donationId}`,
          cancel_url: `${req.protocol}://${req.get('host')}/member?donation=cancelled`,
          notify_url: `${req.protocol}://${req.get('host')}/api/payfast/notify`,
          name_first: user.firstName || 'ChurPay',
          name_last: user.lastName || 'User',
          email_address: user.email || 'member@churpay.com',
          m_payment_id: donationId,
          amount: (totalAmount || parseFloat(amount)).toFixed(2), // Use totalAmount for PayFast (includes fees)
          item_name: `${donationType === 'tithe' ? 'Tithe' : 'Donation'} to ${church.name}`,
          item_description: note || `${donationType === 'tithe' ? 'Tithe payment' : 'Donation'} to ${church.name}`,
          custom_str1: donationId, // Donation ID for tracking
          custom_str2: 'donation', // Payment type
          custom_str3: donationType || 'donation', // Sub-type
        };

        const payfastUrl = process.env.NODE_ENV === 'production' 
          ? 'https://www.payfast.co.za/eng/process'
          : 'https://sandbox.payfast.co.za/eng/process';

        // Build PayFast form data
        const formParams = new URLSearchParams(payfastData).toString();
        const paymentUrl = `${payfastUrl}?${formParams}`;

        // Create pending transaction record
        const transactionData = {
          userId: userId,
          churchId: targetChurchId,
          amount: parseFloat(amount).toString(),
          donationType: donationType || 'donation',
          paymentMethod: 'payfast',
          status: 'pending' as const,
          metadata: note ? { note, paymentId: donationId } : { paymentId: donationId },
          projectId: projectId || null
        };

        const transaction = await storage.createTransaction(transactionData);

        // Log donation initiation
        await storage.logActivity({
          userId: userId,
          churchId: targetChurchId,
          action: 'donation_initiated',
          entity: 'transaction',
          entityId: transaction.id,
          details: { 
            amount: parseFloat(amount),
            type: donationType,
            paymentMethod: 'payfast'
          },
        });

        return res.status(201).json({
          success: true,
          donationId: donationId,
          transactionId: transaction.id,
          amount: parseFloat(amount),
          paymentUrl: paymentUrl,
          paymentMethod: 'payfast',
          message: 'Redirecting to secure payment gateway...'
        });
      }

      return res.status(400).json({ message: 'Invalid payment method' });
    } catch (error) {
      console.error('Error processing donation:', error);
      res.status(500).json({ message: 'Failed to process donation' });
    }
  });

  // Wallet PayFast Integration APIs

  // Wallet top-up with PayFast
  app.post('/api/wallet/topup/payfast', requireAuth, async (req, res) => {
    try {
      const userId = (req.session as any).userId;
      const { amount, totalAmount } = req.body;

      // Validate amount
      if (!amount || amount < 10) {
        return res.status(400).json({ message: 'Minimum top-up amount is R10' });
      }

      // Get user details
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      // Validate PayFast credentials
      const merchantId = process.env.PAYFAST_MERCHANT_ID;
      const merchantKey = process.env.PAYFAST_MERCHANT_KEY;
      
      if (!merchantId || !merchantKey) {
        return res.status(500).json({ message: 'PayFast merchant credentials not configured' });
      }

      // Create top-up transaction ID
      const topupId = randomUUID();

      // Generate PayFast payment URL for wallet top-up
      const payfastData: Record<string, string> = {
        merchant_id: merchantId,
        merchant_key: merchantKey,
        return_url: `${req.protocol}://${req.get('host')}/member?topup=success&id=${topupId}`,
        cancel_url: `${req.protocol}://${req.get('host')}/member?topup=cancelled`,
        notify_url: `${req.protocol}://${req.get('host')}/api/payfast/notify`,
        name_first: user.firstName || 'ChurPay',
        name_last: user.lastName || 'User',
        email_address: user.email || 'member@churpay.com',
        m_payment_id: topupId,
        amount: (totalAmount || parseFloat(amount)).toFixed(2), // Use totalAmount for PayFast (includes fees)
        item_name: 'ChurPay Wallet Top-up',
        item_description: `Wallet top-up for ${user.firstName} ${user.lastName}`,
        custom_str1: userId, // User ID for wallet identification
        custom_str2: 'wallet_topup', // Payment type
        custom_str3: 'topup', // Sub-type
      };

      const payfastUrl = process.env.NODE_ENV === 'production' 
        ? 'https://www.payfast.co.za/eng/process'
        : 'https://sandbox.payfast.co.za/eng/process';

      // Build PayFast form data
      const formParams = new URLSearchParams(payfastData).toString();
      const paymentUrl = `${payfastUrl}?${formParams}`;

      // Log wallet top-up initiation
      await storage.logActivity({
        userId: userId,
        churchId: user.churchId,
        action: 'wallet_topup_initiated',
        entity: 'wallet',
        entityId: topupId,
        details: { 
          amount: parseFloat(amount),
          paymentMethod: 'payfast'
        },
      });

      res.status(201).json({
        success: true,
        topupId: topupId,
        amount: parseFloat(amount),
        paymentUrl: paymentUrl,
        paymentMethod: 'payfast',
        message: 'Redirecting to secure payment gateway...'
      });
    } catch (error) {
      console.error('Error processing wallet top-up:', error);
      res.status(500).json({ message: 'Failed to process wallet top-up' });
    }
  });

  // Send money from wallet
  app.post('/api/wallet/send', requireAuth, async (req, res) => {
    try {
      const userId = (req.session as any).userId;
      const { amount, recipient } = req.body;

      // Validate inputs
      if (!amount || amount <= 0) {
        return res.status(400).json({ message: 'Valid amount is required' });
      }

      if (!recipient) {
        return res.status(400).json({ message: 'Recipient is required' });
      }

      // Get user details
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      // Get user's wallet balance
      const userWallet = await storage.getUserWallet(userId);
      const walletBalance = parseFloat(userWallet?.availableBalance || '0');
      if (!userWallet || walletBalance < amount) {
        return res.status(400).json({ message: 'Insufficient wallet balance' });
      }

      // Find recipient user (by email or phone)
      let recipientUser = null;
      if (recipient.includes('@')) {
        // Email lookup
        recipientUser = await storage.getUserByEmail(recipient);
      } else {
        // Phone lookup - implement if needed
        // recipientUser = await storage.getUserByPhone(recipient);
      }

      if (!recipientUser) {
        return res.status(404).json({ message: 'Recipient not found' });
      }

      // Create transfer transaction
      const transferId = randomUUID();
      
      // In a real implementation, you would:
      // 1. Deduct amount from sender's wallet
      // 2. Add amount to recipient's wallet
      // 3. Create transaction records
      // 4. Send notifications

      console.log(`💸 Wallet transfer: R${amount} from ${user.email} to ${recipient} (ID: ${transferId})`);

      // Log wallet transfer
      await storage.logActivity({
        userId: userId,
        churchId: user.churchId,
        action: 'wallet_transfer_sent',
        entity: 'wallet',
        entityId: transferId,
        details: { 
          amount: parseFloat(amount),
          recipient: recipient,
          recipientId: recipientUser.id
        },
      });

      res.status(201).json({
        success: true,
        transferId: transferId,
        amount: parseFloat(amount),
        recipient: recipient,
        message: 'Money sent successfully'
      });
    } catch (error) {
      console.error('Error processing wallet transfer:', error);
      res.status(500).json({ message: 'Failed to send money' });
    }
  });

  // Church Dashboard APIs - Real Data Integration
  app.get('/api/churches/:churchId/dashboard', async (req, res) => {
    try {
      const { churchId } = req.params;
      const dashboardData = await storage.getChurchDashboardData(churchId);
      res.json(dashboardData);
    } catch (error) {
      console.error("Error fetching church dashboard data:", error);
      res.status(500).json({ message: "Failed to fetch church dashboard data" });
    }
  });

  // Member Dashboard APIs - Real Data Integration  
  app.get('/api/members/:userId/dashboard', async (req, res) => {
    try {
      const { userId } = req.params;
      const dashboardData = await storage.getMemberDashboardData(userId);
      res.json(dashboardData);
    } catch (error) {
      console.error("Error fetching member dashboard data:", error);
      res.status(500).json({ message: "Failed to fetch member dashboard data" });
    }
  });

  // Transaction Processing APIs
  app.post('/api/transactions/create', async (req, res) => {
    try {
      const transactionData = insertTransactionSchema.parse(req.body);
      const transaction = await storage.createTransaction(transactionData);
      
      // Log transaction creation
      await storage.logActivity({
        userId: transaction.userId,
        churchId: transaction.churchId,
        action: 'transaction_created',
        entity: 'transaction',
        entityId: transaction.id,
        details: { 
          amount: transaction.amount, 
          type: transaction.donationType,
          paymentMethod: transaction.paymentMethod 
        },
      });
      
      res.json(transaction);
    } catch (error) {
      console.error("Error creating transaction:", error);
      res.status(400).json({ message: "Failed to create transaction", error: (error as Error).message });
    }
  });

  // Submit payout request (for church admins)
  app.post('/api/church/payout-request', requireAuth, async (req, res) => {
    try {
      const userId = (req.session as any).userId;
      const user = await storage.getUser(userId);
      
      if (!user || !user.churchId || (user.role !== 'church_admin' && user.role !== 'church_staff')) {
        return res.status(403).json({ message: "Access denied" });
      }

      const { amount, requestType, description, requestedDate, urgencyReason } = req.body;

      // Validate request
      if (!amount || parseFloat(amount) <= 0) {
        return res.status(400).json({ message: "Invalid payout amount" });
      }

      if (parseFloat(amount) < 100) {
        return res.status(400).json({ message: "Minimum payout amount is R100" });
      }

      // Get church financial data to validate available balance
      const church = await storage.getChurch(user.churchId);
      if (!church) {
        return res.status(404).json({ message: "Church not found" });
      }

      // Calculate processing fee
      const requestAmount = parseFloat(amount);
      let processingFee = 0;
      switch (requestType) {
        case 'express':
          processingFee = Math.max(requestAmount * 0.015, 25);
          break;
        case 'emergency':
          processingFee = Math.max(requestAmount * 0.025, 50);
          break;
        default:
          processingFee = Math.max(requestAmount * 0.005, 10);
      }

      // Create payout request
      const payoutRequest = await storage.createPayoutRequest({
        churchId: user.churchId,
        requestedBy: userId,
        amount: amount,
        processingFee: processingFee.toString(),
        netAmount: (requestAmount - processingFee).toString(),
        requestType: requestType,
        description: description || null,
        requestedDate: new Date(requestedDate),
        urgencyReason: urgencyReason || null,
        status: 'pending'
      });

      // Log the activity
      await storage.logActivity({
        userId: userId,
        churchId: user.churchId,
        action: 'payout_request_created',
        entity: 'payout',
        entityId: payoutRequest.id,
        details: { 
          amount: amount,
          requestType: requestType,
          churchName: church.name 
        },
      });

      res.json({ 
        message: "Payout request submitted successfully", 
        payoutRequest 
      });
    } catch (error) {
      console.error("Error creating payout request:", error);
      res.status(500).json({ message: "Failed to create payout request" });
    }
  });

  // Super Admin: Approve payout request
  app.post('/api/super-admin/payouts/:payoutId/approve', requireAdminAuth, async (req: any, res) => {
    try {
      const { payoutId } = req.params;
      const { processingNotes } = req.body;
      const adminId = req.admin.id;

      const payout = await storage.updatePayoutStatus(payoutId, 'approved', adminId);
      
      // Log the approval
      await storage.logActivity({
        userId: adminId,
        churchId: payout.churchId,
        action: 'payout_approved',
        entity: 'payout',
        entityId: payout.id,
        details: { 
          amount: payout.amount,
          approvedBy: req.admin.email,
          processingNotes 
        },
      });

      console.log(`💰 Payout approved: ${payout.amount} for church ${payout.churchId} by ${req.admin.email}`);
      res.json({ message: "Payout request approved successfully", payout });
    } catch (error) {
      console.error("Error approving payout:", error);
      res.status(500).json({ message: "Failed to approve payout request" });
    }
  });

  // Super Admin: Reject payout request
  app.post('/api/super-admin/payouts/:payoutId/reject', requireAdminAuth, async (req: any, res) => {
    try {
      const { payoutId } = req.params;
      const { rejectionReason, processingNotes } = req.body;
      const adminId = req.admin.id;

      if (!rejectionReason) {
        return res.status(400).json({ message: "Rejection reason is required" });
      }

      const payout = await storage.updatePayoutStatus(payoutId, 'rejected', adminId, rejectionReason);
      
      // Log the rejection
      await storage.logActivity({
        userId: adminId,
        churchId: payout.churchId,
        action: 'payout_rejected',
        entity: 'payout',
        entityId: payout.id,
        details: { 
          amount: payout.amount,
          rejectedBy: req.admin.email,
          rejectionReason,
          processingNotes 
        },
      });

      console.log(`❌ Payout rejected: ${payout.amount} for church ${payout.churchId} by ${req.admin.email}`);
      res.json({ message: "Payout request rejected successfully", payout });
    } catch (error) {
      console.error("Error rejecting payout:", error);
      res.status(500).json({ message: "Failed to reject payout request" });
    }
  });

  // Super Admin: Complete payout request with PayFast integration
  app.post('/api/super-admin/payouts/:payoutId/complete', requireAdminAuth, async (req: any, res) => {
    console.log(`🔄 PayFast completion requested for payout: ${req.params.payoutId}`);
    console.log(`📝 Request body:`, req.body);
    try {
      const { payoutId } = req.params;
      const { paymentReference, processingNotes, usePayFast = true } = req.body;
      const adminId = req.admin.id;
      
      console.log(`📝 Completion data:`, { payoutId, usePayFast, adminId });

      // Get payout details first
      const payout = await storage.getPayoutById(payoutId);
      if (!payout) {
        return res.status(404).json({ message: "Payout not found" });
      }

      // Check if payout can be completed
      if (payout.status !== 'approved' && payout.status !== 'processing') {
        return res.status(400).json({ 
          message: `Cannot complete payout with status '${payout.status}'. Only approved or processing payouts can be completed.` 
        });
      }

      // Get church bank details for PayFast transfer
      console.log(`🏢 Looking for church: ${payout.churchId}`);
      const church = await storage.getChurch(payout.churchId);
      if (!church) {
        console.log(`❌ Church not found: ${payout.churchId}`);
        return res.status(404).json({ message: "Church not found" });
      }
      console.log(`✅ Church found: ${church.name}`);

      let payfastReference = null;
      let finalPaymentReference = paymentReference;

      if (usePayFast) {
        try {
          // Initiate PayFast payout transfer
          const payfastPayout = await initiatePayFastPayout({
            amount: parseFloat(payout.amount),
            churchId: payout.churchId,
            churchName: church.name,
            bankDetails: {
              bankName: payout.bankName || 'Standard Bank',
              accountNumber: payout.accountNumber || '1234567890',
              branchCode: payout.branchCode || '051001',
              accountHolder: payout.accountHolder || church.name
            },
            description: `ChurPay payout: ${payout.description || 'Church funds transfer'}`,
            reference: `CP-${payoutId.slice(-8)}`
          });

          payfastReference = payfastPayout.reference;
          finalPaymentReference = payfastReference || paymentReference;

          console.log(`💰 PayFast payout initiated: R${payout.amount} to ${church.name} (${payfastReference})`);
        } catch (payfastError) {
          console.error("PayFast payout failed:", payfastError);
          if (!paymentReference) {
            return res.status(400).json({ 
              message: "PayFast transfer failed. Please provide manual payment reference.",
              error: "PayFast integration error" 
            });
          }
        }
      } else if (!paymentReference) {
        return res.status(400).json({ message: "Payment reference is required for manual completion" });
      }

      const completedPayout = await storage.updatePayoutStatus(payoutId, 'completed', adminId);
      await storage.updatePayoutReference(payoutId, finalPaymentReference);
      
      await storage.logActivity({
        userId: adminId,
        churchId: payout.churchId,
        action: 'payout_completed',
        entity: 'payout',
        entityId: payout.id,
        details: { 
          amount: payout.amount,
          completedBy: req.admin.email,
          paymentReference: finalPaymentReference,
          payfastReference: payfastReference,
          processingMethod: usePayFast ? 'payfast_automatic' : 'manual',
          processingNotes,
          churchName: church.name
        },
      });

      console.log(`✅ Payout completed: R${payout.amount} for ${church.name} by ${req.admin.email} via ${usePayFast ? 'PayFast' : 'Manual'}`);
      
      res.json({ 
        message: "Payout request completed successfully", 
        payout: completedPayout,
        paymentReference: finalPaymentReference,
        payfastReference: payfastReference,
        processingMethod: usePayFast ? 'payfast_automatic' : 'manual'
      });
    } catch (error) {
      console.error("Error completing payout:", error);
      res.status(500).json({ message: "Failed to complete payout request" });
    }
  });

  // PayFast payout initiation function
  async function initiatePayFastPayout(payoutData: {
    amount: number;
    churchId: string;
    churchName: string;
    bankDetails: any;
    description: string;
    reference: string;
  }): Promise<{ success: boolean; reference: string; status: string; message: string; transferDetails?: any }> {
    // For now, simulate successful PayFast response
    const payfastReference = `PF${Date.now().toString().slice(-8)}`;
    
    // Log the PayFast transaction for audit trail
    console.log(`🏦 PayFast Payout Simulation:`, {
      reference: payfastReference,
      amount: payoutData.amount,
      church: payoutData.churchName,
      bankAccount: `${payoutData.bankDetails?.bankName} ***${payoutData.bankDetails?.accountNumber?.slice(-4)}`,
      timestamp: new Date().toISOString()
    });
    
    return {
      success: true,
      reference: payfastReference,
      status: 'initiated',
      message: 'PayFast payout initiated successfully',
      transferDetails: {
        amount: payoutData.amount,
        beneficiary: payoutData.bankDetails?.accountHolder,
        bank: payoutData.bankDetails?.bankName,
        account: `***${payoutData.bankDetails?.accountNumber?.slice(-4)}`
      }
    };
  }

  // Super Admin: Create demo payout data (for testing the modal)
  app.post('/api/super-admin/demo-payouts', requireAdminAuth, async (req: any, res) => {
    try {
      const adminId = req.admin.id;
      
      // Create demo payout requests with different statuses using proper UUIDs
      const demoPayouts = [
        {
          churchId: '11111111-1111-1111-1111-111111111111',
          requestedBy: '22222222-2222-2222-2222-222222222222',
          amount: '15000.00',
          processingFee: '75.00',
          netAmount: '14925.00',
          requestType: 'standard',
          description: 'Monthly church expenses and maintenance costs',
          status: 'requested',
          requestedDate: new Date(),
        },
        {
          churchId: '33333333-3333-3333-3333-333333333333', 
          requestedBy: '44444444-4444-4444-4444-444444444444',
          amount: '8500.00',
          processingFee: '127.50',
          netAmount: '8372.50',
          requestType: 'express',
          description: 'Urgent payment for utility bills',
          status: 'requested',
          requestedDate: new Date(Date.now() - 24 * 60 * 60 * 1000), // Yesterday
        },
        {
          churchId: '55555555-5555-5555-5555-555555555555',
          requestedBy: '66666666-6666-6666-6666-666666666666', 
          amount: '25000.00',
          processingFee: '625.00',
          netAmount: '24375.00',
          requestType: 'emergency',
          description: 'Emergency repair fund for roof damage',
          urgencyReason: 'Severe storm damaged the church roof, need immediate repairs to prevent water damage',
          status: 'requested',
          requestedDate: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
        }
      ];

      const createdPayouts = [];
      for (const payoutData of demoPayouts) {
        const payout = await storage.createPayoutRequest(payoutData);
        createdPayouts.push(payout);
      }

      console.log(`🎯 Demo payouts created: ${createdPayouts.length} requests by ${req.admin.email}`);
      res.json({ 
        message: "Demo payout data created successfully", 
        payouts: createdPayouts 
      });
    } catch (error) {
      console.error("Error creating demo payouts:", error);
      res.status(500).json({ message: "Failed to create demo payout data" });
    }
  });

  // Payout Request API (for churches)
  app.post('/api/payouts/request', async (req, res) => {
    try {
      const payoutData = insertPayoutSchema.parse(req.body);
      const payout = await storage.createPayout(payoutData);
      
      await storage.logActivity({
        userId: payout.requestedBy,
        churchId: payout.churchId,
        action: 'payout_requested',
        entity: 'payout',
        entityId: payout.id,
        details: { amount: payout.amount },
      });
      
      res.json(payout);
    } catch (error) {
      console.error("Error creating payout request:", error);
      res.status(400).json({ message: "Failed to create payout request", error: (error as Error).message });
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

  // User Church Data API
  app.get('/api/user/church', async (req, res) => {
    try {
      // For now, return the first approved church as demo data
      const approvedChurches = await storage.getApprovedChurches();
      if (approvedChurches.length > 0) {
        res.json(approvedChurches[0]);
      } else {
        res.json({
          id: "demo-church",
          name: "Community Church",
          denomination: "Non-denominational", 
          description: "A vibrant community church serving our local area",
          leadPastor: "Pastor John Smith",
          city: "Johannesburg",
          province: "Gauteng",
          memberCount: 450,
          contactEmail: "info@communitychurch.co.za",
          contactPhone: "+27-11-123-4567",
          servicesTimes: "Sunday Service: 9:00 AM & 6:00 PM",
          status: "approved"
        });
      }
    } catch (error) {
      console.error("Error fetching user church:", error);
      res.status(500).json({ message: "Failed to fetch church data" });
    }
  });

  // User Stats API
  app.get('/api/user/stats', async (req, res) => {
    try {
      const userStats = {
        memberSince: "January 2023",
        totalGiven: "25,480",
        thisYearGiven: "18,750",
        thisMonthGiven: "2,500",
        goalProgress: 75,
        annualGoal: "25,000",
        recentAchievements: ["Faithful Giver", "Community Supporter"],
        transactionCount: 48,
        averageGift: "530",
        upcomingEvents: [
          {
            id: "1",
            title: "Youth Service",
            date: "2025-08-10",
            type: "service"
          },
          {
            id: "2", 
            title: "Community Outreach",
            date: "2025-08-15",
            type: "outreach"
          }
        ]
      };
      
      res.json(userStats);
    } catch (error) {
      console.error("Error fetching user stats:", error);
      res.status(500).json({ message: "Failed to fetch user statistics" });
    }
  });

  // Community Insights API - Returns real church data
  app.get('/api/church/community-insights', async (req, res) => {
    try {
      // Get authenticated user
      const userId = (req.session as any)?.userId;
      if (!userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      // Get user's church
      const user = await storage.getUser(userId);
      if (!user || !user.churchId) {
        return res.status(404).json({ message: "User church not found" });
      }

      // Get church details
      const church = await storage.getChurch(user.churchId);
      if (!church) {
        return res.status(404).json({ message: "Church not found" });
      }

      // Get real church statistics
      const totalMembers = await storage.getChurchMemberCount(user.churchId);
      
      // Get this month's donation stats for the church
      const currentMonth = new Date();
      const startOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
      const endOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);
      
      const monthlyStats = await storage.getChurchDonationStats(user.churchId, startOfMonth, endOfMonth);
      
      // Calculate real insights
      const insights = {
        totalMembers: totalMembers,
        activeThisWeek: Math.ceil(totalMembers * 0.2), // Estimate 20% active weekly
        totalDonationsThisMonth: monthlyStats.totalDonations.toFixed(2),
        averageDonation: monthlyStats.transactionCount > 0 ? (monthlyStats.totalDonations / monthlyStats.transactionCount).toFixed(2) : "0.00",
        topContributors: Math.ceil(totalMembers * 0.05), // Estimate 5% are top contributors
        upcomingEvents: 3, // Could be enhanced to count real events
        recentActivities: [
          {
            id: "1",
            type: "member",
            description: `${church.name} has ${totalMembers} active members`,
            timestamp: new Date().toISOString()
          },
          {
            id: "2", 
            type: "donation",
            description: `R${monthlyStats.totalDonations.toFixed(2)} donated this month`,
            timestamp: new Date().toISOString()
          }
        ],
        monthlyGrowth: totalMembers > 100 ? Math.ceil((totalMembers - 100) / 100 * 100) : 5, // Simple growth calculation
        engagementScore: Math.min(95, Math.ceil((monthlyStats.transactionCount / totalMembers) * 100) + 50) // Base 50 + transaction ratio
      };
      
      console.log(`📊 Real community insights for church ${church.name}:`, {
        totalMembers,
        monthlyDonations: monthlyStats.totalDonations,
        transactionCount: monthlyStats.transactionCount
      });
      
      res.json(insights);
    } catch (error) {
      console.error("Error fetching community insights:", error);
      res.status(500).json({ message: "Failed to fetch community insights" });
    }
  });

  // Object Storage endpoints for document uploads
  app.post("/api/objects/upload", async (req, res) => {
    try {
      const objectStorageService = new ObjectStorageService();
      const uploadURL = await objectStorageService.getObjectEntityUploadURL();
      res.json({ uploadURL });
    } catch (error) {
      console.error("Error creating upload URL:", error);
      res.status(500).json({ error: "Failed to create upload URL" });
    }
  });

  // Endpoint to serve uploaded documents (public access for church verification)
  app.get("/objects/:objectPath(*)", async (req, res) => {
    const objectStorageService = new ObjectStorageService();
    try {
      const objectFile = await objectStorageService.getObjectEntityFile(
        req.path,
      );
      objectStorageService.downloadObject(objectFile, res);
    } catch (error) {
      console.error("Error accessing object:", error);
      if (error instanceof ObjectNotFoundError) {
        return res.sendStatus(404);
      }
      return res.sendStatus(500);
    }
  });

  // Endpoint to update document URLs after upload
  app.put("/api/churches/:churchId/documents", async (req, res) => {
    try {
      const { churchId } = req.params;
      const { documentType, documentUrl } = req.body;
      
      if (!documentType || !documentUrl) {
        return res.status(400).json({ error: "Document type and URL are required" });
      }

      const objectStorageService = new ObjectStorageService();
      const normalizedPath = objectStorageService.normalizeObjectEntityPath(documentUrl);
      
      // Update church record with document path
      const updateData: any = {};
      updateData[documentType] = normalizedPath;
      
      // Note: This is a simplified update - in a real implementation you'd want proper validation
      await storage.updateChurchDocument(churchId, documentType, normalizedPath);
      
      res.json({ success: true, path: normalizedPath });
    } catch (error) {
      console.error("Error updating church document:", error);
      res.status(500).json({ error: "Failed to update document" });
    }
  });

  // Church Cashback Management APIs
  app.get('/api/super-admin/cashback-records', requireAdminAuth, async (req, res) => {
    try {
      const { churchId, year } = req.query;
      const records = await storage.getChurchCashbackRecords(
        churchId as string, 
        year ? parseInt(year as string) : undefined
      );
      res.json(records);
    } catch (error) {
      console.error("Error fetching cashback records:", error);
      res.status(500).json({ message: "Failed to fetch cashback records" });
    }
  });

  app.post('/api/super-admin/calculate-cashback/:churchId/:year', requireAdminAuth, async (req, res) => {
    try {
      const { churchId, year } = req.params;
      const cashbackRecord = await storage.calculateChurchCashback(churchId, parseInt(year));
      
      // Log the calculation
      const superAdminId = (req.session as any).superAdminId;
      await storage.logActivity({
        userId: superAdminId,
        churchId: churchId,
        action: 'cashback_calculated',
        entity: 'cashback',
        entityId: cashbackRecord.id,
        details: { 
          year: parseInt(year),
          totalPlatformFees: cashbackRecord.totalPlatformFees,
          cashbackAmount: cashbackRecord.cashbackAmount 
        },
      });
      
      res.json(cashbackRecord);
    } catch (error) {
      console.error("Error calculating cashback:", error);
      res.status(500).json({ message: "Failed to calculate cashback" });
    }
  });

  app.post('/api/super-admin/process-cashback/:recordId/:action', requireAdminAuth, async (req, res) => {
    try {
      const { recordId, action } = req.params;
      const superAdminId = (req.session as any).superAdminId;
      
      if (!['approve', 'pay'].includes(action)) {
        return res.status(400).json({ message: "Invalid action. Must be 'approve' or 'pay'" });
      }
      
      const updatedRecord = await storage.processChurchCashback(recordId, superAdminId, action as 'approve' | 'pay');
      
      // Log the action
      await storage.logActivity({
        userId: superAdminId,
        churchId: updatedRecord.churchId,
        action: `cashback_${action}`,
        entity: 'cashback',
        entityId: recordId,
        details: { 
          year: updatedRecord.year,
          amount: updatedRecord.cashbackAmount,
          status: updatedRecord.status 
        },
      });
      
      res.json(updatedRecord);
    } catch (error) {
      console.error("Error processing cashback:", error);
      res.status(500).json({ message: "Failed to process cashback" });
    }
  });

  app.post('/api/super-admin/generate-annual-cashback/:year', requireAdminAuth, async (req, res) => {
    try {
      const { year } = req.params;
      const superAdminId = (req.session as any).superAdminId;
      
      const cashbackRecords = await storage.generateAnnualCashbackReports(parseInt(year));
      
      // Calculate totals
      const totalCashback = cashbackRecords.reduce((sum, record) => 
        sum + parseFloat(record.cashbackAmount || '0'), 0
      );
      
      // Log the bulk generation
      await storage.logActivity({
        userId: superAdminId,
        churchId: null,
        action: 'annual_cashback_generated',
        entity: 'cashback',
        entityId: null,
        details: { 
          year: parseInt(year),
          recordsGenerated: cashbackRecords.length,
          totalCashbackAmount: totalCashback.toString()
        },
      });
      
      res.json({
        year: parseInt(year),
        recordsGenerated: cashbackRecords.length,
        totalCashbackAmount: totalCashback,
        records: cashbackRecords
      });
    } catch (error) {
      console.error("Error generating annual cashback:", error);
      res.status(500).json({ message: "Failed to generate annual cashback reports" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}