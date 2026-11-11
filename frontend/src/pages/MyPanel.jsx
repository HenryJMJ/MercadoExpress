import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useEffect } from 'react';
import { ClipboardList, Package, Store, ShoppingBag, User, Settings, ChevronRight } from 'lucide-react';

const MyPanel = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) {
      navigate('/login?redirect=/panel');
    }
  }, [user, loading, navigate]);

  if (loading || !user) return null;

  const sections = [
    {
      title: 'Mis Pedidos',
      description: 'Revisa el historial y estado de todas tus compras.',
      icon: ClipboardList,
      to: '/orders',
      color: 'var(--primary-light)',
      bgColor: 'rgba(13,148,136,0.1)'
    },
    {
      title: 'Rastrear Envío',
      description: 'Consulta el estado de envío de tus pedidos en tiempo real.',
      icon: Package,
      to: '/tracking',
      color: 'var(--accent-color)',
      bgColor: 'rgba(245,158,11,0.1)'
    },
    {
      title: 'Vender Productos',
      description: 'Publica productos de tu emprendimiento para vender en MercadoExpress.',
      icon: Store,
      to: '/sell',
      color: 'var(--success)',
      bgColor: 'rgba(16,185,129,0.1)'
    },
    {
      title: 'Mis Productos',
      description: 'Administra los productos que has publicado para la venta.',
      icon: ShoppingBag,
      to: '/my-products',
      color: '#8B5CF6',
      bgColor: 'rgba(139,92,246,0.1)'
    },
    {
      title: 'Perfil',
      description: 'Consulta y edita tus datos personales, teléfono y dirección.',
      icon: User,
      to: '/profile',
      color: '#06B6D4',
      bgColor: 'rgba(6,182,212,0.1)'
    },
    {
      title: 'Configuración',
      description: 'Administra la seguridad, contraseña y preferencias de tu cuenta.',
      icon: Settings,
      to: '/settings',
      color: '#F97316',
      bgColor: 'rgba(249,115,22,0.1)'
    }
  ];

  return (
    <div className="container animate-fade-in" style={{ padding: '3rem 1.5rem', maxWidth: '900px' }}>
      {/* Header */}
      <div style={{ marginBottom: '2.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
          <div style={{
            width: '56px', height: '56px', borderRadius: '50%',
            background: 'linear-gradient(135deg, var(--primary-color), var(--primary-light))',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '1.5rem', fontWeight: 700, color: 'white'
          }}>
            {user.full_name?.charAt(0)?.toUpperCase() || 'U'}
          </div>
          <div>
            <h1 style={{ fontSize: '2rem', margin: 0 }}>Panel</h1>
            <p style={{ color: 'var(--text-muted)', margin: 0 }}>
              Bienvenido, <strong>{user.full_name}</strong>
            </p>
          </div>
        </div>
      </div>

      {/* Sections Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.25rem' }}>
        {sections.map((section) => (
          <Link
            key={section.title}
            to={section.to}
            className="glass-panel"
            style={{
              padding: '2rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem',
              transition: 'transform 0.2s ease, box-shadow 0.2s ease',
              cursor: 'pointer',
              textDecoration: 'none',
              position: 'relative',
              overflow: 'hidden'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-4px)';
              e.currentTarget.style.boxShadow = '0 12px 40px rgba(0,0,0,0.3)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            <div style={{
              width: '52px', height: '52px', borderRadius: 'var(--radius-md)',
              background: section.bgColor,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: section.color
            }}>
              <section.icon size={26} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.2rem', marginBottom: '0.4rem', color: 'var(--text-main)' }}>
                {section.title}
              </h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', margin: 0, lineHeight: 1.5 }}>
                {section.description}
              </p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: section.color, fontSize: '0.85rem', fontWeight: 600, marginTop: 'auto' }}>
              Ir a la sección <ChevronRight size={16} />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default MyPanel;
