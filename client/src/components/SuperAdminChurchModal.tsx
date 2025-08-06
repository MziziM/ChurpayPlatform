import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { DocumentViewer } from './DocumentViewer';
import { apiRequest } from '@/lib/queryClient';
import { 
  Building2, Users, Search, Filter, MapPin, 
  Phone, Mail, Calendar, Shield, CheckCircle,
  AlertTriangle, TrendingUp, DollarSign, 
  Activity, Eye, BarChart3, UserCheck, FileText,
  Download, ExternalLink, Clock, UserPlus,
  Edit, Trash2, Upload, Save, X
} from 'lucide-react';

interface Church {
  id: string;
  name: string;
  denomination: string;
  registrationNumber: string;
  taxNumber: string;
  yearEstablished: string;
  status: 'pending' | 'under_review' | 'approved' | 'rejected' | 'suspended';
  memberCount: number;
  totalRevenue?: string;
  monthlyRevenue?: string;
  
  // Contact Information
  contactEmail: string;
  contactPhone: string;
  alternativePhone?: string;
  website?: string;
  
  // Address Information
  address: string;
  city: string;
  province: string;
  postalCode: string;
  country: string;
  
  // Banking Information
  bankName: string;
  accountNumber: string;
  branchCode: string;
  accountHolder: string;
  accountType: string;
  
  // Church Details
  description: string;
  servicesTimes: string;
  leadPastor: string;
  logoUrl?: string;
  
  // Administrative Contact
  adminFirstName: string;
  adminLastName: string;
  adminEmail: string;
  adminPhone: string;
  adminPosition: string;
  
  // Document Verification Flags
  hasNpoRegistration: boolean;
  hasTaxClearance: boolean;
  hasBankConfirmation: boolean;
  
  // Documents (File paths)
  cipcDocument?: string;
  bankConfirmationLetter?: string;
  taxClearanceCertificate?: string;
  
  // System fields
  registrationDate?: string;
  lastActivity?: string;
  createdAt: string;
  updatedAt: string;
  
  // Legacy fields for compatibility
  verification?: {
    emailVerified: boolean;
    phoneVerified: boolean;
    documentsVerified: boolean;
    bankingVerified: boolean;
  };
  analytics?: {
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
  const [isEditing, setIsEditing] = useState(false);
  const [editedChurch, setEditedChurch] = useState<Partial<Church>>({});
  const [documentViewer, setDocumentViewer] = useState<{
    isOpen: boolean;
    url: string;
    name: string;
    type: 'image' | 'pdf' | 'unknown';
  }>({
    isOpen: false,
    url: '',
    name: '',
    type: 'unknown'
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: churches = [], isLoading } = useQuery<Church[]>({
    queryKey: ['/api/super-admin/churches'],
    enabled: open
  });

  // Church approval mutation
  const approveChurchMutation = useMutation({
    mutationFn: async (churchId: string) => {
      return apiRequest('POST', `/api/super-admin/churches/${churchId}/approve`);
    },
    onSuccess: async (response: Response) => {
      const data = await response.json();
      queryClient.invalidateQueries({ queryKey: ['/api/super-admin/churches'] });
      toast({
        title: "Church Approved",
        description: data?.message || "Church has been approved and setup email sent to admin.",
        variant: "default",
      });
      // Update selected church state
      if (selectedChurch) {
        setSelectedChurch({ ...selectedChurch, status: 'approved' });
      }
    },
    onError: (error) => {
      toast({
        title: "Approval Failed",
        description: "Failed to approve church. Please try again.",
        variant: "destructive",
      });
      console.error('Approval error:', error);
    }
  });

  // Church rejection mutation
  const rejectChurchMutation = useMutation({
    mutationFn: async ({ churchId, reason }: { churchId: string; reason: string }) => {
      return apiRequest('POST', `/api/super-admin/churches/${churchId}/reject`, { reason });
    },
    onSuccess: async (response: Response) => {
      const data = await response.json();
      queryClient.invalidateQueries({ queryKey: ['/api/super-admin/churches'] });
      toast({
        title: "Church Rejected",
        description: data?.message || "Church application has been rejected.",
        variant: "default",
      });
      // Update selected church state
      if (selectedChurch) {
        setSelectedChurch({ ...selectedChurch, status: 'rejected' });
      }
    },
    onError: (error) => {
      toast({
        title: "Rejection Failed",
        description: "Failed to reject church. Please try again.",
        variant: "destructive",
      });
      console.error('Rejection error:', error);
    }
  });

  // Update Church Mutation
  const updateChurchMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Church> }) => {
      return await apiRequest(`/api/super-admin/churches/${id}`, 'PUT', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/super-admin/churches'] });
      setIsEditing(false);
      setEditedChurch({});
      toast({
        title: "Church Updated",
        description: "Church details have been updated successfully.",
        variant: "default",
      });
    },
    onError: (error) => {
      toast({
        title: "Update Failed",
        description: "Failed to update church details.",
        variant: "destructive",
      });
    },
  });

  // Delete Church Mutation
  const deleteChurchMutation = useMutation({
    mutationFn: async (id: string) => {
      return await apiRequest(`/api/super-admin/churches/${id}`, 'DELETE');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/super-admin/churches'] });
      setViewMode('list');
      setSelectedChurch(null);
      toast({
        title: "Church Deleted",
        description: "Church has been permanently deleted.",
        variant: "default",
      });
    },
    onError: (error) => {
      toast({
        title: "Deletion Failed",
        description: "Failed to delete the church.",
        variant: "destructive",
      });
    },
  });

  // Update Church Document Mutation
  const updateDocumentMutation = useMutation({
    mutationFn: async ({ id, documentType, documentUrl }: { id: string; documentType: string; documentUrl: string }) => {
      return await apiRequest(`/api/super-admin/churches/${id}/documents`, 'PUT', { documentType, documentUrl });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/super-admin/churches'] });
      toast({
        title: "Document Updated",
        description: "Church document has been updated successfully.",
        variant: "default",
      });
    },
    onError: (error) => {
      toast({
        title: "Update Failed",
        description: "Failed to update church document.",
        variant: "destructive",
      });
    },
  });

  // Document viewing function
  const handleViewDocument = (documentUrl: string, documentName: string) => {
    console.log('handleViewDocument called:', { documentUrl, documentName });
    
    if (!documentUrl) {
      toast({
        title: "Document Not Available",
        description: "This document has not been uploaded yet.",
        variant: "destructive",
      });
      return;
    }
    
    const getDocumentType = (url: string): 'image' | 'pdf' | 'unknown' => {
      const extension = url.split('.').pop()?.toLowerCase();
      if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(extension || '')) return 'image';
      if (extension === 'pdf') return 'pdf';
      return 'unknown';
    };

    const viewerState = {
      isOpen: true,
      url: documentUrl,
      name: documentName,
      type: getDocumentType(documentUrl)
    };
    
    console.log('Setting document viewer state:', viewerState);
    setDocumentViewer(viewerState);
  };

  // Helper functions for edit mode
  const handleEditStart = () => {
    if (selectedChurch) {
      setEditedChurch({ ...selectedChurch });
      setIsEditing(true);
    }
  };

  const handleEditCancel = () => {
    setIsEditing(false);
    setEditedChurch({});
  };

  const handleEditSave = () => {
    if (selectedChurch && editedChurch) {
      updateChurchMutation.mutate({
        id: selectedChurch.id,
        data: editedChurch
      });
    }
  };

  const handleDeleteConfirm = () => {
    if (selectedChurch && window.confirm('Are you sure you want to permanently delete this church? This action cannot be undone.')) {
      deleteChurchMutation.mutate(selectedChurch.id);
    }
  };

  const handleDocumentUpload = (documentType: string) => {
    const url = prompt('Enter the new document URL:');
    if (url && selectedChurch) {
      updateDocumentMutation.mutate({
        id: selectedChurch.id,
        documentType,
        documentUrl: url
      });
    }
  };

  const updateEditedField = (field: string, value: any) => {
    setEditedChurch(prev => ({ ...prev, [field]: value }));
  };

  const filteredChurches = churches.filter(church => {
    const matchesSearch = church.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         church.denomination.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         church.registrationNumber.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === 'all' || church.status === filterStatus;
    const matchesProvince = filterProvince === 'all' || church.province === filterProvince;
    
    return matchesSearch && matchesStatus && matchesProvince;
  });

  // Handle document download through backend API
  const handleDownloadDocument = async (documentPath: string, filename: string) => {
    try {
      const response = await fetch(documentPath);
      if (!response.ok) {
        throw new Error('Failed to download document');
      }
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading document:', error);
      alert('Failed to download document. Please try again.');
    }
  };

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

  // Detail view JSX
  const detailViewContent = viewMode === 'detail' && selectedChurch ? (
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
              <div className="flex items-center space-x-2">
                {isEditing ? (
                  <>
                    <Button
                      onClick={handleEditSave}
                      disabled={updateChurchMutation.isPending}
                      className="bg-green-600 hover:bg-green-700 text-white"
                    >
                      <Save className="h-4 w-4 mr-2" />
                      Save Changes
                    </Button>
                    <Button
                      onClick={handleEditCancel}
                      variant="outline"
                      className="border-gray-300"
                    >
                      <X className="h-4 w-4 mr-2" />
                      Cancel
                    </Button>
                  </>
                ) : (
                  <>
                    <Button
                      onClick={handleEditStart}
                      variant="outline"
                      className="border-blue-300 text-blue-600 hover:bg-blue-50"
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Edit Church
                    </Button>
                    <Button
                      onClick={handleDeleteConfirm}
                      variant="outline"
                      disabled={deleteChurchMutation.isPending}
                      className="border-red-300 text-red-600 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete Church
                    </Button>
                  </>
                )}
                <Button
                  variant="ghost"
                  onClick={() => setViewMode('list')}
                  className="text-gray-500 hover:text-gray-900 hover:bg-gray-100"
                >
                  ← Back to List
                </Button>
              </div>
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
                    <h3 className="text-2xl font-bold text-green-900">R{selectedChurch.monthlyRevenue || '0.00'}</h3>
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
                    <h3 className="text-2xl font-bold text-purple-900">{selectedChurch.analytics?.revenueGrowth || 0}%</h3>
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
              <TabsList className="grid w-full grid-cols-6 bg-white border border-gray-200">
                <TabsTrigger value="overview" className="data-[state=active]:bg-purple-50 data-[state=active]:text-purple-700">Overview</TabsTrigger>
                <TabsTrigger value="contact" className="data-[state=active]:bg-purple-50 data-[state=active]:text-purple-700">Contact</TabsTrigger>
                <TabsTrigger value="admin" className="data-[state=active]:bg-purple-50 data-[state=active]:text-purple-700">Admin</TabsTrigger>
                <TabsTrigger value="banking" className="data-[state=active]:bg-purple-50 data-[state=active]:text-purple-700">Banking</TabsTrigger>
                <TabsTrigger value="documents" className="data-[state=active]:bg-purple-50 data-[state=active]:text-purple-700">Documents</TabsTrigger>
                <TabsTrigger value="verification" className="data-[state=active]:bg-purple-50 data-[state=active]:text-purple-700">Status</TabsTrigger>
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
                    {isEditing ? (
                      /* Edit Mode - Form Fields */
                      <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">Church Name</label>
                              <input
                                type="text"
                                value={editedChurch.name || selectedChurch.name}
                                onChange={(e) => setEditedChurch({...editedChurch, name: e.target.value})}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">Denomination</label>
                              <input
                                type="text"
                                value={editedChurch.denomination || selectedChurch.denomination}
                                onChange={(e) => setEditedChurch({...editedChurch, denomination: e.target.value})}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">NPO/PBO Registration</label>
                              <input
                                type="text"
                                value={editedChurch.registrationNumber || selectedChurch.registrationNumber}
                                onChange={(e) => setEditedChurch({...editedChurch, registrationNumber: e.target.value})}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">Tax Number</label>
                              <input
                                type="text"
                                value={editedChurch.taxNumber || selectedChurch.taxNumber}
                                onChange={(e) => setEditedChurch({...editedChurch, taxNumber: e.target.value})}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">Year Established</label>
                              <input
                                type="number"
                                value={editedChurch.yearEstablished || selectedChurch.yearEstablished}
                                onChange={(e) => setEditedChurch({...editedChurch, yearEstablished: e.target.value})}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">Member Count</label>
                              <input
                                type="number"
                                value={editedChurch.memberCount || selectedChurch.memberCount}
                                onChange={(e) => setEditedChurch({...editedChurch, memberCount: parseInt(e.target.value) || 0})}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                              />
                            </div>
                          </div>
                          <div className="space-y-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">Lead Pastor</label>
                              <input
                                type="text"
                                value={editedChurch.leadPastor || selectedChurch.leadPastor}
                                onChange={(e) => setEditedChurch({...editedChurch, leadPastor: e.target.value})}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">Website</label>
                              <input
                                type="url"
                                value={editedChurch.website || selectedChurch.website || ''}
                                onChange={(e) => setEditedChurch({...editedChurch, website: e.target.value})}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                placeholder="https://www.example.com"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">Logo URL</label>
                              <input
                                type="url"
                                value={editedChurch.logoUrl || selectedChurch.logoUrl || ''}
                                onChange={(e) => setEditedChurch({...editedChurch, logoUrl: e.target.value})}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                placeholder="https://example.com/logo.png"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                              <select
                                value={editedChurch.status || selectedChurch.status}
                                onChange={(e) => setEditedChurch({...editedChurch, status: e.target.value as any})}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                              >
                                <option value="pending">Pending</option>
                                <option value="under_review">Under Review</option>
                                <option value="approved">Approved</option>
                                <option value="rejected">Rejected</option>
                              </select>
                            </div>
                            <div className="p-3 bg-gray-50 rounded-lg">
                              <span className="text-gray-700 font-medium block mb-2">Registration Date</span>
                              <span className="text-gray-900">{new Date(selectedChurch.createdAt).toLocaleDateString()}</span>
                            </div>
                          </div>
                        </div>
                        
                        {/* Church Description and Service Times */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Church Description</label>
                            <textarea
                              value={editedChurch.description || selectedChurch.description}
                              onChange={(e) => setEditedChurch({...editedChurch, description: e.target.value})}
                              rows={4}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                              placeholder="Describe your church..."
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Service Times</label>
                            <textarea
                              value={editedChurch.servicesTimes || selectedChurch.servicesTimes}
                              onChange={(e) => setEditedChurch({...editedChurch, servicesTimes: e.target.value})}
                              rows={4}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                              placeholder="e.g., Sunday: 9:00 AM, 11:00 AM\nWednesday: 7:00 PM"
                            />
                          </div>
                        </div>
                      </div>
                    ) : (
                      /* View Mode - Static Display */
                      <div className="space-y-6">
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
                              <span className="text-gray-700 font-medium">NPO/PBO Registration</span>
                              <span className="font-bold text-gray-900">{selectedChurch.registrationNumber}</span>
                            </div>
                            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                              <span className="text-gray-700 font-medium">Tax Number</span>
                              <span className="font-bold text-gray-900">{selectedChurch.taxNumber}</span>
                            </div>
                            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                              <span className="text-gray-700 font-medium">Year Established</span>
                              <span className="font-bold text-gray-900">{selectedChurch.yearEstablished}</span>
                            </div>
                            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                              <span className="text-gray-700 font-medium">Member Count</span>
                              <span className="font-bold text-gray-900">{selectedChurch.memberCount.toLocaleString()}</span>
                            </div>
                          </div>
                          <div className="space-y-4">
                            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                              <span className="text-gray-700 font-medium">Lead Pastor</span>
                              <span className="font-bold text-gray-900">{selectedChurch.leadPastor}</span>
                            </div>
                            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                              <span className="text-gray-700 font-medium">Registration Date</span>
                              <span className="font-bold text-gray-900">{new Date(selectedChurch.createdAt).toLocaleDateString()}</span>
                            </div>
                            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                              <span className="text-gray-700 font-medium">Status</span>
                              <Badge className={`${getStatusColor(selectedChurch.status)} border font-medium`}>
                                {getStatusIcon(selectedChurch.status)}
                                <span className="ml-1 capitalize">{selectedChurch.status}</span>
                              </Badge>
                            </div>
                            {selectedChurch.website && (
                              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                <span className="text-gray-700 font-medium">Website</span>
                                <a href={selectedChurch.website} target="_blank" rel="noopener noreferrer" className="font-bold text-blue-600 hover:text-blue-800">
                                  {selectedChurch.website}
                                </a>
                              </div>
                            )}
                            {selectedChurch.logoUrl && (
                              <div className="p-3 bg-gray-50 rounded-lg">
                                <span className="text-gray-700 font-medium block mb-2">Church Logo</span>
                                <img src={selectedChurch.logoUrl} alt="Church Logo" className="h-16 w-16 object-cover rounded-lg" />
                              </div>
                            )}
                          </div>
                        </div>
                        
                        {/* Church Description and Service Times */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="p-4 bg-blue-50 rounded-lg">
                            <h4 className="text-blue-800 font-semibold mb-2">Church Description</h4>
                            <p className="text-blue-700">{selectedChurch.description}</p>
                          </div>
                          <div className="p-4 bg-green-50 rounded-lg">
                            <h4 className="text-green-800 font-semibold mb-2">Service Times</h4>
                            <p className="text-green-700 whitespace-pre-line">{selectedChurch.servicesTimes}</p>
                          </div>
                        </div>
                      </div>
                    )}
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
                          <span className="text-gray-700 font-medium">Primary Email</span>
                          <span className="font-bold text-gray-900">{selectedChurch.contactEmail}</span>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <span className="text-gray-700 font-medium">Primary Phone</span>
                          <span className="font-bold text-gray-900">{selectedChurch.contactPhone}</span>
                        </div>
                        {selectedChurch.alternativePhone && (
                          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <span className="text-gray-700 font-medium">Alternative Phone</span>
                            <span className="font-bold text-gray-900">{selectedChurch.alternativePhone}</span>
                          </div>
                        )}
                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <span className="text-gray-700 font-medium">City</span>
                          <span className="font-bold text-gray-900">{selectedChurch.city}</span>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <span className="text-gray-700 font-medium">Province</span>
                          <span className="font-bold text-gray-900">{selectedChurch.province}</span>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <span className="text-gray-700 font-medium">Postal Code</span>
                          <span className="font-bold text-gray-900">{selectedChurch.postalCode}</span>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <span className="text-gray-700 font-medium">Country</span>
                          <span className="font-bold text-gray-900">{selectedChurch.country}</span>
                        </div>
                        <div className="p-3 bg-gray-50 rounded-lg">
                          <span className="text-gray-700 font-medium block mb-2">Street Address</span>
                          <span className="font-bold text-gray-900">{selectedChurch.address}</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="admin" className="space-y-6 mt-6">
                <Card className="border-0 shadow-lg rounded-2xl overflow-hidden">
                  <CardHeader className="bg-gradient-to-r from-purple-600 to-purple-700 text-white pb-4">
                    <CardTitle className="text-xl font-bold flex items-center space-x-2">
                      <UserCheck className="h-6 w-6" />
                      <span>Administrative Contact</span>
                    </CardTitle>
                    <p className="text-purple-100 text-sm mt-1">Church administrator and primary contact person</p>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <span className="text-gray-700 font-medium">First Name</span>
                          <span className="font-bold text-gray-900">{selectedChurch.adminFirstName}</span>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <span className="text-gray-700 font-medium">Last Name</span>
                          <span className="font-bold text-gray-900">{selectedChurch.adminLastName}</span>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <span className="text-gray-700 font-medium">Position/Title</span>
                          <span className="font-bold text-gray-900">{selectedChurch.adminPosition}</span>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <span className="text-gray-700 font-medium">Email Address</span>
                          <span className="font-bold text-gray-900">{selectedChurch.adminEmail}</span>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <span className="text-gray-700 font-medium">Phone Number</span>
                          <span className="font-bold text-gray-900">{selectedChurch.adminPhone}</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="banking" className="space-y-6 mt-6">
                <Card className="border-0 shadow-lg rounded-2xl overflow-hidden">
                  <CardHeader className="bg-gradient-to-r from-orange-600 to-orange-700 text-white pb-4">
                    <CardTitle className="text-xl font-bold flex items-center space-x-2">
                      <DollarSign className="h-6 w-6" />
                      <span>Banking Information</span>
                    </CardTitle>
                    <p className="text-orange-100 text-sm mt-1">Church banking details for donations and payouts</p>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <span className="text-gray-700 font-medium">Bank Name</span>
                          <span className="font-bold text-gray-900">{selectedChurch.bankName}</span>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <span className="text-gray-700 font-medium">Account Holder</span>
                          <span className="font-bold text-gray-900">{selectedChurch.accountHolder}</span>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <span className="text-gray-700 font-medium">Account Type</span>
                          <span className="font-bold text-gray-900">{selectedChurch.accountType}</span>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <span className="text-gray-700 font-medium">Account Number</span>
                          <span className="font-bold text-gray-900">****{selectedChurch.accountNumber.slice(-4)}</span>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <span className="text-gray-700 font-medium">Branch Code</span>
                          <span className="font-bold text-gray-900">{selectedChurch.branchCode}</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="documents" className="space-y-6 mt-6">
                <Card className="border-0 shadow-lg rounded-2xl overflow-hidden">
                  <CardHeader className="bg-gradient-to-r from-blue-600 to-blue-700 text-white pb-4">
                    <CardTitle className="text-xl font-bold flex items-center space-x-2">
                      <FileText className="h-6 w-6" />
                      <span>Uploaded Documents</span>
                    </CardTitle>
                    <p className="text-blue-100 text-sm mt-1">Church verification and legal documents</p>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="space-y-6">
                      {/* NPO/PBO Registration Certificate */}
                      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border">
                        <div className="flex items-center space-x-3">
                          <div className={`p-2 rounded-lg ${selectedChurch.hasNpoRegistration ? 'bg-green-100' : 'bg-red-100'}`}>
                            <FileText className={`h-5 w-5 ${selectedChurch.hasNpoRegistration ? 'text-green-600' : 'text-red-600'}`} />
                          </div>
                          <div>
                            <h4 className="font-medium text-gray-900">NPO/PBO Registration Certificate</h4>
                            <p className="text-sm text-gray-600">
                              Status: {selectedChurch.hasNpoRegistration ? 'Confirmed' : 'Not Confirmed'}
                            </p>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          {selectedChurch.cipcDocument ? (
                            <>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleViewDocument(selectedChurch.cipcDocument!, 'NPO Registration Certificate')}
                                className="text-blue-600 hover:text-blue-800"
                              >
                                <Eye className="h-4 w-4 mr-2" />
                                View
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDownloadDocument(selectedChurch.cipcDocument!, 'NPO_Registration_Certificate.pdf')}
                                className="text-green-600 hover:text-green-800"
                              >
                                <Download className="h-4 w-4 mr-2" />
                                Download
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDocumentUpload('cipcDocument')}
                                className="text-purple-600 hover:text-purple-800"
                              >
                                <Upload className="h-4 w-4 mr-2" />
                                Replace
                              </Button>
                            </>
                          ) : (
                            <>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleViewDocument('https://via.placeholder.com/800x600/purple/white?text=Sample+NPO+Document', 'NPO Registration Certificate')}
                                className="text-blue-600 hover:text-blue-800"
                              >
                                <Eye className="h-4 w-4 mr-2" />
                                View Sample
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDocumentUpload('cipcDocument')}
                                className="text-purple-600 hover:text-purple-800"
                              >
                                <Upload className="h-4 w-4 mr-2" />
                                Upload
                              </Button>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Tax Clearance Certificate */}
                      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border">
                        <div className="flex items-center space-x-3">
                          <div className={`p-2 rounded-lg ${selectedChurch.hasTaxClearance ? 'bg-green-100' : 'bg-red-100'}`}>
                            <FileText className={`h-5 w-5 ${selectedChurch.hasTaxClearance ? 'text-green-600' : 'text-red-600'}`} />
                          </div>
                          <div>
                            <h4 className="font-medium text-gray-900">Tax Clearance Certificate</h4>
                            <p className="text-sm text-gray-600">
                              Status: {selectedChurch.hasTaxClearance ? 'Confirmed' : 'Not Confirmed'}
                            </p>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          {selectedChurch.taxClearanceCertificate ? (
                            <>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleViewDocument(selectedChurch.taxClearanceCertificate!, 'Tax Clearance Certificate')}
                                className="text-blue-600 hover:text-blue-800"
                              >
                                <Eye className="h-4 w-4 mr-2" />
                                View
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDownloadDocument(selectedChurch.taxClearanceCertificate!, 'Tax_Clearance_Certificate.pdf')}
                                className="text-green-600 hover:text-green-800"
                              >
                                <Download className="h-4 w-4 mr-2" />
                                Download
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDocumentUpload('taxClearanceCertificate')}
                                className="text-purple-600 hover:text-purple-800"
                              >
                                <Upload className="h-4 w-4 mr-2" />
                                Replace
                              </Button>
                            </>
                          ) : (
                            <>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleViewDocument('https://via.placeholder.com/800x600/green/white?text=Sample+Tax+Certificate', 'Tax Clearance Certificate')}
                                className="text-blue-600 hover:text-blue-800"
                              >
                                <Eye className="h-4 w-4 mr-2" />
                                View Sample
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDocumentUpload('taxClearanceCertificate')}
                                className="text-purple-600 hover:text-purple-800"
                              >
                                <Upload className="h-4 w-4 mr-2" />
                                Upload
                              </Button>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Bank Confirmation Letter */}
                      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border">
                        <div className="flex items-center space-x-3">
                          <div className={`p-2 rounded-lg ${selectedChurch.hasBankConfirmation ? 'bg-green-100' : 'bg-red-100'}`}>
                            <FileText className={`h-5 w-5 ${selectedChurch.hasBankConfirmation ? 'text-green-600' : 'text-red-600'}`} />
                          </div>
                          <div>
                            <h4 className="font-medium text-gray-900">Bank Confirmation Letter</h4>
                            <p className="text-sm text-gray-600">
                              Status: {selectedChurch.hasBankConfirmation ? 'Confirmed' : 'Not Confirmed'}
                            </p>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          {selectedChurch.bankConfirmationLetter ? (
                            <>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleViewDocument(selectedChurch.bankConfirmationLetter!, 'Bank Confirmation Letter')}
                                className="text-blue-600 hover:text-blue-800"
                              >
                                <Eye className="h-4 w-4 mr-2" />
                                View
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDownloadDocument(selectedChurch.bankConfirmationLetter!, 'Bank_Confirmation_Letter.pdf')}
                                className="text-green-600 hover:text-green-800"
                              >
                                <Download className="h-4 w-4 mr-2" />
                                Download
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDocumentUpload('bankConfirmationLetter')}
                                className="text-purple-600 hover:text-purple-800"
                              >
                                <Upload className="h-4 w-4 mr-2" />
                                Replace
                              </Button>
                            </>
                          ) : (
                            <>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleViewDocument('https://via.placeholder.com/800x600/blue/white?text=Sample+Bank+Letter', 'Bank Confirmation Letter')}
                                className="text-blue-600 hover:text-blue-800"
                              >
                                <Eye className="h-4 w-4 mr-2" />
                                View Sample
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDocumentUpload('bankConfirmationLetter')}
                                className="text-purple-600 hover:text-purple-800"
                              >
                                <Upload className="h-4 w-4 mr-2" />
                                Upload
                              </Button>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="verification" className="space-y-6 mt-6">
                <Card className="border-0 shadow-lg rounded-2xl overflow-hidden">
                  <CardHeader className="bg-gradient-to-r from-indigo-600 to-indigo-700 text-white pb-4">
                    <CardTitle className="text-xl font-bold flex items-center space-x-2">
                      <Shield className="h-6 w-6" />
                      <span>Verification Status</span>
                    </CardTitle>
                    <p className="text-indigo-100 text-sm mt-1">Church verification and approval status</p>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <Mail className="h-5 w-5 text-blue-600" />
                            <span className="text-gray-700 font-medium">Email Verified</span>
                          </div>
                          <Badge className={selectedChurch.verification?.emailVerified ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                            {selectedChurch.verification?.emailVerified ? 'Verified' : 'Pending'}
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <Phone className="h-5 w-5 text-green-600" />
                            <span className="text-gray-700 font-medium">Phone Verified</span>
                          </div>
                          <Badge className={selectedChurch.verification?.phoneVerified ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                            {selectedChurch.verification?.phoneVerified ? 'Verified' : 'Pending'}
                          </Badge>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <Shield className="h-5 w-5 text-purple-600" />
                            <span className="text-gray-700 font-medium">Documents Verified</span>
                          </div>
                          <Badge className={selectedChurch.verification?.documentsVerified ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}>
                            {selectedChurch.verification?.documentsVerified ? 'Verified' : 'Review Required'}
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <DollarSign className="h-5 w-5 text-orange-600" />
                            <span className="text-gray-700 font-medium">Banking Verified</span>
                          </div>
                          <Badge className={selectedChurch.verification?.bankingVerified ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}>
                            {selectedChurch.verification?.bankingVerified ? 'Verified' : 'Review Required'}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    
                    {/* Action Buttons for Approval/Rejection */}
                    <div className="mt-8 p-6 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg border">
                      <h4 className="text-lg font-semibold text-gray-900 mb-4">Application Management</h4>
                      <div className="flex flex-col sm:flex-row gap-4">
                        {selectedChurch.status === 'pending' && (
                          <>
                            <Button
                              onClick={() => approveChurchMutation.mutate(selectedChurch.id)}
                              disabled={approveChurchMutation.isPending}
                              className="bg-green-600 hover:bg-green-700 text-white flex-1"
                            >
                              <CheckCircle className="h-4 w-4 mr-2" />
                              {approveChurchMutation.isPending ? 'Approving...' : 'Approve & Send Setup Email'}
                            </Button>
                            <Button
                              variant="destructive"
                              onClick={() => {
                                const reason = prompt('Please provide a reason for rejection:');
                                if (reason) {
                                  rejectChurchMutation.mutate({ churchId: selectedChurch.id, reason });
                                }
                              }}
                              disabled={rejectChurchMutation.isPending}
                              className="flex-1"
                            >
                              <AlertTriangle className="h-4 w-4 mr-2" />
                              {rejectChurchMutation.isPending ? 'Rejecting...' : 'Reject Application'}
                            </Button>
                          </>
                        )}
                        
                        {selectedChurch.status === 'approved' && (
                          <div className="flex-1 p-4 bg-green-50 border border-green-200 rounded-lg">
                            <div className="flex items-center space-x-2">
                              <CheckCircle className="h-5 w-5 text-green-600" />
                              <span className="text-green-800 font-medium">Church Approved</span>
                            </div>
                            <p className="text-green-700 text-sm mt-1">
                              Admin password setup email has been sent to {selectedChurch.adminEmail}
                            </p>
                          </div>
                        )}
                        
                        {selectedChurch.status === 'rejected' && (
                          <div className="flex-1 p-4 bg-red-50 border border-red-200 rounded-lg">
                            <div className="flex items-center space-x-2">
                              <AlertTriangle className="h-5 w-5 text-red-600" />
                              <span className="text-red-800 font-medium">Application Rejected</span>
                            </div>
                          </div>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mt-3">
                        Review all documents and information before making a decision.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </DialogContent>
    </Dialog>
  ) : null;

  // Main list view JSX
  const listViewContent = (
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
                    {filteredChurches.filter(c => c.status === 'approved').length}
                  </h3>
                  <p className="text-green-700 font-medium">Approved Churches</p>
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

  return (
    <>
      {detailViewContent || listViewContent}
      
      {/* Document Viewer Modal - Outside main dialog to avoid nesting conflicts */}
      <DocumentViewer
        isOpen={documentViewer.isOpen}
        onClose={() => setDocumentViewer(prev => ({ ...prev, isOpen: false }))}
        documentUrl={documentViewer.url}
        documentName={documentViewer.name}
        documentType={documentViewer.type}
      />
    </>
  );
}