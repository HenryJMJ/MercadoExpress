import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ShoppingCart, Check, ShieldCheck, Truck } from 'lucide-react';
import { apiFetch } from '../api';
import { useCart } from '../context/CartContext';
import toast from 'react-hot-toast';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const { addToCart } = useCart();

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const data = await apiFetch(`/catalog/products/${id}`);
        setProduct(data);
      } catch (err) {
        toast.error('Producto no encontrado');
        navigate('/catalog');
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id, navigate]);

  const handleAdd = () => {
    if (product) {
      addToCart(product, quantity);
      toast.success(`${quantity} x ${product.name} agregado al carrito`);
    }
  };

  if (loading) {
    return (
      <div className="container" style={{ padding: '4rem 1.5rem' }}>
        <div className="grid grid-cols-2" style={{ gap: '4rem' }}>
          <div className="skeleton" style={{ height: '500px' }}></div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div className="skeleton" style={{ height: '40px', width: '50%' }}></div>
            <div className="skeleton" style={{ height: '60px', width: '80%' }}></div>
            <div className="skeleton" style={{ height: '20px', width: '100%', marginTop: '2rem' }}></div>
            <div className="skeleton" style={{ height: '20px', width: '100%' }}></div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) return null;

  return (
    <div className="container animate-fade-in" style={{ padding: '4rem 1.5rem' }}>
      <div className="glass-panel" style={{ padding: '0', overflow: 'hidden' }}>
        <div className="grid grid-cols-2" style={{ gap: '0' }}>
          
          {/* Image */}
          <div style={{ backgroundColor: '#fff', padding: '4rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <img 
              src={product.image_url} 
              alt={product.name} 
              style={{ maxWidth: '100%', maxHeight: '500px', objectFit: 'contain' }} 
            />
          </div>

          {/* Details */}
          <div style={{ padding: '4rem' }}>
            <span style={{ color: 'var(--primary-light)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              {product.category_name}
            </span>
            <h1 style={{ fontSize: '2.5rem', margin: '0.5rem 0 1rem 0' }}>{product.name}</h1>
            
            <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--accent-color)', marginBottom: '2rem' }}>
              ${Number(product.price).toLocaleString()}
            </div>

            <p style={{ color: 'var(--text-muted)', fontSize: '1.125rem', lineHeight: 1.6, marginBottom: '2rem' }}>
              {product.description || 'Sin descripción disponible.'}
            </p>

            {/* Features */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '3rem', padding: '1.5rem', backgroundColor: 'rgba(0,0,0,0.2)', borderRadius: 'var(--radius-md)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--text-main)' }}>
                <Check size={20} color="var(--success)" /> 
                <span>Stock disponible: <strong>{product.stock} unidades</strong></span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--text-main)' }}>
                <Truck size={20} color="var(--primary-light)" /> 
                <span>Envío express a nivel nacional</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--text-main)' }}>
                <ShieldCheck size={20} color="var(--accent-color)" /> 
                <span>Garantía de 1 año y compra segura</span>
              </div>
            </div>

            {/* Add to Cart Actions */}
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
              <div style={{ display: 'flex', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
                <button 
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  style={{ padding: '1rem 1.5rem', background: 'var(--bg-secondary)', border: 'none', color: 'white', cursor: 'pointer', fontSize: '1.25rem' }}
                >-</button>
                <div style={{ padding: '1rem 1.5rem', background: 'transparent', display: 'flex', alignItems: 'center', fontWeight: 600 }}>
                  {quantity}
                </div>
                <button 
                  onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                  style={{ padding: '1rem 1.5rem', background: 'var(--bg-secondary)', border: 'none', color: 'white', cursor: 'pointer', fontSize: '1.25rem' }}
                >+</button>
              </div>
              
              <button 
                onClick={handleAdd}
                className="btn btn-primary" 
                disabled={product.stock <= 0}
                style={{ flex: 1, padding: '1rem', fontSize: '1.125rem' }}
              >
                <ShoppingCart size={20} /> 
                {product.stock > 0 ? 'Agregar al Carrito' : 'Agotado'}
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
