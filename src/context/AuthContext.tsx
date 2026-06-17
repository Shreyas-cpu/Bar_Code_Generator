import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../services/supabase';

export interface User {
  id: string;
  username: string;
  isAdmin: boolean;
  shopName?: string;
}

interface AuthContextValue {
  user: User | null;
  isAllowed: boolean;
  isAuthLoading: boolean;
  login: (username: string, password: string) => Promise<{ error?: string }>;
  logout: () => Promise<void>;
  updateShopName: (name: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in via localStorage
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setIsAuthLoading(false);
  }, []);

  const login = async (username: string, password: string): Promise<{ error?: string }> => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('username', username)
        .eq('password', password)
        .single();

      if (error || !data) {
        return { error: 'Invalid User ID or Password' };
      }

      const loggedInUser: User = {
        id: data.id,
        username: data.username,
        isAdmin: data.isAdmin,
        shopName: data.shopName
      };

      setUser(loggedInUser);
      localStorage.setItem('user', JSON.stringify(loggedInUser));
      return {};
    } catch (err: any) {
      return { error: 'Login failed. Could not connect to Supabase.' };
    }
  };

  const logout = async () => {
    setUser(null);
    localStorage.removeItem('user');
    // Clear global store so next user doesn't see cached data
    const { useStore } = await import('../store/productStore');
    useStore.getState().reset();
  };

  const updateShopName = async (name: string) => {
    if (!user) return;
    try {
      await supabase
        .from('users')
        .update({ shopName: name })
        .eq('id', user.id);

      const updatedUser = { ...user, shopName: name };
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
    } catch (e) {
      console.error('Failed to update shop name', e);
    }
  };

  return (
    <AuthContext.Provider value={{ user, isAllowed: true, isAuthLoading, login, logout, updateShopName }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextValue => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
};
