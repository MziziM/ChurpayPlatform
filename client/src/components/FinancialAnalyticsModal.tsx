import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Input } from './ui/input';
import { 
  BarChart3,
  LineChart,
  PieChart,
  TrendingUp,
  TrendingDown,
  Download,
  Calendar,
  DollarSign,
  Users,
  Target,
  Receipt,
  Heart,
  Rocket,
  Filter,
  RefreshCw,
  ArrowUpRight,
  ArrowDownLeft,
  AlertCircle,
  CheckCircle,
  Clock,
  FileText,
  Printer,
  Mail,
  Share2,
  X,
  Eye,
  Calculator,
  Wallet,
  Building,
  Activity
} from 'lucide-react';

interface FinancialAnalyticsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function FinancialAnalyticsModal({ isOpen, onClose }: FinancialAnalyticsModalProps) {
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedPeriod, setSelectedPeriod] = useState('month');
  const [selectedYear, setSelectedYear] = useState('2024');
  const [isLoading, setIsLoading] = useState(false);

  // Mock financial data - in real app, this would come from API
  const financialData = {
    overview: {
      totalIncome: 156750,
      totalExpenses: 89250,
      netIncome: 67500,
      monthlyGrowth: 12.5,
      memberGiving: 134250,
      projectDonations: 22500,
      averagePerMember: 458,
      activeGivers: 294
    },
    monthlyTrends: [
      { month: 'Jan', income: 42500, expenses: 28500, net: 14000, tithes: 32500, offerings: 10000 },
      { month: 'Feb', income: 38750, expenses: 25750, net: 13000, tithes: 29750, offerings: 9000 },
      { month: 'Mar', income: 45200, expenses: 30200, net: 15000, tithes: 35200, offerings: 10000 },
      { month: 'Apr', income: 47850, expenses: 32850, net: 15000, tithes: 37850, offerings: 10000 },
      { month: 'May', income: 52300, expenses: 35300, net: 17000, tithes: 42300, offerings: 10000 },
      { month: 'Jun', income: 49750, expenses: 33750, net: 16000, tithes: 39750, offerings: 10000 }
    ],
    categoryBreakdown: {
      tithes: { amount: 98500, percentage: 62.8, trend: '+8.2%' },
      offerings: { amount: 35750, percentage: 22.8, trend: '+5.1%' },
      specialOfferings: { amount: 12800, percentage: 8.2, trend: '+15.3%' },
      projectDonations: { amount: 9700, percentage: 6.2, trend: '+22.8%' }
    },
    expenses: {
      operations: { amount: 35000, percentage: 39.2, category: 'Church Operations' },
      salaries: { amount: 28500, percentage: 31.9, category: 'Staff Salaries' },
      utilities: { amount: 12750, percentage: 14.3, category: 'Utilities & Maintenance' },
      outreach: { amount: 8250, percentage: 9.2, category: 'Community Outreach' },
      other: { amount: 4750, percentage: 5.3, category: 'Other Expenses' }
    },
    topGivers: [
      { name: 'Anonymous Donor', amount: 8500, percentage: 5.4, frequency: 'Monthly' },
      { name: 'John & Mary Smith', amount: 6750, percentage: 4.3, frequency: 'Weekly' },
      { name: 'Robert Johnson', amount: 5200, percentage: 3.3, frequency: 'Bi-weekly' },
      { name: 'Sarah Williams', amount: 4850, percentage: 3.1, frequency: 'Monthly' },
      { name: 'Michael Brown', amount: 4200, percentage: 2.7, frequency: 'Weekly' }
    ],
    projects: [
      { name: 'Youth Building Fund', target: 50000, raised: 32500, progress: 65, trend: '+12%' },
      { name: 'Community Outreach', target: 25000, raised: 18750, progress: 75, trend: '+8%' },
      { name: 'Sound System Upgrade', target: 15000, raised: 12200, progress: 81, trend: '+25%' },
      { name: 'Mission Trip Support', target: 20000, raised: 8750, progress: 44, trend: '+18%' }
    ],
    recentTransactions: [
      { id: 1, date: '2024-01-15', member: 'John Smith', type: 'Tithe', amount: 250, status: 'completed' },
      { id: 2, date: '2024-01-15', member: 'Anonymous', type: 'Building Fund', amount: 1000, status: 'completed' },
      { id: 3, date: '2024-01-14', member: 'Sarah Johnson', type: 'Offering', amount: 100, status: 'completed' },
      { id: 4, date: '2024-01-14', member: 'Mike Wilson', type: 'Mission Fund', amount: 500, status: 'pending' },
      { id: 5, date: '2024-01-13', member: 'Lisa Brown', type: 'Tithe', amount: 150, status: 'completed' }
    ]
  };

  const handleRefreshData = async () => {
    setIsLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsLoading(false);
  };

  const handleExportReport = (format: 'pdf' | 'excel' | 'csv') => {
    console.log(`Exporting financial report as ${format}`);
    alert(`Financial report is being generated as ${format.toUpperCase()} and will be downloaded shortly.`);
  };

  const handleEmailReport = () => {
    console.log('Emailing financial report');
    alert('Financial report has been sent to your email address.');
  };

  const formatCurrency = (amount: number) => {
    return `R${amount.toLocaleString()}`;
  };

  const getGrowthColor = (trend: string) => {
    return trend.startsWith('+') ? '#10b981' : '#ef4444';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return '#10b981';
      case 'pending': return '#f59e0b';
      case 'failed': return '#ef4444';
      default: return '#6b7280';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-7xl max-h-[90vh] overflow-y-auto bg-white">
        <DialogHeader>
          <DialogTitle className="text-gray-900">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <BarChart3 className="w-6 h-6 text-purple-600" />
                <span>Financial Analytics & Reports</span>
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRefreshData}
                  disabled={isLoading}
                >
                  <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                  {isLoading ? 'Updating...' : 'Refresh'}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleExportReport('pdf')}
                >
                  <Download className="w-4 h-4 mr-2" />
                  Export
                </Button>
              </div>
            </div>
          </DialogTitle>
          <DialogDescription className="text-gray-600">
            Comprehensive financial insights and analytics for your church.
            Data updated as of {new Date().toLocaleDateString()}.
          </DialogDescription>
        </DialogHeader>

        {/* Period Selection */}
        <div className="flex items-center justify-between mb-6 p-4 rounded-lg bg-gray-50">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Calendar className="w-4 h-4 text-gray-600" />
              <label className="text-sm font-medium text-gray-900">Period:</label>
              <select 
                value={selectedPeriod} 
                onChange={(e) => setSelectedPeriod(e.target.value)}
                className="w-32 px-3 py-2 rounded-md border bg-white border-gray-200 text-gray-900"
              >
                <option value="week">This Week</option>
                <option value="month">This Month</option>
                <option value="quarter">This Quarter</option>
                <option value="year">This Year</option>
                <option value="custom">Custom Range</option>
              </select>
            </div>
            
            <div className="flex items-center space-x-2">
              <label className="text-sm font-medium text-gray-900">Year:</label>
              <select 
                value={selectedYear} 
                onChange={(e) => setSelectedYear(e.target.value)}
                className="w-20 px-3 py-2 rounded-md border bg-white border-gray-200 text-gray-900"
              >
                <option value="2024">2024</option>
                <option value="2023">2023</option>
                <option value="2022">2022</option>
              </select>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Badge variant="secondary" className="bg-green-100 text-green-800">
              <CheckCircle className="w-3 h-3 mr-1" />
              Data Verified
            </Badge>
            <Badge variant="secondary" className="bg-blue-100 text-blue-800">
              <Clock className="w-3 h-3 mr-1" />
              Real-time
            </Badge>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-5 mb-6">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="income">Income Analysis</TabsTrigger>
            <TabsTrigger value="expenses">Expenses</TabsTrigger>
            <TabsTrigger value="projects">Project Funding</TabsTrigger>
            <TabsTrigger value="reports">Reports</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Key Metrics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="p-6 bg-gray-50 border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Income</p>
                    <p className="text-2xl font-bold mt-1 text-gray-900">
                      {formatCurrency(financialData.overview.totalIncome)}
                    </p>
                    <p className="text-sm mt-1 flex items-center text-green-600">
                      <TrendingUp className="w-4 h-4 mr-1" />
                      +{financialData.overview.monthlyGrowth}% vs last month
                    </p>
                  </div>
                  <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                    <ArrowUpRight className="w-6 h-6 text-green-600" />
                  </div>
                </div>
              </Card>

              <Card className="p-6 bg-gray-50 border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Expenses</p>
                    <p className="text-2xl font-bold mt-1 text-gray-900">
                      {formatCurrency(financialData.overview.totalExpenses)}
                    </p>
                    <p className="text-sm mt-1 flex items-center text-orange-600">
                      <ArrowDownLeft className="w-4 h-4 mr-1" />
                      57% of income
                    </p>
                  </div>
                  <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center">
                    <ArrowDownLeft className="w-6 h-6 text-orange-600" />
                  </div>
                </div>
              </Card>

              <Card className="p-6 bg-gray-50 border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Net Income</p>
                    <p className="text-2xl font-bold mt-1 text-gray-900">
                      {formatCurrency(financialData.overview.netIncome)}
                    </p>
                    <p className="text-sm mt-1 flex items-center text-green-600">
                      <TrendingUp className="w-4 h-4 mr-1" />
                      Healthy surplus
                    </p>
                  </div>
                  <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                    <Calculator className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
              </Card>

              <Card className="p-6 bg-gray-50 border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Active Givers</p>
                    <p className="text-2xl font-bold mt-1 text-gray-900">
                      {financialData.overview.activeGivers}
                    </p>
                    <p className="text-sm mt-1 text-gray-600">
                      Avg: {formatCurrency(financialData.overview.averagePerMember)}
                    </p>
                  </div>
                  <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center">
                    <Users className="w-6 h-6 text-purple-600" />
                  </div>
                </div>
              </Card>
            </div>

            {/* Category Breakdown */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-white border border-gray-200">
                <CardHeader>
                  <CardTitle className="text-gray-900">Income Categories</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {Object.entries(financialData.categoryBreakdown).map(([key, data]) => (
                    <div key={key} className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium text-gray-900 capitalize">
                            {key.replace(/([A-Z])/g, ' $1').trim()}
                          </span>
                          <span className="text-sm text-gray-600">{data.percentage}%</span>
                        </div>
                        <Progress value={data.percentage} className="h-2" />
                      </div>
                      <div className="ml-4 text-right">
                        <p className="text-sm font-medium text-gray-900">{formatCurrency(data.amount)}</p>
                        <p className="text-xs" style={{ color: getGrowthColor(data.trend) }}>
                          {data.trend}
                        </p>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card className="bg-white border border-gray-200">
                <CardHeader>
                  <CardTitle className="text-gray-900">Top Contributors</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {financialData.topGivers.map((giver, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900">{giver.name}</p>
                        <p className="text-sm text-gray-600">{giver.frequency}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-gray-900">{formatCurrency(giver.amount)}</p>
                        <p className="text-sm text-gray-600">{giver.percentage}% of total</p>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>

            {/* Projects Progress */}
            <Card className="bg-white border border-gray-200">
              <CardHeader>
                <CardTitle className="text-gray-900">Project Funding Progress</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {financialData.projects.map((project, index) => (
                    <div key={index} className="space-y-3">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium text-gray-900">{project.name}</h4>
                        <Badge variant="outline" className="text-green-600">
                          {project.trend}
                        </Badge>
                      </div>
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm text-gray-600">
                            {formatCurrency(project.raised)} of {formatCurrency(project.target)}
                          </span>
                          <span className="text-sm font-medium text-gray-900">{project.progress}%</span>
                        </div>
                        <Progress value={project.progress} className="h-3" />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="income" className="space-y-6">
            {/* Income Analysis Content */}
            <Card className="bg-white border border-gray-200">
              <CardHeader>
                <CardTitle className="text-gray-900">Monthly Income Trends</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
                  <p className="text-gray-600">Chart visualization would be implemented here with a charting library</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="expenses" className="space-y-6">
            {/* Expenses Analysis Content */}
            <Card className="bg-white border border-gray-200">
              <CardHeader>
                <CardTitle className="text-gray-900">Expense Breakdown</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {Object.entries(financialData.expenses).map(([key, expense]) => (
                  <div key={key} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-gray-900">{expense.category}</span>
                        <span className="text-sm text-gray-600">{expense.percentage}%</span>
                      </div>
                      <Progress value={expense.percentage} className="h-2" />
                    </div>
                    <div className="ml-4 text-right">
                      <p className="font-medium text-gray-900">{formatCurrency(expense.amount)}</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="projects" className="space-y-6">
            {/* Project Funding Analysis */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {financialData.projects.map((project, index) => (
                <Card key={index} className="bg-white border border-gray-200">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg text-gray-900">{project.name}</CardTitle>
                      <Badge variant="outline" className="text-green-600">
                        {project.trend}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-gray-600">Progress</span>
                        <span className="text-sm font-medium text-gray-900">{project.progress}%</span>
                      </div>
                      <Progress value={project.progress} className="h-3" />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Raised:</span>
                      <span className="font-medium text-gray-900">{formatCurrency(project.raised)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Target:</span>
                      <span className="font-medium text-gray-900">{formatCurrency(project.target)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Remaining:</span>
                      <span className="font-medium text-gray-900">{formatCurrency(project.target - project.raised)}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="reports" className="space-y-6">
            {/* Reports Section */}
            <Card className="bg-white border border-gray-200">
              <CardHeader>
                <CardTitle className="text-gray-900">Generate Reports</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Button 
                    variant="outline" 
                    className="h-20 flex-col space-y-2"
                    onClick={() => handleExportReport('pdf')}
                  >
                    <FileText className="w-6 h-6" />
                    <span>PDF Report</span>
                  </Button>
                  <Button 
                    variant="outline" 
                    className="h-20 flex-col space-y-2"
                    onClick={() => handleExportReport('excel')}
                  >
                    <BarChart3 className="w-6 h-6" />
                    <span>Excel Export</span>
                  </Button>
                  <Button 
                    variant="outline" 
                    className="h-20 flex-col space-y-2"
                    onClick={handleEmailReport}
                  >
                    <Mail className="w-6 h-6" />
                    <span>Email Report</span>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Recent Transactions */}
            <Card className="bg-white border border-gray-200">
              <CardHeader>
                <CardTitle className="text-gray-900">Recent Transactions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="border-b border-gray-200">
                      <tr>
                        <th className="text-left p-2 text-gray-600">Date</th>
                        <th className="text-left p-2 text-gray-600">Member</th>
                        <th className="text-left p-2 text-gray-600">Type</th>
                        <th className="text-left p-2 text-gray-600">Amount</th>
                        <th className="text-left p-2 text-gray-600">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {financialData.recentTransactions.map((transaction) => (
                        <tr key={transaction.id} className="border-b border-gray-100">
                          <td className="p-2 text-sm text-gray-900">{transaction.date}</td>
                          <td className="p-2 text-sm text-gray-900">{transaction.member}</td>
                          <td className="p-2 text-sm text-gray-900">{transaction.type}</td>
                          <td className="p-2 text-sm font-medium text-gray-900">{formatCurrency(transaction.amount)}</td>
                          <td className="p-2">
                            <Badge 
                              variant="outline" 
                              style={{ 
                                color: getStatusColor(transaction.status),
                                borderColor: getStatusColor(transaction.status)
                              }}
                            >
                              {transaction.status}
                            </Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}