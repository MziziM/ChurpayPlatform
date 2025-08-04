import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { 
  TrendingUp, 
  TrendingDown, 
  Building2, 
  DollarSign, 
  Users,
  AlertTriangle,
  CheckCircle,
  Clock,
  CreditCard,
  Activity
} from "lucide-react";
import { Progress } from "./ui/progress";
import { LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export function SuperAdminOverview() {
  const platformStats = [
    {
      title: "Total Churches",
      value: "847",
      change: "+23",
      trend: "up",
      period: "This month",
      icon: Building2
    },
    {
      title: "Platform Revenue",
      value: "R 124,580",
      change: "+18.5%",
      trend: "up",
      period: "This month",
      icon: DollarSign
    },
    {
      title: "Active Users",
      value: "12,450",
      change: "+8.2%",
      trend: "up",
      period: "This month",
      icon: Users
    },
    {
      title: "System Health",
      value: "99.8%",
      change: "Uptime",
      trend: "neutral",
      period: "Last 30 days",
      icon: Activity
    }
  ];

  const revenueData = [
    { month: 'Jul', revenue: 85000, churches: 45, transactions: 1200 },
    { month: 'Aug', revenue: 92000, churches: 48, transactions: 1350 },
    { month: 'Sep', revenue: 88000, churches: 52, transactions: 1280 },
    { month: 'Oct', revenue: 105000, churches: 58, transactions: 1450 },
    { month: 'Nov', revenue: 112000, churches: 62, transactions: 1580 },
    { month: 'Dec', revenue: 128000, churches: 78, transactions: 1820 },
    { month: 'Jan', revenue: 124580, churches: 65, transactions: 1675 },
  ];

  const recentAlerts = [
    { id: 1, type: "warning", message: "High payout request volume detected", church: "Grace Community Church", time: "2 hours ago" },
    { id: 2, type: "info", message: "New church application pending review", church: "Faith Baptist Church", time: "4 hours ago" },
    { id: 3, type: "error", message: "Payment processing failure reported", church: "Hope Methodist Church", time: "6 hours ago" },
    { id: 4, type: "success", message: "Church verification completed", church: "Unity Pentecostal Church", time: "1 day ago" }
  ];

  const topChurches = [
    { name: "Rhema Bible Church", revenue: 45230, members: 2450, growth: "+12%" },
    { name: "Grace Family Church", revenue: 38950, members: 1890, growth: "+8%" },
    { name: "Hillsong Johannesburg", revenue: 34680, members: 1650, growth: "+15%" },
    { name: "His People Church", revenue: 29450, members: 1420, growth: "+5%" },
    { name: "Christian Revival Church", revenue: 26780, members: 1285, growth: "+18%" }
  ];

  const pendingActions = [
    { type: "Church Applications", count: 8, urgent: 3 },
    { type: "Payout Requests", count: 24, urgent: 2 },
    { type: "Support Tickets", count: 15, urgent: 5 },
    { type: "Compliance Reviews", count: 6, urgent: 1 }
  ];

  const getAlertIcon = (type: string) => {
    switch (type) {
      case "error": return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case "warning": return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case "success": return <CheckCircle className="h-4 w-4 text-green-500" />;
      default: return <Clock className="h-4 w-4 text-blue-500" />;
    }
  };

  const getAlertBg = (type: string) => {
    switch (type) {
      case "error": return "bg-red-50 border-red-200";
      case "warning": return "bg-yellow-50 border-yellow-200";
      case "success": return "bg-green-50 border-green-200";
      default: return "bg-blue-50 border-blue-200";
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-700 rounded-lg p-6 text-white">
        <h1 className="text-3xl font-bold mb-2">ChurPay Platform Overview</h1>
        <p className="text-slate-200 mb-4">
          Monitor and manage the entire ChurPay ecosystem from this central dashboard.
        </p>
        <div className="flex flex-wrap gap-3">
          <Button variant="secondary" className="bg-white text-slate-700 hover:bg-slate-100">
            <Building2 className="h-4 w-4 mr-2" />
            Review Applications
          </Button>
          <Button variant="outline" className="border-white text-white hover:bg-white/10">
            <CreditCard className="h-4 w-4 mr-2" />
            Process Payouts
          </Button>
        </div>
      </div>

      {/* Key Platform Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {platformStats.map((stat, index) => {
          const IconComponent = stat.icon;
          return (
            <Card key={index}>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-gray-600">
                  {stat.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
                    <div className="flex items-center mt-1">
                      {stat.trend === "up" && (
                        <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                      )}
                      {stat.trend === "down" && (
                        <TrendingDown className="h-4 w-4 text-red-500 mr-1" />
                      )}
                      <span 
                        className={`text-sm ${
                          stat.trend === "up" 
                            ? "text-green-600" 
                            : stat.trend === "down" 
                            ? "text-red-600" 
                            : "text-gray-600"
                        }`}
                      >
                        {stat.change}
                      </span>
                    </div>
                    <div className="text-xs text-gray-500 mt-1">{stat.period}</div>
                  </div>
                  <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center">
                    <IconComponent className="h-6 w-6 text-slate-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Platform Revenue Trend */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Platform Revenue & Growth</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value, name) => [
                  name === 'revenue' ? `R ${value.toLocaleString()}` : value, 
                  name === 'revenue' ? 'Revenue' : 'Churches'
                ]} />
                <Area 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="#475569" 
                  fill="url(#revenueGradient)" 
                />
                <defs>
                  <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#475569" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#475569" stopOpacity={0.05}/>
                  </linearGradient>
                </defs>
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Pending Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Pending Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {pendingActions.map((action, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <div className="font-medium text-gray-900">{action.type}</div>
                    <div className="text-sm text-gray-500">
                      {action.count} total
                      {action.urgent > 0 && (
                        <span className="text-red-600 ml-1">
                          • {action.urgent} urgent
                        </span>
                      )}
                    </div>
                  </div>
                  <Button variant="outline" size="sm">
                    View
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Performing Churches */}
        <Card>
          <CardHeader>
            <CardTitle>Top Performing Churches</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topChurches.map((church, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                      <span className="text-sm font-medium text-churpay-purple">
                        {index + 1}
                      </span>
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">{church.name}</div>
                      <div className="text-sm text-gray-500">{church.members} members</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-gray-900">
                      R {church.revenue.toLocaleString()}
                    </div>
                    <div className="text-sm text-green-600">{church.growth}</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent System Alerts */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Alerts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentAlerts.map((alert) => (
                <div key={alert.id} className={`p-3 border rounded-lg ${getAlertBg(alert.type)}`}>
                  <div className="flex items-start space-x-3">
                    {getAlertIcon(alert.type)}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900">{alert.message}</p>
                      <p className="text-xs text-gray-600 mt-1">
                        {alert.church} • {alert.time}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <Button variant="outline" className="w-full mt-4">
              View All Alerts
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Quick Stats Bar */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-green-50 border-green-200">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-700">R 2.4M</div>
            <div className="text-sm text-green-600">Total Processed</div>
          </CardContent>
        </Card>
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-700">98.5%</div>
            <div className="text-sm text-blue-600">Success Rate</div>
          </CardContent>
        </Card>
        <Card className="bg-purple-50 border-purple-200">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-purple-700">1.2s</div>
            <div className="text-sm text-purple-600">Avg Response</div>
          </CardContent>
        </Card>
        <Card className="bg-orange-50 border-orange-200">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-orange-700">24/7</div>
            <div className="text-sm text-orange-600">Monitoring</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
