import { useState, useEffect } from 'react';
import Layout from '../components/common/Layout';
import { dashboardService } from '../services/dashboardService';
import { 
  Building2, 
  Users, 
  FileText, 
  ClipboardList, 
  GraduationCap,
  TrendingUp,
  Calendar,
  CheckCircle
} from 'lucide-react';
import { toast } from 'react-hot-toast';

const Dashboard = () => {
  const [estadisticas, setEstadisticas] = useState(null);
  const [negociosPorCategoria, setNegociosPorCategoria] = useState([]);
  const [postulacionesPorEstado, setPostulacionesPorEstado] = useState([]);
  const [ultimosNegocios, setUltimosNegocios] = useState([]);
  const [ultimasPostulaciones, setUltimasPostulaciones] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      setLoading(true);
      const [stats, categorias, estados, negocios, postulaciones] = await Promise.all([
        dashboardService.getEstadisticas(),
        dashboardService.getNegociosPorCategoria(),
        dashboardService.getPostulacionesPorEstado(),
        dashboardService.getUltimosNegocios(5),
        dashboardService.getUltimasPostulaciones(5)
      ]);

      setEstadisticas(stats.data);
      setNegociosPorCategoria(categorias.data);
      setPostulacionesPorEstado(estados.data);
      setUltimosNegocios(negocios.data);
      setUltimasPostulaciones(postulaciones.data);
    } catch (error) {
      toast.error('Error al cargar el dashboard');
    } finally {
      setLoading(false);
    }
  };

  const estadisticasCards = [
    {
      titulo: 'Negocios Activos',
      valor: estadisticas?.totalNegocios || 0,
      icono: Building2,
      color: 'bg-blue-500',
      bgLight: 'bg-blue-100'
    },
    {
      titulo: 'Clientes',
      valor: estadisticas?.totalClientes || 0,
      icono: Users,
      color: 'bg-green-500',
      bgLight: 'bg-green-100'
    },
    {
      titulo: 'Programas Activos',
      valor: estadisticas?.totalProgramas || 0,
      icono: FileText,
      color: 'bg-purple-500',
      bgLight: 'bg-purple-100'
    },
    {
      titulo: 'Postulaciones Pendientes',
      valor: estadisticas?.postulacionesPendientes || 0,
      icono: ClipboardList,
      color: 'bg-orange-500',
      bgLight: 'bg-orange-100'
    },
    {
      titulo: 'Postulaciones Aprobadas',
      valor: estadisticas?.postulacionesAprobadas || 0,
      icono: CheckCircle,
      color: 'bg-teal-500',
      bgLight: 'bg-teal-100'
    },
    {
      titulo: 'Cursos Disponibles',
      valor: estadisticas?.cursosDisponibles || 0,
      icono: GraduationCap,
      color: 'bg-indigo-500',
      bgLight: 'bg-indigo-100'
    }
  ];

  const getEstadoColor = (estado) => {
    const colores = {
      pendiente: 'bg-yellow-100 text-yellow-800',
      en_revision: 'bg-blue-100 text-blue-800',
      aprobada: 'bg-green-100 text-green-800',
      rechazada: 'bg-red-100 text-red-800',
      completada: 'bg-purple-100 text-purple-800'
    };
    return colores[estado] || 'bg-gray-100 text-gray-800';
  };

  const formatearEstado = (estado) => {
    const estados = {
      pendiente: 'Pendiente',
      en_revision: 'En Revisión',
      aprobada: 'Aprobada',
      rechazada: 'Rechazada',
      completada: 'Completada'
    };
    return estados[estado] || estado;
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
            <h1 className="text-3xl font-bold text-gray-900">Dashboard Administrativo</h1>
            <p className="text-gray-600 mt-1">Resumen general del sistema</p>
          </div>
          <button
            onClick={cargarDatos}
            className="px-4 py-2 bg-[#2B5BA6] text-white rounded-lg hover:bg-[#1E3A5F] transition-colors"
          >
            Actualizar
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {estadisticasCards.map((stat, index) => {
            const Icon = stat.icono;
            return (
              <div key={index} className="bg-white rounded-lg shadow p-6">
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
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Negocios por Categoría</h2>
              <TrendingUp className="w-5 h-5 text-gray-400" />
            </div>
            <div className="space-y-3">
              {negociosPorCategoria.length > 0 ? (
                negociosPorCategoria.map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm font-medium text-gray-700">{item.categoria}</span>
                    <span className="text-sm font-bold text-[#2B5BA6]">{item.total}</span>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500 text-center py-4">No hay datos disponibles</p>
              )}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Postulaciones por Estado</h2>
              <ClipboardList className="w-5 h-5 text-gray-400" />
            </div>
            <div className="space-y-3">
              {postulacionesPorEstado.length > 0 ? (
                postulacionesPorEstado.map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className={`text-xs font-medium px-2 py-1 rounded-full ${getEstadoColor(item.estado)}`}>
                      {formatearEstado(item.estado)}
                    </span>
                    <span className="text-sm font-bold text-gray-900">{item.total}</span>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500 text-center py-4">No hay datos disponibles</p>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Últimos Negocios Registrados</h2>
              <Calendar className="w-5 h-5 text-gray-400" />
            </div>
            <div className="space-y-3">
              {ultimosNegocios.length > 0 ? (
                ultimosNegocios.map((negocio) => (
                  <div key={negocio.id} className="flex items-start justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">{negocio.nombreNegocio}</p>
                      <p className="text-xs text-gray-500 mt-1">{negocio.categoria?.nombre}</p>
                      <p className="text-xs text-gray-400 mt-1">
                        {new Date(negocio.fechaRegistro).toLocaleDateString()}
                      </p>
                    </div>
                    <Building2 className="w-5 h-5 text-[#2B5BA6]" />
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500 text-center py-4">No hay negocios registrados</p>
              )}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Últimas Postulaciones</h2>
              <Calendar className="w-5 h-5 text-gray-400" />
            </div>
            <div className="space-y-3">
              {ultimasPostulaciones.length > 0 ? (
                ultimasPostulaciones.map((postulacion) => (
                  <div key={postulacion.id} className="flex items-start justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">{postulacion.programa?.nombre}</p>
                      <p className="text-xs text-gray-500 mt-1">{postulacion.negocio?.nombreNegocio}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${getEstadoColor(postulacion.estado)}`}>
                          {formatearEstado(postulacion.estado)}
                        </span>
                        <span className="text-xs text-gray-400">
                          {new Date(postulacion.fechaPostulacion).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500 text-center py-4">No hay postulaciones</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;