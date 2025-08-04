import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ComposedChart
} from 'recharts';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Calendar,
  Users,
  Church,
  Target,
  ArrowUpRight,
  ArrowDownRight,
  BarChart3,
  PieChart as PieChartIcon,
  Activity,
  Filter,
  Download
} from 'lucide-react';

// Mock financial data for demonstration
const generateMonthlyData = () => {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return months.map((month, index) => ({
    month,
    tithes: 25000 + Math.random() * 15000 + (index * 1200),
    offerings: 12000 + Math.random() * 8000 + (index * 600),
    specialOfferings: 8000 + Math.random() * 12000,
    projectDonations: 15000 + Math.random() * 20000,
    totalRevenue: 0,
    members: 150 + index * 8 + Math.random() * 20,
    avgDonationAmount: 180 + Math.random() * 100,
    newMembers: Math.floor(Math.random() * 15) + 5
  })).map(data => ({
    ...data,
    totalRevenue: data.tithes + data.offerings + data.specialOfferings + data.projectDonations
  }));
};

const generateWeeklyData = () => {
  const weeks = ['Week 1', 'Week 2', 'Week 3', 'Week 4'];
  return weeks.map((week, index) => ({
    week,
    amount: 8000 + Math.random() * 5000 + (index * 500),
    transactions: Math.floor(Math.random() * 50) + 20 + (index * 5),
    avgPerTransaction: 150 + Math.random() * 100
  }));
};

const categoryData = [
  { name: 'Tithes', value: 45, amount: 285000, color: '#8B5CF6' },
  { name: 'Offerings', value: 25, amount: 158000, color: '#F59E0B' },
  { name: 'Special Projects', value: 20, amount: 126000, color: '#10B981' },
  { name: 'Mission Fund', value: 10, amount: 63000, color: '#EF4444' }
];

const churchComparisonData = [
  { church: 'Grace Baptist', thisMonth: 45000, lastMonth: 42000, growth: 7.1 },
  { church: 'Faith Community', thisMonth: 38000, lastMonth: 35000, growth: 8.6 },
  { church: 'Hope Presbyterian', thisMonth: 32000, lastMonth: 29000, growth: 10.3 },
  { church: 'Unity Christian', thisMonth: 28000, lastMonth: 31000, growth: -9.7 },
  { church: 'New Life Methodist', thisMonth: 25000, lastMonth: 23000, growth: 8.7 }
];

interface FinancialTrendsChartProps {
  churchName?: string;
  userType?: 'church' | 'member' | 'super_admin';
}

export default function FinancialTrendsChart({ churchName = "Grace Baptist Church", userType = 'church' }: FinancialTrendsChartProps) {
  const [timeRange, setTimeRange] = useState('12months');
  const [activeTab, setActiveTab] = useState('overview');
  
  const monthlyData = generateMonthlyData();
  const weeklyData = generateWeeklyData();
  
  const currentMonth = monthlyData[monthlyData.length - 1];
  const previousMonth = monthlyData[monthlyData.length - 2];
  const monthlyGrowth = ((currentMonth.totalRevenue - previousMonth.totalRevenue) / previousMonth.totalRevenue * 100).toFixed(1);
  const memberGrowth = ((currentMonth.members - previousMonth.members) / previousMonth.members * 100).toFixed(1);

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

  const renderOverviewTab = () => (
    <div className="space-y-6">
      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Revenue</p>
                <p className="text-2xl font-bold text-gray-900">R {currentMonth.totalRevenue.toLocaleString()}</p>
                <div className="flex items-center mt-1">
                  {parseFloat(monthlyGrowth) > 0 ? (
                    <ArrowUpRight className="h-4 w-4 text-green-600" />
                  ) : (
                    <ArrowDownRight className="h-4 w-4 text-red-600" />
                  )}
                  <span className={`text-sm ml-1 ${parseFloat(monthlyGrowth) > 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {monthlyGrowth}% vs last month
                  </span>
                </div>
              </div>
              <div className="w-12 h-12 bg-churpay-gradient rounded-lg flex items-center justify-center">
                <DollarSign className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active Members</p>
                <p className="text-2xl font-bold text-gray-900">{Math.round(currentMonth.members)}</p>
                <div className="flex items-center mt-1">
                  <ArrowUpRight className="h-4 w-4 text-green-600" />
                  <span className="text-sm text-green-600 ml-1">+{memberGrowth}% growth</span>
                </div>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Avg Donation</p>
                <p className="text-2xl font-bold text-gray-900">R {Math.round(currentMonth.avgDonationAmount)}</p>
                <div className="flex items-center mt-1">
                  <TrendingUp className="h-4 w-4 text-green-600" />
                  <span className="text-sm text-green-600 ml-1">Above average</span>
                </div>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Target className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">New Members</p>
                <p className="text-2xl font-bold text-gray-900">{currentMonth.newMembers}</p>
                <div className="flex items-center mt-1">
                  <Activity className="h-4 w-4 text-purple-600" />
                  <span className="text-sm text-purple-600 ml-1">This month</span>
                </div>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Users className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Revenue Trend Chart */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl font-bold">Revenue Trends</CardTitle>
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
              <Button
                variant={timeRange === '12months' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setTimeRange('12months')}
                className={timeRange === '12months' ? 'bg-churpay-gradient text-white' : ''}
              >
                1Y
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" stroke="#666" />
                <YAxis stroke="#666" />
                <YAxis yAxisId="right" orientation="right" stroke="#666" />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Area
                  type="monotone"
                  dataKey="totalRevenue"
                  fill="url(#revenueGradient)"
                  stroke="#8B5CF6"
                  strokeWidth={2}
                  name="Total Revenue"
                />
                <Line
                  type="monotone"
                  dataKey="members"
                  stroke="#F59E0B"
                  strokeWidth={2}
                  yAxisId="right"
                  name="Active Members"
                />
                <defs>
                  <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0.05} />
                  </linearGradient>
                </defs>
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderCategoryTab = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Breakdown Pie Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Revenue by Category</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={120}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {categoryData.map((entry, index) => (
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

        {/* Category Details */}
        <Card>
          <CardHeader>
            <CardTitle>Category Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {categoryData.map((category, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div 
                      className="w-4 h-4 rounded-full" 
                      style={{ backgroundColor: category.color }}
                    ></div>
                    <div>
                      <p className="font-semibold text-gray-900">{category.name}</p>
                      <p className="text-sm text-gray-600">{category.value}% of total</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-gray-900">R {category.amount.toLocaleString()}</p>
                    <p className="text-sm text-green-600">+5.2% vs last month</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Monthly Category Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Monthly Category Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" stroke="#666" />
                <YAxis stroke="#666" />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Bar dataKey="tithes" stackId="a" fill="#8B5CF6" name="Tithes" />
                <Bar dataKey="offerings" stackId="a" fill="#F59E0B" name="Offerings" />
                <Bar dataKey="specialOfferings" stackId="a" fill="#10B981" name="Special Offerings" />
                <Bar dataKey="projectDonations" stackId="a" fill="#EF4444" name="Project Donations" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderComparisonTab = () => (
    <div className="space-y-6">
      {userType === 'super_admin' && (
        <Card>
          <CardHeader>
            <CardTitle>Church Performance Comparison</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {churchComparisonData.map((church, index) => (
                <div key={index} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-churpay-gradient rounded-lg flex items-center justify-center">
                      <Church className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">{church.church}</h4>
                      <p className="text-sm text-gray-600">Monthly Revenue</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-6">
                    <div className="text-right">
                      <p className="font-bold text-gray-900">R {church.thisMonth.toLocaleString()}</p>
                      <p className="text-sm text-gray-600">vs R {church.lastMonth.toLocaleString()}</p>
                    </div>
                    <div className="flex items-center">
                      {church.growth > 0 ? (
                        <ArrowUpRight className="h-4 w-4 text-green-600" />
                      ) : (
                        <ArrowDownRight className="h-4 w-4 text-red-600" />
                      )}
                      <span className={`text-sm ml-1 ${church.growth > 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {church.growth > 0 ? '+' : ''}{church.growth}%
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quarterly Comparison */}
      <Card>
        <CardHeader>
          <CardTitle>Quarterly Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={[
                { quarter: 'Q1 2024', amount: 180000, target: 200000 },
                { quarter: 'Q2 2024', amount: 220000, target: 210000 },
                { quarter: 'Q3 2024', amount: 195000, target: 205000 },
                { quarter: 'Q4 2024', amount: 245000, target: 220000 }
              ]}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="quarter" stroke="#666" />
                <YAxis stroke="#666" />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Bar dataKey="amount" fill="#8B5CF6" name="Actual Revenue" />
                <Bar dataKey="target" fill="#F59E0B" name="Target Revenue" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Financial Analytics</h2>
          <p className="text-gray-600">{churchName} - Advanced data visualization</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4 mr-2" />
            Filter
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger 
            value="overview"
            className="data-[state=active]:bg-churpay-gradient data-[state=active]:text-white"
          >
            <BarChart3 className="h-4 w-4 mr-2" />
            Overview
          </TabsTrigger>
          <TabsTrigger 
            value="categories"
            className="data-[state=active]:bg-churpay-gradient data-[state=active]:text-white"
          >
            <PieChartIcon className="h-4 w-4 mr-2" />
            Categories
          </TabsTrigger>
          <TabsTrigger 
            value="comparison"
            className="data-[state=active]:bg-churpay-gradient data-[state=active]:text-white"
          >
            <TrendingUp className="h-4 w-4 mr-2" />
            Comparison
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6">
          {renderOverviewTab()}
        </TabsContent>

        <TabsContent value="categories" className="mt-6">
          {renderCategoryTab()}
        </TabsContent>

        <TabsContent value="comparison" className="mt-6">
          {renderComparisonTab()}
        </TabsContent>
      </Tabs>
    </div>
  );
}