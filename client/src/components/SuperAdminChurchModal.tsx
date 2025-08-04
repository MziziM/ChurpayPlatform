import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Building2, Users, Search, Filter, MapPin, 
  Phone, Mail, Calendar, Shield, CheckCircle,
  AlertTriangle, TrendingUp, DollarSign, 
  Activity, Eye, BarChart3, UserCheck
} from 'lucide-react';

interface Church {
  id: string;
  name: string;
  denomination: string;
  registrationNumber: string;
  status: 'active' | 'inactive' | 'suspended' | 'pending';
  memberCount: number;
  totalRevenue: string;
  monthlyRevenue: string;
  address: string;
  city: string;
  province: string;
  contactEmail: string;
  contactPhone: string;
  registrationDate: string;
  lastActivity: string;
  verification: {
    emailVerified: boolean;
    phoneVerified: boolean;
    documentsVerified: boolean;
    bankingVerified: boolean;
  };
  analytics: {
    totalTransactions: number;
    averageGift: string;
    topDonor: string;
    revenueGrowth: number;
    memberGrowth: number;
  };
}

interface SuperAdminChurchModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SuperAdminChurchModal({ open, onOpenChange }: SuperAdminChurchModalProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterProvince, setFilterProvince] = useState<string>('all');
  const [selectedChurch, setSelectedChurch] = useState<Church | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'detail'>('list');

  const { data: churches = [], isLoading } = useQuery<Church[]>({
    queryKey: ['/api/super-admin/churches'],
    enabled: open
  });

  const filteredChurches = churches.filter(church => {
    const matchesSearch = church.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         church.denomination.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         church.registrationNumber.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === 'all' || church.status === filterStatus;
    const matchesProvince = filterProvince === 'all' || church.province === filterProvince;
    
    return matchesSearch && matchesStatus && matchesProvince;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800 border-green-200';
      case 'inactive': return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'suspended': return 'bg-red-100 text-red-800 border-red-200';
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <CheckCircle className="h-4 w-4" />;
      case 'inactive': return <AlertTriangle className="h-4 w-4" />;
      case 'suspended': return <Shield className="h-4 w-4" />;
      case 'pending': return <Calendar className="h-4 w-4" />;
      default: return <AlertTriangle className="h-4 w-4" />;
    }
  };

  if (viewMode === 'detail' && selectedChurch) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto bg-gray-50">
          <div className="bg-white border-b border-gray-200 p-6 -m-6 mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center">
                  <Building2 className="h-5 w-5 text-white" />
                </div>
                <div>
                  <DialogTitle className="text-2xl font-bold text-gray-900">{selectedChurch.name}</DialogTitle>
                  <p className="text-gray-600 text-sm mt-1">Church management and analytics overview</p>
                </div>
              </div>
              <Button
                variant="ghost"
                onClick={() => setViewMode('list')}
                className="text-gray-500 hover:text-gray-900 hover:bg-gray-100"
              >
                ← Back to List
              </Button>
            </div>
          </div>

          <div className="space-y-6">
            {/* Church Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 bg-blue-100 rounded-xl">
                      <Users className="h-8 w-8 text-blue-600" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-2xl font-bold text-blue-900">{selectedChurch.memberCount}</h3>
                    <p className="text-blue-700 font-medium">Active Members</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 bg-green-100 rounded-xl">
                      <DollarSign className="h-8 w-8 text-green-600" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-2xl font-bold text-green-900">R{selectedChurch.monthlyRevenue}</h3>
                    <p className="text-green-700 font-medium">Monthly Revenue</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-purple-50 to-indigo-50 border-purple-200">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 bg-purple-100 rounded-xl">
                      <TrendingUp className="h-8 w-8 text-purple-600" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-2xl font-bold text-purple-900">{selectedChurch.analytics.revenueGrowth}%</h3>
                    <p className="text-purple-700 font-medium">Revenue Growth</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-orange-50 to-red-50 border-orange-200">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 bg-orange-100 rounded-xl">
                      <Activity className="h-8 w-8 text-orange-600" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Badge className={`${getStatusColor(selectedChurch.status)} border font-medium`}>
                      <span className="capitalize">{selectedChurch.status}</span>
                    </Badge>
                    <p className="text-orange-700 font-medium">Church Status</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Detailed Information Tabs */}
            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="grid w-full grid-cols-4 bg-white border border-gray-200">
                <TabsTrigger value="overview" className="data-[state=active]:bg-purple-50 data-[state=active]:text-purple-700">Overview</TabsTrigger>
                <TabsTrigger value="verification" className="data-[state=active]:bg-purple-50 data-[state=active]:text-purple-700">Verification</TabsTrigger>
                <TabsTrigger value="analytics" className="data-[state=active]:bg-purple-50 data-[state=active]:text-purple-700">Analytics</TabsTrigger>
                <TabsTrigger value="contact" className="data-[state=active]:bg-purple-50 data-[state=active]:text-purple-700">Contact</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-6 mt-6">
                <Card className="border-0 shadow-lg rounded-2xl overflow-hidden">
                  <CardHeader className="bg-gradient-to-r from-gray-800 to-gray-900 text-white pb-4">
                    <CardTitle className="text-xl font-bold flex items-center space-x-2">
                      <Building2 className="h-6 w-6" />
                      <span>Church Information</span>
                    </CardTitle>
                    <p className="text-gray-300 text-sm mt-1">Basic church details and registration info</p>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <span className="text-gray-700 font-medium">Church Name</span>
                          <span className="font-bold text-gray-900">{selectedChurch.name}</span>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <span className="text-gray-700 font-medium">Denomination</span>
                          <span className="font-bold text-gray-900">{selectedChurch.denomination}</span>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <span className="text-gray-700 font-medium">Registration Number</span>
                          <span className="font-bold text-gray-900">{selectedChurch.registrationNumber}</span>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <span className="text-gray-700 font-medium">Registration Date</span>
                          <span className="font-bold text-gray-900">{new Date(selectedChurch.registrationDate).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <span className="text-gray-700 font-medium">Last Activity</span>
                          <span className="font-bold text-gray-900">{selectedChurch.lastActivity}</span>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <span className="text-gray-700 font-medium">Total Revenue</span>
                          <span className="font-bold text-gray-900">R{selectedChurch.totalRevenue}</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="verification" className="space-y-6 mt-6">
                <Card className="border-0 shadow-lg rounded-2xl overflow-hidden">
                  <CardHeader className="bg-gradient-to-r from-blue-600 to-blue-700 text-white pb-4">
                    <CardTitle className="text-xl font-bold flex items-center space-x-2">
                      <Shield className="h-6 w-6" />
                      <span>Verification Status</span>
                    </CardTitle>
                    <p className="text-blue-100 text-sm mt-1">Church verification and compliance status</p>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <Mail className="h-5 w-5 text-blue-600" />
                            <span className="text-gray-700 font-medium">Email Verified</span>
                          </div>
                          <Badge className={selectedChurch.verification.emailVerified ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                            {selectedChurch.verification.emailVerified ? 'Verified' : 'Pending'}
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <Phone className="h-5 w-5 text-green-600" />
                            <span className="text-gray-700 font-medium">Phone Verified</span>
                          </div>
                          <Badge className={selectedChurch.verification.phoneVerified ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                            {selectedChurch.verification.phoneVerified ? 'Verified' : 'Pending'}
                          </Badge>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <Shield className="h-5 w-5 text-purple-600" />
                            <span className="text-gray-700 font-medium">Documents Verified</span>
                          </div>
                          <Badge className={selectedChurch.verification.documentsVerified ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                            {selectedChurch.verification.documentsVerified ? 'Verified' : 'Pending'}
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <DollarSign className="h-5 w-5 text-orange-600" />
                            <span className="text-gray-700 font-medium">Banking Verified</span>
                          </div>
                          <Badge className={selectedChurch.verification.bankingVerified ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                            {selectedChurch.verification.bankingVerified ? 'Verified' : 'Pending'}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="analytics" className="space-y-6 mt-6">
                <Card className="border-0 shadow-lg rounded-2xl overflow-hidden">
                  <CardHeader className="bg-gradient-to-r from-purple-600 to-purple-700 text-white pb-4">
                    <CardTitle className="text-xl font-bold flex items-center space-x-2">
                      <BarChart3 className="h-6 w-6" />
                      <span>Performance Analytics</span>
                    </CardTitle>
                    <p className="text-purple-100 text-sm mt-1">Church performance metrics and insights</p>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-purple-50 rounded-lg border border-purple-200">
                          <span className="text-purple-700 font-medium">Total Transactions</span>
                          <span className="font-bold text-xl text-purple-900">{selectedChurch.analytics.totalTransactions}</span>
                        </div>
                        <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg border border-green-200">
                          <span className="text-green-700 font-medium">Average Gift</span>
                          <span className="font-bold text-xl text-green-900">R{selectedChurch.analytics.averageGift}</span>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg border border-blue-200">
                          <span className="text-blue-700 font-medium">Top Donor</span>
                          <span className="font-bold text-xl text-blue-900">{selectedChurch.analytics.topDonor}</span>
                        </div>
                        <div className="flex items-center justify-between p-4 bg-orange-50 rounded-lg border border-orange-200">
                          <span className="text-orange-700 font-medium">Member Growth</span>
                          <span className="font-bold text-xl text-orange-900">{selectedChurch.analytics.memberGrowth}%</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="contact" className="space-y-6 mt-6">
                <Card className="border-0 shadow-lg rounded-2xl overflow-hidden">
                  <CardHeader className="bg-gradient-to-r from-green-600 to-green-700 text-white pb-4">
                    <CardTitle className="text-xl font-bold flex items-center space-x-2">
                      <MapPin className="h-6 w-6" />
                      <span>Contact Information</span>
                    </CardTitle>
                    <p className="text-green-100 text-sm mt-1">Church location and contact details</p>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <span className="text-gray-700 font-medium">Email Address</span>
                          <span className="font-bold text-gray-900">{selectedChurch.contactEmail}</span>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <span className="text-gray-700 font-medium">Phone Number</span>
                          <span className="font-bold text-gray-900">{selectedChurch.contactPhone}</span>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <span className="text-gray-700 font-medium">City</span>
                          <span className="font-bold text-gray-900">{selectedChurch.city}</span>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <span className="text-gray-700 font-medium">Province</span>
                          <span className="font-bold text-gray-900">{selectedChurch.province}</span>
                        </div>
                        <div className="p-3 bg-gray-50 rounded-lg">
                          <span className="text-gray-700 font-medium block mb-2">Address</span>
                          <span className="font-bold text-gray-900">{selectedChurch.address}</span>
                        </div>
                      </div>
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto bg-gray-50">
        <div className="bg-white border-b border-gray-200 p-6 -m-6 mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center">
              <Building2 className="h-5 w-5 text-white" />
            </div>
            <div>
              <DialogTitle className="text-2xl font-bold text-gray-900">Church Management</DialogTitle>
              <p className="text-gray-600 text-sm mt-1">Manage registered churches and their verification status</p>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {/* Filters and Search */}
          <Card className="border-0 shadow-sm">
            <CardContent className="p-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search by church name, denomination, or registration number..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 bg-white border-gray-200"
                  />
                </div>
                
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="w-48 bg-white border-gray-200">
                    <SelectValue placeholder="Filter by Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                    <SelectItem value="suspended">Suspended</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={filterProvince} onValueChange={setFilterProvince}>
                  <SelectTrigger className="w-48 bg-white border-gray-200">
                    <SelectValue placeholder="Filter by Province" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Provinces</SelectItem>
                    <SelectItem value="gauteng">Gauteng</SelectItem>
                    <SelectItem value="kwazulu-natal">KwaZulu-Natal</SelectItem>
                    <SelectItem value="western-cape">Western Cape</SelectItem>
                    <SelectItem value="eastern-cape">Eastern Cape</SelectItem>
                    <SelectItem value="limpopo">Limpopo</SelectItem>
                    <SelectItem value="mpumalanga">Mpumalanga</SelectItem>
                    <SelectItem value="north-west">North West</SelectItem>
                    <SelectItem value="northern-cape">Northern Cape</SelectItem>
                    <SelectItem value="free-state">Free State</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Church Summary Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-green-100 rounded-xl">
                    <CheckCircle className="h-8 w-8 text-green-600" />
                  </div>
                </div>
                <div className="space-y-2">
                  <h3 className="text-2xl font-bold text-green-900">
                    {filteredChurches.filter(c => c.status === 'active').length}
                  </h3>
                  <p className="text-green-700 font-medium">Active Churches</p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-yellow-50 to-orange-50 border-yellow-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-yellow-100 rounded-xl">
                    <Calendar className="h-8 w-8 text-yellow-600" />
                  </div>
                </div>
                <div className="space-y-2">
                  <h3 className="text-2xl font-bold text-yellow-900">
                    {filteredChurches.filter(c => c.status === 'pending').length}
                  </h3>
                  <p className="text-yellow-700 font-medium">Pending Approval</p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-blue-100 rounded-xl">
                    <Users className="h-8 w-8 text-blue-600" />
                  </div>
                </div>
                <div className="space-y-2">
                  <h3 className="text-2xl font-bold text-blue-900">
                    {filteredChurches.reduce((sum, church) => sum + church.memberCount, 0).toLocaleString()}
                  </h3>
                  <p className="text-blue-700 font-medium">Total Members</p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-purple-50 to-indigo-50 border-purple-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-purple-100 rounded-xl">
                    <DollarSign className="h-8 w-8 text-purple-600" />
                  </div>
                </div>
                <div className="space-y-2">
                  <h3 className="text-2xl font-bold text-purple-900">
                    R{filteredChurches.reduce((sum, church) => sum + parseFloat((church.monthlyRevenue || '0').replace(/,/g, '')), 0).toLocaleString()}
                  </h3>
                  <p className="text-purple-700 font-medium">Monthly Revenue</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Churches List */}
          <Card className="border-0 shadow-lg rounded-2xl overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-gray-800 to-gray-900 text-white pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-xl font-bold flex items-center space-x-2">
                    <Building2 className="h-6 w-6" />
                    <span>Registered Churches ({filteredChurches.length})</span>
                  </CardTitle>
                  <p className="text-gray-300 text-sm mt-1">Manage church registrations and verification</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              {isLoading ? (
                <div className="space-y-4">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg animate-pulse">
                      <div className="w-12 h-12 bg-gray-200 rounded-lg"></div>
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                      </div>
                      <div className="w-20 h-6 bg-gray-200 rounded"></div>
                    </div>
                  ))}
                </div>
              ) : filteredChurches.length === 0 ? (
                <div className="text-center py-12">
                  <div className="p-4 bg-gray-100 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                    <Building2 className="h-8 w-8 text-gray-400" />
                  </div>
                  <p className="text-gray-600 text-lg font-medium">No churches found</p>
                  <p className="text-gray-500 text-sm">Try adjusting your search or filter criteria</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredChurches.map((church) => (
                    <div
                      key={church.id}
                      className="flex items-center justify-between p-4 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer"
                      onClick={() => {
                        setSelectedChurch(church);
                        setViewMode('detail');
                      }}
                    >
                      <div className="flex items-center space-x-4">
                        <div className="p-2 bg-white rounded-lg shadow-sm">
                          <Building2 className="h-6 w-6 text-purple-600" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900">{church.name}</h4>
                          <div className="flex items-center space-x-3 text-sm text-gray-600">
                            <span>{church.denomination}</span>
                            <span>•</span>
                            <span>{church.memberCount} members</span>
                            <span>•</span>
                            <span>{church.city}, {church.province}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-3">
                        <div className="text-right">
                          <p className="font-bold text-gray-900">R{church.monthlyRevenue}</p>
                          <p className="text-xs text-gray-500">monthly revenue</p>
                        </div>
                        <Badge className={`${getStatusColor(church.status)} border font-medium`}>
                          {getStatusIcon(church.status)}
                          <span className="ml-1 capitalize">{church.status}</span>
                        </Badge>
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