import { useState, useEffect } from 'react';
import Layout from '../components/common/Layout';
import { enlacesService } from '../services/enlacesService';
import {
  Link2,
  Plus,
  Search,
  Edit,
  X,
  ExternalLink,
  Video,
  FileText,
  DollarSign,
  ChevronDown,
  AlertCircle,
  ShoppingBag,
  Eye,
  EyeOff,
  AlertTriangle,
} from 'lucide-react';
import { toast } from 'react-hot-toast';

const initialFormData = {
  titulo: '',
  descripcion: '',
  url: '',
  tipo: 'otro',
  categoria: '',
  visiblePara: 'todos',
  activo: true,
};

/* ─── Modal de confirmación reutilizable ─────────────────── */
const ConfirmModal = ({ config, onClose }) => {
  if (!config?.show) return null;
  const isDanger  = config.variant === 'danger';
  const isWarning = config.variant === 'warning';

  const accentBg     = isDanger ? '#FEF2F2' : isWarning ? '#FFFBEB' : '#EEF4FF';
  const accentBorder = isDanger ? '#FECACA' : isWarning ? '#FDE68A' : 'var(--border)';
  const iconBg       = isDanger ? '#EF4444' : isWarning ? '#F59E0B' : 'var(--capyme-blue-mid)';
  const titleColor   = isDanger ? '#B91C1C' : isWarning ? '#92400E' : 'var(--gray-900)';
  const subtitleColor= isDanger ? '#DC2626' : isWarning ? '#B45309' : 'var(--gray-500)';
  const btnBg        = isDanger
    ? 'linear-gradient(135deg,#EF4444,#DC2626)'
    : isWarning
      ? 'linear-gradient(135deg,#F59E0B,#D97706)'
      : 'linear-gradient(135deg,var(--capyme-blue-mid),var(--capyme-blue))';
  const btnShadow    = isDanger
    ? '0 2px 8px rgba(239,68,68,0.35)'
    : isWarning
      ? '0 2px 8px rgba(245,158,11,0.35)'
      : '0 2px 8px rgba(31,78,158,0.28)';

  return (
    <div
      onClick={onClose}
      style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.45)', backdropFilter:'blur(4px)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:1200, padding:'20px' }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{ background:'#fff', borderRadius:'var(--radius-lg)', width:'100%', maxWidth:'440px', boxShadow:'0 24px 64px rgba(0,0,0,0.22)', overflow:'hidden', animation:'modalIn 0.22s ease both' }}
      >
        <div style={{ background:accentBg, padding:'20px 24px', borderBottom:`1px solid ${accentBorder}`, display:'flex', alignItems:'center', gap:'14px' }}>
          <div style={{ width:'44px', height:'44px', background:iconBg, borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, boxShadow:`0 4px 12px ${iconBg}40` }}>
            <AlertTriangle style={{ width:'22px', height:'22px', color:'#fff' }} />
          </div>
          <div>
            <h3 style={{ fontSize:'17px', fontWeight:800, color:titleColor, fontFamily:"'Plus Jakarta Sans', sans-serif", margin:'0 0 2px' }}>
              {config.title}
            </h3>
            <p style={{ fontSize:'13px', color:subtitleColor, margin:0, fontFamily:"'DM Sans', sans-serif", fontWeight:500 }}>
              {config.subtitle || 'Esta acción puede revertirse más adelante'}
            </p>
          </div>
        </div>
        <div style={{ padding:'20px 24px' }}>
          {config.message && (
            <div style={{ background:'var(--gray-50)', border:'1px solid var(--border)', borderRadius:'var(--radius-md)', padding:'14px 16px', marginBottom:'20px' }}>
              <p style={{ fontSize:'14px', color:'var(--gray-700)', margin:0, fontFamily:"'DM Sans', sans-serif", lineHeight:1.5 }}>
                {config.message}
              </p>
            </div>
          )}
          <div style={{ display:'flex', gap:'10px', justifyContent:'flex-end' }}>
            <button
              onClick={onClose}
              style={{ padding:'9px 18px', border:'1px solid var(--border)', borderRadius:'var(--radius-md)', background:'#fff', color:'var(--gray-700)', fontSize:'14px', fontWeight:600, fontFamily:"'DM Sans', sans-serif", cursor:'pointer', transition:'all 150ms ease' }}
              onMouseEnter={e => e.currentTarget.style.background = 'var(--gray-100)'}
              onMouseLeave={e => e.currentTarget.style.background = '#fff'}
            >
              Cancelar
            </button>
            <button
              onClick={() => { config.onConfirm(); onClose(); }}
              style={{ padding:'9px 22px', border:'none', borderRadius:'var(--radius-md)', background:btnBg, color:'#fff', fontSize:'14px', fontWeight:600, fontFamily:"'DM Sans', sans-serif", cursor:'pointer', boxShadow:btnShadow, transition:'all 150ms ease' }}
              onMouseEnter={e => e.currentTarget.style.opacity = '0.9'}
              onMouseLeave={e => e.currentTarget.style.opacity = '1'}
            >
              {config.confirmLabel || 'Confirmar'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const ErrorMsg = ({ text }) => (
  <p style={{ marginTop: '4px', fontSize: '12px', color: '#EF4444', display: 'flex', alignItems: 'center', gap: '4px', fontFamily: "'DM Sans', sans-serif" }}>
    <AlertCircle style={{ width: '12px', height: '12px' }} /> {text}
  </p>
);

const Enlaces = () => {
  const authStorage = JSON.parse(localStorage.getItem('auth-storage') || '{}');
  const currentUser = authStorage?.state?.user || {};

  const [enlaces, setEnlaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('create');
  const [selectedEnlace, setSelectedEnlace] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterTipo, setFilterTipo] = useState('');
  const [filterActivo, setFilterActivo] = useState('');
  const [hoveredCard, setHoveredCard] = useState(null);
  const [formData, setFormData] = useState(initialFormData);
  const [formErrors, setFormErrors] = useState({});

  /* ── Modal de confirmación ── */
  const [confirmConfig, setConfirmConfig] = useState({ show: false });
  const showConfirm = (cfg) => setConfirmConfig({ show: true, ...cfg });
  const closeConfirm = () => setConfirmConfig({ show: false });

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

  useEffect(() => { cargarEnlaces(); }, [filterTipo, filterActivo]);

  const cargarEnlaces = async () => {
    try {
      setLoading(true);
      const params = {};
      if (filterTipo) params.tipo = filterTipo;
      if (filterActivo !== '') params.activo = filterActivo;
      const res = await enlacesService.getAll(params);
      setEnlaces(res.data);
    } catch { toast.error('Error al cargar catálogos'); }
    finally { setLoading(false); }
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.titulo.trim()) errors.titulo = 'El título es requerido';
    if (!formData.url.trim()) errors.url = 'La URL es requerida';
    else if (!/^https?:\/\/.+/.test(formData.url)) errors.url = 'Ingresa una URL válida (https://...)';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleOpenModal = (mode, enlace = null) => {
    setModalMode(mode);
    setSelectedEnlace(enlace);
    setFormErrors({});
    if (mode === 'edit' && enlace) {
      setFormData({
        titulo: enlace.titulo || '',
        descripcion: enlace.descripcion || '',
        url: enlace.url || '',
        tipo: enlace.tipo || 'otro',
        categoria: enlace.categoria || '',
        visiblePara: enlace.visiblePara || 'todos',
        activo: enlace.activo ?? true,
      });
    } else {
      setFormData(initialFormData);
    }
    setShowModal(true);
  };

  const handleCloseModal = () => { setShowModal(false); setSelectedEnlace(null); setFormErrors({}); };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    if (formErrors[name]) setFormErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    setSubmitting(true);
    try {
      const dataToSend = {
        ...formData,
        activo: formData.activo === true || formData.activo === 'true',
        descripcion: formData.descripcion || null,
        categoria: formData.categoria || null,
      };
      if (modalMode === 'create') {
        await enlacesService.create(dataToSend);
        toast.success('Catálogo creado exitosamente');
      } else {
        await enlacesService.update(selectedEnlace.id, dataToSend);
        toast.success('Catálogo actualizado exitosamente');
      }
      handleCloseModal();
      cargarEnlaces();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error al guardar catálogo');
    } finally { setSubmitting(false); }
  };

  /* ── Toggle con ConfirmModal ── */
  const handleToggleActivo = (enlace) => {
    const desactivar = enlace.activo;
    showConfirm({
      variant: desactivar ? 'danger' : 'warning',
      title: desactivar ? 'Desactivar catálogo' : 'Activar catálogo',
      subtitle: desactivar
        ? 'El catálogo dejará de ser visible para los usuarios'
        : 'El catálogo volverá a estar disponible',
      message: `¿Confirmas que deseas ${desactivar ? 'desactivar' : 'activar'} "${enlace.titulo}"?`,
      confirmLabel: desactivar ? 'Sí, desactivar' : 'Sí, activar',
      onConfirm: async () => {
        try {
          await enlacesService.toggleActivo(enlace.id);
          toast.success(`Catálogo ${desactivar ? 'desactivado' : 'activado'} exitosamente`);
          cargarEnlaces();
        } catch { toast.error('Error al cambiar estado del catálogo'); }
      },
    });
  };

  const enlacesFiltrados = enlaces.filter((e) =>
    e.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (e.descripcion || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (e.categoria || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getTipoStyle = (tipo) => ({
    video:          { bg: '#FEF2F2', color: '#DC2626', icon: Video },
    financiamiento: { bg: '#F0FDF4', color: '#16A34A', icon: DollarSign },
    documento:      { bg: '#EEF4FF', color: 'var(--capyme-blue-mid)', icon: FileText },
    otro:           { bg: 'var(--gray-100)', color: 'var(--gray-600)', icon: Link2 },
  }[tipo] || { bg: 'var(--gray-100)', color: 'var(--gray-600)', icon: Link2 });

  const getTipoLabel = (tipo) => ({ video: 'Video', financiamiento: 'Financiamiento', documento: 'Documento', otro: 'Otro' }[tipo] || tipo);

  const getVisibleStyle = (v) => ({
    todos:         { bg: '#F5F3FF', color: '#7C3AED' },
    clientes:      { bg: '#F0FDF4', color: '#16A34A' },
    colaboradores: { bg: '#EEF4FF', color: 'var(--capyme-blue-mid)' },
    admin:         { bg: '#FEF2F2', color: '#DC2626' },
  }[v] || { bg: 'var(--gray-100)', color: 'var(--gray-600)' });

  const getVisibleLabel = (v) => ({ todos: 'Todos', clientes: 'Clientes', colaboradores: 'Colaboradores', admin: 'Admin' }[v] || v);

  if (loading) return (
    <Layout>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '300px', flexDirection: 'column', gap: '16px' }}>
        <div style={{ width: '40px', height: '40px', border: '3px solid var(--gray-200)', borderTopColor: 'var(--capyme-blue-mid)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
        <span style={{ fontSize: '14px', color: 'var(--gray-500)', fontFamily: "'DM Sans', sans-serif" }}>Cargando catálogos...</span>
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
        .enlace-card { animation: fadeInUp 0.3s ease both; transition: box-shadow 200ms ease, transform 200ms ease; }
        .enlace-card:hover { box-shadow: 0 8px 24px rgba(31,78,158,0.10); transform: translateY(-2px); }
        .enlace-modal { animation: modalIn 0.25s ease both; }
        div:hover > .prohibido-icon { opacity: 1 !important; }
      `}</style>

      <div style={{ padding: '0 0 40px' }}>

        {/* ── HEADER ── */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '28px', flexWrap: 'wrap', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{ width: '46px', height: '46px', background: 'linear-gradient(135deg, var(--capyme-blue-mid), var(--capyme-blue))', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(31,78,158,0.25)' }}>
              <ShoppingBag style={{ width: '22px', height: '22px', color: '#fff' }} />
            </div>
            <div>
              <h1 style={{ fontSize: '22px', fontWeight: 800, color: 'var(--gray-900)', fontFamily: "'Plus Jakarta Sans', sans-serif", margin: 0, lineHeight: 1.2 }}>Catálogos y Recursos</h1>
              <p style={{ fontSize: '13px', color: 'var(--gray-500)', margin: '3px 0 0', fontFamily: "'DM Sans', sans-serif" }}>
                {enlaces.length} catálogo{enlaces.length !== 1 ? 's' : ''} registrado{enlaces.length !== 1 ? 's' : ''}
              </p>
            </div>
          </div>
          <button
            onClick={() => handleOpenModal('create')}
            style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 18px', background: 'linear-gradient(135deg, var(--capyme-blue-mid), var(--capyme-blue))', color: '#fff', border: 'none', borderRadius: 'var(--radius-md)', fontSize: '14px', fontWeight: 600, fontFamily: "'DM Sans', sans-serif", cursor: 'pointer', boxShadow: '0 2px 8px rgba(31,78,158,0.28)', transition: 'all 150ms ease' }}
            onMouseEnter={(e) => { e.currentTarget.style.opacity = '0.9'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.opacity = '1'; e.currentTarget.style.transform = 'translateY(0)'; }}
          >
            <Plus style={{ width: '16px', height: '16px' }} />
            Nuevo Catálogo
          </button>
        </div>

        {/* ── STATS ── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '12px', marginBottom: '20px' }}>
          {[
            { label: 'Total',           value: enlaces.length,                                    color: 'var(--capyme-blue-mid)', bg: 'var(--capyme-blue-pale)' },
            { label: 'Activos',         value: enlaces.filter((e) => e.activo).length,            color: '#16A34A', bg: '#F0FDF4' },
            { label: 'Inactivos',       value: enlaces.filter((e) => !e.activo).length,           color: '#DC2626', bg: '#FEF2F2' },
            { label: 'Visibles a todos',value: enlaces.filter((e) => e.visiblePara === 'todos').length, color: '#7C3AED', bg: '#F5F3FF' },
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
            <input type="text" placeholder="Buscar catálogo, descripción o categoría…" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} style={inputWithIconStyle} />
          </div>
          <div style={{ position: 'relative', minWidth: '150px' }}>
            <select value={filterTipo} onChange={(e) => setFilterTipo(e.target.value)} style={{ ...selectStyle, width: '100%' }}>
              <option value="">Todos los tipos</option>
              <option value="video">Video</option>
              <option value="financiamiento">Financiamiento</option>
              <option value="documento">Documento</option>
              <option value="otro">Otro</option>
            </select>
            <ChevronDown style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', width: '14px', height: '14px', color: 'var(--gray-400)', pointerEvents: 'none' }} />
          </div>
          <div style={{ position: 'relative', minWidth: '140px' }}>
            <select value={filterActivo} onChange={(e) => setFilterActivo(e.target.value)} style={{ ...selectStyle, width: '100%' }}>
              <option value="">Activo / Inactivo</option>
              <option value="true">Activos</option>
              <option value="false">Inactivos</option>
            </select>
            <ChevronDown style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', width: '14px', height: '14px', color: 'var(--gray-400)', pointerEvents: 'none' }} />
          </div>
        </div>

        {/* ── GRID ── */}
        {enlacesFiltrados.length === 0 ? (
          <div style={{ background: '#fff', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '60px 20px', textAlign: 'center', boxShadow: 'var(--shadow-sm)' }}>
            <div style={{ width: '56px', height: '56px', background: 'var(--gray-100)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' }}>
              <ShoppingBag style={{ width: '24px', height: '24px', color: 'var(--gray-400)' }} />
            </div>
            <p style={{ fontSize: '15px', fontWeight: 600, color: 'var(--gray-700)', margin: '0 0 6px', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>No se encontraron catálogos</p>
            <p style={{ fontSize: '13px', color: 'var(--gray-400)', margin: 0, fontFamily: "'DM Sans', sans-serif" }}>Intenta con otros filtros o agrega un nuevo catálogo</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
            {enlacesFiltrados.map((enlace, idx) => {
              const ts = getTipoStyle(enlace.tipo);
              const vs = getVisibleStyle(enlace.visiblePara);
              const TIcon = ts.icon;
              return (
                <div
                  key={enlace.id}
                  className="enlace-card"
                  style={{ background: '#fff', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', overflow: 'hidden', animationDelay: `${idx * 40}ms`, opacity: enlace.activo ? 1 : 0.6 }}
                  onMouseEnter={() => setHoveredCard(enlace.id)}
                  onMouseLeave={() => setHoveredCard(null)}
                >
                  <div style={{ height: '4px', background: enlace.activo ? 'linear-gradient(90deg, var(--capyme-blue-mid), var(--capyme-blue))' : 'var(--gray-200)' }} />
                  <div style={{ padding: '20px' }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', marginBottom: '14px' }}>
                      <div style={{ width: '40px', height: '40px', background: ts.bg, borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <TIcon style={{ width: '18px', height: '18px', color: ts.color }} />
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <h3 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--gray-900)', fontFamily: "'Plus Jakarta Sans', sans-serif", margin: '0 0 6px', lineHeight: 1.3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{enlace.titulo}</h3>
                        <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap' }}>
                          <span style={{ padding: '2px 8px', borderRadius: '20px', fontSize: '11px', fontWeight: 700, background: ts.bg, color: ts.color, fontFamily: "'Plus Jakarta Sans', sans-serif", textTransform: 'uppercase', letterSpacing: '0.03em' }}>
                            {getTipoLabel(enlace.tipo)}
                          </span>
                          <span style={{ padding: '2px 8px', borderRadius: '20px', fontSize: '11px', fontWeight: 700, background: vs.bg, color: vs.color, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                            {getVisibleLabel(enlace.visiblePara)}
                          </span>
                          <span style={{ padding: '2px 8px', borderRadius: '20px', fontSize: '11px', fontWeight: 700, background: enlace.activo ? '#ECFDF5' : '#FEF2F2', color: enlace.activo ? '#065F46' : '#DC2626', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                            {enlace.activo ? '● Activo' : '● Inactivo'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {enlace.descripcion && (
                      <p style={{ fontSize: '13px', color: 'var(--gray-500)', margin: '0 0 12px', fontFamily: "'DM Sans', sans-serif", lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                        {enlace.descripcion}
                      </p>
                    )}

                    {enlace.categoria && (
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '3px 10px', background: 'var(--gray-100)', borderRadius: '20px', marginBottom: '14px' }}>
                        <span style={{ fontSize: '12px', color: 'var(--gray-600)', fontFamily: "'DM Sans', sans-serif", fontWeight: 600 }}>{enlace.categoria}</span>
                      </div>
                    )}

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', paddingTop: '14px', borderTop: '1px solid var(--gray-100)' }}>
                      <a
                        href={enlace.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '7px', padding: '8px 14px', background: 'var(--capyme-blue-pale)', color: 'var(--capyme-blue-mid)', border: 'none', borderRadius: 'var(--radius-md)', fontSize: '13px', fontWeight: 600, fontFamily: "'DM Sans', sans-serif", textDecoration: 'none', transition: 'all 150ms ease' }}
                        onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--capyme-blue-mid)'; e.currentTarget.style.color = '#fff'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.background = 'var(--capyme-blue-pale)'; e.currentTarget.style.color = 'var(--capyme-blue-mid)'; }}
                      >
                        <ExternalLink style={{ width: '14px', height: '14px' }} />
                        Abrir catálogo
                      </a>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <button
                          onClick={() => handleOpenModal('edit', enlace)}
                          style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', padding: '7px 12px', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', background: 'transparent', cursor: 'pointer', color: 'var(--gray-600)', fontSize: '12px', fontFamily: "'DM Sans', sans-serif", fontWeight: 600, transition: 'all 150ms ease' }}
                          onMouseEnter={(e) => { e.currentTarget.style.background = '#EEF4FF'; e.currentTarget.style.color = 'var(--capyme-blue-mid)'; e.currentTarget.style.borderColor = 'var(--capyme-blue-mid)'; }}
                          onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--gray-600)'; e.currentTarget.style.borderColor = 'var(--border)'; }}
                        >
                          <Edit style={{ width: '13px', height: '13px' }} />
                          Editar
                        </button>
                        {currentUser.rol === 'admin' && (
                          <button
                            onClick={() => handleToggleActivo(enlace)}
                            style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', padding: '7px 12px', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', background: 'transparent', cursor: 'pointer', color: 'var(--gray-600)', fontSize: '12px', fontFamily: "'DM Sans', sans-serif", fontWeight: 600, transition: 'all 150ms ease' }}
                            onMouseEnter={(e) => { const c = enlace.activo; e.currentTarget.style.background = c ? '#FEF2F2' : '#ECFDF5'; e.currentTarget.style.color = c ? '#DC2626' : '#16A34A'; e.currentTarget.style.borderColor = c ? '#DC2626' : '#16A34A'; }}
                            onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--gray-600)'; e.currentTarget.style.borderColor = 'var(--border)'; }}
                          >
                            {enlace.activo
                              ? <><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/></svg>Desactivar</>
                              : <><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>Activar</>
                            }
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ═══════════════════ MODAL CREAR / EDITAR ═══════════════════ */}
      {showModal && (
        <div onClick={handleCloseModal} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.42)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
          <div className="enlace-modal" onClick={(e) => e.stopPropagation()} style={{ background: '#fff', borderRadius: 'var(--radius-lg)', width: '100%', maxWidth: '580px', maxHeight: '92vh', display: 'flex', flexDirection: 'column', boxShadow: '0 24px 64px rgba(0,0,0,0.18)', overflow: 'hidden' }}>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 24px', background: 'var(--gray-50)', borderBottom: '1px solid var(--border)', flexShrink: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '36px', height: '36px', background: 'linear-gradient(135deg, var(--capyme-blue-mid), var(--capyme-blue))', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <ShoppingBag style={{ width: '18px', height: '18px', color: '#fff' }} />
                </div>
                <h2 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--gray-900)', fontFamily: "'Plus Jakarta Sans', sans-serif", margin: 0 }}>
                  {modalMode === 'create' ? 'Nuevo Catálogo' : 'Editar Catálogo'}
                </h2>
              </div>
              <button onClick={handleCloseModal} style={{ width: '32px', height: '32px', border: 'none', borderRadius: 'var(--radius-sm)', background: 'transparent', cursor: 'pointer', color: 'var(--gray-400)', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 150ms ease' }} onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--gray-200)'; e.currentTarget.style.color = 'var(--gray-700)'; }} onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--gray-400)'; }}>
                <X style={{ width: '18px', height: '18px' }} />
              </button>
            </div>

            <div style={{ overflowY: 'auto', flex: 1, padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={labelStyle}>Título <span style={{ color: '#EF4444' }}>*</span></label>
                <input name="titulo" type="text" value={formData.titulo} onChange={handleChange} placeholder="Ej. Catálogo de productos 2025" style={{ ...inputBaseStyle, ...(formErrors.titulo ? inputErrorStyle : {}) }} />
                {formErrors.titulo && <ErrorMsg text={formErrors.titulo} />}
              </div>

              <div>
                <label style={labelStyle}>URL del catálogo <span style={{ color: '#EF4444' }}>*</span></label>
                <div style={{ position: 'relative' }}>
                  <ExternalLink style={{ position: 'absolute', left: '11px', top: '50%', transform: 'translateY(-50%)', width: '14px', height: '14px', color: 'var(--gray-400)', pointerEvents: 'none' }} />
                  <input name="url" type="text" value={formData.url} onChange={handleChange} placeholder="https://..." style={{ ...inputWithIconStyle, ...(formErrors.url ? inputErrorStyle : {}) }} />
                </div>
                {formErrors.url && <ErrorMsg text={formErrors.url} />}
              </div>

              <div>
                <label style={labelStyle}>Descripción</label>
                <textarea name="descripcion" value={formData.descripcion} onChange={handleChange} placeholder="Describe brevemente este catálogo…" style={textareaStyle} />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                <div>
                  <label style={labelStyle}>Tipo</label>
                  <div style={{ position: 'relative' }}>
                    <select name="tipo" value={formData.tipo} onChange={handleChange} style={selectStyle}>
                      <option value="video">Video</option>
                      <option value="financiamiento">Financiamiento</option>
                      <option value="documento">Documento</option>
                      <option value="otro">Otro</option>
                    </select>
                    <ChevronDown style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', width: '14px', height: '14px', color: 'var(--gray-400)', pointerEvents: 'none' }} />
                  </div>
                </div>
                <div>
                  <label style={labelStyle}>Categoría</label>
                  <input name="categoria" type="text" value={formData.categoria} onChange={handleChange} placeholder="Ej: Marketing, Finanzas" style={inputBaseStyle} />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                <div>
                  <label style={labelStyle}>Visible para</label>
                  <div style={{ position: 'relative' }}>
                    <select name="visiblePara" value={formData.visiblePara} onChange={handleChange} style={selectStyle}>
                      <option value="todos">Todos</option>
                      <option value="clientes">Clientes</option>
                      <option value="colaboradores">Colaboradores</option>
                      <option value="admin">Admin</option>
                    </select>
                    <ChevronDown style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', width: '14px', height: '14px', color: 'var(--gray-400)', pointerEvents: 'none' }} />
                  </div>
                </div>
                <div>
                  <label style={{ ...labelStyle, display: 'flex', alignItems: 'center', gap: '6px' }}>
                    Estado
                    {currentUser.rol === 'colaborador' && (
                      <span title="Solo el administrador puede cambiar el estado" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '16px', height: '16px', borderRadius: '50%', background: '#FEF2F2', cursor: 'not-allowed', flexShrink: 0 }}>
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#DC2626" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <circle cx="12" cy="12" r="10"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/>
                        </svg>
                      </span>
                    )}
                  </label>
                  {currentUser.rol === 'colaborador' ? (
                    <div title="Solo el administrador puede cambiar el estado" style={{ ...inputBaseStyle, display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--gray-50)', cursor: 'not-allowed', userSelect: 'none', color: 'var(--gray-500)' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
                        <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: formData.activo === true || formData.activo === 'true' ? '#16A34A' : '#DC2626', flexShrink: 0, display: 'inline-block' }} />
                        {formData.activo === true || formData.activo === 'true' ? 'Activo' : 'Inactivo'}
                      </span>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#DC2626" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0, transition: 'opacity 150ms ease' }} className="prohibido-icon">
                        <circle cx="12" cy="12" r="10"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/>
                      </svg>
                    </div>
                  ) : (
                    <div style={{ position: 'relative' }}>
                      <select name="activo" value={String(formData.activo)} onChange={(e) => setFormData((prev) => ({ ...prev, activo: e.target.value === 'true' }))} style={selectStyle}>
                        <option value="true">Activo</option>
                        <option value="false">Inactivo</option>
                      </select>
                      <ChevronDown style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', width: '14px', height: '14px', color: 'var(--gray-400)', pointerEvents: 'none' }} />
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', padding: '16px 24px', background: 'var(--gray-50)', borderTop: '1px solid var(--border)', flexShrink: 0 }}>
              <button onClick={handleCloseModal} disabled={submitting} style={{ padding: '9px 18px', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', background: '#fff', color: 'var(--gray-700)', fontSize: '14px', fontWeight: 600, fontFamily: "'DM Sans', sans-serif", cursor: 'pointer', transition: 'all 150ms ease' }} onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--gray-100)'; }} onMouseLeave={(e) => { e.currentTarget.style.background = '#fff'; }}>
                Cancelar
              </button>
              <button onClick={handleSubmit} disabled={submitting} style={{ padding: '9px 22px', border: 'none', borderRadius: 'var(--radius-md)', background: submitting ? 'var(--gray-300)' : 'linear-gradient(135deg, var(--capyme-blue-mid), var(--capyme-blue))', color: '#fff', fontSize: '14px', fontWeight: 600, fontFamily: "'DM Sans', sans-serif", cursor: submitting ? 'not-allowed' : 'pointer', boxShadow: submitting ? 'none' : '0 2px 8px rgba(31,78,158,0.28)', transition: 'all 150ms ease', display: 'flex', alignItems: 'center', gap: '8px' }}>
                {submitting && <span style={{ width: '14px', height: '14px', border: '2px solid rgba(255,255,255,0.4)', borderTopColor: '#fff', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.7s linear infinite' }} />}
                {submitting ? 'Guardando…' : modalMode === 'create' ? 'Crear Catálogo' : 'Guardar Cambios'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ═══ MODAL CONFIRMACIÓN ═══ */}
      <ConfirmModal config={confirmConfig} onClose={closeConfirm} />
    </Layout>
  );
};

export default Enlaces;