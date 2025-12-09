import { useState, useEffect } from 'react';
import Layout from '../../components/common/Layout';
import { negociosService } from '../../services/negociosService';
import { 
  Building2, 
  Plus, 
  Edit, 
  Trash2,
  X,
  MapPin,
  Phone,
  Mail,
  Users
} from 'lucide-react';
import { toast } from 'react-hot-toast';

const MisNegocios = () => {
  const [negocios, setNegocios] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('create');
  const [selectedNegocio, setSelectedNegocio] = useState(null);

  const [formData, setFormData] = useState({
    nombreNegocio: '',
    categoriaId: '',
    rfc: '',
    razonSocial: '',
    giroComercial: '',
    direccion: '',
    ciudad: '',
    estado: '',
    codigoPostal: '',
    telefonoNegocio: '',
    emailNegocio: '',
    sitioWeb: '',
    numeroEmpleados: 0,
    anioFundacion: '',
    descripcion: '',
    activo: true
  });

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      setLoading(true);
      const [negociosRes, categoriasRes] = await Promise.all([
        negociosService.getMisNegocios(),
        fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000/api'}/categorias`).then(r => r.json())
      ]);
      setNegocios(negociosRes.data);
      setCategorias(categoriasRes.data);
    } catch (error) {
      toast.error('Error al cargar negocios');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (mode, negocio = null) => {
    setModalMode(mode);
    setSelectedNegocio(negocio);
    if (mode === 'edit' && negocio) {
      setFormData({
        nombreNegocio: negocio.nombreNegocio,
        categoriaId: negocio.categoriaId,
        rfc: negocio.rfc || '',
        razonSocial: negocio.razonSocial || '',
        giroComercial: negocio.giroComercial || '',
        direccion: negocio.direccion || '',
        ciudad: negocio.ciudad || '',
        estado: negocio.estado || '',
        codigoPostal: negocio.codigoPostal || '',
        telefonoNegocio: negocio.telefonoNegocio || '',
        emailNegocio: negocio.emailNegocio || '',
        sitioWeb: negocio.sitioWeb || '',
        numeroEmpleados: negocio.numeroEmpleados || 0,
        anioFundacion: negocio.anioFundacion || '',
        descripcion: negocio.descripcion || '',
        activo: negocio.activo
      });
    } else {
      setFormData({
        nombreNegocio: '',
        categoriaId: '',
        rfc: '',
        razonSocial: '',
        giroComercial: '',
        direccion: '',
        ciudad: '',
        estado: '',
        codigoPostal: '',
        telefonoNegocio: '',
        emailNegocio: '',
        sitioWeb: '',
        numeroEmpleados: 0,
        anioFundacion: '',
        descripcion: '',
        activo: true
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedNegocio(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (modalMode === 'create') {
        await negociosService.create(formData);
        toast.success('Negocio creado exitosamente');
      } else {
        await negociosService.update(selectedNegocio.id, formData);
        toast.success('Negocio actualizado exitosamente');
      }
      handleCloseModal();
      cargarDatos();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error al guardar negocio');
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
            <h1 className="text-3xl font-bold text-gray-900">Mis Negocios</h1>
            <p className="text-gray-600 mt-1">Administra la información de tus negocios</p>
          </div>
          <button
            onClick={() => handleOpenModal('create')}
            className="flex items-center gap-2 px-4 py-2 bg-[#2B5BA6] text-white rounded-lg hover:bg-[#1E3A5F] transition-colors"
          >
            <Plus className="w-5 h-5" />
            Agregar Negocio
          </button>
        </div>

        {negocios.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {negocios.map((negocio) => (
              <div key={negocio.id} className="bg-white border border-gray-200 rounded-lg hover:shadow-lg transition-shadow">
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">{negocio.nombreNegocio}</h3>
                      <span className="inline-block px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded">
                        {negocio.categoria?.nombre}
                      </span>
                    </div>
                  </div>

                  {negocio.descripcion && (
                    <p className="text-sm text-gray-600 mb-4 line-clamp-2">{negocio.descripcion}</p>
                  )}

                  <div className="space-y-2 mb-4">
                    {negocio.ciudad && negocio.estado && (
                      <div className="flex items-center gap-2 text-sm text-gray-700">
                        <MapPin className="w-4 h-4 text-gray-400" />
                        {negocio.ciudad}, {negocio.estado}
                      </div>
                    )}

                    {negocio.telefonoNegocio && (
                      <div className="flex items-center gap-2 text-sm text-gray-700">
                        <Phone className="w-4 h-4 text-gray-400" />
                        {negocio.telefonoNegocio}
                      </div>
                    )}

                    {negocio.emailNegocio && (
                      <div className="flex items-center gap-2 text-sm text-gray-700">
                        <Mail className="w-4 h-4 text-gray-400" />
                        {negocio.emailNegocio}
                      </div>
                    )}

                    {negocio.numeroEmpleados > 0 && (
                      <div className="flex items-center gap-2 text-sm text-gray-700">
                        <Users className="w-4 h-4 text-gray-400" />
                        {negocio.numeroEmpleados} empleados
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2 pt-4 border-t border-gray-200">
                    <button
                      onClick={() => handleOpenModal('edit', negocio)}
                      className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                    >
                      <Edit className="w-4 h-4" />
                      Editar
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <Building2 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No tienes negocios registrados</h3>
            <p className="text-gray-500 mb-6">Comienza agregando tu primer negocio para acceder a programas y beneficios</p>
            <button
              onClick={() => handleOpenModal('create')}
              className="inline-flex items-center gap-2 px-6 py-3 bg-[#2B5BA6] text-white rounded-lg hover:bg-[#1E3A5F] transition-colors"
            >
              <Plus className="w-5 h-5" />
              Agregar Mi Primer Negocio
            </button>
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">
                {modalMode === 'create' ? 'Agregar Negocio' : 'Editar Negocio'}
              </h2>
              <button onClick={handleCloseModal} className="text-gray-400 hover:text-gray-600">
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nombre del Negocio
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.nombreNegocio}
                    onChange={(e) => setFormData({ ...formData, nombreNegocio: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2B5BA6] focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Categoría
                  </label>
                  <select
                    required
                    value={formData.categoriaId}
                    onChange={(e) => setFormData({ ...formData, categoriaId: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2B5BA6] focus:border-transparent"
                  >
                    <option value="">Seleccionar categoría</option>
                    {categorias.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.nombre}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    RFC
                  </label>
                  <input
                    type="text"
                    value={formData.rfc}
                    onChange={(e) => setFormData({ ...formData, rfc: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2B5BA6] focus:border-transparent"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Dirección
                  </label>
                  <input
                    type="text"
                    value={formData.direccion}
                    onChange={(e) => setFormData({ ...formData, direccion: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2B5BA6] focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Ciudad
                  </label>
                  <input
                    type="text"
                    value={formData.ciudad}
                    onChange={(e) => setFormData({ ...formData, ciudad: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2B5BA6] focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Estado
                  </label>
                  <input
                    type="text"
                    value={formData.estado}
                    onChange={(e) => setFormData({ ...formData, estado: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2B5BA6] focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Teléfono
                  </label>
                  <input
                    type="tel"
                    value={formData.telefonoNegocio}
                    onChange={(e) => setFormData({ ...formData, telefonoNegocio: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2B5BA6] focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    value={formData.emailNegocio}
                    onChange={(e) => setFormData({ ...formData, emailNegocio: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2B5BA6] focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Número de Empleados
                  </label>
                  <input
                    type="number"
                    value={formData.numeroEmpleados}
                    onChange={(e) => setFormData({ ...formData, numeroEmpleados: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2B5BA6] focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Año de Fundación
                  </label>
                  <input
                    type="number"
                    value={formData.anioFundacion}
                    onChange={(e) => setFormData({ ...formData, anioFundacion: parseInt(e.target.value) || '' })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2B5BA6] focus:border-transparent"
                  />
                </div>

                <div className="col-span-2">
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
                  {modalMode === 'create' ? 'Crear Negocio' : 'Guardar Cambios'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default MisNegocios;