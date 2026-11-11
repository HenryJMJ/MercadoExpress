import { useState, useEffect } from 'react';
import { apiFetch } from '../../api';
import { 
  DollarSign, ShoppingCart, Users, BarChart3, Package, 
  TrendingUp, TrendingDown, RefreshCw, Clock 
} from 'lucide-react';

const AdminDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchDashboard = async () => {
    setLoading(true);
    try {
      const dashboardData = await apiFetch('/analytics/dashboard');
      setData(dashboardData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchDashboard(); }, []);

  if (loading) {
    return (
      <div style={{ padding: '2rem' }}>
        <h1 style={{ marginBottom: '2rem' }}>Dashboard</h1>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem', marginBottom: '2rem' }}>
          {[1, 2, 3, 4].map(n => <div key={n} className="skeleton" style={{ height: '140px' }}></div>)}
        </div>
      </div>
    );
  }

  const hasOrders = data?.overview?.totalOrders > 0;

  return (
    <div style={{ padding: '2rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', marginBottom: '0.25rem' }}>Dashboard</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
            Resumen general de la plataforma MercadoExpress
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          {data?.lastUpdated && (
            <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Clock size={14} /> {new Date(data.lastUpdated).toLocaleTimeString()}
            </span>
          )}
          <button onClick={fetchDashboard} className="btn btn-outline" style={{ padding: '0.5rem 1rem', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <RefreshCw size={14} /> Actualizar
          </button>
        </div>
      </div>

      {!hasOrders && (
        <div style={{ padding: '1.25rem 1.5rem', marginBottom: '1.5rem', borderRadius: 'var(--radius-md)', background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)' }}>
          <strong style={{ color: 'var(--warning)' }}>📊 Sin datos de ventas aún.</strong>
          <span style={{ color: 'var(--text-muted)', marginLeft: '0.5rem' }}>
            Los datos se generan automáticamente a partir de pedidos reales realizados en la tienda.
          </span>
        </div>
      )}

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem', marginBottom: '2rem' }}>
        <KPICard 
          label="Ingresos Totales" 
          value={`$${(data?.overview?.totalRevenue || 0).toLocaleString()}`}
          icon={<DollarSign size={22} />}
          color="#10B981"
          subtitle={`${data?.overview?.paidOrders || 0} pagos completados`}
        />
        <KPICard 
          label="Pedidos" 
          value={(data?.overview?.totalOrders || 0).toString()}
          icon={<ShoppingCart size={22} />}
          color="#0D9488"
          subtitle={`${data?.overview?.paidOrders || 0} pagados`}
        />
        <KPICard 
          label="Compradores Únicos" 
          value={(data?.overview?.activeUsers || 0).toString()}
          icon={<Users size={22} />}
          color="#F59E0B"
          subtitle="usuarios con pedidos"
        />
        <KPICard 
          label="Ticket Promedio" 
          value={`$${(data?.overview?.avgOrderValue || 0).toLocaleString()}`}
          icon={<BarChart3 size={22} />}
          color="#3B82F6"
          subtitle={`${data?.overview?.totalProducts || 0} productos activos`}
        />
      </div>

      {/* Charts Row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '1.5rem', marginBottom: '2rem' }}>
        {/* Sales Chart */}
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <h3 style={{ marginBottom: '1.5rem', fontSize: '1rem' }}>Ventas por Día</h3>
          {data?.salesTrends?.some(t => t.revenue > 0) ? (
            <div style={{ height: '260px', display: 'flex', alignItems: 'flex-end', gap: '6%', padding: '0 3%' }}>
              {data.salesTrends.map((trend, i) => {
                const max = Math.max(...data.salesTrends.map(t => t.revenue));
                const height = max > 0 ? (trend.revenue / max) * 100 : 5;
                return (
                  <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.4rem' }}>
                    <div style={{ fontSize: '0.65rem', color: 'var(--primary-light)', fontWeight: 600 }}>
                      ${Math.round(trend.revenue).toLocaleString()}
                    </div>
                    <div style={{ 
                      width: '100%', height: `${Math.max(height, 4)}%`, 
                      background: `linear-gradient(to top, rgba(13,148,136,0.2), rgba(13,148,136,0.9))`,
                      borderRadius: '4px 4px 0 0', transition: 'height 0.6s ease', minHeight: '6px'
                    }}></div>
                    <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>
                      {new Date(trend.date).toLocaleDateString('es', { day: 'numeric', month: 'short' })}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <EmptyState icon={BarChart3} text="Las gráficas aparecerán con los pedidos" />
          )}
        </div>

        {/* Payment Methods */}
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <h3 style={{ marginBottom: '1.5rem', fontSize: '1rem' }}>Métodos de Pago</h3>
          {data?.paymentMethods?.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {data.paymentMethods.map((pm, i) => {
                const maxCount = Math.max(...data.paymentMethods.map(p => p.count));
                return (
                  <div key={i}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.875rem' }}>
                      <span style={{ fontWeight: 600, textTransform: 'capitalize' }}>{pm.method}</span>
                      <span style={{ color: 'var(--text-muted)' }}>{pm.count} • ${pm.total?.toLocaleString()}</span>
                    </div>
                    <div style={{ height: '8px', borderRadius: '4px', background: 'var(--bg-primary)' }}>
                      <div style={{ 
                        height: '100%', borderRadius: '4px',
                        background: `linear-gradient(to right, var(--primary-color), var(--primary-light))`,
                        width: `${(pm.count / maxCount) * 100}%`, transition: 'width 0.6s ease'
                      }}></div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <EmptyState icon={DollarSign} text="Sin pagos registrados" />
          )}
        </div>
      </div>

      {/* Bottom Row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
        {/* Recent Orders */}
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <h3 style={{ marginBottom: '1.5rem', fontSize: '1rem' }}>Pedidos Recientes</h3>
          {data?.recentOrders?.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {data.recentOrders.map((order, i) => (
                <div key={i} style={{ 
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center', 
                  padding: '0.75rem 1rem', borderRadius: 'var(--radius-sm)', 
                  background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-light)'
                }}>
                  <div>
                    <span style={{ fontWeight: 600, fontSize: '0.85rem' }}>
                      #{typeof order.id === 'string' ? order.id.slice(0, 8) : order.id}
                    </span>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      {new Date(order.created_at).toLocaleString('es', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>${order.total?.toLocaleString()}</div>
                    <StatusBadge status={order.status} />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState icon={ShoppingCart} text="Sin pedidos aún" />
          )}
        </div>

        {/* Top Products */}
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <h3 style={{ marginBottom: '1.5rem', fontSize: '1rem' }}>Productos del Catálogo</h3>
          {data?.topProducts?.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {data.topProducts.map((product, i) => (
                <div key={i} style={{ 
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  paddingBottom: '0.75rem',
                  borderBottom: i < data.topProducts.length - 1 ? '1px solid var(--border-light)' : 'none'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{ 
                      width: '28px', height: '28px', borderRadius: '50%', fontSize: '0.75rem',
                      background: i === 0 ? 'var(--warning)' : 'var(--bg-primary)', 
                      color: i === 0 ? '#000' : 'var(--text-muted)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700
                    }}>
                      {i + 1}
                    </div>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>{product.name}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        Stock: {product.stock} • ${product.price?.toLocaleString()} c/u
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState icon={Package} text="Sin productos" />
          )}
        </div>
      </div>
    </div>
  );
};

// --- Sub-components ---

const KPICard = ({ label, value, icon, color, subtitle }) => (
  <div className="glass-panel" style={{ padding: '1.5rem' }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
      <span style={{ color: 'var(--text-muted)', fontWeight: 500, fontSize: '0.85rem' }}>{label}</span>
      <div style={{ padding: '0.4rem', borderRadius: 'var(--radius-md)', backgroundColor: `${color}15`, color }}>{icon}</div>
    </div>
    <div style={{ fontSize: '1.75rem', fontWeight: 700, marginBottom: '0.4rem' }}>{value}</div>
    <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>{subtitle}</div>
  </div>
);

const StatusBadge = ({ status }) => {
  const map = {
    pending: { color: '#F59E0B', label: 'Pendiente' },
    paid: { color: '#10B981', label: 'Pagado' },
    shipped: { color: '#3B82F6', label: 'Enviado' },
    delivered: { color: '#10B981', label: 'Entregado' },
  };
  const s = map[status] || { color: 'var(--text-muted)', label: status };
  return <span style={{ fontSize: '0.7rem', fontWeight: 600, color: s.color }}>{s.label}</span>;
};

const EmptyState = ({ icon: Icon, text }) => (
  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '3rem 1rem', color: 'var(--text-muted)' }}>
    <Icon size={40} style={{ opacity: 0.2, marginBottom: '0.75rem' }} />
    <p style={{ fontSize: '0.85rem' }}>{text}</p>
  </div>
);

export default AdminDashboard;
