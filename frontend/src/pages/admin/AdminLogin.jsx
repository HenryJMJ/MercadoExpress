import { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Package, Lock, Mail, ShieldAlert } from 'lucide-react';
import toast from 'react-hot-toast';

const AdminLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, user } = useAuth();
  const navigate = useNavigate();

  // If already logged in as admin, redirect to admin dashboard
  if (user && user.role_id === 5) {
    return <Navigate to="/admin" replace />;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await login(email, password);
      // Wait a bit for the user context to update
      setTimeout(() => {
        navigate('/admin');
      }, 100);
    } catch (err) {
      toast.error(err.message || 'Error al iniciar sesión');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'var(--bg-primary)',
      padding: '2rem'
    }}>
      <div className="glass-panel animate-fade-in" style={{
        width: '100%',
        maxWidth: '450px',
        padding: '3rem',
        borderRadius: 'var(--radius-lg)',
        borderTop: '4px solid var(--warning)'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <div style={{ 
            width: '64px', height: '64px', borderRadius: '50%', 
            background: 'rgba(245, 158, 11, 0.1)', color: 'var(--warning)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 1.5rem auto'
          }}>
            <ShieldAlert size={32} />
          </div>
          <h1 style={{ fontSize: '1.75rem', marginBottom: '0.5rem' }}>Portal Admin</h1>
          <p style={{ color: 'var(--text-muted)' }}>Acceso restringido al personal autorizado</p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 500 }}>
              Correo Electrónico
            </label>
            <div style={{ position: 'relative' }}>
              <Mail size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                type="email"
                className="form-input"
                style={{ paddingLeft: '2.75rem' }}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@mercado.com"
                required
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 500 }}>
              Contraseña
            </label>
            <div style={{ position: 'relative' }}>
              <Lock size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                type="password"
                className="form-input"
                style={{ paddingLeft: '2.75rem' }}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
            </div>
          </div>

          <button 
            type="submit" 
            className="btn btn-primary" 
            disabled={loading}
            style={{ 
              marginTop: '1rem', 
              padding: '0.875rem', 
              background: 'linear-gradient(135deg, var(--warning), #D97706)',
              color: 'black',
              border: 'none',
              fontWeight: 700
            }}
          >
            {loading ? 'Verificando credenciales...' : 'Ingresar al Sistema'}
          </button>
        </form>
        
        {/* Helper info for demo */}
        <div style={{ 
          marginTop: '2rem', padding: '1rem', borderRadius: 'var(--radius-sm)', 
          background: 'rgba(255,255,255,0.03)', fontSize: '0.8rem', color: 'var(--text-muted)',
          textAlign: 'center'
        }}>
          <strong>Demo Admin:</strong> admin@mercado.com / admin123
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
