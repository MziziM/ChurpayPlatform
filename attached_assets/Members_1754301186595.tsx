import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Badge } from "./ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { 
  Search, 
  Plus,
  Mail,
  Phone,
  Calendar,
  DollarSign,
  Users,
  UserCheck,
  UserX
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";

export function Members() {
  const [searchQuery, setSearchQuery] = useState("");

  const members = [
    {
      id: "M001",
      name: "Sarah Johnson",
      email: "sarah.j@email.com",
      phone: "+27 82 123 4567",
      joinDate: "2023-06-15",
      status: "Active",
      totalDonated: 3250,
      lastDonation: "2025-01-20",
      givingFrequency: "Weekly",
      preferredMethod: "Card"
    },
    {
      id: "M002",
      name: "Michael Smith",
      email: "m.smith@email.com",
      phone: "+27 83 234 5678",
      joinDate: "2022-03-10",
      status: "Active",
      totalDonated: 1800,
      lastDonation: "2025-01-20",
      givingFrequency: "Monthly",
      preferredMethod: "EFT"
    },
    {
      id: "M003",
      name: "Mary Williams",
      email: "mary.w@email.com",
      phone: "+27 84 345 6789",
      joinDate: "2024-01-20",
      status: "Active",
      totalDonated: 6500,
      lastDonation: "2025-01-20",
      givingFrequency: "Bi-weekly",
      preferredMethod: "Card"
    },
    {
      id: "M004",
      name: "David Brown",
      email: "d.brown@email.com",
      phone: "+27 85 456 7890",
      joinDate: "2023-11-05",
      status: "Inactive",
      totalDonated: 450,
      lastDonation: "2024-12-15",
      givingFrequency: "Irregular",
      preferredMethod: "Cash"
    },
    {
      id: "M005",
      name: "Lisa Davis",
      email: "lisa.davis@email.com",
      phone: "+27 86 567 8901",
      joinDate: "2024-08-12",
      status: "Active",
      totalDonated: 2100,
      lastDonation: "2025-01-19",
      givingFrequency: "Weekly",
      preferredMethod: "Card"
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Active": return "bg-green-100 text-green-800";
      case "Inactive": return "bg-red-100 text-red-800";
      case "New": return "bg-blue-100 text-blue-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const filteredMembers = members.filter(member =>
    member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    member.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    member.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const activeMembers = members.filter(m => m.status === "Active").length;
  const totalMembers = members.length;
  const totalDonated = members.reduce((sum, m) => sum + m.totalDonated, 0);
  const avgDonation = totalDonated / totalMembers;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Members</h1>
          <p className="text-gray-600">Manage congregation members and track their giving</p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Add Member
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Users className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Members</p>
                <p className="text-lg font-semibold">{totalMembers}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <UserCheck className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Active Members</p>
                <p className="text-lg font-semibold">{activeMembers}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <DollarSign className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Donated</p>
                <p className="text-lg font-semibold">R {totalDonated.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                <Calendar className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Avg per Member</p>
                <p className="text-lg font-semibold">R {Math.round(avgDonation).toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Members Table */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
            <CardTitle>Member Directory</CardTitle>
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search members..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Member</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Total Donated</TableHead>
                  <TableHead>Last Donation</TableHead>
                  <TableHead>Frequency</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredMembers.map((member) => (
                  <TableRow key={member.id}>
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        <Avatar>
                          <AvatarImage src="" />
                          <AvatarFallback className="bg-purple-100 text-purple-600">
                            {getInitials(member.name)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">{member.name}</div>
                          <div className="text-sm text-gray-500">ID: {member.id}</div>
                          <div className="text-xs text-gray-400">
                            Joined: {new Date(member.joinDate).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center text-sm">
                          <Mail className="h-3 w-3 mr-1 text-gray-400" />
                          {member.email}
                        </div>
                        <div className="flex items-center text-sm">
                          <Phone className="h-3 w-3 mr-1 text-gray-400" />
                          {member.phone}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(member.status)}>
                        {member.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-semibold">
                      R {member.totalDonated.toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {new Date(member.lastDonation).toLocaleDateString()}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div>{member.givingFrequency}</div>
                        <div className="text-gray-500 text-xs">{member.preferredMethod}</div>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex space-x-2 justify-end">
                        <Button variant="ghost" size="sm">
                          View
                        </Button>
                        <Button variant="ghost" size="sm">
                          Edit
                        </Button>
                      </div>
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