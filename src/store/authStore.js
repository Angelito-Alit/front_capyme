import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,

      login: (userData, token) => {
        set({
          user: userData,
          token: token,
          isAuthenticated: true
        });
      },

      logout: () => {
        set({
          user: null,
          token: null,
          isAuthenticated: false
        });
        localStorage.removeItem('token');
      },

      updateUser: (userData) => {
        set({ user: userData });
      },

      getToken: () => {
        return get().token;
      },

      isAdmin: () => {
        return get().user?.rol === 'admin';
      },

      isColaborador: () => {
        return get().user?.rol === 'colaborador';
      },

      isCliente: () => {
        return get().user?.rol === 'cliente';
      },

      hasRole: (roles) => {
        const userRole = get().user?.rol;
        return roles.includes(userRole);
      }
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated
      })
    }
  )
);