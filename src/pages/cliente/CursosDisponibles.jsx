import { useState, useEffect } from 'react';
import Layout from '../../components/common/Layout';
import { cursosService } from '../../services/cursosService';
import { pagosService } from '../../services/pagosService';
import {
  GraduationCap, Search, Calendar, Users, Clock,
  Monitor, MapPin, Layers, User, ChevronDown,
  CheckCircle, AlertCircle,
} from 'lucide-react';
import { toast } from 'react-hot-toast';

const MPLogo = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0 }}>
    <circle cx="12" cy="12" r="12" fill="white" fillOpacity="0.22"/>
    <path d="M5.5 12.5C5.5 9.46 7.96 7 11 7C13.54 7 15.68 8.73 16.3 11.08H14.19C13.63 9.67 12.44 8.67 11 8.67C9.03 8.67 7.42 10.41 7.42 12.5C7.42 14.59 9.03 16.33 11 16.33C12.44 16.33 13.63 15.33 14.19 13.92H16.3C15.68 16.27 13.54 18 11 18C7.96 18 5.5 15.54 5.5 12.5Z" fill="white"/>
  </svg>
);

const Spinner = ({ size = 15 }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" style={{ animation: 'mpSpin 0.8s linear infinite', flexShrink: 0 }}>
    <circle cx="8" cy="8" r="6" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="2"/>
    <path d="M8 2 A6 6 0 0 1 14 8" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round"/>
  </svg>
);

const CursosDisponibles = () => {
  const [cursos,          setCursos]          = useState([]);
  const [loading,         setLoading]         = useState(true);
  const [procesando,      setProcesando]      = useState(null);
  const [searchTerm,      setSearchTerm]      = useState('');
  const [filterModalidad, setFilterModalidad] = useState('');

  const inputBase = { width: '100%', padding: '10px 12px', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', fontSize: '14px', fontFamily: "'DM Sans', sans-serif", color: 'var(--gray-900)', background: '#fff', outline: 'none', transition: 'all 200ms ease', boxSizing: 'border-box' };
  const inputIcon = { ...inputBase, paddingLeft: '38px' };
  const selectSt  = { ...inputBase, appearance: 'none', paddingRight: '36px', cursor: 'pointer' };

  useEffect(() => { cargarCursos(); }, [filterModalidad]); // eslint-disable-line

  const cargarCursos = async () => {
    try {
      setLoading(true);
      const params = { activo: 'true' };
      if (filterModalidad) params.modalidad = filterModalidad;
      const res = await cursosService.getAll(params);
      setCursos(res.data || []);
    } catch { toast.error('Error al cargar cursos'); }
    finally { setLoading(false); }
  };

  const handlePagar = async (curso) => {
    const costo   = curso.costo ? parseFloat(curso.costo) : 0;
    const esGratis = costo === 0;
    try {
      setProcesando(curso.id);
      const resInscripcion = await cursosService.inscribir(curso.id);
      if (esGratis) { toast.success('¡Inscripción realizada!'); cargarCursos(); return; }
      const referencia = resInscripcion.pagoInfo?.referencia;
      if (!referencia) { toast.error('No se pudo obtener la referencia de pago'); return; }
      const resPago = await pagosService.crearPreferencia({ titulo: `Inscripción: ${curso.titulo}`, precio: costo, cantidad: 1, idReferencia: referencia, tipo: 'curso' });
      if (resPago.success && resPago.init_point) window.location.href = resPago.init_point;
      else toast.error('No se pudo iniciar el pago. Intenta de nuevo.');
    } catch (error) {
      const data = error.response?.data;
      if (data?.pagoExistente) {
        try {
          const { referencia, monto, tituloCurso } = data.pagoExistente;
          const resPago = await pagosService.crearPreferencia({ titulo: `Inscripción: ${tituloCurso}`, precio: parseFloat(monto), cantidad: 1, idReferencia: referencia, tipo: 'curso' });
          if (resPago.success && resPago.init_point) window.location.href = resPago.init_point;
        } catch { toast.error('No se pudo reanudar el pago.'); }
        return;
      }
      toast.error(data?.message || 'Error al procesar');
    } finally { setProcesando(null); }
  };

  const fmt     = (a) => new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(a);
  const fmtDate = (d) => d ? new Date(d).toLocaleDateString('es-MX', { year: 'numeric', month: 'short', day: 'numeric' }) : null;
  const getModalidadStyle = (m) => ({ online: { bg: '#EEF4FF', color: 'var(--capyme-blue-mid)' }, presencial: { bg: '#F0FDF4', color: '#16A34A' }, hibrido: { bg: '#F5F3FF', color: '#7C3AED' } }[m] || { bg: 'var(--gray-100)', color: 'var(--gray-600)' });
  const getModalidadIcon  = (m) => m === 'presencial' ? MapPin : m === 'hibrido' ? Layers : Monitor;
  const getModalidadLabel = (m) => ({ online: 'Online', presencial: 'Presencial', hibrido: 'Híbrido' }[m] || m);
  const filtrados = cursos.filter(c => c.titulo.toLowerCase().includes(searchTerm.toLowerCase()) || (c.instructor || '').toLowerCase().includes(searchTerm.toLowerCase()));

  if (loading) return (
    <Layout>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '300px', flexDirection: 'column', gap: '16px' }}>
        <div style={{ width: '40px', height: '40px', border: '3px solid var(--gray-200)', borderTopColor: 'var(--capyme-blue-mid)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
        <style>{`@keyframes spin{to{transform:rotate(360deg);}}`}</style>
      </div>
    </Layout>
  );

  return (
    <Layout>
      <style>{`
        @keyframes mpSpin   { to { transform: rotate(360deg); } }
        @keyframes fadeInUp { from{opacity:0;transform:translateY(10px);}to{opacity:1;transform:translateY(0);} }
        .curso-card { animation: fadeInUp 0.3s ease both; transition: box-shadow 200ms, transform 200ms; }
        .curso-card:hover { box-shadow: 0 8px 28px rgba(31,78,158,0.12); transform: translateY(-3px); }
        .mp-btn:hover:not(:disabled) { filter: brightness(1.07); transform: translateY(-2px) !important; box-shadow: 0 10px 28px rgba(0,158,227,0.50) !important; }
        .mp-btn:active:not(:disabled) { transform: translateY(0) !important; filter: brightness(0.97); }
      `}</style>

      <div style={{ padding: '0 0 40px' }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '28px' }}>
          <div style={{ width: '46px', height: '46px', background: 'linear-gradient(135deg, var(--capyme-blue-mid), var(--capyme-blue))', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(31,78,158,0.25)' }}>
            <GraduationCap style={{ width: '22px', height: '22px', color: '#fff' }} />
          </div>
          <div>
            <h1 style={{ fontSize: '22px', fontWeight: 800, color: 'var(--gray-900)', fontFamily: "'Plus Jakarta Sans', sans-serif", margin: 0 }}>Cursos disponibles</h1>
            <p style={{ fontSize: '13px', color: 'var(--gray-500)', margin: '2px 0 0', fontFamily: "'DM Sans', sans-serif" }}>{filtrados.length} curso{filtrados.length !== 1 ? 's' : ''} disponible{filtrados.length !== 1 ? 's' : ''}</p>
          </div>
        </div>

        {/* Filtros */}
        <div style={{ background: '#fff', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '14px 18px', marginBottom: '20px', display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap', boxShadow: 'var(--shadow-sm)' }}>
          <div style={{ position: 'relative', flex: 1, minWidth: '180px' }}>
            <Search style={{ position: 'absolute', left: '11px', top: '50%', transform: 'translateY(-50%)', width: '15px', height: '15px', color: 'var(--gray-400)', pointerEvents: 'none' }} />
            <input type="text" placeholder="Buscar curso o instructor…" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} style={inputIcon} />
          </div>
          <div style={{ position: 'relative', minWidth: '170px' }}>
            <select value={filterModalidad} onChange={e => setFilterModalidad(e.target.value)} style={{ ...selectSt, width: '100%' }}>
              <option value="">Todas las modalidades</option>
              <option value="online">Online</option>
              <option value="presencial">Presencial</option>
              <option value="hibrido">Híbrido</option>
            </select>
            <ChevronDown style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', width: '14px', height: '14px', color: 'var(--gray-400)', pointerEvents: 'none' }} />
          </div>
        </div>

        {/* Tarjetas */}
        {filtrados.length === 0 ? (
          <div style={{ background: '#fff', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '60px 20px', textAlign: 'center' }}>
            <GraduationCap style={{ width: '28px', height: '28px', color: 'var(--gray-300)', margin: '0 auto 12px', display: 'block' }} />
            <p style={{ fontSize: '15px', fontWeight: 600, color: 'var(--gray-600)', margin: 0, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>No hay cursos disponibles</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '18px' }}>
            {filtrados.map((curso, idx) => {
              const ms       = getModalidadStyle(curso.modalidad);
              const MIcon    = getModalidadIcon(curso.modalidad);
              const costo    = curso.costo ? parseFloat(curso.costo) : 0;
              const esGratis = costo === 0;
              const activo   = procesando === curso.id;

              return (
                <div key={curso.id} className="curso-card" style={{ background: '#fff', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', overflow: 'hidden', animationDelay: `${idx * 40}ms` }}>
                  <div style={{ height: '4px', background: curso.yaInscrito ? 'linear-gradient(90deg,#16A34A,#4ade80)' : 'linear-gradient(90deg,var(--capyme-blue-mid),var(--capyme-blue))' }} />
                  <div style={{ padding: '22px' }}>
                    <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--gray-900)', fontFamily: "'Plus Jakarta Sans', sans-serif", margin: '0 0 10px', lineHeight: 1.35 }}>{curso.titulo}</h3>
                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '14px' }}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '2px 9px', borderRadius: '20px', fontSize: '11px', fontWeight: 700, background: ms.bg, color: ms.color, fontFamily: "'Plus Jakarta Sans', sans-serif", textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                        <MIcon style={{ width: '9px', height: '9px' }} />{getModalidadLabel(curso.modalidad)}
                      </span>
                      <span style={{ display: 'inline-flex', alignItems: 'center', padding: '2px 9px', borderRadius: '20px', fontSize: '11px', fontWeight: 700, background: esGratis ? '#ECFDF5' : '#EFF8FF', color: esGratis ? '#065F46' : '#0369A1', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                        {esGratis ? 'Gratis' : fmt(costo)}
                      </span>
                    </div>
                    {curso.descripcion && <p style={{ fontSize: '13px', color: 'var(--gray-500)', margin: '0 0 16px', fontFamily: "'DM Sans', sans-serif", lineHeight: 1.55, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{curso.descripcion}</p>}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '7px', marginBottom: '20px' }}>
                      {curso.instructor    && <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}><User     style={{ width: '13px', height: '13px', color: 'var(--gray-400)', flexShrink: 0 }} /><span style={{ fontSize: '13px', color: 'var(--gray-700)', fontFamily: "'DM Sans', sans-serif" }}>{curso.instructor}</span></div>}
                      {curso.duracionHoras && <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}><Clock    style={{ width: '13px', height: '13px', color: 'var(--gray-400)', flexShrink: 0 }} /><span style={{ fontSize: '12px', color: 'var(--gray-500)', fontFamily: "'DM Sans', sans-serif" }}>{curso.duracionHoras} horas</span></div>}
                      {(curso.fechaInicio || curso.fechaFin) && <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}><Calendar style={{ width: '13px', height: '13px', color: 'var(--gray-400)', flexShrink: 0 }} /><span style={{ fontSize: '12px', color: 'var(--gray-500)', fontFamily: "'DM Sans', sans-serif" }}>{fmtDate(curso.fechaInicio)}{curso.fechaFin ? ` → ${fmtDate(curso.fechaFin)}` : ''}</span></div>}
                      {curso.cupoMaximo    && <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}><Users    style={{ width: '13px', height: '13px', color: 'var(--gray-400)', flexShrink: 0 }} /><span style={{ fontSize: '12px', color: 'var(--gray-500)', fontFamily: "'DM Sans', sans-serif" }}><span style={{ fontWeight: 700, color: 'var(--gray-800)' }}>{curso.inscritosCount || 0}</span> / {curso.cupoMaximo} lugares</span></div>}
                    </div>

                    {/* ── CTA ── */}
                    {curso.yaInscrito ? (
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '13px', background: '#ECFDF5', borderRadius: 'var(--radius-md)', border: '1px solid #A7F3D0' }}>
                        <CheckCircle style={{ width: '16px', height: '16px', color: '#16A34A' }} />
                        <span style={{ fontSize: '14px', fontWeight: 700, color: '#065F46', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Ya estás inscrito ✓</span>
                      </div>

                    ) : esGratis ? (
                      <button onClick={() => handlePagar(curso)} disabled={activo}
                        style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '13px', border: 'none', borderRadius: 'var(--radius-md)', background: activo ? 'var(--gray-300)' : 'linear-gradient(135deg,var(--capyme-blue-mid),var(--capyme-blue))', color: '#fff', fontSize: '14px', fontWeight: 700, fontFamily: "'Plus Jakarta Sans', sans-serif", cursor: activo ? 'not-allowed' : 'pointer', boxShadow: activo ? 'none' : '0 4px 14px rgba(31,78,158,0.28)', transition: 'all 150ms' }}>
                        {activo ? <Spinner /> : <GraduationCap style={{ width: '16px', height: '16px' }} />}
                        {activo ? 'Procesando…' : 'Inscribirme gratis'}
                      </button>

                    ) : (
                      /* ── BOTÓN MERCADO PAGO ── */
                      <button className="mp-btn" onClick={() => handlePagar(curso)} disabled={activo}
                        style={{ width: '100%', display: 'flex', alignItems: 'stretch', border: 'none', borderRadius: '14px', background: activo ? '#85C8E8' : 'linear-gradient(160deg,#00C3F5 0%,#009EE3 45%,#0079B4 100%)', cursor: activo ? 'not-allowed' : 'pointer', boxShadow: activo ? 'none' : '0 5px 20px rgba(0,158,227,0.42)', overflow: 'hidden', position: 'relative', transition: 'all 160ms ease' }}>

                        {/* Brillo superior */}
                        {!activo && <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '1px', background: 'linear-gradient(90deg,transparent,rgba(255,255,255,0.4),transparent)' }} />}

                        {/* Parte izquierda */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '14px 16px 14px 20px', flex: 1 }}>
                          {activo ? <Spinner size={18} /> : <MPLogo />}
                          <div style={{ textAlign: 'left' }}>
                            <div style={{ fontSize: '13px', fontWeight: 700, color: '#fff', fontFamily: "'Plus Jakarta Sans', sans-serif", lineHeight: 1.25 }}>
                              {activo ? 'Redirigiendo a Mercado Pago…' : 'Pagar con Mercado Pago'}
                            </div>
                            {!activo && (
                              <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.75)', fontFamily: "'DM Sans', sans-serif", marginTop: '2px' }}>
                                Tarjeta · Transferencia · Efectivo
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Divisor */}
                        {!activo && <div style={{ width: '1px', background: 'rgba(255,255,255,0.22)', margin: '10px 0' }} />}

                        {/* Precio */}
                        {!activo && (
                          <div style={{ display: 'flex', alignItems: 'center', padding: '14px 20px 14px 16px', flexShrink: 0 }}>
                            <span style={{ fontSize: '17px', fontWeight: 800, color: '#fff', fontFamily: "'Plus Jakarta Sans', sans-serif", letterSpacing: '-0.01em' }}>
                              {fmt(costo)}
                            </span>
                          </div>
                        )}
                      </button>
                    )}

                    {/* Aviso pago en proceso */}
                    {curso.miPagoPendiente && !curso.yaInscrito && (
                      <div style={{ marginTop: '10px', padding: '9px 12px', background: '#FFFBEB', borderRadius: 'var(--radius-sm)', border: '1px solid #FDE68A', display: 'flex', alignItems: 'center', gap: '7px' }}>
                        <AlertCircle style={{ width: '13px', height: '13px', color: '#B45309', flexShrink: 0 }} />
                        <span style={{ fontSize: '12px', color: '#92400E', fontFamily: "'DM Sans', sans-serif" }}>
                          Tienes un pago en proceso — haz clic arriba para completarlo.
                        </span>
                      </div>
                    )}
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

export default CursosDisponibles;