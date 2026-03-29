import api from './axios';

export const inversionesService = {
  getAll: async (params = {}) => (await api.get('/inversiones', { params })).data,
  getMias: async (params = {}) => (await api.get('/inversiones/mias', { params })).data,
  getPendientes: async () => (await api.get('/inversiones/pendientes')).data,
  getByCampana: async (campanaId) => (await api.get(`/inversiones/campana/${campanaId}`)).data,
  getById: async (id) => (await api.get(`/inversiones/${id}`)).data,
  create: async (data) => (await api.post('/inversiones', data)).data,
  update: async (id, data) => (await api.put(`/inversiones/${id}`, data)).data,
  confirmar: async (id) => (await api.patch(`/inversiones/${id}/confirmar`)).data,
  rechazar: async (id) => (await api.patch(`/inversiones/${id}/rechazar`)).data,
  toggleActivo: async (id) => (await api.patch(`/inversiones/${id}/toggle-activo`)).data,
  confirmarPorReferencia: async (referencia) =>
    (await api.post('/inversiones/confirmar-por-referencia', { referencia })).data,
  marcarRecompensaEnviada: async (id) => (await api.put(`/inversiones/${id}/recompensa-enviada`)).data,
  marcarRecompensaRecibida: async (id) => (await api.put(`/inversiones/${id}/recompensa-recibida`)).data,
};