import { useState } from 'react';
import { Link, Outlet, useLocation, useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  LayoutDashboard, ShoppingCart, Package, Users, BarChart3, 
  LogOut, ChevronLeft, ChevronRight, Settings, Home
} from 'lucide-react';

const AdminLayout = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);

  if (!user) {
    return <Navigate to="/admin/login" replace />;
  }

  if (user.role_id !== 5) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: 'var(--bg-primary)' }}>
        <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center', maxWidth: '400px' }}>
          <h2 style={{ marginBottom: '1rem' }}>Acceso Denegado</h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>No tienes permisos para acceder al panel de administración.</p>
          <Link to="/" className="btn btn-primary">Volver al Inicio</Link>
        </div>
      </div>
    );
  }

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const menuItems = [
    { path: '/admin', icon: LayoutDashboard, label: 'Dashboard', exact: true },
    { path: '/admin/orders', icon: ShoppingCart, label: 'Pedidos' },
    { path: '/admin/products', icon: Package, label: 'Productos' },
    { path: '/admin/analytics', icon: BarChart3, label: 'Analítica' },
  ];

  const isActive = (item) => {
    if (item.exact) return location.pathname === item.path;
    return location.pathname.startsWith(item.path);
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-primary)' }}>
      {/* Sidebar */}
      <aside style={{
        width: collapsed ? '70px' : '260px',
        background: 'rgba(15, 23, 42, 0.95)',
        borderRight: '1px solid var(--border-color)',
        display: 'flex',
        flexDirection: 'column',
        transition: 'width 0.3s ease',
        position: 'fixed',
        top: 0,
        left: 0,
        bottom: 0,
        zIndex: 50,
        overflow: 'hidden'
      }}>
        {/* Logo */}
        <div style={{ 
          padding: collapsed ? '1.5rem 0.75rem' : '1.5rem 1.5rem', 
          borderBottom: '1px solid var(--border-light)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: collapsed ? 'center' : 'space-between'
        }}>
          {!collapsed && (
            <Link to="/admin" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Package className="text-gradient" size={24} />
              <span style={{ fontFamily: 'var(--font-heading)', fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-main)' }}>
                Admin<span className="text-gradient">Panel</span>
              </span>
            </Link>
          )}
          {collapsed && <Package className="text-gradient" size={24} />}
          <button 
            onClick={() => setCollapsed(!collapsed)}
            style={{ 
              background: 'none', border: 'none', color: 'var(--text-muted)', 
              cursor: 'pointer', padding: '0.25rem',
              display: collapsed ? 'none' : 'block'
            }}
          >
            <ChevronLeft size={18} />
          </button>
        </div>

        {/* Nav Items */}
        <nav style={{ flex: 1, padding: '1rem 0.75rem', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
          {menuItems.map(item => (
            <Link
              key={item.path}
              to={item.path}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: collapsed ? '0.75rem' : '0.75rem 1rem',
                borderRadius: 'var(--radius-md)',
                color: isActive(item) ? 'var(--text-main)' : 'var(--text-muted)',
                background: isActive(item) ? 'rgba(13,148,136,0.15)' : 'transparent',
                borderLeft: isActive(item) ? '3px solid var(--primary-light)' : '3px solid transparent',
                fontWeight: isActive(item) ? 600 : 400,
                fontSize: '0.9rem',
                transition: 'all 0.2s ease',
                justifyContent: collapsed ? 'center' : 'flex-start',
                textDecoration: 'none'
              }}
            >
              <item.icon size={20} style={{ flexShrink: 0 }} />
              {!collapsed && <span>{item.label}</span>}
            </Link>
          ))}
        </nav>

        {/* Bottom Section */}
        <div style={{ padding: '1rem 0.75rem', borderTop: '1px solid var(--border-light)', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
          {collapsed && (
            <button onClick={() => setCollapsed(false)} style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              padding: '0.75rem', borderRadius: 'var(--radius-md)',
              color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer'
            }}>
              <ChevronRight size={20} />
            </button>
          )}

          <button onClick={handleLogout} style={{
            display: 'flex', alignItems: 'center', gap: '0.75rem',
            padding: collapsed ? '0.75rem' : '0.75rem 1rem',
            borderRadius: 'var(--radius-md)',
            color: 'var(--danger)', fontSize: '0.9rem', fontFamily: 'inherit',
            background: 'none', border: 'none', cursor: 'pointer',
            justifyContent: collapsed ? 'center' : 'flex-start'
          }}>
            <LogOut size={20} style={{ flexShrink: 0 }} />
            {!collapsed && <span>Cerrar Sesión</span>}
          </button>

          {/* User Info */}
          {!collapsed && (
            <div style={{ padding: '0.75rem 1rem', marginTop: '0.5rem', borderRadius: 'var(--radius-md)', background: 'rgba(255,255,255,0.03)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{
                  width: '32px', height: '32px', borderRadius: '50%',
                  background: 'linear-gradient(135deg, var(--primary-color), var(--primary-light))',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '0.8rem', fontWeight: 700, color: 'white', flexShrink: 0
                }}>
                  {user.full_name?.charAt(0)?.toUpperCase() || 'A'}
                </div>
                <div style={{ overflow: 'hidden' }}>
                  <div style={{ fontWeight: 600, fontSize: '0.8rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user.full_name}</div>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.7rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user.email}</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </aside>

      {/* Main Content */}
      <main style={{ 
        flex: 1, 
        marginLeft: collapsed ? '70px' : '260px',
        transition: 'margin-left 0.3s ease',
        minHeight: '100vh'
      }}>
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;
