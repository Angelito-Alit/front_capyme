import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { cursosService } from '../services/cursosService';
import { CheckCircle, GraduationCap, ArrowRight, Loader } from 'lucide-react';

const PagoExitoso = () => {
  const navigate       = useNavigate();
  const [searchParams] = useSearchParams();
  const [verificando,  setVerificando]  = useState(true);
  const [segundos,     setSegundos]     = useState(6);

  const paymentId = searchParams.get('payment_id');
  const status    = searchParams.get('status');             // 'approved' | 'pending' | 'null'
  const extRef    = searchParams.get('external_reference'); // referencia del pago (REFxxxxxxxxxxx)

  // 1. Llamar al backend para confirmar el pago por referencia
  //    (respaldo por si el webhook de MP llega tarde)
  useEffect(() => {
    const confirmar = async () => {
      if (extRef && status === 'approved') {
        try {
          await cursosService.confirmarPorReferencia(extRef);
        } catch {
          // Si falla o ya estaba confirmado, el webhook lo resolverá
        }
      }
      setVerificando(false);
    };
    confirmar();
  }, []); // eslint-disable-line

  // 2. Cuenta regresiva → redirigir a /cliente/cursos
  useEffect(() => {
    if (verificando) return;
    if (segundos <= 0) { navigate('/cliente/cursos'); return; }
    const t = setTimeout(() => setSegundos(s => s - 1), 1000);
    return () => clearTimeout(t);
  }, [segundos, verificando, navigate]);

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 40%, #f0f9ff 100%)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '20px',
      fontFamily: "'DM Sans', sans-serif",
    }}>
      <style>{`
        @keyframes fadeInUp { from{opacity:0;transform:translateY(24px);}to{opacity:1;transform:translateY(0);} }
        @keyframes scaleIn  { from{opacity:0;transform:scale(0.4);}to{opacity:1;transform:scale(1);} }
        @keyframes pulse    { 0%,100%{transform:scale(1);}50%{transform:scale(1.08);} }
        @keyframes spin     { to{transform:rotate(360deg);} }
        @keyframes fadeIn   { from{opacity:0;}to{opacity:1;} }
      `}</style>

      <div style={{
        background: '#fff',
        borderRadius: '24px',
        maxWidth: '460px', width: '100%',
        boxShadow: '0 32px 80px rgba(0,0,0,0.12)',
        overflow: 'hidden',
        animation: 'fadeInUp 0.5s ease both',
      }}>

        {/* ── Banner verde ─────────────────────────────────────────── */}
        <div style={{
          background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
          padding: '44px 32px 36px',
          textAlign: 'center',
          position: 'relative',
          overflow: 'hidden',
        }}>
          <div style={{ position:'absolute',top:'-40px',right:'-40px',width:'140px',height:'140px',background:'rgba(255,255,255,0.07)',borderRadius:'50%' }} />
          <div style={{ position:'absolute',bottom:'-24px',left:'-24px',width:'90px',height:'90px',background:'rgba(255,255,255,0.05)',borderRadius:'50%' }} />

          {verificando ? (
            <div style={{ width:'72px',height:'72px',margin:'0 auto 20px',display:'flex',alignItems:'center',justifyContent:'center' }}>
              <Loader style={{ width:'44px',height:'44px',color:'#fff',animation:'spin 0.9s linear infinite' }} />
            </div>
          ) : (
            <div style={{
              width:'80px',height:'80px',
              background:'rgba(255,255,255,0.22)',
              borderRadius:'50%',
              display:'flex',alignItems:'center',justifyContent:'center',
              margin:'0 auto 20px',
              border:'3px solid rgba(255,255,255,0.55)',
              animation:'scaleIn 0.5s cubic-bezier(0.175,0.885,0.32,1.275) both',
            }}>
              <CheckCircle style={{ width:'46px',height:'46px',color:'#fff',animation:'pulse 2.4s ease-in-out infinite' }} />
            </div>
          )}

          <h1 style={{ fontSize:'28px',fontWeight:800,color:'#fff',margin:'0 0 8px',fontFamily:"'Plus Jakarta Sans', sans-serif",letterSpacing:'-0.02em',lineHeight:1.2 }}>
            {verificando ? 'Verificando pago…' : '¡Pago exitoso!'}
          </h1>
          <p style={{ fontSize:'15px',color:'rgba(255,255,255,0.88)',margin:0,lineHeight:1.5 }}>
            {verificando ? 'Confirmando tu transacción con Mercado Pago' : 'Tu inscripción ha sido confirmada correctamente'}
          </p>
        </div>

        {/* ── Cuerpo (solo cuando ya no verifica) ──────────────────── */}
        {!verificando && (
          <div style={{ padding:'28px 32px 36px', animation:'fadeIn 0.4s ease both' }}>

            {/* Detalles */}
            <div style={{ background:'#F0FDF4',borderRadius:'16px',padding:'20px',marginBottom:'24px',border:'1px solid #BBF7D0' }}>
              <div style={{ display:'flex',alignItems:'center',gap:'14px',marginBottom: paymentId ? '14px' : '0' }}>
                <div style={{ width:'44px',height:'44px',background:'linear-gradient(135deg,#059669,#10b981)',borderRadius:'12px',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0,boxShadow:'0 4px 12px rgba(5,150,105,0.3)' }}>
                  <GraduationCap style={{ width:'22px',height:'22px',color:'#fff' }} />
                </div>
                <div>
                  <p style={{ fontSize:'11px',color:'#6B7280',fontWeight:700,textTransform:'uppercase',letterSpacing:'0.06em',margin:'0 0 3px',fontFamily:"'Plus Jakarta Sans', sans-serif" }}>Estado</p>
                  <p style={{ fontSize:'16px',fontWeight:800,color:'#065F46',margin:0,fontFamily:"'Plus Jakarta Sans', sans-serif" }}>
                    ✓ Aprobado por Mercado Pago
                  </p>
                </div>
              </div>
              {paymentId && (
                <div style={{ borderTop:'1px dashed #A7F3D0',paddingTop:'12px',marginTop:'4px' }}>
                  <p style={{ fontSize:'11px',color:'#6B7280',margin:'0 0 3px',fontFamily:"'Plus Jakarta Sans', sans-serif",fontWeight:600 }}>ID de transacción</p>
                  <p style={{ fontSize:'13px',color:'#065F46',fontFamily:'monospace',fontWeight:700,margin:0,letterSpacing:'0.03em' }}>{paymentId}</p>
                </div>
              )}
            </div>

            {/* Mensaje */}
            <p style={{ fontSize:'14px',color:'#6B7280',lineHeight:1.65,margin:'0 0 24px',textAlign:'center' }}>
              Ya tienes acceso a tu curso. En unos segundos te llevaremos a la sección de cursos para que puedas empezar.
            </p>

            {/* Botón + cuenta regresiva */}
            <button
              onClick={() => navigate('/cliente/cursos')}
              style={{
                width:'100%',padding:'15px 24px',
                background:'linear-gradient(135deg,#059669,#10b981)',
                color:'#fff',border:'none',borderRadius:'14px',
                fontSize:'15px',fontWeight:700,
                fontFamily:"'Plus Jakarta Sans', sans-serif",
                cursor:'pointer',
                display:'flex',alignItems:'center',justifyContent:'center',gap:'10px',
                boxShadow:'0 6px 20px rgba(5,150,105,0.38)',
                transition:'all 150ms ease',
              }}
              onMouseEnter={e=>{e.currentTarget.style.transform='translateY(-2px)';e.currentTarget.style.boxShadow='0 10px 28px rgba(5,150,105,0.45)';}}
              onMouseLeave={e=>{e.currentTarget.style.transform='translateY(0)';e.currentTarget.style.boxShadow='0 6px 20px rgba(5,150,105,0.38)';}}
            >
              <GraduationCap style={{ width:'18px',height:'18px' }} />
              Ver mis cursos
              <ArrowRight style={{ width:'16px',height:'16px' }} />
            </button>

            <p style={{ textAlign:'center',fontSize:'13px',color:'#9CA3AF',margin:'14px 0 0' }}>
              Redirigiendo automáticamente en{' '}
              <span style={{ fontWeight:800,color:'#059669',fontSize:'16px' }}>{segundos}</span>
              {' '}seg…
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PagoExitoso;