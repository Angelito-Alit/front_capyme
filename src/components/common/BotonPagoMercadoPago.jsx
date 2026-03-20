import { useState } from 'react';
import { pagosService } from '../../services/pagosService';
import { toast } from 'react-hot-toast';

const BotonPagoMercadoPago = ({ titulo, precio, cantidad = 1, idReferencia, tipo, textoBoton = "Pagar con Mercado Pago" }) => {
  const [loading, setLoading] = useState(false);

  const handlePago = async () => {
    setLoading(true);
    try {
      const res = await pagosService.crearPreferencia({
        titulo,
        precio,
        cantidad,
        idReferencia,
        tipo
      });
      if (res.success && res.init_point) {
        window.location.href = res.init_point;
      }
    } catch (error) {
      toast.error('Error al iniciar el pago');
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handlePago}
      disabled={loading}
      style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
        width: '100%', padding: '12px 24px', background: '#009EE3',
        color: '#fff', border: 'none', borderRadius: 'var(--radius-md)', fontSize: '15px', fontWeight: 700,
        fontFamily: "'Plus Jakarta Sans', sans-serif", cursor: loading ? 'not-allowed' : 'pointer',
        boxShadow: '0 4px 14px rgba(0,158,227,0.3)', transition: 'opacity 150ms ease',
        opacity: loading ? 0.7 : 1
      }}
    >
      {loading ? 'Procesando...' : textoBoton}
    </button>
  );
};

export default BotonPagoMercadoPago;