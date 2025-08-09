import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { 
  Building2, MapPin, Users, Calendar, 
  Heart, Target, TrendingUp, Award,
  Phone, Mail, Globe, Clock
} from 'lucide-react';

interface Church {
  id: string;
  name: string;
  description: string;
  location: string;
  memberCount: number;
  totalDonations: string;
  image?: string;
  logoUrl?: string;
}

interface ChurchModalProps {
  isOpen: boolean;
  onClose: () => void;
  churchId?: string;
}

export function ChurchModal({ isOpen, onClose, churchId }: ChurchModalProps) {
  const [activeTab, setActiveTab] = useState('overview');

  // Fetch user's actual church data
  const { data: userChurch } = useQuery<{
    id: string;
    name: string;
    denomination: string;
    logoUrl?: string;
    description: string;
    leadPastor: string;
    city: string;
    province: string;
    location: string;
    memberCount: number;
    contactEmail: string;
    contactPhone: string;
    website: string;
    servicesTimes: string[];
    status: string;
  }>({
    queryKey: ['/api/user/church'],
    enabled: isOpen,
  });

  // Use user's church data
  const church = userChurch;

  // Use real church data with safe defaults
  const churchDetails = church ? {
    ...church,
    pastorName: church.leadPastor || 'Pastor',
    founded: '2020', // Could be added to church schema later
    services: Array.isArray(church.servicesTimes) ? church.servicesTimes : ['Sunday 09:00', 'Sunday 18:00'],
    phone: church.contactPhone || 'Not provided',
    email: church.contactEmail || 'Not provided',
    address: church.location || 'Location not provided',
    yearlyGoal: 0, // Real data needed from church analytics
    currentYearDonations: 0, // Real data needed from church analytics
    projectsActive: 0, // Real data needed from church analytics
    projectsCompleted: 0, // Real data needed from church analytics
    totalDonations: '0', // Real data needed from church analytics
    image: church.logoUrl, // Alias for backward compatibility
    recentActivities: [], // Real data needed from church activity logs
    projects: [] // Real data needed from church projects
  } : null;

  if (!church || !churchDetails) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent>
          <div className="text-center py-8">
            <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No church information available</p>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  const yearProgress = (churchDetails.currentYearDonations / churchDetails.yearlyGoal) * 100;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-indigo-700 rounded-xl flex items-center justify-center">
              <Building2 className="h-5 w-5 text-white" />
            </div>
            <span>{churchDetails.name}</span>
          </DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="projects">Projects</TabsTrigger>
            <TabsTrigger value="giving">My Giving</TabsTrigger>
            <TabsTrigger value="contact">Contact</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Church Header */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-start space-x-6">
                  <Avatar className="w-20 h-20 border-4 border-white shadow-lg">
                    <AvatarImage 
                      src={churchDetails.logoUrl || churchDetails.image} 
                      alt={`${churchDetails.name} logo`}
                      className="object-cover"
                    />
                    <AvatarFallback className="bg-gradient-to-r from-purple-600 to-indigo-700 text-white text-2xl font-bold">
                      {churchDetails.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 space-y-3">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900">{churchDetails.name}</h2>
                      <p className="text-gray-600">{churchDetails.description}</p>
                    </div>
                    <div className="flex items-center space-x-6 text-sm text-gray-600">
                      <span className="flex items-center">
                        <MapPin className="h-4 w-4 mr-1" />
                        {churchDetails.location}
                      </span>
                      <span className="flex items-center">
                        <Users className="h-4 w-4 mr-1" />
                        {churchDetails.memberCount} members
                      </span>
                      <span className="flex items-center">
                        <Calendar className="h-4 w-4 mr-1" />
                        Est. {churchDetails.founded}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Total Donations</p>
                      <p className="text-2xl font-bold text-green-600">R {parseInt(churchDetails.totalDonations || '0').toLocaleString()}</p>
                    </div>
                    <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                      <Heart className="h-6 w-6 text-green-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Active Projects</p>
                      <p className="text-2xl font-bold text-blue-600">{churchDetails.projectsActive}</p>
                    </div>
                    <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                      <Target className="h-6 w-6 text-blue-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Year Progress</p>
                      <p className="text-2xl font-bold text-purple-600">{yearProgress.toFixed(0)}%</p>
                    </div>
                    <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                      <TrendingUp className="h-6 w-6 text-purple-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Annual Goal Progress */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Target className="h-5 w-5" />
                  <span>2025 Annual Goal</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">R {churchDetails.currentYearDonations.toLocaleString()} raised</span>
                  <span className="text-sm text-gray-600">R {churchDetails.yearlyGoal.toLocaleString()} goal</span>
                </div>
                <Progress value={yearProgress} className="h-3" />
                <p className="text-sm text-gray-600">
                  R {(churchDetails.yearlyGoal - churchDetails.currentYearDonations).toLocaleString()} remaining to reach annual goal
                </p>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Clock className="h-5 w-5" />
                  <span>Recent Activity</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {churchDetails.recentActivities.map((activity, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                      <div className="flex items-center space-x-3">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                          activity.type === 'donation' ? 'bg-green-100' :
                          activity.type === 'project' ? 'bg-blue-100' : 'bg-purple-100'
                        }`}>
                          {activity.type === 'donation' && <Heart className="h-4 w-4 text-green-600" />}
                          {activity.type === 'project' && <Target className="h-4 w-4 text-blue-600" />}
                          {activity.type === 'tithe' && <Award className="h-4 w-4 text-purple-600" />}
                        </div>
                        <div>
                          <p className="font-medium text-sm">
                            {activity.type === 'donation' && `Donation from ${activity.member}`}
                            {activity.type === 'project' && activity.name}
                            {activity.type === 'tithe' && `Tithe from ${activity.member}`}
                          </p>
                          <p className="text-xs text-gray-600">{activity.time}</p>
                        </div>
                      </div>
                      <Badge variant="outline" className="text-sm">
                        {activity.type === 'project' ? activity.progress : activity.amount}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="projects" className="space-y-6">
            <div className="grid gap-6">
              {churchDetails.projects.map((project) => (
                <Card key={project.id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">{project.name}</CardTitle>
                        <p className="text-sm text-gray-600 mt-1">{project.description}</p>
                      </div>
                      <Badge className="bg-blue-100 text-blue-800">
                        {project.supporters} supporters
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">R {project.current.toLocaleString()} raised</span>
                      <span className="text-sm text-gray-600">R {project.target.toLocaleString()} goal</span>
                    </div>
                    <Progress value={(project.current / project.target) * 100} className="h-3" />
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">
                        Deadline: {new Date(project.deadline).toLocaleDateString()}
                      </span>
                      <Button size="sm" className="bg-gradient-to-r from-purple-600 to-indigo-700 text-white rounded-xl">
                        Support Project
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="giving" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>My Giving to {churchDetails.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Heart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 mb-4">Your personalized giving history and impact will be shown here</p>
                  <Button className="bg-gradient-to-r from-purple-600 to-indigo-700 text-white rounded-xl">
                    View Full Giving History
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="contact" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Building2 className="h-5 w-5" />
                  <span>Contact Information</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3">
                      <Phone className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-600">Phone</p>
                        <p className="font-medium">{churchDetails.phone}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Mail className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-600">Email</p>
                        <p className="font-medium">{churchDetails.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Globe className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-600">Website</p>
                        <p className="font-medium text-blue-600">{churchDetails.website}</p>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-start space-x-3">
                      <MapPin className="h-5 w-5 text-gray-400 mt-1" />
                      <div>
                        <p className="text-sm text-gray-600">Address</p>
                        <p className="font-medium">{churchDetails.address}</p>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 mb-2">Service Times</p>
                      <div className="space-y-1">
                        {churchDetails.services.map((service, index) => (
                          <p key={index} className="font-medium text-sm">{service}</p>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="border-t pt-6">
                  <p className="text-sm text-gray-600 mb-2">Leadership</p>
                  <p className="font-semibold">Pastor: {churchDetails.pastorName}</p>
                  <p className="text-sm text-gray-600">Denomination: {churchDetails.denomination}</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}