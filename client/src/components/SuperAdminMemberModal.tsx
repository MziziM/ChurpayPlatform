import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { 
  Users, 
  Search,
  Eye,
  Mail,
  Phone,
  Building2,
  Calendar,
  DollarSign,
  Activity,
  CheckCircle,
  UserCheck,
  TrendingUp
} from "lucide-react";

interface Member {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  churchName: string;
  totalDonated: string;
  status: 'active' | 'inactive' | 'suspended';
  joinDate: string;
  profileImageUrl?: string;
}

interface SuperAdminMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SuperAdminMemberModal({
  isOpen,
  onClose
}: SuperAdminMemberModalProps) {
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch members data
  const { data: members, isLoading } = useQuery<Member[]>({
    queryKey: ['/api/super-admin/members'],
    enabled: isOpen
  });

  const filteredMembers = (members || []).filter(member =>
    member.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    member.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    member.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    member.churchName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-500/10 text-green-600 border-green-200';
      case 'inactive':
        return 'bg-gray-500/10 text-gray-600 border-gray-200';
      case 'suspended':
        return 'bg-red-500/10 text-red-600 border-red-200';
      default:
        return 'bg-gray-500/10 text-gray-600 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'inactive':
        return <Activity className="h-4 w-4 text-gray-500" />;
      case 'suspended':
        return <Activity className="h-4 w-4 text-red-500" />;
      default:
        return <Activity className="h-4 w-4 text-gray-500" />;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-7xl max-h-[90vh] overflow-y-auto bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
        <DialogHeader className="pb-6">
          <DialogTitle className="flex items-center space-x-3 text-xl">
            <div className="p-2 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-lg">
              <Users className="h-5 w-5 text-white" />
            </div>
            <span className="bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
              Member Management Dashboard
            </span>
          </DialogTitle>
          <DialogDescription className="text-base text-gray-600 dark:text-gray-300">
            Comprehensive overview of all members across the ChurPay platform
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Search and Stats */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <div className="lg:col-span-2">
              <Card className="border-0 bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 shadow-lg">
                <CardContent className="pt-6">
                  <div className="flex items-center space-x-4">
                    <div className="flex-1 relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        type="text"
                        placeholder="Search members by name, email, or church..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700"
                      />
                    </div>
                    <Button variant="outline" className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                      <Activity className="h-4 w-4 mr-2" />
                      Export
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card className="border-0 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 shadow-lg">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center space-x-2">
                  <UserCheck className="h-5 w-5 text-blue-600" />
                  <span className="text-blue-800 dark:text-blue-200">Active Members</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-700 dark:text-blue-200">
                  {filteredMembers.filter(m => m.status === 'active').length}
                </div>
                <p className="text-sm text-blue-600 dark:text-blue-300 mt-1">Currently active</p>
              </CardContent>
            </Card>

            <Card className="border-0 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 shadow-lg">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center space-x-2">
                  <TrendingUp className="h-5 w-5 text-green-600" />
                  <span className="text-green-800 dark:text-green-200">Total Donations</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-700 dark:text-green-200">
                  R{filteredMembers.reduce((sum, member) => sum + parseFloat(member.totalDonated.replace(/,/g, '')), 0).toLocaleString()}
                </div>
                <p className="text-sm text-green-600 dark:text-green-300 mt-1">Lifetime total</p>
              </CardContent>
            </Card>
          </div>

          {/* Members List */}
          <Card className="border-0 bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 shadow-lg">
            <CardHeader>
              <CardTitle className="text-lg flex items-center space-x-2">
                <Users className="h-5 w-5 text-purple-600" />
                <span>Platform Members</span>
                <Badge className="bg-purple-100 text-purple-700 border-purple-200">
                  {filteredMembers.length} total
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full"></div>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredMembers.map((member) => (
                    <div key={member.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-all duration-300 bg-white dark:bg-gray-800 hover:border-purple-300 dark:hover:border-purple-600">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4 flex-1">
                          <div className="w-12 h-12 rounded-full overflow-hidden bg-gradient-to-br from-purple-100 to-indigo-100 dark:from-purple-900 dark:to-indigo-900 flex items-center justify-center shadow-lg">
                            {member.profileImageUrl ? (
                              <img 
                                src={member.profileImageUrl} 
                                alt={`${member.firstName} ${member.lastName}`}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <Users className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                            )}
                          </div>
                          
                          <div className="flex-1 space-y-2">
                            <div className="flex items-center space-x-3">
                              <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                                {member.firstName} {member.lastName}
                              </h3>
                              <Badge className={`${getStatusColor(member.status)} flex items-center space-x-1 px-2 py-1`}>
                                {getStatusIcon(member.status)}
                                <span className="capitalize text-xs font-medium">{member.status}</span>
                              </Badge>
                            </div>
                            
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                              <div className="flex items-center space-x-2">
                                <Mail className="h-4 w-4 text-gray-500" />
                                <span className="text-sm text-gray-600 dark:text-gray-300 truncate">{member.email}</span>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Building2 className="h-4 w-4 text-blue-500" />
                                <span className="text-sm text-blue-600 dark:text-blue-400 truncate">{member.churchName}</span>
                              </div>
                              <div className="flex items-center space-x-2">
                                <DollarSign className="h-4 w-4 text-green-500" />
                                <span className="text-sm font-bold text-green-600 dark:text-green-400">R{member.totalDonated}</span>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Calendar className="h-4 w-4 text-purple-500" />
                                <span className="text-sm text-purple-600 dark:text-purple-400">
                                  {new Date(member.joinDate).toLocaleDateString()}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex flex-col space-y-2">
                          <Button variant="outline" size="sm" className="bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600">
                            <Eye className="h-4 w-4 mr-1" />
                            View Profile
                          </Button>
                          <Button variant="outline" size="sm" className="bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600">
                            <Activity className="h-4 w-4 mr-1" />
                            Activity
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}