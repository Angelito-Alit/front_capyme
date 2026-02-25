import api from './axios';

export const dashboardService = {
  getEstadisticas: async () => (await api.get('/dashboard/estadisticas')).data,
  getNegociosPorCategoria: async () => (await api.get('/dashboard/negocios-categoria')).data,
  getPostulacionesPorEstado: async () => (await api.get('/dashboard/postulaciones-estado')).data,
  getPostulacionesPorPrograma: async () => (await api.get('/dashboard/postulaciones-programa')).data,
  getUltimosNegocios: async (limit = 5) => (await api.get('/dashboard/ultimos-negocios', { params: { limit } })).data,
  getUltimasPostulaciones: async (limit = 5) => (await api.get('/dashboard/ultimas-postulaciones', { params: { limit } })).data,
  getEstadisticasCliente: async () => (await api.get('/dashboard/cliente/estadisticas')).data,
  getCursosMasInscritos: async (limit = 5) => (await api.get('/dashboard/cursos-inscritos', { params: { limit } })).data,

  getPostulacionesPorMes: async () => (await api.get('/dashboard/postulaciones-mes')).data,
  getNegociosPorEstado: async () => (await api.get('/dashboard/negocios-estado')).data,
  getInscripcionesPorCurso: async () => (await api.get('/dashboard/inscripciones-cursos')).data,
  getUsuariosPorRol: async () => (await api.get('/dashboard/usuarios-rol')).data,
  getFinanciamientoPorEstado: async () => (await api.get('/dashboard/financiamiento-estado')).data,
};