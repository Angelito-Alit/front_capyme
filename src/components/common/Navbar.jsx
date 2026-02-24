import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { useAuth } from '../../hooks/useAuth';
import { avisosService } from '../../services/avisosService';
import {
  Bell,
  User,
  LogOut,
  Settings,
  Menu,
  ChevronDown,
  AlertCircle,
  Info,
  Calendar,
  BellRing,
  ExternalLink,
} from 'lucide-react';
import LogoCapyme from '../../assets/LogoCapyme.png';

const Navbar = ({ onMenuClick }) => {
  const { user } = useAuthStore();
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [avisos, setAvisos] = useState([]);
  const [loadingAvisos, setLoadingAvisos] = useState(false);
  const notifRef = useRef(null);
  const userRef = useRef(null);

  const roleName = { admin: 'Administrador', colaborador: 'Colaborador', cliente: 'Cliente' };
  const roleBg   = { admin: '#FEE2E2', colaborador: '#DBEAFE', cliente: '#D1FAE5' };
  const roleColor= { admin: '#B91C1C', colaborador: '#1D4ED8', cliente: '#065F46' };

  useEffect(() => {
    cargarAvisos();
  }, []);

  useEffect(() => {
    const handleClick = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) setShowNotifications(false);
      if (userRef.current && !userRef.current.contains(e.target)) setShowUserMenu(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const cargarAvisos = async () => {
    try {
      setLoadingAvisos(true);
      const res = await avisosService.getAll({ activo: 'true' });
      const todos = res.data || [];
      const ahora = new Date();
      const vigentes = todos.filter((a) => !a.fechaExpiracion || new Date(a.fechaExpiracion) > ahora);
      setAvisos(vigentes.slice(0, 6));
    } catch {
      setAvisos([]);
    } finally {
      setLoadingAvisos(false);
    }
  };

  const getTipoIcon = (tipo) => {
    const s = { width: '14px', height: '14px', flexShrink: 0 };
    if (tipo === 'urgente') return <AlertCircle style={{ ...s, color: '#DC2626' }} />;
    if (tipo === 'evento') return <Calendar style={{ ...s, color: '#7C3AED' }} />;
    if (tipo === 'recordatorio') return <BellRing style={{ ...s, color: '#D97706' }} />;
    return <Info style={{ ...s, color: 'var(--capyme-blue-mid)' }} />;
  };

  const getTipoBg = (tipo) => {
    if (tipo === 'urgente') return '#FEF2F2';
    if (tipo === 'evento') return '#F5F3FF';
    if (tipo === 'recordatorio') return '#FFFBEB';
    return 'var(--capyme-blue-pale)';
  };

  const formatTimeAgo = (date) => {
    if (!date) return '';
    const diff = Math.floor((new Date() - new Date(date)) / 1000);
    if (diff < 60) return 'Hace un momento';
    if (diff < 3600) return `Hace ${Math.floor(diff / 60)} min`;
    if (diff < 86400) return `Hace ${Math.floor(diff / 3600)}h`;
    return new Date(date).toLocaleDateString('es-MX', { day: 'numeric', month: 'short' });
  };

  const urgentes = avisos.filter((a) => a.tipo === 'urgente').length;

  const getAvisoRoute = (aviso) => {
    if (user?.rol === 'cliente') return `/cliente/avisos/${aviso.id}`;
    return `/avisos/${aviso.id}`;
  };

  const handleAvisoClick = (aviso) => {
    setShowNotifications(false);
    navigate(getAvisoRoute(aviso));
  };

  const handleVerTodos = () => {
    setShowNotifications(false);
    navigate(user?.rol === 'cliente' ? '/cliente/avisos' : '/avisos');
  };

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
      <style>{`
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>

        {/* Left */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button
            onClick={onMenuClick}
            style={{ padding: '8px', borderRadius: 'var(--radius-md)', border: 'none', background: 'transparent', cursor: 'pointer', color: 'var(--gray-600)', transition: 'background var(--transition)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            onMouseEnter={e => e.currentTarget.style.background = 'var(--gray-100)'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
          >
            <Menu style={{ width: '20px', height: '20px' }} />
          </button>
          <Link to="/dashboard" style={{ display: 'flex', alignItems: 'center', textDecoration: 'none' }}>
            <img src={LogoCapyme} alt="CAPYME" style={{ height: '40px', width: 'auto', objectFit: 'contain' }} />
          </Link>
        </div>

        {/* Right */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>

          {/* ── NOTIFICACIONES ── */}
          <div style={{ position: 'relative' }} ref={notifRef}>
            <button
              onClick={() => { setShowNotifications(!showNotifications); setShowUserMenu(false); }}
              style={{ position: 'relative', padding: '8px', borderRadius: 'var(--radius-md)', border: 'none', background: showNotifications ? 'var(--gray-100)' : 'transparent', cursor: 'pointer', color: 'var(--gray-500)', transition: 'background var(--transition)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              onMouseEnter={e => e.currentTarget.style.background = 'var(--gray-100)'}
              onMouseLeave={e => { if (!showNotifications) e.currentTarget.style.background = 'transparent'; }}
            >
              <Bell style={{ width: '20px', height: '20px' }} />
              {avisos.length > 0 && (
                <span style={{
                  position: 'absolute', top: '5px', right: '5px',
                  minWidth: urgentes > 0 ? '16px' : '8px',
                  height: urgentes > 0 ? '16px' : '8px',
                  background: urgentes > 0 ? '#EF4444' : 'var(--capyme-blue-mid)',
                  borderRadius: '99px',
                  border: '2px solid white',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '9px', fontWeight: 700, color: '#fff',
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  padding: urgentes > 0 ? '0 3px' : '0',
                }}>
                  {urgentes > 0 ? urgentes : ''}
                </span>
              )}
            </button>

            {showNotifications && (
              <div style={{
                position: 'absolute', right: 0, top: 'calc(100% + 8px)',
                width: '360px',
                maxWidth: 'calc(100vw - 40px)',
                background: 'var(--surface)',
                borderRadius: 'var(--radius-lg)',
                border: '1px solid var(--border)',
                boxShadow: '0 16px 40px rgba(0,0,0,0.12)',
                overflow: 'hidden',
                animation: 'slideDown 150ms ease both',
                zIndex: 50,
              }}>
                {/* Header panel */}
                <div style={{ padding: '14px 18px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--gray-50)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <BellRing style={{ width: '15px', height: '15px', color: 'var(--capyme-blue-mid)' }} />
                    <span style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: '14px', fontWeight: 700, color: 'var(--gray-900)' }}>
                      Avisos
                    </span>
                  </div>
                  {avisos.length > 0 && (
                    <span style={{ padding: '2px 8px', background: urgentes > 0 ? '#FEF2F2' : 'var(--capyme-blue-pale)', color: urgentes > 0 ? '#DC2626' : 'var(--capyme-blue-mid)', borderRadius: '99px', fontSize: '11px', fontWeight: 700, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                      {urgentes > 0 ? `${urgentes} urgente${urgentes > 1 ? 's' : ''}` : `${avisos.length} activo${avisos.length > 1 ? 's' : ''}`}
                    </span>
                  )}
                </div>

                {/* Lista */}
                <div style={{ maxHeight: '380px', overflowY: 'auto' }}>
                  {loadingAvisos ? (
                    <div style={{ padding: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
                      <div style={{ width: '18px', height: '18px', border: '2px solid var(--gray-200)', borderTopColor: 'var(--capyme-blue-mid)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                      <span style={{ fontSize: '13px', color: 'var(--gray-400)', fontFamily: "'DM Sans', sans-serif" }}>Cargando avisos…</span>
                      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
                    </div>
                  ) : avisos.length === 0 ? (
                    <div style={{ padding: '32px 20px', textAlign: 'center' }}>
                      <BellRing style={{ width: '28px', height: '28px', color: 'var(--gray-300)', margin: '0 auto 8px' }} />
                      <p style={{ fontSize: '13px', color: 'var(--gray-400)', fontFamily: "'DM Sans', sans-serif" }}>Sin avisos activos</p>
                    </div>
                  ) : (
                    avisos.map((aviso, i) => (
                      <button
                        key={aviso.id}
                        onClick={() => handleAvisoClick(aviso)}
                        style={{
                          display: 'flex', alignItems: 'flex-start', gap: '12px',
                          padding: '13px 18px', width: '100%',
                          background: aviso.tipo === 'urgente' ? '#FFF8F8' : 'transparent',
                          border: 'none',
                          borderBottom: i < avisos.length - 1 ? '1px solid var(--gray-100)' : 'none',
                          cursor: 'pointer', textAlign: 'left',
                          transition: 'background 120ms ease',
                        }}
                        onMouseEnter={e => e.currentTarget.style.background = 'var(--gray-50)'}
                        onMouseLeave={e => e.currentTarget.style.background = aviso.tipo === 'urgente' ? '#FFF8F8' : 'transparent'}
                      >
                        <div style={{ width: '32px', height: '32px', borderRadius: 'var(--radius-md)', background: getTipoBg(aviso.tipo), display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          {getTipoIcon(aviso.tipo)}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--gray-900)', margin: '0 0 2px', fontFamily: "'DM Sans', sans-serif", overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {aviso.titulo}
                          </p>
                          <p style={{ fontSize: '12px', color: 'var(--gray-500)', margin: '0 0 4px', fontFamily: "'DM Sans', sans-serif", display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', lineHeight: 1.4 }}>
                            {aviso.contenido}
                          </p>
                          <span style={{ fontSize: '11px', color: 'var(--gray-400)', fontFamily: "'DM Sans', sans-serif" }}>
                            {formatTimeAgo(aviso.fechaPublicacion)}
                          </span>
                        </div>
                        <ExternalLink style={{ width: '13px', height: '13px', color: 'var(--gray-300)', flexShrink: 0, marginTop: '2px' }} />
                      </button>
                    ))
                  )}
                </div>

                {/* Footer panel */}
                <div style={{ padding: '12px 18px', borderTop: '1px solid var(--border)', background: 'var(--gray-50)' }}>
                  <button
                    onClick={handleVerTodos}
                    style={{ width: '100%', padding: '9px', background: 'linear-gradient(135deg, var(--capyme-blue-mid), var(--capyme-blue))', color: '#fff', border: 'none', borderRadius: 'var(--radius-md)', fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: '13px', fontWeight: 600, cursor: 'pointer', transition: 'opacity 150ms ease' }}
                    onMouseEnter={e => e.currentTarget.style.opacity = '0.9'}
                    onMouseLeave={e => e.currentTarget.style.opacity = '1'}
                  >
                    Ver todos los avisos
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* ── USUARIO ── */}
          <div style={{ position: 'relative' }} ref={userRef}>
            <button
              onClick={() => { setShowUserMenu(!showUserMenu); setShowNotifications(false); }}
              style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 10px 6px 6px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)', background: showUserMenu ? 'var(--gray-50)' : 'transparent', cursor: 'pointer', transition: 'all var(--transition)' }}
              onMouseEnter={e => e.currentTarget.style.background = 'var(--gray-50)'}
              onMouseLeave={e => { if (!showUserMenu) e.currentTarget.style.background = 'transparent'; }}
            >
              <div style={{ width: '34px', height: '34px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--capyme-blue-mid), var(--capyme-blue))', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: '13px', fontWeight: 700, flexShrink: 0 }}>
                {user?.nombre?.charAt(0)}{user?.apellido?.charAt(0)}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                <span style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: '13px', fontWeight: 600, color: 'var(--gray-800)', lineHeight: 1.3 }}>
                  {user?.nombre} {user?.apellido}
                </span>
                <span style={{ display: 'inline-block', padding: '1px 7px', background: roleBg[user?.rol] || 'var(--gray-100)', color: roleColor[user?.rol] || 'var(--gray-600)', borderRadius: '99px', fontSize: '10px', fontWeight: 700, fontFamily: "'Plus Jakarta Sans', sans-serif", textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  {roleName[user?.rol] || user?.rol}
                </span>
              </div>
              <ChevronDown style={{ width: '14px', height: '14px', color: 'var(--gray-400)', transform: showUserMenu ? 'rotate(180deg)' : 'none', transition: 'transform var(--transition)', flexShrink: 0 }} />
            </button>

            {showUserMenu && (
              <div style={{ position: 'absolute', right: 0, top: 'calc(100% + 8px)', width: '220px', background: 'var(--surface)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)', boxShadow: '0 16px 40px rgba(0,0,0,0.12)', overflow: 'hidden', animation: 'slideDown 150ms ease both', zIndex: 50 }}>
                {[
                  { to: '/perfil', icon: User, label: 'Mi Perfil' }
                ].map((item, i) => (
                  <Link
                    key={i}
                    to={item.to}
                    onClick={() => setShowUserMenu(false)}
                    style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '11px 18px', fontSize: '13px', fontWeight: 500, color: 'var(--gray-700)', textDecoration: 'none', transition: 'background var(--transition)' }}
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
                  style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '11px 18px', width: '100%', fontSize: '13px', fontWeight: 500, color: '#DC2626', background: 'transparent', border: 'none', cursor: 'pointer', transition: 'background var(--transition)', textAlign: 'left' }}
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