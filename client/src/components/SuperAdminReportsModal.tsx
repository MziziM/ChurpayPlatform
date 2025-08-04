import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  FileText, 
  Download,
  BarChart3,
  Calendar,
  DollarSign,
  TrendingUp
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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <FileText className="h-5 w-5 text-purple-600" />
            <span>Platform Reports & Analytics</span>
          </DialogTitle>
          <DialogDescription>
            Generate comprehensive reports on platform performance and metrics
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Report Configuration */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">Report Type</label>
              <Select value={reportType} onValueChange={setReportType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select report type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="revenue">Revenue Report</SelectItem>
                  <SelectItem value="churches">Church Analytics</SelectItem>
                  <SelectItem value="members">Member Insights</SelectItem>
                  <SelectItem value="payouts">Payout Summary</SelectItem>
                  <SelectItem value="platform">Platform Overview</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">Date Range</label>
              <Select value={dateRange} onValueChange={setDateRange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select date range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="last_7_days">Last 7 Days</SelectItem>
                  <SelectItem value="last_30_days">Last 30 Days</SelectItem>
                  <SelectItem value="last_3_months">Last 3 Months</SelectItem>
                  <SelectItem value="last_6_months">Last 6 Months</SelectItem>
                  <SelectItem value="last_year">Last Year</SelectItem>
                  <SelectItem value="custom">Custom Range</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Quick Reports */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="cursor-pointer hover:shadow-md transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-lg">
                  <DollarSign className="h-5 w-5 text-green-600" />
                  <span>Revenue Dashboard</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-4">
                  Comprehensive revenue analytics across all churches and time periods.
                </p>
                <Button variant="outline" className="w-full">
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Generate Report
                </Button>
              </CardContent>
            </Card>

            <Card className="cursor-pointer hover:shadow-md transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-lg">
                  <TrendingUp className="h-5 w-5 text-blue-600" />
                  <span>Growth Analytics</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-4">
                  Track church and member growth trends across the platform.
                </p>
                <Button variant="outline" className="w-full">
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Generate Report
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Available Reports */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Available Reports</h3>
            
            <div className="space-y-3">
              {[
                { name: 'Monthly Platform Summary', description: 'Complete overview of platform metrics', size: '2.3 MB' },
                { name: 'Church Performance Report', description: 'Individual church analytics and insights', size: '1.8 MB' },
                { name: 'Payout Processing Summary', description: 'PayFast transaction and payout details', size: '956 KB' },
                { name: 'Member Engagement Analysis', description: 'User activity and engagement metrics', size: '1.2 MB' }
              ].map((report, index) => (
                <div key={index} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                  <div className="flex items-center space-x-3">
                    <FileText className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="font-medium text-gray-900">{report.name}</p>
                      <p className="text-sm text-gray-500">{report.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className="text-sm text-gray-500">{report.size}</span>
                    <Button variant="outline" size="sm">
                      <Download className="h-4 w-4 mr-1" />
                      Download
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t">
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
            <Button>
              <Download className="h-4 w-4 mr-2" />
              Generate Custom Report
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}