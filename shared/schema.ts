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
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

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
export const userRoleEnum = pgEnum('user_role', ['superadmin', 'church_admin', 'church_staff', 'member', 'public']);

// Church status enum
export const churchStatusEnum = pgEnum('church_status', ['pending', 'under_review', 'approved', 'rejected', 'suspended']);

// Transaction status enum
export const transactionStatusEnum = pgEnum('transaction_status', ['pending', 'completed', 'failed', 'refunded']);

// Payout status enum
export const payoutStatusEnum = pgEnum('payout_status', ['requested', 'under_review', 'approved', 'processing', 'completed', 'rejected']);

// Project status enum
export const projectStatusEnum = pgEnum('project_status', ['draft', 'active', 'completed', 'cancelled']);

// Users table (Required for Replit Auth)
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  role: userRoleEnum("role").default('public'),
  churchId: uuid("church_id"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Churches table
export const churches = pgTable("churches", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name", { length: 255 }).notNull(),
  denomination: varchar("denomination", { length: 100 }),
  registrationNumber: varchar("registration_number", { length: 50 }),
  taxNumber: varchar("tax_number", { length: 50 }),
  contactEmail: varchar("contact_email", { length: 255 }).notNull(),
  contactPhone: varchar("contact_phone", { length: 20 }),
  address: text("address"),
  city: varchar("city", { length: 100 }),
  province: varchar("province", { length: 100 }),
  postalCode: varchar("postal_code", { length: 10 }),
  country: varchar("country", { length: 100 }).default('South Africa'),
  
  // Banking details
  bankName: varchar("bank_name", { length: 100 }),
  accountNumber: varchar("account_number", { length: 50 }),
  branchCode: varchar("branch_code", { length: 10 }),
  accountHolder: varchar("account_holder", { length: 255 }),
  
  // Documents
  cipcDocument: varchar("cipc_document"), // File path
  bankConfirmationLetter: varchar("bank_confirmation_letter"), // File path
  taxClearanceCertificate: varchar("tax_clearance_certificate"), // File path
  
  // Status and metadata
  status: churchStatusEnum("status").default('pending'),
  adminUserId: varchar("admin_user_id"), // Foreign key to users
  website: varchar("website"),
  description: text("description"),
  memberCount: integer("member_count").default(0),
  
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

// Relations
export const usersRelations = relations(users, ({ one, many }) => ({
  church: one(churches, {
    fields: [users.churchId],
    references: [churches.id],
  }),
  transactions: many(transactions),
  payouts: many(payouts),
  activityLogs: many(activityLogs),
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

// Export types
export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

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
