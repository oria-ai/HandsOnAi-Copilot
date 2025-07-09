import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AnalyticsProvider } from "./contexts/AnalyticsProvider";
import { authHelpers } from "./lib/api";
import Index from "./pages/Index";
import Login from "./pages/Login";
import RoleDashboard from "./components/RoleDashboard";
import ModuleView from "./pages/ModuleView";
import ManagerDashboard from "./pages/ManagerDashboard";
import AuthoringDashboard from "./pages/AuthoringDashboard";
import ModuleEditor from "./pages/ModuleEditor";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

// Protected Route Component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const isAuthenticated = authHelpers.isAuthenticated();
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
};

// Role-based Route Component
const RoleBasedRoute = ({ 
  children, 
  allowedRoles 
}: { 
  children: React.ReactNode;
  allowedRoles: string[];
}) => {
  const { user } = authHelpers.getAuthData();
  const hasPermission = user && allowedRoles.includes(user.role);
  
  return hasPermission ? <>{children}</> : <Navigate to="/dashboard" replace />;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AnalyticsProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Login />} />
            
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute>
                  <RoleDashboard />
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/modules/:moduleId/step/:stepId" 
              element={
                <ProtectedRoute>
                  <ModuleView />
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/manager" 
              element={
                <ProtectedRoute>
                  <RoleBasedRoute allowedRoles={['MANAGER']}>
                    <ManagerDashboard />
                  </RoleBasedRoute>
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/authoring" 
              element={
                <ProtectedRoute>
                  <RoleBasedRoute allowedRoles={['AUTHOR']}>
                    <AuthoringDashboard />
                  </RoleBasedRoute>
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/authoring/module/:moduleId" 
              element={
                <ProtectedRoute>
                  <RoleBasedRoute allowedRoles={['AUTHOR']}>
                    <ModuleEditor />
                  </RoleBasedRoute>
                </ProtectedRoute>
              } 
            />
            
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AnalyticsProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
