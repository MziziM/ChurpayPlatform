import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Heart, 
  Receipt, 
  Rocket, 
  Clock, 
  Plus, 
  HelpCircle, 
  CheckCircle,
  Bell,
  Menu,
  Download,
  Users,
  DollarSign,
  Target,
  Gift,
  TrendingUp,
  Calendar,
  ArrowRight,
  Eye,
  EyeOff,
  Settings,
  User,
  Repeat,
  Share,
  History,
  AlertTriangle,
  Mail,
  Calculator,
  Info,
  Wallet,
  CreditCard,
  ArrowUpRight,
  ArrowDownLeft,
  Banknote,
  CheckCircle2,
  Sparkles,
  Copy,
  Edit,
  Save,
  Church
} from 'lucide-react';

interface MemberDashboardProps {
  theme?: any;
  dashboard?: any;
  isDark?: boolean;
  setIsDark?: (dark: boolean) => void;
}

interface PaymentSuccessData {
  type: 'wallet' | 'gateway';
  action: string;
  amount: string;
  transactionId?: string;
  timestamp: string;
  method: string;
}

export function MemberDashboardFull({ theme, dashboard, isDark, setIsDark }: MemberDashboardProps) {
  const [showBalance, setShowBalance] = useState(true);
  const [showPaymentGateway, setShowPaymentGateway] = useState(false);
  
  // Separate modal states for each action
  const [showGiveModal, setShowGiveModal] = useState(false);
  const [showTitheModal, setShowTitheModal] = useState(false);
  const [showSponsorModal, setShowSponsorModal] = useState(false);
  const [showWalletModal, setShowWalletModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showGoalModal, setShowGoalModal] = useState(false);
  
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [settingsTab, setSettingsTab] = useState<'biometric' | 'notifications' | 'devices'>('biometric');
  
  // Payment states
  const [paymentAction, setPaymentAction] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'wallet' | 'gateway'>('wallet');
  const [giveAmount, setGiveAmount] = useState('');
  const [titheAmount, setTitheAmount] = useState('');
  const [sponsorAmount, setSponsorAmount] = useState('');
  const [walletTopUpAmount, setWalletTopUpAmount] = useState('');
  const [monthlyIncome, setMonthlyIncome] = useState('');
  const [selectedProject, setSelectedProject] = useState(1);
  const [giveType, setGiveType] = useState<'offering' | 'special' | 'thanksgiving'>('offering');
  const [paymentSuccessData, setPaymentSuccessData] = useState<PaymentSuccessData | null>(null);

  // Annual Giving Goal states
  const [givingGoal, setGivingGoal] = useState(() => {
    const saved = localStorage.getItem('churpay-annual-goal');
    return saved ? parseFloat(saved) : 10000.00;
  });
  const [tempGoalAmount, setTempGoalAmount] = useState('');

  // Mock data for member dashboard
  const walletBalance = dashboard?.walletBalance || 1247.50;
  const donations = dashboard?.donations || [
    { id: 1, project: 'Youth Project', amount: 250, date: '2 days ago', status: 'completed', type: 'give' },
    { id: 2, project: 'Building Fund', amount: 350, date: '3 days ago', status: 'completed', type: 'sponsor' },
    { id: 3, project: 'Feeding Scheme', amount: 100, date: '5 days ago', status: 'completed', type: 'give' },
    { id: 4, project: 'Monthly Tithe', amount: 500, date: '1 week ago', status: 'completed', type: 'tithe' },
    { id: 5, project: 'Special Offering', amount: 200, date: '2 weeks ago', status: 'completed', type: 'give' },
    { id: 6, project: 'Community Outreach', amount: 125, date: '3 weeks ago', status: 'completed', type: 'sponsor' },
  ];

  // Mock wallet transactions
  const walletTransactions = [
    { id: 1, type: 'topup', amount: 500, description: 'Wallet Top-up', date: '1 day ago', status: 'completed' },
    { id: 2, type: 'payment', amount: -250, description: 'Youth Project Donation', date: '2 days ago', status: 'completed' },
    { id: 3, type: 'topup', amount: 1000, description: 'Wallet Top-up', date: '5 days ago', status: 'completed' },
    { id: 4, type: 'payment', amount: -500, description: 'Monthly Tithe', date: '1 week ago', status: 'completed' },
    { id: 5, type: 'payment', amount: -100, description: 'Feeding Scheme', date: '1 week ago', status: 'completed' },
  ];

  const memberData = {
    thisMonth: 850.00,
    yearToDate: 8450.00,
    givingGoal: givingGoal,
    church: {
      name: "Grace Community Church",
      logo: null,
      pastor: "Pastor John Smith"
    }
  };

  const user = {
    first_name: "Sarah",
    last_name: "Johnson",
    email: "sarah.johnson@example.com",
    email_verified: true
  };

  // Save giving goal to localStorage when it changes
  useEffect(() => {
    localStorage.setItem('churpay-annual-goal', givingGoal.toString());
  }, [givingGoal]);

  const generateTransactionId = () => {
    return 'CP' + Date.now().toString(36).toUpperCase() + Math.random().toString(36).substr(2, 5).toUpperCase();
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const getActionTitle = (action: string) => {
    switch (action) {
      case 'give':
        return 'Offering Given';
      case 'tithe':
        return 'Tithe Paid';
      case 'sponsor':
        return 'Project Sponsored';
      case 'wallet-topup':
        return 'Wallet Topped Up';
      default:
        return 'Payment Successful';
    }
  };

  const getActionDescription = (action: string, amount: string) => {
    switch (action) {
      case 'give':
        return `Your offering of R${amount} has been successfully given to support the church ministry.`;
      case 'tithe':
        return `Your tithe of R${amount} has been faithfully given as an act of worship and obedience.`;
      case 'sponsor':
        return `Your sponsorship of R${amount} will help bring this important project to completion.`;
      case 'wallet-topup':
        return `R${amount} has been successfully added to your ChurPay wallet and is ready to use.`;
      default:
        return `Your payment of R${amount} has been processed successfully.`;
    }
  };

  const handlePaymentAction = (action: string, amount: string, method: 'wallet' | 'gateway' = 'wallet') => {
    const amountNum = parseFloat(amount);
    
    // Check if using wallet and has sufficient balance
    if (method === 'wallet' && amountNum > walletBalance) {
      alert(`Insufficient wallet balance. Your balance is R${walletBalance.toFixed(2)}. Please add funds to your wallet or use card payment.`);
      return;
    }

    setPaymentAction(action);
    setPaymentMethod(method);
    
    // Close all modals
    setShowGiveModal(false);
    setShowTitheModal(false);
    setShowSponsorModal(false);
    setShowWalletModal(false);
    
    if (method === 'wallet') {
      // Process wallet payment immediately
      handleWalletPayment(action, amountNum);
    } else {
      // Open payment gateway
      setShowPaymentGateway(true);
    }
  };

  const handleWalletPayment = (action: string, amount: number) => {
    // Simulate wallet payment processing
    console.log(`Processing wallet payment: ${action} - R${amount}`);
    
    setTimeout(() => {
      const successData: PaymentSuccessData = {
        type: 'wallet',
        action,
        amount: amount.toString(),
        transactionId: generateTransactionId(),
        timestamp: new Date().toLocaleString(),
        method: 'ChurPay Wallet'
      };
      
      setPaymentSuccessData(successData);
      setShowSuccessModal(true);
    }, 1000);
  };

  const handleWalletTopUp = (amount: string) => {
    setPaymentAction('wallet-topup');
    setWalletTopUpAmount(amount);
    setShowWalletModal(false);
    setShowPaymentGateway(true);
  };

  const handleGoalUpdate = () => {
    const newGoal = parseFloat(tempGoalAmount);
    if (newGoal && newGoal > 0) {
      setGivingGoal(newGoal);
      setShowGoalModal(false);
      setTempGoalAmount('');
    }
  };

  const openGoalModal = () => {
    setTempGoalAmount(givingGoal.toString());
    setShowGoalModal(true);
  };

  const goalProgress = (memberData.yearToDate / memberData.givingGoal) * 100;

  // Calculate tithe based on monthly income
  const calculateTithe = () => {
    if (monthlyIncome) {
      const tithe = (parseFloat(monthlyIncome) * 0.1).toFixed(2);
      setTitheAmount(tithe);
    }
  };

  const copyTransactionId = () => {
    if (paymentSuccessData?.transactionId) {
      navigator.clipboard.writeText(paymentSuccessData.transactionId);
    }
  };

  return (
    <div className="max-w-md mx-auto lg:max-w-2xl p-6 space-y-6 pb-20">
      {/* Email Verification Alert */}
      {user && !user.email_verified && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4"
        >
          <Alert className="bg-yellow-50 border-yellow-200">
            <Mail className="h-4 w-4 text-yellow-600" />
            <AlertDescription className="text-yellow-800">
              Please verify your email address to secure your account and enable all features.
              <Button variant="link" className="p-0 h-auto text-yellow-800 underline ml-2">
                Resend verification email
              </Button>
            </AlertDescription>
          </Alert>
        </motion.div>
      )}

      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <p className="text-gray-600">{getGreeting()},</p>
          <h1 className="text-2xl font-bold text-gray-900">
            {user?.first_name || 'Member'}
          </h1>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            className="rounded-full"
            onClick={() => setShowSettingsModal(true)}
          >
            <Settings className="w-4 h-4" />
          </Button>
          <button onClick={() => setShowProfileModal(true)}>
            <div className="w-14 h-14 rounded-full border-2 bg-churpay-gradient flex items-center justify-center shadow-lg">
              <span className="font-medium text-white text-lg">
                {user?.first_name?.[0] || 'M'}{user?.last_name?.[0] || 'E'}
              </span>
            </div>
          </button>
        </div>
      </motion.div>

      {/* Enhanced Wallet Card with ChurPay Branding */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1 }}
        className="relative"
      >
        <Card className="bg-churpay-gradient p-6 text-white shadow-xl relative overflow-hidden">
          {/* Background decoration */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full translate-y-12 -translate-x-12"></div>
          
          <div className="relative">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                  <Wallet className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-purple-100 text-sm">ChurPay Wallet</p>
                  <div className="flex items-center space-x-2">
                    <span className="text-2xl font-bold">
                      {showBalance ? `R ${walletBalance.toFixed(2)}` : 'R ••••'}
                    </span>
                    <button
                      onClick={() => setShowBalance(!showBalance)}
                      className="text-purple-200 hover:text-white transition-colors"
                    >
                      {showBalance ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
              </div>
              <Button
                onClick={() => setShowWalletModal(true)}
                className="bg-white/20 hover:bg-white/30 text-white border-white/30 backdrop-blur-sm"
                size="sm"
              >
                <Plus className="h-4 w-4 mr-2" />
                Top Up
              </Button>
            </div>

            {/* Quick wallet actions */}
            <div className="grid grid-cols-3 gap-3 mt-4">
              <button className="flex flex-col items-center p-3 bg-white/10 rounded-xl backdrop-blur-sm hover:bg-white/20 transition-colors">
                <ArrowUpRight className="h-5 w-5 mb-1" />
                <span className="text-xs">Send</span>
              </button>
              <button className="flex flex-col items-center p-3 bg-white/10 rounded-xl backdrop-blur-sm hover:bg-white/20 transition-colors">
                <ArrowDownLeft className="h-5 w-5 mb-1" />
                <span className="text-xs">Receive</span>
              </button>
              <button 
                onClick={() => setShowHistoryModal(true)}
                className="flex flex-col items-center p-3 bg-white/10 rounded-xl backdrop-blur-sm hover:bg-white/20 transition-colors"
              >
                <History className="h-5 w-5 mb-1" />
                <span className="text-xs">History</span>
              </button>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Church Info Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card className="p-4 bg-gradient-to-r from-purple-50 to-transparent border-purple-100">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-churpay-gradient rounded-xl flex items-center justify-center">
              <Church className="h-6 w-6 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900">{memberData.church.name}</h3>
              <p className="text-sm text-gray-600">{memberData.church.pastor}</p>
            </div>
            <Badge className="bg-green-100 text-green-800 border-green-200">
              <CheckCircle className="h-3 w-3 mr-1" />
              Active
            </Badge>
          </div>
        </Card>
      </motion.div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <div className="grid grid-cols-2 gap-4">
          <Card 
            className="p-6 hover:shadow-lg transition-all duration-200 cursor-pointer group bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200"
            onClick={() => setShowGiveModal(true)}
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="w-10 h-10 bg-churpay-gradient rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                  <Heart className="h-5 w-5 text-white" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-1">Give Offering</h3>
                <p className="text-sm text-gray-600">Support ministry</p>
              </div>
            </div>
          </Card>

          <Card 
            className="p-6 hover:shadow-lg transition-all duration-200 cursor-pointer group bg-gradient-to-br from-green-50 to-green-100 border-green-200"
            onClick={() => setShowTitheModal(true)}
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="w-10 h-10 bg-churpay-gradient rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                  <Receipt className="h-5 w-5 text-white" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-1">Pay Tithe</h3>
                <p className="text-sm text-gray-600">Faithful giving</p>
              </div>
            </div>
          </Card>

          <Card 
            className="p-6 hover:shadow-lg transition-all duration-200 cursor-pointer group bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200"
            onClick={() => setShowSponsorModal(true)}
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="w-10 h-10 bg-churpay-gradient rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                  <Rocket className="h-5 w-5 text-white" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-1">Sponsor Project</h3>
                <p className="text-sm text-gray-600">Fund initiatives</p>
              </div>
            </div>
          </Card>

          <Card 
            className="p-6 hover:shadow-lg transition-all duration-200 cursor-pointer group bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200"
            onClick={openGoalModal}
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="w-10 h-10 bg-churpay-gradient rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                  <Target className="h-5 w-5 text-white" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-1">Giving Goal</h3>
                <p className="text-sm text-gray-600">Track progress</p>
              </div>
            </div>
          </Card>
        </div>
      </motion.div>

      {/* Giving Goal Progress */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <Target className="h-5 w-5 text-purple-600" />
              <h3 className="font-semibold text-gray-900">Annual Giving Goal</h3>
            </div>
            <Button variant="ghost" size="sm" onClick={openGoalModal}>
              <Edit className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Progress</span>
              <span className="font-medium">R {memberData.yearToDate.toLocaleString()} / R {memberData.givingGoal.toLocaleString()}</span>
            </div>
            <Progress value={goalProgress} className="h-3" />
            <div className="flex justify-between text-xs text-gray-500">
              <span>{goalProgress.toFixed(1)}% Complete</span>
              <span>R {(memberData.givingGoal - memberData.yearToDate).toLocaleString()} remaining</span>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Recent Activity */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <History className="h-5 w-5 text-purple-600" />
              <h3 className="font-semibold text-gray-900">Recent Activity</h3>
            </div>
            <Button variant="ghost" size="sm" onClick={() => setShowHistoryModal(true)}>
              View All
              <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
          
          <div className="space-y-3">
            {donations.slice(0, 3).map((donation) => (
              <div key={donation.id} className="flex items-center justify-between p-3 bg-gradient-to-r from-purple-50 to-transparent rounded-xl border border-purple-100">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-churpay-gradient rounded-xl flex items-center justify-center">
                    <Heart className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">R {donation.amount.toLocaleString()}</p>
                    <p className="text-sm text-gray-600">{donation.project} • {donation.date}</p>
                  </div>
                </div>
                <Badge className="bg-green-100 text-green-800 border-green-200">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  {donation.status}
                </Badge>
              </div>
            ))}
          </div>
        </Card>
      </motion.div>

      {/* Giving Modal */}
      <Dialog open={showGiveModal} onOpenChange={setShowGiveModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <Heart className="h-5 w-5 text-purple-600" />
              <span>Give Offering</span>
            </DialogTitle>
            <DialogDescription>
              Support your church's ministry with a heartfelt offering
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">Amount (R)</label>
              <Input
                type="number"
                placeholder="Enter amount"
                value={giveAmount}
                onChange={(e) => setGiveAmount(e.target.value)}
                className="text-lg"
              />
            </div>
            
            <div className="grid grid-cols-3 gap-2">
              {[50, 100, 250].map((amount) => (
                <Button
                  key={amount}
                  variant="outline"
                  size="sm"
                  onClick={() => setGiveAmount(amount.toString())}
                  className="hover:bg-purple-50 hover:border-purple-200"
                >
                  R{amount}
                </Button>
              ))}
            </div>

            <div className="flex space-x-2">
              <Button 
                className="flex-1 bg-churpay-gradient hover:opacity-90"
                onClick={() => handlePaymentAction('give', giveAmount, 'wallet')}
                disabled={!giveAmount}
              >
                <Wallet className="h-4 w-4 mr-2" />
                Pay with Wallet
              </Button>
              <Button 
                variant="outline" 
                className="flex-1"
                onClick={() => handlePaymentAction('give', giveAmount, 'gateway')}
                disabled={!giveAmount}
              >
                <CreditCard className="h-4 w-4 mr-2" />
                Pay with Card
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Success Modal */}
      <Dialog open={showSuccessModal} onOpenChange={setShowSuccessModal}>
        <DialogContent className="max-w-md text-center">
          <DialogHeader>
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <CheckCircle2 className="h-8 w-8 text-green-600" />
            </div>
            <DialogTitle className="text-xl">
              {paymentSuccessData && getActionTitle(paymentSuccessData.action)}
            </DialogTitle>
            <DialogDescription className="text-base">
              {paymentSuccessData && getActionDescription(paymentSuccessData.action, paymentSuccessData.amount)}
            </DialogDescription>
          </DialogHeader>
          
          {paymentSuccessData && (
            <div className="bg-gray-50 rounded-lg p-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Amount:</span>
                <span className="font-medium">R {paymentSuccessData.amount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Method:</span>
                <span className="font-medium">{paymentSuccessData.method}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Transaction ID:</span>
                <div className="flex items-center space-x-2">
                  <span className="font-mono text-xs">{paymentSuccessData.transactionId}</span>
                  <Button variant="ghost" size="sm" onClick={copyTransactionId}>
                    <Copy className="h-3 w-3" />
                  </Button>
                </div>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Time:</span>
                <span className="font-medium">{paymentSuccessData.timestamp}</span>
              </div>
            </div>
          )}
          
          <div className="flex space-x-2">
            <Button 
              variant="outline" 
              className="flex-1"
              onClick={() => setShowHistoryModal(true)}
            >
              View History
            </Button>
            <Button 
              className="flex-1 bg-churpay-gradient"
              onClick={() => setShowSuccessModal(false)}
            >
              Done
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default MemberDashboardFull;