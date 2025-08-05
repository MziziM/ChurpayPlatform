import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useMutation } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { useLocation } from 'wouter';
import { z } from 'zod';
import { Eye, EyeOff, Shield, UserPlus, Crown } from 'lucide-react';
import { TwoFactorSetup } from '@/components/TwoFactorSetup';

const superAdminSignUpSchema = z.object({
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character'),
  confirmPassword: z.string(),
  ownerCode: z.string().min(1, 'Owner authorization code is required'),
  acceptTerms: z.boolean().refine(val => val === true, 'You must accept the terms and conditions')
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"]
});

type SuperAdminSignUpForm = z.infer<typeof superAdminSignUpSchema>;

export default function SuperAdminSignUp() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [signupData, setSignupData] = useState<any>(null);

  const form = useForm<SuperAdminSignUpForm>({
    resolver: zodResolver(superAdminSignUpSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      confirmPassword: '',
      ownerCode: '',
      acceptTerms: false
    }
  });

  const signUpMutation = useMutation({
    mutationFn: async (data: SuperAdminSignUpForm) => {
      const response = await apiRequest('POST', '/api/super-admin/signup', {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        password: data.password,
        ownerCode: data.ownerCode,
        acceptTerms: data.acceptTerms
      });
      return response.json();
    },
    onSuccess: (data) => {
      console.log('Signup response:', data);
      setSignupData(data);
      toast({
        title: "Account Created",
        description: "Set up Google Authenticator to complete your registration.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Registration Failed",
        description: error.message || "Failed to create super admin account. Please try again.",
        variant: "destructive",
      });
    }
  });

  const verifyTwoFactorMutation = useMutation({
    mutationFn: async (verificationCode: string) => {
      const response = await apiRequest('POST', '/api/super-admin/verify-signup-2fa', {
        email: signupData.admin.email,
        verificationCode
      });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Registration Complete",
        description: "Your super admin account has been created successfully!",
      });
      navigate('/super-admin/signin');
    },
    onError: (error: any) => {
      toast({
        title: "Verification Failed",
        description: error.message || "Invalid verification code. Please try again.",
        variant: "destructive",
      });
    }
  });

  const onSubmit = (data: SuperAdminSignUpForm) => {
    signUpMutation.mutate(data);
  };

  const handleTwoFactorVerification = (code: string) => {
    verifyTwoFactorMutation.mutate(code);
  };

  // Show 2FA setup after successful signup
  if (signupData) {
    return (
      <TwoFactorSetup
        qrCodeUrl={signupData.twoFactorSetup.qrCodeUrl}
        secret={signupData.twoFactorSetup.secret}
        backupCodes={signupData.twoFactorSetup.backupCodes}
        onVerify={handleTwoFactorVerification}
        isLoading={verifyTwoFactorMutation.isPending}
        accountType="Super Admin"
      />
    );
  }

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
          <p className="text-gray-600">Create your super admin account</p>
        </div>

        <Card className="shadow-xl border-0 bg-white/95 backdrop-blur-sm">
          <CardHeader className="text-center pb-4">
            <CardTitle className="text-xl text-gray-800 flex items-center justify-center gap-2">
              <UserPlus className="h-5 w-5 text-purple-600" />
              Super Admin Registration
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                {/* Name Fields */}
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="firstName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>First Name</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="John" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="lastName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Last Name</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Doe" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Email */}
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email Address</FormLabel>
                      <FormControl>
                        <Input {...field} type="email" placeholder="owner@churpay.com" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Owner Code */}
                <FormField
                  control={form.control}
                  name="ownerCode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Owner Authorization Code</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Enter owner code" />
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
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            {...field}
                            type={showPassword ? "text" : "password"}
                            placeholder="Create a strong password"
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

                {/* Confirm Password */}
                <FormField
                  control={form.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Confirm Password</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            {...field}
                            type={showConfirmPassword ? "text" : "password"}
                            placeholder="Confirm your password"
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          >
                            {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </Button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Terms and Conditions */}
                <FormField
                  control={form.control}
                  name="acceptTerms"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel className="text-sm font-normal">
                          I accept the{' '}
                          <button type="button" className="text-purple-600 hover:underline">
                            Terms and Conditions
                          </button>{' '}
                          and{' '}
                          <button type="button" className="text-purple-600 hover:underline">
                            Privacy Policy
                          </button>
                        </FormLabel>
                        <FormMessage />
                      </div>
                    </FormItem>
                  )}
                />

                {/* Submit Button */}
                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800"
                  disabled={signUpMutation.isPending}
                >
                  {signUpMutation.isPending ? (
                    <div className="flex items-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                      Creating Account...
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Crown className="h-4 w-4" />
                      Create Super Admin Account
                    </div>
                  )}
                </Button>
              </form>
            </Form>

            {/* Sign In Link */}
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Already have a super admin account?{' '}
                <button
                  type="button"
                  className="text-purple-600 hover:underline font-medium"
                  onClick={() => navigate('/super-admin/signin')}
                >
                  Sign In
                </button>
              </p>
            </div>
          </CardContent>
        </Card>

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