import { useSuperAdminAuth } from "@/hooks/useSuperAdminAuth";
import { SuperAdminPlatformDashboard } from "@/components/SuperAdminPlatformDashboard";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from '@/components/ui/card';
import { LogOut, Shield, Users, Building2, DollarSign, BarChart3, CheckCircle, Crown } from "lucide-react";
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
          <p className="text-gray-300 flex items-center">
            Here's your platform overview and system activity
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

      {/* Show simplified dashboard instead of complex platform dashboard */}
      <SuperAdminPlatformDashboard />
    </div>
  );
}