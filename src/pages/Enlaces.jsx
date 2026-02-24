import { useState, useEffect } from 'react';
import Layout from '../components/common/Layout';
import { enlacesService } from '../services/enlacesService';
import {
  Link2, Plus, Search, Edit, X, ExternalLink, Video, FileText,
  DollarSign, ChevronDown, AlertCircle, ShoppingBag, AlertTriangle,
  CheckCircle, XCircle, CreditCard, Banknote, Shield, Users,
  Trash2,
} from 'lucide-react';
import { toast } from 'react-hot-toast';

const initialFormData = {
  titulo: '',
  descripcion: '',
  url: '',
  tipo: 'otro',
  categoria: '',
  visiblePara: 'todos',
  costo: '',
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
  const btnBg        = isDanger ? 'linear-gradient(135deg,#EF4444,#DC2626)' : isWarning ? 'linear-gradient(135deg,#F59E0B,#D97706)' : 'linear-gradient(135deg,var(--capyme-blue-mid),var(--capyme-blue))';
  const btnShadow    = isDanger ? '0 2px 8px rgba(239,68,68,0.35)' : isWarning ? '0 2px 8px rgba(245,158,11,0.35)' : '0 2px 8px rgba(31,78,158,0.28)';
  return (
    <div onClick={onClose} style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.45)', backdropFilter:'blur(4px)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:1200, padding:'20px' }}>
      <div onClick={e => e.stopPropagation()} style={{ background:'#fff', borderRadius:'var(--radius-lg)', width:'100%', maxWidth:'440px', boxShadow:'0 24px 64px rgba(0,0,0,0.22)', overflow:'hidden', animation:'modalIn 0.22s ease both' }}>
        <div style={{ background:accentBg, padding:'20px 24px', borderBottom:`1px solid ${accentBorder}`, display:'flex', alignItems:'center', gap:'14px' }}>
          <div style={{ width:'44px', height:'44px', background:iconBg, borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
            <AlertTriangle style={{ width:'22px', height:'22px', color:'#fff' }} />
          </div>
          <div>
            <h3 style={{ fontSize:'17px', fontWeight:800, color:titleColor, fontFamily:"'Plus Jakarta Sans', sans-serif", margin:'0 0 2px' }}>{config.title}</h3>
            <p style={{ fontSize:'13px', color:subtitleColor, margin:0, fontFamily:"'DM Sans', sans-serif", fontWeight:500 }}>{config.subtitle || 'Esta acción puede revertirse más adelante'}</p>
          </div>
        </div>
        <div style={{ padding:'20px 24px' }}>
          {config.message && (
            <div style={{ background:'var(--gray-50)', border:'1px solid var(--border)', borderRadius:'var(--radius-md)', padding:'14px 16px', marginBottom:'20px' }}>
              <p style={{ fontSize:'14px', color:'var(--gray-700)', margin:0, fontFamily:"'DM Sans', sans-serif", lineHeight:1.5 }}>{config.message}</p>
            </div>
          )}
          <div style={{ display:'flex', gap:'10px', justifyContent:'flex-end' }}>
            <button onClick={onClose} style={{ padding:'9px 18px', border:'1px solid var(--border)', borderRadius:'var(--radius-md)', background:'#fff', color:'var(--gray-700)', fontSize:'14px', fontWeight:600, fontFamily:"'DM Sans', sans-serif", cursor:'pointer', transition:'all 150ms ease' }} onMouseEnter={e => e.currentTarget.style.background='var(--gray-100)'} onMouseLeave={e => e.currentTarget.style.background='#fff'}>Cancelar</button>
            <button onClick={() => { config.onConfirm(); onClose(); }} style={{ padding:'9px 22px', border:'none', borderRadius:'var(--radius-md)', background:btnBg, color:'#fff', fontSize:'14px', fontWeight:600, fontFamily:"'DM Sans', sans-serif", cursor:'pointer', boxShadow:btnShadow, transition:'all 150ms ease' }} onMouseEnter={e => e.currentTarget.style.opacity='0.9'} onMouseLeave={e => e.currentTarget.style.opacity='1'}>
              {config.confirmLabel || 'Confirmar'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const ErrorMsg = ({ text }) => (
  <p style={{ marginTop:'4px', fontSize:'12px', color:'#EF4444', display:'flex', alignItems:'center', gap:'4px', fontFamily:"'DM Sans', sans-serif" }}>
    <AlertCircle style={{ width:'12px', height:'12px' }} /> {text}
  </p>
);

const SectionTitle = ({ icon: Icon, text }) => (
  <div style={{ display:'flex', alignItems:'center', gap:'8px', paddingBottom:'4px', borderBottom:'1px solid var(--gray-100)' }}>
    <Icon style={{ width:'14px', height:'14px', color:'var(--gray-400)' }} />
    <span style={{ fontSize:'11px', fontWeight:700, color:'var(--gray-400)', textTransform:'uppercase', letterSpacing:'0.06em', fontFamily:"'Plus Jakarta Sans', sans-serif" }}>{text}</span>
  </div>
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
  const [showPagosModal, setShowPagosModal] = useState(false);
  const [pagosPendientes, setPagosPendientes] = useState([]);
  const [loadingPagos, setLoadingPagos] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showDeclinarModal, setShowDeclinarModal] = useState(false);
  const [pagoToConfirm, setPagoToConfirm] = useState(null);
  const [pagoToDeclinar, setPagoToDeclinar] = useState(null);
  const [confirmandoPago, setConfirmandoPago] = useState(null);
  const [declinandoPago, setDeclinandoPago] = useState(null);
  const [showAccesosModal, setShowAccesosModal] = useState(false);
  const [accesos, setAccesos] = useState([]);
  const [accesosTitulo, setAccesosTitulo] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterTipo, setFilterTipo] = useState('');
  const [filterActivo, setFilterActivo] = useState('');
  const [hoveredCard, setHoveredCard] = useState(null);
  const [formData, setFormData] = useState(initialFormData);
  const [formErrors, setFormErrors] = useState({});
  const [confirmConfig, setConfirmConfig] = useState({ show: false });
  const showConfirm = (cfg) => setConfirmConfig({ show: true, ...cfg });
  const closeConfirm = () => setConfirmConfig({ show: false });

  const inputBaseStyle = { width:'100%', padding:'10px 12px', border:'1px solid var(--border)', borderRadius:'var(--radius-md)', fontSize:'14px', fontFamily:"'DM Sans', sans-serif", color:'var(--gray-900)', background:'#fff', outline:'none', transition:'all 200ms ease', boxSizing:'border-box' };
  const inputWithIconStyle = { ...inputBaseStyle, paddingLeft:'38px' };
  const inputErrorStyle = { borderColor:'#EF4444', boxShadow:'0 0 0 2px rgba(239,68,68,0.15)' };
  const labelStyle = { display:'block', fontSize:'13px', fontWeight:600, color:'var(--gray-600)', marginBottom:'6px', fontFamily:"'DM Sans', sans-serif" };
  const selectStyle = { ...inputBaseStyle, appearance:'none', paddingRight:'36px', cursor:'pointer' };
  const textareaStyle = { ...inputBaseStyle, resize:'vertical', minHeight:'80px' };

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

  const cargarPagosPendientes = async () => {
    try {
      setLoadingPagos(true);
      const res = await enlacesService.getPagosPendientes();
      setPagosPendientes(res.data);
      setShowPagosModal(true);
    } catch { toast.error('Error al cargar pagos pendientes'); }
    finally { setLoadingPagos(false); }
  };

  const cargarAccesos = async (enlace) => {
    try {
      const res = await enlacesService.getAccesos(enlace.id);
      setAccesos(res.data);
      setAccesosTitulo(enlace.titulo);
      setShowAccesosModal(true);
    } catch { toast.error('Error al cargar accesos'); }
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.titulo.trim()) errors.titulo = 'El título es requerido';
    if (!formData.url.trim()) errors.url = 'La URL es requerida';
    else if (!/^https?:\/\/.+/.test(formData.url)) errors.url = 'Ingresa una URL válida (https://...)';
    if (formData.costo !== '' && isNaN(parseFloat(formData.costo))) errors.costo = 'Ingresa un costo válido';
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
        costo: enlace.costo != null ? String(enlace.costo) : '',
      });
    } else {
      setFormData(initialFormData);
    }
    setShowModal(true);
  };

  const handleCloseModal = () => { setShowModal(false); setSelectedEnlace(null); setFormErrors({}); };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (formErrors[name]) setFormErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    setSubmitting(true);
    try {
      const { activo, ...rest } = formData;
      const dataToSend = {
        ...rest,
        costo: formData.costo !== '' ? parseFloat(formData.costo) : 0,
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

  const handleToggleActivo = (enlace) => {
    const desactivar = enlace.activo;
    showConfirm({
      variant: desactivar ? 'danger' : 'warning',
      title: desactivar ? 'Desactivar catálogo' : 'Activar catálogo',
      subtitle: desactivar ? 'El catálogo dejará de ser visible para los usuarios' : 'El catálogo volverá a estar disponible',
      message: `¿Confirmas que deseas ${desactivar ? 'desactivar' : 'activar'} "${enlace.titulo}"?`,
      confirmLabel: desactivar ? 'Sí, desactivar' : 'Sí, activar',
      onConfirm: async () => {
        try {
          await enlacesService.toggleActivo(enlace.id);
          toast.success(`Catálogo ${desactivar ? 'desactivado' : 'activado'} exitosamente`);
          cargarEnlaces();
        } catch { toast.error('Error al cambiar estado'); }
      },
    });
  };

  const handleConfirmarPago = async () => {
    if (!pagoToConfirm) return;
    try {
      setConfirmandoPago(pagoToConfirm.id);
      await enlacesService.confirmarPago(pagoToConfirm.id);
      toast.success('Pago confirmado y acceso otorgado');
      setPagosPendientes(prev => prev.filter(p => p.id !== pagoToConfirm.id));
      setShowConfirmModal(false);
      setPagoToConfirm(null);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error al confirmar pago');
    } finally { setConfirmandoPago(null); }
  };

  const handleDeclinarPago = async () => {
    if (!pagoToDeclinar) return;
    try {
      setDeclinandoPago(pagoToDeclinar.id);
      await enlacesService.declinarPago(pagoToDeclinar.id);
      toast.success('Solicitud de acceso declinada y cliente notificado');
      setPagosPendientes(prev => prev.filter(p => p.id !== pagoToDeclinar.id));
      setShowDeclinarModal(false);
      setPagoToDeclinar(null);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error al declinar');
    } finally { setDeclinandoPago(null); }
  };

  const enlacesFiltrados = enlaces.filter(e =>
    e.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (e.descripcion || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (e.categoria || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatCurrency = (amount) => amount != null ? new Intl.NumberFormat('es-MX', { style:'currency', currency:'MXN' }).format(amount) : null;
  const formatDate = (date) => date ? new Date(date).toLocaleDateString('es-MX', { year:'numeric', month:'short', day:'numeric' }) : null;

  const getTipoStyle = (tipo) => ({
    video:          { bg:'#FEF2F2', color:'#DC2626', icon: Video },
    financiamiento: { bg:'#F0FDF4', color:'#16A34A', icon: DollarSign },
    documento:      { bg:'#EEF4FF', color:'var(--capyme-blue-mid)', icon: FileText },
    otro:           { bg:'var(--gray-100)', color:'var(--gray-600)', icon: Link2 },
  }[tipo] || { bg:'var(--gray-100)', color:'var(--gray-600)', icon: Link2 });

  const getTipoLabel = (tipo) => ({ video:'Video', financiamiento:'Financiamiento', documento:'Documento', otro:'Otro' }[tipo] || tipo);

  const getVisibleStyle = (v) => ({
    todos:         { bg:'#F5F3FF', color:'#7C3AED' },
    clientes:      { bg:'#F0FDF4', color:'#16A34A' },
    colaboradores: { bg:'#EEF4FF', color:'var(--capyme-blue-mid)' },
    admin:         { bg:'#FEF2F2', color:'#DC2626' },
  }[v] || { bg:'var(--gray-100)', color:'var(--gray-600)' });

  const getVisibleLabel = (v) => ({ todos:'Todos', clientes:'Clientes', colaboradores:'Colaboradores', admin:'Admin' }[v] || v);

  const getEstadoAccesoStyle = (e) => ({
    pendiente: { bg:'#FFF7ED', color:'#C2410C' },
    activo:    { bg:'#ECFDF5', color:'#065F46' },
    rechazado: { bg:'#FEF2F2', color:'#DC2626' },
  }[e] || { bg:'var(--gray-100)', color:'var(--gray-600)' });

  if (loading) return (
    <Layout>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'300px', flexDirection:'column', gap:'16px' }}>
        <div style={{ width:'40px', height:'40px', border:'3px solid var(--gray-200)', borderTopColor:'var(--capyme-blue-mid)', borderRadius:'50%', animation:'spin 0.8s linear infinite' }} />
        <span style={{ fontSize:'14px', color:'var(--gray-500)', fontFamily:"'DM Sans', sans-serif" }}>Cargando catálogos...</span>
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
      `}</style>

      <div style={{ padding:'0 0 40px' }}>

        {/* HEADER */}
        <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:'28px', flexWrap:'wrap', gap:'16px' }}>
          <div style={{ display:'flex', alignItems:'center', gap:'14px' }}>
            <div style={{ width:'46px', height:'46px', background:'linear-gradient(135deg, var(--capyme-blue-mid), var(--capyme-blue))', borderRadius:'var(--radius-md)', display:'flex', alignItems:'center', justifyContent:'center', boxShadow:'0 4px 12px rgba(31,78,158,0.25)' }}>
              <ShoppingBag style={{ width:'22px', height:'22px', color:'#fff' }} />
            </div>
            <div>
              <h1 style={{ fontSize:'22px', fontWeight:800, color:'var(--gray-900)', fontFamily:"'Plus Jakarta Sans', sans-serif", margin:0, lineHeight:1.2 }}>Catálogos y Recursos</h1>
              <p style={{ fontSize:'13px', color:'var(--gray-500)', margin:'3px 0 0', fontFamily:"'DM Sans', sans-serif" }}>
                {enlaces.length} catálogo{enlaces.length !== 1 ? 's' : ''} registrado{enlaces.length !== 1 ? 's' : ''}
              </p>
            </div>
          </div>
          <div style={{ display:'flex', gap:'10px', flexWrap:'wrap' }}>
            {currentUser.rol === 'admin' && (
              <button onClick={cargarPagosPendientes} disabled={loadingPagos} style={{ display:'flex', alignItems:'center', gap:'8px', padding:'10px 18px', background:'#FFF7ED', color:'#C2410C', border:'1.5px solid #FED7AA', borderRadius:'var(--radius-md)', fontSize:'14px', fontWeight:600, fontFamily:"'DM Sans', sans-serif", cursor:'pointer', transition:'all 150ms ease' }} onMouseEnter={e => { e.currentTarget.style.background='#FFEDD5'; e.currentTarget.style.borderColor='#FB923C'; }} onMouseLeave={e => { e.currentTarget.style.background='#FFF7ED'; e.currentTarget.style.borderColor='#FED7AA'; }}>
                <CreditCard style={{ width:'16px', height:'16px' }} />
                Pagos pendientes de acceso
              </button>
            )}
            {currentUser.rol !== 'cliente' && (
              <button onClick={() => handleOpenModal('create')} style={{ display:'flex', alignItems:'center', gap:'8px', padding:'10px 18px', background:'linear-gradient(135deg, var(--capyme-blue-mid), var(--capyme-blue))', color:'#fff', border:'none', borderRadius:'var(--radius-md)', fontSize:'14px', fontWeight:600, fontFamily:"'DM Sans', sans-serif", cursor:'pointer', boxShadow:'0 2px 8px rgba(31,78,158,0.28)', transition:'all 150ms ease' }} onMouseEnter={e => { e.currentTarget.style.opacity='0.9'; e.currentTarget.style.transform='translateY(-1px)'; }} onMouseLeave={e => { e.currentTarget.style.opacity='1'; e.currentTarget.style.transform='translateY(0)'; }}>
                <Plus style={{ width:'16px', height:'16px' }} />
                Nuevo Catálogo
              </button>
            )}
          </div>
        </div>

        {/* STATS */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(130px, 1fr))', gap:'12px', marginBottom:'20px' }}>
          {[
            { label:'Total',           value: enlaces.length,                                    color:'var(--capyme-blue-mid)', bg:'var(--capyme-blue-pale)' },
            { label:'Activos',         value: enlaces.filter(e => e.activo).length,              color:'#16A34A', bg:'#F0FDF4' },
            { label:'Inactivos',       value: enlaces.filter(e => !e.activo).length,             color:'#DC2626', bg:'#FEF2F2' },
            { label:'Con costo',       value: enlaces.filter(e => parseFloat(e.costo || 0) > 0).length, color:'#C2410C', bg:'#FFF7ED' },
          ].map(stat => (
            <div key={stat.label} style={{ background:stat.bg, borderRadius:'var(--radius-md)', padding:'14px 16px', display:'flex', alignItems:'center', gap:'10px' }}>
              <span style={{ fontSize:'22px', fontWeight:800, color:stat.color, fontFamily:"'Plus Jakarta Sans', sans-serif", lineHeight:1 }}>{stat.value}</span>
              <span style={{ fontSize:'12px', color:stat.color, fontFamily:"'DM Sans', sans-serif", fontWeight:600, opacity:0.75 }}>{stat.label}</span>
            </div>
          ))}
        </div>

        {/* FILTERS */}
        <div style={{ background:'#fff', border:'1px solid var(--border)', borderRadius:'var(--radius-lg)', padding:'16px 20px', marginBottom:'20px', display:'flex', gap:'12px', alignItems:'center', flexWrap:'wrap', boxShadow:'var(--shadow-sm)' }}>
          <div style={{ position:'relative', flex:'1', minWidth:'180px' }}>
            <Search style={{ position:'absolute', left:'11px', top:'50%', transform:'translateY(-50%)', width:'15px', height:'15px', color:'var(--gray-400)', pointerEvents:'none' }} />
            <input type="text" placeholder="Buscar catálogo, descripción o categoría…" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} style={inputWithIconStyle} />
          </div>
          <div style={{ position:'relative', minWidth:'150px' }}>
            <select value={filterTipo} onChange={e => setFilterTipo(e.target.value)} style={{ ...selectStyle, width:'100%' }}>
              <option value="">Todos los tipos</option>
              <option value="video">Video</option>
              <option value="financiamiento">Financiamiento</option>
              <option value="documento">Documento</option>
              <option value="otro">Otro</option>
            </select>
            <ChevronDown style={{ position:'absolute', right:'10px', top:'50%', transform:'translateY(-50%)', width:'14px', height:'14px', color:'var(--gray-400)', pointerEvents:'none' }} />
          </div>
          <div style={{ position:'relative', minWidth:'140px' }}>
            <select value={filterActivo} onChange={e => setFilterActivo(e.target.value)} style={{ ...selectStyle, width:'100%' }}>
              <option value="">Activo / Inactivo</option>
              <option value="true">Activos</option>
              <option value="false">Inactivos</option>
            </select>
            <ChevronDown style={{ position:'absolute', right:'10px', top:'50%', transform:'translateY(-50%)', width:'14px', height:'14px', color:'var(--gray-400)', pointerEvents:'none' }} />
          </div>
        </div>

        {/* GRID */}
        {enlacesFiltrados.length === 0 ? (
          <div style={{ background:'#fff', border:'1px solid var(--border)', borderRadius:'var(--radius-lg)', padding:'60px 20px', textAlign:'center', boxShadow:'var(--shadow-sm)' }}>
            <div style={{ width:'56px', height:'56px', background:'var(--gray-100)', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 14px' }}>
              <ShoppingBag style={{ width:'24px', height:'24px', color:'var(--gray-400)' }} />
            </div>
            <p style={{ fontSize:'15px', fontWeight:600, color:'var(--gray-700)', margin:'0 0 6px', fontFamily:"'Plus Jakarta Sans', sans-serif" }}>No se encontraron catálogos</p>
            <p style={{ fontSize:'13px', color:'var(--gray-400)', margin:0, fontFamily:"'DM Sans', sans-serif" }}>Intenta con otros filtros o agrega un nuevo catálogo</p>
          </div>
        ) : (
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(300px, 1fr))', gap:'16px' }}>
            {enlacesFiltrados.map((enlace, idx) => {
              const ts = getTipoStyle(enlace.tipo);
              const vs = getVisibleStyle(enlace.visiblePara);
              const TIcon = ts.icon;
              const esGratis = !enlace.costo || parseFloat(enlace.costo) === 0;
              return (
                <div key={enlace.id} className="enlace-card" style={{ background:'#fff', border:'1px solid var(--border)', borderRadius:'var(--radius-lg)', overflow:'hidden', animationDelay:`${idx * 40}ms`, opacity: enlace.activo ? 1 : 0.6 }} onMouseEnter={() => setHoveredCard(enlace.id)} onMouseLeave={() => setHoveredCard(null)}>
                  <div style={{ height:'4px', background: enlace.activo ? 'linear-gradient(90deg, var(--capyme-blue-mid), var(--capyme-blue))' : 'var(--gray-200)' }} />
                  <div style={{ padding:'20px' }}>
                    <div style={{ display:'flex', alignItems:'flex-start', gap:'12px', marginBottom:'14px' }}>
                      <div style={{ width:'40px', height:'40px', background:ts.bg, borderRadius:'var(--radius-md)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                        <TIcon style={{ width:'18px', height:'18px', color:ts.color }} />
                      </div>
                      <div style={{ flex:1, minWidth:0 }}>
                        <h3 style={{ fontSize:'15px', fontWeight:700, color:'var(--gray-900)', fontFamily:"'Plus Jakarta Sans', sans-serif", margin:'0 0 6px', lineHeight:1.3, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{enlace.titulo}</h3>
                        <div style={{ display:'flex', gap:'5px', flexWrap:'wrap' }}>
                          <span style={{ padding:'2px 8px', borderRadius:'20px', fontSize:'11px', fontWeight:700, background:ts.bg, color:ts.color, fontFamily:"'Plus Jakarta Sans', sans-serif", textTransform:'uppercase', letterSpacing:'0.03em' }}>{getTipoLabel(enlace.tipo)}</span>
                          <span style={{ padding:'2px 8px', borderRadius:'20px', fontSize:'11px', fontWeight:700, background:vs.bg, color:vs.color, fontFamily:"'Plus Jakarta Sans', sans-serif" }}>{getVisibleLabel(enlace.visiblePara)}</span>
                          <span style={{ padding:'2px 8px', borderRadius:'20px', fontSize:'11px', fontWeight:700, background: esGratis ? '#ECFDF5' : '#FFF7ED', color: esGratis ? '#065F46' : '#C2410C', fontFamily:"'Plus Jakarta Sans', sans-serif" }}>
                            {esGratis ? 'Gratis' : formatCurrency(enlace.costo)}
                          </span>
                          <span style={{ padding:'2px 8px', borderRadius:'20px', fontSize:'11px', fontWeight:700, background: enlace.activo ? '#ECFDF5' : '#FEF2F2', color: enlace.activo ? '#065F46' : '#DC2626', fontFamily:"'Plus Jakarta Sans', sans-serif" }}>
                            {enlace.activo ? '● Activo' : '● Inactivo'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {enlace.descripcion && (
                      <p style={{ fontSize:'13px', color:'var(--gray-500)', margin:'0 0 12px', fontFamily:"'DM Sans', sans-serif", lineHeight:1.5, display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical', overflow:'hidden' }}>{enlace.descripcion}</p>
                    )}

                    {enlace.categoria && (
                      <div style={{ display:'inline-flex', alignItems:'center', gap:'5px', padding:'3px 10px', background:'var(--gray-100)', borderRadius:'20px', marginBottom:'14px' }}>
                        <span style={{ fontSize:'12px', color:'var(--gray-600)', fontFamily:"'DM Sans', sans-serif", fontWeight:600 }}>{enlace.categoria}</span>
                      </div>
                    )}

                    <div style={{ display:'flex', flexDirection:'column', gap:'6px', paddingTop:'14px', borderTop:'1px solid var(--gray-100)' }}>
                      {currentUser.rol !== 'cliente' && (
                        <button onClick={() => cargarAccesos(enlace)} style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:'7px', padding:'7px 12px', background:'var(--gray-50)', color:'var(--gray-600)', border:'1px solid var(--border)', borderRadius:'var(--radius-md)', fontSize:'12px', fontWeight:600, fontFamily:"'DM Sans', sans-serif", cursor:'pointer', transition:'all 150ms ease' }} onMouseEnter={e => { e.currentTarget.style.background='var(--capyme-blue-pale)'; e.currentTarget.style.color='var(--capyme-blue-mid)'; e.currentTarget.style.borderColor='var(--capyme-blue-mid)'; }} onMouseLeave={e => { e.currentTarget.style.background='var(--gray-50)'; e.currentTarget.style.color='var(--gray-600)'; e.currentTarget.style.borderColor='var(--border)'; }}>
                          <Users style={{ width:'13px', height:'13px' }} />
                          Ver accesos ({enlace.accesosCount || 0})
                        </button>
                      )}
                      <a href={enlace.url} target="_blank" rel="noopener noreferrer" style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:'7px', padding:'7px 12px', background:'var(--capyme-blue-pale)', color:'var(--capyme-blue-mid)', border:'none', borderRadius:'var(--radius-md)', fontSize:'12px', fontWeight:600, fontFamily:"'DM Sans', sans-serif", textDecoration:'none', transition:'all 150ms ease' }} onMouseEnter={e => { e.currentTarget.style.background='var(--capyme-blue-mid)'; e.currentTarget.style.color='#fff'; }} onMouseLeave={e => { e.currentTarget.style.background='var(--capyme-blue-pale)'; e.currentTarget.style.color='var(--capyme-blue-mid)'; }}>
                        <ExternalLink style={{ width:'13px', height:'13px' }} />
                        Abrir catálogo
                      </a>
                      <div style={{ display:'flex', gap:'6px' }}>
                        {currentUser.rol !== 'cliente' && (
                          <button onClick={() => handleOpenModal('edit', enlace)} style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center', gap:'6px', padding:'7px 12px', border:'1px solid var(--border)', borderRadius:'var(--radius-sm)', background:'transparent', cursor:'pointer', color:'var(--gray-600)', fontSize:'12px', fontFamily:"'DM Sans', sans-serif", fontWeight:600, transition:'all 150ms ease' }} onMouseEnter={e => { e.currentTarget.style.background='#EEF4FF'; e.currentTarget.style.color='var(--capyme-blue-mid)'; e.currentTarget.style.borderColor='var(--capyme-blue-mid)'; }} onMouseLeave={e => { e.currentTarget.style.background='transparent'; e.currentTarget.style.color='var(--gray-600)'; e.currentTarget.style.borderColor='var(--border)'; }}>
                            <Edit style={{ width:'13px', height:'13px' }} /> Editar
                          </button>
                        )}
                        {currentUser.rol === 'admin' && !enlace.activo && (
                          <button onClick={() => handleToggleActivo(enlace)} style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center', gap:'6px', padding:'7px 12px', border:'1px solid var(--border)', borderRadius:'var(--radius-sm)', background:'transparent', cursor:'pointer', color:'var(--gray-400)', fontSize:'12px', fontFamily:"'DM Sans', sans-serif", fontWeight:600, transition:'all 150ms ease' }} onMouseEnter={e => { e.currentTarget.style.background='#ECFDF5'; e.currentTarget.style.color='#065F46'; e.currentTarget.style.borderColor='#16A34A'; }} onMouseLeave={e => { e.currentTarget.style.background='transparent'; e.currentTarget.style.color='var(--gray-400)'; e.currentTarget.style.borderColor='var(--border)'; }}>
                            <CheckCircle style={{ width:'13px', height:'13px' }} /> Activar
                          </button>
                        )}
                        {currentUser.rol === 'admin' && enlace.activo && (
                          <button onClick={() => handleToggleActivo(enlace)} style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center', gap:'6px', padding:'7px 12px', border:'1px solid var(--border)', borderRadius:'var(--radius-sm)', background:'transparent', cursor:'pointer', color:'var(--gray-400)', fontSize:'12px', fontFamily:"'DM Sans', sans-serif", fontWeight:600, transition:'all 150ms ease' }} onMouseEnter={e => { e.currentTarget.style.background='#FEF2F2'; e.currentTarget.style.color='#DC2626'; e.currentTarget.style.borderColor='#DC2626'; }} onMouseLeave={e => { e.currentTarget.style.background='transparent'; e.currentTarget.style.color='var(--gray-400)'; e.currentTarget.style.borderColor='var(--border)'; }}>
                            <Trash2 style={{ width:'13px', height:'13px' }} /> Desactivar
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

      {/* MODAL CREAR / EDITAR */}
      {showModal && (
        <div onClick={handleCloseModal} style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.42)', backdropFilter:'blur(4px)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:1000, padding:'20px' }}>
          <div className="enlace-modal" onClick={e => e.stopPropagation()} style={{ background:'#fff', borderRadius:'var(--radius-lg)', width:'100%', maxWidth:'620px', maxHeight:'92vh', display:'flex', flexDirection:'column', boxShadow:'0 24px 64px rgba(0,0,0,0.18)', overflow:'hidden' }}>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'20px 24px', background:'var(--gray-50)', borderBottom:'1px solid var(--border)', flexShrink:0 }}>
              <div style={{ display:'flex', alignItems:'center', gap:'12px' }}>
                <div style={{ width:'36px', height:'36px', background:'linear-gradient(135deg, var(--capyme-blue-mid), var(--capyme-blue))', borderRadius:'var(--radius-md)', display:'flex', alignItems:'center', justifyContent:'center' }}>
                  <ShoppingBag style={{ width:'18px', height:'18px', color:'#fff' }} />
                </div>
                <h2 style={{ fontSize:'18px', fontWeight:800, color:'var(--gray-900)', fontFamily:"'Plus Jakarta Sans', sans-serif", margin:0 }}>
                  {modalMode === 'create' ? 'Nuevo Catálogo' : 'Editar Catálogo'}
                </h2>
              </div>
              <button onClick={handleCloseModal} style={{ width:'32px', height:'32px', border:'none', borderRadius:'var(--radius-sm)', background:'transparent', cursor:'pointer', color:'var(--gray-400)', display:'flex', alignItems:'center', justifyContent:'center', transition:'all 150ms ease' }} onMouseEnter={e => { e.currentTarget.style.background='var(--gray-200)'; e.currentTarget.style.color='var(--gray-700)'; }} onMouseLeave={e => { e.currentTarget.style.background='transparent'; e.currentTarget.style.color='var(--gray-400)'; }}>
                <X style={{ width:'18px', height:'18px' }} />
              </button>
            </div>

            <div style={{ overflowY:'auto', flex:1, padding:'24px', display:'flex', flexDirection:'column', gap:'20px' }}>
              <SectionTitle icon={Link2} text="Información del catálogo" />
              <div style={{ display:'flex', flexDirection:'column', gap:'14px' }}>
                <div>
                  <label style={labelStyle}>Título <span style={{ color:'#EF4444' }}>*</span></label>
                  <input name="titulo" type="text" value={formData.titulo} onChange={handleChange} placeholder="Ej. Catálogo de productos 2025" style={{ ...inputBaseStyle, ...(formErrors.titulo ? inputErrorStyle : {}) }} />
                  {formErrors.titulo && <ErrorMsg text={formErrors.titulo} />}
                </div>
                <div>
                  <label style={labelStyle}>URL del catálogo <span style={{ color:'#EF4444' }}>*</span></label>
                  <div style={{ position:'relative' }}>
                    <ExternalLink style={{ position:'absolute', left:'11px', top:'50%', transform:'translateY(-50%)', width:'14px', height:'14px', color:'var(--gray-400)', pointerEvents:'none' }} />
                    <input name="url" type="text" value={formData.url} onChange={handleChange} placeholder="https://..." style={{ ...inputWithIconStyle, ...(formErrors.url ? inputErrorStyle : {}) }} />
                  </div>
                  {formErrors.url && <ErrorMsg text={formErrors.url} />}
                </div>
                <div>
                  <label style={labelStyle}>Descripción</label>
                  <textarea name="descripcion" value={formData.descripcion} onChange={handleChange} placeholder="Describe brevemente este catálogo…" style={textareaStyle} />
                </div>
              </div>

              <SectionTitle icon={ShoppingBag} text="Clasificación y acceso" />
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'14px' }}>
                <div>
                  <label style={labelStyle}>Tipo</label>
                  <div style={{ position:'relative' }}>
                    <select name="tipo" value={formData.tipo} onChange={handleChange} style={selectStyle}>
                      <option value="video">Video</option>
                      <option value="financiamiento">Financiamiento</option>
                      <option value="documento">Documento</option>
                      <option value="otro">Otro</option>
                    </select>
                    <ChevronDown style={{ position:'absolute', right:'10px', top:'50%', transform:'translateY(-50%)', width:'14px', height:'14px', color:'var(--gray-400)', pointerEvents:'none' }} />
                  </div>
                </div>
                <div>
                  <label style={labelStyle}>Categoría</label>
                  <input name="categoria" type="text" value={formData.categoria} onChange={handleChange} placeholder="Ej: Marketing, Finanzas" style={inputBaseStyle} />
                </div>
                <div>
                  <label style={labelStyle}>Visible para</label>
                  <div style={{ position:'relative' }}>
                    <select name="visiblePara" value={formData.visiblePara} onChange={handleChange} style={selectStyle}>
                      <option value="todos">Todos</option>
                      <option value="clientes">Clientes</option>
                      <option value="colaboradores">Colaboradores</option>
                      <option value="admin">Admin</option>
                    </select>
                    <ChevronDown style={{ position:'absolute', right:'10px', top:'50%', transform:'translateY(-50%)', width:'14px', height:'14px', color:'var(--gray-400)', pointerEvents:'none' }} />
                  </div>
                </div>
                <div>
                  <label style={labelStyle}>Costo de acceso (MXN)</label>
                  <div style={{ position:'relative' }}>
                    <DollarSign style={{ position:'absolute', left:'11px', top:'50%', transform:'translateY(-50%)', width:'14px', height:'14px', color:'var(--gray-400)', pointerEvents:'none' }} />
                    <input name="costo" type="number" step="0.01" min="0" value={formData.costo} onChange={handleChange} placeholder="0.00 (gratis)" style={{ ...inputWithIconStyle, ...(formErrors.costo ? inputErrorStyle : {}) }} />
                  </div>
                  {formErrors.costo && <ErrorMsg text={formErrors.costo} />}
                  <p style={{ fontSize:'11px', color:'var(--gray-400)', margin:'4px 0 0', fontFamily:"'DM Sans', sans-serif" }}>Déjalo vacío o en 0 para acceso gratuito</p>
                </div>
              </div>
            </div>

            <div style={{ display:'flex', justifyContent:'flex-end', gap:'10px', padding:'16px 24px', background:'var(--gray-50)', borderTop:'1px solid var(--border)', flexShrink:0 }}>
              <button onClick={handleCloseModal} disabled={submitting} style={{ padding:'9px 18px', border:'1px solid var(--border)', borderRadius:'var(--radius-md)', background:'#fff', color:'var(--gray-700)', fontSize:'14px', fontWeight:600, fontFamily:"'DM Sans', sans-serif", cursor:'pointer', transition:'all 150ms ease' }} onMouseEnter={e => e.currentTarget.style.background='var(--gray-100)'} onMouseLeave={e => e.currentTarget.style.background='#fff'}>Cancelar</button>
              <button onClick={handleSubmit} disabled={submitting} style={{ padding:'9px 22px', border:'none', borderRadius:'var(--radius-md)', background: submitting ? 'var(--gray-300)' : 'linear-gradient(135deg, var(--capyme-blue-mid), var(--capyme-blue))', color:'#fff', fontSize:'14px', fontWeight:600, fontFamily:"'DM Sans', sans-serif", cursor: submitting ? 'not-allowed' : 'pointer', boxShadow: submitting ? 'none' : '0 2px 8px rgba(31,78,158,0.28)', transition:'all 150ms ease', display:'flex', alignItems:'center', gap:'8px' }}>
                {submitting && <span style={{ width:'14px', height:'14px', border:'2px solid rgba(255,255,255,0.4)', borderTopColor:'#fff', borderRadius:'50%', display:'inline-block', animation:'spin 0.7s linear infinite' }} />}
                {submitting ? 'Guardando…' : modalMode === 'create' ? 'Crear Catálogo' : 'Guardar Cambios'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL ACCESOS */}
      {showAccesosModal && (
        <div onClick={() => setShowAccesosModal(false)} style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.42)', backdropFilter:'blur(4px)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:1000, padding:'20px' }}>
          <div className="enlace-modal" onClick={e => e.stopPropagation()} style={{ background:'#fff', borderRadius:'var(--radius-lg)', width:'100%', maxWidth:'680px', maxHeight:'88vh', display:'flex', flexDirection:'column', boxShadow:'0 24px 64px rgba(0,0,0,0.18)', overflow:'hidden' }}>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'20px 24px', background:'var(--gray-50)', borderBottom:'1px solid var(--border)', flexShrink:0 }}>
              <div style={{ display:'flex', alignItems:'center', gap:'12px' }}>
                <div style={{ width:'36px', height:'36px', background:'linear-gradient(135deg, var(--capyme-blue-mid), var(--capyme-blue))', borderRadius:'var(--radius-md)', display:'flex', alignItems:'center', justifyContent:'center' }}>
                  <Users style={{ width:'18px', height:'18px', color:'#fff' }} />
                </div>
                <div>
                  <h2 style={{ fontSize:'16px', fontWeight:800, color:'var(--gray-900)', fontFamily:"'Plus Jakarta Sans', sans-serif", margin:0 }}>Accesos</h2>
                  <p style={{ fontSize:'12px', color:'var(--gray-400)', margin:'2px 0 0', fontFamily:"'DM Sans', sans-serif", maxWidth:'380px', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{accesosTitulo}</p>
                </div>
              </div>
              <button onClick={() => setShowAccesosModal(false)} style={{ width:'32px', height:'32px', border:'none', borderRadius:'var(--radius-sm)', background:'transparent', cursor:'pointer', color:'var(--gray-400)', display:'flex', alignItems:'center', justifyContent:'center', transition:'all 150ms ease' }} onMouseEnter={e => e.currentTarget.style.background='var(--gray-200)'} onMouseLeave={e => e.currentTarget.style.background='transparent'}>
                <X style={{ width:'18px', height:'18px' }} />
              </button>
            </div>
            <div style={{ overflowY:'auto', flex:1 }}>
              {accesos.length === 0 ? (
                <div style={{ padding:'60px 20px', textAlign:'center' }}>
                  <div style={{ width:'48px', height:'48px', background:'var(--gray-100)', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 12px' }}>
                    <Users style={{ width:'22px', height:'22px', color:'var(--gray-400)' }} />
                  </div>
                  <p style={{ fontSize:'14px', fontWeight:600, color:'var(--gray-600)', margin:'0 0 4px', fontFamily:"'Plus Jakarta Sans', sans-serif" }}>Sin accesos</p>
                  <p style={{ fontSize:'13px', color:'var(--gray-400)', margin:0, fontFamily:"'DM Sans', sans-serif" }}>Aún no hay usuarios que hayan solicitado acceso</p>
                </div>
              ) : (
                <table style={{ width:'100%', borderCollapse:'collapse' }}>
                  <thead>
                    <tr style={{ background:'var(--gray-50)', borderBottom:'1px solid var(--border)' }}>
                      {['Usuario', 'Email', 'Estado', 'Pago', 'Fecha'].map(h => (
                        <th key={h} style={{ padding:'11px 16px', textAlign:'left', fontSize:'11px', fontWeight:700, color:'var(--gray-500)', fontFamily:"'Plus Jakarta Sans', sans-serif", textTransform:'uppercase', letterSpacing:'0.05em', whiteSpace:'nowrap' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {accesos.map(acceso => {
                      const es = getEstadoAccesoStyle(acceso.estado);
                      const iniciales = `${acceso.usuario.nombre[0]}${acceso.usuario.apellido[0]}`.toUpperCase();
                      return (
                        <tr key={acceso.id} style={{ borderBottom:'1px solid var(--gray-100)' }}>
                          <td style={{ padding:'12px 16px' }}>
                            <div style={{ display:'flex', alignItems:'center', gap:'10px' }}>
                              <div style={{ width:'32px', height:'32px', background:'linear-gradient(135deg, var(--capyme-blue-mid), var(--capyme-blue))', borderRadius:'var(--radius-md)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                                <span style={{ fontSize:'11px', fontWeight:700, color:'#fff', fontFamily:"'Plus Jakarta Sans', sans-serif" }}>{iniciales}</span>
                              </div>
                              <div>
                                <div style={{ fontSize:'13px', fontWeight:600, color:'var(--gray-900)', fontFamily:"'DM Sans', sans-serif" }}>{acceso.usuario.nombre} {acceso.usuario.apellido}</div>
                                {acceso.usuario.telefono && <div style={{ fontSize:'11px', color:'var(--gray-400)', fontFamily:"'DM Sans', sans-serif" }}>{acceso.usuario.telefono}</div>}
                              </div>
                            </div>
                          </td>
                          <td style={{ padding:'12px 16px', fontSize:'13px', color:'var(--gray-600)', fontFamily:"'DM Sans', sans-serif" }}>{acceso.usuario.email}</td>
                          <td style={{ padding:'12px 16px' }}>
                            <span style={{ display:'inline-block', padding:'3px 8px', borderRadius:'20px', fontSize:'11px', fontWeight:700, background:es.bg, color:es.color, fontFamily:"'Plus Jakarta Sans', sans-serif", textTransform:'capitalize' }}>
                              {acceso.estado}
                            </span>
                          </td>
                          <td style={{ padding:'12px 16px', fontSize:'12px', color:'var(--gray-500)', fontFamily:"'DM Sans', sans-serif" }}>
                            {acceso.pago ? (
                              <span style={{ fontFamily:"'JetBrains Mono', monospace", fontSize:'11px', color:'var(--gray-700)', fontWeight:700 }}>{acceso.pago.referencia}</span>
                            ) : <span style={{ color:'var(--gray-300)' }}>—</span>}
                          </td>
                          <td style={{ padding:'12px 16px', fontSize:'12px', color:'var(--gray-500)', fontFamily:"'DM Sans', sans-serif", whiteSpace:'nowrap' }}>{formatDate(acceso.fechaSolicitud)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
            <div style={{ padding:'14px 24px', background:'var(--gray-50)', borderTop:'1px solid var(--border)', flexShrink:0, display:'flex', justifyContent:'space-between', alignItems:'center' }}>
              <span style={{ fontSize:'13px', color:'var(--gray-500)', fontFamily:"'DM Sans', sans-serif" }}>{accesos.length} solicitud{accesos.length !== 1 ? 'es' : ''}</span>
              <button onClick={() => setShowAccesosModal(false)} style={{ padding:'8px 18px', border:'1px solid var(--border)', borderRadius:'var(--radius-md)', background:'#fff', color:'var(--gray-700)', fontSize:'13px', fontWeight:600, fontFamily:"'DM Sans', sans-serif", cursor:'pointer', transition:'all 150ms ease' }} onMouseEnter={e => e.currentTarget.style.background='var(--gray-100)'} onMouseLeave={e => e.currentTarget.style.background='#fff'}>Cerrar</button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL PAGOS PENDIENTES */}
      {showPagosModal && (
        <div onClick={() => setShowPagosModal(false)} style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.42)', backdropFilter:'blur(4px)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:1000, padding:'20px' }}>
          <div className="enlace-modal" onClick={e => e.stopPropagation()} style={{ background:'#fff', borderRadius:'var(--radius-lg)', width:'100%', maxWidth:'780px', maxHeight:'90vh', display:'flex', flexDirection:'column', boxShadow:'0 24px 64px rgba(0,0,0,0.18)', overflow:'hidden' }}>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'20px 24px', background:'#FFF7ED', borderBottom:'1px solid #FED7AA', flexShrink:0 }}>
              <div style={{ display:'flex', alignItems:'center', gap:'12px' }}>
                <div style={{ width:'36px', height:'36px', background:'linear-gradient(135deg, #FB923C, #EA580C)', borderRadius:'var(--radius-md)', display:'flex', alignItems:'center', justifyContent:'center' }}>
                  <CreditCard style={{ width:'18px', height:'18px', color:'#fff' }} />
                </div>
                <div>
                  <h2 style={{ fontSize:'17px', fontWeight:800, color:'#9A3412', fontFamily:"'Plus Jakarta Sans', sans-serif", margin:0 }}>Pagos pendientes de acceso</h2>
                  <p style={{ fontSize:'12px', color:'#C2410C', margin:'2px 0 0', fontFamily:"'DM Sans', sans-serif" }}>
                    {pagosPendientes.length} pago{pagosPendientes.length !== 1 ? 's' : ''} por revisar
                  </p>
                </div>
              </div>
              <button onClick={() => setShowPagosModal(false)} style={{ width:'32px', height:'32px', border:'none', borderRadius:'var(--radius-sm)', background:'transparent', cursor:'pointer', color:'#C2410C', display:'flex', alignItems:'center', justifyContent:'center' }} onMouseEnter={e => e.currentTarget.style.background='#FFEDD5'} onMouseLeave={e => e.currentTarget.style.background='transparent'}>
                <X style={{ width:'18px', height:'18px' }} />
              </button>
            </div>

            {pagosPendientes.length > 0 && (
              <div style={{ padding:'12px 24px', background:'#FFFBEB', borderBottom:'1px solid #FDE68A', flexShrink:0, display:'flex', alignItems:'center', gap:'8px' }}>
                <AlertTriangle style={{ width:'14px', height:'14px', color:'#B45309', flexShrink:0 }} />
                <span style={{ fontSize:'12px', color:'#92400E', fontFamily:"'DM Sans', sans-serif", lineHeight:1.4 }}>
                  Verifica cada transferencia en tu portal bancario antes de confirmar. Si el pago no corresponde, usa el botón <strong>Declinar</strong> para notificar al cliente.
                </span>
              </div>
            )}

            <div style={{ overflowY:'auto', flex:1 }}>
              {pagosPendientes.length === 0 ? (
                <div style={{ padding:'60px 20px', textAlign:'center' }}>
                  <div style={{ width:'56px', height:'56px', background:'#F0FDF4', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 14px' }}>
                    <CheckCircle style={{ width:'26px', height:'26px', color:'#16A34A' }} />
                  </div>
                  <p style={{ fontSize:'15px', fontWeight:600, color:'var(--gray-700)', margin:'0 0 6px', fontFamily:"'Plus Jakarta Sans', sans-serif" }}>Sin pagos pendientes</p>
                  <p style={{ fontSize:'13px', color:'var(--gray-400)', margin:0, fontFamily:"'DM Sans', sans-serif" }}>Todos los accesos han sido revisados</p>
                </div>
              ) : (
                <div style={{ padding:'20px 24px', display:'flex', flexDirection:'column', gap:'12px' }}>
                  {pagosPendientes.map(pago => {
                    const estaConfirmando = confirmandoPago === pago.id;
                    const estaDeclinando = declinandoPago === pago.id;
                    return (
                      <div key={pago.id} style={{ border:'1px solid var(--border)', borderRadius:'var(--radius-lg)', overflow:'hidden', background:'#fff' }}>
                        <div style={{ padding:'16px 20px', display:'flex', alignItems:'flex-start', justifyContent:'space-between', gap:'16px', flexWrap:'wrap' }}>
                          <div style={{ display:'flex', alignItems:'flex-start', gap:'14px', flex:1, minWidth:'260px' }}>
                            <div style={{ width:'40px', height:'40px', background:'#EEF4FF', borderRadius:'var(--radius-md)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                              <Banknote style={{ width:'18px', height:'18px', color:'var(--capyme-blue-mid)' }} />
                            </div>
                            <div style={{ flex:1 }}>
                              <div style={{ fontSize:'15px', fontWeight:700, color:'var(--gray-900)', fontFamily:"'Plus Jakarta Sans', sans-serif", marginBottom:'2px' }}>
                                {pago.acceso.usuario.nombre} {pago.acceso.usuario.apellido}
                              </div>
                              <div style={{ fontSize:'13px', color:'var(--gray-500)', fontFamily:"'DM Sans', sans-serif", marginBottom:'2px' }}>{pago.acceso.enlace.titulo}</div>
                              {pago.acceso.usuario.email && <div style={{ fontSize:'12px', color:'var(--gray-400)', fontFamily:"'DM Sans', sans-serif" }}>{pago.acceso.usuario.email}</div>}
                              {pago.acceso.usuario.telefono && <div style={{ fontSize:'12px', color:'var(--gray-400)', fontFamily:"'DM Sans', sans-serif" }}>{pago.acceso.usuario.telefono}</div>}
                            </div>
                          </div>
                          <div style={{ display:'flex', flexDirection:'column', alignItems:'flex-end', gap:'8px', flexShrink:0 }}>
                            <span style={{ fontSize:'20px', fontWeight:800, color:'var(--gray-900)', fontFamily:"'Plus Jakarta Sans', sans-serif" }}>
                              {formatCurrency(pago.monto)}
                            </span>
                            <div style={{ textAlign:'right' }}>
                              <div style={{ fontSize:'10px', color:'var(--gray-400)', fontFamily:"'DM Sans', sans-serif", fontWeight:600, textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:'2px' }}>Referencia</div>
                              <div style={{ fontSize:'13px', fontWeight:700, color:'var(--gray-800)', fontFamily:"'JetBrains Mono', monospace", letterSpacing:'0.04em' }}>{pago.referencia}</div>
                            </div>
                            <div style={{ fontSize:'11px', color:'var(--gray-400)', fontFamily:"'DM Sans', sans-serif" }}>Solicitado: {formatDate(pago.fechaCreacion)}</div>
                          </div>
                        </div>
                        <div style={{ padding:'12px 20px', background:'var(--gray-50)', borderTop:'1px solid var(--border)', display:'flex', justifyContent:'flex-end', gap:'8px' }}>
                          <button onClick={() => { setPagoToDeclinar(pago); setShowDeclinarModal(true); }} disabled={estaDeclinando || estaConfirmando} style={{ display:'flex', alignItems:'center', gap:'7px', padding:'9px 18px', border:'1.5px solid #FECACA', borderRadius:'var(--radius-md)', background:'#FEF2F2', color:'#B91C1C', fontSize:'13px', fontWeight:600, fontFamily:"'DM Sans', sans-serif", cursor: (estaDeclinando || estaConfirmando) ? 'not-allowed' : 'pointer', opacity: (estaDeclinando || estaConfirmando) ? 0.5 : 1, transition:'all 150ms ease' }} onMouseEnter={e => { if (!estaDeclinando && !estaConfirmando) { e.currentTarget.style.background='#FEE2E2'; e.currentTarget.style.borderColor='#F87171'; } }} onMouseLeave={e => { e.currentTarget.style.background='#FEF2F2'; e.currentTarget.style.borderColor='#FECACA'; }}>
                            <XCircle style={{ width:'15px', height:'15px' }} />
                            Declinar acceso
                          </button>
                          <button onClick={() => { setPagoToConfirm(pago); setShowConfirmModal(true); }} disabled={estaConfirmando || estaDeclinando} style={{ display:'flex', alignItems:'center', gap:'8px', padding:'9px 20px', border:'none', borderRadius:'var(--radius-md)', background: (estaConfirmando || estaDeclinando) ? 'var(--gray-300)' : 'linear-gradient(135deg, #16A34A, #15803D)', color:'#fff', fontSize:'13px', fontWeight:600, fontFamily:"'DM Sans', sans-serif", cursor: (estaConfirmando || estaDeclinando) ? 'not-allowed' : 'pointer', boxShadow: (estaConfirmando || estaDeclinando) ? 'none' : '0 2px 8px rgba(22,163,74,0.28)', transition:'all 150ms ease' }}>
                            {estaConfirmando
                              ? <><span style={{ width:'13px', height:'13px', border:'2px solid rgba(255,255,255,0.4)', borderTopColor:'#fff', borderRadius:'50%', display:'inline-block', animation:'spin 0.7s linear infinite' }} />Confirmando...</>
                              : <><CheckCircle style={{ width:'15px', height:'15px' }} />Confirmar pago recibido</>
                            }
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
            <div style={{ padding:'14px 24px', background:'var(--gray-50)', borderTop:'1px solid var(--border)', flexShrink:0, display:'flex', justifyContent:'flex-end' }}>
              <button onClick={() => setShowPagosModal(false)} style={{ padding:'8px 18px', border:'1px solid var(--border)', borderRadius:'var(--radius-md)', background:'#fff', color:'var(--gray-700)', fontSize:'13px', fontWeight:600, fontFamily:"'DM Sans', sans-serif", cursor:'pointer', transition:'all 150ms ease' }} onMouseEnter={e => e.currentTarget.style.background='var(--gray-100)'} onMouseLeave={e => e.currentTarget.style.background='#fff'}>Cerrar</button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL CONFIRMAR PAGO */}
      {showConfirmModal && pagoToConfirm && (
        <div onClick={() => setShowConfirmModal(false)} style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.42)', backdropFilter:'blur(4px)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:1100, padding:'20px' }}>
          <div className="enlace-modal" onClick={e => e.stopPropagation()} style={{ background:'#fff', borderRadius:'var(--radius-lg)', width:'100%', maxWidth:'500px', boxShadow:'0 24px 64px rgba(0,0,0,0.25)', overflow:'hidden' }}>
            <div style={{ background:'#F0FDF4', padding:'20px 24px', borderBottom:'1px solid #BBF7D0', display:'flex', alignItems:'center', gap:'14px' }}>
              <div style={{ width:'44px', height:'44px', background:'#16A34A', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', boxShadow:'0 4px 12px rgba(22,163,74,0.25)' }}>
                <CheckCircle style={{ width:'22px', height:'22px', color:'#fff' }} />
              </div>
              <div>
                <h3 style={{ fontSize:'18px', fontWeight:800, color:'#14532D', fontFamily:"'Plus Jakarta Sans', sans-serif", margin:'0 0 2px' }}>Confirmar recepción de pago</h3>
                <p style={{ fontSize:'13px', color:'#166534', margin:0, fontFamily:"'DM Sans', sans-serif", fontWeight:500 }}>Esta acción no se puede deshacer</p>
              </div>
            </div>
            <div style={{ padding:'24px' }}>
              <div style={{ background:'#F9FAFB', borderRadius:'var(--radius-md)', padding:'16px', marginBottom:'20px', border:'1px solid var(--border)' }}>
                <div style={{ display:'flex', alignItems:'center', gap:'12px', marginBottom:'12px', paddingBottom:'12px', borderBottom:'1px dashed var(--border)' }}>
                  <div style={{ flex:1 }}>
                    <div style={{ fontSize:'15px', fontWeight:700, color:'var(--gray-900)', fontFamily:"'Plus Jakarta Sans', sans-serif", marginBottom:'2px' }}>
                      {pagoToConfirm.acceso.usuario.nombre} {pagoToConfirm.acceso.usuario.apellido}
                    </div>
                    <div style={{ fontSize:'13px', color:'var(--gray-500)', fontFamily:"'DM Sans', sans-serif" }}>{pagoToConfirm.acceso.enlace.titulo}</div>
                  </div>
                  <span style={{ fontSize:'20px', fontWeight:800, color:'var(--gray-900)', fontFamily:"'Plus Jakarta Sans', sans-serif" }}>{formatCurrency(pagoToConfirm.monto)}</span>
                </div>
                <div style={{ background:'#FFFBEB', borderRadius:'var(--radius-sm)', padding:'10px 12px', display:'flex', alignItems:'center', gap:'8px' }}>
                  <Shield style={{ width:'15px', height:'15px', color:'#B45309', flexShrink:0 }} />
                  <span style={{ fontSize:'12px', color:'#92400E', fontFamily:"'DM Sans', sans-serif", lineHeight:1.4 }}>
                    Verifica que la transferencia aparezca en tu estado de cuenta antes de confirmar.
                  </span>
                </div>
              </div>
              <div style={{ display:'flex', gap:'12px', justifyContent:'flex-end' }}>
                <button onClick={() => setShowConfirmModal(false)} style={{ padding:'10px 18px', border:'1px solid var(--border)', borderRadius:'var(--radius-md)', background:'#fff', color:'var(--gray-700)', fontSize:'14px', fontWeight:600, fontFamily:"'DM Sans', sans-serif", cursor:'pointer', transition:'all 150ms ease' }} onMouseEnter={e => e.currentTarget.style.background='var(--gray-100)'} onMouseLeave={e => e.currentTarget.style.background='#fff'}>Cancelar</button>
                <button onClick={handleConfirmarPago} disabled={confirmandoPago === pagoToConfirm.id} style={{ display:'flex', alignItems:'center', gap:'8px', padding:'10px 22px', border:'none', borderRadius:'var(--radius-md)', background: confirmandoPago === pagoToConfirm.id ? 'var(--gray-300)' : 'linear-gradient(135deg, #16A34A, #15803D)', color:'#fff', fontSize:'14px', fontWeight:600, fontFamily:"'DM Sans', sans-serif", cursor: confirmandoPago === pagoToConfirm.id ? 'not-allowed' : 'pointer', boxShadow: confirmandoPago === pagoToConfirm.id ? 'none' : '0 2px 8px rgba(22,163,74,0.28)', transition:'all 150ms ease' }}>
                  {confirmandoPago === pagoToConfirm.id
                    ? <><span style={{ width:'14px', height:'14px', border:'2px solid rgba(255,255,255,0.4)', borderTopColor:'#fff', borderRadius:'50%', display:'inline-block', animation:'spin 0.7s linear infinite' }} />Confirmando...</>
                    : <><CheckCircle style={{ width:'16px', height:'16px' }} />Sí, confirmar pago</>
                  }
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL DECLINAR */}
      {showDeclinarModal && pagoToDeclinar && (
        <div onClick={() => setShowDeclinarModal(false)} style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.42)', backdropFilter:'blur(4px)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:1100, padding:'20px' }}>
          <div className="enlace-modal" onClick={e => e.stopPropagation()} style={{ background:'#fff', borderRadius:'var(--radius-lg)', width:'100%', maxWidth:'500px', boxShadow:'0 24px 64px rgba(0,0,0,0.25)', overflow:'hidden' }}>
            <div style={{ background:'#FEF2F2', padding:'20px 24px', borderBottom:'1px solid #FECACA', display:'flex', alignItems:'center', gap:'14px' }}>
              <div style={{ width:'44px', height:'44px', background:'#EF4444', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', boxShadow:'0 4px 12px rgba(239,68,68,0.25)' }}>
                <XCircle style={{ width:'22px', height:'22px', color:'#fff' }} />
              </div>
              <div>
                <h3 style={{ fontSize:'18px', fontWeight:800, color:'#7F1D1D', fontFamily:"'Plus Jakarta Sans', sans-serif", margin:'0 0 2px' }}>Declinar solicitud de acceso</h3>
                <p style={{ fontSize:'13px', color:'#B91C1C', margin:0, fontFamily:"'DM Sans', sans-serif", fontWeight:500 }}>El cliente será notificado de esta decisión</p>
              </div>
            </div>
            <div style={{ padding:'24px' }}>
              <div style={{ background:'#F9FAFB', borderRadius:'var(--radius-md)', padding:'16px', marginBottom:'16px', border:'1px solid var(--border)' }}>
                <div style={{ fontSize:'15px', fontWeight:700, color:'var(--gray-900)', fontFamily:"'Plus Jakarta Sans', sans-serif", marginBottom:'4px' }}>
                  {pagoToDeclinar.acceso.usuario.nombre} {pagoToDeclinar.acceso.usuario.apellido}
                </div>
                <div style={{ fontSize:'13px', color:'var(--gray-500)', fontFamily:"'DM Sans', sans-serif", marginBottom:'2px' }}>{pagoToDeclinar.acceso.enlace.titulo}</div>
                <div style={{ fontSize:'13px', color:'var(--gray-400)', fontFamily:"'DM Sans', sans-serif" }}>{pagoToDeclinar.acceso.usuario.email}</div>
              </div>
              <div style={{ background:'#FEF2F2', borderRadius:'var(--radius-md)', padding:'12px 14px', marginBottom:'20px', display:'flex', alignItems:'flex-start', gap:'8px', border:'1px solid #FECACA' }}>
                <AlertTriangle style={{ width:'14px', height:'14px', color:'#DC2626', flexShrink:0, marginTop:'2px' }} />
                <p style={{ fontSize:'12px', color:'#991B1B', fontFamily:"'DM Sans', sans-serif", margin:0, lineHeight:1.5 }}>
                  La solicitud de acceso será cancelada y se enviará una notificación al cliente. Esta acción no se puede deshacer.
                </p>
              </div>
              <div style={{ display:'flex', gap:'12px', justifyContent:'flex-end' }}>
                <button onClick={() => setShowDeclinarModal(false)} style={{ padding:'10px 18px', border:'1px solid var(--border)', borderRadius:'var(--radius-md)', background:'#fff', color:'var(--gray-700)', fontSize:'14px', fontWeight:600, fontFamily:"'DM Sans', sans-serif", cursor:'pointer', transition:'all 150ms ease' }} onMouseEnter={e => e.currentTarget.style.background='var(--gray-100)'} onMouseLeave={e => e.currentTarget.style.background='#fff'}>Cancelar</button>
                <button onClick={handleDeclinarPago} disabled={declinandoPago === pagoToDeclinar.id} style={{ display:'flex', alignItems:'center', gap:'8px', padding:'10px 22px', border:'none', borderRadius:'var(--radius-md)', background: declinandoPago === pagoToDeclinar.id ? 'var(--gray-300)' : 'linear-gradient(135deg, #EF4444, #DC2626)', color:'#fff', fontSize:'14px', fontWeight:600, fontFamily:"'DM Sans', sans-serif", cursor: declinandoPago === pagoToDeclinar.id ? 'not-allowed' : 'pointer', boxShadow: declinandoPago === pagoToDeclinar.id ? 'none' : '0 2px 8px rgba(239,68,68,0.30)', transition:'all 150ms ease' }}>
                  {declinandoPago === pagoToDeclinar.id
                    ? <><span style={{ width:'14px', height:'14px', border:'2px solid rgba(255,255,255,0.4)', borderTopColor:'#fff', borderRadius:'50%', display:'inline-block', animation:'spin 0.7s linear infinite' }} />Declinando...</>
                    : <><XCircle style={{ width:'16px', height:'16px' }} />Sí, declinar acceso</>
                  }
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <ConfirmModal config={confirmConfig} onClose={closeConfirm} />
    </Layout>
  );
};

export default Enlaces;