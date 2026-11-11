import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { apiFetch } from '../api';
import { Package, Truck, ArrowLeft, Clock, MapPin, CreditCard, FileText } from 'lucide-react';
import toast from 'react-hot-toast';

const OrderDetails = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        const data = await apiFetch(`/orders/${id}`);
        // Ensure this user owns the order, or handle gracefully (backend should enforce this, but just in case)
        if (data.user_id !== user?.id && user?.role_id !== 5) {
          toast.error('No tienes permiso para ver este pedido');
          navigate('/orders');
          return;
        }
        setOrder(data);
        
        // Fetch invoice if order is paid
        if (data.status !== 'pending') {
          try {
            const invoiceData = await apiFetch(`/payments/order/${id}`);
            setInvoice(invoiceData);
          } catch (err) {
            console.log('No specific invoice found on payments service, fallback generated in modal');
          }
        }
      } catch (err) {
        toast.error('Error cargando detalles del pedido');
        navigate('/orders');
      } finally {
        setLoading(false);
      }
    };
    if (user) {
      fetchOrderDetails();
    }
  }, [id, user, navigate]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'var(--warning)';
      case 'paid': return 'var(--primary-light)';
      case 'shipped': return '#3B82F6';
      case 'delivered': return 'var(--success)';
      default: return 'var(--text-muted)';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'pending': return 'Pendiente de Pago';
      case 'paid': return 'Pagado / Procesando';
      case 'shipped': return 'Enviado';
      case 'delivered': return 'Entregado';
      default: return status;
    }
  };

  if (!user) return null;

  if (loading) {
    return (
      <div className="container" style={{ padding: '4rem 1.5rem', maxWidth: '900px' }}>
        <div className="skeleton" style={{ height: '40px', width: '200px', marginBottom: '2rem' }}></div>
        <div className="skeleton" style={{ height: '200px', marginBottom: '2rem' }}></div>
        <div className="skeleton" style={{ height: '300px' }}></div>
      </div>
    );
  }

  if (!order) return null;

  return (
    <div className="container animate-fade-in" style={{ padding: '4rem 1.5rem', maxWidth: '900px' }}>
      <Link to="/orders" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)', marginBottom: '2rem', textDecoration: 'none' }}>
        <ArrowLeft size={20} /> Volver a mis pedidos
      </Link>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ margin: '0 0 0.5rem 0' }}>Pedido #{order.id.split('-')[0].toUpperCase()}</h1>
          <p style={{ color: 'var(--text-muted)', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Clock size={16} /> Realizado el {new Date(order.created_at).toLocaleString('es')}
          </p>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          {order.status !== 'pending' && (
            <Link 
              to={`/order/${order.id}/invoice`} 
              className="btn btn-primary"
              style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.55rem 1.1rem', fontSize: '0.9rem' }}
            >
              <FileText size={18} /> Ver Factura
            </Link>
          )}

          <div style={{ padding: '0.5rem 1rem', borderRadius: '2rem', backgroundColor: 'rgba(255,255,255,0.05)', color: getStatusColor(order.status), fontWeight: 600, border: `1px solid ${getStatusColor(order.status)}` }}>
            {getStatusText(order.status)}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2" style={{ gap: '2rem', marginBottom: '2rem' }}>
        <div className="glass-panel" style={{ padding: '2rem', display: 'flex', flexDirection: 'column' }}>
          <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <MapPin size={20} className="text-gradient" /> Detalles de Envío
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', color: 'var(--text-muted)', flex: 1 }}>
            <div>
              <strong style={{ color: 'var(--text-main)', display: 'block', marginBottom: '0.25rem' }}>Origen:</strong>
              Montería, Córdoba (Bodega Principal)
            </div>
            <div>
              <strong style={{ color: 'var(--text-main)', display: 'block', marginBottom: '0.25rem' }}>Destino:</strong>
              {order.shipping_address}
            </div>
            <div>
              <strong style={{ color: 'var(--text-main)', display: 'block', marginBottom: '0.25rem' }}>Zona de Envío:</strong>
              {order.shipping_zone || 'Nacional'}
            </div>
          </div>
          {order.status !== 'pending' && (
            <div style={{ marginTop: '1.5rem' }}>
              <Link to={`/tracking?order=${order.id.split('-')[0].toUpperCase()}`} className="btn btn-primary" style={{ width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem' }}>
                <Truck size={18} /> Rastrear Paquete
              </Link>
            </div>
          )}
        </div>

        <div className="glass-panel" style={{ padding: '2rem', display: 'flex', flexDirection: 'column' }}>
          <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <CreditCard size={20} className="text-gradient" /> Resumen de Pago
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', flex: 1 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-muted)' }}>Subtotal artículos</span>
              <span>${(Number(order.total) - Number(order.shipping_cost || 0)).toLocaleString()}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-muted)' }}>Costo de envío</span>
              <span>{Number(order.shipping_cost) === 0 ? 'Gratis' : `$${Number(order.shipping_cost || 0).toLocaleString()}`}</span>
            </div>
            <div style={{ borderTop: '1px solid var(--border-light)', margin: '0.5rem 0' }}></div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.25rem', fontWeight: 700, color: 'var(--accent-color)' }}>
              <span>Total pagado</span>
              <span>${Number(order.total).toLocaleString()}</span>
            </div>
          </div>
          {order.status !== 'pending' && (
            <div style={{ marginTop: '1.5rem' }}>
              <Link 
                to={`/order/${order.id}/invoice`} 
                className="btn btn-outline" 
                style={{ width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem' }}
              >
                <FileText size={18} /> Ver Factura Completa y PDF
              </Link>
            </div>
          )}
        </div>
      </div>

      <div className="glass-panel" style={{ padding: '2rem' }}>
        <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Package size={20} className="text-gradient" /> Artículos ({order.items?.length || 0})
        </h3>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {order.items?.map(item => (
            <div key={item.id} style={{ display: 'flex', gap: '1.5rem', padding: '1.5rem', backgroundColor: 'rgba(255,255,255,0.02)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-light)' }}>
              {/* Image */}
              <div style={{ width: '100px', height: '100px', flexShrink: 0, backgroundColor: 'var(--bg-secondary)', borderRadius: 'var(--radius-sm)', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {item.image_url ? (
                  <img src={item.image_url} alt={item.product_name} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                ) : (
                  <Package size={32} style={{ color: 'var(--text-muted)' }} />
                )}
              </div>
              
              {/* Details */}
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                  <h4 style={{ margin: 0, fontSize: '1.125rem' }}>{item.product_name}</h4>
                  <div style={{ fontWeight: 700, fontSize: '1.125rem', color: 'var(--primary-light)' }}>
                    ${Number(item.unit_price).toLocaleString()}
                  </div>
                </div>
                
                <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '1rem', flex: 1 }}>
                  {item.description ? item.description.substring(0, 150) + '...' : 'Sin descripción disponible'}
                </div>
                
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.875rem' }}>
                  <span style={{ backgroundColor: 'rgba(255,255,255,0.1)', padding: '0.25rem 0.75rem', borderRadius: '1rem', fontWeight: 600 }}>
                    Cantidad: {item.quantity}
                  </span>
                  <strong>Subtotal: ${(Number(item.unit_price) * item.quantity).toLocaleString()}</strong>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default OrderDetails;
