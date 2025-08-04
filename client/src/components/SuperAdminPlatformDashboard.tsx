import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Progress } from './ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { 
  Building2, 
  DollarSign, 
  Users, 
  BarChart3, 
  Settings, 
  Shield,
  TrendingUp,
  Eye,
  Download,
  Plus,
  AlertTriangle,
  CheckCircle,
  Clock,
  Server,
  Activity,
  Globe,
  CreditCard,
  FileText,
  UserCheck,
  UserX,
  Search,
  Filter,
  MoreVertical,
  Zap,
  Database,
  Lock,
  Bell,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Target,
  PieChart,
  LineChart,
  Monitor,
  Cpu,
  HardDrive,
  Wifi,
  RefreshCw,
  X,
  Save,
  Edit,
  Trash2,
  ArrowUpRight,
  ArrowDownLeft,
  Receipt,
  Heart,
  Rocket,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  Crown,
  Church,
  User,
  Image,
  ExternalLink,
  Paperclip
} from 'lucide-react';

export function SuperAdminPlatformDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedChurch, setSelectedChurch] = useState(null);
  const [selectedMember, setSelectedMember] = useState(null);
  const [showPayoutModal, setShowPayoutModal] = useState(false);
  const [showActivityModal, setShowActivityModal] = useState(false);
  const [showChurchModal, setShowChurchModal] = useState(false);
  const [showMemberModal, setShowMemberModal] = useState(false);
  const [showSystemModal, setShowSystemModal] = useState(false);
  
  // Payout request management states
  const [selectedPayoutRequest, setSelectedPayoutRequest] = useState(null);
  const [payoutDecision, setPayoutDecision] = useState('');
  const [payoutNotes, setPayoutNotes] = useState('');
  
  // Church management states
  const [churchDecision, setChurchDecision] = useState('');
  const [churchNotes, setChurchNotes] = useState('');

  // Platform commission settings
  const [commissionRate, setCommissionRate] = useState(() => {
    const saved = localStorage.getItem('churpay-commission-rate');
    return saved ? parseFloat(saved) : 6.0;
  });
  const [tempCommissionRate, setTempCommissionRate] = useState('');
  const [showCommissionModal, setShowCommissionModal] = useState(false);

  // Get registrations from localStorage or initialize empty
  const [registrations, setRegistrations] = useState(() => {
    try {
      const stored = localStorage.getItem('churpay-registrations');
      return stored ? JSON.parse(stored) : { churches: [], members: [] };
    } catch {
      return { churches: [], members: [] };
    }
  });

  // Platform statistics that update based on real registrations
  const mockPlatformStats = {
    totalChurches: 124 + registrations.churches.length,
    activeChurches: 118 + registrations.churches.filter((c: any) => c.status === 'Active').length,
    pendingApprovals: 8 + registrations.churches.filter((c: any) => c.status === 'Pending').length,
    suspendedChurches: 3 + registrations.churches.filter((c: any) => c.status === 'Suspended').length,
    totalRevenue: 2456780,
    monthlyRevenue: 245600,
    commissionEarned: 147406,
    activeUsers: 15420 + registrations.members.length,
    totalTransactions: 45670,
    successRate: 99.2,
    avgResponseTime: 145,
    systemUptime: 99.8,
    platformGrowthRate: 18.5,
    recentChurches: [
      ...registrations.churches.map((church: any, index: number) => ({
        id: church.id || (1000 + index),
        name: church.churchName || church.name,
        location: `${church.city}, ${church.province}`,
        members: parseInt(church.membershipSize?.split('-')[0] || '50'),
        status: church.status || 'Pending',
        joined: church.submittedAt || new Date().toISOString().split('T')[0],
        revenue: church.status === 'Active' ? Math.floor(Math.random() * 50000) + 10000 : 0,
        monthlyGrowth: church.status === 'Active' ? (Math.random() * 20).toFixed(1) : 0,
        admin: church.contactName,
        email: church.email || church.contactEmail,
        phone: church.phone || church.contactPhone,
        logo: church.churchLogo || null,
        denomination: church.denomination,
        establishedYear: church.establishedYear,
        description: church.description,
        bankDetails: church.bankName ? `${church.bankName} - ${church.accountNumber}` : null,
        website: church.website,
        streetAddress: church.streetAddress,
        city: church.city,
        province: church.province,
        postalCode: church.postalCode,
        country: church.country,
        contactTitle: church.contactTitle,
        bankName: church.bankName,
        accountName: church.accountName,
        accountNumber: church.accountNumber,
        branchCode: church.branchCode,
        accountType: church.accountType,
        isNewRegistration: true
      })),
      { 
        id: 1, 
        name: 'Grace Baptist Church', 
        location: 'Cape Town', 
        members: 342, 
        status: 'Active', 
        joined: '2024-01-10', 
        revenue: 45670,
        monthlyGrowth: 14.7,
        admin: 'Jane Smith',
        email: 'admin@gracebaptist.org.za',
        phone: '+27 21 123 4567',
        logo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face'
      },
      { 
        id: 2, 
        name: 'New Life Methodist', 
        location: 'Johannesburg', 
        members: 156, 
        status: 'Pending', 
        joined: '2024-01-12', 
        revenue: 0,
        monthlyGrowth: 0,
        admin: 'Mike Johnson',
        email: 'admin@newlifemethodist.org.za',
        phone: '+27 11 234 5678',
        logo: null
      },
      { 
        id: 3, 
        name: 'Faith Community Church', 
        location: 'Durban', 
        members: 289, 
        status: 'Active', 
        joined: '2024-01-08', 
        revenue: 38450,
        monthlyGrowth: 8.2,
        admin: 'Sarah Williams',
        email: 'admin@faithcommunity.org.za',
        phone: '+27 31 345 6789',
        logo: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face'
      }
    ].slice(0, 10), // Limit to most recent 10
    payoutRequests: [
      {
        id: 1,
        church: 'Grace Baptist Church',
        admin: 'Jane Smith',
        amount: 8500,
        category: 'tithes',
        description: 'Monthly tithe collection withdrawal for church operations',
        requestDate: '2024-01-15',
        status: 'pending',
        bankDetails: 'FNB - 12345678901',
        churchRevenue: 45670,
        availableBalance: 12450.25
      },
      {
        id: 2,
        church: 'Faith Community Church',
        admin: 'Sarah Williams',
        amount: 3200,
        category: 'offerings',
        description: 'Weekly offerings collection for community outreach',
        requestDate: '2024-01-14',
        status: 'pending',
        bankDetails: 'Standard Bank - 23456789012',
        churchRevenue: 38450,
        availableBalance: 6780.50
      }
    ]
  };

  const formatCurrency = (amount: number) => {
    return `R${amount.toLocaleString()}`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active': return 'bg-green-100 text-green-800';
      case 'Pending': return 'bg-yellow-100 text-yellow-800';
      case 'Under Review': return 'bg-blue-100 text-blue-800';
      case 'Suspended': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handlePayoutDecision = (request: any, decision: string) => {
    console.log(`${decision} payout request:`, request);
    alert(`Payout request has been ${decision.toLowerCase()}.`);
    setShowPayoutModal(false);
  };

  const handleChurchDecision = (church: any, decision: string) => {
    console.log(`${decision} church:`, church);
    alert(`Church application has been ${decision.toLowerCase()}.`);
    setShowChurchModal(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-churpay-gradient flex items-center justify-center">
              <Crown className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Super Admin Dashboard</h1>
              <p className="text-gray-600">ChurPay Platform Management</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <Button variant="outline" size="sm">
              <Bell className="w-4 h-4 mr-2" />
              Alerts
            </Button>
            <Button variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              Export Data
            </Button>
            <Button size="sm" className="bg-churpay-gradient text-white">
              <Settings className="w-4 h-4 mr-2" />
              Platform Settings
            </Button>
          </div>
        </div>
      </div>

      <div className="p-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-5 mb-6">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="churches">Churches</TabsTrigger>
            <TabsTrigger value="payouts">Payouts</TabsTrigger>
            <TabsTrigger value="members">Members</TabsTrigger>
            <TabsTrigger value="system">System</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Platform Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="p-6 bg-white border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total Churches</p>
                    <p className="text-2xl font-bold text-gray-900">{mockPlatformStats.totalChurches}</p>
                    <p className="text-sm text-green-600 flex items-center mt-1">
                      <TrendingUp className="w-4 h-4 mr-1" />
                      +{mockPlatformStats.platformGrowthRate}% growth
                    </p>
                  </div>
                  <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                    <Church className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
              </Card>

              <Card className="p-6 bg-white border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Platform Revenue</p>
                    <p className="text-2xl font-bold text-gray-900">{formatCurrency(mockPlatformStats.totalRevenue)}</p>
                    <p className="text-sm text-gray-600">Monthly: {formatCurrency(mockPlatformStats.monthlyRevenue)}</p>
                  </div>
                  <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                    <DollarSign className="w-6 h-6 text-green-600" />
                  </div>
                </div>
              </Card>

              <Card className="p-6 bg-white border border-gray-200">
                <div className="flex items-center justify-between">  
                  <div>
                    <p className="text-sm text-gray-600">Active Users</p>
                    <p className="text-2xl font-bold text-gray-900">{mockPlatformStats.activeUsers.toLocaleString()}</p>
                    <p className="text-sm text-gray-600">{mockPlatformStats.totalTransactions} transactions</p>
                  </div>
                  <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center">
                    <Users className="w-6 h-6 text-purple-600" />
                  </div>
                </div>
              </Card>

              <Card className="p-6 bg-white border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">System Health</p>
                    <p className="text-2xl font-bold text-gray-900">{mockPlatformStats.systemUptime}%</p>
                    <p className="text-sm text-green-600">Uptime</p>
                  </div>
                  <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                    <Activity className="w-6 h-6 text-green-600" />
                  </div>
                </div>
              </Card>
            </div>

            {/* Recent Churches */}
            <Card className="bg-white border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">Recent Church Registrations</h3>
                  <Button variant="outline" size="sm" onClick={() => setActiveTab('churches')}>
                    View All
                  </Button>
                </div>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {mockPlatformStats.recentChurches.slice(0, 5).map((church: any) => (
                    <div key={church.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-4">
                        <Avatar>
                          <AvatarImage src={church.logo} />
                          <AvatarFallback>{church.name.split(' ').map((n: string) => n[0]).join('')}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium text-gray-900">{church.name}</p>
                          <p className="text-sm text-gray-600">{church.location} • {church.members} members</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Badge className={getStatusColor(church.status)}>
                          {church.status}
                        </Badge>
                        <Button variant="ghost" size="sm">
                          <Eye className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="churches" className="space-y-6">
            {/* Churches Management */}
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">Churches Management</h2>
              <div className="flex space-x-2">
                <Button variant="outline" size="sm">
                  <Filter className="w-4 h-4 mr-2" />
                  Filter
                </Button>
                <Button variant="outline" size="sm">
                  <Download className="w-4 h-4 mr-2" />
                  Export
                </Button>
              </div>
            </div>

            {/* Churches Status Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card className="p-6 bg-white border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total Churches</p>
                    <p className="text-2xl font-bold text-gray-900">{mockPlatformStats.totalChurches}</p>
                  </div>
                  <Building2 className="w-8 h-8 text-blue-600" />
                </div>
              </Card>
              <Card className="p-6 bg-white border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Active</p>
                    <p className="text-2xl font-bold text-green-600">{mockPlatformStats.activeChurches}</p>
                  </div>
                  <CheckCircle className="w-8 h-8 text-green-500" />
                </div>
              </Card>
              <Card className="p-6 bg-white border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Pending</p>
                    <p className="text-2xl font-bold text-yellow-600">{mockPlatformStats.pendingApprovals}</p>
                  </div>
                  <Clock className="w-8 h-8 text-yellow-500" />
                </div>
              </Card>
              <Card className="p-6 bg-white border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Suspended</p>
                    <p className="text-2xl font-bold text-red-600">{mockPlatformStats.suspendedChurches}</p>
                  </div>
                  <AlertTriangle className="w-8 h-8 text-red-500" />
                </div>
              </Card>
            </div>

            {/* Churches Table */}
            <Card className="bg-white border border-gray-200">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="border-b border-gray-200">
                    <tr>
                      <th className="text-left p-4 text-gray-600">Church</th>
                      <th className="text-left p-4 text-gray-600">Location</th>
                      <th className="text-left p-4 text-gray-600">Members</th>
                      <th className="text-left p-4 text-gray-600">Status</th>
                      <th className="text-left p-4 text-gray-600">Revenue</th>
                      <th className="text-left p-4 text-gray-600">Joined</th>
                      <th className="text-left p-4 text-gray-600">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {mockPlatformStats.recentChurches.map((church: any) => (
                      <tr key={church.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="p-4">
                          <div className="flex items-center space-x-3">
                            <Avatar>
                              <AvatarImage src={church.logo} />
                              <AvatarFallback>{church.name.split(' ').map((n: string) => n[0]).join('')}</AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium text-gray-900">{church.name}</p>
                              <p className="text-sm text-gray-600">{church.admin}</p>
                            </div>
                          </div>
                        </td>
                        <td className="p-4">
                          <span className="text-sm text-gray-900">{church.location}</span>
                        </td>
                        <td className="p-4">
                          <span className="text-sm text-gray-900">{church.members}</span>
                        </td>
                        <td className="p-4">
                          <Badge className={getStatusColor(church.status)}>
                            {church.status}
                          </Badge>
                        </td>
                        <td className="p-4">
                          <span className="text-sm text-gray-900">{formatCurrency(church.revenue || 0)}</span>
                        </td>
                        <td className="p-4">
                          <span className="text-sm text-gray-900">{church.joined}</span>
                        </td>
                        <td className="p-4">
                          <div className="flex space-x-2">
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => {
                                setSelectedChurch(church);
                                setShowChurchModal(true);
                              }}
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="payouts" className="space-y-6">
            {/* Payout Requests */}
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">Payout Requests</h2>
              <Button variant="outline" size="sm">
                <Download className="w-4 h-4 mr-2" />
                Export Payouts
              </Button>
            </div>

            {/* Payout Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card className="p-6 bg-white border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Pending Requests</p>
                    <p className="text-2xl font-bold text-yellow-600">
                      {mockPlatformStats.payoutRequests.filter((p: any) => p.status === 'pending').length}
                    </p>
                  </div>
                  <Clock className="w-8 h-8 text-yellow-500" />
                </div>
              </Card>
              <Card className="p-6 bg-white border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total Amount</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {formatCurrency(mockPlatformStats.payoutRequests.reduce((sum: number, p: any) => sum + p.amount, 0))}
                    </p>
                  </div>
                  <DollarSign className="w-8 h-8 text-green-600" />
                </div>
              </Card>
              <Card className="p-6 bg-white border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">This Month</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {mockPlatformStats.payoutRequests.length}
                    </p>
                  </div>
                  <BarChart3 className="w-8 h-8 text-blue-600" />
                </div>
              </Card>
              <Card className="p-6 bg-white border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Processing Time</p>
                    <p className="text-2xl font-bold text-gray-900">2.4 hrs</p>
                  </div>
                  <Activity className="w-8 h-8 text-purple-600" />
                </div>
              </Card>
            </div>

            {/* Payout Requests Table */}
            <Card className="bg-white border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Recent Payout Requests</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="border-b border-gray-200">
                    <tr>
                      <th className="text-left p-4 text-gray-600">Church</th>
                      <th className="text-left p-4 text-gray-600">Amount</th>
                      <th className="text-left p-4 text-gray-600">Category</th>
                      <th className="text-left p-4 text-gray-600">Date</th>
                      <th className="text-left p-4 text-gray-600">Status</th>
                      <th className="text-left p-4 text-gray-600">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {mockPlatformStats.payoutRequests.map((request: any) => (
                      <tr key={request.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="p-4">
                          <div>
                            <p className="font-medium text-gray-900">{request.church}</p>
                            <p className="text-sm text-gray-600">{request.admin}</p>
                          </div>
                        </td>
                        <td className="p-4">
                          <span className="font-medium text-gray-900">{formatCurrency(request.amount)}</span>
                        </td>
                        <td className="p-4">
                          <Badge variant="outline">{request.category}</Badge>
                        </td>
                        <td className="p-4">
                          <span className="text-sm text-gray-900">{request.requestDate}</span>
                        </td>
                        <td className="p-4">
                          <Badge className="bg-yellow-100 text-yellow-800">
                            {request.status}
                          </Badge>
                        </td>
                        <td className="p-4">
                          <div className="flex space-x-2">
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => {
                                setSelectedPayoutRequest(request);
                                setShowPayoutModal(true);
                              }}
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="sm" className="text-green-600">
                              <CheckCircle className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="sm" className="text-red-600">
                              <X className="w-4 h-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="members" className="space-y-6">
            {/* Members Overview */}
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">Platform Members</h2>
              <div className="flex space-x-2">
                <Button variant="outline" size="sm">
                  <Search className="w-4 h-4 mr-2" />
                  Search
                </Button>
                <Button variant="outline" size="sm">
                  <Download className="w-4 h-4 mr-2" />
                  Export
                </Button>
              </div>
            </div>

            {/* Member Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card className="p-6 bg-white border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total Members</p>
                    <p className="text-2xl font-bold text-gray-900">{mockPlatformStats.activeUsers.toLocaleString()}</p>
                  </div>
                  <Users className="w-8 h-8 text-blue-600" />
                </div>
              </Card>
              <Card className="p-6 bg-white border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Active This Month</p>
                    <p className="text-2xl font-bold text-green-600">12,847</p>
                  </div>
                  <UserCheck className="w-8 h-8 text-green-500" />
                </div>
              </Card>
              <Card className="p-6 bg-white border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">New Registrations</p>
                    <p className="text-2xl font-bold text-purple-600">{registrations.members.length + 45}</p>
                  </div>
                  <User className="w-8 h-8 text-purple-500" />
                </div>
              </Card>
              <Card className="p-6 bg-white border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Avg. Donations</p>
                    <p className="text-2xl font-bold text-gray-900">R485</p>
                  </div>
                  <Heart className="w-8 h-8 text-red-500" />
                </div>
              </Card>
            </div>

            {/* Recent Members */}
            <Card className="bg-white border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Recent Member Registrations</h3>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {registrations.members.slice(0, 8).map((member: any, index: number) => (
                    <div key={member.id || index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-4">
                        <Avatar>
                          <AvatarFallback>{member.firstName?.[0]}{member.lastName?.[0]}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium text-gray-900">{member.firstName} {member.lastName}</p>
                          <p className="text-sm text-gray-600">{member.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Badge className="bg-green-100 text-green-800">
                          Active
                        </Badge>
                        <Button variant="ghost" size="sm">
                          <Eye className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="system" className="space-y-6">
            {/* System Overview */}
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">System Management</h2>
              <Button variant="outline" size="sm">
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh Status
              </Button>
            </div>

            {/* System Health Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card className="p-6 bg-white border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">System Uptime</p>
                    <p className="text-2xl font-bold text-green-600">{mockPlatformStats.systemUptime}%</p>
                  </div>
                  <Server className="w-8 h-8 text-green-600" />
                </div>
              </Card>
              <Card className="p-6 bg-white border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Response Time</p>
                    <p className="text-2xl font-bold text-blue-600">{mockPlatformStats.avgResponseTime}ms</p>
                  </div>
                  <Zap className="w-8 h-8 text-blue-600" />
                </div>
              </Card>
              <Card className="p-6 bg-white border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Success Rate</p>
                    <p className="text-2xl font-bold text-green-600">{mockPlatformStats.successRate}%</p>
                  </div>
                  <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
              </Card>
              <Card className="p-6 bg-white border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Commission Rate</p>
                    <p className="text-2xl font-bold text-purple-600">{commissionRate}%</p>
                  </div>
                  <Settings className="w-8 h-8 text-purple-600" />
                </div>
              </Card>
            </div>

            {/* System Settings */}
            <Card className="bg-white border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Platform Configuration</h3>
              </div>
              <div className="p-6 space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">Commission Rate</p>
                    <p className="text-sm text-gray-600">Current platform commission rate</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-lg font-bold text-purple-600">{commissionRate}%</span>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setShowCommissionModal(true)}
                    >
                      <Edit className="w-4 h-4 mr-1" />
                      Edit
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Church Detail Modal */}
      <Dialog open={showChurchModal} onOpenChange={setShowChurchModal}>
        <DialogContent className="sm:max-w-2xl bg-white">
          <DialogHeader>
            <DialogTitle className="text-gray-900">Church Application Review</DialogTitle>
          </DialogHeader>
          {selectedChurch && (
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <Avatar className="w-16 h-16">
                  <AvatarImage src={(selectedChurch as any).logo} />
                  <AvatarFallback>{(selectedChurch as any).name.split(' ').map((n: string) => n[0]).join('')}</AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">{(selectedChurch as any).name}</h3>
                  <p className="text-gray-600">{(selectedChurch as any).location}</p>
                  <Badge className={getStatusColor((selectedChurch as any).status)}>
                    {(selectedChurch as any).status}
                  </Badge>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">Admin Contact</label>
                  <p className="text-gray-900">{(selectedChurch as any).admin}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Members</label>
                  <p className="text-gray-900">{(selectedChurch as any).members}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Email</label>
                  <p className="text-gray-900">{(selectedChurch as any).email}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Phone</label>
                  <p className="text-gray-900">{(selectedChurch as any).phone}</p>
                </div>
              </div>

              {(selectedChurch as any).status === 'Pending' && (
                <div className="flex space-x-2 pt-4">
                  <Button 
                    onClick={() => handleChurchDecision(selectedChurch, 'Approved')}
                    className="bg-green-600 text-white"
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Approve
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={() => handleChurchDecision(selectedChurch, 'Rejected')}
                    className="border-red-600 text-red-600"
                  >
                    <X className="w-4 h-4 mr-2" />
                    Reject
                  </Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Payout Detail Modal */}
      <Dialog open={showPayoutModal} onOpenChange={setShowPayoutModal}>
        <DialogContent className="sm:max-w-lg bg-white">
          <DialogHeader>
            <DialogTitle className="text-gray-900">Payout Request Review</DialogTitle>
          </DialogHeader>
          {selectedPayoutRequest && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">Church</label>
                  <p className="text-gray-900">{(selectedPayoutRequest as any).church}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Amount</label>
                  <p className="text-gray-900 font-bold">{formatCurrency((selectedPayoutRequest as any).amount)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Category</label>
                  <p className="text-gray-900">{(selectedPayoutRequest as any).category}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Request Date</label>
                  <p className="text-gray-900">{(selectedPayoutRequest as any).requestDate}</p>
                </div>
                <div className="col-span-2">
                  <label className="text-sm font-medium text-gray-600">Description</label>
                  <p className="text-gray-900">{(selectedPayoutRequest as any).description}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Bank Details</label>
                  <p className="text-gray-900">{(selectedPayoutRequest as any).bankDetails}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Available Balance</label>
                  <p className="text-gray-900">{formatCurrency((selectedPayoutRequest as any).availableBalance)}</p>
                </div>
              </div>

              <div className="flex space-x-2">
                <Button 
                  onClick={() => handlePayoutDecision(selectedPayoutRequest, 'Approved')}
                  className="bg-green-600 text-white flex-1"
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Approve Payout
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => handlePayoutDecision(selectedPayoutRequest, 'Rejected')}
                  className="border-red-600 text-red-600 flex-1"
                >
                  <X className="w-4 h-4 mr-2" />
                  Reject
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}