import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { PaymentMethodSelector } from "./PaymentMethodSelector";
import { Heart, Calculator } from "lucide-react";

interface Church {
  id: string;
  name: string;
  description: string;
  location: string;
}

interface EnhancedDonationModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'donation' | 'tithe';
  churches: Church[];
  walletBalance: number;
}

export function EnhancedDonationModal({ 
  isOpen, 
  onClose, 
  type, 
  churches, 
  walletBalance 
}: EnhancedDonationModalProps) {
  const [selectedChurch, setSelectedChurch] = useState<string>("");
  const [amount, setAmount] = useState<string>("");
  const [note, setNote] = useState<string>("");
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>("wallet");
  const [paymentMethodType, setPaymentMethodType] = useState<'wallet' | 'card'>('wallet');
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch user's saved payment methods
  const { data: paymentMethods = [] } = useQuery({
    queryKey: ['/api/payment-methods'],
    enabled: isOpen,
  });

  const mutation = useMutation({
    mutationFn: async (data: any) => {
      const endpoint = type === 'donation' ? '/api/donations/give' : '/api/donations/tithe';
      return await apiRequest(endpoint, {
        method: 'POST',
        body: JSON.stringify({
          ...data,
          paymentMethod: paymentMethodType,
          paymentMethodId: paymentMethodType === 'card' ? selectedPaymentMethod : null,
        }),
      });
    },
    onSuccess: () => {
      toast({
        title: "Success!",
        description: `${type === 'donation' ? 'Donation' : 'Tithe'} processed successfully`,
      });
      queryClient.invalidateQueries({ queryKey: ['/api/wallet'] });
      queryClient.invalidateQueries({ queryKey: ['/api/donations/history'] });
      onClose();
      resetForm();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || `Failed to process ${type}`,
        variant: "destructive",
      });
    },
  });

  const resetForm = () => {
    setSelectedChurch("");
    setAmount("");
    setNote("");
    setSelectedPaymentMethod("wallet");
    setPaymentMethodType('wallet');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedChurch || !amount) {
      toast({
        title: "Missing Information",
        description: "Please select a church and enter an amount",
        variant: "destructive",
      });
      return;
    }

    const numAmount = parseFloat(amount);
    if (numAmount <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid amount greater than 0",
        variant: "destructive",
      });
      return;
    }

    // Check wallet balance if using wallet
    if (paymentMethodType === 'wallet' && numAmount > walletBalance) {
      toast({
        title: "Insufficient Balance",
        description: "Please top up your wallet or use a different payment method",
        variant: "destructive",
      });
      return;
    }

    mutation.mutate({
      churchId: selectedChurch,
      amount: numAmount,
      note: note || undefined,
    });
  };

  const calculateFees = (amount: number) => {
    if (paymentMethodType === 'wallet') return { fee: 0, total: amount };
    
    // PayFast fees: 3.9% + R3
    const fee = (amount * 0.039) + 3;
    return { fee, total: amount + fee };
  };

  const fees = amount ? calculateFees(parseFloat(amount) || 0) : { fee: 0, total: 0 };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md mx-auto max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Heart className="h-5 w-5 text-purple-600" />
            {type === 'donation' ? 'Make a Donation' : 'Pay Tithe'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Church Selection */}
          <div className="space-y-2">
            <Label htmlFor="church">Select Church</Label>
            <Select value={selectedChurch} onValueChange={setSelectedChurch}>
              <SelectTrigger>
                <SelectValue placeholder="Choose a church" />
              </SelectTrigger>
              <SelectContent>
                {churches.map((church) => (
                  <SelectItem key={church.id} value={church.id}>
                    <div>
                      <div className="font-medium">{church.name}</div>
                      <div className="text-sm text-gray-500">{church.location}</div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Amount Input */}
          <div className="space-y-2">
            <Label htmlFor="amount">Amount (ZAR)</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">R</span>
              <Input
                id="amount"
                type="number"
                step="0.01"
                min="1"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="pl-8"
                placeholder="0.00"
              />
            </div>
          </div>

          {/* Payment Method Selector */}
          <PaymentMethodSelector
            paymentMethods={paymentMethods}
            selectedMethod={selectedPaymentMethod}
            onMethodSelect={(methodId, type) => {
              setSelectedPaymentMethod(methodId);
              setPaymentMethodType(type);
            }}
            walletBalance={walletBalance}
            showAddCard={true}
            onAddCard={() => {
              // TODO: Implement add card functionality
              toast({
                title: "Coming Soon",
                description: "Card management features will be available soon",
              });
            }}
          />

          {/* Fee Calculation */}
          {amount && parseFloat(amount) > 0 && (
            <div className="bg-gray-50 p-3 rounded-lg space-y-2">
              <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
                <Calculator className="h-4 w-4" />
                Transaction Summary
              </div>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span>{type === 'donation' ? 'Donation' : 'Tithe'} Amount:</span>
                  <span>R{parseFloat(amount).toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Processing Fee:</span>
                  <span>{paymentMethodType === 'wallet' ? 'Free' : `R${fees.fee.toFixed(2)}`}</span>
                </div>
                <div className="flex justify-between font-medium border-t pt-1">
                  <span>Total Amount:</span>
                  <span>R{fees.total.toFixed(2)}</span>
                </div>
              </div>
            </div>
          )}

          {/* Note/Message */}
          {type === 'donation' && (
            <div className="space-y-2">
              <Label htmlFor="note">Message (Optional)</Label>
              <Textarea
                id="note"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Add a personal message with your donation..."
                rows={3}
              />
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={mutation.isPending || !selectedChurch || !amount}
              className="flex-1 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800"
            >
              {mutation.isPending 
                ? 'Processing...' 
                : `${type === 'donation' ? 'Donate' : 'Pay Tithe'} R${fees.total.toFixed(2)}`
              }
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}