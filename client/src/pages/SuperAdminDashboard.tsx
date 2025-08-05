import { useSuperAdminAuth } from "@/hooks/useSuperAdminAuth";
import { SuperAdminPlatformDashboard } from "@/components/SuperAdminPlatformDashboard";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
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
    <div className="relative">
      {/* Logout Button - Fixed position */}
      <div className="fixed top-4 right-4 z-50">
        <Button onClick={handleSignOut} variant="outline" size="sm">
          <LogOut className="w-4 h-4 mr-2" />
          Sign Out
        </Button>
      </div>
      
      {/* Professional Dashboard */}
      <SuperAdminPlatformDashboard />
    </div>
  );
}