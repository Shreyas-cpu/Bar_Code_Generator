import { create } from 'zustand';
import { Product } from '../types';

interface PrinterSettings {
  type: 'usb' | 'bluetooth';
  paperWidth: '58' | '80' | '100';
  bluetoothDeviceName?: string;
  usbVendorId?: string;
}

interface AppStore {
  products: Product[];
  selectedProduct: Product | null;
  printerSettings: PrinterSettings;
  isLoaded: boolean;
  init: () => Promise<void>;
  reset: () => void;
  addProduct: (product: Omit<Product, 'id' | 'barcode'> & { createdAt?: any }) => Promise<void>;
  updateProduct: (id: string, product: Partial<Product>) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  selectProduct: (product: Product | null) => void;
  setPrinterSettings: (settings: Partial<PrinterSettings>) => Promise<void>;
  getPrinterSettings: () => PrinterSettings;
}

const API_URL = 'http://localhost:3001/api';

const defaultPrinterSettings: PrinterSettings = {
  type: 'usb',
  paperWidth: '80',
};

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

let useBackend = true; // Will be set to false if first request fails

async function tryFetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response | null> {
  if (!useBackend) return null;
  try {
    const res = await fetch(input as string, init);
    return res;
  } catch {
    useBackend = false;
    return null;
  }
}

export const useStore = create<AppStore>((set, get) => ({
  products: [],
  selectedProduct: null,
  printerSettings: defaultPrinterSettings,
  isLoaded: false,
  
  init: async () => {
    set({ isLoaded: false });
    const userId = getUserId();

    const res = await tryFetch(`${API_URL}/products?userId=${userId}`);
    if (res && res.ok) {
      const [products, settingsRes] = await Promise.all([
        res.json(),
        tryFetch(`${API_URL}/settings`).then(r => r?.json().catch(() => ({})) ?? {})
      ]);
      set({
        products: products || [],
        printerSettings: (settingsRes as any).printerSettings || defaultPrinterSettings,
        isLoaded: true
      });
    } else {
      console.warn('Local API unavailable — using localStorage fallback');
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
    const newProduct = {
      ...product,
      id,
      barcode: id,
      createdAt: product.createdAt ? new Date(product.createdAt).toISOString() as any : new Date().toISOString() as any,
    };
    const products = [...get().products, newProduct];
    set({ products });
    LS.saveProducts(products);
    
    const userId = getUserId();
    await tryFetch(`${API_URL}/products`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...newProduct, userId })
    });
  },

  updateProduct: async (id, updates) => {
    const products = get().products.map(p => p.id === id ? { ...p, ...updates } : p);
    set({ products });
    LS.saveProducts(products);
    
    await tryFetch(`${API_URL}/products/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates)
    });
  },

  deleteProduct: async (id) => {
    const products = get().products.filter(p => p.id !== id);
    set({ products });
    LS.saveProducts(products);
    
    await tryFetch(`${API_URL}/products/${id}`, { method: 'DELETE' });
  },

  selectProduct: (product) => {
    set({ selectedProduct: product });
  },

  setPrinterSettings: async (settings) => {
    const printerSettings = { ...get().printerSettings, ...settings };
    set({ printerSettings });
    LS.savePrinterSettings(printerSettings);
    
    await tryFetch(`${API_URL}/settings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ key: 'printerSettings', value: printerSettings })
    });
  },

  getPrinterSettings: () => get().printerSettings,
}));
