import { useState, useEffect } from 'react';
import Layout from '../../components/common/Layout';
import api from '../../services/axios';
import { 
  Link2, 
  Search,
  ExternalLink,
  Video,
  FileText,
  DollarSign,
  Filter
} from 'lucide-react';
import { toast } from 'react-hot-toast';

const ClienteRecursos = () => {
  const [recursos, setRecursos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterTipo, setFilterTipo] = useState('');
  const [filterCategoria, setFilterCategoria] = useState('');

  useEffect(() => {
    cargarRecursos();
  }, [filterTipo, filterCategoria]);

  const cargarRecursos = async () => {
    try {
      setLoading(true);
      const params = { activo: true };
      if (filterTipo) params.tipo = filterTipo;
      if (filterCategoria) params.categoria = filterCategoria;

      const response = await api.get('/enlaces', { params });
      setRecursos(response.data.data);
    } catch (error) {
      toast.error('Error al cargar recursos');
    } finally {
      setLoading(false);
    }
  };

  const recursosFiltrados = recursos.filter(recurso =>
    recurso.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
    recurso.descripcion?.toLowerCase().includes(searchTerm.toLowerCase())
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

  const categorias = [...new Set(recursos.map(r => r.categoria).filter(Boolean))];

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
          <h1 className="text-3xl font-bold text-gray-900">Recursos Útiles</h1>
          <p className="text-gray-600 mt-1">Accede a información, videos y herramientas para tu negocio</p>
        </div>

        <div className="bg-gradient-to-br from-[#2B5BA6] to-[#4A7BC8] rounded-lg shadow-lg p-6 text-white">
          <Link2 className="w-12 h-12 mb-4 opacity-80" />
          <h2 className="text-2xl font-bold mb-2">Centro de Recursos</h2>
          <p className="text-blue-100">
            Encuentra videos educativos, opciones de financiamiento, documentos útiles y más recursos para impulsar tu negocio.
          </p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="md:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Buscar recursos..."
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
                <option value="video">Videos</option>
                <option value="financiamiento">Financiamiento</option>
                <option value="documento">Documentos</option>
                <option value="otro">Otros</option>
              </select>
            </div>
            <div>
              <select
                value={filterCategoria}
                onChange={(e) => setFilterCategoria(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2B5BA6] focus:border-transparent"
              >
                <option value="">Todas las categorías</option>
                {categorias.map((cat, index) => (
                  <option key={index} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
          </div>

          {recursosFiltrados.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {recursosFiltrados.map((recurso) => (
                <div key={recurso.id} className="bg-white border border-gray-200 rounded-lg hover:shadow-lg transition-shadow">
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">{recurso.titulo}</h3>
                        <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded ${getTipoColor(recurso.tipo)}`}>
                          {getTipoIcon(recurso.tipo)}
                          {recurso.tipo.charAt(0).toUpperCase() + recurso.tipo.slice(1)}
                        </span>
                      </div>
                    </div>

                    <p className="text-sm text-gray-600 mb-4 line-clamp-3">
                      {recurso.descripcion || 'Sin descripción'}
                    </p>

                    {recurso.categoria && (
                      <p className="text-sm text-gray-500 mb-4">
                        <span className="font-medium">{recurso.categoria}</span>
                      </p>
                    )}

                    <a
                      href={recurso.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2 px-4 py-2 bg-[#2B5BA6] text-white rounded-lg hover:bg-[#1E3A5F] transition-colors"
                    >
                      <ExternalLink className="w-4 h-4" />
                      Ver Recurso
                    </a>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Link2 className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-500">No se encontraron recursos disponibles</p>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default ClienteRecursos;