import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Church, Users, Shield, Settings, BarChart3, CreditCard } from "lucide-react";

export default function Home() {
  const { user, isLoading } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!isLoading && user) {
      // Redirect based on user role
      switch (user.role) {
        case 'superadmin':
          setLocation('/admin');
          break;
        case 'church_admin':
        case 'church_staff':
          setLocation('/church');
          break;
        case 'member':
          setLocation('/member');
          break;
        case 'public':
        default:
          // Stay on home page to show registration options
          break;
      }
    }
  }, [user, isLoading, setLocation]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-churpay-purple"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 py-16">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Welcome to ChurPay</h1>
            <p className="text-xl text-gray-600">Something went wrong. Please try signing in again.</p>
            <Button 
              onClick={() => window.location.href = '/api/login'}
              className="mt-6 bg-churpay-gradient text-white"
            >
              Sign In
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Show role selection for public users
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-churpay-gradient flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-lg">C</span>
              </div>
              <span className="text-2xl font-bold">
                <span className="text-gray-900">Chur</span>
                <span className="text-churpay-yellow">Pay</span>
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-gray-600">Welcome, {user.firstName || user.email}</span>
              <Button 
                variant="outline"
                onClick={() => window.location.href = '/api/logout'}
              >
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Welcome to ChurPay</h1>
          <p className="text-xl text-gray-600">Let's get you started. What would you like to do?</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Church Registration */}
          <Card className="card-hover bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
            <CardHeader className="text-center">
              <div className="w-16 h-16 bg-churpay-gradient rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Church className="h-8 w-8 text-white" />
              </div>
              <CardTitle className="text-2xl text-gray-900">Register Your Church</CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <p className="text-gray-600">
                Set up your church on ChurPay to start accepting digital donations, manage members, and track your ministry's growth.
              </p>
              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex items-center space-x-2">
                  <Shield className="h-4 w-4 text-green-500" />
                  <span>Secure payment processing</span>
                </div>
                <div className="flex items-center space-x-2">
                  <BarChart3 className="h-4 w-4 text-blue-500" />
                  <span>Real-time analytics</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Users className="h-4 w-4 text-purple-500" />
                  <span>Member management</span>
                </div>
              </div>
              <Button 
                className="w-full bg-churpay-gradient text-white"
                onClick={() => setLocation('/church-registration')}
              >
                Register Church
              </Button>
            </CardContent>
          </Card>

          {/* Member Registration */}
          <Card className="card-hover bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200">
            <CardHeader className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Users className="h-8 w-8 text-white" />
              </div>
              <CardTitle className="text-2xl text-gray-900">Join as Member</CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <p className="text-gray-600">
                Join your church community and start making secure donations while tracking your giving history and supporting projects.
              </p>
              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex items-center space-x-2">
                  <CreditCard className="h-4 w-4 text-green-500" />
                  <span>Digital wallet</span>
                </div>
                <div className="flex items-center space-x-2">
                  <BarChart3 className="h-4 w-4 text-blue-500" />
                  <span>Donation tracking</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Church className="h-4 w-4 text-purple-500" />
                  <span>Support projects</span>
                </div>
              </div>
              <Button 
                className="w-full bg-gradient-to-br from-yellow-400 to-orange-500 text-white"
                onClick={() => setLocation('/member-registration')}
              >
                Join as Member
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="text-center mt-12">
          <p className="text-gray-500">
            Need help deciding? <a href="#" className="text-churpay-purple hover:underline">Contact our support team</a>
          </p>
        </div>
      </div>
    </div>
  );
}
