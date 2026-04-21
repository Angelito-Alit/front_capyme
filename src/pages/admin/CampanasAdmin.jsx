import React, { useState, useEffect } from 'react'
import Layout from '../../components/common/Layout'
import { toast } from 'react-hot-toast'
import { 
  Search, Plus, Edit, CheckCircle, Trash2, AlertCircle, 
  Megaphone, Building2, DollarSign, Calendar, Activity,
  Filter, Eye, User, Briefcase, BarChart3, X, ChevronDown
} from 'lucide-react'
import { campanasAdminService } from '../../services/campanasAdminService'

const initialFormData = {
  titulo: '',
  descripcion: '',
  metaRecaudacion: '',
  montoRecaudado: '0',
  fechaInicio: '',
  fechaCierre: '',
  negocioId: '',
  tipoCrowdfunding: 'donativo',
  estado: 'en_revision'
}

const inputBaseStyle = {
  width: '100%', padding: '10px 12px',
  border: '1px solid var(--border)',
  borderRadius: 'var(--radius-md)',
  fontSize: '14px', fontFamily: "'DM Sans', sans-serif",
  color: 'var(--gray-900)', background: '#fff',
  outline: 'none', transition: 'all 200ms ease',
}

const inputWithIconStyle = { ...inputBaseStyle, paddingLeft: '38px' }

const inputErrorStyle = {
  borderColor: '#EF4444',
  boxShadow: '0 0 0 2px rgba(239,68,68,0.15)'
}

const labelStyle = {
  display: 'block', fontSize: '13px', fontWeight: 600,
  color: 'var(--gray-600)', marginBottom: '6px',
  fontFamily: "'DM Sans', sans-serif",
}

const selectStyle = {
  ...inputBaseStyle, appearance: 'none',
  paddingRight: '36px', cursor: 'pointer',
}

const CampanasAdmin = () => {
  const authStorage = JSON.parse(localStorage.getItem('auth-storage') || '{}')
  const currentUser = authStorage?.state?.user || {}

  const [items, setItems] = useState([])
  const [negocios, setNegocios] = useState([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [modalMode, setModalMode] = useState('create')
  const [selectedItem, setSelectedItem] = useState(null)
  const [hoveredRow, setHoveredRow] = useState(null)
  
  const [searchTerm, setSearchTerm] = useState('')
  const [filterEstado, setFilterEstado] = useState('todos')
  const [filterTipo, setFilterTipo] = useState('todos')
  const [filterMetaMin, setFilterMetaMin] = useState('')
  const [filterMetaMax, setFilterMetaMax] = useState('')
  const [filterFechaDesde, setFilterFechaDesde] = useState('')

  const [formData, setFormData] = useState(initialFormData)
  const [formErrors, setFormErrors] = useState({})

  useEffect(() => {
    cargarDatos()
  }, [])

  const cargarDatos = async () => {
    try {
      setLoading(true)
      const [campanasData, negociosData] = await Promise.all([
        campanasAdminService.getAll(),
        campanasAdminService.getNegocios()
      ])
      setItems(campanasData)
      setNegocios(negociosData)
    } catch (error) {
      toast.error('Error al cargar datos')
    } finally {
      setLoading(false)
    }
  }

  const resetFilters = () => {
    setSearchTerm('')
    setFilterEstado('todos')
    setFilterTipo('todos')
    setFilterMetaMin('')
    setFilterMetaMax('')
    setFilterFechaDesde('')
  }

  const handleOpenModal = (mode, item = null) => {
    setModalMode(mode)
    setFormErrors({})
    if (mode === 'edit' && item) {
      setSelectedItem(item)
      setFormData({
        titulo: item.titulo,
        descripcion: item.descripcion || '',
        metaRecaudacion: item.metaRecaudacion,
        montoRecaudado: item.montoRecaudado || '0',
        fechaInicio: item.fechaInicio ? item.fechaInicio.split('T')[0] : '',
        fechaCierre: item.fechaCierre ? item.fechaCierre.split('T')[0] : '',
        negocioId: item.negocioId,
        tipoCrowdfunding: item.tipoCrowdfunding,
        estado: item.estado
      })
    } else if (mode === 'view' && item) {
      setSelectedItem(item)
    } else {
      setSelectedItem(null)
      setFormData(initialFormData)
    }
    setShowModal(true)
  }

  const handleCloseModal = () => {
    setShowModal(false)
    setFormData(initialFormData)
    setSelectedItem(null)
    setFormErrors({})
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: null }))
    }
  }

  const validateForm = () => {
    const errors = {}
    if (!formData.titulo.trim()) errors.titulo = 'El título es requerido'
    if (!formData.negocioId) errors.negocioId = 'Debe seleccionar un negocio'
    if (!formData.metaRecaudacion || parseFloat(formData.metaRecaudacion) <= 0) errors.metaRecaudacion = 'Monto inválido'
    if (!formData.fechaInicio) errors.fechaInicio = 'Seleccione fecha de inicio'
    if (!formData.fechaCierre) errors.fechaCierre = 'Seleccione fecha de cierre'
    if (formData.fechaInicio && formData.fechaCierre && new Date(formData.fechaCierre) < new Date(formData.fechaInicio)) {
      errors.fechaCierre = 'Debe ser posterior al inicio'
    }
    
    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validateForm()) return

    try {
      setSubmitting(true)
      if (modalMode === 'edit') {
        await campanasAdminService.update(selectedItem.id, formData)
        toast.success('Campaña actualizada')
      } else {
        await campanasAdminService.create(formData)
        toast.success('Campaña creada')
      }
      handleCloseModal()
      cargarDatos()
    } catch (error) {
      toast.error('Error al guardar la campaña')
    } finally {
      setSubmitting(false)
    }
  }

  const handleToggleActivo = async (item) => {
    const accion = item.activo ? 'desactivar' : 'activar'
    if (window.confirm(`¿Estás seguro de ${accion} "${item.titulo}"?`)) {
      try {
        await campanasAdminService.toggleActivo(item.id)
        toast.success(`${accion === 'desactivar' ? 'Desactivada' : 'Activada'} exitosamente`)
        if (modalMode === 'view') {
           handleCloseModal()
        }
        cargarDatos()
      } catch (error) {
        toast.error('Error al cambiar estado')
      }
    }
  }

  const filteredItems = items.filter(item => {
    const matchesSearch = item.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (item.negocio?.nombreNegocio || '').toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesEstado = filterEstado === 'todos' || item.estado === filterEstado
    
    const matchesTipo = filterTipo === 'todos' || item.tipoCrowdfunding === filterTipo
    
    const metaValue = parseFloat(item.metaRecaudacion)
    const matchesMetaMin = filterMetaMin === '' || metaValue >= parseFloat(filterMetaMin)
    const matchesMetaMax = filterMetaMax === '' || metaValue <= parseFloat(filterMetaMax)
    
    const matchesFecha = filterFechaDesde === '' || new Date(item.fechaInicio) >= new Date(filterFechaDesde)

    return matchesSearch && matchesEstado && matchesTipo && matchesMetaMin && matchesMetaMax && matchesFecha
  })

  const formatearFecha = (fechaString) => {
    if (!fechaString) return 'N/A'
    return new Date(fechaString).toLocaleDateString('es-MX', {
      year: 'numeric', month: 'long', day: 'numeric'
    })
  }

  if (loading) {
    return (
      <Layout>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
          <div style={{ width: '40px', height: '40px', border: '3px solid var(--gray-200)', borderTopColor: 'var(--capyme-blue-mid)', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--gray-900)', fontFamily: "'Plus Jakarta Sans', sans-serif", letterSpacing: '-0.02em', marginBottom: '4px' }}>
            Campañas de Crowdfunding
          </h1>
          <p style={{ fontSize: '14px', color: 'var(--gray-500)', fontFamily: "'DM Sans', sans-serif" }}>
            Administración manual de campañas e inversiones
          </p>
        </div>
        
        {currentUser.rol === 'admin' && (
          <button 
            onClick={() => handleOpenModal('create')}
            style={{ 
              display: 'flex', alignItems: 'center', gap: '8px', 
              background: 'linear-gradient(135deg, var(--capyme-blue-mid), var(--capyme-blue))', 
              color: '#fff', border: 'none', padding: '10px 20px', 
              borderRadius: 'var(--radius-md)', fontSize: '14px', fontWeight: 600, 
              fontFamily: "'DM Sans', sans-serif", cursor: 'pointer', 
              boxShadow: '0 2px 8px rgba(31,78,158,0.28)', transition: 'all 200ms ease' 
            }}
          >
            <Plus style={{ width: '18px', height: '18px' }} /> Nueva Campaña
          </button>
        )}
      </div>

      <div style={{ background: '#fff', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)', overflow: 'hidden', marginBottom: '24px' }}>
        <div style={{ padding: '20px', borderBottom: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          
          <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
            <div style={{ position: 'relative', flex: '2', minWidth: '300px' }}>
              <Search style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', width: '18px', height: '18px', color: 'var(--gray-400)' }} />
              <input 
                type="text" 
                placeholder="Buscar por título o negocio..." 
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                style={inputWithIconStyle}
              />
            </div>

            <div style={{ position: 'relative', flex: '1', minWidth: '180px' }}>
              <Filter style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', width: '16px', height: '16px', color: 'var(--gray-400)' }} />
              <select value={filterEstado} onChange={e => setFilterEstado(e.target.value)} style={{ ...selectStyle, paddingLeft: '38px' }}>
                <option value="todos">Todos los Estados</option>
                <option value="en_revision">En Revisión</option>
                <option value="aprobada">Aprobada</option>
                <option value="activa">Activa</option>
                <option value="completada">Completada</option>
              </select>
              <ChevronDown style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', width: '14px', color: 'var(--gray-400)', pointerEvents: 'none' }} />
            </div>

            <div style={{ position: 'relative', flex: '1', minWidth: '180px' }}>
              <Activity style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', width: '16px', height: '16px', color: 'var(--gray-400)' }} />
              <select value={filterTipo} onChange={e => setFilterTipo(e.target.value)} style={{ ...selectStyle, paddingLeft: '38px' }}>
                <option value="todos">Todos los Tipos</option>
                <option value="donativo">Donativo</option>
                <option value="inversion">Inversión</option>
              </select>
              <ChevronDown style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', width: '14px', color: 'var(--gray-400)', pointerEvents: 'none' }} />
            </div>
          </div>

          <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: '1', minWidth: '280px' }}>
              <DollarSign style={{ width: '16px', color: 'var(--gray-400)' }} />
              <input type="number" placeholder="Meta min." value={filterMetaMin} onChange={e => setFilterMetaMin(e.target.value)} style={{ ...inputBaseStyle, flex: 1 }} />
              <span style={{ color: 'var(--gray-300)' }}>—</span>
              <input type="number" placeholder="Meta max." value={filterMetaMax} onChange={e => setFilterMetaMax(e.target.value)} style={{ ...inputBaseStyle, flex: 1 }} />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: '1', minWidth: '200px' }}>
              <Calendar style={{ width: '16px', color: 'var(--gray-400)' }} />
              <input type="date" value={filterFechaDesde} onChange={e => setFilterFechaDesde(e.target.value)} style={inputBaseStyle} />
            </div>

            <button 
              onClick={resetFilters}
              style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'transparent', border: '1px solid var(--border)', padding: '10px 16px', borderRadius: 'var(--radius-md)', fontSize: '13px', fontWeight: 600, color: 'var(--gray-600)', cursor: 'pointer' }}
            >
              <X style={{ width: '14px' }} /> Limpiar
            </button>
          </div>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: 'var(--gray-50)', borderBottom: '1px solid var(--border)' }}>
                <th style={{ padding: '14px 20px', fontSize: '12px', fontWeight: 700, color: 'var(--gray-500)', textTransform: 'uppercase', letterSpacing: '0.05em', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Campaña</th>
                <th style={{ padding: '14px 20px', fontSize: '12px', fontWeight: 700, color: 'var(--gray-500)', textTransform: 'uppercase', letterSpacing: '0.05em', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Negocio Destino</th>
                <th style={{ padding: '14px 20px', fontSize: '12px', fontWeight: 700, color: 'var(--gray-500)', textTransform: 'uppercase', letterSpacing: '0.05em', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Progreso</th>
                <th style={{ padding: '14px 20px', fontSize: '12px', fontWeight: 700, color: 'var(--gray-500)', textTransform: 'uppercase', letterSpacing: '0.05em', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Estado</th>
                <th style={{ padding: '14px 20px', fontSize: '12px', fontWeight: 700, color: 'var(--gray-500)', textTransform: 'uppercase', letterSpacing: '0.05em', fontFamily: "'Plus Jakarta Sans', sans-serif", textAlign: 'right' }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredItems.map((item) => (
                <tr 
                  key={item.id} 
                  onClick={() => handleOpenModal('view', item)}
                  onMouseEnter={() => setHoveredRow(item.id)}
                  onMouseLeave={() => setHoveredRow(null)}
                  style={{ 
                    background: hoveredRow === item.id ? 'var(--gray-50)' : 'transparent', 
                    transition: 'background 150ms ease', 
                    borderBottom: '1px solid var(--border)',
                    cursor: 'pointer'
                  }}
                >
                  <td style={{ padding: '16px 20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ width: '38px', height: '38px', borderRadius: 'var(--radius-md)', background: 'linear-gradient(135deg, var(--capyme-blue-mid), var(--capyme-blue))', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', fontWeight: 700, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                        {item.titulo.substring(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <p style={{ margin: 0, fontSize: '14px', fontWeight: 600, color: 'var(--gray-900)', fontFamily: "'DM Sans', sans-serif" }}>{item.titulo}</p>
                        <p style={{ margin: '2px 0 0', fontSize: '12px', color: 'var(--gray-500)', fontFamily: "'DM Sans', sans-serif", textTransform: 'capitalize' }}>{item.tipoCrowdfunding}</p>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '16px 20px' }}>
                    <p style={{ margin: 0, fontSize: '14px', fontWeight: 500, color: 'var(--gray-900)', fontFamily: "'DM Sans', sans-serif" }}>{item.negocio?.nombreNegocio}</p>
                    <p style={{ margin: '2px 0 0', fontSize: '12px', color: 'var(--gray-500)', fontFamily: "'DM Sans', sans-serif" }}>{item.negocio?.usuario?.nombre} {item.negocio?.usuario?.apellido}</p>
                  </td>
                  <td style={{ padding: '16px 20px' }}>
                    <p style={{ margin: 0, fontSize: '14px', fontWeight: 700, color: '#10B981', fontFamily: "'JetBrains Mono', monospace" }}>${item.montoRecaudado}</p>
                    <p style={{ margin: '2px 0 0', fontSize: '12px', color: 'var(--gray-500)', fontFamily: "'DM Sans', sans-serif" }}>de ${item.metaRecaudacion}</p>
                  </td>
                  <td style={{ padding: '16px 20px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', alignItems: 'flex-start' }}>
                      <span style={{ padding: '4px 10px', borderRadius: '99px', fontSize: '12px', fontWeight: 600, fontFamily: "'Plus Jakarta Sans', sans-serif", letterSpacing: '0.02em', background: item.activo ? '#ECFDF5' : '#FEF2F2', color: item.activo ? '#065F46' : '#DC2626' }}>
                        {item.activo ? 'Activo' : 'Inactivo'}
                      </span>
                      <span style={{ padding: '4px 10px', borderRadius: '99px', fontSize: '11px', fontWeight: 600, fontFamily: "'Plus Jakarta Sans', sans-serif", letterSpacing: '0.02em', background: 'var(--gray-100)', color: 'var(--gray-700)', textTransform: 'capitalize' }}>
                        {item.estado.replace('_', ' ')}
                      </span>
                    </div>
                  </td>
                  <td style={{ padding: '16px 20px', textAlign: 'right' }} onClick={e => e.stopPropagation()}>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '4px' }}>
                      <button onClick={() => handleOpenModal('view', item)} style={{ width: '34px', height: '34px', border: 'none', borderRadius: 'var(--radius-sm)', background: 'transparent', cursor: 'pointer', color: 'var(--gray-400)' }}><Eye style={{ width: '16px' }} /></button>
                      {currentUser.rol === 'admin' && (
                        <>
                          <button onClick={() => handleOpenModal('edit', item)} style={{ width: '34px', height: '34px', border: 'none', borderRadius: 'var(--radius-sm)', background: 'transparent', cursor: 'pointer', color: 'var(--gray-400)' }}><Edit style={{ width: '16px' }} /></button>
                          <button onClick={() => handleToggleActivo(item)} style={{ width: '34px', height: '34px', border: 'none', borderRadius: 'var(--radius-sm)', background: 'transparent', cursor: 'pointer', color: 'var(--gray-400)' }}>
                            {item.activo ? <Trash2 style={{ width: '16px' }} /> : <CheckCircle style={{ width: '16px' }} />}
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (modalMode === 'create' || modalMode === 'edit') && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.45)', backdropFilter: 'blur(4px)', zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div style={{ background: '#fff', borderRadius: 'var(--radius-lg)', width: '100%', maxWidth: '720px', maxHeight: '90vh', display: 'flex', flexDirection: 'column', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}>
            <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border)', background: 'var(--gray-50)', borderRadius: 'var(--radius-lg) var(--radius-lg) 0 0' }}>
              <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 800, color: 'var(--gray-900)' }}>{modalMode === 'edit' ? 'Editar Campaña' : 'Nueva Campaña'}</h2>
            </div>
            <div style={{ padding: '24px', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <div>
                <SectionTitle icon={Building2} text="Información General" />
                <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '16px', marginTop: '12px' }}>
                  <div>
                    <label style={labelStyle}>Título de la Campaña</label>
                    <input type="text" name="titulo" value={formData.titulo} onChange={handleChange} style={{ ...inputBaseStyle, ...(formErrors.titulo ? inputErrorStyle : {}) }} />
                    {formErrors.titulo && <ErrorMsg text={formErrors.titulo} />}
                  </div>
                  <div>
                    <label style={labelStyle}>Negocio Destino</label>
                    <select name="negocioId" value={formData.negocioId} onChange={handleChange} style={{ ...selectStyle, ...(formErrors.negocioId ? inputErrorStyle : {}) }}>
                      <option value="">Seleccione un negocio...</option>
                      {negocios.map(n => <option key={n.id} value={n.id}>{n.nombreNegocio}</option>)}
                    </select>
                  </div>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <SectionTitle icon={DollarSign} text="Meta ($)" />
                  <input type="number" name="metaRecaudacion" value={formData.metaRecaudacion} onChange={handleChange} style={{ ...inputBaseStyle, marginTop: '12px' }} />
                </div>
                <div>
                  <SectionTitle icon={Calendar} text="Cierre" />
                  <input type="date" name="fechaCierre" value={formData.fechaCierre} onChange={handleChange} style={{ ...inputBaseStyle, marginTop: '12px' }} />
                </div>
              </div>
            </div>
            <div style={{ padding: '16px 24px', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
              <button onClick={handleCloseModal} style={{ padding: '10px 18px', background: '#fff', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', fontWeight: 600 }}>Cancelar</button>
              <button onClick={handleSubmit} disabled={submitting} style={{ padding: '10px 24px', background: 'var(--capyme-blue)', color: '#fff', border: 'none', borderRadius: 'var(--radius-md)', fontWeight: 600 }}>{submitting ? 'Guardando...' : 'Guardar'}</button>
            </div>
          </div>
        </div>
      )}

      {showModal && modalMode === 'view' && selectedItem && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.45)', backdropFilter: 'blur(4px)', zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div style={{ background: '#fff', borderRadius: 'var(--radius-lg)', width: '100%', maxWidth: '600px', display: 'flex', flexDirection: 'column' }}>
            <div style={{ padding: '24px', borderBottom: '1px solid var(--border)' }}>
              <h2 style={{ margin: 0 }}>{selectedItem.titulo}</h2>
            </div>
            <div style={{ padding: '24px' }}>
              <p><strong>Tipo:</strong> {selectedItem.tipoCrowdfunding}</p>
              <p><strong>Meta:</strong> ${selectedItem.metaRecaudacion}</p>
              <p><strong>Recaudado:</strong> ${selectedItem.montoRecaudado}</p>
            </div>
            <div style={{ padding: '16px 24px', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'flex-end' }}>
              <button onClick={handleCloseModal} style={{ padding: '10px 18px', background: '#fff', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)' }}>Cerrar</button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  )
}

const SectionTitle = ({ icon: Icon, text }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', paddingBottom: '4px', borderBottom: '1px solid var(--border)' }}>
    <Icon style={{ width: '14px', height: '14px', color: 'var(--gray-400)' }} />
    <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--gray-400)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{text}</span>
  </div>
)

const ErrorMsg = ({ text }) => (
  <p style={{ marginTop: '4px', color: '#EF4444', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px' }}><AlertCircle style={{ width: '12px' }} /> {text}</p>
)

export default CampanasAdmin