import { useAuth } from '@/hooks/useAuth';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { Loader2 } from 'lucide-react';

export const ProtectedRoute = () => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    // If user is not logged in, redirect them to the landing page to sign in.
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  if (!user.personality && location.pathname !== '/assessment') {
    // If user is logged in but hasn't taken the assessment, force them to the assessment page.
    return <Navigate to="/assessment" replace />;
  }

  if (user.personality && location.pathname === '/assessment') {
    // If user has taken the assessment, don't let them go back to it directly, send to dashboard.
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />; // User is authenticated and on the correct page, so render the child route.
};