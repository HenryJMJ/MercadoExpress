import { Link } from 'react-router-dom';
import { ArrowRight, ShoppingBag, Shield, Zap } from 'lucide-react';
import { useEffect, useState } from 'react';
import { apiFetch } from '../api';

const Home = () => {
  const [featured, setFeatured] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const data = await apiFetch('/catalog/products');
        setFeatured(data.slice(0, 4)); // Show first 4
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  return (
    <div>
      {/* Hero Section */}
      <section style={{
        position: 'relative',
        padding: '8rem 0 6rem 0',
        overflow: 'hidden',
        textAlign: 'center'
      }}>
        {/* Background glow effects */}
        <div style={{
          position: 'absolute',
          top: '-10%',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '600px',
          height: '600px',
          background: 'radial-gradient(circle, rgba(13,148,136,0.15) 0%, rgba(15,23,42,0) 70%)',
          zIndex: -1,
          borderRadius: '50%'
        }}></div>
        
        <div className="container animate-fade-in">
          <h1 style={{ fontSize: '4rem', marginBottom: '1.5rem', letterSpacing: '-0.025em' }}>
            Descubre el futuro del <br />
            <span className="text-gradient">E-Commerce Empresarial</span>
          </h1>
          <p style={{ 
            fontSize: '1.25rem', 
            color: 'var(--text-muted)', 
            maxWidth: '600px', 
            margin: '0 auto 3rem auto' 
          }}>
            Arquitectura de microservicios. Rendimiento ultrarrápido. Diseño premium. 
            Experimenta la próxima generación de compras en línea.
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem' }}>
            <Link to="/catalog" className="btn btn-primary" style={{ padding: '1rem 2rem', fontSize: '1.125rem' }}>
              Explorar Catálogo <ArrowRight size={20} />
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section style={{ padding: '5rem 0', backgroundColor: 'rgba(0,0,0,0.2)' }}>
        <div className="container">
          <div className="grid grid-cols-3">
            <div className="glass-panel" style={{ padding: '2rem', textAlign: 'center' }}>
              <div style={{ 
                width: '60px', height: '60px', 
                backgroundColor: 'rgba(13,148,136,0.1)', 
                borderRadius: '50%',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 1.5rem auto',
                color: 'var(--primary-light)'
              }}>
                <Zap size={30} />
              </div>
              <h3 style={{ fontSize: '1.25rem' }}>Rendimiento Extremo</h3>
              <p style={{ color: 'var(--text-muted)' }}>Arquitectura impulsada por caché de Redis y microservicios escalables.</p>
            </div>
            
            <div className="glass-panel" style={{ padding: '2rem', textAlign: 'center' }}>
              <div style={{ 
                width: '60px', height: '60px', 
                backgroundColor: 'rgba(245,158,11,0.1)', 
                borderRadius: '50%',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 1.5rem auto',
                color: 'var(--accent-color)'
              }}>
                <ShoppingBag size={30} />
              </div>
              <h3 style={{ fontSize: '1.25rem' }}>Experiencia Fluida</h3>
              <p style={{ color: 'var(--text-muted)' }}>Navegación instantánea y proceso de checkout optimizado.</p>
            </div>
            
            <div className="glass-panel" style={{ padding: '2rem', textAlign: 'center' }}>
              <div style={{ 
                width: '60px', height: '60px', 
                backgroundColor: 'rgba(16,185,129,0.1)', 
                borderRadius: '50%',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 1.5rem auto',
                color: 'var(--success)'
              }}>
                <Shield size={30} />
              </div>
              <h3 style={{ fontSize: '1.25rem' }}>Seguridad Total</h3>
              <p style={{ color: 'var(--text-muted)' }}>Autorización JWT y control de acceso basado en roles (RBAC).</p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section style={{ padding: '6rem 0' }}>
        <div className="container">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '3rem' }}>
            <div>
              <h2 style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>Destacados</h2>
              <p style={{ color: 'var(--text-muted)' }}>Los productos más populares de la semana</p>
            </div>
            <Link to="/catalog" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600 }}>
              Ver Todos <ArrowRight size={16} />
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-4">
              {[1, 2, 3, 4].map(n => (
                <div key={n} className="skeleton" style={{ height: '350px' }}></div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-4">
              {featured.map(product => (
                <Link to={`/product/${product.id}`} key={product.id} className="glass-panel" style={{ 
                  display: 'flex', flexDirection: 'column', overflow: 'hidden', transition: 'transform 0.3s'
                }}>
                  <div style={{ height: '200px', backgroundColor: '#fff', padding: '2rem' }}>
                    <img 
                      src={product.image_url} 
                      alt={product.name}
                      style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                      loading="lazy"
                    />
                  </div>
                  <div style={{ padding: '1.5rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                    <span style={{ color: 'var(--primary-light)', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>
                      {product.category_name}
                    </span>
                    <h3 style={{ fontSize: '1.125rem', marginBottom: '1rem', flex: 1 }}>{product.name}</h3>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '1.25rem', fontWeight: 700 }}>${Number(product.price).toLocaleString()}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default Home;
