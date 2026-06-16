import { createContext, useContext, useState, useCallback } from 'react';

const AuthContext = createContext(null);

const USERS = {
  'admin@enalia.com': { role: 'admin', name: 'Admin', email: 'admin@enalia.com' },
  'cliente@implantologie.com': { role: 'cliente', name: 'Cliente', email: 'cliente@implantologie.com' },
};

const STORAGE_KEY = 'enalia.auth';

function readStored() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(readStored);

  const login = useCallback((email, password) => {
    const key = String(email || '').trim().toLowerCase();
    if (!password || !password.trim()) {
      return { ok: false, error: 'Introduce una contraseña' };
    }
    const match = USERS[key];
    if (!match) {
      return { ok: false, error: 'Credenciales incorrectas' };
    }
    setUser(match);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(match));
    } catch {
      /* ignore */
    }
    return { ok: true };
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      /* ignore */
    }
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, logout, isAdmin: user?.role === 'admin' }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
