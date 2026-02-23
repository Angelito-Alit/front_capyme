import { useState, useEffect } from 'react';
import Layout from '../../components/common/Layout';
import { programasService } from '../../services/programasService';
import { postulacionesService } from '../../services/postulacionesService';
import { negociosService } from '../../services/negociosService';
import {
  FileText,
  Search,
  Calendar,
  DollarSign,
  Send,
  X,
  AlertCircle,
  Tag,
  MapPin,
  Building2,
  ChevronDown,
  ClipboardList,
} from 'lucide-react';
import { toast } from 'react-hot-toast';

const ProgramasDisponibles = () => {
  const authStorage = JSON.parse(localStorage.getItem('auth-storage') || '{}');
  const currentUser = authStorage?.state?.user || {};

  const [programas, setProgramas] = useState([]);
  const [negocios, setNegocios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [selectedPrograma, setSelectedPrograma] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({ negocioId: '', programaId: '', respuestas: [] });
  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      setLoading(true);
      const [programasRes, negociosRes] = await Promise.all([
        programasService.getAll({ activo: true }),
        negociosService.getMisNegocios(),
      ]);
      setProgramas(programasRes.data);
      setNegocios(negociosRes.data);
    } catch {
      toast.error('Error al cargar programas');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = async (programa) => {
    try {
      setSelectedPrograma(programa);
      const preguntasRes = await programasService.getPreguntas(programa.id);
      const preguntasFormato = preguntasRes.data.map(pp => ({
        preguntaId: pp.pregunta.id,
        pregunta: pp.pregunta.pregunta,
        tipoRespuesta: pp.pregunta.tipoRespuesta,
        obligatoria: pp.pregunta.obligatoria,
        opciones: pp.pregunta.opcionesRespuesta,
        respuesta: '',
      }));
      setFormData({ negocioId: '', programaId: programa.id, respuestas: preguntasFormato });
      setFormErrors({});
      setShowModal(true);
    } catch {
      toast.error('Error al cargar formulario');
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedPrograma(null);
    setFormErrors({});
  };

  const handleRespuestaChange = (index, valor) => {
    const nuevas = [...formData.respuestas];
    nuevas[index].respuesta = valor;
    setFormData(prev => ({ ...prev, respuestas: nuevas }));
  };

  const handleSubmit = async () => {
    const errors = {};
    if (!formData.negocioId) errors.negocioId = 'Debes seleccionar un negocio';
    formData.respuestas.forEach((r, i) => {
      if (r.obligatoria && !r.respuesta) errors[`resp_${i}`] = 'Esta pregunta es obligatoria';
    });
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }
    setSubmitting(true);
    try {
      await postulacionesService.create({
        negocioId: parseInt(formData.negocioId),
        programaId: formData.programaId,
        respuestas: formData.respuestas.map(r => ({
          preguntaId: r.preguntaId,
          respuesta: r.respuesta,
        })),
      });
      toast.success('¡Postulación enviada exitosamente!');
      handleCloseModal();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error al enviar postulación');
    } finally {
      setSubmitting(false);
    }
  };

  const programasFiltrados = programas.filter(p =>
    p.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.tipoPrograma?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.categoria?.nombre?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatCurrency = (amount) => {
    if (!amount) return null;
    return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(amount);
  };

  const formatDate = (date) => {
    if (!date) return null;
    return new Date(date).toLocaleDateString('es-MX', { year: 'numeric', month: 'short', day: 'numeric' });
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
  const inputErrorStyle = { borderColor: '#EF4444', boxShadow: '0 0 0 2px rgba(239,68,68,0.15)' };
  const labelStyle = {
    display: 'block', fontSize: '13px', fontWeight: 600,
    color: 'var(--gray-600)', marginBottom: '6px',
    fontFamily: "'DM Sans', sans-serif",
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
            Cargando programas...
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
          }}>Programas Disponibles</h1>
          <p style={{ fontSize: '14px', color: 'var(--gray-500)', fontFamily: "'DM Sans', sans-serif" }}>
            Explora programas gubernamentales y postula tu negocio
          </p>
        </div>

        <div style={{ position: 'relative', maxWidth: '400px' }}>
          <Search style={{
            position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)',
            width: '15px', height: '15px', color: 'var(--gray-400)', pointerEvents: 'none',
          }} />
          <input
            type="text"
            placeholder="Buscar por nombre, tipo o categoría..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            style={{ ...inputBaseStyle, paddingLeft: '38px' }}
          />
        </div>

        {programasFiltrados.length > 0 ? (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
            gap: '18px',
          }}>
            {programasFiltrados.map(programa => (
              <ProgramaCard
                key={programa.id}
                programa={programa}
                formatCurrency={formatCurrency}
                formatDate={formatDate}
                onPostular={() => handleOpenModal(programa)}
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
              <FileText style={{ width: '28px', height: '28px', color: 'var(--capyme-blue-mid)' }} />
            </div>
            <h3 style={{
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              fontSize: '17px', fontWeight: 700, color: 'var(--gray-900)',
            }}>
              {searchTerm ? 'Sin resultados' : 'No hay programas disponibles'}
            </h3>
            <p style={{ fontSize: '14px', color: 'var(--gray-400)', fontFamily: "'DM Sans', sans-serif" }}>
              {searchTerm ? 'Intenta con otro término.' : 'Vuelve pronto, se publicarán nuevos programas.'}
            </p>
          </div>
        )}
      </div>

      {showModal && selectedPrograma && (
        <div
          onClick={handleCloseModal}
          style={{
            position: 'fixed', inset: 0,
            background: 'rgba(0,0,0,0.4)',
            backdropFilter: 'blur(4px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 1000, padding: '16px',
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              background: '#fff',
              borderRadius: 'var(--radius-lg)',
              width: '100%', maxWidth: '660px',
              maxHeight: '90vh',
              display: 'flex', flexDirection: 'column',
              boxShadow: '0 20px 60px rgba(0,0,0,0.18)',
            }}
          >
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '20px 24px',
              background: 'var(--gray-50)',
              borderBottom: '1px solid var(--border)',
              borderRadius: 'var(--radius-lg) var(--radius-lg) 0 0',
              flexShrink: 0,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{
                  width: '36px', height: '36px',
                  borderRadius: 'var(--radius-md)',
                  background: '#EEF4FF',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <Send style={{ width: '16px', height: '16px', color: 'var(--capyme-blue-mid)' }} />
                </div>
                <div>
                  <h2 style={{
                    fontFamily: "'Plus Jakarta Sans', sans-serif",
                    fontSize: '16px', fontWeight: 800, color: 'var(--gray-900)',
                    lineHeight: 1.2,
                  }}>
                    Postular a programa
                  </h2>
                  <p style={{
                    fontSize: '12px', color: 'var(--gray-400)',
                    fontFamily: "'DM Sans', sans-serif",
                    marginTop: '2px',
                  }}>
                    {selectedPrograma.nombre}
                  </p>
                </div>
              </div>
              <button
                onClick={handleCloseModal}
                style={{
                  width: '32px', height: '32px', border: 'none',
                  borderRadius: 'var(--radius-sm)', background: 'transparent',
                  cursor: 'pointer', color: 'var(--gray-400)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  transition: 'all 150ms ease',
                }}
                onMouseEnter={e => { e.currentTarget.style.background = 'var(--gray-200)'; e.currentTarget.style.color = 'var(--gray-700)'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--gray-400)'; }}
              >
                <X style={{ width: '18px', height: '18px' }} />
              </button>
            </div>

            <div style={{ overflowY: 'auto', flex: 1, padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>

              <div>
                <SectionTitle icon={Building2} text="Negocio a Postular" />
                <div style={{ marginTop: '12px' }}>
                  <label style={labelStyle}>Selecciona el negocio <span style={{ color: '#EF4444' }}>*</span></label>
                  {negocios.length === 0 ? (
                    <div style={{
                      padding: '14px 16px',
                      background: '#FFF7ED',
                      border: '1px solid #FED7AA',
                      borderRadius: 'var(--radius-md)',
                      display: 'flex', alignItems: 'center', gap: '8px',
                    }}>
                      <AlertCircle style={{ width: '16px', height: '16px', color: '#D97706', flexShrink: 0 }} />
                      <p style={{ fontSize: '13px', color: '#92400E', fontFamily: "'DM Sans', sans-serif" }}>
                        No tienes negocios registrados. Ve a <strong>Mis Negocios</strong> para agregar uno.
                      </p>
                    </div>
                  ) : (
                    <div style={{ position: 'relative' }}>
                      <select
                        value={formData.negocioId}
                        onChange={e => {
                          setFormData(prev => ({ ...prev, negocioId: e.target.value }));
                          if (formErrors.negocioId) setFormErrors(prev => ({ ...prev, negocioId: '' }));
                        }}
                        style={{ ...selectStyle, ...(formErrors.negocioId ? inputErrorStyle : {}) }}
                      >
                        <option value="">Selecciona un negocio</option>
                        {negocios.map(n => (
                          <option key={n.id} value={n.id}>{n.nombreNegocio}</option>
                        ))}
                      </select>
                      <ChevronDown style={{
                        position: 'absolute', right: '12px', top: '50%',
                        transform: 'translateY(-50%)',
                        width: '14px', height: '14px', color: 'var(--gray-400)', pointerEvents: 'none',
                      }} />
                    </div>
                  )}
                  {formErrors.negocioId && <ErrorMsg text={formErrors.negocioId} />}
                </div>
              </div>

              {formData.respuestas.length > 0 && (
                <div>
                  <SectionTitle icon={ClipboardList} text="Formulario de Postulación" />
                  <div style={{ marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {formData.respuestas.map((resp, index) => (
                      <div key={index}>
                        <label style={labelStyle}>
                          {resp.pregunta}
                          {resp.obligatoria && <span style={{ color: '#EF4444', marginLeft: '2px' }}>*</span>}
                        </label>
                        <RespuestaInput
                          resp={resp}
                          index={index}
                          onChange={handleRespuestaChange}
                          inputBaseStyle={inputBaseStyle}
                          error={formErrors[`resp_${index}`]}
                          inputErrorStyle={inputErrorStyle}
                          selectStyle={selectStyle}
                        />
                        {formErrors[`resp_${index}`] && <ErrorMsg text={formErrors[`resp_${index}`]} />}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '10px',
              padding: '16px 24px',
              background: 'var(--gray-50)',
              borderTop: '1px solid var(--border)',
              borderRadius: '0 0 var(--radius-lg) var(--radius-lg)',
              flexShrink: 0,
            }}>
              <button
                onClick={handleCloseModal}
                style={{
                  padding: '9px 18px',
                  background: '#fff',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '14px', fontWeight: 600,
                  color: 'var(--gray-600)',
                  cursor: 'pointer',
                  fontFamily: "'DM Sans', sans-serif",
                  transition: 'all 150ms ease',
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--gray-100)'}
                onMouseLeave={e => e.currentTarget.style.background = '#fff'}
              >
                Cancelar
              </button>
              <button
                onClick={handleSubmit}
                disabled={submitting || negocios.length === 0}
                style={{
                  display: 'flex', alignItems: 'center', gap: '8px',
                  padding: '9px 22px',
                  background: (submitting || negocios.length === 0)
                    ? 'var(--gray-300)'
                    : 'linear-gradient(135deg, var(--capyme-blue-mid), var(--capyme-blue))',
                  border: 'none',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '14px', fontWeight: 600,
                  color: '#fff',
                  cursor: (submitting || negocios.length === 0) ? 'not-allowed' : 'pointer',
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  boxShadow: (submitting || negocios.length === 0) ? 'none' : '0 2px 8px rgba(31,78,158,0.28)',
                  transition: 'all 150ms ease',
                }}
              >
                <Send style={{ width: '14px', height: '14px' }} />
                {submitting ? 'Enviando...' : 'Enviar Postulación'}
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};

const ProgramaCard = ({ programa, formatCurrency, formatDate, onPostular }) => {
  const monto = formatCurrency(programa.montoApoyo);
  const cierre = formatDate(programa.fechaCierre);
  const inicio = formatDate(programa.fechaInicio);

  const diasRestantes = programa.fechaCierre
    ? Math.ceil((new Date(programa.fechaCierre) - new Date()) / (1000 * 60 * 60 * 24))
    : null;

  const urgente = diasRestantes !== null && diasRestantes <= 7 && diasRestantes >= 0;
  const cerrado = diasRestantes !== null && diasRestantes < 0;

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
        background: cerrado
          ? 'var(--gray-200)'
          : urgente
            ? 'linear-gradient(90deg, #D97706, #FCD34D)'
            : 'linear-gradient(90deg, var(--capyme-blue-mid), var(--capyme-blue))',
      }} />

      <div style={{ padding: '20px', flex: 1, display: 'flex', flexDirection: 'column', gap: '12px' }}>

        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '8px' }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <h3 style={{
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              fontSize: '15px', fontWeight: 700,
              color: 'var(--gray-900)', marginBottom: '6px',
              lineHeight: 1.3,
            }}>
              {programa.nombre}
            </h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
              {programa.tipoPrograma && (
                <span style={{
                  padding: '2px 8px',
                  background: '#EEF4FF',
                  color: 'var(--capyme-blue-mid)',
                  borderRadius: '99px',
                  fontSize: '11px', fontWeight: 600,
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                }}>
                  {programa.tipoPrograma}
                </span>
              )}
              {programa.categoria?.nombre && (
                <span style={{
                  padding: '2px 8px',
                  background: 'var(--gray-100)',
                  color: 'var(--gray-600)',
                  borderRadius: '99px',
                  fontSize: '11px', fontWeight: 600,
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                }}>
                  {programa.categoria.nombre}
                </span>
              )}
            </div>
          </div>
          {urgente && !cerrado && (
            <span style={{
              padding: '3px 8px',
              background: '#FFF7ED',
              color: '#D97706',
              borderRadius: '99px',
              fontSize: '10px', fontWeight: 700,
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              whiteSpace: 'nowrap', flexShrink: 0,
            }}>
              ⚡ {diasRestantes}d restantes
            </span>
          )}
          {cerrado && (
            <span style={{
              padding: '3px 8px',
              background: '#FEF2F2',
              color: '#DC2626',
              borderRadius: '99px',
              fontSize: '10px', fontWeight: 700,
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              whiteSpace: 'nowrap', flexShrink: 0,
            }}>
              Cerrado
            </span>
          )}
        </div>

        {programa.descripcion && (
          <p style={{
            fontSize: '13px', color: 'var(--gray-500)',
            fontFamily: "'DM Sans', sans-serif",
            lineHeight: 1.5,
            display: '-webkit-box',
            WebkitLineClamp: 3,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}>
            {programa.descripcion}
          </p>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {monto && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <DollarSign style={{ width: '13px', height: '13px', color: '#059669', flexShrink: 0 }} />
              <span style={{
                fontSize: '13px', fontWeight: 700,
                color: '#059669',
                fontFamily: "'Plus Jakarta Sans', sans-serif",
              }}>
                {monto}
              </span>
            </div>
          )}
          {inicio && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Calendar style={{ width: '13px', height: '13px', color: 'var(--gray-400)', flexShrink: 0 }} />
              <span style={{ fontSize: '12px', color: 'var(--gray-500)', fontFamily: "'DM Sans', sans-serif" }}>
                Inicio: {inicio}
              </span>
            </div>
          )}
          {cierre && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Calendar style={{ width: '13px', height: '13px', color: urgente ? '#D97706' : 'var(--gray-400)', flexShrink: 0 }} />
              <span style={{
                fontSize: '12px',
                color: urgente ? '#D97706' : 'var(--gray-500)',
                fontWeight: urgente ? 600 : 400,
                fontFamily: "'DM Sans', sans-serif",
              }}>
                Cierre: {cierre}
              </span>
            </div>
          )}
          {(programa.estado || programa.municipio) && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <MapPin style={{ width: '13px', height: '13px', color: 'var(--gray-400)', flexShrink: 0 }} />
              <span style={{ fontSize: '12px', color: 'var(--gray-500)', fontFamily: "'DM Sans', sans-serif" }}>
                {[programa.municipio, programa.estado].filter(Boolean).join(', ')}
              </span>
            </div>
          )}
        </div>

        <div style={{ marginTop: 'auto', paddingTop: '4px' }}>
          <button
            onClick={onPostular}
            disabled={cerrado}
            style={{
              width: '100%',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
              padding: '9px 0',
              background: cerrado
                ? 'var(--gray-100)'
                : 'linear-gradient(135deg, var(--capyme-blue-mid), var(--capyme-blue))',
              border: 'none',
              borderRadius: 'var(--radius-md)',
              color: cerrado ? 'var(--gray-400)' : '#fff',
              fontSize: '13px', fontWeight: 600,
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              cursor: cerrado ? 'not-allowed' : 'pointer',
              boxShadow: cerrado ? 'none' : '0 2px 8px rgba(31,78,158,0.20)',
              transition: 'all 150ms ease',
            }}
            onMouseEnter={e => { if (!cerrado) e.currentTarget.style.transform = 'translateY(-1px)'; }}
            onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
          >
            <Send style={{ width: '13px', height: '13px' }} />
            {cerrado ? 'Convocatoria cerrada' : 'Postularme'}
          </button>
        </div>
      </div>
    </div>
  );
};

const RespuestaInput = ({ resp, index, onChange, inputBaseStyle, error, inputErrorStyle, selectStyle }) => {
  const style = { ...inputBaseStyle, ...(error ? inputErrorStyle : {}) };

  if (resp.tipoRespuesta === 'texto_largo') {
    return (
      <textarea
        rows={3}
        value={resp.respuesta}
        onChange={e => onChange(index, e.target.value)}
        style={{ ...style, resize: 'vertical', minHeight: '80px' }}
      />
    );
  }
  if (resp.tipoRespuesta === 'numero') {
    return (
      <input
        type="number"
        value={resp.respuesta}
        onChange={e => onChange(index, e.target.value)}
        style={style}
      />
    );
  }
  if (resp.tipoRespuesta === 'fecha') {
    return (
      <input
        type="date"
        value={resp.respuesta}
        onChange={e => onChange(index, e.target.value)}
        style={style}
      />
    );
  }
  if (resp.tipoRespuesta === 'si_no') {
    return (
      <div style={{ position: 'relative' }}>
        <select
          value={resp.respuesta}
          onChange={e => onChange(index, e.target.value)}
          style={{ ...selectStyle, ...(error ? inputErrorStyle : {}) }}
        >
          <option value="">Seleccionar</option>
          <option value="si">Sí</option>
          <option value="no">No</option>
        </select>
        <ChevronDown style={{
          position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)',
          width: '14px', height: '14px', color: 'var(--gray-400)', pointerEvents: 'none',
        }} />
      </div>
    );
  }
  if (resp.tipoRespuesta === 'seleccion_unica' && resp.opciones) {
    return (
      <div style={{ position: 'relative' }}>
        <select
          value={resp.respuesta}
          onChange={e => onChange(index, e.target.value)}
          style={{ ...selectStyle, ...(error ? inputErrorStyle : {}) }}
        >
          <option value="">Seleccionar opción</option>
          {(Array.isArray(resp.opciones) ? resp.opciones : []).map((op, i) => (
            <option key={i} value={op}>{op}</option>
          ))}
        </select>
        <ChevronDown style={{
          position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)',
          width: '14px', height: '14px', color: 'var(--gray-400)', pointerEvents: 'none',
        }} />
      </div>
    );
  }
  if (resp.tipoRespuesta === 'email') {
    return (
      <input
        type="email"
        value={resp.respuesta}
        onChange={e => onChange(index, e.target.value)}
        style={style}
      />
    );
  }
  if (resp.tipoRespuesta === 'telefono') {
    return (
      <input
        type="tel"
        value={resp.respuesta}
        onChange={e => onChange(index, e.target.value)}
        style={style}
      />
    );
  }
  return (
    <input
      type="text"
      value={resp.respuesta}
      onChange={e => onChange(index, e.target.value)}
      style={style}
    />
  );
};

const SectionTitle = ({ icon: Icon, text }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', paddingBottom: '4px' }}>
    <Icon style={{ width: '14px', height: '14px', color: 'var(--gray-400)' }} />
    <span style={{
      fontSize: '11px', fontWeight: 700, color: 'var(--gray-400)',
      textTransform: 'uppercase', letterSpacing: '0.06em',
      fontFamily: "'Plus Jakarta Sans', sans-serif",
    }}>{text}</span>
  </div>
);

const ErrorMsg = ({ text }) => (
  <p style={{
    marginTop: '4px', fontSize: '12px', color: '#EF4444',
    display: 'flex', alignItems: 'center', gap: '4px',
    fontFamily: "'DM Sans', sans-serif",
  }}>
    <AlertCircle style={{ width: '12px', height: '12px' }} /> {text}
  </p>
);

export default ProgramasDisponibles;