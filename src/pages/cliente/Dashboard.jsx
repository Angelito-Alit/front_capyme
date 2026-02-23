import { useState, useEffect } from 'react';
import Layout from '../../components/common/Layout';
import { dashboardService } from '../../services/dashboardService';
import {
  Building2,
  FileText,
  ClipboardList,
  GraduationCap,
  TrendingUp,
  CheckCircle,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { toast } from 'react-hot-toast';

const ClienteDashboard = () => {
  const authStorage = JSON.parse(localStorage.getItem('auth-storage') || '{}');
  const currentUser = authStorage?.state?.user || {};

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
    } catch {
      toast.error('Error al cargar estadísticas');
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      titulo: 'Mis Negocios',
      valor: estadisticas?.misNegocios ?? 0,
      icono: Building2,
      colorBg: '#EEF4FF',
      colorIcon: 'var(--capyme-blue-mid)',
      colorBar: 'linear-gradient(90deg, var(--capyme-blue-mid), var(--capyme-accent, #4A7BC8))',
    },
    {
      titulo: 'Mis Postulaciones',
      valor: estadisticas?.misPostulaciones ?? 0,
      icono: ClipboardList,
      colorBg: '#F5F3FF',
      colorIcon: '#7C3AED',
      colorBar: 'linear-gradient(90deg, #7C3AED, #A78BFA)',
    },
    {
      titulo: 'Post. Aprobadas',
      valor: estadisticas?.postulacionesAprobadas ?? 0,
      icono: CheckCircle,
      colorBg: '#ECFDF5',
      colorIcon: '#059669',
      colorBar: 'linear-gradient(90deg, #059669, #34D399)',
    },
    {
      titulo: 'Cursos Inscritos',
      valor: estadisticas?.misCursos ?? 0,
      icono: GraduationCap,
      colorBg: '#FFF7ED',
      colorIcon: '#D97706',
      colorBar: 'linear-gradient(90deg, #D97706, #FCD34D)',
    },
  ];

  const accionesRapidas = [
    {
      href: '/cliente/mis-negocios',
      icon: Building2,
      titulo: 'Gestionar Negocios',
      descripcion: 'Administra tu información empresarial',
      colorIcon: 'var(--capyme-blue-mid)',
      colorHoverBg: '#EEF4FF',
    },
    {
      href: '/cliente/postulaciones',
      icon: ClipboardList,
      titulo: 'Mis Postulaciones',
      descripcion: 'Revisa el estado de tus solicitudes',
      colorIcon: '#7C3AED',
      colorHoverBg: '#F5F3FF',
    },
    {
      href: '/cliente/financiamiento',
      icon: TrendingUp,
      titulo: 'Financiamiento',
      descripcion: 'Solicita apoyo financiero',
      colorIcon: '#059669',
      colorHoverBg: '#ECFDF5',
    },
  ];

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

        <div style={{
          background: 'linear-gradient(135deg, var(--capyme-blue-mid), var(--capyme-blue))',
          borderRadius: 'var(--radius-lg)',
          padding: '28px 32px',
          position: 'relative',
          overflow: 'hidden',
          boxShadow: '0 4px 24px rgba(31,78,158,0.22)',
        }}>
          <div style={{
            position: 'absolute', top: '-40px', right: '-40px',
            width: '200px', height: '200px',
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.06)',
          }} />
          <div style={{
            position: 'absolute', bottom: '-60px', right: '80px',
            width: '160px', height: '160px',
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.04)',
          }} />
          <div style={{ position: 'relative', zIndex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <Sparkles style={{ width: '16px', height: '16px', color: 'rgba(255,255,255,0.7)' }} />
              <span style={{
                fontSize: '12px', fontWeight: 600,
                color: 'rgba(255,255,255,0.7)',
                fontFamily: "'DM Sans', sans-serif",
                letterSpacing: '0.04em',
                textTransform: 'uppercase',
              }}>Portal CAPYME</span>
            </div>
            <h1 style={{
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              fontSize: '26px', fontWeight: 800,
              color: '#fff',
              letterSpacing: '-0.02em',
              marginBottom: '6px',
            }}>
              Bienvenido{currentUser.nombre ? `, ${currentUser.nombre}` : ''} 👋
            </h1>
            <p style={{
              fontSize: '14px', color: 'rgba(255,255,255,0.75)',
              fontFamily: "'DM Sans', sans-serif",
            }}>
              Gestiona tus negocios y accede a programas gubernamentales desde aquí.
            </p>
          </div>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
          gap: '16px',
        }}>
          {statCards.map((s, i) => (
            <StatCard key={i} {...s} />
          ))}
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
          gap: '20px',
        }}>
          <PromoCard
            href="/cliente/programas"
            gradient="linear-gradient(135deg, var(--capyme-blue-mid), var(--capyme-blue))"
            icon={FileText}
            titulo="Programas Disponibles"
            descripcion="Descubre programas gubernamentales diseñados para impulsar tu negocio."
            labelBtn="Explorar Programas"
            shadowColor="rgba(31,78,158,0.3)"
          />
          <PromoCard
            href="/cliente/cursos"
            gradient="linear-gradient(135deg, #7C3AED, #5B21B6)"
            icon={GraduationCap}
            titulo="Cursos de Capacitación"
            descripcion="Accede a cursos especializados para fortalecer tus habilidades empresariales."
            labelBtn="Ver Cursos"
            shadowColor="rgba(124,58,237,0.3)"
          />
        </div>

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
          }}>
            <h2 style={{
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              fontSize: '15px', fontWeight: 700, color: 'var(--gray-900)',
            }}>Acciones Rápidas</h2>
          </div>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
            gap: '0px',
          }}>
            {accionesRapidas.map((a, i) => (
              <AccionRapida key={i} {...a} isLast={i === accionesRapidas.length - 1} />
            ))}
          </div>
        </div>

      </div>
    </Layout>
  );
};

const StatCard = ({ titulo, valor, icono: Icon, colorBg, colorIcon, colorBar }) => (
  <div
    style={{
      background: '#fff',
      border: '1px solid var(--border)',
      borderRadius: 'var(--radius-lg)',
      padding: '20px 22px',
      boxShadow: 'var(--shadow-sm)',
      transition: 'all 200ms ease',
      position: 'relative',
      overflow: 'hidden',
      cursor: 'default',
    }}
    onMouseEnter={e => {
      e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.10)';
      e.currentTarget.style.transform = 'translateY(-2px)';
    }}
    onMouseLeave={e => {
      e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
      e.currentTarget.style.transform = 'translateY(0)';
    }}
  >
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
          fontSize: '13px', fontWeight: 500,
          color: 'var(--gray-500)', marginBottom: '8px',
        }}>{titulo}</p>
        <p style={{
          fontFamily: "'Plus Jakarta Sans', sans-serif",
          fontSize: '30px', fontWeight: 800,
          color: 'var(--gray-900)', lineHeight: 1,
          letterSpacing: '-0.02em',
        }}>{valor}</p>
      </div>
      <div style={{
        width: '44px', height: '44px',
        borderRadius: 'var(--radius-md)',
        background: colorBg,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0,
      }}>
        <Icon style={{ width: '20px', height: '20px', color: colorIcon }} />
      </div>
    </div>
  </div>
);

const PromoCard = ({ href, gradient, icon: Icon, titulo, descripcion, labelBtn, shadowColor }) => (
  <a
    href={href}
    style={{
      display: 'block',
      background: gradient,
      borderRadius: 'var(--radius-lg)',
      padding: '28px',
      textDecoration: 'none',
      position: 'relative',
      overflow: 'hidden',
      boxShadow: `0 4px 20px ${shadowColor}`,
      transition: 'all 200ms ease',
    }}
    onMouseEnter={e => {
      e.currentTarget.style.transform = 'translateY(-2px)';
      e.currentTarget.style.boxShadow = `0 8px 28px ${shadowColor}`;
    }}
    onMouseLeave={e => {
      e.currentTarget.style.transform = 'translateY(0)';
      e.currentTarget.style.boxShadow = `0 4px 20px ${shadowColor}`;
    }}
  >
    <div style={{
      position: 'absolute', top: '-30px', right: '-30px',
      width: '130px', height: '130px', borderRadius: '50%',
      background: 'rgba(255,255,255,0.08)',
    }} />
    <div style={{ position: 'relative', zIndex: 1 }}>
      <div style={{
        width: '44px', height: '44px',
        borderRadius: 'var(--radius-md)',
        background: 'rgba(255,255,255,0.15)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        marginBottom: '16px',
      }}>
        <Icon style={{ width: '22px', height: '22px', color: '#fff' }} />
      </div>
      <h2 style={{
        fontFamily: "'Plus Jakarta Sans', sans-serif",
        fontSize: '17px', fontWeight: 800,
        color: '#fff', marginBottom: '8px',
        letterSpacing: '-0.01em',
      }}>{titulo}</h2>
      <p style={{
        fontSize: '13px', color: 'rgba(255,255,255,0.78)',
        fontFamily: "'DM Sans', sans-serif",
        marginBottom: '20px', lineHeight: 1.5,
      }}>{descripcion}</p>
      <span style={{
        display: 'inline-flex', alignItems: 'center', gap: '6px',
        padding: '8px 16px',
        background: 'rgba(255,255,255,0.18)',
        borderRadius: 'var(--radius-md)',
        color: '#fff',
        fontSize: '13px', fontWeight: 600,
        fontFamily: "'Plus Jakarta Sans', sans-serif",
        backdropFilter: 'blur(4px)',
        border: '1px solid rgba(255,255,255,0.25)',
        transition: 'background 150ms ease',
      }}>
        {labelBtn}
        <ArrowRight style={{ width: '14px', height: '14px' }} />
      </span>
    </div>
  </a>
);

const AccionRapida = ({ href, icon: Icon, titulo, descripcion, colorIcon, colorHoverBg, isLast }) => (
  <a
    href={href}
    style={{
      display: 'flex', alignItems: 'center', gap: '14px',
      padding: '18px 24px',
      textDecoration: 'none',
      borderRight: isLast ? 'none' : '1px solid var(--border)',
      transition: 'background 150ms ease',
    }}
    onMouseEnter={e => { e.currentTarget.style.background = colorHoverBg; }}
    onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
  >
    <div style={{
      width: '40px', height: '40px',
      borderRadius: 'var(--radius-md)',
      background: 'var(--gray-50)',
      border: '1px solid var(--border)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      flexShrink: 0,
      transition: 'all 150ms ease',
    }}>
      <Icon style={{ width: '18px', height: '18px', color: colorIcon }} />
    </div>
    <div style={{ flex: 1, minWidth: 0 }}>
      <p style={{
        fontSize: '14px', fontWeight: 600, color: 'var(--gray-800)',
        fontFamily: "'Plus Jakarta Sans', sans-serif",
        marginBottom: '2px',
      }}>{titulo}</p>
      <p style={{
        fontSize: '12px', color: 'var(--gray-400)',
        fontFamily: "'DM Sans', sans-serif",
      }}>{descripcion}</p>
    </div>
    <ArrowRight style={{ width: '15px', height: '15px', color: 'var(--gray-300)', flexShrink: 0 }} />
  </a>
);

export default ClienteDashboard;