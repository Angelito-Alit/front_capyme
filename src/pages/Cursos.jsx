import { useState, useEffect } from 'react';
import Layout from '../components/common/Layout';
import { cursosService } from '../services/cursosService';
import { 
  GraduationCap, 
  Plus, 
  Search, 
  Edit, 
  Trash2,
  X,
  Calendar,
  Users,
  Clock,
  DollarSign,
  Monitor,
  MapPin,
  Link as LinkIcon
} from 'lucide-react';
import { toast } from 'react-hot-toast';

const Cursos = () => {
  const [cursos, setCursos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showInscritosModal, setShowInscritosModal] = useState(false);
  const [modalMode, setModalMode] = useState('create');
  const [selectedCurso, setSelectedCurso] = useState(null);
  const [inscritos, setInscritos] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterModalidad, setFilterModalidad] = useState('');
  const [filterEstado, setFilterEstado] = useState('');

  const [formData, setFormData] = useState({
    titulo: '',
    descripcion: '',
    instructor: '',
    duracionHoras: '',
    modalidad: 'online',
    fechaInicio: '',
    fechaFin: '',
    cupoMaximo: '',
    linkInscripcion: '',
    linkMaterial: '',
    costo: 0,
    activo: true
  });

  useEffect(() => {
    cargarCursos();
  }, [filterModalidad, filterEstado]);

  const cargarCursos = async () => {
    try {
      setLoading(true);
      const params = {};
      if (filterModalidad) params.modalidad = filterModalidad;
      if (filterEstado !== '') params.activo = filterEstado;

      const response = await cursosService.getAll(params);
      setCursos(response.data);
    } catch (error) {
      toast.error('Error al cargar cursos');
    } finally {
      setLoading(false);
    }
  };

  const cargarInscritos = async (cursoId) => {
    try {
      const response = await cursosService.getInscritos(cursoId);
      setInscritos(response.data);
      setShowInscritosModal(true);
    } catch (error) {
      toast.error('Error al cargar inscritos');
    }
  };

  const handleOpenModal = (mode, curso = null) => {
    setModalMode(mode);
    setSelectedCurso(curso);
    if (mode === 'edit' && curso) {
      setFormData({
        titulo: curso.titulo,
        descripcion: curso.descripcion || '',
        instructor: curso.instructor || '',
        duracionHoras: curso.duracionHoras || '',
        modalidad: curso.modalidad || 'online',
        fechaInicio: curso.fechaInicio ? curso.fechaInicio.split('T')[0] : '',
        fechaFin: curso.fechaFin ? curso.fechaFin.split('T')[0] : '',
        cupoMaximo: curso.cupoMaximo || '',
        linkInscripcion: curso.linkInscripcion || '',
        linkMaterial: curso.linkMaterial || '',
        costo: curso.costo || 0,
        activo: curso.activo
      });
    } else {
      setFormData({
        titulo: '',
        descripcion: '',
        instructor: '',
        duracionHoras: '',
        modalidad: 'online',
        fechaInicio: '',
        fechaFin: '',
        cupoMaximo: '',
        linkInscripcion: '',
        linkMaterial: '',
        costo: 0,
        activo: true
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedCurso(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const dataToSend = {
        ...formData,
        duracionHoras: formData.duracionHoras ? parseInt(formData.duracionHoras) : null,
        cupoMaximo: formData.cupoMaximo ? parseInt(formData.cupoMaximo) : null,
        costo: parseFloat(formData.costo) || 0
      };

      if (modalMode === 'create') {
        await cursosService.create(dataToSend);
        toast.success('Curso creado exitosamente');
      } else {
        await cursosService.update(selectedCurso.id, dataToSend);
        toast.success('Curso actualizado exitosamente');
      }
      handleCloseModal();
      cargarCursos();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error al guardar curso');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Estás seguro de eliminar este curso?')) {
      try {
        await cursosService.delete(id);
        toast.success('Curso eliminado exitosamente');
        cargarCursos();
      } catch (error) {
        toast.error('Error al eliminar curso');
      }
    }
  };

  const cursosFiltrados = cursos.filter(curso =>
    curso.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
    curso.instructor?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getModalidadIcon = (modalidad) => {
    switch (modalidad) {
      case 'online':
        return <Monitor className="w-4 h-4" />;
      case 'presencial':
        return <MapPin className="w-4 h-4" />;
      default:
        return <Monitor className="w-4 h-4" />;
    }
  };

  const getModalidadColor = (modalidad) => {
    switch (modalidad) {
      case 'online':
        return 'bg-blue-100 text-blue-800';
      case 'presencial':
        return 'bg-green-100 text-green-800';
      case 'hibrido':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
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
            <h1 className="text-3xl font-bold text-gray-900">Gestión de Cursos</h1>
            <p className="text-gray-600 mt-1">Administra cursos de incubación disponibles</p>
          </div>
          <button
            onClick={() => handleOpenModal('create')}
            className="flex items-center gap-2 px-4 py-2 bg-[#2B5BA6] text-white rounded-lg hover:bg-[#1E3A5F] transition-colors"
          >
            <Plus className="w-5 h-5" />
            Nuevo Curso
          </button>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="md:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Buscar curso o instructor..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2B5BA6] focus:border-transparent"
                />
              </div>
            </div>
            <div>
              <select
                value={filterModalidad}
                onChange={(e) => setFilterModalidad(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2B5BA6] focus:border-transparent"
              >
                <option value="">Todas las modalidades</option>
                <option value="online">Online</option>
                <option value="presencial">Presencial</option>
                <option value="hibrido">Híbrido</option>
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
            {cursosFiltrados.length > 0 ? (
              cursosFiltrados.map((curso) => (
                <div key={curso.id} className="bg-white border border-gray-200 rounded-lg hover:shadow-lg transition-shadow">
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">{curso.titulo}</h3>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded ${getModalidadColor(curso.modalidad)}`}>
                            {getModalidadIcon(curso.modalidad)}
                            {curso.modalidad.charAt(0).toUpperCase() + curso.modalidad.slice(1)}
                          </span>
                          {curso.costo === 0 ? (
                            <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded">
                              Gratis
                            </span>
                          ) : (
                            <span className="px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 rounded">
                              {formatCurrency(curso.costo)}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                      {curso.descripcion || 'Sin descripción'}
                    </p>

                    <div className="space-y-2 mb-4">
                      {curso.instructor && (
                        <div className="flex items-center gap-2 text-sm text-gray-700">
                          <Users className="w-4 h-4 text-gray-400" />
                          {curso.instructor}
                        </div>
                      )}

                      {curso.duracionHoras && (
                        <div className="flex items-center gap-2 text-sm text-gray-700">
                          <Clock className="w-4 h-4 text-gray-400" />
                          {curso.duracionHoras} horas
                        </div>
                      )}

                      {curso.fechaInicio && (
                        <div className="flex items-center gap-2 text-sm text-gray-700">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          {formatDate(curso.fechaInicio)}
                        </div>
                      )}

                      {curso.cupoMaximo && (
                        <div className="text-sm">
                          <span className="text-gray-600">Cupo: </span>
                          <span className="font-medium text-gray-900">
                            {curso.inscritosCount || 0}/{curso.cupoMaximo}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="space-y-2 pt-4 border-t border-gray-200">
                      <button
                        onClick={() => cargarInscritos(curso.id)}
                        className="w-full flex items-center justify-center gap-2 px-3 py-2 text-sm text-[#2B5BA6] bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                      >
                        <Users className="w-4 h-4" />
                        Ver Inscritos ({curso.inscritosCount || 0})
                      </button>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleOpenModal('edit', curso)}
                          className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                        >
                          <Edit className="w-4 h-4" />
                          Editar
                        </button>
                        <button
                          onClick={() => handleDelete(curso.id)}
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
                <GraduationCap className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-500">No se encontraron cursos</p>
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
                {modalMode === 'create' ? 'Nuevo Curso' : 'Editar Curso'}
              </h2>
              <button onClick={handleCloseModal} className="text-gray-400 hover:text-gray-600">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Título del Curso
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
                      Instructor
                    </label>
                    <input
                      type="text"
                      value={formData.instructor}
                      onChange={(e) => setFormData({ ...formData, instructor: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2B5BA6] focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Duración (horas)
                    </label>
                    <input
                      type="number"
                      value={formData.duracionHoras}
                      onChange={(e) => setFormData({ ...formData, duracionHoras: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2B5BA6] focus:border-transparent"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Modalidad
                    </label>
                    <select
                      value={formData.modalidad}
                      onChange={(e) => setFormData({ ...formData, modalidad: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2B5BA6] focus:border-transparent"
                    >
                      <option value="online">Online</option>
                      <option value="presencial">Presencial</option>
                      <option value="hibrido">Híbrido</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Cupo Máximo
                    </label>
                    <input
                      type="number"
                      value={formData.cupoMaximo}
                      onChange={(e) => setFormData({ ...formData, cupoMaximo: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2B5BA6] focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Costo
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.costo}
                      onChange={(e) => setFormData({ ...formData, costo: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2B5BA6] focus:border-transparent"
                    />
                  </div>
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
                      Fecha de Fin
                    </label>
                    <input
                      type="date"
                      value={formData.fechaFin}
                      onChange={(e) => setFormData({ ...formData, fechaFin: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2B5BA6] focus:border-transparent"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Link de Inscripción
                  </label>
                  <input
                    type="url"
                    value={formData.linkInscripcion}
                    onChange={(e) => setFormData({ ...formData, linkInscripcion: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2B5BA6] focus:border-transparent"
                    placeholder="https://"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Link de Material
                  </label>
                  <input
                    type="url"
                    value={formData.linkMaterial}
                    onChange={(e) => setFormData({ ...formData, linkMaterial: e.target.value })}
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
                    {modalMode === 'create' ? 'Crear Curso' : 'Guardar Cambios'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {showInscritosModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">
                Inscritos en el Curso
              </h2>
              <button onClick={() => setShowInscritosModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6">
              {inscritos.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Usuario</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Teléfono</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fecha</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {inscritos.map((inscrito) => (
                        <tr key={inscrito.id}>
                          <td className="px-4 py-3 text-sm text-gray-900">
                            {inscrito.usuario.nombre} {inscrito.usuario.apellido}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-600">{inscrito.usuario.email}</td>
                          <td className="px-4 py-3 text-sm text-gray-600">{inscrito.usuario.telefono || 'N/A'}</td>
                          <td className="px-4 py-3 text-sm">
                            <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">
                              {inscrito.estado}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-600">
                            {formatDate(inscrito.fechaInscripcion)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-8">
                  <Users className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-500">No hay inscritos en este curso</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default Cursos;