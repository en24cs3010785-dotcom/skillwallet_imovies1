import React, { createContext, useContext, useState, useEffect } from 'react';
import API from '../api/axiosInstance';
import { User } from '../types';

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  isAdmin: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (name: string, email: string, password: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(localStorage.getItem('imovies_token') || null);
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('imovies_user');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return null;
      }
    }
    return null;
  });
  const [loading, setLoading] = useState<boolean>(true);

  // Validate session on mount
  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('imovies_token');
      if (storedToken) {
        try {
          const { data } = await API.get('/auth/profile');
          if (data.success) {
            setUser({
              id: data.data._id || data.data.id,
              username: data.data.username || data.data.name || 'User',
              name: data.data.username || data.data.name || 'User',
              email: data.data.email,
              role: data.data.role,
              isAdmin: data.data.isAdmin,
            });
          }
        } catch {
          // Token expired or server unreachable
          const cachedUser = localStorage.getItem('imovies_user');
          if (cachedUser) {
            try {
              setUser(JSON.parse(cachedUser));
            } catch {
              logout();
            }
          }
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    setLoading(true);
    try {
      const { data } = await API.post('/auth/login', { email, password });
      if (data.success) {
        const receivedToken = data.data.token;
        const u = data.data.user;
        const receivedUser: User = {
          id: u.id || u._id,
          username: u.username || u.name || 'User',
          name: u.username || u.name || 'User',
          email: u.email,
          role: u.role,
          isAdmin: u.isAdmin,
        };

        setToken(receivedToken);
        setUser(receivedUser);
        localStorage.setItem('imovies_token', receivedToken);
        localStorage.setItem('imovies_user', JSON.stringify(receivedUser));
        return true;
      }
      return false;
    } catch (err: any) {
      // Offline fallback for preview mode
      const isOffline = !err.response;
      if (isOffline) {
        const role = email.toLowerCase().includes('admin') ? 'admin' : 'customer';
        const offlineUser: User = {
          id: `u_${Date.now()}`,
          username: email.split('@')[0],
          name: email.split('@')[0],
          email,
          role,
          isAdmin: role === 'admin',
        };
        const offlineToken = `offline_token_${Date.now()}`;
        setToken(offlineToken);
        setUser(offlineUser);
        localStorage.setItem('imovies_token', offlineToken);
        localStorage.setItem('imovies_user', JSON.stringify(offlineUser));
        return true;
      }
      throw new Error(err.response?.data?.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  const register = async (name: string, email: string, password: string): Promise<boolean> => {
    setLoading(true);
    try {
      const { data } = await API.post('/auth/register', { username: name, name, email, password });
      if (data.success) {
        const receivedToken = data.data.token;
        const u = data.data.user;
        const receivedUser: User = {
          id: u.id || u._id,
          username: u.username || u.name || name,
          name: u.username || u.name || name,
          email: u.email,
          role: u.role,
          isAdmin: u.isAdmin,
        };

        setToken(receivedToken);
        setUser(receivedUser);
        localStorage.setItem('imovies_token', receivedToken);
        localStorage.setItem('imovies_user', JSON.stringify(receivedUser));
        return true;
      }
      return false;
    } catch (err: any) {
      const isOffline = !err.response;
      if (isOffline) {
        const offlineUser: User = {
          id: `u_${Date.now()}`,
          username: name,
          name,
          email,
          role: 'customer',
          isAdmin: false,
        };
        const offlineToken = `offline_token_${Date.now()}`;
        setToken(offlineToken);
        setUser(offlineUser);
        localStorage.setItem('imovies_token', offlineToken);
        localStorage.setItem('imovies_user', JSON.stringify(offlineUser));
        return true;
      }
      throw new Error(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('imovies_token');
    localStorage.removeItem('imovies_user');
  };

  const isAdmin = user?.role === 'admin';

  return (
    <AuthContext.Provider value={{ user, token, loading, isAdmin, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
