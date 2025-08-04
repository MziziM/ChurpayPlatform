import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
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
  Activity
} from "lucide-react";

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
  const { data: members } = useQuery({
    queryKey: ['/api/super-admin/members'],
    enabled: isOpen
  });

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Users className="h-5 w-5 text-purple-600" />
            <span>Member Management Dashboard</span>
          </DialogTitle>
          <DialogDescription>
            Overview of all members across the ChurPay platform
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Search */}
          <div className="flex items-center space-x-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Search members by name, email, or church..."
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

          {/* Members List */}
          <div className="grid gap-4">
            {(members || []).map((member: any) => (
              <div key={member.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4 flex-1">
                    <div className="w-12 h-12 rounded-full overflow-hidden bg-gradient-to-br from-purple-100 to-indigo-100 flex items-center justify-center">
                      {member.profileImageUrl ? (
                        <img 
                          src={member.profileImageUrl} 
                          alt={`${member.firstName} ${member.lastName}`} 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <Users className="h-6 w-6 text-purple-600" />
                      )}
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="font-semibold text-gray-900">
                          {member.firstName} {member.lastName}
                        </h3>
                        <Badge 
                          variant={member.status === 'active' ? 'default' : 'secondary'}
                          className={member.status === 'active' ? 'bg-green-100 text-green-800' : ''}
                        >
                          {member.status}
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <p className="text-gray-500 flex items-center">
                            <Mail className="h-3 w-3 mr-1" />
                            Email
                          </p>
                          <p className="font-medium">{member.email}</p>
                        </div>
                        <div>
                          <p className="text-gray-500 flex items-center">
                            <Building2 className="h-3 w-3 mr-1" />
                            Church
                          </p>
                          <p className="font-medium">{member.churchName}</p>
                        </div>
                        <div>
                          <p className="text-gray-500 flex items-center">
                            <DollarSign className="h-3 w-3 mr-1" />
                            Total Donated
                          </p>
                          <p className="font-medium">R{member.totalDonated}</p>
                        </div>
                        <div>
                          <p className="text-gray-500 flex items-center">
                            <Calendar className="h-3 w-3 mr-1" />
                            Joined
                          </p>
                          <p className="font-medium">{new Date(member.joinDate).toLocaleDateString()}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <Button variant="outline" size="sm">
                    <Eye className="h-4 w-4 mr-1" />
                    View
                  </Button>
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-end pt-4 border-t">
            <Button onClick={onClose}>Close</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}