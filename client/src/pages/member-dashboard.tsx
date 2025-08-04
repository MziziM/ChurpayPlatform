import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { 
  Heart, 
  TrendingUp, 
  CreditCard, 
  Church, 
  DollarSign,
  Calendar,
  Target,
  Bell,
  Menu,
  Plus,
  History,
  Settings,
  Wallet,
  ArrowUpRight,
  ArrowDownRight,
  Star,
  Users,
  Gift
} from "lucide-react";

export default function MemberDashboard() {
  const [currentView, setCurrentView] = useState('overview');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Mock member data - In real app would come from backend
  const memberData = {
    member: {
      id: "1",
      firstName: "Sarah",
      lastName: "Johnson",
      email: "sarah.johnson@example.com",
      churchName: "Grace Community Church",
      memberSince: "2023-03-15",
      profileImage: null
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
      {
        id: "1",
        amount: 500,
        type: "Tithe",
        date: "2025-01-03",
        status: "completed",
        church: "Grace Community Church"
      },
      {
        id: "2", 
        amount: 200,
        type: "Building Fund",
        date: "2025-01-01",
        status: "completed",
        church: "Grace Community Church"
      },
      {
        id: "3",
        amount: 100,
        type: "Mission Support",
        date: "2024-12-28",
        status: "completed",
        church: "Grace Community Church"
      }
    ],
    projects: [
      {
        id: "1",
        name: "New Youth Center",
        description: "Building a safe space for our youth programs",
        targetAmount: 250000,
        currentAmount: 145000,
        endDate: "2025-06-30",
        church: "Grace Community Church",
        myContribution: 1500
      },
      {
        id: "2",
        name: "Community Outreach Program",
        description: "Supporting local families in need",
        targetAmount: 50000,
        currentAmount: 32000,
        endDate: "2025-03-31",
        church: "Grace Community Church",
        myContribution: 500
      }
    ],
    quickActions: [
      { id: 'donate', label: 'Make Donation', icon: Heart, color: 'from-green-400 to-green-600' },
      { id: 'projects', label: 'Support Projects', icon: Target, color: 'from-blue-400 to-blue-600' },
      { id: 'history', label: 'View History', icon: History, color: 'from-purple-400 to-purple-600' },
      { id: 'settings', label: 'Settings', icon: Settings, color: 'from-gray-400 to-gray-600' }
    ]
  };

  if (!memberData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-yellow-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-churpay-gradient mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your giving dashboard...</p>
        </div>
      </div>
    );
  }

  const renderView = () => {
    switch (currentView) {
      case 'overview':
        return <MemberOverview data={memberData} />;
      case 'donate':
        return <DonationView data={memberData} />;
      case 'history':
        return <HistoryView data={memberData} />;
      case 'projects':
        return <ProjectsView data={memberData} />;
      case 'settings':
        return <SettingsView data={memberData} />;
      default:
        return <MemberOverview data={memberData} />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-yellow-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-10 h-10 bg-churpay-gradient rounded-xl flex items-center justify-center shadow-lg">
                  <Heart className="h-5 w-5 text-white" />
                </div>
                <div className="hidden sm:block">
                  <span className="text-2xl font-bold text-gray-900">Chur</span>
                  <span className="text-2xl font-bold bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">Pay</span>
                </div>
              </div>
              <div className="hidden lg:block pl-4 border-l border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Member Dashboard</h2>
                <p className="text-sm text-gray-600">Welcome back, {memberData.member.firstName}</p>
              </div>
            </div>

            {/* Navigation */}
            <nav className="hidden md:flex items-center space-x-1">
              {[
                { id: 'overview', label: 'Overview', icon: TrendingUp },
                { id: 'donate', label: 'Donate', icon: Heart },
                { id: 'projects', label: 'Projects', icon: Target },
                { id: 'history', label: 'History', icon: History },
                { id: 'settings', label: 'Settings', icon: Settings },
              ].map((item) => (
                <Button
                  key={item.id}
                  variant={currentView === item.id ? "default" : "ghost"}
                  onClick={() => setCurrentView(item.id)}
                  className={currentView === item.id ? "bg-churpay-gradient text-white shadow-lg" : "hover:bg-purple-50"}
                >
                  <item.icon className="h-4 w-4 mr-2" />
                  {item.label}
                </Button>
              ))}
            </nav>

            {/* Right Actions */}
            <div className="flex items-center space-x-3">
              <Button variant="ghost" size="sm" className="relative">
                <Bell className="h-5 w-5" />
                <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </Button>

              <div className="hidden sm:flex items-center space-x-2 px-3 py-2 bg-gradient-to-r from-green-50 to-green-100 rounded-lg">
                <Wallet className="h-4 w-4 text-green-600" />
                <span className="text-sm font-medium text-green-800">R {memberData.stats.totalDonated.toLocaleString()}</span>
              </div>

              <Button 
                variant="outline"
                onClick={() => window.location.href = '/'}
                className="hidden sm:inline-flex"
              >
                Home
              </Button>

              <Button 
                variant="ghost" 
                size="sm" 
                className="md:hidden"
                onClick={() => setSidebarOpen(!sidebarOpen)}
              >
                <Menu className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Sidebar */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="fixed inset-0 bg-black/50" onClick={() => setSidebarOpen(false)}></div>
          <div className="fixed right-0 top-0 h-full w-64 bg-white shadow-xl">
            <div className="p-4 border-b">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-gray-900">Menu</h3>
                <Button variant="ghost" size="sm" onClick={() => setSidebarOpen(false)}>
                  ×
                </Button>
              </div>
            </div>
            <nav className="p-4 space-y-2">
              {[
                { id: 'overview', label: 'Overview', icon: TrendingUp },
                { id: 'donate', label: 'Donate', icon: Heart },
                { id: 'projects', label: 'Projects', icon: Target },
                { id: 'history', label: 'History', icon: History },
                { id: 'settings', label: 'Settings', icon: Settings },
              ].map((item) => (
                <Button
                  key={item.id}
                  variant={currentView === item.id ? "default" : "ghost"}
                  onClick={() => {
                    setCurrentView(item.id);
                    setSidebarOpen(false);
                  }}
                  className={`w-full justify-start ${currentView === item.id ? "bg-churpay-gradient text-white" : ""}`}
                >
                  <item.icon className="h-4 w-4 mr-2" />
                  {item.label}
                </Button>
              ))}
            </nav>
          </div>
        </div>
      )}

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {renderView()}
      </main>
    </div>
  );
}

// Overview Component
function MemberOverview({ data }: { data: any }) {
  return (
    <div className="space-y-6">
      {/* Welcome Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-purple-600 via-purple-700 to-purple-800 rounded-2xl p-8 text-white">
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-yellow-400/20 to-transparent rounded-full -translate-y-32 translate-x-32"></div>
        <div className="relative z-10">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
              <Heart className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Welcome back, {data.member.firstName}</h1>
              <p className="text-purple-100">Member of {data.member.churchName}</p>
            </div>
          </div>
          <p className="text-purple-100 mb-6 max-w-2xl">
            Thank you for being part of our community and making a difference through your generous giving. 
            Your faithful support helps transform lives and strengthens our ministry.
          </p>
          <div className="flex flex-wrap gap-3">
            <Button className="bg-white text-purple-700 hover:bg-gray-50">
              <Heart className="h-4 w-4 mr-2" />
              Make Donation
            </Button>
            <Button variant="outline" className="border-white text-white hover:bg-white/10">
              <Target className="h-4 w-4 mr-2" />
              View Projects
            </Button>
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-0 shadow-lg bg-gradient-to-br from-green-50 to-green-100">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-700 mb-1">Total Given</p>
                <p className="text-3xl font-bold text-green-900">R {data.stats.totalDonated.toLocaleString()}</p>
                <p className="text-sm text-green-600 mt-1">All time</p>
              </div>
              <div className="w-14 h-14 bg-green-200 rounded-2xl flex items-center justify-center">
                <Heart className="h-7 w-7 text-green-700" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-blue-100">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-700 mb-1">This Year</p>
                <p className="text-3xl font-bold text-blue-900">R {data.stats.donationsThisYear.toLocaleString()}</p>
                <p className="text-sm text-blue-600 mt-1">2025 total</p>
              </div>
              <div className="w-14 h-14 bg-blue-200 rounded-2xl flex items-center justify-center">
                <Calendar className="h-7 w-7 text-blue-700" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-50 to-purple-100">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-700 mb-1">Donations</p>
                <p className="text-3xl font-bold text-purple-900">{data.stats.totalDonations}</p>
                <p className="text-sm text-purple-600 mt-1">Total count</p>
              </div>
              <div className="w-14 h-14 bg-purple-200 rounded-2xl flex items-center justify-center">
                <CreditCard className="h-7 w-7 text-purple-700" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-orange-50 to-orange-100">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-orange-700 mb-1">Impact Score</p>
                <p className="text-3xl font-bold text-orange-900">{data.stats.impactScore}</p>
                <div className="flex items-center mt-1">
                  <TrendingUp className="h-4 w-4 text-orange-600 mr-1" />
                  <p className="text-sm text-orange-600">Growing</p>
                </div>
              </div>
              <div className="w-14 h-14 bg-orange-200 rounded-2xl flex items-center justify-center">
                <Target className="h-7 w-7 text-orange-700" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Star className="h-5 w-5 text-yellow-500" />
            <span>Quick Actions</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {data.quickActions.map((action: any) => (
              <Button
                key={action.id}
                variant="outline"
                className="h-16 bg-gradient-to-r hover:shadow-lg transition-all duration-300"
                style={{
                  background: `linear-gradient(135deg, ${action.color === 'from-green-400 to-green-600' ? '#10b981, #059669' : 
                    action.color === 'from-blue-400 to-blue-600' ? '#3b82f6, #2563eb' :
                    action.color === 'from-purple-400 to-purple-600' ? '#8b5cf6, #7c3aed' : '#6b7280, #4b5563'})`
                }}
              >
                <div className="flex flex-col items-center space-y-2 text-white">
                  <action.icon className="h-5 w-5" />
                  <span className="text-sm font-medium">{action.label}</span>
                </div>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity & Projects */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Recent Donations</span>
              <Button variant="ghost" size="sm">
                <History className="h-4 w-4 mr-1" />
                View All
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data.recentDonations.map((donation: any) => (
                <div key={donation.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                      <Heart className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">R {donation.amount.toLocaleString()}</p>
                      <p className="text-sm text-gray-600">{donation.type} • {new Date(donation.date).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <Badge className="bg-green-100 text-green-800">
                    {donation.status}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Active Projects</span>
              <Button variant="ghost" size="sm">
                <Target className="h-4 w-4 mr-1" />
                View All
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data.projects.map((project: any) => (
                <div key={project.id} className="p-4 bg-gray-50 rounded-xl">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-semibold text-gray-900">{project.name}</h4>
                    <Badge variant="secondary">
                      {Math.round((project.currentAmount / project.targetAmount) * 100)}%
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">{project.description}</p>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Progress</span>
                      <span className="font-medium">R {project.currentAmount.toLocaleString()} / R {project.targetAmount.toLocaleString()}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-yellow-400 to-orange-500 h-2 rounded-full transition-all duration-500" 
                        style={{ width: `${Math.min((project.currentAmount / project.targetAmount) * 100, 100)}%` }}
                      ></div>
                    </div>
                    <div className="flex justify-between items-center pt-2">
                      <span className="text-sm text-gray-600">Your contribution: R {project.myContribution.toLocaleString()}</span>
                      <Button size="sm" className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white">
                        Support
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Giving Streak & Goals */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle>Your Giving Journey</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-6 bg-gradient-to-br from-green-50 to-green-100 rounded-xl">
              <div className="w-16 h-16 bg-green-200 rounded-full flex items-center justify-center mx-auto mb-4">
                <Heart className="h-8 w-8 text-green-700" />
              </div>
              <h3 className="font-bold text-gray-900 mb-2">Faithful Giver</h3>
              <p className="text-sm text-gray-600 mb-3">{data.stats.consecutiveMonths} consecutive months</p>
              <Badge className="bg-green-200 text-green-800">Active Streak</Badge>
            </div>
            <div className="text-center p-6 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl">
              <div className="w-16 h-16 bg-blue-200 rounded-full flex items-center justify-center mx-auto mb-4">
                <Target className="h-8 w-8 text-blue-700" />
              </div>
              <h3 className="font-bold text-gray-900 mb-2">Project Supporter</h3>
              <p className="text-sm text-gray-600 mb-3">Supported {data.projects.length} projects</p>
              <Badge className="bg-blue-200 text-blue-800">Community Impact</Badge>
            </div>
            <div className="text-center p-6 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl">
              <div className="w-16 h-16 bg-purple-200 rounded-full flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="h-8 w-8 text-purple-700" />
              </div>
              <h3 className="font-bold text-gray-900 mb-2">Growing Impact</h3>
              <p className="text-sm text-gray-600 mb-3">Impact score: {data.stats.impactScore}/100</p>
              <Badge className="bg-purple-200 text-purple-800">Rising</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Donation View Component
function DonationView({ data }: { data: any }) {
  const [donationAmount, setDonationAmount] = useState('');
  const [donationType, setDonationType] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  const predefinedAmounts = [50, 100, 250, 500, 1000, 2500];
  const donationTypes = ['Tithe', 'Offering', 'Building Fund', 'Mission Support', 'Youth Ministry', 'Other'];

  const handleDonation = async () => {
    if (!donationAmount || !donationType) {
      toast({
        title: "Missing Information",
        description: "Please select an amount and donation type.",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    try {
      // Simulate donation processing
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast({
        title: "Donation Successful!",
        description: `Your R${donationAmount} ${donationType} donation has been processed.`,
      });
      
      setDonationAmount('');
      setDonationType('');
    } catch (error) {
      toast({
        title: "Donation Failed",
        description: "There was an error processing your donation. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-green-600 to-green-700 rounded-xl p-6 text-white">
        <h1 className="text-2xl font-bold mb-2">Make a Donation</h1>
        <p className="text-green-100">Support {data.member.churchName} and make a difference in your community</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle>Donation Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <Label className="text-base font-medium mb-3 block">Select Amount</Label>
              <div className="grid grid-cols-3 gap-3 mb-4">
                {predefinedAmounts.map((amount) => (
                  <Button
                    key={amount}
                    variant={donationAmount === amount.toString() ? "default" : "outline"}
                    onClick={() => setDonationAmount(amount.toString())}
                    className={donationAmount === amount.toString() ? "bg-churpay-gradient text-white" : ""}
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
                className="text-lg"
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

            <Button 
              onClick={handleDonation}
              disabled={isProcessing || !donationAmount || !donationType}
              className="w-full bg-churpay-gradient text-white h-12 text-lg"
            >
              {isProcessing ? (
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Processing...</span>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <Heart className="h-5 w-5" />
                  <span>Donate R{donationAmount || '0'}</span>
                </div>
              )}
            </Button>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle>Your Giving Impact</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-green-50 rounded-lg">
              <h4 className="font-semibold text-green-900 mb-2">This Month</h4>
              <p className="text-2xl font-bold text-green-800">R{data.stats.donationsThisMonth.toLocaleString()}</p>
              <p className="text-sm text-green-600">Across {data.recentDonations.filter((d: any) => new Date(d.date).getMonth() === new Date().getMonth()).length} donations</p>
            </div>

            <div className="p-4 bg-blue-50 rounded-lg">
              <h4 className="font-semibold text-blue-900 mb-2">This Year</h4>
              <p className="text-2xl font-bold text-blue-800">R{data.stats.donationsThisYear.toLocaleString()}</p>
              <p className="text-sm text-blue-600">Growing your community impact</p>
            </div>

            <div className="p-4 bg-purple-50 rounded-lg">
              <h4 className="font-semibold text-purple-900 mb-2">All Time</h4>
              <p className="text-2xl font-bold text-purple-800">R{data.stats.totalDonated.toLocaleString()}</p>
              <p className="text-sm text-purple-600">Your faithful giving legacy</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// History View Component  
function HistoryView({ data }: { data: any }) {
  const [filterType, setFilterType] = useState('all');
  const [sortBy, setSortBy] = useState('date');

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl p-6 text-white">
        <h1 className="text-2xl font-bold mb-2">Donation History</h1>
        <p className="text-blue-100">Track your giving journey and impact over time</p>
      </div>

      <Card className="border-0 shadow-lg">
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
            <CardTitle>Your Donations</CardTitle>
            <div className="flex space-x-2">
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Filter by type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="Tithe">Tithe</SelectItem>
                  <SelectItem value="Offering">Offering</SelectItem>
                  <SelectItem value="Building Fund">Building Fund</SelectItem>
                  <SelectItem value="Mission Support">Mission Support</SelectItem>
                </SelectContent>
              </Select>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="date">Date</SelectItem>
                  <SelectItem value="amount">Amount</SelectItem>
                  <SelectItem value="type">Type</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {data.recentDonations.map((donation: any) => (
              <div key={donation.id} className="flex items-center justify-between p-4 border rounded-xl hover:bg-gray-50 transition-colors">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                    <Heart className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">R{donation.amount.toLocaleString()}</h4>
                    <p className="text-sm text-gray-600">{donation.type}</p>
                    <p className="text-xs text-gray-500">{new Date(donation.date).toLocaleDateString()} • {donation.church}</p>
                  </div>
                </div>
                <div className="text-right">
                  <Badge className="bg-green-100 text-green-800 mb-2">
                    {donation.status}
                  </Badge>
                  <div className="flex items-center text-sm text-gray-500">
                    <ArrowUpRight className="h-4 w-4 mr-1" />
                    <span>Successful</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Projects View Component
function ProjectsView({ data }: { data: any }) {
  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-purple-600 to-purple-700 rounded-xl p-6 text-white">
        <h1 className="text-2xl font-bold mb-2">Community Projects</h1>
        <p className="text-purple-100">Support meaningful projects that transform lives in your community</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {data.projects.map((project: any) => (
          <Card key={project.id} className="border-0 shadow-lg">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-xl">{project.name}</CardTitle>
                  <Badge className="mt-2 bg-blue-100 text-blue-800">
                    {Math.round((project.currentAmount / project.targetAmount) * 100)}% Complete
                  </Badge>
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                  <Target className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-600">{project.description}</p>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Progress</span>
                  <span className="font-medium">R{project.currentAmount.toLocaleString()} / R{project.targetAmount.toLocaleString()}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div 
                    className="bg-gradient-to-r from-purple-500 to-purple-600 h-3 rounded-full transition-all duration-500" 
                    style={{ width: `${Math.min((project.currentAmount / project.targetAmount) * 100, 100)}%` }}
                  ></div>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-600">Your Contribution</span>
                  <span className="font-semibold text-purple-600">R{project.myContribution.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Target Date</span>
                  <span className="text-sm font-medium">{new Date(project.endDate).toLocaleDateString()}</span>
                </div>
              </div>

              <Button className="w-full bg-gradient-to-r from-purple-500 to-purple-600 text-white">
                <Heart className="h-4 w-4 mr-2" />
                Support This Project
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

// Settings View Component
function SettingsView({ data }: { data: any }) {
  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-gray-600 to-gray-700 rounded-xl p-6 text-white">
        <h1 className="text-2xl font-bold mb-2">Account Settings</h1>
        <p className="text-gray-100">Manage your profile and giving preferences</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle>Profile Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>First Name</Label>
              <Input value={data.member.firstName} readOnly className="mt-1" />
            </div>
            <div>
              <Label>Last Name</Label>
              <Input value={data.member.lastName} readOnly className="mt-1" />
            </div>
            <div>
              <Label>Email</Label>
              <Input value={data.member.email} readOnly className="mt-1" />
            </div>
            <div>
              <Label>Church</Label>
              <Input value={data.member.churchName} readOnly className="mt-1" />
            </div>
            <div>
              <Label>Member Since</Label>
              <Input value={new Date(data.member.memberSince).toLocaleDateString()} readOnly className="mt-1" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle>Giving Preferences</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-green-50 rounded-lg">
              <h4 className="font-semibold text-green-900 mb-2">Monthly Giving Goal</h4>
              <p className="text-2xl font-bold text-green-800">R1,500</p>
              <p className="text-sm text-green-600">This month: R{data.stats.donationsThisMonth.toLocaleString()}</p>
            </div>

            <div className="p-4 bg-blue-50 rounded-lg">
              <h4 className="font-semibold text-blue-900 mb-2">Preferred Donation Types</h4>
              <div className="flex flex-wrap gap-2 mt-2">
                <Badge className="bg-blue-200 text-blue-800">Tithe</Badge>
                <Badge className="bg-blue-200 text-blue-800">Building Fund</Badge>
                <Badge className="bg-blue-200 text-blue-800">Mission Support</Badge>
              </div>
            </div>

            <div className="p-4 bg-purple-50 rounded-lg">
              <h4 className="font-semibold text-purple-900 mb-2">Notification Preferences</h4>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Monthly summary</span>
                  <Badge className="bg-green-200 text-green-800">Enabled</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Project updates</span>
                  <Badge className="bg-green-200 text-green-800">Enabled</Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
