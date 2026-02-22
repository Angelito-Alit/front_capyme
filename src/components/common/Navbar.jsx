import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { useAuth } from '../../hooks/useAuth';
import {
  Bell,
  User,
  LogOut,
  Settings,
  Menu,
  ChevronDown,
} from 'lucide-react';
import LogoCapyme from '../../assets/LogoCapyme.png';

const Navbar = ({ onMenuClick }) => {
  const { user } = useAuthStore();
  const { logout } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const roleName = { admin: 'Administrador', colaborador: 'Colaborador', cliente: 'Cliente' };
  const roleBg   = { admin: '#FEE2E2', colaborador: '#DBEAFE', cliente: '#D1FAE5' };
  const roleColor= { admin: '#B91C1C', colaborador: '#1D4ED8', cliente: '#065F46' };

  const notifications = [
    { title: 'Nueva postulación recibida', time: 'Hace 5 min', unread: true },
    { title: 'Curso próximo a iniciar', time: 'Hace 1 hora', unread: true },
    { title: 'Nuevo programa disponible', time: 'Hace 3 horas', unread: false },
  ];

  return (
    <nav style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 30,
      height: '64px',
      background: 'rgba(255,255,255,0.97)',
      backdropFilter: 'blur(16px)',
      WebkitBackdropFilter: 'blur(16px)',
      borderBottom: '1px solid var(--border)',
      boxShadow: '0 1px 0 var(--border), 0 2px 12px rgba(15,42,90,0.05)',
      display: 'flex', alignItems: 'center',
      padding: '0 20px',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>

        {/* Left */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button
            onClick={onMenuClick}
            className="lg:hidden"
            style={{
              padding: '8px', borderRadius: 'var(--radius-md)',
              border: 'none', background: 'transparent', cursor: 'pointer',
              color: 'var(--gray-600)',
              transition: 'background var(--transition)',
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'var(--gray-100)'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
          >
            <Menu style={{ width: '20px', height: '20px' }} />
          </button>

          {/* Logo CAPYME */}
          <Link to="/dashboard" style={{ display: 'flex', alignItems: 'center', textDecoration: 'none' }}>
            <img
              src={LogoCapyme}
              alt="CAPYME"
              style={{
                height: '40px',
                width: 'auto',
                objectFit: 'contain',
              }}
            />
          </Link>
        </div>

        {/* Right */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>

          {/* Notificaciones */}
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => { setShowNotifications(!showNotifications); setShowUserMenu(false); }}
              style={{
                position: 'relative',
                padding: '8px', borderRadius: 'var(--radius-md)',
                border: 'none', background: 'transparent', cursor: 'pointer',
                color: 'var(--gray-500)',
                transition: 'background var(--transition)',
              }}
              onMouseEnter={e => e.currentTarget.style.background = 'var(--gray-100)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              <Bell style={{ width: '20px', height: '20px' }} />
              <span style={{
                position: 'absolute', top: '5px', right: '5px',
                width: '8px', height: '8px',
                background: '#EF4444',
                borderRadius: '50%',
                border: '2px solid white',
              }} />
            </button>

            {showNotifications && (
              <div style={{
                position: 'absolute', right: 0, top: 'calc(100% + 8px)',
                width: '320px',
                background: 'var(--surface)',
                borderRadius: 'var(--radius-lg)',
                border: '1px solid var(--border)',
                boxShadow: 'var(--shadow-lg)',
                overflow: 'hidden',
                animation: 'slideUp 150ms var(--ease)',
                zIndex: 50,
              }}>
                <div style={{
                  padding: '16px 20px',
                  borderBottom: '1px solid var(--border)',
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                }}>
                  <span style={{
                    fontFamily: "'Plus Jakarta Sans', sans-serif",
                    fontSize: '14px', fontWeight: 700, color: 'var(--gray-900)',
                  }}>Notificaciones</span>
                  <span style={{
                    padding: '2px 8px',
                    background: 'var(--capyme-blue-pale)',
                    color: 'var(--capyme-blue-mid)',
                    borderRadius: '99px',
                    fontSize: '11px', fontWeight: 700,
                    fontFamily: "'Plus Jakarta Sans', sans-serif",
                  }}>3 nuevas</span>
                </div>

                {notifications.map((n, i) => (
                  <div key={i} style={{
                    padding: '14px 20px',
                    borderBottom: i < notifications.length - 1 ? '1px solid var(--border)' : 'none',
                    background: n.unread ? 'var(--capyme-blue-pale)' : 'transparent',
                    cursor: 'pointer',
                    transition: 'background var(--transition)',
                    display: 'flex', gap: '12px', alignItems: 'flex-start',
                  }}
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--gray-50)'}
                    onMouseLeave={e => e.currentTarget.style.background = n.unread ? 'var(--capyme-blue-pale)' : 'transparent'}
                  >
                    {n.unread && (
                      <div style={{
                        width: '7px', height: '7px', borderRadius: '50%',
                        background: 'var(--capyme-blue-mid)',
                        marginTop: '6px', flexShrink: 0,
                      }} />
                    )}
                    <div style={{ flex: 1 }}>
                      <p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--gray-800)', marginBottom: '2px' }}>{n.title}</p>
                      <p style={{ fontSize: '12px', color: 'var(--gray-400)' }}>{n.time}</p>
                    </div>
                  </div>
                ))}

                <div style={{ padding: '12px 20px' }}>
                  <button style={{
                    width: '100%', padding: '9px',
                    background: 'var(--capyme-blue-pale)',
                    color: 'var(--capyme-blue-mid)',
                    border: 'none', borderRadius: 'var(--radius-md)',
                    fontFamily: "'Plus Jakarta Sans', sans-serif",
                    fontSize: '13px', fontWeight: 600, cursor: 'pointer',
                  }}>
                    Ver todas las notificaciones
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Usuario */}
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => { setShowUserMenu(!showUserMenu); setShowNotifications(false); }}
              style={{
                display: 'flex', alignItems: 'center', gap: '8px',
                padding: '6px 10px 6px 6px',
                borderRadius: 'var(--radius-lg)',
                border: '1px solid var(--border)',
                background: showUserMenu ? 'var(--gray-50)' : 'transparent',
                cursor: 'pointer',
                transition: 'all var(--transition)',
              }}
              onMouseEnter={e => e.currentTarget.style.background = 'var(--gray-50)'}
              onMouseLeave={e => { if (!showUserMenu) e.currentTarget.style.background = 'transparent'; }}
            >
              <div style={{
                width: '34px', height: '34px', borderRadius: '50%',
                background: 'linear-gradient(135deg, var(--capyme-blue-mid), var(--capyme-blue))',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#fff',
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                fontSize: '13px', fontWeight: 700,
                flexShrink: 0,
              }}>
                {user?.nombre?.charAt(0)}{user?.apellido?.charAt(0)}
              </div>

              <div className="hidden md:flex flex-col items-start">
                <span style={{
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  fontSize: '13px', fontWeight: 600, color: 'var(--gray-800)',
                  lineHeight: 1.3,
                }}>
                  {user?.nombre} {user?.apellido}
                </span>
                <span style={{
                  display: 'inline-block',
                  padding: '1px 7px',
                  background: roleBg[user?.rol] || 'var(--gray-100)',
                  color: roleColor[user?.rol] || 'var(--gray-600)',
                  borderRadius: '99px',
                  fontSize: '10px', fontWeight: 700,
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                }}>
                  {roleName[user?.rol] || user?.rol}
                </span>
              </div>

              <ChevronDown style={{
                width: '14px', height: '14px', color: 'var(--gray-400)',
                transform: showUserMenu ? 'rotate(180deg)' : 'none',
                transition: 'transform var(--transition)',
                flexShrink: 0,
              }} />
            </button>

            {showUserMenu && (
              <div style={{
                position: 'absolute', right: 0, top: 'calc(100% + 8px)',
                width: '220px',
                background: 'var(--surface)',
                borderRadius: 'var(--radius-lg)',
                border: '1px solid var(--border)',
                boxShadow: 'var(--shadow-lg)',
                overflow: 'hidden',
                animation: 'slideUp 150ms var(--ease)',
                zIndex: 50,
              }}>
                <div className="md:hidden" style={{
                  padding: '16px 18px',
                  borderBottom: '1px solid var(--border)',
                  background: 'var(--gray-50)',
                }}>
                  <p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--gray-800)' }}>
                    {user?.nombre} {user?.apellido}
                  </p>
                  <p style={{ fontSize: '12px', color: 'var(--gray-500)', marginTop: '2px' }}>
                    {user?.email}
                  </p>
                </div>

                {[
                  { to: '/perfil', icon: User, label: 'Mi Perfil' },
                  ...(user?.rol === 'admin' ? [{ to: '/configuracion', icon: Settings, label: 'Configuración' }] : []),
                ].map((item, i) => (
                  <Link
                    key={i}
                    to={item.to}
                    onClick={() => setShowUserMenu(false)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '10px',
                      padding: '11px 18px',
                      fontSize: '13px', fontWeight: 500,
                      color: 'var(--gray-700)',
                      textDecoration: 'none',
                      transition: 'background var(--transition)',
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--gray-50)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <item.icon style={{ width: '15px', height: '15px', color: 'var(--gray-400)' }} />
                    {item.label}
                  </Link>
                ))}

                <div style={{ height: '1px', background: 'var(--border)' }} />

                <button
                  onClick={() => { setShowUserMenu(false); logout(); }}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '10px',
                    padding: '11px 18px', width: '100%',
                    fontSize: '13px', fontWeight: 500,
                    color: '#DC2626',
                    background: 'transparent', border: 'none', cursor: 'pointer',
                    transition: 'background var(--transition)',
                    textAlign: 'left',
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = '#FEF2F2'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <LogOut style={{ width: '15px', height: '15px' }} />
                  Cerrar Sesión
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;