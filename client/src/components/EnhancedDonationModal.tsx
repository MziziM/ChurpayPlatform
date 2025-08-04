import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { PaymentMethodSelector } from "./PaymentMethodSelector";
import { Heart, Calculator, RefreshCw, Target, Plus, Wallet } from "lucide-react";

interface Church {
  id: string;
  name: string;
  description: string;
  location: string;
}

interface Project {
  id: string;
  churchId: string;
  churchName: string;
  title: string;
  description: string;
  targetAmount: string;
  currentAmount: string;
  deadline: string;
  category: string;
  status: string;
}

interface EnhancedDonationModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'donation' | 'tithe' | 'project' | 'topup';
  churches: Church[];
  projects?: Project[];
  walletBalance: string;
}

export function EnhancedDonationModal({ 
  isOpen, 
  onClose, 
  type, 
  churches, 
  projects = [],
  walletBalance 
}: EnhancedDonationModalProps) {
  const [selectedChurch, setSelectedChurch] = useState<string>("");
  const [selectedProject, setSelectedProject] = useState<string>("");
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
      let endpoint = '/api/donations/give';
      if (type === 'donation') endpoint = '/api/donations/give';
      else if (type === 'tithe') endpoint = '/api/donations/tithe';
      else if (type === 'project') endpoint = '/api/projects/sponsor';
      else if (type === 'topup') endpoint = '/api/wallet/topup';
      
      return await apiRequest(endpoint, 'POST', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/wallet'] });
      queryClient.invalidateQueries({ queryKey: ['/api/wallet/transactions'] });
      queryClient.invalidateQueries({ queryKey: ['/api/donations/history'] });
      queryClient.invalidateQueries({ queryKey: ['/api/projects'] });
      
      const typeMap = {
        donation: 'Donation',
        tithe: 'Tithe',
        project: 'Project Sponsorship',
        topup: 'Wallet Top-up'
      };
      
      toast({
        title: "Success",
        description: `${typeMap[type]} completed`,
      });
      onClose();
      resetForm();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Something went wrong",
        variant: "destructive",
      });
    },
  });

  const resetForm = () => {
    setSelectedChurch("");
    setSelectedProject("");
    setAmount("");
    setNote("");
    setSelectedPaymentMethod("wallet");
    setPaymentMethodType('wallet');
  };

  const handleSubmit = () => {
    if (type === 'donation' || type === 'tithe') {
      if (!selectedChurch || !amount || parseFloat(amount) <= 0) {
        toast({
          title: "Required Fields",
          description: "Please select a church and enter amount.",
          variant: "destructive",
        });
        return;
      }
      
      mutation.mutate({
        churchId: selectedChurch,
        amount: parseFloat(amount),
        note: note || undefined,
        paymentMethod: paymentMethodType,
        paymentMethodId: paymentMethodType === 'card' ? selectedPaymentMethod : null,
      });
    } else if (type === 'project') {
      if (!selectedProject || !amount || parseFloat(amount) <= 0) {
        toast({
          title: "Required Fields", 
          description: "Please select a project and enter amount.",
          variant: "destructive",
        });
        return;
      }
      
      mutation.mutate({
        projectId: selectedProject,
        amount: parseFloat(amount),
        paymentMethod: paymentMethodType,
        paymentMethodId: paymentMethodType === 'card' ? selectedPaymentMethod : null,
      });
    } else if (type === 'topup') {
      if (!amount || parseFloat(amount) <= 0 || (paymentMethodType === 'card' && !selectedPaymentMethod)) {
        toast({
          title: "Required Fields",
          description: "Please enter amount and select payment method.",
          variant: "destructive",
        });
        return;
      }
      
      mutation.mutate({
        amount: parseFloat(amount),
        paymentMethod: paymentMethodType === 'card' ? selectedPaymentMethod : paymentMethodType,
      });
    }
  };

  const getTitleAndIcon = () => {
    switch (type) {
      case 'donation':
        return { title: 'Make a Donation', icon: <Heart className="h-5 w-5 mr-2 text-purple-600" /> };
      case 'tithe':
        return { title: 'Pay Tithe', icon: <Heart className="h-5 w-5 mr-2 text-blue-600" /> };
      case 'project':
        return { title: 'Sponsor Project', icon: <Target className="h-5 w-5 mr-2 text-orange-600" /> };
      case 'topup':
        return { title: 'Top Up Wallet', icon: <Plus className="h-5 w-5 mr-2 text-green-600" /> };
      default:
        return { title: 'Make a Donation', icon: <Heart className="h-5 w-5 mr-2 text-purple-600" /> };
    }
  };

  const { title, icon } = getTitleAndIcon();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-w-[95vw] max-h-[85vh] md:max-h-[90vh] overflow-y-auto mx-2">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            {icon}
            {title}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 md:space-y-6">
          {/* Church Selection (for donation and tithe) */}
          {(type === 'donation' || type === 'tithe') && (
            <div>
              <Label htmlFor="church-select">Select Church</Label>
              <Select value={selectedChurch} onValueChange={setSelectedChurch}>
                <SelectTrigger>
                  <SelectValue placeholder="Select church" />
                </SelectTrigger>
                <SelectContent>
                  {churches.map((church) => (
                    <SelectItem key={church.id} value={church.id}>
                      {church.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Project Selection (for project sponsorship) */}
          {type === 'project' && (
            <div>
              <Label htmlFor="project-select">Select Project</Label>
              <Select value={selectedProject} onValueChange={setSelectedProject}>
                <SelectTrigger>
                  <SelectValue placeholder="Select project" />
                </SelectTrigger>
                <SelectContent>
                  {projects.map((project) => (
                    <SelectItem key={project.id} value={project.id}>
                      <div className="flex flex-col">
                        <span className="font-medium">{project.title}</span>
                        <span className="text-sm text-gray-500">{project.churchName}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Amount Input */}
          <div>
            <Label htmlFor="amount">
              Amount (ZAR) {type === 'topup' && <span className="text-sm text-gray-500">(Processing fee will be added)</span>}
            </Label>
            <Input
              id="amount"
              type="number"
              placeholder="100"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </div>

          {/* Note (for donation and tithe) */}
          {(type === 'donation') && (
            <div>
              <Label htmlFor="note">Note (Optional)</Label>
              <Textarea
                id="note"
                placeholder="Add a note for your donation..."
                value={note}
                onChange={(e) => setNote(e.target.value)}
                rows={3}
              />
            </div>
          )}

          {/* Payment Method Selection */}
          <PaymentMethodSelector
            paymentMethods={paymentMethods || []}
            selectedMethod={selectedPaymentMethod}
            onMethodSelect={(methodId, type) => {
              setSelectedPaymentMethod(methodId);
              setPaymentMethodType(type);
            }}
            walletBalance={parseFloat(walletBalance)}
            showAddCard={true}
            onAddCard={() => {
              toast({
                title: "Add New Card",
                description: "This feature is coming soon",
              });
            }}
          />

          {/* Amount Summary */}
          {amount && (
            <div className="p-4 bg-gray-50 rounded-lg space-y-2">
              <div className="flex justify-between text-sm">
                <span>Amount:</span>
                <span>{`R ${parseFloat(amount).toFixed(2)}`}</span>
              </div>
              {type === 'topup' && (
                <>
                  <div className="flex justify-between text-sm">
                    <span>Processing Fee (3.9% + R3):</span>
                    <span>{`R ${((parseFloat(amount) * 0.039) + 3).toFixed(2)}`}</span>
                  </div>
                  <div className="flex justify-between font-medium border-t pt-2">
                    <span>Total:</span>
                    <span>{`R ${(parseFloat(amount) + (parseFloat(amount) * 0.039) + 3).toFixed(2)}`}</span>
                  </div>
                </>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col md:flex-row space-y-3 md:space-y-0 md:space-x-3">
            <Button
              onClick={handleSubmit}
              disabled={mutation.isPending}
              className="flex-1 bg-churpay-gradient text-white h-12"
            >
              {mutation.isPending ? (
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Calculator className="h-4 w-4 mr-2" />
              )}
              {mutation.isPending ? 'Processing...' : `${type === 'donation' ? 'Give' : type === 'tithe' ? 'Tithe' : type === 'project' ? 'Sponsor' : 'Top Up'}`}
            </Button>
            <Button variant="outline" onClick={onClose} className="w-full md:w-auto h-12">
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}