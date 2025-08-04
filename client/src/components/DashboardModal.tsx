import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Heart, 
  TrendingUp, 
  Calendar, 
  Target, 
  CreditCard,
  Users,
  Church,
  Settings,
  History,
  Wallet,
  Star,
  ArrowUpRight,
  X,
  DollarSign,
  Activity,
  Receipt,
  BarChart3,
  CheckCircle
} from "lucide-react";

interface DashboardModalProps {
  isOpen: boolean;
  onClose: () => void;
  userType: 'member' | 'church';
}

export default function DashboardModal({ isOpen, onClose, userType }: DashboardModalProps) {
  const [currentView, setCurrentView] = useState('overview');
  const [donationAmount, setDonationAmount] = useState('');
  const [donationType, setDonationType] = useState('');

  // Mock data - would come from API in real app
  const memberData = {
    member: {
      firstName: "Sarah",
      lastName: "Johnson",
      email: "sarah.johnson@example.com",
      churchName: "Grace Community Church",
      memberSince: "2023-03-15"
    },
    stats: {
      totalDonated: 15750,
      donationsThisYear: 8400,
      donationsThisMonth: 1200,
      totalDonations: 24,
      consecutiveMonths: 8,
      impactScore: 85
    },
    recentDonations: [
      { id: "1", amount: 500, type: "Tithe", date: "2025-01-03", status: "completed" },
      { id: "2", amount: 200, type: "Building Fund", date: "2025-01-01", status: "completed" },
      { id: "3", amount: 100, type: "Mission Support", date: "2024-12-28", status: "completed" }
    ],
    projects: [
      {
        id: "1",
        name: "New Youth Center",
        description: "Building a safe space for our youth programs",
        targetAmount: 250000,
        currentAmount: 145000,
        myContribution: 1500
      },
      {
        id: "2",
        name: "Community Outreach Program",
        description: "Supporting local families in need",
        targetAmount: 50000,
        currentAmount: 32000,
        myContribution: 500
      }
    ]
  };

  const churchData = {
    church: {
      name: "Grace Community Church",
      admin: "Pastor Michael Roberts",
      email: "admin@gracechurch.org",
      members: 342,
      establishedDate: "2020-08-15"
    },
    stats: {
      totalReceived: 128450,
      thisMonth: 45680,
      activeMembers: 342,
      projectsFunded: 8,
      avgDonation: 375
    },
    recentTransactions: [
      { id: "1", member: "Sarah Johnson", amount: 500, type: "Tithe", date: "2025-01-03" },
      { id: "2", member: "Michael Smith", amount: 1000, type: "Building Fund", date: "2025-01-03" },
      { id: "3", member: "Lisa Brown", amount: 200, type: "Offering", date: "2025-01-02" }
    ],
    activeProjects: [
      {
        id: "1",
        name: "New Youth Center",
        targetAmount: 250000,
        currentAmount: 145000,
        contributors: 85
      },
      {
        id: "2",
        name: "Community Outreach Program",
        targetAmount: 50000,
        currentAmount: 32000,
        contributors: 43
      }
    ]
  };

  const data = userType === 'member' ? memberData : churchData;

  const predefinedAmounts = [50, 100, 250, 500, 1000, 2500];
  const donationTypes = ['Tithe', 'Offering', 'Building Fund', 'Mission Support', 'Youth Ministry', 'Other'];

  const renderMemberOverview = () => (
    <div className="space-y-6">
      {/* Enhanced Welcome Section with Professional Design */}
      <div className="bg-churpay-gradient rounded-xl p-6 text-white shadow-xl relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-16 translate-x-16"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-12 -translate-x-12"></div>
        
        <div className="relative">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                <span className="text-white font-bold text-xl">C</span>
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

      {/* Enhanced Quick Actions */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="hover:shadow-lg transition-all duration-200 cursor-pointer group" onClick={() => setCurrentView('donate')}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 group-hover:text-purple-600 transition-colors">Quick Give</p>
                <p className="text-lg font-bold text-gray-900">Donate Now</p>
              </div>
              <div className="w-10 h-10 bg-churpay-gradient rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                <Heart className="h-5 w-5 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="hover:shadow-lg transition-all duration-200 cursor-pointer group" onClick={() => setCurrentView('projects')}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 group-hover:text-purple-600 transition-colors">Projects</p>
                <p className="text-lg font-bold text-gray-900">{memberData.projects.length} Active</p>
              </div>
              <div className="w-10 h-10 bg-churpay-gradient rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                <Target className="h-5 w-5 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="hover:shadow-lg transition-all duration-200 cursor-pointer group" onClick={() => setCurrentView('history')}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 group-hover:text-purple-600 transition-colors">History</p>
                <p className="text-lg font-bold text-gray-900">View All</p>
              </div>
              <div className="w-10 h-10 bg-churpay-gradient rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                <History className="h-5 w-5 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="hover:shadow-lg transition-all duration-200 cursor-pointer group">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 group-hover:text-purple-600 transition-colors">Wallet</p>
                <p className="text-lg font-bold text-gray-900">R 1,247</p>
              </div>
              <div className="w-10 h-10 bg-churpay-gradient rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                <Wallet className="h-5 w-5 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Enhanced Recent Activity */}
      <Card className="shadow-sm">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center">
              <Activity className="h-5 w-5 mr-2 text-purple-600" />
              Recent Activity
            </CardTitle>
            <Button variant="ghost" size="sm" onClick={() => setCurrentView('history')}>
              View All
              <ArrowUpRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {memberData.recentDonations.slice(0, 3).map((donation) => (
              <div key={donation.id} className="flex items-center justify-between p-4 bg-gradient-to-r from-purple-50 to-transparent rounded-xl border border-purple-100 hover:border-purple-200 transition-colors">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-churpay-gradient rounded-xl flex items-center justify-center">
                    <Heart className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">R {donation.amount.toLocaleString()}</p>
                    <p className="text-sm text-gray-600">{donation.type} • {donation.date}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge className="bg-green-100 text-green-800 border-green-200">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    {donation.status}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
          
          {/* Summary Stats */}
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
      {/* Enhanced Church Welcome Section */}
      <div className="bg-churpay-gradient rounded-xl p-6 text-white shadow-xl relative overflow-hidden">
        {/* Background decoration */}
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
              <p className="text-xl font-bold">{churchData.stats.projectsFunded}</p>
              <p className="text-purple-200 text-xs">funded projects</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
              <div className="flex items-center space-x-2 mb-2">
                <TrendingUp className="h-4 w-4 text-purple-100" />
                <p className="text-purple-100 text-sm">Avg Donation</p>
              </div>
              <p className="text-xl font-bold">R {churchData.stats.avgDonation}</p>
              <p className="text-purple-200 text-xs">per member</p>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Church Quick Actions */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="hover:shadow-lg transition-all duration-200 cursor-pointer group" onClick={() => setCurrentView('history')}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 group-hover:text-purple-600 transition-colors">Transactions</p>
                <p className="text-lg font-bold text-gray-900">View All</p>
              </div>
              <div className="w-10 h-10 bg-churpay-gradient rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                <Receipt className="h-5 w-5 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="hover:shadow-lg transition-all duration-200 cursor-pointer group" onClick={() => setCurrentView('projects')}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 group-hover:text-purple-600 transition-colors">Projects</p>
                <p className="text-lg font-bold text-gray-900">{churchData.activeProjects.length} Active</p>
              </div>
              <div className="w-10 h-10 bg-churpay-gradient rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                <Target className="h-5 w-5 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="hover:shadow-lg transition-all duration-200 cursor-pointer group">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 group-hover:text-purple-600 transition-colors">Members</p>
                <p className="text-lg font-bold text-gray-900">{churchData.stats.activeMembers}</p>
              </div>
              <div className="w-10 h-10 bg-churpay-gradient rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                <Users className="h-5 w-5 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="hover:shadow-lg transition-all duration-200 cursor-pointer group">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 group-hover:text-purple-600 transition-colors">Analytics</p>
                <p className="text-lg font-bold text-gray-900">Reports</p>
              </div>
              <div className="w-10 h-10 bg-churpay-gradient rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                <BarChart3 className="h-5 w-5 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Enhanced Recent Transactions */}
      <Card className="shadow-sm">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center">
              <Activity className="h-5 w-5 mr-2 text-purple-600" />
              Recent Transactions
            </CardTitle>
            <Button variant="ghost" size="sm" onClick={() => setCurrentView('history')}>
              View All
              <ArrowUpRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {churchData.recentTransactions.slice(0, 3).map((transaction) => (
              <div key={transaction.id} className="flex items-center justify-between p-4 bg-gradient-to-r from-purple-50 to-transparent rounded-xl border border-purple-100 hover:border-purple-200 transition-colors">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-churpay-gradient rounded-xl flex items-center justify-center">
                    <Users className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{transaction.member}</p>
                    <p className="text-sm text-gray-600">R {transaction.amount.toLocaleString()} • {transaction.type}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-500">{new Date(transaction.date).toLocaleDateString()}</p>
                  <Badge className="bg-green-100 text-green-800 border-green-200 mt-1">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Completed
                  </Badge>
                </div>
              </div>
            ))}
          </div>
          
          {/* Church Summary Stats */}
          <div className="mt-6 pt-4 border-t border-gray-100">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold text-gray-900">R {churchData.stats.thisMonth.toLocaleString()}</p>
                <p className="text-xs text-gray-600">This Month</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{churchData.stats.activeMembers}</p>
                <p className="text-xs text-gray-600">Active Members</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">R {churchData.stats.avgDonation}</p>
                <p className="text-xs text-gray-600">Avg Donation</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderDonationForm = () => (
    <div className="space-y-6">
      <div className="bg-churpay-gradient rounded-xl p-6 text-white shadow-xl">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-lg">C</span>
          </div>
          <div>
            <h2 className="text-xl font-bold">Make a Donation</h2>
            <p className="text-purple-100">Support your church and make a difference</p>
          </div>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Donation Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label className="text-base font-medium mb-3 block">Select Amount</Label>
            <div className="grid grid-cols-3 gap-2 mb-4">
              {predefinedAmounts.map((amount) => (
                <Button
                  key={amount}
                  variant={donationAmount === amount.toString() ? "default" : "outline"}
                  onClick={() => setDonationAmount(amount.toString())}
                  className={donationAmount === amount.toString() ? "bg-churpay-gradient text-white" : ""}
                  size="sm"
                >
                  R{amount}
                </Button>
              ))}
            </div>
            <Input
              placeholder="Custom amount"
              value={donationAmount}
              onChange={(e) => setDonationAmount(e.target.value)}
              type="number"
            />
          </div>

          <div>
            <Label className="text-base font-medium mb-3 block">Donation Type</Label>
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

  const renderContent = () => {
    switch (currentView) {
      case 'overview':
        return renderOverview();
      case 'donate':
        return userType === 'member' ? renderDonationForm() : renderOverview();
      case 'projects':
        return (
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
      case 'history':
        return (
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
      default:
        return renderOverview();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden p-0">
        <DialogHeader className="p-6 pb-0">
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-churpay-gradient rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-lg">C</span>
              </div>
              <div>
                <span className="text-xl font-bold text-gray-900">Chur</span>
                <span className="text-xl font-bold text-churpay-yellow">Pay</span>
                <span className="text-gray-600 ml-2 text-lg font-medium">{userType === 'member' ? 'Member Dashboard' : 'Church Dashboard'}</span>
              </div>
            </DialogTitle>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-hidden">
          <Tabs value={currentView} onValueChange={setCurrentView} className="h-full flex flex-col">
            <div className="px-6">
              <TabsList className="grid w-full grid-cols-4 bg-purple-50 border border-purple-100 p-1 rounded-xl">
                <TabsTrigger 
                  value="overview" 
                  className="flex items-center justify-center space-x-2 data-[state=active]:bg-churpay-gradient data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-200"
                >
                  <TrendingUp className="h-4 w-4" />
                  <span className="hidden sm:inline">Overview</span>
                </TabsTrigger>
                {userType === 'member' && (
                  <TabsTrigger 
                    value="donate" 
                    className="flex items-center justify-center space-x-2 data-[state=active]:bg-churpay-gradient data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-200"
                  >
                    <Heart className="h-4 w-4" />
                    <span className="hidden sm:inline">Donate</span>
                  </TabsTrigger>
                )}
                <TabsTrigger 
                  value="projects" 
                  className="flex items-center justify-center space-x-2 data-[state=active]:bg-churpay-gradient data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-200"
                >
                  <Target className="h-4 w-4" />
                  <span className="hidden sm:inline">Projects</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="history" 
                  className="flex items-center justify-center space-x-2 data-[state=active]:bg-churpay-gradient data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-200"
                >
                  <History className="h-4 w-4" />
                  <span className="hidden sm:inline">History</span>
                </TabsTrigger>
              </TabsList>
            </div>

            <div className="flex-1 overflow-y-auto p-6 pt-4">
              <TabsContent value={currentView} className="mt-0">
                {renderContent()}
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
}