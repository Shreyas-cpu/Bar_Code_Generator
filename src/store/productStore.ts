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

// ── localStorage helpers (used as fallback when backend is unavailable) ──────
const LS = {
  getProducts: (): Product[] => {
    try { return JSON.parse(localStorage.getItem('products') || '[]'); } catch { return []; }
  },
  saveProducts: (p: Product[]) => localStorage.setItem('products', JSON.stringify(p)),
  getPrinterSettings: (): PrinterSettings => {
    try { return JSON.parse(localStorage.getItem('printerSettings') || 'null') || defaultPrinterSettings; } catch { return defaultPrinterSettings; }
  },
  savePrinterSettings: (s: PrinterSettings) => localStorage.setItem('printerSettings', JSON.stringify(s)),
  getShopName: (): string => localStorage.getItem('shopName') || '',
  saveShopName: (n: string) => localStorage.setItem('shopName', n),
};

let useBackend = true; // Will be set to false if first request fails

async function tryFetch(input: RequestInfo, init?: RequestInit): Promise<Response | null> {
  if (!useBackend) return null;
  try {
    const res = await fetch(input as any, init);
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
  shopName: '',
  isLoaded: false,
  
  init: async () => {
    // Try backend first; fall back to localStorage silently
    const res = await tryFetch(`${API_URL}/products`);
    if (res && res.ok) {
      const [products, settingsRes] = await Promise.all([
        res.json(),
        tryFetch(`${API_URL}/settings`).then(r => r?.json().catch(() => ({})) ?? {})
      ]);
      set({
        products,
        printerSettings: (settingsRes as any).printerSettings || defaultPrinterSettings,
        shopName: (settingsRes as any).shopName || '',
        isLoaded: true
      });
    } else {
      // Backend unavailable — use localStorage
      set({
        products: LS.getProducts(),
        printerSettings: LS.getPrinterSettings(),
        shopName: LS.getShopName(),
        isLoaded: true
      });
    }
  },


  addProduct: async (product) => {
    const id = Date.now().toString();
    const newProduct: Product = {
      ...product,
      id,
      barcode: id,
      createdAt: new Date().toISOString() as any,
    };
    const products = [...get().products, newProduct];
    set({ products });
    LS.saveProducts(products); // always mirror to localStorage
    await tryFetch(`${API_URL}/products`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newProduct)
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

  getProducts: () => get().products,

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

  setShopName: async (name: string) => {
    set({ shopName: name });
    LS.saveShopName(name);
    await tryFetch(`${API_URL}/settings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ key: 'shopName', value: name })
    });
  },
}));

