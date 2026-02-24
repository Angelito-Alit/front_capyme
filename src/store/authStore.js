import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,

      // ── Modal de usuario inactivo ────────────────────────────────────────
      inactivoModal: false,
      inactivoContacto: null, // { email, whatsapp }

      mostrarInactivoModal: (contacto = null) => {
        set({ inactivoModal: true, inactivoContacto: contacto });
      },
      cerrarInactivoModal: () => {
        set({ inactivoModal: false, inactivoContacto: null });
      },
      // ─────────────────────────────────────────────────────────────────────

      login: (userData, token) => {
        set({
          user: userData,
          token: token,
          isAuthenticated: true,
          inactivoModal: false,
          inactivoContacto: null,
        });
      },

      logout: () => {
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          inactivoModal: false,
          inactivoContacto: null,
        });
        localStorage.removeItem('token');
      },

      updateUser: (userData) => {
        set({ user: userData });
      },

      getToken: () => get().token,
      isAdmin: () => get().user?.rol === 'admin',
      isColaborador: () => get().user?.rol === 'colaborador',
      isCliente: () => get().user?.rol === 'cliente',
      hasRole: (roles) => roles.includes(get().user?.rol),
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
        // NO persistir el modal: si recargan, no queremos mostrarlo de nuevo
      }),
    }
  )
);