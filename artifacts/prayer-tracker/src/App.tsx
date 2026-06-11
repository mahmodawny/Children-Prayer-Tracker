import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/theme-provider";
import { AppLayout } from "@/components/layout";
import NotFound from "@/pages/not-found";

// Pages
import Login from "@/pages/login";
import AdminLogin from "@/pages/admin/login";
import Home from "@/pages/home";
import Dashboard from "@/pages/dashboard";
import History from "@/pages/history";
import AdminDashboard from "@/pages/admin/index";
import AdminChildren from "@/pages/admin/children/index";
import AdminChildDetail from "@/pages/admin/children/[id]";
import AdminLeaderboard from "@/pages/admin/leaderboard";

const queryClient = new QueryClient();

function Router() {
  return (
    <AppLayout>
      <Switch>
        {/* Auth routes */}
        <Route path="/login" component={Login} />
        <Route path="/admin/login" component={AdminLogin} />
        
        {/* Child routes */}
        <Route path="/" component={Home} />
        <Route path="/dashboard" component={Dashboard} />
        <Route path="/history" component={History} />
        
        {/* Admin routes */}
        <Route path="/admin" component={AdminDashboard} />
        <Route path="/admin/children" component={AdminChildren} />
        <Route path="/admin/children/:id" component={AdminChildDetail} />
        <Route path="/admin/leaderboard" component={AdminLeaderboard} />
        
        <Route component={NotFound} />
      </Switch>
    </AppLayout>
  );
}

function App() {
  return (
    <ThemeProvider attribute="class" defaultTheme="light">
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
            <Router />
          </WouterRouter>
          <Toaster />
        </TooltipProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}

export default App;