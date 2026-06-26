export interface Product {
  id: string;
  code: string;
  name: string;
  mrp: number;
  sellingPrice?: number; // Discounted / selling price (optional; falls back to mrp)
  barcode: string;
  category?: string;
  createdAt: Date;
  username?: string; // Name of the user who added the product (populated for admin view)
}

export interface PrinterSettings {
  type: 'usb' | 'bluetooth';
  deviceName?: string;
  deviceId?: string;
  paperWidth: number; // in mm
  isConnected: boolean;
}

export interface PrintJob {
  id: string;
  productId: string;
  quantity: number;
  timestamp: Date;
  status: 'pending' | 'printing' | 'completed' | 'failed';
}
