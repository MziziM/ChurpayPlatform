import React, { useState } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Badge } from './ui/badge';
import { motion } from 'framer-motion';
import { 
  Users, 
  DollarSign, 
  Calendar, 
  Settings, 
  BarChart3,
  Bell,
  MessageSquare,
  FileText,
  Shield,
  Database,
  Megaphone,
  Gift,
  Target,
  TrendingUp,
  Activity,
  Clock,
  CheckCircle,
  AlertTriangle,
  Star,
  Heart,
  Building2,
  ChevronRight
} from 'lucide-react';

// Import the management components
import { MemberManagement } from './MemberManagement';
import { FinancialManagement } from './FinancialManagement';
import { EventManagement } from './EventManagement';

interface ChurchOverviewStats {
  totalMembers: number;
  activeMembers: number;
  newMembersThisMonth: number;
  totalDonations: number;
  monthlyDonations: number;
  donationGrowth: number;
  upcomingEvents: number;
  activeProjects: number;
  projectCompletion: number;
  attendanceRate: number;
  volunteerHours: number;
  communityReach: number;
}

const mockOverviewStats: ChurchOverviewStats = {
  totalMembers: 450,
  activeMembers: 387,
  newMembersThisMonth: 12,
  totalDonations: 1250000,
  monthlyDonations: 125000,
  donationGrowth: 8.5,
  upcomingEvents: 8,
  activeProjects: 4,
  projectCompletion: 67,
  attendanceRate: 78,
  volunteerHours: 1540,
  communityReach: 2300
};

const quickActions = [
  {
    title: 'Add New Member',
    description: 'Register a new church member',
    icon: Users,
    color: 'bg-blue-500',
    category: 'members'
  },
  {
    title: 'Record Donation',
    description: 'Log a new donation or offering',
    icon: DollarSign,
    color: 'bg-green-500',
    category: 'finance'
  },
  {
    title: 'Create Event',
    description: 'Schedule a new church event',
    icon: Calendar,
    color: 'bg-purple-500',
    category: 'events'
  },
  {
    title: 'Send Announcement',
    description: 'Broadcast message to members',
    icon: Megaphone,
    color: 'bg-orange-500',
    category: 'communication'
  },
  {
    title: 'Generate Report',
    description: 'Create financial or attendance report',
    icon: FileText,
    color: 'bg-indigo-500',
    category: 'reports'
  },
  {
    title: 'Manage Projects',
    description: 'Update fundraising projects',
    icon: Target,
    color: 'bg-pink-500',
    category: 'projects'
  }
];

const recentActivity = [
  {
    id: '1',
    type: 'member',
    description: 'John Smith joined the church',
    timestamp: '2 hours ago',
    icon: Users,
    color: 'text-blue-500'
  },
  {
    id: '2',
    type: 'donation',
    description: 'R15,000 received for Building Fund',
    timestamp: '4 hours ago',
    icon: Gift,
    color: 'text-green-500'
  },
  {
    id: '3',
    type: 'event',
    description: 'Youth Meeting scheduled for Friday',
    timestamp: '6 hours ago',
    icon: Calendar,
    color: 'text-purple-500'
  },
  {
    id: '4',
    type: 'milestone',
    description: 'Building Fund reached 70% completion',
    timestamp: '1 day ago',
    icon: Target,
    color: 'text-orange-500'
  },
  {
    id: '5',
    type: 'volunteer',
    description: '25 volunteers signed up for community outreach',
    timestamp: '2 days ago',
    icon: Heart,
    color: 'text-pink-500'
  }
];

const upcomingTasks = [
  {
    id: '1',
    title: 'Prepare monthly financial report',
    dueDate: '2024-01-31',
    priority: 'high',
    category: 'Finance'
  },
  {
    id: '2',
    title: 'Follow up with new member orientation',
    dueDate: '2024-01-25',
    priority: 'medium',
    category: 'Members'
  },
  {
    id: '3',
    title: 'Review volunteer applications',
    dueDate: '2024-01-28',
    priority: 'medium',
    category: 'Volunteers'
  },
  {
    id: '4',
    title: 'Update website with Easter service details',
    dueDate: '2024-01-30',
    priority: 'low',
    category: 'Communications'
  }
];

export function ChurchManagement() {
  const [activeTab, setActiveTab] = useState('overview');

  const StatCard = ({ icon: Icon, title, value, subtitle, trend, color }: any) => (
    <Card className="p-6 bg-white border border-gray-200">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          {subtitle && (
            <p className="text-sm text-gray-600">{subtitle}</p>
          )}
          {trend && (
            <div className="flex items-center mt-2">
              <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
              <span className="text-sm text-green-500">+{trend}%</span>
            </div>
          )}
        </div>
        <div className={`p-3 rounded-full ${color}`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
    </Card>
  );

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (activeTab === 'members') {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <Button
            variant="ghost"
            onClick={() => setActiveTab('overview')}
            className="flex items-center space-x-2"
          >
            <Building2 className="w-4 h-4" />
            <span>Church Management</span>
            <ChevronRight className="w-4 h-4" />
            <span>Members</span>
          </Button>
        </div>
        <div className="p-6">
          <MemberManagement />
        </div>
      </div>
    );
  }

  if (activeTab === 'finance') {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <Button
            variant="ghost"
            onClick={() => setActiveTab('overview')}
            className="flex items-center space-x-2"
          >
            <Building2 className="w-4 h-4" />
            <span>Church Management</span>
            <ChevronRight className="w-4 h-4" />
            <span>Finance</span>
          </Button>
        </div>
        <div className="p-6">
          <FinancialManagement />
        </div>
      </div>
    );
  }

  if (activeTab === 'events') {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <Button
            variant="ghost"
            onClick={() => setActiveTab('overview')}
            className="flex items-center space-x-2"
          >
            <Building2 className="w-4 h-4" />
            <span>Church Management</span>
            <ChevronRight className="w-4 h-4" />
            <span>Events</span>
          </Button>
        </div>
        <div className="p-6">
          <EventManagement />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Church Management Dashboard
          </h1>
          <p className="text-gray-600">
            Complete overview of your church operations and activities
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Button variant="outline" size="sm">
            <Bell className="w-4 h-4 mr-2" />
            Notifications
          </Button>
          <Button size="sm" className="bg-churpay-gradient text-white">
            <Settings className="w-4 h-4 mr-2" />
            Settings
          </Button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="members">Members</TabsTrigger>
          <TabsTrigger value="finance">Finance</TabsTrigger>
          <TabsTrigger value="events">Events</TabsTrigger>
          <TabsTrigger value="communication">Communication</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard
              icon={Users}
              title="Total Members"
              value={mockOverviewStats.totalMembers}
              subtitle={`${mockOverviewStats.activeMembers} active`}
              color="bg-blue-500"
            />
            <StatCard
              icon={DollarSign}
              title="Monthly Donations"
              value={`R${(mockOverviewStats.monthlyDonations / 1000).toFixed(0)}k`}
              trend={mockOverviewStats.donationGrowth}
              color="bg-green-500"
            />
            <StatCard
              icon={Calendar}
              title="Upcoming Events"
              value={mockOverviewStats.upcomingEvents}
              subtitle="This month"
              color="bg-purple-500"
            />
            <StatCard
              icon={Target}
              title="Project Progress"
              value={`${mockOverviewStats.projectCompletion}%`}
              subtitle={`${mockOverviewStats.activeProjects} active`}
              color="bg-orange-500"
            />
          </div>

          {/* Secondary Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <StatCard
              icon={Activity}
              title="Attendance Rate"
              value={`${mockOverviewStats.attendanceRate}%`}
              subtitle="Last 4 weeks average"
              color="bg-indigo-500"
            />
            <StatCard
              icon={Clock}
              title="Volunteer Hours"
              value={mockOverviewStats.volunteerHours}
              subtitle="This month"
              color="bg-pink-500"
            />
            <StatCard
              icon={Heart}
              title="Community Reach"
              value={mockOverviewStats.communityReach}
              subtitle="People impacted"
              color="bg-red-500"
            />
          </div>

          {/* Quick Actions */}
          <Card className="p-6 bg-white border border-gray-200">
            <h3 className="text-lg font-semibold mb-4 text-gray-900">
              Quick Actions
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {quickActions.map((action, index) => (
                <motion.button
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  onClick={() => {
                    if (action.category === 'members') setActiveTab('members');
                    else if (action.category === 'finance') setActiveTab('finance');
                    else if (action.category === 'events') setActiveTab('events');
                  }}
                  className="p-4 rounded-lg border border-gray-200 hover:border-purple-500 transition-all text-left bg-white"
                >
                  <div className="flex items-start space-x-3">
                    <div className={`p-2 rounded-lg ${action.color}`}>
                      <action.icon className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">{action.title}</h4>
                      <p className="text-sm text-gray-600">{action.description}</p>
                    </div>
                  </div>
                </motion.button>
              ))}
            </div>
          </Card>

          {/* Dashboard Content */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Activity */}
            <Card className="p-6 bg-white border border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
                <Button variant="ghost" size="sm">
                  <Activity className="w-4 h-4" />
                </Button>
              </div>
              <div className="space-y-4">
                {recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-start space-x-3">
                    <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                      <activity.icon className={`w-4 h-4 ${activity.color}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-900">{activity.description}</p>
                      <p className="text-xs text-gray-500">{activity.timestamp}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Upcoming Tasks */}
            <Card className="p-6 bg-white border border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Upcoming Tasks</h3>
                <Button variant="ghost" size="sm">
                  <CheckCircle className="w-4 h-4" />
                </Button>
              </div>
              <div className="space-y-4">
                {upcomingTasks.map((task) => (
                  <div key={task.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">{task.title}</p>
                      <p className="text-xs text-gray-500">Due: {task.dueDate}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge className={getPriorityColor(task.priority)}>
                        {task.priority}
                      </Badge>
                      <Badge variant="outline">
                        {task.category}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}