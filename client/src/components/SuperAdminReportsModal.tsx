import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  FileText, 
  Download,
  BarChart3,
  Calendar,
  DollarSign,
  TrendingUp,
  Users,
  Building2,
  Activity,
  PieChart,
  LineChart
} from "lucide-react";

interface SuperAdminReportsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SuperAdminReportsModal({
  isOpen,
  onClose
}: SuperAdminReportsModalProps) {
  const [reportType, setReportType] = useState("");
  const [dateRange, setDateRange] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerateReport = async () => {
    if (!reportType || !dateRange) return;
    
    setIsGenerating(true);
    // Simulate report generation
    setTimeout(() => {
      setIsGenerating(false);
      // Here you would typically trigger a download or show the report
    }, 2000);
  };

  const reportTypes = [
    {
      id: 'revenue',
      title: 'Revenue Analytics',
      description: 'Comprehensive revenue breakdown and trends',
      icon: DollarSign,
      color: 'green'
    },
    {
      id: 'churches',
      title: 'Church Performance',
      description: 'Church-wise analytics and member growth',
      icon: Building2,
      color: 'blue'
    },
    {
      id: 'members',
      title: 'Member Insights',
      description: 'Member engagement and donation patterns',
      icon: Users,
      color: 'purple'
    },
    {
      id: 'payouts',
      title: 'Payout Summary',
      description: 'Payout processing and fee analytics',
      icon: Activity,
      color: 'orange'
    },
    {
      id: 'platform',
      title: 'Platform Overview',
      description: 'Complete platform performance metrics',
      icon: BarChart3,
      color: 'indigo'
    }
  ];

  const dateRanges = [
    { value: 'last_7_days', label: 'Last 7 Days' },
    { value: 'last_30_days', label: 'Last 30 Days' },
    { value: 'last_3_months', label: 'Last 3 Months' },
    { value: 'last_6_months', label: 'Last 6 Months' },
    { value: 'last_year', label: 'Last Year' },
    { value: 'ytd', label: 'Year to Date' },
    { value: 'custom', label: 'Custom Range' }
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-5xl max-h-[90vh] overflow-y-auto bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
        <DialogHeader className="pb-6">
          <DialogTitle className="flex items-center space-x-3 text-xl">
            <div className="p-2 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-lg">
              <FileText className="h-5 w-5 text-white" />
            </div>
            <span className="bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
              Platform Reports & Analytics
            </span>
          </DialogTitle>
          <DialogDescription className="text-base text-gray-600 dark:text-gray-300">
            Generate comprehensive reports on platform performance, revenue, and user metrics
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Report Configuration */}
          <Card className="border-0 bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 shadow-lg">
            <CardHeader>
              <CardTitle className="text-lg flex items-center space-x-2">
                <BarChart3 className="h-5 w-5 text-purple-600" />
                <span>Report Configuration</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 block">Report Type</label>
                  <Select value={reportType} onValueChange={setReportType}>
                    <SelectTrigger className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                      <SelectValue placeholder="Select report type" />
                    </SelectTrigger>
                    <SelectContent>
                      {reportTypes.map((type) => (
                        <SelectItem key={type.id} value={type.id}>
                          <div className="flex items-center space-x-2">
                            <type.icon className="h-4 w-4" />
                            <span>{type.title}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 block">Date Range</label>
                  <Select value={dateRange} onValueChange={setDateRange}>
                    <SelectTrigger className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                      <SelectValue placeholder="Select date range" />
                    </SelectTrigger>
                    <SelectContent>
                      {dateRanges.map((range) => (
                        <SelectItem key={range.value} value={range.value}>
                          {range.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex justify-end">
                <Button
                  onClick={handleGenerateReport}
                  disabled={!reportType || !dateRange || isGenerating}
                  className="bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white font-medium px-6"
                >
                  {isGenerating ? (
                    <>
                      <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                      Generating...
                    </>
                  ) : (
                    <>
                      <Download className="h-4 w-4 mr-2" />
                      Generate Report
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Available Report Types */}
          <Card className="border-0 bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 shadow-lg">
            <CardHeader>
              <CardTitle className="text-lg flex items-center space-x-2">
                <PieChart className="h-5 w-5 text-indigo-600" />
                <span>Available Report Types</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {reportTypes.map((type) => (
                  <div
                    key={type.id}
                    className={`p-4 rounded-lg border-2 cursor-pointer transition-all duration-300 ${
                      reportType === type.id
                        ? 'border-purple-300 bg-purple-50 dark:bg-purple-900/20 dark:border-purple-600'
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 bg-white dark:bg-gray-800'
                    }`}
                    onClick={() => setReportType(type.id)}
                  >
                    <div className="flex items-start space-x-3">
                      <div className={`p-2 rounded-lg ${
                        type.color === 'green' ? 'bg-green-100 dark:bg-green-900/30' :
                        type.color === 'blue' ? 'bg-blue-100 dark:bg-blue-900/30' :
                        type.color === 'purple' ? 'bg-purple-100 dark:bg-purple-900/30' :
                        type.color === 'orange' ? 'bg-orange-100 dark:bg-orange-900/30' :
                        'bg-indigo-100 dark:bg-indigo-900/30'
                      }`}>
                        <type.icon className={`h-5 w-5 ${
                          type.color === 'green' ? 'text-green-600' :
                          type.color === 'blue' ? 'text-blue-600' :
                          type.color === 'purple' ? 'text-purple-600' :
                          type.color === 'orange' ? 'text-orange-600' :
                          'text-indigo-600'
                        }`} />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 dark:text-white mb-1">{type.title}</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-300">{type.description}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Quick Stats Preview */}
          <Card className="border-0 bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 shadow-lg border border-purple-200 dark:border-purple-800">
            <CardHeader>
              <CardTitle className="text-lg flex items-center space-x-2">
                <LineChart className="h-5 w-5 text-purple-600" />
                <span className="text-purple-800 dark:text-purple-200">Quick Platform Insights</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
                  <DollarSign className="h-8 w-8 text-green-500 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-green-600">R2.8M</div>
                  <div className="text-sm text-gray-600 dark:text-gray-300">Total Revenue</div>
                </div>
                <div className="text-center p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
                  <Building2 className="h-8 w-8 text-blue-500 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-blue-600">247</div>
                  <div className="text-sm text-gray-600 dark:text-gray-300">Active Churches</div>
                </div>
                <div className="text-center p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
                  <Users className="h-8 w-8 text-purple-500 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-purple-600">12.5K</div>
                  <div className="text-sm text-gray-600 dark:text-gray-300">Total Members</div>
                </div>
                <div className="text-center p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
                  <TrendingUp className="h-8 w-8 text-orange-500 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-orange-600">+15.2%</div>
                  <div className="text-sm text-gray-600 dark:text-gray-300">Growth Rate</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recent Reports */}
          <Card className="border-0 bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 shadow-lg">
            <CardHeader>
              <CardTitle className="text-lg flex items-center space-x-2">
                <Calendar className="h-5 w-5 text-indigo-600" />
                <span>Recent Reports</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  { name: 'Monthly Revenue Report - July 2024', type: 'Revenue', date: '2024-08-01', size: '2.4 MB' },
                  { name: 'Church Performance Analysis - Q2', type: 'Churches', date: '2024-07-15', size: '1.8 MB' },
                  { name: 'Member Engagement Insights', type: 'Members', date: '2024-07-10', size: '3.1 MB' },
                ].map((report, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 hover:shadow-sm transition-shadow">
                    <div className="flex items-center space-x-3">
                      <FileText className="h-5 w-5 text-gray-500" />
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">{report.name}</p>
                        <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
                          <Badge variant="outline" className="text-xs">
                            {report.type}
                          </Badge>
                          <span>•</span>
                          <span>{report.date}</span>
                          <span>•</span>
                          <span>{report.size}</span>
                        </div>
                      </div>
                    </div>
                    <Button variant="outline" size="sm" className="bg-white dark:bg-gray-700">
                      <Download className="h-3 w-3 mr-1" />
                      Download
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}