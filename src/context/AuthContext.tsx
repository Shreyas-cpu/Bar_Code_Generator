import { createContext, useContext, useEffect, useState } from 'react';
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  User,
} from 'firebase/auth';
import { auth, isEmailAllowed } from '../services/firebase';

interface AuthContextValue {
  user: User | null;
  isAllowed: boolean;
  isAuthLoading: boolean;
  login: (email: string, password: string) => Promise<{ error?: string }>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAllowed, setIsAllowed] = useState(false);
  const [isAuthLoading, setIsAuthLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setIsAllowed(isEmailAllowed(firebaseUser?.email));
      setIsAuthLoading(false);
    });
    return unsub;
  }, []);

  const login = async (email: string, password: string): Promise<{ error?: string }> => {
    try {
      const cred = await signInWithEmailAndPassword(auth, email, password);
      if (!isEmailAllowed(cred.user.email)) {
        // Authenticated but not on the allowlist — sign them out immediately
        await signOut(auth);
        return { error: 'Access denied. This account is not authorized to use this application.' };
      }
      return {};
    } catch (err: any) {
      const code: string = err?.code || '';
      if (code === 'auth/user-not-found' || code === 'auth/wrong-password' || code === 'auth/invalid-credential') {
        return { error: 'Invalid email or password.' };
      }
      if (code === 'auth/too-many-requests') {
        return { error: 'Too many failed attempts. Please try again later.' };
      }
      if (code === 'auth/invalid-email') {
        return { error: 'Please enter a valid email address.' };
      }
      return { error: 'Login failed. Please check your credentials.' };
    }
  };

  const logout = async () => {
    await signOut(auth);
  };

  return (
    <AuthContext.Provider value={{ user, isAllowed, isAuthLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextValue => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
};
