import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '../components/common/Layout';
import { avisosService } from '../services/avisosService';
import {
  BellRing,
  AlertCircle,
  Info,
  Calendar,
  ArrowLeft,
  Users,
  Link as LinkIcon,
  ExternalLink,
  Clock,
  User,
} from 'lucide-react';
import { toast } from 'react-hot-toast';

const AvisoDetalle = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const authStorage = JSON.parse(localStorage.getItem('auth-storage') || '{}');
  const currentUser = authStorage?.state?.user || {};

  const [aviso, setAviso] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    cargarAviso();
  }, [id]);

  const cargarAviso = async () => {
    try {
      setLoading(true);
      const res = await avisosService.getById(id);
      setAviso(res.data);
    } catch {
      toast.error('No se pudo cargar el aviso');
      navigate(currentUser.rol === 'cliente' ? '/cliente/avisos' : '/avisos');
    } finally {
      setLoading(false);
    }
  };

  const getTipoConfig = (tipo) => {
    const map = {
      urgente:      { bg: '#FEF2F2', color: '#DC2626', label: 'Urgente',      border: '#FECACA' },
      evento:       { bg: '#F5F3FF', color: '#7C3AED', label: 'Evento',       border: '#DDD6FE' },
      recordatorio: { bg: '#FFFBEB', color: '#D97706', label: 'Recordatorio', border: '#FDE68A' },
      informativo:  { bg: 'var(--capyme-blue-pale)', color: 'var(--capyme-blue-mid)', label: 'Informativo', border: '#BFDBFE' },
    };
    return map[tipo] || map.informativo;
  };

  const getDestinatarioConfig = (dest) => {
    const map = {
      todos:          { bg: 'var(--gray-100)', color: 'var(--gray-600)', label: 'Todos' },
      clientes:       { bg: '#F0FDF4', color: '#16A34A', label: 'Clientes' },
      colaboradores:  { bg: 'var(--capyme-blue-pale)', color: 'var(--capyme-blue-mid)', label: 'Colaboradores' },
    };
    return map[dest] || map.todos;
  };

  const getTipoIcon = (tipo) => {
    const s = { width: '20px', height: '20px' };
    if (tipo === 'urgente') return <AlertCircle style={s} />;
    if (tipo === 'evento') return <Calendar style={s} />;
    if (tipo === 'recordatorio') return <BellRing style={s} />;
    return <Info style={s} />;
  };

  const formatDate = (date) => {
    if (!date) return null;
    return new Date(date).toLocaleDateString('es-MX', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  const formatDateShort = (date) => {
    if (!date) return null;
    return new Date(date).toLocaleDateString('es-MX', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  const backRoute = currentUser.rol === 'cliente' ? '/cliente/avisos' : '/avisos';

  if (loading) {
    return (
      <Layout>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '300px', flexDirection: 'column', gap: '16px' }}>
          <div style={{ width: '40px', height: '40px', border: '3px solid var(--gray-200)', borderTopColor: 'var(--capyme-blue-mid)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
          <span style={{ fontSize: '14px', color: 'var(--gray-500)', fontFamily: "'DM Sans', sans-serif" }}>Cargando aviso…</span>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      </Layout>
    );
  }

  if (!aviso) return null;

  const tipoConfig = getTipoConfig(aviso.tipo);
  const destConfig = getDestinatarioConfig(aviso.destinatario);
  const expirado = aviso.fechaExpiracion && new Date(aviso.fechaExpiracion) < new Date();

  return (
    <Layout>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } } @keyframes fadeIn { from { opacity:0; transform:translateY(8px);} to {opacity:1; transform:translateY(0);} }`}</style>
      <div style={{ maxWidth: '780px', margin: '0 auto', animation: 'fadeIn 0.3s ease both' }}>

        {/* Back */}
        <button
          onClick={() => navigate(backRoute)}
          style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', marginBottom: '20px', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--gray-500)', fontSize: '14px', fontFamily: "'DM Sans', sans-serif", padding: '6px 0', transition: 'color 150ms ease' }}
          onMouseEnter={e => e.currentTarget.style.color = 'var(--capyme-blue-mid)'}
          onMouseLeave={e => e.currentTarget.style.color = 'var(--gray-500)'}
        >
          <ArrowLeft style={{ width: '16px', height: '16px' }} />
          Volver a avisos
        </button>

        {/* Card principal */}
        <div style={{ background: '#fff', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', overflow: 'hidden', boxShadow: 'var(--shadow-sm)' }}>

          {/* Accent top */}
          <div style={{ height: '5px', background: aviso.activo && !expirado ? `linear-gradient(90deg, ${tipoConfig.color}, ${tipoConfig.color}99)` : 'var(--gray-200)' }} />

          {/* Header card */}
          <div style={{ padding: '28px 32px 24px', borderBottom: '1px solid var(--gray-100)' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
              <div style={{ width: '52px', height: '52px', borderRadius: 'var(--radius-lg)', background: tipoConfig.bg, border: `1px solid ${tipoConfig.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: tipoConfig.color, flexShrink: 0 }}>
                {getTipoIcon(aviso.tipo)}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '8px' }}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '3px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: 700, background: tipoConfig.bg, color: tipoConfig.color, fontFamily: "'Plus Jakarta Sans', sans-serif", textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    {getTipoIcon(aviso.tipo)}
                    {tipoConfig.label}
                  </span>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '3px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: 700, background: destConfig.bg, color: destConfig.color, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                    <Users style={{ width: '10px', height: '10px' }} />
                    {destConfig.label}
                  </span>
                  {!aviso.activo && (
                    <span style={{ padding: '3px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: 700, background: '#FEF2F2', color: '#DC2626', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                      Inactivo
                    </span>
                  )}
                  {expirado && (
                    <span style={{ padding: '3px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: 700, background: 'var(--gray-100)', color: 'var(--gray-500)', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                      Expirado
                    </span>
                  )}
                </div>
                <h1 style={{ fontSize: '22px', fontWeight: 800, color: 'var(--gray-900)', fontFamily: "'Plus Jakarta Sans', sans-serif", margin: 0, lineHeight: 1.3 }}>
                  {aviso.titulo}
                </h1>
              </div>
            </div>
          </div>

          {/* Contenido */}
          <div style={{ padding: '28px 32px' }}>
            <p style={{ fontSize: '15px', color: 'var(--gray-700)', fontFamily: "'DM Sans', sans-serif", lineHeight: 1.75, margin: 0, whiteSpace: 'pre-wrap' }}>
              {aviso.contenido}
            </p>

            {aviso.linkExterno && (
              <a
                href={aviso.linkExterno}
                target="_blank"
                rel="noopener noreferrer"
                style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', marginTop: '24px', padding: '10px 18px', background: 'linear-gradient(135deg, var(--capyme-blue-mid), var(--capyme-blue))', color: '#fff', borderRadius: 'var(--radius-md)', fontSize: '14px', fontWeight: 600, fontFamily: "'DM Sans', sans-serif", textDecoration: 'none', boxShadow: '0 2px 8px rgba(31,78,158,0.25)', transition: 'opacity 150ms ease' }}
                onMouseEnter={e => e.currentTarget.style.opacity = '0.9'}
                onMouseLeave={e => e.currentTarget.style.opacity = '1'}
              >
                <ExternalLink style={{ width: '15px', height: '15px' }} />
                Ver enlace externo
              </a>
            )}
          </div>

          {/* Meta info footer */}
          <div style={{ padding: '16px 32px 24px', background: 'var(--gray-50)', borderTop: '1px solid var(--gray-100)', display: 'flex', flexWrap: 'wrap', gap: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Clock style={{ width: '14px', height: '14px', color: 'var(--gray-400)' }} />
              <span style={{ fontSize: '12px', color: 'var(--gray-500)', fontFamily: "'DM Sans', sans-serif" }}>
                Publicado: <strong style={{ color: 'var(--gray-700)' }}>{formatDate(aviso.fechaPublicacion)}</strong>
              </span>
            </div>

            {aviso.fechaExpiracion && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Calendar style={{ width: '14px', height: '14px', color: expirado ? '#DC2626' : 'var(--gray-400)' }} />
                <span style={{ fontSize: '12px', color: expirado ? '#DC2626' : 'var(--gray-500)', fontFamily: "'DM Sans', sans-serif" }}>
                  Expira: <strong>{formatDateShort(aviso.fechaExpiracion)}</strong>
                </span>
              </div>
            )}

            {aviso.creador && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ width: '22px', height: '22px', background: 'linear-gradient(135deg, var(--capyme-blue-mid), var(--capyme-blue))', borderRadius: 'var(--radius-sm)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span style={{ fontSize: '9px', fontWeight: 700, color: '#fff', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                    {aviso.creador.nombre?.[0]}{aviso.creador.apellido?.[0]}
                  </span>
                </div>
                <span style={{ fontSize: '12px', color: 'var(--gray-500)', fontFamily: "'DM Sans', sans-serif" }}>
                  Creado por: <strong style={{ color: 'var(--gray-700)' }}>{aviso.creador.nombre} {aviso.creador.apellido}</strong>
                </span>
              </div>
            )}

            {aviso.actualizadoPorUsuario && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <User style={{ width: '14px', height: '14px', color: 'var(--gray-400)' }} />
                <span style={{ fontSize: '12px', color: 'var(--gray-500)', fontFamily: "'DM Sans', sans-serif" }}>
                  Actualizado por: <strong style={{ color: 'var(--gray-700)' }}>{aviso.actualizadoPorUsuario.nombre} {aviso.actualizadoPorUsuario.apellido}</strong>
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Volver */}
        <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'flex-start' }}>
          <button
            onClick={() => navigate(backRoute)}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '9px 18px', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', background: '#fff', color: 'var(--gray-700)', fontSize: '14px', fontWeight: 600, fontFamily: "'DM Sans', sans-serif", cursor: 'pointer', transition: 'all 150ms ease' }}
            onMouseEnter={e => e.currentTarget.style.background = 'var(--gray-100)'}
            onMouseLeave={e => e.currentTarget.style.background = '#fff'}
          >
            <ArrowLeft style={{ width: '15px', height: '15px' }} />
            Volver a avisos
          </button>
        </div>
      </div>
    </Layout>
  );
};

export default AvisoDetalle;