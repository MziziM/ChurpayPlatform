import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import FinancialTrendsChart from "./FinancialTrendsChart";
import MemberGivingAnalytics from "./MemberGivingAnalytics";
import { 
  Heart, 
  DollarSign, 
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
  const [activeTab, setActiveTab] = useState('widgets');
  const [donationAmount, setDonationAmount] = useState('');
  const [donationType, setDonationType] = useState('');

  // Sample data that matches the professional inspiration
  const memberData = {
    member: {
      firstName: 'John',
      lastName: 'Smith',
      churchName: 'Hope Community Church',
      memberSince: '2020-01-15'
    },
    stats: {
      totalDonated: 14250,
      totalDonations: 47,
      donationsThisYear: 8450,
      donationsThisMonth: 650,
      consecutiveMonths: 8,
      impactScore: 95
    },
    recentDonations: [
      { id: 1, amount: 500, type: 'Tithe', date: '2025-01-03', status: 'Completed' },
      { id: 2, amount: 250, type: 'Offering', date: '2025-01-01', status: 'Completed' },
      { id: 3, amount: 100, type: 'Mission Support', date: '2024-12-29', status: 'Completed' }
    ],
    projects: [
      { id: 1, name: 'New Sanctuary', description: 'Building expansion project', currentAmount: 125000, targetAmount: 250000 },
      { id: 2, name: 'Youth Camp', description: 'Annual youth ministry camp', currentAmount: 8500, targetAmount: 15000 }
    ]
  };

  const churchData = {
    church: {
      name: 'Hope Community Church',
      admin: 'Pastor Michael Johnson'
    },
    stats: {
      totalReceived: 245000,
      thisMonth: 18500,
      activeMembers: 156,
      activeProjects: 3
    },
    activeProjects: [
      { id: 1, name: 'New Sanctuary', description: 'Building expansion project', currentAmount: 125000, targetAmount: 250000 },
      { id: 2, name: 'Youth Camp', description: 'Annual youth ministry camp', currentAmount: 8500, targetAmount: 15000 },
      { id: 3, name: 'Community Outreach', description: 'Local community support program', currentAmount: 3200, targetAmount: 10000 }
    ],
    recentTransactions: [
      { id: 1, member: 'John Smith', amount: 500, type: 'Tithe', date: '2025-01-03' },
      { id: 2, member: 'Sarah Johnson', amount: 250, type: 'Offering', date: '2025-01-03' },
      { id: 3, member: 'Mike Wilson', amount: 100, type: 'Mission Support', date: '2025-01-02' }
    ]
  };

  const predefinedAmounts = [50, 100, 250, 500, 1000, 2500];
  const donationTypes = ['Tithe', 'Offering', 'Building Fund', 'Mission Support', 'Youth Ministry', 'Other'];

  const renderMemberOverview = () => (
    <div className="space-y-6">
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
          
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
              <div className="flex items-center space-x-2 mb-2">
                <Heart className="h-4 w-4 text-purple-100" />
                <p className="text-purple-100 text-sm">Total Given</p>
              </div>
              <p className="text-2xl font-bold">R {memberData.stats.totalDonated.toLocaleString()}</p>
              <p className="text-purple-200 text-xs">{memberData.stats.totalDonations} donations</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
              <div className="flex items-center space-x-2 mb-2">
                <Calendar className="h-4 w-4 text-purple-100" />
                <p className="text-purple-100 text-sm">This Year</p>
              </div>
              <p className="text-2xl font-bold">R {memberData.stats.donationsThisYear.toLocaleString()}</p>
              <p className="text-purple-200 text-xs">Monthly avg: R {Math.round(memberData.stats.donationsThisYear/12).toLocaleString()}</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
              <div className="flex items-center space-x-2 mb-2">
                <TrendingUp className="h-4 w-4 text-purple-100" />
                <p className="text-purple-100 text-sm">Streak</p>
              </div>
              <p className="text-2xl font-bold">{memberData.stats.consecutiveMonths}</p>
              <p className="text-purple-200 text-xs">consecutive months</p>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Quick Actions with Professional Design */}
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
                <p className="text-purple-100 flex items-center">
                  <Users className="h-4 w-4 mr-2" />
                  Admin: {churchData.church.admin}
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-purple-100 text-sm">Growth Rate</p>
              <p className="text-2xl font-bold">+12.5%</p>
            </div>
          </div>
          
          <div className="grid grid-cols-4 gap-4">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
              <div className="flex items-center space-x-2 mb-2">
                <DollarSign className="h-4 w-4 text-purple-100" />
                <p className="text-purple-100 text-sm">Total Received</p>
              </div>
              <p className="text-xl font-bold">R {churchData.stats.totalReceived.toLocaleString()}</p>
              <p className="text-purple-200 text-xs">This month: R {churchData.stats.thisMonth.toLocaleString()}</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
              <div className="flex items-center space-x-2 mb-2">
                <Users className="h-4 w-4 text-purple-100" />
                <p className="text-purple-100 text-sm">Members</p>
              </div>
              <p className="text-xl font-bold">{churchData.stats.activeMembers}</p>
              <p className="text-purple-200 text-xs">Active members</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
              <div className="flex items-center space-x-2 mb-2">
                <Target className="h-4 w-4 text-purple-100" />
                <p className="text-purple-100 text-sm">Projects</p>
              </div>
              <p className="text-xl font-bold">{churchData.stats.activeProjects}</p>
              <p className="text-purple-200 text-xs">Active projects</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
              <div className="flex items-center space-x-2 mb-2">
                <TrendingUp className="h-4 w-4 text-purple-100" />
                <p className="text-purple-100 text-sm">Revenue Share</p>
              </div>
              <p className="text-xl font-bold">R 1,225</p>
              <p className="text-purple-200 text-xs">This year</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="shadow-sm border">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Donations</p>
                <p className="text-lg font-bold text-gray-900">Manage</p>
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

  const renderProjects = () => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Active Projects</h3>
      {(userType === 'member' ? memberData.projects : churchData.activeProjects)?.map((project: any) => (
        <Card key={project.id}>
          <CardContent className="p-4">
            <h4 className="font-semibold mb-2">{project.name}</h4>
            <p className="text-sm text-gray-600 mb-3">{project.description}</p>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Progress</span>
                <span>R{project.currentAmount.toLocaleString()} / R{project.targetAmount.toLocaleString()}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-churpay-gradient h-2 rounded-full" 
                  style={{ width: `${(project.currentAmount / project.targetAmount) * 100}%` }}
                ></div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );

  const renderHistory = () => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">{userType === 'member' ? 'Donation History' : 'Transaction History'}</h3>
      {(userType === 'member' ? memberData.recentDonations : churchData.recentTransactions).map((item: any) => (
        <Card key={item.id}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">
                  {userType === 'member' ? `R${item.amount.toLocaleString()}` : `${item.member} - R${item.amount.toLocaleString()}`}
                </p>
                <p className="text-sm text-gray-600">{item.type} • {new Date(item.date).toLocaleDateString()}</p>
              </div>
              {userType === 'member' && (
                <Badge className="bg-green-100 text-green-800">{item.status}</Badge>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden p-0">
        <DialogHeader className="p-6 pb-4 border-b">
          <DialogTitle className="text-2xl font-semibold text-center">
            {userType === 'member' ? 'Member Dashboard' : 'Church Dashboard'}
          </DialogTitle>
        </DialogHeader>
        
        <div className="flex-1 overflow-hidden">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
            <div className="px-6 pt-4">
              <TabsList className="grid w-full grid-cols-5 h-12">
                <TabsTrigger 
                  value="widgets"
                  className="data-[state=active]:bg-churpay-gradient data-[state=active]:text-white text-sm font-medium"
                >
                  <Layout className="h-4 w-4 mr-1.5" />
                  Widgets
                </TabsTrigger>
                <TabsTrigger 
                  value="overview"
                  className="data-[state=active]:bg-churpay-gradient data-[state=active]:text-white text-sm font-medium"
                >
                  <Activity className="h-4 w-4 mr-1.5" />
                  Overview
                </TabsTrigger>
                {userType === 'member' ? (
                  <TabsTrigger 
                    value="donate"
                    className="data-[state=active]:bg-churpay-gradient data-[state=active]:text-white text-sm font-medium"
                  >
                    <Heart className="h-4 w-4 mr-1.5" />
                    Donate
                  </TabsTrigger>
                ) : (
                  <TabsTrigger 
                    value="projects"
                    className="data-[state=active]:bg-churpay-gradient data-[state=active]:text-white text-sm font-medium"
                  >
                    <Target className="h-4 w-4 mr-1.5" />
                    Projects
                  </TabsTrigger>
                )}
                <TabsTrigger 
                  value="history"
                  className="data-[state=active]:bg-churpay-gradient data-[state=active]:text-white text-sm font-medium"
                >
                  <History className="h-4 w-4 mr-1.5" />
                  History
                </TabsTrigger>
                <TabsTrigger 
                  value="analytics"
                  className="data-[state=active]:bg-churpay-gradient data-[state=active]:text-white text-sm font-medium"
                >
                  <BarChart3 className="h-4 w-4 mr-1.5" />
                  Analytics
                </TabsTrigger>
              </TabsList>
            </div>
            
            <div className="flex-1 overflow-y-auto">
              <TabsContent value="widgets" className="mt-0 p-6 h-full">
                <DashboardWidgets 
                  userType={userType} 
                  dashboardData={userType === 'member' ? memberData : churchData} 
                />
              </TabsContent>
              <TabsContent value="overview" className="mt-0 p-6 h-full">
                {renderOverview()}
              </TabsContent>
              {userType === 'member' && (
                <TabsContent value="donate" className="mt-0 p-6 h-full">
                  {renderDonationForm()}
                </TabsContent>
              )}
              {userType === 'church' && (
                <TabsContent value="projects" className="mt-0 p-6 h-full">
                  {renderProjects()}
                </TabsContent>
              )}
              <TabsContent value="history" className="mt-0 p-6 h-full">
                {renderHistory()}
              </TabsContent>
              <TabsContent value="analytics" className="mt-0 p-6 h-full">
                {userType === 'member' ? (
                  <MemberGivingAnalytics memberName={`${memberData.member.firstName} ${memberData.member.lastName}`} />
                ) : (
                  <FinancialTrendsChart churchName={churchData.church.name} userType={userType} />
                )}
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
}