import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useLocation } from "wouter";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
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
  Heart,
  Eye,
  EyeOff,
  Lock
} from "lucide-react";
import { AddressAutocomplete } from "@/components/AddressAutocomplete";

const memberRegistrationSchema = z.object({
  churchId: z.string().min(1, "Please select a church"),
  // Personal Information
  firstName: z.string().min(2, "First name must be at least 2 characters"),
  lastName: z.string().min(2, "Last name must be at least 2 characters"),
  email: z.string().email("Valid email is required"),
  phone: z.string().min(10, "Phone number must be at least 10 digits"),
  dateOfBirth: z.string().min(1, "Date of birth is required"),
  
  // Authentication
  password: z.string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number")
    .regex(/[^A-Za-z0-9]/, "Password must contain at least one special character"),
  confirmPassword: z.string().min(1, "Please confirm your password"),
  
  // Address Information
  address: z.string().min(5, "Complete street address is required"),
  addressLine2: z.string().optional(),
  city: z.string().min(2, "City is required"),
  province: z.string().min(1, "Province is required"),
  postalCode: z.string().min(4, "Valid postal code is required"),
  country: z.string().default("South Africa"),
  
  // Emergency Contact
  emergencyContactName: z.string().min(2, "Emergency contact full name is required"),
  emergencyContactPhone: z.string().min(10, "Emergency contact phone must be at least 10 digits"),
  emergencyContactRelationship: z.string().min(1, "Relationship is required"),
  emergencyContactEmail: z.string().email("Valid emergency contact email is required").optional().or(z.literal("")),
  emergencyContactAddress: z.string().min(5, "Emergency contact address is required"),
  
  // Church Information
  membershipType: z.string().min(1, "Please select membership type"),
  previousChurch: z.string().optional(),
  howDidYouHear: z.string().min(1, "Please tell us how you heard about us"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type MemberRegistrationForm = z.infer<typeof memberRegistrationSchema>;

// Static church data for public registration (connected to API data)
const sampleChurches = [
  {
    id: "1",
    name: "Grace Baptist Church",
    denomination: "Baptist",
    city: "Cape Town",
    province: "Western Cape",
    contactEmail: "info@gracebaptist.org.za",
    contactPhone: "+27 21 123 4567",
    memberCount: 450,
    status: "approved"
  },
  {
    id: "2",
    name: "New Life Methodist Church", 
    denomination: "Methodist",
    city: "Johannesburg",
    province: "Gauteng",
    contactEmail: "connect@newlifemethodist.co.za",
    contactPhone: "+27 11 987 6543",
    memberCount: 320,
    status: "approved"
  },
  {
    id: "3",
    name: "Faith Assembly Church",
    denomination: "Assembly", 
    city: "Durban",
    province: "KwaZulu-Natal",
    contactEmail: "welcome@faithassembly.org.za",
    contactPhone: "+27 31 456 7890",
    memberCount: 275,
    status: "approved"
  }
];

const membershipSteps = [
  { id: 1, title: "Church Selection", icon: Church },
  { id: 2, title: "Personal Information", icon: User },
  { id: 3, title: "Account Security", icon: Lock },
  { id: 4, title: "Address Information", icon: MapPin },
  { id: 5, title: "Complete Registration", icon: Shield },
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

const howDidYouHearOptions = [
  "Friend or Family Member",
  "Social Media",
  "Church Website", 
  "Church Event",
  "Pastor Invitation",
  "Community Outreach",
  "Google Search",
  "Other"
];

export default function PublicMemberRegistration() {
  const [currentStep, setCurrentStep] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedChurch, setSelectedChurch] = useState<typeof sampleChurches[0] | null>(null);
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const form = useForm<MemberRegistrationForm>({
    resolver: zodResolver(memberRegistrationSchema),
    defaultValues: {
      country: "South Africa",
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      dateOfBirth: "",
      password: "",
      confirmPassword: "",
      address: "",
      addressLine2: "",
      city: "",
      province: "",
      postalCode: "",
      emergencyContactName: "",
      emergencyContactPhone: "",
      emergencyContactRelationship: "",
      emergencyContactEmail: "",
      emergencyContactAddress: "",
      membershipType: "",
      previousChurch: "",
      howDidYouHear: "",
      churchId: "",
    },
  });

  // Handle address selection from Google Maps
  const handleAddressSelect = (addressComponents: any) => {
    form.setValue("address", addressComponents.address);
    form.setValue("city", addressComponents.city);
    form.setValue("province", addressComponents.province);
    form.setValue("postalCode", addressComponents.postalCode);
    form.setValue("country", addressComponents.country);
  };

  const filteredChurches = sampleChurches.filter(church =>
    church.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    church.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (church.denomination && church.denomination.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const submitRegistration = async (data: MemberRegistrationForm) => {
    setIsSubmitting(true);
    try {
      const response = await fetch("/api/members/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Registration failed");
      }

      const result = await response.json();

      toast({
        title: "Registration Successful!",
        description: `Welcome to ChurPay! You can now access your member dashboard.`,
        variant: "default",
      });

      // Store member info for dashboard access
      localStorage.setItem('churpayMember', JSON.stringify(result.user));
      
      // Redirect to member dashboard after successful registration
      setTimeout(() => {
        window.location.href = "/member-dashboard";
      }, 2000);
    } catch (error: any) {
      toast({
        title: "Registration Failed",
        description: error.message || "There was an error with your registration. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const onSubmit = (data: MemberRegistrationForm) => {
    submitRegistration(data);
  };

  const handleChurchSelect = (church: typeof sampleChurches[0]) => {
    setSelectedChurch(church);
    form.setValue("churchId", church.id);
    setCurrentStep(currentStep + 1);
  };

  const nextStep = async () => {
    // Validate current step before proceeding
    let fieldsToValidate: string[] = [];
    
    switch (currentStep) {
      case 1:
        fieldsToValidate = ['churchId'];
        break;
      case 2:
        fieldsToValidate = ['firstName', 'lastName', 'email', 'phone', 'dateOfBirth'];
        break;
      case 3:
        fieldsToValidate = ['password', 'confirmPassword'];
        break;
      case 4:
        fieldsToValidate = ['address', 'city', 'province', 'postalCode'];
        break;
      case 5:
        fieldsToValidate = ['emergencyContactName', 'emergencyContactPhone', 'emergencyContactRelationship', 'membershipType', 'howDidYouHear'];
        break;
    }
    
    const isValid = await form.trigger(fieldsToValidate as any);
    
    if (isValid && currentStep < membershipSteps.length) {
      setCurrentStep(currentStep + 1);
    } else if (!isValid) {
      toast({
        title: "Please complete all required fields",
        description: "Fill in all required information before proceeding to the next step.",
        variant: "destructive",
      });
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
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
                      ? 'bg-purple-600 border-purple-600 text-white' 
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
                      isActive ? 'text-purple-600' : isCompleted ? 'text-green-600' : 'text-gray-500'
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

        {/* Registration Content */}
        {currentStep === 4 ? (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Church className="h-5 w-5" />
                <span>Choose Your Church</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search churches by name, city, or denomination..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>

                <div className="grid gap-4 max-h-96 overflow-y-auto">
                  {filteredChurches.map((church) => (
                    <Card 
                      key={church.id} 
                      className="cursor-pointer hover:shadow-md transition-shadow"
                      onClick={() => handleChurchSelect(church)}
                    >
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <h3 className="font-semibold text-lg text-gray-900">{church.name}</h3>
                            <div className="flex items-center space-x-4 mt-2 text-sm text-gray-600">
                              <Badge variant="secondary">{church.denomination}</Badge>
                              <span className="flex items-center">
                                <MapPin className="h-3 w-3 mr-1" />
                                {church.city}, {church.province}
                              </span>
                              <span className="flex items-center">
                                <Users className="h-3 w-3 mr-1" />
                                {church.memberCount} members
                              </span>
                            </div>
                            <div className="mt-2 text-sm text-gray-500">
                              <div className="flex items-center">
                                <Mail className="h-3 w-3 mr-1" />
                                {church.contactEmail}
                              </div>
                              <div className="flex items-center mt-1">
                                <Phone className="h-3 w-3 mr-1" />
                                {church.contactPhone}
                              </div>
                            </div>
                          </div>
                          <Button size="sm" className="ml-4">
                            Join Church
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {filteredChurches.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <Church className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No churches found matching your search.</p>
                    <p className="text-sm mt-1">Try adjusting your search terms.</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                {membershipSteps.find(s => s.id === currentStep)?.icon && 
                  React.createElement(membershipSteps.find(s => s.id === currentStep)!.icon, { className: "h-5 w-5" })
                }
                <span>{membershipSteps.find(s => s.id === currentStep)?.title}</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  
                  {/* Step 2: Personal Information */}
                  {currentStep === 2 && (
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="email"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Email Address *</FormLabel>
                              <FormControl>
                                <Input type="email" placeholder="your@email.com" {...field} />
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
                                <Input placeholder="+27 xx xxx xxxx" {...field} />
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
                  )}

                  {/* Step 3: Account Security */}
                  {currentStep === 3 && (
                    <div className="space-y-6">
                      <div className="mb-4">
                        <h3 className="text-lg font-medium text-gray-900 mb-2">Account Security</h3>
                        <p className="text-sm text-gray-600">Create a secure password for your ChurPay account.</p>
                      </div>

                      <FormField
                        control={form.control}
                        name="password"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Password *</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Input 
                                  type={showPassword ? "text" : "password"}
                                  placeholder="Enter a secure password" 
                                  {...field} 
                                />
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                  onClick={() => setShowPassword(!showPassword)}
                                  aria-label={showPassword ? "Hide password" : "Show password"}
                                >
                                  {showPassword ? (
                                    <EyeOff className="h-4 w-4 text-gray-400" />
                                  ) : (
                                    <Eye className="h-4 w-4 text-gray-400" />
                                  )}
                                </Button>
                              </div>
                            </FormControl>
                            <div className="text-xs text-gray-600 mt-1">
                              Password must be at least 8 characters with uppercase, lowercase, number, and special character.
                            </div>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="confirmPassword"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Confirm Password *</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Input 
                                  type={showConfirmPassword ? "text" : "password"}
                                  placeholder="Confirm your password" 
                                  {...field} 
                                />
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                  aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                                >
                                  {showConfirmPassword ? (
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

                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <div className="flex items-start space-x-3">
                          <Shield className="h-5 w-5 text-blue-600 mt-0.5" />
                          <div>
                            <h4 className="text-sm font-medium text-blue-900">Secure Account</h4>
                            <p className="text-sm text-blue-700 mt-1">
                              Your password will be securely encrypted and stored. You'll use this to access your ChurPay member dashboard, make donations, and manage your digital wallet.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Step 4: Address Information */}
                  {currentStep === 4 && (
                    <div className="space-y-6">
                      <div className="mb-4">
                        <h3 className="text-lg font-medium text-gray-900 mb-2">Your Address</h3>
                        <p className="text-sm text-gray-600">Please provide your current residential address.</p>
                      </div>

                      <AddressAutocomplete
                        onAddressSelect={handleAddressSelect}
                        initialAddress={{
                          address: form.watch("address"),
                          city: form.watch("city"),
                          province: form.watch("province"),
                          postalCode: form.watch("postalCode"),
                          country: form.watch("country")
                        }}
                        placeholder="Start typing your address..."
                        label="Residential Address"
                      />

                      <FormField
                        control={form.control}
                        name="addressLine2"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Address Line 2 (Optional)</FormLabel>
                            <FormControl>
                              <Input placeholder="Apartment, suite, unit, building, floor, etc." {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* Manual Address Fields (hidden when using Google Maps) */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="city"
                          render={({ field }) => (
                            <FormItem className="hidden">
                              <FormLabel>City *</FormLabel>
                              <FormControl>
                                <Input {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="province"
                          render={({ field }) => (
                            <FormItem className="hidden">
                              <FormLabel>Province *</FormLabel>
                              <FormControl>
                                <Select onValueChange={field.onChange} value={field.value}>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select province" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {provinces.map((province) => (
                                      <SelectItem key={province} value={province}>
                                        {province}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="postalCode"
                          render={({ field }) => (
                            <FormItem className="hidden">
                              <FormLabel>Postal Code *</FormLabel>
                              <FormControl>
                                <Input {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="country"
                          render={({ field }) => (
                            <FormItem className="hidden">
                              <FormLabel>Country *</FormLabel>
                              <FormControl>
                                <Input {...field} readOnly />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                  )}

                  {/* Step 5: Emergency Contact */}
                  {currentStep === 5 && (
                    <div className="space-y-6">
                      <div className="mb-4">
                        <h3 className="text-lg font-medium text-gray-900 mb-2">Emergency Contact & Church Information</h3>
                        <p className="text-sm text-gray-600">Please provide emergency contact details and complete your church membership information.</p>
                      </div>

                      <FormField
                        control={form.control}
                        name="emergencyContactName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Full Name *</FormLabel>
                            <FormControl>
                              <Input placeholder="Emergency contact's full name" {...field} />
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
                              <FormLabel>Phone Number *</FormLabel>
                              <FormControl>
                                <Input placeholder="+27 xx xxx xxxx" {...field} />
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
                              <FormLabel>Relationship *</FormLabel>
                              <FormControl>
                                <Select onValueChange={field.onChange} value={field.value}>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select relationship" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {relationships.map((relationship) => (
                                      <SelectItem key={relationship} value={relationship.toLowerCase()}>
                                        {relationship}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <FormField
                        control={form.control}
                        name="emergencyContactEmail"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email Address (Optional)</FormLabel>
                            <FormControl>
                              <Input type="email" placeholder="emergency@contact.com" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="emergencyContactAddress"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Address *</FormLabel>
                            <FormControl>
                              <Input placeholder="Emergency contact's address" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="space-y-4">
                        <FormField
                          control={form.control}
                          name="membershipType"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Membership Type *</FormLabel>
                              <FormControl>
                                <Select onValueChange={field.onChange} value={field.value}>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select membership type" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {membershipTypes.map((type) => (
                                      <SelectItem key={type.value} value={type.value}>
                                        {type.label}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </FormControl>
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
                                <Input placeholder="If transferring, name of your previous church" {...field} />
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
                              <FormLabel>How did you hear about us? *</FormLabel>
                              <FormControl>
                                <Select onValueChange={field.onChange} value={field.value}>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select an option" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {howDidYouHearOptions.map((option) => (
                                      <SelectItem key={option} value={option.toLowerCase().replace(/\s+/g, '_')}>
                                        {option}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                  )}

                  {/* Navigation Buttons */}
                  <div className="flex justify-between">
                    {currentStep > 1 && (
                      <Button
                        type="button"
                        variant="outline"
                        onClick={prevStep}
                      >
                        Previous
                      </Button>
                    )}
                    {currentStep < membershipSteps.length ? (
                      <Button
                        type="button"
                        onClick={nextStep}
                        className="ml-auto bg-purple-600 hover:bg-purple-700 text-white"
                      >
                        Continue to Next Step
                      </Button>
                    ) : (
                      <Button
                        type="submit"
                        disabled={isSubmitting || !selectedChurch}
                        className="ml-auto bg-gradient-to-r from-purple-500 to-blue-600 text-white"
                      >
                        {isSubmitting ? "Registering..." : "Complete Registration"}
                      </Button>
                    )}
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}