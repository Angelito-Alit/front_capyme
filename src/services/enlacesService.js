import api from './axios';

export const enlacesService = {
  getAll: async (params = {}) => (await api.get('/enlaces', { params })).data,
  getById: async (id) => (await api.get(`/enlaces/${id}`)).data,
  create: async (data) => (await api.post('/enlaces', data)).data,
  update: async (id, data) => (await api.put(`/enlaces/${id}`, data)).data,
  toggleActivo: async (id) => (await api.patch(`/enlaces/${id}/toggle-activo`)).data,
};