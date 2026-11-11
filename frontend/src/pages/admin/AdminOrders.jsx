import { useState, useEffect } from 'react';
import { apiFetch } from '../../api';
import { ShoppingCart, Clock, Search, ChevronDown } from 'lucide-react';
import toast from 'react-hot-toast';

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const data = await apiFetch('/orders/all');
      setOrders(data || []);
    } catch (err) {
      console.error(err);
      toast.error('Error cargando pedidos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchOrders(); }, []);

  const updateStatus = async (orderId, newStatus) => {
    try {
      await apiFetch(`/orders/${orderId}/status`, {
        method: 'PUT',
        body: JSON.stringify({ status: newStatus }),
      });
      toast.success(`Pedido actualizado a "${newStatus}"`);
      fetchOrders();
    } catch (err) {
      toast.error('Error actualizando el pedido');
    }
  };

  const filteredOrders = filter === 'all' ? orders : orders.filter(o => o.status === filter);

  const statusColors = {
    pending: '#F59E0B',
    paid: '#10B981',
    shipped: '#3B82F6',
    delivered: '#10B981',
  };

  const statusLabels = {
    pending: 'Pendiente',
    paid: 'Pagado',
    shipped: 'Enviado',
    delivered: 'Entregado',
  };

  return (
    <div style={{ padding: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', marginBottom: '0.25rem' }}>Gestión de Pedidos</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>{orders.length} pedidos totales</p>
        </div>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        {['all', 'pending', 'paid', 'shipped', 'delivered'].map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            style={{
              padding: '0.5rem 1rem',
              borderRadius: '2rem',
              border: '1px solid',
              borderColor: filter === f ? 'var(--primary-light)' : 'var(--border-color)',
              background: filter === f ? 'rgba(13,148,136,0.15)' : 'transparent',
              color: filter === f ? 'var(--primary-light)' : 'var(--text-muted)',
              fontSize: '0.8rem',
              fontWeight: 500,
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            {f === 'all' ? 'Todos' : (statusLabels[f] || f)}
            {f !== 'all' && ` (${orders.filter(o => o.status === f).length})`}
          </button>
        ))}
      </div>

      {/* Orders Table */}
      <div className="glass-panel" style={{ overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: '2rem' }}>
            {[1, 2, 3, 4, 5].map(n => <div key={n} className="skeleton" style={{ height: '60px', marginBottom: '0.5rem' }}></div>)}
          </div>
        ) : filteredOrders.length === 0 ? (
          <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            <ShoppingCart size={48} style={{ opacity: 0.2, margin: '0 auto 1rem' }} />
            <p>No hay pedidos {filter !== 'all' ? `con estado "${statusLabels[filter]}"` : ''}</p>
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-light)' }}>
                {['ID', 'Fecha', 'Total', 'Estado', 'Dirección', 'Acciones'].map(h => (
                  <th key={h} style={{ padding: '1rem', textAlign: 'left', fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map(order => (
                <tr key={order.id} style={{ borderBottom: '1px solid var(--border-light)' }}>
                  <td style={{ padding: '1rem', fontSize: '0.85rem', fontWeight: 600 }}>
                    #{typeof order.id === 'string' ? order.id.slice(0, 8) : order.id}
                  </td>
                  <td style={{ padding: '1rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    {new Date(order.created_at).toLocaleDateString('es', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </td>
                  <td style={{ padding: '1rem', fontWeight: 700 }}>
                    ${parseFloat(order.total).toLocaleString()}
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <span style={{
                      padding: '0.25rem 0.75rem',
                      borderRadius: '2rem',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      background: `${statusColors[order.status] || '#64748B'}20`,
                      color: statusColors[order.status] || '#64748B'
                    }}>
                      {statusLabels[order.status] || order.status}
                    </span>
                  </td>
                  <td style={{ padding: '1rem', fontSize: '0.8rem', color: 'var(--text-muted)', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {order.shipping_address}
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <select 
                      value={order.status}
                      onChange={(e) => updateStatus(order.id, e.target.value)}
                      style={{
                        padding: '0.4rem 0.6rem',
                        borderRadius: 'var(--radius-sm)',
                        border: '1px solid var(--border-color)',
                        background: 'var(--bg-primary)',
                        color: 'var(--text-main)',
                        fontSize: '0.8rem',
                        cursor: 'pointer'
                      }}
                    >
                      <option value="pending">Pendiente</option>
                      <option value="paid">Pagado</option>
                      <option value="shipped">Enviado</option>
                      <option value="delivered">Entregado</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default AdminOrders;
