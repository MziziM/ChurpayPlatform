import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { 
  Wallet, 
  Plus, 
  ArrowUp, 
  ArrowDown, 
  ArrowLeftRight, 
  CreditCard,
  History,
  Settings,
  User,
  Shield,
  Target,
  TrendingUp,
  Bell,
  Eye,
  EyeOff,
  QrCode,
  Search,
  Filter,
  Download,
  RefreshCw,
  CheckCircle,
  Clock,
  AlertCircle,
  X,
  Star,
  Gift,
  Heart,
  Home,
  Send,
  Receipt,
  Zap
} from 'lucide-react';

interface WalletData {
  availableBalance: number;
  pendingBalance: number;
  rewardPoints: number;
  dailyLimit: number;
  dailyUsed: number;
  monthlyLimit: number;
  monthlyUsed: number;
  isActive: boolean;
  isPinSet: boolean;
}

interface WalletTransaction {
  id: string;
  type: 'deposit' | 'withdrawal' | 'transfer_sent' | 'transfer_received' | 'donation' | 'reward' | 'refund' | 'fee' | 'cashback';
  amount: number;
  description: string;
  recipient?: string;
  status: 'pending' | 'completed' | 'failed' | 'cancelled' | 'processing';
  createdAt: string;
  reference?: string;
}

interface Member {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  church: string;
  profileImage?: string;
}

export default function WalletDashboard() {
  const [currentView, setCurrentView] = useState('overview');
  const [showBalance, setShowBalance] = useState(true);
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [showTopUpModal, setShowTopUpModal] = useState(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [showPaymentMethodModal, setShowPaymentMethodModal] = useState(false);
  
  // Transfer states
  const [transferAmount, setTransferAmount] = useState('');
  const [transferRecipient, setTransferRecipient] = useState('');
  const [transferNote, setTransferNote] = useState('');
  const [searchResults, setSearchResults] = useState<Member[]>([]);
  
  // Top-up states
  const [topUpAmount, setTopUpAmount] = useState('');
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('');
  
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  // Fetch wallet data from API
  const { data: walletData, isLoading: walletLoading, error: walletError } = useQuery({
    queryKey: ['/api/wallet'],
    retry: false,
  });
  
  // Fetch wallet transactions
  const { data: transactions = [], isLoading: transactionsLoading } = useQuery({
    queryKey: ['/api/wallet/transactions'],
    retry: false,
  });

  // Transfer mutation
  const transferMutation = useMutation({
    mutationFn: async (data: { toUserId: string; amount: number; description?: string }) => {
      return await apiRequest('/api/wallet/transfer', {
        method: 'POST',
        body: JSON.stringify(data),
        headers: { 'Content-Type': 'application/json' },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/wallet'] });
      queryClient.invalidateQueries({ queryKey: ['/api/wallet/transactions'] });
      toast({
        title: "Transfer Successful",
        description: "Money has been sent successfully.",
      });
      setShowTransferModal(false);
      setTransferAmount('');
      setTransferRecipient('');
      setTransferNote('');
      setSearchResults([]);
    },
    onError: (error: any) => {
      toast({
        title: "Transfer Failed",
        description: error.message || "Failed to process transfer",
        variant: "destructive",
      });
    },
  });

  // Top-up mutation
  const topUpMutation = useMutation({
    mutationFn: async (data: { amount: number; paymentMethod: string }) => {
      return await apiRequest('/api/wallet/topup', {
        method: 'POST',
        body: JSON.stringify(data),
        headers: { 'Content-Type': 'application/json' },
      });
    },
    onSuccess: (data: any) => {
      toast({
        title: "Top-up Initiated",
        description: `Redirecting to payment page for R${data.amount}`,
      });
      // In real app, redirect to PayFast
      window.location.href = data.paymentUrl;
    },
    onError: (error: any) => {
      toast({
        title: "Top-up Failed",
        description: error.message || "Failed to initiate top-up",
        variant: "destructive",
      });
    },
  });

  const mockMembers: Member[] = [
    { id: '1', firstName: 'John', lastName: 'Smith', email: 'john@example.com', church: 'Grace Baptist Church', phone: '+27 82 123 4567' },
    { id: '2', firstName: 'Mary', lastName: 'Johnson', email: 'mary@example.com', church: 'Grace Baptist Church', phone: '+27 83 234 5678' },
    { id: '3', firstName: 'David', lastName: 'Williams', email: 'david@example.com', church: 'Grace Baptist Church', phone: '+27 84 345 6789' },
    { id: '4', firstName: 'Sarah', lastName: 'Brown', email: 'sarah@example.com', church: 'Grace Baptist Church', phone: '+27 85 456 7890' }
  ];

  // Search members for transfers
  const handleMemberSearch = async (query: string) => {
    if (query.length < 2) {
      setSearchResults([]);
      return;
    }
    
    try {
      const members = await apiRequest(`/api/members/search?q=${encodeURIComponent(query)}`);
      setSearchResults(members);
    } catch (error) {
      console.error('Search error:', error);
      setSearchResults([]);
    }
  };

  const handleTransfer = async () => {
    const selectedMember = mockMembers.find(m => 
      `${m.firstName} ${m.lastName}` === transferRecipient
    );
    
    if (!selectedMember || !transferAmount || parseFloat(transferAmount) <= 0) {
      toast({
        title: "Invalid Transfer",
        description: "Please select a recipient and enter a valid amount.",
        variant: "destructive",
      });
      return;
    }

    transferMutation.mutate({
      toUserId: selectedMember.id,
      amount: parseFloat(transferAmount),
      description: transferNote,
    });
  };

  const handleTopUp = async () => {
    if (!topUpAmount || parseFloat(topUpAmount) <= 0 || !selectedPaymentMethod) {
      toast({
        title: "Invalid Top-up",
        description: "Please enter a valid amount and select a payment method.",
        variant: "destructive",
      });
      return;
    }

    topUpMutation.mutate({
      amount: parseFloat(topUpAmount),
      paymentMethod: selectedPaymentMethod,
    });
  };

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'deposit': return <ArrowDown className="h-4 w-4 text-green-600" />;
      case 'withdrawal': return <ArrowUp className="h-4 w-4 text-red-600" />;
      case 'transfer_sent': return <Send className="h-4 w-4 text-blue-600" />;
      case 'transfer_received': return <ArrowDown className="h-4 w-4 text-green-600" />;
      case 'donation': return <Heart className="h-4 w-4 text-purple-600" />;
      case 'reward': return <Gift className="h-4 w-4 text-yellow-600" />;
      case 'refund': return <RefreshCw className="h-4 w-4 text-blue-600" />;
      default: return <ArrowLeftRight className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'pending': return <Clock className="h-4 w-4 text-yellow-600" />;
      case 'processing': return <RefreshCw className="h-4 w-4 text-blue-600 animate-spin" />;
      case 'failed': return <AlertCircle className="h-4 w-4 text-red-600" />;
      default: return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  const formatCurrency = (amount: number) => {
    return `R ${Math.abs(amount).toLocaleString('en-ZA', { minimumFractionDigits: 2 })}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-ZA', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Show loading state
  if (walletLoading || transactionsLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-yellow-50 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-purple-600" />
          <p className="text-gray-600">Loading wallet...</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (walletError || !walletData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-yellow-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-8 w-8 mx-auto mb-4 text-red-600" />
          <p className="text-red-600">Failed to load wallet data</p>
          <Button 
            onClick={() => window.location.reload()} 
            className="mt-4 bg-churpay-gradient text-white"
          >
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-yellow-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-10 h-10 bg-churpay-gradient rounded-xl flex items-center justify-center shadow-lg">
                  <span className="text-white font-bold text-lg">C</span>
                </div>
                <div className="hidden sm:block">
                  <span className="text-2xl font-bold text-gray-900">Chur</span>
                  <span className="text-2xl font-bold text-churpay-yellow">Pay</span>
                </div>
              </div>
              <div className="hidden lg:block pl-4 border-l border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Digital Wallet</h2>
                <p className="text-sm text-gray-600">Professional Member Dashboard</p>
              </div>
            </div>

            {/* Navigation */}
            <nav className="hidden md:flex items-center space-x-1">
              {[
                { id: 'overview', label: 'Overview', icon: Home },
                { id: 'transactions', label: 'Transactions', icon: History },
                { id: 'transfer', label: 'Transfer', icon: Send },
                { id: 'cards', label: 'Cards', icon: CreditCard },
                { id: 'settings', label: 'Settings', icon: Settings },
              ].map((item) => (
                <Button
                  key={item.id}
                  variant={currentView === item.id ? "default" : "ghost"}
                  onClick={() => setCurrentView(item.id)}
                  className={currentView === item.id ? "bg-churpay-gradient text-white shadow-lg" : "hover:bg-purple-50"}
                >
                  <item.icon className="h-4 w-4 mr-2" />
                  {item.label}
                </Button>
              ))}
            </nav>

            {/* Right Actions */}
            <div className="flex items-center space-x-3">
              <Button variant="ghost" size="sm" className="relative">
                <Bell className="h-5 w-5" />
                <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </Button>

              <div className="hidden sm:flex items-center space-x-2 px-3 py-2 bg-gradient-to-r from-green-50 to-green-100 rounded-lg">
                <Wallet className="h-4 w-4 text-green-600" />
                <span className="text-sm font-medium text-green-800">
                  {showBalance ? (walletData ? formatCurrency(parseFloat(walletData.availableBalance)) : 'R 0.00') : '****'}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowBalance(!showBalance)}
                  className="h-6 w-6 p-0"
                >
                  {showBalance ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                </Button>
              </div>

              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-churpay-gradient rounded-full flex items-center justify-center">
                  <User className="h-4 w-4 text-white" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {currentView === 'overview' && (
          <div className="space-y-6">
            {/* Balance Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white border-0 shadow-xl">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium opacity-90">Available Balance</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-3xl font-bold">
                          {showBalance ? (walletData ? formatCurrency(parseFloat(walletData.availableBalance)) : 'R 0.00') : '****'}
                        </p>
                        <p className="text-sm opacity-75 mt-1">Ready to spend</p>
                      </div>
                      <Wallet className="h-8 w-8 opacity-75" />
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <Card className="bg-gradient-to-br from-yellow-400 to-yellow-500 text-white border-0 shadow-xl">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium opacity-90">Reward Points</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-3xl font-bold">
                          {showBalance ? (walletData ? formatCurrency(parseFloat(walletData.rewardPoints)) : 'R 0.00') : '****'}
                        </p>
                        <p className="text-sm opacity-75 mt-1">Earn more with giving</p>
                      </div>
                      <Star className="h-8 w-8 opacity-75" />
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0 shadow-xl">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium opacity-90">Pending Balance</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-3xl font-bold">
                          {showBalance ? (walletData ? formatCurrency(parseFloat(walletData.pendingBalance)) : 'R 0.00') : '****'}
                        </p>
                        <p className="text-sm opacity-75 mt-1">Processing...</p>
                      </div>
                      <Clock className="h-8 w-8 opacity-75" />
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>

            {/* Quick Actions */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Zap className="h-5 w-5 mr-2 text-purple-600" />
                    Quick Actions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <Button 
                      onClick={() => setShowTopUpModal(true)}
                      className="bg-gradient-to-r from-green-500 to-green-600 text-white h-16 flex flex-col space-y-1"
                    >
                      <Plus className="h-5 w-5" />
                      <span className="text-sm">Top Up</span>
                    </Button>
                    
                    <Button 
                      onClick={() => setShowTransferModal(true)}
                      className="bg-gradient-to-r from-blue-500 to-blue-600 text-white h-16 flex flex-col space-y-1"
                    >
                      <Send className="h-5 w-5" />
                      <span className="text-sm">Transfer</span>
                    </Button>
                    
                    <Button 
                      onClick={() => setShowWithdrawModal(true)}
                      className="bg-gradient-to-r from-orange-500 to-orange-600 text-white h-16 flex flex-col space-y-1"
                    >
                      <ArrowUp className="h-5 w-5" />
                      <span className="text-sm">Withdraw</span>
                    </Button>
                    
                    <Button 
                      onClick={() => setCurrentView('transactions')}
                      className="bg-gradient-to-r from-purple-500 to-purple-600 text-white h-16 flex flex-col space-y-1"
                    >
                      <History className="h-5 w-5" />
                      <span className="text-sm">History</span>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Recent Transactions */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <Card className="border-0 shadow-lg">
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="flex items-center">
                    <History className="h-5 w-5 mr-2 text-purple-600" />
                    Recent Transactions
                  </CardTitle>
                  <Button variant="outline" size="sm" onClick={() => setCurrentView('transactions')}>
                    View All
                  </Button>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {transactions.slice(0, 5).map((transaction) => (
                      <div key={transaction.id} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                            {getTransactionIcon(transaction.type)}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{transaction.description}</p>
                            <div className="flex items-center space-x-2 text-sm text-gray-500">
                              <span>{formatDate(transaction.createdAt)}</span>
                              {getStatusIcon(transaction.status)}
                              <span className="capitalize">{transaction.status}</span>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className={`font-semibold ${transaction.amount >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {transaction.amount >= 0 ? '+' : ''}{formatCurrency(transaction.amount)}
                          </p>
                          {transaction.reference && (
                            <p className="text-xs text-gray-500">{transaction.reference}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Spending Limits */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Shield className="h-5 w-5 mr-2 text-purple-600" />
                    Spending Limits
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium text-gray-700">Daily Limit</span>
                        <span className="text-sm text-gray-500">
                          {walletData ? `${formatCurrency(1500)} / ${formatCurrency(parseFloat(walletData.dailyTransferLimit))}` : 'Loading...'}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-gradient-to-r from-purple-500 to-purple-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: walletData ? `${Math.min((1500 / parseFloat(walletData.dailyTransferLimit)) * 100, 100)}%` : '0%' }}
                        ></div>
                      </div>
                    </div>
                    
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium text-gray-700">Monthly Limit</span>
                        <span className="text-sm text-gray-500">
                          {walletData ? `${formatCurrency(12750)} / ${formatCurrency(parseFloat(walletData.monthlyTransferLimit))}` : 'Loading...'}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: walletData ? `${Math.min((12750 / parseFloat(walletData.monthlyTransferLimit)) * 100, 100)}%` : '0%' }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        )}

        {currentView === 'transactions' && (
          <div className="space-y-6">
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center">
                    <History className="h-5 w-5 mr-2 text-purple-600" />
                    Transaction History
                  </CardTitle>
                  <div className="flex items-center space-x-2">
                    <Button variant="outline" size="sm">
                      <Filter className="h-4 w-4 mr-2" />
                      Filter
                    </Button>
                    <Button variant="outline" size="sm">
                      <Download className="h-4 w-4 mr-2" />
                      Export
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {transactions.map((transaction) => (
                    <div key={transaction.id} className="flex items-center justify-between py-4 border-b border-gray-100 last:border-0">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                          {getTransactionIcon(transaction.type)}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">{transaction.description}</p>
                          <div className="flex items-center space-x-3 text-sm text-gray-500 mt-1">
                            <span>{formatDate(transaction.createdAt)}</span>
                            <div className="flex items-center space-x-1">
                              {getStatusIcon(transaction.status)}
                              <span className="capitalize">{transaction.status}</span>
                            </div>
                            {transaction.reference && (
                              <Badge variant="outline" className="text-xs">
                                {transaction.reference}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`text-lg font-bold ${transaction.amount >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {transaction.amount >= 0 ? '+' : ''}{formatCurrency(transaction.amount)}
                        </p>
                        {transaction.recipient && (
                          <p className="text-sm text-gray-500">{transaction.recipient}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Similar views for transfer, cards, and settings would be added here */}
      </main>

      {/* Transfer Modal */}
      <Dialog open={showTransferModal} onOpenChange={setShowTransferModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <Send className="h-5 w-5 mr-2 text-purple-600" />
              Send Money
            </DialogTitle>
            <DialogDescription>
              Transfer money to another ChurPay member
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="recipient">Recipient</Label>
              <div className="relative">
                <Input
                  id="recipient"
                  placeholder="Search by name, email, or phone"
                  value={transferRecipient}
                  onChange={(e) => {
                    setTransferRecipient(e.target.value);
                    handleMemberSearch(e.target.value);
                  }}
                  className="pr-8"
                />
                <Search className="absolute right-2 top-2.5 h-4 w-4 text-gray-400" />
              </div>
              
              {searchResults.length > 0 && (
                <div className="mt-2 bg-white border rounded-md max-h-32 overflow-y-auto">
                  {searchResults.map((member) => (
                    <button
                      key={member.id}
                      onClick={() => {
                        setTransferRecipient(`${member.firstName} ${member.lastName}`);
                        setSearchResults([]);
                      }}
                      className="w-full px-3 py-2 text-left hover:bg-gray-50 border-b last:border-0"
                    >
                      <div className="font-medium">{member.firstName} {member.lastName}</div>
                      <div className="text-sm text-gray-500">{member.email}</div>
                    </button>
                  ))}
                </div>
              )}
            </div>
            
            <div>
              <Label htmlFor="amount">Amount (ZAR)</Label>
              <Input
                id="amount"
                type="number"
                placeholder="0.00"
                value={transferAmount}
                onChange={(e) => setTransferAmount(e.target.value)}
              />
            </div>
            
            <div>
              <Label htmlFor="note">Note (Optional)</Label>
              <Textarea
                id="note"
                placeholder="What's this for?"
                value={transferNote}
                onChange={(e) => setTransferNote(e.target.value)}
                rows={2}
              />
            </div>
            
            {transferAmount && (
              <div className="p-3 bg-gray-50 rounded-lg">
                <div className="flex justify-between text-sm">
                  <span>Transfer amount:</span>
                  <span>{formatCurrency(parseFloat(transferAmount) || 0)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Fee:</span>
                  <span>R 0.00</span>
                </div>
                <div className="border-t pt-2 mt-2 flex justify-between font-semibold">
                  <span>Total:</span>
                  <span>{formatCurrency(parseFloat(transferAmount) || 0)}</span>
                </div>
              </div>
            )}
            
            <div className="flex space-x-3">
              <Button
                onClick={handleTransfer}
                disabled={!transferAmount || !transferRecipient || transferMutation.isPending}
                className="flex-1 bg-churpay-gradient text-white"
              >
                {transferMutation.isPending ? (
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Send className="h-4 w-4 mr-2" />
                )}
                {transferMutation.isPending ? 'Sending...' : 'Send Money'}
              </Button>
              <Button variant="outline" onClick={() => setShowTransferModal(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Top Up Modal */}
      <Dialog open={showTopUpModal} onOpenChange={setShowTopUpModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <Plus className="h-5 w-5 mr-2 text-green-600" />
              Top Up Wallet
            </DialogTitle>
            <DialogDescription>
              Add money to your ChurPay wallet using PayFast
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="topup-amount">Amount (ZAR)</Label>
              <Input
                id="topup-amount"
                type="number"
                placeholder="0.00"
                value={topUpAmount}
                onChange={(e) => setTopUpAmount(e.target.value)}
              />
            </div>
            
            <div>
              <Label htmlFor="payment-method">Payment Method</Label>
              <Select value={selectedPaymentMethod} onValueChange={setSelectedPaymentMethod}>
                <SelectTrigger>
                  <SelectValue placeholder="Select payment method" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="card">Credit/Debit Card</SelectItem>
                  <SelectItem value="eft">EFT/Bank Transfer</SelectItem>
                  <SelectItem value="ozow">Ozow</SelectItem>
                  <SelectItem value="snapscan">SnapScan</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {topUpAmount && (
              <div className="p-3 bg-gray-50 rounded-lg">
                <div className="flex justify-between text-sm">
                  <span>Top-up amount:</span>
                  <span>{formatCurrency(parseFloat(topUpAmount) || 0)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Processing fee:</span>
                  <span>R {((parseFloat(topUpAmount) || 0) * 0.039 + 3).toFixed(2)}</span>
                </div>
                <div className="border-t pt-2 mt-2 flex justify-between font-semibold">
                  <span>Total to pay:</span>
                  <span>{formatCurrency((parseFloat(topUpAmount) || 0) + ((parseFloat(topUpAmount) || 0) * 0.039 + 3))}</span>
                </div>
              </div>
            )}
            
            <div className="flex space-x-3">
              <Button
                onClick={handleTopUp}
                disabled={!topUpAmount || !selectedPaymentMethod || topUpMutation.isPending}
                className="flex-1 bg-gradient-to-r from-green-500 to-green-600 text-white"
              >
                {topUpMutation.isPending ? (
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Plus className="h-4 w-4 mr-2" />
                )}
                {topUpMutation.isPending ? 'Processing...' : 'Top Up Now'}
              </Button>
              <Button variant="outline" onClick={() => setShowTopUpModal(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}