import { useState, useEffect } from 'react';
import Layout from '../components/common/Layout';
import { financiamientoService } from '../services/financiamientoService';
import { 
  Briefcase, 
  Search,
  Eye,
  X,
  DollarSign,
  Calendar,
  Building2,
  User,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle
} from 'lucide-react';
import { toast } from 'react-hot-toast';

const Financiamiento = () => {
  const [formularios, setFormularios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showDetalleModal, setShowDetalleModal] = useState(false);
  const [showEstadoModal, setShowEstadoModal] = useState(false);
  const [selectedFormulario, setSelectedFormulario] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterEstado, setFilterEstado] = useState('');
  const [nuevoEstado, setNuevoEstado] = useState('');

  useEffect(() => {
    cargarFormularios();
  }, [filterEstado]);

  const cargarFormularios = async () => {
    try {
      setLoading(true);
      const params = {};
      if (filterEstado) params.estado = filterEstado;

      const response = await financiamientoService.getAll(params);
      setFormularios(response.data);
    } catch (error) {
      toast.error('Error al cargar formularios');
    } finally {
      setLoading(false);
    }
  };

  const handleVerDetalle = async (formularioId) => {
    try {
      const response = await financiamientoService.getById(formularioId);
      setSelectedFormulario(response.data);
      setShowDetalleModal(true);
    } catch (error) {
      toast.error('Error al cargar detalles');
    }
  };

  const handleOpenEstadoModal = (formulario) => {
    setSelectedFormulario(formulario);
    setNuevoEstado(formulario.estado);
    setShowEstadoModal(true);
  };

  const handleActualizarEstado = async () => {
    try {
      await financiamientoService.updateEstado(selectedFormulario.id, nuevoEstado);
      toast.success('Estado actualizado exitosamente');
      setShowEstadoModal(false);
      cargarFormularios();
    } catch (error) {
      toast.error('Error al actualizar estado');
    }
  };

  const handleCloseModals = () => {
    setShowDetalleModal(false);
    setShowEstadoModal(false);
    setSelectedFormulario(null);
  };

  const formulariosFiltrados = formularios.filter(form =>
    form.negocio?.nombreNegocio.toLowerCase().includes(searchTerm.toLowerCase()) ||
    form.usuario?.nombre.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getEstadoBadge = (estado) => {
    const badges = {
      enviado: { color: 'bg-blue-100 text-blue-800', icon: Clock },
      en_revision: { color: 'bg-yellow-100 text-yellow-800', icon: AlertCircle },
      aprobado: { color: 'bg-green-100 text-green-800', icon: CheckCircle },
      rechazado: { color: 'bg-red-100 text-red-800', icon: XCircle }
    };
    return badges[estado] || badges.enviado;
  };

  const getEstadoNombre = (estado) => {
    const nombres = {
      enviado: 'Enviado',
      en_revision: 'En Revisión',
      aprobado: 'Aprobado',
      rechazado: 'Rechazado'
    };
    return nombres[estado] || estado;
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    }).format(amount);
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
          <h1 className="text-3xl font-bold text-gray-900">Solicitudes de Financiamiento</h1>
          <p className="text-gray-600 mt-1">Gestiona las solicitudes de apoyo financiero</p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="md:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Buscar por negocio o cliente..."
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
                <option value="enviado">Enviado</option>
                <option value="en_revision">En Revisión</option>
                <option value="aprobado">Aprobado</option>
                <option value="rechazado">Rechazado</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Negocio</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cliente</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Monto</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Plazo</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {formulariosFiltrados.length > 0 ? (
                  formulariosFiltrados.map((form) => {
                    const estadoInfo = getEstadoBadge(form.estado);
                    const IconEstado = estadoInfo.icon;
                    return (
                      <tr key={form.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            <Building2 className="w-5 h-5 text-gray-400 mr-3" />
                            <div className="text-sm text-gray-900">{form.negocio?.nombreNegocio}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            <User className="w-5 h-5 text-gray-400 mr-3" />
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {form.usuario?.nombre} {form.usuario?.apellido}
                              </div>
                              <div className="text-sm text-gray-500">{form.usuario?.email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            <DollarSign className="w-4 h-4 text-gray-400 mr-1" />
                            <span className="text-sm text-gray-900">{formatCurrency(form.montoSolicitado)}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">{form.plazoMeses} meses</td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold rounded-full ${estadoInfo.color}`}>
                            <IconEstado className="w-3 h-3" />
                            {getEstadoNombre(form.estado)}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">{formatDate(form.fechaSolicitud)}</td>
                        <td className="px-6 py-4 text-right text-sm font-medium">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleVerDetalle(form.id)}
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                              title="Ver detalles"
                            >
                              <Eye className="w-5 h-5" />
                            </button>
                            <button
                              onClick={() => handleOpenEstadoModal(form)}
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
                    <td colSpan="7" className="px-6 py-8 text-center">
                      <Briefcase className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                      <p className="text-gray-500">No se encontraron solicitudes</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {showDetalleModal && selectedFormulario && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Detalle de Solicitud</h2>
              <button onClick={handleCloseModals} className="text-gray-400 hover:text-gray-600">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-2">Negocio</h3>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="font-semibold text-gray-900">{selectedFormulario.negocio?.nombreNegocio}</p>
                    <p className="text-sm text-gray-600 mt-1">{selectedFormulario.negocio?.categoria?.nombre}</p>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-2">Cliente</h3>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="font-semibold text-gray-900">
                      {selectedFormulario.usuario?.nombre} {selectedFormulario.usuario?.apellido}
                    </p>
                    <p className="text-sm text-gray-600 mt-1">{selectedFormulario.usuario?.email}</p>
                    <p className="text-sm text-gray-600">{selectedFormulario.usuario?.telefono}</p>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-2">Información Financiera</h3>
                  <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Monto Solicitado:</span>
                      <span className="text-sm font-semibold text-gray-900">{formatCurrency(selectedFormulario.montoSolicitado)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Plazo:</span>
                      <span className="text-sm font-semibold text-gray-900">{selectedFormulario.plazoMeses} meses</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Ingresos Mensuales:</span>
                      <span className="text-sm font-semibold text-gray-900">{formatCurrency(selectedFormulario.ingresosMensuales)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Egresos Mensuales:</span>
                      <span className="text-sm font-semibold text-gray-900">{formatCurrency(selectedFormulario.egresosMensuales)}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-2">Estado y Fecha</h3>
                  <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                    <span className={`inline-flex items-center gap-1 px-3 py-1 text-sm font-semibold rounded-full ${getEstadoBadge(selectedFormulario.estado).color}`}>
                      {getEstadoNombre(selectedFormulario.estado)}
                    </span>
                    <p className="text-sm text-gray-600 mt-2">{formatDate(selectedFormulario.fechaSolicitud)}</p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-2">Destino del Crédito</h3>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-900">{selectedFormulario.destinoCredito}</p>
                </div>
              </div>

              {selectedFormulario.tieneCreditosActivos && selectedFormulario.detallesCreditos && (
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-2">Créditos Activos</h3>
                  <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                    <p className="text-sm text-gray-900">{selectedFormulario.detallesCreditos}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {showEstadoModal && selectedFormulario && (
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
                  value={nuevoEstado}
                  onChange={(e) => setNuevoEstado(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2B5BA6] focus:border-transparent"
                >
                  <option value="enviado">Enviado</option>
                  <option value="en_revision">En Revisión</option>
                  <option value="aprobado">Aprobado</option>
                  <option value="rechazado">Rechazado</option>
                </select>
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

export default Financiamiento;