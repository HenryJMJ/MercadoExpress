import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { Trash2, ShoppingBag, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Cart = () => {
  const { cart, removeFromCart, updateQuantity, totalPrice, totalItems } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  if (cart.length === 0) {
    return (
      <div className="container" style={{ padding: '6rem 1.5rem', textAlign: 'center' }}>
        <div className="glass-panel" style={{ padding: '4rem', maxWidth: '600px', margin: '0 auto' }}>
          <ShoppingBag size={64} style={{ margin: '0 auto 1.5rem auto', color: 'var(--text-muted)' }} />
          <h2 style={{ marginBottom: '1rem' }}>Tu carrito está vacío</h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>
            Parece que aún no has agregado productos a tu carrito.
          </p>
          <Link to="/catalog" className="btn btn-primary">
            Explorar Catálogo
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container animate-fade-in" style={{ padding: '4rem 1.5rem' }}>
      <h1 style={{ marginBottom: '2rem' }}>Carrito de Compras ({totalItems} items)</h1>
      
      <div className="grid grid-cols-3" style={{ gap: '2rem', alignItems: 'start' }}>
        <div style={{ gridColumn: 'span 2', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {cart.map(item => (
            <div key={item.product_id} className="glass-panel" style={{ padding: '1.5rem', display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
              <div style={{ width: '100px', height: '100px', backgroundColor: '#fff', padding: '0.5rem', borderRadius: 'var(--radius-sm)' }}>
                <img src={item.image_url} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
              </div>
              
              <div style={{ flex: 1 }}>
                <h3 style={{ fontSize: '1.125rem', marginBottom: '0.5rem' }}>{item.name}</h3>
                <div style={{ color: 'var(--accent-color)', fontWeight: 700, fontSize: '1.25rem' }}>
                  ${item.price.toLocaleString()}
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ display: 'flex', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', overflow: 'hidden' }}>
                  <button 
                    onClick={() => updateQuantity(item.product_id, item.quantity - 1)}
                    style={{ padding: '0.5rem 0.75rem', background: 'var(--bg-secondary)', border: 'none', color: 'white', cursor: 'pointer' }}
                  >-</button>
                  <div style={{ padding: '0.5rem 1rem', background: 'transparent', display: 'flex', alignItems: 'center', fontWeight: 600 }}>
                    {item.quantity}
                  </div>
                  <button 
                    onClick={() => updateQuantity(item.product_id, item.quantity + 1)}
                    style={{ padding: '0.5rem 0.75rem', background: 'var(--bg-secondary)', border: 'none', color: 'white', cursor: 'pointer' }}
                  >+</button>
                </div>
                
                <button 
                  onClick={() => removeFromCart(item.product_id)}
                  style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '0.5rem' }}
                  title="Eliminar"
                >
                  <Trash2 size={20} className="hover-danger" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Order Summary */}
        <div className="glass-panel" style={{ padding: '2rem', position: 'sticky', top: '100px' }}>
          <h3 style={{ marginBottom: '1.5rem', borderBottom: '1px solid var(--border-light)', paddingBottom: '1rem' }}>Resumen de Orden</h3>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <span style={{ color: 'var(--text-muted)' }}>Subtotal ({totalItems} items)</span>
            <span>${totalPrice.toLocaleString()}</span>
          </div>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <span style={{ color: 'var(--text-muted)' }}>Envío Estimado</span>
            <span style={{ color: 'var(--success)' }}>Gratis</span>
          </div>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2rem', borderTop: '1px solid var(--border-light)', paddingTop: '1rem', fontWeight: 700, fontSize: '1.25rem' }}>
            <span>Total</span>
            <span style={{ color: 'var(--accent-color)' }}>${totalPrice.toLocaleString()}</span>
          </div>

          <button 
            className="btn btn-primary" 
            style={{ width: '100%', padding: '1rem', fontSize: '1.125rem' }}
            onClick={() => {
              if (!user) navigate('/login?redirect=/checkout');
              else navigate('/checkout');
            }}
          >
            Proceder al Pago <ArrowRight size={20} />
          </button>
          
          {!user && (
            <p style={{ textAlign: 'center', fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: '1rem' }}>
              Se te pedirá iniciar sesión en el siguiente paso.
            </p>
          )}
        </div>
      </div>
      <style>{`
        .hover-danger:hover { color: var(--danger); }
      `}</style>
    </div>
  );
};

export default Cart;
