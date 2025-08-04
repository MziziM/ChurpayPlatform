import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/Textarea";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { 
  Wallet, 
  Building2, 
  CreditCard,
  CheckCircle,
  XCircle,
  AlertCircle,
  Clock,
  Shield,
  DollarSign,
  Calendar
} from "lucide-react";

interface PayoutRequest {
  id: string;
  churchId: string;
  churchName: string;
  amount: string;
  requestDate: string;
  status: 'pending' | 'approved' | 'rejected' | 'processing' | 'completed';
  bankDetails: {
    bankName: string;
    accountNumber: string;
    branchCode: string;
    accountType: string;
  };
  notes?: string;
  churchDetails?: {
    email: string;
    phone: string;
    registrationNumber: string;
  };
}

interface SuperAdminPayoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  payout: PayoutRequest | null;
}

export function SuperAdminPayoutModal({
  isOpen,
  onClose,
  payout
}: SuperAdminPayoutModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [adminNotes, setAdminNotes] = useState("");
  const [processingAction, setProcessingAction] = useState<'approve' | 'reject' | null>(null);

  // PayFast payout processing mutation
  const processPayoutMutation = useMutation({
    mutationFn: async (data: { 
      payoutId: string; 
      action: 'approve' | 'reject'; 
      notes?: string;
      paymentMethod: 'payfast' | 'manual';
    }) => {
      const response = await fetch('/api/super-admin/payouts/process', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
      });
      
      if (!response.ok) {
        throw new Error('Failed to process payout');
      }
      
      return response.json();
    },
    onSuccess: (data, variables) => {
      toast({
        title: variables.action === 'approve' ? "Payout Approved" : "Payout Rejected",
        description: variables.action === 'approve' 
          ? "Payout has been approved and sent to PayFast for processing."
          : "Payout request has been rejected.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/super-admin/payouts'] });
      queryClient.invalidateQueries({ queryKey: ['/api/super-admin/stats'] });
      setAdminNotes("");
      setProcessingAction(null);
      onClose();
    },
    onError: (error: Error) => {
      toast({
        title: "Processing Failed",
        description: error.message || "Failed to process payout request.",
        variant: "destructive",
      });
      setProcessingAction(null);
    }
  });

  const handleProcessPayout = (action: 'approve' | 'reject') => {
    if (!payout) return;
    
    setProcessingAction(action);
    processPayoutMutation.mutate({
      payoutId: payout.id,
      action,
      notes: adminNotes,
      paymentMethod: 'payfast'
    });
  };

  if (!payout) return null;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-orange-100 text-orange-800';
      case 'approved': return 'bg-blue-100 text-blue-800';
      case 'processing': return 'bg-purple-100 text-purple-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return Clock;
      case 'approved': return CheckCircle;
      case 'processing': return Shield;
      case 'completed': return CheckCircle;
      case 'rejected': return XCircle;
      default: return AlertCircle;
    }
  };

  const StatusIcon = getStatusIcon(payout.status);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Wallet className="h-5 w-5 text-purple-600" />
            <span>Payout Request Review</span>
          </DialogTitle>
          <DialogDescription>
            Review and process church payout request via PayFast
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Status and Basic Info */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <Badge className={getStatusColor(payout.status)}>
                  <StatusIcon className="h-3 w-3 mr-1" />
                  {payout.status.toUpperCase()}
                </Badge>
                <span className="text-sm text-gray-500">
                  Request ID: {payout.id}
                </span>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-gray-900">R{payout.amount}</p>
                <p className="text-sm text-gray-500">
                  Requested {new Date(payout.requestDate).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>

          {/* Church Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Church Details</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div>
                  <Label className="text-sm font-medium text-gray-700">Church Name</Label>
                  <div className="flex items-center space-x-2 mt-1">
                    <Building2 className="h-4 w-4 text-gray-400" />
                    <span className="text-sm font-medium">{payout.churchName}</span>
                  </div>
                </div>
                
                {payout.churchDetails && (
                  <>
                    <div>
                      <Label className="text-sm font-medium text-gray-700">Contact Email</Label>
                      <p className="text-sm text-gray-900 mt-1">{payout.churchDetails.email}</p>
                    </div>
                    
                    <div>
                      <Label className="text-sm font-medium text-gray-700">Phone Number</Label>
                      <p className="text-sm text-gray-900 mt-1">{payout.churchDetails.phone}</p>
                    </div>
                  </>
                )}
              </div>
              
              <div className="space-y-3">
                {payout.churchDetails && (
                  <div>
                    <Label className="text-sm font-medium text-gray-700">NPO Registration</Label>
                    <p className="text-sm text-gray-900 mt-1">{payout.churchDetails.registrationNumber}</p>
                  </div>
                )}
                
                <div>
                  <Label className="text-sm font-medium text-gray-700">Church ID</Label>
                  <p className="text-sm font-mono text-gray-600 mt-1">{payout.churchId}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Banking Details */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Banking Information</h3>
            
            <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
              <div className="flex items-start space-x-3">
                <Shield className="h-5 w-5 text-blue-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-blue-900">PayFast Integration</h4>
                  <p className="text-sm text-blue-700 mt-1">
                    Payout will be processed securely through PayFast's banking network.
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium text-gray-700">Bank Name</Label>
                <div className="flex items-center space-x-2 mt-1">
                  <CreditCard className="h-4 w-4 text-gray-400" />
                  <span className="text-sm font-medium">{payout.bankDetails.bankName}</span>
                </div>
              </div>
              
              <div>
                <Label className="text-sm font-medium text-gray-700">Account Type</Label>
                <p className="text-sm text-gray-900 mt-1">{payout.bankDetails.accountType}</p>
              </div>
              
              <div>
                <Label className="text-sm font-medium text-gray-700">Account Number</Label>
                <p className="text-sm font-mono text-gray-900 mt-1">
                  {payout.bankDetails.accountNumber.replace(/(.{4})/g, '$1 ')}
                </p>
              </div>
              
              <div>
                <Label className="text-sm font-medium text-gray-700">Branch Code</Label>
                <p className="text-sm font-mono text-gray-900 mt-1">{payout.bankDetails.branchCode}</p>
              </div>
            </div>
          </div>

          {/* Payout Calculation */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Payout Breakdown</h3>
            
            <div className="bg-gray-50 rounded-lg p-4 space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Requested Amount</span>
                <span className="font-medium">R{payout.amount}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">PayFast Processing Fee</span>
                <span className="font-medium text-red-600">-R15.00</span>
              </div>
              <div className="border-t pt-3 flex justify-between items-center">
                <span className="font-semibold">Net Payout Amount</span>
                <span className="font-bold text-lg">
                  R{(parseFloat(payout.amount.replace(/,/g, '')) - 15).toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          {/* Request Notes */}
          {payout.notes && (
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700">Church Request Notes</Label>
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-sm text-gray-900">{payout.notes}</p>
              </div>
            </div>
          )}

          {/* Admin Notes */}
          {payout.status === 'pending' && (
            <div className="space-y-2">
              <Label htmlFor="adminNotes" className="text-sm font-medium text-gray-700">
                Admin Notes (Optional)
              </Label>
              <Textarea
                id="adminNotes"
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                placeholder="Add notes about this payout decision..."
                rows={3}
              />
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex space-x-3 pt-4 border-t">
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1"
              disabled={processPayoutMutation.isPending}
            >
              Close
            </Button>
            
            {payout.status === 'pending' && (
              <>
                <Button
                  variant="destructive"
                  onClick={() => handleProcessPayout('reject')}
                  className="flex-1"
                  disabled={processPayoutMutation.isPending}
                >
                  {processingAction === 'reject' && processPayoutMutation.isPending ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Rejecting...
                    </>
                  ) : (
                    <>
                      <XCircle className="h-4 w-4 mr-2" />
                      Reject Payout
                    </>
                  )}
                </Button>
                
                <Button
                  onClick={() => handleProcessPayout('approve')}
                  className="flex-1 bg-green-600 hover:bg-green-700"
                  disabled={processPayoutMutation.isPending}
                >
                  {processingAction === 'approve' && processPayoutMutation.isPending ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Processing via PayFast...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Approve & Pay via PayFast
                    </>
                  )}
                </Button>
              </>
            )}
          </div>

          {/* PayFast Info */}
          <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
            <div className="flex items-start space-x-3">
              <Shield className="h-5 w-5 text-purple-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-purple-900">Secure PayFast Processing</h4>
                <p className="text-sm text-purple-700 mt-1">
                  All payouts are processed through PayFast's secure banking network with full compliance 
                  to South African financial regulations. Processing typically takes 1-3 business days.
                </p>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}