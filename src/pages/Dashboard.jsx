//dashboard admin y colaborador
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
  CheckCircle,
  RefreshCw,
} from 'lucide-react';
import { toast } from 'react-hot-toast';

const StatCard = ({ titulo, valor, icono: Icon, colorBg, colorIcon, colorBar }) => (
  <div style={{
    background: '#fff',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius-lg)',
    padding: '22px 24px',
    boxShadow: 'var(--shadow-sm)',
    transition: 'all 200ms ease',
    position: 'relative',
    overflow: 'hidden',
    cursor: 'default',
  }}
    onMouseEnter={e => {
      e.currentTarget.style.boxShadow = 'var(--shadow-md)';
      e.currentTarget.style.transform = 'translateY(-2px)';
    }}
    onMouseLeave={e => {
      e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
      e.currentTarget.style.transform = 'translateY(0)';
    }}
  >
    {/* Borde superior coloreado */}
    <div style={{
      position: 'absolute', top: 0, left: 0, right: 0,
      height: '3px',
      background: colorBar,
      borderRadius: 'var(--radius-lg) var(--radius-lg) 0 0',
    }} />

    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px' }}>
      <div>
        <p style={{
          fontFamily: "'DM Sans', sans-serif",
          fontSize: '13px',
          fontWeight: 500,
          color: 'var(--gray-500)',
          marginBottom: '8px',
          letterSpacing: '0.01em',
        }}>{titulo}</p>
        <p style={{
          fontFamily: "'Plus Jakarta Sans', sans-serif",
          fontSize: '32px',
          fontWeight: 800,
          color: 'var(--gray-900)',
          lineHeight: 1,
          letterSpacing: '-0.02em',
        }}>{valor}</p>
      </div>
      <div style={{
        width: '46px', height: '46px',
        borderRadius: 'var(--radius-md)',
        background: colorBg,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0,
      }}>
        <Icon style={{ width: '22px', height: '22px', color: colorIcon }} />
      </div>
    </div>
  </div>
);

const Dashboard = () => {
  const [estadisticas, setEstadisticas] = useState(null);
  const [negociosPorCategoria, setNegociosPorCategoria] = useState([]);
  const [postulacionesPorEstado, setPostulacionesPorEstado] = useState([]);
  const [ultimosNegocios, setUltimosNegocios] = useState([]);
  const [ultimasPostulaciones, setUltimasPostulaciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async (isRefresh = false) => {
    try {
      isRefresh ? setRefreshing(true) : setLoading(true);
      const [stats, categorias, estados, negocios, postulaciones] = await Promise.all([
        dashboardService.getEstadisticas(),
        dashboardService.getNegociosPorCategoria(),
        dashboardService.getPostulacionesPorEstado(),
        dashboardService.getUltimosNegocios(5),
        dashboardService.getUltimasPostulaciones(5),
      ]);

      setEstadisticas(stats.data);
      setNegociosPorCategoria(categorias.data);
      setPostulacionesPorEstado(estados.data);
      setUltimosNegocios(negocios.data);
      setUltimasPostulaciones(postulaciones.data);
    } catch {
      toast.error('Error al cargar el dashboard');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const statCards = [
    {
      titulo: 'Negocios Activos',
      valor: estadisticas?.totalNegocios ?? 0,
      icono: Building2,
      colorBg: '#EEF4FF',
      colorIcon: 'var(--capyme-blue-mid)',
      colorBar: 'linear-gradient(90deg, var(--capyme-blue-mid), var(--capyme-accent))',
    },
    {
      titulo: 'Clientes',
      valor: estadisticas?.totalClientes ?? 0,
      icono: Users,
      colorBg: '#ECFDF5',
      colorIcon: '#059669',
      colorBar: 'linear-gradient(90deg, #059669, #34D399)',
    },
    {
      titulo: 'Programas Activos',
      valor: estadisticas?.totalProgramas ?? 0,
      icono: FileText,
      colorBg: '#F5F3FF',
      colorIcon: '#7C3AED',
      colorBar: 'linear-gradient(90deg, #7C3AED, #A78BFA)',
    },
    {
      titulo: 'Post. Pendientes',
      valor: estadisticas?.postulacionesPendientes ?? 0,
      icono: ClipboardList,
      colorBg: '#FFF7ED',
      colorIcon: '#D97706',
      colorBar: 'linear-gradient(90deg, #D97706, #FCD34D)',
    },
    {
      titulo: 'Post. Aprobadas',
      valor: estadisticas?.postulacionesAprobadas ?? 0,
      icono: CheckCircle,
      colorBg: '#F0FDF4',
      colorIcon: '#16A34A',
      colorBar: 'linear-gradient(90deg, #16A34A, #4ADE80)',
    },
    {
      titulo: 'Cursos Disponibles',
      valor: estadisticas?.cursosDisponibles ?? 0,
      icono: GraduationCap,
      colorBg: '#EFF6FF',
      colorIcon: '#2563EB',
      colorBar: 'linear-gradient(90deg, #2563EB, #60A5FA)',
    },
  ];

  const estadoBadge = {
    pendiente:   { bg: '#FFFBEB', color: '#B45309', label: 'Pendiente' },
    en_revision: { bg: '#EFF6FF', color: '#1D4ED8', label: 'En Revisión' },
    aprobada:    { bg: '#ECFDF5', color: '#065F46', label: 'Aprobada' },
    rechazada:   { bg: '#FEF2F2', color: '#DC2626', label: 'Rechazada' },
    completada:  { bg: '#F5F3FF', color: '#6D28D9', label: 'Completada' },
  };

  if (loading) {
    return (
      <Layout>
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          height: '320px', flexDirection: 'column', gap: '16px',
        }}>
          <div style={{
            width: '40px', height: '40px',
            border: '3px solid var(--border)',
            borderTopColor: 'var(--capyme-blue-mid)',
            borderRadius: '50%',
            animation: 'spin 700ms linear infinite',
          }} />
          <p style={{ fontSize: '14px', color: 'var(--gray-400)', fontFamily: "'DM Sans', sans-serif" }}>
            Cargando dashboard...
          </p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>

        {/* Page header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '16px' }}>
          <div>
            <h1 style={{
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              fontSize: '26px', fontWeight: 800,
              color: 'var(--gray-900)',
              letterSpacing: '-0.02em',
              marginBottom: '4px',
            }}>Dashboard Administrativo</h1>
            <p style={{ fontSize: '14px', color: 'var(--gray-500)', fontFamily: "'DM Sans', sans-serif" }}>
              Resumen general del sistema CAPYME
            </p>
          </div>
          <button
            onClick={() => cargarDatos(true)}
            disabled={refreshing}
            style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              padding: '10px 18px',
              background: 'linear-gradient(135deg, var(--capyme-blue-mid), var(--capyme-blue))',
              color: '#fff',
              border: 'none',
              borderRadius: 'var(--radius-md)',
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              fontSize: '14px', fontWeight: 600,
              cursor: refreshing ? 'not-allowed' : 'pointer',
              opacity: refreshing ? 0.7 : 1,
              boxShadow: '0 2px 8px rgba(31,78,158,0.28)',
              transition: 'all 200ms ease',
              whiteSpace: 'nowrap',
            }}
            onMouseEnter={e => { if (!refreshing) e.currentTarget.style.transform = 'translateY(-1px)'; }}
            onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
          >
            <RefreshCw style={{
              width: '15px', height: '15px',
              animation: refreshing ? 'spin 700ms linear infinite' : 'none',
            }} />
            {refreshing ? 'Actualizando…' : 'Actualizar'}
          </button>
        </div>

        {/* Stat cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
          gap: '16px',
        }}>
          {statCards.map((s, i) => (
            <StatCard key={i} {...s} />
          ))}
        </div>

        {/* Charts row */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
          gap: '20px',
        }}>
          {/* Negocios por categoría */}
          <div style={{
            background: '#fff',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-lg)',
            boxShadow: 'var(--shadow-sm)',
            overflow: 'hidden',
          }}>
            <div style={{
              padding: '18px 24px',
              borderBottom: '1px solid var(--border)',
              display: 'flex', alignItems: 'center', gap: '10px',
            }}>
              <div style={{
                width: '32px', height: '32px',
                background: 'var(--capyme-blue-pale)',
                borderRadius: 'var(--radius-sm)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <TrendingUp style={{ width: '16px', height: '16px', color: 'var(--capyme-blue-mid)' }} />
              </div>
              <h2 style={{
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                fontSize: '15px', fontWeight: 700, color: 'var(--gray-900)',
              }}>Negocios por Categoría</h2>
            </div>
            <div style={{ padding: '20px 24px' }}>
              {negociosPorCategoria.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {negociosPorCategoria.map((item, i) => {
                    const max = Math.max(...negociosPorCategoria.map(x => x.total));
                    const pct = max > 0 ? (item.total / max) * 100 : 0;
                    return (
                      <div key={i}>
                        <div style={{
                          display: 'flex', justifyContent: 'space-between',
                          marginBottom: '6px',
                        }}>
                          <span style={{ fontSize: '13px', fontWeight: 500, color: 'var(--gray-700)' }}>
                            {item.categoria}
                          </span>
                          <span style={{
                            fontSize: '13px', fontWeight: 700,
                            color: 'var(--capyme-blue-mid)',
                          }}>{item.total}</span>
                        </div>
                        <div style={{
                          height: '6px', background: 'var(--gray-100)',
                          borderRadius: '99px', overflow: 'hidden',
                        }}>
                          <div style={{
                            height: '100%',
                            width: `${pct}%`,
                            background: 'linear-gradient(90deg, var(--capyme-blue-mid), var(--capyme-accent))',
                            borderRadius: '99px',
                            transition: 'width 600ms ease',
                          }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div style={{
                  display: 'flex', flexDirection: 'column', alignItems: 'center',
                  padding: '32px 0', gap: '8px',
                }}>
                  <TrendingUp style={{ width: '32px', height: '32px', color: 'var(--gray-200)' }} />
                  <p style={{ fontSize: '13px', color: 'var(--gray-400)' }}>No hay datos disponibles</p>
                </div>
              )}
            </div>
          </div>

          {/* Postulaciones por estado */}
          <div style={{
            background: '#fff',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-lg)',
            boxShadow: 'var(--shadow-sm)',
            overflow: 'hidden',
          }}>
            <div style={{
              padding: '18px 24px',
              borderBottom: '1px solid var(--border)',
              display: 'flex', alignItems: 'center', gap: '10px',
            }}>
              <div style={{
                width: '32px', height: '32px',
                background: '#F5F3FF',
                borderRadius: 'var(--radius-sm)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <ClipboardList style={{ width: '16px', height: '16px', color: '#7C3AED' }} />
              </div>
              <h2 style={{
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                fontSize: '15px', fontWeight: 700, color: 'var(--gray-900)',
              }}>Postulaciones por Estado</h2>
            </div>
            <div style={{ padding: '20px 24px' }}>
              {postulacionesPorEstado.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {postulacionesPorEstado.map((item, i) => {
                    const badge = estadoBadge[item.estado] || { bg: 'var(--gray-100)', color: 'var(--gray-600)', label: item.estado };
                    return (
                      <div key={i} style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        padding: '12px 16px',
                        background: 'var(--gray-50)',
                        borderRadius: 'var(--radius-md)',
                        border: '1px solid var(--border)',
                      }}>
                        <span style={{
                          display: 'inline-block',
                          padding: '3px 10px',
                          background: badge.bg,
                          color: badge.color,
                          borderRadius: '99px',
                          fontSize: '11px', fontWeight: 700,
                          fontFamily: "'Plus Jakarta Sans', sans-serif",
                          textTransform: 'uppercase',
                          letterSpacing: '0.04em',
                        }}>{badge.label}</span>
                        <span style={{
                          fontFamily: "'Plus Jakarta Sans', sans-serif",
                          fontSize: '18px', fontWeight: 800,
                          color: 'var(--gray-900)',
                        }}>{item.total}</span>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div style={{
                  display: 'flex', flexDirection: 'column', alignItems: 'center',
                  padding: '32px 0', gap: '8px',
                }}>
                  <ClipboardList style={{ width: '32px', height: '32px', color: 'var(--gray-200)' }} />
                  <p style={{ fontSize: '13px', color: 'var(--gray-400)' }}>No hay datos disponibles</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Recent items row */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
          gap: '20px',
        }}>
          {/* Últimos negocios */}
          <div style={{
            background: '#fff',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-lg)',
            boxShadow: 'var(--shadow-sm)',
            overflow: 'hidden',
          }}>
            <div style={{
              padding: '18px 24px',
              borderBottom: '1px solid var(--border)',
              display: 'flex', alignItems: 'center', gap: '10px',
            }}>
              <div style={{
                width: '32px', height: '32px',
                background: '#EEF4FF',
                borderRadius: 'var(--radius-sm)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Calendar style={{ width: '16px', height: '16px', color: 'var(--capyme-blue-mid)' }} />
              </div>
              <h2 style={{
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                fontSize: '15px', fontWeight: 700, color: 'var(--gray-900)',
              }}>Últimos Negocios Registrados</h2>
            </div>
            <div style={{ padding: '12px 16px' }}>
              {ultimosNegocios.length > 0 ? (
                ultimosNegocios.map((negocio) => (
                  <div key={negocio.id} style={{
                    display: 'flex', alignItems: 'center', gap: '12px',
                    padding: '10px 8px',
                    borderBottom: '1px solid var(--border)',
                    transition: 'background 150ms ease',
                    borderRadius: 'var(--radius-sm)',
                    cursor: 'default',
                  }}
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--gray-50)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <div style={{
                      width: '36px', height: '36px', borderRadius: '50%',
                      background: 'linear-gradient(135deg, var(--capyme-blue-mid), var(--capyme-blue))',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: '#fff', fontSize: '13px', fontWeight: 700,
                      flexShrink: 0,
                      fontFamily: "'Plus Jakarta Sans', sans-serif",
                    }}>
                      {negocio.nombreNegocio?.charAt(0)}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{
                        fontSize: '13px', fontWeight: 600, color: 'var(--gray-800)',
                        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                      }}>{negocio.nombreNegocio}</p>
                      <p style={{ fontSize: '12px', color: 'var(--gray-400)', marginTop: '1px' }}>
                        {negocio.categoria?.nombre} · {new Date(negocio.fechaRegistro).toLocaleDateString('es-MX')}
                      </p>
                    </div>
                    <Building2 style={{ width: '16px', height: '16px', color: 'var(--gray-300)', flexShrink: 0 }} />
                  </div>
                ))
              ) : (
                <div style={{
                  display: 'flex', flexDirection: 'column', alignItems: 'center',
                  padding: '32px 0', gap: '8px',
                }}>
                  <Building2 style={{ width: '32px', height: '32px', color: 'var(--gray-200)' }} />
                  <p style={{ fontSize: '13px', color: 'var(--gray-400)' }}>No hay negocios registrados</p>
                </div>
              )}
            </div>
          </div>

          {/* Últimas postulaciones */}
          <div style={{
            background: '#fff',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-lg)',
            boxShadow: 'var(--shadow-sm)',
            overflow: 'hidden',
          }}>
            <div style={{
              padding: '18px 24px',
              borderBottom: '1px solid var(--border)',
              display: 'flex', alignItems: 'center', gap: '10px',
            }}>
              <div style={{
                width: '32px', height: '32px',
                background: '#F5F3FF',
                borderRadius: 'var(--radius-sm)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Calendar style={{ width: '16px', height: '16px', color: '#7C3AED' }} />
              </div>
              <h2 style={{
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                fontSize: '15px', fontWeight: 700, color: 'var(--gray-900)',
              }}>Últimas Postulaciones</h2>
            </div>
            <div style={{ padding: '12px 16px' }}>
              {ultimasPostulaciones.length > 0 ? (
                ultimasPostulaciones.map((p) => {
                  const badge = estadoBadge[p.estado] || { bg: 'var(--gray-100)', color: 'var(--gray-600)', label: p.estado };
                  return (
                    <div key={p.id} style={{
                      display: 'flex', alignItems: 'center', gap: '12px',
                      padding: '10px 8px',
                      borderBottom: '1px solid var(--border)',
                      transition: 'background 150ms ease',
                      borderRadius: 'var(--radius-sm)',
                    }}
                      onMouseEnter={e => e.currentTarget.style.background = 'var(--gray-50)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    >
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{
                          fontSize: '13px', fontWeight: 600, color: 'var(--gray-800)',
                          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                        }}>{p.programa?.nombre}</p>
                        <p style={{ fontSize: '12px', color: 'var(--gray-400)', marginTop: '1px' }}>
                          {p.negocio?.nombreNegocio}
                        </p>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
                        <span style={{
                          padding: '2px 8px',
                          background: badge.bg,
                          color: badge.color,
                          borderRadius: '99px',
                          fontSize: '10px', fontWeight: 700,
                          fontFamily: "'Plus Jakarta Sans', sans-serif",
                          textTransform: 'uppercase',
                          letterSpacing: '0.04em',
                          whiteSpace: 'nowrap',
                        }}>{badge.label}</span>
                        <span style={{ fontSize: '11px', color: 'var(--gray-300)' }}>
                          {new Date(p.fechaPostulacion).toLocaleDateString('es-MX')}
                        </span>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div style={{
                  display: 'flex', flexDirection: 'column', alignItems: 'center',
                  padding: '32px 0', gap: '8px',
                }}>
                  <ClipboardList style={{ width: '32px', height: '32px', color: 'var(--gray-200)' }} />
                  <p style={{ fontSize: '13px', color: 'var(--gray-400)' }}>No hay postulaciones</p>
                </div>
              )}
            </div>
          </div>
        </div>

      </div>
    </Layout>
  );
};

export default Dashboard;