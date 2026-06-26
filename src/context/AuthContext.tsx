import { createContext, useContext, useEffect, useState } from 'react';

export interface User {
  id: string;
  username: string;
  isAdmin: boolean;
}

interface AuthContextValue {
  user: User | null;
  isAuthLoading: boolean;
  login: (username: string, password: string) => Promise<{ error?: string }>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);

  useEffect(() => {
    // Check local storage for persistent session
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setIsAuthLoading(false);
  }, []);

  const login = async (username: string, password: string): Promise<{ error?: string }> => {
    try {
      const res = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      
      const data = await res.json();
      if (!res.ok) {
        return { error: data.error || 'Invalid User ID or Password' };
      }

      setUser(data.user);
      localStorage.setItem('user', JSON.stringify(data.user));
      return {};
    } catch (err: any) {
      return { error: 'Failed to connect to local server. Make sure it is running.' };
    }
  };

  const logout = async () => {
    setUser(null);
    localStorage.removeItem('user');
    // Clear global store so next user doesn't see cached data
    const { useStore } = await import('../store/productStore');
    useStore.getState().reset();
  };

  return (
    <AuthContext.Provider value={{ user, isAuthLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextValue => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
};
