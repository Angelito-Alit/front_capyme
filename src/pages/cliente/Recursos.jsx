import { useState, useEffect } from 'react';
import Layout from '../../components/common/Layout';
import { enlacesService } from '../../services/enlacesService';
import {
  Link2, Search, ExternalLink, Video, FileText, DollarSign,
  ChevronDown, Tag, Lock, CheckCircle, Clock, CreditCard,
  Banknote, X, AlertTriangle, Copy, MessageCircle,
} from 'lucide-react';
import { toast } from 'react-hot-toast';

const tipoConfig = {
  video:          { label:'Video',          icon: Video,      bg:'#FEF2F2', color:'#DC2626' },
  financiamiento: { label:'Financiamiento', icon: DollarSign, bg:'#ECFDF5', color:'#059669' },
  documento:      { label:'Documento',      icon: FileText,   bg:'#EEF4FF', color:'var(--capyme-blue-mid)' },
  otro:           { label:'Otro',           icon: Link2,      bg:'var(--gray-100)', color:'var(--gray-600)' },
};

const PagoInfoModal = ({ pago, onClose }) => {
  if (!pago) return null;
  const copiar = (texto) => {
    navigator.clipboard.writeText(texto).then(() => toast.success('Copiado al portapapeles'));
  };
  const formatCurrency = (amount) => amount != null ? new Intl.NumberFormat('es-MX', { style:'currency', currency:'MXN' }).format(amount) : '';
  return (
    <div onClick={onClose} style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.5)', backdropFilter:'blur(4px)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:1100, padding:'20px' }}>
      <div onClick={e => e.stopPropagation()} style={{ background:'#fff', borderRadius:'var(--radius-lg)', width:'100%', maxWidth:'480px', boxShadow:'0 24px 64px rgba(0,0,0,0.25)', overflow:'hidden', animation:'modalIn 0.22s ease both' }}>
        <div style={{ background:'linear-gradient(135deg, var(--capyme-blue-mid), var(--capyme-blue))', padding:'20px 24px', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
          <div style={{ display:'flex', alignItems:'center', gap:'12px' }}>
            <div style={{ width:'40px', height:'40px', background:'rgba(255,255,255,0.2)', borderRadius:'var(--radius-md)', display:'flex', alignItems:'center', justifyContent:'center' }}>
              <Banknote style={{ width:'20px', height:'20px', color:'#fff' }} />
            </div>
            <div>
              <h3 style={{ fontSize:'17px', fontWeight:800, color:'#fff', fontFamily:"'Plus Jakarta Sans', sans-serif", margin:'0 0 2px' }}>Instrucciones de pago</h3>
              <p style={{ fontSize:'12px', color:'rgba(255,255,255,0.8)', margin:0, fontFamily:"'DM Sans', sans-serif" }}>SPEI / Transferencia bancaria</p>
            </div>
          </div>
          <button onClick={onClose} style={{ width:'32px', height:'32px', border:'none', borderRadius:'var(--radius-sm)', background:'rgba(255,255,255,0.15)', cursor:'pointer', color:'#fff', display:'flex', alignItems:'center', justifyContent:'center', transition:'all 150ms ease' }} onMouseEnter={e => e.currentTarget.style.background='rgba(255,255,255,0.25)'} onMouseLeave={e => e.currentTarget.style.background='rgba(255,255,255,0.15)'}>
            <X style={{ width:'16px', height:'16px' }} />
          </button>
        </div>

        <div style={{ padding:'24px', display:'flex', flexDirection:'column', gap:'16px' }}>
          <div style={{ background:'var(--capyme-blue-pale)', borderRadius:'var(--radius-md)', padding:'16px', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
            <div>
              <div style={{ fontSize:'11px', fontWeight:700, color:'var(--capyme-blue-mid)', textTransform:'uppercase', letterSpacing:'0.06em', fontFamily:"'Plus Jakarta Sans', sans-serif", marginBottom:'4px' }}>Monto a transferir</div>
              <div style={{ fontSize:'28px', fontWeight:800, color:'var(--capyme-blue)', fontFamily:"'Plus Jakarta Sans', sans-serif" }}>{formatCurrency(pago.monto)}</div>
            </div>
            <div style={{ width:'52px', height:'52px', background:'linear-gradient(135deg, var(--capyme-blue-mid), var(--capyme-blue))', borderRadius:'var(--radius-md)', display:'flex', alignItems:'center', justifyContent:'center' }}>
              <DollarSign style={{ width:'24px', height:'24px', color:'#fff' }} />
            </div>
          </div>

          <div style={{ display:'flex', flexDirection:'column', gap:'10px' }}>
            <div style={{ background:'var(--gray-50)', borderRadius:'var(--radius-md)', padding:'14px 16px', border:'1px solid var(--border)' }}>
              <div style={{ fontSize:'11px', fontWeight:700, color:'var(--gray-400)', textTransform:'uppercase', letterSpacing:'0.06em', fontFamily:"'Plus Jakarta Sans', sans-serif", marginBottom:'6px' }}>Referencia de pago</div>
              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', gap:'10px' }}>
                <span style={{ fontSize:'16px', fontWeight:800, color:'var(--gray-900)', fontFamily:"'JetBrains Mono', monospace", letterSpacing:'0.06em' }}>{pago.referencia}</span>
                <button onClick={() => copiar(pago.referencia)} style={{ display:'flex', alignItems:'center', gap:'5px', padding:'5px 10px', border:'1px solid var(--border)', borderRadius:'var(--radius-sm)', background:'#fff', cursor:'pointer', color:'var(--gray-600)', fontSize:'12px', fontFamily:"'DM Sans', sans-serif", fontWeight:600, transition:'all 150ms ease' }} onMouseEnter={e => { e.currentTarget.style.background='var(--capyme-blue-pale)'; e.currentTarget.style.color='var(--capyme-blue-mid)'; }} onMouseLeave={e => { e.currentTarget.style.background='#fff'; e.currentTarget.style.color='var(--gray-600)'; }}>
                  <Copy style={{ width:'12px', height:'12px' }} /> Copiar
                </button>
              </div>
            </div>

            {pago.clabeInterbancaria && (
              <div style={{ background:'var(--gray-50)', borderRadius:'var(--radius-md)', padding:'14px 16px', border:'1px solid var(--border)' }}>
                <div style={{ fontSize:'11px', fontWeight:700, color:'var(--gray-400)', textTransform:'uppercase', letterSpacing:'0.06em', fontFamily:"'Plus Jakarta Sans', sans-serif", marginBottom:'6px' }}>CLABE interbancaria</div>
                <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', gap:'10px' }}>
                  <span style={{ fontSize:'15px', fontWeight:700, color:'var(--gray-900)', fontFamily:"'JetBrains Mono', monospace", letterSpacing:'0.04em' }}>{pago.clabeInterbancaria}</span>
                  <button onClick={() => copiar(pago.clabeInterbancaria)} style={{ display:'flex', alignItems:'center', gap:'5px', padding:'5px 10px', border:'1px solid var(--border)', borderRadius:'var(--radius-sm)', background:'#fff', cursor:'pointer', color:'var(--gray-600)', fontSize:'12px', fontFamily:"'DM Sans', sans-serif", fontWeight:600, transition:'all 150ms ease' }} onMouseEnter={e => { e.currentTarget.style.background='var(--capyme-blue-pale)'; e.currentTarget.style.color='var(--capyme-blue-mid)'; }} onMouseLeave={e => { e.currentTarget.style.background='#fff'; e.currentTarget.style.color='var(--gray-600)'; }}>
                    <Copy style={{ width:'12px', height:'12px' }} /> Copiar
                  </button>
                </div>
              </div>
            )}
          </div>

          <div style={{ background:'#FFFBEB', borderRadius:'var(--radius-md)', padding:'12px 14px', display:'flex', alignItems:'flex-start', gap:'9px', border:'1px solid #FDE68A' }}>
            <AlertTriangle style={{ width:'14px', height:'14px', color:'#B45309', flexShrink:0, marginTop:'2px' }} />
            <p style={{ fontSize:'12px', color:'#92400E', fontFamily:"'DM Sans', sans-serif", margin:0, lineHeight:1.5 }}>
              Incluye la referencia en el concepto de tu transferencia. Una vez que confirmemos el pago, obtendrás acceso al recurso.
            </p>
          </div>

          {pago.whatsappPagos && (
            <a href={`https://wa.me/${pago.whatsappPagos.replace(/\D/g, '')}?text=Hola, acabo de realizar el pago con referencia ${pago.referencia} para acceder al recurso "${pago.tituloRecurso}"`} target="_blank" rel="noopener noreferrer" style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:'8px', padding:'11px 0', background:'#25D366', color:'#fff', borderRadius:'var(--radius-md)', textDecoration:'none', fontSize:'14px', fontWeight:600, fontFamily:"'DM Sans', sans-serif", transition:'all 150ms ease' }} onMouseEnter={e => e.currentTarget.style.opacity='0.9'} onMouseLeave={e => e.currentTarget.style.opacity='1'}>
              <MessageCircle style={{ width:'16px', height:'16px' }} />
              Notificar por WhatsApp
            </a>
          )}

          <button onClick={onClose} style={{ padding:'10px 0', border:'1px solid var(--border)', borderRadius:'var(--radius-md)', background:'#fff', color:'var(--gray-700)', fontSize:'14px', fontWeight:600, fontFamily:"'DM Sans', sans-serif", cursor:'pointer', transition:'all 150ms ease' }} onMouseEnter={e => e.currentTarget.style.background='var(--gray-100)'} onMouseLeave={e => e.currentTarget.style.background='#fff'}>Entendido</button>
        </div>
      </div>
    </div>
  );
};

const ClienteRecursos = () => {
  const authStorage = JSON.parse(localStorage.getItem('auth-storage') || '{}');
  const currentUser = authStorage?.state?.user || {};

  const [recursos, setRecursos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterTipo, setFilterTipo] = useState('');
  const [filterCategoria, setFilterCategoria] = useState('');
  const [solicitando, setSolicitando] = useState(null);
  const [pagoInfo, setPagoInfo] = useState(null);

  useEffect(() => { cargarRecursos(); }, [filterTipo, filterCategoria]);

  const cargarRecursos = async () => {
    try {
      setLoading(true);
      const params = { activo: true };
      if (filterTipo) params.tipo = filterTipo;
      if (filterCategoria) params.categoria = filterCategoria;
      const res = await enlacesService.getAll(params);
      setRecursos(res.data);
    } catch { toast.error('Error al cargar recursos'); }
    finally { setLoading(false); }
  };

  const handleSolicitarAcceso = async (recurso) => {
    try {
      setSolicitando(recurso.id);
      const res = await enlacesService.solicitarAcceso(recurso.id);
      if (res.requierePago && res.pagoInfo) {
        setPagoInfo(res.pagoInfo);
        toast.success('Solicitud registrada. Realiza tu transferencia para obtener acceso.');
      } else {
        toast.success('¡Acceso otorgado! Ya puedes ver el recurso.');
      }
      cargarRecursos();
    } catch (error) {
      const data = error.response?.data;
      if (data?.pagoExistente) {
        setPagoInfo(data.pagoExistente);
        toast('Ya tienes un pago pendiente para este recurso.', { icon:'ℹ️' });
      } else {
        toast.error(data?.message || 'Error al solicitar acceso');
      }
    } finally { setSolicitando(null); }
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

  const inputBaseStyle = { width:'100%', padding:'10px 12px', border:'1px solid var(--border)', borderRadius:'var(--radius-md)', fontSize:'14px', fontFamily:"'DM Sans', sans-serif", color:'var(--gray-900)', background:'#fff', outline:'none', transition:'all 200ms ease', boxSizing:'border-box' };
  const selectStyle = { ...inputBaseStyle, appearance:'none', paddingRight:'36px', cursor:'pointer' };

  const formatCurrency = (amount) => amount != null ? new Intl.NumberFormat('es-MX', { style:'currency', currency:'MXN' }).format(amount) : '';

  if (loading) return (
    <Layout>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'320px', flexDirection:'column', gap:'16px' }}>
        <div style={{ width:'40px', height:'40px', border:'3px solid var(--border)', borderTopColor:'var(--capyme-blue-mid)', borderRadius:'50%', animation:'spin 700ms linear infinite' }} />
        <p style={{ fontSize:'14px', color:'var(--gray-400)', fontFamily:"'DM Sans', sans-serif" }}>Cargando recursos...</p>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    </Layout>
  );

  return (
    <Layout>
      <style>{`
        @keyframes spin     { to { transform: rotate(360deg); } }
        @keyframes fadeInUp { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:translateY(0); } }
        @keyframes modalIn  { from { opacity:0; transform:scale(0.96) translateY(8px); } to { opacity:1; transform:scale(1) translateY(0); } }
        .recurso-card { animation: fadeInUp 0.3s ease both; transition: box-shadow 200ms ease, transform 200ms ease; }
        .recurso-card:hover { box-shadow: 0 4px 16px rgba(0,0,0,0.10); transform: translateY(-2px); }
      `}</style>

      <div style={{ display:'flex', flexDirection:'column', gap:'24px' }}>

        {/* HEADER */}
        <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', gap:'16px', flexWrap:'wrap' }}>
          <div>
            <h1 style={{ fontFamily:"'Plus Jakarta Sans', sans-serif", fontSize:'26px', fontWeight:800, color:'var(--gray-900)', letterSpacing:'-0.02em', marginBottom:'4px' }}>Recursos Útiles</h1>
            <p style={{ fontSize:'14px', color:'var(--gray-500)', fontFamily:"'DM Sans', sans-serif" }}>Videos, documentos y herramientas para impulsar tu negocio</p>
          </div>
          <div style={{ display:'flex', gap:'10px', flexWrap:'wrap' }}>
            {Object.entries(tipoConfig).map(([tipo, cfg]) => {
              const Icon = cfg.icon;
              const count = recursos.filter(r => (r.tipo || 'otro') === tipo).length;
              if (count === 0) return null;
              return (
                <div key={tipo} style={{ display:'flex', alignItems:'center', gap:'6px', padding:'6px 12px', background:cfg.bg, borderRadius:'var(--radius-md)', border:'1px solid var(--border)' }}>
                  <Icon style={{ width:'13px', height:'13px', color:cfg.color }} />
                  <span style={{ fontSize:'12px', fontWeight:700, color:cfg.color, fontFamily:"'Plus Jakarta Sans', sans-serif" }}>{count} {cfg.label}{count !== 1 ? 's' : ''}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* FILTROS */}
        <div style={{ display:'flex', gap:'12px', flexWrap:'wrap' }}>
          <div style={{ position:'relative', flex:'1 1 220px' }}>
            <Search style={{ position:'absolute', left:'12px', top:'50%', transform:'translateY(-50%)', width:'15px', height:'15px', color:'var(--gray-400)', pointerEvents:'none' }} />
            <input type="text" placeholder="Buscar recursos..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} style={{ ...inputBaseStyle, paddingLeft:'38px' }} />
          </div>
          <div style={{ position:'relative', flex:'0 1 180px' }}>
            <select value={filterTipo} onChange={e => setFilterTipo(e.target.value)} style={selectStyle}>
              <option value="">Todos los tipos</option>
              <option value="video">Videos</option>
              <option value="financiamiento">Financiamiento</option>
              <option value="documento">Documentos</option>
              <option value="otro">Otros</option>
            </select>
            <ChevronDown style={{ position:'absolute', right:'12px', top:'50%', transform:'translateY(-50%)', width:'14px', height:'14px', color:'var(--gray-400)', pointerEvents:'none' }} />
          </div>
          {categorias.length > 0 && (
            <div style={{ position:'relative', flex:'0 1 180px' }}>
              <select value={filterCategoria} onChange={e => setFilterCategoria(e.target.value)} style={selectStyle}>
                <option value="">Todas las categorías</option>
                {categorias.map((cat, i) => <option key={i} value={cat}>{cat}</option>)}
              </select>
              <ChevronDown style={{ position:'absolute', right:'12px', top:'50%', transform:'translateY(-50%)', width:'14px', height:'14px', color:'var(--gray-400)', pointerEvents:'none' }} />
            </div>
          )}
        </div>

        {/* CONTENIDO */}
        {recursosFiltrados.length > 0 ? (
          <div style={{ display:'flex', flexDirection:'column', gap:'28px' }}>
            {tipoOrden.filter(t => recursosPorTipo[t]?.length > 0).map(tipo => {
              const cfg = tipoConfig[tipo] || tipoConfig.otro;
              const Icon = cfg.icon;
              const items = recursosPorTipo[tipo];
              return (
                <div key={tipo}>
                  <div style={{ display:'flex', alignItems:'center', gap:'10px', marginBottom:'14px' }}>
                    <div style={{ width:'30px', height:'30px', borderRadius:'var(--radius-sm)', background:cfg.bg, display:'flex', alignItems:'center', justifyContent:'center' }}>
                      <Icon style={{ width:'15px', height:'15px', color:cfg.color }} />
                    </div>
                    <h2 style={{ fontFamily:"'Plus Jakarta Sans', sans-serif", fontSize:'15px', fontWeight:700, color:'var(--gray-800)' }}>{cfg.label}s</h2>
                    <span style={{ padding:'2px 8px', background:cfg.bg, color:cfg.color, borderRadius:'99px', fontSize:'11px', fontWeight:700, fontFamily:"'Plus Jakarta Sans', sans-serif" }}>{items.length}</span>
                  </div>
                  <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(280px, 1fr))', gap:'14px' }}>
                    {items.map((recurso, idx) => (
                      <RecursoCard
                        key={recurso.id}
                        recurso={recurso}
                        onSolicitarAcceso={handleSolicitarAcceso}
                        onVerPago={() => enlacesService.getMiPago(recurso.id).then(r => setPagoInfo({ ...r.data, tituloRecurso: recurso.titulo })).catch(() => {})}
                        solicitando={solicitando === recurso.id}
                        idx={idx}
                        formatCurrency={formatCurrency}
                      />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div style={{ background:'#fff', border:'1px solid var(--border)', borderRadius:'var(--radius-lg)', boxShadow:'var(--shadow-sm)', padding:'64px 32px', display:'flex', flexDirection:'column', alignItems:'center', textAlign:'center', gap:'12px' }}>
            <div style={{ width:'64px', height:'64px', borderRadius:'var(--radius-lg)', background:'#EEF4FF', display:'flex', alignItems:'center', justifyContent:'center', marginBottom:'4px' }}>
              <Link2 style={{ width:'28px', height:'28px', color:'var(--capyme-blue-mid)' }} />
            </div>
            <h3 style={{ fontFamily:"'Plus Jakarta Sans', sans-serif", fontSize:'17px', fontWeight:700, color:'var(--gray-900)' }}>
              {searchTerm || filterTipo || filterCategoria ? 'Sin resultados' : 'No hay recursos disponibles'}
            </h3>
            <p style={{ fontSize:'14px', color:'var(--gray-400)', fontFamily:"'DM Sans', sans-serif" }}>
              {searchTerm || filterTipo || filterCategoria ? 'Intenta con otros filtros.' : 'Vuelve pronto, se añadirán recursos útiles para tu negocio.'}
            </p>
          </div>
        )}
      </div>

      <PagoInfoModal pago={pagoInfo} onClose={() => setPagoInfo(null)} />
    </Layout>
  );
};

const RecursoCard = ({ recurso, onSolicitarAcceso, onVerPago, solicitando, idx, formatCurrency }) => {
  const cfg = tipoConfig[recurso.tipo] || tipoConfig.otro;
  const Icon = cfg.icon;
  const esGratis = !recurso.costo || parseFloat(recurso.costo) === 0;
  const miAcceso = recurso.miAcceso;
  const tieneAcceso = miAcceso?.estado === 'activo';
  const pendientePago = miAcceso?.estado === 'pendiente';

  const renderAccionBtn = () => {
    if (tieneAcceso) {
      return (
        <div style={{ display:'flex', flexDirection:'column', gap:'6px' }}>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:'6px', padding:'8px 0', background:'#ECFDF5', borderRadius:'var(--radius-md)', border:'1px solid #BBF7D0' }}>
            <CheckCircle style={{ width:'14px', height:'14px', color:'#16A34A' }} />
            <span style={{ fontSize:'13px', fontWeight:700, color:'#065F46', fontFamily:"'Plus Jakarta Sans', sans-serif" }}>Acceso activo</span>
          </div>
          <a href={recurso.url} target="_blank" rel="noopener noreferrer" style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:'6px', padding:'8px 0', background:'var(--capyme-blue-pale)', color:'var(--capyme-blue-mid)', borderRadius:'var(--radius-md)', textDecoration:'none', fontSize:'13px', fontWeight:600, fontFamily:"'DM Sans', sans-serif", transition:'all 150ms ease' }} onMouseEnter={e => { e.currentTarget.style.background='var(--capyme-blue-mid)'; e.currentTarget.style.color='#fff'; }} onMouseLeave={e => { e.currentTarget.style.background='var(--capyme-blue-pale)'; e.currentTarget.style.color='var(--capyme-blue-mid)'; }}>
            <ExternalLink style={{ width:'13px', height:'13px' }} />
            Abrir recurso
          </a>
        </div>
      );
    }

    if (pendientePago) {
      return (
        <div style={{ display:'flex', flexDirection:'column', gap:'6px' }}>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:'6px', padding:'8px 0', background:'#FFF7ED', borderRadius:'var(--radius-md)', border:'1px solid #FED7AA' }}>
            <Clock style={{ width:'14px', height:'14px', color:'#C2410C' }} />
            <span style={{ fontSize:'13px', fontWeight:700, color:'#C2410C', fontFamily:"'Plus Jakarta Sans', sans-serif" }}>Pago pendiente</span>
          </div>
          <button onClick={onVerPago} style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:'6px', padding:'8px 0', background:'#fff', color:'var(--gray-600)', border:'1px solid var(--border)', borderRadius:'var(--radius-md)', fontSize:'13px', fontWeight:600, fontFamily:"'DM Sans', sans-serif", cursor:'pointer', transition:'all 150ms ease' }} onMouseEnter={e => { e.currentTarget.style.background='#FFF7ED'; e.currentTarget.style.color='#C2410C'; e.currentTarget.style.borderColor='#FED7AA'; }} onMouseLeave={e => { e.currentTarget.style.background='#fff'; e.currentTarget.style.color='var(--gray-600)'; e.currentTarget.style.borderColor='var(--border)'; }}>
            <CreditCard style={{ width:'13px', height:'13px' }} />
            Ver instrucciones de pago
          </button>
        </div>
      );
    }

    if (esGratis) {
      return (
        <button onClick={() => onSolicitarAcceso(recurso)} disabled={solicitando} style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:'7px', padding:'9px 0', background: solicitando ? 'var(--gray-200)' : 'var(--capyme-blue-pale)', color: solicitando ? 'var(--gray-400)' : 'var(--capyme-blue-mid)', border:'none', borderRadius:'var(--radius-md)', fontSize:'13px', fontWeight:600, fontFamily:"'DM Sans', sans-serif", cursor: solicitando ? 'not-allowed' : 'pointer', transition:'all 150ms ease' }} onMouseEnter={e => { if (!solicitando) { e.currentTarget.style.background='var(--capyme-blue-mid)'; e.currentTarget.style.color='#fff'; } }} onMouseLeave={e => { if (!solicitando) { e.currentTarget.style.background='var(--capyme-blue-pale)'; e.currentTarget.style.color='var(--capyme-blue-mid)'; } }}>
          {solicitando ? <><span style={{ width:'13px', height:'13px', border:'2px solid rgba(31,78,158,0.2)', borderTopColor:'var(--capyme-blue-mid)', borderRadius:'50%', display:'inline-block', animation:'spin 0.7s linear infinite' }} />Accediendo...</> : <><ExternalLink style={{ width:'13px', height:'13px' }} />Acceder gratis</>}
        </button>
      );
    }

    return (
      <button onClick={() => onSolicitarAcceso(recurso)} disabled={solicitando} style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:'7px', padding:'9px 0', background: solicitando ? 'var(--gray-200)' : 'linear-gradient(135deg, var(--capyme-blue-mid), var(--capyme-blue))', color: solicitando ? 'var(--gray-400)' : '#fff', border:'none', borderRadius:'var(--radius-md)', fontSize:'13px', fontWeight:600, fontFamily:"'DM Sans', sans-serif", cursor: solicitando ? 'not-allowed' : 'pointer', boxShadow: solicitando ? 'none' : '0 2px 8px rgba(31,78,158,0.25)', transition:'all 150ms ease' }} onMouseEnter={e => { if (!solicitando) e.currentTarget.style.opacity='0.9'; }} onMouseLeave={e => e.currentTarget.style.opacity='1'}>
        {solicitando ? <><span style={{ width:'13px', height:'13px', border:'2px solid rgba(255,255,255,0.3)', borderTopColor:'#fff', borderRadius:'50%', display:'inline-block', animation:'spin 0.7s linear infinite' }} />Procesando...</> : <><Lock style={{ width:'13px', height:'13px' }} />Solicitar acceso — {formatCurrency(recurso.costo)}</>}
      </button>
    );
  };

  return (
    <div className="recurso-card" style={{ background:'#fff', border:'1px solid var(--border)', borderRadius:'var(--radius-lg)', boxShadow:'var(--shadow-sm)', overflow:'hidden', display:'flex', flexDirection:'column', animationDelay:`${idx * 40}ms` }}>
      <div style={{ height:'3px', background: cfg.color === 'var(--capyme-blue-mid)' ? 'linear-gradient(90deg, var(--capyme-blue-mid), var(--capyme-blue))' : cfg.color === '#DC2626' ? 'linear-gradient(90deg, #DC2626, #FCA5A5)' : cfg.color === '#059669' ? 'linear-gradient(90deg, #059669, #34D399)' : 'linear-gradient(90deg, var(--gray-300), var(--gray-200))' }} />
      <div style={{ padding:'18px', flex:1, display:'flex', flexDirection:'column', gap:'10px' }}>
        <div style={{ display:'flex', alignItems:'flex-start', gap:'12px' }}>
          <div style={{ width:'38px', height:'38px', flexShrink:0, borderRadius:'var(--radius-md)', background:cfg.bg, display:'flex', alignItems:'center', justifyContent:'center' }}>
            <Icon style={{ width:'18px', height:'18px', color:cfg.color }} />
          </div>
          <div style={{ flex:1, minWidth:0 }}>
            <h3 style={{ fontFamily:"'Plus Jakarta Sans', sans-serif", fontSize:'14px', fontWeight:700, color:'var(--gray-900)', lineHeight:1.3, marginBottom:'4px' }}>{recurso.titulo}</h3>
            <div style={{ display:'flex', gap:'5px', flexWrap:'wrap', alignItems:'center' }}>
              {recurso.categoria && (
                <div style={{ display:'flex', alignItems:'center', gap:'4px' }}>
                  <Tag style={{ width:'10px', height:'10px', color:'var(--gray-400)' }} />
                  <span style={{ fontSize:'11px', color:'var(--gray-400)', fontFamily:"'DM Sans', sans-serif" }}>{recurso.categoria}</span>
                </div>
              )}
              <span style={{ padding:'2px 7px', borderRadius:'20px', fontSize:'10px', fontWeight:700, background: esGratis ? '#ECFDF5' : '#FFF7ED', color: esGratis ? '#065F46' : '#C2410C', fontFamily:"'Plus Jakarta Sans', sans-serif" }}>
                {esGratis ? 'Gratis' : formatCurrency(recurso.costo)}
              </span>
            </div>
          </div>
        </div>

        {recurso.descripcion && (
          <p style={{ fontSize:'13px', color:'var(--gray-500)', fontFamily:"'DM Sans', sans-serif", lineHeight:1.5, display:'-webkit-box', WebkitLineClamp:3, WebkitBoxOrient:'vertical', overflow:'hidden', flex:1 }}>
            {recurso.descripcion}
          </p>
        )}

        <div style={{ marginTop:'auto' }}>
          {renderAccionBtn()}
        </div>
      </div>
    </div>
  );
};

export default ClienteRecursos;