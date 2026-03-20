import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { cursosService } from '../services/cursosService';
import { CheckCircle, GraduationCap, ArrowRight } from 'lucide-react';

const PagoExitoso = () => {
  const navigate       = useNavigate();
  const [searchParams] = useSearchParams();
  const [verificando,  setVerificando]  = useState(true);
  const [segundos,     setSegundos]     = useState(6);

  const paymentId = searchParams.get('payment_id');
  const status    = searchParams.get('status');
  const extRef    = searchParams.get('external_reference');

  // Confirmar en BD por si el webhook llega tarde
  useEffect(() => {
    const run = async () => {
      if (extRef && status === 'approved') {
        try { await cursosService.confirmarPorReferencia(extRef); } catch {}
      }
      setVerificando(false);
    };
    run();
  }, []); // eslint-disable-line

  // Cuenta regresiva → cursos
  useEffect(() => {
    if (verificando) return;
    if (segundos <= 0) { navigate('/cliente/cursos'); return; }
    const t = setTimeout(() => setSegundos(s => s - 1), 1000);
    return () => clearTimeout(t);
  }, [segundos, verificando, navigate]);

  return (
    <>
      <style>{`
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
        body{font-family:'DM Sans',system-ui,sans-serif;}
        @keyframes fadeUp  { from{opacity:0;transform:translateY(28px);}to{opacity:1;transform:translateY(0);} }
        @keyframes popIn   { from{opacity:0;transform:scale(0.3);}to{opacity:1;transform:scale(1);} }
        @keyframes pulse   { 0%,100%{transform:scale(1);}50%{transform:scale(1.1);} }
        @keyframes spin    { to{transform:rotate(360deg);} }
        @keyframes fadeIn  { from{opacity:0;}to{opacity:1;} }
        @keyframes shimmer {
          0%   { background-position: -200% 0; }
          100% { background-position:  200% 0; }
        }
      `}</style>

      <div style={{ minHeight: '100vh', background: 'linear-gradient(145deg,#f0fdf4 0%,#dcfce7 35%,#ecfdf5 60%,#f0f9ff 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>

        <div style={{ background: '#fff', borderRadius: '24px', maxWidth: '460px', width: '100%', boxShadow: '0 32px 80px rgba(0,0,0,0.11)', overflow: 'hidden', animation: 'fadeUp 0.5s cubic-bezier(0.16,1,0.3,1) both' }}>

          {/* Banner verde */}
          <div style={{ background: 'linear-gradient(135deg,#059669 0%,#10b981 60%,#34d399 100%)', padding: '44px 32px 40px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: '-50px', right: '-50px', width: '160px', height: '160px', background: 'rgba(255,255,255,0.07)', borderRadius: '50%' }} />
            <div style={{ position: 'absolute', bottom: '-30px', left: '-30px', width: '100px', height: '100px', background: 'rgba(255,255,255,0.05)', borderRadius: '50%' }} />

            {verificando ? (
              <div style={{ width: '80px', height: '80px', margin: '0 auto 20px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="56" height="56" viewBox="0 0 56 56" style={{ animation: 'spin 0.9s linear infinite' }}>
                  <circle cx="28" cy="28" r="24" fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth="4"/>
                  <path d="M28 4 A24 24 0 0 1 52 28" fill="none" stroke="white" strokeWidth="4" strokeLinecap="round"/>
                </svg>
              </div>
            ) : (
              <div style={{ width: '80px', height: '80px', background: 'rgba(255,255,255,0.2)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', border: '3px solid rgba(255,255,255,0.5)', animation: 'popIn 0.6s cubic-bezier(0.175,0.885,0.32,1.275) both' }}>
                <CheckCircle style={{ width: '46px', height: '46px', color: '#fff', animation: 'pulse 2.5s ease-in-out infinite' }} />
              </div>
            )}

            <h1 style={{ fontSize: '28px', fontWeight: 800, color: '#fff', margin: '0 0 8px', fontFamily: "'Plus Jakarta Sans',sans-serif", letterSpacing: '-0.02em', lineHeight: 1.2 }}>
              {verificando ? 'Verificando pago…' : '¡Pago exitoso!'}
            </h1>
            <p style={{ fontSize: '15px', color: 'rgba(255,255,255,0.88)', margin: 0, lineHeight: 1.5 }}>
              {verificando ? 'Confirmando tu transacción con Mercado Pago' : '¡Tu inscripción ha sido confirmada!'}
            </p>
          </div>

          {/* Cuerpo */}
          {!verificando && (
            <div style={{ padding: '28px 32px 36px', animation: 'fadeIn 0.4s ease both' }}>

              {/* Tarjeta de estado */}
              <div style={{ background: 'linear-gradient(135deg,#f0fdf4,#ecfdf5)', borderRadius: '16px', padding: '20px 22px', marginBottom: '22px', border: '1px solid #a7f3d0' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: paymentId ? '14px' : 0 }}>
                  <div style={{ width: '46px', height: '46px', background: 'linear-gradient(135deg,#059669,#10b981)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: '0 4px 12px rgba(5,150,105,0.3)' }}>
                    <GraduationCap style={{ width: '22px', height: '22px', color: '#fff' }} />
                  </div>
                  <div>
                    <p style={{ fontSize: '11px', color: '#6B7280', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', margin: '0 0 3px', fontFamily: "'Plus Jakarta Sans',sans-serif" }}>Estado del pago</p>
                    <p style={{ fontSize: '16px', fontWeight: 800, color: '#065F46', margin: 0, fontFamily: "'Plus Jakarta Sans',sans-serif" }}>✓ Aprobado por Mercado Pago</p>
                  </div>
                </div>
                {paymentId && (
                  <div style={{ borderTop: '1px dashed #a7f3d0', paddingTop: '12px', marginTop: '4px' }}>
                    <p style={{ fontSize: '11px', color: '#6B7280', margin: '0 0 3px', fontFamily: "'Plus Jakarta Sans',sans-serif", fontWeight: 600 }}>ID de transacción</p>
                    <p style={{ fontSize: '13px', color: '#065F46', fontFamily: 'monospace', fontWeight: 700, margin: 0, letterSpacing: '0.03em' }}>{paymentId}</p>
                  </div>
                )}
              </div>

              {/* Mensaje */}
              <p style={{ fontSize: '14px', color: '#6B7280', lineHeight: 1.7, margin: '0 0 24px', textAlign: 'center' }}>
                Ya tienes acceso a tu curso. Te llevamos automáticamente a la sección de cursos en unos segundos.
              </p>

              {/* Botón */}
              <button onClick={() => navigate('/cliente/cursos')}
                style={{ width: '100%', padding: '15px 24px', background: 'linear-gradient(135deg,#059669,#10b981)', color: '#fff', border: 'none', borderRadius: '14px', fontSize: '15px', fontWeight: 700, fontFamily: "'Plus Jakarta Sans',sans-serif", cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', boxShadow: '0 6px 20px rgba(5,150,105,0.38)', transition: 'all 150ms ease' }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 10px 28px rgba(5,150,105,0.46)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 6px 20px rgba(5,150,105,0.38)'; }}
              >
                <GraduationCap style={{ width: '18px', height: '18px' }} />
                Ver mis cursos
                <ArrowRight style={{ width: '16px', height: '16px' }} />
              </button>

              <p style={{ textAlign: 'center', fontSize: '13px', color: '#9CA3AF', margin: '14px 0 0' }}>
                Redirigiendo en <span style={{ fontWeight: 800, color: '#059669', fontSize: '16px' }}>{segundos}</span> seg…
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default PagoExitoso;