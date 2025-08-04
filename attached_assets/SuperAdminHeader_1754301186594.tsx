import { Button } from "./ui/button";
import { Bell, Menu, Settings, User, Shield } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Badge } from "./ui/badge";

interface SuperAdminHeaderProps {
  currentView: string;
  onViewChange: (view: string) => void;
}

export function SuperAdminHeader({ currentView, onViewChange }: SuperAdminHeaderProps) {
  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-churpay-gradient rounded-lg flex items-center justify-center">
              <Shield className="h-4 w-4 text-white" />
            </div>
            <div>
              <span className="text-2xl font-bold text-gray-900">Chur</span>
              <span className="text-2xl font-bold text-churpay-yellow">Pay</span>
              <Badge className="ml-2 bg-red-600 text-white text-xs">ADMIN</Badge>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="hidden md:flex items-center space-x-1">
          {[
            { id: 'overview', label: 'Overview' },
            { id: 'churches', label: 'Churches' },
            { id: 'finances', label: 'Finances' },
            { id: 'users', label: 'Users' },
            { id: 'support', label: 'Support' },
            { id: 'analytics', label: 'Analytics' },
            { id: 'system', label: 'System' },
          ].map((item) => (
            <Button
              key={item.id}
              variant={currentView === item.id ? "default" : "ghost"}
              onClick={() => onViewChange(item.id)}
              className={currentView === item.id ? "bg-primary text-white" : ""}
            >
              {item.label}
            </Button>
          ))}
        </nav>

        {/* Actions */}
        <div className="flex items-center space-x-3">
          {/* System Alerts */}
          <Button variant="ghost" size="sm" className="relative">
            <Bell className="h-5 w-5" />
            <Badge className="absolute -top-1 -right-1 h-5 w-5 text-xs bg-red-500 text-white rounded-full flex items-center justify-center">
              5
            </Badge>
          </Button>

          {/* Settings */}
          <Button variant="ghost" size="sm">
            <Settings className="h-5 w-5" />
          </Button>

          {/* Admin Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                  <Shield className="h-4 w-4 text-red-600" />
                </div>
                <span className="hidden md:block">Super Admin</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuItem>Admin Profile</DropdownMenuItem>
              <DropdownMenuItem>Platform Settings</DropdownMenuItem>
              <DropdownMenuItem>Security Settings</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Activity Log</DropdownMenuItem>
              <DropdownMenuItem>System Health</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-red-600">Sign Out</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Mobile Menu */}
          <Button variant="ghost" size="sm" className="md:hidden">
            <Menu className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </header>
  );
}