import { sql, relations } from 'drizzle-orm';
import {
  index,
  jsonb,
  pgTable,
  timestamp,
  varchar,
  text,
  boolean,
  decimal,
  integer,
  uuid,
  pgEnum,
  date,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Platform fee constants
export const PLATFORM_FEE_PERCENTAGE = 3.9; // 3.9%
export const PLATFORM_FEE_FIXED = 3.00; // R3 fixed fee per transaction

// Fee calculation utility
export function calculatePlatformFees(amount: number): {
  platformFee: number;
  netAmount: number;
  feeBreakdown: {
    percentageFee: number;
    fixedFee: number;
  };
} {
  const percentageFee = (amount * PLATFORM_FEE_PERCENTAGE) / 100;
  const fixedFee = PLATFORM_FEE_FIXED;
  const platformFee = percentageFee + fixedFee;
  const netAmount = amount - platformFee;
  
  return {
    platformFee: Math.round(platformFee * 100) / 100, // Round to 2 decimal places
    netAmount: Math.round(netAmount * 100) / 100,
    feeBreakdown: {
      percentageFee: Math.round(percentageFee * 100) / 100,
      fixedFee: fixedFee
    }
  };
}

// Session storage table for Replit Auth
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User roles enum
export const userRoleEnum = pgEnum('user_role', ['superadmin', 'admin', 'church_admin', 'church_staff', 'member', 'public']);

// Church status enum
export const churchStatusEnum = pgEnum('church_status', ['pending', 'under_review', 'approved', 'rejected', 'suspended']);

// Transaction status enum
export const transactionStatusEnum = pgEnum('transaction_status', ['pending', 'completed', 'failed', 'refunded']);

// Payout status enum
export const payoutStatusEnum = pgEnum('payout_status', ['requested', 'under_review', 'approved', 'processing', 'completed', 'rejected']);

// Project status enum
export const projectStatusEnum = pgEnum('project_status', ['draft', 'active', 'completed', 'cancelled']);

// Wallet transaction types enum
export const walletTransactionTypeEnum = pgEnum('wallet_transaction_type', [
  'deposit', 'withdrawal', 'transfer_sent', 'transfer_received', 'donation', 
  'reward', 'refund', 'fee', 'cashback'
]);

// Wallet transaction status enum
export const walletTransactionStatusEnum = pgEnum('wallet_transaction_status', [
  'pending', 'completed', 'failed', 'cancelled', 'processing'
]);

// Payment method enum
export const paymentMethodEnum = pgEnum('payment_method', [
  'card', 'bank_transfer', 'eft', 'wallet', 'payfast', 'ozow', 'snapscan'
]);

// Users table (Required for Replit Auth)
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  
  // Authentication fields (Replit Auth + Local Auth)
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  
  // Local authentication
  passwordHash: varchar("password_hash", { length: 255 }),
  
  // Member-specific fields
  phone: varchar("phone", { length: 20 }),
  dateOfBirth: date("date_of_birth"),
  
  // Address Information
  address: text("address"),
  addressLine2: text("address_line_2"),
  city: varchar("city", { length: 100 }),
  province: varchar("province", { length: 100 }),
  postalCode: varchar("postal_code", { length: 10 }),
  country: varchar("country", { length: 100 }).default('South Africa'),
  
  // Emergency Contact
  emergencyContactName: varchar("emergency_contact_name", { length: 255 }),
  emergencyContactPhone: varchar("emergency_contact_phone", { length: 20 }),
  emergencyContactRelationship: varchar("emergency_contact_relationship", { length: 100 }),
  emergencyContactEmail: varchar("emergency_contact_email", { length: 255 }),
  emergencyContactAddress: text("emergency_contact_address"),
  
  // Church-related Information
  membershipType: varchar("membership_type", { length: 50 }),
  previousChurch: varchar("previous_church", { length: 255 }),
  howDidYouHear: varchar("how_did_you_hear", { length: 255 }),
  
  // System fields
  role: userRoleEnum("role").default('public'),
  churchId: uuid("church_id"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Churches table
export const churches = pgTable("churches", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  
  // Basic Church Information
  name: varchar("name", { length: 255 }).notNull(),
  denomination: varchar("denomination", { length: 100 }).notNull(),
  registrationNumber: varchar("registration_number", { length: 50 }).notNull(),
  taxNumber: varchar("tax_number", { length: 50 }).notNull(),
  yearEstablished: varchar("year_established", { length: 4 }).notNull(),
  
  // Contact Information
  contactEmail: varchar("contact_email", { length: 255 }).notNull(),
  contactPhone: varchar("contact_phone", { length: 20 }).notNull(),
  alternativePhone: varchar("alternative_phone", { length: 20 }),
  website: varchar("website", { length: 255 }),
  
  // Physical Address
  address: text("address").notNull(),
  city: varchar("city", { length: 100 }).notNull(),
  province: varchar("province", { length: 100 }).notNull(),
  postalCode: varchar("postal_code", { length: 10 }).notNull(),
  country: varchar("country", { length: 100 }).default('South Africa'),
  
  // Banking Information
  bankName: varchar("bank_name", { length: 100 }).notNull(),
  accountNumber: varchar("account_number", { length: 50 }).notNull(),
  branchCode: varchar("branch_code", { length: 10 }).notNull(),
  accountHolder: varchar("account_holder", { length: 255 }).notNull(),
  accountType: varchar("account_type", { length: 50 }).notNull(),
  
  // Church Details
  description: text("description").notNull(),
  memberCount: integer("member_count").notNull(),
  servicesTimes: text("services_times").notNull(),
  leadPastor: varchar("lead_pastor", { length: 255 }).notNull(),
  logoUrl: varchar("logo_url", { length: 500 }), // Church logo image URL
  
  // Administrative Contact
  adminFirstName: varchar("admin_first_name", { length: 100 }).notNull(),
  adminLastName: varchar("admin_last_name", { length: 100 }).notNull(),
  adminEmail: varchar("admin_email", { length: 255 }).notNull(),
  adminPhone: varchar("admin_phone", { length: 20 }).notNull(),
  adminPosition: varchar("admin_position", { length: 100 }).notNull(),
  
  // Document Verification Flags
  hasNpoRegistration: boolean("has_npo_registration").default(false),
  hasTaxClearance: boolean("has_tax_clearance").default(false),
  hasBankConfirmation: boolean("has_bank_confirmation").default(false),
  
  // Documents (File paths)
  cipcDocument: varchar("cipc_document"),
  bankConfirmationLetter: varchar("bank_confirmation_letter"),
  taxClearanceCertificate: varchar("tax_clearance_certificate"),
  
  // Status and metadata
  status: churchStatusEnum("status").default('pending'),
  adminUserId: varchar("admin_user_id"), // Foreign key to users
  
  // Platform settings
  commissionRate: decimal("commission_rate", { precision: 5, scale: 2 }).default('10.00'), // Default 10%
  isActive: boolean("is_active").default(true),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Church projects for fundraising
export const projects = pgTable("projects", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  churchId: uuid("church_id").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  targetAmount: decimal("target_amount", { precision: 12, scale: 2 }).notNull(),
  currentAmount: decimal("current_amount", { precision: 12, scale: 2 }).default('0.00'),
  status: projectStatusEnum("status").default('draft'),
  startDate: timestamp("start_date"),
  endDate: timestamp("end_date"),
  isPublic: boolean("is_public").default(false), // Can be accessed by non-members
  imageUrl: varchar("image_url"),
  createdBy: varchar("created_by"), // User ID
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Transactions table
export const transactions = pgTable("transactions", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  churchId: uuid("church_id").notNull(),
  userId: varchar("user_id"), // Can be null for anonymous donations
  projectId: uuid("project_id"), // Can be null for general donations
  
  // Transaction details
  amount: decimal("amount", { precision: 12, scale: 2 }).notNull(),
  currency: varchar("currency", { length: 3 }).default('ZAR'),
  description: text("description"),
  donationType: varchar("donation_type", { length: 50 }).default('general'), // general, tithe, offering, project
  
  // Payment processing
  paymentMethod: varchar("payment_method", { length: 50 }), // card, eft, mobile_money
  paymentReference: varchar("payment_reference", { length: 255 }),
  processingFee: decimal("processing_fee", { precision: 8, scale: 2 }),
  platformFee: decimal("platform_fee", { precision: 8, scale: 2 }),
  netAmount: decimal("net_amount", { precision: 12, scale: 2 }),
  
  status: transactionStatusEnum("status").default('pending'),
  
  // Metadata
  isAnonymous: boolean("is_anonymous").default(false),
  isRecurring: boolean("is_recurring").default(false),
  recurringFrequency: varchar("recurring_frequency", { length: 20 }), // monthly, weekly, etc.
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Payout requests
export const payouts = pgTable("payouts", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  churchId: uuid("church_id").notNull(),
  requestedBy: varchar("requested_by").notNull(), // User ID
  
  // Payout details
  amount: decimal("amount", { precision: 12, scale: 2 }).notNull(),
  currency: varchar("currency", { length: 3 }).default('ZAR'),
  description: text("description"),
  
  // Bank details (can override church defaults)
  bankName: varchar("bank_name", { length: 100 }),
  accountNumber: varchar("account_number", { length: 50 }),
  branchCode: varchar("branch_code", { length: 10 }),
  accountHolder: varchar("account_holder", { length: 255 }),
  
  status: payoutStatusEnum("status").default('requested'),
  
  // Processing details
  processedBy: varchar("processed_by"), // SuperAdmin user ID
  processedAt: timestamp("processed_at"),
  paymentReference: varchar("payment_reference", { length: 255 }),
  rejectionReason: text("rejection_reason"),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Member wallets table
export const wallets = pgTable("wallets", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  
  // Wallet balances
  availableBalance: decimal("available_balance", { precision: 12, scale: 2 }).default('0.00'),
  pendingBalance: decimal("pending_balance", { precision: 12, scale: 2 }).default('0.00'),
  rewardPoints: decimal("reward_points", { precision: 12, scale: 2 }).default('0.00'),
  
  // Wallet settings
  isActive: boolean("is_active").default(true),
  isPinSet: boolean("is_pin_set").default(false),
  pinHash: varchar("pin_hash"), // Hashed wallet PIN for transactions
  
  // Limits and restrictions
  dailyTransferLimit: decimal("daily_transfer_limit", { precision: 12, scale: 2 }).default('10000.00'),
  monthlyTransferLimit: decimal("monthly_transfer_limit", { precision: 12, scale: 2 }).default('50000.00'),
  
  // Auto settings
  autoTopUpEnabled: boolean("auto_top_up_enabled").default(false),
  autoTopUpAmount: decimal("auto_top_up_amount", { precision: 12, scale: 2 }),
  autoTopUpThreshold: decimal("auto_top_up_threshold", { precision: 12, scale: 2 }),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Wallet transactions table
export const walletTransactions = pgTable("wallet_transactions", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  walletId: uuid("wallet_id").notNull(),
  
  // Transaction details
  type: walletTransactionTypeEnum("type").notNull(),
  amount: decimal("amount", { precision: 12, scale: 2 }).notNull(),
  currency: varchar("currency", { length: 3 }).default('ZAR'),
  description: text("description"),
  
  // Related entities
  fromWalletId: uuid("from_wallet_id"), // For transfers
  toWalletId: uuid("to_wallet_id"), // For transfers
  transactionId: uuid("transaction_id"), // Link to main transactions table
  churchId: uuid("church_id"), // For donations/church-related transactions
  
  // Payment processing
  paymentMethod: paymentMethodEnum("payment_method"),
  paymentReference: varchar("payment_reference"),
  processingFee: decimal("processing_fee", { precision: 8, scale: 2 }),
  
  // Status and metadata
  status: walletTransactionStatusEnum("status").default('pending'),
  failureReason: text("failure_reason"),
  
  // Balance tracking
  balanceBefore: decimal("balance_before", { precision: 12, scale: 2 }),
  balanceAfter: decimal("balance_after", { precision: 12, scale: 2 }),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Wallet top-up methods table
export const walletTopUpMethods = pgTable("wallet_top_up_methods", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  walletId: uuid("wallet_id").notNull(),
  
  // Payment method details
  paymentMethod: paymentMethodEnum("payment_method").notNull(),
  methodName: varchar("method_name"), // User-defined name
  
  // Card details (encrypted/tokenized)
  cardToken: varchar("card_token"), // Tokenized card for PayFast
  cardLast4: varchar("card_last_4", { length: 4 }),
  cardBrand: varchar("card_brand", { length: 20 }),
  expiryMonth: varchar("expiry_month", { length: 2 }),
  expiryYear: varchar("expiry_year", { length: 4 }),
  
  // Bank details
  bankName: varchar("bank_name"),
  accountNumber: varchar("account_number"), // Masked
  branchCode: varchar("branch_code"),
  accountType: varchar("account_type"),
  
  // Status and settings
  isDefault: boolean("is_default").default(false),
  isActive: boolean("is_active").default(true),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// PayFast integration table
export const payfastTransactions = pgTable("payfast_transactions", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  walletTransactionId: uuid("wallet_transaction_id"),
  
  // PayFast specific fields
  paymentId: varchar("payment_id").notNull(), // PayFast payment_id
  merchantId: varchar("merchant_id").notNull(),
  merchantKey: varchar("merchant_key").notNull(),
  
  // Transaction details
  amount: decimal("amount", { precision: 12, scale: 2 }).notNull(),
  itemName: varchar("item_name").notNull(),
  itemDescription: text("item_description"),
  
  // Status tracking
  paymentStatus: varchar("payment_status"), // COMPLETE, CANCELLED, FAILED
  paymentDate: timestamp("payment_date"),
  
  // PayFast response data
  pfPaymentId: varchar("pf_payment_id"),
  paymentMethod: varchar("payment_method"),
  amountGross: decimal("amount_gross", { precision: 12, scale: 2 }),
  amountFee: decimal("amount_fee", { precision: 12, scale: 2 }),
  amountNet: decimal("amount_net", { precision: 12, scale: 2 }),
  
  // Security
  signature: varchar("signature"),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Activity logs for audit trail
export const activityLogs = pgTable("activity_logs", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id"),
  churchId: uuid("church_id"),
  action: varchar("action", { length: 100 }).notNull(),
  entity: varchar("entity", { length: 50 }).notNull(), // user, church, transaction, etc.
  entityId: varchar("entity_id"),
  details: jsonb("details"),
  ipAddress: varchar("ip_address", { length: 45 }),
  userAgent: text("user_agent"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Enhanced payment methods for storing cards and bank accounts
export const paymentMethods = pgTable("payment_methods", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  type: varchar("type").notNull(), // 'card', 'bank_account'
  provider: varchar("provider").notNull().default('payfast'),
  
  // Card details (tokenized/encrypted)
  maskedNumber: varchar("masked_number").notNull(), // Last 4 digits for cards
  expiryMonth: varchar("expiry_month"), // For cards
  expiryYear: varchar("expiry_year"), // For cards
  cardType: varchar("card_type"), // 'visa', 'mastercard', etc.
  
  // Bank details
  bankName: varchar("bank_name"), // For bank accounts
  accountType: varchar("account_type"), // 'checking', 'savings'
  
  // User preferences
  nickname: varchar("nickname"), // User-friendly name like "Main Card"
  isDefault: boolean("is_default").default(false),
  isActive: boolean("is_active").default(true),
  
  // PayFast integration
  payfastToken: varchar("payfast_token"), // PayFast card tokenization
  
  lastUsed: timestamp("last_used"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Enhanced donations table for tracking giving, tithing, and project sponsorship
export const donations = pgTable("donations", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  churchId: varchar("church_id"),
  projectId: varchar("project_id"),
  
  // Financial details
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  currency: varchar("currency").default("ZAR"),
  processingFee: decimal("processing_fee", { precision: 10, scale: 2 }),
  netAmount: decimal("net_amount", { precision: 10, scale: 2 }),
  
  // Donation metadata
  type: varchar("type").notNull(), // 'donation', 'tithe', 'project'
  note: text("note"),
  isRecurring: boolean("is_recurring").default(false),
  isAnonymous: boolean("is_anonymous").default(false),
  
  // Payment details
  paymentMethod: varchar("payment_method").notNull(), // 'wallet', 'card'
  paymentMethodId: varchar("payment_method_id"), // Reference to stored payment method
  status: varchar("status").notNull(), // 'pending', 'completed', 'failed'
  
  // References
  reference: varchar("reference").notNull(),
  payfastPaymentId: varchar("payfast_payment_id"),
  walletTransactionId: uuid("wallet_transaction_id").references(() => walletTransactions.id),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ one, many }) => ({
  church: one(churches, {
    fields: [users.churchId],
    references: [churches.id],
  }),
  transactions: many(transactions),
  payouts: many(payouts),
  activityLogs: many(activityLogs),
  wallet: one(wallets, {
    fields: [users.id],
    references: [wallets.userId],
  }),
}));

export const walletsRelations = relations(wallets, ({ one, many }) => ({
  user: one(users, {
    fields: [wallets.userId],
    references: [users.id],
  }),
  transactions: many(walletTransactions),
  topUpMethods: many(walletTopUpMethods),
}));

export const walletTransactionsRelations = relations(walletTransactions, ({ one }) => ({
  wallet: one(wallets, {
    fields: [walletTransactions.walletId],
    references: [wallets.id],
  }),
  fromWallet: one(wallets, {
    fields: [walletTransactions.fromWalletId],
    references: [wallets.id],
  }),
  toWallet: one(wallets, {
    fields: [walletTransactions.toWalletId],
    references: [wallets.id],
  }),
  transaction: one(transactions, {
    fields: [walletTransactions.transactionId],
    references: [transactions.id],
  }),
  church: one(churches, {
    fields: [walletTransactions.churchId],
    references: [churches.id],
  }),
  payfastTransaction: one(payfastTransactions, {
    fields: [walletTransactions.id],
    references: [payfastTransactions.walletTransactionId],
  }),
}));

export const walletTopUpMethodsRelations = relations(walletTopUpMethods, ({ one }) => ({
  wallet: one(wallets, {
    fields: [walletTopUpMethods.walletId],
    references: [wallets.id],
  }),
}));

export const payfastTransactionsRelations = relations(payfastTransactions, ({ one }) => ({
  walletTransaction: one(walletTransactions, {
    fields: [payfastTransactions.walletTransactionId],
    references: [walletTransactions.id],
  }),
}));

export const churchesRelations = relations(churches, ({ one, many }) => ({
  admin: one(users, {
    fields: [churches.adminUserId],
    references: [users.id],
  }),
  members: many(users),
  projects: many(projects),
  transactions: many(transactions),
  payouts: many(payouts),
  activityLogs: many(activityLogs),
}));

export const projectsRelations = relations(projects, ({ one, many }) => ({
  church: one(churches, {
    fields: [projects.churchId],
    references: [churches.id],
  }),
  transactions: many(transactions),
  creator: one(users, {
    fields: [projects.createdBy],
    references: [users.id],
  }),
}));

export const transactionsRelations = relations(transactions, ({ one }) => ({
  church: one(churches, {
    fields: [transactions.churchId],
    references: [churches.id],
  }),
  user: one(users, {
    fields: [transactions.userId],
    references: [users.id],
  }),
  project: one(projects, {
    fields: [transactions.projectId],
    references: [projects.id],
  }),
}));

export const payoutsRelations = relations(payouts, ({ one }) => ({
  church: one(churches, {
    fields: [payouts.churchId],
    references: [churches.id],
  }),
  requestedByUser: one(users, {
    fields: [payouts.requestedBy],
    references: [users.id],
  }),
  processedByUser: one(users, {
    fields: [payouts.processedBy],
    references: [users.id],
  }),
}));

export const activityLogsRelations = relations(activityLogs, ({ one }) => ({
  user: one(users, {
    fields: [activityLogs.userId],
    references: [users.id],
  }),
  church: one(churches, {
    fields: [activityLogs.churchId],
    references: [churches.id],
  }),
}));

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertChurchSchema = createInsertSchema(churches).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertProjectSchema = createInsertSchema(projects).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertTransactionSchema = createInsertSchema(transactions).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertPayoutSchema = createInsertSchema(payouts).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertActivityLogSchema = createInsertSchema(activityLogs).omit({
  id: true,
  createdAt: true,
});

export const insertWalletSchema = createInsertSchema(wallets).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertWalletTransactionSchema = createInsertSchema(walletTransactions).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertWalletTopUpMethodSchema = createInsertSchema(walletTopUpMethods).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertPayfastTransactionSchema = createInsertSchema(payfastTransactions).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertPaymentMethodSchema = createInsertSchema(paymentMethods).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertDonationSchema = createInsertSchema(donations).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Admin users table - separate from regular users for enhanced security
export const admins = pgTable("admins", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  firstName: varchar("first_name", { length: 100 }).notNull(),
  lastName: varchar("last_name", { length: 100 }).notNull(),
  email: varchar("email", { length: 255 }).unique().notNull(),
  passwordHash: varchar("password_hash", { length: 255 }).notNull(),
  role: userRoleEnum("role").default('admin'),
  isActive: boolean("is_active").default(true),
  lastLoginAt: timestamp("last_login_at"),
  failedLoginAttempts: integer("failed_login_attempts").default(0),
  accountLockedUntil: timestamp("account_locked_until"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Zod schemas for admins
export const insertAdminSchema = createInsertSchema(admins).omit({
  id: true,
  passwordHash: true,
  createdAt: true,
  updatedAt: true,
});

// Export types
export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type InsertAdmin = typeof admins.$inferInsert;
export type Admin = typeof admins.$inferSelect;

export type Church = typeof churches.$inferSelect;
export type InsertChurch = z.infer<typeof insertChurchSchema>;

export type Project = typeof projects.$inferSelect;
export type InsertProject = z.infer<typeof insertProjectSchema>;

export type Transaction = typeof transactions.$inferSelect;
export type InsertTransaction = z.infer<typeof insertTransactionSchema>;

export type Payout = typeof payouts.$inferSelect;
export type InsertPayout = z.infer<typeof insertPayoutSchema>;

export type ActivityLog = typeof activityLogs.$inferSelect;
export type InsertActivityLog = z.infer<typeof insertActivityLogSchema>;

export type Wallet = typeof wallets.$inferSelect;
export type InsertWallet = z.infer<typeof insertWalletSchema>;

export type WalletTransaction = typeof walletTransactions.$inferSelect;
export type InsertWalletTransaction = z.infer<typeof insertWalletTransactionSchema>;

export type WalletTopUpMethod = typeof walletTopUpMethods.$inferSelect;
export type InsertWalletTopUpMethod = z.infer<typeof insertWalletTopUpMethodSchema>;

export type PayfastTransaction = typeof payfastTransactions.$inferSelect;
export type InsertPayfastTransaction = z.infer<typeof insertPayfastTransactionSchema>;

export type PaymentMethod = typeof paymentMethods.$inferSelect;
export type InsertPaymentMethod = z.infer<typeof insertPaymentMethodSchema>;

export type Donation = typeof donations.$inferSelect;
export type InsertDonation = z.infer<typeof insertDonationSchema>;
