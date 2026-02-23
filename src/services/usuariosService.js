import api from './axios';

export const usuariosService = {
  getAll: async (params = {}) => {
    const response = await api.get('/usuarios', { params });
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/usuarios/${id}`);
    return response.data;
  },

  update: async (id, usuarioData) => {
    const response = await api.put(`/usuarios/${id}`, usuarioData);
    return response.data;
  },

};