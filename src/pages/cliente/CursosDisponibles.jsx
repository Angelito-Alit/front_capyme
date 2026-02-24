import { useState, useEffect } from 'react';
import Layout from '../../components/common/Layout';
import { cursosService } from '../../services/cursosService';
import {
  GraduationCap,
  Search,
  Calendar,
  Clock,
  Monitor,
  MapPin,
  Users,
  CheckCircle,
  Layers,
  ChevronDown,
  X,
  Copy,
  MessageSquare,
  Banknote,
  AlertTriangle,
  ExternalLink,
  RefreshCw,
} from 'lucide-react';
import { toast } from 'react-hot-toast';

const modalidadConfig = {
  online:     { label: 'Online',     icon: Monitor, bg: '#EEF4FF', color: 'var(--capyme-blue-mid)' },
  presencial: { label: 'Presencial', icon: MapPin,  bg: '#ECFDF5', color: '#059669' },
  hibrido:    { label: 'Híbrido',    icon: Layers,  bg: '#F5F3FF', color: '#7C3AED' },
};

const CursosDisponibles = () => {
  const authStorage = JSON.parse(localStorage.getItem('auth-storage') || '{}');
  const currentUser = authStorage?.state?.user || {};

  const [cursos, setCursos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [inscribiendoId, setInscribiendoId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterModalidad, setFilterModalidad] = useState('');
  const [pagoModal, setPagoModal] = useState(null);
  const [cursosConPagoPendiente, setCursosConPagoPendiente] = useState({});

  useEffect(() => {
    cargarCursos();
  }, [filterModalidad]);

  const cargarCursos = async () => {
    try {
      setLoading(true);
      const params = { activo: true };
      if (filterModalidad) params.modalidad = filterModalidad;
      const response = await cursosService.getAll(params);
      setCursos(response.data);
    } catch {
      toast.error('Error al cargar cursos');
    } finally {
      setLoading(false);
    }
  };

  const handleInscribir = async (cursoId) => {
    setInscribiendoId(cursoId);
    try {
      const res = await cursosService.inscribir(cursoId);
      if (res.requierePago && res.pagoInfo) {
        setPagoModal({ ...res.pagoInfo, cursoId });
        setCursosConPagoPendiente(prev => ({ ...prev, [cursoId]: true }));
        toast.success('¡Solicitud registrada! Realiza tu transferencia para confirmar.');
      } else {
        toast.success('¡Inscripción exitosa!');
        cargarCursos();
      }
    } catch (error) {
      const data = error.response?.data;
      if (data?.pagoExistente) {
        setPagoModal({ ...data.pagoExistente, cursoId });
        setCursosConPagoPendiente(prev => ({ ...prev, [cursoId]: true }));
        toast('Ya tienes un pago pendiente para este curso', { icon: '💳' });
      } else {
        toast.error(data?.message || 'Error al inscribirse');
      }
    } finally {
      setInscribiendoId(null);
    }
  };

  const handleVerMiPago = async (cursoId) => {
    try {
      const res = await cursosService.getMiPago(cursoId);
      if (res.data?.tienePago) {
        setPagoModal({ ...res.data, cursoId });
      } else {
        toast('No tienes un pago pendiente para este curso');
      }
    } catch {
      toast.error('Error al cargar tu pago');
    }
  };

  const cursosFiltrados = cursos.filter(c =>
    c.titulo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.instructor?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatCurrency = (amount) =>
    new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(amount);

  const formatDate = (date) => {
    if (!date) return null;
    return new Date(date).toLocaleDateString('es-MX', {
      year: 'numeric', month: 'short', day: 'numeric',
    });
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
            Cargando cursos...
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
          }}>Cursos Disponibles</h1>
          <p style={{ fontSize: '14px', color: 'var(--gray-500)', fontFamily: "'DM Sans', sans-serif" }}>
            Capacítate y mejora las habilidades de tu negocio
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
              placeholder="Buscar por título o instructor..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              style={{ ...inputBaseStyle, paddingLeft: '38px' }}
            />
          </div>
          <div style={{ position: 'relative', flex: '0 1 200px' }}>
            <select
              value={filterModalidad}
              onChange={e => setFilterModalidad(e.target.value)}
              style={selectStyle}
            >
              <option value="">Todas las modalidades</option>
              <option value="online">Online</option>
              <option value="presencial">Presencial</option>
              <option value="hibrido">Híbrido</option>
            </select>
            <ChevronDown style={{
              position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)',
              width: '14px', height: '14px', color: 'var(--gray-400)', pointerEvents: 'none',
            }} />
          </div>
        </div>

        {cursosFiltrados.length > 0 ? (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(290px, 1fr))',
            gap: '18px',
          }}>
            {cursosFiltrados.map(curso => (
              <CursoCard
                key={curso.id}
                curso={curso}
                formatCurrency={formatCurrency}
                formatDate={formatDate}
                inscribiendo={inscribiendoId === curso.id}
                tienePagoPendiente={!!cursosConPagoPendiente[curso.id]}
                onInscribir={() => handleInscribir(curso.id)}
                onVerPago={() => handleVerMiPago(curso.id)}
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
              background: '#FFF7ED',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              marginBottom: '4px',
            }}>
              <GraduationCap style={{ width: '28px', height: '28px', color: '#D97706' }} />
            </div>
            <h3 style={{
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              fontSize: '17px', fontWeight: 700, color: 'var(--gray-900)',
            }}>
              {searchTerm || filterModalidad ? 'Sin resultados' : 'No hay cursos disponibles'}
            </h3>
            <p style={{ fontSize: '14px', color: 'var(--gray-400)', fontFamily: "'DM Sans', sans-serif" }}>
              {searchTerm || filterModalidad
                ? 'Intenta con otros filtros de búsqueda.'
                : 'Vuelve pronto, próximamente habrá nuevos cursos disponibles.'}
            </p>
          </div>
        )}
      </div>

      {pagoModal && (
        <ModalPago
          pago={pagoModal}
          formatCurrency={formatCurrency}
          onClose={() => setPagoModal(null)}
        />
      )}
    </Layout>
  );
};

const CursoCard = ({ curso, formatCurrency, formatDate, inscribiendo, tienePagoPendiente, onInscribir, onVerPago }) => {
  const mod = modalidadConfig[curso.modalidad] || modalidadConfig.online;
  const ModIcon = mod.icon;
  const gratuito = !curso.costo || parseFloat(curso.costo) === 0;
  const cupoLleno = curso.cupoMaximo && (curso.inscritosCount || 0) >= curso.cupoMaximo;
  const pctCupo = curso.cupoMaximo
    ? Math.min(100, Math.round(((curso.inscritosCount || 0) / curso.cupoMaximo) * 100))
    : null;
  const inicio = formatDate(curso.fechaInicio);
  const fin = formatDate(curso.fechaFin);

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
        height: '4px',
        background: gratuito
          ? 'linear-gradient(90deg, #059669, #34D399)'
          : 'linear-gradient(90deg, #D97706, #FCD34D)',
      }} />

      <div style={{ padding: '20px', flex: 1, display: 'flex', flexDirection: 'column', gap: '12px' }}>

        <div>
          <h3 style={{
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            fontSize: '15px', fontWeight: 700,
            color: 'var(--gray-900)', lineHeight: 1.3,
            marginBottom: '8px',
          }}>
            {curso.titulo}
          </h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: '4px',
              padding: '3px 8px', background: mod.bg, color: mod.color,
              borderRadius: '99px', fontSize: '11px', fontWeight: 600,
              fontFamily: "'Plus Jakarta Sans', sans-serif",
            }}>
              <ModIcon style={{ width: '11px', height: '11px' }} />
              {mod.label}
            </span>
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: '4px',
              padding: '3px 8px',
              background: gratuito ? '#ECFDF5' : '#FFFBEB',
              color: gratuito ? '#065F46' : '#92400E',
              borderRadius: '99px', fontSize: '11px', fontWeight: 700,
              fontFamily: "'Plus Jakarta Sans', sans-serif",
            }}>
              {gratuito ? '✓ Gratuito' : formatCurrency(curso.costo)}
            </span>
          </div>
        </div>

        {curso.descripcion && (
          <p style={{
            fontSize: '13px', color: 'var(--gray-500)',
            fontFamily: "'DM Sans', sans-serif", lineHeight: 1.5,
            display: '-webkit-box', WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical', overflow: 'hidden',
          }}>
            {curso.descripcion}
          </p>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {curso.instructor && <InfoFila icon={Users} text={curso.instructor} />}
          {curso.duracionHoras && <InfoFila icon={Clock} text={`${curso.duracionHoras} horas`} />}
          {inicio && <InfoFila icon={Calendar} text={`${inicio}${fin ? ` – ${fin}` : ''}`} />}
        </div>

        {pctCupo !== null && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
              <span style={{ fontSize: '12px', color: 'var(--gray-500)', fontFamily: "'DM Sans', sans-serif" }}>
                Cupo disponible
              </span>
              <span style={{
                fontSize: '12px', fontWeight: 700,
                color: cupoLleno ? '#DC2626' : 'var(--gray-700)',
                fontFamily: "'Plus Jakarta Sans', sans-serif",
              }}>
                {curso.inscritosCount || 0}/{curso.cupoMaximo}
              </span>
            </div>
            <div style={{ height: '5px', background: 'var(--gray-100)', borderRadius: '99px', overflow: 'hidden' }}>
              <div style={{
                height: '100%', width: `${pctCupo}%`,
                background: cupoLleno
                  ? 'linear-gradient(90deg, #DC2626, #FCA5A5)'
                  : pctCupo >= 80
                    ? 'linear-gradient(90deg, #D97706, #FCD34D)'
                    : 'linear-gradient(90deg, #059669, #34D399)',
                borderRadius: '99px', transition: 'width 600ms ease',
              }} />
            </div>
          </div>
        )}

        <div style={{ marginTop: 'auto', paddingTop: '4px' }}>
          {tienePagoPendiente ? (
            /* Pago ya generado en esta sesión: mostrar solo "Ver mi pago pendiente" */
            <button
              onClick={onVerPago}
              style={{
                width: '100%',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                padding: '9px 0',
                background: 'linear-gradient(135deg, #D97706, #B45309)',
                border: 'none', borderRadius: 'var(--radius-md)',
                color: '#fff', fontSize: '13px', fontWeight: 600,
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                cursor: 'pointer',
                boxShadow: '0 2px 8px rgba(0,0,0,0.18)',
                transition: 'all 150ms ease',
              }}
              onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-1px)'}
              onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
            >
              <RefreshCw style={{ width: '14px', height: '14px' }} />
              Ver mi pago pendiente
            </button>
          ) : (
            /* Aún no inscrito: mostrar botón principal de inscripción */
            <button
              onClick={onInscribir}
              disabled={inscribiendo || cupoLleno}
              style={{
                width: '100%',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                padding: '9px 0',
                background: cupoLleno
                  ? 'var(--gray-100)'
                  : inscribiendo
                    ? 'var(--gray-300)'
                    : gratuito
                      ? 'linear-gradient(135deg, var(--capyme-blue-mid), var(--capyme-blue))'
                      : 'linear-gradient(135deg, #D97706, #B45309)',
                border: 'none', borderRadius: 'var(--radius-md)',
                color: cupoLleno ? 'var(--gray-400)' : '#fff',
                fontSize: '13px', fontWeight: 600,
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                cursor: (inscribiendo || cupoLleno) ? 'not-allowed' : 'pointer',
                boxShadow: (inscribiendo || cupoLleno) ? 'none' : '0 2px 8px rgba(0,0,0,0.18)',
                transition: 'all 150ms ease',
              }}
              onMouseEnter={e => { if (!inscribiendo && !cupoLleno) e.currentTarget.style.transform = 'translateY(-1px)'; }}
              onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
            >
              {gratuito
                ? <CheckCircle style={{ width: '14px', height: '14px' }} />
                : <Banknote style={{ width: '14px', height: '14px' }} />}
              {cupoLleno
                ? 'Cupo lleno'
                : inscribiendo
                  ? 'Procesando...'
                  : gratuito
                    ? 'Inscribirme'
                    : `Inscribirme y pagar ${formatCurrency(curso.costo)}`}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

const ModalPago = ({ pago, formatCurrency, onClose }) => {
  const copiar = (text, label) => {
    navigator.clipboard.writeText(text).then(() => toast.success(`${label} copiado`));
  };

  const waLink = pago.whatsappPagos
    ? `https://wa.me/${pago.whatsappPagos.replace(/\D/g, '')}?text=${encodeURIComponent(
        `Hola, acabo de realizar una transferencia interbancaria para inscribirme al curso "${pago.tituloCurso}".\n\nReferencia de pago: ${pago.referencia}\nMonto: ${formatCurrency(pago.monto)}\n\n¿Puedes confirmar la recepción? ¡Gracias!`
      )}`
    : null;

  const pasos = [
    { num: 1, titulo: 'Realiza la transferencia SPEI', desc: 'Ingresa a tu banca en línea o app bancaria y realiza una transferencia con los datos de abajo.' },
    { num: 2, titulo: 'Usa la referencia como concepto', desc: 'En el campo "Concepto" o "Referencia" de la transferencia, escribe exactamente el código mostrado.' },
    { num: 3, titulo: 'Envía tu comprobante por WhatsApp', desc: 'Una vez hecha la transferencia, manda el comprobante de pago al número de WhatsApp indicado.' },
    { num: 4, titulo: 'Espera confirmación', desc: 'El equipo CAPYME verificará el pago en 24–48 horas hábiles y confirmará tu inscripción al curso.' },
  ];

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0,
        background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(4px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        zIndex: 1000, padding: '16px',
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: '#fff', borderRadius: 'var(--radius-lg)',
          width: '100%', maxWidth: '560px', maxHeight: '92vh',
          display: 'flex', flexDirection: 'column',
          boxShadow: '0 24px 64px rgba(0,0,0,0.20)', overflow: 'hidden',
        }}
      >
        <div style={{
          background: 'linear-gradient(135deg, #D97706, #B45309)',
          padding: '22px 24px', position: 'relative', overflow: 'hidden', flexShrink: 0,
        }}>
          <div style={{
            position: 'absolute', top: '-30px', right: '-30px',
            width: '120px', height: '120px',
            background: 'rgba(255,255,255,0.07)', borderRadius: '50%', pointerEvents: 'none',
          }} />
          <div style={{ position: 'relative', zIndex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{
                  width: '38px', height: '38px',
                  background: 'rgba(255,255,255,0.15)', borderRadius: 'var(--radius-md)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <Banknote style={{ width: '20px', height: '20px', color: '#fff' }} />
                </div>
                <div>
                  <h2 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: '17px', fontWeight: 800, color: '#fff', margin: 0 }}>
                    Instrucciones de pago
                  </h2>
                  <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.75)', margin: '2px 0 0', fontFamily: "'DM Sans', sans-serif" }}>
                    {pago.tituloCurso}
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                style={{
                  width: '32px', height: '32px', border: 'none',
                  borderRadius: 'var(--radius-sm)', background: 'rgba(255,255,255,0.15)',
                  color: '#fff', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  transition: 'all 150ms ease',
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.25)'}
                onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.15)'}
              >
                <X style={{ width: '16px', height: '16px' }} />
              </button>
            </div>

            <div style={{
              background: 'rgba(255,255,255,0.15)', borderRadius: 'var(--radius-md)',
              padding: '12px 16px',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            }}>
              <div>
                <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.7)', fontFamily: "'DM Sans', sans-serif", margin: '0 0 2px' }}>
                  Monto a pagar
                </p>
                <p style={{ fontSize: '26px', fontWeight: 800, color: '#fff', fontFamily: "'Plus Jakarta Sans', sans-serif", margin: 0 }}>
                  {formatCurrency(pago.monto)}
                </p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.7)', fontFamily: "'DM Sans', sans-serif", margin: '0 0 2px' }}>Pago vía</p>
                <p style={{ fontSize: '13px', fontWeight: 700, color: '#fff', fontFamily: "'Plus Jakarta Sans', sans-serif", margin: 0 }}>
                  SPEI / Transferencia
                </p>
              </div>
            </div>
          </div>
        </div>

        <div style={{ overflowY: 'auto', flex: 1, padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: '18px' }}>
          {!pago.clabeInterbancaria && (
            <div style={{
              padding: '12px 14px', background: '#FEF2F2', border: '1px solid #FCA5A5',
              borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'flex-start', gap: '8px',
            }}>
              <AlertTriangle style={{ width: '15px', height: '15px', color: '#DC2626', flexShrink: 0, marginTop: '1px' }} />
              <p style={{ fontSize: '13px', color: '#991B1B', fontFamily: "'DM Sans', sans-serif", margin: 0 }}>
                El administrador aún no ha configurado la CLABE interbancaria. Contacta al equipo CAPYME directamente para completar tu pago.
              </p>
            </div>
          )}

          {pago.clabeInterbancaria && (
            <div style={{
              background: 'var(--gray-50)', border: '1px solid var(--border)',
              borderRadius: 'var(--radius-lg)', overflow: 'hidden',
            }}>
              <div style={{ padding: '10px 16px', background: 'var(--gray-100)', borderBottom: '1px solid var(--border)' }}>
                <span style={{
                  fontSize: '11px', fontWeight: 700, color: 'var(--gray-500)',
                  textTransform: 'uppercase', letterSpacing: '0.06em',
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                }}>Datos bancarios para la transferencia</span>
              </div>
              <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <DatoCopiable label="CLABE Interbancaria (18 dígitos)" value={pago.clabeInterbancaria} mono onCopy={() => copiar(pago.clabeInterbancaria, 'CLABE')} />
                <DatoCopiable label="Concepto / Referencia (copia exactamente)" value={pago.referencia} mono highlight onCopy={() => copiar(pago.referencia, 'Referencia')} />
                <DatoCopiable label="Monto exacto a transferir" value={formatCurrency(pago.monto)} onCopy={() => copiar(String(pago.monto), 'Monto')} />
              </div>
            </div>
          )}

          <div>
            <p style={{
              fontSize: '12px', fontWeight: 700, color: 'var(--gray-500)',
              textTransform: 'uppercase', letterSpacing: '0.06em',
              fontFamily: "'Plus Jakarta Sans', sans-serif", marginBottom: '12px',
            }}>Pasos a seguir</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {pasos.map(paso => (
                <div key={paso.num} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                  <div style={{
                    width: '26px', height: '26px', flexShrink: 0, borderRadius: '50%',
                    background: 'linear-gradient(135deg, #D97706, #B45309)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <span style={{ fontSize: '11px', fontWeight: 800, color: '#fff', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{paso.num}</span>
                  </div>
                  <div>
                    <p style={{ fontSize: '13px', fontWeight: 700, color: 'var(--gray-800)', fontFamily: "'Plus Jakarta Sans', sans-serif", margin: '0 0 3px' }}>{paso.titulo}</p>
                    <p style={{ fontSize: '12px', color: 'var(--gray-500)', fontFamily: "'DM Sans', sans-serif", lineHeight: 1.5, margin: 0 }}>{paso.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {waLink && (
            <a href={waLink} target="_blank" rel="noopener noreferrer" style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
              padding: '13px', background: '#25D366', borderRadius: 'var(--radius-lg)',
              textDecoration: 'none', color: '#fff', fontSize: '14px', fontWeight: 700,
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              boxShadow: '0 2px 12px rgba(37,211,102,0.35)', transition: 'all 150ms ease',
            }}
              onMouseEnter={e => e.currentTarget.style.opacity = '0.9'}
              onMouseLeave={e => e.currentTarget.style.opacity = '1'}
            >
              <MessageSquare style={{ width: '18px', height: '18px' }} />
              Enviar comprobante por WhatsApp
              <ExternalLink style={{ width: '13px', height: '13px', opacity: 0.75 }} />
            </a>
          )}

          <div style={{
            padding: '12px 14px', background: '#FFFBEB', border: '1px solid #FDE68A',
            borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'flex-start', gap: '8px',
          }}>
            <AlertTriangle style={{ width: '14px', height: '14px', color: '#D97706', flexShrink: 0, marginTop: '1px' }} />
            <p style={{ fontSize: '12px', color: '#92400E', fontFamily: "'DM Sans', sans-serif", margin: 0, lineHeight: 1.5 }}>
              Tu lugar queda <strong>reservado</strong> mientras se confirma el pago. Puedes cerrar esta ventana y volver a consultarla con el botón <strong>"Ver mi pago pendiente"</strong>.
            </p>
          </div>
        </div>

        <div style={{
          padding: '14px 24px', background: 'var(--gray-50)',
          borderTop: '1px solid var(--border)', flexShrink: 0, display: 'flex', justifyContent: 'flex-end',
        }}>
          <button onClick={onClose} style={{
            padding: '9px 22px', border: '1px solid var(--border)',
            borderRadius: 'var(--radius-md)', background: '#fff', color: 'var(--gray-700)',
            fontSize: '14px', fontWeight: 600, fontFamily: "'DM Sans', sans-serif",
            cursor: 'pointer', transition: 'all 150ms ease',
          }}
            onMouseEnter={e => e.currentTarget.style.background = 'var(--gray-100)'}
            onMouseLeave={e => e.currentTarget.style.background = '#fff'}
          >
            Entendido, cerrar
          </button>
        </div>
      </div>
    </div>
  );
};

const DatoCopiable = ({ label, value, mono, highlight, onCopy }) => (
  <div>
    <p style={{
      fontSize: '11px', fontWeight: 600, color: 'var(--gray-400)',
      textTransform: 'uppercase', letterSpacing: '0.05em',
      fontFamily: "'Plus Jakarta Sans', sans-serif", marginBottom: '6px',
    }}>{label}</p>
    <div style={{
      display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px',
      background: highlight ? '#FFFBEB' : '#fff',
      border: `1px solid ${highlight ? '#FDE68A' : 'var(--border)'}`,
      borderRadius: 'var(--radius-md)',
    }}>
      <span style={{
        flex: 1, fontSize: mono ? '15px' : '14px', fontWeight: 700,
        color: highlight ? '#B45309' : 'var(--gray-900)',
        fontFamily: mono ? "'JetBrains Mono', monospace" : "'Plus Jakarta Sans', sans-serif",
        letterSpacing: mono ? '0.08em' : '0', wordBreak: 'break-all',
      }}>{value}</span>
      <button onClick={onCopy} title="Copiar" style={{
        width: '30px', height: '30px', flexShrink: 0,
        border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)',
        background: '#fff', cursor: 'pointer',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: 'var(--gray-400)', transition: 'all 150ms ease',
      }}
        onMouseEnter={e => { e.currentTarget.style.background = 'var(--capyme-blue-pale)'; e.currentTarget.style.color = 'var(--capyme-blue-mid)'; e.currentTarget.style.borderColor = 'var(--capyme-blue-mid)'; }}
        onMouseLeave={e => { e.currentTarget.style.background = '#fff'; e.currentTarget.style.color = 'var(--gray-400)'; e.currentTarget.style.borderColor = 'var(--border)'; }}
      >
        <Copy style={{ width: '13px', height: '13px' }} />
      </button>
    </div>
  </div>
);

const InfoFila = ({ icon: Icon, text }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
    <Icon style={{ width: '13px', height: '13px', color: 'var(--gray-400)', flexShrink: 0 }} />
    <span style={{
      fontSize: '12px', color: 'var(--gray-600)',
      fontFamily: "'DM Sans', sans-serif",
      overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
    }}>
      {text}
    </span>
  </div>
);

export default CursosDisponibles;