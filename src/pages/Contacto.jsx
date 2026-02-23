import { useState, useEffect, useCallback } from 'react';
import Layout from '../components/common/Layout';
import { contactoService } from '../services/contactoService';
import {
  Phone, Mail, MapPin, Clock, Facebook, Instagram, Linkedin,
  Globe, MessageSquare, Save, AlertCircle, Eye, ExternalLink,
  Contact, CheckCircle, Lock,
} from 'lucide-react';
import { toast } from 'react-hot-toast';

/* ─────────────────────────────────────────────────────────
   ESTILOS BASE (constantes fuera del componente)
───────────────────────────────────────────────────────── */
const sLabel = {
  display: 'block', fontSize: '12px', fontWeight: 700,
  color: 'var(--gray-500)', marginBottom: '6px',
  fontFamily: "'Plus Jakarta Sans', sans-serif",
  textTransform: 'uppercase', letterSpacing: '0.04em',
};
const sInputBase = {
  width: '100%', padding: '11px 12px',
  border: '1.5px solid var(--border)',
  borderRadius: 'var(--radius-md)',
  fontSize: '14px', fontFamily: "'DM Sans', sans-serif",
  color: 'var(--gray-900)', background: '#fff', outline: 'none',
  transition: 'border-color 150ms, box-shadow 150ms', boxSizing: 'border-box',
};
const sInputIcon = { paddingLeft: '42px' };
const sInputErr  = { borderColor: '#EF4444', boxShadow: '0 0 0 3px rgba(239,68,68,0.10)' };
const sInputOff  = { background: 'var(--gray-50)', color: 'var(--gray-500)', cursor: 'not-allowed', borderColor: 'var(--gray-200)' };

/* ─────────────────────────────────────────────────────────
   SUB-COMPONENTES PUROS (declarados FUERA del componente
   principal → React no los desmonta/remonta en cada render)
───────────────────────────────────────────────────────── */
const ErrorMsg = ({ text }) => (
  <p style={{ margin: '5px 0 0', fontSize: '12px', color: '#EF4444', display: 'flex', alignItems: 'center', gap: '4px', fontFamily: "'DM Sans', sans-serif" }}>
    <AlertCircle style={{ width: '11px', height: '11px', flexShrink: 0 }} /> {text}
  </p>
);

const SectionCard = ({ icon: Icon, title, accentColor, children }) => (
  <div style={{ background: '#fff', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', overflow: 'hidden', boxShadow: 'var(--shadow-sm)', marginBottom: '16px' }}>
    <div style={{ padding: '14px 22px', background: 'var(--gray-50)', borderBottom: '1px solid var(--gray-100)', display: 'flex', alignItems: 'center', gap: '10px' }}>
      <div style={{ width: '30px', height: '30px', borderRadius: '8px', background: `${accentColor}1A`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <Icon style={{ width: '14px', height: '14px', color: accentColor }} />
      </div>
      <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--gray-600)', textTransform: 'uppercase', letterSpacing: '0.06em', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
        {title}
      </span>
    </div>
    <div style={{ padding: '22px' }}>{children}</div>
  </div>
);

const FieldRow = ({ name, label, Icon, type, placeholder, isAdmin, value, onChange, error }) => (
  <div>
    <label htmlFor={`f-${name}`} style={sLabel}>{label}</label>
    <div style={{ position: 'relative' }}>
      <Icon style={{ position: 'absolute', left: '13px', top: '50%', transform: 'translateY(-50%)', width: '15px', height: '15px', color: 'var(--gray-400)', pointerEvents: 'none' }} />
      <input
        id={`f-${name}`}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={!isAdmin}
        style={{ ...sInputBase, ...sInputIcon, ...(error ? sInputErr : {}), ...(!isAdmin ? sInputOff : {}) }}
      />
    </div>
    {error && <ErrorMsg text={error} />}
  </div>
);

const UrlField = ({ name, label, Icon, placeholder, isAdmin, value, onChange, error }) => (
  <div>
    <label htmlFor={`f-${name}`} style={sLabel}>{label}</label>
    <div style={{ position: 'relative' }}>
      <Icon style={{ position: 'absolute', left: '13px', top: '50%', transform: 'translateY(-50%)', width: '15px', height: '15px', color: 'var(--gray-400)', pointerEvents: 'none' }} />
      <input
        id={`f-${name}`}
        name={name}
        type="url"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={!isAdmin}
        style={{ ...sInputBase, ...sInputIcon, paddingRight: value && !error ? '40px' : '12px', ...(error ? sInputErr : {}), ...(!isAdmin ? sInputOff : {}) }}
      />
      {value && !error && (
        <a href={value} target="_blank" rel="noopener noreferrer"
          style={{ position: 'absolute', right: '11px', top: '50%', transform: 'translateY(-50%)', color: 'var(--capyme-blue-mid)', lineHeight: 0 }}>
          <ExternalLink style={{ width: '14px', height: '14px' }} />
        </a>
      )}
    </div>
    {error && <ErrorMsg text={error} />}
  </div>
);

const SocialChip = ({ Icon, label }) => (
  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '4px 12px', background: 'rgba(255,255,255,0.15)', borderRadius: '20px' }}>
    <Icon style={{ width: '12px', height: '12px' }} />
    <span style={{ fontSize: '11px', fontFamily: "'DM Sans', sans-serif", fontWeight: 600 }}>{label}</span>
  </div>
);

/* ─────────────────────────────────────────────────────────
   COMPONENTE PRINCIPAL
───────────────────────────────────────────────────────── */
const initialForm = {
  telefono: '', email: '', direccion: '', horarioAtencion: '',
  whatsapp: '', facebookUrl: '', instagramUrl: '', linkedinUrl: '', sitioWeb: '',
};

const Contacto = () => {
  const authStorage = JSON.parse(localStorage.getItem('auth-storage') || '{}');
  const currentUser = authStorage?.state?.user || {};
  const isAdmin     = currentUser.rol === 'admin';

  const [formData, setFormData] = useState(initialForm);
  const [loading,  setLoading]  = useState(true);
  const [saving,   setSaving]   = useState(false);
  const [saved,    setSaved]    = useState(false);
  const [errors,   setErrors]   = useState({});

  useEffect(() => {
    contactoService.get()
      .then((res) => {
        const d = res.data || {};
        setFormData({
          telefono:        d.telefono        || '',
          email:           d.email           || '',
          direccion:       d.direccion       || '',
          horarioAtencion: d.horarioAtencion || '',
          whatsapp:        d.whatsapp        || '',
          facebookUrl:     d.facebookUrl     || '',
          instagramUrl:    d.instagramUrl    || '',
          linkedinUrl:     d.linkedinUrl     || '',
          sitioWeb:        d.sitioWeb        || '',
        });
      })
      .catch(() => toast.error('Error al cargar información de contacto'))
      .finally(() => setLoading(false));
  }, []);

  /* useCallback evita que la referencia cambie en cada render */
  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => prev[name] ? { ...prev, [name]: '' } : prev);
    setSaved(false);
  }, []);

  const validate = () => {
    const e = {};
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email))
      e.email = 'Email no válido';
    ['sitioWeb', 'facebookUrl', 'instagramUrl', 'linkedinUrl'].forEach((k) => {
      if (formData[k] && !/^https?:\/\//.test(formData[k]))
        e[k] = 'Debe comenzar con https://';
    });
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;
    setSaving(true);
    try {
      await contactoService.update(formData);
      toast.success('Información actualizada correctamente');
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error al guardar');
    } finally {
      setSaving(false);
    }
  };

  const hasPreview = Object.values(formData).some((v) => v.trim() !== '');
  const hasSocial  = formData.sitioWeb || formData.facebookUrl || formData.instagramUrl || formData.linkedinUrl;

  if (loading) return (
    <Layout>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '300px', flexDirection: 'column', gap: '16px' }}>
        <div style={{ width: '40px', height: '40px', border: '3px solid var(--gray-200)', borderTopColor: 'var(--capyme-blue-mid)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
        <span style={{ fontSize: '14px', color: 'var(--gray-500)', fontFamily: "'DM Sans', sans-serif" }}>Cargando…</span>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    </Layout>
  );

  /* Botón guardar como JSX local (no como componente interno) */
  const saveButtonJSX = (
    <button
      onClick={handleSave}
      disabled={saving}
      style={{
        display: 'inline-flex', alignItems: 'center', gap: '8px',
        padding: '10px 22px',
        background: saved
          ? 'linear-gradient(135deg,#059669,#10B981)'
          : saving ? 'var(--gray-300)'
          : 'linear-gradient(135deg, var(--capyme-blue-mid), var(--capyme-blue))',
        color: '#fff', border: 'none', borderRadius: 'var(--radius-md)',
        fontSize: '14px', fontWeight: 600, fontFamily: "'DM Sans', sans-serif",
        cursor: saving ? 'not-allowed' : 'pointer',
        boxShadow: saving ? 'none' : '0 2px 10px rgba(31,78,158,0.28)',
        transition: 'all 150ms ease', whiteSpace: 'nowrap',
      }}
    >
      {saving
        ? <span style={{ width: '14px', height: '14px', border: '2px solid rgba(255,255,255,0.4)', borderTopColor: '#fff', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.7s linear infinite' }} />
        : saved ? <CheckCircle style={{ width: '16px', height: '16px' }} />
        : <Save style={{ width: '16px', height: '16px' }} />
      }
      {saving ? 'Guardando…' : saved ? 'Guardado' : 'Guardar Cambios'}
    </button>
  );

  return (
    <Layout>
      <style>{`
        @keyframes spin   { to { transform: rotate(360deg); } }
        @keyframes fadeIn { from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:translateY(0); } }
        input:not(:disabled):focus, textarea:not(:disabled):focus {
          border-color: var(--capyme-blue-mid) !important;
          box-shadow: 0 0 0 3px rgba(31,78,158,0.12) !important;
        }
      `}</style>

      <div style={{ maxWidth: '820px', margin: '0 auto', paddingBottom: '48px', animation: 'fadeIn 0.3s ease both' }}>

        {/* HEADER */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '28px', flexWrap: 'wrap', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{ width: '48px', height: '48px', background: 'linear-gradient(135deg, var(--capyme-blue-mid), var(--capyme-blue))', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 14px rgba(31,78,158,0.28)', flexShrink: 0 }}>
              <Contact style={{ width: '22px', height: '22px', color: '#fff' }} />
            </div>
            <div>
              <h1 style={{ fontSize: '22px', fontWeight: 800, color: 'var(--gray-900)', fontFamily: "'Plus Jakarta Sans', sans-serif", margin: 0, lineHeight: 1.2 }}>
                Información de Contacto
              </h1>
              <p style={{ fontSize: '13px', color: 'var(--gray-500)', margin: '3px 0 0', fontFamily: "'DM Sans', sans-serif" }}>
                Datos visibles para todos los usuarios del sistema
              </p>
            </div>
          </div>
          {isAdmin && saveButtonJSX}
        </div>

        {/* AVISO LECTURA */}
        {!isAdmin && (
          <div style={{ background: '#FFFBEB', border: '1px solid #FDE68A', borderRadius: 'var(--radius-md)', padding: '12px 16px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Lock style={{ width: '15px', height: '15px', color: '#D97706', flexShrink: 0 }} />
            <span style={{ fontSize: '13px', color: '#92400E', fontFamily: "'DM Sans', sans-serif" }}>
              Solo los administradores pueden editar esta información. Estás en modo lectura.
            </span>
          </div>
        )}

        {/* BANNER PREVIEW */}
        {hasPreview && (
          <div style={{
            background: 'linear-gradient(135deg, var(--capyme-blue) 0%, var(--capyme-blue-mid) 100%)',
            borderRadius: 'var(--radius-lg)', padding: '24px 28px', marginBottom: '20px',
            color: '#fff', position: 'relative', overflow: 'hidden',
          }}>
            <div style={{ position: 'absolute', top: '-40px', right: '-40px', width: '160px', height: '160px', background: 'rgba(255,255,255,0.06)', borderRadius: '50%', pointerEvents: 'none' }} />
            <div style={{ display: 'flex', alignItems: 'center', gap: '7px', marginBottom: '18px' }}>
              <Eye style={{ width: '13px', height: '13px', opacity: 0.7 }} />
              <span style={{ fontSize: '10px', fontWeight: 700, fontFamily: "'Plus Jakarta Sans', sans-serif", textTransform: 'uppercase', letterSpacing: '0.08em', opacity: 0.7 }}>
                Vista previa pública
              </span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '12px', marginBottom: hasSocial ? '16px' : 0 }}>
              {[
                { k: 'telefono',        Icon: Phone,         v: formData.telefono },
                { k: 'whatsapp',        Icon: MessageSquare, v: formData.whatsapp },
                { k: 'email',           Icon: Mail,          v: formData.email },
                { k: 'horarioAtencion', Icon: Clock,         v: formData.horarioAtencion },
              ].filter((f) => f.v).map(({ k, Icon, v }) => (
                <div key={k} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ width: '30px', height: '30px', borderRadius: '8px', background: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Icon style={{ width: '14px', height: '14px' }} />
                  </div>
                  <span style={{ fontSize: '13px', fontFamily: "'DM Sans', sans-serif", opacity: 0.95 }}>{v}</span>
                </div>
              ))}
              {formData.direccion && (
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', gridColumn: '1 / -1' }}>
                  <div style={{ width: '30px', height: '30px', borderRadius: '8px', background: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <MapPin style={{ width: '14px', height: '14px' }} />
                  </div>
                  <span style={{ fontSize: '13px', fontFamily: "'DM Sans', sans-serif", opacity: 0.95, lineHeight: 1.6, paddingTop: '5px' }}>{formData.direccion}</span>
                </div>
              )}
            </div>
            {hasSocial && (
              <div style={{ display: 'flex', gap: '8px', paddingTop: '14px', borderTop: '1px solid rgba(255,255,255,0.15)', flexWrap: 'wrap' }}>
                {formData.sitioWeb     && <SocialChip Icon={Globe}     label="Sitio web" />}
                {formData.facebookUrl  && <SocialChip Icon={Facebook}  label="Facebook" />}
                {formData.instagramUrl && <SocialChip Icon={Instagram} label="Instagram" />}
                {formData.linkedinUrl  && <SocialChip Icon={Linkedin}  label="LinkedIn" />}
              </div>
            )}
          </div>
        )}

        {/* SECCIÓN BÁSICA */}
        <SectionCard icon={Phone} title="Información básica" accentColor="#2B5BA6">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '18px' }}>
            <FieldRow name="telefono"        label="Teléfono"            Icon={Phone}         type="tel"   placeholder="+52 442 123 4567"            isAdmin={isAdmin} value={formData.telefono}        onChange={handleChange} error={errors.telefono} />
            <FieldRow name="whatsapp"        label="WhatsApp"            Icon={MessageSquare} type="tel"   placeholder="+52 442 123 4567"            isAdmin={isAdmin} value={formData.whatsapp}        onChange={handleChange} error={errors.whatsapp} />
            <FieldRow name="email"           label="Email"               Icon={Mail}          type="email" placeholder="contacto@capyme.com"         isAdmin={isAdmin} value={formData.email}           onChange={handleChange} error={errors.email} />
            <FieldRow name="horarioAtencion" label="Horario de Atención" Icon={Clock}         type="text"  placeholder="Lunes a Viernes 9:00 – 18:00" isAdmin={isAdmin} value={formData.horarioAtencion} onChange={handleChange} error={errors.horarioAtencion} />
            <div style={{ gridColumn: '1 / -1' }}>
              <label htmlFor="f-direccion" style={sLabel}>Dirección</label>
              <div style={{ position: 'relative' }}>
                <MapPin style={{ position: 'absolute', left: '13px', top: '13px', width: '15px', height: '15px', color: 'var(--gray-400)', pointerEvents: 'none' }} />
                <textarea
                  id="f-direccion"
                  name="direccion"
                  value={formData.direccion}
                  onChange={handleChange}
                  placeholder="Calle, Número, Colonia, Ciudad, Estado, CP"
                  rows={2}
                  disabled={!isAdmin}
                  style={{ ...sInputBase, paddingLeft: '42px', resize: 'vertical', minHeight: '72px', ...(!isAdmin ? sInputOff : {}) }}
                />
              </div>
            </div>
          </div>
        </SectionCard>

        {/* SECCIÓN REDES */}
        <SectionCard icon={Globe} title="Redes sociales y sitio web" accentColor="#7C3AED">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '18px' }}>
            <div style={{ gridColumn: '1 / -1' }}>
              <UrlField name="sitioWeb"    label="Sitio Web"  Icon={Globe}     placeholder="https://www.capyme.com"              isAdmin={isAdmin} value={formData.sitioWeb}     onChange={handleChange} error={errors.sitioWeb} />
            </div>
            <UrlField name="facebookUrl"  label="Facebook"   Icon={Facebook}  placeholder="https://facebook.com/capyme"         isAdmin={isAdmin} value={formData.facebookUrl}  onChange={handleChange} error={errors.facebookUrl} />
            <UrlField name="instagramUrl" label="Instagram"  Icon={Instagram} placeholder="https://instagram.com/capyme"        isAdmin={isAdmin} value={formData.instagramUrl} onChange={handleChange} error={errors.instagramUrl} />
            <div style={{ gridColumn: '1 / -1' }}>
              <UrlField name="linkedinUrl" label="LinkedIn"  Icon={Linkedin}  placeholder="https://linkedin.com/company/capyme" isAdmin={isAdmin} value={formData.linkedinUrl}  onChange={handleChange} error={errors.linkedinUrl} />
            </div>
          </div>
        </SectionCard>

        {/* BOTÓN FOOTER */}
        {isAdmin && (
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            {saveButtonJSX}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Contacto;