import api from './axios';

export const dashboardService = {
  getEstadisticas: async () => {
    const response = await api.get('/dashboard/estadisticas');
    return response.data;
  },

  getNegociosPorCategoria: async () => {
    const response = await api.get('/dashboard/negocios-categoria');
    return response.data;
  },

  getPostulacionesPorEstado: async () => {
    const response = await api.get('/dashboard/postulaciones-estado');
    return response.data;
  },

  getPostulacionesPorPrograma: async () => {
    const response = await api.get('/dashboard/postulaciones-programa');
    return response.data;
  },

  getUltimosNegocios: async (limit = 5) => {
    const response = await api.get('/dashboard/ultimos-negocios', {
      params: { limit }
    });
    return response.data;
  },

  getUltimasPostulaciones: async (limit = 5) => {
    const response = await api.get('/dashboard/ultimas-postulaciones', {
      params: { limit }
    });
    return response.data;
  },

  getEstadisticasCliente: async () => {
    const response = await api.get('/dashboard/cliente/estadisticas');
    return response.data;
  },

  getCursosMasInscritos: async (limit = 5) => {
    const response = await api.get('/dashboard/cursos-inscritos', {
      params: { limit }
    });
    return response.data;
  }
};