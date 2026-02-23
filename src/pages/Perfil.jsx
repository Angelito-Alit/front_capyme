import { useState, useEffect } from 'react';
import Layout from '../components/common/Layout';
import { useAuthStore } from '../store/authStore';
import api from '../services/axios';
import {
  User,
  Mail,
  Phone,
  Calendar,
  Shield,
  Save,
  Eye,
  EyeOff,
  Lock,
  CheckCircle,
  AlertCircle,
  Clock,
} from 'lucide-react';
import { toast } from 'react-hot-toast';

/* ── helpers ───────────────────────────────────────────── */
const getRoleName  = (r) => ({ admin: 'Administrador', colaborador: 'Colaborador', cliente: 'Cliente' }[r] || r);
const getRoleStyle = (r) => ({
  admin:       { bg: '#FEF2F2', color: '#DC2626', border: '#FECACA' },
  colaborador: { bg: '#EEF4FF', color: 'var(--capyme-blue-mid)', border: '#BFDBFE' },
  cliente:     { bg: '#F0FDF4', color: '#16A34A', border: '#BBF7D0' },
}[r] || { bg: 'var(--gray-100)', color: 'var(--gray-600)', border: 'var(--border)' });

const formatDate = (d) => d
  ? new Date(d).toLocaleDateString('es-MX', { year: 'numeric', month: 'long', day: 'numeric' })
  : 'N/A';

const getInitials = (nombre, apellido) =>
  `${(nombre || '').charAt(0)}${(apellido || '').charAt(0)}`.toUpperCase();

/* ── tiny sub-components ──────────────────────────────── */
const Label = ({ children }) => (
  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--gray-600)', marginBottom: '6px', fontFamily: "'DM Sans', sans-serif" }}>
    {children}
  </label>
);

const InputBase = ({ icon: Icon, error, ...props }) => (
  <div style={{ position: 'relative' }}>
    {Icon && <Icon style={{ position: 'absolute', left: '11px', top: '50%', transform: 'translateY(-50%)', width: '15px', height: '15px', color: 'var(--gray-400)', pointerEvents: 'none' }} />}
    <input
      {...props}
      style={{
        width: '100%', padding: '10px 12px', paddingLeft: Icon ? '36px' : '12px',
        border: `1px solid ${error ? '#EF4444' : 'var(--border)'}`,
        boxShadow: error ? '0 0 0 2px rgba(239,68,68,0.12)' : 'none',
        borderRadius: 'var(--radius-md)', fontSize: '14px',
        fontFamily: "'DM Sans', sans-serif", color: 'var(--gray-900)',
        background: props.disabled ? 'var(--gray-50)' : '#fff',
        outline: 'none', transition: 'all 200ms ease', boxSizing: 'border-box',
        cursor: props.disabled ? 'not-allowed' : 'text',
        ...props.style,
      }}
    />
  </div>
);

const ErrMsg = ({ text }) => (
  <p style={{ marginTop: '5px', fontSize: '12px', color: '#EF4444', display: 'flex', alignItems: 'center', gap: '4px', fontFamily: "'DM Sans', sans-serif" }}>
    <AlertCircle style={{ width: '12px', height: '12px' }} />{text}
  </p>
);

const InfoRow = ({ icon: Icon, label, value, highlight }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 14px', borderRadius: 'var(--radius-md)', background: 'var(--gray-50)' }}>
    <div style={{ width: '30px', height: '30px', borderRadius: 'var(--radius-sm)', background: 'var(--capyme-blue-pale)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
      <Icon style={{ width: '14px', height: '14px', color: 'var(--capyme-blue-mid)' }} />
    </div>
    <div style={{ flex: 1, minWidth: 0 }}>
      <span style={{ fontSize: '11px', color: 'var(--gray-400)', fontFamily: "'DM Sans', sans-serif", display: 'block', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{label}</span>
      <span style={{ fontSize: '13px', color: highlight ? 'var(--capyme-blue-mid)' : 'var(--gray-800)', fontFamily: "'DM Sans', sans-serif", fontWeight: 600 }}>{value}</span>
    </div>
  </div>
);

/* ══════════════════════════════════════════════════════ */
const Perfil = () => {
  const { user, updateUser } = useAuthStore();

  const [loadingInfo,  setLoadingInfo]  = useState(false);
  const [loadingPass,  setLoadingPass]  = useState(false);
  const [showPassSection, setShowPassSection] = useState(false);
  const [showNewPass,  setShowNewPass]  = useState(false);
  const [showConfPass, setShowConfPass] = useState(false);

  const [formData, setFormData] = useState({ nombre: '', apellido: '', telefono: '' });
  const [formErrors, setFormErrors] = useState({});

  const [passData, setPassData] = useState({ newPassword: '', confirmPassword: '' });
  const [passErrors, setPassErrors] = useState({});

  /* strength meter */
  const passStrength = (() => {
    const p = passData.newPassword;
    if (!p) return 0;
    let s = 0;
    if (p.length >= 6) s++;
    if (p.length >= 10) s++;
    if (/[A-Z]/.test(p)) s++;
    if (/[0-9]/.test(p)) s++;
    if (/[^A-Za-z0-9]/.test(p)) s++;
    return s;
  })();
  const strengthLabel = ['', 'Muy débil', 'Débil', 'Regular', 'Fuerte', 'Muy fuerte'][passStrength];
  const strengthColor = ['', '#EF4444', '#F97316', '#EAB308', '#22C55E', '#16A34A'][passStrength];

  useEffect(() => {
    if (user) setFormData({ nombre: user.nombre || '', apellido: user.apellido || '', telefono: user.telefono || '' });
  }, [user]);

  /* ── validate info ── */
  const validateInfo = () => {
    const e = {};
    if (!formData.nombre.trim()) e.nombre = 'El nombre es requerido';
    if (!formData.apellido.trim()) e.apellido = 'El apellido es requerido';
    setFormErrors(e);
    return !Object.keys(e).length;
  };

  /* ── validate password ── */
  const validatePass = () => {
    const e = {};
    if (!passData.newPassword) e.newPassword = 'Ingresa la nueva contraseña';
    else if (passData.newPassword.length < 6) e.newPassword = 'Mínimo 6 caracteres';
    if (!passData.confirmPassword) e.confirmPassword = 'Confirma la contraseña';
    else if (passData.newPassword !== passData.confirmPassword) e.confirmPassword = 'Las contraseñas no coinciden';
    setPassErrors(e);
    return !Object.keys(e).length;
  };

  /* ── save info ── */
  const handleSaveInfo = async () => {
    if (!validateInfo()) return;
    setLoadingInfo(true);
    try {
      const res = await api.put('/usuarios/perfil', formData);
      updateUser(res.data.data);
      toast.success('Perfil actualizado exitosamente');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error al actualizar perfil');
    } finally { setLoadingInfo(false); }
  };

  /* ── save password ── */
  const handleSavePass = async () => {
    if (!validatePass()) return;
    setLoadingPass(true);
    try {
      await api.put('/usuarios/perfil', { password: passData.newPassword });
      toast.success('Contraseña actualizada exitosamente');
      setPassData({ newPassword: '', confirmPassword: '' });
      setShowPassSection(false);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error al cambiar contraseña');
    } finally { setLoadingPass(false); }
  };

  const roleStyle = getRoleStyle(user?.rol);

  /* ── shared input onChange ── */
  const onChangeInfo = (field) => (e) => {
    setFormData((p) => ({ ...p, [field]: e.target.value }));
    if (formErrors[field]) setFormErrors((p) => ({ ...p, [field]: '' }));
  };
  const onChangePass = (field) => (e) => {
    setPassData((p) => ({ ...p, [field]: e.target.value }));
    if (passErrors[field]) setPassErrors((p) => ({ ...p, [field]: '' }));
  };

  /* ─────────── RENDER ─────────── */
  return (
    <Layout>
      <style>{`
        @keyframes fadeInUp { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes spin { to { transform: rotate(360deg); } }
        .perfil-section { animation: fadeInUp 0.35s ease both; }
        .btn-primary:hover { opacity: 0.9; transform: translateY(-1px); }
        .btn-secondary:hover { background: var(--gray-100) !important; }
        .pass-toggle:hover { color: var(--gray-700) !important; }
      `}</style>

      <div style={{ maxWidth: '860px', margin: '0 auto', padding: '0 0 48px' }}>

        {/* ── PAGE HEADER ── */}
        <div style={{ marginBottom: '28px' }}>
          <h1 style={{ fontSize: '22px', fontWeight: 800, color: 'var(--gray-900)', fontFamily: "'Plus Jakarta Sans', sans-serif", margin: 0, lineHeight: 1.2 }}>Mi Perfil</h1>
          <p style={{ fontSize: '13px', color: 'var(--gray-500)', margin: '4px 0 0', fontFamily: "'DM Sans', sans-serif" }}>Gestiona tu información personal y seguridad de cuenta</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: '20px', alignItems: 'start' }}>

          {/* ══ COLUMNA IZQUIERDA ══ */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

            {/* ── TARJETA IDENTIDAD ── */}
            <div className="perfil-section" style={{ background: '#fff', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', overflow: 'hidden', boxShadow: 'var(--shadow-sm)', animationDelay: '0ms' }}>

              {/* Banner + Avatar */}
              <div style={{ height: '72px', background: 'linear-gradient(135deg, var(--capyme-blue-mid) 0%, var(--capyme-blue) 100%)', position: 'relative' }}>
                <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(circle at 20% 50%, rgba(255,255,255,0.08) 0%, transparent 60%), radial-gradient(circle at 80% 20%, rgba(255,255,255,0.06) 0%, transparent 50%)' }} />
              </div>

              <div style={{ padding: '0 24px 24px', position: 'relative' }}>
                {/* Avatar */}
                <div style={{ display: 'flex', alignItems: 'flex-end', gap: '16px', marginBottom: '20px' }}>
                  <div style={{ width: '72px', height: '72px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--capyme-blue-mid), var(--capyme-blue))', border: '4px solid #fff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: '-36px', boxShadow: '0 4px 16px rgba(31,78,158,0.25)', color: '#fff', fontSize: '24px', fontWeight: 800, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                    {getInitials(user?.nombre, user?.apellido)}
                  </div>
                  <div style={{ paddingBottom: '4px' }}>
                    <h2 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--gray-900)', fontFamily: "'Plus Jakarta Sans', sans-serif", margin: 0, lineHeight: 1.2 }}>
                      {user?.nombre} {user?.apellido}
                    </h2>
                    <p style={{ fontSize: '13px', color: 'var(--gray-500)', margin: '2px 0 0', fontFamily: "'DM Sans', sans-serif" }}>{user?.email}</p>
                  </div>
                  <div style={{ marginLeft: 'auto', paddingBottom: '4px' }}>
                    <span style={{ padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 700, background: roleStyle.bg, color: roleStyle.color, border: `1px solid ${roleStyle.border}`, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                      {getRoleName(user?.rol)}
                    </span>
                  </div>
                </div>

                {/* Info grid */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '20px' }}>
                  <div>
                    <Label>Nombre <span style={{ color: '#EF4444' }}>*</span></Label>
                    <InputBase
                      type="text"
                      value={formData.nombre}
                      onChange={onChangeInfo('nombre')}
                      placeholder="Tu nombre"
                      error={formErrors.nombre}
                    />
                    {formErrors.nombre && <ErrMsg text={formErrors.nombre} />}
                  </div>
                  <div>
                    <Label>Apellido <span style={{ color: '#EF4444' }}>*</span></Label>
                    <InputBase
                      type="text"
                      value={formData.apellido}
                      onChange={onChangeInfo('apellido')}
                      placeholder="Tu apellido"
                      error={formErrors.apellido}
                    />
                    {formErrors.apellido && <ErrMsg text={formErrors.apellido} />}
                  </div>
                </div>

                <div style={{ marginBottom: '20px' }}>
                  <Label>Teléfono</Label>
                  <InputBase
                    icon={Phone}
                    type="tel"
                    value={formData.telefono}
                    onChange={onChangeInfo('telefono')}
                    placeholder="442 123 4567"
                  />
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <button
                    className="btn-primary"
                    onClick={handleSaveInfo}
                    disabled={loadingInfo}
                    style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '9px 20px', background: loadingInfo ? 'var(--gray-300)' : 'linear-gradient(135deg, var(--capyme-blue-mid), var(--capyme-blue))', color: '#fff', border: 'none', borderRadius: 'var(--radius-md)', fontSize: '14px', fontWeight: 600, fontFamily: "'DM Sans', sans-serif", cursor: loadingInfo ? 'not-allowed' : 'pointer', boxShadow: loadingInfo ? 'none' : '0 2px 8px rgba(31,78,158,0.25)', transition: 'all 150ms ease' }}
                  >
                    {loadingInfo
                      ? <><span style={{ width: '14px', height: '14px', border: '2px solid rgba(255,255,255,0.35)', borderTopColor: '#fff', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.7s linear infinite' }} />Guardando…</>
                      : <><Save style={{ width: '14px', height: '14px' }} />Guardar cambios</>
                    }
                  </button>
                </div>
              </div>
            </div>

            {/* ── TARJETA SEGURIDAD ── */}
            <div className="perfil-section" style={{ background: '#fff', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', overflow: 'hidden', boxShadow: 'var(--shadow-sm)', animationDelay: '80ms' }}>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 24px', borderBottom: showPassSection ? '1px solid var(--border)' : 'none' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ width: '34px', height: '34px', borderRadius: 'var(--radius-md)', background: 'var(--capyme-blue-pale)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Lock style={{ width: '15px', height: '15px', color: 'var(--capyme-blue-mid)' }} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--gray-900)', fontFamily: "'Plus Jakarta Sans', sans-serif", margin: 0 }}>Seguridad</h3>
                    <p style={{ fontSize: '12px', color: 'var(--gray-400)', margin: '1px 0 0', fontFamily: "'DM Sans', sans-serif" }}>Contraseña y acceso a la cuenta</p>
                  </div>
                </div>
                {!showPassSection && (
                  <button
                    onClick={() => setShowPassSection(true)}
                    style={{ padding: '7px 14px', background: 'var(--capyme-blue-pale)', color: 'var(--capyme-blue-mid)', border: '1px solid var(--capyme-blue-pale)', borderRadius: 'var(--radius-md)', fontSize: '13px', fontWeight: 600, fontFamily: "'DM Sans', sans-serif", cursor: 'pointer', transition: 'all 150ms ease' }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--capyme-blue-mid)'; e.currentTarget.style.color = '#fff'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = 'var(--capyme-blue-pale)'; e.currentTarget.style.color = 'var(--capyme-blue-mid)'; }}
                  >
                    Cambiar contraseña
                  </button>
                )}
              </div>

              {showPassSection && (
                <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: '14px' }}>

                  {/* Nueva contraseña */}
                  <div>
                    <Label>Nueva contraseña <span style={{ color: '#EF4444' }}>*</span></Label>
                    <div style={{ position: 'relative' }}>
                      <Lock style={{ position: 'absolute', left: '11px', top: '50%', transform: 'translateY(-50%)', width: '15px', height: '15px', color: 'var(--gray-400)', pointerEvents: 'none' }} />
                      <input
                        type={showNewPass ? 'text' : 'password'}
                        value={passData.newPassword}
                        onChange={onChangePass('newPassword')}
                        placeholder="Mínimo 6 caracteres"
                        style={{ width: '100%', padding: '10px 40px 10px 36px', border: `1px solid ${passErrors.newPassword ? '#EF4444' : 'var(--border)'}`, boxShadow: passErrors.newPassword ? '0 0 0 2px rgba(239,68,68,0.12)' : 'none', borderRadius: 'var(--radius-md)', fontSize: '14px', fontFamily: "'DM Sans', sans-serif", color: 'var(--gray-900)', background: '#fff', outline: 'none', transition: 'all 200ms ease', boxSizing: 'border-box' }}
                      />
                      <button
                        type="button"
                        className="pass-toggle"
                        onClick={() => setShowNewPass(!showNewPass)}
                        style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', border: 'none', background: 'transparent', cursor: 'pointer', color: 'var(--gray-400)', padding: '2px', display: 'flex', alignItems: 'center', transition: 'color 150ms ease' }}
                      >
                        {showNewPass ? <EyeOff style={{ width: '15px', height: '15px' }} /> : <Eye style={{ width: '15px', height: '15px' }} />}
                      </button>
                    </div>
                    {passErrors.newPassword && <ErrMsg text={passErrors.newPassword} />}

                    {/* Strength bar */}
                    {passData.newPassword && (
                      <div style={{ marginTop: '8px' }}>
                        <div style={{ display: 'flex', gap: '4px', marginBottom: '4px' }}>
                          {[1,2,3,4,5].map((i) => (
                            <div key={i} style={{ flex: 1, height: '3px', borderRadius: '2px', background: i <= passStrength ? strengthColor : 'var(--gray-200)', transition: 'background 250ms ease' }} />
                          ))}
                        </div>
                        <span style={{ fontSize: '11px', color: strengthColor, fontFamily: "'DM Sans', sans-serif", fontWeight: 600 }}>{strengthLabel}</span>
                      </div>
                    )}
                  </div>

                  {/* Confirmar contraseña */}
                  <div>
                    <Label>Confirmar contraseña <span style={{ color: '#EF4444' }}>*</span></Label>
                    <div style={{ position: 'relative' }}>
                      <Lock style={{ position: 'absolute', left: '11px', top: '50%', transform: 'translateY(-50%)', width: '15px', height: '15px', color: 'var(--gray-400)', pointerEvents: 'none' }} />
                      <input
                        type={showConfPass ? 'text' : 'password'}
                        value={passData.confirmPassword}
                        onChange={onChangePass('confirmPassword')}
                        placeholder="Repite tu nueva contraseña"
                        style={{ width: '100%', padding: '10px 40px 10px 36px', border: `1px solid ${passErrors.confirmPassword ? '#EF4444' : passData.confirmPassword && passData.newPassword === passData.confirmPassword ? '#22C55E' : 'var(--border)'}`, boxShadow: passErrors.confirmPassword ? '0 0 0 2px rgba(239,68,68,0.12)' : passData.confirmPassword && passData.newPassword === passData.confirmPassword ? '0 0 0 2px rgba(34,197,94,0.12)' : 'none', borderRadius: 'var(--radius-md)', fontSize: '14px', fontFamily: "'DM Sans', sans-serif", color: 'var(--gray-900)', background: '#fff', outline: 'none', transition: 'all 200ms ease', boxSizing: 'border-box' }}
                      />
                      <button
                        type="button"
                        className="pass-toggle"
                        onClick={() => setShowConfPass(!showConfPass)}
                        style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', border: 'none', background: 'transparent', cursor: 'pointer', color: 'var(--gray-400)', padding: '2px', display: 'flex', alignItems: 'center', transition: 'color 150ms ease' }}
                      >
                        {showConfPass ? <EyeOff style={{ width: '15px', height: '15px' }} /> : <Eye style={{ width: '15px', height: '15px' }} />}
                      </button>
                      {passData.confirmPassword && passData.newPassword === passData.confirmPassword && (
                        <CheckCircle style={{ position: 'absolute', right: '34px', top: '50%', transform: 'translateY(-50%)', width: '14px', height: '14px', color: '#22C55E', pointerEvents: 'none' }} />
                      )}
                    </div>
                    {passErrors.confirmPassword && <ErrMsg text={passErrors.confirmPassword} />}
                  </div>

                  {/* Actions */}
                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', paddingTop: '4px' }}>
                    <button
                      className="btn-secondary"
                      onClick={() => { setShowPassSection(false); setPassData({ newPassword: '', confirmPassword: '' }); setPassErrors({}); }}
                      style={{ padding: '8px 16px', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', background: '#fff', color: 'var(--gray-700)', fontSize: '13px', fontWeight: 600, fontFamily: "'DM Sans', sans-serif", cursor: 'pointer', transition: 'background 150ms ease' }}
                    >
                      Cancelar
                    </button>
                    <button
                      className="btn-primary"
                      onClick={handleSavePass}
                      disabled={loadingPass}
                      style={{ display: 'flex', alignItems: 'center', gap: '7px', padding: '8px 18px', background: loadingPass ? 'var(--gray-300)' : 'linear-gradient(135deg, var(--capyme-blue-mid), var(--capyme-blue))', color: '#fff', border: 'none', borderRadius: 'var(--radius-md)', fontSize: '13px', fontWeight: 600, fontFamily: "'DM Sans', sans-serif", cursor: loadingPass ? 'not-allowed' : 'pointer', boxShadow: loadingPass ? 'none' : '0 2px 8px rgba(31,78,158,0.25)', transition: 'all 150ms ease' }}
                    >
                      {loadingPass
                        ? <><span style={{ width: '13px', height: '13px', border: '2px solid rgba(255,255,255,0.35)', borderTopColor: '#fff', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.7s linear infinite' }} />Guardando…</>
                        : <><Lock style={{ width: '13px', height: '13px' }} />Actualizar contraseña</>
                      }
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* ══ COLUMNA DERECHA — INFO CUENTA ══ */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

            {/* Info de cuenta */}
            <div className="perfil-section" style={{ background: '#fff', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', overflow: 'hidden', boxShadow: 'var(--shadow-sm)', animationDelay: '40ms' }}>
              <div style={{ padding: '16px 18px', borderBottom: '1px solid var(--border)', background: 'var(--gray-50)' }}>
                <h3 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--gray-700)', fontFamily: "'Plus Jakarta Sans', sans-serif", margin: 0 }}>Información de cuenta</h3>
              </div>
              <div style={{ padding: '14px 18px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <InfoRow icon={Mail}     label="Email"       value={user?.email}              highlight />
                <InfoRow icon={Shield}   label="Rol"         value={getRoleName(user?.rol)} />
                <InfoRow icon={Calendar} label="Miembro desde" value={formatDate(user?.fechaRegistro)} />
                {user?.ultimaSesion && (
                  <InfoRow icon={Clock}  label="Última sesión" value={formatDate(user?.ultimaSesion)} />
                )}
              </div>
            </div>

            {/* Tips card */}
            <div className="perfil-section" style={{ background: 'var(--capyme-blue-pale)', border: '1px solid #BFDBFE', borderRadius: 'var(--radius-lg)', padding: '16px 18px', animationDelay: '120ms' }}>
              <h4 style={{ fontSize: '13px', fontWeight: 700, color: 'var(--capyme-blue-mid)', fontFamily: "'Plus Jakarta Sans', sans-serif", margin: '0 0 10px' }}>💡 Tips de seguridad</h4>
              <ul style={{ margin: 0, padding: '0 0 0 16px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {[
                  'Usa una contraseña de al menos 8 caracteres',
                  'Combina letras, números y símbolos',
                  'No compartas tu contraseña con nadie',
                ].map((tip, i) => (
                  <li key={i} style={{ fontSize: '12px', color: 'var(--capyme-blue)', fontFamily: "'DM Sans', sans-serif", lineHeight: 1.5 }}>{tip}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Perfil;