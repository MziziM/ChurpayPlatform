import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Badge } from "./ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Textarea } from "./ui/textarea";
import { Separator } from "./ui/separator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "./ui/alert-dialog";
import { 
  Banknote,
  Building2,
  CreditCard,
  Shield,
  AlertTriangle,
  CheckCircle,
  Clock,
  DollarSign
} from "lucide-react";

interface PayoutRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  availableBalance: number;
}

export function PayoutRequestModal({ isOpen, onClose, availableBalance }: PayoutRequestModalProps) {
  const [step, setStep] = useState(1);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    amount: "",
    bankName: "",
    accountType: "",
    accountNumber: "",
    accountHolder: "",
    branchCode: "",
    reference: "",
    notes: ""
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const southAfricanBanks = [
    "ABSA Bank",
    "Standard Bank",
    "FirstNational Bank (FNB)",
    "Nedbank",
    "Capitec Bank",
    "African Bank",
    "Investec",
    "Discovery Bank",
    "Bidvest Bank",
    "Other"
  ];

  const validateStep1 = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      newErrors.amount = "Please enter a valid amount";
    } else if (parseFloat(formData.amount) > availableBalance) {
      newErrors.amount = "Amount exceeds available balance";
    } else if (parseFloat(formData.amount) < 100) {
      newErrors.amount = "Minimum payout amount is R 100";
    }

    if (!formData.reference.trim()) {
      newErrors.reference = "Reference is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.bankName) {
      newErrors.bankName = "Please select a bank";
    }
    
    if (!formData.accountType) {
      newErrors.accountType = "Please select account type";
    }
    
    if (!formData.accountNumber || formData.accountNumber.length < 8) {
      newErrors.accountNumber = "Please enter a valid account number";
    }
    
    if (!formData.accountHolder.trim()) {
      newErrors.accountHolder = "Account holder name is required";
    }
    
    if (!formData.branchCode || formData.branchCode.length !== 6) {
      newErrors.branchCode = "Branch code must be 6 digits";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (step === 1 && validateStep1()) {
      setStep(2);
    } else if (step === 2 && validateStep2()) {
      setShowConfirmation(true);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setIsSubmitting(false);
    setShowConfirmation(false);
    onClose();
    
    // Reset form
    setFormData({
      amount: "",
      bankName: "",
      accountType: "",
      accountNumber: "",
      accountHolder: "",
      branchCode: "",
      reference: "",
      notes: ""
    });
    setStep(1);
    setErrors({});
  };

  const handleClose = () => {
    onClose();
    setStep(1);
    setErrors({});
  };

  const processingFee = parseFloat(formData.amount) * 0.015; // 1.5% processing fee
  const netAmount = parseFloat(formData.amount) - processingFee;

  return (
    <>
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <Banknote className="h-5 w-5 text-primary" />
              <span>Request Payout</span>
            </DialogTitle>
            <DialogDescription>
              Withdraw funds from your church account to your bank
            </DialogDescription>
          </DialogHeader>

          {/* Progress Indicator */}
          <div className="flex items-center space-x-2 mb-6">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${
              step >= 1 ? 'bg-primary text-white' : 'bg-gray-200 text-gray-600'
            }`}>
              1
            </div>
            <div className={`flex-1 h-1 ${step >= 2 ? 'bg-primary' : 'bg-gray-200'}`} />
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${
              step >= 2 ? 'bg-primary text-white' : 'bg-gray-200 text-gray-600'
            }`}>
              2
            </div>
          </div>

          {step === 1 && (
            <div className="space-y-4">
              {/* Available Balance */}
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-green-800">Available Balance</span>
                  <span className="font-semibold text-green-900">
                    R {availableBalance.toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Amount Input */}
              <div className="space-y-2">
                <Label htmlFor="amount">Payout Amount *</Label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="amount"
                    type="number"
                    placeholder="0.00"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    className="pl-10"
                  />
                </div>
                {errors.amount && (
                  <p className="text-sm text-red-600">{errors.amount}</p>
                )}
              </div>

              {/* Fee Breakdown */}
              {formData.amount && parseFloat(formData.amount) > 0 && (
                <div className="bg-gray-50 border rounded-lg p-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Requested Amount</span>
                    <span>R {parseFloat(formData.amount).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Processing Fee (1.5%)</span>
                    <span>-R {processingFee.toFixed(2)}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between font-semibold">
                    <span>Net Amount</span>
                    <span className="text-green-600">R {netAmount.toFixed(2)}</span>
                  </div>
                </div>
              )}

              {/* Reference */}
              <div className="space-y-2">
                <Label htmlFor="reference">Reference *</Label>
                <Input
                  id="reference"
                  placeholder="e.g., Weekly Offerings Jan 2025"
                  value={formData.reference}
                  onChange={(e) => setFormData({ ...formData, reference: e.target.value })}
                />
                {errors.reference && (
                  <p className="text-sm text-red-600">{errors.reference}</p>
                )}
              </div>

              {/* Notes */}
              <div className="space-y-2">
                <Label htmlFor="notes">Additional Notes (Optional)</Label>
                <Textarea
                  id="notes"
                  placeholder="Any additional information..."
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows={3}
                />
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <Shield className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-blue-900">Secure Banking</p>
                    <p className="text-xs text-blue-700">Your banking details are encrypted and secure</p>
                  </div>
                </div>
              </div>

              {/* Bank Selection */}
              <div className="space-y-2">
                <Label>Bank Name *</Label>
                <Select value={formData.bankName} onValueChange={(value) => setFormData({ ...formData, bankName: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select your bank" />
                  </SelectTrigger>
                  <SelectContent>
                    {southAfricanBanks.map((bank) => (
                      <SelectItem key={bank} value={bank}>
                        <div className="flex items-center space-x-2">
                          <Building2 className="h-4 w-4 text-gray-600" />
                          <span>{bank}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.bankName && (
                  <p className="text-sm text-red-600">{errors.bankName}</p>
                )}
              </div>

              {/* Account Type */}
              <div className="space-y-2">
                <Label>Account Type *</Label>
                <Select value={formData.accountType} onValueChange={(value) => setFormData({ ...formData, accountType: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select account type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cheque">Cheque Account</SelectItem>
                    <SelectItem value="savings">Savings Account</SelectItem>
                    <SelectItem value="business">Business Account</SelectItem>
                  </SelectContent>
                </Select>
                {errors.accountType && (
                  <p className="text-sm text-red-600">{errors.accountType}</p>
                )}
              </div>

              {/* Account Holder */}
              <div className="space-y-2">
                <Label htmlFor="accountHolder">Account Holder Name *</Label>
                <Input
                  id="accountHolder"
                  placeholder="Exact name as on bank account"
                  value={formData.accountHolder}
                  onChange={(e) => setFormData({ ...formData, accountHolder: e.target.value })}
                />
                {errors.accountHolder && (
                  <p className="text-sm text-red-600">{errors.accountHolder}</p>
                )}
              </div>

              {/* Account Number */}
              <div className="space-y-2">
                <Label htmlFor="accountNumber">Account Number *</Label>
                <div className="relative">
                  <CreditCard className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="accountNumber"
                    placeholder="Account number"
                    value={formData.accountNumber}
                    onChange={(e) => setFormData({ ...formData, accountNumber: e.target.value.replace(/\D/g, '') })}
                    className="pl-10"
                  />
                </div>
                {errors.accountNumber && (
                  <p className="text-sm text-red-600">{errors.accountNumber}</p>
                )}
              </div>

              {/* Branch Code */}
              <div className="space-y-2">
                <Label htmlFor="branchCode">Branch Code *</Label>
                <Input
                  id="branchCode"
                  placeholder="6-digit branch code"
                  value={formData.branchCode}
                  onChange={(e) => setFormData({ ...formData, branchCode: e.target.value.replace(/\D/g, '').slice(0, 6) })}
                  maxLength={6}
                />
                {errors.branchCode && (
                  <p className="text-sm text-red-600">{errors.branchCode}</p>
                )}
              </div>
            </div>
          )}

          <DialogFooter className="flex justify-between">
            <div className="flex space-x-2">
              {step === 2 && (
                <Button variant="outline" onClick={() => setStep(1)}>
                  Back
                </Button>
              )}
              <Button variant="outline" onClick={handleClose}>
                Cancel
              </Button>
            </div>
            <Button onClick={handleNext}>
              {step === 1 ? "Next" : "Review & Submit"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirmation Dialog */}
      <AlertDialog open={showConfirmation} onOpenChange={setShowConfirmation}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <span>Confirm Payout Request</span>
            </AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-4">
                <p>Please review your payout request details:</p>
                
                <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                  <div className="flex justify-between">
                    <span>Amount:</span>
                    <span className="font-semibold">R {parseFloat(formData.amount).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Processing Fee:</span>
                    <span className="text-red-600">-R {processingFee.toFixed(2)}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between">
                    <span>Net Amount:</span>
                    <span className="font-semibold text-green-600">R {netAmount.toFixed(2)}</span>
                  </div>
                  <Separator />
                  <div className="space-y-1">
                    <div className="flex justify-between">
                      <span>Bank:</span>
                      <span>{formData.bankName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Account:</span>
                      <span>****{formData.accountNumber.slice(-4)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Account Holder:</span>
                      <span>{formData.accountHolder}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                  <div className="flex items-start space-x-2">
                    <Clock className="h-4 w-4 text-yellow-600 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-yellow-800">Processing Time</p>
                      <p className="text-xs text-yellow-700">
                        Payouts typically take 1-3 business days to reflect in your account.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="bg-primary hover:bg-primary/90"
            >
              {isSubmitting ? "Processing..." : "Confirm Payout"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}