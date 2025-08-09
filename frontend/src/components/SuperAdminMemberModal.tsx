import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  User, Users, Search, Filter, Mail, Phone, 
  Calendar, Wallet, Activity, TrendingUp,
  DollarSign, Building2, Heart, Shield,
  UserCheck, AlertTriangle, CheckCircle
} from 'lucide-react';

interface Member {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  churchName: string;
  churchId: string;
  membershipType: 'regular' | 'premium' | 'leader' | 'admin';
  status: 'active' | 'inactive' | 'suspended' | 'pending';
  joinDate: string;
  lastActivity: string;
  totalDonated: string;
  thisMonthDonated: string;
  walletBalance: string;
  transactionCount: number;
  averageDonation: string;
  province: string;
  city: string;
  verification: {
    emailVerified: boolean;
    phoneVerified: boolean;
    kycCompleted: boolean;
  };
  engagement: {
    loginCount: number;
    donationFrequency: string;
    lastLogin: string;
    favoriteChurch: string;
  };
}

interface SuperAdminMemberModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SuperAdminMemberModal({ open, onOpenChange }: SuperAdminMemberModalProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterMembership, setFilterMembership] = useState<string>('all');
  const [filterProvince, setFilterProvince] = useState<string>('all');
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'detail'>('list');

  const { data: members = [], isLoading } = useQuery<Member[]>({
    queryKey: ['/api/super-admin/members'],
    enabled: open
  });

  const filteredMembers = members.filter(member => {
    const matchesSearch = member.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         member.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         member.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         member.churchName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === 'all' || member.status === filterStatus;
    const matchesMembership = filterMembership === 'all' || member.membershipType === filterMembership;
    const matchesProvince = filterProvince === 'all' || member.province === filterProvince;
    
    return matchesSearch && matchesStatus && matchesMembership && matchesProvince;
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

  const getMembershipColor = (type: string) => {
    switch (type) {
      case 'admin': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'leader': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'premium': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'regular': return 'bg-gray-100 text-gray-800 border-gray-200';
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

  if (viewMode === 'detail' && selectedMember) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto bg-gray-50">
          <div className="bg-white border-b border-gray-200 p-6 -m-6 mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center">
                  <User className="h-5 w-5 text-white" />
                </div>
                <div>
                  <DialogTitle className="text-2xl font-bold text-gray-900">
                    {selectedMember.firstName} {selectedMember.lastName}
                  </DialogTitle>
                  <p className="text-gray-600 text-sm mt-1">Member profile and activity overview</p>
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
            {/* Member Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 bg-green-100 rounded-xl">
                      <DollarSign className="h-8 w-8 text-green-600" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-2xl font-bold text-green-900">R{selectedMember.totalDonated}</h3>
                    <p className="text-green-700 font-medium">Total Donated</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 bg-blue-100 rounded-xl">
                      <Wallet className="h-8 w-8 text-blue-600" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-2xl font-bold text-blue-900">R{selectedMember.walletBalance}</h3>
                    <p className="text-blue-700 font-medium">Wallet Balance</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-purple-50 to-indigo-50 border-purple-200">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 bg-purple-100 rounded-xl">
                      <Activity className="h-8 w-8 text-purple-600" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-2xl font-bold text-purple-900">{selectedMember.transactionCount}</h3>
                    <p className="text-purple-700 font-medium">Transactions</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-orange-50 to-red-50 border-orange-200">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 bg-orange-100 rounded-xl">
                      <Heart className="h-8 w-8 text-orange-600" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-2xl font-bold text-orange-900">R{selectedMember.averageDonation}</h3>
                    <p className="text-orange-700 font-medium">Avg Donation</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Member Information */}
            <Card className="border-0 shadow-lg rounded-2xl overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-gray-800 to-gray-900 text-white pb-4">
                <CardTitle className="text-xl font-bold flex items-center space-x-2">
                  <User className="h-6 w-6" />
                  <span>Member Information</span>
                </CardTitle>
                <p className="text-gray-300 text-sm mt-1">Personal details and membership status</p>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="text-gray-700 font-medium">Full Name</span>
                      <span className="font-bold text-gray-900">{selectedMember.firstName} {selectedMember.lastName}</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="text-gray-700 font-medium">Email Address</span>
                      <span className="font-bold text-gray-900">{selectedMember.email}</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="text-gray-700 font-medium">Phone Number</span>
                      <span className="font-bold text-gray-900">{selectedMember.phone}</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="text-gray-700 font-medium">Location</span>
                      <span className="font-bold text-gray-900">{selectedMember.city}, {selectedMember.province}</span>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="text-gray-700 font-medium">Church</span>
                      <span className="font-bold text-gray-900">{selectedMember.churchName}</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="text-gray-700 font-medium">Join Date</span>
                      <span className="font-bold text-gray-900">{new Date(selectedMember.joinDate).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="text-gray-700 font-medium">Last Activity</span>
                      <span className="font-bold text-gray-900">{selectedMember.lastActivity}</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="text-gray-700 font-medium">Status</span>
                      <Badge className={`${getStatusColor(selectedMember.status)} border font-medium`}>
                        {getStatusIcon(selectedMember.status)}
                        <span className="ml-1 capitalize">{selectedMember.status}</span>
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Verification Status */}
            <Card className="border-0 shadow-lg rounded-2xl overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-blue-600 to-blue-700 text-white pb-4">
                <CardTitle className="text-xl font-bold flex items-center space-x-2">
                  <Shield className="h-6 w-6" />
                  <span>Verification Status</span>
                </CardTitle>
                <p className="text-blue-100 text-sm mt-1">Account verification and security status</p>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Mail className="h-5 w-5 text-blue-600" />
                      <span className="text-gray-700 font-medium">Email Verified</span>
                    </div>
                    <Badge className={selectedMember.verification.emailVerified ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                      {selectedMember.verification.emailVerified ? 'Verified' : 'Pending'}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Phone className="h-5 w-5 text-green-600" />
                      <span className="text-gray-700 font-medium">Phone Verified</span>
                    </div>
                    <Badge className={selectedMember.verification.phoneVerified ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                      {selectedMember.verification.phoneVerified ? 'Verified' : 'Pending'}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <UserCheck className="h-5 w-5 text-purple-600" />
                      <span className="text-gray-700 font-medium">KYC Completed</span>
                    </div>
                    <Badge className={selectedMember.verification.kycCompleted ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                      {selectedMember.verification.kycCompleted ? 'Completed' : 'Pending'}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Engagement Analytics */}
            <Card className="border-0 shadow-lg rounded-2xl overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-purple-600 to-purple-700 text-white pb-4">
                <CardTitle className="text-xl font-bold flex items-center space-x-2">
                  <TrendingUp className="h-6 w-6" />
                  <span>Engagement Analytics</span>
                </CardTitle>
                <p className="text-purple-100 text-sm mt-1">Member activity and engagement metrics</p>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-purple-50 rounded-lg border border-purple-200">
                      <span className="text-purple-700 font-medium">Login Count</span>
                      <span className="font-bold text-xl text-purple-900">{selectedMember.engagement.loginCount}</span>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg border border-green-200">
                      <span className="text-green-700 font-medium">Donation Frequency</span>
                      <span className="font-bold text-xl text-green-900">{selectedMember.engagement.donationFrequency}</span>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg border border-blue-200">
                      <span className="text-blue-700 font-medium">Last Login</span>
                      <span className="font-bold text-xl text-blue-900">{selectedMember.engagement.lastLogin}</span>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-orange-50 rounded-lg border border-orange-200">
                      <span className="text-orange-700 font-medium">This Month</span>
                      <span className="font-bold text-xl text-orange-900">R{selectedMember.thisMonthDonated}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
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
              <Users className="h-5 w-5 text-white" />
            </div>
            <div>
              <DialogTitle className="text-2xl font-bold text-gray-900">Member Management</DialogTitle>
              <p className="text-gray-600 text-sm mt-1">Manage platform members and their activities</p>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {/* Advanced Filters */}
          <Card className="border-0 shadow-sm">
            <CardContent className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search members..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 bg-white border-gray-200"
                  />
                </div>
                
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="bg-white border-gray-200">
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

                <Select value={filterMembership} onValueChange={setFilterMembership}>
                  <SelectTrigger className="bg-white border-gray-200">
                    <SelectValue placeholder="Filter by Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="leader">Leader</SelectItem>
                    <SelectItem value="premium">Premium</SelectItem>
                    <SelectItem value="regular">Regular</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={filterProvince} onValueChange={setFilterProvince}>
                  <SelectTrigger className="bg-white border-gray-200">
                    <SelectValue placeholder="Filter by Province" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Provinces</SelectItem>
                    <SelectItem value="gauteng">Gauteng</SelectItem>
                    <SelectItem value="kwazulu-natal">KwaZulu-Natal</SelectItem>
                    <SelectItem value="western-cape">Western Cape</SelectItem>
                    <SelectItem value="eastern-cape">Eastern Cape</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Member Summary Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-green-100 rounded-xl">
                    <UserCheck className="h-8 w-8 text-green-600" />
                  </div>
                </div>
                <div className="space-y-2">
                  <h3 className="text-2xl font-bold text-green-900">
                    {filteredMembers.filter(m => m.status === 'active').length}
                  </h3>
                  <p className="text-green-700 font-medium">Active Members</p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-blue-100 rounded-xl">
                    <DollarSign className="h-8 w-8 text-blue-600" />
                  </div>
                </div>
                <div className="space-y-2">
                  <h3 className="text-2xl font-bold text-blue-900">
                    R{filteredMembers.reduce((sum, member) => sum + parseFloat((member.totalDonated || '0').replace(/,/g, '')), 0).toLocaleString()}
                  </h3>
                  <p className="text-blue-700 font-medium">Total Donated</p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-purple-50 to-indigo-50 border-purple-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-purple-100 rounded-xl">
                    <Activity className="h-8 w-8 text-purple-600" />
                  </div>
                </div>
                <div className="space-y-2">
                  <h3 className="text-2xl font-bold text-purple-900">
                    {filteredMembers.reduce((sum, member) => sum + member.transactionCount, 0).toLocaleString()}
                  </h3>
                  <p className="text-purple-700 font-medium">Total Transactions</p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-orange-50 to-red-50 border-orange-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-orange-100 rounded-xl">
                    <Wallet className="h-8 w-8 text-orange-600" />
                  </div>
                </div>
                <div className="space-y-2">
                  <h3 className="text-2xl font-bold text-orange-900">
                    R{filteredMembers.reduce((sum, member) => sum + parseFloat((member.walletBalance || '0').replace(/,/g, '')), 0).toLocaleString()}
                  </h3>
                  <p className="text-orange-700 font-medium">Total Wallet Balance</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Members List */}
          <Card className="border-0 shadow-lg rounded-2xl overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-gray-800 to-gray-900 text-white pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-xl font-bold flex items-center space-x-2">
                    <Users className="h-6 w-6" />
                    <span>Platform Members ({filteredMembers.length})</span>
                  </CardTitle>
                  <p className="text-gray-300 text-sm mt-1">Manage member accounts and activities</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              {isLoading ? (
                <div className="space-y-4">
                  {[...Array(8)].map((_, i) => (
                    <div key={i} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg animate-pulse">
                      <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                      </div>
                      <div className="w-20 h-6 bg-gray-200 rounded"></div>
                    </div>
                  ))}
                </div>
              ) : filteredMembers.length === 0 ? (
                <div className="text-center py-12">
                  <div className="p-4 bg-gray-100 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                    <Users className="h-8 w-8 text-gray-400" />
                  </div>
                  <p className="text-gray-600 text-lg font-medium">No members found</p>
                  <p className="text-gray-500 text-sm">Try adjusting your search or filter criteria</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredMembers.map((member) => (
                    <div
                      key={member.id}
                      className="flex items-center justify-between p-4 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer"
                      onClick={() => {
                        setSelectedMember(member);
                        setViewMode('detail');
                      }}
                    >
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-purple-100 to-indigo-100 rounded-full flex items-center justify-center">
                          <User className="h-6 w-6 text-purple-600" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900">{member.firstName} {member.lastName}</h4>
                          <div className="flex items-center space-x-3 text-sm text-gray-600">
                            <span>{member.email}</span>
                            <span>•</span>
                            <span>{member.churchName}</span>
                            <span>•</span>
                            <span>R{member.totalDonated} donated</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-3">
                        <Badge className={`${getMembershipColor(member.membershipType)} border font-medium text-xs`}>
                          {(member.membershipType || 'regular').toUpperCase()}
                        </Badge>
                        <Badge className={`${getStatusColor(member.status)} border font-medium`}>
                          {getStatusIcon(member.status)}
                          <span className="ml-1 capitalize">{member.status}</span>
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