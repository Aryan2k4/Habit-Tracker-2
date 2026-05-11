import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import { HabitProvider } from "@/context/HabitContext";

import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();


// ---------- Shared Loading Screen ----------
function FullPageLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-hero">
      <div className="flex flex-col items-center gap-3 text-primary">
        <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></div>
        <span className="animate-pulse">Preparing your space...</span>
      </div>
    </div>
  );
}


// ---------- Protect logged-in pages ----------
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();

  // Wait until Supabase session fully restored
  if (isLoading) return <FullPageLoader />;

  // Not logged in → go login
  if (!user) return <Navigate to="/login" replace />;

  // Logged in → allow
  return <>{children}</>;
}


// ---------- Protect public pages ----------
function PublicRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();

  // Wait for auth
  if (isLoading) return <FullPageLoader />;

  // Already logged in → go dashboard
  if (user) return <Navigate to="/dashboard" replace />;

  return <>{children}</>;
}


// ---------- App Routes ----------
function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<PublicRoute><Landing /></PublicRoute>} />
      <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
      <Route path="/signup" element={<PublicRoute><Signup /></PublicRoute>} />
      <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}


// ---------- Main App ----------
export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />

        <BrowserRouter>
          <AuthProvider>
            <HabitProvider>
              <AppRoutes />
            </HabitProvider>
          </AuthProvider>
        </BrowserRouter>

      </TooltipProvider>
    </QueryClientProvider>
  );
}
