import { useState, useEffect } from 'react';
import Layout from '../components/common/Layout';
import api from '../services/axios';
import { 
  Link2, 
  Plus, 
  Search, 
  Edit, 
  Trash2,
  X,
  ExternalLink,
  Video,
  FileText,
  DollarSign
} from 'lucide-react';
import { toast } from 'react-hot-toast';

const Enlaces = () => {
  const [enlaces, setEnlaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('create');
  const [selectedEnlace, setSelectedEnlace] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterTipo, setFilterTipo] = useState('');
  const [filterCategoria, setFilterCategoria] = useState('');

  const [formData, setFormData] = useState({
    titulo: '',
    descripcion: '',
    url: '',
    tipo: 'otro',
    categoria: '',
    visiblePara: 'todos',
    activo: true
  });

  useEffect(() => {
    cargarEnlaces();
  }, [filterTipo, filterCategoria]);

  const cargarEnlaces = async () => {
    try {
      setLoading(true);
      const params = {};
      if (filterTipo) params.tipo = filterTipo;
      if (filterCategoria) params.categoria = filterCategoria;

      const response = await api.get('/enlaces', { params });
      setEnlaces(response.data.data);
    } catch (error) {
      toast.error('Error al cargar enlaces');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (mode, enlace = null) => {
    setModalMode(mode);
    setSelectedEnlace(enlace);
    if (mode === 'edit' && enlace) {
      setFormData({
        titulo: enlace.titulo,
        descripcion: enlace.descripcion || '',
        url: enlace.url,
        tipo: enlace.tipo,
        categoria: enlace.categoria || '',
        visiblePara: enlace.visiblePara,
        activo: enlace.activo
      });
    } else {
      setFormData({
        titulo: '',
        descripcion: '',
        url: '',
        tipo: 'otro',
        categoria: '',
        visiblePara: 'todos',
        activo: true
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedEnlace(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (modalMode === 'create') {
        await api.post('/enlaces', formData);
        toast.success('Enlace creado exitosamente');
      } else {
        await api.put(`/enlaces/${selectedEnlace.id}`, formData);
        toast.success('Enlace actualizado exitosamente');
      }
      handleCloseModal();
      cargarEnlaces();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error al guardar enlace');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Estás seguro de eliminar este enlace?')) {
      try {
        await api.delete(`/enlaces/${id}`);
        toast.success('Enlace eliminado exitosamente');
        cargarEnlaces();
      } catch (error) {
        toast.error('Error al eliminar enlace');
      }
    }
  };

  const enlacesFiltrados = enlaces.filter(enlace =>
    enlace.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
    enlace.descripcion?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getTipoIcon = (tipo) => {
    switch (tipo) {
      case 'video':
        return <Video className="w-5 h-5" />;
      case 'financiamiento':
        return <DollarSign className="w-5 h-5" />;
      case 'documento':
        return <FileText className="w-5 h-5" />;
      default:
        return <Link2 className="w-5 h-5" />;
    }
  };

  const getTipoColor = (tipo) => {
    switch (tipo) {
      case 'video':
        return 'bg-red-100 text-red-800';
      case 'financiamiento':
        return 'bg-green-100 text-green-800';
      case 'documento':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getVisibilidadColor = (visible) => {
    switch (visible) {
      case 'todos':
        return 'bg-purple-100 text-purple-800';
      case 'clientes':
        return 'bg-green-100 text-green-800';
      case 'colaboradores':
        return 'bg-blue-100 text-blue-800';
      case 'admin':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
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
            <h1 className="text-3xl font-bold text-gray-900">Recursos y Enlaces</h1>
            <p className="text-gray-600 mt-1">Gestiona enlaces a recursos externos</p>
          </div>
          <button
            onClick={() => handleOpenModal('create')}
            className="flex items-center gap-2 px-4 py-2 bg-[#2B5BA6] text-white rounded-lg hover:bg-[#1E3A5F] transition-colors"
          >
            <Plus className="w-5 h-5" />
            Nuevo Enlace
          </button>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="md:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Buscar enlace..."
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
                <option value="video">Video</option>
                <option value="financiamiento">Financiamiento</option>
                <option value="documento">Documento</option>
                <option value="otro">Otro</option>
              </select>
            </div>
            <div>
              <input
                type="text"
                placeholder="Filtrar por categoría"
                value={filterCategoria}
                onChange={(e) => setFilterCategoria(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2B5BA6] focus:border-transparent"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {enlacesFiltrados.length > 0 ? (
              enlacesFiltrados.map((enlace) => (
                <div key={enlace.id} className="bg-white border border-gray-200 rounded-lg hover:shadow-lg transition-shadow">
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">{enlace.titulo}</h3>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded ${getTipoColor(enlace.tipo)}`}>
                            {getTipoIcon(enlace.tipo)}
                            {enlace.tipo.charAt(0).toUpperCase() + enlace.tipo.slice(1)}
                          </span>
                          <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded ${getVisibilidadColor(enlace.visiblePara)}`}>
                            {enlace.visiblePara.charAt(0).toUpperCase() + enlace.visiblePara.slice(1)}
                          </span>
                        </div>
                      </div>
                    </div>

                    <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                      {enlace.descripcion || 'Sin descripción'}
                    </p>

                    {enlace.categoria && (
                      <p className="text-sm text-gray-500 mb-4">
                        Categoría: <span className="font-medium">{enlace.categoria}</span>
                      </p>
                    )}

                    <div className="space-y-2">
                      <a
                        href={enlace.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center gap-2 px-4 py-2 text-sm text-[#2B5BA6] bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                      >
                        <ExternalLink className="w-4 h-4" />
                        Abrir Enlace
                      </a>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleOpenModal('edit', enlace)}
                          className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                        >
                          <Edit className="w-4 h-4" />
                          Editar
                        </button>
                        <button
                          onClick={() => handleDelete(enlace.id)}
                          className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                          Eliminar
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full text-center py-12">
                <Link2 className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-500">No se encontraron enlaces</p>
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
                {modalMode === 'create' ? 'Nuevo Enlace' : 'Editar Enlace'}
              </h2>
              <button onClick={handleCloseModal} className="text-gray-400 hover:text-gray-600">
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
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
                  URL
                </label>
                <input
                  type="url"
                  required
                  value={formData.url}
                  onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2B5BA6] focus:border-transparent"
                  placeholder="https://"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Descripción
                </label>
                <textarea
                  rows="3"
                  value={formData.descripcion}
                  onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
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
                    <option value="video">Video</option>
                    <option value="financiamiento">Financiamiento</option>
                    <option value="documento">Documento</option>
                    <option value="otro">Otro</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Categoría
                  </label>
                  <input
                    type="text"
                    value={formData.categoria}
                    onChange={(e) => setFormData({ ...formData, categoria: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2B5BA6] focus:border-transparent"
                    placeholder="Ej: Marketing, Finanzas"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Visible Para
                  </label>
                  <select
                    value={formData.visiblePara}
                    onChange={(e) => setFormData({ ...formData, visiblePara: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2B5BA6] focus:border-transparent"
                  >
                    <option value="todos">Todos</option>
                    <option value="clientes">Clientes</option>
                    <option value="colaboradores">Colaboradores</option>
                    <option value="admin">Admin</option>
                  </select>
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
                  type="submit"
                  className="px-4 py-2 bg-[#2B5BA6] text-white rounded-lg hover:bg-[#1E3A5F] transition-colors"
                >
                  {modalMode === 'create' ? 'Crear Enlace' : 'Guardar Cambios'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default Enlaces;