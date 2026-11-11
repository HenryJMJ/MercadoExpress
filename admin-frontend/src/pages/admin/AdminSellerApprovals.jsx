import { useState, useEffect } from 'react';
import { apiFetch } from '../../api';
import toast from 'react-hot-toast';
import { CheckCircle, XCircle, Clock, Store, Package, Eye } from 'lucide-react';

const AdminSellerApprovals = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const statusParam = filter === 'all' ? '' : `?status=${filter}`;
      const data = await apiFetch(`/catalog/seller-products${statusParam}`);
      setProducts(data);
    } catch (err) {
      toast.error('Error cargando productos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [filter]);

  const handleApproval = async (productId, status) => {
    try {
      await apiFetch(`/catalog/seller-products/${productId}/approve`, {
        method: 'PUT',
        body: JSON.stringify({ status })
      });
      toast.success(status === 'approved' ? 'Producto aprobado' : 'Producto rechazado');
      fetchProducts();
    } catch (err) {
      toast.error('Error al actualizar');
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'approved':
        return <span style={{ padding: '0.25rem 0.75rem', borderRadius: '1rem', fontSize: '0.75rem', fontWeight: 600, background: 'rgba(16,185,129,0.15)', color: 'var(--success)', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}><CheckCircle size={14} /> Aprobado</span>;
      case 'pending':
        return <span style={{ padding: '0.25rem 0.75rem', borderRadius: '1rem', fontSize: '0.75rem', fontWeight: 600, background: 'rgba(245,158,11,0.15)', color: 'var(--warning)', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}><Clock size={14} /> Pendiente</span>;
      case 'rejected':
        return <span style={{ padding: '0.25rem 0.75rem', borderRadius: '1rem', fontSize: '0.75rem', fontWeight: 600, background: 'rgba(239,68,68,0.15)', color: 'var(--danger)', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}><XCircle size={14} /> Rechazado</span>;
      case 'paused':
        return <span style={{ padding: '0.25rem 0.75rem', borderRadius: '1rem', fontSize: '0.75rem', fontWeight: 600, background: 'rgba(107,114,128,0.15)', color: 'var(--text-muted)', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}><Clock size={14} /> Pausado</span>;
      default:
        return null;
    }
  };

  return (
    <div style={{ padding: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <Store size={28} className="text-gradient" />
          <div>
            <h1 style={{ margin: 0 }}>Productos de Vendedores</h1>
            <p style={{ color: 'var(--text-muted)', margin: 0 }}>Aprueba o rechaza los productos que publican los emprendedores.</p>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '2rem' }}>
        {[
          { key: 'all', label: 'Todos', icon: Store },
          { key: 'pending', label: 'Pendientes', icon: Clock },
          { key: 'approved', label: 'Aprobados', icon: CheckCircle },
          { key: 'rejected', label: 'Rechazados', icon: XCircle }
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key)}
            className={filter === tab.key ? 'btn btn-primary' : 'btn btn-outline'}
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', fontSize: '0.875rem' }}
          >
            <tab.icon size={16} /> {tab.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {[1, 2, 3].map(n => <div key={n} className="skeleton" style={{ height: '120px' }}></div>)}
        </div>
      ) : products.length === 0 ? (
        <div className="glass-panel" style={{ padding: '4rem', textAlign: 'center' }}>
          <Package size={48} style={{ margin: '0 auto 1rem auto', color: 'var(--text-muted)' }} />
          <p style={{ color: 'var(--text-muted)', fontSize: '1.125rem' }}>
            No hay productos {filter === 'pending' ? 'pendientes de aprobación' : filter === 'approved' ? 'aprobados' : 'rechazados'}.
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {products.map(product => (
            <div key={product.id} className="glass-panel" style={{ padding: '1.5rem', display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
              {/* Product Image */}
              <div style={{ width: '80px', height: '80px', borderRadius: 'var(--radius-md)', overflow: 'hidden', backgroundColor: 'transparent', flexShrink: 0 }}>
                <img src={product.image_url} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
              </div>

              {/* Product Info */}
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.25rem' }}>
                  <h3 style={{ margin: 0, fontSize: '1.125rem' }}>{product.name}</h3>
                  {getStatusBadge(product.approval_status)}
                </div>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', margin: '0.25rem 0' }}>
                  {product.description?.substring(0, 120) || 'Sin descripción'}
                </p>
                <div style={{ display: 'flex', gap: '1.5rem', fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
                  <span><strong>Vendedor:</strong> {product.seller_name}</span>
                  <span><strong>Categoría:</strong> {product.category_name}</span>
                  <span><strong>Stock:</strong> {product.stock}</span>
                </div>
              </div>

              {/* Price */}
              <div style={{ textAlign: 'right', flexShrink: 0 }}>
                <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--accent-color)' }}>
                  ${Number(product.price).toLocaleString()}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  Comisión: ${(Number(product.price) * 0.10).toLocaleString()}
                </div>
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', flexShrink: 0 }}>
                {product.approval_status === 'pending' && (
                  <>
                    <button
                      onClick={() => handleApproval(product.id, 'approved')}
                      className="btn"
                      style={{ padding: '0.5rem 1rem', fontSize: '0.8rem', background: 'var(--success)', color: 'white', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
                    >
                      <CheckCircle size={16} /> Aprobar
                    </button>
                    <button
                      onClick={() => handleApproval(product.id, 'rejected')}
                      className="btn"
                      style={{ padding: '0.5rem 1rem', fontSize: '0.8rem', background: 'var(--danger)', color: 'white', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
                    >
                      <XCircle size={16} /> Rechazar
                    </button>
                  </>
                )}
                {product.approval_status === 'rejected' && (
                  <button
                    onClick={() => handleApproval(product.id, 'approved')}
                    className="btn btn-outline"
                    style={{ padding: '0.5rem 1rem', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
                  >
                    <CheckCircle size={16} /> Aprobar
                  </button>
                )}
                {product.approval_status === 'approved' && (
                  <button
                    onClick={() => handleApproval(product.id, 'rejected')}
                    className="btn btn-outline"
                    style={{ padding: '0.5rem 1rem', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--danger)', borderColor: 'var(--danger)' }}
                  >
                    <XCircle size={16} /> Rechazar
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminSellerApprovals;
