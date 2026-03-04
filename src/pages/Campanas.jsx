import { useState, useEffect, useRef } from 'react';
import { toast } from 'react-hot-toast';
import {
  Plus, Search, Edit, CheckCircle, XCircle, AlertCircle,
  Megaphone, Target, Calendar, Eye, ChevronDown, DollarSign, Clock,
} from 'lucide-react';
import Layout from '../components/common/Layout';
import { campanasService } from '../services/campanasService';
import { negociosService } from '../services/negociosService';

const ESTADOS_CAMPANA = [
  { value: 'en_revision', label: 'En revisión', bg: '#FEF9C3', color: '#854D0E' },
  { value: 'aprobada',    label: 'Aprobada',     bg: '#DBEAFE', color: '#1E40AF' },
  { value: 'activa',      label: 'Activa',       bg: '#DCFCE7', color: '#14532D' },
  { value: 'pausada',     label: 'Pausada',      bg: '#FEF3C7', color: '#92400E' },
  { value: 'completada',  label: 'Completada',   bg: '#F3E8FF', color: '#6B21A8' },
  { value: 'rechazada',   label: 'Rechazada',    bg: '#FEE2E2', color: '#991B1B' },
  { value: 'cancelada',   label: 'Cancelada',    bg: '#F1F5F9', color: '#475569' },
];

const initialFormData = {
  titulo: '',
  descripcion: '',
  historia: '',
  metaRecaudacion: '',
  fechaInicio: '',
  fechaCierre: '',
  negocioId: '',
};

const Campanas = () => {
  const authStorage = JSON.parse(localStorage.getItem('auth-storage') || '{}');
  const currentUser = authStorage?.state?.user || {};

  const [campanas, setCampanas] = useState([]);
  const [negocios, setNegocios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('create');
  const [selectedCampana, setSelectedCampana] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('');
  const [showEstadoMenu, setShowEstadoMenu] = useState(null);
  const [menuPos, setMenuPos] = useState({ top: 0, left: 0 });
  const [formData, setFormData] = useState(initialFormData);
  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    cargarDatos();
  }, []);

  useEffect(() => {
    const cerrar = () => setShowEstadoMenu(null);
    if (showEstadoMenu !== null) {
      document.addEventListener('click', cerrar);
      return () => document.removeEventListener('click', cerrar);
    }
  }, [showEstadoMenu]);

  const cargarDatos = async () => {
    setLoading(true);
    try {
      const [campanasRes, negociosRes] = await Promise.all([
        campanasService.getAll(),
        negociosService.getAll(),
      ]);
      setCampanas(campanasRes.data || []);
      setNegocios(negociosRes.data || []);
    } catch {
      toast.error('Error al cargar campañas');
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.titulo.trim()) errors.titulo = 'El título es requerido';
    if (!formData.negocioId) errors.negocioId = 'Selecciona un negocio';
    if (!formData.metaRecaudacion || parseFloat(formData.metaRecaudacion) <= 0)
      errors.metaRecaudacion = 'Ingresa una meta de recaudación válida';
    if (!formData.descripcion.trim()) errors.descripcion = 'La descripción es requerida';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleOpenModal = (mode, campana = null) => {
    setModalMode(mode);
    setSelectedCampana(campana);
    setFormErrors({});
    if (mode === 'edit' && campana) {
      setFormData({
        titulo: campana.titulo || '',
        descripcion: campana.descripcion || '',
        historia: campana.historia || '',
        metaRecaudacion: campana.metaRecaudacion || '',
        fechaInicio: campana.fechaInicio ? campana.fechaInicio.split('T')[0] : '',
        fechaCierre: campana.fechaCierre ? campana.fechaCierre.split('T')[0] : '',
        negocioId: campana.negocioId || '',
      });
    } else {
      setFormData(initialFormData);
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedCampana(null);
    setFormErrors({});
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (formErrors[name]) setFormErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    setSubmitting(true);
    try {
      if (modalMode === 'create') {
        await campanasService.create(formData);
        toast.success('Campaña creada exitosamente');
      } else {
        await campanasService.update(selectedCampana.id, formData);
        toast.success('Campaña actualizada exitosamente');
      }
      handleCloseModal();
      cargarDatos();
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Error al guardar');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleActivo = async (campana) => {
    const accion = campana.activo ? 'desactivar' : 'activar';
    if (window.confirm(`¿Estás seguro de ${accion} "${campana.titulo}"?`)) {
      try {
        await campanasService.toggleActivo(campana.id);
        toast.success(`Campaña ${accion === 'desactivar' ? 'desactivada' : 'activada'} exitosamente`);
        cargarDatos();
      } catch {
        toast.error('Error al cambiar estado');
      }
    }
  };

  const handleCambiarEstado = async (campana, nuevoEstado) => {
    setShowEstadoMenu(null);
    try {
      await campanasService.updateEstado(campana.id, nuevoEstado);
      const estadoInfo = ESTADOS_CAMPANA.find((e) => e.value === nuevoEstado);
      toast.success(`Estado cambiado a "${estadoInfo?.label}"`);
      cargarDatos();
    } catch {
      toast.error('Error al cambiar estado');
    }
  };

  const handleOpenEstadoMenu = (e, campanaId) => {
    e.stopPropagation();
    if (showEstadoMenu === campanaId) {
      setShowEstadoMenu(null);
      return;
    }
    const rect = e.currentTarget.getBoundingClientRect();
    setMenuPos({
      top: rect.bottom + window.scrollY + 4,
      left: rect.left + window.scrollX,
    });
    setShowEstadoMenu(campanaId);
  };

  const negociosDisponibles = currentUser.rol === 'cliente'
    ? negocios.filter((n) => n.usuarioId === currentUser.id)
    : negocios;

  const campanasFiltradas = campanas.filter((c) => {
    const matchBuscar = !searchTerm ||
      c.titulo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.negocio?.nombreNegocio?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchEstado = !filtroEstado || c.estado === filtroEstado;
    return matchBuscar && matchEstado;
  });

  const formatCurrency = (val) =>
    new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(val || 0);

  const getPorcentaje = (recaudado, meta) => {
    if (!meta || parseFloat(meta) === 0) return 0;
    return Math.min(100, Math.round((parseFloat(recaudado || 0) / parseFloat(meta)) * 100));
  };

  const getEstadoInfo = (estado) =>
    ESTADOS_CAMPANA.find((e) => e.value === estado) || { label: estado, bg: '#F1F5F9', color: '#475569' };

  const inputBaseStyle = {
    width: '100%', padding: '10px 12px',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius-md)',
    fontSize: '14px', fontFamily: "'DM Sans', sans-serif",
    color: 'var(--gray-900)', background: '#fff',
    outline: 'none', transition: 'all 200ms ease', boxSizing: 'border-box',
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
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
          <div style={{
            width: '40px', height: '40px',
            border: '3px solid var(--gray-200)',
            borderTopColor: 'var(--capyme-blue-mid)',
            borderRadius: '50%',
            animation: 'spin 0.8s linear infinite',
          }} />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>

      {showEstadoMenu !== null && (
        <div
          onClick={() => setShowEstadoMenu(null)}
          style={{ position: 'fixed', inset: 0, zIndex: 9998 }}
        />
      )}

      {showEstadoMenu !== null && (
        <div
          onClick={(e) => e.stopPropagation()}
          style={{
            position: 'absolute',
            top: menuPos.top,
            left: menuPos.left,
            zIndex: 9999,
            background: '#fff',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-md)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.14)',
            minWidth: '170px',
            overflow: 'hidden',
          }}
        >
          <div style={{
            padding: '6px 12px 4px',
            fontSize: '10px', fontWeight: 700,
            color: 'var(--gray-400)', textTransform: 'uppercase',
            letterSpacing: '0.06em', fontFamily: "'Plus Jakarta Sans', sans-serif",
            borderBottom: '1px solid var(--border)',
          }}>
            Cambiar estado
          </div>
          {ESTADOS_CAMPANA.map((e) => {
            const campanaActual = campanas.find((c) => c.id === showEstadoMenu);
            const esActual = campanaActual?.estado === e.value;
            return (
              <button
                key={e.value}
                onClick={() => {
                  const c = campanas.find((c) => c.id === showEstadoMenu);
                  if (c) handleCambiarEstado(c, e.value);
                }}
                style={{
                  display: 'flex', alignItems: 'center', gap: '8px',
                  width: '100%', textAlign: 'left',
                  padding: '9px 12px', border: 'none',
                  background: esActual ? 'var(--capyme-blue-pale)' : 'transparent',
                  fontSize: '13px', fontFamily: "'DM Sans', sans-serif",
                  cursor: 'pointer',
                  color: esActual ? 'var(--capyme-blue-mid)' : 'var(--gray-700)',
                  fontWeight: esActual ? 700 : 400,
                }}
                onMouseEnter={(ev) => { if (!esActual) ev.currentTarget.style.background = 'var(--gray-50)'; }}
                onMouseLeave={(ev) => { if (!esActual) ev.currentTarget.style.background = 'transparent'; }}
              >
                <span style={{
                  display: 'inline-block', width: '8px', height: '8px',
                  borderRadius: '50%', background: e.color, flexShrink: 0,
                }} />
                {e.label}
                {esActual && <span style={{ marginLeft: 'auto', fontSize: '11px' }}>✓</span>}
              </button>
            );
          })}
        </div>
      )}

      <div style={{ padding: '32px 24px', maxWidth: '1280px', margin: '0 auto' }}>

        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '28px', gap: '16px', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '44px', height: '44px',
              background: 'linear-gradient(135deg, var(--capyme-blue-mid), var(--capyme-blue))',
              borderRadius: 'var(--radius-md)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Megaphone style={{ width: '22px', height: '22px', color: '#fff' }} />
            </div>
            <div>
              <h1 style={{ fontSize: '22px', fontWeight: 800, color: 'var(--gray-900)', fontFamily: "'Plus Jakarta Sans', sans-serif", margin: 0 }}>
                Campañas de Crowdfunding
              </h1>
              <p style={{ fontSize: '13px', color: 'var(--gray-500)', margin: '2px 0 0', fontFamily: "'DM Sans', sans-serif" }}>
                {campanas.length} campaña{campanas.length !== 1 ? 's' : ''} registrada{campanas.length !== 1 ? 's' : ''}
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
            <button
              onClick={() => handleOpenModal('create')}
              style={{
                padding: '9px 18px',
                background: 'linear-gradient(135deg, var(--capyme-blue-mid), var(--capyme-blue))',
                border: 'none', borderRadius: 'var(--radius-md)',
                color: '#fff', fontSize: '13px', fontWeight: 600,
                cursor: 'pointer', fontFamily: "'DM Sans', sans-serif",
                display: 'flex', alignItems: 'center', gap: '7px',
                boxShadow: '0 2px 8px rgba(31,78,158,0.28)',
              }}
            >
              <Plus style={{ width: '15px', height: '15px' }} />
              Nueva Campaña
            </button>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: '220px', position: 'relative' }}>
            <Search style={{ position: 'absolute', left: '11px', top: '50%', transform: 'translateY(-50%)', width: '15px', height: '15px', color: 'var(--gray-400)' }} />
            <input
              type="text"
              placeholder="Buscar campañas..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ ...inputBaseStyle, paddingLeft: '36px' }}
            />
          </div>
          <div style={{ position: 'relative', minWidth: '180px' }}>
            <select
              value={filtroEstado}
              onChange={(e) => setFiltroEstado(e.target.value)}
              style={{ ...selectStyle, minWidth: '180px' }}
            >
              <option value="">Todos los estados</option>
              {ESTADOS_CAMPANA.map((e) => (
                <option key={e.value} value={e.value}>{e.label}</option>
              ))}
            </select>
            <ChevronDown style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', width: '14px', height: '14px', color: 'var(--gray-400)', pointerEvents: 'none' }} />
          </div>
        </div>

        <div style={{ background: '#fff', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-sm)' }}>
          <div style={{ overflowX: 'auto', borderRadius: 'var(--radius-lg)' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: 'var(--gray-50)', borderBottom: '1px solid var(--border)' }}>
                  {['Campaña', 'Negocio', 'Meta / Recaudado', 'Fechas', 'Estado', 'Activo', 'Acciones'].map((h) => (
                    <th key={h} style={{
                      padding: '12px 16px', textAlign: h === 'Acciones' ? 'right' : 'left',
                      fontSize: '11px', fontWeight: 700, color: 'var(--gray-500)',
                      textTransform: 'uppercase', letterSpacing: '0.05em',
                      fontFamily: "'Plus Jakarta Sans', sans-serif", whiteSpace: 'nowrap',
                    }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {campanasFiltradas.length === 0 ? (
                  <tr>
                    <td colSpan={7} style={{ padding: '48px', textAlign: 'center', color: 'var(--gray-400)', fontFamily: "'DM Sans', sans-serif", fontSize: '14px' }}>
                      <Megaphone style={{ width: '32px', height: '32px', margin: '0 auto 8px', display: 'block', opacity: 0.4 }} />
                      No se encontraron campañas
                    </td>
                  </tr>
                ) : campanasFiltradas.map((campana) => {
                  const porcentaje = getPorcentaje(campana.montoRecaudado, campana.metaRecaudacion);
                  const estadoInfo = getEstadoInfo(campana.estado);
                  const iniciales = campana.titulo.slice(0, 2).toUpperCase();
                  return (
                    <FilaCampana
                      key={campana.id}
                      campana={campana}
                      iniciales={iniciales}
                      porcentaje={porcentaje}
                      estadoInfo={estadoInfo}
                      currentUser={currentUser}
                      formatCurrency={formatCurrency}
                      showEstadoMenu={showEstadoMenu}
                      onOpenEstadoMenu={handleOpenEstadoMenu}
                      onEdit={() => handleOpenModal('edit', campana)}
                      onToggle={() => handleToggleActivo(campana)}
                    />
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {showModal && (
        <div
          onClick={handleCloseModal}
          style={{
            position: 'fixed', inset: 0,
            background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)',
            zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: '20px',
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: '#fff', borderRadius: 'var(--radius-lg)',
              width: '100%', maxWidth: '720px',
              maxHeight: '90vh', display: 'flex', flexDirection: 'column',
              boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
            }}
          >
            <div style={{
              padding: '20px 24px', borderBottom: '1px solid var(--border)',
              background: 'var(--gray-50)', borderRadius: 'var(--radius-lg) var(--radius-lg) 0 0',
              display: 'flex', alignItems: 'center', gap: '10px',
            }}>
              <div style={{
                width: '36px', height: '36px',
                background: 'linear-gradient(135deg, var(--capyme-blue-mid), var(--capyme-blue))',
                borderRadius: 'var(--radius-sm)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Megaphone style={{ width: '16px', height: '16px', color: '#fff' }} />
              </div>
              <h2 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--gray-900)', fontFamily: "'Plus Jakarta Sans', sans-serif", margin: 0 }}>
                {modalMode === 'create' ? 'Nueva Campaña' : 'Editar Campaña'}
              </h2>
            </div>

            <div style={{ overflowY: 'auto', flex: 1, padding: '24px' }}>
              <div style={{ marginBottom: '20px' }}>
                <SectionTitle icon={Megaphone} text="Información principal" />
                <div style={{ marginTop: '12px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div style={{ gridColumn: '1 / -1' }}>
                    <label style={labelStyle}>Título de la campaña *</label>
                    <input name="titulo" value={formData.titulo} onChange={handleChange}
                      placeholder="Ej. Expansión de panadería artesanal"
                      style={{ ...inputBaseStyle, ...(formErrors.titulo ? inputErrorStyle : {}) }} />
                    {formErrors.titulo && <ErrorMsg text={formErrors.titulo} />}
                  </div>
                  <div>
                    <label style={labelStyle}>Negocio *</label>
                    <div style={{ position: 'relative' }}>
                      <select name="negocioId" value={formData.negocioId} onChange={handleChange}
                        style={{
                          ...selectStyle,
                          ...(formErrors.negocioId ? inputErrorStyle : {}),
                          ...(modalMode === 'edit' && currentUser.rol === 'cliente' ? { background: 'var(--gray-50)', cursor: 'not-allowed' } : {}),
                        }}
                        disabled={modalMode === 'edit' && currentUser.rol === 'cliente'}
                      >
                        <option value="">Seleccionar negocio...</option>
                        {negocios.map((n) => (
                          <option key={n.id} value={n.id}>{n.nombreNegocio}</option>
                        ))}
                      </select>
                      <ChevronDown style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', width: '14px', height: '14px', color: 'var(--gray-400)', pointerEvents: 'none' }} />
                    </div>
                    {formErrors.negocioId && <ErrorMsg text={formErrors.negocioId} />}
                    {modalMode === 'edit' && currentUser.rol === 'cliente' && (
                      <p style={{ marginTop: '4px', fontSize: '11px', color: 'var(--gray-400)', fontFamily: "'DM Sans', sans-serif" }}>
                        El negocio no puede cambiarse una vez creada la campaña
                      </p>
                    )}
                  </div>
                  <div>
                    <label style={labelStyle}>Meta de recaudación (MXN) *</label>
                    <div style={{ position: 'relative' }}>
                      <DollarSign style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', width: '14px', height: '14px', color: 'var(--gray-400)' }} />
                      <input name="metaRecaudacion" type="number" min="1" value={formData.metaRecaudacion} onChange={handleChange}
                        placeholder="0.00"
                        disabled={modalMode === 'edit' && currentUser.rol === 'cliente' && parseFloat(selectedCampana?.montoRecaudado || 0) > 0}
                        style={{ ...inputBaseStyle, paddingLeft: '32px', ...(formErrors.metaRecaudacion ? inputErrorStyle : {}) }} />
                    </div>
                    {formErrors.metaRecaudacion && <ErrorMsg text={formErrors.metaRecaudacion} />}
                    {modalMode === 'edit' && currentUser.rol === 'cliente' && parseFloat(selectedCampana?.montoRecaudado || 0) > 0 && (
                      <p style={{ marginTop: '4px', fontSize: '11px', color: 'var(--gray-400)', fontFamily: "'DM Sans', sans-serif" }}>
                        No editable: la campaña ya recibió fondos
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <div style={{ marginBottom: '20px' }}>
                <SectionTitle icon={Target} text="Descripción e historia" />
                <div style={{ marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div>
                    <label style={labelStyle}>Descripción corta *</label>
                    <textarea name="descripcion" value={formData.descripcion} onChange={handleChange}
                      rows={3} placeholder="Describe brevemente tu proyecto..."
                      style={{ ...inputBaseStyle, resize: 'vertical', ...(formErrors.descripcion ? inputErrorStyle : {}) }} />
                    {formErrors.descripcion && <ErrorMsg text={formErrors.descripcion} />}
                  </div>
                  <div>
                    <label style={labelStyle}>Historia del proyecto</label>
                    <textarea name="historia" value={formData.historia} onChange={handleChange}
                      rows={4} placeholder="Cuenta la historia detrás de tu proyecto, tus motivaciones y el impacto esperado..."
                      style={{ ...inputBaseStyle, resize: 'vertical' }} />
                  </div>
                </div>
              </div>

              <div style={{ marginBottom: '8px' }}>
                <SectionTitle icon={Calendar} text="Periodo de la campaña" />
                <div style={{ marginTop: '12px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div>
                    <label style={labelStyle}>Fecha de inicio</label>
                    <input name="fechaInicio" type="date" value={formData.fechaInicio} onChange={handleChange}
                      style={inputBaseStyle} />
                  </div>
                  <div>
                    <label style={labelStyle}>Fecha de cierre</label>
                    <input name="fechaCierre" type="date" value={formData.fechaCierre} onChange={handleChange}
                      style={inputBaseStyle} />
                  </div>
                </div>
              </div>
            </div>

            <div style={{
              padding: '16px 24px', borderTop: '1px solid var(--border)',
              background: 'var(--gray-50)', borderRadius: '0 0 var(--radius-lg) var(--radius-lg)',
              display: 'flex', justifyContent: 'flex-end', gap: '10px',
            }}>
              <button onClick={handleCloseModal} style={{
                padding: '9px 20px', border: '1.5px solid var(--border)',
                borderRadius: 'var(--radius-md)', background: '#fff',
                color: 'var(--gray-700)', fontSize: '13px', fontWeight: 600,
                cursor: 'pointer', fontFamily: "'DM Sans', sans-serif",
              }}>
                Cancelar
              </button>
              <button onClick={handleSubmit} disabled={submitting} style={{
                padding: '9px 24px',
                background: submitting ? 'var(--gray-300)' : 'linear-gradient(135deg, var(--capyme-blue-mid), var(--capyme-blue))',
                border: 'none', borderRadius: 'var(--radius-md)',
                color: '#fff', fontSize: '13px', fontWeight: 600,
                cursor: submitting ? 'not-allowed' : 'pointer',
                fontFamily: "'DM Sans', sans-serif",
                boxShadow: submitting ? 'none' : '0 2px 8px rgba(31,78,158,0.28)',
              }}>
                {submitting ? 'Guardando...' : modalMode === 'create' ? 'Crear Campaña' : 'Guardar Cambios'}
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};

const FilaCampana = ({
  campana, iniciales, porcentaje, estadoInfo, currentUser,
  formatCurrency, showEstadoMenu, onOpenEstadoMenu,
  onEdit, onToggle,
}) => {
  const [hovered, setHovered] = useState(false);
  const esAdmin = currentUser.rol === 'admin';
  const esColaborador = currentUser.rol === 'colaborador';

  const btnStyle = {
    width: '34px', height: '34px', border: 'none',
    borderRadius: 'var(--radius-sm)', background: 'transparent',
    cursor: 'pointer', color: 'var(--gray-400)', transition: 'all 150ms ease',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  };

  return (
    <tr
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{ borderBottom: '1px solid var(--border)', background: hovered ? 'var(--gray-50)' : '#fff', transition: 'background 120ms' }}
    >
      <td style={{ padding: '14px 16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '38px', height: '38px', borderRadius: 'var(--radius-md)', flexShrink: 0,
            background: 'linear-gradient(135deg, var(--capyme-blue-mid), var(--capyme-blue))',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#fff', fontSize: '13px', fontWeight: 700,
            fontFamily: "'Plus Jakarta Sans', sans-serif",
          }}>
            {iniciales}
          </div>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--gray-900)', fontFamily: "'DM Sans', sans-serif", whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '200px' }}>
              {campana.titulo}
            </div>
            <div style={{ fontSize: '11px', color: 'var(--gray-400)', fontFamily: "'DM Sans', sans-serif" }}>
              {campana.negocio?.categoria?.nombre || '—'}
            </div>
          </div>
        </div>
      </td>

      <td style={{ padding: '14px 16px' }}>
        <div style={{ fontSize: '13px', color: 'var(--gray-700)', fontFamily: "'DM Sans', sans-serif" }}>
          {campana.negocio?.nombreNegocio}
        </div>
        <div style={{ fontSize: '11px', color: 'var(--gray-400)', fontFamily: "'DM Sans', sans-serif" }}>
          {campana.negocio?.usuario?.nombre} {campana.negocio?.usuario?.apellido}
        </div>
      </td>

      <td style={{ padding: '14px 16px', minWidth: '180px' }}>
        <div style={{ fontSize: '12px', color: 'var(--gray-500)', fontFamily: "'DM Sans', sans-serif", marginBottom: '4px' }}>
          <span style={{ fontWeight: 600, color: 'var(--gray-800)' }}>{formatCurrency(campana.montoRecaudado)}</span>
          {' / '}{formatCurrency(campana.metaRecaudacion)}
        </div>
        <div style={{ height: '6px', background: 'var(--gray-100)', borderRadius: '99px', overflow: 'hidden' }}>
          <div style={{
            height: '100%', borderRadius: '99px',
            width: `${porcentaje}%`,
            background: porcentaje >= 100 ? '#22C55E' : 'linear-gradient(90deg, var(--capyme-blue-mid), var(--capyme-blue))',
            transition: 'width 400ms ease',
          }} />
        </div>
        <div style={{ fontSize: '10px', color: 'var(--gray-400)', fontFamily: "'DM Sans', sans-serif", marginTop: '2px' }}>
          {porcentaje}% alcanzado
        </div>
      </td>

      <td style={{ padding: '14px 16px' }}>
        <div style={{ fontSize: '12px', color: 'var(--gray-600)', fontFamily: "'DM Sans', sans-serif", display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {campana.fechaInicio && (
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Clock style={{ width: '11px', height: '11px' }} />
              {new Date(campana.fechaInicio).toLocaleDateString('es-MX', { day: '2-digit', month: 'short' })}
            </span>
          )}
          {campana.fechaCierre && (
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--gray-400)' }}>
              <Calendar style={{ width: '11px', height: '11px' }} />
              {new Date(campana.fechaCierre).toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' })}
            </span>
          )}
          {!campana.fechaInicio && !campana.fechaCierre && (
            <span style={{ color: 'var(--gray-300)' }}>—</span>
          )}
        </div>
      </td>

      <td style={{ padding: '14px 16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{
            padding: '3px 10px', borderRadius: '99px', fontSize: '11px', fontWeight: 600,
            fontFamily: "'DM Sans', sans-serif", whiteSpace: 'nowrap',
            background: estadoInfo.bg, color: estadoInfo.color,
          }}>
            {estadoInfo.label}
          </span>
          {esAdmin && (
            <button
              onClick={(e) => onOpenEstadoMenu(e, campana.id)}
              style={{
                ...btnStyle, width: '24px', height: '24px', flexShrink: 0,
                background: showEstadoMenu === campana.id ? '#EEF4FF' : 'transparent',
                color: showEstadoMenu === campana.id ? 'var(--capyme-blue-mid)' : 'var(--gray-400)',
                border: '1px solid',
                borderColor: showEstadoMenu === campana.id ? 'var(--capyme-blue-mid)' : 'var(--border)',
                borderRadius: 'var(--radius-sm)',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = '#EEF4FF'; e.currentTarget.style.color = 'var(--capyme-blue-mid)'; e.currentTarget.style.borderColor = 'var(--capyme-blue-mid)'; }}
              onMouseLeave={(e) => {
                if (showEstadoMenu !== campana.id) {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.color = 'var(--gray-400)';
                  e.currentTarget.style.borderColor = 'var(--border)';
                }
              }}
            >
              <ChevronDown style={{ width: '12px', height: '12px' }} />
            </button>
          )}
        </div>
      </td>

      <td style={{ padding: '14px 16px' }}>
        <span style={{
          padding: '3px 10px', borderRadius: '99px', fontSize: '11px', fontWeight: 600,
          fontFamily: "'DM Sans', sans-serif",
          background: campana.activo ? '#ECFDF5' : '#FEF2F2',
          color: campana.activo ? '#065F46' : '#DC2626',
        }}>
          {campana.activo ? 'Activo' : 'Inactivo'}
        </span>
      </td>

      <td style={{ padding: '14px 16px', textAlign: 'right' }}>
        <div style={{ display: 'flex', gap: '4px', justifyContent: 'flex-end' }}>
          <button
            onClick={onEdit}
            style={btnStyle}
            onMouseEnter={(e) => { e.currentTarget.style.background = '#EEF4FF'; e.currentTarget.style.color = 'var(--capyme-blue-mid)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--gray-400)'; }}
          >
            <Edit style={{ width: '16px', height: '16px' }} />
          </button>

          {esAdmin && !campana.activo && (
            <button
              onClick={onToggle}
              style={btnStyle}
              onMouseEnter={(e) => { e.currentTarget.style.background = '#ECFDF5'; e.currentTarget.style.color = '#065F46'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--gray-400)'; }}
            >
              <CheckCircle style={{ width: '16px', height: '16px' }} />
            </button>
          )}

          {esAdmin && campana.activo && (
            <button
              onClick={onToggle}
              style={btnStyle}
              onMouseEnter={(e) => { e.currentTarget.style.background = '#FEF2F2'; e.currentTarget.style.color = '#DC2626'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--gray-400)'; }}
            >
              <XCircle style={{ width: '16px', height: '16px' }} />
            </button>
          )}

          {esColaborador && (
            <button
              disabled
              style={{ ...btnStyle, cursor: 'not-allowed', opacity: 0.35 }}
              title="Solo administradores pueden cambiar el estado activo"
            >
              {campana.activo
                ? <XCircle style={{ width: '16px', height: '16px' }} />
                : <CheckCircle style={{ width: '16px', height: '16px' }} />}
            </button>
          )}
        </div>
      </td>
    </tr>
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

export default Campanas;