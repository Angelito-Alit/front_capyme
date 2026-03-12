import { Link, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import {
  LayoutDashboard, Building2, FileText, GraduationCap,
  Users, BellRing, Link2, Phone, Briefcase, ClipboardList,
  X, ChevronRight, MessageCircle, UserCheck,
} from 'lucide-react';
import LogoCapyme from '../../assets/LogoCapyme.png';
import { History, Megaphone, TrendingUp, Heart } from 'lucide-react';

const Sidebar = ({ isOpen, onClose }) => {
  const location = useLocation();
  const { user } = useAuthStore();

  const menuItems = {
    admin: [
      { section: 'Gestión' },
      { path: '/dashboard',       icon: LayoutDashboard, label: 'Dashboard' },
      { path: '/negocios',        icon: Building2,       label: 'Negocios' },
      { path: '/programas',       icon: FileText,        label: 'Programas' },
      { path: '/postulaciones',   icon: ClipboardList,   label: 'Postulaciones' },
      { path: '/jcf',             icon: UserCheck,       label: 'Jóvenes JCF' },
      { path: '/cursos',          icon: GraduationCap,   label: 'Cursos' },
      { path: '/usuarios',        icon: Users,           label: 'Usuarios' },
      { path: '/avisos',          icon: BellRing,        label: 'Avisos' },
      { path: '/enlaces',         icon: Link2,           label: 'Recursos' },
      { path: '/contacto',        icon: Phone,           label: 'Contacto' },
      { path: '/historial',       icon: History,         label: 'Historial' },
      { section: 'Crowdfunding' },
      { path: '/campanas',        icon: Megaphone,       label: 'Campañas' },
      { path: '/inversiones',     icon: TrendingUp,      label: 'Inversiones' },
      { path: '/mis-campanas',    icon: Megaphone,       label: 'Mis Campañas' },
      { path: '/mis-inversiones', icon: Heart,           label: 'Mis Inversiones' },
    ],
    colaborador: [
      { section: 'Gestión' },
      { path: '/dashboard',       icon: LayoutDashboard, label: 'Dashboard' },
      { path: '/negocios',        icon: Building2,       label: 'Negocios' },
      { path: '/programas',       icon: FileText,        label: 'Programas' },
      { path: '/postulaciones',   icon: ClipboardList,   label: 'Postulaciones' },
      { path: '/jcf',             icon: UserCheck,       label: 'Jóvenes JCF' },
      { path: '/cursos',          icon: GraduationCap,   label: 'Cursos' },
      { path: '/usuarios',        icon: Users,           label: 'Usuarios' },
      { path: '/avisos',          icon: BellRing,        label: 'Avisos' },
      { path: '/enlaces',         icon: Link2,           label: 'Recursos' },
      { path: '/contacto',        icon: Phone,           label: 'Contacto' },
      { section: 'Crowdfunding' },
      { path: '/campanas',        icon: Megaphone,       label: 'Campañas' },
      { path: '/inversiones',     icon: TrendingUp,      label: 'Inversiones' },
      { path: '/mis-campanas',    icon: Megaphone,       label: 'Mis Campañas' },
      { path: '/mis-inversiones', icon: Heart,           label: 'Mis Inversiones' },
    ],
    cliente: [
      { section: 'Mi Espacio' },
      { path: '/cliente/dashboard',      icon: LayoutDashboard, label: 'Inicio' },
      { path: '/cliente/mis-negocios',   icon: Building2,       label: 'Mis Negocios' },
      { path: '/cliente/programas',      icon: FileText,        label: 'Programas' },
      { path: '/cliente/postulaciones',  icon: ClipboardList,   label: 'Mis Postulaciones' },
      { path: '/cliente/cursos',         icon: GraduationCap,   label: 'Cursos' },
      { path: '/cliente/financiamiento', icon: Briefcase,       label: 'Financiamiento' },
      { path: '/cliente/avisos',         icon: BellRing,        label: 'Avisos' },
      { path: '/cliente/recursos',       icon: Link2,           label: 'Recursos' },
      { section: 'Crowdfunding' },
      { path: '/campanas',               icon: Megaphone,       label: 'Explorar campañas' },
      { path: '/mis-campanas',           icon: Megaphone,       label: 'Mis Campañas' },
      { path: '/mis-inversiones',        icon: Heart,           label: 'Mis Inversiones' },
    ],
  };

  const currentMenu = menuItems[user?.rol] || menuItems.cliente;
  const isActive = (path) => location.pathname === path;

  return (
    <>
      <div
        onClick={onClose}
        style={{
          position: 'fixed', inset: 0,
          background: 'rgba(15,23,42,0.45)',
          backdropFilter: 'blur(2px)', WebkitBackdropFilter: 'blur(2px)',
          zIndex: 39, transition: 'opacity 200ms ease',
          opacity: isOpen ? 1 : 0, pointerEvents: isOpen ? 'auto' : 'none',
        }}
      />

      <aside style={{
        position: 'fixed', top: 0, left: 0, bottom: 0,
        width: '280px', maxWidth: '85vw',
        background: 'var(--surface)', borderRight: '1px solid var(--border)',
        overflowY: 'auto', WebkitOverflowScrolling: 'touch',
        zIndex: 40, display: 'flex', flexDirection: 'column',
        boxShadow: isOpen ? '4px 0 24px rgba(0,0,0,0.12)' : 'none',
        transition: 'transform 280ms cubic-bezier(0.4, 0, 0.2, 1)',
        transform: isOpen ? 'translateX(0)' : 'translateX(-100%)',
      }}>

        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '12px 16px', borderBottom: '1px solid var(--border)',
          minHeight: '64px', flexShrink: 0,
        }}>
          <Link to="/dashboard" onClick={onClose} style={{ display: 'flex', alignItems: 'center', textDecoration: 'none' }}>
            <img src={LogoCapyme} alt="CAPYME" style={{ height: '34px', width: 'auto', objectFit: 'contain' }} />
          </Link>
          <button
            onClick={onClose}
            style={{
              padding: '8px', borderRadius: 'var(--radius-md)', border: 'none',
              background: 'var(--gray-100)', cursor: 'pointer', color: 'var(--gray-500)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'background 150ms ease',
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'var(--gray-200)'}
            onMouseLeave={e => e.currentTarget.style.background = 'var(--gray-100)'}
          >
            <X style={{ width: '18px', height: '18px' }} />
          </button>
        </div>

        <nav style={{ padding: '12px 0', flex: 1 }}>
          <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
            {currentMenu.map((item, index) => {
              if (item.section) {
                return (
                  <li key={index}>
                    <p style={{
                      padding: index === 0 ? '0 22px 8px' : '14px 22px 8px',
                      margin: index === 0 ? 0 : '4px 0 0',
                      borderTop: index === 0 ? 'none' : '1px solid var(--border)',
                      fontFamily: "'Plus Jakarta Sans', sans-serif",
                      fontSize: '10px', fontWeight: 700, color: 'var(--gray-400)',
                      letterSpacing: '0.08em', textTransform: 'uppercase',
                    }}>
                      {item.section}
                    </p>
                  </li>
                );
              }

              const Icon = item.icon;
              const active = isActive(item.path);

              return (
                <li key={index}>
                  <Link
                    to={item.path}
                    onClick={onClose}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '10px',
                      padding: '10px 14px', margin: '2px 10px',
                      borderRadius: 'var(--radius-md)', textDecoration: 'none',
                      fontSize: '14px', fontWeight: active ? 600 : 500,
                      fontFamily: "'DM Sans', sans-serif",
                      color: active ? '#fff' : 'var(--gray-600)',
                      background: active
                        ? 'linear-gradient(135deg, var(--capyme-blue-mid), var(--capyme-blue))'
                        : 'transparent',
                      boxShadow: active ? '0 3px 10px rgba(43,91,166,0.28)' : 'none',
                      transition: 'all 180ms ease',
                    }}
                    onMouseEnter={e => {
                      if (!active) {
                        e.currentTarget.style.background = 'var(--capyme-blue-pale)';
                        e.currentTarget.style.color = 'var(--capyme-blue-mid)';
                      }
                    }}
                    onMouseLeave={e => {
                      if (!active) {
                        e.currentTarget.style.background = 'transparent';
                        e.currentTarget.style.color = 'var(--gray-600)';
                      }
                    }}
                  >
                    <Icon style={{ width: '18px', height: '18px', flexShrink: 0, opacity: active ? 1 : 0.65 }} />
                    <span style={{ flex: 1 }}>{item.label}</span>
                    {active && <ChevronRight style={{ width: '14px', height: '14px', opacity: 0.7 }} />}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div style={{ padding: '16px 10px 20px', flexShrink: 0 }}>
          {user?.rol === 'cliente' && (
            <div style={{
              padding: '16px',
              background: 'linear-gradient(135deg, var(--capyme-blue) 0%, var(--capyme-blue-light) 100%)',
              borderRadius: 'var(--radius-lg)', color: '#fff',
              marginBottom: '14px', position: 'relative', overflow: 'hidden',
            }}>
              <div style={{
                position: 'absolute', top: '-20px', right: '-20px',
                width: '80px', height: '80px',
                background: 'rgba(255,255,255,0.08)', borderRadius: '50%',
              }} />
              <MessageCircle style={{ width: '20px', height: '20px', marginBottom: '8px', opacity: 0.9 }} />
              <p style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: '13px', fontWeight: 700, marginBottom: '4px' }}>
                ¿Necesitas ayuda?
              </p>
              <p style={{ fontSize: '12px', opacity: 0.75, lineHeight: 1.5, marginBottom: '10px' }}>
                Nuestros asesores están disponibles
              </p>
              <Link
                to="/cliente/contacto"
                onClick={onClose}
                style={{
                  display: 'block', textAlign: 'center', padding: '7px 12px',
                  background: 'rgba(255,255,255,0.15)', color: '#fff',
                  borderRadius: 'var(--radius-sm)', fontSize: '12px', fontWeight: 600,
                  fontFamily: "'Plus Jakarta Sans', sans-serif", textDecoration: 'none',
                  backdropFilter: 'blur(4px)', border: '1px solid rgba(255,255,255,0.2)',
                  transition: 'background var(--transition)',
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.25)'}
                onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.15)'}
              >
                Contactar CAPYME
              </Link>
            </div>
          )}

          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '8px 12px', borderTop: '1px solid var(--border)', paddingTop: '14px',
          }}>
            <img src={LogoCapyme} alt="CAPYME" style={{ height: '24px', width: 'auto', objectFit: 'contain', opacity: 0.7 }} />
            <span style={{
              fontSize: '10px', padding: '2px 8px',
              background: 'var(--gray-100)', color: 'var(--gray-500)',
              borderRadius: '99px', fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 700,
            }}>v1.0.0</span>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;