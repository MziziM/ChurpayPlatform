import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  CreditCard,
  Banknote,
  PieChart,
  Download,
  AlertCircle,
  CheckCircle,
  Clock,
  Eye,
  Filter,
  Search
} from "lucide-react";
import { Input } from "./ui/input";
import { Progress } from "./ui/progress";
import { LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart as RechartsPieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { PayoutApprovalModal } from "./PayoutApprovalModal";

export function FinancialOverview() {
  const [selectedPayout, setSelectedPayout] = useState(null);
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const platformFinancials = [
    {
      title: "Platform Revenue",
      value: "R 124,580",
      change: "+18.5%",
      trend: "up",
      period: "This month",
      description: "Total platform fees collected"
    },
    {
      title: "Churches Payout",
      value: "R 2,156,430",
      change: "+12.3%",
      trend: "up", 
      period: "This month",
      description: "Total paid out to churches"
    },
    {
      title: "Processing Fees",
      value: "R 45,890",
      change: "+15.2%",
      trend: "up",
      period: "This month",
      description: "Payment processing fees"
    },
    {
      title: "Net Profit",
      value: "R 78,690",
      change: "+22.1%",
      trend: "up",
      period: "This month",
      description: "Platform net profit"
    }
  ];

  const revenueData = [
    { month: 'Jul', platformFees: 85000, processingFees: 32000, netProfit: 53000 },
    { month: 'Aug', platformFees: 92000, processingFees: 35000, netProfit: 57000 },
    { month: 'Sep', platformFees: 88000, processingFees: 33000, netProfit: 55000 },
    { month: 'Oct', platformFees: 105000, processingFees: 38000, netProfit: 67000 },
    { month: 'Nov', platformFees: 112000, processingFees: 41000, netProfit: 71000 },
    { month: 'Dec', platformFees: 128000, processingFees: 45000, netProfit: 83000 },
    { month: 'Jan', platformFees: 124580, processingFees: 45890, netProfit: 78690 },
  ];

  const payoutRequests = [
    {
      id: "PO001",
      church: {
        name: "Rhema Bible Church",
        pastor: "Pastor Ray McCauley",
        email: "admin@rhema.co.za",
        phone: "+27 11 781 0421",
        location: "Johannesburg, GP",
        memberSince: "2023-01-15",
        verification: "Verified" as const
      },
      amount: 45230,
      processingFee: 678,
      netAmount: 44552,
      reference: "Weekly Offerings January 2025",
      notes: "Regular weekly collection for church operations and community outreach programs.",
      requestDate: "2025-01-20",
      status: "Pending" as const,
      bankDetails: {
        bankName: "Standard Bank",
        accountType: "Business Account",
        accountNumber: "123456789",
        accountHolder: "Rhema Bible Church Trust",
        branchCode: "051001"
      },
      riskAssessment: {
        score: 85,
        level: "Low" as const,
        factors: [
          "Established church with 2+ year history",
          "Consistent payout patterns",
          "Verified banking details",
          "Low risk transaction amount"
        ]
      },
      compliance: {
        kycStatus: "Complete" as const,
        amlCheck: "Passed" as const,
        sanctions: "Clear" as const
      },
      history: {
        totalPayouts: 450000,
        lastPayout: "2025-01-15",
        averageAmount: 38500,
        successRate: 100
      }
    },
    {
      id: "PO002",
      church: {
        name: "Grace Family Church",
        pastor: "Pastor John Smith",
        email: "info@gracefamily.co.za",
        phone: "+27 21 555 0123",
        location: "Cape Town, WC",
        memberSince: "2023-03-20",
        verification: "Verified" as const
      },
      amount: 38950,
      processingFee: 584,
      netAmount: 38366,
      reference: "Building Fund Collection",
      requestDate: "2025-01-20",
      status: "Approved" as const,
      bankDetails: {
        bankName: "ABSA Bank",
        accountType: "Cheque Account",
        accountNumber: "987654321",
        accountHolder: "Grace Family Church",
        branchCode: "632005"
      },
      riskAssessment: {
        score: 92,
        level: "Low" as const,
        factors: [
          "Excellent compliance record",
          "Regular donor base",
          "Transparent financial practices"
        ]
      },
      compliance: {
        kycStatus: "Complete" as const,
        amlCheck: "Passed" as const,
        sanctions: "Clear" as const
      },
      history: {
        totalPayouts: 285000,
        lastPayout: "2025-01-18",
        averageAmount: 32200,
        successRate: 98
      }
    },
    {
      id: "PO003",
      church: {
        name: "Unity Pentecostal Church",
        pastor: "Pastor David Brown",
        email: "info@unitypentecostal.co.za", 
        phone: "+27 41 567 8901",
        location: "Port Elizabeth, EC",
        memberSince: "2023-08-05",
        verification: "Verified" as const
      },
      amount: 28650,
      processingFee: 430,
      netAmount: 28220,
      reference: "Monthly Tithes Collection",
      requestDate: "2025-01-19",
      status: "Processing" as const,
      bankDetails: {
        bankName: "FNB",
        accountType: "Business Account", 
        accountNumber: "456789123",
        accountHolder: "Unity Pentecostal Church",
        branchCode: "210835"
      },
      riskAssessment: {
        score: 78,
        level: "Low" as const,
        factors: [
          "Growing congregation",
          "Increasing donation trends",
          "Proper documentation"
        ]
      },
      compliance: {
        kycStatus: "Complete" as const,
        amlCheck: "Passed" as const,
        sanctions: "Clear" as const
      },
      history: {
        totalPayouts: 156000,
        lastPayout: "2025-01-10",
        averageAmount: 26000,
        successRate: 95
      }
    },
    {
      id: "PO004",
      church: {
        name: "Faith Baptist Church",
        pastor: "Pastor Michael Johnson",
        email: "contact@faithbaptist.co.za",
        phone: "+27 31 789 4567",
        location: "Durban, KZN",
        memberSince: "2025-01-18",
        verification: "Pending" as const
      },
      amount: 15420,
      processingFee: 231,
      netAmount: 15189,
      reference: "Initial Collection Setup",
      requestDate: "2025-01-19",
      status: "Completed" as const,
      bankDetails: {
        bankName: "Nedbank",
        accountType: "Savings Account",
        accountNumber: "789123456",
        accountHolder: "Faith Baptist Church",
        branchCode: "198765"
      },
      riskAssessment: {
        score: 65,
        level: "Medium" as const,
        factors: [
          "New church registration",
          "Limited transaction history",
          "Small initial amount"
        ]
      },
      compliance: {
        kycStatus: "Pending" as const,
        amlCheck: "Passed" as const,
        sanctions: "Clear" as const
      },
      history: {
        totalPayouts: 15420,
        lastPayout: "2025-01-19",
        averageAmount: 15420,
        successRate: 100
      }
    },
    {
      id: "PO005",
      church: {
        name: "Hope Methodist Church",
        pastor: "Pastor Sarah Williams",
        email: "admin@hopemethodist.org.za",
        phone: "+27 12 345 6789",
        location: "Pretoria, GP",
        memberSince: "2022-11-10",
        verification: "Under Review" as const
      },
      amount: 22100,
      processingFee: 332,
      netAmount: 21768,
      reference: "Emergency Fund Request",
      notes: "Urgent community assistance for flood relief efforts.",
      requestDate: "2025-01-18",
      status: "Rejected" as const,
      bankDetails: {
        bankName: "Capitec Bank",
        accountType: "Business Account",
        accountNumber: "321654987",
        accountHolder: "Hope Methodist Church",
        branchCode: "470010"
      },
      riskAssessment: {
        score: 45,
        level: "High" as const,
        factors: [
          "Verification under review",
          "Unusual request pattern",
          "Recent compliance issues"
        ]
      },
      compliance: {
        kycStatus: "Expired" as const,
        amlCheck: "Pending" as const,
        sanctions: "Clear" as const
      },
      history: {
        totalPayouts: 89000,
        lastPayout: "2024-12-15",
        averageAmount: 18500,
        successRate: 87
      }
    }
  ];

  const revenueBreakdown = [
    { name: 'Platform Fees (2.5%)', value: 124580, color: '#475569' },
    { name: 'Processing Fees (1.5%)', value: 45890, color: '#7C3AED' },
    { name: 'Premium Subscriptions', value: 28450, color: '#FCD34D' },
    { name: 'Additional Services', value: 12670, color: '#10B981' },
  ];

  const topRevenueChurches = [
    { name: "Rhema Bible Church", platformFee: 1130, totalDonations: 45230, percentage: 18.5 },
    { name: "Grace Family Church", platformFee: 973, totalDonations: 38950, percentage: 15.8 },
    { name: "Hillsong Johannesburg", platformFee: 867, totalDonations: 34680, percentage: 14.1 },
    { name: "His People Church", platformFee: 736, totalDonations: 29450, percentage: 12.0 },
    { name: "Unity Pentecostal Church", platformFee: 716, totalDonations: 28650, percentage: 11.7 }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Completed": return "bg-green-100 text-green-800";
      case "Approved": return "bg-blue-100 text-blue-800";
      case "Processing": return "bg-yellow-100 text-yellow-800";
      case "Pending": return "bg-orange-100 text-orange-800";
      case "Rejected": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Completed": return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "Approved": return <CheckCircle className="h-4 w-4 text-blue-600" />;
      case "Processing": return <Clock className="h-4 w-4 text-yellow-600" />;
      case "Pending": return <Clock className="h-4 w-4 text-orange-600" />;
      case "Rejected": return <AlertCircle className="h-4 w-4 text-red-600" />;
      default: return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  const handleViewPayout = (payout: any) => {
    setSelectedPayout(payout);
    setShowApprovalModal(true);
  };

  const handleApprovePayout = (id: string, notes?: string) => {
    console.log(`Approved payout ${id}`, notes);
    // Update payout status logic here
  };

  const handleRejectPayout = (id: string, reason: string) => {
    console.log(`Rejected payout ${id}`, reason);
    // Update payout status logic here
  };

  const filteredPayouts = payoutRequests.filter(payout => {
    const matchesSearch = payout.church.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         payout.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || payout.status.toLowerCase() === statusFilter.toLowerCase();
    return matchesSearch && matchesStatus;
  });

  const totalPlatformRevenue = revenueBreakdown.reduce((sum, item) => sum + item.value, 0);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Financial Overview</h1>
          <p className="text-gray-600">Monitor platform revenue, fees, and church payouts</p>
        </div>
        <div className="flex space-x-3">
          <Select defaultValue="30days">
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7days">Last 7 Days</SelectItem>
              <SelectItem value="30days">Last 30 Days</SelectItem>
              <SelectItem value="90days">Last 90 Days</SelectItem>
              <SelectItem value="1year">Last Year</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Financial Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {platformFinancials.map((metric, index) => (
          <Card key={index}>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">
                {metric.title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-gray-900">{metric.value}</div>
                  <div className="flex items-center mt-1">
                    {metric.trend === "up" ? (
                      <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                    ) : (
                      <TrendingDown className="h-4 w-4 text-red-500 mr-1" />
                    )}
                    <span className={`text-sm ${metric.trend === "up" ? "text-green-600" : "text-red-600"}`}>
                      {metric.change}
                    </span>
                  </div>
                  <div className="text-xs text-gray-500 mt-1">{metric.period}</div>
                  <div className="text-xs text-gray-400 mt-2">{metric.description}</div>
                </div>
                <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center">
                  {index === 0 && <DollarSign className="h-6 w-6 text-slate-600" />}
                  {index === 1 && <Banknote className="h-6 w-6 text-slate-600" />}
                  {index === 2 && <CreditCard className="h-6 w-6 text-slate-600" />}
                  {index === 3 && <TrendingUp className="h-6 w-6 text-slate-600" />}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Trends */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Revenue Breakdown Over Time</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value) => [`R ${value.toLocaleString()}`, '']} />
                <Legend />
                <Area 
                  type="monotone" 
                  dataKey="platformFees" 
                  stackId="1"
                  stroke="#475569" 
                  fill="#475569"
                  name="Platform Fees"
                />
                <Area 
                  type="monotone" 
                  dataKey="processingFees" 
                  stackId="1"
                  stroke="#7C3AED" 
                  fill="#7C3AED"
                  name="Processing Fees"
                />
                <Area 
                  type="monotone" 
                  dataKey="netProfit" 
                  stackId="1"
                  stroke="#10B981" 
                  fill="#10B981"
                  name="Net Profit"
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Revenue Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Revenue Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <RechartsPieChart>
                <Pie
                  data={revenueBreakdown}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  dataKey="value"
                  label={({ percent }) => `${(percent * 100).toFixed(0)}%`}
                >
                  {revenueBreakdown.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => `R ${value.toLocaleString()}`} />
              </RechartsPieChart>
            </ResponsiveContainer>
            <div className="space-y-2 mt-4">
              {revenueBreakdown.map((item, index) => (
                <div key={index} className="flex items-center justify-between text-sm">
                  <div className="flex items-center space-x-2">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: item.color }}
                    />
                    <span>{item.name}</span>
                  </div>
                  <span className="font-medium">R {item.value.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Enhanced Payout Requests Management */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
            <CardTitle>Payout Requests Management</CardTitle>
            <div className="flex space-x-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search requests..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 w-60"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-32">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="processing">Processing</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredPayouts.map((payout) => (
              <div key={payout.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(payout.status)}
                      <div>
                        <div className="font-medium text-gray-900">{payout.church.name}</div>
                        <div className="text-sm text-gray-500">{payout.church.pastor}</div>
                        <div className="text-xs text-gray-400">
                          {new Date(payout.requestDate).toLocaleDateString()} • {payout.id}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <div className="font-semibold text-gray-900">
                        R {payout.amount.toLocaleString()}
                      </div>
                      <div className="text-sm text-gray-500">
                        Net: R {payout.netAmount.toLocaleString()}
                      </div>
                    </div>
                    <Badge className={getStatusColor(payout.status)}>
                      {payout.status}
                    </Badge>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleViewPayout(payout)}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      Review
                    </Button>
                  </div>
                </div>
                
                <div className="mt-3 flex items-center justify-between text-sm text-gray-600">
                  <span>{payout.reference}</span>
                  <div className="flex items-center space-x-4">
                    <span>Risk: {payout.riskAssessment.level}</span>
                    <span>{payout.bankDetails.bankName}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Top Revenue Churches */}
      <Card>
        <CardHeader>
          <CardTitle>Top Revenue Generating Churches</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {topRevenueChurches.map((church, index) => (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                      <span className="text-sm font-medium text-purple-600">
                        {index + 1}
                      </span>
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">{church.name}</div>
                      <div className="text-sm text-gray-500">
                        R {church.totalDonations.toLocaleString()} total
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-gray-900">
                      R {church.platformFee.toLocaleString()}
                    </div>
                    <div className="text-sm text-gray-500">platform fee</div>
                  </div>
                </div>
                <Progress value={church.percentage} className="h-2" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Payout Approval Modal */}
      <PayoutApprovalModal
        isOpen={showApprovalModal}
        onClose={() => {
          setShowApprovalModal(false);
          setSelectedPayout(null);
        }}
        payoutRequest={selectedPayout}
        onApprove={handleApprovePayout}
        onReject={handleRejectPayout}
      />
    </div>
  );
}