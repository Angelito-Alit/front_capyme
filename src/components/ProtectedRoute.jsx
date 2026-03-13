import { useEffect, useRef } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import api from '../services/axios';

/**
 * ProtectedRoute
 *
 * Props:
 *  - children      : el componente a renderizar si pasa las guards
 *  - allowedRoles  : string[] de roles permitidos, ej. ['admin', 'colaborador']
 *                    Si está vacío, cualquier usuario autenticado puede acceder.
 *
 * Lógica de redirección:
 *  1. No autenticado           → /login
 *  2. Autenticado, rol no permitido:
 *       - rol === 'cliente'    → /dashboard
 *       - rol === 'admin'
 *         || 'colaborador'     → /admin
 *  3. Autenticado, rol OK      → renderiza children
 *
 * Efecto secundario:
 *  Cada vez que el usuario navega a una ruta protegida distinta, se hace
 *  una llamada silenciosa a GET /usuarios/perfil para verificar que la
 *  cuenta sigue activa. El interceptor de axios maneja el 401 resultante.
 */
const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { isAuthenticated, user } = useAuthStore();
  const location = useLocation();
  const lastCheckedPath = useRef(null);

  useEffect(() => {
    if (!isAuthenticated) return;
    // Evitar re-verificar la misma ruta en re-renders
    if (lastCheckedPath.current === location.pathname) return;
    lastCheckedPath.current = location.pathname;

    // Llamada silenciosa; el interceptor de axios maneja el 401 / inactivo
    api.get('/usuarios/perfil').catch(() => {
      // Errores de red (offline, timeout) no deben cerrar la sesión
    });
  }, [location.pathname, isAuthenticated]);

  // 1. Sin autenticar → login
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 2. Rol no permitido → redirigir según rol
  if (allowedRoles.length > 0 && !allowedRoles.includes(user?.rol)) {
    const fallback = user?.rol === 'cliente' ? '/dashboard' : '/admin';
    return <Navigate to={fallback} replace />;
  }

  // 3. Todo OK
  return children;
};

export default ProtectedRoute;