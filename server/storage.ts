import {
  users,
  churches,
  projects,
  transactions,
  payouts,
  activityLogs,
  type User,
  type UpsertUser,
  type Church,
  type InsertChurch,
  type Project,
  type InsertProject,
  type Transaction,
  type InsertTransaction,
  type Payout,
  type InsertPayout,
  type ActivityLog,
  type InsertActivityLog,
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc, asc, count, sql, or, ilike } from "drizzle-orm";

export interface IStorage {
  // User operations (required for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  updateUserRole(userId: string, role: string, churchId?: string): Promise<User>;
  
  // Church operations
  createChurch(church: InsertChurch): Promise<Church>;
  getChurch(id: string): Promise<Church | undefined>;
  getChurchByAdminId(adminId: string): Promise<Church | undefined>;
  updateChurchStatus(id: string, status: string, processedBy?: string): Promise<Church>;
  getAllChurches(limit?: number, offset?: number): Promise<Church[]>;
  getPendingChurches(): Promise<Church[]>;
  getApprovedChurches(): Promise<Church[]>;
  getChurchStats(): Promise<{ total: number; pending: number; approved: number; active: number }>;
  
  // Project operations
  createProject(project: InsertProject): Promise<Project>;
  getProject(id: string): Promise<Project | undefined>;
  getChurchProjects(churchId: string): Promise<Project[]>;
  getPublicProjects(limit?: number): Promise<Project[]>;
  updateProjectAmount(id: string, amount: number): Promise<Project>;
  
  // Transaction operations
  createTransaction(transaction: InsertTransaction): Promise<Transaction>;
  getTransaction(id: string): Promise<Transaction | undefined>;
  getChurchTransactions(churchId: string, limit?: number): Promise<Transaction[]>;
  getUserTransactions(userId: string, limit?: number): Promise<Transaction[]>;
  getTransactionStats(churchId?: string): Promise<any>;
  
  // Payout operations
  createPayout(payout: InsertPayout): Promise<Payout>;
  getPayout(id: string): Promise<Payout | undefined>;
  getChurchPayouts(churchId: string): Promise<Payout[]>;
  getAllPayouts(status?: string): Promise<Payout[]>;
  updatePayoutStatus(id: string, status: string, processedBy?: string, rejectionReason?: string): Promise<Payout>;
  
  // Activity logging
  logActivity(activity: InsertActivityLog): Promise<ActivityLog>;
  getActivityLogs(userId?: string, churchId?: string, limit?: number): Promise<ActivityLog[]>;
  
  // Dashboard and analytics
  getPlatformStats(): Promise<any>;
  getChurchDashboardData(churchId: string): Promise<any>;
  getMemberDashboardData(userId: string): Promise<any>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  async updateUserRole(userId: string, role: string, churchId?: string): Promise<User> {
    const [user] = await db
      .update(users)
      .set({ role: role as any, churchId, updatedAt: new Date() })
      .where(eq(users.id, userId))
      .returning();
    return user;
  }
  
  // Church operations
  async createChurch(church: InsertChurch): Promise<Church> {
    const [newChurch] = await db.insert(churches).values(church).returning();
    return newChurch;
  }

  async getChurch(id: string): Promise<Church | undefined> {
    const [church] = await db.select().from(churches).where(eq(churches.id, id));
    return church;
  }

  async getChurchByAdminId(adminId: string): Promise<Church | undefined> {
    const [church] = await db.select().from(churches).where(eq(churches.adminUserId, adminId));
    return church;
  }

  async updateChurchStatus(id: string, status: string, processedBy?: string): Promise<Church> {
    const [church] = await db
      .update(churches)
      .set({ status: status as any, updatedAt: new Date() })
      .where(eq(churches.id, id))
      .returning();
    return church;
  }

  async getAllChurches(limit = 50, offset = 0): Promise<Church[]> {
    return await db
      .select()
      .from(churches)
      .orderBy(desc(churches.createdAt))
      .limit(limit)
      .offset(offset);
  }

  async getPendingChurches(): Promise<Church[]> {
    return await db
      .select()
      .from(churches)
      .where(eq(churches.status, 'pending'))
      .orderBy(asc(churches.createdAt));
  }

  async getApprovedChurches(): Promise<Church[]> {
    return await db
      .select()
      .from(churches)
      .where(eq(churches.status, 'approved'))
      .orderBy(asc(churches.name));
  }

  async getChurchStats(): Promise<{ total: number; pending: number; approved: number; active: number }> {
    const stats = await db
      .select({
        total: count(),
        pending: sql<number>`count(*) filter (where status = 'pending')`,
        approved: sql<number>`count(*) filter (where status = 'approved')`,
        active: sql<number>`count(*) filter (where is_active = true)`,
      })
      .from(churches);
    
    return stats[0];
  }
  
  // Project operations
  async createProject(project: InsertProject): Promise<Project> {
    const [newProject] = await db.insert(projects).values(project).returning();
    return newProject;
  }

  async getProject(id: string): Promise<Project | undefined> {
    const [project] = await db.select().from(projects).where(eq(projects.id, id));
    return project;
  }

  async getChurchProjects(churchId: string): Promise<Project[]> {
    return await db
      .select()
      .from(projects)
      .where(eq(projects.churchId, churchId))
      .orderBy(desc(projects.createdAt));
  }

  async getPublicProjects(limit = 20): Promise<Project[]> {
    return await db
      .select()
      .from(projects)
      .where(and(eq(projects.isPublic, true), eq(projects.status, 'active')))
      .orderBy(desc(projects.createdAt))
      .limit(limit);
  }

  async updateProjectAmount(id: string, amount: number): Promise<Project> {
    const [project] = await db
      .update(projects)
      .set({ currentAmount: amount.toString(), updatedAt: new Date() })
      .where(eq(projects.id, id))
      .returning();
    return project;
  }
  
  // Transaction operations
  async createTransaction(transaction: InsertTransaction): Promise<Transaction> {
    const [newTransaction] = await db.insert(transactions).values(transaction).returning();
    
    // Update project amount if it's a project donation
    if (newTransaction.projectId && newTransaction.status === 'completed') {
      const project = await this.getProject(newTransaction.projectId);
      if (project) {
        const newAmount = parseFloat(project.currentAmount) + parseFloat(newTransaction.amount);
        await this.updateProjectAmount(newTransaction.projectId, newAmount);
      }
    }
    
    return newTransaction;
  }

  async getTransaction(id: string): Promise<Transaction | undefined> {
    const [transaction] = await db.select().from(transactions).where(eq(transactions.id, id));
    return transaction;
  }

  async getChurchTransactions(churchId: string, limit = 50): Promise<Transaction[]> {
    return await db
      .select()
      .from(transactions)
      .where(eq(transactions.churchId, churchId))
      .orderBy(desc(transactions.createdAt))
      .limit(limit);
  }

  async getUserTransactions(userId: string, limit = 50): Promise<Transaction[]> {
    return await db
      .select()
      .from(transactions)
      .where(eq(transactions.userId, userId))
      .orderBy(desc(transactions.createdAt))
      .limit(limit);
  }

  async getTransactionStats(churchId?: string): Promise<any> {
    const whereClause = churchId ? eq(transactions.churchId, churchId) : undefined;
    
    const stats = await db
      .select({
        total: count(),
        totalAmount: sql<number>`sum(amount)`,
        completedAmount: sql<number>`sum(amount) filter (where status = 'completed')`,
        averageAmount: sql<number>`avg(amount)`,
        thisMonth: sql<number>`sum(amount) filter (where status = 'completed' and created_at >= date_trunc('month', current_date))`,
        lastMonth: sql<number>`sum(amount) filter (where status = 'completed' and created_at >= date_trunc('month', current_date - interval '1 month') and created_at < date_trunc('month', current_date))`,
      })
      .from(transactions)
      .where(whereClause);
    
    return stats[0];
  }
  
  // Payout operations
  async createPayout(payout: InsertPayout): Promise<Payout> {
    const [newPayout] = await db.insert(payouts).values(payout).returning();
    return newPayout;
  }

  async getPayout(id: string): Promise<Payout | undefined> {
    const [payout] = await db.select().from(payouts).where(eq(payouts.id, id));
    return payout;
  }

  async getChurchPayouts(churchId: string): Promise<Payout[]> {
    return await db
      .select()
      .from(payouts)
      .where(eq(payouts.churchId, churchId))
      .orderBy(desc(payouts.createdAt));
  }

  async getAllPayouts(status?: string): Promise<Payout[]> {
    const whereClause = status ? eq(payouts.status, status as any) : undefined;
    return await db
      .select()
      .from(payouts)
      .where(whereClause)
      .orderBy(desc(payouts.createdAt));
  }

  async updatePayoutStatus(id: string, status: string, processedBy?: string, rejectionReason?: string): Promise<Payout> {
    const updateData: any = { 
      status: status as any, 
      updatedAt: new Date() 
    };
    
    if (processedBy) {
      updateData.processedBy = processedBy;
      updateData.processedAt = new Date();
    }
    
    if (rejectionReason) {
      updateData.rejectionReason = rejectionReason;
    }
    
    const [payout] = await db
      .update(payouts)
      .set(updateData)
      .where(eq(payouts.id, id))
      .returning();
    return payout;
  }
  
  // Activity logging
  async logActivity(activity: InsertActivityLog): Promise<ActivityLog> {
    const [log] = await db.insert(activityLogs).values(activity).returning();
    return log;
  }

  async getActivityLogs(userId?: string, churchId?: string, limit = 50): Promise<ActivityLog[]> {
    let whereClause;
    
    if (userId && churchId) {
      whereClause = and(eq(activityLogs.userId, userId), eq(activityLogs.churchId, churchId));
    } else if (userId) {
      whereClause = eq(activityLogs.userId, userId);
    } else if (churchId) {
      whereClause = eq(activityLogs.churchId, churchId);
    }
    
    return await db
      .select()
      .from(activityLogs)
      .where(whereClause)
      .orderBy(desc(activityLogs.createdAt))
      .limit(limit);
  }
  
  // Dashboard and analytics
  async getPlatformStats(): Promise<any> {
    const [churchStats] = await db
      .select({
        totalChurches: count(),
        pendingChurches: sql<number>`count(*) filter (where status = 'pending')`,
        approvedChurches: sql<number>`count(*) filter (where status = 'approved')`,
      })
      .from(churches);

    const [userStats] = await db
      .select({
        totalUsers: count(),
        activeUsers: sql<number>`count(*) filter (where is_active = true)`,
        churchAdmins: sql<number>`count(*) filter (where role = 'church_admin')`,
        members: sql<number>`count(*) filter (where role = 'member')`,
      })
      .from(users);

    const [transactionStats] = await db
      .select({
        totalTransactions: count(),
        totalAmount: sql<number>`sum(amount)`,
        completedAmount: sql<number>`sum(amount) filter (where status = 'completed')`,
        thisMonthAmount: sql<number>`sum(amount) filter (where status = 'completed' and created_at >= date_trunc('month', current_date))`,
      })
      .from(transactions);

    const [payoutStats] = await db
      .select({
        pendingPayouts: sql<number>`count(*) filter (where status = 'requested')`,
        completedPayouts: sql<number>`count(*) filter (where status = 'completed')`,
        totalPayoutAmount: sql<number>`sum(amount) filter (where status = 'completed')`,
      })
      .from(payouts);

    return {
      churches: churchStats,
      users: userStats,
      transactions: transactionStats,
      payouts: payoutStats,
      platformRevenue: transactionStats.completedAmount * 0.1, // 10% commission
    };
  }

  async getChurchDashboardData(churchId: string): Promise<any> {
    const church = await this.getChurch(churchId);
    const transactionStats = await this.getTransactionStats(churchId);
    const recentTransactions = await this.getChurchTransactions(churchId, 10);
    const projects = await this.getChurchProjects(churchId);
    const payouts = await this.getChurchPayouts(churchId);

    const [memberCount] = await db
      .select({ count: count() })
      .from(users)
      .where(eq(users.churchId, churchId));

    return {
      church,
      stats: transactionStats,
      recentTransactions,
      projects,
      payouts,
      memberCount: memberCount.count,
    };
  }

  async getMemberDashboardData(userId: string): Promise<any> {
    const user = await this.getUser(userId);
    const transactions = await this.getUserTransactions(userId, 10);
    const publicProjects = await this.getPublicProjects(5);

    const [transactionStats] = await db
      .select({
        totalDonated: sql<number>`sum(amount) filter (where status = 'completed')`,
        transactionCount: count(),
        thisYearTotal: sql<number>`sum(amount) filter (where status = 'completed' and created_at >= date_trunc('year', current_date))`,
      })
      .from(transactions)
      .where(eq(transactions.userId, userId));

    return {
      user,
      stats: transactionStats,
      recentTransactions: transactions,
      publicProjects,
    };
  }
}

export const storage = new DatabaseStorage();
