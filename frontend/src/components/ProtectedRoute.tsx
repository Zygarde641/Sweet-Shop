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
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/c49dae96-4ee7-4b7f-a49b-2dc2505269f5',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'ProtectedRoute.tsx:10',message:'ProtectedRoute check',data:{hasToken:!!token,hasUser:!!user,userRole:user?.role,requireAdmin},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'H'})}).catch(()=>{});
    // #endregion

    if (!token || !user) {
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/c49dae96-4ee7-4b7f-a49b-2dc2505269f5',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'ProtectedRoute.tsx:15',message:'ProtectedRoute redirecting to login',data:{reason:'noTokenOrUser'},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'H'})}).catch(()=>{});
      // #endregion
      return <Navigate to="/login" replace />;
    }

    if (requireAdmin && user.role !== 'admin') {
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/c49dae96-4ee7-4b7f-a49b-2dc2505269f5',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'ProtectedRoute.tsx:19',message:'ProtectedRoute redirecting to home',data:{reason:'notAdmin'},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'H'})}).catch(()=>{});
      // #endregion
      return <Navigate to="/" replace />;
    }

    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/c49dae96-4ee7-4b7f-a49b-2dc2505269f5',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'ProtectedRoute.tsx:22',message:'ProtectedRoute allowing access',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'E'})}).catch(()=>{});
    // #endregion
    return <>{children}</>;
  } catch (error) {
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/c49dae96-4ee7-4b7f-a49b-2dc2505269f5',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'ProtectedRoute.tsx:24',message:'ProtectedRoute error caught',data:{error:error instanceof Error?error.message:'unknown'},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
    // #endregion
    console.error('ProtectedRoute error:', error);
    return <Navigate to="/login" replace />;
  }
};

export default ProtectedRoute;
