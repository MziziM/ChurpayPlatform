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
      {/* Navigation Header - Same as Member/Church Dashboard */}
      <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            {/* Logo */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-600 to-indigo-700 flex items-center justify-center">
                  <Shield className="h-5 w-5 text-white" />
                </div>
                <div className="hidden sm:block">
                  <h1 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
                    ChurPay Admin
                  </h1>
                  <p className="text-xs text-gray-500">Super Administrator</p>
                </div>
              </div>
            </div>

            {/* Search Bar */}
            <div className="flex-1 max-w-md mx-8">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Search churches, members, payouts..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 w-full"
                />
              </div>
            </div>

            {/* Right Section */}
            <Button variant="ghost" size="sm" className="relative">
              <Bell className="h-5 w-5" />
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </Button>

            <div className="flex items-center space-x-3 cursor-pointer hover:bg-gray-50 rounded-lg p-2 transition-colors">
              <div className="w-8 h-8 rounded-full overflow-hidden bg-gradient-to-br from-purple-100 to-indigo-100 flex items-center justify-center">
                <Shield className="h-4 w-4 text-purple-600" />
              </div>
              <div className="hidden md:block">
                <p className="text-sm font-medium text-gray-900">Super Admin</p>
                <p className="text-xs text-gray-500">ChurPay Platform</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex">
        {/* Main Dashboard */}
        <div className="flex-1 p-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {statsCards.map((card, index) => {
              const IconComponent = card.icon;
              return (
                <Card key={index} className="relative overflow-hidden">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">{card.title}</p>
                        <p className="text-2xl font-bold text-gray-900 mt-1">{card.value}</p>
                        <p className="text-xs text-gray-500 mt-1">{card.subValue}</p>
                      </div>
                      <div className={`p-3 rounded-full ${card.bgColor}`}>
                        <IconComponent className={`h-6 w-6 ${card.color}`} />
                      </div>
                    </div>
                    <div className="mt-4 flex items-center">
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        card.trend === 'up' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-gray-100 text-gray-600'
                      }`}>
                        {card.change}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Tabbed Content */}
          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="churches">Churches</TabsTrigger>
              <TabsTrigger value="payouts">Payouts</TabsTrigger>
              <TabsTrigger value="members">Members</TabsTrigger>
              <TabsTrigger value="reports">Reports</TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Revenue Chart */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <BarChart3 className="h-5 w-5" />
                      <span>Platform Revenue</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {(analyticsData?.revenueChart.labels || []).map((month, index) => (
                        <div key={month} className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">{month}</span>
                          <div className="flex items-center space-x-4">
                            <div className="w-24 text-right">
                              <span className="text-sm font-medium">
                                R{analyticsData.revenueChart.revenue[index]?.toLocaleString()}
                              </span>
                            </div>
                            <div className="w-20 text-right">
                              <span className="text-xs text-purple-600">
                                R{analyticsData.revenueChart.fees[index]?.toLocaleString()} fees
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Recent Activity */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Activity className="h-5 w-5" />
                      <span>Platform Activity</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {(platformActivity || []).slice(0, 6).map((activity) => (
                        <div key={activity.id} className="flex items-center space-x-3">
                          <div className="w-2 h-2 rounded-full bg-green-500"></div>
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-900">
                              {activity.description}
                            </p>
                            <p className="text-xs text-gray-500">
                              {activity.churchName} • {new Date(activity.timestamp).toLocaleString()}
                            </p>
                          </div>
                          {activity.amount && (
                            <span className="text-sm font-medium text-green-600">
                              R{activity.amount}
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Churches Tab */}
            <TabsContent value="churches" className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-semibold">Church Management</h2>
                <Button onClick={() => setShowChurchModal(true)}>
                  <Building2 className="h-4 w-4 mr-2" />
                  View Church Details
                </Button>
              </div>
              
              <div className="grid gap-4">
                {(churches || []).map((church) => (
                  <Card key={church.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 rounded-full overflow-hidden bg-gradient-to-br from-purple-100 to-indigo-100 flex items-center justify-center">
                            {church.profileImageUrl ? (
                              <img 
                                src={church.profileImageUrl} 
                                alt={church.name} 
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <Building2 className="h-6 w-6 text-purple-600" />
                            )}
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-900">{church.name}</h3>
                            <p className="text-sm text-gray-500">
                              {church.denomination} • {church.city}, {church.province}
                            </p>
                            <p className="text-xs text-gray-400">
                              {church.memberCount} members • R{church.monthlyRevenue}/month
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          <Badge 
                            variant={church.status === 'active' ? 'default' : 'secondary'}
                            className={church.status === 'active' ? 'bg-green-100 text-green-800' : ''}
                          >
                            {church.status}
                          </Badge>
                          <Button variant="outline" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            {/* Payouts Tab */}
            <TabsContent value="payouts" className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-semibold">Payout Management</h2>
                <div className="flex space-x-2">
                  <Badge variant="outline" className="bg-orange-50 text-orange-800">
                    {(payoutRequests || []).filter(p => p.status === 'pending').length} Pending
                  </Badge>
                  <Badge variant="outline" className="bg-blue-50 text-blue-800">
                    {(payoutRequests || []).filter(p => p.status === 'processing').length} Processing
                  </Badge>
                </div>
              </div>

              <div className="grid gap-4">
                {(payoutRequests || []).map((payout) => (
                  <Card key={payout.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h3 className="font-semibold text-gray-900">{payout.churchName}</h3>
                            <Badge 
                              variant={payout.status === 'pending' ? 'secondary' : 'default'}
                              className={
                                payout.status === 'pending' ? 'bg-orange-100 text-orange-800' :
                                payout.status === 'approved' ? 'bg-blue-100 text-blue-800' :
                                payout.status === 'completed' ? 'bg-green-100 text-green-800' :
                                'bg-red-100 text-red-800'
                              }
                            >
                              <Clock className="h-3 w-3 mr-1" />
                              {payout.status}
                            </Badge>
                          </div>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div>
                              <p className="text-gray-500">Amount</p>
                              <p className="font-medium">R{payout.amount}</p>
                            </div>
                            <div>
                              <p className="text-gray-500">Bank</p>
                              <p className="font-medium">{payout.bankDetails.bankName}</p>
                            </div>
                            <div>
                              <p className="text-gray-500">Account</p>
                              <p className="font-medium">***{payout.bankDetails.accountNumber.slice(-4)}</p>
                            </div>
                            <div>
                              <p className="text-gray-500">Requested</p>
                              <p className="font-medium">{new Date(payout.requestDate).toLocaleDateString()}</p>
                            </div>
                          </div>
                        </div>
                        <div className="flex space-x-2 ml-4">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handlePayoutAction(payout)}
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            Review
                          </Button>
                          {payout.status === 'pending' && (
                            <>
                              <Button 
                                size="sm" 
                                className="bg-green-600 hover:bg-green-700"
                                onClick={() => handlePayoutAction(payout)}
                              >
                                <CheckCircle className="h-4 w-4 mr-1" />
                                Approve
                              </Button>
                              <Button 
                                variant="destructive" 
                                size="sm"
                                onClick={() => handlePayoutAction(payout)}
                              >
                                <XCircle className="h-4 w-4 mr-1" />
                                Reject
                              </Button>
                            </>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            {/* Members Tab */}
            <TabsContent value="members" className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-semibold">Member Overview</h2>
                <Button onClick={() => setShowMemberModal(true)}>
                  <Users className="h-4 w-4 mr-2" />
                  View All Members
                </Button>
              </div>
              <Card>
                <CardContent className="p-6">
                  <div className="text-center">
                    <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Member Management</h3>
                    <p className="text-gray-500 mb-4">
                      Access detailed member analytics and management tools
                    </p>
                    <Button onClick={() => setShowMemberModal(true)}>
                      Open Member Dashboard
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Reports Tab */}
            <TabsContent value="reports" className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-semibold">Platform Reports</h2>
                <Button onClick={() => setShowReportsModal(true)}>
                  <FileText className="h-4 w-4 mr-2" />
                  Generate Report
                </Button>
              </div>
              <Card>
                <CardContent className="p-6">
                  <div className="text-center">
                    <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Advanced Analytics</h3>
                    <p className="text-gray-500 mb-4">
                      Generate comprehensive reports on platform performance
                    </p>
                    <Button onClick={() => setShowReportsModal(true)}>
                      Open Reports Dashboard
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Modals */}
      <SuperAdminPayoutModal
        isOpen={showPayoutModal}
        onClose={() => {
          setShowPayoutModal(false);
          setSelectedPayout(null);
        }}
        payout={selectedPayout}
      />

      <SuperAdminChurchModal
        isOpen={showChurchModal}
        onClose={() => setShowChurchModal(false)}
      />

      <SuperAdminMemberModal
        isOpen={showMemberModal}
        onClose={() => setShowMemberModal(false)}
      />

      <SuperAdminReportsModal
        isOpen={showReportsModal}
        onClose={() => setShowReportsModal(false)}
      />
    </div>
  );
}