import { Link } from 'react-router-dom';
import { Package } from 'lucide-react';

const Footer = () => {
  return (
    <footer style={{
      marginTop: 'auto',
      borderTop: '1px solid var(--border-color)',
      backgroundColor: 'rgba(15, 23, 42, 0.8)',
      padding: '3rem 0 1.5rem 0'
    }}>
      <div className="container">
        <div className="grid grid-cols-4" style={{ gap: '2rem', marginBottom: '3rem' }}>
          <div style={{ gridColumn: 'span 1' }}>
            <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
              <Package className="text-gradient" size={24} />
              <span style={{ fontFamily: 'var(--font-heading)', fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)' }}>
                Mercado<span className="text-gradient">Express</span>
              </span>
            </Link>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '1.5rem' }}>
              Tu destino número uno para las mejores compras en línea. Calidad, rapidez y seguridad en cada pedido.
            </p>
          </div>
          
          <div>
            <h4 style={{ color: 'var(--text-main)', marginBottom: '1rem' }}>Comprar</h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <li><Link to="/catalog" style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Catálogo</Link></li>
              <li><Link to="/catalog?category=electronica" style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Electrónica</Link></li>
              <li><Link to="/catalog?category=ropa" style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Ropa</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 style={{ color: 'var(--text-main)', marginBottom: '1rem' }}>Soporte</h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <li><Link to="/tracking" style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Rastrear Pedido</Link></li>
              <li><a href="#" style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>FAQ</a></li>
              <li><a href="#" style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Contacto</a></li>
            </ul>
          </div>

          <div>
            <h4 style={{ color: 'var(--text-main)', marginBottom: '1rem' }}>Legal</h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <li><a href="#" style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Términos y Condiciones</a></li>
              <li><a href="#" style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Privacidad</a></li>
            </ul>
          </div>
        </div>
        
        <div style={{ 
          borderTop: '1px solid var(--border-light)', 
          paddingTop: '1.5rem',
          textAlign: 'center',
          color: 'var(--text-muted)',
          fontSize: '0.75rem'
        }}>
          &copy; {new Date().getFullYear()} MercadoExpress. Todos los derechos reservados.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
