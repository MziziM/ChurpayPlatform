import { useState } from "react";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { Textarea } from "./ui/textarea";
import { Separator } from "./ui/separator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "./ui/alert-dialog";
import { 
  Banknote,
  Building2,
  Shield,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Clock,
  User,
  MapPin,
  Phone,
  Mail,
  CreditCard,
  Calendar,
  FileText,
  Eye,
  TrendingUp,
  Database,
  Lock
} from "lucide-react";

interface PayoutRequest {
  id: string;
  church: {
    name: string;
    pastor: string;
    email: string;
    phone: string;
    location: string;
    memberSince: string;
    verification: "Verified" | "Pending" | "Under Review";
  };
  amount: number;
  processingFee: number;
  netAmount: number;
  reference: string;
  notes?: string;
  requestDate: string;
  bankDetails: {
    bankName: string;
    accountType: string;
    accountNumber: string;
    accountHolder: string;
    branchCode: string;
  };
  riskAssessment: {
    score: number; // 0-100
    level: "Low" | "Medium" | "High";
    factors: string[];
  };
  compliance: {
    kycStatus: "Complete" | "Pending" | "Expired";
    amlCheck: "Passed" | "Pending" | "Failed";
    sanctions: "Clear" | "Flagged";
  };
  history: {
    totalPayouts: number;
    lastPayout: string;
    averageAmount: number;
    successRate: number;
  };
}

interface PayoutApprovalModalProps {
  isOpen: boolean;
  onClose: () => void;
  payoutRequest: PayoutRequest | null;
  onApprove: (id: string, notes?: string) => void;
  onReject: (id: string, reason: string) => void;
}

export function PayoutApprovalModal({ 
  isOpen, 
  onClose, 
  payoutRequest, 
  onApprove, 
  onReject 
}: PayoutApprovalModalProps) {
  const [currentTab, setCurrentTab] = useState("overview");
  const [showApprovalDialog, setShowApprovalDialog] = useState(false);
  const [showRejectionDialog, setShowRejectionDialog] = useState(false);
  const [approvalNotes, setApprovalNotes] = useState("");
  const [rejectionReason, setRejectionReason] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  if (!payoutRequest) return null;

  const handleApprove = async () => {
    setIsProcessing(true);
    await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate API call
    onApprove(payoutRequest.id, approvalNotes);
    setIsProcessing(false);
    setShowApprovalDialog(false);
    onClose();
    setApprovalNotes("");
  };

  const handleReject = async () => {
    setIsProcessing(true);
    await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate API call
    onReject(payoutRequest.id, rejectionReason);
    setIsProcessing(false);
    setShowRejectionDialog(false);
    onClose();
    setRejectionReason("");
  };

  const getRiskColor = (level: string) => {
    switch (level) {
      case "Low": return "text-green-700 bg-green-50 border-green-200";
      case "Medium": return "text-yellow-700 bg-yellow-50 border-yellow-200";
      case "High": return "text-red-700 bg-red-50 border-red-200";
      default: return "text-gray-700 bg-gray-50 border-gray-200";
    }
  };

  const getComplianceIcon = (status: string) => {
    switch (status) {
      case "Complete":
      case "Passed":
      case "Clear":
        return <CheckCircle2 className="h-4 w-4 text-green-600" />;
      case "Pending":
        return <Clock className="h-4 w-4 text-yellow-600" />;
      case "Failed":
      case "Flagged":
      case "Expired":
        return <XCircle className="h-4 w-4 text-red-600" />;
      default:
        return <AlertTriangle className="h-4 w-4 text-gray-600" />;
    }
  };

  const tabs = [
    { id: "overview", label: "Overview", icon: FileText },
    { id: "church", label: "Church Details", icon: Building2 },
    { id: "banking", label: "Banking", icon: CreditCard },
    { id: "compliance", label: "Compliance", icon: Shield },
    { id: "history", label: "History", icon: Database },
  ];

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
          <DialogHeader className="border-b pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Banknote className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <DialogTitle>Payout Request Review</DialogTitle>
                  <DialogDescription>
                    ID: {payoutRequest.id} • Requested {new Date(payoutRequest.requestDate).toLocaleDateString()}
                  </DialogDescription>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Badge className={`${getRiskColor(payoutRequest.riskAssessment.level)} border`}>
                  {payoutRequest.riskAssessment.level} Risk
                </Badge>
                <div className="text-right">
                  <div className="text-2xl font-bold text-gray-900">
                    R {payoutRequest.amount.toLocaleString()}
                  </div>
                  <div className="text-sm text-gray-500">
                    Net: R {payoutRequest.netAmount.toLocaleString()}
                  </div>
                </div>
              </div>
            </div>
          </DialogHeader>

          {/* Tab Navigation */}
          <div className="border-b">
            <nav className="flex space-x-1">
              {tabs.map((tab) => {
                const IconComponent = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setCurrentTab(tab.id)}
                    className={`flex items-center space-x-2 px-4 py-3 text-sm font-medium rounded-t-lg transition-colors ${
                      currentTab === tab.id
                        ? "bg-blue-50 text-blue-700 border-b-2 border-blue-700"
                        : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    <IconComponent className="h-4 w-4" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {/* Overview Tab */}
            {currentTab === "overview" && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Request Summary */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold flex items-center">
                      <FileText className="h-5 w-5 mr-2 text-gray-600" />
                      Request Summary
                    </h3>
                    
                    <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Requested Amount</span>
                        <span className="font-semibold">R {payoutRequest.amount.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Processing Fee (1.5%)</span>
                        <span className="text-red-600">-R {payoutRequest.processingFee.toLocaleString()}</span>
                      </div>
                      <Separator />
                      <div className="flex justify-between">
                        <span className="text-gray-600 font-medium">Net Payout</span>
                        <span className="font-bold text-green-600">R {payoutRequest.netAmount.toLocaleString()}</span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="text-sm font-medium text-gray-700">Reference</div>
                      <div className="text-gray-900">{payoutRequest.reference}</div>
                    </div>

                    {payoutRequest.notes && (
                      <div className="space-y-2">
                        <div className="text-sm font-medium text-gray-700">Additional Notes</div>
                        <div className="text-gray-900 bg-gray-50 p-3 rounded-lg">
                          {payoutRequest.notes}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Risk Assessment */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold flex items-center">
                      <Shield className="h-5 w-5 mr-2 text-gray-600" />
                      Risk Assessment
                    </h3>
                    
                    <div className={`border rounded-lg p-4 ${getRiskColor(payoutRequest.riskAssessment.level)}`}>
                      <div className="flex items-center justify-between mb-3">
                        <span className="font-semibold">{payoutRequest.riskAssessment.level} Risk</span>
                        <span className="text-sm font-mono">
                          {payoutRequest.riskAssessment.score}/100
                        </span>
                      </div>
                      <div className="w-full bg-white rounded-full h-2 mb-3">
                        <div 
                          className={`h-2 rounded-full ${
                            payoutRequest.riskAssessment.level === "Low" ? "bg-green-500" :
                            payoutRequest.riskAssessment.level === "Medium" ? "bg-yellow-500" : "bg-red-500"
                          }`}
                          style={{ width: `${payoutRequest.riskAssessment.score}%` }}
                        />
                      </div>
                      <div className="space-y-1">
                        {payoutRequest.riskAssessment.factors.map((factor, index) => (
                          <div key={index} className="text-sm flex items-center">
                            <div className="w-1.5 h-1.5 bg-current rounded-full mr-2" />
                            {factor}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="flex space-x-3">
                      <Button 
                        onClick={() => setShowApprovalDialog(true)}
                        className="flex-1 bg-green-600 hover:bg-green-700"
                      >
                        <CheckCircle2 className="h-4 w-4 mr-2" />
                        Approve Payout
                      </Button>
                      <Button 
                        onClick={() => setShowRejectionDialog(true)}
                        variant="outline" 
                        className="flex-1 border-red-200 text-red-700 hover:bg-red-50"
                      >
                        <XCircle className="h-4 w-4 mr-2" />
                        Reject
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Church Details Tab */}
            {currentTab === "church" && (
              <div className="space-y-6">
                <div className="flex items-center space-x-4">
                  <Avatar className="w-16 h-16">
                    <AvatarFallback className="bg-purple-100 text-purple-600 text-lg">
                      {payoutRequest.church.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">{payoutRequest.church.name}</h2>
                    <p className="text-gray-600">{payoutRequest.church.pastor}</p>
                    <Badge className={
                      payoutRequest.church.verification === "Verified" 
                        ? "bg-green-100 text-green-800" 
                        : "bg-yellow-100 text-yellow-800"
                    }>
                      {payoutRequest.church.verification}
                    </Badge>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="font-semibold text-gray-900">Contact Information</h3>
                    <div className="space-y-3">
                      <div className="flex items-center space-x-3">
                        <Mail className="h-4 w-4 text-gray-400" />
                        <span className="text-gray-900">{payoutRequest.church.email}</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Phone className="h-4 w-4 text-gray-400" />
                        <span className="text-gray-900">{payoutRequest.church.phone}</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <MapPin className="h-4 w-4 text-gray-400" />
                        <span className="text-gray-900">{payoutRequest.church.location}</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        <span className="text-gray-900">
                          Member since {new Date(payoutRequest.church.memberSince).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="font-semibold text-gray-900">Church Metrics</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-gray-50 p-3 rounded-lg text-center">
                        <div className="text-lg font-bold text-gray-900">
                          R {payoutRequest.history.totalPayouts.toLocaleString()}
                        </div>
                        <div className="text-sm text-gray-600">Total Payouts</div>
                      </div>
                      <div className="bg-gray-50 p-3 rounded-lg text-center">
                        <div className="text-lg font-bold text-gray-900">
                          {payoutRequest.history.successRate}%
                        </div>
                        <div className="text-sm text-gray-600">Success Rate</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Banking Tab */}
            {currentTab === "banking" && (
              <div className="space-y-6">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start space-x-3">
                    <Lock className="h-5 w-5 text-blue-600 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-blue-900">Secure Banking Information</p>
                      <p className="text-xs text-blue-700">All banking details are encrypted and verified</p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="font-semibold text-gray-900">Bank Account Details</h3>
                    <div className="space-y-3 bg-gray-50 p-4 rounded-lg">
                      <div className="grid grid-cols-3 gap-2">
                        <div className="text-sm text-gray-600">Bank</div>
                        <div className="col-span-2 font-medium">{payoutRequest.bankDetails.bankName}</div>
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        <div className="text-sm text-gray-600">Account Type</div>
                        <div className="col-span-2 font-medium">{payoutRequest.bankDetails.accountType}</div>
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        <div className="text-sm text-gray-600">Account Holder</div>
                        <div className="col-span-2 font-medium">{payoutRequest.bankDetails.accountHolder}</div>
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        <div className="text-sm text-gray-600">Account Number</div>
                        <div className="col-span-2 font-mono">
                          ****{payoutRequest.bankDetails.accountNumber.slice(-4)}
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        <div className="text-sm text-gray-600">Branch Code</div>
                        <div className="col-span-2 font-mono">{payoutRequest.bankDetails.branchCode}</div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="font-semibold text-gray-900">Verification Status</h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                        <div className="flex items-center space-x-2">
                          <CheckCircle2 className="h-4 w-4 text-green-600" />
                          <span className="text-sm font-medium text-green-900">Account Verified</span>
                        </div>
                        <Eye className="h-4 w-4 text-green-600" />
                      </div>
                      <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                        <div className="flex items-center space-x-2">
                          <CheckCircle2 className="h-4 w-4 text-green-600" />
                          <span className="text-sm font-medium text-green-900">Bank Details Match</span>
                        </div>
                        <Eye className="h-4 w-4 text-green-600" />
                      </div>
                      <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                        <div className="flex items-center space-x-2">
                          <CheckCircle2 className="h-4 w-4 text-green-600" />
                          <span className="text-sm font-medium text-green-900">Previous Successful Payouts</span>
                        </div>
                        <Eye className="h-4 w-4 text-green-600" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Compliance Tab */}
            {currentTab === "compliance" && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-4 border rounded-lg">
                    <div className="flex justify-center mb-2">
                      {getComplianceIcon(payoutRequest.compliance.kycStatus)}
                    </div>
                    <div className="font-medium">KYC Status</div>
                    <div className="text-sm text-gray-600">{payoutRequest.compliance.kycStatus}</div>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <div className="flex justify-center mb-2">
                      {getComplianceIcon(payoutRequest.compliance.amlCheck)}
                    </div>
                    <div className="font-medium">AML Check</div>
                    <div className="text-sm text-gray-600">{payoutRequest.compliance.amlCheck}</div>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <div className="flex justify-center mb-2">
                      {getComplianceIcon(payoutRequest.compliance.sanctions)}
                    </div>
                    <div className="font-medium">Sanctions</div>
                    <div className="text-sm text-gray-600">{payoutRequest.compliance.sanctions}</div>
                  </div>
                </div>
              </div>
            )}

            {/* History Tab */}
            {currentTab === "history" && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-blue-50 p-4 rounded-lg text-center">
                    <TrendingUp className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-blue-900">
                      R {payoutRequest.history.totalPayouts.toLocaleString()}
                    </div>
                    <div className="text-sm text-blue-600">Total Payouts</div>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg text-center">
                    <CheckCircle2 className="h-8 w-8 text-green-600 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-green-900">
                      {payoutRequest.history.successRate}%
                    </div>
                    <div className="text-sm text-green-600">Success Rate</div>
                  </div>
                  <div className="bg-purple-50 p-4 rounded-lg text-center">
                    <Banknote className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-purple-900">
                      R {payoutRequest.history.averageAmount.toLocaleString()}
                    </div>
                    <div className="text-sm text-purple-600">Average Amount</div>
                  </div>
                </div>
                
                <div className="text-sm text-gray-600">
                  Last payout: {new Date(payoutRequest.history.lastPayout).toLocaleDateString()}
                </div>
              </div>
            )}
          </div>

          {/* Action Bar */}
          <div className="border-t px-6 py-4 bg-gray-50">
            <div className="flex justify-between items-center">
              <Button variant="outline" onClick={onClose}>
                Close Review
              </Button>
              <div className="flex space-x-3">
                <Button 
                  onClick={() => setShowRejectionDialog(true)}
                  variant="outline" 
                  className="border-red-200 text-red-700 hover:bg-red-50"
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  Reject
                </Button>
                <Button 
                  onClick={() => setShowApprovalDialog(true)}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  Approve Payout
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Approval Confirmation Dialog */}
      <AlertDialog open={showApprovalDialog} onOpenChange={setShowApprovalDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center space-x-2 text-green-700">
              <CheckCircle2 className="h-5 w-5" />
              <span>Approve Payout Request</span>
            </AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-4">
                <p>You are about to approve a payout of <strong>R {payoutRequest.netAmount.toLocaleString()}</strong> to {payoutRequest.church.name}.</p>
                
                <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                  <p className="text-sm text-green-800">
                    This action will initiate the bank transfer process. The funds will be processed within 1-3 business days.
                  </p>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    Approval Notes (Optional)
                  </label>
                  <Textarea
                    placeholder="Add any notes about this approval..."
                    value={approvalNotes}
                    onChange={(e) => setApprovalNotes(e.target.value)}
                    rows={3}
                  />
                </div>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleApprove}
              disabled={isProcessing}
              className="bg-green-600 hover:bg-green-700"
            >
              {isProcessing ? "Processing..." : "Confirm Approval"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Rejection Dialog */}
      <AlertDialog open={showRejectionDialog} onOpenChange={setShowRejectionDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center space-x-2 text-red-700">
              <XCircle className="h-5 w-5" />
              <span>Reject Payout Request</span>
            </AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-4">
                <p>You are about to reject the payout request for <strong>R {payoutRequest.amount.toLocaleString()}</strong> from {payoutRequest.church.name}.</p>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    Rejection Reason *
                  </label>
                  <Textarea
                    placeholder="Please provide a clear reason for rejection..."
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    rows={3}
                    required
                  />
                </div>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleReject}
              disabled={isProcessing || !rejectionReason.trim()}
              className="bg-red-600 hover:bg-red-700"
            >
              {isProcessing ? "Processing..." : "Confirm Rejection"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}