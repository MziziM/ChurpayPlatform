import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { insertChurchSchema, insertProjectSchema, insertTransactionSchema, insertPayoutSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Church registration and management
  app.post('/api/churches', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const churchData = insertChurchSchema.parse({
        ...req.body,
        adminUserId: userId,
      });

      const church = await storage.createChurch(churchData);
      
      // Update user role to church_admin
      await storage.updateUserRole(userId, 'church_admin', church.id);

      // Log activity
      await storage.logActivity({
        userId,
        churchId: church.id,
        action: 'church_registered',
        entity: 'church',
        entityId: church.id,
        details: { churchName: church.name },
      });

      res.json(church);
    } catch (error) {
      console.error("Error creating church:", error);
      res.status(400).json({ message: "Failed to create church", error: error.message });
    }
  });

  app.get('/api/churches/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      const church = await storage.getChurch(req.params.id);

      if (!church) {
        return res.status(404).json({ message: "Church not found" });
      }

      // Check permissions - superadmin, church admin, or church member
      if (user?.role !== 'superadmin' && user?.churchId !== church.id) {
        return res.status(403).json({ message: "Access denied" });
      }

      res.json(church);
    } catch (error) {
      console.error("Error fetching church:", error);
      res.status(500).json({ message: "Failed to fetch church" });
    }
  });

  // Church dashboard data
  app.get('/api/churches/:id/dashboard', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      const churchId = req.params.id;

      // Check permissions
      if (user?.role !== 'superadmin' && user?.churchId !== churchId) {
        return res.status(403).json({ message: "Access denied" });
      }

      const dashboardData = await storage.getChurchDashboardData(churchId);
      res.json(dashboardData);
    } catch (error) {
      console.error("Error fetching church dashboard:", error);
      res.status(500).json({ message: "Failed to fetch dashboard data" });
    }
  });

  // Member registration (join church)
  app.post('/api/members/join', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { churchId } = req.body;

      if (!churchId) {
        return res.status(400).json({ message: "Church ID is required" });
      }

      const church = await storage.getChurch(churchId);
      if (!church || church.status !== 'approved') {
        return res.status(400).json({ message: "Church not found or not approved" });
      }

      // Update user role to member and assign church
      const user = await storage.updateUserRole(userId, 'member', churchId);

      // Log activity
      await storage.logActivity({
        userId,
        churchId,
        action: 'member_joined',
        entity: 'user',
        entityId: userId,
        details: { churchName: church.name },
      });

      res.json(user);
    } catch (error) {
      console.error("Error joining church:", error);
      res.status(500).json({ message: "Failed to join church" });
    }
  });

  // Member dashboard data
  app.get('/api/members/dashboard', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const dashboardData = await storage.getMemberDashboardData(userId);
      res.json(dashboardData);
    } catch (error) {
      console.error("Error fetching member dashboard:", error);
      res.status(500).json({ message: "Failed to fetch dashboard data" });
    }
  });

  // Project management
  app.post('/api/projects', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);

      // Only church admins and staff can create projects
      if (!['church_admin', 'church_staff'].includes(user?.role || '')) {
        return res.status(403).json({ message: "Access denied" });
      }

      const projectData = insertProjectSchema.parse({
        ...req.body,
        churchId: user.churchId,
        createdBy: userId,
      });

      const project = await storage.createProject(projectData);

      await storage.logActivity({
        userId,
        churchId: user.churchId!,
        action: 'project_created',
        entity: 'project',
        entityId: project.id,
        details: { projectName: project.name },
      });

      res.json(project);
    } catch (error) {
      console.error("Error creating project:", error);
      res.status(400).json({ message: "Failed to create project", error: error.message });
    }
  });

  app.get('/api/projects/public', async (req, res) => {
    try {
      const projects = await storage.getPublicProjects(20);
      res.json(projects);
    } catch (error) {
      console.error("Error fetching public projects:", error);
      res.status(500).json({ message: "Failed to fetch projects" });
    }
  });

  // Transaction processing
  app.post('/api/transactions', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const transactionData = insertTransactionSchema.parse({
        ...req.body,
        userId,
        status: 'completed', // In real implementation, this would be pending until payment is confirmed
      });

      const transaction = await storage.createTransaction(transactionData);

      await storage.logActivity({
        userId,
        churchId: transaction.churchId,
        action: 'donation_made',
        entity: 'transaction',
        entityId: transaction.id,
        details: { amount: transaction.amount, donationType: transaction.donationType },
      });

      res.json(transaction);
    } catch (error) {
      console.error("Error creating transaction:", error);
      res.status(400).json({ message: "Failed to process transaction", error: error.message });
    }
  });

  // Payout requests
  app.post('/api/payouts', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);

      // Only church admins can request payouts
      if (user?.role !== 'church_admin') {
        return res.status(403).json({ message: "Only church administrators can request payouts" });
      }

      const payoutData = insertPayoutSchema.parse({
        ...req.body,
        churchId: user.churchId,
        requestedBy: userId,
      });

      const payout = await storage.createPayout(payoutData);

      await storage.logActivity({
        userId,
        churchId: user.churchId!,
        action: 'payout_requested',
        entity: 'payout',
        entityId: payout.id,
        details: { amount: payout.amount },
      });

      res.json(payout);
    } catch (error) {
      console.error("Error creating payout:", error);
      res.status(400).json({ message: "Failed to create payout request", error: error.message });
    }
  });

  // Super Admin routes
  app.get('/api/admin/stats', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);

      if (user?.role !== 'superadmin') {
        return res.status(403).json({ message: "Super admin access required" });
      }

      const stats = await storage.getPlatformStats();
      res.json(stats);
    } catch (error) {
      console.error("Error fetching admin stats:", error);
      res.status(500).json({ message: "Failed to fetch platform statistics" });
    }
  });

  app.get('/api/admin/churches', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);

      if (user?.role !== 'superadmin') {
        return res.status(403).json({ message: "Super admin access required" });
      }

      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 50;
      const offset = (page - 1) * limit;

      const churches = await storage.getAllChurches(limit, offset);
      res.json(churches);
    } catch (error) {
      console.error("Error fetching churches:", error);
      res.status(500).json({ message: "Failed to fetch churches" });
    }
  });

  app.get('/api/admin/churches/pending', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);

      if (user?.role !== 'superadmin') {
        return res.status(403).json({ message: "Super admin access required" });
      }

      const churches = await storage.getPendingChurches();
      res.json(churches);
    } catch (error) {
      console.error("Error fetching pending churches:", error);
      res.status(500).json({ message: "Failed to fetch pending churches" });
    }
  });

  app.put('/api/admin/churches/:id/status', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);

      if (user?.role !== 'superadmin') {
        return res.status(403).json({ message: "Super admin access required" });
      }

      const { status, rejectionReason } = req.body;
      const church = await storage.updateChurchStatus(req.params.id, status, userId);

      await storage.logActivity({
        userId,
        action: 'church_status_updated',
        entity: 'church',
        entityId: church.id,
        details: { status, rejectionReason, churchName: church.name },
      });

      res.json(church);
    } catch (error) {
      console.error("Error updating church status:", error);
      res.status(500).json({ message: "Failed to update church status" });
    }
  });

  app.get('/api/admin/payouts', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);

      if (user?.role !== 'superadmin') {
        return res.status(403).json({ message: "Super admin access required" });
      }

      const status = req.query.status as string;
      const payouts = await storage.getAllPayouts(status);
      res.json(payouts);
    } catch (error) {
      console.error("Error fetching payouts:", error);
      res.status(500).json({ message: "Failed to fetch payouts" });
    }
  });

  app.put('/api/admin/payouts/:id/status', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);

      if (user?.role !== 'superadmin') {
        return res.status(403).json({ message: "Super admin access required" });
      }

      const { status, rejectionReason } = req.body;
      const payout = await storage.updatePayoutStatus(req.params.id, status, userId, rejectionReason);

      await storage.logActivity({
        userId,
        action: 'payout_status_updated',
        entity: 'payout',
        entityId: payout.id,
        details: { status, rejectionReason, amount: payout.amount },
      });

      res.json(payout);
    } catch (error) {
      console.error("Error updating payout status:", error);
      res.status(500).json({ message: "Failed to update payout status" });
    }
  });

  // Activity logs
  app.get('/api/activity-logs', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);

      let logs;
      if (user?.role === 'superadmin') {
        // Super admin can see all logs
        logs = await storage.getActivityLogs();
      } else if (user?.churchId) {
        // Church admins and members can see their church's logs
        logs = await storage.getActivityLogs(undefined, user.churchId);
      } else {
        // Regular users can only see their own logs
        logs = await storage.getActivityLogs(userId);
      }

      res.json(logs);
    } catch (error) {
      console.error("Error fetching activity logs:", error);
      res.status(500).json({ message: "Failed to fetch activity logs" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
