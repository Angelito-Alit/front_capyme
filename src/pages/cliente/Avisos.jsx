import { useState, useEffect } from 'react';
import Layout from '../../components/common/Layout';
import api from '../../services/axios';
import {
  BellRing,
  Search,
  AlertCircle,
  Info,
  Calendar,
  ExternalLink,
  Clock,
  ChevronDown,
} from 'lucide-react';
import { toast } from 'react-hot-toast';

const tipoConfig = {
  informativo:  { label: 'Informativo',  icon: Info,         bg: '#EEF4FF', color: 'var(--capyme-blue-mid)', barColor: 'var(--capyme-blue-mid)' },
  urgente:      { label: 'Urgente',      icon: AlertCircle,  bg: '#FEF2F2', color: '#DC2626',               barColor: '#DC2626' },
  evento:       { label: 'Evento',       icon: Calendar,     bg: '#F5F3FF', color: '#7C3AED',               barColor: '#7C3AED' },
  recordatorio: { label: 'Recordatorio', icon: BellRing,     bg: '#FFFBEB', color: '#D97706',               barColor: '#D97706' },
};

const ClienteAvisos = () => {
  const authStorage = JSON.parse(localStorage.getItem('auth-storage') || '{}');
  const currentUser = authStorage?.state?.user || {};

  const [avisos, setAvisos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterTipo, setFilterTipo] = useState('');

  useEffect(() => {
    cargarAvisos();
  }, [filterTipo]);

  const cargarAvisos = async () => {
    try {
      setLoading(true);
      const params = { activo: true };
      if (filterTipo) params.tipo = filterTipo;
      const response = await api.get('/avisos', { params });
      setAvisos(response.data.data);
    } catch {
      toast.error('Error al cargar avisos');
    } finally {
      setLoading(false);
    }
  };

  const avisosFiltrados = avisos.filter(a =>
    a.titulo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    a.contenido?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDate = (date) => {
    if (!date) return null;
    return new Date(date).toLocaleDateString('es-MX', {
      year: 'numeric', month: 'short', day: 'numeric',
    });
  };

  const estaProximoAExpirar = (fecha) => {
    if (!fecha) return false;
    const dias = Math.ceil((new Date(fecha) - new Date()) / (1000 * 60 * 60 * 24));
    return dias >= 0 && dias <= 3;
  };

  const inputBaseStyle = {
    width: '100%', padding: '10px 12px',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius-md)',
    fontSize: '14px', fontFamily: "'DM Sans', sans-serif",
    color: 'var(--gray-900)', background: '#fff',
    outline: 'none', transition: 'all 200ms ease',
    boxSizing: 'border-box',
  };
  const selectStyle = { ...inputBaseStyle, appearance: 'none', paddingRight: '36px', cursor: 'pointer' };

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
            Cargando avisos...
          </p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

        <div>
          <h1 style={{
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            fontSize: '26px', fontWeight: 800,
            color: 'var(--gray-900)', letterSpacing: '-0.02em', marginBottom: '4px',
          }}>Avisos y Notificaciones</h1>
          <p style={{ fontSize: '14px', color: 'var(--gray-500)', fontFamily: "'DM Sans', sans-serif" }}>
            Mantente informado sobre novedades y eventos importantes
          </p>
        </div>

        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', flex: '1 1 240px' }}>
            <Search style={{
              position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)',
              width: '15px', height: '15px', color: 'var(--gray-400)', pointerEvents: 'none',
            }} />
            <input
              type="text"
              placeholder="Buscar avisos..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              style={{ ...inputBaseStyle, paddingLeft: '38px' }}
            />
          </div>
          <div style={{ position: 'relative', flex: '0 1 200px' }}>
            <select
              value={filterTipo}
              onChange={e => setFilterTipo(e.target.value)}
              style={selectStyle}
            >
              <option value="">Todos los tipos</option>
              <option value="informativo">Informativo</option>
              <option value="urgente">Urgente</option>
              <option value="evento">Evento</option>
              <option value="recordatorio">Recordatorio</option>
            </select>
            <ChevronDown style={{
              position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)',
              width: '14px', height: '14px', color: 'var(--gray-400)', pointerEvents: 'none',
            }} />
          </div>
        </div>

        {avisosFiltrados.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {avisosFiltrados.map(aviso => (
              <AvisoCard
                key={aviso.id}
                aviso={aviso}
                formatDate={formatDate}
                estaProximoAExpirar={estaProximoAExpirar}
              />
            ))}
          </div>
        ) : (
          <div style={{
            background: '#fff',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-lg)',
            boxShadow: 'var(--shadow-sm)',
            padding: '64px 32px',
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', textAlign: 'center', gap: '12px',
          }}>
            <div style={{
              width: '64px', height: '64px',
              borderRadius: 'var(--radius-lg)',
              background: '#EEF4FF',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              marginBottom: '4px',
            }}>
              <BellRing style={{ width: '28px', height: '28px', color: 'var(--capyme-blue-mid)' }} />
            </div>
            <h3 style={{
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              fontSize: '17px', fontWeight: 700, color: 'var(--gray-900)',
            }}>
              {searchTerm || filterTipo ? 'Sin resultados' : 'No hay avisos disponibles'}
            </h3>
            <p style={{ fontSize: '14px', color: 'var(--gray-400)', fontFamily: "'DM Sans', sans-serif" }}>
              {searchTerm || filterTipo
                ? 'Intenta con otros filtros.'
                : 'Vuelve pronto, aquí aparecerán novedades y comunicados importantes.'}
            </p>
          </div>
        )}

      </div>
    </Layout>
  );
};

const AvisoCard = ({ aviso, formatDate, estaProximoAExpirar }) => {
  const cfg = tipoConfig[aviso.tipo] || tipoConfig.informativo;
  const Icon = cfg.icon;
  const proximoAExpirar = estaProximoAExpirar(aviso.fechaExpiracion);
  const pubDate = formatDate(aviso.fechaPublicacion);
  const expDate = formatDate(aviso.fechaExpiracion);

  return (
    <div
      style={{
        background: '#fff',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-lg)',
        boxShadow: 'var(--shadow-sm)',
        overflow: 'hidden',
        transition: 'all 200ms ease',
        display: 'flex',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.08)';
        e.currentTarget.style.transform = 'translateY(-1px)';
      }}
      onMouseLeave={e => {
        e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
        e.currentTarget.style.transform = 'translateY(0)';
      }}
    >
      <div style={{
        width: '4px',
        flexShrink: 0,
        background: cfg.barColor,
      }} />

      <div style={{ padding: '18px 20px', flex: 1, display: 'flex', gap: '14px', alignItems: 'flex-start' }}>

        <div style={{
          width: '38px', height: '38px', flexShrink: 0,
          borderRadius: 'var(--radius-md)',
          background: cfg.bg,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          marginTop: '1px',
        }}>
          <Icon style={{ width: '18px', height: '18px', color: cfg.color }} />
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>

          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '10px', marginBottom: '6px', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <h3 style={{
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                fontSize: '15px', fontWeight: 700,
                color: 'var(--gray-900)',
              }}>
                {aviso.titulo}
              </h3>
              <span style={{
                padding: '2px 8px',
                background: cfg.bg,
                color: cfg.color,
                borderRadius: '99px',
                fontSize: '11px', fontWeight: 700,
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                whiteSpace: 'nowrap',
              }}>
                {cfg.label}
              </span>
            </div>

            {proximoAExpirar && (
              <span style={{
                display: 'inline-flex', alignItems: 'center', gap: '4px',
                padding: '3px 8px',
                background: '#FEF2F2',
                color: '#DC2626',
                borderRadius: '99px',
                fontSize: '11px', fontWeight: 700,
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                whiteSpace: 'nowrap', flexShrink: 0,
              }}>
                <Clock style={{ width: '10px', height: '10px' }} />
                Próximo a vencer
              </span>
            )}
          </div>

          <p style={{
            fontSize: '14px', color: 'var(--gray-600)',
            fontFamily: "'DM Sans', sans-serif",
            lineHeight: 1.6, marginBottom: '12px',
          }}>
            {aviso.contenido}
          </p>

          <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '14px' }}>
            {pubDate && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                <Calendar style={{ width: '12px', height: '12px', color: 'var(--gray-400)' }} />
                <span style={{ fontSize: '12px', color: 'var(--gray-400)', fontFamily: "'DM Sans', sans-serif" }}>
                  Publicado: {pubDate}
                </span>
              </div>
            )}
            {expDate && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                <Clock style={{ width: '12px', height: '12px', color: proximoAExpirar ? '#DC2626' : 'var(--gray-400)' }} />
                <span style={{
                  fontSize: '12px',
                  color: proximoAExpirar ? '#DC2626' : 'var(--gray-400)',
                  fontWeight: proximoAExpirar ? 600 : 400,
                  fontFamily: "'DM Sans', sans-serif",
                }}>
                  Expira: {expDate}
                </span>
              </div>
            )}
            {aviso.linkExterno && (
              <a
                href={aviso.linkExterno}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: '4px',
                  fontSize: '12px', fontWeight: 600,
                  color: 'var(--capyme-blue-mid)',
                  textDecoration: 'none',
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  transition: 'opacity 150ms ease',
                }}
                onMouseEnter={e => e.currentTarget.style.opacity = '0.75'}
                onMouseLeave={e => e.currentTarget.style.opacity = '1'}
              >
                <ExternalLink style={{ width: '12px', height: '12px' }} />
                Más información
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClienteAvisos;