import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Church, 
  Users, 
  Shield, 
  Menu, 
  X, 
  Bell,
  Settings,
  LogOut
} from "lucide-react";

interface NavigationProps {
  currentView: string;
  onViewChange: (view: string) => void;
  title: string;
  subtitle?: string;
}

export function Navigation({ currentView, onViewChange, title, subtitle }: NavigationProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user } = useAuth();

  const getNavigationItems = () => {
    switch (user?.role) {
      case 'superadmin':
        return [
          { id: 'overview', label: 'Overview', icon: Shield },
          { id: 'churches', label: 'Churches', icon: Church },
          { id: 'finances', label: 'Finances', icon: Shield },
          { id: 'users', label: 'Users', icon: Users },
          { id: 'support', label: 'Support', icon: Settings },
          { id: 'analytics', label: 'Analytics', icon: Shield },
          { id: 'system', label: 'System', icon: Settings },
        ];
      case 'church_admin':
      case 'church_staff':
        return [
          { id: 'overview', label: 'Overview', icon: Church },
          { id: 'reports', label: 'Reports', icon: Shield },
          { id: 'members', label: 'Members', icon: Users },
          { id: 'projects', label: 'Projects', icon: Church },
          { id: 'payouts', label: 'Payouts', icon: Shield },
          { id: 'settings', label: 'Settings', icon: Settings },
        ];
      case 'member':
        return [
          { id: 'overview', label: 'Overview', icon: Users },
          { id: 'donate', label: 'Donate', icon: Shield },
          { id: 'history', label: 'History', icon: Shield },
          { id: 'projects', label: 'Projects', icon: Church },
          { id: 'settings', label: 'Settings', icon: Settings },
        ];
      default:
        return [];
    }
  };

  const navigationItems = getNavigationItems();

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        {/* Logo and Title */}
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-churpay-gradient rounded-lg flex items-center justify-center">
              <Church className="h-4 w-4 text-white" />
            </div>
            <div>
              <span className="text-2xl font-bold text-gray-900">Chur</span>
              <span className="text-2xl font-bold text-churpay-yellow">Pay</span>
              {user?.role === 'superadmin' && (
                <Badge className="ml-2 bg-red-600 text-white text-xs">ADMIN</Badge>
              )}
            </div>
          </div>
          <div className="hidden md:block">
            <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
            {subtitle && <p className="text-sm text-gray-600">{subtitle}</p>}
          </div>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-1">
          {navigationItems.map((item) => (
            <Button
              key={item.id}
              variant={currentView === item.id ? "default" : "ghost"}
              onClick={() => onViewChange(item.id)}
              className={currentView === item.id ? "bg-primary text-white" : ""}
            >
              <item.icon className="h-4 w-4 mr-2" />
              {item.label}
            </Button>
          ))}
        </nav>

        {/* Actions */}
        <div className="flex items-center space-x-3">
          <Button variant="ghost" size="sm" className="relative">
            <Bell className="h-5 w-5" />
            <Badge className="absolute -top-1 -right-1 h-5 w-5 text-xs bg-red-500 text-white rounded-full flex items-center justify-center">
              {user?.role === 'superadmin' ? '5' : '3'}
            </Badge>
          </Button>

          <Button variant="ghost" size="sm">
            <Settings className="h-5 w-5" />
          </Button>

          <Button 
            variant="outline"
            size="sm"
            onClick={() => window.location.href = '/api/logout'}
          >
            <LogOut className="h-4 w-4 mr-2" />
            Sign Out
          </Button>

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="sm"
            className="md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden mt-4 border-t border-gray-200 pt-4">
          <nav className="space-y-2">
            {navigationItems.map((item) => (
              <Button
                key={item.id}
                variant={currentView === item.id ? "default" : "ghost"}
                onClick={() => {
                  onViewChange(item.id);
                  setMobileMenuOpen(false);
                }}
                className={`w-full justify-start ${currentView === item.id ? "bg-primary text-white" : ""}`}
              >
                <item.icon className="h-4 w-4 mr-2" />
                {item.label}
              </Button>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
}
