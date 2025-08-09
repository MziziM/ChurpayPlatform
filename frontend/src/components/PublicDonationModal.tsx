import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Heart, CreditCard, Shield, Mail, User } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

interface PublicDonationModalProps {
  isOpen: boolean;
  onClose: () => void;
  project?: {
    id: string;
    name: string;
    churchName: string;
    targetAmount: string;
    currentAmount: string;
  };
}

export function PublicDonationModal({ isOpen, onClose, project }: PublicDonationModalProps) {
  const [amount, setAmount] = useState("");
  const [customAmount, setCustomAmount] = useState("");
  const [donorName, setDonorName] = useState("");
  const [donorEmail, setDonorEmail] = useState("");
  const [message, setMessage] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [donationType, setDonationType] = useState("once");
  
  const { toast } = useToast();

  const donationMutation = useMutation({
    mutationFn: async (donationData: any) => {
      if (project) {
        const res = await apiRequest("POST", `/api/projects/${project.id}/donate`, donationData);
        return await res.json();
      }
      throw new Error("No project selected");
    },
    onSuccess: (data) => {
      toast({
        title: "Thank You!",
        description: data.message || "Redirecting to secure payment gateway...",
        variant: "default",
      });
      
      // Redirect to PayFast payment gateway
      if (data.paymentUrl) {
        window.location.href = data.paymentUrl;
      }
      
      onClose();
      // Reset form
      setAmount("");
      setCustomAmount("");
      setDonorName("");
      setDonorEmail("");
      setMessage("");
      setIsAnonymous(false);
    },
    onError: (error: any) => {
      toast({
        title: "Donation Failed",
        description: error.message || "There was an error processing your donation. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const donationAmount = amount === "custom" ? customAmount : amount;
    
    if (!donationAmount || parseFloat(donationAmount) <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid donation amount.",
        variant: "destructive",
      });
      return;
    }

    if (!isAnonymous && (!donorName.trim() || !donorEmail.trim())) {
      toast({
        title: "Missing Information",
        description: "Please provide your name and email address.",
        variant: "destructive",
      });
      return;
    }

    donationMutation.mutate({
      amount: parseFloat(donationAmount),
      donorName: donorName.trim(),
      donorEmail: donorEmail.trim(),
      message: message.trim(),
      isAnonymous,
      donationType,
    });
  };

  const predefinedAmounts = ["50", "100", "250", "500", "1000", "custom"];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Heart className="h-5 w-5 text-red-500" />
            Support This Project
          </DialogTitle>
          <DialogDescription>
            {project ? (
              <>
                Make a donation to <strong>{project.name}</strong> by{" "}
                <strong>{project.churchName}</strong>
              </>
            ) : (
              "Make a donation to support this community project"
            )}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Donation Amount */}
          <div className="space-y-3">
            <Label htmlFor="amount">Donation Amount (ZAR)</Label>
            <div className="grid grid-cols-3 gap-2">
              {predefinedAmounts.map((amt) => (
                <Button
                  key={amt}
                  type="button"
                  variant={amount === amt ? "default" : "outline"}
                  className="text-sm"
                  onClick={() => setAmount(amt)}
                >
                  {amt === "custom" ? "Custom" : `R${amt}`}
                </Button>
              ))}
            </div>
            
            {amount === "custom" && (
              <Input
                placeholder="Enter custom amount"
                value={customAmount}
                onChange={(e) => setCustomAmount(e.target.value)}
                type="number"
                min="1"
                step="0.01"
              />
            )}
          </div>

          {/* Donation Type */}
          <div className="space-y-2">
            <Label>Donation Type</Label>
            <Select value={donationType} onValueChange={setDonationType}>
              <SelectTrigger>
                <SelectValue placeholder="Select donation type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="once">One-time donation</SelectItem>
                <SelectItem value="monthly">Monthly recurring</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Anonymous Donation Checkbox */}
          <div className="flex items-center space-x-2">
            <Checkbox
              id="anonymous"
              checked={isAnonymous}
              onCheckedChange={setIsAnonymous}
            />
            <Label htmlFor="anonymous" className="text-sm">
              Make this an anonymous donation
            </Label>
          </div>

          {/* Donor Information */}
          {!isAnonymous && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="donorName" className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Full Name *
                </Label>
                <Input
                  id="donorName"
                  placeholder="Enter your full name"
                  value={donorName}
                  onChange={(e) => setDonorName(e.target.value)}
                  required={!isAnonymous}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="donorEmail" className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  Email Address *
                </Label>
                <Input
                  id="donorEmail"
                  type="email"
                  placeholder="Enter your email address"
                  value={donorEmail}
                  onChange={(e) => setDonorEmail(e.target.value)}
                  required={!isAnonymous}
                />
                <p className="text-xs text-gray-500">
                  We'll send your donation receipt to this email
                </p>
              </div>
            </div>
          )}

          {/* Optional Message */}
          <div className="space-y-2">
            <Label htmlFor="message">Message (Optional)</Label>
            <Textarea
              id="message"
              placeholder="Leave an encouraging message for the church..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={3}
            />
          </div>

          {/* PayFast Security Notice */}
          <div className="bg-blue-50 p-3 rounded-lg">
            <div className="flex items-start gap-2">
              <Shield className="h-4 w-4 text-blue-600 mt-0.5" />
              <div className="text-sm text-blue-800">
                <p className="font-medium">Secure PayFast Payment</p>
                <p className="text-xs text-blue-600">
                  Payments are processed securely by PayFast, South Africa's leading payment gateway. 
                  Your payment information is protected with bank-grade encryption.
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={onClose}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={donationMutation.isPending}
              className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
            >
              {donationMutation.isPending ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Processing...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <CreditCard className="h-4 w-4" />
                  Pay R{amount === "custom" ? customAmount || "0" : amount || "0"} via PayFast
                </div>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}