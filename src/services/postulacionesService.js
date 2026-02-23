import api from './axios';

export const postulacionesService = {
  getAll: async (params = {}) => {
    const response = await api.get('/postulaciones', { params });
    return response.data;
  },

  getMisPostulaciones: async () => {
    const response = await api.get('/postulaciones/mis-postulaciones');
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/postulaciones/${id}`);
    return response.data;
  },

  create: async (data) => {
    const response = await api.post('/postulaciones', data);
    return response.data;
  },

  update: async (id, data) => {
    const response = await api.put(`/postulaciones/${id}`, data);
    return response.data;
  },

  updateEstado: async (id, estado, notasAdmin = null) => {
    const response = await api.put(`/postulaciones/${id}/estado`, { estado, notasAdmin });
    return response.data;
  },

  toggleActivo: async (id) => {
    const response = await api.patch(`/postulaciones/${id}/toggle-activo`);
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/postulaciones/${id}`);
    return response.data;
  }
};