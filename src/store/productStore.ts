import { create } from 'zustand';
import { Product, PrinterSettings } from '../types';

interface AppStore {
  products: Product[];
  selectedProduct: Product | null;
  printerSettings: PrinterSettings;
  
  // Product actions
  addProduct: (product: Omit<Product, 'id' | 'createdAt'>) => void;
  updateProduct: (id: string, product: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  selectProduct: (product: Product | null) => void;
  getProducts: () => Product[];
  
  // Printer actions
  setPrinterSettings: (settings: Partial<PrinterSettings>) => void;
  getPrinterSettings: () => PrinterSettings;
}

export const useStore = create<AppStore>((set, get) => ({
  products: JSON.parse(localStorage.getItem('products') || '[]'),
  selectedProduct: null,
  printerSettings: JSON.parse(localStorage.getItem('printerSettings') || '{"type":"usb","paperWidth":80,"isConnected":false}'),
  
  addProduct: (product) => {
    const newProduct: Product = {
      ...product,
      id: Date.now().toString(),
      createdAt: new Date(),
    };
    
    const products = [...get().products, newProduct];
    set({ products });
    localStorage.setItem('products', JSON.stringify(products));
  },
  
  updateProduct: (id, updates) => {
    const products = get().products.map(p =>
      p.id === id ? { ...p, ...updates } : p
    );
    set({ products });
    localStorage.setItem('products', JSON.stringify(products));
  },
  
  deleteProduct: (id) => {
    const products = get().products.filter(p => p.id !== id);
    set({ products });
    localStorage.setItem('products', JSON.stringify(products));
  },
  
  selectProduct: (product) => {
    set({ selectedProduct: product });
  },
  
  getProducts: () => get().products,
  
  setPrinterSettings: (settings) => {
    const printerSettings = { ...get().printerSettings, ...settings };
    set({ printerSettings });
    localStorage.setItem('printerSettings', JSON.stringify(printerSettings));
  },
  
  getPrinterSettings: () => get().printerSettings,
}));
