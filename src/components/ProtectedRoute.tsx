
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "./AuthProvider";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { user, loading, isEmailConfirmed } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#2D1F3D] via-[#1A1F2C] to-[#3D1F2C] flex items-center justify-center">
        <div className="text-white text-xl">جاري التحميل...</div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  if (user && !isEmailConfirmed && user.email) {
    // Check if we're not already on the verification page to prevent infinite redirects
    if (location.pathname !== '/verify-email') {
      console.log("Redirecting from protected route to verification page");
      return <Navigate to="/verify-email" replace />;
    }
  }

  return <>{children}</>;
};

export default ProtectedRoute;
