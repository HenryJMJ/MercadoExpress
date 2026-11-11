import { createContext, useContext, useState, useEffect } from 'react';
import { apiFetch } from '../api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const userData = await apiFetch('/auth/me');
          if (userData.role_id === 5) {
            localStorage.removeItem('token');
            setUser(null);
          } else {
            setUser(userData);
          }
        } catch (err) {
          localStorage.removeItem('token');
        }
      }
      setLoading(false);
    };
    checkAuth();
  }, []);

  const login = async (email, password) => {
    const data = await apiFetch('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });
    
    if (data.user.role_id === 5) {
      throw new Error('Las cuentas de administrador deben iniciar sesión en el portal de administración, no en la tienda pública.');
    }
    
    localStorage.setItem('token', data.token);
    setUser(data.user);
    return data.user;
  };

  const register = async (userData) => {
    const data = await apiFetch('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData)
    });
    localStorage.setItem('token', data.token);
    setUser(data.user);
    return data.user;
  };

  const updateUser = (updatedData) => {
    setUser(prev => (prev ? { ...prev, ...updatedData } : updatedData));
  };

  const logout = async () => {
    try {
      await apiFetch('/auth/logout', { method: 'POST' });
    } catch (err) {
      console.error(err);
    } finally {
      localStorage.removeItem('token');
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
