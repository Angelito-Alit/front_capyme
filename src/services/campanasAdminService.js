import axios from './axios'

export const getCampanasAdmin = async () => {
  const response = await axios.get('/api/admin/campanas')
  return response.data
}

export const createCampanaAdmin = async (data) => {
  const response = await axios.post('/api/admin/campanas', data)
  return response.data
}

export const updateCampanaAdmin = async (id, data) => {
  const response = await axios.put(`/api/admin/campanas/${id}`, data)
  return response.data
}

export const deleteCampanaAdmin = async (id) => {
  const response = await axios.delete(`/api/admin/campanas/${id}`)
  return response.data
}

export const getNegociosSelect = async () => {
  const response = await axios.get('/api/admin/campanas/negocios/opciones')
  return response.data
}