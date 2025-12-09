import api from './axios';

export const categoriasService = {
  getAll: async (params = {}) => {
    const response = await api.get('/categorias', { params });
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/categorias/${id}`);
    return response.data;
  },

  create: async (categoriaData) => {
    const response = await api.post('/categorias', categoriaData);
    return response.data;
  },

  update: async (id, categoriaData) => {
    const response = await api.put(`/categorias/${id}`, categoriaData);
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/categorias/${id}`);
    return response.data;
  }
};