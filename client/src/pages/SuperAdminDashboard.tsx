import { useSuperAdminAuth } from "@/hooks/useSuperAdminAuth";
import { SuperAdminPlatformDashboard } from "@/components/SuperAdminPlatformDashboard";
import { PlatformFinancialsModal } from "@/components/PlatformFinancialsModal";
import { ChurchManagementModal } from "@/components/ChurchManagementModal";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from '@/components/ui/card';
import { LogOut, Shield, Users, Building2, DollarSign, BarChart3, CheckCircle, Crown, TrendingUp } from "lucide-react";
import churpayLogo from '@assets/Churpay Logo tuesd_1754387201756.png';
import { useLocation } from 'wouter';
import { useToast } from '@/hooks/use-toast';
import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';

// Platform Statistics Type Definition
interface PlatformStats {
  totalRevenue: string;
  totalTransactions: number;
  activeChurches: number;
  totalChurches: number;
  totalMembers: number;
  pendingPayouts: string;
  completedPayouts: string;
  platformFees: string;
  monthlyRevenue: string;
  revenueGrowth: number;
  transactionGrowth: number;
  churchGrowth: number;
  payoutGrowth: number;
  // Additional properties for enhanced functionality
  monthlyTransactions?: number;
  newChurchesThisMonth?: number;
  platformReserves?: string;
  availableReserves?: string;
}

export default function SuperAdminDashboard() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const { superAdmin, isLoading, isAuthenticated } = useSuperAdminAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isFinancialsModalOpen, setIsFinancialsModalOpen] = useState(false);
  const [isChurchModalOpen, setIsChurchModalOpen] = useState(false);

  // Real-time platform statistics
  const { data: platformStats, isLoading: statsLoading } = useQuery<PlatformStats>({
    queryKey: ['/api/super-admin/stats'],
    enabled: isAuthenticated,
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  // Real-time analytics data
  const { data: analyticsData, isLoading: analyticsLoading } = useQuery({
    queryKey: ['/api/super-admin/analytics'],
    enabled: isAuthenticated,
    refetchInterval: 60000, // Refresh every minute
  });

  // Churches data
  const { data: churchesData, isLoading: churchesLoading } = useQuery({
    queryKey: ['/api/super-admin/churches'],
    enabled: isAuthenticated && activeTab === 'churches',
  });

  // Payouts data
  const { data: payoutsData, isLoading: payoutsLoading } = useQuery({
    queryKey: ['/api/super-admin/payouts'],
    enabled: isAuthenticated && activeTab === 'payouts',
  });

  // Recent activity
  const { data: recentActivity, isLoading: activityLoading } = useQuery({
    queryKey: ['/api/super-admin/recent-activity'],
    enabled: isAuthenticated,
    refetchInterval: 15000, // Refresh every 15 seconds
  });

  // Redirect to signin if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to access the Super Admin Dashboard.",
        variant: "destructive",
      });
      navigate('/super-admin/signin');
    }
  }, [isAuthenticated, isLoading, navigate, toast]);

  const handleSignOut = async () => {
    try {
      const response = await fetch('/api/super-admin/signout', {
        method: 'POST',
        credentials: 'include'
      });
      
      if (response.ok) {
        toast({
          title: "Signed Out",
          description: "You have been successfully signed out.",
        });
        navigate('/super-admin/signin');
      }
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!isAuthenticated || !superAdmin) {
    return null; // Will redirect via useEffect
  }

  return (
    <div className="min-h-screen" style={{background: 'linear-gradient(135deg, #2d1b69 0%, #663399 50%, #11101d 100%)'}}>
      {/* Header */}
      <div className="flex justify-between items-center p-6">
        <div className="flex items-center space-x-4">
          <img src={churpayLogo} alt="ChurPay" className="h-10 w-auto filter drop-shadow-lg" />
          <div>
            <h1 className="text-3xl font-heading font-bold text-white mb-2">Good afternoon, {superAdmin?.firstName || 'Super Admin'}</h1>
            <div className="text-gray-300 flex items-center">
              Here's your platform overview and system activity
              <div className="w-2 h-2 bg-green-400 rounded-full ml-2"></div>
            </div>
          </div>
        </div>
        <div className="text-sm text-gray-300">
          Last active<br />
          <span className="text-white font-medium">2 minutes ago</span>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex items-center space-x-6 px-6 mb-8">
        <div 
          className={`cursor-pointer pb-2 ${activeTab === 'dashboard' ? 'text-white border-b-2 border-purple-400' : 'text-gray-400 hover:text-white'}`}
          onClick={() => setActiveTab('dashboard')}
        >
          Dashboard
        </div>
        <div 
          className={`cursor-pointer pb-2 ${activeTab === 'churches' ? 'text-white border-b-2 border-purple-400' : 'text-gray-400 hover:text-white'}`}
          onClick={() => setActiveTab('churches')}
        >
          Churches
        </div>
        <div 
          className={`cursor-pointer pb-2 ${activeTab === 'payouts' ? 'text-white border-b-2 border-purple-400' : 'text-gray-400 hover:text-white'}`}
          onClick={() => setActiveTab('payouts')}
        >
          Payouts
        </div>
        <div 
          className={`cursor-pointer pb-2 ${activeTab === 'analytics' ? 'text-white border-b-2 border-purple-400' : 'text-gray-400 hover:text-white'}`}
          onClick={() => setActiveTab('analytics')}
        >
          Analytics
        </div>
        <div className="ml-auto">
          <Button onClick={handleSignOut} variant="outline" size="sm" className="border-gray-600 text-gray-300 hover:bg-gray-800/50">
            <LogOut className="h-4 w-4 mr-2" />
            Sign Out
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-6 space-y-6">
        {activeTab === 'dashboard' && (
          <>
            {/* Real-Time Platform Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {/* Total Revenue */}
              <div className="bg-gradient-to-br from-green-600 to-green-700 rounded-2xl p-6 text-white">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                    <DollarSign className="w-6 h-6" />
                  </div>
                  <TrendingUp className="w-5 h-5 text-green-200" />
                </div>
                <h3 className="text-sm font-medium mb-1 opacity-90">Total Revenue</h3>
                <p className="text-2xl font-bold">
                  {statsLoading ? '...' : `R ${platformStats?.totalRevenue || '0.00'}`}
                </p>
                <p className="text-xs opacity-75 mt-1">
                  {statsLoading ? '...' : `${platformStats?.revenueGrowth || 0}% growth`}
                </p>
              </div>

              {/* Active Churches */}
              <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl p-6 text-white">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                    <Building2 className="w-6 h-6" />
                  </div>
                  <TrendingUp className="w-5 h-5 text-blue-200" />
                </div>
                <h3 className="text-sm font-medium mb-1 opacity-90">Active Churches</h3>
                <p className="text-2xl font-bold">
                  {statsLoading ? '...' : (platformStats?.activeChurches || 0)}
                </p>
                <p className="text-xs opacity-75 mt-1">
                  {statsLoading ? '...' : `${platformStats?.churchGrowth || 0}% growth`}
                </p>
              </div>

              {/* Total Members */}
              <div className="bg-gradient-to-br from-purple-600 to-purple-700 rounded-2xl p-6 text-white">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                    <Users className="w-6 h-6" />
                  </div>
                  <TrendingUp className="w-5 h-5 text-purple-200" />
                </div>
                <h3 className="text-sm font-medium mb-1 opacity-90">Total Members</h3>
                <p className="text-2xl font-bold">
                  {statsLoading ? '...' : (platformStats?.totalMembers || 0).toLocaleString()}
                </p>
                <p className="text-xs opacity-75 mt-1">Active users</p>
              </div>

              {/* Transactions */}
              <div className="bg-gradient-to-br from-orange-600 to-orange-700 rounded-2xl p-6 text-white">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                    <BarChart3 className="w-6 h-6" />
                  </div>
                  <TrendingUp className="w-5 h-5 text-orange-200" />
                </div>
                <h3 className="text-sm font-medium mb-1 opacity-90">Transactions</h3>
                <p className="text-2xl font-bold">
                  {statsLoading ? '...' : (platformStats?.totalTransactions || 0).toLocaleString()}
                </p>
                <p className="text-xs opacity-75 mt-1">
                  {statsLoading ? '...' : `${platformStats?.transactionGrowth || 0}% growth`}
                </p>
              </div>
            </div>

            {/* Recent Activity Feed */}
            <div className="bg-gray-800/80 backdrop-blur-xl border border-gray-700/60 rounded-2xl p-6">
              <h3 className="text-xl font-semibold text-white mb-4">Recent Platform Activity</h3>
              <div className="space-y-3">
                {activityLoading ? (
                  <div className="text-gray-400">Loading recent activity...</div>
                ) : recentActivity?.length > 0 ? (
                  recentActivity.slice(0, 5).map((activity: any) => (
                    <div key={activity.id} className="flex items-center justify-between py-3 border-b border-gray-700/50 last:border-b-0">
                      <div className="flex items-center space-x-3">
                        <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                        <div>
                          <p className="text-white text-sm">{activity.description || activity.action}</p>
                          <p className="text-gray-400 text-xs">{activity.timestamp || activity.createdAt}</p>
                        </div>
                      </div>
                      <div className="text-green-400 text-sm font-medium">
                        {activity.amount && `R ${activity.amount}`}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-gray-400">No recent activity</div>
                )}
              </div>
            </div>
          </>
        )}

        {activeTab === 'churches' && (
          <div className="bg-gray-800/80 backdrop-blur-xl border border-gray-700/60 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-xl font-semibold text-white mb-2">Church Management</h3>
                <p className="text-gray-400 text-sm">Manage church registrations and platform access</p>
              </div>
              <Button 
                onClick={() => setIsChurchModalOpen(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Building2 className="w-4 h-4 mr-2" />
                Manage Churches
              </Button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Quick Stats */}
              <div className="bg-gradient-to-br from-blue-600/20 to-blue-700/20 rounded-xl p-4 border border-blue-500/30">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-300 text-sm">Pending Reviews</p>
                    <p className="text-2xl font-bold text-white">
                      {churchesLoading ? '...' : (churchesData?.filter((c: any) => c.status === 'pending').length || 0)}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-yellow-500/20 rounded-full flex items-center justify-center">
                    <Building2 className="w-6 h-6 text-yellow-400" />
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-green-600/20 to-green-700/20 rounded-xl p-4 border border-green-500/30">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-green-300 text-sm">Active Churches</p>
                    <p className="text-2xl font-bold text-white">
                      {churchesLoading ? '...' : (churchesData?.filter((c: any) => c.status === 'approved').length || 0)}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-6 h-6 text-green-400" />
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-purple-600/20 to-purple-700/20 rounded-xl p-4 border border-purple-500/30">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-purple-300 text-sm">Total Members</p>
                    <p className="text-2xl font-bold text-white">
                      {churchesLoading ? '...' : (churchesData?.reduce((total: number, church: any) => total + (church.memberCount || 0), 0).toLocaleString() || '0')}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-purple-500/20 rounded-full flex items-center justify-center">
                    <Users className="w-6 h-6 text-purple-400" />
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Church Activity */}
            <div className="mt-6">
              <h4 className="text-lg font-medium text-white mb-4">Recent Church Activity</h4>
              <div className="space-y-3">
                {churchesLoading ? (
                  <div className="text-gray-400">Loading recent activity...</div>
                ) : churchesData?.slice(0, 3).map((church: any) => (
                  <div key={church.id} className="bg-gray-700/50 rounded-lg p-4 flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-blue-500/20 rounded-full flex items-center justify-center">
                        <Building2 className="w-5 h-5 text-blue-400" />
                      </div>
                      <div>
                        <h5 className="text-white font-medium">{church.name}</h5>
                        <p className="text-gray-400 text-sm">{church.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        church.status === 'approved' ? 'bg-green-500/20 text-green-400' : 
                        church.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400' :
                        'bg-red-500/20 text-red-400'
                      }`}>
                        {church.status}
                      </span>
                    </div>
                  </div>
                )) || (
                  <div className="text-gray-400 text-center py-8">
                    <Building2 className="w-12 h-12 mx-auto mb-3 text-gray-500" />
                    <p>No church registrations yet</p>
                    <p className="text-sm">Churches will appear here once they register</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'payouts' && (
          <div className="bg-gray-800/80 backdrop-blur-xl border border-gray-700/60 rounded-2xl p-6">
            <h3 className="text-xl font-semibold text-white mb-4">Payout Requests</h3>
            <div className="space-y-4">
              {payoutsLoading ? (
                <div className="text-gray-400">Loading payouts...</div>
              ) : payoutsData?.length > 0 ? (
                payoutsData.map((payout: any) => (
                  <div key={payout.id} className="bg-gray-700/50 rounded-lg p-4 flex items-center justify-between">
                    <div>
                      <h4 className="text-white font-medium">{payout.churchName || 'Church Name'}</h4>
                      <p className="text-gray-400 text-sm">Amount: R {payout.amount}</p>
                      <p className="text-gray-400 text-xs">Requested: {payout.requestDate || payout.createdAt}</p>
                    </div>
                    <div className="flex items-center space-x-3">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        payout.status === 'completed' ? 'bg-green-500/20 text-green-400' : 
                        payout.status === 'requested' || payout.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400' :
                        'bg-red-500/20 text-red-400'
                      }`}>
                        {payout.status}
                      </span>
                      {(payout.status === 'requested' || payout.status === 'pending') && (
                        <div className="flex space-x-2">
                          <Button size="sm" className="bg-green-600 hover:bg-green-700">Approve</Button>
                          <Button size="sm" variant="outline" className="border-red-600 text-red-400 hover:bg-red-600">Reject</Button>
                        </div>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-gray-400">No payout requests</div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'analytics' && (
          <div className="bg-gray-800/80 backdrop-blur-xl border border-gray-700/60 rounded-2xl p-6">
            <h3 className="text-xl font-semibold text-white mb-4">Platform Analytics</h3>
            <div className="text-gray-400">
              {analyticsLoading ? 'Loading analytics...' : 'Analytics charts and data visualization coming soon...'}
            </div>
            {analyticsData && (
              <pre className="text-xs text-gray-500 mt-4 overflow-auto">
                {JSON.stringify(analyticsData, null, 2)}
              </pre>
            )}
          </div>
        )}

        {/* Stats Cards Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* This Month Platform Stats Card */}
          <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl p-6 text-white">
            <div className="flex items-center mb-4">
              <BarChart3 className="w-5 h-5 mr-2" />
              <h3 className="text-lg font-semibold">This Month</h3>
            </div>
            <p className="text-sm opacity-90 mb-6">Platform performance summary</p>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-green-400 rounded-full mr-3"></div>
                  <span className="text-sm">Platform Revenue</span>
                </div>
                <span className="font-semibold">
                  {statsLoading ? '...' : `R ${platformStats?.monthlyRevenue || '0.00'}`}
                </span>
              </div>
              
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-purple-400 rounded-full mr-3"></div>
                  <span className="text-sm">Platform Fees</span>
                </div>
                <span className="font-semibold">
                  {statsLoading ? '...' : `R ${platformStats?.platformFees || '0.00'}`}
                </span>
              </div>
              
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-orange-400 rounded-full mr-3"></div>
                  <span className="text-sm">Active Churches</span>
                </div>
                <span className="font-semibold">
                  {statsLoading ? '...' : (platformStats?.activeChurches || 0)}
                </span>
              </div>
            </div>
          </div>

          {/* Platform Financial Summary Card */}
          <div className="bg-gradient-to-br from-purple-600 to-purple-700 rounded-2xl p-6 text-white">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Platform Financials</h3>
              <button 
                onClick={() => setIsFinancialsModalOpen(true)}
                className="text-sm opacity-75 hover:opacity-100 transition-opacity"
              >
                View Details →
              </button>
            </div>
            <p className="text-sm opacity-90 mb-6">Platform earnings & payouts</p>
            
            <div className="text-center">
              <p className="text-4xl font-bold mb-2">
                {statsLoading ? '...' : `R ${platformStats?.platformFees || '0.00'}`}
              </p>
              <p className="text-sm opacity-75 mb-4">Platform earnings</p>
              
              <div className="flex items-center justify-center text-sm mb-4">
                <div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
                <span>Operational & Secured</span>
              </div>
              
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="bg-white/10 rounded-lg p-2">
                  <div>Pending Payouts</div>
                  <div className="font-semibold">
                    {statsLoading ? '...' : `R ${platformStats?.pendingPayouts || '0.00'}`}
                  </div>
                </div>
                <div className="bg-white/10 rounded-lg p-2">
                  <div>Completed</div>
                  <div className="font-semibold">
                    {statsLoading ? '...' : `R ${platformStats?.completedPayouts || '0.00'}`}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Platform Financials Modal */}
      <PlatformFinancialsModal 
        isOpen={isFinancialsModalOpen}
        onClose={() => setIsFinancialsModalOpen(false)}
      />

      {/* Church Management Modal */}
      <ChurchManagementModal 
        isOpen={isChurchModalOpen}
        onClose={() => setIsChurchModalOpen(false)}
      />
    </div>
  );
}