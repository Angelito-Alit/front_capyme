import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { authService } from '../services/authService';
import { toast } from 'react-hot-toast';

export const useAuth = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  
  const { login: setAuth, logout: clearAuth, user, isAuthenticated } = useAuthStore();

  const login = async (email, password) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await authService.login(email, password);
      
      if (response.success) {
        setAuth(response.data.usuario, response.data.token);
        toast.success('¡Bienvenido!');
        
        // Redirigir según rol
        if (response.data.usuario.rol === 'admin' || response.data.usuario.rol === 'colaborador') {
          navigate('/dashboard');
        } else {
          navigate('/cliente/dashboard');
        }
        
        return true;
      }
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Error al iniciar sesión';
      setError(errorMsg);
      toast.error(errorMsg);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await authService.register(userData);
      
      if (response.success) {
        setAuth(response.data.usuario, response.data.token);
        toast.success('¡Registro exitoso!');
        navigate('/cliente/dashboard');
        return true;
      }
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Error al registrarse';
      setError(errorMsg);
      toast.error(errorMsg);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    clearAuth();
    toast.success('Sesión cerrada');
    navigate('/login');
  };

  return {
    login,
    register,
    logout,
    loading,
    error,
    user,
    isAuthenticated
  };
};