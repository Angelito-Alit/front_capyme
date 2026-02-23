import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../../components/common/Layout';
import { avisosService } from '../../services/avisosService';
import {
  BellRing,
  Search,
  AlertCircle,
  Info,
  Calendar,
  ExternalLink,
  ChevronDown,
  Clock,
  Users,
} from 'lucide-react';
import { toast } from 'react-hot-toast';

const ClienteAvisos = () => {
  const navigate = useNavigate();

  const [avisos, setAvisos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterTipo, setFilterTipo] = useState('');

  const inputBaseStyle = {
    width: '100%',
    padding: '10px 12px',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius-md)',
    fontSize: '14px',
    fontFamily: "'DM Sans', sans-serif",
    color: 'var(--gray-900)',
    background: '#fff',
    outline: 'none',
    transition: 'all 200ms ease',
    boxSizing: 'border-box',
  };
  const inputWithIconStyle = { ...inputBaseStyle, paddingLeft: '38px' };
  const selectStyle = {
    ...inputBaseStyle,
    appearance: 'none',
    paddingRight: '36px',
    cursor: 'pointer',
  };

  useEffect(() => {
    cargarAvisos();
  }, [filterTipo]);

  const cargarAvisos = async () => {
    try {
      setLoading(true);
      const params = { activo: 'true' };
      if (filterTipo) params.tipo = filterTipo;
      const res = await avisosService.getAll(params);
      const ahora = new Date();
      const vigentes = (res.data || []).filter(
        (a) => !a.fechaExpiracion || new Date(a.fechaExpiracion) > ahora
      );
      setAvisos(vigentes);
    } catch {
      toast.error('Error al cargar avisos');
    } finally {
      setLoading(false);
    }
  };

  const avisosFiltrados = avisos.filter((a) =>
    a.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
    a.contenido.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getTipoConfig = (tipo) => {
    const map = {
      urgente:      { bg: '#FEF2F2', color: '#DC2626', border: '#FECACA', label: 'Urgente',      accent: '#DC2626' },
      evento:       { bg: '#F5F3FF', color: '#7C3AED', border: '#DDD6FE', label: 'Evento',       accent: '#7C3AED' },
      recordatorio: { bg: '#FFFBEB', color: '#D97706', border: '#FDE68A', label: 'Recordatorio', accent: '#D97706' },
      informativo:  { bg: 'var(--capyme-blue-pale)', color: 'var(--capyme-blue-mid)', border: '#BFDBFE', label: 'Informativo', accent: 'var(--capyme-blue-mid)' },
    };
    return map[tipo] || map.informativo;
  };

  const getTipoIcon = (tipo, size = '15px') => {
    const s = { width: size, height: size, flexShrink: 0 };
    if (tipo === 'urgente') return <AlertCircle style={s} />;
    if (tipo === 'evento') return <Calendar style={s} />;
    if (tipo === 'recordatorio') return <BellRing style={s} />;
    return <Info style={s} />;
  };

  const formatDate = (date) => {
    if (!date) return null;
    return new Date(date).toLocaleDateString('es-MX', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  if (loading) {
    return (
      <Layout>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '300px', flexDirection: 'column', gap: '16px' }}>
          <div style={{ width: '40px', height: '40px', border: '3px solid var(--gray-200)', borderTopColor: 'var(--capyme-blue-mid)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
          <span style={{ fontSize: '14px', color: 'var(--gray-500)', fontFamily: "'DM Sans', sans-serif" }}>Cargando avisos…</span>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeInUp { from { opacity:0; transform:translateY(10px);} to {opacity:1;transform:translateY(0);} }
        .aviso-card { transition: box-shadow 200ms ease, transform 200ms ease; }
        .aviso-card:hover { box-shadow: 0 8px 24px rgba(31,78,158,0.10); transform: translateY(-2px); }
      `}</style>

      <div style={{ padding: '0 0 40px' }}>

        {/* ── HEADER ── */}
        <div style={{ marginBottom: '28px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{ width: '46px', height: '46px', background: 'linear-gradient(135deg, var(--capyme-blue-mid), var(--capyme-blue))', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(31,78,158,0.25)', flexShrink: 0 }}>
              <BellRing style={{ width: '22px', height: '22px', color: '#fff' }} />
            </div>
            <div>
              <h1 style={{ fontSize: '22px', fontWeight: 800, color: 'var(--gray-900)', fontFamily: "'Plus Jakarta Sans', sans-serif", margin: 0, lineHeight: 1.2 }}>
                Avisos y Noticias
              </h1>
              <p style={{ fontSize: '13px', color: 'var(--gray-500)', margin: '3px 0 0', fontFamily: "'DM Sans', sans-serif" }}>
                {avisos.length} aviso{avisos.length !== 1 ? 's' : ''} activo{avisos.length !== 1 ? 's' : ''}
              </p>
            </div>
          </div>
        </div>

        {/* ── BANNER URGENTE (si hay) ── */}
        {avisos.some((a) => a.tipo === 'urgente') && (
          <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 'var(--radius-lg)', padding: '14px 18px', marginBottom: '20px', display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
            <AlertCircle style={{ width: '18px', height: '18px', color: '#DC2626', flexShrink: 0, marginTop: '1px' }} />
            <div>
              <p style={{ fontSize: '13px', fontWeight: 700, color: '#DC2626', margin: '0 0 2px', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                Hay {avisos.filter((a) => a.tipo === 'urgente').length} aviso{avisos.filter((a) => a.tipo === 'urgente').length > 1 ? 's' : ''} urgente{avisos.filter((a) => a.tipo === 'urgente').length > 1 ? 's' : ''}
              </p>
              <p style={{ fontSize: '12px', color: '#B91C1C', margin: 0, fontFamily: "'DM Sans', sans-serif" }}>
                Revisa los avisos marcados en rojo a continuación
              </p>
            </div>
          </div>
        )}

        {/* ── FILTROS ── */}
        <div style={{ background: '#fff', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '14px 18px', marginBottom: '20px', display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap', boxShadow: 'var(--shadow-sm)' }}>
          <div style={{ position: 'relative', flex: '1', minWidth: '180px' }}>
            <Search style={{ position: 'absolute', left: '11px', top: '50%', transform: 'translateY(-50%)', width: '15px', height: '15px', color: 'var(--gray-400)', pointerEvents: 'none' }} />
            <input type="text" placeholder="Buscar aviso…" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} style={inputWithIconStyle} />
          </div>
          <div style={{ position: 'relative', minWidth: '160px' }}>
            <select value={filterTipo} onChange={(e) => setFilterTipo(e.target.value)} style={{ ...selectStyle, width: '100%' }}>
              <option value="">Todos los tipos</option>
              <option value="informativo">Informativos</option>
              <option value="urgente">Urgentes</option>
              <option value="evento">Eventos</option>
              <option value="recordatorio">Recordatorios</option>
            </select>
            <ChevronDown style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', width: '14px', height: '14px', color: 'var(--gray-400)', pointerEvents: 'none' }} />
          </div>
        </div>

        {/* ── CARDS ── */}
        {avisosFiltrados.length === 0 ? (
          <div style={{ background: '#fff', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '60px 20px', textAlign: 'center', boxShadow: 'var(--shadow-sm)' }}>
            <div style={{ width: '56px', height: '56px', background: 'var(--gray-100)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' }}>
              <BellRing style={{ width: '24px', height: '24px', color: 'var(--gray-400)' }} />
            </div>
            <p style={{ fontSize: '15px', fontWeight: 600, color: 'var(--gray-700)', margin: '0 0 6px', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Sin avisos por el momento</p>
            <p style={{ fontSize: '13px', color: 'var(--gray-400)', margin: 0, fontFamily: "'DM Sans', sans-serif" }}>Vuelve más tarde para ver nuevas noticias</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {avisosFiltrados.map((aviso, idx) => {
              const tipoConfig = getTipoConfig(aviso.tipo);
              return (
                <div
                  key={aviso.id}
                  className="aviso-card"
                  onClick={() => navigate(`/cliente/avisos/${aviso.id}`)}
                  style={{
                    background: '#fff',
                    border: '1px solid var(--border)',
                    borderLeft: `4px solid ${tipoConfig.accent}`,
                    borderRadius: 'var(--radius-lg)',
                    padding: '20px 24px',
                    cursor: 'pointer',
                    animation: `fadeInUp 0.3s ease both`,
                    animationDelay: `${idx * 40}ms`,
                    boxShadow: 'var(--shadow-sm)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px', flex: 1, minWidth: 0 }}>

                      {/* Ícono */}
                      <div style={{ width: '42px', height: '42px', borderRadius: 'var(--radius-md)', background: tipoConfig.bg, border: `1px solid ${tipoConfig.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: tipoConfig.color, flexShrink: 0 }}>
                        {getTipoIcon(aviso.tipo, '18px')}
                      </div>

                      <div style={{ flex: 1, minWidth: 0 }}>
                        {/* Badges */}
                        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '6px' }}>
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '2px 8px', borderRadius: '20px', fontSize: '10px', fontWeight: 700, background: tipoConfig.bg, color: tipoConfig.color, fontFamily: "'Plus Jakarta Sans', sans-serif", textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                            {getTipoIcon(aviso.tipo, '10px')}
                            {tipoConfig.label}
                          </span>
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px', padding: '2px 8px', borderRadius: '20px', fontSize: '10px', fontWeight: 600, background: 'var(--gray-100)', color: 'var(--gray-500)', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                            <Users style={{ width: '9px', height: '9px' }} />
                            {aviso.destinatario === 'todos' ? 'Todos' : aviso.destinatario === 'clientes' ? 'Clientes' : 'Colaboradores'}
                          </span>
                        </div>

                        {/* Título */}
                        <h3 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--gray-900)', fontFamily: "'Plus Jakarta Sans', sans-serif", margin: '0 0 6px', lineHeight: 1.3 }}>
                          {aviso.titulo}
                        </h3>

                        {/* Contenido preview */}
                        <p style={{ fontSize: '13px', color: 'var(--gray-500)', fontFamily: "'DM Sans', sans-serif", margin: '0 0 12px', lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                          {aviso.contenido}
                        </p>

                        {/* Meta */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                            <Clock style={{ width: '12px', height: '12px', color: 'var(--gray-400)' }} />
                            <span style={{ fontSize: '12px', color: 'var(--gray-400)', fontFamily: "'DM Sans', sans-serif" }}>
                              {formatDate(aviso.fechaPublicacion)}
                            </span>
                          </div>
                          {aviso.fechaExpiracion && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                              <Calendar style={{ width: '12px', height: '12px', color: 'var(--gray-400)' }} />
                              <span style={{ fontSize: '12px', color: 'var(--gray-400)', fontFamily: "'DM Sans', sans-serif" }}>
                                Hasta {formatDate(aviso.fechaExpiracion)}
                              </span>
                            </div>
                          )}
                          {aviso.linkExterno && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <ExternalLink style={{ width: '12px', height: '12px', color: 'var(--capyme-blue-mid)' }} />
                              <span style={{ fontSize: '12px', color: 'var(--capyme-blue-mid)', fontFamily: "'DM Sans', sans-serif", fontWeight: 600 }}>
                                Enlace disponible
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Flecha indicador */}
                    <div style={{ flexShrink: 0, alignSelf: 'center' }}>
                      <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--gray-100)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--gray-400)' }}>
                        <ExternalLink style={{ width: '14px', height: '14px' }} />
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default ClienteAvisos;