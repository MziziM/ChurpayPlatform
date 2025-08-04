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
  X
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
      {/* Welcome Section */}
      <div className="bg-churpay-gradient rounded-xl p-6 text-white shadow-xl">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-lg">C</span>
          </div>
          <div>
            <h2 className="text-xl font-bold">Welcome back, {memberData.member.firstName}</h2>
            <p className="text-purple-100">Member of {memberData.member.churchName}</p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4 mt-4">
          <div className="bg-white/10 rounded-lg p-3">
            <p className="text-purple-100 text-sm">Total Given</p>
            <p className="text-xl font-bold">R {memberData.stats.totalDonated.toLocaleString()}</p>
          </div>
          <div className="bg-white/10 rounded-lg p-3">
            <p className="text-purple-100 text-sm">This Year</p>
            <p className="text-xl font-bold">R {memberData.stats.donationsThisYear.toLocaleString()}</p>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Donations</p>
                <p className="text-2xl font-bold">{memberData.stats.totalDonations}</p>
              </div>
              <CreditCard className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Impact Score</p>
                <p className="text-2xl font-bold">{memberData.stats.impactScore}</p>
              </div>
              <Target className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Recent Donations</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {memberData.recentDonations.map((donation) => (
              <div key={donation.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                    <Heart className="h-4 w-4 text-green-600" />
                  </div>
                  <div>
                    <p className="font-medium">R {donation.amount.toLocaleString()}</p>
                    <p className="text-sm text-gray-600">{donation.type}</p>
                  </div>
                </div>
                <Badge className="bg-green-100 text-green-800">{donation.status}</Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderChurchOverview = () => (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-churpay-gradient rounded-xl p-6 text-white shadow-xl">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
            <Church className="h-5 w-5 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold">{churchData.church.name}</h2>
            <p className="text-purple-100">Admin: {churchData.church.admin}</p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4 mt-4">
          <div className="bg-white/10 rounded-lg p-3">
            <p className="text-purple-100 text-sm">Total Received</p>
            <p className="text-xl font-bold">R {churchData.stats.totalReceived.toLocaleString()}</p>
          </div>
          <div className="bg-white/10 rounded-lg p-3">
            <p className="text-purple-100 text-sm">Active Members</p>
            <p className="text-xl font-bold">{churchData.stats.activeMembers}</p>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">This Month</p>
                <p className="text-2xl font-bold">R {churchData.stats.thisMonth.toLocaleString()}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Avg Donation</p>
                <p className="text-2xl font-bold">R {churchData.stats.avgDonation}</p>
              </div>
              <Wallet className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Transactions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Recent Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {churchData.recentTransactions.map((transaction) => (
              <div key={transaction.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                    <Users className="h-4 w-4 text-green-600" />
                  </div>
                  <div>
                    <p className="font-medium">{transaction.member}</p>
                    <p className="text-sm text-gray-600">R {transaction.amount.toLocaleString()} • {transaction.type}</p>
                  </div>
                </div>
                <span className="text-sm text-gray-500">{new Date(transaction.date).toLocaleDateString()}</span>
              </div>
            ))}
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