import { useEffect, useState } from 'react';
import { useAuthStore } from '../store/authStore';
import { ShieldOff, Mail, MessageCircle, X } from 'lucide-react';

/**
 * InactivoModal
 * Se muestra automáticamente cuando el backend responde que el usuario está inactivo.
 * Lee los datos de contacto del primer administrador guardados en el store.
 */
const InactivoModal = () => {
  const { inactivoModal, inactivoContacto, cerrarInactivoModal, logout } = useAuthStore();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (inactivoModal) {
      // pequeño delay para la animación de entrada
      requestAnimationFrame(() => setVisible(true));
    } else {
      setVisible(false);
    }
  }, [inactivoModal]);

  if (!inactivoModal) return null;

  const handleClose = () => {
    cerrarInactivoModal();
    logout();
  };

  const email = inactivoContacto?.email || null;
  const whatsapp = inactivoContacto?.whatsapp || null;
  const whatsappUrl = whatsapp
    ? `https://wa.me/${whatsapp.replace(/\D/g, '')}?text=${encodeURIComponent('Hola, me han dado de baja en CAPYME y necesito más información.')}`
    : null;

  return (
    <>
      <style>{`
        @keyframes imo-fadeIn   { from { opacity: 0 } to { opacity: 1 } }
        @keyframes imo-slideUp  { from { opacity: 0; transform: translateY(28px) scale(0.97) } to { opacity: 1; transform: translateY(0) scale(1) } }
        @keyframes imo-pulse    { 0%,100% { transform: scale(1) } 50% { transform: scale(1.08) } }

        .imo-overlay {
          position: fixed; inset: 0; z-index: 9999;
          background: rgba(10,18,40,0.72);
          backdrop-filter: blur(4px);
          display: flex; align-items: center; justify-content: center;
          padding: 20px;
          animation: imo-fadeIn 0.22s ease;
        }
        .imo-card {
          background: #fff;
          border-radius: 20px;
          width: 100%; max-width: 420px;
          box-shadow: 0 24px 80px rgba(10,18,40,0.28), 0 4px 16px rgba(10,18,40,0.12);
          overflow: hidden;
          animation: imo-slideUp 0.3s cubic-bezier(.22,.68,0,1.2);
        }

        .imo-header {
          background: linear-gradient(135deg, #1a1a2e 0%, #16213e 60%, #0f3460 100%);
          padding: 32px 28px 28px;
          text-align: center;
          position: relative;
        }
        .imo-icon-wrap {
          width: 64px; height: 64px;
          background: rgba(239,68,68,0.15);
          border: 2px solid rgba(239,68,68,0.3);
          border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          margin: 0 auto 16px;
          animation: imo-pulse 2.4s ease-in-out infinite;
        }
        .imo-title {
          font-family: 'Plus Jakarta Sans', sans-serif;
          font-size: 20px; font-weight: 800;
          color: #fff; margin: 0 0 8px;
          letter-spacing: -0.01em;
        }
        .imo-subtitle {
          font-size: 13px; color: rgba(255,255,255,0.55);
          line-height: 1.5; margin: 0;
        }

        .imo-body {
          padding: 24px 28px 28px;
        }
        .imo-msg {
          background: #fef2f2;
          border: 1px solid #fecaca;
          border-radius: 10px;
          padding: 14px 16px;
          font-size: 14px; color: #7f1d1d;
          line-height: 1.6; margin-bottom: 20px;
          text-align: center;
        }
        .imo-contact-label {
          font-family: 'Plus Jakarta Sans', sans-serif;
          font-size: 11px; font-weight: 700;
          letter-spacing: 0.08em; text-transform: uppercase;
          color: #6b7280; margin-bottom: 10px;
          text-align: center;
        }
        .imo-contact-btns {
          display: flex; gap: 10px; flex-direction: column;
        }
        .imo-btn {
          display: flex; align-items: center; justify-content: center;
          gap: 8px; width: 100%; height: 46px;
          border: none; border-radius: 10px;
          font-family: 'Plus Jakarta Sans', sans-serif;
          font-size: 14px; font-weight: 600;
          cursor: pointer; text-decoration: none;
          transition: opacity 0.16s, transform 0.1s, box-shadow 0.16s;
        }
        .imo-btn:hover { opacity: 0.88; transform: translateY(-1px); }
        .imo-btn:active { transform: translateY(0); }

        .imo-btn-email {
          background: #f8faff;
          border: 1.5px solid #dbeafe;
          color: #1d4ed8;
        }
        .imo-btn-email:hover { background: #eff6ff; box-shadow: 0 3px 12px rgba(29,78,216,0.12); }

        .imo-btn-wa {
          background: linear-gradient(135deg, #25d366, #128c7e);
          color: #fff;
          box-shadow: 0 4px 14px rgba(37,211,102,0.3);
        }
        .imo-btn-wa:hover { box-shadow: 0 6px 20px rgba(37,211,102,0.4); }

        .imo-btn-close {
          background: linear-gradient(135deg, #1F4E9E, #2B69C8);
          color: #fff;
          margin-top: 12px;
          box-shadow: 0 4px 14px rgba(31,78,158,0.28);
        }
        .imo-btn-close:hover { box-shadow: 0 6px 20px rgba(31,78,158,0.38); }

        .imo-no-contact {
          text-align: center; font-size: 13px;
          color: #9ca3af; padding: 8px 0;
        }
        .imo-divider {
          height: 1px; background: #f3f4f6;
          margin: 16px 0;
        }
      `}</style>

      <div className="imo-overlay">
        <div className="imo-card">
          <div className="imo-header">
            <div className="imo-icon-wrap">
              <ShieldOff size={28} color="#ef4444" />
            </div>
            <h2 className="imo-title">Cuenta desactivada</h2>
            <p className="imo-subtitle">Tu acceso ha sido suspendido por un administrador</p>
          </div>

          <div className="imo-body">
            <div className="imo-msg">
              Tu usuario ha sido dado de baja del sistema CAPYME. Si crees que esto es un error, comunícate con nosotros.
            </div>

            {(email || whatsapp) ? (
              <>
                <p className="imo-contact-label">Contactar a CAPYME</p>
                <div className="imo-contact-btns">
                  {email && (
                    <a className="imo-btn imo-btn-email" href={`mailto:${email}`}>
                      <Mail size={16} />
                      {email}
                    </a>
                  )}
                  {whatsappUrl && (
                    <a className="imo-btn imo-btn-wa" href={whatsappUrl} target="_blank" rel="noreferrer">
                      <MessageCircle size={16} />
                      WhatsApp: {whatsapp}
                    </a>
                  )}
                </div>
              </>
            ) : (
              <p className="imo-no-contact">Contacta directamente con CAPYME para más información.</p>
            )}

            <div className="imo-divider" />
            <button className="imo-btn imo-btn-close" onClick={handleClose}>
              <X size={16} />
              Cerrar sesión
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default InactivoModal;