import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Badge } from "./ui/badge";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { 
  Search, 
  Filter,
  MoreHorizontal,
  Eye,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Building2,
  Users,
  DollarSign,
  Calendar,
  MapPin,
  Phone,
  Mail
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";

export function ChurchManagement() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const churches = [
    {
      id: "CH001",
      name: "Rhema Bible Church",
      pastor: "Pastor Ray McCauley",
      email: "admin@rhema.co.za",
      phone: "+27 11 781 0421",
      location: "Johannesburg, GP",
      status: "Active",
      members: 2450,
      monthlyRevenue: 45230,
      joinDate: "2023-01-15",
      lastActive: "2025-01-20",
      verification: "Verified",
      plan: "Premium"
    },
    {
      id: "CH002",
      name: "Grace Family Church",
      pastor: "Pastor John Smith",
      email: "info@gracefamily.co.za",
      phone: "+27 21 555 0123",
      location: "Cape Town, WC",
      status: "Active",
      members: 1890,
      monthlyRevenue: 38950,
      joinDate: "2023-03-20",
      lastActive: "2025-01-20",
      verification: "Verified",
      plan: "Standard"
    },
    {
      id: "CH003",
      name: "Faith Baptist Church",
      pastor: "Pastor Michael Johnson",
      email: "contact@faithbaptist.co.za",
      phone: "+27 31 789 4567",
      location: "Durban, KZN",
      status: "Pending",
      members: 0,
      monthlyRevenue: 0,
      joinDate: "2025-01-18",
      lastActive: "2025-01-19",
      verification: "Pending",
      plan: "Basic"
    },
    {
      id: "CH004",
      name: "Hope Methodist Church",
      pastor: "Pastor Sarah Williams",
      email: "admin@hopemethodist.org.za",
      phone: "+27 12 345 6789",
      location: "Pretoria, GP",
      status: "Suspended",
      members: 850,
      monthlyRevenue: 0,
      joinDate: "2022-11-10",
      lastActive: "2024-12-15",
      verification: "Under Review",
      plan: "Standard"
    },
    {
      id: "CH005",
      name: "Unity Pentecostal Church",
      pastor: "Pastor David Brown",
      email: "info@unitypentecostal.co.za",
      phone: "+27 41 567 8901",
      location: "Port Elizabeth, EC",
      status: "Active",
      members: 1240,
      monthlyRevenue: 28650,
      joinDate: "2023-08-05",
      lastActive: "2025-01-19",
      verification: "Verified",
      plan: "Standard"
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Active": return "bg-green-100 text-green-800";
      case "Pending": return "bg-yellow-100 text-yellow-800";
      case "Suspended": return "bg-red-100 text-red-800";
      case "Inactive": return "bg-gray-100 text-gray-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getVerificationColor = (verification: string) => {
    switch (verification) {
      case "Verified": return "bg-green-100 text-green-800";
      case "Pending": return "bg-yellow-100 text-yellow-800";
      case "Under Review": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getPlanColor = (plan: string) => {
    switch (plan) {
      case "Premium": return "bg-purple-100 text-purple-800";
      case "Standard": return "bg-blue-100 text-blue-800";
      case "Basic": return "bg-gray-100 text-gray-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const filteredChurches = churches.filter(church => {
    const matchesSearch = church.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         church.pastor.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         church.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         church.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || church.status.toLowerCase() === statusFilter.toLowerCase();
    return matchesSearch && matchesStatus;
  });

  const stats = [
    { label: "Total Churches", value: churches.length, icon: Building2 },
    { label: "Active Churches", value: churches.filter(c => c.status === "Active").length, icon: CheckCircle },
    { label: "Pending Approval", value: churches.filter(c => c.status === "Pending").length, icon: AlertTriangle },
    { label: "Total Members", value: churches.reduce((sum, c) => sum + c.members, 0), icon: Users }
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Church Management</h1>
          <p className="text-gray-600">Manage all churches on the ChurPay platform</p>
        </div>
        <div className="flex space-x-3">
          <Button variant="outline">
            <Filter className="h-4 w-4 mr-2" />
            Bulk Actions
          </Button>
          <Button>
            <Building2 className="h-4 w-4 mr-2" />
            Add Church
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {stats.map((stat, index) => {
          const IconComponent = stat.icon;
          return (
            <Card key={index}>
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center">
                    <IconComponent className="h-5 w-5 text-slate-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">{stat.label}</p>
                    <p className="text-lg font-semibold">{stat.value.toLocaleString()}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Churches Table */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
            <CardTitle>All Churches</CardTitle>
            <div className="flex space-x-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search churches..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 w-80"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Filter status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="suspended">Suspended</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Church</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Members</TableHead>
                  <TableHead>Revenue</TableHead>
                  <TableHead>Plan</TableHead>
                  <TableHead>Last Active</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredChurches.map((church) => (
                  <TableRow key={church.id}>
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        <Avatar>
                          <AvatarFallback className="bg-purple-100 text-purple-600">
                            {church.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">{church.name}</div>
                          <div className="text-sm text-gray-500">{church.pastor}</div>
                          <div className="text-xs text-gray-400">ID: {church.id}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center text-sm">
                          <Mail className="h-3 w-3 mr-1 text-gray-400" />
                          <span className="truncate max-w-40">{church.email}</span>
                        </div>
                        <div className="flex items-center text-sm">
                          <Phone className="h-3 w-3 mr-1 text-gray-400" />
                          {church.phone}
                        </div>
                        <div className="flex items-center text-sm">
                          <MapPin className="h-3 w-3 mr-1 text-gray-400" />
                          {church.location}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <Badge className={getStatusColor(church.status)}>
                          {church.status}
                        </Badge>
                        <div className="text-xs">
                          <Badge variant="outline" className={getVerificationColor(church.verification)}>
                            {church.verification}
                          </Badge>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <Users className="h-4 w-4 mr-1 text-gray-400" />
                        <span className="font-medium">{church.members.toLocaleString()}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <DollarSign className="h-4 w-4 mr-1 text-gray-400" />
                        <span className="font-medium">R {church.monthlyRevenue.toLocaleString()}</span>
                        <div className="text-xs text-gray-500 ml-1">/month</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getPlanColor(church.plan)}>
                        {church.plan}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div>{new Date(church.lastActive).toLocaleDateString()}</div>
                        <div className="text-xs text-gray-500 flex items-center">
                          <Calendar className="h-3 w-3 mr-1" />
                          Joined {new Date(church.joinDate).toLocaleDateString()}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            <Eye className="h-4 w-4 mr-2" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Approve
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem>
                            Edit Church
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            Contact Pastor
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            View Analytics
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-red-600">
                            <XCircle className="h-4 w-4 mr-2" />
                            Suspend Church
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
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