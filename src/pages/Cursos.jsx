//cursos vista admin
import { useState, useEffect } from 'react';
import Layout from '../components/common/Layout';
import { cursosService } from '../services/cursosService';
import {
  GraduationCap,
  Plus,
  Search,
  Edit,
  CheckCircle,
  Trash2,
  X,
  Calendar,
  Users,
  Clock,
  DollarSign,
  Monitor,
  MapPin,
  Layers,

  AlertCircle,
  ChevronDown,
  LayoutGrid,
  List,
  BookOpen,
  User,
  CreditCard,
  Banknote,
  AlertTriangle,
} from 'lucide-react';
import { toast } from 'react-hot-toast';

const initialFormData = {
  titulo: '',
  descripcion: '',
  instructor: '',
  duracionHoras: '',
  modalidad: 'online',
  fechaInicio: '',
  fechaFin: '',
  cupoMaximo: '',
  costo: '',
};

const Cursos = () => {
  const authStorage = JSON.parse(localStorage.getItem('auth-storage') || '{}');
  const currentUser = authStorage?.state?.user || {};

  const [cursos, setCursos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [confirmandoPago, setConfirmandoPago] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showInscritosModal, setShowInscritosModal] = useState(false);
  const [showPagosModal, setShowPagosModal] = useState(false);
  const [modalMode, setModalMode] = useState('create');
  const [selectedCurso, setSelectedCurso] = useState(null);
  const [inscritos, setInscritos] = useState([]);
  const [inscritosCursoTitulo, setInscritosCursoTitulo] = useState('');
  const [pagosPendientes, setPagosPendientes] = useState([]);
  const [loadingPagos, setLoadingPagos] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterModalidad, setFilterModalidad] = useState('');
  const [filterEstado, setFilterEstado] = useState('');
  const [viewMode, setViewMode] = useState('grid');
  const [hoveredRow, setHoveredRow] = useState(null);
  const [formData, setFormData] = useState(initialFormData);
  const [formErrors, setFormErrors] = useState({});

  const inputBaseStyle = {
    width: '100%', padding: '10px 12px',
    border: '1px solid var(--border)', borderRadius: 'var(--radius-md)',
    fontSize: '14px', fontFamily: "'DM Sans', sans-serif",
    color: 'var(--gray-900)', background: '#fff',
    outline: 'none', transition: 'all 200ms ease', boxSizing: 'border-box',
  };
  const inputWithIconStyle = { ...inputBaseStyle, paddingLeft: '38px' };
  const inputErrorStyle = { borderColor: '#EF4444', boxShadow: '0 0 0 2px rgba(239,68,68,0.15)' };
  const labelStyle = {
    display: 'block', fontSize: '13px', fontWeight: 600,
    color: 'var(--gray-600)', marginBottom: '6px', fontFamily: "'DM Sans', sans-serif",
  };
  const selectStyle = { ...inputBaseStyle, appearance: 'none', paddingRight: '36px', cursor: 'pointer' };
  const textareaStyle = { ...inputBaseStyle, resize: 'vertical', minHeight: '80px' };

  useEffect(() => { cargarCursos(); }, [filterModalidad, filterEstado]);

  const cargarCursos = async () => {
    try {
      setLoading(true);
      const params = {};
      if (filterModalidad) params.modalidad = filterModalidad;
      if (filterEstado !== '') params.activo = filterEstado;
      const res = await cursosService.getAll(params);
      setCursos(res.data);
    } catch { toast.error('Error al cargar cursos'); }
    finally { setLoading(false); }
  };

  const cargarPagosPendientes = async () => {
    try {
      setLoadingPagos(true);
      const res = await cursosService.getPagosPendientes();
      setPagosPendientes(res.data);
      setShowPagosModal(true);
    } catch { toast.error('Error al cargar pagos pendientes'); }
    finally { setLoadingPagos(false); }
  };

  const handleConfirmarPago = async (pago) => {
    if (!window.confirm(`¿Confirmas que recibiste el pago?\n\nReferencia: ${pago.referencia}\nAlumno: ${pago.inscripcion.usuario.nombre} ${pago.inscripcion.usuario.apellido}\nCurso: ${pago.inscripcion.curso.titulo}\nMonto: ${formatCurrency(pago.monto)}\nTipo: ${pago.tipoPago === 'spei' ? 'SPEI / Transferencia' : 'Efectivo'}`)) return;
    if (!window.confirm('Segunda confirmación: ¿ya verificaste la transferencia en tu banco o recibiste el efectivo?')) return;

    try {
      setConfirmandoPago(pago.id);
      await cursosService.confirmarPago(pago.id);
      toast.success('Pago confirmado exitosamente');
      const nuevos = pagosPendientes.filter((p) => p.id !== pago.id);
      setPagosPendientes(nuevos);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error al confirmar pago');
    } finally { setConfirmandoPago(null); }
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.titulo.trim()) errors.titulo = 'El título es requerido';
    if (formData.fechaInicio && formData.fechaFin && formData.fechaInicio > formData.fechaFin) {
      errors.fechaFin = 'La fecha de fin debe ser posterior al inicio';
    }
    if (formData.costo !== '' && isNaN(parseFloat(formData.costo))) errors.costo = 'Ingresa un costo válido';
    if (formData.duracionHoras !== '' && isNaN(parseInt(formData.duracionHoras))) errors.duracionHoras = 'Ingresa un número válido';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleOpenModal = (mode, curso = null) => {
    setModalMode(mode);
    setSelectedCurso(curso);
    setFormErrors({});
    if (mode === 'edit' && curso) {
      setFormData({
        titulo: curso.titulo || '',
        descripcion: curso.descripcion || '',
        instructor: curso.instructor || '',
        duracionHoras: curso.duracionHoras != null ? String(curso.duracionHoras) : '',
        modalidad: curso.modalidad || 'online',
        fechaInicio: curso.fechaInicio ? curso.fechaInicio.split('T')[0] : '',
        fechaFin: curso.fechaFin ? curso.fechaFin.split('T')[0] : '',
        cupoMaximo: curso.cupoMaximo != null ? String(curso.cupoMaximo) : '',
        costo: curso.costo != null ? String(curso.costo) : '',
      });
    } else {
      setFormData(initialFormData);
    }
    setShowModal(true);
  };

  const handleCloseModal = () => { setShowModal(false); setSelectedCurso(null); setFormErrors({}); };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (formErrors[name]) setFormErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    setSubmitting(true);
    try {
      const { activo, ...rest } = formData;
      const dataToSend = {
        ...rest,
        duracionHoras: formData.duracionHoras !== '' ? parseInt(formData.duracionHoras) : null,
        cupoMaximo: formData.cupoMaximo !== '' ? parseInt(formData.cupoMaximo) : null,
        costo: formData.costo !== '' ? parseFloat(formData.costo) : 0,
        fechaInicio: formData.fechaInicio || null,
        fechaFin: formData.fechaFin || null,
      };
      if (modalMode === 'create') {
        await cursosService.create(dataToSend);
        toast.success('Curso creado exitosamente');
      } else {
        await cursosService.update(selectedCurso.id, dataToSend);
        toast.success('Curso actualizado exitosamente');
      }
      handleCloseModal();
      cargarCursos();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error al guardar curso');
    } finally { setSubmitting(false); }
  };

  const handleToggleActivo = async (curso) => {
    const accion = curso.activo ? 'desactivar' : 'activar';
    if (!window.confirm(`¿Estás seguro de ${accion} "${curso.titulo}"?`)) return;
    try {
      await cursosService.toggleActivo(curso.id);
      toast.success(`Curso ${accion === 'desactivar' ? 'desactivado' : 'activado'} exitosamente`);
      cargarCursos();
    } catch { toast.error('Error al cambiar estado'); }
  };

  const cargarInscritos = async (curso) => {
    try {
      const res = await cursosService.getInscritos(curso.id);
      setInscritos(res.data);
      setInscritosCursoTitulo(curso.titulo);
      setShowInscritosModal(true);
    } catch { toast.error('Error al cargar inscritos'); }
  };

  const cursosFiltrados = cursos.filter(
    (c) => c.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.instructor || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatCurrency = (amount) => {
    if (amount == null) return null;
    return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(amount);
  };
  const formatDate = (date) => {
    if (!date) return null;
    return new Date(date).toLocaleDateString('es-MX', { year: 'numeric', month: 'short', day: 'numeric' });
  };
  const getModalidadStyle = (m) => ({ online: { bg: '#EEF4FF', color: 'var(--capyme-blue-mid)' }, presencial: { bg: '#F0FDF4', color: '#16A34A' }, hibrido: { bg: '#F5F3FF', color: '#7C3AED' } }[m] || { bg: 'var(--gray-100)', color: 'var(--gray-600)' });
  const getModalidadIcon = (m) => m === 'presencial' ? MapPin : m === 'hibrido' ? Layers : Monitor;
  const getModalidadLabel = (m) => ({ online: 'Online', presencial: 'Presencial', hibrido: 'Híbrido' }[m] || m);
  const getEstadoInscripcionStyle = (e) => ({ inscrito: { bg: '#EEF4FF', color: 'var(--capyme-blue-mid)' }, en_curso: { bg: '#FFF7ED', color: '#C2410C' }, completado: { bg: '#ECFDF5', color: '#065F46' }, abandonado: { bg: '#FEF2F2', color: '#DC2626' } }[e] || { bg: 'var(--gray-100)', color: 'var(--gray-600)' });

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
        @keyframes fadeInUp { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes modalIn { from { opacity: 0; transform: scale(0.96) translateY(8px); } to { opacity: 1; transform: scale(1) translateY(0); } }
        .curso-card { animation: fadeInUp 0.3s ease both; transition: box-shadow 200ms ease, transform 200ms ease; }
        .curso-card:hover { box-shadow: 0 8px 24px rgba(31,78,158,0.10); transform: translateY(-2px); }
        .curso-modal { animation: modalIn 0.25s ease both; }
        input[type="date"]::-webkit-calendar-picker-indicator { opacity: 0.5; cursor: pointer; }
      `}</style>

      <div style={{ padding: '0 0 40px' }}>

        {/* ── HEADER ── */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '28px', flexWrap: 'wrap', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{ width: '46px', height: '46px', background: 'linear-gradient(135deg, var(--capyme-blue-mid), var(--capyme-blue))', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(31,78,158,0.25)' }}>
              <GraduationCap style={{ width: '22px', height: '22px', color: '#fff' }} />
            </div>
            <div>
              <h1 style={{ fontSize: '22px', fontWeight: 800, color: 'var(--gray-900)', fontFamily: "'Plus Jakarta Sans', sans-serif", margin: 0, lineHeight: 1.2 }}>Cursos de Capacitación</h1>
              <p style={{ fontSize: '13px', color: 'var(--gray-500)', margin: '3px 0 0', fontFamily: "'DM Sans', sans-serif" }}>
                {cursos.length} curso{cursos.length !== 1 ? 's' : ''} registrado{cursos.length !== 1 ? 's' : ''}
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            {currentUser.rol === 'admin' && (
              <button
                onClick={cargarPagosPendientes}
                disabled={loadingPagos}
                style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 18px', background: '#FFF7ED', color: '#C2410C', border: '1.5px solid #FED7AA', borderRadius: 'var(--radius-md)', fontSize: '14px', fontWeight: 600, fontFamily: "'DM Sans', sans-serif", cursor: 'pointer', transition: 'all 150ms ease' }}
                onMouseEnter={(e) => { e.currentTarget.style.background = '#FFEDD5'; e.currentTarget.style.borderColor = '#FB923C'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = '#FFF7ED'; e.currentTarget.style.borderColor = '#FED7AA'; }}
              >
                <CreditCard style={{ width: '16px', height: '16px' }} />
                Pagos pendientes de inscripciones
              </button>
            )}
            {currentUser.rol !== 'cliente' && (
              <button
                onClick={() => handleOpenModal('create')}
                style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 18px', background: 'linear-gradient(135deg, var(--capyme-blue-mid), var(--capyme-blue))', color: '#fff', border: 'none', borderRadius: 'var(--radius-md)', fontSize: '14px', fontWeight: 600, fontFamily: "'DM Sans', sans-serif", cursor: 'pointer', boxShadow: '0 2px 8px rgba(31,78,158,0.28)', transition: 'all 150ms ease' }}
                onMouseEnter={(e) => { e.currentTarget.style.opacity = '0.9'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.opacity = '1'; e.currentTarget.style.transform = 'translateY(0)'; }}
              >
                <Plus style={{ width: '16px', height: '16px' }} />
                Nuevo Curso
              </button>
            )}
          </div>
        </div>

        {/* ── STATS ── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '12px', marginBottom: '20px' }}>
          {[
            { label: 'Total', value: cursos.length, color: 'var(--capyme-blue-mid)', bg: 'var(--capyme-blue-pale)' },
            { label: 'Activos', value: cursos.filter((c) => c.activo).length, color: '#16A34A', bg: '#F0FDF4' },
            { label: 'Inactivos', value: cursos.filter((c) => !c.activo).length, color: '#DC2626', bg: '#FEF2F2' },
            { label: 'Gratuitos', value: cursos.filter((c) => !c.costo || parseFloat(c.costo) === 0).length, color: '#7C3AED', bg: '#F5F3FF' },
          ].map((stat) => (
            <div key={stat.label} style={{ background: stat.bg, borderRadius: 'var(--radius-md)', padding: '14px 16px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontSize: '22px', fontWeight: 800, color: stat.color, fontFamily: "'Plus Jakarta Sans', sans-serif", lineHeight: 1 }}>{stat.value}</span>
              <span style={{ fontSize: '12px', color: stat.color, fontFamily: "'DM Sans', sans-serif", fontWeight: 600, opacity: 0.75 }}>{stat.label}</span>
            </div>
          ))}
        </div>

        {/* ── FILTERS ── */}
        <div style={{ background: '#fff', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '16px 20px', marginBottom: '20px', display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap', boxShadow: 'var(--shadow-sm)' }}>
          <div style={{ position: 'relative', flex: '1', minWidth: '180px' }}>
            <Search style={{ position: 'absolute', left: '11px', top: '50%', transform: 'translateY(-50%)', width: '15px', height: '15px', color: 'var(--gray-400)', pointerEvents: 'none' }} />
            <input type="text" placeholder="Buscar curso o instructor…" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} style={inputWithIconStyle} />
          </div>
          <div style={{ position: 'relative', minWidth: '160px' }}>
            <select value={filterModalidad} onChange={(e) => setFilterModalidad(e.target.value)} style={{ ...selectStyle, width: '100%' }}>
              <option value="">Todas las modalidades</option>
              <option value="online">Online</option>
              <option value="presencial">Presencial</option>
              <option value="hibrido">Híbrido</option>
            </select>
            <ChevronDown style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', width: '14px', height: '14px', color: 'var(--gray-400)', pointerEvents: 'none' }} />
          </div>
          <div style={{ position: 'relative', minWidth: '140px' }}>
            <select value={filterEstado} onChange={(e) => setFilterEstado(e.target.value)} style={{ ...selectStyle, width: '100%' }}>
              <option value="">Activo / Inactivo</option>
              <option value="true">Activos</option>
              <option value="false">Inactivos</option>
            </select>
            <ChevronDown style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', width: '14px', height: '14px', color: 'var(--gray-400)', pointerEvents: 'none' }} />
          </div>
          <div style={{ display: 'flex', gap: '4px', background: 'var(--gray-100)', borderRadius: 'var(--radius-sm)', padding: '3px', marginLeft: 'auto' }}>
            {[{ mode: 'grid', Icon: LayoutGrid }, { mode: 'list', Icon: List }].map(({ mode, Icon }) => (
              <button key={mode} onClick={() => setViewMode(mode)} style={{ width: '32px', height: '32px', border: 'none', borderRadius: 'var(--radius-sm)', background: viewMode === mode ? '#fff' : 'transparent', color: viewMode === mode ? 'var(--capyme-blue-mid)' : 'var(--gray-400)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: viewMode === mode ? 'var(--shadow-sm)' : 'none', transition: 'all 150ms ease' }}>
                <Icon style={{ width: '15px', height: '15px' }} />
              </button>
            ))}
          </div>
        </div>

        {/* ── CONTENT ── */}
        {cursosFiltrados.length === 0 ? (
          <div style={{ background: '#fff', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '60px 20px', textAlign: 'center', boxShadow: 'var(--shadow-sm)' }}>
            <div style={{ width: '56px', height: '56px', background: 'var(--gray-100)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' }}>
              <GraduationCap style={{ width: '24px', height: '24px', color: 'var(--gray-400)' }} />
            </div>
            <p style={{ fontSize: '15px', fontWeight: 600, color: 'var(--gray-700)', margin: '0 0 6px', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>No se encontraron cursos</p>
            <p style={{ fontSize: '13px', color: 'var(--gray-400)', margin: 0, fontFamily: "'DM Sans', sans-serif" }}>Intenta con otros filtros o crea un nuevo curso</p>
          </div>

        ) : viewMode === 'grid' ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '16px' }}>
            {cursosFiltrados.map((curso, idx) => {
              const ms = getModalidadStyle(curso.modalidad);
              const MIcon = getModalidadIcon(curso.modalidad);
              const esGratis = !curso.costo || parseFloat(curso.costo) === 0;
              return (
                <div key={curso.id} className="curso-card" style={{ background: '#fff', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', overflow: 'hidden', animationDelay: `${idx * 40}ms`, opacity: curso.activo ? 1 : 0.65 }}>
                  <div style={{ height: '4px', background: curso.activo ? 'linear-gradient(90deg, var(--capyme-blue-mid), var(--capyme-blue))' : 'var(--gray-200)' }} />
                  <div style={{ padding: '20px' }}>
                    <div style={{ marginBottom: '10px' }}>
                      <h3 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--gray-900)', fontFamily: "'Plus Jakarta Sans', sans-serif", margin: '0 0 8px', lineHeight: 1.3 }}>{curso.titulo}</h3>
                      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '2px 8px', borderRadius: '20px', fontSize: '11px', fontWeight: 700, background: ms.bg, color: ms.color, fontFamily: "'Plus Jakarta Sans', sans-serif", textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                          <MIcon style={{ width: '9px', height: '9px' }} />{getModalidadLabel(curso.modalidad)}
                        </span>
                        <span style={{ display: 'inline-flex', alignItems: 'center', padding: '2px 8px', borderRadius: '20px', fontSize: '11px', fontWeight: 700, background: esGratis ? '#ECFDF5' : '#FFF7ED', color: esGratis ? '#065F46' : '#C2410C', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                          {esGratis ? 'Gratis' : formatCurrency(curso.costo)}
                        </span>
                        <span style={{ display: 'inline-flex', alignItems: 'center', padding: '2px 8px', borderRadius: '20px', fontSize: '11px', fontWeight: 700, background: curso.activo ? '#ECFDF5' : '#FEF2F2', color: curso.activo ? '#065F46' : '#DC2626', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                          {curso.activo ? '● Activo' : '● Inactivo'}
                        </span>
                      </div>
                    </div>
                    {curso.descripcion && (
                      <p style={{ fontSize: '13px', color: 'var(--gray-500)', margin: '0 0 14px', fontFamily: "'DM Sans', sans-serif", lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{curso.descripcion}</p>
                    )}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '7px', marginBottom: '16px' }}>
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
                            <span style={{ fontWeight: 700, color: 'var(--gray-800)' }}>{curso.inscritosCount || 0}</span> / {curso.cupoMaximo} inscritos
                          </span>
                        </div>
                      )}
                    </div>
                    <div style={{ display: 'flex', gap: '6px', paddingTop: '14px', borderTop: '1px solid var(--gray-100)', justifyContent: 'space-between', alignItems: 'center' }}>
                      <button onClick={() => cargarInscritos(curso)} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 12px', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', background: 'transparent', cursor: 'pointer', color: 'var(--gray-600)', fontSize: '12px', fontFamily: "'DM Sans', sans-serif", fontWeight: 600, transition: 'all 150ms ease' }} onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--capyme-blue-pale)'; e.currentTarget.style.color = 'var(--capyme-blue-mid)'; e.currentTarget.style.borderColor = 'var(--capyme-blue-mid)'; }} onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--gray-600)'; e.currentTarget.style.borderColor = 'var(--border)'; }}>
                        <Users style={{ width: '13px', height: '13px' }} />
                        Inscritos ({curso.inscritosCount || 0})
                      </button>
                      <div style={{ display: 'flex', gap: '4px' }}>
                        {currentUser.rol !== 'cliente' && (
                          <button onClick={() => handleOpenModal('edit', curso)} title="Editar" style={{ width: '34px', height: '34px', border: 'none', borderRadius: 'var(--radius-sm)', background: 'transparent', cursor: 'pointer', color: 'var(--gray-400)', transition: 'all 150ms ease', display: 'flex', alignItems: 'center', justifyContent: 'center' }} onMouseEnter={(e) => { e.currentTarget.style.background = '#EEF4FF'; e.currentTarget.style.color = 'var(--capyme-blue-mid)'; }} onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--gray-400)'; }}>
                            <Edit style={{ width: '15px', height: '15px' }} />
                          </button>
                        )}
                        {currentUser.rol === 'admin' && !curso.activo && (
                          <button onClick={() => handleToggleActivo(curso)} title="Activar" style={{ width: '34px', height: '34px', border: 'none', borderRadius: 'var(--radius-sm)', background: 'transparent', cursor: 'pointer', color: 'var(--gray-400)', transition: 'all 150ms ease', display: 'flex', alignItems: 'center', justifyContent: 'center' }} onMouseEnter={(e) => { e.currentTarget.style.background = '#ECFDF5'; e.currentTarget.style.color = '#065F46'; }} onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--gray-400)'; }}>
                            <CheckCircle style={{ width: '15px', height: '15px' }} />
                          </button>
                        )}
                        {currentUser.rol === 'admin' && curso.activo && (
                          <button onClick={() => handleToggleActivo(curso)} title="Desactivar" style={{ width: '34px', height: '34px', border: 'none', borderRadius: 'var(--radius-sm)', background: 'transparent', cursor: 'pointer', color: 'var(--gray-400)', transition: 'all 150ms ease', display: 'flex', alignItems: 'center', justifyContent: 'center' }} onMouseEnter={(e) => { e.currentTarget.style.background = '#FEF2F2'; e.currentTarget.style.color = '#DC2626'; }} onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--gray-400)'; }}>
                            <Trash2 style={{ width: '15px', height: '15px' }} />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

        ) : (
          <div style={{ background: '#fff', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', overflow: 'hidden', boxShadow: 'var(--shadow-sm)' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: 'var(--gray-50)', borderBottom: '1px solid var(--border)' }}>
                  {['Curso', 'Modalidad', 'Instructor', 'Duración', 'Costo', 'Inscritos', 'Estado', ''].map((h) => (
                    <th key={h} style={{ padding: '11px 16px', textAlign: h === '' ? 'right' : 'left', fontSize: '11px', fontWeight: 700, color: 'var(--gray-500)', fontFamily: "'Plus Jakarta Sans', sans-serif", textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {cursosFiltrados.map((curso) => {
                  const ms = getModalidadStyle(curso.modalidad);
                  const MIcon = getModalidadIcon(curso.modalidad);
                  const esGratis = !curso.costo || parseFloat(curso.costo) === 0;
                  return (
                    <tr key={curso.id} onMouseEnter={() => setHoveredRow(curso.id)} onMouseLeave={() => setHoveredRow(null)} style={{ borderBottom: '1px solid var(--gray-100)', background: hoveredRow === curso.id ? 'var(--gray-50)' : '#fff', transition: 'background 120ms ease', opacity: curso.activo ? 1 : 0.6 }}>
                      <td style={{ padding: '13px 16px', maxWidth: '260px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <div style={{ width: '36px', height: '36px', background: 'linear-gradient(135deg, var(--capyme-blue-mid), var(--capyme-blue))', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            <GraduationCap style={{ width: '16px', height: '16px', color: '#fff' }} />
                          </div>
                          <div>
                            <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--gray-900)', fontFamily: "'DM Sans', sans-serif" }}>{curso.titulo}</div>
                            {curso.descripcion && <div style={{ fontSize: '12px', color: 'var(--gray-400)', fontFamily: "'DM Sans', sans-serif", maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{curso.descripcion}</div>}
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '13px 16px' }}>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '3px 8px', borderRadius: '20px', fontSize: '11px', fontWeight: 700, background: ms.bg, color: ms.color, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                          <MIcon style={{ width: '10px', height: '10px' }} />{getModalidadLabel(curso.modalidad)}
                        </span>
                      </td>
                      <td style={{ padding: '13px 16px', fontSize: '13px', color: 'var(--gray-600)', fontFamily: "'DM Sans', sans-serif" }}>{curso.instructor || <span style={{ color: 'var(--gray-300)' }}>—</span>}</td>
                      <td style={{ padding: '13px 16px', fontSize: '13px', color: 'var(--gray-600)', fontFamily: "'DM Sans', sans-serif" }}>{curso.duracionHoras ? `${curso.duracionHoras} h` : <span style={{ color: 'var(--gray-300)' }}>—</span>}</td>
                      <td style={{ padding: '13px 16px', fontSize: '13px', fontWeight: 600, fontFamily: "'DM Sans', sans-serif" }}>{esGratis ? <span style={{ color: '#065F46' }}>Gratis</span> : <span style={{ color: 'var(--gray-800)' }}>{formatCurrency(curso.costo)}</span>}</td>
                      <td style={{ padding: '13px 16px' }}>
                        <button onClick={() => cargarInscritos(curso)} style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '4px 10px', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', background: 'transparent', cursor: 'pointer', color: 'var(--gray-600)', fontSize: '12px', fontFamily: "'DM Sans', sans-serif", fontWeight: 600, transition: 'all 150ms ease' }} onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--capyme-blue-pale)'; e.currentTarget.style.color = 'var(--capyme-blue-mid)'; }} onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--gray-600)'; }}>
                          <Users style={{ width: '12px', height: '12px' }} />
                          {curso.inscritosCount || 0}{curso.cupoMaximo ? `/${curso.cupoMaximo}` : ''}
                        </button>
                      </td>
                      <td style={{ padding: '13px 16px' }}>
                        <span style={{ display: 'inline-block', padding: '3px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: 700, background: curso.activo ? '#ECFDF5' : '#FEF2F2', color: curso.activo ? '#065F46' : '#DC2626', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                          {curso.activo ? 'Activo' : 'Inactivo'}
                        </span>
                      </td>
                      <td style={{ padding: '13px 16px', textAlign: 'right' }}>
                        <div style={{ display: 'flex', gap: '4px', justifyContent: 'flex-end' }}>
                          {currentUser.rol !== 'cliente' && (
                            <button onClick={() => handleOpenModal('edit', curso)} title="Editar" style={{ width: '34px', height: '34px', border: 'none', borderRadius: 'var(--radius-sm)', background: 'transparent', cursor: 'pointer', color: 'var(--gray-400)', transition: 'all 150ms ease', display: 'flex', alignItems: 'center', justifyContent: 'center' }} onMouseEnter={(e) => { e.currentTarget.style.background = '#EEF4FF'; e.currentTarget.style.color = 'var(--capyme-blue-mid)'; }} onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--gray-400)'; }}>
                              <Edit style={{ width: '15px', height: '15px' }} />
                            </button>
                          )}
                          {currentUser.rol === 'admin' && !curso.activo && (
                            <button onClick={() => handleToggleActivo(curso)} title="Activar" style={{ width: '34px', height: '34px', border: 'none', borderRadius: 'var(--radius-sm)', background: 'transparent', cursor: 'pointer', color: 'var(--gray-400)', transition: 'all 150ms ease', display: 'flex', alignItems: 'center', justifyContent: 'center' }} onMouseEnter={(e) => { e.currentTarget.style.background = '#ECFDF5'; e.currentTarget.style.color = '#065F46'; }} onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--gray-400)'; }}>
                              <CheckCircle style={{ width: '15px', height: '15px' }} />
                            </button>
                          )}
                          {currentUser.rol === 'admin' && curso.activo && (
                            <button onClick={() => handleToggleActivo(curso)} title="Desactivar" style={{ width: '34px', height: '34px', border: 'none', borderRadius: 'var(--radius-sm)', background: 'transparent', cursor: 'pointer', color: 'var(--gray-400)', transition: 'all 150ms ease', display: 'flex', alignItems: 'center', justifyContent: 'center' }} onMouseEnter={(e) => { e.currentTarget.style.background = '#FEF2F2'; e.currentTarget.style.color = '#DC2626'; }} onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--gray-400)'; }}>
                              <Trash2 style={{ width: '15px', height: '15px' }} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ═══════════════════ MODAL CREAR / EDITAR ═══════════════════ */}
      {showModal && (
        <div onClick={handleCloseModal} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.42)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
          <div className="curso-modal" onClick={(e) => e.stopPropagation()} style={{ background: '#fff', borderRadius: 'var(--radius-lg)', width: '100%', maxWidth: '720px', maxHeight: '92vh', display: 'flex', flexDirection: 'column', boxShadow: '0 24px 64px rgba(0,0,0,0.18)', overflow: 'hidden' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 24px', background: 'var(--gray-50)', borderBottom: '1px solid var(--border)', flexShrink: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '36px', height: '36px', background: 'linear-gradient(135deg, var(--capyme-blue-mid), var(--capyme-blue))', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <GraduationCap style={{ width: '18px', height: '18px', color: '#fff' }} />
                </div>
                <h2 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--gray-900)', fontFamily: "'Plus Jakarta Sans', sans-serif", margin: 0 }}>
                  {modalMode === 'create' ? 'Nuevo Curso' : 'Editar Curso'}
                </h2>
              </div>
              <button onClick={handleCloseModal} style={{ width: '32px', height: '32px', border: 'none', borderRadius: 'var(--radius-sm)', background: 'transparent', cursor: 'pointer', color: 'var(--gray-400)', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 150ms ease' }} onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--gray-200)'; e.currentTarget.style.color = 'var(--gray-700)'; }} onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--gray-400)'; }}>
                <X style={{ width: '18px', height: '18px' }} />
              </button>
            </div>

            <div style={{ overflowY: 'auto', flex: 1, padding: '24px' }}>
              <SectionTitle icon={BookOpen} text="Información general" />
              <div style={{ marginTop: '14px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <label style={labelStyle}>Título del Curso <span style={{ color: '#EF4444' }}>*</span></label>
                  <input name="titulo" type="text" value={formData.titulo} onChange={handleChange} placeholder="Ej. Finanzas para PyMEs" style={{ ...inputBaseStyle, ...(formErrors.titulo ? inputErrorStyle : {}) }} />
                  {formErrors.titulo && <ErrorMsg text={formErrors.titulo} />}
                </div>
                <div>
                  <label style={labelStyle}>Descripción</label>
                  <textarea name="descripcion" value={formData.descripcion} onChange={handleChange} placeholder="Describe el contenido y objetivos del curso..." style={textareaStyle} />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                  <div>
                    <label style={labelStyle}>Instructor</label>
                    <div style={{ position: 'relative' }}>
                      <User style={{ position: 'absolute', left: '11px', top: '50%', transform: 'translateY(-50%)', width: '14px', height: '14px', color: 'var(--gray-400)', pointerEvents: 'none' }} />
                      <input name="instructor" type="text" value={formData.instructor} onChange={handleChange} placeholder="Nombre del instructor" style={inputWithIconStyle} />
                    </div>
                  </div>
                  <div>
                    <label style={labelStyle}>Duración (horas)</label>
                    <div style={{ position: 'relative' }}>
                      <Clock style={{ position: 'absolute', left: '11px', top: '50%', transform: 'translateY(-50%)', width: '14px', height: '14px', color: 'var(--gray-400)', pointerEvents: 'none' }} />
                      <input name="duracionHoras" type="number" min="1" value={formData.duracionHoras} onChange={handleChange} placeholder="0" style={{ ...inputWithIconStyle, ...(formErrors.duracionHoras ? inputErrorStyle : {}) }} />
                    </div>
                    {formErrors.duracionHoras && <ErrorMsg text={formErrors.duracionHoras} />}
                  </div>
                </div>
              </div>

              <div style={{ marginTop: '24px' }}>
                <SectionTitle icon={Monitor} text="Configuración del curso" />
                <div style={{ marginTop: '14px', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '14px' }}>
                  <div>
                    <label style={labelStyle}>Modalidad</label>
                    <div style={{ position: 'relative' }}>
                      <select name="modalidad" value={formData.modalidad} onChange={handleChange} style={selectStyle}>
                        <option value="online">Online</option>
                        <option value="presencial">Presencial</option>
                        <option value="hibrido">Híbrido</option>
                      </select>
                      <ChevronDown style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', width: '14px', height: '14px', color: 'var(--gray-400)', pointerEvents: 'none' }} />
                    </div>
                  </div>
                  <div>
                    <label style={labelStyle}>Cupo Máximo</label>
                    <div style={{ position: 'relative' }}>
                      <Users style={{ position: 'absolute', left: '11px', top: '50%', transform: 'translateY(-50%)', width: '14px', height: '14px', color: 'var(--gray-400)', pointerEvents: 'none' }} />
                      <input name="cupoMaximo" type="number" min="1" value={formData.cupoMaximo} onChange={handleChange} placeholder="Sin límite" style={inputWithIconStyle} />
                    </div>
                  </div>
                  <div>
                    <label style={labelStyle}>Costo (MXN)</label>
                    <div style={{ position: 'relative' }}>
                      <DollarSign style={{ position: 'absolute', left: '11px', top: '50%', transform: 'translateY(-50%)', width: '14px', height: '14px', color: 'var(--gray-400)', pointerEvents: 'none' }} />
                      <input name="costo" type="number" step="0.01" min="0" value={formData.costo} onChange={handleChange} placeholder="0.00" style={{ ...inputWithIconStyle, ...(formErrors.costo ? inputErrorStyle : {}) }} />
                    </div>
                    {formErrors.costo && <ErrorMsg text={formErrors.costo} />}
                  </div>
                </div>
              </div>

              <div style={{ marginTop: '24px' }}>
                <SectionTitle icon={Calendar} text="Vigencia" />
                <div style={{ marginTop: '14px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                  <div>
                    <label style={labelStyle}>Fecha de Inicio</label>
                    <input name="fechaInicio" type="date" value={formData.fechaInicio} onChange={handleChange} style={inputBaseStyle} />
                  </div>
                  <div>
                    <label style={labelStyle}>Fecha de Fin</label>
                    <input name="fechaFin" type="date" value={formData.fechaFin} onChange={handleChange} style={{ ...inputBaseStyle, ...(formErrors.fechaFin ? inputErrorStyle : {}) }} />
                    {formErrors.fechaFin && <ErrorMsg text={formErrors.fechaFin} />}
                  </div>
                </div>
              </div>


            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', padding: '16px 24px', background: 'var(--gray-50)', borderTop: '1px solid var(--border)', flexShrink: 0 }}>
              <button onClick={handleCloseModal} disabled={submitting} style={{ padding: '9px 18px', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', background: '#fff', color: 'var(--gray-700)', fontSize: '14px', fontWeight: 600, fontFamily: "'DM Sans', sans-serif", cursor: 'pointer', transition: 'all 150ms ease' }} onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--gray-100)'; }} onMouseLeave={(e) => { e.currentTarget.style.background = '#fff'; }}>
                Cancelar
              </button>
              <button onClick={handleSubmit} disabled={submitting} style={{ padding: '9px 22px', border: 'none', borderRadius: 'var(--radius-md)', background: submitting ? 'var(--gray-300)' : 'linear-gradient(135deg, var(--capyme-blue-mid), var(--capyme-blue))', color: '#fff', fontSize: '14px', fontWeight: 600, fontFamily: "'DM Sans', sans-serif", cursor: submitting ? 'not-allowed' : 'pointer', boxShadow: submitting ? 'none' : '0 2px 8px rgba(31,78,158,0.28)', transition: 'all 150ms ease', display: 'flex', alignItems: 'center', gap: '8px' }}>
                {submitting && <span style={{ width: '14px', height: '14px', border: '2px solid rgba(255,255,255,0.4)', borderTopColor: '#fff', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.7s linear infinite' }} />}
                {submitting ? 'Guardando…' : modalMode === 'create' ? 'Crear Curso' : 'Guardar Cambios'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════ MODAL INSCRITOS ═══════════════════ */}
      {showInscritosModal && (
        <div onClick={() => setShowInscritosModal(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.42)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
          <div className="curso-modal" onClick={(e) => e.stopPropagation()} style={{ background: '#fff', borderRadius: 'var(--radius-lg)', width: '100%', maxWidth: '680px', maxHeight: '88vh', display: 'flex', flexDirection: 'column', boxShadow: '0 24px 64px rgba(0,0,0,0.18)', overflow: 'hidden' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 24px', background: 'var(--gray-50)', borderBottom: '1px solid var(--border)', flexShrink: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '36px', height: '36px', background: 'linear-gradient(135deg, var(--capyme-blue-mid), var(--capyme-blue))', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Users style={{ width: '18px', height: '18px', color: '#fff' }} />
                </div>
                <div>
                  <h2 style={{ fontSize: '16px', fontWeight: 800, color: 'var(--gray-900)', fontFamily: "'Plus Jakarta Sans', sans-serif", margin: 0 }}>Inscritos</h2>
                  <p style={{ fontSize: '12px', color: 'var(--gray-400)', margin: '2px 0 0', fontFamily: "'DM Sans', sans-serif", maxWidth: '380px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{inscritosCursoTitulo}</p>
                </div>
              </div>
              <button onClick={() => setShowInscritosModal(false)} style={{ width: '32px', height: '32px', border: 'none', borderRadius: 'var(--radius-sm)', background: 'transparent', cursor: 'pointer', color: 'var(--gray-400)', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 150ms ease' }} onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--gray-200)'; }} onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}>
                <X style={{ width: '18px', height: '18px' }} />
              </button>
            </div>
            <div style={{ overflowY: 'auto', flex: 1 }}>
              {inscritos.length === 0 ? (
                <div style={{ padding: '60px 20px', textAlign: 'center' }}>
                  <div style={{ width: '48px', height: '48px', background: 'var(--gray-100)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
                    <Users style={{ width: '22px', height: '22px', color: 'var(--gray-400)' }} />
                  </div>
                  <p style={{ fontSize: '14px', fontWeight: 600, color: 'var(--gray-600)', margin: '0 0 4px', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Sin inscritos</p>
                  <p style={{ fontSize: '13px', color: 'var(--gray-400)', margin: 0, fontFamily: "'DM Sans', sans-serif" }}>Aún no hay usuarios inscritos en este curso</p>
                </div>
              ) : (
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ background: 'var(--gray-50)', borderBottom: '1px solid var(--border)' }}>
                      {['Participante', 'Email', 'Negocio', 'Estado', 'Fecha'].map((h) => (
                        <th key={h} style={{ padding: '11px 16px', textAlign: 'left', fontSize: '11px', fontWeight: 700, color: 'var(--gray-500)', fontFamily: "'Plus Jakarta Sans', sans-serif", textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {inscritos.map((inscrito) => {
                      const es = getEstadoInscripcionStyle(inscrito.estado);
                      const iniciales = `${inscrito.usuario.nombre[0]}${inscrito.usuario.apellido[0]}`.toUpperCase();
                      return (
                        <tr key={inscrito.id} style={{ borderBottom: '1px solid var(--gray-100)' }}>
                          <td style={{ padding: '12px 16px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                              <div style={{ width: '32px', height: '32px', background: 'linear-gradient(135deg, var(--capyme-blue-mid), var(--capyme-blue))', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                <span style={{ fontSize: '11px', fontWeight: 700, color: '#fff', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{iniciales}</span>
                              </div>
                              <div>
                                <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--gray-900)', fontFamily: "'DM Sans', sans-serif" }}>{inscrito.usuario.nombre} {inscrito.usuario.apellido}</div>
                                {inscrito.usuario.telefono && <div style={{ fontSize: '11px', color: 'var(--gray-400)', fontFamily: "'DM Sans', sans-serif" }}>{inscrito.usuario.telefono}</div>}
                              </div>
                            </div>
                          </td>
                          <td style={{ padding: '12px 16px', fontSize: '13px', color: 'var(--gray-600)', fontFamily: "'DM Sans', sans-serif" }}>{inscrito.usuario.email}</td>
                          <td style={{ padding: '12px 16px', fontSize: '13px', color: 'var(--gray-600)', fontFamily: "'DM Sans', sans-serif" }}>{inscrito.negocio?.nombreNegocio || <span style={{ color: 'var(--gray-300)' }}>—</span>}</td>
                          <td style={{ padding: '12px 16px' }}>
                            <span style={{ display: 'inline-block', padding: '3px 8px', borderRadius: '20px', fontSize: '11px', fontWeight: 700, background: es.bg, color: es.color, fontFamily: "'Plus Jakarta Sans', sans-serif", textTransform: 'capitalize' }}>
                              {inscrito.estado?.replace('_', ' ')}
                            </span>
                          </td>
                          <td style={{ padding: '12px 16px', fontSize: '12px', color: 'var(--gray-500)', fontFamily: "'DM Sans', sans-serif", whiteSpace: 'nowrap' }}>{formatDate(inscrito.fechaInscripcion)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
            <div style={{ padding: '14px 24px', background: 'var(--gray-50)', borderTop: '1px solid var(--border)', flexShrink: 0, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '13px', color: 'var(--gray-500)', fontFamily: "'DM Sans', sans-serif" }}>{inscritos.length} inscrito{inscritos.length !== 1 ? 's' : ''}</span>
              <button onClick={() => setShowInscritosModal(false)} style={{ padding: '8px 18px', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', background: '#fff', color: 'var(--gray-700)', fontSize: '13px', fontWeight: 600, fontFamily: "'DM Sans', sans-serif", cursor: 'pointer', transition: 'all 150ms ease' }} onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--gray-100)'; }} onMouseLeave={(e) => { e.currentTarget.style.background = '#fff'; }}>
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════ MODAL PAGOS PENDIENTES (ADMIN) ═══════════════════ */}
      {showPagosModal && (
        <div onClick={() => setShowPagosModal(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.42)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
          <div className="curso-modal" onClick={(e) => e.stopPropagation()} style={{ background: '#fff', borderRadius: 'var(--radius-lg)', width: '100%', maxWidth: '780px', maxHeight: '90vh', display: 'flex', flexDirection: 'column', boxShadow: '0 24px 64px rgba(0,0,0,0.18)', overflow: 'hidden' }}>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 24px', background: '#FFF7ED', borderBottom: '1px solid #FED7AA', flexShrink: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '36px', height: '36px', background: 'linear-gradient(135deg, #FB923C, #EA580C)', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <CreditCard style={{ width: '18px', height: '18px', color: '#fff' }} />
                </div>
                <div>
                  <h2 style={{ fontSize: '17px', fontWeight: 800, color: '#9A3412', fontFamily: "'Plus Jakarta Sans', sans-serif", margin: 0 }}>Pagos pendientes de inscripciones</h2>
                  <p style={{ fontSize: '12px', color: '#C2410C', margin: '2px 0 0', fontFamily: "'DM Sans', sans-serif" }}>
                    {pagosPendientes.length} pago{pagosPendientes.length !== 1 ? 's' : ''} por confirmar
                  </p>
                </div>
              </div>
              <button onClick={() => setShowPagosModal(false)} style={{ width: '32px', height: '32px', border: 'none', borderRadius: 'var(--radius-sm)', background: 'transparent', cursor: 'pointer', color: '#C2410C', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 150ms ease' }} onMouseEnter={(e) => { e.currentTarget.style.background = '#FFEDD5'; }} onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}>
                <X style={{ width: '18px', height: '18px' }} />
              </button>
            </div>

            {pagosPendientes.length > 0 && (
              <div style={{ padding: '12px 24px', background: '#FFFBEB', borderBottom: '1px solid #FDE68A', flexShrink: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <AlertTriangle style={{ width: '14px', height: '14px', color: '#B45309', flexShrink: 0 }} />
                <span style={{ fontSize: '12px', color: '#92400E', fontFamily: "'DM Sans', sans-serif", lineHeight: 1.4 }}>
                  Verifica cada transferencia en tu portal bancario antes de confirmar. Para pagos en efectivo, confirma únicamente si ya recibiste el dinero físicamente.
                </span>
              </div>
            )}

            <div style={{ overflowY: 'auto', flex: 1 }}>
              {pagosPendientes.length === 0 ? (
                <div style={{ padding: '60px 20px', textAlign: 'center' }}>
                  <div style={{ width: '56px', height: '56px', background: '#F0FDF4', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' }}>
                    <CheckCircle style={{ width: '26px', height: '26px', color: '#16A34A' }} />
                  </div>
                  <p style={{ fontSize: '15px', fontWeight: 600, color: 'var(--gray-700)', margin: '0 0 6px', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Sin pagos pendientes</p>
                  <p style={{ fontSize: '13px', color: 'var(--gray-400)', margin: 0, fontFamily: "'DM Sans', sans-serif" }}>Todos los pagos han sido confirmados</p>
                </div>
              ) : (
                <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {pagosPendientes.map((pago) => {
                    const esSpei = pago.tipoPago === 'spei';
                    const estaConfirmando = confirmandoPago === pago.id;
                    return (
                      <div key={pago.id} style={{ border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', overflow: 'hidden', background: '#fff' }}>
                        <div style={{ padding: '16px 20px', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap' }}>
                          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px', flex: 1, minWidth: '260px' }}>
                            <div style={{ width: '40px', height: '40px', background: esSpei ? '#EEF4FF' : '#F0FDF4', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                              {esSpei
                                ? <Banknote style={{ width: '18px', height: '18px', color: 'var(--capyme-blue-mid)' }} />
                                : <DollarSign style={{ width: '18px', height: '18px', color: '#16A34A' }} />
                              }
                            </div>
                            <div style={{ flex: 1 }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px', flexWrap: 'wrap' }}>
                                <span style={{ fontSize: '15px', fontWeight: 700, color: 'var(--gray-900)', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                                  {pago.inscripcion.usuario.nombre} {pago.inscripcion.usuario.apellido}
                                </span>
                                <span style={{ padding: '2px 8px', borderRadius: '20px', fontSize: '11px', fontWeight: 700, background: esSpei ? '#EEF4FF' : '#F0FDF4', color: esSpei ? 'var(--capyme-blue-mid)' : '#16A34A', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                                  {esSpei ? 'SPEI' : 'Efectivo'}
                                </span>
                              </div>
                              <div style={{ fontSize: '13px', color: 'var(--gray-500)', fontFamily: "'DM Sans', sans-serif", marginBottom: '2px' }}>
                                {pago.inscripcion.curso.titulo}
                              </div>
                              {pago.inscripcion.usuario.email && (
                                <div style={{ fontSize: '12px', color: 'var(--gray-400)', fontFamily: "'DM Sans', sans-serif" }}>{pago.inscripcion.usuario.email}</div>
                              )}
                              {pago.inscripcion.usuario.telefono && (
                                <div style={{ fontSize: '12px', color: 'var(--gray-400)', fontFamily: "'DM Sans', sans-serif" }}>{pago.inscripcion.usuario.telefono}</div>
                              )}
                            </div>
                          </div>

                          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px', flexShrink: 0 }}>
                            <span style={{ fontSize: '20px', fontWeight: 800, color: 'var(--gray-900)', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                              {formatCurrency(pago.monto)}
                            </span>
                            <div style={{ textAlign: 'right' }}>
                              <div style={{ fontSize: '10px', color: 'var(--gray-400)', fontFamily: "'DM Sans', sans-serif", fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '2px' }}>Referencia</div>
                              <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--gray-800)', fontFamily: "'JetBrains Mono', monospace", letterSpacing: '0.04em' }}>{pago.referencia}</div>
                            </div>
                            <div style={{ fontSize: '11px', color: 'var(--gray-400)', fontFamily: "'DM Sans', sans-serif" }}>
                              Solicitado: {formatDate(pago.fechaCreacion)}
                            </div>
                          </div>
                        </div>

                        {pago.notas && (
                          <div style={{ padding: '10px 20px', background: 'var(--gray-50)', borderTop: '1px solid var(--gray-100)', fontSize: '12px', color: 'var(--gray-500)', fontFamily: "'DM Sans', sans-serif" }}>
                            Nota: {pago.notas}
                          </div>
                        )}

                        <div style={{ padding: '12px 20px', background: 'var(--gray-50)', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'flex-end' }}>
                          <button
                            onClick={() => handleConfirmarPago(pago)}
                            disabled={estaConfirmando}
                            style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '9px 20px', border: 'none', borderRadius: 'var(--radius-md)', background: estaConfirmando ? 'var(--gray-300)' : 'linear-gradient(135deg, #16A34A, #15803D)', color: '#fff', fontSize: '13px', fontWeight: 600, fontFamily: "'DM Sans', sans-serif", cursor: estaConfirmando ? 'not-allowed' : 'pointer', boxShadow: estaConfirmando ? 'none' : '0 2px 8px rgba(22,163,74,0.28)', transition: 'all 150ms ease' }}
                            onMouseEnter={(e) => { if (!estaConfirmando) e.currentTarget.style.opacity = '0.9'; }}
                            onMouseLeave={(e) => { e.currentTarget.style.opacity = '1'; }}
                          >
                            {estaConfirmando
                              ? <><span style={{ width: '13px', height: '13px', border: '2px solid rgba(255,255,255,0.4)', borderTopColor: '#fff', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.7s linear infinite' }} />Confirmando...</>
                              : <><CheckCircle style={{ width: '15px', height: '15px' }} />Confirmar pago recibido</>
                            }
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div style={{ padding: '14px 24px', background: 'var(--gray-50)', borderTop: '1px solid var(--border)', flexShrink: 0, display: 'flex', justifyContent: 'flex-end' }}>
              <button onClick={() => setShowPagosModal(false)} style={{ padding: '8px 18px', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', background: '#fff', color: 'var(--gray-700)', fontSize: '13px', fontWeight: 600, fontFamily: "'DM Sans', sans-serif", cursor: 'pointer', transition: 'all 150ms ease' }} onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--gray-100)'; }} onMouseLeave={(e) => { e.currentTarget.style.background = '#fff'; }}>
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};

const SectionTitle = ({ icon: Icon, text }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', paddingBottom: '4px', borderBottom: '1px solid var(--gray-100)' }}>
    <Icon style={{ width: '14px', height: '14px', color: 'var(--gray-400)' }} />
    <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--gray-400)', textTransform: 'uppercase', letterSpacing: '0.06em', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{text}</span>
  </div>
);

const ErrorMsg = ({ text }) => (
  <p style={{ marginTop: '4px', fontSize: '12px', color: '#EF4444', display: 'flex', alignItems: 'center', gap: '4px', fontFamily: "'DM Sans', sans-serif" }}>
    <AlertCircle style={{ width: '12px', height: '12px' }} /> {text}
  </p>
);

export default Cursos;