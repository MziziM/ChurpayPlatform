import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/Textarea";
import { Badge } from "@/components/ui/badge";
import { 
  UserPlus, 
  Mail, 
  Phone, 
  MapPin,
  Calendar,
  Users,
  CheckCircle,
  ArrowRight
} from "lucide-react";

interface ChurchMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ChurchMemberModal({
  isOpen,
  onClose
}: ChurchMemberModalProps) {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    dateOfBirth: "",
    address: "",
    city: "",
    province: "",
    membershipType: "",
    previousChurch: "",
    emergencyContact: "",
    emergencyPhone: "",
    notes: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsSubmitting(false);
    onClose();
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <UserPlus className="h-5 w-5 text-blue-600" />
            <span>Add New Member</span>
          </DialogTitle>
          <DialogDescription>
            Register a new member to your church community
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Personal Information */}
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-900 border-b pb-2">Personal Information</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="firstName">First Name *</Label>
                <Input
                  id="firstName"
                  value={formData.firstName}
                  onChange={(e) => handleInputChange('firstName', e.target.value)}
                  placeholder="Enter first name"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="lastName">Last Name *</Label>
                <Input
                  id="lastName"
                  value={formData.lastName}
                  onChange={(e) => handleInputChange('lastName', e.target.value)}
                  placeholder="Enter last name"
                  className="mt-1"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="email">Email Address *</Label>
                <div className="relative mt-1">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    placeholder="member@email.com"
                    className="pl-10"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="phone">Phone Number *</Label>
                <div className="relative mt-1">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    placeholder="+27 81 234 5678"
                    className="pl-10"
                  />
                </div>
              </div>
            </div>

            <div>
              <Label htmlFor="dateOfBirth">Date of Birth</Label>
              <div className="relative mt-1">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="dateOfBirth"
                  type="date"
                  value={formData.dateOfBirth}
                  onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </div>

          {/* Address Information */}
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-900 border-b pb-2">Address Information</h3>
            
            <div>
              <Label htmlFor="address">Street Address</Label>
              <div className="relative mt-1">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="address"
                  value={formData.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  placeholder="123 Main Street"
                  className="pl-10"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="city">City</Label>
                <Input
                  id="city"
                  value={formData.city}
                  onChange={(e) => handleInputChange('city', e.target.value)}
                  placeholder="Cape Town"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="province">Province</Label>
                <Select value={formData.province} onValueChange={(value) => handleInputChange('province', value)}>
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
            </div>
          </div>

          {/* Church Information */}
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-900 border-b pb-2">Church Information</h3>
            
            <div>
              <Label htmlFor="membershipType">Membership Type</Label>
              <Select value={formData.membershipType} onValueChange={(value) => handleInputChange('membershipType', value)}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select membership type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="member">Regular Member</SelectItem>
                  <SelectItem value="deacon">Deacon</SelectItem>
                  <SelectItem value="elder">Elder</SelectItem>
                  <SelectItem value="youth">Youth Member</SelectItem>
                  <SelectItem value="visitor">Visitor</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="previousChurch">Previous Church (Optional)</Label>
              <Input
                id="previousChurch"
                value={formData.previousChurch}
                onChange={(e) => handleInputChange('previousChurch', e.target.value)}
                placeholder="Previous church name"
                className="mt-1"
              />
            </div>
          </div>

          {/* Emergency Contact */}
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-900 border-b pb-2">Emergency Contact</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="emergencyContact">Contact Name</Label>
                <Input
                  id="emergencyContact"
                  value={formData.emergencyContact}
                  onChange={(e) => handleInputChange('emergencyContact', e.target.value)}
                  placeholder="Full name"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="emergencyPhone">Contact Phone</Label>
                <Input
                  id="emergencyPhone"
                  value={formData.emergencyPhone}
                  onChange={(e) => handleInputChange('emergencyPhone', e.target.value)}
                  placeholder="+27 81 234 5678"
                  className="mt-1"
                />
              </div>
            </div>
          </div>

          {/* Additional Notes */}
          <div>
            <Label htmlFor="notes">Additional Notes (Optional)</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => handleInputChange('notes', e.target.value)}
              placeholder="Any additional information about the member..."
              className="mt-1"
              rows={3}
            />
          </div>

          {/* Actions */}
          <div className="flex space-x-3 pt-4 border-t">
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1"
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              className="flex-1 bg-blue-600 hover:bg-blue-700"
              disabled={isSubmitting || !formData.firstName || !formData.lastName || !formData.email}
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Adding Member...
                </>
              ) : (
                <>
                  Add Member
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