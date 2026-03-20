import { useNavigate } from 'react-router-dom';
import Layout from '../components/common/Layout';
import { XCircle, RotateCcw } from 'lucide-react';

const PagoFallido = () => {
  const navigate = useNavigate();

  return (
    <Layout>
      <div style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        minHeight: '60vh', padding: '40px 20px', animation: 'fadeInUp 0.4s ease'
      }}>
        <style>{`
          @keyframes fadeInUp { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        `}</style>
        
        <div style={{
          background: '#fff', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)',
          padding: '48px 40px', maxWidth: '480px', width: '100%', textAlign: 'center',
          boxShadow: '0 24px 48px rgba(0,0,0,0.06)'
        }}>
          <div style={{
            width: '72px', height: '72px', borderRadius: '50%', background: '#FEF2F2',
            display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px'
          }}>
            <XCircle style={{ width: '36px', height: '36px', color: '#DC2626' }} />
          </div>
          
          <h1 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--gray-900)', fontFamily: "'Plus Jakarta Sans', sans-serif", margin: '0 0 12px' }}>
            Hubo un problema con tu pago
          </h1>
          <p style={{ fontSize: '15px', color: 'var(--gray-500)', fontFamily: "'DM Sans', sans-serif", margin: '0 0 32px', lineHeight: 1.5 }}>
            No pudimos procesar la transacción. Por favor, verifica tu método de pago e inténtalo nuevamente.
          </p>

          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              onClick={() => navigate(-1)}
              style={{
                flex: 1, padding: '12px', background: '#fff', border: '1px solid var(--border)',
                color: 'var(--gray-700)', borderRadius: 'var(--radius-md)', fontSize: '14px', fontWeight: 600,
                fontFamily: "'DM Sans', sans-serif", cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', transition: 'background 150ms ease'
              }}
              onMouseEnter={e => e.currentTarget.style.background = 'var(--gray-50)'}
              onMouseLeave={e => e.currentTarget.style.background = '#fff'}
            >
              <RotateCcw style={{ width: '16px', height: '16px' }} /> Reintentar
            </button>
            <button
              onClick={() => navigate('/dashboard')}
              style={{
                flex: 1, padding: '12px', background: 'var(--gray-100)', border: 'none',
                color: 'var(--gray-700)', borderRadius: 'var(--radius-md)', fontSize: '14px', fontWeight: 600,
                fontFamily: "'DM Sans', sans-serif", cursor: 'pointer', transition: 'background 150ms ease'
              }}
              onMouseEnter={e => e.currentTarget.style.background = 'var(--gray-200)'}
              onMouseLeave={e => e.currentTarget.style.background = 'var(--gray-100)'}
            >
              Volver al inicio
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default PagoFallido;