import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import { api } from './api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, pass: string) => Promise<void>;
  signup: (email: string, pass: string, name: string) => Promise<void>;
  logout: () => void;
  demoLogin: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('fintrack_token'));
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function loadUser() {
      if (token) {
        try {
          const u = await api.getMe();
          setUser(u);
        } catch (err) {
          console.error('Session expired', err);
          logout();
        }
      }
      setLoading(false);
    }
    loadUser();
  }, [token]);

  const login = async (email: string, pass: string) => {
    const res = await api.login({ email, password: pass });
    localStorage.setItem('fintrack_token', res.access_token);
    setToken(res.access_token);
    setUser(res.user);
  };

  const signup = async (email: string, pass: string, name: string) => {
    const res = await api.signup({ email, password: pass, full_name: name });
    localStorage.setItem('fintrack_token', res.access_token);
    setToken(res.access_token);
    setUser(res.user);
  };

  const demoLogin = async () => {
    await login('demo@fintrack.ai', 'Demo@123456');
  };

  const logout = () => {
    localStorage.removeItem('fintrack_token');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, signup, logout, demoLogin }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
