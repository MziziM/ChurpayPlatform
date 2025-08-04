import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  DollarSign, Clock, User, Building2, Calendar, 
  CheckCircle, XCircle, AlertTriangle, Search,
  CreditCard, MapPin, Phone, Mail, Filter,
  TrendingUp, Wallet, Receipt, Shield, Eye
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

interface Payout {
  id: string;
  churchName: string;
  churchId: string;
  amount: string;
  status: 'pending' | 'approved' | 'rejected' | 'processing' | 'completed';
  requestDate: string;
  requestedBy: string;
  description: string;
  bankDetails: {
    accountName: string;
    accountNumber: string;
    bankName: string;
    branchCode: string;
  };
  paymentMethod: 'eft' | 'payfast';
  fees: {
    platformFee: string;
    processingFee: string;
    total: string;
  };
  netAmount: string;
  priority: 'high' | 'medium' | 'low';
  churchDetails: {
    registrationNumber: string;
    contactEmail: string;
    contactPhone: string;
    address: string;
    memberCount: number;
    monthlyRevenue: string;
  };
}

interface SuperAdminPayoutModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SuperAdminPayoutModal({ open, onOpenChange }: SuperAdminPayoutModalProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [selectedPayout, setSelectedPayout] = useState<Payout | null>(null);
  const [processingNote, setProcessingNote] = useState('');
  const [viewMode, setViewMode] = useState<'list' | 'detail'>('list');
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: payouts = [], isLoading } = useQuery<Payout[]>({
    queryKey: ['/api/super-admin/payouts'],
    enabled: open
  });

  const processPayoutMutation = useMutation({
    mutationFn: async ({ payoutId, action, note }: { payoutId: string; action: 'approve' | 'reject'; note: string }) => {
      return apiRequest('POST', `/api/super-admin/payouts/${payoutId}/process`, { action, note });
    },
    onSuccess: (_, { action }) => {
      queryClient.invalidateQueries({ queryKey: ['/api/super-admin/payouts'] });
      toast({
        title: "Payout Updated",
        description: `Payout has been ${action}d successfully.`,
      });
      setSelectedPayout(null);
      setProcessingNote('');
      setViewMode('list');
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to process payout request.",
        variant: "destructive",
      });
    }
  });

  const filteredPayouts = payouts.filter(payout => {
    const matchesSearch = payout.churchName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         payout.requestedBy.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         payout.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === 'all' || payout.status === filterStatus;
    const matchesPriority = filterPriority === 'all' || payout.priority === filterPriority;
    
    return matchesSearch && matchesStatus && matchesPriority;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'approved': return 'bg-green-100 text-green-800 border-green-200';
      case 'rejected': return 'bg-red-100 text-red-800 border-red-200';
      case 'processing': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'completed': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="h-4 w-4" />;
      case 'approved': return <CheckCircle className="h-4 w-4" />;
      case 'rejected': return <XCircle className="h-4 w-4" />;
      case 'processing': return <TrendingUp className="h-4 w-4" />;
      case 'completed': return <CheckCircle className="h-4 w-4" />;
      default: return <AlertTriangle className="h-4 w-4" />;
    }
  };

  if (viewMode === 'detail' && selectedPayout) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-gray-50">
          <div className="bg-white border-b border-gray-200 p-6 -m-6 mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center">
                  <Receipt className="h-5 w-5 text-white" />
                </div>
                <div>
                  <DialogTitle className="text-2xl font-bold text-gray-900">Payout Request Details</DialogTitle>
                  <p className="text-gray-600 text-sm mt-1">Review and process church payout request</p>
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
            {/* Payout Overview - Same style as member dashboard cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="bg-gradient-to-br from-purple-50 to-indigo-50 border-purple-200">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 bg-purple-100 rounded-xl">
                      <DollarSign className="h-8 w-8 text-purple-600" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-2xl font-bold text-purple-900">R{selectedPayout.amount}</h3>
                    <p className="text-purple-700 font-medium">Requested Amount</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 bg-green-100 rounded-xl">
                      <Wallet className="h-8 w-8 text-green-600" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-2xl font-bold text-green-900">R{selectedPayout.netAmount}</h3>
                    <p className="text-green-700 font-medium">Net Amount</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 bg-blue-100 rounded-xl">
                      {getStatusIcon(selectedPayout.status)}
                    </div>
                    <div className={`w-3 h-3 rounded-full ${getPriorityColor(selectedPayout.priority)}`}></div>
                  </div>
                  <div className="space-y-2">
                    <Badge className={`${getStatusColor(selectedPayout.status)} border font-medium`}>
                      <span className="capitalize">{selectedPayout.status}</span>
                    </Badge>
                    <p className="text-blue-700 font-medium">Current Status</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Church Information */}
            <Card className="border-0 shadow-lg rounded-2xl overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-gray-800 to-gray-900 text-white pb-4">
                <CardTitle className="text-xl font-bold flex items-center space-x-2">
                  <Building2 className="h-6 w-6" />
                  <span>Church Information</span>
                </CardTitle>
                <p className="text-gray-300 text-sm mt-1">Church details and contact information</p>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="text-gray-700 font-medium">Church Name</span>
                      <span className="font-bold text-gray-900">{selectedPayout.churchName}</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="text-gray-700 font-medium">Registration Number</span>
                      <span className="font-bold text-gray-900">{selectedPayout.churchDetails.registrationNumber}</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="text-gray-700 font-medium">Member Count</span>
                      <span className="font-bold text-gray-900">{selectedPayout.churchDetails.memberCount} members</span>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="text-gray-700 font-medium">Contact Email</span>
                      <span className="font-bold text-gray-900">{selectedPayout.churchDetails.contactEmail}</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="text-gray-700 font-medium">Contact Phone</span>
                      <span className="font-bold text-gray-900">{selectedPayout.churchDetails.contactPhone}</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="text-gray-700 font-medium">Monthly Revenue</span>
                      <span className="font-bold text-gray-900">R{selectedPayout.churchDetails.monthlyRevenue}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Banking Details */}
            <Card className="border-0 shadow-lg rounded-2xl overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-blue-600 to-blue-700 text-white pb-4">
                <CardTitle className="text-xl font-bold flex items-center space-x-2">
                  <CreditCard className="h-6 w-6" />
                  <span>Banking Details</span>
                </CardTitle>
                <p className="text-blue-100 text-sm mt-1">Account information for payout processing</p>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="text-gray-700 font-medium">Account Name</span>
                      <span className="font-bold text-gray-900">{selectedPayout.bankDetails.accountName}</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="text-gray-700 font-medium">Account Number</span>
                      <span className="font-bold text-gray-900 font-mono">{selectedPayout.bankDetails.accountNumber}</span>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="text-gray-700 font-medium">Bank Name</span>
                      <span className="font-bold text-gray-900">{selectedPayout.bankDetails.bankName}</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="text-gray-700 font-medium">Branch Code</span>
                      <span className="font-bold text-gray-900 font-mono">{selectedPayout.bankDetails.branchCode}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Fee Breakdown - PayFast Integration */}
            <Card className="border-0 shadow-lg rounded-2xl overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-purple-600 to-purple-700 text-white pb-4">
                <CardTitle className="text-xl font-bold flex items-center space-x-2">
                  <Receipt className="h-6 w-6" />
                  <span>PayFast Fee Breakdown</span>
                </CardTitle>
                <p className="text-purple-100 text-sm mt-1">South African payment processing fees</p>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-purple-50 rounded-lg border border-purple-200">
                    <div className="flex items-center space-x-3">
                      <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                      <span className="text-purple-700 font-medium">Platform Fee (3.9%)</span>
                    </div>
                    <span className="font-bold text-xl text-purple-900">R{selectedPayout.fees.platformFee}</span>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-3 h-3 bg-gray-500 rounded-full"></div>
                      <span className="text-gray-700 font-medium">Processing Fee (R3)</span>
                    </div>
                    <span className="font-bold text-xl text-gray-900">R{selectedPayout.fees.processingFee}</span>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-lg">
                    <span className="font-bold text-lg">Total Fees</span>
                    <span className="font-bold text-2xl">R{selectedPayout.fees.total}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            {selectedPayout.status === 'pending' && (
              <Card className="border-0 shadow-lg rounded-2xl overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-gray-800 to-gray-900 text-white pb-4">
                  <CardTitle className="text-xl font-bold">Process Payout Request</CardTitle>
                  <p className="text-gray-300 text-sm mt-1">Review and approve or reject this payout</p>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                  <Textarea
                    placeholder="Add processing notes (optional)..."
                    value={processingNote}
                    onChange={(e) => setProcessingNote(e.target.value)}
                    className="bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-500"
                    rows={3}
                  />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Button
                      onClick={() => processPayoutMutation.mutate({ 
                        payoutId: selectedPayout.id, 
                        action: 'approve', 
                        note: processingNote 
                      })}
                      disabled={processPayoutMutation.isPending}
                      className="h-24 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white flex flex-col items-center justify-center space-y-2 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
                    >
                      <CheckCircle className="h-7 w-7" />
                      <div className="text-center">
                        <span className="font-semibold">Approve Payout</span>
                        <p className="text-xs opacity-90">Release funds to church</p>
                      </div>
                    </Button>
                    <Button
                      onClick={() => processPayoutMutation.mutate({ 
                        payoutId: selectedPayout.id, 
                        action: 'reject', 
                        note: processingNote 
                      })}
                      disabled={processPayoutMutation.isPending}
                      variant="outline"
                      className="h-24 border-2 border-red-200 hover:border-red-300 bg-white hover:bg-red-50 flex flex-col items-center justify-center space-y-2 rounded-xl shadow-sm hover:shadow-lg transition-all duration-200 transform hover:scale-105"
                    >
                      <XCircle className="h-7 w-7 text-red-600" />
                      <div className="text-center">
                        <span className="font-semibold text-red-900">Reject Payout</span>
                        <p className="text-xs text-red-600">Decline request</p>
                      </div>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
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
              <Wallet className="h-5 w-5 text-white" />
            </div>
            <div>
              <DialogTitle className="text-2xl font-bold text-gray-900">Payout Management</DialogTitle>
              <p className="text-gray-600 text-sm mt-1">Manage church payout requests with PayFast integration</p>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {/* Filters and Search - Same style as member dashboard */}
          <Card className="border-0 shadow-sm">
            <CardContent className="p-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search by church name, requester, or payout ID..."
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
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                    <SelectItem value="processing">Processing</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={filterPriority} onValueChange={setFilterPriority}>
                  <SelectTrigger className="w-48 bg-white border-gray-200">
                    <SelectValue placeholder="Filter by Priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Priorities</SelectItem>
                    <SelectItem value="high">High Priority</SelectItem>
                    <SelectItem value="medium">Medium Priority</SelectItem>
                    <SelectItem value="low">Low Priority</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Payout Summary Stats - Same gradient style as member dashboard */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <Card className="bg-gradient-to-br from-yellow-50 to-orange-50 border-yellow-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-yellow-100 rounded-xl">
                    <Clock className="h-8 w-8 text-yellow-600" />
                  </div>
                </div>
                <div className="space-y-2">
                  <h3 className="text-2xl font-bold text-yellow-900">
                    {filteredPayouts.filter(p => p.status === 'pending').length}
                  </h3>
                  <p className="text-yellow-700 font-medium">Pending</p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-green-100 rounded-xl">
                    <CheckCircle className="h-8 w-8 text-green-600" />
                  </div>
                </div>
                <div className="space-y-2">
                  <h3 className="text-2xl font-bold text-green-900">
                    {filteredPayouts.filter(p => p.status === 'approved').length}
                  </h3>
                  <p className="text-green-700 font-medium">Approved</p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-red-50 to-pink-50 border-red-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-red-100 rounded-xl">
                    <XCircle className="h-8 w-8 text-red-600" />
                  </div>
                </div>
                <div className="space-y-2">
                  <h3 className="text-2xl font-bold text-red-900">
                    {filteredPayouts.filter(p => p.status === 'rejected').length}
                  </h3>
                  <p className="text-red-700 font-medium">Rejected</p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-blue-100 rounded-xl">
                    <TrendingUp className="h-8 w-8 text-blue-600" />
                  </div>
                </div>
                <div className="space-y-2">
                  <h3 className="text-2xl font-bold text-blue-900">
                    {filteredPayouts.filter(p => p.status === 'processing').length}
                  </h3>
                  <p className="text-blue-700 font-medium">Processing</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Payouts List - Same card style as member dashboard */}
          <Card className="border-0 shadow-lg rounded-2xl overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-gray-800 to-gray-900 text-white pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-xl font-bold flex items-center space-x-2">
                    <Receipt className="h-6 w-6" />
                    <span>Payout Requests ({filteredPayouts.length})</span>
                  </CardTitle>
                  <p className="text-gray-300 text-sm mt-1">Manage church payout requests</p>
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
              ) : filteredPayouts.length === 0 ? (
                <div className="text-center py-12">
                  <div className="p-4 bg-gray-100 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                    <Wallet className="h-8 w-8 text-gray-400" />
                  </div>
                  <p className="text-gray-600 text-lg font-medium">No payout requests found</p>
                  <p className="text-gray-500 text-sm">Try adjusting your search or filter criteria</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredPayouts.map((payout) => (
                    <div
                      key={payout.id}
                      className="flex items-center justify-between p-4 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer"
                      onClick={() => {
                        setSelectedPayout(payout);
                        setViewMode('detail');
                      }}
                    >
                      <div className="flex items-center space-x-4">
                        <div className="relative">
                          <div className="p-2 bg-white rounded-lg shadow-sm">
                            <Building2 className="h-6 w-6 text-purple-600" />
                          </div>
                          <div className={`absolute -top-1 -right-1 w-3 h-3 rounded-full ${getPriorityColor(payout.priority)}`}></div>
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900">{payout.churchName}</h4>
                          <div className="flex items-center space-x-3 text-sm text-gray-600">
                            <span>#{payout.id}</span>
                            <span>•</span>
                            <span className="font-medium">R{payout.amount}</span>
                            <span>•</span>
                            <span>{new Date(payout.requestDate).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-3">
                        <Badge className={`${getStatusColor(payout.status)} border font-medium`}>
                          {getStatusIcon(payout.status)}
                          <span className="ml-1 capitalize">{payout.status}</span>
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