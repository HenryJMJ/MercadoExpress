import { createContext, useContext, useState, useEffect } from 'react';
import { apiFetch } from '../api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('admin_token');
      if (token) {
        try {
          const userData = await apiFetch('/auth/me');
          setUser(userData);
        } catch (err) {
          localStorage.removeItem('admin_token');
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
    localStorage.setItem('admin_token', data.token);
    setUser(data.user);
    return data.user;
  };

  const register = async (userData) => {
    const data = await apiFetch('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData)
    });
    localStorage.setItem('admin_token', data.token);
    setUser(data.user);
    return data.user;
  };

  const logout = async () => {
    try {
      await apiFetch('/auth/logout', { method: 'POST' });
    } catch (err) {
      console.error(err);
    } finally {
      localStorage.removeItem('admin_token');
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
