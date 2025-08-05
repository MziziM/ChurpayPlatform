import { useSuperAdminAuth } from "@/hooks/useSuperAdminAuth";
import { SuperAdminPlatformDashboard } from "@/components/SuperAdminPlatformDashboard";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from '@/components/ui/card';
import { LogOut, Shield, Users, Building2, DollarSign, BarChart3, CheckCircle, Crown, TrendingUp } from "lucide-react";
import { useLocation } from 'wouter';
import { useToast } from '@/hooks/use-toast';
import { useEffect } from 'react';

export default function SuperAdminDashboard() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const { superAdmin, isLoading, isAuthenticated } = useSuperAdminAuth();

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
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Good afternoon, {superAdmin?.firstName || 'Super Admin'}</h1>
          <div className="text-gray-300 flex items-center">
            Here's your platform overview and system activity
            <div className="w-2 h-2 bg-green-400 rounded-full ml-2"></div>
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
              <Shield className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Admin Panel</h3>
            <p className="text-sm opacity-90 mb-4">Manage platform operations</p>
            <button className="bg-white/20 hover:bg-white/30 px-6 py-2 rounded-lg text-sm font-medium transition-colors">
              Open Panel
            </button>
          </div>

          {/* My Wallet Card */}
          <div className="bg-gray-800/60 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-6 text-white text-center">
            <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <BarChart3 className="w-6 h-6 text-blue-400" />
            </div>
            <h3 className="text-lg font-semibold mb-2">System Stats</h3>
            <p className="text-xl font-bold text-blue-400">99.9%</p>
            <p className="text-xs text-gray-400">System uptime</p>
          </div>

          {/* Tithe Card */}
          <div className="bg-gray-800/60 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-6 text-white text-center">
            <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Building2 className="w-6 h-6 text-green-400" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Churches</h3>
            <p className="text-xl font-bold text-green-400">247</p>
            <p className="text-xs text-gray-400">Active churches</p>
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
            <p className="text-sm opacity-90 mb-6">Platform activity summary</p>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-green-400 rounded-full mr-3"></div>
                  <span className="text-sm">Total Revenue</span>
                </div>
                <span className="font-semibold">R 2,400,000</span>
              </div>
              
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-purple-400 rounded-full mr-3"></div>
                  <span className="text-sm">Transactions</span>
                </div>
                <span className="font-semibold">R 180,000</span>
              </div>
              
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-orange-400 rounded-full mr-3"></div>
                  <span className="text-sm">Platform Fees</span>
                </div>
                <span className="font-semibold">R 60,000</span>
              </div>
            </div>
          </div>

          {/* Wallet Balance Card */}
          <div className="bg-gradient-to-r from-purple-600 to-purple-700 rounded-2xl p-6 text-white">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Platform Overview</h3>
              <button className="text-sm opacity-75 hover:opacity-100">Manage →</button>
            </div>
            <p className="text-sm opacity-90 mb-6">Your administrative control</p>
            
            <div className="text-center">
              <p className="text-4xl font-bold mb-2">247</p>
              <p className="text-sm opacity-75 mb-4">Active churches</p>
              
              <div className="flex items-center justify-center text-sm">
                <div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
                <span>Active & Secured</span>
              </div>
              
              <button className="mt-4 bg-white/20 hover:bg-white/30 px-6 py-2 rounded-lg text-sm font-medium transition-colors w-full">
                + Manage Platform
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}