import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { Landing } from "./pages/Landing";
import { Assessment } from "./pages/Assessment";
import { LevelAssessment } from './pages/LevelAssessment';
import { Results } from "./pages/Results";
import { Dashboard } from "./pages/Dashboard";
import { CareerMap } from './pages/CareerMap';
import { Profile } from './pages/Profile';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Layout } from './components/Layout';
import NotFound from "./pages/NotFound";
import { DebugProvider } from "@/context/DebugContext";

const queryClient = new QueryClient();

const AppRoutes = () => {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route element={<Layout />}>
          <Route path="/" element={<Landing />} />
          <Route path="/assessment" element={
            <ProtectedRoute>
              <Assessment />
            </ProtectedRoute>
          } />
          <Route path="/results" element={
            <ProtectedRoute>
              <Results />
            </ProtectedRoute>
          } />
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } />
          <Route path="/level-assessment/:mapId" element={
            <ProtectedRoute>
              <LevelAssessment />
            </ProtectedRoute>
          } />
          <Route path="/profile" element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          } />
          <Route path="/career-map/:mapId" element={
            <ProtectedRoute>
              <CareerMap />
            </ProtectedRoute>
          } />
        </Route>
        {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </AnimatePresence>
  );
};

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <DebugProvider>
          <BrowserRouter>
            <AppRoutes />
          </BrowserRouter>
        </DebugProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
