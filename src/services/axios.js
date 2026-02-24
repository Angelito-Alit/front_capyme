import axios from 'axios';
import { useAuthStore } from '../store/authStore';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
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

// ── Response: manejar errores ──────────────────────────────────────────────
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      const message = error.response?.data?.message || '';

      // El backend devuelve este mensaje cuando el usuario está inactivo
      const esInactivo =
        message.toLowerCase().includes('inactivo') ||
        message.toLowerCase().includes('no válido o inactivo');

      if (esInactivo) {
        // Intentar obtener datos de contacto del primer admin para mostrar en el modal
        let contacto = null;
        try {
          // Llamamos sin token (el endpoint de contacto es público)
          const resp = await axios.get(
            `${import.meta.env.VITE_API_URL || 'http://localhost:3000/api'}/contacto`
          );
          if (resp.data?.success && resp.data?.data) {
            contacto = {
              email: resp.data.data.email || null,
              whatsapp: resp.data.data.whatsapp || null,
            };
          }
        } catch {
          // si falla, el modal se muestra igual, sin datos de contacto
        }

        // Mostrar el modal (no hace logout todavía; el modal lo dispara al cerrar)
        useAuthStore.getState().mostrarInactivoModal(contacto);
      } else {
        // Token expirado u otro 401 → logout directo
        useAuthStore.getState().logout();
        window.location.href = '/login';
      }
    }

    return Promise.reject(error);
  }
);

export default api;