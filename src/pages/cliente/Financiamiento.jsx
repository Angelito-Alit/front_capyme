import { useState, useEffect } from 'react';
import Layout from '../../components/common/Layout';
import { financiamientoService } from '../../services/financiamientoService';
import { negociosService } from '../../services/negociosService';
import { 
  Briefcase, 
  Plus,
  Search,
  X,
  DollarSign,
  Calendar,
  FileText,
  CheckCircle,
  Clock,
  XCircle
} from 'lucide-react';
import { toast } from 'react-hot-toast';

const ClienteFinanciamiento = () => {
  const [formularios, setFormularios] = useState([]);
  const [negocios, setNegocios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const [formData, setFormData] = useState({
    negocioId: '',
    montoSolicitado: '',
    plazoMeses: '',
    destinoCredito: '',
    ingresosMensuales: '',
    egresosMensuales: '',
    tieneCreditosActivos: false,
    detallesCreditos: ''
  });

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      setLoading(true);
      const [formulariosRes, negociosRes] = await Promise.all([
        financiamientoService.getAll(),
        negociosService.getMisNegocios()
      ]);
      setFormularios(formulariosRes.data);
      setNegocios(negociosRes.data);
    } catch (error) {
      toast.error('Error al cargar información');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = () => {
    setFormData({
      negocioId: '',
      montoSolicitado: '',
      plazoMeses: '',
      destinoCredito: '',
      ingresosMensuales: '',
      egresosMensuales: '',
      tieneCreditosActivos: false,
      detallesCreditos: ''
    });
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await financiamientoService.create({
        ...formData,
        negocioId: parseInt(formData.negocioId),
        montoSolicitado: parseFloat(formData.montoSolicitado),
        plazoMeses: parseInt(formData.plazoMeses),
        ingresosMensuales: parseFloat(formData.ingresosMensuales),
        egresosMensuales: parseFloat(formData.egresosMensuales)
      });
      toast.success('Solicitud enviada exitosamente');
      handleCloseModal();
      cargarDatos();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error al enviar solicitud');
    }
  };

  const formulariosFiltrados = formularios.filter(form =>
    form.negocio?.nombreNegocio.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getEstadoBadge = (estado) => {
    const badges = {
      enviado: { color: 'bg-blue-100 text-blue-800', icon: Clock, texto: 'Enviado' },
      en_revision: { color: 'bg-yellow-100 text-yellow-800', icon: Clock, texto: 'En Revisión' },
      aprobado: { color: 'bg-green-100 text-green-800', icon: CheckCircle, texto: 'Aprobado' },
      rechazado: { color: 'bg-red-100 text-red-800', icon: XCircle, texto: 'Rechazado' }
    };
    return badges[estado] || badges.enviado;
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    }).format(amount);
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
            <h1 className="text-3xl font-bold text-gray-900">Solicitudes de Financiamiento</h1>
            <p className="text-gray-600 mt-1">Gestiona tus solicitudes de apoyo financiero</p>
          </div>
          <button
            onClick={handleOpenModal}
            className="flex items-center gap-2 px-4 py-2 bg-[#2B5BA6] text-white rounded-lg hover:bg-[#1E3A5F] transition-colors"
          >
            <Plus className="w-5 h-5" />
            Nueva Solicitud
          </button>
        </div>

        <div className="bg-gradient-to-br from-[#2B5BA6] to-[#4A7BC8] rounded-lg shadow-lg p-6 text-white">
          <Briefcase className="w-12 h-12 mb-4 opacity-80" />
          <h2 className="text-2xl font-bold mb-2">Opciones de Financiamiento</h2>
          <p className="text-blue-100 mb-4">
            Solicita apoyo financiero para hacer crecer tu negocio. Completa el formulario con tu información y te contactaremos para evaluar tu solicitud.
          </p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="relative mb-6">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Buscar por negocio..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2B5BA6] focus:border-transparent"
            />
          </div>

          {formulariosFiltrados.length > 0 ? (
            <div className="space-y-4">
              {formulariosFiltrados.map((form) => {
                const estadoInfo = getEstadoBadge(form.estado);
                const IconEstado = estadoInfo.icon;
                return (
                  <div key={form.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900">
                            {form.negocio?.nombreNegocio}
                          </h3>
                          <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold rounded-full ${estadoInfo.color}`}>
                            <IconEstado className="w-3 h-3" />
                            {estadoInfo.texto}
                          </span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <DollarSign className="w-4 h-4 text-gray-400" />
                            Monto: {formatCurrency(form.montoSolicitado)}
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Calendar className="w-4 h-4 text-gray-400" />
                            Plazo: {form.plazoMeses} meses
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <FileText className="w-4 h-4 text-gray-400" />
                            {new Date(form.fechaSolicitud).toLocaleDateString()}
                          </div>
                        </div>

                        {form.destinoCredito && (
                          <p className="text-sm text-gray-600 mt-2">
                            <span className="font-medium">Destino: </span>
                            {form.destinoCredito}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12">
              <Briefcase className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-500">No tienes solicitudes de financiamiento</p>
            </div>
          )}
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Nueva Solicitud de Financiamiento</h2>
              <button onClick={handleCloseModal} className="text-gray-400 hover:text-gray-600">
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Negocio
                </label>
                <select
                  required
                  value={formData.negocioId}
                  onChange={(e) => setFormData({ ...formData, negocioId: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2B5BA6] focus:border-transparent"
                >
                  <option value="">Selecciona un negocio</option>
                  {negocios.map(negocio => (
                    <option key={negocio.id} value={negocio.id}>{negocio.nombreNegocio}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Monto Solicitado
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={formData.montoSolicitado}
                    onChange={(e) => setFormData({ ...formData, montoSolicitado: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2B5BA6] focus:border-transparent"
                    placeholder="0.00"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Plazo (meses)
                  </label>
                  <input
                    type="number"
                    required
                    value={formData.plazoMeses}
                    onChange={(e) => setFormData({ ...formData, plazoMeses: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2B5BA6] focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Destino del Crédito
                </label>
                <textarea
                  rows="3"
                  required
                  value={formData.destinoCredito}
                  onChange={(e) => setFormData({ ...formData, destinoCredito: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2B5BA6] focus:border-transparent"
                  placeholder="¿Para qué usarás el financiamiento?"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Ingresos Mensuales
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={formData.ingresosMensuales}
                    onChange={(e) => setFormData({ ...formData, ingresosMensuales: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2B5BA6] focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Egresos Mensuales
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={formData.egresosMensuales}
                    onChange={(e) => setFormData({ ...formData, egresosMensuales: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2B5BA6] focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.tieneCreditosActivos}
                    onChange={(e) => setFormData({ ...formData, tieneCreditosActivos: e.target.checked })}
                    className="rounded text-[#2B5BA6] focus:ring-[#2B5BA6]"
                  />
                  <span className="text-sm text-gray-700">Tengo créditos activos</span>
                </label>
              </div>

              {formData.tieneCreditosActivos && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Detalles de Créditos Activos
                  </label>
                  <textarea
                    rows="3"
                    value={formData.detallesCreditos}
                    onChange={(e) => setFormData({ ...formData, detallesCreditos: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2B5BA6] focus:border-transparent"
                  />
                </div>
              )}

              <div className="flex items-center justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-[#2B5BA6] text-white rounded-lg hover:bg-[#1E3A5F] transition-colors"
                >
                  Enviar Solicitud
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default ClienteFinanciamiento;