import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { apiFetch } from '../api';
import toast from 'react-hot-toast';
import { CreditCard, Truck, FileText, CheckCircle2, ArrowRight, ShoppingBag } from 'lucide-react';

const Checkout = () => {
  const { cart, totalPrice, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [department, setDepartment] = useState('');
  const [city, setCity] = useState('');
  const [address, setAddress] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('credit_card');
  const [shippingCost, setShippingCost] = useState(0);
  const [isFirstOrder, setIsFirstOrder] = useState(false);
  const [calculatingShipping, setCalculatingShipping] = useState(false);
  const [hasPrefilledAddress, setHasPrefilledAddress] = useState(false);

  // States for confirmation & invoice
  const [createdOrder, setCreatedOrder] = useState(null);
  const [createdInvoice, setCreatedInvoice] = useState(null);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);

  // Pre-fill address from user's Profile preferences
  useEffect(() => {
    if (user?.id) {
      const savedPrefs = localStorage.getItem(`shipping_prefs_${user.id}`);
      if (savedPrefs) {
        try {
          const parsed = JSON.parse(savedPrefs);
          if (parsed.department) setDepartment(parsed.department);
          if (parsed.city) setCity(parsed.city);
          if (parsed.address) setAddress(parsed.address);
          if (parsed.department || parsed.city || parsed.address) {
            setHasPrefilledAddress(true);
          }
        } catch {
          // ignore
        }
      }
    }
  }, [user]);

  const departments = [
    'Amazonas', 'Antioquia', 'Arauca', 'Atlántico', 'Bolívar', 'Boyacá', 'Caldas', 'Caquetá', 'Casanare', 'Cauca', 'Cesar', 'Chocó', 'Córdoba', 'Cundinamarca', 'Guainía', 'Guaviare', 'Huila', 'La Guajira', 'Magdalena', 'Meta', 'Nariño', 'Norte de Santander', 'Putumayo', 'Quindío', 'Risaralda', 'San Andrés y Providencia', 'Santander', 'Sucre', 'Tolima', 'Valle del Cauca', 'Vaupés', 'Vichada', 'Bogotá D.C.'
  ];

  // If directly accessed without items
  if (cart.length === 0 && step === 1) {
    navigate('/cart');
    return null;
  }

  const handleProcessOrder = async (e) => {
    e.preventDefault();
    if (!department || !city || !address.trim()) {
      return toast.error('Por favor, completa todos los datos de envío');
    }

    setLoading(true);
    try {
      // 1. Create Order
      const orderData = {
        user_id: user.id,
        shipping_department: department,
        shipping_city: city,
        shipping_address: `${address}, ${city}, ${department}`,
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
        amount: totalPrice + shippingCost,
        method: paymentMethod
      };
      
      const paymentRes = await apiFetch('/payments/process', {
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

      // Save complete order details with item descriptions and names for invoice display
      const confirmedOrder = {
        ...order.order,
        items: cart.map(item => ({
          product_id: item.product_id,
          product_name: item.name || item.product_name,
          quantity: item.quantity,
          unit_price: item.price || item.unit_price,
          image_url: item.image_url
        }))
      };

      setCreatedOrder(confirmedOrder);
      setCreatedInvoice(paymentRes.invoice || null);
      
      clearCart();
      setLoading(false);
      setStep(3);
      toast.success('¡Compra confirmada con éxito!');
      
    } catch (err) {
      toast.error(err.message || 'Error al procesar el pedido');
      setLoading(false);
    }
  };

  return (
    <div className="container animate-fade-in" style={{ padding: '4rem 1.5rem', maxWidth: '800px' }}>
      <h1 style={{ marginBottom: '2rem', textAlign: 'center' }}>
        {step === 3 ? '¡Compra Exitosa!' : 'Finalizar Compra'}
      </h1>
      
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
          <form onSubmit={async (e) => { 
            e.preventDefault(); 
            if (department && city && address) {
              setCalculatingShipping(true);
              try {
                const res = await apiFetch(`/orders/shipping-cost?department=${department}&city=${city}&user_id=${user?.id}`);
                setShippingCost(res.cost);
                setIsFirstOrder(res.isFirstOrder);
                setStep(2);
              } catch (err) {
                toast.error('Error calculando el envío');
              } finally {
                setCalculatingShipping(false);
              }
            }
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: hasPrefilledAddress ? '1rem' : '2rem' }}>
              <Truck size={24} className="text-gradient" />
              <h2 style={{ margin: 0 }}>Detalles de Envío</h2>
            </div>

            {hasPrefilledAddress && (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.65rem 1rem',
                backgroundColor: 'rgba(13, 148, 136, 0.12)',
                border: '1px solid var(--primary-color)',
                borderRadius: 'var(--radius-md)',
                color: 'var(--primary-light)',
                fontSize: '0.85rem',
                marginBottom: '1.5rem'
              }}>
                <CheckCircle2 size={16} /> Cargamos automáticamente tu dirección habitual guardada en tu Perfil.
              </div>
            )}
            
            <div className="grid grid-cols-2" style={{ gap: '1rem', marginBottom: '1rem' }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Departamento</label>
                <select 
                  className="form-input" 
                  value={department}
                  onChange={e => setDepartment(e.target.value)}
                  required
                >
                  <option value="">Selecciona un departamento</option>
                  {departments.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Ciudad</label>
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="Ej: Montería"
                  value={city}
                  onChange={e => setCity(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Dirección (Ej. Calle, número, barrio)</label>
              <textarea 
                className="form-input" 
                rows="2" 
                placeholder="Ej: Calle 20 #10-15 B. Centro"
                value={address}
                onChange={e => setAddress(e.target.value)}
                required
              ></textarea>
            </div>
            
            <div className="form-group">
              <label className="form-label">Persona que recibe</label>
              <input type="text" className="form-input" value={user?.full_name || ''} readOnly />
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1rem' }} disabled={calculatingShipping}>
              {calculatingShipping ? 'Calculando Envío...' : 'Continuar al Pago'}
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
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  Costo de Envío 
                  {isFirstOrder && <span style={{ background: 'var(--success)', color: 'white', padding: '0.1rem 0.4rem', borderRadius: '4px', fontSize: '0.7rem', fontWeight: 600 }}>¡Primer envío gratis!</span>}
                </span>
                <span style={{ color: shippingCost === 0 ? 'var(--success)' : 'inherit', fontWeight: shippingCost === 0 ? 600 : 400 }}>
                  {shippingCost === 0 ? 'Gratis' : `$${shippingCost.toLocaleString()}`}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: '1.25rem', color: 'var(--accent-color)', marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--border-color)' }}>
                <span>Total a Pagar</span>
                <span>${(totalPrice + shippingCost).toLocaleString()}</span>
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

        {/* STEP 3: CONFIRMACIÓN Y VER FACTURA */}
        {step === 3 && createdOrder && (
          <div style={{ textAlign: 'center', padding: '1rem 0' }}>
            <div style={{
              width: '72px',
              height: '72px',
              borderRadius: '50%',
              backgroundColor: 'rgba(16, 185, 129, 0.15)',
              color: 'var(--success)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1.5rem auto',
              border: '2px solid var(--success)'
            }}>
              <CheckCircle2 size={42} />
            </div>

            <h2 style={{ fontSize: '1.75rem', marginBottom: '0.5rem' }}>¡Pago Confirmado con Éxito!</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '1rem', marginBottom: '2rem' }}>
              Gracias por tu compra. Tu pedido <strong>#{createdOrder.id.split('-')[0].toUpperCase()}</strong> ha sido recibido y ya está siendo preparado.
            </p>

            {/* Order Brief Card */}
            <div style={{
              backgroundColor: 'var(--bg-secondary)',
              borderRadius: 'var(--radius-lg)',
              padding: '1.5rem 2rem',
              textAlign: 'left',
              marginBottom: '2.5rem',
              border: '1px solid var(--border-color)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem', borderBottom: '1px solid var(--border-light)', paddingBottom: '0.75rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>Número de Pedido:</span>
                <strong>#{createdOrder.id.split('-')[0].toUpperCase()}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>Total Pagado:</span>
                <strong style={{ color: 'var(--primary-light)', fontSize: '1.1rem' }}>
                  ${Number(createdOrder.total).toLocaleString()} COP
                </strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>Método de Pago:</span>
                <span>{paymentMethod === 'pse' ? 'PSE (Transferencia)' : 'Tarjeta de Crédito / Débito'}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Destino:</span>
                <span>{createdOrder.shipping_address}</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxWidth: '420px', margin: '0 auto' }}>
              <Link 
                to={`/order/${createdOrder.id}/invoice`} 
                className="btn btn-primary"
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  gap: '0.75rem', 
                  fontSize: '1.05rem', 
                  padding: '0.85rem 1.5rem',
                  boxShadow: 'var(--shadow-glow)',
                  textDecoration: 'none'
                }}
              >
                <FileText size={20} /> Ver Factura Electrónica
              </Link>

              <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
                <button 
                  onClick={() => navigate('/orders')} 
                  className="btn btn-outline"
                  style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
                >
                  <ShoppingBag size={18} /> Mis Pedidos
                </button>
                <button 
                  onClick={() => navigate('/catalog')} 
                  className="btn btn-outline"
                  style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
                >
                  Seguir Comprando <ArrowRight size={16} />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Checkout;
