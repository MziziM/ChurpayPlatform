import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { Heart, Church, Users, Eye, EyeOff, ArrowLeft } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useLocation } from "wouter";

// Sign-in schemas
const memberSignInSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  rememberMe: z.boolean().default(false)
});

const churchSignInSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  rememberMe: z.boolean().default(false)
});

type MemberSignInData = z.infer<typeof memberSignInSchema>;
type ChurchSignInData = z.infer<typeof churchSignInSchema>;

export default function SignIn() {
  const [currentTab, setCurrentTab] = useState("member");
  const [showPassword, setShowPassword] = useState(false);
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  const memberForm = useForm<MemberSignInData>({
    resolver: zodResolver(memberSignInSchema),
    defaultValues: {
      email: "",
      password: "",
      rememberMe: false
    }
  });

  const churchForm = useForm<ChurchSignInData>({
    resolver: zodResolver(churchSignInSchema),
    defaultValues: {
      email: "",
      password: "",
      rememberMe: false
    }
  });

  const memberSignInMutation = useMutation({
    mutationFn: async (data: MemberSignInData) => {
      return await apiRequest('/api/auth/member/signin', 'POST', data);
    },
    onSuccess: (response) => {
      toast({
        title: "Welcome back!",
        description: "Successfully signed in to your member account.",
      });
      
      // Store user data in localStorage for now
      localStorage.setItem('user', JSON.stringify(response.user));
      localStorage.setItem('userRole', 'member');
      
      // Redirect to member dashboard
      setLocation('/member-dashboard');
    },
    onError: (error: any) => {
      toast({
        title: "Sign In Failed",
        description: error.message || "Invalid email or password. Please try again.",
        variant: "destructive",
      });
    }
  });

  const churchSignInMutation = useMutation({
    mutationFn: async (data: ChurchSignInData) => {
      return await apiRequest('/api/auth/church/signin', 'POST', data);
    },
    onSuccess: (response) => {
      toast({
        title: "Welcome back!",
        description: "Successfully signed in to your church account.",
      });
      
      // Store user data in localStorage for now
      localStorage.setItem('user', JSON.stringify(response.user));
      localStorage.setItem('church', JSON.stringify(response.church));
      localStorage.setItem('userRole', response.user.role);
      
      // Redirect to appropriate dashboard based on role
      if (response.user.role === 'church_admin') {
        setLocation('/church-dashboard');
      } else {
        setLocation('/church-staff-dashboard');
      }
    },
    onError: (error: any) => {
      toast({
        title: "Sign In Failed",
        description: error.message || "Invalid email or password. Please try again.",
        variant: "destructive",
      });
    }
  });

  const handleMemberSignIn = (data: MemberSignInData) => {
    memberSignInMutation.mutate(data);
  };

  const handleChurchSignIn = (data: ChurchSignInData) => {
    churchSignInMutation.mutate(data);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
      {/* Professional Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-yellow-400/10 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-r from-purple-500/5 to-yellow-400/5 rounded-full blur-3xl"></div>
      </div>

      {/* Professional Header */}
      <header className="relative z-10 bg-black/20 backdrop-blur-xl border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-yellow-500 rounded-2xl flex items-center justify-center shadow-2xl ring-2 ring-white/20">
                <span className="text-white font-bold text-xl">C</span>
              </div>
              <div>
                <span className="text-3xl font-bold text-white">Chur</span>
                <span className="text-3xl font-bold text-yellow-400">Pay</span>
                <p className="text-sm text-gray-300 font-medium">Financial Platform</p>
              </div>
            </div>
            <Button 
              variant="ghost" 
              onClick={() => setLocation('/')}
              className="flex items-center space-x-2 text-white hover:bg-white/10 border border-white/20 backdrop-blur-sm"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Home</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="relative z-10 flex items-center justify-center py-16 px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-lg">
          {/* Professional Welcome Section */}
          <div className="text-center mb-10">
            <div className="mb-6">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-purple-600 to-yellow-500 rounded-3xl shadow-2xl ring-4 ring-white/20 mb-6">
                <Users className="h-10 w-10 text-white" />
              </div>
            </div>
            <h1 className="text-4xl font-bold text-white mb-3 tracking-tight">Welcome Back</h1>
            <p className="text-xl text-gray-300 font-medium">Access your secure ChurPay account</p>
            <div className="mt-4 flex items-center justify-center space-x-2 text-sm text-gray-400">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span>Secure SSL Connection</span>
            </div>
          </div>

          <Card className="border-0 shadow-2xl bg-white/10 backdrop-blur-xl ring-1 ring-white/20">
            <CardHeader className="pb-6 pt-8">
              <CardTitle className="text-center text-2xl font-bold text-white">Account Access</CardTitle>
              <p className="text-center text-gray-300 mt-2">Choose your account type to continue</p>
            </CardHeader>
            <CardContent className="pb-8">
              <Tabs value={currentTab} onValueChange={setCurrentTab} className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-8 bg-black/20 border border-white/20 rounded-2xl p-1">
                  <TabsTrigger 
                    value="member" 
                    className="flex items-center space-x-2 data-[state=active]:bg-white/20 data-[state=active]:text-white text-gray-300 rounded-xl py-3 transition-all duration-200 data-[state=active]:shadow-lg"
                  >
                    <Users className="h-5 w-5" />
                    <span className="font-semibold">Member Portal</span>
                  </TabsTrigger>
                  <TabsTrigger 
                    value="church" 
                    className="flex items-center space-x-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-purple-700 data-[state=active]:text-white text-gray-300 rounded-xl py-3 transition-all duration-200 data-[state=active]:shadow-lg"
                  >
                    <Church className="h-5 w-5" />
                    <span className="font-semibold">Church Admin</span>
                  </TabsTrigger>
                </TabsList>

                {/* Member Sign In */}
                <TabsContent value="member">
                  <div className="mb-6 p-6 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-2xl border border-blue-400/30 backdrop-blur-sm">
                    <div className="flex items-center space-x-4">
                      <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-2xl flex items-center justify-center shadow-lg ring-2 ring-blue-400/30">
                        <Users className="h-7 w-7 text-white" />
                      </div>
                      <div>
                        <h3 className="font-bold text-white text-lg">Member Portal</h3>
                        <p className="text-blue-200 font-medium">Access your giving dashboard and financial insights</p>
                        <div className="flex items-center mt-2 space-x-3 text-sm">
                          <div className="flex items-center space-x-1 text-blue-300">
                            <div className="w-1.5 h-1.5 bg-blue-400 rounded-full"></div>
                            <span>Donations</span>
                          </div>
                          <div className="flex items-center space-x-1 text-blue-300">
                            <div className="w-1.5 h-1.5 bg-blue-400 rounded-full"></div>
                            <span>Wallet</span>
                          </div>
                          <div className="flex items-center space-x-1 text-blue-300">
                            <div className="w-1.5 h-1.5 bg-blue-400 rounded-full"></div>
                            <span>Analytics</span>
                          </div>
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
                            <FormLabel className="text-white font-semibold">Email Address</FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                type="email"
                                placeholder="member@example.com"
                                className="h-12 bg-white/10 border-white/20 text-white placeholder:text-gray-400 rounded-xl backdrop-blur-sm focus:bg-white/20 focus:border-blue-400 transition-all duration-200"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={memberForm.control}
                        name="password"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-white font-semibold">Password</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Input
                                  {...field}
                                  type={showPassword ? "text" : "password"}
                                  placeholder="Enter your secure password"
                                  className="h-12 bg-white/10 border-white/20 text-white placeholder:text-gray-400 rounded-xl backdrop-blur-sm focus:bg-white/20 focus:border-blue-400 transition-all duration-200 pr-12"
                                />
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-white/10 rounded-r-xl"
                                  onClick={() => setShowPassword(!showPassword)}
                                >
                                  {showPassword ? (
                                    <EyeOff className="h-5 w-5 text-gray-300" />
                                  ) : (
                                    <Eye className="h-5 w-5 text-gray-300" />
                                  )}
                                </Button>
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={memberForm.control}
                        name="rememberMe"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                                className="data-[state=checked]:bg-blue-500 data-[state=checked]:border-blue-500 border-white/30"
                              />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                              <FormLabel className="text-sm text-gray-300 font-medium">
                                Keep me signed in for 30 days
                              </FormLabel>
                            </div>
                          </FormItem>
                        )}
                      />

                      <Button
                        type="submit"
                        disabled={memberSignInMutation.isPending}
                        className="w-full h-14 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold text-lg rounded-xl shadow-xl ring-2 ring-blue-400/30 transition-all duration-200 transform hover:scale-[1.02]"
                      >
                        {memberSignInMutation.isPending ? (
                          <div className="flex items-center space-x-3">
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                            <span>Signing In...</span>
                          </div>
                        ) : (
                          <div className="flex items-center space-x-2">
                            <Users className="h-5 w-5" />
                            <span>Access Member Portal</span>
                          </div>
                        )}
                      </Button>
                    </form>
                  </Form>
                </TabsContent>

                {/* Church Sign In */}
                <TabsContent value="church">
                  <div className="mb-6 p-6 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-2xl border border-purple-400/30 backdrop-blur-sm">
                    <div className="flex items-center space-x-4">
                      <div className="w-14 h-14 bg-gradient-to-br from-purple-600 to-pink-600 rounded-2xl flex items-center justify-center shadow-lg ring-2 ring-purple-400/30">
                        <Church className="h-7 w-7 text-white" />
                      </div>
                      <div>
                        <h3 className="font-bold text-white text-lg">Church Administration</h3>
                        <p className="text-purple-200 font-medium">Manage your congregation and financial operations</p>
                        <div className="flex items-center mt-2 space-x-3 text-sm">
                          <div className="flex items-center space-x-1 text-purple-300">
                            <div className="w-1.5 h-1.5 bg-purple-400 rounded-full"></div>
                            <span>Members</span>
                          </div>
                          <div className="flex items-center space-x-1 text-purple-300">
                            <div className="w-1.5 h-1.5 bg-purple-400 rounded-full"></div>
                            <span>Campaigns</span>
                          </div>
                          <div className="flex items-center space-x-1 text-purple-300">
                            <div className="w-1.5 h-1.5 bg-purple-400 rounded-full"></div>
                            <span>Reports</span>
                          </div>
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
                            <FormLabel className="text-white font-semibold">Church Admin Email</FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                type="email"
                                placeholder="admin@yourchurch.org"
                                className="h-12 bg-white/10 border-white/20 text-white placeholder:text-gray-400 rounded-xl backdrop-blur-sm focus:bg-white/20 focus:border-purple-400 transition-all duration-200"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={churchForm.control}
                        name="password"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-white font-semibold">Administrative Password</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Input
                                  {...field}
                                  type={showPassword ? "text" : "password"}
                                  placeholder="Enter your admin password"
                                  className="h-12 bg-white/10 border-white/20 text-white placeholder:text-gray-400 rounded-xl backdrop-blur-sm focus:bg-white/20 focus:border-purple-400 transition-all duration-200 pr-12"
                                />
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-white/10 rounded-r-xl"
                                  onClick={() => setShowPassword(!showPassword)}
                                >
                                  {showPassword ? (
                                    <EyeOff className="h-5 w-5 text-gray-300" />
                                  ) : (
                                    <Eye className="h-5 w-5 text-gray-300" />
                                  )}
                                </Button>
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={churchForm.control}
                        name="rememberMe"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                                className="data-[state=checked]:bg-purple-500 data-[state=checked]:border-purple-500 border-white/30"
                              />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                              <FormLabel className="text-sm text-gray-300 font-medium">
                                Keep me signed in on this secure device
                              </FormLabel>
                            </div>
                          </FormItem>
                        )}
                      />

                      <Button
                        type="submit"
                        disabled={churchSignInMutation.isPending}
                        className="w-full h-14 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold text-lg rounded-xl shadow-xl ring-2 ring-purple-400/30 transition-all duration-200 transform hover:scale-[1.02]"
                      >
                        {churchSignInMutation.isPending ? (
                          <div className="flex items-center space-x-3">
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                            <span>Signing In...</span>
                          </div>
                        ) : (
                          <div className="flex items-center space-x-2">
                            <Church className="h-5 w-5" />
                            <span>Access Church Admin</span>
                          </div>
                        )}
                      </Button>
                    </form>
                  </Form>
                </TabsContent>
              </Tabs>

              {/* Professional Footer Links */}
              <div className="mt-8 space-y-4 border-t border-white/10 pt-6">
                <div className="text-center">
                  <Button variant="link" className="text-sm text-gray-300 hover:text-white font-medium">
                    Forgot your password?
                  </Button>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-400 mb-4">
                    Don't have an account with ChurPay?
                  </p>
                  <div className="flex flex-col space-y-3">
                    <Button 
                      variant="outline" 
                      className="w-full border-white/20 text-white hover:bg-white/10 backdrop-blur-sm rounded-xl h-12 font-medium"
                      onClick={() => setLocation('/member-registration')}
                    >
                      <Users className="h-4 w-4 mr-2" />
                      Register as Member
                    </Button>
                    <Button 
                      variant="outline" 
                      className="w-full border-white/20 text-white hover:bg-white/10 backdrop-blur-sm rounded-xl h-12 font-medium"
                      onClick={() => setLocation('/church-registration')}
                    >
                      <Church className="h-4 w-4 mr-2" />
                      Register Your Church
                    </Button>
                  </div>
                </div>
              </div>

              {/* Security Badge */}
              <div className="mt-6 flex items-center justify-center space-x-2 text-xs text-gray-400">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                <span>256-bit SSL Encryption</span>
                <span>•</span>
                <span>Bank-Grade Security</span>
              </div>
            </CardContent>
          </Card>

          {/* Enhanced Security Notice */}
          <div className="mt-8 text-center space-y-2">
            <div className="flex items-center justify-center space-x-2 text-xs text-gray-400">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span>Protected by enterprise-grade security protocols</span>
            </div>
            <p className="text-xs text-gray-500">
              By signing in, you agree to our Terms of Service and Privacy Policy
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}