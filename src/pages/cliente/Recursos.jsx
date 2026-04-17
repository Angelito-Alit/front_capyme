import { useState, useEffect } from 'react';
import Layout from '../../components/common/Layout';
import { enlacesService } from '../../services/enlacesService';
import { pagosService } from '../../services/pagosService';
import {
  Link2, Search, ExternalLink, Video, FileText, DollarSign,
  ChevronDown, Tag, CheckCircle, AlertCircle,
} from 'lucide-react';
import { toast } from 'react-hot-toast';

const tipoConfig = {
  video:          { label: 'Video',          icon: Video,      bg: '#FEF2F2', color: '#DC2626' },
  financiamiento: { label: 'Financiamiento', icon: DollarSign, bg: '#ECFDF5', color: '#059669' },
  documento:      { label: 'Documento',      icon: FileText,   bg: '#EEF4FF', color: 'var(--capyme-blue-mid)' },
  otro:           { label: 'Otro',           icon: Link2,      bg: 'var(--gray-100)', color: 'var(--gray-600)' },
};

const MPLogo = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0 }}>
    <circle cx="12" cy="12" r="12" fill="white" fillOpacity="0.22"/>
    <path d="M5.5 12.5C5.5 9.46 7.96 7 11 7C13.54 7 15.68 8.73 16.3 11.08H14.19C13.63 9.67 12.44 8.67 11 8.67C9.03 8.67 7.42 10.41 7.42 12.5C7.42 14.59 9.03 16.33 11 16.33C12.44 16.33 13.63 15.33 14.19 13.92H16.3C15.68 16.27 13.54 18 11 18C7.96 18 5.5 15.54 5.5 12.5Z" fill="white"/>
  </svg>
);

const Spinner = ({ size = 14, trackColor = 'rgba(255,255,255,0.3)', headColor = 'white' }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" style={{ animation: 'mpSpin 0.8s linear infinite', flexShrink: 0 }}>
    <circle cx="8" cy="8" r="6" fill="none" stroke={trackColor} strokeWidth="2"/>
    <path d="M8 2 A6 6 0 0 1 14 8" fill="none" stroke={headColor} strokeWidth="2" strokeLinecap="round"/>
  </svg>
);
const ClienteRecursos = () => {
  const [recursos,        setRecursos]        = useState([]);
  const [loading,         setLoading]         = useState(true);
  const [procesando,      setProcesando]      = useState(null);
  const [searchTerm,      setSearchTerm]      = useState('');
  const [filterTipo,      setFilterTipo]      = useState('');
  const [filterCategoria, setFilterCategoria] = useState('');

  const inputBase = { width: '100%', padding: '10px 12px', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', fontSize: '14px', fontFamily: "'DM Sans',sans-serif", color: 'var(--gray-900)', background: '#fff', outline: 'none', transition: 'all 200ms ease', boxSizing: 'border-box' };
  const selectSt  = { ...inputBase, appearance: 'none', paddingRight: '36px', cursor: 'pointer' };

  useEffect(() => { cargarRecursos(); }, [filterTipo, filterCategoria]);

  const cargarRecursos = async () => {
    try {
      setLoading(true);
      const params = { activo: true };
      if (filterTipo)      params.tipo      = filterTipo;
      if (filterCategoria) params.categoria = filterCategoria;
      const res = await enlacesService.getAll(params);
      setRecursos(res.data || []);
    } catch { toast.error('Error al cargar recursos'); }
    finally  { setLoading(false); }
  };

  const handleAcceso = async (recurso) => {
    const costo    = recurso.costo ? parseFloat(recurso.costo) : 0;
    const esGratis = costo === 0;

    try {
      setProcesando(recurso.id);
      const res = await enlacesService.solicitarAcceso(recurso.id);

      if (esGratis) {
        toast.success('¡Acceso otorgado!');
        cargarRecursos();
        return;
      }

      const referencia = res.pagoInfo?.referencia;
      if (!referencia) { toast.error('No se pudo obtener la referencia'); return; }

      const resPago = await pagosService.crearPreferencia({
        titulo:       `Acceso: ${recurso.titulo}`,
        precio:       costo,
        cantidad:     1,
        idReferencia: referencia,
        tipo:         'recurso',
      });

      if (resPago.success && resPago.init_point) {
        window.location.href = resPago.init_point;
      } else {
        toast.error('No se pudo iniciar el pago. Intenta de nuevo.');
      }

    } catch (error) {
      const data = error.response?.data;

      if (data?.pagoExistente) {
        try {
          const { referencia, monto, tituloRecurso } = data.pagoExistente;
          const resPago = await pagosService.crearPreferencia({
            titulo:       `Acceso: ${tituloRecurso}`,
            precio:       parseFloat(monto),
            cantidad:     1,
            idReferencia: referencia,
            tipo:         'recurso',
          });
          if (resPago.success && resPago.init_point) window.location.href = resPago.init_point;
        } catch { toast.error('No se pudo reanudar el pago.'); }
        return;
      }

      toast.error(data?.message || 'Error al solicitar acceso');
    } finally {
      setProcesando(null);
    }
  };

  const fmt        = (a) => a != null ? new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(a) : '';
  const categorias = [...new Set(recursos.map(r => r.categoria).filter(Boolean))];
  const filtrados  = recursos.filter(r =>
    r.titulo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.descripcion?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const porTipo    = filterTipo
    ? { [filterTipo]: filtrados }
    : filtrados.reduce((acc, r) => { const t = r.tipo || 'otro'; if (!acc[t]) acc[t] = []; acc[t].push(r); return acc; }, {});
  const tipoOrden  = ['video', 'financiamiento', 'documento', 'otro'];

  if (loading) return (
    <Layout>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '320px', flexDirection: 'column', gap: '16px' }}>
        <div style={{ width: '40px', height: '40px', border: '3px solid var(--border)', borderTopColor: 'var(--capyme-blue-mid)', borderRadius: '50%', animation: 'spin 700ms linear infinite' }}/>
        <style>{`@keyframes spin{to{transform:rotate(360deg);}}`}</style>
      </div>
    </Layout>
  );

  return (
    <Layout>
      <style>{`
        @keyframes spin     { to { transform: rotate(360deg); } }
        @keyframes mpSpin   { to { transform: rotate(360deg); } }
        @keyframes fadeInUp { from{opacity:0;transform:translateY(12px);}to{opacity:1;transform:translateY(0);} }
        .recurso-card { animation: fadeInUp 0.3s ease both; transition: box-shadow 200ms, transform 200ms; }
        .recurso-card:hover { box-shadow: 0 6px 20px rgba(0,0,0,0.10); transform: translateY(-2px); }
        .mp-btn { transition: all 160ms ease; }
        .mp-btn:hover:not(:disabled) { filter: brightness(1.07); transform: translateY(-1px) !important; box-shadow: 0 8px 22px rgba(0,158,227,0.48) !important; }
        .mp-btn:active:not(:disabled) { transform: translateY(0) !important; }
      `}</style>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap' }}>
          <div>
            <h1 style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontSize: '26px', fontWeight: 800, color: 'var(--gray-900)', letterSpacing: '-0.02em', marginBottom: '4px' }}>Recursos Útiles</h1>
            <p style={{ fontSize: '14px', color: 'var(--gray-500)', fontFamily: "'DM Sans',sans-serif" }}>Videos, documentos y herramientas para impulsar tu negocio</p>
          </div>
          {/* Badges de tipo */}
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            {Object.entries(tipoConfig).map(([tipo, cfg]) => {
              const Icon  = cfg.icon;
              const count = recursos.filter(r => (r.tipo || 'otro') === tipo).length;
              if (!count) return null;
              return (
                <div key={tipo} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 12px', background: cfg.bg, borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
                  <Icon style={{ width: '13px', height: '13px', color: cfg.color }}/>
                  <span style={{ fontSize: '12px', fontWeight: 700, color: cfg.color, fontFamily: "'Plus Jakarta Sans',sans-serif" }}>{count} {cfg.label}{count !== 1 ? 's' : ''}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Filtros */}
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', flex: '1 1 220px' }}>
            <Search style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', width: '15px', height: '15px', color: 'var(--gray-400)', pointerEvents: 'none' }}/>
            <input type="text" placeholder="Buscar recursos…" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} style={{ ...inputBase, paddingLeft: '38px' }}/>
          </div>
          <div style={{ position: 'relative', flex: '0 1 180px' }}>
            <select value={filterTipo} onChange={e => setFilterTipo(e.target.value)} style={selectSt}>
              <option value="">Todos los tipos</option>
              <option value="video">Videos</option>
              <option value="financiamiento">Financiamiento</option>
              <option value="documento">Documentos</option>
              <option value="otro">Otros</option>
            </select>
            <ChevronDown style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', width: '14px', height: '14px', color: 'var(--gray-400)', pointerEvents: 'none' }}/>
          </div>
          {categorias.length > 0 && (
            <div style={{ position: 'relative', flex: '0 1 180px' }}>
              <select value={filterCategoria} onChange={e => setFilterCategoria(e.target.value)} style={selectSt}>
                <option value="">Todas las categorías</option>
                {categorias.map((c, i) => <option key={i} value={c}>{c}</option>)}
              </select>
              <ChevronDown style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', width: '14px', height: '14px', color: 'var(--gray-400)', pointerEvents: 'none' }}/>
            </div>
          )}
        </div>

        {/* Tarjetas */}
        {filtrados.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
            {tipoOrden.filter(t => porTipo[t]?.length > 0).map(tipo => {
              const cfg  = tipoConfig[tipo] || tipoConfig.otro;
              const Icon = cfg.icon;
              const items = porTipo[tipo];
              return (
                <div key={tipo}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
                    <div style={{ width: '30px', height: '30px', borderRadius: 'var(--radius-sm)', background: cfg.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Icon style={{ width: '15px', height: '15px', color: cfg.color }}/>
                    </div>
                    <h2 style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontSize: '15px', fontWeight: 700, color: 'var(--gray-800)' }}>{cfg.label}s</h2>
                    <span style={{ padding: '2px 8px', background: cfg.bg, color: cfg.color, borderRadius: '99px', fontSize: '11px', fontWeight: 700, fontFamily: "'Plus Jakarta Sans',sans-serif" }}>{items.length}</span>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))', gap: '14px' }}>
                    {items.map((recurso, idx) => (
                      <RecursoCard
                        key={recurso.id}
                        recurso={recurso}
                        onAcceso={handleAcceso}
                        procesando={procesando === recurso.id}
                        idx={idx}
                        fmt={fmt}
                      />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div style={{ background: '#fff', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '64px 32px', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '12px' }}>
            <div style={{ width: '64px', height: '64px', borderRadius: 'var(--radius-lg)', background: '#EEF4FF', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '4px' }}>
              <Link2 style={{ width: '28px', height: '28px', color: 'var(--capyme-blue-mid)' }}/>
            </div>
            <h3 style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontSize: '17px', fontWeight: 700, color: 'var(--gray-900)' }}>
              {searchTerm || filterTipo || filterCategoria ? 'Sin resultados' : 'No hay recursos disponibles'}
            </h3>
            <p style={{ fontSize: '14px', color: 'var(--gray-400)', fontFamily: "'DM Sans',sans-serif" }}>
              {searchTerm || filterTipo || filterCategoria ? 'Intenta con otros filtros.' : 'Vuelve pronto, se añadirán recursos para tu negocio.'}
            </p>
          </div>
        )}
      </div>
    </Layout>
  );
};

const RecursoCard = ({ recurso, onAcceso, procesando, idx, fmt }) => {
  const cfg        = tipoConfig[recurso.tipo] || tipoConfig.otro;
  const Icon       = cfg.icon;
  const costo      = recurso.costo ? parseFloat(recurso.costo) : 0;
  const esGratis   = costo === 0;
  const miAcceso   = recurso.miAcceso;
  const tieneAcceso   = miAcceso?.estado === 'activo';
  const pagoPendiente = miAcceso?.estadoPago === 'pendiente' || miAcceso?.pago?.estadoPago === 'pendiente';

  const barColor = cfg.color === 'var(--capyme-blue-mid)'
    ? 'linear-gradient(90deg,var(--capyme-blue-mid),var(--capyme-blue))'
    : cfg.color === '#DC2626' ? 'linear-gradient(90deg,#DC2626,#FCA5A5)'
    : cfg.color === '#059669' ? 'linear-gradient(90deg,#059669,#34D399)'
    : 'linear-gradient(90deg,var(--gray-300),var(--gray-200))';

  return (
    <div className="recurso-card" style={{ background: '#fff', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-sm)', overflow: 'hidden', display: 'flex', flexDirection: 'column', animationDelay: `${idx * 40}ms` }}>
      <div style={{ height: '3px', background: barColor }}/>

      <div style={{ padding: '18px', flex: 1, display: 'flex', flexDirection: 'column', gap: '10px' }}>

        {/* Cabecera */}
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
          <div style={{ width: '38px', height: '38px', flexShrink: 0, borderRadius: 'var(--radius-md)', background: cfg.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Icon style={{ width: '18px', height: '18px', color: cfg.color }}/>
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <h3 style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontSize: '14px', fontWeight: 700, color: 'var(--gray-900)', lineHeight: 1.3, marginBottom: '5px' }}>{recurso.titulo}</h3>
            <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap', alignItems: 'center' }}>
              {recurso.categoria && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Tag style={{ width: '10px', height: '10px', color: 'var(--gray-400)' }}/>
                  <span style={{ fontSize: '11px', color: 'var(--gray-400)', fontFamily: "'DM Sans',sans-serif" }}>{recurso.categoria}</span>
                </div>
              )}
              <span style={{ padding: '2px 7px', borderRadius: '20px', fontSize: '10px', fontWeight: 700, background: esGratis ? '#ECFDF5' : '#EFF8FF', color: esGratis ? '#065F46' : '#0369A1', fontFamily: "'Plus Jakarta Sans',sans-serif" }}>
                {esGratis ? 'Gratis' : fmt(costo)}
              </span>
            </div>
          </div>
        </div>

        {/* Descripción */}
        {recurso.descripcion && (
          <p style={{ fontSize: '13px', color: 'var(--gray-500)', fontFamily: "'DM Sans',sans-serif", lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden', flex: 1 }}>
            {recurso.descripcion}
          </p>
        )}

        {/* CTA */}
        <div style={{ marginTop: 'auto' }}>
          {tieneAcceso ? (
            /* ── Ya tiene acceso ── */
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', padding: '8px', background: '#ECFDF5', borderRadius: 'var(--radius-md)', border: '1px solid #BBF7D0' }}>
                <CheckCircle style={{ width: '14px', height: '14px', color: '#16A34A' }}/>
                <span style={{ fontSize: '13px', fontWeight: 700, color: '#065F46', fontFamily: "'Plus Jakarta Sans',sans-serif" }}>Acceso activo</span>
              </div>
              <a href={recurso.url} target="_blank" rel="noopener noreferrer"
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', padding: '9px', background: 'var(--capyme-blue-pale)', color: 'var(--capyme-blue-mid)', borderRadius: 'var(--radius-md)', textDecoration: 'none', fontSize: '13px', fontWeight: 600, fontFamily: "'DM Sans',sans-serif", transition: 'all 150ms' }}
                onMouseEnter={e => { e.currentTarget.style.background = 'var(--capyme-blue-mid)'; e.currentTarget.style.color = '#fff'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'var(--capyme-blue-pale)'; e.currentTarget.style.color = 'var(--capyme-blue-mid)'; }}
              >
                <ExternalLink style={{ width: '13px', height: '13px' }}/> Abrir recurso
              </a>
            </div>

          ) : pagoPendiente ? (
            /* ── Pago pendiente → reanudar ── */
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', padding: '8px', background: '#FFFBEB', borderRadius: 'var(--radius-md)', border: '1px solid #FDE68A' }}>
                <AlertCircle style={{ width: '13px', height: '13px', color: '#B45309' }}/>
                <span style={{ fontSize: '12px', fontWeight: 600, color: '#92400E', fontFamily: "'DM Sans',sans-serif" }}>Pago en proceso</span>
              </div>
              <button className="mp-btn" onClick={() => onAcceso(recurso)} disabled={procesando}
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '10px 14px', border: 'none', borderRadius: '12px', background: procesando ? '#85C8E8' : 'linear-gradient(160deg,#00C3F5 0%,#009EE3 45%,#0079B4 100%)', cursor: procesando ? 'not-allowed' : 'pointer', boxShadow: procesando ? 'none' : '0 4px 14px rgba(0,158,227,0.38)', width: '100%' }}>
                {procesando ? <Spinner/> : <MPLogo/>}
                <span style={{ fontSize: '13px', fontWeight: 700, color: '#fff', fontFamily: "'Plus Jakarta Sans',sans-serif" }}>
                  {procesando ? 'Redirigiendo…' : `Completar pago — ${fmt(costo)}`}
                </span>
              </button>
            </div>

          ) : esGratis ? (
            /* ── Gratuito ── */
            <button onClick={() => onAcceso(recurso)} disabled={procesando}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '7px', padding: '10px', background: procesando ? 'var(--gray-200)' : 'var(--capyme-blue-pale)', color: procesando ? 'var(--gray-400)' : 'var(--capyme-blue-mid)', border: 'none', borderRadius: 'var(--radius-md)', fontSize: '13px', fontWeight: 600, fontFamily: "'DM Sans',sans-serif", cursor: procesando ? 'not-allowed' : 'pointer', transition: 'all 150ms', width: '100%' }}
              onMouseEnter={e => { if (!procesando) { e.currentTarget.style.background = 'var(--capyme-blue-mid)'; e.currentTarget.style.color = '#fff'; }}}
              onMouseLeave={e => { if (!procesando) { e.currentTarget.style.background = 'var(--capyme-blue-pale)'; e.currentTarget.style.color = 'var(--capyme-blue-mid)'; }}}
            >
              {procesando ? <Spinner size={13} trackColor="rgba(31,78,158,0.2)" headColor="var(--capyme-blue-mid)"/> : <ExternalLink style={{ width: '13px', height: '13px' }}/>}
              {procesando ? 'Accediendo…' : 'Acceder gratis'}
            </button>

          ) : (
            /* ── Botón Mercado Pago ── */
            <button className="mp-btn" onClick={() => onAcceso(recurso)} disabled={procesando}
              style={{ display: 'flex', alignItems: 'stretch', border: 'none', borderRadius: '12px', background: procesando ? '#85C8E8' : 'linear-gradient(160deg,#00C3F5 0%,#009EE3 45%,#0079B4 100%)', cursor: procesando ? 'not-allowed' : 'pointer', boxShadow: procesando ? 'none' : '0 4px 16px rgba(0,158,227,0.40)', overflow: 'hidden', position: 'relative', width: '100%' }}>

              {/* Brillo */}
              {!procesando && <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '1px', background: 'linear-gradient(90deg,transparent,rgba(255,255,255,0.38),transparent)' }}/>}

              {/* Izquierda */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '11px 12px 11px 16px', flex: 1 }}>
                {procesando ? <Spinner size={16}/> : <MPLogo/>}
                <div style={{ textAlign: 'left' }}>
                  <div style={{ fontSize: '12px', fontWeight: 700, color: '#fff', fontFamily: "'Plus Jakarta Sans',sans-serif", lineHeight: 1.25 }}>
                    {procesando ? 'Redirigiendo…' : 'Pagar con Mercado Pago'}
                  </div>
                  {!procesando && <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.75)', fontFamily: "'DM Sans',sans-serif", marginTop: '1px' }}>Tarjeta · Transferencia · Efectivo</div>}
                </div>
              </div>

              {/* Precio */}
              {!procesando && <>
                <div style={{ width: '1px', background: 'rgba(255,255,255,0.22)', margin: '8px 0' }}/>
                <div style={{ display: 'flex', alignItems: 'center', padding: '11px 16px 11px 12px', flexShrink: 0 }}>
                  <span style={{ fontSize: '15px', fontWeight: 800, color: '#fff', fontFamily: "'Plus Jakarta Sans',sans-serif", letterSpacing: '-0.01em' }}>{fmt(costo)}</span>
                </div>
              </>}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ClienteRecursos;