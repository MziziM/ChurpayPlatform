import React, { useState, useEffect } from 'react';
import { motion, Reorder } from 'framer-motion';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { 
  DollarSign, 
  Users, 
  Target, 
  TrendingUp, 
  Heart, 
  BarChart3, 
  Calendar,
  Settings,
  Plus,
  Grip,
  X,
  Eye,
  EyeOff,
  Layout,
  Maximize2,
  Minimize2
} from 'lucide-react';

interface Widget {
  id: string;
  type: 'stats' | 'chart' | 'list' | 'progress';
  title: string;
  icon: React.ReactNode;
  size: 'small' | 'medium' | 'large';
  visible: boolean;
  data: any;
  color: string;
}

interface DashboardWidgetsProps {
  userType: 'member' | 'church' | 'super_admin';
  dashboardData: any;
}

const DashboardWidgets: React.FC<DashboardWidgetsProps> = ({ userType, dashboardData }) => {
  const [widgets, setWidgets] = useState<Widget[]>([]);
  const [showCustomizer, setShowCustomizer] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);

  // Initialize widgets based on user type
  useEffect(() => {
    const savedWidgets = localStorage.getItem(`churpay-widgets-${userType}`);
    if (savedWidgets) {
      setWidgets(JSON.parse(savedWidgets));
    } else {
      setWidgets(getDefaultWidgets());
    }
  }, [userType, dashboardData]);

  const getDefaultWidgets = (): Widget[] => {
    const commonWidgets: Widget[] = [
      {
        id: 'total-donations',
        type: 'stats',
        title: 'Total Donations',
        icon: <DollarSign className="h-5 w-5" />,
        size: 'small',
        visible: true,
        data: { value: userType === 'member' ? dashboardData?.member?.totalDonated || 0 : dashboardData?.stats?.totalReceived || 0, change: '+12%' },
        color: 'bg-green-500'
      },
      {
        id: 'active-projects',
        type: 'stats',
        title: userType === 'member' ? 'Projects Supported' : 'Active Projects',
        icon: <Target className="h-5 w-5" />,
        size: 'small',
        visible: true,
        data: { value: userType === 'member' ? dashboardData?.projectsSupported?.length || 0 : dashboardData?.activeProjects?.length || 0, change: '+3' },
        color: 'bg-blue-500'
      },
      {
        id: 'recent-activity',
        type: 'list',
        title: 'Recent Activity',
        icon: <Calendar className="h-5 w-5" />,
        size: 'medium',
        visible: true,
        data: { items: userType === 'member' ? dashboardData?.recentDonations?.slice(0, 3) || [] : dashboardData?.recentTransactions?.slice(0, 3) || [] },
        color: 'bg-purple-500'
      },
      {
        id: 'giving-trends',
        type: 'chart',
        title: 'Giving Trends',
        icon: <BarChart3 className="h-5 w-5" />,
        size: 'large',
        visible: true,
        data: { chartType: 'line' },
        color: 'bg-orange-500'
      }
    ];

    if (userType === 'church') {
      commonWidgets.push({
        id: 'member-count',
        type: 'stats',
        title: 'Active Members',
        icon: <Users className="h-5 w-5" />,
        size: 'small',
        visible: true,
        data: { value: dashboardData?.stats?.activeMembers || 0, change: '+5' },
        color: 'bg-indigo-500'
      });
    }

    if (userType === 'member') {
      commonWidgets.push({
        id: 'giving-goal',
        type: 'progress',
        title: 'Monthly Giving Goal',
        icon: <Heart className="h-5 w-5" />,
        size: 'medium',
        visible: true,
        data: { current: 750, target: 1000, percentage: 75 },
        color: 'bg-pink-500'
      });
    }

    return commonWidgets;
  };

  const saveWidgets = (newWidgets: Widget[]) => {
    setWidgets(newWidgets);
    localStorage.setItem(`churpay-widgets-${userType}`, JSON.stringify(newWidgets));
  };

  const toggleWidgetVisibility = (widgetId: string) => {
    const newWidgets = widgets.map(widget =>
      widget.id === widgetId ? { ...widget, visible: !widget.visible } : widget
    );
    saveWidgets(newWidgets);
  };

  const changeWidgetSize = (widgetId: string, newSize: 'small' | 'medium' | 'large') => {
    const newWidgets = widgets.map(widget =>
      widget.id === widgetId ? { ...widget, size: newSize } : widget
    );
    saveWidgets(newWidgets);
  };

  const renderWidget = (widget: Widget) => {
    if (!widget.visible) return null;

    const sizeClasses = {
      small: 'col-span-1',
      medium: 'col-span-2',
      large: 'col-span-3'
    };

    return (
      <motion.div
        key={widget.id}
        layout
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.8 }}
        className={`${sizeClasses[widget.size]} relative group`}
      >
        <Card className="h-full hover:shadow-lg transition-all duration-200">
          {isEditMode && (
            <div className="absolute top-2 right-2 z-10 flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <Button
                size="sm"
                variant="ghost"
                className="h-6 w-6 p-0 bg-white/90 hover:bg-white"
                onClick={() => changeWidgetSize(widget.id, widget.size === 'small' ? 'medium' : widget.size === 'medium' ? 'large' : 'small')}
              >
                {widget.size === 'large' ? <Minimize2 className="h-3 w-3" /> : <Maximize2 className="h-3 w-3" />}
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="h-6 w-6 p-0 bg-white/90 hover:bg-white"
                onClick={() => toggleWidgetVisibility(widget.id)}
              >
                <EyeOff className="h-3 w-3" />
              </Button>
            </div>
          )}
          
          {isEditMode && (
            <div className="absolute top-2 left-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
              <Grip className="h-4 w-4 text-gray-400 cursor-move" />
            </div>
          )}

          <CardHeader className="pb-2">
            <div className="flex items-center space-x-2">
              <div className={`w-8 h-8 ${widget.color} rounded-lg flex items-center justify-center text-white`}>
                {widget.icon}
              </div>
              <h3 className="font-semibold text-sm">{widget.title}</h3>
            </div>
          </CardHeader>
          
          <CardContent>
            {renderWidgetContent(widget)}
          </CardContent>
        </Card>
      </motion.div>
    );
  };

  const renderWidgetContent = (widget: Widget) => {
    switch (widget.type) {
      case 'stats':
        return (
          <div>
            <p className="text-2xl font-bold text-gray-900">
              {typeof widget.data.value === 'number' ? 
                (widget.id === 'total-donations' ? `R ${widget.data.value.toLocaleString()}` : widget.data.value.toLocaleString()) : 
                widget.data.value
              }
            </p>
            {widget.data.change && (
              <Badge className="bg-green-100 text-green-800 mt-1">
                {widget.data.change}
              </Badge>
            )}
          </div>
        );
        
      case 'progress':
        return (
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-gray-600">
              <span>R {widget.data.current.toLocaleString()}</span>
              <span>R {widget.data.target.toLocaleString()}</span>
            </div>
            <Progress value={widget.data.percentage} className="h-2" />
            <p className="text-xs text-gray-500">{widget.data.percentage}% of goal</p>
          </div>
        );
        
      case 'list':
        return (
          <div className="space-y-2">
            {widget.data.items?.slice(0, 3).map((item: any, index: number) => (
              <div key={index} className="flex justify-between items-center text-sm">
                <span className="text-gray-600">
                  {userType === 'member' ? item.type : item.member}
                </span>
                <span className="font-medium">R {item.amount?.toLocaleString() || 0}</span>
              </div>
            ))}
          </div>
        );
        
      case 'chart':
        return (
          <div className="h-24 flex items-center justify-center text-gray-500">
            <BarChart3 className="h-8 w-8" />
            <span className="ml-2 text-sm">Chart View</span>
          </div>
        );
        
      default:
        return null;
    }
  };

  const visibleWidgets = widgets.filter(widget => widget.visible);

  return (
    <div className="space-y-4">
      {/* Widget Controls */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">Dashboard Overview</h2>
        <div className="flex items-center space-x-2">
          <Button
            variant={isEditMode ? "default" : "outline"}
            size="sm"
            onClick={() => setIsEditMode(!isEditMode)}
            className={isEditMode ? "bg-churpay-gradient text-white" : ""}
          >
            <Layout className="h-4 w-4 mr-2" />
            {isEditMode ? 'Done' : 'Edit'}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowCustomizer(true)}
          >
            <Settings className="h-4 w-4 mr-2" />
            Customize
          </Button>
        </div>
      </div>

      {/* Widgets Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 auto-rows-fr">
        {visibleWidgets.map(widget => renderWidget(widget))}
      </div>

      {/* Add Widget Prompt */}
      {visibleWidgets.length === 0 && (
        <Card className="border-dashed border-2 border-gray-300">
          <CardContent className="flex flex-col items-center justify-center py-8 text-center">
            <Plus className="h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Widgets Active</h3>
            <p className="text-gray-600 mb-4">Customize your dashboard by adding widgets</p>
            <Button onClick={() => setShowCustomizer(true)} className="bg-churpay-gradient text-white">
              <Plus className="h-4 w-4 mr-2" />
              Add Widgets
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Widget Customizer Modal */}
      <Dialog open={showCustomizer} onOpenChange={setShowCustomizer}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Customize Dashboard</DialogTitle>
            <DialogDescription>
              Choose which widgets to display and configure their settings
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {widgets.map((widget) => (
              <div key={widget.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className={`w-8 h-8 ${widget.color} rounded-lg flex items-center justify-center text-white`}>
                    {widget.icon}
                  </div>
                  <div>
                    <h4 className="font-medium">{widget.title}</h4>
                    <p className="text-sm text-gray-600">
                      Size: {widget.size} • Type: {widget.type}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <div className="flex space-x-1">
                    {(['small', 'medium', 'large'] as const).map((size) => (
                      <Button
                        key={size}
                        size="sm"
                        variant={widget.size === size ? "default" : "outline"}
                        className={widget.size === size ? "bg-churpay-gradient text-white h-6 px-2 text-xs" : "h-6 px-2 text-xs"}
                        onClick={() => changeWidgetSize(widget.id, size)}
                      >
                        {size[0].toUpperCase()}
                      </Button>
                    ))}
                  </div>
                  <Switch
                    checked={widget.visible}
                    onCheckedChange={() => toggleWidgetVisibility(widget.id)}
                  />
                </div>
              </div>
            ))}
          </div>
          
          <div className="flex justify-end space-x-2 pt-4">
            <Button variant="outline" onClick={() => setShowCustomizer(false)}>
              Close
            </Button>
            <Button 
              className="bg-churpay-gradient text-white"
              onClick={() => {
                setShowCustomizer(false);
                setIsEditMode(false);
              }}
            >
              Save Changes
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DashboardWidgets;