import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useSuperAdminAuth, useSuperAdminLogout } from '@/hooks/useSuperAdminAuth';
import { useLocation } from 'wouter';
import { useToast } from '@/hooks/use-toast';
import { 
  Crown, 
  Shield, 
  Users, 
  Church, 
  DollarSign, 
  Activity,
  Settings,
  LogOut,
  TrendingUp,
  AlertTriangle,
  Eye
} from 'lucide-react';

export default function SuperAdminDashboard() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const { superAdmin, isLoading, isAuthenticated } = useSuperAdminAuth();
  const logoutMutation = useSuperAdminLogout();

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

  const handleLogout = () => {
    logoutMutation.mutate(undefined, {
      onSuccess: () => {
        toast({
          title: "Signed Out",
          description: "You have been successfully signed out.",
        });
        navigate('/super-admin/signin');
      }
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-purple-800 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-yellow-400 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!isAuthenticated || !superAdmin) {
    return null; // Will redirect via useEffect
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-purple-800">
      {/* Header */}
      <motion.header 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/10 backdrop-blur-md border-b border-white/20"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Crown className="h-8 w-8 text-yellow-400" />
                <h1 className="text-2xl font-bold text-white">ChurPay Super Admin</h1>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-white font-medium">
                  {superAdmin.firstName} {superAdmin.lastName}
                </p>
                <p className="text-yellow-400 text-sm">{superAdmin.email}</p>
              </div>
              <Button
                onClick={handleLogout}
                variant="outline"
                size="sm"
                className="border-white/20 text-white hover:bg-white/10"
                disabled={logoutMutation.isPending}
              >
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <h2 className="text-3xl font-bold text-white mb-2">Platform Overview</h2>
          <p className="text-purple-100">
            Complete oversight and management of the ChurPay platform
          </p>
        </motion.div>

        {/* Stats Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
        >
          <Card className="bg-white/10 backdrop-blur-md border-white/20 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-sm font-medium">Total Churches</p>
                  <p className="text-3xl font-bold">1,247</p>
                </div>
                <Church className="h-8 w-8 text-yellow-400" />
              </div>
              <div className="flex items-center mt-2">
                <TrendingUp className="h-4 w-4 text-green-400 mr-1" />
                <span className="text-green-400 text-sm">+12% this month</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/10 backdrop-blur-md border-white/20 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-sm font-medium">Active Members</p>
                  <p className="text-3xl font-bold">45,892</p>
                </div>
                <Users className="h-8 w-8 text-yellow-400" />
              </div>
              <div className="flex items-center mt-2">
                <TrendingUp className="h-4 w-4 text-green-400 mr-1" />
                <span className="text-green-400 text-sm">+8% this month</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/10 backdrop-blur-md border-white/20 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-sm font-medium">Monthly Revenue</p>
                  <p className="text-3xl font-bold">R2.4M</p>
                </div>
                <DollarSign className="h-8 w-8 text-yellow-400" />
              </div>
              <div className="flex items-center mt-2">
                <TrendingUp className="h-4 w-4 text-green-400 mr-1" />
                <span className="text-green-400 text-sm">+15% this month</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/10 backdrop-blur-md border-white/20 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-sm font-medium">System Health</p>
                  <p className="text-3xl font-bold">99.9%</p>
                </div>
                <Activity className="h-8 w-8 text-yellow-400" />
              </div>
              <div className="flex items-center mt-2">
                <Shield className="h-4 w-4 text-green-400 mr-1" />
                <span className="text-green-400 text-sm">All systems operational</span>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Action Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8"
        >
          <Card className="bg-white/10 backdrop-blur-md border-white/20 hover:bg-white/15 transition-colors cursor-pointer group">
            <CardHeader>
              <CardTitle className="flex items-center text-white">
                <Church className="h-5 w-5 mr-2 text-yellow-400" />
                Church Management
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-purple-100 mb-4">
                Manage church registrations, approvals, and oversight
              </p>
              <Button className="w-full bg-yellow-400 hover:bg-yellow-500 text-purple-900 font-semibold">
                <Eye className="h-4 w-4 mr-2" />
                View Churches
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-white/10 backdrop-blur-md border-white/20 hover:bg-white/15 transition-colors cursor-pointer group">
            <CardHeader>
              <CardTitle className="flex items-center text-white">
                <DollarSign className="h-5 w-5 mr-2 text-yellow-400" />
                Financial Operations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-purple-100 mb-4">
                Monitor transactions, payouts, and revenue sharing
              </p>
              <Button className="w-full bg-yellow-400 hover:bg-yellow-500 text-purple-900 font-semibold">
                <Eye className="h-4 w-4 mr-2" />
                View Finances
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-white/10 backdrop-blur-md border-white/20 hover:bg-white/15 transition-colors cursor-pointer group">
            <CardHeader>
              <CardTitle className="flex items-center text-white">
                <Shield className="h-5 w-5 mr-2 text-yellow-400" />
                Security & Compliance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-purple-100 mb-4">
                System security, audit logs, and compliance monitoring
              </p>
              <Button className="w-full bg-yellow-400 hover:bg-yellow-500 text-purple-900 font-semibold">
                <Eye className="h-4 w-4 mr-2" />
                View Security
              </Button>
            </CardContent>
          </Card>
        </motion.div>

        {/* Recent Alerts */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="bg-white/10 backdrop-blur-md border-white/20">
            <CardHeader>
              <CardTitle className="flex items-center text-white">
                <AlertTriangle className="h-5 w-5 mr-2 text-yellow-400" />
                Recent System Alerts
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-green-400 rounded-full mr-3"></div>
                    <div>
                      <p className="text-white font-medium">System Health Check Passed</p>
                      <p className="text-green-400 text-sm">All services operating normally</p>
                    </div>
                  </div>
                  <span className="text-green-400 text-sm">2 min ago</span>
                </div>

                <div className="flex items-center justify-between p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-blue-400 rounded-full mr-3"></div>
                    <div>
                      <p className="text-white font-medium">New Church Registration</p>
                      <p className="text-blue-400 text-sm">Grace Community Church pending approval</p>
                    </div>
                  </div>
                  <span className="text-blue-400 text-sm">1 hour ago</span>
                </div>

                <div className="flex items-center justify-between p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-yellow-400 rounded-full mr-3"></div>
                    <div>
                      <p className="text-white font-medium">High Transaction Volume</p>
                      <p className="text-yellow-400 text-sm">Processing 15% above average</p>
                    </div>
                  </div>
                  <span className="text-yellow-400 text-sm">3 hours ago</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </main>
    </div>
  );
}