import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Church, Users, ArrowRight, Shield, CheckCircle, Heart } from "lucide-react";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'signup' | 'signin' | 'choice';
}

export function AuthModal({ isOpen, onClose, initialMode = 'choice' }: AuthModalProps) {
  const [mode, setMode] = useState<'signup' | 'signin' | 'choice'>(initialMode);

  const handleAuth = () => {
    // Use existing Replit Auth flow - no code changes needed
    window.location.href = '/api/login';
  };

  const renderChoice = () => (
    <div className="space-y-6">
      <div className="text-center">
        <div className="w-16 h-16 bg-churpay-gradient rounded-2xl mx-auto mb-4 flex items-center justify-center">
          <span className="text-white font-bold text-2xl">C</span>
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Welcome to ChurPay</h2>
        <p className="text-gray-600">Choose how you'd like to get started</p>
      </div>

      <div className="grid grid-cols-1 gap-4">
        <Card className="border-purple-200 hover:border-purple-300 transition-colors cursor-pointer" onClick={() => setMode('signup')}>
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-churpay-gradient rounded-xl flex items-center justify-center">
                <Church className="h-6 w-6 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900">Register Your Church</h3>
                <p className="text-sm text-gray-600">Start accepting digital donations</p>
              </div>
              <ArrowRight className="h-4 w-4 text-gray-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-yellow-200 hover:border-yellow-300 transition-colors cursor-pointer" onClick={() => setMode('signup')}>
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-xl flex items-center justify-center">
                <Users className="h-6 w-6 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900">Join as Member</h3>
                <p className="text-sm text-gray-600">Support your church community</p>
              </div>
              <ArrowRight className="h-4 w-4 text-gray-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="text-center">
        <button 
          onClick={() => setMode('signin')}
          className="text-churpay-purple hover:text-purple-700 text-sm font-medium"
        >
          Already have an account? Sign in
        </button>
      </div>
    </div>
  );

  const renderSignup = () => (
    <div className="space-y-6">
      <div className="text-center">
        <div className="w-16 h-16 bg-churpay-gradient rounded-2xl mx-auto mb-4 flex items-center justify-center">
          <Heart className="h-8 w-8 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Create Your Account</h2>
        <p className="text-gray-600">Join the ChurPay community and start making a difference</p>
      </div>

      <div className="space-y-4">
        <div className="bg-gradient-to-r from-purple-50 to-blue-50 p-4 rounded-xl border border-purple-100">
          <div className="flex items-center space-x-3 mb-3">
            <Shield className="h-5 w-5 text-churpay-purple" />
            <span className="font-semibold text-gray-800">Secure Registration</span>
          </div>
          <div className="space-y-2 text-sm text-gray-600">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span>Bank-grade security</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span>Easy setup process</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span>No setup fees</span>
            </div>
          </div>
        </div>

        <Button 
          onClick={handleAuth}
          className="w-full bg-churpay-gradient text-white hover:shadow-lg transition-all duration-300"
          size="lg"
        >
          Continue with Secure Login
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>

        <div className="text-center">
          <button 
            onClick={() => setMode('signin')}
            className="text-churpay-purple hover:text-purple-700 text-sm font-medium"
          >
            Already have an account? Sign in
          </button>
        </div>
      </div>

      <div className="text-center">
        <button 
          onClick={() => setMode('choice')}
          className="text-gray-500 hover:text-gray-700 text-sm"
        >
          ← Back to options
        </button>
      </div>
    </div>
  );

  const renderSignin = () => (
    <div className="space-y-6">
      <div className="text-center">
        <div className="w-16 h-16 bg-churpay-gradient rounded-2xl mx-auto mb-4 flex items-center justify-center">
          <span className="text-white font-bold text-2xl">C</span>
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Welcome Back</h2>
        <p className="text-gray-600">Sign in to your ChurPay account</p>
      </div>

      <div className="space-y-4">
        <div className="bg-gradient-to-r from-green-50 to-blue-50 p-4 rounded-xl border border-green-100">
          <div className="flex items-center space-x-3 mb-2">
            <Shield className="h-5 w-5 text-green-600" />
            <span className="font-semibold text-gray-800">Secure Access</span>
          </div>
          <p className="text-sm text-gray-600">
            Your account is protected with enterprise-grade security
          </p>
        </div>

        <Button 
          onClick={handleAuth}
          className="w-full bg-churpay-gradient text-white hover:shadow-lg transition-all duration-300"
          size="lg"
        >
          Sign In to ChurPay
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>

        <div className="text-center">
          <button 
            onClick={() => setMode('signup')}
            className="text-churpay-purple hover:text-purple-700 text-sm font-medium"
          >
            Don't have an account? Sign up
          </button>
        </div>
      </div>

      <div className="text-center">
        <button 
          onClick={() => setMode('choice')}
          className="text-gray-500 hover:text-gray-700 text-sm"
        >
          ← Back to options
        </button>
      </div>
    </div>
  );

  const getContent = () => {
    switch (mode) {
      case 'signup':
        return renderSignup();
      case 'signin':
        return renderSignin();
      default:
        return renderChoice();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-white">
        <DialogHeader className="sr-only">
          <DialogTitle>
            {mode === 'signin' ? 'Sign In' : mode === 'signup' ? 'Sign Up' : 'Get Started'}
          </DialogTitle>
          <DialogDescription>
            {mode === 'signin' ? 'Sign in to your ChurPay account' : mode === 'signup' ? 'Create your ChurPay account' : 'Choose how to get started with ChurPay'}
          </DialogDescription>
        </DialogHeader>
        {getContent()}
      </DialogContent>
    </Dialog>
  );
}