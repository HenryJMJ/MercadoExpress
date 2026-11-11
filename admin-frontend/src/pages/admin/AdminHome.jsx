import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { apiFetch } from '../../api';
import { 
  ShoppingCart, Package, Store, BarChart3, 
  AlertCircle, Clock, DollarSign, ChevronRight, AlertTriangle
} from 'lucide-react';

const AdminHome = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    pendingApprovals: 0,
    outOfStock: 0,
    totalRevenue: 0,
    recentOrders: []
  });

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [dashboardData, pendingProducts, allProducts] = await Promise.all([
          apiFetch('/analytics/dashboard').catch(() => null),
          apiFetch('/catalog/seller-products?status=pending').catch(() => []),
          apiFetch('/catalog/products').catch(() => [])
        ]);

        let outOfStockCount = 0;
        if (Array.isArray(allProducts)) {
          outOfStockCount = allProducts.filter(p => p.stock <= 0).length;
        } else if (allProducts && Array.isArray(allProducts.products)) {
          outOfStockCount = allProducts.products.filter(p => p.stock <= 0).length;
        }

        setStats({
          pendingApprovals: Array.isArray(pendingProducts) ? pendingProducts.length : 0,
          outOfStock: outOfStockCount,
          totalRevenue: dashboardData?.overview?.totalRevenue || 0,
          recentOrders: dashboardData?.recentOrders?.slice(0, 5) || []
        });
      } catch (err) {
        console.error("Error fetching admin home data", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div style={{ padding: '2rem' }}>
        <h1 style={{ fontSize: '2rem', marginBottom: '2rem' }}>Panel de Administración</h1>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem', marginBottom: '2rem' }}>
          {[1, 2, 3].map(n => <div key={n} className="skeleton" style={{ height: '140px', borderRadius: 'var(--radius-lg)' }}></div>)}
        </div>
        <div className="skeleton" style={{ height: '300px', borderRadius: 'var(--radius-lg)' }}></div>
      </div>
    );
  }

  return (
    <div style={{ padding: '2rem' }}>
      <div style={{ marginBottom: '2.5rem' }}>
        <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Resumen de Actividad</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '1rem' }}>
          Hola, <strong>{user?.full_name}</strong>. Aquí tienes un vistazo rápido de lo que requiere tu atención.
        </p>
      </div>

      {/* KPI Alert Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem', marginBottom: '2.5rem' }}>
        
        {/* Pending Approvals */}
        <Link to="/seller-approvals" className="glass-panel" style={{ 
          padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1.5rem', 
          textDecoration: 'none', transition: 'transform 0.2s, box-shadow 0.2s',
          borderLeft: stats.pendingApprovals > 0 ? '4px solid var(--warning)' : '4px solid var(--border-color)'
        }}
        onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 10px 25px rgba(0,0,0,0.2)'; }}
        onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
        >
          <div style={{ 
            width: '60px', height: '60px', borderRadius: '50%', 
            background: stats.pendingApprovals > 0 ? 'rgba(245,158,11,0.15)' : 'rgba(255,255,255,0.05)', 
            color: stats.pendingApprovals > 0 ? 'var(--warning)' : 'var(--text-muted)',
            display: 'flex', alignItems: 'center', justifyContent: 'center' 
          }}>
            <Clock size={30} />
          </div>
          <div>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-main)', lineHeight: 1 }}>{stats.pendingApprovals}</div>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '0.25rem' }}>Pendientes de Aprobación</div>
          </div>
        </Link>

        {/* Out of stock */}
        <Link to="/products" className="glass-panel" style={{ 
          padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1.5rem', 
          textDecoration: 'none', transition: 'transform 0.2s, box-shadow 0.2s',
          borderLeft: stats.outOfStock > 0 ? '4px solid var(--danger)' : '4px solid var(--border-color)'
        }}
        onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 10px 25px rgba(0,0,0,0.2)'; }}
        onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
        >
          <div style={{ 
            width: '60px', height: '60px', borderRadius: '50%', 
            background: stats.outOfStock > 0 ? 'rgba(239,68,68,0.15)' : 'rgba(255,255,255,0.05)', 
            color: stats.outOfStock > 0 ? 'var(--danger)' : 'var(--text-muted)',
            display: 'flex', alignItems: 'center', justifyContent: 'center' 
          }}>
            <AlertTriangle size={30} />
          </div>
          <div>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-main)', lineHeight: 1 }}>{stats.outOfStock}</div>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '0.25rem' }}>Productos Agotados</div>
          </div>
        </Link>

        {/* Total Revenue */}
        <Link to="/analytics" className="glass-panel" style={{ 
          padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1.5rem', 
          textDecoration: 'none', transition: 'transform 0.2s, box-shadow 0.2s',
          borderLeft: '4px solid var(--success)'
        }}
        onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 10px 25px rgba(0,0,0,0.2)'; }}
        onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
        >
          <div style={{ 
            width: '60px', height: '60px', borderRadius: '50%', 
            background: 'rgba(16,185,129,0.15)', color: 'var(--success)',
            display: 'flex', alignItems: 'center', justifyContent: 'center' 
          }}>
            <DollarSign size={30} />
          </div>
          <div>
            <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-main)', lineHeight: 1 }}>
              ${stats.totalRevenue.toLocaleString()}
            </div>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '0.25rem' }}>Ingresos Totales</div>
          </div>
        </Link>

      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem' }}>
        
        {/* Recent Orders Table */}
        <div className="glass-panel" style={{ overflow: 'hidden' }}>
          <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border-light)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ margin: 0, fontSize: '1.1rem' }}>Últimos Pedidos</h3>
            <Link to="/orders" style={{ fontSize: '0.85rem', color: 'var(--primary-light)', textDecoration: 'none', fontWeight: 600 }}>Ver Todos</Link>
          </div>
          
          {stats.recentOrders.length > 0 ? (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-light)', background: 'rgba(0,0,0,0.2)' }}>
                  <th style={{ padding: '1rem', textAlign: 'left', fontSize: '0.8rem', color: 'var(--text-muted)' }}>ID</th>
                  <th style={{ padding: '1rem', textAlign: 'left', fontSize: '0.8rem', color: 'var(--text-muted)' }}>Fecha</th>
                  <th style={{ padding: '1rem', textAlign: 'left', fontSize: '0.8rem', color: 'var(--text-muted)' }}>Total</th>
                  <th style={{ padding: '1rem', textAlign: 'left', fontSize: '0.8rem', color: 'var(--text-muted)' }}>Estado</th>
                </tr>
              </thead>
              <tbody>
                {stats.recentOrders.map(order => (
                  <tr key={order.id} style={{ borderBottom: '1px solid var(--border-light)' }}>
                    <td style={{ padding: '1rem', fontSize: '0.85rem', fontWeight: 600 }}>#{typeof order.id === 'string' ? order.id.slice(0, 8) : order.id}</td>
                    <td style={{ padding: '1rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                      {new Date(order.created_at).toLocaleDateString('es', { day: 'numeric', month: 'short' })}
                    </td>
                    <td style={{ padding: '1rem', fontSize: '0.85rem', fontWeight: 600 }}>${order.total?.toLocaleString()}</td>
                    <td style={{ padding: '1rem' }}>
                      <span style={{ 
                        fontSize: '0.75rem', fontWeight: 600, padding: '0.2rem 0.6rem', borderRadius: '1rem',
                        background: order.status === 'pending' ? 'rgba(245,158,11,0.15)' : 'rgba(16,185,129,0.15)',
                        color: order.status === 'pending' ? 'var(--warning)' : 'var(--success)'
                      }}>
                        {order.status === 'pending' ? 'Pendiente' : 'Procesado'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
              No hay pedidos recientes.
            </div>
          )}
        </div>

        {/* Quick Links / Actions */}
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <h3 style={{ margin: '0 0 1.5rem 0', fontSize: '1.1rem' }}>Accesos Rápidos</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <QuickLink to="/products" icon={Package} label="Gestionar Productos" />
            <QuickLink to="/seller-approvals" icon={Store} label="Aprobar Vendedores" />
            <QuickLink to="/orders" icon={ShoppingCart} label="Ver Todos los Pedidos" />
            <QuickLink to="/analytics" icon={BarChart3} label="Reportes Analíticos" />
          </div>
        </div>

      </div>
    </div>
  );
};

const QuickLink = ({ to, icon: Icon, label }) => (
  <Link to={to} style={{ 
    display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem', 
    borderRadius: 'var(--radius-md)', background: 'rgba(255,255,255,0.03)',
    textDecoration: 'none', color: 'var(--text-main)', transition: 'background 0.2s'
  }}
  onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.08)'}
  onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.03)'}
  >
    <div style={{ color: 'var(--primary-light)' }}><Icon size={20} /></div>
    <span style={{ fontWeight: 500, fontSize: '0.9rem', flex: 1 }}>{label}</span>
    <ChevronRight size={16} style={{ color: 'var(--text-muted)' }} />
  </Link>
);

export default AdminHome;
