import { useState, useEffect } from 'react';
import Layout from '../../components/common/Layout';
import { cursosService } from '../../services/cursosService';
import { pagosService } from '../../services/pagosService';
import { negociosService } from '../../services/negociosService';
import {
  GraduationCap, Search, Clock, Users, Calendar,
  Monitor, MapPin, Layers, ChevronDown, CheckCircle,
  AlertCircle, DollarSign, X,
} from 'lucide-react';
import { toast } from 'react-hot-toast';

const modalidadConfig = {
  online:     { label: 'Online',     bg: '#EEF4FF', color: 'var(--capyme-blue-mid)', icon: Monitor },
  presencial: { label: 'Presencial', bg: '#ECFDF5', color: '#059669',               icon: MapPin },
  hibrido:    { label: 'Híbrido',    bg: '#F5F3FF', color: '#7C3AED',               icon: Layers },
};

const MPLogo = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0 }}>
    <circle cx="12" cy="12" r="12" fill="white" fillOpacity="0.22" />
    <path d="M5.5 12.5C5.5 9.46 7.96 7 11 7C13.54 7 15.68 8.73 16.3 11.08H14.19C13.63 9.67 12.44 8.67 11 8.67C9.03 8.67 7.42 10.41 7.42 12.5C7.42 14.59 9.03 16.33 11 16.33C12.44 16.33 13.63 15.33 14.19 13.92H16.3C15.68 16.27 13.54 18 11 18C7.96 18 15.54 12.5 5.5 12.5Z" fill="white" />
    <path d="M5.5 12.5C5.5 9.46 7.96 7 11 7C13.54 7 15.68 8.73 16.3 11.08H14.19C13.63 9.67 12.44 8.67 11 8.67C9.03 8.67 7.42 10.41 7.42 12.5C7.42 14.59 9.03 16.33 11 16.33C12.44 16.33 13.63 15.33 14.19 13.92H16.3C15.68 16.27 13.54 18 11 18C7.96 18 5.5 15.54 5.5 12.5Z" fill="white" />
  </svg>
);

const Spinner = ({ size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" style={{ animation: 'mpSpin 0.8s linear infinite', flexShrink: 0 }}>
    <circle cx="8" cy="8" r="6" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="2" />
    <path d="M8 2 A6 6 0 0 1 14 8" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

const fmt = (v) =>
  v != null
    ? new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(v)
    : '';

const fmtD = (d) =>
  d
    ? new Date(d).toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' })
    : null;

const CursosDisponibles = () => {
  const [cursos,      setCursos]      = useState([]);
  const [negocios,    setNegocios]    = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [procesando,  setProcesando]  = useState(null);
  const [searchTerm,  setSearchTerm]  = useState('');
  const [filterMod,   setFilterMod]   = useState('');
  const [showNegModal,setShowNegModal]= useState(false);
  const [cursoTarget, setCursoTarget] = useState(null);
  const [negocioSel,  setNegocioSel]  = useState('');

  const inputBase = {
    width: '100%', padding: '10px 12px', border: '1px solid var(--border)',
    borderRadius: 'var(--radius-md)', fontSize: '14px', fontFamily: "'DM Sans',sans-serif",
    color: 'var(--gray-900)', background: '#fff', outline: 'none',
    transition: 'all 200ms ease', boxSizing: 'border-box',
  };

  useEffect(() => { cargar(); }, [filterMod]);

  const cargar = async () => {
    setLoading(true);
    try {
      const params = { activo: true };
      if (filterMod) params.modalidad = filterMod;
      const [cRes, nRes] = await Promise.all([
        cursosService.getAll(params),
        negociosService.getMisNegocios(),
      ]);
      setCursos(cRes.data || []);
      setNegocios(nRes.data || []);
    } catch { toast.error('Error al cargar cursos'); }
    finally { setLoading(false); }
  };

  const iniciarInscripcion = async (curso, negocioId = null) => {
    try {
      setProcesando(curso.id);
      const res = await cursosService.inscribir(curso.id, negocioId);

      if (!res.requierePago) {
        toast.success('¡Inscripción realizada exitosamente!');
        cargar();
        return;
      }

      const referencia = res.pagoInfo?.referencia;
      const monto = res.pagoInfo?.monto;
      if (!referencia) { toast.error('No se pudo obtener la referencia'); return; }

      const resPago = await pagosService.crearPreferencia({
        titulo: `Curso: ${res.pagoInfo?.tituloCurso || curso.titulo}`,
        precio: parseFloat(monto),
        cantidad: 1,
        idReferencia: referencia,
        tipo: 'curso',
      });

      if (resPago.success && resPago.init_point) {
        window.location.href = resPago.init_point;
      } else {
        toast.error('No se pudo iniciar el pago. Intenta de nuevo.');
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Error al inscribir');
    } finally {
      setProcesando(null);
    }
  };

  const handleInscribir = (curso) => {
    if (negocios.length > 0) {
      setCursoTarget(curso);
      setNegocioSel('');
      setShowNegModal(true);
    } else {
      iniciarInscripcion(curso, null);
    }
  };

  const confirmarInscripcion = () => {
    setShowNegModal(false);
    iniciarInscripcion(cursoTarget, negocioSel || null);
  };

  const filtrados = cursos.filter((c) =>
    c.titulo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.instructor?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return (
    <Layout>
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '300px' }}>
        <div style={{ width: '40px', height: '40px', border: '3px solid var(--border)', borderTopColor: 'var(--capyme-blue-mid)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
        <style>{`@keyframes spin{to{transform:rotate(360deg);}}`}</style>
      </div>
    </Layout>
  );

  return (
    <Layout>
      <style>{`
        @keyframes spin   { to { transform: rotate(360deg); } }
        @keyframes mpSpin { to { transform: rotate(360deg); } }
        @keyframes fadeUp { from{opacity:0;transform:translateY(12px);}to{opacity:1;transform:translateY(0);} }
        @keyframes modalIn{ from{opacity:0;transform:scale(0.96) translateY(8px);}to{opacity:1;transform:scale(1) translateY(0);} }
        .curso-card { animation: fadeUp 0.3s ease both; transition: box-shadow 200ms, transform 200ms; }
        .curso-card:hover { box-shadow: 0 8px 24px rgba(31,78,158,0.12); transform: translateY(-2px); }
        .mp-btn { transition: all 160ms ease; }
        .mp-btn:hover:not(:disabled) { filter: brightness(1.07); transform: translateY(-1px); box-shadow: 0 8px 22px rgba(0,158,227,0.5) !important; }
      `}</style>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', paddingBottom: '40px' }}>

        <div>
          <h1 style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontSize: '26px', fontWeight: 800, color: 'var(--gray-900)', marginBottom: '4px' }}>Cursos disponibles</h1>
          <p style={{ fontSize: '14px', color: 'var(--gray-500)', fontFamily: "'DM Sans',sans-serif" }}>
            {cursos.length} curso{cursos.length !== 1 ? 's' : ''} · Pagos automáticos vía Mercado Pago
          </p>
        </div>

        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', flex: '1 1 220px' }}>
            <Search style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', width: '15px', height: '15px', color: 'var(--gray-400)', pointerEvents: 'none' }} />
            <input
              type="text" placeholder="Buscar curso o instructor…"
              value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
              style={{ ...inputBase, paddingLeft: '38px' }}
            />
          </div>
          <div style={{ position: 'relative', flex: '0 1 180px' }}>
            <select value={filterMod} onChange={(e) => setFilterMod(e.target.value)} style={{ ...inputBase, appearance: 'none', paddingRight: '36px', cursor: 'pointer' }}>
              <option value="">Todas las modalidades</option>
              <option value="online">Online</option>
              <option value="presencial">Presencial</option>
              <option value="hibrido">Híbrido</option>
            </select>
            <ChevronDown style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', width: '14px', height: '14px', color: 'var(--gray-400)', pointerEvents: 'none' }} />
          </div>
        </div>

        {filtrados.length === 0 ? (
          <div style={{ background: '#fff', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '60px 20px', textAlign: 'center' }}>
            <GraduationCap style={{ width: '40px', height: '40px', color: 'var(--gray-300)', margin: '0 auto 12px', display: 'block' }} />
            <p style={{ fontSize: '15px', fontWeight: 600, color: 'var(--gray-600)', margin: 0, fontFamily: "'Plus Jakarta Sans',sans-serif" }}>No hay cursos disponibles</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(300px,1fr))', gap: '16px' }}>
            {filtrados.map((curso, idx) => {
              const mod = modalidadConfig[curso.modalidad] || modalidadConfig.online;
              const ModIcon = mod.icon;
              const costo = curso.costo ? parseFloat(curso.costo) : 0;
              const esGratis = costo === 0;
              const lleno = curso.cupoMaximo && curso.inscritosCount >= curso.cupoMaximo;

              return (
                <div key={curso.id} className="curso-card"
                  style={{ background: '#fff', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', overflow: 'hidden', display: 'flex', flexDirection: 'column', animationDelay: `${idx * 40}ms` }}>
                  <div style={{ height: '4px', background: curso.yaInscrito ? '#10B981' : curso.miPagoPendiente ? '#F59E0B' : 'linear-gradient(90deg,var(--capyme-blue-mid),var(--capyme-blue))' }} />
                  <div style={{ padding: '18px', flex: 1, display: 'flex', flexDirection: 'column', gap: '12px' }}>

                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                      <div style={{ width: '44px', height: '44px', borderRadius: 'var(--radius-md)', background: mod.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <ModIcon style={{ width: '20px', height: '20px', color: mod.color }} />
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <h3 style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontSize: '15px', fontWeight: 700, color: 'var(--gray-900)', margin: '0 0 4px', lineHeight: 1.3 }}>{curso.titulo}</h3>
                        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                          <span style={{ padding: '2px 8px', borderRadius: '20px', fontSize: '11px', fontWeight: 700, background: mod.bg, color: mod.color, fontFamily: "'Plus Jakarta Sans',sans-serif" }}>{mod.label}</span>
                          {lleno && <span style={{ padding: '2px 8px', borderRadius: '20px', fontSize: '11px', fontWeight: 700, background: '#FEF2F2', color: '#DC2626', fontFamily: "'Plus Jakarta Sans',sans-serif" }}>Lleno</span>}
                        </div>
                      </div>
                    </div>

                    {curso.descripcion && (
                      <p style={{ fontSize: '13px', color: 'var(--gray-500)', fontFamily: "'DM Sans',sans-serif", lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', margin: 0 }}>
                        {curso.descripcion}
                      </p>
                    )}

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                      {curso.instructor && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                          <Users style={{ width: '12px', height: '12px', color: 'var(--gray-400)' }} />
                          <span style={{ fontSize: '12px', color: 'var(--gray-500)', fontFamily: "'DM Sans',sans-serif" }}>{curso.instructor}</span>
                        </div>
                      )}
                      {curso.duracionHoras && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                          <Clock style={{ width: '12px', height: '12px', color: 'var(--gray-400)' }} />
                          <span style={{ fontSize: '12px', color: 'var(--gray-500)', fontFamily: "'DM Sans',sans-serif" }}>{curso.duracionHoras} hrs</span>
                        </div>
                      )}
                      {curso.fechaInicio && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                          <Calendar style={{ width: '12px', height: '12px', color: 'var(--gray-400)' }} />
                          <span style={{ fontSize: '12px', color: 'var(--gray-500)', fontFamily: "'DM Sans',sans-serif" }}>{fmtD(curso.fechaInicio)}</span>
                        </div>
                      )}
                      {curso.cupoMaximo && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                          <Users style={{ width: '12px', height: '12px', color: 'var(--gray-400)' }} />
                          <span style={{ fontSize: '12px', color: 'var(--gray-500)', fontFamily: "'DM Sans',sans-serif" }}>{curso.inscritosCount}/{curso.cupoMaximo} lugares</span>
                        </div>
                      )}
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '10px', borderTop: '1px solid var(--gray-100)' }}>
                      <div>
                        {esGratis
                          ? <span style={{ fontSize: '16px', fontWeight: 800, color: '#059669', fontFamily: "'Plus Jakarta Sans',sans-serif" }}>Gratis</span>
                          : <span style={{ fontSize: '16px', fontWeight: 800, color: 'var(--gray-900)', fontFamily: "'Plus Jakarta Sans',sans-serif" }}>{fmt(costo)}</span>
                        }
                      </div>
                    </div>

                    <div>
                      {curso.yaInscrito ? (
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '7px', padding: '10px', background: '#ECFDF5', borderRadius: 'var(--radius-md)', border: '1px solid #BBF7D0' }}>
                          <CheckCircle style={{ width: '15px', height: '15px', color: '#16A34A' }} />
                          <span style={{ fontSize: '13px', fontWeight: 700, color: '#065F46', fontFamily: "'Plus Jakarta Sans',sans-serif" }}>Ya inscrito</span>
                        </div>
                      ) : curso.miPagoPendiente ? (
                        <button
                          className="mp-btn"
                          onClick={() => handleInscribir(curso)}
                          disabled={procesando === curso.id}
                          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', width: '100%', padding: '10px 14px', border: 'none', borderRadius: '10px', background: procesando === curso.id ? '#85C8E8' : 'linear-gradient(160deg,#00C3F5 0%,#009EE3 45%,#0079B4 100%)', cursor: procesando === curso.id ? 'not-allowed' : 'pointer', boxShadow: procesando === curso.id ? 'none' : '0 4px 14px rgba(0,158,227,0.38)' }}
                        >
                          {procesando === curso.id ? <Spinner /> : <MPLogo />}
                          <span style={{ fontSize: '13px', fontWeight: 700, color: '#fff', fontFamily: "'Plus Jakarta Sans',sans-serif" }}>
                            {procesando === curso.id ? 'Redirigiendo…' : `Completar pago — ${fmt(costo)}`}
                          </span>
                        </button>
                      ) : lleno ? (
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '7px', padding: '10px', background: '#FEF2F2', borderRadius: 'var(--radius-md)' }}>
                          <AlertCircle style={{ width: '14px', height: '14px', color: '#DC2626' }} />
                          <span style={{ fontSize: '13px', fontWeight: 600, color: '#DC2626', fontFamily: "'DM Sans',sans-serif" }}>Curso lleno</span>
                        </div>
                      ) : esGratis ? (
                        <button
                          onClick={() => handleInscribir(curso)}
                          disabled={procesando === curso.id}
                          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '7px', width: '100%', padding: '10px', background: procesando === curso.id ? 'var(--gray-200)' : 'linear-gradient(135deg,var(--capyme-blue-mid),var(--capyme-blue))', color: '#fff', border: 'none', borderRadius: 'var(--radius-md)', fontSize: '13px', fontWeight: 600, fontFamily: "'DM Sans',sans-serif", cursor: procesando === curso.id ? 'not-allowed' : 'pointer', boxShadow: procesando === curso.id ? 'none' : '0 2px 8px rgba(31,78,158,0.28)', transition: 'all 150ms' }}
                        >
                          {procesando === curso.id ? <Spinner size={13} /> : <GraduationCap style={{ width: '14px', height: '14px' }} />}
                          {procesando === curso.id ? 'Inscribiendo…' : 'Inscribirse gratis'}
                        </button>
                      ) : (
                        <button
                          className="mp-btn"
                          onClick={() => handleInscribir(curso)}
                          disabled={procesando === curso.id}
                          style={{ display: 'flex', alignItems: 'stretch', border: 'none', borderRadius: '12px', background: procesando === curso.id ? '#85C8E8' : 'linear-gradient(160deg,#00C3F5 0%,#009EE3 45%,#0079B4 100%)', cursor: procesando === curso.id ? 'not-allowed' : 'pointer', boxShadow: procesando === curso.id ? 'none' : '0 4px 16px rgba(0,158,227,0.40)', overflow: 'hidden', position: 'relative', width: '100%' }}
                        >
                          {!procesando && <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '1px', background: 'linear-gradient(90deg,transparent,rgba(255,255,255,0.38),transparent)' }} />}
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 12px 10px 14px', flex: 1 }}>
                            {procesando === curso.id ? <Spinner /> : <MPLogo />}
                            <div style={{ textAlign: 'left' }}>
                              <div style={{ fontSize: '12px', fontWeight: 700, color: '#fff', fontFamily: "'Plus Jakarta Sans',sans-serif", lineHeight: 1.25 }}>
                                {procesando === curso.id ? 'Redirigiendo…' : 'Pagar con Mercado Pago'}
                              </div>
                              {procesando !== curso.id && <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.75)', fontFamily: "'DM Sans',sans-serif", marginTop: '1px' }}>Tarjeta · Transferencia · Efectivo</div>}
                            </div>
                          </div>
                          {procesando !== curso.id && (
                            <>
                              <div style={{ width: '1px', background: 'rgba(255,255,255,0.22)', margin: '8px 0' }} />
                              <div style={{ display: 'flex', alignItems: 'center', padding: '10px 14px 10px 12px', flexShrink: 0 }}>
                                <span style={{ fontSize: '14px', fontWeight: 800, color: '#fff', fontFamily: "'Plus Jakarta Sans',sans-serif" }}>{fmt(costo)}</span>
                              </div>
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {showNegModal && (
        <div onClick={() => setShowNegModal(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
          <div onClick={(e) => e.stopPropagation()} style={{ background: '#fff', borderRadius: 'var(--radius-lg)', width: '100%', maxWidth: '420px', overflow: 'hidden', boxShadow: '0 24px 64px rgba(0,0,0,0.18)', animation: 'modalIn 0.22s ease both' }}>
            <div style={{ padding: '20px 24px', background: 'var(--gray-50)', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <h2 style={{ fontSize: '17px', fontWeight: 800, color: 'var(--gray-900)', fontFamily: "'Plus Jakarta Sans',sans-serif", margin: 0 }}>Asociar negocio (opcional)</h2>
              <button onClick={() => setShowNegModal(false)} style={{ width: '30px', height: '30px', border: 'none', background: 'var(--gray-100)', borderRadius: 'var(--radius-sm)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <X style={{ width: '15px', height: '15px', color: 'var(--gray-500)' }} />
              </button>
            </div>
            <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <p style={{ fontSize: '13px', color: 'var(--gray-500)', fontFamily: "'DM Sans',sans-serif", margin: 0 }}>Puedes asociar este curso a uno de tus negocios para llevar un mejor registro.</p>
              <select value={negocioSel} onChange={(e) => setNegocioSel(e.target.value)} style={{ width: '100%', padding: '10px 12px', border: '1.5px solid var(--border)', borderRadius: 'var(--radius-md)', fontSize: '14px', fontFamily: "'DM Sans',sans-serif", outline: 'none', background: '#fff' }}>
                <option value="">Sin negocio</option>
                {negocios.map((n) => <option key={n.id} value={n.id}>{n.nombreNegocio}</option>)}
              </select>
              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                <button onClick={() => setShowNegModal(false)} style={{ padding: '9px 18px', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', background: '#fff', color: 'var(--gray-700)', fontSize: '14px', fontWeight: 600, fontFamily: "'DM Sans',sans-serif", cursor: 'pointer' }}>
                  Cancelar
                </button>
                <button onClick={confirmarInscripcion} style={{ padding: '9px 22px', border: 'none', borderRadius: 'var(--radius-md)', background: 'linear-gradient(135deg,var(--capyme-blue-mid),var(--capyme-blue))', color: '#fff', fontSize: '14px', fontWeight: 600, fontFamily: "'DM Sans',sans-serif", cursor: 'pointer', boxShadow: '0 2px 8px rgba(31,78,158,0.28)' }}>
                  Continuar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default CursosDisponibles;