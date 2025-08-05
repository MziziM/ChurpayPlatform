import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Building2, Users, MapPin, Phone, Mail, Calendar, Shield, CheckCircle, XCircle, Clock, FileText, Globe, User, UserCheck } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

interface Church {
  id: string;
  name: string;
  denomination: string;
  registrationNumber: string;
  taxNumber: string;
  yearEstablished: string;
  contactEmail: string;
  contactPhone: string;
  alternativePhone?: string;
  website?: string;
  address: string;
  city: string;
  province: string;
  postalCode: string;
  country?: string;
  bankName: string;
  accountNumber: string;
  branchCode: string;
  accountHolder: string;
  accountType: string;
  description: string;
  memberCount: number;
  servicesTimes: string;
  leadPastor: string;
  logoUrl?: string;
  adminFirstName: string;
  adminLastName: string;
  adminEmail: string;
  adminPhone: string;
  adminPosition: string;
  hasNpoRegistration?: boolean;
  hasTaxClearance?: boolean;
  hasBankConfirmation?: boolean;
  cipcDocument?: string;
  bankConfirmationLetter?: string;
  taxClearanceCertificate?: string;
  status: 'pending' | 'under_review' | 'approved' | 'rejected' | 'suspended';
  commissionRate?: string;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

interface ChurchManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ChurchManagementModal({ isOpen, onClose }: ChurchManagementModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedChurch, setSelectedChurch] = useState<Church | null>(null);
  const [reviewNotes, setReviewNotes] = useState('');

  const { data: churches, isLoading } = useQuery<Church[]>({
    queryKey: ['/api/super-admin/churches'],
    enabled: isOpen,
    refetchInterval: 30000,
  });

  const processMutation = useMutation({
    mutationFn: async ({ churchId, action, notes }: { churchId: string; action: 'approve' | 'reject'; notes: string }) => {
      const response = await fetch(`/api/super-admin/churches/${churchId}/process`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ action, notes }),
      });
      if (!response.ok) throw new Error('Failed to process church');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/super-admin/churches'] });
      toast({
        title: "Church Processed",
        description: "Church status has been updated successfully.",
      });
      setSelectedChurch(null);
      setReviewNotes('');
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to process church. Please try again.",
        variant: "destructive",
      });
    },
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-green-500/20 text-green-400 border-green-500/30"><CheckCircle className="w-3 h-3 mr-1" />Approved</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30"><Clock className="w-3 h-3 mr-1" />Pending Review</Badge>;
      case 'rejected':
        return <Badge className="bg-red-500/20 text-red-400 border-red-500/30"><XCircle className="w-3 h-3 mr-1" />Rejected</Badge>;
      default:
        return <Badge variant="secondary">Unknown</Badge>;
    }
  };

  const handleProcess = (action: 'approve' | 'reject') => {
    if (!selectedChurch) return;
    
    processMutation.mutate({
      churchId: selectedChurch.id,
      action,
      notes: reviewNotes,
    });
  };

  const pendingChurches = churches?.filter(church => church.status === 'pending') || [];
  const approvedChurches = churches?.filter(church => church.status === 'approved') || [];
  const rejectedChurches = churches?.filter(church => church.status === 'rejected') || [];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[1000px] max-w-[95vw] mx-2 p-0 overflow-hidden rounded-3xl border-0 shadow-2xl max-h-[90vh]">
        {/* Enhanced Header */}
        <div className="bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 text-white p-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -translate-y-20 translate-x-20"></div>
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/5 rounded-full translate-y-16 -translate-x-16"></div>
          
          <DialogHeader className="relative z-10">
            <DialogTitle className="flex items-center space-x-4 text-3xl font-bold mb-4">
              <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                <Building2 className="h-8 w-8 text-white" />
              </div>
              <div>
                <span>Church Management</span>
                <p className="text-lg font-normal text-blue-100 mt-1">
                  Platform onboarding & oversight
                </p>
              </div>
            </DialogTitle>
            <DialogDescription className="sr-only">
              Manage church registrations, approvals, and platform access
            </DialogDescription>
          </DialogHeader>

          {/* Quick Stats */}
          <div className="mt-6 grid grid-cols-3 gap-4">
            <div className="bg-white/10 rounded-lg p-3 backdrop-blur-sm">
              <div className="text-sm opacity-75">Pending Review</div>
              <div className="text-2xl font-bold">{pendingChurches.length}</div>
            </div>
            <div className="bg-white/10 rounded-lg p-3 backdrop-blur-sm">
              <div className="text-sm opacity-75">Active Churches</div>
              <div className="text-2xl font-bold">{approvedChurches.length}</div>
            </div>
            <div className="bg-white/10 rounded-lg p-3 backdrop-blur-sm">
              <div className="text-sm opacity-75">Total Members</div>
              <div className="text-2xl font-bold">
                {approvedChurches.reduce((total, church) => total + (church.memberCount || 0), 0).toLocaleString()}
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 bg-gray-50 dark:bg-gray-900 space-y-6 overflow-y-auto max-h-[calc(90vh-300px)]">
          {isLoading ? (
            <div className="flex items-center justify-center h-40">
              <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full" />
            </div>
          ) : (
            <>
              {/* Church Approval Process Explanation */}
              <Card className="border-0 shadow-lg bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20">
                <CardHeader>
                  <CardTitle className="flex items-center text-blue-700 dark:text-blue-300">
                    <Shield className="w-5 h-5 mr-2" />
                    Why Church Approval is Required
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-blue-600 dark:text-blue-200">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-semibold mb-2">Platform Security & Compliance</h4>
                      <ul className="space-y-1 text-xs">
                        <li>• Verify legitimate religious organizations</li>
                        <li>• Ensure compliance with financial regulations</li>
                        <li>• Prevent fraudulent donation collection</li>
                        <li>• Maintain platform reputation and trust</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-2">Quality Assurance</h4>
                      <ul className="space-y-1 text-xs">
                        <li>• Confirm proper organizational documentation</li>
                        <li>• Validate church leadership credentials</li>
                        <li>• Ensure accurate financial information</li>
                        <li>• Maintain high platform standards</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Pending Reviews */}
              {pendingChurches.length > 0 && (
                <div>
                  <h3 className="text-xl font-semibold mb-4 flex items-center">
                    <Clock className="w-5 h-5 mr-2 text-yellow-500" />
                    Pending Reviews ({pendingChurches.length})
                  </h3>
                  <div className="grid gap-4">
                    {pendingChurches.map((church) => (
                      <Card key={church.id} className="border-0 shadow-lg hover:shadow-xl transition-shadow">
                        <CardContent className="p-6">
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <div className="flex items-center justify-between mb-4">
                                <h4 className="text-lg font-semibold">{church.name}</h4>
                                {getStatusBadge(church.status)}
                              </div>
                              
                              <div className="grid md:grid-cols-3 gap-4 text-sm">
                                <div className="space-y-2">
                                  <h5 className="font-semibold text-gray-700 dark:text-gray-300 mb-2">Contact Information</h5>
                                  <div className="flex items-center">
                                    <Mail className="w-4 h-4 mr-2 text-gray-500" />
                                    {church.contactEmail}
                                  </div>
                                  <div className="flex items-center">
                                    <Phone className="w-4 h-4 mr-2 text-gray-500" />
                                    {church.contactPhone}
                                  </div>
                                  {church.alternativePhone && (
                                    <div className="flex items-center">
                                      <Phone className="w-4 h-4 mr-2 text-gray-500" />
                                      Alt: {church.alternativePhone}
                                    </div>
                                  )}
                                  {church.website && (
                                    <div className="flex items-center">
                                      <Globe className="w-4 h-4 mr-2 text-gray-500" />
                                      {church.website}
                                    </div>
                                  )}
                                </div>
                                
                                <div className="space-y-2">
                                  <h5 className="font-semibold text-gray-700 dark:text-gray-300 mb-2">Church Details</h5>
                                  <div className="flex items-center">
                                    <Building2 className="w-4 h-4 mr-2 text-gray-500" />
                                    {church.denomination}
                                  </div>
                                  <div className="flex items-center">
                                    <Users className="w-4 h-4 mr-2 text-gray-500" />
                                    {church.memberCount?.toLocaleString() || 0} members
                                  </div>
                                  <div className="flex items-center">
                                    <User className="w-4 h-4 mr-2 text-gray-500" />
                                    Pastor: {church.leadPastor}
                                  </div>
                                  <div className="flex items-center">
                                    <Calendar className="w-4 h-4 mr-2 text-gray-500" />
                                    Est. {church.yearEstablished}
                                  </div>
                                </div>

                                <div className="space-y-2">
                                  <h5 className="font-semibold text-gray-700 dark:text-gray-300 mb-2">Registration Info</h5>
                                  <div className="text-xs text-gray-600 dark:text-gray-400">
                                    <div><strong>Reg #:</strong> {church.registrationNumber}</div>
                                    <div><strong>Tax #:</strong> {church.taxNumber}</div>
                                    <div><strong>Bank:</strong> {church.bankName}</div>
                                    <div><strong>Account:</strong> {church.accountHolder}</div>
                                  </div>
                                </div>
                              </div>

                              {/* Address Section */}
                              <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                <div className="flex items-center mb-2">
                                  <MapPin className="w-4 h-4 mr-2 text-gray-500" />
                                  <span className="text-sm font-medium">Address</span>
                                </div>
                                <p className="text-sm text-gray-600 dark:text-gray-300">
                                  {church.address}, {church.city}, {church.province} {church.postalCode}
                                  {church.country && church.country !== 'South Africa' && `, ${church.country}`}
                                </p>
                              </div>

                              {/* Document Verification Status */}
                              <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                <div className="flex items-center mb-3">
                                  <Shield className="w-4 h-4 mr-2 text-gray-500" />
                                  <span className="text-sm font-medium">Document Verification Status</span>
                                </div>
                                <div className="grid grid-cols-3 gap-4 text-xs">
                                  <div className="flex items-center">
                                    <div className={`w-2 h-2 rounded-full mr-2 ${church.hasNpoRegistration ? 'bg-green-500' : 'bg-red-500'}`}></div>
                                    <span className={church.hasNpoRegistration ? 'text-green-600' : 'text-red-600'}>
                                      NPO Registration
                                    </span>
                                  </div>
                                  <div className="flex items-center">
                                    <div className={`w-2 h-2 rounded-full mr-2 ${church.hasTaxClearance ? 'bg-green-500' : 'bg-red-500'}`}></div>
                                    <span className={church.hasTaxClearance ? 'text-green-600' : 'text-red-600'}>
                                      Tax Clearance
                                    </span>
                                  </div>
                                  <div className="flex items-center">
                                    <div className={`w-2 h-2 rounded-full mr-2 ${church.hasBankConfirmation ? 'bg-green-500' : 'bg-red-500'}`}></div>
                                    <span className={church.hasBankConfirmation ? 'text-green-600' : 'text-red-600'}>
                                      Bank Confirmation
                                    </span>
                                  </div>
                                </div>
                              </div>

                              {/* Administrative Contact */}
                              <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                                <div className="flex items-center mb-2">
                                  <UserCheck className="w-4 h-4 mr-2 text-blue-500" />
                                  <span className="text-sm font-medium text-blue-700 dark:text-blue-300">Administrative Contact</span>
                                </div>
                                <div className="grid grid-cols-2 gap-2 text-sm text-blue-600 dark:text-blue-200">
                                  <div><strong>Name:</strong> {church.adminFirstName} {church.adminLastName}</div>
                                  <div><strong>Position:</strong> {church.adminPosition}</div>
                                  <div><strong>Email:</strong> {church.adminEmail}</div>
                                  <div><strong>Phone:</strong> {church.adminPhone}</div>
                                </div>
                              </div>

                              {/* Services Times */}
                              {church.servicesTimes && (
                                <div className="mt-4 p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
                                  <div className="flex items-center mb-2">
                                    <Clock className="w-4 h-4 mr-2 text-purple-500" />
                                    <span className="text-sm font-medium text-purple-700 dark:text-purple-300">Service Times</span>
                                  </div>
                                  <p className="text-sm text-purple-600 dark:text-purple-200">{church.servicesTimes}</p>
                                </div>
                              )}

                              {church.description && (
                                <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                  <div className="flex items-center mb-2">
                                    <FileText className="w-4 h-4 mr-2 text-gray-500" />
                                    <span className="text-sm font-medium">Church Description</span>
                                  </div>
                                  <p className="text-sm text-gray-600 dark:text-gray-300">{church.description}</p>
                                </div>
                              )}
                            </div>
                          </div>
                          
                          <div className="flex justify-end space-x-3 mt-6">
                            <Button 
                              variant="outline" 
                              onClick={() => setSelectedChurch(church)}
                              className="border-blue-600 text-blue-600 hover:bg-blue-50"
                            >
                              Review Details
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {/* Active Churches */}
              {approvedChurches.length > 0 && (
                <div>
                  <h3 className="text-xl font-semibold mb-4 flex items-center">
                    <CheckCircle className="w-5 h-5 mr-2 text-green-500" />
                    Active Churches ({approvedChurches.length})
                  </h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    {approvedChurches.slice(0, 6).map((church) => (
                      <Card key={church.id} className="border-0 shadow-lg">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-semibold">{church.name}</h4>
                            {getStatusBadge(church.status)}
                          </div>
                          <div className="text-sm text-gray-600 space-y-1">
                            <div>{church.contactEmail}</div>
                            <div className="flex items-center">
                              <Users className="w-3 h-3 mr-1" />
                              {church.memberCount?.toLocaleString() || 0} members
                            </div>
                            <div className="text-xs text-gray-500">{church.denomination}</div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {/* Detailed Church Review Modal */}
              {selectedChurch && (
                <Card className="border-2 border-blue-500 shadow-xl">
                  <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20">
                    <CardTitle className="flex items-center justify-between">
                      <div>
                        <span className="text-xl">Complete Review: {selectedChurch.name}</span>
                        <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                          Review all church details before making approval decision
                        </p>
                      </div>
                      <Button variant="ghost" size="sm" onClick={() => setSelectedChurch(null)}>
                        <XCircle className="w-5 h-5" />
                      </Button>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6 space-y-6">
                    {/* Church Overview */}
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <h4 className="font-semibold text-lg border-b pb-2">Church Information</h4>
                        <div className="space-y-2 text-sm">
                          <div><span className="font-medium">Name:</span> {selectedChurch.name}</div>
                          <div><span className="font-medium">Denomination:</span> {selectedChurch.denomination}</div>
                          <div><span className="font-medium">Lead Pastor:</span> {selectedChurch.leadPastor}</div>
                          <div><span className="font-medium">Year Established:</span> {selectedChurch.yearEstablished}</div>
                          <div><span className="font-medium">Members:</span> {selectedChurch.memberCount?.toLocaleString() || 0}</div>
                          <div><span className="font-medium">Service Times:</span> {selectedChurch.servicesTimes}</div>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <h4 className="font-semibold text-lg border-b pb-2">Contact Details</h4>
                        <div className="space-y-2 text-sm">
                          <div><span className="font-medium">Email:</span> {selectedChurch.contactEmail}</div>
                          <div><span className="font-medium">Phone:</span> {selectedChurch.contactPhone}</div>
                          {selectedChurch.alternativePhone && (
                            <div><span className="font-medium">Alt Phone:</span> {selectedChurch.alternativePhone}</div>
                          )}
                          {selectedChurch.website && (
                            <div><span className="font-medium">Website:</span> {selectedChurch.website}</div>
                          )}
                          <div className="pt-2">
                            <span className="font-medium">Address:</span><br />
                            {selectedChurch.address}<br />
                            {selectedChurch.city}, {selectedChurch.province} {selectedChurch.postalCode}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Administrative Contact */}
                    <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                      <h4 className="font-semibold text-lg mb-3 text-blue-700 dark:text-blue-300">Administrative Contact</h4>
                      <div className="grid md:grid-cols-2 gap-4 text-sm">
                        <div>
                          <div><span className="font-medium">Name:</span> {selectedChurch.adminFirstName} {selectedChurch.adminLastName}</div>
                          <div><span className="font-medium">Position:</span> {selectedChurch.adminPosition}</div>
                        </div>
                        <div>
                          <div><span className="font-medium">Email:</span> {selectedChurch.adminEmail}</div>
                          <div><span className="font-medium">Phone:</span> {selectedChurch.adminPhone}</div>
                        </div>
                      </div>
                    </div>

                    {/* Legal & Financial Information */}
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                        <h4 className="font-semibold text-lg mb-3 text-green-700 dark:text-green-300">Legal Information</h4>
                        <div className="space-y-2 text-sm">
                          <div><span className="font-medium">Registration #:</span> {selectedChurch.registrationNumber}</div>
                          <div><span className="font-medium">Tax Number:</span> {selectedChurch.taxNumber}</div>
                        </div>
                      </div>

                      <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
                        <h4 className="font-semibold text-lg mb-3 text-purple-700 dark:text-purple-300">Banking Details</h4>
                        <div className="space-y-2 text-sm">
                          <div><span className="font-medium">Bank:</span> {selectedChurch.bankName}</div>
                          <div><span className="font-medium">Account Holder:</span> {selectedChurch.accountHolder}</div>
                          <div><span className="font-medium">Account Type:</span> {selectedChurch.accountType}</div>
                          <div><span className="font-medium">Account #:</span> {selectedChurch.accountNumber}</div>
                          <div><span className="font-medium">Branch Code:</span> {selectedChurch.branchCode}</div>
                        </div>
                      </div>
                    </div>

                    {/* Document Verification */}
                    <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                      <h4 className="font-semibold text-lg mb-3">Document Verification Status</h4>
                      <div className="grid grid-cols-3 gap-4">
                        <div className="flex items-center space-x-2">
                          <div className={`w-3 h-3 rounded-full ${selectedChurch.hasNpoRegistration ? 'bg-green-500' : 'bg-red-500'}`}></div>
                          <span className={`text-sm ${selectedChurch.hasNpoRegistration ? 'text-green-600' : 'text-red-600'}`}>
                            NPO Registration
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className={`w-3 h-3 rounded-full ${selectedChurch.hasTaxClearance ? 'bg-green-500' : 'bg-red-500'}`}></div>
                          <span className={`text-sm ${selectedChurch.hasTaxClearance ? 'text-green-600' : 'text-red-600'}`}>
                            Tax Clearance
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className={`w-3 h-3 rounded-full ${selectedChurch.hasBankConfirmation ? 'bg-green-500' : 'bg-red-500'}`}></div>
                          <span className={`text-sm ${selectedChurch.hasBankConfirmation ? 'text-green-600' : 'text-red-600'}`}>
                            Bank Confirmation
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Church Description */}
                    {selectedChurch.description && (
                      <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg">
                        <h4 className="font-semibold text-lg mb-3 text-yellow-700 dark:text-yellow-300">Church Description</h4>
                        <p className="text-sm text-yellow-600 dark:text-yellow-200">{selectedChurch.description}</p>
                      </div>
                    )}

                    {/* Review Notes and Decision */}
                    <div className="border-t pt-6">
                      <h4 className="font-semibold text-lg mb-4">Review Decision</h4>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium mb-2">
                            Review Notes & Reason for Decision
                            <span className="text-red-500">*</span>
                          </label>
                          <textarea
                            className="w-full p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            rows={4}
                            placeholder="Please provide detailed notes explaining your approval or rejection decision. This helps maintain transparency and provides feedback to the church..."
                            value={reviewNotes}
                            onChange={(e) => setReviewNotes(e.target.value)}
                          />
                          <p className="text-xs text-gray-500 mt-1">
                            These notes will be recorded for audit purposes and may be shared with church administrators.
                          </p>
                        </div>
                        
                        <div className="flex justify-end space-x-3">
                          <Button 
                            variant="outline"
                            onClick={() => handleProcess('reject')}
                            disabled={processMutation.isPending || !reviewNotes.trim()}
                            className="border-red-600 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                          >
                            <XCircle className="w-4 h-4 mr-2" />
                            {processMutation.isPending ? 'Processing...' : 'Reject Application'}
                          </Button>
                          <Button 
                            onClick={() => handleProcess('approve')}
                            disabled={processMutation.isPending || !reviewNotes.trim()}
                            className="bg-green-600 hover:bg-green-700 text-white"
                          >
                            <CheckCircle className="w-4 h-4 mr-2" />
                            {processMutation.isPending ? 'Processing...' : 'Approve Church'}
                          </Button>
                        </div>
                        
                        {!reviewNotes.trim() && (
                          <p className="text-sm text-red-500 text-right">
                            Please provide review notes before making a decision
                          </p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Action Buttons */}
              <div className="flex justify-end space-x-3 pt-4">
                <Button variant="outline" onClick={onClose}>
                  Close
                </Button>
                <Button className="bg-blue-600 hover:bg-blue-700">
                  Export Church List
                </Button>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}