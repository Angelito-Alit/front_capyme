import { useState, useEffect } from 'react';
import Layout from '../components/common/Layout';
import api from '../services/axios';
import { 
  BellRing, 
  Plus, 
  Search, 
  Edit, 
  Trash2,
  X,
  AlertCircle,
  Info,
  Calendar as CalendarIcon,
  Users
} from 'lucide-react';
import { toast } from 'react-hot-toast';

const Avisos = () => {
  const [avisos, setAvisos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('create');
  const [selectedAviso, setSelectedAviso] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterTipo, setFilterTipo] = useState('');
  const [filterDestinatario, setFilterDestinatario] = useState('');

  const [formData, setFormData] = useState({
    titulo: '',
    contenido: '',
    tipo: 'informativo',
    destinatario: 'clientes',
    linkExterno: '',
    fechaExpiracion: '',
    activo: true
  });

  useEffect(() => {
    cargarAvisos();
  }, [filterTipo, filterDestinatario]);

  const cargarAvisos = async () => {
    try {
      setLoading(true);
      const params = {};
      if (filterTipo) params.tipo = filterTipo;

      const response = await api.get('/avisos', { params });
      setAvisos(response.data.data);
    } catch (error) {
      toast.error('Error al cargar avisos');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (mode, aviso = null) => {
    setModalMode(mode);
    setSelectedAviso(aviso);
    if (mode === 'edit' && aviso) {
      setFormData({
        titulo: aviso.titulo,
        contenido: aviso.contenido,
        tipo: aviso.tipo,
        destinatario: aviso.destinatario,
        linkExterno: aviso.linkExterno || '',
        fechaExpiracion: aviso.fechaExpiracion ? aviso.fechaExpiracion.split('T')[0] : '',
        activo: aviso.activo
      });
    } else {
      setFormData({
        titulo: '',
        contenido: '',
        tipo: 'informativo',
        destinatario: 'clientes',
        linkExterno: '',
        fechaExpiracion: '',
        activo: true
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedAviso(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (modalMode === 'create') {
        await api.post('/avisos', formData);
        toast.success('Aviso creado exitosamente');
      } else {
        await api.put(`/avisos/${selectedAviso.id}`, formData);
        toast.success('Aviso actualizado exitosamente');
      }
      handleCloseModal();
      cargarAvisos();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error al guardar aviso');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Estás seguro de eliminar este aviso?')) {
      try {
        await api.delete(`/avisos/${id}`);
        toast.success('Aviso eliminado exitosamente');
        cargarAvisos();
      } catch (error) {
        toast.error('Error al eliminar aviso');
      }
    }
  };

  const avisosFiltrados = avisos.filter(aviso => {
    const matchSearch = aviso.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       aviso.contenido.toLowerCase().includes(searchTerm.toLowerCase());
    const matchDestinatario = !filterDestinatario || aviso.destinatario === filterDestinatario;
    return matchSearch && matchDestinatario;
  });

  const getTipoIcon = (tipo) => {
    switch (tipo) {
      case 'urgente':
        return <AlertCircle className="w-5 h-5" />;
      case 'evento':
        return <CalendarIcon className="w-5 h-5" />;
      case 'recordatorio':
        return <BellRing className="w-5 h-5" />;
      default:
        return <Info className="w-5 h-5" />;
    }
  };

  const getTipoColor = (tipo) => {
    switch (tipo) {
      case 'urgente':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'evento':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'recordatorio':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-blue-100 text-blue-800 border-blue-200';
    }
  };

  const getDestinatarioColor = (destinatario) => {
    switch (destinatario) {
      case 'todos':
        return 'bg-gray-100 text-gray-800';
      case 'clientes':
        return 'bg-green-100 text-green-800';
      case 'colaboradores':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (date) => {
    if (!date) return null;
    return new Date(date).toLocaleDateString('es-MX', {
      year: 'numeric',
      month: 'short',
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
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Gestión de Avisos</h1>
            <p className="text-gray-600 mt-1">Administra avisos y notificaciones del sistema</p>
          </div>
          <button
            onClick={() => handleOpenModal('create')}
            className="flex items-center gap-2 px-4 py-2 bg-[#2B5BA6] text-white rounded-lg hover:bg-[#1E3A5F] transition-colors"
          >
            <Plus className="w-5 h-5" />
            Nuevo Aviso
          </button>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="md:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Buscar aviso..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2B5BA6] focus:border-transparent"
                />
              </div>
            </div>
            <div>
              <select
                value={filterTipo}
                onChange={(e) => setFilterTipo(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2B5BA6] focus:border-transparent"
              >
                <option value="">Todos los tipos</option>
                <option value="informativo">Informativo</option>
                <option value="urgente">Urgente</option>
                <option value="evento">Evento</option>
                <option value="recordatorio">Recordatorio</option>
              </select>
            </div>
            <div>
              <select
                value={filterDestinatario}
                onChange={(e) => setFilterDestinatario(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2B5BA6] focus:border-transparent"
              >
                <option value="">Todos los destinatarios</option>
                <option value="todos">Todos</option>
                <option value="clientes">Clientes</option>
                <option value="colaboradores">Colaboradores</option>
              </select>
            </div>
          </div>

          <div className="space-y-4">
            {avisosFiltrados.length > 0 ? (
              avisosFiltrados.map((aviso) => (
                <div key={aviso.id} className={`border-l-4 rounded-lg p-4 ${getTipoColor(aviso.tipo)}`}>
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3 flex-1">
                      <div className="mt-1">
                        {getTipoIcon(aviso.tipo)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900">{aviso.titulo}</h3>
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getDestinatarioColor(aviso.destinatario)}`}>
                            {aviso.destinatario.charAt(0).toUpperCase() + aviso.destinatario.slice(1)}
                          </span>
                          {!aviso.activo && (
                            <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-600 rounded-full">
                              Inactivo
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-700 mb-2">{aviso.contenido}</p>
                        <div className="flex items-center gap-4 text-xs text-gray-600">
                          <span>Publicado: {formatDate(aviso.fechaPublicacion)}</span>
                          {aviso.fechaExpiracion && (
                            <span>Expira: {formatDate(aviso.fechaExpiracion)}</span>
                          )}
                          {aviso.linkExterno && (
                            <a 
                              href={aviso.linkExterno} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-[#2B5BA6] hover:underline"
                            >
                              Ver más
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 ml-4">
                      <button
                        onClick={() => handleOpenModal('edit', aviso)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      >
                        <Edit className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleDelete(aviso.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12">
                <BellRing className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-500">No se encontraron avisos</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">
                {modalMode === 'create' ? 'Nuevo Aviso' : 'Editar Aviso'}
              </h2>
              <button onClick={handleCloseModal} className="text-gray-400 hover:text-gray-600">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Título
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.titulo}
                    onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2B5BA6] focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Contenido
                  </label>
                  <textarea
                    rows="4"
                    required
                    value={formData.contenido}
                    onChange={(e) => setFormData({ ...formData, contenido: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2B5BA6] focus:border-transparent"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tipo
                    </label>
                    <select
                      value={formData.tipo}
                      onChange={(e) => setFormData({ ...formData, tipo: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2B5BA6] focus:border-transparent"
                    >
                      <option value="informativo">Informativo</option>
                      <option value="urgente">Urgente</option>
                      <option value="evento">Evento</option>
                      <option value="recordatorio">Recordatorio</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Destinatario
                    </label>
                    <select
                      value={formData.destinatario}
                      onChange={(e) => setFormData({ ...formData, destinatario: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2B5BA6] focus:border-transparent"
                    >
                      <option value="todos">Todos</option>
                      <option value="clientes">Clientes</option>
                      <option value="colaboradores">Colaboradores</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Link Externo (opcional)
                  </label>
                  <input
                    type="url"
                    value={formData.linkExterno}
                    onChange={(e) => setFormData({ ...formData, linkExterno: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2B5BA6] focus:border-transparent"
                    placeholder="https://"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Fecha de Expiración (opcional)
                  </label>
                  <input
                    type="date"
                    value={formData.fechaExpiracion}
                    onChange={(e) => setFormData({ ...formData, fechaExpiracion: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2B5BA6] focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Estado
                  </label>
                  <select
                    value={formData.activo}
                    onChange={(e) => setFormData({ ...formData, activo: e.target.value === 'true' })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2B5BA6] focus:border-transparent"
                  >
                    <option value="true">Activo</option>
                    <option value="false">Inactivo</option>
                  </select>
                </div>

                <div className="flex items-center justify-end gap-3 pt-4">
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    onClick={handleSubmit}
                    className="px-4 py-2 bg-[#2B5BA6] text-white rounded-lg hover:bg-[#1E3A5F] transition-colors"
                  >
                    {modalMode === 'create' ? 'Crear Aviso' : 'Guardar Cambios'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default Avisos;