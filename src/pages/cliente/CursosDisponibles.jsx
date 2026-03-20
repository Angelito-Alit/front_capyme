import { useState, useEffect } from 'react';
import Layout from '../../components/common/Layout';
import { cursosService } from '../../services/cursosService';
import { pagosService } from '../../services/pagosService';
import {
  GraduationCap, Search, Calendar, Users, Clock,
  DollarSign, Monitor, MapPin, Layers, User,
  ChevronDown, BookOpen, CheckCircle, CreditCard,
  ShoppingCart, Loader,
} from 'lucide-react';
import { toast } from 'react-hot-toast';

const CursosDisponibles = () => {
  const [cursos, setCursos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterModalidad, setFilterModalidad] = useState('');
  const [procesandoPago, setProcesandoPago] = useState(null);
  const [inscribiendo, setInscribiendo] = useState(null);

  const inputBaseStyle = {
    width: '100%', padding: '10px 12px',
    border: '1px solid var(--border)', borderRadius: 'var(--radius-md)',
    fontSize: '14px', fontFamily: "'DM Sans', sans-serif",
    color: 'var(--gray-900)', background: '#fff',
    outline: 'none', transition: 'all 200ms ease', boxSizing: 'border-box',
  };
  const inputWithIconStyle = { ...inputBaseStyle, paddingLeft: '38px' };
  const selectStyle = { ...inputBaseStyle, appearance: 'none', paddingRight: '36px', cursor: 'pointer' };

  useEffect(() => { cargarCursos(); }, [filterModalidad]);

  const cargarCursos = async () => {
    try {
      setLoading(true);
      const params = { activo: 'true' };
      if (filterModalidad) params.modalidad = filterModalidad;
      const res = await cursosService.getAll(params);
      setCursos(res.data || []);
    } catch {
      toast.error('Error al cargar cursos');
    } finally {
      setLoading(false);
    }
  };

  // ─── Inscripción + arrancar Checkout Pro ─────────────────────────────────
  const handleInscribir = async (curso) => {
    const costo = curso.costo ? parseFloat(curso.costo) : 0;
    const esGratis = costo === 0;

    try {
      setInscribiendo(curso.id);

      // 1. Crear la inscripción en el backend
      const resInscripcion = await cursosService.inscribir(curso.id);

      if (esGratis) {
        toast.success('¡Inscripción realizada exitosamente!');
        cargarCursos();
        return;
      }

      // 2. Si tiene costo → crear preferencia de MP y redirigir
      const referencia = resInscripcion.pagoInfo?.referencia;
      if (!referencia) {
        toast.error('No se pudo obtener la referencia de pago');
        return;
      }

      setProcesandoPago(curso.id);
      const resPago = await pagosService.crearPreferencia({
        titulo: `Inscripción: ${curso.titulo}`,
        precio: costo,
        cantidad: 1,
        idReferencia: referencia,
        tipo: 'curso',
      });

      if (resPago.success && resPago.init_point) {
        // Redirigir al checkout de Mercado Pago
        window.location.href = resPago.init_point;
      } else {
        toast.error('No se pudo iniciar el proceso de pago');
      }
    } catch (error) {
      const msg = error.response?.data?.message || 'Error al procesar la inscripción';
      // Si ya existe pago pendiente, redirigir a MP directamente
      if (error.response?.data?.pagoExistente) {
        const { referencia, monto, tituloCurso } = error.response.data.pagoExistente;
        toast.error('Ya tienes un pago pendiente para este curso. Redirigiendo a pago…');
        try {
          setProcesandoPago(curso.id);
          const resPago = await pagosService.crearPreferencia({
            titulo: `Inscripción: ${tituloCurso}`,
            precio: parseFloat(monto),
            cantidad: 1,
            idReferencia: referencia,
            tipo: 'curso',
          });
          if (resPago.success && resPago.init_point) {
            window.location.href = resPago.init_point;
          }
        } catch {
          toast.error('No se pudo iniciar el pago. Intenta de nuevo.');
        }
      } else {
        toast.error(msg);
      }
    } finally {
      setInscribiendo(null);
      setProcesandoPago(null);
    }
  };

  const formatCurrency = (amount) => {
    if (amount == null) return null;
    return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(amount);
  };

  const formatDate = (date) => {
    if (!date) return null;
    return new Date(date).toLocaleDateString('es-MX', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  const getModalidadStyle = (m) => ({
    online:     { bg: '#EEF4FF', color: 'var(--capyme-blue-mid)' },
    presencial: { bg: '#F0FDF4', color: '#16A34A' },
    hibrido:    { bg: '#F5F3FF', color: '#7C3AED' },
  }[m] || { bg: 'var(--gray-100)', color: 'var(--gray-600)' });

  const getModalidadIcon  = (m) => m === 'presencial' ? MapPin : m === 'hibrido' ? Layers : Monitor;
  const getModalidadLabel = (m) => ({ online: 'Online', presencial: 'Presencial', hibrido: 'Híbrido' }[m] || m);

  const cursosFiltrados = cursos.filter(c =>
    c.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (c.instructor || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return (
    <Layout>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '300px', flexDirection: 'column', gap: '16px' }}>
        <div style={{ width: '40px', height: '40px', border: '3px solid var(--gray-200)', borderTopColor: 'var(--capyme-blue-mid)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
        <span style={{ fontSize: '14px', color: 'var(--gray-500)', fontFamily: "'DM Sans', sans-serif" }}>Cargando cursos...</span>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    </Layout>
  );

  return (
    <Layout>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeInUp { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
        .curso-card { transition: box-shadow 200ms ease, transform 200ms ease; animation: fadeInUp 0.3s ease both; }
        .curso-card:hover { box-shadow: 0 8px 28px rgba(31,78,158,0.12); transform: translateY(-3px); }
      `}</style>

      <div style={{ padding: '0 0 40px' }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '28px', flexWrap: 'wrap', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{ width: '46px', height: '46px', background: 'linear-gradient(135deg, var(--capyme-blue-mid), var(--capyme-blue))', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(31,78,158,0.25)' }}>
              <GraduationCap style={{ width: '22px', height: '22px', color: '#fff' }} />
            </div>
            <div>
              <h1 style={{ fontSize: '22px', fontWeight: 800, color: 'var(--gray-900)', fontFamily: "'Plus Jakarta Sans', sans-serif", margin: 0, lineHeight: 1.2 }}>Cursos disponibles</h1>
              <p style={{ fontSize: '13px', color: 'var(--gray-500)', margin: '3px 0 0', fontFamily: "'DM Sans', sans-serif" }}>
                {cursosFiltrados.length} curso{cursosFiltrados.length !== 1 ? 's' : ''} disponible{cursosFiltrados.length !== 1 ? 's' : ''}
              </p>
            </div>
          </div>
        </div>

        {/* Filtros */}
        <div style={{ background: '#fff', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '16px 20px', marginBottom: '20px', display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap', boxShadow: 'var(--shadow-sm)' }}>
          <div style={{ position: 'relative', flex: '1', minWidth: '180px' }}>
            <Search style={{ position: 'absolute', left: '11px', top: '50%', transform: 'translateY(-50%)', width: '15px', height: '15px', color: 'var(--gray-400)', pointerEvents: 'none' }} />
            <input type="text" placeholder="Buscar curso o instructor…" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} style={inputWithIconStyle} />
          </div>
          <div style={{ position: 'relative', minWidth: '170px' }}>
            <select value={filterModalidad} onChange={e => setFilterModalidad(e.target.value)} style={{ ...selectStyle, width: '100%' }}>
              <option value="">Todas las modalidades</option>
              <option value="online">Online</option>
              <option value="presencial">Presencial</option>
              <option value="hibrido">Híbrido</option>
            </select>
            <ChevronDown style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', width: '14px', height: '14px', color: 'var(--gray-400)', pointerEvents: 'none' }} />
          </div>
        </div>

        {/* Grid de cursos */}
        {cursosFiltrados.length === 0 ? (
          <div style={{ background: '#fff', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '60px 20px', textAlign: 'center', boxShadow: 'var(--shadow-sm)' }}>
            <div style={{ width: '56px', height: '56px', background: 'var(--gray-100)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' }}>
              <GraduationCap style={{ width: '24px', height: '24px', color: 'var(--gray-400)' }} />
            </div>
            <p style={{ fontSize: '15px', fontWeight: 600, color: 'var(--gray-700)', margin: '0 0 6px', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>No hay cursos disponibles</p>
            <p style={{ fontSize: '13px', color: 'var(--gray-400)', margin: 0, fontFamily: "'DM Sans', sans-serif" }}>Intenta con otros filtros</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '18px' }}>
            {cursosFiltrados.map((curso, idx) => {
              const ms = getModalidadStyle(curso.modalidad);
              const MIcon = getModalidadIcon(curso.modalidad);
              const costo = curso.costo ? parseFloat(curso.costo) : 0;
              const esGratis = costo === 0;
              const estaInscribiendo = inscribiendo === curso.id || procesandoPago === curso.id;

              return (
                <div key={curso.id} className="curso-card" style={{ background: '#fff', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', overflow: 'hidden', animationDelay: `${idx * 40}ms` }}>
                  {/* Barra de color superior */}
                  <div style={{ height: '4px', background: curso.yaInscrito ? 'linear-gradient(90deg,#16A34A,#4ade80)' : 'linear-gradient(90deg, var(--capyme-blue-mid), var(--capyme-blue))' }} />

                  <div style={{ padding: '22px' }}>
                    {/* Título y badges */}
                    <div style={{ marginBottom: '12px' }}>
                      <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--gray-900)', fontFamily: "'Plus Jakarta Sans', sans-serif", margin: '0 0 10px', lineHeight: 1.35 }}>
                        {curso.titulo}
                      </h3>
                      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '2px 9px', borderRadius: '20px', fontSize: '11px', fontWeight: 700, background: ms.bg, color: ms.color, fontFamily: "'Plus Jakarta Sans', sans-serif", textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                          <MIcon style={{ width: '9px', height: '9px' }} />{getModalidadLabel(curso.modalidad)}
                        </span>
                        <span style={{ display: 'inline-flex', alignItems: 'center', padding: '2px 9px', borderRadius: '20px', fontSize: '11px', fontWeight: 700, background: esGratis ? '#ECFDF5' : '#FFF7ED', color: esGratis ? '#065F46' : '#C2410C', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                          {esGratis ? 'Gratis' : formatCurrency(costo)}
                        </span>
                      </div>
                    </div>

                    {/* Descripción */}
                    {curso.descripcion && (
                      <p style={{ fontSize: '13px', color: 'var(--gray-500)', margin: '0 0 16px', fontFamily: "'DM Sans', sans-serif", lineHeight: 1.55, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                        {curso.descripcion}
                      </p>
                    )}

                    {/* Detalles */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '20px' }}>
                      {curso.instructor && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
                          <User style={{ width: '13px', height: '13px', color: 'var(--gray-400)', flexShrink: 0 }} />
                          <span style={{ fontSize: '13px', color: 'var(--gray-700)', fontFamily: "'DM Sans', sans-serif" }}>{curso.instructor}</span>
                        </div>
                      )}
                      {curso.duracionHoras && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
                          <Clock style={{ width: '13px', height: '13px', color: 'var(--gray-400)', flexShrink: 0 }} />
                          <span style={{ fontSize: '12px', color: 'var(--gray-500)', fontFamily: "'DM Sans', sans-serif" }}>{curso.duracionHoras} horas</span>
                        </div>
                      )}
                      {(curso.fechaInicio || curso.fechaFin) && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
                          <Calendar style={{ width: '13px', height: '13px', color: 'var(--gray-400)', flexShrink: 0 }} />
                          <span style={{ fontSize: '12px', color: 'var(--gray-500)', fontFamily: "'DM Sans', sans-serif" }}>
                            {formatDate(curso.fechaInicio)}{curso.fechaFin ? ` → ${formatDate(curso.fechaFin)}` : ''}
                          </span>
                        </div>
                      )}
                      {curso.cupoMaximo && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
                          <Users style={{ width: '13px', height: '13px', color: 'var(--gray-400)', flexShrink: 0 }} />
                          <span style={{ fontSize: '12px', color: 'var(--gray-500)', fontFamily: "'DM Sans', sans-serif" }}>
                            <span style={{ fontWeight: 700, color: 'var(--gray-800)' }}>{curso.inscritosCount || 0}</span> / {curso.cupoMaximo} lugares
                          </span>
                        </div>
                      )}
                    </div>

                    {/* ─── Botón de acción ─────────────────────────────── */}
                    {curso.yaInscrito ? (
                      // Ya inscrito y pago confirmado
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '12px', background: '#ECFDF5', borderRadius: 'var(--radius-md)', border: '1px solid #A7F3D0' }}>
                        <CheckCircle style={{ width: '16px', height: '16px', color: '#16A34A' }} />
                        <span style={{ fontSize: '14px', fontWeight: 700, color: '#065F46', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Ya estás inscrito</span>
                      </div>
                    ) : esGratis ? (
                      // Curso gratuito
                      <button
                        onClick={() => handleInscribir(curso)}
                        disabled={estaInscribiendo}
                        style={{
                          width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                          padding: '12px 20px', border: 'none', borderRadius: 'var(--radius-md)',
                          background: estaInscribiendo ? 'var(--gray-300)' : 'linear-gradient(135deg, var(--capyme-blue-mid), var(--capyme-blue))',
                          color: '#fff', fontSize: '14px', fontWeight: 700,
                          fontFamily: "'Plus Jakarta Sans', sans-serif",
                          cursor: estaInscribiendo ? 'not-allowed' : 'pointer',
                          boxShadow: estaInscribiendo ? 'none' : '0 4px 14px rgba(31,78,158,0.28)',
                          transition: 'all 150ms ease',
                        }}
                        onMouseEnter={e => { if (!estaInscribiendo) e.currentTarget.style.opacity = '0.9'; }}
                        onMouseLeave={e => e.currentTarget.style.opacity = '1'}
                      >
                        {estaInscribiendo
                          ? <><Loader style={{ width: '15px', height: '15px', animation: 'spin 0.8s linear infinite' }} />Procesando...</>
                          : <><BookOpen style={{ width: '15px', height: '15px' }} />Inscribirme gratis</>
                        }
                      </button>
                    ) : (
                      // Curso de pago → botón Mercado Pago
                      <button
                        onClick={() => handleInscribir(curso)}
                        disabled={estaInscribiendo}
                        style={{
                          width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
                          padding: '13px 20px', border: 'none', borderRadius: 'var(--radius-md)',
                          background: estaInscribiendo ? 'var(--gray-300)' : '#009EE3',
                          color: '#fff', fontSize: '14px', fontWeight: 700,
                          fontFamily: "'Plus Jakarta Sans', sans-serif",
                          cursor: estaInscribiendo ? 'not-allowed' : 'pointer',
                          boxShadow: estaInscribiendo ? 'none' : '0 4px 16px rgba(0,158,227,0.35)',
                          transition: 'all 150ms ease',
                        }}
                        onMouseEnter={e => { if (!estaInscribiendo) { e.currentTarget.style.background = '#0086C4'; e.currentTarget.style.transform = 'translateY(-1px)'; } }}
                        onMouseLeave={e => { e.currentTarget.style.background = estaInscribiendo ? 'var(--gray-300)' : '#009EE3'; e.currentTarget.style.transform = 'translateY(0)'; }}
                      >
                        {estaInscribiendo ? (
                          <><Loader style={{ width: '16px', height: '16px', animation: 'spin 0.8s linear infinite' }} />Redirigiendo...</>
                        ) : (
                          <>
                            {/* Logo MP inline */}
                            <svg width="20" height="20" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <circle cx="16" cy="16" r="16" fill="white"/>
                              <path d="M8 16.5C8 12.36 11.36 9 15.5 9C19.09 9 22.07 11.47 22.82 14.83H20.25C19.57 12.84 17.69 11.42 15.5 11.42C12.7 11.42 10.42 13.7 10.42 16.5C10.42 19.3 12.7 21.58 15.5 21.58C17.69 21.58 19.57 20.16 20.25 18.17H22.82C22.07 21.53 19.09 24 15.5 24C11.36 24 8 20.64 8 16.5Z" fill="#009EE3"/>
                            </svg>
                            Pagar con Mercado Pago — {formatCurrency(costo)}
                          </>
                        )}
                      </button>
                    )}

                    {/* Indicador pago pendiente */}
                    {curso.miPagoPendiente && !curso.yaInscrito && (
                      <div style={{ marginTop: '10px', padding: '10px 12px', background: '#FFFBEB', borderRadius: 'var(--radius-sm)', border: '1px solid #FDE68A', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <CreditCard style={{ width: '14px', height: '14px', color: '#B45309', flexShrink: 0 }} />
                        <span style={{ fontSize: '12px', color: '#92400E', fontFamily: "'DM Sans', sans-serif", lineHeight: 1.4 }}>
                          Tienes un pago en proceso. Haz clic arriba para completarlo.
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