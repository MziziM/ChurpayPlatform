import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useLocation } from "wouter";

interface User {
  id: string;
  email: string;
  role: string;
  [key: string]: any;
}

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: string[];
  redirectTo?: string;
}

export function ProtectedRoute({ 
  children, 
  requiredRole = [], 
  redirectTo = "/sign-in" 
}: ProtectedRouteProps) {
  const { user, isLoading, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        // Not authenticated, redirect to sign-in
        setLocation(redirectTo);
        return;
      }

      if (requiredRole.length > 0 && user) {
        // Check if user has required role
        const typedUser = user as User;
        const hasRequiredRole = requiredRole.includes(typedUser.role);
        if (!hasRequiredRole) {
          // User doesn't have required role, redirect to appropriate dashboard
          switch (typedUser.role) {
            case 'superadmin':
              setLocation('/super-admin');
              break;
            case 'church_admin':
            case 'church_staff':
              setLocation('/church');
              break;
            case 'member':
              setLocation('/member');
              break;
            default:
              setLocation('/sign-in');
              break;
          }
          return;
        }
      }
    }
  }, [user, isLoading, isAuthenticated, requiredRole, redirectTo, setLocation]);

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Checking authentication...</p>
        </div>
      </div>
    );
  }

  // Don't render children if not authenticated or wrong role
  if (!isAuthenticated || (requiredRole.length > 0 && user && !requiredRole.includes((user as User).role))) {
    return null;
  }

  return <>{children}</>;
}