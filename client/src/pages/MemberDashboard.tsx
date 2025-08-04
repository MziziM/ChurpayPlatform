import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

import { 
  Wallet, Heart, Church, Target, Gift, Send, Plus, Eye, EyeOff, 
  ArrowDown, ArrowUp, ArrowLeftRight, CheckCircle, Clock, AlertCircle, 
  RefreshCw, Bell, Settings, TrendingUp, Calendar, Users, DollarSign,
  PiggyBank, Star, Award, Activity, CreditCard, Building
} from 'lucide-react';
import { EnhancedDonationModal } from '@/components/EnhancedDonationModal';

interface WalletData {
  id: string;
  userId: string;
  availableBalance: string;
  pendingBalance: string;
  rewardPoints: string;
  dailyTransferLimit: string;
  monthlyTransferLimit: string;
  isActive: boolean;
  isPinSet: boolean;
  autoTopUpEnabled: boolean;
}

interface WalletTransaction {
  id: string;
  type: string;
  amount: string;
  description: string;
  status: string;
  createdAt: string;
  recipient?: string;
  reference: string;
  currency: string;
}

interface Church {
  id: string;
  name: string;
  description?: string;
  location: string;
  memberCount: number;
  totalDonations: string;
  image?: string;
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
  image?: string;
  status: string;
}

interface DonationHistory {
  id: string;
  amount: string;
  type: 'tithe' | 'donation' | 'project';
  churchName: string;
  projectTitle?: string;
  date: string;
  status: string;
}

export default function MemberDashboard() {
  const [showBalance, setShowBalance] = useState(true);
  const [showDonationModal, setShowDonationModal] = useState(false);
  const [donationType, setDonationType] = useState<'donation' | 'tithe' | 'project' | 'topup'>('donation');
  const [searchQuery, setSearchQuery] = useState('');
  
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  // Fetch wallet data
  const { data: walletData, isLoading: walletLoading } = useQuery({
    queryKey: ['/api/wallet'],
    retry: false,
  });
  
  // Fetch recent transactions
  const { data: transactions = [], isLoading: transactionsLoading } = useQuery({
    queryKey: ['/api/wallet/transactions'],
    retry: false,
  });
  
  // Fetch churches
  const { data: churches = [], isLoading: churchesLoading } = useQuery({
    queryKey: ['/api/churches'],
    retry: false,
  });
  
  // Fetch projects
  const { data: projects = [], isLoading: projectsLoading } = useQuery({
    queryKey: ['/api/projects'],
    retry: false,
  });
  
  // Fetch donation history
  const { data: donationHistory = [], isLoading: donationLoading } = useQuery({
    queryKey: ['/api/donations/history'],
    retry: false,
  });





  const formatCurrency = (amount: string | number) => {
    const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
    return `R ${Math.abs(numAmount).toLocaleString('en-ZA', { minimumFractionDigits: 2 })}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-ZA', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'deposit': return <ArrowDown className="h-4 w-4 text-green-600" />;
      case 'withdrawal': return <ArrowUp className="h-4 w-4 text-red-600" />;
      case 'donation': return <Heart className="h-4 w-4 text-purple-600" />;
      case 'tithe': return <Church className="h-4 w-4 text-blue-600" />;
      case 'project': return <Target className="h-4 w-4 text-orange-600" />;
      case 'reward': return <Gift className="h-4 w-4 text-yellow-600" />;
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





  // Show loading state
  if (walletLoading || churchesLoading || projectsLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-yellow-50 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-purple-600" />
          <p className="text-gray-600">Loading dashboard...</p>
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
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-churpay-gradient rounded-lg flex items-center justify-center">
                  <Wallet className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h1 className="text-lg font-bold bg-churpay-gradient bg-clip-text text-transparent">
                    ChurPay Member
                  </h1>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm" className="relative">
                <Bell className="h-5 w-5" />
                <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </Button>

              <div className="hidden sm:flex items-center space-x-2 px-3 py-2 bg-gradient-to-r from-green-50 to-green-100 rounded-lg">
                <Wallet className="h-4 w-4 text-green-600" />
                <span className="text-sm font-medium text-green-800">
                  {showBalance ? (walletData ? formatCurrency(walletData.availableBalance) : 'R 0.00') : '****'}
                </span>
              </div>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowBalance(!showBalance)}
              >
                {showBalance ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-white/20 relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 to-yellow-500/5"></div>
            <div className="relative">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-1">Financial Dashboard</h2>
                  <p className="text-gray-600">Real-time account metrics</p>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                    Active
                  </Badge>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Balance Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white border-0 shadow-xl">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium opacity-90 flex items-center">
                  <Wallet className="h-4 w-4 mr-2" />
                  Available Balance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-3xl font-bold">
                      {showBalance ? (walletData ? formatCurrency((walletData as WalletData).availableBalance) : 'R 0.00') : '****'}
                    </p>
                    <p className="text-sm opacity-75 mt-1">Available now</p>
                  </div>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => {
                      setDonationType('topup');
                      setShowDonationModal(true);
                    }}
                    className="bg-white/20 hover:bg-white/30 text-white border-0"
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Top Up
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <Card className="bg-gradient-to-br from-yellow-500 to-yellow-600 text-white border-0 shadow-xl">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium opacity-90 flex items-center">
                  <Gift className="h-4 w-4 mr-2" />
                  Reward Points
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-3xl font-bold">
                      {showBalance ? (walletData ? formatCurrency((walletData as WalletData).rewardPoints) : 'R 0.00') : '****'}
                    </p>
                    <p className="text-sm opacity-75 mt-1">Points earned</p>
                  </div>
                  <Star className="h-8 w-8 opacity-50" />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0 shadow-xl">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium opacity-90 flex items-center">
                  <TrendingUp className="h-4 w-4 mr-2" />
                  Monthly Giving
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-3xl font-bold">
                      {donationHistory.reduce((sum, donation) => {
                        const donationDate = new Date(donation.createdAt);
                        const now = new Date();
                        const isThisMonth = donationDate.getMonth() === now.getMonth() && donationDate.getFullYear() === now.getFullYear();
                        return isThisMonth ? sum + parseFloat(donation.amount) : sum;
                      }, 0).toLocaleString('en-ZA', { style: 'currency', currency: 'ZAR' })}
                    </p>
                    <p className="text-sm opacity-75 mt-1">This month</p>
                  </div>
                  <Award className="h-8 w-8 opacity-50" />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Transaction Center</h3>
            <div className="text-sm text-gray-500">
              Daily limit: R {walletData ? formatCurrency((walletData as WalletData).dailyTransferLimit) : '5,000.00'}
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button 
              onClick={() => {
                setDonationType('donation');
                setShowDonationModal(true);
              }}
              className="h-20 flex flex-col items-center justify-center space-y-2 bg-gradient-to-r from-purple-500 to-purple-600 text-white hover:from-purple-600 hover:to-purple-700"
            >
              <Heart className="h-6 w-6" />
              <span className="text-sm font-medium">Give</span>
            </Button>

            <Button 
              onClick={() => {
                setDonationType('tithe');
                setShowDonationModal(true);
              }}
              className="h-20 flex flex-col items-center justify-center space-y-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700"
            >
              <Church className="h-6 w-6" />
              <span className="text-sm font-medium">Tithe</span>
            </Button>

            <Button 
              onClick={() => {
                setDonationType('project');
                setShowDonationModal(true);
              }}
              className="h-20 flex flex-col items-center justify-center space-y-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white hover:from-orange-600 hover:to-orange-700"
            >
              <Target className="h-6 w-6" />
              <span className="text-sm font-medium">Sponsor</span>
            </Button>

            <Button 
              onClick={() => {
                setDonationType('topup');
                setShowDonationModal(true);
              }}
              className="h-20 flex flex-col items-center justify-center space-y-2 bg-gradient-to-r from-green-500 to-green-600 text-white hover:from-green-600 hover:to-green-700"
            >
              <Plus className="h-6 w-6" />
              <span className="text-sm font-medium">Top Up</span>
            </Button>
          </div>
        </div>

        {/* Analytics Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-white/60 backdrop-blur-sm border-l-4 border-l-purple-500">
            <CardContent className="p-4">
              <div className="flex items-center">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <TrendingUp className="h-5 w-5 text-purple-600" />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-600">Total Given</p>
                  <p className="text-xl font-bold text-gray-900">
                    {(donationHistory as DonationHistory[]).reduce((sum: number, donation: DonationHistory) => sum + parseFloat(donation.amount), 0).toLocaleString('en-ZA', { style: 'currency', currency: 'ZAR' })}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-white/60 backdrop-blur-sm border-l-4 border-l-blue-500">
            <CardContent className="p-4">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Calendar className="h-5 w-5 text-blue-600" />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-600">Avg Monthly</p>
                  <p className="text-xl font-bold text-gray-900">
                    R {Math.round((donationHistory as DonationHistory[]).reduce((sum: number, donation: DonationHistory) => sum + parseFloat(donation.amount), 0) / Math.max(1, new Set((donationHistory as DonationHistory[]).map((d: DonationHistory) => new Date(d.createdAt).getMonth())).size)).toLocaleString()}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-white/60 backdrop-blur-sm border-l-4 border-l-green-500">
            <CardContent className="p-4">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Users className="h-5 w-5 text-green-600" />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-600">Churches</p>
                  <p className="text-xl font-bold text-gray-900">{(churches as Church[]).length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-white/60 backdrop-blur-sm border-l-4 border-l-orange-500">
            <CardContent className="p-4">
              <div className="flex items-center">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <Target className="h-5 w-5 text-orange-600" />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-600">Projects</p>
                  <p className="text-xl font-bold text-gray-900">{(projects as Project[]).length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Left Column - Transactions */}
          <div className="xl:col-span-2 space-y-6">
            <Card className="bg-white/60 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Activity className="h-5 w-5 mr-2" />
                  Recent Transactions
                </CardTitle>
              </CardHeader>
              <CardContent>
                {(transactions as WalletTransaction[]).length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Activity className="h-12 w-12 mx-auto mb-4 opacity-20" />
                    <p>No recent activity</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {(transactions as WalletTransaction[]).slice(0, 5).map((transaction: WalletTransaction) => (
                      <div key={transaction.id} className="flex items-center justify-between p-3 rounded-lg border border-gray-100">
                        <div className="flex items-center space-x-3">
                          {getTransactionIcon(transaction.type)}
                          <div>
                            <p className="font-medium text-gray-900">{transaction.description}</p>
                            <p className="text-sm text-gray-500">{formatDate(transaction.createdAt)}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className={`font-medium ${
                            transaction.type === 'deposit' ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {transaction.type === 'deposit' ? '+' : '-'}{formatCurrency(transaction.amount)}
                          </span>
                          {getStatusIcon(transaction.status)}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Quick Info */}
          <div className="space-y-6">
            {/* Account Health */}
            <Card className="bg-white/60 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center text-sm">
                  <Settings className="h-4 w-4 mr-2" />
                  Account Health
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Verification</span>
                  <Badge className="bg-green-500">Verified</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">PIN Status</span>
                  <Badge variant={walletData && (walletData as WalletData).isPinSet ? "default" : "secondary"}>
                    {walletData && (walletData as WalletData).isPinSet ? "Set" : "Not Set"}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Auto Top-up</span>
                  <Badge variant={walletData && (walletData as WalletData).autoTopUpEnabled ? "default" : "outline"}>
                    {walletData && (walletData as WalletData).autoTopUpEnabled ? "On" : "Off"}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card className="bg-white/60 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center text-sm">
                  <Activity className="h-4 w-4 mr-2" />
                  Quick Stats
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">This Week</span>
                  <span className="font-medium">
                    {(donationHistory as DonationHistory[]).filter((d: DonationHistory) => {
                      const donationDate = new Date(d.createdAt);
                      const weekAgo = new Date();
                      weekAgo.setDate(weekAgo.getDate() - 7);
                      return donationDate >= weekAgo;
                    }).reduce((sum: number, d: DonationHistory) => sum + parseFloat(d.amount), 0).toLocaleString('en-ZA', { style: 'currency', currency: 'ZAR' })}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Transactions</span>
                  <span className="font-medium">{(donationHistory as DonationHistory[]).length}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Largest Gift</span>
                  <span className="font-medium">
                    {(donationHistory as DonationHistory[]).length > 0 ? 
                      Math.max(...(donationHistory as DonationHistory[]).map((d: DonationHistory) => parseFloat(d.amount))).toLocaleString('en-ZA', { style: 'currency', currency: 'ZAR' }) : 
                      'R 0.00'}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Bottom Section - Churches & Projects */}
        <div className="mt-8 space-y-8">
          {/* Churches */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Connected Churches</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {(churches as Church[]).map((church: Church) => (
                <Card key={church.id} className="bg-white/60 backdrop-blur-sm hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-churpay-gradient rounded-lg flex items-center justify-center">
                        <Church className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{church.name}</CardTitle>
                        <p className="text-sm text-gray-600">{church.location}</p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Members:</span>
                        <span className="font-medium">{church.memberCount.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Total Donations:</span>
                        <span className="font-medium text-green-600">{formatCurrency(church.totalDonations)}</span>
                      </div>
                      <Button 
                        onClick={() => {
                          setDonationType('donation');
                          setShowDonationModal(true);
                        }}
                        className="w-full bg-churpay-gradient text-white"
                      >
                        <Heart className="h-4 w-4 mr-2" />
                        Donate
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

          {/* Projects */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {(projects as Project[]).map((project: Project) => (
                <Card key={project.id} className="bg-white/60 backdrop-blur-sm hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{project.title}</CardTitle>
                      <Badge variant="secondary">{project.category}</Badge>
                    </div>
                    <p className="text-sm text-gray-600">{project.churchName}</p>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <p className="text-sm text-gray-700">{project.description}</p>
                      
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Progress</span>
                          <span>{Math.round((parseFloat(project.currentAmount) / parseFloat(project.targetAmount)) * 100)}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-churpay-gradient h-2 rounded-full transition-all duration-300"
                            style={{ width: `${Math.min((parseFloat(project.currentAmount) / parseFloat(project.targetAmount)) * 100, 100)}%` }}
                          ></div>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Raised: {formatCurrency(project.currentAmount)}</span>
                          <span className="text-gray-600">Goal: {formatCurrency(project.targetAmount)}</span>
                        </div>
                      </div>

                      <Button 
                        onClick={() => {
                          setDonationType('project');
                          setShowDonationModal(true);
                        }}
                        className="w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white"
                      >
                        <Target className="h-4 w-4 mr-2" />
                        Support
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

          {/* Giving History */}
            <Card className="bg-white/60 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Calendar className="h-5 w-5 mr-2" />
                  Giving History
                </CardTitle>
              </CardHeader>
              <CardContent>
                {(donationHistory as DonationHistory[]).length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Heart className="h-12 w-12 mx-auto mb-4 opacity-20" />
                    <p>No donations yet</p>
                    <p className="text-sm">Your giving history will appear here</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {(donationHistory as DonationHistory[]).map((donation: DonationHistory) => (
                      <div key={donation.id} className="flex items-center justify-between p-3 rounded-lg border border-gray-100">
                        <div className="flex items-center space-x-3">
                          {getTransactionIcon(donation.type)}
                          <div>
                            <p className="font-medium text-gray-900">
                              {donation.type === 'tithe' ? 'Tithe' : 
                               donation.type === 'project' ? `Project: ${donation.projectTitle}` : 'Donation'}
                            </p>
                            <p className="text-sm text-gray-500">{donation.churchName}</p>
                            <p className="text-xs text-gray-400">{formatDate(donation.date)}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="font-medium text-purple-600">{formatCurrency(donation.amount)}</span>
                          {getStatusIcon(donation.status)}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Enhanced Donation Modal (unified for all types) */}
        <EnhancedDonationModal
          isOpen={showDonationModal}
          onClose={() => setShowDonationModal(false)}
          type={donationType}
          churches={churches as Church[]}
          projects={projects as Project[]}
          walletBalance={walletData ? parseFloat(walletData.availableBalance) : 0}
        />


      </main>
    </div>
  );
}