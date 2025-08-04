import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertChurchSchema, insertProjectSchema, insertTransactionSchema, insertPayoutSchema } from "@shared/schema";
import { protectCoreEndpoints, validateFeeStructure, PROTECTED_CONSTANTS } from "./codeProtection";
import { z } from "zod";
import { randomUUID } from "crypto";
import bcrypt from "bcryptjs";

export async function registerRoutes(app: Express): Promise<Server> {
  // Code protection middleware
  app.use(protectCoreEndpoints);
  
  // Validate fee structure on startup
  if (!validateFeeStructure()) {
    console.error("🚨 CRITICAL: Fee structure validation failed! Protected constants have been modified.");
    process.exit(1);
  }
  
  console.log("🔒 Code protection system active - Core files and fee structure locked");

  // Authentication endpoints
  app.post('/api/auth/member/signin', async (req, res) => {
    try {
      const { email, password } = z.object({
        email: z.string().email(),
        password: z.string()
      }).parse(req.body);

      // Find user by email
      const user = await storage.getUserByEmail(email);
      if (!user || !user.passwordHash) {
        return res.status(401).json({ message: "Invalid email or password" });
      }

      // Verify password
      const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
      if (!isPasswordValid) {
        return res.status(401).json({ message: "Invalid email or password" });
      }

      // Check if user is a member
      if (user.role !== 'member') {
        return res.status(401).json({ message: "Access denied. Member account required." });
      }

      // Create session data (excluding password hash)
      const { passwordHash, ...userData } = user;
      
      // Log successful login
      await storage.logActivity({
        userId: user.id,
        churchId: user.churchId,
        action: 'member_login',
        entity: 'user',
        entityId: user.id,
        details: { email: user.email, loginTime: new Date().toISOString() },
      });

      res.json({
        user: userData,
        message: "Sign in successful"
      });
    } catch (error: any) {
      console.error("Member sign-in error:", error);
      res.status(400).json({ message: "Sign in failed", error: error.message });
    }
  });

  app.post('/api/auth/church/signin', async (req, res) => {
    try {
      const { email, password } = z.object({
        email: z.string().email(),
        password: z.string()
      }).parse(req.body);

      // Find user by email
      const user = await storage.getUserByEmail(email);
      if (!user || !user.passwordHash) {
        return res.status(401).json({ message: "Invalid email or password" });
      }

      // Verify password
      const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
      if (!isPasswordValid) {
        return res.status(401).json({ message: "Invalid email or password" });
      }

      // Check if user is church admin or staff
      if (!['church_admin', 'church_staff'].includes(user.role || '')) {
        return res.status(401).json({ message: "Access denied. Church account required." });
      }

      // Get church information
      const church = user.churchId ? await storage.getChurch(user.churchId) : null;

      // Create session data (excluding password hash)
      const { passwordHash, ...userData } = user;
      
      // Log successful login
      await storage.logActivity({
        userId: user.id,
        churchId: user.churchId,
        action: 'church_admin_login',
        entity: 'user',
        entityId: user.id,
        details: { email: user.email, role: user.role, churchName: church?.name },
      });

      res.json({
        user: userData,
        church: church,
        message: "Sign in successful"
      });
    } catch (error: any) {
      console.error("Church sign-in error:", error);
      res.status(400).json({ message: "Sign in failed", error: error.message });
    }
  });

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
        password: z.string(),
        address: z.string(),
        addressLine2: z.string().optional(),
        city: z.string(),
        province: z.string(),
        postalCode: z.string(),
        country: z.string(),
        emergencyContactName: z.string(),
        emergencyContactPhone: z.string(),
        emergencyContactRelationship: z.string(),
        emergencyContactEmail: z.string().optional(),
        emergencyContactAddress: z.string(),
        membershipType: z.string(),
        previousChurch: z.string().optional(),
        howDidYouHear: z.string().optional(),
      }).parse(req.body);

      // Hash the password before storing
      const saltRounds = 12;
      const passwordHash = await bcrypt.hash(validatedData.password, saltRounds);

      const memberData = {
        ...validatedData,
        passwordHash,
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
        merchantId: process.env.PAYFAST_MERCHANT_ID!,
        merchantKey: process.env.PAYFAST_MERCHANT_KEY!,
        amount: totalAmount.toString(),
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
        paymentMethod: 'card',
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

  // Payment methods API
  app.get('/api/payment-methods', async (req, res) => {
    try {
      const userId = 'demo-user-123'; // In real app, get from authenticated session
      const paymentMethods = await storage.getUserPaymentMethods(userId);
      res.json(paymentMethods);
    } catch (error) {
      console.error("Error fetching payment methods:", error);
      res.status(500).json({ message: "Failed to fetch payment methods" });
    }
  });

  app.post('/api/payment-methods', async (req, res) => {
    try {
      const userId = 'demo-user-123'; // In real app, get from authenticated session
      const { type, maskedNumber, cardType, expiryMonth, expiryYear, nickname, payfastToken } = req.body;

      const paymentMethod = await storage.createPaymentMethod({
        userId,
        type,
        provider: 'payfast',
        maskedNumber,
        cardType,
        expiryMonth,
        expiryYear,
        nickname,
        payfastToken,
        isDefault: false,
        isActive: true,
      });

      res.json(paymentMethod);
    } catch (error) {
      console.error("Error creating payment method:", error);
      res.status(500).json({ message: "Failed to create payment method" });
    }
  });

  // Donation endpoints
  app.post('/api/donations/give', async (req, res) => {
    try {
      const userId = 'demo-user-123'; // In real app, get from authenticated session
      const { churchId, amount, note, paymentMethod, paymentMethodId } = req.body;

      const donation = await storage.createDonation({
        userId,
        churchId,
        reference: `DON_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        amount: amount.toString(),
        description: note,
        type: 'donation',
        paymentMethod: paymentMethod || 'wallet',
        paymentMethodId: paymentMethodId || null,
        status: 'completed',
      });

      res.json(donation);
    } catch (error) {
      console.error("Error processing donation:", error);
      res.status(500).json({ message: "Failed to process donation" });
    }
  });

  app.post('/api/donations/tithe', async (req, res) => {
    try {
      const userId = 'demo-user-123'; // In real app, get from authenticated session
      const { churchId, amount, paymentMethod, paymentMethodId } = req.body;

      const donation = await storage.createDonation({
        userId,
        churchId,
        reference: `TITHE_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        amount: amount.toString(),
        description: 'Monthly tithe payment',
        type: 'tithe',
        paymentMethod: paymentMethod || 'wallet',
        paymentMethodId: paymentMethodId || null,
        status: 'completed',
      });

      res.json(donation);
    } catch (error) {
      console.error("Error processing tithe:", error);
      res.status(500).json({ message: "Failed to process tithe" });
    }
  });

  // Project sponsorship endpoint
  app.post('/api/projects/sponsor', async (req, res) => {
    try {
      const userId = 'demo-user-123'; // In real app, get from authenticated session
      const { projectId, amount, paymentMethod, paymentMethodId } = req.body;

      // Get project details to get churchId
      const project = await storage.getProject(projectId);
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }

      const donation = await storage.createDonation({
        userId,
        churchId: project.churchId,
        projectId,
        amount: amount.toString(),
        description: `Project sponsorship: ${project.title}`,
        type: 'project',
        paymentMethod: paymentMethod || 'wallet',
        paymentMethodId: paymentMethodId || null,
        status: 'completed',
      });

      res.json(donation);
    } catch (error) {
      console.error("Error processing project sponsorship:", error);
      res.status(500).json({ message: "Failed to process project sponsorship" });
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

  // Member registration endpoint
  app.post('/api/members/register', async (req, res) => {
    try {
      const memberData = req.body;
      
      // Create new user with member role
      const userData = {
        id: `member-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        email: memberData.email,
        firstName: memberData.firstName,
        lastName: memberData.lastName,
        phone: memberData.phone,
        dateOfBirth: memberData.dateOfBirth,
        address: memberData.address,
        city: memberData.city,
        province: memberData.province,
        postalCode: memberData.postalCode,
        country: 'South Africa',
        emergencyContactName: memberData.emergencyContactName,
        emergencyContactPhone: memberData.emergencyContactPhone,
        emergencyContactRelationship: memberData.emergencyContactRelationship,
        membershipType: memberData.membershipType,
        previousChurch: memberData.previousChurch,
        howDidYouHear: memberData.howDidYouHear,
        role: 'member',
        churchId: memberData.churchId,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      
      // In production, this would create actual database records
      // For now, store the registration and return success
      console.log('New member registration:', userData);
      
      res.status(201).json({
        message: 'Member registration successful',
        user: {
          id: userData.id,
          firstName: userData.firstName,
          lastName: userData.lastName,
          email: userData.email,
          role: userData.role,
          churchId: userData.churchId,
        }
      });
    } catch (error: any) {
      console.error("Error registering member:", error);
      res.status(500).json({ message: "Failed to register member", error: error.message });
    }
  });

  // Churches API
  app.get('/api/churches', async (req, res) => {
    try {
      // Mock churches data for now
      const churches = [
        {
          id: '1',
          name: 'Grace Baptist Church',
          description: 'A welcoming community focused on faith, hope, and love.',
          location: 'Cape Town, South Africa',
          memberCount: 450,
          totalDonations: '125000.00',
          image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=center',
          logoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=center'
        },
        {
          id: '2',
          name: 'New Life Methodist Church',
          description: 'Building stronger communities through worship and service.',
          location: 'Johannesburg, South Africa',
          memberCount: 320,
          totalDonations: '98500.00',
          image: 'https://images.unsplash.com/photo-1548625149-fc4a29cf7092?w=200&h=200&fit=crop&crop=center',
          logoUrl: 'https://images.unsplash.com/photo-1548625149-fc4a29cf7092?w=200&h=200&fit=crop&crop=center'
        },
        {
          id: '3',
          name: 'Faith Assembly Church',
          description: 'Empowering believers to live purposeful lives.',
          location: 'Durban, South Africa',
          memberCount: 275,
          totalDonations: '87250.00',
          image: 'https://images.unsplash.com/photo-1520637836862-4d197d17c86a?w=200&h=200&fit=crop&crop=center',
          logoUrl: 'https://images.unsplash.com/photo-1520637836862-4d197d17c86a?w=200&h=200&fit=crop&crop=center'
        }
      ];
      res.json(churches);
    } catch (error) {
      console.error("Error fetching churches:", error);
      res.status(500).json({ message: "Failed to fetch churches" });
    }
  });

  // Projects API
  app.get('/api/projects', async (req, res) => {
    try {
      // Mock projects data for now
      const projects = [
        {
          id: '1',
          churchId: '1',
          churchName: 'Grace Baptist Church',
          title: 'New Sanctuary Building',
          description: 'Help us build a new sanctuary to accommodate our growing congregation.',
          targetAmount: '500000.00',
          currentAmount: '285000.00',
          deadline: '2025-12-01',
          category: 'Building',
          image: null,
          status: 'active'
        },
        {
          id: '2',
          churchId: '2',
          churchName: 'New Life Methodist Church',
          title: 'Community Outreach Program',
          description: 'Support our mission to help local families in need.',
          targetAmount: '75000.00',
          currentAmount: '42500.00',
          deadline: '2025-06-30',
          category: 'Outreach',
          image: null,
          status: 'active'
        },
        {
          id: '3',
          churchId: '3',
          churchName: 'Faith Assembly Church',
          title: 'Youth Ministry Equipment',
          description: 'Purchase new equipment for our growing youth ministry.',
          targetAmount: '25000.00',
          currentAmount: '18750.00',
          deadline: '2025-08-15',
          category: 'Ministry',
          image: null,
          status: 'active'
        }
      ];
      res.json(projects);
    } catch (error) {
      console.error("Error fetching projects:", error);
      res.status(500).json({ message: "Failed to fetch projects" });
    }
  });

  // Donations API
  app.get('/api/donations/history', async (req, res) => {
    try {
      // Mock donation history for now
      const donations = [
        {
          id: '1',
          amount: '500.00',
          type: 'donation',
          churchName: 'Grace Baptist Church',
          date: '2025-01-04T10:30:00Z',
          status: 'completed'
        },
        {
          id: '2',
          amount: '1000.00',
          type: 'tithe',
          churchName: 'Grace Baptist Church',
          date: '2025-01-01T09:00:00Z',
          status: 'completed'
        },
        {
          id: '3',
          amount: '250.00',
          type: 'project',
          churchName: 'New Life Methodist Church',
          projectTitle: 'Community Outreach Program',
          date: '2024-12-28T14:15:00Z',
          status: 'completed'
        }
      ];
      res.json(donations);
    } catch (error) {
      console.error("Error fetching donation history:", error);
      res.status(500).json({ message: "Failed to fetch donation history" });
    }
  });

  // Give donation
  app.post('/api/donations/give', async (req, res) => {
    try {
      const userId = 'demo-user-123'; // In real app, get from authenticated session
      const { churchId, amount, note } = req.body;

      if (!churchId || !amount || amount <= 0) {
        return res.status(400).json({ message: "Invalid donation data" });
      }

      // Check wallet balance
      const wallet = await storage.getUserWallet(userId);
      if (!wallet || parseFloat(wallet.availableBalance) < amount) {
        return res.status(400).json({ message: "Insufficient wallet balance" });
      }

      // Create wallet transaction
      const transaction = await storage.createWalletTransaction({
        walletId: wallet.id,
        type: 'donation',
        amount: (-amount).toString(),
        description: `Donation to church - ${note || 'General donation'}`,
        status: 'completed',
        currency: 'ZAR',
        reference: `DON${Date.now()}`,
        balanceBefore: wallet.availableBalance,
        balanceAfter: (parseFloat(wallet.availableBalance) - amount).toString(),
      });

      // Update wallet balance
      await storage.updateWalletBalance(wallet.id, parseFloat(wallet.availableBalance) - amount);

      res.json({ 
        success: true, 
        transactionId: transaction.id,
        message: "Donation processed successfully" 
      });
    } catch (error) {
      console.error("Error processing donation:", error);
      res.status(500).json({ message: "Failed to process donation" });
    }
  });

  // Pay tithe
  app.post('/api/donations/tithe', async (req, res) => {
    try {
      const userId = 'demo-user-123'; // In real app, get from authenticated session
      const { churchId, amount } = req.body;

      if (!churchId || !amount || amount <= 0) {
        return res.status(400).json({ message: "Invalid tithe data" });
      }

      // Check wallet balance
      const wallet = await storage.getUserWallet(userId);
      if (!wallet || parseFloat(wallet.availableBalance) < amount) {
        return res.status(400).json({ message: "Insufficient wallet balance" });
      }

      // Create wallet transaction
      const transaction = await storage.createWalletTransaction({
        walletId: wallet.id,
        type: 'tithe',
        amount: (-amount).toString(),
        description: `Tithe payment`,
        status: 'completed',
        currency: 'ZAR',
        reference: `TIT${Date.now()}`,
        balanceBefore: wallet.availableBalance,
        balanceAfter: (parseFloat(wallet.availableBalance) - amount).toString(),
      });

      // Update wallet balance
      await storage.updateWalletBalance(wallet.id, parseFloat(wallet.availableBalance) - amount);

      res.json({ 
        success: true, 
        transactionId: transaction.id,
        message: "Tithe processed successfully" 
      });
    } catch (error) {
      console.error("Error processing tithe:", error);
      res.status(500).json({ message: "Failed to process tithe" });
    }
  });

  // Sponsor project
  app.post('/api/projects/sponsor', async (req, res) => {
    try {
      const userId = 'demo-user-123'; // In real app, get from authenticated session
      const { projectId, amount } = req.body;

      if (!projectId || !amount || amount <= 0) {
        return res.status(400).json({ message: "Invalid sponsorship data" });
      }

      // Check wallet balance
      const wallet = await storage.getUserWallet(userId);
      if (!wallet || parseFloat(wallet.availableBalance) < amount) {
        return res.status(400).json({ message: "Insufficient wallet balance" });
      }

      // Create wallet transaction
      const transaction = await storage.createWalletTransaction({
        walletId: wallet.id,
        type: 'project',
        amount: (-amount).toString(),
        description: `Project sponsorship`,
        status: 'completed',
        currency: 'ZAR',
        reference: `PRJ${Date.now()}`,
        balanceBefore: wallet.availableBalance,
        balanceAfter: (parseFloat(wallet.availableBalance) - amount).toString(),
      });

      // Update wallet balance
      await storage.updateWalletBalance(wallet.id, parseFloat(wallet.availableBalance) - amount);

      res.json({ 
        success: true, 
        transactionId: transaction.id,
        message: "Project sponsorship processed successfully" 
      });
    } catch (error) {
      console.error("Error processing sponsorship:", error);
      res.status(500).json({ message: "Failed to process sponsorship" });
    }
  });

  // User stats endpoint with detailed breakdown  
  app.get('/api/user/stats', async (req, res) => {
    try {
      // For now, use mock user ID - in real app this would come from authentication
      const mockUserId = 'mock-user-id';
      
      // Get user's transactions
      const allTransactions = await storage.getTransactions();
      const userTransactions = allTransactions.filter(t => 
        (t.userId === mockUserId || !t.userId) && t.status === 'completed'
      );
      
      if (userTransactions.length === 0) {
        // Return default stats for new users
        const stats = {
          memberSince: 'January 2025',
          totalGiven: '0.00',
          thisYearGiven: '0.00',
          goalProgress: 0,
          annualGoal: '25000.00',
          transactionCount: 0,
          averageGift: '0.00'
        };
        return res.json(stats);
      }
      
      const totalGiven = userTransactions.reduce((sum, t) => sum + parseFloat(t.amount), 0);
      const thisYearTransactions = userTransactions.filter(t => 
        new Date(t.createdAt || new Date()).getFullYear() === new Date().getFullYear()
      );
      const thisYearGiven = thisYearTransactions.reduce((sum, t) => sum + parseFloat(t.amount), 0);
      
      // Calculate member since date (using first transaction or default)
      const firstTransaction = userTransactions.sort((a, b) => 
        new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime()
      )[0];
      const memberSince = firstTransaction?.createdAt ? 
        new Date(firstTransaction.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long' }) :
        'January 2025';
      
      // Goal progress calculation (example: R25,000 annual goal)
      const annualGoal = 25000;
      const goalProgress = Math.min((thisYearGiven / annualGoal) * 100, 100);
      
      const stats = {
        memberSince,
        totalGiven: totalGiven.toFixed(2),
        thisYearGiven: thisYearGiven.toFixed(2),
        goalProgress: Math.round(goalProgress),
        annualGoal: annualGoal.toFixed(2),
        transactionCount: userTransactions.length,
        averageGift: userTransactions.length > 0 ? (totalGiven / userTransactions.length).toFixed(2) : '0.00'
      };
      
      res.json(stats);
    } catch (error: any) {
      console.error("Error fetching user stats:", error);
      res.status(500).json({ message: "Failed to fetch user stats", error: error.message });
    }
  });

  // Recent activity endpoint
  app.get('/api/user/recent-activity', async (req, res) => {
    try {
      // For now, use mock user ID - in real app this would come from authentication
      const mockUserId = 'mock-user-id';
      
      const transactions = await storage.getTransactions();
      const userRecentTransactions = transactions
        .filter(t => (t.userId === mockUserId || !t.userId) && t.status === 'completed')
        .sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime())
        .slice(0, 8) // Get 8 most recent
        .map(transaction => {
          const timeAgo = getTimeAgo(new Date(transaction.createdAt || new Date()));
          return {
            id: transaction.id,
            type: transaction.donationType || 'donation',
            amount: `R ${parseFloat(transaction.amount).toLocaleString()}`,
            description: getActivityDescription(transaction),
            timeAgo,
            status: transaction.status,
            icon: getActivityIcon(transaction.donationType || 'donation')
          };
        });
      
      res.json(userRecentTransactions);
    } catch (error: any) {
      console.error("Error fetching recent activity:", error);
      res.status(500).json({ message: "Failed to fetch recent activity", error: error.message });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

// Helper functions for activity formatting
function getTimeAgo(date: Date): string {
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  if (diffInSeconds < 60) return 'Just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
  return date.toLocaleDateString();
}

function getActivityDescription(transaction: any): string {
  const donationType = transaction.donationType || transaction.type;
  switch (donationType) {
    case 'general':
    case 'donation':
      return `Donation to Church`;
    case 'tithe':
      return `Tithe offering to Church`;
    case 'offering':
      return `Offering to Church`;
    case 'project':
      return `Project sponsorship`;
    case 'topup':
      return 'Wallet top-up';
    default:
      return transaction.description || 'Church transaction';
  }
}

function getActivityIcon(type: string): string {
  switch (type) {
    case 'general':
    case 'donation':
      return 'heart';
    case 'tithe':
      return 'church';
    case 'offering':
      return 'church';
    case 'project':
      return 'target';
    case 'topup':
      return 'wallet';
    default:
      return 'activity';
  }
}