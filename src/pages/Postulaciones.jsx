import { useState, useEffect } from 'react';
import Layout from '../components/common/Layout';
import { postulacionesService } from '../services/postulacionesService';
import api from '../services/axios';
import { 
  ClipboardList, 
  Search, 
  Eye,
  X,
  Building2,
  FileText,
  User,
  Calendar,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle
} from 'lucide-react';
import { toast } from 'react-hot-toast';

const Postulaciones = () => {
  const [postulaciones, setPostulaciones] = useState([]);
  const [programas, setProgramas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showDetalleModal, setShowDetalleModal] = useState(false);
  const [showEstadoModal, setShowEstadoModal] = useState(false);
  const [selectedPostulacion, setSelectedPostulacion] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPrograma, setFilterPrograma] = useState('');
  const [filterEstado, setFilterEstado] = useState('');

  const [estadoData, setEstadoData] = useState({
    estado: '',
    notasAdmin: ''
  });

  useEffect(() => {
    cargarDatos();
  }, [filterPrograma, filterEstado]);

  const cargarDatos = async () => {
    try {
      setLoading(true);
      const params = {};
      if (filterPrograma) params.programaId = filterPrograma;
      if (filterEstado) params.estado = filterEstado;

      const [postulacionesRes, programasRes] = await Promise.all([
        postulacionesService.getAll(params),
        api.get('/programas')
      ]);

      setPostulaciones(postulacionesRes.data);
      setProgramas(programasRes.data.data);
    } catch (error) {
      toast.error('Error al cargar postulaciones');
    } finally {
      setLoading(false);
    }
  };

  const handleVerDetalle = async (postulacionId) => {
    try {
      const response = await postulacionesService.getById(postulacionId);
      setSelectedPostulacion(response.data);
      setShowDetalleModal(true);
    } catch (error) {
      toast.error('Error al cargar detalles');
    }
  };

  const handleOpenEstadoModal = (postulacion) => {
    setSelectedPostulacion(postulacion);
    setEstadoData({
      estado: postulacion.estado,
      notasAdmin: postulacion.notasAdmin || ''
    });
    setShowEstadoModal(true);
  };

  const handleCloseModals = () => {
    setShowDetalleModal(false);
    setShowEstadoModal(false);
    setSelectedPostulacion(null);
    setEstadoData({ estado: '', notasAdmin: '' });
  };

  const handleActualizarEstado = async () => {
    try {
      await postulacionesService.updateEstado(
        selectedPostulacion.id,
        estadoData.estado,
        estadoData.notasAdmin
      );
      toast.success('Estado actualizado exitosamente');
      handleCloseModals();
      cargarDatos();
    } catch (error) {
      toast.error('Error al actualizar estado');
    }
  };

  const postulacionesFiltradas = postulaciones.filter(postulacion =>
    postulacion.negocio?.nombreNegocio.toLowerCase().includes(searchTerm.toLowerCase()) ||
    postulacion.programa?.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    postulacion.usuario?.nombre.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getEstadoBadge = (estado) => {
    const badges = {
      pendiente: { color: 'bg-yellow-100 text-yellow-800', icon: Clock },
      en_revision: { color: 'bg-blue-100 text-blue-800', icon: AlertCircle },
      aprobada: { color: 'bg-green-100 text-green-800', icon: CheckCircle },
      rechazada: { color: 'bg-red-100 text-red-800', icon: XCircle },
      completada: { color: 'bg-purple-100 text-purple-800', icon: CheckCircle }
    };
    return badges[estado] || badges.pendiente;
  };

  const getEstadoNombre = (estado) => {
    const nombres = {
      pendiente: 'Pendiente',
      en_revision: 'En Revisión',
      aprobada: 'Aprobada',
      rechazada: 'Rechazada',
      completada: 'Completada'
    };
    return nombres[estado] || estado;
  };

  const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('es-MX', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2B5BA6]"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Gestión de Postulaciones</h1>
            <p className="text-gray-600 mt-1">Administra todas las postulaciones a programas</p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="md:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Buscar por negocio, programa o cliente..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2B5BA6] focus:border-transparent"
                />
              </div>
            </div>
            <div>
              <select
                value={filterPrograma}
                onChange={(e) => setFilterPrograma(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2B5BA6] focus:border-transparent"
              >
                <option value="">Todos los programas</option>
                {programas.map(prog => (
                  <option key={prog.id} value={prog.id}>{prog.nombre}</option>
                ))}
              </select>
            </div>
            <div>
              <select
                value={filterEstado}
                onChange={(e) => setFilterEstado(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2B5BA6] focus:border-transparent"
              >
                <option value="">Todos los estados</option>
                <option value="pendiente">Pendiente</option>
                <option value="en_revision">En Revisión</option>
                <option value="aprobada">Aprobada</option>
                <option value="rechazada">Rechazada</option>
                <option value="completada">Completada</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Negocio</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Programa</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cliente</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {postulacionesFiltradas.length > 0 ? (
                  postulacionesFiltradas.map((postulacion) => {
                    const estadoInfo = getEstadoBadge(postulacion.estado);
                    const IconEstado = estadoInfo.icon;
                    return (
                      <tr key={postulacion.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            <Building2 className="w-5 h-5 text-gray-400 mr-3" />
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {postulacion.negocio?.nombreNegocio}
                              </div>
                              <div className="text-sm text-gray-500">
                                {postulacion.negocio?.categoria?.nombre}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            <FileText className="w-5 h-5 text-gray-400 mr-3" />
                            <div className="text-sm text-gray-900">
                              {postulacion.programa?.nombre}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            <User className="w-5 h-5 text-gray-400 mr-3" />
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {postulacion.usuario?.nombre} {postulacion.usuario?.apellido}
                              </div>
                              <div className="text-sm text-gray-500">
                                {postulacion.usuario?.email}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold rounded-full ${estadoInfo.color}`}>
                            <IconEstado className="w-3 h-3" />
                            {getEstadoNombre(postulacion.estado)}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">
                          {formatDate(postulacion.fechaPostulacion)}
                        </td>
                        <td className="px-6 py-4 text-right text-sm font-medium">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleVerDetalle(postulacion.id)}
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                              title="Ver detalles"
                            >
                              <Eye className="w-5 h-5" />
                            </button>
                            <button
                              onClick={() => handleOpenEstadoModal(postulacion)}
                              className="px-3 py-1 text-sm text-[#2B5BA6] bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                            >
                              Cambiar Estado
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="6" className="px-6 py-8 text-center">
                      <ClipboardList className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                      <p className="text-gray-500">No se encontraron postulaciones</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {showDetalleModal && selectedPostulacion && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Detalle de Postulación</h2>
              <button onClick={handleCloseModals} className="text-gray-400 hover:text-gray-600">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-2">Negocio</h3>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="font-semibold text-gray-900">{selectedPostulacion.negocio?.nombreNegocio}</p>
                    <p className="text-sm text-gray-600 mt-1">{selectedPostulacion.negocio?.rfc}</p>
                    <p className="text-sm text-gray-600">{selectedPostulacion.negocio?.categoria?.nombre}</p>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-2">Programa</h3>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="font-semibold text-gray-900">{selectedPostulacion.programa?.nombre}</p>
                    <p className="text-sm text-gray-600 mt-1">{selectedPostulacion.programa?.tipoPrograma}</p>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-2">Cliente</h3>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="font-semibold text-gray-900">
                      {selectedPostulacion.usuario?.nombre} {selectedPostulacion.usuario?.apellido}
                    </p>
                    <p className="text-sm text-gray-600 mt-1">{selectedPostulacion.usuario?.email}</p>
                    <p className="text-sm text-gray-600">{selectedPostulacion.usuario?.telefono}</p>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-2">Estado Actual</h3>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <span className={`inline-flex items-center gap-1 px-3 py-1 text-sm font-semibold rounded-full ${getEstadoBadge(selectedPostulacion.estado).color}`}>
                      {getEstadoNombre(selectedPostulacion.estado)}
                    </span>
                    <p className="text-sm text-gray-600 mt-2">
                      {formatDate(selectedPostulacion.fechaPostulacion)}
                    </p>
                  </div>
                </div>
              </div>

              {selectedPostulacion.respuestas && selectedPostulacion.respuestas.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Respuestas del Formulario</h3>
                  <div className="space-y-4">
                    {selectedPostulacion.respuestas.map((respuesta) => (
                      <div key={respuesta.id} className="bg-gray-50 p-4 rounded-lg">
                        <p className="text-sm font-medium text-gray-700 mb-2">
                          {respuesta.pregunta?.pregunta}
                        </p>
                        <p className="text-sm text-gray-900">{respuesta.respuesta || 'Sin respuesta'}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {selectedPostulacion.notasAdmin && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Notas Administrativas</h3>
                  <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                    <p className="text-sm text-gray-900">{selectedPostulacion.notasAdmin}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {showEstadoModal && selectedPostulacion && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Cambiar Estado</h2>
              <button onClick={handleCloseModals} className="text-gray-400 hover:text-gray-600">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nuevo Estado
                </label>
                <select
                  value={estadoData.estado}
                  onChange={(e) => setEstadoData({ ...estadoData, estado: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2B5BA6] focus:border-transparent"
                >
                  <option value="pendiente">Pendiente</option>
                  <option value="en_revision">En Revisión</option>
                  <option value="aprobada">Aprobada</option>
                  <option value="rechazada">Rechazada</option>
                  <option value="completada">Completada</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notas Administrativas
                </label>
                <textarea
                  rows="4"
                  value={estadoData.notasAdmin}
                  onChange={(e) => setEstadoData({ ...estadoData, notasAdmin: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2B5BA6] focus:border-transparent"
                  placeholder="Agregar notas sobre esta postulación..."
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={handleCloseModals}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleActualizarEstado}
                  className="px-4 py-2 bg-[#2B5BA6] text-white rounded-lg hover:bg-[#1E3A5F] transition-colors"
                >
                  Guardar Cambios
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default Postulaciones;