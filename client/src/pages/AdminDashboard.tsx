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
import churpayLogo from '@assets/Churpay Logo tuesd_1754387201756.png';

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
        <div className="flex items-center space-x-4">
          <img src={churpayLogo} alt="ChurPay" className="h-10 w-auto" />
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Good afternoon, {admin?.firstName || 'Admin'}</h1>
            <div className="text-gray-300 flex items-center">
              Here's your church management overview and activity
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

      {/* Main Content */}
      <div className="px-6 space-y-6">
        {/* Action Cards Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Give Now Card */}
          <div className="bg-gradient-to-r from-purple-600 to-purple-700 rounded-2xl p-6 text-white text-center">
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Manage Churches</h3>
            <p className="text-sm opacity-90 mb-4">Oversee church operations</p>
            <button className="bg-white/20 hover:bg-white/30 px-6 py-2 rounded-lg text-sm font-medium transition-colors">
              Manage Now
            </button>
          </div>

          {/* My Wallet Card */}
          <div className="bg-gray-800/60 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-6 text-white text-center">
            <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Building2 className="w-6 h-6 text-blue-400" />
            </div>
            <h3 className="text-lg font-semibold mb-2">My Church</h3>
            <p className="text-xl font-bold text-blue-400">R 0</p>
            <p className="text-xs text-gray-400">Support your church</p>
          </div>

          {/* Tithe Card */}
          <div className="bg-gray-800/60 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-6 text-white text-center">
            <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <BarChart3 className="w-6 h-6 text-green-400" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Reports</h3>
            <p className="text-xl font-bold text-green-400">Analytics</p>
            <p className="text-xs text-gray-400">View detailed reports</p>
          </div>
        </div>

        {/* Stats Cards Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* This Month Card */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-6 text-white">
            <div className="flex items-center mb-4">
              <TrendingUp className="w-5 h-5 mr-2" />
              <h3 className="text-lg font-semibold">This Month</h3>
            </div>
            <p className="text-sm opacity-90 mb-6">Your church activity summary</p>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-green-400 rounded-full mr-3"></div>
                  <span className="text-sm">Total Given</span>
                </div>
                <span className="font-semibold">R {stats.monthlyDonations || '2,400'}</span>
              </div>
              
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-purple-400 rounded-full mr-3"></div>
                  <span className="text-sm">Tithes</span>
                </div>
                <span className="font-semibold">R {stats.monthlyTithes || '1,800'}</span>
              </div>
              
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-orange-400 rounded-full mr-3"></div>
                  <span className="text-sm">Donations</span>
                </div>
                <span className="font-semibold">R {stats.monthlyDonations || '600'}</span>
              </div>
            </div>
          </div>

          {/* Wallet Balance Card */}
          <div className="bg-gradient-to-r from-purple-600 to-purple-700 rounded-2xl p-6 text-white">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Church Balance</h3>
              <button className="text-sm opacity-75 hover:opacity-100">Manage →</button>
            </div>
            <p className="text-sm opacity-90 mb-6">Your available funds</p>
            
            <div className="text-center">
              <p className="text-4xl font-bold mb-2">R {stats.totalBalance || '0'}</p>
              <p className="text-sm opacity-75 mb-4">Available balance</p>
              
              <div className="flex items-center justify-center text-sm">
                <div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
                <span>Active & Secured</span>
              </div>
              
              <button className="mt-4 bg-white/20 hover:bg-white/30 px-6 py-2 rounded-lg text-sm font-medium transition-colors w-full">
                + Add Funds
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}