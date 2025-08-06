import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import { 
  Activity, Heart, Target, ArrowUpRight, ArrowDownRight,
  Calendar as CalendarIcon, Filter, Search, Download,
  TrendingUp, Clock, Building2, CreditCard
} from 'lucide-react';

interface ActivitiesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface TransactionActivity {
  id: string;
  type: 'donation' | 'tithe' | 'project' | 'topup' | 'transfer';
  amount: string;
  description: string;
  churchName?: string;
  projectName?: string;
  status: 'completed' | 'pending' | 'failed';
  paymentMethod: string;
  timestamp: string;
  reference: string;
}

export function ActivitiesModal({ isOpen, onClose }: ActivitiesModalProps) {
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFilter, setDateFilter] = useState<'all' | 'today' | 'week' | 'month' | 'custom'>('all');
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);

  // Fetch donation history and wallet transactions
  const { data: donations = [] } = useQuery({
    queryKey: ['/api/donations/history'],
    enabled: isOpen,
  });

  // Transform real donation history into activity format
  const activities: TransactionActivity[] = donations.map((donation: any) => ({
    id: donation.id,
    type: donation.donationType || donation.type,
    amount: donation.amount || '0.00',
    description: donation.note || `${(donation.donationType || 'donation').charAt(0).toUpperCase() + (donation.donationType || 'donation').slice(1)} payment`,
    churchName: donation.churchName || 'Your Church',
    projectName: donation.projectName,
    status: donation.status || 'completed',
    paymentMethod: donation.paymentMethod || 'PayFast',
    timestamp: donation.createdAt || new Date().toISOString(),
    reference: donation.id || `TXN_${Date.now()}`
  }));

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'donation':
        return <Heart className="h-5 w-5 text-green-600" />;
      case 'tithe':
        return <Heart className="h-5 w-5 text-purple-600" />;
      case 'project':
        return <Target className="h-5 w-5 text-blue-600" />;
      case 'topup':
        return <ArrowDownRight className="h-5 w-5 text-orange-600" />;
      case 'transfer':
        return <ArrowUpRight className="h-5 w-5 text-gray-600" />;
      default:
        return <Activity className="h-5 w-5 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTimeAgo = (timestamp: string) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInHours = Math.floor((now.getTime() - time.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;
    return time.toLocaleDateString();
  };

  const filteredActivities = activities.filter(activity => {
    // Filter by tab
    if (activeTab !== 'all' && activity.type !== activeTab) return false;
    
    // Filter by search query
    if (searchQuery && !activity.description.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !activity.churchName?.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !activity.projectName?.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !activity.reference.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    
    // Filter by date
    if (dateFilter !== 'all') {
      const activityDate = new Date(activity.timestamp);
      const now = new Date();
      
      switch (dateFilter) {
        case 'today':
          if (activityDate.toDateString() !== now.toDateString()) return false;
          break;
        case 'week':
          const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          if (activityDate < weekAgo) return false;
          break;
        case 'month':
          const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          if (activityDate < monthAgo) return false;
          break;
      }
    }
    
    return true;
  });

  const totalAmount = filteredActivities
    .filter(a => a.status === 'completed')
    .reduce((sum, activity) => sum + parseFloat(activity.amount), 0);

  const transactionCount = filteredActivities.length;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-indigo-700 rounded-xl flex items-center justify-center">
                <Activity className="h-5 w-5 text-white" />
              </div>
              <span>My Activities</span>
            </span>
            <Button variant="outline" size="sm" className="rounded-xl">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </DialogTitle>
        </DialogHeader>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Amount</p>
                  <p className="text-2xl font-bold text-green-600">R {totalAmount.toLocaleString()}</p>
                </div>
                <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                  <TrendingUp className="h-5 w-5 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Transactions</p>
                  <p className="text-2xl font-bold text-blue-600">{transactionCount}</p>
                </div>
                <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                  <Activity className="h-5 w-5 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">This Month</p>
                  <p className="text-2xl font-bold text-purple-600">
                    {filteredActivities.filter(a => {
                      const date = new Date(a.timestamp);
                      const now = new Date();
                      return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
                    }).length}
                  </p>
                </div>
                <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                  <CalendarIcon className="h-5 w-5 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <div className="flex flex-col lg:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search activities..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 rounded-xl"
            />
          </div>
          <div className="flex space-x-2">
            <Button
              variant={dateFilter === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setDateFilter('all')}
              className="rounded-xl"
            >
              All Time
            </Button>
            <Button
              variant={dateFilter === 'month' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setDateFilter('month')}
              className="rounded-xl"
            >
              This Month
            </Button>
            <Button
              variant={dateFilter === 'week' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setDateFilter('week')}
              className="rounded-xl"
            >
              This Week
            </Button>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex flex-col flex-1">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="donation">Donations</TabsTrigger>
            <TabsTrigger value="tithe">Tithes</TabsTrigger>
            <TabsTrigger value="project">Projects</TabsTrigger>
            <TabsTrigger value="topup">Top-ups</TabsTrigger>
            <TabsTrigger value="transfer">Transfers</TabsTrigger>
          </TabsList>

          <div className="flex-1 mt-4">
            <ScrollArea className="h-[400px]">
              <div className="space-y-3 pr-4">
                {filteredActivities.length === 0 ? (
                  <div className="text-center py-12">
                    <Activity className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">No activities found</p>
                  </div>
                ) : (
                  filteredActivities.map((activity) => (
                    <Card key={activity.id} className="hover:shadow-md transition-all duration-200">
                      <CardContent className="p-4">
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center flex-shrink-0">
                            {getActivityIcon(activity.type)}
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center space-x-2 mb-1">
                                  <h4 className="font-semibold text-gray-900 capitalize">
                                    {activity.type === 'topup' ? 'Wallet Top-up' : activity.type}
                                  </h4>
                                  <Badge className={getStatusColor(activity.status)}>
                                    {activity.status}
                                  </Badge>
                                </div>
                                
                                <p className="text-sm text-gray-600 mb-1">{activity.description}</p>
                                
                                {activity.churchName && (
                                  <p className="text-xs text-gray-500 flex items-center">
                                    <Building2 className="h-3 w-3 mr-1" />
                                    {activity.churchName}
                                    {activity.projectName && ` • ${activity.projectName}`}
                                  </p>
                                )}
                                
                                <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                                  <span className="flex items-center">
                                    <CreditCard className="h-3 w-3 mr-1" />
                                    {activity.paymentMethod}
                                  </span>
                                  <span className="flex items-center">
                                    <Clock className="h-3 w-3 mr-1" />
                                    {getTimeAgo(activity.timestamp)}
                                  </span>
                                  <span>Ref: {activity.reference}</span>
                                </div>
                              </div>
                              
                              <div className="text-right ml-4">
                                <p className={`text-lg font-bold ${
                                  activity.type === 'topup' ? 'text-green-600' : 'text-gray-900'
                                }`}>
                                  {activity.type === 'topup' ? '+' : '-'}R {activity.amount}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </ScrollArea>
          </div>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}