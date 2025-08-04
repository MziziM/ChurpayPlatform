import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { 
  Heart, 
  TrendingUp, 
  Calendar,
  Target,
  Award,
  Users,
  DollarSign,
  ArrowUpRight,
  Gift,
  Star,
  Church,
  Clock
} from 'lucide-react';

// Mock member giving data
const memberGivingData = [
  { month: 'Jan', amount: 1200, frequency: 4, categories: { tithes: 800, offerings: 200, special: 200 } },
  { month: 'Feb', amount: 1500, frequency: 4, categories: { tithes: 1000, offerings: 300, special: 200 } },
  { month: 'Mar', amount: 1100, frequency: 3, categories: { tithes: 800, offerings: 150, special: 150 } },
  { month: 'Apr', amount: 1800, frequency: 5, categories: { tithes: 1200, offerings: 300, special: 300 } },
  { month: 'May', amount: 1600, frequency: 4, categories: { tithes: 1100, offerings: 250, special: 250 } },
  { month: 'Jun', amount: 2000, frequency: 4, categories: { tithes: 1400, offerings: 300, special: 300 } }
];

const givingMilestones = [
  { title: 'Faithful Giver', description: 'Give for 6 consecutive months', achieved: true, progress: 100 },
  { title: 'Generous Heart', description: 'Reach R10,000 total giving', achieved: true, progress: 100 },
  { title: 'Community Builder', description: 'Support 3 church projects', achieved: false, progress: 66 },
  { title: 'Mission Partner', description: 'Give R25,000 lifetime total', achieved: false, progress: 45 }
];

const projectContributions = [
  { name: 'Youth Building Fund', contributed: 2500, target: 5000, percentage: 50 },
  { name: 'Mission Trip 2024', contributed: 1200, target: 2000, percentage: 60 },
  { name: 'Community Outreach', contributed: 800, target: 1500, percentage: 53 }
];

const givingCategories = [
  { name: 'Tithes', value: 65, amount: 6300, color: '#8B5CF6' },
  { name: 'Offerings', value: 20, amount: 1950, color: '#F59E0B' },
  { name: 'Special Gifts', value: 15, amount: 1450, color: '#10B981' }
];

interface MemberGivingAnalyticsProps {
  memberName?: string;
}

export default function MemberGivingAnalytics({ memberName = "John Doe" }: MemberGivingAnalyticsProps) {
  const [timeRange, setTimeRange] = useState('6months');
  
  const totalGiving = memberGivingData.reduce((sum, month) => sum + month.amount, 0);
  const averageMonthly = Math.round(totalGiving / memberGivingData.length);
  const thisMonth = memberGivingData[memberGivingData.length - 1];
  const lastMonth = memberGivingData[memberGivingData.length - 2];
  const monthlyGrowth = ((thisMonth.amount - lastMonth.amount) / lastMonth.amount * 100).toFixed(1);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-4 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-semibold text-gray-900 mb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: R {entry.value?.toLocaleString()}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">My Giving Journey</h2>
          <p className="text-gray-600">Track your generosity and impact</p>
        </div>
        <Badge className="bg-churpay-gradient text-white">
          <Heart className="h-4 w-4 mr-1" />
          Faithful Giver
        </Badge>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-purple-700">Total Giving</p>
                <p className="text-2xl font-bold text-purple-900">R {totalGiving.toLocaleString()}</p>
                <p className="text-sm text-purple-600">Past 6 months</p>
              </div>
              <div className="w-12 h-12 bg-churpay-gradient rounded-lg flex items-center justify-center">
                <Heart className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-yellow-700">Monthly Average</p>
                <p className="text-2xl font-bold text-yellow-900">R {averageMonthly.toLocaleString()}</p>
                <div className="flex items-center mt-1">
                  <ArrowUpRight className="h-4 w-4 text-green-600" />
                  <span className="text-sm text-green-600 ml-1">+{monthlyGrowth}% vs last month</span>
                </div>
              </div>
              <div className="w-12 h-12 bg-yellow-500 rounded-lg flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-700">Projects Supported</p>
                <p className="text-2xl font-bold text-green-900">{projectContributions.length}</p>
                <p className="text-sm text-green-600">Active campaigns</p>
              </div>
              <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center">
                <Target className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-700">Giving Frequency</p>
                <p className="text-2xl font-bold text-blue-900">{thisMonth.frequency}/month</p>
                <p className="text-sm text-blue-600">Recent activity</p>
              </div>
              <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center">
                <Clock className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Giving Trend Chart */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Giving Trend</CardTitle>
              <div className="flex items-center space-x-2">
                <Button
                  variant={timeRange === '3months' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setTimeRange('3months')}
                  className={timeRange === '3months' ? 'bg-churpay-gradient text-white' : ''}
                >
                  3M
                </Button>
                <Button
                  variant={timeRange === '6months' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setTimeRange('6months')}
                  className={timeRange === '6months' ? 'bg-churpay-gradient text-white' : ''}
                >
                  6M
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={memberGivingData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="month" stroke="#666" />
                  <YAxis stroke="#666" />
                  <Tooltip content={<CustomTooltip />} />
                  <Area
                    type="monotone"
                    dataKey="amount"
                    stroke="#8B5CF6"
                    fill="url(#givingGradient)"
                    strokeWidth={2}
                  />
                  <defs>
                    <linearGradient id="givingGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0.05} />
                    </linearGradient>
                  </defs>
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Giving Categories */}
        <Card>
          <CardHeader>
            <CardTitle>Giving Categories</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={givingCategories}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {givingCategories.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value: any, name: any, props: any) => [
                      `R ${props.payload.amount.toLocaleString()}`, 
                      name
                    ]}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Project Contributions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Target className="h-5 w-5 mr-2 text-purple-600" />
            Project Contributions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {projectContributions.map((project, index) => (
              <div key={index} className="p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold text-gray-900">{project.name}</h4>
                  <Badge variant="outline">
                    {project.percentage}% Complete
                  </Badge>
                </div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600">
                    R {project.contributed.toLocaleString()} of R {project.target.toLocaleString()}
                  </span>
                  <span className="text-sm font-medium text-purple-600">
                    Your contribution: R {(project.contributed * 0.1).toLocaleString()}
                  </span>
                </div>
                <Progress value={project.percentage} className="h-2" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Giving Milestones */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Award className="h-5 w-5 mr-2 text-yellow-600" />
            Giving Milestones
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {givingMilestones.map((milestone, index) => (
              <div key={index} className={`p-4 rounded-lg border-2 ${milestone.achieved ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'}`}>
                <div className="flex items-center justify-between mb-2">
                  <h4 className={`font-semibold ${milestone.achieved ? 'text-green-900' : 'text-gray-900'}`}>
                    {milestone.title}
                  </h4>
                  {milestone.achieved ? (
                    <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                      <Star className="h-4 w-4 text-white" />
                    </div>
                  ) : (
                    <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                      <Star className="h-4 w-4 text-gray-600" />
                    </div>
                  )}
                </div>
                <p className={`text-sm mb-3 ${milestone.achieved ? 'text-green-700' : 'text-gray-600'}`}>
                  {milestone.description}
                </p>
                <div className="flex items-center justify-between">
                  <Progress value={milestone.progress} className="flex-1 mr-3 h-2" />
                  <span className={`text-sm font-medium ${milestone.achieved ? 'text-green-600' : 'text-gray-600'}`}>
                    {milestone.progress}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Giving Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              { date: '2024-01-15', amount: 500, type: 'Tithe', status: 'Completed' },
              { date: '2024-01-12', amount: 200, type: 'Youth Building Fund', status: 'Completed' },
              { date: '2024-01-08', amount: 150, type: 'Sunday Offering', status: 'Completed' },
              { date: '2024-01-05', amount: 300, type: 'Mission Trip', status: 'Completed' }
            ].map((activity, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-churpay-gradient rounded-lg flex items-center justify-center">
                    <Gift className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{activity.type}</p>
                    <p className="text-sm text-gray-600">{activity.date}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-gray-900">R {activity.amount}</p>
                  <Badge variant="outline" className="text-green-600 border-green-200">
                    {activity.status}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}