import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Landing from "@/pages/landing";
import ChurchRegistration from "@/pages/church-registration";
import MemberRegistration from "@/pages/member-registration";
import PublicChurchRegistration from "@/pages/public-church-registration";
import PublicMemberRegistration from "@/pages/public-member-registration";
import ProfessionalMemberDashboard from "@/pages/ProfessionalMemberDashboard";
import ProfessionalChurchDashboard from "@/pages/ProfessionalChurchDashboard";
import WalletDashboard from "@/pages/WalletDashboard";
import SuperAdminDashboard from "@/pages/SuperAdminDashboard";
import AdminSignUp from "@/pages/AdminSignUp";
import AdminSignIn from "@/pages/AdminSignIn";
import AdminDashboard from "@/pages/AdminDashboard";
import SuperAdminSignUp from "@/pages/SuperAdminSignUp";
import SuperAdminSignIn from "@/pages/SuperAdminSignIn";
import SignIn from "@/pages/sign-in";
import NotFound from "@/pages/not-found";
import ChurchPayoutDemo from "@/pages/ChurchPayoutDemo";

import { ProtectedRoute } from "@/components/ProtectedRoute";


function Router() {
  return (
    <Switch>
      <Route path="/" component={Landing} />
      <Route path="/church-registration" component={PublicChurchRegistration} />
      <Route path="/member-registration" component={PublicMemberRegistration} />
      <Route path="/public-church-registration" component={PublicChurchRegistration} />
      <Route path="/public-member-registration" component={PublicMemberRegistration} />
      <Route path="/register" component={PublicMemberRegistration} />
      <Route path="/member-dashboard">
        <ProtectedRoute requiredRole={['member']}>
          <ProfessionalMemberDashboard />
        </ProtectedRoute>
      </Route>
      <Route path="/member">
        <ProtectedRoute requiredRole={['member']}>
          <ProfessionalMemberDashboard />
        </ProtectedRoute>
      </Route>
      <Route path="/church-dashboard" component={ProfessionalChurchDashboard} />
      <Route path="/church">
        <ProtectedRoute requiredRole={['church_admin', 'church_staff']}>
          <ProfessionalChurchDashboard />
        </ProtectedRoute>
      </Route>
      <Route path="/wallet">
        <ProtectedRoute requiredRole={['member']}>
          <WalletDashboard />
        </ProtectedRoute>
      </Route>
      <Route path="/super-admin" component={SuperAdminDashboard} />
      <Route path="/admin" component={SuperAdminDashboard} />
      <Route path="/admin/signup" component={AdminSignUp} />
      <Route path="/admin/signin" component={AdminSignIn} />
      <Route path="/admin/dashboard">
        <ProtectedRoute requiredRole={['superadmin', 'church_admin']}>
          <AdminDashboard />
        </ProtectedRoute>
      </Route>
      <Route path="/super-admin/signup" component={SuperAdminSignUp} />
      <Route path="/super-admin/signin" component={SuperAdminSignIn} />
      <Route path="/sign-in" component={SignIn} />
      <Route path="/payout-demo" component={ChurchPayoutDemo} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
