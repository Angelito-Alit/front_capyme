import api from './axios';

export const inversionesService = {
  getAll: async (params = {}) => (await api.get('/inversiones', { params })).data,
  getPendientes: async () => (await api.get('/inversiones/pendientes')).data,
  getByCampana: async (campanaId) => (await api.get(`/inversiones/campana/${campanaId}`)).data,
  getById: async (id) => (await api.get(`/inversiones/${id}`)).data,
  create: async (data) => (await api.post('/inversiones', data)).data,
  update: async (id, data) => (await api.put(`/inversiones/${id}`, data)).data,
  confirmar: async (id) => (await api.patch(`/inversiones/${id}/confirmar`)).data,
  rechazar: async (id) => (await api.patch(`/inversiones/${id}/rechazar`)).data,
  toggleActivo: async (id) => (await api.patch(`/inversiones/${id}/toggle-activo`)).data,
};