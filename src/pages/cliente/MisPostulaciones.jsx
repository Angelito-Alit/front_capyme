import { useState, useEffect } from 'react';
import Layout from '../../components/common/Layout';
import { postulacionesService } from '../../services/postulacionesService';
import { 
  ClipboardList, 
  Search, 
  Eye,
  X,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  Calendar,
  Building2,
  FileText
} from 'lucide-react';
import { toast } from 'react-hot-toast';

const MisPostulaciones = () => {
  const [postulaciones, setPostulaciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showDetalleModal, setShowDetalleModal] = useState(false);
  const [selectedPostulacion, setSelectedPostulacion] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterEstado, setFilterEstado] = useState('');

  useEffect(() => {
    cargarPostulaciones();
  }, [filterEstado]);

  const cargarPostulaciones = async () => {
    try {
      setLoading(true);
      const response = await postulacionesService.getMisPostulaciones();
      setPostulaciones(response.data);
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

  const handleCloseModal = () => {
    setShowDetalleModal(false);
    setSelectedPostulacion(null);
  };

  const postulacionesFiltradas = postulaciones.filter(postulacion => {
    const matchSearch = postulacion.programa?.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       postulacion.negocio?.nombreNegocio.toLowerCase().includes(searchTerm.toLowerCase());
    const matchEstado = !filterEstado || postulacion.estado === filterEstado;
    return matchSearch && matchEstado;
  });

  const getEstadoBadge = (estado) => {
    const badges = {
      pendiente: { color: 'bg-yellow-100 text-yellow-800', icon: Clock, texto: 'Pendiente' },
      en_revision: { color: 'bg-blue-100 text-blue-800', icon: AlertCircle, texto: 'En Revisión' },
      aprobada: { color: 'bg-green-100 text-green-800', icon: CheckCircle, texto: 'Aprobada' },
      rechazada: { color: 'bg-red-100 text-red-800', icon: XCircle, texto: 'Rechazada' },
      completada: { color: 'bg-purple-100 text-purple-800', icon: CheckCircle, texto: 'Completada' }
    };
    return badges[estado] || badges.pendiente;
  };

  const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('es-MX', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
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
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Mis Postulaciones</h1>
          <p className="text-gray-600 mt-1">Revisa el estado de tus solicitudes a programas</p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="md:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Buscar por programa o negocio..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2B5BA6] focus:border-transparent"
                />
              </div>
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

          {postulacionesFiltradas.length > 0 ? (
            <div className="space-y-4">
              {postulacionesFiltradas.map((postulacion) => {
                const estadoInfo = getEstadoBadge(postulacion.estado);
                const IconEstado = estadoInfo.icon;
                return (
                  <div key={postulacion.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900">
                            {postulacion.programa?.nombre}
                          </h3>
                          <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold rounded-full ${estadoInfo.color}`}>
                            <IconEstado className="w-3 h-3" />
                            {estadoInfo.texto}
                          </span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Building2 className="w-4 h-4 text-gray-400" />
                            {postulacion.negocio?.nombreNegocio}
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Calendar className="w-4 h-4 text-gray-400" />
                            {formatDate(postulacion.fechaPostulacion)}
                          </div>
                        </div>

                        {postulacion.notasAdmin && (
                          <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                            <p className="text-sm text-gray-700">
                              <span className="font-medium">Notas: </span>
                              {postulacion.notasAdmin}
                            </p>
                          </div>
                        )}
                      </div>

                      <button
                        onClick={() => handleVerDetalle(postulacion.id)}
                        className="ml-4 flex items-center gap-2 px-4 py-2 text-sm text-[#2B5BA6] bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                      >
                        <Eye className="w-4 h-4" />
                        Ver Detalle
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12">
              <ClipboardList className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-500">No tienes postulaciones registradas</p>
              <a
                href="/cliente/programas"
                className="inline-block mt-4 px-6 py-2 bg-[#2B5BA6] text-white rounded-lg hover:bg-[#1E3A5F] transition-colors"
              >
                Explorar Programas
              </a>
            </div>
          )}
        </div>
      </div>

      {showDetalleModal && selectedPostulacion && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Detalle de Postulación</h2>
              <button onClick={handleCloseModal} className="text-gray-400 hover:text-gray-600">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-2">Programa</h3>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="font-semibold text-gray-900">{selectedPostulacion.programa?.nombre}</p>
                    <p className="text-sm text-gray-600 mt-1">{selectedPostulacion.programa?.tipoPrograma}</p>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-2">Negocio</h3>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="font-semibold text-gray-900">{selectedPostulacion.negocio?.nombreNegocio}</p>
                    <p className="text-sm text-gray-600 mt-1">{selectedPostulacion.negocio?.categoria?.nombre}</p>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-2">Estado</h3>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <span className={`inline-flex items-center gap-1 px-3 py-1 text-sm font-semibold rounded-full ${getEstadoBadge(selectedPostulacion.estado).color}`}>
                      {getEstadoBadge(selectedPostulacion.estado).texto}
                    </span>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-2">Fecha de Postulación</h3>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-900">{formatDate(selectedPostulacion.fechaPostulacion)}</p>
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
    </Layout>
  );
};

export default MisPostulaciones;