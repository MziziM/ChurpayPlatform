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
  PiggyBank, Star, Award, Activity, CreditCard, Building, Search,
  MoreVertical, ChevronRight
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

  const totalGiven = Array.isArray(donationHistory) ? (donationHistory as DonationHistory[]).reduce((sum: number, donation: DonationHistory) => sum + parseFloat(donation.amount), 0) : 0;
  const totalExpense = totalGiven * 0.85; // Simulate expense calculation

  return (
    <div className="min-h-screen bg-slate-900" style={{background: 'linear-gradient(135deg, #1e293b 0%, #374151 50%, #7c3aed 100%)'}}>
      {/* Top Header */}
      <div className="bg-slate-800/90 backdrop-blur-sm border-b border-slate-700/50 px-8 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-8">
            <h1 className="text-white text-xl font-bold tracking-wide">FINANCIAL DASHBOARD</h1>
            <div className="hidden md:flex items-center space-x-4 text-sm text-slate-400">
              <span className="border-r border-slate-600 pr-4">UX/UI</span>
              <div className="px-3 py-1 bg-blue-600 text-white text-xs rounded font-medium">WEB</div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex">
        {/* Sidebar */}
        <div className="w-64 bg-slate-800/60 backdrop-blur-sm min-h-screen p-6 border-r border-slate-700/50">
          <nav className="space-y-2">
            <div className="flex items-center space-x-3 p-3 bg-violet-600 rounded-xl text-white shadow-lg">
              <div className="w-2 h-6 bg-violet-400 rounded-full"></div>
              <span className="font-medium">Dashboard</span>
            </div>
            <div className="flex items-center space-x-3 p-3 text-slate-300 hover:text-white hover:bg-slate-700/50 rounded-xl cursor-pointer transition-all">
              <Building className="h-5 w-5" />
              <span>Documents</span>
            </div>
            <div className="flex items-center space-x-3 p-3 text-slate-300 hover:text-white hover:bg-slate-700/50 rounded-xl cursor-pointer transition-all">
              <CreditCard className="h-5 w-5" />
              <span>Payments</span>
            </div>
            <div className="flex items-center space-x-3 p-3 text-slate-300 hover:text-white hover:bg-slate-700/50 rounded-xl cursor-pointer transition-all">
              <Calendar className="h-5 w-5" />
              <span>Calendar</span>
            </div>
            <div className="flex items-center space-x-3 p-3 text-slate-300 hover:text-white hover:bg-slate-700/50 rounded-xl cursor-pointer transition-all">
              <Users className="h-5 w-5" />
              <span>Profile</span>
            </div>
          </nav>

          <div className="mt-12 space-y-4">
            <div className="bg-slate-700/50 backdrop-blur-sm rounded-2xl p-4 border border-slate-600/30">
              <div className="flex items-center mb-3">
                <div className="w-10 h-10 bg-violet-500 rounded-full flex items-center justify-center">
                  <Gift className="h-5 w-5 text-white" />
                </div>
              </div>
              <h3 className="text-white font-semibold mb-2">Upgrade to Pro</h3>
              <p className="text-slate-400 text-sm mb-3">Check your usage on this dashboard</p>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center space-x-3 p-3 text-slate-300 hover:text-white hover:bg-slate-700/50 rounded-xl cursor-pointer transition-all">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm">Darkmode</span>
              </div>
              <div className="flex items-center space-x-3 p-3 text-slate-300 hover:text-white hover:bg-slate-700/50 rounded-xl cursor-pointer transition-all">
                <Settings className="h-5 w-5" />
                <span>Settings</span>
              </div>
              <div className="flex items-center space-x-3 p-3 text-red-400 hover:text-red-300 hover:bg-slate-700/50 rounded-xl cursor-pointer transition-all">
                <ArrowLeftRight className="h-5 w-5" />
                <span>Logout</span>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-8">
          {/* Search and Profile Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Tap here to search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-96 pl-12 bg-slate-800/60 border-slate-700/50 text-white placeholder:text-slate-400 rounded-2xl backdrop-blur-sm"
                />
              </div>
              <div className="flex space-x-3">
                <Button className="relative bg-slate-800/60 hover:bg-slate-700/60 text-white border-slate-700/50 rounded-xl backdrop-blur-sm">
                  <Bell className="h-5 w-5" />
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-violet-500 rounded-full text-xs flex items-center justify-center text-white font-medium">3</div>
                </Button>
                <Button className="relative bg-slate-800/60 hover:bg-slate-700/60 text-white border-slate-700/50 rounded-xl backdrop-blur-sm">
                  <Bell className="h-5 w-5" />
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-violet-500 rounded-full text-xs flex items-center justify-center text-white font-medium">5</div>
                </Button>
              </div>
            </div>
            
            <div className="flex items-center space-x-6">
              <div className="text-right">
                <p className="text-white font-semibold">Emmy Dansom</p>
                <p className="text-slate-400 text-sm">CEO</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-r from-violet-500 to-purple-500 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-lg">ED</span>
              </div>
              <div className="flex space-x-2">
                <Button 
                  size="sm" 
                  className="bg-violet-600/80 hover:bg-violet-600 text-white rounded-xl"
                  onClick={() => {
                    setDonationType('donation');
                    setShowDonationModal(true);
                  }}
                >
                  <Users className="h-4 w-4" />
                </Button>
                <Button 
                  size="sm" 
                  className="bg-violet-600/80 hover:bg-violet-600 text-white rounded-xl"
                  onClick={() => {
                    setDonationType('tithe');
                    setShowDonationModal(true);
                  }}
                >
                  <Heart className="h-4 w-4" />
                </Button>
                <Button 
                  size="sm" 
                  className="bg-violet-600/80 hover:bg-violet-600 text-white rounded-xl"
                  onClick={() => {
                    setDonationType('topup');
                    setShowDonationModal(true);
                  }}
                >
                  <Settings className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Main Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <Card className="bg-gradient-to-r from-violet-600 to-violet-700 border-0 text-white rounded-2xl shadow-xl">
              <CardContent className="p-8">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-medium opacity-90 mb-3">Total Finance</h3>
                    <p className="text-4xl font-bold">{formatCurrency(totalGiven)}</p>
                  </div>
                  <div className="relative w-20 h-20">
                    <svg className="w-20 h-20 transform -rotate-90">
                      <circle
                        cx="40"
                        cy="40"
                        r="32"
                        stroke="currentColor"
                        strokeWidth="6"
                        fill="none"
                        className="text-violet-400/30"
                      />
                      <circle
                        cx="40"
                        cy="40"
                        r="32"
                        stroke="currentColor"
                        strokeWidth="6"
                        fill="none"
                        strokeDasharray={`${2 * Math.PI * 32}`}
                        strokeDashoffset={`${2 * Math.PI * 32 * (1 - 0.70)}`}
                        className="text-white"
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-sm font-bold">+70%</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-purple-600 to-pink-600 border-0 text-white rounded-2xl shadow-xl">
              <CardContent className="p-8">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-medium opacity-90 mb-3">Total Expense</h3>
                    <p className="text-4xl font-bold">{formatCurrency(totalExpense)}</p>
                  </div>
                  <div className="relative w-20 h-20">
                    <svg className="w-20 h-20 transform -rotate-90">
                      <circle
                        cx="40"
                        cy="40"
                        r="32"
                        stroke="currentColor"
                        strokeWidth="6"
                        fill="none"
                        className="text-purple-400/30"
                      />
                      <circle
                        cx="40"
                        cy="40"
                        r="32"
                        stroke="currentColor"
                        strokeWidth="6"
                        fill="none"
                        strokeDasharray={`${2 * Math.PI * 32}`}
                        strokeDashoffset={`${2 * Math.PI * 32 * (1 - 0.50)}`}
                        className="text-white"
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-sm font-bold">+50%</span>
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
              <Card className="bg-slate-800/40 border-slate-700/50 rounded-2xl backdrop-blur-sm">
                <CardHeader className="pb-4">
                  <CardTitle className="text-white">Monday, 28 December 2021</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64 flex items-end justify-center space-x-8 px-4">
                    <div className="flex flex-col items-center space-y-3">
                      <div className="h-20 w-10 bg-slate-700 rounded-t-lg"></div>
                      <span className="text-xs text-slate-400 font-medium">Mon</span>
                    </div>
                    <div className="flex flex-col items-center space-y-3">
                      <div className="h-32 w-10 bg-slate-700 rounded-t-lg"></div>
                      <span className="text-xs text-slate-400 font-medium">Tue</span>
                    </div>
                    <div className="flex flex-col items-center space-y-3">
                      <div className="h-40 w-10 bg-violet-600 rounded-t-lg relative shadow-lg">
                        <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-violet-600 text-white px-3 py-1 rounded-lg text-xs font-semibold">
                          $2057
                        </div>
                        <div className="absolute top-2 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-white rounded-full"></div>
                      </div>
                      <span className="text-xs text-slate-400 font-medium">Wed</span>
                    </div>
                    <div className="flex flex-col items-center space-y-3">
                      <div className="h-28 w-10 bg-slate-700 rounded-t-lg"></div>
                      <span className="text-xs text-slate-400 font-medium">Thu</span>
                    </div>
                    <div className="flex flex-col items-center space-y-3">
                      <div className="h-36 w-10 bg-slate-700 rounded-t-lg"></div>
                      <span className="text-xs text-slate-400 font-medium">Fri</span>
                    </div>
                    <div className="flex flex-col items-center space-y-3">
                      <div className="h-24 w-10 bg-slate-700 rounded-t-lg"></div>
                      <span className="text-xs text-slate-400 font-medium">Sat</span>
                    </div>
                    <div className="flex flex-col items-center space-y-3">
                      <div className="h-44 w-10 bg-slate-700 rounded-t-lg"></div>
                      <span className="text-xs text-slate-400 font-medium">Sun</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Projects Finance Table */}
              <Card className="bg-slate-800/40 border-slate-700/50 rounded-2xl backdrop-blur-sm">
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="text-white">Projects Finance</CardTitle>
                  <Button variant="ghost" className="text-violet-400 hover:text-violet-300">
                    View all
                  </Button>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-slate-700/30 rounded-xl border border-slate-600/30">
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center">
                          <span className="text-white font-semibold">DD</span>
                        </div>
                        <div>
                          <p className="text-white font-semibold">Darby Day</p>
                          <p className="text-slate-400 text-sm">Meet the target</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="text-right">
                          <p className="text-white font-bold text-lg">$145,000</p>
                          <div className="flex items-center space-x-2">
                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                            <span className="text-slate-400 text-sm">Financial Officer</span>
                          </div>
                        </div>
                        <Button variant="ghost" size="sm" className="text-slate-400 hover:text-white">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between p-4 bg-slate-700/30 rounded-xl border border-slate-600/30">
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                          <span className="text-white font-semibold">HD</span>
                        </div>
                        <div>
                          <p className="text-white font-semibold">Holt Diven</p>
                          <p className="text-slate-400 text-sm">On Going</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="text-right">
                          <p className="text-white font-bold text-lg">$289,000</p>
                          <div className="flex items-center space-x-2">
                            <div className="w-2 h-2 bg-violet-500 rounded-full"></div>
                            <span className="text-slate-400 text-sm">Project Manager</span>
                          </div>
                        </div>
                        <Button variant="ghost" size="sm" className="text-slate-400 hover:text-white">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              {/* Finance Target */}
              <Card className="bg-slate-800/40 border-slate-700/50 rounded-2xl backdrop-blur-sm">
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="text-white text-lg">Your Finance Target</CardTitle>
                  <Button variant="ghost" size="sm" className="text-slate-400 hover:text-white">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </CardHeader>
                <CardContent className="text-center">
                  <div className="relative w-32 h-32 mx-auto mb-6">
                    <svg className="w-32 h-32 transform -rotate-90">
                      <circle
                        cx="64"
                        cy="64"
                        r="56"
                        stroke="currentColor"
                        strokeWidth="8"
                        fill="none"
                        className="text-slate-700"
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
                        className="text-violet-500"
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-3xl font-bold text-white">78%</span>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center justify-center space-x-2">
                      <div className="w-3 h-3 bg-violet-500 rounded-full"></div>
                      <span className="text-slate-300 text-sm">Result Achieved</span>
                    </div>
                    <p className="text-slate-400 text-xs">Achieved well and smoothly</p>
                    <div className="flex items-center justify-center space-x-2">
                      <div className="w-3 h-3 bg-slate-600 rounded-full"></div>
                      <span className="text-slate-300 text-sm">In The Process</span>
                    </div>
                    <p className="text-slate-400 text-xs">Waiting to target process</p>
                  </div>
                </CardContent>
              </Card>

              {/* About Section */}
              <Card className="bg-slate-800/40 border-slate-700/50 rounded-2xl backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-white text-lg">About</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-slate-400 text-sm mb-6">
                    Organised activities to make money and sell goods and services for a profit
                  </p>
                  
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-full overflow-hidden">
                        <div className="w-full h-full bg-orange-500 flex items-center justify-center">
                          <span className="text-white font-semibold text-sm">JJ</span>
                        </div>
                      </div>
                      <div>
                        <p className="text-white font-medium">Jonie Juger</p>
                        <p className="text-slate-400 text-sm">Project Manager</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-full overflow-hidden">
                        <div className="w-full h-full bg-green-500 flex items-center justify-center">
                          <span className="text-white font-semibold text-sm">SH</span>
                        </div>
                      </div>
                      <div>
                        <p className="text-white font-medium">Sarah Hosten</p>
                        <p className="text-slate-400 text-sm">Graphic Designer</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-full overflow-hidden">
                        <div className="w-full h-full bg-violet-500 flex items-center justify-center">
                          <span className="text-white font-semibold text-sm">DA</span>
                        </div>
                      </div>
                      <div>
                        <p className="text-white font-medium">Deckard Anne</p>
                        <p className="text-slate-400 text-sm">Financial Treasurer</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Send Money Card */}
              <Card className="bg-slate-800/40 border-slate-700/50 rounded-2xl backdrop-blur-sm">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-3 h-3 bg-violet-500 rounded-full"></div>
                      <div>
                        <h3 className="text-white font-semibold">Send Money</h3>
                        <p className="text-slate-400 text-sm">Your Card</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-white font-bold text-2xl">$145,000</p>
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