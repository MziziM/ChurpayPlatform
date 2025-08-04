import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
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
import { FinancialTrendsChart } from './FinancialTrendsChart';

interface SuperAdminDashboardProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SuperAdminDashboard({ isOpen, onClose }: SuperAdminDashboardProps) {
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
    return saved ? parseFloat(saved) : 3.9; // ChurPay standard rate
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
      },
      { 
        id: 4, 
        name: 'Hope Presbyterian', 
        location: 'Pretoria', 
        members: 198, 
        status: 'Under Review', 
        joined: '2024-01-05', 
        revenue: 24380,
        monthlyGrowth: 12.1,
        admin: 'David Brown',
        email: 'admin@hopepres.org.za',
        phone: '+27 12 456 7890',
        logo: null
      },
      { 
        id: 5, 
        name: 'Unity Christian Center', 
        location: 'Port Elizabeth', 
        members: 87, 
        status: 'Suspended', 
        joined: '2024-01-14', 
        revenue: 12450,
        monthlyGrowth: -15.2,
        admin: 'Lisa Davis',
        email: 'admin@unitychristian.org.za',
        phone: '+27 41 567 8901',
        logo: null
      }
    ].slice(0, 10),
    recentMembers: [
      ...registrations.members.map((member: any, index: number) => ({
        id: member.id || (2000 + index),
        firstName: member.firstName,
        lastName: member.lastName,
        email: member.email,
        phone: member.phone,
        address: member.address,
        dateOfBirth: member.dateOfBirth,
        membershipType: member.membershipType || 'member',
        churchName: member.churchName || member.selectedChurch?.name,
        churchId: member.churchId || member.selectedChurch?.id,
        joinedAt: member.submittedAt || new Date().toISOString(),
        status: 'Active',
        avatar: `https://images.unsplash.com/photo-${Math.random() > 0.5 ? '1507003211169-0a1dd7228f2d' : '1438761681033-6461ffad8d80'}?w=100&h=100&fit=crop&crop=face`,
        isNewRegistration: true,
        totalDonations: Math.floor(Math.random() * 5000) + 500,
        lastDonation: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      })),
      {
        id: 101,
        firstName: 'Sarah',
        lastName: 'Johnson',
        email: 'sarah.johnson@email.com',
        phone: '+27 82 123 4567',
        address: 'Cape Town, Western Cape',
        membershipType: 'member',
        churchName: 'Grace Baptist Church',
        churchId: 1,
        joinedAt: '2024-01-05',
        status: 'Active',
        avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face',
        totalDonations: 12500,
        lastDonation: '2024-01-15'
      },
      {
        id: 102,
        firstName: 'David',
        lastName: 'Williams',
        email: 'david.williams@email.com',
        phone: '+27 83 234 5678',
        address: 'Johannesburg, Gauteng',
        membershipType: 'volunteer',
        churchName: 'Faith Community Church',
        churchId: 3,
        joinedAt: '2024-01-03',
        status: 'Active',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face',
        totalDonations: 8750,
        lastDonation: '2024-01-14'
      }
    ].slice(0, 12),
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

  const handlePayoutDecision = (decision: string) => {
    if (!selectedPayoutRequest) return;
    
    // Update payout request status
    setPayoutDecision(decision);
    setShowPayoutModal(false);
    
    // Reset states
    setSelectedPayoutRequest(null);
    setPayoutDecision('');
    setPayoutNotes('');
  };

  const handleChurchDecision = (decision: string) => {
    if (!selectedChurch) return;
    
    // Update church status
    setChurchDecision(decision);
    setShowChurchModal(false);
    
    // Reset states
    setSelectedChurch(null);
    setChurchDecision('');
    setChurchNotes('');
  };

  const updateCommissionRate = () => {
    const newRate = parseFloat(tempCommissionRate);
    if (newRate >= 0 && newRate <= 10) {
      setCommissionRate(newRate);
      localStorage.setItem('churpay-commission-rate', newRate.toString());
      setShowCommissionModal(false);
      setTempCommissionRate('');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active': return 'bg-green-100 text-green-800 border-green-200';
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'under review': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'suspended': return 'bg-red-100 text-red-800 border-red-200';
      case 'approved': return 'bg-green-100 text-green-800 border-green-200';
      case 'rejected': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const renderOverviewTab = () => (
    <div className="space-y-6">
      {/* Professional Welcome Section with ChurPay Super Admin Branding */}
      <div className="bg-churpay-gradient rounded-xl p-6 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-16 translate-x-16"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-12 -translate-x-12"></div>
        
        <div className="relative">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                <Crown className="h-6 w-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">ChurPay Super Admin</h2>
                <p className="text-purple-100 flex items-center">
                  <Shield className="h-4 w-4 mr-2" />
                  Platform Management Dashboard
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-purple-100 text-sm">System Status</p>
              <p className="text-2xl font-bold flex items-center">
                <CheckCircle className="h-6 w-6 mr-2" />
                Online
              </p>
            </div>
          </div>
          
          <div className="grid grid-cols-4 gap-4">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
              <div className="flex items-center space-x-2 mb-2">
                <Church className="h-4 w-4 text-purple-100" />
                <p className="text-purple-100 text-sm">Total Churches</p>
              </div>
              <p className="text-2xl font-bold">{mockPlatformStats.totalChurches}</p>
              <p className="text-purple-200 text-xs">Active: {mockPlatformStats.activeChurches}</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
              <div className="flex items-center space-x-2 mb-2">
                <DollarSign className="h-4 w-4 text-purple-100" />
                <p className="text-purple-100 text-sm">Platform Revenue</p>
              </div>
              <p className="text-2xl font-bold">R {mockPlatformStats.totalRevenue.toLocaleString()}</p>
              <p className="text-purple-200 text-xs">This month: R {mockPlatformStats.monthlyRevenue.toLocaleString()}</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
              <div className="flex items-center space-x-2 mb-2">
                <Users className="h-4 w-4 text-purple-100" />
                <p className="text-purple-100 text-sm">Active Users</p>
              </div>
              <p className="text-2xl font-bold">{mockPlatformStats.activeUsers.toLocaleString()}</p>
              <p className="text-purple-200 text-xs">Growth: +{mockPlatformStats.platformGrowthRate}%</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
              <div className="flex items-center space-x-2 mb-2">
                <Activity className="h-4 w-4 text-purple-100" />
                <p className="text-purple-100 text-sm">System Health</p>
              </div>
              <p className="text-2xl font-bold">{mockPlatformStats.systemUptime}%</p>
              <p className="text-purple-200 text-xs">Uptime: {mockPlatformStats.avgResponseTime}ms avg</p>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Quick Actions with Professional Design */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="hover:shadow-lg transition-all duration-200 cursor-pointer group" onClick={() => setActiveTab('churches')}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 group-hover:text-purple-600 transition-colors">Manage</p>
                <p className="text-lg font-bold text-gray-900">Churches</p>
              </div>
              <div className="w-10 h-10 bg-churpay-gradient rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                <Church className="h-5 w-5 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="hover:shadow-lg transition-all duration-200 cursor-pointer group" onClick={() => setActiveTab('payouts')}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 group-hover:text-purple-600 transition-colors">Process</p>
                <p className="text-lg font-bold text-gray-900">Payouts</p>
              </div>
              <div className="w-10 h-10 bg-churpay-gradient rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                <CreditCard className="h-5 w-5 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="hover:shadow-lg transition-all duration-200 cursor-pointer group" onClick={() => setActiveTab('members')}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 group-hover:text-purple-600 transition-colors">View</p>
                <p className="text-lg font-bold text-gray-900">Members</p>
              </div>
              <div className="w-10 h-10 bg-churpay-gradient rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                <Users className="h-5 w-5 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="hover:shadow-lg transition-all duration-200 cursor-pointer group" onClick={() => setActiveTab('system')}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 group-hover:text-purple-600 transition-colors">Monitor</p>
                <p className="text-lg font-bold text-gray-900">System</p>
              </div>
              <div className="w-10 h-10 bg-churpay-gradient rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                <Server className="h-5 w-5 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Pending Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold flex items-center">
                <AlertTriangle className="h-5 w-5 mr-2 text-orange-600" />
                Pending Church Approvals
              </h3>
              <Badge className="bg-orange-100 text-orange-800">
                {mockPlatformStats.pendingApprovals}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {mockPlatformStats.recentChurches
                .filter(church => church.status === 'Pending' || church.status === 'Under Review')
                .slice(0, 3)
                .map((church) => (
                <div key={church.id} className="flex items-center justify-between p-3 bg-orange-50 rounded-lg border border-orange-100">
                  <div className="flex items-center space-x-3">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={church.logo} alt={church.name} />
                      <AvatarFallback>{church.name[0]}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium text-gray-900">{church.name}</p>
                      <p className="text-sm text-gray-600">{church.location} • {church.members} members</p>
                    </div>
                  </div>
                  <Button 
                    size="sm" 
                    className="bg-churpay-gradient text-white"
                    onClick={() => {
                      setSelectedChurch(church);
                      setShowChurchModal(true);
                    }}
                  >
                    Review
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold flex items-center">
                <Clock className="h-5 w-5 mr-2 text-blue-600" />
                Pending Payouts
              </h3>
              <Badge className="bg-blue-100 text-blue-800">
                {mockPlatformStats.payoutRequests.filter(p => p.status === 'pending').length}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {mockPlatformStats.payoutRequests
                .filter(request => request.status === 'pending')
                .slice(0, 3)
                .map((request) => (
                <div key={request.id} className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-100">
                  <div>
                    <p className="font-medium text-gray-900">{request.church}</p>
                    <p className="text-sm text-gray-600">R {request.amount.toLocaleString()} • {request.category}</p>
                  </div>
                  <Button 
                    size="sm" 
                    className="bg-churpay-gradient text-white"
                    onClick={() => {
                      setSelectedPayoutRequest(request);
                      setShowPayoutModal(true);
                    }}
                  >
                    Process
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const renderChurchesTab = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Church Management</h2>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4 mr-2" />
            Filter
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-3">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{mockPlatformStats.activeChurches}</p>
            <p className="text-sm text-gray-600">Active Churches</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mx-auto mb-3">
              <Clock className="h-6 w-6 text-orange-600" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{mockPlatformStats.pendingApprovals}</p>
            <p className="text-sm text-gray-600">Pending Approval</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mx-auto mb-3">
              <AlertTriangle className="h-6 w-6 text-red-600" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{mockPlatformStats.suspendedChurches}</p>
            <p className="text-sm text-gray-600">Suspended</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-3">
              <TrendingUp className="h-6 w-6 text-purple-600" />
            </div>
            <p className="text-2xl font-bold text-gray-900">+{mockPlatformStats.platformGrowthRate}%</p>
            <p className="text-sm text-gray-600">Monthly Growth</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">All Churches</h3>
            <div className="flex items-center space-x-2">
              <div className="relative">
                <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <Input placeholder="Search churches..." className="pl-10 w-64" />
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {mockPlatformStats.recentChurches.map((church) => (
              <div key={church.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                <div className="flex items-center space-x-4">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={church.logo} alt={church.name} />
                    <AvatarFallback>{church.name[0]}</AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="flex items-center space-x-2">
                      <h4 className="font-semibold text-gray-900">{church.name}</h4>
                      {church.isNewRegistration && (
                        <Badge className="bg-yellow-100 text-yellow-800 text-xs">New</Badge>
                      )}
                    </div>
                    <p className="text-sm text-gray-600">{church.location} • {church.members} members</p>
                    <p className="text-sm text-gray-500">Admin: {church.admin}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <p className="font-medium text-gray-900">R {church.revenue.toLocaleString()}</p>
                    <p className="text-sm text-gray-600">Monthly Revenue</p>
                  </div>
                  <Badge className={getStatusColor(church.status)}>
                    {church.status}
                  </Badge>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => {
                      setSelectedChurch(church);
                      setShowChurchModal(true);
                    }}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderPayoutsTab = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Payout Management</h2>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4 mr-2" />
            Filter
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-3">
              <Clock className="h-6 w-6 text-blue-600" />
            </div>
            <p className="text-2xl font-bold text-gray-900">
              {mockPlatformStats.payoutRequests.filter(p => p.status === 'pending').length}
            </p>
            <p className="text-sm text-gray-600">Pending Requests</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-3">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <p className="text-2xl font-bold text-gray-900">
              {mockPlatformStats.payoutRequests.filter(p => p.status === 'approved').length}
            </p>
            <p className="text-sm text-gray-600">Approved Today</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-3">
              <DollarSign className="h-6 w-6 text-purple-600" />
            </div>
            <p className="text-2xl font-bold text-gray-900">
              R {mockPlatformStats.payoutRequests
                .filter(p => p.status === 'approved')
                .reduce((sum, p) => sum + p.amount, 0)
                .toLocaleString()}
            </p>
            <p className="text-sm text-gray-600">Total Processed</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold">Payout Requests</h3>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {mockPlatformStats.payoutRequests.map((request) => (
              <div key={request.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-churpay-gradient rounded-lg flex items-center justify-center">
                    <CreditCard className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">{request.church}</h4>
                    <p className="text-sm text-gray-600">{request.description}</p>
                    <p className="text-sm text-gray-500">Requested: {request.requestDate}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <p className="font-bold text-lg text-gray-900">R {request.amount.toLocaleString()}</p>
                    <p className="text-sm text-gray-600">{request.category}</p>
                  </div>
                  <Badge className={getStatusColor(request.status)}>
                    {request.status}
                  </Badge>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => {
                      setSelectedPayoutRequest(request);
                      setShowPayoutModal(true);
                    }}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderMembersTab = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Member Management</h2>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4 mr-2" />
            Filter
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-3">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{mockPlatformStats.activeUsers.toLocaleString()}</p>
            <p className="text-sm text-gray-600">Total Members</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-3">
              <UserCheck className="h-6 w-6 text-green-600" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{registrations.members.length}</p>
            <p className="text-sm text-gray-600">New This Month</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-3">
              <Heart className="h-6 w-6 text-purple-600" />
            </div>
            <p className="text-2xl font-bold text-gray-900">
              R {mockPlatformStats.recentMembers
                .reduce((sum, member) => sum + (member.totalDonations || 0), 0)
                .toLocaleString()}
            </p>
            <p className="text-sm text-gray-600">Total Donations</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mx-auto mb-3">
              <TrendingUp className="h-6 w-6 text-orange-600" />
            </div>
            <p className="text-2xl font-bold text-gray-900">+{mockPlatformStats.platformGrowthRate}%</p>
            <p className="text-sm text-gray-600">Member Growth</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">All Members</h3>
            <div className="relative">
              <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input placeholder="Search members..." className="pl-10 w-64" />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {mockPlatformStats.recentMembers.map((member) => (
              <div key={member.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                <div className="flex items-center space-x-4">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={member.avatar} alt={`${member.firstName} ${member.lastName}`} />
                    <AvatarFallback>{member.firstName[0]}{member.lastName[0]}</AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="flex items-center space-x-2">
                      <h4 className="font-semibold text-gray-900">{member.firstName} {member.lastName}</h4>
                      {member.isNewRegistration && (
                        <Badge className="bg-yellow-100 text-yellow-800 text-xs">New</Badge>
                      )}
                    </div>
                    <p className="text-sm text-gray-600">{member.email}</p>
                    <p className="text-sm text-gray-500">{member.churchName}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <p className="font-medium text-gray-900">R {(member.totalDonations || 0).toLocaleString()}</p>
                    <p className="text-sm text-gray-600">Total Donations</p>
                  </div>
                  <Badge className="bg-green-100 text-green-800">
                    {member.status}
                  </Badge>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => {
                      setSelectedMember(member);
                      setShowMemberModal(true);
                    }}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderSystemTab = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">System Management</h2>
        <Button 
          className="bg-churpay-gradient text-white"
          onClick={() => setShowCommissionModal(true)}
        >
          <Settings className="h-4 w-4 mr-2" />
          Platform Settings
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-3">
              <Server className="h-6 w-6 text-green-600" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{mockPlatformStats.systemUptime}%</p>
            <p className="text-sm text-gray-600">System Uptime</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-3">
              <Zap className="h-6 w-6 text-blue-600" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{mockPlatformStats.avgResponseTime}ms</p>
            <p className="text-sm text-gray-600">Avg Response</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-3">
              <Shield className="h-6 w-6 text-purple-600" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{mockPlatformStats.successRate}%</p>
            <p className="text-sm text-gray-600">Success Rate</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mx-auto mb-3">
              <DollarSign className="h-6 w-6 text-orange-600" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{commissionRate}%</p>
            <p className="text-sm text-gray-600">Commission Rate</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold flex items-center">
              <Activity className="h-5 w-5 mr-2 text-purple-600" />
              System Performance
            </h3>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>CPU Usage</span>
                  <span>45%</span>
                </div>
                <Progress value={45} className="h-2" />
              </div>
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Memory Usage</span>
                  <span>68%</span>
                </div>
                <Progress value={68} className="h-2" />
              </div>
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Disk Usage</span>
                  <span>32%</span>
                </div>
                <Progress value={32} className="h-2" />
              </div>
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Network</span>
                  <span>Good</span>
                </div>
                <Progress value={85} className="h-2" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold flex items-center">
              <DollarSign className="h-5 w-5 mr-2 text-green-600" />
              Revenue Analytics
            </h3>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Platform Fee Rate</span>
                <span className="font-medium">{commissionRate}% + R3</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Total Transactions</span>
                <span className="font-medium">{mockPlatformStats.totalTransactions.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Commission Earned</span>
                <span className="font-medium text-green-600">R {mockPlatformStats.commissionEarned.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Monthly Revenue</span>
                <span className="font-medium">R {mockPlatformStats.monthlyRevenue.toLocaleString()}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-7xl max-h-[95vh] overflow-hidden p-0">
        <DialogHeader className="p-6 pb-0">
          <DialogTitle className="text-2xl font-bold flex items-center">
            <Crown className="h-6 w-6 mr-2 text-purple-600" />
            ChurPay Super Admin Dashboard
          </DialogTitle>
          <DialogDescription>
            Comprehensive platform management and oversight
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex-1 overflow-hidden">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
            <div className="px-6">
              <TabsList className="grid w-full grid-cols-6">
                <TabsTrigger 
                  value="overview"
                  className="data-[state=active]:bg-churpay-gradient data-[state=active]:text-white"
                >
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Overview
                </TabsTrigger>
                <TabsTrigger 
                  value="churches"
                  className="data-[state=active]:bg-churpay-gradient data-[state=active]:text-white"
                >
                  <Church className="h-4 w-4 mr-2" />
                  Churches
                </TabsTrigger>
                <TabsTrigger 
                  value="payouts"
                  className="data-[state=active]:bg-churpay-gradient data-[state=active]:text-white"
                >
                  <CreditCard className="h-4 w-4 mr-2" />
                  Payouts
                </TabsTrigger>
                <TabsTrigger 
                  value="members"
                  className="data-[state=active]:bg-churpay-gradient data-[state=active]:text-white"
                >
                  <Users className="h-4 w-4 mr-2" />
                  Members
                </TabsTrigger>
                <TabsTrigger 
                  value="analytics"
                  className="data-[state=active]:bg-churpay-gradient data-[state=active]:text-white"
                >
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Analytics
                </TabsTrigger>
                <TabsTrigger 
                  value="system"
                  className="data-[state=active]:bg-churpay-gradient data-[state=active]:text-white"
                >
                  <Server className="h-4 w-4 mr-2" />
                  System
                </TabsTrigger>
              </TabsList>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6 pt-4">
              <TabsContent value="overview" className="mt-0">
                {renderOverviewTab()}
              </TabsContent>
              <TabsContent value="churches" className="mt-0">
                {renderChurchesTab()}
              </TabsContent>
              <TabsContent value="payouts" className="mt-0">
                {renderPayoutsTab()}
              </TabsContent>
              <TabsContent value="members" className="mt-0">
                {renderMembersTab()}
              </TabsContent>
              <TabsContent value="analytics" className="mt-0">
                {renderAnalyticsTab()}
              </TabsContent>
              <TabsContent value="system" className="mt-0">
                {renderSystemTab()}
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </DialogContent>

      {/* Payout Request Modal */}
      <Dialog open={showPayoutModal} onOpenChange={setShowPayoutModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Process Payout Request</DialogTitle>
            <DialogDescription>
              Review and approve or reject this payout request
            </DialogDescription>
          </DialogHeader>
          
          {selectedPayoutRequest && (
            <div className="space-y-6">
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold text-lg mb-2">{selectedPayoutRequest.church}</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600">Request Amount</p>
                    <p className="font-medium">R {selectedPayoutRequest.amount.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Category</p>
                    <p className="font-medium">{selectedPayoutRequest.category}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Available Balance</p>
                    <p className="font-medium">R {selectedPayoutRequest.availableBalance.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Bank Details</p>
                    <p className="font-medium">{selectedPayoutRequest.bankDetails}</p>
                  </div>
                </div>
                <div className="mt-4">
                  <p className="text-gray-600 text-sm">Description</p>
                  <p className="font-medium">{selectedPayoutRequest.description}</p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Processing Notes
                </label>
                <Textarea
                  value={payoutNotes}
                  onChange={(e) => setPayoutNotes(e.target.value)}
                  placeholder="Add notes about this decision..."
                  rows={3}
                />
              </div>

              <div className="flex space-x-3">
                <Button
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                  onClick={() => handlePayoutDecision('approved')}
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Approve Payout
                </Button>
                <Button
                  variant="destructive"
                  className="flex-1"
                  onClick={() => handlePayoutDecision('rejected')}
                >
                  <X className="h-4 w-4 mr-2" />
                  Reject Request
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Church Management Modal */}
      <Dialog open={showChurchModal} onOpenChange={setShowChurchModal}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Church Management</DialogTitle>
            <DialogDescription>
              Review church details and manage status
            </DialogDescription>
          </DialogHeader>
          
          {selectedChurch && (
            <div className="space-y-6">
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center space-x-4 mb-4">
                  <Avatar className="h-16 w-16">
                    <AvatarImage src={selectedChurch.logo} alt={selectedChurch.name} />
                    <AvatarFallback className="text-lg">{selectedChurch.name[0]}</AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-semibold text-xl">{selectedChurch.name}</h3>
                    <p className="text-gray-600">{selectedChurch.location}</p>
                    <Badge className={getStatusColor(selectedChurch.status)}>
                      {selectedChurch.status}
                    </Badge>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600">Admin Contact</p>
                    <p className="font-medium">{selectedChurch.admin}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Members</p>
                    <p className="font-medium">{selectedChurch.members}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Email</p>
                    <p className="font-medium">{selectedChurch.email}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Phone</p>
                    <p className="font-medium">{selectedChurch.phone}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Monthly Revenue</p>
                    <p className="font-medium">R {selectedChurch.revenue.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Join Date</p>
                    <p className="font-medium">{selectedChurch.joined}</p>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Management Notes
                </label>
                <Textarea
                  value={churchNotes}
                  onChange={(e) => setChurchNotes(e.target.value)}
                  placeholder="Add notes about this church..."
                  rows={3}
                />
              </div>

              <div className="flex space-x-3">
                <Button
                  className="bg-green-600 hover:bg-green-700 text-white"
                  onClick={() => handleChurchDecision('approved')}
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Approve
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleChurchDecision('under-review')}
                >
                  <Clock className="h-4 w-4 mr-2" />
                  Under Review
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => handleChurchDecision('suspended')}
                >
                  <AlertTriangle className="h-4 w-4 mr-2" />
                  Suspend
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Commission Rate Modal */}
      <Dialog open={showCommissionModal} onOpenChange={setShowCommissionModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Platform Settings</DialogTitle>
            <DialogDescription>
              Manage platform commission rate and settings
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Commission Rate (%)
              </label>
              <div className="flex items-center space-x-2">
                <Input
                  type="number"
                  value={tempCommissionRate}
                  onChange={(e) => setTempCommissionRate(e.target.value)}
                  placeholder={commissionRate.toString()}
                  min="0"
                  max="10"
                  step="0.1"
                />
                <span className="text-sm text-gray-600">+ R3 per transaction</span>
              </div>
              <p className="text-sm text-gray-500 mt-1">
                Current rate: {commissionRate}% + R3 per transaction
              </p>
            </div>

            <div className="flex space-x-3">
              <Button
                className="bg-churpay-gradient text-white"
                onClick={updateCommissionRate}
              >
                <Save className="h-4 w-4 mr-2" />
                Update Rate
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowCommissionModal(false)}
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </Dialog>
  );
}