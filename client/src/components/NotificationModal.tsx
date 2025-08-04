import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Bell, CheckCircle2, AlertCircle, Info, Heart,
  Building2, Target, Calendar, Clock, Trash2,
  Settings
} from 'lucide-react';

interface NotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface Notification {
  id: string;
  type: 'donation' | 'project' | 'church' | 'system' | 'achievement';
  title: string;
  message: string;
  timestamp: string;
  isRead: boolean;
  priority: 'low' | 'medium' | 'high';
  actionable?: boolean;
}

export function NotificationModal({ isOpen, onClose }: NotificationModalProps) {
  const [activeTab, setActiveTab] = useState('all');
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: '1',
      type: 'donation',
      title: 'Donation Successful',
      message: 'Your R500 tithe donation to Grace Baptist Church has been processed successfully.',
      timestamp: '2025-01-04T10:30:00Z',
      isRead: false,
      priority: 'medium',
      actionable: false
    },
    {
      id: '2', 
      type: 'project',
      title: 'Project Milestone Reached',
      message: 'The New Sanctuary Building project has reached 50% of its funding goal! Thank you for your contribution.',
      timestamp: '2025-01-03T15:45:00Z',
      isRead: false,
      priority: 'high',
      actionable: true
    },
    {
      id: '3',
      type: 'achievement',
      title: 'New Achievement Unlocked!',
      message: 'Congratulations! You\'ve earned the "Faithful Giver" badge for 12 consecutive months of donations.',
      timestamp: '2025-01-03T09:15:00Z',
      isRead: true,
      priority: 'medium',
      actionable: false
    },
    {
      id: '4',
      type: 'church',
      title: 'Church Event Reminder',
      message: 'Don\'t forget about the Youth Ministry fundraising dinner this Saturday at 6 PM.',
      timestamp: '2025-01-02T18:20:00Z',
      isRead: false,
      priority: 'low',
      actionable: true
    },
    {
      id: '5',
      type: 'system',
      title: 'Security Alert',
      message: 'New login detected from Cape Town. If this wasn\'t you, please secure your account immediately.',
      timestamp: '2025-01-02T14:10:00Z',
      isRead: true,
      priority: 'high',
      actionable: true
    },
    {
      id: '6',
      type: 'donation',
      title: 'Monthly Budget Reminder',
      message: 'You\'ve used 85% of your R2,000 monthly giving budget. Consider adjusting your upcoming donations.',
      timestamp: '2025-01-01T12:00:00Z',
      isRead: false,
      priority: 'medium',
      actionable: true
    },
    {
      id: '7',
      type: 'project',
      title: 'Project Support Request',
      message: 'The Kenya Mission Trip needs additional funding to reach its goal by March 15th.',
      timestamp: '2024-12-30T16:30:00Z',
      isRead: true,
      priority: 'medium',
      actionable: true
    },
    {
      id: '8',
      type: 'system',
      title: 'Account Update',
      message: 'Your payment method ending in 4532 will expire next month. Please update your payment information.',
      timestamp: '2024-12-28T11:45:00Z',
      isRead: false,
      priority: 'high',
      actionable: true
    }
  ]);

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'donation':
        return <Heart className="h-5 w-5 text-green-600" />;
      case 'project':
        return <Target className="h-5 w-5 text-blue-600" />;
      case 'church':
        return <Building2 className="h-5 w-5 text-purple-600" />;
      case 'achievement':
        return <CheckCircle2 className="h-5 w-5 text-yellow-600" />;
      case 'system':
        return <AlertCircle className="h-5 w-5 text-red-600" />;
      default:
        return <Info className="h-5 w-5 text-gray-600" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
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

  const filteredNotifications = notifications.filter(notification => {
    if (activeTab === 'all') return true;
    if (activeTab === 'unread') return !notification.isRead;
    return notification.type === activeTab;
  });

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, isRead: true } : n)
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(n => ({ ...n, isRead: true }))
    );
  };

  const deleteNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-indigo-700 rounded-xl flex items-center justify-center">
                <Bell className="h-5 w-5 text-white" />
              </div>
              <span>Notifications</span>
              {unreadCount > 0 && (
                <Badge className="bg-red-100 text-red-800">
                  {unreadCount} new
                </Badge>
              )}
            </span>
            <div className="flex space-x-2">
              {unreadCount > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={markAllAsRead}
                  className="rounded-xl"
                >
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  Mark All Read
                </Button>
              )}
              <Button variant="ghost" size="sm" className="rounded-xl">
                <Settings className="h-4 w-4" />
              </Button>
            </div>
          </DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex flex-col h-[600px]">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="unread">Unread</TabsTrigger>
            <TabsTrigger value="donation">Giving</TabsTrigger>
            <TabsTrigger value="project">Projects</TabsTrigger>
            <TabsTrigger value="church">Church</TabsTrigger>
            <TabsTrigger value="system">System</TabsTrigger>
          </TabsList>

          <div className="flex-1 mt-4">
            <ScrollArea className="h-full">
              <div className="space-y-3 pr-4">
                {filteredNotifications.length === 0 ? (
                  <div className="text-center py-12">
                    <Bell className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">No notifications to show</p>
                  </div>
                ) : (
                  filteredNotifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`p-4 rounded-xl border-2 transition-all duration-200 hover:border-purple-300 ${
                        notification.isRead 
                          ? 'bg-gray-50 border-gray-200' 
                          : 'bg-white border-purple-200 shadow-sm'
                      }`}
                    >
                      <div className="flex items-start space-x-4">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                          notification.isRead ? 'bg-gray-100' : 'bg-purple-50'
                        }`}>
                          {getNotificationIcon(notification.type)}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center space-x-2 mb-1">
                                <h4 className={`font-semibold text-sm ${
                                  notification.isRead ? 'text-gray-700' : 'text-gray-900'
                                }`}>
                                  {notification.title}
                                </h4>
                                <Badge 
                                  variant="outline" 
                                  className={`text-xs ${getPriorityColor(notification.priority)}`}
                                >
                                  {notification.priority}
                                </Badge>
                              </div>
                              <p className={`text-sm leading-relaxed ${
                                notification.isRead ? 'text-gray-600' : 'text-gray-700'
                              }`}>
                                {notification.message}
                              </p>
                              <div className="flex items-center space-x-4 mt-3">
                                <span className="flex items-center text-xs text-gray-500">
                                  <Clock className="h-3 w-3 mr-1" />
                                  {getTimeAgo(notification.timestamp)}
                                </span>
                                {notification.actionable && (
                                  <Button 
                                    variant="outline" 
                                    size="sm" 
                                    className="h-7 px-3 text-xs rounded-lg"
                                  >
                                    Take Action
                                  </Button>
                                )}
                              </div>
                            </div>
                            
                            <div className="flex items-center space-x-2 ml-4">
                              {!notification.isRead && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => markAsRead(notification.id)}
                                  className="h-8 w-8 p-0 rounded-lg"
                                >
                                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                                </Button>
                              )}
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => deleteNotification(notification.id)}
                                className="h-8 w-8 p-0 rounded-lg text-red-600 hover:text-red-700 hover:bg-red-50"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
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