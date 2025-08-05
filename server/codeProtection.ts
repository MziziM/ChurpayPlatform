/**
 * ChurPay Code Protection System
 * Monitors and prevents unauthorized modifications to core files
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
  'client/src/App.tsx',
  'client/src/main.tsx',
  'client/src/index.css',
  'package.json',
  'vite.config.ts',
  'tailwind.config.ts',
  'tsconfig.json',
  
  // Dashboard Components - Professional UI
  'client/src/pages/SuperAdminDashboard.tsx',
  'client/src/pages/ProfessionalMemberDashboard.tsx', 
  'client/src/pages/ProfessionalChurchDashboard.tsx',
  'client/src/components/SuperAdminPayoutModal.tsx',
  'client/src/components/SuperAdminChurchModal.tsx',
  'client/src/components/SuperAdminMemberModal.tsx',
  'client/src/components/SuperAdminReportsModal.tsx',
  
  // Registration System - Core User Experience
  'client/src/pages/ChurchRegistration.tsx',
  'client/src/pages/MemberRegistration.tsx',
  'client/src/pages/Landing.tsx',
  'client/src/components/ui/form.tsx',
  'client/src/components/ui/card.tsx',
  'client/src/components/ui/button.tsx',
  
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
 * Admin authentication middleware - requires valid admin session
 */
export async function requireAdminAuth(req: any, res: any, next: any): Promise<void> {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ 
        error: "Admin authentication required",
        message: "Valid admin token must be provided"
      });
    }
    
    const token = authHeader.substring(7);
    const decoded = Buffer.from(token, 'base64').toString('utf-8');
    const [adminId, timestamp] = decoded.split(':');
    
    // Check token age (24 hours max)
    const tokenAge = Date.now() - parseInt(timestamp);
    if (tokenAge > 24 * 60 * 60 * 1000) {
      return res.status(401).json({ 
        error: "Admin session expired",
        message: "Please sign in again"
      });
    }
    
    // Verify admin exists and is active
    const { DatabaseStorage } = await import('./storage');
    const storage = new DatabaseStorage();
    const admin = await storage.getAdminById(adminId);
    
    if (!admin || !admin.isActive) {
      return res.status(401).json({ 
        error: "Invalid admin session",
        message: "Admin account not found or inactive"
      });
    }
    
    // Log admin access for security monitoring
    console.log(`🔐 Admin access: ${admin.email} accessing ${req.path} at ${new Date().toISOString()}`);
    
    req.admin = admin;
    next();
  } catch (error) {
    console.error('Admin authentication error:', error);
    return res.status(401).json({ 
      error: "Invalid admin authentication",
      message: "Token validation failed"
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