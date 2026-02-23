import { useState, useEffect } from 'react';
import Layout from '../../components/common/Layout';
import api from '../../services/axios';
import {
  Link2,
  Search,
  ExternalLink,
  Video,
  FileText,
  DollarSign,
  ChevronDown,
  Tag,
} from 'lucide-react';
import { toast } from 'react-hot-toast';

const tipoConfig = {
  video:           { label: 'Video',          icon: Video,     bg: '#FEF2F2', color: '#DC2626' },
  financiamiento:  { label: 'Financiamiento', icon: DollarSign, bg: '#ECFDF5', color: '#059669' },
  documento:       { label: 'Documento',      icon: FileText,  bg: '#EEF4FF', color: 'var(--capyme-blue-mid)' },
  otro:            { label: 'Otro',           icon: Link2,     bg: 'var(--gray-100)', color: 'var(--gray-600)' },
};

const ClienteRecursos = () => {
  const authStorage = JSON.parse(localStorage.getItem('auth-storage') || '{}');
  const currentUser = authStorage?.state?.user || {};

  const [recursos, setRecursos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterTipo, setFilterTipo] = useState('');
  const [filterCategoria, setFilterCategoria] = useState('');

  useEffect(() => {
    cargarRecursos();
  }, [filterTipo, filterCategoria]);

  const cargarRecursos = async () => {
    try {
      setLoading(true);
      const params = { activo: true };
      if (filterTipo) params.tipo = filterTipo;
      if (filterCategoria) params.categoria = filterCategoria;
      const response = await api.get('/enlaces', { params });
      setRecursos(response.data.data);
    } catch {
      toast.error('Error al cargar recursos');
    } finally {
      setLoading(false);
    }
  };

  const categorias = [...new Set(recursos.map(r => r.categoria).filter(Boolean))];

  const recursosFiltrados = recursos.filter(r =>
    r.titulo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.descripcion?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const recursosPorTipo = filterTipo
    ? { [filterTipo]: recursosFiltrados }
    : recursosFiltrados.reduce((acc, r) => {
        const t = r.tipo || 'otro';
        if (!acc[t]) acc[t] = [];
        acc[t].push(r);
        return acc;
      }, {});

  const tipoOrden = ['video', 'financiamiento', 'documento', 'otro'];

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
            Cargando recursos...
          </p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap' }}>
          <div>
            <h1 style={{
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              fontSize: '26px', fontWeight: 800,
              color: 'var(--gray-900)', letterSpacing: '-0.02em', marginBottom: '4px',
            }}>Recursos Útiles</h1>
            <p style={{ fontSize: '14px', color: 'var(--gray-500)', fontFamily: "'DM Sans', sans-serif" }}>
              Videos, documentos y herramientas para impulsar tu negocio
            </p>
          </div>
          <div style={{
            display: 'flex', gap: '10px', flexWrap: 'wrap',
          }}>
            {Object.entries(tipoConfig).map(([tipo, cfg]) => {
              const Icon = cfg.icon;
              const count = recursos.filter(r => (r.tipo || 'otro') === tipo).length;
              if (count === 0) return null;
              return (
                <div key={tipo} style={{
                  display: 'flex', alignItems: 'center', gap: '6px',
                  padding: '6px 12px',
                  background: cfg.bg,
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border)',
                }}>
                  <Icon style={{ width: '13px', height: '13px', color: cfg.color }} />
                  <span style={{
                    fontSize: '12px', fontWeight: 700,
                    color: cfg.color,
                    fontFamily: "'Plus Jakarta Sans', sans-serif",
                  }}>
                    {count} {cfg.label}{count !== 1 ? 's' : ''}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', flex: '1 1 220px' }}>
            <Search style={{
              position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)',
              width: '15px', height: '15px', color: 'var(--gray-400)', pointerEvents: 'none',
            }} />
            <input
              type="text"
              placeholder="Buscar recursos..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              style={{ ...inputBaseStyle, paddingLeft: '38px' }}
            />
          </div>
          <div style={{ position: 'relative', flex: '0 1 180px' }}>
            <select
              value={filterTipo}
              onChange={e => setFilterTipo(e.target.value)}
              style={selectStyle}
            >
              <option value="">Todos los tipos</option>
              <option value="video">Videos</option>
              <option value="financiamiento">Financiamiento</option>
              <option value="documento">Documentos</option>
              <option value="otro">Otros</option>
            </select>
            <ChevronDown style={{
              position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)',
              width: '14px', height: '14px', color: 'var(--gray-400)', pointerEvents: 'none',
            }} />
          </div>
          {categorias.length > 0 && (
            <div style={{ position: 'relative', flex: '0 1 180px' }}>
              <select
                value={filterCategoria}
                onChange={e => setFilterCategoria(e.target.value)}
                style={selectStyle}
              >
                <option value="">Todas las categorías</option>
                {categorias.map((cat, i) => (
                  <option key={i} value={cat}>{cat}</option>
                ))}
              </select>
              <ChevronDown style={{
                position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)',
                width: '14px', height: '14px', color: 'var(--gray-400)', pointerEvents: 'none',
              }} />
            </div>
          )}
        </div>

        {recursosFiltrados.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
            {tipoOrden
              .filter(t => recursosPorTipo[t]?.length > 0)
              .map(tipo => {
                const cfg = tipoConfig[tipo] || tipoConfig.otro;
                const Icon = cfg.icon;
                const items = recursosPorTipo[tipo];
                return (
                  <div key={tipo}>
                    <div style={{
                      display: 'flex', alignItems: 'center', gap: '10px',
                      marginBottom: '14px',
                    }}>
                      <div style={{
                        width: '30px', height: '30px',
                        borderRadius: 'var(--radius-sm)',
                        background: cfg.bg,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}>
                        <Icon style={{ width: '15px', height: '15px', color: cfg.color }} />
                      </div>
                      <h2 style={{
                        fontFamily: "'Plus Jakarta Sans', sans-serif",
                        fontSize: '15px', fontWeight: 700, color: 'var(--gray-800)',
                      }}>
                        {cfg.label}s
                      </h2>
                      <span style={{
                        padding: '2px 8px',
                        background: cfg.bg,
                        color: cfg.color,
                        borderRadius: '99px',
                        fontSize: '11px', fontWeight: 700,
                        fontFamily: "'Plus Jakarta Sans', sans-serif",
                      }}>
                        {items.length}
                      </span>
                    </div>
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                      gap: '14px',
                    }}>
                      {items.map(recurso => (
                        <RecursoCard key={recurso.id} recurso={recurso} />
                      ))}
                    </div>
                  </div>
                );
              })}
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
              <Link2 style={{ width: '28px', height: '28px', color: 'var(--capyme-blue-mid)' }} />
            </div>
            <h3 style={{
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              fontSize: '17px', fontWeight: 700, color: 'var(--gray-900)',
            }}>
              {searchTerm || filterTipo || filterCategoria ? 'Sin resultados' : 'No hay recursos disponibles'}
            </h3>
            <p style={{ fontSize: '14px', color: 'var(--gray-400)', fontFamily: "'DM Sans', sans-serif" }}>
              {searchTerm || filterTipo || filterCategoria
                ? 'Intenta con otros filtros.'
                : 'Vuelve pronto, se añadirán recursos útiles para tu negocio.'}
            </p>
          </div>
        )}

      </div>
    </Layout>
  );
};

const RecursoCard = ({ recurso }) => {
  const cfg = tipoConfig[recurso.tipo] || tipoConfig.otro;
  const Icon = cfg.icon;

  return (
    <div
      style={{
        background: '#fff',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-lg)',
        boxShadow: 'var(--shadow-sm)',
        overflow: 'hidden',
        transition: 'all 200ms ease',
        display: 'flex', flexDirection: 'column',
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
        height: '3px',
        background: cfg.color === 'var(--capyme-blue-mid)'
          ? 'linear-gradient(90deg, var(--capyme-blue-mid), var(--capyme-blue))'
          : cfg.color === '#DC2626'
            ? 'linear-gradient(90deg, #DC2626, #FCA5A5)'
            : cfg.color === '#059669'
              ? 'linear-gradient(90deg, #059669, #34D399)'
              : 'linear-gradient(90deg, var(--gray-300), var(--gray-200))',
      }} />

      <div style={{ padding: '18px 18px', flex: 1, display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
          <div style={{
            width: '38px', height: '38px', flexShrink: 0,
            borderRadius: 'var(--radius-md)',
            background: cfg.bg,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Icon style={{ width: '18px', height: '18px', color: cfg.color }} />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <h3 style={{
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              fontSize: '14px', fontWeight: 700,
              color: 'var(--gray-900)', lineHeight: 1.3,
              marginBottom: '4px',
            }}>
              {recurso.titulo}
            </h3>
            {recurso.categoria && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Tag style={{ width: '10px', height: '10px', color: 'var(--gray-400)' }} />
                <span style={{
                  fontSize: '11px', color: 'var(--gray-400)',
                  fontFamily: "'DM Sans', sans-serif",
                }}>
                  {recurso.categoria}
                </span>
              </div>
            )}
          </div>
        </div>

        {recurso.descripcion && (
          <p style={{
            fontSize: '13px', color: 'var(--gray-500)',
            fontFamily: "'DM Sans', sans-serif",
            lineHeight: 1.5,
            display: '-webkit-box',
            WebkitLineClamp: 3,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            flex: 1,
          }}>
            {recurso.descripcion}
          </p>
        )}

        <a
          href={recurso.url}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
            padding: '8px 0',
            background: cfg.bg,
            borderRadius: 'var(--radius-md)',
            textDecoration: 'none',
            color: cfg.color,
            fontSize: '13px', fontWeight: 600,
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            transition: 'all 150ms ease',
            border: `1px solid ${cfg.color === 'var(--capyme-blue-mid)' ? 'rgba(31,78,158,0.15)' : 'transparent'}`,
            marginTop: 'auto',
          }}
          onMouseEnter={e => e.currentTarget.style.opacity = '0.8'}
          onMouseLeave={e => e.currentTarget.style.opacity = '1'}
        >
          <ExternalLink style={{ width: '13px', height: '13px' }} />
          Ver Recurso
        </a>
      </div>
    </div>
  );
};

export default ClienteRecursos;