import {
  users,
  churches,
  projects,
  transactions,
  payouts,
  activityLogs,
  wallets,
  walletTransactions,
  walletTopUpMethods,
  payfastTransactions,
  paymentMethods,
  donations,
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
  type Wallet,
  type InsertWallet,
  type WalletTransaction,
  type InsertWalletTransaction,
  type WalletTopUpMethod,
  type InsertWalletTopUpMethod,
  type PayfastTransaction,
  type InsertPayfastTransaction,
  type PaymentMethod,
  type InsertPaymentMethod,
  type Donation,
  type InsertDonation,
  admins,
  superAdmins,
  type Admin,
  type InsertAdmin,
  type SuperAdmin,
  type InsertSuperAdmin,
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc, asc, count, sql, or, ilike } from "drizzle-orm";

export interface IStorage {
  // User operations (required for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  getUserById(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
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
  getSuperAdminAnalytics(): Promise<any>;
  
  // Wallet operations
  createWallet(wallet: InsertWallet): Promise<Wallet>;
  getWallet(id: string): Promise<Wallet | undefined>;
  getUserWallet(userId: string): Promise<Wallet | undefined>;
  updateWalletBalance(walletId: string, availableBalance: number, pendingBalance?: number): Promise<Wallet>;
  
  // Wallet transactions
  createWalletTransaction(transaction: InsertWalletTransaction): Promise<WalletTransaction>;
  getWalletTransaction(id: string): Promise<WalletTransaction | undefined>;
  getWalletTransactions(walletId: string, limit?: number, offset?: number): Promise<WalletTransaction[]>;
  getUserWalletTransactions(userId: string, limit?: number, offset?: number): Promise<WalletTransaction[]>;
  updateWalletTransactionStatus(id: string, status: string, failureReason?: string): Promise<WalletTransaction>;
  
  // Member search and transfers
  searchMembers(query: string, excludeUserId?: string): Promise<User[]>;
  processWalletTransfer(fromUserId: string, toUserId: string, amount: number, description?: string): Promise<{ success: boolean; transactionId?: string; error?: string }>;
  
  // PayFast integration
  createPayfastTransaction(transaction: InsertPayfastTransaction): Promise<PayfastTransaction>;
  updatePayfastTransaction(id: string, updates: Partial<PayfastTransaction>): Promise<PayfastTransaction>;
  
  // Additional methods for API endpoints
  getAllTransactions(): Promise<Transaction[]>;
  
  // Church branding and member personalization
  getUserChurch(userId: string): Promise<Church | undefined>;
  getUserStats(userId: string): Promise<any>;
  
  // Admin operations
  createAdmin(admin: InsertAdmin): Promise<Admin>;
  getAdminByEmail(email: string): Promise<Admin | undefined>;
  getAdminById(id: string): Promise<Admin | undefined>;
  updateAdminLogin(adminId: string): Promise<Admin>;
  incrementFailedLoginAttempts(adminId: string): Promise<Admin>;
  updateAdminBackupCodes(adminId: string, backupCodes: string[]): Promise<Admin>;
  enableTwoFactor(adminId: string): Promise<Admin>;
  disableTwoFactor(adminId: string): Promise<Admin>;

  // Super Admin operations (IMPORTANT) - for super admin auth system
  createSuperAdmin(superAdmin: InsertSuperAdmin): Promise<SuperAdmin>;
  getSuperAdminByEmail(email: string): Promise<SuperAdmin | undefined>;
  getSuperAdminById(id: string): Promise<SuperAdmin | undefined>;
  updateSuperAdminLoginInfo(id: string, loginInfo: Partial<Pick<SuperAdmin, 'lastLoginAt' | 'failedLoginAttempts' | 'accountLockedUntil'>>): Promise<SuperAdmin>;
  updateSuperAdminTwoFactor(id: string, twoFactorData: Partial<Pick<SuperAdmin, 'twoFactorSecret' | 'twoFactorEnabled' | 'twoFactorBackupCodes'>>): Promise<SuperAdmin>;
  deleteSuperAdminByEmail(email: string): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserById(id: string): Promise<User | undefined> {
    return await this.getUser(id);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
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

  async deleteChurch(id: string): Promise<void> {
    await db.delete(churches).where(eq(churches.id, id));
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
    try {
      const stats = await db
        .select({
          total: count(),
          pending: sql<number>`count(*) filter (where status = 'pending')`,
          approved: sql<number>`count(*) filter (where status = 'approved')`,
          active: sql<number>`count(*) filter (where is_active = true)`,
        })
        .from(churches);
      
      return stats[0] || { total: 0, pending: 0, approved: 0, active: 0 };
    } catch (error) {
      console.error("Error getting church stats:", error);
      return { total: 0, pending: 0, approved: 0, active: 0 };
    }
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
        const newAmount = parseFloat(project.currentAmount || '0') + parseFloat(newTransaction.amount || '0');
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

  // Wallet operations
  async createWallet(wallet: InsertWallet): Promise<Wallet> {
    const [newWallet] = await db.insert(wallets).values(wallet).returning();
    return newWallet;
  }

  async getWallet(id: string): Promise<Wallet | undefined> {
    const [wallet] = await db.select().from(wallets).where(eq(wallets.id, id));
    return wallet;
  }

  async getUserWallet(userId: string): Promise<Wallet | undefined> {
    const [wallet] = await db.select().from(wallets).where(eq(wallets.userId, userId));
    return wallet;
  }

  async updateWalletBalance(walletId: string, availableBalance: number, pendingBalance?: number): Promise<Wallet> {
    const updateData: any = { availableBalance, updatedAt: new Date() };
    if (pendingBalance !== undefined) {
      updateData.pendingBalance = pendingBalance;
    }
    
    const [wallet] = await db
      .update(wallets)
      .set(updateData)
      .where(eq(wallets.id, walletId))
      .returning();
    return wallet;
  }

  // Wallet transactions
  async createWalletTransaction(transaction: InsertWalletTransaction): Promise<WalletTransaction> {
    const [newTransaction] = await db.insert(walletTransactions).values(transaction).returning();
    return newTransaction;
  }

  async getWalletTransaction(id: string): Promise<WalletTransaction | undefined> {
    const [transaction] = await db.select().from(walletTransactions).where(eq(walletTransactions.id, id));
    return transaction;
  }

  async getWalletTransactions(walletId: string, limit = 50, offset = 0): Promise<WalletTransaction[]> {
    return await db
      .select()
      .from(walletTransactions)
      .where(eq(walletTransactions.walletId, walletId))
      .orderBy(desc(walletTransactions.createdAt))
      .limit(limit)
      .offset(offset);
  }

  async getUserWalletTransactions(userId: string, limit = 50, offset = 0): Promise<WalletTransaction[]> {
    return await db
      .select({
        id: walletTransactions.id,
        walletId: walletTransactions.walletId,
        type: walletTransactions.type,
        amount: walletTransactions.amount,
        currency: walletTransactions.currency,
        description: walletTransactions.description,
        fromWalletId: walletTransactions.fromWalletId,
        toWalletId: walletTransactions.toWalletId,
        transactionId: walletTransactions.transactionId,
        churchId: walletTransactions.churchId,
        paymentMethod: walletTransactions.paymentMethod,
        paymentReference: walletTransactions.paymentReference,
        processingFee: walletTransactions.processingFee,
        status: walletTransactions.status,
        failureReason: walletTransactions.failureReason,
        balanceBefore: walletTransactions.balanceBefore,
        balanceAfter: walletTransactions.balanceAfter,
        createdAt: walletTransactions.createdAt,
        updatedAt: walletTransactions.updatedAt,
      })
      .from(walletTransactions)
      .leftJoin(wallets, eq(walletTransactions.walletId, wallets.id))
      .where(eq(wallets.userId, userId))
      .orderBy(desc(walletTransactions.createdAt))
      .limit(limit)
      .offset(offset);
  }

  async updateWalletTransactionStatus(id: string, status: string, failureReason?: string): Promise<WalletTransaction> {
    const updateData: any = { status: status as any, updatedAt: new Date() };
    if (failureReason) {
      updateData.failureReason = failureReason;
    }
    
    const [transaction] = await db
      .update(walletTransactions)
      .set(updateData)
      .where(eq(walletTransactions.id, id))
      .returning();
    return transaction;
  }

  // Member search and transfers
  async searchMembers(query: string, excludeUserId?: string): Promise<User[]> {
    const searchQuery = `%${query.toLowerCase()}%`;
    let whereClause = or(
      ilike(users.firstName, searchQuery),
      ilike(users.lastName, searchQuery),
      ilike(users.email, searchQuery),
      ilike(users.profileImageUrl, searchQuery)
    );

    if (excludeUserId) {
      whereClause = and(whereClause, sql`${users.id} != ${excludeUserId}`);
    }

    return await db
      .select()
      .from(users)
      .where(whereClause)
      .limit(10);
  }

  async processWalletTransfer(fromUserId: string, toUserId: string, amount: number, description?: string): Promise<{ success: boolean; transactionId?: string; error?: string }> {
    try {
      // Start transaction
      return await db.transaction(async (tx) => {
        // Get sender's wallet
        const [senderWallet] = await tx.select().from(wallets).where(eq(wallets.userId, fromUserId));
        if (!senderWallet) {
          return { success: false, error: 'Sender wallet not found' };
        }

        // Get receiver's wallet
        const [receiverWallet] = await tx.select().from(wallets).where(eq(wallets.userId, toUserId));
        if (!receiverWallet) {
          return { success: false, error: 'Receiver wallet not found' };
        }

        // Check if sender has sufficient balance
        if (senderWallet.availableBalance < amount) {
          return { success: false, error: 'Insufficient balance' };
        }

        // Update sender's balance
        await tx
          .update(wallets)
          .set({ 
            availableBalance: senderWallet.availableBalance - amount,
            updatedAt: new Date()
          })
          .where(eq(wallets.id, senderWallet.id));

        // Update receiver's balance
        await tx
          .update(wallets)
          .set({ 
            availableBalance: receiverWallet.availableBalance + amount,
            updatedAt: new Date()
          })
          .where(eq(wallets.id, receiverWallet.id));

        // Create sender transaction record
        const [senderTransaction] = await tx
          .insert(walletTransactions)
          .values({
            walletId: senderWallet.id,
            type: 'transfer_sent',
            amount: -amount,
            description: description || `Transfer to ${toUserId}`,
            toWalletId: receiverWallet.id,
            status: 'completed',
            balanceBefore: senderWallet.availableBalance,
            balanceAfter: senderWallet.availableBalance - amount,
          })
          .returning();

        // Create receiver transaction record
        await tx
          .insert(walletTransactions)
          .values({
            walletId: receiverWallet.id,
            type: 'transfer_received',
            amount: amount,
            description: description || `Transfer from ${fromUserId}`,
            fromWalletId: senderWallet.id,
            status: 'completed',
            balanceBefore: receiverWallet.availableBalance,
            balanceAfter: receiverWallet.availableBalance + amount,
          });

        return { success: true, transactionId: senderTransaction.id };
      });
    } catch (error) {
      console.error('Transfer error:', error);
      return { success: false, error: 'Transfer failed' };
    }
  }

  // PayFast integration
  async createPayfastTransaction(transaction: InsertPayfastTransaction): Promise<PayfastTransaction> {
    const [newTransaction] = await db.insert(payfastTransactions).values(transaction).returning();
    return newTransaction;
  }

  async updatePayfastTransaction(id: string, updates: Partial<PayfastTransaction>): Promise<PayfastTransaction> {
    const [transaction] = await db
      .update(payfastTransactions)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(payfastTransactions.id, id))
      .returning();
    return transaction;
  }

  // Payment methods
  async createPaymentMethod(method: InsertPaymentMethod): Promise<PaymentMethod> {
    const [newMethod] = await db.insert(paymentMethods).values(method).returning();
    return newMethod;
  }

  async getUserPaymentMethods(userId: string): Promise<PaymentMethod[]> {
    return await db
      .select()
      .from(paymentMethods)
      .where(and(eq(paymentMethods.userId, userId), eq(paymentMethods.isActive, true)))
      .orderBy(desc(paymentMethods.isDefault), desc(paymentMethods.lastUsed));
  }

  async getPaymentMethod(id: string): Promise<PaymentMethod | undefined> {
    const [method] = await db.select().from(paymentMethods).where(eq(paymentMethods.id, id));
    return method;
  }

  async updatePaymentMethod(id: string, updates: Partial<InsertPaymentMethod>): Promise<PaymentMethod> {
    const [method] = await db
      .update(paymentMethods)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(paymentMethods.id, id))
      .returning();
    return method;
  }

  async deletePaymentMethod(id: string): Promise<void> {
    await db.update(paymentMethods)
      .set({ isActive: false, updatedAt: new Date() })
      .where(eq(paymentMethods.id, id));
  }

  async setDefaultPaymentMethod(userId: string, methodId: string): Promise<void> {
    // First, unset all default methods for the user
    await db.update(paymentMethods)
      .set({ isDefault: false, updatedAt: new Date() })
      .where(eq(paymentMethods.userId, userId));
    
    // Then set the selected method as default
    await db.update(paymentMethods)
      .set({ isDefault: true, updatedAt: new Date() })
      .where(eq(paymentMethods.id, methodId));
  }

  // Donations
  async createDonation(donation: InsertDonation): Promise<Donation> {
    const [newDonation] = await db.insert(donations).values(donation).returning();
    return newDonation;
  }

  async getDonation(id: string): Promise<Donation | undefined> {
    const [donation] = await db.select().from(donations).where(eq(donations.id, id));
    return donation;
  }

  async getUserDonations(userId: string, limit = 50): Promise<Donation[]> {
    return await db
      .select()
      .from(donations)
      .where(eq(donations.userId, userId))
      .orderBy(desc(donations.createdAt))
      .limit(limit);
  }

  async getChurchDonations(churchId: string, limit = 50): Promise<Donation[]> {
    return await db
      .select()
      .from(donations)
      .where(eq(donations.churchId, churchId))
      .orderBy(desc(donations.createdAt))
      .limit(limit);
  }

  async updateDonationStatus(id: string, status: string): Promise<Donation> {
    const [donation] = await db
      .update(donations)
      .set({ status: status as any, updatedAt: new Date() })
      .where(eq(donations.id, id))
      .returning();
    return donation;
  }

  // Additional methods for API endpoints
  async getAllTransactions(): Promise<Transaction[]> {
    return await db.select().from(transactions).orderBy(desc(transactions.createdAt));
  }

  // Church branding and member personalization
  async getUserChurch(userId: string): Promise<Church | undefined> {
    // First get the user to find their church membership
    const user = await this.getUser(userId);
    if (!user || !user.churchId) {
      return undefined;
    }
    
    return await this.getChurch(user.churchId);
  }

  async getUserStats(userId: string): Promise<any> {
    // Get user's donation history and calculate stats
    const userDonations = await this.getUserDonations(userId);
    
    const currentYear = new Date().getFullYear();
    const thisYearDonations = userDonations.filter(d => new Date(d.createdAt).getFullYear() === currentYear);
    
    const totalGiven = userDonations.reduce((sum, d) => sum + parseFloat(d.amount), 0);
    const thisYearGiven = thisYearDonations.reduce((sum, d) => sum + parseFloat(d.amount), 0);
    
    // Mock data for achievements and events - in a real app this would come from proper tables
    const annualGoal = 25000; // This could be stored in user preferences
    const goalProgress = Math.min((thisYearGiven / annualGoal) * 100, 100);
    
    const achievements = [];
    if (thisYearGiven > 10000) achievements.push('Faithful Giver 2025');
    if (userDonations.length > 50) achievements.push('Consistent Supporter');
    if (totalGiven > 50000) achievements.push('Generous Heart');
    
    const user = await this.getUser(userId);
    const memberSince = user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-ZA', { month: 'short', year: 'numeric' }) : 'Jan 2022';
    
    return {
      memberSince,
      totalGiven: totalGiven.toFixed(2),
      thisYearGiven: thisYearGiven.toFixed(2),
      goalProgress: Math.round(goalProgress),
      annualGoal: annualGoal.toString(),
      transactionCount: userDonations.length,
      averageGift: userDonations.length > 0 ? (totalGiven / userDonations.length).toFixed(2) : '0',
      recentAchievements: achievements,
      upcomingEvents: [
        { id: '1', title: 'Sunday Service', date: 'This Sunday', type: 'Weekly Service' },
        { id: '2', title: 'Community Outreach', date: 'Next Weekend', type: 'Community Event' }
      ]
    };
  }
  
  // Admin operations
  async createAdmin(adminData: InsertAdmin): Promise<Admin> {
    const [admin] = await db.insert(admins).values(adminData).returning();
    return admin;
  }

  async getAdminByEmail(email: string): Promise<Admin | undefined> {
    const [admin] = await db.select().from(admins).where(eq(admins.email, email));
    return admin;
  }

  async getAdminById(id: string): Promise<Admin | undefined> {
    const [admin] = await db.select().from(admins).where(eq(admins.id, id));
    return admin;
  }

  async getAdminById(id: string): Promise<Admin | undefined> {
    const [admin] = await db.select().from(admins).where(eq(admins.id, id));
    return admin;
  }

  async updateAdminLogin(adminId: string): Promise<Admin> {
    const [admin] = await db
      .update(admins)
      .set({ 
        lastLoginAt: new Date(),
        failedLoginAttempts: 0,
        accountLockedUntil: null,
        updatedAt: new Date()
      })
      .where(eq(admins.id, adminId))
      .returning();
    return admin;
  }

  async incrementFailedLoginAttempts(adminId: string): Promise<Admin> {
    // First get current admin to check failed attempts
    const currentAdmin = await this.getAdminById(adminId);
    if (!currentAdmin) throw new Error('Admin not found');
    
    const newFailedAttempts = (currentAdmin.failedLoginAttempts || 0) + 1;
    const shouldLockAccount = newFailedAttempts >= 5;
    const lockUntil = shouldLockAccount ? new Date(Date.now() + 30 * 60 * 1000) : null; // 30 minutes
    
    const [admin] = await db
      .update(admins)
      .set({ 
        failedLoginAttempts: newFailedAttempts,
        accountLockedUntil: lockUntil,
        updatedAt: new Date()
      })
      .where(eq(admins.id, adminId))
      .returning();
    return admin;
  }

  // Google Authenticator 2FA methods
  async updateAdminBackupCodes(adminId: string, backupCodes: string[]): Promise<Admin> {
    const [admin] = await db
      .update(admins)
      .set({ 
        twoFactorBackupCodes: backupCodes,
        updatedAt: new Date()
      })
      .where(eq(admins.id, adminId))
      .returning();
    return admin;
  }

  async enableTwoFactor(adminId: string): Promise<Admin> {
    const [admin] = await db
      .update(admins)
      .set({ 
        twoFactorEnabled: true,
        updatedAt: new Date()
      })
      .where(eq(admins.id, adminId))
      .returning();
    return admin;
  }

  async disableTwoFactor(adminId: string): Promise<Admin> {
    const [admin] = await db
      .update(admins)
      .set({ 
        twoFactorEnabled: false,
        twoFactorSecret: null,
        twoFactorBackupCodes: null,
        updatedAt: new Date()
      })
      .where(eq(admins.id, adminId))
      .returning();
    return admin;
  }

  async deleteAdminByEmail(email: string): Promise<boolean> {
    const result = await db
      .delete(admins)
      .where(eq(admins.email, email));
    return true;
  }

  // Super Admin operations
  async createSuperAdmin(superAdminData: InsertSuperAdmin): Promise<SuperAdmin> {
    const [superAdmin] = await db
      .insert(superAdmins)
      .values({
        ...superAdminData,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();
    return superAdmin;
  }

  async getSuperAdminByEmail(email: string): Promise<SuperAdmin | undefined> {
    const [superAdmin] = await db
      .select()
      .from(superAdmins)
      .where(eq(superAdmins.email, email));
    return superAdmin;
  }

  async getSuperAdminById(id: string): Promise<SuperAdmin | undefined> {
    const [superAdmin] = await db
      .select()
      .from(superAdmins)
      .where(eq(superAdmins.id, id));
    return superAdmin;
  }

  async updateSuperAdminLoginInfo(
    id: string,
    loginInfo: Partial<Pick<SuperAdmin, 'lastLoginAt' | 'failedLoginAttempts' | 'accountLockedUntil'>>
  ): Promise<SuperAdmin> {
    const [superAdmin] = await db
      .update(superAdmins)
      .set({
        ...loginInfo,
        updatedAt: new Date(),
      })
      .where(eq(superAdmins.id, id))
      .returning();
    return superAdmin;
  }

  async updateSuperAdminTwoFactor(
    id: string,
    twoFactorData: Partial<Pick<SuperAdmin, 'twoFactorSecret' | 'twoFactorEnabled' | 'twoFactorBackupCodes'>>
  ): Promise<SuperAdmin> {
    const [superAdmin] = await db
      .update(superAdmins)
      .set({
        ...twoFactorData,
        updatedAt: new Date(),
      })
      .where(eq(superAdmins.id, id))
      .returning();
    return superAdmin;
  }

  async deleteSuperAdminByEmail(email: string): Promise<void> {
    await db.delete(superAdmins).where(eq(superAdmins.email, email));
  }

  // Platform statistics for super admin dashboard
  async getPlatformStats(): Promise<any> {
    try {
      // Get church stats
      const churchStats = await this.getChurchStats();
      
      // Get total transactions and revenue
      const totalTransactions = await db.select({ count: count() }).from(transactions);
      const totalRevenue = await db.select({ 
        sum: sql<string>`COALESCE(SUM(${transactions.amount}), 0)` 
      }).from(transactions).where(eq(transactions.status, 'completed'));
      
      // Get platform fees
      const platformFees = await db.select({ 
        sum: sql<string>`COALESCE(SUM(${transactions.platformFee}), 0)` 
      }).from(transactions).where(eq(transactions.status, 'completed'));
      
      // Get member count
      const memberCount = await db.select({ count: count() }).from(users)
        .where(eq(users.role, 'member'));
      
      // Get payout stats
      const pendingPayouts = await db.select({ 
        sum: sql<string>`COALESCE(SUM(${payouts.amount}), 0)` 
      }).from(payouts).where(eq(payouts.status, 'requested'));
      
      const completedPayouts = await db.select({ 
        sum: sql<string>`COALESCE(SUM(${payouts.amount}), 0)` 
      }).from(payouts).where(eq(payouts.status, 'completed'));
      
      // Calculate monthly revenue (last 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const monthlyRevenue = await db.select({ 
        sum: sql<string>`COALESCE(SUM(${transactions.amount}), 0)` 
      }).from(transactions)
        .where(and(
          eq(transactions.status, 'completed'),
          sql`${transactions.createdAt} >= ${thirtyDaysAgo}`
        ));

      return {
        totalRevenue: parseFloat(totalRevenue[0].sum || '0').toFixed(2),
        totalTransactions: totalTransactions[0].count || 0,
        activeChurches: churchStats.approved || 0,
        totalChurches: churchStats.total || 0,
        totalMembers: memberCount[0].count || 0,
        pendingPayouts: parseFloat(pendingPayouts[0].sum || '0').toFixed(2),
        completedPayouts: parseFloat(completedPayouts[0].sum || '0').toFixed(2),
        platformFees: parseFloat(platformFees[0].sum || '0').toFixed(2),
        monthlyRevenue: parseFloat(monthlyRevenue[0].sum || '0').toFixed(2),
        revenueGrowth: 12.5, // Calculate actual growth later
        transactionGrowth: 8.3,
        churchGrowth: 15.2,
        payoutGrowth: 6.7
      };
    } catch (error) {
      console.error("Error getting platform stats:", error);
      return {
        totalRevenue: '0.00',
        totalTransactions: 0,
        activeChurches: 0,
        totalChurches: 0,
        totalMembers: 0,
        pendingPayouts: '0.00',
        completedPayouts: '0.00',
        platformFees: '0.00',
        monthlyRevenue: '0.00',
        revenueGrowth: 0,
        transactionGrowth: 0,
        churchGrowth: 0,
        payoutGrowth: 0
      };
    }
  }

  async getSuperAdminAnalytics(): Promise<any> {
    try {
      // Revenue analytics for the last 6 months
      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
      
      const revenueChart = await db.select({
        month: sql<string>`TO_CHAR(${transactions.createdAt}, 'YYYY-MM')`,
        revenue: sql<string>`COALESCE(SUM(${transactions.amount}), 0)`
      })
      .from(transactions)
      .where(and(
        eq(transactions.status, 'completed'),
        sql`${transactions.createdAt} >= ${sixMonthsAgo}`
      ))
      .groupBy(sql`TO_CHAR(${transactions.createdAt}, 'YYYY-MM')`)
      .orderBy(sql`TO_CHAR(${transactions.createdAt}, 'YYYY-MM')`);

      // Transaction volume chart
      const transactionChart = await db.select({
        month: sql<string>`TO_CHAR(${transactions.createdAt}, 'YYYY-MM')`,
        count: sql<number>`COUNT(*)`
      })
      .from(transactions)
      .where(sql`${transactions.createdAt} >= ${sixMonthsAgo}`)
      .groupBy(sql`TO_CHAR(${transactions.createdAt}, 'YYYY-MM')`)
      .orderBy(sql`TO_CHAR(${transactions.createdAt}, 'YYYY-MM')`);

      return {
        revenueChart: revenueChart.map(item => ({
          month: item.month,
          revenue: parseFloat(item.revenue || '0')
        })),
        transactionChart: transactionChart.map(item => ({
          month: item.month,
          transactions: item.count
        }))
      };
    } catch (error) {
      console.error("Error getting super admin analytics:", error);
      return {
        revenueChart: [],
        transactionChart: []
      };
    }
  }

  // Church dashboard data
  async getChurchDashboardData(churchId: string): Promise<any> {
    try {
      const church = await this.getChurch(churchId);
      if (!church) throw new Error('Church not found');

      // Get recent transactions
      const recentTransactions = await this.getChurchTransactions(churchId, 10);
      
      // Get church projects
      const projects = await this.getChurchProjects(churchId);
      
      // Get monthly stats
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const monthlyStats = await db.select({
        totalAmount: sql<string>`COALESCE(SUM(${transactions.amount}), 0)`,
        transactionCount: sql<number>`COUNT(*)`
      })
      .from(transactions)
      .where(and(
        eq(transactions.churchId, churchId),
        eq(transactions.status, 'completed'),
        sql`${transactions.createdAt} >= ${thirtyDaysAgo}`
      ));

      return {
        church,
        recentTransactions,
        projects,
        monthlyRevenue: parseFloat(monthlyStats[0]?.totalAmount || '0').toFixed(2),
        monthlyTransactions: monthlyStats[0]?.transactionCount || 0,
        totalMembers: await this.getChurchMemberCount(churchId)
      };
    } catch (error) {
      console.error("Error getting church dashboard data:", error);
      return null;
    }
  }

  // Member dashboard data
  async getMemberDashboardData(userId: string): Promise<any> {
    try {
      const user = await this.getUser(userId);
      if (!user) throw new Error('User not found');

      const church = user.churchId ? await this.getChurch(user.churchId) : null;
      const wallet = await this.getUserWallet(userId);
      const recentTransactions = await this.getUserTransactions(userId, 10);
      
      // Get user stats for this year
      const yearStart = new Date(new Date().getFullYear(), 0, 1);
      const yearlyStats = await db.select({
        totalGiven: sql<string>`COALESCE(SUM(${transactions.amount}), 0)`,
        transactionCount: sql<number>`COUNT(*)`
      })
      .from(transactions)
      .where(and(
        eq(transactions.userId, userId),
        eq(transactions.status, 'completed'),
        sql`${transactions.createdAt} >= ${yearStart}`
      ));

      return {
        user,
        church,
        wallet,
        recentTransactions,
        yearlyGiving: parseFloat(yearlyStats[0]?.totalGiven || '0').toFixed(2),
        yearlyTransactionCount: yearlyStats[0]?.transactionCount || 0,
        achievements: await this.getUserAchievements(userId)
      };
    } catch (error) {
      console.error("Error getting member dashboard data:", error);
      return null;
    }
  }

  // Helper methods
  async getChurchMemberCount(churchId: string): Promise<number> {
    const result = await db.select({ count: count() })
      .from(users)
      .where(and(
        eq(users.churchId, churchId),
        eq(users.role, 'member'),
        eq(users.isActive, true)
      ));
    return result[0]?.count || 0;
  }

  async getUserAchievements(userId: string): Promise<any[]> {
    // Simple achievement system - can be expanded
    const achievements = [];
    
    const totalGiving = await db.select({
      total: sql<string>`COALESCE(SUM(${transactions.amount}), 0)`
    })
    .from(transactions)
    .where(and(
      eq(transactions.userId, userId),
      eq(transactions.status, 'completed')
    ));

    const total = parseFloat(totalGiving[0]?.total || '0');
    
    if (total >= 1000) achievements.push({
      title: "Generous Giver",
      description: "Given over R1,000 in total",
      icon: "trophy",
      earned: true
    });
    
    if (total >= 5000) achievements.push({
      title: "Faithful Steward", 
      description: "Given over R5,000 in total",
      icon: "star",
      earned: true
    });

    return achievements;
  }


}

export const storage = new DatabaseStorage();
