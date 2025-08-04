import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import { PublicRoute } from "@/components/PublicRoute";
import Landing from "@/pages/landing";
import Home from "@/pages/home";
import PublicChurchRegistration from "@/pages/public-church-registration";
import PublicMemberRegistration from "@/pages/public-member-registration";
import SuperAdmin from "@/pages/super-admin";
import ChurchDashboard from "@/pages/church-dashboard";
import MemberDashboard from "@/pages/member-dashboard";
import NotFound from "@/pages/not-found";

function PublicRoutes() {
  return (
    <Switch>
      <Route path="/church-registration" component={() => (
        <PublicRoute>
          <PublicChurchRegistration />
        </PublicRoute>
      )} />
      <Route path="/member-registration" component={() => (
        <PublicRoute>
          <PublicMemberRegistration />
        </PublicRoute>
      )} />
      <Route component={AuthenticatedApp} />
    </Switch>
  );
}

function AuthenticatedApp() {
  const { isAuthenticated, isLoading, user } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-churpay-purple"></div>
      </div>
    );
  }

  return (
    <Switch>
      {!isAuthenticated ? (
        <Route path="/" component={Landing} />
      ) : (
        <>
          <Route path="/" component={Home} />
          
          {/* Role-based routing */}
          {(user as any)?.role === 'superadmin' && (
            <Route path="/admin" component={SuperAdmin} />
          )}
          
          {((user as any)?.role === 'church_admin' || (user as any)?.role === 'church_staff') && (
            <Route path="/church" component={ChurchDashboard} />
          )}
          
          {(user as any)?.role === 'member' && (
            <Route path="/member" component={MemberDashboard} />
          )}
        </>
      )}
      
      <Route component={NotFound} />
    </Switch>
  );
}

function Router() {
  return <PublicRoutes />;
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
