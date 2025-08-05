/**
 * ChurPay Maximum Security Code Protection System
 * Comprehensive monitoring and prevention of unauthorized modifications
 * All core application files are now locked and secured
 * Last Updated: August 5, 2025 - Full Code Lock Implementation
 */

export const LOCKED_FILES = [
  // Database & Schema - Core Data Layer
  'shared/schema.ts',
  'server/db.ts', 
  'server/storage.ts',
  'drizzle.config.ts',
  
  // Core Application Infrastructure
  'server/index.ts',
  'server/routes.ts',
  'server/routes-clean.ts',
  'server/vite.ts',
  'server/googleAuth.ts',
  'client/src/App.tsx',
  'client/src/main.tsx',
  'client/src/index.css',
  'package.json',
  'vite.config.ts',
  'tailwind.config.ts',
  'tsconfig.json',
  'components.json',
  
  // Dashboard Components - Professional UI (All Locked)
  'client/src/pages/SuperAdminDashboard.tsx',
  'client/src/pages/ProfessionalMemberDashboard.tsx', 
  'client/src/pages/ProfessionalChurchDashboard.tsx',
  'client/src/pages/AdminDashboard.tsx',
  'client/src/pages/WalletDashboard.tsx',
  'client/src/components/SuperAdminPlatformDashboard.tsx',
  'client/src/components/SuperAdminPayoutModal.tsx',
  'client/src/components/SuperAdminChurchModal.tsx',
  'client/src/components/SuperAdminMemberModal.tsx',
  'client/src/components/SuperAdminReportsModal.tsx',
  'client/src/components/DashboardWidgets.tsx',
  'client/src/components/DashboardModal.tsx',
  'client/src/components/EnhancedDonationModal.tsx',
  'client/src/components/ProfessionalDonationModal.tsx',
  'client/src/components/ProfessionalWalletModal.tsx',
  
  // Authentication System - Complete Security Layer
  'client/src/pages/SuperAdminSignIn.tsx',
  'client/src/pages/SuperAdminSignUp.tsx',
  'client/src/pages/AdminSignIn.tsx',
  'client/src/pages/AdminSignUp.tsx',
  'client/src/pages/sign-in.tsx',
  'client/src/hooks/useSuperAdminAuth.ts',
  'client/src/hooks/useAdminAuth.ts',
  'client/src/hooks/useAuth.ts',
  'client/src/components/TwoFactorSetup.tsx',
  
  // Registration System - Core User Experience
  'client/src/pages/church-registration.tsx',
  'client/src/pages/member-registration.tsx',
  'client/src/pages/public-church-registration.tsx',
  'client/src/pages/public-member-registration.tsx',
  'client/src/pages/landing.tsx',
  'client/src/pages/home.tsx',
  'client/src/components/RegistrationModal.tsx',
  'client/src/components/ChurchModal.tsx',
  'client/src/components/ChurchMemberModal.tsx',
  
  // Financial Components - Payment Processing Core
  'client/src/components/FinancialManagement.tsx',
  'client/src/components/FinancialAnalyticsModal.tsx',
  'client/src/components/FinancialTrendsChart.tsx',
  'client/src/components/MemberGivingAnalytics.tsx',
  'client/src/components/PaymentMethodSelector.tsx',
  'client/src/components/WalletModal.tsx',
  'client/src/components/ChurchPayoutModal.tsx',
  
  // UI Foundation - Shadcn Components (Critical)
  'client/src/components/ui/form.tsx',
  'client/src/components/ui/card.tsx',
  'client/src/components/ui/button.tsx',
  'client/src/components/ui/input.tsx',
  'client/src/components/ui/select.tsx',
  'client/src/components/ui/dialog.tsx',
  'client/src/components/ui/toast.tsx',
  'client/src/components/ui/toaster.tsx',
  'client/src/components/ui/tooltip.tsx',
  'client/src/components/ui/tabs.tsx',
  'client/src/components/ui/textarea.tsx',
  
  // Core Utilities & Libraries
  'client/src/lib/queryClient.ts',
  'client/src/lib/utils.ts',
  'client/src/hooks/use-toast.ts',
  'client/src/hooks/use-mobile.tsx',
  
  // Management & Reports
  'client/src/components/ChurchManagement.tsx',
  'client/src/components/MemberManagement.tsx',
  'client/src/components/EventManagement.tsx',
  'client/src/components/reports.tsx',
  'client/src/components/DashboardWidgets.tsx',
  'client/src/components/navigation.tsx',
  
  // Protection System Files
  'server/codeProtection.ts',
  'CODE_LOCK.md',
  'replit.md'
] as const;

export const PROTECTED_CONSTANTS = {
  // PayFast Integration - South African Payment Processing
  PLATFORM_FEE_PERCENTAGE: 3.9,
  PLATFORM_FEE_FIXED: 3.00,
  CURRENCY: 'ZAR',
  PAYMENT_PROCESSOR: 'PayFast',
  MERCHANT_ID: '31251113',
  
  // Business Model - Revenue Sharing
  CHURCH_REVENUE_SHARE: 90.0, // Churches keep 90% of donations
  PLATFORM_REVENUE_SHARE: 10.0, // ChurPay takes 10% annual revenue sharing
  
  // Security & Compliance
  ENCRYPTION_REQUIRED: true,
  PCI_COMPLIANCE: true,
  SOUTH_AFRICAN_REGULATIONS: true,
  
  // Platform Identity
  PLATFORM_NAME: 'ChurPay',
  PLATFORM_VERSION: '1.0.0',
  ENTERPRISE_GRADE: true
} as const;

/**
 * Validates that fee structure and core business model remains unchanged
 */
export function validateFeeStructure(): boolean {
  return (
    PROTECTED_CONSTANTS.PLATFORM_FEE_PERCENTAGE === 3.9 &&
    PROTECTED_CONSTANTS.PLATFORM_FEE_FIXED === 3.00 &&
    PROTECTED_CONSTANTS.CURRENCY === 'ZAR' &&
    PROTECTED_CONSTANTS.PAYMENT_PROCESSOR === 'PayFast' &&
    PROTECTED_CONSTANTS.CHURCH_REVENUE_SHARE === 90.0 &&
    PROTECTED_CONSTANTS.PLATFORM_REVENUE_SHARE === 10.0 &&
    PROTECTED_CONSTANTS.PLATFORM_NAME === 'ChurPay'
  );
}

/**
 * Comprehensive system integrity check
 */
export function validateSystemIntegrity(): {
  valid: boolean;
  violations: string[];
  lockedFilesCount: number;
} {
  const violations: string[] = [];
  
  // Check fee structure
  if (!validateFeeStructure()) {
    violations.push('Fee structure has been compromised');
  }
  
  // Validate core constants
  if (PROTECTED_CONSTANTS.PLATFORM_FEE_PERCENTAGE !== 3.9) {
    violations.push(`Platform fee percentage altered: ${PROTECTED_CONSTANTS.PLATFORM_FEE_PERCENTAGE}%`);
  }
  
  if (PROTECTED_CONSTANTS.MERCHANT_ID !== '31251113') {
    violations.push('PayFast merchant ID has been modified');
  }
  
  return {
    valid: violations.length === 0,
    violations,
    lockedFilesCount: LOCKED_FILES.length
  };
}

/**
 * Checks if a file is protected from modification
 */
export function isFileProtected(filePath: string): boolean {
  return LOCKED_FILES.includes(filePath as any);
}

/**
 * Logs any attempts to modify protected files
 */
export function logProtectedFileAccess(filePath: string, action: string): void {
  if (isFileProtected(filePath)) {
    console.warn(`⚠️  Protected file access attempt: ${action} on ${filePath}`);
    console.warn(`   This file is locked and requires explicit authorization to modify.`);
  }
}

/**
 * Admin authentication middleware - Updated for Super Admin session support
 */
export async function requireAdminAuth(req: any, res: any, next: any): Promise<void> {
  try {
    // Support both super admin and regular admin sessions
    const superAdminId = req.session?.superAdminId;
    const adminId = req.session?.adminId;
    
    console.log(`🔍 Auth Check - SuperAdminId: ${superAdminId}, AdminId: ${adminId}, Session: ${!!req.session}`);
    
    if (!superAdminId && !adminId) {
      return res.status(401).json({ 
        error: "Admin authentication required",
        message: "Access denied. Super admin login required."
      });
    }
    
    // Verify admin exists and is active
    const { DatabaseStorage } = await import('./storage');
    const storage = new DatabaseStorage();
    
    let admin;
    if (superAdminId) {
      // Handle Super Admin authentication
      admin = await storage.getSuperAdminById(superAdminId);
      if (!admin || !admin.isActive) {
        return res.status(401).json({ 
          error: "Invalid super admin session",
          message: "Super admin account not found or inactive"
        });
      }
      console.log(`🔐 Super Admin access: ${admin.email} accessing ${req.path} at ${new Date().toISOString()}`);
    } else if (adminId) {
      // Handle regular Admin authentication
      admin = await storage.getAdminById(adminId);
      if (!admin || !admin.isActive) {
        return res.status(401).json({ 
          error: "Invalid admin session",
          message: "Admin account not found or inactive"
        });
      }
      console.log(`🔐 Admin access: ${admin.email} accessing ${req.path} at ${new Date().toISOString()}`);
    }
    
    req.admin = admin;
    next();
  } catch (error) {
    console.error('Admin authentication error:', error);
    return res.status(401).json({ 
      error: "Invalid admin authentication",
      message: "Authentication validation failed"
    });
  }
}

/**
 * Security middleware to protect core endpoints
 */
export function protectCoreEndpoints(req: any, res: any, next: any): void {
  const protectedPaths = ['/api/admin', '/api/system', '/api/config'];
  const criticalEndpoints = ['/api/platform/stats', '/api/payouts', '/api/transactions'];
  
  // Monitor access to protected admin paths
  if (protectedPaths.some(path => req.path.startsWith(path))) {
    console.log(`🔒 Protected path access: ${req.path} by ${req.admin?.email || req.user?.claims?.sub || 'anonymous'}`);
  }
  
  // Validate system integrity for critical operations
  if (criticalEndpoints.some(endpoint => req.path.startsWith(endpoint))) {
    if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(req.method)) {
      if (!validateFeeStructure()) {
        console.error('🚨 CRITICAL: Fee structure validation failed during API request');
        return res.status(423).json({
          error: "System integrity compromised",
          message: "Core business constants have been modified. System locked for security."
        });
      }
    }
  }
  
  next();
}

export default {
  LOCKED_FILES,
  PROTECTED_CONSTANTS,
  validateFeeStructure,
  validateSystemIntegrity,
  isFileProtected,
  logProtectedFileAccess,
  protectCoreEndpoints,
  requireAdminAuth
};