import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { 
  Download,
  Calendar,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Users,
  Target,
  BarChart3
} from "lucide-react";
import { LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

export function Reports() {
  const monthlyData = [
    { month: 'Jul', donations: 8500, donors: 45, tithes: 6200, offerings: 2300 },
    { month: 'Aug', donations: 9200, donors: 48, tithes: 6800, offerings: 2400 },
    { month: 'Sep', donations: 8800, donors: 52, tithes: 6500, offerings: 2300 },
    { month: 'Oct', donations: 10500, donors: 58, tithes: 7800, offerings: 2700 },
    { month: 'Nov', donations: 11200, donors: 62, tithes: 8200, offerings: 3000 },
    { month: 'Dec', donations: 15800, donors: 78, tithes: 11200, offerings: 4600 },
    { month: 'Jan', donations: 12400, donors: 65, tithes: 9100, offerings: 3300 },
  ];

  const donationTypeData = [
    { name: 'Tithes', value: 45230, color: '#7C3AED' },
    { name: 'Offerings', value: 18940, color: '#FCD34D' },
    { name: 'Building Fund', value: 12650, color: '#10B981' },
    { name: 'Missions', value: 8430, color: '#F59E0B' },
    { name: 'Youth Ministry', value: 5680, color: '#EF4444' },
  ];

  const weeklyData = [
    { week: 'Week 1', amount: 2800 },
    { week: 'Week 2', amount: 3200 },
    { week: 'Week 3', amount: 2950 },
    { week: 'Week 4', amount: 3450 },
  ];

  const topDonors = [
    { name: 'Mary Williams', amount: 6500, donations: 24 },
    { name: 'John Peterson', amount: 4800, donations: 18 },
    { name: 'Sarah Johnson', amount: 3250, donations: 16 },
    { name: 'Michael Smith', amount: 2900, donations: 14 },
    { name: 'David Brown', amount: 2650, donations: 12 },
  ];

  const getPercentageChange = (current: number, previous: number) => {
    const change = ((current - previous) / previous) * 100;
    return { value: Math.abs(change).toFixed(1), isPositive: change > 0 };
  };

  const currentMonth = monthlyData[monthlyData.length - 1];
  const previousMonth = monthlyData[monthlyData.length - 2];

  const donationsChange = getPercentageChange(currentMonth.donations, previousMonth.donations);
  const donorsChange = getPercentageChange(currentMonth.donors, previousMonth.donors);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Reports & Analytics</h1>
          <p className="text-gray-600">Comprehensive insights into your church's giving patterns</p>
        </div>
        <div className="flex space-x-3">
          <Select defaultValue="6months">
            <SelectTrigger className="w-40">
              <Calendar className="h-4 w-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1month">Last Month</SelectItem>
              <SelectItem value="3months">Last 3 Months</SelectItem>
              <SelectItem value="6months">Last 6 Months</SelectItem>
              <SelectItem value="1year">Last Year</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Donations</p>
                <p className="text-2xl font-bold">R {currentMonth.donations.toLocaleString()}</p>
                <div className="flex items-center mt-1">
                  {donationsChange.isPositive ? (
                    <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                  ) : (
                    <TrendingDown className="h-4 w-4 text-red-500 mr-1" />
                  )}
                  <span className={`text-sm ${donationsChange.isPositive ? 'text-green-600' : 'text-red-600'}`}>
                    {donationsChange.value}% from last month
                  </span>
                </div>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <DollarSign className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active Donors</p>
                <p className="text-2xl font-bold">{currentMonth.donors}</p>
                <div className="flex items-center mt-1">
                  {donorsChange.isPositive ? (
                    <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                  ) : (
                    <TrendingDown className="h-4 w-4 text-red-500 mr-1" />
                  )}
                  <span className={`text-sm ${donorsChange.isPositive ? 'text-green-600' : 'text-red-600'}`}>
                    {donorsChange.value}% from last month
                  </span>
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
                <p className="text-sm text-gray-600">Average Donation</p>
                <p className="text-2xl font-bold">R {Math.round(currentMonth.donations / currentMonth.donors)}</p>
                <div className="flex items-center mt-1">
                  <span className="text-sm text-gray-600">Per donor this month</span>
                </div>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Target className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Growth Rate</p>
                <p className="text-2xl font-bold">+{donationsChange.value}%</p>
                <div className="flex items-center mt-1">
                  <span className="text-sm text-gray-600">Month over month</span>
                </div>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <BarChart3 className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Donation Trends */}
        <Card>
          <CardHeader>
            <CardTitle>Donation Trends</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value) => [`R ${value.toLocaleString()}`, '']} />
                <Area 
                  type="monotone" 
                  dataKey="donations" 
                  stroke="#7C3AED" 
                  fill="url(#colorGradient)" 
                />
                <defs>
                  <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#7C3AED" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#7C3AED" stopOpacity={0.05}/>
                  </linearGradient>
                </defs>
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Donation Types */}
        <Card>
          <CardHeader>
            <CardTitle>Donation Types</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={donationTypeData}
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {donationTypeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => `R ${value.toLocaleString()}`} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weekly Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle>This Month's Weekly Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={weeklyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="week" />
                <YAxis />
                <Tooltip formatter={(value) => [`R ${value.toLocaleString()}`, 'Amount']} />
                <Bar dataKey="amount" fill="#7C3AED" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Top Donors */}
        <Card>
          <CardHeader>
            <CardTitle>Top Donors This Year</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topDonors.map((donor, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                      <span className="text-sm font-medium text-purple-600">
                        {index + 1}
                      </span>
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">{donor.name}</div>
                      <div className="text-sm text-gray-500">{donor.donations} donations</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-gray-900">
                      R {donor.amount.toLocaleString()}
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      Top {Math.round(((5 - index) / 5) * 100)}%
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tithe vs Offering Comparison */}
      <Card>
        <CardHeader>
          <CardTitle>Tithes vs Offerings Comparison</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip formatter={(value, name) => [`R ${value.toLocaleString()}`, name]} />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="tithes" 
                stroke="#7C3AED" 
                strokeWidth={3}
                name="Tithes"
              />
              <Line 
                type="monotone" 
                dataKey="offerings" 
                stroke="#FCD34D" 
                strokeWidth={3}
                name="Offerings"
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}