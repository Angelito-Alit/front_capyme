import api from './axios';

export const pagosService = {
  crearPreferencia: async (data) => {
    const response = await api.post('/pagos/crear-preferencia', data);
    return response.data;
  }
};