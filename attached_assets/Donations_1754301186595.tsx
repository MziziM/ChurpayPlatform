import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Badge } from "./ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { 
  Search, 
  Filter, 
  Download, 
  Plus,
  Calendar,
  DollarSign,
  User,
  Tag
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";

export function Donations() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("all");

  const donations = [
    {
      id: "D001",
      donor: "Sarah Johnson",
      email: "sarah.j@email.com",
      amount: 250,
      type: "Tithe",
      method: "Card",
      status: "Completed",
      date: "2025-01-20",
      time: "14:30"
    },
    {
      id: "D002",
      donor: "Michael Smith",
      email: "m.smith@email.com",
      amount: 100,
      type: "Offering",
      method: "EFT",
      status: "Completed",
      date: "2025-01-20",
      time: "12:15"
    },
    {
      id: "D003",
      donor: "Mary Williams",
      email: "mary.w@email.com",
      amount: 500,
      type: "Building Fund",
      method: "Card",
      status: "Pending",
      date: "2025-01-20",
      time: "11:45"
    },
    {
      id: "D004",
      donor: "David Brown",
      email: "d.brown@email.com",
      amount: 75,
      type: "Missions",
      method: "Instant EFT",
      status: "Completed",
      date: "2025-01-19",
      time: "16:20"
    },
    {
      id: "D005",
      donor: "Lisa Davis",
      email: "lisa.davis@email.com",
      amount: 200,
      type: "Tithe",
      method: "Card",
      status: "Failed",
      date: "2025-01-19",
      time: "09:30"
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Completed": return "bg-green-100 text-green-800";
      case "Pending": return "bg-yellow-100 text-yellow-800";
      case "Failed": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "Tithe": return "bg-purple-100 text-purple-800";
      case "Offering": return "bg-blue-100 text-blue-800";
      case "Building Fund": return "bg-orange-100 text-orange-800";
      case "Missions": return "bg-green-100 text-green-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const filteredDonations = donations.filter(donation => {
    const matchesSearch = donation.donor.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         donation.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         donation.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterType === "all" || donation.type.toLowerCase().includes(filterType.toLowerCase());
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Donations</h1>
          <p className="text-gray-600">Manage and track all church donations</p>
        </div>
        <div className="flex space-x-3">
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Manual Entry
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <DollarSign className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Today's Total</p>
                <p className="text-lg font-semibold">R 1,125</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Calendar className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">This Week</p>
                <p className="text-lg font-semibold">R 8,450</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <User className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Active Donors</p>
                <p className="text-lg font-semibold">156</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                <Tag className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Avg. Donation</p>
                <p className="text-lg font-semibold">R 185</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Donations</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search by donor name, email, or ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-full sm:w-48">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="tithe">Tithe</SelectItem>
                <SelectItem value="offering">Offering</SelectItem>
                <SelectItem value="building">Building Fund</SelectItem>
                <SelectItem value="missions">Missions</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Donations Table */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Donor</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Method</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date & Time</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredDonations.map((donation) => (
                  <TableRow key={donation.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{donation.donor}</div>
                        <div className="text-sm text-gray-500">{donation.email}</div>
                        <div className="text-xs text-gray-400">{donation.id}</div>
                      </div>
                    </TableCell>
                    <TableCell className="font-semibold">
                      R {donation.amount.toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <Badge className={getTypeColor(donation.type)}>
                        {donation.type}
                      </Badge>
                    </TableCell>
                    <TableCell>{donation.method}</TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(donation.status)}>
                        {donation.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div>{donation.date}</div>
                        <div className="text-gray-500">{donation.time}</div>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm">
                        View Details
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}