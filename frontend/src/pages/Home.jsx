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
        setFeatured(data.slice(0, 8)); // Show more for carousel
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
            Somos tu mercado de confianza en línea. Encuentra los mejores productos,
            marcas reconocidas y ofertas exclusivas diseñadas para ti.
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
              <h3 style={{ fontSize: '1.25rem' }}>Calidad Garantizada</h3>
              <p style={{ color: 'var(--text-muted)' }}>Seleccionamos cuidadosamente cada producto para asegurar tu completa satisfacción.</p>
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
              <h3 style={{ fontSize: '1.25rem' }}>Envíos Rápidos</h3>
              <p style={{ color: 'var(--text-muted)' }}>Recibe tus compras en la puerta de tu casa en tiempo récord y con seguimiento.</p>
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
              <h3 style={{ fontSize: '1.25rem' }}>Pagos Seguros</h3>
              <p style={{ color: 'var(--text-muted)' }}>Tus transacciones están protegidas con los más altos estándares de seguridad en la industria.</p>
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
            <div style={{ overflow: 'hidden', position: 'relative', width: '100%', padding: '1rem 0' }}>
              <style>{`
                @keyframes auto-scroll {
                  0% { transform: translateX(0); }
                  100% { transform: translateX(calc(-280px * ${featured.length} - 1.5rem * ${featured.length})); }
                }
                .carousel-track {
                  display: flex;
                  gap: 1.5rem;
                  width: max-content;
                  animation: auto-scroll ${featured.length * 4}s linear infinite;
                }
                .carousel-track:hover {
                  animation-play-state: paused;
                }
                .carousel-item {
                  width: 280px;
                  flex-shrink: 0;
                }
              `}</style>
              <div className="carousel-track">
                {[...featured, ...featured].map((product, index) => (
                  <Link to={`/product/${product.id}`} key={`${product.id}-${index}`} className="glass-panel carousel-item" style={{ 
                    display: 'flex', flexDirection: 'column', overflow: 'hidden', transition: 'transform 0.3s'
                  }}>
                    <div style={{ height: '220px', backgroundColor: 'transparent', padding: '1.5rem', position: 'relative' }}>
                      <img 
                        src={product.image_url} 
                        alt={product.name}
                        style={{ 
                          width: '100%', height: '100%', objectFit: 'contain',
                          opacity: (product.approval_status === 'paused' || product.stock <= 0) ? 0.5 : 1
                        }}
                        loading="lazy"
                      />
                      {/* Overlays */}
                      {product.approval_status === 'paused' ? (
                        <div style={{
                          position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
                          background: 'rgba(55, 65, 81, 0.9)', color: 'white',
                          padding: '0.4rem 1rem', borderRadius: '2rem',
                          fontSize: '1rem', fontWeight: 700, letterSpacing: '0.05em'
                        }}>
                          Pausado
                        </div>
                      ) : product.stock <= 0 ? (
                        <div style={{
                          position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
                          background: 'rgba(220, 38, 38, 0.9)', color: 'white',
                          padding: '0.4rem 1rem', borderRadius: '2rem',
                          fontSize: '1rem', fontWeight: 700, letterSpacing: '0.05em'
                        }}>
                          Agotado
                        </div>
                      ) : null}
                    </div>
                    <div style={{ padding: '1.5rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                      <span style={{ color: 'var(--primary-light)', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>
                        {product.category_name}
                      </span>
                      <h3 style={{ fontSize: '1.125rem', marginBottom: '0.5rem', flex: 1 }}>{product.name}</h3>
                      
                      {/* Status Messages */}
                      {product.approval_status === 'paused' && (
                        <p style={{ color: 'var(--warning)', fontSize: '0.75rem', fontWeight: 600, margin: '0 0 1rem 0' }}>
                          Producto no disponible en el momento
                        </p>
                      )}
                      {product.approval_status !== 'paused' && product.stock <= 0 && (
                        <p style={{ color: 'var(--danger)', fontSize: '0.75rem', fontWeight: 600, margin: '0 0 1rem 0' }}>
                          Producto sin stock
                        </p>
                      )}

                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto' }}>
                        <span style={{ fontSize: '1.25rem', fontWeight: 700 }}>${Number(product.price).toLocaleString()}</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default Home;
