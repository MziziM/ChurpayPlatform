import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";
import { isUnauthorizedError } from "@/lib/authUtils";
import { 
  Church, 
  ArrowLeft, 
  Upload, 
  CheckCircle, 
  Building2, 
  Mail, 
  Phone, 
  MapPin,
  CreditCard,
  FileText,
  Shield
} from "lucide-react";

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
  
  // Physical Address
  address: z.string().min(1, "Street address is required"),
  city: z.string().min(1, "City is required"),
  province: z.string().min(1, "Province is required"),
  postalCode: z.string().min(1, "Postal code is required"),
  country: z.string().default("South Africa"),
  
  // Banking Information
  bankName: z.string().min(1, "Bank name is required"),
  accountNumber: z.string().min(1, "Account number is required"),
  branchCode: z.string().min(1, "Branch code is required"),
  accountHolder: z.string().min(1, "Account holder name is required"),
  accountType: z.string().min(1, "Account type is required"),
  
  // Church Details
  description: z.string().min(10, "Please provide a brief description (minimum 10 characters)"),
  memberCount: z.number().min(1, "Estimated member count is required"),
  servicesTimes: z.string().min(1, "Service times are required"),
  leadPastor: z.string().min(1, "Lead pastor name is required"),
  
  // Administrative Contact
  adminFirstName: z.string().min(1, "Admin first name is required"),
  adminLastName: z.string().min(1, "Admin last name is required"),
  adminEmail: z.string().email("Valid admin email is required"),
  adminPhone: z.string().min(1, "Admin phone is required"),
  adminPosition: z.string().min(1, "Admin position/title is required"),
  
  // Documents (required for verification)
  hasNpoRegistration: z.boolean().refine(val => val === true, "NPO registration certificate is required"),
  hasTaxClearance: z.boolean().refine(val => val === true, "Tax clearance certificate is required"),
  hasBankConfirmation: z.boolean().refine(val => val === true, "Bank confirmation letter is required"),
});

type ChurchRegistrationForm = z.infer<typeof churchRegistrationSchema>;

const steps = [
  { id: 1, title: "Church Information", icon: Church },
  { id: 2, title: "Contact Details", icon: Mail },
  { id: 3, title: "Banking Information", icon: CreditCard },
  { id: 4, title: "Documents", icon: FileText },
];

export default function ChurchRegistration() {
  const [currentStep, setCurrentStep] = useState(1);
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { user } = useAuth();

  const form = useForm<ChurchRegistrationForm>({
    resolver: zodResolver(churchRegistrationSchema),
    defaultValues: {
      country: "South Africa",
      memberCount: 0,
    },
  });

  const churchRegistrationMutation = useMutation({
    mutationFn: async (data: ChurchRegistrationForm) => {
      const response = await apiRequest("POST", "/api/churches", data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success!",
        description: "Your church registration has been submitted for review. You'll receive an email notification once it's processed.",
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
        description: error.message || "There was an error registering your church. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: ChurchRegistrationForm) => {
    churchRegistrationMutation.mutate(data);
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

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Church Name *</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Grace Community Church" {...field} />
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
                  <FormLabel>Denomination</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select denomination (optional)" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="anglican">Anglican</SelectItem>
                      <SelectItem value="baptist">Baptist</SelectItem>
                      <SelectItem value="catholic">Catholic</SelectItem>
                      <SelectItem value="charismatic">Charismatic</SelectItem>
                      <SelectItem value="methodist">Methodist</SelectItem>
                      <SelectItem value="pentecostal">Pentecostal</SelectItem>
                      <SelectItem value="presbyterian">Presbyterian</SelectItem>
                      <SelectItem value="reformed">Reformed</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="registrationNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>CIPC Registration Number *</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. 2021/123456/08" {...field} />
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
                    <FormLabel>Tax Number</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. 9012345678" {...field} />
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
                  <FormLabel>Church Description</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Tell us about your church, mission, and community..."
                      className="min-h-[100px]"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="website"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Website</FormLabel>
                    <FormControl>
                      <Input placeholder="https://www.yourchurch.org.za" {...field} />
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
                    <FormLabel>Approximate Member Count</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        placeholder="e.g. 150"
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="contactEmail"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contact Email *</FormLabel>
                    <FormControl>
                      <Input placeholder="admin@yourchurch.org.za" {...field} />
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
                      <Input placeholder="+27 12 345 6789" {...field} />
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

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
                        <SelectItem value="western-cape">Western Cape</SelectItem>
                        <SelectItem value="eastern-cape">Eastern Cape</SelectItem>
                        <SelectItem value="northern-cape">Northern Cape</SelectItem>
                        <SelectItem value="free-state">Free State</SelectItem>
                        <SelectItem value="kwazulu-natal">KwaZulu-Natal</SelectItem>
                        <SelectItem value="north-west">North West</SelectItem>
                        <SelectItem value="gauteng">Gauteng</SelectItem>
                        <SelectItem value="mpumalanga">Mpumalanga</SelectItem>
                        <SelectItem value="limpopo">Limpopo</SelectItem>
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

            <FormField
              control={form.control}
              name="country"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Country *</FormLabel>
                  <FormControl>
                    <Input {...field} disabled />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <div className="flex items-start space-x-3">
                <Shield className="h-5 w-5 text-blue-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-blue-900">Secure Banking Information</h4>
                  <p className="text-sm text-blue-700 mt-1">
                    Your banking details are encrypted and securely stored. This information is required for payout processing.
                  </p>
                </div>
              </div>
            </div>

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
                      <SelectItem value="absa">ABSA Bank</SelectItem>
                      <SelectItem value="standard-bank">Standard Bank</SelectItem>
                      <SelectItem value="fnb">FNB (First National Bank)</SelectItem>
                      <SelectItem value="nedbank">Nedbank</SelectItem>
                      <SelectItem value="capitec">Capitec Bank</SelectItem>
                      <SelectItem value="investec">Investec</SelectItem>
                      <SelectItem value="discovery">Discovery Bank</SelectItem>
                      <SelectItem value="african-bank">African Bank</SelectItem>
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
                    <Input placeholder="Exact name as it appears on bank account" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="accountNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Account Number *</FormLabel>
                    <FormControl>
                      <Input placeholder="1234567890" {...field} />
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
                      <Input placeholder="123456" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
              <div className="flex items-start space-x-3">
                <FileText className="h-5 w-5 text-amber-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-amber-900">Required Documents</h4>
                  <p className="text-sm text-amber-700 mt-1">
                    For now, please note the documents you'll need to provide. File upload functionality will be available after initial registration.
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="border border-gray-200 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-2">1. CIPC Certificate of Incorporation</h4>
                <p className="text-sm text-gray-600">
                  Official certificate showing your church is registered as a non-profit organization.
                </p>
              </div>

              <div className="border border-gray-200 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-2">2. Bank Confirmation Letter</h4>
                <p className="text-sm text-gray-600">
                  Official letter from your bank confirming account details and account holder.
                </p>
              </div>

              <div className="border border-gray-200 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-2">3. Tax Clearance Certificate (if applicable)</h4>
                <p className="text-sm text-gray-600">
                  Valid tax clearance certificate from SARS if your church is registered for tax.
                </p>
              </div>
            </div>

            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-green-900">Next Steps</h4>
                  <p className="text-sm text-green-700 mt-1">
                    After submitting this form, our team will contact you within 48 hours to assist with document upload and verification.
                  </p>
                </div>
              </div>
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
              <div className="w-8 h-8 rounded-lg bg-churpay-gradient flex items-center justify-center">
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

        {/* Form */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              {React.createElement(steps[currentStep - 1].icon, { className: "h-5 w-5 text-churpay-purple" })}
              <span>{steps[currentStep - 1].title}</span>
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

                  {currentStep < steps.length ? (
                    <Button
                      type="button"
                      onClick={nextStep}
                      className="bg-churpay-gradient text-white"
                    >
                      Next
                    </Button>
                  ) : (
                    <Button
                      type="submit"
                      disabled={churchRegistrationMutation.isPending}
                      className="bg-churpay-gradient text-white"
                    >
                      {churchRegistrationMutation.isPending ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                          Submitting...
                        </>
                      ) : (
                        <>
                          <CheckCircle className="h-4 w-4 mr-2" />
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

        {/* Help Section */}
        <Card className="mt-6 bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
          <CardContent className="p-6">
            <h3 className="font-semibold text-blue-900 mb-2">Need Help?</h3>
            <p className="text-blue-700 text-sm mb-4">
              Our team is here to assist you with the registration process. Feel free to reach out if you have any questions.
            </p>
            <div className="flex items-center space-x-4 text-sm">
              <a href="mailto:support@churpay.com" className="flex items-center text-blue-600 hover:text-blue-800">
                <Mail className="h-4 w-4 mr-1" />
                support@churpay.com
              </a>
              <a href="tel:+27123456789" className="flex items-center text-blue-600 hover:text-blue-800">
                <Phone className="h-4 w-4 mr-1" />
                +27 12 345 6789
              </a>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
