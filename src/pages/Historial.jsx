import { useState, useEffect, useCallback } from 'react';
import Layout from '../components/common/Layout';
import api from '../services/axios';
import {
  History,
  Search,
  Filter,
  User,
  RefreshCw,
  Plus,
  Edit,
  Trash2,
  ToggleLeft,
  CreditCard,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Clock,
  Database,
  AlertCircle,
  X,
} from 'lucide-react';
import { toast } from 'react-hot-toast';

/* ─── helpers ─────────────────────────────────────────── */
const ACCION_META = {
  CREATE:         { label: 'Creó',         color: '#16A34A', bg: '#F0FDF4', border: '#BBF7D0', Icon: Plus },
  UPDATE:         { label: 'Actualizó',    color: '#2563EB', bg: '#EFF6FF', border: '#BFDBFE', Icon: Edit },
  DELETE:         { label: 'Eliminó',      color: '#DC2626', bg: '#FEF2F2', border: '#FECACA', Icon: Trash2 },
  TOGGLE_ACTIVO:  { label: 'Cambió estado',color: '#7C3AED', bg: '#F5F3FF', border: '#DDD6FE', Icon: ToggleLeft },
  CAMBIO_ESTADO:  { label: 'Cambió estado',color: '#7C3AED', bg: '#F5F3FF', border: '#DDD6FE', Icon: ToggleLeft },
  CONFIRMAR_PAGO: { label: 'Confirmó pago',color: '#0891B2', bg: '#ECFEFF', border: '#A5F3FC', Icon: CreditCard },
  crear_aviso:    { label: 'Creó aviso',   color: '#16A34A', bg: '#F0FDF4', border: '#BBF7D0', Icon: Plus },
  actualizar_aviso:{ label: 'Editó aviso', color: '#2563EB', bg: '#EFF6FF', border: '#BFDBFE', Icon: Edit },
  activar_aviso:  { label: 'Activó aviso', color: '#16A34A', bg: '#F0FDF4', border: '#BBF7D0', Icon: ToggleLeft },
  desactivar_aviso:{ label: 'Desactivó aviso', color: '#DC2626', bg: '#FEF2F2', border: '#FECACA', Icon: ToggleLeft },
  eliminar_aviso: { label: 'Eliminó aviso',color: '#DC2626', bg: '#FEF2F2', border: '#FECACA', Icon: Trash2 },
};

const getAccionMeta = (accion) =>
  ACCION_META[accion] || { label: accion, color: 'var(--gray-600)', bg: 'var(--gray-100)', border: 'var(--border)', Icon: History };

const TABLA_LABELS = {
  negocios: 'Negocios', programas: 'Programas', postulaciones: 'Postulaciones',
  cursos: 'Cursos', usuarios: 'Usuarios', avisos: 'Avisos',
};

const formatFecha = (d) => {
  if (!d) return '—';
  const fecha = new Date(d);
  return fecha.toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' });
};

const formatHora = (d) => {
  if (!d) return '';
  return new Date(d).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
};

const getRelativo = (d) => {
  if (!d) return '';
  const diff = Date.now() - new Date(d).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1)  return 'hace un momento';
  if (mins < 60) return `hace ${mins} min`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24)  return `hace ${hrs} h`;
  const dias = Math.floor(hrs / 24);
  if (dias < 7)  return `hace ${dias} día${dias > 1 ? 's' : ''}`;
  return formatFecha(d);
};

const getInitials = (nombre, apellido) =>
  `${(nombre || '').charAt(0)}${(apellido || '').charAt(0)}`.toUpperCase();

const ROL_STYLE = {
  admin:       { bg: '#FEF2F2', color: '#DC2626' },
  colaborador: { bg: '#EEF4FF', color: 'var(--capyme-blue-mid)' },
  cliente:     { bg: '#F0FDF4', color: '#16A34A' },
};

/* ─── componente ──────────────────────────────────────── */
const Historial = () => {
  const [registros,   setRegistros]   = useState([]);
  const [total,       setTotal]       = useState(0);
  const [loading,     setLoading]     = useState(true);
  const [refreshing,  setRefreshing]  = useState(false);

  /* filtros */
  const [busqueda,    setBusqueda]    = useState('');
  const [filtroTabla, setFiltroTabla] = useState('');
  const [filtroAccion,setFiltroAccion]= useState('');
  const [pagina,      setPagina]      = useState(1);
  const LIMITE = 25;

  /* detalle expandido */
  const [expandido,   setExpandido]   = useState(null);

  const cargar = useCallback(async (showRefresh = false) => {
    try {
      showRefresh ? setRefreshing(true) : setLoading(true);
      const params = { limite: LIMITE, pagina };
      if (filtroTabla)  params.tabla  = filtroTabla;
      if (filtroAccion) params.accion = filtroAccion;

      const res = await api.get('/dashboard/historial', { params });
      setRegistros(res.data.data);
      setTotal(res.data.total);
    } catch {
      toast.error('Error al cargar historial');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [pagina, filtroTabla, filtroAccion]);

  useEffect(() => { cargar(); }, [cargar]);

  /* filtro local por búsqueda */
  const filtrados = registros.filter((r) => {
    if (!busqueda) return true;
    const q = busqueda.toLowerCase();
    const nombre = `${r.usuario?.nombre || ''} ${r.usuario?.apellido || ''}`.toLowerCase();
    return nombre.includes(q) || (r.descripcion || '').toLowerCase().includes(q) || (r.tablaAfectada || '').toLowerCase().includes(q);
  });

  const totalPaginas = Math.ceil(total / LIMITE);

  const handleFiltroChange = (setter) => (val) => {
    setter(val);
    setPagina(1);
  };

  const limpiarFiltros = () => {
    setBusqueda('');
    setFiltroTabla('');
    setFiltroAccion('');
    setPagina(1);
  };

  const hayFiltros = busqueda || filtroTabla || filtroAccion;

  /* ── RENDER ── */
  if (loading) return (
    <Layout>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '320px', flexDirection: 'column', gap: '16px' }}>
        <div style={{ width: '40px', height: '40px', border: '3px solid var(--gray-200)', borderTopColor: 'var(--capyme-blue-mid)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
        <span style={{ fontSize: '14px', color: 'var(--gray-500)', fontFamily: "'DM Sans', sans-serif" }}>Cargando historial…</span>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    </Layout>
  );

  return (
    <Layout>
      <style>{`
        @keyframes spin    { to { transform: rotate(360deg); } }
        @keyframes fadeIn  { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes slideDown { from { opacity: 0; max-height: 0; } to { opacity: 1; max-height: 200px; } }

        .hist-row { transition: background 120ms ease; cursor: pointer; }
        .hist-row:hover { background: var(--gray-50) !important; }
        .hist-row:hover .hist-desc { color: var(--gray-800) !important; }

        .hist-filter-btn:hover { background: var(--gray-100) !important; }
        .hist-refresh:hover    { background: var(--capyme-blue-pale) !important; color: var(--capyme-blue-mid) !important; }

        .hist-page-btn:hover:not(:disabled) { background: var(--capyme-blue-pale) !important; color: var(--capyme-blue-mid) !important; border-color: var(--capyme-blue-mid) !important; }

        /* responsive */
        .hist-header { display: flex; align-items: flex-start; justify-content: space-between; gap: 16px; flex-wrap: wrap; margin-bottom: 24px; }
        .hist-filtros { display: flex; gap: 10px; flex-wrap: wrap; align-items: center; }
        .hist-search  { position: relative; flex: 1; min-width: 200px; }

        .hist-table-wrap { overflow-x: auto; -webkit-overflow-scrolling: touch; }

        /* ocultar col IP en mobile */
        .hist-col-ip     { }
        .hist-col-tabla  { }

        @media (max-width: 700px) {
          .hist-col-ip    { display: none; }
          .hist-col-tabla { display: none; }
        }
        @media (max-width: 480px) {
          .hist-col-hora  { display: none; }
        }
      `}</style>

      <div style={{ padding: '0 0 48px', animation: 'fadeIn 0.3s ease both' }}>

        {/* ── HEADER ── */}
        <div className="hist-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{ width: '46px', height: '46px', background: 'linear-gradient(135deg, var(--capyme-blue-mid), var(--capyme-blue))', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(31,78,158,0.25)', flexShrink: 0 }}>
              <History style={{ width: '22px', height: '22px', color: '#fff' }} />
            </div>
            <div>
              <h1 style={{ fontSize: '22px', fontWeight: 800, color: 'var(--gray-900)', fontFamily: "'Plus Jakarta Sans', sans-serif", margin: 0, lineHeight: 1.2 }}>
                Historial de Actividad
              </h1>
              <p style={{ fontSize: '13px', color: 'var(--gray-500)', margin: '3px 0 0', fontFamily: "'DM Sans', sans-serif" }}>
                {total.toLocaleString()} registro{total !== 1 ? 's' : ''} en total
              </p>
            </div>
          </div>

          <button
            className="hist-refresh"
            onClick={() => cargar(true)}
            disabled={refreshing}
            style={{ display: 'flex', alignItems: 'center', gap: '7px', padding: '9px 16px', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', background: '#fff', color: 'var(--gray-600)', fontSize: '13px', fontWeight: 600, fontFamily: "'DM Sans', sans-serif", cursor: 'pointer', transition: 'all 150ms ease' }}
          >
            <RefreshCw style={{ width: '14px', height: '14px', animation: refreshing ? 'spin 0.8s linear infinite' : 'none' }} />
            Actualizar
          </button>
        </div>

        {/* ── STATS RÁPIDAS ── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '10px', marginBottom: '20px' }}>
          {[
            { label: 'Creaciones',    accion: 'CREATE',        color: '#16A34A', bg: '#F0FDF4' },
            { label: 'Actualizaciones', accion: 'UPDATE',      color: '#2563EB', bg: '#EFF6FF' },
            { label: 'Eliminaciones', accion: 'DELETE',        color: '#DC2626', bg: '#FEF2F2' },
            { label: 'Cambios estado',accion: 'TOGGLE_ACTIVO', color: '#7C3AED', bg: '#F5F3FF' },
            { label: 'Pagos',         accion: 'CONFIRMAR_PAGO',color: '#0891B2', bg: '#ECFEFF' },
          ].map((s) => {
            const count = registros.filter(r =>
              r.accion === s.accion ||
              (s.accion === 'TOGGLE_ACTIVO' && (r.accion === 'CAMBIO_ESTADO' || r.accion.includes('activar') || r.accion.includes('desactivar')))
            ).length;
            return (
              <button
                key={s.label}
                onClick={() => handleFiltroChange(setFiltroAccion)(filtroAccion === s.accion ? '' : s.accion)}
                style={{ background: filtroAccion === s.accion ? s.bg : '#fff', border: `1px solid ${filtroAccion === s.accion ? s.color + '40' : 'var(--border)'}`, borderRadius: 'var(--radius-md)', padding: '12px 14px', cursor: 'pointer', transition: 'all 150ms ease', textAlign: 'left' }}
              >
                <div style={{ fontSize: '20px', fontWeight: 800, color: s.color, fontFamily: "'Plus Jakarta Sans', sans-serif", lineHeight: 1 }}>{count}</div>
                <div style={{ fontSize: '11px', color: s.color, fontFamily: "'DM Sans', sans-serif", fontWeight: 600, opacity: 0.8, marginTop: '2px' }}>{s.label}</div>
              </button>
            );
          })}
        </div>

        {/* ── FILTROS ── */}
        <div style={{ background: '#fff', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '14px 18px', marginBottom: '16px', boxShadow: 'var(--shadow-sm)' }}>
          <div className="hist-filtros">

            {/* Búsqueda */}
            <div className="hist-search">
              <Search style={{ position: 'absolute', left: '11px', top: '50%', transform: 'translateY(-50%)', width: '14px', height: '14px', color: 'var(--gray-400)', pointerEvents: 'none' }} />
              <input
                type="text"
                placeholder="Buscar por usuario, descripción…"
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                style={{ width: '100%', padding: '9px 12px 9px 34px', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', fontSize: '13px', fontFamily: "'DM Sans', sans-serif", color: 'var(--gray-900)', background: '#fff', outline: 'none', boxSizing: 'border-box' }}
              />
            </div>

            {/* Tabla */}
            <div style={{ position: 'relative', minWidth: '150px' }}>
              <Database style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', width: '13px', height: '13px', color: 'var(--gray-400)', pointerEvents: 'none' }} />
              <select
                value={filtroTabla}
                onChange={(e) => handleFiltroChange(setFiltroTabla)(e.target.value)}
                style={{ width: '100%', padding: '9px 32px 9px 30px', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', fontSize: '13px', fontFamily: "'DM Sans', sans-serif", color: 'var(--gray-700)', background: '#fff', outline: 'none', appearance: 'none', cursor: 'pointer', boxSizing: 'border-box' }}
              >
                <option value="">Todos los módulos</option>
                {Object.entries(TABLA_LABELS).map(([v, l]) => (
                  <option key={v} value={v}>{l}</option>
                ))}
              </select>
              <ChevronDown style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', width: '13px', height: '13px', color: 'var(--gray-400)', pointerEvents: 'none' }} />
            </div>

            {/* Limpiar */}
            {hayFiltros && (
              <button
                onClick={limpiarFiltros}
                style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '8px 12px', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', background: '#fff', color: 'var(--gray-500)', fontSize: '13px', fontFamily: "'DM Sans', sans-serif", cursor: 'pointer', whiteSpace: 'nowrap', transition: 'all 150ms ease' }}
                onMouseEnter={(e) => { e.currentTarget.style.background = '#FEF2F2'; e.currentTarget.style.color = '#DC2626'; e.currentTarget.style.borderColor = '#FECACA'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = '#fff'; e.currentTarget.style.color = 'var(--gray-500)'; e.currentTarget.style.borderColor = 'var(--border)'; }}
              >
                <X style={{ width: '13px', height: '13px' }} />
                Limpiar
              </button>
            )}

            <span style={{ marginLeft: 'auto', fontSize: '12px', color: 'var(--gray-400)', fontFamily: "'DM Sans', sans-serif", whiteSpace: 'nowrap' }}>
              {filtrados.length} resultado{filtrados.length !== 1 ? 's' : ''}
            </span>
          </div>
        </div>

        {/* ── TABLA ── */}
        <div style={{ background: '#fff', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', overflow: 'hidden', boxShadow: 'var(--shadow-sm)' }}>
          <div className="hist-table-wrap">
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '560px' }}>
              <thead>
                <tr style={{ background: 'var(--gray-50)', borderBottom: '1px solid var(--border)' }}>
                  <th style={thStyle}>Usuario</th>
                  <th style={thStyle}>Acción</th>
                  <th style={{ ...thStyle, className: 'hist-col-tabla' }} className="hist-col-tabla">Módulo</th>
                  <th style={thStyle}>Descripción</th>
                  <th style={{ ...thStyle, className: 'hist-col-hora' }} className="hist-col-hora">Hora</th>
                  <th style={thStyle}>Fecha</th>
                  <th style={{ ...thStyle, className: 'hist-col-ip' }} className="hist-col-ip">IP</th>
                </tr>
              </thead>
              <tbody>
                {filtrados.length === 0 ? (
                  <tr>
                    <td colSpan={7} style={{ padding: '64px 20px', textAlign: 'center' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
                        <div style={{ width: '48px', height: '48px', background: 'var(--gray-100)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <History style={{ width: '22px', height: '22px', color: 'var(--gray-300)' }} />
                        </div>
                        <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--gray-500)', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Sin registros</span>
                        <span style={{ fontSize: '13px', color: 'var(--gray-400)', fontFamily: "'DM Sans', sans-serif" }}>
                          {hayFiltros ? 'Prueba con otros filtros' : 'Aún no hay actividad registrada'}
                        </span>
                      </div>
                    </td>
                  </tr>
                ) : filtrados.map((r, idx) => {
                  const meta  = getAccionMeta(r.accion);
                  const AIcon = meta.Icon;
                  const rolS  = ROL_STYLE[r.usuario?.rol] || ROL_STYLE.cliente;
                  const isExp = expandido === r.id;

                  return (
                    <>
                      <tr
                        key={r.id}
                        className="hist-row"
                        onClick={() => setExpandido(isExp ? null : r.id)}
                        style={{ borderBottom: isExp ? 'none' : '1px solid var(--gray-100)', background: idx % 2 === 0 ? '#fff' : 'var(--gray-50)' }}
                      >
                        {/* Usuario */}
                        <td style={{ padding: '12px 16px', whiteSpace: 'nowrap' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '9px' }}>
                            <div style={{ width: '32px', height: '32px', borderRadius: 'var(--radius-md)', background: 'linear-gradient(135deg, var(--capyme-blue-mid), var(--capyme-blue))', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                              <span style={{ fontSize: '11px', fontWeight: 700, color: '#fff', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                                {getInitials(r.usuario?.nombre, r.usuario?.apellido)}
                              </span>
                            </div>
                            <div style={{ minWidth: 0 }}>
                              <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--gray-900)', fontFamily: "'DM Sans', sans-serif", lineHeight: 1.2 }}>
                                {r.usuario ? `${r.usuario.nombre} ${r.usuario.apellido}` : `ID ${r.usuarioId}`}
                              </div>
                              {r.usuario?.rol && (
                                <span style={{ fontSize: '10px', fontWeight: 700, padding: '1px 6px', borderRadius: '20px', background: rolS.bg, color: rolS.color, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                                  {r.usuario.rol}
                                </span>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* Acción */}
                        <td style={{ padding: '12px 16px', whiteSpace: 'nowrap' }}>
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '4px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: 700, background: meta.bg, color: meta.color, border: `1px solid ${meta.border}`, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                            <AIcon style={{ width: '11px', height: '11px' }} />
                            {meta.label}
                          </span>
                        </td>

                        {/* Módulo */}
                        <td className="hist-col-tabla" style={{ padding: '12px 16px', whiteSpace: 'nowrap' }}>
                          {r.tablaAfectada ? (
                            <span style={{ fontSize: '12px', fontWeight: 600, padding: '3px 8px', borderRadius: 'var(--radius-sm)', background: 'var(--gray-100)', color: 'var(--gray-600)', fontFamily: "'DM Sans', sans-serif" }}>
                              {TABLA_LABELS[r.tablaAfectada] || r.tablaAfectada}
                              {r.registroId && <span style={{ opacity: 0.5 }}> #{r.registroId}</span>}
                            </span>
                          ) : <span style={{ color: 'var(--gray-300)', fontSize: '13px' }}>—</span>}
                        </td>

                        {/* Descripción */}
                        <td style={{ padding: '12px 16px', maxWidth: '280px' }}>
                          <span className="hist-desc" style={{ fontSize: '13px', color: 'var(--gray-600)', fontFamily: "'DM Sans', sans-serif", display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical', overflow: 'hidden', transition: 'color 120ms ease' }}>
                            {r.descripcion || <span style={{ color: 'var(--gray-300)' }}>Sin descripción</span>}
                          </span>
                        </td>

                        {/* Hora */}
                        <td className="hist-col-hora" style={{ padding: '12px 16px', whiteSpace: 'nowrap' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                            <Clock style={{ width: '11px', height: '11px', color: 'var(--gray-300)', flexShrink: 0 }} />
                            <span style={{ fontSize: '12px', color: 'var(--gray-500)', fontFamily: "'DM Sans', sans-serif" }}>
                              {formatHora(r.fechaAccion)}
                            </span>
                          </div>
                        </td>

                        {/* Fecha */}
                        <td style={{ padding: '12px 16px', whiteSpace: 'nowrap' }}>
                          <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--gray-700)', fontFamily: "'DM Sans', sans-serif" }}>
                            {formatFecha(r.fechaAccion)}
                          </div>
                          <div style={{ fontSize: '11px', color: 'var(--gray-400)', fontFamily: "'DM Sans', sans-serif', marginTop: '1px'" }}>
                            {getRelativo(r.fechaAccion)}
                          </div>
                        </td>

                        {/* IP */}
                        <td className="hist-col-ip" style={{ padding: '12px 16px', whiteSpace: 'nowrap' }}>
                          <span style={{ fontSize: '11px', color: 'var(--gray-400)', fontFamily: "'DM Sans', monospace" }}>
                            {r.ipAddress || '—'}
                          </span>
                        </td>
                      </tr>

                      {/* Fila expandida */}
                      {isExp && (
                        <tr key={`${r.id}-exp`} style={{ borderBottom: '1px solid var(--gray-100)', background: meta.bg + '60' }}>
                          <td colSpan={7} style={{ padding: '14px 20px 14px 62px' }}>
                            <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap', alignItems: 'flex-start' }}>
                              <div>
                                <span style={{ fontSize: '10px', fontWeight: 700, color: 'var(--gray-400)', textTransform: 'uppercase', letterSpacing: '0.06em', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Descripción completa</span>
                                <p style={{ fontSize: '13px', color: 'var(--gray-700)', fontFamily: "'DM Sans', sans-serif", margin: '4px 0 0', lineHeight: 1.5 }}>
                                  {r.descripcion || 'Sin descripción disponible'}
                                </p>
                              </div>
                              <div>
                                <span style={{ fontSize: '10px', fontWeight: 700, color: 'var(--gray-400)', textTransform: 'uppercase', letterSpacing: '0.06em', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Fecha y hora exacta</span>
                                <p style={{ fontSize: '13px', color: 'var(--gray-700)', fontFamily: "'DM Sans', sans-serif", margin: '4px 0 0' }}>
                                  {formatFecha(r.fechaAccion)} — {formatHora(r.fechaAccion)}
                                </p>
                              </div>
                              {r.registroId && (
                                <div>
                                  <span style={{ fontSize: '10px', fontWeight: 700, color: 'var(--gray-400)', textTransform: 'uppercase', letterSpacing: '0.06em', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>ID del registro</span>
                                  <p style={{ fontSize: '13px', color: 'var(--gray-700)', fontFamily: "'DM Sans', sans-serif", margin: '4px 0 0' }}>#{r.registroId}</p>
                                </div>
                              )}
                              {r.ipAddress && (
                                <div>
                                  <span style={{ fontSize: '10px', fontWeight: 700, color: 'var(--gray-400)', textTransform: 'uppercase', letterSpacing: '0.06em', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Dirección IP</span>
                                  <p style={{ fontSize: '13px', color: 'var(--gray-700)', fontFamily: "'DM Sans', monospace", margin: '4px 0 0' }}>{r.ipAddress}</p>
                                </div>
                              )}
                            </div>
                          </td>
                        </tr>
                      )}
                    </>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* ── PAGINACIÓN ── */}
          {totalPaginas > 1 && (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 20px', borderTop: '1px solid var(--border)', background: 'var(--gray-50)', flexWrap: 'wrap', gap: '10px' }}>
              <span style={{ fontSize: '13px', color: 'var(--gray-500)', fontFamily: "'DM Sans', sans-serif" }}>
                Página <strong>{pagina}</strong> de <strong>{totalPaginas}</strong> · {total.toLocaleString()} registros
              </span>
              <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                <button
                  className="hist-page-btn"
                  disabled={pagina === 1}
                  onClick={() => setPagina((p) => p - 1)}
                  style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '7px 12px', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', background: '#fff', color: pagina === 1 ? 'var(--gray-300)' : 'var(--gray-600)', fontSize: '13px', fontWeight: 600, fontFamily: "'DM Sans', sans-serif", cursor: pagina === 1 ? 'not-allowed' : 'pointer', transition: 'all 150ms ease' }}
                >
                  <ChevronLeft style={{ width: '14px', height: '14px' }} />
                  Anterior
                </button>

                {/* Botones de página */}
                {Array.from({ length: Math.min(5, totalPaginas) }, (_, i) => {
                  let p;
                  if (totalPaginas <= 5) p = i + 1;
                  else if (pagina <= 3) p = i + 1;
                  else if (pagina >= totalPaginas - 2) p = totalPaginas - 4 + i;
                  else p = pagina - 2 + i;
                  return (
                    <button
                      key={p}
                      onClick={() => setPagina(p)}
                      style={{ width: '34px', height: '34px', border: `1px solid ${p === pagina ? 'var(--capyme-blue-mid)' : 'var(--border)'}`, borderRadius: 'var(--radius-md)', background: p === pagina ? 'linear-gradient(135deg, var(--capyme-blue-mid), var(--capyme-blue))' : '#fff', color: p === pagina ? '#fff' : 'var(--gray-600)', fontSize: '13px', fontWeight: 600, fontFamily: "'DM Sans', sans-serif", cursor: 'pointer', transition: 'all 150ms ease' }}
                    >
                      {p}
                    </button>
                  );
                })}

                <button
                  className="hist-page-btn"
                  disabled={pagina === totalPaginas}
                  onClick={() => setPagina((p) => p + 1)}
                  style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '7px 12px', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', background: '#fff', color: pagina === totalPaginas ? 'var(--gray-300)' : 'var(--gray-600)', fontSize: '13px', fontWeight: 600, fontFamily: "'DM Sans', sans-serif", cursor: pagina === totalPaginas ? 'not-allowed' : 'pointer', transition: 'all 150ms ease' }}
                >
                  Siguiente
                  <ChevronRight style={{ width: '14px', height: '14px' }} />
                </button>
              </div>
            </div>
          )}
        </div>

      </div>
    </Layout>
  );
};

/* ── estilos de th ── */
const thStyle = {
  padding: '10px 16px',
  textAlign: 'left',
  fontSize: '11px',
  fontWeight: 700,
  color: 'var(--gray-500)',
  fontFamily: "'Plus Jakarta Sans', sans-serif",
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
  whiteSpace: 'nowrap',
};

export default Historial;