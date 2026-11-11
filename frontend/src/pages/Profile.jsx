import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { apiFetch } from '../api';
import toast from 'react-hot-toast';
import { 
  User, Mail, Phone, Shield, Calendar, MapPin, 
  Save, ArrowLeft, Settings, ShoppingBag, CheckCircle2, 
  Store, Award, Clock
} from 'lucide-react';

const Profile = () => {
  const { user, loading, updateUser } = useAuth();
  const navigate = useNavigate();

  // Form states
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);

  // Default shipping address preferences
  const [defaultDepartment, setDefaultDepartment] = useState('');
  const [defaultCity, setDefaultCity] = useState('');
  const [defaultAddress, setDefaultAddress] = useState('');
  const [savingAddress, setSavingAddress] = useState(false);

  // User statistics
  const [orderCount, setOrderCount] = useState(0);

  const departments = [
    'Amazonas', 'Antioquia', 'Arauca', 'Atlántico', 'Bolívar', 'Boyacá', 'Caldas', 'Caquetá', 'Casanare', 'Cauca', 'Cesar', 'Chocó', 'Córdoba', 'Cundinamarca', 'Guainía', 'Guaviare', 'Huila', 'La Guajira', 'Magdalena', 'Meta', 'Nariño', 'Norte de Santander', 'Putumayo', 'Quindío', 'Risaralda', 'San Andrés y Providencia', 'Santander', 'Sucre', 'Tolima', 'Valle del Cauca', 'Vaupés', 'Vichada', 'Bogotá D.C.'
  ];

  useEffect(() => {
    if (!loading && !user) {
      navigate('/login?redirect=/profile');
      return;
    }

    if (user) {
      setFullName(user.full_name || '');
      setPhone(user.phone || '');

      // Load saved shipping preferences from localStorage
      const savedPrefs = localStorage.getItem(`shipping_prefs_${user.id}`);
      if (savedPrefs) {
        try {
          const parsed = JSON.parse(savedPrefs);
          setDefaultDepartment(parsed.department || '');
          setDefaultCity(parsed.city || '');
          setDefaultAddress(parsed.address || '');
        } catch {
          // ignore error
        }
      }

      // Fetch user order count
      const fetchOrders = async () => {
        try {
          const orders = await apiFetch(`/orders?user_id=${user.id}`);
          if (Array.isArray(orders)) {
            setOrderCount(orders.length);
          }
        } catch (err) {
          console.error(err);
        }
      };
      fetchOrders();
    }
  }, [user, loading, navigate]);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    if (!fullName.trim()) {
      return toast.error('El nombre completo es obligatorio');
    }

    setSavingProfile(true);
    try {
      const res = await apiFetch('/auth/profile', {
        method: 'PUT',
        body: JSON.stringify({
          full_name: fullName.trim(),
          phone: phone.trim()
        })
      });

      updateUser(res.user);
      toast.success('¡Perfil actualizado exitosamente!');
    } catch (err) {
      toast.error(err.message || 'Error al actualizar el perfil');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleSaveDefaultAddress = (e) => {
    e.preventDefault();
    if (!user) return;
    setSavingAddress(true);
    try {
      const addressData = {
        department: defaultDepartment,
        city: defaultCity,
        address: defaultAddress
      };
      localStorage.setItem(`shipping_prefs_${user.id}`, JSON.stringify(addressData));
      toast.success('¡Dirección de entrega predeterminada guardada!');
    } catch {
      toast.error('Error al guardar la dirección');
    } finally {
      setSavingAddress(false);
    }
  };

  const getRoleName = (roleId) => {
    switch (roleId) {
      case 1: return 'Cliente Comprador';
      case 2: return 'Operador Logístico';
      case 3: return 'Vendedor / Emprendedor';
      case 4: return 'Contador';
      case 5: return 'Administrador';
      default: return 'Usuario Registrado';
    }
  };

  if (loading || !user) return null;

  return (
    <div className="container animate-fade-in" style={{ padding: '3rem 1.5rem', maxWidth: '960px' }}>
      
      {/* Top Breadcrumb */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <Link to="/panel" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)' }}>
          <ArrowLeft size={18} /> Volver al Panel
        </Link>
        <Link to="/settings" className="btn btn-outline" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', padding: '0.4rem 0.9rem' }}>
          <Settings size={16} /> Configuración de Cuenta
        </Link>
      </div>

      {/* User Hero Banner */}
      <div className="glass-panel" style={{ padding: '2rem 2.5rem', marginBottom: '2rem', position: 'relative', overflow: 'hidden' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '2rem', flexWrap: 'wrap' }}>
          
          {/* Avatar */}
          <div style={{
            width: '90px',
            height: '90px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, var(--primary-color), var(--primary-light))',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '2.5rem',
            fontWeight: 800,
            color: 'white',
            boxShadow: 'var(--shadow-glow)',
            flexShrink: 0
          }}>
            {user.full_name?.charAt(0)?.toUpperCase() || 'U'}
          </div>

          {/* Details */}
          <div style={{ flex: 1, minWidth: '240px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.35rem', flexWrap: 'wrap' }}>
              <h1 style={{ fontSize: '1.85rem', margin: 0 }}>{user.full_name}</h1>
              <span style={{
                background: 'rgba(13, 148, 136, 0.15)',
                color: 'var(--primary-light)',
                border: '1px solid var(--primary-color)',
                padding: '0.2rem 0.75rem',
                borderRadius: '1rem',
                fontSize: '0.75rem',
                fontWeight: 600,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem'
              }}>
                <Award size={13} /> {getRoleName(user.role_id)}
              </span>
            </div>

            <p style={{ color: 'var(--text-muted)', margin: '0 0 1rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.95rem' }}>
              <Mail size={16} /> {user.email} • <span style={{ color: 'var(--success)', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}><CheckCircle2 size={14} /> Cuenta Activa</span>
            </p>

            <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Calendar size={15} /> Miembro desde {new Date(user.created_at || Date.now()).getFullYear()}
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <ShoppingBag size={15} /> <strong>{orderCount}</strong> pedidos realizados
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Phone size={15} /> {user.phone || 'Teléfono no registrado'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Form & Preferences */}
      <div className="grid grid-cols-2" style={{ gap: '2rem', marginBottom: '2rem' }}>
        
        {/* Edit Personal Information */}
        <div className="glass-panel" style={{ padding: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
            <User size={22} className="text-gradient" />
            <h2 style={{ fontSize: '1.25rem', margin: 0 }}>Información Personal</h2>
          </div>

          <form onSubmit={handleUpdateProfile} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Nombre Completo</label>
              <input 
                type="text" 
                className="form-input" 
                value={fullName}
                onChange={e => setFullName(e.target.value)}
                placeholder="Tu nombre completo"
                required
              />
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Teléfono / Celular de Contacto</label>
              <input 
                type="tel" 
                className="form-input" 
                value={phone}
                onChange={e => setPhone(e.target.value)}
                placeholder="Ej: +57 300 123 4567"
              />
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Correo Electrónico (Registrado)</label>
              <input 
                type="email" 
                className="form-input" 
                value={user.email} 
                readOnly
                disabled
                style={{ opacity: 0.7, cursor: 'not-allowed', backgroundColor: 'rgba(0,0,0,0.2)' }}
              />
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.35rem', display: 'block' }}>
                El correo está vinculado a tu cuenta para autenticación y facturación.
              </span>
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Rol en MercadoExpress</label>
              <input 
                type="text" 
                className="form-input" 
                value={getRoleName(user.role_id)} 
                readOnly
                disabled
                style={{ opacity: 0.7, cursor: 'not-allowed', backgroundColor: 'rgba(0,0,0,0.2)' }}
              />
            </div>

            <button 
              type="submit" 
              className="btn btn-primary" 
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginTop: '0.5rem' }}
              disabled={savingProfile}
            >
              <Save size={18} /> {savingProfile ? 'Guardando...' : 'Guardar Cambios de Perfil'}
            </button>
          </form>
        </div>

        {/* Shipping Address Defaults */}
        <div className="glass-panel" style={{ padding: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
            <MapPin size={22} className="text-gradient" />
            <h2 style={{ fontSize: '1.25rem', margin: 0 }}>Dirección de Entrega Frecuente</h2>
          </div>

          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '1.25rem' }}>
            Configura tu dirección habitual para que tus pedidos se autocompleten rápidamente durante el pago.
          </p>

          <form onSubmit={handleSaveDefaultAddress} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Departamento Predeterminado</label>
              <select 
                className="form-input"
                value={defaultDepartment}
                onChange={e => setDefaultDepartment(e.target.value)}
              >
                <option value="">Selecciona un departamento</option>
                {departments.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Ciudad / Municipio</label>
              <input 
                type="text"
                className="form-input"
                placeholder="Ej: Montería"
                value={defaultCity}
                onChange={e => setDefaultCity(e.target.value)}
              />
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Dirección (Calle, número, barrio, apto)</label>
              <textarea 
                className="form-input"
                rows="2"
                placeholder="Ej: Calle 20 # 10-15 B. La Castellana"
                value={defaultAddress}
                onChange={e => setDefaultAddress(e.target.value)}
              ></textarea>
            </div>

            <button 
              type="submit" 
              className="btn btn-outline" 
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginTop: '0.5rem' }}
              disabled={savingAddress}
            >
              <Save size={18} /> {savingAddress ? 'Guardando...' : 'Guardar Dirección Habitual'}
            </button>
          </form>
        </div>

      </div>

      {/* Quick Access Footer Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.25rem' }}>
        <Link to="/orders" className="glass-panel" style={{ padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '1rem', textDecoration: 'none' }}>
          <div style={{ width: '42px', height: '42px', borderRadius: 'var(--radius-md)', background: 'rgba(13,148,136,0.1)', color: 'var(--primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <ShoppingBag size={20} />
          </div>
          <div>
            <div style={{ fontWeight: 600, color: 'var(--text-main)', fontSize: '0.95rem' }}>Mis Pedidos</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{orderCount} compras realizadas</div>
          </div>
        </Link>

        <Link to="/sell" className="glass-panel" style={{ padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '1rem', textDecoration: 'none' }}>
          <div style={{ width: '42px', height: '42px', borderRadius: 'var(--radius-md)', background: 'rgba(16,185,129,0.1)', color: 'var(--success)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Store size={20} />
          </div>
          <div>
            <div style={{ fontWeight: 600, color: 'var(--text-main)', fontSize: '0.95rem' }}>Vender Productos</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Publicar en MercadoExpress</div>
          </div>
        </Link>

        <Link to="/settings" className="glass-panel" style={{ padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '1rem', textDecoration: 'none' }}>
          <div style={{ width: '42px', height: '42px', borderRadius: 'var(--radius-md)', background: 'rgba(245,158,11,0.1)', color: 'var(--accent-color)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Settings size={20} />
          </div>
          <div>
            <div style={{ fontWeight: 600, color: 'var(--text-main)', fontSize: '0.95rem' }}>Configuración</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Seguridad y contraseñas</div>
          </div>
        </Link>
      </div>

    </div>
  );
};

export default Profile;

