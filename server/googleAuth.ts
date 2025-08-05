/**
 * Google Authenticator Integration for ChurPay Admin 2FA
 * Provides enterprise-grade two-factor authentication using TOTP
 */

import * as speakeasy from 'speakeasy';
import QRCode from 'qrcode';
import { randomBytes } from 'crypto';

export interface TwoFactorSetup {
  secret: string;
  qrCodeUrl: string;
  backupCodes: string[];
  manualEntryKey: string;
}

export interface TwoFactorValidation {
  isValid: boolean;
  isBackupCode?: boolean;
  usedBackupCode?: string;
}

/**
 * Generates a new 2FA secret and QR code for Google Authenticator setup
 */
export async function generateTwoFactorSecret(userEmail: string, userName: string): Promise<TwoFactorSetup> {
  try {
    // Generate TOTP secret compatible with Google Authenticator
    const secret = speakeasy.generateSecret({
      name: `ChurPay Admin (${userEmail})`,
      issuer: 'ChurPay',
      length: 32
    });

    // Generate QR code for easy scanning
    const qrCodeUrl = await QRCode.toDataURL(secret.otpauth_url!);

    // Generate backup codes (10 codes, 8 characters each)
    const backupCodes = Array.from({ length: 10 }, () => 
      randomBytes(4).toString('hex').toUpperCase()
    );

    return {
      secret: secret.base32,
      qrCodeUrl,
      backupCodes,
      manualEntryKey: secret.base32
    };
  } catch (error) {
    console.error('Error generating 2FA secret:', error);
    throw new Error('Failed to generate 2FA setup');
  }
}

/**
 * Validates a TOTP code from Google Authenticator
 */
export function validateTwoFactorCode(secret: string, token: string, window = 2): boolean {
  try {
    return speakeasy.totp.verify({
      secret,
      encoding: 'base32',
      token,
      window // Allow 2 windows (30 seconds before/after)
    });
  } catch (error) {
    console.error('Error validating 2FA code:', error);
    return false;
  }
}

/**
 * Validates a token (either TOTP or backup code)
 */
export function validateTwoFactorToken(
  secret: string, 
  token: string, 
  backupCodes: string[] = []
): TwoFactorValidation {
  try {
    // First try TOTP validation
    const isValidTotp = validateTwoFactorCode(secret, token);
    if (isValidTotp) {
      return { isValid: true };
    }

    // If TOTP fails, check backup codes
    const upperToken = token.toUpperCase().trim();
    const matchingBackupCode = backupCodes.find(code => code === upperToken);
    
    if (matchingBackupCode) {
      return { 
        isValid: true, 
        isBackupCode: true, 
        usedBackupCode: matchingBackupCode 
      };
    }

    return { isValid: false };
  } catch (error) {
    console.error('Error validating 2FA token:', error);
    return { isValid: false };
  }
}

/**
 * Generates a current TOTP code for testing/verification
 */
export function getCurrentTotpCode(secret: string): string {
  try {
    return speakeasy.totp({
      secret,
      encoding: 'base32'
    });
  } catch (error) {
    console.error('Error generating current TOTP code:', error);
    throw new Error('Failed to generate TOTP code');
  }
}

/**
 * Removes a used backup code from the list
 */
export function removeUsedBackupCode(backupCodes: string[], usedCode: string): string[] {
  return backupCodes.filter(code => code !== usedCode.toUpperCase().trim());
}

/**
 * Validates the strength of a 2FA setup
 */
export function validateTwoFactorSetup(secret: string): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (!secret || secret.length < 16) {
    errors.push('Secret must be at least 16 characters long');
  }

  if (!/^[A-Z2-7]+$/.test(secret)) {
    errors.push('Secret must be a valid base32 string');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

export default {
  generateTwoFactorSecret,
  validateTwoFactorCode,
  validateTwoFactorToken,
  getCurrentTotpCode,
  removeUsedBackupCode,
  validateTwoFactorSetup
};