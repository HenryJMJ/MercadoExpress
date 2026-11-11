import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { apiFetch } from '../api';
import { Package, Clock, ExternalLink, Truck } from 'lucide-react';
import toast from 'react-hot-toast';

const MyOrders = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      if (!user) return;
      try {
        const data = await apiFetch(`/orders?user_id=${user.id}`);
        setOrders(data);
      } catch (err) {
        toast.error('Error cargando pedidos');
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, [user]);

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

  if (!user) {
    return (
      <div className="container" style={{ padding: '6rem 1.5rem', textAlign: 'center' }}>
        <h2>Debes iniciar sesión para ver tus pedidos</h2>
        <Link to="/login?redirect=/orders" className="btn btn-primary" style={{ marginTop: '1rem' }}>Iniciar Sesión</Link>
      </div>
    );
  }

  return (
    <div className="container animate-fade-in" style={{ padding: '4rem 1.5rem', maxWidth: '900px' }}>
      <h1 style={{ marginBottom: '2rem' }}>Mis Pedidos</h1>
      
      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {[1, 2, 3].map(n => <div key={n} className="skeleton" style={{ height: '120px' }}></div>)}
        </div>
      ) : orders.length === 0 ? (
        <div className="glass-panel" style={{ padding: '4rem', textAlign: 'center' }}>
          <Package size={64} style={{ margin: '0 auto 1.5rem auto', color: 'var(--text-muted)' }} />
          <h2>Aún no tienes pedidos</h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>¡Explora nuestro catálogo y haz tu primera compra!</p>
          <Link to="/catalog" className="btn btn-primary">Ir al Catálogo</Link>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {orders.map(order => (
            <div key={order.id} className="glass-panel" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid var(--border-light)', paddingBottom: '1.5rem' }}>
                <div>
                  <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                    Pedido #{order.id} • {new Date(order.created_at).toLocaleDateString()}
                  </div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>
                    ${Number(order.total).toLocaleString()}
                  </div>
                </div>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', borderRadius: '2rem', backgroundColor: 'rgba(255,255,255,0.05)', color: getStatusColor(order.status), fontWeight: 600 }}>
                  <Clock size={16} /> {getStatusText(order.status)}
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                  <strong>Envío a:</strong> {order.shipping_address}
                </div>
                
                <div style={{ display: 'flex', gap: '1rem' }}>
                  <Link to={`/tracking?order=${order.id}`} className="btn btn-outline" style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}>
                    <Truck size={16} /> Rastrear
                  </Link>
                  <button className="btn btn-primary" style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}>
                    <ExternalLink size={16} /> Ver Detalles
                  </button>
                </div>
              </div>
              
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyOrders;
