import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Search, Bell, Settings, Shield, Users, Building2, 
  DollarSign, TrendingUp, Activity, AlertTriangle,
  Eye, CheckCircle, XCircle, Clock, CreditCard,
  BarChart3, PieChart, Calendar, Download,
  Wallet, Target, Receipt, FileText, MapPin
} from 'lucide-react';
import { SuperAdminPayoutModal } from '@/components/SuperAdminPayoutModal';
import { SuperAdminChurchModal } from '@/components/SuperAdminChurchModal';
import { SuperAdminMemberModal } from '@/components/SuperAdminMemberModal';
import { SuperAdminReportsModal } from '@/components/SuperAdminReportsModal';

interface SuperAdminStats {
  totalChurches: number;
  activeChurches: number;
  totalMembers: number;
  totalRevenue: string;
  monthlyRevenue: string;
  pendingPayouts: string;
  completedPayouts: string;
  platformFees: string;
  revenueGrowth: number;
  churchGrowth: number;
}

interface ChurchOverview {
  id: string;
  name: string;
  denomination: string;
  city: string;
  province: string;
  memberCount: number;
  monthlyRevenue: string;
  status: string;
  lastActive: string;
  profileImageUrl?: string;
}

interface PayoutRequest {
  id: string;
  churchId: string;
  churchName: string;
  amount: string;
  requestDate: string;
  status: 'pending' | 'approved' | 'rejected' | 'processing' | 'completed';
  bankDetails: {
    bankName: string;
    accountNumber: string;
    branchCode: string;
  };
  notes?: string;
}

interface PlatformActivity {
  id: string;
  type: 'donation' | 'tithe' | 'project' | 'payout' | 'registration';
  description: string;
  amount?: string;
  timestamp: string;
  status: string;
  churchName?: string;
  memberName?: string;
}

export default function SuperAdminDashboard() {
  const [searchQuery, setSearchQuery] = useState('');
  const [showPayoutModal, setShowPayoutModal] = useState(false);
  const [showChurchModal, setShowChurchModal] = useState(false);
  const [showMemberModal, setShowMemberModal] = useState(false);
  const [showReportsModal, setShowReportsModal] = useState(false);
  const [selectedPayout, setSelectedPayout] = useState<PayoutRequest | null>(null);

  // Fetch super admin statistics
  const { data: adminStats } = useQuery<SuperAdminStats>({
    queryKey: ['/api/super-admin/stats']
  });

  // Fetch churches overview
  const { data: churches } = useQuery<ChurchOverview[]>({
    queryKey: ['/api/super-admin/churches']
  });

  // Fetch payout requests
  const { data: payoutRequests } = useQuery<PayoutRequest[]>({
    queryKey: ['/api/super-admin/payouts']
  });

  // Fetch platform activity
  const { data: platformActivity } = useQuery<PlatformActivity[]>({
    queryKey: ['/api/super-admin/activity']
  });

  // Fetch analytics data
  const { data: analyticsData } = useQuery<{
    revenueChart: { labels: string[]; revenue: number[]; fees: number[] };
    churchGrowth: { labels: string[]; churches: number[]; members: number[] };
  }>({
    queryKey: ['/api/super-admin/analytics']
  });

  const handlePayoutAction = (payout: PayoutRequest) => {
    setSelectedPayout(payout);
    setShowPayoutModal(true);
  };

  // Stats cards data
  const statsCards = [
    {
      title: 'Total Churches',
      value: adminStats?.totalChurches?.toLocaleString() || '0',
      subValue: `${adminStats?.activeChurches || 0} active`,
      change: `+${adminStats?.churchGrowth || 0}%`,
      trend: 'up',
      icon: Building2,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      title: 'Platform Revenue',
      value: `R${adminStats?.totalRevenue || '0'}`,
      subValue: `R${adminStats?.monthlyRevenue || '0'} this month`,
      change: `+${adminStats?.revenueGrowth || 0}%`,
      trend: 'up',
      icon: DollarSign,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      title: 'Pending Payouts',
      value: `R${adminStats?.pendingPayouts || '0'}`,
      subValue: `R${adminStats?.completedPayouts || '0'} completed`,
      change: 'Awaiting approval',
      trend: 'neutral',
      icon: Wallet,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
    },
    {
      title: 'Platform Fees',
      value: `R${adminStats?.platformFees || '0'}`,
      subValue: '3.9% + R3 per transaction',
      change: 'ChurPay Revenue',
      trend: 'up',
      icon: Shield,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Professional Navigation Header - Banking Grade */}
      <header className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center space-x-8">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-purple-600 to-indigo-700 rounded-lg flex items-center justify-center">
                <Shield className="h-5 w-5 text-white" />
              </div>
              <div>
                <span className="text-xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
                  ChurPay Admin
                </span>
                <p className="text-xs text-gray-500 -mt-1">Super Administrator Portal</p>
              </div>
            </div>
            
            <nav className="hidden lg:flex items-center space-x-6">
              <Button variant="ghost" className="text-purple-600 font-medium bg-purple-50">Dashboard</Button>
              <Button variant="ghost" className="text-gray-600 hover:text-purple-600" onClick={() => setShowChurchModal(true)}>
                Churches
              </Button>
              <Button variant="ghost" className="text-gray-600 hover:text-purple-600" onClick={() => setShowMemberModal(true)}>
                Members
              </Button>
              <Button variant="ghost" className="text-gray-600 hover:text-purple-600" onClick={() => setShowPayoutModal(true)}>
                Payouts
              </Button>
              <Button variant="ghost" className="text-gray-600 hover:text-purple-600" onClick={() => setShowReportsModal(true)}>
                Analytics
              </Button>
            </nav>
          </div>

          <div className="flex items-center space-x-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Search platform data..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 w-full border-gray-200 focus:border-purple-300 focus:ring-purple-200"
              />
            </div>

            <Button variant="ghost" size="sm" className="relative hover:bg-purple-50">
              <Bell className="h-5 w-5 text-gray-600" />
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </Button>

            <div className="flex items-center space-x-3 cursor-pointer hover:bg-purple-50 rounded-lg p-2 transition-colors">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-100 to-indigo-100 flex items-center justify-center">
                <Shield className="h-4 w-4 text-purple-600" />
              </div>
              <div className="hidden md:block">
                <p className="text-sm font-medium text-gray-900">Super Admin</p>
                <p className="text-xs text-gray-500">Platform Administrator</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content with Professional Layout */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Professional Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Platform Overview</h1>
          <p className="text-gray-600">Comprehensive administration of the ChurPay platform</p>
        </div>

        {/* Professional Stats Cards - Banking Grade Design */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total Churches Card */}
          <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200 hover:shadow-lg transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-blue-100 rounded-xl">
                  <Building2 className="h-8 w-8 text-blue-600" />
                </div>
                <div className="text-right">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                </div>
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-bold text-blue-900">
                  {adminStats?.totalChurches?.toLocaleString() || '0'}
                </h3>
                <p className="text-blue-700 font-medium">Total Churches</p>
                <p className="text-xs text-blue-600">{adminStats?.activeChurches || 0} active churches</p>
              </div>
            </CardContent>
          </Card>

          {/* Platform Revenue Card */}
          <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200 hover:shadow-lg transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-green-100 rounded-xl">
                  <DollarSign className="h-8 w-8 text-green-600" />
                </div>
                <div className="text-right">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                </div>
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-bold text-green-900">
                  R{adminStats?.totalRevenue || '0'}
                </h3>
                <p className="text-green-700 font-medium">Platform Revenue</p>
                <p className="text-xs text-green-600">R{adminStats?.monthlyRevenue || '0'} this month</p>
              </div>
            </CardContent>
          </Card>

          {/* Pending Payouts Card */}
          <Card className="bg-gradient-to-br from-orange-50 to-yellow-50 border-orange-200 hover:shadow-lg transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-orange-100 rounded-xl">
                  <Wallet className="h-8 w-8 text-orange-600" />
                </div>
                <div className="text-right">
                  <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                </div>
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-bold text-orange-900">
                  R{adminStats?.pendingPayouts || '0'}
                </h3>
                <p className="text-orange-700 font-medium">Pending Payouts</p>
                <p className="text-xs text-orange-600">R{adminStats?.completedPayouts || '0'} completed</p>
              </div>
            </CardContent>
          </Card>

          {/* Platform Fees Card */}
          <Card className="bg-gradient-to-br from-purple-50 to-indigo-50 border-purple-200 hover:shadow-lg transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-purple-100 rounded-xl">
                  <Shield className="h-8 w-8 text-purple-600" />
                </div>
                <div className="text-right">
                  <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                </div>
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-bold text-purple-900">
                  R{adminStats?.platformFees || '0'}
                </h3>
                <p className="text-purple-700 font-medium">Platform Fees</p>
                <p className="text-xs text-purple-600">3.9% + R3 per transaction</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Professional Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="hover:shadow-lg transition-all duration-300 cursor-pointer" onClick={() => setShowChurchModal(true)}>
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Building2 className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Manage Churches</h3>
              <p className="text-sm text-gray-600 mb-4">Oversee all registered churches</p>
              <Button className="w-full bg-blue-600 hover:bg-blue-700">
                View Churches
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-all duration-300 cursor-pointer" onClick={() => setShowMemberModal(true)}>
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Users className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Member Analytics</h3>
              <p className="text-sm text-gray-600 mb-4">Monitor platform members</p>
              <Button className="w-full bg-green-600 hover:bg-green-700">
                View Members
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-all duration-300 cursor-pointer" onClick={() => setShowPayoutModal(true)}>
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Wallet className="h-6 w-6 text-orange-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Process Payouts</h3>
              <p className="text-sm text-gray-600 mb-4">Manage church payouts</p>
              <Button className="w-full bg-orange-600 hover:bg-orange-700">
                View Payouts
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-all duration-300 cursor-pointer" onClick={() => setShowReportsModal(true)}>
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                <BarChart3 className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Platform Reports</h3>
              <p className="text-sm text-gray-600 mb-4">Generate analytics reports</p>
              <Button className="w-full bg-purple-600 hover:bg-purple-700">
                View Reports
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Professional Activity Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Recent Activity */}
          <Card className="shadow-sm">
            <CardHeader className="border-b border-gray-100">
              <CardTitle className="flex items-center space-x-2">
                <Activity className="h-5 w-5 text-gray-600" />
                <span>Recent Platform Activity</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="space-y-1">
                {(platformActivity || []).slice(0, 6).map((activity, index) => (
                  <div key={activity.id || index} className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <Activity className="h-4 w-4 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{String(activity.description || '')}</p>
                        <p className="text-xs text-gray-500">{String(activity.timestamp || '')}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      {activity.amount && (
                        <p className="text-sm font-semibold text-gray-900">R{String(activity.amount)}</p>
                      )}
                      <Badge variant="outline" className="text-xs">
                        {String(activity.status || '')}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <Card className="shadow-sm">
            <CardHeader className="border-b border-gray-100">
              <CardTitle className="flex items-center space-x-2">
                <TrendingUp className="h-5 w-5 text-gray-600" />
                <span>Platform Performance</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Total Members</span>
                  <span className="text-lg font-bold text-gray-900">
                    {adminStats?.totalMembers?.toLocaleString() || '0'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Monthly Growth</span>
                  <span className="text-lg font-bold text-green-600">
                    +{adminStats?.revenueGrowth || 0}%
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Church Growth</span>
                  <span className="text-lg font-bold text-blue-600">
                    +{adminStats?.churchGrowth || 0}%
                  </span>
                </div>
                <div className="pt-4 border-t border-gray-100">
                  <div className="text-center">
                    <p className="text-sm text-gray-600 mb-2">PayFast Integration</p>
                    <Badge className="bg-green-100 text-green-800 font-medium">
                      Active • 3.9% + R3 fees
                    </Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Modals */}
      <SuperAdminPayoutModal
        open={showPayoutModal}
        onOpenChange={(open) => {
          setShowPayoutModal(open);
          if (!open) setSelectedPayout(null);
        }}
      />

      <SuperAdminChurchModal
        open={showChurchModal}
        onOpenChange={setShowChurchModal}
      />

      <SuperAdminMemberModal
        open={showMemberModal}
        onOpenChange={setShowMemberModal}
      />

      <SuperAdminReportsModal
        open={showReportsModal}
        onOpenChange={setShowReportsModal}
      />
    </div>
  );
}