import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertChurchSchema, insertProjectSchema, insertTransactionSchema, insertPayoutSchema } from "@shared/schema";
import { protectCoreEndpoints, validateFeeStructure, validateSystemIntegrity, PROTECTED_CONSTANTS } from "./codeProtection";
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

  const httpServer = createServer(app);
  return httpServer;
}