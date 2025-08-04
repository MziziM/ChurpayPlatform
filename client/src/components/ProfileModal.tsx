import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  User, Mail, Phone, MapPin, Calendar, 
  Shield, Heart, Star, Award, Edit3,
  Building2, CreditCard, Settings, Crown,
  Camera, Upload, Smile
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// Bible-based emoji options for profile pictures
const BIBLE_EMOJIS = [
  { emoji: '🙏', name: 'Prayer' },
  { emoji: '✝️', name: 'Cross' },
  { emoji: '❤️', name: 'Love' },
  { emoji: '🕊️', name: 'Peace' },
  { emoji: '🌟', name: 'Star' },
  { emoji: '👑', name: 'Crown' },
  { emoji: '🛡️', name: 'Shield' },
  { emoji: '🕯️', name: 'Light' },
  { emoji: '📖', name: 'Word' },
  { emoji: '🏠', name: 'Home' },
  { emoji: '🌺', name: 'Bloom' },
  { emoji: '⛪', name: 'Church' }
];

export function ProfileModal({ isOpen, onClose }: ProfileModalProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [profileData, setProfileData] = useState({
    firstName: 'Nomsa',
    lastName: 'Mthembu',
    email: 'nomsa.mthembu@example.com',
    phone: '+27 82 123 4567',
    address: 'Cape Town, South Africa',
    joinDate: '2020-01-15',
    membershipTier: 'Faithful Steward',
    churchName: 'Grace Baptist Church',
    profileImage: 'https://images.unsplash.com/photo-1494790108755-2616b152547b?w=100&h=100&fit=crop&crop=face',
    profileEmoji: null
  });

  const { toast } = useToast();

  const achievements = [
    { icon: Heart, title: 'Faithful Giver', description: '12+ consecutive months', earned: true },
    { icon: Star, title: 'Community Builder', description: 'Supported 5+ projects', earned: true },
    { icon: Award, title: 'Mission Champion', description: 'R10,000+ mission giving', earned: false },
    { icon: Crown, title: 'Legacy Donor', description: 'R50,000+ lifetime giving', earned: true }
  ];

  const handleSave = () => {
    // Here you would typically call an API to save the profile data
    toast({
      title: "Profile Updated",
      description: "Your profile has been successfully updated.",
    });
    setIsEditing(false);
  };

  const handleInputChange = (field: string, value: string) => {
    setProfileData(prev => ({ ...prev, [field]: value }));
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // In a real app, you would upload to a server/cloud storage
      const reader = new FileReader();
      reader.onload = (e) => {
        setProfileData(prev => ({ 
          ...prev, 
          profileImage: e.target?.result as string,
          profileEmoji: null // Clear emoji when uploading image
        }));
      };
      reader.readAsDataURL(file);
      
      toast({
        title: "Image Uploaded",
        description: "Your profile picture has been updated.",
      });
    }
  };

  const handleEmojiSelect = (emoji: string) => {
    setProfileData(prev => ({ 
      ...prev, 
      profileEmoji: emoji,
      profileImage: null // Clear image when selecting emoji
    }));
    setShowEmojiPicker(false);
    toast({
      title: "Profile Updated",
      description: "Your profile emoji has been updated.",
    });
  };

  const getProfileDisplay = () => {
    if (profileData.profileEmoji) {
      return (
        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-purple-100 to-indigo-100 flex items-center justify-center text-4xl border-4 border-white shadow-lg">
          {profileData.profileEmoji}
        </div>
      );
    } else if (profileData.profileImage) {
      return (
        <Avatar className="w-24 h-24 border-4 border-white shadow-lg">
          <AvatarImage src={profileData.profileImage} alt="Profile" className="object-cover" />
          <AvatarFallback className="bg-gradient-to-br from-purple-600 to-indigo-700 text-white text-2xl">
            {profileData.firstName.charAt(0)}{profileData.lastName.charAt(0)}
          </AvatarFallback>
        </Avatar>
      );
    } else {
      return (
        <Avatar className="w-24 h-24 border-4 border-white shadow-lg">
          <AvatarFallback className="bg-gradient-to-br from-purple-600 to-indigo-700 text-white text-2xl">
            {profileData.firstName.charAt(0)}{profileData.lastName.charAt(0)}
          </AvatarFallback>
        </Avatar>
      );
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-indigo-700 rounded-xl flex items-center justify-center">
                <User className="h-5 w-5 text-white" />
              </div>
              <span>My Profile</span>
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEditing(!isEditing)}
              className="rounded-xl"
            >
              <Edit3 className="h-4 w-4 mr-2" />
              {isEditing ? 'Cancel' : 'Edit'}
            </Button>
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="personal" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="personal">Personal</TabsTrigger>
            <TabsTrigger value="membership">Membership</TabsTrigger>
            <TabsTrigger value="achievements">Achievements</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="personal" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <User className="h-5 w-5" />
                  <span>Personal Information</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Enhanced Profile Picture Section */}
                <div className="flex flex-col items-center space-y-4 p-6 bg-gradient-to-br from-purple-50 to-indigo-50 rounded-2xl border border-purple-100">
                  <div className="relative">
                    {getProfileDisplay()}
                    {isEditing && (
                      <div className="absolute -bottom-2 -right-2 flex space-x-1">
                        <label htmlFor="profile-upload" className="cursor-pointer">
                          <div className="w-8 h-8 bg-blue-600 hover:bg-blue-700 rounded-full flex items-center justify-center shadow-lg transition-colors">
                            <Camera className="h-4 w-4 text-white" />
                          </div>
                        </label>
                        <input
                          id="profile-upload"
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload}
                          className="hidden"
                        />
                        <Button
                          size="sm"
                          onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                          className="w-8 h-8 bg-purple-600 hover:bg-purple-700 rounded-full p-0"
                        >
                          <Smile className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                  
                  <div className="text-center">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {profileData.firstName} {profileData.lastName}
                    </h3>
                    <p className="text-sm text-gray-600">{profileData.membershipTier}</p>
                  </div>

                  {/* Bible Emoji Picker */}
                  {showEmojiPicker && isEditing && (
                    <div className="w-full p-4 bg-white rounded-xl border border-gray-200 shadow-lg">
                      <h4 className="text-sm font-medium text-gray-900 mb-3 flex items-center">
                        <Smile className="h-4 w-4 mr-2" />
                        Choose a Bible-inspired emoji
                      </h4>
                      <div className="grid grid-cols-6 gap-2">
                        {BIBLE_EMOJIS.map((item) => (
                          <Button
                            key={item.emoji}
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEmojiSelect(item.emoji)}
                            className="h-12 w-12 text-2xl hover:bg-purple-50 rounded-xl border border-transparent hover:border-purple-200"
                            title={item.name}
                          >
                            {item.emoji}
                          </Button>
                        ))}
                      </div>
                      <p className="text-xs text-gray-500 mt-3 text-center">
                        Select an emoji that represents your faith journey
                      </p>
                    </div>
                  )}
                </div>

                {/* Form Fields */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name</Label>
                    <Input
                      id="firstName"
                      value={profileData.firstName}
                      onChange={(e) => handleInputChange('firstName', e.target.value)}
                      disabled={!isEditing}
                      className="rounded-xl"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input
                      id="lastName"
                      value={profileData.lastName}
                      onChange={(e) => handleInputChange('lastName', e.target.value)}
                      disabled={!isEditing}
                      className="rounded-xl"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="email"
                      type="email"
                      value={profileData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      disabled={!isEditing}
                      className="pl-10 rounded-xl"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="phone"
                      value={profileData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      disabled={!isEditing}
                      className="pl-10 rounded-xl"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address">Address</Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="address"
                      value={profileData.address}
                      onChange={(e) => handleInputChange('address', e.target.value)}
                      disabled={!isEditing}
                      className="pl-10 rounded-xl"
                    />
                  </div>
                </div>

                {isEditing && (
                  <div className="flex space-x-3 pt-4">
                    <Button onClick={handleSave} className="flex-1 bg-gradient-to-r from-purple-600 to-indigo-700 text-white rounded-xl">
                      Save Changes
                    </Button>
                    <Button variant="outline" onClick={() => setIsEditing(false)} className="flex-1 rounded-xl">
                      Cancel
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="membership" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Building2 className="h-5 w-5" />
                  <span>Membership Details</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm text-gray-600">Church</Label>
                    <p className="font-semibold">{profileData.churchName}</p>
                  </div>
                  <div>
                    <Label className="text-sm text-gray-600">Member Since</Label>
                    <p className="font-semibold flex items-center">
                      <Calendar className="h-4 w-4 mr-2" />
                      {new Date(profileData.joinDate).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div>
                  <Label className="text-sm text-gray-600">Membership Tier</Label>
                  <Badge className="mt-1 bg-gradient-to-r from-yellow-500 to-orange-600 text-white">
                    <Crown className="h-4 w-4 mr-1" />
                    {profileData.membershipTier}
                  </Badge>
                </div>
                <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl p-4 border border-purple-200">
                  <p className="text-sm text-purple-700 font-medium">
                    You've been a faithful member for {Math.floor((new Date().getTime() - new Date(profileData.joinDate).getTime()) / (1000 * 60 * 60 * 24 * 365))} years!
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="achievements" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Award className="h-5 w-5" />
                  <span>Achievements & Badges</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 gap-4">
                  {achievements.map((achievement, index) => (
                    <div 
                      key={index}
                      className={`flex items-center space-x-4 p-4 rounded-xl border-2 transition-all duration-200 ${
                        achievement.earned 
                          ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-200 hover:border-green-300' 
                          : 'bg-gray-50 border-gray-200 opacity-60'
                      }`}
                    >
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                        achievement.earned 
                          ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white' 
                          : 'bg-gray-300 text-gray-500'
                      }`}>
                        <achievement.icon className="h-6 w-6" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900">{achievement.title}</h4>
                        <p className="text-sm text-gray-600">{achievement.description}</p>
                      </div>
                      {achievement.earned && (
                        <Badge className="bg-green-100 text-green-800">
                          Earned
                        </Badge>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Settings className="h-5 w-5" />
                  <span>Account Settings</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                    <div>
                      <h4 className="font-medium">Email Notifications</h4>
                      <p className="text-sm text-gray-600">Receive updates about donations and church events</p>
                    </div>
                    <Button variant="outline" size="sm">Configure</Button>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                    <div>
                      <h4 className="font-medium">Privacy Settings</h4>
                      <p className="text-sm text-gray-600">Control what information is visible to others</p>
                    </div>
                    <Button variant="outline" size="sm">Manage</Button>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                    <div>
                      <h4 className="font-medium">Security</h4>
                      <p className="text-sm text-gray-600">Two-factor authentication and password settings</p>
                    </div>
                    <Button variant="outline" size="sm">
                      <Shield className="h-4 w-4 mr-2" />
                      Secure
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}