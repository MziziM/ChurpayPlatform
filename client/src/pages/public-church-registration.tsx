import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useLocation } from "wouter";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { 
  Church, 
  ArrowLeft, 
  CheckCircle, 
  Building2, 
  Mail, 
  Phone, 
  MapPin,
  CreditCard,
  FileText,
  Shield
} from "lucide-react";
import { AddressAutocomplete } from "@/components/AddressAutocomplete";
import { ObjectUploader } from "@/components/ObjectUploader";
import type { UploadResult } from "@uppy/core";
import { Upload, Image, CheckCircle2 } from "lucide-react";

const loginSchema = z.object({
  email: z.string().email("Valid email is required"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string().min(1, "Please confirm your password"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

const churchRegistrationSchema = z.object({
  // Step 1: Login Information (added to existing schema)
  email: z.string().email("Valid email is required"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string().min(1, "Please confirm your password"),
  
  // Church Information
  name: z.string().min(1, "Church name is required"),
  denomination: z.string().min(1, "Denomination is required"),
  registrationNumber: z.string().min(1, "NPO/PBO registration number is required"),
  taxNumber: z.string().min(1, "Tax clearance number is required"),
  yearEstablished: z.string().min(4, "Year established is required"),
  
  // Contact Information
  contactEmail: z.string().email("Valid email is required"),
  contactPhone: z.string().min(1, "Contact phone is required"),
  alternativePhone: z.string().optional(),
  website: z.string().url().optional().or(z.literal("")),
  
  // Address Information
  address: z.string().min(1, "Street address is required"),
  city: z.string().min(1, "City is required"),
  province: z.string().min(1, "Province is required"),
  postalCode: z.string().min(1, "Postal code is required"),
  country: z.string().default("South Africa"),
  
  // Administrative Contact
  adminFirstName: z.string().min(1, "Admin first name is required"),
  adminLastName: z.string().min(1, "Admin last name is required"),
  adminEmail: z.string().email("Valid admin email is required"),
  adminPhone: z.string().min(1, "Admin phone is required"),
  adminPosition: z.string().min(1, "Admin position/title is required"),
  
  // Church Details (REQUIRED BY SCHEMA)
  memberCount: z.number().min(1, "Member count is required"),
  description: z.string().min(1, "Brief description is required"),
  servicesTimes: z.string().min(1, "Service times are required"),
  leadPastor: z.string().min(1, "Lead pastor name is required"),
  
  // Church logo upload
  logoUrl: z.string().optional(),
  
  // Banking Information
  bankName: z.string().min(1, "Bank name is required"),
  accountHolder: z.string().min(1, "Account holder name is required"),
  accountNumber: z.string().min(1, "Account number is required"),
  branchCode: z.string().min(1, "Branch code is required"),
  accountType: z.string().min(1, "Account type is required"),
  
  // Document file uploads
  cipcDocument: z.string().optional(),
  bankConfirmationLetter: z.string().optional(),
  taxClearanceCertificate: z.string().optional(),
  
  // Documents (required for verification)
  hasNpoRegistration: z.boolean().refine(val => val === true, "NPO registration certificate is required"),
  hasTaxClearance: z.boolean().refine(val => val === true, "Tax clearance certificate is required"),
  hasBankConfirmation: z.boolean().refine(val => val === true, "Bank confirmation letter is required"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type ChurchRegistrationForm = z.infer<typeof churchRegistrationSchema>;

const steps = [
  { id: 1, title: "Create Account", icon: Shield },
  { id: 2, title: "Church Information", icon: Church },
  { id: 3, title: "Contact & Address", icon: Mail },
  { id: 4, title: "Administrative Details", icon: Shield },
  { id: 5, title: "Banking Information", icon: CreditCard },
  { id: 6, title: "Document Verification", icon: FileText },
];

export default function PublicChurchRegistration() {
  const [currentStep, setCurrentStep] = useState(1);
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);


  const [uploadedDocuments, setUploadedDocuments] = useState<{
    logo?: string;
    cipcDocument?: string;
    bankConfirmationLetter?: string;
    taxClearanceCertificate?: string;
  }>({});

  const form = useForm<ChurchRegistrationForm>({
    resolver: zodResolver(churchRegistrationSchema),
    defaultValues: {
      // Step 1: Login Information
      email: "",
      password: "",
      confirmPassword: "",
      
      // Church Information
      name: "",
      denomination: "",
      registrationNumber: "",
      taxNumber: "",
      yearEstablished: "",
      
      // Contact Information
      contactEmail: "",
      contactPhone: "",
      alternativePhone: "",
      website: "",
      
      // Address Information
      address: "",
      city: "",
      province: "",
      postalCode: "",
      country: "South Africa",
      
      // Administrative Contact
      adminFirstName: "",
      adminLastName: "",
      adminEmail: "",
      adminPhone: "",
      adminPosition: "",
      
      // Church Details
      memberCount: 1,
      description: "",
      servicesTimes: "",
      leadPastor: "",
      logoUrl: "",
      
      // Banking Information
      bankName: "",
      accountHolder: "",
      accountNumber: "",
      branchCode: "",
      accountType: "",
      
      // Document file uploads
      cipcDocument: "",
      bankConfirmationLetter: "",
      taxClearanceCertificate: "",
      
      // Documents (required for verification)
      hasNpoRegistration: false,
      hasTaxClearance: false,
      hasBankConfirmation: false,
    },
  });

  // Handle file upload completion
  const handleFileUpload = async (documentType: string, result: UploadResult<Record<string, unknown>, Record<string, unknown>>) => {
    if (result.successful && result.successful.length > 0) {
      const uploadedFile = result.successful[0];
      const uploadUrl = uploadedFile.uploadURL;
      
      setUploadedDocuments(prev => ({
        ...prev,
        [documentType]: uploadUrl
      }));
      
      // Update form with the uploaded file URL
      form.setValue(documentType as any, uploadUrl);
      
      toast({
        title: "File uploaded successfully",
        description: `Your ${documentType} has been uploaded.`,
      });
    }
  };

  // Get upload parameters for object storage
  const getUploadParameters = async () => {
    const response = await fetch("/api/objects/upload", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    });
    
    if (!response.ok) {
      throw new Error("Failed to get upload URL");
    }
    
    const data = await response.json();
    return {
      method: "PUT" as const,
      url: data.uploadURL,
    };
  };

  const submitRegistration = async (data: ChurchRegistrationForm) => {
    setIsSubmitting(true);
    try {
      // Include uploaded document URLs in the submission
      const submissionData = {
        ...data,
        logo: uploadedDocuments.logo,
        cipcDocument: uploadedDocuments.cipcDocument,
        bankConfirmationLetter: uploadedDocuments.bankConfirmationLetter,
        taxClearanceCertificate: uploadedDocuments.taxClearanceCertificate
      };
      
      console.log('📄 Submitting church registration with documents:', {
        logo: submissionData.logo,
        cipcDocument: submissionData.cipcDocument,
        bankConfirmationLetter: submissionData.bankConfirmationLetter,
        taxClearanceCertificate: submissionData.taxClearanceCertificate
      });
      
      const response = await fetch("/api/churches/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(submissionData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Registration failed");
      }

      toast({
        title: "Registration Submitted!",
        description: "Your church registration has been submitted for review. You will be contacted once approved.",
        variant: "default",
      });
      
      // Redirect to home after successful registration
      setTimeout(() => {
        setLocation("/");
      }, 3000);
    } catch (error: any) {
      toast({
        title: "Registration Failed",
        description: error.message || "There was an error registering your church. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const onSubmit = (data: ChurchRegistrationForm) => {
    submitRegistration(data);
  };

  const nextStep = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  // Step 1: Create Account Form
  const renderCreateAccountStep = () => (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Create Your Church Account</h2>
        <p className="text-gray-600">Start by creating a secure account with your email and password</p>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-gray-700 font-medium">Church Email Address *</FormLabel>
              <FormControl>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input 
                    {...field} 
                    type="email"
                    placeholder="info@yourchurch.org"
                    className="pl-10 h-12 border-gray-300 focus:border-purple-500"
                  />
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-gray-700 font-medium">Password *</FormLabel>
              <FormControl>
                <div className="relative">
                  <Shield className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    {...field}
                    type="password"
                    placeholder="Create a strong password"
                    className="pl-10 h-12 border-gray-300 focus:border-purple-500"
                  />
                </div>
              </FormControl>
              <FormMessage />
              <p className="text-xs text-gray-500 mt-1">
                Must contain 8+ characters with uppercase, lowercase, number, and special character
              </p>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="confirmPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-gray-700 font-medium">Confirm Password *</FormLabel>
              <FormControl>
                <div className="relative">
                  <Shield className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    {...field}
                    type="password"
                    placeholder="Confirm your password"
                    className="pl-10 h-12 border-gray-300 focus:border-purple-500"
                  />
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
        <div className="flex items-start space-x-2">
          <Shield className="w-5 h-5 text-blue-600 mt-0.5" />
          <div>
            <h4 className="text-sm font-medium text-blue-900">Secure Registration</h4>
            <p className="text-xs text-blue-700 mt-1">
              Your information is encrypted and secure. Complete all steps to access the full platform.
            </p>
          </div>
        </div>
      </div>
    </div>
  );

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
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center">
                <Church className="h-4 w-4 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-semibold text-gray-900">Church Registration</h1>
                <p className="text-sm text-gray-600">Step {currentStep} of {steps.length}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => {
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
                  {index < steps.length - 1 && (
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

        {/* Registration Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              {React.createElement(steps.find(s => s.id === currentStep)!.icon, { className: "h-5 w-5" })}
              <span>{steps.find(s => s.id === currentStep)!.title}</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                
                {/* Step 1: Create Account */}
                {currentStep === 1 && renderCreateAccountStep()}

                {/* Step 2: Church Information */}
                {currentStep === 2 && (
                  <div className="space-y-4">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Church Name *</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter your church name" {...field} />
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
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select denomination" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="anglican">Anglican</SelectItem>
                              <SelectItem value="baptist">Baptist</SelectItem>
                              <SelectItem value="methodist">Methodist</SelectItem>
                              <SelectItem value="presbyterian">Presbyterian</SelectItem>
                              <SelectItem value="pentecostal">Pentecostal</SelectItem>
                              <SelectItem value="catholic">Catholic</SelectItem>
                              <SelectItem value="reformed">Reformed</SelectItem>
                              <SelectItem value="evangelical">Evangelical</SelectItem>
                              <SelectItem value="other">Other</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="registrationNumber"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>NPO/PBO Registration Number *</FormLabel>
                            <FormControl>
                              <Input placeholder="NPO-123-456" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="taxNumber"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Tax Clearance Number *</FormLabel>
                            <FormControl>
                              <Input placeholder="Tax clearance reference" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="yearEstablished"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Year Established *</FormLabel>
                            <FormControl>
                              <Input 
                                type="number" 
                                placeholder="2020" 
                                min="1800" 
                                max={new Date().getFullYear()}
                                {...field} 
                              />
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
                            <FormControl>
                              <Input 
                                type="number" 
                                placeholder="100" 
                                min="1"
                                {...field} 
                                onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                              />
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
                          <FormLabel>Brief Description *</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Tell us about your church, its mission, and community..."
                              className="resize-none"
                              rows={3}
                              {...field} 
                            />
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
                            <Input placeholder="Pastor John Smith" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="servicesTimes"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Service Times *</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Sunday: 9:00 AM & 11:00 AM&#10;Wednesday Prayer: 7:00 PM"
                              className="resize-none"
                              rows={3}
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Church Logo Upload */}
                    <div className="space-y-2">
                      <FormLabel>Church Logo (Optional)</FormLabel>
                      <div className="flex items-center space-x-4">
                        <ObjectUploader
                          maxNumberOfFiles={1}
                          maxFileSize={5242880} // 5MB
                          onGetUploadParameters={getUploadParameters}
                          onComplete={(result) => handleFileUpload("logo", result)}
                          buttonClassName="bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-200"
                        >
                          <Image className="h-4 w-4 mr-2" />
                          Upload Logo
                        </ObjectUploader>
                        {uploadedDocuments.logo && (
                          <div className="flex items-center text-green-600">
                            <CheckCircle2 className="h-4 w-4 mr-1" />
                            <span className="text-sm">Logo uploaded</span>
                          </div>
                        )}
                      </div>
                      <p className="text-sm text-gray-500">Upload your church logo (PNG, JPG - max 5MB)</p>
                    </div>
                  </div>
                )}

                {/* Step 2: Contact & Address */}
                {currentStep === 3 && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="contactEmail"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Contact Email *</FormLabel>
                            <FormControl>
                              <Input type="email" placeholder="info@yourchurch.org" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="contactPhone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Contact Phone *</FormLabel>
                            <FormControl>
                              <Input placeholder="+27 11 123 4567" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="alternativePhone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Alternative Phone (Optional)</FormLabel>
                            <FormControl>
                              <Input placeholder="+27 82 123 4567" {...field} />
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
                    </div>

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

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <FormField
                        control={form.control}
                        name="city"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>City *</FormLabel>
                            <FormControl>
                              <Input placeholder="Cape Town" {...field} />
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
                                <SelectItem value="western_cape">Western Cape</SelectItem>
                                <SelectItem value="gauteng">Gauteng</SelectItem>
                                <SelectItem value="kwazulu_natal">KwaZulu-Natal</SelectItem>
                                <SelectItem value="eastern_cape">Eastern Cape</SelectItem>
                                <SelectItem value="limpopo">Limpopo</SelectItem>
                                <SelectItem value="mpumalanga">Mpumalanga</SelectItem>
                                <SelectItem value="north_west">North West</SelectItem>
                                <SelectItem value="northern_cape">Northern Cape</SelectItem>
                                <SelectItem value="free_state">Free State</SelectItem>
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
                              <Input placeholder="8001" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                )}

                {/* Step 3: Administrative Details */}
                {currentStep === 4 && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="adminFirstName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Admin First Name *</FormLabel>
                            <FormControl>
                              <Input placeholder="John" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="adminLastName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Admin Last Name *</FormLabel>
                            <FormControl>
                              <Input placeholder="Smith" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="adminEmail"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Admin Email *</FormLabel>
                          <FormControl>
                            <Input type="email" placeholder="admin@yourchurch.org" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="adminPhone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Admin Phone *</FormLabel>
                            <FormControl>
                              <Input placeholder="+27 82 123 4567" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="adminPosition"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Position/Title *</FormLabel>
                            <FormControl>
                              <Input placeholder="Pastor, Administrator, etc." {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                )}

                {/* Step 4: Banking Information */}
                {currentStep === 5 && (
                  <div className="space-y-4">
                    <FormField
                      control={form.control}
                      name="bankName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Bank Name *</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select your bank" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="standard_bank">Standard Bank</SelectItem>
                              <SelectItem value="fnb">FNB</SelectItem>
                              <SelectItem value="absa">ABSA</SelectItem>
                              <SelectItem value="nedbank">Nedbank</SelectItem>
                              <SelectItem value="capitec">Capitec Bank</SelectItem>
                              <SelectItem value="investec">Investec</SelectItem>
                              <SelectItem value="discovery_bank">Discovery Bank</SelectItem>
                              <SelectItem value="african_bank">African Bank</SelectItem>
                              <SelectItem value="other">Other</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="accountHolder"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Account Holder Name *</FormLabel>
                          <FormControl>
                            <Input placeholder="Church or organization name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="accountNumber"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Account Number *</FormLabel>
                            <FormControl>
                              <Input placeholder="Account number" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="branchCode"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Branch Code *</FormLabel>
                            <FormControl>
                              <Input placeholder="Branch code" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="accountType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Account Type *</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select account type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="current">Current Account</SelectItem>
                              <SelectItem value="savings">Savings Account</SelectItem>
                              <SelectItem value="transmission">Transmission Account</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                )}

                {/* Step 5: Document Verification */}
                {currentStep === 6 && (
                  <div className="space-y-6">
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <p className="text-blue-800 text-sm">
                        Please confirm that you have the following required documents ready for upload and verification:
                      </p>
                    </div>

                    <div className="space-y-4">
                      <FormField
                        control={form.control}
                        name="hasNpoRegistration"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                            <FormControl>
                              <input
                                type="checkbox"
                                checked={field.value}
                                onChange={field.onChange}
                                className="mt-1"
                              />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                              <FormLabel className="font-medium">
                                NPO/PBO Registration Certificate *
                              </FormLabel>
                              <p className="text-sm text-gray-600">
                                I confirm that I have the NPO/PBO registration certificate ready for verification.
                              </p>
                            </div>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="hasTaxClearance"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                            <FormControl>
                              <input
                                type="checkbox"
                                checked={field.value}
                                onChange={field.onChange}
                                className="mt-1"
                              />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                              <FormLabel className="font-medium">
                                Tax Clearance Certificate *
                              </FormLabel>
                              <p className="text-sm text-gray-600">
                                I confirm that I have a valid tax clearance certificate ready for verification.
                              </p>
                            </div>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="hasBankConfirmation"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                            <FormControl>
                              <input
                                type="checkbox"
                                checked={field.value}
                                onChange={field.onChange}
                                className="mt-1"
                              />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                              <FormLabel className="font-medium">
                                Bank Confirmation Letter *
                              </FormLabel>
                              <p className="text-sm text-gray-600">
                                I confirm that I have an official bank confirmation letter ready for verification.
                              </p>
                            </div>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    {/* Document Upload Section */}
                    <div className="space-y-6 mt-8">
                      <h4 className="text-lg font-semibold text-gray-900">Upload Required Documents</h4>
                      
                      {/* NPO/PBO Registration Certificate */}
                      <div className="space-y-2">
                        <FormLabel>NPO/PBO Registration Certificate *</FormLabel>
                        <div className="flex items-center space-x-4">
                          <ObjectUploader
                            maxNumberOfFiles={1}
                            maxFileSize={10485760} // 10MB
                            onGetUploadParameters={getUploadParameters}
                            onComplete={(result) => handleFileUpload("cipcDocument", result)}
                            buttonClassName="bg-green-50 hover:bg-green-100 text-green-700 border-green-200"
                          >
                            <Upload className="h-4 w-4 mr-2" />
                            Upload NPO Certificate
                          </ObjectUploader>
                          {uploadedDocuments.cipcDocument && (
                            <div className="flex items-center text-green-600">
                              <CheckCircle2 className="h-4 w-4 mr-1" />
                              <span className="text-sm">Certificate uploaded</span>
                            </div>
                          )}
                        </div>
                        <p className="text-sm text-gray-500">Upload your NPO/PBO registration certificate (PDF - max 10MB)</p>
                      </div>

                      {/* Tax Clearance Certificate */}
                      <div className="space-y-2">
                        <FormLabel>Tax Clearance Certificate *</FormLabel>
                        <div className="flex items-center space-x-4">
                          <ObjectUploader
                            maxNumberOfFiles={1}
                            maxFileSize={10485760} // 10MB
                            onGetUploadParameters={getUploadParameters}
                            onComplete={(result) => handleFileUpload("taxClearanceCertificate", result)}
                            buttonClassName="bg-purple-50 hover:bg-purple-100 text-purple-700 border-purple-200"
                          >
                            <Upload className="h-4 w-4 mr-2" />
                            Upload Tax Certificate
                          </ObjectUploader>
                          {uploadedDocuments.taxClearanceCertificate && (
                            <div className="flex items-center text-green-600">
                              <CheckCircle2 className="h-4 w-4 mr-1" />
                              <span className="text-sm">Certificate uploaded</span>
                            </div>
                          )}
                        </div>
                        <p className="text-sm text-gray-500">Upload your tax clearance certificate (PDF - max 10MB)</p>
                      </div>

                      {/* Bank Confirmation Letter */}
                      <div className="space-y-2">
                        <FormLabel>Bank Confirmation Letter *</FormLabel>
                        <div className="flex items-center space-x-4">
                          <ObjectUploader
                            maxNumberOfFiles={1}
                            maxFileSize={10485760} // 10MB
                            onGetUploadParameters={getUploadParameters}
                            onComplete={(result) => handleFileUpload("bankConfirmationLetter", result)}
                            buttonClassName="bg-orange-50 hover:bg-orange-100 text-orange-700 border-orange-200"
                          >
                            <Upload className="h-4 w-4 mr-2" />
                            Upload Bank Letter
                          </ObjectUploader>
                          {uploadedDocuments.bankConfirmationLetter && (
                            <div className="flex items-center text-green-600">
                              <CheckCircle2 className="h-4 w-4 mr-1" />
                              <span className="text-sm">Letter uploaded</span>
                            </div>
                          )}
                        </div>
                        <p className="text-sm text-gray-500">Upload your bank confirmation letter (PDF - max 10MB)</p>
                      </div>
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
                  {currentStep < steps.length ? (
                    <Button
                      type="button"
                      onClick={nextStep}
                      className="ml-auto bg-purple-600 hover:bg-purple-700 text-white"
                    >
                      Next
                    </Button>
                  ) : (
                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="ml-auto bg-gradient-to-r from-purple-500 to-blue-600 text-white"
                    >
                      {isSubmitting ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                          Submitting...
                        </>
                      ) : (
                        <>
                          Submit Registration
                        </>
                      )}
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