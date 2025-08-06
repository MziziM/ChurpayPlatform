import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { 
  DollarSign, 
  Building2, 
  Clock, 
  CheckCircle, 
  AlertTriangle,
  XCircle,
  FileText,
  CreditCard,
  Calendar,
  TrendingUp,
  Banknote,
  User,
  Shield,
  AlertCircle
} from 'lucide-react';

interface PayoutRequest {
  id: string;
  churchId: string;
  churchName: string;
  requestedBy: string;
  requesterName: string;
  amount: string;
  processingFee: string;
  netAmount: string;
  requestType: 'standard' | 'express' | 'emergency';
  description?: string;
  urgencyReason?: string;
  status: 'pending' | 'approved' | 'rejected' | 'processing' | 'completed';
  requestedDate: string;
  createdAt: string;
  bankDetails: {
    bankName: string;
    accountNumber: string;
    branchCode: string;
    accountHolder: string;
  };
}

interface SuperAdminPayoutModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  payoutRequest: PayoutRequest | null;
}

export function SuperAdminPayoutModal({ open, onOpenChange, payoutRequest }: SuperAdminPayoutModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [actionType, setActionType] = useState<'approve' | 'reject' | 'complete'>('approve');
  const [rejectionReason, setRejectionReason] = useState('');
  const [processingNotes, setProcessingNotes] = useState('');
  const [paymentReference, setPaymentReference] = useState('');
  const [usePayFast, setUsePayFast] = useState(true);

  const payoutActionMutation = useMutation({
    mutationFn: async (data: any) => {
      const endpoint = `/api/super-admin/payouts/${payoutRequest?.id}/${actionType}`;
      const requestData = actionType === 'complete' ? { ...data, usePayFast } : data;
      return await apiRequest('POST', endpoint, requestData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/super-admin/payouts'] });
      queryClient.invalidateQueries({ queryKey: ['/api/super-admin/stats'] });
      toast({
        title: "Payout Updated",
        description: `Payout request has been ${actionType}d successfully.`,
        variant: "default",
      });
      onOpenChange(false);
      resetForm();
    },
    onError: (error: any) => {
      toast({
        title: "Action Failed",
        description: error.message || `Failed to ${actionType} payout request.`,
        variant: "destructive",
      });
    }
  });

  const resetForm = () => {
    setActionType('approve');
    setRejectionReason('');
    setProcessingNotes('');
    setPaymentReference('');
  };

  const handleAction = () => {
    const data: any = {
      processingNotes
    };

    if (actionType === 'reject') {
      if (!rejectionReason.trim()) {
        toast({
          title: "Rejection Reason Required",
          description: "Please provide a reason for rejecting this payout request.",
          variant: "destructive",
        });
        return;
      }
      data.rejectionReason = rejectionReason;
    }

    if (actionType === 'complete') {
      if (!usePayFast && !paymentReference.trim()) {
        toast({
          title: "Payment Reference Required",
          description: "Please provide the payment reference for manual completion.",
          variant: "destructive",
        });
        return;
      }
      data.paymentReference = paymentReference;
      data.usePayFast = usePayFast;
    }

    payoutActionMutation.mutate(data);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800 border-green-200';
      case 'approved': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'processing': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'pending': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'rejected': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-4 w-4" />;
      case 'approved': return <Shield className="h-4 w-4" />;
      case 'processing': return <Clock className="h-4 w-4 animate-spin" />;
      case 'pending': return <Clock className="h-4 w-4" />;
      case 'rejected': return <XCircle className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  const getRequestTypeColor = (type: string) => {
    switch (type) {
      case 'emergency': return 'bg-red-100 text-red-800 border-red-200';
      case 'express': return 'bg-orange-100 text-orange-800 border-orange-200';
      default: return 'bg-blue-100 text-blue-800 border-blue-200';
    }
  };

  const getProcessingTime = (type: string) => {
    switch (type) {
      case 'emergency': return 'Same day processing required';
      case 'express': return '1-2 business days';
      default: return '3-5 business days';
    }
  };

  if (!payoutRequest) return null;

  const canApprove = payoutRequest.status === 'pending';
  const canReject = payoutRequest.status === 'pending' || payoutRequest.status === 'approved';
  const canComplete = payoutRequest.status === 'approved' || payoutRequest.status === 'processing';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center">
              <Shield className="h-5 w-5 text-white" />
            </div>
            <div>
              <span className="text-xl font-bold text-gray-900">Process Payout Request</span>
              <p className="text-sm text-gray-600 mt-1">Super Admin - Church Payout Management</p>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Request Overview */}
          <div className="bg-gradient-to-r from-purple-50 to-blue-50 p-6 rounded-lg border">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <Building2 className="h-6 w-6 text-purple-600" />
                <div>
                  <h3 className="font-semibold text-gray-900">{payoutRequest.churchName}</h3>
                  <p className="text-sm text-gray-600">Payout Request #{payoutRequest.id.slice(0, 8)}</p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-purple-600">
                  R{parseFloat(payoutRequest.amount).toLocaleString('en-ZA', { minimumFractionDigits: 2 })}
                </div>
                <Badge className={`${getStatusColor(payoutRequest.status)} border mt-1`}>
                  {getStatusIcon(payoutRequest.status)}
                  <span className="ml-1 capitalize">{payoutRequest.status}</span>
                </Badge>
              </div>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Requested:</span>
                <div className="font-medium">{new Date(payoutRequest.requestedDate).toLocaleDateString()}</div>
              </div>
              <div>
                <span className="text-gray-600">Type:</span>
                <Badge className={`${getRequestTypeColor(payoutRequest.requestType)} text-xs`}>
                  {payoutRequest.requestType}
                </Badge>
              </div>
              <div>
                <span className="text-gray-600">Requester:</span>
                <div className="font-medium">{payoutRequest.requesterName}</div>
              </div>
              <div>
                <span className="text-gray-600">Created:</span>
                <div className="font-medium">{new Date(payoutRequest.createdAt).toLocaleDateString()}</div>
              </div>
            </div>
          </div>

          {/* Financial Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-3">Financial Breakdown</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Requested Amount:</span>
                  <span className="font-medium">R{parseFloat(payoutRequest.amount).toLocaleString('en-ZA', { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Processing Fee:</span>
                  <span className="font-medium text-red-600">-R{parseFloat(payoutRequest.processingFee).toLocaleString('en-ZA', { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="border-t pt-2 flex justify-between font-semibold">
                  <span className="text-gray-900">Net Payout:</span>
                  <span className="text-green-600">R{parseFloat(payoutRequest.netAmount).toLocaleString('en-ZA', { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="flex items-center text-blue-600 text-xs mt-2">
                  <Clock className="h-3 w-3 mr-1" />
                  {getProcessingTime(payoutRequest.requestType)}
                </div>
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-3">Bank Details</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Bank:</span>
                  <span className="font-medium">{payoutRequest.bankDetails.bankName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Account:</span>
                  <span className="font-medium">***{payoutRequest.bankDetails.accountNumber.slice(-4)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Branch:</span>
                  <span className="font-medium">{payoutRequest.bankDetails.branchCode}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Holder:</span>
                  <span className="font-medium">{payoutRequest.bankDetails.accountHolder}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Request Details */}
          {(payoutRequest.description || payoutRequest.urgencyReason) && (
            <div className="space-y-4">
              <h4 className="font-medium text-gray-900">Request Details</h4>
              {payoutRequest.description && (
                <div className="bg-blue-50 p-4 rounded-lg">
                  <span className="text-sm font-medium text-blue-800">Description:</span>
                  <p className="text-blue-700 mt-1">{payoutRequest.description}</p>
                </div>
              )}
              {payoutRequest.urgencyReason && (
                <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                  <div className="flex items-center mb-2">
                    <AlertTriangle className="h-4 w-4 text-red-600 mr-2" />
                    <span className="text-sm font-medium text-red-800">Emergency Reason:</span>
                  </div>
                  <p className="text-red-700">{payoutRequest.urgencyReason}</p>
                </div>
              )}
            </div>
          )}

          {/* Action Selection */}
          <div className="space-y-4">
            <h4 className="font-medium text-gray-900">Process Request</h4>
            
            {/* Action Type Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Action</label>
              <Select value={actionType} onValueChange={(value) => setActionType(value as any)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {canApprove && (
                    <SelectItem value="approve">
                      <div className="flex items-center">
                        <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                        <span>Approve Request</span>
                      </div>
                    </SelectItem>
                  )}
                  {canComplete && (
                    <SelectItem value="complete">
                      <div className="flex items-center">
                        <Shield className="h-4 w-4 text-blue-600 mr-2" />
                        <span>Mark as Completed</span>
                      </div>
                    </SelectItem>
                  )}
                  {canReject && (
                    <SelectItem value="reject">
                      <div className="flex items-center">
                        <XCircle className="h-4 w-4 text-red-600 mr-2" />
                        <span>Reject Request</span>
                      </div>
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>

            {/* Conditional Fields */}
            {actionType === 'reject' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Rejection Reason *</label>
                <Textarea
                  placeholder="Please provide a clear reason for rejecting this payout request..."
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  rows={3}
                  className="border-red-300 focus:border-red-500 focus:ring-red-500"
                />
              </div>
            )}

            {actionType === 'complete' && (
              <div className="space-y-4">
                {/* PayFast Integration Toggle */}
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <CreditCard className="h-5 w-5 text-blue-600 mr-2" />
                      <div>
                        <h5 className="font-medium text-blue-900">PayFast Automatic Transfer</h5>
                        <p className="text-sm text-blue-700">Automatically transfer funds to church bank account</p>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="usePayFast"
                        checked={usePayFast}
                        onChange={(e) => setUsePayFast(e.target.checked)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <label htmlFor="usePayFast" className="ml-2 text-sm text-blue-900">
                        {usePayFast ? 'Enabled' : 'Disabled'}
                      </label>
                    </div>
                  </div>
                  
                  {usePayFast && (
                    <div className="mt-3 text-sm text-blue-800 bg-blue-100 p-3 rounded-md">
                      <div className="flex items-center">
                        <Shield className="h-4 w-4 mr-2" />
                        <span className="font-medium">Automatic Processing:</span>
                      </div>
                      <ul className="mt-2 ml-6 space-y-1 text-blue-700">
                        <li>• Instant transfer to church bank account</li>
                        <li>• PayFast reference automatically generated</li>
                        <li>• Full transaction audit trail maintained</li>
                      </ul>
                    </div>
                  )}
                </div>

                {/* Payment Reference Field */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Payment Reference {!usePayFast && '*'}
                  </label>
                  <Input
                    placeholder={usePayFast ? "Auto-generated by PayFast..." : "Enter bank transfer reference or transaction ID..."}
                    value={paymentReference}
                    onChange={(e) => setPaymentReference(e.target.value)}
                    disabled={usePayFast}
                    className={usePayFast ? 
                      "bg-gray-100 text-gray-500" : 
                      "border-green-300 focus:border-green-500 focus:ring-green-500"
                    }
                  />
                  {usePayFast && (
                    <p className="text-xs text-gray-500 mt-1">
                      Reference will be automatically provided by PayFast after successful transfer
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Processing Notes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Processing Notes (Optional)</label>
              <Textarea
                placeholder="Add any internal notes about this payout processing..."
                value={processingNotes}
                onChange={(e) => setProcessingNotes(e.target.value)}
                rows={2}
              />
            </div>
          </div>

          {/* Warning for Emergency Requests */}
          {payoutRequest.requestType === 'emergency' && (
            <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
              <div className="flex items-center">
                <AlertCircle className="h-5 w-5 text-yellow-600 mr-2" />
                <div>
                  <h5 className="font-medium text-yellow-800">Emergency Request</h5>
                  <p className="text-sm text-yellow-700 mt-1">
                    This is an emergency payout request requiring same-day processing. Please verify the urgency reason and process accordingly.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3 pt-4 border-t">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={payoutActionMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              onClick={handleAction}
              disabled={payoutActionMutation.isPending}
              className={
                actionType === 'approve' ? 'bg-green-600 hover:bg-green-700' :
                actionType === 'complete' ? 'bg-blue-600 hover:bg-blue-700' :
                'bg-red-600 hover:bg-red-700'
              }
            >
              {payoutActionMutation.isPending ? (
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Processing...</span>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  {actionType === 'approve' && <CheckCircle className="h-4 w-4" />}
                  {actionType === 'complete' && <Shield className="h-4 w-4" />}
                  {actionType === 'reject' && <XCircle className="h-4 w-4" />}
                  <span className="capitalize">{actionType} Request</span>
                </div>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}