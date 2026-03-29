import { useEffect, useRef } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import api from '../services/axios';

const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { isAuthenticated, user } = useAuthStore();
  const location = useLocation();
  const lastCheckedPath = useRef(null);

  useEffect(() => {
    if (!isAuthenticated) return;
    if (lastCheckedPath.current === location.pathname) return;
    lastCheckedPath.current = location.pathname;
    api.get('/usuarios/perfil').catch(() => {
    });
  }, [location.pathname, isAuthenticated]);

  if (!isAuthenticated) {
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(user?.rol)) {
    const fallback = user?.rol === 'cliente' ? '/dashboard' : '/admin';
    return <Navigate to={fallback} replace />;
  }

  return children;
};

export default ProtectedRoute;