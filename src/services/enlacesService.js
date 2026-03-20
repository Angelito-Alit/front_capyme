import api from './axios';

export const enlacesService = {
  getAll:        async (params = {}) => (await api.get('/enlaces', { params })).data,
  getById:       async (id)          => (await api.get(`/enlaces/${id}`)).data,
  create:        async (data)        => (await api.post('/enlaces', data)).data,
  update:        async (id, data)    => (await api.put(`/enlaces/${id}`, data)).data,
  toggleActivo:  async (id)          => (await api.patch(`/enlaces/${id}/toggle-activo`)).data,

  // Solicitar acceso — devuelve { pagoInfo } si tiene costo, o acceso directo si es gratis
  solicitarAcceso: async (id) => (await api.post(`/enlaces/${id}/solicitar-acceso`)).data,

  // Confirmar por referencia (back_url de MP — respaldo al webhook)
  confirmarPorReferencia: async (referencia) =>
    (await api.post('/enlaces/pagos/confirmar-por-referencia', { referencia })).data,

  getAccesos: async (id) => (await api.get(`/enlaces/${id}/accesos`)).data,
};