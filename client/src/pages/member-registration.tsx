import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";
import { isUnauthorizedError } from "@/lib/authUtils";
import { 
  ArrowLeft, 
  Users, 
  Search, 
  MapPin, 
  CheckCircle,
  Church,
  Mail,
  Phone,
  User,
  Shield,
  Heart
} from "lucide-react";
import { AddressAutocomplete } from "@/components/AddressAutocomplete";

const memberRegistrationSchema = z.object({
  churchId: z.string().min(1, "Please select a church"),
  // Personal Information
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Valid email is required"),
  phone: z.string().min(1, "Phone number is required"),
  dateOfBirth: z.string().min(1, "Date of birth is required"),
  
  // Address Information
  address: z.string().min(1, "Street address is required"),
  city: z.string().min(1, "City is required"),
  province: z.string().min(1, "Province is required"),
  postalCode: z.string().min(1, "Postal code is required"),
  country: z.string().default("South Africa"),
  
  // Emergency Contact
  emergencyContactName: z.string().min(1, "Emergency contact name is required"),
  emergencyContactPhone: z.string().min(1, "Emergency contact phone is required"),
  emergencyContactRelationship: z.string().min(1, "Relationship is required"),
  
  // Church-related Information
  membershipType: z.string().min(1, "Please select membership type"),
  previousChurch: z.string().optional(),
  howDidYouHear: z.string().optional(),
});

type MemberRegistrationForm = z.infer<typeof memberRegistrationSchema>;

interface Church {
  id: string;
  name: string;
  denomination?: string;
  city: string;
  province: string;
  contactEmail: string;
  contactPhone?: string;
  memberCount: number;
  status: string;
}

const membershipSteps = [
  { id: 1, title: "Personal Details", icon: User },
  { id: 2, title: "Address Information", icon: MapPin },
  { id: 3, title: "Emergency Contact", icon: Shield },
  { id: 4, title: "Church Selection", icon: Church },
];

// South African provinces for consistency
const provinces = [
  "Eastern Cape", "Free State", "Gauteng", "KwaZulu-Natal", 
  "Limpopo", "Mpumalanga", "Northern Cape", "North West", "Western Cape"
];

const membershipTypes = [
  { value: "new_member", label: "New Member" },
  { value: "returning_member", label: "Returning Member" },
  { value: "transfer_member", label: "Transfer from Another Church" },
  { value: "visitor", label: "Regular Visitor" }
];

const relationships = [
  "Parent", "Sibling", "Spouse", "Child", "Friend", "Guardian", "Other Family Member"
];

export default function MemberRegistration() {
  const [currentStep, setCurrentStep] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedChurch, setSelectedChurch] = useState<Church | null>(null);
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { user } = useAuth();

  const form = useForm<MemberRegistrationForm>({
    resolver: zodResolver(memberRegistrationSchema),
    defaultValues: {
      country: "South Africa",
      firstName: (user as any)?.firstName || "",
      lastName: (user as any)?.lastName || "",
      email: (user as any)?.email || "",
      phone: "",
      dateOfBirth: "",
      address: "",
      city: "",
      province: "",
      postalCode: "",
      emergencyContactName: "",
      emergencyContactPhone: "",
      emergencyContactRelationship: "",
      membershipType: "",
      previousChurch: "",
      howDidYouHear: "",
      churchId: "",
    },
  });

  // Sample churches for demonstration
  const sampleChurches: Church[] = [
    {
      id: "1",
      name: "Cape Town Methodist Church",
      denomination: "Methodist",
      city: "Cape Town",
      province: "Western Cape",
      contactEmail: "info@ctmethodist.org.za",
      contactPhone: "+27 21 123 4567",
      memberCount: 450,
      status: "approved"
    },
    {
      id: "2", 
      name: "Johannesburg Baptist Fellowship",
      denomination: "Baptist",
      city: "Johannesburg",
      province: "Gauteng",
      contactEmail: "connect@jbfellowship.co.za",
      contactPhone: "+27 11 987 6543",
      memberCount: 320,
      status: "approved"
    }
  ];

  const filteredChurches = sampleChurches.filter(church =>
    church.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    church.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (church.denomination && church.denomination.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const memberRegistrationMutation = useMutation({
    mutationFn: async (data: MemberRegistrationForm) => {
      const response = await apiRequest("POST", "/api/members/join", data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Welcome to the Community!",
        description: `You've successfully joined ${selectedChurch?.name}. You can now start making donations and supporting church projects.`,
        variant: "default",
      });
      setLocation("/");
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Session Expired",
          description: "Please sign in again to continue.",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 1000);
        return;
      }
      toast({
        title: "Registration Failed",
        description: error.message || "There was an error joining the church. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: MemberRegistrationForm) => {
    memberRegistrationMutation.mutate(data);
  };

  const handleChurchSelect = (church: Church) => {
    setSelectedChurch(church);
    form.setValue("churchId", church.id);
  };

  const nextStep = () => {
    if (currentStep < membershipSteps.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="firstName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>First Name *</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter your first name" {...field} />
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
                    <FormLabel>Last Name *</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter your last name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email Address *</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="your.email@example.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone Number *</FormLabel>
                    <FormControl>
                      <Input placeholder="+27 12 345 6789" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="dateOfBirth"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Date of Birth *</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <AddressAutocomplete
              label="Your Address"
              placeholder="Search for your address..."
              onAddressSelect={(addressComponents) => {
                form.setValue('address', addressComponents.address);
                form.setValue('city', addressComponents.city);
                form.setValue('province', addressComponents.province);
                form.setValue('postalCode', addressComponents.postalCode);
                form.setValue('country', addressComponents.country);
              }}
              initialAddress={{
                address: form.getValues('address') || '',
                city: form.getValues('city') || '',
                province: form.getValues('province') || '',
                postalCode: form.getValues('postalCode') || '',
                country: form.getValues('country') || 'South Africa'
              }}
            />
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-start space-x-2">
                <Shield className="h-5 w-5 text-yellow-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-yellow-800">Emergency Contact Information</h4>
                  <p className="text-sm text-yellow-700 mt-1">
                    This information helps us reach someone on your behalf in case of emergencies during church events.
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="emergencyContactName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Emergency Contact Name *</FormLabel>
                    <FormControl>
                      <Input placeholder="Contact person's full name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="emergencyContactPhone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Emergency Contact Phone *</FormLabel>
                    <FormControl>
                      <Input placeholder="+27 12 345 6789" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="emergencyContactRelationship"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Relationship *</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select relationship" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {relationships.map((relationship) => (
                        <SelectItem key={relationship} value={relationship}>
                          {relationship}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            {/* Church Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search by church name, city, or denomination..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Church Selection */}
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {filteredChurches.length === 0 ? (
                <div className="text-center py-8">
                  <Church className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No churches found</h3>
                  <p className="text-gray-600 mb-4">
                    {searchQuery ? 
                      "Try adjusting your search terms or contact us to help you find your church." :
                      "We're still building our church directory. Contact us to add your church to ChurPay."
                    }
                  </p>
                </div>
              ) : (
                filteredChurches.map((church) => (
                  <Card 
                    key={church.id} 
                    className={`cursor-pointer transition-all duration-200 ${
                      selectedChurch?.id === church.id 
                        ? 'ring-2 ring-churpay-purple bg-purple-50' 
                        : 'hover:shadow-md'
                    }`}
                    onClick={() => handleChurchSelect(church)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-3">
                          <div className="w-10 h-10 bg-churpay-gradient rounded-lg flex items-center justify-center">
                            <Church className="h-5 w-5 text-white" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-1">
                              <h3 className="font-semibold text-gray-900">{church.name}</h3>
                              {church.denomination && (
                                <Badge variant="secondary" className="text-xs">
                                  {church.denomination}
                                </Badge>
                              )}
                            </div>
                            <div className="flex items-center space-x-4 text-sm text-gray-600">
                              <div className="flex items-center space-x-1">
                                <MapPin className="h-3 w-3" />
                                <span>{church.city}, {church.province}</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <Users className="h-3 w-3" />
                                <span>{church.memberCount} members</span>
                              </div>
                            </div>
                          </div>
                        </div>
                        {selectedChurch?.id === church.id && (
                          <div className="flex items-center justify-center w-6 h-6 bg-churpay-purple rounded-full">
                            <CheckCircle className="h-4 w-4 text-white" />
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>

            {/* Additional Information */}
            <div className="space-y-4 pt-4 border-t">
              <FormField
                control={form.control}
                name="membershipType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Membership Type *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select membership type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {membershipTypes.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
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
                      <Input placeholder="If transferring from another church" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="howDidYouHear"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>How did you hear about this church? (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="Friend, website, social media, etc." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-16">
            <Button 
              variant="ghost" 
              onClick={() => setLocation("/")}
              className="mr-4"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center">
                <Users className="h-4 w-4 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-semibold text-gray-900">Member Registration</h1>
                <p className="text-sm text-gray-600">Step {currentStep} of {membershipSteps.length}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {membershipSteps.map((step, index) => {
              const StepIcon = step.icon;
              const isActive = currentStep === step.id;
              const isCompleted = currentStep > step.id;
              
              return (
                <div key={step.id} className="flex items-center">
                  <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                    isCompleted 
                      ? 'bg-green-500 border-green-500 text-white' 
                      : isActive 
                      ? 'bg-churpay-purple border-churpay-purple text-white' 
                      : 'bg-white border-gray-300 text-gray-400'
                  }`}>
                    {isCompleted ? (
                      <CheckCircle className="h-5 w-5" />
                    ) : (
                      <StepIcon className="h-5 w-5" />
                    )}
                  </div>
                  <div className="ml-3 hidden sm:block">
                    <p className={`text-sm font-medium ${
                      isActive ? 'text-churpay-purple' : isCompleted ? 'text-green-600' : 'text-gray-500'
                    }`}>
                      {step.title}
                    </p>
                  </div>
                  {index < membershipSteps.length - 1 && (
                    <div className="flex-1 h-0.5 mx-4 bg-gray-200">
                      <div 
                        className={`h-full transition-all duration-300 ${
                          isCompleted ? 'bg-green-500' : 'bg-gray-200'
                        }`}
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Form */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              {React.createElement(membershipSteps[currentStep - 1].icon, { className: "h-5 w-5 text-churpay-purple" })}
              <span>{membershipSteps[currentStep - 1].title}</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {renderStepContent()}

                {/* Navigation Buttons */}
                <div className="flex justify-between pt-6 border-t">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={prevStep}
                    disabled={currentStep === 1}
                  >
                    Previous
                  </Button>

                  {currentStep < membershipSteps.length ? (
                    <Button
                      type="button"
                      onClick={nextStep}
                      className="bg-churpay-gradient text-white"
                      disabled={currentStep === 4 && !selectedChurch}
                    >
                      Next
                    </Button>
                  ) : (
                    <Button
                      type="submit"
                      disabled={memberRegistrationMutation.isPending || !selectedChurch}
                      className="bg-churpay-gradient text-white"
                    >
                      {memberRegistrationMutation.isPending ? "Joining..." : "Complete Registration"}
                    </Button>
                  )}
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}