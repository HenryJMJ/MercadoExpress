import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { apiFetch } from '../api';
import { BarChart3, TrendingUp, Users, DollarSign, Package, ShoppingCart, RefreshCw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
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

  useEffect(() => {
    if (!user) return;
    if (user.role_id !== 5) {
      navigate('/');
      return;
    }
    fetchDashboard();
  }, [user, navigate]);

  if (!user || user.role_id !== 5) return null;

  if (loading) {
    return (
      <div className="container" style={{ padding: '4rem 1.5rem' }}>
        <h1 style={{ marginBottom: '2rem' }}>Dashboard Analítico</h1>
        <div className="grid grid-cols-4" style={{ marginBottom: '2rem' }}>
          {[1, 2, 3, 4].map(n => <div key={n} className="skeleton" style={{ height: '140px' }}></div>)}
        </div>
        <div className="grid grid-cols-2">
          <div className="skeleton" style={{ height: '400px' }}></div>
          <div className="skeleton" style={{ height: '400px' }}></div>
        </div>
      </div>
    );
  }

  const hasOrders = data?.overview?.totalOrders > 0;

  return (
    <div className="container animate-fade-in" style={{ padding: '4rem 1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1>Dashboard Analítico</h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
            Actualizado: {data?.lastUpdated ? new Date(data.lastUpdated).toLocaleTimeString() : '-'}
          </div>
          <button 
            onClick={fetchDashboard} 
            className="btn btn-outline" 
            style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
          >
            <RefreshCw size={14} /> Actualizar
          </button>
        </div>
      </div>

      {!hasOrders && (
        <div className="glass-panel" style={{ padding: '2rem', marginBottom: '2rem', borderLeft: '4px solid var(--warning)' }}>
          <strong>📊 Sin datos aún.</strong> Los datos del dashboard se generan automáticamente a partir de pedidos reales. 
          Realiza compras en el catálogo para ver las métricas actualizarse en tiempo real.
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-4" style={{ marginBottom: '2rem' }}>
        <KPICard 
          label="Ingresos Totales" 
          value={`$${(data?.overview?.totalRevenue || 0).toLocaleString()}`}
          icon={<DollarSign size={20} />}
          iconBg="rgba(16,185,129,0.1)"
          iconColor="var(--success)"
          subtitle={hasOrders ? `De ${data.overview.paidOrders || 0} pagos completados` : 'Sin ventas aún'}
          subtitleColor={hasOrders ? 'var(--success)' : 'var(--text-muted)'}
        />
        <KPICard 
          label="Pedidos Totales" 
          value={(data?.overview?.totalOrders || 0).toLocaleString()}
          icon={<ShoppingCart size={20} />}
          iconBg="rgba(13,148,136,0.1)"
          iconColor="var(--primary-light)"
          subtitle={`${data?.overview?.paidOrders || 0} pagados`}
          subtitleColor="var(--primary-light)"
        />
        <KPICard 
          label="Usuarios Activos" 
          value={(data?.overview?.activeUsers || 0).toLocaleString()}
          icon={<Users size={20} />}
          iconBg="rgba(245,158,11,0.1)"
          iconColor="var(--warning)"
          subtitle="Compradores únicos"
          subtitleColor="var(--text-muted)"
        />
        <KPICard 
          label="Ticket Promedio" 
          value={`$${(data?.overview?.avgOrderValue || 0).toLocaleString()}`}
          icon={<BarChart3 size={20} />}
          iconBg="rgba(59,130,246,0.1)"
          iconColor="#3B82F6"
          subtitle={`${data?.overview?.totalProducts || 0} productos en catálogo`}
          subtitleColor="var(--text-muted)"
        />
      </div>

      <div className="grid grid-cols-2" style={{ gap: '2rem', marginBottom: '2rem' }}>
        {/* Sales Chart */}
        <div className="glass-panel" style={{ padding: '2rem' }}>
          <h3 style={{ marginBottom: '2rem' }}>Tendencia de Ventas</h3>
          {data?.salesTrends?.length > 0 && data.salesTrends.some(t => t.revenue > 0) ? (
            <div style={{ height: '280px', display: 'flex', alignItems: 'flex-end', gap: '8%', padding: '0 5%' }}>
              {data.salesTrends.map((trend, i) => {
                const max = Math.max(...data.salesTrends.map(t => t.revenue));
                const height = max > 0 ? (trend.revenue / max) * 100 : 5;
                return (
                  <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                    <div style={{ fontSize: '0.7rem', color: 'var(--primary-light)', fontWeight: 600 }}>
                      ${Math.round(trend.revenue).toLocaleString()}
                    </div>
                    <div style={{ 
                      width: '100%', 
                      height: `${Math.max(height, 5)}%`, 
                      background: 'linear-gradient(to top, rgba(13,148,136,0.3), rgba(13,148,136,1))',
                      borderRadius: '4px 4px 0 0',
                      transition: 'height 0.8s ease-out',
                      minHeight: '8px'
                    }}></div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textAlign: 'center' }}>
                      {new Date(trend.date).toLocaleDateString('es', { day: 'numeric', month: 'short' })}
                    </div>
                    <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>
                      {trend.orders} orden{trend.orders !== 1 ? 'es' : ''}
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div style={{ height: '280px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
              <div style={{ textAlign: 'center' }}>
                <BarChart3 size={48} style={{ margin: '0 auto 1rem auto', opacity: 0.3 }} />
                <p>Las barras aparecerán cuando haya pedidos</p>
              </div>
            </div>
          )}
        </div>

        {/* Top Products */}
        <div className="glass-panel" style={{ padding: '2rem' }}>
          <h3 style={{ marginBottom: '1.5rem' }}>Productos en Catálogo</h3>
          {data?.topProducts?.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {data.topProducts.map((product, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '1rem', borderBottom: i !== data.topProducts.length - 1 ? '1px solid var(--border-light)' : 'none' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ 
                      width: '30px', height: '30px', borderRadius: '50%', 
                      background: i === 0 ? 'var(--warning)' : 'var(--bg-secondary)', 
                      color: i === 0 ? 'black' : 'var(--text-muted)', 
                      display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 
                    }}>
                      {i + 1}
                    </div>
                    <div>
                      <div style={{ fontWeight: 600 }}>{product.name}</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        Stock: {product.stock} • ${product.price?.toLocaleString()} c/u
                      </div>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontWeight: 700, color: 'var(--primary-light)' }}>
                      ${product.revenue?.toLocaleString() || '0'}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      {product.sold} vendidos
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '3rem 0' }}>
              <Package size={48} style={{ margin: '0 auto 1rem auto', opacity: 0.3 }} />
              <p>Sin productos aún</p>
            </div>
          )}
        </div>
      </div>

      {/* Recent Orders + Payment Methods */}
      <div className="grid grid-cols-2" style={{ gap: '2rem' }}>
        <div className="glass-panel" style={{ padding: '2rem' }}>
          <h3 style={{ marginBottom: '1.5rem' }}>Pedidos Recientes</h3>
          {data?.recentOrders?.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {data.recentOrders.map((order, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem', borderRadius: 'var(--radius-sm)', background: 'rgba(255,255,255,0.03)' }}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>Pedido #{typeof order.id === 'string' ? order.id.slice(0, 8) : order.id}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      {new Date(order.created_at).toLocaleString('es')}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontWeight: 700 }}>${order.total?.toLocaleString()}</div>
                    <StatusBadge status={order.status} />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '2rem 0' }}>Sin pedidos recientes</p>
          )}
        </div>

        <div className="glass-panel" style={{ padding: '2rem' }}>
          <h3 style={{ marginBottom: '1.5rem' }}>Métodos de Pago</h3>
          {data?.paymentMethods?.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {data.paymentMethods.map((pm, i) => (
                <div key={i}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <span style={{ fontWeight: 600, textTransform: 'capitalize' }}>{pm.method}</span>
                    <span style={{ color: 'var(--text-muted)' }}>{pm.count} transacciones • ${pm.total?.toLocaleString()}</span>
                  </div>
                  <div style={{ height: '6px', borderRadius: '3px', background: 'var(--bg-secondary)' }}>
                    <div style={{ 
                      height: '100%', borderRadius: '3px',
                      background: 'linear-gradient(to right, var(--primary-color), var(--primary-light))',
                      width: `${Math.min(100, (pm.count / Math.max(...data.paymentMethods.map(p => p.count))) * 100)}%`,
                      transition: 'width 0.8s ease-out'
                    }}></div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '2rem 0' }}>Sin pagos registrados</p>
          )}
        </div>
      </div>
    </div>
  );
};

// Reusable KPI Card
const KPICard = ({ label, value, icon, iconBg, iconColor, subtitle, subtitleColor }) => (
  <div className="glass-panel" style={{ padding: '1.5rem' }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
      <div style={{ color: 'var(--text-muted)', fontWeight: 500, fontSize: '0.875rem' }}>{label}</div>
      <div style={{ padding: '0.5rem', backgroundColor: iconBg, color: iconColor, borderRadius: 'var(--radius-md)' }}>{icon}</div>
    </div>
    <div style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '0.5rem' }}>{value}</div>
    <div style={{ color: subtitleColor, fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
      {subtitle}
    </div>
  </div>
);

// Status Badge
const StatusBadge = ({ status }) => {
  const colors = {
    pending: 'var(--warning)',
    paid: 'var(--success)',
    shipped: '#3B82F6',
    delivered: 'var(--success)',
    completed: 'var(--success)',
  };
  const labels = {
    pending: 'Pendiente',
    paid: 'Pagado',
    shipped: 'Enviado',
    delivered: 'Entregado',
    completed: 'Completado',
  };
  return (
    <span style={{ fontSize: '0.7rem', fontWeight: 600, color: colors[status] || 'var(--text-muted)' }}>
      {labels[status] || status}
    </span>
  );
};

export default Dashboard;
