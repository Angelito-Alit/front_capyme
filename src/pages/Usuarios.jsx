import { useState, useEffect } from 'react';
import Layout from '../components/common/Layout';
import { usuariosService } from '../services/usuariosService';
import {
  Users,
  Plus,
  Search,
  Edit,
  Trash2,
  X,
  Phone,
  Mail,
  ChevronDown,
  AlertCircle,
  CheckCircle,
  Eye,
  EyeOff,
  Shield,
  User
} from 'lucide-react';
import { toast } from 'react-hot-toast';

const initialFormData = {
  nombre: '',
  apellido: '',
  email: '',
  password: '',
  telefono: '',
  rol: 'cliente',
  activo: true
};

const Usuarios = () => {
  const authStorage = JSON.parse(localStorage.getItem('auth-storage') || '{}');
  const currentUser = authStorage?.state?.user || {};

  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('create');
  const [selectedUsuario, setSelectedUsuario] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRol, setFilterRol] = useState('');
  const [filterEstado, setFilterEstado] = useState('');
  const [formData, setFormData] = useState(initialFormData);
  const [formErrors, setFormErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    cargarUsuarios();
  }, [filterRol, filterEstado]);

  const cargarUsuarios = async () => {
    try {
      setLoading(true);
      const params = {};
      if (filterRol) params.rol = filterRol;
      if (filterEstado !== '') params.activo = filterEstado;
      const res = await usuariosService.getAll(params);
      setUsuarios(res.data || []);
    } catch (error) {
      toast.error('Error al cargar usuarios');
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.nombre.trim()) errors.nombre = 'El nombre es requerido';
    if (!formData.apellido.trim()) errors.apellido = 'El apellido es requerido';
    if (!formData.email.trim()) errors.email = 'El email es requerido';
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Email no válido';
    }
    if (modalMode === 'create' && !formData.password) {
      errors.password = 'La contraseña es requerida';
    }
    if (formData.password && formData.password.length < 6) {
      errors.password = 'Mínimo 6 caracteres';
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleOpenModal = (mode, usuario = null) => {
    setModalMode(mode);
    setSelectedUsuario(usuario);
    setFormErrors({});
    setShowPassword(false);
    if (mode === 'edit' && usuario) {
      setFormData({
        nombre: usuario.nombre || '',
        apellido: usuario.apellido || '',
        email: usuario.email || '',
        password: '',
        telefono: usuario.telefono || '',
        rol: usuario.rol || 'cliente',
        activo: usuario.activo ?? true
      });
    } else {
      setFormData({ ...initialFormData });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedUsuario(null);
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
      const dataToSend = { ...formData };
      if (modalMode === 'edit' && !dataToSend.password) {
        delete dataToSend.password;
      }
      if (modalMode === 'create') {
        await usuariosService.create(dataToSend);
        toast.success('Usuario creado exitosamente');
      } else {
        await usuariosService.update(selectedUsuario.id, dataToSend);
        toast.success('Usuario actualizado exitosamente');
      }
      handleCloseModal();
      cargarUsuarios();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error al guardar usuario');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleActivo = async (usuario) => {
    const accion = usuario.activo ? 'desactivar' : 'activar';
    if (window.confirm(`¿Estás seguro de ${accion} al usuario "${usuario.nombre} ${usuario.apellido}"?`)) {
      try {
        await usuariosService.update(usuario.id, { ...usuario, activo: !usuario.activo });
        toast.success(`Usuario ${usuario.activo ? 'desactivado' : 'activado'} exitosamente`);
        cargarUsuarios();
      } catch (error) {
        toast.error('Error al cambiar estado del usuario');
      }
    }
  };

  const getRolColor = (rol) => {
    const map = {
      admin: { bg: '#FEF2F2', color: '#DC2626' },
      colaborador: { bg: 'var(--capyme-blue-pale)', color: 'var(--capyme-blue-mid)' },
      cliente: { bg: '#F0FDF4', color: '#16A34A' }
    };
    return map[rol] || { bg: 'var(--gray-100)', color: 'var(--gray-500)' };
  };

  const getRolName = (rol) => {
    const map = { admin: 'Administrador', colaborador: 'Colaborador', cliente: 'Cliente' };
    return map[rol] || rol;
  };

  const usuariosFiltrados = usuarios.filter(u =>
    u.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.apellido?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email?.toLowerCase().includes(searchTerm.toLowerCase())
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

  const inputWithIconStyle = { ...inputBaseStyle, paddingLeft: '38px' };
  const inputErrorStyle = { borderColor: '#EF4444', boxShadow: '0 0 0 2px rgba(239,68,68,0.15)' };

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
            Cargando usuarios...
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
              <Users style={{ width: '28px', height: '28px', color: 'var(--capyme-blue-mid)' }} />
              Gestión de Usuarios
            </h1>
            <p style={{ fontSize: '14px', color: 'var(--gray-500)', fontFamily: "'DM Sans', sans-serif" }}>
              {usuariosFiltrados.length} usuario{usuariosFiltrados.length !== 1 ? 's' : ''} registrado{usuariosFiltrados.length !== 1 ? 's' : ''}
            </p>
          </div>
          <button
            onClick={() => handleOpenModal('create')}
            style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              padding: '10px 20px',
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
            Nuevo Usuario
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
                placeholder="Buscar por nombre, apellido o email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={inputWithIconStyle}
                onFocus={e => { e.target.style.borderColor = 'var(--capyme-blue-mid)'; e.target.style.boxShadow = '0 0 0 3px rgba(43,91,166,0.12)'; }}
                onBlur={e => { e.target.style.borderColor = 'var(--border)'; e.target.style.boxShadow = 'none'; }}
              />
            </div>
            <div style={{ position: 'relative' }}>
              <select value={filterRol} onChange={(e) => setFilterRol(e.target.value)} style={selectStyle}>
                <option value="">Todos los roles</option>
                <option value="admin">Administrador</option>
                <option value="colaborador">Colaborador</option>
                <option value="cliente">Cliente</option>
              </select>
              <ChevronDown style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', width: '16px', height: '16px', color: 'var(--gray-400)', pointerEvents: 'none' }} />
            </div>
            <div style={{ position: 'relative' }}>
              <select value={filterEstado} onChange={(e) => setFilterEstado(e.target.value)} style={selectStyle}>
                <option value="">Todos los estados</option>
                <option value="true">Activos</option>
                <option value="false">Inactivos</option>
              </select>
              <ChevronDown style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', width: '16px', height: '16px', color: 'var(--gray-400)', pointerEvents: 'none' }} />
            </div>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: 'var(--gray-50)' }}>
                  {['Usuario', 'Contacto', 'Rol', 'Estado', 'Registro', 'Acciones'].map((h, i) => (
                    <th key={h} style={{
                      padding: '14px 24px',
                      textAlign: i === 5 ? 'right' : i === 3 ? 'center' : 'left',
                      fontSize: '11px', fontWeight: 700,
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
                {usuariosFiltrados.length > 0 ? (
                  usuariosFiltrados.map((usuario) => {
                    const rolStyle = getRolColor(usuario.rol);
                    return (
                      <tr
                        key={usuario.id}
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
                              color: '#fff', fontSize: '13px', fontWeight: 700,
                              fontFamily: "'Plus Jakarta Sans', sans-serif",
                              flexShrink: 0,
                            }}>
                              {usuario.nombre?.charAt(0)?.toUpperCase()}{usuario.apellido?.charAt(0)?.toUpperCase()}
                            </div>
                            <p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--gray-800)', fontFamily: "'DM Sans', sans-serif" }}>
                              {usuario.nombre} {usuario.apellido}
                            </p>
                          </div>
                        </td>
                        <td style={{ padding: '14px 24px' }}>
                          <p style={{ fontSize: '13px', color: 'var(--gray-700)', display: 'flex', alignItems: 'center', gap: '5px' }}>
                            <Mail style={{ width: '12px', height: '12px', color: 'var(--gray-400)' }} />
                            {usuario.email}
                          </p>
                          {usuario.telefono && (
                            <p style={{ fontSize: '12px', color: 'var(--gray-400)', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                              <Phone style={{ width: '11px', height: '11px' }} />
                              {usuario.telefono}
                            </p>
                          )}
                        </td>
                        <td style={{ padding: '14px 24px' }}>
                          <span style={{
                            display: 'inline-block',
                            padding: '3px 10px',
                            background: rolStyle.bg,
                            color: rolStyle.color,
                            borderRadius: 'var(--radius-sm)',
                            fontSize: '11px', fontWeight: 700,
                            fontFamily: "'Plus Jakarta Sans', sans-serif",
                          }}>
                            {getRolName(usuario.rol)}
                          </span>
                        </td>
                        <td style={{ padding: '14px 24px', textAlign: 'center' }}>
                          <span style={{
                            display: 'inline-block',
                            padding: '3px 10px',
                            background: usuario.activo ? '#ECFDF5' : '#FEF2F2',
                            color: usuario.activo ? '#065F46' : '#DC2626',
                            borderRadius: '99px',
                            fontSize: '11px', fontWeight: 700,
                            fontFamily: "'Plus Jakarta Sans', sans-serif",
                            textTransform: 'uppercase',
                            letterSpacing: '0.04em',
                          }}>
                            {usuario.activo ? 'Activo' : 'Inactivo'}
                          </span>
                        </td>
                        <td style={{ padding: '14px 24px' }}>
                          <p style={{ fontSize: '12px', color: 'var(--gray-400)', fontFamily: "'DM Sans', sans-serif" }}>
                            {new Date(usuario.fechaRegistro).toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' })}
                          </p>
                        </td>
                        <td style={{ padding: '14px 24px', textAlign: 'right' }}>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '4px' }}>
                            {(currentUser.rol === 'admin' || usuario.rol !== 'admin') ? (
                              <button
                                onClick={() => handleOpenModal('edit', usuario)}
                                title="Editar"
                                style={{
                                  width: '34px', height: '34px',
                                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                                  border: 'none', borderRadius: 'var(--radius-sm)',
                                  background: 'transparent', cursor: 'pointer',
                                  color: 'var(--gray-400)', transition: 'all 150ms ease',
                                }}
                                onMouseEnter={e => { e.currentTarget.style.background = '#EEF4FF'; e.currentTarget.style.color = 'var(--capyme-blue-mid)'; }}
                                onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--gray-400)'; }}
                              >
                                <Edit style={{ width: '16px', height: '16px' }} />
                              </button>
                            ) : (
                              <div
                                title="Sin permisos para editar administradores"
                                style={{
                                  width: '34px', height: '34px',
                                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                                  borderRadius: 'var(--radius-sm)',
                                  color: 'var(--gray-200)',
                                  cursor: 'not-allowed',
                                }}
                              >
                                <Shield style={{ width: '16px', height: '16px' }} />
                              </div>
                            )}

                            {currentUser.rol === 'admin' && !usuario.activo && (
                              <button
                                onClick={() => handleToggleActivo(usuario)}
                                title="Activar usuario"
                                style={{
                                  width: '34px', height: '34px',
                                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                                  border: 'none', borderRadius: 'var(--radius-sm)',
                                  background: 'transparent', cursor: 'pointer',
                                  color: 'var(--gray-400)', transition: 'all 150ms ease',
                                }}
                                onMouseEnter={e => { e.currentTarget.style.background = '#ECFDF5'; e.currentTarget.style.color = '#065F46'; }}
                                onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--gray-400)'; }}
                              >
                                <CheckCircle style={{ width: '16px', height: '16px' }} />
                              </button>
                            )}

                            {currentUser.rol === 'admin' && usuario.activo && (
                              <button
                                onClick={() => handleToggleActivo(usuario)}
                                title="Desactivar usuario"
                                style={{
                                  width: '34px', height: '34px',
                                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                                  border: 'none', borderRadius: 'var(--radius-sm)',
                                  background: 'transparent', cursor: 'pointer',
                                  color: 'var(--gray-400)', transition: 'all 150ms ease',
                                }}
                                onMouseEnter={e => { e.currentTarget.style.background = '#FEF2F2'; e.currentTarget.style.color = '#DC2626'; }}
                                onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--gray-400)'; }}
                              >
                                <Trash2 style={{ width: '16px', height: '16px' }} />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="6" style={{ padding: '60px 24px', textAlign: 'center' }}>
                      <Users style={{ width: '40px', height: '40px', color: 'var(--gray-200)', margin: '0 auto 12px' }} />
                      <p style={{ fontSize: '14px', color: 'var(--gray-400)', fontWeight: 500 }}>No se encontraron usuarios</p>
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
              maxWidth: '600px', width: '100%',
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
                  {modalMode === 'create' ? 'Nuevo Usuario' : 'Editar Usuario'}
                </h2>
                <p style={{ fontSize: '13px', color: 'var(--gray-400)', marginTop: '2px', fontFamily: "'DM Sans', sans-serif" }}>
                  {modalMode === 'create' ? 'Registra un nuevo usuario en el sistema' : `Editando: ${selectedUsuario?.nombre} ${selectedUsuario?.apellido}`}
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

                <SectionTitle icon={User} text="Información Personal" />
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div>
                    <label style={labelStyle}>Nombre *</label>
                    <div style={{ position: 'relative' }}>
                      <User style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', width: '16px', height: '16px', color: 'var(--gray-400)', pointerEvents: 'none' }} />
                      <input
                        type="text" value={formData.nombre}
                        onChange={(e) => handleChange('nombre', e.target.value)}
                        placeholder="Nombre"
                        style={{ ...inputWithIconStyle, ...(formErrors.nombre ? inputErrorStyle : {}) }}
                        onFocus={e => { if (!formErrors.nombre) { e.target.style.borderColor = 'var(--capyme-blue-mid)'; e.target.style.boxShadow = '0 0 0 3px rgba(43,91,166,0.12)'; } }}
                        onBlur={e => { if (!formErrors.nombre) { e.target.style.borderColor = 'var(--border)'; e.target.style.boxShadow = 'none'; } }}
                      />
                    </div>
                    {formErrors.nombre && <ErrorMsg text={formErrors.nombre} />}
                  </div>
                  <div>
                    <label style={labelStyle}>Apellido *</label>
                    <input
                      type="text" value={formData.apellido}
                      onChange={(e) => handleChange('apellido', e.target.value)}
                      placeholder="Apellido"
                      style={{ ...inputBaseStyle, ...(formErrors.apellido ? inputErrorStyle : {}) }}
                      onFocus={e => { if (!formErrors.apellido) { e.target.style.borderColor = 'var(--capyme-blue-mid)'; e.target.style.boxShadow = '0 0 0 3px rgba(43,91,166,0.12)'; } }}
                      onBlur={e => { if (!formErrors.apellido) { e.target.style.borderColor = 'var(--border)'; e.target.style.boxShadow = 'none'; } }}
                    />
                    {formErrors.apellido && <ErrorMsg text={formErrors.apellido} />}
                  </div>

                  <div style={{ gridColumn: '1 / -1' }}>
                    <label style={labelStyle}>Email *</label>
                    <div style={{ position: 'relative' }}>
                      <Mail style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', width: '16px', height: '16px', color: 'var(--gray-400)', pointerEvents: 'none' }} />
                      <input
                        type="email" value={formData.email}
                        onChange={(e) => handleChange('email', e.target.value)}
                        placeholder="correo@ejemplo.com"
                        style={{ ...inputWithIconStyle, ...(formErrors.email ? inputErrorStyle : {}) }}
                        onFocus={e => { if (!formErrors.email) { e.target.style.borderColor = 'var(--capyme-blue-mid)'; e.target.style.boxShadow = '0 0 0 3px rgba(43,91,166,0.12)'; } }}
                        onBlur={e => { if (!formErrors.email) { e.target.style.borderColor = 'var(--border)'; e.target.style.boxShadow = 'none'; } }}
                      />
                    </div>
                    {formErrors.email && <ErrorMsg text={formErrors.email} />}
                  </div>

                  <div style={{ gridColumn: '1 / -1' }}>
                    <label style={labelStyle}>Teléfono</label>
                    <div style={{ position: 'relative' }}>
                      <Phone style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', width: '16px', height: '16px', color: 'var(--gray-400)', pointerEvents: 'none' }} />
                      <input
                        type="tel" value={formData.telefono}
                        onChange={(e) => handleChange('telefono', e.target.value)}
                        placeholder="442 123 4567"
                        style={inputWithIconStyle}
                        onFocus={e => { e.target.style.borderColor = 'var(--capyme-blue-mid)'; e.target.style.boxShadow = '0 0 0 3px rgba(43,91,166,0.12)'; }}
                        onBlur={e => { e.target.style.borderColor = 'var(--border)'; e.target.style.boxShadow = 'none'; }}
                      />
                    </div>
                  </div>
                </div>

                <SectionTitle icon={Shield} text="Acceso y Permisos" />
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div style={{ gridColumn: '1 / -1' }}>
                    <label style={labelStyle}>
                      Contraseña {modalMode === 'edit' && <span style={{ fontWeight: 400, color: 'var(--gray-400)' }}>(dejar vacío para no cambiar)</span>}
                      {modalMode === 'create' && ' *'}
                    </label>
                    <div style={{ position: 'relative' }}>
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={formData.password}
                        onChange={(e) => handleChange('password', e.target.value)}
                        placeholder={modalMode === 'create' ? 'Mínimo 6 caracteres' : '••••••••'}
                        style={{ ...inputBaseStyle, paddingRight: '42px', ...(formErrors.password ? inputErrorStyle : {}) }}
                        onFocus={e => { if (!formErrors.password) { e.target.style.borderColor = 'var(--capyme-blue-mid)'; e.target.style.boxShadow = '0 0 0 3px rgba(43,91,166,0.12)'; } }}
                        onBlur={e => { if (!formErrors.password) { e.target.style.borderColor = 'var(--border)'; e.target.style.boxShadow = 'none'; } }}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        style={{
                          position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)',
                          background: 'none', border: 'none', cursor: 'pointer',
                          color: 'var(--gray-400)', padding: '0', display: 'flex',
                        }}
                      >
                        {showPassword ? <EyeOff style={{ width: '16px', height: '16px' }} /> : <Eye style={{ width: '16px', height: '16px' }} />}
                      </button>
                    </div>
                    {formErrors.password && <ErrorMsg text={formErrors.password} />}
                  </div>

                  <div>
                    <label style={labelStyle}>Rol *</label>
                    <div style={{ position: 'relative' }}>
                      <select value={formData.rol} onChange={(e) => handleChange('rol', e.target.value)} style={selectStyle}>
                        <option value="cliente">Cliente</option>
                        <option value="colaborador">Colaborador</option>
                        {currentUser.rol === 'admin' && (
                          <option value="admin">Administrador</option>
                        )}
                      </select>
                      <ChevronDown style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', width: '16px', height: '16px', color: 'var(--gray-400)', pointerEvents: 'none' }} />
                    </div>
                    {currentUser.rol === 'colaborador' && (
                      <p style={{ marginTop: '5px', fontSize: '11px', color: 'var(--gray-400)', fontFamily: "'DM Sans', sans-serif", display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Shield style={{ width: '11px', height: '11px' }} />
                        Solo un administrador puede asignar el rol Admin
                      </p>
                    )}
                  </div>

                  <div>
                    <label style={labelStyle}>Estado</label>
                    <div style={{ position: 'relative' }}>
                      <select value={formData.activo.toString()} onChange={(e) => handleChange('activo', e.target.value === 'true')} style={selectStyle}>
                        <option value="true">Activo</option>
                        <option value="false">Inactivo</option>
                      </select>
                      <ChevronDown style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', width: '16px', height: '16px', color: 'var(--gray-400)', pointerEvents: 'none' }} />
                    </div>
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
                {modalMode === 'create' ? 'Crear Usuario' : 'Guardar Cambios'}
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};

const SectionTitle = ({ icon: Icon, text }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', paddingBottom: '4px' }}>
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

export default Usuarios;