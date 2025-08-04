import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Progress } from "./ui/progress";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { 
  Plus,
  Calendar,
  Target,
  Users,
  DollarSign,
  TrendingUp,
  Clock,
  Share2,
  Edit,
  MoreHorizontal
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";

export function Campaigns() {
  const campaigns = [
    {
      id: "C001",
      name: "New Church Building",
      description: "Funding for our new sanctuary that will seat 500 congregants",
      goal: 150000,
      raised: 75000,
      donors: 45,
      status: "Active",
      startDate: "2024-12-01",
      endDate: "2025-06-30",
      category: "Infrastructure",
      image: "https://images.unsplash.com/photo-1520637836862-4d197d17c93a?w=400&h=200&fit=crop",
      recentDonations: [
        { name: "John Smith", amount: 500, time: "2 hours ago" },
        { name: "Mary Johnson", amount: 250, time: "5 hours ago" },
        { name: "David Wilson", amount: 1000, time: "1 day ago" }
      ]
    },
    {
      id: "C002",
      name: "Youth Ministry Trip",
      description: "Annual youth camp and missionary trip to rural communities",
      goal: 20000,
      raised: 12500,
      donors: 28,
      status: "Active",
      startDate: "2025-01-15",
      endDate: "2025-03-01",
      category: "Ministry",
      image: "https://images.unsplash.com/photo-1529390079861-591de354faf5?w=400&h=200&fit=crop",
      recentDonations: [
        { name: "Sarah Brown", amount: 200, time: "3 hours ago" },
        { name: "Peter Davis", amount: 150, time: "1 day ago" }
      ]
    },
    {
      id: "C003",
      name: "Community Outreach",
      description: "Food distribution and support for local families in need",
      goal: 15000,
      raised: 8900,
      donors: 67,
      status: "Active",
      startDate: "2024-11-01",
      endDate: "2025-02-28",
      category: "Outreach",
      image: "https://images.unsplash.com/photo-1559027615-cd4628902d4a?w=400&h=200&fit=crop",
      recentDonations: [
        { name: "Lisa Miller", amount: 100, time: "4 hours ago" },
        { name: "Robert Taylor", amount: 75, time: "6 hours ago" },
        { name: "Emma Wilson", amount: 300, time: "1 day ago" }
      ]
    },
    {
      id: "C004",
      name: "Sound System Upgrade",
      description: "New audio equipment for better worship experience",
      goal: 25000,
      raised: 25000,
      donors: 35,
      status: "Completed",
      startDate: "2024-08-01",
      endDate: "2024-12-31",
      category: "Equipment",
      image: "https://images.unsplash.com/photo-1516280440614-37939bbacd81?w=400&h=200&fit=crop",
      recentDonations: []
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Active": return "bg-green-100 text-green-800";
      case "Completed": return "bg-blue-100 text-blue-800";
      case "Draft": return "bg-gray-100 text-gray-800";
      case "Paused": return "bg-yellow-100 text-yellow-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "Infrastructure": return "bg-purple-100 text-purple-800";
      case "Ministry": return "bg-blue-100 text-blue-800";
      case "Outreach": return "bg-green-100 text-green-800";
      case "Equipment": return "bg-orange-100 text-orange-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const calculateDaysRemaining = (endDate: string) => {
    const end = new Date(endDate);
    const now = new Date();
    const diffTime = end.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

  const activeCampaigns = campaigns.filter(c => c.status === "Active").length;
  const totalRaised = campaigns.reduce((sum, c) => sum + c.raised, 0);
  const totalGoal = campaigns.reduce((sum, c) => sum + c.goal, 0);
  const totalDonors = campaigns.reduce((sum, c) => sum + c.donors, 0);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Campaigns</h1>
          <p className="text-gray-600">Manage fundraising campaigns and track progress</p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Create Campaign
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Active Campaigns</p>
                <p className="text-lg font-semibold">{activeCampaigns}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <DollarSign className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Raised</p>
                <p className="text-lg font-semibold">R {totalRaised.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <Target className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Progress</p>
                <p className="text-lg font-semibold">{Math.round((totalRaised / totalGoal) * 100)}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                <Users className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Donors</p>
                <p className="text-lg font-semibold">{totalDonors}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Campaigns Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {campaigns.map((campaign) => (
          <Card key={campaign.id} className="overflow-hidden">
            <div className="h-48 bg-gray-200 relative">
              <img 
                src={campaign.image} 
                alt={campaign.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-4 left-4 flex space-x-2">
                <Badge className={getStatusColor(campaign.status)}>
                  {campaign.status}
                </Badge>
                <Badge className={getCategoryColor(campaign.category)}>
                  {campaign.category}
                </Badge>
              </div>
              <div className="absolute top-4 right-4">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="secondary" size="sm">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>
                      <Edit className="h-4 w-4 mr-2" />
                      Edit Campaign
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Share2 className="h-4 w-4 mr-2" />
                      Share Campaign
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      View Analytics
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
            
            <CardContent className="p-6">
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{campaign.name}</h3>
                  <p className="text-sm text-gray-600 mt-1">{campaign.description}</p>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Progress</span>
                    <span className="font-medium">
                      R {campaign.raised.toLocaleString()} of R {campaign.goal.toLocaleString()}
                    </span>
                  </div>
                  <Progress value={(campaign.raised / campaign.goal) * 100} className="h-2" />
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>{Math.round((campaign.raised / campaign.goal) * 100)}% funded</span>
                    <span>{campaign.donors} donors</span>
                  </div>
                </div>

                {campaign.status === "Active" && (
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center text-gray-600">
                      <Clock className="h-4 w-4 mr-1" />
                      {calculateDaysRemaining(campaign.endDate)} days left
                    </div>
                    <div className="flex items-center text-gray-600">
                      <Calendar className="h-4 w-4 mr-1" />
                      Ends {new Date(campaign.endDate).toLocaleDateString()}
                    </div>
                  </div>
                )}

                {campaign.recentDonations.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 mb-2">Recent Donations</h4>
                    <div className="space-y-2">
                      {campaign.recentDonations.slice(0, 3).map((donation, index) => (
                        <div key={index} className="flex items-center justify-between text-sm">
                          <div className="flex items-center space-x-2">
                            <Avatar className="w-6 h-6">
                              <AvatarFallback className="text-xs bg-purple-100 text-purple-600">
                                {donation.name.split(' ').map(n => n[0]).join('')}
                              </AvatarFallback>
                            </Avatar>
                            <span className="text-gray-900">{donation.name}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className="font-medium">R {donation.amount}</span>
                            <span className="text-gray-500 text-xs">{donation.time}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex space-x-2 pt-2">
                  <Button className="flex-1">View Details</Button>
                  <Button variant="outline" size="sm">
                    <Share2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}