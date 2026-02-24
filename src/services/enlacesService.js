import api from './axios';

export const enlacesService = {
  getAll: async (params = {}) => (await api.get('/enlaces', { params })).data,
  getById: async (id) => (await api.get(`/enlaces/${id}`)).data,
  create: async (data) => (await api.post('/enlaces', data)).data,
  update: async (id, data) => (await api.put(`/enlaces/${id}`, data)).data,
  toggleActivo: async (id) => (await api.patch(`/enlaces/${id}/toggle-activo`)).data,
  solicitarAcceso: async (id) => (await api.post(`/enlaces/${id}/solicitar-acceso`)).data,
  getMiPago: async (id) => (await api.get(`/enlaces/${id}/mi-pago`)).data,
  getAccesos: async (id) => (await api.get(`/enlaces/${id}/accesos`)).data,
  getPagosPendientes: async () => (await api.get('/enlaces/pagos-pendientes')).data,
  confirmarPago: async (pagoId) => (await api.patch(`/enlaces/pagos/${pagoId}/confirmar`)).data,
  declinarPago: async (pagoId) => (await api.patch(`/enlaces/pagos/${pagoId}/declinar`)).data,
};