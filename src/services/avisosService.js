import api from './axios';

export const avisosService = {
  getAll: async (params = {}) => {
    const response = await api.get('/avisos', { params });
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/avisos/${id}`);
    return response.data;
  },

  create: async (avisoData) => {
    const response = await api.post('/avisos', avisoData);
    return response.data;
  },

  update: async (id, avisoData) => {
    const response = await api.put(`/avisos/${id}`, avisoData);
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/avisos/${id}`);
    return response.data;
  }
};