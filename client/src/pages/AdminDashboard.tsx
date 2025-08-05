import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useQuery } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { useLocation } from 'wouter';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import {
  Shield,
  Users,
  Building2,
  DollarSign,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertTriangle,
  LogOut,
  Settings,
  BarChart3,
  UserCheck
} from 'lucide-react';

export default function AdminDashboard() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const { admin, isAuthenticated, isLoading, signOut, makeAuthenticatedRequest } = useAdminAuth();

  // Redirect if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to access the admin dashboard.",
        variant: "destructive",
      });
      navigate('/admin/signin');
    }
  }, [isAuthenticated, isLoading, navigate, toast]);

  // Fetch admin dashboard data
  const { data: dashboardData, isLoading: dataLoading, error } = useQuery({
    queryKey: ['/api/admin/dashboard'],
    queryFn: async () => {
      const response = await makeAuthenticatedRequest('GET', '/api/admin/dashboard');
      return response.json();
    },
    enabled: isAuthenticated,
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  const handleSignOut = async () => {
    try {
      await signOut();
      toast({
        title: "Signed Out",
        description: "Successfully signed out of admin dashboard.",
      });
      navigate('/admin/signin');
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  if (isLoading || dataLoading) {
    return (
      <div className="min-h-screen" style={{background: 'linear-gradient(135deg, #2d1b69 0%, #663399 50%, #11101d 100%)'}}>
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-yellow-400 mx-auto mb-4"></div>
            <p className="text-white">Loading admin dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !admin) {
    return null; // Will redirect via useEffect
  }

  if (error) {
    return (
      <div className="min-h-screen" style={{background: 'linear-gradient(135deg, #2d1b69 0%, #663399 50%, #11101d 100%)'}}>
        <div className="flex items-center justify-center h-screen">
          <Card className="max-w-md bg-gray-800/60 backdrop-blur-sm border border-gray-700/50">
            <CardContent className="p-6 text-center">
              <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2 text-white">Dashboard Error</h2>
              <p className="text-gray-300 mb-4">Failed to load dashboard data.</p>
              <Button onClick={() => window.location.reload()} variant="outline">
                Retry
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const stats = dashboardData?.stats || {};
  const systemHealth = dashboardData?.systemHealth || {};

  return (
    <div className="min-h-screen" style={{background: 'linear-gradient(135deg, #2d1b69 0%, #663399 50%, #11101d 100%)'}}>
      {/* Header */}
      <div className="flex justify-between items-center p-6">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Good afternoon, {admin?.firstName || 'Admin'}</h1>
          <p className="text-gray-300 flex items-center">
            Here's your church management overview and activity
            <div className="w-2 h-2 bg-green-400 rounded-full ml-2"></div>
          </p>
        </div>
        <div className="text-sm text-gray-300">
          Last active<br />
          <span className="text-white font-medium">2 minutes ago</span>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex items-center space-x-6 px-6 mb-8">
        <div className="text-white border-b-2 border-purple-400 pb-2">Dashboard</div>
        <div className="text-gray-400 hover:text-white cursor-pointer">Churches</div>
        <div className="text-gray-400 hover:text-white cursor-pointer">Members</div>
        <div className="text-gray-400 hover:text-white cursor-pointer">Reports</div>
        <div className="text-gray-400 hover:text-white cursor-pointer">Settings</div>
        <div className="ml-auto">
          <Button onClick={handleSignOut} variant="outline" size="sm" className="border-gray-600 text-gray-300 hover:bg-gray-800/50">
            <LogOut className="h-4 w-4 mr-2" />
            Sign Out
          </Button>
        </div>
      </div>

      <div className="px-6 space-y-8">
        {/* Main Action Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="bg-gradient-to-br from-purple-600 to-purple-700 border-0 text-white rounded-2xl">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Manage Churches</h3>
              <p className="text-sm opacity-90 mb-4">Oversee church operations</p>
              <Button className="bg-white/20 hover:bg-white/30 text-white border-0 w-full">
                View Churches
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-gray-800/60 backdrop-blur-sm border border-gray-700/50 text-white rounded-2xl">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-purple-600/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Building2 className="w-6 h-6 text-purple-400" />
              </div>
              <h3 className="text-lg font-semibold mb-2">My Church</h3>
              <p className="text-sm text-gray-300 mb-2">R 0</p>
              <p className="text-xs text-gray-400">Support your church</p>
            </CardContent>
          </Card>

          <Card className="bg-gray-800/60 backdrop-blur-sm border border-gray-700/50 text-white rounded-2xl">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-yellow-400/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <BarChart3 className="w-6 h-6 text-yellow-400" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Reports</h3>
              <p className="text-sm text-gray-300 mb-2">Analytics</p>
              <p className="text-xs text-gray-400">View detailed reports</p>
            </CardContent>
          </Card>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="bg-gradient-to-br from-blue-600 to-indigo-600 border-0 text-white rounded-2xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm opacity-90 mb-2">This Month</p>
                  <p className="text-sm opacity-75">Church activity summary</p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold">R {stats.monthlyDonations || '0'}</div>
                  <div className="text-sm opacity-75">Total Revenue</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-600 to-pink-600 border-0 text-white rounded-2xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm opacity-90 mb-2">Active Churches</p>
                  <p className="text-sm opacity-75">Your available network</p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold">{stats.totalChurches || '0'}</div>
                  <div className="text-sm opacity-75">Available churches</div>
                  <div className="flex items-center justify-end mt-2">
                    <span className="text-xs bg-white/20 px-2 py-1 rounded">Active & Secured</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Additional Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="bg-gradient-to-br from-green-600 to-emerald-600 border-0 text-white rounded-2xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm opacity-90 mb-2">Total Members</p>
                  <p className="text-2xl font-bold">{stats.totalMembers || '0'}</p>
                </div>
                <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
                  <UserCheck className="w-6 h-6" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-yellow-500 to-orange-500 border-0 text-white rounded-2xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm opacity-90 mb-2">System Health</p>
                  <p className="text-2xl font-bold">99.9%</p>
                </div>
                <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
                  <CheckCircle className="w-6 h-6" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-red-500 to-pink-500 border-0 text-white rounded-2xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm opacity-90 mb-2">Platform Revenue</p>
                  <p className="text-2xl font-bold">R{(stats.totalRevenue || 0).toLocaleString()}</p>
                </div>
                <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
                  <DollarSign className="w-6 h-6" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}