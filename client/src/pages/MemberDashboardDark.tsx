import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Wallet, Heart, Church, Target, Gift, Send, Plus, Eye, EyeOff, 
  ArrowDown, ArrowUp, ArrowLeftRight, CheckCircle, Clock, AlertCircle, 
  RefreshCw, Bell, Settings, TrendingUp, Calendar, Users, DollarSign,
  PiggyBank, Star, Award, Activity, CreditCard, Building, Search
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
  createdAt: string;
  status: string;
}

export default function MemberDashboardDark() {
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

  const totalGiven = Array.isArray(donationHistory) ? (donationHistory as DonationHistory[]).reduce((sum: number, donation: DonationHistory) => sum + parseFloat(donation.amount), 0) : 0;
  const totalExpense = totalGiven * 0.85; // Simulate expense calculation

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="flex">
        {/* Sidebar */}
        <div className="w-64 bg-gray-800 min-h-screen p-6">
          <div className="mb-8">
            <h1 className="text-xl font-bold text-white mb-2">FINANCIAL DASHBOARD</h1>
            <div className="flex items-center space-x-2 text-sm text-gray-400">
              <span>UX/UI</span>
              <div className="px-2 py-1 bg-blue-600 text-white text-xs rounded">WEB</div>
            </div>
          </div>
          
          <nav className="space-y-2">
            <div className="flex items-center space-x-3 p-3 bg-purple-600 rounded-lg text-white">
              <div className="w-2 h-6 bg-purple-400 rounded-full"></div>
              <span>Dashboard</span>
            </div>
            <div className="flex items-center space-x-3 p-3 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg cursor-pointer">
              <Building className="h-5 w-5" />
              <span>Documents</span>
            </div>
            <div className="flex items-center space-x-3 p-3 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg cursor-pointer">
              <CreditCard className="h-5 w-5" />
              <span>Payments</span>
            </div>
            <div className="flex items-center space-x-3 p-3 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg cursor-pointer">
              <Calendar className="h-5 w-5" />
              <span>Calendar</span>
            </div>
            <div className="flex items-center space-x-3 p-3 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg cursor-pointer">
              <Users className="h-5 w-5" />
              <span>Profile</span>
            </div>
          </nav>

          <div className="mt-auto pt-8">
            <div className="bg-gray-700 rounded-xl p-4 mb-4">
              <div className="flex items-center mb-3">
                <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center">
                  <Gift className="h-4 w-4 text-black" />
                </div>
              </div>
              <h3 className="font-semibold mb-2">Upgrade to Pro</h3>
              <p className="text-sm text-gray-400 mb-3">Check your usage on this dashboard</p>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center space-x-3 p-3 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg cursor-pointer">
                <Settings className="h-5 w-5" />
                <span>Settings</span>
              </div>
              <div className="flex items-center space-x-3 p-3 text-red-400 hover:text-red-300 hover:bg-gray-700 rounded-lg cursor-pointer">
                <ArrowLeftRight className="h-5 w-5" />
                <span>Logout</span>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Tap here to search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-80 pl-10 bg-gray-800 border-gray-700 text-white placeholder:text-gray-400"
                />
              </div>
              <div className="flex space-x-3">
                <Button className="relative bg-gray-800 hover:bg-gray-700 text-white border-gray-700">
                  <Bell className="h-5 w-5" />
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-purple-500 rounded-full text-xs flex items-center justify-center text-white">3</div>
                </Button>
                <Button className="relative bg-gray-800 hover:bg-gray-700 text-white border-gray-700">
                  <Bell className="h-5 w-5" />
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-purple-500 rounded-full text-xs flex items-center justify-center text-white">5</div>
                </Button>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="font-semibold">Emmy Dansom</p>
                <p className="text-sm text-gray-400">CEO</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                <span className="text-white font-semibold">ED</span>
              </div>
              <div className="flex space-x-2">
                <Button size="sm" className="bg-gray-800 hover:bg-gray-700 text-white">
                  <Users className="h-4 w-4" />
                </Button>
                <Button size="sm" className="bg-gray-800 hover:bg-gray-700 text-white">
                  <Heart className="h-4 w-4" />
                </Button>
                <Button size="sm" className="bg-gray-800 hover:bg-gray-700 text-white">
                  <Settings className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Main Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <Card className="bg-gradient-to-r from-purple-600 to-purple-700 border-0 text-white">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-medium opacity-90 mb-2">Total Finance</h3>
                    <p className="text-3xl font-bold">{formatCurrency(totalGiven)}</p>
                  </div>
                  <div className="relative w-16 h-16">
                    <div className="w-16 h-16 rounded-full border-4 border-purple-400 border-t-white animate-spin opacity-75"></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-sm font-semibold">+70%</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-pink-600 to-pink-700 border-0 text-white">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-medium opacity-90 mb-2">Total Expense</h3>
                    <p className="text-3xl font-bold">{formatCurrency(totalExpense)}</p>
                  </div>
                  <div className="relative w-16 h-16">
                    <div className="w-16 h-16 rounded-full border-4 border-pink-400 border-t-white animate-spin opacity-75"></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-sm font-semibold">+50%</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Charts and Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Chart */}
            <div className="lg:col-span-2 space-y-6">
              <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-white">Monday, 28 December 2021</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="h-64 flex items-end space-x-4 px-4">
                    <div className="flex flex-col items-center space-y-2">
                      <div className="h-32 w-8 bg-gray-600 rounded-t"></div>
                      <span className="text-xs text-gray-400">Mon</span>
                    </div>
                    <div className="flex flex-col items-center space-y-2">
                      <div className="h-40 w-8 bg-gray-600 rounded-t"></div>
                      <span className="text-xs text-gray-400">Tue</span>
                    </div>
                    <div className="flex flex-col items-center space-y-2">
                      <div className="h-48 w-8 bg-purple-600 rounded-t relative">
                        <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-purple-600 text-white px-2 py-1 rounded text-xs">
                          $2057
                        </div>
                      </div>
                      <span className="text-xs text-gray-400">Wed</span>
                    </div>
                    <div className="flex flex-col items-center space-y-2">
                      <div className="h-36 w-8 bg-gray-600 rounded-t"></div>
                      <span className="text-xs text-gray-400">Thu</span>
                    </div>
                    <div className="flex flex-col items-center space-y-2">
                      <div className="h-44 w-8 bg-gray-600 rounded-t"></div>
                      <span className="text-xs text-gray-400">Fri</span>
                    </div>
                    <div className="flex flex-col items-center space-y-2">
                      <div className="h-28 w-8 bg-gray-600 rounded-t"></div>
                      <span className="text-xs text-gray-400">Sat</span>
                    </div>
                    <div className="flex flex-col items-center space-y-2">
                      <div className="h-52 w-8 bg-gray-600 rounded-t"></div>
                      <span className="text-xs text-gray-400">Sun</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Projects Finance Table */}
              <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white">Projects Finance</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center">
                          <span className="text-white text-sm font-semibold">DD</span>
                        </div>
                        <div>
                          <p className="text-white font-medium">Darby Day</p>
                          <p className="text-gray-400 text-sm">Meet the target</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-white font-semibold">$145,000</p>
                        <div className="flex items-center space-x-2">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          <span className="text-gray-400 text-sm">Financial Officer</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                          <span className="text-white text-sm font-semibold">HD</span>
                        </div>
                        <div>
                          <p className="text-white font-medium">Holt Diven</p>
                          <p className="text-gray-400 text-sm">On Going</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-white font-semibold">$289,000</p>
                        <div className="flex items-center space-x-2">
                          <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                          <span className="text-gray-400 text-sm">Project Manager</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              {/* Finance Target */}
              <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white text-sm">Your Finance Target</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-center">
                    <div className="relative w-32 h-32">
                      <svg className="w-32 h-32 transform -rotate-90">
                        <circle
                          cx="64"
                          cy="64"
                          r="56"
                          stroke="currentColor"
                          strokeWidth="8"
                          fill="none"
                          className="text-gray-700"
                        />
                        <circle
                          cx="64"
                          cy="64"
                          r="56"
                          stroke="currentColor"
                          strokeWidth="8"
                          fill="none"
                          strokeDasharray={`${2 * Math.PI * 56}`}
                          strokeDashoffset={`${2 * Math.PI * 56 * (1 - 0.78)}`}
                          className="text-purple-500"
                        />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-2xl font-bold text-white">78%</span>
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 space-y-2">
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                      <span className="text-gray-400 text-sm">Result Achieved</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-gray-600 rounded-full"></div>
                      <span className="text-gray-400 text-sm">In The Process</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* About Section */}
              <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white text-sm">About</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-400 text-sm mb-4">
                    Organized activities to make money and sell goods and services for a profit
                  </p>
                  
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center">
                        <span className="text-white text-xs">JJ</span>
                      </div>
                      <div>
                        <p className="text-white text-sm font-medium">Jonie Juger</p>
                        <p className="text-gray-400 text-xs">Project Manager</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                        <span className="text-white text-xs">SH</span>
                      </div>
                      <div>
                        <p className="text-white text-sm font-medium">Sarah Hosten</p>
                        <p className="text-gray-400 text-xs">Graphic Designer</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
                        <span className="text-white text-xs">DA</span>
                      </div>
                      <div>
                        <p className="text-white text-sm font-medium">Deckard Anne</p>
                        <p className="text-gray-400 text-xs">Financial Treasurer</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Send Money */}
              <Card className="bg-gray-800 border-gray-700">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-white font-semibold mb-1">Send Money</h3>
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                        <span className="text-gray-400 text-sm">Your Card</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-white">$145,000</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Donation Modal */}
      <EnhancedDonationModal
        isOpen={showDonationModal}
        onClose={() => setShowDonationModal(false)}
        type={donationType}
        churches={Array.isArray(churches) ? churches : []}
        projects={Array.isArray(projects) ? projects : []}
        walletBalance={walletData && typeof walletData === 'object' && 'availableBalance' in walletData ? String((walletData as WalletData).availableBalance) : '0'}
      />
    </div>
  );
}