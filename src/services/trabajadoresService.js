import api from './axios';

export const trabajadoresService = {
  getAll: async (params = {}) => {
    const response = await api.get('/trabajadores', { params });
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/trabajadores/${id}`);
    return response.data;
  },

  create: async (trabajadorData) => {
    const response = await api.post('/trabajadores', trabajadorData);
    return response.data;
  },

  update: async (id, trabajadorData) => {
    const response = await api.put(`/trabajadores/${id}`, trabajadorData);
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/trabajadores/${id}`);
    return response.data;
  }
};