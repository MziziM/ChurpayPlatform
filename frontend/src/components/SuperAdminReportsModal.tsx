import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  BarChart3, TrendingUp, DollarSign, Users, Building2,
  Calendar, Download, Eye, FileText, Activity,
  PieChartIcon, LineChart, MapPin, Clock,
  Target, AlertTriangle, CheckCircle
} from 'lucide-react';

interface ReportData {
  platformOverview: {
    totalRevenue: string;
    totalTransactions: number;
    totalChurches: number;
    totalMembers: number;
    monthlyGrowth: number;
    averageTransactionValue: string;
  };
  revenueAnalytics: {
    monthlyRevenue: Array<{ month: string; amount: number; }>;
    provinceBreakdown: Array<{ province: string; amount: number; percentage: number; }>;
    topPerformingChurches: Array<{ name: string; revenue: string; growth: number; }>;
  };
  memberInsights: {
    memberGrowth: Array<{ month: string; count: number; }>;
    membershipTypes: Array<{ type: string; count: number; percentage: number; }>;
    engagementMetrics: {
      activeUsers: number;
      averageSessionTime: string;
      retentionRate: number;
    };
  };
  transactionAnalytics: {
    transactionTypes: Array<{ type: string; count: number; amount: string; }>;
    paymentMethods: Array<{ method: string; usage: number; }>;
    peakTimes: Array<{ hour: number; transactions: number; }>;
  };
}

interface SuperAdminReportsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SuperAdminReportsModal({ open, onOpenChange }: SuperAdminReportsModalProps) {
  const [selectedTimeRange, setSelectedTimeRange] = useState<string>('30d');
  const [reportType, setReportType] = useState<string>('overview');

  const { data: reportData, isLoading } = useQuery<ReportData>({
    queryKey: ['/api/super-admin/reports', selectedTimeRange],
    enabled: open
  });

  const generateReport = (type: string) => {
    // This would trigger a report generation process
    console.log(`Generating ${type} report for ${selectedTimeRange}`);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-7xl max-h-[90vh] overflow-y-auto bg-gray-50">
        <div className="bg-white border-b border-gray-200 p-6 -m-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center">
                <BarChart3 className="h-5 w-5 text-white" />
              </div>
              <div>
                <DialogTitle className="text-2xl font-bold text-gray-900">Platform Reports & Analytics</DialogTitle>
                <p className="text-gray-600 text-sm mt-1">Comprehensive insights into platform performance</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Select value={selectedTimeRange} onValueChange={setSelectedTimeRange}>
                <SelectTrigger className="w-32 bg-white border-gray-200">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7d">Last 7 days</SelectItem>
                  <SelectItem value="30d">Last 30 days</SelectItem>
                  <SelectItem value="90d">Last 3 months</SelectItem>
                  <SelectItem value="1y">Last year</SelectItem>
                </SelectContent>
              </Select>
              <Button
                onClick={() => generateReport('comprehensive')}
                className="bg-purple-600 hover:bg-purple-700 text-white"
              >
                <Download className="h-4 w-4 mr-2" />
                Export Report
              </Button>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {/* Platform Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-green-100 rounded-xl">
                    <DollarSign className="h-8 w-8 text-green-600" />
                  </div>
                  <Badge className="bg-green-100 text-green-800">
                    +{reportData?.platformOverview.monthlyGrowth || 0}%
                  </Badge>
                </div>
                <div className="space-y-2">
                  <h3 className="text-2xl font-bold text-green-900">
                    R{reportData?.platformOverview.totalRevenue || '0'}
                  </h3>
                  <p className="text-green-700 font-medium">Total Revenue</p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-blue-100 rounded-xl">
                    <Activity className="h-8 w-8 text-blue-600" />
                  </div>
                </div>
                <div className="space-y-2">
                  <h3 className="text-2xl font-bold text-blue-900">
                    {reportData?.platformOverview.totalTransactions.toLocaleString() || '0'}
                  </h3>
                  <p className="text-blue-700 font-medium">Total Transactions</p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-purple-50 to-indigo-50 border-purple-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-purple-100 rounded-xl">
                    <Building2 className="h-8 w-8 text-purple-600" />
                  </div>
                </div>
                <div className="space-y-2">
                  <h3 className="text-2xl font-bold text-purple-900">
                    {reportData?.platformOverview.totalChurches || '0'}
                  </h3>
                  <p className="text-purple-700 font-medium">Active Churches</p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-orange-50 to-red-50 border-orange-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-orange-100 rounded-xl">
                    <Users className="h-8 w-8 text-orange-600" />
                  </div>
                </div>
                <div className="space-y-2">
                  <h3 className="text-2xl font-bold text-orange-900">
                    {reportData?.platformOverview.totalMembers.toLocaleString() || '0'}
                  </h3>
                  <p className="text-orange-700 font-medium">Platform Members</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Report Tabs */}
          <Tabs defaultValue="revenue" className="w-full">
            <TabsList className="grid w-full grid-cols-4 bg-white border border-gray-200">
              <TabsTrigger value="revenue" className="data-[state=active]:bg-purple-50 data-[state=active]:text-purple-700">
                Revenue Analytics
              </TabsTrigger>
              <TabsTrigger value="members" className="data-[state=active]:bg-purple-50 data-[state=active]:text-purple-700">
                Member Insights
              </TabsTrigger>
              <TabsTrigger value="transactions" className="data-[state=active]:bg-purple-50 data-[state=active]:text-purple-700">
                Transaction Data
              </TabsTrigger>
              <TabsTrigger value="churches" className="data-[state=active]:bg-purple-50 data-[state=active]:text-purple-700">
                Church Performance
              </TabsTrigger>
            </TabsList>

            <TabsContent value="revenue" className="space-y-6 mt-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Province Revenue Breakdown */}
                <Card className="border-0 shadow-lg rounded-2xl overflow-hidden">
                  <CardHeader className="bg-gradient-to-r from-green-600 to-green-700 text-white pb-4">
                    <CardTitle className="text-xl font-bold flex items-center space-x-2">
                      <MapPin className="h-6 w-6" />
                      <span>Revenue by Province</span>
                    </CardTitle>
                    <p className="text-green-100 text-sm mt-1">Geographic revenue distribution</p>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      {reportData?.revenueAnalytics.provinceBreakdown.map((province, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                            <span className="text-gray-700 font-medium">{province.province}</span>
                          </div>
                          <div className="text-right">
                            <span className="font-bold text-gray-900">R{province.amount.toLocaleString()}</span>
                            <p className="text-xs text-gray-500">{province.percentage}% of total</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Top Performing Churches */}
                <Card className="border-0 shadow-lg rounded-2xl overflow-hidden">
                  <CardHeader className="bg-gradient-to-r from-purple-600 to-purple-700 text-white pb-4">
                    <CardTitle className="text-xl font-bold flex items-center space-x-2">
                      <TrendingUp className="h-6 w-6" />
                      <span>Top Performing Churches</span>
                    </CardTitle>
                    <p className="text-purple-100 text-sm mt-1">Highest revenue generating churches</p>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      {reportData?.revenueAnalytics.topPerformingChurches.map((church, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                              <span className="text-purple-600 font-bold text-sm">#{index + 1}</span>
                            </div>
                            <span className="text-gray-700 font-medium">{church.name}</span>
                          </div>
                          <div className="text-right">
                            <span className="font-bold text-gray-900">R{church.revenue}</span>
                            <Badge className="bg-green-100 text-green-800 ml-2">
                              +{church.growth}%
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Average Transaction Value */}
              <Card className="border-0 shadow-lg rounded-2xl overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-blue-600 to-blue-700 text-white pb-4">
                  <CardTitle className="text-xl font-bold flex items-center space-x-2">
                    <Target className="h-6 w-6" />
                    <span>Transaction Metrics</span>
                  </CardTitle>
                  <p className="text-blue-100 text-sm mt-1">Key transaction performance indicators</p>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-200">
                      <div className="text-3xl font-bold text-blue-900 mb-2">
                        R{reportData?.platformOverview.averageTransactionValue || '0'}
                      </div>
                      <p className="text-blue-700 font-medium">Average Transaction</p>
                    </div>
                    <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
                      <div className="text-3xl font-bold text-green-900 mb-2">
                        {reportData?.platformOverview.monthlyGrowth || 0}%
                      </div>
                      <p className="text-green-700 font-medium">Monthly Growth</p>
                    </div>
                    <div className="text-center p-4 bg-purple-50 rounded-lg border border-purple-200">
                      <div className="text-3xl font-bold text-purple-900 mb-2">96.8%</div>
                      <p className="text-purple-700 font-medium">Success Rate</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="members" className="space-y-6 mt-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Membership Types Distribution */}
                <Card className="border-0 shadow-lg rounded-2xl overflow-hidden">
                  <CardHeader className="bg-gradient-to-r from-orange-600 to-orange-700 text-white pb-4">
                    <CardTitle className="text-xl font-bold flex items-center space-x-2">
                      <PieChartIcon className="h-6 w-6" />
                      <span>Membership Distribution</span>
                    </CardTitle>
                    <p className="text-orange-100 text-sm mt-1">Member types breakdown</p>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      {reportData?.memberInsights.membershipTypes.map((type, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <div className={`w-3 h-3 rounded-full ${
                              type.type === 'premium' ? 'bg-orange-500' :
                              type.type === 'leader' ? 'bg-blue-500' :
                              type.type === 'admin' ? 'bg-purple-500' : 'bg-gray-500'
                            }`}></div>
                            <span className="text-gray-700 font-medium capitalize">{type.type}</span>
                          </div>
                          <div className="text-right">
                            <span className="font-bold text-gray-900">{type.count.toLocaleString()}</span>
                            <p className="text-xs text-gray-500">{type.percentage}% of total</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Engagement Metrics */}
                <Card className="border-0 shadow-lg rounded-2xl overflow-hidden">
                  <CardHeader className="bg-gradient-to-r from-indigo-600 to-indigo-700 text-white pb-4">
                    <CardTitle className="text-xl font-bold flex items-center space-x-2">
                      <Activity className="h-6 w-6" />
                      <span>Engagement Metrics</span>
                    </CardTitle>
                    <p className="text-indigo-100 text-sm mt-1">User activity and engagement</p>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 bg-indigo-50 rounded-lg border border-indigo-200">
                        <span className="text-indigo-700 font-medium">Active Users</span>
                        <span className="font-bold text-xl text-indigo-900">
                          {reportData?.memberInsights.engagementMetrics.activeUsers.toLocaleString() || '0'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg border border-green-200">
                        <span className="text-green-700 font-medium">Avg Session Time</span>
                        <span className="font-bold text-xl text-green-900">
                          {reportData?.memberInsights.engagementMetrics.averageSessionTime || '0m'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg border border-blue-200">
                        <span className="text-blue-700 font-medium">Retention Rate</span>
                        <span className="font-bold text-xl text-blue-900">
                          {reportData?.memberInsights.engagementMetrics.retentionRate || 0}%
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="transactions" className="space-y-6 mt-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Transaction Types */}
                <Card className="border-0 shadow-lg rounded-2xl overflow-hidden">
                  <CardHeader className="bg-gradient-to-r from-teal-600 to-teal-700 text-white pb-4">
                    <CardTitle className="text-xl font-bold flex items-center space-x-2">
                      <LineChart className="h-6 w-6" />
                      <span>Transaction Types</span>
                    </CardTitle>
                    <p className="text-teal-100 text-sm mt-1">Breakdown by transaction category</p>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      {reportData?.transactionAnalytics.transactionTypes.map((type, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <div className={`w-3 h-3 rounded-full ${
                              type.type === 'tithe' ? 'bg-purple-500' :
                              type.type === 'donation' ? 'bg-red-500' :
                              type.type === 'project' ? 'bg-blue-500' : 'bg-green-500'
                            }`}></div>
                            <span className="text-gray-700 font-medium capitalize">{type.type}</span>
                          </div>
                          <div className="text-right">
                            <span className="font-bold text-gray-900">{type.count.toLocaleString()}</span>
                            <p className="text-xs text-gray-500">R{type.amount} total</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Payment Methods */}
                <Card className="border-0 shadow-lg rounded-2xl overflow-hidden">
                  <CardHeader className="bg-gradient-to-r from-rose-600 to-rose-700 text-white pb-4">
                    <CardTitle className="text-xl font-bold flex items-center space-x-2">
                      <Target className="h-6 w-6" />
                      <span>Payment Methods</span>
                    </CardTitle>
                    <p className="text-rose-100 text-sm mt-1">Preferred payment options</p>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      {reportData?.transactionAnalytics.paymentMethods.map((method, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <div className="w-3 h-3 bg-rose-500 rounded-full"></div>
                            <span className="text-gray-700 font-medium">{method.method}</span>
                          </div>
                          <div className="text-right">
                            <span className="font-bold text-gray-900">{method.usage}%</span>
                            <p className="text-xs text-gray-500">usage rate</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="churches" className="space-y-6 mt-6">
              <Card className="border-0 shadow-lg rounded-2xl overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-gray-800 to-gray-900 text-white pb-4">
                  <CardTitle className="text-xl font-bold flex items-center space-x-2">
                    <Building2 className="h-6 w-6" />
                    <span>Church Performance Overview</span>
                  </CardTitle>
                  <p className="text-gray-300 text-sm mt-1">Comprehensive church analytics and insights</p>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="text-center p-6 bg-green-50 rounded-lg border border-green-200">
                      <div className="p-3 bg-green-100 rounded-xl w-fit mx-auto mb-4">
                        <CheckCircle className="h-8 w-8 text-green-600" />
                      </div>
                      <div className="text-3xl font-bold text-green-900 mb-2">
                        {reportData?.platformOverview.totalChurches || 0}
                      </div>
                      <p className="text-green-700 font-medium">Active Churches</p>
                    </div>
                    <div className="text-center p-6 bg-blue-50 rounded-lg border border-blue-200">
                      <div className="p-3 bg-blue-100 rounded-xl w-fit mx-auto mb-4">
                        <Users className="h-8 w-8 text-blue-600" />
                      </div>
                      <div className="text-3xl font-bold text-blue-900 mb-2">
                        {Math.round((reportData?.platformOverview.totalMembers || 0) / (reportData?.platformOverview.totalChurches || 1))}
                      </div>
                      <p className="text-blue-700 font-medium">Avg Members/Church</p>
                    </div>
                    <div className="text-center p-6 bg-purple-50 rounded-lg border border-purple-200">
                      <div className="p-3 bg-purple-100 rounded-xl w-fit mx-auto mb-4">
                        <DollarSign className="h-8 w-8 text-purple-600" />
                      </div>
                      <div className="text-3xl font-bold text-purple-900 mb-2">
                        R{Math.round(parseFloat(reportData?.platformOverview.totalRevenue?.replace(/,/g, '') || '0') / (reportData?.platformOverview.totalChurches || 1)).toLocaleString()}
                      </div>
                      <p className="text-purple-700 font-medium">Avg Revenue/Church</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Quick Report Generation */}
          <Card className="border-0 shadow-lg rounded-2xl overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-purple-600 to-purple-700 text-white pb-4">
              <CardTitle className="text-xl font-bold flex items-center space-x-2">
                <FileText className="h-6 w-6" />
                <span>Quick Report Generation</span>
              </CardTitle>
              <p className="text-purple-100 text-sm mt-1">Generate and export detailed reports</p>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Button
                  onClick={() => generateReport('financial')}
                  variant="outline"
                  className="h-20 flex flex-col items-center justify-center space-y-2 border-2 hover:border-green-300 hover:bg-green-50"
                >
                  <DollarSign className="h-6 w-6 text-green-600" />
                  <span className="font-semibold">Financial Report</span>
                </Button>
                <Button
                  onClick={() => generateReport('member')}
                  variant="outline"
                  className="h-20 flex flex-col items-center justify-center space-y-2 border-2 hover:border-blue-300 hover:bg-blue-50"
                >
                  <Users className="h-6 w-6 text-blue-600" />
                  <span className="font-semibold">Member Report</span>
                </Button>
                <Button
                  onClick={() => generateReport('church')}
                  variant="outline"
                  className="h-20 flex flex-col items-center justify-center space-y-2 border-2 hover:border-purple-300 hover:bg-purple-50"
                >
                  <Building2 className="h-6 w-6 text-purple-600" />
                  <span className="font-semibold">Church Report</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}