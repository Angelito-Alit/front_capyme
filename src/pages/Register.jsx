import { useState } from "react";
import { Mail, Lock, Eye, EyeOff, User, Phone, Building2, ArrowRight, CheckCircle2, TrendingUp, Users, Award } from "lucide-react";

export default function Register({ onRegister }) {
  const [form, setForm] = useState({
    nombre: "",
    apellido: "",
    email: "",
    telefono: "",
    empresa: "",
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (form.password !== form.confirmPassword) {
      setError("Las contraseñas no coinciden.");
      return;
    }
    if (form.password.length < 8) {
      setError("La contraseña debe tener al menos 8 caracteres.");
      return;
    }
    setLoading(true);
    try {
      await onRegister?.(form);
      setSuccess(true);
    } catch (err) {
      setError("Ocurrió un error al registrar. Intente de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  const stats = [
    
  ];

  const benefits = [
    
  ];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=DM+Sans:wght@300;400;500&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        .reg-root {
          min-height: 100vh;
          width: 100%;
          display: flex;
          align-items: stretch;
          font-family: 'DM Sans', sans-serif;
          background: #fff;
        }

        /* LEFT PANEL */
        .reg-panel {
          display: none;
          position: relative;
          width: 48%;
          flex-shrink: 0;
          background: linear-gradient(150deg, #0F2A5A 0%, #1F4E9E 55%, #2B69C8 100%);
          overflow: hidden;
          flex-direction: column;
          justify-content: space-between;
          padding: 52px 48px 48px;
        }
        @media (min-width: 960px) { .reg-panel { display: flex; } }

        .reg-circle-1 {
          position: absolute; top: -120px; right: -100px;
          width: 400px; height: 400px; border-radius: 50%;
          background: rgba(255,255,255,0.05); pointer-events: none;
        }
        .reg-circle-2 {
          position: absolute; bottom: -80px; left: -70px;
          width: 300px; height: 300px; border-radius: 50%;
          background: rgba(255,255,255,0.04); pointer-events: none;
        }
        .reg-circle-3 {
          position: absolute; top: 38%; left: -50px;
          width: 180px; height: 180px; border-radius: 50%;
          background: rgba(255,255,255,0.03); pointer-events: none;
        }

        .panel-logo { display: flex; align-items: center; gap: 10px; z-index: 1; }
        .panel-logo-mark {
          width: 38px; height: 38px;
          background: rgba(255,255,255,0.14);
          border: 1.5px solid rgba(255,255,255,0.28);
          border-radius: 10px;
          display: flex; align-items: center; justify-content: center;
        }
        .panel-logo-text {
          font-family: 'Plus Jakarta Sans', sans-serif;
          font-weight: 800; font-size: 18px;
          letter-spacing: 0.1em; color: #fff;
        }

        .panel-body { z-index: 1; }
        .panel-eyebrow {
          display: inline-block;
          background: rgba(255,255,255,0.1);
          border: 1px solid rgba(255,255,255,0.18);
          border-radius: 100px; padding: 5px 14px;
          font-size: 11px; font-weight: 500;
          letter-spacing: 0.1em; text-transform: uppercase;
          color: rgba(255,255,255,0.75); margin-bottom: 22px;
        }
        .panel-headline {
          font-family: 'Plus Jakarta Sans', sans-serif;
          font-size: clamp(24px, 2.4vw, 32px);
          font-weight: 800; line-height: 1.2;
          color: #fff; margin-bottom: 14px;
        }
        .panel-sub {
          font-size: 14px; line-height: 1.7;
          color: rgba(255,255,255,0.6); margin-bottom: 26px;
        }
        .benefits-list { list-style: none; }
        .benefit-item {
          display: flex; align-items: flex-start; gap: 10px;
          margin-bottom: 12px;
          color: rgba(255,255,255,0.78);
          font-size: 13.5px; line-height: 1.5;
        }
        .benefit-check { flex-shrink: 0; margin-top: 1px; color: rgba(255,255,255,0.5); }

        .panel-stats {
          z-index: 1;
          display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 10px;
        }
        .stat-item {
          background: rgba(255,255,255,0.07);
          border: 1px solid rgba(255,255,255,0.12);
          border-radius: 12px; padding: 14px 10px; text-align: center;
        }
        .stat-icon { color: rgba(255,255,255,0.45); display: flex; justify-content: center; margin-bottom: 6px; }
        .stat-value {
          font-family: 'Plus Jakarta Sans', sans-serif;
          font-size: 19px; font-weight: 800; color: #fff;
          display: block; line-height: 1; margin-bottom: 4px;
        }
        .stat-label { font-size: 10px; color: rgba(255,255,255,0.5); line-height: 1.3; }

        /* RIGHT FORM */
        .reg-form-side {
          flex: 1;
          display: flex; align-items: flex-start; justify-content: center;
          padding: 40px 20px;
          background: #fff;
          overflow-y: auto;
        }
        @media (min-width: 480px) { .reg-form-side { padding: 48px 36px; align-items: center; } }
        @media (min-width: 720px) { .reg-form-side { padding: 48px 60px; } }

        .form-card { width: 100%; max-width: 480px; }

        .mobile-logo { display: flex; align-items: center; gap: 10px; margin-bottom: 30px; }
        @media (min-width: 960px) { .mobile-logo { display: none; } }
        .mobile-logo-mark {
          width: 36px; height: 36px;
          background: linear-gradient(135deg, #1F4E9E, #2B69C8);
          border-radius: 9px; display: flex; align-items: center; justify-content: center;
        }
        .mobile-logo-text {
          font-family: 'Plus Jakarta Sans', sans-serif;
          font-weight: 800; font-size: 18px; letter-spacing: 0.1em; color: #0F2A5A;
        }

        .mobile-stats {
          display: flex; justify-content: space-between;
          gap: 8px; margin-bottom: 30px;
          padding: 14px; background: #f0f5ff; border-radius: 12px;
        }
        @media (min-width: 960px) { .mobile-stats { display: none; } }
        .ms-item { text-align: center; flex: 1; }
        .ms-value {
          font-family: 'Plus Jakarta Sans', sans-serif;
          font-size: 16px; font-weight: 800; color: #1F4E9E; display: block;
        }
        .ms-label { font-size: 10px; color: #6b7280; line-height: 1.3; }

        .form-heading {
          font-family: 'Plus Jakarta Sans', sans-serif;
          font-size: clamp(20px, 3.5vw, 26px);
          font-weight: 800; color: #0F2A5A; margin-bottom: 5px;
        }
        .form-subheading { font-size: 14px; color: #6b7280; margin-bottom: 26px; line-height: 1.5; }
        .divider { height: 1px; background: #e5e7eb; margin-bottom: 24px; }

        .field-row {
          display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin-bottom: 18px;
        }
        @media (max-width: 400px) { .field-row { grid-template-columns: 1fr; } }

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
          width: 100%; height: 46px;
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
          color: #9ca3af; padding: 4px; display: flex; transition: color 0.15s;
        }
        .field-toggle:hover { color: #2B5BA6; }
        .password-hint { font-size: 11px; color: #9ca3af; margin-top: 5px; }

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
          box-shadow: 0 4px 16px rgba(31,78,158,0.28); margin-top: 22px;
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

        /* Success state */
        .success-box { text-align: center; padding: 24px 10px; }
        .success-icon { display: flex; justify-content: center; margin-bottom: 18px; color: #16a34a; }
        .success-title {
          font-family: 'Plus Jakarta Sans', sans-serif;
          font-size: 22px; font-weight: 800; color: #0F2A5A; margin-bottom: 10px;
        }
        .success-msg { font-size: 14px; color: #6b7280; line-height: 1.6; margin-bottom: 26px; }
        .btn-login-link {
          display: inline-flex; align-items: center; gap: 8px;
          background: linear-gradient(135deg, #1F4E9E 0%, #2B69C8 100%);
          color: #fff; text-decoration: none;
          border-radius: 10px; padding: 13px 28px;
          font-family: 'Plus Jakarta Sans', sans-serif;
          font-size: 14px; font-weight: 700;
          box-shadow: 0 4px 16px rgba(31,78,158,0.28);
          transition: opacity 0.18s, transform 0.12s;
        }
        .btn-login-link:hover { opacity: 0.9; transform: translateY(-1px); }

        .form-footer { text-align: center; margin-top: 22px; font-size: 13px; color: #6b7280; }
        .form-footer a { color: #2B5BA6; font-weight: 600; text-decoration: none; }
        .form-footer a:hover { text-decoration: underline; }

        .terms-note { font-size: 11px; color: #9ca3af; text-align: center; margin-top: 12px; line-height: 1.5; }
        .terms-note a { color: #2B5BA6; text-decoration: none; }
        .terms-note a:hover { text-decoration: underline; }

        .form-brand { text-align: center; margin-top: 28px; font-size: 11px; color: #c5cad5; letter-spacing: 0.02em; }
      `}</style>

      <div className="reg-root">
        {/* Left panel */}
        <div className="reg-panel">
          <div className="reg-circle-1" /><div className="reg-circle-2" /><div className="reg-circle-3" />

          <div className="panel-logo">
            <div className="panel-logo-mark">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                <polyline points="9 22 9 12 15 12 15 22"/>
              </svg>
            </div>
            <span className="panel-logo-text">CAPYME</span>
          </div>

          <div className="panel-body">
            <span className="panel-eyebrow">Únete a CAPYME</span>
            <h1 className="panel-headline">Comienza a crecer tu negocio desde hoy</h1>
            <p className="panel-sub">
              Regístrate gratis y obtén acceso inmediato a todos los recursos que tu PyME necesita para prosperar.
            </p>
            <ul className="benefits-list">
              {benefits.map((b) => (
                <li className="benefit-item" key={b}>
                  <CheckCircle2 size={15} className="benefit-check" />
                  {b}
                </li>
              ))}
            </ul>
          </div>

          <div className="panel-stats">
            {stats.map(({ icon: Icon, value, label }) => (
              <div className="stat-item" key={label}>
                <div className="stat-icon"><Icon size={16} /></div>
                <span className="stat-value">{value}</span>
                <span className="stat-label">{label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right form */}
        <div className="reg-form-side">
          <div className="form-card">

            <div className="mobile-logo">
              <div className="mobile-logo-mark">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                  <polyline points="9 22 9 12 15 12 15 22"/>
                </svg>
              </div>
              <span className="mobile-logo-text">CAPYME</span>
            </div>

            <div className="mobile-stats">
              {stats.map(({ value, label }) => (
                <div className="ms-item" key={label}>
                  <span className="ms-value">{value}</span>
                  <span className="ms-label">{label}</span>
                </div>
              ))}
            </div>

            {success ? (
              <div className="success-box">
                <div className="success-icon"><CheckCircle2 size={54} /></div>
                <h2 className="success-title">¡Registro exitoso!</h2>
                <p className="success-msg">
                  Tu cuenta ha sido creada correctamente. Ya puedes iniciar sesión y acceder a todos los programas disponibles para tu empresa.
                </p>
                <a href="/login" className="btn-login-link">
                  Iniciar Sesión <ArrowRight size={16} />
                </a>
              </div>
            ) : (
              <>
                <h2 className="form-heading">Crear cuenta</h2>
                <p className="form-subheading">Completa tus datos para registrarte en el sistema</p>
                <div className="divider" />

                <form onSubmit={handleSubmit} noValidate>
                  <div className="field-row">
                    <div>
                      <label className="field-label" htmlFor="nombre">Nombre</label>
                      <div className="field-wrap">
                        <span className="field-icon"><User size={15} /></span>
                        <input id="nombre" type="text" className="field-input"
                          placeholder="Juan" value={form.nombre} onChange={set("nombre")}
                          required autoComplete="given-name" />
                      </div>
                    </div>
                    <div>
                      <label className="field-label" htmlFor="apellido">Apellido</label>
                      <div className="field-wrap">
                        <span className="field-icon"><User size={15} /></span>
                        <input id="apellido" type="text" className="field-input"
                          placeholder="García" value={form.apellido} onChange={set("apellido")}
                          required autoComplete="family-name" />
                      </div>
                    </div>
                  </div>

                  <div className="field-group">
                    <label className="field-label" htmlFor="email">Correo electrónico</label>
                    <div className="field-wrap">
                      <span className="field-icon"><Mail size={15} /></span>
                      <input id="email" type="email" className="field-input"
                        placeholder="correo@empresa.com" value={form.email} onChange={set("email")}
                        required autoComplete="email" />
                    </div>
                  </div>

                  <div className="field-group">
                    <label className="field-label" htmlFor="telefono">Teléfono</label>
                    <div className="field-wrap">
                      <span className="field-icon"><Phone size={15} /></span>
                      <input id="telefono" type="tel" className="field-input"
                        placeholder="+52 442 000 0000" value={form.telefono} onChange={set("telefono")}
                        autoComplete="tel" />
                    </div>
                  </div>

                  <div className="field-group">
                    <label className="field-label" htmlFor="empresa">Nombre de la empresa</label>
                    <div className="field-wrap">
                      <span className="field-icon"><Building2 size={15} /></span>
                      <input id="empresa" type="text" className="field-input"
                        placeholder="Mi Empresa S.A. de C.V." value={form.empresa} onChange={set("empresa")}
                        autoComplete="organization" />
                    </div>
                  </div>

                  <div className="field-row">
                    <div>
                      <label className="field-label" htmlFor="password">Contraseña</label>
                      <div className="field-wrap">
                        <span className="field-icon"><Lock size={15} /></span>
                        <input id="password" type={showPassword ? "text" : "password"} className="field-input"
                          placeholder="••••••••" value={form.password} onChange={set("password")}
                          required autoComplete="new-password" />
                        <button type="button" className="field-toggle"
                          onClick={() => setShowPassword(v => !v)}
                          aria-label={showPassword ? "Ocultar" : "Mostrar"}>
                          {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                        </button>
                      </div>
                      <p className="password-hint">Mín. 8 caracteres</p>
                    </div>
                    <div>
                      <label className="field-label" htmlFor="confirmPassword">Confirmar</label>
                      <div className="field-wrap">
                        <span className="field-icon"><Lock size={15} /></span>
                        <input id="confirmPassword" type={showConfirm ? "text" : "password"} className="field-input"
                          placeholder="••••••••" value={form.confirmPassword} onChange={set("confirmPassword")}
                          required autoComplete="new-password" />
                        <button type="button" className="field-toggle"
                          onClick={() => setShowConfirm(v => !v)}
                          aria-label={showConfirm ? "Ocultar" : "Mostrar"}>
                          {showConfirm ? <EyeOff size={15} /> : <Eye size={15} />}
                        </button>
                      </div>
                    </div>
                  </div>

                  {error && <div className="error-msg">{error}</div>}

                  <button type="submit" className="btn-submit" disabled={loading}>
                    {loading
                      ? <span className="spinner" />
                      : <><span>Crear cuenta</span><ArrowRight size={16} /></>}
                  </button>

                  <p className="terms-note">
                    Al registrarte aceptas nuestros{" "}
                    <a href="/terminos">Términos de uso</a> y{" "}
                    <a href="/privacidad">Política de privacidad</a>.
                  </p>
                </form>

                <p className="form-footer">
                  ¿Ya tienes cuenta?{" "}
                  <a href="/login">Iniciar sesión</a>
                </p>
                <p className="form-brand">
                  CAPYME — Consultoría y Asesoría a la Pequeña y Mediana Empresa
                </p>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}