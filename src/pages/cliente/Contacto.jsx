import { useState, useEffect } from 'react';
import Layout from '../../components/common/Layout';
import { contactoService } from '../../services/contactoService';
import {
  Phone, Mail, MapPin, Clock, Facebook, Instagram, Linkedin,
  Globe, MessageSquare, Contact, ExternalLink, ArrowUpRight,
} from 'lucide-react';
import { toast } from 'react-hot-toast';

const ClienteContacto = () => {
  const [contacto, setContacto] = useState(null);
  const [loading,  setLoading]  = useState(true);

  useEffect(() => {
    contactoService.get()
      .then((res) => setContacto(res.data || null))
      .catch(() => toast.error('Error al cargar información de contacto'))
      .finally(() => setLoading(false));
  }, []);

  const hasInfo   = contacto && Object.entries(contacto).some(([k, v]) => k !== 'id' && k !== 'fechaActualizacion' && v);
  const hasSocial = contacto && (contacto.facebookUrl || contacto.instagramUrl || contacto.linkedinUrl || contacto.sitioWeb);

  if (loading) return (
    <Layout>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '300px', flexDirection: 'column', gap: '16px' }}>
        <div style={{ width: '40px', height: '40px', border: '3px solid var(--gray-200)', borderTopColor: 'var(--capyme-blue-mid)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
        <span style={{ fontSize: '14px', color: 'var(--gray-500)', fontFamily: "'DM Sans', sans-serif" }}>Cargando…</span>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    </Layout>
  );

  return (
    <Layout>
      <style>{`
        @keyframes spin  { to { transform: rotate(360deg); } }
        @keyframes fadeIn { from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:translateY(0); } }
        .contact-card { transition: box-shadow 180ms ease, transform 180ms ease; }
        .contact-card:hover { box-shadow: 0 6px 20px rgba(31,78,158,0.10); transform: translateY(-1px); }
        .social-btn { display: inline-flex; align-items: center; gap: 8px; padding: 10px 18px; border-radius: var(--radius-md); font-size: 13px; font-weight: 600; font-family: 'DM Sans', sans-serif; text-decoration: none; cursor: pointer; transition: all 150ms ease; border: 1.5px solid var(--border); background: #fff; color: var(--gray-700); }
        .social-btn:hover { border-color: var(--capyme-blue-mid); color: var(--capyme-blue-mid); background: var(--capyme-blue-pale); }
      `}</style>

      <div style={{ maxWidth: '680px', margin: '0 auto', paddingBottom: '40px', animation: 'fadeIn 0.3s ease both' }}>

        {/* HEADER */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '28px' }}>
          <div style={{ width: '46px', height: '46px', background: 'linear-gradient(135deg, var(--capyme-blue-mid), var(--capyme-blue))', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(31,78,158,0.25)', flexShrink: 0 }}>
            <Contact style={{ width: '22px', height: '22px', color: '#fff' }} />
          </div>
          <div>
            <h1 style={{ fontSize: '22px', fontWeight: 800, color: 'var(--gray-900)', fontFamily: "'Plus Jakarta Sans', sans-serif", margin: 0, lineHeight: 1.2 }}>
              Contáctanos
            </h1>
            <p style={{ fontSize: '13px', color: 'var(--gray-500)', margin: '3px 0 0', fontFamily: "'DM Sans', sans-serif" }}>
              Estamos aquí para ayudarte
            </p>
          </div>
        </div>

        {!hasInfo ? (
          <div style={{ background: '#fff', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '60px 20px', textAlign: 'center', boxShadow: 'var(--shadow-sm)' }}>
            <div style={{ width: '56px', height: '56px', background: 'var(--gray-100)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' }}>
              <Contact style={{ width: '24px', height: '24px', color: 'var(--gray-400)' }} />
            </div>
            <p style={{ fontSize: '15px', fontWeight: 600, color: 'var(--gray-700)', margin: '0 0 6px', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Sin información de contacto aún</p>
            <p style={{ fontSize: '13px', color: 'var(--gray-400)', margin: 0, fontFamily: "'DM Sans', sans-serif" }}>El equipo CAPYME publicará sus datos de contacto pronto</p>
          </div>
        ) : (
          <>
            {/* HERO */}
            <div style={{ background: 'linear-gradient(135deg, var(--capyme-blue) 0%, var(--capyme-blue-mid) 100%)', borderRadius: 'var(--radius-lg)', padding: '32px 36px', marginBottom: '20px', color: '#fff', position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', top: '-40px', right: '-40px', width: '160px', height: '160px', background: 'rgba(255,255,255,0.06)', borderRadius: '50%', pointerEvents: 'none' }} />
              <div style={{ position: 'absolute', bottom: '-20px', left: '30%', width: '80px', height: '80px', background: 'rgba(255,255,255,0.04)', borderRadius: '50%', pointerEvents: 'none' }} />

              <p style={{ fontSize: '12px', fontWeight: 700, opacity: 0.7, textTransform: 'uppercase', letterSpacing: '0.07em', fontFamily: "'Plus Jakarta Sans', sans-serif", margin: '0 0 18px' }}>
                CAPYME — Centro de Apoyo PyME
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {contacto.telefono && <HeroRow Icon={Phone}         text={contacto.telefono} href={`tel:${contacto.telefono}`} />}
                {contacto.whatsapp && <HeroRow Icon={MessageSquare} text={contacto.whatsapp} href={`https://wa.me/${contacto.whatsapp.replace(/\D/g,'')}`} external />}
                {contacto.email    && <HeroRow Icon={Mail}          text={contacto.email}    href={`mailto:${contacto.email}`} />}
                {contacto.horarioAtencion && <HeroRow Icon={Clock}  text={contacto.horarioAtencion} />}
                {contacto.direccion && (
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                    <div style={{ width: '32px', height: '32px', borderRadius: 'var(--radius-md)', background: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <MapPin style={{ width: '15px', height: '15px' }} />
                    </div>
                    <span style={{ fontSize: '14px', fontFamily: "'DM Sans', sans-serif", lineHeight: 1.6, opacity: 0.95, paddingTop: '5px' }}>
                      {contacto.direccion}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* ACCIÓN RÁPIDA: WhatsApp / Email */}
            {(contacto.whatsapp || contacto.email) && (
              <div style={{ display: 'grid', gridTemplateColumns: contacto.whatsapp && contacto.email ? '1fr 1fr' : '1fr', gap: '12px', marginBottom: '16px' }}>
                {contacto.whatsapp && (
                  <a
                    href={`https://wa.me/${contacto.whatsapp.replace(/\D/g, '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', padding: '14px', background: '#25D366', color: '#fff', borderRadius: 'var(--radius-lg)', textDecoration: 'none', fontWeight: 700, fontSize: '14px', fontFamily: "'DM Sans', sans-serif", boxShadow: '0 2px 8px rgba(37,211,102,0.3)', transition: 'all 150ms ease' }}
                    onMouseEnter={(e) => { e.currentTarget.style.opacity = '0.9'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.opacity = '1'; e.currentTarget.style.transform = 'translateY(0)'; }}
                  >
                    <MessageSquare style={{ width: '18px', height: '18px' }} />
                    Escribir por WhatsApp
                    <ArrowUpRight style={{ width: '14px', height: '14px' }} />
                  </a>
                )}
                
              </div>
            )}

            {/* REDES SOCIALES */}
            {hasSocial && (
              <div style={{ background: '#fff', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '22px 24px', boxShadow: 'var(--shadow-sm)' }}>
                <p style={{ fontSize: '11px', fontWeight: 700, color: 'var(--gray-400)', textTransform: 'uppercase', letterSpacing: '0.06em', fontFamily: "'Plus Jakarta Sans', sans-serif", margin: '0 0 16px' }}>
                  Síguenos en redes
                </p>
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                  {contacto.sitioWeb    && <SocialLink href={contacto.sitioWeb}    Icon={Globe}     label="Sitio web" />}
                  {contacto.facebookUrl && <SocialLink href={contacto.facebookUrl} Icon={Facebook}  label="Facebook" />}
                  {contacto.instagramUrl&& <SocialLink href={contacto.instagramUrl}Icon={Instagram} label="Instagram" />}
                  {contacto.linkedinUrl && <SocialLink href={contacto.linkedinUrl} Icon={Linkedin}  label="LinkedIn" />}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </Layout>
  );
};

const HeroRow = ({ Icon, text, href, external }) => {
  const inner = (
    <>
      <div style={{ width: '32px', height: '32px', borderRadius: 'var(--radius-md)', background: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <Icon style={{ width: '15px', height: '15px' }} />
      </div>
      <span style={{ fontSize: '14px', fontFamily: "'DM Sans', sans-serif", opacity: 0.95 }}>{text}</span>
      {external && <ExternalLink style={{ width: '13px', height: '13px', opacity: 0.6, marginLeft: 'auto' }} />}
    </>
  );
  if (href) return (
    <a href={href} target={external ? '_blank' : undefined} rel="noopener noreferrer"
      style={{ display: 'flex', alignItems: 'center', gap: '12px', color: 'inherit', textDecoration: 'none' }}>
      {inner}
    </a>
  );
  return <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>{inner}</div>;
};

const SocialLink = ({ href, Icon, label }) => (
  <a href={href} target="_blank" rel="noopener noreferrer" className="social-btn">
    <Icon style={{ width: '16px', height: '16px' }} />
    {label}
    <ExternalLink style={{ width: '12px', height: '12px', opacity: 0.5 }} />
  </a>
);

export default ClienteContacto;