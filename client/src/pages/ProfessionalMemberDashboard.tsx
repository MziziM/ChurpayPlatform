import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Wallet, HandHeart, Building2, Receipt, 
  Activity, CreditCard, Banknote, Shield,
  Search, Bell, User, ChevronRight,
  ArrowUpRight, ArrowDownRight, Clock, Plus,
  Heart, Church, Target, TrendingUp
} from 'lucide-react';
import { ProfessionalDonationModal } from '@/components/ProfessionalDonationModal';
import { ProjectsModal } from '@/components/ProjectsModal';
import { ProfessionalWalletModal } from '@/components/ProfessionalWalletModal';
import { ProfileModal } from '@/components/ProfileModal';
import { ChurchModal } from '@/components/ChurchModal';
import { NotificationModal } from '@/components/NotificationModal';
import { ActivitiesModal } from '@/components/ActivitiesModal';

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

interface DonationHistory {
  id: string;
  amount: string;
  type: 'tithe' | 'donation' | 'project';
  churchName: string;
  projectTitle?: string;
  createdAt: string;
  status: string;
}

export default function ProfessionalMemberDashboard() {
  const [showDonationModal, setShowDonationModal] = useState(false);
  const [showWalletModal, setShowWalletModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showChurchModal, setShowChurchModal] = useState(false);
  const [showNotificationModal, setShowNotificationModal] = useState(false);
  const [showActivitiesModal, setShowActivitiesModal] = useState(false);
  const [showProjectsModal, setShowProjectsModal] = useState(false);
  const [donationType, setDonationType] = useState<'donation' | 'tithe' | 'project' | 'topup'>('donation');
  const [searchQuery, setSearchQuery] = useState('');

  // Data queries
  const { data: walletData } = useQuery<WalletData>({
    queryKey: ['/api/wallet']
  });

  const { data: donationHistory } = useQuery<DonationHistory[]>({
    queryKey: ['/api/donations/history']
  });

  const { data: churches = [] } = useQuery<any[]>({
    queryKey: ['/api/churches']
  });

  // User stats query
  const { data: userStats } = useQuery<{
    memberSince: string;
    totalGiven: string;
    thisYearGiven: string;
    goalProgress: number;
    annualGoal: string;
    transactionCount: number;
    averageGift: string;
  }>({
    queryKey: ['/api/user/stats']
  });

  // Recent activity query
  const { data: recentActivity = [] } = useQuery<Array<{
    id: string;
    type: string;
    amount: string;
    description: string;
    timeAgo: string;
    status: string;
    icon: string;
  }>>({
    queryKey: ['/api/user/recent-activity']
  });

  const walletBalance = parseFloat(walletData?.availableBalance || '0');
  const rewardPoints = parseInt(walletData?.rewardPoints || '0');

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation Header */}
      <header className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center space-x-8">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">C</span>
              </div>
              <span className="text-xl font-semibold text-gray-900">ChurPay</span>
            </div>
            
            <nav className="hidden md:flex items-center space-x-6">
              <Button variant="ghost" className="text-purple-600 font-medium">Dashboard</Button>
              <Button 
                variant="ghost" 
                className="text-gray-600 hover:text-purple-600"
                onClick={() => {
                  setDonationType('donation');
                  setShowDonationModal(true);
                }}
              >
                Giving
              </Button>
              <Button 
                variant="ghost" 
                className="text-gray-600 hover:text-purple-600"
                onClick={() => setShowChurchModal(true)}
              >
                Churches
              </Button>
              <Button 
                variant="ghost" 
                className="text-gray-600 hover:text-purple-600"
                onClick={() => setShowProjectsModal(true)}
              >
                Projects
              </Button>
            </nav>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="relative hidden md:block">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 w-64"
              />
            </div>
            
            <Button 
              variant="ghost" 
              size="icon" 
              className="relative hover:bg-purple-50"
              onClick={() => setShowNotificationModal(true)}
            >
              <Bell className="h-5 w-5" />
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </Button>
            
            <div 
              className="flex items-center space-x-3 cursor-pointer hover:bg-gray-50 rounded-lg p-2 transition-colors"
              onClick={() => setShowProfileModal(true)}
            >
              <div className="w-8 h-8 rounded-full overflow-hidden bg-gradient-to-br from-purple-100 to-indigo-100 flex items-center justify-center">
                {/* Show emoji if available, otherwise show profile image */}
                <span className="text-lg">🙏</span>
              </div>
              <div className="hidden md:block">
                <p className="text-sm font-medium text-gray-900">Nomsa Mthembu</p>
                <p className="text-xs text-gray-500">Member</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-6">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Good afternoon, Nomsa</h1>
              <div className="flex items-center space-x-2 text-gray-600">
                <span>Here's your giving overview and church activity</span>
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">Last active</p>
              <p className="text-sm font-medium text-gray-900">2 minutes ago</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content Area */}
          <div className="lg:col-span-2 space-y-6">
            {/* Quick Actions with Enhanced UX */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button
                onClick={() => {
                  setDonationType('donation');
                  setShowDonationModal(true);
                }}
                className="h-24 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white flex flex-col items-center justify-center space-y-2 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
              >
                <HandHeart className="h-7 w-7" />
                <div className="text-center">
                  <span className="font-semibold">Give Now</span>
                  <p className="text-xs opacity-90">Make a donation</p>
                </div>
              </Button>
              
              <Button
                onClick={() => setShowWalletModal(true)}
                variant="outline"
                className="h-24 border-2 border-gray-200 hover:border-purple-300 bg-white hover:bg-purple-50 flex flex-col items-center justify-center space-y-2 rounded-xl shadow-sm hover:shadow-lg transition-all duration-200 transform hover:scale-105"
              >
                <Wallet className="h-7 w-7 text-purple-600" />
                <div className="text-center">
                  <span className="font-semibold text-gray-900">My Wallet</span>
                  <p className="text-xs text-gray-600">R {walletBalance.toLocaleString()}</p>
                </div>
              </Button>
              
              <Button
                onClick={() => {
                  setDonationType('tithe');
                  setShowDonationModal(true);
                }}
                variant="outline"
                className="h-24 border-2 border-gray-200 hover:border-green-300 bg-white hover:bg-green-50 flex flex-col items-center justify-center space-y-2 rounded-xl shadow-sm hover:shadow-lg transition-all duration-200 transform hover:scale-105"
              >
                <Building2 className="h-7 w-7 text-green-600" />
                <div className="text-center">
                  <span className="font-semibold text-gray-900">Tithe</span>
                  <p className="text-xs text-gray-600">Support your church</p>
                </div>
              </Button>
            </div>

            {/* Financial Overview with Enhanced Design */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="border-0 shadow-lg rounded-2xl overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-blue-600 to-blue-700 text-white pb-4">
                  <CardTitle className="text-xl font-bold flex items-center space-x-2">
                    <Activity className="h-6 w-6" />
                    <span>This Month</span>
                  </CardTitle>
                  <p className="text-blue-100 text-sm">Your giving summary</p>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-5">
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                        <span className="text-gray-700 font-medium">Total Given</span>
                      </div>
                      <span className="font-bold text-xl text-gray-900">R 2,400</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                        <span className="text-gray-700 font-medium">Tithes</span>
                      </div>
                      <span className="font-bold text-lg text-gray-900">R 1,800</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                        <span className="text-gray-700 font-medium">Donations</span>
                      </div>
                      <span className="font-bold text-lg text-gray-900">R 600</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg rounded-2xl overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-purple-600 to-purple-700 text-white pb-4">
                  <CardTitle className="text-xl font-bold flex items-center space-x-2">
                    <CreditCard className="h-6 w-6" />
                    <span>Wallet Balance</span>
                  </CardTitle>
                  <p className="text-purple-100 text-sm">Your available funds</p>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-5">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-3xl font-bold text-gray-900">R {walletBalance.toLocaleString()}</span>
                        <p className="text-gray-500 text-sm mt-1">Available balance</p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowWalletModal(true)}
                        className="text-purple-600 hover:bg-purple-50 rounded-lg px-4 py-2"
                      >
                        Manage
                        <ChevronRight className="h-4 w-4 ml-1" />
                      </Button>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
                      <div className="flex items-center space-x-3">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                        <span className="text-green-700 font-medium text-sm">Active & Secured</span>
                      </div>
                      <Shield className="h-5 w-5 text-green-600" />
                    </div>
                    <div className="text-center">
                      <Button
                        onClick={() => {
                          setDonationType('topup');
                          setShowDonationModal(true);
                        }}
                        size="sm"
                        className="bg-purple-600 hover:bg-purple-700 text-white px-6"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Funds
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Activity with Enhanced Design */}
            <Card className="border-0 shadow-lg rounded-2xl overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-gray-800 to-gray-900 text-white pb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-xl font-bold flex items-center space-x-2">
                      <Clock className="h-6 w-6" />
                      <span>Recent Activity</span>
                    </CardTitle>
                    <p className="text-gray-300 text-sm mt-1">Your latest transactions</p>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-white hover:bg-white/10 rounded-lg"
                    onClick={() => setShowActivitiesModal(true)}
                  >
                    View All
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  {recentActivity.length > 0 ? recentActivity.slice(0, 6).map((activity, index) => {
                    const getActivityIcon = (iconType: string) => {
                      switch (iconType) {
                        case 'heart':
                          return <Heart className="h-5 w-5" />;
                        case 'church':
                          return <Church className="h-5 w-5" />;
                        case 'target':
                          return <Target className="h-5 w-5" />;
                        case 'wallet':
                          return <Wallet className="h-5 w-5" />;
                        default:
                          return <Activity className="h-5 w-5" />;
                      }
                    };

                    const getActivityColor = (type: string) => {
                      switch (type) {
                        case 'tithe':
                          return 'bg-green-100 text-green-600 border-green-200';
                        case 'donation':
                          return 'bg-purple-100 text-purple-600 border-purple-200';
                        case 'project':
                          return 'bg-blue-100 text-blue-600 border-blue-200';
                        case 'topup':
                          return 'bg-yellow-100 text-yellow-600 border-yellow-200';
                        default:
                          return 'bg-gray-100 text-gray-600 border-gray-200';
                      }
                    };

                    return (
                      <div key={activity.id} className={`flex items-center justify-between p-4 rounded-xl border transition-all duration-200 hover:shadow-md hover:scale-[1.02] cursor-pointer ${getActivityColor(activity.type)}`}>
                        <div className="flex items-center space-x-4">
                          <div className={`w-12 h-12 rounded-full flex items-center justify-center ${getActivityColor(activity.type)}`}>
                            {getActivityIcon(activity.icon)}
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900">{activity.description}</p>
                            <div className="flex items-center space-x-2">
                              <p className="text-sm text-gray-600 capitalize">{activity.type}</p>
                              <span className="w-1 h-1 bg-gray-400 rounded-full"></span>
                              <p className="text-sm text-gray-500">{activity.timeAgo}</p>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-lg text-gray-900">{activity.amount}</p>
                          <Badge variant="outline" className="text-xs mt-1 capitalize">
                            {activity.status}
                          </Badge>
                        </div>
                      </div>
                    );
                  }) : (
                    <div className="text-center py-8">
                      <Activity className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                      <p className="text-gray-600 font-medium">No recent activity</p>
                      <p className="text-gray-500 text-sm mt-1">Your transactions will appear here</p>
                      <Button
                        onClick={() => {
                          setDonationType('donation');
                          setShowDonationModal(true);
                        }}
                        size="sm"
                        className="mt-4 bg-purple-600 hover:bg-purple-700 text-white"
                      >
                        <Heart className="h-4 w-4 mr-2" />
                        Make Your First Donation
                      </Button>
                    </div>
                  )}
                </div>
                {recentActivity.length > 0 && (
                  <div className="mt-6 text-center">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setShowActivitiesModal(true)}
                      className="border-gray-300 text-gray-700 hover:bg-gray-50"
                    >
                      <TrendingUp className="h-4 w-4 mr-2" />
                      View All Activity
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Enhanced Sidebar */}
          <div className="space-y-6">
            {/* Achievement Card with Animation */}
            <Card className="bg-gradient-to-br from-purple-600 via-purple-700 to-indigo-800 text-white border-0 shadow-xl overflow-hidden relative">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-12 -translate-x-12"></div>
              <CardContent className="p-8 relative z-10">
                <div className="text-center">
                  <div className="w-20 h-20 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                    <Shield className="h-10 w-10 text-white" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">Faithful Giver</h3>
                  <p className="text-purple-100 mb-4">12 months of consistent giving</p>
                  <div className="bg-white/20 rounded-full py-2 px-4 backdrop-blur-sm">
                    <span className="font-semibold">{rewardPoints} reward points</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Church Connection with Enhanced Design */}
            <Card className="border-0 shadow-lg rounded-2xl overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-green-600 to-emerald-700 text-white pb-4">
                <CardTitle className="text-xl font-bold flex items-center space-x-2">
                  <Building2 className="h-6 w-6" />
                  <span>My Church</span>
                </CardTitle>
                <p className="text-green-100 text-sm">Your spiritual home</p>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-5">
                  <div className="flex items-center space-x-4 p-4 bg-green-50 rounded-xl border border-green-200">
                    <div className="w-16 h-16 rounded-xl overflow-hidden border-2 border-green-200 bg-white flex items-center justify-center">
                      {churches[0]?.logoUrl ? (
                        <img 
                          src={churches[0].logoUrl} 
                          alt={`${churches[0].name} logo`}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <Building2 className="h-8 w-8 text-green-600" />
                      )}
                    </div>
                    <div>
                      <p className="font-bold text-gray-900 text-lg">{churches[0]?.name || 'Grace Chapel'}</p>
                      <p className="text-gray-600">{churches[0]?.location || 'Johannesburg, South Africa'}</p>
                      <div className="flex items-center space-x-2 mt-1">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="text-sm text-green-600 font-medium">Active Member</span>
                      </div>
                    </div>
                  </div>
                  <Button 
                    variant="outline" 
                    className="w-full border-green-200 text-green-700 hover:bg-green-50" 
                    size="sm"
                    onClick={() => setShowChurchModal(true)}
                  >
                    <ChevronRight className="h-4 w-4 mr-2" />
                    View Church Profile
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Enhanced Quick Stats */}
            <Card className="border-0 shadow-lg rounded-2xl overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-orange-500 to-red-600 text-white pb-4">
                <CardTitle className="text-xl font-bold flex items-center space-x-2">
                  <Banknote className="h-6 w-6" />
                  <span>Quick Stats</span>
                </CardTitle>
                <p className="text-orange-100 text-sm">Your giving journey</p>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-5">
                  <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg border border-orange-200">
                    <span className="text-gray-700 font-medium">Member since</span>
                    <span className="font-bold text-gray-900">{userStats?.memberSince || 'Jan 2022'}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg border border-orange-200">
                    <span className="text-gray-700 font-medium">Total given</span>
                    <span className="font-bold text-xl text-gray-900">R {userStats?.totalGiven ? parseFloat(userStats.totalGiven).toLocaleString() : '0'}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg border border-orange-200">
                    <span className="text-gray-700 font-medium">This year</span>
                    <span className="font-bold text-lg text-gray-900">R {userStats?.thisYearGiven ? parseFloat(userStats.thisYearGiven).toLocaleString() : '0'}</span>
                  </div>
                  <div className="mt-4 p-3 bg-gradient-to-r from-purple-100 to-blue-100 rounded-lg border border-purple-200">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-700 font-medium">Goal Progress</span>
                      <span className="font-bold text-purple-700">{userStats?.goalProgress || 0}%</span>
                    </div>
                    <div className="w-full bg-white rounded-full h-2 mt-2">
                      <div 
                        className="bg-gradient-to-r from-purple-500 to-blue-500 h-2 rounded-full transition-all duration-300" 
                        style={{width: `${userStats?.goalProgress || 0}%`}}
                      ></div>
                    </div>
                    <div className="flex justify-between text-xs text-gray-600 mt-1">
                      <span>Goal: R {userStats?.annualGoal ? parseFloat(userStats.annualGoal).toLocaleString() : '25,000'}</span>
                      <span>{userStats?.transactionCount || 0} gifts</span>
                    </div>
                  </div>
                  {userStats?.averageGift && parseFloat(userStats.averageGift) > 0 && (
                    <div className="flex items-center justify-between p-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200">
                      <span className="text-gray-700 font-medium">Average gift</span>
                      <span className="font-bold text-green-700">R {parseFloat(userStats.averageGift).toLocaleString()}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      {/* Mobile Bottom Navigation */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-2">
        <div className="flex justify-around">
          <Button 
            variant="ghost" 
            size="sm" 
            className="flex flex-col items-center space-y-1 text-purple-600"
            onClick={() => setShowActivitiesModal(true)}
          >
            <Activity className="h-5 w-5" />
            <span className="text-xs">Dashboard</span>
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            className="flex flex-col items-center space-y-1"
            onClick={() => setShowWalletModal(true)}
          >
            <Wallet className="h-5 w-5" />
            <span className="text-xs">Wallet</span>
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            className="flex flex-col items-center space-y-1"
            onClick={() => {
              setDonationType('donation');
              setShowDonationModal(true);
            }}
          >
            <HandHeart className="h-5 w-5" />
            <span className="text-xs">Give</span>
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            className="flex flex-col items-center space-y-1"
            onClick={() => setShowActivitiesModal(true)}
          >
            <Receipt className="h-5 w-5" />
            <span className="text-xs">History</span>
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            className="flex flex-col items-center space-y-1"
            onClick={() => setShowProfileModal(true)}
          >
            <User className="h-5 w-5" />
            <span className="text-xs">Profile</span>
          </Button>
        </div>
      </div>

      {/* Modals */}
      <ProfessionalDonationModal
        isOpen={showDonationModal}
        onClose={() => setShowDonationModal(false)}
        type={donationType}
        walletBalance={walletBalance.toString()}
      />

      <ProfessionalWalletModal
        isOpen={showWalletModal}
        onClose={() => setShowWalletModal(false)}
        walletBalance={walletBalance}
        rewardPoints={rewardPoints}
        transactions={[]}
        onTopUp={() => {
          setShowWalletModal(false);
          setDonationType('topup');
          setShowDonationModal(true);
        }}
        onSend={() => {
          setShowWalletModal(false);
        }}
      />

      <ProfileModal
        isOpen={showProfileModal}
        onClose={() => setShowProfileModal(false)}
      />

      <ChurchModal
        isOpen={showChurchModal}
        onClose={() => setShowChurchModal(false)}
      />

      <NotificationModal
        isOpen={showNotificationModal}
        onClose={() => setShowNotificationModal(false)}
      />

      <ActivitiesModal
        isOpen={showActivitiesModal}
        onClose={() => setShowActivitiesModal(false)}
      />

      <ProjectsModal
        isOpen={showProjectsModal}
        onClose={() => setShowProjectsModal(false)}
        onSponsorProject={(projectId) => {
          setShowProjectsModal(false);
          setDonationType('project');
          setShowDonationModal(true);
        }}
      />
    </div>
  );
}