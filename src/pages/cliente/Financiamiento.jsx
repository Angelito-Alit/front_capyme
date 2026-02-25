import { useState, useEffect } from 'react';
import Layout from '../../components/common/Layout';
import { financiamientoService } from '../../services/financiamientoService';
import { negociosService } from '../../services/negociosService';
import {
  Briefcase,
  Plus,
  Search,
  X,
  DollarSign,
  Calendar,
  FileText,
  CheckCircle,
  Clock,
  XCircle,
  AlertCircle,
  Building2,
  ChevronDown,
  TrendingUp,
  TrendingDown,
} from 'lucide-react';
import { toast } from 'react-hot-toast';

const estadoBadge = {
  enviado:     { bg: '#EFF6FF', color: '#1D4ED8', label: 'Enviado',     icon: Clock },
  en_revision: { bg: '#FFFBEB', color: '#B45309', label: 'En Revisión', icon: Clock },
  aprobado:    { bg: '#ECFDF5', color: '#065F46', label: 'Aprobado',    icon: CheckCircle },
  rechazado:   { bg: '#FEF2F2', color: '#DC2626', label: 'Rechazado',   icon: XCircle },
};

const initialForm = {
  negocioId: '',
  montoSolicitado: '',
  plazoMeses: '',
  destinoCredito: '',
  ingresosMensuales: '',
  egresosMensuales: '',
  tieneCreditosActivos: false,
  detallesCreditos: '',
};

const ClienteFinanciamiento = () => {
  const authStorage = JSON.parse(localStorage.getItem('auth-storage') || '{}');
  const currentUser = authStorage?.state?.user || {};

  const [formularios, setFormularios] = useState([]);
  const [negocios, setNegocios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState(initialForm);
  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      setLoading(true);
      const [formulariosRes, negociosRes] = await Promise.all([
        financiamientoService.getAll(),
        negociosService.getMisNegocios(),
      ]);
      setFormularios(formulariosRes.data);
      setNegocios(negociosRes.data);
    } catch {
      toast.error('Error al cargar información');
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.negocioId) errors.negocioId = 'Selecciona un negocio';
    if (!formData.montoSolicitado || parseFloat(formData.montoSolicitado) <= 0)
      errors.montoSolicitado = 'Ingresa un monto válido';
    if (!formData.plazoMeses || parseInt(formData.plazoMeses) <= 0)
      errors.plazoMeses = 'Ingresa un plazo válido';
    if (!formData.destinoCredito.trim()) errors.destinoCredito = 'Describe el destino del crédito';
    if (!formData.ingresosMensuales || parseFloat(formData.ingresosMensuales) < 0)
      errors.ingresosMensuales = 'Ingresa tus ingresos mensuales';
    if (!formData.egresosMensuales || parseFloat(formData.egresosMensuales) < 0)
      errors.egresosMensuales = 'Ingresa tus egresos mensuales';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const isFormValid =
    formData.negocioId !== '' &&
    formData.montoSolicitado !== '' && parseFloat(formData.montoSolicitado) > 0 &&
    formData.plazoMeses !== '' && parseInt(formData.plazoMeses) > 0 &&
    formData.destinoCredito.trim() !== '' &&
    formData.ingresosMensuales !== '' && parseFloat(formData.ingresosMensuales) >= 0 &&
    formData.egresosMensuales !== '' && parseFloat(formData.egresosMensuales) >= 0;

  const handleOpenModal = () => {
    setFormData(initialForm);
    setFormErrors({});
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setFormErrors({});
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    if (formErrors[name]) setFormErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    setSubmitting(true);
    try {
      await financiamientoService.create({
        ...formData,
        negocioId: parseInt(formData.negocioId),
        montoSolicitado: parseFloat(formData.montoSolicitado),
        plazoMeses: parseInt(formData.plazoMeses),
        ingresosMensuales: parseFloat(formData.ingresosMensuales),
        egresosMensuales: parseFloat(formData.egresosMensuales),
      });
      toast.success('¡Solicitud enviada exitosamente!');
      handleCloseModal();
      cargarDatos();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error al enviar solicitud');
    } finally {
      setSubmitting(false);
    }
  };

  const formatCurrency = (amount) =>
    new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(amount);

  const formatDate = (date) => {
    if (!date) return '—';
    return new Date(date).toLocaleDateString('es-MX', {
      year: 'numeric', month: 'short', day: 'numeric',
    });
  };

  const formulariosFiltrados = formularios.filter(f =>
    f.negocio?.nombreNegocio?.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
            Cargando solicitudes...
          </p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes modalIn { from { opacity:0; transform:scale(0.96) translateY(8px); } to { opacity:1; transform:scale(1) translateY(0); } }
      `}</style>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap' }}>
          <div>
            <h1 style={{
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              fontSize: '26px', fontWeight: 800,
              color: 'var(--gray-900)', letterSpacing: '-0.02em', marginBottom: '4px',
            }}>Solicitudes de Financiamiento</h1>
            <p style={{ fontSize: '14px', color: 'var(--gray-500)', fontFamily: "'DM Sans', sans-serif" }}>
              Gestiona tus solicitudes de apoyo financiero
            </p>
          </div>
          <button
            onClick={handleOpenModal}
            style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              padding: '10px 18px',
              background: 'linear-gradient(135deg, var(--capyme-blue-mid), var(--capyme-blue))',
              color: '#fff', border: 'none',
              borderRadius: 'var(--radius-md)',
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              fontSize: '14px', fontWeight: 600,
              cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(31,78,158,0.28)',
              transition: 'all 200ms ease',
              whiteSpace: 'nowrap',
            }}
            onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-1px)'}
            onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
          >
            <Plus style={{ width: '16px', height: '16px' }} />
            Nueva Solicitud
          </button>
        </div>

        <div style={{
          background: 'linear-gradient(135deg, var(--capyme-blue), var(--capyme-blue-mid))',
          borderRadius: 'var(--radius-lg)',
          padding: '24px 28px',
          color: '#fff',
          position: 'relative', overflow: 'hidden',
          boxShadow: '0 4px 20px rgba(31,78,158,0.22)',
        }}>
          <div style={{
            position: 'absolute', top: '-30px', right: '-30px',
            width: '140px', height: '140px',
            background: 'rgba(255,255,255,0.06)', borderRadius: '50%',
            pointerEvents: 'none',
          }} />
          <div style={{ position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{
              width: '48px', height: '48px', flexShrink: 0,
              borderRadius: 'var(--radius-md)',
              background: 'rgba(255,255,255,0.15)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Briefcase style={{ width: '22px', height: '22px' }} />
            </div>
            <div>
              <h2 style={{
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                fontSize: '17px', fontWeight: 800, color: '#fff', marginBottom: '4px',
              }}>Opciones de Financiamiento</h2>
              <p style={{
                fontSize: '13px', color: 'rgba(255,255,255,0.78)',
                fontFamily: "'DM Sans', sans-serif", lineHeight: 1.5,
              }}>
                Solicita apoyo financiero para hacer crecer tu negocio. Te contactaremos para evaluar tu solicitud.
              </p>
            </div>
          </div>
        </div>

        {formularios.length > 0 && (
          <div style={{ position: 'relative', maxWidth: '360px' }}>
            <Search style={{
              position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)',
              width: '15px', height: '15px', color: 'var(--gray-400)', pointerEvents: 'none',
            }} />
            <input
              type="text"
              placeholder="Buscar por negocio..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              style={{ ...inputBaseStyle, paddingLeft: '38px' }}
              onFocus={e => { e.target.style.borderColor = 'var(--capyme-blue-mid)'; e.target.style.boxShadow = '0 0 0 3px rgba(43,91,166,0.12)'; }}
              onBlur={e => { e.target.style.borderColor = 'var(--border)'; e.target.style.boxShadow = 'none'; }}
            />
          </div>
        )}

        {formulariosFiltrados.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {formulariosFiltrados.map(form => (
              <SolicitudRow key={form.id} form={form} formatCurrency={formatCurrency} formatDate={formatDate} />
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
              background: '#ECFDF5',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              marginBottom: '4px',
            }}>
              <Briefcase style={{ width: '28px', height: '28px', color: '#059669' }} />
            </div>
            <h3 style={{
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              fontSize: '17px', fontWeight: 700, color: 'var(--gray-900)',
            }}>
              {searchTerm ? 'Sin resultados' : 'No tienes solicitudes de financiamiento'}
            </h3>
            <p style={{ fontSize: '14px', color: 'var(--gray-400)', fontFamily: "'DM Sans', sans-serif", maxWidth: '360px' }}>
              {searchTerm
                ? 'Intenta con otro término.'
                : 'Crea tu primera solicitud para acceder a opciones de apoyo financiero.'}
            </p>
            {!searchTerm && (
              <button
                onClick={handleOpenModal}
                style={{
                  marginTop: '8px',
                  display: 'inline-flex', alignItems: 'center', gap: '8px',
                  padding: '10px 20px',
                  background: 'linear-gradient(135deg, var(--capyme-blue-mid), var(--capyme-blue))',
                  color: '#fff', border: 'none',
                  borderRadius: 'var(--radius-md)',
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  fontSize: '14px', fontWeight: 600,
                  cursor: 'pointer',
                  boxShadow: '0 2px 8px rgba(31,78,158,0.28)',
                }}
              >
                <Plus style={{ width: '15px', height: '15px' }} />
                Nueva Solicitud
              </button>
            )}
          </div>
        )}
      </div>

      {showModal && (
        <div
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
              width: '100%', maxWidth: '620px',
              maxHeight: '90vh',
              display: 'flex', flexDirection: 'column',
              boxShadow: '0 20px 60px rgba(0,0,0,0.18)',
              animation: 'modalIn 0.25s ease both',
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
                  background: '#ECFDF5',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <Briefcase style={{ width: '18px', height: '18px', color: '#059669' }} />
                </div>
                <h2 style={{
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  fontSize: '18px', fontWeight: 800, color: 'var(--gray-900)',
                }}>
                  Nueva Solicitud de Financiamiento
                </h2>
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
                <SectionTitle icon={Building2} text="Negocio" />
                <div style={{ marginTop: '12px' }}>
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
                        name="negocioId"
                        value={formData.negocioId}
                        onChange={handleChange}
                        style={{ ...selectStyle, ...(formErrors.negocioId ? inputErrorStyle : {}) }}
                        onFocus={e => { if (!formErrors.negocioId) { e.target.style.borderColor = 'var(--capyme-blue-mid)'; e.target.style.boxShadow = '0 0 0 3px rgba(43,91,166,0.12)'; } }}
                        onBlur={e => { if (!formErrors.negocioId) { e.target.style.borderColor = 'var(--border)'; e.target.style.boxShadow = 'none'; } }}
                      >
                        <option value="">Selecciona un negocio</option>
                        {negocios.map(n => (
                          <option key={n.id} value={n.id}>{n.nombreNegocio}</option>
                        ))}
                      </select>
                      <ChevronDown style={{
                        position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)',
                        width: '14px', height: '14px', color: 'var(--gray-400)', pointerEvents: 'none',
                      }} />
                    </div>
                  )}
                  {formErrors.negocioId && <ErrorMsg text={formErrors.negocioId} />}
                </div>
              </div>

              <div>
                <SectionTitle icon={DollarSign} text="Datos del Crédito" />
                <div style={{ marginTop: '12px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div>
                    <label style={labelStyle}>Monto Solicitado <span style={{ color: '#EF4444' }}>*</span></label>
                    <input
                      name="montoSolicitado"
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="0.00"
                      value={formData.montoSolicitado}
                      onChange={handleChange}
                      style={{ ...inputBaseStyle, ...(formErrors.montoSolicitado ? inputErrorStyle : {}) }}
                      onFocus={e => { if (!formErrors.montoSolicitado) { e.target.style.borderColor = 'var(--capyme-blue-mid)'; e.target.style.boxShadow = '0 0 0 3px rgba(43,91,166,0.12)'; } }}
                      onBlur={e => { if (!formErrors.montoSolicitado) { e.target.style.borderColor = 'var(--border)'; e.target.style.boxShadow = 'none'; } }}
                    />
                    {formErrors.montoSolicitado && <ErrorMsg text={formErrors.montoSolicitado} />}
                  </div>
                  <div>
                    <label style={labelStyle}>Plazo (meses) <span style={{ color: '#EF4444' }}>*</span></label>
                    <input
                      name="plazoMeses"
                      type="number"
                      min="1"
                      placeholder="12"
                      value={formData.plazoMeses}
                      onChange={handleChange}
                      style={{ ...inputBaseStyle, ...(formErrors.plazoMeses ? inputErrorStyle : {}) }}
                      onFocus={e => { if (!formErrors.plazoMeses) { e.target.style.borderColor = 'var(--capyme-blue-mid)'; e.target.style.boxShadow = '0 0 0 3px rgba(43,91,166,0.12)'; } }}
                      onBlur={e => { if (!formErrors.plazoMeses) { e.target.style.borderColor = 'var(--border)'; e.target.style.boxShadow = 'none'; } }}
                    />
                    {formErrors.plazoMeses && <ErrorMsg text={formErrors.plazoMeses} />}
                  </div>
                  <div style={{ gridColumn: '1 / -1' }}>
                    <label style={labelStyle}>Destino del Crédito <span style={{ color: '#EF4444' }}>*</span></label>
                    <textarea
                      name="destinoCredito"
                      rows={3}
                      placeholder="¿Para qué usarás el financiamiento?"
                      value={formData.destinoCredito}
                      onChange={handleChange}
                      style={{
                        ...inputBaseStyle, resize: 'vertical', minHeight: '80px',
                        ...(formErrors.destinoCredito ? inputErrorStyle : {}),
                      }}
                      onFocus={e => { if (!formErrors.destinoCredito) { e.target.style.borderColor = 'var(--capyme-blue-mid)'; e.target.style.boxShadow = '0 0 0 3px rgba(43,91,166,0.12)'; } }}
                      onBlur={e => { if (!formErrors.destinoCredito) { e.target.style.borderColor = 'var(--border)'; e.target.style.boxShadow = 'none'; } }}
                    />
                    {formErrors.destinoCredito && <ErrorMsg text={formErrors.destinoCredito} />}
                  </div>
                </div>
              </div>

              <div>
                <SectionTitle icon={TrendingUp} text="Situación Financiera" />
                <div style={{ marginTop: '12px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div>
                    <label style={labelStyle}>Ingresos Mensuales <span style={{ color: '#EF4444' }}>*</span></label>
                    <input
                      name="ingresosMensuales"
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="0.00"
                      value={formData.ingresosMensuales}
                      onChange={handleChange}
                      style={{ ...inputBaseStyle, ...(formErrors.ingresosMensuales ? inputErrorStyle : {}) }}
                      onFocus={e => { if (!formErrors.ingresosMensuales) { e.target.style.borderColor = 'var(--capyme-blue-mid)'; e.target.style.boxShadow = '0 0 0 3px rgba(43,91,166,0.12)'; } }}
                      onBlur={e => { if (!formErrors.ingresosMensuales) { e.target.style.borderColor = 'var(--border)'; e.target.style.boxShadow = 'none'; } }}
                    />
                    {formErrors.ingresosMensuales && <ErrorMsg text={formErrors.ingresosMensuales} />}
                  </div>
                  <div>
                    <label style={labelStyle}>Egresos Mensuales <span style={{ color: '#EF4444' }}>*</span></label>
                    <input
                      name="egresosMensuales"
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="0.00"
                      value={formData.egresosMensuales}
                      onChange={handleChange}
                      style={{ ...inputBaseStyle, ...(formErrors.egresosMensuales ? inputErrorStyle : {}) }}
                      onFocus={e => { if (!formErrors.egresosMensuales) { e.target.style.borderColor = 'var(--capyme-blue-mid)'; e.target.style.boxShadow = '0 0 0 3px rgba(43,91,166,0.12)'; } }}
                      onBlur={e => { if (!formErrors.egresosMensuales) { e.target.style.borderColor = 'var(--border)'; e.target.style.boxShadow = 'none'; } }}
                    />
                    {formErrors.egresosMensuales && <ErrorMsg text={formErrors.egresosMensuales} />}
                  </div>
                </div>
              </div>

              <div>
                <SectionTitle icon={FileText} text="Créditos Actuales" />
                <div style={{ marginTop: '12px' }}>
                  <label style={{
                    display: 'flex', alignItems: 'center', gap: '10px',
                    cursor: 'pointer', userSelect: 'none',
                  }}>
                    <div
                      onClick={() => {
                        setFormData(prev => ({ ...prev, tieneCreditosActivos: !prev.tieneCreditosActivos }));
                      }}
                      style={{
                        width: '18px', height: '18px', flexShrink: 0,
                        borderRadius: '4px',
                        border: formData.tieneCreditosActivos
                          ? '2px solid var(--capyme-blue-mid)'
                          : '2px solid var(--border)',
                        background: formData.tieneCreditosActivos ? 'var(--capyme-blue-mid)' : '#fff',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        transition: 'all 150ms ease',
                        cursor: 'pointer',
                      }}
                    >
                      {formData.tieneCreditosActivos && (
                        <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                          <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      )}
                    </div>
                    <span style={{ fontSize: '14px', color: 'var(--gray-700)', fontFamily: "'DM Sans', sans-serif" }}>
                      Tengo créditos activos actualmente
                    </span>
                  </label>

                  {formData.tieneCreditosActivos && (
                    <div style={{ marginTop: '12px' }}>
                      <label style={labelStyle}>Detalles de créditos activos</label>
                      <textarea
                        name="detallesCreditos"
                        rows={3}
                        placeholder="Describe los créditos que tienes actualmente (institución, monto, plazo restante)..."
                        value={formData.detallesCreditos}
                        onChange={handleChange}
                        style={{ ...inputBaseStyle, resize: 'vertical', minHeight: '80px' }}
                        onFocus={e => { e.target.style.borderColor = 'var(--capyme-blue-mid)'; e.target.style.boxShadow = '0 0 0 3px rgba(43,91,166,0.12)'; }}
                        onBlur={e => { e.target.style.borderColor = 'var(--border)'; e.target.style.boxShadow = 'none'; }}
                      />
                    </div>
                  )}
                </div>
              </div>

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
                disabled={submitting}
                style={{
                  padding: '9px 18px',
                  background: '#fff',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '14px', fontWeight: 600,
                  color: 'var(--gray-600)',
                  cursor: submitting ? 'not-allowed' : 'pointer',
                  opacity: submitting ? 0.5 : 1,
                  fontFamily: "'DM Sans', sans-serif",
                  transition: 'all 150ms ease',
                }}
                onMouseEnter={e => { if (!submitting) e.currentTarget.style.background = 'var(--gray-100)'; }}
                onMouseLeave={e => e.currentTarget.style.background = '#fff'}
              >
                Cancelar
              </button>
              <button
                onClick={handleSubmit}
                disabled={submitting || Object.keys(formErrors).length > 0 || !isFormValid || negocios.length === 0}
                style={{
                  display: 'flex', alignItems: 'center', gap: '8px',
                  padding: '9px 22px',
                  background: 'linear-gradient(135deg, var(--capyme-blue-mid), var(--capyme-blue))',
                  border: 'none',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '14px', fontWeight: 600,
                  color: '#fff',
                  cursor: submitting || Object.keys(formErrors).length > 0 || !isFormValid || negocios.length === 0 ? 'not-allowed' : 'pointer',
                  opacity: submitting || Object.keys(formErrors).length > 0 || !isFormValid || negocios.length === 0 ? 0.6 : 1,
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  boxShadow: submitting || Object.keys(formErrors).length > 0 || !isFormValid || negocios.length === 0 ? 'none' : '0 2px 8px rgba(31,78,158,0.28)',
                  transition: 'all 150ms ease',
                }}
                onMouseEnter={e => { if (!submitting && isFormValid && Object.keys(formErrors).length === 0 && negocios.length > 0) e.currentTarget.style.transform = 'translateY(-1px)'; }}
                onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
              >
                {submitting && <span style={{ width: '14px', height: '14px', border: '2px solid rgba(255,255,255,0.4)', borderTopColor: '#fff', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.7s linear infinite' }} />}
                {submitting ? 'Enviando...' : 'Enviar Solicitud'}
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};

const SolicitudRow = ({ form, formatCurrency, formatDate }) => {
  const badge = estadoBadge[form.estado] || estadoBadge.enviado;
  const Icon = badge.icon;
  const [hovered, setHovered] = useState(false);

  const flujo = form.ingresosMensuales && form.egresosMensuales
    ? parseFloat(form.ingresosMensuales) - parseFloat(form.egresosMensuales)
    : null;

  return (
    <div
      style={{
        background: '#fff',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-lg)',
        boxShadow: hovered ? '0 4px 16px rgba(0,0,0,0.08)' : 'var(--shadow-sm)',
        transition: 'all 200ms ease',
        overflow: 'hidden',
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div style={{
        height: '3px',
        background: badge.color === '#065F46'
          ? 'linear-gradient(90deg, #059669, #34D399)'
          : badge.color === '#DC2626'
            ? 'linear-gradient(90deg, #DC2626, #FCA5A5)'
            : badge.color === '#B45309'
              ? 'linear-gradient(90deg, #D97706, #FCD34D)'
              : 'linear-gradient(90deg, #1D4ED8, #60A5FA)',
      }} />

      <div style={{ padding: '18px 20px' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px', marginBottom: '12px' }}>
          <div style={{
            width: '42px', height: '42px', flexShrink: 0,
            borderRadius: 'var(--radius-md)',
            background: badge.bg,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Icon style={{ width: '20px', height: '20px', color: badge.color }} />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '4px' }}>
              <h3 style={{
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                fontSize: '15px', fontWeight: 700, color: 'var(--gray-900)',
              }}>
                {form.negocio?.nombreNegocio}
              </h3>
              <span style={{
                padding: '3px 10px',
                background: badge.bg,
                color: badge.color,
                borderRadius: '99px',
                fontSize: '11px', fontWeight: 700,
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                whiteSpace: 'nowrap',
              }}>
                {badge.label}
              </span>
            </div>
            {form.destinoCredito && (
              <p style={{
                fontSize: '13px', color: 'var(--gray-500)',
                fontFamily: "'DM Sans', sans-serif",
                lineHeight: 1.4,
                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
              }}>
                {form.destinoCredito}
              </p>
            )}
          </div>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
          gap: '10px',
        }}>
          <DataChip icon={DollarSign} label="Monto" value={formatCurrency(form.montoSolicitado)} highlight />
          <DataChip icon={Calendar} label="Plazo" value={`${form.plazoMeses} meses`} />
          <DataChip icon={FileText} label="Fecha" value={formatDate(form.fechaSolicitud)} />
          {flujo !== null && (
            <DataChip
              icon={flujo >= 0 ? TrendingUp : TrendingDown}
              label="Flujo mensual"
              value={formatCurrency(Math.abs(flujo))}
              color={flujo >= 0 ? '#059669' : '#DC2626'}
            />
          )}
        </div>
      </div>
    </div>
  );
};

const DataChip = ({ icon: Icon, label, value, highlight, color }) => (
  <div style={{
    padding: '10px 12px',
    background: 'var(--gray-50)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius-md)',
  }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '4px' }}>
      <Icon style={{ width: '12px', height: '12px', color: color || 'var(--gray-400)' }} />
      <span style={{
        fontSize: '11px', color: 'var(--gray-400)',
        fontFamily: "'DM Sans', sans-serif", fontWeight: 500,
      }}>{label}</span>
    </div>
    <p style={{
      fontSize: '13px', fontWeight: 700,
      color: color || (highlight ? 'var(--capyme-blue-mid)' : 'var(--gray-800)'),
      fontFamily: "'Plus Jakarta Sans', sans-serif",
      margin: 0,
    }}>
      {value}
    </p>
  </div>
);

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

export default ClienteFinanciamiento;