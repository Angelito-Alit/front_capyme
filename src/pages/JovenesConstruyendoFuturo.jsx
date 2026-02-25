import { useState, useEffect, useMemo } from 'react';
import { toast } from 'react-hot-toast';
import {
  Users, Plus, Search, Edit, CheckCircle, Trash2,
  AlertCircle, X, FolderOpen, Link, UserCheck, MapPin,
  Calendar, Phone, Mail, Building2, ExternalLink,
  ChevronDown, SlidersHorizontal, User
} from 'lucide-react';
import Layout from '../components/common/Layout';
import { jcfService } from '../services/jcfService';

const initialFormData = {
  nombre: '',
  apellido: '',
  correo: '',
  telefono: '',
  curp: '',
  municipio: '',
  fechaInicio: '',
  fechaTermino: '',
  clienteId: '',
  negocioId: '',
};

const JovenesConstruyendoFuturo = () => {
  const authStorage = JSON.parse(localStorage.getItem('auth-storage') || '{}');
  const currentUser = authStorage?.state?.user || {};

  const [items, setItems] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [negocios, setNegocios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('create');
  const [selectedItem, setSelectedItem] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState(initialFormData);
  const [formErrors, setFormErrors] = useState({});
  const [showRecursoModal, setShowRecursoModal] = useState(false);
  const [recursoItem, setRecursoItem] = useState(null);
  const [recursoUrl, setRecursoUrl] = useState('');
  const [submittingRecurso, setSubmittingRecurso] = useState(false);
  const [hoveredRow, setHoveredRow] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [filterEstado, setFilterEstado] = useState('');
  const [filterMunicipio, setFilterMunicipio] = useState('');
  const [filterCliente, setFilterCliente] = useState('');
  const [filterNegocio, setFilterNegocio] = useState('');

  const inputBaseStyle = {
    width: '100%', padding: '10px 12px',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius-md)',
    fontSize: '14px', fontFamily: "'DM Sans', sans-serif",
    color: 'var(--gray-900)', background: '#fff',
    outline: 'none', transition: 'all 200ms ease',
    boxSizing: 'border-box',
  };
  const inputErrorStyle = {
    borderColor: '#EF4444',
    boxShadow: '0 0 0 2px rgba(239,68,68,0.15)'
  };
  const labelStyle = {
    display: 'block', fontSize: '13px', fontWeight: 600,
    color: 'var(--gray-600)', marginBottom: '6px',
    fontFamily: "'DM Sans', sans-serif",
  };
  const selectStyle = {
    ...inputBaseStyle,
    appearance: 'none',
    paddingRight: '36px',
    cursor: 'pointer',
  };
  const selectDisabledStyle = {
    ...inputBaseStyle,
    appearance: 'none',
    paddingRight: '36px',
    background: 'var(--gray-50)',
    color: 'var(--gray-400)',
    cursor: 'not-allowed',
  };

  useEffect(() => {
    cargarDatos();
    cargarClientes();
    cargarNegocios();
  }, []);

  const cargarDatos = async () => {
    try {
      setLoading(true);
      const res = await jcfService.getAll();
      setItems(res.data || []);
    } catch {
      toast.error('Error al cargar los datos');
    } finally {
      setLoading(false);
    }
  };

  const cargarClientes = async () => {
    try {
      const res = await jcfService.getClientes();
      setClientes(res.data || []);
    } catch {}
  };

  const cargarNegocios = async () => {
    try {
      const res = await jcfService.getNegocios();
      setNegocios(res.data || []);
    } catch {}
  };

  const negociosFiltradosPorCliente = useMemo(() => {
    if (!formData.clienteId) return [];
    return negocios.filter(n => String(n.usuarioId) === String(formData.clienteId));
  }, [formData.clienteId, negocios]);

  const municipiosUnicos = useMemo(() => {
    const set = new Set(items.map(i => i.municipio).filter(Boolean));
    return [...set].sort();
  }, [items]);

  const clientesFiltro = useMemo(() => {
    const map = new Map();
    items.forEach(item => {
      if (item.negocio?.usuario && !map.has(item.negocio.usuario.id)) {
        map.set(item.negocio.usuario.id, item.negocio.usuario);
      }
    });
    return [...map.values()].sort((a, b) =>
      `${a.nombre} ${a.apellido}`.localeCompare(`${b.nombre} ${b.apellido}`)
    );
  }, [items]);

  const negociosFiltro = useMemo(() => {
    const map = new Map();
    items.forEach(item => {
      if (item.negocio && !map.has(item.negocio.id)) {
        map.set(item.negocio.id, item.negocio);
      }
    });
    const lista = [...map.values()];
    if (filterCliente) {
      return lista
        .filter(n => String(n.usuarioId) === String(filterCliente))
        .sort((a, b) => a.nombreNegocio.localeCompare(b.nombreNegocio));
    }
    return lista.sort((a, b) => a.nombreNegocio.localeCompare(b.nombreNegocio));
  }, [items, filterCliente]);

  const activeFiltersCount = [filterEstado, filterMunicipio, filterCliente, filterNegocio].filter(Boolean).length;

  const clearFilters = () => {
    setFilterEstado('');
    setFilterMunicipio('');
    setFilterCliente('');
    setFilterNegocio('');
  };

  const filtered = useMemo(() => {
    return items.filter(item => {
      const term = searchTerm.toLowerCase();
      const matchSearch = (
        item.nombre?.toLowerCase().includes(term) ||
        item.apellido?.toLowerCase().includes(term) ||
        item.curp?.toLowerCase().includes(term) ||
        item.correo?.toLowerCase().includes(term) ||
        item.municipio?.toLowerCase().includes(term) ||
        item.negocio?.nombreNegocio?.toLowerCase().includes(term) ||
        `${item.negocio?.usuario?.nombre} ${item.negocio?.usuario?.apellido}`.toLowerCase().includes(term)
      );
      const matchEstado = !filterEstado || (filterEstado === 'activo' ? item.activo : !item.activo);
      const matchMunicipio = !filterMunicipio || item.municipio === filterMunicipio;
      const matchCliente = !filterCliente || String(item.negocio?.usuarioId) === String(filterCliente);
      const matchNegocio = !filterNegocio || String(item.negocioId) === String(filterNegocio);
      return matchSearch && matchEstado && matchMunicipio && matchCliente && matchNegocio;
    });
  }, [items, searchTerm, filterEstado, filterMunicipio, filterCliente, filterNegocio]);

  const validateForm = () => {
    const errors = {};
    if (!formData.clienteId) errors.clienteId = 'Selecciona un cliente';
    if (!formData.negocioId) errors.negocioId = 'Selecciona un negocio';
    if (!formData.nombre.trim()) errors.nombre = 'El nombre es requerido';
    if (!formData.apellido.trim()) errors.apellido = 'El apellido es requerido';
    if (formData.correo && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.correo)) {
      errors.correo = 'El correo no es válido';
    }
    if (formData.curp && formData.curp.length !== 18) {
      errors.curp = 'La CURP debe tener exactamente 18 caracteres';
    }
    if (formData.telefono && !/^\d{10}$/.test(formData.telefono.replace(/\s/g, ''))) {
      errors.telefono = 'El teléfono debe tener 10 dígitos';
    }
    if (formData.fechaInicio && formData.fechaTermino && formData.fechaInicio > formData.fechaTermino) {
      errors.fechaTermino = 'La fecha de término debe ser posterior a la de inicio';
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleOpenModal = (mode, item = null) => {
    setModalMode(mode);
    setSelectedItem(item);
    setFormErrors({});
    if (mode === 'edit' && item) {
      const clienteId = item.negocio?.usuarioId ? String(item.negocio.usuarioId) : '';
      setFormData({
        nombre: item.nombre || '',
        apellido: item.apellido || '',
        correo: item.correo || '',
        telefono: item.telefono || '',
        curp: item.curp || '',
        municipio: item.municipio || '',
        fechaInicio: item.fechaInicio ? item.fechaInicio.split('T')[0] : '',
        fechaTermino: item.fechaTermino ? item.fechaTermino.split('T')[0] : '',
        clienteId,
        negocioId: item.negocioId ? String(item.negocioId) : '',
      });
    } else {
      setFormData(initialFormData);
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedItem(null);
    setFormData(initialFormData);
    setFormErrors({});
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'clienteId') {
      setFormData(prev => ({ ...prev, clienteId: value, negocioId: '' }));
      if (formErrors.clienteId) setFormErrors(prev => ({ ...prev, clienteId: '' }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
      if (formErrors[name]) setFormErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    setSubmitting(true);
    try {
      const { clienteId, ...rest } = formData;
      const payload = { ...rest };
      payload.negocioId = parseInt(payload.negocioId);
      if (!payload.correo) delete payload.correo;
      if (!payload.telefono) delete payload.telefono;
      if (!payload.curp) delete payload.curp;
      if (!payload.municipio) delete payload.municipio;
      if (!payload.fechaInicio) delete payload.fechaInicio;
      if (!payload.fechaTermino) delete payload.fechaTermino;

      if (modalMode === 'create') {
        await jcfService.create(payload);
        toast.success('Beneficiario registrado exitosamente');
      } else {
        await jcfService.update(selectedItem.id, payload);
        toast.success('Registro actualizado exitosamente');
      }
      handleCloseModal();
      cargarDatos();
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Error al guardar');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleActivo = async (item) => {
    if (currentUser.rol !== 'admin') return;
    const accion = item.activo ? 'desactivar' : 'activar';
    if (!window.confirm(`¿Estás seguro de ${accion} a "${item.nombre} ${item.apellido}"?`)) return;
    try {
      await jcfService.toggleActivo(item.id);
      toast.success(`${item.activo ? 'Desactivado' : 'Activado'} exitosamente`);
      cargarDatos();
    } catch {
      toast.error('Error al cambiar estado');
    }
  };

  const handleOpenRecurso = (item) => {
    setRecursoItem(item);
    setRecursoUrl(item.urlRecurso || '');
    setShowRecursoModal(true);
  };

  const handleCloseRecurso = () => {
    setShowRecursoModal(false);
    setRecursoItem(null);
    setRecursoUrl('');
  };

  const handleGuardarRecurso = async () => {
    setSubmittingRecurso(true);
    try {
      await jcfService.updateRecurso(recursoItem.id, { urlRecurso: recursoUrl });
      toast.success('Recurso actualizado exitosamente');
      handleCloseRecurso();
      cargarDatos();
    } catch {
      toast.error('Error al actualizar recurso');
    } finally {
      setSubmittingRecurso(false);
    }
  };

  const getInitials = (nombre, apellido) =>
    `${(nombre || '')[0] || ''}${(apellido || '')[0] || ''}`.toUpperCase();

  const formatFecha = (dateStr) => {
    if (!dateStr) return '—';
    const d = new Date(dateStr);
    return d.toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  const DropArrow = () => (
    <svg
      style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', width: '14px', height: '14px', color: 'var(--gray-400)' }}
      fill="none" stroke="currentColor" viewBox="0 0 24 24"
    >
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
    </svg>
  );

  const SmallDropArrow = () => (
    <svg
      style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', width: '12px', height: '12px', color: 'var(--gray-400)' }}
      fill="none" stroke="currentColor" viewBox="0 0 24 24"
    >
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
    </svg>
  );

  if (loading) {
    return (
      <Layout>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
          <div style={{
            width: '40px', height: '40px', borderRadius: '50%',
            border: '3px solid var(--gray-200)', borderTopColor: 'var(--capyme-blue-mid)',
            animation: 'spin 0.8s linear infinite'
          }} />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes modalIn { from { opacity: 0; transform: scale(0.96) translateY(12px); } to { opacity: 1; transform: scale(1) translateY(0); } }
        @keyframes filtersIn { from { opacity: 0; transform: translateY(-6px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>

      <div style={{ padding: '28px 32px', animation: 'fadeIn 250ms ease' }}>

        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '28px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{
              width: '48px', height: '48px', borderRadius: 'var(--radius-md)',
              background: 'linear-gradient(135deg, var(--capyme-blue-mid), var(--capyme-blue))',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(31,78,158,0.25)'
            }}>
              <UserCheck style={{ width: '24px', height: '24px', color: '#fff' }} />
            </div>
            <div>
              <h1 style={{
                margin: 0, fontSize: '22px', fontWeight: 800,
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                color: 'var(--gray-900)', lineHeight: 1.2
              }}>
                Jóvenes Construyendo el Futuro
              </h1>
              <p style={{
                margin: '4px 0 0', fontSize: '13px',
                color: 'var(--gray-500)', fontFamily: "'DM Sans', sans-serif"
              }}>
                {filtered.length} {filtered.length === 1 ? 'beneficiario' : 'beneficiarios'}
                {items.length !== filtered.length && ` de ${items.length}`}
              </p>
            </div>
          </div>

          {currentUser.rol !== 'cliente' && (
            <button
              onClick={() => handleOpenModal('create')}
              style={{
                display: 'flex', alignItems: 'center', gap: '8px',
                padding: '10px 20px', border: 'none', borderRadius: 'var(--radius-md)',
                background: 'linear-gradient(135deg, var(--capyme-blue-mid), var(--capyme-blue))',
                color: '#fff', fontSize: '14px', fontWeight: 600,
                fontFamily: "'DM Sans', sans-serif",
                cursor: 'pointer', transition: 'all 200ms ease',
                boxShadow: '0 2px 8px rgba(31,78,158,0.28)'
              }}
              onMouseEnter={e => { e.currentTarget.style.opacity = '0.9'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
              onMouseLeave={e => { e.currentTarget.style.opacity = '1'; e.currentTarget.style.transform = 'translateY(0)'; }}
            >
              <Plus style={{ width: '16px', height: '16px' }} />
              Nuevo Beneficiario
            </button>
          )}
        </div>

        <div style={{
          background: '#fff', borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--border)', padding: '16px 20px',
          marginBottom: '20px', boxShadow: 'var(--shadow-sm)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
            <div style={{ position: 'relative', flex: 1, minWidth: '260px', maxWidth: '420px' }}>
              <Search style={{
                position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)',
                width: '16px', height: '16px', color: 'var(--gray-400)', pointerEvents: 'none'
              }} />
              <input
                type="text"
                placeholder="Buscar por nombre, CURP, correo, municipio, cliente o negocio..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                style={{ ...inputBaseStyle, paddingLeft: '38px' }}
              />
            </div>

            <button
              onClick={() => setShowFilters(v => !v)}
              style={{
                display: 'flex', alignItems: 'center', gap: '7px',
                padding: '10px 16px', border: '1px solid',
                borderColor: showFilters || activeFiltersCount > 0 ? '#BFDBFE' : 'var(--border)',
                borderRadius: 'var(--radius-md)',
                background: showFilters || activeFiltersCount > 0 ? '#EEF4FF' : '#fff',
                color: showFilters || activeFiltersCount > 0 ? 'var(--capyme-blue-mid)' : 'var(--gray-600)',
                fontSize: '13px', fontWeight: 600,
                fontFamily: "'DM Sans', sans-serif",
                cursor: 'pointer', transition: 'all 150ms ease', whiteSpace: 'nowrap'
              }}
            >
              <SlidersHorizontal style={{ width: '15px', height: '15px' }} />
              Filtros
              {activeFiltersCount > 0 && (
                <span style={{
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                  width: '18px', height: '18px', borderRadius: '50%',
                  background: 'var(--capyme-blue-mid)', color: '#fff',
                  fontSize: '10px', fontWeight: 700
                }}>
                  {activeFiltersCount}
                </span>
              )}
              <ChevronDown style={{
                width: '13px', height: '13px',
                transform: showFilters ? 'rotate(180deg)' : 'rotate(0deg)',
                transition: 'transform 200ms ease'
              }} />
            </button>

            {activeFiltersCount > 0 && (
              <button
                onClick={clearFilters}
                style={{
                  display: 'flex', alignItems: 'center', gap: '5px',
                  padding: '10px 14px', border: '1px solid #FEE2E2',
                  borderRadius: 'var(--radius-md)', background: '#FEF2F2',
                  color: '#DC2626', fontSize: '13px', fontWeight: 600,
                  fontFamily: "'DM Sans', sans-serif", cursor: 'pointer',
                  transition: 'all 150ms ease', whiteSpace: 'nowrap'
                }}
              >
                <X style={{ width: '13px', height: '13px' }} />
                Limpiar filtros
              </button>
            )}
          </div>

          {showFilters && (
            <div style={{
              marginTop: '16px', paddingTop: '16px',
              borderTop: '1px solid var(--border)',
              display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '14px',
              animation: 'filtersIn 200ms ease'
            }}>
              <div>
                <label style={{ ...labelStyle, fontSize: '12px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <User style={{ width: '11px', height: '11px' }} />
                  Cliente
                </label>
                <div style={{ position: 'relative' }}>
                  <select
                    value={filterCliente}
                    onChange={e => { setFilterCliente(e.target.value); setFilterNegocio(''); }}
                    style={{ ...selectStyle, fontSize: '13px', padding: '8px 30px 8px 10px' }}
                  >
                    <option value="">Todos los clientes</option>
                    {clientesFiltro.map(c => (
                      <option key={c.id} value={c.id}>{c.nombre} {c.apellido}</option>
                    ))}
                  </select>
                  <SmallDropArrow />
                </div>
              </div>

              <div>
                <label style={{ ...labelStyle, fontSize: '12px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <Building2 style={{ width: '11px', height: '11px' }} />
                  Negocio
                </label>
                <div style={{ position: 'relative' }}>
                  <select
                    value={filterNegocio}
                    onChange={e => setFilterNegocio(e.target.value)}
                    style={{ ...selectStyle, fontSize: '13px', padding: '8px 30px 8px 10px' }}
                  >
                    <option value="">Todos los negocios</option>
                    {negociosFiltro.map(n => (
                      <option key={n.id} value={n.id}>{n.nombreNegocio}</option>
                    ))}
                  </select>
                  <SmallDropArrow />
                </div>
              </div>

              <div>
                <label style={{ ...labelStyle, fontSize: '12px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <MapPin style={{ width: '11px', height: '11px' }} />
                  Municipio
                </label>
                <div style={{ position: 'relative' }}>
                  <select
                    value={filterMunicipio}
                    onChange={e => setFilterMunicipio(e.target.value)}
                    style={{ ...selectStyle, fontSize: '13px', padding: '8px 30px 8px 10px' }}
                  >
                    <option value="">Todos los municipios</option>
                    {municipiosUnicos.map(m => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </select>
                  <SmallDropArrow />
                </div>
              </div>

              <div>
                <label style={{ ...labelStyle, fontSize: '12px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <UserCheck style={{ width: '11px', height: '11px' }} />
                  Estado
                </label>
                <div style={{ position: 'relative' }}>
                  <select
                    value={filterEstado}
                    onChange={e => setFilterEstado(e.target.value)}
                    style={{ ...selectStyle, fontSize: '13px', padding: '8px 30px 8px 10px' }}
                  >
                    <option value="">Todos</option>
                    <option value="activo">Activo</option>
                    <option value="inactivo">Inactivo</option>
                  </select>
                  <SmallDropArrow />
                </div>
              </div>
            </div>
          )}
        </div>

        <div style={{
          background: '#fff', borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--border)', overflow: 'hidden',
          boxShadow: 'var(--shadow-sm)'
        }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'var(--gray-50)' }}>
                {[
                  'Beneficiario', 'CURP', 'Contacto', 'Municipio',
                  'Cliente', 'Negocio Asignado', 'Periodo', 'Estado',
                  ...(currentUser.rol !== 'cliente' ? ['Recursos', 'Acciones'] : [])
                ].map((col, i) => (
                  <th key={i} style={{
                    padding: '12px 16px',
                    textAlign: i >= 8 ? 'center' : 'left',
                    fontSize: '11px', fontWeight: 700,
                    color: 'var(--gray-500)',
                    fontFamily: "'Plus Jakarta Sans', sans-serif",
                    textTransform: 'uppercase', letterSpacing: '0.05em',
                    borderBottom: '1px solid var(--border)', whiteSpace: 'nowrap'
                  }}>
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={currentUser.rol !== 'cliente' ? 10 : 8} style={{
                    padding: '60px 16px', textAlign: 'center',
                    color: 'var(--gray-400)', fontFamily: "'DM Sans', sans-serif", fontSize: '14px'
                  }}>
                    <Users style={{ width: '40px', height: '40px', margin: '0 auto 12px', display: 'block', opacity: 0.3 }} />
                    No se encontraron beneficiarios
                  </td>
                </tr>
              ) : filtered.map(item => (
                <tr
                  key={item.id}
                  onMouseEnter={() => setHoveredRow(item.id)}
                  onMouseLeave={() => setHoveredRow(null)}
                  style={{
                    background: hoveredRow === item.id ? 'var(--gray-50)' : '#fff',
                    transition: 'background 150ms ease',
                    borderBottom: '1px solid var(--border)'
                  }}
                >
                  <td style={{ padding: '12px 16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{
                        width: '38px', height: '38px', borderRadius: 'var(--radius-md)',
                        background: 'linear-gradient(135deg, var(--capyme-blue-mid), var(--capyme-blue))',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        flexShrink: 0, fontSize: '12px', fontWeight: 700,
                        color: '#fff', fontFamily: "'Plus Jakarta Sans', sans-serif"
                      }}>
                        {getInitials(item.nombre, item.apellido)}
                      </div>
                      <div style={{
                        fontSize: '14px', fontWeight: 600,
                        color: 'var(--gray-900)', fontFamily: "'DM Sans', sans-serif"
                      }}>
                        {item.nombre} {item.apellido}
                      </div>
                    </div>
                  </td>

                  <td style={{ padding: '12px 16px' }}>
                    <span style={{
                      fontSize: '12px', fontFamily: "'JetBrains Mono', monospace",
                      color: 'var(--gray-600)', background: 'var(--gray-50)',
                      padding: '2px 8px', borderRadius: 'var(--radius-sm)',
                      border: '1px solid var(--border)'
                    }}>
                      {item.curp || '—'}
                    </span>
                  </td>

                  <td style={{ padding: '12px 16px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                      {item.correo && (
                        <span style={{ fontSize: '12px', color: 'var(--gray-600)', fontFamily: "'DM Sans', sans-serif", display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Mail style={{ width: '11px', height: '11px' }} />{item.correo}
                        </span>
                      )}
                      {item.telefono && (
                        <span style={{ fontSize: '12px', color: 'var(--gray-600)', fontFamily: "'DM Sans', sans-serif", display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Phone style={{ width: '11px', height: '11px' }} />{item.telefono}
                        </span>
                      )}
                      {!item.correo && !item.telefono && (
                        <span style={{ fontSize: '12px', color: 'var(--gray-300)' }}>—</span>
                      )}
                    </div>
                  </td>

                  <td style={{ padding: '12px 16px' }}>
                    {item.municipio ? (
                      <span style={{ fontSize: '13px', color: 'var(--gray-700)', fontFamily: "'DM Sans', sans-serif", display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <MapPin style={{ width: '12px', height: '12px', color: 'var(--gray-400)' }} />
                        {item.municipio}
                      </span>
                    ) : <span style={{ color: 'var(--gray-300)', fontSize: '13px' }}>—</span>}
                  </td>

                  <td style={{ padding: '12px 16px' }}>
                    {item.negocio?.usuario ? (
                      <div>
                        <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--gray-800)', fontFamily: "'DM Sans', sans-serif" }}>
                          {item.negocio.usuario.nombre} {item.negocio.usuario.apellido}
                        </div>
                        <div style={{ fontSize: '11px', color: 'var(--gray-400)', fontFamily: "'DM Sans', sans-serif" }}>
                          {item.negocio.usuario.email}
                        </div>
                      </div>
                    ) : <span style={{ color: 'var(--gray-300)', fontSize: '13px' }}>—</span>}
                  </td>

                  <td style={{ padding: '12px 16px' }}>
                    {item.negocio ? (
                      <span style={{ fontSize: '13px', color: 'var(--gray-700)', fontFamily: "'DM Sans', sans-serif", display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Building2 style={{ width: '12px', height: '12px', color: 'var(--gray-400)' }} />
                        {item.negocio.nombreNegocio}
                      </span>
                    ) : <span style={{ color: 'var(--gray-300)', fontSize: '13px' }}>—</span>}
                  </td>

                  <td style={{ padding: '12px 16px' }}>
                    <div style={{ fontSize: '12px', color: 'var(--gray-600)', fontFamily: "'DM Sans', sans-serif" }}>
                      {item.fechaInicio || item.fechaTermino ? (
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Calendar style={{ width: '11px', height: '11px', color: 'var(--gray-400)' }} />
                          {formatFecha(item.fechaInicio)} — {formatFecha(item.fechaTermino)}
                        </span>
                      ) : '—'}
                    </div>
                  </td>

                  <td style={{ padding: '12px 16px' }}>
                    <span style={{
                      display: 'inline-flex', alignItems: 'center', gap: '5px',
                      padding: '4px 10px', borderRadius: 'var(--radius-sm)',
                      fontSize: '12px', fontWeight: 600,
                      fontFamily: "'DM Sans', sans-serif",
                      background: item.activo ? '#ECFDF5' : '#FEF2F2',
                      color: item.activo ? '#065F46' : '#DC2626'
                    }}>
                      <span style={{
                        width: '6px', height: '6px', borderRadius: '50%',
                        background: item.activo ? '#10B981' : '#EF4444',
                        display: 'inline-block'
                      }} />
                      {item.activo ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>

                  {currentUser.rol !== 'cliente' && (
                    <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '2px' }}>
                        {item.urlRecurso && (
                          <a
                            href={item.urlRecurso}
                            target="_blank"
                            rel="noopener noreferrer"
                            title="Abrir recurso"
                            style={{
                              width: '34px', height: '34px',
                              borderRadius: 'var(--radius-sm)', background: 'transparent',
                              cursor: 'pointer', transition: 'all 150ms ease', color: '#059669',
                              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                              textDecoration: 'none'
                            }}
                            onMouseEnter={e => { e.currentTarget.style.background = '#ECFDF5'; }}
                            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
                          >
                            <ExternalLink style={{ width: '15px', height: '15px' }} />
                          </a>
                        )}
                        <button
                          onClick={() => handleOpenRecurso(item)}
                          title={item.urlRecurso ? 'Editar recurso' : 'Agregar recurso'}
                          style={{
                            width: '34px', height: '34px', border: 'none',
                            borderRadius: 'var(--radius-sm)', background: 'transparent',
                            cursor: 'pointer', transition: 'all 150ms ease',
                            color: item.urlRecurso ? 'var(--capyme-blue-mid)' : 'var(--gray-400)',
                            display: 'inline-flex', alignItems: 'center', justifyContent: 'center'
                          }}
                          onMouseEnter={e => { e.currentTarget.style.background = '#EEF4FF'; e.currentTarget.style.color = 'var(--capyme-blue-mid)'; }}
                          onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = item.urlRecurso ? 'var(--capyme-blue-mid)' : 'var(--gray-400)'; }}
                        >
                          <FolderOpen style={{ width: '16px', height: '16px' }} />
                        </button>
                      </div>
                    </td>
                  )}

                  {currentUser.rol !== 'cliente' && (
                    <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '4px' }}>
                        <button
                          onClick={() => handleOpenModal('edit', item)}
                          title="Editar"
                          style={{
                            width: '34px', height: '34px', border: 'none',
                            borderRadius: 'var(--radius-sm)', background: 'transparent',
                            cursor: 'pointer', color: 'var(--gray-400)', transition: 'all 150ms ease',
                            display: 'inline-flex', alignItems: 'center', justifyContent: 'center'
                          }}
                          onMouseEnter={e => { e.currentTarget.style.background = '#EEF4FF'; e.currentTarget.style.color = 'var(--capyme-blue-mid)'; }}
                          onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--gray-400)'; }}
                        >
                          <Edit style={{ width: '16px', height: '16px' }} />
                        </button>

                        {!item.activo && (
                          <button
                            onClick={() => handleToggleActivo(item)}
                            title={currentUser.rol === 'admin' ? 'Activar' : 'Sin permiso'}
                            style={{
                              width: '34px', height: '34px', border: 'none',
                              borderRadius: 'var(--radius-sm)', background: 'transparent',
                              cursor: currentUser.rol === 'admin' ? 'pointer' : 'not-allowed',
                              color: 'var(--gray-400)', transition: 'all 150ms ease',
                              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                              opacity: currentUser.rol === 'admin' ? 1 : 0.4
                            }}
                            onMouseEnter={e => { if (currentUser.rol === 'admin') { e.currentTarget.style.background = '#ECFDF5'; e.currentTarget.style.color = '#065F46'; } }}
                            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--gray-400)'; }}
                          >
                            <CheckCircle style={{ width: '16px', height: '16px' }} />
                          </button>
                        )}

                        {item.activo && (
                          <button
                            onClick={() => handleToggleActivo(item)}
                            title={currentUser.rol === 'admin' ? 'Desactivar' : 'Sin permiso'}
                            style={{
                              width: '34px', height: '34px', border: 'none',
                              borderRadius: 'var(--radius-sm)', background: 'transparent',
                              cursor: currentUser.rol === 'admin' ? 'pointer' : 'not-allowed',
                              color: 'var(--gray-400)', transition: 'all 150ms ease',
                              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                              opacity: currentUser.rol === 'admin' ? 1 : 0.4
                            }}
                            onMouseEnter={e => { if (currentUser.rol === 'admin') { e.currentTarget.style.background = '#FEF2F2'; e.currentTarget.style.color = '#DC2626'; } }}
                            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--gray-400)'; }}
                          >
                            <Trash2 style={{ width: '16px', height: '16px' }} />
                          </button>
                        )}
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div
          onClick={handleCloseModal}
          style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)',
            backdropFilter: 'blur(4px)', display: 'flex',
            alignItems: 'center', justifyContent: 'center',
            zIndex: 1000, padding: '20px'
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              background: '#fff', borderRadius: 'var(--radius-lg)',
              width: '100%', maxWidth: '720px', maxHeight: '90vh',
              display: 'flex', flexDirection: 'column',
              boxShadow: '0 20px 60px rgba(0,0,0,0.18)',
              animation: 'modalIn 200ms ease'
            }}
          >
            <div style={{
              padding: '20px 24px', background: 'var(--gray-50)',
              borderBottom: '1px solid var(--border)',
              borderRadius: 'var(--radius-lg) var(--radius-lg) 0 0',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <UserCheck style={{ width: '20px', height: '20px', color: 'var(--capyme-blue-mid)' }} />
                <h2 style={{
                  margin: 0, fontSize: '18px', fontWeight: 800,
                  fontFamily: "'Plus Jakarta Sans', sans-serif", color: 'var(--gray-900)'
                }}>
                  {modalMode === 'create' ? 'Nuevo Beneficiario JCF' : 'Editar Beneficiario'}
                </h2>
              </div>
              <button
                onClick={handleCloseModal}
                style={{
                  width: '34px', height: '34px', border: 'none', background: 'transparent',
                  borderRadius: 'var(--radius-sm)', cursor: 'pointer', color: 'var(--gray-400)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  transition: 'all 150ms ease'
                }}
                onMouseEnter={e => { e.currentTarget.style.background = 'var(--gray-100)'; e.currentTarget.style.color = 'var(--gray-700)'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--gray-400)'; }}
              >
                <X style={{ width: '18px', height: '18px' }} />
              </button>
            </div>

            <div style={{ overflowY: 'auto', flex: 1, padding: '24px' }}>

              <SectionTitle icon={Building2} text="Asignación al programa" />
              <div style={{ marginTop: '14px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
                <div>
                  <label style={labelStyle}>
                    Cliente <span style={{ color: '#EF4444' }}>*</span>
                  </label>
                  <div style={{ position: 'relative' }}>
                    <select
                      name="clienteId"
                      value={formData.clienteId}
                      onChange={handleChange}
                      style={{ ...selectStyle, ...(formErrors.clienteId ? inputErrorStyle : {}) }}
                    >
                      <option value="">— Seleccionar cliente —</option>
                      {clientes.map(c => (
                        <option key={c.id} value={c.id}>
                          {c.nombre} {c.apellido}
                        </option>
                      ))}
                    </select>
                    <DropArrow />
                  </div>
                  {formErrors.clienteId && <ErrorMsg text={formErrors.clienteId} />}
                </div>

                <div>
                  <label style={labelStyle}>
                    Negocio <span style={{ color: '#EF4444' }}>*</span>
                    {!formData.clienteId && (
                      <span style={{ fontWeight: 400, color: 'var(--gray-400)', marginLeft: '6px', fontSize: '11px' }}>
                        — selecciona un cliente primero
                      </span>
                    )}
                  </label>
                  <div style={{ position: 'relative' }}>
                    <select
                      name="negocioId"
                      value={formData.negocioId}
                      onChange={handleChange}
                      disabled={!formData.clienteId}
                      style={{
                        ...(formData.clienteId ? selectStyle : selectDisabledStyle),
                        ...(formErrors.negocioId ? inputErrorStyle : {})
                      }}
                    >
                      <option value="">— Seleccionar negocio —</option>
                      {negociosFiltradosPorCliente.map(n => (
                        <option key={n.id} value={n.id}>{n.nombreNegocio}</option>
                      ))}
                    </select>
                    <DropArrow />
                  </div>
                  {formErrors.negocioId && <ErrorMsg text={formErrors.negocioId} />}
                  {formData.clienteId && negociosFiltradosPorCliente.length === 0 && (
                    <p style={{ marginTop: '4px', fontSize: '12px', color: 'var(--gray-400)', fontFamily: "'DM Sans', sans-serif" }}>
                      Este cliente no tiene negocios registrados
                    </p>
                  )}
                </div>

                <div>
                  <label style={labelStyle}>Fecha de inicio</label>
                  <input
                    name="fechaInicio" value={formData.fechaInicio} onChange={handleChange}
                    type="date"
                    style={{ ...inputBaseStyle, ...(formErrors.fechaInicio ? inputErrorStyle : {}) }}
                  />
                  {formErrors.fechaInicio && <ErrorMsg text={formErrors.fechaInicio} />}
                </div>
                <div>
                  <label style={labelStyle}>Fecha de término</label>
                  <input
                    name="fechaTermino" value={formData.fechaTermino} onChange={handleChange}
                    type="date"
                    style={{ ...inputBaseStyle, ...(formErrors.fechaTermino ? inputErrorStyle : {}) }}
                  />
                  {formErrors.fechaTermino && <ErrorMsg text={formErrors.fechaTermino} />}
                </div>
              </div>

              <SectionTitle icon={Users} text="Datos personales del beneficiario" />
              <div style={{ marginTop: '14px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
                <div>
                  <label style={labelStyle}>Nombre <span style={{ color: '#EF4444' }}>*</span></label>
                  <input
                    name="nombre" value={formData.nombre} onChange={handleChange}
                    placeholder="Nombre(s)"
                    style={{ ...inputBaseStyle, ...(formErrors.nombre ? inputErrorStyle : {}) }}
                  />
                  {formErrors.nombre && <ErrorMsg text={formErrors.nombre} />}
                </div>
                <div>
                  <label style={labelStyle}>Apellidos <span style={{ color: '#EF4444' }}>*</span></label>
                  <input
                    name="apellido" value={formData.apellido} onChange={handleChange}
                    placeholder="Apellido paterno y materno"
                    style={{ ...inputBaseStyle, ...(formErrors.apellido ? inputErrorStyle : {}) }}
                  />
                  {formErrors.apellido && <ErrorMsg text={formErrors.apellido} />}
                </div>
                <div>
                  <label style={labelStyle}>CURP</label>
                  <input
                    name="curp"
                    value={formData.curp}
                    onChange={e => handleChange({ target: { name: 'curp', value: e.target.value.toUpperCase() } })}
                    placeholder="18 caracteres"
                    maxLength={18}
                    style={{
                      ...inputBaseStyle,
                      fontFamily: "'JetBrains Mono', monospace",
                      letterSpacing: '0.05em',
                      ...(formErrors.curp ? inputErrorStyle : {})
                    }}
                  />
                  {formErrors.curp && <ErrorMsg text={formErrors.curp} />}
                </div>
                <div>
                  <label style={labelStyle}>Municipio</label>
                  <input
                    name="municipio" value={formData.municipio} onChange={handleChange}
                    placeholder="Municipio de residencia"
                    style={inputBaseStyle}
                  />
                </div>
              </div>

              <SectionTitle icon={Phone} text="Contacto" />
              <div style={{ marginTop: '14px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '8px' }}>
                <div>
                  <label style={labelStyle}>Correo electrónico</label>
                  <input
                    name="correo" value={formData.correo} onChange={handleChange}
                    type="email" placeholder="correo@ejemplo.com"
                    style={{ ...inputBaseStyle, ...(formErrors.correo ? inputErrorStyle : {}) }}
                  />
                  {formErrors.correo && <ErrorMsg text={formErrors.correo} />}
                </div>
                <div>
                  <label style={labelStyle}>Teléfono</label>
                  <input
                    name="telefono" value={formData.telefono} onChange={handleChange}
                    placeholder="10 dígitos" maxLength={10}
                    style={{ ...inputBaseStyle, ...(formErrors.telefono ? inputErrorStyle : {}) }}
                  />
                  {formErrors.telefono && <ErrorMsg text={formErrors.telefono} />}
                </div>
              </div>

            </div>

            <div style={{
              padding: '16px 24px', background: 'var(--gray-50)',
              borderTop: '1px solid var(--border)',
              borderRadius: '0 0 var(--radius-lg) var(--radius-lg)',
              display: 'flex', justifyContent: 'flex-end', gap: '10px'
            }}>
              <button
                onClick={handleCloseModal}
                style={{
                  padding: '9px 20px', border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-md)', background: '#fff',
                  color: 'var(--gray-700)', fontSize: '14px', fontWeight: 600,
                  fontFamily: "'DM Sans', sans-serif", cursor: 'pointer',
                  transition: 'all 150ms ease'
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--gray-50)'}
                onMouseLeave={e => e.currentTarget.style.background = '#fff'}
              >
                Cancelar
              </button>
              <button
                onClick={handleSubmit}
                disabled={submitting}
                style={{
                  padding: '9px 24px', border: 'none',
                  borderRadius: 'var(--radius-md)',
                  background: submitting
                    ? 'var(--gray-300)'
                    : 'linear-gradient(135deg, var(--capyme-blue-mid), var(--capyme-blue))',
                  color: '#fff', fontSize: '14px', fontWeight: 600,
                  fontFamily: "'DM Sans', sans-serif",
                  cursor: submitting ? 'not-allowed' : 'pointer',
                  transition: 'all 150ms ease',
                  boxShadow: submitting ? 'none' : '0 2px 8px rgba(31,78,158,0.28)'
                }}
              >
                {submitting ? 'Guardando...' : modalMode === 'create' ? 'Registrar' : 'Guardar cambios'}
              </button>
            </div>
          </div>
        </div>
      )}

      {showRecursoModal && recursoItem && (
        <div
          onClick={handleCloseRecurso}
          style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)',
            backdropFilter: 'blur(4px)', display: 'flex',
            alignItems: 'center', justifyContent: 'center',
            zIndex: 1001, padding: '20px'
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              background: '#fff', borderRadius: 'var(--radius-lg)',
              width: '100%', maxWidth: '480px',
              boxShadow: '0 20px 60px rgba(0,0,0,0.18)',
              animation: 'modalIn 200ms ease'
            }}
          >
            <div style={{
              padding: '18px 22px', background: 'var(--gray-50)',
              borderBottom: '1px solid var(--border)',
              borderRadius: 'var(--radius-lg) var(--radius-lg) 0 0',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <FolderOpen style={{ width: '18px', height: '18px', color: 'var(--capyme-blue-mid)' }} />
                <div>
                  <h3 style={{
                    margin: 0, fontSize: '16px', fontWeight: 700,
                    fontFamily: "'Plus Jakarta Sans', sans-serif", color: 'var(--gray-900)'
                  }}>
                    Recurso del beneficiario
                  </h3>
                  <p style={{
                    margin: '2px 0 0', fontSize: '12px',
                    color: 'var(--gray-500)', fontFamily: "'DM Sans', sans-serif"
                  }}>
                    {recursoItem.nombre} {recursoItem.apellido}
                  </p>
                </div>
              </div>
              <button
                onClick={handleCloseRecurso}
                style={{
                  width: '32px', height: '32px', border: 'none', background: 'transparent',
                  borderRadius: 'var(--radius-sm)', cursor: 'pointer', color: 'var(--gray-400)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  transition: 'all 150ms ease'
                }}
                onMouseEnter={e => { e.currentTarget.style.background = 'var(--gray-100)'; e.currentTarget.style.color = 'var(--gray-700)'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--gray-400)'; }}
              >
                <X style={{ width: '16px', height: '16px' }} />
              </button>
            </div>

            <div style={{ padding: '22px' }}>
              <label style={labelStyle}>URL del recurso (Drive / Video / Documento)</label>
              <div style={{ position: 'relative' }}>
                <Link style={{
                  position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)',
                  width: '15px', height: '15px', color: 'var(--gray-400)', pointerEvents: 'none'
                }} />
                <input
                  type="url"
                  value={recursoUrl}
                  onChange={e => setRecursoUrl(e.target.value)}
                  placeholder="https://drive.google.com/..."
                  style={{ ...inputBaseStyle, paddingLeft: '38px' }}
                />
              </div>
              {recursoUrl && (
                <a
                  href={recursoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: '5px',
                    marginTop: '10px', fontSize: '12px', color: 'var(--capyme-blue-mid)',
                    textDecoration: 'none', fontFamily: "'DM Sans', sans-serif"
                  }}
                >
                  <ExternalLink style={{ width: '12px', height: '12px' }} />
                  Abrir enlace en nueva pestaña
                </a>
              )}
            </div>

            <div style={{
              padding: '14px 22px', background: 'var(--gray-50)',
              borderTop: '1px solid var(--border)',
              borderRadius: '0 0 var(--radius-lg) var(--radius-lg)',
              display: 'flex', justifyContent: 'flex-end', gap: '10px'
            }}>
              <button
                onClick={handleCloseRecurso}
                style={{
                  padding: '8px 18px', border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-md)', background: '#fff',
                  color: 'var(--gray-700)', fontSize: '14px', fontWeight: 600,
                  fontFamily: "'DM Sans', sans-serif", cursor: 'pointer',
                  transition: 'all 150ms ease'
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--gray-50)'}
                onMouseLeave={e => e.currentTarget.style.background = '#fff'}
              >
                Cancelar
              </button>
              <button
                onClick={handleGuardarRecurso}
                disabled={submittingRecurso}
                style={{
                  padding: '8px 20px', border: 'none',
                  borderRadius: 'var(--radius-md)',
                  background: submittingRecurso
                    ? 'var(--gray-300)'
                    : 'linear-gradient(135deg, var(--capyme-blue-mid), var(--capyme-blue))',
                  color: '#fff', fontSize: '14px', fontWeight: 600,
                  fontFamily: "'DM Sans', sans-serif",
                  cursor: submittingRecurso ? 'not-allowed' : 'pointer',
                  boxShadow: submittingRecurso ? 'none' : '0 2px 8px rgba(31,78,158,0.28)'
                }}
              >
                {submittingRecurso ? 'Guardando...' : 'Guardar recurso'}
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

export default JovenesConstruyendoFuturo;