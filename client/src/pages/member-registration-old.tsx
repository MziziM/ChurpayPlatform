import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
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
  Clock, 
  CheckCircle,
  Church,
  Mail,
  Phone,
  User,
  Shield,
  Heart
} from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

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
      firstName: "",
      lastName: "",
      email: "",
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

  // In a real implementation, this would fetch approved churches
  // For now, we'll show a message about church discovery
  const { data: churches = [], isLoading } = useQuery({
    queryKey: ["/api/churches", "approved"],
    enabled: false, // Disabled for now as we don't have this endpoint yet
  });

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

  // Mock data for demonstration - in production this would come from the API
  const mockChurches: Church[] = [
    {
      id: "1",
      name: "Grace Community Church",
      denomination: "Pentecostal",
      city: "Cape Town",
      province: "Western Cape",
      contactEmail: "admin@gracecommunity.org.za",
      contactPhone: "+27 21 123 4567",
      memberCount: 250,
      status: "approved"
    },
    {
      id: "2",
      name: "New Life Methodist Church",
      denomination: "Methodist",
      city: "Johannesburg",
      province: "Gauteng",
      contactEmail: "info@newlifemethodist.co.za",
      contactPhone: "+27 11 987 6543",
      memberCount: 180,
      status: "approved"
    },
    {
      id: "3",
      name: "Faith Baptist Church",
      denomination: "Baptist",
      city: "Durban",
      province: "KwaZulu-Natal",
      contactEmail: "contact@faithbaptist.org.za",
      contactPhone: "+27 31 555 0123",
      memberCount: 320,
      status: "approved"
    },
  ];

  const filteredChurches = mockChurches.filter(church =>
    church.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    church.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
    church.denomination?.toLowerCase().includes(searchQuery.toLowerCase())
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
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center">
                <Users className="h-4 w-4 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-semibold text-gray-900">Join a Church Community</h1>
                <p className="text-sm text-gray-600">Find and connect with your church</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <Card className="mb-8 bg-gradient-to-br from-yellow-50 to-orange-50 border-yellow-200">
          <CardContent className="p-6">
            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-xl flex items-center justify-center">
                <Users className="h-6 w-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-2">Welcome, {user?.firstName || user?.email || 'Friend'}!</h2>
                <p className="text-gray-700 mb-4">
                  Join your church community to start making secure donations, track your giving history, and support meaningful projects that make a difference.
                </p>
                <div className="flex flex-wrap gap-3 text-sm">
                  <div className="flex items-center space-x-2 text-green-700">
                    <CheckCircle className="h-4 w-4" />
                    <span>Secure digital wallet</span>
                  </div>
                  <div className="flex items-center space-x-2 text-blue-700">
                    <CheckCircle className="h-4 w-4" />
                    <span>Donation tracking & receipts</span>
                  </div>
                  <div className="flex items-center space-x-2 text-purple-700">
                    <CheckCircle className="h-4 w-4" />
                    <span>Support community projects</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Search Section */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Search className="h-5 w-5 text-churpay-purple" />
              <span>Find Your Church</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search by church name, city, or denomination..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        {/* Church List */}
        <div className="space-y-4 mb-8">
          {filteredChurches.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Church className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No churches found</h3>
                <p className="text-gray-600 mb-4">
                  {searchQuery ? 
                    "Try adjusting your search terms or contact us to help you find your church." :
                    "We're still building our church directory. Contact us to add your church to ChurPay."
                  }
                </p>
                <div className="flex items-center justify-center space-x-4 text-sm">
                  <a href="mailto:support@churpay.com" className="flex items-center text-churpay-purple hover:text-purple-700">
                    <Mail className="h-4 w-4 mr-1" />
                    support@churpay.com
                  </a>
                  <a href="tel:+27123456789" className="flex items-center text-churpay-purple hover:text-purple-700">
                    <Phone className="h-4 w-4 mr-1" />
                    +27 12 345 6789
                  </a>
                </div>
              </CardContent>
            </Card>
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
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4">
                      <div className="w-12 h-12 bg-churpay-gradient rounded-xl flex items-center justify-center">
                        <Church className="h-6 w-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <h3 className="text-lg font-semibold text-gray-900">{church.name}</h3>
                          {church.denomination && (
                            <Badge variant="secondary" className="text-xs">
                              {church.denomination}
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center space-x-4 text-sm text-gray-600 mb-2">
                          <div className="flex items-center space-x-1">
                            <MapPin className="h-4 w-4" />
                            <span>{church.city}, {church.province}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Users className="h-4 w-4" />
                            <span>{church.memberCount} members</span>
                          </div>
                        </div>
                        <div className="flex items-center space-x-4 text-sm">
                          <a 
                            href={`mailto:${church.contactEmail}`} 
                            className="flex items-center text-churpay-purple hover:text-purple-700"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <Mail className="h-4 w-4 mr-1" />
                            {church.contactEmail}
                          </a>
                          {church.contactPhone && (
                            <a 
                              href={`tel:${church.contactPhone}`} 
                              className="flex items-center text-churpay-purple hover:text-purple-700"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <Phone className="h-4 w-4 mr-1" />
                              {church.contactPhone}
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                    {selectedChurch?.id === church.id && (
                      <div className="flex items-center justify-center w-8 h-8 bg-churpay-purple rounded-full">
                        <CheckCircle className="h-5 w-5 text-white" />
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Join Church Section */}
        {selectedChurch && (
          <Card className="bg-green-50 border-green-200">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-green-900">
                <CheckCircle className="h-5 w-5" />
                <span>Ready to Join</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <p className="text-green-800 mb-2">
                  You've selected <strong>{selectedChurch.name}</strong> in {selectedChurch.city}, {selectedChurch.province}.
                </p>
                <p className="text-green-700 text-sm">
                  By joining this church, you'll be able to make secure donations, track your giving history, and support community projects.
                </p>
              </div>

              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="churchId"
                    render={({ field }) => (
                      <FormItem className="hidden">
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="flex justify-end space-x-3">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setSelectedChurch(null)}
                    >
                      Choose Different Church
                    </Button>
                    <Button
                      type="submit"
                      disabled={memberRegistrationMutation.isPending}
                      className="bg-green-600 hover:bg-green-700 text-white"
                    >
                      {memberRegistrationMutation.isPending ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                          Joining...
                        </>
                      ) : (
                        <>
                          <Users className="h-4 w-4 mr-2" />
                          Join Church
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        )}

        {/* Help Section */}
        <Card className="mt-8 bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
          <CardContent className="p-6">
            <h3 className="font-semibold text-blue-900 mb-2">Can't Find Your Church?</h3>
            <p className="text-blue-700 text-sm mb-4">
              If your church isn't listed, they may not be registered with ChurPay yet. Encourage your church leadership to sign up, or contact us for assistance.
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
