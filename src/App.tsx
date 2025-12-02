import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { TransitionGroup, CSSTransition } from "react-transition-group";
import { ThemeProvider } from "next-themes";
import Landing from "./pages/Landing";
import Auth from "./pages/Auth";
import Signup from "./pages/Signup";
import Profile from "./pages/Profile";
import SettingsPage from "./pages/Settings";
import Terms from "./pages/Terms";
import Dashboard from "./pages/Dashboard";
import NotFound from "./pages/NotFound";
import ResetPassword from "./pages/ResetPassword";
import AdminAuth from "./pages/admin/AdminAuth";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminProtectedRoute from "./components/AdminProtectedRoute";
import Crm from "./pages/admin/Crm";
import Billing from "./pages/admin/Billing";
import Sales from "./pages/admin/Sales";
import Conversion from "./pages/admin/Conversion";
import { ProtectedRoute } from "./components/ProtectedRoute";

const queryClient = new QueryClient();

const AnimatedRoutes = () => {
  const location = useLocation();
  return (
    <TransitionGroup>
      <CSSTransition key={location.pathname} classNames="page-transition" timeout={300}>
        <Routes location={location}>
          <Route path="/" element={<Landing />} />
          <Route path="/admin" element={<AdminAuth />} />
          <Route path="/admin/dashboard" element={<AdminProtectedRoute><AdminDashboard /></AdminProtectedRoute>} />
          <Route path="/admin/crm" element={<AdminProtectedRoute><Crm /></AdminProtectedRoute>} />
          <Route path="/admin/faturamento" element={<AdminProtectedRoute><Billing /></AdminProtectedRoute>} />
          <Route path="/admin/vendas" element={<AdminProtectedRoute><Sales /></AdminProtectedRoute>} />
          <Route path="/admin/conversao" element={<AdminProtectedRoute><Conversion /></AdminProtectedRoute>} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/login" element={<Auth />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </CSSTransition>
    </TransitionGroup>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter basename={(import.meta.env.BASE_URL || '/').replace(/\/$/, '')}>
          <AnimatedRoutes />
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
