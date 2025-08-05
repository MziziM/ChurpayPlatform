import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
  Award,
  TrendingUp,
  Activity,
  Sparkles,
  ChevronRight,
  UserCheck,
  HandHeart,
  Zap
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
  thisMonthGiven: string;
  goalProgress: number;
  annualGoal: string;
  recentAchievements: string[];
  transactionCount: number;
  averageGift: string;
  upcomingEvents: Array<{
    id: string;
    title: string;
    date: string;
    type: string;
  }>;
}

interface CommunityInsights {
  totalMembers: number;
  activeThisWeek: number;
  totalDonationsThisMonth: string;
  averageDonation: string;
  topContributors: number;
  upcomingEvents: number;
  recentActivities: Array<{
    id: string;
    type: string;
    description: string;
    timestamp: string;
  }>;
  monthlyGrowth: number;
  engagementScore: number;
}

interface AnimatedCommunityWelcomeProps {
  onQuickAction: (action: string) => void;
}

export function AnimatedCommunityWelcome({ onQuickAction }: AnimatedCommunityWelcomeProps) {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [animationStage, setAnimationStage] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  // Update time every minute
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  // Animation sequence
  useEffect(() => {
    setIsVisible(true);
    const stages = [0, 1, 2, 3];
    stages.forEach((stage, index) => {
      setTimeout(() => setAnimationStage(stage), index * 400);
    });
  }, []);

  // Fetch church data
  const { data: churchData } = useQuery<ChurchData>({
    queryKey: ['/api/user/church'],
    staleTime: 300000, // 5 minutes
  });

  // Fetch user stats
  const { data: userStats } = useQuery<UserStats>({
    queryKey: ['/api/user/stats'],
    refetchInterval: 60000, // Update every minute
  });

  // Fetch community insights
  const { data: communityInsights } = useQuery<CommunityInsights>({
    queryKey: ['/api/church/community-insights'],
    refetchInterval: 300000, // Update every 5 minutes
  });

  const getGreeting = () => {
    const hour = currentTime.getHours();
    const name = userStats?.memberSince ? 'friend' : 'there';
    
    if (hour < 12) return `Good morning, ${name}`;
    if (hour < 17) return `Good afternoon, ${name}`;
    return `Good evening, ${name}`;
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-ZA', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getPersonalizedInsight = () => {
    if (!userStats || !communityInsights) return null;

    const insights = [
      {
        icon: TrendingUp,
        text: `You're among the top ${Math.ceil((parseFloat(userStats.thisYearGiven) / parseFloat(communityInsights.averageDonation)) * 10)}% of contributors this year!`,
        color: 'text-green-600'
      },
      {
        icon: Users,
        text: `${communityInsights.activeThisWeek} members were active this week - our community is growing!`,
        color: 'text-blue-600'
      },
      {
        icon: Heart,
        text: `Your ${userStats.transactionCount} contributions have made a real difference in our community.`,
        color: 'text-purple-600'
      },
      {
        icon: Sparkles,
        text: `Community engagement is up ${communityInsights.monthlyGrowth}% this month!`,
        color: 'text-yellow-600'
      }
    ];

    return insights[Math.floor(Math.random() * insights.length)];
  };

  const personalInsight = getPersonalizedInsight();

  if (!churchData) {
    return (
      <div className="space-y-6">
        {/* Animated Loading */}
        <Card className="border-0 shadow-xl bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50 overflow-hidden">
          <CardContent className="p-8">
            <div className="animate-pulse space-y-4">
              <div className="flex items-center space-x-4">
                <div className="w-20 h-20 bg-gradient-to-br from-gray-200 to-gray-300 rounded-full animate-pulse"></div>
                <div className="space-y-2">
                  <div className="h-8 bg-gradient-to-r from-gray-200 to-gray-300 rounded-lg w-64 animate-pulse"></div>
                  <div className="h-6 bg-gradient-to-r from-gray-200 to-gray-300 rounded-lg w-48 animate-pulse"></div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const quickActions = [
    { 
      label: 'Give Tithe', 
      action: 'tithe', 
      icon: Heart, 
      color: 'bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700',
      description: 'Support your church faithfully'
    },
    { 
      label: 'Make Donation', 
      action: 'donation', 
      icon: HandHeart, 
      color: 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700',
      description: 'Give generously to God\'s work'
    },
    { 
      label: 'Support Project', 
      action: 'project', 
      icon: Target, 
      color: 'bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700',
      description: 'Fund community initiatives'
    },
    { 
      label: 'View Community', 
      action: 'community', 
      icon: Users, 
      color: 'bg-gradient-to-r from-purple-500 to-violet-600 hover:from-purple-600 hover:to-violet-700',
      description: 'Connect with your church'
    }
  ];

  return (
    <div className={`space-y-6 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
      {/* Main Welcome Banner */}
      <Card className="border-0 shadow-2xl bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50 relative overflow-hidden">
        {/* Animated Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className={`absolute top-4 right-4 transition-all duration-1000 ${animationStage >= 1 ? 'scale-100 rotate-0' : 'scale-50 rotate-45'}`}>
            <Church className="w-32 h-32 text-purple-600" />
          </div>
          <div className={`absolute bottom-4 left-4 transition-all duration-1000 delay-300 ${animationStage >= 2 ? 'scale-100 opacity-30' : 'scale-75 opacity-0'}`}>
            <Sparkles className="w-24 h-24 text-blue-500" />
          </div>
        </div>
        
        <CardContent className="p-8 relative">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
            {/* Welcome Message & Church Info */}
            <div className={`flex-1 transition-all duration-800 ${animationStage >= 0 ? 'translate-x-0 opacity-100' : '-translate-x-8 opacity-0'}`}>
              <div className="flex items-center space-x-6 mb-6">
                {/* Animated Church Logo */}
                <div className={`relative transition-all duration-1000 ${animationStage >= 1 ? 'scale-100' : 'scale-90'}`}>
                  {churchData.logoUrl ? (
                    <img 
                      src={churchData.logoUrl} 
                      alt={`${churchData.name} logo`}
                      className="w-20 h-20 rounded-full object-cover border-4 border-white shadow-xl ring-4 ring-purple-100"
                    />
                  ) : (
                    <div className="w-20 h-20 bg-gradient-to-br from-purple-500 via-purple-600 to-blue-600 rounded-full flex items-center justify-center shadow-xl ring-4 ring-purple-100">
                      <Church className="w-10 h-10 text-white" />
                    </div>
                  )}
                  {/* Pulse Ring */}
                  <div className={`absolute inset-0 rounded-full border-4 border-purple-400 ${animationStage >= 2 ? 'animate-ping' : ''}`}></div>
                </div>
                
                {/* Welcome Text */}
                <div>
                  <h1 className={`text-3xl lg:text-4xl font-bold text-gray-900 transition-all duration-800 delay-200 ${animationStage >= 1 ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>
                    {getGreeting()}!
                  </h1>
                  <p className={`text-xl text-gray-700 transition-all duration-800 delay-400 ${animationStage >= 2 ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>
                    Welcome to <span className="font-bold bg-gradient-to-r from-purple-700 to-blue-700 bg-clip-text text-transparent">{churchData.name}</span>
                  </p>
                  <p className={`text-sm text-gray-500 flex items-center mt-2 transition-all duration-800 delay-500 ${animationStage >= 3 ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>
                    <Calendar className="w-4 h-4 mr-2" />
                    {formatDate(currentTime)}
                  </p>
                </div>
              </div>

              {/* Church Info Quick View */}
              <div className={`grid grid-cols-1 md:grid-cols-3 gap-4 transition-all duration-800 delay-600 ${animationStage >= 3 ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>
                <div className="flex items-center space-x-2 text-gray-600">
                  <Users className="w-4 h-4" />
                  <span className="text-sm">{churchData.memberCount?.toLocaleString()} members</span>
                </div>
                <div className="flex items-center space-x-2 text-gray-600">
                  <MapPin className="w-4 h-4" />
                  <span className="text-sm">{churchData.city}, {churchData.province}</span>
                </div>
                <div className="flex items-center space-x-2 text-gray-600">
                  <UserCheck className="w-4 h-4" />
                  <span className="text-sm">Pastor {churchData.leadPastor}</span>
                </div>
              </div>
            </div>

            {/* User Stats & Personalized Insights */}
            {userStats && (
              <div className={`bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-white/60 shadow-xl min-w-[320px] transition-all duration-1000 delay-800 ${animationStage >= 3 ? 'translate-x-0 opacity-100 scale-100' : 'translate-x-8 opacity-0 scale-95'}`}>
                <h3 className="font-bold text-gray-900 mb-4 flex items-center">
                  <Zap className="w-5 h-5 mr-2 text-yellow-500" />
                  Your Giving Journey
                </h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg">
                    <span className="text-sm text-gray-700 font-medium">This Year</span>
                    <span className="font-bold text-green-600 text-lg">R{userStats.thisYearGiven}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gradient-to-r from-purple-50 to-violet-50 rounded-lg">
                    <span className="text-sm text-gray-700 font-medium">Total Given</span>
                    <span className="font-bold text-purple-600 text-lg">R{userStats.totalGiven}</span>
                  </div>
                  
                  {/* Animated Progress Bar */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 font-medium">Annual Goal Progress</span>
                      <span className="text-gray-900 font-bold">{userStats.goalProgress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                      <div 
                        className="bg-gradient-to-r from-purple-500 via-blue-500 to-cyan-500 h-3 rounded-full transition-all duration-2000 ease-out shadow-sm"
                        style={{ 
                          width: animationStage >= 3 ? `${Math.min(userStats.goalProgress, 100)}%` : '0%'
                        }}
                      ></div>
                    </div>
                  </div>
                  
                  <div className="text-xs text-gray-500 pt-3 border-t border-gray-200 flex items-center">
                    <Award className="w-3 h-3 mr-1" />
                    Member since {userStats.memberSince}
                  </div>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Personalized Community Insight */}
      {personalInsight && (
        <Card className={`border-0 shadow-lg bg-gradient-to-r from-yellow-50 to-orange-50 transition-all duration-1000 delay-1000 ${animationStage >= 3 ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-white rounded-full shadow-sm">
                <personalInsight.icon className={`w-5 h-5 ${personalInsight.color}`} />
              </div>
              <div className="flex-1">
                <p className="text-gray-800 font-medium">{personalInsight.text}</p>
              </div>
              <Sparkles className="w-4 h-4 text-yellow-500 animate-pulse" />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Community Insights Grid */}
      {communityInsights && (
        <div className={`grid grid-cols-1 md:grid-cols-4 gap-4 transition-all duration-1000 delay-1200 ${animationStage >= 3 ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0'}`}>
          <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-cyan-50 hover:shadow-xl transition-all duration-300">
            <CardContent className="p-4 text-center">
              <Users className="w-8 h-8 text-blue-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-gray-900">{communityInsights.totalMembers}</div>
              <div className="text-sm text-gray-600">Total Members</div>
            </CardContent>
          </Card>
          
          <Card className="border-0 shadow-lg bg-gradient-to-br from-green-50 to-emerald-50 hover:shadow-xl transition-all duration-300">
            <CardContent className="p-4 text-center">
              <Activity className="w-8 h-8 text-green-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-gray-900">{communityInsights.activeThisWeek}</div>
              <div className="text-sm text-gray-600">Active This Week</div>
            </CardContent>
          </Card>
          
          <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-50 to-violet-50 hover:shadow-xl transition-all duration-300">
            <CardContent className="p-4 text-center">
              <Heart className="w-8 h-8 text-purple-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-gray-900">R{communityInsights.totalDonationsThisMonth}</div>
              <div className="text-sm text-gray-600">This Month</div>
            </CardContent>
          </Card>
          
          <Card className="border-0 shadow-lg bg-gradient-to-br from-yellow-50 to-orange-50 hover:shadow-xl transition-all duration-300">
            <CardContent className="p-4 text-center">
              <TrendingUp className="w-8 h-8 text-yellow-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-gray-900">{communityInsights.monthlyGrowth}%</div>
              <div className="text-sm text-gray-600">Growth Rate</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Enhanced Quick Actions */}
      <Card className={`border-0 shadow-xl transition-all duration-1000 delay-1400 ${animationStage >= 3 ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0'}`}>
        <CardHeader>
          <CardTitle className="text-xl font-bold text-gray-900 flex items-center">
            <Gift className="w-6 h-6 mr-3 text-purple-600" />
            Quick Actions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {quickActions.map((action, index) => (
              <Button
                key={action.action}
                onClick={() => onQuickAction(action.action)}
                className={`${action.color} text-white h-auto p-6 flex flex-col items-center space-y-3 transition-all duration-300 hover:scale-105 hover:shadow-xl transform group border-0`}
                style={{ 
                  animationDelay: `${1600 + index * 100}ms`
                }}
              >
                <action.icon className="w-8 h-8 group-hover:scale-110 transition-transform duration-200" />
                <div className="text-center">
                  <div className="font-bold text-base">{action.label}</div>
                  <div className="text-xs opacity-90 mt-1">{action.description}</div>
                </div>
                <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>


    </div>
  );
}