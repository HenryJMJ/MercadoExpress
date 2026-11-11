import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { apiFetch } from '../api';
import toast from 'react-hot-toast';
import { CreditCard, Truck, FileText } from 'lucide-react';

const Checkout = () => {
  const { cart, totalPrice, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [address, setAddress] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('credit_card');

  // If directly accessed without items
  if (cart.length === 0 && step === 1) {
    navigate('/cart');
    return null;
  }

  const handleProcessOrder = async (e) => {
    e.preventDefault();
    if (!address.trim()) {
      return toast.error('Por favor, ingresa una dirección de envío');
    }

    setLoading(true);
    try {
      // 1. Create Order
      const orderData = {
        user_id: user.id,
        shipping_address: address,
        items: cart.map(i => ({ product_id: i.product_id, quantity: i.quantity }))
      };
      
      const order = await apiFetch('/orders', {
        method: 'POST',
        body: JSON.stringify(orderData)
      });

      // 2. Process Payment
      const paymentData = {
        order_id: order.order.id,
        user_id: user.id,
        amount: totalPrice,
        method: paymentMethod
      };
      
      await apiFetch('/payments/process', {
        method: 'POST',
        body: JSON.stringify(paymentData)
      });

      // 3. Update Order Status (simulate webhook)
      await apiFetch(`/orders/${order.order.id}/status`, {
        method: 'PUT',
        body: JSON.stringify({ status: 'paid' })
      });

      // 4. Create Tracking Shipment (Internal webhook simulation)
      await apiFetch('/tracking/update', {
        method: 'POST',
        body: JSON.stringify({
          order_id: order.order.id,
          status: 'Procesando Envío',
          location: 'Centro de Distribución',
          description: 'El pedido ha sido pagado y está siendo preparado.'
        })
      });

      clearCart();
      toast.success('¡Pedido procesado con éxito!');
      navigate('/orders');
      
    } catch (err) {
      toast.error(err.message || 'Error al procesar el pedido');
      setLoading(false);
    }
  };

  return (
    <div className="container animate-fade-in" style={{ padding: '4rem 1.5rem', maxWidth: '800px' }}>
      <h1 style={{ marginBottom: '2rem', textAlign: 'center' }}>Finalizar Compra</h1>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3rem', position: 'relative' }}>
        <div style={{ position: 'absolute', top: '15px', left: '10%', right: '10%', height: '2px', background: 'var(--border-color)', zIndex: 0 }}></div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 1, gap: '0.5rem' }}>
          <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--primary-color)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600 }}>1</div>
          <span style={{ fontSize: '0.875rem' }}>Envío</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 1, gap: '0.5rem' }}>
          <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: step >= 2 ? 'var(--primary-color)' : 'var(--bg-secondary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600 }}>2</div>
          <span style={{ fontSize: '0.875rem' }}>Pago</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 1, gap: '0.5rem' }}>
          <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: step >= 3 ? 'var(--primary-color)' : 'var(--bg-secondary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600 }}>3</div>
          <span style={{ fontSize: '0.875rem' }}>Confirmación</span>
        </div>
      </div>

      <div className="glass-panel" style={{ padding: '3rem' }}>
        {step === 1 && (
          <form onSubmit={(e) => { e.preventDefault(); if (address) setStep(2); }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2rem' }}>
              <Truck size={24} className="text-gradient" />
              <h2 style={{ margin: 0 }}>Detalles de Envío</h2>
            </div>
            
            <div className="form-group">
              <label className="form-label">Dirección Completa</label>
              <textarea 
                className="form-input" 
                rows="3" 
                placeholder="Calle, número, apartamento, ciudad..."
                value={address}
                onChange={e => setAddress(e.target.value)}
                required
              ></textarea>
            </div>
            
            <div className="form-group">
              <label className="form-label">Persona que recibe</label>
              <input type="text" className="form-input" value={user?.full_name || ''} readOnly />
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1rem' }}>
              Continuar al Pago
            </button>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={handleProcessOrder}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2rem' }}>
              <CreditCard size={24} className="text-gradient" />
              <h2 style={{ margin: 0 }}>Método de Pago</h2>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2rem' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem', border: '1px solid', borderColor: paymentMethod === 'credit_card' ? 'var(--primary-color)' : 'var(--border-color)', borderRadius: 'var(--radius-md)', cursor: 'pointer', background: paymentMethod === 'credit_card' ? 'rgba(13,148,136,0.1)' : 'transparent' }}>
                <input type="radio" name="method" value="credit_card" checked={paymentMethod === 'credit_card'} onChange={() => setPaymentMethod('credit_card')} />
                <div style={{ flex: 1 }}>Tarjeta de Crédito / Débito</div>
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem', border: '1px solid', borderColor: paymentMethod === 'pse' ? 'var(--primary-color)' : 'var(--border-color)', borderRadius: 'var(--radius-md)', cursor: 'pointer', background: paymentMethod === 'pse' ? 'rgba(13,148,136,0.1)' : 'transparent' }}>
                <input type="radio" name="method" value="pse" checked={paymentMethod === 'pse'} onChange={() => setPaymentMethod('pse')} />
                <div style={{ flex: 1 }}>Transferencia Bancaria (PSE)</div>
              </label>
            </div>
            
            <div style={{ padding: '1.5rem', backgroundColor: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)', marginBottom: '2rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span>Subtotal</span>
                <span>${totalPrice.toLocaleString()}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: '1.25rem', color: 'var(--accent-color)', marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--border-color)' }}>
                <span>Total a Pagar</span>
                <span>${totalPrice.toLocaleString()}</span>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '1rem' }}>
              <button type="button" className="btn btn-outline" style={{ flex: 1 }} onClick={() => setStep(1)} disabled={loading}>
                Volver
              </button>
              <button type="submit" className="btn btn-accent" style={{ flex: 2 }} disabled={loading}>
                {loading ? 'Procesando...' : 'Pagar y Confirmar Pedido'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default Checkout;
