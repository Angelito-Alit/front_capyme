import api from './axios';

export const cursosService = {
  getAll: async (params = {}) => (await api.get('/cursos', { params })).data,
  getById: async (id) => (await api.get(`/cursos/${id}`)).data,
  create: async (data) => (await api.post('/cursos', data)).data,
  update: async (id, data) => (await api.put(`/cursos/${id}`, data)).data,
  toggleActivo: async (id) => (await api.patch(`/cursos/${id}/toggle-activo`)).data,
  getInscritos: async (id) => (await api.get(`/cursos/${id}/inscritos`)).data,
  inscribir: async (id, negocioId = null) => (await api.post(`/cursos/${id}/inscribir`, { negocioId })).data,
  getPagosPendientes: async () => (await api.get('/cursos/pagos-pendientes')).data,
  confirmarPago: async (pagoId) => (await api.patch(`/cursos/pagos/${pagoId}/confirmar`)).data,
};