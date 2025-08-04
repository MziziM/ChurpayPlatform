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
import { ProfessionalDonationModal } from '@/components/ProfessionalDonationModal';
import { ProjectsModal } from '@/components/ProjectsModal';
import { ProfessionalWalletModal } from '@/components/ProfessionalWalletModal';
import { ProfileModal } from '@/components/ProfileModal';
import { ChurchModal } from '@/components/ChurchModal';
import { NotificationModal } from '@/components/NotificationModal';
import { ActivitiesModal } from '@/components/ActivitiesModal';

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
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showProjectsModal, setShowProjectsModal] = useState(false);
  const [showNotificationModal, setShowNotificationModal] = useState(false);
  const [showActivitiesModal, setShowActivitiesModal] = useState(false);
  const [showReportsModal, setShowReportsModal] = useState(false);
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

  // Quick actions
  const quickActions = [
    {
      title: 'Add New Member',
      description: 'Register a new church member',
      icon: UserPlus,
      action: () => setShowMemberModal(true),
      color: 'bg-blue-500',
    },
    {
      title: 'Create Project',
      description: 'Start a new fundraising project',
      icon: Target,
      action: () => setShowProjectsModal(true),
      color: 'bg-green-500',
    },
    {
      title: 'Request Payout',
      description: 'Request funds withdrawal',
      icon: Wallet,
      action: () => setShowPayoutModal(true),
      color: 'bg-purple-500',
    },
    {
      title: 'View Reports',
      description: 'Access detailed analytics',
      icon: BarChart3,
      action: () => setShowReportsModal(true),
      color: 'bg-orange-500',
    },
  ];

  // Stats cards data
  const statsCards = [
    {
      title: 'Total Members',
      value: churchStats?.totalMembers?.toLocaleString() || '0',
      subValue: `${churchStats?.activeMembers || 0} active`,
      change: `+${churchStats?.memberGrowth || 0}%`,
      trend: 'up',
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      title: 'Monthly Revenue',
      value: `R${churchStats?.monthlyRevenue || '0'}`,
      subValue: `R${churchStats?.averageDonation || '0'} avg`,
      change: `+${churchStats?.revenueGrowth || 0}%`,
      trend: 'up',
      icon: DollarSign,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      title: 'Available Balance',
      value: `R${churchStats?.availableBalance || '0'}`,
      subValue: `R${churchStats?.pendingPayouts || '0'} pending`,
      change: 'Ready for payout',
      trend: 'neutral',
      icon: Wallet,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
    {
      title: 'Active Projects',
      value: churchStats?.activeProjects?.toString() || '0',
      subValue: `${churchStats?.projectCount || 0} total`,
      change: 'Fundraising',
      trend: 'neutral',
      icon: Target,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-churpay-gradient rounded-xl flex items-center justify-center shadow-lg">
                  <Church className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">
                    {churchData?.name || 'Church Dashboard'}
                  </h1>
                  <p className="text-sm text-gray-600">
                    {churchData?.denomination} • {churchData?.city}, {churchData?.province}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              {/* Search */}
              <div className="relative hidden md:block">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search members, transactions..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 w-64 bg-gray-50 border-0 focus:bg-white"
                />
              </div>

              {/* Notifications */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowNotificationModal(true)}
                className="relative"
              >
                <Bell className="h-5 w-5" />
                <Badge className="absolute -top-1 -right-1 h-5 w-5 text-xs bg-red-500 text-white rounded-full flex items-center justify-center">
                  3
                </Badge>
              </Button>

              {/* Settings */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowProfileModal(true)}
              >
                <Settings className="h-5 w-5" />
              </Button>

              {/* Church Profile */}
              <Button
                variant="outline"
                onClick={() => setShowProfileModal(true)}
                className="flex items-center space-x-2"
              >
                <div className="w-8 h-8 bg-churpay-gradient rounded-full flex items-center justify-center">
                  <Building2 className="h-4 w-4 text-white" />
                </div>
                <span className="hidden md:block font-medium">Church Admin</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="p-6 space-y-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {statsCards.map((stat, index) => (
            <Card key={index} className="relative overflow-hidden hover:shadow-lg transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                    <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                    <p className="text-sm text-gray-500">{stat.subValue}</p>
                    <div className="flex items-center space-x-1">
                      {stat.trend === 'up' && <ArrowUpRight className="h-4 w-4 text-green-600" />}
                      {stat.trend === 'down' && <ArrowDownRight className="h-4 w-4 text-red-600" />}
                      <span className={`text-sm ${
                        stat.trend === 'up' ? 'text-green-600' : 
                        stat.trend === 'down' ? 'text-red-600' : 'text-gray-600'
                      }`}>
                        {stat.change}
                      </span>
                    </div>
                  </div>
                  <div className={`w-16 h-16 ${stat.bgColor} rounded-2xl flex items-center justify-center`}>
                    <stat.icon className={`h-8 w-8 ${stat.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Plus className="h-5 w-5" />
              <span>Quick Actions</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {quickActions.map((action, index) => (
                <Button
                  key={index}
                  variant="outline"
                  onClick={action.action}
                  className="h-auto p-4 flex flex-col items-start space-y-2 hover:shadow-md transition-all duration-300"
                >
                  <div className={`w-10 h-10 ${action.color} rounded-lg flex items-center justify-center mb-2`}>
                    <action.icon className="h-5 w-5 text-white" />
                  </div>
                  <div className="text-left">
                    <p className="font-medium text-gray-900">{action.title}</p>
                    <p className="text-sm text-gray-500">{action.description}</p>
                  </div>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Transactions */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center space-x-2">
                <Receipt className="h-5 w-5" />
                <span>Recent Transactions</span>
              </CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowActivitiesModal(true)}
              >
                <Eye className="h-4 w-4 mr-2" />
                View All
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentTransactions?.slice(0, 5).map((transaction) => (
                  <div key={transaction.id} className="flex items-center justify-between p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm">
                        {transaction.type === 'tithe' && <Church className="h-5 w-5 text-purple-600" />}
                        {transaction.type === 'donation' && <Heart className="h-5 w-5 text-red-600" />}
                        {transaction.type === 'project' && <Target className="h-5 w-5 text-blue-600" />}
                        {transaction.type === 'offering' && <Banknote className="h-5 w-5 text-green-600" />}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{transaction.memberName}</p>
                        <p className="text-sm text-gray-500">
                          {transaction.type === 'project' ? transaction.projectTitle : transaction.type}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">R{transaction.amount}</p>
                      <p className="text-xs text-gray-500">{new Date(transaction.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Top Donors */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Users className="h-5 w-5" />
                <span>Top Donors This Month</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {topMembers?.slice(0, 5).map((member, index) => (
                  <div key={member.id} className="flex items-center justify-between p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-churpay-gradient rounded-full flex items-center justify-center text-white font-semibold">
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{member.firstName} {member.lastName}</p>
                        <p className="text-sm text-gray-500">{member.membershipType}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">R{member.totalDonated}</p>
                      <p className="text-xs text-gray-500">Last: {new Date(member.lastDonation).toLocaleDateString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Active Projects */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center space-x-2">
                <Target className="h-5 w-5" />
                <span>Active Projects</span>
              </CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowProjectsModal(true)}
              >
                <Plus className="h-4 w-4 mr-2" />
                New Project
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {activeProjects?.slice(0, 3).map((project) => (
                  <div key={project.id} className="p-4 rounded-lg border border-gray-200 hover:shadow-md transition-all duration-300">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-semibold text-gray-900">{project.title}</h4>
                      <Badge variant={project.status === 'active' ? 'default' : 'secondary'}>
                        {project.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">{project.description}</p>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Progress</span>
                        <span>{project.progress}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-churpay-gradient h-2 rounded-full transition-all duration-300"
                          style={{ width: `${project.progress}%` }}
                        />
                      </div>
                      <div className="flex justify-between text-sm text-gray-600">
                        <span>R{project.currentAmount} raised</span>
                        <span>R{project.targetAmount} goal</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Recent Members */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <UserPlus className="h-5 w-5" />
                <span>Recent Members</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentMembers?.slice(0, 5).map((member) => (
                  <div key={member.id} className="flex items-center justify-between p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm">
                        <Users className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{member.firstName} {member.lastName}</p>
                        <p className="text-sm text-gray-500">{member.membershipType}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge variant={member.status === 'active' ? 'default' : 'secondary'}>
                        {member.status}
                      </Badge>
                      <p className="text-xs text-gray-500 mt-1">
                        Joined {new Date(member.joinDate).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Modals */}
      <ProfessionalDonationModal
        isOpen={showMemberModal}
        onClose={() => setShowMemberModal(false)}
        donationType="donation"
        churches={[]}
        projects={[]}
      />

      <ProfessionalWalletModal
        isOpen={showPayoutModal}
        onClose={() => setShowPayoutModal(false)}
        walletBalance={parseFloat(churchStats?.availableBalance?.replace(/,/g, '') || '0')}
        rewardPoints={0}
        transactions={[]}
        onTopUp={() => console.log('Request payout')}
        onSend={() => console.log('Transfer funds')}
      />

      <ProjectsModal
        isOpen={showProjectsModal}
        onClose={() => setShowProjectsModal(false)}
      />

      <ProfileModal
        isOpen={showProfileModal}
        onClose={() => setShowProfileModal(false)}
      />

      <NotificationModal
        isOpen={showNotificationModal}
        onClose={() => setShowNotificationModal(false)}
      />

      <ActivitiesModal
        isOpen={showActivitiesModal}
        onClose={() => setShowActivitiesModal(false)}
      />
    </div>
  );
}