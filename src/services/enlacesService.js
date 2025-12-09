import api from './axios';

export const enlacesService = {
  getAll: async (params = {}) => {
    const response = await api.get('/enlaces', { params });
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/enlaces/${id}`);
    return response.data;
  },

  create: async (enlaceData) => {
    const response = await api.post('/enlaces', enlaceData);
    return response.data;
  },

  update: async (id, enlaceData) => {
    const response = await api.put(`/enlaces/${id}`, enlaceData);
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/enlaces/${id}`);
    return response.data;
  }
};