import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useMutation } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { useLocation } from 'wouter';
import { useSuperAdminAuth } from '@/hooks/useSuperAdminAuth';
import { z } from 'zod';
import { Eye, EyeOff, Shield, Lock, Mail, LogIn, ArrowRight, Crown } from 'lucide-react';

const superAdminSignInSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
  twoFactorCode: z.string().optional(),
  rememberMe: z.boolean().optional()
});

type SuperAdminSignInForm = z.infer<typeof superAdminSignInSchema>;

export default function SuperAdminSignIn() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [showPassword, setShowPassword] = useState(false);
  const [requiresTwoFactor, setRequiresTwoFactor] = useState(false);
  const { signIn } = useSuperAdminAuth();

  const form = useForm<SuperAdminSignInForm>({
    resolver: zodResolver(superAdminSignInSchema),
    defaultValues: {
      email: '',
      password: '',
      twoFactorCode: '',
      rememberMe: false
    }
  });

  const signInMutation = useMutation({
    mutationFn: async (data: SuperAdminSignInForm) => {
      const response = await apiRequest('POST', '/api/super-admin/signin', {
        email: data.email,
        password: data.password,
        twoFactorCode: data.twoFactorCode,
        rememberMe: data.rememberMe
      });
      return response.json();
    },
    onSuccess: (data) => {
      if (data.requiresTwoFactor) {
        setRequiresTwoFactor(true);
        toast({
          title: "2FA Required",
          description: "Please enter your 6-digit authentication code from Google Authenticator.",
        });
      } else {
        // Store super admin auth data for session management
        const superAdminAuth = {
          superAdmin: data.superAdmin,
          token: data.token || 'authenticated', // Session-based auth
          timestamp: Date.now()
        };
        localStorage.setItem('superAdminAuth', JSON.stringify(superAdminAuth));
        
        toast({
          title: "Welcome Back",
          description: "Successfully signed in to ChurPay Super Admin Dashboard.",
        });
        navigate('/super-admin');
      }
    },
    onError: (error: any) => {
      toast({
        title: "Sign In Failed", 
        description: error.message || "Invalid credentials or 2FA code. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: SuperAdminSignInForm) => {
    signInMutation.mutate(data);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-purple-100 to-purple-200 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-purple-600 to-purple-700 rounded-xl mb-4">
            <Crown className="h-8 w-8 text-yellow-400" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">ChurPay Owner</h1>
          <p className="text-gray-600">Sign in to your super admin account</p>
        </div>

        <Card className="shadow-xl border-0 bg-white/95 backdrop-blur-sm">
          <CardHeader className="text-center pb-4">
            <CardTitle className="text-xl text-gray-800 flex items-center justify-center gap-2">
              <LogIn className="h-5 w-5 text-purple-600" />
              Super Admin Sign In
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                {/* Email */}
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-gray-500" />
                        Email Address
                      </FormLabel>
                      <FormControl>
                        <Input {...field} type="email" placeholder="owner@churpay.com" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Password */}
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <Lock className="h-4 w-4 text-gray-500" />
                        Password
                      </FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            {...field}
                            type={showPassword ? "text" : "password"}
                            placeholder="Enter your password"
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                            onClick={() => setShowPassword(!showPassword)}
                          >
                            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </Button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* 2FA Code (conditional) */}
                {requiresTwoFactor && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    transition={{ duration: 0.3 }}
                  >
                    <FormField
                      control={form.control}
                      name="twoFactorCode"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center gap-2">
                            <Shield className="h-4 w-4 text-green-500" />
                            Authentication Code
                          </FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              placeholder="Enter 6-digit code"
                              maxLength={6}
                              className="text-center text-lg tracking-widest"
                            />
                          </FormControl>
                          <FormMessage />
                          <p className="text-xs text-gray-500 mt-1">
                            Enter the 6-digit code from your Google Authenticator app
                          </p>
                        </FormItem>
                      )}
                    />
                  </motion.div>
                )}

                {/* Submit Button */}
                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800"
                  disabled={signInMutation.isPending}
                >
                  {signInMutation.isPending ? (
                    <div className="flex items-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                      Signing In...
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <LogIn className="h-4 w-4" />
                      Sign In
                      <ArrowRight className="h-4 w-4 ml-auto" />
                    </div>
                  )}
                </Button>
              </form>
            </Form>

            {/* Sign Up Link */}
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Need a super admin account?{' '}
                <button
                  type="button"
                  className="text-purple-600 hover:underline font-medium"
                  onClick={() => navigate('/super-admin/signup')}
                >
                  Create Account
                </button>
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Quick Access Cards */}
        <div className="mt-8 grid grid-cols-1 gap-4">
          <Card className="p-4 bg-white/80 hover:bg-white/90 transition-colors cursor-pointer" onClick={() => navigate('/admin/signin')}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Shield className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="font-medium text-gray-900">Regular Admin</p>
                  <p className="text-xs text-gray-500">Church management access</p>
                </div>
              </div>
              <ArrowRight className="h-4 w-4 text-gray-400" />
            </div>
          </Card>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-xs text-gray-500">
            Super Admin access provides complete platform control and oversight
          </p>
        </div>
      </motion.div>
    </div>
  );
}