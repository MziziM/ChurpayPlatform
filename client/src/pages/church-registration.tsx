import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Church, Users, MapPin, Phone, Mail } from "lucide-react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { apiRequest } from "@/lib/queryClient";
import { useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

const churchRegistrationSchema = z.object({
  name: z.string().min(1, "Church name is required"),
  denomination: z.string().min(1, "Denomination is required"),
  address: z.string().min(1, "Address is required"),
  city: z.string().min(1, "City is required"),
  province: z.string().min(1, "Province is required"),
  postalCode: z.string().min(1, "Postal code is required"),
  country: z.string().default("South Africa"),
  phone: z.string().min(1, "Phone number is required"),
  email: z.string().email("Valid email is required"),
  website: z.string().optional(),
  description: z.string().min(1, "Church description is required"),
  memberCount: z.string().min(1, "Member count is required"),
  foundedYear: z.string().min(1, "Founded year is required"),
  leadPastor: z.string().min(1, "Lead pastor name is required"),
  registrationNumber: z.string().optional(),
});

type ChurchRegistrationForm = z.infer<typeof churchRegistrationSchema>;

export default function ChurchRegistration() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const form = useForm<ChurchRegistrationForm>({
    resolver: zodResolver(churchRegistrationSchema),
    defaultValues: {
      country: "South Africa",
    },
  });

  const registerMutation = useMutation({
    mutationFn: async (data: ChurchRegistrationForm) => {
      return apiRequest("/api/churches/register", "POST", data);
    },
    onSuccess: (data) => {
      toast({
        title: "Registration Submitted",
        description: "Your church registration has been submitted for review. We'll contact you within 24 hours.",
      });
      setLocation("/");
    },
    onError: (error) => {
      toast({
        title: "Registration Failed",
        description: error.message || "Something went wrong. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: ChurchRegistrationForm) => {
    registerMutation.mutate(data);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            className="mb-4"
            onClick={() => setLocation("/")}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Button>
          
          <div className="text-center">
            <div className="w-16 h-16 bg-churpay-gradient rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
              <Church className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Register Your Church</h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Join the ChurPay community and transform your church's giving experience with our secure digital platform.
            </p>
          </div>
        </div>

        {/* Registration Form */}
        <Card className="shadow-xl border-0">
          <CardHeader className="bg-gradient-to-r from-purple-50 to-purple-100 border-b">
            <CardTitle className="text-2xl text-center text-gray-900">Church Information</CardTitle>
          </CardHeader>
          <CardContent className="p-8">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                {/* Basic Information */}
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                    <Church className="mr-2 h-5 w-5" />
                    Basic Information
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Church Name *</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., Grace Community Church" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="denomination"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Denomination *</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., Baptist, Methodist, Presbyterian" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="leadPastor"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Lead Pastor *</FormLabel>
                          <FormControl>
                            <Input placeholder="Pastor's full name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="foundedYear"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Founded Year *</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., 1995" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Church Description *</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Tell us about your church, mission, and community..."
                            className="min-h-24"
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Contact Information */}
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                    <Phone className="mr-2 h-5 w-5" />
                    Contact Information
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Phone Number *</FormLabel>
                          <FormControl>
                            <Input placeholder="+27 11 123 4567" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email Address *</FormLabel>
                          <FormControl>
                            <Input placeholder="info@yourchurch.org" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="website"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Website (Optional)</FormLabel>
                          <FormControl>
                            <Input placeholder="https://yourchurch.org" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="memberCount"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Approximate Member Count *</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select member count" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="1-50">1-50 members</SelectItem>
                              <SelectItem value="51-100">51-100 members</SelectItem>
                              <SelectItem value="101-250">101-250 members</SelectItem>
                              <SelectItem value="251-500">251-500 members</SelectItem>
                              <SelectItem value="501-1000">501-1000 members</SelectItem>
                              <SelectItem value="1000+">1000+ members</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                {/* Address Information */}
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                    <MapPin className="mr-2 h-5 w-5" />
                    Address Information
                  </h3>
                  
                  <FormField
                    control={form.control}
                    name="address"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Street Address *</FormLabel>
                        <FormControl>
                          <Input placeholder="123 Church Street" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <FormField
                      control={form.control}
                      name="city"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>City *</FormLabel>
                          <FormControl>
                            <Input placeholder="Johannesburg" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="province"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Province *</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select province" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="Eastern Cape">Eastern Cape</SelectItem>
                              <SelectItem value="Free State">Free State</SelectItem>
                              <SelectItem value="Gauteng">Gauteng</SelectItem>
                              <SelectItem value="KwaZulu-Natal">KwaZulu-Natal</SelectItem>
                              <SelectItem value="Limpopo">Limpopo</SelectItem>
                              <SelectItem value="Mpumalanga">Mpumalanga</SelectItem>
                              <SelectItem value="Northern Cape">Northern Cape</SelectItem>
                              <SelectItem value="North West">North West</SelectItem>
                              <SelectItem value="Western Cape">Western Cape</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="postalCode"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Postal Code *</FormLabel>
                          <FormControl>
                            <Input placeholder="2000" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <FormField
                    control={form.control}
                    name="registrationNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Church Registration Number (Optional)</FormLabel>
                        <FormControl>
                          <Input placeholder="If your church is formally registered" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Submit Button */}
                <div className="pt-6 border-t">
                  <Button
                    type="submit"
                    className="w-full bg-churpay-gradient text-white hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1"
                    size="lg"
                    disabled={registerMutation.isPending}
                  >
                    {registerMutation.isPending ? "Submitting..." : "Submit Church Registration"}
                  </Button>
                  
                  <p className="text-sm text-gray-600 text-center mt-4">
                    By submitting this form, you agree to our Terms of Service and Privacy Policy. 
                    Your application will be reviewed within 24 hours.
                  </p>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}