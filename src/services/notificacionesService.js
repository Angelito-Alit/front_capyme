import api from './axios';

export const notificacionesService = {
  getAll: async () => (await api.get('/notificaciones')).data,
  marcarLeida: async (id) => (await api.patch(`/notificaciones/${id}/leer`)).data,
  marcarTodas: async () => (await api.patch('/notificaciones/leer-todas')).data,
  marcarAvisoLeido: async (avisoId) => (await api.post(`/notificaciones/avisos/${avisoId}/leer`)).data,
  marcarAvisosLeidos: async (avisoIds) => (await api.post('/notificaciones/avisos/leer-varios', { avisoIds })).data,
};