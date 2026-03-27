import { Navigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';

const AdminRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, role, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!user || role !== 'ADMIN') return <Navigate to="/auth/login" replace />;

  return <>{children}</>;
};

export default AdminRoute;
