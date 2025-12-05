import api from './axios';

export const cursosService = {
  getAll: async (params = {}) => {
    const response = await api.get('/cursos', { params });
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/cursos/${id}`);
    return response.data;
  },

  create: async (cursoData) => {
    const response = await api.post('/cursos', cursoData);
    return response.data;
  },

  update: async (id, cursoData) => {
    const response = await api.put(`/cursos/${id}`, cursoData);
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/cursos/${id}`);
    return response.data;
  },

  inscribir: async (id, negocioId = null) => {
    const response = await api.post(`/cursos/${id}/inscribir`, { negocioId });
    return response.data;
  },

  getInscritos: async (id) => {
    const response = await api.get(`/cursos/${id}/inscritos`);
    return response.data;
  }
};