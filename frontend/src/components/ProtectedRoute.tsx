import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

interface ProtectedRouteProps {
  children: ReactNode;
  requireAdmin?: boolean;
}

const ProtectedRoute = ({ children, requireAdmin = false }: ProtectedRouteProps) => {
  try {
    const { user, token } = useAuthStore();

    if (!token || !user) {
      return <Navigate to="/login" replace />;
    }

    if (requireAdmin && user.role !== 'admin') {
      return <Navigate to="/" replace />;
    }

    return <>{children}</>;
  } catch (error) {
    console.error('ProtectedRoute error:', error);
    return <Navigate to="/login" replace />;
  }
};

export default ProtectedRoute;
