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
  MoreVertical, ChevronRight, FileText, User
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
  const totalExpense = totalGiven * 0.85;

  return (
    <div className="min-h-screen" style={{background: 'linear-gradient(135deg, #2d1b69 0%, #11101d 100%)'}}>
      {/* Top Navigation Bar */}
      <div className="bg-gray-900/90 backdrop-blur-sm border-b border-gray-800 px-8 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-6">
            <h1 className="text-white text-lg font-bold tracking-wider">FINANCIAL DASHBOARD</h1>
            <div className="flex items-center space-x-3 text-sm text-gray-400">
              <span>UX/UI</span>
              <div className="px-2 py-1 bg-blue-600 text-white text-xs rounded">WEB</div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex h-screen">
        {/* Left Sidebar */}
        <div className="w-48 bg-gray-900/50 backdrop-blur-sm p-4">
          <nav className="space-y-1">
            <div className="flex items-center space-x-3 p-3 bg-purple-600 rounded-lg text-white">
              <div className="w-1 h-5 bg-purple-300 rounded-full"></div>
              <span className="text-sm font-medium">Dashboard</span>
            </div>
            <div className="flex items-center space-x-3 p-3 text-gray-400 hover:text-white hover:bg-gray-800/50 rounded-lg cursor-pointer">
              <FileText className="h-4 w-4" />
              <span className="text-sm">Documents</span>
            </div>
            <div className="flex items-center space-x-3 p-3 text-gray-400 hover:text-white hover:bg-gray-800/50 rounded-lg cursor-pointer">
              <CreditCard className="h-4 w-4" />
              <span className="text-sm">Payments</span>
            </div>
            <div className="flex items-center space-x-3 p-3 text-gray-400 hover:text-white hover:bg-gray-800/50 rounded-lg cursor-pointer">
              <Calendar className="h-4 w-4" />
              <span className="text-sm">Calendar</span>
            </div>
            <div className="flex items-center space-x-3 p-3 text-gray-400 hover:text-white hover:bg-gray-800/50 rounded-lg cursor-pointer">
              <User className="h-4 w-4" />
              <span className="text-sm">Profile</span>
            </div>
          </nav>

          {/* Bottom Section */}
          <div className="mt-auto pt-8 space-y-3">
            <div className="bg-gray-800/50 rounded-xl p-3">
              <div className="flex items-center mb-2">
                <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
                  <Gift className="h-4 w-4 text-white" />
                </div>
              </div>
              <h3 className="text-white text-sm font-semibold">Upgrade to Pro</h3>
              <p className="text-gray-400 text-xs">Check your usage on this dashboard</p>
            </div>
            
            <div className="space-y-1">
              <div className="flex items-center space-x-3 p-2 text-gray-400 hover:text-white hover:bg-gray-800/50 rounded-lg cursor-pointer">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-xs">Darkmode</span>
              </div>
              <div className="flex items-center space-x-3 p-2 text-gray-400 hover:text-white hover:bg-gray-800/50 rounded-lg cursor-pointer">
                <Settings className="h-4 w-4" />
                <span className="text-xs">Settings</span>
              </div>
              <div className="flex items-center space-x-3 p-2 text-red-400 hover:text-red-300 hover:bg-gray-800/50 rounded-lg cursor-pointer">
                <ArrowLeftRight className="h-4 w-4" />
                <span className="text-xs">Logout</span>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-6">
          {/* Top Section with Search and Profile */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              {/* Search Bar */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Tap here to search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-80 pl-10 bg-gray-800/60 border-gray-700/50 text-white placeholder:text-gray-400 rounded-xl"
                />
              </div>
              
              {/* Notification Buttons */}
              <div className="flex space-x-2">
                <Button className="relative bg-gray-800/60 hover:bg-gray-700/60 text-white border-gray-700/50 rounded-xl w-10 h-10 p-0">
                  <Bell className="h-4 w-4" />
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-purple-500 rounded-full text-xs flex items-center justify-center text-white">3</div>
                </Button>
                <Button className="relative bg-gray-800/60 hover:bg-gray-700/60 text-white border-gray-700/50 rounded-xl w-10 h-10 p-0">
                  <Bell className="h-4 w-4" />
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-purple-500 rounded-full text-xs flex items-center justify-center text-white">5</div>
                </Button>
              </div>
            </div>
            
            {/* Profile Section */}
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-white font-semibold text-sm">Emmy Dansom</p>
                <p className="text-gray-400 text-xs">CEO</p>
              </div>
              <div className="w-10 h-10 rounded-full overflow-hidden">
                <img src="https://images.unsplash.com/photo-1494790108755-2616b152547b?w=100&h=100&fit=crop&crop=face" alt="Profile" className="w-full h-full object-cover" />
              </div>
              <div className="flex space-x-1">
                <Button 
                  size="sm" 
                  className="bg-purple-600/80 hover:bg-purple-600 text-white rounded-lg w-8 h-8 p-0"
                  onClick={() => {
                    setDonationType('donation');
                    setShowDonationModal(true);
                  }}
                >
                  <Users className="h-3 w-3" />
                </Button>
                <Button 
                  size="sm" 
                  className="bg-purple-600/80 hover:bg-purple-600 text-white rounded-lg w-8 h-8 p-0"
                  onClick={() => {
                    setDonationType('tithe');
                    setShowDonationModal(true);
                  }}
                >
                  <Heart className="h-3 w-3" />
                </Button>
                <Button 
                  size="sm" 
                  className="bg-purple-600/80 hover:bg-purple-600 text-white rounded-lg w-8 h-8 p-0"
                  onClick={() => {
                    setDonationType('topup');
                    setShowDonationModal(true);
                  }}
                >
                  <Settings className="h-3 w-3" />
                </Button>
              </div>
            </div>
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-12 gap-4">
            {/* Top Stats Cards */}
            <div className="col-span-4">
              <Card className="bg-gradient-to-br from-purple-600 to-purple-700 border-0 text-white rounded-xl">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs opacity-80 mb-1">Total Finance</p>
                      <p className="text-2xl font-bold">9,900k</p>
                    </div>
                    <div className="relative w-12 h-12">
                      <svg className="w-12 h-12 transform -rotate-90">
                        <circle cx="24" cy="24" r="20" stroke="currentColor" strokeWidth="3" fill="none" className="text-purple-400/30" />
                        <circle cx="24" cy="24" r="20" stroke="currentColor" strokeWidth="3" fill="none" strokeDasharray={`${2 * Math.PI * 20}`} strokeDashoffset={`${2 * Math.PI * 20 * (1 - 0.70)}`} className="text-white" />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-xs font-bold">+70%</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="col-span-4">
              <Card className="bg-gradient-to-br from-pink-600 to-purple-600 border-0 text-white rounded-xl">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs opacity-80 mb-1">Total Expense</p>
                      <p className="text-2xl font-bold">8,240k</p>
                    </div>
                    <div className="relative w-12 h-12">
                      <svg className="w-12 h-12 transform -rotate-90">
                        <circle cx="24" cy="24" r="20" stroke="currentColor" strokeWidth="3" fill="none" className="text-pink-400/30" />
                        <circle cx="24" cy="24" r="20" stroke="currentColor" strokeWidth="3" fill="none" strokeDasharray={`${2 * Math.PI * 20}`} strokeDashoffset={`${2 * Math.PI * 20 * (1 - 0.50)}`} className="text-white" />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-xs font-bold">+50%</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Finance Target */}
            <div className="col-span-4 row-span-2">
              <Card className="bg-gray-800/40 border-gray-700/50 rounded-xl h-full">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-white text-sm">Your Finance Target</CardTitle>
                  <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white p-1">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </CardHeader>
                <CardContent className="flex flex-col items-center pt-2">
                  <div className="relative w-24 h-24 mb-4">
                    <svg className="w-24 h-24 transform -rotate-90">
                      <circle cx="48" cy="48" r="40" stroke="currentColor" strokeWidth="6" fill="none" className="text-gray-700" />
                      <circle cx="48" cy="48" r="40" stroke="currentColor" strokeWidth="6" fill="none" strokeDasharray={`${2 * Math.PI * 40}`} strokeDashoffset={`${2 * Math.PI * 40 * (1 - 0.78)}`} className="text-purple-500" />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-2xl font-bold text-white">78%</span>
                    </div>
                  </div>
                  <div className="space-y-2 text-center">
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                      <span className="text-gray-300 text-xs">Result Achieved</span>
                    </div>
                    <p className="text-gray-500 text-xs">Achieved well and smoothly</p>
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-gray-600 rounded-full"></div>
                      <span className="text-gray-300 text-xs">In The Process</span>
                    </div>
                    <p className="text-gray-500 text-xs">Waiting to target process</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Chart */}
            <div className="col-span-8">
              <Card className="bg-gray-800/40 border-gray-700/50 rounded-xl">
                <CardHeader className="pb-2">
                  <CardTitle className="text-white text-sm">Monday, 28 December 2021</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-32 flex items-end justify-between px-2">
                    {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, index) => (
                      <div key={day} className="flex flex-col items-center space-y-1">
                        <div 
                          className={`w-6 rounded-t ${index === 2 ? 'bg-purple-600 h-20 relative' : 'bg-gray-700 h-12'}`}
                        >
                          {index === 2 && (
                            <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 bg-purple-600 text-white px-2 py-1 rounded text-xs whitespace-nowrap">
                              $2057
                            </div>
                          )}
                        </div>
                        <span className="text-gray-400 text-xs">{day}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Projects Finance */}
            <div className="col-span-8">
              <Card className="bg-gray-800/40 border-gray-700/50 rounded-xl">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-white text-sm">Projects Finance</CardTitle>
                  <Button variant="ghost" className="text-purple-400 hover:text-purple-300 text-xs p-1">
                    View all
                  </Button>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between p-2 bg-gray-700/30 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center">
                          <span className="text-white text-xs font-semibold">DD</span>
                        </div>
                        <div>
                          <p className="text-white text-sm font-medium">Darby Day</p>
                          <p className="text-gray-400 text-xs">Meet the target</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="text-right">
                          <p className="text-white font-semibold text-sm">$145,000</p>
                          <div className="flex items-center space-x-1">
                            <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                            <span className="text-gray-400 text-xs">Financial Officer</span>
                          </div>
                        </div>
                        <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white p-1">
                          <MoreVertical className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between p-2 bg-gray-700/30 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                          <span className="text-white text-xs font-semibold">HD</span>
                        </div>
                        <div>
                          <p className="text-white text-sm font-medium">Holt Diven</p>
                          <p className="text-gray-400 text-xs">On Going</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="text-right">
                          <p className="text-white font-semibold text-sm">$289,000</p>
                          <div className="flex items-center space-x-1">
                            <div className="w-1.5 h-1.5 bg-purple-500 rounded-full"></div>
                            <span className="text-gray-400 text-xs">Project Manager</span>
                          </div>
                        </div>
                        <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white p-1">
                          <MoreVertical className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* About Section */}
            <div className="col-span-4">
              <Card className="bg-gray-800/40 border-gray-700/50 rounded-xl">
                <CardHeader className="pb-2">
                  <CardTitle className="text-white text-sm">About</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-400 text-xs mb-3">
                    Organised activities to make money and sell goods and services for a profit
                  </p>
                  
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <div className="w-6 h-6 rounded-full overflow-hidden">
                        <div className="w-full h-full bg-orange-500 flex items-center justify-center">
                          <span className="text-white text-xs font-semibold">JJ</span>
                        </div>
                      </div>
                      <div>
                        <p className="text-white text-xs font-medium">Jonie Juger</p>
                        <p className="text-gray-400 text-xs">Project Manager</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <div className="w-6 h-6 rounded-full overflow-hidden">
                        <div className="w-full h-full bg-green-500 flex items-center justify-center">
                          <span className="text-white text-xs font-semibold">SH</span>
                        </div>
                      </div>
                      <div>
                        <p className="text-white text-xs font-medium">Sarah Hosten</p>
                        <p className="text-gray-400 text-xs">Graphic Designer</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <div className="w-6 h-6 rounded-full overflow-hidden">
                        <div className="w-full h-full bg-purple-500 flex items-center justify-center">
                          <span className="text-white text-xs font-semibold">DA</span>
                        </div>
                      </div>
                      <div>
                        <p className="text-white text-xs font-medium">Deckard Anne</p>
                        <p className="text-gray-400 text-xs">Financial Treasurer</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Send Money Card */}
            <div className="col-span-4">
              <Card className="bg-gray-800/40 border-gray-700/50 rounded-xl">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                      <div>
                        <p className="text-white text-sm font-semibold">Send Money</p>
                        <p className="text-gray-400 text-xs">Your Card</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-white font-bold text-lg">$145,000</p>
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