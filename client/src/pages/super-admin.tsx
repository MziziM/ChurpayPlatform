import { useState } from "react";
import { SuperAdminHeader } from "@/components/super-admin-header";
import { SuperAdminOverview } from "@/components/super-admin-overview";

export default function SuperAdmin() {
  const [currentView, setCurrentView] = useState('overview');

  const renderView = () => {
    switch (currentView) {
      case 'overview':
        return <SuperAdminOverview />;
      case 'churches':
        return <div className="p-6">Churches management coming soon...</div>;
      case 'finances':
        return <div className="p-6">Financial overview coming soon...</div>;
      case 'users':
        return <div className="p-6">User management coming soon...</div>;
      case 'support':
        return <div className="p-6">Support dashboard coming soon...</div>;
      case 'analytics':
        return <div className="p-6">Advanced analytics coming soon...</div>;
      case 'system':
        return <div className="p-6">System settings coming soon...</div>;
      default:
        return <SuperAdminOverview />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <SuperAdminHeader currentView={currentView} onViewChange={setCurrentView} />
      <main>{renderView()}</main>
    </div>
  );
}
