import { Link, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import {
  LayoutDashboard,
  Building2,
  FileText,
  GraduationCap,
  Users,
  BellRing,
  Link2,
  Phone,
  Briefcase,
  ClipboardList,
  X,
  ChevronRight,
  MessageCircle,
} from 'lucide-react';

const Sidebar = ({ isOpen, onClose }) => {
  const location = useLocation();
  const { user } = useAuthStore();

  const menuItems = {
    admin: [
      { path: '/dashboard',      icon: LayoutDashboard, label: 'Dashboard' },
      { path: '/negocios',       icon: Building2,       label: 'Negocios' },
      { path: '/programas',      icon: FileText,        label: 'Programas' },
      { path: '/postulaciones',  icon: ClipboardList,   label: 'Postulaciones' },
      { path: '/cursos',         icon: GraduationCap,   label: 'Cursos' },
      { path: '/usuarios',       icon: Users,           label: 'Usuarios' },
      { path: '/avisos',         icon: BellRing,        label: 'Avisos' },
      { path: '/enlaces',        icon: Link2,           label: 'Recursos' },
      { path: '/contacto',       icon: Phone,           label: 'Contacto' },
    ],
    colaborador: [
      { path: '/dashboard',      icon: LayoutDashboard, label: 'Dashboard' },
      { path: '/negocios',       icon: Building2,       label: 'Negocios' },
      { path: '/programas',      icon: FileText,        label: 'Programas' },
      { path: '/postulaciones',  icon: ClipboardList,   label: 'Postulaciones' },
      { path: '/cursos',         icon: GraduationCap,   label: 'Cursos' },
      { path: '/avisos',         icon: BellRing,        label: 'Avisos' },
      { path: '/enlaces',        icon: Link2,           label: 'Recursos' },
    ],
    cliente: [
      { path: '/cliente/dashboard',     icon: LayoutDashboard, label: 'Inicio' },
      { path: '/cliente/mis-negocios',  icon: Building2,       label: 'Mis Negocios' },
      { path: '/cliente/programas',     icon: FileText,        label: 'Programas' },
      { path: '/cliente/postulaciones', icon: ClipboardList,   label: 'Mis Postulaciones' },
      { path: '/cliente/cursos',        icon: GraduationCap,   label: 'Cursos' },
      { path: '/cliente/financiamiento',icon: Briefcase,       label: 'Financiamiento' },
      { path: '/cliente/avisos',        icon: BellRing,        label: 'Avisos' },
      { path: '/cliente/recursos',      icon: Link2,           label: 'Recursos' },
    ],
  };

  const currentMenu = menuItems[user?.rol] || menuItems.cliente;
  const isActive = (path) => location.pathname === path;

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div
          onClick={onClose}
          className="lg:hidden"
          style={{
            position: 'fixed', inset: 0,
            background: 'rgba(15,23,42,0.45)',
            backdropFilter: 'blur(2px)',
            zIndex: 39,
            animation: 'fadeIn 150ms ease',
          }}
        />
      )}

      {/* Sidebar panel */}
      <aside style={{
        position: 'fixed',
        top: '64px', left: 0, bottom: 0,
        width: '256px',
        background: 'var(--surface)',
        borderRight: '1px solid var(--border)',
        overflowY: 'auto',
        zIndex: 40,
        transition: 'transform 250ms cubic-bezier(0.4,0,0.2,1)',
        transform: isOpen ? 'translateX(0)' : '',
        display: 'flex',
        flexDirection: 'column',
      }}
        className={!isOpen ? 'lg:translate-x-0 -translate-x-full' : ''}
      >
        {/* Botón cerrar en móvil */}
        <button
          onClick={onClose}
          className="lg:hidden"
          style={{
            position: 'absolute', top: '12px', right: '12px',
            padding: '6px', borderRadius: 'var(--radius-md)',
            border: 'none', background: 'var(--gray-100)',
            cursor: 'pointer', color: 'var(--gray-500)',
          }}
        >
          <X style={{ width: '16px', height: '16px' }} />
        </button>

        {/* Nav items */}
        <nav style={{ padding: '16px 0', flex: 1 }}>
          {/* Label de sección */}
          <p style={{
            padding: '0 22px',
            marginBottom: '8px',
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            fontSize: '10px',
            fontWeight: 700,
            color: 'var(--gray-400)',
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
          }}>
            {user?.rol === 'cliente' ? 'Mi Espacio' : 'Gestión'}
          </p>

          <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
            {currentMenu.map((item, index) => {
              const Icon = item.icon;
              const active = isActive(item.path);

              return (
                <li key={index}>
                  <Link
                    to={item.path}
                    onClick={onClose}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      padding: '10px 14px',
                      margin: '2px 10px',
                      borderRadius: 'var(--radius-md)',
                      textDecoration: 'none',
                      fontSize: '14px',
                      fontWeight: active ? 600 : 500,
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
                    <Icon style={{
                      width: '18px', height: '18px', flexShrink: 0,
                      opacity: active ? 1 : 0.65,
                    }} />
                    <span style={{ flex: 1 }}>{item.label}</span>
                    {active && (
                      <ChevronRight style={{ width: '14px', height: '14px', opacity: 0.7 }} />
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Footer Sidebar */}
        <div style={{ padding: '16px 10px 20px' }}>
          {/* Card de ayuda para clientes */}
          {user?.rol === 'cliente' && (
            <div style={{
              padding: '16px',
              background: 'linear-gradient(135deg, var(--capyme-blue) 0%, var(--capyme-blue-light) 100%)',
              borderRadius: 'var(--radius-lg)',
              color: '#fff',
              marginBottom: '12px',
              position: 'relative',
              overflow: 'hidden',
            }}>
              <div style={{
                position: 'absolute', top: '-20px', right: '-20px',
                width: '80px', height: '80px',
                background: 'rgba(255,255,255,0.08)',
                borderRadius: '50%',
              }} />
              <MessageCircle style={{ width: '20px', height: '20px', marginBottom: '8px', opacity: 0.9 }} />
              <p style={{
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                fontSize: '13px', fontWeight: 700, marginBottom: '4px',
              }}>¿Necesitas ayuda?</p>
              <p style={{ fontSize: '12px', opacity: 0.75, lineHeight: 1.5, marginBottom: '10px' }}>
                Nuestros asesores están disponibles
              </p>
              <Link
                to="/cliente/contacto"
                onClick={onClose}
                style={{
                  display: 'block',
                  textAlign: 'center',
                  padding: '7px 12px',
                  background: 'rgba(255,255,255,0.15)',
                  color: '#fff',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '12px', fontWeight: 600,
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  textDecoration: 'none',
                  backdropFilter: 'blur(4px)',
                  border: '1px solid rgba(255,255,255,0.2)',
                  transition: 'background var(--transition)',
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.25)'}
                onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.15)'}
              >
                Contactar CAPYME
              </Link>
            </div>
          )}

          {/* Version info */}
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '0 12px',
          }}>
            <span style={{ fontSize: '11px', color: 'var(--gray-400)', fontFamily: "'DM Sans', sans-serif" }}>
              CAPYME Sistema
            </span>
            <span style={{
              fontSize: '10px',
              padding: '2px 8px',
              background: 'var(--gray-100)',
              color: 'var(--gray-500)',
              borderRadius: '99px',
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              fontWeight: 700,
            }}>v1.0.0</span>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;