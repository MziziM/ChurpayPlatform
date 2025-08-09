import React, { useState } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { motion } from 'framer-motion';
import { 
  Users, 
  Plus, 
  Search, 
  Filter, 
  MoreHorizontal, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar,
  Edit,
  Trash2,
  Eye,
  UserPlus,
  Download,
  Upload,
  Star,
  DollarSign,
  Activity,
  CheckCircle,
  XCircle,
  Clock
} from 'lucide-react';

interface Member {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  join_date: string;
  role: 'member' | 'admin' | 'pastor' | 'treasurer' | 'deacon' | 'volunteer';
  status: 'active' | 'inactive' | 'suspended';
  avatar_url?: string;
  total_donations: number;
  last_donation: string;
  attendance_rate: number;
  ministry_involvement: string[];
  emergency_contact: {
    name: string;
    phone: string;
    relationship: string;
  };
  notes: string;
}

const mockMembers: Member[] = [
  {
    id: '1',
    name: 'John Smith',
    email: 'john.smith@email.com',
    phone: '+27 82 123 4567',
    address: '123 Main St, Cape Town, 8001',
    join_date: '2023-01-15',
    role: 'member',
    status: 'active',
    avatar_url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
    total_donations: 12500,
    last_donation: '2024-01-10',
    attendance_rate: 85,
    ministry_involvement: ['Youth Ministry', 'Music Team'],
    emergency_contact: {
      name: 'Jane Smith',
      phone: '+27 82 123 4568',
      relationship: 'Spouse'
    },
    notes: 'Active in youth ministry. Excellent musician.'
  },
  {
    id: '2',
    name: 'Mary Johnson',
    email: 'mary.johnson@email.com',
    phone: '+27 83 234 5678',
    address: '456 Oak Ave, Cape Town, 8002',
    join_date: '2022-06-20',
    role: 'deacon',
    status: 'active',
    avatar_url: 'https://images.unsplash.com/photo-1494790108755-2616b6dfae13?w=150&h=150&fit=crop&crop=face',
    total_donations: 18750,
    last_donation: '2024-01-12',
    attendance_rate: 92,
    ministry_involvement: ['Women\'s Ministry', 'Prayer Team'],
    emergency_contact: {
      name: 'Robert Johnson',
      phone: '+27 83 234 5679',
      relationship: 'Husband'
    },
    notes: 'Leads women\'s bible study. Very active in community outreach.'
  },
  {
    id: '3',
    name: 'David Wilson',
    email: 'david.wilson@email.com',
    phone: '+27 84 345 6789',
    address: '789 Pine Rd, Cape Town, 8003',
    join_date: '2023-09-10',
    role: 'volunteer',
    status: 'active',
    avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
    total_donations: 5200,
    last_donation: '2024-01-08',
    attendance_rate: 78,
    ministry_involvement: ['Sound Tech', 'Ushering'],
    emergency_contact: {
      name: 'Sarah Wilson',
      phone: '+27 84 345 6790',
      relationship: 'Sister'
    },
    notes: 'Excellent with technology. Helps with live streaming.'
  },
  {
    id: '4',
    name: 'Sarah Brown',
    email: 'sarah.brown@email.com',
    phone: '+27 85 456 7890',
    address: '321 Elm St, Cape Town, 8004',
    join_date: '2021-03-05',
    role: 'admin',
    status: 'active',
    avatar_url: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
    total_donations: 24000,
    last_donation: '2024-01-13',
    attendance_rate: 95,
    ministry_involvement: ['Administration', 'Finance Committee'],
    emergency_contact: {
      name: 'Mike Brown',
      phone: '+27 85 456 7891',
      relationship: 'Husband'
    },
    notes: 'Manages church administration. Very reliable and organized.'
  }
];

export function MemberManagement() {
  const [members, setMembers] = useState<Member[]>(mockMembers);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [showMemberModal, setShowMemberModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingMember, setEditingMember] = useState<Partial<Member>>({});

  const filteredMembers = members.filter(member => {
    const matchesSearch = member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         member.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = filterRole === 'all' || member.role === filterRole;
    const matchesStatus = filterStatus === 'all' || member.status === filterStatus;
    return matchesSearch && matchesRole && matchesStatus;
  });

  const memberStats = {
    total: members.length,
    active: members.filter(m => m.status === 'active').length,
    inactive: members.filter(m => m.status === 'inactive').length,
    newThisMonth: members.filter(m => {
      const joinDate = new Date(m.join_date);
      const now = new Date();
      return joinDate.getMonth() === now.getMonth() && joinDate.getFullYear() === now.getFullYear();
    }).length
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'pastor': return 'bg-purple-100 text-purple-800';
      case 'admin': return 'bg-blue-100 text-blue-800';
      case 'treasurer': return 'bg-green-100 text-green-800';
      case 'deacon': return 'bg-orange-100 text-orange-800';
      case 'volunteer': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-gray-100 text-gray-800';
      case 'suspended': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleAddMember = () => {
    const newMember: Member = {
      id: Date.now().toString(),
      name: editingMember.name || '',
      email: editingMember.email || '',
      phone: editingMember.phone || '',
      address: editingMember.address || '',
      join_date: new Date().toISOString().split('T')[0],
      role: editingMember.role || 'member',
      status: 'active',
      total_donations: 0,
      last_donation: '',
      attendance_rate: 0,
      ministry_involvement: [],
      emergency_contact: {
        name: '',
        phone: '',
        relationship: ''
      },
      notes: ''
    };
    setMembers([...members, newMember]);
    setShowAddModal(false);
    setEditingMember({});
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Member Management
          </h1>
          <p className="text-gray-600">
            Manage church members, roles, and information
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Button variant="outline" size="sm">
            <Upload className="w-4 h-4 mr-2" />
            Import Members
          </Button>
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Export Data
          </Button>
          <Button 
            size="sm" 
            onClick={() => setShowAddModal(true)}
            className="bg-churpay-gradient text-white"
          >
            <UserPlus className="w-4 h-4 mr-2" />
            Add Member
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="p-6 bg-white border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Members</p>
              <p className="text-2xl font-bold text-gray-900">{memberStats.total}</p>
            </div>
            <Users className="w-8 h-8 text-purple-600" />
          </div>
        </Card>
        <Card className="p-6 bg-white border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Active Members</p>
              <p className="text-2xl font-bold text-green-600">{memberStats.active}</p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-500" />
          </div>
        </Card>
        <Card className="p-6 bg-white border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Inactive</p>
              <p className="text-2xl font-bold text-gray-600">{memberStats.inactive}</p>
            </div>
            <XCircle className="w-8 h-8 text-gray-500" />
          </div>
        </Card>
        <Card className="p-6 bg-white border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">New This Month</p>
              <p className="text-2xl font-bold text-yellow-600">{memberStats.newThisMonth}</p>
            </div>
            <Star className="w-8 h-8 text-yellow-500" />
          </div>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card className="p-6 bg-white border border-gray-200">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
            <Input
              placeholder="Search members by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-gray-50 border-gray-200 text-gray-900"
            />
          </div>
          <select
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value)}
            className="px-3 py-2 rounded-md border bg-gray-50 border-gray-200 text-gray-900"
          >
            <option value="all">All Roles</option>
            <option value="pastor">Pastor</option>
            <option value="admin">Admin</option>
            <option value="treasurer">Treasurer</option>
            <option value="deacon">Deacon</option>
            <option value="volunteer">Volunteer</option>
            <option value="member">Member</option>
          </select>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 rounded-md border bg-gray-50 border-gray-200 text-gray-900"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="suspended">Suspended</option>
          </select>
        </div>
      </Card>

      {/* Members Table */}
      <Card className="overflow-hidden bg-white border border-gray-200">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b border-gray-200">
              <tr>
                <th className="text-left p-4 text-gray-600">Member</th>
                <th className="text-left p-4 text-gray-600">Contact</th>
                <th className="text-left p-4 text-gray-600">Role</th>
                <th className="text-left p-4 text-gray-600">Status</th>
                <th className="text-left p-4 text-gray-600">Donations</th>
                <th className="text-left p-4 text-gray-600">Attendance</th>
                <th className="text-left p-4 text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredMembers.map((member) => (
                <tr key={member.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="p-4">
                    <div className="flex items-center space-x-3">
                      <Avatar>
                        <AvatarImage src={member.avatar_url} />
                        <AvatarFallback>{member.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium text-gray-900">{member.name}</p>
                        <p className="text-sm text-gray-600">Joined {member.join_date}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <Mail className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-900">{member.email}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Phone className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-900">{member.phone}</span>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <Badge className={getRoleColor(member.role)}>
                      {member.role}
                    </Badge>
                  </td>
                  <td className="p-4">
                    <Badge className={getStatusColor(member.status)}>
                      {member.status}
                    </Badge>
                  </td>
                  <td className="p-4">
                    <div>
                      <p className="font-medium text-gray-900">R{member.total_donations.toLocaleString()}</p>
                      <p className="text-sm text-gray-600">Last: {member.last_donation || 'Never'}</p>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center space-x-2">
                      <div className="w-12 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-green-500 h-2 rounded-full" 
                          style={{ width: `${member.attendance_rate}%` }}
                        ></div>
                      </div>
                      <span className="text-sm text-gray-600">{member.attendance_rate}%</span>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center space-x-2">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => {
                          setSelectedMember(member);
                          setShowMemberModal(true);
                        }}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Member Detail Modal */}
      <Dialog open={showMemberModal} onOpenChange={setShowMemberModal}>
        <DialogContent className="sm:max-w-2xl bg-white">
          <DialogHeader>
            <DialogTitle className="text-gray-900">Member Details</DialogTitle>
          </DialogHeader>
          {selectedMember && (
            <div className="space-y-6">
              <div className="flex items-center space-x-4">
                <Avatar className="w-16 h-16">
                  <AvatarImage src={selectedMember.avatar_url} />
                  <AvatarFallback className="text-lg">
                    {selectedMember.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">{selectedMember.name}</h3>
                  <p className="text-gray-600">{selectedMember.role}</p>
                  <Badge className={getStatusColor(selectedMember.status)}>
                    {selectedMember.status}
                  </Badge>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <Card className="p-4 bg-gray-50">
                  <h4 className="font-semibold text-gray-900 mb-2">Contact Information</h4>
                  <div className="space-y-2">
                    <p className="text-sm"><span className="font-medium">Email:</span> {selectedMember.email}</p>
                    <p className="text-sm"><span className="font-medium">Phone:</span> {selectedMember.phone}</p>
                    <p className="text-sm"><span className="font-medium">Address:</span> {selectedMember.address}</p>
                    <p className="text-sm"><span className="font-medium">Joined:</span> {selectedMember.join_date}</p>
                  </div>
                </Card>

                <Card className="p-4 bg-gray-50">
                  <h4 className="font-semibold text-gray-900 mb-2">Church Involvement</h4>
                  <div className="space-y-2">
                    <p className="text-sm"><span className="font-medium">Total Donations:</span> R{selectedMember.total_donations.toLocaleString()}</p>
                    <p className="text-sm"><span className="font-medium">Last Donation:</span> {selectedMember.last_donation || 'Never'}</p>
                    <p className="text-sm"><span className="font-medium">Attendance Rate:</span> {selectedMember.attendance_rate}%</p>
                    <div className="text-sm">
                      <span className="font-medium">Ministries:</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {selectedMember.ministry_involvement.map((ministry, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {ministry}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </Card>
              </div>

              {selectedMember.notes && (
                <Card className="p-4 bg-gray-50">
                  <h4 className="font-semibold text-gray-900 mb-2">Notes</h4>
                  <p className="text-sm text-gray-700">{selectedMember.notes}</p>
                </Card>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Add Member Modal */}
      <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
        <DialogContent className="sm:max-w-lg bg-white">
          <DialogHeader>
            <DialogTitle className="text-gray-900">Add New Member</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              placeholder="Full Name"
              value={editingMember.name || ''}
              onChange={(e) => setEditingMember({...editingMember, name: e.target.value})}
              className="bg-gray-50 border-gray-200"
            />
            <Input
              placeholder="Email"
              type="email"
              value={editingMember.email || ''}
              onChange={(e) => setEditingMember({...editingMember, email: e.target.value})}
              className="bg-gray-50 border-gray-200"
            />
            <Input
              placeholder="Phone"
              value={editingMember.phone || ''}
              onChange={(e) => setEditingMember({...editingMember, phone: e.target.value})}
              className="bg-gray-50 border-gray-200"
            />
            <Input
              placeholder="Address"
              value={editingMember.address || ''}
              onChange={(e) => setEditingMember({...editingMember, address: e.target.value})}
              className="bg-gray-50 border-gray-200"
            />
            <select
              value={editingMember.role || 'member'}
              onChange={(e) => setEditingMember({...editingMember, role: e.target.value as Member['role']})}
              className="w-full px-3 py-2 rounded-md border bg-gray-50 border-gray-200 text-gray-900"
            >
              <option value="member">Member</option>
              <option value="volunteer">Volunteer</option>
              <option value="deacon">Deacon</option>
              <option value="admin">Admin</option>
              <option value="treasurer">Treasurer</option>
              <option value="pastor">Pastor</option>
            </select>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setShowAddModal(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddMember} className="bg-churpay-gradient text-white">
                Add Member
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}