import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import {
  TrendingUp, Plus, Search, CheckCircle, XCircle, AlertCircle,
  ChevronDown, DollarSign, Clock, FileText, Megaphone,
  Ban, RotateCcw, CreditCard, Heart, ArrowLeft,
  Target, Users, Star, Building2, X,
} from 'lucide-react';
import Layout from '../components/common/Layout';
import { inversionesService } from '../services/inversionesService';
import { campanasService } from '../services/campanasService';
import { usuariosService } from '../services/usuariosService';

// ─── Helpers ──────────────────────────────────────────────────────────────────
const fmtCurrency = (v) =>
  new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN', maximumFractionDigits: 0 }).format(v || 0);

const fmtDate = (d) =>
  d ? new Date(d).toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

const pct = (r, m) => {
  if (!m || parseFloat(m) === 0) return 0;
  return Math.min(100, Math.round((parseFloat(r) / parseFloat(m)) * 100));
};

const COLORES = [
  ['#667EEA', '#764BA2'], ['#11998E', '#38EF7D'],
  ['#F093FB', '#F5576C'], ['#4FACFE', '#00F2FE'],
  ['#43E97B', '#38F9D7'], ['#FA709A', '#FEE140'],
  ['#A18CD1', '#FBC2EB'], ['#0BA360', '#3CBA92'],
];

const ESTADO_PAGO_INFO = {
  pendiente:  { label: 'Pendiente',  bg: '#FEF9C3', color: '#854D0E', dot: '#F59E0B' },
  confirmado: { label: 'Confirmado', bg: '#DCFCE7', color: '#14532D', dot: '#22C55E' },
  rechazado:  { label: 'Rechazado', bg: '#FEE2E2', color: '#991B1B', dot: '#EF4444' },
};

// ─── Card de inversión (vista del inversor) ───────────────────────────────────
const InversionCard = ({ inv, currentUser, esAdmin, esColaborador, onConfirmar, onRechazar, onToggle }) => {
  const [hovered, setHovered] = useState(false);
  const campana = inv.campana;
  const [c1, c2] = COLORES[(campana?.id || 0) % COLORES.length];
  const porcentaje = pct(campana?.montoRecaudado, campana?.metaRecaudacion);
  const estadoInfo = ESTADO_PAGO_INFO[inv.estadoPago] || ESTADO_PAGO_INFO.pendiente;

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        borderRadius: '16px', border: '1px solid var(--border)',
        overflow: 'hidden', background: '#fff',
        transition: 'all 250ms cubic-bezier(0.34, 1.2, 0.64, 1)',
        transform: hovered ? 'translateY(-4px)' : 'translateY(0)',
        boxShadow: hovered ? '0 16px 36px rgba(0,0,0,0.1)' : '0 2px 8px rgba(0,0,0,0.05)',
        opacity: inv.activo ? 1 : 0.5,
      }}
    >
      {/* Banda de color de la campaña */}
      <div style={{
        height: '8px',
        background: `linear-gradient(90deg, ${c1}, ${c2})`,
      }} />

      <div style={{ padding: '16px' }}>
        {/* Referencia */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
          <span style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: '11px', fontWeight: 700,
            color: 'var(--capyme-blue-mid)',
            background: 'var(--capyme-blue-pale)',
            padding: '3px 8px', borderRadius: '6px',
          }}>
            {inv.referencia}
          </span>
          <span style={{
            padding: '3px 10px', borderRadius: '99px', fontSize: '11px', fontWeight: 700,
            background: estadoInfo.bg, color: estadoInfo.color,
            display: 'inline-flex', alignItems: 'center', gap: '5px',
            fontFamily: "'DM Sans', sans-serif",
          }}>
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: estadoInfo.dot, display: 'inline-block' }} />
            {estadoInfo.label}
          </span>
        </div>

        {/* Nombre de campaña */}
        <h3 style={{
          fontSize: '14px', fontWeight: 800, color: 'var(--gray-900)',
          fontFamily: "'Plus Jakarta Sans', sans-serif",
          margin: '0 0 4px',
          display: '-webkit-box', WebkitLineClamp: 1,
          WebkitBoxOrient: 'vertical', overflow: 'hidden',
        }}>
          {campana?.titulo || '—'}
        </h3>
        <div style={{ fontSize: '12px', color: 'var(--gray-400)', fontFamily: "'DM Sans', sans-serif", marginBottom: '14px' }}>
          {campana?.negocio?.nombreNegocio}
        </div>

        {/* Progreso de la campaña */}
        <div style={{ marginBottom: '14px' }}>
          <div style={{ height: '4px', borderRadius: '99px', background: 'var(--gray-100)', overflow: 'hidden' }}>
            <div style={{
              height: '100%', borderRadius: '99px',
              background: `linear-gradient(90deg, ${c1}, ${c2})`,
              width: `${porcentaje}%`, transition: 'width 1s ease',
            }} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '4px' }}>
            <span style={{ fontSize: '10px', color: 'var(--gray-400)', fontFamily: "'DM Sans', sans-serif" }}>
              {fmtCurrency(campana?.montoRecaudado)} recaudados
            </span>
            <span style={{ fontSize: '10px', fontWeight: 700, color: 'var(--capyme-blue-mid)', fontFamily: "'DM Sans', sans-serif" }}>
              {porcentaje}%
            </span>
          </div>
        </div>

        {/* Monto invertido */}
        <div style={{
          padding: '12px', borderRadius: '10px',
          background: `linear-gradient(135deg, ${c1}15, ${c2}15)`,
          border: `1px solid ${c1}30`,
          marginBottom: '12px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <div>
            <div style={{ fontSize: '10px', color: 'var(--gray-500)', fontFamily: "'DM Sans', sans-serif', textTransform: 'uppercase', letterSpacing: '0.05em'" }}>
              Tu inversión
            </div>
            <div style={{ fontSize: '20px', fontWeight: 900, color: 'var(--gray-900)', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
              {fmtCurrency(inv.monto)}
            </div>
          </div>
          <div style={{
            width: '40px', height: '40px', borderRadius: '12px',
            background: `linear-gradient(135deg, ${c1}, ${c2})`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Heart style={{ width: '18px', height: '18px', color: '#fff' }} />
          </div>
        </div>

        {/* Fecha y datos */}
        <div style={{ fontSize: '11px', color: 'var(--gray-400)', fontFamily: "'DM Sans', sans-serif", marginBottom: '12px', display: 'flex', gap: '12px' }}>
          <span>📅 {fmtDate(inv.fechaCreacion)}</span>
          {inv.fechaConfirmacion && <span style={{ color: '#10B981' }}>✓ Conf. {fmtDate(inv.fechaConfirmacion)}</span>}
        </div>

        {/* Botones admin */}
        {(esAdmin || esColaborador) && (
          <div style={{ display: 'flex', gap: '6px', paddingTop: '10px', borderTop: '1px solid var(--gray-100)' }}>
            {esAdmin && inv.estadoPago === 'pendiente' && inv.activo && (
              <>
                <button onClick={onConfirmar} style={{
                  flex: 1, padding: '7px', border: 'none', borderRadius: '8px',
                  background: '#ECFDF5', color: '#065F46', fontSize: '12px', fontWeight: 600,
                  cursor: 'pointer', fontFamily: "'DM Sans', sans-serif",
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px',
                }}>
                  <CheckCircle style={{ width: '13px', height: '13px' }} /> Confirmar
                </button>
                <button onClick={onRechazar} style={{
                  flex: 1, padding: '7px', border: 'none', borderRadius: '8px',
                  background: '#FEF2F2', color: '#DC2626', fontSize: '12px', fontWeight: 600,
                  cursor: 'pointer', fontFamily: "'DM Sans', sans-serif",
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px',
                }}>
                  <XCircle style={{ width: '13px', height: '13px' }} /> Rechazar
                </button>
              </>
            )}
            {esAdmin && inv.activo && inv.estadoPago !== 'pendiente' && (
              <button onClick={onToggle} style={{
                flex: 1, padding: '7px', border: '1.5px solid var(--border)', borderRadius: '8px',
                background: 'transparent', color: 'var(--gray-500)', fontSize: '12px', fontWeight: 600,
                cursor: 'pointer', fontFamily: "'DM Sans', sans-serif",
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px',
              }}>
                <Ban style={{ width: '13px', height: '13px' }} /> Anular
              </button>
            )}
            {esAdmin && !inv.activo && (
              <button onClick={onToggle} style={{
                flex: 1, padding: '7px', border: 'none', borderRadius: '8px',
                background: '#ECFDF5', color: '#065F46', fontSize: '12px', fontWeight: 600,
                cursor: 'pointer', fontFamily: "'DM Sans', sans-serif",
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px',
              }}>
                <RotateCcw style={{ width: '13px', height: '13px' }} /> Reactivar
              </button>
            )}
            {esColaborador && (
              <button disabled title="Solo admins pueden anular" style={{
                flex: 1, padding: '7px', border: '1.5px solid var(--border)', borderRadius: '8px',
                background: 'transparent', color: 'var(--gray-300)', fontSize: '12px',
                cursor: 'not-allowed', fontFamily: "'DM Sans', sans-serif",
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px',
              }}>
                <Ban style={{ width: '13px', height: '13px' }} /> Anular
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

// ─── Modal de nueva inversión con flujo de pago ───────────────────────────────
const InversionModal = ({ campanas, usuarios, currentUser, campanaPreseleccionada, onClose, onSuccess }) => {
  const esAdmin       = currentUser.rol === 'admin';
  const esColaborador = currentUser.rol === 'colaborador';

  const [fase, setFase]       = useState('form');   // form | confirming | processing | success
  const [invConfirmada, setInvConfirmada] = useState(null);
  const [formData, setFormData] = useState({
    campanaId: campanaPreseleccionada || '',
    inversorId: '', monto: '', notas: '',
  });
  const [errors, setErrors]   = useState({});
  const [saving, setSaving]   = useState(false);

  const campanaSeleccionada = campanas.find(c => String(c.id) === String(formData.campanaId));
  const [c1, c2] = campanaSeleccionada ? COLORES[(campanaSeleccionada.id || 0) % COLORES.length] : ['#667EEA', '#764BA2'];

  const validate = () => {
    const e = {};
    if (!formData.campanaId) e.campanaId = 'Selecciona una campaña';
    if ((esAdmin || esColaborador) && !formData.inversorId) e.inversorId = 'Selecciona un inversor';
    if (!formData.monto || parseFloat(formData.monto) <= 0) e.monto = 'Ingresa un monto válido';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handlePagar = () => {
    if (!validate()) return;
    setFase('confirming');
  };

  const handleConfirmarPago = async () => {
    setFase('processing');
    setSaving(true);
    try {
      await new Promise(r => setTimeout(r, 1800)); // simulación
      const res = await inversionesService.create({
        campanaId: formData.campanaId,
        monto: formData.monto,
        notas: formData.notas,
        inversorId: (esAdmin || esColaborador) ? formData.inversorId : undefined,
      });
      setInvConfirmada(res.data);
      setFase('success');
      onSuccess();
    } catch (e) {
      toast.error(e?.response?.data?.message || 'Error al procesar el pago');
      setFase('form');
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

  return (
    <div onClick={fase !== 'processing' ? onClose : undefined} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(5px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
      <div onClick={e => e.stopPropagation()} style={{ background: '#fff', borderRadius: '20px', width: '100%', maxWidth: '500px', display: 'flex', flexDirection: 'column', boxShadow: '0 24px 64px rgba(0,0,0,0.2)', overflow: 'hidden' }}>

        {/* Header con gradiente de la campaña */}
        <div style={{
          padding: '20px 24px',
          background: fase === 'success'
            ? 'linear-gradient(135deg, #10B981, #059669)'
            : `linear-gradient(135deg, ${c1}, ${c2})`,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          transition: 'background 600ms ease',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {fase === 'success' ? <CheckCircle style={{ width: '18px', height: '18px', color: '#fff' }} /> : <Heart style={{ width: '18px', height: '18px', color: '#fff' }} />}
            </div>
            <h2 style={{ fontSize: '16px', fontWeight: 800, color: '#fff', fontFamily: "'Plus Jakarta Sans', sans-serif", margin: 0, textShadow: '0 1px 3px rgba(0,0,0,0.15)' }}>
              {fase === 'form' ? 'Apoyar campaña' : fase === 'confirming' ? 'Confirmar inversión' : fase === 'processing' ? 'Procesando...' : '¡Inversión exitosa!'}
            </h2>
          </div>
          {fase !== 'processing' && fase !== 'success' && (
            <button onClick={onClose} style={{ width: '30px', height: '30px', border: 'none', background: 'rgba(255,255,255,0.2)', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <X style={{ width: '14px', height: '14px', color: '#fff' }} />
            </button>
          )}
        </div>

        {/* Cuerpo */}
        <div style={{ padding: '24px', flex: 1 }}>

          {/* ── Formulario ── */}
          {fase === 'form' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={lbl}>Campaña *</label>
                <select value={formData.campanaId} onChange={e => setFormData(p => ({ ...p, campanaId: e.target.value }))}
                  style={{ ...inp, appearance: 'none', cursor: 'pointer', ...(errors.campanaId ? { borderColor: '#EF4444' } : {}) }}>
                  <option value="">Seleccionar campaña...</option>
                  {campanas.map(c => <option key={c.id} value={c.id}>{c.titulo} — {c.negocio?.nombreNegocio}</option>)}
                </select>
                {errors.campanaId && <p style={{ margin: '4px 0 0', fontSize: '11px', color: '#EF4444', fontFamily: "'DM Sans', sans-serif" }}>{errors.campanaId}</p>}
              </div>

              {(esAdmin || esColaborador) && (
                <div>
                  <label style={lbl}>Inversor *</label>
                  <select value={formData.inversorId} onChange={e => setFormData(p => ({ ...p, inversorId: e.target.value }))}
                    style={{ ...inp, appearance: 'none', cursor: 'pointer', ...(errors.inversorId ? { borderColor: '#EF4444' } : {}) }}>
                    <option value="">Seleccionar inversor...</option>
                    {usuarios.map(u => <option key={u.id} value={u.id}>{u.nombre} {u.apellido} — {u.email}</option>)}
                  </select>
                  {errors.inversorId && <p style={{ margin: '4px 0 0', fontSize: '11px', color: '#EF4444', fontFamily: "'DM Sans', sans-serif" }}>{errors.inversorId}</p>}
                </div>
              )}

              <div>
                <label style={lbl}>Monto a invertir (MXN) *</label>
                <div style={{ position: 'relative' }}>
                  <DollarSign style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', width: '15px', height: '15px', color: 'var(--gray-400)' }} />
                  <input type="number" min="1" value={formData.monto}
                    onChange={e => setFormData(p => ({ ...p, monto: e.target.value }))}
                    placeholder="0"
                    style={{ ...inp, paddingLeft: '32px', fontSize: '18px', fontWeight: 800, fontFamily: "'Plus Jakarta Sans', sans-serif", ...(errors.monto ? { borderColor: '#EF4444' } : {}) }} />
                </div>
                {errors.monto && <p style={{ margin: '4px 0 0', fontSize: '11px', color: '#EF4444', fontFamily: "'DM Sans', sans-serif" }}>{errors.monto}</p>}
                {/* Sugerencias de monto */}
                <div style={{ display: 'flex', gap: '6px', marginTop: '8px' }}>
                  {[500, 1000, 2500, 5000].map(amt => (
                    <button key={amt} onClick={() => setFormData(p => ({ ...p, monto: String(amt) }))} style={{
                      padding: '4px 10px', border: `1.5px solid ${String(formData.monto) === String(amt) ? c1 : 'var(--border)'}`,
                      borderRadius: '99px', background: String(formData.monto) === String(amt) ? `${c1}20` : 'transparent',
                      color: String(formData.monto) === String(amt) ? c1 : 'var(--gray-600)',
                      fontSize: '12px', fontWeight: 600, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif",
                      transition: 'all 150ms',
                    }}>
                      ${amt.toLocaleString()}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label style={lbl}>Mensaje (opcional)</label>
                <textarea value={formData.notas} onChange={e => setFormData(p => ({ ...p, notas: e.target.value }))}
                  rows={2} placeholder="¡Mucho éxito con tu proyecto! 🚀"
                  style={{ ...inp, resize: 'none' }} />
              </div>
            </div>
          )}

          {/* ── Confirmación ── */}
          {fase === 'confirming' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{
                padding: '16px', borderRadius: '14px',
                background: `linear-gradient(135deg, ${c1}12, ${c2}12)`,
                border: `1px solid ${c1}30`,
              }}>
                <div style={{ fontSize: '11px', color: 'var(--gray-400)', fontFamily: "'DM Sans', sans-serif", textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>Campaña</div>
                <div style={{ fontSize: '15px', fontWeight: 800, color: 'var(--gray-900)', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{campanaSeleccionada?.titulo}</div>
                <div style={{ fontSize: '12px', color: 'var(--gray-400)', fontFamily: "'DM Sans', sans-serif" }}>{campanaSeleccionada?.negocio?.nombreNegocio}</div>
              </div>
              <div style={{ padding: '16px', borderRadius: '14px', background: 'var(--gray-50)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ fontSize: '11px', color: 'var(--gray-400)', fontFamily: "'DM Sans', sans-serif", textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total a pagar</div>
                  <div style={{ fontSize: '28px', fontWeight: 900, color: 'var(--gray-900)', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                    {fmtCurrency(formData.monto)}
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: 'var(--gray-600)', fontFamily: "'DM Sans', sans-serif", fontWeight: 600 }}>
                  <CreditCard style={{ width: '16px', height: '16px', color: 'var(--capyme-blue-mid)' }} />
                  Pago electrónico
                </div>
              </div>
              {formData.notas && (
                <div style={{ padding: '10px 14px', borderRadius: '10px', background: 'var(--gray-50)', border: '1px solid var(--border)', fontSize: '13px', color: 'var(--gray-600)', fontFamily: "'DM Sans', sans-serif" }}>
                  💬 "{formData.notas}"
                </div>
              )}
            </div>
          )}

          {/* ── Procesando ── */}
          {fase === 'processing' && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '32px 0', gap: '20px' }}>
              <div style={{
                width: '64px', height: '64px',
                border: `4px solid ${c1}30`,
                borderTopColor: c1,
                borderRadius: '50%',
                animation: 'spin 0.8s linear infinite',
              }} />
              <div style={{ textAlign: 'center' }}>
                <p style={{ fontSize: '16px', fontWeight: 700, color: 'var(--gray-900)', fontFamily: "'Plus Jakarta Sans', sans-serif", margin: '0 0 6px' }}>
                  Procesando tu pago...
                </p>
                <p style={{ fontSize: '13px', color: 'var(--gray-500)', fontFamily: "'DM Sans', sans-serif", margin: 0 }}>
                  No cierres esta ventana
                </p>
              </div>
            </div>
          )}

          {/* ── Éxito ── */}
          {fase === 'success' && invConfirmada && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}>
              <div style={{
                width: '80px', height: '80px',
                background: 'linear-gradient(135deg, #10B981, #059669)',
                borderRadius: '50%',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 8px 28px rgba(16,185,129,0.4)',
                animation: 'popIn 0.4s cubic-bezier(0.34,1.56,0.64,1)',
              }}>
                <CheckCircle style={{ width: '40px', height: '40px', color: '#fff' }} />
              </div>
              <div style={{ textAlign: 'center' }}>
                <p style={{ fontSize: '20px', fontWeight: 900, color: 'var(--gray-900)', fontFamily: "'Plus Jakarta Sans', sans-serif", margin: '0 0 6px' }}>
                  ¡Gracias por tu apoyo!
                </p>
                <p style={{ fontSize: '13px', color: 'var(--gray-500)', fontFamily: "'DM Sans', sans-serif", margin: 0 }}>
                  Tu inversión fue confirmada exitosamente
                </p>
              </div>
              <div style={{
                width: '100%', background: 'var(--gray-50)',
                border: '1px solid var(--border)', borderRadius: '14px', padding: '16px',
              }}>
                {[
                  { label: 'Referencia', value: invConfirmada.referencia, mono: true },
                  { label: 'Monto invertido', value: fmtCurrency(invConfirmada.monto), bold: true, green: true },
                  { label: 'Campaña', value: invConfirmada.campana?.titulo },
                  { label: 'Estado', value: '✓ Confirmado', green: true },
                ].map(({ label, value, mono, bold, green }) => (
                  <div key={label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 0', borderBottom: '1px solid var(--gray-100)' }}>
                    <span style={{ fontSize: '12px', color: 'var(--gray-400)', fontFamily: "'DM Sans', sans-serif" }}>{label}</span>
                    <span style={{
                      fontSize: mono ? '11px' : bold ? '15px' : '13px',
                      fontWeight: bold ? 800 : 600,
                      color: green ? '#065F46' : 'var(--gray-900)',
                      fontFamily: mono ? "'JetBrains Mono', monospace" : "'DM Sans', sans-serif",
                    }}>{value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{ padding: '16px 24px', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', gap: '10px' }}>
          {fase === 'success' ? (
            <button onClick={onClose} style={{
              width: '100%', padding: '12px',
              background: 'linear-gradient(135deg, #10B981, #059669)',
              border: 'none', borderRadius: '12px', color: '#fff',
              fontSize: '14px', fontWeight: 800, cursor: 'pointer',
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              boxShadow: '0 4px 14px rgba(16,185,129,0.35)',
            }}>
              ¡Entendido!
            </button>
          ) : fase === 'processing' ? (
            <div style={{ flex: 1, textAlign: 'center', fontSize: '13px', color: 'var(--gray-400)', fontFamily: "'DM Sans', sans-serif" }}>
              Procesando...
            </div>
          ) : fase === 'confirming' ? (
            <>
              <button onClick={() => setFase('form')} style={{ padding: '10px 20px', border: '1.5px solid var(--border)', borderRadius: '10px', background: '#fff', color: 'var(--gray-700)', fontSize: '13px', fontWeight: 600, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif" }}>
                ← Regresar
              </button>
              <button onClick={handleConfirmarPago} style={{
                flex: 1, padding: '11px 20px',
                background: `linear-gradient(135deg, ${c1}, ${c2})`,
                border: 'none', borderRadius: '10px', color: '#fff',
                fontSize: '14px', fontWeight: 800, cursor: 'pointer',
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                boxShadow: '0 4px 14px rgba(0,0,0,0.2)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
              }}>
                <CreditCard style={{ width: '16px', height: '16px' }} />
                Confirmar y Pagar
              </button>
            </>
          ) : (
            <>
              <button onClick={onClose} style={{ padding: '10px 20px', border: '1.5px solid var(--border)', borderRadius: '10px', background: '#fff', color: 'var(--gray-700)', fontSize: '13px', fontWeight: 600, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif" }}>
                Cancelar
              </button>
              <button onClick={handlePagar} style={{
                flex: 1, padding: '11px 20px',
                background: `linear-gradient(135deg, ${c1}, ${c2})`,
                border: 'none', borderRadius: '10px', color: '#fff',
                fontSize: '14px', fontWeight: 800, cursor: 'pointer',
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                boxShadow: '0 4px 14px rgba(0,0,0,0.2)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
              }}>
                <Heart style={{ width: '16px', height: '16px' }} />
                Ir a Pagar
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

// ─── PÁGINA PRINCIPAL ─────────────────────────────────────────────────────────
const Inversiones = () => {
  const authStorage = JSON.parse(localStorage.getItem('auth-storage') || '{}');
  const currentUser = authStorage?.state?.user || {};

  const [inversiones, setInversiones]   = useState([]);
  const [pendientes, setPendientes]     = useState([]);
  const [campanas, setCampanas]         = useState([]);
  const [usuarios, setUsuarios]         = useState([]);
  const [loading, setLoading]           = useState(true);
  const [showModal, setShowModal]       = useState(false);
  const [searchTerm, setSearchTerm]     = useState('');
  const [filtroEstado, setFiltroEstado] = useState('');

  // Leer campanaId de URL query si viene de la página de Campañas
  const urlParams = new URLSearchParams(window.location.search);
  const campanaPreseleccionada = urlParams.get('campanaId') || '';

  const esAdmin       = currentUser.rol === 'admin';
  const esColaborador = currentUser.rol === 'colaborador';

  useEffect(() => {
    cargarDatos();
    if (campanaPreseleccionada) setShowModal(true);
  }, []);

  const cargarDatos = async () => {
    setLoading(true);
    try {
      const [invRes, campRes] = await Promise.all([
        inversionesService.getAll(),
        campanasService.getAll(),
      ]);
      setInversiones(invRes.data || []);
      setCampanas((campRes.data || []).filter(c => c.activo && (c.estado === 'aprobada' || c.estado === 'activa')));

      if (esAdmin || esColaborador) {
        const [pendRes, usrRes] = await Promise.all([
          inversionesService.getPendientes(),
          usuariosService.getAll({ rol: 'cliente' }),
        ]);
        setPendientes(pendRes.data || []);
        setUsuarios(usrRes.data || []);
      }
    } catch { toast.error('Error al cargar inversiones'); }
    finally { setLoading(false); }
  };

  const handleConfirmar = async (inv) => {
    if (!window.confirm(`¿Confirmar inversión de ${fmtCurrency(inv.monto)}?`)) return;
    try {
      await inversionesService.confirmar(inv.id);
      toast.success('Inversión confirmada ✓');
      cargarDatos();
    } catch (e) { toast.error(e?.response?.data?.message || 'Error'); }
  };

  const handleRechazar = async (inv) => {
    if (!window.confirm(`¿Rechazar esta inversión? Se notificará al inversor.`)) return;
    try {
      await inversionesService.rechazar(inv.id);
      toast.success('Inversión rechazada');
      cargarDatos();
    } catch { toast.error('Error al rechazar'); }
  };

  const handleToggle = async (inv) => {
    if (!window.confirm(`¿${inv.activo ? 'Anular' : 'Reactivar'} esta inversión?`)) return;
    try {
      await inversionesService.toggleActivo(inv.id);
      toast.success(`Inversión ${inv.activo ? 'anulada' : 'reactivada'}`);
      cargarDatos();
    } catch { toast.error('Error'); }
  };

  const inversionesFiltradas = inversiones.filter(i => {
    const matchSearch = !searchTerm ||
      i.referencia?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      i.inversor?.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      i.campana?.titulo?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchEstado = !filtroEstado || i.estadoPago === filtroEstado;
    return matchSearch && matchEstado;
  });

  const totalInvertido = inversiones
    .filter(i => i.estadoPago === 'confirmado' && i.activo)
    .reduce((acc, i) => acc + parseFloat(i.monto || 0), 0);

  if (loading) return (
    <Layout>
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
        <div style={{ width: '40px', height: '40px', border: '3px solid var(--gray-200)', borderTopColor: 'var(--capyme-blue-mid)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      </div>
    </Layout>
  );

  return (
    <Layout>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes popIn {
          0% { transform: scale(0.5); opacity: 0; }
          100% { transform: scale(1); opacity: 1; }
        }
      `}</style>

      <div style={{ padding: '32px 24px', maxWidth: '1280px', margin: '0 auto' }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '28px', gap: '16px', flexWrap: 'wrap' }}>
          <div>
            <h1 style={{ fontSize: '28px', fontWeight: 900, color: 'var(--gray-900)', fontFamily: "'Plus Jakarta Sans', sans-serif", margin: '0 0 6px' }}>
              Mis inversiones
            </h1>
            <p style={{ fontSize: '14px', color: 'var(--gray-500)', margin: 0, fontFamily: "'DM Sans', sans-serif" }}>
              {inversiones.length} inversión{inversiones.length !== 1 ? 'es' : ''} · {fmtCurrency(totalInvertido)} invertidos en total
            </p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            style={{
              padding: '10px 20px',
              background: 'linear-gradient(135deg, #10B981, #059669)',
              border: 'none', borderRadius: '12px', color: '#fff',
              fontSize: '13px', fontWeight: 700, cursor: 'pointer',
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              display: 'flex', alignItems: 'center', gap: '7px',
              boxShadow: '0 4px 14px rgba(16,185,129,0.3)',
              letterSpacing: '0.02em',
            }}
          >
            <Heart style={{ width: '15px', height: '15px' }} />
            Nueva inversión
          </button>
        </div>

        {/* Stats admin */}
        {(esAdmin || esColaborador) && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '12px', marginBottom: '24px' }}>
            {[
              { label: 'Total invertido', value: fmtCurrency(totalInvertido), color: '#10B981' },
              { label: 'Pendientes', value: pendientes.length, color: '#F59E0B' },
              { label: 'Total inversiones', value: inversiones.length, color: 'var(--capyme-blue-mid)' },
              { label: 'Inversores únicos', value: new Set(inversiones.map(i => i.inversorId)).size, color: '#8B5CF6' },
            ].map(s => (
              <div key={s.label} style={{ padding: '14px 16px', borderRadius: '12px', background: '#fff', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)' }}>
                <div style={{ fontSize: '18px', fontWeight: 900, color: s.color, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{s.value}</div>
                <div style={{ fontSize: '11px', color: 'var(--gray-500)', fontFamily: "'DM Sans', sans-serif", marginTop: '2px' }}>{s.label}</div>
              </div>
            ))}
          </div>
        )}

        {/* Alerta pendientes */}
        {(esAdmin || esColaborador) && pendientes.length > 0 && (
          <div style={{
            padding: '12px 16px', borderRadius: '12px', marginBottom: '20px',
            background: '#FFFBEB', border: '1px solid #FDE68A',
            display: 'flex', alignItems: 'center', gap: '10px',
          }}>
            <AlertCircle style={{ width: '16px', height: '16px', color: '#D97706', flexShrink: 0 }} />
            <span style={{ fontSize: '13px', fontFamily: "'DM Sans', sans-serif", color: '#92400E', fontWeight: 600 }}>
              {pendientes.length} inversión{pendientes.length !== 1 ? 'es pendientes' : ' pendiente'} de confirmación
            </span>
            <button onClick={() => setFiltroEstado('pendiente')} style={{ marginLeft: 'auto', padding: '4px 12px', border: '1.5px solid #D97706', borderRadius: '8px', background: 'transparent', color: '#D97706', fontSize: '12px', fontWeight: 600, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif" }}>
              Ver pendientes
            </button>
          </div>
        )}

        {/* Filtros */}
        <div style={{ display: 'flex', gap: '10px', marginBottom: '24px', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: '200px', position: 'relative' }}>
            <Search style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', width: '15px', height: '15px', color: 'var(--gray-400)' }} />
            <input value={searchTerm} onChange={e => setSearchTerm(e.target.value)} placeholder="Buscar por referencia, inversor o campaña..."
              style={{ width: '100%', padding: '10px 12px 10px 36px', border: '1.5px solid var(--border)', borderRadius: '10px', fontSize: '14px', fontFamily: "'DM Sans', sans-serif", outline: 'none', boxSizing: 'border-box' }} />
          </div>
          <div style={{ display: 'flex', gap: '6px' }}>
            {[{ v: '', l: 'Todas' }, { v: 'pendiente', l: 'Pendientes' }, { v: 'confirmado', l: 'Confirmadas' }, { v: 'rechazado', l: 'Rechazadas' }].map(({ v, l }) => (
              <button key={v} onClick={() => setFiltroEstado(v)} style={{
                padding: '8px 14px', borderRadius: '20px',
                border: filtroEstado === v ? 'none' : '1.5px solid var(--border)',
                background: filtroEstado === v ? 'linear-gradient(135deg, #10B981, #059669)' : '#fff',
                color: filtroEstado === v ? '#fff' : 'var(--gray-600)',
                fontSize: '12px', fontWeight: 600, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif",
              }}>{l}</button>
            ))}
          </div>
        </div>

        {/* Grid de cards */}
        {inversionesFiltradas.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 20px' }}>
            <TrendingUp style={{ width: '48px', height: '48px', color: 'var(--gray-300)', margin: '0 auto 16px', display: 'block' }} />
            <h3 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--gray-600)', fontFamily: "'Plus Jakarta Sans', sans-serif", margin: '0 0 8px' }}>
              No hay inversiones
            </h3>
            <p style={{ fontSize: '14px', color: 'var(--gray-400)', fontFamily: "'DM Sans', sans-serif", margin: '0 0 24px' }}>
              Apoya una campaña y aparecerá aquí
            </p>
            <button onClick={() => setShowModal(true)} style={{ padding: '10px 24px', background: 'linear-gradient(135deg, #10B981, #059669)', border: 'none', borderRadius: '10px', color: '#fff', fontSize: '13px', fontWeight: 700, cursor: 'pointer', fontFamily: "'Plus Jakarta Sans', sans-serif", boxShadow: '0 4px 14px rgba(16,185,129,0.3)' }}>
              + Hacer mi primera inversión
            </button>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '18px' }}>
            {inversionesFiltradas.map(inv => (
              <InversionCard
                key={inv.id}
                inv={inv}
                currentUser={currentUser}
                esAdmin={esAdmin}
                esColaborador={esColaborador}
                onConfirmar={() => handleConfirmar(inv)}
                onRechazar={() => handleRechazar(inv)}
                onToggle={() => handleToggle(inv)}
              />
            ))}
          </div>
        )}
      </div>

      {showModal && (
        <InversionModal
          campanas={campanas}
          usuarios={usuarios}
          currentUser={currentUser}
          campanaPreseleccionada={campanaPreseleccionada}
          onClose={() => { setShowModal(false); window.history.replaceState({}, '', '/inversiones'); }}
          onSuccess={cargarDatos}
        />
      )}
    </Layout>
  );
};

export default Inversiones;