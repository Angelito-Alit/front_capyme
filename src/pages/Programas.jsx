import { useState, useEffect } from 'react';
import Layout from '../components/common/Layout';
import { programasService } from '../services/programasService';
import api from '../services/axios';
import {
  FileText,
  Plus,
  Search,
  Edit,
  Trash2,
  X,
  Calendar,
  DollarSign,
  CheckCircle,
  AlertCircle,
  Tag,
  ChevronDown,
  LayoutGrid,
  List,
  Building2,
  Clock,
  MapPin,
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
  { nombre: 'Estado de México', municipios: ['Toluca','Ecatepec','Naucalpan','Nezahualcóyotl','Tlalnepantla','Chimalhuacán','Ixtapaluca','Puebla','Texcoco','Valle de Chalco','Metepec','Cuautitlán Izcalli','Tultitlán'] },
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

const initialFormData = {
  nombre: '',
  descripcion: '',
  tipoPrograma: '',
  categoriaNegocioId: null,
  estado: '',
  municipio: '',
  requisitos: '',
  beneficios: '',
  fechaInicio: '',
  fechaCierre: '',
  montoApoyo: '',
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

const Programas = () => {
  const authStorage = JSON.parse(localStorage.getItem('auth-storage') || '{}');
  const currentUser = authStorage?.state?.user || {};

  const [programas, setProgramas] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('create');
  const [selectedPrograma, setSelectedPrograma] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategoria, setFilterCategoria] = useState('');
  const [filterEstado, setFilterEstado] = useState('');
  const [filterEstadoGeo, setFilterEstadoGeo] = useState('');
  const [filterMunicipio, setFilterMunicipio] = useState('');
  const [viewMode, setViewMode] = useState('grid');
  const [formData, setFormData] = useState(initialFormData);
  const [formErrors, setFormErrors] = useState({});
  const [hoveredRow, setHoveredRow] = useState(null);

  /* ── Modal de confirmación genérico ── */
  const [confirmConfig, setConfirmConfig] = useState({ show: false });
  const showConfirm = (cfg) => setConfirmConfig({ show: true, ...cfg });
  const closeConfirm = () => setConfirmConfig({ show: false });

  const inputBaseStyle = { width: '100%', padding: '10px 12px', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', fontSize: '14px', fontFamily: "'DM Sans', sans-serif", color: 'var(--gray-900)', background: '#fff', outline: 'none', transition: 'all 200ms ease', boxSizing: 'border-box' };
  const inputWithIconStyle = { ...inputBaseStyle, paddingLeft: '38px' };
  const inputErrorStyle = { borderColor: '#EF4444', boxShadow: '0 0 0 2px rgba(239,68,68,0.15)' };
  const labelStyle = { display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--gray-600)', marginBottom: '6px', fontFamily: "'DM Sans', sans-serif" };
  const selectStyle = { ...inputBaseStyle, appearance: 'none', paddingRight: '36px', cursor: 'pointer' };
  const textareaStyle = { ...inputBaseStyle, resize: 'vertical', minHeight: '90px' };

  useEffect(() => { cargarDatos(); }, [filterCategoria, filterEstado, filterEstadoGeo, filterMunicipio]);

  const cargarDatos = async () => {
    try {
      setLoading(true);
      const params = {};
      if (filterCategoria) params.categoriaId = filterCategoria;
      if (filterEstado !== '') params.activo = filterEstado;
      if (filterEstadoGeo) params.estado = filterEstadoGeo;
      if (filterMunicipio) params.municipio = filterMunicipio;

      const [programasRes, categoriasRes] = await Promise.all([programasService.getAll(params), api.get('/categorias')]);
      setProgramas(programasRes.data);
      setCategorias(categoriasRes.data.data);
    } catch {
      toast.error('Error al cargar programas');
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.nombre.trim()) errors.nombre = 'El nombre es requerido';
    if (formData.fechaInicio && formData.fechaCierre && formData.fechaInicio > formData.fechaCierre) errors.fechaCierre = 'La fecha de cierre debe ser posterior al inicio';
    if (formData.montoApoyo && isNaN(parseFloat(formData.montoApoyo))) errors.montoApoyo = 'Ingresa un monto válido';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleOpenModal = (mode, programa = null) => {
    setModalMode(mode);
    setSelectedPrograma(programa);
    setFormErrors({});
    if (mode === 'edit' && programa) {
      setFormData({
        nombre: programa.nombre || '',
        descripcion: programa.descripcion || '',
        tipoPrograma: programa.tipoPrograma || '',
        categoriaNegocioId: programa.categoriaNegocioId || null,
        estado: programa.estado || '',
        municipio: programa.municipio || '',
        requisitos: programa.requisitos || '',
        beneficios: programa.beneficios || '',
        fechaInicio: programa.fechaInicio ? programa.fechaInicio.split('T')[0] : '',
        fechaCierre: programa.fechaCierre ? programa.fechaCierre.split('T')[0] : '',
        montoApoyo: programa.montoApoyo || '',
      });
    } else {
      setFormData(initialFormData);
    }
    setShowModal(true);
  };

  const handleCloseModal = () => { setShowModal(false); setSelectedPrograma(null); setFormErrors({}); };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'estado') setFormData((prev) => ({ ...prev, estado: value, municipio: '' }));
    else setFormData((prev) => ({ ...prev, [name]: value }));
    if (formErrors[name]) setFormErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    setSubmitting(true);
    try {
      const { activo, ...rest } = formData;
      const dataToSend = {
        ...rest,
        categoriaNegocioId: formData.categoriaNegocioId ? parseInt(formData.categoriaNegocioId) : null,
        montoApoyo: formData.montoApoyo ? parseFloat(formData.montoApoyo) : null,
        fechaInicio: formData.fechaInicio ? new Date(formData.fechaInicio + 'T00:00:00.000Z').toISOString() : null,
        fechaCierre: formData.fechaCierre ? new Date(formData.fechaCierre + 'T00:00:00.000Z').toISOString() : null,
      };
      if (modalMode === 'create') {
        await programasService.create(dataToSend);
        toast.success('Programa creado exitosamente');
      } else {
        await programasService.update(selectedPrograma.id, dataToSend);
        toast.success('Programa actualizado exitosamente');
      }
      handleCloseModal();
      cargarDatos();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error al guardar programa');
    } finally {
      setSubmitting(false);
    }
  };

  /* ── toggle con modal en lugar de window.confirm ── */
  const handleToggleActivo = (programa) => {
    const desactivar = programa.activo;
    showConfirm({
      variant: desactivar ? 'danger' : 'warning',
      title: desactivar ? 'Desactivar programa' : 'Activar programa',
      subtitle: desactivar ? 'El programa dejará de estar disponible' : 'El programa estará visible para los usuarios',
      message: `¿Confirmas que deseas ${desactivar ? 'desactivar' : 'activar'} "${programa.nombre}"?`,
      confirmLabel: desactivar ? 'Sí, desactivar' : 'Sí, activar',
      onConfirm: async () => {
        try {
          await programasService.toggleActivo(programa.id);
          toast.success(`Programa ${desactivar ? 'desactivado' : 'activado'} exitosamente`);
          cargarDatos();
        } catch {
          toast.error('Error al cambiar estado');
        }
      },
    });
  };

  const programasFiltrados = programas.filter((p) =>
    p.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (p.tipoPrograma || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatCurrency = (amount) => {
    if (!amount) return null;
    return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(amount);
  };

  const formatDate = (date) => {
    if (!date) return null;
    return new Date(date).toLocaleDateString('es-MX', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  const getTipoColor = (tipo) => {
    const map = { Nacional: { bg: '#EEF4FF', color: 'var(--capyme-blue-mid)' }, Estatal: { bg: '#F0FDF4', color: '#16A34A' }, Municipal: { bg: '#FFF7ED', color: '#C2410C' } };
    return map[tipo] || { bg: 'var(--gray-100)', color: 'var(--gray-600)' };
  };

  if (loading) {
    return (
      <Layout>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '300px', flexDirection: 'column', gap: '16px' }}>
          <div style={{ width: '40px', height: '40px', border: '3px solid var(--gray-200)', borderTopColor: 'var(--capyme-blue-mid)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
          <span style={{ fontSize: '14px', color: 'var(--gray-500)', fontFamily: "'DM Sans', sans-serif" }}>Cargando programas...</span>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <style>{`
        @keyframes fadeInUp { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes modalIn { from { opacity: 0; transform: scale(0.96) translateY(8px); } to { opacity: 1; transform: scale(1) translateY(0); } }
        @keyframes spin { to { transform: rotate(360deg); } }
        .prog-card { animation: fadeInUp 0.3s ease both; transition: box-shadow 200ms ease, transform 200ms ease; }
        .prog-card:hover { box-shadow: 0 8px 24px rgba(31,78,158,0.10); transform: translateY(-2px); }
        .prog-modal { animation: modalIn 0.25s ease both; }
        input[type="date"]::-webkit-calendar-picker-indicator { opacity: 0.5; cursor: pointer; }
      `}</style>

      <div style={{ padding: '0 0 40px' }}>

        {/* ── HEADER ── */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '28px', flexWrap: 'wrap', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{ width: '46px', height: '46px', background: 'linear-gradient(135deg, var(--capyme-blue-mid), var(--capyme-blue))', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(31,78,158,0.25)' }}>
              <FileText style={{ width: '22px', height: '22px', color: '#fff' }} />
            </div>
            <div>
              <h1 style={{ fontSize: '22px', fontWeight: 800, color: 'var(--gray-900)', fontFamily: "'Plus Jakarta Sans', sans-serif", margin: 0, lineHeight: 1.2 }}>Programas de Apoyo</h1>
              <p style={{ fontSize: '13px', color: 'var(--gray-500)', margin: '3px 0 0', fontFamily: "'DM Sans', sans-serif" }}>
                {programas.length} programa{programas.length !== 1 ? 's' : ''} registrado{programas.length !== 1 ? 's' : ''}
              </p>
            </div>
          </div>
          {currentUser.rol !== 'cliente' && (
            <button onClick={() => handleOpenModal('create')} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 18px', background: 'linear-gradient(135deg, var(--capyme-blue-mid), var(--capyme-blue))', color: '#fff', border: 'none', borderRadius: 'var(--radius-md)', fontSize: '14px', fontWeight: 600, fontFamily: "'DM Sans', sans-serif", cursor: 'pointer', boxShadow: '0 2px 8px rgba(31,78,158,0.28)', transition: 'all 150ms ease' }} onMouseEnter={(e) => { e.currentTarget.style.opacity = '0.9'; e.currentTarget.style.transform = 'translateY(-1px)'; }} onMouseLeave={(e) => { e.currentTarget.style.opacity = '1'; e.currentTarget.style.transform = 'translateY(0)'; }}>
              <Plus style={{ width: '16px', height: '16px' }} />
              Nuevo Programa
            </button>
          )}
        </div>

        {/* ── STATS ── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '12px', marginBottom: '20px' }}>
          {[
            { label: 'Total', value: programas.length, color: 'var(--capyme-blue-mid)', bg: 'var(--capyme-blue-pale)' },
            { label: 'Activos', value: programas.filter((p) => p.activo).length, color: '#16A34A', bg: '#F0FDF4' },
            { label: 'Inactivos', value: programas.filter((p) => !p.activo).length, color: '#DC2626', bg: '#FEF2F2' },
            { label: 'Con Monto', value: programas.filter((p) => p.montoApoyo).length, color: '#C2410C', bg: '#FFF7ED' },
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
            <input type="text" placeholder="Buscar programa…" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} style={inputWithIconStyle} />
          </div>
          <div style={{ position: 'relative', minWidth: '160px' }}>
            <select value={filterCategoria} onChange={(e) => setFilterCategoria(e.target.value)} style={{ ...selectStyle, width: '100%' }}>
              <option value="">Todas las categorías</option>
              {categorias.map((cat) => <option key={cat.id} value={cat.id}>{cat.nombre}</option>)}
            </select>
            <ChevronDown style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', width: '14px', height: '14px', color: 'var(--gray-400)', pointerEvents: 'none' }} />
          </div>
          <div style={{ position: 'relative', minWidth: '160px' }}>
            <select value={filterEstadoGeo} onChange={(e) => { setFilterEstadoGeo(e.target.value); setFilterMunicipio(''); }} style={{ ...selectStyle, width: '100%' }}>
              <option value="">Todos los estados</option>
              {ESTADOS_MEXICO.map((e) => <option key={e.nombre} value={e.nombre}>{e.nombre}</option>)}
            </select>
            <ChevronDown style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', width: '14px', height: '14px', color: 'var(--gray-400)', pointerEvents: 'none' }} />
          </div>
          <div style={{ position: 'relative', minWidth: '160px' }}>
            <select value={filterMunicipio} onChange={(e) => setFilterMunicipio(e.target.value)} style={{ ...selectStyle, width: '100%' }} disabled={!filterEstadoGeo}>
              <option value="">Todos los municipios</option>
              {filterEstadoGeo && ESTADOS_MEXICO.find(e => e.nombre === filterEstadoGeo)?.municipios.map((m) => <option key={m} value={m}>{m}</option>)}
            </select>
            <ChevronDown style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', width: '14px', height: '14px', color: 'var(--gray-400)', pointerEvents: 'none' }} />
          </div>
          <div style={{ position: 'relative', minWidth: '130px' }}>
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
        {programasFiltrados.length === 0 ? (
          <div style={{ background: '#fff', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '60px 20px', textAlign: 'center', boxShadow: 'var(--shadow-sm)' }}>
            <div style={{ width: '56px', height: '56px', background: 'var(--gray-100)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' }}>
              <FileText style={{ width: '24px', height: '24px', color: 'var(--gray-400)' }} />
            </div>
            <p style={{ fontSize: '15px', fontWeight: 600, color: 'var(--gray-700)', margin: '0 0 6px', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>No se encontraron programas</p>
            <p style={{ fontSize: '13px', color: 'var(--gray-400)', margin: 0, fontFamily: "'DM Sans', sans-serif" }}>Intenta con otros filtros o crea un nuevo programa</p>
          </div>
        ) : viewMode === 'grid' ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '16px' }}>
            {programasFiltrados.map((programa, idx) => {
              const tipoStyle = getTipoColor(programa.tipoPrograma);
              return (
                <div key={programa.id} className="prog-card" style={{ background: '#fff', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', overflow: 'hidden', animationDelay: `${idx * 40}ms`, opacity: programa.activo ? 1 : 0.65 }}>
                  <div style={{ height: '4px', background: programa.activo ? 'linear-gradient(90deg, var(--capyme-blue-mid), var(--capyme-blue))' : 'var(--gray-200)' }} />
                  <div style={{ padding: '20px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '10px', marginBottom: '10px' }}>
                      <div style={{ flex: 1 }}>
                        <h3 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--gray-900)', fontFamily: "'Plus Jakarta Sans', sans-serif", margin: '0 0 6px', lineHeight: 1.3 }}>{programa.nombre}</h3>
                        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                          {programa.tipoPrograma && (
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '2px 8px', borderRadius: '20px', fontSize: '11px', fontWeight: 700, background: tipoStyle.bg, color: tipoStyle.color, fontFamily: "'Plus Jakarta Sans', sans-serif", textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                              <Tag style={{ width: '9px', height: '9px' }} />{programa.tipoPrograma}
                            </span>
                          )}
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '2px 8px', borderRadius: '20px', fontSize: '11px', fontWeight: 700, background: programa.activo ? '#ECFDF5' : '#FEF2F2', color: programa.activo ? '#065F46' : '#DC2626', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                            {programa.activo ? '● Activo' : '● Inactivo'}
                          </span>
                        </div>
                      </div>
                    </div>
                    {programa.descripcion && (
                      <p style={{ fontSize: '13px', color: 'var(--gray-500)', margin: '0 0 14px', fontFamily: "'DM Sans', sans-serif", lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{programa.descripcion}</p>
                    )}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '7px', marginBottom: '16px' }}>
                      {programa.montoApoyo && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
                          <DollarSign style={{ width: '13px', height: '13px', color: 'var(--capyme-blue-mid)', flexShrink: 0 }} />
                          <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--gray-800)', fontFamily: "'DM Sans', sans-serif" }}>{formatCurrency(programa.montoApoyo)}</span>
                        </div>
                      )}
                      {(programa.fechaInicio || programa.fechaCierre) && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
                          <Calendar style={{ width: '13px', height: '13px', color: 'var(--gray-400)', flexShrink: 0 }} />
                          <span style={{ fontSize: '12px', color: 'var(--gray-500)', fontFamily: "'DM Sans', sans-serif" }}>{formatDate(programa.fechaInicio)} {programa.fechaCierre ? `→ ${formatDate(programa.fechaCierre)}` : ''}</span>
                        </div>
                      )}
                      {(programa.estado || programa.municipio) && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
                          <MapPin style={{ width: '13px', height: '13px', color: 'var(--gray-400)', flexShrink: 0 }} />
                          <span style={{ fontSize: '12px', color: 'var(--gray-500)', fontFamily: "'DM Sans', sans-serif" }}>{[programa.municipio, programa.estado].filter(Boolean).join(', ')}</span>
                        </div>
                      )}
                      {programa.categoria && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
                          <Building2 style={{ width: '13px', height: '13px', color: 'var(--gray-400)', flexShrink: 0 }} />
                          <span style={{ fontSize: '12px', color: 'var(--gray-500)', fontFamily: "'DM Sans', sans-serif" }}>{programa.categoria.nombre}</span>
                        </div>
                      )}
                    </div>
                    <div style={{ display: 'flex', gap: '6px', paddingTop: '14px', borderTop: '1px solid var(--gray-100)' }}>
                      <div style={{ marginLeft: 'auto', display: 'flex', gap: '4px' }}>
                        {currentUser.rol !== 'cliente' && (
                          <button onClick={() => handleOpenModal('edit', programa)} title="Editar" style={{ width: '34px', height: '34px', border: 'none', borderRadius: 'var(--radius-sm)', background: 'transparent', cursor: 'pointer', color: 'var(--gray-400)', transition: 'all 150ms ease', display: 'flex', alignItems: 'center', justifyContent: 'center' }} onMouseEnter={(e) => { e.currentTarget.style.background = '#EEF4FF'; e.currentTarget.style.color = 'var(--capyme-blue-mid)'; }} onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--gray-400)'; }}>
                            <Edit style={{ width: '15px', height: '15px' }} />
                          </button>
                        )}
                        {currentUser.rol === 'admin' && !programa.activo && (
                          <button onClick={() => handleToggleActivo(programa)} title="Activar" style={{ width: '34px', height: '34px', border: 'none', borderRadius: 'var(--radius-sm)', background: 'transparent', cursor: 'pointer', color: 'var(--gray-400)', transition: 'all 150ms ease', display: 'flex', alignItems: 'center', justifyContent: 'center' }} onMouseEnter={(e) => { e.currentTarget.style.background = '#ECFDF5'; e.currentTarget.style.color = '#065F46'; }} onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--gray-400)'; }}>
                            <CheckCircle style={{ width: '15px', height: '15px' }} />
                          </button>
                        )}
                        {currentUser.rol === 'admin' && programa.activo && (
                          <button onClick={() => handleToggleActivo(programa)} title="Desactivar" style={{ width: '34px', height: '34px', border: 'none', borderRadius: 'var(--radius-sm)', background: 'transparent', cursor: 'pointer', color: 'var(--gray-400)', transition: 'all 150ms ease', display: 'flex', alignItems: 'center', justifyContent: 'center' }} onMouseEnter={(e) => { e.currentTarget.style.background = '#FEF2F2'; e.currentTarget.style.color = '#DC2626'; }} onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--gray-400)'; }}>
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
                  {['Programa', 'Tipo', 'Categoría', 'Monto', 'Vigencia', 'Estado', ''].map((h) => (
                    <th key={h} style={{ padding: '11px 16px', textAlign: h === '' ? 'right' : 'left', fontSize: '11px', fontWeight: 700, color: 'var(--gray-500)', fontFamily: "'Plus Jakarta Sans', sans-serif", textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {programasFiltrados.map((programa) => {
                  const tipoStyle = getTipoColor(programa.tipoPrograma);
                  return (
                    <tr key={programa.id} onMouseEnter={() => setHoveredRow(programa.id)} onMouseLeave={() => setHoveredRow(null)} style={{ borderBottom: '1px solid var(--gray-100)', background: hoveredRow === programa.id ? 'var(--gray-50)' : '#fff', transition: 'background 120ms ease', opacity: programa.activo ? 1 : 0.6 }}>
                      <td style={{ padding: '13px 16px', maxWidth: '260px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <div style={{ width: '36px', height: '36px', background: 'linear-gradient(135deg, var(--capyme-blue-mid), var(--capyme-blue))', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            <FileText style={{ width: '16px', height: '16px', color: '#fff' }} />
                          </div>
                          <div>
                            <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--gray-900)', fontFamily: "'DM Sans', sans-serif" }}>{programa.nombre}</div>
                            {programa.descripcion && <div style={{ fontSize: '12px', color: 'var(--gray-400)', fontFamily: "'DM Sans', sans-serif", maxWidth: '220px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{programa.descripcion}</div>}
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '13px 16px' }}>
                        {programa.tipoPrograma ? <span style={{ padding: '3px 8px', borderRadius: '20px', fontSize: '11px', fontWeight: 700, background: tipoStyle.bg, color: tipoStyle.color, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{programa.tipoPrograma}</span> : <span style={{ fontSize: '13px', color: 'var(--gray-300)' }}>—</span>}
                      </td>
                      <td style={{ padding: '13px 16px', fontSize: '13px', color: 'var(--gray-600)', fontFamily: "'DM Sans', sans-serif" }}>{programa.categoria?.nombre || <span style={{ color: 'var(--gray-300)' }}>—</span>}</td>
                      <td style={{ padding: '13px 16px', fontSize: '13px', fontWeight: 600, color: 'var(--gray-800)', fontFamily: "'DM Sans', sans-serif" }}>{formatCurrency(programa.montoApoyo) || <span style={{ color: 'var(--gray-300)', fontWeight: 400 }}>—</span>}</td>
                      <td style={{ padding: '13px 16px' }}>
                        {programa.fechaInicio ? (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                            <Clock style={{ width: '12px', height: '12px', color: 'var(--gray-400)' }} />
                            <span style={{ fontSize: '12px', color: 'var(--gray-500)', fontFamily: "'DM Sans', sans-serif", whiteSpace: 'nowrap' }}>{formatDate(programa.fechaInicio)}</span>
                          </div>
                        ) : <span style={{ color: 'var(--gray-300)', fontSize: '13px' }}>—</span>}
                      </td>
                      <td style={{ padding: '13px 16px' }}>
                        <span style={{ display: 'inline-block', padding: '3px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: 700, background: programa.activo ? '#ECFDF5' : '#FEF2F2', color: programa.activo ? '#065F46' : '#DC2626', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                          {programa.activo ? 'Activo' : 'Inactivo'}
                        </span>
                      </td>
                      <td style={{ padding: '13px 16px', textAlign: 'right' }}>
                        <div style={{ display: 'flex', gap: '4px', justifyContent: 'flex-end' }}>
                          {currentUser.rol !== 'cliente' && (
                            <button onClick={() => handleOpenModal('edit', programa)} title="Editar" style={{ width: '34px', height: '34px', border: 'none', borderRadius: 'var(--radius-sm)', background: 'transparent', cursor: 'pointer', color: 'var(--gray-400)', transition: 'all 150ms ease', display: 'flex', alignItems: 'center', justifyContent: 'center' }} onMouseEnter={(e) => { e.currentTarget.style.background = '#EEF4FF'; e.currentTarget.style.color = 'var(--capyme-blue-mid)'; }} onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--gray-400)'; }}>
                              <Edit style={{ width: '15px', height: '15px' }} />
                            </button>
                          )}
                          {currentUser.rol === 'admin' && !programa.activo && (
                            <button onClick={() => handleToggleActivo(programa)} title="Activar" style={{ width: '34px', height: '34px', border: 'none', borderRadius: 'var(--radius-sm)', background: 'transparent', cursor: 'pointer', color: 'var(--gray-400)', transition: 'all 150ms ease', display: 'flex', alignItems: 'center', justifyContent: 'center' }} onMouseEnter={(e) => { e.currentTarget.style.background = '#ECFDF5'; e.currentTarget.style.color = '#065F46'; }} onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--gray-400)'; }}>
                              <CheckCircle style={{ width: '15px', height: '15px' }} />
                            </button>
                          )}
                          {currentUser.rol === 'admin' && programa.activo && (
                            <button onClick={() => handleToggleActivo(programa)} title="Desactivar" style={{ width: '34px', height: '34px', border: 'none', borderRadius: 'var(--radius-sm)', background: 'transparent', cursor: 'pointer', color: 'var(--gray-400)', transition: 'all 150ms ease', display: 'flex', alignItems: 'center', justifyContent: 'center' }} onMouseEnter={(e) => { e.currentTarget.style.background = '#FEF2F2'; e.currentTarget.style.color = '#DC2626'; }} onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--gray-400)'; }}>
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

      {/* ═══ MODAL CREAR / EDITAR ═══ */}
      {showModal && (
        <div onClick={handleCloseModal} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.42)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
          <div className="prog-modal" onClick={(e) => e.stopPropagation()} style={{ background: '#fff', borderRadius: 'var(--radius-lg)', width: '100%', maxWidth: '720px', maxHeight: '92vh', display: 'flex', flexDirection: 'column', boxShadow: '0 24px 64px rgba(0,0,0,0.18)', overflow: 'hidden' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 24px', background: 'var(--gray-50)', borderBottom: '1px solid var(--border)', flexShrink: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '36px', height: '36px', background: 'linear-gradient(135deg, var(--capyme-blue-mid), var(--capyme-blue))', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <FileText style={{ width: '18px', height: '18px', color: '#fff' }} />
                </div>
                <h2 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--gray-900)', fontFamily: "'Plus Jakarta Sans', sans-serif", margin: 0 }}>
                  {modalMode === 'create' ? 'Nuevo Programa' : 'Editar Programa'}
                </h2>
              </div>
              <button onClick={handleCloseModal} style={{ width: '32px', height: '32px', border: 'none', borderRadius: 'var(--radius-sm)', background: 'transparent', cursor: 'pointer', color: 'var(--gray-400)', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 150ms ease' }} onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--gray-200)'; e.currentTarget.style.color = 'var(--gray-700)'; }} onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--gray-400)'; }}>
                <X style={{ width: '18px', height: '18px' }} />
              </button>
            </div>

            <div style={{ overflowY: 'auto', flex: 1, padding: '24px' }}>
              <SectionTitle icon={FileText} text="Información general" />
              <div style={{ marginTop: '14px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <label style={labelStyle}>Nombre del Programa <span style={{ color: '#EF4444' }}>*</span></label>
                  <input name="nombre" type="text" value={formData.nombre} onChange={handleChange} placeholder="Ej. Fondo PyME 2025" style={{ ...inputBaseStyle, ...(formErrors.nombre ? inputErrorStyle : {}) }} />
                  {formErrors.nombre && <ErrorMsg text={formErrors.nombre} />}
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                  <div>
                    <label style={labelStyle}>Tipo de Programa</label>
                    <div style={{ position: 'relative' }}>
                      <select name="tipoPrograma" value={formData.tipoPrograma} onChange={handleChange} style={selectStyle}>
                        <option value="">Seleccionar tipo</option>
                        <option value="Nacional">Nacional</option>
                        <option value="Estatal">Estatal</option>
                        <option value="Municipal">Municipal</option>
                      </select>
                      <ChevronDown style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', width: '14px', height: '14px', color: 'var(--gray-400)', pointerEvents: 'none' }} />
                    </div>
                  </div>
                  <div>
                    <label style={labelStyle}>Categoría de Negocio</label>
                    <div style={{ position: 'relative' }}>
                      <select name="categoriaNegocioId" value={formData.categoriaNegocioId || ''} onChange={(e) => setFormData((prev) => ({ ...prev, categoriaNegocioId: e.target.value ? parseInt(e.target.value) : null }))} style={selectStyle}>
                        <option value="">Sin categoría específica</option>
                        {categorias.map((cat) => <option key={cat.id} value={cat.id}>{cat.nombre}</option>)}
                      </select>
                      <ChevronDown style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', width: '14px', height: '14px', color: 'var(--gray-400)', pointerEvents: 'none' }} />
                    </div>
                  </div>
                </div>
                <div>
                  <label style={labelStyle}>Descripción</label>
                  <textarea name="descripcion" value={formData.descripcion} onChange={handleChange} placeholder="Descripción breve del programa..." style={textareaStyle} />
                </div>
              </div>

              <div style={{ marginTop: '24px' }}>
                <SectionTitle icon={MapPin} text="Ubicación geográfica" />
                <div style={{ marginTop: '14px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                  <div>
                    <label style={labelStyle}>Estado</label>
                    <div style={{ position: 'relative' }}>
                      <select name="estado" value={formData.estado} onChange={handleChange} style={selectStyle}>
                        <option value="">Aplica a todos los estados</option>
                        {ESTADOS_MEXICO.map((e) => <option key={e.nombre} value={e.nombre}>{e.nombre}</option>)}
                      </select>
                      <ChevronDown style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', width: '14px', height: '14px', color: 'var(--gray-400)', pointerEvents: 'none' }} />
                    </div>
                  </div>
                  <div>
                    <label style={labelStyle}>Municipio</label>
                    <div style={{ position: 'relative' }}>
                      <select name="municipio" value={formData.municipio} onChange={handleChange} style={{ ...selectStyle, opacity: formData.estado ? 1 : 0.5 }} disabled={!formData.estado}>
                        <option value="">Todos los municipios</option>
                        {formData.estado && ESTADOS_MEXICO.find(e => e.nombre === formData.estado)?.municipios.map((m) => <option key={m} value={m}>{m}</option>)}
                      </select>
                      <ChevronDown style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', width: '14px', height: '14px', color: 'var(--gray-400)', pointerEvents: 'none' }} />
                    </div>
                  </div>
                </div>
              </div>

              <div style={{ marginTop: '24px' }}>
                <SectionTitle icon={Tag} text="Requisitos y beneficios" />
                <div style={{ marginTop: '14px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                  <div>
                    <label style={labelStyle}>Requisitos</label>
                    <textarea name="requisitos" value={formData.requisitos} onChange={handleChange} placeholder="Lista de requisitos..." style={textareaStyle} />
                  </div>
                  <div>
                    <label style={labelStyle}>Beneficios</label>
                    <textarea name="beneficios" value={formData.beneficios} onChange={handleChange} placeholder="Beneficios del programa..." style={textareaStyle} />
                  </div>
                </div>
              </div>

              <div style={{ marginTop: '24px' }}>
                <SectionTitle icon={Calendar} text="Vigencia y apoyo económico" />
                <div style={{ marginTop: '14px', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '14px' }}>
                  <div>
                    <label style={labelStyle}>Fecha de Inicio</label>
                    <input name="fechaInicio" type="date" value={formData.fechaInicio} onChange={handleChange} style={inputBaseStyle} />
                  </div>
                  <div>
                    <label style={labelStyle}>Fecha de Cierre</label>
                    <input name="fechaCierre" type="date" value={formData.fechaCierre} onChange={handleChange} style={{ ...inputBaseStyle, ...(formErrors.fechaCierre ? inputErrorStyle : {}) }} />
                    {formErrors.fechaCierre && <ErrorMsg text={formErrors.fechaCierre} />}
                  </div>
                  <div>
                    <label style={labelStyle}>Monto de Apoyo (MXN)</label>
                    <div style={{ position: 'relative' }}>
                      <DollarSign style={{ position: 'absolute', left: '11px', top: '50%', transform: 'translateY(-50%)', width: '14px', height: '14px', color: 'var(--gray-400)', pointerEvents: 'none' }} />
                      <input name="montoApoyo" type="number" step="0.01" min="0" value={formData.montoApoyo} onChange={handleChange} placeholder="0.00" style={{ ...inputWithIconStyle, ...(formErrors.montoApoyo ? inputErrorStyle : {}) }} />
                    </div>
                    {formErrors.montoApoyo && <ErrorMsg text={formErrors.montoApoyo} />}
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
                {submitting ? 'Guardando…' : modalMode === 'create' ? 'Crear Programa' : 'Guardar Cambios'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ═══ MODAL CONFIRM GENÉRICO (toggle activo) ═══ */}
      <ConfirmModal config={confirmConfig} onClose={closeConfirm} />
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

export default Programas;