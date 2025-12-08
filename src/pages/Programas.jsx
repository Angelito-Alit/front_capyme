import { useState, useEffect } from 'react';
import Layout from '../components/common/Layout';
import { programasService } from '../services/programasService';
import api from '../services/axios';
import { 
  FileText, 
  Plus, 
  Search, 
  Edit, 
  Trash2,
  X,
  Calendar,
  DollarSign,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { toast } from 'react-hot-toast';

const Programas = () => {
  const [programas, setProgramas] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('create');
  const [selectedPrograma, setSelectedPrograma] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategoria, setFilterCategoria] = useState('');
  const [filterEstado, setFilterEstado] = useState('');

  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    tipoPrograma: '',
    categoriaNegocioId: null,
    requisitos: '',
    beneficios: '',
    fechaInicio: '',
    fechaCierre: '',
    linkInformacion: '',
    montoApoyo: '',
    activo: true
  });

  useEffect(() => {
    cargarDatos();
  }, [filterCategoria, filterEstado]);

  const cargarDatos = async () => {
    try {
      setLoading(true);
      const params = {};
      if (filterCategoria) params.categoriaId = filterCategoria;
      if (filterEstado !== '') params.activo = filterEstado;

      const [programasRes, categoriasRes] = await Promise.all([
        programasService.getAll(params),
        api.get('/categorias')
      ]);

      setProgramas(programasRes.data);
      setCategorias(categoriasRes.data.data);
    } catch (error) {
      toast.error('Error al cargar programas');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (mode, programa = null) => {
    setModalMode(mode);
    setSelectedPrograma(programa);
    if (mode === 'edit' && programa) {
      setFormData({
        nombre: programa.nombre,
        descripcion: programa.descripcion || '',
        tipoPrograma: programa.tipoPrograma || '',
        categoriaNegocioId: programa.categoriaNegocioId || null,
        requisitos: programa.requisitos || '',
        beneficios: programa.beneficios || '',
        fechaInicio: programa.fechaInicio ? programa.fechaInicio.split('T')[0] : '',
        fechaCierre: programa.fechaCierre ? programa.fechaCierre.split('T')[0] : '',
        linkInformacion: programa.linkInformacion || '',
        montoApoyo: programa.montoApoyo || '',
        activo: programa.activo
      });
    } else {
      setFormData({
        nombre: '',
        descripcion: '',
        tipoPrograma: '',
        categoriaNegocioId: null,
        requisitos: '',
        beneficios: '',
        fechaInicio: '',
        fechaCierre: '',
        linkInformacion: '',
        montoApoyo: '',
        activo: true
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedPrograma(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const dataToSend = {
        ...formData,
        categoriaNegocioId: formData.categoriaNegocioId ? parseInt(formData.categoriaNegocioId) : null,
        montoApoyo: formData.montoApoyo ? parseFloat(formData.montoApoyo) : null
      };

      if (modalMode === 'create') {
        await programasService.create(dataToSend);
        toast.success('Programa creado exitosamente');
      } else {
        await programasService.update(selectedPrograma.id, dataToSend);
        toast.success('Programa actualizado exitosamente');
      }
      handleCloseModal();
      cargarDatos();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error al guardar programa');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Estás seguro de eliminar este programa?')) {
      try {
        await programasService.delete(id);
        toast.success('Programa eliminado exitosamente');
        cargarDatos();
      } catch (error) {
        toast.error('Error al eliminar programa');
      }
    }
  };

  const programasFiltrados = programas.filter(programa =>
    programa.nombre.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatCurrency = (amount) => {
    if (!amount) return 'N/A';
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    }).format(amount);
  };

  const formatDate = (date) => {
    if (!date) return 'N/A';
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
            <h1 className="text-3xl font-bold text-gray-900">Gestión de Programas</h1>
            <p className="text-gray-600 mt-1">Administra programas gubernamentales disponibles</p>
          </div>
          <button
            onClick={() => handleOpenModal('create')}
            className="flex items-center gap-2 px-4 py-2 bg-[#2B5BA6] text-white rounded-lg hover:bg-[#1E3A5F] transition-colors"
          >
            <Plus className="w-5 h-5" />
            Nuevo Programa
          </button>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="md:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Buscar programa..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2B5BA6] focus:border-transparent"
                />
              </div>
            </div>
            <div>
              <select
                value={filterCategoria}
                onChange={(e) => setFilterCategoria(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2B5BA6] focus:border-transparent"
              >
                <option value="">Todas las categorías</option>
                {categorias.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.nombre}</option>
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
                <option value="true">Activos</option>
                <option value="false">Inactivos</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {programasFiltrados.length > 0 ? (
              programasFiltrados.map((programa) => (
                <div key={programa.id} className="bg-white border border-gray-200 rounded-lg hover:shadow-lg transition-shadow">
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">{programa.nombre}</h3>
                        {programa.tipoPrograma && (
                          <span className="inline-block px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded">
                            {programa.tipoPrograma}
                          </span>
                        )}
                      </div>
                      {programa.activo ? (
                        <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0" />
                      ) : (
                        <XCircle className="w-6 h-6 text-red-500 flex-shrink-0" />
                      )}
                    </div>

                    <p className="text-sm text-gray-600 mb-4 line-clamp-3">
                      {programa.descripcion || 'Sin descripción'}
                    </p>

                    <div className="space-y-2 mb-4">
                      {programa.montoApoyo && (
                        <div className="flex items-center gap-2 text-sm">
                          <DollarSign className="w-4 h-4 text-gray-400" />
                          <span className="text-gray-700 font-semibold">
                            {formatCurrency(programa.montoApoyo)}
                          </span>
                        </div>
                      )}

                      {programa.fechaInicio && (
                        <div className="flex items-center gap-2 text-sm">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          <span className="text-gray-700">
                            {formatDate(programa.fechaInicio)} - {formatDate(programa.fechaCierre)}
                          </span>
                        </div>
                      )}

                      {programa.categoria && (
                        <div className="text-sm text-gray-600">
                          Categoría: <span className="font-medium">{programa.categoria.nombre}</span>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-2 pt-4 border-t border-gray-200">
                      <button
                        onClick={() => handleOpenModal('edit', programa)}
                        className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                      >
                        <Edit className="w-4 h-4" />
                        Editar
                      </button>
                      <button
                        onClick={() => handleDelete(programa.id)}
                        className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                        Eliminar
                      </button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full text-center py-12">
                <FileText className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-500">No se encontraron programas</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">
                {modalMode === 'create' ? 'Nuevo Programa' : 'Editar Programa'}
              </h2>
              <button onClick={handleCloseModal} className="text-gray-400 hover:text-gray-600">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nombre del Programa
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.nombre}
                    onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2B5BA6] focus:border-transparent"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tipo de Programa
                    </label>
                    <select
                      value={formData.tipoPrograma}
                      onChange={(e) => setFormData({ ...formData, tipoPrograma: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2B5BA6] focus:border-transparent"
                    >
                      <option value="">Seleccionar tipo</option>
                      <option value="Nacional">Nacional</option>
                      <option value="Estatal">Estatal</option>
                      <option value="Municipal">Municipal</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Categoría de Negocio
                    </label>
                    <select
                      value={formData.categoriaNegocioId || ''}
                      onChange={(e) => setFormData({ ...formData, categoriaNegocioId: e.target.value ? parseInt(e.target.value) : null })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2B5BA6] focus:border-transparent"
                    >
                      <option value="">Todas las categorías</option>
                      {categorias.map(cat => (
                        <option key={cat.id} value={cat.id}>{cat.nombre}</option>
                      ))}
                    </select>
                  </div>
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

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Requisitos
                  </label>
                  <textarea
                    rows="3"
                    value={formData.requisitos}
                    onChange={(e) => setFormData({ ...formData, requisitos: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2B5BA6] focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Beneficios
                  </label>
                  <textarea
                    rows="3"
                    value={formData.beneficios}
                    onChange={(e) => setFormData({ ...formData, beneficios: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2B5BA6] focus:border-transparent"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Fecha de Inicio
                    </label>
                    <input
                      type="date"
                      value={formData.fechaInicio}
                      onChange={(e) => setFormData({ ...formData, fechaInicio: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2B5BA6] focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Fecha de Cierre
                    </label>
                    <input
                      type="date"
                      value={formData.fechaCierre}
                      onChange={(e) => setFormData({ ...formData, fechaCierre: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2B5BA6] focus:border-transparent"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Monto de Apoyo
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.montoApoyo}
                    onChange={(e) => setFormData({ ...formData, montoApoyo: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2B5BA6] focus:border-transparent"
                    placeholder="0.00"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Link de Información
                  </label>
                  <input
                    type="url"
                    value={formData.linkInformacion}
                    onChange={(e) => setFormData({ ...formData, linkInformacion: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2B5BA6] focus:border-transparent"
                    placeholder="https://"
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
                    {modalMode === 'create' ? 'Crear Programa' : 'Guardar Cambios'}
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

export default Programas;