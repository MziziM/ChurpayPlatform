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
  const [selectedChurch, setSelectedChurch] = useState<any>(null);
  const [selectedMember, setSelectedMember] = useState<any>(null);
  const [showPayoutModal, setShowPayoutModal] = useState(false);
  const [showActivityModal, setShowActivityModal] = useState(false);
  const [showChurchModal, setShowChurchModal] = useState(false);
  const [showMemberModal, setShowMemberModal] = useState(false);
  const [showSystemModal, setShowSystemModal] = useState(false);
  
  // Payout request management states
  const [selectedPayoutRequest, setSelectedPayoutRequest] = useState<any>(null);
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
    <div className="min-h-screen" style={{background: 'linear-gradient(135deg, #2d1b69 0%, #663399 50%, #11101d 100%)'}}>
      {/* Top Navigation Bar */}
      <div className="bg-gray-900/90 backdrop-blur-sm border-b border-gray-800 px-4 md:px-8 py-4 rounded-t-3xl mx-2 md:mx-8 mt-2 md:mt-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 md:space-x-8">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-yellow-400 flex items-center justify-center">
                <Crown className="w-6 h-6 text-purple-900" />
              </div>
              <h1 className="text-white text-sm md:text-xl font-bold tracking-wider">CHURPAY SUPER ADMIN</h1>
            </div>
            <div className="flex items-center space-x-2 md:space-x-6 text-xs md:text-sm text-gray-400">
              <span className="hidden md:block border-r border-gray-600 pr-6">PLATFORM OVERSIGHT</span>
              <div className="px-2 md:px-3 py-1 bg-yellow-400 text-purple-900 text-xs rounded font-medium">MASTER ACCESS</div>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <Button variant="outline" size="sm" className="border-gray-600 text-gray-300 hover:bg-gray-800/50">
              <Bell className="w-4 h-4 mr-2" />
              Alerts
            </Button>
            <Button variant="outline" size="sm" className="border-gray-600 text-gray-300 hover:bg-gray-800/50">
              <Download className="w-4 h-4 mr-2" />
              Export Data
            </Button>
            <Button size="sm" className="bg-yellow-400 hover:bg-yellow-500 text-purple-900 font-semibold">
              <Settings className="w-4 h-4 mr-2" />
              Platform Settings
            </Button>
          </div>
        </div>
      </div>

      <div className="flex flex-col md:flex-row mx-2 md:mx-8 bg-gray-900/70 backdrop-blur-sm rounded-b-3xl min-h-screen">
        {/* Left Sidebar - Hidden on Mobile */}
        <div className="hidden md:block w-52 p-6 border-r border-gray-800/50">
          <nav className="space-y-2">
            <div className={`flex items-center space-x-3 p-3 rounded-xl transition-all cursor-pointer ${
              activeTab === 'overview' ? 'bg-purple-600 text-white' : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
            }`} onClick={() => setActiveTab('overview')}>
              <Activity className="h-5 w-5" />
              <span className={activeTab === 'overview' ? 'font-medium' : ''}>Overview</span>
            </div>
            <div className={`flex items-center space-x-3 p-3 rounded-xl transition-all cursor-pointer ${
              activeTab === 'churches' ? 'bg-purple-600 text-white' : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
            }`} onClick={() => setActiveTab('churches')}>
              <Building2 className="h-5 w-5" />
              <span className={activeTab === 'churches' ? 'font-medium' : ''}>Churches</span>
            </div>
            <div className={`flex items-center space-x-3 p-3 rounded-xl transition-all cursor-pointer ${
              activeTab === 'payouts' ? 'bg-purple-600 text-white' : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
            }`} onClick={() => setActiveTab('payouts')}>
              <DollarSign className="h-5 w-5" />
              <span className={activeTab === 'payouts' ? 'font-medium' : ''}>Payouts</span>
            </div>
            <div className={`flex items-center space-x-3 p-3 rounded-xl transition-all cursor-pointer ${
              activeTab === 'members' ? 'bg-purple-600 text-white' : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
            }`} onClick={() => setActiveTab('members')}>
              <Users className="h-5 w-5" />
              <span className={activeTab === 'members' ? 'font-medium' : ''}>Members</span>
            </div>
            <div className={`flex items-center space-x-3 p-3 rounded-xl transition-all cursor-pointer ${
              activeTab === 'system' ? 'bg-purple-600 text-white' : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
            }`} onClick={() => setActiveTab('system')}>
              <Server className="h-5 w-5" />
              <span className={activeTab === 'system' ? 'font-medium' : ''}>System</span>
            </div>
          </nav>

          {/* Bottom Section */}
          <div className="mt-auto pt-12 space-y-2">
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

        {/* Main Content */}
        <div className="flex-1 p-6">
          {/* Top Section with Profile - Mobile Optimized */}
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 space-y-4 md:space-y-0">
            <div className="flex items-center space-x-6 w-full md:w-auto">
              {/* Search Bar */}
              <div className="relative flex-1 md:flex-initial">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search platform data..."
                  className="w-full md:w-80 pl-12 bg-gray-800/60 border-gray-700/50 text-white placeholder:text-gray-400 rounded-2xl h-12"
                />
              </div>
              
              {/* Notification Button */}
              <Button className="relative bg-gray-800/60 hover:bg-gray-700/60 text-white border-gray-700/50 rounded-2xl w-12 h-12 p-0 flex-shrink-0">
                <Bell className="h-5 w-5" />
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-400 rounded-full"></div>
              </Button>
            </div>
            
            {/* Profile Section */}
            <div className="flex items-center justify-between w-full md:w-auto md:space-x-6">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 rounded-full bg-yellow-400 flex items-center justify-center">
                  <Shield className="w-6 h-6 text-purple-900" />
                </div>
                <div className="text-left md:text-right">
                  <p className="text-white font-semibold">Super Admin</p>
                  <p className="text-gray-400 text-sm">Platform Oversight</p>
                </div>
              </div>
            </div>
          </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>

          <TabsContent value="overview" className="space-y-6">
            {/* Platform Statistics - Nomsa Style */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="bg-gradient-to-br from-purple-600 to-purple-700 border-0 text-white rounded-2xl">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm opacity-90 mb-2">Platform Revenue</p>
                      <p className="text-3xl font-bold">R {(mockPlatformStats.totalRevenue / 1000).toFixed(0)}k</p>
                    </div>
                    <div className="relative w-16 h-16">
                      <svg className="w-16 h-16 transform -rotate-90">
                        <circle cx="32" cy="32" r="28" stroke="currentColor" strokeWidth="4" fill="none" className="text-purple-400/30" />
                        <circle cx="32" cy="32" r="28" stroke="currentColor" strokeWidth="4" fill="none" strokeDasharray={`${2 * Math.PI * 28}`} strokeDashoffset={`${2 * Math.PI * 28 * (1 - 0.85)}`} className="text-white" />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-sm font-bold">+85%</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-pink-600 to-purple-600 border-0 text-white rounded-2xl">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm opacity-90 mb-2">Active Churches</p>
                      <p className="text-3xl font-bold">{mockPlatformStats.totalChurches}</p>
                    </div>
                    <div className="relative w-16 h-16">
                      <svg className="w-16 h-16 transform -rotate-90">
                        <circle cx="32" cy="32" r="28" stroke="currentColor" strokeWidth="4" fill="none" className="text-pink-400/30" />
                        <circle cx="32" cy="32" r="28" stroke="currentColor" strokeWidth="4" fill="none" strokeDasharray={`${2 * Math.PI * 28}`} strokeDashoffset={`${2 * Math.PI * 28 * (1 - 0.92)}`} className="text-white" />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-sm font-bold">+92%</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Additional Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="bg-gradient-to-br from-blue-600 to-indigo-600 border-0 text-white rounded-2xl">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm opacity-90 mb-2">Active Users</p>
                      <p className="text-2xl font-bold">{(mockPlatformStats.activeUsers / 1000).toFixed(1)}k</p>
                    </div>
                    <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
                      <Users className="w-6 h-6" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-green-600 to-emerald-600 border-0 text-white rounded-2xl">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm opacity-90 mb-2">System Health</p>
                      <p className="text-2xl font-bold">{mockPlatformStats.systemUptime}%</p>
                    </div>
                    <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
                      <Activity className="w-6 h-6" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-yellow-500 to-orange-500 border-0 text-white rounded-2xl">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm opacity-90 mb-2">Transactions</p>
                      <p className="text-2xl font-bold">{(mockPlatformStats.totalTransactions / 1000).toFixed(1)}k</p>
                    </div>
                    <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
                      <Receipt className="w-6 h-6" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Activity and Churches Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recent Churches */}
              <Card className="p-6 bg-gray-800/60 backdrop-blur-sm border border-gray-700/50 rounded-2xl">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-white">Recent Churches</h3>
                  <Button variant="outline" size="sm" onClick={() => setActiveTab('churches')} className="border-purple-500 text-purple-400 hover:bg-purple-500 hover:text-white">
                    View All
                  </Button>
                </div>
                <div className="space-y-4">
                  {mockPlatformStats.recentChurches.slice(0, 5).map((church) => (
                    <div key={church.id} className="flex items-center justify-between p-3 bg-gray-700/50 rounded-xl border border-gray-600/50">
                      <div className="flex items-center space-x-3">
                        <Avatar className="w-10 h-10">
                          <AvatarImage src={church.logo} />
                          <AvatarFallback className="bg-purple-600 text-white">
                            <Church className="w-5 h-5" />
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium text-white">{church.name}</p>
                          <p className="text-sm text-gray-400">{church.location} • {church.members} members</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge className={getStatusColor(church.status)}>
                          {church.status}
                        </Badge>
                        <p className="text-xs text-gray-500 mt-1">{church.joined}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>

              {/* System Performance */}
              <Card className="p-6 bg-gray-800/60 backdrop-blur-sm border border-gray-700/50 rounded-2xl">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-white">System Performance</h3>
                  <Button variant="outline" size="sm" onClick={() => setActiveTab('system')} className="border-purple-500 text-purple-400 hover:bg-purple-500 hover:text-white">
                    View Details
                  </Button>
                </div>
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-300">Server Uptime</span>
                      <span className="text-sm font-medium text-white">{mockPlatformStats.systemUptime}%</span>
                    </div>
                    <Progress value={mockPlatformStats.systemUptime} className="h-2 bg-gray-700" />
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-300">Success Rate</span>
                      <span className="text-sm font-medium text-white">{mockPlatformStats.successRate}%</span>
                    </div>
                    <Progress value={mockPlatformStats.successRate} className="h-2 bg-gray-700" />
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-300">Response Time</span>
                      <span className="text-sm font-medium text-white">{mockPlatformStats.avgResponseTime}ms</span>
                    </div>
                    <Progress value={100 - (mockPlatformStats.avgResponseTime / 10)} className="h-2 bg-gray-700" />
                  </div>
                </div>
              </Card>
            </div>

            {/* Commission Settings */}
            <Card className="p-6 bg-gradient-to-br from-yellow-500 to-orange-500 border-0 text-white rounded-2xl">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-white">Platform Commission</h3>
                  <p className="text-sm opacity-90">Current commission rate for all transactions</p>
                </div>
                <Button onClick={() => setShowCommissionModal(true)} size="sm" className="bg-white/20 hover:bg-white/30 text-white border-0">
                  <Edit className="w-4 h-4 mr-2" />
                  Update Rate
                </Button>
              </div>
              <div className="flex items-center space-x-6">
                <div className="text-center">
                  <p className="text-3xl font-bold text-white">{commissionRate}%</p>
                  <p className="text-sm opacity-90">Commission Rate</p>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-bold text-white">{formatCurrency(mockPlatformStats.commissionEarned)}</p>
                  <p className="text-sm opacity-90">Total Earned</p>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-bold text-white">{formatCurrency(mockPlatformStats.monthlyRevenue * (commissionRate / 100))}</p>
                  <p className="text-sm opacity-90">Monthly Commission</p>
                </div>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="churches" className="space-y-6">
            {/* Churches Management Header */}
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Church Management</h2>
                <p className="text-gray-600">Manage church registrations and approvals</p>
              </div>
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input placeholder="Search churches..." className="pl-10 w-64" />
                </div>
                <Button variant="outline" size="sm">
                  <Filter className="w-4 h-4 mr-2" />
                  Filter
                </Button>
              </div>
            </div>

            {/* Church Status Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card className="p-6 bg-white border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total Churches</p>
                    <p className="text-2xl font-bold text-gray-900">{mockPlatformStats.totalChurches}</p>
                  </div>
                  <Church className="w-8 h-8 text-blue-600" />
                </div>
              </Card>
              
              <Card className="p-6 bg-white border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Active</p>
                    <p className="text-2xl font-bold text-green-600">{mockPlatformStats.activeChurches}</p>
                  </div>
                  <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
              </Card>
              
              <Card className="p-6 bg-white border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Pending</p>
                    <p className="text-2xl font-bold text-yellow-600">{mockPlatformStats.pendingApprovals}</p>
                  </div>
                  <Clock className="w-8 h-8 text-yellow-600" />
                </div>
              </Card>
              
              <Card className="p-6 bg-white border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Suspended</p>
                    <p className="text-2xl font-bold text-red-600">{mockPlatformStats.suspendedChurches}</p>
                  </div>
                  <AlertTriangle className="w-8 h-8 text-red-600" />
                </div>
              </Card>
            </div>

            {/* Churches Table */}
            <Card className="bg-white border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">All Churches</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Church</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Members</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Revenue</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Joined</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {mockPlatformStats.recentChurches.map((church) => (
                      <tr key={church.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <Avatar className="w-10 h-10 mr-3">
                              <AvatarImage src={church.logo} />
                              <AvatarFallback>
                                <Church className="w-5 h-5" />
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="text-sm font-medium text-gray-900">{church.name}</div>
                              <div className="text-sm text-gray-500">{church.admin}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{church.location}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{church.members}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatCurrency(church.revenue)}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Badge className={getStatusColor(church.status)}>
                            {church.status}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{church.joined}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex items-center space-x-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setSelectedChurch(church);
                                setShowChurchModal(true);
                              }}
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button size="sm" variant="outline">
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
            {/* Payout Management Header */}
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Payout Management</h2>
                <p className="text-gray-600">Review and approve church payout requests</p>
              </div>
              <div className="flex items-center space-x-3">
                <Button variant="outline" size="sm">
                  <Download className="w-4 h-4 mr-2" />
                  Export Report
                </Button>
                <Button size="sm" className="bg-churpay-gradient text-white">
                  <Plus className="w-4 h-4 mr-2" />
                  Manual Payout
                </Button>
              </div>
            </div>

            {/* Payout Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card className="p-6 bg-white border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Pending Requests</p>
                    <p className="text-2xl font-bold text-yellow-600">{mockPlatformStats.payoutRequests.length}</p>
                  </div>
                  <Clock className="w-8 h-8 text-yellow-600" />
                </div>
              </Card>
              
              <Card className="p-6 bg-white border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total Amount</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {formatCurrency(mockPlatformStats.payoutRequests.reduce((sum, req) => sum + req.amount, 0))}
                    </p>
                  </div>
                  <DollarSign className="w-8 h-8 text-green-600" />
                </div>
              </Card>
              
              <Card className="p-6 bg-white border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Approved Today</p>
                    <p className="text-2xl font-bold text-green-600">12</p>
                  </div>
                  <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
              </Card>
              
              <Card className="p-6 bg-white border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Processing Time</p>
                    <p className="text-2xl font-bold text-blue-600">2.4h</p>
                  </div>
                  <Activity className="w-8 h-8 text-blue-600" />
                </div>
              </Card>
            </div>

            {/* Payout Requests Table */}
            <Card className="bg-white border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Pending Payout Requests</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Church</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Request Date</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Bank Details</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {mockPlatformStats.payoutRequests.map((request) => (
                      <tr key={request.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">{request.church}</div>
                            <div className="text-sm text-gray-500">{request.admin}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{formatCurrency(request.amount)}</div>
                          <div className="text-sm text-gray-500">Balance: {formatCurrency(request.availableBalance)}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Badge className="bg-blue-100 text-blue-800 capitalize">
                            {request.category}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{request.requestDate}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{request.bankDetails}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex items-center space-x-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setSelectedPayoutRequest(request);
                                setShowPayoutModal(true);
                              }}
                            >
                              <Eye className="w-4 h-4 mr-1" />
                              Review
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
            {/* Members Management */}
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Member Management</h2>
                <p className="text-gray-600">Platform member overview and management</p>
              </div>
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input placeholder="Search members..." className="pl-10 w-64" />
                </div>
                <Button variant="outline" size="sm">
                  <Download className="w-4 h-4 mr-2" />
                  Export Members
                </Button>
              </div>
            </div>

            {/* Member Statistics */}
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
                    <p className="text-2xl font-bold text-green-600">12,458</p>
                  </div>
                  <UserCheck className="w-8 h-8 text-green-600" />
                </div>
              </Card>
              
              <Card className="p-6 bg-white border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">New This Week</p>
                    <p className="text-2xl font-bold text-purple-600">247</p>
                  </div>
                  <Plus className="w-8 h-8 text-purple-600" />
                </div>
              </Card>
              
              <Card className="p-6 bg-white border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Average Donation</p>
                    <p className="text-2xl font-bold text-yellow-600">R420</p>
                  </div>
                  <Heart className="w-8 h-8 text-yellow-600" />
                </div>
              </Card>
            </div>

            {/* Recent Members Table */}
            <Card className="bg-white border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Recent Member Registrations</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Member</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Church</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Joined</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Donations</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {registrations.members.slice(0, 10).map((member, index) => (
                      <tr key={member.id || index} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <Avatar className="w-10 h-10 mr-3">
                              <AvatarFallback>
                                <User className="w-5 h-5" />
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="text-sm font-medium text-gray-900">{member.fullName}</div>
                              <div className="text-sm text-gray-500">{member.email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{member.churchName}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{member.submittedAt}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">R0</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Badge className="bg-green-100 text-green-800">Active</Badge>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <Button size="sm" variant="outline">
                            <Eye className="w-4 h-4" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="system" className="space-y-6">
            {/* System Management */}
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">System Management</h2>
                <p className="text-gray-600">Platform performance, security, and configuration</p>
              </div>
              <div className="flex items-center space-x-3">
                <Button variant="outline" size="sm">
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Refresh
                </Button>
                <Button size="sm" className="bg-churpay-gradient text-white">
                  <Settings className="w-4 h-4 mr-2" />
                  System Settings
                </Button>
              </div>
            </div>

            {/* System Health Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="p-6 bg-white border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Server Uptime</p>
                    <p className="text-2xl font-bold text-green-600">{mockPlatformStats.systemUptime}%</p>
                    <p className="text-sm text-gray-500">30 days</p>
                  </div>
                  <Server className="w-8 h-8 text-green-600" />
                </div>
              </Card>
              
              <Card className="p-6 bg-white border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Response Time</p>
                    <p className="text-2xl font-bold text-blue-600">{mockPlatformStats.avgResponseTime}ms</p>
                    <p className="text-sm text-gray-500">Average</p>
                  </div>
                  <Zap className="w-8 h-8 text-blue-600" />
                </div>
              </Card>
              
              <Card className="p-6 bg-white border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Success Rate</p>
                    <p className="text-2xl font-bold text-purple-600">{mockPlatformStats.successRate}%</p>
                    <p className="text-sm text-gray-500">Transactions</p>
                  </div>
                  <CheckCircle className="w-8 h-8 text-purple-600" />
                </div>
              </Card>
              
              <Card className="p-6 bg-white border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Security Score</p>
                    <p className="text-2xl font-bold text-orange-600">98.5</p>
                    <p className="text-sm text-gray-500">High</p>
                  </div>
                  <Shield className="w-8 h-8 text-orange-600" />
                </div>
              </Card>
            </div>

            {/* System Components */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="p-6 bg-white border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">System Components</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 border border-gray-100 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Database className="w-5 h-5 text-blue-600" />
                      <div>
                        <p className="font-medium text-gray-900">Database</p>
                        <p className="text-sm text-gray-600">PostgreSQL 15.0</p>
                      </div>
                    </div>
                    <Badge className="bg-green-100 text-green-800">Online</Badge>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 border border-gray-100 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Server className="w-5 h-5 text-green-600" />
                      <div>
                        <p className="font-medium text-gray-900">API Server</p>
                        <p className="text-sm text-gray-600">Node.js 18.0</p>
                      </div>
                    </div>
                    <Badge className="bg-green-100 text-green-800">Online</Badge>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 border border-gray-100 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Globe className="w-5 h-5 text-purple-600" />
                      <div>
                        <p className="font-medium text-gray-900">CDN</p>
                        <p className="text-sm text-gray-600">CloudFlare</p>
                      </div>
                    </div>
                    <Badge className="bg-green-100 text-green-800">Online</Badge>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 border border-gray-100 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <CreditCard className="w-5 h-5 text-orange-600" />
                      <div>
                        <p className="font-medium text-gray-900">Payment Gateway</p>
                        <p className="text-sm text-gray-600">PayFast</p>
                      </div>
                    </div>
                    <Badge className="bg-green-100 text-green-800">Online</Badge>
                  </div>
                </div>
              </Card>

              <Card className="p-6 bg-white border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent System Activity</h3>
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 rounded-full bg-green-600 mt-2"></div>
                    <div>
                      <p className="text-sm text-gray-900">System backup completed successfully</p>
                      <p className="text-xs text-gray-500">2 minutes ago</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 rounded-full bg-blue-600 mt-2"></div>
                    <div>
                      <p className="text-sm text-gray-900">Database maintenance completed</p>
                      <p className="text-xs text-gray-500">1 hour ago</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 rounded-full bg-yellow-600 mt-2"></div>
                    <div>
                      <p className="text-sm text-gray-900">Security scan initiated</p>
                      <p className="text-xs text-gray-500">3 hours ago</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 rounded-full bg-purple-600 mt-2"></div>
                    <div>
                      <p className="text-sm text-gray-900">API rate limits adjusted</p>
                      <p className="text-xs text-gray-500">6 hours ago</p>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
        </div>
      </div>

      {/* Modals */}
      
      {/* Commission Rate Modal */}
      <Dialog open={showCommissionModal} onOpenChange={setShowCommissionModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Update Commission Rate</DialogTitle>
            <DialogDescription>
              Set the platform commission rate for all transactions. Current rate is {commissionRate}%.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                New Commission Rate (%)
              </label>
              <Input
                type="number"
                step="0.1"
                min="0"
                max="15"
                value={tempCommissionRate}
                onChange={(e) => setTempCommissionRate(e.target.value)}
                placeholder={commissionRate.toString()}
              />
              <p className="text-xs text-gray-500 mt-1">
                Commission rate must be between 0% and 15%
              </p>
            </div>
            <div className="flex space-x-3">
              <Button
                onClick={() => {
                  const newRate = parseFloat(tempCommissionRate);
                  if (newRate >= 0 && newRate <= 15) {
                    setCommissionRate(newRate);
                    localStorage.setItem('churpay-commission-rate', newRate.toString());
                    setShowCommissionModal(false);
                    setTempCommissionRate('');
                  }
                }}
                className="flex-1 bg-churpay-gradient text-white"
              >
                <Save className="w-4 h-4 mr-2" />
                Update Rate
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setShowCommissionModal(false);
                  setTempCommissionRate('');
                }}
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Payout Review Modal */}
      <Dialog open={showPayoutModal} onOpenChange={setShowPayoutModal}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Review Payout Request</DialogTitle>
            <DialogDescription>
              Carefully review the payout request details before making a decision.
            </DialogDescription>
          </DialogHeader>
          {selectedPayoutRequest && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Church Details</h4>
                  <p className="text-sm text-gray-600">Church: {selectedPayoutRequest.church}</p>
                  <p className="text-sm text-gray-600">Admin: {selectedPayoutRequest.admin}</p>
                  <p className="text-sm text-gray-600">Total Revenue: {formatCurrency(selectedPayoutRequest.churchRevenue)}</p>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Request Details</h4>
                  <p className="text-sm text-gray-600">Amount: {formatCurrency(selectedPayoutRequest.amount)}</p>
                  <p className="text-sm text-gray-600">Category: {selectedPayoutRequest.category}</p>
                  <p className="text-sm text-gray-600">Request Date: {selectedPayoutRequest.requestDate}</p>
                </div>
              </div>
              
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Description</h4>
                <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                  {selectedPayoutRequest.description}
                </p>
              </div>
              
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Bank Details</h4>
                <p className="text-sm text-gray-600">{selectedPayoutRequest.bankDetails}</p>
                <p className="text-sm text-gray-600">Available Balance: {formatCurrency(selectedPayoutRequest.availableBalance)}</p>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Decision Notes (Optional)
                </label>
                <Textarea
                  value={payoutNotes}
                  onChange={(e) => setPayoutNotes(e.target.value)}
                  placeholder="Add any notes about your decision..."
                  rows={3}
                />
              </div>
              
              <div className="flex space-x-3">
                <Button
                  onClick={() => handlePayoutDecision(selectedPayoutRequest, 'Approved')}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Approve Payout
                </Button>
                <Button
                  onClick={() => handlePayoutDecision(selectedPayoutRequest, 'Rejected')}
                  variant="outline"
                  className="flex-1 border-red-300 text-red-600 hover:bg-red-50"
                >
                  <X className="w-4 h-4 mr-2" />
                  Reject Request
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Church Review Modal */}
      <Dialog open={showChurchModal} onOpenChange={setShowChurchModal}>
        <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Church Application Review</DialogTitle>
            <DialogDescription>
              Review the church registration details and make an approval decision.
            </DialogDescription>
          </DialogHeader>
          {selectedChurch && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Church Information</h4>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-3">
                      {selectedChurch.logo ? (
                        <Avatar className="w-12 h-12">
                          <AvatarImage src={selectedChurch.logo} />
                          <AvatarFallback><Church className="w-6 h-6" /></AvatarFallback>
                        </Avatar>
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
                          <Church className="w-6 h-6 text-gray-400" />
                        </div>
                      )}
                      <div>
                        <p className="font-medium text-gray-900">{selectedChurch.name}</p>
                        <p className="text-sm text-gray-600">{selectedChurch.denomination}</p>
                      </div>
                    </div>
                    {selectedChurch.establishedYear && (
                      <p className="text-sm text-gray-600">Established: {selectedChurch.establishedYear}</p>
                    )}
                    {selectedChurch.description && (
                      <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg mt-3">
                        {selectedChurch.description}
                      </p>
                    )}
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Contact Information</h4>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <User className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-600">
                        {selectedChurch.contactTitle} {selectedChurch.admin}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Mail className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-600">{selectedChurch.email}</span>
                    </div>
                    {selectedChurch.phone && (
                      <div className="flex items-center space-x-2">
                        <Phone className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-600">{selectedChurch.phone}</span>
                      </div>
                    )}
                    {selectedChurch.website && (
                      <div className="flex items-center space-x-2">
                        <Globe className="w-4 h-4 text-gray-400" />
                        <a href={selectedChurch.website} target="_blank" rel="noopener noreferrer" 
                           className="text-sm text-blue-600 hover:underline">
                          {selectedChurch.website}
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Address</h4>
                  <div className="space-y-1">
                    {selectedChurch.streetAddress && (
                      <p className="text-sm text-gray-600">{selectedChurch.streetAddress}</p>
                    )}
                    <p className="text-sm text-gray-600">
                      {selectedChurch.city}, {selectedChurch.province}
                    </p>
                    {selectedChurch.postalCode && (
                      <p className="text-sm text-gray-600">{selectedChurch.postalCode}</p>
                    )}
                    {selectedChurch.country && (
                      <p className="text-sm text-gray-600">{selectedChurch.country}</p>
                    )}
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Statistics</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Members:</span>
                      <span className="text-sm font-medium text-gray-900">{selectedChurch.members}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Revenue:</span>
                      <span className="text-sm font-medium text-gray-900">{formatCurrency(selectedChurch.revenue)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Growth:</span>
                      <span className="text-sm font-medium text-green-600">+{selectedChurch.monthlyGrowth}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Joined:</span>
                      <span className="text-sm font-medium text-gray-900">{selectedChurch.joined}</span>
                    </div>
                  </div>
                </div>
              </div>
              
              {selectedChurch.bankName && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Banking Details</h4>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-600">Bank: {selectedChurch.bankName}</p>
                        <p className="text-sm text-gray-600">Account Name: {selectedChurch.accountName}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Account Number: {selectedChurch.accountNumber}</p>
                        <p className="text-sm text-gray-600">Branch Code: {selectedChurch.branchCode}</p>
                        <p className="text-sm text-gray-600">Account Type: {selectedChurch.accountType}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Decision Notes (Optional)
                </label>
                <Textarea
                  value={churchNotes}
                  onChange={(e) => setChurchNotes(e.target.value)}
                  placeholder="Add any notes about your decision..."
                  rows={3}
                />
              </div>
              
              <div className="flex space-x-3">
                <Button
                  onClick={() => handleChurchDecision(selectedChurch, 'Approved')}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Approve Church
                </Button>
                <Button
                  onClick={() => handleChurchDecision(selectedChurch, 'Rejected')}
                  variant="outline"
                  className="flex-1 border-red-300 text-red-600 hover:bg-red-50"
                >
                  <X className="w-4 h-4 mr-2" />
                  Reject Application
                </Button>
                <Button
                  onClick={() => handleChurchDecision(selectedChurch, 'Under Review')}
                  variant="outline"
                  className="flex-1 border-blue-300 text-blue-600 hover:bg-blue-50"
                >
                  <Clock className="w-4 h-4 mr-2" />
                  Request More Info
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}