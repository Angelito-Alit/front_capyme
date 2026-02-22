import { useState, useEffect } from 'react';
import Layout from '../components/common/Layout';
import { negociosService } from '../services/negociosService';
import {
  Building2,
  Plus,
  Search,
  Edit,
  Trash2,
  X,
  MapPin,
  Phone,
  Mail,
  Users,
  Calendar,
  FileText,
  ChevronDown,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { toast } from 'react-hot-toast';

const estadosMexico = [
  'Aguascalientes', 'Baja California', 'Baja California Sur', 'Campeche',
  'Chiapas', 'Chihuahua', 'Ciudad de México', 'Coahuila', 'Colima',
  'Durango', 'Estado de México', 'Guanajuato', 'Guerrero', 'Hidalgo',
  'Jalisco', 'Michoacán', 'Morelos', 'Nayarit', 'Nuevo León', 'Oaxaca',
  'Puebla', 'Querétaro', 'Quintana Roo', 'San Luis Potosí', 'Sinaloa',
  'Sonora', 'Tabasco', 'Tamaulipas', 'Tlaxcala', 'Veracruz',
  'Yucatán', 'Zacatecas'
];

const initialFormData = {
  nombreNegocio: '',
  categoriaId: '',
  rfc: '',
  razonSocial: '',
  giroComercial: '',
  direccion: '',
  ciudad: '',
  estado: '',
  codigoPostal: '',
  telefonoNegocio: '',
  emailNegocio: '',
  numeroEmpleados: 0,
  anioFundacion: '',
  descripcion: '',
  activo: true
};

const Negocios = () => {
  const [negocios, setNegocios] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('create');
  const [selectedNegocio, setSelectedNegocio] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategoria, setFilterCategoria] = useState('');
  const [filterEstado, setFilterEstado] = useState('');
  const [formData, setFormData] = useState(initialFormData);
  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    cargarDatos();
  }, [filterCategoria, filterEstado]);

  const cargarDatos = async () => {
    try {
      setLoading(true);
      const params = {};
      if (filterCategoria) params.categoriaId = filterCategoria;
      if (filterEstado !== '') params.activo = filterEstado;

      const [negociosRes, categoriasRes] = await Promise.all([
        negociosService.getAll(params),
        fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000/api'}/categorias`).then(r => r.json())
      ]);

      setNegocios(negociosRes.data || []);
      setCategorias(categoriasRes.data || []);
    } catch (error) {
      toast.error('Error al cargar negocios');
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.nombreNegocio.trim()) errors.nombreNegocio = 'El nombre es requerido';
    if (!formData.categoriaId) errors.categoriaId = 'La categoría es requerida';
    if (formData.rfc && !/^[A-ZÑ&]{3,4}\d{6}[A-Z\d]{3}$/i.test(formData.rfc)) {
      errors.rfc = 'RFC no válido';
    }
    if (formData.emailNegocio && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.emailNegocio)) {
      errors.emailNegocio = 'Email no válido';
    }
    if (formData.codigoPostal && !/^\d{5}$/.test(formData.codigoPostal)) {
      errors.codigoPostal = 'Código postal debe ser de 5 dígitos';
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleOpenModal = (mode, negocio = null) => {
    setModalMode(mode);
    setSelectedNegocio(negocio);
    setFormErrors({});
    if (mode === 'edit' && negocio) {
      setFormData({
        nombreNegocio: negocio.nombreNegocio || '',
        categoriaId: negocio.categoriaId || '',
        rfc: negocio.rfc || '',
        razonSocial: negocio.razonSocial || '',
        giroComercial: negocio.giroComercial || '',
        direccion: negocio.direccion || '',
        ciudad: negocio.ciudad || '',
        estado: negocio.estado || '',
        codigoPostal: negocio.codigoPostal || '',
        telefonoNegocio: negocio.telefonoNegocio || '',
        emailNegocio: negocio.emailNegocio || '',
        numeroEmpleados: negocio.numeroEmpleados || 0,
        anioFundacion: negocio.anioFundacion || '',
        descripcion: negocio.descripcion || '',
        activo: negocio.activo ?? true
      });
    } else {
      setFormData({ ...initialFormData });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedNegocio(null);
    setFormErrors({});
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (formErrors[field]) {
      setFormErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    try {
      setSubmitting(true);
      const dataToSend = {
        ...formData,
        categoriaId: parseInt(formData.categoriaId),
        numeroEmpleados: parseInt(formData.numeroEmpleados) || 0,
        anioFundacion: formData.anioFundacion ? parseInt(formData.anioFundacion) : null
      };
      if (modalMode === 'create') {
        await negociosService.create(dataToSend);
        toast.success('Negocio creado exitosamente');
      } else {
        await negociosService.update(selectedNegocio.id, dataToSend);
        toast.success('Negocio actualizado exitosamente');
      }
      handleCloseModal();
      cargarDatos();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error al guardar negocio');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id, nombre) => {
    if (window.confirm(`¿Estás seguro de eliminar el negocio "${nombre}"? Esta acción no se puede deshacer.`)) {
      try {
        await negociosService.delete(id);
        toast.success('Negocio eliminado exitosamente');
        cargarDatos();
      } catch (error) {
        toast.error('Error al eliminar negocio');
      }
    }
  };

  const negociosFiltrados = negocios.filter(negocio =>
    negocio.nombreNegocio?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    negocio.rfc?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    negocio.razonSocial?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const inputBaseStyle = {
    width: '100%',
    padding: '10px 12px',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius-md)',
    fontSize: '14px',
    fontFamily: "'DM Sans', sans-serif",
    color: 'var(--gray-900)',
    background: '#fff',
    outline: 'none',
    transition: 'all 200ms ease',
  };

  const inputWithIconStyle = {
    ...inputBaseStyle,
    paddingLeft: '38px',
  };

  const inputErrorStyle = {
    borderColor: '#EF4444',
    boxShadow: '0 0 0 2px rgba(239,68,68,0.15)',
  };

  const labelStyle = {
    display: 'block',
    fontSize: '13px',
    fontWeight: 600,
    color: 'var(--gray-600)',
    marginBottom: '6px',
    fontFamily: "'DM Sans', sans-serif",
  };

  const selectStyle = {
    ...inputBaseStyle,
    appearance: 'none',
    paddingRight: '36px',
    cursor: 'pointer',
    background: '#fff',
  };

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
            Cargando negocios...
          </p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>

        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap' }}>
          <div>
            <h1 style={{
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              fontSize: '26px', fontWeight: 800,
              color: 'var(--gray-900)',
              letterSpacing: '-0.02em',
              marginBottom: '4px',
              display: 'flex', alignItems: 'center', gap: '10px',
            }}>
              <Building2 style={{ width: '28px', height: '28px', color: 'var(--capyme-blue-mid)' }} />
              Gestión de Negocios
            </h1>
            <p style={{ fontSize: '14px', color: 'var(--gray-500)', fontFamily: "'DM Sans', sans-serif" }}>
              {negociosFiltrados.length} negocio{negociosFiltrados.length !== 1 ? 's' : ''} registrado{negociosFiltrados.length !== 1 ? 's' : ''}
            </p>
          </div>
          <button
            onClick={() => handleOpenModal('create')}
            style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              padding: '10px 20px',
              background: 'linear-gradient(135deg, var(--capyme-blue-mid), var(--capyme-blue))',
              color: '#fff',
              border: 'none',
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
            Nuevo Negocio
          </button>
        </div>

        <div style={{
          background: '#fff',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-lg)',
          boxShadow: 'var(--shadow-sm)',
          overflow: 'hidden',
        }}>
          <div style={{
            padding: '20px 24px',
            borderBottom: '1px solid var(--border)',
            display: 'grid',
            gridTemplateColumns: '2fr 1fr 1fr',
            gap: '12px',
            alignItems: 'center',
          }}>
            <div style={{ position: 'relative' }}>
              <Search style={{
                position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)',
                width: '16px', height: '16px', color: 'var(--gray-400)', pointerEvents: 'none',
              }} />
              <input
                type="text"
                placeholder="Buscar por nombre, RFC o razón social..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={inputWithIconStyle}
                onFocus={e => {
                  e.target.style.borderColor = 'var(--capyme-blue-mid)';
                  e.target.style.boxShadow = '0 0 0 3px rgba(43,91,166,0.12)';
                }}
                onBlur={e => {
                  e.target.style.borderColor = 'var(--border)';
                  e.target.style.boxShadow = 'none';
                }}
              />
            </div>
            <div style={{ position: 'relative' }}>
              <select
                value={filterCategoria}
                onChange={(e) => setFilterCategoria(e.target.value)}
                style={selectStyle}
              >
                <option value="">Todas las categorías</option>
                {categorias.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.nombre}</option>
                ))}
              </select>
              <ChevronDown style={{
                position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)',
                width: '16px', height: '16px', color: 'var(--gray-400)', pointerEvents: 'none',
              }} />
            </div>
            <div style={{ position: 'relative' }}>
              <select
                value={filterEstado}
                onChange={(e) => setFilterEstado(e.target.value)}
                style={selectStyle}
              >
                <option value="">Todos los estados</option>
                <option value="true">Activos</option>
                <option value="false">Inactivos</option>
              </select>
              <ChevronDown style={{
                position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)',
                width: '16px', height: '16px', color: 'var(--gray-400)', pointerEvents: 'none',
              }} />
            </div>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: 'var(--gray-50)' }}>
                  {['Negocio', 'RFC', 'Categoría', 'Propietario', 'Estado', 'Acciones'].map((h, i) => (
                    <th key={h} style={{
                      padding: '14px 24px',
                      textAlign: i === 5 ? 'right' : i === 4 ? 'center' : 'left',
                      fontSize: '11px',
                      fontWeight: 700,
                      color: 'var(--gray-500)',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                      fontFamily: "'Plus Jakarta Sans', sans-serif",
                      borderBottom: '1px solid var(--border)',
                      whiteSpace: 'nowrap',
                    }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {negociosFiltrados.length > 0 ? (
                  negociosFiltrados.map((negocio) => (
                    <tr
                      key={negocio.id}
                      style={{ borderBottom: '1px solid var(--border)', transition: 'background 150ms ease', cursor: 'default' }}
                      onMouseEnter={e => e.currentTarget.style.background = 'var(--gray-50)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    >
                      <td style={{ padding: '14px 24px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <div style={{
                            width: '38px', height: '38px', borderRadius: 'var(--radius-md)',
                            background: 'linear-gradient(135deg, var(--capyme-blue-mid), var(--capyme-blue))',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            color: '#fff', fontSize: '14px', fontWeight: 700,
                            fontFamily: "'Plus Jakarta Sans', sans-serif",
                            flexShrink: 0,
                          }}>
                            {negocio.nombreNegocio?.charAt(0)?.toUpperCase()}
                          </div>
                          <div>
                            <p style={{
                              fontSize: '13px', fontWeight: 600, color: 'var(--gray-800)',
                              fontFamily: "'DM Sans', sans-serif",
                            }}>{negocio.nombreNegocio}</p>
                            {(negocio.ciudad || negocio.estado) && (
                              <p style={{
                                fontSize: '12px', color: 'var(--gray-400)',
                                display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px',
                              }}>
                                <MapPin style={{ width: '11px', height: '11px' }} />
                                {[negocio.ciudad, negocio.estado].filter(Boolean).join(', ')}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '14px 24px' }}>
                        <span style={{
                          fontSize: '13px', color: negocio.rfc ? 'var(--gray-700)' : 'var(--gray-300)',
                          fontFamily: negocio.rfc ? "'JetBrains Mono', monospace" : "'DM Sans', sans-serif",
                          fontStyle: negocio.rfc ? 'normal' : 'italic',
                        }}>
                          {negocio.rfc || 'Sin RFC'}
                        </span>
                      </td>
                      <td style={{ padding: '14px 24px' }}>
                        <span style={{
                          display: 'inline-block',
                          padding: '3px 10px',
                          background: 'var(--capyme-blue-pale)',
                          color: 'var(--capyme-blue-mid)',
                          borderRadius: 'var(--radius-sm)',
                          fontSize: '11px', fontWeight: 700,
                          fontFamily: "'Plus Jakarta Sans', sans-serif",
                        }}>
                          {negocio.categoria?.nombre || 'Sin categoría'}
                        </span>
                      </td>
                      <td style={{ padding: '14px 24px' }}>
                        <p style={{ fontSize: '13px', fontWeight: 500, color: 'var(--gray-800)' }}>
                          {negocio.usuario?.nombre} {negocio.usuario?.apellido}
                        </p>
                        <p style={{ fontSize: '12px', color: 'var(--gray-400)', marginTop: '1px' }}>
                          {negocio.usuario?.email}
                        </p>
                      </td>
                      <td style={{ padding: '14px 24px', textAlign: 'center' }}>
                        <span style={{
                          display: 'inline-block',
                          padding: '3px 10px',
                          background: negocio.activo ? '#ECFDF5' : '#FEF2F2',
                          color: negocio.activo ? '#065F46' : '#DC2626',
                          borderRadius: '99px',
                          fontSize: '11px', fontWeight: 700,
                          fontFamily: "'Plus Jakarta Sans', sans-serif",
                          textTransform: 'uppercase',
                          letterSpacing: '0.04em',
                        }}>
                          {negocio.activo ? 'Activo' : 'Inactivo'}
                        </span>
                      </td>
                      <td style={{ padding: '14px 24px', textAlign: 'right' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '4px' }}>
                          <button
                            onClick={() => handleOpenModal('edit', negocio)}
                            title="Editar"
                            style={{
                              width: '34px', height: '34px',
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              border: 'none', borderRadius: 'var(--radius-sm)',
                              background: 'transparent', cursor: 'pointer',
                              color: 'var(--gray-400)', transition: 'all 150ms ease',
                            }}
                            onMouseEnter={e => {
                              e.currentTarget.style.background = '#EEF4FF';
                              e.currentTarget.style.color = 'var(--capyme-blue-mid)';
                            }}
                            onMouseLeave={e => {
                              e.currentTarget.style.background = 'transparent';
                              e.currentTarget.style.color = 'var(--gray-400)';
                            }}
                          >
                            <Edit style={{ width: '16px', height: '16px' }} />
                          </button>
                          <button
                            onClick={() => handleDelete(negocio.id, negocio.nombreNegocio)}
                            title="Eliminar"
                            style={{
                              width: '34px', height: '34px',
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              border: 'none', borderRadius: 'var(--radius-sm)',
                              background: 'transparent', cursor: 'pointer',
                              color: 'var(--gray-400)', transition: 'all 150ms ease',
                            }}
                            onMouseEnter={e => {
                              e.currentTarget.style.background = '#FEF2F2';
                              e.currentTarget.style.color = '#DC2626';
                            }}
                            onMouseLeave={e => {
                              e.currentTarget.style.background = 'transparent';
                              e.currentTarget.style.color = 'var(--gray-400)';
                            }}
                          >
                            <Trash2 style={{ width: '16px', height: '16px' }} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" style={{ padding: '60px 24px', textAlign: 'center' }}>
                      <Building2 style={{ width: '40px', height: '40px', color: 'var(--gray-200)', margin: '0 auto 12px' }} />
                      <p style={{ fontSize: '14px', color: 'var(--gray-400)', fontWeight: 500 }}>No se encontraron negocios</p>
                      <p style={{ fontSize: '12px', color: 'var(--gray-300)', marginTop: '4px' }}>Intenta ajustar los filtros o crea uno nuevo</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {showModal && (
        <div
          style={{
            position: 'fixed', inset: 0,
            background: 'rgba(0,0,0,0.4)',
            backdropFilter: 'blur(4px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 50, padding: '16px',
          }}
          onClick={handleCloseModal}
        >
          <div
            style={{
              background: '#fff',
              borderRadius: 'var(--radius-lg)',
              maxWidth: '720px', width: '100%',
              maxHeight: '90vh',
              display: 'flex', flexDirection: 'column',
              boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
              overflow: 'hidden',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '20px 24px',
              borderBottom: '1px solid var(--border)',
              background: 'var(--gray-50)',
            }}>
              <div>
                <h2 style={{
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  fontSize: '18px', fontWeight: 800, color: 'var(--gray-900)',
                  letterSpacing: '-0.01em',
                }}>
                  {modalMode === 'create' ? 'Nuevo Negocio' : 'Editar Negocio'}
                </h2>
                <p style={{ fontSize: '13px', color: 'var(--gray-400)', marginTop: '2px', fontFamily: "'DM Sans', sans-serif" }}>
                  {modalMode === 'create' ? 'Registra un nuevo negocio en el sistema' : `Editando: ${selectedNegocio?.nombreNegocio}`}
                </p>
              </div>
              <button
                onClick={handleCloseModal}
                style={{
                  width: '36px', height: '36px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  border: 'none', borderRadius: 'var(--radius-sm)',
                  background: 'transparent', cursor: 'pointer',
                  color: 'var(--gray-400)', transition: 'all 150ms ease',
                }}
                onMouseEnter={e => { e.currentTarget.style.background = 'var(--gray-100)'; e.currentTarget.style.color = 'var(--gray-600)'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--gray-400)'; }}
              >
                <X style={{ width: '20px', height: '20px' }} />
              </button>
            </div>

            <form onSubmit={handleSubmit} style={{ overflowY: 'auto', flex: 1, padding: '24px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

                <SectionTitle icon={Building2} text="Información General" />
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div style={{ gridColumn: '1 / -1' }}>
                    <label style={labelStyle}>Nombre del Negocio *</label>
                    <div style={{ position: 'relative' }}>
                      <Building2 style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', width: '16px', height: '16px', color: 'var(--gray-400)', pointerEvents: 'none' }} />
                      <input
                        type="text" value={formData.nombreNegocio}
                        onChange={(e) => handleChange('nombreNegocio', e.target.value)}
                        placeholder="Ej: Mi Empresa S.A. de C.V."
                        style={{ ...inputWithIconStyle, ...(formErrors.nombreNegocio ? inputErrorStyle : {}) }}
                        onFocus={e => { if (!formErrors.nombreNegocio) { e.target.style.borderColor = 'var(--capyme-blue-mid)'; e.target.style.boxShadow = '0 0 0 3px rgba(43,91,166,0.12)'; } }}
                        onBlur={e => { if (!formErrors.nombreNegocio) { e.target.style.borderColor = 'var(--border)'; e.target.style.boxShadow = 'none'; } }}
                      />
                    </div>
                    {formErrors.nombreNegocio && <ErrorMsg text={formErrors.nombreNegocio} />}
                  </div>

                  <div>
                    <label style={labelStyle}>Categoría *</label>
                    <div style={{ position: 'relative' }}>
                      <select value={formData.categoriaId} onChange={(e) => handleChange('categoriaId', e.target.value)}
                        style={{ ...selectStyle, ...(formErrors.categoriaId ? inputErrorStyle : {}) }}>
                        <option value="">Seleccionar categoría</option>
                        {categorias.map(cat => <option key={cat.id} value={cat.id}>{cat.nombre}</option>)}
                      </select>
                      <ChevronDown style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', width: '16px', height: '16px', color: 'var(--gray-400)', pointerEvents: 'none' }} />
                    </div>
                    {formErrors.categoriaId && <ErrorMsg text={formErrors.categoriaId} />}
                  </div>

                  <div>
                    <label style={labelStyle}>RFC</label>
                    <input type="text" value={formData.rfc}
                      onChange={(e) => handleChange('rfc', e.target.value.toUpperCase())}
                      placeholder="XAXX010101000" maxLength={13}
                      style={{ ...inputBaseStyle, ...(formErrors.rfc ? inputErrorStyle : {}) }}
                      onFocus={e => { if (!formErrors.rfc) { e.target.style.borderColor = 'var(--capyme-blue-mid)'; e.target.style.boxShadow = '0 0 0 3px rgba(43,91,166,0.12)'; } }}
                      onBlur={e => { if (!formErrors.rfc) { e.target.style.borderColor = 'var(--border)'; e.target.style.boxShadow = 'none'; } }}
                    />
                    {formErrors.rfc && <ErrorMsg text={formErrors.rfc} />}
                  </div>

                  <div>
                    <label style={labelStyle}>Razón Social</label>
                    <input type="text" value={formData.razonSocial}
                      onChange={(e) => handleChange('razonSocial', e.target.value)}
                      placeholder="Razón social del negocio" style={inputBaseStyle}
                      onFocus={e => { e.target.style.borderColor = 'var(--capyme-blue-mid)'; e.target.style.boxShadow = '0 0 0 3px rgba(43,91,166,0.12)'; }}
                      onBlur={e => { e.target.style.borderColor = 'var(--border)'; e.target.style.boxShadow = 'none'; }}
                    />
                  </div>

                  <div>
                    <label style={labelStyle}>Giro Comercial</label>
                    <input type="text" value={formData.giroComercial}
                      onChange={(e) => handleChange('giroComercial', e.target.value)}
                      placeholder="Ej: Comercio, Servicios, etc." style={inputBaseStyle}
                      onFocus={e => { e.target.style.borderColor = 'var(--capyme-blue-mid)'; e.target.style.boxShadow = '0 0 0 3px rgba(43,91,166,0.12)'; }}
                      onBlur={e => { e.target.style.borderColor = 'var(--border)'; e.target.style.boxShadow = 'none'; }}
                    />
                  </div>
                </div>

                <SectionTitle icon={MapPin} text="Ubicación" />
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div style={{ gridColumn: '1 / -1' }}>
                    <label style={labelStyle}>Dirección</label>
                    <div style={{ position: 'relative' }}>
                      <MapPin style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', width: '16px', height: '16px', color: 'var(--gray-400)', pointerEvents: 'none' }} />
                      <input type="text" value={formData.direccion}
                        onChange={(e) => handleChange('direccion', e.target.value)}
                        placeholder="Calle, número, colonia" style={inputWithIconStyle}
                        onFocus={e => { e.target.style.borderColor = 'var(--capyme-blue-mid)'; e.target.style.boxShadow = '0 0 0 3px rgba(43,91,166,0.12)'; }}
                        onBlur={e => { e.target.style.borderColor = 'var(--border)'; e.target.style.boxShadow = 'none'; }}
                      />
                    </div>
                  </div>

                  <div>
                    <label style={labelStyle}>Ciudad</label>
                    <input type="text" value={formData.ciudad}
                      onChange={(e) => handleChange('ciudad', e.target.value)}
                      placeholder="Ej: Querétaro" style={inputBaseStyle}
                      onFocus={e => { e.target.style.borderColor = 'var(--capyme-blue-mid)'; e.target.style.boxShadow = '0 0 0 3px rgba(43,91,166,0.12)'; }}
                      onBlur={e => { e.target.style.borderColor = 'var(--border)'; e.target.style.boxShadow = 'none'; }}
                    />
                  </div>

                  <div>
                    <label style={labelStyle}>Estado</label>
                    <div style={{ position: 'relative' }}>
                      <select value={formData.estado} onChange={(e) => handleChange('estado', e.target.value)} style={selectStyle}>
                        <option value="">Seleccionar estado</option>
                        {estadosMexico.map(est => <option key={est} value={est}>{est}</option>)}
                      </select>
                      <ChevronDown style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', width: '16px', height: '16px', color: 'var(--gray-400)', pointerEvents: 'none' }} />
                    </div>
                  </div>

                  <div>
                    <label style={labelStyle}>Código Postal</label>
                    <input type="text" value={formData.codigoPostal}
                      onChange={(e) => handleChange('codigoPostal', e.target.value.replace(/\D/g, '').slice(0, 5))}
                      placeholder="76000" maxLength={5}
                      style={{ ...inputBaseStyle, ...(formErrors.codigoPostal ? inputErrorStyle : {}) }}
                      onFocus={e => { if (!formErrors.codigoPostal) { e.target.style.borderColor = 'var(--capyme-blue-mid)'; e.target.style.boxShadow = '0 0 0 3px rgba(43,91,166,0.12)'; } }}
                      onBlur={e => { if (!formErrors.codigoPostal) { e.target.style.borderColor = 'var(--border)'; e.target.style.boxShadow = 'none'; } }}
                    />
                    {formErrors.codigoPostal && <ErrorMsg text={formErrors.codigoPostal} />}
                  </div>
                </div>

                <SectionTitle icon={Phone} text="Contacto" />
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div>
                    <label style={labelStyle}>Teléfono</label>
                    <div style={{ position: 'relative' }}>
                      <Phone style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', width: '16px', height: '16px', color: 'var(--gray-400)', pointerEvents: 'none' }} />
                      <input type="tel" value={formData.telefonoNegocio}
                        onChange={(e) => handleChange('telefonoNegocio', e.target.value)}
                        placeholder="442 123 4567" style={inputWithIconStyle}
                        onFocus={e => { e.target.style.borderColor = 'var(--capyme-blue-mid)'; e.target.style.boxShadow = '0 0 0 3px rgba(43,91,166,0.12)'; }}
                        onBlur={e => { e.target.style.borderColor = 'var(--border)'; e.target.style.boxShadow = 'none'; }}
                      />
                    </div>
                  </div>
                  <div>
                    <label style={labelStyle}>Email</label>
                    <div style={{ position: 'relative' }}>
                      <Mail style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', width: '16px', height: '16px', color: 'var(--gray-400)', pointerEvents: 'none' }} />
                      <input type="email" value={formData.emailNegocio}
                        onChange={(e) => handleChange('emailNegocio', e.target.value)}
                        placeholder="contacto@negocio.com"
                        style={{ ...inputWithIconStyle, ...(formErrors.emailNegocio ? inputErrorStyle : {}) }}
                        onFocus={e => { if (!formErrors.emailNegocio) { e.target.style.borderColor = 'var(--capyme-blue-mid)'; e.target.style.boxShadow = '0 0 0 3px rgba(43,91,166,0.12)'; } }}
                        onBlur={e => { if (!formErrors.emailNegocio) { e.target.style.borderColor = 'var(--border)'; e.target.style.boxShadow = 'none'; } }}
                      />
                    </div>
                    {formErrors.emailNegocio && <ErrorMsg text={formErrors.emailNegocio} />}
                  </div>
                </div>

                <SectionTitle icon={FileText} text="Detalles" />
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
                  <div>
                    <label style={labelStyle}>No. de Empleados</label>
                    <div style={{ position: 'relative' }}>
                      <Users style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', width: '16px', height: '16px', color: 'var(--gray-400)', pointerEvents: 'none' }} />
                      <input type="number" min="0" value={formData.numeroEmpleados}
                        onChange={(e) => handleChange('numeroEmpleados', parseInt(e.target.value) || 0)}
                        style={inputWithIconStyle}
                        onFocus={e => { e.target.style.borderColor = 'var(--capyme-blue-mid)'; e.target.style.boxShadow = '0 0 0 3px rgba(43,91,166,0.12)'; }}
                        onBlur={e => { e.target.style.borderColor = 'var(--border)'; e.target.style.boxShadow = 'none'; }}
                      />
                    </div>
                  </div>
                  <div>
                    <label style={labelStyle}>Año de Fundación</label>
                    <div style={{ position: 'relative' }}>
                      <Calendar style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', width: '16px', height: '16px', color: 'var(--gray-400)', pointerEvents: 'none' }} />
                      <input type="number" min="1900" max={new Date().getFullYear()}
                        value={formData.anioFundacion}
                        onChange={(e) => handleChange('anioFundacion', e.target.value)}
                        placeholder={`${new Date().getFullYear()}`} style={inputWithIconStyle}
                        onFocus={e => { e.target.style.borderColor = 'var(--capyme-blue-mid)'; e.target.style.boxShadow = '0 0 0 3px rgba(43,91,166,0.12)'; }}
                        onBlur={e => { e.target.style.borderColor = 'var(--border)'; e.target.style.boxShadow = 'none'; }}
                      />
                    </div>
                  </div>
                  <div>
                    <label style={labelStyle}>Estado del Negocio</label>
                    <div style={{ position: 'relative' }}>
                      <select value={formData.activo.toString()}
                        onChange={(e) => handleChange('activo', e.target.value === 'true')}
                        style={selectStyle}>
                        <option value="true">Activo</option>
                        <option value="false">Inactivo</option>
                      </select>
                      <ChevronDown style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', width: '16px', height: '16px', color: 'var(--gray-400)', pointerEvents: 'none' }} />
                    </div>
                  </div>
                  <div style={{ gridColumn: '1 / -1' }}>
                    <label style={labelStyle}>Descripción</label>
                    <textarea rows="3" value={formData.descripcion}
                      onChange={(e) => handleChange('descripcion', e.target.value)}
                      placeholder="Breve descripción del negocio..."
                      style={{ ...inputBaseStyle, resize: 'none' }}
                      onFocus={e => { e.target.style.borderColor = 'var(--capyme-blue-mid)'; e.target.style.boxShadow = '0 0 0 3px rgba(43,91,166,0.12)'; }}
                      onBlur={e => { e.target.style.borderColor = 'var(--border)'; e.target.style.boxShadow = 'none'; }}
                    />
                  </div>
                </div>
              </div>
            </form>

            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '12px',
              padding: '16px 24px',
              borderTop: '1px solid var(--border)',
              background: 'var(--gray-50)',
            }}>
              <button
                type="button" onClick={handleCloseModal} disabled={submitting}
                style={{
                  padding: '10px 20px',
                  fontSize: '14px', fontWeight: 600,
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  color: 'var(--gray-600)',
                  background: '#fff',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-md)',
                  cursor: submitting ? 'not-allowed' : 'pointer',
                  opacity: submitting ? 0.5 : 1,
                  transition: 'all 150ms ease',
                }}
                onMouseEnter={e => { if (!submitting) e.currentTarget.style.background = 'var(--gray-50)'; }}
                onMouseLeave={e => e.currentTarget.style.background = '#fff'}
              >
                Cancelar
              </button>
              <button
                type="submit" onClick={handleSubmit} disabled={submitting}
                style={{
                  display: 'flex', alignItems: 'center', gap: '8px',
                  padding: '10px 24px',
                  fontSize: '14px', fontWeight: 600,
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  color: '#fff',
                  background: 'linear-gradient(135deg, var(--capyme-blue-mid), var(--capyme-blue))',
                  border: 'none',
                  borderRadius: 'var(--radius-md)',
                  cursor: submitting ? 'not-allowed' : 'pointer',
                  opacity: submitting ? 0.7 : 1,
                  boxShadow: '0 2px 8px rgba(31,78,158,0.28)',
                  transition: 'all 200ms ease',
                }}
                onMouseEnter={e => { if (!submitting) e.currentTarget.style.transform = 'translateY(-1px)'; }}
                onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
              >
                {submitting && (
                  <div style={{
                    width: '16px', height: '16px',
                    border: '2px solid rgba(255,255,255,0.3)',
                    borderTopColor: '#fff',
                    borderRadius: '50%',
                    animation: 'spin 700ms linear infinite',
                  }} />
                )}
                {modalMode === 'create' ? 'Crear Negocio' : 'Guardar Cambios'}
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};

const SectionTitle = ({ icon: Icon, text }) => (
  <div style={{
    display: 'flex', alignItems: 'center', gap: '8px',
    paddingBottom: '4px',
  }}>
    <Icon style={{ width: '14px', height: '14px', color: 'var(--gray-400)' }} />
    <span style={{
      fontSize: '11px', fontWeight: 700,
      color: 'var(--gray-400)',
      textTransform: 'uppercase',
      letterSpacing: '0.06em',
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

export default Negocios;