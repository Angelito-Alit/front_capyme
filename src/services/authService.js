import api from './axios';

export const authService = {
  login: async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    return response.data;
  },

  register: async (userData) => {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },

  getPerfil: async () => {
    const response = await api.get('/usuarios/perfil');
    return response.data;
  },

  updatePerfil: async (userData) => {
    const response = await api.put('/usuarios/perfil', userData);
    return response.data;
  }
};