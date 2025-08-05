import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Church, 
  MapPin, 
  Clock, 
  Users, 
  Heart, 
  Calendar,
  Phone,
  Mail,
  Globe,
  Star,
  Gift,
  Target,
  Award
} from 'lucide-react';

interface ChurchData {
  id: string;
  name: string;
  denomination: string;
  logoUrl?: string;
  description: string;
  leadPastor: string;
  city: string;
  province: string;
  memberCount: number;
  contactEmail: string;
  contactPhone: string;
  website?: string;
  servicesTimes: string;
  status: string;
}

interface UserStats {
  memberSince: string;
  totalGiven: string;
  thisYearGiven: string;
  goalProgress: number;
  annualGoal: string;
  recentAchievements: string[];
  upcomingEvents: Array<{
    id: string;
    title: string;
    date: string;
    type: string;
  }>;
}

interface PersonalizedWelcomeScreenProps {
  onQuickAction: (action: string) => void;
}

export function PersonalizedWelcomeScreen({ onQuickAction }: PersonalizedWelcomeScreenProps) {
  const [currentTime, setCurrentTime] = useState(new Date());

  // Update time every minute
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  // Fetch church data based on user's church membership
  const { data: churchData } = useQuery<ChurchData>({
    queryKey: ['/api/user/church']
  });

  // Fetch user's giving stats and achievements
  const { data: userStats } = useQuery<UserStats>({
    queryKey: ['/api/user/stats']
  });

  const getGreeting = () => {
    const hour = currentTime.getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-ZA', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (!churchData) {
    return (
      <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-50 to-blue-50">
        <CardContent className="p-8">
          <div className="animate-pulse">
            <div className="flex items-center space-x-4 mb-6">
              <div className="w-16 h-16 bg-gray-200 rounded-full"></div>
              <div className="space-y-2">
                <div className="h-6 bg-gray-200 rounded w-48"></div>
                <div className="h-4 bg-gray-200 rounded w-32"></div>
              </div>
            </div>
            <div className="space-y-3">
              <div className="h-4 bg-gray-200 rounded w-full"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const quickActions = [
    { 
      label: 'Give Tithe', 
      action: 'tithe', 
      icon: Heart, 
      color: 'bg-red-500 hover:bg-red-600',
      description: 'Support your church with your tithe'
    },
    { 
      label: 'Make Donation', 
      action: 'donation', 
      icon: Gift, 
      color: 'bg-green-500 hover:bg-green-600',
      description: 'Make a general donation'
    },
    { 
      label: 'Support Project', 
      action: 'project', 
      icon: Target, 
      color: 'bg-blue-500 hover:bg-blue-600',
      description: 'Contribute to church projects'
    },
    { 
      label: 'Top Up Wallet', 
      action: 'topup', 
      icon: Award, 
      color: 'bg-purple-500 hover:bg-purple-600',
      description: 'Add funds to your wallet'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Main Welcome Card */}
      <Card className="border-0 shadow-xl bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50 relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-4 right-4">
            <Church className="w-32 h-32 text-purple-600" />
          </div>
        </div>
        
        <CardContent className="p-8 relative">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
            {/* Welcome Message & Church Info */}
            <div className="flex-1">
              <div className="flex items-center space-x-4 mb-4">
                {/* Church Logo */}
                <div className="relative">
                  {churchData.logoUrl ? (
                    <img 
                      src={churchData.logoUrl} 
                      alt={`${churchData.name} logo`}
                      className="w-16 h-16 rounded-full object-cover border-2 border-white shadow-md"
                    />
                  ) : (
                    <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-blue-600 rounded-full flex items-center justify-center shadow-md">
                      <Church className="w-8 h-8 text-white" />
                    </div>
                  )}
                </div>
                
                {/* Welcome Text */}
                <div>
                  <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">
                    {getGreeting()}!
                  </h1>
                  <p className="text-lg text-gray-600">
                    Welcome to <span className="font-semibold text-purple-700">{churchData.name}</span>
                  </p>
                  <p className="text-sm text-gray-500">{formatDate(currentTime)}</p>
                </div>
              </div>

              {/* Church Information */}
              <div className="bg-white/70 backdrop-blur-sm rounded-lg p-4 border border-white/50">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center space-x-2">
                    <Church className="w-4 h-4 text-purple-600" />
                    <span className="text-gray-700">{churchData.denomination}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <MapPin className="w-4 h-4 text-purple-600" />
                    <span className="text-gray-700">{churchData.city}, {churchData.province}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Users className="w-4 h-4 text-purple-600" />
                    <span className="text-gray-700">{churchData.memberCount.toLocaleString()} members</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Star className="w-4 h-4 text-purple-600" />
                    <span className="text-gray-700">Pastor {churchData.leadPastor}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* User Stats Card */}
            {userStats && (
              <div className="bg-white/70 backdrop-blur-sm rounded-lg p-6 border border-white/50 min-w-[280px]">
                <h3 className="font-semibold text-gray-900 mb-3">Your Giving Journey</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">This Year</span>
                    <span className="font-bold text-green-600">R{userStats.thisYearGiven}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Total Given</span>
                    <span className="font-bold text-purple-600">R{userStats.totalGiven}</span>
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Annual Goal</span>
                      <span className="text-gray-900">{userStats.goalProgress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-purple-500 to-blue-500 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${Math.min(userStats.goalProgress, 100)}%` }}
                      ></div>
                    </div>
                  </div>
                  <div className="text-xs text-gray-500 pt-2 border-t">
                    Member since {userStats.memberSince}
                  </div>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <h2 className="text-xl font-semibold text-gray-900 flex items-center">
            <Gift className="w-5 h-5 mr-2 text-purple-600" />
            Quick Actions
          </h2>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {quickActions.map((action) => (
              <Button
                key={action.action}
                onClick={() => onQuickAction(action.action)}
                className={`${action.color} text-white h-auto p-4 flex flex-col items-center space-y-2 transition-all duration-200 hover:scale-105 hover:shadow-lg`}
              >
                <action.icon className="w-6 h-6" />
                <div className="text-center">
                  <div className="font-semibold">{action.label}</div>
                  <div className="text-xs opacity-90">{action.description}</div>
                </div>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Church Services & Contact Info */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Service Times */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <Clock className="w-5 h-5 mr-2 text-purple-600" />
              Service Times
            </h3>
          </CardHeader>
          <CardContent>
            <div className="text-gray-700 whitespace-pre-line">
              {churchData.servicesTimes}
            </div>
          </CardContent>
        </Card>

        {/* Contact Information */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <Phone className="w-5 h-5 mr-2 text-purple-600" />
              Get in Touch
            </h3>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <Mail className="w-4 h-4 text-gray-500" />
                <a 
                  href={`mailto:${churchData.contactEmail}`}
                  className="text-purple-600 hover:text-purple-700 hover:underline"
                >
                  {churchData.contactEmail}
                </a>
              </div>
              <div className="flex items-center space-x-3">
                <Phone className="w-4 h-4 text-gray-500" />
                <a 
                  href={`tel:${churchData.contactPhone}`}
                  className="text-purple-600 hover:text-purple-700 hover:underline"
                >
                  {churchData.contactPhone}
                </a>
              </div>
              {churchData.website && (
                <div className="flex items-center space-x-3">
                  <Globe className="w-4 h-4 text-gray-500" />
                  <a 
                    href={churchData.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-purple-600 hover:text-purple-700 hover:underline"
                  >
                    Visit Website
                  </a>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Achievements */}
      {userStats?.recentAchievements && userStats.recentAchievements.length > 0 && (
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <Award className="w-5 h-5 mr-2 text-purple-600" />
              Recent Achievements
            </h3>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {userStats.recentAchievements.map((achievement, index) => (
                <Badge key={index} variant="secondary" className="bg-purple-100 text-purple-800">
                  {achievement}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Upcoming Events */}
      {userStats?.upcomingEvents && userStats.upcomingEvents.length > 0 && (
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <Calendar className="w-5 h-5 mr-2 text-purple-600" />
              Upcoming Events
            </h3>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {userStats.upcomingEvents.map((event) => (
                <div key={event.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <h4 className="font-medium text-gray-900">{event.title}</h4>
                    <p className="text-sm text-gray-600">{event.type}</p>
                  </div>
                  <Badge variant="outline">{event.date}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}