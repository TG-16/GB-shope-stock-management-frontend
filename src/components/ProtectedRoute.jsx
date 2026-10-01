import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * Protects routes based on authentication + role.
 * roles = array of allowed roles, e.g. ['ADMIN', 'SUPER_ADMIN']
 */
export default function ProtectedRoute({ roles }) {
  const { isAuthenticated, user, loading } = useAuth();

  if (loading) {
    return (
      <div className="spinner-page">
        <div className="spinner spinner-lg" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (roles && !roles.includes(user?.role)) {
    // Redirect unauthorized users to their home
    if (user?.role === 'STAFF') {
      return <Navigate to="/sale/new" replace />;
    }
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
}
