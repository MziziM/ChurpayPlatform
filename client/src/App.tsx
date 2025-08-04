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
import MemberDashboard from "@/pages/MemberDashboard";
import ProfessionalMemberDashboard from "@/pages/ProfessionalMemberDashboard";
import ProfessionalChurchDashboard from "@/pages/ProfessionalChurchDashboard";
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
      <Route path="/public-church-registration" component={PublicChurchRegistration} />
      <Route path="/public-member-registration" component={PublicMemberRegistration} />
      <Route path="/register" component={PublicMemberRegistration} />
      <Route path="/member-dashboard" component={ProfessionalMemberDashboard} />
      <Route path="/member" component={ProfessionalMemberDashboard} />
      <Route path="/member-old" component={MemberDashboard} />
      <Route path="/church-dashboard" component={ProfessionalChurchDashboard} />
      <Route path="/church" component={ProfessionalChurchDashboard} />
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
