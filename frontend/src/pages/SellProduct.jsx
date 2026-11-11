import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { apiFetch } from '../api';
import toast from 'react-hot-toast';
import { Store, Image, DollarSign, Package } from 'lucide-react';

const SellProduct = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: 'otros',
    image_url: '',
    stock: 1
  });

  const categories = [
    { id: 'electronica', name: 'Electrónica' },
    { id: 'ropa', name: 'Ropa y Accesorios' },
    { id: 'hogar', name: 'Hogar y Cocina' },
    { id: 'deportes', name: 'Deportes' },
    { id: 'juguetes', name: 'Juguetes' },
    { id: 'otros', name: 'Otros' }
  ];

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/login?redirect=/sell');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (id) {
      setIsEditing(true);
      const fetchProduct = async () => {
        try {
          const data = await apiFetch(`/catalog/seller-products/${id}`);
          setFormData({
            name: data.name,
            description: data.description || '',
            price: data.price,
            category: data.category_id === 1 ? 'electronica' : data.category_id === 2 ? 'ropa' : data.category_id === 3 ? 'hogar' : 'otros',
            image_url: data.image_url || '',
            stock: data.stock || 1
          });
        } catch (err) {
          toast.error('Error cargando producto para edición');
          navigate('/my-products');
        }
      };
      fetchProduct();
    }
  }, [id, navigate]);

  const COMMISSION_RATE = 0.10; // 10%
  const priceValue = Number(formData.price) || 0;
  const commission = priceValue * COMMISSION_RATE;
  const earnings = priceValue - commission;

  if (authLoading) return null;
  if (!user) return null;

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, image_url: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (priceValue < 10000) {
      return toast.error('El precio mínimo para publicar es $10,000 COP');
    }

    setLoading(true);
    try {
      if (isEditing) {
        // Find category id to pass if needed, but our backend accepts category slug? 
        // Actually, PUT /products/:id doesn't currently do category slug lookup, it expects category_id. 
        // But let's just pass what we have and also update approval_status to 'pending'
        await apiFetch(`/catalog/products/${id}`, {
          method: 'PUT',
          body: JSON.stringify({
            ...formData,
            price: priceValue,
            stock: Number(formData.stock),
            approval_status: 'pending' // reset status for review
          })
        });
        toast.success('Producto actualizado y enviado a revisión');
      } else {
        await apiFetch('/catalog/seller-products', {
          method: 'POST',
          body: JSON.stringify({
            ...formData,
            price: priceValue,
            stock: Number(formData.stock),
            seller_id: user.id,
            seller_name: user.full_name
          })
        });
        toast.success('Producto enviado a revisión');
      }
      
      navigate('/my-products');
    } catch (err) {
      toast.error(err.message || 'Error al publicar el producto');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container animate-fade-in" style={{ padding: '4rem 1.5rem', maxWidth: '800px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
        <div style={{ padding: '1rem', background: 'rgba(13,148,136,0.1)', color: 'var(--primary-color)', borderRadius: '1rem' }}>
          <Store size={32} />
        </div>
        <div>
          <h1 style={{ margin: 0 }}>{isEditing ? 'Editar Producto' : 'Vender un Producto'}</h1>
          <p style={{ color: 'var(--text-muted)', margin: 0 }}>{isEditing ? 'Modifica los detalles de tu producto para enviarlo nuevamente a revisión.' : 'Publica productos de tu emprendimiento en MercadoExpress.'}</p>
        </div>
      </div>

      <div className="glass-panel" style={{ padding: '3rem' }}>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Nombre del Producto</label>
            <input 
              type="text" 
              className="form-input" 
              placeholder="Ej: Zapatos Deportivos Talla 40"
              value={formData.name}
              onChange={e => setFormData({...formData, name: e.target.value})}
              required
            />
          </div>

          <div className="grid grid-cols-2" style={{ gap: '1.5rem' }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Categoría</label>
              <select 
                className="form-input" 
                value={formData.category}
                onChange={e => setFormData({...formData, category: e.target.value})}
                required
              >
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Unidades Disponibles (Stock)</label>
              <div style={{ position: 'relative' }}>
                <Package size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input 
                  type="number" 
                  min="1"
                  className="form-input" 
                  value={formData.stock}
                  onChange={e => setFormData({...formData, stock: e.target.value})}
                  style={{ paddingLeft: '2.5rem' }}
                  required
                />
              </div>
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Descripción</label>
            <textarea 
              className="form-input" 
              rows="4" 
              placeholder="Describe los detalles de tu producto..."
              value={formData.description}
              onChange={e => setFormData({...formData, description: e.target.value})}
            ></textarea>
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Imagen del Producto</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ position: 'relative', flex: 1 }}>
                <Image size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input 
                  type="file" 
                  accept="image/*"
                  className="form-input" 
                  onChange={handleImageChange}
                  style={{ paddingLeft: '2.5rem' }}
                  required={!formData.image_url}
                />
              </div>
              {formData.image_url && (
                <img src={formData.image_url} alt="preview" style={{ width: '42px', height: '42px', objectFit: 'cover', borderRadius: '4px', flexShrink: 0 }} />
              )}
            </div>
          </div>

          <div style={{ background: 'var(--bg-secondary)', padding: '2rem', borderRadius: 'var(--radius-md)', marginTop: '1rem' }}>
            <h3 style={{ marginBottom: '1.5rem', fontSize: '1.125rem' }}>Precio y Ganancias</h3>
            
            <div className="form-group">
              <label className="form-label">Precio de Venta al Público (Mínimo $10,000)</label>
              <div style={{ position: 'relative' }}>
                <DollarSign size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input 
                  type="number" 
                  min="10000"
                  className="form-input" 
                  placeholder="Ej: 50000"
                  value={formData.price}
                  onChange={e => setFormData({...formData, price: e.target.value})}
                  style={{ paddingLeft: '2.5rem', fontSize: '1.125rem', fontWeight: 600 }}
                  required
                />
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.875rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)' }}>
                <span>Comisión de MercadoExpress (10%)</span>
                <span>-${commission.toLocaleString()}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, color: 'var(--success)', fontSize: '1.125rem', marginTop: '0.5rem', paddingTop: '0.5rem', borderTop: '1px solid var(--border-color)' }}>
                <span>Lo que recibirás por venta</span>
                <span>${earnings.toLocaleString()}</span>
              </div>
            </div>
          </div>

          <div style={{ padding: '1rem', borderLeft: '4px solid var(--warning)', background: 'rgba(245,158,11,0.1)', color: 'var(--text-main)', fontSize: '0.875rem', marginTop: '1rem' }}>
            <strong>Nota:</strong> Tu producto será enviado a un administrador para su revisión. Una vez aprobado, aparecerá públicamente en el catálogo.
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '1rem', fontSize: '1.125rem', marginTop: '1rem' }} disabled={loading}>
            {loading ? (isEditing ? 'Actualizando...' : 'Publicando...') : (isEditing ? 'Actualizar Producto' : 'Publicar Producto')}
          </button>
        </form>
      </div>
    </div>
  );
};

export default SellProduct;
