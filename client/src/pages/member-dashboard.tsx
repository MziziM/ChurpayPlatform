import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
  History
} from "lucide-react";

export default function MemberDashboard() {
  const [currentView, setCurrentView] = useState('overview');
  const { user } = useAuth();

  const { data: dashboardData, isLoading } = useQuery({
    queryKey: ["/api/members/dashboard"],
    enabled: !!user,
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
        return <MemberOverview data={dashboardData} />;
      case 'donate':
        return <div className="p-6">Donation form coming soon...</div>;
      case 'history':
        return <div className="p-6">Donation history coming soon...</div>;
      case 'projects':
        return <div className="p-6">Community projects coming soon...</div>;
      case 'settings':
        return <div className="p-6">Member settings coming soon...</div>;
      default:
        return <MemberOverview data={dashboardData} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-lg flex items-center justify-center">
                <Heart className="h-4 w-4 text-white" />
              </div>
              <div>
                <span className="text-2xl font-bold text-gray-900">Chur</span>
                <span className="text-2xl font-bold text-churpay-yellow">Pay</span>
              </div>
            </div>
            <div className="hidden md:block">
              <h2 className="text-lg font-semibold text-gray-900">My Giving</h2>
              <p className="text-sm text-gray-600">Welcome back, {user?.firstName || 'Member'}</p>
            </div>
          </div>

          <nav className="hidden md:flex items-center space-x-1">
            {[
              { id: 'overview', label: 'Overview', icon: TrendingUp },
              { id: 'donate', label: 'Donate', icon: Heart },
              { id: 'history', label: 'History', icon: History },
              { id: 'projects', label: 'Projects', icon: Target },
              { id: 'settings', label: 'Settings', icon: CreditCard },
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

function MemberOverview({ data }: { data: any }) {
  if (!data) {
    return (
      <div className="p-6">
        <div className="text-center">
          <h2 className="text-lg font-medium text-gray-900">Loading your giving data...</h2>
        </div>
      </div>
    );
  }

  const stats = data.stats || {};
  const user = data.user || {};

  return (
    <div className="p-6 space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-br from-yellow-400 to-orange-500 rounded-lg p-6 text-white">
        <h1 className="text-3xl font-bold mb-2">Your Giving Journey</h1>
        <p className="text-orange-100 mb-4">
          Thank you for being part of our community and making a difference through your generous giving.
        </p>
        <div className="flex flex-wrap gap-3">
          <Button variant="secondary" className="bg-white text-orange-700 hover:bg-orange-50">
            <Heart className="h-4 w-4 mr-2" />
            Make Donation
          </Button>
          <Button variant="outline" className="border-white text-white hover:bg-white/10">
            <Target className="h-4 w-4 mr-2" />
            View Projects
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">
              Total Given
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-gray-900">
                  R {stats.totalDonated?.toLocaleString() || '0'}
                </div>
                <div className="flex items-center mt-1">
                  <span className="text-sm text-gray-600">All time</span>
                </div>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Heart className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">
              Donations Made
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-gray-900">
                  {stats.transactionCount || 0}
                </div>
                <div className="flex items-center mt-1">
                  <span className="text-sm text-gray-600">Total donations</span>
                </div>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <CreditCard className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">
              This Year
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-gray-900">
                  R {stats.thisYearTotal?.toLocaleString() || '0'}
                </div>
                <div className="flex items-center mt-1">
                  <span className="text-sm text-gray-600">2024 total</span>
                </div>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Calendar className="h-6 w-6 text-churpay-purple" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">
              Impact Score
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-gray-900">
                  {Math.min(Math.round((stats.totalDonated || 0) / 100), 100)}
                </div>
                <div className="flex items-center mt-1">
                  <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                  <span className="text-sm text-green-600">Growing</span>
                </div>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <Target className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity & Projects */}
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
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                        <Heart className="h-4 w-4 text-green-600" />
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">
                          R {parseFloat(transaction.amount).toLocaleString()}
                        </div>
                        <div className="text-sm text-gray-500">
                          {transaction.donationType || 'General'} • {new Date(transaction.createdAt).toLocaleDateString()}
                        </div>
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
                <Heart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No donations yet</h3>
                <p className="text-gray-600 mb-4">Start your giving journey by making your first donation.</p>
                <Button className="bg-gradient-to-br from-yellow-400 to-orange-500 text-white">
                  <Heart className="h-4 w-4 mr-2" />
                  Make First Donation
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Community Projects</CardTitle>
          </CardHeader>
          <CardContent>
            {data.publicProjects?.length > 0 ? (
              <div className="space-y-3">
                {data.publicProjects.slice(0, 3).map((project: any, index: number) => (
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
                    <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                      <div 
                        className="bg-gradient-to-r from-yellow-400 to-orange-500 h-2 rounded-full" 
                        style={{ width: `${Math.min((parseFloat(project.currentAmount) / parseFloat(project.targetAmount)) * 100, 100)}%` }}
                      ></div>
                    </div>
                    <Button size="sm" className="w-full bg-gradient-to-br from-yellow-400 to-orange-500 text-white">
                      Support Project
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Target className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No active projects</h3>
                <p className="text-gray-600">Community projects will appear here when available.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Giving Goals */}
      <Card>
        <CardHeader>
          <CardTitle>2024 Giving Goals</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Heart className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">Regular Giver</h3>
              <p className="text-sm text-gray-600 mb-2">Make donations monthly</p>
              <Badge className="bg-green-100 text-green-800">Achieved</Badge>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Target className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">Project Supporter</h3>
              <p className="text-sm text-gray-600 mb-2">Support 3 community projects</p>
              <Badge variant="secondary">In Progress</Badge>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <TrendingUp className="h-8 w-8 text-churpay-purple" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">Growth Mindset</h3>
              <p className="text-sm text-gray-600 mb-2">Increase giving by 10%</p>
              <Badge variant="secondary">Upcoming</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
