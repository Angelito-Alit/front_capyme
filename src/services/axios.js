import axios from 'axios';
import { useAuthStore } from '../store/authStore';

const api = axios.create({
  // Esto asegura que siempre termine en /api
  baseURL: (import.meta.env.VITE_API_URL?.endsWith('/api') 
            ? import.meta.env.VITE_API_URL 
            : `${import.meta.env.VITE_API_URL}/api`),
  headers: {
    'Content-Type': 'application/json',
  },
});

// ── Request: adjuntar token ────────────────────────────────────────────────
api.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ── Response: manejar 401 con logout seguro ────────────────────────────────
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      const message = error.response?.data?.message || '';

      // Detectar cuenta inactiva (ver auth.middleware.js del backend)
      const esInactivo =
        message.toLowerCase().includes('inactivo') ||
        message.toLowerCase().includes('no válido o inactivo');

      if (esInactivo) {
        // Intentar obtener datos de contacto para el modal de inactividad
        let contacto = null;
        try {
          const resp = await axios.get(
            `${import.meta.env.VITE_API_URL || 'http://localhost:3000/api'}/contacto`
          );
          if (resp.data?.success && resp.data?.data) {
            contacto = {
              email:    resp.data.data.email    || null,
              whatsapp: resp.data.data.whatsapp || null,
            };
          }
        } catch {
          // Si falla, el modal se muestra igual, sin datos de contacto
        }

        // Mostrar el modal (el modal llama a logout al cerrarse)
        useAuthStore.getState().mostrarInactivoModal(contacto);
      } else {
        // Token expirado u otro 401 genérico → logout inmediato
        useAuthStore.getState().logout();

        // Limpiar cualquier resto en localStorage por las dudas
        localStorage.removeItem('token');
        localStorage.removeItem('auth-storage'); // nombre del persist de Zustand

        // Redirigir de forma limpia (evita estado de React Router corrupto)
        window.location.href = '/login';
      }
    }

    return Promise.reject(error);
  }
);

export default api;