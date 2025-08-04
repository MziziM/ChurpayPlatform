import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { 
  Heart, 
  X, 
  Users, 
  Target, 
  TrendingUp, 
  Church,
  Calendar,
  Wallet,
  History,
  CheckCircle,
  Settings,
  Activity,
  ArrowUpRight,
  BarChart3,
  PieChart,
  LineChart,
  Layout
} from "lucide-react";
import DashboardWidgets from "./DashboardWidgets";

interface DashboardModalProps {
  isOpen: boolean;
  onClose: () => void;
  userType: 'member' | 'church';
}

export default function DashboardModal({ isOpen, onClose, userType }: DashboardModalProps) {
  const [donationAmount, setDonationAmount] = useState('');
  const [donationType, setDonationType] = useState('');

  // Professional member data with premium features
  const memberData = {
    member: {
      firstName: 'John',
      lastName: 'Smith',
      churchName: 'Hope Community Church',
      memberSince: '2020-01-15',
      membershipTier: 'Faithful Steward',
      profileImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
      email: 'john.smith@email.com',
      phone: '+27 82 123 4567'
    },
    wallet: {
      balance: 2450.75,
      rewardPoints: 1820,
      monthlyBudget: 2000,
      budgetUsed: 1275,
      nextAutoDeduction: '2025-01-15',
      savedCards: 3
    },
    stats: {
      totalDonated: 42750,
      totalDonations: 147,
      donationsThisYear: 12450,
      donationsThisMonth: 1650,
      consecutiveMonths: 28,
      impactScore: 98,
      averageMonthly: 1456,
      yearOverYearGrowth: 15.2,
      favoriteCategory: 'Tithe',
      givingStreak: 28
    },
    achievements: [
      { id: 1, title: 'Faithful Giver', description: '12+ consecutive months', icon: 'Heart', earned: true },
      { id: 2, title: 'Community Builder', description: 'Supported 5+ projects', icon: 'Users', earned: true },
      { id: 3, title: 'Mission Champion', description: 'R10,000+ mission giving', icon: 'Target', earned: false }
    ],
    recentDonations: [
      { id: 1, amount: 750, type: 'Tithe', date: '2025-01-03', status: 'Completed', method: 'Auto-Deduct', project: null },
      { id: 2, amount: 500, type: 'Building Fund', date: '2025-01-01', status: 'Completed', method: 'Card', project: 'New Sanctuary' },
      { id: 3, amount: 250, type: 'Mission Support', date: '2024-12-29', status: 'Completed', method: 'EFT', project: 'Kenya Outreach' },
      { id: 4, amount: 150, type: 'Youth Ministry', date: '2024-12-25', status: 'Completed', method: 'Card', project: 'Youth Camp' },
      { id: 5, amount: 200, type: 'Special Offering', date: '2024-12-22', status: 'Completed', method: 'Auto-Deduct', project: null }
    ],
    projects: [
      { id: 1, name: 'New Sanctuary', description: 'Building expansion project', currentAmount: 185000, targetAmount: 350000, yourContribution: 2500, category: 'Infrastructure', deadline: '2025-06-30' },
      { id: 2, name: 'Kenya Outreach', description: 'Mission trip and community support', currentAmount: 45000, targetAmount: 75000, yourContribution: 1250, category: 'Missions', deadline: '2025-03-15' },
      { id: 3, name: 'Youth Camp 2025', description: 'Annual youth ministry camp', currentAmount: 18500, targetAmount: 25000, yourContribution: 400, category: 'Youth', deadline: '2025-02-28' }
    ]
  };

  // Professional church data with enterprise features
  const churchData = {
    church: {
      name: 'Hope Community Church',
      admin: 'Pastor Michael Johnson',
      established: '1987',
      members: 542,
      address: '123 Faith Street, Cape Town',
      phone: '+27 21 555 0123',
      website: 'hopecommunity.church',
      logo: 'https://images.unsplash.com/photo-1438032005730-c779502df39b?w=150&h=150&fit=crop'
    },
    financials: {
      totalReceived: 485750,
      thisMonth: 42450,
      lastMonth: 38200,
      monthlyGrowth: 11.1,
      yearToDate: 485750,
      targetThisYear: 650000,
      averageDonation: 892,
      processingFees: 18926,
      netReceived: 466824,
      revenueShare: 48575
    },
    members: {
      total: 542,
      active: 387,
      newThisMonth: 8,
      activeGivers: 289,
      recurringGivers: 156,
      topGiverAmount: 15420,
      averageGiving: 1256
    },
    activeProjects: [
      { id: 1, name: 'New Sanctuary', target: 350000, raised: 185000, donors: 87, category: 'Infrastructure', deadline: '2025-06-30', manager: 'Pastor Johnson' },
      { id: 2, name: 'Kenya Outreach', target: 75000, raised: 45000, donors: 34, category: 'Missions', deadline: '2025-03-15', manager: 'Rev. Smith' },
      { id: 3, name: 'Youth Camp 2025', target: 25000, raised: 18500, donors: 29, category: 'Youth', deadline: '2025-02-28', manager: 'Sarah Wilson' },
      { id: 4, name: 'Community Kitchen', target: 45000, raised: 12000, donors: 18, category: 'Community', deadline: '2025-04-30', manager: 'Deacon Brown' }
    ],
    recentTransactions: [
      { id: 1, member: 'John Smith', amount: 750, type: 'Tithe', date: '2025-01-03', method: 'Auto-Deduct', status: 'Completed' },
      { id: 2, member: 'Sarah Johnson', amount: 500, type: 'Building Fund', date: '2025-01-03', method: 'Card', status: 'Completed' },
      { id: 3, member: 'Michael Brown', amount: 300, type: 'Mission Support', date: '2025-01-02', method: 'EFT', status: 'Processing' },
      { id: 4, member: 'Emily Davis', amount: 250, type: 'Youth Ministry', date: '2025-01-02', method: 'Card', status: 'Completed' },
      { id: 5, member: 'David Wilson', amount: 1200, type: 'Special Offering', date: '2025-01-01', method: 'EFT', status: 'Completed' },
      { id: 6, member: 'Lisa Anderson', amount: 400, type: 'Tithe', date: '2025-01-01', method: 'Auto-Deduct', status: 'Completed' }
    ]
  };

  const predefinedAmounts = [50, 100, 250, 500, 1000, 2500];
  const donationTypes = ['Tithe', 'Offering', 'Building Fund', 'Mission Support', 'Youth Ministry', 'Other'];

  const renderMemberOverview = () => (
    <div className="space-y-6">
      {/* Professional Achievements Section with ChurPay Branding */}
      <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-xl p-6 border border-purple-200">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
          <CheckCircle className="h-5 w-5 mr-2 text-purple-600" />
          Achievements & Milestones
        </h3>
        <div className="grid grid-cols-3 gap-4">
          {memberData.achievements.map((achievement) => (
            <div key={achievement.id} className={`p-4 rounded-lg border-2 ${achievement.earned ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'}`}>
              <div className="flex items-center space-x-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${achievement.earned ? 'bg-green-100' : 'bg-gray-100'}`}>
                  {achievement.icon === 'Heart' && <Heart className={`h-4 w-4 ${achievement.earned ? 'text-green-600' : 'text-gray-400'}`} />}
                  {achievement.icon === 'Users' && <Users className={`h-4 w-4 ${achievement.earned ? 'text-green-600' : 'text-gray-400'}`} />}
                  {achievement.icon === 'Target' && <Target className={`h-4 w-4 ${achievement.earned ? 'text-green-600' : 'text-gray-400'}`} />}
                </div>
                <div>
                  <p className={`font-medium text-sm ${achievement.earned ? 'text-green-800' : 'text-gray-500'}`}>{achievement.title}</p>
                  <p className={`text-xs ${achievement.earned ? 'text-green-600' : 'text-gray-400'}`}>{achievement.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Wallet Management Section with ChurPay Branding */}
      <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-xl p-6 border border-yellow-200">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
          <Wallet className="h-5 w-5 mr-2 text-yellow-600" />
          Digital Wallet & Budget
        </h3>
        <div className="grid grid-cols-2 gap-6">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">Monthly Budget</span>
              <span className="text-sm font-medium">R {memberData.wallet.monthlyBudget.toLocaleString()}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-churpay-gradient h-2 rounded-full transition-all duration-300" 
                style={{ width: `${(memberData.wallet.budgetUsed / memberData.wallet.monthlyBudget) * 100}%` }}
              ></div>
            </div>
            <div className="flex items-center justify-between mt-2">
              <span className="text-xs text-gray-500">Used: R {memberData.wallet.budgetUsed.toLocaleString()}</span>
              <span className="text-xs text-gray-500">
                {Math.round((memberData.wallet.budgetUsed / memberData.wallet.monthlyBudget) * 100)}%
              </span>
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Available Balance</span>
              <span className="text-lg font-bold text-green-600">R {memberData.wallet.balance.toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Reward Points</span>
              <span className="text-sm font-medium text-yellow-600">{memberData.wallet.rewardPoints.toLocaleString()} pts</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Saved Cards</span>
              <span className="text-sm font-medium">{memberData.wallet.savedCards} cards</span>
            </div>
          </div>
        </div>
      </div>

      {/* Professional Welcome Section with ChurPay Branding */}
      <div className="bg-churpay-gradient rounded-xl p-6 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-16 translate-x-16"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-12 -translate-x-12"></div>
        
        <div className="relative">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                <span className="text-white font-bold text-xl">
                  {memberData.member.firstName[0]}{memberData.member.lastName[0]}
                </span>
              </div>
              <div>
                <h2 className="text-2xl font-bold">Welcome back, {memberData.member.firstName}</h2>
                <p className="text-purple-100 flex items-center">
                  <Church className="h-4 w-4 mr-2" />
                  {memberData.member.churchName}
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-purple-100 text-sm">Impact Score</p>
              <p className="text-2xl font-bold">{memberData.stats.impactScore}</p>
            </div>
          </div>
          
          <div className="grid grid-cols-4 gap-4">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
              <div className="flex items-center space-x-2 mb-2">
                <Heart className="h-4 w-4 text-purple-100" />
                <p className="text-purple-100 text-sm">Total Given</p>
              </div>
              <p className="text-2xl font-bold">R {memberData.stats.totalDonated.toLocaleString()}</p>
              <p className="text-purple-200 text-xs">+{memberData.stats.yearOverYearGrowth}% growth</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
              <div className="flex items-center space-x-2 mb-2">
                <Wallet className="h-4 w-4 text-purple-100" />
                <p className="text-purple-100 text-sm">Wallet Balance</p>
              </div>
              <p className="text-2xl font-bold">R {memberData.wallet.balance.toLocaleString()}</p>
              <p className="text-purple-200 text-xs">{memberData.wallet.rewardPoints} points</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
              <div className="flex items-center space-x-2 mb-2">
                <TrendingUp className="h-4 w-4 text-purple-100" />
                <p className="text-purple-100 text-sm">Giving Streak</p>
              </div>
              <p className="text-2xl font-bold">{memberData.stats.givingStreak}</p>
              <p className="text-purple-200 text-xs">consecutive months</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
              <div className="flex items-center space-x-2 mb-2">
                <Target className="h-4 w-4 text-purple-100" />
                <p className="text-purple-100 text-sm">Projects</p>
              </div>
              <p className="text-2xl font-bold">{memberData.projects.length}</p>
              <p className="text-purple-200 text-xs">actively supporting</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions with ChurPay Branding */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="shadow-sm border">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Quick Give</p>
                <p className="text-lg font-bold text-gray-900">Donate Now</p>
              </div>
              <div className="w-10 h-10 bg-churpay-gradient rounded-lg flex items-center justify-center">
                <Heart className="h-5 w-5 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-sm border">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Projects</p>
                <p className="text-lg font-bold text-gray-900">{memberData.projects.length} Active</p>
              </div>
              <div className="w-10 h-10 bg-churpay-gradient rounded-lg flex items-center justify-center">
                <Target className="h-5 w-5 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-sm border">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">History</p>
                <p className="text-lg font-bold text-gray-900">View All</p>
              </div>
              <div className="w-10 h-10 bg-churpay-gradient rounded-lg flex items-center justify-center">
                <History className="h-5 w-5 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-sm border">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Analytics</p>
                <p className="text-lg font-bold text-gray-900">My Trends</p>
              </div>
              <div className="w-10 h-10 bg-churpay-gradient rounded-lg flex items-center justify-center">
                <BarChart3 className="h-5 w-5 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Professional Recent Activity Section */}
      <Card className="shadow-sm">
        <CardHeader>
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold flex items-center">
              <Activity className="h-5 w-5 mr-2 text-purple-600" />
              Recent Activity
            </h3>
            <Button variant="ghost" size="sm">
              <ArrowUpRight className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {memberData.recentDonations.slice(0, 3).map((donation) => (
              <div key={donation.id} className="flex items-center justify-between p-4 bg-gradient-to-r from-purple-50 to-transparent rounded-xl border border-purple-100">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-churpay-gradient rounded-xl flex items-center justify-center">
                    <Heart className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">R {donation.amount.toLocaleString()}</p>
                    <p className="text-sm text-gray-600">{donation.type} • {donation.date}</p>
                  </div>
                </div>
                <Badge className="bg-green-100 text-green-800 border-green-200">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  {donation.status}
                </Badge>
              </div>
            ))}
          </div>
          
          <div className="mt-6 pt-4 border-t border-gray-100">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold text-gray-900">{memberData.stats.totalDonations}</p>
                <p className="text-xs text-gray-600">Total Donations</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">R {memberData.stats.donationsThisMonth.toLocaleString()}</p>
                <p className="text-xs text-gray-600">This Month</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{memberData.stats.consecutiveMonths}</p>
                <p className="text-xs text-gray-600">Month Streak</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderChurchOverview = () => (
    <div className="space-y-6">
      <div className="bg-churpay-gradient rounded-xl p-6 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-16 translate-x-16"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-12 -translate-x-12"></div>
        
        <div className="relative">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                <Church className="h-6 w-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">{churchData.church.name}</h2>
                <p className="text-purple-100">Est. {churchData.church.established} • {churchData.church.admin}</p>
                <p className="text-purple-200 text-sm">{churchData.church.address}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-purple-100 text-sm">Growth Rate</p>
              <p className="text-2xl font-bold">+{churchData.financials.monthlyGrowth}%</p>
            </div>
          </div>
          
          <div className="grid grid-cols-4 gap-4">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
              <div className="flex items-center space-x-2 mb-2">
                <Heart className="h-4 w-4 text-purple-100" />
                <p className="text-purple-100 text-sm">Total Received</p>
              </div>
              <p className="text-2xl font-bold">R {churchData.financials.totalReceived.toLocaleString()}</p>
              <p className="text-purple-200 text-xs">R {churchData.financials.netReceived.toLocaleString()} net</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
              <div className="flex items-center space-x-2 mb-2">
                <Users className="h-4 w-4 text-purple-100" />
                <p className="text-purple-100 text-sm">Active Members</p>
              </div>
              <p className="text-2xl font-bold">{churchData.members.active}</p>
              <p className="text-purple-200 text-xs">{churchData.members.activeGivers} givers</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
              <div className="flex items-center space-x-2 mb-2">
                <Target className="h-4 w-4 text-purple-100" />
                <p className="text-purple-100 text-sm">Active Projects</p>
              </div>
              <p className="text-2xl font-bold">{churchData.activeProjects.length}</p>
              <p className="text-purple-200 text-xs">fundraising</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
              <div className="flex items-center space-x-2 mb-2">
                <Wallet className="h-4 w-4 text-purple-100" />
                <p className="text-purple-100 text-sm">Revenue Share</p>
              </div>
              <p className="text-2xl font-bold">R {churchData.financials.revenueShare.toLocaleString()}</p>
              <p className="text-purple-200 text-xs">10% annual share</p>
            </div>
          </div>
        </div>
      </div>

      {/* Financial Performance Dashboard */}
      <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-xl p-6 border border-purple-200">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
          <BarChart3 className="h-5 w-5 mr-2 text-purple-600" />
          Financial Performance
        </h3>
        <div className="grid grid-cols-3 gap-6">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">Annual Target Progress</span>
              <span className="text-sm font-medium">R {churchData.financials.targetThisYear.toLocaleString()}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div 
                className="bg-churpay-gradient h-3 rounded-full transition-all duration-300" 
                style={{ width: `${(churchData.financials.yearToDate / churchData.financials.targetThisYear) * 100}%` }}
              ></div>
            </div>
            <div className="flex items-center justify-between mt-2">
              <span className="text-xs text-gray-500">YTD: R {churchData.financials.yearToDate.toLocaleString()}</span>
              <span className="text-xs text-gray-500">
                {Math.round((churchData.financials.yearToDate / churchData.financials.targetThisYear) * 100)}%
              </span>
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Average Donation</span>
              <span className="text-lg font-bold text-green-600">R {churchData.financials.averageDonation.toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Processing Fees</span>
              <span className="text-sm font-medium text-red-600">R {churchData.financials.processingFees.toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Top Giver</span>
              <span className="text-sm font-medium">R {churchData.members.topGiverAmount.toLocaleString()}</span>
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">This Month</span>
              <span className="text-lg font-bold text-purple-600">R {churchData.financials.thisMonth.toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Last Month</span>
              <span className="text-sm font-medium">R {churchData.financials.lastMonth.toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Growth Rate</span>
              <span className="text-sm font-medium text-green-600">+{churchData.financials.monthlyGrowth}%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Member Engagement Analytics */}
      <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-xl p-6 border border-yellow-200">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
          <Users className="h-5 w-5 mr-2 text-yellow-600" />
          Member Engagement
        </h3>
        <div className="grid grid-cols-4 gap-4">
          <div className="text-center">
            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <Users className="h-8 w-8 text-purple-600" />
            </div>
            <p className="text-2xl font-bold text-purple-600">{churchData.members.total}</p>
            <p className="text-sm text-gray-600">Total Members</p>
            <p className="text-xs text-green-600">+{churchData.members.newThisMonth} this month</p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <Heart className="h-8 w-8 text-green-600" />
            </div>
            <p className="text-2xl font-bold text-green-600">{churchData.members.activeGivers}</p>
            <p className="text-sm text-gray-600">Active Givers</p>
            <p className="text-xs text-gray-500">
              {Math.round((churchData.members.activeGivers / churchData.members.total) * 100)}% of members
            </p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <Calendar className="h-8 w-8 text-yellow-600" />
            </div>
            <p className="text-2xl font-bold text-yellow-600">{churchData.members.recurringGivers}</p>
            <p className="text-sm text-gray-600">Recurring Givers</p>
            <p className="text-xs text-gray-500">Auto-deduct enabled</p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <TrendingUp className="h-8 w-8 text-blue-600" />
            </div>
            <p className="text-2xl font-bold text-blue-600">R {churchData.members.averageGiving.toLocaleString()}</p>
            <p className="text-sm text-gray-600">Avg per Giver</p>
            <p className="text-xs text-gray-500">Monthly average</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="shadow-sm border">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Donations</p>
                <p className="text-lg font-bold text-gray-900">R {churchData.financials.thisMonth.toLocaleString()}</p>
              </div>
              <div className="w-10 h-10 bg-churpay-gradient rounded-lg flex items-center justify-center">
                <Heart className="h-5 w-5 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-sm border">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Projects</p>
                <p className="text-lg font-bold text-gray-900">{churchData.activeProjects.length} Active</p>
              </div>
              <div className="w-10 h-10 bg-churpay-gradient rounded-lg flex items-center justify-center">
                <Target className="h-5 w-5 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-sm border">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Transactions</p>
                <p className="text-lg font-bold text-gray-900">View All</p>
              </div>
              <div className="w-10 h-10 bg-churpay-gradient rounded-lg flex items-center justify-center">
                <History className="h-5 w-5 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-sm border">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Analytics</p>
                <p className="text-lg font-bold text-gray-900">Trends</p>
              </div>
              <div className="w-10 h-10 bg-churpay-gradient rounded-lg flex items-center justify-center">
                <BarChart3 className="h-5 w-5 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const renderDonationForm = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold">Make a Donation</h3>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-3 gap-2">
            {predefinedAmounts.map((amount) => (
              <Button
                key={amount}
                variant={donationAmount === amount.toString() ? "default" : "outline"}
                className={donationAmount === amount.toString() ? "bg-churpay-gradient text-white" : ""}
                onClick={() => setDonationAmount(amount.toString())}
              >
                R{amount}
              </Button>
            ))}
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">Custom Amount</label>
            <Input
              type="number"
              placeholder="Enter amount"
              value={donationAmount}
              onChange={(e) => setDonationAmount(e.target.value)}
              className="text-lg"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">Donation Type</label>
            <Select value={donationType} onValueChange={setDonationType}>
              <SelectTrigger>
                <SelectValue placeholder="Select donation type" />
              </SelectTrigger>
              <SelectContent>
                {donationTypes.map((type) => (
                  <SelectItem key={type} value={type}>{type}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="p-4 bg-gray-50 rounded-lg">
            <div className="flex justify-between items-center mb-2">
              <span className="text-gray-600">Donation Amount:</span>
              <span className="font-medium">R{donationAmount || '0'}</span>
            </div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-gray-600">Platform Fee (3.9% + R3):</span>
              <span className="font-medium">R{donationAmount ? ((parseFloat(donationAmount) * 0.039) + 3).toFixed(2) : '0'}</span>
            </div>
            <div className="border-t pt-2 flex justify-between items-center">
              <span className="font-semibold">Total:</span>
              <span className="font-bold text-lg">R{donationAmount || '0'}</span>
            </div>
          </div>

          <Button className="w-full bg-churpay-gradient text-white h-11 hover:shadow-lg transition-all duration-300">
            <Heart className="h-4 w-4 mr-2" />
            Donate R{donationAmount || '0'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );

  const renderOverview = () => {
    return userType === 'member' ? renderMemberOverview() : renderChurchOverview();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(_open) => !_open && onClose()}>
      <DialogContent className="max-w-7xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-churpay-gradient rounded-lg flex items-center justify-center">
                {userType === 'member' ? (
                  <Users className="h-4 w-4 text-white" />
                ) : (
                  <Church className="h-4 w-4 text-white" />
                )}
              </div>
              <span className="text-xl font-bold">
                {userType === 'member' ? 'Member Dashboard' : 'Church Dashboard'}
              </span>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </DialogTitle>
        </DialogHeader>

        <div className="mt-6">
          {renderOverview()}
        </div>

        <div className="mt-8">
          <DashboardWidgets userType={userType} />
        </div>

        <div className="mt-8">
          {renderDonationForm()}
        </div>
      </DialogContent>
    </Dialog>
  );
}