import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/Textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  Calendar,
  ArrowRight,
  Eye
} from "lucide-react";

interface PayoutRequest {
  id: string;
  churchName: string;
  requestedAmount: string;
  availableAmount: string;
  fees: string;
  status: 'pending' | 'approved' | 'rejected' | 'processing' | 'completed';
  requestDate: string;
  processedDate?: string;
  details: string;
  bankDetails: {
    accountName: string;
    accountNumber: string;
    bank: string;
  };
  notes?: string;
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

  const processPayoutMutation = useMutation({
    mutationFn: async (data: { 
      payoutId: string; 
      action: 'approve' | 'reject'; 
      notes?: string;
    }) => {
      const response = await fetch(`/api/super-admin/payouts/${data.payoutId}/process`, {
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
    onSuccess: () => {
      toast({
        title: "Payout Processed",
        description: `Payout request has been ${processingAction}d successfully.`,
      });
      queryClient.invalidateQueries({ queryKey: ['/api/super-admin/payouts'] });
      onClose();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to process payout request. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleProcessPayout = (action: 'approve' | 'reject') => {
    if (!payout) return;
    setProcessingAction(action);
    processPayoutMutation.mutate({
      payoutId: payout.id,
      action,
      notes: adminNotes
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'approved':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'rejected':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'processing':
        return <AlertCircle className="h-4 w-4 text-blue-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-500/10 text-yellow-600 border-yellow-200';
      case 'approved':
        return 'bg-green-500/10 text-green-600 border-green-200';
      case 'rejected':
        return 'bg-red-500/10 text-red-600 border-red-200';
      case 'processing':
        return 'bg-blue-500/10 text-blue-600 border-blue-200';
      default:
        return 'bg-gray-500/10 text-gray-600 border-gray-200';
    }
  };

  if (!payout) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
        <DialogHeader className="pb-6">
          <DialogTitle className="flex items-center space-x-3 text-xl">
            <div className="p-2 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-lg">
              <Wallet className="h-5 w-5 text-white" />
            </div>
            <span className="bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
              Payout Request Details
            </span>
          </DialogTitle>
          <DialogDescription className="text-base text-gray-600 dark:text-gray-300">
            Review and process payout request from {payout.churchName}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Status and Amount Overview */}
          <Card className="border-0 bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 shadow-lg">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg flex items-center space-x-2">
                  <Building2 className="h-5 w-5 text-purple-600" />
                  <span>{payout.churchName}</span>
                </CardTitle>
                <Badge className={`${getStatusColor(payout.status)} flex items-center space-x-1 px-3 py-1`}>
                  {getStatusIcon(payout.status)}
                  <span className="capitalize font-medium">{payout.status}</span>
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                    <span className="text-sm font-medium text-green-700 dark:text-green-300">Requested Amount</span>
                    <span className="text-lg font-bold text-green-800 dark:text-green-200">R{payout.requestedAmount}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                    <span className="text-sm font-medium text-blue-700 dark:text-blue-300">Available Amount</span>
                    <span className="text-lg font-bold text-blue-800 dark:text-blue-200">R{payout.availableAmount}</span>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                    <span className="text-sm font-medium text-yellow-700 dark:text-yellow-300">ChurPay Fees</span>
                    <span className="text-lg font-bold text-yellow-800 dark:text-yellow-200">R{payout.fees}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
                    <span className="text-sm font-medium text-purple-700 dark:text-purple-300">Request Date</span>
                    <span className="text-sm font-bold text-purple-800 dark:text-purple-200">
                      {new Date(payout.requestDate).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Bank Details */}
          <Card className="border-0 bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 shadow-lg">
            <CardHeader>
              <CardTitle className="text-lg flex items-center space-x-2">
                <CreditCard className="h-5 w-5 text-indigo-600" />
                <span>Bank Details</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Account Name</Label>
                  <p className="text-base font-semibold text-gray-900 dark:text-white mt-1">{payout.bankDetails.accountName}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Bank</Label>
                  <p className="text-base font-semibold text-gray-900 dark:text-white mt-1">{payout.bankDetails.bank}</p>
                </div>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Account Number</Label>
                <p className="text-base font-semibold text-gray-900 dark:text-white mt-1">{payout.bankDetails.accountNumber}</p>
              </div>
            </CardContent>
          </Card>

          {/* Request Details */}
          <Card className="border-0 bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 shadow-lg">
            <CardHeader>
              <CardTitle className="text-lg flex items-center space-x-2">
                <Eye className="h-5 w-5 text-green-600" />
                <span>Request Details</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">{payout.details}</p>
            </CardContent>
          </Card>

          {/* Admin Actions */}
          {payout.status === 'pending' && (
            <Card className="border-0 bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 shadow-lg">
              <CardHeader>
                <CardTitle className="text-lg flex items-center space-x-2">
                  <Shield className="h-5 w-5 text-purple-600" />
                  <span>Admin Actions</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="adminNotes" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Processing Notes (Optional)
                  </Label>
                  <Textarea
                    id="adminNotes"
                    placeholder="Add any notes about this payout decision..."
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                    className="mt-2"
                    rows={3}
                  />
                </div>
                
                <div className="flex space-x-3 pt-4">
                  <Button
                    onClick={() => handleProcessPayout('approve')}
                    disabled={processPayoutMutation.isPending}
                    className="flex-1 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-medium py-2.5"
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    {processPayoutMutation.isPending && processingAction === 'approve' ? 'Approving...' : 'Approve Payout'}
                  </Button>
                  <Button
                    onClick={() => handleProcessPayout('reject')}
                    disabled={processPayoutMutation.isPending}
                    variant="outline"
                    className="flex-1 border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 font-medium py-2.5"
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    {processPayoutMutation.isPending && processingAction === 'reject' ? 'Rejecting...' : 'Reject Payout'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Processed Information */}
          {payout.status === 'approved' && payout.processedDate && (
            <Card className="border-0 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 shadow-lg border border-green-200 dark:border-green-800">
              <CardContent className="pt-6">
                <div className="flex items-center space-x-3">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                  <div>
                    <p className="text-green-800 dark:text-green-200 font-semibold">Payout Approved</p>
                    <p className="text-green-600 dark:text-green-300 text-sm">
                      Processed on {new Date(payout.processedDate).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}