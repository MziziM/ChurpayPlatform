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
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !admin) {
    return null; // Will redirect via useEffect
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="p-6 text-center">
            <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Dashboard Error</h2>
            <p className="text-gray-600 mb-4">Failed to load dashboard data.</p>
            <Button onClick={() => window.location.reload()} variant="outline">
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const stats = dashboardData?.stats || {};
  const systemHealth = dashboardData?.systemHealth || {};

  return (
    <div className="min-h-screen" style={{background: 'linear-gradient(135deg, #2d1b69 0%, #663399 50%, #11101d 100%)'}}>
      {/* Top Navigation Bar */}
      <div className="bg-gray-900/90 backdrop-blur-sm border-b border-gray-800 px-4 md:px-8 py-4 rounded-t-3xl mx-2 md:mx-8 mt-2 md:mt-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 md:space-x-8">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-purple-600 flex items-center justify-center">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-white text-sm md:text-xl font-bold tracking-wider">CHURPAY ADMIN</h1>
            </div>
            <div className="flex items-center space-x-2 md:space-x-6 text-xs md:text-sm text-gray-400">
              <span className="hidden md:block border-r border-gray-600 pr-6">Welcome, {admin.firstName} {admin.lastName}</span>
              <div className="px-2 md:px-3 py-1 bg-purple-600 text-white text-xs rounded font-medium">ADMIN ACCESS</div>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <Button variant="outline" size="sm" className="border-gray-600 text-gray-300 hover:bg-gray-800/50">
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </Button>
            <Button onClick={handleSignOut} variant="outline" size="sm" className="border-gray-600 text-gray-300 hover:bg-gray-800/50">
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </div>

      <div className="flex flex-col md:flex-row mx-2 md:mx-8 bg-gray-900/70 backdrop-blur-sm rounded-b-3xl min-h-screen">
        <div className="flex-1 p-6">
        {/* System Health Status */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <Card className="bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-6 w-6 text-green-600" />
                    <h3 className="text-lg font-semibold text-gray-900">System Status: Operational</h3>
                  </div>
                  <div className="text-sm text-gray-600">
                    Code Protection: {systemHealth.codeProtectionActive ? 'Active' : 'Inactive'} • 
                    Fee Structure: {systemHealth.feeStructureValid ? 'Valid' : 'Compromised'}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium text-gray-900">
                    {systemHealth.platformFees?.percentage}% + R{systemHealth.platformFees?.fixed}
                  </div>
                  <div className="text-xs text-gray-500">Platform Fees</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Churches</p>
                    <p className="text-3xl font-bold text-gray-900">{stats.totalChurches || 0}</p>
                  </div>
                  <Building2 className="h-8 w-8 text-blue-600" />
                </div>
                <div className="mt-2 flex items-center text-sm">
                  <span className="text-green-600">{stats.activeChurches || 0} active</span>
                  <span className="text-gray-500 ml-2">• {stats.pendingChurches || 0} pending</span>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Members</p>
                    <p className="text-3xl font-bold text-gray-900">{stats.totalMembers || 0}</p>
                  </div>
                  <UserCheck className="h-8 w-8 text-green-600" />
                </div>
                <div className="mt-2 flex items-center text-sm text-gray-500">
                  Across all churches
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                    <p className="text-3xl font-bold text-gray-900">R{(stats.totalRevenue || 0).toLocaleString()}</p>
                  </div>
                  <DollarSign className="h-8 w-8 text-yellow-600" />
                </div>
                <div className="mt-2 flex items-center text-sm text-gray-500">
                  Platform earnings
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Pending Payouts</p>
                    <p className="text-3xl font-bold text-gray-900">{stats.pendingPayouts || 0}</p>
                  </div>
                  <Clock className="h-8 w-8 text-orange-600" />
                </div>
                <div className="mt-2 flex items-center text-sm text-gray-500">
                  Require review
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mb-8"
        >
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Button
                  variant="outline"
                  className="h-20 flex-col space-y-2"
                  onClick={() => navigate('/super-admin')}
                >
                  <BarChart3 className="h-6 w-6" />
                  <span>Super Admin Panel</span>
                </Button>
                
                <Button
                  variant="outline"
                  className="h-20 flex-col space-y-2"
                  onClick={() => navigate('/admin/churches')}
                >
                  <Building2 className="h-6 w-6" />
                  <span>Manage Churches</span>
                </Button>
                
                <Button
                  variant="outline"
                  className="h-20 flex-col space-y-2"
                  onClick={() => navigate('/admin/payouts')}
                >
                  <DollarSign className="h-6 w-6" />
                  <span>Review Payouts</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Admin Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Admin Profile</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Account Information</h4>
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="text-gray-600">Name:</span>
                      <span className="ml-2 font-medium">{admin.firstName} {admin.lastName}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Email:</span>
                      <span className="ml-2 font-medium">{admin.email}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Role:</span>
                      <span className="ml-2 font-medium capitalize">{admin.role}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Last Login:</span>
                      <span className="ml-2 font-medium">
                        {admin.lastLoginAt ? new Date(admin.lastLoginAt).toLocaleString() : 'Never'}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Security Status</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span>Account Active</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span>Two-Factor Ready</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span>Secure Session</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
        </div>
      </div>
    </div>
  );
}