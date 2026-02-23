import { useState, useEffect } from 'react';
import Layout from '../../components/common/Layout';
import { negociosService } from '../../services/negociosService';
import { categoriasService } from '../../services/categoriasService';
import {
  Building2,
  Plus,
  Edit,
  MapPin,
  Phone,
  Mail,
  Users,
  X,
  AlertCircle,
  Hash,
  Calendar,
  FileText,
  Tag,
  Search,
} from 'lucide-react';
import { toast } from 'react-hot-toast';

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
};

const MisNegocios = () => {
  const authStorage = JSON.parse(localStorage.getItem('auth-storage') || '{}');
  const currentUser = authStorage?.state?.user || {};

  const [negocios, setNegocios] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('create');
  const [selectedNegocio, setSelectedNegocio] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState(initialFormData);
  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      setLoading(true);
      const [negociosRes, categoriasRes] = await Promise.all([
        negociosService.getMisNegocios(),
        categoriasService.getAll({ activo: true }),
      ]);
      setNegocios(negociosRes.data);
      setCategorias(categoriasRes.data);
    } catch {
      toast.error('Error al cargar negocios');
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.nombreNegocio.trim()) errors.nombreNegocio = 'El nombre es requerido';
    if (!formData.categoriaId) errors.categoriaId = 'La categoría es requerida';
    if (formData.rfc && !/^[A-ZÑ&]{3,4}[0-9]{6}[A-Z0-9]{3}$/i.test(formData.rfc.trim())) {
      errors.rfc = 'RFC inválido';
    }
    if (formData.emailNegocio && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.emailNegocio)) {
      errors.emailNegocio = 'Email inválido';
    }
    return errors;
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
      });
    } else {
      setFormData(initialFormData);
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedNegocio(null);
    setFormErrors({});
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (formErrors[name]) setFormErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handleSubmit = async () => {
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }
    setSubmitting(true);
    try {
      const payload = {
        ...formData,
        categoriaId: parseInt(formData.categoriaId),
        numeroEmpleados: parseInt(formData.numeroEmpleados) || 0,
        anioFundacion: formData.anioFundacion ? parseInt(formData.anioFundacion) : null,
      };
      if (modalMode === 'create') {
        await negociosService.create(payload);
        toast.success('Negocio creado exitosamente');
      } else {
        await negociosService.update(selectedNegocio.id, payload);
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

  const negociosFiltrados = negocios.filter(n =>
    n.nombreNegocio?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    n.categoria?.nombre?.toLowerCase().includes(searchTerm.toLowerCase())
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
            Cargando negocios...
          </p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap' }}>
          <div>
            <h1 style={{
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              fontSize: '26px', fontWeight: 800,
              color: 'var(--gray-900)', letterSpacing: '-0.02em', marginBottom: '4px',
            }}>Mis Negocios</h1>
            <p style={{ fontSize: '14px', color: 'var(--gray-500)', fontFamily: "'DM Sans', sans-serif" }}>
              Administra la información de tus negocios
            </p>
          </div>
          <button
            onClick={() => handleOpenModal('create')}
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
            Agregar Negocio
          </button>
        </div>

        {negocios.length > 0 && (
          <div style={{ position: 'relative', maxWidth: '360px' }}>
            <Search style={{
              position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)',
              width: '15px', height: '15px', color: 'var(--gray-400)',
            }} />
            <input
              type="text"
              placeholder="Buscar por nombre o categoría..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              style={{
                ...inputBaseStyle,
                paddingLeft: '38px',
                background: '#fff',
                border: '1px solid var(--border)',
              }}
            />
          </div>
        )}

        {negociosFiltrados.length > 0 ? (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
            gap: '18px',
          }}>
            {negociosFiltrados.map((negocio) => (
              <NegocioCard
                key={negocio.id}
                negocio={negocio}
                onEdit={() => handleOpenModal('edit', negocio)}
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
            alignItems: 'center', textAlign: 'center',
            gap: '12px',
          }}>
            <div style={{
              width: '64px', height: '64px',
              borderRadius: 'var(--radius-lg)',
              background: '#EEF4FF',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              marginBottom: '4px',
            }}>
              <Building2 style={{ width: '28px', height: '28px', color: 'var(--capyme-blue-mid)' }} />
            </div>
            <h3 style={{
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              fontSize: '17px', fontWeight: 700, color: 'var(--gray-900)',
            }}>
              {searchTerm ? 'Sin resultados' : 'No tienes negocios registrados'}
            </h3>
            <p style={{ fontSize: '14px', color: 'var(--gray-400)', fontFamily: "'DM Sans', sans-serif", maxWidth: '360px' }}>
              {searchTerm
                ? 'Intenta con otro término de búsqueda.'
                : 'Comienza agregando tu primer negocio para acceder a programas y beneficios.'}
            </p>
            {!searchTerm && (
              <button
                onClick={() => handleOpenModal('create')}
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
                <Plus style={{ width: '16px', height: '16px' }} />
                Agregar Mi Primer Negocio
              </button>
            )}
          </div>
        )}
      </div>

      {showModal && (
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
              width: '100%', maxWidth: '720px',
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
                  <Building2 style={{ width: '18px', height: '18px', color: 'var(--capyme-blue-mid)' }} />
                </div>
                <h2 style={{
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  fontSize: '18px', fontWeight: 800, color: 'var(--gray-900)',
                }}>
                  {modalMode === 'create' ? 'Agregar Negocio' : 'Editar Negocio'}
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

            <div style={{ overflowY: 'auto', flex: 1, padding: '24px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

                <div>
                  <SectionTitle icon={Building2} text="Información Principal" />
                  <div style={{ marginTop: '12px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <div style={{ gridColumn: '1 / -1' }}>
                      <label style={labelStyle}>Nombre del Negocio <span style={{ color: '#EF4444' }}>*</span></label>
                      <input
                        name="nombreNegocio"
                        type="text"
                        value={formData.nombreNegocio}
                        onChange={handleChange}
                        placeholder="Ej. Panadería La Esperanza"
                        style={{ ...inputBaseStyle, ...(formErrors.nombreNegocio ? inputErrorStyle : {}) }}
                      />
                      {formErrors.nombreNegocio && <ErrorMsg text={formErrors.nombreNegocio} />}
                    </div>
                    <div>
                      <label style={labelStyle}>Categoría <span style={{ color: '#EF4444' }}>*</span></label>
                      <div style={{ position: 'relative' }}>
                        <select
                          name="categoriaId"
                          value={formData.categoriaId}
                          onChange={handleChange}
                          style={{ ...selectStyle, ...(formErrors.categoriaId ? inputErrorStyle : {}) }}
                        >
                          <option value="">Seleccionar categoría</option>
                          {categorias.map(cat => (
                            <option key={cat.id} value={cat.id}>{cat.nombre}</option>
                          ))}
                        </select>
                        <Tag style={{
                          position: 'absolute', right: '12px', top: '50%',
                          transform: 'translateY(-50%)',
                          width: '14px', height: '14px', color: 'var(--gray-400)',
                          pointerEvents: 'none',
                        }} />
                      </div>
                      {formErrors.categoriaId && <ErrorMsg text={formErrors.categoriaId} />}
                    </div>
                    <div>
                      <label style={labelStyle}>RFC</label>
                      <input
                        name="rfc"
                        type="text"
                        value={formData.rfc}
                        onChange={handleChange}
                        placeholder="XAXX010101000"
                        style={{
                          ...inputBaseStyle,
                          fontFamily: "'JetBrains Mono', monospace",
                          textTransform: 'uppercase',
                          ...(formErrors.rfc ? inputErrorStyle : {}),
                        }}
                      />
                      {formErrors.rfc && <ErrorMsg text={formErrors.rfc} />}
                    </div>
                    <div>
                      <label style={labelStyle}>Razón Social</label>
                      <input
                        name="razonSocial"
                        type="text"
                        value={formData.razonSocial}
                        onChange={handleChange}
                        placeholder="Nombre legal de la empresa"
                        style={inputBaseStyle}
                      />
                    </div>
                    <div>
                      <label style={labelStyle}>Giro Comercial</label>
                      <input
                        name="giroComercial"
                        type="text"
                        value={formData.giroComercial}
                        onChange={handleChange}
                        placeholder="Ej. Alimentos y bebidas"
                        style={inputBaseStyle}
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <SectionTitle icon={MapPin} text="Ubicación" />
                  <div style={{ marginTop: '12px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <div style={{ gridColumn: '1 / -1' }}>
                      <label style={labelStyle}>Dirección</label>
                      <input
                        name="direccion"
                        type="text"
                        value={formData.direccion}
                        onChange={handleChange}
                        placeholder="Calle, número, colonia"
                        style={inputBaseStyle}
                      />
                    </div>
                    <div>
                      <label style={labelStyle}>Ciudad</label>
                      <input
                        name="ciudad"
                        type="text"
                        value={formData.ciudad}
                        onChange={handleChange}
                        placeholder="Querétaro"
                        style={inputBaseStyle}
                      />
                    </div>
                    <div>
                      <label style={labelStyle}>Estado</label>
                      <input
                        name="estado"
                        type="text"
                        value={formData.estado}
                        onChange={handleChange}
                        placeholder="Querétaro"
                        style={inputBaseStyle}
                      />
                    </div>
                    <div>
                      <label style={labelStyle}>Código Postal</label>
                      <input
                        name="codigoPostal"
                        type="text"
                        value={formData.codigoPostal}
                        onChange={handleChange}
                        placeholder="76000"
                        style={{ ...inputBaseStyle, fontFamily: "'JetBrains Mono', monospace" }}
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <SectionTitle icon={Phone} text="Contacto" />
                  <div style={{ marginTop: '12px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <div>
                      <label style={labelStyle}>Teléfono</label>
                      <input
                        name="telefonoNegocio"
                        type="tel"
                        value={formData.telefonoNegocio}
                        onChange={handleChange}
                        placeholder="442 000 0000"
                        style={inputBaseStyle}
                      />
                    </div>
                    <div>
                      <label style={labelStyle}>Email</label>
                      <input
                        name="emailNegocio"
                        type="email"
                        value={formData.emailNegocio}
                        onChange={handleChange}
                        placeholder="negocio@ejemplo.com"
                        style={{ ...inputBaseStyle, ...(formErrors.emailNegocio ? inputErrorStyle : {}) }}
                      />
                      {formErrors.emailNegocio && <ErrorMsg text={formErrors.emailNegocio} />}
                    </div>
                  </div>
                </div>

                <div>
                  <SectionTitle icon={Hash} text="Datos Adicionales" />
                  <div style={{ marginTop: '12px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <div>
                      <label style={labelStyle}>Número de Empleados</label>
                      <input
                        name="numeroEmpleados"
                        type="number"
                        min="0"
                        value={formData.numeroEmpleados}
                        onChange={handleChange}
                        style={inputBaseStyle}
                      />
                    </div>
                    <div>
                      <label style={labelStyle}>Año de Fundación</label>
                      <input
                        name="anioFundacion"
                        type="number"
                        min="1900"
                        max={new Date().getFullYear()}
                        value={formData.anioFundacion}
                        onChange={handleChange}
                        placeholder={String(new Date().getFullYear())}
                        style={{ ...inputBaseStyle, fontFamily: "'JetBrains Mono', monospace" }}
                      />
                    </div>
                    <div style={{ gridColumn: '1 / -1' }}>
                      <label style={labelStyle}>Descripción</label>
                      <textarea
                        name="descripcion"
                        rows={3}
                        value={formData.descripcion}
                        onChange={handleChange}
                        placeholder="Describe brevemente tu negocio..."
                        style={{ ...inputBaseStyle, resize: 'vertical', minHeight: '80px' }}
                      />
                    </div>
                  </div>
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
                disabled={submitting}
                style={{
                  padding: '9px 22px',
                  background: submitting ? 'var(--gray-300)' : 'linear-gradient(135deg, var(--capyme-blue-mid), var(--capyme-blue))',
                  border: 'none',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '14px', fontWeight: 600,
                  color: '#fff',
                  cursor: submitting ? 'not-allowed' : 'pointer',
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  boxShadow: submitting ? 'none' : '0 2px 8px rgba(31,78,158,0.28)',
                  transition: 'all 150ms ease',
                }}
              >
                {submitting ? 'Guardando...' : modalMode === 'create' ? 'Crear Negocio' : 'Guardar Cambios'}
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};

const NegocioCard = ({ negocio, onEdit }) => {
  const iniciales = negocio.nombreNegocio
    ?.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase() || '?';

  return (
    <div
      style={{
        background: '#fff',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-lg)',
        boxShadow: 'var(--shadow-sm)',
        overflow: 'hidden',
        transition: 'all 200ms ease',
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
        background: negocio.activo
          ? 'linear-gradient(90deg, var(--capyme-blue-mid), var(--capyme-blue))'
          : 'var(--gray-200)',
      }} />
      <div style={{ padding: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', marginBottom: '14px' }}>
          <div style={{
            width: '44px', height: '44px',
            borderRadius: 'var(--radius-md)',
            background: 'linear-gradient(135deg, var(--capyme-blue-mid), var(--capyme-blue))',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#fff', fontSize: '14px', fontWeight: 700,
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            flexShrink: 0,
          }}>
            {iniciales}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <h3 style={{
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              fontSize: '15px', fontWeight: 700,
              color: 'var(--gray-900)', marginBottom: '4px',
              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            }}>
              {negocio.nombreNegocio}
            </h3>
            <span style={{
              display: 'inline-block',
              padding: '2px 8px',
              background: '#EEF4FF',
              color: 'var(--capyme-blue-mid)',
              borderRadius: '99px',
              fontSize: '11px', fontWeight: 600,
              fontFamily: "'Plus Jakarta Sans', sans-serif",
            }}>
              {negocio.categoria?.nombre}
            </span>
          </div>
          <span style={{
            padding: '3px 8px',
            background: negocio.activo ? '#ECFDF5' : '#FEF2F2',
            color: negocio.activo ? '#065F46' : '#DC2626',
            borderRadius: '99px',
            fontSize: '11px', fontWeight: 700,
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            flexShrink: 0,
          }}>
            {negocio.activo ? 'Activo' : 'Inactivo'}
          </span>
        </div>

        {negocio.descripcion && (
          <p style={{
            fontSize: '13px', color: 'var(--gray-500)',
            fontFamily: "'DM Sans', sans-serif",
            marginBottom: '12px', lineHeight: 1.5,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}>
            {negocio.descripcion}
          </p>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '14px' }}>
          {(negocio.ciudad || negocio.estado) && (
            <InfoRow icon={MapPin} text={[negocio.ciudad, negocio.estado].filter(Boolean).join(', ')} />
          )}
          {negocio.telefonoNegocio && <InfoRow icon={Phone} text={negocio.telefonoNegocio} />}
          {negocio.emailNegocio && <InfoRow icon={Mail} text={negocio.emailNegocio} />}
          {negocio.numeroEmpleados > 0 && (
            <InfoRow icon={Users} text={`${negocio.numeroEmpleados} empleados`} />
          )}
          {negocio.anioFundacion && (
            <InfoRow icon={Calendar} text={`Fundado en ${negocio.anioFundacion}`} />
          )}
          {negocio.rfc && (
            <InfoRow icon={Hash} text={negocio.rfc} mono />
          )}
        </div>

        <div style={{ borderTop: '1px solid var(--border)', paddingTop: '12px' }}>
          <button
            onClick={onEdit}
            style={{
              width: '100%',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
              padding: '8px 0',
              background: '#EEF4FF',
              border: 'none',
              borderRadius: 'var(--radius-md)',
              color: 'var(--capyme-blue-mid)',
              fontSize: '13px', fontWeight: 600,
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              cursor: 'pointer',
              transition: 'all 150ms ease',
            }}
            onMouseEnter={e => e.currentTarget.style.background = '#DDEAFF'}
            onMouseLeave={e => e.currentTarget.style.background = '#EEF4FF'}
          >
            <Edit style={{ width: '14px', height: '14px' }} />
            Editar Negocio
          </button>
        </div>
      </div>
    </div>
  );
};

const InfoRow = ({ icon: Icon, text, mono }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
    <Icon style={{ width: '13px', height: '13px', color: 'var(--gray-400)', flexShrink: 0 }} />
    <span style={{
      fontSize: '12px', color: 'var(--gray-600)',
      fontFamily: mono ? "'JetBrains Mono', monospace" : "'DM Sans', sans-serif",
      overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
    }}>
      {text}
    </span>
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

export default MisNegocios;