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
  FileText,
  CreditCard,
  Calendar,
  TrendingUp,
  Banknote
} from 'lucide-react';

interface PayoutRequestModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  churchData: {
    id: string;
    name: string;
    availableBalance: string;
    pendingPayouts: number;
    lastPayoutDate?: string;
    bankDetails: {
      bankName: string;
      accountNumber: string;
      branchCode: string;
      accountHolder: string;
    };
  };
}

interface PayoutRequest {
  amount: string;
  requestType: 'standard' | 'express' | 'emergency';
  description?: string;
  requestedDate: string;
  urgencyReason?: string;
}

export function PayoutRequestModal({ open, onOpenChange, churchData }: PayoutRequestModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [formData, setFormData] = useState<PayoutRequest>({
    amount: '',
    requestType: 'standard',
    description: '',
    requestedDate: new Date().toISOString().split('T')[0],
    urgencyReason: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Calculate processing fees based on request type
  const getProcessingFee = (amount: number, type: string) => {
    switch (type) {
      case 'express': return Math.max(amount * 0.015, 25); // 1.5% or R25 minimum
      case 'emergency': return Math.max(amount * 0.025, 50); // 2.5% or R50 minimum
      default: return Math.max(amount * 0.005, 10); // 0.5% or R10 minimum
    }
  };

  const getProcessingTime = (type: string) => {
    switch (type) {
      case 'express': return '1-2 business days';
      case 'emergency': return 'Same day (if requested before 2 PM)';
      default: return '3-5 business days';
    }
  };

  const payoutRequestMutation = useMutation({
    mutationFn: async (data: PayoutRequest) => {
      return await apiRequest('POST', '/api/church/payout-request', {
        ...data,
        churchId: churchData.id
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/church/dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['/api/church/payouts'] });
      toast({
        title: "Payout Request Submitted",
        description: "Your payout request has been submitted successfully and is being processed.",
        variant: "default",
      });
      onOpenChange(false);
      resetForm();
    },
    onError: (error: any) => {
      toast({
        title: "Request Failed",
        description: error.message || "Failed to submit payout request. Please try again.",
        variant: "destructive",
      });
    }
  });

  const resetForm = () => {
    setFormData({
      amount: '',
      requestType: 'standard',
      description: '',
      requestedDate: new Date().toISOString().split('T')[0],
      urgencyReason: ''
    });
    setErrors({});
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    const amount = parseFloat(formData.amount);
    const availableBalance = parseFloat(churchData.availableBalance);

    if (!formData.amount || amount <= 0) {
      newErrors.amount = 'Please enter a valid amount';
    } else if (amount > availableBalance) {
      newErrors.amount = 'Amount exceeds available balance';
    } else if (amount < 100) {
      newErrors.amount = 'Minimum payout amount is R100';
    }

    if (formData.requestType === 'emergency' && !formData.urgencyReason?.trim()) {
      newErrors.urgencyReason = 'Emergency reason is required for emergency payouts';
    }

    if (!formData.requestedDate) {
      newErrors.requestedDate = 'Please select a requested date';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validateForm()) {
      payoutRequestMutation.mutate(formData);
    }
  };

  const requestedAmount = parseFloat(formData.amount) || 0;
  const processingFee = getProcessingFee(requestedAmount, formData.requestType);
  const netAmount = requestedAmount - processingFee;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
              <Banknote className="h-5 w-5 text-white" />
            </div>
            <div>
              <span className="text-xl font-bold text-gray-900">Request Payout</span>
              <p className="text-sm text-gray-600 mt-1">Request withdrawal from your church earnings</p>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Church Balance Overview */}
          <div className="bg-gradient-to-r from-green-50 to-blue-50 p-6 rounded-lg border">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <Building2 className="h-6 w-6 text-green-600" />
                <div>
                  <h3 className="font-semibold text-gray-900">{churchData.name}</h3>
                  <p className="text-sm text-gray-600">Available Balance</p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-green-600">R{parseFloat(churchData.availableBalance).toLocaleString('en-ZA', { minimumFractionDigits: 2 })}</div>
                <div className="text-sm text-gray-500">{churchData.pendingPayouts} pending requests</div>
              </div>
            </div>
            
            {churchData.lastPayoutDate && (
              <div className="flex items-center text-sm text-gray-600">
                <Calendar className="h-4 w-4 mr-2" />
                Last payout: {new Date(churchData.lastPayoutDate).toLocaleDateString()}
              </div>
            )}
          </div>

          {/* Bank Details */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex items-center space-x-2 mb-3">
              <CreditCard className="h-5 w-5 text-gray-600" />
              <h4 className="font-medium text-gray-900">Payout Destination</h4>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Bank:</span>
                <span className="ml-2 font-medium">{churchData.bankDetails.bankName}</span>
              </div>
              <div>
                <span className="text-gray-600">Account:</span>
                <span className="ml-2 font-medium">***{churchData.bankDetails.accountNumber.slice(-4)}</span>
              </div>
              <div>
                <span className="text-gray-600">Branch:</span>
                <span className="ml-2 font-medium">{churchData.bankDetails.branchCode}</span>
              </div>
              <div>
                <span className="text-gray-600">Holder:</span>
                <span className="ml-2 font-medium">{churchData.bankDetails.accountHolder}</span>
              </div>
            </div>
          </div>

          {/* Payout Request Form */}
          <div className="space-y-4">
            <h4 className="font-semibold text-gray-900">Payout Request Details</h4>
            
            {/* Amount */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Payout Amount (ZAR)</label>
              <Input
                type="number"
                placeholder="0.00"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                className={errors.amount ? 'border-red-500' : ''}
                min="100"
                max={churchData.availableBalance}
                step="0.01"
              />
              {errors.amount && <p className="text-red-500 text-sm mt-1">{errors.amount}</p>}
              <p className="text-xs text-gray-500 mt-1">Minimum: R100 • Maximum: R{parseFloat(churchData.availableBalance).toLocaleString()}</p>
            </div>

            {/* Request Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Processing Type</label>
              <Select value={formData.requestType} onValueChange={(value) => setFormData({ ...formData, requestType: value as any })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="standard">
                    <div className="flex items-center justify-between w-full">
                      <div>
                        <div className="font-medium">Standard</div>
                        <div className="text-xs text-gray-500">3-5 business days • Low fee</div>
                      </div>
                    </div>
                  </SelectItem>
                  <SelectItem value="express">
                    <div className="flex items-center justify-between w-full">
                      <div>
                        <div className="font-medium">Express</div>
                        <div className="text-xs text-gray-500">1-2 business days • Higher fee</div>
                      </div>
                    </div>
                  </SelectItem>
                  <SelectItem value="emergency">
                    <div className="flex items-center justify-between w-full">
                      <div>
                        <div className="font-medium">Emergency</div>
                        <div className="text-xs text-gray-500">Same day • Highest fee</div>
                      </div>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Requested Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Requested Date</label>
              <Input
                type="date"
                value={formData.requestedDate}
                onChange={(e) => setFormData({ ...formData, requestedDate: e.target.value })}
                className={errors.requestedDate ? 'border-red-500' : ''}
                min={new Date().toISOString().split('T')[0]}
              />
              {errors.requestedDate && <p className="text-red-500 text-sm mt-1">{errors.requestedDate}</p>}
            </div>

            {/* Emergency Reason (conditional) */}
            {formData.requestType === 'emergency' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Emergency Reason</label>
                <Textarea
                  placeholder="Please explain why this is an emergency payout request..."
                  value={formData.urgencyReason}
                  onChange={(e) => setFormData({ ...formData, urgencyReason: e.target.value })}
                  className={errors.urgencyReason ? 'border-red-500' : ''}
                  rows={3}
                />
                {errors.urgencyReason && <p className="text-red-500 text-sm mt-1">{errors.urgencyReason}</p>}
              </div>
            )}

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Description (Optional)</label>
              <Textarea
                placeholder="Add any additional notes about this payout request..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={2}
              />
            </div>
          </div>

          {/* Processing Summary */}
          {requestedAmount > 0 && (
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <div className="flex items-center space-x-2 mb-3">
                <TrendingUp className="h-5 w-5 text-blue-600" />
                <h4 className="font-medium text-blue-900">Processing Summary</h4>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-700">Requested Amount:</span>
                  <span className="font-medium">R{requestedAmount.toLocaleString('en-ZA', { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-700">Processing Fee:</span>
                  <span className="font-medium text-red-600">-R{processingFee.toLocaleString('en-ZA', { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="border-t pt-2 flex justify-between font-semibold">
                  <span className="text-gray-900">Net Amount:</span>
                  <span className="text-green-600">R{netAmount.toLocaleString('en-ZA', { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="flex items-center space-x-2 mt-2">
                  <Clock className="h-4 w-4 text-blue-600" />
                  <span className="text-blue-700">Processing Time: {getProcessingTime(formData.requestType)}</span>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3 pt-4 border-t">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={payoutRequestMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={payoutRequestMutation.isPending || !requestedAmount}
              className="bg-green-600 hover:bg-green-700"
            >
              {payoutRequestMutation.isPending ? (
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Submitting...</span>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <DollarSign className="h-4 w-4" />
                  <span>Submit Payout Request</span>
                </div>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}