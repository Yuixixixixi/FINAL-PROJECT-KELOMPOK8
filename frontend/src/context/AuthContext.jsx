import { createContext, useEffect, useState, useCallback } from 'react';
import api from '../utils/api';

export const AuthContext = createContext(null);

const TOKEN_KEY = 'ppdb_admin_token';
const PROFILE_KEY = 'ppdb_admin_profile';

export function AuthProvider({ children }) {
  const [admin, setAdmin] = useState(() => {
    const raw = localStorage.getItem(PROFILE_KEY);
    return raw ? JSON.parse(raw) : null;
  });
  const [loading, setLoading] = useState(false);

  const login = useCallback(async (username, password) => {
    setLoading(true);
    try {
      const res = await api.post('/admin/login', { username, password });
      const { token, admin: adminData } = res.data.data;
      localStorage.setItem(TOKEN_KEY, token);
      localStorage.setItem(PROFILE_KEY, JSON.stringify(adminData));
      setAdmin(adminData);
      return { success: true };
    } catch (err) {
      return {
        success: false,
        message: err?.response?.data?.message || 'Login gagal, periksa kembali koneksi Anda',
      };
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(PROFILE_KEY);
    setAdmin(null);
  }, []);

  useEffect(() => {
    // Sinkronkan antar-tab jika logout terjadi di tab lain
    function onStorage(e) {
      if (e.key === TOKEN_KEY && !e.newValue) setAdmin(null);
    }
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  return (
    <AuthContext.Provider
      value={{ admin, isAuthenticated: !!admin, loading, login, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}
