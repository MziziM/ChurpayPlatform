import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertChurchSchema, insertProjectSchema, insertTransactionSchema, insertPayoutSchema, users } from "@shared/schema";
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

  // Personalized Welcome Screen APIs
  app.get('/api/user/church', async (req: any, res) => {
    try {
      // Mock session for now - in production use authenticated user ID
      const userId = req.session?.userId || 'mock-user-id';
      
      // Mock church data for personalized welcome screen
      const mockChurch = {
        id: 'church-001',
        name: 'Grace Baptist Church',
        denomination: 'Baptist',
        logoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=center',
        description: 'A vibrant community of believers committed to worship, fellowship, and service in the heart of Cape Town.',
        leadPastor: 'Dr. John Smith',
        city: 'Cape Town',
        province: 'Western Cape',
        memberCount: 450,
        contactEmail: 'office@gracebaptist.org.za',
        contactPhone: '+27 21 555 0123',
        website: 'https://gracebaptist.org.za',
        servicesTimes: 'Sunday: 9:00 AM & 11:00 AM\nWednesday Prayer: 7:00 PM\nYouth Service: Friday 6:30 PM',
        status: 'approved'
      };

      res.json(mockChurch);
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

  // Community Insights API
  app.get('/api/church/community-insights', async (req, res) => {
    try {
      const insights = {
        totalMembers: 450,
        activeThisWeek: 89,
        totalDonationsThisMonth: "125,340",
        averageDonation: "2,785",
        topContributors: 23,
        upcomingEvents: 5,
        recentActivities: [
          {
            id: "1",
            type: "donation",
            description: "New member joined the community",
            timestamp: new Date().toISOString()
          },
          {
            id: "2", 
            type: "event",
            description: "Youth service scheduled for next Sunday",
            timestamp: new Date().toISOString()
          }
        ],
        monthlyGrowth: 12,
        engagementScore: 85
      };
      
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

  const httpServer = createServer(app);
  return httpServer;
}