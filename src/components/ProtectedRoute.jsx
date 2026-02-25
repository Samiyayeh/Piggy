import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <div>Loading session...</div>; // Or a spinner
  }

  if (!user) {
    // Redirect to login if not authenticated
    return <Navigate to="/" replace />;
  }

  return children;
}