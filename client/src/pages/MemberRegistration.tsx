import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { useMutation, useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { UserPlus, Church, Shield, CheckCircle } from 'lucide-react';

// Member registration schema
const memberRegistrationSchema = z.object({
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  phone: z.string().min(10, 'Please enter a valid phone number'),
  dateOfBirth: z.string().min(1, 'Date of birth is required'),
  
  // Address Information
  address: z.string().min(5, 'Full address is required'),
  city: z.string().min(2, 'City is required'),
  province: z.string().min(1, 'Province is required'),
  postalCode: z.string().min(4, 'Postal code is required'),
  
  // Emergency Contact
  emergencyContactName: z.string().min(2, 'Emergency contact name is required'),
  emergencyContactPhone: z.string().min(10, 'Emergency contact phone is required'),
  emergencyContactRelationship: z.string().min(1, 'Relationship is required'),
  
  // Church Information
  churchId: z.string().min(1, 'Please select a church'),
  membershipType: z.string().min(1, 'Please select membership type'),
  previousChurch: z.string().optional(),
  howDidYouHear: z.string().min(1, 'Please tell us how you heard about us'),
});

type MemberRegistrationForm = z.infer<typeof memberRegistrationSchema>;

const MemberRegistration: React.FC = () => {
  const [step, setStep] = useState(1);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { toast } = useToast();

  const form = useForm<MemberRegistrationForm>({
    resolver: zodResolver(memberRegistrationSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      dateOfBirth: '',
      address: '',
      city: '',
      province: '',
      postalCode: '',
      emergencyContactName: '',
      emergencyContactPhone: '',
      emergencyContactRelationship: '',
      churchId: '',
      membershipType: '',
      previousChurch: '',
      howDidYouHear: '',
    },
  });

  // Fetch available churches
  const { data: churches } = useQuery({
    queryKey: ['/api/churches'],
  });

  // Member registration mutation
  const registerMemberMutation = useMutation({
    mutationFn: async (data: MemberRegistrationForm) => {
      const response = await fetch('/api/members/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        throw new Error('Registration failed');
      }
      
      return response.json();
    },
    onSuccess: () => {
      setIsSubmitted(true);
      toast({
        title: "Registration Successful!",
        description: "Your membership application has been submitted successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Registration Failed",
        description: error.message || "There was an error submitting your registration.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: MemberRegistrationForm) => {
    registerMemberMutation.mutate(data);
  };

  const nextStep = () => {
    setStep(prev => Math.min(prev + 1, 4));
  };

  const prevStep = () => {
    setStep(prev => Math.max(prev - 1, 1));
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Welcome to ChurPay!</h2>
            <p className="text-gray-600 mb-6">
              Your membership application has been submitted successfully. You'll receive a confirmation email shortly.
            </p>
            <Button
              onClick={() => window.location.href = '/dashboard'}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white"
            >
              Go to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <Church className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Join Our Church Community</h1>
          <p className="text-gray-600">Complete your membership registration to get started</p>
        </div>

        {/* Progress Indicator */}
        <div className="flex items-center justify-center mb-8">
          {[1, 2, 3, 4].map((stepNumber) => (
            <div key={stepNumber} className="flex items-center">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm ${
                  step >= stepNumber
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-200 text-gray-500'
                }`}
              >
                {stepNumber}
              </div>
              {stepNumber < 4 && (
                <div
                  className={`w-16 h-1 ${
                    step > stepNumber ? 'bg-purple-600' : 'bg-gray-200'
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        {/* Registration Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <UserPlus className="h-5 w-5 text-purple-600" />
              <span>
                {step === 1 && 'Personal Information'}
                {step === 2 && 'Address & Contact'}
                {step === 3 && 'Emergency Contact'}
                {step === 4 && 'Church Information'}
              </span>
            </CardTitle>
            <CardDescription>
              {step === 1 && 'Please provide your basic personal details'}
              {step === 2 && 'Enter your address and contact information'}
              {step === 3 && 'Provide an emergency contact person'}
              {step === 4 && 'Select your church and membership preferences'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {/* Step 1: Personal Information */}
                {step === 1 && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                              <Input {...field} placeholder="Smith" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email Address</FormLabel>
                          <FormControl>
                            <Input {...field} type="email" placeholder="john.smith@example.com" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="phone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Phone Number</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="+27 82 123 4567" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="dateOfBirth"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Date of Birth</FormLabel>
                            <FormControl>
                              <Input {...field} type="date" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                )}

                {/* Step 2: Address & Contact */}
                {step === 2 && (
                  <div className="space-y-4">
                    <FormField
                      control={form.control}
                      name="address"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Street Address</FormLabel>
                          <FormControl>
                            <Textarea {...field} placeholder="123 Main Street, Suburb" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <FormField
                        control={form.control}
                        name="city"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>City</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="Cape Town" />
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
                            <FormLabel>Province</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select province" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="eastern-cape">Eastern Cape</SelectItem>
                                <SelectItem value="free-state">Free State</SelectItem>
                                <SelectItem value="gauteng">Gauteng</SelectItem>
                                <SelectItem value="kwazulu-natal">KwaZulu-Natal</SelectItem>
                                <SelectItem value="limpopo">Limpopo</SelectItem>
                                <SelectItem value="mpumalanga">Mpumalanga</SelectItem>
                                <SelectItem value="northern-cape">Northern Cape</SelectItem>
                                <SelectItem value="north-west">North West</SelectItem>
                                <SelectItem value="western-cape">Western Cape</SelectItem>
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
                            <FormLabel>Postal Code</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="8001" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                )}

                {/* Step 3: Emergency Contact */}
                {step === 3 && (
                  <div className="space-y-4">
                    <FormField
                      control={form.control}
                      name="emergencyContactName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Emergency Contact Name</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="Jane Smith" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="emergencyContactPhone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Emergency Contact Phone</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="+27 82 987 6543" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="emergencyContactRelationship"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Relationship</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select relationship" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="spouse">Spouse</SelectItem>
                                <SelectItem value="parent">Parent</SelectItem>
                                <SelectItem value="child">Child</SelectItem>
                                <SelectItem value="sibling">Sibling</SelectItem>
                                <SelectItem value="friend">Friend</SelectItem>
                                <SelectItem value="other">Other</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                )}

                {/* Step 4: Church Information */}
                {step === 4 && (
                  <div className="space-y-4">
                    <FormField
                      control={form.control}
                      name="churchId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Select Church</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Choose your church" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {(churches as any[])?.map((church: any) => (
                                <SelectItem key={church.id} value={church.id}>
                                  {church.name}
                                </SelectItem>
                              )) || (
                                <SelectItem value="default">Loading churches...</SelectItem>
                              )}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="membershipType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Membership Type</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select membership type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="new-member">New Member</SelectItem>
                              <SelectItem value="transfer-member">Transfer Member</SelectItem>
                              <SelectItem value="visitor">Regular Visitor</SelectItem>
                              <SelectItem value="youth">Youth Member</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="previousChurch"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Previous Church (Optional)</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="Previous church name" />
                          </FormControl>
                          <FormDescription>
                            If you're transferring from another church, please let us know
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="howDidYouHear"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>How did you hear about us?</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select an option" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="friend-family">Friend or Family</SelectItem>
                              <SelectItem value="social-media">Social Media</SelectItem>
                              <SelectItem value="website">Church Website</SelectItem>
                              <SelectItem value="event">Church Event</SelectItem>
                              <SelectItem value="pastor">Pastor Invitation</SelectItem>
                              <SelectItem value="community">Community Outreach</SelectItem>
                              <SelectItem value="other">Other</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                )}

                {/* Navigation Buttons */}
                <div className="flex justify-between pt-6">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={prevStep}
                    disabled={step === 1}
                    className="flex items-center space-x-2"
                  >
                    <span>Previous</span>
                  </Button>

                  {step < 4 ? (
                    <Button
                      type="button"
                      onClick={nextStep}
                      className="bg-purple-600 hover:bg-purple-700 text-white flex items-center space-x-2"
                    >
                      <span>Next</span>
                    </Button>
                  ) : (
                    <Button
                      type="submit"
                      disabled={registerMemberMutation.isPending}
                      className="bg-purple-600 hover:bg-purple-700 text-white flex items-center space-x-2"
                    >
                      <Shield className="h-4 w-4" />
                      <span>
                        {registerMemberMutation.isPending ? 'Submitting...' : 'Complete Registration'}
                      </span>
                    </Button>
                  )}
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>

        {/* Security Notice */}
        <div className="mt-8 text-center">
          <div className="inline-flex items-center space-x-2 text-sm text-gray-600 bg-white p-3 rounded-lg shadow-sm">
            <Shield className="h-4 w-4 text-green-600" />
            <span>Your information is securely encrypted and protected</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MemberRegistration;