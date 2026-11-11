import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { ShoppingCart, User, Package, LogOut, Menu, X, LayoutDashboard, ChevronDown, Settings, ClipboardList } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const { totalItems } = useCart();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const handleLogout = async () => {
    setIsDropdownOpen(false);
    await logout();
    navigate('/');
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <nav className="glass-panel" style={{
      position: 'sticky',
      top: 0,
      zIndex: 50,
      borderRadius: 0,
      borderTop: 'none',
      borderLeft: 'none',
      borderRight: 'none'
    }}>
      <div className="container" style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '1rem 1.5rem'
      }}>
        {/* Logo */}
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Package className="text-gradient" size={28} />
          <span style={{
            fontFamily: 'var(--font-heading)',
            fontSize: '1.5rem',
            fontWeight: 800,
            color: 'var(--text-main)'
          }}>
            Mercado<span className="text-gradient">Express</span>
          </span>
        </Link>

        {/* Desktop Nav */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }} className="hide-on-mobile">
          <Link to="/catalog" style={{ fontWeight: 500 }}>Catálogo</Link>
          
          <Link to="/cart" style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            <ShoppingCart size={22} />
            {totalItems > 0 && (
              <span style={{
                position: 'absolute',
                top: '-8px',
                right: '-10px',
                background: 'var(--accent-color)',
                color: 'white',
                fontSize: '0.75rem',
                fontWeight: 700,
                width: '18px',
                height: '18px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                {totalItems}
              </span>
            )}
          </Link>

          {user ? (
            <div style={{ position: 'relative' }} ref={dropdownRef}>
              <button 
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '0.5rem',
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid var(--border-light)',
                  borderRadius: 'var(--radius-md)',
                  color: 'var(--text-main)',
                  cursor: 'pointer',
                  fontWeight: 500,
                  padding: '0.5rem 1rem',
                  transition: 'all 0.2s ease'
                }}
              >
                <div style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, var(--primary-color), var(--primary-light))',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  color: 'white'
                }}>
                  {user.full_name?.charAt(0)?.toUpperCase() || 'U'}
                </div>
                {user.full_name?.split(' ')[0]}
                <ChevronDown size={16} style={{ 
                  transition: 'transform 0.2s ease',
                  transform: isDropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)' 
                }} />
              </button>

              {/* Dropdown Menu */}
              {isDropdownOpen && (
                <div style={{
                  position: 'absolute',
                  right: 0,
                  top: 'calc(100% + 0.5rem)',
                  minWidth: '220px',
                  backgroundColor: 'var(--bg-secondary)',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-lg)',
                  boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
                  overflow: 'hidden',
                  animation: 'fadeIn 0.15s ease-out',
                  zIndex: 100
                }}>
                  {/* User Info Header */}
                  <div style={{ 
                    padding: '1rem', 
                    borderBottom: '1px solid var(--border-light)',
                    background: 'rgba(255,255,255,0.03)'
                  }}>
                    <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{user.full_name}</div>
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>{user.email}</div>
                    {user.role_id === 5 && (
                      <span style={{ 
                        display: 'inline-block', marginTop: '0.4rem',
                        padding: '0.15rem 0.5rem', borderRadius: '1rem', 
                        fontSize: '0.7rem', fontWeight: 600,
                        background: 'rgba(245,158,11,0.15)', color: 'var(--warning)' 
                      }}>
                        Administrador
                      </span>
                    )}
                  </div>

                  {/* Menu Items */}
                  <div style={{ padding: '0.5rem' }}>
                    <Link 
                      to="/orders" 
                      onClick={() => setIsDropdownOpen(false)}
                      style={dropdownItemStyle}
                    >
                      <ClipboardList size={16} /> Mis Pedidos
                    </Link>

                    <Link 
                      to="/tracking" 
                      onClick={() => setIsDropdownOpen(false)}
                      style={dropdownItemStyle}
                    >
                      <Package size={16} /> Rastrear Envío
                    </Link>

                    {user.role_id === 5 && (
                      <Link 
                        to="/admin" 
                        onClick={() => setIsDropdownOpen(false)}
                        style={{ ...dropdownItemStyle, color: 'var(--warning)' }}
                      >
                        <LayoutDashboard size={16} /> Dashboard Admin
                      </Link>
                    )}

                    <div style={{ height: '1px', background: 'var(--border-light)', margin: '0.25rem 0' }}></div>

                    <button 
                      onClick={handleLogout}
                      style={{ ...dropdownItemStyle, color: 'var(--danger)', width: '100%', background: 'none', border: 'none', fontSize: '0.875rem', fontFamily: 'inherit' }}
                    >
                      <LogOut size={16} /> Cerrar Sesión
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <Link to="/login" className="btn btn-primary" style={{ padding: '0.5rem 1.25rem' }}>
              Iniciar Sesión
            </Link>
          )}
        </div>

        {/* Mobile Menu Toggle */}
        <button 
          className="hide-on-desktop"
          style={{ background: 'none', border: 'none', color: 'var(--text-main)' }}
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Nav */}
      {isMenuOpen && (
        <div className="hide-on-desktop glass-panel" style={{ padding: '1rem', borderTop: '1px solid var(--border-light)' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <Link to="/catalog" onClick={() => setIsMenuOpen(false)}>Catálogo</Link>
            <Link to="/cart" onClick={() => setIsMenuOpen(false)}>Carrito ({totalItems})</Link>
            {user ? (
              <>
                <Link to="/orders" onClick={() => setIsMenuOpen(false)}>Mis Pedidos</Link>
                <Link to="/tracking" onClick={() => setIsMenuOpen(false)}>Rastrear Envío</Link>
                {user.role_id === 5 && (
                  <Link to="/admin" onClick={() => setIsMenuOpen(false)}>Dashboard Admin</Link>
                )}
                <button onClick={() => { handleLogout(); setIsMenuOpen(false); }} style={{
                  background: 'none', border: 'none', color: 'var(--danger)', textAlign: 'left', fontSize: '1rem', cursor: 'pointer'
                }}>
                  Cerrar Sesión
                </button>
              </>
            ) : (
              <Link to="/login" className="btn btn-primary" onClick={() => setIsMenuOpen(false)}>
                Iniciar Sesión
              </Link>
            )}
          </div>
        </div>
      )}
      
      <style>{`
        .hide-on-mobile { display: flex; }
        .hide-on-desktop { display: none; }
        @media (max-width: 768px) {
          .hide-on-mobile { display: none !important; }
          .hide-on-desktop { display: block; }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-8px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}
      </style>
    </nav>
  );
};

const dropdownItemStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '0.75rem',
  padding: '0.6rem 0.75rem',
  borderRadius: 'var(--radius-sm)',
  color: 'var(--text-main)',
  fontSize: '0.875rem',
  cursor: 'pointer',
  transition: 'background 0.15s ease',
  textDecoration: 'none',
};

export default Navbar;
