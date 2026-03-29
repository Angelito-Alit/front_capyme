import api from './axios';

export const inversionesService = {
  getAll: (params) => api.get('/inversiones', { params }),
  getPendientes: () => api.get('/inversiones/pendientes'),
  getMias: (params) => api.get('/inversiones/mis-inversiones', { params }),
  getByCampana: (campanaId) => api.get(`/inversiones/campana/${campanaId}`),
  getById: (id) => api.get(`/inversiones/${id}`),
  create: (data) => api.post('/inversiones', data),
  confirmarPorReferencia: (referencia) => api.post('/inversiones/confirmar-backurl', { referencia }),
  update: (id, data) => api.put(`/inversiones/${id}`, data),
  confirmar: (id) => api.put(`/inversiones/${id}/confirmar`),
  rechazar: (id) => api.put(`/inversiones/${id}/rechazar`),
  toggleActivo: (id) => api.put(`/inversiones/${id}/toggle-activo`),
  marcarRecompensaEnviada: (id) => api.put(`/inversiones/${id}/recompensa-enviada`),
  marcarRecompensaRecibida: (id) => api.put(`/inversiones/${id}/recompensa-recibida`),
};