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
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

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

  const handleMemberSignIn = async (data: MemberSignInData) => {
    setIsLoading(true);
    try {
      // Simulate sign-in process
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      toast({
        title: "Welcome back!",
        description: "Successfully signed in to your member account.",
      });
      
      // Redirect to member dashboard
      window.location.href = '/member-dashboard';
    } catch (error) {
      toast({
        title: "Sign In Failed",
        description: "Invalid email or password. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleChurchSignIn = async (data: ChurchSignInData) => {
    setIsLoading(true);
    try {
      // Simulate sign-in process
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      toast({
        title: "Welcome back!",
        description: "Successfully signed in to your church account.",
      });
      
      // Redirect to church dashboard
      window.location.href = '/church-dashboard';
    } catch (error) {
      toast({
        title: "Sign In Failed",
        description: "Invalid email or password. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-yellow-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-churpay-gradient rounded-xl flex items-center justify-center shadow-lg">
                <Heart className="h-5 w-5 text-white" />
              </div>
              <div>
                <span className="text-2xl font-bold text-gray-900">Chur</span>
                <span className="text-2xl font-bold bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">Pay</span>
              </div>
            </div>
            <Button 
              variant="ghost" 
              onClick={() => window.location.href = '/'}
              className="flex items-center space-x-2"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Home</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-md">
          {/* Welcome Section */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome Back</h1>
            <p className="text-gray-600">Sign in to your ChurPay account to continue</p>
          </div>

          <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-center text-gray-900">Sign In</CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs value={currentTab} onValueChange={setCurrentTab} className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-6">
                  <TabsTrigger value="member" className="flex items-center space-x-2">
                    <Users className="h-4 w-4" />
                    <span>Member</span>
                  </TabsTrigger>
                  <TabsTrigger value="church" className="flex items-center space-x-2">
                    <Church className="h-4 w-4" />
                    <span>Church</span>
                  </TabsTrigger>
                </TabsList>

                {/* Member Sign In */}
                <TabsContent value="member">
                  <div className="mb-4 p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-blue-200 rounded-lg flex items-center justify-center">
                        <Users className="h-5 w-5 text-blue-700" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-blue-900">Member Sign In</h3>
                        <p className="text-sm text-blue-700">Access your giving dashboard and donation history</p>
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
                            <FormLabel>Email Address</FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                type="email"
                                placeholder="member@example.com"
                                className="h-11"
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
                            <FormLabel>Password</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Input
                                  {...field}
                                  type={showPassword ? "text" : "password"}
                                  placeholder="Enter your password"
                                  className="h-11 pr-10"
                                />
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                  onClick={() => setShowPassword(!showPassword)}
                                >
                                  {showPassword ? (
                                    <EyeOff className="h-4 w-4 text-gray-400" />
                                  ) : (
                                    <Eye className="h-4 w-4 text-gray-400" />
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
                              />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                              <FormLabel className="text-sm font-normal">
                                Remember me for 30 days
                              </FormLabel>
                            </div>
                          </FormItem>
                        )}
                      />

                      <Button
                        type="submit"
                        disabled={isLoading}
                        className="w-full h-11 bg-gradient-to-r from-blue-500 to-blue-600 text-white"
                      >
                        {isLoading ? (
                          <div className="flex items-center space-x-2">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                            <span>Signing In...</span>
                          </div>
                        ) : (
                          "Sign In as Member"
                        )}
                      </Button>
                    </form>
                  </Form>
                </TabsContent>

                {/* Church Sign In */}
                <TabsContent value="church">
                  <div className="mb-4 p-4 bg-gradient-to-r from-purple-50 to-purple-100 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-churpay-gradient rounded-lg flex items-center justify-center">
                        <Church className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-purple-900">Church Sign In</h3>
                        <p className="text-sm text-purple-700">Access your church management dashboard</p>
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
                            <FormLabel>Church Email Address</FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                type="email"
                                placeholder="admin@yourchurch.org"
                                className="h-11"
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
                            <FormLabel>Password</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Input
                                  {...field}
                                  type={showPassword ? "text" : "password"}
                                  placeholder="Enter your password"
                                  className="h-11 pr-10"
                                />
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                  onClick={() => setShowPassword(!showPassword)}
                                >
                                  {showPassword ? (
                                    <EyeOff className="h-4 w-4 text-gray-400" />
                                  ) : (
                                    <Eye className="h-4 w-4 text-gray-400" />
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
                              />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                              <FormLabel className="text-sm font-normal">
                                Keep me signed in on this device
                              </FormLabel>
                            </div>
                          </FormItem>
                        )}
                      />

                      <Button
                        type="submit"
                        disabled={isLoading}
                        className="w-full h-11 bg-churpay-gradient text-white"
                      >
                        {isLoading ? (
                          <div className="flex items-center space-x-2">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                            <span>Signing In...</span>
                          </div>
                        ) : (
                          "Sign In as Church"
                        )}
                      </Button>
                    </form>
                  </Form>
                </TabsContent>
              </Tabs>

              {/* Footer Links */}
              <div className="mt-6 space-y-3">
                <div className="text-center">
                  <Button variant="link" className="text-sm text-gray-600 hover:text-gray-900">
                    Forgot your password?
                  </Button>
                </div>
                <div className="text-center text-sm text-gray-600">
                  Don't have an account?{' '}
                  <Button 
                    variant="link" 
                    className="p-0 h-auto font-medium text-purple-600 hover:text-purple-700"
                    onClick={() => window.location.href = '/'}
                  >
                    Get Started
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Security Notice */}
          <div className="mt-6 text-center text-xs text-gray-500">
            <p>Your information is protected with bank-level security.</p>
            <p>By signing in, you agree to our Terms of Service and Privacy Policy.</p>
          </div>
        </div>
      </div>
    </div>
  );
}