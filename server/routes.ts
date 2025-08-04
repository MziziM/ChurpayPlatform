import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertChurchSchema, insertProjectSchema, insertTransactionSchema, insertPayoutSchema } from "@shared/schema";
import { protectCoreEndpoints, validateFeeStructure, PROTECTED_CONSTANTS } from "./codeProtection";
import { z } from "zod";
import { randomUUID } from "crypto";

export async function registerRoutes(app: Express): Promise<Server> {
  // Code protection middleware
  app.use(protectCoreEndpoints);
  
  // Validate fee structure on startup
  if (!validateFeeStructure()) {
    console.error("🚨 CRITICAL: Fee structure validation failed! Protected constants have been modified.");
    process.exit(1);
  }
  
  console.log("🔒 Code protection system active - Core files and fee structure locked");

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

  // Wallet API Routes
  
  // Get user's wallet
  app.get('/api/wallet', async (req, res) => {
    try {
      const userId = 'demo-user-123'; // In real app, get from authenticated session
      let wallet = await storage.getUserWallet(userId);
      
      // Create wallet if it doesn't exist
      if (!wallet) {
        wallet = await storage.createWallet({
          userId,
          availableBalance: "2850.75", // Demo balance
          pendingBalance: "125.00",
          rewardPoints: "340.50",
          isActive: true,
          isPinSet: true,
          dailyTransferLimit: "10000",
          monthlyTransferLimit: "50000",
          autoTopUpEnabled: false,
        });
      }
      
      res.json(wallet);
    } catch (error) {
      console.error("Error fetching wallet:", error);
      res.status(500).json({ message: "Failed to fetch wallet" });
    }
  });

  // Get wallet transactions
  app.get('/api/wallet/transactions', async (req, res) => {
    try {
      const userId = 'demo-user-123'; // In real app, get from authenticated session
      const limit = parseInt(req.query.limit as string) || 50;
      const offset = parseInt(req.query.offset as string) || 0;
      
      const transactions = await storage.getUserWalletTransactions(userId, limit, offset);
      res.json(transactions);
    } catch (error) {
      console.error("Error fetching wallet transactions:", error);
      res.status(500).json({ message: "Failed to fetch transactions" });
    }
  });

  // Search members for transfer
  app.get('/api/members/search', async (req, res) => {
    try {
      const query = req.query.q as string;
      const userId = 'demo-user-123'; // In real app, get from authenticated session
      
      if (!query || query.length < 2) {
        return res.json([]);
      }
      
      const members = await storage.searchMembers(query, userId);
      res.json(members);
    } catch (error) {
      console.error("Error searching members:", error);
      res.status(500).json({ message: "Failed to search members" });
    }
  });

  // Process wallet transfer
  app.post('/api/wallet/transfer', async (req, res) => {
    try {
      const { toUserId, amount, description } = req.body;
      const fromUserId = 'demo-user-123'; // In real app, get from authenticated session
      
      if (!toUserId || !amount || amount <= 0) {
        return res.status(400).json({ message: "Invalid transfer data" });
      }
      
      const result = await storage.processWalletTransfer(fromUserId, toUserId, amount, description);
      
      if (result.success) {
        res.json({ success: true, transactionId: result.transactionId });
      } else {
        res.status(400).json({ message: result.error });
      }
    } catch (error) {
      console.error("Error processing transfer:", error);
      res.status(500).json({ message: "Failed to process transfer" });
    }
  });

  // Create PayFast payment for wallet top-up
  app.post('/api/wallet/topup', async (req, res) => {
    try {
      const { amount, paymentMethod } = req.body;
      const userId = 'demo-user-123'; // In real app, get from authenticated session
      
      if (!amount || amount <= 0) {
        return res.status(400).json({ message: "Invalid amount" });
      }
      
      // Get user's wallet
      const wallet = await storage.getUserWallet(userId);
      if (!wallet) {
        return res.status(404).json({ message: "Wallet not found" });
      }
      
      // Calculate fees (3.9% + R3)
      const processingFee = (amount * 0.039) + 3;
      const totalAmount = amount + processingFee;
      
      // Create PayFast payment (in real app, integrate with PayFast API)
      const paymentId = `PF_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      const payfastTransaction = await storage.createPayfastTransaction({
        walletTransactionId: null, // Will be updated after wallet transaction is created
        paymentId,
        merchantId: 'DEMO_MERCHANT',
        merchantKey: 'DEMO_KEY',
        amount: totalAmount,
        itemName: 'ChurPay Wallet Top-up',
        itemDescription: `Top-up R${amount} to ChurPay wallet`,
        paymentStatus: 'pending',
      });
      
      // Create pending wallet transaction
      const walletTransaction = await storage.createWalletTransaction({
        walletId: wallet.id,
        type: 'deposit',
        amount,
        currency: 'ZAR',
        description: `PayFast top-up - R${amount}`,
        paymentMethod: paymentMethod as any,
        paymentReference: paymentId,
        processingFee: processingFee.toString(),
        status: 'pending',
        balanceBefore: wallet.availableBalance,
        balanceAfter: wallet.availableBalance, // Will be updated when payment completes
      });
      
      // Update PayFast transaction with wallet transaction ID
      await storage.updatePayfastTransaction(payfastTransaction.id, {
        walletTransactionId: walletTransaction.id,
      });
      
      // In real app, redirect to PayFast payment page
      res.json({
        success: true,
        paymentId,
        transactionId: walletTransaction.id,
        amount,
        processingFee,
        totalAmount,
        // paymentUrl: `https://www.payfast.co.za/eng/process?payment_id=${paymentId}` // Real PayFast URL
        paymentUrl: `/wallet?payment=success&amount=${amount}` // Demo redirect
      });
    } catch (error) {
      console.error("Error creating top-up:", error);
      res.status(500).json({ message: "Failed to create top-up" });
    }
  });

  // PayFast webhook (for real integration)
  app.post('/api/wallet/payfast-notify', async (req, res) => {
    try {
      const { payment_status, pf_payment_id, amount_gross, amount_fee, amount_net } = req.body;
      
      // In real app, verify PayFast signature and validate payment
      
      if (payment_status === 'COMPLETE') {
        // Find the PayFast transaction
        const payfastTransaction = await storage.updatePayfastTransaction(pf_payment_id, {
          paymentStatus: 'COMPLETE',
          pfPaymentId: pf_payment_id,
          amountGross: amount_gross.toString(),
          amountFee: amount_fee.toString(),
          amountNet: amount_net.toString(),
          paymentDate: new Date(),
        });
        
        if (payfastTransaction.walletTransactionId) {
          // Update wallet transaction status
          await storage.updateWalletTransactionStatus(payfastTransaction.walletTransactionId.toString(), 'completed');
          
          // Update wallet balance
          const walletTransaction = await storage.getWalletTransaction(payfastTransaction.walletTransactionId);
          if (walletTransaction) {
            const wallet = await storage.getWallet(walletTransaction.walletId);
            if (wallet) {
              await storage.updateWalletBalance(
                wallet.id,
                parseFloat(wallet.availableBalance) + parseFloat(walletTransaction.amount.toString())
              );
            }
          }
        }
      }
      
      res.status(200).send('OK');
    } catch (error) {
      console.error("Error processing PayFast notification:", error);
      res.status(500).send('ERROR');
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}