import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { Heart, Church, Users, Eye, EyeOff, ArrowLeft, Shield } from "lucide-react";
import churpayLogoPath from "@assets/Churpay Logo (1600 x 900 px)_1754295367415.png";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useLocation } from "wouter";

// Form schemas
const memberSignInSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  rememberMe: z.boolean().default(false),
});

const churchSignInSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  rememberMe: z.boolean().default(false),
});

type MemberSignInData = z.infer<typeof memberSignInSchema>;
type ChurchSignInData = z.infer<typeof churchSignInSchema>;

export default function SignIn() {
  const [currentTab, setCurrentTab] = useState("member");
  const [showPassword, setShowPassword] = useState(false);
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  // Member form
  const memberForm = useForm<MemberSignInData>({
    resolver: zodResolver(memberSignInSchema),
    defaultValues: {
      email: "",
      password: "",
      rememberMe: false,
    },
  });

  // Church form
  const churchForm = useForm<ChurchSignInData>({
    resolver: zodResolver(churchSignInSchema),
    defaultValues: {
      email: "",
      password: "",
      rememberMe: false,
    },
  });

  // Member sign-in mutation
  const memberSignInMutation = useMutation({
    mutationFn: async (data: MemberSignInData) => {
      const response = await apiRequest('/api/auth/member/signin', {
        method: 'POST',
        body: data,
      });
      
      if (!response.ok) {
        const error = await response.text();
        throw new Error(error || 'Sign in failed');
      }
      
      return response.json();
    },
    onSuccess: (data) => {
      if (data.user?.role === 'member') {
        toast({
          title: "Welcome back!",
          description: "Successfully signed in to your member account.",
        });
        setLocation('/professional-member-dashboard');
      }
    },
    onError: (error: Error) => {
      toast({
        title: "Sign in failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Church sign-in mutation
  const churchSignInMutation = useMutation({
    mutationFn: async (data: ChurchSignInData) => {
      const response = await apiRequest('/api/auth/church/signin', {
        method: 'POST',
        body: data,
      });
      
      if (!response.ok) {
        const error = await response.text();
        throw new Error(error || 'Sign in failed');
      }
      
      return response.json();
    },
    onSuccess: (data) => {
      if (data.user?.role === 'church_admin' || data.user?.role === 'church_staff') {
        toast({
          title: "Welcome back!",
          description: "Successfully signed in to your church account.",
        });
        setLocation('/professional-church-dashboard');
      }
    },
    onError: (error: Error) => {
      toast({
        title: "Sign in failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleMemberSignIn = (data: MemberSignInData) => {
    memberSignInMutation.mutate(data);
  };

  const handleChurchSignIn = (data: ChurchSignInData) => {
    churchSignInMutation.mutate(data);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 dark">
      {/* Professional Dashboard-Style Background */}
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-purple-900/20 via-slate-900 to-slate-900"></div>
      <div className="fixed inset-0 bg-grid-white/[0.02] bg-[size:60px_60px]"></div>
      
      {/* Header matching dashboard style */}
      <header className="relative z-10 bg-slate-900/80 backdrop-blur-xl border-b border-slate-700/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <img 
                  src={churpayLogoPath} 
                  alt="ChurPay Logo" 
                  className="h-10 w-auto object-contain brightness-0 invert"
                />
              </div>
            </div>
            <Button 
              variant="ghost" 
              onClick={() => setLocation('/')}
              className="text-slate-400 hover:text-white hover:bg-slate-800/50 border border-slate-700/50"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content - Dashboard Style */}
      <div className="relative z-10 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-lg">
          {/* Professional Welcome Section */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center mb-6">
              <img 
                src={churpayLogoPath} 
                alt="ChurPay Logo" 
                className="h-16 w-auto object-contain brightness-0 invert"
              />
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">Welcome Back</h1>
            <p className="text-slate-400">Access your ChurPay dashboard</p>
            <div className="mt-4 flex items-center justify-center space-x-2 text-sm text-slate-500">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span>Secure Connection</span>
            </div>
          </div>

          <Card className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 shadow-2xl">
            <CardHeader className="pb-6">
              <CardTitle className="text-center text-xl font-semibold text-white">Sign In</CardTitle>
              <p className="text-center text-slate-400 text-sm">Choose your account type</p>
            </CardHeader>
            <CardContent className="pb-6">
              <Tabs value={currentTab} onValueChange={setCurrentTab} className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-6 bg-slate-900/50 border border-slate-600/50 rounded-xl p-1">
                  <TabsTrigger 
                    value="member" 
                    className="flex items-center space-x-2 data-[state=active]:bg-slate-700 data-[state=active]:text-white text-slate-400 rounded-lg py-2.5 transition-all duration-200"
                  >
                    <Users className="h-4 w-4" />
                    <span className="font-medium">Member</span>
                  </TabsTrigger>
                  <TabsTrigger 
                    value="church" 
                    className="flex items-center space-x-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-yellow-500 data-[state=active]:text-white text-slate-400 rounded-lg py-2.5 transition-all duration-200"
                  >
                    <Church className="h-4 w-4" />
                    <span className="font-medium">Church</span>
                  </TabsTrigger>
                </TabsList>

                {/* Member Sign In */}
                <TabsContent value="member">
                  <div className="mb-6 p-4 bg-slate-900/30 rounded-xl border border-slate-600/30">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-slate-700 rounded-xl flex items-center justify-center">
                        <Users className="h-6 w-6 text-slate-300" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-white">Member Portal</h3>
                        <p className="text-slate-400 text-sm">Access your giving dashboard and financial tools</p>
                        <div className="flex items-center mt-2 space-x-4 text-xs text-slate-500">
                          <span>• Donations</span>
                          <span>• Wallet</span>
                          <span>• Analytics</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <Form {...memberForm}>
                    <form onSubmit={memberForm.handleSubmit(handleMemberSignIn)} className="space-y-4">
                      <FormField
                        control={memberForm.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-slate-200 text-sm font-medium">Email Address</FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                type="email"
                                placeholder="member@example.com"
                                className="h-11 bg-slate-900/50 border-slate-600/50 text-white placeholder:text-slate-500 rounded-lg focus:bg-slate-900/80 focus:border-purple-500/50 transition-all"
                              />
                            </FormControl>
                            <FormMessage className="text-red-400 text-sm" />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={memberForm.control}
                        name="password"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-slate-200 text-sm font-medium">Password</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Input
                                  {...field}
                                  type={showPassword ? "text" : "password"}
                                  placeholder="Enter your password"
                                  className="h-11 bg-slate-900/50 border-slate-600/50 text-white placeholder:text-slate-500 rounded-lg focus:bg-slate-900/80 focus:border-purple-500/50 transition-all pr-10"
                                />
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  className="absolute right-0 top-0 h-full px-3 hover:bg-slate-800/50"
                                  onClick={() => setShowPassword(!showPassword)}
                                >
                                  {showPassword ? (
                                    <EyeOff className="h-4 w-4 text-slate-400" />
                                  ) : (
                                    <Eye className="h-4 w-4 text-slate-400" />
                                  )}
                                </Button>
                              </div>
                            </FormControl>
                            <FormMessage className="text-red-400 text-sm" />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={memberForm.control}
                        name="rememberMe"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                                className="data-[state=checked]:bg-purple-600 data-[state=checked]:border-purple-600 border-slate-600"
                              />
                            </FormControl>
                            <FormLabel className="text-sm text-slate-300 font-normal">
                              Remember me for 30 days
                            </FormLabel>
                          </FormItem>
                        )}
                      />

                      <Button
                        type="submit"
                        disabled={memberSignInMutation.isPending}
                        className="w-full h-11 bg-slate-700 hover:bg-slate-600 text-white font-medium rounded-lg transition-all"
                      >
                        {memberSignInMutation.isPending ? (
                          <div className="flex items-center space-x-2">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                            <span>Signing In...</span>
                          </div>
                        ) : (
                          <div className="flex items-center space-x-2">
                            <Users className="h-4 w-4" />
                            <span>Sign In to Member Portal</span>
                          </div>
                        )}
                      </Button>
                    </form>
                  </Form>
                </TabsContent>

                {/* Church Sign In */}
                <TabsContent value="church">
                  <div className="mb-6 p-4 bg-slate-900/30 rounded-xl border border-slate-600/30">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-gradient-to-r from-purple-600 to-yellow-500 rounded-xl flex items-center justify-center">
                        <Church className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-white">Church Administration</h3>
                        <p className="text-slate-400 text-sm">Manage your congregation and financial operations</p>
                        <div className="flex items-center mt-2 space-x-4 text-xs text-slate-500">
                          <span>• Members</span>
                          <span>• Projects</span>
                          <span>• Reports</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <Form {...churchForm}>
                    <form onSubmit={churchForm.handleSubmit(handleChurchSignIn)} className="space-y-4">
                      <FormField
                        control={churchForm.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-slate-200 text-sm font-medium">Church Admin Email</FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                type="email"
                                placeholder="admin@yourchurch.org"
                                className="h-11 bg-slate-900/50 border-slate-600/50 text-white placeholder:text-slate-500 rounded-lg focus:bg-slate-900/80 focus:border-purple-500/50 transition-all"
                              />
                            </FormControl>
                            <FormMessage className="text-red-400 text-sm" />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={churchForm.control}
                        name="password"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-slate-200 text-sm font-medium">Password</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Input
                                  {...field}
                                  type={showPassword ? "text" : "password"}
                                  placeholder="Enter your password"
                                  className="h-11 bg-slate-900/50 border-slate-600/50 text-white placeholder:text-slate-500 rounded-lg focus:bg-slate-900/80 focus:border-purple-500/50 transition-all pr-10"
                                />
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  className="absolute right-0 top-0 h-full px-3 hover:bg-slate-800/50"
                                  onClick={() => setShowPassword(!showPassword)}
                                >
                                  {showPassword ? (
                                    <EyeOff className="h-4 w-4 text-slate-400" />
                                  ) : (
                                    <Eye className="h-4 w-4 text-slate-400" />
                                  )}
                                </Button>
                              </div>
                            </FormControl>
                            <FormMessage className="text-red-400 text-sm" />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={churchForm.control}
                        name="rememberMe"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                                className="data-[state=checked]:bg-purple-600 data-[state=checked]:border-purple-600 border-slate-600"
                              />
                            </FormControl>
                            <FormLabel className="text-sm text-slate-300 font-normal">
                              Remember me for 30 days
                            </FormLabel>
                          </FormItem>
                        )}
                      />

                      <Button
                        type="submit"
                        disabled={churchSignInMutation.isPending}
                        className="w-full h-11 bg-gradient-to-r from-purple-600 to-yellow-500 hover:from-purple-700 hover:to-yellow-600 text-white font-medium rounded-lg transition-all"
                      >
                        {churchSignInMutation.isPending ? (
                          <div className="flex items-center space-x-2">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                            <span>Signing In...</span>
                          </div>
                        ) : (
                          <div className="flex items-center space-x-2">
                            <Church className="h-4 w-4" />
                            <span>Sign In to Church Dashboard</span>
                          </div>
                        )}
                      </Button>
                    </form>
                  </Form>
                </TabsContent>
              </Tabs>

              {/* Footer Links */}
              <div className="mt-6 space-y-4 border-t border-slate-700/50 pt-6">
                <div className="text-center">
                  <Button variant="link" className="text-sm text-slate-400 hover:text-white">
                    Forgot your password?
                  </Button>
                </div>
                <div className="text-center">
                  <p className="text-sm text-slate-500 mb-3">
                    Don't have an account?
                  </p>
                  <div className="flex flex-col space-y-2">
                    <Button 
                      variant="outline" 
                      className="w-full border-slate-600/50 text-slate-300 hover:bg-slate-800/50 rounded-lg h-10"
                      onClick={() => setLocation('/member-registration')}
                    >
                      <Users className="h-4 w-4 mr-2" />
                      Register as Member
                    </Button>
                    <Button 
                      variant="outline" 
                      className="w-full border-slate-600/50 text-slate-300 hover:bg-slate-800/50 rounded-lg h-10"
                      onClick={() => setLocation('/church-registration')}
                    >
                      <Church className="h-4 w-4 mr-2" />
                      Register Your Church
                    </Button>
                  </div>
                </div>
              </div>

              {/* Security Badge */}
              <div className="mt-6 flex items-center justify-center space-x-2 text-xs text-slate-500">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span>SSL Encrypted</span>
                <span>•</span>
                <span>Bank-Grade Security</span>
              </div>
            </CardContent>
          </Card>

          {/* Security Notice */}
          <div className="mt-6 text-center space-y-2">
            <div className="flex items-center justify-center space-x-2 text-xs text-slate-500">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span>Protected by enterprise-grade security</span>
            </div>
            <p className="text-xs text-slate-600">
              By signing in, you agree to our Terms of Service and Privacy Policy
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}