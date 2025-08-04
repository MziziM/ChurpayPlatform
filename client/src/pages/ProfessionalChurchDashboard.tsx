import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Building2, Users, Wallet, TrendingUp, 
  Activity, CreditCard, Banknote, Shield,
  Search, Bell, Settings, ChevronRight,
  ArrowUpRight, ArrowDownRight, Clock, Plus,
  Heart, Church, Target, DollarSign, 
  Receipt, BarChart3, FileText, UserPlus,
  Download, Eye, Calendar, MapPin
} from 'lucide-react';
import { ChurchPayoutModal } from '@/components/ChurchPayoutModal';
import { ChurchMemberModal } from '@/components/ChurchMemberModal';
import { ChurchProjectModal } from '@/components/ChurchProjectModal';

interface ChurchData {
  id: string;
  name: string;
  denomination: string;
  memberCount: number;
  totalRevenue: string;
  monthlyRevenue: string;
  pendingPayouts: string;
  availableBalance: string;
  address: string;
  city: string;
  province: string;
  contactEmail: string;
  contactPhone: string;
  status: string;
  registrationDate: string;
}

interface MemberData {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  membershipType: string;
  totalDonated: string;
  lastDonation: string;
  joinDate: string;
  status: string;
}

interface TransactionData {
  id: string;
  memberName: string;
  amount: string;
  type: 'tithe' | 'donation' | 'project' | 'offering';
  projectTitle?: string;
  createdAt: string;
  status: string;
  paymentMethod: string;
}

interface ProjectData {
  id: string;
  title: string;
  description: string;
  targetAmount: string;
  currentAmount: string;
  progress: number;
  donorCount: number;
  status: string;
  startDate: string;
  endDate: string;
}

export default function ProfessionalChurchDashboard() {
  const [showMemberModal, setShowMemberModal] = useState(false);
  const [showPayoutModal, setShowPayoutModal] = useState(false);
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Data queries
  const { data: churchData } = useQuery<ChurchData>({
    queryKey: ['/api/church/profile']
  });

  const { data: churchStats } = useQuery<{
    totalMembers: number;
    activeMembers: number;
    totalRevenue: string;
    monthlyRevenue: string;
    averageDonation: string;
    donationCount: number;
    projectCount: number;
    activeProjects: number;
    pendingPayouts: string;
    availableBalance: string;
    revenueGrowth: number;
    memberGrowth: number;
  }>({
    queryKey: ['/api/church/stats']
  });

  const { data: recentTransactions } = useQuery<TransactionData[]>({
    queryKey: ['/api/church/transactions/recent']
  });

  const { data: topMembers } = useQuery<MemberData[]>({
    queryKey: ['/api/church/members/top-donors']
  });

  const { data: activeProjects } = useQuery<ProjectData[]>({
    queryKey: ['/api/church/projects/active']
  });

  const { data: recentMembers } = useQuery<MemberData[]>({
    queryKey: ['/api/church/members/recent']
  });

  const { data: monthlyStats } = useQuery<{
    labels: string[];
    revenue: number[];
    donations: number[];
    members: number[];
  }>({
    queryKey: ['/api/church/analytics/monthly']
  });



  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation Header - Same as Member Dashboard */}
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
                onClick={() => setShowMemberModal(true)}
              >
                Members
              </Button>
              <Button 
                variant="ghost" 
                className="text-gray-600 hover:text-purple-600"
                onClick={() => setShowProjectModal(true)}
              >
                Projects
              </Button>
              <Button 
                variant="ghost" 
                className="text-gray-600 hover:text-purple-600"
                onClick={() => setShowPayoutModal(true)}
              >
                Payouts
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
            >
              <Bell className="h-5 w-5" />
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </Button>
            
            <div className="flex items-center space-x-3 cursor-pointer hover:bg-gray-50 rounded-lg p-2 transition-colors">
              <div className="w-8 h-8 rounded-full overflow-hidden bg-gradient-to-br from-purple-100 to-indigo-100 flex items-center justify-center">
                <Church className="h-4 w-4 text-purple-600" />
              </div>
              <div className="hidden md:block">
                <p className="text-sm font-medium text-gray-900">{churchData?.name || 'Church Admin'}</p>
                <p className="text-xs text-gray-500">Administrator</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content - Same structure as Member Dashboard */}
      <main className="max-w-7xl mx-auto px-4 py-6">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Good afternoon, {churchData?.name || 'Church Admin'}</h1>
              <div className="flex items-center space-x-2 text-gray-600">
                <span>Here's your church overview and member activity</span>
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
            {/* Quick Actions with Enhanced UX - Same style as Member Dashboard */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button
                onClick={() => setShowMemberModal(true)}
                className="h-24 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white flex flex-col items-center justify-center space-y-2 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
              >
                <UserPlus className="h-7 w-7" />
                <div className="text-center">
                  <span className="font-semibold">Add Member</span>
                  <p className="text-xs opacity-90">Register new member</p>
                </div>
              </Button>
              
              <Button
                onClick={() => setShowPayoutModal(true)}
                variant="outline"
                className="h-24 border-2 border-gray-200 hover:border-purple-300 bg-white hover:bg-purple-50 flex flex-col items-center justify-center space-y-2 rounded-xl shadow-sm hover:shadow-lg transition-all duration-200 transform hover:scale-105"
              >
                <Wallet className="h-7 w-7 text-purple-600" />
                <div className="text-center">
                  <span className="font-semibold text-gray-900">Request Payout</span>
                  <p className="text-xs text-gray-600">R {churchStats?.availableBalance || '0'}</p>
                </div>
              </Button>
              
              <Button
                onClick={() => setShowProjectModal(true)}
                variant="outline"
                className="h-24 border-2 border-gray-200 hover:border-orange-300 bg-white hover:bg-orange-50 flex flex-col items-center justify-center space-y-2 rounded-xl shadow-sm hover:shadow-lg transition-all duration-200 transform hover:scale-105"
              >
                <Target className="h-7 w-7 text-orange-600" />
                <div className="text-center">
                  <span className="font-semibold text-gray-900">New Project</span>
                  <p className="text-xs text-gray-600">Create fundraiser</p>
                </div>
              </Button>
            </div>

            {/* Church Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 bg-blue-100 rounded-xl">
                      <Users className="h-8 w-8 text-blue-600" />
                    </div>
                    <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                      +{churchStats?.memberGrowth || 0}% growth
                    </Badge>
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-2xl font-bold text-blue-900">{churchStats?.totalMembers || 0}</h3>
                    <p className="text-blue-700 font-medium">Total Members</p>
                    <p className="text-sm text-blue-600">{churchStats?.activeMembers || 0} active this month</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 bg-green-100 rounded-xl">
                      <DollarSign className="h-8 w-8 text-green-600" />
                    </div>
                    <Badge variant="secondary" className="bg-green-100 text-green-800">
                      +{churchStats?.revenueGrowth || 0}% growth
                    </Badge>
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-2xl font-bold text-green-900">R{churchStats?.monthlyRevenue || '0'}</h3>
                    <p className="text-green-700 font-medium">Monthly Revenue</p>
                    <p className="text-sm text-green-600">R{churchStats?.availableBalance || '0'} available</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Activity */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center space-x-2">
                  <Activity className="h-5 w-5 text-purple-600" />
                  <span>Recent Transactions</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentTransactions?.slice(0, 5).map((transaction) => (
                    <div key={transaction.id} className="flex items-center justify-between p-4 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors">
                      <div className="flex items-center space-x-4">
                        <div className="p-2 bg-white rounded-lg shadow-sm">
                          {transaction.type === 'tithe' && <Church className="h-5 w-5 text-purple-600" />}
                          {transaction.type === 'donation' && <Heart className="h-5 w-5 text-red-600" />}
                          {transaction.type === 'project' && <Target className="h-5 w-5 text-blue-600" />}
                          {transaction.type === 'offering' && <Banknote className="h-5 w-5 text-green-600" />}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">{transaction.memberName}</p>
                          <p className="text-sm text-gray-600">
                            {transaction.type === 'project' ? transaction.projectTitle : transaction.type}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-gray-900">R{transaction.amount}</p>
                        <p className="text-xs text-gray-500">{new Date(transaction.createdAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar - Church Overview */}
          <div className="space-y-6">
            {/* Church Summary Card */}
            <Card className="bg-gradient-to-br from-purple-600 to-indigo-700 text-white border-0">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                    <Building2 className="h-8 w-8 text-white" />
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    className="text-white hover:bg-white/20 rounded-lg"
                  >
                    <Settings className="h-4 w-4" />
                  </Button>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <h3 className="text-xl font-bold text-white">{churchData?.name}</h3>
                    <p className="text-purple-100">{churchData?.denomination}</p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 pt-4 border-t border-purple-400">
                    <div>
                      <p className="text-2xl font-bold text-white">{churchStats?.totalMembers}</p>
                      <p className="text-sm text-purple-200">Members</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-white">R{churchStats?.monthlyRevenue}</p>
                      <p className="text-sm text-purple-200">This Month</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Top Donors */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Users className="h-5 w-5 text-purple-600" />
                  <span>Top Donors</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {topMembers?.slice(0, 4).map((member, index) => (
                    <div key={member.id} className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-gradient-to-r from-purple-100 to-indigo-100 rounded-full flex items-center justify-center">
                        <span className="text-sm font-semibold text-purple-700">{index + 1}</span>
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-900 text-sm">{member.firstName} {member.lastName}</p>
                        <p className="text-xs text-gray-500">R{member.totalDonated} donated</p>
                      </div>
                    </div>
                  ))}
                  <Button variant="ghost" size="sm" className="w-full mt-4 text-purple-600 hover:bg-purple-50">
                    View All Members
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Active Projects */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Target className="h-5 w-5 text-orange-600" />
                  <span>Active Projects</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {activeProjects?.slice(0, 2).map((project) => (
                    <div key={project.id} className="p-3 rounded-lg bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-200">
                      <h4 className="font-semibold text-gray-900 text-sm mb-2">{project.title}</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between text-xs text-gray-600">
                          <span>{project.progress}% complete</span>
                          <span>R{project.currentAmount} / R{project.targetAmount}</span>
                        </div>
                        <div className="w-full bg-orange-200 rounded-full h-2">
                          <div 
                            className="bg-gradient-to-r from-orange-500 to-amber-500 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${project.progress}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="w-full mt-4 text-orange-600 hover:bg-orange-50"
                    onClick={() => setShowProjectModal(true)}
                  >
                    Create New Project
                    <Plus className="h-4 w-4 ml-1" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      {/* Church-specific Modals */}
      <ChurchMemberModal
        isOpen={showMemberModal}
        onClose={() => setShowMemberModal(false)}
      />

      <ChurchPayoutModal
        isOpen={showPayoutModal}
        onClose={() => setShowPayoutModal(false)}
        availableBalance={churchStats?.availableBalance || '0'}
        pendingPayouts={churchStats?.pendingPayouts || '0'}
      />

      <ChurchProjectModal
        isOpen={showProjectModal}
        onClose={() => setShowProjectModal(false)}
      />
    </div>
  );
}