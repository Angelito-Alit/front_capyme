import { useState, useEffect } from 'react';
import Layout from '../components/common/Layout';
import { postulacionesService } from '../services/postulacionesService';
import api from '../services/axios';
import {
  ClipboardList,
  Plus,
  Search,
  Edit,
  Eye,
  X,
  Building2,
  FileText,
  User,
  Calendar,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  ChevronDown,
  LayoutGrid,
  List,
  MapPin,
  Tag,
  ToggleLeft,
  ToggleRight,
  Trash2,
  AlertTriangle,
} from 'lucide-react';
import { toast } from 'react-hot-toast';

const ESTADOS_MEXICO = [
  { nombre: 'Aguascalientes', municipios: ['Aguascalientes','Asientos','Calvillo','Cosío','Jesús María','Pabellón de Arteaga','Rincón de Romos','San José de Gracia','Tepezalá','El Llano','San Francisco de los Romo'] },
  { nombre: 'Baja California', municipios: ['Ensenada','Mexicali','Tecate','Tijuana','Playas de Rosarito','San Quintín'] },
  { nombre: 'Baja California Sur', municipios: ['Comondú','Mulegé','La Paz','Los Cabos','Loreto'] },
  { nombre: 'Campeche', municipios: ['Calkiní','Campeche','Carmen','Champotón','Hecelchakán','Hopelchén','Palizada','Tenabo','Escárcega','Calakmul','Candelaria'] },
  { nombre: 'Chiapas', municipios: ['Comitán de Domínguez','San Cristóbal de las Casas','Tapachula','Tuxtla Gutiérrez','Chiapa de Corzo','Ocosingo','Palenque','Tonalá','Villaflores'] },
  { nombre: 'Chihuahua', municipios: ['Chihuahua','Ciudad Juárez','Delicias','Cuauhtémoc','Hidalgo del Parral','Ojinaga','Camargo'] },
  { nombre: 'Ciudad de México', municipios: ['Álvaro Obregón','Azcapotzalco','Benito Juárez','Coyoacán','Cuajimalpa','Cuauhtémoc','GAM','Iztacalco','Iztapalapa','Magdalena Contreras','Miguel Hidalgo','Milpa Alta','Tláhuac','Tlalpan','Venustiano Carranza','Xochimilco'] },
  { nombre: 'Coahuila', municipios: ['Saltillo','Torreón','Monclova','Piedras Negras','Acuña','Ramos Arizpe','San Pedro'] },
  { nombre: 'Colima', municipios: ['Colima','Coquimatlán','Comala','Cuauhtémoc','Ixtlahuacán','Manzanillo','Minatitlán','Tecomán','Villa de Álvarez','Armería','Aquila'] },
  { nombre: 'Durango', municipios: ['Durango','Gómez Palacio','Lerdo','Santiago Papasquiaro','El Salto'] },
  { nombre: 'Estado de México', municipios: ['Toluca','Ecatepec','Naucalpan','Nezahualcóyotl','Tlalnepantla','Chimalhuacán','Ixtapaluca','Texcoco','Valle de Chalco','Metepec','Cuautitlán Izcalli','Tultitlán'] },
  { nombre: 'Guanajuato', municipios: ['Guanajuato','León','Irapuato','Celaya','Salamanca','Silao','San Miguel de Allende','Dolores Hidalgo','Pénjamo','Acámbaro'] },
  { nombre: 'Guerrero', municipios: ['Acapulco','Chilpancingo','Iguala','Zihuatanejo-Ixtapa','Taxco','Chilapa de Álvarez','Tlapa de Comonfort'] },
  { nombre: 'Hidalgo', municipios: ['Pachuca','Tulancingo','Tula de Allende','Actopan','Huejutla','Apan','Ixmiquilpan','Tizayuca'] },
  { nombre: 'Jalisco', municipios: ['Guadalajara','Zapopan','Tlaquepaque','Tonalá','Puerto Vallarta','Tlajomulco de Zúñiga','Lagos de Moreno','Ocotlán','Tepatitlán','Autlán'] },
  { nombre: 'Michoacán', municipios: ['Morelia','Uruapan','Lázaro Cárdenas','Apatzingán','Zamora','Zitácuaro','Pátzcuaro','Sahuayo'] },
  { nombre: 'Morelos', municipios: ['Cuernavaca','Jiutepec','Temixco','Cuautla','Jojutla','Yautepec','Tlanepantla','Ayala','Emiliano Zapata'] },
  { nombre: 'Nayarit', municipios: ['Tepic','Bahía de Banderas','Compostela','Santiago Ixcuintla','Ixtlán del Río','Acaponeta','Tecuala'] },
  { nombre: 'Nuevo León', municipios: ['Monterrey','Guadalupe','San Nicolás de los Garza','Apodaca','General Escobedo','Santa Catarina','San Pedro Garza García','Juárez','Linares','Montemorelos'] },
  { nombre: 'Oaxaca', municipios: ['Oaxaca de Juárez','San Juan Bautista Tuxtepec','Juchitán de Zaragoza','Salina Cruz','Huajuapan de León','Miahuatlán de Porfirio Díaz','Tlaxiaco'] },
  { nombre: 'Puebla', municipios: ['Puebla','Tehuacán','San Martín Texmelucan','Atlixco','Cholula','Huauchinango','Teziutlán','Izúcar de Matamoros'] },
  { nombre: 'Querétaro', municipios: ['Querétaro','San Juan del Río','El Marqués','Corregidora','Tequisquiapan','Amealco','Jalpan de Serra','Cadereyta de Montes'] },
  { nombre: 'Quintana Roo', municipios: ['Cancún','Playa del Carmen','Chetumal','Cozumel','Tulum','Felipe Carrillo Puerto','Isla Mujeres','Bacalar'] },
  { nombre: 'San Luis Potosí', municipios: ['San Luis Potosí','Ciudad Valles','Matehuala','Rioverde','Tamazunchale','Soledad de Graciano Sánchez','Cárdenas','Tamuín'] },
  { nombre: 'Sinaloa', municipios: ['Culiacán','Mazatlán','Los Mochis','Guasave','Guamúchil','Navolato','El Fuerte'] },
  { nombre: 'Sonora', municipios: ['Hermosillo','Ciudad Obregón','Nogales','San Luis Río Colorado','Navojoa','Guaymas','Cajeme','Caborca'] },
  { nombre: 'Tabasco', municipios: ['Villahermosa','Cárdenas','Comalcalco','Cunduacán','Huimanguillo','Macuspana','Nacajuca','Paraíso'] },
  { nombre: 'Tamaulipas', municipios: ['Tampico','Reynosa','Matamoros','Nuevo Laredo','Ciudad Victoria','Altamira','Madero','Mante'] },
  { nombre: 'Tlaxcala', municipios: ['Tlaxcala','Apizaco','Chiautempan','Huamantla','Calpulalpan','Zacatelco','Contla de Juan Cuamatzi'] },
  { nombre: 'Veracruz', municipios: ['Veracruz','Xalapa','Coatzacoalcos','Córdoba','Orizaba','Poza Rica','Tuxpan','Minatitlán','Boca del Río','Acayucan'] },
  { nombre: 'Yucatán', municipios: ['Mérida','Valladolid','Tizimín','Progreso','Motul','Ticul','Izamal','Tekax'] },
  { nombre: 'Zacatecas', municipios: ['Zacatecas','Fresnillo','Guadalupe','Jerez','Calera','Sombrerete','Tlaltenango'] },
];

const ESTADOS_CONFIG = {
  pendiente:    { label: 'Pendiente',   bg: '#FEF3C7', color: '#92400E', Icon: Clock },
  en_revision:  { label: 'En Revisión',  bg: '#DBEAFE', color: '#1E40AF', Icon: AlertCircle },
  aprobada:     { label: 'Aprobada',     bg: '#D1FAE5', color: '#065F46', Icon: CheckCircle },
  rechazada:    { label: 'Rechazada',    bg: '#FEE2E2', color: '#991B1B', Icon: XCircle },
  completada:   { label: 'Completada',   bg: '#EDE9FE', color: '#5B21B6', Icon: CheckCircle },
};

const initialFormData = {
  negocioId: '',
  programaId: '',
  usuarioId: '',
  estadoGeo: '',
  municipio: '',
};

const initialEstadoData = {
  estado: 'pendiente',
  notasAdmin: '',
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
  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2px' }}>
    <Icon style={{ width: '15px', height: '15px', color: 'var(--capyme-blue-mid)' }} />
    <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--capyme-blue-mid)', textTransform: 'uppercase', letterSpacing: '0.05em', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      {text}
    </span>
    <div style={{ flex: 1, height: '1px', background: 'var(--border)', marginLeft: '4px' }} />
  </div>
);

const ErrorMsg = ({ text }) => (
  <p style={{ marginTop: '4px', fontSize: '12px', color: '#EF4444', display: 'flex', alignItems: 'center', gap: '4px', fontFamily: "'DM Sans', sans-serif" }}>
    <AlertCircle style={{ width: '12px', height: '12px' }} /> {text}
  </p>
);

const formatDate = (date) => {
  if (!date) return 'N/A';
  return new Date(date).toLocaleDateString('es-MX', { year: 'numeric', month: 'short', day: 'numeric' });
};

const Postulaciones = () => {
  const authStorage = JSON.parse(localStorage.getItem('auth-storage') || '{}');
  const currentUser = authStorage?.state?.user || {};

  const [postulaciones, setPostulaciones] = useState([]);
  const [programas, setProgramas] = useState([]);
  const [negocios, setNegocios] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [showModal, setShowModal] = useState(false);
  const [showDetalle, setShowDetalle] = useState(false);
  const [showEstado, setShowEstado] = useState(false);
  const [modalMode, setModalMode] = useState('create');
  const [selectedPost, setSelectedPost] = useState(null);

  const [confirmConfig, setConfirmConfig] = useState({ show: false });
  const showConfirm = (cfg) => setConfirmConfig({ show: true, ...cfg });
  const closeConfirm = () => setConfirmConfig({ show: false });

  const [searchTerm, setSearchTerm] = useState('');
  const [filterPrograma, setFilterPrograma] = useState('');
  const [filterEstadoPost, setFilterEstadoPost] = useState('');
  const [filterEstadoGeo, setFilterEstadoGeo] = useState('');
  const [filterMunicipio, setFilterMunicipio] = useState('');
  const [viewMode, setViewMode] = useState('list');

  const [formData, setFormData] = useState(initialFormData);
  const [formErrors, setFormErrors] = useState({});
  const [estadoData, setEstadoData] = useState(initialEstadoData);
  const [hoveredRow, setHoveredRow] = useState(null);

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
    color: 'var(--gray-600)', marginBottom: '6px',
    fontFamily: "'DM Sans', sans-serif",
  };
  const selectStyle = { ...inputBaseStyle, appearance: 'none', paddingRight: '36px', cursor: 'pointer' };
  const textareaStyle = { ...inputBaseStyle, resize: 'vertical', minHeight: '90px' };

  useEffect(() => { cargarDatos(); }, [filterPrograma, filterEstadoPost, filterEstadoGeo, filterMunicipio]);

  const cargarDatos = async () => {
    try {
      setLoading(true);
      const params = {};
      if (filterPrograma) params.programaId = filterPrograma;
      if (filterEstadoPost) params.estado = filterEstadoPost;
      if (filterEstadoGeo) params.estadoGeo = filterEstadoGeo;
      if (filterMunicipio) params.municipio = filterMunicipio;

      const requests = [
        postulacionesService.getAll(params),
        api.get('/programas'),
      ];
      if (['admin', 'colaborador'].includes(currentUser.rol)) {
        requests.push(api.get('/negocios'));
        requests.push(api.get('/usuarios'));
      }

      const [postRes, progRes, negRes, usrRes] = await Promise.all(requests);
      setPostulaciones(postRes.data);
      setProgramas(progRes.data.data || []);
      if (negRes) setNegocios(negRes.data.data || []);
      if (usrRes) setUsuarios(usrRes.data.data || []);
    } catch {
      toast.error('Error al cargar postulaciones');
    } finally {
      setLoading(false);
    }
  };

  const postulacionesFiltradas = postulaciones.filter(p => {
    const texto = searchTerm.toLowerCase();
    return (
      p.negocio?.nombreNegocio?.toLowerCase().includes(texto) ||
      p.programa?.nombre?.toLowerCase().includes(texto) ||
      p.usuario?.nombre?.toLowerCase().includes(texto) ||
      p.usuario?.apellido?.toLowerCase().includes(texto) ||
      (p.estadoGeo || '').toLowerCase().includes(texto) ||
      (p.municipio || '').toLowerCase().includes(texto)
    );
  });

  const stats = [
    { label: 'Total', value: postulaciones.length, color: 'var(--capyme-blue-mid)' },
    { label: 'Pendientes', value: postulaciones.filter(p => p.estado === 'pendiente').length, color: '#92400E' },
    { label: 'En Revisión', value: postulaciones.filter(p => p.estado === 'en_revision').length, color: '#1E40AF' },
    { label: 'Aprobadas', value: postulaciones.filter(p => p.estado === 'aprobada').length, color: '#065F46' },
    { label: 'Completadas', value: postulaciones.filter(p => p.estado === 'completada').length, color: '#5B21B6' },
  ];

  const handleOpenCreate = () => {
    setModalMode('create');
    setSelectedPost(null);
    setFormData(initialFormData);
    setFormErrors({});
    setShowModal(true);
  };

  const handleOpenEdit = (post) => {
    setModalMode('edit');
    setSelectedPost(post);
    setFormData({
      negocioId: post.negocioId || '',
      programaId: post.programaId || '',
      usuarioId: post.usuarioId || '',
      estadoGeo: post.estadoGeo || '',
      municipio: post.municipio || '',
    });
    setFormErrors({});
    setShowModal(true);
  };

  const handleOpenDetalle = async (id) => {
    try {
      const res = await postulacionesService.getById(id);
      setSelectedPost(res.data);
      setShowDetalle(true);
    } catch {
      toast.error('Error al cargar detalles');
    }
  };

  const handleOpenEstado = (post) => {
    setSelectedPost(post);
    setEstadoData({ estado: post.estado || 'pendiente', notasAdmin: post.notasAdmin || '' });
    setShowEstado(true);
  };

  const handleCloseAll = () => {
    setShowModal(false);
    setShowDetalle(false);
    setShowEstado(false);
    setSelectedPost(null);
    setFormErrors({});
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.negocioId) errors.negocioId = 'Selecciona un negocio';
    if (!formData.programaId) errors.programaId = 'Selecciona un programa';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const isFormValid = formData.negocioId !== '' && formData.programaId !== '';

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'estadoGeo') {
      setFormData(prev => ({ ...prev, estadoGeo: value, municipio: '' }));
    } else if (name === 'negocioId') {
      const negocioSeleccionado = negocios.find(n => n.id === parseInt(value));
      setFormData(prev => ({
        ...prev,
        negocioId: value,
        usuarioId: negocioSeleccionado?.usuarioId || negocioSeleccionado?.usuario?.id || '',
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
    if (formErrors[name]) setFormErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    setSubmitting(true);
    try {
      if (modalMode === 'create') {
        const negocioSeleccionado = negocios.find(n => n.id === parseInt(formData.negocioId));
        const propietarioId = negocioSeleccionado?.usuarioId || negocioSeleccionado?.usuario?.id;
        const dataToSend = {
          negocioId: parseInt(formData.negocioId),
          programaId: parseInt(formData.programaId),
          usuarioId: propietarioId ? parseInt(propietarioId) : undefined,
          estadoGeo: formData.estadoGeo || null,
          municipio: formData.municipio || null,
        };
        await postulacionesService.create(dataToSend);
        toast.success('Postulación creada exitosamente');
      } else {
        const dataToSend = {
          estadoGeo: formData.estadoGeo || null,
          municipio: formData.municipio || null,
        };
        if (currentUser.rol === 'admin') {
          if (formData.negocioId) dataToSend.negocioId = parseInt(formData.negocioId);
          if (formData.programaId) dataToSend.programaId = parseInt(formData.programaId);
          if (formData.negocioId && formData.negocioId !== String(selectedPost.negocioId)) {
            const negocioNuevo = negocios.find(n => n.id === parseInt(formData.negocioId));
            const nuevoPropietario = negocioNuevo?.usuarioId || negocioNuevo?.usuario?.id;
            if (nuevoPropietario) dataToSend.usuarioId = parseInt(nuevoPropietario);
          }
        }
        await postulacionesService.update(selectedPost.id, dataToSend);
        toast.success('Postulación actualizada exitosamente');
      }
      handleCloseAll();
      cargarDatos();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error al guardar');
    } finally {
      setSubmitting(false);
    }
  };

  const handleActualizarEstado = async () => {
    try {
      await postulacionesService.updateEstado(selectedPost.id, estadoData.estado, estadoData.notasAdmin);
      toast.success('Estado actualizado');
      handleCloseAll();
      cargarDatos();
    } catch {
      toast.error('Error al actualizar estado');
    }
  };

  const handleToggleActivo = (post) => {
    const marcarCompletada = post.estado !== 'completada';
    showConfirm({
      variant: marcarCompletada ? 'warning' : 'danger',
      title: marcarCompletada ? 'Marcar como completada' : 'Marcar como pendiente',
      subtitle: marcarCompletada
        ? 'La postulación pasará al estado completada'
        : 'La postulación volverá al estado pendiente',
      message: `¿Confirmas cambiar el estado de la postulación de "${post.negocio?.nombreNegocio}"?`,
      confirmLabel: marcarCompletada ? 'Sí, completar' : 'Sí, marcar pendiente',
      onConfirm: async () => {
        try {
          await postulacionesService.toggleActivo(post.id);
          toast.success('Estado cambiado exitosamente');
          cargarDatos();
        } catch {
          toast.error('Error al cambiar estado');
        }
      },
    });
  };

  const EstadoBadge = ({ estado }) => {
    const cfg = ESTADOS_CONFIG[estado] || ESTADOS_CONFIG.pendiente;
    const { Icon } = cfg;
    return (
      <span style={{
        display: 'inline-flex', alignItems: 'center', gap: '5px',
        padding: '3px 10px', borderRadius: '20px',
        background: cfg.bg, color: cfg.color,
        fontSize: '12px', fontWeight: 700,
        fontFamily: "'DM Sans', sans-serif",
      }}>
        <Icon style={{ width: '11px', height: '11px' }} />
        {cfg.label}
      </span>
    );
  };

  if (loading) {
    return (
      <Layout>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '260px' }}>
          <div style={{ width: '40px', height: '40px', border: '3px solid var(--border)', borderTopColor: 'var(--capyme-blue-mid)', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <style>{`
        @keyframes fadeInUp { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:translateY(0); } }
        @keyframes modalIn  { from { opacity:0; transform:scale(0.96) translateY(8px); } to { opacity:1; transform:scale(1) translateY(0); } }
        @keyframes spin     { to { transform:rotate(360deg); } }
        .post-card { animation: fadeInUp 0.3s ease both; }
        .post-card:hover { box-shadow: 0 8px 24px rgba(31,78,158,0.10) !important; transform: translateY(-2px) !important; }
        .post-modal { animation: modalIn 0.25s ease both; }
      `}</style>

      <div style={{ padding: '0 0 40px' }}>

        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '28px', flexWrap: 'wrap', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{
              width: '46px', height: '46px',
              background: 'linear-gradient(135deg, var(--capyme-blue-mid), var(--capyme-blue))',
              borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(31,78,158,0.25)',
            }}>
              <ClipboardList style={{ width: '22px', height: '22px', color: '#fff' }} />
            </div>
            <div>
              <h1 style={{ fontSize: '22px', fontWeight: 800, color: 'var(--gray-900)', fontFamily: "'Plus Jakarta Sans', sans-serif", margin: 0, lineHeight: 1.2 }}>
                Postulaciones
              </h1>
              <p style={{ fontSize: '13px', color: 'var(--gray-500)', margin: '3px 0 0', fontFamily: "'DM Sans', sans-serif" }}>
                {postulaciones.length} postulación{postulaciones.length !== 1 ? 'es' : ''} registrada{postulaciones.length !== 1 ? 's' : ''}
              </p>
            </div>
          </div>

          {['admin', 'colaborador'].includes(currentUser.rol) && (
            <button
              onClick={handleOpenCreate}
              style={{
                display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 18px',
                background: 'linear-gradient(135deg, var(--capyme-blue-mid), var(--capyme-blue))',
                color: '#fff', border: 'none', borderRadius: 'var(--radius-md)',
                fontSize: '14px', fontWeight: 600, fontFamily: "'DM Sans', sans-serif",
                cursor: 'pointer', boxShadow: '0 2px 8px rgba(31,78,158,0.28)', transition: 'all 150ms ease',
              }}
              onMouseEnter={e => { e.currentTarget.style.opacity = '0.9'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
              onMouseLeave={e => { e.currentTarget.style.opacity = '1'; e.currentTarget.style.transform = 'translateY(0)'; }}
            >
              <Plus style={{ width: '16px', height: '16px' }} />
              Nueva Postulación
            </button>
          )}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '12px', marginBottom: '20px' }}>
          {stats.map((stat, i) => (
            <div key={i} style={{
              background: '#fff', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)',
              padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: '4px',
              boxShadow: 'var(--shadow-sm)', borderLeft: `3px solid ${stat.color}`,
            }}>
              <span style={{ fontSize: '22px', fontWeight: 800, color: stat.color, fontFamily: "'Plus Jakarta Sans', sans-serif", lineHeight: 1 }}>{stat.value}</span>
              <span style={{ fontSize: '12px', color: stat.color, fontFamily: "'DM Sans', sans-serif", fontWeight: 600, opacity: 0.75 }}>{stat.label}</span>
            </div>
          ))}
        </div>

        <div style={{
          background: '#fff', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)',
          padding: '16px 20px', marginBottom: '20px',
          display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap',
          boxShadow: 'var(--shadow-sm)',
        }}>
          <div style={{ position: 'relative', flex: '1', minWidth: '180px' }}>
            <Search style={{ position: 'absolute', left: '11px', top: '50%', transform: 'translateY(-50%)', width: '15px', height: '15px', color: 'var(--gray-400)', pointerEvents: 'none' }} />
            <input type="text" placeholder="Buscar negocio, programa, cliente…" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} style={inputWithIconStyle} />
          </div>

          <div style={{ position: 'relative', minWidth: '160px' }}>
            <select value={filterPrograma} onChange={e => setFilterPrograma(e.target.value)} style={{ ...selectStyle, width: '100%' }}>
              <option value="">Todos los programas</option>
              {programas.map(p => <option key={p.id} value={p.id}>{p.nombre}</option>)}
            </select>
            <ChevronDown style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', width: '14px', height: '14px', color: 'var(--gray-400)', pointerEvents: 'none' }} />
          </div>

          <div style={{ position: 'relative', minWidth: '155px' }}>
            <select value={filterEstadoGeo} onChange={e => { setFilterEstadoGeo(e.target.value); setFilterMunicipio(''); }} style={{ ...selectStyle, width: '100%' }}>
              <option value="">Todos los estados</option>
              {ESTADOS_MEXICO.map(e => <option key={e.nombre} value={e.nombre}>{e.nombre}</option>)}
            </select>
            <ChevronDown style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', width: '14px', height: '14px', color: 'var(--gray-400)', pointerEvents: 'none' }} />
          </div>

          <div style={{ position: 'relative', minWidth: '155px' }}>
            <select value={filterMunicipio} onChange={e => setFilterMunicipio(e.target.value)} style={{ ...selectStyle, width: '100%', opacity: filterEstadoGeo ? 1 : 0.5 }} disabled={!filterEstadoGeo}>
              <option value="">Todos los municipios</option>
              {filterEstadoGeo && ESTADOS_MEXICO.find(e => e.nombre === filterEstadoGeo)?.municipios.map(m => <option key={m} value={m}>{m}</option>)}
            </select>
            <ChevronDown style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', width: '14px', height: '14px', color: 'var(--gray-400)', pointerEvents: 'none' }} />
          </div>

          <div style={{ position: 'relative', minWidth: '145px' }}>
            <select value={filterEstadoPost} onChange={e => setFilterEstadoPost(e.target.value)} style={{ ...selectStyle, width: '100%' }}>
              <option value="">Todos los estados</option>
              {Object.entries(ESTADOS_CONFIG).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
            </select>
            <ChevronDown style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', width: '14px', height: '14px', color: 'var(--gray-400)', pointerEvents: 'none' }} />
          </div>

          <div style={{ display: 'flex', gap: '4px', background: 'var(--gray-100)', borderRadius: 'var(--radius-sm)', padding: '3px', marginLeft: 'auto' }}>
            {[{ mode: 'grid', Icon: LayoutGrid }, { mode: 'list', Icon: List }].map(({ mode, Icon }) => (
              <button key={mode} onClick={() => setViewMode(mode)} style={{
                width: '32px', height: '32px', border: 'none', borderRadius: 'var(--radius-sm)',
                background: viewMode === mode ? '#fff' : 'transparent',
                color: viewMode === mode ? 'var(--capyme-blue-mid)' : 'var(--gray-400)',
                cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: viewMode === mode ? 'var(--shadow-sm)' : 'none', transition: 'all 150ms ease',
              }}>
                <Icon style={{ width: '15px', height: '15px' }} />
              </button>
            ))}
          </div>
        </div>

        {postulacionesFiltradas.length === 0 ? (
          <div style={{ background: '#fff', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '60px 20px', textAlign: 'center', boxShadow: 'var(--shadow-sm)' }}>
            <ClipboardList style={{ width: '48px', height: '48px', color: 'var(--gray-300)', margin: '0 auto 12px' }} />
            <p style={{ fontSize: '15px', fontWeight: 600, color: 'var(--gray-500)', fontFamily: "'DM Sans', sans-serif" }}>No se encontraron postulaciones</p>
            <p style={{ fontSize: '13px', color: 'var(--gray-400)', fontFamily: "'DM Sans', sans-serif", marginTop: '4px' }}>Ajusta los filtros o crea una nueva postulación</p>
          </div>
        ) : viewMode === 'grid' ? (

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
            {postulacionesFiltradas.map((post, idx) => (
              <div key={post.id} className="post-card" style={{ background: '#fff', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '18px 20px', boxShadow: 'var(--shadow-sm)', transition: 'all 200ms ease', animationDelay: `${idx * 0.04}s` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                  <EstadoBadge estado={post.estado} />
                  <span style={{ fontSize: '11px', color: 'var(--gray-400)', fontFamily: "'DM Sans', sans-serif" }}>#{post.id}</span>
                </div>
                <div style={{ marginBottom: '8px' }}>
                  <p style={{ fontSize: '15px', fontWeight: 700, color: 'var(--gray-900)', fontFamily: "'Plus Jakarta Sans', sans-serif", margin: 0, lineHeight: 1.3 }}>{post.negocio?.nombreNegocio}</p>
                  {post.negocio?.categoria && <p style={{ fontSize: '12px', color: 'var(--gray-500)', fontFamily: "'DM Sans', sans-serif", margin: '2px 0 0' }}>{post.negocio.categoria.nombre}</p>}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '14px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
                    <FileText style={{ width: '13px', height: '13px', color: 'var(--capyme-blue-mid)', flexShrink: 0 }} />
                    <span style={{ fontSize: '12px', color: 'var(--gray-700)', fontFamily: "'DM Sans', sans-serif", fontWeight: 500 }}>{post.programa?.nombre}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
                    <User style={{ width: '13px', height: '13px', color: 'var(--gray-400)', flexShrink: 0 }} />
                    <span style={{ fontSize: '12px', color: 'var(--gray-500)', fontFamily: "'DM Sans', sans-serif" }}>{post.usuario?.nombre} {post.usuario?.apellido}</span>
                  </div>
                  {(post.estadoGeo || post.municipio) && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
                      <MapPin style={{ width: '13px', height: '13px', color: 'var(--gray-400)', flexShrink: 0 }} />
                      <span style={{ fontSize: '12px', color: 'var(--gray-500)', fontFamily: "'DM Sans', sans-serif" }}>{[post.municipio, post.estadoGeo].filter(Boolean).join(', ')}</span>
                    </div>
                  )}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
                    <Calendar style={{ width: '13px', height: '13px', color: 'var(--gray-400)', flexShrink: 0 }} />
                    <span style={{ fontSize: '12px', color: 'var(--gray-500)', fontFamily: "'DM Sans', sans-serif" }}>{formatDate(post.fechaPostulacion)}</span>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '6px', paddingTop: '12px', borderTop: '1px solid var(--gray-100)' }}>
                  <button onClick={() => handleOpenDetalle(post.id)} title="Ver detalle" style={{ width: '32px', height: '32px', border: 'none', borderRadius: 'var(--radius-sm)', background: 'transparent', cursor: 'pointer', color: 'var(--gray-400)', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 150ms ease' }}
                    onMouseEnter={e => { e.currentTarget.style.background = '#EEF4FF'; e.currentTarget.style.color = 'var(--capyme-blue-mid)'; }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--gray-400)'; }}>
                    <Eye style={{ width: '14px', height: '14px' }} />
                  </button>
                  {['admin', 'colaborador'].includes(currentUser.rol) && (
                    <button onClick={() => handleOpenEdit(post)} title="Editar" style={{ width: '32px', height: '32px', border: 'none', borderRadius: 'var(--radius-sm)', background: 'transparent', cursor: 'pointer', color: 'var(--gray-400)', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 150ms ease' }}
                      onMouseEnter={e => { e.currentTarget.style.background = '#EEF4FF'; e.currentTarget.style.color = 'var(--capyme-blue-mid)'; }}
                      onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--gray-400)'; }}>
                      <Edit style={{ width: '14px', height: '14px' }} />
                    </button>
                  )}
                  {['admin', 'colaborador'].includes(currentUser.rol) && (
                    <button onClick={() => handleOpenEstado(post)} style={{ flex: 1, padding: '6px 10px', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', background: '#fff', color: 'var(--gray-600)', fontSize: '12px', fontWeight: 600, fontFamily: "'DM Sans', sans-serif", cursor: 'pointer', transition: 'all 150ms ease' }}
                      onMouseEnter={e => { e.currentTarget.style.background = '#EEF4FF'; e.currentTarget.style.borderColor = 'var(--capyme-blue-mid)'; e.currentTarget.style.color = 'var(--capyme-blue-mid)'; }}
                      onMouseLeave={e => { e.currentTarget.style.background = '#fff'; e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--gray-600)'; }}>
                      Cambiar estado
                    </button>
                  )}
                  {currentUser.rol === 'admin' && (
                    <button onClick={() => handleToggleActivo(post)} title={post.estado === 'completada' ? 'Marcar pendiente' : 'Marcar completada'}
                      style={{ width: '32px', height: '32px', border: 'none', borderRadius: 'var(--radius-sm)', background: 'transparent', cursor: 'pointer', color: post.estado === 'completada' ? '#5B21B6' : 'var(--gray-400)', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 150ms ease' }}
                      onMouseEnter={e => { e.currentTarget.style.background = '#EDE9FE'; }}
                      onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}>
                      {post.estado === 'completada' ? <ToggleRight style={{ width: '16px', height: '16px' }} /> : <ToggleLeft style={{ width: '16px', height: '16px' }} />}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

        ) : (

          <div style={{ background: '#fff', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', overflow: 'hidden', boxShadow: 'var(--shadow-sm)' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: 'var(--gray-50)', borderBottom: '1px solid var(--border)' }}>
                  {['Negocio', 'Programa', 'Cliente', 'Ubicación', 'Estado', 'Fecha', 'Acciones'].map(h => (
                    <th key={h} style={{ padding: '11px 16px', textAlign: h === 'Acciones' ? 'right' : 'left', fontSize: '11px', fontWeight: 700, color: 'var(--gray-500)', textTransform: 'uppercase', letterSpacing: '0.05em', fontFamily: "'Plus Jakarta Sans', sans-serif", whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {postulacionesFiltradas.map(post => (
                  <tr key={post.id} onMouseEnter={() => setHoveredRow(post.id)} onMouseLeave={() => setHoveredRow(null)} style={{ borderBottom: '1px solid var(--gray-100)', background: hoveredRow === post.id ? 'var(--gray-50)' : '#fff', transition: 'background 150ms ease' }}>
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ width: '30px', height: '30px', background: '#EEF4FF', borderRadius: 'var(--radius-sm)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          <Building2 style={{ width: '14px', height: '14px', color: 'var(--capyme-blue-mid)' }} />
                        </div>
                        <div>
                          <p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--gray-900)', margin: 0, fontFamily: "'DM Sans', sans-serif" }}>{post.negocio?.nombreNegocio}</p>
                          <p style={{ fontSize: '11px', color: 'var(--gray-400)', margin: 0, fontFamily: "'DM Sans', sans-serif" }}>{post.negocio?.categoria?.nombre}</p>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
                        <FileText style={{ width: '13px', height: '13px', color: 'var(--gray-400)', flexShrink: 0 }} />
                        <span style={{ fontSize: '13px', color: 'var(--gray-700)', fontFamily: "'DM Sans', sans-serif", maxWidth: '160px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{post.programa?.nombre}</span>
                      </div>
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--gray-900)', margin: 0, fontFamily: "'DM Sans', sans-serif" }}>{post.usuario?.nombre} {post.usuario?.apellido}</p>
                      <p style={{ fontSize: '11px', color: 'var(--gray-400)', margin: 0, fontFamily: "'DM Sans', sans-serif" }}>{post.usuario?.email}</p>
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      {(post.estadoGeo || post.municipio) ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                          <MapPin style={{ width: '12px', height: '12px', color: 'var(--gray-400)', flexShrink: 0 }} />
                          <span style={{ fontSize: '12px', color: 'var(--gray-600)', fontFamily: "'DM Sans', sans-serif" }}>{[post.municipio, post.estadoGeo].filter(Boolean).join(', ')}</span>
                        </div>
                      ) : (
                        <span style={{ fontSize: '12px', color: 'var(--gray-300)', fontFamily: "'DM Sans', sans-serif" }}>—</span>
                      )}
                    </td>
                    <td style={{ padding: '12px 16px' }}><EstadoBadge estado={post.estado} /></td>
                    <td style={{ padding: '12px 16px' }}>
                      <span style={{ fontSize: '12px', color: 'var(--gray-500)', fontFamily: "'DM Sans', sans-serif" }}>{formatDate(post.fechaPostulacion)}</span>
                    </td>
                    <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '4px' }}>
                        <button onClick={() => handleOpenDetalle(post.id)} title="Ver" style={{ width: '30px', height: '30px', border: 'none', borderRadius: 'var(--radius-sm)', background: 'transparent', cursor: 'pointer', color: 'var(--gray-400)', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 150ms ease' }}
                          onMouseEnter={e => { e.currentTarget.style.background = '#EEF4FF'; e.currentTarget.style.color = 'var(--capyme-blue-mid)'; }}
                          onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--gray-400)'; }}>
                          <Eye style={{ width: '14px', height: '14px' }} />
                        </button>
                        {['admin', 'colaborador'].includes(currentUser.rol) && (
                          <>
                            <button onClick={() => handleOpenEdit(post)} title="Editar" style={{ width: '30px', height: '30px', border: 'none', borderRadius: 'var(--radius-sm)', background: 'transparent', cursor: 'pointer', color: 'var(--gray-400)', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 150ms ease' }}
                              onMouseEnter={e => { e.currentTarget.style.background = '#EEF4FF'; e.currentTarget.style.color = 'var(--capyme-blue-mid)'; }}
                              onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--gray-400)'; }}>
                              <Edit style={{ width: '14px', height: '14px' }} />
                            </button>
                            <button onClick={() => handleOpenEstado(post)} style={{ padding: '4px 10px', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', background: '#fff', color: 'var(--gray-600)', fontSize: '11px', fontWeight: 600, fontFamily: "'DM Sans', sans-serif", cursor: 'pointer', whiteSpace: 'nowrap', transition: 'all 150ms ease' }}
                              onMouseEnter={e => { e.currentTarget.style.background = '#EEF4FF'; e.currentTarget.style.borderColor = 'var(--capyme-blue-mid)'; e.currentTarget.style.color = 'var(--capyme-blue-mid)'; }}
                              onMouseLeave={e => { e.currentTarget.style.background = '#fff'; e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--gray-600)'; }}>
                              Estado
                            </button>
                          </>
                        )}
                        {currentUser.rol === 'admin' && (
                          <button onClick={() => handleToggleActivo(post)} title={post.estado === 'completada' ? 'Marcar pendiente' : 'Marcar completada'}
                            style={{ width: '30px', height: '30px', border: 'none', borderRadius: 'var(--radius-sm)', background: 'transparent', cursor: 'pointer', color: post.estado === 'completada' ? '#5B21B6' : 'var(--gray-400)', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 150ms ease' }}
                            onMouseEnter={e => { e.currentTarget.style.background = '#EDE9FE'; }}
                            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}>
                            {post.estado === 'completada' ? <ToggleRight style={{ width: '15px', height: '15px' }} /> : <ToggleLeft style={{ width: '15px', height: '15px' }} />}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(3px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
          <div className="post-modal" onClick={e => e.stopPropagation()} style={{ background: '#fff', borderRadius: 'var(--radius-xl)', width: '100%', maxWidth: '580px', maxHeight: '90vh', overflow: 'hidden', display: 'flex', flexDirection: 'column', boxShadow: '0 24px 64px rgba(0,0,0,0.18)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 24px', background: 'var(--gray-50)', borderBottom: '1px solid var(--border)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '34px', height: '34px', background: 'linear-gradient(135deg, var(--capyme-blue-mid), var(--capyme-blue))', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <ClipboardList style={{ width: '16px', height: '16px', color: '#fff' }} />
                </div>
                <h2 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--gray-900)', margin: 0, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                  {modalMode === 'create' ? 'Nueva Postulación' : 'Editar Postulación'}
                </h2>
              </div>
              <button onClick={handleCloseAll} style={{ width: '30px', height: '30px', border: 'none', borderRadius: 'var(--radius-sm)', background: 'transparent', cursor: 'pointer', color: 'var(--gray-400)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <X style={{ width: '16px', height: '16px' }} />
              </button>
            </div>
            <div style={{ flex: 1, overflowY: 'auto', padding: '24px' }}>
              <div>
                <SectionTitle icon={Building2} text="Negocio y Programa" />
                <div style={{ marginTop: '14px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                  <div>
                    <label style={labelStyle}>Negocio <span style={{ color: '#EF4444' }}>*</span></label>
                    <div style={{ position: 'relative' }}>
                      <select name="negocioId" value={formData.negocioId} onChange={handleChange} disabled={modalMode === 'edit' && currentUser.rol !== 'admin'} style={{ ...selectStyle, ...(formErrors.negocioId ? inputErrorStyle : {}), opacity: (modalMode === 'edit' && currentUser.rol !== 'admin') ? 0.6 : 1 }} onFocus={e => { if (!formErrors.negocioId) { e.target.style.borderColor = 'var(--capyme-blue-mid)'; e.target.style.boxShadow = '0 0 0 3px rgba(43,91,166,0.12)'; } }} onBlur={e => { if (!formErrors.negocioId) { e.target.style.borderColor = 'var(--border)'; e.target.style.boxShadow = 'none'; } }}>
                        <option value="">Selecciona un negocio</option>
                        {negocios.map(n => <option key={n.id} value={n.id}>{n.nombreNegocio}</option>)}
                      </select>
                      <ChevronDown style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', width: '14px', height: '14px', color: 'var(--gray-400)', pointerEvents: 'none' }} />
                    </div>
                    {modalMode === 'edit' && currentUser.rol !== 'admin' && <p style={{ fontSize: '11px', color: 'var(--gray-400)', marginTop: '4px', fontFamily: "'DM Sans', sans-serif" }}>Solo el admin puede reasignar el negocio</p>}
                    {formErrors.negocioId && <ErrorMsg text={formErrors.negocioId} />}
                  </div>
                  <div>
                    <label style={labelStyle}>Programa <span style={{ color: '#EF4444' }}>*</span></label>
                    <div style={{ position: 'relative' }}>
                      <select name="programaId" value={formData.programaId} onChange={handleChange} disabled={modalMode === 'edit' && currentUser.rol !== 'admin'} style={{ ...selectStyle, ...(formErrors.programaId ? inputErrorStyle : {}), opacity: (modalMode === 'edit' && currentUser.rol !== 'admin') ? 0.6 : 1 }} onFocus={e => { if (!formErrors.programaId) { e.target.style.borderColor = 'var(--capyme-blue-mid)'; e.target.style.boxShadow = '0 0 0 3px rgba(43,91,166,0.12)'; } }} onBlur={e => { if (!formErrors.programaId) { e.target.style.borderColor = 'var(--border)'; e.target.style.boxShadow = 'none'; } }}>
                        <option value="">Selecciona un programa</option>
                        {programas.filter(p => p.activo).map(p => <option key={p.id} value={p.id}>{p.nombre}</option>)}
                      </select>
                      <ChevronDown style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', width: '14px', height: '14px', color: 'var(--gray-400)', pointerEvents: 'none' }} />
                    </div>
                    {modalMode === 'edit' && currentUser.rol !== 'admin' && <p style={{ fontSize: '11px', color: 'var(--gray-400)', marginTop: '4px', fontFamily: "'DM Sans', sans-serif" }}>Solo el admin puede reasignar el programa</p>}
                    {formErrors.programaId && <ErrorMsg text={formErrors.programaId} />}
                  </div>
                </div>
                {formData.negocioId && (() => {
                  const negSel = negocios.find(n => n.id === parseInt(formData.negocioId));
                  const propietario = negSel?.usuario;
                  if (!propietario && !negSel?.usuarioId) return null;
                  const nombre = propietario ? `${propietario.nombre} ${propietario.apellido}` : `Usuario #${negSel.usuarioId}`;
                  const email = propietario?.email || '';
                  return (
                    <div style={{ marginTop: '14px' }}>
                      <label style={labelStyle}>Usuario responsable del negocio<span style={{ marginLeft: '6px', fontSize: '11px', fontWeight: 400, color: 'var(--gray-400)' }}>(se asigna automáticamente)</span></label>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 14px', background: '#F8FAFC', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)' }}>
                        <div style={{ width: '30px', height: '30px', borderRadius: '50%', background: '#EEF4FF', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          <User style={{ width: '14px', height: '14px', color: 'var(--capyme-blue-mid)' }} />
                        </div>
                        <div>
                          <p style={{ margin: 0, fontSize: '13px', fontWeight: 600, color: 'var(--gray-900)', fontFamily: "'DM Sans', sans-serif" }}>{nombre}</p>
                          {email && <p style={{ margin: 0, fontSize: '11px', color: 'var(--gray-500)', fontFamily: "'DM Sans', sans-serif" }}>{email}</p>}
                        </div>
                        <span style={{ marginLeft: 'auto', fontSize: '10px', fontWeight: 700, padding: '2px 8px', borderRadius: '99px', background: '#EEF4FF', color: 'var(--capyme-blue-mid)', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>PROPIETARIO</span>
                      </div>
                    </div>
                  );
                })()}
              </div>
              <div style={{ marginTop: '24px' }}>
                <SectionTitle icon={MapPin} text="Ubicación geográfica" />
                <div style={{ marginTop: '14px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                  <div>
                    <label style={labelStyle}>Estado</label>
                    <div style={{ position: 'relative' }}>
                      <select name="estadoGeo" value={formData.estadoGeo} onChange={handleChange} style={selectStyle}>
                        <option value="">Aplica a todos los estados</option>
                        {ESTADOS_MEXICO.map(e => <option key={e.nombre} value={e.nombre}>{e.nombre}</option>)}
                      </select>
                      <ChevronDown style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', width: '14px', height: '14px', color: 'var(--gray-400)', pointerEvents: 'none' }} />
                    </div>
                  </div>
                  <div>
                    <label style={labelStyle}>Municipio</label>
                    <div style={{ position: 'relative' }}>
                      <select name="municipio" value={formData.municipio} onChange={handleChange} disabled={!formData.estadoGeo} style={{ ...selectStyle, opacity: formData.estadoGeo ? 1 : 0.5 }}>
                        <option value="">Todos los municipios</option>
                        {formData.estadoGeo && ESTADOS_MEXICO.find(e => e.nombre === formData.estadoGeo)?.municipios.map(m => <option key={m} value={m}>{m}</option>)}
                      </select>
                      <ChevronDown style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', width: '14px', height: '14px', color: 'var(--gray-400)', pointerEvents: 'none' }} />
                    </div>
                  </div>
                </div>
              </div>
              {formData.programaId && (() => {
                const prog = programas.find(p => p.id === parseInt(formData.programaId));
                if (!prog) return null;
                return (
                  <div style={{ marginTop: '24px' }}>
                    <SectionTitle icon={FileText} text="Información del programa" />
                    <div style={{ marginTop: '14px', background: '#F0F7FF', border: '1px solid #BFDBFE', borderRadius: 'var(--radius-md)', padding: '14px 16px' }}>
                      <p style={{ fontSize: '14px', fontWeight: 700, color: 'var(--capyme-blue-mid)', margin: '0 0 6px', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{prog.nombre}</p>
                      {prog.descripcion && <p style={{ fontSize: '13px', color: 'var(--gray-600)', margin: '0 0 8px', fontFamily: "'DM Sans', sans-serif" }}>{prog.descripcion}</p>}
                      <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                        {prog.montoApoyo && <span style={{ fontSize: '12px', color: '#065F46', fontWeight: 600, fontFamily: "'DM Sans', sans-serif" }}>💰 ${Number(prog.montoApoyo).toLocaleString('es-MX')}</span>}
                        {prog.estado && <span style={{ fontSize: '12px', color: 'var(--gray-500)', fontFamily: "'DM Sans', sans-serif" }}>📍 {[prog.municipio, prog.estado].filter(Boolean).join(', ')}</span>}
                        {prog.fechaCierre && <span style={{ fontSize: '12px', color: '#991B1B', fontWeight: 600, fontFamily: "'DM Sans', sans-serif" }}>⏰ Cierra: {formatDate(prog.fechaCierre)}</span>}
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', padding: '16px 24px', background: 'var(--gray-50)', borderTop: '1px solid var(--border)' }}>
              <button onClick={handleCloseAll} style={{ padding: '9px 18px', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', background: '#fff', color: 'var(--gray-700)', fontSize: '14px', fontWeight: 600, fontFamily: "'DM Sans', sans-serif", cursor: 'pointer' }}>Cancelar</button>
              <button
                onClick={handleSubmit}
                disabled={submitting || Object.keys(formErrors).length > 0 || !isFormValid}
                style={{
                  padding: '9px 22px',
                  border: 'none',
                  borderRadius: 'var(--radius-md)',
                  background: 'linear-gradient(135deg, var(--capyme-blue-mid), var(--capyme-blue))',
                  color: '#fff',
                  fontSize: '14px',
                  fontWeight: 600,
                  fontFamily: "'DM Sans', sans-serif",
                  cursor: submitting || Object.keys(formErrors).length > 0 || !isFormValid ? 'not-allowed' : 'pointer',
                  opacity: submitting || Object.keys(formErrors).length > 0 || !isFormValid ? 0.6 : 1,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  boxShadow: '0 2px 8px rgba(31,78,158,0.28)',
                  transition: 'all 200ms ease'
                }}
                onMouseEnter={e => { if (!submitting && isFormValid && Object.keys(formErrors).length === 0) e.currentTarget.style.transform = 'translateY(-1px)'; }}
                onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
              >
                {submitting && <div style={{ width: '14px', height: '14px', border: '2px solid rgba(255,255,255,0.4)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />}
                {modalMode === 'create' ? 'Crear Postulación' : 'Guardar Cambios'}
              </button>
            </div>
          </div>
        </div>
      )}

      {showDetalle && selectedPost && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(3px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
          <div className="post-modal" onClick={e => e.stopPropagation()} style={{ background: '#fff', borderRadius: 'var(--radius-xl)', width: '100%', maxWidth: '720px', maxHeight: '90vh', overflow: 'hidden', display: 'flex', flexDirection: 'column', boxShadow: '0 24px 64px rgba(0,0,0,0.18)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 24px', background: 'var(--gray-50)', borderBottom: '1px solid var(--border)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <h2 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--gray-900)', margin: 0, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Detalle de Postulación #{selectedPost.id}</h2>
                <EstadoBadge estado={selectedPost.estado} />
              </div>
              <button onClick={handleCloseAll} style={{ width: '30px', height: '30px', border: 'none', borderRadius: 'var(--radius-sm)', background: 'transparent', cursor: 'pointer', color: 'var(--gray-400)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <X style={{ width: '16px', height: '16px' }} />
              </button>
            </div>
            <div style={{ flex: 1, overflowY: 'auto', padding: '24px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
                <div style={{ background: 'var(--gray-50)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '14px 16px' }}>
                  <p style={{ fontSize: '11px', fontWeight: 700, color: 'var(--gray-400)', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 8px', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Negocio</p>
                  <p style={{ fontSize: '14px', fontWeight: 700, color: 'var(--gray-900)', margin: '0 0 4px', fontFamily: "'DM Sans', sans-serif" }}>{selectedPost.negocio?.nombreNegocio}</p>
                  {selectedPost.negocio?.rfc && <p style={{ fontSize: '12px', color: 'var(--gray-500)', margin: '0 0 2px', fontFamily: "'DM Sans', sans-serif" }}>RFC: {selectedPost.negocio.rfc}</p>}
                  {selectedPost.negocio?.categoria && <p style={{ fontSize: '12px', color: 'var(--gray-500)', margin: 0, fontFamily: "'DM Sans', sans-serif" }}>{selectedPost.negocio.categoria.nombre}</p>}
                </div>
                <div style={{ background: '#F0F7FF', border: '1px solid #BFDBFE', borderRadius: 'var(--radius-md)', padding: '14px 16px' }}>
                  <p style={{ fontSize: '11px', fontWeight: 700, color: '#1E40AF', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 8px', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Programa</p>
                  <p style={{ fontSize: '14px', fontWeight: 700, color: 'var(--capyme-blue-mid)', margin: '0 0 4px', fontFamily: "'DM Sans', sans-serif" }}>{selectedPost.programa?.nombre}</p>
                  {selectedPost.programa?.tipoPrograma && <p style={{ fontSize: '12px', color: '#1E40AF', margin: '0 0 2px', fontFamily: "'DM Sans', sans-serif" }}>{selectedPost.programa.tipoPrograma}</p>}
                  {selectedPost.programa?.montoApoyo && <p style={{ fontSize: '12px', color: '#065F46', fontWeight: 600, margin: 0, fontFamily: "'DM Sans', sans-serif" }}>💰 ${Number(selectedPost.programa.montoApoyo).toLocaleString('es-MX')}</p>}
                </div>
                <div style={{ background: 'var(--gray-50)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '14px 16px' }}>
                  <p style={{ fontSize: '11px', fontWeight: 700, color: 'var(--gray-400)', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 8px', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Cliente / Usuario</p>
                  <p style={{ fontSize: '14px', fontWeight: 700, color: 'var(--gray-900)', margin: '0 0 4px', fontFamily: "'DM Sans', sans-serif" }}>{selectedPost.usuario?.nombre} {selectedPost.usuario?.apellido}</p>
                  <p style={{ fontSize: '12px', color: 'var(--gray-500)', margin: '0 0 2px', fontFamily: "'DM Sans', sans-serif" }}>{selectedPost.usuario?.email}</p>
                  {selectedPost.usuario?.telefono && <p style={{ fontSize: '12px', color: 'var(--gray-500)', margin: 0, fontFamily: "'DM Sans', sans-serif" }}>{selectedPost.usuario.telefono}</p>}
                </div>
                <div style={{ background: 'var(--gray-50)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '14px 16px' }}>
                  <p style={{ fontSize: '11px', fontWeight: 700, color: 'var(--gray-400)', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 8px', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Detalles</p>
                  {(selectedPost.estadoGeo || selectedPost.municipio) && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                      <MapPin style={{ width: '13px', height: '13px', color: 'var(--gray-400)' }} />
                      <span style={{ fontSize: '13px', color: 'var(--gray-700)', fontFamily: "'DM Sans', sans-serif" }}>{[selectedPost.municipio, selectedPost.estadoGeo].filter(Boolean).join(', ')}</span>
                    </div>
                  )}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Calendar style={{ width: '13px', height: '13px', color: 'var(--gray-400)' }} />
                    <span style={{ fontSize: '13px', color: 'var(--gray-700)', fontFamily: "'DM Sans', sans-serif" }}>{formatDate(selectedPost.fechaPostulacion)}</span>
                  </div>
                </div>
              </div>
              {selectedPost.respuestas?.length > 0 && (
                <div style={{ marginBottom: '20px' }}>
                  <SectionTitle icon={FileText} text="Respuestas del formulario" />
                  <div style={{ marginTop: '14px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {selectedPost.respuestas.map(r => (
                      <div key={r.id} style={{ background: 'var(--gray-50)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '12px 14px' }}>
                        <p style={{ fontSize: '12px', fontWeight: 600, color: 'var(--gray-600)', margin: '0 0 6px', fontFamily: "'DM Sans', sans-serif" }}>{r.pregunta?.pregunta}</p>
                        <p style={{ fontSize: '13px', color: 'var(--gray-900)', margin: 0, fontFamily: "'DM Sans', sans-serif" }}>{r.respuesta || <em style={{ color: 'var(--gray-400)' }}>Sin respuesta</em>}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {selectedPost.notasAdmin && (
                <div>
                  <SectionTitle icon={Tag} text="Notas administrativas" />
                  <div style={{ marginTop: '14px', background: '#FFFBEB', border: '1px solid #FDE68A', borderRadius: 'var(--radius-md)', padding: '14px 16px' }}>
                    <p style={{ fontSize: '13px', color: 'var(--gray-800)', margin: 0, fontFamily: "'DM Sans', sans-serif", lineHeight: 1.6 }}>{selectedPost.notasAdmin}</p>
                  </div>
                </div>
              )}
            </div>
            <div style={{ padding: '14px 24px', background: 'var(--gray-50)', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              {['admin', 'colaborador'].includes(currentUser.rol) && (
                <button onClick={() => { handleCloseAll(); setTimeout(() => handleOpenEstado(selectedPost), 50); }} style={{ padding: '8px 16px', border: '1px solid var(--capyme-blue-mid)', borderRadius: 'var(--radius-md)', background: '#EEF4FF', color: 'var(--capyme-blue-mid)', fontSize: '13px', fontWeight: 600, fontFamily: "'DM Sans', sans-serif", cursor: 'pointer' }}>
                  Cambiar Estado
                </button>
              )}
              <button onClick={handleCloseAll} style={{ padding: '8px 16px', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', background: '#fff', color: 'var(--gray-700)', fontSize: '13px', fontWeight: 600, fontFamily: "'DM Sans', sans-serif", cursor: 'pointer' }}>Cerrar</button>
            </div>
          </div>
        </div>
      )}

      {showEstado && selectedPost && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(3px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
          <div className="post-modal" onClick={e => e.stopPropagation()} style={{ background: '#fff', borderRadius: 'var(--radius-xl)', width: '100%', maxWidth: '440px', overflow: 'hidden', boxShadow: '0 24px 64px rgba(0,0,0,0.18)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 22px', background: 'var(--gray-50)', borderBottom: '1px solid var(--border)' }}>
              <h2 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--gray-900)', margin: 0, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Cambiar Estado</h2>
              <button onClick={handleCloseAll} style={{ width: '28px', height: '28px', border: 'none', borderRadius: 'var(--radius-sm)', background: 'transparent', cursor: 'pointer', color: 'var(--gray-400)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <X style={{ width: '15px', height: '15px' }} />
              </button>
            </div>
            <div style={{ padding: '22px' }}>
              <p style={{ fontSize: '13px', color: 'var(--gray-500)', margin: '0 0 18px', fontFamily: "'DM Sans', sans-serif" }}>
                <strong style={{ color: 'var(--gray-800)' }}>{selectedPost.negocio?.nombreNegocio}</strong> → {selectedPost.programa?.nombre}
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '16px' }}>
                {Object.entries(ESTADOS_CONFIG).map(([key, cfg]) => {
                  const { Icon } = cfg;
                  const isActive = estadoData.estado === key;
                  return (
                    <button key={key} onClick={() => setEstadoData(prev => ({ ...prev, estado: key }))} style={{ padding: '10px 12px', border: `2px solid ${isActive ? cfg.color : 'var(--border)'}`, borderRadius: 'var(--radius-md)', background: isActive ? cfg.bg : '#fff', color: isActive ? cfg.color : 'var(--gray-600)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '7px', fontSize: '13px', fontWeight: isActive ? 700 : 500, fontFamily: "'DM Sans', sans-serif", transition: 'all 150ms ease' }}>
                      <Icon style={{ width: '14px', height: '14px', flexShrink: 0 }} />
                      {cfg.label}
                    </button>
                  );
                })}
              </div>
              <div>
                <label style={labelStyle}>Notas administrativas</label>
                <textarea value={estadoData.notasAdmin} onChange={e => setEstadoData(prev => ({ ...prev, notasAdmin: e.target.value }))} placeholder="Agrega observaciones sobre esta postulación..." style={textareaStyle} />
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', padding: '14px 22px', background: 'var(--gray-50)', borderTop: '1px solid var(--border)' }}>
              <button onClick={handleCloseAll} style={{ padding: '8px 16px', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', background: '#fff', color: 'var(--gray-700)', fontSize: '13px', fontWeight: 600, fontFamily: "'DM Sans', sans-serif", cursor: 'pointer' }}>Cancelar</button>
              <button onClick={handleActualizarEstado} style={{ padding: '8px 18px', border: 'none', borderRadius: 'var(--radius-md)', background: 'linear-gradient(135deg, var(--capyme-blue-mid), var(--capyme-blue))', color: '#fff', fontSize: '13px', fontWeight: 600, fontFamily: "'DM Sans', sans-serif", cursor: 'pointer' }}>Guardar Estado</button>
            </div>
          </div>
        </div>
      )}

      <ConfirmModal config={confirmConfig} onClose={closeConfirm} />
    </Layout>
  );
};

export default Postulaciones;