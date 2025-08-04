import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Wallet, Heart, Building2, Target, Plus, 
  ArrowDown, ArrowUp, Users, ArrowLeftRight,
  Home, User, Bell, Search, ChevronRight,
  Activity, CreditCard, HandHeart, Banknote,
  Receipt, Shield, Clock
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



  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-ZA', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const totalGiven = Array.isArray(donationHistory) ? (donationHistory as DonationHistory[]).reduce((sum: number, donation: DonationHistory) => sum + parseFloat(donation.amount), 0) : 9900;
  
  const walletBalance = (walletData as WalletData)?.availableBalance ? parseFloat((walletData as WalletData).availableBalance) : 8240;
  const rewardPoints = (walletData as WalletData)?.rewardPoints ? parseFloat((walletData as WalletData).rewardPoints) : 1250;

  return (
    <div className="min-h-screen" style={{background: 'linear-gradient(135deg, #2d1b69 0%, #663399 50%, #11101d 100%)'}}>
      {/* Top Navigation Bar */}
      <div className="bg-gray-900/90 backdrop-blur-sm border-b border-gray-800 px-4 md:px-8 py-4 rounded-t-3xl mx-2 md:mx-8 mt-2 md:mt-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 md:space-x-8">
            <h1 className="text-white text-sm md:text-xl font-bold tracking-wider">CHURPAY MEMBER</h1>
            <div className="flex items-center space-x-2 md:space-x-6 text-xs md:text-sm text-gray-400">
              <span className="hidden md:block border-r border-gray-600 pr-6">CHURCH MEMBER</span>
              <div className="px-2 md:px-3 py-1 bg-purple-600 text-white text-xs rounded font-medium">FAITHFUL GIVER</div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col md:flex-row mx-2 md:mx-8 bg-gray-900/70 backdrop-blur-sm rounded-b-3xl min-h-screen">
        {/* Mobile Bottom Navigation - Hidden on Desktop */}
        <div className="md:hidden fixed bottom-0 left-0 right-0 bg-gray-900/95 backdrop-blur-sm border-t border-gray-800 z-50">
          <nav className="flex justify-around items-center py-2">
            <div className="flex flex-col items-center p-2 text-purple-400">
              <Home className="h-5 w-5" />
              <span className="text-xs mt-1">Dashboard</span>
            </div>
            <div className="flex flex-col items-center p-2 text-gray-400">
              <Heart className="h-5 w-5" />
              <span className="text-xs mt-1">Giving</span>
            </div>
            <div className="flex flex-col items-center p-2 text-gray-400">
              <Church className="h-5 w-5" />
              <span className="text-xs mt-1">Projects</span>
            </div>
            <div className="flex flex-col items-center p-2 text-gray-400">
              <Wallet className="h-5 w-5" />
              <span className="text-xs mt-1">Wallet</span>
            </div>
            <div className="flex flex-col items-center p-2 text-gray-400">
              <Users className="h-5 w-5" />
              <span className="text-xs mt-1">Community</span>
            </div>
          </nav>
        </div>

        {/* Left Sidebar - Hidden on Mobile */}
        <div className="hidden md:block w-52 p-6 border-r border-gray-800/50">
          <nav className="space-y-2">
            <div className="flex items-center space-x-3 p-3 bg-purple-600 rounded-xl text-white">
              <Home className="h-5 w-5" />
              <span className="font-medium">Dashboard</span>
            </div>
            <div className="flex items-center space-x-3 p-3 text-gray-400 hover:text-white hover:bg-gray-800/50 rounded-xl cursor-pointer transition-all">
              <Heart className="h-5 w-5" />
              <span>My Giving</span>
            </div>
            <div className="flex items-center space-x-3 p-3 text-gray-400 hover:text-white hover:bg-gray-800/50 rounded-xl cursor-pointer transition-all">
              <Church className="h-5 w-5" />
              <span>Church Projects</span>
            </div>
            <div className="flex items-center space-x-3 p-3 text-gray-400 hover:text-white hover:bg-gray-800/50 rounded-xl cursor-pointer transition-all">
              <Wallet className="h-5 w-5" />
              <span>My Wallet</span>
            </div>
            <div className="flex items-center space-x-3 p-3 text-gray-400 hover:text-white hover:bg-gray-800/50 rounded-xl cursor-pointer transition-all">
              <Users className="h-5 w-5" />
              <span>Community</span>
            </div>
            <div className="flex items-center space-x-3 p-3 text-gray-400 hover:text-white hover:bg-gray-800/50 rounded-xl cursor-pointer transition-all">
              <User className="h-5 w-5" />
              <span>Profile</span>
            </div>
          </nav>

          {/* Bottom Section */}
          <div className="mt-auto pt-12 space-y-4">
            
            
            <div className="space-y-2">
              <div 
                className="flex items-center space-x-3 p-3 text-gray-400 hover:text-white hover:bg-gray-800/50 rounded-xl cursor-pointer transition-all"
                onClick={() => {
                  setDonationType('tithe');
                  setShowDonationModal(true);
                }}
              >
                <Church className="h-5 w-5" />
                <span>Quick Tithe</span>
              </div>
              <div 
                className="flex items-center space-x-3 p-3 text-gray-400 hover:text-white hover:bg-gray-800/50 rounded-xl cursor-pointer transition-all"
                onClick={() => {
                  setDonationType('topup');
                  setShowDonationModal(true);
                }}
              >
                <Wallet className="h-5 w-5" />
                <span>Top Up Wallet</span>
              </div>
              <div className="flex items-center space-x-3 p-3 text-gray-400 hover:text-white hover:bg-gray-800/50 rounded-xl cursor-pointer transition-all">
                <Settings className="h-5 w-5" />
                <span>Settings</span>
              </div>
              <div className="flex items-center space-x-3 p-3 text-red-400 hover:text-red-300 hover:bg-gray-800/50 rounded-xl cursor-pointer transition-all">
                <ArrowLeftRight className="h-5 w-5" />
                <span>Logout</span>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-6">
          {/* Top Section with Search and Profile - Mobile Optimized */}
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6 md:mb-8 space-y-4 md:space-y-0">
            <div className="flex items-center space-x-3 md:space-x-6 w-full md:w-auto">
              {/* Search Bar */}
              <div className="relative flex-1 md:flex-initial">
                <Search className="absolute left-3 md:left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search churches, projects..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full md:w-80 pl-10 md:pl-12 bg-gray-800/60 border-gray-700/50 text-white placeholder:text-gray-400 rounded-2xl h-10 md:h-12"
                />
              </div>
              
              {/* Notification Button */}
              <Button className="relative bg-gray-800/60 hover:bg-gray-700/60 text-white border-gray-700/50 rounded-2xl w-10 h-10 md:w-12 md:h-12 p-0 flex-shrink-0">
                <Bell className="h-4 w-4 md:h-5 md:w-5" />
                <div className="absolute -top-1 -right-1 w-2 h-2 md:w-3 md:h-3 bg-purple-500 rounded-full"></div>
              </Button>
            </div>
            
            {/* Profile Section */}
            <div className="flex items-center justify-between w-full md:w-auto md:space-x-6">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 md:w-12 md:h-12 rounded-full overflow-hidden">
                  <img src="https://images.unsplash.com/photo-1494790108755-2616b152547b?w=100&h=100&fit=crop&crop=face" alt="Profile" className="w-full h-full object-cover" />
                </div>
                <div className="text-left md:text-right">
                  <p className="text-white font-semibold text-sm md:text-base">Nomsa Mthembu</p>
                  <p className="text-gray-400 text-xs md:text-sm">Faithful Member</p>
                </div>
              </div>
              <div className="flex space-x-2">
                <Button 
                  size="sm" 
                  className="bg-purple-600/80 hover:bg-purple-600 text-white rounded-xl w-10 h-10 p-0"
                  onClick={() => {
                    setDonationType('donation');
                    setShowDonationModal(true);
                  }}
                >
                  <Heart className="h-4 w-4" />
                </Button>
                <Button 
                  size="sm" 
                  className="bg-purple-600/80 hover:bg-purple-600 text-white rounded-xl w-10 h-10 p-0"
                  onClick={() => {
                    setDonationType('tithe');
                    setShowDonationModal(true);
                  }}
                >
                  <Church className="h-4 w-4" />
                </Button>
                <Button 
                  size="sm" 
                  className="bg-purple-600/80 hover:bg-purple-600 text-white rounded-xl w-10 h-10 p-0"
                  onClick={() => {
                    setDonationType('topup');
                    setShowDonationModal(true);
                  }}
                >
                  <Wallet className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Main Content Grid - Mobile Optimized */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 md:gap-6">
            {/* Left Column - Stats Cards and Chart */}
            <div className="lg:col-span-8 space-y-4 md:space-y-6">
              {/* Top Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                <Card className="bg-gradient-to-br from-purple-600 to-purple-700 border-0 text-white rounded-2xl">
                  <CardContent className="p-4 md:p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm opacity-90 mb-2">Total Church Giving</p>
                        <p className="text-2xl md:text-3xl font-bold">R {(totalGiven / 1000).toFixed(1)}k</p>
                      </div>
                      <div className="relative w-16 h-16">
                        <svg className="w-16 h-16 transform -rotate-90">
                          <circle cx="32" cy="32" r="28" stroke="currentColor" strokeWidth="4" fill="none" className="text-purple-400/30" />
                          <circle cx="32" cy="32" r="28" stroke="currentColor" strokeWidth="4" fill="none" strokeDasharray={`${2 * Math.PI * 28}`} strokeDashoffset={`${2 * Math.PI * 28 * (1 - 0.70)}`} className="text-white" />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="text-sm font-bold">+70%</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-pink-600 to-purple-600 border-0 text-white rounded-2xl">
                  <CardContent className="p-4 md:p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm opacity-90 mb-2">Wallet Balance</p>
                        <p className="text-2xl md:text-3xl font-bold">R {(walletBalance / 1000).toFixed(1)}k</p>
                      </div>
                      <div className="relative w-16 h-16">
                        <svg className="w-16 h-16 transform -rotate-90">
                          <circle cx="32" cy="32" r="28" stroke="currentColor" strokeWidth="4" fill="none" className="text-pink-400/30" />
                          <circle cx="32" cy="32" r="28" stroke="currentColor" strokeWidth="4" fill="none" strokeDasharray={`${2 * Math.PI * 28}`} strokeDashoffset={`${2 * Math.PI * 28 * (1 - 0.50)}`} className="text-white" />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="text-sm font-bold">+50%</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Chart Section */}
              <Card className="bg-gray-800/40 border-gray-700/50 rounded-2xl">
                <CardHeader className="pb-4">
                  <CardTitle className="text-white">Church Giving Activity</CardTitle>
                  <p className="text-gray-400 text-sm">Your weekly donation pattern</p>
                </CardHeader>
                <CardContent>
                  <div className="h-64 relative">
                    {/* Y-axis labels */}
                    <div className="absolute left-0 top-0 h-full flex flex-col justify-between text-gray-400 text-sm">
                      <span>350</span>
                      <span>300</span>
                      <span>250</span>
                      <span>200</span>
                    </div>
                    
                    {/* Chart Area */}
                    <div className="ml-8 h-full relative">
                      {/* Line Chart Path */}
                      <svg className="absolute inset-0 w-full h-full">
                        <path
                          d="M 50 200 Q 100 180 150 120 Q 200 100 250 140 Q 300 160 350 80 Q 400 60 450 100"
                          stroke="#8B5CF6"
                          strokeWidth="3"
                          fill="none"
                          className="drop-shadow-lg"
                        />
                        {/* Data point at Wed */}
                        <circle cx="250" cy="140" r="6" fill="#8B5CF6" className="drop-shadow-lg" />
                        <circle cx="250" cy="140" r="3" fill="white" />
                      </svg>
                      
                      {/* Value indicator */}
                      <div 
                        className="absolute bg-purple-600 text-white px-3 py-1 rounded-lg text-sm font-semibold"
                        style={{left: '220px', top: '110px'}}
                      >
                        R2057
                      </div>
                    
                      {/* X-axis labels */}
                      <div className="absolute bottom-0 left-0 right-0 flex justify-between text-gray-400 text-sm">
                        <span>Jan</span>
                        <span>Feb</span>
                        <span className="text-purple-400 font-semibold">Mar</span>
                        <span>Apr</span>
                        <span>May</span>
                        <span>Jun</span>
                        <span>Jul</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Projects Finance Table */}
              <Card className="bg-gray-800/40 border-gray-700/50 rounded-2xl">
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="text-white">Church Projects</CardTitle>
                  <Button variant="ghost" className="text-purple-400 hover:text-purple-300">
                    View all
                  </Button>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {Array.isArray(projects) && projects.length > 0 ? projects.slice(0, 2).map((project: Project) => (
                      <div key={project.id} className="flex items-center justify-between p-4 bg-gray-700/30 rounded-xl">
                        <div className="flex items-center space-x-4">
                          <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
                            <span className="text-white font-semibold text-xs">{project.title.substring(0, 2).toUpperCase()}</span>
                          </div>
                          <div>
                            <p className="text-white font-semibold">{project.title}</p>
                            <p className="text-gray-400 text-sm">{project.status}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-4">
                          <div className="text-right">
                            <p className="text-white font-bold text-lg">R {parseFloat(project.currentAmount).toLocaleString()}</p>
                            <div className="flex items-center space-x-2">
                              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                              <span className="text-gray-400 text-sm">{project.category}</span>
                            </div>
                          </div>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="text-gray-400 hover:text-white"
                            onClick={() => {
                              setDonationType('project');
                              setShowDonationModal(true);
                            }}
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    )) : (
                      <>
                        <div className="flex items-center justify-between p-4 bg-gray-700/30 rounded-xl">
                          <div className="flex items-center space-x-4">
                            <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center">
                              <span className="text-white font-semibold">CF</span>
                            </div>
                            <div>
                              <p className="text-white font-semibold">Church Fund</p>
                              <p className="text-gray-400 text-sm">Active Campaign</p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-4">
                            <div className="text-right">
                              <p className="text-white font-bold text-lg">R 145,000</p>
                              <div className="flex items-center space-x-2">
                                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                <span className="text-gray-400 text-sm">Building Fund</span>
                              </div>
                            </div>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="text-gray-400 hover:text-white"
                              onClick={() => {
                                setDonationType('project');
                                setShowDonationModal(true);
                              }}
                            >
                              <Plus className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between p-4 bg-gray-700/30 rounded-xl">
                          <div className="flex items-center space-x-4">
                            <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                              <span className="text-white font-semibold">YP</span>
                            </div>
                            <div>
                              <p className="text-white font-semibold">Youth Program</p>
                              <p className="text-gray-400 text-sm">Ongoing</p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-4">
                            <div className="text-right">
                              <p className="text-white font-bold text-lg">R 89,000</p>
                              <div className="flex items-center space-x-2">
                                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                                <span className="text-gray-400 text-sm">Ministry</span>
                              </div>
                            </div>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="text-gray-400 hover:text-white"
                              onClick={() => {
                                setDonationType('project');
                                setShowDonationModal(true);
                              }}
                            >
                              <Plus className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right Column */}
            <div className="lg:col-span-4 space-y-4 md:space-y-6">
              {/* Finance Target */}
              <Card className="bg-gray-800/40 border-gray-700/50 rounded-2xl">
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="text-white">Giving Goal Progress</CardTitle>
                  <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </CardHeader>
                <CardContent className="text-center">
                  <div className="relative w-24 h-24 md:w-32 md:h-32 mx-auto mb-4 md:mb-6">
                    <svg className="w-24 h-24 md:w-32 md:h-32 transform -rotate-90">
                      <circle cx="48" cy="48" r="40" stroke="currentColor" strokeWidth="6" fill="none" className="text-gray-700 md:hidden" />
                      <circle cx="48" cy="48" r="40" stroke="currentColor" strokeWidth="6" fill="none" strokeDasharray={`${2 * Math.PI * 40}`} strokeDashoffset={`${2 * Math.PI * 40 * (1 - 0.78)}`} className="text-purple-500 md:hidden" />
                      <circle cx="64" cy="64" r="56" stroke="currentColor" strokeWidth="8" fill="none" className="text-gray-700 hidden md:block" />
                      <circle cx="64" cy="64" r="56" stroke="currentColor" strokeWidth="8" fill="none" strokeDasharray={`${2 * Math.PI * 56}`} strokeDashoffset={`${2 * Math.PI * 56 * (1 - 0.78)}`} className="text-purple-500 hidden md:block" />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-2xl md:text-3xl font-bold text-white">78%</span>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                      <span className="text-gray-300 text-sm">Monthly Goal Achieved</span>
                    </div>
                    <p className="text-gray-500 text-xs">Faithful giving this month</p>
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                      <span className="text-gray-300 text-sm">Tithe Consistency</span>
                    </div>
                    <p className="text-gray-500 text-xs">11 consecutive months</p>
                    <div className="mt-4 p-3 bg-purple-600/20 rounded-xl">
                      <div className="flex items-center space-x-2">
                        <Star className="h-4 w-4 text-yellow-400" />
                        <span className="text-yellow-400 text-sm font-medium">Faithful Giver</span>
                      </div>
                      <p className="text-gray-400 text-xs mt-1">Member achievement level</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              

              {/* Wallet Actions Card */}
              <Card className="bg-gray-800/40 border-gray-700/50 rounded-2xl">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                      <div>
                        <h3 className="text-white font-semibold">Wallet Balance</h3>
                        <p className="text-gray-400 text-sm">Available Funds</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-white font-bold text-2xl">R {walletBalance.toLocaleString()}</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <Button 
                      className="bg-purple-600/80 hover:bg-purple-600 text-white rounded-xl h-10 md:h-12"
                      onClick={() => {
                        setDonationType('topup');
                        setShowDonationModal(true);
                      }}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Top Up
                    </Button>
                    <Button 
                      className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-xl h-10 md:h-12"
                      onClick={() => {
                        setDonationType('donation');
                        setShowDonationModal(true);
                      }}
                    >
                      <Heart className="h-4 w-4 mr-2" />
                      Donate
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Recent Transactions */}
              <Card className="bg-gray-800/40 border-gray-700/50 rounded-2xl">
                <CardContent>
                  <div className="space-y-3">
                    {Array.isArray(transactions) && transactions.length > 0 ? transactions.slice(0, 3).map((transaction: WalletTransaction) => (
                      <div key={transaction.id} className="flex items-center justify-between p-3 bg-gray-700/30 rounded-xl">
                        <div className="flex items-center space-x-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                            transaction.type === 'donation' ? 'bg-purple-500' :
                            transaction.type === 'tithe' ? 'bg-green-500' :
                            transaction.type === 'topup' ? 'bg-blue-500' : 'bg-gray-500'
                          }`}>
                            {transaction.type === 'donation' ? <Heart className="h-4 w-4 text-white" /> :
                             transaction.type === 'tithe' ? <Church className="h-4 w-4 text-white" /> :
                             transaction.type === 'topup' ? <ArrowUp className="h-4 w-4 text-white" /> :
                             <ArrowDown className="h-4 w-4 text-white" />}
                          </div>
                          <div>
                            <p className="text-white text-sm font-medium">{transaction.description}</p>
                            <p className="text-gray-400 text-xs">{formatDate(transaction.createdAt)}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className={`font-bold text-sm ${
                            transaction.type === 'topup' ? 'text-green-400' : 'text-red-400'
                          }`}>
                            {transaction.type === 'topup' ? '+' : '-'}R {parseFloat(transaction.amount).toLocaleString()}
                          </p>
                          <Badge variant={transaction.status === 'completed' ? 'default' : 'secondary'} className="text-xs">
                            {transaction.status}
                          </Badge>
                        </div>
                      </div>
                    )) : (
                      <div className="text-center py-6">
                        <Church className="h-8 w-8 text-gray-500 mx-auto mb-2" />
                        <p className="text-gray-400 text-sm">No recent church giving</p>
                        <p className="text-gray-500 text-xs">Start your faithful giving journey today</p>
                        <Button 
                          size="sm" 
                          className="mt-3 bg-purple-600 hover:bg-purple-700 text-white"
                          onClick={() => {
                            setDonationType('tithe');
                            setShowDonationModal(true);
                          }}
                        >
                          Give Your First Tithe
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Reward Points */}
              <Card className="bg-gradient-to-br from-yellow-600/20 to-orange-600/20 border-yellow-600/30 rounded-2xl">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-yellow-500 rounded-full flex items-center justify-center">
                        <Star className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <h3 className="text-white font-semibold">Reward Points</h3>
                        <p className="text-yellow-300 text-sm">Keep giving to earn more!</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-yellow-300 font-bold text-2xl">{rewardPoints}</p>
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
        walletBalance={walletBalance.toString()}
      />
    </div>
  );
}