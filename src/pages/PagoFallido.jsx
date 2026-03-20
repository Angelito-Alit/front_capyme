import { useNavigate, useSearchParams } from 'react-router-dom';
import { XCircle, RotateCcw, GraduationCap } from 'lucide-react';

const PagoFallido = () => {
  const navigate       = useNavigate();
  const [searchParams] = useSearchParams();
  const status = searchParams.get('status');
  const cancelo = !status || status === 'null';

  return (
    <>
      <style>{`
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
        body{font-family:'DM Sans',system-ui,sans-serif;}
        @keyframes fadeUp { from{opacity:0;transform:translateY(28px);}to{opacity:1;transform:translateY(0);} }
        @keyframes shake  { 0%,100%{transform:translateX(0);}25%{transform:translateX(-5px);}75%{transform:translateX(5px);} }
      `}</style>

      <div style={{ minHeight: '100vh', background: cancelo ? 'linear-gradient(145deg,#f9fafb,#f3f4f6)' : 'linear-gradient(145deg,#fef2f2,#fff1f2 40%,#fafafa)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
        <div style={{ background: '#fff', borderRadius: '24px', maxWidth: '440px', width: '100%', boxShadow: '0 32px 80px rgba(0,0,0,0.10)', overflow: 'hidden', animation: 'fadeUp 0.5s cubic-bezier(0.16,1,0.3,1) both' }}>

          {/* Banner */}
          <div style={{ background: cancelo ? 'linear-gradient(135deg,#6B7280,#9CA3AF)' : 'linear-gradient(135deg,#DC2626,#EF4444)', padding: '44px 32px 36px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: '-40px', right: '-40px', width: '140px', height: '140px', background: 'rgba(255,255,255,0.07)', borderRadius: '50%' }} />
            <div style={{ width: '80px', height: '80px', background: 'rgba(255,255,255,0.2)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', border: '3px solid rgba(255,255,255,0.4)', animation: cancelo ? 'none' : 'shake 0.5s ease 0.3s both' }}>
              <XCircle style={{ width: '44px', height: '44px', color: '#fff' }} />
            </div>
            <h1 style={{ fontSize: '26px', fontWeight: 800, color: '#fff', margin: '0 0 8px', fontFamily: "'Plus Jakarta Sans',sans-serif" }}>
              {cancelo ? 'Pago cancelado' : 'Pago no completado'}
            </h1>
            <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.88)', margin: 0, lineHeight: 1.5 }}>
              {cancelo ? 'Cerraste el proceso sin completar el pago' : 'Hubo un problema al procesar tu pago'}
            </p>
          </div>

          {/* Cuerpo */}
          <div style={{ padding: '28px 32px 36px' }}>
            <div style={{ background: cancelo ? '#F9FAFB' : '#FEF2F2', borderRadius: '14px', padding: '18px 20px', marginBottom: '24px', border: cancelo ? '1px solid #E5E7EB' : '1px solid #FECACA' }}>
              <p style={{ fontSize: '14px', color: cancelo ? '#4B5563' : '#7F1D1D', lineHeight: 1.65, margin: 0 }}>
                {cancelo
                  ? 'No se realizó ningún cargo. Tu inscripción sigue reservada — puedes retomar el pago desde la sección de Cursos cuando quieras.'
                  : 'No se realizó ningún cargo. Verifica tu método de pago e intenta de nuevo.'}
              </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <button onClick={() => navigate('/cliente/cursos')}
                style={{ width: '100%', padding: '14px 24px', background: 'linear-gradient(135deg,#1F4E9E,#2B69C8)', color: '#fff', border: 'none', borderRadius: '14px', fontSize: '15px', fontWeight: 700, fontFamily: "'Plus Jakarta Sans',sans-serif", cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', boxShadow: '0 4px 16px rgba(31,78,158,0.30)', transition: 'all 150ms ease' }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(31,78,158,0.40)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 16px rgba(31,78,158,0.30)'; }}
              >
                <GraduationCap style={{ width: '18px', height: '18px' }} />
                {cancelo ? 'Volver a cursos y reintentar' : 'Intentar de nuevo'}
              </button>

              <button onClick={() => navigate('/cliente/dashboard')}
                style={{ width: '100%', padding: '13px 24px', background: '#fff', color: '#6B7280', border: '1px solid #E5E7EB', borderRadius: '14px', fontSize: '14px', fontWeight: 600, fontFamily: "'Plus Jakarta Sans',sans-serif", cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', transition: 'all 150ms ease' }}
                onMouseEnter={e => { e.currentTarget.style.background = '#F9FAFB'; e.currentTarget.style.borderColor = '#D1D5DB'; }}
                onMouseLeave={e => { e.currentTarget.style.background = '#fff'; e.currentTarget.style.borderColor = '#E5E7EB'; }}
              >
                <RotateCcw style={{ width: '15px', height: '15px' }} /> Ir al inicio
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default PagoFallido;