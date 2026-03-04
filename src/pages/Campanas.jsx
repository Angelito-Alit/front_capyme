import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import {
  Search, Plus, TrendingUp, Users, Clock, ChevronRight,
  Target, ArrowLeft, Heart, Share2, CheckCircle, AlertCircle,
  Eye, Edit2, ToggleLeft, ToggleRight, ChevronDown, X,
  DollarSign, Calendar, Building2, Megaphone, FileText, Star,
} from 'lucide-react';
import Layout from '../components/common/Layout';
import { campanasService } from '../services/campanasService';
import { negociosService } from '../services/negociosService';
import { inversionesService } from '../services/inversionesService';

const ESTADO_INFO = {
  en_revision:  { label: 'En revisión',  bg: '#FEF9C3', color: '#854D0E', dot: '#F59E0B' },
  aprobada:     { label: 'Aprobada',     bg: '#DCFCE7', color: '#14532D', dot: '#22C55E' },
  rechazada:    { label: 'Rechazada',    bg: '#FEE2E2', color: '#991B1B', dot: '#EF4444' },
  activa:       { label: 'Activa',       bg: '#DBEAFE', color: '#1E3A8A', dot: '#3B82F6' },
  pausada:      { label: 'Pausada',      bg: '#F3F4F6', color: '#374151', dot: '#9CA3AF' },
  completada:   { label: 'Completada',   bg: '#F0FDF4', color: '#14532D', dot: '#10B981' },
  cancelada:    { label: 'Cancelada',    bg: '#FEF2F2', color: '#991B1B', dot: '#EF4444' },
};

const ESTADOS_LISTA = ['en_revision','aprobada','rechazada','activa','pausada','completada','cancelada'];

const initialFormData = {
  titulo: '', descripcion: '', historia: '',
  negocioId: '', metaRecaudacion: '',
  fechaInicio: '', fechaCierre: '',
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
const fmtCurrency = (v) =>
  new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN', maximumFractionDigits: 0 }).format(v || 0);

const fmtDate = (d) =>
  d ? new Date(d).toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

const diasRestantes = (cierre) => {
  if (!cierre) return null;
  const diff = new Date(cierre) - new Date();
  const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
  return days > 0 ? days : 0;
};

const pct = (recaudado, meta) => {
  if (!meta || parseFloat(meta) === 0) return 0;
  return Math.min(100, Math.round((parseFloat(recaudado) / parseFloat(meta)) * 100));
};

// ─── Card de campaña ──────────────────────────────────────────────────────────
const CampanaCard = ({ campana, onClick, onEdit, onToggleEstado, onToggleActivo, esAdmin, esColaborador }) => {
  const [hovered, setHovered] = useState(false);
  const porcentaje = pct(campana.montoRecaudado, campana.metaRecaudacion);
  const dias = diasRestantes(campana.fechaCierre);
  const estado = ESTADO_INFO[campana.estado] || ESTADO_INFO.en_revision;
  const esVisible = campana.activo;

  const colores = [
    ['#667EEA', '#764BA2'], ['#11998E', '#38EF7D'],
    ['#F093FB', '#F5576C'], ['#4FACFE', '#00F2FE'],
    ['#43E97B', '#38F9D7'], ['#FA709A', '#FEE140'],
    ['#A18CD1', '#FBC2EB'], ['#0BA360', '#3CBA92'],
  ];
  const gradIdx = campana.id % colores.length;
  const [c1, c2] = colores[gradIdx];

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        borderRadius: '16px',
        border: '1px solid var(--border)',
        overflow: 'hidden',
        background: '#fff',
        transition: 'all 250ms cubic-bezier(0.34, 1.2, 0.64, 1)',
        transform: hovered ? 'translateY(-6px)' : 'translateY(0)',
        boxShadow: hovered
          ? '0 20px 40px rgba(0,0,0,0.12)'
          : '0 2px 8px rgba(0,0,0,0.06)',
        cursor: 'pointer',
        opacity: esVisible ? 1 : 0.55,
        display: 'flex', flexDirection: 'column',
      }}
    >
      {/* Portada de colores */}
      <div
        onClick={onClick}
        style={{
          height: '140px',
          background: `linear-gradient(135deg, ${c1}, ${c2})`,
          position: 'relative',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        <div style={{
          width: '56px', height: '56px', borderRadius: '16px',
          background: 'rgba(255,255,255,0.2)',
          backdropFilter: 'blur(10px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          border: '1px solid rgba(255,255,255,0.3)',
        }}>
          <Megaphone style={{ width: '26px', height: '26px', color: '#fff' }} />
        </div>
        <div style={{ position: 'absolute', top: '12px', left: '12px' }}>
          <span style={{
            padding: '4px 10px', borderRadius: '99px',
            fontSize: '11px', fontWeight: 700,
            background: 'rgba(255,255,255,0.9)',
            color: estado.color, fontFamily: "'DM Sans', sans-serif",
            display: 'inline-flex', alignItems: 'center', gap: '5px',
          }}>
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: estado.dot, display: 'inline-block' }} />
            {estado.label}
          </span>
        </div>
        {(esAdmin || esColaborador) && (
          <div style={{ position: 'absolute', top: '10px', right: '10px', display: 'flex', gap: '4px' }}>
            <button
              onClick={(e) => { e.stopPropagation(); onEdit(); }}
              style={{
                width: '30px', height: '30px', borderRadius: '8px',
                background: 'rgba(255,255,255,0.9)', border: 'none',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer',
              }}
              title="Editar campaña"
            >
              <Edit2 style={{ width: '13px', height: '13px', color: 'var(--gray-600)' }} />
            </button>
            {esAdmin && (
              <button
                onClick={(e) => { e.stopPropagation(); onToggleActivo(); }}
                style={{
                  width: '30px', height: '30px', borderRadius: '8px',
                  background: 'rgba(255,255,255,0.9)', border: 'none',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: 'pointer',
                }}
                title={esVisible ? 'Desactivar' : 'Activar'}
              >
                {esVisible
                  ? <ToggleRight style={{ width: '14px', height: '14px', color: '#10B981' }} />
                  : <ToggleLeft  style={{ width: '14px', height: '14px', color: '#9CA3AF' }} />
                }
              </button>
            )}
          </div>
        )}
      </div>

      {/* Cuerpo */}
      <div onClick={onClick} style={{ padding: '16px', flex: 1, display: 'flex', flexDirection: 'column' }}>
        <div style={{ fontSize: '11px', color: 'var(--gray-400)', fontFamily: "'DM Sans', sans-serif", marginBottom: '4px' }}>
          {campana.negocio?.nombreNegocio}
        </div>
        <h3 style={{
          fontSize: '15px', fontWeight: 800, color: 'var(--gray-900)',
          fontFamily: "'Plus Jakarta Sans', sans-serif",
          margin: '0 0 8px', lineHeight: 1.3,
          display: '-webkit-box', WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical', overflow: 'hidden',
        }}>
          {campana.titulo}
        </h3>
        <p style={{
          fontSize: '12px', color: 'var(--gray-500)', fontFamily: "'DM Sans', sans-serif",
          margin: '0 0 14px', lineHeight: 1.5, flex: 1,
          display: '-webkit-box', WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical', overflow: 'hidden',
        }}>
          {campana.descripcion || 'Sin descripción'}
        </p>

        {/* Barra de progreso */}
        <div style={{ marginBottom: '12px' }}>
          <div style={{
            height: '6px', borderRadius: '99px',
            background: 'var(--gray-100)', overflow: 'hidden',
          }}>
            <div style={{
              height: '100%', borderRadius: '99px',
              background: porcentaje >= 100
                ? 'linear-gradient(90deg, #10B981, #059669)'
                : `linear-gradient(90deg, ${c1}, ${c2})`,
              width: `${porcentaje}%`,
              transition: 'width 800ms cubic-bezier(0.34,1,0.64,1)',
            }} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '6px' }}>
            <span style={{ fontSize: '13px', fontWeight: 800, color: 'var(--gray-900)', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
              {fmtCurrency(campana.montoRecaudado)}
            </span>
            <span style={{ fontSize: '12px', fontWeight: 700, color: porcentaje >= 100 ? '#10B981' : 'var(--capyme-blue-mid)', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
              {porcentaje}%
            </span>
          </div>
          <div style={{ fontSize: '11px', color: 'var(--gray-400)', fontFamily: "'DM Sans', sans-serif" }}>
            meta: {fmtCurrency(campana.metaRecaudacion)}
          </div>
        </div>

        {/* Stats */}
        <div style={{ display: 'flex', gap: '12px', paddingTop: '12px', borderTop: '1px solid var(--gray-100)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Users style={{ width: '12px', height: '12px', color: 'var(--gray-400)' }} />
            <span style={{ fontSize: '11px', color: 'var(--gray-500)', fontFamily: "'DM Sans', sans-serif" }}>
              {campana._count?.inversiones ?? campana.inversiones?.length ?? 0} inversores
            </span>
          </div>
          {dias !== null && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Clock style={{ width: '12px', height: '12px', color: dias <= 7 ? '#EF4444' : 'var(--gray-400)' }} />
              <span style={{ fontSize: '11px', color: dias <= 7 ? '#EF4444' : 'var(--gray-500)', fontFamily: "'DM Sans', sans-serif", fontWeight: dias <= 7 ? 700 : 400 }}>
                {dias === 0 ? 'Finalizada' : `${dias} días`}
              </span>
            </div>
          )}
          {esAdmin && (
            <button
              onClick={(e) => { e.stopPropagation(); onToggleEstado(); }}
              style={{
                marginLeft: 'auto', padding: '3px 10px',
                border: '1.5px solid var(--border)',
                borderRadius: '6px', background: 'transparent',
                fontSize: '11px', fontWeight: 600, color: 'var(--gray-600)',
                cursor: 'pointer', fontFamily: "'DM Sans', sans-serif",
                display: 'flex', alignItems: 'center', gap: '4px',
              }}
            >
              Estado <ChevronDown style={{ width: '11px', height: '11px' }} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

// ─── Detalle de campaña ───────────────────────────────────────────────────────
const CampanaDetalle = ({ campana, currentUser, onBack, onInvertir }) => {
  const porcentaje = pct(campana.montoRecaudado, campana.metaRecaudacion);
  const dias = diasRestantes(campana.fechaCierre);
  const estado = ESTADO_INFO[campana.estado] || ESTADO_INFO.en_revision;
  const [inversores, setInversores] = useState([]);
  const [loadingInv, setLoadingInv] = useState(true);

  const colores = [
    ['#667EEA', '#764BA2'], ['#11998E', '#38EF7D'],
    ['#F093FB', '#F5576C'], ['#4FACFE', '#00F2FE'],
    ['#43E97B', '#38F9D7'], ['#FA709A', '#FEE140'],
  ];
  const [c1, c2] = colores[campana.id % colores.length];

  useEffect(() => {
    inversionesService.getByCampana(campana.id)
      .then((r) => setInversores(r.data || []))
      .catch(() => {})
      .finally(() => setLoadingInv(false));
  }, [campana.id]);

  const puedeInvertir = campana.activo && (campana.estado === 'aprobada' || campana.estado === 'activa');
  const esDueno = currentUser.rol === 'cliente' && campana.negocio?.usuarioId === currentUser.id;

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', padding: '0 0 48px' }}>
      <button
        onClick={onBack}
        style={{
          display: 'inline-flex', alignItems: 'center', gap: '6px',
          padding: '8px 0', background: 'none', border: 'none',
          color: 'var(--gray-500)', fontSize: '13px', cursor: 'pointer',
          fontFamily: "'DM Sans', sans-serif", marginBottom: '20px',
        }}
      >
        <ArrowLeft style={{ width: '15px', height: '15px' }} /> Volver a campañas
      </button>

      {/* Hero banner */}
      <div style={{
        height: '260px', borderRadius: '20px', marginBottom: '28px',
        background: `linear-gradient(135deg, ${c1}, ${c2})`,
        position: 'relative', overflow: 'hidden',
        display: 'flex', alignItems: 'flex-end',
      }}>
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(to top, rgba(0,0,0,0.5), transparent)',
        }} />
        <div style={{ position: 'relative', padding: '28px', width: '100%' }}>
          <div style={{ marginBottom: '8px' }}>
            <span style={{
              padding: '4px 12px', borderRadius: '99px',
              fontSize: '11px', fontWeight: 700,
              background: 'rgba(255,255,255,0.2)',
              backdropFilter: 'blur(8px)',
              color: '#fff', border: '1px solid rgba(255,255,255,0.3)',
              fontFamily: "'DM Sans', sans-serif",
              display: 'inline-flex', alignItems: 'center', gap: '5px',
            }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: estado.dot, display: 'inline-block' }} />
              {estado.label}
            </span>
          </div>
          <h1 style={{
            fontSize: '26px', fontWeight: 900, color: '#fff',
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            margin: '0 0 4px', textShadow: '0 2px 8px rgba(0,0,0,0.2)',
          }}>
            {campana.titulo}
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '13px', margin: 0, fontFamily: "'DM Sans', sans-serif" }}>
            por {campana.negocio?.nombreNegocio}
          </p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '28px', alignItems: 'start' }}>

        {/* Columna izquierda */}
        <div>
          {campana.descripcion && (
            <div style={{ marginBottom: '28px' }}>
              <h2 style={{ fontSize: '16px', fontWeight: 800, color: 'var(--gray-900)', fontFamily: "'Plus Jakarta Sans', sans-serif", margin: '0 0 10px' }}>
                Sobre este proyecto
              </h2>
              <p style={{ fontSize: '14px', color: 'var(--gray-600)', lineHeight: 1.7, fontFamily: "'DM Sans', sans-serif", margin: 0 }}>
                {campana.descripcion}
              </p>
            </div>
          )}

          {campana.historia && (
            <div style={{
              padding: '20px', borderRadius: '14px',
              background: 'linear-gradient(135deg, var(--capyme-blue-pale), #F0FDF4)',
              border: '1px solid var(--border)', marginBottom: '28px',
            }}>
              <h2 style={{ fontSize: '16px', fontWeight: 800, color: 'var(--gray-900)', fontFamily: "'Plus Jakarta Sans', sans-serif", margin: '0 0 10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Star style={{ width: '16px', height: '16px', color: 'var(--capyme-blue-mid)' }} />
                Nuestra historia
              </h2>
              <p style={{ fontSize: '14px', color: 'var(--gray-600)', lineHeight: 1.7, fontFamily: "'DM Sans', sans-serif", margin: 0, whiteSpace: 'pre-line' }}>
                {campana.historia}
              </p>
            </div>
          )}

          {/* Lista de inversores */}
          <div>
            <h2 style={{ fontSize: '16px', fontWeight: 800, color: 'var(--gray-900)', fontFamily: "'Plus Jakarta Sans', sans-serif", margin: '0 0 14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Users style={{ width: '16px', height: '16px', color: 'var(--gray-400)' }} />
              Inversores ({inversores.filter(i => i.estadoPago === 'confirmado').length})
            </h2>
            {loadingInv ? (
              <div style={{ textAlign: 'center', padding: '24px', color: 'var(--gray-400)', fontSize: '13px', fontFamily: "'DM Sans', sans-serif" }}>Cargando...</div>
            ) : inversores.filter(i => i.estadoPago === 'confirmado').length === 0 ? (
              <div style={{
                padding: '24px', borderRadius: '12px', border: '1.5px dashed var(--border)',
                textAlign: 'center', color: 'var(--gray-400)', fontSize: '13px', fontFamily: "'DM Sans', sans-serif",
              }}>
                Sé el primero en invertir en esta campaña 🚀
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {inversores.filter(i => i.estadoPago === 'confirmado').map((inv) => {
                  const iniciales = `${inv.inversor?.nombre?.[0] || ''}${inv.inversor?.apellido?.[0] || ''}`.toUpperCase();
                  const esMio = inv.inversorId === currentUser.id;
                  return (
                    <div key={inv.id} style={{
                      display: 'flex', alignItems: 'center', gap: '12px',
                      padding: '10px 14px', borderRadius: '10px',
                      background: esMio ? 'linear-gradient(135deg, var(--capyme-blue-pale), #F0FDF4)' : 'var(--gray-50)',
                      border: `1px solid ${esMio ? 'var(--capyme-blue-mid)' : 'transparent'}`,
                    }}>
                      <div style={{
                        width: '34px', height: '34px', borderRadius: '10px', flexShrink: 0,
                        background: `linear-gradient(135deg, ${c1}, ${c2})`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: '#fff', fontSize: '12px', fontWeight: 700, fontFamily: "'Plus Jakarta Sans', sans-serif",
                      }}>
                        {iniciales}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--gray-900)', fontFamily: "'DM Sans', sans-serif" }}>
                          {esMio && !esDueno ? 'Tú' : `${inv.inversor?.nombre} ${inv.inversor?.apellido?.[0]}.`}
                          {esMio && <span style={{ marginLeft: '6px', fontSize: '10px', color: 'var(--capyme-blue-mid)', fontWeight: 700 }}>TÚ</span>}
                        </div>
                        <div style={{ fontSize: '11px', color: 'var(--gray-400)', fontFamily: "'DM Sans', sans-serif" }}>
                          {fmtDate(inv.fechaCreacion)}
                        </div>
                      </div>
                      <div style={{ fontSize: '14px', fontWeight: 800, color: 'var(--gray-900)', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                        {fmtCurrency(inv.monto)}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Columna derecha — panel de apoyo */}
        <div style={{ position: 'sticky', top: '20px' }}>
          <div style={{
            borderRadius: '16px', border: '1px solid var(--border)',
            background: '#fff', padding: '20px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
          }}>
            <div style={{ marginBottom: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '4px' }}>
                <span style={{ fontSize: '22px', fontWeight: 900, color: 'var(--gray-900)', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                  {fmtCurrency(campana.montoRecaudado)}
                </span>
                <span style={{ fontSize: '13px', fontWeight: 700, color: porcentaje >= 100 ? '#10B981' : 'var(--capyme-blue-mid)', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                  {porcentaje}%
                </span>
              </div>
              <div style={{ fontSize: '12px', color: 'var(--gray-400)', fontFamily: "'DM Sans', sans-serif", marginBottom: '10px' }}>
                de {fmtCurrency(campana.metaRecaudacion)} meta
              </div>
              <div style={{ height: '8px', borderRadius: '99px', background: 'var(--gray-100)', overflow: 'hidden' }}>
                <div style={{
                  height: '100%', borderRadius: '99px',
                  background: porcentaje >= 100
                    ? 'linear-gradient(90deg, #10B981, #059669)'
                    : `linear-gradient(90deg, ${c1}, ${c2})`,
                  width: `${porcentaje}%`,
                  transition: 'width 1s ease',
                }} />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '20px' }}>
              {[
                { icon: Users, label: 'Inversores', value: inversores.filter(i => i.estadoPago === 'confirmado').length },
                { icon: Clock, label: dias === 0 ? 'Finalizada' : 'Días restantes', value: dias === 0 ? '—' : dias ?? '—', red: dias !== null && dias <= 7 && dias > 0 },
                { icon: Calendar, label: 'Inicio', value: fmtDate(campana.fechaInicio) },
                { icon: Target, label: 'Cierre', value: fmtDate(campana.fechaCierre) },
              ].map(({ icon: Icon, label, value, red }) => (
                <div key={label} style={{
                  padding: '10px', borderRadius: '10px',
                  background: 'var(--gray-50)', border: '1px solid var(--gray-100)',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '2px' }}>
                    <Icon style={{ width: '11px', height: '11px', color: red ? '#EF4444' : 'var(--gray-400)' }} />
                    <span style={{ fontSize: '10px', color: 'var(--gray-400)', fontFamily: "'DM Sans', sans-serif", textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</span>
                  </div>
                  <div style={{ fontSize: '13px', fontWeight: 700, color: red ? '#EF4444' : 'var(--gray-900)', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                    {value}
                  </div>
                </div>
              ))}
            </div>

            {!esDueno && puedeInvertir && (
              <button
                onClick={onInvertir}
                style={{
                  width: '100%', padding: '13px',
                  background: `linear-gradient(135deg, ${c1}, ${c2})`,
                  border: 'none', borderRadius: '12px',
                  color: '#fff', fontSize: '14px', fontWeight: 800,
                  cursor: 'pointer', fontFamily: "'Plus Jakarta Sans', sans-serif",
                  letterSpacing: '0.02em',
                  boxShadow: `0 4px 16px rgba(0,0,0,0.2)`,
                  transition: 'all 200ms ease',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.02)'; e.currentTarget.style.boxShadow = '0 6px 20px rgba(0,0,0,0.25)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = `0 4px 16px rgba(0,0,0,0.2)`; }}
              >
                <Heart style={{ width: '16px', height: '16px' }} />
                Apoyar esta campaña
              </button>
            )}
            {esDueno && (
              <div style={{
                padding: '12px', borderRadius: '10px',
                background: 'var(--capyme-blue-pale)', border: '1px solid var(--capyme-blue-mid)',
                textAlign: 'center', fontSize: '12px', color: 'var(--capyme-blue-mid)',
                fontFamily: "'DM Sans', sans-serif", fontWeight: 600,
              }}>
                Esta es tu campaña — solo lectura
              </div>
            )}
            {!puedeInvertir && !esDueno && (
              <div style={{
                padding: '12px', borderRadius: '10px',
                background: 'var(--gray-50)', border: '1px solid var(--border)',
                textAlign: 'center', fontSize: '12px', color: 'var(--gray-500)',
                fontFamily: "'DM Sans', sans-serif",
              }}>
                Esta campaña no está abierta para inversiones
              </div>
            )}

            <div style={{ marginTop: '12px', display: 'flex', gap: '8px' }}>
              <button style={{
                flex: 1, padding: '9px', border: '1.5px solid var(--border)',
                borderRadius: '10px', background: '#fff',
                fontSize: '12px', color: 'var(--gray-600)', cursor: 'pointer',
                fontFamily: "'DM Sans', sans-serif", fontWeight: 600,
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px',
              }}>
                <Share2 style={{ width: '13px', height: '13px' }} /> Compartir
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── Modal de campaña (crear/editar) ─────────────────────────────────────────
const CampanaModal = ({ mode, campana, negocios, currentUser, onClose, onSave }) => {
  const esCliente = currentUser.rol === 'cliente';
  const [formData, setFormData] = useState(
    mode === 'edit' && campana ? {
      titulo: campana.titulo || '',
      descripcion: campana.descripcion || '',
      historia: campana.historia || '',
      negocioId: campana.negocioId || '',
      metaRecaudacion: campana.metaRecaudacion || '',
      fechaInicio: campana.fechaInicio ? campana.fechaInicio.slice(0, 10) : '',
      fechaCierre: campana.fechaCierre ? campana.fechaCierre.slice(0, 10) : '',
    } : initialFormData
  );
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  const metaBloqueada = mode === 'edit' && esCliente && parseFloat(campana?.montoRecaudado || 0) > 0;

  const validate = () => {
    const e = {};
    if (!formData.titulo || formData.titulo.length < 3) e.titulo = 'Mínimo 3 caracteres';
    if (!formData.negocioId) e.negocioId = 'Selecciona un negocio';
    if (!formData.metaRecaudacion || parseFloat(formData.metaRecaudacion) <= 0) e.metaRecaudacion = 'Ingresa una meta válida';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setSaving(true);
    try {
      await onSave(formData);
    } finally {
      setSaving(false);
    }
  };

  const inp = {
    width: '100%', padding: '10px 12px',
    border: '1px solid var(--border)', borderRadius: '10px',
    fontSize: '14px', fontFamily: "'DM Sans', sans-serif",
    color: 'var(--gray-900)', background: '#fff',
    outline: 'none', boxSizing: 'border-box',
  };
  const lbl = { display: 'block', fontSize: '12px', fontWeight: 700, color: 'var(--gray-600)', marginBottom: '5px', fontFamily: "'DM Sans', sans-serif" };
  const err = (k) => errors[k] ? <p style={{ margin: '4px 0 0', fontSize: '11px', color: '#EF4444', fontFamily: "'DM Sans', sans-serif", display: 'flex', alignItems: 'center', gap: '4px' }}><AlertCircle style={{ width: '11px', height: '11px' }} />{errors[k]}</p> : null;

  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(5px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
      <div onClick={(e) => e.stopPropagation()} style={{ background: '#fff', borderRadius: '20px', width: '100%', maxWidth: '620px', maxHeight: '90vh', display: 'flex', flexDirection: 'column', boxShadow: '0 24px 64px rgba(0,0,0,0.2)' }}>
        <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--gray-900)', fontFamily: "'Plus Jakarta Sans', sans-serif", margin: 0 }}>
            {mode === 'create' ? '🚀 Nueva campaña' : '✏️ Editar campaña'}
          </h2>
          <button onClick={onClose} style={{ width: '32px', height: '32px', border: 'none', background: 'var(--gray-100)', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <X style={{ width: '15px', height: '15px', color: 'var(--gray-500)' }} />
          </button>
        </div>
        <div style={{ overflowY: 'auto', flex: 1, padding: '24px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <div style={{ gridColumn: '1 / -1' }}>
            <label style={lbl}>Título de la campaña *</label>
            <input value={formData.titulo} onChange={(e) => setFormData(p => ({ ...p, titulo: e.target.value }))} placeholder="Ej. Expansión de mi panadería artesanal" style={{ ...inp, ...(errors.titulo ? { borderColor: '#EF4444' } : {}) }} />
            {err('titulo')}
          </div>
          <div style={{ gridColumn: '1 / -1' }}>
            <label style={lbl}>Negocio *</label>
            <select
              value={formData.negocioId}
              onChange={(e) => setFormData(p => ({ ...p, negocioId: e.target.value }))}
              disabled={mode === 'edit' && esCliente}
              style={{ ...inp, appearance: 'none', cursor: mode === 'edit' && esCliente ? 'not-allowed' : 'pointer', background: mode === 'edit' && esCliente ? 'var(--gray-50)' : '#fff', ...(errors.negocioId ? { borderColor: '#EF4444' } : {}) }}
            >
              <option value="">Seleccionar negocio...</option>
              {negocios.map(n => <option key={n.id} value={n.id}>{n.nombreNegocio}</option>)}
            </select>
            {err('negocioId')}
          </div>
          <div style={{ gridColumn: '1 / -1' }}>
            <label style={lbl}>Descripción breve</label>
            <textarea value={formData.descripcion} onChange={(e) => setFormData(p => ({ ...p, descripcion: e.target.value }))} rows={2} placeholder="Un resumen de tu proyecto..." style={{ ...inp, resize: 'vertical' }} />
          </div>
          <div style={{ gridColumn: '1 / -1' }}>
            <label style={lbl}>Historia del proyecto</label>
            <textarea value={formData.historia} onChange={(e) => setFormData(p => ({ ...p, historia: e.target.value }))} rows={3} placeholder="Cuenta la historia de tu negocio, por qué necesitas este financiamiento..." style={{ ...inp, resize: 'vertical' }} />
          </div>
          <div>
            <label style={lbl}>Meta de recaudación (MXN) *</label>
            <input type="number" value={formData.metaRecaudacion} disabled={metaBloqueada} onChange={(e) => setFormData(p => ({ ...p, metaRecaudacion: e.target.value }))} placeholder="0.00" style={{ ...inp, ...(metaBloqueada ? { background: 'var(--gray-50)', cursor: 'not-allowed' } : {}), ...(errors.metaRecaudacion ? { borderColor: '#EF4444' } : {}) }} />
            {metaBloqueada && <p style={{ margin: '3px 0 0', fontSize: '11px', color: 'var(--gray-400)', fontFamily: "'DM Sans', sans-serif" }}>No editable: campaña con fondos recibidos</p>}
            {err('metaRecaudacion')}
          </div>
          <div />
          <div>
            <label style={lbl}>Fecha de inicio</label>
            <input type="date" value={formData.fechaInicio} onChange={(e) => setFormData(p => ({ ...p, fechaInicio: e.target.value }))} style={inp} />
          </div>
          <div>
            <label style={lbl}>Fecha de cierre</label>
            <input type="date" value={formData.fechaCierre} onChange={(e) => setFormData(p => ({ ...p, fechaCierre: e.target.value }))} style={inp} />
          </div>
        </div>
        <div style={{ padding: '16px 24px', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
          <button onClick={onClose} style={{ padding: '10px 20px', border: '1.5px solid var(--border)', borderRadius: '10px', background: '#fff', color: 'var(--gray-700)', fontSize: '13px', fontWeight: 600, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif" }}>
            Cancelar
          </button>
          <button onClick={handleSubmit} disabled={saving} style={{ padding: '10px 24px', background: saving ? 'var(--gray-300)' : 'linear-gradient(135deg, var(--capyme-blue-mid), #4F46E5)', border: 'none', borderRadius: '10px', color: '#fff', fontSize: '13px', fontWeight: 700, cursor: saving ? 'not-allowed' : 'pointer', fontFamily: "'DM Sans', sans-serif", boxShadow: saving ? 'none' : '0 2px 10px rgba(79,70,229,0.3)' }}>
            {saving ? 'Guardando...' : mode === 'create' ? '🚀 Publicar campaña' : 'Guardar cambios'}
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Dropdown de estado ───────────────────────────────────────────────────────
const EstadoDropdown = ({ campana, pos, onSelect, onClose }) => {
  useEffect(() => {
    const fn = () => onClose();
    document.addEventListener('mousedown', fn);
    return () => document.removeEventListener('mousedown', fn);
  }, []);

  return (
    <>
      <div onClick={onClose} style={{ position: 'fixed', inset: 0, zIndex: 9998 }} />
      <div
        onMouseDown={(e) => e.stopPropagation()}
        style={{
          position: 'fixed', top: pos.bottom + 6, left: pos.left,
          zIndex: 9999, background: '#fff',
          border: '1px solid var(--border)', borderRadius: '12px',
          boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
          overflow: 'hidden', minWidth: '180px',
          padding: '6px',
        }}
      >
        <div style={{ padding: '6px 10px 8px', fontSize: '10px', fontWeight: 700, color: 'var(--gray-400)', textTransform: 'uppercase', letterSpacing: '0.06em', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
          Cambiar estado
        </div>
        {ESTADOS_LISTA.map((est) => {
          const info = ESTADO_INFO[est];
          const activo = campana.estado === est;
          return (
            <button key={est} onClick={() => onSelect(est)} style={{
              display: 'flex', alignItems: 'center', gap: '8px', width: '100%',
              padding: '8px 10px', border: 'none',
              background: activo ? info.bg : 'transparent',
              borderRadius: '8px', cursor: 'pointer',
              fontSize: '13px', color: activo ? info.color : 'var(--gray-700)',
              fontFamily: "'DM Sans', sans-serif", fontWeight: activo ? 700 : 400,
              textAlign: 'left',
            }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: info.dot, flexShrink: 0 }} />
              {info.label}
              {activo && <CheckCircle style={{ width: '12px', height: '12px', marginLeft: 'auto' }} />}
            </button>
          );
        })}
      </div>
    </>
  );
};

// ─── PÁGINA PRINCIPAL ─────────────────────────────────────────────────────────
const Campanas = () => {
  const authStorage = JSON.parse(localStorage.getItem('auth-storage') || '{}');
  const currentUser = authStorage?.state?.user || {};

  const [campanas, setCampanas]           = useState([]);
  const [negocios, setNegocios]           = useState([]);
  const [loading, setLoading]             = useState(true);
  const [search, setSearch]               = useState('');
  const [filtroEstado, setFiltroEstado]   = useState('');
  const [vistaDetalle, setVistaDetalle]   = useState(null);
  const [showModal, setShowModal]         = useState(false);
  const [modalMode, setModalMode]         = useState('create');
  const [selectedCampana, setSelectedCampana] = useState(null);
  const [estadoDropdown, setEstadoDropdown]   = useState(null); // { campana, pos }

  const esAdmin       = currentUser.rol === 'admin';
  const esColaborador = currentUser.rol === 'colaborador';
  const esCliente     = currentUser.rol === 'cliente';

  useEffect(() => { cargarDatos(); }, []);

  const cargarDatos = async () => {
    setLoading(true);
    try {
      const [campRes, negRes] = await Promise.all([
        campanasService.getAll(),
        negociosService.getAll(),
      ]);
      setCampanas(campRes.data || []);
      setNegocios(negRes.data || []);
    } catch { toast.error('Error al cargar campañas'); }
    finally { setLoading(false); }
  };

  const negociosDisponibles = esCliente
    ? negocios.filter(n => n.usuarioId === currentUser.id && n.activo)
    : negocios.filter(n => n.activo);

  const campanasFiltradas = campanas.filter(c => {
    const matchSearch = !search ||
      c.titulo?.toLowerCase().includes(search.toLowerCase()) ||
      c.negocio?.nombreNegocio?.toLowerCase().includes(search.toLowerCase());
    const matchEstado = !filtroEstado || c.estado === filtroEstado;
    return matchSearch && matchEstado;
  });

  const handleSaveCampana = async (formData) => {
    try {
      if (modalMode === 'create') {
        await campanasService.create(formData);
        toast.success('¡Campaña publicada exitosamente!');
      } else {
        await campanasService.update(selectedCampana.id, formData);
        toast.success('Campaña actualizada');
      }
      setShowModal(false);
      cargarDatos();
    } catch (e) {
      toast.error(e?.response?.data?.message || 'Error al guardar');
      throw e;
    }
  };

  const handleToggleEstadoSelect = async (campana, nuevoEstado) => {
    try {
      await campanasService.updateEstado(campana.id, nuevoEstado);
      toast.success(`Estado cambiado a "${ESTADO_INFO[nuevoEstado].label}"`);
      setEstadoDropdown(null);
      cargarDatos();
    } catch { toast.error('Error al cambiar estado'); }
  };

  const handleToggleActivo = async (campana) => {
    try {
      await campanasService.toggleActivo(campana.id);
      toast.success(campana.activo ? 'Campaña desactivada' : 'Campaña activada');
      cargarDatos();
    } catch { toast.error('Error al cambiar estado'); }
  };

  if (loading) return (
    <Layout>
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
        <div style={{ width: '40px', height: '40px', border: '3px solid var(--gray-200)', borderTopColor: 'var(--capyme-blue-mid)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      </div>
    </Layout>
  );

  // Vista detalle de campaña
  if (vistaDetalle) {
    return (
      <Layout>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        <div style={{ padding: '28px 24px', maxWidth: '1080px', margin: '0 auto' }}>
          <CampanaDetalle
            campana={vistaDetalle}
            currentUser={currentUser}
            onBack={() => setVistaDetalle(null)}
            onInvertir={() => {
              // Navegación a /inversiones con campaña preseleccionada
              // (o puedes abrir un modal de inversión inline aquí)
              window.location.href = `/inversiones?campanaId=${vistaDetalle.id}`;
            }}
          />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>

      <div style={{ padding: '32px 24px', maxWidth: '1280px', margin: '0 auto' }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '32px', gap: '16px', flexWrap: 'wrap' }}>
          <div>
            <h1 style={{ fontSize: '28px', fontWeight: 900, color: 'var(--gray-900)', fontFamily: "'Plus Jakarta Sans', sans-serif", margin: '0 0 6px' }}>
              Campañas de crowdfunding
            </h1>
            <p style={{ fontSize: '14px', color: 'var(--gray-500)', margin: 0, fontFamily: "'DM Sans', sans-serif" }}>
              {campanasFiltradas.length} campaña{campanasFiltradas.length !== 1 ? 's' : ''} activa{campanasFiltradas.length !== 1 ? 's' : ''} en la plataforma
            </p>
          </div>
          <button
            onClick={() => { setModalMode('create'); setSelectedCampana(null); setShowModal(true); }}
            style={{
              padding: '10px 20px',
              background: 'linear-gradient(135deg, var(--capyme-blue-mid), #4F46E5)',
              border: 'none', borderRadius: '12px',
              color: '#fff', fontSize: '13px', fontWeight: 700,
              cursor: 'pointer', fontFamily: "'Plus Jakarta Sans', sans-serif",
              display: 'flex', alignItems: 'center', gap: '7px',
              boxShadow: '0 4px 14px rgba(79,70,229,0.3)',
              letterSpacing: '0.02em',
            }}
          >
            <Plus style={{ width: '15px', height: '15px' }} />
            Nueva campaña
          </button>
        </div>

        {/* Stats top — solo admin/colaborador */}
        {(esAdmin || esColaborador) && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '12px', marginBottom: '28px' }}>
            {[
              { label: 'Total campañas', value: campanas.length, color: 'var(--capyme-blue-mid)', bg: 'var(--capyme-blue-pale)' },
              { label: 'Activas', value: campanas.filter(c => c.estado === 'activa' || c.estado === 'aprobada').length, color: '#10B981', bg: '#ECFDF5' },
              { label: 'En revisión', value: campanas.filter(c => c.estado === 'en_revision').length, color: '#F59E0B', bg: '#FFFBEB' },
              { label: 'Total recaudado', value: fmtCurrency(campanas.filter(c => c.activo).reduce((a, c) => a + parseFloat(c.montoRecaudado || 0), 0)), color: '#8B5CF6', bg: '#F5F3FF' },
            ].map(stat => (
              <div key={stat.label} style={{ padding: '14px 16px', borderRadius: '12px', background: '#fff', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)' }}>
                <div style={{ fontSize: '18px', fontWeight: 900, color: stat.color, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{stat.value}</div>
                <div style={{ fontSize: '11px', color: 'var(--gray-500)', fontFamily: "'DM Sans', sans-serif", marginTop: '2px' }}>{stat.label}</div>
              </div>
            ))}
          </div>
        )}

        {/* Filtros */}
        <div style={{ display: 'flex', gap: '10px', marginBottom: '24px', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: '200px', position: 'relative' }}>
            <Search style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', width: '15px', height: '15px', color: 'var(--gray-400)' }} />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar campañas..."
              style={{
                width: '100%', padding: '10px 12px 10px 36px',
                border: '1.5px solid var(--border)', borderRadius: '10px',
                fontSize: '14px', fontFamily: "'DM Sans', sans-serif",
                color: 'var(--gray-900)', background: '#fff',
                outline: 'none', boxSizing: 'border-box',
              }}
            />
          </div>
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            {[{ v: '', l: 'Todas' }, ...ESTADOS_LISTA.map(e => ({ v: e, l: ESTADO_INFO[e].label }))].map(({ v, l }) => (
              <button
                key={v}
                onClick={() => setFiltroEstado(v)}
                style={{
                  padding: '8px 14px', borderRadius: '20px',
                  border: filtroEstado === v ? 'none' : '1.5px solid var(--border)',
                  background: filtroEstado === v
                    ? 'linear-gradient(135deg, var(--capyme-blue-mid), #4F46E5)'
                    : '#fff',
                  color: filtroEstado === v ? '#fff' : 'var(--gray-600)',
                  fontSize: '12px', fontWeight: 600, cursor: 'pointer',
                  fontFamily: "'DM Sans', sans-serif",
                  transition: 'all 150ms ease',
                }}
              >
                {l}
              </button>
            ))}
          </div>
        </div>

        {/* Grid de cards */}
        {campanasFiltradas.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 20px' }}>
            <Megaphone style={{ width: '48px', height: '48px', color: 'var(--gray-300)', margin: '0 auto 16px', display: 'block' }} />
            <h3 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--gray-600)', fontFamily: "'Plus Jakarta Sans', sans-serif", margin: '0 0 8px' }}>
              No hay campañas
            </h3>
            <p style={{ fontSize: '14px', color: 'var(--gray-400)', fontFamily: "'DM Sans', sans-serif", margin: '0 0 24px' }}>
              {search ? 'No se encontraron resultados para tu búsqueda' : 'Crea la primera campaña de crowdfunding'}
            </p>
            <button
              onClick={() => { setModalMode('create'); setSelectedCampana(null); setShowModal(true); }}
              style={{
                padding: '10px 24px',
                background: 'linear-gradient(135deg, var(--capyme-blue-mid), #4F46E5)',
                border: 'none', borderRadius: '10px', color: '#fff',
                fontSize: '13px', fontWeight: 700, cursor: 'pointer',
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                boxShadow: '0 4px 14px rgba(79,70,229,0.3)',
              }}
            >
              + Crear campaña
            </button>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
            {campanasFiltradas.map(c => (
              <CampanaCard
                key={c.id}
                campana={c}
                esAdmin={esAdmin}
                esColaborador={esColaborador}
                onClick={() => setVistaDetalle(c)}
                onEdit={() => { setModalMode('edit'); setSelectedCampana(c); setShowModal(true); }}
                onToggleActivo={() => handleToggleActivo(c)}
                onToggleEstado={(e) => {
                  const btn = e.currentTarget;
                  const rect = btn.getBoundingClientRect();
                  setEstadoDropdown({ campana: c, pos: rect });
                }}
              />
            ))}
          </div>
        )}
      </div>

      {/* Modal crear/editar */}
      {showModal && (
        <CampanaModal
          mode={modalMode}
          campana={selectedCampana}
          negocios={negociosDisponibles}
          currentUser={currentUser}
          onClose={() => setShowModal(false)}
          onSave={handleSaveCampana}
        />
      )}

      {/* Dropdown estado */}
      {estadoDropdown && (
        <EstadoDropdown
          campana={estadoDropdown.campana}
          pos={estadoDropdown.pos}
          onSelect={(est) => handleToggleEstadoSelect(estadoDropdown.campana, est)}
          onClose={() => setEstadoDropdown(null)}
        />
      )}
    </Layout>
  );
};

export default Campanas;