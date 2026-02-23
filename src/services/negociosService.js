import api from './axios';

export const negociosService = {
  getAll: async (params = {}) => {
    const response = await api.get('/negocios', { params });
    return response.data;
  },

  getMisNegocios: async () => {
    const response = await api.get('/negocios/mis-negocios');
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/negocios/${id}`);
    return response.data;
  },

  create: async (negocioData) => {
    const response = await api.post('/negocios', negocioData);
    return response.data;
  },

  update: async (id, negocioData) => {
    const response = await api.put(`/negocios/${id}`, negocioData);
    return response.data;
  },

  toggleActivo: async (id) => {
  const response = await api.patch(`/negocios/${id}/toggle-activo`);
  return response.data;},

};