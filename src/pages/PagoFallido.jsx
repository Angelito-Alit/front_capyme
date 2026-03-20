import { useNavigate, useSearchParams } from 'react-router-dom';
import { XCircle, RotateCcw, GraduationCap } from 'lucide-react';

const PagoFallido = () => {
  const navigate       = useNavigate();
  const [searchParams] = useSearchParams();
  const status = searchParams.get('status'); // 'null' cuando el usuario cierra MP

  // Si MP devuelve status 'null' o no hay status = el usuario canceló voluntariamente
  const cancelo = !status || status === 'null';

  return (
    <div style={{
      minHeight: '100vh',
      background: cancelo
        ? 'linear-gradient(135deg, #f9fafb 0%, #f3f4f6 100%)'
        : 'linear-gradient(135deg, #fef2f2 0%, #fff1f2 100%)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '20px',
      fontFamily: "'DM Sans', sans-serif",
    }}>
      <style>{`
        @keyframes fadeInUp { from{opacity:0;transform:translateY(24px);}to{opacity:1;transform:translateY(0);} }
        @keyframes shake { 0%,100%{transform:translateX(0);}25%{transform:translateX(-5px);}75%{transform:translateX(5px);} }
      `}</style>

      <div style={{
        background: '#fff',
        borderRadius: '24px',
        maxWidth: '440px', width: '100%',
        boxShadow: '0 32px 80px rgba(0,0,0,0.10)',
        overflow: 'hidden',
        animation: 'fadeInUp 0.5s ease both',
      }}>

        {/* Banner */}
        <div style={{
          background: cancelo
            ? 'linear-gradient(135deg,#6B7280,#9CA3AF)'
            : 'linear-gradient(135deg,#DC2626,#EF4444)',
          padding: '44px 32px 36px',
          textAlign: 'center',
          position: 'relative',
          overflow: 'hidden',
        }}>
          <div style={{ position:'absolute',top:'-30px',right:'-30px',width:'120px',height:'120px',background:'rgba(255,255,255,0.07)',borderRadius:'50%' }} />

          <div style={{
            width:'76px',height:'76px',
            background:'rgba(255,255,255,0.2)',
            borderRadius:'50%',
            display:'flex',alignItems:'center',justifyContent:'center',
            margin:'0 auto 20px',
            border:'3px solid rgba(255,255,255,0.4)',
            animation: cancelo ? 'none' : 'shake 0.5s ease 0.3s both',
          }}>
            <XCircle style={{ width:'42px',height:'42px',color:'#fff' }} />
          </div>

          <h1 style={{ fontSize:'26px',fontWeight:800,color:'#fff',margin:'0 0 8px',fontFamily:"'Plus Jakarta Sans', sans-serif" }}>
            {cancelo ? 'Pago cancelado' : 'Pago no completado'}
          </h1>
          <p style={{ fontSize:'14px',color:'rgba(255,255,255,0.88)',margin:0,lineHeight:1.5 }}>
            {cancelo
              ? 'Cerraste el proceso de pago sin completarlo'
              : 'Hubo un problema al procesar tu pago en Mercado Pago'}
          </p>
        </div>

        {/* Cuerpo */}
        <div style={{ padding:'28px 32px 36px' }}>

          <div style={{
            background: cancelo ? '#F9FAFB' : '#FEF2F2',
            borderRadius:'14px',
            padding:'18px 20px',
            marginBottom:'24px',
            border: cancelo ? '1px solid #E5E7EB' : '1px solid #FECACA',
          }}>
            <p style={{ fontSize:'14px',color: cancelo ? '#4B5563' : '#7F1D1D',lineHeight:1.65,margin:0 }}>
              {cancelo
                ? 'No se realizó ningún cargo. Tu inscripción sigue reservada con estado pendiente — puedes retomar el pago cuando quieras desde la sección de Cursos.'
                : 'No se realizó ningún cargo. Verifica los datos de tu tarjeta o intenta con otro método de pago e inténtalo de nuevo.'}
            </p>
          </div>

          <div style={{ display:'flex',flexDirection:'column',gap:'10px' }}>
            <button
              onClick={() => navigate('/cliente/cursos')}
              style={{
                width:'100%',padding:'14px 24px',
                background:'linear-gradient(135deg,#1F4E9E,#2B69C8)',
                color:'#fff',border:'none',borderRadius:'14px',
                fontSize:'15px',fontWeight:700,
                fontFamily:"'Plus Jakarta Sans', sans-serif",
                cursor:'pointer',
                display:'flex',alignItems:'center',justifyContent:'center',gap:'8px',
                boxShadow:'0 4px 16px rgba(31,78,158,0.30)',
                transition:'all 150ms ease',
              }}
              onMouseEnter={e=>{e.currentTarget.style.transform='translateY(-2px)';e.currentTarget.style.boxShadow='0 8px 24px rgba(31,78,158,0.40)';}}
              onMouseLeave={e=>{e.currentTarget.style.transform='translateY(0)';e.currentTarget.style.boxShadow='0 4px 16px rgba(31,78,158,0.30)';}}
            >
              <GraduationCap style={{ width:'18px',height:'18px' }} />
              {cancelo ? 'Volver a cursos y reintentar' : 'Intentar de nuevo'}
            </button>

            <button
              onClick={() => navigate('/cliente/dashboard')}
              style={{
                width:'100%',padding:'13px 24px',
                background:'#fff',color:'#6B7280',
                border:'1px solid #E5E7EB',borderRadius:'14px',
                fontSize:'14px',fontWeight:600,
                fontFamily:"'Plus Jakarta Sans', sans-serif",
                cursor:'pointer',
                display:'flex',alignItems:'center',justifyContent:'center',gap:'8px',
                transition:'all 150ms ease',
              }}
              onMouseEnter={e=>{e.currentTarget.style.background='#F9FAFB';e.currentTarget.style.borderColor='#D1D5DB';}}
              onMouseLeave={e=>{e.currentTarget.style.background='#fff';e.currentTarget.style.borderColor='#E5E7EB';}}
            >
              <RotateCcw style={{ width:'15px',height:'15px' }} />
              Ir al inicio
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PagoFallido;