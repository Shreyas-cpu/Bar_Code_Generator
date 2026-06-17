import { create } from 'zustand';
import { Product, PrinterSettings } from '../types';
import { supabase } from '../services/supabase';

interface AppStore {
  products: Product[];
  selectedProduct: Product | null;
  printerSettings: PrinterSettings;
  isLoaded: boolean;
  
  // App Initialization
  init: () => Promise<void>;
  reset: () => void;

  // Product actions
  addProduct: (product: Omit<Product, 'id' | 'barcode'> & { createdAt?: any }) => Promise<void>;
  updateProduct: (id: string, product: Partial<Product>) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  selectProduct: (product: Product | null) => void;
  getProducts: () => Product[];
  
  // Printer actions
  setPrinterSettings: (settings: Partial<PrinterSettings>) => Promise<void>;
  getPrinterSettings: () => PrinterSettings;
}

// Removing API_URL


const defaultPrinterSettings: PrinterSettings = {
  type: 'usb',
  paperWidth: 80,
  isConnected: false
};

// ── localStorage helpers (used as fallback when backend is unavailable) ──────
const getUserId = () => {
  const userStr = localStorage.getItem('user');
  return userStr ? JSON.parse(userStr).id : 'default';
};

const LS = {
  getProducts: (): Product[] => {
    try { return JSON.parse(localStorage.getItem(`products_${getUserId()}`) || '[]'); } catch { return []; }
  },
  saveProducts: (p: Product[]) => localStorage.setItem(`products_${getUserId()}`, JSON.stringify(p)),
  getPrinterSettings: (): PrinterSettings => {
    try { return JSON.parse(localStorage.getItem('printerSettings') || 'null') || defaultPrinterSettings; } catch { return defaultPrinterSettings; }
  },
  savePrinterSettings: (s: PrinterSettings) => localStorage.setItem('printerSettings', JSON.stringify(s)),
};

// Supabase helper to get current userId
const getUserIdFromAuth = () => {
  const userStr = localStorage.getItem('user');
  return userStr ? JSON.parse(userStr).id : null;
};

export const useStore = create<AppStore>((set, get) => ({
  products: [],
  selectedProduct: null,
  printerSettings: defaultPrinterSettings,
  isLoaded: false,
  
  init: async () => {
    set({ isLoaded: false });
    const userId = getUserIdFromAuth();
    if (!userId) return;

    try {
      const [productsRes, settingsRes] = await Promise.all([
        supabase.from('products').select('*').eq('userId', userId),
        supabase.from('settings').select('*')
      ]);

      if (productsRes.error) throw productsRes.error;

      // Parse settings
      const settingsMap: Record<string, any> = {};
      if (settingsRes.data) {
        settingsRes.data.forEach((r: any) => {
          try { settingsMap[r.key] = JSON.parse(r.value); } 
          catch { settingsMap[r.key] = r.value; }
        });
      }

      set({
        products: productsRes.data as any[] || [],
        printerSettings: settingsMap.printerSettings || defaultPrinterSettings,
        isLoaded: true
      });
    } catch (e) {
      console.error('Supabase fetch failed, falling back to local storage', e);
      set({
        products: LS.getProducts(),
        printerSettings: LS.getPrinterSettings(),
        isLoaded: true
      });
    }
  },

  reset: () => {
    set({ products: [], selectedProduct: null, isLoaded: false });
  },

  addProduct: async (product) => {
    const id = Date.now().toString();
    const newProduct: Product = {
      ...product,
      id,
      barcode: id,
      createdAt: product.createdAt ? new Date(product.createdAt).toISOString() as any : new Date().toISOString() as any,
    };
    const products = [...get().products, newProduct];
    set({ products });
    LS.saveProducts(products);
    
    const userId = getUserIdFromAuth();
    if (userId) {
      await supabase.from('products').insert([{
        ...newProduct,
        userId
      }]);
    }
  },

  updateProduct: async (id, updates) => {
    const products = get().products.map(p => p.id === id ? { ...p, ...updates } : p);
    set({ products });
    LS.saveProducts(products);
    
    const userId = getUserIdFromAuth();
    if (userId) {
      await supabase.from('products').update(updates).eq('id', id).eq('userId', userId);
    }
  },

  deleteProduct: async (id) => {
    const products = get().products.filter(p => p.id !== id);
    set({ products });
    LS.saveProducts(products);
    
    const userId = getUserIdFromAuth();
    if (userId) {
      await supabase.from('products').delete().eq('id', id).eq('userId', userId);
    }
  },

  selectProduct: (product) => {
    set({ selectedProduct: product });
  },

  getProducts: () => get().products,

  setPrinterSettings: async (settings) => {
    const printerSettings = { ...get().printerSettings, ...settings };
    set({ printerSettings });
    LS.savePrinterSettings(printerSettings);
    
    await supabase.from('settings').upsert({ 
      key: 'printerSettings', 
      value: JSON.stringify(printerSettings) 
    });
  },

  getPrinterSettings: () => get().printerSettings,
}));

