import { useState, useEffect } from 'react';
import Layout from '../components/common/Layout';
import { avisosService } from '../services/avisosService';
import {
  BellRing,
  Plus,
  Search,
  Edit,
  Trash2,
  CheckCircle,
  X,
  AlertCircle,
  Info,
  Calendar,
  Users,
  Tag,
  Link,
  ChevronDown,
  AlertTriangle,
} from 'lucide-react';
import { toast } from 'react-hot-toast';

const initialFormData = {
  titulo: '',
  contenido: '',
  tipo: 'informativo',
  destinatario: 'clientes',
  linkExterno: '',
  fechaExpiracion: '',
};

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

const SectionTitle = ({ icon: Icon, text }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', paddingBottom: '4px', borderBottom: '1px solid var(--gray-100)' }}>
    <Icon style={{ width: '14px', height: '14px', color: 'var(--gray-400)' }} />
    <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--gray-400)', textTransform: 'uppercase', letterSpacing: '0.06em', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      {text}
    </span>
  </div>
);

const ErrorMsg = ({ text }) => (
  <p style={{ marginTop: '4px', fontSize: '12px', color: '#EF4444', display: 'flex', alignItems: 'center', gap: '4px', fontFamily: "'DM Sans', sans-serif" }}>
    <AlertCircle style={{ width: '12px', height: '12px' }} /> {text}
  </p>
);

const Avisos = () => {
  const authStorage = JSON.parse(localStorage.getItem('auth-storage') || '{}');
  const currentUser = authStorage?.state?.user || {};

  const [avisos, setAvisos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('create');
  const [selectedAviso, setSelectedAviso] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterTipo, setFilterTipo] = useState('');
  const [filterDestinatario, setFilterDestinatario] = useState('');
  const [filterEstado, setFilterEstado] = useState('');
  const [formData, setFormData] = useState(initialFormData);
  const [formErrors, setFormErrors] = useState({});
  const [hoveredRow, setHoveredRow] = useState(null);

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
  const textareaStyle = { ...inputBaseStyle, resize: 'vertical', minHeight: '100px' };

  useEffect(() => { cargarAvisos(); }, [filterTipo, filterEstado]);

  const cargarAvisos = async () => {
    try {
      setLoading(true);
      const params = {};
      if (filterTipo) params.tipo = filterTipo;
      if (filterEstado !== '') params.activo = filterEstado;
      const res = await avisosService.getAll(params);
      setAvisos(res.data);
    } catch {
      toast.error('Error al cargar avisos');
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.titulo.trim()) errors.titulo = 'El título es requerido';
    if (!formData.contenido.trim()) errors.contenido = 'El contenido es requerido';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const isFormValid = formData.titulo.trim() !== '' && formData.contenido.trim() !== '';

  const handleOpenModal = (mode, aviso = null) => {
    setModalMode(mode);
    setSelectedAviso(aviso);
    setFormErrors({});
    if (mode === 'edit' && aviso) {
      setFormData({
        titulo: aviso.titulo || '',
        contenido: aviso.contenido || '',
        tipo: aviso.tipo || 'informativo',
        destinatario: aviso.destinatario || 'clientes',
        linkExterno: aviso.linkExterno || '',
        fechaExpiracion: aviso.fechaExpiracion ? aviso.fechaExpiracion.split('T')[0] : '',
      });
    } else {
      setFormData(initialFormData);
    }
    setShowModal(true);
  };

  const handleCloseModal = () => { setShowModal(false); setSelectedAviso(null); setFormErrors({}); };

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
        fechaExpiracion: formData.fechaExpiracion
          ? new Date(formData.fechaExpiracion + 'T23:59:59.000Z').toISOString()
          : null,
      };
      if (modalMode === 'create') {
        await avisosService.create(dataToSend);
        toast.success('Aviso creado exitosamente');
      } else {
        await avisosService.update(selectedAviso.id, dataToSend);
        toast.success('Aviso actualizado exitosamente');
      }
      handleCloseModal();
      cargarAvisos();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error al guardar aviso');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleActivo = (aviso) => {
    const desactivar = aviso.activo;
    showConfirm({
      variant: desactivar ? 'danger' : 'warning',
      title: desactivar ? 'Desactivar aviso' : 'Activar aviso',
      subtitle: desactivar
        ? 'El aviso dejará de ser visible para los usuarios'
        : 'El aviso volverá a ser visible para los usuarios',
      message: `¿Confirmas que deseas ${desactivar ? 'desactivar' : 'activar'} el aviso "${aviso.titulo}"?`,
      confirmLabel: desactivar ? 'Sí, desactivar' : 'Sí, activar',
      onConfirm: async () => {
        try {
          await avisosService.toggleActivo(aviso.id);
          toast.success(`Aviso ${desactivar ? 'desactivado' : 'activado'} exitosamente`);
          cargarAvisos();
        } catch {
          toast.error('Error al cambiar estado');
        }
      },
    });
  };

  const avisosFiltrados = avisos.filter((a) => {
    const matchSearch =
      a.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.contenido.toLowerCase().includes(searchTerm.toLowerCase());
    const matchDestinatario = !filterDestinatario || a.destinatario === filterDestinatario;
    return matchSearch && matchDestinatario;
  });

  const getTipoConfig = (tipo) => {
    const map = {
      urgente:      { bg: '#FEF2F2', color: '#DC2626', label: 'Urgente' },
      evento:       { bg: '#F5F3FF', color: '#7C3AED', label: 'Evento' },
      recordatorio: { bg: '#FFFBEB', color: '#D97706', label: 'Recordatorio' },
      informativo:  { bg: 'var(--capyme-blue-pale)', color: 'var(--capyme-blue-mid)', label: 'Informativo' },
    };
    return map[tipo] || map.informativo;
  };

  const getDestinatarioConfig = (destinatario) => {
    const map = {
      todos:          { bg: 'var(--gray-100)', color: 'var(--gray-600)', label: 'Todos' },
      clientes:       { bg: '#F0FDF4', color: '#16A34A', label: 'Clientes' },
      colaboradores:  { bg: 'var(--capyme-blue-pale)', color: 'var(--capyme-blue-mid)', label: 'Colaboradores' },
    };
    return map[destinatario] || map.todos;
  };

  const formatDate = (date) => {
    if (!date) return null;
    return new Date(date).toLocaleDateString('es-MX', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  const getTipoIcon = (tipo) => {
    const size = { width: '14px', height: '14px' };
    if (tipo === 'urgente') return <AlertCircle style={size} />;
    if (tipo === 'evento') return <Calendar style={size} />;
    if (tipo === 'recordatorio') return <BellRing style={size} />;
    return <Info style={size} />;
  };

  if (loading) {
    return (
      <Layout>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '300px', flexDirection: 'column', gap: '16px' }}>
          <div style={{ width: '40px', height: '40px', border: '3px solid var(--gray-200)', borderTopColor: 'var(--capyme-blue-mid)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
          <span style={{ fontSize: '14px', color: 'var(--gray-500)', fontFamily: "'DM Sans', sans-serif" }}>Cargando avisos...</span>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <style>{`
        @keyframes spin    { to { transform: rotate(360deg); } }
        @keyframes modalIn { from { opacity:0; transform:scale(0.96) translateY(8px); } to { opacity:1; transform:scale(1) translateY(0); } }
        .aviso-modal { animation: modalIn 0.25s ease both; }
        input[type="date"]::-webkit-calendar-picker-indicator { opacity: 0.5; cursor: pointer; }
      `}</style>

      <div style={{ padding: '0 0 40px' }}>

        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '28px', flexWrap: 'wrap', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{ width: '46px', height: '46px', background: 'linear-gradient(135deg, var(--capyme-blue-mid), var(--capyme-blue))', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(31,78,158,0.25)' }}>
              <BellRing style={{ width: '22px', height: '22px', color: '#fff' }} />
            </div>
            <div>
              <h1 style={{ fontSize: '22px', fontWeight: 800, color: 'var(--gray-900)', fontFamily: "'Plus Jakarta Sans', sans-serif", margin: 0, lineHeight: 1.2 }}>Avisos</h1>
              <p style={{ fontSize: '13px', color: 'var(--gray-500)', margin: '3px 0 0', fontFamily: "'DM Sans', sans-serif" }}>
                {avisos.length} aviso{avisos.length !== 1 ? 's' : ''} registrado{avisos.length !== 1 ? 's' : ''}
              </p>
            </div>
          </div>
          {currentUser.rol !== 'cliente' && (
            <button
              onClick={() => handleOpenModal('create')}
              style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 18px', background: 'linear-gradient(135deg, var(--capyme-blue-mid), var(--capyme-blue))', color: '#fff', border: 'none', borderRadius: 'var(--radius-md)', fontSize: '14px', fontWeight: 600, fontFamily: "'DM Sans', sans-serif", cursor: 'pointer', boxShadow: '0 2px 8px rgba(31,78,158,0.28)', transition: 'all 150ms ease' }}
              onMouseEnter={(e) => { e.currentTarget.style.opacity = '0.9'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.opacity = '1'; e.currentTarget.style.transform = 'translateY(0)'; }}
            >
              <Plus style={{ width: '16px', height: '16px' }} />
              Nuevo Aviso
            </button>
          )}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '12px', marginBottom: '20px' }}>
          {[
            { label: 'Total',    value: avisos.length,                              color: 'var(--capyme-blue-mid)', bg: 'var(--capyme-blue-pale)' },
            { label: 'Activos',  value: avisos.filter((a) => a.activo).length,      color: '#16A34A', bg: '#F0FDF4' },
            { label: 'Inactivos',value: avisos.filter((a) => !a.activo).length,     color: '#DC2626', bg: '#FEF2F2' },
            { label: 'Urgentes', value: avisos.filter((a) => a.tipo === 'urgente').length, color: '#C2410C', bg: '#FFF7ED' },
          ].map((stat) => (
            <div key={stat.label} style={{ background: stat.bg, borderRadius: 'var(--radius-md)', padding: '14px 16px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontSize: '22px', fontWeight: 800, color: stat.color, fontFamily: "'Plus Jakarta Sans', sans-serif", lineHeight: 1 }}>{stat.value}</span>
              <span style={{ fontSize: '12px', color: stat.color, fontFamily: "'DM Sans', sans-serif", fontWeight: 600, opacity: 0.75 }}>{stat.label}</span>
            </div>
          ))}
        </div>

        <div style={{ background: '#fff', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '16px 20px', marginBottom: '20px', display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap', boxShadow: 'var(--shadow-sm)' }}>
          <div style={{ position: 'relative', flex: '1', minWidth: '180px' }}>
            <Search style={{ position: 'absolute', left: '11px', top: '50%', transform: 'translateY(-50%)', width: '15px', height: '15px', color: 'var(--gray-400)', pointerEvents: 'none' }} />
            <input type="text" placeholder="Buscar aviso…" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} style={inputWithIconStyle} />
          </div>
          <div style={{ position: 'relative', minWidth: '150px' }}>
            <select value={filterTipo} onChange={(e) => setFilterTipo(e.target.value)} style={{ ...selectStyle, width: '100%' }}>
              <option value="">Todos los tipos</option>
              <option value="informativo">Informativo</option>
              <option value="urgente">Urgente</option>
              <option value="evento">Evento</option>
              <option value="recordatorio">Recordatorio</option>
            </select>
            <ChevronDown style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', width: '14px', height: '14px', color: 'var(--gray-400)', pointerEvents: 'none' }} />
          </div>
          <div style={{ position: 'relative', minWidth: '160px' }}>
            <select value={filterDestinatario} onChange={(e) => setFilterDestinatario(e.target.value)} style={{ ...selectStyle, width: '100%' }}>
              <option value="">Todos los dest.</option>
              <option value="todos">Todos</option>
              <option value="clientes">Clientes</option>
              <option value="colaboradores">Colaboradores</option>
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
        </div>

        {avisosFiltrados.length === 0 ? (
          <div style={{ background: '#fff', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '60px 20px', textAlign: 'center', boxShadow: 'var(--shadow-sm)' }}>
            <div style={{ width: '56px', height: '56px', background: 'var(--gray-100)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' }}>
              <BellRing style={{ width: '24px', height: '24px', color: 'var(--gray-400)' }} />
            </div>
            <p style={{ fontSize: '15px', fontWeight: 600, color: 'var(--gray-700)', margin: '0 0 6px', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>No se encontraron avisos</p>
            <p style={{ fontSize: '13px', color: 'var(--gray-400)', margin: 0, fontFamily: "'DM Sans', sans-serif" }}>Intenta con otros filtros o crea un nuevo aviso</p>
          </div>
        ) : (
          <div style={{ background: '#fff', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', overflow: 'hidden', boxShadow: 'var(--shadow-sm)' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: 'var(--gray-50)', borderBottom: '1px solid var(--border)' }}>
                  {['Aviso', 'Tipo', 'Destinatario', 'Publicado', 'Expira', 'Creado por', 'Estado', ''].map((h) => (
                    <th key={h} style={{ padding: '11px 16px', textAlign: h === '' ? 'right' : 'left', fontSize: '11px', fontWeight: 700, color: 'var(--gray-500)', fontFamily: "'Plus Jakarta Sans', sans-serif", textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {avisosFiltrados.map((aviso) => {
                  const tipoConfig = getTipoConfig(aviso.tipo);
                  const destConfig = getDestinatarioConfig(aviso.destinatario);
                  return (
                    <tr
                      key={aviso.id}
                      onMouseEnter={() => setHoveredRow(aviso.id)}
                      onMouseLeave={() => setHoveredRow(null)}
                      style={{ borderBottom: '1px solid var(--gray-100)', background: hoveredRow === aviso.id ? 'var(--gray-50)' : '#fff', transition: 'background 120ms ease', opacity: aviso.activo ? 1 : 0.6 }}
                    >
                      <td style={{ padding: '13px 16px', maxWidth: '280px' }}>
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                          <div style={{ width: '36px', height: '36px', background: tipoConfig.bg, borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, color: tipoConfig.color, marginTop: '1px' }}>
                            {getTipoIcon(aviso.tipo)}
                          </div>
                          <div>
                            <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--gray-900)', fontFamily: "'DM Sans', sans-serif", lineHeight: 1.3 }}>{aviso.titulo}</div>
                            <div style={{ fontSize: '12px', color: 'var(--gray-400)', fontFamily: "'DM Sans', sans-serif", maxWidth: '230px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginTop: '2px' }}>{aviso.contenido}</div>
                            {aviso.linkExterno && (
                              <a href={aviso.linkExterno} target="_blank" rel="noopener noreferrer" style={{ fontSize: '11px', color: 'var(--capyme-blue-mid)', fontFamily: "'DM Sans', sans-serif", display: 'inline-flex', alignItems: 'center', gap: '3px', marginTop: '3px', textDecoration: 'none' }}>
                                <Link style={{ width: '10px', height: '10px' }} /> Ver enlace
                              </a>
                            )}
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '13px 16px' }}>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '3px 8px', borderRadius: '20px', fontSize: '11px', fontWeight: 700, background: tipoConfig.bg, color: tipoConfig.color, fontFamily: "'Plus Jakarta Sans', sans-serif", textTransform: 'capitalize' }}>
                          {getTipoIcon(aviso.tipo)}{tipoConfig.label}
                        </span>
                      </td>
                      <td style={{ padding: '13px 16px' }}>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '3px 8px', borderRadius: '20px', fontSize: '11px', fontWeight: 700, background: destConfig.bg, color: destConfig.color, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                          <Users style={{ width: '10px', height: '10px' }} />{destConfig.label}
                        </span>
                      </td>
                      <td style={{ padding: '13px 16px', fontSize: '12px', color: 'var(--gray-500)', fontFamily: "'DM Sans', sans-serif", whiteSpace: 'nowrap' }}>
                        {formatDate(aviso.fechaPublicacion) || '—'}
                      </td>
                      <td style={{ padding: '13px 16px', fontSize: '12px', fontFamily: "'DM Sans', sans-serif", whiteSpace: 'nowrap' }}>
                        {aviso.fechaExpiracion ? (
                          <span style={{ color: new Date(aviso.fechaExpiracion) < new Date() ? '#DC2626' : 'var(--gray-500)' }}>
                            {formatDate(aviso.fechaExpiracion)}
                          </span>
                        ) : (
                          <span style={{ color: 'var(--gray-300)' }}>—</span>
                        )}
                      </td>
                      <td style={{ padding: '13px 16px' }}>
                        {aviso.creador ? (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
                            <div style={{ width: '26px', height: '26px', background: 'linear-gradient(135deg, var(--capyme-blue-mid), var(--capyme-blue))', borderRadius: 'var(--radius-sm)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                              <span style={{ fontSize: '10px', fontWeight: 700, color: '#fff', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                                {aviso.creador.nombre?.[0]}{aviso.creador.apellido?.[0]}
                              </span>
                            </div>
                            <span style={{ fontSize: '12px', color: 'var(--gray-600)', fontFamily: "'DM Sans', sans-serif" }}>
                              {aviso.creador.nombre} {aviso.creador.apellido}
                            </span>
                          </div>
                        ) : (
                          <span style={{ color: 'var(--gray-300)', fontSize: '13px' }}>—</span>
                        )}
                      </td>
                      <td style={{ padding: '13px 16px' }}>
                        <span style={{ display: 'inline-block', padding: '3px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: 700, background: aviso.activo ? '#ECFDF5' : '#FEF2F2', color: aviso.activo ? '#065F46' : '#DC2626', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                          {aviso.activo ? 'Activo' : 'Inactivo'}
                        </span>
                      </td>
                      <td style={{ padding: '13px 16px', textAlign: 'right' }}>
                        <div style={{ display: 'flex', gap: '4px', justifyContent: 'flex-end' }}>
                          <button
                            onClick={() => handleOpenModal('edit', aviso)}
                            title="Editar"
                            style={{ width: '34px', height: '34px', border: 'none', borderRadius: 'var(--radius-sm)', background: 'transparent', cursor: 'pointer', color: 'var(--gray-400)', transition: 'all 150ms ease', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                            onMouseEnter={(e) => { e.currentTarget.style.background = '#EEF4FF'; e.currentTarget.style.color = 'var(--capyme-blue-mid)'; }}
                            onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--gray-400)'; }}
                          >
                            <Edit style={{ width: '15px', height: '15px' }} />
                          </button>

                          {currentUser.rol === 'admin' && !aviso.activo && (
                            <button
                              onClick={() => handleToggleActivo(aviso)}
                              title="Activar"
                              style={{ width: '34px', height: '34px', border: 'none', borderRadius: 'var(--radius-sm)', background: 'transparent', cursor: 'pointer', color: 'var(--gray-400)', transition: 'all 150ms ease', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                              onMouseEnter={(e) => { e.currentTarget.style.background = '#ECFDF5'; e.currentTarget.style.color = '#065F46'; }}
                              onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--gray-400)'; }}
                            >
                              <CheckCircle style={{ width: '15px', height: '15px' }} />
                            </button>
                          )}

                          {currentUser.rol === 'admin' && aviso.activo && (
                            <button
                              onClick={() => handleToggleActivo(aviso)}
                              title="Desactivar"
                              style={{ width: '34px', height: '34px', border: 'none', borderRadius: 'var(--radius-sm)', background: 'transparent', cursor: 'pointer', color: 'var(--gray-400)', transition: 'all 150ms ease', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                              onMouseEnter={(e) => { e.currentTarget.style.background = '#FEF2F2'; e.currentTarget.style.color = '#DC2626'; }}
                              onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--gray-400)'; }}
                            >
                              <Trash2 style={{ width: '15px', height: '15px' }} />
                            </button>
                          )}

                          {currentUser.rol === 'colaborador' && (
                            <button
                              title="Sin permiso para cambiar estado"
                              style={{ width: '34px', height: '34px', border: 'none', borderRadius: 'var(--radius-sm)', background: 'transparent', cursor: 'not-allowed', color: 'var(--gray-200)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                            >
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

      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.42)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
          <div
            className="aviso-modal"
            onClick={(e) => e.stopPropagation()}
            style={{ background: '#fff', borderRadius: 'var(--radius-lg)', width: '100%', maxWidth: '600px', maxHeight: '92vh', display: 'flex', flexDirection: 'column', boxShadow: '0 24px 64px rgba(0,0,0,0.18)', overflow: 'hidden' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 24px', background: 'var(--gray-50)', borderBottom: '1px solid var(--border)', flexShrink: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '36px', height: '36px', background: 'linear-gradient(135deg, var(--capyme-blue-mid), var(--capyme-blue))', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <BellRing style={{ width: '18px', height: '18px', color: '#fff' }} />
                </div>
                <h2 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--gray-900)', fontFamily: "'Plus Jakarta Sans', sans-serif", margin: 0 }}>
                  {modalMode === 'create' ? 'Nuevo Aviso' : 'Editar Aviso'}
                </h2>
              </div>
              <button
                onClick={handleCloseModal}
                style={{ width: '32px', height: '32px', border: 'none', borderRadius: 'var(--radius-sm)', background: 'transparent', cursor: 'pointer', color: 'var(--gray-400)', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 150ms ease' }}
                onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--gray-200)'; e.currentTarget.style.color = 'var(--gray-700)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--gray-400)'; }}
              >
                <X style={{ width: '18px', height: '18px' }} />
              </button>
            </div>

            <div style={{ overflowY: 'auto', flex: 1, padding: '24px' }}>
              <SectionTitle icon={BellRing} text="Información del aviso" />
              <div style={{ marginTop: '14px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <label style={labelStyle}>Título <span style={{ color: '#EF4444' }}>*</span></label>
                  <input
                    name="titulo"
                    type="text"
                    value={formData.titulo}
                    onChange={handleChange}
                    placeholder="Ej. Convocatoria Fondo PyME 2025"
                    style={{ ...inputBaseStyle, ...(formErrors.titulo ? inputErrorStyle : {}) }}
                    onFocus={e => { if (!formErrors.titulo) { e.target.style.borderColor = 'var(--capyme-blue-mid)'; e.target.style.boxShadow = '0 0 0 3px rgba(43,91,166,0.12)'; } }}
                    onBlur={e => { if (!formErrors.titulo) { e.target.style.borderColor = 'var(--border)'; e.target.style.boxShadow = 'none'; } }}
                  />
                  {formErrors.titulo && <ErrorMsg text={formErrors.titulo} />}
                </div>
                <div>
                  <label style={labelStyle}>Contenido <span style={{ color: '#EF4444' }}>*</span></label>
                  <textarea
                    name="contenido"
                    value={formData.contenido}
                    onChange={handleChange}
                    placeholder="Describe el aviso con detalle..."
                    style={{ ...textareaStyle, ...(formErrors.contenido ? inputErrorStyle : {}) }}
                    onFocus={e => { if (!formErrors.contenido) { e.target.style.borderColor = 'var(--capyme-blue-mid)'; e.target.style.boxShadow = '0 0 0 3px rgba(43,91,166,0.12)'; } }}
                    onBlur={e => { if (!formErrors.contenido) { e.target.style.borderColor = 'var(--border)'; e.target.style.boxShadow = 'none'; } }}
                  />
                  {formErrors.contenido && <ErrorMsg text={formErrors.contenido} />}
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                  <div>
                    <label style={labelStyle}>Tipo</label>
                    <div style={{ position: 'relative' }}>
                      <select name="tipo" value={formData.tipo} onChange={handleChange} style={selectStyle}>
                        <option value="informativo">Informativo</option>
                        <option value="urgente">Urgente</option>
                        <option value="evento">Evento</option>
                        <option value="recordatorio">Recordatorio</option>
                      </select>
                      <ChevronDown style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', width: '14px', height: '14px', color: 'var(--gray-400)', pointerEvents: 'none' }} />
                    </div>
                  </div>
                  <div>
                    <label style={labelStyle}>Destinatario</label>
                    <div style={{ position: 'relative' }}>
                      <select name="destinatario" value={formData.destinatario} onChange={handleChange} style={selectStyle}>
                        <option value="todos">Todos</option>
                        <option value="clientes">Clientes</option>
                        <option value="colaboradores">Colaboradores</option>
                      </select>
                      <ChevronDown style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', width: '14px', height: '14px', color: 'var(--gray-400)', pointerEvents: 'none' }} />
                    </div>
                  </div>
                </div>
              </div>

              <div style={{ marginTop: '24px' }}>
                <SectionTitle icon={Link} text="Opciones adicionales" />
                <div style={{ marginTop: '14px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                  <div>
                    <label style={labelStyle}>Link Externo</label>
                    <input
                      name="linkExterno"
                      type="url"
                      value={formData.linkExterno}
                      onChange={handleChange}
                      placeholder="https://..."
                      style={inputBaseStyle}
                      onFocus={e => { e.target.style.borderColor = 'var(--capyme-blue-mid)'; e.target.style.boxShadow = '0 0 0 3px rgba(43,91,166,0.12)'; }}
                      onBlur={e => { e.target.style.borderColor = 'var(--border)'; e.target.style.boxShadow = 'none'; }}
                    />
                  </div>
                  <div>
                    <label style={labelStyle}>Fecha de Expiración</label>
                    <input
                      name="fechaExpiracion"
                      type="date"
                      value={formData.fechaExpiracion}
                      onChange={handleChange}
                      style={inputBaseStyle}
                      onFocus={e => { e.target.style.borderColor = 'var(--capyme-blue-mid)'; e.target.style.boxShadow = '0 0 0 3px rgba(43,91,166,0.12)'; }}
                      onBlur={e => { e.target.style.borderColor = 'var(--border)'; e.target.style.boxShadow = 'none'; }}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', padding: '16px 24px', background: 'var(--gray-50)', borderTop: '1px solid var(--border)', flexShrink: 0 }}>
              <button onClick={handleCloseModal} disabled={submitting} style={{ padding: '9px 18px', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', background: '#fff', color: 'var(--gray-700)', fontSize: '14px', fontWeight: 600, fontFamily: "'DM Sans', sans-serif", cursor: 'pointer', transition: 'all 150ms ease' }} onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--gray-100)'; }} onMouseLeave={(e) => { e.currentTarget.style.background = '#fff'; }}>
                Cancelar
              </button>
              <button
                onClick={handleSubmit}
                disabled={submitting || Object.keys(formErrors).length > 0 || !isFormValid}
                style={{
                  padding: '9px 22px', border: 'none', borderRadius: 'var(--radius-md)',
                  background: submitting || Object.keys(formErrors).length > 0 || !isFormValid ? 'var(--gray-300)' : 'linear-gradient(135deg, var(--capyme-blue-mid), var(--capyme-blue))',
                  color: '#fff', fontSize: '14px', fontWeight: 600, fontFamily: "'DM Sans', sans-serif",
                  cursor: submitting || Object.keys(formErrors).length > 0 || !isFormValid ? 'not-allowed' : 'pointer',
                  opacity: submitting || Object.keys(formErrors).length > 0 || !isFormValid ? 0.6 : 1,
                  boxShadow: submitting || Object.keys(formErrors).length > 0 || !isFormValid ? 'none' : '0 2px 8px rgba(31,78,158,0.28)',
                  transition: 'all 150ms ease', display: 'flex', alignItems: 'center', gap: '8px'
                }}
                onMouseEnter={(e) => { if (!submitting && isFormValid && Object.keys(formErrors).length === 0) e.currentTarget.style.transform = 'translateY(-1px)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; }}
              >
                {submitting && <span style={{ width: '14px', height: '14px', border: '2px solid rgba(255,255,255,0.4)', borderTopColor: '#fff', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.7s linear infinite' }} />}
                {submitting ? 'Guardando…' : modalMode === 'create' ? 'Crear Aviso' : 'Guardar Cambios'}
              </button>
            </div>
          </div>
        </div>
      )}

      <ConfirmModal config={confirmConfig} onClose={closeConfirm} />
    </Layout>
  );
};

export default Avisos;