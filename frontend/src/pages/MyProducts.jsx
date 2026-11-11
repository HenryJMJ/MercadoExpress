import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { apiFetch } from '../api';
import toast from 'react-hot-toast';
import { Store, CheckCircle, Clock, XCircle, Package } from 'lucide-react';

const MyProducts = () => {
  const { user } = useAuth();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  const fetchProducts = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const statusParam = filter === 'all' ? '' : `&status=${filter}`;
      const data = await apiFetch(`/catalog/seller-products?seller_id=${user.id}${statusParam}`);
      setProducts(data);
    } catch (err) {
      toast.error('Error cargando tus productos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [user, filter]);

  const handleStatusChange = async (id, newStatus) => {
    try {
      await apiFetch(`/catalog/seller-products/${id}/approve`, {
        method: 'PUT',
        body: JSON.stringify({ status: newStatus })
      });
      toast.success(newStatus === 'paused' ? 'Producto pausado' : 'Producto reanudado');
      fetchProducts();
    } catch (err) {
      toast.error('Error al cambiar el estado');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('¿Seguro que deseas eliminar este producto?')) return;
    try {
      await apiFetch(`/catalog/products/${id}`, { method: 'DELETE' });
      toast.success('Producto eliminado');
      fetchProducts();
    } catch (err) {
      toast.error('Error al eliminar');
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'approved':
        return <span style={{ padding: '0.25rem 0.75rem', borderRadius: '1rem', fontSize: '0.75rem', fontWeight: 600, background: 'rgba(16,185,129,0.1)', color: 'var(--success)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}><CheckCircle size={14} /> Aprobado</span>;
      case 'pending':
        return <span style={{ padding: '0.25rem 0.75rem', borderRadius: '1rem', fontSize: '0.75rem', fontWeight: 600, background: 'rgba(245,158,11,0.1)', color: 'var(--warning)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}><Clock size={14} /> En Revisión</span>;
      case 'rejected':
        return <span style={{ padding: '0.25rem 0.75rem', borderRadius: '1rem', fontSize: '0.75rem', fontWeight: 600, background: 'rgba(239,68,68,0.1)', color: 'var(--danger)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}><XCircle size={14} /> Rechazado</span>;
      case 'paused':
        return <span style={{ padding: '0.25rem 0.75rem', borderRadius: '1rem', fontSize: '0.75rem', fontWeight: 600, background: 'rgba(107,114,128,0.1)', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}><Clock size={14} /> Pausado</span>;
      default:
        return null;
    }
  };

  if (!user) return null;

  return (
    <div className="container animate-fade-in" style={{ padding: '4rem 1.5rem', maxWidth: '1000px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ padding: '1rem', background: 'rgba(13,148,136,0.1)', color: 'var(--primary-color)', borderRadius: '1rem' }}>
            <Store size={32} />
          </div>
          <div>
            <h1 style={{ margin: 0 }}>Mis Productos</h1>
            <p style={{ color: 'var(--text-muted)', margin: 0 }}>Gestiona los artículos de tu emprendimiento.</p>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '2rem' }}>
        {[
          { key: 'all', label: 'Todos' },
          { key: 'pending', label: 'Pendientes' },
          { key: 'approved', label: 'Aprobados' },
          { key: 'rejected', label: 'Rechazados' },
          { key: 'paused', label: 'Pausados' }
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key)}
            className={filter === tab.key ? 'btn btn-primary' : 'btn btn-outline'}
            style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="grid grid-cols-2" style={{ gap: '1.5rem' }}>
          {[1, 2, 3, 4].map(n => <div key={n} className="skeleton" style={{ height: '160px' }}></div>)}
        </div>
      ) : products.length === 0 ? (
        <div className="glass-panel" style={{ padding: '4rem', textAlign: 'center' }}>
          <Package size={64} style={{ margin: '0 auto 1.5rem auto', color: 'var(--text-muted)' }} />
          <h2>Aún no tienes productos a la venta</h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>¡Anímate a publicar el primero y empieza a ganar dinero!</p>
          <a href="/sell" className="btn btn-primary">Vender Producto</a>
        </div>
      ) : (
        <div className="grid grid-cols-2" style={{ gap: '1.5rem' }}>
          {products.map(product => (
            <div key={product.id} className="glass-panel" style={{ padding: '1.5rem', display: 'flex', gap: '1.5rem' }}>
              <div style={{ width: '100px', height: '100px', borderRadius: 'var(--radius-md)', overflow: 'hidden', backgroundColor: 'transparent', flexShrink: 0 }}>
                <img src={product.image_url} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
              </div>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.125rem' }}>{product.name}</h3>
                  {getStatusBadge(product.approval_status)}
                </div>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '1rem' }}>
                  {product.category_name} • Stock: {product.stock}
                </div>
                <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ fontWeight: 700, fontSize: '1.25rem' }}>${Number(product.price).toLocaleString()}</div>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    {product.approval_status === 'approved' && (
                      <>
                        <button onClick={() => handleStatusChange(product.id, 'paused')} className="btn btn-outline" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}>Pausar</button>
                        <a href={`/product/${product.id}`} className="btn btn-primary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}>Ver</a>
                      </>
                    )}
                    {product.approval_status === 'paused' && (
                      <>
                        <button onClick={() => handleStatusChange(product.id, 'approved')} className="btn btn-primary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}>Reanudar</button>
                        <button onClick={() => handleDelete(product.id)} className="btn btn-outline" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem', color: 'var(--danger)', borderColor: 'var(--danger)' }}>Eliminar</button>
                      </>
                    )}
                    {(product.approval_status === 'approved' || product.approval_status === 'pending') && (
                      <button onClick={() => handleDelete(product.id)} className="btn btn-outline" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem', color: 'var(--danger)', borderColor: 'var(--danger)' }}>Eliminar</button>
                    )}
                    {product.approval_status === 'rejected' && (
                      <>
                        <a href={`/sell/${product.id}`} className="btn btn-primary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}>Editar</a>
                        <button onClick={() => handleDelete(product.id)} className="btn btn-outline" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem', color: 'var(--danger)', borderColor: 'var(--danger)' }}>Eliminar</button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyProducts;
