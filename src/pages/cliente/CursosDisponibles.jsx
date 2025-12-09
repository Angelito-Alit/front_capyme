import { useState, useEffect } from 'react';
import Layout from '../../components/common/Layout';
import { cursosService } from '../../services/cursosService';
import { 
  GraduationCap, 
  Search,
  Calendar,
  Clock,
  DollarSign,
  Monitor,
  MapPin,
  Users,
  CheckCircle
} from 'lucide-react';
import { toast } from 'react-hot-toast';

const CursosDisponibles = () => {
  const [cursos, setCursos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterModalidad, setFilterModalidad] = useState('');

  useEffect(() => {
    cargarCursos();
  }, [filterModalidad]);

  const cargarCursos = async () => {
    try {
      setLoading(true);
      const params = { activo: true };
      if (filterModalidad) params.modalidad = filterModalidad;

      const response = await cursosService.getAll(params);
      setCursos(response.data);
    } catch (error) {
      toast.error('Error al cargar cursos');
    } finally {
      setLoading(false);
    }
  };

  const handleInscribir = async (cursoId) => {
    try {
      await cursosService.inscribir(cursoId);
      toast.success('Inscripción exitosa');
      cargarCursos();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error al inscribirse');
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
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Cursos Disponibles</h1>
          <p className="text-gray-600 mt-1">Capacítate y mejora las habilidades de tu negocio</p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
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
          </div>

          {cursosFiltrados.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {cursosFiltrados.map((curso) => (
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
                          Inicia: {formatDate(curso.fechaInicio)}
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

                    <button
                      onClick={() => handleInscribir(curso.id)}
                      className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-[#2B5BA6] text-white rounded-lg hover:bg-[#1E3A5F] transition-colors"
                    >
                      <CheckCircle className="w-4 h-4" />
                      Inscribirme
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <GraduationCap className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-500">No se encontraron cursos disponibles</p>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default CursosDisponibles;