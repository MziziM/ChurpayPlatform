import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Landing from "@/pages/landing";
import PublicChurchRegistration from "@/pages/public-church-registration";
import PublicMemberRegistration from "@/pages/public-member-registration";
import MemberDashboard from "@/pages/member-dashboard";
import MemberDashboardDark from "@/pages/MemberDashboardDark";
import WalletDashboard from "@/pages/WalletDashboard";
import SignIn from "@/pages/sign-in";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Landing} />
      <Route path="/church-registration" component={PublicChurchRegistration} />
      <Route path="/member-registration" component={PublicMemberRegistration} />
      <Route path="/member-dashboard" component={MemberDashboardDark} />
      <Route path="/member" component={MemberDashboardDark} />
      <Route path="/wallet" component={WalletDashboard} />
      <Route path="/sign-in" component={SignIn} />
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
