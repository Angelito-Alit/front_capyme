import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { useAuth } from '../../hooks/useAuth';
import { notificacionesService } from '../../services/notificacionesService';
import api from '../../services/axios';
import {
  Bell, User, LogOut, Menu, ChevronDown,
  AlertCircle, Info, Calendar, BellRing,
  ExternalLink, Activity, CheckCheck, GraduationCap, Users,
} from 'lucide-react';
import LogoCapyme from '../../assets/LogoCapyme.png';

const LS_KEY = 'historial_visto_en';
const getUltimaVista = () => { const v = localStorage.getItem(LS_KEY); return v ? new Date(v) : null; };
const marcarComoVisto = () => { localStorage.setItem(LS_KEY, new Date().toISOString()); };

const Navbar = ({ onMenuClick }) => {
  const { user }   = useAuthStore();
  const { logout } = useAuth();
  const navigate   = useNavigate();
  const location   = useLocation();

  const [showUserMenu,      setShowUserMenu]      = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [items,             setItems]             = useState([]);
  const [noLeidas,          setNoLeidas]          = useState(0);
  const [loadingNotif,      setLoadingNotif]      = useState(false);
  const [nuevosMovimientos, setNuevosMovimientos] = useState(0);

  const notifRef = useRef(null);
  const userRef  = useRef(null);

  const isAdmin = user?.rol === 'admin';

  const roleName  = { admin: 'Administrador', colaborador: 'Colaborador', cliente: 'Cliente' };
  const roleBg    = { admin: '#FEE2E2', colaborador: '#DBEAFE', cliente: '#D1FAE5' };
  const roleColor = { admin: '#B91C1C', colaborador: '#1D4ED8', cliente: '#065F46' };

  useEffect(() => {
    const handleClick = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) setShowNotifications(false);
      if (userRef.current  && !userRef.current.contains(e.target))  setShowUserMenu(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const cargarNotificaciones = async () => {
    try {
      setLoadingNotif(true);
      const res = await notificacionesService.getAll();
      setItems(res.data || []);
      setNoLeidas(res.noLeidas || 0);
    } catch {
      setItems([]);
    } finally {
      setLoadingNotif(false);
    }
  };

  useEffect(() => {
    cargarNotificaciones();
    const interval = setInterval(cargarNotificaciones, 30_000);
    return () => clearInterval(interval);
  }, []);

  const consultarNuevos = async () => {
    if (!isAdmin) return;
    try {
      const ultimaVista = getUltimaVista();
      const params = ultimaVista ? { desde: ultimaVista.toISOString() } : {};
      const res = await api.get('/dashboard/historial/nuevos', { params });
      setNuevosMovimientos(res.data.total || 0);
    } catch {}
  };

  useEffect(() => {
    if (location.pathname === '/historial') {
      marcarComoVisto();
      setNuevosMovimientos(0);
    }
  }, [location.pathname]);

  useEffect(() => {
    if (!isAdmin) return;
    consultarNuevos();
    const interval = setInterval(consultarNuevos, 60_000);
    return () => clearInterval(interval);
  }, [isAdmin]);

  // Al abrir el panel: marcar todos los avisos no leídos como leídos en BD
  const handleAbrirPanel = async () => {
    const abriendo = !showNotifications;
    setShowNotifications(abriendo);
    setShowUserMenu(false);

    if (abriendo) {
      const avisosNoLeidos = items.filter(i => i.origen === 'aviso' && !i.leida);
      if (avisosNoLeidos.length > 0) {
        // Actualizar UI inmediatamente
        setItems(prev => prev.map(i => i.origen === 'aviso' ? { ...i, leida: true } : i));
        setNoLeidas(prev => Math.max(0, prev - avisosNoLeidos.length));
        // Persistir en BD
        try {
          await notificacionesService.marcarAvisosLeidos(avisosNoLeidos.map(i => i._id));
        } catch {}
      }
    }
  };

  // Marcar notificación personal como leída al hacer clic
  const marcarLeida = async (item) => {
    if (item.origen !== 'notificacion' || item.leida) return;
    setItems(prev => prev.map(n => n.id === item.id ? { ...n, leida: true } : n));
    setNoLeidas(prev => Math.max(0, prev - 1));
    try {
      await notificacionesService.marcarLeida(item._id);
    } catch {}
  };

  // Marcar todas las notificaciones personales como leídas
  const marcarTodas = async () => {
    setItems(prev => prev.map(n => ({ ...n, leida: true })));
    setNoLeidas(0);
    try {
      await notificacionesService.marcarTodas();
    } catch {}
  };

  const handleItemClick = (item) => {
    marcarLeida(item);
    if (item.origen === 'aviso') {
      setShowNotifications(false);
      navigate(user?.rol === 'cliente' ? `/cliente/avisos/${item._id}` : `/avisos/${item._id}`);
    }
  };

  const handleVerTodos = () => {
    setShowNotifications(false);
    navigate(user?.rol === 'cliente' ? '/cliente/avisos' : '/avisos');
  };

  const handleHistorialClick = () => {
    marcarComoVisto();
    setNuevosMovimientos(0);
    navigate('/historial');
  };

  const getItemStyle = (tipo, origen) => {
    if (origen === 'notificacion') {
      if (tipo === 'inscripcion_declinada')      return { bg: '#FEF2F2', color: '#DC2626', Icon: GraduationCap };
      if (tipo === 'pago_confirmado')            return { bg: '#ECFDF5', color: '#16A34A', Icon: GraduationCap };
      if (tipo === 'nueva_inscripcion')          return { bg: '#ECFDF5', color: '#059669', Icon: Users };
      if (tipo === 'inscripcion_pendiente_pago') return { bg: '#FFFBEB', color: '#D97706', Icon: Users };
      return { bg: '#EEF4FF', color: 'var(--capyme-blue-mid)', Icon: Info };
    }
    if (tipo === 'urgente')      return { bg: '#FEF2F2', color: '#DC2626',             Icon: AlertCircle };
    if (tipo === 'evento')       return { bg: '#F5F3FF', color: '#7C3AED',             Icon: Calendar };
    if (tipo === 'recordatorio') return { bg: '#FFFBEB', color: '#D97706',             Icon: BellRing };
    return { bg: 'var(--capyme-blue-pale)', color: 'var(--capyme-blue-mid)', Icon: Info };
  };

  const formatFecha = (fecha) => {
    if (!fecha) return '';
    const diff = Math.floor((new Date() - new Date(fecha)) / 1000);
    if (diff < 60)    return 'Hace un momento';
    if (diff < 3600)  return `Hace ${Math.floor(diff / 60)} min`;
    if (diff < 86400) return `Hace ${Math.floor(diff / 3600)}h`;
    return new Date(fecha).toLocaleDateString('es-MX', { day: 'numeric', month: 'short' });
  };

  const urgentes = items.filter(i => i.tipo === 'urgente' && !i.leida).length;
  const badgeNum = noLeidas;

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
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes pulse-badge {
          0%, 100% { transform: scale(1); }
          50%       { transform: scale(1.18); }
        }
        .nav-icon-btn {
          padding: 8px;
          border-radius: var(--radius-md);
          border: none;
          background: transparent;
          cursor: pointer;
          color: var(--gray-500);
          transition: background 150ms ease, color 150ms ease;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
        }
        .nav-icon-btn:hover { background: var(--gray-100); }
        .nav-icon-btn.active { background: var(--gray-100); color: var(--capyme-blue-mid); }
      `}</style>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button onClick={onMenuClick} className="nav-icon-btn">
            <Menu style={{ width: '20px', height: '20px' }} />
          </button>
          <Link to="/dashboard" style={{ display: 'flex', alignItems: 'center', textDecoration: 'none' }}>
            <img src={LogoCapyme} alt="CAPYME" style={{ height: '40px', width: 'auto', objectFit: 'contain' }} />
          </Link>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>

          {isAdmin && (
            <button
              onClick={handleHistorialClick}
              className={`nav-icon-btn${location.pathname === '/historial' ? ' active' : ''}`}
              title="Historial de actividad"
              style={{ color: nuevosMovimientos > 0 ? 'var(--capyme-blue-mid)' : undefined }}
            >
              <Activity style={{ width: '20px', height: '20px' }} />
              {nuevosMovimientos > 0 && (
                <span style={{
                  position: 'absolute', top: '4px', right: '4px',
                  minWidth: '17px', height: '17px',
                  background: 'linear-gradient(135deg, var(--capyme-blue-mid), var(--capyme-blue))',
                  borderRadius: '99px', border: '2px solid white',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '9px', fontWeight: 800, color: '#fff',
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  padding: '0 3px',
                  animation: 'pulse-badge 2s ease-in-out infinite',
                  boxShadow: '0 1px 6px rgba(31,78,158,0.4)',
                  lineHeight: 1,
                }}>
                  {nuevosMovimientos > 99 ? '99+' : nuevosMovimientos}
                </span>
              )}
            </button>
          )}

          <div style={{ position: 'relative' }} ref={notifRef}>
            <button
              onClick={handleAbrirPanel}
              className={`nav-icon-btn${showNotifications ? ' active' : ''}`}
            >
              <Bell style={{ width: '20px', height: '20px' }} />
              {badgeNum > 0 && (
                <span style={{
                  position: 'absolute', top: '5px', right: '5px',
                  minWidth: urgentes > 0 ? '16px' : '8px',
                  height: urgentes > 0 ? '16px' : '8px',
                  background: urgentes > 0 ? '#EF4444' : 'var(--capyme-blue-mid)',
                  borderRadius: '99px', border: '2px solid white',
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
                width: '380px', maxWidth: 'calc(100vw - 40px)',
                background: 'var(--surface)',
                borderRadius: 'var(--radius-lg)',
                border: '1px solid var(--border)',
                boxShadow: '0 16px 40px rgba(0,0,0,0.12)',
                overflow: 'hidden',
                animation: 'slideDown 150ms ease both',
                zIndex: 50,
              }}>
                <div style={{ padding: '14px 18px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--gray-50)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <BellRing style={{ width: '15px', height: '15px', color: 'var(--capyme-blue-mid)' }} />
                    <span style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: '14px', fontWeight: 700, color: 'var(--gray-900)' }}>Notificaciones</span>
                    {noLeidas > 0 && (
                      <span style={{ padding: '1px 7px', background: '#EEF4FF', color: 'var(--capyme-blue-mid)', borderRadius: '99px', fontSize: '11px', fontWeight: 700, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                        {noLeidas} nuevas
                      </span>
                    )}
                  </div>
                  {items.filter(i => i.origen === 'notificacion' && !i.leida).length > 0 && (
                    <button onClick={marcarTodas} style={{
                      display: 'flex', alignItems: 'center', gap: '4px',
                      padding: '4px 8px', border: 'none', borderRadius: 'var(--radius-sm)',
                      background: 'transparent', cursor: 'pointer',
                      color: 'var(--capyme-blue-mid)', fontSize: '12px', fontWeight: 600,
                      fontFamily: "'DM Sans', sans-serif",
                    }}>
                      <CheckCheck style={{ width: '13px', height: '13px' }} />
                      Marcar leídas
                    </button>
                  )}
                </div>

                <div style={{ maxHeight: '420px', overflowY: 'auto' }}>
                  {loadingNotif ? (
                    <div style={{ padding: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
                      <div style={{ width: '18px', height: '18px', border: '2px solid var(--gray-200)', borderTopColor: 'var(--capyme-blue-mid)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                      <span style={{ fontSize: '13px', color: 'var(--gray-400)', fontFamily: "'DM Sans', sans-serif" }}>Cargando…</span>
                    </div>
                  ) : items.length === 0 ? (
                    <div style={{ padding: '40px 20px', textAlign: 'center' }}>
                      <BellRing style={{ width: '28px', height: '28px', color: 'var(--gray-300)', margin: '0 auto 8px', display: 'block' }} />
                      <p style={{ fontSize: '13px', color: 'var(--gray-400)', margin: 0, fontFamily: "'DM Sans', sans-serif" }}>Sin notificaciones</p>
                    </div>
                  ) : (
                    items.map((item, i) => {
                      const { bg, color, Icon } = getItemStyle(item.tipo, item.origen);
                      const esNueva = !item.leida;
                      return (
                        <div
                          key={item.id}
                          onClick={() => handleItemClick(item)}
                          style={{
                            padding: '12px 18px',
                            borderBottom: i < items.length - 1 ? '1px solid var(--gray-100)' : 'none',
                            display: 'flex', gap: '12px', alignItems: 'flex-start',
                            background: esNueva ? '#F8FAFF' : item.tipo === 'urgente' ? '#FFF8F8' : '#fff',
                            cursor: item.origen === 'aviso' || (item.origen === 'notificacion' && esNueva) ? 'pointer' : 'default',
                            transition: 'background 150ms ease',
                          }}
                          onMouseEnter={e => { if (item.origen === 'aviso' || esNueva) e.currentTarget.style.background = 'var(--gray-50)'; }}
                          onMouseLeave={e => { e.currentTarget.style.background = esNueva ? '#F8FAFF' : item.tipo === 'urgente' ? '#FFF8F8' : '#fff'; }}
                        >
                          <div style={{ width: '34px', height: '34px', borderRadius: 'var(--radius-md)', background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            <Icon style={{ width: '16px', height: '16px', color }} />
                          </div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px' }}>
                              <span style={{
                                fontSize: '13px', fontWeight: esNueva ? 700 : 600,
                                color: 'var(--gray-900)', fontFamily: "'DM Sans', sans-serif",
                                lineHeight: 1.3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                              }}>
                                {item.titulo}
                              </span>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
                                {esNueva && (
                                  <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: 'var(--capyme-blue-mid)', marginTop: '3px' }} />
                                )}
                                {item.origen === 'aviso' && (
                                  <ExternalLink style={{ width: '12px', height: '12px', color: 'var(--gray-300)', marginTop: '2px' }} />
                                )}
                              </div>
                            </div>
                            <p style={{
                              fontSize: '12px', color: 'var(--gray-500)', margin: '3px 0 4px',
                              fontFamily: "'DM Sans', sans-serif", lineHeight: 1.4,
                              display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
                            }}>
                              {item.mensaje}
                            </p>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <span style={{ fontSize: '11px', color: 'var(--gray-400)', fontFamily: "'DM Sans', sans-serif" }}>
                                {formatFecha(item.fecha)}
                              </span>
                              <span style={{
                                fontSize: '10px', padding: '1px 6px', borderRadius: '99px',
                                background: item.origen === 'aviso' ? 'var(--capyme-blue-pale)' : '#F0FDF4',
                                color: item.origen === 'aviso' ? 'var(--capyme-blue-mid)' : '#16A34A',
                                fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 700,
                              }}>
                                {item.origen === 'aviso' ? 'Aviso' : 'Personal'}
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

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

          <div style={{ position: 'relative', marginLeft: '2px' }} ref={userRef}>
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
                {[{ to: '/perfil', icon: User, label: 'Mi Perfil' }].map((item, i) => (
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