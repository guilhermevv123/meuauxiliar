import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { useRef, useEffect } from "react";
import { ThemeProvider } from "next-themes";
import Landing from "./pages/Landing";
import Auth from "./pages/Auth";
import Signup from "./pages/Signup";
import Profile from "./pages/Profile";
import SettingsPage from "./pages/Settings";
import Terms from "./pages/Terms";
import Dashboard from "./pages/Dashboard";
import Plans from "./pages/Plans";
import NotFound from "./pages/NotFound";
import ResetPassword from "./pages/ResetPassword";
import AdminAuth from "./pages/admin/AdminAuth";
import AdminDashboard from "./pages/admin/AdminDashboard";
import { AdminAbandonedCart } from "./pages/admin/AdminAbandonedCart";
import { AdminAutomations } from "./pages/admin/AdminAutomations";
import AdminProtectedRoute from "./components/AdminProtectedRoute";
import Crm from "./pages/admin/Crm";
import Sales from "./pages/admin/Sales";
import Conversion from "./pages/admin/Conversion";
import NewUsers from "./pages/admin/NewUsers";
import Feedback from "./pages/Feedback";
import FeedbackSuccess from "./pages/FeedbackSuccess";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { AIChatWidget } from "./components/ai/AIChatWidget";
import AiAssistantPage from "./pages/AiAssistantPage";
import Quiz from "./pages/Quiz";
import Quiz2 from "./pages/Quiz2";
import RewardClaimed from "./pages/RewardClaimed";

const queryClient = new QueryClient();



const AnimatedRoutes = () => {
  const location = useLocation();

  // Track PageView on route change
  useEffect(() => {
    // Generate unique Event ID for deduplication
    const eventId = `pageview_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Browser Pixel
    // @ts-expect-error - fbq is defined in index.html
    if (window.fbq) {
      // @ts-expect-error - fbq is defined in index.html
      window.fbq('track', 'PageView', {}, { eventID: eventId });
    }

    // Server-Side Event (CAPI)
    import('@/lib/meta-capi').then(({ sendCapiEvent }) => {
      sendCapiEvent({
        eventName: 'PageView',
        eventId: eventId,
        sourceUrl: window.location.href,
        userData: {
          client_user_agent: navigator.userAgent
        }
      });
    });
  }, [location]);

  return (
    <Routes location={location}>
      <Route path="/" element={<Landing />} />
      <Route path="/admin" element={<AdminAuth />} />
      <Route path="/admin/dashboard" element={<AdminProtectedRoute><AdminDashboard /></AdminProtectedRoute>} />
      <Route path="/admin/crm" element={<AdminProtectedRoute><Crm /></AdminProtectedRoute>} />
      <Route path="/admin/abandoned" element={<AdminProtectedRoute><AdminAbandonedCart /></AdminProtectedRoute>} />
      <Route path="/admin/automations" element={<AdminProtectedRoute><AdminAutomations /></AdminProtectedRoute>} />

      <Route path="/admin/vendas" element={<AdminProtectedRoute><Sales /></AdminProtectedRoute>} />
      <Route path="/admin/conversao" element={<AdminProtectedRoute><Conversion /></AdminProtectedRoute>} />
      <Route path="/admin/new-users" element={<AdminProtectedRoute><NewUsers /></AdminProtectedRoute>} />
      <Route path="/auth" element={<Auth />} />
      <Route path="/login" element={<Auth />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/terms" element={<Terms />} />
      <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
      <Route path="/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
      <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/ai" element={<ProtectedRoute><AiAssistantPage /></ProtectedRoute>} />
      <Route path="/feedback" element={<Feedback />} />
      <Route path="/feedback/success" element={<FeedbackSuccess />} />
      <Route path="/plans" element={<Plans />} />
      <Route path="/quiz" element={<Quiz />} />
      <Route path="/quiz2" element={<Quiz2 />} />
      <Route path="/reward-claimed" element={<RewardClaimed />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter basename={(import.meta.env.BASE_URL || '/').replace(/\/\/$/, '')}>
          <AnimatedRoutes />
          <AIChatWidget />
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
