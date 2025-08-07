import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { PaymentMethodSelector } from "./PaymentMethodSelector";
import { 
  Heart, Calculator, RefreshCw, Target, Plus, Wallet,
  ArrowRight, ArrowLeft, Check, Building2, CreditCard,
  Shield, ChevronRight, Sparkles, X, Info, DollarSign
} from "lucide-react";

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

interface ProfessionalDonationModalProps {
  isOpen: boolean;
  onClose: () => void;
  type?: 'donation' | 'tithe' | 'project' | 'topup';
  churches?: Church[];
  projects?: Project[];
  walletBalance?: string;
}

export function ProfessionalDonationModal({ 
  isOpen, 
  onClose, 
  type = 'donation', 
  churches = [], 
  projects = [],
  walletBalance = "0" 
}: ProfessionalDonationModalProps) {
  const [selectedChurch, setSelectedChurch] = useState<string>("");
  const [selectedProject, setSelectedProject] = useState<string>("");
  const [amount, setAmount] = useState<string>("");
  const [note, setNote] = useState<string>("");
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>("wallet");
  const [paymentMethodType, setPaymentMethodType] = useState<'wallet' | 'card'>('wallet');
  const [step, setStep] = useState<'amount' | 'details' | 'payment' | 'confirm'>('amount');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showTitheCalculator, setShowTitheCalculator] = useState(false);
  const [monthlyIncome, setMonthlyIncome] = useState<string>("");
  const [tithePercentage, setTithePercentage] = useState<string>("10");
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Quick amount presets
  const quickAmounts = type === 'tithe' 
    ? ['500', '1000', '1500', '2000']
    : ['100', '250', '500', '1000'];

  // Fetch user's saved payment methods
  const { data: paymentMethods = [] } = useQuery<Array<{
    id: string;
    type: string;
    cardLast4: string | null;
    cardBrand: string | null;
    bankName: string | null;
    accountType: string | null;
    userId: string;
    isActive: boolean | null;
    lastUsed: Date | null;
    createdAt: Date | null;
    updatedAt: Date | null;
    expiryDate: string | null;
    cardholderName: string | null;
  }>>({
    queryKey: ['/api/payment-methods'],
    enabled: isOpen,
  });

  const mutation = useMutation({
    mutationFn: async (data: any) => {
      let endpoint = '/api/donations/create';
      if (type === 'donation') endpoint = '/api/donations/create';
      else if (type === 'tithe') endpoint = '/api/donations/create';
      else if (type === 'project') endpoint = '/api/donations/create';
      else if (type === 'topup' && selectedPaymentMethod === 'payfast') endpoint = '/api/wallet/topup/payfast';
      else if (type === 'topup') endpoint = '/api/wallet/topup';
      
      return await apiRequest('POST', endpoint, data);
    },
    onSuccess: async (response) => {
      const data = await response.json();
      
      // Handle PayFast redirection
      if (data.paymentUrl && (selectedPaymentMethod === 'payfast' || selectedPaymentMethod === 'card')) {
        toast({
          title: "Redirecting to PayFast",
          description: "You will be redirected to complete your payment securely.",
        });
        window.location.href = data.paymentUrl;
        return;
      }
      
      // Handle successful wallet transactions
      toast({
        title: "Success!",
        description: `Your ${type} has been processed successfully.`,
      });
      queryClient.invalidateQueries({ queryKey: ['/api/wallet'] });
      queryClient.invalidateQueries({ queryKey: ['/api/user/wallet'] });
      queryClient.invalidateQueries({ queryKey: ['/api/donations/history'] });
      queryClient.invalidateQueries({ queryKey: ['/api/user/stats'] });
      queryClient.invalidateQueries({ queryKey: ['/api/user/stats/fresh-data-v3'] });
      handleClose();
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Something went wrong. Please try again.",
        variant: "destructive",
      });
      setIsProcessing(false);
    },
  });

  const getModalTitle = () => {
    switch (type) {
      case 'donation': return 'Make a Donation';
      case 'tithe': return 'Give Tithe';
      case 'project': return 'Support Project';
      case 'topup': return 'Top Up Wallet';
      default: return 'Make a Donation';
    }
  };

  const getModalIcon = () => {
    switch (type) {
      case 'donation': return <Heart className="h-7 w-7 text-white" />;
      case 'tithe': return <Building2 className="h-7 w-7 text-white" />;
      case 'project': return <Target className="h-7 w-7 text-white" />;
      case 'topup': return <Wallet className="h-7 w-7 text-white" />;
      default: return <Heart className="h-7 w-7 text-white" />;
    }
  };

  const getGradientColors = () => {
    switch (type) {
      case 'donation': return 'from-red-500 to-pink-600';
      case 'tithe': return 'from-purple-600 to-indigo-700';
      case 'project': return 'from-blue-500 to-cyan-600';
      case 'topup': return 'from-green-500 to-emerald-600';
      default: return 'from-purple-600 to-indigo-700';
    }
  };

  const getStepProgress = () => {
    const steps = ['amount', 'details', 'payment', 'confirm'];
    const currentIndex = steps.indexOf(step);
    return ((currentIndex + 1) / steps.length) * 100;
  };

  const resetModal = () => {
    setStep('amount');
    setAmount('');
    setNote('');
    setSelectedProject('');
    setIsProcessing(false);
    setShowTitheCalculator(false);
    setMonthlyIncome('');
    setTithePercentage('10');
  };

  const calculateTithe = () => {
    if (monthlyIncome && tithePercentage) {
      const income = parseFloat(monthlyIncome);
      const percentage = parseFloat(tithePercentage);
      const calculatedTithe = (income * percentage) / 100;
      setAmount(calculatedTithe.toFixed(2));
      setShowTitheCalculator(false);
    }
  };

  const handleClose = () => {
    resetModal();
    onClose();
  };

  const handleNext = () => {
    if (step === 'amount' && amount) setStep('details');
    else if (step === 'details') setStep('payment');
    else if (step === 'payment') setStep('confirm');
  };

  const handleBack = () => {
    if (step === 'details') setStep('amount');
    else if (step === 'payment') setStep('details');
    else if (step === 'confirm') setStep('payment');
  };

  const handleSubmit = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid amount.",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    
    const submitData = {
      amount: parseFloat(amount),
      donationType: type,
      paymentMethod: selectedPaymentMethod,
      note: note.trim() || null,
      churchId: null, // Will use user's church
      projectId: selectedProject || null
    };

    console.log('🎯 Submitting donation data:', submitData);
    mutation.mutate(submitData);
  };

  const canProceed = () => {
    if (step === 'amount') return amount && parseFloat(amount) > 0;
    if (step === 'details') return true;
    if (step === 'payment') {
      if (!selectedPaymentMethod) return false;
      // Check if wallet has sufficient balance
      if (selectedPaymentMethod === 'wallet' && parseFloat(walletBalance) < parseFloat(amount)) {
        return false;
      }
      return true;
    }
    return true;
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[700px] max-w-[95vw] mx-2 p-0 overflow-hidden rounded-3xl border-0 shadow-2xl">
        {/* Enhanced Header with Gradient */}
        <div className={`bg-gradient-to-br ${getGradientColors()} text-white p-8 relative overflow-hidden`}>
          <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -translate-y-20 translate-x-20"></div>
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/5 rounded-full translate-y-16 -translate-x-16"></div>
          <div className="absolute top-1/2 left-1/2 w-20 h-20 bg-white/5 rounded-full -translate-x-1/2 -translate-y-1/2"></div>
          
          <DialogHeader className="relative z-10">
            <DialogTitle className="flex items-center space-x-4 text-3xl font-bold mb-2">
              <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                {getModalIcon()}
              </div>
              <div>
                <span>{getModalTitle()}</span>
                <p className="text-lg font-normal text-white/90 mt-1">
                  {step === 'amount' && 'Choose your gift amount'}
                  {step === 'details' && 'Add a personal message'}
                  {step === 'payment' && 'Select payment method'}
                  {step === 'confirm' && 'Review your gift'}
                </p>
              </div>
            </DialogTitle>
            <DialogDescription className="sr-only">
              Make a {type} through ChurPay
            </DialogDescription>
          </DialogHeader>
          
          {/* Enhanced Progress Bar */}
          <div className="mt-8 bg-white/20 rounded-full h-3 overflow-hidden backdrop-blur-sm">
            <div 
              className="bg-gradient-to-r from-yellow-400 to-orange-500 h-full rounded-full transition-all duration-700 ease-out shadow-lg"
              style={{ width: `${getStepProgress()}%` }}
            />
          </div>
          
          {/* Step Indicators */}
          <div className="flex justify-between mt-4 text-sm text-white/80">
            <span className={step === 'amount' ? 'text-white font-semibold' : ''}>Amount</span>
            <span className={step === 'details' ? 'text-white font-semibold' : ''}>Details</span>
            <span className={step === 'payment' ? 'text-white font-semibold' : ''}>Payment</span>
            <span className={step === 'confirm' ? 'text-white font-semibold' : ''}>Confirm</span>
          </div>
        </div>

        {/* Enhanced Content Area */}
        <div className="p-8 space-y-6 bg-white">
          {/* Step 1: Amount Selection */}
          {step === 'amount' && (
            <div className="space-y-6">
              <div className="text-center">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">How much would you like to give?</h3>
                <p className="text-gray-600">Choose from quick amounts or enter a custom amount</p>
              </div>
              
              {/* Quick Amount Buttons */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {quickAmounts.map((quickAmount) => (
                  <Button
                    key={quickAmount}
                    variant={amount === quickAmount ? "default" : "outline"}
                    onClick={() => setAmount(quickAmount)}
                    className={`h-14 text-lg font-semibold transition-all duration-200 ${
                      amount === quickAmount 
                        ? `bg-gradient-to-r ${getGradientColors()} text-white shadow-lg scale-105` 
                        : 'hover:scale-105 hover:shadow-md'
                    }`}
                  >
                    R {quickAmount}
                  </Button>
                ))}
              </div>
              
              {/* Custom Amount Input */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label htmlFor="amount" className="text-lg font-semibold text-gray-900">
                    Or enter custom amount
                  </Label>
                  {type === 'tithe' && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowTitheCalculator(true)}
                      className="h-10 px-4 rounded-xl border-2 border-purple-200 hover:border-purple-300 text-purple-600 hover:bg-purple-50"
                    >
                      <Calculator className="h-4 w-4 mr-2" />
                      Calculate Tithe
                    </Button>
                  )}
                </div>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl font-bold text-gray-600">R</span>
                  <Input
                    id="amount"
                    type="number"
                    placeholder="0.00"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="pl-12 h-16 text-2xl font-bold text-center border-2 border-gray-200 focus:border-purple-500 rounded-xl"
                  />
                </div>
              </div>
              
              {/* Wallet Balance Display */}
              <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 font-medium">Available wallet balance:</span>
                  <span className="text-xl font-bold text-gray-900">R {parseFloat(walletBalance).toLocaleString()}</span>
                </div>
              </div>
              
              {/* Show fee preview for top-ups */}
              {type === 'topup' && amount && parseFloat(amount) > 0 && (
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                  <div className="text-sm text-blue-800 font-medium mb-3 flex items-center">
                    <Info className="h-4 w-4 mr-2" />
                    PayFast Processing Fees
                  </div>
                  <div className="text-sm text-blue-700 space-y-2">
                    <div className="flex justify-between">
                      <span>Top-up amount:</span>
                      <span className="font-medium">R {parseFloat(amount).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Processing fee (3.9%):</span>
                      <span>R {(parseFloat(amount) * 0.039).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Transaction fee:</span>
                      <span>R 3.00</span>
                    </div>
                    <div className="flex justify-between font-semibold border-t border-blue-300 pt-2">
                      <span>Total to pay:</span>
                      <span className="text-blue-900">R {(parseFloat(amount) + parseFloat(amount) * 0.039 + 3).toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Step 2: Details */}
          {step === 'details' && (
            <div className="space-y-6">
              <div className="text-center">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Add details to your gift</h3>
                <p className="text-gray-600">Make your gift more meaningful with a personal touch</p>
              </div>
              
              {type !== 'topup' && (
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="church" className="text-lg font-semibold text-gray-900">
                      Church *
                    </Label>
                    <Select value={selectedChurch} onValueChange={setSelectedChurch}>
                      <SelectTrigger className="h-14 border-2 border-gray-200 rounded-xl">
                        <SelectValue placeholder="Select your church" />
                      </SelectTrigger>
                      <SelectContent>
                        {churches.map((church) => (
                          <SelectItem key={church.id} value={church.id}>
                            {church.name} - {church.location}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {type === 'project' && (
                    <div>
                      <Label htmlFor="project" className="text-lg font-semibold text-gray-900">
                        Project
                      </Label>
                      <Select value={selectedProject} onValueChange={setSelectedProject}>
                        <SelectTrigger className="h-14 border-2 border-gray-200 rounded-xl">
                          <SelectValue placeholder="Select a project (optional)" />
                        </SelectTrigger>
                        <SelectContent>
                          {projects.map((project) => (
                            <SelectItem key={project.id} value={project.id}>
                              {project.title} - {project.churchName}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </div>
              )}
              
              <div>
                <Label htmlFor="note" className="text-lg font-semibold text-gray-900">
                  Personal Message (Optional)
                </Label>
                <Textarea
                  id="note"
                  placeholder={`Add a note with your ${type}...`}
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  className="min-h-[120px] border-2 border-gray-200 rounded-xl resize-none"
                  maxLength={500}
                />
                <p className="text-sm text-gray-500 mt-2">{note.length}/500 characters</p>
              </div>
            </div>
          )}

          {/* Step 3: Payment Method */}
          {step === 'payment' && (
            <div className="space-y-6">
              <div className="text-center">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Choose payment method</h3>
                <p className="text-gray-600">How would you like to complete this transaction?</p>
              </div>
              
              <div className="space-y-4">
                {/* Wallet Payment Option */}
                <div 
                  className={`p-4 border-2 rounded-xl cursor-pointer transition-all ${
                    selectedPaymentMethod === 'wallet' 
                      ? 'border-purple-500 bg-purple-50' 
                      : 'border-gray-200 hover:border-purple-300'
                  }`}
                  onClick={() => {
                    setSelectedPaymentMethod('wallet');
                    setPaymentMethodType('wallet');
                  }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-purple-100 rounded-lg">
                        <Wallet className="h-6 w-6 text-purple-600" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900">ChurPay Wallet</h4>
                        <p className="text-sm text-gray-600">Available: R {parseFloat(walletBalance).toFixed(2)}</p>
                      </div>
                    </div>
                    {selectedPaymentMethod === 'wallet' && (
                      <div className="w-4 h-4 bg-purple-600 rounded-full"></div>
                    )}
                  </div>
                </div>

                {/* PayFast Payment Option */}
                <div 
                  className={`p-4 border-2 rounded-xl cursor-pointer transition-all ${
                    selectedPaymentMethod === 'payfast' 
                      ? 'border-blue-500 bg-blue-50' 
                      : 'border-gray-200 hover:border-blue-300'
                  }`}
                  onClick={() => {
                    setSelectedPaymentMethod('payfast');
                    setPaymentMethodType('card');
                  }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <CreditCard className="h-6 w-6 text-blue-600" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900">PayFast Payment</h4>
                        <p className="text-sm text-gray-600">Secure card payment gateway</p>
                      </div>
                    </div>
                    {selectedPaymentMethod === 'payfast' && (
                      <div className="w-4 h-4 bg-blue-600 rounded-full"></div>
                    )}
                  </div>
                </div>

                {/* Insufficient Balance Warning */}
                {selectedPaymentMethod === 'wallet' && parseFloat(walletBalance) < parseFloat(amount) && (
                  <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p className="text-sm text-yellow-700">
                      Insufficient wallet balance. Please select PayFast payment or top up your wallet.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Step 4: Confirmation */}
          {step === 'confirm' && (
            <div className="space-y-6">
              <div className="text-center">
                <div className="w-20 h-20 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Check className="h-10 w-10 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Review your {type === 'topup' ? 'top-up' : 'gift'}</h3>
                <p className="text-gray-600">Please confirm the details below</p>
              </div>
              
              {/* Summary Card */}
              <div className="bg-gray-50 rounded-2xl p-6 border border-gray-200 space-y-4">
                {/* Amount and Fee Breakdown */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between py-3 border-b border-gray-200">
                    <span className="text-gray-600 font-medium">
                      {type === 'topup' ? 'Top-up Amount' : 'Amount'}
                    </span>
                    <span className="text-3xl font-bold text-gray-900">R {parseFloat(amount).toLocaleString()}</span>
                  </div>
                  
                  {/* Show fee calculation for top-ups when using PayFast */}
                  {type === 'topup' && selectedPaymentMethod === 'payfast' && (
                    <>
                      <div className="bg-white rounded-xl p-4 border border-gray-300 space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">Processing Fee (3.9%)</span>
                          <span className="text-gray-700">R {(parseFloat(amount) * 0.039).toFixed(2)}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">Transaction Fee</span>
                          <span className="text-gray-700">R 3.00</span>
                        </div>
                        <div className="flex items-center justify-between py-2 border-t border-gray-200 font-semibold">
                          <span className="text-gray-900">Total to Pay</span>
                          <span className="text-lg text-gray-900">
                            R {(parseFloat(amount) + parseFloat(amount) * 0.039 + 3).toFixed(2)}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-green-600 font-medium">Amount Added to Wallet</span>
                          <span className="text-green-600 font-semibold">R {parseFloat(amount).toFixed(2)}</span>
                        </div>
                      </div>
                    </>
                  )}
                </div>
                
                {type !== 'topup' && (
                  <div className="flex items-center justify-between py-3 border-b border-gray-200">
                    <span className="text-gray-600 font-medium">Church</span>
                    <span className="font-semibold text-gray-900">{selectedChurch}</span>
                  </div>
                )}
                
                <div className="flex items-center justify-between py-3 border-b border-gray-200">
                  <span className="text-gray-600 font-medium">Type</span>
                  <span className="font-semibold text-gray-900 capitalize">{type}</span>
                </div>
                
                <div className="flex items-center justify-between py-3">
                  <span className="text-gray-600 font-medium">Payment Method</span>
                  <div className="flex items-center space-x-2">
                    {paymentMethodType === 'wallet' ? (
                      <Wallet className="h-5 w-5 text-purple-600" />
                    ) : (
                      <CreditCard className="h-5 w-5 text-blue-600" />
                    )}
                    <span className="font-semibold text-gray-900 capitalize">{paymentMethodType}</span>
                  </div>
                </div>
                
                {note && (
                  <div className="pt-3 border-t border-gray-200">
                    <span className="text-gray-600 font-medium block mb-2">Message</span>
                    <p className="text-gray-900 bg-white p-3 rounded-lg border border-gray-200">{note}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex items-center justify-between pt-6 border-t border-gray-200">
            {step !== 'amount' && (
              <Button
                variant="outline"
                onClick={handleBack}
                className="h-12 px-6 rounded-xl border-2"
              >
                <ArrowLeft className="h-5 w-5 mr-2" />
                Back
              </Button>
            )}
            
            {step === 'amount' && <div />}
            
            <div className="flex space-x-3">
              <Button
                variant="outline"
                onClick={handleClose}
                className="h-12 px-6 rounded-xl border-2"
              >
                Cancel
              </Button>
              
              {step !== 'confirm' ? (
                <Button
                  onClick={handleNext}
                  disabled={!canProceed()}
                  className={`h-12 px-8 rounded-xl bg-gradient-to-r ${getGradientColors()} text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  Continue
                  <ArrowRight className="h-5 w-5 ml-2" />
                </Button>
              ) : (
                <Button
                  onClick={handleSubmit}
                  disabled={isProcessing}
                  className={`h-12 px-8 rounded-xl bg-gradient-to-r ${getGradientColors()} text-white font-semibold`}
                >
                  {isProcessing ? (
                    <>
                      <RefreshCw className="h-5 w-5 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-5 w-5 mr-2" />
                      Complete Gift
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Tithe Calculator Modal Overlay */}
        {showTitheCalculator && (
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 rounded-3xl">
            <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl border border-gray-200">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-r from-purple-600 to-indigo-700 rounded-xl flex items-center justify-center">
                    <Calculator className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">Tithe Calculator</h3>
                    <p className="text-sm text-gray-600">Calculate your biblical tithe</p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowTitheCalculator(false)}
                  className="rounded-xl hover:bg-gray-100"
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>

              <div className="space-y-6">
                {/* Monthly Income Input */}
                <div className="space-y-3">
                  <Label htmlFor="monthlyIncome" className="text-lg font-semibold text-gray-900">
                    Monthly Income
                  </Label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg font-bold text-gray-600">R</span>
                    <Input
                      id="monthlyIncome"
                      type="number"
                      placeholder="Enter your monthly income"
                      value={monthlyIncome}
                      onChange={(e) => setMonthlyIncome(e.target.value)}
                      className="pl-12 h-14 text-lg border-2 border-gray-200 focus:border-purple-500 rounded-xl"
                    />
                  </div>
                </div>

                {/* Tithe Percentage */}
                <div className="space-y-3">
                  <Label htmlFor="tithePercentage" className="text-lg font-semibold text-gray-900">
                    Tithe Percentage
                  </Label>
                  <div className="grid grid-cols-3 gap-3">
                    {['10', '15', '20'].map((percentage) => (
                      <Button
                        key={percentage}
                        variant={tithePercentage === percentage ? "default" : "outline"}
                        onClick={() => setTithePercentage(percentage)}
                        className={`h-12 font-semibold transition-all duration-200 ${
                          tithePercentage === percentage 
                            ? 'bg-gradient-to-r from-purple-600 to-indigo-700 text-white' 
                            : 'hover:bg-purple-50 hover:border-purple-300'
                        }`}
                      >
                        {percentage}%
                      </Button>
                    ))}
                  </div>
                  <div className="relative">
                    <Input
                      id="tithePercentage"
                      type="number"
                      placeholder="Custom %"
                      value={tithePercentage}
                      onChange={(e) => setTithePercentage(e.target.value)}
                      className="h-12 text-center border-2 border-gray-200 focus:border-purple-500 rounded-xl"
                      min="1"
                      max="100"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-lg font-bold text-gray-600">%</span>
                  </div>
                </div>

                {/* Calculation Preview */}
                {monthlyIncome && tithePercentage && (
                  <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl p-6 border border-purple-200">
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-gray-700 font-medium">Your calculated tithe:</span>
                      <Info className="h-5 w-5 text-purple-600" />
                    </div>
                    <div className="text-center">
                      <span className="text-3xl font-bold text-purple-600">
                        R {((parseFloat(monthlyIncome) * parseFloat(tithePercentage)) / 100).toLocaleString()}
                      </span>
                      <p className="text-sm text-gray-600 mt-2">
                        {tithePercentage}% of R {parseFloat(monthlyIncome).toLocaleString()}
                      </p>
                    </div>
                  </div>
                )}

                {/* Biblical Reference */}
                <div className="bg-yellow-50 rounded-xl p-4 border border-yellow-200">
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 bg-yellow-200 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Heart className="h-4 w-4 text-yellow-700" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-yellow-800 mb-1">Biblical Reference</p>
                      <p className="text-xs text-yellow-700 leading-relaxed">
                        "Bring the whole tithe into the storehouse, that there may be food in my house." - Malachi 3:10
                      </p>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-3 pt-4">
                  <Button
                    variant="outline"
                    onClick={() => setShowTitheCalculator(false)}
                    className="flex-1 h-12 rounded-xl border-2"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={calculateTithe}
                    disabled={!monthlyIncome || !tithePercentage}
                    className="flex-1 h-12 bg-gradient-to-r from-purple-600 to-indigo-700 text-white font-semibold rounded-xl disabled:opacity-50"
                  >
                    <DollarSign className="h-5 w-5 mr-2" />
                    Use Amount
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}