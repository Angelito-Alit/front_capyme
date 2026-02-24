import { useState, useEffect, useRef } from 'react';
import { Bell, X, CheckCheck, GraduationCap, Info } from 'lucide-react';
import { notificacionesService } from '../../services/notificacionesService';

const Notificaciones = () => {
  const [open, setOpen] = useState(false);
  const [notificaciones, setNotificaciones] = useState([]);
  const [noLeidas, setNoLeidas] = useState(0);
  const ref = useRef(null);

  const cargar = async () => {
    try {
      const res = await notificacionesService.getAll();
      setNotificaciones(res.data);
      setNoLeidas(res.noLeidas);
    } catch {}
  };

  useEffect(() => {
    cargar();
    const interval = setInterval(cargar, 30000); // polling cada 30s
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const marcarLeida = async (id) => {
    await notificacionesService.marcarLeida(id);
    setNotificaciones(prev => prev.map(n => n.id === id ? { ...n, leida: true } : n));
    setNoLeidas(prev => Math.max(0, prev - 1));
  };

  const marcarTodas = async () => {
    await notificacionesService.marcarTodas();
    setNotificaciones(prev => prev.map(n => ({ ...n, leida: true })));
    setNoLeidas(0);
  };

  const formatFecha = (fecha) => {
    if (!fecha) return '';
    const diff = Date.now() - new Date(fecha).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'Ahora';
    if (mins < 60) return `Hace ${mins} min`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `Hace ${hours} h`;
    return new Date(fecha).toLocaleDateString('es-MX', { day: 'numeric', month: 'short' });
  };

  const getIcon = (tipo) => {
    if (tipo === 'inscripcion_declinada') return { bg: '#FEF2F2', color: '#DC2626', Icon: GraduationCap };
    if (tipo === 'pago_confirmado') return { bg: '#ECFDF5', color: '#16A34A', Icon: GraduationCap };
    return { bg: '#EEF4FF', color: 'var(--capyme-blue-mid)', Icon: Info };
  };

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      {/* Botón campana */}
      <button
        onClick={() => setOpen(!open)}
        style={{
          position: 'relative', width: '38px', height: '38px',
          border: '1px solid var(--border)', borderRadius: 'var(--radius-md)',
          background: open ? 'var(--capyme-blue-pale)' : '#fff',
          cursor: 'pointer', display: 'flex', alignItems: 'center',
          justifyContent: 'center', transition: 'all 150ms ease',
        }}
      >
        <Bell style={{ width: '18px', height: '18px', color: open ? 'var(--capyme-blue-mid)' : 'var(--gray-500)' }} />
        {noLeidas > 0 && (
          <span style={{
            position: 'absolute', top: '-4px', right: '-4px',
            background: '#EF4444', color: '#fff', borderRadius: '50%',
            width: '18px', height: '18px', fontSize: '10px', fontWeight: 700,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            border: '2px solid #fff',
          }}>
            {noLeidas > 9 ? '9+' : noLeidas}
          </span>
        )}
      </button>

      {/* Panel */}
      {open && (
        <div style={{
          position: 'absolute', top: '46px', right: 0,
          width: '360px', background: '#fff',
          border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)',
          boxShadow: '0 16px 48px rgba(0,0,0,0.14)',
          zIndex: 999, overflow: 'hidden',
          animation: 'fadeInDown 0.18s ease both',
        }}>
          <style>{`@keyframes fadeInDown { from { opacity:0; transform:translateY(-8px); } to { opacity:1; transform:translateY(0); } }`}</style>

          {/* Header */}
          <div style={{
            padding: '14px 16px', borderBottom: '1px solid var(--border)',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            background: 'var(--gray-50)',
          }}>
            <div>
              <span style={{ fontSize: '14px', fontWeight: 700, color: 'var(--gray-900)', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                Notificaciones
              </span>
              {noLeidas > 0 && (
                <span style={{
                  marginLeft: '8px', padding: '1px 7px', borderRadius: '20px',
                  background: '#EEF4FF', color: 'var(--capyme-blue-mid)',
                  fontSize: '11px', fontWeight: 700,
                }}>
                  {noLeidas} nuevas
                </span>
              )}
            </div>
            {noLeidas > 0 && (
              <button onClick={marcarTodas} style={{
                display: 'flex', alignItems: 'center', gap: '4px',
                padding: '4px 8px', border: 'none', borderRadius: 'var(--radius-sm)',
                background: 'transparent', cursor: 'pointer',
                color: 'var(--capyme-blue-mid)', fontSize: '12px', fontWeight: 600,
                fontFamily: "'DM Sans', sans-serif",
              }}>
                <CheckCheck style={{ width: '13px', height: '13px' }} />
                Marcar todas
              </button>
            )}
          </div>

          {/* Lista */}
          <div style={{ maxHeight: '380px', overflowY: 'auto' }}>
            {notificaciones.length === 0 ? (
              <div style={{ padding: '40px 20px', textAlign: 'center' }}>
                <Bell style={{ width: '28px', height: '28px', color: 'var(--gray-300)', margin: '0 auto 8px', display: 'block' }} />
                <p style={{ fontSize: '13px', color: 'var(--gray-400)', margin: 0, fontFamily: "'DM Sans', sans-serif" }}>
                  Sin notificaciones
                </p>
              </div>
            ) : (
              notificaciones.map(n => {
                const { bg, color, Icon } = getIcon(n.tipo);
                return (
                  <div
                    key={n.id}
                    onClick={() => !n.leida && marcarLeida(n.id)}
                    style={{
                      padding: '12px 16px', borderBottom: '1px solid var(--gray-100)',
                      display: 'flex', gap: '12px', alignItems: 'flex-start',
                      background: n.leida ? '#fff' : '#F8FAFF',
                      cursor: n.leida ? 'default' : 'pointer',
                      transition: 'background 150ms ease',
                    }}
                    onMouseEnter={e => { if (!n.leida) e.currentTarget.style.background = '#EEF4FF'; }}
                    onMouseLeave={e => { e.currentTarget.style.background = n.leida ? '#fff' : '#F8FAFF'; }}
                  >
                    <div style={{
                      width: '34px', height: '34px', borderRadius: 'var(--radius-md)',
                      background: bg, display: 'flex', alignItems: 'center',
                      justifyContent: 'center', flexShrink: 0,
                    }}>
                      <Icon style={{ width: '16px', height: '16px', color }} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px' }}>
                        <span style={{
                          fontSize: '13px', fontWeight: n.leida ? 500 : 700,
                          color: 'var(--gray-900)', fontFamily: "'DM Sans', sans-serif",
                          lineHeight: 1.3,
                        }}>
                          {n.titulo}
                        </span>
                        {!n.leida && (
                          <span style={{
                            width: '7px', height: '7px', borderRadius: '50%',
                            background: 'var(--capyme-blue-mid)', flexShrink: 0, marginTop: '3px',
                          }} />
                        )}
                      </div>
                      <p style={{
                        fontSize: '12px', color: 'var(--gray-500)', margin: '3px 0 4px',
                        fontFamily: "'DM Sans', sans-serif", lineHeight: 1.4,
                      }}>
                        {n.mensaje}
                      </p>
                      <span style={{ fontSize: '11px', color: 'var(--gray-400)', fontFamily: "'DM Sans', sans-serif" }}>
                        {formatFecha(n.fechaCreacion)}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Notificaciones;