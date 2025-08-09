import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Copy, Download, Shield, Smartphone, Key } from 'lucide-react';

interface TwoFactorSetupProps {
  qrCodeUrl: string;
  manualEntryKey: string;
  backupCodes: string[];
  onVerify: (code: string) => Promise<boolean>;
  onComplete: () => void;
}

export function TwoFactorSetup({ 
  qrCodeUrl, 
  manualEntryKey, 
  backupCodes, 
  onVerify, 
  onComplete 
}: TwoFactorSetupProps) {
  const [step, setStep] = useState<'setup' | 'verify' | 'backup'>('setup');
  const [verificationCode, setVerificationCode] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const { toast } = useToast();

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied to clipboard",
      description: "The code has been copied to your clipboard.",
    });
  };

  const downloadBackupCodes = () => {
    const content = `ChurPay Admin - Backup Codes\nGenerated: ${new Date().toLocaleString()}\n\nKeep these codes secure. Each can only be used once.\n\n${backupCodes.join('\n')}`;
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'churpay-backup-codes.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast({
      title: "Backup codes downloaded",
      description: "Store these codes in a secure location.",
    });
  };

  const handleVerifyCode = async () => {
    if (!verificationCode || verificationCode.length !== 6) {
      toast({
        title: "Invalid code",
        description: "Please enter a 6-digit code from your authenticator app.",
        variant: "destructive",
      });
      return;
    }

    setIsVerifying(true);
    try {
      const isValid = await onVerify(verificationCode);
      if (isValid) {
        setStep('backup');
      } else {
        toast({
          title: "Invalid code",
          description: "The verification code is incorrect. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Verification failed",
        description: "An error occurred during verification. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsVerifying(false);
    }
  };

  if (step === 'setup') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-2xl mx-auto"
      >
        <Card>
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <Shield className="h-12 w-12 text-purple-600" />
            </div>
            <CardTitle className="text-2xl">Set up Two-Factor Authentication</CardTitle>
            <p className="text-gray-600">
              Secure your admin account with Google Authenticator
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              {/* QR Code Section */}
              <div className="text-center">
                <h3 className="font-semibold mb-4 flex items-center justify-center">
                  <Smartphone className="h-5 w-5 mr-2" />
                  Scan QR Code
                </h3>
                <div className="bg-white p-4 rounded-lg border inline-block">
                  <img 
                    src={qrCodeUrl} 
                    alt="2FA QR Code" 
                    className="w-48 h-48"
                  />
                </div>
                <p className="text-sm text-gray-600 mt-2">
                  Use Google Authenticator app to scan this code
                </p>
              </div>

              {/* Manual Entry Section */}
              <div>
                <h3 className="font-semibold mb-4 flex items-center">
                  <Key className="h-5 w-5 mr-2" />
                  Manual Entry
                </h3>
                <p className="text-sm text-gray-600 mb-3">
                  If you can't scan the QR code, enter this key manually:
                </p>
                <div className="bg-gray-50 p-3 rounded border">
                  <code className="text-sm break-all">{manualEntryKey}</code>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => copyToClipboard(manualEntryKey)}
                  className="mt-2 w-full"
                >
                  <Copy className="h-4 w-4 mr-2" />
                  Copy Key
                </Button>
              </div>
            </div>

            <div className="border-t pt-6">
              <h4 className="font-medium mb-3">Instructions:</h4>
              <ol className="text-sm text-gray-600 space-y-2">
                <li>1. Download Google Authenticator from your app store</li>
                <li>2. Open the app and tap "+" to add a new account</li>
                <li>3. Choose "Scan QR Code" or "Enter key manually"</li>
                <li>4. Your ChurPay admin account will be added to the app</li>
              </ol>
            </div>

            <Button 
              onClick={() => setStep('verify')} 
              className="w-full"
              size="lg"
            >
              Continue to Verification
            </Button>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  if (step === 'verify') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md mx-auto"
      >
        <Card>
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <Smartphone className="h-12 w-12 text-purple-600" />
            </div>
            <CardTitle>Verify Your Setup</CardTitle>
            <p className="text-gray-600">
              Enter the 6-digit code from your authenticator app
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <Label htmlFor="verificationCode">Verification Code</Label>
              <Input
                id="verificationCode"
                type="text"
                placeholder="000000"
                maxLength={6}
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ''))}
                className="text-center text-lg tracking-wider"
              />
            </div>

            <div className="space-y-3">
              <Button 
                onClick={handleVerifyCode}
                disabled={isVerifying || verificationCode.length !== 6}
                className="w-full"
                size="lg"
              >
                {isVerifying ? "Verifying..." : "Verify & Enable 2FA"}
              </Button>
              
              <Button 
                variant="outline" 
                onClick={() => setStep('setup')}
                className="w-full"
              >
                Back to Setup
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-lg mx-auto"
    >
      <Card>
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <Shield className="h-12 w-12 text-green-600" />
          </div>
          <CardTitle className="text-green-600">2FA Enabled Successfully!</CardTitle>
          <p className="text-gray-600">
            Save your backup codes for account recovery
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <h4 className="font-semibold text-yellow-800 mb-2">⚠️ Important: Save Your Backup Codes</h4>
            <p className="text-sm text-yellow-700">
              These codes can be used if you lose access to your authenticator app. 
              Each code can only be used once.
            </p>
          </div>

          <div className="bg-gray-50 p-4 rounded border">
            <h4 className="font-medium mb-3">Backup Codes:</h4>
            <div className="grid grid-cols-2 gap-2 text-sm font-mono">
              {backupCodes.map((code, index) => (
                <div key={index} className="bg-white p-2 rounded border text-center">
                  {code}
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <Button
              onClick={downloadBackupCodes}
              variant="outline"
              className="w-full"
            >
              <Download className="h-4 w-4 mr-2" />
              Download Backup Codes
            </Button>

            <Button
              onClick={onComplete}
              className="w-full"
              size="lg"
            >
              Complete Setup
            </Button>
          </div>

          <p className="text-xs text-gray-500 text-center">
            Store your backup codes in a secure location like a password manager
          </p>
        </CardContent>
      </Card>
    </motion.div>
  );
}