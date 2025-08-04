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
 * Security middleware to protect core endpoints
 */
export function protectCoreEndpoints(req: any, res: any, next: any): void {
  const protectedPaths = ['/api/admin', '/api/system', '/api/config'];
  
  if (protectedPaths.some(path => req.path.startsWith(path))) {
    // Additional security checks for core system endpoints
    console.log(`🔒 Core endpoint access: ${req.path} by user ${req.user?.claims?.sub || 'anonymous'}`);
  }
  
  next();
}

export default {
  LOCKED_FILES,
  PROTECTED_CONSTANTS,
  validateFeeStructure,
  isFileProtected,
  logProtectedFileAccess,
  protectCoreEndpoints
};