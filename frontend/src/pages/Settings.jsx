import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { apiFetch } from '../api';
import toast from 'react-hot-toast';
import { 
  Settings as SettingsIcon, Lock, Bell, Globe, Shield, 
  ArrowLeft, KeyRound, Download, LogOut, CheckCircle2, 
  AlertTriangle, RefreshCw, Smartphone
} from 'lucide-react';

const Settings = () => {
  const { user, loading, logout } = useAuth();
  const navigate = useNavigate();

  // Active Tab: 'security' | 'notifications' | 'regional' | 'privacy'
  const [activeTab, setActiveTab] = useState('security');

  // Change Password Form
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [changingPassword, setChangingPassword] = useState(false);

  // Notification Preferences (Persisted in localStorage)
  const [notifyOrders, setNotifyOrders] = useState(true);
  const [notifyInvoices, setNotifyInvoices] = useState(true);
  const [notifyPromos, setNotifyPromos] = useState(false);
  const [notifyStock, setNotifyStock] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      navigate('/login?redirect=/settings');
      return;
    }

    if (user) {
      const savedNotifs = localStorage.getItem(`notif_prefs_${user.id}`);
      if (savedNotifs) {
        try {
          const parsed = JSON.parse(savedNotifs);
          if (parsed.notifyOrders !== undefined) setNotifyOrders(parsed.notifyOrders);
          if (parsed.notifyInvoices !== undefined) setNotifyInvoices(parsed.notifyInvoices);
          if (parsed.notifyPromos !== undefined) setNotifyPromos(parsed.notifyPromos);
          if (parsed.notifyStock !== undefined) setNotifyStock(parsed.notifyStock);
        } catch {
          // ignore
        }
      }
    }
  }, [user, loading, navigate]);

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (!currentPassword || !newPassword || !confirmPassword) {
      return toast.error('Todos los campos son requeridos');
    }

    if (newPassword.length < 6) {
      return toast.error('La nueva contraseña debe tener al menos 6 caracteres');
    }

    if (newPassword !== confirmPassword) {
      return toast.error('La confirmación de la contraseña no coincide');
    }

    setChangingPassword(true);
    try {
      await apiFetch('/auth/change-password', {
        method: 'PUT',
        body: JSON.stringify({
          current_password: currentPassword,
          new_password: newPassword
        })
      });

      toast.success('¡Contraseña actualizada exitosamente!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      toast.error(err.message || 'Error al cambiar la contraseña');
    } finally {
      setChangingPassword(false);
    }
  };

  const handleSaveNotifications = (e) => {
    e.preventDefault();
    if (!user) return;
    try {
      const prefs = { notifyOrders, notifyInvoices, notifyPromos, notifyStock };
      localStorage.setItem(`notif_prefs_${user.id}`, JSON.stringify(prefs));
      toast.success('Preferencias de notificaciones guardadas');
    } catch {
      toast.error('Error al guardar preferencias');
    }
  };

  const handleDownloadUserData = () => {
    if (!user) return;
    try {
      const dataToExport = {
        plataforma: 'MercadoExpress Colombia',
        fecha_exportacion: new Date().toISOString(),
        usuario: {
          id: user.id,
          nombre_completo: user.full_name,
          email: user.email,
          telefono: user.phone || 'No registrado',
          rol_id: user.role_id,
          fecha_creacion: user.created_at
        },
        preferencias: {
          notificaciones: {
            pedidos: notifyOrders,
            facturas: notifyInvoices,
            promociones: notifyPromos,
            stock: notifyStock
          }
        }
      };

      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(dataToExport, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute("href", dataStr);
      downloadAnchor.setAttribute("download", `mercadoexpress_datos_${user.email}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();

      toast.success('¡Tus datos han sido descargados en formato JSON!');
    } catch (err) {
      toast.error('Error al exportar datos');
    }
  };

  if (loading || !user) return null;

  return (
    <div className="container animate-fade-in" style={{ padding: '3rem 1.5rem', maxWidth: '960px' }}>
      
      {/* Top Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <Link to="/panel" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)' }}>
          <ArrowLeft size={18} /> Volver al Panel
        </Link>
        <Link to="/profile" className="btn btn-outline" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', padding: '0.4rem 0.9rem' }}>
          Ver Mi Perfil
        </Link>
      </div>

      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', margin: '0 0 0.5rem 0', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <SettingsIcon size={28} className="text-gradient" /> Configuración
        </h1>
        <p style={{ color: 'var(--text-muted)', margin: 0 }}>
          Administra la seguridad, credenciales de acceso, notificaciones y datos de tu cuenta.
        </p>
      </div>

      {/* Settings Navigation Tabs */}
      <div style={{
        display: 'flex',
        gap: '0.5rem',
        borderBottom: '1px solid var(--border-color)',
        marginBottom: '2rem',
        overflowX: 'auto',
        paddingBottom: '0.5rem'
      }}>
        <button
          onClick={() => setActiveTab('security')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.65rem 1.25rem',
            borderRadius: 'var(--radius-md)',
            background: activeTab === 'security' ? 'var(--primary-color)' : 'transparent',
            color: activeTab === 'security' ? 'white' : 'var(--text-muted)',
            border: 'none',
            cursor: 'pointer',
            fontWeight: 600,
            fontSize: '0.9rem',
            transition: 'all 0.2s ease'
          }}
        >
          <Lock size={16} /> Seguridad y Contraseña
        </button>

        <button
          onClick={() => setActiveTab('notifications')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.65rem 1.25rem',
            borderRadius: 'var(--radius-md)',
            background: activeTab === 'notifications' ? 'var(--primary-color)' : 'transparent',
            color: activeTab === 'notifications' ? 'white' : 'var(--text-muted)',
            border: 'none',
            cursor: 'pointer',
            fontWeight: 600,
            fontSize: '0.9rem',
            transition: 'all 0.2s ease'
          }}
        >
          <Bell size={16} /> Notificaciones
        </button>

        <button
          onClick={() => setActiveTab('regional')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.65rem 1.25rem',
            borderRadius: 'var(--radius-md)',
            background: activeTab === 'regional' ? 'var(--primary-color)' : 'transparent',
            color: activeTab === 'regional' ? 'white' : 'var(--text-muted)',
            border: 'none',
            cursor: 'pointer',
            fontWeight: 600,
            fontSize: '0.9rem',
            transition: 'all 0.2s ease'
          }}
        >
          <Globe size={16} /> Región e Idioma
        </button>

        <button
          onClick={() => setActiveTab('privacy')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.65rem 1.25rem',
            borderRadius: 'var(--radius-md)',
            background: activeTab === 'privacy' ? 'var(--primary-color)' : 'transparent',
            color: activeTab === 'privacy' ? 'white' : 'var(--text-muted)',
            border: 'none',
            cursor: 'pointer',
            fontWeight: 600,
            fontSize: '0.9rem',
            transition: 'all 0.2s ease'
          }}
        >
          <Shield size={16} /> Privacidad y Cuenta
        </button>
      </div>

      {/* TAB 1: SEGURIDAD Y CONTRASEÑA */}
      {activeTab === 'security' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          
          {/* Change Password Card */}
          <div className="glass-panel" style={{ padding: '2rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
              <KeyRound size={22} className="text-gradient" />
              <div>
                <h2 style={{ fontSize: '1.25rem', margin: 0 }}>Cambiar Contraseña</h2>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', margin: '0.2rem 0 0 0' }}>
                  Elige una contraseña segura de al menos 6 caracteres para proteger tu cuenta.
                </p>
              </div>
            </div>

            <form onSubmit={handleChangePassword} style={{ maxWidth: '500px', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Contraseña Actual</label>
                <input 
                  type="password"
                  className="form-input"
                  placeholder="Ingresa tu contraseña actual"
                  value={currentPassword}
                  onChange={e => setCurrentPassword(e.target.value)}
                  required
                />
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Nueva Contraseña</label>
                <input 
                  type="password"
                  className="form-input"
                  placeholder="Mínimo 6 caracteres"
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  required
                />
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Confirmar Nueva Contraseña</label>
                <input 
                  type="password"
                  className="form-input"
                  placeholder="Repite la nueva contraseña"
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  required
                />
              </div>

              <button 
                type="submit" 
                className="btn btn-primary" 
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', width: 'fit-content' }}
                disabled={changingPassword}
              >
                <Lock size={16} /> {changingPassword ? 'Actualizando...' : 'Actualizar Contraseña'}
              </button>
            </form>
          </div>

          {/* Active Session Info */}
          <div className="glass-panel" style={{ padding: '2rem' }}>
            <h3 style={{ fontSize: '1.15rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Smartphone size={20} className="text-gradient" /> Sesión Activa
            </h3>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', backgroundColor: 'rgba(30, 41, 59, 0.4)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <div style={{ fontWeight: 600, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <CheckCircle2 size={16} style={{ color: 'var(--success)' }} /> Navegador Actual ({navigator.userAgent.includes('Chrome') ? 'Google Chrome' : 'Navegador Web'})
                </div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                  Autenticación segura con JWT (Expiración automática en 24 horas)
                </div>
              </div>

              <button 
                onClick={logout} 
                className="btn btn-outline" 
                style={{ color: 'var(--danger)', borderColor: 'rgba(239, 68, 68, 0.3)', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem' }}
              >
                <LogOut size={16} /> Cerrar Sesión
              </button>
            </div>
          </div>

        </div>
      )}

      {/* TAB 2: NOTIFICACIONES */}
      {activeTab === 'notifications' && (
        <div className="glass-panel" style={{ padding: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
            <Bell size={22} className="text-gradient" />
            <div>
              <h2 style={{ fontSize: '1.25rem', margin: 0 }}>Preferencias de Notificaciones</h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', margin: '0.2rem 0 0 0' }}>
                Controla qué avisos deseas recibir en tu correo electrónico ({user.email}).
              </p>
            </div>
          </div>

          <form onSubmit={handleSaveNotifications} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <label style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem', padding: '1.25rem', backgroundColor: 'rgba(30,41,59,0.3)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', cursor: 'pointer' }}>
              <input 
                type="checkbox" 
                checked={notifyOrders} 
                onChange={e => setNotifyOrders(e.target.checked)}
                style={{ marginTop: '0.25rem', width: '18px', height: '18px', accentColor: 'var(--primary-color)' }}
              />
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, color: 'var(--text-main)', fontSize: '0.95rem' }}>Estado de Pedidos y Envíos</div>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                  Recibir actualizaciones cuando tu pedido sea pagado, despachado o entregado.
                </div>
              </div>
            </label>

            <label style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem', padding: '1.25rem', backgroundColor: 'rgba(30,41,59,0.3)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', cursor: 'pointer' }}>
              <input 
                type="checkbox" 
                checked={notifyInvoices} 
                onChange={e => setNotifyInvoices(e.target.checked)}
                style={{ marginTop: '0.25rem', width: '18px', height: '18px', accentColor: 'var(--primary-color)' }}
              />
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, color: 'var(--text-main)', fontSize: '0.95rem' }}>Facturación Electrónica Automática</div>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                  Copia de cada factura electrónica con IVA 19% emitida tras cada compra.
                </div>
              </div>
            </label>

            <label style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem', padding: '1.25rem', backgroundColor: 'rgba(30,41,59,0.3)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', cursor: 'pointer' }}>
              <input 
                type="checkbox" 
                checked={notifyStock} 
                onChange={e => setNotifyStock(e.target.checked)}
                style={{ marginTop: '0.25rem', width: '18px', height: '18px', accentColor: 'var(--primary-color)' }}
              />
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, color: 'var(--text-main)', fontSize: '0.95rem' }}>Alertas de Disponibilidad de Inventario</div>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                  Avisos cuando productos que consultaste vuelvan a estar en stock.
                </div>
              </div>
            </label>

            <label style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem', padding: '1.25rem', backgroundColor: 'rgba(30,41,59,0.3)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', cursor: 'pointer' }}>
              <input 
                type="checkbox" 
                checked={notifyPromos} 
                onChange={e => setNotifyPromos(e.target.checked)}
                style={{ marginTop: '0.25rem', width: '18px', height: '18px', accentColor: 'var(--primary-color)' }}
              />
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, color: 'var(--text-main)', fontSize: '0.95rem' }}>Ofertas Especiales y Cupones</div>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                  Campañas promocionales, descuentos y envíos gratis de vendedores colombianos.
                </div>
              </div>
            </label>

            <button type="submit" className="btn btn-primary" style={{ width: 'fit-content', marginTop: '0.5rem' }}>
              Guardar Preferencias de Notificaciones
            </button>
          </form>
        </div>
      )}

      {/* TAB 3: REGIONAL E IDIOMA */}
      {activeTab === 'regional' && (
        <div className="glass-panel" style={{ padding: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
            <Globe size={22} className="text-gradient" />
            <div>
              <h2 style={{ fontSize: '1.25rem', margin: 0 }}>Región, Moneda e Impuestos</h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', margin: '0.2rem 0 0 0' }}>
                Parámetros geográficos y tributarios predeterminados para la tienda.
              </p>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.25rem' }}>
            <div style={{ padding: '1.25rem', backgroundColor: 'rgba(30,41,59,0.3)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem', textTransform: 'uppercase', marginBottom: '0.25rem' }}>País y Mercado</div>
              <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-main)' }}>🇨🇴 Colombia</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--primary-light)', marginTop: '0.25rem' }}>Cobertura nacional en los 32 departamentos</div>
            </div>

            <div style={{ padding: '1.25rem', backgroundColor: 'rgba(30,41,59,0.3)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem', textTransform: 'uppercase', marginBottom: '0.25rem' }}>Moneda Oficial</div>
              <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--accent-color)' }}>COP ($ Pesos Colombianos)</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>Todos los precios se liquidan en COP</div>
            </div>

            <div style={{ padding: '1.25rem', backgroundColor: 'rgba(30,41,59,0.3)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem', textTransform: 'uppercase', marginBottom: '0.25rem' }}>Tarifa de IVA Aplicable</div>
              <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-main)' }}>19% (Régimen Común DIAN)</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>Incluido y discriminado en cada factura</div>
            </div>

            <div style={{ padding: '1.25rem', backgroundColor: 'rgba(30,41,59,0.3)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem', textTransform: 'uppercase', marginBottom: '0.25rem' }}>Zona Horaria</div>
              <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-main)' }}>Bogotá / Montería (UTC -5)</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>Registro de eventos de compras y tracking</div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: PRIVACIDAD Y DATOS */}
      {activeTab === 'privacy' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          
          {/* Download Data */}
          <div className="glass-panel" style={{ padding: '2rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
              <Download size={22} className="text-gradient" />
              <div>
                <h2 style={{ fontSize: '1.25rem', margin: 0 }}>Descargar Mis Datos Personales</h2>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', margin: '0.2rem 0 0 0' }}>
                  De acuerdo a la Ley 1581 de Protección de Datos Personales (Habeas Data en Colombia), puedes solicitar una copia completa de tu información registrada.
                </p>
              </div>
            </div>

            <button 
              onClick={handleDownloadUserData} 
              className="btn btn-primary"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.5rem' }}
            >
              <Download size={16} /> Descargar Archivo de Datos (JSON)
            </button>
          </div>

          {/* Danger Zone */}
          <div className="glass-panel" style={{ padding: '2rem', border: '1px solid rgba(239, 68, 68, 0.3)', backgroundColor: 'rgba(239, 68, 68, 0.03)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
              <AlertTriangle size={22} style={{ color: 'var(--danger)' }} />
              <div>
                <h3 style={{ fontSize: '1.15rem', margin: 0, color: 'var(--danger)' }}>Zona de Cuenta</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', margin: '0.2rem 0 0 0' }}>
                  Acciones definitivas sobre tu cuenta de MercadoExpress.
                </p>
              </div>
            </div>

            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
              Si deseas desactivar temporalmente tu cuenta o revocar tus accesos, puedes cerrar sesión inmediatamente o ponerte en contacto con soporte técnico a soporte@mercadoexpress.com.
            </p>

            <button 
              onClick={logout} 
              className="btn btn-outline"
              style={{ color: 'var(--danger)', borderColor: 'var(--danger)', display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
            >
              <LogOut size={16} /> Cerrar Sesión en este Dispositivo
            </button>
          </div>

        </div>
      )}

    </div>
  );
};

export default Settings;

