import { useState, useEffect } from 'react';
import Layout from '../../components/common/Layout';
import { enlacesService } from '../../services/enlacesService';
import {
  ShoppingBag,
  Search,
  ExternalLink,
  Video,
  FileText,
  DollarSign,
  Link2,
  ChevronDown,
} from 'lucide-react';
import { toast } from 'react-hot-toast';

const ClienteRecursos = () => {
  const [enlaces, setEnlaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterTipo, setFilterTipo] = useState('');

  const inputBaseStyle = {
    width: '100%', padding: '10px 12px',
    border: '1px solid var(--border)', borderRadius: 'var(--radius-md)',
    fontSize: '14px', fontFamily: "'DM Sans', sans-serif",
    color: 'var(--gray-900)', background: '#fff',
    outline: 'none', transition: 'all 200ms ease', boxSizing: 'border-box',
  };
  const inputWithIconStyle = { ...inputBaseStyle, paddingLeft: '38px' };
  const selectStyle = { ...inputBaseStyle, appearance: 'none', paddingRight: '36px', cursor: 'pointer' };

  useEffect(() => { cargarEnlaces(); }, [filterTipo]);

  const cargarEnlaces = async () => {
    try {
      setLoading(true);
      const params = { activo: 'true' };
      if (filterTipo) params.tipo = filterTipo;
      const res = await enlacesService.getAll(params);
      setEnlaces(res.data);
    } catch { toast.error('Error al cargar catálogos'); }
    finally { setLoading(false); }
  };

  const enlacesFiltrados = enlaces.filter((e) =>
    e.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (e.descripcion || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (e.categoria || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getTipoStyle = (tipo) => ({
    video: { bg: '#FEF2F2', color: '#DC2626', icon: Video },
    financiamiento: { bg: '#F0FDF4', color: '#16A34A', icon: DollarSign },
    documento: { bg: '#EEF4FF', color: 'var(--capyme-blue-mid)', icon: FileText },
    otro: { bg: 'var(--gray-100)', color: 'var(--gray-600)', icon: Link2 },
  }[tipo] || { bg: 'var(--gray-100)', color: 'var(--gray-600)', icon: Link2 });

  const getTipoLabel = (tipo) => ({ video: 'Video', financiamiento: 'Financiamiento', documento: 'Documento', otro: 'Otro' }[tipo] || tipo);

  if (loading) return (
    <Layout>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '300px', flexDirection: 'column', gap: '16px' }}>
        <div style={{ width: '40px', height: '40px', border: '3px solid var(--gray-200)', borderTopColor: 'var(--capyme-blue-mid)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
        <span style={{ fontSize: '14px', color: 'var(--gray-500)', fontFamily: "'DM Sans', sans-serif" }}>Cargando catálogos...</span>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    </Layout>
  );

  return (
    <Layout>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeInUp { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
        .recurso-card { animation: fadeInUp 0.3s ease both; transition: box-shadow 200ms ease, transform 200ms ease; }
        .recurso-card:hover { box-shadow: 0 8px 24px rgba(31,78,158,0.10); transform: translateY(-2px); }
      `}</style>

      <div style={{ padding: '0 0 40px' }}>

        {/* ── HEADER ── */}
        <div style={{ marginBottom: '28px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '8px' }}>
            <div style={{ width: '46px', height: '46px', background: 'linear-gradient(135deg, var(--capyme-blue-mid), var(--capyme-blue))', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(31,78,158,0.25)' }}>
              <ShoppingBag style={{ width: '22px', height: '22px', color: '#fff' }} />
            </div>
            <div>
              <h1 style={{ fontSize: '22px', fontWeight: 800, color: 'var(--gray-900)', fontFamily: "'Plus Jakarta Sans', sans-serif", margin: 0, lineHeight: 1.2 }}>Catálogos de CAPYME</h1>
              <p style={{ fontSize: '13px', color: 'var(--gray-500)', margin: '3px 0 0', fontFamily: "'DM Sans', sans-serif" }}>
                Explora nuestros catálogos y recursos disponibles para ti
              </p>
            </div>
          </div>
        </div>

        {/* ── FILTERS ── */}
        <div style={{ background: '#fff', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '16px 20px', marginBottom: '20px', display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap', boxShadow: 'var(--shadow-sm)' }}>
          <div style={{ position: 'relative', flex: '1', minWidth: '180px' }}>
            <Search style={{ position: 'absolute', left: '11px', top: '50%', transform: 'translateY(-50%)', width: '15px', height: '15px', color: 'var(--gray-400)', pointerEvents: 'none' }} />
            <input type="text" placeholder="Buscar catálogo…" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} style={inputWithIconStyle} />
          </div>
          <div style={{ position: 'relative', minWidth: '150px' }}>
            <select value={filterTipo} onChange={(e) => setFilterTipo(e.target.value)} style={{ ...selectStyle, width: '100%' }}>
              <option value="">Todos los tipos</option>
              <option value="video">Video</option>
              <option value="financiamiento">Financiamiento</option>
              <option value="documento">Documento</option>
              <option value="otro">Otro</option>
            </select>
            <ChevronDown style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', width: '14px', height: '14px', color: 'var(--gray-400)', pointerEvents: 'none' }} />
          </div>
          <span style={{ fontSize: '13px', color: 'var(--gray-400)', fontFamily: "'DM Sans', sans-serif", marginLeft: 'auto', whiteSpace: 'nowrap' }}>
            {enlacesFiltrados.length} resultado{enlacesFiltrados.length !== 1 ? 's' : ''}
          </span>
        </div>

        {/* ── GRID ── */}
        {enlacesFiltrados.length === 0 ? (
          <div style={{ background: '#fff', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '60px 20px', textAlign: 'center', boxShadow: 'var(--shadow-sm)' }}>
            <div style={{ width: '56px', height: '56px', background: 'var(--gray-100)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' }}>
              <ShoppingBag style={{ width: '24px', height: '24px', color: 'var(--gray-400)' }} />
            </div>
            <p style={{ fontSize: '15px', fontWeight: 600, color: 'var(--gray-700)', margin: '0 0 6px', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>No hay catálogos disponibles</p>
            <p style={{ fontSize: '13px', color: 'var(--gray-400)', margin: 0, fontFamily: "'DM Sans', sans-serif" }}>Pronto agregaremos nuevos catálogos para ti</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
            {enlacesFiltrados.map((enlace, idx) => {
              const ts = getTipoStyle(enlace.tipo);
              const TIcon = ts.icon;
              return (
                <div
                  key={enlace.id}
                  className="recurso-card"
                  style={{ background: '#fff', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', overflow: 'hidden', animationDelay: `${idx * 40}ms` }}
                >
                  <div style={{ height: '4px', background: 'linear-gradient(90deg, var(--capyme-blue-mid), var(--capyme-blue))' }} />
                  <div style={{ padding: '20px' }}>

                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', marginBottom: '14px' }}>
                      <div style={{ width: '40px', height: '40px', background: ts.bg, borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <TIcon style={{ width: '18px', height: '18px', color: ts.color }} />
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <h3 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--gray-900)', fontFamily: "'Plus Jakarta Sans', sans-serif", margin: '0 0 6px', lineHeight: 1.3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{enlace.titulo}</h3>
                        <span style={{ padding: '2px 8px', borderRadius: '20px', fontSize: '11px', fontWeight: 700, background: ts.bg, color: ts.color, fontFamily: "'Plus Jakarta Sans', sans-serif", textTransform: 'uppercase', letterSpacing: '0.03em' }}>
                          {getTipoLabel(enlace.tipo)}
                        </span>
                      </div>
                    </div>

                    {enlace.descripcion && (
                      <p style={{ fontSize: '13px', color: 'var(--gray-500)', margin: '0 0 12px', fontFamily: "'DM Sans', sans-serif", lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                        {enlace.descripcion}
                      </p>
                    )}

                    {enlace.categoria && (
                      <div style={{ display: 'inline-flex', alignItems: 'center', padding: '3px 10px', background: 'var(--gray-100)', borderRadius: '20px', marginBottom: '14px' }}>
                        <span style={{ fontSize: '12px', color: 'var(--gray-600)', fontFamily: "'DM Sans', sans-serif", fontWeight: 600 }}>{enlace.categoria}</span>
                      </div>
                    )}

                    <div style={{ paddingTop: '14px', borderTop: '1px solid var(--gray-100)' }}>
                      <a
                        href={enlace.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '7px', padding: '9px 14px', background: 'linear-gradient(135deg, var(--capyme-blue-mid), var(--capyme-blue))', color: '#fff', border: 'none', borderRadius: 'var(--radius-md)', fontSize: '13px', fontWeight: 600, fontFamily: "'DM Sans', sans-serif", textDecoration: 'none', boxShadow: '0 2px 8px rgba(31,78,158,0.22)', transition: 'all 150ms ease' }}
                        onMouseEnter={(e) => { e.currentTarget.style.opacity = '0.9'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.opacity = '1'; e.currentTarget.style.transform = 'translateY(0)'; }}
                      >
                        <ExternalLink style={{ width: '14px', height: '14px' }} />
                        Ver catálogo
                      </a>
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

export default ClienteRecursos;