import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, DollarSign, Calendar, TrendingUp, LogOut, Building2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import churpayLogo from '@assets/Churpay Logo tuesd_1754387201756.png';

export default function ChurchDashboard() {
  const { user, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();

  // Mock data for demo purposes when not authenticated
  const mockDashboardData = {
    church: {
      name: "Grace Community Church",
      status: "active"
    },
    stats: {
      totalRevenue: "15,250.00",
      monthlyRevenue: "3,200.00"
    },
    memberCount: 125,
    recentTransactions: [
      { id: 1, type: "Tithe", amount: "500.00", status: "completed", createdAt: new Date().toISOString() },
      { id: 2, type: "Donation", amount: "250.00", status: "completed", createdAt: new Date().toISOString() },
      { id: 3, type: "Project", amount: "1000.00", status: "completed", createdAt: new Date().toISOString() }
    ],
    projects: [
      { id: 1, title: "New Sound System", description: "Upgrading church audio equipment for better worship experience", status: "active", targetAmount: "25000.00", currentAmount: "18500.00" },
      { id: 2, title: "Youth Camp Fundraiser", description: "Annual youth camp registration and activities", status: "active", targetAmount: "15000.00", currentAmount: "12300.00" }
    ]
  };

  // Use mock data if not authenticated, otherwise fetch real data
  const { data: dashboardData, isLoading: dataLoading } = useQuery({
    queryKey: ['/api/church/dashboard'],
    enabled: !!user && ['church_admin', 'church_staff'].includes(user?.role),
  });

  const displayData = user ? dashboardData : mockDashboardData;

  // Logout mutation
  const logoutMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/auth/logout', { method: 'POST' });
      if (!response.ok) throw new Error('Logout failed');
      return response.json();
    },
    onSuccess: () => {
      queryClient.clear();
      setLocation('/');
      toast({
        title: "Logged out successfully",
        description: "You have been securely logged out.",
      });
    },
    onError: () => {
      toast({
        title: "Logout failed",
        description: "Please try again.",
        variant: "destructive",
      });
    },
  });

  if (user && dataLoading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  const churchData = displayData?.church;
  const stats = displayData?.stats;

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <img src={churpayLogo} alt="ChurPay" className="h-8 w-auto" />
              <div>
                <h1 className="text-xl font-bold text-white">{churchData?.name || 'Church Dashboard'}</h1>
                <p className="text-sm text-gray-400">{user?.role === 'church_admin' ? 'Administrator' : 'Staff Member'}</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              {user ? (
                <>
                  <div className="text-right">
                    <p className="text-sm font-medium text-white">{user?.firstName} {user?.lastName}</p>
                    <p className="text-xs text-gray-400">{user?.email}</p>
                  </div>
                  <Button
                    onClick={() => logoutMutation.mutate()}
                    variant="outline"
                    size="sm"
                    className="border-gray-600 text-gray-300 hover:bg-gray-700"
                    disabled={logoutMutation.isPending}
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Logout
                  </Button>
                </>
              ) : (
                <div className="text-right">
                  <p className="text-sm font-medium text-purple-300">Demo Mode</p>
                  <p className="text-xs text-gray-400">Church Dashboard Preview</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-white mb-2">
            {user ? `Welcome back, ${user?.firstName}!` : 'Church Dashboard'}
          </h2>
          <p className="text-gray-400">
            {user ? "Manage your church's digital giving and member engagement." : "Professional church management and financial oversight dashboard."}
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-300">Total Members</CardTitle>
              <Users className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{displayData?.memberCount || 0}</div>
              <p className="text-xs text-gray-400">Registered members</p>
            </CardContent>
          </Card>

          <Card className="bg-gray-800 border-gray-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-300">Monthly Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">R{stats?.monthlyRevenue || '0.00'}</div>
              <p className="text-xs text-gray-400">This month</p>
            </CardContent>
          </Card>

          <Card className="bg-gray-800 border-gray-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-300">Total Revenue</CardTitle>
              <TrendingUp className="h-4 w-4 text-purple-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">R{stats?.totalRevenue || '0.00'}</div>
              <p className="text-xs text-gray-400">All time</p>
            </CardContent>
          </Card>

          <Card className="bg-gray-800 border-gray-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-300">Active Projects</CardTitle>
              <Building2 className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{displayData?.projects?.filter((p: any) => p.status === 'active').length || 0}</div>
              <p className="text-xs text-gray-400">Ongoing campaigns</p>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Transactions */}
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Recent Transactions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {displayData?.recentTransactions?.length > 0 ? (
                  displayData.recentTransactions.slice(0, 5).map((transaction: any) => (
                    <div key={transaction.id} className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-white">{transaction.type}</p>
                        <p className="text-xs text-gray-400">{new Date(transaction.createdAt).toLocaleDateString()}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-green-500">R{transaction.amount}</p>
                        <p className="text-xs text-gray-400">{transaction.status}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-400 text-center py-4">No recent transactions</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Church Projects */}
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Active Projects</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {displayData?.projects?.filter((p: any) => p.status === 'active').length > 0 ? (
                  displayData.projects.filter((p: any) => p.status === 'active').slice(0, 3).map((project: any) => (
                    <div key={project.id} className="border-l-4 border-purple-500 pl-4">
                      <h4 className="text-sm font-medium text-white">{project.title}</h4>
                      <p className="text-xs text-gray-400 mb-2">{project.description?.substring(0, 60)}...</p>
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-400">Target: R{project.targetAmount}</span>
                        <span className="text-green-500">Raised: R{project.currentAmount}</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-400 text-center py-4">No active projects</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}