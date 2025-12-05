import api from './axios';

export const programasService = {
  getAll: async (params = {}) => {
    const response = await api.get('/programas', { params });
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/programas/${id}`);
    return response.data;
  },

  getPreguntas: async (id) => {
    const response = await api.get(`/programas/${id}/preguntas`);
    return response.data;
  },

  create: async (programaData) => {
    const response = await api.post('/programas', programaData);
    return response.data;
  },

  update: async (id, programaData) => {
    const response = await api.put(`/programas/${id}`, programaData);
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/programas/${id}`);
    return response.data;
  },

  asignarPregunta: async (programaId, preguntaData) => {
    const response = await api.post(`/programas/${programaId}/preguntas`, preguntaData);
    return response.data;
  },

  desasignarPregunta: async (programaId, preguntaId) => {
    const response = await api.delete(`/programas/${programaId}/preguntas/${preguntaId}`);
    return response.data;
  }
};