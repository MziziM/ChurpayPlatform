import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Reports } from "@/components/reports";
import { 
  Church, 
  Users, 
  DollarSign, 
  TrendingUp, 
  Settings, 
  Plus,
  CreditCard,
  BarChart3,
  Bell,
  Menu
} from "lucide-react";

export default function ChurchDashboard() {
  const [currentView, setCurrentView] = useState('overview');
  const { user } = useAuth();

  const { data: dashboardData, isLoading } = useQuery({
    queryKey: ["/api/churches", user?.churchId, "dashboard"],
    enabled: !!user?.churchId,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-churpay-purple"></div>
      </div>
    );
  }

  const renderView = () => {
    switch (currentView) {
      case 'overview':
        return <ChurchOverview data={dashboardData} />;
      case 'reports':
        return <Reports />;
      case 'members':
        return <div className="p-6">Member management coming soon...</div>;
      case 'projects':
        return <div className="p-6">Project management coming soon...</div>;
      case 'payouts':
        return <div className="p-6">Payout requests coming soon...</div>;
      case 'settings':
        return <div className="p-6">Church settings coming soon...</div>;
      default:
        return <ChurchOverview data={dashboardData} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-churpay-gradient rounded-lg flex items-center justify-center">
                <Church className="h-4 w-4 text-white" />
              </div>
              <div>
                <span className="text-2xl font-bold text-gray-900">Chur</span>
                <span className="text-2xl font-bold text-churpay-yellow">Pay</span>
              </div>
            </div>
            {dashboardData?.church && (
              <div className="hidden md:block">
                <h2 className="text-lg font-semibold text-gray-900">{dashboardData.church.name}</h2>
                <p className="text-sm text-gray-600">{dashboardData.church.city}, {dashboardData.church.province}</p>
              </div>
            )}
          </div>

          <nav className="hidden md:flex items-center space-x-1">
            {[
              { id: 'overview', label: 'Overview', icon: BarChart3 },
              { id: 'reports', label: 'Reports', icon: TrendingUp },
              { id: 'members', label: 'Members', icon: Users },
              { id: 'projects', label: 'Projects', icon: Church },
              { id: 'payouts', label: 'Payouts', icon: CreditCard },
              { id: 'settings', label: 'Settings', icon: Settings },
            ].map((item) => (
              <Button
                key={item.id}
                variant={currentView === item.id ? "default" : "ghost"}
                onClick={() => setCurrentView(item.id)}
                className={currentView === item.id ? "bg-primary text-white" : ""}
              >
                <item.icon className="h-4 w-4 mr-2" />
                {item.label}
              </Button>
            ))}
          </nav>

          <div className="flex items-center space-x-3">
            <Button variant="ghost" size="sm" className="relative">
              <Bell className="h-5 w-5" />
              <Badge className="absolute -top-1 -right-1 h-5 w-5 text-xs bg-red-500 text-white rounded-full flex items-center justify-center">
                3
              </Badge>
            </Button>

            <Button 
              variant="outline"
              onClick={() => window.location.href = '/api/logout'}
            >
              Sign Out
            </Button>

            <Button variant="ghost" size="sm" className="md:hidden">
              <Menu className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </header>

      <main>{renderView()}</main>
    </div>
  );
}

function ChurchOverview({ data }: { data: any }) {
  if (!data) {
    return (
      <div className="p-6">
        <div className="text-center">
          <h2 className="text-lg font-medium text-gray-900">Loading church data...</h2>
        </div>
      </div>
    );
  }

  const stats = data.stats || {};
  const church = data.church || {};

  return (
    <div className="p-6 space-y-6">
      {/* Welcome Section */}
      <div className="bg-churpay-gradient rounded-lg p-6 text-white">
        <h1 className="text-3xl font-bold mb-2">Welcome back!</h1>
        <p className="text-purple-100 mb-4">
          Here's what's happening with {church.name || 'your church'} today.
        </p>
        <div className="flex flex-wrap gap-3">
          <Button variant="secondary" className="bg-white text-purple-700 hover:bg-purple-50">
            <Plus className="h-4 w-4 mr-2" />
            New Project
          </Button>
          <Button variant="outline" className="border-white text-white hover:bg-white/10">
            <CreditCard className="h-4 w-4 mr-2" />
            Request Payout
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">
              Total Donations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-gray-900">
                  R {stats.completedAmount?.toLocaleString() || '0'}
                </div>
                <div className="flex items-center mt-1">
                  <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                  <span className="text-sm text-green-600">This month</span>
                </div>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <DollarSign className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">
              Church Members
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-gray-900">
                  {data.memberCount || church.memberCount || 0}
                </div>
                <div className="flex items-center mt-1">
                  <span className="text-sm text-gray-600">Active members</span>
                </div>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">
              Active Projects
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-gray-900">
                  {data.projects?.filter((p: any) => p.status === 'active').length || 0}
                </div>
                <div className="flex items-center mt-1">
                  <span className="text-sm text-gray-600">Fundraising</span>
                </div>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Church className="h-6 w-6 text-churpay-purple" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">
              This Month
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-gray-900">
                  R {stats.thisMonth?.toLocaleString() || '0'}
                </div>
                <div className="flex items-center mt-1">
                  <span className="text-sm text-gray-600">Current month</span>
                </div>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Recent Donations</CardTitle>
          </CardHeader>
          <CardContent>
            {data.recentTransactions?.length > 0 ? (
              <div className="space-y-3">
                {data.recentTransactions.slice(0, 5).map((transaction: any, index: number) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <div className="font-medium text-gray-900">
                        R {parseFloat(transaction.amount).toLocaleString()}
                      </div>
                      <div className="text-sm text-gray-500">
                        {transaction.donationType || 'General'} • {new Date(transaction.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                    <Badge 
                      variant={transaction.status === 'completed' ? 'default' : 'secondary'}
                      className={transaction.status === 'completed' ? 'bg-green-100 text-green-800' : ''}
                    >
                      {transaction.status}
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <DollarSign className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No donations yet</h3>
                <p className="text-gray-600">Once your church starts receiving donations, they'll appear here.</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Active Projects</CardTitle>
          </CardHeader>
          <CardContent>
            {data.projects?.length > 0 ? (
              <div className="space-y-3">
                {data.projects.filter((p: any) => p.status === 'active').slice(0, 3).map((project: any, index: number) => (
                  <div key={index} className="p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <div className="font-medium text-gray-900">{project.name}</div>
                      <Badge variant="secondary">
                        {Math.round((parseFloat(project.currentAmount) / parseFloat(project.targetAmount)) * 100)}%
                      </Badge>
                    </div>
                    <div className="text-sm text-gray-600 mb-2">
                      R {parseFloat(project.currentAmount).toLocaleString()} of R {parseFloat(project.targetAmount).toLocaleString()}
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-churpay-purple h-2 rounded-full" 
                        style={{ width: `${Math.min((parseFloat(project.currentAmount) / parseFloat(project.targetAmount)) * 100, 100)}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Church className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No active projects</h3>
                <p className="text-gray-600 mb-4">Create fundraising projects to engage your community.</p>
                <Button className="bg-churpay-gradient text-white">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Project
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
