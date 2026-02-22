import { useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { Mail, Lock, ArrowRight, Eye, EyeOff } from "lucide-react";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const { login, loading, error } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    await login(email, password);
  };

  const stats = [];

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

        .panel-logo {
          display: flex; align-items: center; gap: 10px; z-index: 1;
        }
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

        .panel-stats {
          z-index: 1;
          display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 12px;
        }
        .stat-item {
          background: rgba(255,255,255,0.07);
          border: 1px solid rgba(255,255,255,0.12);
          border-radius: 14px; padding: 18px 12px; text-align: center;
        }
        .stat-icon {
          color: rgba(255,255,255,0.45);
          display: flex; justify-content: center; margin-bottom: 8px;
        }
        .stat-value {
          font-family: 'Plus Jakarta Sans', sans-serif;
          font-size: 22px; font-weight: 800; color: #fff;
          display: block; line-height: 1; margin-bottom: 5px;
        }
        .stat-label { font-size: 11px; color: rgba(255,255,255,0.5); line-height: 1.3; }

        .login-form-side {
          flex: 1;
          display: flex; align-items: center; justify-content: center;
          padding: 40px 20px;
          background: #fff;
        }
        @media (min-width: 480px) { .login-form-side { padding: 60px 36px; } }
        @media (min-width: 720px) { .login-form-side { padding: 60px 64px; } }

        .form-card { width: 100%; max-width: 420px; }

        .mobile-logo {
          display: flex; align-items: center; gap: 10px; margin-bottom: 36px;
        }
        @media (min-width: 900px) { .mobile-logo { display: none; } }
        .mobile-logo-mark {
          width: 36px; height: 36px;
          background: linear-gradient(135deg, #1F4E9E, #2B69C8);
          border-radius: 9px;
          display: flex; align-items: center; justify-content: center;
        }
        .mobile-logo-text {
          font-family: 'Plus Jakarta Sans', sans-serif;
          font-weight: 800; font-size: 18px;
          letter-spacing: 0.1em; color: #0F2A5A;
        }

        .mobile-stats {
          display: flex; justify-content: space-between;
          gap: 8px; margin-bottom: 36px;
          padding: 16px; background: #f0f5ff;
          border-radius: 12px;
        }
        @media (min-width: 900px) { .mobile-stats { display: none; } }
        .ms-item { text-align: center; flex: 1; }
        .ms-value {
          font-family: 'Plus Jakarta Sans', sans-serif;
          font-size: 17px; font-weight: 800;
          color: #1F4E9E; display: block;
        }
        .ms-label { font-size: 10px; color: #6b7280; line-height: 1.3; }

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

        .form-footer {
          text-align: center; margin-top: 26px;
          font-size: 13px; color: #6b7280;
        }
        .form-footer a {
          color: #2B5BA6; font-weight: 600; text-decoration: none;
        }
        .form-footer a:hover { text-decoration: underline; }

        .form-brand {
          text-align: center; margin-top: 36px;
          font-size: 11px; color: #c5cad5; letter-spacing: 0.02em;
        }
      `}</style>

      <div className="login-root">
        <div className="login-panel">
          <div className="panel-circle-1" />
          <div className="panel-circle-2" />
          <div className="panel-circle-3" />

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
            <span className="panel-eyebrow">Plataforma Empresarial</span>
            <h1 className="panel-headline">
              Impulsa tu negocio con los mejores programas gubernamentales
            </h1>
            <p className="panel-sub">
              Accede a asesoría especializada, financiamiento y cursos de capacitación diseñados para PyMEs.
            </p>
          </div>

          <div className="panel-stats">
            {stats.map(({ icon: Icon, value, label }) => (
              <div className="stat-item" key={label}>
                <div className="stat-icon"><Icon size={18} /></div>
                <span className="stat-value">{value}</span>
                <span className="stat-label">{label}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="login-form-side">
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

            <p className="form-footer">
            </p>
            <p className="form-brand">
              CAPYME — Consultoría y Asesoría a la Pequeña y Mediana Empresa
            </p>
          </div>
        </div>
      </div>
    </>
  );
}