import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PayoutRequestModal } from '@/components/PayoutRequestModal';
import { 
  DollarSign, 
  TrendingUp, 
  Clock, 
  CheckCircle,
  Building2,
  CreditCard,
  Calendar,
  Users,
  Banknote,
  FileText,
  Eye
} from 'lucide-react';

// Mock church data for demonstration
const mockChurchData = {
  id: 'church-123',
  name: 'Grace Community Church',
  availableBalance: '45750.00',
  pendingPayouts: 2,
  lastPayoutDate: '2024-07-15',
  bankDetails: {
    bankName: 'Standard Bank',
    accountNumber: '1234567890',
    branchCode: '051001',
    accountHolder: 'Grace Community Church Trust'
  }
};

const mockRecentPayouts = [
  {
    id: 'payout-001',
    amount: '12500.00',
    requestType: 'standard',
    status: 'completed',
    requestedDate: '2024-07-01',
    completedDate: '2024-07-05',
    processingFee: '62.50',
    netAmount: '12437.50'
  },
  {
    id: 'payout-002',
    amount: '8750.00',
    requestType: 'express',
    status: 'pending',
    requestedDate: '2024-07-28',
    processingFee: '131.25',
    netAmount: '8618.75'
  },
  {
    id: 'payout-003',
    amount: '25000.00',
    requestType: 'emergency',
    status: 'processing',
    requestedDate: '2024-07-30',
    processingFee: '625.00',
    netAmount: '24375.00'
  }
];

const getStatusColor = (status: string) => {
  switch (status) {
    case 'completed': return 'bg-green-100 text-green-800 border-green-200';
    case 'processing': return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    case 'rejected': return 'bg-red-100 text-red-800 border-red-200';
    default: return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'completed': return <CheckCircle className="h-4 w-4" />;
    case 'processing': return <Clock className="h-4 w-4 animate-spin" />;
    case 'pending': return <Clock className="h-4 w-4" />;
    default: return <FileText className="h-4 w-4" />;
  }
};

const getRequestTypeColor = (type: string) => {
  switch (type) {
    case 'emergency': return 'bg-red-100 text-red-800 border-red-200';
    case 'express': return 'bg-orange-100 text-orange-800 border-orange-200';
    default: return 'bg-blue-100 text-blue-800 border-blue-200';
  }
};

export default function ChurchPayoutDemo() {
  const [showPayoutModal, setShowPayoutModal] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center">
                <Building2 className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{mockChurchData.name}</h1>
                <p className="text-gray-600">Church Financial Dashboard</p>
              </div>
            </div>
            <Button 
              onClick={() => setShowPayoutModal(true)}
              className="bg-green-600 hover:bg-green-700"
            >
              <Banknote className="h-4 w-4 mr-2" />
              Request Payout
            </Button>
          </div>
        </div>

        {/* Financial Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Available Balance</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                R{parseFloat(mockChurchData.availableBalance).toLocaleString('en-ZA', { minimumFractionDigits: 2 })}
              </div>
              <p className="text-xs text-muted-foreground">
                Ready for withdrawal
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Payouts</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{mockChurchData.pendingPayouts}</div>
              <p className="text-xs text-muted-foreground">
                Requests processing
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Last Payout</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {new Date(mockChurchData.lastPayoutDate).toLocaleDateString()}
              </div>
              <p className="text-xs text-muted-foreground">
                Most recent withdrawal
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Bank Account</CardTitle>
              <CreditCard className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-lg font-bold">
                {mockChurchData.bankDetails.bankName}
              </div>
              <p className="text-xs text-muted-foreground">
                ***{mockChurchData.bankDetails.accountNumber.slice(-4)}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Recent Payouts */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5" />
              <span>Recent Payout Requests</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mockRecentPayouts.map((payout) => (
                <div key={payout.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                      <DollarSign className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <div className="font-medium">R{parseFloat(payout.amount).toLocaleString('en-ZA', { minimumFractionDigits: 2 })}</div>
                      <div className="text-sm text-gray-500">
                        Requested on {new Date(payout.requestedDate).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <Badge className={getRequestTypeColor(payout.requestType)}>
                      {payout.requestType}
                    </Badge>
                    <Badge className={`${getStatusColor(payout.status)} border`}>
                      {getStatusIcon(payout.status)}
                      <span className="ml-1 capitalize">{payout.status}</span>
                    </Badge>
                    <Button variant="outline" size="sm">
                      <Eye className="h-4 w-4 mr-1" />
                      View
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Bank Details Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <CreditCard className="h-5 w-5" />
              <span>Bank Account Details</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex justify-between py-2">
                  <span className="text-gray-600">Bank Name:</span>
                  <span className="font-medium">{mockChurchData.bankDetails.bankName}</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-gray-600">Account Number:</span>
                  <span className="font-medium">***{mockChurchData.bankDetails.accountNumber.slice(-4)}</span>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex justify-between py-2">
                  <span className="text-gray-600">Branch Code:</span>
                  <span className="font-medium">{mockChurchData.bankDetails.branchCode}</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-gray-600">Account Holder:</span>
                  <span className="font-medium">{mockChurchData.bankDetails.accountHolder}</span>
                </div>
              </div>
            </div>
            <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-sm text-blue-800">
                <strong>Note:</strong> All payouts will be processed to this registered bank account. 
                Contact support if you need to update your banking details.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Payout Request Modal */}
        <PayoutRequestModal
          open={showPayoutModal}
          onOpenChange={setShowPayoutModal}
          churchData={mockChurchData}
        />
      </div>
    </div>
  );
}