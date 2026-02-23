import { useState, useEffect } from 'react';
import Layout from '../../components/common/Layout';
import { postulacionesService } from '../../services/postulacionesService';
import {
  ClipboardList,
  Search,
  Eye,
  X,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  Calendar,
  Building2,
  FileText,
  ChevronDown,
  MessageSquare,
  Tag,
} from 'lucide-react';
import { toast } from 'react-hot-toast';

const estadoBadge = {
  pendiente:   { bg: '#FFFBEB', color: '#B45309', label: 'Pendiente',   icon: Clock },
  en_revision: { bg: '#EFF6FF', color: '#1D4ED8', label: 'En Revisión', icon: AlertCircle },
  aprobada:    { bg: '#ECFDF5', color: '#065F46', label: 'Aprobada',    icon: CheckCircle },
  rechazada:   { bg: '#FEF2F2', color: '#DC2626', label: 'Rechazada',   icon: XCircle },
  completada:  { bg: '#F5F3FF', color: '#6D28D9', label: 'Completada',  icon: CheckCircle },
};

const MisPostulaciones = () => {
  const authStorage = JSON.parse(localStorage.getItem('auth-storage') || '{}');
  const currentUser = authStorage?.state?.user || {};

  const [postulaciones, setPostulaciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingDetalle, setLoadingDetalle] = useState(false);
  const [showDetalleModal, setShowDetalleModal] = useState(false);
  const [selectedPostulacion, setSelectedPostulacion] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterEstado, setFilterEstado] = useState('');

  useEffect(() => {
    cargarPostulaciones();
  }, []);

  const cargarPostulaciones = async () => {
    try {
      setLoading(true);
      const response = await postulacionesService.getMisPostulaciones();
      setPostulaciones(response.data);
    } catch {
      toast.error('Error al cargar postulaciones');
    } finally {
      setLoading(false);
    }
  };

  const handleVerDetalle = async (postulacionId) => {
    try {
      setLoadingDetalle(true);
      setShowDetalleModal(true);
      const response = await postulacionesService.getById(postulacionId);
      setSelectedPostulacion(response.data);
    } catch {
      toast.error('Error al cargar detalles');
      setShowDetalleModal(false);
    } finally {
      setLoadingDetalle(false);
    }
  };

  const handleCloseModal = () => {
    setShowDetalleModal(false);
    setSelectedPostulacion(null);
  };

  const formatDate = (date) => {
    if (!date) return '—';
    return new Date(date).toLocaleDateString('es-MX', {
      year: 'numeric', month: 'long', day: 'numeric',
    });
  };

  const postulacionesFiltradas = postulaciones.filter(p => {
    const matchSearch =
      p.programa?.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.negocio?.nombreNegocio?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchEstado = !filterEstado || p.estado === filterEstado;
    return matchSearch && matchEstado;
  });

  const inputBaseStyle = {
    width: '100%', padding: '10px 12px',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius-md)',
    fontSize: '14px', fontFamily: "'DM Sans', sans-serif",
    color: 'var(--gray-900)', background: '#fff',
    outline: 'none', transition: 'all 200ms ease',
    boxSizing: 'border-box',
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
            Cargando postulaciones...
          </p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

        <div>
          <h1 style={{
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            fontSize: '26px', fontWeight: 800,
            color: 'var(--gray-900)', letterSpacing: '-0.02em', marginBottom: '4px',
          }}>Mis Postulaciones</h1>
          <p style={{ fontSize: '14px', color: 'var(--gray-500)', fontFamily: "'DM Sans', sans-serif" }}>
            Revisa el estado de tus solicitudes a programas
          </p>
        </div>

        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', flex: '1 1 240px' }}>
            <Search style={{
              position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)',
              width: '15px', height: '15px', color: 'var(--gray-400)', pointerEvents: 'none',
            }} />
            <input
              type="text"
              placeholder="Buscar por programa o negocio..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              style={{ ...inputBaseStyle, paddingLeft: '38px' }}
            />
          </div>
          <div style={{ position: 'relative', flex: '0 1 200px' }}>
            <select
              value={filterEstado}
              onChange={e => setFilterEstado(e.target.value)}
              style={selectStyle}
            >
              <option value="">Todos los estados</option>
              <option value="pendiente">Pendiente</option>
              <option value="en_revision">En Revisión</option>
              <option value="aprobada">Aprobada</option>
              <option value="rechazada">Rechazada</option>
              <option value="completada">Completada</option>
            </select>
            <ChevronDown style={{
              position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)',
              width: '14px', height: '14px', color: 'var(--gray-400)', pointerEvents: 'none',
            }} />
          </div>
        </div>

        {postulacionesFiltradas.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {postulacionesFiltradas.map(postulacion => (
              <PostulacionRow
                key={postulacion.id}
                postulacion={postulacion}
                formatDate={formatDate}
                onVerDetalle={() => handleVerDetalle(postulacion.id)}
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
            alignItems: 'center', textAlign: 'center', gap: '12px',
          }}>
            <div style={{
              width: '64px', height: '64px',
              borderRadius: 'var(--radius-lg)',
              background: '#F5F3FF',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              marginBottom: '4px',
            }}>
              <ClipboardList style={{ width: '28px', height: '28px', color: '#7C3AED' }} />
            </div>
            <h3 style={{
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              fontSize: '17px', fontWeight: 700, color: 'var(--gray-900)',
            }}>
              {searchTerm || filterEstado ? 'Sin resultados' : 'No tienes postulaciones'}
            </h3>
            <p style={{ fontSize: '14px', color: 'var(--gray-400)', fontFamily: "'DM Sans', sans-serif", maxWidth: '340px' }}>
              {searchTerm || filterEstado
                ? 'Intenta ajustar los filtros de búsqueda.'
                : 'Explora los programas disponibles y postula tu negocio para acceder a apoyos.'}
            </p>
            {!searchTerm && !filterEstado && (
              <a
                href="/cliente/programas"
                style={{
                  marginTop: '8px',
                  display: 'inline-flex', alignItems: 'center', gap: '8px',
                  padding: '10px 20px',
                  background: 'linear-gradient(135deg, var(--capyme-blue-mid), var(--capyme-blue))',
                  color: '#fff', textDecoration: 'none',
                  borderRadius: 'var(--radius-md)',
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  fontSize: '14px', fontWeight: 600,
                  boxShadow: '0 2px 8px rgba(31,78,158,0.28)',
                }}
              >
                <FileText style={{ width: '15px', height: '15px' }} />
                Explorar Programas
              </a>
            )}
          </div>
        )}
      </div>

      {showDetalleModal && (
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
              width: '100%', maxWidth: '680px',
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
                  background: '#F5F3FF',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <ClipboardList style={{ width: '18px', height: '18px', color: '#7C3AED' }} />
                </div>
                <h2 style={{
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  fontSize: '18px', fontWeight: 800, color: 'var(--gray-900)',
                }}>
                  Detalle de Postulación
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
              {loadingDetalle ? (
                <div style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  height: '200px', flexDirection: 'column', gap: '12px',
                }}>
                  <div style={{
                    width: '32px', height: '32px',
                    border: '3px solid var(--border)',
                    borderTopColor: '#7C3AED',
                    borderRadius: '50%',
                    animation: 'spin 700ms linear infinite',
                  }} />
                  <p style={{ fontSize: '13px', color: 'var(--gray-400)', fontFamily: "'DM Sans', sans-serif" }}>
                    Cargando detalles...
                  </p>
                </div>
              ) : selectedPostulacion && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <InfoBlock titulo="Programa" icon={FileText}>
                      <p style={{ fontSize: '14px', fontWeight: 600, color: 'var(--gray-900)', marginBottom: '2px' }}>
                        {selectedPostulacion.programa?.nombre}
                      </p>
                      {selectedPostulacion.programa?.tipoPrograma && (
                        <span style={{
                          display: 'inline-block', padding: '2px 8px',
                          background: '#EEF4FF', color: 'var(--capyme-blue-mid)',
                          borderRadius: '99px', fontSize: '11px', fontWeight: 600,
                          fontFamily: "'Plus Jakarta Sans', sans-serif",
                        }}>
                          {selectedPostulacion.programa.tipoPrograma}
                        </span>
                      )}
                    </InfoBlock>

                    <InfoBlock titulo="Negocio" icon={Building2}>
                      <p style={{ fontSize: '14px', fontWeight: 600, color: 'var(--gray-900)', marginBottom: '2px' }}>
                        {selectedPostulacion.negocio?.nombreNegocio}
                      </p>
                      {selectedPostulacion.negocio?.categoria?.nombre && (
                        <span style={{
                          display: 'inline-block', padding: '2px 8px',
                          background: 'var(--gray-100)', color: 'var(--gray-600)',
                          borderRadius: '99px', fontSize: '11px', fontWeight: 600,
                          fontFamily: "'Plus Jakarta Sans', sans-serif",
                        }}>
                          {selectedPostulacion.negocio.categoria.nombre}
                        </span>
                      )}
                    </InfoBlock>

                    <InfoBlock titulo="Estado" icon={Tag}>
                      <EstadoBadgeLarge estado={selectedPostulacion.estado} />
                    </InfoBlock>

                    <InfoBlock titulo="Fecha de Postulación" icon={Calendar}>
                      <p style={{ fontSize: '14px', color: 'var(--gray-700)', fontFamily: "'DM Sans', sans-serif" }}>
                        {formatDate(selectedPostulacion.fechaPostulacion)}
                      </p>
                    </InfoBlock>
                  </div>

                  {selectedPostulacion.notasAdmin && (
                    <div style={{
                      padding: '14px 16px',
                      background: '#FFFBEB',
                      border: '1px solid #FDE68A',
                      borderRadius: 'var(--radius-md)',
                      display: 'flex', gap: '10px', alignItems: 'flex-start',
                    }}>
                      <AlertCircle style={{ width: '16px', height: '16px', color: '#D97706', flexShrink: 0, marginTop: '2px' }} />
                      <div>
                        <p style={{
                          fontSize: '12px', fontWeight: 700, color: '#92400E',
                          fontFamily: "'Plus Jakarta Sans', sans-serif",
                          textTransform: 'uppercase', letterSpacing: '0.04em',
                          marginBottom: '4px',
                        }}>Notas Administrativas</p>
                        <p style={{ fontSize: '13px', color: '#78350F', fontFamily: "'DM Sans', sans-serif", lineHeight: 1.5 }}>
                          {selectedPostulacion.notasAdmin}
                        </p>
                      </div>
                    </div>
                  )}

                  {selectedPostulacion.respuestas && selectedPostulacion.respuestas.length > 0 && (
                    <div>
                      <SectionTitle icon={MessageSquare} text="Respuestas del Formulario" />
                      <div style={{ marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        {selectedPostulacion.respuestas.map(respuesta => (
                          <div key={respuesta.id} style={{
                            padding: '14px 16px',
                            background: 'var(--gray-50)',
                            border: '1px solid var(--border)',
                            borderRadius: 'var(--radius-md)',
                          }}>
                            <p style={{
                              fontSize: '12px', fontWeight: 600, color: 'var(--gray-500)',
                              fontFamily: "'DM Sans', sans-serif", marginBottom: '6px',
                            }}>
                              {respuesta.pregunta?.pregunta}
                            </p>
                            <p style={{
                              fontSize: '14px', color: 'var(--gray-900)',
                              fontFamily: "'DM Sans', sans-serif",
                            }}>
                              {respuesta.respuesta || <span style={{ color: 'var(--gray-300)', fontStyle: 'italic' }}>Sin respuesta</span>}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'flex-end',
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
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};

const PostulacionRow = ({ postulacion, formatDate, onVerDetalle }) => {
  const badge = estadoBadge[postulacion.estado] || estadoBadge.pendiente;
  const IconEstado = badge.icon;
  const [hovered, setHovered] = useState(false);

  return (
    <div
      style={{
        background: '#fff',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-lg)',
        boxShadow: hovered ? '0 4px 16px rgba(0,0,0,0.08)' : 'var(--shadow-sm)',
        transition: 'all 200ms ease',
        overflow: 'hidden',
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div style={{
        height: '3px',
        background: badge.bg === '#ECFDF5'
          ? 'linear-gradient(90deg, #059669, #34D399)'
          : badge.bg === '#FEF2F2'
            ? 'linear-gradient(90deg, #DC2626, #FCA5A5)'
            : badge.bg === '#F5F3FF'
              ? 'linear-gradient(90deg, #7C3AED, #A78BFA)'
              : badge.bg === '#EFF6FF'
                ? 'linear-gradient(90deg, #1D4ED8, #60A5FA)'
                : 'linear-gradient(90deg, #D97706, #FCD34D)',
      }} />
      <div style={{ padding: '18px 20px', display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
        <div style={{
          width: '42px', height: '42px', flexShrink: 0,
          borderRadius: 'var(--radius-md)',
          background: badge.bg,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <IconEstado style={{ width: '20px', height: '20px', color: badge.color }} />
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '8px', marginBottom: '6px' }}>
            <h3 style={{
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              fontSize: '15px', fontWeight: 700,
              color: 'var(--gray-900)',
              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            }}>
              {postulacion.programa?.nombre}
            </h3>
            <span style={{
              padding: '3px 10px',
              background: badge.bg,
              color: badge.color,
              borderRadius: '99px',
              fontSize: '11px', fontWeight: 700,
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              letterSpacing: '0.03em',
              whiteSpace: 'nowrap',
            }}>
              {badge.label}
            </span>
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Building2 style={{ width: '13px', height: '13px', color: 'var(--gray-400)', flexShrink: 0 }} />
              <span style={{ fontSize: '13px', color: 'var(--gray-600)', fontFamily: "'DM Sans', sans-serif" }}>
                {postulacion.negocio?.nombreNegocio}
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Calendar style={{ width: '13px', height: '13px', color: 'var(--gray-400)', flexShrink: 0 }} />
              <span style={{ fontSize: '13px', color: 'var(--gray-500)', fontFamily: "'DM Sans', sans-serif" }}>
                {formatDate(postulacion.fechaPostulacion)}
              </span>
            </div>
          </div>

          {postulacion.notasAdmin && (
            <div style={{
              marginTop: '10px',
              padding: '8px 12px',
              background: '#FFFBEB',
              border: '1px solid #FDE68A',
              borderRadius: 'var(--radius-sm)',
              display: 'flex', alignItems: 'flex-start', gap: '6px',
            }}>
              <AlertCircle style={{ width: '13px', height: '13px', color: '#D97706', flexShrink: 0, marginTop: '1px' }} />
              <p style={{ fontSize: '12px', color: '#78350F', fontFamily: "'DM Sans', sans-serif", lineHeight: 1.4 }}>
                {postulacion.notasAdmin}
              </p>
            </div>
          )}
        </div>

        <button
          onClick={onVerDetalle}
          style={{
            display: 'flex', alignItems: 'center', gap: '6px',
            padding: '8px 14px',
            background: '#EEF4FF',
            border: 'none',
            borderRadius: 'var(--radius-md)',
            color: 'var(--capyme-blue-mid)',
            fontSize: '13px', fontWeight: 600,
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            cursor: 'pointer',
            whiteSpace: 'nowrap',
            flexShrink: 0,
            transition: 'all 150ms ease',
          }}
          onMouseEnter={e => e.currentTarget.style.background = '#DDEAFF'}
          onMouseLeave={e => e.currentTarget.style.background = '#EEF4FF'}
        >
          <Eye style={{ width: '14px', height: '14px' }} />
          Ver Detalle
        </button>
      </div>
    </div>
  );
};

const EstadoBadgeLarge = ({ estado }) => {
  const badge = estadoBadge[estado] || estadoBadge.pendiente;
  const Icon = badge.icon;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: '6px',
      padding: '6px 12px',
      background: badge.bg,
      color: badge.color,
      borderRadius: '99px',
      fontSize: '13px', fontWeight: 700,
      fontFamily: "'Plus Jakarta Sans', sans-serif",
    }}>
      <Icon style={{ width: '14px', height: '14px' }} />
      {badge.label}
    </span>
  );
};

const InfoBlock = ({ titulo, icon: Icon, children }) => (
  <div style={{
    padding: '14px 16px',
    background: 'var(--gray-50)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius-md)',
  }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
      <Icon style={{ width: '13px', height: '13px', color: 'var(--gray-400)' }} />
      <span style={{
        fontSize: '11px', fontWeight: 700, color: 'var(--gray-400)',
        textTransform: 'uppercase', letterSpacing: '0.05em',
        fontFamily: "'Plus Jakarta Sans', sans-serif",
      }}>{titulo}</span>
    </div>
    {children}
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

export default MisPostulaciones;