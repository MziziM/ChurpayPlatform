import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
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
  Search
} from "lucide-react";

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
  const { data: churches } = useQuery({
    queryKey: ['/api/super-admin/churches/detailed'],
    enabled: isOpen
  });

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Building2 className="h-5 w-5 text-purple-600" />
            <span>Church Management Dashboard</span>
          </DialogTitle>
          <DialogDescription>
            Comprehensive overview and management of all churches on the platform
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Search and Filters */}
          <div className="flex items-center space-x-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Search churches by name, location, or denomination..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button variant="outline">
              <Activity className="h-4 w-4 mr-2" />
              Export Data
            </Button>
          </div>

          <Tabs defaultValue="overview" className="space-y-4">
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
              <TabsTrigger value="verification">Verification</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4">
              <div className="grid gap-4">
                {(churches || []).map((church: any) => (
                  <div key={church.id} className="border rounded-lg p-6 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-4 flex-1">
                        <div className="w-16 h-16 rounded-lg overflow-hidden bg-gradient-to-br from-purple-100 to-indigo-100 flex items-center justify-center">
                          {church.profileImageUrl ? (
                            <img 
                              src={church.profileImageUrl} 
                              alt={church.name} 
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <Building2 className="h-8 w-8 text-purple-600" />
                          )}
                        </div>
                        
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h3 className="text-lg font-semibold text-gray-900">{church.name}</h3>
                            <Badge 
                              variant={church.status === 'verified' ? 'default' : 'secondary'}
                              className={church.status === 'verified' ? 'bg-green-100 text-green-800' : ''}
                            >
                              {church.status}
                            </Badge>
                          </div>
                          
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div>
                              <p className="text-gray-500 flex items-center">
                                <Building2 className="h-3 w-3 mr-1" />
                                Denomination
                              </p>
                              <p className="font-medium">{church.denomination}</p>
                            </div>
                            <div>
                              <p className="text-gray-500 flex items-center">
                                <MapPin className="h-3 w-3 mr-1" />
                                Location
                              </p>
                              <p className="font-medium">{church.city}, {church.province}</p>
                            </div>
                            <div>
                              <p className="text-gray-500 flex items-center">
                                <Users className="h-3 w-3 mr-1" />
                                Members
                              </p>
                              <p className="font-medium">{church.memberCount}</p>
                            </div>
                            <div>
                              <p className="text-gray-500 flex items-center">
                                <DollarSign className="h-3 w-3 mr-1" />
                                Monthly Revenue
                              </p>
                              <p className="font-medium">R{church.monthlyRevenue}</p>
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm mt-3">
                            <div>
                              <p className="text-gray-500 flex items-center">
                                <Mail className="h-3 w-3 mr-1" />
                                Email
                              </p>
                              <p className="font-medium">{church.contactEmail}</p>
                            </div>
                            <div>
                              <p className="text-gray-500 flex items-center">
                                <Phone className="h-3 w-3 mr-1" />
                                Phone
                              </p>
                              <p className="font-medium">{church.contactPhone}</p>
                            </div>
                            <div>
                              <p className="text-gray-500 flex items-center">
                                <Calendar className="h-3 w-3 mr-1" />
                                Joined
                              </p>
                              <p className="font-medium">{new Date(church.registrationDate).toLocaleDateString()}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex flex-col space-y-2 ml-4">
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4 mr-1" />
                          View Details
                        </Button>
                        <Button variant="outline" size="sm">
                          <Activity className="h-4 w-4 mr-1" />
                          Analytics
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="analytics">
              <div className="text-center py-12">
                <TrendingUp className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Church Analytics</h3>
                <p className="text-gray-500">Detailed analytics and performance metrics coming soon</p>
              </div>
            </TabsContent>

            <TabsContent value="verification">
              <div className="text-center py-12">
                <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Church Verification</h3>
                <p className="text-gray-500">Verification management tools coming soon</p>
              </div>
            </TabsContent>
          </Tabs>

          <div className="flex justify-end pt-4 border-t">
            <Button onClick={onClose}>Close</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}