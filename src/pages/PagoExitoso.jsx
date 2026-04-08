import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { cursosService }      from '../services/cursosService';
import { enlacesService }     from '../services/enlacesService';
import { inversionesService } from '../services/inversionesService';
import { CheckCircle, XCircle, Loader } from 'lucide-react';

const PagoExitoso = () => {
  const [searchParams] = useSearchParams();
  const navigate       = useNavigate();

  const [estado,  setEstado]  = useState('procesando');
  const [titulo,  setTitulo]  = useState('');
  const [mensaje, setMensaje] = useState('');

  useEffect(() => {
    const externalRef = searchParams.get('external_reference');
    const status      = searchParams.get('status');

    if (!externalRef) {
      setEstado('error'); setTitulo('Sin referencia');
      setMensaje('No se encontró la referencia del pago.'); return;
    }
    if (status !== 'approved') {
      setEstado('error'); setTitulo('Pago no aprobado');
      setMensaje('El pago no fue aprobado por Mercado Pago.'); return;
    }

    const confirmar = async () => {
      try {
        const ref = String(externalRef);
        if (ref.startsWith('INV')) {
          const res = await inversionesService.confirmarPorReferencia(ref);
          if (res.success) {
            setEstado('ok'); setTitulo('¡Inversión confirmada!');
            setMensaje('Tu inversión fue registrada exitosamente. ¡Gracias por apoyar este proyecto!');
          } else throw new Error('No se pudo confirmar la inversión');
        } else if (ref.startsWith('RESR') || ref.startsWith('REC')) {
          const res = await enlacesService.confirmarPorReferencia(ref);
          if (res.success) {
            setEstado('ok'); setTitulo('¡Acceso confirmado!');
            setMensaje('Tu acceso al recurso fue confirmado exitosamente.');
          } else throw new Error('No se pudo confirmar el acceso');
        } else {
          const res = await cursosService.confirmarPorReferencia(ref);
          if (res.success) {
            setEstado('ok'); setTitulo('¡Pago confirmado!');
            setMensaje('Tu pago fue procesado y tu inscripción está activa.');
          } else throw new Error('No se pudo confirmar el pago del curso');
        }
      } catch (e) {
        setEstado('error'); setTitulo('Error al confirmar');
        setMensaje(e?.response?.data?.message || e?.message || 'Hubo un problema al confirmar tu pago.');
      }
    };

    confirmar();
  }, []);

  const handleContinuar = () => {
    const returnUrl = localStorage.getItem('capyme_return_url') || '/campanas';
    localStorage.removeItem('capyme_return_url');

    const authRaw = localStorage.getItem('auth-storage');
    const authData = authRaw ? JSON.parse(authRaw) : null;
    const isLoggedIn = !!authData?.state?.user?.id;

    if (isLoggedIn) {
      navigate(returnUrl, { replace: true });
    } else {
      localStorage.setItem('capyme_post_login_url', returnUrl);
      navigate('/login', { replace: true });
    }
  };

  return (
    <div style={{
      minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center',
      background:'#F9FAFB', padding:'20px',
    }}>
      <div style={{
        background:'#fff', borderRadius:'16px', padding:'48px 40px',
        maxWidth:'440px', width:'100%', textAlign:'center',
        boxShadow:'0 8px 32px rgba(0,0,0,.10)',
      }}>

        {estado === 'procesando' && (
          <>
            <Loader style={{width:'56px',height:'56px',color:'#1F4E9E',margin:'0 auto 20px',animation:'spin 1s linear infinite',display:'block'}}/>
            <h2 style={{fontSize:'20px',fontWeight:800,color:'#111827',fontFamily:"'Plus Jakarta Sans',sans-serif",marginBottom:'8px'}}>Verificando pago...</h2>
            <p style={{fontSize:'14px',color:'#6B7280',fontFamily:"'DM Sans',sans-serif",margin:0}}>Espera un momento mientras confirmamos tu transacción.</p>
          </>
        )}

        {estado === 'ok' && (
          <>
            <div style={{width:'72px',height:'72px',background:'linear-gradient(135deg,#10B981,#059669)',borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center',margin:'0 auto 20px',boxShadow:'0 8px 24px rgba(16,185,129,.35)'}}>
              <CheckCircle style={{width:'38px',height:'38px',color:'#fff'}}/>
            </div>
            <h2 style={{fontSize:'22px',fontWeight:900,color:'#111827',fontFamily:"'Plus Jakarta Sans',sans-serif",marginBottom:'8px'}}>{titulo}</h2>
            <p style={{fontSize:'14px',color:'#6B7280',fontFamily:"'DM Sans',sans-serif",marginBottom:'28px',lineHeight:1.6}}>{mensaje}</p>
            <button onClick={handleContinuar} style={{width:'100%',padding:'13px',background:'linear-gradient(135deg,#10B981,#059669)',border:'none',borderRadius:'12px',color:'#fff',fontSize:'14px',fontWeight:700,cursor:'pointer',fontFamily:"'Plus Jakarta Sans',sans-serif",boxShadow:'0 4px 14px rgba(16,185,129,.35)'}}>
              Continuar
            </button>
          </>
        )}

        {estado === 'error' && (
          <>
            <div style={{width:'72px',height:'72px',background:'linear-gradient(135deg,#EF4444,#DC2626)',borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center',margin:'0 auto 20px',boxShadow:'0 8px 24px rgba(239,68,68,.3)'}}>
              <XCircle style={{width:'38px',height:'38px',color:'#fff'}}/>
            </div>
            <h2 style={{fontSize:'22px',fontWeight:900,color:'#111827',fontFamily:"'Plus Jakarta Sans',sans-serif",marginBottom:'8px'}}>{titulo}</h2>
            <p style={{fontSize:'14px',color:'#6B7280',fontFamily:"'DM Sans',sans-serif",marginBottom:'28px',lineHeight:1.6}}>{mensaje}</p>
            <button onClick={handleContinuar} style={{width:'100%',padding:'13px',background:'linear-gradient(135deg,#1F4E9E,#4F46E5)',border:'none',borderRadius:'12px',color:'#fff',fontSize:'14px',fontWeight:700,cursor:'pointer',fontFamily:"'Plus Jakarta Sans',sans-serif"}}>
              Volver
            </button>
          </>
        )}
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
};

export default PagoExitoso;