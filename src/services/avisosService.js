import api from './axios';

export const avisosService = {
  getAll: async (params = {}) => (await api.get('/avisos', { params })).data,
  getById: async (id) => (await api.get(`/avisos/${id}`)).data,
  create: async (data) => (await api.post('/avisos', data)).data,
  update: async (id, data) => (await api.put(`/avisos/${id}`, data)).data,
  toggleActivo: async (id) => (await api.patch(`/avisos/${id}/toggle-activo`)).data,
  delete: async (id) => (await api.delete(`/avisos/${id}`)).data,
};