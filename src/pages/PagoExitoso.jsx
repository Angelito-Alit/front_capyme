import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { cursosService }     from '../services/cursosService';
import { enlacesService }    from '../services/enlacesService';
import { inversionesService } from '../services/inversionesService';
import { useAuthStore }      from '../store/authStore';
import { CheckCircle, XCircle, Loader } from 'lucide-react';

const PagoExitoso = () => {
  const [searchParams]      = useSearchParams();
  const navigate            = useNavigate();
  const { isAuthenticated } = useAuthStore();

  const [estado,  setEstado]  = useState('procesando');
  const [mensaje, setMensaje] = useState('');
  const [titulo,  setTitulo]  = useState('');

  useEffect(() => {
    const externalRef = searchParams.get('external_reference');
    const status      = searchParams.get('status');
    const tipo        = searchParams.get('tipo');

    if (!externalRef) {
      setEstado('error');
      setTitulo('Sin referencia');
      setMensaje('No se encontró la referencia del pago.');
      return;
    }

    if (status !== 'approved') {
      setEstado('error');
      setTitulo('Pago no aprobado');
      setMensaje('El pago no fue aprobado por Mercado Pago.');
      return;
    }

    const confirmar = async () => {
      try {
        const ref = String(externalRef);

        if (ref.startsWith('INV') || tipo === 'campana') {
          const res = await inversionesService.confirmarPorReferencia(ref);
          if (res.success) {
            setEstado('ok');
            setTitulo('¡Inversión confirmada!');
            setMensaje('Tu inversión fue registrada y confirmada exitosamente.');
          } else {
            setEstado('error');
            setTitulo('Error al confirmar');
            setMensaje('No se pudo confirmar la inversión.');
          }
        } else if (ref.startsWith('RESR') || ref.startsWith('REC') || tipo === 'recurso') {
          const res = await enlacesService.confirmarPorReferencia(ref);
          if (res.success) {
            setEstado('ok');
            setTitulo('¡Acceso confirmado!');
            setMensaje('Tu acceso al recurso fue confirmado exitosamente.');
          } else {
            setEstado('error');
            setTitulo('Error al confirmar');
            setMensaje('No se pudo confirmar el acceso al recurso.');
          }
        } else {
          const res = await cursosService.confirmarPorReferencia(ref);
          if (res.success) {
            setEstado('ok');
            setTitulo('¡Pago confirmado!');
            setMensaje('Tu pago fue procesado y tu inscripción está activa.');
          } else {
            setEstado('error');
            setTitulo('Error al confirmar');
            setMensaje('No se pudo confirmar el pago del curso.');
          }
        }
      } catch {
        setEstado('error');
        setTitulo('Error de conexión');
        setMensaje('Hubo un problema al confirmar tu pago. Intenta de nuevo más tarde.');
      }
    };

    confirmar();
  }, []);

  const irAlInicio = () => {
    if (isAuthenticated) {
      navigate('/');
    } else {
      navigate('/login');
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'var(--gray-50)',
      padding: '20px',
    }}>
      <div style={{
        background: '#fff',
        borderRadius: 'var(--radius-lg)',
        padding: '48px 40px',
        maxWidth: '440px',
        width: '100%',
        textAlign: 'center',
        boxShadow: '0 8px 32px rgba(0,0,0,0.10)',
      }}>
        {estado === 'procesando' && (
          <>
            <Loader style={{ width: '56px', height: '56px', color: 'var(--capyme-blue-mid)', margin: '0 auto 20px', animation: 'spin 1s linear infinite', display: 'block' }} />
            <h2 style={{ fontSize: '20px', fontWeight: 800, color: 'var(--gray-900)', fontFamily: "'Plus Jakarta Sans', sans-serif", marginBottom: '8px' }}>
              Verificando pago...
            </h2>
            <p style={{ fontSize: '14px', color: 'var(--gray-500)', fontFamily: "'DM Sans', sans-serif" }}>
              Espera un momento mientras confirmamos tu transacción.
            </p>
          </>
        )}

        {estado === 'ok' && (
          <>
            <div style={{ width: '72px', height: '72px', background: 'linear-gradient(135deg,#10B981,#059669)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', boxShadow: '0 8px 24px rgba(16,185,129,.35)' }}>
              <CheckCircle style={{ width: '38px', height: '38px', color: '#fff' }} />
            </div>
            <h2 style={{ fontSize: '22px', fontWeight: 900, color: 'var(--gray-900)', fontFamily: "'Plus Jakarta Sans', sans-serif", marginBottom: '8px' }}>
              {titulo}
            </h2>
            <p style={{ fontSize: '14px', color: 'var(--gray-500)', fontFamily: "'DM Sans', sans-serif", marginBottom: '28px', lineHeight: 1.6 }}>
              {mensaje}
            </p>
            <button
              onClick={irAlInicio}
              style={{ width: '100%', padding: '13px', background: 'linear-gradient(135deg,#10B981,#059669)', border: 'none', borderRadius: 'var(--radius-md)', color: '#fff', fontSize: '14px', fontWeight: 700, cursor: 'pointer', fontFamily: "'Plus Jakarta Sans', sans-serif", boxShadow: '0 4px 14px rgba(16,185,129,.35)' }}
            >
              Ir al inicio
            </button>
          </>
        )}

        {estado === 'error' && (
          <>
            <div style={{ width: '72px', height: '72px', background: 'linear-gradient(135deg,#EF4444,#DC2626)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', boxShadow: '0 8px 24px rgba(239,68,68,.3)' }}>
              <XCircle style={{ width: '38px', height: '38px', color: '#fff' }} />
            </div>
            <h2 style={{ fontSize: '22px', fontWeight: 900, color: 'var(--gray-900)', fontFamily: "'Plus Jakarta Sans', sans-serif", marginBottom: '8px' }}>
              {titulo}
            </h2>
            <p style={{ fontSize: '14px', color: 'var(--gray-500)', fontFamily: "'DM Sans', sans-serif", marginBottom: '28px', lineHeight: 1.6 }}>
              {mensaje}
            </p>
            <button
              onClick={irAlInicio}
              style={{ width: '100%', padding: '13px', background: 'linear-gradient(135deg,var(--capyme-blue-mid),var(--capyme-blue))', border: 'none', borderRadius: 'var(--radius-md)', color: '#fff', fontSize: '14px', fontWeight: 700, cursor: 'pointer', fontFamily: "'Plus Jakarta Sans', sans-serif" }}
            >
              Volver al inicio
            </button>
          </>
        )}
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
};

export default PagoExitoso;