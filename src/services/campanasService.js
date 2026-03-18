import api from './axios';

export const campanasService = {
  getAll: async (params = {}) => (await api.get('/campanas', { params })).data,
  getPublicas: async (params = {}) => (await api.get('/campanas/publicas', { params })).data,
  getMias: async (params = {}) => (await api.get('/campanas/mias', { params })).data,
  getById: async (id) => (await api.get(`/campanas/${id}`)).data,
  create: async (data) => (await api.post('/campanas', data)).data,
  update: async (id, data) => (await api.put(`/campanas/${id}`, data)).data,
  updateEstado: async (id, estado) => (await api.put(`/campanas/${id}/estado`, { estado })).data,
  toggleActivo: async (id) => (await api.patch(`/campanas/${id}/toggle-activo`)).data,
  publicarActualizacion: async (campanaId, data) => (await api.post(`/campanas/${campanaId}/actualizaciones`, data)).data,
  getActualizaciones: async (campanaId) => (await api.get(`/campanas/${campanaId}/actualizaciones`)).data,
};