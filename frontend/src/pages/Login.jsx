import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Package, Lock, Mail, User as UserIcon } from 'lucide-react';
import toast from 'react-hot-toast';

const Login = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const { login, register } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    full_name: '',
    phone: ''
  });

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      if (isLogin) {
        await login(formData.email, formData.password);
        toast.success('Sesión iniciada con éxito');
      } else {
        await register(formData);
        toast.success('Cuenta creada con éxito');
      }
      
      const redirect = searchParams.get('redirect') || '/';
      navigate(redirect);
    } catch (err) {
      toast.error(err.message || 'Error en la autenticación');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container" style={{ padding: '6rem 1.5rem', display: 'flex', justifyContent: 'center' }}>
      <div className="glass-panel animate-fade-in" style={{ padding: '3rem', width: '100%', maxWidth: '450px' }}>
        
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <Package className="text-gradient" size={48} style={{ margin: '0 auto 1rem auto' }} />
          <h2>{isLogin ? 'Bienvenido de nuevo' : 'Crea tu cuenta'}</h2>
          <p style={{ color: 'var(--text-muted)' }}>
            {isLogin ? 'Ingresa tus credenciales para continuar' : 'Únete a la mejor experiencia de compra'}
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          {!isLogin && (
            <>
              <div className="form-group">
                <label className="form-label">Nombre Completo</label>
                <div style={{ position: 'relative' }}>
                  <UserIcon size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                  <input type="text" name="full_name" className="form-input" style={{ paddingLeft: '2.5rem' }} required value={formData.full_name} onChange={handleChange} />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Teléfono</label>
                <input type="tel" name="phone" className="form-input" required value={formData.phone} onChange={handleChange} />
              </div>
            </>
          )}

          <div className="form-group">
            <label className="form-label">Correo Electrónico</label>
            <div style={{ position: 'relative' }}>
              <Mail size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input type="email" name="email" className="form-input" style={{ paddingLeft: '2.5rem' }} required value={formData.email} onChange={handleChange} />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Contraseña</label>
            <div style={{ position: 'relative' }}>
              <Lock size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input type="password" name="password" className="form-input" style={{ paddingLeft: '2.5rem' }} required value={formData.password} onChange={handleChange} />
            </div>
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1rem' }} disabled={loading}>
            {loading ? 'Procesando...' : (isLogin ? 'Iniciar Sesión' : 'Registrarse')}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '2rem', color: 'var(--text-muted)' }}>
          {isLogin ? '¿No tienes cuenta?' : '¿Ya tienes cuenta?'}
          <button 
            onClick={() => setIsLogin(!isLogin)}
            style={{ background: 'none', border: 'none', color: 'var(--primary-light)', fontWeight: 600, marginLeft: '0.5rem', cursor: 'pointer' }}
          >
            {isLogin ? 'Regístrate aquí' : 'Inicia Sesión'}
          </button>
        </div>
        
        {isLogin && (
          <div style={{ marginTop: '2rem', padding: '1rem', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 'var(--radius-md)', fontSize: '0.875rem' }}>
            <p><strong>Demo Admin:</strong> admin@mercado.com / admin123</p>
            <p><strong>Demo Usuario:</strong> user@mercado.com / user123</p>
          </div>
        )}

      </div>
    </div>
  );
};

export default Login;
