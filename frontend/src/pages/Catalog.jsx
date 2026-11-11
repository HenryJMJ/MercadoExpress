import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Search, Filter, ShoppingCart, ArrowUpDown } from 'lucide-react';
import { apiFetch } from '../api';
import { useCart } from '../context/CartContext';
import toast from 'react-hot-toast';

const Catalog = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState('featured');
  const [searchParams, setSearchParams] = useSearchParams();
  const { addToCart } = useCart();

  const categoryFilter = searchParams.get('category') || '';
  const searchQuery = searchParams.get('search') || '';

  useEffect(() => {
    const fetchCatalogData = async () => {
      setLoading(true);
      try {
        const [catsData, prodsData] = await Promise.all([
          apiFetch('/catalog/categories'),
          apiFetch(`/catalog/products?category=${categoryFilter}&search=${searchQuery}`)
        ]);
        setCategories(catsData);
        setProducts(prodsData);
      } catch (err) {
        toast.error('Error cargando el catálogo');
      } finally {
        setLoading(false);
      }
    };
    fetchCatalogData();
  }, [categoryFilter, searchQuery]);

  const handleSearch = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const search = formData.get('search');

    if (search) {
      searchParams.set('search', search);
    } else {
      searchParams.delete('search');
    }
    setSearchParams(searchParams);
  };

  const handleCategorySelect = (slug) => {
    if (slug) {
      searchParams.set('category', slug);
    } else {
      searchParams.delete('category');
    }
    searchParams.delete('search'); // Clear search when changing category
    setSearchParams(searchParams);
  };

  const handleAddToCart = (e, product) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product, 1);
    toast.success(`${product.name} agregado al carrito`);
  };

  const sortedProducts = [...products].sort((a, b) => {
    if (sortBy === 'price_asc') return Number(a.price) - Number(b.price);
    if (sortBy === 'price_desc') return Number(b.price) - Number(a.price);
    if (sortBy === 'name_asc') return a.name.localeCompare(b.name);
    if (sortBy === 'name_desc') return b.name.localeCompare(a.name);
    return 0;
  });

  return (
    <div className="container" style={{ padding: '3rem 1.5rem' }}>
      <div className="grid" style={{ gridTemplateColumns: '250px 1fr', gap: '2rem' }}>

        {/* Sidebar - Filters */}
        <aside>
          <div className="glass-panel" style={{ padding: '1.5rem', position: 'sticky', top: '100px' }}>
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
              <Filter size={20} /> Filtros
            </h3>

            <div style={{ marginBottom: '2rem' }}>
              <h4 style={{ fontSize: '1rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>Categorías</h4>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <li>
                  <button
                    onClick={() => handleCategorySelect('')}
                    style={{
                      background: 'none', border: 'none',
                      color: !categoryFilter ? 'var(--primary-light)' : 'var(--text-main)',
                      fontWeight: !categoryFilter ? 600 : 400,
                      cursor: 'pointer', textAlign: 'left', width: '100%'
                    }}
                  >
                    Todas las categorías
                  </button>
                </li>
                {categories.map(cat => (
                  <li key={cat.id}>
                    <button
                      onClick={() => handleCategorySelect(cat.slug)}
                      style={{
                        background: 'none', border: 'none',
                        color: categoryFilter === cat.slug ? 'var(--primary-light)' : 'var(--text-main)',
                        fontWeight: categoryFilter === cat.slug ? 600 : 400,
                        cursor: 'pointer', textAlign: 'left', width: '100%'
                      }}
                    >
                      {cat.name}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </aside>

        {/* Main Content - Products Grid */}
        <main>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <h2 style={{ margin: '0 0 0.25rem 0' }}>{categoryFilter ? categories.find(c => c.slug === categoryFilter)?.name : 'Todos los Productos'}</h2>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                {products.length} {products.length === 1 ? 'producto disponible' : 'productos disponibles'}
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', backgroundColor: 'var(--bg-secondary)', padding: '0.2rem 0.5rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                <ArrowUpDown size={15} style={{ color: 'var(--text-muted)' }} />
                <select 
                  value={sortBy} 
                  onChange={e => setSortBy(e.target.value)}
                  style={{ 
                    background: 'none', 
                    border: 'none', 
                    color: 'var(--text-main)', 
                    fontSize: '0.85rem', 
                    cursor: 'pointer',
                    padding: '0.35rem 0.5rem',
                    outline: 'none',
                    fontFamily: 'inherit'
                  }}
                >
                  <option value="featured" style={{ background: '#1E293B' }}>Destacados</option>
                  <option value="price_asc" style={{ background: '#1E293B' }}>Precio: Menor a Mayor</option>
                  <option value="price_desc" style={{ background: '#1E293B' }}>Precio: Mayor a Menor</option>
                  <option value="name_asc" style={{ background: '#1E293B' }}>Nombre: A - Z</option>
                  <option value="name_desc" style={{ background: '#1E293B' }}>Nombre: Z - A</option>
                </select>
              </div>

              <form onSubmit={handleSearch} style={{ display: 'flex', gap: '0.5rem' }}>
                <div style={{ position: 'relative' }}>
                  <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                  <input
                    type="text"
                    name="search"
                    className="form-input"
                    placeholder="Buscar productos..."
                    defaultValue={searchQuery}
                    style={{ paddingLeft: '2.5rem', width: '220px' }}
                  />
                </div>
                <button type="submit" className="btn btn-primary" style={{ padding: '0.5rem 1rem' }}>Buscar</button>
              </form>
            </div>
          </div>

          {loading ? (
            <div className="grid grid-cols-3">
              {[1, 2, 3, 4, 5, 6].map(n => (
                <div key={n} className="skeleton" style={{ height: '380px' }}></div>
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="glass-panel" style={{ padding: '4rem', textAlign: 'center' }}>
              <p style={{ fontSize: '1.25rem', color: 'var(--text-muted)' }}>No se encontraron productos.</p>
              {(categoryFilter || searchQuery) && (
                <button
                  className="btn btn-outline"
                  style={{ marginTop: '1rem' }}
                  onClick={() => setSearchParams({})}
                >
                  Limpiar filtros
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-3">
              {sortedProducts.map(product => (
                <Link to={`/product/${product.id}`} key={product.id} className="glass-panel" style={{
                  display: 'flex', flexDirection: 'column', overflow: 'hidden', transition: 'transform 0.3s'
                }}>
                  <div style={{ height: '220px', backgroundColor: 'transparent', padding: '2rem', position: 'relative' }}>
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
                        padding: '0.5rem 1.5rem', borderRadius: '2rem',
                        fontSize: '1.25rem', fontWeight: 700, letterSpacing: '0.05em'
                      }}>
                        Pausado
                      </div>
                    ) : product.stock <= 0 ? (
                      <div style={{
                        position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
                        background: 'rgba(220, 38, 38, 0.9)', color: 'white',
                        padding: '0.5rem 1.5rem', borderRadius: '2rem',
                        fontSize: '1.25rem', fontWeight: 700, letterSpacing: '0.05em'
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
                      <p style={{ color: 'var(--warning)', fontSize: '0.875rem', fontWeight: 600, margin: '0 0 1rem 0' }}>
                        Producto no disponible
                      </p>
                    )}
                    {product.approval_status !== 'paused' && product.stock <= 0 && (
                      <p style={{ color: 'var(--danger)', fontSize: '0.875rem', fontWeight: 600, margin: '0 0 1rem 0' }}>
                        Producto sin stock
                      </p>
                    )}

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto' }}>
                      <span style={{ fontSize: '1.25rem', fontWeight: 700 }}>${Number(product.price).toLocaleString()}</span>

                      {/* Cart Button only if available */}
                      {product.approval_status !== 'paused' && product.stock > 0 && (
                        <button
                          onClick={(e) => handleAddToCart(e, product)}
                          className="btn"
                          style={{
                            padding: '0.5rem',
                            backgroundColor: 'var(--bg-secondary)',
                            color: 'var(--primary-light)',
                            borderRadius: '50%'
                          }}
                          title="Agregar al carrito"
                        >
                          <ShoppingCart size={20} />
                        </button>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default Catalog;
