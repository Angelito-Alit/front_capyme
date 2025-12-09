import api from './axios';

export const preguntasService = {
  getAll: async (params = {}) => {
    const response = await api.get('/preguntas', { params });
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/preguntas/${id}`);
    return response.data;
  },

  create: async (preguntaData) => {
    const response = await api.post('/preguntas', preguntaData);
    return response.data;
  },

  update: async (id, preguntaData) => {
    const response = await api.put(`/preguntas/${id}`, preguntaData);
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/preguntas/${id}`);
    return response.data;
  }
};