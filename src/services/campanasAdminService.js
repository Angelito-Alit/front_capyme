import api from './axios'

export const campanasAdminService = {
  getAll: async (params = {}) => (await api.get('/admin/campanas', { params })).data,
  getById: async (id) => (await api.get(`/admin/campanas/${id}`)).data,
  create: async (data) => (await api.post('/admin/campanas', data)).data,
  update: async (id, data) => (await api.put(`/admin/campanas/${id}`, data)).data,
  toggleActivo: async (id) => (await api.patch(`/admin/campanas/${id}/toggle-activo`)).data,
  getNegocios: async () => (await api.get('/admin/campanas/negocios/opciones')).data
}