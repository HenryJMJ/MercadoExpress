import React, { useState, useEffect } from 'react';
import { apiFetch } from '../../api';
import { Package, Plus, Edit, Trash2, X, Save } from 'lucide-react';
import toast from 'react-hot-toast';

const AdminProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [showAdd, setShowAdd] = useState(false);
  const [filter, setFilter] = useState('Todos');
  const [newProduct, setNewProduct] = useState({ name: '', description: '', price: '', stock: '', category: 'electronica', image_url: '' });

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const data = await apiFetch('/catalog/products');
      setProducts(Array.isArray(data) ? data : (data.products || []));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchProducts(); }, []);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewProduct({ ...newProduct, image_url: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleEditImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setEditForm({ ...editForm, image_url: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAdd = async () => {
    try {
      await apiFetch('/catalog/products', {
        method: 'POST',
        body: JSON.stringify({ ...newProduct, price: parseFloat(newProduct.price), stock: parseInt(newProduct.stock) }),
      });
      toast.success('Producto creado');
      setShowAdd(false);
      setNewProduct({ name: '', description: '', price: '', stock: '', category: 'electronica', image_url: '' });
      fetchProducts();
    } catch (err) {
      toast.error('Error creando producto: ' + err.message);
    }
  };

  const handleEdit = (product) => {
    setEditingId(product.id);
    setEditForm({
      name: product.name,
      price: product.price,
      stock: product.stock,
      description: product.description || '',
      image_url: product.image_url || '',
      category_id: product.category_id || '',
    });
  };

  const handleSave = async (id) => {
    try {
      await apiFetch(`/catalog/products/${id}`, {
        method: 'PUT',
        body: JSON.stringify({ ...editForm, price: parseFloat(editForm.price), stock: parseInt(editForm.stock) }),
      });
      toast.success('Producto actualizado');
      setEditingId(null);
      fetchProducts();
    } catch (err) {
      toast.error('Error actualizando: ' + err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('¿Eliminar este producto?')) return;
    try {
      await apiFetch(`/catalog/products/${id}`, { method: 'DELETE' });
      toast.success('Producto eliminado');
      fetchProducts();
    } catch (err) {
      toast.error('Error eliminando: ' + err.message);
    }
  };

  return (
    <div style={{ padding: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', marginBottom: '0.25rem' }}>Gestión de Productos</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>{products.length} productos en catálogo</p>
        </div>
        <button onClick={() => setShowAdd(!showAdd)} className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1.25rem' }}>
          {showAdd ? <X size={16} /> : <Plus size={16} />}
          {showAdd ? 'Cancelar' : 'Nuevo Producto'}
        </button>
      </div>

      {/* Filter Tabs */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-light)', paddingBottom: '0.5rem' }}>
        {['Todos', 'Publicados', 'Pausados', 'Sin Stock'].map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              padding: '0.5rem 1rem', fontSize: '0.9rem', fontWeight: filter === f ? 600 : 400,
              color: filter === f ? 'var(--primary-light)' : 'var(--text-muted)',
              borderBottom: filter === f ? '2px solid var(--primary-light)' : '2px solid transparent',
              marginBottom: '-0.5rem'
            }}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Add Product Form */}
      {showAdd && (
        <div className="glass-panel" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
          <h3 style={{ marginBottom: '1rem', fontSize: '1rem' }}>Agregar Producto</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
            <input className="form-input" placeholder="Nombre" value={newProduct.name} onChange={e => setNewProduct({ ...newProduct, name: e.target.value })} />
            <input className="form-input" placeholder="Precio" type="number" value={newProduct.price} onChange={e => setNewProduct({ ...newProduct, price: e.target.value })} />
            <input className="form-input" placeholder="Stock" type="number" value={newProduct.stock} onChange={e => setNewProduct({ ...newProduct, stock: e.target.value })} />

            <input className="form-input" placeholder="Descripción" value={newProduct.description} onChange={e => setNewProduct({ ...newProduct, description: e.target.value })} style={{ gridColumn: 'span 3' }} />

            <div style={{ gridColumn: 'span 2', display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <input type="file" accept="image/*" onChange={handleImageChange} className="form-input" style={{ flex: 1 }} />
              {newProduct.image_url && (
                <img src={newProduct.image_url} alt="preview" style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '4px' }} />
              )}
            </div>
            <select className="form-input" value={newProduct.category} onChange={e => setNewProduct({ ...newProduct, category: e.target.value })}>
              <option value="electronica">Electrónica</option>
              <option value="ropa">Ropa</option>
              <option value="hogar">Hogar</option>
            </select>
          </div>
          <button onClick={handleAdd} className="btn btn-primary" style={{ marginTop: '1rem', padding: '0.5rem 1.5rem' }}>
            <Save size={16} /> Guardar Producto
          </button>
        </div>
      )}

      {/* Products Table */}
      <div className="glass-panel" style={{ overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: '2rem' }}>
            {[1, 2, 3, 4].map(n => <div key={n} className="skeleton" style={{ height: '60px', marginBottom: '0.5rem' }}></div>)}
          </div>
        ) : products.length === 0 ? (
          <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            <Package size={48} style={{ opacity: 0.2, margin: '0 auto 1rem' }} />
            <p>No hay productos. Agrega el primero.</p>
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-light)' }}>
                {['Producto', 'Vendedor', 'Categoría', 'Precio', 'Stock', 'Acciones'].map(h => (
                  <th key={h} style={{ padding: '1rem', textAlign: 'left', fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {products.filter(p => {
                if (filter === 'Publicados') return p.approval_status === 'approved';
                if (filter === 'Pausados') return p.approval_status === 'paused';
                if (filter === 'Sin Stock') return p.stock <= 0;
                return true;
              }).map(product => (
                <React.Fragment key={product.id}>
                  <tr style={{ borderBottom: editingId === product.id ? 'none' : '1px solid var(--border-light)' }}>
                    <td style={{ padding: '1rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        {product.image_url ? (
                          <img src={product.image_url} alt={product.name} style={{ width: '40px', height: '40px', borderRadius: '6px', objectFit: 'cover', flexShrink: 0 }} />
                        ) : (
                          <div style={{ width: '40px', height: '40px', borderRadius: '6px', background: 'rgba(13,148,136,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            <Package size={18} style={{ color: 'var(--primary-light)', opacity: 0.6 }} />
                          </div>
                        )}
                        {editingId === product.id ? (
                          <input className="form-input" style={{ padding: '0.4rem', fontSize: '0.85rem' }} value={editForm.name} onChange={e => setEditForm({ ...editForm, name: e.target.value })} />
                        ) : (
                          <div>
                            <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{product.name}</div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                              {product.description ? (product.description.split(' ').length > 3 ? product.description.split(' ').slice(0, 3).join(' ') + '...' : product.description) : ''}
                            </div>
                          </div>
                        )}
                      </div>
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <span style={{ fontWeight: 500, color: 'var(--text-main)', fontSize: '0.85rem' }}>
                        {product.seller_name || 'MercadoExpress'}
                      </span>
                    </td>
                    <td style={{ padding: '1rem' }}>
                      {editingId === product.id ? (
                        <select className="form-input" style={{ padding: '0.4rem', fontSize: '0.85rem' }} value={editForm.category_id} onChange={e => setEditForm({ ...editForm, category_id: e.target.value })}>
                          <option value="1">Electrónica</option>
                          <option value="2">Ropa</option>
                          <option value="3">Hogar</option>
                        </select>
                      ) : (
                        <span style={{
                          padding: '0.2rem 0.6rem', borderRadius: '2rem', fontSize: '0.75rem',
                          background: 'rgba(13,148,136,0.1)', color: 'var(--primary-light)', fontWeight: 500
                        }}>
                          {product.category_name || product.category_id}
                        </span>
                      )}
                    </td>
                    <td style={{ padding: '1rem', fontWeight: 700 }}>
                      {editingId === product.id ? (
                        <input className="form-input" type="number" style={{ padding: '0.4rem', fontSize: '0.85rem', width: '100px' }} value={editForm.price} onChange={e => setEditForm({ ...editForm, price: e.target.value })} />
                      ) : (
                        `$${parseFloat(product.price).toLocaleString()}`
                      )}
                    </td>
                    <td style={{ padding: '1rem' }}>
                      {editingId === product.id ? (
                        <input className="form-input" type="number" style={{ padding: '0.4rem', fontSize: '0.85rem', width: '80px' }} value={editForm.stock} onChange={e => setEditForm({ ...editForm, stock: e.target.value })} />
                      ) : (
                        <span style={{ color: product.stock < 10 ? 'var(--danger)' : 'var(--text-main)' }}>
                          {product.stock}
                        </span>
                      )}
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        {editingId === product.id ? (
                          <>
                            <button onClick={() => handleSave(product.id)} style={{ background: 'none', border: 'none', color: 'var(--success)', cursor: 'pointer' }}><Save size={18} /></button>
                            <button onClick={() => setEditingId(null)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}><X size={18} /></button>
                          </>
                        ) : (
                          <>
                            <button onClick={() => handleEdit(product)} style={{ background: 'none', border: 'none', color: 'var(--primary-light)', cursor: 'pointer' }}><Edit size={18} /></button>
                            <button onClick={() => handleDelete(product.id)} style={{ background: 'none', border: 'none', color: 'var(--danger)', cursor: 'pointer' }}><Trash2 size={18} /></button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                  {/* Expanded edit row for description and image */}
                  {editingId === product.id && (
                    <tr key={`${product.id}-edit`} style={{ borderBottom: '1px solid var(--border-light)', background: 'rgba(13,148,136,0.03)' }}>
                      <td colSpan={6} style={{ padding: '0.75rem 1rem 1rem' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                          <div>
                            <label style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '0.25rem', display: 'block' }}>Descripción</label>
                            <input className="form-input" placeholder="Descripción" value={editForm.description} onChange={e => setEditForm({ ...editForm, description: e.target.value })} style={{ width: '100%', padding: '0.4rem', fontSize: '0.85rem' }} />
                          </div>
                          <div>
                            <label style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '0.25rem', display: 'block' }}>Imagen</label>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                              <input type="file" accept="image/*" onChange={handleEditImageChange} className="form-input" style={{ flex: 1, padding: '0.4rem', fontSize: '0.8rem' }} />
                              {editForm.image_url && (
                                <img src={editForm.image_url} alt="preview" style={{ width: '36px', height: '36px', objectFit: 'cover', borderRadius: '4px' }} />
                              )}
                            </div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default AdminProducts;
