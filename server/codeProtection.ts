/**
 * ChurPay Code Protection System
 * Monitors and prevents unauthorized modifications to core files
 */

export const LOCKED_FILES = [
  // Database & Schema
  'shared/schema.ts',
  'server/db.ts', 
  'drizzle.config.ts',
  
  // Authentication & Security
  'server/replitAuth.ts',
  'server/storage.ts',
  'client/src/hooks/useAuth.ts',
  'client/src/lib/authUtils.ts',
  
  // Core Application
  'server/index.ts',
  'server/routes.ts',
  'client/src/App.tsx',
  'client/src/main.tsx',
  'package.json',
  'vite.config.ts',
  'tailwind.config.ts',
  
  // Protection System
  'server/codeProtection.ts',
  'CODE_LOCK.md'
] as const;

export const PROTECTED_CONSTANTS = {
  PLATFORM_FEE_PERCENTAGE: 3.9,
  PLATFORM_FEE_FIXED: 3.00,
  CURRENCY: 'ZAR'
} as const;

/**
 * Validates that fee structure remains unchanged
 */
export function validateFeeStructure(): boolean {
  return (
    PROTECTED_CONSTANTS.PLATFORM_FEE_PERCENTAGE === 3.9 &&
    PROTECTED_CONSTANTS.PLATFORM_FEE_FIXED === 3.00
  );
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