import { useNavigate, useSearchParams } from 'react-router-dom';
import Layout from '../components/common/Layout';
import { CheckCircle, ArrowRight } from 'lucide-react';

const PagoExitoso = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  const paymentId = searchParams.get('payment_id');

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
            width: '72px', height: '72px', borderRadius: '50%', background: '#ECFDF5',
            display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px'
          }}>
            <CheckCircle style={{ width: '36px', height: '36px', color: '#059669' }} />
          </div>
          
          <h1 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--gray-900)', fontFamily: "'Plus Jakarta Sans', sans-serif", margin: '0 0 12px' }}>
            ¡Pago completado con éxito!
          </h1>
          <p style={{ fontSize: '15px', color: 'var(--gray-500)', fontFamily: "'DM Sans', sans-serif", margin: '0 0 24px', lineHeight: 1.5 }}>
            Tu transacción se ha procesado correctamente. Gracias por confiar en CAPYME.
          </p>
          
          {paymentId && (
            <div style={{ background: 'var(--gray-50)', padding: '12px', borderRadius: 'var(--radius-md)', marginBottom: '32px' }}>
              <span style={{ fontSize: '12px', color: 'var(--gray-400)', fontFamily: "'DM Sans', sans-serif", display: 'block', marginBottom: '4px' }}>
                ID de Transacción
              </span>
              <span style={{ fontSize: '14px', fontWeight: 700, color: 'var(--gray-700)', fontFamily: "'JetBrains Mono', monospace" }}>
                {paymentId}
              </span>
            </div>
          )}

          <button
            onClick={() => navigate('/dashboard')}
            style={{
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
              width: '100%', padding: '12px 24px', background: 'linear-gradient(135deg, var(--capyme-blue-mid), var(--capyme-blue))',
              color: '#fff', border: 'none', borderRadius: 'var(--radius-md)', fontSize: '15px', fontWeight: 700,
              fontFamily: "'Plus Jakarta Sans', sans-serif", cursor: 'pointer', boxShadow: '0 4px 14px rgba(31,78,158,0.3)',
              transition: 'transform 150ms ease'
            }}
            onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
            onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
          >
            Volver al inicio <ArrowRight style={{ width: '18px', height: '18px' }} />
          </button>
        </div>
      </div>
    </Layout>
  );
};

export default PagoExitoso;