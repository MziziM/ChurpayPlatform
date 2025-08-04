import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQuery } from "@tanstack/react-query";
import { 
  Building2, 
  Users, 
  DollarSign,
  MapPin,
  Mail,
  Phone,
  Calendar,
  TrendingUp,
  Activity,
  Eye,
  Search,
  CheckCircle,
  Clock,
  Star
} from "lucide-react";

interface Church {
  id: string;
  name: string;
  location: string;
  memberCount: number;
  totalRevenue: string;
  status: 'active' | 'pending' | 'suspended';
  joinDate: string;
  contactPerson: string;
  email: string;
  phone: string;
}

interface SuperAdminChurchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SuperAdminChurchModal({
  isOpen,
  onClose
}: SuperAdminChurchModalProps) {
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch churches data
  const { data: churches, isLoading } = useQuery<Church[]>({
    queryKey: ['/api/super-admin/churches'],
    enabled: isOpen
  });

  const filteredChurches = (churches || []).filter(church =>
    church.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    church.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
    church.contactPerson.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'suspended':
        return <Activity className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-500/10 text-green-600 border-green-200';
      case 'pending':
        return 'bg-yellow-500/10 text-yellow-600 border-yellow-200';
      case 'suspended':
        return 'bg-red-500/10 text-red-600 border-red-200';
      default:
        return 'bg-gray-500/10 text-gray-600 border-gray-200';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-7xl max-h-[90vh] overflow-y-auto bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
        <DialogHeader className="pb-6">
          <DialogTitle className="flex items-center space-x-3 text-xl">
            <div className="p-2 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-lg">
              <Building2 className="h-5 w-5 text-white" />
            </div>
            <span className="bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
              Church Management Dashboard
            </span>
          </DialogTitle>
          <DialogDescription className="text-base text-gray-600 dark:text-gray-300">
            Comprehensive oversight and management of all churches on the ChurPay platform
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Search and Actions */}
          <Card className="border-0 bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 shadow-lg">
            <CardContent className="pt-6">
              <div className="flex items-center space-x-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    type="text"
                    placeholder="Search churches by name, location, or contact person..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700"
                  />
                </div>
                <Button variant="outline" className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                  <Activity className="h-4 w-4 mr-2" />
                  Export Data
                </Button>
              </div>
            </CardContent>
          </Card>

          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-1">
              <TabsTrigger value="overview" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-indigo-600 data-[state=active]:text-white">
                Church Overview
              </TabsTrigger>
              <TabsTrigger value="analytics" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-indigo-600 data-[state=active]:text-white">
                Analytics
              </TabsTrigger>
              <TabsTrigger value="verification" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-indigo-600 data-[state=active]:text-white">
                Verification
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4">
              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full"></div>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredChurches.map((church) => (
                    <Card key={church.id} className="border-0 bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div className="flex items-start space-x-4 flex-1">
                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center shadow-lg">
                              <Building2 className="h-6 w-6 text-white" />
                            </div>
                            <div className="flex-1 space-y-3">
                              <div className="flex items-center space-x-3">
                                <h3 className="text-lg font-bold text-gray-900 dark:text-white">{church.name}</h3>
                                <Badge className={`${getStatusColor(church.status)} flex items-center space-x-1 px-2 py-1`}>
                                  {getStatusIcon(church.status)}
                                  <span className="capitalize text-xs font-medium">{church.status}</span>
                                </Badge>
                              </div>
                              
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div className="flex items-center space-x-2">
                                  <MapPin className="h-4 w-4 text-gray-500" />
                                  <span className="text-sm text-gray-600 dark:text-gray-300">{church.location}</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <Users className="h-4 w-4 text-blue-500" />
                                  <span className="text-sm font-medium text-blue-600">{church.memberCount} members</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <DollarSign className="h-4 w-4 text-green-500" />
                                  <span className="text-sm font-bold text-green-600">R{church.totalRevenue}</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <Calendar className="h-4 w-4 text-purple-500" />
                                  <span className="text-sm text-purple-600">{new Date(church.joinDate).toLocaleDateString()}</span>
                                </div>
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                                <div className="flex items-center space-x-2">
                                  <Users className="h-4 w-4 text-gray-500" />
                                  <span className="text-sm text-gray-600 dark:text-gray-300">{church.contactPerson}</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <Mail className="h-4 w-4 text-gray-500" />
                                  <span className="text-sm text-gray-600 dark:text-gray-300">{church.email}</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <Phone className="h-4 w-4 text-gray-500" />
                                  <span className="text-sm text-gray-600 dark:text-gray-300">{church.phone}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex flex-col space-y-2">
                            <Button variant="outline" size="sm" className="bg-white dark:bg-gray-800">
                              <Eye className="h-4 w-4 mr-1" />
                              View Details
                            </Button>
                            <Button variant="outline" size="sm" className="bg-white dark:bg-gray-800">
                              <Activity className="h-4 w-4 mr-1" />
                              Analytics
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="analytics" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="border-0 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 shadow-lg">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center space-x-2">
                      <TrendingUp className="h-5 w-5 text-green-600" />
                      <span className="text-green-800 dark:text-green-200">Revenue Growth</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-green-700 dark:text-green-200">+15.2%</div>
                    <p className="text-sm text-green-600 dark:text-green-300 mt-1">This month</p>
                  </CardContent>
                </Card>

                <Card className="border-0 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 shadow-lg">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center space-x-2">
                      <Building2 className="h-5 w-5 text-blue-600" />
                      <span className="text-blue-800 dark:text-blue-200">Active Churches</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-blue-700 dark:text-blue-200">{filteredChurches.filter(c => c.status === 'active').length}</div>
                    <p className="text-sm text-blue-600 dark:text-blue-300 mt-1">Currently active</p>
                  </CardContent>
                </Card>

                <Card className="border-0 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 shadow-lg">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center space-x-2">
                      <Users className="h-5 w-5 text-purple-600" />
                      <span className="text-purple-800 dark:text-purple-200">Total Members</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-purple-700 dark:text-purple-200">
                      {filteredChurches.reduce((sum, church) => sum + church.memberCount, 0).toLocaleString()}
                    </div>
                    <p className="text-sm text-purple-600 dark:text-purple-300 mt-1">Across all churches</p>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="verification" className="space-y-6">
              <Card className="border-0 bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 shadow-lg">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center space-x-2">
                    <Star className="h-5 w-5 text-yellow-600" />
                    <span>Church Verification Status</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {filteredChurches.filter(church => church.status === 'pending').map((church) => (
                      <div key={church.id} className="flex items-center justify-between p-4 border border-yellow-200 dark:border-yellow-800 rounded-lg bg-yellow-50 dark:bg-yellow-900/20">
                        <div className="flex items-center space-x-3">
                          <Clock className="h-5 w-5 text-yellow-600" />
                          <div>
                            <p className="font-semibold text-yellow-800 dark:text-yellow-200">{church.name}</p>
                            <p className="text-sm text-yellow-600 dark:text-yellow-300">{church.location}</p>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white">
                            Approve
                          </Button>
                          <Button size="sm" variant="outline" className="border-red-200 text-red-600 hover:bg-red-50">
                            Review
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
}