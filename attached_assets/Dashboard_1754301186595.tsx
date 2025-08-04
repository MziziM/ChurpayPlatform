import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { 
  TrendingUp, 
  TrendingDown, 
  Users, 
  DollarSign, 
  Calendar,
  Heart,
  BarChart3,
  Download,
  Banknote,
  AlertCircle
} from "lucide-react";
import { Progress } from "./ui/progress";
import { PayoutRequestModal } from "./PayoutRequestModal";

export function Dashboard() {
  const [isPayoutModalOpen, setIsPayoutModalOpen] = useState(false);
  
  const stats = [
    {
      title: "Total Donations",
      value: "R 45,230",
      change: "+12.5%",
      trend: "up",
      period: "This month"
    },
    {
      title: "Active Members",
      value: "324",
      change: "+8",
      trend: "up",
      period: "This week"
    },
    {
      title: "Average Donation",
      value: "R 185",
      change: "-3.2%",
      trend: "down",
      period: "This month"
    },
    {
      title: "Campaigns Active",
      value: "3",
      change: "2 ending soon",
      trend: "neutral",
      period: "Current"
    }
  ];

  const recentTransactions = [
    { id: 1, name: "Sarah Johnson", amount: "R 250", type: "Tithe", time: "2 hours ago" },
    { id: 2, name: "Michael Smith", amount: "R 100", type: "Offering", time: "3 hours ago" },
    { id: 3, name: "Mary Williams", amount: "R 500", type: "Building Fund", time: "5 hours ago" },
    { id: 4, name: "David Brown", amount: "R 75", type: "Missions", time: "1 day ago" },
    { id: 5, name: "Lisa Davis", amount: "R 200", type: "Tithe", time: "1 day ago" },
  ];

  const campaigns = [
    { name: "New Church Building", raised: 75000, goal: 150000, donors: 45 },
    { name: "Youth Ministry Trip", raised: 12500, goal: 20000, donors: 28 },
    { name: "Community Outreach", raised: 8900, goal: 15000, donors: 67 },
  ];

  // Payout related data
  const availableBalance = 38450; // Available for payout
  const pendingPayouts = 2;
  const lastPayoutDate = "2025-01-15";

  return (
    <div className="p-6 space-y-6">
      {/* Welcome Section */}
      <div className="bg-churpay-gradient rounded-lg p-6 text-white">
        <h1 className="text-3xl font-bold mb-2">Welcome back, Pastor John!</h1>
        <p className="text-purple-100 mb-4">
          Here's what's happening with your church donations today.
        </p>
        <div className="flex flex-wrap gap-3">
          <Button variant="secondary" className="bg-white text-purple-700 hover:bg-purple-50">
            <Calendar className="h-4 w-4 mr-2" />
            Schedule Service
          </Button>
          <Button variant="outline" className="border-white text-white hover:bg-white/10">
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Payout Balance Card */}
      <Card className="border-l-4 border-l-green-500">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Banknote className="h-5 w-5 text-green-600" />
                <h3 className="font-semibold text-gray-900">Available for Payout</h3>
              </div>
              <div className="text-3xl font-bold text-green-600">
                R {availableBalance.toLocaleString()}
              </div>
              <div className="flex items-center space-x-4 text-sm text-gray-600">
                <span>Last payout: {lastPayoutDate}</span>
                {pendingPayouts > 0 && (
                  <div className="flex items-center space-x-1">
                    <AlertCircle className="h-4 w-4 text-yellow-500" />
                    <span>{pendingPayouts} pending requests</span>
                  </div>
                )}
              </div>
            </div>
            <div className="flex flex-col space-y-2">
              <Button 
                onClick={() => setIsPayoutModalOpen(true)}
                className="bg-green-600 hover:bg-green-700"
              >
                <Banknote className="h-4 w-4 mr-2" />
                Request Payout
              </Button>
              <Button variant="outline" size="sm">
                View History
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
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
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  {index === 0 && <DollarSign className="h-6 w-6 text-purple-600" />}
                  {index === 1 && <Users className="h-6 w-6 text-purple-600" />}
                  {index === 2 && <BarChart3 className="h-6 w-6 text-purple-600" />}
                  {index === 3 && <Heart className="h-6 w-6 text-purple-600" />}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Transactions */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Donations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentTransactions.map((transaction) => (
                <div key={transaction.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                      <DollarSign className="h-5 w-5 text-purple-600" />
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">{transaction.name}</div>
                      <div className="text-sm text-gray-500">{transaction.time}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-gray-900">{transaction.amount}</div>
                    <Badge variant="secondary" className="text-xs">
                      {transaction.type}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
            <Button variant="outline" className="w-full mt-4">
              View All Transactions
            </Button>
          </CardContent>
        </Card>

        {/* Active Campaigns */}
        <Card>
          <CardHeader>
            <CardTitle>Active Campaigns</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {campaigns.map((campaign, index) => (
                <div key={index} className="space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-medium text-gray-900">{campaign.name}</h4>
                      <p className="text-sm text-gray-500">{campaign.donors} donors</p>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-gray-900">
                        R {campaign.raised.toLocaleString()}
                      </div>
                      <div className="text-sm text-gray-500">
                        of R {campaign.goal.toLocaleString()}
                      </div>
                    </div>
                  </div>
                  <Progress value={(campaign.raised / campaign.goal) * 100} className="h-2" />
                  <div className="text-sm text-gray-600">
                    {Math.round((campaign.raised / campaign.goal) * 100)}% completed
                  </div>
                </div>
              ))}
            </div>
            <Button variant="outline" className="w-full mt-4">
              Manage Campaigns
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Payout Request Modal */}
      <PayoutRequestModal 
        isOpen={isPayoutModalOpen}
        onClose={() => setIsPayoutModalOpen(false)}
        availableBalance={availableBalance}
      />
    </div>
  );
}