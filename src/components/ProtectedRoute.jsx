import { useEffect, useRef } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import api from '../services/axios';

/**
 * ProtectedRoute
 *
 * Además de las comprobaciones habituales (autenticado + rol permitido),
 * cada vez que el usuario navega a una ruta protegida se hace una llamada
 * silenciosa a /usuarios/perfil para verificar que su cuenta sigue activa.
 *
 * Si el backend devuelve 401 con mensaje de "inactivo", el interceptor de axios
 * se encarga de mostrar el InactivoModal y hacer logout.
 */
const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { isAuthenticated, user } = useAuthStore();
  const location = useLocation();
  const lastCheckedPath = useRef(null);

  useEffect(() => {
    // Solo verificar si estamos autenticados y es una ruta nueva
    if (!isAuthenticated) return;
    if (lastCheckedPath.current === location.pathname) return;
    lastCheckedPath.current = location.pathname;

    // Llamada silenciosa; el interceptor de axios maneja el 401
    api.get('/usuarios/perfil').catch(() => {
      // Los errores de red (offline, etc.) no deben cerrar sesión
    });
  }, [location.pathname, isAuthenticated]);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(user?.rol)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
};

export default ProtectedRoute;