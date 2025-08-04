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

const churchRegistrationSchema = z.object({
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
  
  // Church Details
  memberCount: z.number().min(1, "Member count is required"),
  description: z.string().min(1, "Brief description is required"),
  
  // Banking Information
  bankName: z.string().min(1, "Bank name is required"),
  accountHolder: z.string().min(1, "Account holder name is required"),
  accountNumber: z.string().min(1, "Account number is required"),
  branchCode: z.string().min(1, "Branch code is required"),
  
  // Documents (required for verification)
  hasNpoRegistration: z.boolean().refine(val => val === true, "NPO registration certificate is required"),
  hasTaxClearance: z.boolean().refine(val => val === true, "Tax clearance certificate is required"),
  hasBankConfirmation: z.boolean().refine(val => val === true, "Bank confirmation letter is required"),
});

type ChurchRegistrationForm = z.infer<typeof churchRegistrationSchema>;

const steps = [
  { id: 1, title: "Church Information", icon: Church },
  { id: 2, title: "Contact & Address", icon: Mail },
  { id: 3, title: "Administrative Details", icon: Shield },
  { id: 4, title: "Banking Information", icon: CreditCard },
  { id: 5, title: "Document Verification", icon: FileText },
];

export default function PublicChurchRegistration() {
  const [currentStep, setCurrentStep] = useState(1);
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<ChurchRegistrationForm>({
    resolver: zodResolver(churchRegistrationSchema),
    defaultValues: {
      country: "South Africa",
      memberCount: 1,
      hasNpoRegistration: false,
      hasTaxClearance: false,
      hasBankConfirmation: false,
    },
  });

  const submitRegistration = async (data: ChurchRegistrationForm) => {
    setIsSubmitting(true);
    try {
      const response = await fetch("/api/churches/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Registration failed");
      }

      toast({
        title: "Registration Submitted!",
        description: "Your church registration has been submitted for review. Please sign in to track the status and complete your setup once approved.",
        variant: "default",
      });
      
      // Redirect to login after successful registration
      setTimeout(() => {
        window.location.href = "/api/login";
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
                
                {/* Step 1: Church Information */}
                {currentStep === 1 && (
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