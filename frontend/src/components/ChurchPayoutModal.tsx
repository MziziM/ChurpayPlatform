import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useQuery } from "@tanstack/react-query";
import { 
  Wallet, 
  Building, 
  CreditCard,
  AlertCircle,
  CheckCircle,
  ArrowRight,
  Banknote,
  Clock
} from "lucide-react";

interface ChurchPayoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  availableBalance: string;
  pendingPayouts: string;
}

interface ChurchProfile {
  bankName: string;
  accountNumber: string;
  branchCode: string;
  accountHolder: string;
  accountType: string;
}

export function ChurchPayoutModal({
  isOpen,
  onClose,
  availableBalance,
  pendingPayouts
}: ChurchPayoutModalProps) {
  const [amount, setAmount] = useState("");
  const [bankAccount, setBankAccount] = useState("");
  const [reason, setReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch church profile to get real banking details
  const { data: churchProfile, isLoading: isLoadingProfile } = useQuery<ChurchProfile>({
    queryKey: ['/api/church/profile'],
    enabled: isOpen
  });

  const handleSubmit = async () => {
    setIsSubmitting(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsSubmitting(false);
    onClose();
  };

  const balance = parseFloat(availableBalance.replace(/,/g, '') || '0');
  const pending = parseFloat(pendingPayouts.replace(/,/g, '') || '0');

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Banknote className="h-5 w-5 text-green-600" />
            <span>Request Payout</span>
          </DialogTitle>
          <DialogDescription>
            Request funds to be transferred to your church bank account
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Balance Overview */}
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-4 border border-green-200">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-green-900">Available Balance</h3>
              <Wallet className="h-5 w-5 text-green-600" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-2xl font-bold text-green-900">R{availableBalance}</p>
                <p className="text-sm text-green-600">Ready for payout</p>
              </div>
              <div>
                <p className="text-lg font-semibold text-orange-700">R{pendingPayouts}</p>
                <p className="text-sm text-orange-600">Pending review</p>
              </div>
            </div>
          </div>

          {/* Bank Details Section */}
          {isLoadingProfile ? (
            <div className="bg-gray-50 rounded-lg p-4 border">
              <div className="flex items-center space-x-2 mb-3">
                <CreditCard className="h-5 w-5 text-gray-600" />
                <h4 className="font-medium text-gray-900">Loading Bank Details...</h4>
              </div>
              <div className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/3"></div>
              </div>
            </div>
          ) : churchProfile ? (
            <div className="bg-gray-50 rounded-lg p-4 border">
              <div className="flex items-center space-x-2 mb-3">
                <CreditCard className="h-5 w-5 text-gray-600" />
                <h4 className="font-medium text-gray-900">Payout Destination</h4>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Bank:</span>
                  <span className="ml-2 font-medium">{churchProfile.bankName}</span>
                </div>
                <div>
                  <span className="text-gray-600">Account Type:</span>
                  <span className="ml-2 font-medium">{churchProfile.accountType}</span>
                </div>
                <div>
                  <span className="text-gray-600">Account:</span>
                  <span className="ml-2 font-medium">***{churchProfile.accountNumber.slice(-4)}</span>
                </div>
                <div>
                  <span className="text-gray-600">Branch:</span>
                  <span className="ml-2 font-medium">{churchProfile.branchCode}</span>
                </div>
                <div className="col-span-2">
                  <span className="text-gray-600">Account Holder:</span>
                  <span className="ml-2 font-medium">{churchProfile.accountHolder}</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-red-50 rounded-lg p-4 border border-red-200">
              <div className="flex items-center space-x-2 mb-3">
                <AlertCircle className="h-5 w-5 text-red-600" />
                <h4 className="font-medium text-red-900">Banking Details Required</h4>
              </div>
              <p className="text-sm text-red-700">
                Please complete your church profile with banking details before requesting payouts.
              </p>
            </div>
          )}

          {/* Payout Form */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="amount">Payout Amount</Label>
              <div className="relative mt-1">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">R</span>
                <Input
                  id="amount"
                  type="number"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="pl-8"
                  max={balance}
                />
              </div>
              {parseFloat(amount) > balance && (
                <p className="text-sm text-red-600 mt-1 flex items-center">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  Amount exceeds available balance
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="reason">Reason for Payout</Label>
              <Textarea
                id="reason"
                placeholder="Brief description of how funds will be used..."
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="mt-1"
                rows={3}
              />
            </div>
          </div>

          {/* Processing Info */}
          <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
            <div className="flex items-start space-x-3">
              <Clock className="h-5 w-5 text-blue-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-blue-900">Processing Timeline</h4>
                <p className="text-sm text-blue-700 mt-1">
                  Payout requests are reviewed within 1-2 business days. Approved funds are 
                  transferred within 3-5 business days.
                </p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex space-x-3">
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1"
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              className="flex-1 bg-green-600 hover:bg-green-700"
              disabled={isSubmitting || !amount || !churchProfile || parseFloat(amount) > balance}
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Processing...
                </>
              ) : (
                <>
                  Request Payout
                  <ArrowRight className="h-4 w-4 ml-2" />
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}