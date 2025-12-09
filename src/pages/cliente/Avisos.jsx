import { useState, useEffect } from 'react';
import Layout from '../../components/common/Layout';
import api from '../../services/axios';
import { 
  BellRing, 
  Search,
  AlertCircle,
  Info,
  Calendar as CalendarIcon,
  ExternalLink
} from 'lucide-react';
import { toast } from 'react-hot-toast';

const ClienteAvisos = () => {
  const [avisos, setAvisos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterTipo, setFilterTipo] = useState('');

  useEffect(() => {
    cargarAvisos();
  }, [filterTipo]);

  const cargarAvisos = async () => {
    try {
      setLoading(true);
      const params = { activo: true };
      if (filterTipo) params.tipo = filterTipo;

      const response = await api.get('/avisos', { params });
      setAvisos(response.data.data);
    } catch (error) {
      toast.error('Error al cargar avisos');
    } finally {
      setLoading(false);
    }
  };

  const avisosFiltrados = avisos.filter(aviso =>
    aviso.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
    aviso.contenido.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Avisos y Notificaciones</h1>
          <p className="text-gray-600 mt-1">Mantente informado sobre novedades y eventos importantes</p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="md:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Buscar avisos..."
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
          </div>

          <div className="space-y-4">
            {avisosFiltrados.length > 0 ? (
              avisosFiltrados.map((aviso) => (
                <div key={aviso.id} className={`border-l-4 rounded-lg p-4 ${getTipoColor(aviso.tipo)}`}>
                  <div className="flex items-start gap-3">
                    <div className="mt-1">
                      {getTipoIcon(aviso.tipo)}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">{aviso.titulo}</h3>
                      <p className="text-sm text-gray-700 mb-3">{aviso.contenido}</p>
                      
                      <div className="flex items-center flex-wrap gap-4 text-xs text-gray-600">
                        <span className="flex items-center gap-1">
                          <CalendarIcon className="w-3 h-3" />
                          Publicado: {formatDate(aviso.fechaPublicacion)}
                        </span>
                        {aviso.fechaExpiracion && (
                          <span className="flex items-center gap-1">
                            <CalendarIcon className="w-3 h-3" />
                            Expira: {formatDate(aviso.fechaExpiracion)}
                          </span>
                        )}
                        {aviso.linkExterno && (
                          <a 
                            href={aviso.linkExterno} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 text-[#2B5BA6] hover:underline font-medium"
                          >
                            <ExternalLink className="w-3 h-3" />
                            Más información
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12">
                <BellRing className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-500">No hay avisos disponibles</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ClienteAvisos;