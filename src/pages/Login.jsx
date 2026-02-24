import { useState, useEffect } from "react";
import { useAuth } from "../hooks/useAuth";
import { Mail, Lock, ArrowRight, Eye, EyeOff, Phone, MessageCircle } from "lucide-react";
import axios from "axios";
import LogoCapyme from "../assets/LogoCapyme.png";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const { login, loading, error } = useAuth();

  const [contacto, setContacto] = useState(null);

  useEffect(() => {
    // Endpoint público — no requiere token
    axios
      .get(`${import.meta.env.VITE_API_URL || "http://localhost:3000/api"}/contacto`)
      .then((res) => {
        if (res.data?.success && res.data?.data) {
          setContacto(res.data.data);
        }
      })
      .catch(() => {});
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    await login(email, password);
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=DM+Sans:wght@300;400;500&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        .login-root {
          min-height: 100vh;
          width: 100%;
          display: flex;
          align-items: stretch;
          font-family: 'DM Sans', sans-serif;
          background: #fff;
        }

        /* ── Panel izquierdo ── */
        .login-panel {
          display: none;
          position: relative;
          width: 52%;
          flex-shrink: 0;
          background: linear-gradient(150deg, #0F2A5A 0%, #1F4E9E 55%, #2B69C8 100%);
          overflow: hidden;
          flex-direction: column;
          justify-content: space-between;
          padding: 52px 52px 48px;
        }
        @media (min-width: 900px) { .login-panel { display: flex; } }

        .panel-circle-1 {
          position: absolute; top: -140px; right: -100px;
          width: 440px; height: 440px; border-radius: 50%;
          background: rgba(255,255,255,0.05); pointer-events: none;
        }
        .panel-circle-2 {
          position: absolute; bottom: -100px; left: -80px;
          width: 340px; height: 340px; border-radius: 50%;
          background: rgba(255,255,255,0.04); pointer-events: none;
        }
        .panel-circle-3 {
          position: absolute; top: 42%; left: -60px;
          width: 200px; height: 200px; border-radius: 50%;
          background: rgba(255,255,255,0.03); pointer-events: none;
        }

        /* Logo panel */
        .panel-logo {
          display: flex; align-items: center; z-index: 1;
        }
        .panel-logo-img {
          height: 100px; width: auto;
          object-fit: contain;
          background: rgba(255,255,255,0.12);
          padding: 6px 12px;
          border-radius: 10px;
          backdrop-filter: blur(4px);
        }

        /* Cuerpo panel */
        .panel-body { z-index: 1; }
        .panel-eyebrow {
          display: inline-block;
          background: rgba(255,255,255,0.1);
          border: 1px solid rgba(255,255,255,0.18);
          border-radius: 100px;
          padding: 5px 14px;
          font-size: 11px; font-weight: 500;
          letter-spacing: 0.1em; text-transform: uppercase;
          color: rgba(255,255,255,0.75);
          margin-bottom: 22px;
        }
        .panel-headline {
          font-family: 'Plus Jakarta Sans', sans-serif;
          font-size: clamp(26px, 2.6vw, 36px);
          font-weight: 800; line-height: 1.2;
          color: #fff; margin-bottom: 18px;
        }
        .panel-sub {
          font-size: 15px; line-height: 1.7;
          color: rgba(255,255,255,0.6); max-width: 340px;
        }

        /* Contacto panel (pie) */
        .panel-contact {
          z-index: 1;
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        .panel-contact-label {
          font-size: 10px; font-weight: 700;
          letter-spacing: 0.1em; text-transform: uppercase;
          color: rgba(255,255,255,0.4);
          margin-bottom: 2px;
          font-family: 'Plus Jakarta Sans', sans-serif;
        }
        .panel-contact-item {
          display: flex; align-items: center; gap: 10px;
          background: rgba(255,255,255,0.07);
          border: 1px solid rgba(255,255,255,0.12);
          border-radius: 10px;
          padding: 11px 14px;
          text-decoration: none;
          transition: background 0.18s;
        }
        .panel-contact-item:hover {
          background: rgba(255,255,255,0.12);
        }
        .panel-contact-icon {
          width: 32px; height: 32px;
          background: rgba(255,255,255,0.12);
          border-radius: 8px;
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0;
        }
        .panel-contact-text {
          display: flex; flex-direction: column; gap: 1px;
        }
        .panel-contact-type {
          font-size: 10px; font-weight: 600;
          color: rgba(255,255,255,0.45);
          text-transform: uppercase; letter-spacing: 0.06em;
          font-family: 'Plus Jakarta Sans', sans-serif;
        }
        .panel-contact-value {
          font-size: 13px; font-weight: 500;
          color: #fff;
          font-family: 'DM Sans', sans-serif;
        }

        /* ── Formulario (lado derecho) ── */
        .login-form-side {
          flex: 1;
          display: flex; align-items: center; justify-content: center;
          padding: 40px 20px;
          background: #fff;
        }
        @media (min-width: 480px) { .login-form-side { padding: 60px 36px; } }
        @media (min-width: 720px) { .login-form-side { padding: 60px 64px; } }

        .form-card { width: 100%; max-width: 420px; }

        /* Logo móvil */
        .mobile-logo {
          display: flex; align-items: center; margin-bottom: 36px;
        }
        @media (min-width: 900px) { .mobile-logo { display: none; } }
        .mobile-logo-img {
          height: 42px; width: auto;
          object-fit: contain;
        }

        /* Contacto móvil (debajo del logo) */
        .mobile-contact {
          display: flex; gap: 8px; flex-wrap: wrap;
          margin-bottom: 32px;
        }
        @media (min-width: 900px) { .mobile-contact { display: none; } }
        .mobile-contact-pill {
          display: flex; align-items: center; gap: 6px;
          background: #f0f5ff; border: 1px solid #dbeafe;
          border-radius: 100px; padding: 5px 12px;
          font-size: 12px; color: #1d4ed8;
          font-family: 'DM Sans', sans-serif;
          text-decoration: none;
          transition: background 0.15s;
        }
        .mobile-contact-pill:hover { background: #dbeafe; }

        .form-heading {
          font-family: 'Plus Jakarta Sans', sans-serif;
          font-size: clamp(22px, 4vw, 28px);
          font-weight: 800; color: #0F2A5A; margin-bottom: 6px;
        }
        .form-subheading {
          font-size: 14px; color: #6b7280; margin-bottom: 32px; line-height: 1.5;
        }
        .divider { height: 1px; background: #e5e7eb; margin-bottom: 30px; }

        .field-group { margin-bottom: 18px; }
        .field-label {
          display: block; font-size: 11px; font-weight: 600;
          letter-spacing: 0.08em; text-transform: uppercase;
          color: #374151; margin-bottom: 7px;
        }
        .field-wrap { position: relative; }
        .field-icon {
          position: absolute; left: 13px; top: 50%;
          transform: translateY(-50%); color: #9ca3af;
          pointer-events: none; display: flex; align-items: center;
        }
        .field-input {
          width: 100%; height: 48px;
          padding: 0 44px 0 41px;
          border: 1.5px solid #e5e7eb; border-radius: 10px;
          font-family: 'DM Sans', sans-serif; font-size: 14px;
          color: #111827; background: #fafafa;
          outline: none; appearance: none;
          transition: border-color 0.18s, background 0.18s, box-shadow 0.18s;
        }
        .field-input::placeholder { color: #b0b8c4; }
        .field-input:focus {
          border-color: #2B5BA6; background: #fff;
          box-shadow: 0 0 0 3px rgba(43,91,166,0.1);
        }
        .field-toggle {
          position: absolute; right: 13px; top: 50%;
          transform: translateY(-50%);
          background: none; border: none; cursor: pointer;
          color: #9ca3af; padding: 4px; display: flex;
          transition: color 0.15s;
        }
        .field-toggle:hover { color: #2B5BA6; }

        .error-msg {
          background: #fef2f2; border: 1px solid #fecaca;
          border-radius: 8px; padding: 10px 14px;
          font-size: 13px; color: #dc2626; margin-bottom: 16px;
        }

        .btn-submit {
          width: 100%; height: 50px;
          background: linear-gradient(135deg, #1F4E9E 0%, #2B69C8 100%);
          color: #fff; border: none; border-radius: 10px;
          font-family: 'Plus Jakarta Sans', sans-serif;
          font-size: 15px; font-weight: 700;
          cursor: pointer; display: flex; align-items: center;
          justify-content: center; gap: 8px;
          transition: opacity 0.18s, transform 0.12s, box-shadow 0.18s;
          box-shadow: 0 4px 16px rgba(31,78,158,0.28);
          margin-top: 26px;
        }
        .btn-submit:hover:not(:disabled) {
          opacity: 0.92; transform: translateY(-1px);
          box-shadow: 0 6px 22px rgba(31,78,158,0.36);
        }
        .btn-submit:active:not(:disabled) { transform: translateY(0); }
        .btn-submit:disabled { opacity: 0.6; cursor: not-allowed; }

        .spinner {
          width: 18px; height: 18px;
          border: 2.5px solid rgba(255,255,255,0.35);
          border-top-color: #fff; border-radius: 50%;
          animation: spin 0.7s linear infinite;
        }
        @keyframes spin { to { transform: rotate(360deg); } }

        .form-brand {
          text-align: center; margin-top: 36px;
          font-size: 11px; color: #c5cad5; letter-spacing: 0.02em;
        }
      `}</style>

      <div className="login-root">

        {/* ════ PANEL IZQUIERDO ════ */}
        <div className="login-panel">
          <div className="panel-circle-1" />
          <div className="panel-circle-2" />
          <div className="panel-circle-3" />

          {/* Logo */}
          <div className="panel-logo">
            <img src={LogoCapyme} alt="CAPYME" className="panel-logo-img" />
          </div>

          {/* Headline */}
          <div className="panel-body">
            <h1 className="panel-headline">
              Impulsa tu negocio con los mejores programas gubernamentales
            </h1>
            <p className="panel-sub">
              Accede a asesoría especializada, financiamiento y cursos de capacitación diseñados para PyMEs.
            </p>
          </div>

          {/* Contacto (pie del panel) */}
          {contacto && (contacto.email || contacto.whatsapp || contacto.telefono) && (
            <div className="panel-contact">
              <span className="panel-contact-label">Contacto CAPYME</span>

              {contacto.email && (
                <a href={`mailto:${contacto.email}`} className="panel-contact-item">
                  <div className="panel-contact-icon">
                    <Mail size={15} color="rgba(255,255,255,0.8)" />
                  </div>
                  <div className="panel-contact-text">
                    <span className="panel-contact-type">Correo</span>
                    <span className="panel-contact-value">{contacto.email}</span>
                  </div>
                </a>
              )}

              {contacto.whatsapp && (
                <a
                  href={`https://wa.me/${contacto.whatsapp.replace(/\D/g, "")}?text=${encodeURIComponent("Hola, necesito información sobre CAPYME.")}`}
                  target="_blank" rel="noreferrer"
                  className="panel-contact-item"
                >
                  <div className="panel-contact-icon">
                    <MessageCircle size={15} color="rgba(255,255,255,0.8)" />
                  </div>
                  <div className="panel-contact-text">
                    <span className="panel-contact-type">WhatsApp</span>
                    <span className="panel-contact-value">{contacto.whatsapp}</span>
                  </div>
                </a>
              )}

              {contacto.telefono && (
                <a href={`tel:${contacto.telefono}`} className="panel-contact-item">
                  <div className="panel-contact-icon">
                    <Phone size={15} color="rgba(255,255,255,0.8)" />
                  </div>
                  <div className="panel-contact-text">
                    <span className="panel-contact-type">Teléfono</span>
                    <span className="panel-contact-value">{contacto.telefono}</span>
                  </div>
                </a>
              )}
            </div>
          )}
        </div>

        {/* ════ FORMULARIO ════ */}
        <div className="login-form-side">
          <div className="form-card">

            {/* Logo móvil */}
            <div className="mobile-logo">
              <img src={LogoCapyme} alt="CAPYME" className="mobile-logo-img" />
            </div>

            {/* Contacto móvil (pills) */}
            {contacto && (contacto.email || contacto.whatsapp || contacto.telefono) && (
              <div className="mobile-contact">
                {contacto.email && (
                  <a href={`mailto:${contacto.email}`} className="mobile-contact-pill">
                    <Mail size={12} />
                    {contacto.email}
                  </a>
                )}
                {contacto.whatsapp && (
                  <a
                    href={`https://wa.me/${contacto.whatsapp.replace(/\D/g, "")}?text=${encodeURIComponent("Hola, necesito información sobre CAPYME.")}`}
                    target="_blank" rel="noreferrer"
                    className="mobile-contact-pill"
                    style={{ color: '#16a34a', background: '#f0fdf4', borderColor: '#bbf7d0' }}
                  >
                    <MessageCircle size={12} />
                    {contacto.whatsapp}
                  </a>
                )}
                {contacto.telefono && (
                  <a href={`tel:${contacto.telefono}`} className="mobile-contact-pill">
                    <Phone size={12} />
                    {contacto.telefono}
                  </a>
                )}
              </div>
            )}

            <h2 className="form-heading">Bienvenido de nuevo</h2>
            <p className="form-subheading">Ingresa tus credenciales para acceder al sistema</p>
            <div className="divider" />

            <form onSubmit={handleSubmit} noValidate>
              <div className="field-group">
                <label className="field-label" htmlFor="email">Correo electrónico</label>
                <div className="field-wrap">
                  <span className="field-icon"><Mail size={16} /></span>
                  <input
                    id="email" type="email" className="field-input"
                    placeholder="correo@empresa.com"
                    value={email} onChange={e => setEmail(e.target.value)}
                    required autoComplete="email"
                  />
                </div>
              </div>

              <div className="field-group">
                <label className="field-label" htmlFor="password">Contraseña</label>
                <div className="field-wrap">
                  <span className="field-icon"><Lock size={16} /></span>
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    className="field-input"
                    placeholder="••••••••"
                    value={password} onChange={e => setPassword(e.target.value)}
                    required autoComplete="current-password"
                  />
                  <button
                    type="button" className="field-toggle"
                    onClick={() => setShowPassword(v => !v)}
                    aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {error && <div className="error-msg">{error}</div>}

              <button type="submit" className="btn-submit" disabled={loading}>
                {loading
                  ? <span className="spinner" />
                  : <><span>Iniciar Sesión</span><ArrowRight size={16} /></>
                }
              </button>
            </form>

            <p className="form-brand">
              CAPYME — Consultoría y Asesoría a la Pequeña y Mediana Empresa
            </p>
          </div>
        </div>
      </div>
    </>
  );
}