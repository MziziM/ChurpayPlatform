import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/Textarea";
import { Badge } from "@/components/ui/badge";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { 
  Building2, 
  Mail, 
  Phone, 
  MapPin,
  Users,
  Calendar,
  CheckCircle,
  ArrowRight,
  Shield,
  AlertCircle
} from "lucide-react";

interface ChurchProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ChurchProfile {
  id: string;
  name: string;
  denomination: string;
  address: string;
  city: string;
  province: string;
  postalCode: string;
  contactEmail: string;
  contactPhone: string;
  alternatePhone?: string;
  website?: string;
  registrationNumber: string;
  taxNumber?: string;
  bankName: string;
  accountNumber: string;
  branchCode: string;
  accountType: string;
  memberCount: number;
  foundedYear: string;
  description?: string;
  status: string;
  registrationDate: string;
}

export function ChurchProfileModal({
  isOpen,
  onClose
}: ChurchProfileModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [formData, setFormData] = useState<Partial<ChurchProfile>>({
    name: "",
    denomination: "",
    address: "",
    city: "",
    province: "",
    postalCode: "",
    contactEmail: "",
    contactPhone: "",
    alternatePhone: "",
    website: "",
    registrationNumber: "",
    taxNumber: "",
    bankName: "",
    accountNumber: "",
    branchCode: "",
    accountType: "",
    memberCount: 0,
    foundedYear: "",
    description: ""
  });

  // Fetch church profile data
  const { data: churchProfile, isLoading } = useQuery<ChurchProfile>({
    queryKey: ['/api/church/profile'],
    enabled: isOpen
  });

  // Update form when data loads
  useEffect(() => {
    if (churchProfile) {
      setFormData(churchProfile);
    }
  }, [churchProfile]);

  // Update church profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: async (data: Partial<ChurchProfile>) => {
      const response = await fetch('/api/church/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
      });
      
      if (!response.ok) {
        throw new Error('Failed to update profile');
      }
      
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Profile Updated",
        description: "Church profile has been successfully updated.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/church/profile'] });
      queryClient.invalidateQueries({ queryKey: ['/api/church/stats'] });
      onClose();
    },
    onError: (error: Error) => {
      toast({
        title: "Update Failed",
        description: error.message || "Failed to update church profile.",
        variant: "destructive",
      });
    }
  });

  const handleInputChange = (field: keyof ChurchProfile, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    if (!formData.name || !formData.contactEmail || !formData.contactPhone) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    updateProfileMutation.mutate(formData);
  };

  if (isLoading) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-2xl">
          <div className="flex items-center justify-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
            <span className="ml-3 text-gray-600">Loading church profile...</span>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Building2 className="h-5 w-5 text-purple-600" />
            <span>Church Profile Settings</span>
          </DialogTitle>
          <DialogDescription>
            Update your church information and banking details
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-8">
          {/* Status Badge */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Badge 
                variant={formData.status === 'approved' ? 'default' : 'secondary'}
                className={formData.status === 'approved' ? 'bg-green-100 text-green-800' : ''}
              >
                <Shield className="h-3 w-3 mr-1" />
                {formData.status === 'approved' ? 'Verified Church' : 'Pending Verification'}
              </Badge>
              <span className="text-sm text-gray-500">
                Member since {new Date(formData.registrationDate || '').toLocaleDateString()}
              </span>
            </div>
          </div>

          {/* Church Information */}
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Church Information</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="name">Church Name *</Label>
                <Input
                  id="name"
                  value={formData.name || ''}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="Enter church name"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="denomination">Denomination *</Label>
                <Select 
                  value={formData.denomination || ''} 
                  onValueChange={(value) => handleInputChange('denomination', value)}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select denomination" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="anglican">Anglican</SelectItem>
                    <SelectItem value="baptist">Baptist</SelectItem>
                    <SelectItem value="methodist">Methodist</SelectItem>
                    <SelectItem value="presbyterian">Presbyterian</SelectItem>
                    <SelectItem value="pentecostal">Pentecostal</SelectItem>
                    <SelectItem value="catholic">Catholic</SelectItem>
                    <SelectItem value="reformed">Reformed</SelectItem>
                    <SelectItem value="apostolic">Apostolic</SelectItem>
                    <SelectItem value="evangelical">Evangelical</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="memberCount">Current Member Count</Label>
                <Input
                  id="memberCount"
                  type="number"
                  value={formData.memberCount || ''}
                  onChange={(e) => handleInputChange('memberCount', parseInt(e.target.value) || 0)}
                  placeholder="Enter member count"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="foundedYear">Founded Year</Label>
                <Input
                  id="foundedYear"
                  type="number"
                  value={formData.foundedYear || ''}
                  onChange={(e) => handleInputChange('foundedYear', e.target.value)}
                  placeholder="YYYY"
                  className="mt-1"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="description">Church Description</Label>
              <Textarea
                id="description"
                value={formData.description || ''}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Brief description of your church mission and values..."
                className="mt-1"
                rows={3}
              />
            </div>
          </div>

          {/* Contact Information */}
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Contact Information</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="contactEmail">Primary Email *</Label>
                <div className="relative mt-1">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="contactEmail"
                    type="email"
                    value={formData.contactEmail || ''}
                    onChange={(e) => handleInputChange('contactEmail', e.target.value)}
                    placeholder="church@email.com"
                    className="pl-10"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="contactPhone">Primary Phone *</Label>
                <div className="relative mt-1">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="contactPhone"
                    value={formData.contactPhone || ''}
                    onChange={(e) => handleInputChange('contactPhone', e.target.value)}
                    placeholder="+27 21 555 0123"
                    className="pl-10"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="alternatePhone">Alternate Phone</Label>
                <Input
                  id="alternatePhone"
                  value={formData.alternatePhone || ''}
                  onChange={(e) => handleInputChange('alternatePhone', e.target.value)}
                  placeholder="+27 82 555 0123"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="website">Website</Label>
                <Input
                  id="website"
                  value={formData.website || ''}
                  onChange={(e) => handleInputChange('website', e.target.value)}
                  placeholder="https://www.church.co.za"
                  className="mt-1"
                />
              </div>
            </div>
          </div>

          {/* Address Information */}
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Physical Address</h3>
            
            <div>
              <Label htmlFor="address">Street Address *</Label>
              <div className="relative mt-1">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="address"
                  value={formData.address || ''}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  placeholder="123 Church Street"
                  className="pl-10"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <Label htmlFor="city">City *</Label>
                <Input
                  id="city"
                  value={formData.city || ''}
                  onChange={(e) => handleInputChange('city', e.target.value)}
                  placeholder="Cape Town"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="province">Province *</Label>
                <Select 
                  value={formData.province || ''} 
                  onValueChange={(value) => handleInputChange('province', value)}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select province" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="western-cape">Western Cape</SelectItem>
                    <SelectItem value="gauteng">Gauteng</SelectItem>
                    <SelectItem value="kzn">KwaZulu-Natal</SelectItem>
                    <SelectItem value="eastern-cape">Eastern Cape</SelectItem>
                    <SelectItem value="limpopo">Limpopo</SelectItem>
                    <SelectItem value="mpumalanga">Mpumalanga</SelectItem>
                    <SelectItem value="north-west">North West</SelectItem>
                    <SelectItem value="northern-cape">Northern Cape</SelectItem>
                    <SelectItem value="free-state">Free State</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="postalCode">Postal Code</Label>
                <Input
                  id="postalCode"
                  value={formData.postalCode || ''}
                  onChange={(e) => handleInputChange('postalCode', e.target.value)}
                  placeholder="8001"
                  className="mt-1"
                />
              </div>
            </div>
          </div>

          {/* Legal Information */}
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Legal Information</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="registrationNumber">NPO Registration Number *</Label>
                <Input
                  id="registrationNumber"
                  value={formData.registrationNumber || ''}
                  onChange={(e) => handleInputChange('registrationNumber', e.target.value)}
                  placeholder="NPO-123-456"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="taxNumber">Tax Number (Optional)</Label>
                <Input
                  id="taxNumber"
                  value={formData.taxNumber || ''}
                  onChange={(e) => handleInputChange('taxNumber', e.target.value)}
                  placeholder="123-456-789"
                  className="mt-1"
                />
              </div>
            </div>
          </div>

          {/* Banking Information */}
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Banking Information</h3>
            
            <div className="bg-amber-50 rounded-lg p-4 border border-amber-200">
              <div className="flex items-start space-x-3">
                <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-amber-900">Secure Banking Details</h4>
                  <p className="text-sm text-amber-700 mt-1">
                    Your banking information is encrypted and used only for payout processing.
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="bankName">Bank Name *</Label>
                <Select 
                  value={formData.bankName || ''} 
                  onValueChange={(value) => handleInputChange('bankName', value)}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select bank" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="absa">ABSA Bank</SelectItem>
                    <SelectItem value="fnb">First National Bank (FNB)</SelectItem>
                    <SelectItem value="standard">Standard Bank</SelectItem>
                    <SelectItem value="nedbank">Nedbank</SelectItem>
                    <SelectItem value="capitec">Capitec Bank</SelectItem>
                    <SelectItem value="investec">Investec</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="accountType">Account Type *</Label>
                <Select 
                  value={formData.accountType || ''} 
                  onValueChange={(value) => handleInputChange('accountType', value)}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select account type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cheque">Cheque Account</SelectItem>
                    <SelectItem value="savings">Savings Account</SelectItem>
                    <SelectItem value="current">Current Account</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="accountNumber">Account Number *</Label>
                <Input
                  id="accountNumber"
                  value={formData.accountNumber || ''}
                  onChange={(e) => handleInputChange('accountNumber', e.target.value)}
                  placeholder="1234567890"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="branchCode">Branch Code *</Label>
                <Input
                  id="branchCode"
                  value={formData.branchCode || ''}
                  onChange={(e) => handleInputChange('branchCode', e.target.value)}
                  placeholder="123456"
                  className="mt-1"
                />
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex space-x-3 pt-6 border-t">
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1"
              disabled={updateProfileMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              className="flex-1 bg-purple-600 hover:bg-purple-700"
              disabled={updateProfileMutation.isPending}
            >
              {updateProfileMutation.isPending ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Updating Profile...
                </>
              ) : (
                <>
                  Update Profile
                  <CheckCircle className="h-4 w-4 ml-2" />
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}