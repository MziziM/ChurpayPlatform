import crypto from 'crypto';
import { Request } from 'express';

export interface PayFastIPN {
  m_payment_id: string;
  pf_payment_id: string;
  payment_status: string;
  item_name: string;
  item_description?: string;
  amount_gross: string;
  amount_fee: string;
  amount_net: string;
  custom_str1?: string;
  custom_str2?: string;
  custom_str3?: string;
  custom_str4?: string;
  custom_str5?: string;
  custom_int1?: string;
  custom_int2?: string;
  custom_int3?: string;
  custom_int4?: string;
  custom_int5?: string;
  name_first?: string;
  name_last?: string;
  email_address?: string;
  merchant_id: string;
  signature: string;
}

export interface PayFastConfig {
  merchantId: string;
  merchantKey: string;
  passphrase?: string;
  testMode?: boolean;
}

/**
 * Validates PayFast IPN signature
 */
export function validatePayFastSignature(
  ipnData: PayFastIPN,
  config: PayFastConfig
): boolean {
  try {
    // Create parameter string for signature validation
    const { signature, ...dataForSignature } = ipnData;
    
    // Build parameter string (excluding signature)
    const paramString = Object.keys(dataForSignature)
      .filter(key => dataForSignature[key as keyof typeof dataForSignature] !== undefined)
      .sort()
      .map(key => `${key}=${encodeURIComponent(dataForSignature[key as keyof typeof dataForSignature] as string)}`)
      .join('&');

    // Add passphrase if provided
    const finalString = config.passphrase 
      ? `${paramString}&passphrase=${encodeURIComponent(config.passphrase)}`
      : paramString;

    // Generate signature
    const calculatedSignature = crypto
      .createHash('md5')
      .update(finalString)
      .digest('hex');

    return calculatedSignature === signature;
  } catch (error) {
    console.error('PayFast signature validation error:', error);
    return false;
  }
}

/**
 * Validates PayFast payment notification data
 */
export function validatePayFastIPN(data: any): data is PayFastIPN {
  const required = [
    'm_payment_id',
    'pf_payment_id', 
    'payment_status',
    'item_name',
    'amount_gross',
    'amount_fee',
    'amount_net',
    'merchant_id',
    'signature'
  ];

  return required.every(field => data[field] !== undefined);
}

/**
 * Creates PayFast payment URL
 */
export function createPayFastPaymentUrl(
  config: PayFastConfig,
  paymentData: {
    amount: number;
    itemName: string;
    itemDescription?: string;
    returnUrl?: string;
    cancelUrl?: string;
    notifyUrl?: string;
    customStr1?: string;
    customStr2?: string;
    customStr3?: string;
    customStr4?: string;
    customStr5?: string;
  }
): string {
  const baseUrl = config.testMode 
    ? 'https://sandbox.payfast.co.za/eng/process'
    : 'https://www.payfast.co.za/eng/process';

  const params = {
    merchant_id: config.merchantId,
    merchant_key: config.merchantKey,
    amount: paymentData.amount.toFixed(2),
    item_name: paymentData.itemName,
    item_description: paymentData.itemDescription || '',
    return_url: paymentData.returnUrl || '',
    cancel_url: paymentData.cancelUrl || '',
    notify_url: paymentData.notifyUrl || '',
    custom_str1: paymentData.customStr1 || '',
    custom_str2: paymentData.customStr2 || '',
    custom_str3: paymentData.customStr3 || '',
    custom_str4: paymentData.customStr4 || '',
    custom_str5: paymentData.customStr5 || ''
  };

  // Remove empty parameters
  const filteredParams = Object.fromEntries(
    Object.entries(params).filter(([_, value]) => value !== '')
  );

  // Create parameter string
  const paramString = Object.keys(filteredParams)
    .sort()
    .map(key => `${key}=${encodeURIComponent(filteredParams[key as keyof typeof filteredParams])}`)
    .join('&');

  // Add passphrase and generate signature
  const finalString = config.passphrase 
    ? `${paramString}&passphrase=${encodeURIComponent(config.passphrase)}`
    : paramString;

  const signature = crypto
    .createHash('md5')
    .update(finalString)
    .digest('hex');

  // Add signature to parameters
  const urlParams = `${paramString}&signature=${signature}`;

  return `${baseUrl}?${urlParams}`;
}

/**
 * Extracts PayFast IPN data from express request
 */
export function extractPayFastIPN(req: Request): PayFastIPN | null {
  try {
    const data = req.body;
    
    if (!validatePayFastIPN(data)) {
      return null;
    }

    return data as PayFastIPN;
  } catch (error) {
    console.error('Error extracting PayFast IPN:', error);
    return null;
  }
}

/**
 * Security utility to sanitize PayFast data for logging
 */
export function sanitizePayFastData(data: PayFastIPN): Partial<PayFastIPN> {
  const { signature, merchant_id, ...sanitized } = data;
  return {
    ...sanitized,
    merchant_id: merchant_id.slice(0, 4) + '***', // Partially mask merchant ID
    signature: '[REDACTED]'
  };
}