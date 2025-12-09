import api from './axios';

export const contactoService = {
  get: async () => {
    const response = await api.get('/contacto');
    return response.data;
  },

  update: async (contactoData) => {
    const response = await api.put('/contacto', contactoData);
    return response.data;
  }
};