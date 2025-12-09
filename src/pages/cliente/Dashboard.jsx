import { useState, useEffect } from 'react';
import Layout from '../../components/common/Layout';
import { dashboardService } from '../../services/dashboardService';
import { 
  Building2, 
  FileText, 
  ClipboardList, 
  GraduationCap,
  TrendingUp,
  Calendar,
  CheckCircle,
  Clock,
  AlertCircle
} from 'lucide-react';
import { toast } from 'react-hot-toast';

const ClienteDashboard = () => {
  const [estadisticas, setEstadisticas] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    cargarEstadisticas();
  }, []);

  const cargarEstadisticas = async () => {
    try {
      setLoading(true);
      const response = await dashboardService.getEstadisticasCliente();
      setEstadisticas(response.data);
    } catch (error) {
      toast.error('Error al cargar estadísticas');
    } finally {
      setLoading(false);
    }
  };

  const estadisticasCards = [
    {
      titulo: 'Mis Negocios',
      valor: estadisticas?.misNegocios || 0,
      icono: Building2,
      color: 'bg-blue-500',
      bgLight: 'bg-blue-100'
    },
    {
      titulo: 'Mis Postulaciones',
      valor: estadisticas?.misPostulaciones || 0,
      icono: ClipboardList,
      color: 'bg-purple-500',
      bgLight: 'bg-purple-100'
    },
    {
      titulo: 'Postulaciones Aprobadas',
      valor: estadisticas?.postulacionesAprobadas || 0,
      icono: CheckCircle,
      color: 'bg-green-500',
      bgLight: 'bg-green-100'
    },
    {
      titulo: 'Cursos Inscritos',
      valor: estadisticas?.misCursos || 0,
      icono: GraduationCap,
      color: 'bg-indigo-500',
      bgLight: 'bg-indigo-100'
    }
  ];

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
          <h1 className="text-3xl font-bold text-gray-900">Bienvenido a CAPYME</h1>
          <p className="text-gray-600 mt-1">Gestiona tus negocios y accede a programas gubernamentales</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {estadisticasCards.map((stat, index) => {
            const Icon = stat.icono;
            return (
              <div key={index} className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 font-medium">{stat.titulo}</p>
                    <p className="text-3xl font-bold text-gray-900 mt-2">{stat.valor}</p>
                  </div>
                  <div className={`${stat.bgLight} p-3 rounded-full`}>
                    <Icon className={`w-8 h-8 ${stat.color.replace('bg-', 'text-')}`} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-gradient-to-br from-[#2B5BA6] to-[#4A7BC8] rounded-lg shadow-lg p-6 text-white">
            <FileText className="w-12 h-12 mb-4 opacity-80" />
            <h2 className="text-2xl font-bold mb-2">Programas Disponibles</h2>
            <p className="text-blue-100 mb-4">
              Descubre programas gubernamentales diseñados para impulsar tu negocio
            </p>
            <a
              href="/cliente/programas"
              className="inline-block px-6 py-2 bg-white text-[#2B5BA6] rounded-lg font-medium hover:bg-gray-100 transition-colors"
            >
              Explorar Programas
            </a>
          </div>

          <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg shadow-lg p-6 text-white">
            <GraduationCap className="w-12 h-12 mb-4 opacity-80" />
            <h2 className="text-2xl font-bold mb-2">Cursos de Capacitación</h2>
            <p className="text-indigo-100 mb-4">
              Accede a cursos especializados para fortalecer tus habilidades empresariales
            </p>
            <a
              href="/cliente/cursos"
              className="inline-block px-6 py-2 bg-white text-indigo-600 rounded-lg font-medium hover:bg-gray-100 transition-colors"
            >
              Ver Cursos
            </a>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Acciones Rápidas</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <a
              href="/cliente/mis-negocios"
              className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Building2 className="w-6 h-6 text-[#2B5BA6]" />
              <div>
                <p className="font-medium text-gray-900">Gestionar Negocios</p>
                <p className="text-sm text-gray-500">Administra tu información empresarial</p>
              </div>
            </a>

            <a
              href="/cliente/postulaciones"
              className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <ClipboardList className="w-6 h-6 text-purple-600" />
              <div>
                <p className="font-medium text-gray-900">Mis Postulaciones</p>
                <p className="text-sm text-gray-500">Revisa el estado de tus solicitudes</p>
              </div>
            </a>

            <a
              href="/cliente/financiamiento"
              className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <TrendingUp className="w-6 h-6 text-green-600" />
              <div>
                <p className="font-medium text-gray-900">Financiamiento</p>
                <p className="text-sm text-gray-500">Solicita apoyo financiero</p>
              </div>
            </a>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ClienteDashboard;