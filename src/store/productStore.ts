import { create } from 'zustand';
import { Product, PrinterSettings } from '../types';

interface AppStore {
  products: Product[];
  selectedProduct: Product | null;
  printerSettings: PrinterSettings;
  shopName: string;
  isLoaded: boolean;
  
  // App Initialization
  init: () => Promise<void>;

  // Product actions
  addProduct: (product: Omit<Product, 'id' | 'createdAt' | 'barcode'>) => Promise<void>;
  updateProduct: (id: string, product: Partial<Product>) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  selectProduct: (product: Product | null) => void;
  getProducts: () => Product[];
  
  // Printer actions
  setPrinterSettings: (settings: Partial<PrinterSettings>) => Promise<void>;
  getPrinterSettings: () => PrinterSettings;

  // Shop name
  setShopName: (name: string) => Promise<void>;
}

const API_URL = 'http://localhost:3001/api';

const defaultPrinterSettings: PrinterSettings = {
  type: 'usb',
  paperWidth: 80,
  isConnected: false
};

export const useStore = create<AppStore>((set, get) => ({
  products: [],
  selectedProduct: null,
  printerSettings: defaultPrinterSettings,
  shopName: '',
  isLoaded: false,
  
  init: async () => {
    try {
      const [productsRes, settingsRes] = await Promise.all([
        fetch(`${API_URL}/products`),
        fetch(`${API_URL}/settings`)
      ]);
      const products = await productsRes.json();
      const settings = await settingsRes.json();
      
      set({
        products,
        printerSettings: settings.printerSettings || defaultPrinterSettings,
        shopName: settings.shopName || '',
        isLoaded: true
      });
    } catch (error) {
      console.error('Failed to load data from backend:', error);
      // Fallback to defaults if backend fails
      set({ isLoaded: true });
    }
  },

  addProduct: async (product) => {
    const id = Date.now().toString();
    const newProduct: Product = {
      ...product,
      id,
      barcode: id,
      createdAt: new Date().toISOString() as any, // backend expects string
    };
    
    // Optimistic UI update
    const products = [...get().products, newProduct];
    set({ products });
    
    try {
      await fetch(`${API_URL}/products`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newProduct)
      });
    } catch (error) {
      console.error('Failed to save product:', error);
      // Rollback would go here in a real app
    }
  },
  
  updateProduct: async (id, updates) => {
    // Optimistic UI update
    const products = get().products.map(p =>
      p.id === id ? { ...p, ...updates } : p
    );
    set({ products });
    
    try {
      await fetch(`${API_URL}/products/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
    } catch (error) {
      console.error('Failed to update product:', error);
    }
  },
  
  deleteProduct: async (id) => {
    // Optimistic UI update
    const products = get().products.filter(p => p.id !== id);
    set({ products });
    
    try {
      await fetch(`${API_URL}/products/${id}`, {
        method: 'DELETE'
      });
    } catch (error) {
      console.error('Failed to delete product:', error);
    }
  },
  
  selectProduct: (product) => {
    set({ selectedProduct: product });
  },
  
  getProducts: () => get().products,
  
  setPrinterSettings: async (settings) => {
    const printerSettings = { ...get().printerSettings, ...settings };
    set({ printerSettings });
    
    try {
      await fetch(`${API_URL}/settings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: 'printerSettings', value: printerSettings })
      });
    } catch (error) {
      console.error('Failed to save printer settings:', error);
    }
  },
  
  getPrinterSettings: () => get().printerSettings,

  setShopName: async (name: string) => {
    set({ shopName: name });
    
    try {
      await fetch(`${API_URL}/settings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: 'shopName', value: name })
      });
    } catch (error) {
      console.error('Failed to save shop name:', error);
    }
  },
}));
